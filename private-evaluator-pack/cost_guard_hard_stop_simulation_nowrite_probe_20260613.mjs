import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const simPath = path.join(root, "private-evaluator-pack", "cost_guard_hard_stop_simulation_nowrite_20260613.json");
const markdownPath = path.join(root, "private-evaluator-pack", "cost_guard_hard_stop_simulation_nowrite_20260613.md");
const summaryPath = path.join(root, "private-evaluator-pack", "cost_guard_hard_stop_simulation_nowrite_probe_summary_20260613.json");
const reportPath = path.join(root, "private-evaluator-pack", "cost_guard_hard_stop_simulation_nowrite_probe_report_20260613.md");

const sim = JSON.parse(fs.readFileSync(simPath, "utf8"));
const markdown = fs.readFileSync(markdownPath, "utf8");
const checks = [];
function check(name, ok, detail = "") {
  checks.push({ name, ok: Boolean(ok), detail });
}

const scenarios = new Map((sim.scenarios ?? []).map((item) => [item.scenario, item]));
const blocked = new Set(sim.blocked_until_owner_approval ?? []);

check("simulation completed", sim.status === "completed", sim.status);
check("mode NoWrite", sim.mode === "NoWrite simulation", sim.mode);
check("commercial not live", sim.commercial_status === "not_live", sim.commercial_status);
check("no real payments", sim.simulation_rules?.real_payments_executed === false, String(sim.simulation_rules?.real_payments_executed));
check("no invoices", sim.simulation_rules?.invoices_issued === false, String(sim.simulation_rules?.invoices_issued));
check("no payment methods", sim.simulation_rules?.payment_methods_collected === false, String(sim.simulation_rules?.payment_methods_collected));
check("zero paid external calls", sim.simulation_rules?.external_paid_api_calls_executed === 0, String(sim.simulation_rules?.external_paid_api_calls_executed));
check("zero external contacts", sim.simulation_rules?.external_contacts_executed === 0, String(sim.simulation_rules?.external_contacts_executed));
check("no real data", sim.simulation_rules?.real_data_used === false, String(sim.simulation_rules?.real_data_used));
check("no personal data", sim.simulation_rules?.personal_data_used === false, String(sim.simulation_rules?.personal_data_used));
check("zero POST", sim.simulation_rules?.post_calls_executed === 0, String(sim.simulation_rules?.post_calls_executed));
check("zero writes", sim.simulation_rules?.write_calls_executed === 0, String(sim.simulation_rules?.write_calls_executed));

check("KV soft limit 500", sim.thresholds?.cloudflare_kv_writes_soft_limit === 500, String(sim.thresholds?.cloudflare_kv_writes_soft_limit));
check("KV hard stop 900", sim.thresholds?.cloudflare_kv_writes_hard_stop === 900, String(sim.thresholds?.cloudflare_kv_writes_hard_stop));
check("external paid calls allowed zero", sim.thresholds?.external_paid_api_calls_allowed_without_budget === 0, String(sim.thresholds?.external_paid_api_calls_allowed_without_budget));
check("real payment attempts zero", sim.thresholds?.real_payment_attempts_allowed === 0, String(sim.thresholds?.real_payment_attempts_allowed));
check("human outreach attempts zero", sim.thresholds?.human_outreach_attempts_allowed === 0, String(sim.thresholds?.human_outreach_attempts_allowed));

for (const scenario of [
  "cloudflare_or_worker_429",
  "kv_write_soft_limit_exceeded",
  "kv_write_hard_stop_exceeded",
  "external_paid_api_call_without_budget",
  "product_cost_above_threshold",
  "real_or_personal_data_in_test",
  "api_key_exposure_suspected"
]) {
  check(`scenario exists: ${scenario}`, scenarios.has(scenario));
  check(`scenario passed: ${scenario}`, scenarios.get(scenario)?.result === "passed", scenarios.get(scenario)?.result);
}

for (const scenario of [
  "cloudflare_or_worker_429",
  "kv_write_hard_stop_exceeded",
  "external_paid_api_call_without_budget",
  "real_or_personal_data_in_test",
  "api_key_exposure_suspected"
]) {
  check(`red scenario hard stops: ${scenario}`, scenarios.get(scenario)?.hard_stop_triggered === true, String(scenarios.get(scenario)?.hard_stop_triggered));
  check(`red scenario status: ${scenario}`, scenarios.get(scenario)?.status_level === "red", scenarios.get(scenario)?.status_level);
}

for (const scenario of ["kv_write_soft_limit_exceeded", "product_cost_above_threshold"]) {
  check(`yellow scenario no hard stop: ${scenario}`, scenarios.get(scenario)?.hard_stop_triggered === false, String(scenarios.get(scenario)?.hard_stop_triggered));
  check(`yellow scenario status: ${scenario}`, scenarios.get(scenario)?.status_level === "yellow", scenarios.get(scenario)?.status_level);
}

check("7 scenarios total", sim.result_summary?.scenarios_total === 7, String(sim.result_summary?.scenarios_total));
check("7 scenarios passed", sim.result_summary?.scenarios_passed === 7, String(sim.result_summary?.scenarios_passed));
check("5 red scenarios", sim.result_summary?.red_scenarios === 5, String(sim.result_summary?.red_scenarios));
check("2 yellow scenarios", sim.result_summary?.yellow_scenarios === 2, String(sim.result_summary?.yellow_scenarios));
check("5 hard stops", sim.result_summary?.hard_stops_triggered === 5, String(sim.result_summary?.hard_stops_triggered));
check("automatic retries not allowed", sim.result_summary?.automatic_retries_allowed === false, String(sim.result_summary?.automatic_retries_allowed));
check("NoWrite preserved", sim.result_summary?.no_write_mode_preserved === true, String(sim.result_summary?.no_write_mode_preserved));
check("commercial go-live no-go", sim.result_summary?.commercial_go_live === "no_go", sim.result_summary?.commercial_go_live);

for (const blockedItem of [
  "real payments",
  "invoices",
  "payment method collection",
  "external paid API calls",
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

check("next action production API key policy", sim.recommended_next_action?.name === "production_api_key_policy_draft", sim.recommended_next_action?.name);
check("next action NoWrite", sim.recommended_next_action?.mode === "NoWrite planning", sim.recommended_next_action?.mode);
check("next action no supervision", sim.recommended_next_action?.requires_owner_supervision === false, String(sim.recommended_next_action?.requires_owner_supervision));

for (const phrase of [
  "Risultato: **passed**",
  "Chiamate paid esterne: 0",
  "Hard stop attivati: 5",
  "Go-live commerciale: NO-GO",
  "production_api_key_policy_draft"
]) {
  check(`markdown contains: ${phrase}`, markdown.includes(phrase), phrase);
}

const failed = checks.filter((item) => !item.ok);
const summary = {
  probe_id: "cost_guard_hard_stop_simulation_nowrite_probe_20260613",
  status: failed.length === 0 ? "passed" : "failed",
  checks_total: checks.length,
  checks_failed: failed.length,
  failed_checks: failed,
  commercial_status: sim.commercial_status,
  commercial_go_live: sim.result_summary?.commercial_go_live,
  recommended_next_action: sim.recommended_next_action?.name
};

const report = [
  "# Cost guard hard stop simulation NoWrite probe",
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
