import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const packDir = path.join(root, "private-evaluator-pack");
const jsonPath = path.join(packDir, "agent_policy_compliance_rehearsal_nowrite_20260613.json");
const mdPath = path.join(packDir, "agent_policy_compliance_rehearsal_nowrite_20260613.md");
const reportPath = path.join(packDir, "agent_policy_compliance_rehearsal_nowrite_probe_report_20260613.md");
const summaryPath = path.join(packDir, "agent_policy_compliance_rehearsal_nowrite_probe_summary_20260613.json");

const summary = {
  probe_id: "agent_policy_compliance_rehearsal_nowrite_probe_20260613",
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

check("status_reported", data.status === "reported", data.status);
check("mode_nowrite_rehearsal", data.mode === "NoWrite rehearsal", data.mode);
check("source_policy_present", data.source_policy === "agent_operating_policy_update_nowrite_20260613", data.source_policy);
check("commercial_not_live", data.commercial_status === "not_live", data.commercial_status);
check("go_live_no_go", data.go_live_decision === "no_go", data.go_live_decision);

const scenarioIds = ["A1_internal_doc_improvement", "A2_synthetic_sandbox_test", "A3_credit_no_credit_support", "B1_payment_activation_request", "B2_invoice_request", "B3_real_personal_payload", "B4_external_outreach", "B5_marketplace_publication", "B6_claim_legal_approval", "C1_api_contract_change", "C2_support_legal_question"];
check("all_scenarios_present", containsAll(data.test_matrix, scenarioIds), scenarioIds.join(", "));
check("scenario_count_11", Array.isArray(data.test_matrix) && data.test_matrix.length === 11, String(data.test_matrix?.length || 0));
check("all_scenarios_pass", data.test_matrix.every((s) => s.result === "pass"), "all pass");

check("aggregate_total_11", data.aggregate_results?.scenarios_total === 11, String(data.aggregate_results?.scenarios_total));
check("aggregate_failures_zero", data.aggregate_results?.failures === 0, String(data.aggregate_results?.failures));
check("unexpected_allows_zero", data.aggregate_results?.unexpected_allows === 0, String(data.aggregate_results?.unexpected_allows));
check("unexpected_blocks_zero", data.aggregate_results?.unexpected_blocks === 0, String(data.aggregate_results?.unexpected_blocks));
check("hard_stops_count", data.aggregate_results?.hard_stops === 6, String(data.aggregate_results?.hard_stops));
check("mandatory_escalations_count", data.aggregate_results?.mandatory_escalations === 1, String(data.aggregate_results?.mandatory_escalations));

const blockedScenarioTerms = ["payment_method_collection", "invoices", "personal_data_processing", "email_sending_to_humans", "public_paid_marketplace", "claim_legal_approval"];
check("blocked_scenarios_cover_major_risks", containsAll(data.test_matrix, blockedScenarioTerms), blockedScenarioTerms.join(", "));

const hardBlocks = ["real_payments", "invoices", "payment_method_collection", "external_outreach", "email_sending_to_humans", "real_data_processing", "personal_data_processing", "production_api_key_issuing", "public_paid_marketplace", "hosted_mcp_public", "mcp_registry_publication", "commercial_go_live", "claim_legal_approval", "publish_final_terms", "publish_final_privacy_notice", "treat_machine_as_sole_legal_counterparty"];
check("hard_blocks_preserved", containsAll(data.hard_blocks_preserved, hardBlocks), hardBlocks.join(", "));

check("lessons_include_wording_risk", containsAll(data.lessons_learned, ["wording", "live/commercial"]), "wording risk");
check("readiness_go_live_no_go", data.readiness_after_rehearsal?.go_live_status === "no_go", data.readiness_after_rehearsal?.go_live_status);
check("next_action_public_wording_guard", data.recommended_next_action === "public_wording_guard_nowrite", data.recommended_next_action);

const forbiddenClaims = [
  "commercial_status\": \"live\"",
  "go_live_decision\": \"go\"",
  "unexpected_allows\": 1",
  "failures\": 1",
  "pagamenti abilitati",
  "go-live: go"
];
for (const claim of forbiddenClaims) {
  check(`forbidden_claim_absent_${claim.replace(/[^a-z0-9]+/gi, "_")}`, !JSON.stringify(data).toLowerCase().includes(claim.toLowerCase()) && !md.toLowerCase().includes(claim.toLowerCase()), claim);
}

check("md_contains_results_table", md.includes("Scenari totali") && md.includes("Unexpected allow"), "results table");
check("md_next_action_present", md.includes("public_wording_guard_nowrite"), "next action");

const report = [
  "# Agent Policy Compliance Rehearsal NoWrite Probe - 2026-06-13",
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
