#!/usr/bin/env python3
"""
Audit the sandbox customer created by the Integration Ready external-agent test.

The admin key is read from MACHINESIGNAL_ADMIN_API_KEY at runtime and is never
written to the report.
"""

from __future__ import annotations

import json
import os
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime
from pathlib import Path
from typing import Any


REPO_DIR = Path(__file__).resolve().parent
SOURCE_SUMMARY_PATH = REPO_DIR / "integration_ready_external_agent_summary_20260603.json"
AUDIT_SUMMARY_PATH = REPO_DIR / "integration_ready_external_agent_ledger_audit_summary_20260603.json"
AUDIT_REPORT_PATH = REPO_DIR / "integration_ready_external_agent_ledger_audit_readout_20260603.md"
API_BASE = "https://machinesignal-api.beta-878.workers.dev"


SECRET_KEYS = {"api_key", "customer_api_key", "admin_api_key", "x-api-key", "token", "secret", "password"}


def safe_get(mapping: Any, *keys: str, default: Any = None) -> Any:
    cur = mapping
    for key in keys:
        if not isinstance(cur, dict):
            return default
        cur = cur.get(key)
    return default if cur is None else cur


def mask_secret(value: Any) -> Any:
    if not isinstance(value, str):
        return value
    if len(value) <= 12:
        return value[:3] + "..."
    return value[:10] + "..." + value[-4:]


def redact(value: Any) -> Any:
    if isinstance(value, dict):
        clean: dict[str, Any] = {}
        for key, item in value.items():
            key_lower = key.lower()
            if key_lower in SECRET_KEYS or key_lower.endswith("_key"):
                clean[key] = mask_secret(item)
            else:
                clean[key] = redact(item)
        return clean
    if isinstance(value, list):
        return [redact(item) for item in value]
    return value


def request_json(url: str, admin_key: str) -> tuple[int, Any]:
    req = urllib.request.Request(
        url,
        headers={
            "Accept": "application/json",
            "X-API-Key": admin_key,
            "User-Agent": "MachineSignalLedgerAudit/2026-06-03",
        },
        method="GET",
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            return int(response.status), json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        raw = exc.read().decode("utf-8", errors="replace")
        try:
            return int(exc.code), json.loads(raw)
        except json.JSONDecodeError:
            return int(exc.code), {"raw": raw}
    except urllib.error.URLError as exc:
        return 599, {"error": "url_error", "message": str(exc)}


def build_report(result: dict[str, Any]) -> str:
    def ok_text(value: bool) -> str:
        return "OK" if value else "FAIL"

    audit = result["audit"]
    lines = [
        "# MachineSignal - Integration Ready External Agent Ledger Audit",
        "",
        f"Finished at: {result['finished_at']}",
        "",
        "## Result",
        "",
        f"Status: {'passed' if result['ok'] else 'failed'}",
        "",
        f"Customer audited: `{result['customer_id']}`",
        f"Ledger backend: `{audit.get('ledger_backend')}`",
        f"Ledger persisted: `{audit.get('ledger_persisted')}`",
        "",
        "## Summary",
        "",
        f"- Total events: `{safe_get(audit, 'summary', 'total_events')}`",
        f"- Valid credit events: `{safe_get(audit, 'summary', 'valid_credit_events')}`",
        f"- Blocked events: `{safe_get(audit, 'summary', 'blocked_events')}`",
        f"- Orders: `{safe_get(audit, 'summary', 'order_count')}`",
        f"- Simulated beta revenue: `EUR {safe_get(audit, 'summary', 'simulated_revenue_eur')}`",
        f"- Reconciliation OK: `{safe_get(audit, 'summary', 'reconciliation_ok')}`",
        f"- Ready for real payments: `{safe_get(audit, 'summary', 'ready_for_real_payments')}`",
        "",
        "## Product Reconciliation",
        "",
        "| Product | Purchased | Used | Remaining | Events | Orders | Revenue EUR | Reconcile |",
        "|---|---:|---:|---:|---:|---:|---:|---|",
    ]
    for item in audit.get("product_reconciliation", []):
        lines.append(
            f"| {item.get('product_code')} | {item.get('credits_purchased')} | {item.get('credits_used')} | {item.get('credits_remaining')} | {item.get('valid_credit_events')} | {item.get('order_count')} | {item.get('simulated_revenue_eur')} | {ok_text(item.get('credits_reconcile') is True)} |"
        )

    lines.extend(
        [
            "",
            "## Safety",
            "",
            f"- Real payment executed: `{safe_get(audit, 'safety', 'real_payment_executed')}`",
            f"- External contact executed: `{safe_get(audit, 'safety', 'external_contact_executed')}`",
            f"- Payment guardrail OK: `{safe_get(audit, 'safety', 'beta_payment_guardrail_ok')}`",
            f"- External contact guardrail OK: `{safe_get(audit, 'safety', 'beta_external_contact_guardrail_ok')}`",
            "",
            "## Checks",
            "",
            "| Check | Result | Details |",
            "|---|---|---|",
        ]
    )
    for check in result["checks"]:
        lines.append(f"| {check['name']} | {ok_text(check['ok'])} | {check.get('details', '')} |")

    lines.extend(
        [
            "",
            "## Interpretation",
            "",
            "The external-agent test ledger reconciles on the Durable Object backend. This means the machine-to-machine flow is technically safe for controlled beta usage, while real payments must remain disabled until fiscal, legal and long-term audit controls are completed.",
        ]
    )
    return "\n".join(lines) + "\n"


def main() -> int:
    admin_key = os.environ.get("MACHINESIGNAL_ADMIN_API_KEY", "").strip()
    if not admin_key:
        raise RuntimeError("MACHINESIGNAL_ADMIN_API_KEY is required")

    source = json.loads(SOURCE_SUMMARY_PATH.read_text(encoding="utf-8"))
    customer_id = safe_get(source, "usage", "customer_id")
    if not customer_id:
        raise RuntimeError("Could not find customer_id in external-agent summary")

    url = f"{API_BASE}/v1/admin/audit-report?{urllib.parse.urlencode({'customer_id': customer_id})}"
    status, audit = request_json(url, admin_key)
    checks = [
        {"name": "audit_endpoint_http_200", "ok": status == 200, "details": f"HTTP {status}"},
        {
            "name": "ledger_backend_durable_object",
            "ok": safe_get(audit, "ledger_backend") == "durable_object",
            "details": str(safe_get(audit, "ledger_backend")),
        },
        {
            "name": "reconciliation_ok",
            "ok": safe_get(audit, "summary", "reconciliation_ok") is True,
            "details": str(safe_get(audit, "summary", "reconciliation_ok")),
        },
        {
            "name": "real_payments_still_disabled",
            "ok": safe_get(audit, "summary", "ready_for_real_payments") is False,
            "details": str(safe_get(audit, "summary", "ready_for_real_payments")),
        },
        {
            "name": "no_real_payment_executed",
            "ok": safe_get(audit, "safety", "real_payment_executed") is False,
            "details": str(safe_get(audit, "safety", "real_payment_executed")),
        },
        {
            "name": "no_external_contact_executed",
            "ok": safe_get(audit, "safety", "external_contact_executed") is False,
            "details": str(safe_get(audit, "safety", "external_contact_executed")),
        },
    ]
    result = {
        "ok": all(check["ok"] for check in checks),
        "test_name": "integration_ready_external_agent_ledger_audit",
        "finished_at": datetime.now().isoformat(timespec="seconds"),
        "customer_id": customer_id,
        "source_test_summary": str(SOURCE_SUMMARY_PATH),
        "checks": checks,
        "audit": redact(audit),
    }
    AUDIT_SUMMARY_PATH.write_text(json.dumps(result, indent=2, ensure_ascii=False), encoding="utf-8")
    AUDIT_REPORT_PATH.write_text(build_report(result), encoding="utf-8")
    print(json.dumps(result, indent=2, ensure_ascii=False))
    return 0 if result["ok"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
