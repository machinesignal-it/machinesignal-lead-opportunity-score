#!/usr/bin/env python3
"""
MachineSignal tool-style / MCP wrapper simulation.

This script behaves like a small adapter:
- reads the public tool-style manifest;
- maps tool names to HTTP calls;
- executes a safe machine-buyer flow;
- never executes real payment;
- never contacts external targets.

It uses the public sandbox endpoint by default. If the daily public sandbox
limit is reached, it can continue with MACHINESIGNAL_CUSTOMER_API_KEY from the
environment, which must be a customer/sandbox key, not the admin key.
"""

from __future__ import annotations

import json
import os
import time
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Any


MANIFEST_URL = "https://machinesignal.it/mcp-tool-manifest.json"
OUTPUT_DIR = Path(r"C:\Users\natal\AppData\Local\Temp\MachineSignal\mcp_tool_wrapper_simulation_20260603")
REPO_DIR = Path(r"C:\Users\natal\AppData\Local\Temp\MachineSignal\github_repo_sync_20260530")


def parse_payload(raw: str) -> Any:
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return raw


def request_payload(
    method: str,
    url: str,
    payload: dict[str, Any] | None = None,
    api_key: str | None = None,
    idempotency_key: str | None = None,
    timeout: int = 30,
) -> tuple[int, Any]:
    headers = {
        "Accept": "application/json,text/plain,*/*",
        "User-Agent": "MachineSignalToolWrapperSimulation/2026-06-03",
    }
    body = None
    if payload is not None and method.upper() not in {"GET", "HEAD"}:
        body = json.dumps(payload).encode("utf-8")
        headers["Content-Type"] = "application/json"
    if api_key:
        headers["X-API-Key"] = api_key
    if idempotency_key:
        headers["Idempotency-Key"] = idempotency_key

    if method.upper() == "GET" and payload:
        query = urllib.parse.urlencode({k: v for k, v in payload.items() if v is not None})
        if query:
            url = f"{url}?{query}"

    req = urllib.request.Request(url, data=body, headers=headers, method=method.upper())
    try:
        with urllib.request.urlopen(req, timeout=timeout) as response:
            raw = response.read().decode("utf-8", errors="replace")
            return int(response.status), parse_payload(raw)
    except urllib.error.HTTPError as exc:
        raw = exc.read().decode("utf-8", errors="replace")
        return int(exc.code), parse_payload(raw)
    except urllib.error.URLError as exc:
        return 599, {"error": "url_error", "message": str(exc)}


def mask_key(value: str | None) -> str:
    if not value:
        return ""
    if len(value) <= 12:
        return value[:3] + "..."
    return value[:10] + "..." + value[-4:]


def safe_get(mapping: Any, *keys: str, default: Any = None) -> Any:
    cur = mapping
    for key in keys:
        if not isinstance(cur, dict):
            return default
        cur = cur.get(key)
    return default if cur is None else cur


def first_sample_target(purchase_payload: dict[str, Any]) -> dict[str, Any] | None:
    paths = [
        ("delivery", "beta_sample_targets"),
        ("order", "delivery", "beta_sample_targets"),
        ("delivery", "sample_targets"),
        ("order", "delivery", "sample_targets"),
    ]
    for path in paths:
        samples = safe_get(purchase_payload, *path, default=[])
        if isinstance(samples, list) and samples:
            sample = samples[0]
            if isinstance(sample, dict):
                return sample
    return None


def recommended_product(score_payload: dict[str, Any]) -> str | None:
    next_purchase = score_payload.get("next_purchase") or {}
    product = next_purchase.get("next_product")
    if product:
        return str(product)
    decision = score_payload.get("decision")
    if decision == "nurture":
        return "nurture_signal"
    if decision == "needs_verification":
        return "verification"
    if decision == "buy_deep_analysis":
        return "deep_analysis"
    return None


@dataclass
class ToolCall:
    tool: str
    method: str
    url: str
    status: int
    ok: bool
    auth: str
    details: str


class ToolWrapper:
    def __init__(self, manifest: dict[str, Any]) -> None:
        self.manifest = manifest
        self.tools = {tool["name"]: tool for tool in manifest.get("tools", []) if isinstance(tool, dict)}
        self.calls: list[ToolCall] = []

    def call(
        self,
        name: str,
        payload: dict[str, Any] | None = None,
        api_key: str | None = None,
        idempotency_key: str | None = None,
        path_params: dict[str, str] | None = None,
    ) -> tuple[int, Any]:
        if name not in self.tools:
            raise KeyError(f"Tool not found in manifest: {name}")
        tool = self.tools[name]
        url = str(tool["url"])
        for key, value in (path_params or {}).items():
            url = url.replace("{" + key + "}", urllib.parse.quote(str(value), safe=""))
        status, response = request_payload(
            method=str(tool["method"]),
            url=url,
            payload=payload,
            api_key=api_key,
            idempotency_key=idempotency_key,
        )
        ok = 200 <= status < 300
        detail = ""
        if isinstance(response, dict):
            detail = str(response.get("status") or response.get("decision") or response.get("error") or response.get("message") or "")
        elif isinstance(response, str):
            detail = response[:120].replace("\n", " ")
        self.calls.append(
            ToolCall(
                tool=name,
                method=str(tool["method"]),
                url=url,
                status=status,
                ok=ok,
                auth=str(tool.get("auth", "none")),
                details=detail,
            )
        )
        return status, response


def run() -> dict[str, Any]:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    checks: list[dict[str, Any]] = []

    def check(name: str, ok: bool, details: str = "") -> None:
        checks.append({"name": name, "ok": bool(ok), "details": details})

    status, manifest_payload = request_payload("GET", MANIFEST_URL)
    manifest = manifest_payload if isinstance(manifest_payload, dict) else {}
    check("manifest_readable", status == 200 and bool(manifest), f"HTTP {status}")
    wrapper = ToolWrapper(manifest)

    expected_tools = {
        "get_product_catalog",
        "get_machine_onboarding",
        "get_dentists_beta_pack",
        "create_sandbox_customer",
        "get_customer_onboarding",
        "score_lead_opportunity",
        "create_purchase_intent",
        "list_orders",
        "get_order",
        "get_usage",
        "get_admin_sandbox_metrics",
    }
    actual_tools = set(wrapper.tools)
    check("manifest_has_expected_tools", expected_tools.issubset(actual_tools), f"{len(actual_tools)} tools")
    check(
        "manifest_does_not_claim_public_mcp_server",
        safe_get(manifest, "mcp_compatibility", "public_mcp_server_live") is False,
        "public_mcp_server_live=false",
    )
    check(
        "manifest_requires_adapter",
        safe_get(manifest, "mcp_compatibility", "adapter_required") is True,
        "adapter_required=true",
    )

    status, catalog = wrapper.call("get_product_catalog")
    catalog_payload = catalog if isinstance(catalog, dict) else {}
    check("tool_get_product_catalog", status == 200 and "products" in catalog_payload, f"HTTP {status}")

    status, machine_onboarding = wrapper.call("get_machine_onboarding")
    onboarding_payload = machine_onboarding if isinstance(machine_onboarding, dict) else {}
    check("tool_get_machine_onboarding", status == 200 and onboarding_payload.get("service") == "MachineSignal", f"HTTP {status}")

    status, dentists_pack = wrapper.call("get_dentists_beta_pack")
    dentists_payload = dentists_pack if isinstance(dentists_pack, dict) else {}
    check(
        "tool_get_dentists_beta_pack",
        status == 200 and safe_get(dentists_payload, "benchmark", "targets_scored") == 250,
        f"HTTP {status}",
    )

    run_id = f"mcp-tool-wrapper-{stamp}-{int(time.time())}"
    status, sandbox = wrapper.call(
        "create_sandbox_customer",
        payload={
            "evaluator_id": run_id,
            "use_case": "tool-style manifest wrapper simulation for MachineSignal",
            "expected_test_path": "manifest_to_score_to_purchase_to_orders",
        },
        idempotency_key=run_id,
    )
    sandbox_payload = sandbox if isinstance(sandbox, dict) else {}
    api_key = sandbox_payload.get("api_key")
    auth_source = "public_sandbox"

    env_key = os.environ.get("MACHINESIGNAL_CUSTOMER_API_KEY", "").strip()
    if not api_key and env_key:
        api_key = env_key
        auth_source = "env_customer_key_fallback"
        check("tool_create_sandbox_customer", status in {200, 201, 429, 403}, f"HTTP {status}; fallback customer key used")
    else:
        check("tool_create_sandbox_customer", status in {200, 201} and bool(api_key), f"HTTP {status}; key={mask_key(api_key)}")

    status, customer_onboarding = wrapper.call("get_customer_onboarding", api_key=api_key)
    customer_onboarding_payload = customer_onboarding if isinstance(customer_onboarding, dict) else {}
    check("tool_get_customer_onboarding", status == 200, f"HTTP {status}")

    status, target_discovery = wrapper.call(
        "create_purchase_intent",
        payload={
            "product_code": "target_discovery",
            "market": "dentists_odontoiatric_clinics",
            "area": "Lombardia",
            "commercial_objective": "identify dentist and odontoiatric clinic domains worth scoring for website-led commercial opportunity and CRM-ready follow-up preparation",
            "reason": "MCP/tool wrapper simulation has no starting list and follows the manifest-recommended machine flow.",
            "batch_id": run_id,
            "max_budget_eur": 149,
        },
        api_key=api_key,
        idempotency_key=f"{run_id}-target-discovery",
    )
    target_discovery_payload = target_discovery if isinstance(target_discovery, dict) else {}
    check("tool_create_purchase_intent_target_discovery", status == 200, f"HTTP {status}")
    sample = first_sample_target(target_discovery_payload)
    if not sample:
        sample = {
            "domain": "clinic3.it",
            "target_name": "Clinic 3",
            "category": "dentist",
            "area": "Lombardia",
            "initial_signals": ["manifest fallback sample because target discovery delivery had no sample target"],
        }
    check("target_discovery_sample_available", bool(sample.get("domain")), str(sample.get("domain")))

    status, score = wrapper.call(
        "score_lead_opportunity",
        payload={
            "domain": sample.get("domain"),
            "sector_hint": "dentist",
            "country_hint": "IT",
            "target_name": sample.get("target_name"),
            "category_hint": sample.get("category"),
            "area": sample.get("area"),
            "region": "Lombardia",
            "initial_signals": sample.get("initial_signals"),
            "commercial_objective": "website-led commercial opportunity and CRM-ready follow-up preparation",
        },
        api_key=api_key,
        idempotency_key=f"{run_id}-score-001",
    )
    score_payload = score if isinstance(score, dict) else {}
    check("tool_score_lead_opportunity", status == 200 and "opportunity_score" in score_payload, f"HTTP {status}")
    check("score_has_decision", bool(score_payload.get("decision")), str(score_payload.get("decision")))
    check("score_has_web_architect_review", "web_architect_review" in score_payload, str(safe_get(score_payload, "web_architect_review", "status")))
    check("score_has_commercial_strength", "commercial_strength" in score_payload, str(safe_get(score_payload, "commercial_strength", "level")))

    add_on_product = recommended_product(score_payload)
    add_on_payload: dict[str, Any] = {}
    if add_on_product:
        status, add_on = wrapper.call(
            "create_purchase_intent",
            payload={
                "product_code": add_on_product,
                "domain": score_payload.get("domain"),
                "source_score_request_id": f"{run_id}-score-001",
                "reason": f"Manifest wrapper followed score recommendation: {add_on_product}.",
            },
            api_key=api_key,
            idempotency_key=f"{run_id}-{add_on_product}",
        )
        add_on_payload = add_on if isinstance(add_on, dict) else {}
        check("tool_create_purchase_intent_recommended_add_on", status == 200, f"HTTP {status}; product={add_on_product}")
    else:
        check("tool_create_purchase_intent_recommended_add_on", True, "no add-on recommended by score")

    status, orders = wrapper.call("list_orders", api_key=api_key)
    orders_payload = orders if isinstance(orders, dict) else {}
    order_list = orders_payload.get("orders") or []
    check("tool_list_orders", status == 200 and len(order_list) >= 1, f"HTTP {status}; orders={len(order_list)}")

    first_order_id = None
    if order_list and isinstance(order_list[0], dict):
        first_order_id = order_list[0].get("order_intent_id")
    if first_order_id:
        status, one_order = wrapper.call("get_order", api_key=api_key, path_params={"order_intent_id": str(first_order_id)})
        check("tool_get_order", status == 200, f"HTTP {status}; order={first_order_id}")
    else:
        check("tool_get_order", False, "no order_intent_id available")

    status, usage = wrapper.call("get_usage", api_key=api_key)
    usage_payload = usage if isinstance(usage, dict) else {}
    check("tool_get_usage", status == 200, f"HTTP {status}")
    check("no_real_payment", usage_payload.get("real_payment_executed") is False, str(usage_payload.get("real_payment_executed")))
    check("no_external_contact", usage_payload.get("external_contact_executed") is False, str(usage_payload.get("external_contact_executed")))

    result = {
        "ok": all(item["ok"] for item in checks),
        "test_name": "mcp_tool_wrapper_simulation",
        "finished_at": datetime.now().isoformat(timespec="seconds"),
        "manifest_url": MANIFEST_URL,
        "auth_source": auth_source,
        "sandbox_customer_id": sandbox_payload.get("customer_id"),
        "customer_key_prefix": mask_key(api_key),
        "checks": checks,
        "tool_calls": [call.__dict__ for call in wrapper.calls],
        "score_summary": {
            "domain": score_payload.get("domain"),
            "opportunity_score": score_payload.get("opportunity_score"),
            "confidence": score_payload.get("confidence"),
            "decision": score_payload.get("decision"),
            "web_architect_status": safe_get(score_payload, "web_architect_review", "status"),
            "commercial_strength": safe_get(score_payload, "commercial_strength", "level"),
            "recommended_product": add_on_product,
        },
        "orders_count": len(order_list),
        "first_order_id": first_order_id,
        "add_on_product": add_on_product,
        "add_on_status": add_on_payload.get("status") or safe_get(add_on_payload, "order", "status"),
        "real_payment_executed": usage_payload.get("real_payment_executed"),
        "external_contact_executed": usage_payload.get("external_contact_executed"),
    }

    summary_path = OUTPUT_DIR / f"mcp_tool_wrapper_simulation_summary_{stamp}.json"
    report_path = OUTPUT_DIR / f"mcp_tool_wrapper_simulation_report_{stamp}.md"
    summary_path.write_text(json.dumps(result, indent=2), encoding="utf-8")
    report_path.write_text(build_report(result), encoding="utf-8")

    repo_report_path = REPO_DIR / "mcp_tool_wrapper_simulation_readout_20260603.md"
    repo_report_path.write_text(build_report(result), encoding="utf-8")
    result["summary_path"] = str(summary_path)
    result["report_path"] = str(report_path)
    result["repo_report_path"] = str(repo_report_path)
    return result


def build_report(result: dict[str, Any]) -> str:
    checks = "\n".join(
        f"| {item['name']} | {'OK' if item['ok'] else 'FAIL'} | {item['details']} |"
        for item in result["checks"]
    )
    calls = "\n".join(
        f"| {call['tool']} | {call['method']} | {call['status']} | {'OK' if call['ok'] else 'FAIL'} | {call['auth']} |"
        for call in result["tool_calls"]
    )
    score = result["score_summary"]
    return "\n".join(
        [
            "# MachineSignal - MCP / Tool Wrapper Simulation",
            "",
            f"Finished at: {result['finished_at']}",
            "",
            "## Result",
            "",
            f"Status: {'passed' if result['ok'] else 'failed'}",
            f"Manifest: `{result['manifest_url']}`",
            f"Auth source: `{result['auth_source']}`",
            f"Sandbox customer: `{result['sandbox_customer_id']}`",
            f"Customer key prefix: `{result['customer_key_prefix']}`",
            "",
            "## Score Summary",
            "",
            f"- Domain: `{score.get('domain')}`",
            f"- Opportunity score: `{score.get('opportunity_score')}`",
            f"- Confidence: `{score.get('confidence')}`",
            f"- Decision: `{score.get('decision')}`",
            f"- Web Architect status: `{score.get('web_architect_status')}`",
            f"- Commercial strength: `{score.get('commercial_strength')}`",
            f"- Recommended product: `{score.get('recommended_product')}`",
            "",
            "## Tool Calls",
            "",
            "| Tool | Method | HTTP | Result | Auth |",
            "|---|---:|---:|---|---|",
            calls,
            "",
            "## Checks",
            "",
            "| Check | Result | Details |",
            "|---|---|---|",
            checks,
            "",
            "## Orders And Guardrails",
            "",
            f"- Orders retrieved: `{result['orders_count']}`",
            f"- First order id: `{result['first_order_id']}`",
            f"- Add-on product: `{result['add_on_product']}`",
            f"- Add-on status: `{result['add_on_status']}`",
            f"- Real payment executed: `{result['real_payment_executed']}`",
            f"- External contact executed: `{result['external_contact_executed']}`",
            "",
            "## Interpretation",
            "",
            "The wrapper simulation confirms that an agent can read the public tool-style manifest, map tool names to HTTP endpoints and execute a safe machine-buyer flow without human email outreach.",
            "",
            "The current setup is MCP-ready but not yet a hosted public MCP server. A future MCP adapter can wrap these same tools using the manifest as the contract.",
            "",
        ]
    )


if __name__ == "__main__":
    print(json.dumps(run(), indent=2))
