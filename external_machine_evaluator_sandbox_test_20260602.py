#!/usr/bin/env python3
"""
MachineSignal external machine evaluator sandbox test.

This test intentionally uses only public discovery resources and the public
sandbox endpoint. It does not use the admin key.

No real payment is executed. No external contact is executed.
"""

from __future__ import annotations

import json
import time
import urllib.error
import urllib.request
from datetime import datetime
from pathlib import Path
from typing import Any


BASE_URL = "https://machinesignal-api.beta-878.workers.dev"
PUBLIC_SITE = "https://machinesignal.it"
OUTPUT_DIR = Path(r"C:\Users\natal\AppData\Local\Temp\MachineSignal\external_machine_evaluator_sandbox_20260602")


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
        "User-Agent": "MachineSignalExternalMachineEvaluator/2026-06-02",
    }
    body = None
    if payload is not None:
        body = json.dumps(payload).encode("utf-8")
        headers["Content-Type"] = "application/json"
    if api_key:
        headers["X-API-Key"] = api_key
    if idempotency_key:
        headers["Idempotency-Key"] = idempotency_key

    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as response:
            raw = response.read().decode("utf-8", errors="replace")
            return int(response.status), parse_payload(raw)
    except urllib.error.HTTPError as exc:
        raw = exc.read().decode("utf-8", errors="replace")
        return int(exc.code), parse_payload(raw)
    except urllib.error.URLError as exc:
        return 599, {"error": "url_error", "message": str(exc)}


def parse_payload(raw: str) -> Any:
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return raw


def mask_key(value: str | None) -> str:
    if not value:
        return ""
    return value[:10] + "..." + value[-4:]


def first_sample_target(purchase_payload: dict[str, Any]) -> dict[str, Any] | None:
    delivery = purchase_payload.get("delivery") or {}
    samples = delivery.get("beta_sample_targets") or []
    if samples:
        return samples[0]
    order = purchase_payload.get("order") or {}
    delivery = order.get("delivery") or {}
    samples = delivery.get("beta_sample_targets") or []
    if samples:
        return samples[0]
    return None


def recommended_product(score_payload: dict[str, Any]) -> str | None:
    next_purchase = score_payload.get("next_purchase") or {}
    product = next_purchase.get("next_product")
    if product:
        return str(product)
    decision = score_payload.get("decision")
    if decision == "nurture":
        return "nurture_signal"
    if decision == "needs_verification":
        return "verification"
    if decision == "buy_deep_analysis":
        return "deep_analysis"
    return None


def run() -> dict[str, Any]:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    checks: list[dict[str, Any]] = []

    def check(name: str, ok: bool, details: str = "") -> None:
        checks.append({"name": name, "ok": bool(ok), "details": details})

    public_resources = {
        "llms": f"{PUBLIC_SITE}/llms.txt",
        "dentists_pack": f"{PUBLIC_SITE}/dentists-beta-machine-buyer-pack.json",
        "product_catalog": f"{PUBLIC_SITE}/product-catalog.json",
        "machine_onboarding": f"{PUBLIC_SITE}/machine-onboarding.json",
        "openapi": f"{PUBLIC_SITE}/openapi.json",
    }

    fetched: dict[str, Any] = {}
    for name, url in public_resources.items():
        status, payload = request_json("GET", url)
        fetched[name] = payload
        check(f"public_{name}_readable", status == 200, f"HTTP {status}")

    llms_text = fetched.get("llms") if isinstance(fetched.get("llms"), str) else ""
    check(
        "llms_points_to_dentists_pack",
        "dentists-beta-machine-buyer-pack.json" in llms_text,
        "machine can discover vertical beta pack",
    )
    dentists_pack = fetched.get("dentists_pack") if isinstance(fetched.get("dentists_pack"), dict) else {}
    check(
        "dentists_pack_has_benchmark",
        dentists_pack.get("benchmark", {}).get("targets_scored") == 250,
        "benchmark targets_scored=250",
    )

    run_id = f"external-machine-evaluator-{stamp}-{int(time.time())}"
    status, sandbox = request_json(
        "POST",
        f"{BASE_URL}/v1/sandbox/customers",
        payload={
            "evaluator_type": "ai_agent",
            "integration_target": "external machine evaluator sandbox",
            "expected_test_path": "dentists_beta_machine_buyer_pack_flow",
        },
        idempotency_key=run_id,
    )
    api_key = sandbox.get("api_key") if isinstance(sandbox, dict) else None
    check("sandbox_customer_created", status == 200 and bool(api_key), f"HTTP {status}, key={mask_key(api_key)}")

    status, onboarding = request_json("GET", f"{BASE_URL}/v1/onboarding", api_key=api_key)
    check("authenticated_onboarding_readable", status == 200, f"HTTP {status}")

    status, target_discovery = request_json(
        "POST",
        f"{BASE_URL}/v1/purchase-intent",
        payload={
            "product_code": "target_discovery",
            "market": "dentists_odontoiatric_clinics",
            "area": "Lombardia",
            "commercial_objective": "identify dentist and odontoiatric clinic domains worth scoring for website-led commercial opportunity and CRM-ready follow-up preparation",
            "reason": "External machine evaluator has no starting list and is testing the dentists beta pack.",
            "max_budget_eur": 149,
        },
        api_key=api_key,
        idempotency_key=f"{run_id}-target-discovery",
    )
    check("target_discovery_purchase_intent", status == 200, f"HTTP {status}")

    sample = first_sample_target(target_discovery if isinstance(target_discovery, dict) else {})
    check("target_discovery_returns_sample_target", bool(sample and sample.get("domain")), str(sample.get("domain") if sample else ""))

    score_payload: dict[str, Any] = {}
    if sample and sample.get("domain"):
        status, score = request_json(
            "POST",
            f"{BASE_URL}/v1/lead-opportunity-score",
            payload={
                "domain": sample.get("domain"),
                "sector_hint": "dentist",
                "country_hint": "IT",
                "target_name": sample.get("target_name"),
                "category_hint": sample.get("category"),
                "area": sample.get("area"),
                "region": "Lombardia",
                "initial_signals": sample.get("initial_signals"),
                "commercial_objective": "website-led commercial opportunity and CRM-ready follow-up preparation",
            },
            api_key=api_key,
            idempotency_key=f"{run_id}-score-001",
        )
        score_payload = score if isinstance(score, dict) else {}
        check("sample_target_scored", status == 200 and "opportunity_score" in score_payload, f"HTTP {status}")
        check("score_has_web_architect_review", "web_architect_review" in score_payload, str(score_payload.get("web_architect_review", {}).get("status")))
        check("score_has_commercial_strength", "commercial_strength" in score_payload, str(score_payload.get("commercial_strength", {}).get("level")))

    product = recommended_product(score_payload)
    add_on_payload: dict[str, Any] = {}
    if product:
        status, add_on = request_json(
            "POST",
            f"{BASE_URL}/v1/purchase-intent",
            payload={
                "product_code": product,
                "domain": score_payload.get("domain"),
                "source_score_request_id": f"{run_id}-score-001",
                "reason": f"Score decision recommended {product} during external machine evaluator sandbox test.",
            },
            api_key=api_key,
            idempotency_key=f"{run_id}-{product}",
        )
        add_on_payload = add_on if isinstance(add_on, dict) else {}
        check("recommended_add_on_purchase_intent", status == 200, f"HTTP {status}, product={product}")
    else:
        check("recommended_add_on_purchase_intent", True, "no add-on recommended by score")

    status, orders = request_json("GET", f"{BASE_URL}/v1/orders", api_key=api_key)
    orders_payload = orders if isinstance(orders, dict) else {}
    order_count = len(orders_payload.get("orders") or [])
    check("orders_readable", status == 200 and order_count >= 1, f"HTTP {status}, orders={order_count}")

    status, usage = request_json("GET", f"{BASE_URL}/v1/usage", api_key=api_key)
    usage_payload = usage if isinstance(usage, dict) else {}
    check("usage_readable", status == 200, f"HTTP {status}")
    check("no_real_payment", usage_payload.get("real_payment_executed") is False, str(usage_payload.get("real_payment_executed")))
    check("no_external_contact", usage_payload.get("external_contact_executed") is False, str(usage_payload.get("external_contact_executed")))

    result = {
        "ok": all(item["ok"] for item in checks),
        "test_name": "external_machine_evaluator_sandbox_test",
        "finished_at": datetime.now().isoformat(timespec="seconds"),
        "base_url": BASE_URL,
        "public_site": PUBLIC_SITE,
        "sandbox_customer_id": sandbox.get("customer_id") if isinstance(sandbox, dict) else None,
        "sandbox_key_prefix": mask_key(api_key),
        "checks": checks,
        "score_summary": {
            "domain": score_payload.get("domain"),
            "opportunity_score": score_payload.get("opportunity_score"),
            "confidence": score_payload.get("confidence"),
            "decision": score_payload.get("decision"),
            "web_architect_status": (score_payload.get("web_architect_review") or {}).get("status"),
            "commercial_strength": (score_payload.get("commercial_strength") or {}).get("level"),
            "recommended_product": product,
        },
        "orders_count": order_count,
        "add_on_product": product,
        "add_on_status": add_on_payload.get("status") or (add_on_payload.get("order") or {}).get("status"),
        "real_payment_executed": usage_payload.get("real_payment_executed"),
        "external_contact_executed": usage_payload.get("external_contact_executed"),
    }

    summary_path = OUTPUT_DIR / f"external_machine_evaluator_sandbox_summary_{stamp}.json"
    report_path = OUTPUT_DIR / f"external_machine_evaluator_sandbox_report_{stamp}.md"
    summary_path.write_text(json.dumps(result, indent=2), encoding="utf-8")
    report_path.write_text(build_report(result), encoding="utf-8")
    result["summary_path"] = str(summary_path)
    result["report_path"] = str(report_path)
    return result


def build_report(result: dict[str, Any]) -> str:
    checks = "\n".join(
        f"| {item['name']} | {'OK' if item['ok'] else 'FAIL'} | {item['details']} |"
        for item in result["checks"]
    )
    score = result["score_summary"]
    return "\n".join(
        [
            "# MachineSignal - External Machine Evaluator Sandbox Test",
            "",
            f"Finished at: {result['finished_at']}",
            "",
            "## Result",
            "",
            f"Status: {'passed' if result['ok'] else 'failed'}",
            "",
            f"Sandbox customer: `{result['sandbox_customer_id']}`",
            f"Sandbox key prefix: `{result['sandbox_key_prefix']}`",
            "",
            "## Score summary",
            "",
            f"- Domain: `{score.get('domain')}`",
            f"- Opportunity score: `{score.get('opportunity_score')}`",
            f"- Confidence: `{score.get('confidence')}`",
            f"- Decision: `{score.get('decision')}`",
            f"- Web Architect status: `{score.get('web_architect_status')}`",
            f"- Commercial strength: `{score.get('commercial_strength')}`",
            f"- Recommended product: `{score.get('recommended_product')}`",
            "",
            "## Checks",
            "",
            "| Check | Result | Details |",
            "|---|---|---|",
            checks,
            "",
            "## Guardrails",
            "",
            f"- Real payment executed: `{result['real_payment_executed']}`",
            f"- External contact executed: `{result['external_contact_executed']}`",
            "",
            "## Interpretation",
            "",
            "The test validates that an external machine can discover MachineSignal public resources, create a sandbox key, read authenticated onboarding, order target discovery, score a returned target, create a recommended beta add-on intent and retrieve orders without admin credentials or human sales contact.",
            "",
        ]
    )


if __name__ == "__main__":
    print(json.dumps(run(), indent=2))

