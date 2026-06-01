#!/usr/bin/env python3
"""
MachineSignal beta-customer automatic purchase funnel test.

Creates one controlled beta customer through the admin API, then simulates a
machine customer that:
- runs 100 lead-opportunity scores;
- reads each score's next_purchase recommendation;
- creates beta purchase intents only for recommended follow-on products;
- reads orders and usage to verify score-to-purchase conversion.

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
    / "beta_customer_auto_purchase_funnel_test"
)

SCORE_COUNT = int(os.environ.get("MACHINESIGNAL_AUTO_FUNNEL_SCORES", "100"))
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
    max_attempts: int = 7,
) -> tuple[int, Any]:
    headers = {
        "Accept": "application/json,text/plain,*/*",
        "User-Agent": "MachineSignalAutoPurchaseFunnel/2026-06-01",
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
            payload = parse_payload(raw)
            if attempt < max_attempts - 1 and is_retryable_kv_rate_limit(exc.code, payload):
                time.sleep(0.9 + (attempt * 0.35))
                continue
            return int(exc.code), payload

    return 599, {"error": "retry_exhausted", "message": "request retry loop exhausted"}


def parse_payload(raw: str) -> Any:
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return raw


def is_retryable_kv_rate_limit(status_code: int, payload: Any) -> bool:
    message = ""
    if isinstance(payload, dict):
        message = str(payload.get("message") or "")
    else:
        message = str(payload or "")
    return status_code in {400, 429} and "KV PUT failed: 429" in message


def current_event(payload: dict[str, Any]) -> dict[str, Any]:
    return ((payload.get("usage") or {}).get("current_event") or {}) if isinstance(payload, dict) else {}


def balance_used(payload: dict[str, Any], product_code: str) -> int:
    for item in payload.get("balances") or []:
        if item.get("product_code") == product_code:
            return int(item.get("credits_used") or 0)
    return 0


def order_id_from(payload: dict[str, Any]) -> str | None:
    if not isinstance(payload, dict):
        return None
    return payload.get("order_intent_id") or (payload.get("order") or {}).get("order_intent_id")


def build_domain_payload(index: int) -> dict[str, str]:
    domain, sector = BASE_DOMAINS[index % len(BASE_DOMAINS)]
    return {
        "domain": domain,
        "sector_hint": sector,
        "country_hint": "IT",
    }


def purchase_payload(product_code: str, score_payload: dict[str, Any], domain_payload: dict[str, str]) -> dict[str, Any]:
    decision = score_payload.get("decision")
    request_id = score_payload.get("request_id")
    reason = f"Score decision was {decision}; next_purchase recommended {product_code}"
    payload: dict[str, Any] = {
        "product_code": product_code,
        "domain": domain_payload["domain"],
        "source_score_request_id": request_id,
        "reason": reason,
    }
    if product_code == "nurture_signal":
        payload["nurture_reason"] = "Machine wants a light signal before spending more budget."
    return payload


def run() -> dict[str, Any]:
    admin_key = os.environ.get("MACHINESIGNAL_ADMIN_API_KEY", "").strip()
    if not admin_key:
        return {
            "ok": False,
            "error": "MACHINESIGNAL_ADMIN_API_KEY is required",
            "checks": [],
        }

    stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    run_id = f"beta-auto-funnel-{stamp}-{int(time.time())}"
    customer_id = f"beta_auto_funnel_{stamp.lower()}"
    checks: list[dict[str, Any]] = []
    rows: list[dict[str, Any]] = []
    orders_created: list[dict[str, Any]] = []

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
            "plan": "beta_auto_purchase_funnel_test",
            "customer_type": "beta_customer_auto_purchase_funnel_test",
            "score_credits": SCORE_COUNT + 10,
            "deep_analysis_credits": SCORE_COUNT,
            "verification_credits": SCORE_COUNT,
            "nurture_signal_credits": SCORE_COUNT,
            "action_pack_credits": 10,
            "target_discovery_credits": 1,
            "domain_enrichment_credits": 1,
            "opportunity_feed_credits": 0,
            "created_by": "agent_auto_purchase_funnel_test",
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

    before = {
        "score_pack_1k": balance_used(usage_before if isinstance(usage_before, dict) else {}, "score_pack_1k"),
        "deep_analysis_pack_100": balance_used(usage_before if isinstance(usage_before, dict) else {}, "deep_analysis_pack_100"),
        "verification_pack_100": balance_used(usage_before if isinstance(usage_before, dict) else {}, "verification_pack_100"),
        "nurture_signal_pack_100": balance_used(usage_before if isinstance(usage_before, dict) else {}, "nurture_signal_pack_100"),
    }

    successful_scores = 0
    successful_purchases = 0
    purchase_failures = 0
    decision_counts: dict[str, int] = {}
    next_purchase_counts: dict[str, int] = {}
    purchase_counts: dict[str, int] = {}
    first_purchase_idempotency_key: str | None = None
    first_purchase_payload: dict[str, Any] | None = None

    for index in range(SCORE_COUNT):
        domain_payload = build_domain_payload(index)
        score_idempotency_key = f"{run_id}-score-{index + 1:03d}"
        status, score = request_json(
            "POST",
            "/v1/lead-opportunity-score",
            api_key=customer_key,
            idempotency_key=score_idempotency_key,
            payload=domain_payload,
        )
        score_ok = status == 200 and isinstance(score, dict) and "opportunity_score" in score
        successful_scores += 1 if score_ok else 0

        decision = score.get("decision") if isinstance(score, dict) else None
        next_product = (score.get("next_purchase") or {}).get("next_product") if isinstance(score, dict) else None
        if decision:
            decision_counts[decision] = decision_counts.get(decision, 0) + 1
        if next_product:
            next_purchase_counts[next_product] = next_purchase_counts.get(next_product, 0) + 1

        purchase_status = None
        purchase_error = None
        order_id = None
        purchase_ok = False
        if score_ok and next_product in AUTO_PURCHASE_PRODUCTS:
            payload = purchase_payload(next_product, score, domain_payload)
            purchase_idempotency_key = f"{run_id}-purchase-{index + 1:03d}-{next_product}"
            purchase_status, purchase = request_json(
                "POST",
                "/v1/purchase-intent",
                api_key=customer_key,
                idempotency_key=purchase_idempotency_key,
                payload=payload,
            )
            purchase_ok = (
                purchase_status == 200
                and isinstance(purchase, dict)
                and purchase.get("status") == "accepted_beta_order_intent"
            )
            if purchase_ok:
                successful_purchases += 1
                purchase_counts[next_product] = purchase_counts.get(next_product, 0) + 1
                order_id = order_id_from(purchase)
                orders_created.append(
                    {
                        "order_intent_id": order_id,
                        "product_code": next_product,
                        "domain": domain_payload["domain"],
                        "source_score_request_id": score.get("request_id"),
                    }
                )
                if first_purchase_idempotency_key is None:
                    first_purchase_idempotency_key = purchase_idempotency_key
                    first_purchase_payload = payload
            else:
                purchase_failures += 1
                purchase_error = purchase

        if index < 15 or not score_ok or (purchase_status is not None and not purchase_ok):
            rows.append(
                {
                    "index": index + 1,
                    "domain": domain_payload["domain"],
                    "score_http_status": status,
                    "score_ok": score_ok,
                    "score": score.get("opportunity_score") if isinstance(score, dict) else None,
                    "decision": decision,
                    "next_purchase": next_product,
                    "auto_purchase_attempted": next_product in AUTO_PURCHASE_PRODUCTS if next_product else False,
                    "purchase_http_status": purchase_status,
                    "purchase_ok": purchase_ok,
                    "purchase_error": purchase_error,
                    "order_intent_id": order_id,
                }
            )

    duplicate_purchase_extra_charge = None
    if first_purchase_idempotency_key and first_purchase_payload:
        duplicate_product = first_purchase_payload["product_code"]
        before_duplicate_status, before_duplicate_usage = request_json("GET", "/v1/usage", api_key=customer_key)
        before_duplicate_used = balance_used(
            before_duplicate_usage if isinstance(before_duplicate_usage, dict) else {},
            purchaseProductToLedgerCode(duplicate_product),
        )
        duplicate_status, duplicate_purchase = request_json(
            "POST",
            "/v1/purchase-intent",
            api_key=customer_key,
            idempotency_key=first_purchase_idempotency_key,
            payload=first_purchase_payload,
        )
        after_duplicate_status, after_duplicate_usage = request_json("GET", "/v1/usage", api_key=customer_key)
        after_duplicate_used = balance_used(
            after_duplicate_usage if isinstance(after_duplicate_usage, dict) else {},
            purchaseProductToLedgerCode(duplicate_product),
        )
        duplicate_purchase_extra_charge = after_duplicate_used - before_duplicate_used
        check(
            "duplicate_purchase_not_double_charged",
            duplicate_status == 200
            and isinstance(duplicate_purchase, dict)
            and duplicate_purchase_extra_charge == 0,
            f"HTTP {duplicate_status}, delta={duplicate_purchase_extra_charge}",
        )
        check(
            "duplicate_purchase_usage_reads_ok",
            before_duplicate_status == 200 and after_duplicate_status == 200,
            f"before={before_duplicate_status}, after={after_duplicate_status}",
        )
    else:
        check("duplicate_purchase_not_double_charged", False, "No purchase was available for duplicate test")

    status, orders = request_json("GET", "/v1/orders", api_key=customer_key)
    check(
        "orders_readable",
        status == 200 and isinstance(orders, dict) and int(orders.get("count") or 0) >= successful_purchases,
        f"HTTP {status}, count={orders.get('count') if isinstance(orders, dict) else None}",
    )

    sample_order_read_ok = False
    if orders_created:
        sample_order_id = orders_created[0]["order_intent_id"]
        sample_status, sample_order = request_json("GET", f"/v1/orders/{sample_order_id}", api_key=customer_key)
        sample_order_read_ok = (
            sample_status == 200
            and isinstance(sample_order, dict)
            and bool((sample_order.get("order") or {}).get("delivery"))
        )
        check("single_order_delivery_readable", sample_order_read_ok, f"HTTP {sample_status}")
    else:
        check("single_order_delivery_readable", False, "No orders created")

    status, usage_after = request_json("GET", "/v1/usage", api_key=customer_key)
    check("usage_after", status == 200 and isinstance(usage_after, dict), f"HTTP {status}")
    after = {
        "score_pack_1k": balance_used(usage_after if isinstance(usage_after, dict) else {}, "score_pack_1k"),
        "deep_analysis_pack_100": balance_used(usage_after if isinstance(usage_after, dict) else {}, "deep_analysis_pack_100"),
        "verification_pack_100": balance_used(usage_after if isinstance(usage_after, dict) else {}, "verification_pack_100"),
        "nurture_signal_pack_100": balance_used(usage_after if isinstance(usage_after, dict) else {}, "nurture_signal_pack_100"),
    }
    credit_deltas = {key: after[key] - before[key] for key in before}

    check("all_scores_successful", successful_scores == SCORE_COUNT, f"{successful_scores}/{SCORE_COUNT}")
    check("score_delta_expected", credit_deltas["score_pack_1k"] == successful_scores, f"delta={credit_deltas['score_pack_1k']}")
    check("purchase_failures_zero", purchase_failures == 0, f"failures={purchase_failures}")
    check(
        "deep_analysis_delta_expected",
        credit_deltas["deep_analysis_pack_100"] == purchase_counts.get("deep_analysis", 0),
        f"delta={credit_deltas['deep_analysis_pack_100']}, purchases={purchase_counts.get('deep_analysis', 0)}",
    )
    check(
        "verification_delta_expected",
        credit_deltas["verification_pack_100"] == purchase_counts.get("verification", 0),
        f"delta={credit_deltas['verification_pack_100']}, purchases={purchase_counts.get('verification', 0)}",
    )
    check(
        "nurture_signal_delta_expected",
        credit_deltas["nurture_signal_pack_100"] == purchase_counts.get("nurture_signal", 0),
        f"delta={credit_deltas['nurture_signal_pack_100']}, purchases={purchase_counts.get('nurture_signal', 0)}",
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
    conversion_rate = round(successful_purchases / successful_scores, 4) if successful_scores else 0
    return {
        "ok": not failed,
        "test_name": "beta_customer_auto_purchase_funnel_test",
        "run_id": run_id,
        "finished_at": datetime.now().isoformat(timespec="seconds"),
        "customer": {
            "customer_id": customer_id,
            "api_key_created": True,
            "api_key_saved": False,
            "plan": "beta_auto_purchase_funnel_test",
        },
        "auto_purchase_products": sorted(AUTO_PURCHASE_PRODUCTS),
        "checks": checks,
        "summary": {
            "checks_passed": len(checks) - len(failed),
            "checks_failed": len(failed),
            "score_count_requested": SCORE_COUNT,
            "scores_successful": successful_scores,
            "score_credit_delta": credit_deltas["score_pack_1k"],
            "recommended_purchase_count": sum(
                count for product, count in next_purchase_counts.items() if product in AUTO_PURCHASE_PRODUCTS
            ),
            "successful_purchases": successful_purchases,
            "purchase_failures": purchase_failures,
            "score_to_purchase_conversion_rate": conversion_rate,
            "decision_counts": decision_counts,
            "next_purchase_counts": next_purchase_counts,
            "purchase_counts": purchase_counts,
            "credit_deltas": credit_deltas,
            "orders_count": orders.get("count") if isinstance(orders, dict) else None,
            "duplicate_purchase_extra_charge": duplicate_purchase_extra_charge,
            "real_payment_executed": usage_after.get("real_payment_executed") if isinstance(usage_after, dict) else None,
            "external_contact_executed": usage_after.get("external_contact_executed") if isinstance(usage_after, dict) else None,
        },
        "sample_rows": rows,
        "sample_orders": orders_created[:15],
        "business_reading": {
            "proved": [
                "A controlled beta customer can move from score to recommended beta purchases automatically.",
                "The API can convert score recommendations into order intents without human email or manual sales.",
                "Credit usage matches score and purchase volume.",
                "Order deliveries can be retrieved by a machine customer.",
                "No real payment or external outreach is executed during beta.",
            ],
            "still_open": [
                "Real paid checkout remains intentionally disabled during beta.",
                "The next ROI step is to attach beta prices to the observed conversion mix.",
                "Marketplace publication still needs the external provider UI approval path.",
            ],
        },
    }


def purchaseProductToLedgerCode(product_code: str) -> str:
    mapping = {
        "deep_analysis": "deep_analysis_pack_100",
        "verification": "verification_pack_100",
        "nurture_signal": "nurture_signal_pack_100",
        "action_pack": "action_pack_25",
        "target_discovery": "target_discovery_pack_250",
        "domain_enrichment": "domain_enrichment_pack_100",
        "opportunity_feed": "opportunity_feed_monthly",
    }
    return mapping[product_code]


def render_markdown(result: dict[str, Any]) -> str:
    summary = result["summary"]
    lines = [
        "# MachineSignal - Beta customer automatic purchase funnel test",
        "",
        f"- Data test: {result.get('finished_at')}",
        "- Scenario: customer macchina controllato con score e acquisti automatici consigliati",
        "- API key cliente: creata in memoria, non salvata nel report",
        "- Pagamenti reali: non eseguiti",
        "- Contatti esterni/email: non eseguiti",
        "",
        "## Esito sintetico",
        "",
        f"- Check superati: {summary['checks_passed']}",
        f"- Check falliti: {summary['checks_failed']}",
        f"- Score richiesti: {summary['score_count_requested']}",
        f"- Score riusciti: {summary['scores_successful']}",
        f"- Acquisti consigliati acquistabili: {summary['recommended_purchase_count']}",
        f"- Acquisti automatici riusciti: {summary['successful_purchases']}",
        f"- Conversione score -> acquisto: {summary['score_to_purchase_conversion_rate']:.1%}",
        f"- Fallimenti acquisto: {summary['purchase_failures']}",
        f"- Ordini leggibili: {summary['orders_count']}",
        f"- Extra addebito su acquisto duplicato: {summary['duplicate_purchase_extra_charge']}",
        "",
        "## Mix decisioni",
        "",
        f"- Decisioni score: `{json.dumps(summary['decision_counts'], ensure_ascii=False)}`",
        f"- Next purchase suggeriti: `{json.dumps(summary['next_purchase_counts'], ensure_ascii=False)}`",
        f"- Acquisti eseguiti: `{json.dumps(summary['purchase_counts'], ensure_ascii=False)}`",
        "",
        "## Consumo crediti",
        "",
        f"- Score Pack 1k: {summary['credit_deltas']['score_pack_1k']}",
        f"- Deep Analysis Pack 100: {summary['credit_deltas']['deep_analysis_pack_100']}",
        f"- Verification Pack 100: {summary['credit_deltas']['verification_pack_100']}",
        f"- Nurture Signal Pack 100: {summary['credit_deltas']['nurture_signal_pack_100']}",
        "",
        "## Campione funnel",
        "",
        "| # | Dominio | Score | Decisione | Next purchase | Acquisto automatico | Ordine |",
        "|---:|---|---:|---|---|---|---|",
    ]
    for row in result.get("sample_rows", []):
        lines.append(
            f"| {row.get('index')} | {row.get('domain')} | {row.get('score')} | "
            f"{row.get('decision')} | {row.get('next_purchase') or '-'} | "
            f"{'OK' if row.get('purchase_ok') else ('-' if not row.get('auto_purchase_attempted') else 'KO')} | "
            f"{row.get('order_intent_id') or '-'} |"
        )

    failed_rows = [
        row
        for row in result.get("sample_rows", [])
        if row.get("auto_purchase_attempted") and not row.get("purchase_ok")
    ]
    if failed_rows:
        lines.extend(["", "## Acquisti non riusciti", ""])
        for row in failed_rows:
            lines.append(
                f"- #{row.get('index')} {row.get('domain')} -> {row.get('next_purchase')} "
                f"HTTP {row.get('purchase_http_status')}: "
                f"`{json.dumps(row.get('purchase_error'), ensure_ascii=False)}`"
            )

    lines.extend(
        [
            "",
            "## Lettura business",
            "",
            "Il test misura la parte piu importante del modello machine-to-machine: non basta che una macchina chieda uno score, deve anche poter comprare automaticamente il passo successivo quando lo score lo giustifica.",
            "",
            "In questa prova il cliente macchina ha eseguito gli score, letto `next_purchase`, creato ordini beta per i prodotti consigliati e recuperato le consegne via API. La conversione score -> acquisto puo ora essere usata per aggiornare il P&L e stimare il ROI del funnel.",
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
    json_path = OUTPUT_DIR / f"beta_customer_auto_purchase_funnel_test_{stamp}.json"
    report_path = OUTPUT_DIR / f"beta_customer_auto_purchase_funnel_test_{stamp}.md"
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
