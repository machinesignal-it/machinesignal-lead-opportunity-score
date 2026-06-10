#!/usr/bin/env python3
"""
MachineSignal MCP purchase decision probe.

This probe validates a bounded machine-buyer path through the local stdio MCP
adapter:
- read public product/onboarding material;
- create one sandbox customer;
- score one synthetic target;
- let the score response drive the purchase decision;
- create one sandbox purchase intent for the recommended product;
- retrieve orders, one order delivery and usage;
- never execute real payment, invoices, external publication or human contact.
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
OUTPUT_JSON = REPO_DIR / "mcp_purchase_decision_probe_summary_20260610.json"
OUTPUT_MD = REPO_DIR / "mcp_purchase_decision_probe_report_20260610.md"
MAX_POST_CALLS = 3

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


def first_order_id(value: Any) -> str | None:
    paths = [
        ("payload", "order_intent_id"),
        ("payload", "order", "order_intent_id"),
        ("payload", "purchase_intent", "order_intent_id"),
        ("payload", "intent", "order_intent_id"),
        ("payload", "id"),
    ]
    for path in paths:
        candidate = safe_get(value, *path)
        if isinstance(candidate, str) and candidate:
            return candidate

    orders = safe_get(value, "payload", "orders", default=[])
    if isinstance(orders, list) and orders:
        first = orders[0]
        if isinstance(first, dict):
            candidate = first.get("order_intent_id") or first.get("id")
            if isinstance(candidate, str) and candidate:
                return candidate
    return None


def delivery_summary(value: Any) -> dict[str, Any]:
    payload = value.get("payload") if isinstance(value, dict) else {}
    delivery = {}
    for path in [
        ("delivery",),
        ("order", "delivery"),
        ("purchase_intent", "delivery"),
        ("intent", "delivery"),
    ]:
        candidate = safe_get(payload, *path, default={})
        if isinstance(candidate, dict) and candidate:
            delivery = candidate
            break

    return {
        "delivery_present": bool(delivery),
        "delivery_type": delivery.get("delivery_type") or delivery.get("type"),
        "delivery_status": delivery.get("delivery_status") or delivery.get("status"),
        "fields_present": sorted(delivery.keys())[:30],
        "has_crm_payload": any(key in delivery for key in ("crm_summary_payload", "crm_record_patch", "crm_task")),
        "has_machine_decision_matrix": "machine_decision_matrix" in delivery,
        "has_next_machine_call": "next_machine_call" in delivery or "next_api_calls" in delivery,
        "has_stop_rules": "stop_rules" in delivery,
    }


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


def recommended_product(score_payload: dict[str, Any]) -> str | None:
    next_product = safe_get(score_payload, "payload", "next_purchase", "next_product")
    if isinstance(next_product, str) and next_product:
        return next_product
    decision = safe_get(score_payload, "payload", "decision")
    if decision == "buy_deep_analysis":
        return "deep_analysis"
    if decision == "nurture":
        return "nurture_signal"
    if decision == "needs_verification":
        return "verification"
    return None


def build_report(result: dict[str, Any]) -> str:
    def ok_text(ok: bool) -> str:
        return "OK" if ok else "FAIL"

    decision_rows = "\n".join(
        f"| {item['decision']} | {item['reason'].replace('|', '\\|')} | {item['action']} |"
        for item in result["machine_decisions"]
    )
    action_rows = "\n".join(
        f"| {action['tool']} | {action.get('kind')} | {action.get('http_status')} | {ok_text(action['ok'])} | {action.get('auth')} |"
        for action in result["actions"]
    )
    check_rows = "\n".join(
        f"| {check['name']} | {ok_text(check['ok'])} | {str(check.get('details', '')).replace('|', '\\|')} |"
        for check in result["checks"]
    )

    score = result["score_summary"]
    delivery = result["delivery_summary"]
    return f"""# MachineSignal - MCP Purchase Decision Probe - 2026-06-10

## Result

Status: {result['status']}

OK: {result['ok']}

Mode: {result['mode']}

POST calls executed: {result['post_calls_executed']}

Max POST calls allowed: {result['max_post_calls_allowed']}

Purchased sandbox product: `{result['purchase_summary'].get('product_code')}`

Real payment executed: {result['real_payment_executed']}

External contact executed: {result['external_contact_executed']}

## What This Validates

A buyer machine can use the local MCP adapter to discover MachineSignal, create a sandbox, score a synthetic target, follow the score recommendation, create one sandbox purchase intent and retrieve the delivery without human sales contact.

## Machine Decisions

| Decision | Reason | Action |
|---|---|---|
{decision_rows}

## Tool Calls

| Tool | Kind | HTTP | Result | Auth |
|---|---|---:|---|---|
{action_rows}

## Score Summary

- Domain: `{score.get('domain')}`
- Opportunity score: `{score.get('opportunity_score')}`
- Confidence: `{score.get('confidence')}`
- Decision: `{score.get('decision')}`
- Recommended product: `{score.get('recommended_product')}`

## Delivery Summary

- Delivery present: `{delivery.get('delivery_present')}`
- Delivery type: `{delivery.get('delivery_type')}`
- Delivery status: `{delivery.get('delivery_status')}`
- CRM payload: `{delivery.get('has_crm_payload')}`
- Machine decision matrix: `{delivery.get('has_machine_decision_matrix')}`
- Next machine call: `{delivery.get('has_next_machine_call')}`
- Stop rules: `{delivery.get('has_stop_rules')}`

## Checks

| Check | Result | Details |
|---|---|---|
{check_rows}

## Guardrails

- One sandbox customer only.
- One score call only.
- One sandbox purchase intent only.
- No real payment.
- No invoice.
- No external contact.
- No external publication.
- No human outreach.
- Full sandbox API key is kept in adapter memory and is not published.

## Learning Loop Interpretation

This is the first Competitive Learning experiment after adding the learning agent. The result is used as evidence that the machine-first commercial loop can move from score to a bounded sandbox purchase decision. If it passes, QA can treat this as a valid building block for the next go-live readiness step.
"""


def run_probe() -> dict[str, Any]:
    checks: list[dict[str, Any]] = []
    actions: list[dict[str, Any]] = []
    machine_decisions: list[dict[str, str]] = []
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

    def decide(decision: str, reason: str, action: str) -> None:
        machine_decisions.append({"decision": decision, "reason": reason, "action": action})

    client = McpClient()
    run_id = f"mcp-purchase-decision-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}-{int(time.time())}"
    catalog: dict[str, Any] = {}
    onboarding: dict[str, Any] = {}
    sandbox: dict[str, Any] = {}
    score: dict[str, Any] = {}
    purchase: dict[str, Any] = {}
    orders: dict[str, Any] = {}
    order: dict[str, Any] = {}
    usage: dict[str, Any] = {}
    product_code: str | None = None
    order_id: str | None = None

    try:
        init = client.request(
            "initialize",
            {
                "protocolVersion": "2024-11-05",
                "capabilities": {},
                "clientInfo": {"name": "machinesignal-mcp-purchase-decision-probe", "version": "2026-06-10"},
            },
        )
        check("mcp_initialize", safe_get(init, "serverInfo", "name") == "machinesignal-local-mcp-adapter", str(init.get("serverInfo")))
        client.notify("notifications/initialized")

        tools = client.request("tools/list").get("tools") or []
        tool_names = {tool.get("name") for tool in tools}
        required = {
            "get_product_catalog",
            "get_machine_onboarding",
            "create_sandbox_customer",
            "score_lead_opportunity",
            "create_purchase_intent",
            "list_orders",
            "get_order",
            "get_usage",
        }
        check("required_tools_present", required.issubset(tool_names), f"tools={len(tools)}; missing={sorted(required - tool_names)}")

        catalog = client.call_tool("get_product_catalog")
        record("get_product_catalog", catalog, "GET/read")
        check("catalog_read", catalog.get("ok") is True, f"HTTP {catalog.get('http_status')}")

        onboarding = client.call_tool("get_machine_onboarding")
        record("get_machine_onboarding", onboarding, "GET/read")
        check("machine_onboarding_read", onboarding.get("ok") is True, f"HTTP {onboarding.get('http_status')}")

        decide(
            "start_sandbox",
            "The machine can evaluate the product through API/MCP without human sales contact.",
            "create_sandbox_customer",
        )
        sandbox = client.call_tool(
            "create_sandbox_customer",
            {
                "evaluator_id": run_id,
                "use_case": "MCP purchase decision probe: sandbox, one score and one recommended sandbox purchase only",
                "metadata": {"mode": "mcp_purchase_decision", "max_post_calls": MAX_POST_CALLS},
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

        decide(
            "score_target_before_purchase",
            "The machine buys only after receiving a score, confidence and recommended next product.",
            "score_lead_opportunity",
        )
        score = client.call_tool(
            "score_lead_opportunity",
            {
                "domain": "premium-dental-conversion-gap.it",
                "sector_hint": "dentist odontoiatric clinic",
                "country_hint": "IT",
                "target_name": "Premium Dental Conversion Gap",
                "category_hint": "dentists and odontoiatric clinics",
                "area": "Lombardia",
                "region": "Lombardia",
                "source_type": "mcp_purchase_decision_probe",
                "commercial_objective": "website-led commercial opportunity and CRM-ready follow-up preparation",
                "initial_signals": [
                    "sector_match",
                    "local_market",
                    "conversion_gap",
                    "commercial_service_pages",
                    "website_opportunity",
                    "crm_follow_up_possible",
                ],
                "idempotency_key": f"{run_id}-score-001",
            },
        )
        post_calls += 1
        record("score_lead_opportunity", score, "POST/write")
        score_value = safe_get(score, "payload", "opportunity_score")
        score_decision = safe_get(score, "payload", "decision")
        product_code = recommended_product(score)
        check("score_created", score.get("ok") is True and isinstance(score_value, (int, float)), f"HTTP {score.get('http_status')}; score={score_value}")
        check("score_has_machine_decision", isinstance(score_decision, str) and len(score_decision) > 0, f"decision={score_decision}")
        check("score_recommends_product", isinstance(product_code, str) and len(product_code) > 0, f"next_product={product_code}")

        if product_code:
            decide(
                "buy_recommended_sandbox_product",
                f"The score response recommends {product_code}; the machine follows only the API recommendation.",
                f"create_purchase_intent {product_code}",
            )
            purchase = client.call_tool(
                "create_purchase_intent",
                {
                    "product_code": product_code,
                    "domain": safe_get(score, "payload", "domain") or "premium-dental-conversion-gap.it",
                    "commercial_objective": "website-led commercial opportunity and CRM-ready follow-up preparation",
                    "batch_id": run_id,
                    "reason": f"MCP buyer machine follows score recommendation: {product_code}.",
                    "source_score_request_id": f"{run_id}-score-001",
                    "idempotency_key": f"{run_id}-{product_code}",
                },
            )
            post_calls += 1
            record("create_purchase_intent", purchase, "POST/write")
            check("purchase_intent_created", purchase.get("ok") is True, f"HTTP {purchase.get('http_status')}; product={product_code}")
        else:
            check("purchase_intent_created", False, "No recommended product returned by score.")

        order_id = first_order_id(purchase)
        check("purchase_returns_order_id", isinstance(order_id, str) and len(order_id) > 0, f"order_id={order_id}")

        orders = client.call_tool("list_orders")
        record("list_orders", orders, "GET/read")
        order_count = len(safe_get(orders, "payload", "orders", default=[]) or [])
        check("orders_list_read", orders.get("ok") is True and order_count >= 1, f"HTTP {orders.get('http_status')}; orders={order_count}")

        if order_id:
            order = client.call_tool("get_order", {"order_intent_id": order_id})
            record("get_order", order, "GET/read")
            check("order_retrieved", order.get("ok") is True, f"HTTP {order.get('http_status')}; order_id={order_id}")
        else:
            order = {}
            check("order_retrieved", False, "Missing order id.")

        delivery = delivery_summary(order or purchase)
        check("delivery_present", delivery["delivery_present"], str(delivery))
        check("delivery_machine_usable", bool(delivery["has_next_machine_call"] or delivery["has_machine_decision_matrix"] or delivery["has_crm_payload"]), str(delivery))

        usage = client.call_tool("get_usage")
        record("get_usage", usage, "GET/read")
        check("usage_read", usage.get("ok") is True, f"HTTP {usage.get('http_status')}")

        check("post_budget_respected", post_calls <= MAX_POST_CALLS, f"post_calls={post_calls}; max={MAX_POST_CALLS}")
        check(
            "no_real_payment_or_external_contact",
            safe_get(usage, "payload", "real_payment_executed") is False
            and safe_get(usage, "payload", "external_contact_executed") is False,
            f"payment={safe_get(usage, 'payload', 'real_payment_executed')}; contact={safe_get(usage, 'payload', 'external_contact_executed')}",
        )
        check("no_payment_test_intent_created", "create_payment_test_intent" not in [action["tool"] for action in actions], "payment test tool not called")
        check("no_external_publication", "external_publication" not in [action["tool"] for action in actions], "external publication not called")
    finally:
        client.close()

    delivery = delivery_summary(order or purchase)
    result = {
        "artifact": "mcp_purchase_decision_probe",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "status": "completed_mcp_purchase_decision_probe",
        "ok": all(item["ok"] for item in checks),
        "mode": "McpPurchaseDecisionProbeWriteCapped",
        "primary_customer_interface": "machine",
        "max_post_calls_allowed": MAX_POST_CALLS,
        "post_calls_executed": post_calls,
        "write_calls_executed": post_calls,
        "machine_decisions": machine_decisions,
        "actions": actions,
        "score_summary": {
            "domain": safe_get(score, "payload", "domain"),
            "opportunity_score": safe_get(score, "payload", "opportunity_score"),
            "confidence": safe_get(score, "payload", "confidence"),
            "decision": safe_get(score, "payload", "decision"),
            "recommended_product": product_code,
        },
        "purchase_summary": {
            "product_code": product_code,
            "http_status": purchase.get("http_status"),
            "order_intent_id": order_id,
            "created": purchase.get("ok") is True,
        },
        "delivery_summary": delivery,
        "orders_summary": {
            "http_status": orders.get("http_status"),
            "count": len(safe_get(orders, "payload", "orders", default=[]) or []),
            "order_retrieved": order.get("ok") is True,
        },
        "usage_summary": {
            "http_status": usage.get("http_status"),
            "ledger_backend": safe_get(usage, "payload", "ledger_backend"),
            "real_payment_executed": safe_get(usage, "payload", "real_payment_executed"),
            "external_contact_executed": safe_get(usage, "payload", "external_contact_executed"),
        },
        "safety": {
            "real_payment_executed": False,
            "external_contact_executed": False,
            "real_invoice_issued": False,
            "payment_test_created": False,
            "external_publication_executed": False,
            "human_outreach_executed": False,
            "production_api_key_published": False,
        },
        "real_payment_executed": False,
        "external_contact_executed": False,
        "checks": checks,
        "learning_loop": {
            "competitive_learning_experiment": "MCP purchase decision probe",
            "lesson_learned": (
                "A machine can move from score recommendation to one bounded sandbox purchase and delivery retrieval "
                "through MCP without human outreach."
                if all(item["ok"] for item in checks)
                else "The MCP purchase decision path needs fixes before it can be used as go-live evidence."
            ),
            "recommended_next_step": "Run QA review and then decide whether to expose this as public machine-buyer evidence.",
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
