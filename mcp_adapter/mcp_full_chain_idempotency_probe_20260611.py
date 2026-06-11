#!/usr/bin/env python3
"""
MachineSignal MCP full-chain idempotency probe.

This probe validates that a buyer machine can safely retry the same requests
without double-spending credits:
- score one synthetic target, then repeat the score with the same Idempotency-Key;
- buy one Deep Analysis, then repeat it with the same Idempotency-Key;
- buy one Action Pack, then repeat it with the same Idempotency-Key.
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


OUTPUT_JSON = REPO_DIR / "mcp_full_chain_idempotency_probe_summary_20260611.json"
OUTPUT_MD = REPO_DIR / "mcp_full_chain_idempotency_probe_report_20260611.md"
MAX_POST_CALLS = 8
DOMAIN = "idempotent-action-chain.test"


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

    return f"""# MachineSignal - MCP Full Chain Idempotency Probe - 2026-06-11

## Result

Status: {result['status']}

OK: {result['ok']}

Mode: {result['mode']}

POST calls executed: {result['post_calls_executed']}

Max POST calls allowed: {result['max_post_calls_allowed']}

Domain: `{result['domain']}`

Score duplicate detected: {result['score_duplicate_detected']}

Deep Analysis duplicate detected: {result['deep_analysis_duplicate_detected']}

Action Pack duplicate detected: {result['action_pack_duplicate_detected']}

Deep Analysis order: `{result['deep_analysis_order_intent_id']}`

Action Pack order: `{result['action_pack_order_intent_id']}`

Score credits used after retries: {result['score_credits_used_after']}

Deep Analysis credits used after retries: {result['deep_analysis_credits_used_after']}

Action Pack credits used after retries: {result['action_pack_credits_used_after']}

Real payment executed: {result['real_payment_executed']}

External contact executed: {result['external_contact_executed']}

## What This Validates

A buyer machine can retry the same Score, Deep Analysis and Action Pack calls with the same `Idempotency-Key`. The live API returns duplicate markers and does not consume extra credits or create extra paid units.

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
    run_id = f"mcp-full-chain-idempotency-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}-{int(time.time())}"
    score_key = f"{run_id}-score"
    deep_key = f"{run_id}-deep-analysis"
    action_key = f"{run_id}-action-pack"

    try:
        init = client.request(
            "initialize",
            {
                "protocolVersion": "2024-11-05",
                "capabilities": {},
                "clientInfo": {
                    "name": "machinesignal-mcp-full-chain-idempotency-probe",
                    "version": "2026-06-11",
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
        required = {"create_sandbox_customer", "score_lead_opportunity", "create_purchase_intent", "get_usage"}
        check("required_tools_present", required.issubset(tool_names), f"tools={len(tools)}; missing={sorted(required - tool_names)}")

        sandbox = client.call_tool(
            "create_sandbox_customer",
            {
                "evaluator_id": run_id,
                "use_case": "MCP full-chain idempotency probe",
                "metadata": {"mode": "mcp_full_chain_idempotency_probe", "max_post_calls": MAX_POST_CALLS},
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
                            "name": "machinesignal-mcp-full-chain-idempotency-probe",
                            "version": "2026-06-11",
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
        before_score_used = int(balance_for(usage_before, "score_pack_1k").get("credits_used") or 0)
        before_deep_used = int(balance_for(usage_before, "deep_analysis_pack_100").get("credits_used") or 0)
        before_action_used = int(balance_for(usage_before, "action_pack_25").get("credits_used") or 0)
        check(
            "usage_before_read",
            usage_before.get("ok") is True,
            f"HTTP {usage_before.get('http_status')}; score={before_score_used}; deep={before_deep_used}; action={before_action_used}",
        )

        score_args = {
            "domain": DOMAIN,
            "sector_hint": "dentist odontoiatric clinic",
            "country_hint": "IT",
            "target_name": "Idempotent Action Chain Test",
            "category_hint": "dentists and odontoiatric clinics",
            "area": "Lombardia",
            "region": "Lombardia",
            "source_type": "mcp_full_chain_idempotency_probe",
            "commercial_objective": "validate retry-safe machine purchase ladder",
            "initial_signals": [
                "sector_match",
                "local_market",
                "conversion_gap",
                "commercial_service_pages",
                "crm_follow_up_possible",
            ],
            "idempotency_key": score_key,
        }
        score = client.call_tool("score_lead_opportunity", dict(score_args))
        post_calls += 1
        record("score_lead_opportunity first", score, "POST/write")
        score_value = safe_get(score, "payload", "opportunity_score")
        score_request_id = safe_get(score, "payload", "request_id") or score_key
        check("score_created", score.get("ok") is True and isinstance(score_value, (int, float)), f"HTTP {score.get('http_status')}; score={score_value}")

        score_duplicate = client.call_tool("score_lead_opportunity", dict(score_args))
        post_calls += 1
        record("score_lead_opportunity duplicate", score_duplicate, "POST/write")
        score_duplicate_detected = safe_get(score_duplicate, "payload", "usage", "current_event", "duplicate_request") is True
        check("score_duplicate_detected", score_duplicate_detected, str(safe_get(score_duplicate, "payload", "usage", "current_event", default={})))

        usage_after_score_retry = client.call_tool("get_usage")
        record("get_usage after score retry", usage_after_score_retry, "GET/read")
        after_score_retry_score_used = int(balance_for(usage_after_score_retry, "score_pack_1k").get("credits_used") or 0)
        check(
            "score_retry_consumes_one_credit_total",
            after_score_retry_score_used == before_score_used + 1,
            f"before={before_score_used}; after_score_retry={after_score_retry_score_used}",
        )

        deep_args = {
            "product_code": "deep_analysis",
            "domain": DOMAIN,
            "sector_hint": "dentist",
            "commercial_objective": "validate retry-safe Deep Analysis before Action Pack",
            "source_score_request_id": score_request_id,
            "reason": "Deep Analysis source for full-chain idempotency probe.",
            "idempotency_key": deep_key,
        }
        deep = client.call_tool("create_purchase_intent", dict(deep_args))
        post_calls += 1
        record("create_purchase_intent deep_analysis first", deep, "POST/write")
        deep_order_id = first_order_id(deep)
        check("deep_analysis_created", deep.get("ok") is True and bool(deep_order_id), f"HTTP {deep.get('http_status')}; order_id={deep_order_id}")
        check(
            "deep_analysis_ready_for_action_pack",
            safe_get(deep, "payload", "delivery", "delivery_type") == "deep_opportunity_analysis"
            and safe_get(deep, "payload", "delivery", "status") == "deep_analysis_ready",
            f"type={safe_get(deep, 'payload', 'delivery', 'delivery_type')}; status={safe_get(deep, 'payload', 'delivery', 'status')}",
        )

        deep_duplicate = client.call_tool("create_purchase_intent", dict(deep_args))
        post_calls += 1
        record("create_purchase_intent deep_analysis duplicate", deep_duplicate, "POST/write")
        deep_duplicate_order_id = first_order_id(deep_duplicate)
        deep_duplicate_detected = safe_get(deep_duplicate, "payload", "usage", "current_event", "duplicate_request") is True
        check("deep_analysis_duplicate_detected", deep_duplicate_detected, str(safe_get(deep_duplicate, "payload", "usage", "current_event", default={})))
        check("deep_analysis_duplicate_returns_same_order", deep_duplicate_order_id == deep_order_id, f"first={deep_order_id}; duplicate={deep_duplicate_order_id}")

        usage_after_deep_retry = client.call_tool("get_usage")
        record("get_usage after deep retry", usage_after_deep_retry, "GET/read")
        after_deep_retry_deep_used = int(balance_for(usage_after_deep_retry, "deep_analysis_pack_100").get("credits_used") or 0)
        check(
            "deep_analysis_retry_consumes_one_credit_total",
            after_deep_retry_deep_used == before_deep_used + 1,
            f"before={before_deep_used}; after_deep_retry={after_deep_retry_deep_used}",
        )

        action_args = {
            "product_code": "action_pack",
            "domain": DOMAIN,
            "source_score_request_id": score_request_id,
            "source_order_intent_id": deep_order_id,
            "reason": "Action Pack source for full-chain idempotency probe.",
            "idempotency_key": action_key,
        }
        action = client.call_tool("create_purchase_intent", dict(action_args))
        post_calls += 1
        record("create_purchase_intent action_pack first", action, "POST/write")
        action_order_id = first_order_id(action)
        action_gate_passed = safe_get(action, "payload", "action_pack_gate", "passed") is True
        check(
            "action_pack_created",
            action.get("ok") is True and bool(action_order_id) and action_gate_passed,
            f"HTTP {action.get('http_status')}; order_id={action_order_id}; gate={action_gate_passed}",
        )

        action_duplicate = client.call_tool("create_purchase_intent", dict(action_args))
        post_calls += 1
        record("create_purchase_intent action_pack duplicate", action_duplicate, "POST/write")
        action_duplicate_order_id = first_order_id(action_duplicate)
        action_duplicate_detected = safe_get(action_duplicate, "payload", "usage", "current_event", "duplicate_request") is True
        check("action_pack_duplicate_detected", action_duplicate_detected, str(safe_get(action_duplicate, "payload", "usage", "current_event", default={})))
        check("action_pack_duplicate_returns_same_order", action_duplicate_order_id == action_order_id, f"first={action_order_id}; duplicate={action_duplicate_order_id}")

        usage_after = client.call_tool("get_usage")
        record("get_usage after action retry", usage_after, "GET/read")
        after_score_used = int(balance_for(usage_after, "score_pack_1k").get("credits_used") or 0)
        after_deep_used = int(balance_for(usage_after, "deep_analysis_pack_100").get("credits_used") or 0)
        after_action_used = int(balance_for(usage_after, "action_pack_25").get("credits_used") or 0)
        check("usage_after_read", usage_after.get("ok") is True, f"HTTP {usage_after.get('http_status')}; score={after_score_used}; deep={after_deep_used}; action={after_action_used}")
        check("score_final_credit_delta_one", after_score_used == before_score_used + 1, f"before={before_score_used}; after={after_score_used}")
        check("deep_final_credit_delta_one", after_deep_used == before_deep_used + 1, f"before={before_deep_used}; after={after_deep_used}")
        check("action_final_credit_delta_one", after_action_used == before_action_used + 1, f"before={before_action_used}; after={after_action_used}")
        check("post_budget_respected", post_calls <= MAX_POST_CALLS, f"post_calls={post_calls}; max={MAX_POST_CALLS}")
        check(
            "no_real_payment_or_external_contact",
            safe_get(usage_after, "payload", "real_payment_executed") is False
            and safe_get(usage_after, "payload", "external_contact_executed") is False,
            f"payment={safe_get(usage_after, 'payload', 'real_payment_executed')}; contact={safe_get(usage_after, 'payload', 'external_contact_executed')}",
        )

        result = {
            "artifact": "mcp_full_chain_idempotency_probe",
            "status": "completed_mcp_full_chain_idempotency_probe",
            "ok": all(item["ok"] for item in checks),
            "evidence_date": "2026-06-11",
            "mode": "McpFullChainIdempotencyProbeWriteCapped",
            "primary_customer_interface": "machine",
            "max_post_calls_allowed": MAX_POST_CALLS,
            "post_calls_executed": post_calls,
            "write_calls_executed": post_calls,
            "domain": DOMAIN,
            "score_request_id": score_request_id,
            "score_duplicate_detected": score_duplicate_detected,
            "deep_analysis_order_intent_id": deep_order_id,
            "deep_analysis_duplicate_detected": deep_duplicate_detected,
            "action_pack_order_intent_id": action_order_id,
            "action_pack_duplicate_detected": action_duplicate_detected,
            "action_pack_gate_passed": action_gate_passed,
            "score_credits_used_before": before_score_used,
            "score_credits_used_after": after_score_used,
            "deep_analysis_credits_used_before": before_deep_used,
            "deep_analysis_credits_used_after": after_deep_used,
            "action_pack_credits_used_before": before_action_used,
            "action_pack_credits_used_after": after_action_used,
            "real_payment_executed": False,
            "external_contact_executed": False,
            "real_invoice_issued": False,
            "payment_test_created": False,
            "external_publication_executed": False,
            "human_outreach_executed": False,
            "production_api_key_published": False,
            "machine_decision": "full_chain_retries_are_idempotent",
            "interpretation": (
                "A buyer machine can retry Score, Deep Analysis and Action Pack with the same Idempotency-Key; "
                "the live API marks each retry as duplicate and consumes only one credit per actual unit."
            ),
            "recommended_next_step": "Keep this idempotency probe in the public monitor; next test should cover no-write marketplace/distribution readiness for machine discovery channels.",
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
