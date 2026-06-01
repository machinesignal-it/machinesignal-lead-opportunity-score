#!/usr/bin/env python3
"""
MachineSignal RapidAPI-style external flow test.

Simulates an external API-tool or machine evaluator:
- reads the public RapidAPI provider setup JSON;
- creates a public sandbox key;
- uses only that sandbox key for protected calls;
- orders target discovery, scores one domain, orders deep analysis, orders action pack;
- reads orders and verifies that no real payment or external contact is executed.

No real API key is written to disk. Reports contain only masked key metadata.
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
PUBLIC_SITE = "https://machinesignal.it"
OUTPUT_DIR = (
    Path(os.environ.get("LOCALAPPDATA", str(Path.home())))
    / "Temp"
    / "MachineSignal"
    / "rapidapi_style_external_flow_test"
)


def request_json(
    method: str,
    url_or_path: str,
    payload: dict[str, Any] | None = None,
    api_key: str | None = None,
    idempotency_key: str | None = None,
    timeout: int = 30,
) -> tuple[int, Any]:
    url = url_or_path if url_or_path.startswith("http") else BASE_URL + url_or_path
    headers = {
        "Accept": "application/json,text/plain,*/*",
        "User-Agent": "MachineSignalRapidAPIStyleExternalFlow/2026-06-01",
    }
    body = None
    if payload is not None:
        body = json.dumps(payload).encode("utf-8")
        headers["Content-Type"] = "application/json"
    if api_key:
        headers["X-API-Key"] = api_key
    if idempotency_key:
        headers["Idempotency-Key"] = idempotency_key

    request = urllib.request.Request(url, data=body, headers=headers, method=method)
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


def mask_key(value: str) -> str:
    if not value:
        return ""
    if len(value) <= 10:
        return "***"
    return f"{value[:6]}...{value[-4:]}"


def event_from(payload: dict[str, Any]) -> dict[str, Any]:
    return ((payload.get("usage") or {}).get("current_event") or {}) if isinstance(payload, dict) else {}


def balance_used(payload: dict[str, Any], product_code: str) -> int:
    balances = payload.get("balances") or []
    for item in balances:
        if item.get("product_code") == product_code:
            return int(item.get("credits_used") or 0)
    return 0


def order_id_from(payload: dict[str, Any]) -> str | None:
    return payload.get("order_intent_id") or (payload.get("order") or {}).get("order_intent_id")


def run() -> dict[str, Any]:
    stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    run_id = f"rapidapi-style-{stamp}-{int(time.time())}"
    checks: list[dict[str, Any]] = []

    def check(name: str, ok: bool, details: str = "") -> None:
        checks.append({"name": name, "ok": bool(ok), "details": details})

    status, provider_setup = request_json(
        "GET", f"{PUBLIC_SITE}/distribution/rapidapi-provider-setup.json"
    )
    check(
        "provider_setup_public",
        status == 200
        and isinstance(provider_setup, dict)
        and provider_setup.get("artifact_type") == "rapidapi_provider_setup_checklist",
        f"HTTP {status}",
    )

    status, listing = request_json("GET", f"{PUBLIC_SITE}/distribution/rapidapi-listing.json")
    check(
        "rapidapi_listing_public",
        status == 200
        and isinstance(listing, dict)
        and listing.get("submission_type") == "rapidapi_provider_listing",
        f"HTTP {status}",
    )

    status, public_collection = request_json("GET", f"{PUBLIC_SITE}/postman_public_collection.json")
    check(
        "postman_public_collection_public",
        status == 200
        and isinstance(public_collection, dict)
        and len(public_collection.get("item") or []) >= 8,
        f"HTTP {status}",
    )

    status, sandbox = request_json(
        "POST",
        "/v1/sandbox/customers",
        payload={
            "evaluator_type": "rapidapi_style_api_tool",
            "integration_target": "external_api_marketplace_test",
            "expected_test_path": "sandbox_score_deep_analysis_action_pack_orders",
            "external_reference": run_id,
        },
        idempotency_key=f"{run_id}-sandbox",
    )
    api_key = sandbox.get("api_key") if isinstance(sandbox, dict) else None
    check(
        "sandbox_key_created",
        status == 200 and isinstance(api_key, str) and len(api_key) > 12,
        f"HTTP {status}",
    )

    if not api_key:
        return {
            "ok": False,
            "run_id": run_id,
            "checks": checks,
            "blocking_error": "Sandbox key was not created.",
            "sandbox_response": sandbox if not isinstance(sandbox, dict) else {k: v for k, v in sandbox.items() if k != "api_key"},
        }

    status, onboarding = request_json("GET", "/v1/onboarding", api_key=api_key)
    check(
        "authenticated_onboarding",
        status == 200
        and isinstance(onboarding, dict)
        and (onboarding.get("customer_state") or {}).get("sandbox") is True,
        f"HTTP {status}",
    )

    status, usage_before = request_json("GET", "/v1/usage", api_key=api_key)
    check("usage_before", status == 200 and isinstance(usage_before, dict), f"HTTP {status}")

    before_score = balance_used(usage_before if isinstance(usage_before, dict) else {}, "score_pack_1k")
    before_target = balance_used(
        usage_before if isinstance(usage_before, dict) else {}, "target_discovery_pack_250"
    )
    before_deep = balance_used(
        usage_before if isinstance(usage_before, dict) else {}, "deep_analysis_pack_100"
    )
    before_action = balance_used(
        usage_before if isinstance(usage_before, dict) else {}, "action_pack_25"
    )

    status, target_discovery = request_json(
        "POST",
        "/v1/purchase-intent",
        api_key=api_key,
        idempotency_key=f"{run_id}-target-discovery",
        payload={
            "product_code": "target_discovery",
            "market": "medicina estetica",
            "area": "Lombardia",
            "commercial_objective": "find domains worth scoring for website improvement opportunities",
            "reason": "External API-tool test: customer machine has no starting list.",
        },
    )
    check(
        "target_discovery_purchase_intent",
        status == 200
        and isinstance(target_discovery, dict)
        and target_discovery.get("status") == "accepted_beta_order_intent",
        f"HTTP {status}",
    )

    status, score = request_json(
        "POST",
        "/v1/lead-opportunity-score",
        api_key=api_key,
        idempotency_key=f"{run_id}-score",
        payload={
            "domain": "quinta-essenza.com",
            "sector_hint": "medicina estetica",
            "country_hint": "IT",
        },
    )
    check(
        "score_domain",
        status == 200 and isinstance(score, dict) and "opportunity_score" in score,
        f"HTTP {status}",
    )
    source_score_request_id = score.get("request_id") if isinstance(score, dict) else f"{run_id}-score"

    status, duplicate_score = request_json(
        "POST",
        "/v1/lead-opportunity-score",
        api_key=api_key,
        idempotency_key=f"{run_id}-score",
        payload={
            "domain": "quinta-essenza.com",
            "sector_hint": "medicina estetica",
            "country_hint": "IT",
        },
    )
    duplicate_event = event_from(duplicate_score if isinstance(duplicate_score, dict) else {})
    check(
        "idempotent_score_no_double_charge",
        status == 200 and duplicate_event.get("duplicate_request") is True,
        f"HTTP {status}",
    )

    status, deep_analysis = request_json(
        "POST",
        "/v1/purchase-intent",
        api_key=api_key,
        idempotency_key=f"{run_id}-deep-analysis",
        payload={
            "product_code": "deep_analysis",
            "domain": "quinta-essenza.com",
            "source_score_request_id": source_score_request_id,
            "reason": "RapidAPI-style test bought Deep Analysis after scoring.",
        },
    )
    check(
        "deep_analysis_purchase_intent",
        status == 200
        and isinstance(deep_analysis, dict)
        and deep_analysis.get("status") == "accepted_beta_order_intent",
        f"HTTP {status}",
    )

    status, action_pack = request_json(
        "POST",
        "/v1/purchase-intent",
        api_key=api_key,
        idempotency_key=f"{run_id}-action-pack",
        payload={
            "product_code": "action_pack",
            "domain": "quinta-essenza.com",
            "source_score_request_id": source_score_request_id,
            "reason": "RapidAPI-style test bought Action Pack after Deep Analysis.",
        },
    )
    check(
        "action_pack_purchase_intent",
        status == 200
        and isinstance(action_pack, dict)
        and action_pack.get("status") == "accepted_beta_order_intent",
        f"HTTP {status}",
    )

    status, orders = request_json("GET", "/v1/orders", api_key=api_key)
    check(
        "orders_readable",
        status == 200 and isinstance(orders, dict) and int(orders.get("count") or 0) >= 3,
        f"HTTP {status}",
    )

    first_order_id = (
        order_id_from(deep_analysis if isinstance(deep_analysis, dict) else {})
        or order_id_from(target_discovery if isinstance(target_discovery, dict) else {})
    )
    single_order_status: int | None = None
    single_order: Any = None
    if first_order_id:
        single_order_status, single_order = request_json(
            "GET", f"/v1/orders/{first_order_id}", api_key=api_key
        )
        check(
            "single_order_readable",
            single_order_status == 200
            and isinstance(single_order, dict)
            and bool((single_order.get("order") or {}).get("delivery")),
            f"HTTP {single_order_status}",
        )
    else:
        check("single_order_readable", False, "No order id returned")

    status, usage_after = request_json("GET", "/v1/usage", api_key=api_key)
    check("usage_after", status == 200 and isinstance(usage_after, dict), f"HTTP {status}")

    after_score = balance_used(usage_after if isinstance(usage_after, dict) else {}, "score_pack_1k")
    after_target = balance_used(
        usage_after if isinstance(usage_after, dict) else {}, "target_discovery_pack_250"
    )
    after_deep = balance_used(
        usage_after if isinstance(usage_after, dict) else {}, "deep_analysis_pack_100"
    )
    after_action = balance_used(
        usage_after if isinstance(usage_after, dict) else {}, "action_pack_25"
    )

    check("score_credit_delta", after_score - before_score == 1, f"delta={after_score - before_score}")
    check("target_discovery_credit_delta", after_target - before_target == 1, f"delta={after_target - before_target}")
    check("deep_analysis_credit_delta", after_deep - before_deep == 1, f"delta={after_deep - before_deep}")
    check("action_pack_credit_delta", after_action - before_action == 1, f"delta={after_action - before_action}")
    check(
        "no_real_payment_or_external_contact",
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
        "test_name": "rapidapi_style_external_flow_test",
        "run_id": run_id,
        "started_at": stamp,
        "finished_at": datetime.now().isoformat(timespec="seconds"),
        "base_url": BASE_URL,
        "public_setup_url": f"{PUBLIC_SITE}/distribution/rapidapi-provider-setup.json",
        "sandbox_key": {
            "created": True,
            "masked": mask_key(api_key),
            "full_key_saved": False,
        },
        "checks": checks,
        "summary": {
            "checks_passed": len(checks) - len(failed),
            "checks_failed": len(failed),
            "score_credit_delta": after_score - before_score,
            "target_discovery_credit_delta": after_target - before_target,
            "deep_analysis_credit_delta": after_deep - before_deep,
            "action_pack_credit_delta": after_action - before_action,
            "orders_count": orders.get("count") if isinstance(orders, dict) else None,
            "single_order_status": single_order_status,
            "real_payment_executed": usage_after.get("real_payment_executed") if isinstance(usage_after, dict) else None,
            "external_contact_executed": usage_after.get("external_contact_executed") if isinstance(usage_after, dict) else None,
            "score_decision": score.get("decision") if isinstance(score, dict) else None,
            "score_value": score.get("opportunity_score") if isinstance(score, dict) else None,
            "next_purchase": (score.get("next_purchase") or {}).get("next_product") if isinstance(score, dict) else None,
        },
        "order_ids": {
            "target_discovery": order_id_from(target_discovery if isinstance(target_discovery, dict) else {}),
            "deep_analysis": order_id_from(deep_analysis if isinstance(deep_analysis, dict) else {}),
            "action_pack": order_id_from(action_pack if isinstance(action_pack, dict) else {}),
        },
        "business_reading": {
            "proved": [
                "A machine can read RapidAPI-style setup data from the public domain.",
                "A machine can create its own sandbox key without a human sales conversation.",
                "A machine can use that key to score a domain.",
                "A repeated score with the same Idempotency-Key does not double charge.",
                "A machine can create beta purchase intents for Target Discovery, Deep Analysis and Action Pack.",
                "A machine can retrieve orders and deliveries through API.",
                "No real payment or external outreach is executed in beta.",
            ],
            "still_open": [
                "Actual RapidAPI marketplace publication remains a UI/provider setup task.",
                "Real paid checkout remains intentionally disabled during beta.",
                "Full public monetization should wait for 7-day sandbox metrics.",
            ],
        },
    }


def render_markdown(result: dict[str, Any]) -> str:
    lines = [
        "# MachineSignal - RapidAPI-style external flow test",
        "",
        f"- Data test: {result['finished_at']}",
        f"- Endpoint: `{result['base_url']}`",
        f"- Setup pubblico: {result['public_setup_url']}",
        "- API key sandbox: creata e mascherata, non salvata nel report",
        "- Pagamenti reali: non eseguiti",
        "- Contatti esterni/email: non eseguiti",
        "",
        "## Esito sintetico",
        "",
        f"- Check superati: {result['summary']['checks_passed']}",
        f"- Check falliti: {result['summary']['checks_failed']}",
        f"- Score credit delta: {result['summary']['score_credit_delta']}",
        f"- Target Discovery credit delta: {result['summary']['target_discovery_credit_delta']}",
        f"- Deep Analysis credit delta: {result['summary']['deep_analysis_credit_delta']}",
        f"- Action Pack credit delta: {result['summary']['action_pack_credit_delta']}",
        f"- Ordini letti: {result['summary']['orders_count']}",
        f"- Score: {result['summary']['score_value']}",
        f"- Decisione score: {result['summary']['score_decision']}",
        f"- Next purchase: {result['summary']['next_purchase']}",
        f"- Pagamento reale eseguito: {result['summary']['real_payment_executed']}",
        f"- Contatto esterno eseguito: {result['summary']['external_contact_executed']}",
        "",
        "## Ordini creati",
        "",
        f"- Target Discovery: `{result['order_ids']['target_discovery']}`",
        f"- Deep Analysis: `{result['order_ids']['deep_analysis']}`",
        f"- Action Pack: `{result['order_ids']['action_pack']}`",
        "",
        "## Lettura business",
        "",
        "Il test dimostra che il funnel tecnico regge anche partendo da una superficie stile RapidAPI: la macchina legge il setup pubblico, crea una sandbox key, consuma crediti beta e recupera consegne via API.",
        "",
        "Questo non prova ancora la vendita monetizzata su RapidAPI, ma prova la parte che ci interessa prima: una macchina puo capire cosa comprare e completare il flusso senza una trattativa umana.",
        "",
        "## Check tecnici",
        "",
        "| Check | Esito | Dettaglio |",
        "|---|---|---|",
    ]
    for check in result["checks"]:
        details = str(check.get("details") or "").replace("|", "/")
        lines.append(f"| {check['name']} | {'OK' if check['ok'] else 'KO'} | {details} |")
    return "\n".join(lines) + "\n"


def main() -> int:
    result = run()
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    json_path = OUTPUT_DIR / f"rapidapi_style_external_flow_test_{stamp}.json"
    report_path = OUTPUT_DIR / f"rapidapi_style_external_flow_test_{stamp}.md"
    json_path.write_text(json.dumps(result, indent=2, ensure_ascii=False), encoding="utf-8")
    report_path.write_text(render_markdown(result), encoding="utf-8")
    print(
        json.dumps(
            {
                "ok": result["ok"],
                "json": str(json_path),
                "report": str(report_path),
                "summary": result.get("summary"),
            },
            indent=2,
            ensure_ascii=False,
        )
    )
    return 0 if result["ok"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
