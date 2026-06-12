import { readFile, writeFile } from "node:fs/promises";

const reviewPath = "private-evaluator-pack/agent_go_no_go_mcp_v2_review_20260612.json";
const mcpProbePath = "private-evaluator-pack/mcp_tool_registry_private_draft_v2_probe_summary_20260612.json";
const summaryPath = "private-evaluator-pack/agent_go_no_go_mcp_v2_review_probe_summary_20260612.json";
const reportPath = "private-evaluator-pack/agent_go_no_go_mcp_v2_review_probe_report_20260612.md";

const checks = [];
function addCheck(name, ok, details = "") {
  checks.push({ name, ok: Boolean(ok), details });
}

function includesAll(arr, required) {
  return Array.isArray(arr) && required.every((item) => arr.includes(item));
}

const review = JSON.parse(await readFile(reviewPath, "utf8"));
const mcpProbe = JSON.parse(await readFile(mcpProbePath, "utf8"));

addCheck("review_status_completed", review.status === "completed_agent_go_no_go_mcp_v2_review", review.status);
addCheck("business_rule_machine_not_human", review.business_rule === "sell_to_machines_not_humans", review.business_rule);
addCheck("primary_interface_machine", review.primary_customer_interface === "machine", review.primary_customer_interface);
addCheck("mcp_probe_green", mcpProbe.ok === true && mcpProbe.checks_failed === 0, `ok=${mcpProbe.ok}; failed=${mcpProbe.checks_failed}`);
addCheck("evidence_snapshot_mcp_counts_match", review.evidence_snapshot?.mcp_v2_probe_checks_total === mcpProbe.checks_total && review.evidence_snapshot?.mcp_v2_probe_checks_failed === mcpProbe.checks_failed, "MCP v2 counts");
addCheck("agent_votes_count_minimum", (review.agent_votes || []).length >= 4, `votes=${(review.agent_votes || []).length}`);
addCheck("final_decision_go_private_no_go_public", /GO for private MCP v2 review/i.test(review.consensus?.final_decision || "") && /NO-GO for hosted MCP/i.test(review.consensus?.final_decision || ""), review.consensus?.final_decision || "");
addCheck("go_now_includes_local_adapter", includesAll(review.consensus?.go_now, ["keep MCP/tool-registry v2 as private registry-ready draft", "continue local stdio adapter as the official MCP path"]), (review.consensus?.go_now || []).join(","));
addCheck("no_go_blocks_registry_hosted_billing_keys_data", includesAll(review.consensus?.no_go_now, ["public MCP/tool registry submission", "hosted public MCP endpoint", "live billing", "production key distribution", "personal data", "real customer data"]), (review.consensus?.no_go_now || []).join(","));
addCheck("minimum_prerequisites_auth_rate_audit_scopes", includesAll(review.minimum_hosted_mcp_prerequisites, ["scoped authorization and revocation", "rate limits and abuse controls", "usage logging and audit trail", "separate read-only, write-enabled and admin scopes"]), (review.minimum_hosted_mcp_prerequisites || []).join(","));
addCheck("next_action_checklist_not_build", /Create a hosted MCP architecture checklist/i.test(review.next_action?.recommended || "") && /do not build or publish/i.test(review.next_action?.recommended || ""), review.next_action?.recommended || "");

for (const [counter, expected] of Object.entries({
  mcp_registry_submission_executed: 0,
  hosted_mcp_launch_executed: 0,
  external_marketplace_publication_executed: 0,
  external_send_executed: 0,
  human_outreach_executed: 0,
  machinesignal_api_post_calls_executed: 0,
  machinesignal_api_write_calls_executed: 0,
  payment_executed: 0,
  invoice_issued: 0,
  credits_consumed: 0,
  production_key_published: 0,
  personal_data_used: 0,
  real_customer_data_used: 0,
  real_lead_list_used: 0
})) {
  addCheck(`counter_${counter}_zero`, review.execution_counters?.[counter] === expected, `${counter}=${review.execution_counters?.[counter]}`);
}

const failed = checks.filter((check) => !check.ok);
const summary = {
  artifact: "agent_go_no_go_mcp_v2_review_probe",
  version: "2026-06-12",
  status: failed.length === 0 ? "completed_agent_go_no_go_mcp_v2_review_probe" : "failed_agent_go_no_go_mcp_v2_review_probe",
  ok: failed.length === 0,
  mode: "NoPublishNoWriteAgentReviewValidation",
  review: reviewPath,
  checks_total: checks.length,
  checks_failed: failed.length,
  decision: review.consensus?.final_decision,
  recommended_next_step: review.next_action?.recommended,
  execution_counters: review.execution_counters,
  checks,
  failed_checks: failed
};

const report = [
  "# Agent Go/No-Go MCP v2 Review Probe",
  "",
  "Date: 2026-06-12",
  "",
  `Status: ${summary.status}`,
  `Mode: ${summary.mode}`,
  "",
  "## Result",
  "",
  `- Checks total: ${summary.checks_total}`,
  `- Checks failed: ${summary.checks_failed}`,
  `- Decision: ${summary.decision}`,
  `- Recommended next step: ${summary.recommended_next_step}`,
  `- Registry submission executed: ${review.execution_counters.mcp_registry_submission_executed}`,
  `- Hosted MCP launch executed: ${review.execution_counters.hosted_mcp_launch_executed}`,
  `- Payment executed: ${review.execution_counters.payment_executed}`,
  `- Credits consumed: ${review.execution_counters.credits_consumed}`,
  `- Personal data used: ${review.execution_counters.personal_data_used}`,
  "",
  "## Failed Checks",
  "",
  ...(failed.length ? failed.map((check) => `- ${check.name}: ${check.details}`) : ["None."]),
  "",
  "## Checks",
  "",
  ...checks.map((check) => `- ${check.ok ? "PASS" : "FAIL"} - ${check.name}: ${check.details}`),
  ""
].join("\n");

await writeFile(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
await writeFile(reportPath, `${report}\n`, "utf8");

if (failed.length > 0) {
  console.error(JSON.stringify({ ok: false, checks_failed: failed.length, failed_checks: failed }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({
  ok: true,
  checks_total: summary.checks_total,
  checks_failed: summary.checks_failed,
  summary: summaryPath,
  report: reportPath
}, null, 2));
