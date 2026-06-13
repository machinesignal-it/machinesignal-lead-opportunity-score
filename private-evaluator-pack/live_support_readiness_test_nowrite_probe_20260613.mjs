import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const testPath = path.join(root, "private-evaluator-pack", "live_support_readiness_test_nowrite_20260613.json");
const markdownPath = path.join(root, "private-evaluator-pack", "live_support_readiness_test_nowrite_20260613.md");
const summaryPath = path.join(root, "private-evaluator-pack", "live_support_readiness_test_nowrite_probe_summary_20260613.json");
const reportPath = path.join(root, "private-evaluator-pack", "live_support_readiness_test_nowrite_probe_report_20260613.md");

const test = JSON.parse(fs.readFileSync(testPath, "utf8"));
const markdown = fs.readFileSync(markdownPath, "utf8");
const checks = [];
function check(name, ok, detail = "") {
  checks.push({ name, ok: Boolean(ok), detail });
}

const scenarios = new Map((test.scenarios ?? []).map((scenario) => [scenario.scenario, scenario]));
const blocked = new Set(test.blocked_until_owner_approval ?? []);

check("test completed", test.status === "completed", test.status);
check("mode NoWrite simulation", test.mode === "NoWrite simulation", test.mode);
check("commercial not live", test.commercial_status === "not_live", test.commercial_status);
check("no real customers", test.simulation_rules?.real_customers_used === false, String(test.simulation_rules?.real_customers_used));
check("no messages sent", test.simulation_rules?.messages_sent === false, String(test.simulation_rules?.messages_sent));
check("payments disabled", test.simulation_rules?.payments_enabled === false, String(test.simulation_rules?.payments_enabled));
check("invoices disabled", test.simulation_rules?.invoices_enabled === false, String(test.simulation_rules?.invoices_enabled));
check("external contact disabled", test.simulation_rules?.external_contact_enabled === false, String(test.simulation_rules?.external_contact_enabled));
check("real data not used", test.simulation_rules?.real_data_used === false, String(test.simulation_rules?.real_data_used));
check("zero POST calls", test.simulation_rules?.post_calls_executed === 0, String(test.simulation_rules?.post_calls_executed));
check("zero write calls", test.simulation_rules?.write_calls_executed === 0, String(test.simulation_rules?.write_calls_executed));

for (const scenario of [
  "invalid_input",
  "insufficient_credits",
  "duplicate_request",
  "output_not_valid",
  "suspected_abuse_or_unbounded_usage",
  "payment_or_invoice_request_before_gate",
  "real_data_detected_in_test"
]) {
  check(`scenario exists: ${scenario}`, scenarios.has(scenario));
  check(`scenario passed: ${scenario}`, scenarios.get(scenario)?.result === "passed", scenarios.get(scenario)?.result);
}

for (const scenario of ["invalid_input", "insufficient_credits", "duplicate_request", "output_not_valid"]) {
  check(`common scenario no escalation: ${scenario}`, scenarios.get(scenario)?.owner_escalation === false, String(scenarios.get(scenario)?.owner_escalation));
  check(`common scenario no queue item: ${scenario}`, scenarios.get(scenario)?.work_queue_item_created === false, String(scenarios.get(scenario)?.work_queue_item_created));
}

for (const scenario of ["suspected_abuse_or_unbounded_usage", "payment_or_invoice_request_before_gate", "real_data_detected_in_test"]) {
  check(`critical scenario escalates: ${scenario}`, scenarios.get(scenario)?.owner_escalation === true, String(scenarios.get(scenario)?.owner_escalation));
  check(`critical scenario creates queue item: ${scenario}`, scenarios.get(scenario)?.work_queue_item_created === true, String(scenarios.get(scenario)?.work_queue_item_created));
}

check("hard stop triggered", test.no_work_accumulation_result?.hard_stop_triggered === true, String(test.no_work_accumulation_result?.hard_stop_triggered));
check("hard stop after 3", test.no_work_accumulation_result?.hard_stop_after_critical_items === 3, String(test.no_work_accumulation_result?.hard_stop_after_critical_items));
check("critical items equals 3", test.no_work_accumulation_result?.critical_items_created === 3, String(test.no_work_accumulation_result?.critical_items_created));
check("owner summary max 3", test.no_work_accumulation_result?.owner_summary_max_items === 3, String(test.no_work_accumulation_result?.owner_summary_max_items));
check("owner time <= 15", test.no_work_accumulation_result?.owner_daily_time_estimate_minutes <= 15, String(test.no_work_accumulation_result?.owner_daily_time_estimate_minutes));
check("common support ready pre-live", test.readiness_result?.support_common_cases === "ready_for_pre_live", test.readiness_result?.support_common_cases);
check("live support not live", test.readiness_result?.live_customer_support === "not_live", test.readiness_result?.live_customer_support);
check("commercial go-live no-go", test.readiness_result?.commercial_go_live === "no_go", test.readiness_result?.commercial_go_live);

for (const blockedItem of [
  "real payments",
  "invoices",
  "payment method collection",
  "external outreach",
  "real data processing",
  "personal data processing",
  "production API key issuing",
  "public paid marketplace publication",
  "hosted public MCP launch",
  "MCP registry publication",
  "commercial go-live"
]) {
  check(`blocked: ${blockedItem}`, blocked.has(blockedItem));
}

check("next action cost guard", test.recommended_next_action?.name === "cost_guard_hard_stop_simulation_nowrite", test.recommended_next_action?.name);
check("next action no supervision", test.recommended_next_action?.requires_owner_supervision === false, String(test.recommended_next_action?.requires_owner_supervision));

for (const phrase of [
  "Risultato: **passed**",
  "POST eseguiti: 0",
  "Hard stop attivato: si",
  "Go-live commerciale: NO-GO",
  "cost_guard_hard_stop_simulation_nowrite"
]) {
  check(`markdown contains: ${phrase}`, markdown.includes(phrase), phrase);
}

const failed = checks.filter((item) => !item.ok);
const summary = {
  probe_id: "live_support_readiness_test_nowrite_probe_20260613",
  status: failed.length === 0 ? "passed" : "failed",
  checks_total: checks.length,
  checks_failed: failed.length,
  failed_checks: failed,
  commercial_status: test.commercial_status,
  commercial_go_live: test.readiness_result?.commercial_go_live,
  recommended_next_action: test.recommended_next_action?.name
};

const report = [
  "# Live support readiness test NoWrite probe",
  "",
  `Status: ${summary.status}`,
  `Checks total: ${summary.checks_total}`,
  `Checks failed: ${summary.checks_failed}`,
  `Commercial status: ${summary.commercial_status}`,
  `Commercial go-live: ${summary.commercial_go_live}`,
  "",
  "## Failed checks",
  "",
  failed.length === 0 ? "None." : failed.map((item) => `- ${item.name}: ${item.detail}`).join("\n"),
  "",
  "## Recommended next action",
  "",
  summary.recommended_next_action
].join("\n");

fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2) + "\n");
fs.writeFileSync(reportPath, report + "\n");

if (failed.length > 0) {
  console.error(report);
  process.exit(1);
}
console.log(report);
