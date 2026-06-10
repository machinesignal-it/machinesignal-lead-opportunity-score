#!/usr/bin/env python3
"""
MachineSignal MCP positive Verification -> Deep Analysis probe.

This probe validates the live positive gate path:
- create or reuse a sandbox customer through the MCP adapter;
- buy one sandbox Verification fixture on a .test domain;
- verify the verdict is verified_for_deep_analysis;
- buy Deep Analysis with source_verification_order_intent_id;
- verify the gate passes and exactly one Deep Analysis credit is consumed.
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
    extract_delivery,
)
from mcp_purchase_decision_probe_20260610 import (  # noqa: E402
    McpClient,
    first_order_id,
    redact_for_report,
    safe_get,
)


OUTPUT_JSON = REPO_DIR / "mcp_positive_verification_deep_analysis_probe_summary_20260610.json"
OUTPUT_MD = REPO_DIR / "mcp_positive_verification_deep_analysis_probe_report_20260610.md"
MAX_POST_CALLS = 5
POSITIVE_DOMAIN = "verified-deep-analysis-ready.test"


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

    return f"""# MachineSignal - MCP Positive Verification Deep Analysis Probe - 2026-06-10

## Result

Status: {result['status']}

OK: {result['ok']}

Mode: {result['mode']}

POST calls executed: {result['post_calls_executed']}

Max POST calls allowed: {result['max_post_calls_allowed']}

Verification order: `{result['verification_order_intent_id']}`

Verification verdict: `{result['verification_verdict_status']}`

Deep Analysis order: `{result['deep_analysis_order_intent_id']}`

Deep Analysis gate passed: {result['deep_analysis_gate_passed']}

Deep Analysis credits used before: {result['deep_analysis_credits_used_before']}

Deep Analysis credits used after: {result['deep_analysis_credits_used_after']}

Real payment executed: {result['real_payment_executed']}

External contact executed: {result['external_contact_executed']}

## What This Validates

A buyer machine can move from a positive sandbox Verification delivery to a Deep Analysis purchase by passing `source_verification_order_intent_id`. The live API accepts the request, records the passed gate and consumes exactly one Deep Analysis credit.

## Tool Calls

| Tool | Kind | HTTP | Result |
|---|---|---:|---|
{action_rows}

## Checks

| Check | Result | Details |
|---|---|---|
{check_rows}

## Guardrails

- Synthetic `.test` sandbox fixture only.
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
    run_id = f"mcp-positive-verification-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}-{int(time.time())}"

    try:
        init = client.request(
            "initialize",
            {
                "protocolVersion": "2024-11-05",
                "capabilities": {},
                "clientInfo": {
                    "name": "machinesignal-mcp-positive-verification-deep-analysis-probe",
                    "version": "2026-06-10",
                },
            },
        )
        check("mcp_initialize", safe_get(init, "serverInfo", "name") == "machinesignal-local-mcp-adapter", str(init.get("serverInfo")))
        client.notify("notifications/initialized")

        tools = client.request("tools/list").get("tools") or []
        tool_names = {tool.get("name") for tool in tools}
        required = {"create_sandbox_customer", "create_purchase_intent", "get_order", "get_usage"}
        check("required_tools_present", required.issubset(tool_names), f"tools={len(tools)}; missing={sorted(required - tool_names)}")

        sandbox = client.call_tool(
            "create_sandbox_customer",
            {
                "evaluator_id": run_id,
                "use_case": "MCP positive Verification to Deep Analysis gate probe",
                "metadata": {"mode": "mcp_positive_verification_deep_analysis_probe", "max_post_calls": MAX_POST_CALLS},
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
                            "name": "machinesignal-mcp-positive-verification-deep-analysis-probe",
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

        verification = client.call_tool(
            "create_purchase_intent",
            {
                "product_code": "verification",
                "domain": POSITIVE_DOMAIN,
                "verification_fixture": "positive_for_deep_analysis",
                "commercial_objective": "sandbox validation of positive Verification gate before Deep Analysis",
                "batch_id": run_id,
                "reason": "Positive sandbox fixture validates the allowed Deep Analysis path.",
                "source_score_request_id": f"{run_id}-score-fixture",
                "idempotency_key": f"{run_id}-positive-verification",
            },
        )
        post_calls += 1
        record("create_purchase_intent positive verification", verification, "POST/write")
        check("positive_verification_created", verification.get("ok") is True, f"HTTP {verification.get('http_status')}")

        verification_order_id = first_order_id(verification)
        order = client.call_tool("get_order", {"order_intent_id": verification_order_id}) if verification_order_id else {}
        record("get_order verification", order, "GET/read")
        delivery = extract_delivery(order or verification)
        verdict_status = safe_get(delivery, "verification_verdict", "status")
        check("verification_order_retrieved", order.get("ok") is True, f"HTTP {order.get('http_status')}; order_id={verification_order_id}")
        check("verification_verdict_positive", verdict_status == "verified_for_deep_analysis", f"verdict={verdict_status}")
        check(
            "verification_points_to_purchase_intent",
            safe_get(delivery, "next_machine_call", "endpoint") == "/v1/purchase-intent",
            str(safe_get(delivery, "next_machine_call", default={})),
        )

        usage_before = client.call_tool("get_usage")
        record("get_usage before", usage_before, "GET/read")
        before_deep_used = int(balance_for(usage_before, "deep_analysis_pack_100").get("credits_used") or 0)
        check("usage_before_read", usage_before.get("ok") is True, f"HTTP {usage_before.get('http_status')}; deep_used={before_deep_used}")

        deep = client.call_tool(
            "create_purchase_intent",
            {
                "product_code": "deep_analysis",
                "domain": POSITIVE_DOMAIN,
                "sector_hint": "dentist",
                "commercial_objective": "sandbox validation of positive Verification gate before Deep Analysis",
                "source_verification_order_intent_id": verification_order_id,
                "reason": "Deep Analysis allowed after positive sandbox Verification.",
                "idempotency_key": f"{run_id}-deep-analysis-after-positive-verification",
            },
        )
        post_calls += 1
        record("create_purchase_intent deep_analysis allowed", deep, "POST/write")
        gate_passed = safe_get(deep, "payload", "deep_analysis_verification_gate", "passed") is True
        deep_order_id = first_order_id(deep)
        check("deep_analysis_created", deep.get("ok") is True and deep.get("http_status") == 200, f"HTTP {deep.get('http_status')}")
        check("deep_analysis_gate_passed", gate_passed, str(safe_get(deep, "payload", "deep_analysis_verification_gate", default={})))
        check(
            "deep_analysis_delivery_ready",
            safe_get(deep, "payload", "delivery", "delivery_type") == "deep_opportunity_analysis",
            str(safe_get(deep, "payload", "delivery", "delivery_type")),
        )

        usage_after = client.call_tool("get_usage")
        record("get_usage after", usage_after, "GET/read")
        after_deep_used = int(balance_for(usage_after, "deep_analysis_pack_100").get("credits_used") or 0)
        verification_used = int(balance_for(usage_after, "verification_pack_100").get("credits_used") or 0)
        check("usage_after_read", usage_after.get("ok") is True, f"HTTP {usage_after.get('http_status')}; deep_used={after_deep_used}")
        check("one_deep_analysis_credit_consumed", after_deep_used == before_deep_used + 1, f"before={before_deep_used}; after={after_deep_used}")
        check("verification_credit_consumed_once", verification_used == 1, f"verification_used={verification_used}")
        check("post_budget_respected", post_calls <= MAX_POST_CALLS, f"post_calls={post_calls}; max={MAX_POST_CALLS}")
        check(
            "no_real_payment_or_external_contact",
            safe_get(usage_after, "payload", "real_payment_executed") is False
            and safe_get(usage_after, "payload", "external_contact_executed") is False,
            f"payment={safe_get(usage_after, 'payload', 'real_payment_executed')}; contact={safe_get(usage_after, 'payload', 'external_contact_executed')}",
        )

        result = {
            "artifact": "mcp_positive_verification_deep_analysis_probe",
            "status": "completed_mcp_positive_verification_deep_analysis_probe",
            "ok": all(item["ok"] for item in checks),
            "evidence_date": "2026-06-10",
            "mode": "McpPositiveVerificationDeepAnalysisProbeWriteCapped",
            "primary_customer_interface": "machine",
            "max_post_calls_allowed": MAX_POST_CALLS,
            "post_calls_executed": post_calls,
            "write_calls_executed": post_calls,
            "domain": POSITIVE_DOMAIN,
            "verification_order_intent_id": verification_order_id,
            "verification_verdict_status": verdict_status,
            "deep_analysis_order_intent_id": deep_order_id,
            "deep_analysis_gate_passed": gate_passed,
            "deep_analysis_credits_used_before": before_deep_used,
            "deep_analysis_credits_used_after": after_deep_used,
            "verification_credits_used_after": verification_used,
            "real_payment_executed": False,
            "external_contact_executed": False,
            "real_invoice_issued": False,
            "payment_test_created": False,
            "external_publication_executed": False,
            "human_outreach_executed": False,
            "production_api_key_published": False,
            "machine_decision": "positive_verification_allows_deep_analysis",
            "interpretation": (
                "A machine can buy Deep Analysis after a positive sandbox Verification source; "
                "the live API records a passed gate and consumes exactly one Deep Analysis credit."
            ),
            "recommended_next_step": "Keep both negative and positive gate probes in the monitor; next test should cover Action Pack only after accepted Deep Analysis.",
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
    print(json.dumps({"ok": result["ok"], "status": result["status"], "json": str(OUTPUT_JSON), "report": str(OUTPUT_MD)}, indent=2))
    return 0 if result["ok"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
