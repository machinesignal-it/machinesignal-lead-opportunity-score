#!/usr/bin/env python3
"""
MachineSignal local MCP adapter write-capped sandbox probe.

This probe validates the first real machine use through the local stdio MCP
adapter with a strict write budget:
- create exactly one sandbox customer;
- score exactly one provided synthetic target;
- read usage/orders;
- do not create purchase intents, payment-test intents, external publication,
  outreach or invoices.
"""

from __future__ import annotations

import json
import os
import subprocess
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


REPO_DIR = Path(__file__).resolve().parents[1]
SERVER_PATH = REPO_DIR / "mcp_adapter" / "machinesignal_mcp_server.py"
OUTPUT_JSON = REPO_DIR / "mcp_write_capped_sandbox_probe_summary_20260610.json"
OUTPUT_MD = REPO_DIR / "mcp_write_capped_sandbox_probe_report_20260610.md"
MAX_POST_CALLS = 2

SECRET_KEYS = {
    "api_key",
    "customer_api_key",
    "admin_api_key",
    "x-api-key",
    "token",
    "secret",
    "password",
}


def safe_get(mapping: Any, *keys: str, default: Any = None) -> Any:
    cur = mapping
    for key in keys:
        if not isinstance(cur, dict):
            return default
        cur = cur.get(key)
    return default if cur is None else cur


def parse_tool_payload(result: dict[str, Any]) -> dict[str, Any]:
    content = result.get("content") or []
    if not content:
        return {}
    text = content[0].get("text", "")
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return {"raw": text}


def mask_secret(value: Any) -> Any:
    if not isinstance(value, str):
        return value
    if len(value) <= 12:
        return value[:3] + "..."
    return value[:10] + "..." + value[-4:]


def redact_for_report(value: Any) -> Any:
    if isinstance(value, dict):
        clean: dict[str, Any] = {}
        for key, item in value.items():
            key_lower = key.lower()
            if key_lower in SECRET_KEYS or key_lower.endswith("_key"):
                clean[key] = mask_secret(item)
            else:
                clean[key] = redact_for_report(item)
        return clean
    if isinstance(value, list):
        return [redact_for_report(item) for item in value]
    return value


class McpClient:
    def __init__(self) -> None:
        self.next_id = 1
        env = os.environ.copy()
        env.setdefault("PYTHONIOENCODING", "utf-8")
        env.setdefault("MACHINESIGNAL_MCP_MANIFEST_URL", "https://machinesignal.it/mcp-tool-manifest.json")
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
        message: dict[str, Any] = {"jsonrpc": "2.0", "id": request_id, "method": method}
        if params is not None:
            message["params"] = params
        assert self.proc.stdin is not None
        assert self.proc.stdout is not None
        self.proc.stdin.write(json.dumps(message, ensure_ascii=False) + "\n")
        self.proc.stdin.flush()
        line = self.proc.stdout.readline()
        if not line:
            stderr = self.proc.stderr.read() if self.proc.stderr else ""
            raise RuntimeError(f"MCP adapter closed stdout. stderr={stderr}")
        response = json.loads(line)
        if "error" in response:
            raise RuntimeError(f"MCP error for {method}: {response['error']}")
        return response["result"]

    def notify(self, method: str, params: dict[str, Any] | None = None) -> None:
        message: dict[str, Any] = {"jsonrpc": "2.0", "method": method}
        if params is not None:
            message["params"] = params
        assert self.proc.stdin is not None
        self.proc.stdin.write(json.dumps(message, ensure_ascii=False) + "\n")
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


def build_report(result: dict[str, Any]) -> str:
    def ok_text(ok: bool) -> str:
        return "OK" if ok else "FAIL"

    action_rows = "\n".join(
        f"| {action['tool']} | {action.get('kind')} | {action.get('http_status')} | {ok_text(action['ok'])} |"
        for action in result["actions"]
    )
    check_rows = "\n".join(
        f"| {check['name']} | {ok_text(check['ok'])} | {str(check.get('details', '')).replace('|', '\\|')} |"
        for check in result["checks"]
    )

    score = result["score_summary"]
    return f"""# MachineSignal - MCP Write-Capped Sandbox Probe - 2026-06-10

## Result

Status: {result['status']}

OK: {result['ok']}

Mode: {result['mode']}

POST calls executed: {result['post_calls_executed']}

Max POST calls allowed: {result['max_post_calls_allowed']}

Real payment executed: {result['real_payment_executed']}

External contact executed: {result['external_contact_executed']}

Purchase intent created: {result['purchase_intent_created']}

## What This Validates

A machine client can use the local stdio MCP adapter for a minimal real sandbox path: create one sandbox customer, score one provided target and read state back, without buying add-ons or contacting humans.

## Actions

| Tool | Kind | HTTP | Result |
|---|---|---:|---|
{action_rows}

## Score Summary

- Domain: `{score.get('domain')}`
- Opportunity score: `{score.get('opportunity_score')}`
- Confidence: `{score.get('confidence')}`
- Decision: `{score.get('decision')}`
- Recommended next product: `{score.get('next_product')}`

## Checks

| Check | Result | Details |
|---|---|---|
{check_rows}

## Guardrails

- No purchase intent was created.
- No payment-test intent was created.
- No real payment was executed.
- No invoice was issued.
- No external contact or human outreach was executed.
- The full sandbox API key was stored by the adapter and not published in this report.

## Interpretation

The local MCP adapter can perform the first write-capped sandbox use by a machine while staying under the configured POST budget. The next step can be either a similarly capped Deep Analysis purchase probe or a partner/socio review package, depending on whether we want more product evidence or more commercial packaging.
"""


def run_probe() -> dict[str, Any]:
    checks: list[dict[str, Any]] = []
    actions: list[dict[str, Any]] = []
    post_calls = 0

    def check(name: str, ok: bool, details: str = "") -> None:
        checks.append({"name": name, "ok": bool(ok), "details": details})

    def record(tool: str, payload: dict[str, Any], kind: str) -> None:
        actions.append(
            {
                "tool": tool,
                "kind": kind,
                "http_status": payload.get("http_status"),
                "ok": payload.get("ok") is True,
                "auth": payload.get("auth"),
            }
        )

    client = McpClient()
    run_id = f"mcp-write-capped-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}-{int(time.time())}"
    sandbox: dict[str, Any] = {}
    score: dict[str, Any] = {}
    usage: dict[str, Any] = {}
    orders: dict[str, Any] = {}
    try:
        init = client.request(
            "initialize",
            {
                "protocolVersion": "2024-11-05",
                "capabilities": {},
                "clientInfo": {"name": "machinesignal-write-capped-probe", "version": "2026-06-10"},
            },
        )
        check("mcp_initialize", safe_get(init, "serverInfo", "name") == "machinesignal-local-mcp-adapter", str(init.get("serverInfo")))
        client.notify("notifications/initialized")

        tools = client.request("tools/list").get("tools") or []
        tool_names = {tool.get("name") for tool in tools}
        required = {"create_sandbox_customer", "score_lead_opportunity", "get_usage", "list_orders"}
        check("required_tools_present", required.issubset(tool_names), f"tools={len(tools)}; missing={sorted(required - tool_names)}")

        sandbox = client.call_tool(
            "create_sandbox_customer",
            {
                "evaluator_id": run_id,
                "use_case": "write-capped MCP adapter sandbox probe: one sandbox plus one score only",
                "metadata": {"mode": "write_capped", "max_post_calls": MAX_POST_CALLS},
            },
        )
        post_calls += 1
        record("create_sandbox_customer", sandbox, "POST/write")
        check("sandbox_created", sandbox.get("ok") is True, f"HTTP {sandbox.get('http_status')}")
        check(
            "sandbox_key_not_returned_full_to_client",
            safe_get(sandbox, "payload", "adapter_state", "full_api_key_returned_to_client") is False,
            f"adapter_state={safe_get(sandbox, 'payload', 'adapter_state')}",
        )

        score_idempotency_key = f"{run_id}-score-001"
        score = client.call_tool(
            "score_lead_opportunity",
            {
                "domain": "mcp-write-capped-demo-dentist.example",
                "sector_hint": "dentist odontoiatric clinic",
                "country_hint": "IT",
                "target_name": "MCP Write-Capped Demo Dentist",
                "category_hint": "dentists and odontoiatric clinics",
                "area": "Lombardia",
                "region": "Lombardia",
                "source_type": "mcp_write_capped_sandbox_probe",
                "commercial_objective": "website-led commercial opportunity and CRM-ready follow-up preparation",
                "initial_signals": [
                    "sector_match",
                    "local_market",
                    "business_domain_present",
                    "official_site",
                    "service_keyword_present",
                    "website_opportunity",
                ],
                "idempotency_key": score_idempotency_key,
            },
        )
        post_calls += 1
        record("score_lead_opportunity", score, "POST/write")
        score_value = safe_get(score, "payload", "opportunity_score")
        score_decision = safe_get(score, "payload", "decision")
        check("score_created", score.get("ok") is True and isinstance(score_value, int | float), f"HTTP {score.get('http_status')}; score={score_value}")
        check("score_has_machine_decision", isinstance(score_decision, str) and len(score_decision) > 0, f"decision={score_decision}")

        usage = client.call_tool("get_usage")
        record("get_usage", usage, "GET/read")
        check("usage_read", usage.get("ok") is True, f"HTTP {usage.get('http_status')}")

        orders = client.call_tool("list_orders")
        record("list_orders", orders, "GET/read")
        order_products = [item.get("product_code") for item in safe_get(orders, "payload", "orders", default=[]) or [] if isinstance(item, dict)]
        check("orders_read", orders.get("ok") is True, f"HTTP {orders.get('http_status')}; products={order_products}")
        check("no_purchase_orders_created", not order_products, f"products={order_products}")

        check("post_budget_respected", post_calls <= MAX_POST_CALLS, f"post_calls={post_calls}; max={MAX_POST_CALLS}")
        check("no_purchase_intent_created", "create_purchase_intent" not in [action["tool"] for action in actions], "create_purchase_intent not called")
        check("no_payment_test_intent_created", "create_payment_test_intent" not in [action["tool"] for action in actions], "create_payment_test_intent not called")
        check(
            "no_payment_or_external_contact",
            safe_get(usage, "payload", "real_payment_executed") is False
            and safe_get(usage, "payload", "external_contact_executed") is False,
            f"payment={safe_get(usage, 'payload', 'real_payment_executed')}; contact={safe_get(usage, 'payload', 'external_contact_executed')}",
        )
    finally:
        client.close()

    result = {
        "artifact": "mcp_write_capped_sandbox_probe",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "status": "completed_mcp_write_capped_sandbox_probe",
        "ok": all(item["ok"] for item in checks),
        "mode": "WriteCappedMcpSandboxProbe",
        "primary_customer_interface": "machine",
        "max_post_calls_allowed": MAX_POST_CALLS,
        "post_calls_executed": post_calls,
        "write_calls_executed": post_calls,
        "sandbox_customer_created": sandbox.get("ok") is True,
        "score_call_executed": score.get("ok") is True,
        "purchase_intent_created": False,
        "payment_test_intent_created": False,
        "real_payment_executed": False,
        "real_invoice_issued": False,
        "external_contact_executed": False,
        "external_publication_executed": False,
        "production_api_key_published": False,
        "human_outreach_executed": False,
        "actions": actions,
        "score_summary": {
            "domain": safe_get(score, "payload", "domain"),
            "opportunity_score": safe_get(score, "payload", "opportunity_score"),
            "confidence": safe_get(score, "payload", "confidence"),
            "decision": safe_get(score, "payload", "decision"),
            "next_product": safe_get(score, "payload", "next_purchase", "next_product"),
        },
        "usage_summary": {
            "http_status": usage.get("http_status"),
            "ledger_backend": safe_get(usage, "payload", "ledger_backend"),
            "real_payment_executed": safe_get(usage, "payload", "real_payment_executed"),
            "external_contact_executed": safe_get(usage, "payload", "external_contact_executed"),
        },
        "orders_summary": {
            "http_status": orders.get("http_status"),
            "count": safe_get(orders, "payload", "count"),
        },
        "checks": checks,
        "machine_decision": {
            "decision": "mcp_write_capped_sandbox_probe_ready" if all(item["ok"] for item in checks) else "mcp_write_capped_sandbox_probe_needs_fix",
            "recommended_next_step": "Use this as bounded evidence that a machine can execute the first sandbox+score path through the MCP adapter. Next step is a capped purchase probe only if more downstream product evidence is needed.",
        },
    }
    return redact_for_report(result)


def main() -> int:
    result = run_probe()
    OUTPUT_JSON.write_text(json.dumps(result, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    OUTPUT_MD.write_text(build_report(result), encoding="utf-8")
    print(json.dumps(result, indent=2, ensure_ascii=False))
    return 0 if result["ok"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
