import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const analysisPath = path.join(root, "private-evaluator-pack", "pre_commercial_gate_gap_analysis_20260613.json");
const markdownPath = path.join(root, "private-evaluator-pack", "pre_commercial_gate_gap_analysis_20260613.md");
const summaryPath = path.join(root, "private-evaluator-pack", "pre_commercial_gate_gap_analysis_probe_summary_20260613.json");
const reportPath = path.join(root, "private-evaluator-pack", "pre_commercial_gate_gap_analysis_probe_report_20260613.md");

const analysis = JSON.parse(fs.readFileSync(analysisPath, "utf8"));
const markdown = fs.readFileSync(markdownPath, "utf8");
const checks = [];

function check(name, ok, detail = "") {
  checks.push({ name, ok: Boolean(ok), detail });
}

const gates = analysis.gates ?? [];
const gateMap = new Map(gates.map((gate) => [gate.gate, gate]));
const sequence = analysis.recommended_sequence ?? [];

check("analysis completed", analysis.status === "completed", analysis.status);
check("mode NoWrite planning", analysis.mode === "NoWrite planning", analysis.mode);
check("sandbox percent 94", analysis.roadmap?.sandbox_test_completion_percentage === 94, String(analysis.roadmap?.sandbox_test_completion_percentage));
check("commercial readiness below live threshold", analysis.roadmap?.commercial_go_live_readiness_percentage < 70, String(analysis.roadmap?.commercial_go_live_readiness_percentage));
check("commercial go-live blocked", analysis.roadmap?.commercial_go_live_status === "blocked", analysis.roadmap?.commercial_go_live_status);
check("total gates 8", analysis.gap_summary?.total_gates === 8, String(analysis.gap_summary?.total_gates));
check("blocking gates 8", analysis.gap_summary?.blocking_gates === 8, String(analysis.gap_summary?.blocking_gates));
check("owner decisions required", analysis.gap_summary?.owner_decision_required_gates >= 5, String(analysis.gap_summary?.owner_decision_required_gates));

for (const gateName of [
  "admin_fiscal_gate",
  "legal_terms_gate",
  "privacy_data_gate",
  "payment_billing_gate",
  "production_api_key_gate",
  "support_post_sale_gate",
  "cost_limit_gate",
  "public_distribution_gate"
]) {
  const gate = gateMap.get(gateName);
  check(`gate exists: ${gateName}`, Boolean(gate));
  check(`gate blocks go-live: ${gateName}`, gate?.blocks_go_live === true, String(gate?.blocks_go_live));
  check(`gate has missing list: ${gateName}`, (gate?.what_is_missing ?? []).length >= 4, String((gate?.what_is_missing ?? []).length));
  check(`gate has agent tasks: ${gateName}`, (gate?.agents_can_prepare ?? []).length >= 3, String((gate?.agents_can_prepare ?? []).length));
  check(`gate has owner decisions: ${gateName}`, (gate?.owner_must_decide ?? []).length >= 1, String((gate?.owner_must_decide ?? []).length));
}

check("sequence starts with support", sequence[0] === "support_post_sale_gate", sequence[0]);
check("sequence then cost", sequence[1] === "cost_limit_gate", sequence[1]);
check("distribution last", sequence[sequence.length - 1] === "public_distribution_gate", sequence[sequence.length - 1]);
check("next action support and cost guard", analysis.next_action?.name === "support_and_cost_guard_draft", analysis.next_action?.name);
check("next action NoWrite", analysis.next_action?.mode === "NoWrite planning", analysis.next_action?.mode);
check("next action no owner supervision", analysis.next_action?.requires_owner_supervision === false, String(analysis.next_action?.requires_owner_supervision));

for (const phrase of [
  "Readiness go-live commerciale: **38%**",
  "Go-live commerciale: **blocked**",
  "support_and_cost_guard_draft",
  "non accumulare lavoro",
  "spese non controllate"
]) {
  check(`markdown contains: ${phrase}`, markdown.includes(phrase), phrase);
}

const failed = checks.filter((item) => !item.ok);
const summary = {
  probe_id: "pre_commercial_gate_gap_analysis_probe_20260613",
  status: failed.length === 0 ? "passed" : "failed",
  checks_total: checks.length,
  checks_failed: failed.length,
  failed_checks: failed,
  commercial_go_live_readiness_percentage: analysis.roadmap?.commercial_go_live_readiness_percentage,
  commercial_go_live_status: analysis.roadmap?.commercial_go_live_status,
  recommended_next_action: analysis.next_action?.name
};

const report = [
  "# Pre-commercial gate gap analysis probe",
  "",
  `Status: ${summary.status}`,
  `Checks total: ${summary.checks_total}`,
  `Checks failed: ${summary.checks_failed}`,
  `Commercial go-live readiness: ${summary.commercial_go_live_readiness_percentage}%`,
  `Commercial go-live status: ${summary.commercial_go_live_status}`,
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
