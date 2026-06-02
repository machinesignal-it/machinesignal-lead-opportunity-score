#!/usr/bin/env python3
"""
MachineSignal natural Action Pack funnel test.

This test simulates a prudent machine buyer:
- score 100 domains;
- buy the recommended score add-on only when the score endpoint recommends it;
- buy Action Pack only after Deep Analysis and only when stricter machine gates pass;
- audit the customer ledger through the admin audit endpoint.

No real payment is executed. No external contact is executed.
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


BASE_URL = os.environ.get("MACHINESIGNAL_BASE_URL", "https://machinesignal-api.beta-878.workers.dev").rstrip("/")
SCORE_COUNT = int(os.environ.get("MACHINESIGNAL_NATURAL_ACTION_SCORES", "100"))
OUTPUT_DIR = Path(os.environ.get("MACHINESIGNAL_NATURAL_ACTION_OUTPUT_DIR", ".")).resolve()

UNIT_PRICES_EUR = {
    "score_pack_1k": 0.099,
    "deep_analysis": 2.99,
    "verification": 1.00,
    "nurture_signal": 1.00,
    "action_pack": 15.96,
}

BASE_TARGETS = [
    ("quinta-essenza.com", "medicina estetica", "IT"),
    ("clinic3.it", "dentist", "IT"),
    ("studio-odontoiatrico-demo.it", "dentist", "IT"),
    ("avalonbenessere.it", "medicina estetica", "IT"),
    ("centromedico-besana.it", "dentist", "IT"),
    ("vistavisiongroup.com", "medicina estetica", "IT"),
    ("bianchiosteopata.it", "medicina estetica", "IT"),
    ("example-dentist-milano.it", "dentist", "IT"),
    ("demo-clinic-lombardia.it", "dentist", "IT"),
    ("studio-legale-demo.it", "law firm", "IT"),
    ("cogebra.com", "real estate", "IT"),
    ("valcavallinaimmobili.it", "real estate", "IT"),
    ("agenzia-immobiliare-demo.it", "real estate", "IT"),
    ("centromedicosanpiox.it", "dentist", "IT"),
    ("studiofamilydental.it", "dentist", "IT"),
    ("studio-bianco-avvocati.it", "law firm", "IT"),
    ("impresa-edile-demo.it", "construction", "IT"),
    ("agenzia-marketing-demo.it", "marketing agency", "IT"),
    ("tecnocasa.it", "real estate", "IT"),
    ("farmacia-demo.it", "medicina estetica", "IT"),
]

AUTO_PURCHASE_PRODUCTS = {"deep_analysis", "verification", "nurture_signal"}


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
        "User-Agent": "MachineSignalNaturalActionPackFunnel/2026-06-02",
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
            parsed = parse_payload(raw)
            if attempt < max_attempts - 1 and is_retryable_rate_limit(exc.code, parsed):
                time.sleep(1.0 + attempt * 0.4)
                continue
            return int(exc.code), parsed
        except urllib.error.URLError as exc:
            if attempt < max_attempts - 1:
                time.sleep(1.0 + attempt * 0.4)
                continue
            return 599, {"error": "url_error", "message": str(exc)}
    return 599, {"error": "retry_exhausted", "message": "request retry loop exhausted"}


def parse_payload(raw: str) -> Any:
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return raw


def is_retryable_rate_limit(status_code: int, payload: Any) -> bool:
    message = str(payload.get("message") if isinstance(payload, dict) else payload)
    return status_code in {400, 429, 500} and ("429" in message or "rate" in message.lower())


def target_payload(index: int) -> dict[str, str]:
    domain, sector, country = BASE_TARGETS[index % len(BASE_TARGETS)]
    return {"domain": domain, "sector_hint": sector, "country_hint": country}


def order_id_from(payload: Any) -> str | None:
    if not isinstance(payload, dict):
        return None
    return payload.get("order_intent_id") or (payload.get("order") or {}).get("order_intent_id")


def count_items(items: list[dict[str, Any]], key: str) -> dict[str, int]:
    counts: dict[str, int] = {}
    for item in items:
        value = item.get(key)
        if value:
            counts[value] = counts.get(value, 0) + 1
    return counts


def buy_action_pack_gate(score: dict[str, Any], deep_delivery: dict[str, Any]) -> tuple[bool, str]:
    score_value = int(score.get("opportunity_score") or 0)
    confidence = float(score.get("confidence") or 0)
    decision = str(score.get("decision") or "")
    quality_status = str((score.get("quality_review") or {}).get("status") or "")
    deep_status = str(deep_delivery.get("status") or "")
    recommended_next = ((deep_delivery.get("recommended_next_step") or {}).get("product_code") or "").strip()
    stop_rules = deep_delivery.get("stop_rules") or []

    if decision != "buy_deep_analysis":
        return False, "score did not recommend deep analysis"
    if score_value < 80:
        return False, "score below natural action threshold 80"
    if confidence < 0.70:
        return False, "confidence below natural action threshold 0.70"
    if "mismatch" in quality_status or "needs_verification" in quality_status:
        return False, "quality review requires verification"
    if deep_status != "deep_analysis_ready":
        return False, "deep analysis was not ready"
    if recommended_next != "action_pack":
        return False, "deep analysis did not recommend action pack"
    if not stop_rules:
        return False, "deep analysis did not return stop rules"
    return True, "score, confidence, quality and deep analysis gates passed"


def run() -> dict[str, Any]:
    admin_key = os.environ.get("MACHINESIGNAL_ADMIN_API_KEY", "").strip()
    if not admin_key:
        return {"ok": False, "error": "MACHINESIGNAL_ADMIN_API_KEY is required"}

    stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    run_id = f"natural-action-pack-{stamp}-{int(time.time())}"
    customer_id = f"natural_action_{stamp.lower()}"
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
            "plan": "natural_action_pack_funnel_test",
            "customer_type": "beta_customer_natural_action_pack_funnel_test",
            "score_credits": SCORE_COUNT + 10,
            "deep_analysis_credits": SCORE_COUNT,
            "verification_credits": SCORE_COUNT,
            "nurture_signal_credits": SCORE_COUNT,
            "action_pack_credits": SCORE_COUNT,
            "target_discovery_credits": 1,
            "domain_enrichment_credits": 1,
            "opportunity_feed_credits": 0,
            "created_by": "agent_natural_action_pack_funnel_test",
        },
    )
    customer_key = customer.get("api_key") if isinstance(customer, dict) else None
    check("beta_customer_created", status == 200 and bool(customer_key), f"HTTP {status}")
    if not customer_key:
        return {"ok": False, "checks": checks, "customer_response": customer}

    score_rows: list[dict[str, Any]] = []
    purchase_rows: list[dict[str, Any]] = []
    score_failures = 0
    purchase_failures = 0
    natural_action_pack_candidates = 0
    natural_action_pack_blocked = 0

    for index in range(SCORE_COUNT):
        target = target_payload(index)
        status, score = request_json(
            "POST",
            "/v1/lead-opportunity-score",
            api_key=customer_key,
            idempotency_key=f"{run_id}-score-{index + 1:03d}",
            payload=target,
        )
        if not (status == 200 and isinstance(score, dict) and "opportunity_score" in score):
            score_failures += 1
            rows.append({
                "index": index + 1,
                "domain": target["domain"],
                "sector_hint": target["sector_hint"],
                "stage": "score_failed",
                "http_status": status,
                "error": score,
            })
            continue

        next_product = ((score.get("next_purchase") or {}).get("next_product") or "").strip() or None
        score_row = {
            "index": index + 1,
            "domain": target["domain"],
            "sector_hint": target["sector_hint"],
            "score": score.get("opportunity_score"),
            "confidence": score.get("confidence"),
            "decision": score.get("decision"),
            "priority": score.get("priority"),
            "next_product": next_product,
            "score_request_id": score.get("request_id"),
            "quality_review_status": (score.get("quality_review") or {}).get("status"),
        }
        score_rows.append(score_row)
        rows.append({**score_row, "stage": "score"})

        if next_product not in AUTO_PURCHASE_PRODUCTS:
            continue

        status, purchase = request_json(
            "POST",
            "/v1/purchase-intent",
            api_key=customer_key,
            idempotency_key=f"{run_id}-purchase-{index + 1:03d}-{next_product}",
            payload={
                "product_code": next_product,
                "domain": target["domain"],
                "source_score_request_id": score.get("request_id"),
                "reason": f"Natural machine flow: score decision {score.get('decision')} recommended {next_product}",
                "max_budget_eur": UNIT_PRICES_EUR[next_product],
            },
        )
        purchase_ok = (
            status == 200
            and isinstance(purchase, dict)
            and purchase.get("status") == "accepted_beta_order_intent"
        )
        if not purchase_ok:
            purchase_failures += 1
            rows.append({
                **score_row,
                "stage": f"{next_product}_purchase_failed",
                "http_status": status,
                "error": purchase,
            })
            continue

        order_id = order_id_from(purchase)
        purchase_row = {
            **score_row,
            "stage": "purchase",
            "product_code": next_product,
            "order_intent_id": order_id,
            "delivery_status": ((purchase.get("delivery") or {}).get("status") if isinstance(purchase, dict) else None),
        }
        purchase_rows.append(purchase_row)
        rows.append(purchase_row)

        if next_product != "deep_analysis":
            continue

        delivery = purchase.get("delivery") or {}
        should_buy_action, action_reason = buy_action_pack_gate(score, delivery)
        if should_buy_action:
            natural_action_pack_candidates += 1
        else:
            natural_action_pack_blocked += 1
            rows.append({
                **score_row,
                "stage": "action_pack_not_bought",
                "product_code": "action_pack",
                "action_pack_gate_reason": action_reason,
                "source_deep_order_intent_id": order_id,
            })
            continue

        status, action_purchase = request_json(
            "POST",
            "/v1/purchase-intent",
            api_key=customer_key,
            idempotency_key=f"{run_id}-action-pack-{index + 1:03d}",
            payload={
                "product_code": "action_pack",
                "domain": target["domain"],
                "source_score_request_id": score.get("request_id"),
                "source_order_intent_id": order_id,
                "reason": f"Natural machine gate passed after deep analysis: {action_reason}",
                "max_budget_eur": UNIT_PRICES_EUR["action_pack"],
            },
        )
        action_ok = (
            status == 200
            and isinstance(action_purchase, dict)
            and action_purchase.get("status") == "accepted_beta_order_intent"
        )
        if not action_ok:
            purchase_failures += 1
            rows.append({
                **score_row,
                "stage": "action_pack_purchase_failed",
                "http_status": status,
                "error": action_purchase,
                "source_deep_order_intent_id": order_id,
            })
            continue

        action_row = {
            **score_row,
            "stage": "purchase",
            "product_code": "action_pack",
            "order_intent_id": order_id_from(action_purchase),
            "delivery_status": (action_purchase.get("delivery") or {}).get("status"),
            "action_pack_gate_reason": action_reason,
            "source_deep_order_intent_id": order_id,
        }
        purchase_rows.append(action_row)
        rows.append(action_row)

    status, usage = request_json("GET", "/v1/usage", api_key=customer_key)
    check("usage_readable", status == 200 and isinstance(usage, dict), f"HTTP {status}")
    status, orders = request_json("GET", "/v1/orders", api_key=customer_key)
    check("orders_readable", status == 200 and isinstance(orders, dict), f"HTTP {status}")
    status, audit = request_json(
        "GET",
        f"/v1/admin/audit-report?customer_id={customer_id}",
        api_key=admin_key,
    )
    check("audit_readable", status == 200 and isinstance(audit, dict), f"HTTP {status}")

    audit_summary = audit.get("summary") if isinstance(audit, dict) else {}
    product_reconciliation = audit.get("product_reconciliation") if isinstance(audit, dict) else []
    safety = audit.get("safety") if isinstance(audit, dict) else {}
    ledger_backend = audit.get("ledger_backend") if isinstance(audit, dict) else None
    reconciliation_ok = bool(audit_summary.get("reconciliation_ok")) if isinstance(audit_summary, dict) else False
    score_reconciliation = next(
        (
            item
            for item in product_reconciliation or []
            if item.get("product_code") == "score_pack_1k"
        ),
        {},
    )

    check("scores_completed", len(score_rows) == SCORE_COUNT, f"{len(score_rows)}/{SCORE_COUNT}")
    check("score_failures_zero", score_failures == 0, f"failures={score_failures}")
    check("purchase_failures_zero", purchase_failures == 0, f"failures={purchase_failures}")
    check("ledger_backend_durable_object", ledger_backend == "durable_object", str(ledger_backend))
    check("audit_reconciliation_ok", reconciliation_ok is True, str(reconciliation_ok))
    check(
        "safety_flags_false",
        safety.get("real_payment_executed") is False and safety.get("external_contact_executed") is False,
        json.dumps(safety, ensure_ascii=False),
    )

    decisions = count_items(score_rows, "decision")
    next_products = count_items(score_rows, "next_product")
    purchases = count_items(purchase_rows, "product_code")
    score_count = len(score_rows)
    deep_count = purchases.get("deep_analysis", 0)
    action_count = purchases.get("action_pack", 0)
    simulated_revenue = float(audit_summary.get("simulated_revenue_eur") or 0)
    revenue_per_score = round(simulated_revenue / score_count, 4) if score_count else 0
    deep_to_action_rate = round(action_count / deep_count, 4) if deep_count else 0

    return {
        "ok": not [item for item in checks if not item["ok"]],
        "test_name": "natural_action_pack_funnel_test",
        "finished_at": datetime.now().isoformat(timespec="seconds"),
        "customer_id": customer_id,
        "customer_key_created": bool(customer_key),
        "checks": checks,
        "summary": {
            "scores_requested": SCORE_COUNT,
            "scores_completed": score_count,
            "score_failures": score_failures,
            "purchase_failures": purchase_failures,
            "orders_count": audit_summary.get("order_count"),
            "audit_score_credits_used": score_reconciliation.get("credits_used"),
            "simulated_revenue_eur": round(simulated_revenue, 2),
            "revenue_per_score_eur": revenue_per_score,
            "ledger_backend": ledger_backend,
            "reconciliation_ok": reconciliation_ok,
            "ready_for_real_payments": audit_summary.get("ready_for_real_payments"),
            "real_payment_executed": safety.get("real_payment_executed"),
            "external_contact_executed": safety.get("external_contact_executed"),
            "decisions": decisions,
            "next_products": next_products,
            "purchases": purchases,
            "natural_action_pack_candidates": natural_action_pack_candidates,
            "natural_action_pack_blocked_after_deep": natural_action_pack_blocked,
            "score_to_deep_analysis_rate": round(deep_count / score_count, 4) if score_count else 0,
            "deep_analysis_to_action_pack_rate": deep_to_action_rate,
            "product_reconciliation": product_reconciliation,
        },
        "rows": rows,
    }


def render_markdown(result: dict[str, Any]) -> str:
    s = result["summary"]
    lines = [
        "# MachineSignal - Natural Action Pack funnel test",
        "",
        f"- Data test: {result['finished_at']}",
        f"- Customer: `{result['customer_id']}`",
        "- Pagamenti reali: non eseguiti",
        "- Contatti esterni/email: non eseguiti",
        "",
        "## Esito sintetico",
        "",
        f"- Score richiesti: {s['scores_requested']}",
        f"- Score completati: {s['scores_completed']}",
        f"- Ordini registrati: {s['orders_count']}",
        f"- Ledger backend: `{s['ledger_backend']}`",
        f"- Riconciliazione audit: `{s['reconciliation_ok']}`",
        f"- Ricavo simulato: {s['simulated_revenue_eur']} EUR",
        f"- Ricavo medio per score: {s['revenue_per_score_eur']} EUR",
        f"- Pagamenti reali: `{s['real_payment_executed']}`",
        f"- Contatti esterni: `{s['external_contact_executed']}`",
        "",
        "## Mix decisioni e acquisti",
        "",
        f"- Decisioni score: `{json.dumps(s['decisions'], ensure_ascii=False)}`",
        f"- Next product raccomandati: `{json.dumps(s['next_products'], ensure_ascii=False)}`",
        f"- Acquisti eseguiti: `{json.dumps(s['purchases'], ensure_ascii=False)}`",
        f"- Deep Analysis -> Action Pack rate: {s['deep_analysis_to_action_pack_rate']}",
        f"- Score -> Deep Analysis rate: {s['score_to_deep_analysis_rate']}",
        f"- Action Pack candidati naturali: {s['natural_action_pack_candidates']}",
        f"- Action Pack bloccati dopo Deep Analysis: {s['natural_action_pack_blocked_after_deep']}",
        "",
        "## Lettura commerciale",
        "",
        "Questo test misura una macchina prudente: l'Action Pack non viene comprato automaticamente dopo ogni Deep Analysis. Viene comprato solo quando score, confidence, quality review e Deep Analysis superano soglie chiare.",
        "",
        "Se il ricavo medio resta interessante anche con questa regola, il modello commerciale e' piu' credibile per un cliente macchina. Se invece cala troppo, significa che il listino deve essere spostato verso pacchetti ricorrenti, discovery o verification follow-through.",
        "",
        "## Riconciliazione prodotti",
        "",
        "| Prodotto ledger | Crediti usati | Ordini | Ricavo simulato | OK |",
        "|---|---:|---:|---:|---|",
    ]
    for item in s.get("product_reconciliation") or []:
        lines.append(
            f"| {item.get('product_code')} | {item.get('credits_used')} | {item.get('order_count')} | "
            f"{item.get('simulated_revenue_eur')} | {item.get('credits_reconcile')} |"
        )

    lines.extend([
        "",
        "## Campione operativo",
        "",
        "| # | Dominio | Score | Conf. | Decisione | Prodotto | Stage | Gate Action Pack |",
        "|---:|---|---:|---:|---|---|---|---|",
    ])
    for row in result.get("rows", [])[:80]:
        lines.append(
            f"| {row.get('index')} | {row.get('domain')} | {row.get('score', '')} | "
            f"{row.get('confidence', '')} | {row.get('decision', '')} | "
            f"{row.get('product_code') or row.get('next_product') or ''} | "
            f"{row.get('stage', '')} | {row.get('action_pack_gate_reason', '')} |"
        )

    lines.extend(["", "## Check", "", "| Check | Esito | Dettaglio |", "|---|---|---|"])
    for check in result.get("checks", []):
        lines.append(f"| {check['name']} | {'OK' if check['ok'] else 'KO'} | {check.get('details') or ''} |")
    return "\n".join(lines) + "\n"


def write_csv(result: dict[str, Any], path: Path) -> None:
    rows = result.get("rows", [])
    if not rows:
        return
    fieldnames = sorted({key for row in rows for key in row.keys() if key != "error"})
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        for row in rows:
            writer.writerow({key: row.get(key) for key in fieldnames})


def main() -> int:
    result = run()
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    suffix = datetime.now().strftime("%Y%m%d_%H%M%S")
    json_path = OUTPUT_DIR / f"natural_action_pack_funnel_summary_{suffix}.json"
    md_path = OUTPUT_DIR / f"natural_action_pack_funnel_report_{suffix}.md"
    csv_path = OUTPUT_DIR / f"natural_action_pack_funnel_rows_{suffix}.csv"
    json_path.write_text(json.dumps(result, indent=2, ensure_ascii=False), encoding="utf-8")
    md_path.write_text(render_markdown(result), encoding="utf-8")
    write_csv(result, csv_path)
    print(json.dumps({
        "ok": result.get("ok"),
        "summary": result.get("summary"),
        "json": str(json_path),
        "report": str(md_path),
        "csv": str(csv_path),
    }, indent=2, ensure_ascii=False))
    return 0 if result.get("ok") else 1


if __name__ == "__main__":
    raise SystemExit(main())
