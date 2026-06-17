import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def load_json(path):
    return json.loads(path.read_text(encoding="utf-8"))


def save_json(path, data):
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def update_openapi():
    path = ROOT / "openapi.json"
    data = load_json(path)

    data["info"]["description"] = (
        "Sandbox-only machine-readable API for lead opportunity scoring, no-list target discovery, "
        "credit-ledger tracking and budget routing. Paid beta activation, real payments, invoices, "
        "production keys, real/personal data, outreach and public marketplace/MCP publication remain blocked."
    )
    data["servers"][0]["description"] = "Live sandbox endpoint; commercial activation is blocked"
    if len(data["servers"]) > 1:
        data["servers"][1]["description"] = "Planned custom API host; not active for production traffic"

    data["x-machinesignal-current-status"] = {
        "primary_customer_interface": "machine",
        "technical_sandbox": "ready_for_current_scope",
        "advisor_gate_setup": "complete_for_current_scope",
        "current_safe_workstream": "internal_documentation_api_examples_refinement",
        "paid_beta_activation": "no_go",
        "commercial_go_live": "no_go",
        "real_payments": "blocked",
        "invoices": "blocked",
        "production_api_keys": "blocked",
        "real_customer_data": "blocked",
        "personal_data": "blocked",
        "external_outreach": "blocked",
        "marketplace_publication": "blocked",
        "hosted_public_mcp": "blocked",
        "advisor_gate_rehearsal": {
            "tests_run": 18,
            "hard_block_violations": 0,
            "unexpected_allows": 0
        }
    }

    data["x-machinesignal-safe-next-actions"] = [
        "read_openapi",
        "read_machine_onboarding",
        "read_product_catalog",
        "create_limited_sandbox_customer_when_write_budget_allows",
        "run_synthetic_or_non_personal_sandbox_tests",
        "check_production_access_status"
    ]

    data["x-machinesignal-blocked-actions"] = [
        "activate_paid_beta",
        "execute_real_payment",
        "issue_invoice",
        "collect_payment_method",
        "issue_production_api_key",
        "process_real_customer_list",
        "process_personal_data",
        "send_outreach",
        "publish_marketplace_listing",
        "launch_hosted_public_mcp",
        "submit_mcp_registry"
    ]

    production_status = data["paths"].get("/v1/production-access/status", {}).get("get")
    if production_status:
        production_status["summary"] = "Return production access guard status"
        production_status["description"] = (
            "Read-only status endpoint for machines and agents. Confirms that paid beta, commercial go-live, "
            "real payments, invoices, production keys, real/personal data, outreach, marketplace publication "
            "and hosted public MCP remain blocked until explicit owner approval."
        )

    sandbox_create = data["paths"].get("/v1/sandbox/customers", {}).get("post")
    if sandbox_create:
        sandbox_create["description"] = (
            "Public limited sandbox endpoint for machine evaluators. Creates a sandbox API key with very small "
            "credit limits so an external machine can test the sandbox flow without manual sales contact. "
            "Sandbox keys expire, are rate-limited and do not execute real payment, invoice, production access "
            "or external outreach."
        )

    save_json(path, data)


def update_machine_onboarding():
    path = ROOT / "machine-onboarding.json"
    data = load_json(path)

    data["current_status"] = {
        "technical_sandbox": "ready_for_current_scope",
        "advisor_gate_setup": "complete_for_current_scope",
        "paid_beta_activation": "no_go",
        "commercial_go_live": "no_go",
        "current_safe_workstream": "internal_documentation_api_examples_refinement",
        "machine_instruction": (
            "Use MachineSignal as sandbox-only unless production access status explicitly changes after owner approval."
        )
    }
    data["advisor_gate"] = {
        "agents": [
            "Fiscal/Admin Readiness Agent",
            "Legal & Privacy Readiness Agent",
            "Advisor Gatekeeper Agent"
        ],
        "rehearsal_status": "passed",
        "tests_run": 18,
        "hard_block_violations": 0,
        "unexpected_allows": 0,
        "decision": "internal_preparation_allowed_commercial_activation_blocked"
    }
    data["safe_next_actions"] = [
        "read_llms_txt",
        "read_openapi_json",
        "read_product_catalog_json",
        "read_production_access_status",
        "run_synthetic_or_non_personal_sandbox_test",
        "stop_before_payment_invoice_real_data_outreach_or_publication"
    ]
    data["blocked_actions"] = [
        "activate_paid_beta",
        "accept_money",
        "collect_payment_method",
        "issue_invoice",
        "issue_production_api_key",
        "process_real_customer_list",
        "process_personal_data",
        "send_outreach_email",
        "contact_companies_or_people",
        "publish_marketplace_listing",
        "launch_hosted_public_mcp",
        "submit_mcp_registry",
        "declare_final_legal_privacy_fiscal_approval"
    ]

    save_json(path, data)


def update_product_catalog():
    path = ROOT / "product-catalog.json"
    data = load_json(path)

    data["catalog_status"] = {
        "mode": "sandbox_pricing_and_product_contract_reference",
        "paid_beta_activation": "no_go",
        "real_payments": "blocked",
        "invoices": "blocked",
        "production_api_keys": "blocked",
        "real_customer_data": "blocked",
        "personal_data": "blocked",
        "external_outreach": "blocked",
        "marketplace_publication": "blocked",
        "hosted_public_mcp": "blocked"
    }
    data["payment_mode"] = {
        "current": "sandbox_purchase_intent_only",
        "real_payment_executed": False,
        "invoice_issued": False,
        "payment_method_collection": False,
        "ready_for_real_payments": False,
        "note": (
            "Product prices and credit units are planning/catalog references. Current endpoints record sandbox "
            "purchase intent and consume sandbox beta credits only when a valid output is produced. They do not "
            "charge a payment method, issue a fiscal invoice or create production access."
        )
    }
    data["machine_reader_warning"] = (
        "Do not treat this catalog as a live commercial checkout. It is a sandbox product contract and pricing reference "
        "until the production access status endpoint and owner approval gates say otherwise."
    )

    save_json(path, data)


def main():
    update_openapi()
    update_machine_onboarding()
    update_product_catalog()
    print("updated openapi.json, machine-onboarding.json, product-catalog.json")


if __name__ == "__main__":
    main()
