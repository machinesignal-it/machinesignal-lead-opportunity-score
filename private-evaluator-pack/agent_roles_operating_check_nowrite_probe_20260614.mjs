import fs from "node:fs";

const jsonPath = "private-evaluator-pack/agent_roles_operating_check_nowrite_20260614.json";
const mdPath = "private-evaluator-pack/agent_roles_operating_check_nowrite_20260614.md";
const reportPath = "private-evaluator-pack/agent_roles_operating_check_nowrite_probe_report_20260614.md";
const summaryPath = "private-evaluator-pack/agent_roles_operating_check_nowrite_probe_summary_20260614.json";

const checkData = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
const md = fs.readFileSync(mdPath, "utf8");
const checks = [];

function check(name, ok, detail) {
  checks.push({ name, ok, detail: String(detail ?? "") });
}

function includesAll(values, required) {
  return required.every((item) => values.includes(item));
}

check("status_reported", checkData.status === "reported", checkData.status);
check("mode_nowrite", checkData.mode === "NoWrite agent roles operating check", checkData.mode);
check("commercial_not_live", checkData.commercial_status === "not_live", checkData.commercial_status);
check("go_live_no_go", checkData.go_live_decision === "no_go", checkData.go_live_decision);

const roleNames = (checkData.roles || []).map((role) => role.role);
check(
  "required_roles_present",
  includesAll(roleNames, [
    "Machine-to-Machine Sales Ops Agent",
    "Customer Success & Post-Sale Agent",
    "Admin & Finance Controller",
    "Legal & Compliance Agent",
    "HR Agent Manager",
    "Continuous Improvement / Competitive Learning Agent"
  ]),
  roleNames.join(", ")
);

for (const role of checkData.roles || []) {
  check(`${role.role}_fit_for_test`, role.current_fit === "fit_for_test", role.current_fit);
  check(`${role.role}_has_must_not_do`, Array.isArray(role.must_not_do) && role.must_not_do.length >= 3, (role.must_not_do || []).join(", "));
  check(`${role.role}_has_gap`, Boolean(role.gap), role.gap);
}

check("roles_checked_6", checkData.aggregate_result?.roles_checked === 6, checkData.aggregate_result?.roles_checked);
check("roles_fit_6", checkData.aggregate_result?.roles_fit_for_test === 6, checkData.aggregate_result?.roles_fit_for_test);
check("no_hard_block_violations", checkData.aggregate_result?.hard_block_violations === 0, checkData.aggregate_result?.hard_block_violations);
check("no_unexpected_allows", checkData.aggregate_result?.unexpected_allows === 0, checkData.aggregate_result?.unexpected_allows);
check("owner_not_required_now", checkData.aggregate_result?.owner_decision_required_now === false, checkData.aggregate_result?.owner_decision_required_now);

const hardBlocks = checkData.hard_blocks_preserved || [];
check(
  "hard_blocks_preserved",
  includesAll(hardBlocks, [
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
    "claim_legal_approval",
    "publish_final_terms",
    "publish_final_privacy_notice"
  ]),
  hardBlocks.join(", ")
);

const operatingMatrix = checkData.operating_matrix || [];
check("operating_matrix_has_allows", operatingMatrix.some((item) => item.allowed === true), "has allowed rows");
check("operating_matrix_has_blocks", operatingMatrix.some((item) => item.allowed === false), "has blocked rows");
check("paid_checkout_blocked", operatingMatrix.some((item) => item.request_type === "activate paid checkout" && item.allowed === false), "activate paid checkout");
check("marketplace_blocked", operatingMatrix.some((item) => item.request_type === "publish paid marketplace listing" && item.allowed === false), "publish paid marketplace listing");
check("human_email_blocked", operatingMatrix.some((item) => item.request_type === "send emails to humans" && item.allowed === false), "send emails to humans");

check("readiness_go_live_no_go", checkData.readiness_after_check?.go_live_status === "no_go", checkData.readiness_after_check?.go_live_status);
check("next_step_pnl", checkData.recommended_next_step === "pnl_assumption_delta_review_nowrite", checkData.recommended_next_step);

const mdRequired = [
  "Risultato: PASS",
  "Machine-to-Machine Sales Ops Agent",
  "Customer Success & Post-Sale Agent",
  "Admin & Finance Controller",
  "Legal & Compliance Agent",
  "HR Agent Manager",
  "Continuous Improvement",
  "pagamenti reali",
  "email a umani",
  "pnl_assumption_delta_review_nowrite"
];
check("md_required_phrases", mdRequired.every((phrase) => md.includes(phrase)), mdRequired.filter((phrase) => !md.includes(phrase)).join(", "));

const combined = JSON.stringify(checkData, null, 2) + "\n" + md;
for (const phrase of [
  '"commercial_status": "live"',
  '"go_live_decision": "go"',
  '"hard_block_violations": 1',
  '"unexpected_allows": 1',
  "pagamenti reali attivi",
  "outreach attivo",
  "go-live commerciale approvato"
]) {
  check(`forbidden_absent_${phrase.replace(/[^a-z0-9]+/gi, "_").slice(0, 50)}`, !combined.toLowerCase().includes(phrase.toLowerCase()), phrase);
}

const errors = checks.filter((item) => !item.ok);
const report = [
  "# Agent Roles Operating Check NoWrite Probe - 2026-06-14",
  "",
  `Checks: ${checks.length}`,
  `Errors: ${errors.length}`,
  `Result: ${errors.length === 0 ? "PASS" : "FAIL"}`,
  "",
  "## Errors",
  "",
  errors.length ? errors.map((item) => `- ${item.name}: ${item.detail}`).join("\n") : "None.",
  "",
  "## Recommended Next Step",
  "",
  checkData.recommended_next_step
].join("\n");

fs.writeFileSync(reportPath, report);
fs.writeFileSync(summaryPath, JSON.stringify({
  probe_id: "agent_roles_operating_check_nowrite_probe_20260614",
  created_at: new Date().toISOString(),
  checks,
  errors,
  recommended_next_step: checkData.recommended_next_step
}, null, 2));

console.log(report);
if (errors.length) process.exit(1);
