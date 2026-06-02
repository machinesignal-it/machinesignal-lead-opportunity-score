#!/usr/bin/env python3
"""
MachineSignal 50-target real/semi-real Target Discovery mini test.

This test starts from a curated public-domain target list for dentists and dental
clinics in Lombardy, then simulates the machine buying flow:
- target discovery pack order;
- score 50 targets;
- buy recommended add-ons;
- buy Action Pack only through a prudent machine gate;
- audit ledger and safety flags.

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
TARGET_CSV_INPUT = os.environ.get(
    "MACHINESIGNAL_TARGET_CSV",
    "target_discovery_mini_50_dentists_lombardy_targets_20260602.csv",
)
EXPECTED_TARGET_COUNT = int(os.environ.get("MACHINESIGNAL_EXPECTED_TARGET_COUNT", "50"))
RUN_LABEL = os.environ.get("MACHINESIGNAL_RUN_LABEL", "target_discovery_mini_50_dentists_lombardy")
REPORT_TITLE = os.environ.get("MACHINESIGNAL_REPORT_TITLE", "MachineSignal - Target Discovery Mini 50 test")
OUTPUT_DIR = Path(os.environ.get("MACHINESIGNAL_MINI_50_OUTPUT_DIR", ".")).resolve()

UNIT_PRICES_EUR = {
    "target_discovery": 149.00,
    "score_pack_1k": 0.099,
    "deep_analysis": 2.99,
    "verification": 1.00,
    "nurture_signal": 1.00,
    "action_pack": 15.96,
}

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
        "User-Agent": "MachineSignalMini50TargetDiscovery/2026-06-02",
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
            if attempt < max_attempts - 1 and is_retryable(exc.code, parsed):
                time.sleep(1.0 + attempt * 0.4)
                continue
            return int(exc.code), parsed
        except urllib.error.URLError as exc:
            if attempt < max_attempts - 1:
                time.sleep(1.0 + attempt * 0.4)
                continue
            return 599, {"error": "url_error", "message": str(exc)}
    return 599, {"error": "retry_exhausted"}


def parse_payload(raw: str) -> Any:
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return raw


def is_retryable(status_code: int, payload: Any) -> bool:
    message = str(payload.get("message") if isinstance(payload, dict) else payload)
    return status_code in {400, 429, 500} and ("429" in message or "rate" in message.lower())


def read_targets() -> list[dict[str, str]]:
    paths = [
        Path(item.strip())
        for item in TARGET_CSV_INPUT.replace(",", ";").split(";")
        if item.strip()
    ]
    rows: list[dict[str, str]] = []
    for path in paths:
        rows.extend(csv.DictReader(path.open(encoding="utf-8")))
    seen: set[str] = set()
    clean_rows: list[dict[str, str]] = []
    for row in rows:
        domain = row.get("domain", "").strip().lower()
        if not domain or domain in seen:
            continue
        seen.add(domain)
        clean_rows.append(row)
    return clean_rows


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
    return True, "score, confidence, quality and deep analysis gates passed"


def product_revenue(product_reconciliation: list[dict[str, Any]], product_code: str) -> float:
    for item in product_reconciliation or []:
        if item.get("product_code") == product_code:
            return float(item.get("simulated_revenue_eur") or 0)
    return 0.0


def run() -> dict[str, Any]:
    admin_key = os.environ.get("MACHINESIGNAL_ADMIN_API_KEY", "").strip()
    if not admin_key:
        return {"ok": False, "error": "MACHINESIGNAL_ADMIN_API_KEY is required"}

    targets = read_targets()
    stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    run_id = f"{RUN_LABEL}-{stamp}-{int(time.time())}".replace("_", "-")
    customer_id = f"{RUN_LABEL}_{stamp.lower()}".replace("-", "_")[:80]
    checks: list[dict[str, Any]] = []
    rows: list[dict[str, Any]] = []
    score_rows: list[dict[str, Any]] = []
    purchase_rows: list[dict[str, Any]] = []

    def check(name: str, ok: bool, details: str = "") -> None:
        checks.append({"name": name, "ok": bool(ok), "details": details})

    check(
        f"target_count_{EXPECTED_TARGET_COUNT}",
        len(targets) == EXPECTED_TARGET_COUNT,
        f"targets={len(targets)}",
    )
    check("target_domains_unique", len({row['domain'].lower() for row in targets}) == len(targets), "dedupe by domain")

    status, customer = request_json(
        "POST",
        "/v1/beta/customers",
        api_key=admin_key,
        idempotency_key=f"{run_id}-create-customer",
        payload={
            "customer_id": customer_id,
            "contact_email": "beta@machinesignal.it",
            "plan": "target_discovery_mini_50_dentists_lombardy",
            "customer_type": "beta_customer_target_discovery_mini_50_test",
            "score_credits": EXPECTED_TARGET_COUNT + 10,
            "deep_analysis_credits": EXPECTED_TARGET_COUNT,
            "verification_credits": EXPECTED_TARGET_COUNT,
            "nurture_signal_credits": EXPECTED_TARGET_COUNT,
            "action_pack_credits": max(20, EXPECTED_TARGET_COUNT // 2),
            "target_discovery_credits": 1,
            "domain_enrichment_credits": 5,
            "opportunity_feed_credits": 0,
            "created_by": "agent_target_discovery_mini_50_test",
        },
    )
    customer_key = customer.get("api_key") if isinstance(customer, dict) else None
    check("beta_customer_created", status == 200 and bool(customer_key), f"HTTP {status}")
    if not customer_key:
        return {"ok": False, "checks": checks, "customer_response": customer}

    status, discovery = request_json(
        "POST",
        "/v1/purchase-intent",
        api_key=customer_key,
        idempotency_key=f"{run_id}-target-discovery-mini-50",
        payload={
            "product_code": "target_discovery",
            "market": "dentist",
            "area": "Lombardia",
            "commercial_objective": (
                "find dental clinic websites in Lombardy worth scoring for digital presence "
                "improvement and machine-prepared commercial action opportunities"
            ),
            "max_budget_eur": UNIT_PRICES_EUR["target_discovery"],
            "reason": f"{EXPECTED_TARGET_COUNT}-target real/semi-real target discovery test before scaling to 250.",
        },
    )
    discovery_order_id = order_id_from(discovery)
    discovery_ok = status == 200 and isinstance(discovery, dict) and discovery.get("status") == "accepted_beta_order_intent"
    check("target_discovery_order_created", discovery_ok, f"HTTP {status}, order={discovery_order_id}")
    if discovery_ok:
        purchase_rows.append({"stage": "purchase", "product_code": "target_discovery", "order_intent_id": discovery_order_id})
        rows.append({"stage": "target_discovery", "product_code": "target_discovery", "order_intent_id": discovery_order_id, "status": discovery.get("status")})

    score_failures = 0
    purchase_failures = 0
    action_pack_candidates = 0
    action_pack_blocked = 0

    for index, target in enumerate(targets, start=1):
        domain = target["domain"].strip().lower()
        status, score = request_json(
            "POST",
            "/v1/lead-opportunity-score",
            api_key=customer_key,
            idempotency_key=f"{run_id}-score-{index:03d}",
            payload={
                "domain": domain,
                "sector_hint": "dentist",
                "country_hint": "IT",
                "target_name": target.get("target_name"),
                "category_hint": target.get("category"),
                "initial_signals": target.get("initial_signals"),
                "commercial_objective": "digital presence improvement and CRM-ready action opportunity",
            },
        )
        if not (status == 200 and isinstance(score, dict) and "opportunity_score" in score):
            score_failures += 1
            rows.append({"stage": "score_failed", "domain": domain, "http_status": status, "error": score})
            continue

        next_product = ((score.get("next_purchase") or {}).get("next_product") or "").strip() or None
        commercial_strength = (score.get("commercial_strength") or {})
        score_row = {
            "index": index,
            "stage": "score",
            "target_name": target.get("target_name"),
            "domain": domain,
            "city": target.get("city"),
            "province": target.get("province"),
            "source_url": target.get("source_url"),
            "score": score.get("opportunity_score"),
            "confidence": score.get("confidence"),
            "decision": score.get("decision"),
            "priority": score.get("priority"),
            "commercial_strength": commercial_strength.get("level"),
            "spend_policy": commercial_strength.get("spend_policy"),
            "next_product": next_product,
            "score_request_id": score.get("request_id"),
            "quality_review_status": (score.get("quality_review") or {}).get("status"),
        }
        score_rows.append(score_row)
        rows.append(score_row)

        if next_product not in AUTO_PURCHASE_PRODUCTS:
            continue

        status, purchase = request_json(
            "POST",
            "/v1/purchase-intent",
            api_key=customer_key,
            idempotency_key=f"{run_id}-purchase-{index:03d}-{next_product}",
            payload={
                "product_code": next_product,
                "domain": domain,
                "source_score_request_id": score.get("request_id"),
                "source_order_intent_id": discovery_order_id,
                "reason": f"Mini 50 flow: score decision {score.get('decision')} recommended {next_product}",
                "max_budget_eur": UNIT_PRICES_EUR[next_product],
            },
        )
        purchase_ok = status == 200 and isinstance(purchase, dict) and purchase.get("status") == "accepted_beta_order_intent"
        if not purchase_ok:
            purchase_failures += 1
            rows.append({**score_row, "stage": f"{next_product}_purchase_failed", "http_status": status})
            continue

        order_id = order_id_from(purchase)
        add_on_row = {
            **score_row,
            "stage": "purchase",
            "product_code": next_product,
            "order_intent_id": order_id,
            "delivery_status": (purchase.get("delivery") or {}).get("status"),
        }
        purchase_rows.append(add_on_row)
        rows.append(add_on_row)

        if next_product != "deep_analysis":
            continue

        should_buy_action, action_reason = buy_action_pack_gate(score, purchase.get("delivery") or {})
        if should_buy_action:
            action_pack_candidates += 1
        else:
            action_pack_blocked += 1
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
            idempotency_key=f"{run_id}-action-pack-{index:03d}",
            payload={
                "product_code": "action_pack",
                "domain": domain,
                "source_score_request_id": score.get("request_id"),
                "source_order_intent_id": order_id,
                "reason": f"Mini 50 natural gate passed after deep analysis: {action_reason}",
                "max_budget_eur": UNIT_PRICES_EUR["action_pack"],
            },
        )
        action_ok = status == 200 and isinstance(action_purchase, dict) and action_purchase.get("status") == "accepted_beta_order_intent"
        if not action_ok:
            purchase_failures += 1
            rows.append({**score_row, "stage": "action_pack_purchase_failed", "http_status": status})
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

    status, audit = request_json("GET", f"/v1/admin/audit-report?customer_id={customer_id}", api_key=admin_key)
    check("audit_readable", status == 200 and isinstance(audit, dict), f"HTTP {status}")
    audit_summary = audit.get("summary") if isinstance(audit, dict) else {}
    product_reconciliation = audit.get("product_reconciliation") if isinstance(audit, dict) else []
    safety = audit.get("safety") if isinstance(audit, dict) else {}
    reconciliation_ok = bool(audit_summary.get("reconciliation_ok")) if isinstance(audit_summary, dict) else False

    check(
        f"scores_completed_{EXPECTED_TARGET_COUNT}",
        len(score_rows) == EXPECTED_TARGET_COUNT,
        f"{len(score_rows)}/{EXPECTED_TARGET_COUNT}",
    )
    check("score_failures_zero", score_failures == 0, f"failures={score_failures}")
    check("purchase_failures_zero", purchase_failures == 0, f"failures={purchase_failures}")
    check("audit_reconciliation_ok", reconciliation_ok is True, str(reconciliation_ok))
    check(
        "safety_flags_false",
        safety.get("real_payment_executed") is False and safety.get("external_contact_executed") is False,
        json.dumps(safety, ensure_ascii=False),
    )

    target_discovery_revenue = product_revenue(product_reconciliation, "target_discovery_pack_250")
    total_revenue = float(audit_summary.get("simulated_revenue_eur") or 0)
    downstream_revenue = total_revenue - target_discovery_revenue
    score_count = len(score_rows)
    deep_count = sum(1 for row in purchase_rows if row.get("product_code") == "deep_analysis")
    action_count = sum(1 for row in purchase_rows if row.get("product_code") == "action_pack")

    return {
        "ok": not [item for item in checks if not item["ok"]],
        "test_name": f"{RUN_LABEL}_test",
        "finished_at": datetime.now().isoformat(timespec="seconds"),
        "customer_id": customer_id,
        "checks": checks,
        "summary": {
            "targets_loaded": len(targets),
            "targets_scored": score_count,
            "orders_count": audit_summary.get("order_count"),
            "simulated_revenue_eur": round(total_revenue, 2),
            "target_discovery_revenue_eur": round(target_discovery_revenue, 2),
            "downstream_revenue_eur": round(downstream_revenue, 2),
            "downstream_revenue_per_target_eur": round(downstream_revenue / score_count, 4) if score_count else 0,
            "ledger_backend": audit.get("ledger_backend") if isinstance(audit, dict) else None,
            "reconciliation_ok": reconciliation_ok,
            "real_payment_executed": safety.get("real_payment_executed"),
            "external_contact_executed": safety.get("external_contact_executed"),
            "decisions": count_items(score_rows, "decision"),
            "next_products": count_items(score_rows, "next_product"),
            "commercial_strength": count_items(score_rows, "commercial_strength"),
            "purchases": count_items(purchase_rows, "product_code"),
            "score_to_deep_analysis_rate": round(deep_count / score_count, 4) if score_count else 0,
            "deep_analysis_to_action_pack_rate": round(action_count / deep_count, 4) if deep_count else 0,
            "action_pack_candidates": action_pack_candidates,
            "action_pack_blocked_after_deep": action_pack_blocked,
            "product_reconciliation": product_reconciliation,
        },
        "rows": rows,
    }


def render_markdown(result: dict[str, Any]) -> str:
    s = result["summary"]
    lines = [
        f"# {REPORT_TITLE}",
        "",
        f"- Data test: {result['finished_at']}",
        f"- Customer: `{result['customer_id']}`",
        "- Pagamenti reali: non eseguiti",
        "- Contatti esterni/email: non eseguiti",
        "",
        "## Esito sintetico",
        "",
        f"- Target caricati: {s['targets_loaded']}",
        f"- Target segnati: {s['targets_scored']}",
        f"- Ordini beta registrati: {s['orders_count']}",
        f"- Ledger backend: `{s['ledger_backend']}`",
        f"- Audit riconciliato: `{s['reconciliation_ok']}`",
        f"- Ricavo simulato totale: {s['simulated_revenue_eur']} EUR",
        f"- Ricavo Target Discovery: {s['target_discovery_revenue_eur']} EUR",
        f"- Ricavo downstream: {s['downstream_revenue_eur']} EUR",
        f"- Ricavo downstream per target: {s['downstream_revenue_per_target_eur']} EUR",
        "",
        "## Mix",
        "",
        f"- Decisioni score: `{json.dumps(s['decisions'], ensure_ascii=False)}`",
        f"- Next product raccomandati: `{json.dumps(s['next_products'], ensure_ascii=False)}`",
        f"- Commercial strength: `{json.dumps(s.get('commercial_strength', {}), ensure_ascii=False)}`",
        f"- Acquisti eseguiti: `{json.dumps(s['purchases'], ensure_ascii=False)}`",
        f"- Score -> Deep Analysis rate: {s['score_to_deep_analysis_rate']}",
        f"- Deep Analysis -> Action Pack rate: {s['deep_analysis_to_action_pack_rate']}",
        "",
        "## Lettura commerciale",
        "",
        f"Questo test parte da una lista reale/semi-reale di {s['targets_loaded']} domini pubblici di studi dentistici e cliniche odontoiatriche lombarde. Serve a capire se un Target Discovery ridotto puo' generare downstream revenue dopo lo score.",
        "",
        "La lista non contiene contatti personali e non attiva outreach: valuta solo domini e acquisti beta machine-to-machine.",
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
        "| # | Dominio | Citta' | Score | Conf. | Decisione | Strength | Prodotto | Stage |",
        "|---:|---|---|---:|---:|---|---|---|",
    ])
    for row in result.get("rows", []):
        if row.get("stage") == "target_discovery":
            continue
        lines.append(
            f"| {row.get('index', '')} | {row.get('domain', '')} | {row.get('city', '')} | "
            f"{row.get('score', '')} | {row.get('confidence', '')} | {row.get('decision', '')} | "
            f"{row.get('commercial_strength', '')} | "
            f"{row.get('product_code') or row.get('next_product') or ''} | {row.get('stage', '')} |"
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
    json_path = OUTPUT_DIR / f"{RUN_LABEL}_summary_{suffix}.json"
    md_path = OUTPUT_DIR / f"{RUN_LABEL}_report_{suffix}.md"
    csv_path = OUTPUT_DIR / f"{RUN_LABEL}_rows_{suffix}.csv"
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
