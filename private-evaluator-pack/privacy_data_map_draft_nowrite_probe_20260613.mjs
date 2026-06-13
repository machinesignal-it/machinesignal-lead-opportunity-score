import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const packDir = path.join(root, "private-evaluator-pack");
const jsonPath = path.join(packDir, "privacy_data_map_draft_nowrite_20260613.json");
const mdPath = path.join(packDir, "privacy_data_map_draft_nowrite_20260613.md");
const reportPath = path.join(packDir, "privacy_data_map_draft_nowrite_probe_report_20260613.md");
const summaryPath = path.join(packDir, "privacy_data_map_draft_nowrite_probe_summary_20260613.json");

const summary = {
  probe_id: "privacy_data_map_draft_nowrite_probe_20260613",
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
check("source_review_present", data.source_review === "terms_privacy_agent_review_20260613", data.source_review);
check("commercial_not_live", data.commercial_status === "not_live", data.commercial_status);
check("go_live_no_go", data.go_live_decision === "no_go", data.go_live_decision);
check("no_real_data_used", data.real_data_used_in_this_artifact === false, String(data.real_data_used_in_this_artifact));
check("personal_processing_not_allowed", data.personal_data_processing_allowed_now === false, String(data.personal_data_processing_allowed_now));

const requiredFlows = [
  "F1_account_registration_future",
  "F2_sandbox_api_request",
  "F3_customer_uploaded_company_list_future",
  "F4_machine_requested_target_discovery_future",
  "F5_score_output_and_action_pack",
  "F6_credit_ledger",
  "F7_support_and_privacy_requests_future",
  "F8_security_and_abuse_monitoring"
];
check("all_data_flows_present", containsAll(data.data_flows, requiredFlows), requiredFlows.join(", "));
check("data_flows_count", Array.isArray(data.data_flows) && data.data_flows.length === 8, String(data.data_flows?.length || 0));

const futureBlocked = data.data_flows.filter((flow) => String(flow.status).includes("future_blocked"));
check("future_blocked_flows_present", futureBlocked.length >= 4, String(futureBlocked.length));

const forbiddenFields = [
  "person_name",
  "personal_email",
  "personal_phone",
  "health_data",
  "financial_card_data",
  "password",
  "secret",
  "free_text_with_personal_data"
];
check("forbidden_fields_present", containsAll(data.forbidden_input_fields_until_approval, forbiddenFields), forbiddenFields.join(", "));

const subprocessors = ["Cloudflare", "GitHub", "Postman", "DataForSEO", "Register.it"];
check("subprocessor_inventory_present", containsAll(data.subprocessor_inventory_draft, subprocessors), subprocessors.join(", "));
check("retention_matrix_has_entries", Array.isArray(data.retention_matrix_draft) && data.retention_matrix_draft.length >= 6, String(data.retention_matrix_draft?.length || 0));
check("all_retention_not_approved", data.retention_matrix_draft.every((row) => row.approval_status === "not_approved"), "retention approval status");
check("deletion_process_steps", Array.isArray(data.deletion_process_draft) && data.deletion_process_draft.length >= 8, String(data.deletion_process_draft?.length || 0));

const hardBlocks = [
  "real_payments",
  "invoices",
  "payment_method_collection",
  "external_outreach",
  "real_data_processing",
  "personal_data_processing",
  "production_api_key_issuing",
  "public_paid_marketplace",
  "hosted_mcp_public",
  "mcp_registry_publication",
  "commercial_go_live"
];
check("hard_blocks_preserved", containsAll(data.hard_blocks_preserved, hardBlocks), hardBlocks.join(", "));
check("readiness_go_live_no_go", data.readiness_after_data_map?.go_live_status === "no_go", data.readiness_after_data_map?.go_live_status);
check("next_action_machine_readable_terms", data.recommended_next_action === "machine_readable_terms_summary_draft_nowrite", data.recommended_next_action);

const forbiddenClaims = [
  "real_data_processing_allowed_now\": true",
  "personal_data_processing_allowed_now\": true",
  "go_live_decision\": \"go\"",
  "commercial_status\": \"live\"",
  "retention approvata",
  "dati personali approvati"
];
for (const claim of forbiddenClaims) {
  check(`forbidden_claim_absent_${claim.replace(/[^a-z0-9]+/gi, "_")}`, !JSON.stringify(data).toLowerCase().includes(claim.toLowerCase()) && !md.toLowerCase().includes(claim.toLowerCase()), claim);
}

check("md_states_no_real_data", md.includes("Non contiene dati reali") && md.includes("non autorizza l'uso di dati reali o personali"), "md no real data");
check("md_next_action_present", md.includes("machine_readable_terms_summary_draft_nowrite"), "next action");

const report = [
  "# Privacy Data Map Draft NoWrite Probe - 2026-06-13",
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
