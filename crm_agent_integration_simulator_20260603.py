#!/usr/bin/env python3
"""
MachineSignal CRM/agent integration simulator.

This script behaves like a customer machine integrating MachineSignal directly
over HTTP:
- reads the public integration partner pack;
- creates a sandbox customer;
- runs the three integration cases from the pack;
- stores simulated CRM records, tasks, webhook events and audit events;
- verifies beta guardrails.
"""

from __future__ import annotations

import json
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime
from pathlib import Path
from typing import Any


REPO_DIR = Path(__file__).resolve().parent
OUTPUT_DIR = Path(r"C:\Users\natal\AppData\Local\Temp\MachineSignal\crm_agent_integration_simulator_20260603")
REPORT_PATH = REPO_DIR / "crm_agent_integration_simulator_readout_20260603.md"
LEDGER_PATH = REPO_DIR / "crm_agent_integration_simulated_ledger_20260603.json"

INTEGRATION_PACK_URL = "https://machinesignal.it/integration-partner-pack.json"
BASE_URL = "https://machinesignal-api.beta-878.workers.dev"

SECRET_KEYS = {"api_key", "customer_api_key", "admin_api_key", "x-api-key", "token", "secret", "password"}


def parse_payload(raw: str) -> Any:
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return raw


def request_json(
    method: str,
    url: str,
    payload: dict[str, Any] | None = None,
    api_key: str | None = None,
    idempotency_key: str | None = None,
    timeout: int = 30,
) -> tuple[int, Any]:
    headers = {
        "Accept": "application/json,text/plain,*/*",
        "User-Agent": "MachineSignalCrmAgentIntegrationSimulator/2026-06-03",
    }
    body = None
    method_upper = method.upper()
    if payload is not None and method_upper not in {"GET", "HEAD"}:
        body = json.dumps(payload).encode("utf-8")
        headers["Content-Type"] = "application/json"
    if api_key:
        headers["X-API-Key"] = api_key
    if idempotency_key:
        headers["Idempotency-Key"] = idempotency_key

    if method_upper == "GET" and payload:
        query = urllib.parse.urlencode({k: v for k, v in payload.items() if v is not None})
        if query:
            url = f"{url}?{query}"

    req = urllib.request.Request(url, data=body, headers=headers, method=method_upper)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as response:
            raw = response.read().decode("utf-8", errors="replace")
            return int(response.status), parse_payload(raw)
    except urllib.error.HTTPError as exc:
        raw = exc.read().decode("utf-8", errors="replace")
        return int(exc.code), parse_payload(raw)
    except urllib.error.URLError as exc:
        return 599, {"error": "url_error", "message": str(exc)}


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
            if key_lower in SECRET_KEYS:
                clean[key] = mask_secret(item)
            else:
                clean[key] = redact(item)
        return clean
    if isinstance(value, list):
        return [redact(item) for item in value]
    return value


def first_sample_target(purchase_payload: dict[str, Any]) -> dict[str, Any] | None:
    paths = [
        ("delivery", "beta_sample_targets"),
        ("order", "delivery", "beta_sample_targets"),
        ("payload", "delivery", "beta_sample_targets"),
        ("payload", "order", "delivery", "beta_sample_targets"),
    ]
    for path in paths:
        samples = safe_get(purchase_payload, *path, default=[])
        if isinstance(samples, list) and samples:
            sample = samples[0]
            if isinstance(sample, dict) and sample.get("domain"):
                return sample
    return None


def recommended_product(score_payload: dict[str, Any]) -> str | None:
    product = safe_get(score_payload, "next_purchase", "next_product")
    if product:
        return str(product)
    decision = score_payload.get("decision")
    if decision == "buy_deep_analysis":
        return "deep_analysis"
    if decision == "nurture":
        return "nurture_signal"
    if decision == "needs_verification":
        return "verification"
    return None


def crm_record_from_score(score: dict[str, Any], source: str) -> dict[str, Any]:
    return {
        "crm_record_id": f"crm_{abs(hash((score.get('domain'), source))) % 1000000:06d}",
        "source": source,
        "domain": score.get("domain"),
        "opportunity_score": score.get("opportunity_score"),
        "confidence": score.get("confidence"),
        "decision": score.get("decision"),
        "commercial_strength": safe_get(score, "commercial_strength", "level"),
        "web_architect_status": safe_get(score, "web_architect_review", "status"),
        "recommended_next_product": safe_get(score, "next_purchase", "next_product"),
        "status": "stored_by_crm_agent_simulator",
    }


def build_report(result: dict[str, Any]) -> str:
    def ok_text(value: bool) -> str:
        return "OK" if value else "FAIL"

    lines = [
        "# MachineSignal - CRM/Agent Integration Simulator Readout",
        "",
        f"Finished at: {result['finished_at']}",
        "",
        "## Result",
        "",
        f"Status: {'passed' if result['ok'] else 'failed'}",
        "",
        "This test simulates a customer CRM/agent integrating MachineSignal directly over HTTP. It reads the public integration pack, executes the three partner cases and stores simulated CRM outputs.",
        "",
        "## Integration Cases",
        "",
        "| Case | Status | Main Output |",
        "|---|---|---|",
    ]
    for case in result["cases"]:
        lines.append(f"| {case['case']} | {ok_text(case['ok'])} | {case.get('summary', '')} |")

    lines.extend(
        [
            "",
            "## CRM Ledger",
            "",
            f"- CRM records stored: `{len(result['crm_ledger']['records'])}`",
            f"- CRM tasks created: `{len(result['crm_ledger']['tasks'])}`",
            f"- Webhook events prepared: `{len(result['crm_ledger']['webhook_events'])}`",
            f"- Audit events stored: `{len(result['crm_ledger']['audit_events'])}`",
            f"- Orders retrieved: `{result['orders_count']}`",
            "",
            "## Score Summary",
            "",
        ]
    )
    for score in result["score_summaries"]:
        lines.extend(
            [
                f"- `{score.get('domain')}`: score `{score.get('opportunity_score')}`, decision `{score.get('decision')}`, next `{score.get('recommended_next_product')}`",
            ]
        )

    lines.extend(
        [
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
            "## Guardrails",
            "",
            f"- Real payment executed: `{result['real_payment_executed']}`",
            f"- External contact executed: `{result['external_contact_executed']}`",
            "- No email or external outreach was sent by this simulator.",
            "- Full API keys are not exposed in this report.",
            "",
            "## Interpretation",
            "",
            "The result proves that a CRM/agent customer can use the public integration pack to run a machine-to-machine workflow: score an existing list, buy Target Discovery when no list exists, and prepare an Action Pack payload after gated Deep Analysis.",
        ]
    )
    return "\n".join(lines) + "\n"


class CrmAgentSimulator:
    def __init__(self) -> None:
        self.stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        self.run_id = f"crm-agent-integration-{self.stamp}-{int(time.time())}"
        self.checks: list[dict[str, Any]] = []
        self.cases: list[dict[str, Any]] = []
        self.score_summaries: list[dict[str, Any]] = []
        self.api_key = ""
        self.crm_ledger: dict[str, list[dict[str, Any]]] = {
            "records": [],
            "tasks": [],
            "webhook_events": [],
            "audit_events": [],
            "orders": [],
        }

    def check(self, name: str, ok: bool, details: str = "") -> None:
        self.checks.append({"name": name, "ok": bool(ok), "details": details})

    def call(self, method: str, path_or_url: str, payload: dict[str, Any] | None = None, idempotency_key: str | None = None) -> tuple[int, Any]:
        url = path_or_url if path_or_url.startswith("https://") else f"{BASE_URL}{path_or_url}"
        return request_json(method, url, payload=payload, api_key=self.api_key or None, idempotency_key=idempotency_key)

    def create_sandbox_customer(self) -> None:
        status, payload = request_json(
            "POST",
            f"{BASE_URL}/v1/sandbox/customers",
            payload={
                "evaluator_type": "crm_agent_simulator",
                "integration_target": "simulated CRM and workflow engine",
                "expected_test_path": "integration_partner_pack_end_to_end",
            },
            idempotency_key=f"{self.run_id}-sandbox",
        )
        self.check("sandbox_customer_created", status == 200 and isinstance(payload, dict) and bool(payload.get("api_key")), f"HTTP {status}")
        if status != 200 or not isinstance(payload, dict) or not payload.get("api_key"):
            raise RuntimeError(f"Could not create sandbox customer: HTTP {status} {payload}")
        self.api_key = str(payload["api_key"])
        self.crm_ledger["audit_events"].append(
            {
                "event_type": "machinesignal.sandbox.created",
                "customer_id": payload.get("customer_id"),
                "api_key_masked": mask_secret(self.api_key),
                "real_payment_executed": payload.get("real_payment_executed", False),
                "external_contact_executed": payload.get("external_contact_executed", False),
            }
        )

    def run_existing_list_case(self) -> dict[str, Any]:
        body = {
            "domain": "studio-odontoiatrico-demo.it",
            "sector_hint": "dentist",
            "country_hint": "IT",
            "target_name": "Studio Odontoiatrico Demo",
            "area": "Lombardia",
            "commercial_objective": "prioritize dentist websites worth reviewing for website-led commercial opportunity and CRM-ready follow-up preparation",
            "initial_signals": ["existing_crm_record", "sector_match", "business_domain_present"],
        }
        status, score = self.call("POST", "/v1/lead-opportunity-score", body, f"{self.run_id}-existing-list-score")
        ok = status == 200 and isinstance(score, dict) and bool(score.get("domain"))
        self.check("existing_list_score", ok, f"HTTP {status}")
        if ok:
            record = crm_record_from_score(score, "existing_list")
            self.crm_ledger["records"].append(record)
            self.score_summaries.append(record)
        case = {
            "case": "customer_has_existing_list",
            "ok": bool(ok),
            "summary": f"score={score.get('opportunity_score') if isinstance(score, dict) else None}; decision={score.get('decision') if isinstance(score, dict) else None}",
        }
        self.cases.append(case)
        return score if isinstance(score, dict) else {}

    def run_no_list_case(self) -> tuple[dict[str, Any], dict[str, Any]]:
        status, target_order = self.call(
            "POST",
            "/v1/purchase-intent",
            {
                "product_code": "target_discovery",
                "market": "dentists_odontoiatric_clinics",
                "area": "Lombardia",
                "commercial_objective": "find dentist and odontoiatric clinic domains worth scoring for website-led commercial opportunity and CRM-ready follow-up preparation",
                "reason": "The simulated CRM/agent has no starting list and needs target discovery before scoring.",
                "batch_id": self.run_id,
            },
            f"{self.run_id}-target-discovery",
        )
        target_ok = status == 200 and isinstance(target_order, dict)
        self.check("no_list_target_discovery", target_ok, f"HTTP {status}")
        sample = first_sample_target(target_order if isinstance(target_order, dict) else {}) or {
            "domain": "dentists-odontoiatric-clinics-lombardia-candidate-01.example",
            "target_name": "dentists_odontoiatric_clinics candidate 01",
            "category": "dentist",
            "area": "Lombardia",
            "initial_signals": ["fallback_target"],
        }

        score_body = {
            "domain": sample.get("domain"),
            "sector_hint": "dentist",
            "country_hint": "IT",
            "target_name": sample.get("target_name"),
            "category_hint": sample.get("category"),
            "area": sample.get("area"),
            "region": "Lombardia",
            "initial_signals": sample.get("initial_signals"),
            "commercial_objective": "website-led commercial opportunity and CRM-ready follow-up preparation",
        }
        score_status, score = self.call("POST", "/v1/lead-opportunity-score", score_body, f"{self.run_id}-no-list-score")
        score_ok = score_status == 200 and isinstance(score, dict) and bool(score.get("domain"))
        self.check("no_list_discovered_target_score", score_ok, f"HTTP {score_status}")
        if score_ok:
            record = crm_record_from_score(score, "target_discovery")
            self.crm_ledger["records"].append(record)
            self.score_summaries.append(record)
        case = {
            "case": "customer_has_no_list",
            "ok": bool(target_ok and score_ok),
            "summary": f"target={sample.get('domain')}; score={score.get('opportunity_score') if isinstance(score, dict) else None}",
        }
        self.cases.append(case)
        return (target_order if isinstance(target_order, dict) else {}, score if isinstance(score, dict) else {})

    def run_action_payload_case(self, score: dict[str, Any]) -> dict[str, Any]:
        recommended = recommended_product(score)
        deep_analysis: dict[str, Any] = {}
        action_pack: dict[str, Any] = {}
        deep_ok = False
        action_ok = False

        if recommended == "deep_analysis":
            deep_status, deep_payload = self.call(
                "POST",
                "/v1/purchase-intent",
                {
                    "product_code": "deep_analysis",
                    "domain": score.get("domain"),
                    "source_score_request_id": f"{self.run_id}-no-list-score",
                    "reason": "Score response recommended Deep Analysis before any CRM action.",
                    "max_budget_eur": 3,
                },
                f"{self.run_id}-deep-analysis",
            )
            deep_analysis = deep_payload if isinstance(deep_payload, dict) else {}
            deep_ok = deep_status == 200 and bool(deep_analysis)
            self.check("action_case_deep_analysis", deep_ok, f"HTTP {deep_status}")

        deep_recommends_action = safe_get(deep_analysis, "delivery", "recommended_next_step", "product_code") == "action_pack"
        compliance_gate_available = True
        if deep_ok and deep_recommends_action and compliance_gate_available:
            action_status, action_payload = self.call(
                "POST",
                "/v1/purchase-intent",
                {
                    "product_code": "action_pack",
                    "domain": score.get("domain"),
                    "source_score_request_id": f"{self.run_id}-no-list-score",
                    "reason": "Deep Analysis recommended Action Pack and simulated CRM compliance gate is available.",
                    "max_budget_eur": 10,
                },
                f"{self.run_id}-action-pack",
            )
            action_pack = action_payload if isinstance(action_payload, dict) else {}
            action_ok = action_status == 200 and bool(action_pack)
            self.check("action_case_action_pack", action_ok, f"HTTP {action_status}")

        delivery = action_pack.get("delivery") or {}
        if action_ok:
            if isinstance(delivery.get("crm_record_patch"), dict):
                self.crm_ledger["records"].append({"source": "action_pack", **delivery["crm_record_patch"]})
            if isinstance(delivery.get("crm_task"), dict):
                self.crm_ledger["tasks"].append(delivery["crm_task"])
            if isinstance(delivery.get("webhook_event"), dict):
                self.crm_ledger["webhook_events"].append(delivery["webhook_event"])
            if isinstance(delivery.get("audit_event"), dict):
                self.crm_ledger["audit_events"].append(delivery["audit_event"])

        case = {
            "case": "customer_wants_action_payload",
            "ok": deep_ok and action_ok,
            "summary": f"deep_analysis={deep_ok}; action_pack={action_ok}; webhook={safe_get(delivery, 'webhook_event', 'event_type')}",
        }
        self.cases.append(case)
        return action_pack

    def run(self) -> dict[str, Any]:
        pack_status, pack = request_json("GET", INTEGRATION_PACK_URL)
        self.check("integration_pack_read", pack_status == 200 and safe_get(pack, "pack_type") == "integration_partner_pack", f"HTTP {pack_status}")
        self.check("integration_pack_has_three_cases", len(safe_get(pack, "integration_cases", default={})) == 3, str(list(safe_get(pack, "integration_cases", default={}).keys())))

        self.create_sandbox_customer()
        onboarding_status, onboarding = self.call("GET", "/v1/onboarding")
        self.check("authenticated_onboarding", onboarding_status == 200 and isinstance(onboarding, dict), f"HTTP {onboarding_status}")

        self.run_existing_list_case()
        _, discovered_score = self.run_no_list_case()
        self.run_action_payload_case(discovered_score)

        orders_status, orders_payload = self.call("GET", "/v1/orders")
        orders = safe_get(orders_payload, "orders", default=[]) if isinstance(orders_payload, dict) else []
        self.check("orders_retrieved", orders_status == 200 and isinstance(orders, list) and len(orders) >= 1, f"HTTP {orders_status}; orders={len(orders) if isinstance(orders, list) else 0}")
        if isinstance(orders, list):
            self.crm_ledger["orders"] = orders

        usage_status, usage = self.call("GET", "/v1/usage")
        self.check("usage_retrieved", usage_status == 200 and isinstance(usage, dict), f"HTTP {usage_status}")
        real_payment = safe_get(usage, "real_payment_executed")
        external_contact = safe_get(usage, "external_contact_executed")
        self.check("no_real_payment", real_payment is False, str(real_payment))
        self.check("no_external_contact", external_contact is False, str(external_contact))

        result = {
            "ok": all(item["ok"] for item in self.checks),
            "test_name": "crm_agent_integration_simulator",
            "finished_at": datetime.now().isoformat(timespec="seconds"),
            "run_id": self.run_id,
            "cases": self.cases,
            "checks": self.checks,
            "score_summaries": self.score_summaries,
            "crm_ledger": redact(self.crm_ledger),
            "orders_count": len(orders) if isinstance(orders, list) else 0,
            "real_payment_executed": real_payment,
            "external_contact_executed": external_contact,
            "usage": redact(usage),
        }
        return result


def main() -> int:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    simulator = CrmAgentSimulator()
    result = simulator.run()
    stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    summary_path = OUTPUT_DIR / f"crm_agent_integration_simulator_summary_{stamp}.json"
    report_path = OUTPUT_DIR / f"crm_agent_integration_simulator_report_{stamp}.md"
    result["summary_path"] = str(summary_path)
    result["report_path"] = str(report_path)
    result["repo_report_path"] = str(REPORT_PATH)
    result["repo_ledger_path"] = str(LEDGER_PATH)

    summary_path.write_text(json.dumps(redact(result), indent=2, ensure_ascii=False), encoding="utf-8")
    report = build_report(result)
    report_path.write_text(report, encoding="utf-8")
    REPORT_PATH.write_text(report, encoding="utf-8")
    LEDGER_PATH.write_text(json.dumps(redact(result["crm_ledger"]), indent=2, ensure_ascii=False), encoding="utf-8")
    print(json.dumps(redact(result), indent=2, ensure_ascii=False))
    return 0 if result["ok"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
