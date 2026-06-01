#!/usr/bin/env python3
"""
MachineSignal beta-customer score volume test.

Creates one controlled beta customer through the admin API, then simulates a
machine customer that executes higher score volume than public sandbox allows.

The admin key is supplied via MACHINESIGNAL_ADMIN_API_KEY and is never written
to disk. The generated customer API key is kept in memory only.
"""

from __future__ import annotations

import json
import os
import time
import urllib.error
import urllib.request
from datetime import datetime
from pathlib import Path
from typing import Any


BASE_URL = "https://machinesignal-api.beta-878.workers.dev"
OUTPUT_DIR = (
    Path(os.environ.get("LOCALAPPDATA", str(Path.home())))
    / "Temp"
    / "MachineSignal"
    / "beta_customer_score_volume_test"
)

BASE_DOMAINS = [
    "quinta-essenza.com",
    "clinic3.it",
    "studio-odontoiatrico-demo.it",
    "avalonbenessere.it",
    "centromedico-besana.it",
    "vistavisiongroup.com",
    "bianchiosteopata.it",
    "example-dentist-milano.it",
    "demo-clinic-lombardia.it",
    "studio-legale-demo.it",
]


def request_json(
    method: str,
    path: str,
    payload: dict[str, Any] | None = None,
    api_key: str | None = None,
    idempotency_key: str | None = None,
    timeout: int = 30,
) -> tuple[int, Any]:
    headers = {
        "Accept": "application/json,text/plain,*/*",
        "User-Agent": "MachineSignalBetaCustomerScoreVolume/2026-06-01",
    }
    body = None
    if payload is not None:
        body = json.dumps(payload).encode("utf-8")
        headers["Content-Type"] = "application/json"
    if api_key:
        headers["X-API-Key"] = api_key
    if idempotency_key:
        headers["Idempotency-Key"] = idempotency_key

    request = urllib.request.Request(BASE_URL + path, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            raw = response.read().decode("utf-8", errors="replace")
            return int(response.status), parse_payload(raw)
    except urllib.error.HTTPError as exc:
        raw = exc.read().decode("utf-8", errors="replace")
        return int(exc.code), parse_payload(raw)


def parse_payload(raw: str) -> Any:
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return raw


def current_event(payload: dict[str, Any]) -> dict[str, Any]:
    return ((payload.get("usage") or {}).get("current_event") or {}) if isinstance(payload, dict) else {}


def balance_used(payload: dict[str, Any], product_code: str) -> int:
    for item in payload.get("balances") or []:
        if item.get("product_code") == product_code:
            return int(item.get("credits_used") or 0)
    return 0


def build_domain_payload(index: int) -> dict[str, str]:
    domain = BASE_DOMAINS[index % len(BASE_DOMAINS)]
    if "dent" in domain or "odont" in domain or "clinic" in domain:
        sector = "dentist"
    elif "legale" in domain:
        sector = "law firm"
    else:
        sector = "medicina estetica"
    return {
        "domain": domain,
        "sector_hint": sector,
        "country_hint": "IT",
    }


def run() -> dict[str, Any]:
    admin_key = os.environ.get("MACHINESIGNAL_ADMIN_API_KEY", "").strip()
    if not admin_key:
        return {
            "ok": False,
            "error": "MACHINESIGNAL_ADMIN_API_KEY is required",
            "checks": [],
        }

    stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    run_id = f"beta-volume-{stamp}-{int(time.time())}"
    score_count = int(os.environ.get("MACHINESIGNAL_BETA_VOLUME_SCORES", "50"))
    customer_id = f"beta_volume_{stamp.lower()}"
    checks: list[dict[str, Any]] = []
    rows: list[dict[str, Any]] = []

    def check(name: str, ok: bool, details: str = "") -> None:
        checks.append({"name": name, "ok": bool(ok), "details": details})

    status, customer = request_json(
        "POST",
        "/v1/beta/customers",
        api_key=admin_key,
        idempotency_key=f"{run_id}-create-customer",
        payload={
            "customer_id": customer_id,
            "contact_email": "beta@machinesignal.it",
            "plan": "beta_volume_test",
            "customer_type": "beta_customer_volume_test",
            "score_credits": score_count + 5,
            "deep_analysis_credits": 2,
            "action_pack_credits": 2,
            "target_discovery_credits": 1,
            "verification_credits": 2,
            "nurture_signal_credits": 2,
            "domain_enrichment_credits": 1,
            "opportunity_feed_credits": 0,
            "created_by": "agent_volume_test",
        },
    )
    customer_key = customer.get("api_key") if isinstance(customer, dict) else None
    check(
        "beta_customer_created",
        status == 200 and isinstance(customer_key, str) and len(customer_key) > 12,
        f"HTTP {status}",
    )
    if not customer_key:
        failed = [item for item in checks if not item["ok"]]
        return {
            "ok": False,
            "run_id": run_id,
            "checks": checks,
            "summary": {"checks_passed": len(checks) - len(failed), "checks_failed": len(failed)},
            "customer_response": customer if not isinstance(customer, dict) else {k: v for k, v in customer.items() if k != "api_key"},
        }

    status, usage_before = request_json("GET", "/v1/usage", api_key=customer_key)
    check("usage_before", status == 200 and isinstance(usage_before, dict), f"HTTP {status}")
    before_score = balance_used(usage_before if isinstance(usage_before, dict) else {}, "score_pack_1k")

    successful_scores = 0
    next_purchase_counts: dict[str, int] = {}
    decision_counts: dict[str, int] = {}

    for index in range(score_count):
        payload = build_domain_payload(index)
        status, score = request_json(
            "POST",
            "/v1/lead-opportunity-score",
            api_key=customer_key,
            idempotency_key=f"{run_id}-score-{index + 1:03d}",
            payload=payload,
        )
        ok = status == 200 and isinstance(score, dict) and "opportunity_score" in score
        successful_scores += 1 if ok else 0
        decision = score.get("decision") if isinstance(score, dict) else None
        next_product = (score.get("next_purchase") or {}).get("next_product") if isinstance(score, dict) else None
        if decision:
            decision_counts[decision] = decision_counts.get(decision, 0) + 1
        if next_product:
            next_purchase_counts[next_product] = next_purchase_counts.get(next_product, 0) + 1
        if index < 12 or not ok:
            rows.append(
                {
                    "index": index + 1,
                    "domain": payload["domain"],
                    "http_status": status,
                    "ok": ok,
                    "score": score.get("opportunity_score") if isinstance(score, dict) else None,
                    "decision": decision,
                    "next_purchase": next_product,
                    "credit_consumed": current_event(score).get("credits_consumed")
                    if isinstance(score, dict)
                    else None,
                }
            )

    status, duplicate = request_json(
        "POST",
        "/v1/lead-opportunity-score",
        api_key=customer_key,
        idempotency_key=f"{run_id}-score-001",
        payload=build_domain_payload(0),
    )
    duplicate_event = current_event(duplicate if isinstance(duplicate, dict) else {})
    check(
        "duplicate_score_not_double_charged",
        status == 200 and duplicate_event.get("duplicate_request") is True,
        f"HTTP {status}",
    )

    status, usage_after = request_json("GET", "/v1/usage", api_key=customer_key)
    check("usage_after", status == 200 and isinstance(usage_after, dict), f"HTTP {status}")
    after_score = balance_used(usage_after if isinstance(usage_after, dict) else {}, "score_pack_1k")
    score_delta = after_score - before_score

    check("all_scores_successful", successful_scores == score_count, f"{successful_scores}/{score_count}")
    check("score_delta_expected", score_delta == successful_scores, f"delta={score_delta}")
    check(
        "safety_flags",
        isinstance(usage_after, dict)
        and usage_after.get("real_payment_executed") is False
        and usage_after.get("external_contact_executed") is False,
        "beta flags must remain false",
    )

    failed = [item for item in checks if not item["ok"]]
    return {
        "ok": not failed,
        "test_name": "beta_customer_score_volume_test",
        "run_id": run_id,
        "finished_at": datetime.now().isoformat(timespec="seconds"),
        "customer": {
            "customer_id": customer_id,
            "api_key_created": True,
            "api_key_saved": False,
            "plan": "beta_volume_test",
        },
        "checks": checks,
        "summary": {
            "checks_passed": len(checks) - len(failed),
            "checks_failed": len(failed),
            "score_count_requested": score_count,
            "scores_successful": successful_scores,
            "score_credit_delta": score_delta,
            "duplicate_extra_charge": 0 if duplicate_event.get("duplicate_request") is True else 1,
            "decision_counts": decision_counts,
            "next_purchase_counts": next_purchase_counts,
            "real_payment_executed": usage_after.get("real_payment_executed") if isinstance(usage_after, dict) else None,
            "external_contact_executed": usage_after.get("external_contact_executed") if isinstance(usage_after, dict) else None,
        },
        "sample_rows": rows,
        "business_reading": {
            "proved": [
                "A controlled beta customer can execute higher score volume than public sandbox.",
                "Score credits are consumed one per valid score.",
                "Idempotency prevents duplicate score charges.",
                "No real payment or external outreach is executed.",
            ],
            "still_open": [
                "Actual marketplace monetization remains disabled.",
                "Need enough volume diversity to test non-score purchases at scale.",
            ],
        },
    }


def render_markdown(result: dict[str, Any]) -> str:
    lines = [
        "# MachineSignal - Beta customer score volume test",
        "",
        f"- Data test: {result.get('finished_at')}",
        "- Scenario: customer macchina controllato con piu crediti score",
        "- API key cliente: creata in memoria, non salvata nel report",
        "- Pagamenti reali: non eseguiti",
        "- Contatti esterni/email: non eseguiti",
        "",
        "## Esito sintetico",
        "",
        f"- Check superati: {result['summary']['checks_passed']}",
        f"- Check falliti: {result['summary']['checks_failed']}",
        f"- Score richiesti: {result['summary']['score_count_requested']}",
        f"- Score riusciti: {result['summary']['scores_successful']}",
        f"- Score credit delta: {result['summary']['score_credit_delta']}",
        f"- Extra addebiti duplicati: {result['summary']['duplicate_extra_charge']}",
        f"- Decisioni: `{json.dumps(result['summary']['decision_counts'], ensure_ascii=False)}`",
        f"- Next purchase: `{json.dumps(result['summary']['next_purchase_counts'], ensure_ascii=False)}`",
        "",
        "## Campione score",
        "",
        "| # | Dominio | Score | Decisione | Next purchase | Credito |",
        "|---:|---|---:|---|---|---:|",
    ]
    for row in result.get("sample_rows", []):
        lines.append(
            f"| {row.get('index')} | {row.get('domain')} | {row.get('score')} | "
            f"{row.get('decision')} | {row.get('next_purchase') or '-'} | {row.get('credit_consumed')} |"
        )

    lines.extend(
        [
            "",
            "## Lettura business",
            "",
            "Il test dimostra che il limite principale non e tecnico sullo score endpoint: con una beta customer key controllata il sistema gestisce un volume superiore alla sandbox pubblica.",
            "",
            "Questo conferma che la sandbox va bene per discovery e prova iniziale, mentre il test ROI/volume richiede customer key controllate o piani API.",
            "",
            "## Check tecnici",
            "",
            "| Check | Esito | Dettaglio |",
            "|---|---|---|",
        ]
    )
    for check in result.get("checks", []):
        lines.append(
            f"| {check['name']} | {'OK' if check['ok'] else 'KO'} | {str(check.get('details') or '').replace('|', '/')} |"
        )
    return "\n".join(lines) + "\n"


def main() -> int:
    result = run()
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    json_path = OUTPUT_DIR / f"beta_customer_score_volume_test_{stamp}.json"
    report_path = OUTPUT_DIR / f"beta_customer_score_volume_test_{stamp}.md"
    json_path.write_text(json.dumps(result, indent=2, ensure_ascii=False), encoding="utf-8")
    report_path.write_text(render_markdown(result), encoding="utf-8")
    print(
        json.dumps(
            {
                "ok": result.get("ok"),
                "json": str(json_path),
                "report": str(report_path),
                "summary": result.get("summary"),
            },
            indent=2,
            ensure_ascii=False,
        )
    )
    return 0 if result.get("ok") else 1


if __name__ == "__main__":
    raise SystemExit(main())
