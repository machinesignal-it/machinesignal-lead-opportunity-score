#!/usr/bin/env python3
"""
MachineSignal controlled-beta operational readiness test.

This test creates a temporary private beta customer through the admin API, then
acts as a customer machine to validate usage, orders, order detail, filters,
idempotency and admin audit reconciliation.
"""

from __future__ import annotations

import json
import os
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime
from pathlib import Path
from typing import Any


REPO_DIR = Path(__file__).resolve().parent
REPORT_PATH = REPO_DIR / "controlled_beta_operational_readiness_report_20260603.md"
SUMMARY_PATH = REPO_DIR / "controlled_beta_operational_readiness_summary_20260603.json"
API_BASE = "https://machinesignal-api.beta-878.workers.dev"
SITE_BASE = "https://machinesignal.it"

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


def request_json(
    method: str,
    path_or_url: str,
    payload: dict[str, Any] | None = None,
    api_key: str | None = None,
    idempotency_key: str | None = None,
    timeout: int = 30,
) -> tuple[int, Any]:
    url = path_or_url if path_or_url.startswith("http") else f"{API_BASE}{path_or_url}"
    method_upper = method.upper()
    body = None
    headers = {
        "Accept": "application/json,text/plain,*/*",
        "User-Agent": "MachineSignalOperationalReadiness/2026-06-03",
    }
    if payload is not None and method_upper not in {"GET", "HEAD"}:
        body = json.dumps(payload).encode("utf-8")
        headers["Content-Type"] = "application/json"
    if payload is not None and method_upper in {"GET", "HEAD"}:
        query = urllib.parse.urlencode({k: v for k, v in payload.items() if v is not None})
        if query:
            separator = "&" if "?" in url else "?"
            url = f"{url}{separator}{query}"
    if api_key:
        headers["X-API-Key"] = api_key
    if idempotency_key:
        headers["Idempotency-Key"] = idempotency_key

    req = urllib.request.Request(url, data=body, headers=headers, method=method_upper)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as response:
            raw = response.read().decode("utf-8", errors="replace")
            try:
                return int(response.status), json.loads(raw)
            except json.JSONDecodeError:
                return int(response.status), raw
    except urllib.error.HTTPError as exc:
        raw = exc.read().decode("utf-8", errors="replace")
        try:
            return int(exc.code), json.loads(raw)
        except json.JSONDecodeError:
            return int(exc.code), {"raw": raw}
    except urllib.error.URLError as exc:
        return 599, {"error": "url_error", "message": str(exc)}


def balance(usage: dict[str, Any], product_code: str) -> dict[str, Any]:
    for item in usage.get("balances", []):
        if isinstance(item, dict) and item.get("product_code") == product_code:
            return item
    return {}


def product_order_count(orders_payload: dict[str, Any], product_code: str) -> int:
    orders = orders_payload.get("orders", [])
    if not isinstance(orders, list):
        return 0
    return sum(1 for item in orders if isinstance(item, dict) and item.get("product_code") == product_code)


class OperationalReadinessTest:
    def __init__(self, admin_key: str) -> None:
        stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        self.run_id = f"controlled-beta-ops-{stamp}-{int(time.time())}"
        self.customer_id = f"ops_beta_{stamp}_{int(time.time())}"
        self.admin_key = admin_key
        self.customer_key = ""
        self.checks: list[dict[str, Any]] = []
        self.actions: list[dict[str, Any]] = []
        self.order_ids: dict[str, str] = {}
        self.payloads: dict[str, Any] = {}

    def check(self, name: str, ok: bool, details: str = "") -> None:
        self.checks.append({"name": name, "ok": bool(ok), "details": details})

    def action(self, name: str, status: int, ok: bool, details: str = "") -> None:
        self.actions.append({"name": name, "status": status, "ok": bool(ok), "details": details})

    def admin_call(
        self,
        method: str,
        path: str,
        payload: dict[str, Any] | None = None,
        idempotency_key: str | None = None,
    ) -> tuple[int, Any]:
        return request_json(method, path, payload, api_key=self.admin_key, idempotency_key=idempotency_key)

    def customer_call(
        self,
        method: str,
        path: str,
        payload: dict[str, Any] | None = None,
        idempotency_key: str | None = None,
    ) -> tuple[int, Any]:
        return request_json(method, path, payload, api_key=self.customer_key, idempotency_key=idempotency_key)

    def create_customer(self) -> None:
        status, payload = self.admin_call(
            "POST",
            "/v1/beta/customers",
            {
                "customer_id": self.customer_id,
                "contact_email": "ops-test@machinesignal.it",
                "customer_type": "machine_integration_test",
                "plan": "controlled_beta_operational_readiness",
                "score_credits": 5,
                "verification_credits": 1,
                "nurture_signal_credits": 1,
                "deep_analysis_credits": 1,
                "action_pack_credits": 1,
                "target_discovery_credits": 1,
                "domain_enrichment_credits": 1,
            },
            idempotency_key=f"{self.run_id}-create-customer",
        )
        ok = status == 200 and isinstance(payload, dict) and bool(payload.get("api_key"))
        self.action("POST /v1/beta/customers", status, ok, self.customer_id)
        self.check("admin_created_controlled_beta_customer", ok, f"HTTP {status}")
        if not ok:
            raise RuntimeError(f"Could not create beta customer: HTTP {status} {payload}")
        self.customer_key = str(payload["api_key"])
        self.payloads["created_customer"] = redact(payload)

    def read_initial_state(self) -> None:
        status, onboarding = self.customer_call("GET", "/v1/onboarding")
        ok = status == 200 and isinstance(onboarding, dict)
        self.action("GET /v1/onboarding", status, ok, "initial customer onboarding")
        self.check("customer_machine_can_read_onboarding", ok, f"HTTP {status}")
        self.payloads["initial_onboarding"] = redact(onboarding)

        status, usage = self.customer_call("GET", "/v1/usage")
        ok = (
            status == 200
            and isinstance(usage, dict)
            and usage.get("ledger_backend") == "durable_object"
            and balance(usage, "score_pack_1k").get("credits_purchased") == 5
        )
        self.action("GET /v1/usage initial", status, ok, "initial usage")
        self.check("initial_usage_has_expected_credits", ok, f"HTTP {status}")
        self.payloads["initial_usage"] = redact(usage)

    def validate_score_idempotency(self) -> None:
        payload = {
            "domain": "operational-dentist-demo.it",
            "sector_hint": "dentist",
            "country_hint": "IT",
            "target_name": "Operational Dentist Demo",
            "area": "Lombardia",
            "commercial_objective": "test controlled beta ledger behavior before customer-machine spend",
        }
        key = f"{self.run_id}-score-001"
        status, first = self.customer_call("POST", "/v1/lead-opportunity-score", payload, key)
        ok = status == 200 and isinstance(first, dict) and safe_get(first, "usage", "current_event", "credits_consumed") == 1
        self.action("POST /v1/lead-opportunity-score first", status, ok, "score credit should be consumed")
        self.check("score_first_call_consumed_one_credit", ok, f"HTTP {status}")
        self.payloads["score_first"] = redact(first)

        status, duplicate = self.customer_call("POST", "/v1/lead-opportunity-score", payload, key)
        duplicate_ok = (
            status == 200
            and isinstance(duplicate, dict)
            and safe_get(duplicate, "usage", "current_event", "duplicate_request") is True
            and balance(safe_get(duplicate, "usage", default={}), "score_pack_1k").get("credits_used") == 1
        )
        self.action("POST /v1/lead-opportunity-score duplicate", status, duplicate_ok, "same idempotency key")
        self.check("score_duplicate_did_not_consume_second_credit", duplicate_ok, f"HTTP {status}")
        self.payloads["score_duplicate"] = redact(duplicate)

    def create_and_validate_orders(self) -> None:
        purchase_cases = [
            (
                "verification",
                {
                    "product_code": "verification",
                    "domain": "operational-dentist-demo.it",
                    "source_score_request_id": f"{self.run_id}-score-001",
                    "reason": "Controlled beta test: verify order ledger, delivery and filter behavior.",
                },
            ),
            (
                "target_discovery",
                {
                    "product_code": "target_discovery",
                    "market": "dentists_odontoiatric_clinics",
                    "area": "Lombardia",
                    "commercial_objective": "find dentist domains worth scoring for website-led commercial opportunities",
                    "reason": "Controlled beta test: verify no-list target discovery order.",
                },
            ),
            (
                "deep_analysis",
                {
                    "product_code": "deep_analysis",
                    "domain": "strong-operational-clinic.it",
                    "source_score_request_id": f"{self.run_id}-score-strong-001",
                    "reason": "Controlled beta test: verify deep analysis order and delivery.",
                    "max_budget_eur": 3,
                },
            ),
            (
                "action_pack",
                {
                    "product_code": "action_pack",
                    "domain": "strong-operational-clinic.it",
                    "source_score_request_id": f"{self.run_id}-score-strong-001",
                    "reason": "Controlled beta test: verify CRM-ready action pack remains approval-gated.",
                    "max_budget_eur": 10,
                },
            ),
        ]

        for product_code, body in purchase_cases:
            key = f"{self.run_id}-order-{product_code}"
            status, payload = self.customer_call("POST", "/v1/purchase-intent", body, key)
            ok = status == 200 and isinstance(payload, dict) and payload.get("product_code") == product_code
            self.action(f"POST /v1/purchase-intent {product_code}", status, ok, product_code)
            self.check(f"{product_code}_order_created", ok, f"HTTP {status}")
            if isinstance(payload, dict):
                order_id = str(payload.get("order_intent_id") or "")
                if order_id:
                    self.order_ids[product_code] = order_id
                self.payloads[f"order_{product_code}"] = redact(payload)

        status, duplicate = self.customer_call(
            "POST",
            "/v1/purchase-intent",
            purchase_cases[0][1],
            f"{self.run_id}-order-verification",
        )
        duplicate_ok = (
            status == 200
            and isinstance(duplicate, dict)
            and safe_get(duplicate, "usage", "current_event", "duplicate_request") is True
            and balance(safe_get(duplicate, "usage", default={}), "verification_pack_100").get("credits_used") == 1
        )
        self.action("POST /v1/purchase-intent verification duplicate", status, duplicate_ok, "same idempotency key")
        self.check("purchase_duplicate_did_not_consume_second_credit", duplicate_ok, f"HTTP {status}")
        self.payloads["order_verification_duplicate"] = redact(duplicate)

    def validate_order_reads(self) -> None:
        status, orders = self.customer_call("GET", "/v1/orders")
        order_list = orders.get("orders", []) if isinstance(orders, dict) else []
        ok = status == 200 and isinstance(order_list, list) and len(order_list) >= 4
        self.action("GET /v1/orders", status, ok, f"orders={len(order_list) if isinstance(order_list, list) else 'n/a'}")
        self.check("machine_can_read_order_history", ok, f"HTTP {status}")
        self.payloads["orders_all"] = redact(orders)

        status, filtered = self.customer_call("GET", "/v1/orders?product_code=verification")
        filtered_ok = (
            status == 200
            and isinstance(filtered, dict)
            and filtered.get("count") == 1
            and product_order_count(filtered, "verification") == 1
        )
        self.action("GET /v1/orders?product_code=verification", status, filtered_ok, "filtered orders")
        self.check("machine_can_filter_orders_by_product", filtered_ok, f"HTTP {status}")
        self.payloads["orders_filtered_verification"] = redact(filtered)

        verification_order_id = self.order_ids.get("verification")
        status, detail = self.customer_call("GET", f"/v1/orders/{urllib.parse.quote(verification_order_id or '')}")
        detail_ok = (
            status == 200
            and isinstance(detail, dict)
            and safe_get(detail, "order", "order_intent_id") == verification_order_id
            and safe_get(detail, "order", "delivery", "external_contact_executed") is False
        )
        self.action("GET /v1/orders/{order_intent_id}", status, detail_ok, verification_order_id or "missing")
        self.check("machine_can_read_single_order_detail", detail_ok, f"HTTP {status}")
        self.payloads["order_detail_verification"] = redact(detail)

    def validate_final_usage_and_audit(self) -> None:
        status, usage = self.customer_call("GET", "/v1/usage")
        usage_ok = (
            status == 200
            and isinstance(usage, dict)
            and usage.get("ledger_backend") == "durable_object"
            and balance(usage, "score_pack_1k").get("credits_used") == 1
            and balance(usage, "verification_pack_100").get("credits_used") == 1
            and balance(usage, "target_discovery_pack_250").get("credits_used") == 1
            and balance(usage, "deep_analysis_pack_100").get("credits_used") == 1
            and balance(usage, "action_pack_25").get("credits_used") == 1
            and usage.get("real_payment_executed") is False
            and usage.get("external_contact_executed") is False
        )
        self.action("GET /v1/usage final", status, usage_ok, "final usage reconciliation")
        self.check("final_usage_balances_are_coherent", usage_ok, f"HTTP {status}")
        self.check("final_usage_real_payment_disabled", isinstance(usage, dict) and usage.get("real_payment_executed") is False, "")
        self.check("final_usage_external_contact_disabled", isinstance(usage, dict) and usage.get("external_contact_executed") is False, "")
        self.payloads["final_usage"] = redact(usage)

        status, audit = self.admin_call("GET", f"/v1/admin/audit-report?customer_id={urllib.parse.quote(self.customer_id)}")
        audit_ok = (
            status == 200
            and isinstance(audit, dict)
            and audit.get("ledger_backend") == "durable_object"
            and safe_get(audit, "summary", "reconciliation_ok") is True
            and safe_get(audit, "summary", "order_count") == 4
            and safe_get(audit, "summary", "ready_for_real_payments") is False
            and safe_get(audit, "safety", "real_payment_executed") is False
            and safe_get(audit, "safety", "external_contact_executed") is False
        )
        self.action("GET /v1/admin/audit-report", status, audit_ok, self.customer_id)
        self.check("admin_audit_reconciles_controlled_beta_customer", audit_ok, f"HTTP {status}")
        self.payloads["admin_audit"] = redact(audit)

    def build_result(self) -> dict[str, Any]:
        final_usage = self.payloads.get("final_usage", {})
        audit = self.payloads.get("admin_audit", {})
        result = {
            "ok": all(check["ok"] for check in self.checks),
            "test_name": "controlled_beta_operational_readiness",
            "finished_at": datetime.now().isoformat(timespec="seconds"),
            "run_id": self.run_id,
            "customer_id": self.customer_id,
            "scope": {
                "primary_customer_interface": "machine",
                "human_role": "admin supervision and audit only",
                "real_payment_executed": False,
                "external_contact_executed": False,
            },
            "checks": self.checks,
            "actions": self.actions,
            "order_ids": self.order_ids,
            "usage_summary": {
                "ledger_backend": safe_get(final_usage, "ledger_backend"),
                "score_used": safe_get(balance(final_usage, "score_pack_1k"), "credits_used"),
                "verification_used": safe_get(balance(final_usage, "verification_pack_100"), "credits_used"),
                "target_discovery_used": safe_get(balance(final_usage, "target_discovery_pack_250"), "credits_used"),
                "deep_analysis_used": safe_get(balance(final_usage, "deep_analysis_pack_100"), "credits_used"),
                "action_pack_used": safe_get(balance(final_usage, "action_pack_25"), "credits_used"),
                "real_payment_executed": safe_get(final_usage, "real_payment_executed"),
                "external_contact_executed": safe_get(final_usage, "external_contact_executed"),
            },
            "audit_summary": {
                "ledger_backend": safe_get(audit, "ledger_backend"),
                "order_count": safe_get(audit, "summary", "order_count"),
                "valid_credit_events": safe_get(audit, "summary", "valid_credit_events"),
                "simulated_revenue_eur": safe_get(audit, "summary", "simulated_revenue_eur"),
                "reconciliation_ok": safe_get(audit, "summary", "reconciliation_ok"),
                "ready_for_real_payments": safe_get(audit, "summary", "ready_for_real_payments"),
                "real_payment_executed": safe_get(audit, "safety", "real_payment_executed"),
                "external_contact_executed": safe_get(audit, "safety", "external_contact_executed"),
            },
            "payloads": redact(self.payloads),
        }
        return redact(result)

    def run(self) -> dict[str, Any]:
        self.create_customer()
        self.read_initial_state()
        self.validate_score_idempotency()
        self.create_and_validate_orders()
        self.validate_order_reads()
        self.validate_final_usage_and_audit()
        return self.build_result()


def build_report(result: dict[str, Any]) -> str:
    def status(value: bool) -> str:
        return "OK" if value else "FAIL"

    usage = result["usage_summary"]
    audit = result["audit_summary"]
    lines = [
        "# MachineSignal - Controlled Beta Operational Readiness Test",
        "",
        f"Finished at: {result['finished_at']}",
        "",
        "## Result",
        "",
        f"Status: {'passed' if result['ok'] else 'failed'}",
        f"Customer audited: `{result['customer_id']}`",
        "",
        "## What This Test Validates",
        "",
        "- a controlled private beta customer can be created by the admin layer;",
        "- the customer machine can read onboarding and usage;",
        "- score idempotency prevents double credit consumption;",
        "- purchase-intent idempotency prevents duplicate charging of beta credits;",
        "- order history, product filters and single-order detail are retrievable;",
        "- admin audit reconciles ledger events, product balances and orders;",
        "- beta guardrails keep real payment and external contact disabled.",
        "",
        "## Usage Summary",
        "",
        f"- Ledger backend: `{usage.get('ledger_backend')}`",
        f"- Score credits used: `{usage.get('score_used')}`",
        f"- Verification credits used: `{usage.get('verification_used')}`",
        f"- Target Discovery credits used: `{usage.get('target_discovery_used')}`",
        f"- Deep Analysis credits used: `{usage.get('deep_analysis_used')}`",
        f"- Action Pack credits used: `{usage.get('action_pack_used')}`",
        f"- Real payment executed: `{usage.get('real_payment_executed')}`",
        f"- External contact executed: `{usage.get('external_contact_executed')}`",
        "",
        "## Audit Summary",
        "",
        f"- Ledger backend: `{audit.get('ledger_backend')}`",
        f"- Orders: `{audit.get('order_count')}`",
        f"- Valid credit events: `{audit.get('valid_credit_events')}`",
        f"- Simulated beta revenue: `EUR {audit.get('simulated_revenue_eur')}`",
        f"- Reconciliation OK: `{audit.get('reconciliation_ok')}`",
        f"- Ready for real payments: `{audit.get('ready_for_real_payments')}`",
        "",
        "## Checks",
        "",
        "| Check | Result | Details |",
        "|---|---|---|",
    ]
    for check in result["checks"]:
        lines.append(f"| {check['name']} | {status(check['ok'])} | {check.get('details', '')} |")

    lines.extend(
        [
            "",
            "## Machine Interpretation",
            "",
            "A customer machine can use MachineSignal in a controlled beta loop and retrieve the operational records it needs to reconcile spend decisions. The service is not ready for real payments yet because fiscal, legal, billing, retention and long-term reporting controls still need to be completed.",
            "",
            "## Public Resources",
            "",
            f"- Integration Ready: {SITE_BASE}/integration-ready/",
            f"- Product catalog: {SITE_BASE}/product-catalog.json",
            f"- OpenAPI: {SITE_BASE}/openapi.json",
            f"- This JSON summary: {SITE_BASE}/controlled_beta_operational_readiness_summary_20260603.json",
        ]
    )
    return "\n".join(lines) + "\n"


def main() -> int:
    admin_key = os.environ.get("MACHINESIGNAL_ADMIN_API_KEY", "").strip()
    if not admin_key:
        raise RuntimeError("MACHINESIGNAL_ADMIN_API_KEY is required")

    test = OperationalReadinessTest(admin_key)
    result = test.run()
    SUMMARY_PATH.write_text(json.dumps(result, indent=2, ensure_ascii=False), encoding="utf-8")
    REPORT_PATH.write_text(build_report(result), encoding="utf-8")
    print(json.dumps({k: v for k, v in result.items() if k != "payloads"}, indent=2, ensure_ascii=False))
    return 0 if result["ok"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
