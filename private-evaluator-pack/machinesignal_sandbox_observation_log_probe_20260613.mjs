import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const logPath = path.join(root, "private-evaluator-pack", "machinesignal_sandbox_observation_log_20260613.json");
const markdownPath = path.join(root, "private-evaluator-pack", "machinesignal_sandbox_observation_log_20260613.md");
const monitorSummaryPath = path.join(root, "private-evaluator-pack", "sandbox_visibility_monitor_summary_20260613.json");
const summaryPath = path.join(root, "private-evaluator-pack", "machinesignal_sandbox_observation_log_probe_summary_20260613.json");
const reportPath = path.join(root, "private-evaluator-pack", "machinesignal_sandbox_observation_log_probe_report_20260613.md");

const log = JSON.parse(fs.readFileSync(logPath, "utf8"));
const markdown = fs.readFileSync(markdownPath, "utf8");
const monitorSummary = JSON.parse(fs.readFileSync(monitorSummaryPath, "utf8"));

const checks = [];
function check(name, ok, detail = "") {
  checks.push({ name, ok: Boolean(ok), detail });
}

check("log status active", log.status === "active_day_1_logged", log.status);
check("roadmap percentage is numeric and >= 90", Number(log.roadmap?.estimated_test_completion_percentage) >= 90, String(log.roadmap?.estimated_test_completion_percentage));
check("decision preserves sandbox-only verdict", log.current_decision?.verdict === "keep_sandbox_visible_continue_no_paid_no_external_publication", log.current_decision?.verdict);
check("commercial status not paid live", log.current_decision?.commercial_status === "not_paid_live", log.current_decision?.commercial_status);
check("distribution passive only", log.current_decision?.external_distribution_status === "passive_visibility_only", log.current_decision?.external_distribution_status);
check("day status green", log.day_observation?.status_level === "green", log.day_observation?.status_level);
check("day mode NoWrite", log.day_observation?.mode === "NoWrite", log.day_observation?.mode);
check("day resources checked matches monitor", log.day_observation?.resources_checked === monitorSummary.resources_total, `${log.day_observation?.resources_checked} vs ${monitorSummary.resources_total}`);
check("day resources failed zero", log.day_observation?.resources_failed === 0, String(log.day_observation?.resources_failed));
check("day post calls zero", log.day_observation?.post_calls_executed === 0, String(log.day_observation?.post_calls_executed));
check("no stop trigger", log.day_observation?.stop_trigger_detected === false, String(log.day_observation?.stop_trigger_detected));

for (const [flag, value] of Object.entries(log.guardrail_status ?? {})) {
  check(`guardrail false: ${flag}`, value === false, String(value));
}

const blocked = new Set(log.blocked_until_owner_approval ?? []);
for (const required of [
  "real payment",
  "paid checkout",
  "invoice issuance",
  "payment method collection",
  "public paid marketplace listing",
  "hosted public MCP",
  "MCP registry publication",
  "production API key publication",
  "human outreach",
  "email campaign",
  "external contact",
  "real customer data",
  "personal data",
  "real lead list processing",
  "unbounded write operations"
]) {
  check(`blocked present: ${required}`, blocked.has(required));
}

check("next action is contract docs consistency", log.recommended_next_action?.name === "contract_docs_consistency_check", log.recommended_next_action?.name);
check("next action NoWrite", log.recommended_next_action?.mode === "NoWrite", log.recommended_next_action?.mode);
check("next action does not require supervision", log.recommended_next_action?.requires_owner_supervision === false, String(log.recommended_next_action?.requires_owner_supervision));
check("user supervision not required today", log.user_supervision?.required_today === false, String(log.user_supervision?.required_today));

const forbidden = [
  /paid\s+live/i,
  /payment\s+approved/i,
  /invoice\s+approved/i,
  /outreach\s+approved/i,
  /external\s+contact\s+approved/i,
  /real\s+customer\s+data\s+approved/i,
  /personal\s+data\s+approved/i
];
for (const pattern of forbidden) {
  check(`no forbidden claim ${pattern}`, !pattern.test(markdown) && !pattern.test(JSON.stringify(log)));
}

check("markdown includes green status", /Stato:\s+\*\*green\*\*/i.test(markdown));
check("markdown includes NoWrite", /NoWrite/.test(markdown));
check("markdown includes next step", /Contract-docs consistency check/i.test(markdown));

const failed = checks.filter((item) => !item.ok);
const summary = {
  probe_id: "machinesignal_sandbox_observation_log_probe_20260613",
  status: failed.length === 0 ? "passed" : "failed",
  checks_total: checks.length,
  checks_failed: failed.length,
  failed_checks: failed,
  roadmap_percentage: log.roadmap?.estimated_test_completion_percentage,
  status_level: log.day_observation?.status_level,
  recommended_next_action: log.recommended_next_action?.name
};

const report = [
  "# MachineSignal sandbox observation log probe",
  "",
  `Status: ${summary.status}`,
  `Checks total: ${summary.checks_total}`,
  `Checks failed: ${summary.checks_failed}`,
  `Roadmap percentage: ${summary.roadmap_percentage}`,
  `Status level: ${summary.status_level}`,
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
