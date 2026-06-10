#!/usr/bin/env python3
"""
MachineSignal MCP Deep Analysis -> Action Pack gate probe.

This probe validates the live Action Pack purchase gate:
- create or reuse a sandbox customer through the MCP adapter;
- prove Action Pack without source_order_intent_id is blocked;
- buy one sandbox Deep Analysis delivery;
- buy Action Pack with source_order_intent_id from that Deep Analysis;
- verify the gate passes and exactly one Action Pack credit is consumed.
"""

from __future__ import annotations

import json
import os
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


REPO_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(Path(__file__).resolve().parent))

from mcp_deep_analysis_verification_gate_probe_20260610 import (  # noqa: E402
    balance_for,
    direct_create_sandbox_customer,
)
from mcp_purchase_decision_probe_20260610 import (  # noqa: E402
    McpClient,
    first_order_id,
    redact_for_report,
    safe_get,
)


OUTPUT_JSON = REPO_DIR / "mcp_action_pack_deep_analysis_gate_probe_summary_20260610.json"
OUTPUT_MD = REPO_DIR / "mcp_action_pack_deep_analysis_gate_probe_report_20260610.md"
MAX_POST_CALLS = 5
DOMAIN = "action-pack-deep-analysis-ready.test"


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

    return f"""# MachineSignal - MCP Action Pack Deep Analysis Gate Probe - 2026-06-10

## Result

Status: {result['status']}

OK: {result['ok']}

Mode: {result['mode']}

POST calls executed: {result['post_calls_executed']}

Max POST calls allowed: {result['max_post_calls_allowed']}

Blocked Action Pack error: `{result['blocked_action_pack_error']}`

Deep Analysis order: `{result['deep_analysis_order_intent_id']}`

Action Pack order: `{result['action_pack_order_intent_id']}`

Action Pack gate passed: {result['action_pack_gate_passed']}

Action Pack credits used before blocked attempt: {result['action_pack_credits_used_before']}

Action Pack credits used after blocked attempt: {result['action_pack_credits_used_after_blocked_attempt']}

Action Pack credits used after valid purchase: {result['action_pack_credits_used_after_valid_purchase']}

Real payment executed: {result['real_payment_executed']}

External contact executed: {result['external_contact_executed']}

## What This Validates

A buyer machine cannot buy Action Pack without a valid `source_order_intent_id`. The same machine can buy Action Pack after a same-domain accepted Deep Analysis order. The live API records the passed gate and consumes exactly one Action Pack credit.

## Tool Calls

| Tool | Kind | HTTP | Result |
|---|---|---:|---|
{action_rows}

## Checks

| Check | Result | Details |
|---|---|---|
{check_rows}

## Guardrails

- Synthetic `.test` sandbox domain only.
- No real payment.
- No invoice.
- No external contact.
- No external publication.
- No human outreach.
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
    run_id = f"mcp-action-pack-gate-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}-{int(time.time())}"

    try:
        init = client.request(
            "initialize",
            {
                "protocolVersion": "2024-11-05",
                "capabilities": {},
                "clientInfo": {
                    "name": "machinesignal-mcp-action-pack-deep-analysis-gate-probe",
                    "version": "2026-06-10",
                },
            },
        )
        check(
            "mcp_initialize",
            safe_get(init, "serverInfo", "name") == "machinesignal-local-mcp-adapter",
            str(init.get("serverInfo")),
        )
        client.notify("notifications/initialized")

        tools = client.request("tools/list").get("tools") or []
        tool_names = {tool.get("name") for tool in tools}
        required = {"create_sandbox_customer", "create_purchase_intent", "get_order", "get_usage"}
        check("required_tools_present", required.issubset(tool_names), f"tools={len(tools)}; missing={sorted(required - tool_names)}")

        sandbox = client.call_tool(
            "create_sandbox_customer",
            {
                "evaluator_id": run_id,
                "use_case": "MCP Deep Analysis to Action Pack gate probe",
                "metadata": {"mode": "mcp_action_pack_deep_analysis_gate_probe", "max_post_calls": MAX_POST_CALLS},
            },
        )
        post_calls += 1
        record("create_sandbox_customer", sandbox, "POST/write")
        if sandbox.get("http_status") == 429 and sandbox.get("ok") is not True:
            check(
                "sandbox_mcp_create_rate_limited",
                True,
                "MCP adapter fingerprint reached the daily sandbox creation limit; using direct machine fallback for sandbox creation only.",
            )
            fallback = direct_create_sandbox_customer(run_id)
            post_calls += 1
            record("direct_create_sandbox_customer fallback", fallback, "POST/write")
            api_key = safe_get(fallback, "payload", "api_key")
            if isinstance(api_key, str) and api_key:
                os.environ["MACHINESIGNAL_CUSTOMER_API_KEY"] = api_key
                client.close()
                client = McpClient()
                init = client.request(
                    "initialize",
                    {
                        "protocolVersion": "2024-11-05",
                        "capabilities": {},
                        "clientInfo": {
                            "name": "machinesignal-mcp-action-pack-deep-analysis-gate-probe",
                            "version": "2026-06-10",
                        },
                    },
                )
                client.notify("notifications/initialized")
                check(
                    "mcp_reinitialized_with_precreated_sandbox_key",
                    safe_get(init, "serverInfo", "name") == "machinesignal-local-mcp-adapter",
                    "fallback sandbox key stored in adapter memory through environment",
                )
                sandbox = fallback
        check("sandbox_created", sandbox.get("ok") is True, f"HTTP {sandbox.get('http_status')}")

        usage_before = client.call_tool("get_usage")
        record("get_usage before", usage_before, "GET/read")
        before_action_used = int(balance_for(usage_before, "action_pack_25").get("credits_used") or 0)
        before_deep_used = int(balance_for(usage_before, "deep_analysis_pack_100").get("credits_used") or 0)
        check("usage_before_read", usage_before.get("ok") is True, f"HTTP {usage_before.get('http_status')}; action_used={before_action_used}; deep_used={before_deep_used}")

        blocked_action = client.call_tool(
            "create_purchase_intent",
            {
                "product_code": "action_pack",
                "domain": DOMAIN,
                "source_score_request_id": f"{run_id}-score-fixture",
                "reason": "Expected block: Action Pack without Deep Analysis source.",
                "idempotency_key": f"{run_id}-blocked-action-pack",
            },
        )
        post_calls += 1
        record("create_purchase_intent action_pack without source", blocked_action, "POST/write")
        blocked_error = safe_get(blocked_action, "payload", "error")
        check(
            "action_pack_without_deep_analysis_blocked",
            blocked_action.get("http_status") == 400 and blocked_error == "action_pack_gate_failed",
            f"HTTP {blocked_action.get('http_status')}; error={blocked_error}",
        )

        usage_after_blocked = client.call_tool("get_usage")
        record("get_usage after blocked action_pack", usage_after_blocked, "GET/read")
        after_blocked_action_used = int(balance_for(usage_after_blocked, "action_pack_25").get("credits_used") or 0)
        check(
            "blocked_action_pack_consumes_no_credit",
            after_blocked_action_used == before_action_used,
            f"before={before_action_used}; after_blocked={after_blocked_action_used}",
        )

        deep = client.call_tool(
            "create_purchase_intent",
            {
                "product_code": "deep_analysis",
                "domain": DOMAIN,
                "sector_hint": "dentist",
                "commercial_objective": "sandbox validation of Deep Analysis source before Action Pack",
                "source_score_request_id": f"{run_id}-score-fixture",
                "reason": "Deep Analysis source required before Action Pack.",
                "idempotency_key": f"{run_id}-deep-analysis-source",
            },
        )
        post_calls += 1
        record("create_purchase_intent deep_analysis source", deep, "POST/write")
        deep_order_id = first_order_id(deep)
        deep_delivery_type = safe_get(deep, "payload", "delivery", "delivery_type")
        deep_delivery_status = safe_get(deep, "payload", "delivery", "status")
        deep_gate_present = safe_get(deep, "payload", "delivery", "action_pack_purchase_gate") is not None
        check(
            "deep_analysis_source_created",
            deep.get("ok") is True and deep.get("http_status") == 200 and bool(deep_order_id),
            f"HTTP {deep.get('http_status')}; order_id={deep_order_id}",
        )
        check(
            "deep_analysis_ready_for_action_pack",
            deep_delivery_type == "deep_opportunity_analysis" and deep_delivery_status == "deep_analysis_ready" and deep_gate_present,
            f"type={deep_delivery_type}; status={deep_delivery_status}; gate_present={deep_gate_present}",
        )

        action = client.call_tool(
            "create_purchase_intent",
            {
                "product_code": "action_pack",
                "domain": DOMAIN,
                "source_score_request_id": f"{run_id}-score-fixture",
                "source_order_intent_id": deep_order_id,
                "reason": "Valid Action Pack purchase after accepted same-domain Deep Analysis.",
                "idempotency_key": f"{run_id}-valid-action-pack",
            },
        )
        post_calls += 1
        record("create_purchase_intent action_pack with deep_analysis source", action, "POST/write")
        action_order_id = first_order_id(action)
        action_gate = safe_get(action, "payload", "action_pack_gate", default={})
        action_gate_passed = safe_get(action, "payload", "action_pack_gate", "passed") is True
        action_delivery_type = safe_get(action, "payload", "delivery", "delivery_type")
        action_delivery_status = safe_get(action, "payload", "delivery", "status")
        check(
            "action_pack_created_after_deep_analysis",
            action.get("ok") is True and action.get("http_status") == 200 and bool(action_order_id),
            f"HTTP {action.get('http_status')}; order_id={action_order_id}",
        )
        check("action_pack_gate_passed", action_gate_passed, str(action_gate))
        check(
            "action_pack_delivery_ready",
            action_delivery_type == "action_pack" and action_delivery_status == "action_pack_ready",
            f"type={action_delivery_type}; status={action_delivery_status}",
        )
        check(
            "action_pack_blocks_external_contact_by_default",
            safe_get(action, "payload", "delivery", "approval_gate", "default_state") == "blocked"
            and safe_get(action, "payload", "delivery", "audit_event", "external_contact_executed") is False,
            f"default={safe_get(action, 'payload', 'delivery', 'approval_gate', 'default_state')}; contact={safe_get(action, 'payload', 'delivery', 'audit_event', 'external_contact_executed')}",
        )

        usage_after = client.call_tool("get_usage")
        record("get_usage after valid action_pack", usage_after, "GET/read")
        after_action_used = int(balance_for(usage_after, "action_pack_25").get("credits_used") or 0)
        after_deep_used = int(balance_for(usage_after, "deep_analysis_pack_100").get("credits_used") or 0)
        check("usage_after_read", usage_after.get("ok") is True, f"HTTP {usage_after.get('http_status')}; action_used={after_action_used}; deep_used={after_deep_used}")
        check("one_deep_analysis_credit_consumed", after_deep_used == before_deep_used + 1, f"before={before_deep_used}; after={after_deep_used}")
        check("one_action_pack_credit_consumed", after_action_used == before_action_used + 1, f"before={before_action_used}; after={after_action_used}")
        check("post_budget_respected", post_calls <= MAX_POST_CALLS, f"post_calls={post_calls}; max={MAX_POST_CALLS}")
        check(
            "no_real_payment_or_external_contact",
            safe_get(usage_after, "payload", "real_payment_executed") is False
            and safe_get(usage_after, "payload", "external_contact_executed") is False,
            f"payment={safe_get(usage_after, 'payload', 'real_payment_executed')}; contact={safe_get(usage_after, 'payload', 'external_contact_executed')}",
        )

        result = {
            "artifact": "mcp_action_pack_deep_analysis_gate_probe",
            "status": "completed_mcp_action_pack_deep_analysis_gate_probe",
            "ok": all(item["ok"] for item in checks),
            "evidence_date": "2026-06-10",
            "mode": "McpActionPackDeepAnalysisGateProbeWriteCapped",
            "primary_customer_interface": "machine",
            "max_post_calls_allowed": MAX_POST_CALLS,
            "post_calls_executed": post_calls,
            "write_calls_executed": post_calls,
            "domain": DOMAIN,
            "blocked_action_pack_error": blocked_error,
            "deep_analysis_order_intent_id": deep_order_id,
            "action_pack_order_intent_id": action_order_id,
            "action_pack_gate_passed": action_gate_passed,
            "action_pack_credits_used_before": before_action_used,
            "action_pack_credits_used_after_blocked_attempt": after_blocked_action_used,
            "action_pack_credits_used_after_valid_purchase": after_action_used,
            "deep_analysis_credits_used_before": before_deep_used,
            "deep_analysis_credits_used_after": after_deep_used,
            "real_payment_executed": False,
            "external_contact_executed": False,
            "real_invoice_issued": False,
            "payment_test_created": False,
            "external_publication_executed": False,
            "human_outreach_executed": False,
            "production_api_key_published": False,
            "machine_decision": "accepted_deep_analysis_allows_action_pack",
            "interpretation": (
                "A machine cannot buy Action Pack without a valid Deep Analysis source; "
                "after accepted same-domain Deep Analysis, the live API records a passed gate "
                "and consumes exactly one Action Pack credit."
            ),
            "recommended_next_step": "Keep this gate probe in the monitor; next test should cover ledger durability and replay/idempotency across the full machine purchase ladder.",
            "actions": redact_for_report(actions),
            "checks": checks,
            "usage_summary": {
                "http_status": usage_after.get("http_status"),
                "ledger_backend": safe_get(usage_after, "payload", "ledger_backend"),
                "real_payment_executed": safe_get(usage_after, "payload", "real_payment_executed"),
                "external_contact_executed": safe_get(usage_after, "payload", "external_contact_executed"),
            },
        }
        return result
    finally:
        client.close()


def main() -> int:
    result = run_probe()
    OUTPUT_JSON.write_text(json.dumps(result, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    OUTPUT_MD.write_text(build_report(result), encoding="utf-8")
    print(
        json.dumps(
            {
                "ok": result["ok"],
                "status": result["status"],
                "json": str(OUTPUT_JSON),
                "report": str(OUTPUT_MD),
            },
            indent=2,
        )
    )
    return 0 if result["ok"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
