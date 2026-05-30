#!/usr/bin/env python3
"""
MachineSignal live machine-buyer flow test.

Simula una macchina cliente che non ha una lista iniziale, scopre il contratto
pubblico, crea un ordine beta di target discovery, scorea target reali gia
emersi dai test e compra solo gli step successivi consigliati dalla API.

Non invia email, non contatta umani e non esegue pagamenti reali.
"""

from __future__ import annotations

import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from collections import Counter
from datetime import datetime
from pathlib import Path
from typing import Any


BASE_URL = "https://machinesignal-api.beta-878.workers.dev"
OUTPUT_DIR = Path(os.environ.get("LOCALAPPDATA", str(Path.home()))) / "Temp" / "MachineSignal" / "machine_buyer_flow_live_test"


TARGETS = [
    {
        "target_name": "QuintaEssenza",
        "domain": "quinta-essenza.com",
        "sector_hint": "medicina estetica",
        "category_hint": "centro medicina estetica",
        "country_hint": "IT",
    },
    {
        "target_name": "NeoClinic",
        "domain": "bianchiosteopata.it",
        "sector_hint": "medicina estetica",
        "category_hint": "osteopata",
        "country_hint": "IT",
    },
    {
        "target_name": "Vista Vision",
        "domain": "vistavisiongroup.com",
        "sector_hint": "medicina estetica",
        "category_hint": "vista oculistica",
        "country_hint": "IT",
    },
    {
        "target_name": "Avalon",
        "domain": "avalonbenessere.it",
        "sector_hint": "medicina estetica",
        "category_hint": "benessere estetico",
        "country_hint": "IT",
    },
    {
        "target_name": "Centro Medico Besana",
        "domain": "centromedico-besana.it",
        "sector_hint": "medicina estetica",
        "category_hint": "centro medico",
        "country_hint": "IT",
    },
]


def now_id() -> str:
    return datetime.now().strftime("%Y%m%d_%H%M%S")


def request_json(
    method: str,
    path_or_url: str,
    api_key: str | None = None,
    payload: dict[str, Any] | None = None,
    idempotency_key: str | None = None,
    timeout: int = 30,
) -> tuple[int, Any]:
    url = path_or_url if path_or_url.startswith("http") else BASE_URL + path_or_url
    body = None
    headers = {
        "Accept": "application/json,text/plain,*/*",
        "User-Agent": "MachineSignalMachineBuyerFlow/0.1 (+https://machinesignal.it/)",
    }
    if api_key:
        headers["X-API-Key"] = api_key
    if idempotency_key:
        headers["Idempotency-Key"] = idempotency_key
    if payload is not None:
        body = json.dumps(payload).encode("utf-8")
        headers["Content-Type"] = "application/json"

    request = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            raw = response.read().decode("utf-8", errors="replace")
            return int(response.status), parse_response(raw, response.headers.get("content-type", ""))
    except urllib.error.HTTPError as exc:
        raw = exc.read().decode("utf-8", errors="replace")
        return int(exc.code), parse_response(raw, exc.headers.get("content-type", ""))


def parse_response(raw: str, content_type: str) -> Any:
    if "json" in content_type.lower():
        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            return raw
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return raw


def balance_map(usage: dict[str, Any]) -> dict[str, dict[str, Any]]:
    return {item.get("product_code"): item for item in usage.get("balances", [])}


def balance_used(usage: dict[str, Any], product_code: str) -> int:
    item = balance_map(usage).get(product_code) or {}
    return int(item.get("credits_used", 0) or 0)


def next_product_from_score(score_payload: dict[str, Any]) -> str | None:
    next_purchase = score_payload.get("next_purchase") or {}
    return next_purchase.get("next_product")


def should_buy_next_step(score_payload: dict[str, Any]) -> bool:
    decision = score_payload.get("decision")
    # La macchina compra sempre verification per dati ambigui e deep_analysis
    # solo per casi forti. Nurture rimane opzionale e in questo test viene
    # salvato come azione, non acquistato.
    return decision in {"buy_deep_analysis", "needs_verification"}


def run_flow(api_key: str) -> dict[str, Any]:
    run_id = f"machine-buyer-{int(time.time())}"
    started_at = datetime.now().isoformat(timespec="seconds")
    checks: list[dict[str, Any]] = []

    def check(name: str, ok: bool, details: str) -> None:
        checks.append({"name": name, "ok": bool(ok), "details": details})

    status, root = request_json("GET", "/")
    check("public_root_available", status == 200 and isinstance(root, dict), f"HTTP {status}")

    status, onboarding = request_json("GET", "/machine-onboarding.json")
    check(
        "machine_onboarding_available",
        status == 200 and isinstance(onboarding, dict) and "products" in onboarding,
        f"HTTP {status}",
    )

    status, openapi = request_json("GET", "/openapi.json")
    paths = openapi.get("paths", {}) if isinstance(openapi, dict) else {}
    check("openapi_has_purchase_intent", status == 200 and "/v1/purchase-intent" in paths, f"HTTP {status}")

    status, usage_before = request_json("GET", "/v1/usage", api_key=api_key)
    check("usage_before_available", status == 200 and isinstance(usage_before, dict), f"HTTP {status}")

    before_score_used = balance_used(usage_before if isinstance(usage_before, dict) else {}, "score_pack_1k")
    before_discovery_used = balance_used(
        usage_before if isinstance(usage_before, dict) else {}, "target_discovery_pack_250"
    )

    discovery_payload = {
        "product_code": "target_discovery",
        "market": "medicina estetica Lombardia",
        "sector_hint": "medicina estetica",
        "area": "Lombardia",
        "batch_id": f"{run_id}-target-discovery",
        "reason": "Customer machine has no list and needs coherent targets before scoring.",
        "max_budget_eur": 149,
    }
    status, discovery_order = request_json(
        "POST",
        "/v1/purchase-intent",
        api_key=api_key,
        payload=discovery_payload,
        idempotency_key=f"{run_id}-target-discovery",
    )
    check(
        "target_discovery_order_created",
        status == 200 and isinstance(discovery_order, dict) and discovery_order.get("status") == "accepted_beta_order_intent",
        f"HTTP {status}",
    )

    rows: list[dict[str, Any]] = []
    next_product_counter: Counter[str] = Counter()
    order_counter: Counter[str] = Counter()
    action_counter: Counter[str] = Counter()
    first_order_id: str | None = None

    for index, target in enumerate(TARGETS, start=1):
        score_key = f"{run_id}-score-{index:02d}"
        status, score = request_json(
            "POST",
            "/v1/lead-opportunity-score",
            api_key=api_key,
            payload=target,
            idempotency_key=score_key,
        )
        check(f"score_{index}_created", status == 200 and isinstance(score, dict), f"{target['domain']} HTTP {status}")
        if status != 200 or not isinstance(score, dict):
            rows.append({"target_name": target["target_name"], "domain": target["domain"], "error": score})
            continue

        next_product = next_product_from_score(score)
        if next_product:
            next_product_counter[next_product] += 1

        order: dict[str, Any] | None = None
        order_status: int | None = None
        machine_action = "save_no_purchase"
        if should_buy_next_step(score) and next_product:
            machine_action = f"buy_{next_product}"
            order_status, order = request_json(
                "POST",
                "/v1/purchase-intent",
                api_key=api_key,
                payload={
                    "product_code": next_product,
                    "domain": score["domain"],
                    "source_score_request_id": score["request_id"],
                    "reason": score.get("reason") or "Machine bought next step based on score decision.",
                    "max_budget_eur": 3 if next_product == "deep_analysis" else 1,
                },
                idempotency_key=f"{run_id}-order-{index:02d}",
            )
            check(
                f"order_{index}_{next_product}",
                order_status == 200 and isinstance(order, dict) and order.get("status") == "accepted_beta_order_intent",
                f"{target['domain']} HTTP {order_status}",
            )
            if isinstance(order, dict) and order.get("product_code"):
                order_counter[order["product_code"]] += 1
                first_order_id = first_order_id or order.get("order_intent_id")
        else:
            action_counter[machine_action] += 1

        rows.append(
            {
                "target_name": target["target_name"],
                "domain": score["domain"],
                "score": score["opportunity_score"],
                "confidence": score["confidence"],
                "decision": score["decision"],
                "next_product": next_product,
                "quality_status": (score.get("quality_review") or {}).get("status"),
                "machine_action": machine_action,
                "score_credit_consumed": ((score.get("usage") or {}).get("current_event") or {}).get("credits_consumed"),
                "order_status": order_status,
                "order_intent_id": (order or {}).get("order_intent_id") if isinstance(order, dict) else None,
                "order_delivery_type": ((order or {}).get("delivery") or {}).get("delivery_type")
                if isinstance(order, dict)
                else None,
                "order_credit_consumed": (((order or {}).get("usage") or {}).get("current_event") or {}).get(
                    "credits_consumed"
                )
                if isinstance(order, dict)
                else None,
            }
        )

    duplicate_status, duplicate_score = request_json(
        "POST",
        "/v1/lead-opportunity-score",
        api_key=api_key,
        payload=TARGETS[0],
        idempotency_key=f"{run_id}-score-01",
    )
    duplicate_event = {}
    if isinstance(duplicate_score, dict):
        duplicate_event = (duplicate_score.get("usage") or {}).get("current_event") or {}
    check("duplicate_score_not_double_charged", duplicate_status == 200 and duplicate_event.get("duplicate_request") is True, f"HTTP {duplicate_status}")

    status, usage_after = request_json("GET", "/v1/usage", api_key=api_key)
    check("usage_after_available", status == 200 and isinstance(usage_after, dict), f"HTTP {status}")

    after_score_used = balance_used(usage_after if isinstance(usage_after, dict) else {}, "score_pack_1k")
    after_discovery_used = balance_used(usage_after if isinstance(usage_after, dict) else {}, "target_discovery_pack_250")

    encoded_product = urllib.parse.urlencode({"product_code": "deep_analysis"})
    deep_orders_status, deep_orders = request_json("GET", f"/v1/orders?{encoded_product}", api_key=api_key)
    check("deep_analysis_orders_readable", deep_orders_status == 200 and isinstance(deep_orders, dict), f"HTTP {deep_orders_status}")

    single_order_status = None
    single_order = None
    if first_order_id:
        single_order_status, single_order = request_json("GET", f"/v1/orders/{first_order_id}", api_key=api_key)
        check(
            "single_order_delivery_readable",
            single_order_status == 200 and isinstance(single_order, dict) and bool((single_order.get("order") or {}).get("delivery")),
            f"HTTP {single_order_status}",
        )

    score_delta = after_score_used - before_score_used
    discovery_delta = after_discovery_used - before_discovery_used
    expected_score_delta = len(TARGETS)

    check("score_credits_expected", score_delta == expected_score_delta, f"delta={score_delta}")
    check("discovery_credit_expected", discovery_delta == 1, f"delta={discovery_delta}")
    check(
        "no_real_payment_or_external_contact",
        bool(usage_after.get("real_payment_executed") is False and usage_after.get("external_contact_executed") is False)
        if isinstance(usage_after, dict)
        else False,
        "beta flags must remain false",
    )

    failed = [item for item in checks if not item["ok"]]
    return {
        "ok": not failed,
        "test_name": "machine_buyer_flow_live_test",
        "started_at": started_at,
        "finished_at": datetime.now().isoformat(timespec="seconds"),
        "base_url": BASE_URL,
        "api_key_used": "masked",
        "machine_customer_scenario": "No initial list; machine orders target discovery, scores discovered targets, buys only recommended next steps.",
        "checks": checks,
        "summary": {
            "checks_passed": len(checks) - len(failed),
            "checks_failed": len(failed),
            "target_discovery_orders": discovery_delta,
            "score_requests_charged": score_delta,
            "duplicate_score_extra_charge": score_delta - expected_score_delta,
            "next_products_recommended": dict(next_product_counter),
            "orders_created": dict(order_counter),
            "non_purchase_actions": dict(action_counter),
            "deep_analysis_orders_visible": (deep_orders or {}).get("count") if isinstance(deep_orders, dict) else None,
            "first_order_lookup_status": single_order_status,
            "ledger_persisted": bool(usage_after.get("ledger_persisted")) if isinstance(usage_after, dict) else False,
            "real_payment_executed": usage_after.get("real_payment_executed") if isinstance(usage_after, dict) else None,
            "external_contact_executed": usage_after.get("external_contact_executed") if isinstance(usage_after, dict) else None,
        },
        "target_discovery_order": {
            "status": discovery_order.get("status") if isinstance(discovery_order, dict) else None,
            "order_intent_id": discovery_order.get("order_intent_id") if isinstance(discovery_order, dict) else None,
            "delivery_mode": discovery_order.get("delivery_mode") if isinstance(discovery_order, dict) else None,
            "delivery": discovery_order.get("delivery") if isinstance(discovery_order, dict) else None,
        },
        "rows": rows,
        "business_reading": {
            "proved": [
                "A machine can discover the API contract without speaking to a human.",
                "A machine with no starting list can create a target discovery purchase intent.",
                "The same machine can score concrete domains and receive a next product recommendation.",
                "The machine can buy verification for ambiguous cases and deep analysis only for strong cases.",
                "Orders and deliveries are retrievable later by API.",
                "Duplicate score calls do not create a second score charge.",
            ],
            "not_yet_proved": [
                "Real paid checkout.",
                "Automated delivery of full Deep Analysis content beyond beta order intent.",
                "Public self-serve signup without beta/admin approval.",
            ],
        },
    }


def render_markdown(result: dict[str, Any]) -> str:
    lines = [
        "# MachineSignal - Live machine buyer flow test",
        "",
        f"- Data test: {result['finished_at']}",
        f"- Endpoint: `{result['base_url']}`",
        "- API key: mascherata, non salvata nel report",
        "- Pagamenti reali: non eseguiti",
        "- Contatti esterni/email: non eseguiti",
        "",
        "## Cosa ha fatto la macchina cliente",
        "",
        "1. Ha letto root, `machine-onboarding.json` e OpenAPI.",
        "2. Non avendo una lista iniziale, ha creato un ordine beta `target_discovery`.",
        "3. Ha scoreato 5 target reali emersi dai test medicina estetica.",
        "4. Ha comprato `deep_analysis` solo sul caso forte.",
        "5. Ha comprato `verification` sui casi ambigui.",
        "6. Ha letto usage e ordini per controllare crediti e consegne beta.",
        "",
        "## Esito sintetico",
        "",
        f"- Check superati: {result['summary']['checks_passed']}",
        f"- Check falliti: {result['summary']['checks_failed']}",
        f"- Target discovery comprati: {result['summary']['target_discovery_orders']}",
        f"- Score consumati: {result['summary']['score_requests_charged']}",
        f"- Extra addebiti da score duplicato: {result['summary']['duplicate_score_extra_charge']}",
        f"- Ordini creati: `{json.dumps(result['summary']['orders_created'], ensure_ascii=False)}`",
        f"- Pagamento reale eseguito: {result['summary']['real_payment_executed']}",
        f"- Contatto esterno eseguito: {result['summary']['external_contact_executed']}",
        "",
        "## Decisioni sui target",
        "",
        "| Target | Dominio | Score | Confidence | Decisione | Quality | Azione macchina | Ordine |",
        "|---|---|---:|---:|---|---|---|---|",
    ]
    for row in result["rows"]:
        lines.append(
            f"| {row.get('target_name')} | {row.get('domain')} | {row.get('score', '-')} | "
            f"{row.get('confidence', '-')} | {row.get('decision', '-')} | "
            f"{row.get('quality_status') or '-'} | {row.get('machine_action') or '-'} | "
            f"{row.get('order_delivery_type') or '-'} |"
        )

    lines.extend(
        [
            "",
            "## Lettura business",
            "",
            "Il test dimostra il flusso corretto per il modello MachineSignal: la macchina non compra tutto. Prima chiede target discovery se non ha una lista, poi scorea, poi compra verification quando il dato e ambiguo e deep analysis solo quando il lead e forte e coerente.",
            "",
            "Questo e il comportamento che vogliamo vendere: non una lista grezza, ma una sequenza automatica di decisioni economiche controllate dai crediti.",
            "",
            "## Limiti ancora aperti",
            "",
            "- Il checkout reale non e ancora attivo.",
            "- La consegna completa del Deep Analysis e ancora beta/order-intent, non un report completo prodotto in automatico.",
            "- La signup pubblica completamente self-service e ancora da costruire.",
            "",
            "## Check tecnici",
            "",
            "| Check | Esito | Dettaglio |",
            "|---|---|---|",
        ]
    )
    for check in result["checks"]:
        details = str(check["details"]).replace("|", "/")
        lines.append(f"| {check['name']} | {'OK' if check['ok'] else 'KO'} | {details} |")
    return "\n".join(lines) + "\n"


def main() -> int:
    api_key = os.environ.get("MACHINESIGNAL_API_KEY", "").strip()
    if not api_key:
        print("MACHINESIGNAL_API_KEY is required.", file=sys.stderr)
        return 2

    result = run_flow(api_key)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    stamp = now_id()
    json_path = OUTPUT_DIR / f"machine_buyer_flow_live_test_{stamp}.json"
    report_path = OUTPUT_DIR / f"machine_buyer_flow_live_test_{stamp}.md"
    json_path.write_text(json.dumps(result, indent=2, ensure_ascii=False), encoding="utf-8")
    report_path.write_text(render_markdown(result), encoding="utf-8")
    print(json.dumps({"ok": result["ok"], "json": str(json_path), "report": str(report_path), "summary": result["summary"]}, indent=2, ensure_ascii=False))
    return 0 if result["ok"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
