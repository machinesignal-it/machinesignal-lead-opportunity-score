import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const packDir = path.join(root, "private-evaluator-pack");
const jsonPath = path.join(packDir, "machine_readable_terms_summary_draft_nowrite_20260613.json");
const mdPath = path.join(packDir, "machine_readable_terms_summary_draft_nowrite_20260613.md");
const reportPath = path.join(packDir, "machine_readable_terms_summary_draft_nowrite_probe_report_20260613.md");
const summaryPath = path.join(packDir, "machine_readable_terms_summary_draft_nowrite_probe_summary_20260613.json");

const summary = {
  probe_id: "machine_readable_terms_summary_draft_nowrite_probe_20260613",
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
check("source_data_map_present", data.source_data_map === "privacy_data_map_draft_nowrite_20260613", data.source_data_map);
check("commercial_not_live", data.commercial_status === "not_live", data.commercial_status);
check("go_live_no_go", data.go_live_decision === "no_go", data.go_live_decision);
check("public_release_not_allowed", data.public_release_allowed === false, String(data.public_release_allowed));
check("real_payments_not_allowed", data.real_payments_allowed === false, String(data.real_payments_allowed));
check("real_data_not_allowed", data.real_data_allowed === false, String(data.real_data_allowed));
check("personal_data_not_allowed", data.personal_data_allowed === false, String(data.personal_data_allowed));
check("human_account_required", data.machine_contract?.human_account_required === true, String(data.machine_contract?.human_account_required));

const productCodes = [
  "score_pack_1k",
  "target_discovery_pack_250",
  "action_pack_25",
  "deepening_report_single"
];
check("products_present", containsAll(data.products, productCodes), productCodes.join(", "));
check("products_all_not_live", data.products.every((p) => p.status === "draft_not_live"), "all draft_not_live");

const decisions = ["discard", "watchlist", "nurture", "buy_deepening", "request_verification"];
check("decisions_supported", containsAll(data.decisions_supported, decisions), decisions.join(", "));

const noCreditRules = [
  "invalid_schema",
  "idempotent_duplicate",
  "system_error",
  "forbidden_input_detected",
  "personal_data_detected",
  "output_missing_required_fields",
  "operation_blocked_by_policy"
];
check("global_no_credit_rules_present", containsAll(data.global_no_credit_rules, noCreditRules), noCreditRules.join(", "));

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
  "commercial_go_live"
];
check("hard_blocks_preserved", containsAll(data.global_hard_blocks, hardBlocks), hardBlocks.join(", "));

const schemaFields = [
  "request_id",
  "product_code",
  "environment",
  "status",
  "decision",
  "opportunity_score",
  "confidence",
  "reason_codes",
  "credit_delta",
  "credit_reason",
  "policy_flags",
  "next_allowed_actions"
];
check("minimum_response_schema_present", containsAll(data.machine_response_minimum_schema, schemaFields), schemaFields.join(", "));

const errorCodes = [
  "MS_POLICY_FORBIDDEN_INPUT",
  "MS_POLICY_LIVE_BLOCKED",
  "MS_SCHEMA_INVALID",
  "MS_OUTPUT_INCOMPLETE",
  "MS_RATE_LIMITED"
];
check("machine_error_taxonomy_present", containsAll(data.machine_error_taxonomy, errorCodes), errorCodes.join(", "));
check("all_errors_zero_credit", data.machine_error_taxonomy.every((e) => e.credit_delta === 0), "zero credit errors");

check("readiness_go_live_no_go", data.readiness_after_summary?.go_live_status === "no_go", data.readiness_after_summary?.go_live_status);
check("next_action_terms_acceptance", data.recommended_next_action === "terms_acceptance_flow_draft_nowrite", data.recommended_next_action);

const forbiddenClaims = [
  "commercial_status\": \"live\"",
  "go_live_decision\": \"go\"",
  "public_release_allowed\": true",
  "real_payments_allowed\": true",
  "real_data_allowed\": true",
  "personal_data_allowed\": true",
  "pagamenti abilitati",
  "go-live: go"
];
for (const claim of forbiddenClaims) {
  check(`forbidden_claim_absent_${claim.replace(/[^a-z0-9]+/gi, "_")}`, !JSON.stringify(data).toLowerCase().includes(claim.toLowerCase()) && !md.toLowerCase().includes(claim.toLowerCase()), claim);
}

check("md_machine_first_with_human_owner", md.includes("ogni macchina deve essere collegata a un account umano o aziendale responsabile"), "human owner rule");
check("md_contains_schema", md.includes('"request_id"') && md.includes('"credit_delta"'), "response schema");
check("md_next_action_present", md.includes("terms_acceptance_flow_draft_nowrite"), "next action");

const report = [
  "# Machine-Readable Terms Summary Draft NoWrite Probe - 2026-06-13",
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
