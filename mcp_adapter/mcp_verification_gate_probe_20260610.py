#!/usr/bin/env python3
"""
MachineSignal MCP verification gate probe.

This probe validates decision discipline after a verification purchase:
- create one sandbox customer;
- score one synthetic target that should require verification;
- buy one sandbox verification intent;
- read the verification delivery;
- stop before Deep Analysis because the verification verdict is cautious.

The purpose is not to prove that Deep Analysis can be bought. That is already
covered elsewhere. The purpose is to prove that a buyer machine does not spend
more when the verification gate has not produced a positive go signal.
"""

from __future__ import annotations

import json
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


REPO_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(Path(__file__).resolve().parent))

from mcp_purchase_decision_probe_20260610 import (  # noqa: E402
    McpClient,
    first_order_id,
    redact_for_report,
    safe_get,
)


OUTPUT_JSON = REPO_DIR / "mcp_verification_gate_probe_summary_20260610.json"
OUTPUT_MD = REPO_DIR / "mcp_verification_gate_probe_report_20260610.md"
MAX_POST_CALLS = 3


def extract_delivery(value: Any) -> dict[str, Any]:
    payload = value.get("payload") if isinstance(value, dict) else {}
    for path in [
        ("delivery",),
        ("order", "delivery"),
        ("purchase_intent", "delivery"),
        ("intent", "delivery"),
    ]:
        candidate = safe_get(payload, *path, default={})
        if isinstance(candidate, dict) and candidate:
            return candidate
    return {}


def delivery_gate_summary(delivery: dict[str, Any]) -> dict[str, Any]:
    verdict = delivery.get("verification_verdict") if isinstance(delivery, dict) else {}
    next_call = delivery.get("next_machine_call") if isinstance(delivery, dict) else {}
    next_allowed = delivery.get("next_allowed_actions") if isinstance(delivery, dict) else []
    stop_rules = delivery.get("stop_rules") if isinstance(delivery, dict) else []
    verdict_status = verdict.get("status") if isinstance(verdict, dict) else None
    next_endpoint = next_call.get("endpoint") if isinstance(next_call, dict) else None

    positive_statuses = {"verified_for_deep_analysis", "verified", "safe_to_deepen"}
    gate_allows_deep_analysis_now = (
        verdict_status in positive_statuses
        and next_endpoint == "/v1/purchase-intent"
        and "deep_analysis" in json.dumps(next_call, ensure_ascii=False)
    )

    return {
        "delivery_present": bool(delivery),
        "delivery_type": delivery.get("delivery_type"),
        "delivery_status": delivery.get("status"),
        "verification_verdict_status": verdict_status,
        "verification_verdict_meaning": verdict.get("meaning") if isinstance(verdict, dict) else None,
        "next_allowed_actions": next_allowed,
        "next_machine_call_endpoint": next_endpoint,
        "stop_rules_count": len(stop_rules) if isinstance(stop_rules, list) else 0,
        "has_request_deep_analysis_after_verification_hint": (
            isinstance(next_allowed, list)
            and "request_deep_analysis_after_verification" in next_allowed
        ),
        "gate_allows_deep_analysis_now": gate_allows_deep_analysis_now,
        "machine_policy_decision": (
            "stop_before_deep_analysis"
            if not gate_allows_deep_analysis_now
            else "deep_analysis_allowed_by_verification_gate"
        ),
    }


def build_report(result: dict[str, Any]) -> str:
    def ok_text(ok: bool) -> str:
        return "OK" if ok else "FAIL"

    decision_rows = "\n".join(
        f"| {item['decision']} | {item['reason'].replace('|', '\\|')} | {item['action']} |"
        for item in result["machine_decisions"]
    )
    action_rows = "\n".join(
        f"| {action['tool']} | {action.get('kind')} | {action.get('http_status')} | {ok_text(action['ok'])} |"
        for action in result["actions"]
    )
    check_rows = "\n".join(
        f"| {check['name']} | {ok_text(check['ok'])} | {str(check.get('details', '')).replace('|', '\\|')} |"
        for check in result["checks"]
    )
    gate = result["verification_gate"]

    return f"""# MachineSignal - MCP Verification Gate Probe - 2026-06-10

## Result

Status: {result['status']}

OK: {result['ok']}

Mode: {result['mode']}

POST calls executed: {result['post_calls_executed']}

Max POST calls allowed: {result['max_post_calls_allowed']}

Verification product purchased in sandbox: `{result['purchase_summary'].get('product_code')}`

Deep Analysis purchase executed: {result['deep_analysis_purchase_executed']}

Real payment executed: {result['real_payment_executed']}

External contact executed: {result['external_contact_executed']}

## What This Validates

A buyer machine can stop after a cautious verification delivery instead of buying Deep Analysis immediately. This protects the machine-first commercial model from unnecessary spend and avoids pretending that every verification result is a green light.

## Verification Gate

- Verification verdict status: `{gate.get('verification_verdict_status')}`
- Next machine call endpoint: `{gate.get('next_machine_call_endpoint')}`
- Gate allows Deep Analysis now: `{gate.get('gate_allows_deep_analysis_now')}`
- Machine policy decision: `{gate.get('machine_policy_decision')}`
- Stop rules count: `{gate.get('stop_rules_count')}`

## Machine Decisions

| Decision | Reason | Action |
|---|---|---|
{decision_rows}

## Tool Calls

| Tool | Kind | HTTP | Result |
|---|---|---:|---|
{action_rows}

## Checks

| Check | Result | Details |
|---|---|---|
{check_rows}

## Guardrails

- One sandbox customer only.
- One score call only.
- One verification purchase intent only.
- No Deep Analysis purchase when verification is cautious.
- No real payment.
- No invoice.
- No external contact.
- No external publication.
- No human outreach.
"""


def run_probe() -> dict[str, Any]:
    checks: list[dict[str, Any]] = []
    actions: list[dict[str, Any]] = []
    machine_decisions: list[dict[str, str]] = []
    post_calls = 0
    deep_analysis_purchase_executed = False

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
    run_id = f"mcp-verification-gate-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}-{int(time.time())}"
    sandbox: dict[str, Any] = {}
    score: dict[str, Any] = {}
    purchase: dict[str, Any] = {}
    order: dict[str, Any] = {}
    usage: dict[str, Any] = {}

    try:
        init = client.request(
            "initialize",
            {
                "protocolVersion": "2024-11-05",
                "capabilities": {},
                "clientInfo": {"name": "machinesignal-mcp-verification-gate-probe", "version": "2026-06-10"},
            },
        )
        check("mcp_initialize", safe_get(init, "serverInfo", "name") == "machinesignal-local-mcp-adapter", str(init.get("serverInfo")))
        client.notify("notifications/initialized")

        tools = client.request("tools/list").get("tools") or []
        tool_names = {tool.get("name") for tool in tools}
        required = {
            "create_sandbox_customer",
            "score_lead_opportunity",
            "create_purchase_intent",
            "get_order",
            "get_usage",
        }
        check("required_tools_present", required.issubset(tool_names), f"tools={len(tools)}; missing={sorted(required - tool_names)}")

        decide(
            "start_sandbox",
            "The buyer machine needs a temporary environment before evaluating paid add-ons.",
            "create_sandbox_customer",
        )
        sandbox = client.call_tool(
            "create_sandbox_customer",
            {
                "evaluator_id": run_id,
                "use_case": "MCP verification gate probe: stop before deep analysis unless verification is positive",
                "metadata": {"mode": "mcp_verification_gate_probe", "max_post_calls": MAX_POST_CALLS},
            },
        )
        post_calls += 1
        record("create_sandbox_customer", sandbox, "POST/write")
        check("sandbox_created", sandbox.get("ok") is True, f"HTTP {sandbox.get('http_status')}")

        decide(
            "score_target",
            "The machine must receive a score and routing recommendation before buying any add-on.",
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
        score_decision = safe_get(score, "payload", "decision")
        next_product = safe_get(score, "payload", "next_purchase", "next_product")
        check("score_created", score.get("ok") is True, f"HTTP {score.get('http_status')}; decision={score_decision}")
        check("score_requires_verification", score_decision == "needs_verification" and next_product == "verification", f"decision={score_decision}; next={next_product}")

        decide(
            "buy_verification_only",
            "The score requires verification, so the machine buys exactly one verification and no higher-cost product.",
            "create_purchase_intent verification",
        )
        purchase = client.call_tool(
            "create_purchase_intent",
            {
                "product_code": "verification",
                "domain": safe_get(score, "payload", "domain") or "premium-dental-conversion-gap.it",
                "commercial_objective": "website-led commercial opportunity and CRM-ready follow-up preparation",
                "batch_id": run_id,
                "reason": "Verification gate probe follows needs_verification before any deep analysis spend.",
                "source_score_request_id": f"{run_id}-score-001",
                "idempotency_key": f"{run_id}-verification",
            },
        )
        post_calls += 1
        record("create_purchase_intent", purchase, "POST/write")
        check("verification_purchase_created", purchase.get("ok") is True, f"HTTP {purchase.get('http_status')}")

        order_id = first_order_id(purchase)
        if order_id:
            order = client.call_tool("get_order", {"order_intent_id": order_id})
            record("get_order", order, "GET/read")
            check("verification_order_retrieved", order.get("ok") is True, f"HTTP {order.get('http_status')}; order_id={order_id}")
        else:
            check("verification_order_retrieved", False, "missing order id")

        delivery = extract_delivery(order or purchase)
        gate = delivery_gate_summary(delivery)
        check("verification_delivery_present", gate["delivery_present"], str(gate))
        check("verification_verdict_cautious", gate["verification_verdict_status"] == "keep_with_caution", f"verdict={gate['verification_verdict_status']}")
        check("verification_gate_does_not_allow_deep_analysis_now", gate["gate_allows_deep_analysis_now"] is False, str(gate))
        check("machine_stops_before_deep_analysis", deep_analysis_purchase_executed is False, "No deep_analysis tool call executed.")

        decide(
            "stop_before_deep_analysis",
            "Verification returned keep_with_caution and points the machine back to scoring after new/corrected evidence, not to immediate purchase-intent.",
            "no deep_analysis purchase",
        )

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
    finally:
        client.close()

    delivery = extract_delivery(order or purchase)
    gate = delivery_gate_summary(delivery)
    result = {
        "artifact": "mcp_verification_gate_probe",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "status": "completed_mcp_verification_gate_probe",
        "ok": all(item["ok"] for item in checks),
        "mode": "McpVerificationGateProbeWriteCapped",
        "primary_customer_interface": "machine",
        "max_post_calls_allowed": MAX_POST_CALLS,
        "post_calls_executed": post_calls,
        "write_calls_executed": post_calls,
        "deep_analysis_purchase_executed": deep_analysis_purchase_executed,
        "machine_decisions": machine_decisions,
        "actions": actions,
        "score_summary": {
            "domain": safe_get(score, "payload", "domain"),
            "opportunity_score": safe_get(score, "payload", "opportunity_score"),
            "confidence": safe_get(score, "payload", "confidence"),
            "decision": safe_get(score, "payload", "decision"),
            "recommended_product": safe_get(score, "payload", "next_purchase", "next_product"),
        },
        "purchase_summary": {
            "product_code": "verification",
            "http_status": purchase.get("http_status"),
            "order_intent_id": first_order_id(purchase),
            "created": purchase.get("ok") is True,
        },
        "verification_gate": gate,
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
            "competitive_learning_experiment": "MCP verification gate probe",
            "lesson_learned": (
                "The buyer machine correctly stops before Deep Analysis when verification returns keep_with_caution. "
                "The next product improvement is a server-side optional Deep Analysis gate tied to a positive verification order."
            ),
            "recommended_next_step": "Add and test an optional server-side source_verification_order_intent_id gate for Deep Analysis.",
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
