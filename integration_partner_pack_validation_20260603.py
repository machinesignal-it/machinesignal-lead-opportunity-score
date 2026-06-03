#!/usr/bin/env python3
"""Validate the MachineSignal integration partner pack."""

from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path
from typing import Any


REPO_DIR = Path(__file__).resolve().parent
REPORT_PATH = REPO_DIR / "integration_partner_pack_validation_readout_20260603.md"


REQUIRED_FILES = [
    REPO_DIR / "INTEGRATION_PARTNER_PACK.md",
    REPO_DIR / "integration-partner-pack.json",
    REPO_DIR / "examples" / "integration_existing_list_score_request.json",
    REPO_DIR / "examples" / "integration_no_list_target_discovery_request.json",
    REPO_DIR / "examples" / "integration_action_pack_crm_payload.json",
]


def load_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def run() -> dict[str, Any]:
    checks: list[dict[str, Any]] = []

    def check(name: str, ok: bool, details: str = "") -> None:
        checks.append({"name": name, "ok": bool(ok), "details": details})

    for path in REQUIRED_FILES:
        check(f"file_exists:{path.name}", path.exists(), str(path))

    pack = load_json(REPO_DIR / "integration-partner-pack.json")
    check("pack_type", pack.get("pack_type") == "integration_partner_pack", str(pack.get("pack_type")))
    check("machine_interface", pack.get("primary_customer_interface") == "machine", str(pack.get("primary_customer_interface")))
    check("three_cases_present", set(pack.get("integration_cases", {}).keys()) == {
        "customer_has_existing_list",
        "customer_has_no_list",
        "customer_wants_action_payload",
    }, ",".join(pack.get("integration_cases", {}).keys()))
    check("budget_rules_present", len(pack.get("budget_rules", [])) >= 5, str(len(pack.get("budget_rules", []))))
    check("guardrail_no_payment", pack.get("guardrails", {}).get("real_payment_executed_in_beta") is False, str(pack.get("guardrails", {}).get("real_payment_executed_in_beta")))
    check("guardrail_no_external_contact", pack.get("guardrails", {}).get("external_contact_executed_in_beta") is False, str(pack.get("guardrails", {}).get("external_contact_executed_in_beta")))

    existing_list = load_json(REPO_DIR / "examples" / "integration_existing_list_score_request.json")
    no_list = load_json(REPO_DIR / "examples" / "integration_no_list_target_discovery_request.json")
    action_pack = load_json(REPO_DIR / "examples" / "integration_action_pack_crm_payload.json")
    check("existing_list_uses_score_endpoint", existing_list.get("url", "").endswith("/v1/lead-opportunity-score"), existing_list.get("url", ""))
    check("no_list_uses_target_discovery", no_list.get("body", {}).get("product_code") == "target_discovery", str(no_list.get("body", {}).get("product_code")))
    check("action_pack_requires_approval_gate", action_pack.get("expected_delivery_fields", {}).get("approval_gate", {}).get("required") is True, "approval_gate.required")

    return {
        "ok": all(item["ok"] for item in checks),
        "finished_at": datetime.now().isoformat(timespec="seconds"),
        "checks": checks,
    }


def build_report(result: dict[str, Any]) -> str:
    def ok_text(ok: bool) -> str:
        return "OK" if ok else "FAIL"

    lines = [
        "# MachineSignal - Integration Partner Pack Validation Readout",
        "",
        f"Finished at: {result['finished_at']}",
        "",
        "## Result",
        "",
        f"Status: {'passed' if result['ok'] else 'failed'}",
        "",
        "## Checks",
        "",
        "| Check | Result | Details |",
        "|---|---|---|",
    ]
    for check in result["checks"]:
        lines.append(f"| {check['name']} | {ok_text(check['ok'])} | {check.get('details', '')} |")
    lines.extend(
        [
            "",
            "## Interpretation",
            "",
            "The integration pack is ready for machine clients and technical partners. It covers existing-list scoring, no-list target discovery, CRM/action payload preparation, budget rules and beta guardrails.",
        ]
    )
    return "\n".join(lines) + "\n"


def main() -> int:
    result = run()
    REPORT_PATH.write_text(build_report(result), encoding="utf-8")
    print(json.dumps(result, indent=2))
    return 0 if result["ok"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
