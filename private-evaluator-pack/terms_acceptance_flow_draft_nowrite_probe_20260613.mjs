import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const packDir = path.join(root, "private-evaluator-pack");
const jsonPath = path.join(packDir, "terms_acceptance_flow_draft_nowrite_20260613.json");
const mdPath = path.join(packDir, "terms_acceptance_flow_draft_nowrite_20260613.md");
const reportPath = path.join(packDir, "terms_acceptance_flow_draft_nowrite_probe_report_20260613.md");
const summaryPath = path.join(packDir, "terms_acceptance_flow_draft_nowrite_probe_summary_20260613.json");

const summary = {
  probe_id: "terms_acceptance_flow_draft_nowrite_probe_20260613",
  created_at: new Date().toISOString(),
  checks: [],
  errors: []
};

function check(name, ok, detail = "") {
  summary.checks.push({ name, ok, detail });
  if (!ok) summary.errors.push({ name, detail });
}

function containsAll(value, needles) {
  const text = JSON.stringify(value).toLowerCase();
  return needles.every((needle) => text.includes(String(needle).toLowerCase()));
}

const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
const md = fs.readFileSync(mdPath, "utf8");

check("status_prepared", data.status === "prepared", data.status);
check("mode_nowrite", data.mode === "NoWrite planning", data.mode);
check("source_summary_present", data.source_summary === "machine_readable_terms_summary_draft_nowrite_20260613", data.source_summary);
check("commercial_not_live", data.commercial_status === "not_live", data.commercial_status);
check("go_live_no_go", data.go_live_decision === "no_go", data.go_live_decision);
check("payments_not_allowed", data.real_payments_allowed === false, String(data.real_payments_allowed));
check("real_data_not_allowed", data.real_data_allowed === false, String(data.real_data_allowed));
check("prod_keys_not_allowed", data.production_api_keys_allowed === false, String(data.production_api_keys_allowed));

check("machine_cannot_accept_alone", data.core_rule?.machine_can_accept_legal_terms_alone === false, String(data.core_rule?.machine_can_accept_legal_terms_alone));
check("human_owner_required", data.core_rule?.human_or_company_owner_required === true, String(data.core_rule?.human_or_company_owner_required));
check("acceptance_auditable", data.core_rule?.acceptance_must_be_auditable === true, String(data.core_rule?.acceptance_must_be_auditable));

const states = ["not_present", "sandbox_accepted", "pre_live_owner_approved", "future_live_accepted"];
check("acceptance_states_present", containsAll(data.acceptance_states, states), states.join(", "));

const recordFields = [
  "account_owner_id",
  "accepted_terms_version",
  "accepted_privacy_version",
  "accepted_by_human",
  "machine_client_id",
  "api_key_prefix",
  "terms_hash",
  "privacy_hash",
  "revoked_at"
];
check("acceptance_record_fields_present", containsAll(data.required_acceptance_record, recordFields), recordFields.join(", "));
check("flow_steps_count", Array.isArray(data.flow_steps) && data.flow_steps.length === 8, String(data.flow_steps?.length || 0));
check("flow_steps_bind_machine_and_audit", containsAll(data.flow_steps, ["Bind machine client to owner", "Audit each credit-consuming call", "Revoke access"]), "bind/audit/revoke");

const policyFields = [
  "account_owner_status",
  "machine_client_status",
  "terms_version",
  "privacy_version",
  "can_consume_credits",
  "can_process_real_data",
  "can_make_payment",
  "blocked_reasons"
];
check("machine_policy_status_fields_present", containsAll(data.machine_policy_status_response.minimum_fields, policyFields), policyFields.join(", "));
check("example_sandbox_blocks_live", data.machine_policy_status_response.example_sandbox_blocked?.can_make_payment === false && data.machine_policy_status_response.example_sandbox_blocked?.can_process_real_data === false, "sandbox blocks payment and real data");

const auditItems = [
  "Never store full plaintext API key",
  "terms/privacy version",
  "idempotency key",
  "credit_delta",
  "revocation"
];
check("audit_requirements_present", containsAll(data.audit_requirements, auditItems), auditItems.join(", "));

const hardBlocks = [
  "real_payments",
  "invoices",
  "payment_method_collection",
  "external_outreach",
  "email_sending_to_humans",
  "real_data_processing",
  "personal_data_processing",
  "production_api_key_issuing",
  "public_paid_marketplace",
  "hosted_mcp_public",
  "mcp_registry_publication",
  "commercial_go_live",
  "treat_machine_as_sole_legal_counterparty"
];
check("hard_blocks_preserved", containsAll(data.must_not_do_now, hardBlocks), hardBlocks.join(", "));

check("readiness_go_live_no_go", data.readiness_after_acceptance_flow?.go_live_status === "no_go", data.readiness_after_acceptance_flow?.go_live_status);
check("next_action_support_playbook", data.recommended_next_action === "support_privacy_terms_playbook_nowrite", data.recommended_next_action);

const forbiddenClaims = [
  "commercial_status\": \"live\"",
  "go_live_decision\": \"go\"",
  "real_payments_allowed\": true",
  "real_data_allowed\": true",
  "production_api_keys_allowed\": true",
  "machine_can_accept_legal_terms_alone\": true",
  "go-live: go"
];
for (const claim of forbiddenClaims) {
  check(`forbidden_claim_absent_${claim.replace(/[^a-z0-9]+/gi, "_")}`, !JSON.stringify(data).toLowerCase().includes(claim.toLowerCase()) && !md.toLowerCase().includes(claim.toLowerCase()), claim);
}

check("md_contains_human_owner_rule", md.includes("Ogni macchina deve essere collegata a un account umano o aziendale responsabile"), "human owner rule");
check("md_next_action_present", md.includes("support_privacy_terms_playbook_nowrite"), "next action");

const report = [
  "# Terms Acceptance Flow Draft NoWrite Probe - 2026-06-13",
  "",
  `Checks: ${summary.checks.length}`,
  `Errors: ${summary.errors.length}`,
  "",
  summary.errors.length === 0 ? "Result: PASS" : "Result: FAIL",
  "",
  "## Errors",
  "",
  summary.errors.length === 0 ? "None." : summary.errors.map((e) => `- ${e.name}: ${e.detail}`).join("\n")
].join("\n");

fs.writeFileSync(reportPath, report, "utf8");
fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2), "utf8");

if (summary.errors.length) {
  console.error(report);
  process.exit(1);
}

console.log(report);
