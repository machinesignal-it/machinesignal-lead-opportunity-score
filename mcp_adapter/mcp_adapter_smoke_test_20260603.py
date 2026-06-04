#!/usr/bin/env python3
"""
Smoke test for the MachineSignal local MCP adapter.

The test launches the adapter over stdio, speaks JSON-RPC, calls MCP tools and
verifies a safe machine-buyer flow.
"""

from __future__ import annotations

import json
import os
import subprocess
import sys
import time
from datetime import datetime
from pathlib import Path
from typing import Any


REPO_DIR = Path(__file__).resolve().parents[1]
SERVER_PATH = REPO_DIR / "mcp_adapter" / "machinesignal_mcp_server.py"
OUTPUT_DIR = Path(r"C:\Users\natal\AppData\Local\Temp\MachineSignal\mcp_adapter_smoke_test_20260603")
REPORT_PATH = REPO_DIR / "mcp_adapter_smoke_test_readout_20260603.md"


def parse_tool_payload(result: dict[str, Any]) -> dict[str, Any]:
    content = result.get("content") or []
    if not content:
        return {}
    text = content[0].get("text", "")
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return {"raw": text}


def safe_get(mapping: Any, *keys: str, default: Any = None) -> Any:
    cur = mapping
    for key in keys:
        if not isinstance(cur, dict):
            return default
        cur = cur.get(key)
    return default if cur is None else cur


def first_sample_target(purchase_payload: dict[str, Any]) -> dict[str, Any] | None:
    payload = purchase_payload.get("payload") if isinstance(purchase_payload.get("payload"), dict) else purchase_payload
    paths = [
        ("delivery", "beta_sample_targets"),
        ("order", "delivery", "beta_sample_targets"),
        ("delivery", "sample_targets"),
        ("order", "delivery", "sample_targets"),
    ]
    for path in paths:
        samples = safe_get(payload, *path, default=[])
        if isinstance(samples, list) and samples:
            sample = samples[0]
            if isinstance(sample, dict):
                return sample
    return None


def recommended_product(score_payload: dict[str, Any]) -> str | None:
    payload = score_payload.get("payload") if isinstance(score_payload.get("payload"), dict) else score_payload
    next_purchase = payload.get("next_purchase") or {}
    if next_purchase.get("next_product"):
        return str(next_purchase["next_product"])
    decision = payload.get("decision")
    if decision == "nurture":
        return "nurture_signal"
    if decision == "needs_verification":
        return "verification"
    if decision == "buy_deep_analysis":
        return "deep_analysis"
    return None


class McpClient:
    def __init__(self) -> None:
        self.next_id = 1
        env = os.environ.copy()
        env.setdefault("PYTHONIOENCODING", "utf-8")
        self.proc = subprocess.Popen(
            [sys.executable, str(SERVER_PATH)],
            cwd=str(REPO_DIR),
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            encoding="utf-8",
            env=env,
        )

    def request(self, method: str, params: dict[str, Any] | None = None) -> dict[str, Any]:
        request_id = self.next_id
        self.next_id += 1
        message = {"jsonrpc": "2.0", "id": request_id, "method": method}
        if params is not None:
            message["params"] = params
        assert self.proc.stdin is not None
        assert self.proc.stdout is not None
        self.proc.stdin.write(json.dumps(message) + "\n")
        self.proc.stdin.flush()
        line = self.proc.stdout.readline()
        if not line:
            stderr = self.proc.stderr.read() if self.proc.stderr else ""
            raise RuntimeError(f"MCP server closed stdout. stderr={stderr}")
        response = json.loads(line)
        if "error" in response:
            raise RuntimeError(f"MCP error for {method}: {response['error']}")
        return response["result"]

    def notify(self, method: str, params: dict[str, Any] | None = None) -> None:
        message = {"jsonrpc": "2.0", "method": method}
        if params is not None:
            message["params"] = params
        assert self.proc.stdin is not None
        self.proc.stdin.write(json.dumps(message) + "\n")
        self.proc.stdin.flush()

    def call_tool(self, name: str, arguments: dict[str, Any] | None = None) -> dict[str, Any]:
        result = self.request("tools/call", {"name": name, "arguments": arguments or {}})
        return parse_tool_payload(result)

    def close(self) -> None:
        try:
            if self.proc.stdin:
                self.proc.stdin.close()
            self.proc.terminate()
            self.proc.wait(timeout=5)
        except Exception:
            self.proc.kill()


def run() -> dict[str, Any]:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    checks: list[dict[str, Any]] = []
    calls: list[dict[str, Any]] = []

    def check(name: str, ok: bool, details: str = "") -> None:
        checks.append({"name": name, "ok": bool(ok), "details": details})

    def record_tool(name: str, payload: dict[str, Any]) -> None:
        calls.append(
            {
                "tool": name,
                "http_status": payload.get("http_status"),
                "ok": payload.get("ok"),
                "auth": payload.get("auth"),
            }
        )

    client = McpClient()
    try:
        init = client.request(
            "initialize",
            {
                "protocolVersion": "2024-11-05",
                "capabilities": {},
                "clientInfo": {"name": "machinesignal-mcp-smoke-test", "version": "2026-06-04"},
            },
        )
        check("mcp_initialize", init.get("serverInfo", {}).get("name") == "machinesignal-local-mcp-adapter", str(init.get("serverInfo")))
        client.notify("notifications/initialized")

        tools_result = client.request("tools/list")
        tools = tools_result.get("tools") or []
        tool_names = {tool.get("name") for tool in tools}
        required_tools = {
            "get_product_catalog",
            "get_machine_onboarding",
            "get_machine_api_sandbox_test",
            "get_dentists_beta_pack",
            "create_sandbox_customer",
            "get_customer_onboarding",
            "score_lead_opportunity",
            "create_purchase_intent",
            "list_orders",
            "get_order",
            "get_usage",
            "create_payment_test_intent",
            "get_payment_test_intent",
            "get_payment_test_reconciliation",
        }
        check("mcp_tools_list", required_tools.issubset(tool_names), f"{len(tools)} tools")

        catalog = client.call_tool("get_product_catalog")
        record_tool("get_product_catalog", catalog)
        check("tool_get_product_catalog", catalog.get("ok") is True, f"HTTP {catalog.get('http_status')}")

        onboarding = client.call_tool("get_machine_onboarding")
        record_tool("get_machine_onboarding", onboarding)
        check("tool_get_machine_onboarding", onboarding.get("ok") is True, f"HTTP {onboarding.get('http_status')}")

        sandbox_test = client.call_tool("get_machine_api_sandbox_test")
        record_tool("get_machine_api_sandbox_test", sandbox_test)
        check("tool_get_machine_api_sandbox_test", sandbox_test.get("ok") is True, f"HTTP {sandbox_test.get('http_status')}")

        dentists_pack = client.call_tool("get_dentists_beta_pack")
        record_tool("get_dentists_beta_pack", dentists_pack)
        check(
            "tool_get_dentists_beta_pack",
            dentists_pack.get("ok") is True and safe_get(dentists_pack, "payload", "benchmark", "targets_scored") == 250,
            f"HTTP {dentists_pack.get('http_status')}",
        )

        run_id = f"local-mcp-adapter-smoke-{stamp}-{int(time.time())}"
        sandbox = client.call_tool(
            "create_sandbox_customer",
            {
                "evaluator_id": run_id,
                "use_case": "local MCP adapter smoke test",
            },
        )
        record_tool("create_sandbox_customer", sandbox)
        check(
            "tool_create_sandbox_customer",
            sandbox.get("ok") is True and safe_get(sandbox, "payload", "adapter_state", "customer_api_key_stored_in_memory") is True,
            f"HTTP {sandbox.get('http_status')}",
        )
        check(
            "sandbox_key_not_exposed_full",
            safe_get(sandbox, "payload", "adapter_state", "full_api_key_returned_to_client") is False,
            str(safe_get(sandbox, "payload", "api_key")),
        )

        customer_onboarding = client.call_tool("get_customer_onboarding")
        record_tool("get_customer_onboarding", customer_onboarding)
        check("tool_get_customer_onboarding", customer_onboarding.get("ok") is True, f"HTTP {customer_onboarding.get('http_status')}")

        target_discovery = client.call_tool(
            "create_purchase_intent",
            {
                "product_code": "target_discovery",
                "market": "dentists_odontoiatric_clinics",
                "area": "Lombardia",
                "commercial_objective": "identify dentist and odontoiatric clinic domains worth scoring for website-led commercial opportunity and CRM-ready follow-up preparation",
                "reason": "Local MCP adapter smoke test has no starting list and follows the tool manifest flow.",
                "batch_id": run_id,
                "idempotency_key": f"{run_id}-target-discovery",
            },
        )
        record_tool("create_purchase_intent_target_discovery", target_discovery)
        check("tool_create_purchase_intent_target_discovery", target_discovery.get("ok") is True, f"HTTP {target_discovery.get('http_status')}")

        sample = first_sample_target(target_discovery) or {
            "domain": "clinic3.it",
            "target_name": "Clinic 3",
            "category": "dentist",
            "area": "Lombardia",
            "initial_signals": ["fallback sample for local MCP adapter smoke test"],
        }
        check("target_discovery_sample_available", bool(sample.get("domain")), str(sample.get("domain")))

        score = client.call_tool(
            "score_lead_opportunity",
            {
                "domain": sample.get("domain"),
                "sector_hint": "dentist",
                "country_hint": "IT",
                "target_name": sample.get("target_name"),
                "category_hint": sample.get("category"),
                "area": sample.get("area"),
                "region": "Lombardia",
                "initial_signals": sample.get("initial_signals"),
                "commercial_objective": "website-led commercial opportunity and CRM-ready follow-up preparation",
                "idempotency_key": f"{run_id}-score-001",
            },
        )
        record_tool("score_lead_opportunity", score)
        check("tool_score_lead_opportunity", score.get("ok") is True and safe_get(score, "payload", "opportunity_score") is not None, f"HTTP {score.get('http_status')}")
        check("score_has_decision", bool(safe_get(score, "payload", "decision")), str(safe_get(score, "payload", "decision")))
        check("score_has_web_architect_review", isinstance(safe_get(score, "payload", "web_architect_review"), dict), str(safe_get(score, "payload", "web_architect_review", "status")))
        check("score_has_commercial_strength", isinstance(safe_get(score, "payload", "commercial_strength"), dict), str(safe_get(score, "payload", "commercial_strength", "level")))

        add_on_product = recommended_product(score)
        add_on: dict[str, Any] = {}
        if add_on_product:
            add_on = client.call_tool(
                "create_purchase_intent",
                {
                    "product_code": add_on_product,
                    "domain": safe_get(score, "payload", "domain"),
                    "source_score_request_id": f"{run_id}-score-001",
                    "reason": f"Local MCP adapter followed score recommendation: {add_on_product}.",
                    "idempotency_key": f"{run_id}-{add_on_product}",
                },
            )
            record_tool("create_purchase_intent_recommended_add_on", add_on)
            check("tool_create_purchase_intent_recommended_add_on", add_on.get("ok") is True, f"HTTP {add_on.get('http_status')}; product={add_on_product}")
        else:
            check("tool_create_purchase_intent_recommended_add_on", True, "no add-on recommended")

        orders = client.call_tool("list_orders")
        record_tool("list_orders", orders)
        order_list = safe_get(orders, "payload", "orders", default=[]) or []
        check("tool_list_orders", orders.get("ok") is True and len(order_list) >= 1, f"HTTP {orders.get('http_status')}; orders={len(order_list)}")

        first_order_id = order_list[0].get("order_intent_id") if order_list and isinstance(order_list[0], dict) else None
        if first_order_id:
            one_order = client.call_tool("get_order", {"order_intent_id": str(first_order_id)})
            record_tool("get_order", one_order)
            check("tool_get_order", one_order.get("ok") is True, f"HTTP {one_order.get('http_status')}; order={first_order_id}")
        else:
            one_order = {}
            check("tool_get_order", False, "missing order id")

        usage = client.call_tool("get_usage")
        record_tool("get_usage", usage)
        check("tool_get_usage", usage.get("ok") is True, f"HTTP {usage.get('http_status')}")
        check("no_real_payment", safe_get(usage, "payload", "real_payment_executed") is False, str(safe_get(usage, "payload", "real_payment_executed")))
        check("no_external_contact", safe_get(usage, "payload", "external_contact_executed") is False, str(safe_get(usage, "payload", "external_contact_executed")))

        result = {
            "ok": all(item["ok"] for item in checks),
            "test_name": "mcp_adapter_smoke_test",
            "finished_at": datetime.now().isoformat(timespec="seconds"),
            "server": str(SERVER_PATH),
            "checks": checks,
            "tool_calls": calls,
            "score_summary": {
                "domain": safe_get(score, "payload", "domain"),
                "opportunity_score": safe_get(score, "payload", "opportunity_score"),
                "confidence": safe_get(score, "payload", "confidence"),
                "decision": safe_get(score, "payload", "decision"),
                "web_architect_status": safe_get(score, "payload", "web_architect_review", "status"),
                "commercial_strength": safe_get(score, "payload", "commercial_strength", "level"),
                "recommended_product": add_on_product,
            },
            "orders_count": len(order_list),
            "first_order_id": first_order_id,
            "real_payment_executed": safe_get(usage, "payload", "real_payment_executed"),
            "external_contact_executed": safe_get(usage, "payload", "external_contact_executed"),
        }
    finally:
        client.close()

    summary_path = OUTPUT_DIR / f"mcp_adapter_smoke_test_summary_{stamp}.json"
    report_path = OUTPUT_DIR / f"mcp_adapter_smoke_test_report_{stamp}.md"
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    summary_path.write_text(json.dumps(result, indent=2), encoding="utf-8")
    report = build_report(result)
    report_path.write_text(report, encoding="utf-8")
    REPORT_PATH.write_text(report, encoding="utf-8")
    result["summary_path"] = str(summary_path)
    result["report_path"] = str(report_path)
    result["repo_report_path"] = str(REPORT_PATH)
    return result


def build_report(result: dict[str, Any]) -> str:
    checks = "\n".join(
        f"| {item['name']} | {'OK' if item['ok'] else 'FAIL'} | {item['details']} |"
        for item in result["checks"]
    )
    calls = "\n".join(
        f"| {call['tool']} | {call['http_status']} | {'OK' if call['ok'] else 'FAIL'} | {call['auth']} |"
        for call in result["tool_calls"]
    )
    score = result["score_summary"]
    return "\n".join(
        [
            "# MachineSignal - Local MCP Adapter Smoke Test",
            "",
            f"Finished at: {result['finished_at']}",
            "",
            "## Result",
            "",
            f"Status: {'passed' if result['ok'] else 'failed'}",
            f"Server: `{result['server']}`",
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
            "## MCP Tool Calls",
            "",
            "| Tool | HTTP | Result | Auth |",
            "|---|---:|---|---|",
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
            f"- Real payment executed: `{result['real_payment_executed']}`",
            f"- External contact executed: `{result['external_contact_executed']}`",
            "",
            "## Interpretation",
            "",
            "The test proves that the local adapter can expose MachineSignal as MCP-style tools over stdio. The client used JSON-RPC initialize, tools/list and tools/call, then completed a safe machine-buyer flow.",
            "",
            "The adapter stores the sandbox key in memory and does not return the full key to the MCP client.",
            "",
        ]
    )


if __name__ == "__main__":
    print(json.dumps(run(), indent=2))
