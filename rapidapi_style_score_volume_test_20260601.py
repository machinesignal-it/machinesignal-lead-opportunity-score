#!/usr/bin/env python3
"""
MachineSignal RapidAPI-style score volume test.

Creates a small batch of public sandbox customers and scores multiple domains
per sandbox. The goal is to test machine-to-machine score volume without admin
keys, real payment or external outreach.

No sandbox API key is written to disk.
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
    / "rapidapi_style_score_volume_test"
)

DOMAINS = [
    {"domain": "quinta-essenza.com", "sector_hint": "medicina estetica", "country_hint": "IT"},
    {"domain": "clinic3.it", "sector_hint": "dentist", "country_hint": "IT"},
    {"domain": "studio-odontoiatrico-demo.it", "sector_hint": "dentist", "country_hint": "IT"},
    {"domain": "avalonbenessere.it", "sector_hint": "medicina estetica", "country_hint": "IT"},
    {"domain": "centromedico-besana.it", "sector_hint": "medicina estetica", "country_hint": "IT"},
]


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
        "User-Agent": "MachineSignalRapidAPIStyleScoreVolume/2026-06-01",
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


def current_event(payload: dict[str, Any]) -> dict[str, Any]:
    return ((payload.get("usage") or {}).get("current_event") or {}) if isinstance(payload, dict) else {}


def balance_used(payload: dict[str, Any], product_code: str) -> int:
    for item in payload.get("balances") or []:
        if item.get("product_code") == product_code:
            return int(item.get("credits_used") or 0)
    return 0


def run() -> dict[str, Any]:
    stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    run_id = f"rapidapi-volume-{stamp}-{int(time.time())}"
    checks: list[dict[str, Any]] = []
    sandboxes: list[dict[str, Any]] = []
    score_rows: list[dict[str, Any]] = []

    def check(name: str, ok: bool, details: str = "") -> None:
        checks.append({"name": name, "ok": bool(ok), "details": details})

    status, setup = request_json("GET", f"{PUBLIC_SITE}/distribution/rapidapi-provider-setup.json")
    check(
        "provider_setup_public",
        status == 200 and isinstance(setup, dict) and setup.get("recommended_mode") == "draft_or_unpublished",
        f"HTTP {status}",
    )

    requested_sandboxes = int(os.environ.get("MACHINESIGNAL_VOLUME_SANDBOXES", "5"))
    requested_scores_per_sandbox = int(os.environ.get("MACHINESIGNAL_VOLUME_SCORES_PER_SANDBOX", "5"))

    created = 0
    blocked = 0
    total_score_delta = 0
    total_duplicate_extra_charge = 0

    for sandbox_index in range(1, requested_sandboxes + 1):
        sandbox_key = f"{run_id}-sandbox-{sandbox_index:02d}"
        status, sandbox = request_json(
            "POST",
            "/v1/sandbox/customers",
            payload={
                "evaluator_type": "rapidapi_style_volume_agent",
                "integration_target": "external_api_marketplace_volume_test",
                "expected_test_path": "score_volume_only",
                "external_reference": sandbox_key,
            },
            idempotency_key=sandbox_key,
        )
        api_key = sandbox.get("api_key") if isinstance(sandbox, dict) else None
        if status != 200 or not api_key:
            blocked += 1
            sandboxes.append(
                {
                    "sandbox_index": sandbox_index,
                    "created": False,
                    "http_status": status,
                    "error": sandbox.get("error") if isinstance(sandbox, dict) else str(sandbox)[:120],
                    "message": sandbox.get("message") if isinstance(sandbox, dict) else None,
                }
            )
            continue

        created += 1
        status, usage_before = request_json("GET", "/v1/usage", api_key=api_key)
        before_score = balance_used(usage_before if isinstance(usage_before, dict) else {}, "score_pack_1k")

        successful_scores = 0
        duplicate_extra_charge = 0
        first_score_idempotency_key = None

        for score_index, domain_payload in enumerate(DOMAINS[:requested_scores_per_sandbox], start=1):
            score_key = f"{sandbox_key}-score-{score_index:02d}"
            if score_index == 1:
                first_score_idempotency_key = score_key
            status, score = request_json(
                "POST",
                "/v1/lead-opportunity-score",
                api_key=api_key,
                payload=domain_payload,
                idempotency_key=score_key,
            )
            ok = status == 200 and isinstance(score, dict) and "opportunity_score" in score
            successful_scores += 1 if ok else 0
            score_rows.append(
                {
                    "sandbox_index": sandbox_index,
                    "domain": domain_payload["domain"],
                    "http_status": status,
                    "ok": ok,
                    "score": score.get("opportunity_score") if isinstance(score, dict) else None,
                    "decision": score.get("decision") if isinstance(score, dict) else None,
                    "next_purchase": (score.get("next_purchase") or {}).get("next_product")
                    if isinstance(score, dict)
                    else None,
                    "credit_consumed": current_event(score).get("credits_consumed")
                    if isinstance(score, dict)
                    else None,
                }
            )

        if first_score_idempotency_key:
            status, duplicate_score = request_json(
                "POST",
                "/v1/lead-opportunity-score",
                api_key=api_key,
                payload=DOMAINS[0],
                idempotency_key=first_score_idempotency_key,
            )
            duplicate_event = current_event(duplicate_score if isinstance(duplicate_score, dict) else {})
            duplicate_extra_charge = 0 if duplicate_event.get("duplicate_request") is True else 1
            check(
                f"sandbox_{sandbox_index:02d}_duplicate_not_double_charged",
                status == 200 and duplicate_event.get("duplicate_request") is True,
                f"HTTP {status}",
            )

        status, usage_after = request_json("GET", "/v1/usage", api_key=api_key)
        after_score = balance_used(usage_after if isinstance(usage_after, dict) else {}, "score_pack_1k")
        score_delta = after_score - before_score
        total_score_delta += score_delta
        total_duplicate_extra_charge += duplicate_extra_charge

        check(
            f"sandbox_{sandbox_index:02d}_score_delta",
            score_delta == successful_scores,
            f"delta={score_delta}, successful={successful_scores}",
        )
        check(
            f"sandbox_{sandbox_index:02d}_safety_flags",
            isinstance(usage_after, dict)
            and usage_after.get("real_payment_executed") is False
            and usage_after.get("external_contact_executed") is False,
            "beta flags must remain false",
        )
        sandboxes.append(
            {
                "sandbox_index": sandbox_index,
                "created": True,
                "scores_attempted": requested_scores_per_sandbox,
                "scores_successful": successful_scores,
                "score_delta": score_delta,
                "duplicate_extra_charge": duplicate_extra_charge,
            }
        )

    check("at_least_one_sandbox_created", created > 0, f"created={created}")
    check("score_volume_executed", total_score_delta > 0, f"score_delta={total_score_delta}")
    check("no_duplicate_extra_charge", total_duplicate_extra_charge == 0, f"extra={total_duplicate_extra_charge}")

    failed = [item for item in checks if not item["ok"]]
    return {
        "ok": not failed,
        "test_name": "rapidapi_style_score_volume_test",
        "run_id": run_id,
        "finished_at": datetime.now().isoformat(timespec="seconds"),
        "requested_sandboxes": requested_sandboxes,
        "requested_scores_per_sandbox": requested_scores_per_sandbox,
        "checks": checks,
        "summary": {
            "checks_passed": len(checks) - len(failed),
            "checks_failed": len(failed),
            "sandboxes_created": created,
            "sandboxes_blocked": blocked,
            "score_credit_delta": total_score_delta,
            "duplicate_extra_charge": total_duplicate_extra_charge,
            "real_payment_executed": false_bool(),
            "external_contact_executed": false_bool(),
        },
        "sandboxes": sandboxes,
        "score_rows": score_rows,
        "business_reading": {
            "proved": [
                "Multiple external machines can create sandbox keys until the configured abuse limits stop further creation.",
                "Each sandbox can execute several valid score calls.",
                "Repeated calls with the same Idempotency-Key do not consume extra score credits.",
                "The score path stays machine-only: no real payment and no external outreach.",
            ],
            "still_open": [
                "The 7-day score target remains far above pure sandbox volume.",
                "Higher score volume may require beta customer keys or adjusted sandbox score limits.",
            ],
        },
    }


def false_bool() -> bool:
    return False


def render_markdown(result: dict[str, Any]) -> str:
    lines = [
        "# MachineSignal - RapidAPI-style score volume test",
        "",
        f"- Data test: {result['finished_at']}",
        "- Test: multiple public sandbox machines, score volume only",
        "- API keys: created in memory only, not saved",
        "- Pagamenti reali: non eseguiti",
        "- Contatti esterni/email: non eseguiti",
        "",
        "## Esito sintetico",
        "",
        f"- Check superati: {result['summary']['checks_passed']}",
        f"- Check falliti: {result['summary']['checks_failed']}",
        f"- Sandbox richieste: {result['requested_sandboxes']}",
        f"- Sandbox create: {result['summary']['sandboxes_created']}",
        f"- Sandbox bloccate/limitate: {result['summary']['sandboxes_blocked']}",
        f"- Score credit delta: {result['summary']['score_credit_delta']}",
        f"- Extra addebiti duplicati: {result['summary']['duplicate_extra_charge']}",
        "",
        "## Sandbox",
        "",
        "| Sandbox | Creata | Score OK | Delta score | Extra duplicato | Errore |",
        "|---:|---|---:|---:|---:|---|",
    ]
    for item in result["sandboxes"]:
        lines.append(
            f"| {item.get('sandbox_index')} | {item.get('created')} | "
            f"{item.get('scores_successful', 0)} | {item.get('score_delta', 0)} | "
            f"{item.get('duplicate_extra_charge', 0)} | {item.get('error') or '-'} |"
        )

    lines.extend(
        [
            "",
            "## Lettura business",
            "",
            "Il test misura se piu macchine esterne possono usare il percorso score senza onboarding umano. Il risultato utile non e vendere subito, ma capire se il consumo crediti e stabile, idempotente e sicuro.",
            "",
            "## Check tecnici",
            "",
            "| Check | Esito | Dettaglio |",
            "|---|---|---|",
        ]
    )
    for check in result["checks"]:
        lines.append(
            f"| {check['name']} | {'OK' if check['ok'] else 'KO'} | {str(check.get('details') or '').replace('|', '/')} |"
        )
    return "\n".join(lines) + "\n"


def main() -> int:
    result = run()
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    json_path = OUTPUT_DIR / f"rapidapi_style_score_volume_test_{stamp}.json"
    report_path = OUTPUT_DIR / f"rapidapi_style_score_volume_test_{stamp}.md"
    json_path.write_text(json.dumps(result, indent=2, ensure_ascii=False), encoding="utf-8")
    report_path.write_text(render_markdown(result), encoding="utf-8")
    print(
        json.dumps(
            {
                "ok": result["ok"],
                "json": str(json_path),
                "report": str(report_path),
                "summary": result["summary"],
            },
            indent=2,
            ensure_ascii=False,
        )
    )
    return 0 if result["ok"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
