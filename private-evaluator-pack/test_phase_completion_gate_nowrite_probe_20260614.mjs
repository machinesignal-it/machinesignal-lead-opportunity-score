import fs from "node:fs";

const jsonPath = "private-evaluator-pack/test_phase_completion_gate_nowrite_20260614.json";
const mdPath = "private-evaluator-pack/test_phase_completion_gate_nowrite_20260614.md";
const reportPath = "private-evaluator-pack/test_phase_completion_gate_nowrite_probe_report_20260614.md";
const summaryPath = "private-evaluator-pack/test_phase_completion_gate_nowrite_probe_summary_20260614.json";

const gate = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
const md = fs.readFileSync(mdPath, "utf8");
const checks = [];

function check(name, ok, detail) {
  checks.push({ name, ok, detail: String(detail ?? "") });
}

function includesAll(values, required) {
  return required.every((item) => values.includes(item));
}

check("status_reported", gate.status === "reported", gate.status);
check("mode_nowrite", gate.mode === "NoWrite test phase completion gate", gate.mode);
check("commercial_not_live", gate.commercial_status === "not_live", gate.commercial_status);
check("go_live_no_go", gate.go_live_decision === "no_go", gate.go_live_decision);
check("no_api_calls_now", gate.api_calls_executed_now === 0, gate.api_calls_executed_now);
check("no_write_calls_now", gate.write_calls_executed_now === 0, gate.write_calls_executed_now);
check("no_real_payment", gate.real_payment_executed === false, gate.real_payment_executed);
check("no_invoice", gate.invoice_issued === false, gate.invoice_issued);
check("no_outreach", gate.external_outreach_executed === false, gate.external_outreach_executed);
check("no_real_personal_data", gate.real_or_personal_data_used === false, gate.real_or_personal_data_used);
check("no_public_marketplace_registry", gate.public_marketplace_or_registry_published === false, gate.public_marketplace_or_registry_published);

const completed = gate.completed_steps || [];
const stepIds = completed.map((item) => item.step_id);
check(
  "all_backlog_steps_completed",
  includesAll(stepIds, [
    "internal_contract_consistency_probe_nowrite",
    "sandbox_api_safety_regression_nowrite",
    "synthetic_machine_buyer_journey_rehearsal_nowrite",
    "agent_roles_operating_check_nowrite",
    "pnl_assumption_delta_review_nowrite"
  ]),
  stepIds.join(", ")
);
check("aggregate_195_checks", gate.aggregate?.checks_total === 195, gate.aggregate?.checks_total);
check("aggregate_zero_errors", gate.aggregate?.errors_total === 0, gate.aggregate?.errors_total);
check("internal_backlog_completed", gate.aggregate?.internal_test_backlog_completed === true, gate.aggregate?.internal_test_backlog_completed);
check("owner_decision_required", gate.owner_decision_required === true, gate.owner_decision_required);

const decisions = (gate.owner_decision_needed || []).map((item) => item.decision);
check(
  "owner_decisions_present",
  includesAll(decisions, [
    "approve_or_reject_sandbox_public_docs",
    "approve_business_plan_file_updates",
    "choose_next_governance_path"
  ]),
  decisions.join(", ")
);

check("automation_should_stop", gate.automation_decision?.continue_heartbeat_automation === false, JSON.stringify(gate.automation_decision || {}));
check("internal_test_100", gate.readiness_after_gate?.internal_test_phase_completion === 100, gate.readiness_after_gate?.internal_test_phase_completion);
check("go_live_status_no_go", gate.readiness_after_gate?.go_live_status === "no_go", gate.readiness_after_gate?.go_live_status);
check("next_owner_required", gate.recommended_next_step === "owner_decision_required_before_continuing", gate.recommended_next_step);

const notReady = gate.what_is_not_ready || [];
check(
  "blocked_items_present",
  includesAll(notReady, [
    "commercial go-live",
    "real payments",
    "invoices",
    "production API keys",
    "real or personal data processing",
    "external outreach",
    "public paid marketplace listing",
    "hosted public MCP",
    "MCP registry publication"
  ]),
  notReady.join(", ")
);

const mdRequired = [
  "Totale: 195 controlli, 0 errori",
  "Decisione proprietario richiesta",
  "Opzione A",
  "Opzione B",
  "Opzione C",
  "automazione di continuazione automatica va fermata",
  "Go-live: `no_go`",
  "owner_decision_required_before_continuing"
];
check("md_required_phrases", mdRequired.every((phrase) => md.includes(phrase)), mdRequired.filter((phrase) => !md.includes(phrase)).join(", "));

const combined = JSON.stringify(gate, null, 2) + "\n" + md;
for (const phrase of [
  '"commercial_status": "live"',
  '"go_live_decision": "go"',
  '"real_payment_executed": true',
  '"invoice_issued": true',
  '"external_outreach_executed": true',
  '"owner_decision_required": false',
  '"continue_heartbeat_automation": true',
  "go-live commerciale approvato"
]) {
  check(`forbidden_absent_${phrase.replace(/[^a-z0-9]+/gi, "_").slice(0, 50)}`, !combined.toLowerCase().includes(phrase.toLowerCase()), phrase);
}

const errors = checks.filter((item) => !item.ok);
const report = [
  "# Test Phase Completion Gate NoWrite Probe - 2026-06-14",
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
  gate.recommended_next_step
].join("\n");

fs.writeFileSync(reportPath, report);
fs.writeFileSync(summaryPath, JSON.stringify({
  probe_id: "test_phase_completion_gate_nowrite_probe_20260614",
  created_at: new Date().toISOString(),
  checks,
  errors,
  recommended_next_step: gate.recommended_next_step,
  automation_should_stop: gate.automation_decision?.continue_heartbeat_automation === false
}, null, 2));

console.log(report);
if (errors.length) process.exit(1);
