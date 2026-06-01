#!/usr/bin/env python3
"""
MachineSignal budget-cap automatic purchase funnel test.

This test simulates a more realistic machine buyer:
- it scores a batch of domains;
- it reads each score's next_purchase recommendation;
- it buys recommended follow-on products only while a fixed euro budget remains;
- it records skipped recommendations once the budget is exhausted.

No real payment is executed. The admin key is read only from the
MACHINESIGNAL_ADMIN_API_KEY environment variable.
"""

from __future__ import annotations

import csv
import json
import os
import time
import urllib.error
import urllib.request
from datetime import datetime
from pathlib import Path
from typing import Any


BASE_URL = "https://machinesignal-api.beta-878.workers.dev"
OUTPUT_DIR = Path(
    os.environ.get(
        "MACHINESIGNAL_BUDGET_FUNNEL_OUTPUT_DIR",
        str(
            Path(os.environ.get("LOCALAPPDATA", str(Path.home())))
            / "Temp"
            / "MachineSignal"
            / "budget_cap_funnel_test"
        ),
    )
)
SCORE_COUNT = int(os.environ.get("MACHINESIGNAL_BUDGET_FUNNEL_SCORES", "200"))
BUDGET_CAP_EUR = float(os.environ.get("MACHINESIGNAL_BUDGET_FUNNEL_CAP_EUR", "75"))

UNIT_PRICES = {
    "score_pack_1k": 0.099,
    "deep_analysis": 2.99,
    "verification": 0.49,
    "nurture_signal": 0.29,
}

AUTO_PURCHASE_PRODUCTS = {"deep_analysis", "verification", "nurture_signal"}

BASE_DOMAINS = [
    ("quinta-essenza.com", "medicina estetica"),
    ("clinic3.it", "dentist"),
    ("studio-odontoiatrico-demo.it", "dentist"),
    ("avalonbenessere.it", "medicina estetica"),
    ("centromedico-besana.it", "dentist"),
    ("vistavisiongroup.com", "medicina estetica"),
    ("bianchiosteopata.it", "medicina estetica"),
    ("example-dentist-milano.it", "dentist"),
    ("demo-clinic-lombardia.it", "dentist"),
    ("studio-legale-demo.it", "law firm"),
    ("cogebra.com", "real estate"),
    ("valcavallinaimmobili.it", "real estate"),
    ("agenzia-immobiliare-demo.it", "real estate"),
    ("centromedicosanpiox.it", "dentist"),
    ("studiofamilydental.it", "dentist"),
]


def request_json(
    method: str,
    path: str,
    payload: dict[str, Any] | None = None,
    api_key: str | None = None,
    idempotency_key: str | None = None,
    timeout: int = 30,
    max_attempts: int = 8,
) -> tuple[int, Any]:
    headers = {
        "Accept": "application/json,text/plain,*/*",
        "User-Agent": "MachineSignalBudgetCapFunnel/2026-06-01",
    }
    body = None
    if payload is not None:
        body = json.dumps(payload).encode("utf-8")
        headers["Content-Type"] = "application/json"
    if api_key:
        headers["X-API-Key"] = api_key
    if idempotency_key:
        headers["Idempotency-Key"] = idempotency_key

    for attempt in range(max_attempts):
        request = urllib.request.Request(BASE_URL + path, data=body, headers=headers, method=method)
        try:
            with urllib.request.urlopen(request, timeout=timeout) as response:
                raw = response.read().decode("utf-8", errors="replace")
                return int(response.status), parse_payload(raw)
        except urllib.error.HTTPError as exc:
            raw = exc.read().decode("utf-8", errors="replace")
            payload_response = parse_payload(raw)
            if attempt < max_attempts - 1 and is_retryable_kv_rate_limit(exc.code, payload_response):
                time.sleep(1.0 + (attempt * 0.4))
                continue
            return int(exc.code), payload_response
        except urllib.error.URLError as exc:
            if attempt < max_attempts - 1:
                time.sleep(1.0 + (attempt * 0.4))
                continue
            return 599, {"error": "url_error", "message": str(exc)}

    return 599, {"error": "retry_exhausted", "message": "request retry loop exhausted"}


def parse_payload(raw: str) -> Any:
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return raw


def is_retryable_kv_rate_limit(status_code: int, payload: Any) -> bool:
    message = str(payload.get("message") if isinstance(payload, dict) else payload)
    return status_code in {400, 429} and "KV PUT failed: 429" in message


def balance_used(payload: dict[str, Any], product_code: str) -> int:
    for item in payload.get("balances") or []:
        if item.get("product_code") == product_code:
            return int(item.get("credits_used") or 0)
    return 0


def order_id_from(payload: dict[str, Any]) -> str | None:
    if not isinstance(payload, dict):
        return None
    return payload.get("order_intent_id") or (payload.get("order") or {}).get("order_intent_id")


def purchase_to_ledger(product_code: str) -> str:
    return {
        "deep_analysis": "deep_analysis_pack_100",
        "verification": "verification_pack_100",
        "nurture_signal": "nurture_signal_pack_100",
    }[product_code]


def build_domain_payload(index: int) -> dict[str, str]:
    domain, sector = BASE_DOMAINS[index % len(BASE_DOMAINS)]
    return {"domain": domain, "sector_hint": sector, "country_hint": "IT"}


def run() -> dict[str, Any]:
    admin_key = os.environ.get("MACHINESIGNAL_ADMIN_API_KEY", "").strip()
    if not admin_key:
        return {"ok": False, "error": "MACHINESIGNAL_ADMIN_API_KEY is required", "checks": []}

    stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    run_id = f"beta-budget-funnel-{stamp}-{int(time.time())}"
    customer_id = f"beta_budget_funnel_{stamp.lower()}"
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
            "plan": "beta_budget_cap_funnel_test",
            "customer_type": "beta_customer_budget_cap_funnel_test",
            "score_credits": SCORE_COUNT + 10,
            "deep_analysis_credits": SCORE_COUNT,
            "verification_credits": SCORE_COUNT,
            "nurture_signal_credits": SCORE_COUNT,
            "action_pack_credits": 10,
            "target_discovery_credits": 1,
            "domain_enrichment_credits": 1,
            "opportunity_feed_credits": 0,
            "created_by": "agent_budget_cap_funnel_test",
        },
    )
    customer_key = customer.get("api_key") if isinstance(customer, dict) else None
    check("beta_customer_created", status == 200 and isinstance(customer_key, str), f"HTTP {status}")
    if not customer_key:
        return {"ok": False, "checks": checks, "customer_response": customer}

    status, usage_before = request_json("GET", "/v1/usage", api_key=customer_key)
    check("usage_before", status == 200 and isinstance(usage_before, dict), f"HTTP {status}")
    before = {
        "score_pack_1k": balance_used(usage_before if isinstance(usage_before, dict) else {}, "score_pack_1k"),
        "deep_analysis_pack_100": balance_used(usage_before if isinstance(usage_before, dict) else {}, "deep_analysis_pack_100"),
        "verification_pack_100": balance_used(usage_before if isinstance(usage_before, dict) else {}, "verification_pack_100"),
        "nurture_signal_pack_100": balance_used(usage_before if isinstance(usage_before, dict) else {}, "nurture_signal_pack_100"),
    }

    spent_eur = 0.0
    score_revenue_eur = 0.0
    add_on_revenue_eur = 0.0
    successful_scores = 0
    purchase_attempts = 0
    successful_purchases = 0
    skipped_by_budget = 0
    purchase_failures = 0
    decision_counts: dict[str, int] = {}
    recommended_counts: dict[str, int] = {}
    purchase_counts: dict[str, int] = {}
    skipped_counts: dict[str, int] = {}

    for index in range(SCORE_COUNT):
        domain_payload = build_domain_payload(index)
        score_price = UNIT_PRICES["score_pack_1k"]
        if spent_eur + score_price > BUDGET_CAP_EUR:
            rows.append({
                "index": index + 1,
                "domain": domain_payload["domain"],
                "status": "skipped_score_budget_exhausted",
                "spent_eur": round(spent_eur, 4),
            })
            break

        status, score = request_json(
            "POST",
            "/v1/lead-opportunity-score",
            api_key=customer_key,
            idempotency_key=f"{run_id}-score-{index + 1:03d}",
            payload=domain_payload,
        )
        score_ok = status == 200 and isinstance(score, dict) and "opportunity_score" in score
        if not score_ok:
            rows.append({
                "index": index + 1,
                "domain": domain_payload["domain"],
                "status": "score_failed",
                "http_status": status,
                "error": score,
            })
            continue

        successful_scores += 1
        spent_eur += score_price
        score_revenue_eur += score_price
        decision = score.get("decision")
        next_product = (score.get("next_purchase") or {}).get("next_product")
        decision_counts[decision] = decision_counts.get(decision, 0) + 1
        if next_product:
            recommended_counts[next_product] = recommended_counts.get(next_product, 0) + 1

        purchase_status = "not_recommended"
        order_id = None
        purchase_error = None
        if next_product in AUTO_PURCHASE_PRODUCTS:
            unit_price = UNIT_PRICES[next_product]
            if spent_eur + unit_price <= BUDGET_CAP_EUR:
                purchase_attempts += 1
                payload = {
                    "product_code": next_product,
                    "domain": domain_payload["domain"],
                    "source_score_request_id": score.get("request_id"),
                    "reason": f"Budget-capped test: score decision {decision}, next_purchase {next_product}",
                }
                status, purchase = request_json(
                    "POST",
                    "/v1/purchase-intent",
                    api_key=customer_key,
                    idempotency_key=f"{run_id}-purchase-{index + 1:03d}-{next_product}",
                    payload=payload,
                )
                purchase_ok = (
                    status == 200
                    and isinstance(purchase, dict)
                    and purchase.get("status") == "accepted_beta_order_intent"
                )
                if purchase_ok:
                    successful_purchases += 1
                    spent_eur += unit_price
                    add_on_revenue_eur += unit_price
                    purchase_counts[next_product] = purchase_counts.get(next_product, 0) + 1
                    order_id = order_id_from(purchase)
                    purchase_status = "purchased"
                else:
                    purchase_failures += 1
                    purchase_error = purchase
                    purchase_status = "purchase_failed"
            else:
                skipped_by_budget += 1
                skipped_counts[next_product] = skipped_counts.get(next_product, 0) + 1
                purchase_status = "skipped_budget_cap"

        if index < 20 or purchase_status in {"purchase_failed", "skipped_budget_cap"}:
            rows.append({
                "index": index + 1,
                "domain": domain_payload["domain"],
                "score": score.get("opportunity_score"),
                "decision": decision,
                "next_purchase": next_product,
                "purchase_status": purchase_status,
                "order_intent_id": order_id,
                "spent_eur": round(spent_eur, 4),
                "purchase_error": purchase_error,
            })

    status, orders = request_json("GET", "/v1/orders", api_key=customer_key)
    check("orders_readable", status == 200 and isinstance(orders, dict), f"HTTP {status}")
    status, usage_after = request_json("GET", "/v1/usage", api_key=customer_key)
    check("usage_after", status == 200 and isinstance(usage_after, dict), f"HTTP {status}")

    after = {
        "score_pack_1k": balance_used(usage_after if isinstance(usage_after, dict) else {}, "score_pack_1k"),
        "deep_analysis_pack_100": balance_used(usage_after if isinstance(usage_after, dict) else {}, "deep_analysis_pack_100"),
        "verification_pack_100": balance_used(usage_after if isinstance(usage_after, dict) else {}, "verification_pack_100"),
        "nurture_signal_pack_100": balance_used(usage_after if isinstance(usage_after, dict) else {}, "nurture_signal_pack_100"),
    }
    deltas = {key: after[key] - before[key] for key in before}

    check("scores_completed", successful_scores > 0, f"{successful_scores}/{SCORE_COUNT}")
    check("score_delta_expected", deltas["score_pack_1k"] == successful_scores, f"delta={deltas['score_pack_1k']}")
    check("purchase_failures_zero", purchase_failures == 0, f"failures={purchase_failures}")
    for product, ledger_code in {
        "deep_analysis": "deep_analysis_pack_100",
        "verification": "verification_pack_100",
        "nurture_signal": "nurture_signal_pack_100",
    }.items():
        check(
            f"{product}_delta_expected",
            deltas[ledger_code] == purchase_counts.get(product, 0),
            f"delta={deltas[ledger_code]}, purchases={purchase_counts.get(product, 0)}",
        )
    check(
        "budget_not_exceeded",
        spent_eur <= BUDGET_CAP_EUR + 0.0001,
        f"spent={spent_eur:.2f}, cap={BUDGET_CAP_EUR:.2f}",
    )
    check(
        "safety_flags",
        isinstance(usage_after, dict)
        and usage_after.get("real_payment_executed") is False
        and usage_after.get("external_contact_executed") is False
        and (orders or {}).get("real_payment_executed") is False
        and (orders or {}).get("external_contact_executed") is False,
        "beta flags must remain false",
    )

    failed = [item for item in checks if not item["ok"]]
    return {
        "ok": not failed,
        "test_name": "beta_customer_budget_cap_funnel_test",
        "finished_at": datetime.now().isoformat(timespec="seconds"),
        "budget_cap_eur": BUDGET_CAP_EUR,
        "unit_prices": UNIT_PRICES,
        "checks": checks,
        "summary": {
            "checks_passed": len(checks) - len(failed),
            "checks_failed": len(failed),
            "score_count_requested": SCORE_COUNT,
            "scores_successful": successful_scores,
            "purchase_recommendations": sum(
                count for product, count in recommended_counts.items() if product in AUTO_PURCHASE_PRODUCTS
            ),
            "purchase_attempts": purchase_attempts,
            "successful_purchases": successful_purchases,
            "skipped_by_budget": skipped_by_budget,
            "purchase_failures": purchase_failures,
            "spent_eur": round(spent_eur, 2),
            "unused_budget_eur": round(max(0, BUDGET_CAP_EUR - spent_eur), 2),
            "score_revenue_eur": round(score_revenue_eur, 2),
            "add_on_revenue_eur": round(add_on_revenue_eur, 2),
            "total_revenue_eur": round(score_revenue_eur + add_on_revenue_eur, 2),
            "revenue_per_initial_score_eur": round((score_revenue_eur + add_on_revenue_eur) / max(1, successful_scores), 4),
            "decision_counts": decision_counts,
            "recommended_counts": recommended_counts,
            "purchase_counts": purchase_counts,
            "skipped_counts": skipped_counts,
            "credit_deltas": deltas,
            "orders_count": orders.get("count") if isinstance(orders, dict) else None,
            "real_payment_executed": usage_after.get("real_payment_executed") if isinstance(usage_after, dict) else None,
            "external_contact_executed": usage_after.get("external_contact_executed") if isinstance(usage_after, dict) else None,
        },
        "sample_rows": rows,
    }


def render_markdown(result: dict[str, Any]) -> str:
    s = result["summary"]
    lines = [
        "# MachineSignal - Budget-cap automatic funnel test",
        "",
        f"- Data test: {result['finished_at']}",
        f"- Score richiesti: {s['score_count_requested']}",
        f"- Budget massimo simulato: {result['budget_cap_eur']:.2f} euro",
        "- Pagamenti reali: non eseguiti",
        "- Contatti esterni/email: non eseguiti",
        "",
        "## Esito sintetico",
        "",
        f"- Check superati: {s['checks_passed']}",
        f"- Check falliti: {s['checks_failed']}",
        f"- Score riusciti: {s['scores_successful']}",
        f"- Raccomandazioni acquistabili: {s['purchase_recommendations']}",
        f"- Acquisti tentati: {s['purchase_attempts']}",
        f"- Acquisti riusciti: {s['successful_purchases']}",
        f"- Acquisti saltati per budget: {s['skipped_by_budget']}",
        f"- Spesa/ricavo simulato: {s['spent_eur']} euro",
        f"- Budget residuo: {s['unused_budget_eur']} euro",
        f"- Ricavo medio per score eseguito: {s['revenue_per_initial_score_eur']} euro",
        "",
        "## Mix",
        "",
        f"- Decisioni score: `{json.dumps(s['decision_counts'], ensure_ascii=False)}`",
        f"- Raccomandazioni: `{json.dumps(s['recommended_counts'], ensure_ascii=False)}`",
        f"- Acquisti eseguiti: `{json.dumps(s['purchase_counts'], ensure_ascii=False)}`",
        f"- Saltati per budget: `{json.dumps(s['skipped_counts'], ensure_ascii=False)}`",
        "",
        "## Ricavi simulati",
        "",
        f"- Score: {s['score_revenue_eur']} euro",
        f"- Add-on: {s['add_on_revenue_eur']} euro",
        f"- Totale: {s['total_revenue_eur']} euro",
        "",
        "## Lettura business",
        "",
        "Questo test è più realistico del funnel senza limiti, perché la macchina non compra ogni approfondimento possibile: si ferma quando il budget impostato non consente nuovi acquisti.",
        "",
        "Il risultato serve a tarare il P&L: non dobbiamo usare la conversione tecnica massima, ma una conversione compatibile con budget cap, regole di priorità e rischio di spreco.",
        "",
        "## Campione operativo",
        "",
        "| # | Dominio | Score | Decisione | Next purchase | Stato acquisto | Speso |",
        "|---:|---|---:|---|---|---|---:|",
    ]
    for row in result.get("sample_rows", []):
        lines.append(
            f"| {row.get('index')} | {row.get('domain')} | {row.get('score', '-')} | "
            f"{row.get('decision', '-')} | {row.get('next_purchase', '-')} | "
            f"{row.get('purchase_status', row.get('status', '-'))} | {row.get('spent_eur', '-')} |"
        )
    lines.extend(["", "## Check tecnici", "", "| Check | Esito | Dettaglio |", "|---|---|---|"])
    for check in result.get("checks", []):
        lines.append(f"| {check['name']} | {'OK' if check['ok'] else 'KO'} | {check.get('details') or ''} |")
    return "\n".join(lines) + "\n"


def write_csv(result: dict[str, Any], path: Path) -> None:
    rows = result.get("sample_rows", [])
    if not rows:
        return
    keys = sorted({key for row in rows for key in row.keys() if key != "purchase_error"})
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=keys)
        writer.writeheader()
        for row in rows:
            writer.writerow({key: row.get(key) for key in keys})


def main() -> int:
    result = run()
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    json_path = OUTPUT_DIR / "budget_cap_funnel_test_result_20260601.json"
    report_path = OUTPUT_DIR / "budget_cap_funnel_test_report_20260601.md"
    csv_path = OUTPUT_DIR / "budget_cap_funnel_test_rows_20260601.csv"
    json_path.write_text(json.dumps(result, indent=2, ensure_ascii=False), encoding="utf-8")
    report_path.write_text(render_markdown(result), encoding="utf-8")
    write_csv(result, csv_path)
    print(json.dumps({
        "ok": result.get("ok"),
        "json": str(json_path),
        "report": str(report_path),
        "csv": str(csv_path),
        "summary": result.get("summary"),
    }, indent=2, ensure_ascii=False))
    return 0 if result.get("ok") else 1


if __name__ == "__main__":
    raise SystemExit(main())
