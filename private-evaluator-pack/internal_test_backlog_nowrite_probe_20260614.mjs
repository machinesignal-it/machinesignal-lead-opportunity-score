import fs from "node:fs";

const jsonPath = "private-evaluator-pack/internal_test_backlog_nowrite_20260614.json";
const mdPath = "private-evaluator-pack/internal_test_backlog_nowrite_20260614.md";
const reportPath = "private-evaluator-pack/internal_test_backlog_nowrite_probe_report_20260614.md";
const summaryPath = "private-evaluator-pack/internal_test_backlog_nowrite_probe_summary_20260614.json";

const backlog = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
const md = fs.readFileSync(mdPath, "utf8");
const checks = [];

function check(name, ok, detail) {
  checks.push({ name, ok, detail: String(detail ?? "") });
}

function hasAll(values, required) {
  return required.every((item) => values.includes(item));
}

check("status_prepared", backlog.status === "prepared", backlog.status);
check("mode_nowrite", backlog.mode === "NoWrite internal test backlog", backlog.mode);
check("commercial_not_live", backlog.commercial_status === "not_live", backlog.commercial_status);
check("go_live_no_go", backlog.go_live_decision === "no_go", backlog.go_live_decision);
check("owner_not_required_now", backlog.owner_decision_required_now === false, backlog.owner_decision_required_now);
check("default_internal_only_assumption", /approve_as_internal_only/.test(backlog.current_assumption), backlog.current_assumption);

const blocks = backlog.hard_blocks || [];
check(
  "hard_blocks_complete",
  hasAll(blocks, [
    "no_real_payments",
    "no_invoices",
    "no_payment_method_collection",
    "no_external_outreach",
    "no_email_sending_to_humans",
    "no_real_data_processing",
    "no_personal_data_processing",
    "no_production_api_key_issuing",
    "no_public_paid_marketplace",
    "no_hosted_mcp_public",
    "no_mcp_registry_publication",
    "no_commercial_go_live",
    "no_claim_legal_approval",
    "no_publish_final_terms",
    "no_publish_final_privacy_notice"
  ]),
  blocks.join(", ")
);

const stepIds = (backlog.test_backlog || []).map((item) => item.step_id);
check(
  "p0_p1_steps_present",
  hasAll(stepIds, [
    "internal_contract_consistency_probe_nowrite",
    "sandbox_api_safety_regression_nowrite",
    "synthetic_machine_buyer_journey_rehearsal_nowrite",
    "agent_roles_operating_check_nowrite"
  ]),
  stepIds.join(", ")
);
check("pnl_delta_present", stepIds.includes("pnl_assumption_delta_review_nowrite"), stepIds.join(", "));
check("next_step_contract_consistency", backlog.recommended_next_step === "internal_contract_consistency_probe_nowrite", backlog.recommended_next_step);

const everyStepNoOwner = (backlog.test_backlog || []).every((item) => item.requires_owner === false);
check("all_steps_no_owner_required", everyStepNoOwner, (backlog.test_backlog || []).map((item) => `${item.step_id}:${item.requires_owner}`).join(", "));

const stopConditions = backlog.stop_conditions || [];
check(
  "stop_conditions_include_owner_and_done",
  hasAll(stopConditions, [
    "owner approval required for public publication",
    "all P0 and P1 internal tests pass"
  ]),
  stopConditions.join(", ")
);
check("test_completion_estimate_present", backlog.readiness_snapshot?.overall_test_phase_completion_estimate === 76, backlog.readiness_snapshot?.overall_test_phase_completion_estimate);

const mdRequired = [
  "Internal Test Backlog NoWrite",
  "no real payments",
  "no external outreach",
  "internal_contract_consistency_probe_nowrite",
  "sandbox_api_safety_regression_nowrite",
  "synthetic_machine_buyer_journey_rehearsal_nowrite",
  "agent_roles_operating_check_nowrite",
  "pnl_assumption_delta_review_nowrite",
  "Completamento stimato fase test: 76%"
];
check("md_required_phrases", mdRequired.every((phrase) => md.includes(phrase)), mdRequired.filter((phrase) => !md.includes(phrase)).join(", "));

const forbidden = [
  '"commercial_status": "live"',
  '"go_live_decision": "go"',
  '"owner_decision_required_now": true',
  "pagamenti reali attivi",
  "outreach attivo",
  "go-live approvato"
];
const combined = JSON.stringify(backlog, null, 2) + "\n" + md;
for (const phrase of forbidden) {
  check(`forbidden_absent_${phrase.replace(/[^a-z0-9]+/gi, "_").slice(0, 40)}`, !combined.includes(phrase), phrase);
}

const errors = checks.filter((item) => !item.ok);
const report = [
  "# Internal Test Backlog NoWrite Probe - 2026-06-14",
  "",
  `Checks: ${checks.length}`,
  `Errors: ${errors.length}`,
  "",
  `Result: ${errors.length === 0 ? "PASS" : "FAIL"}`,
  "",
  "## Errors",
  "",
  errors.length ? errors.map((item) => `- ${item.name}: ${item.detail}`).join("\n") : "None.",
  "",
  "## Recommended Next Step",
  "",
  backlog.recommended_next_step
].join("\n");

fs.writeFileSync(reportPath, report);
fs.writeFileSync(summaryPath, JSON.stringify({
  probe_id: "internal_test_backlog_nowrite_probe_20260614",
  created_at: new Date().toISOString(),
  checks,
  errors,
  recommended_next_step: backlog.recommended_next_step
}, null, 2));

console.log(report);
if (errors.length) {
  process.exit(1);
}
