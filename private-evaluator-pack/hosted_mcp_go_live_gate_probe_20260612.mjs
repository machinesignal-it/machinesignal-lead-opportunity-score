import { readFile, writeFile } from "node:fs/promises";

const gatePath = "private-evaluator-pack/hosted_mcp_go_live_gate_20260612.json";
const agentReviewPath = "private-evaluator-pack/agent_go_no_go_mcp_v2_review_20260612.json";
const summaryPath = "private-evaluator-pack/hosted_mcp_go_live_gate_probe_summary_20260612.json";
const reportPath = "private-evaluator-pack/hosted_mcp_go_live_gate_probe_report_20260612.md";

const checks = [];
function addCheck(name, ok, details = "") {
  checks.push({ name, ok: Boolean(ok), details });
}

function includesAll(arr, required) {
  return Array.isArray(arr) && required.every((item) => arr.includes(item));
}

const gate = JSON.parse(await readFile(gatePath, "utf8"));
const agentReview = JSON.parse(await readFile(agentReviewPath, "utf8"));

addCheck("gate_status_defined_not_passed", gate.status === "gate_defined_not_passed", gate.status);
addCheck("primary_interface_machine", gate.primary_customer_interface === "machine", gate.primary_customer_interface);
addCheck("business_rule_machine_not_human", gate.business_rule === "sell_to_machines_not_humans", gate.business_rule);
addCheck("latest_agent_review_linked", gate.current_decision_context?.latest_agent_review === agentReviewPath, gate.current_decision_context?.latest_agent_review);
addCheck("agent_review_no_go_context", /NO-GO for hosted MCP/i.test(agentReview.consensus?.final_decision || ""), agentReview.consensus?.final_decision || "");

for (const [field, expected] of Object.entries({
  hosted_mcp_launch_allowed: false,
  registry_submission_allowed: false,
  live_billing_allowed: false,
  production_key_distribution_allowed: false,
  real_customer_data_allowed: false,
  personal_data_allowed: false
})) {
  addCheck(`global_pass_rule_${field}_false`, gate.global_pass_rule?.[field] === expected, `${field}=${gate.global_pass_rule?.[field]}`);
}

const sourceUrls = (gate.official_sources_checked || []).map((source) => source.url);
for (const requiredUrl of [
  "https://modelcontextprotocol.io/specification/2025-11-25",
  "https://modelcontextprotocol.io/docs/tutorials/security/authorization",
  "https://modelcontextprotocol.io/docs/tutorials/security/security_best_practices",
  "https://modelcontextprotocol.io/specification/2025-11-25/server/tools",
  "https://www.edpb.europa.eu/sme-data-protection-guide/process-personal-data-lawfully_en",
  "https://www.edpb.europa.eu/sme-data-protection-guide/respect-individuals-rights_en",
  "https://taxation-customs.ec.europa.eu/taxation/vat/vat-businesses/invoicing_en"
]) {
  addCheck(`official_source_present_${requiredUrl.replace(/[^a-z0-9]/gi, "_")}`, sourceUrls.includes(requiredUrl), requiredUrl);
}

const gateIds = (gate.gates || []).map((item) => item.gate_id);
for (const requiredGate of [
  "G0_owner_strategy_and_scope",
  "G1_mcp_protocol_and_conformance",
  "G2_authorization_scopes_and_revocation",
  "G3_tool_safety_and_user_consent",
  "G4_abuse_rate_limit_and_cost_controls",
  "G5_observability_audit_and_incident_response",
  "G6_data_protection_and_privacy",
  "G7_fiscal_legal_and_live_billing",
  "G8_product_api_schema_and_quality",
  "G9_registry_distribution_and_claims"
]) {
  addCheck(`required_gate_present_${requiredGate}`, gateIds.includes(requiredGate), requiredGate);
}

for (const item of gate.gates || []) {
  addCheck(`gate_${item.gate_id}_required`, item.required === true, `required=${item.required}`);
  addCheck(`gate_${item.gate_id}_not_passed`, item.status === "not_passed", `status=${item.status}`);
  addCheck(`gate_${item.gate_id}_has_evidence`, Array.isArray(item.required_evidence) && item.required_evidence.length >= 3, `evidence=${item.required_evidence?.length || 0}`);
  addCheck(`gate_${item.gate_id}_has_pass_criteria`, Array.isArray(item.pass_criteria) && item.pass_criteria.length >= 2, `pass_criteria=${item.pass_criteria?.length || 0}`);
}

addCheck(
  "auth_gate_has_revocation_and_scopes",
  includesAll((gate.gates || []).find((item) => item.gate_id === "G2_authorization_scopes_and_revocation")?.must_define, [
    "token scopes",
    "token revocation",
    "separate read/write/admin access"
  ]),
  "G2 authorization scope requirements"
);
addCheck(
  "privacy_gate_has_lawful_basis_and_dsar",
  includesAll((gate.gates || []).find((item) => item.gate_id === "G6_data_protection_and_privacy")?.must_define, [
    "lawful basis",
    "data subject rights workflow",
    "DPIA/LIA decision"
  ]),
  "G6 privacy requirements"
);
addCheck(
  "fiscal_gate_has_vat_invoice_payment",
  includesAll((gate.gates || []).find((item) => item.gate_id === "G7_fiscal_legal_and_live_billing")?.must_define, [
    "VAT treatment",
    "invoicing process",
    "payment provider"
  ]),
  "G7 fiscal requirements"
);
addCheck(
  "product_gate_has_schema_ledger_contract",
  includesAll((gate.gates || []).find((item) => item.gate_id === "G8_product_api_schema_and_quality")?.required_evidence, [
    "OpenAPI-to-tool schema diff",
    "contract tests",
    "credit ledger tests"
  ]),
  "G8 product quality evidence"
);

addCheck(
  "go_live_probe_requires_all_gates_passed",
  (gate.go_live_probe_requirements?.required_before_launch || []).includes("all gates status=passed"),
  "all gates must pass"
);
addCheck(
  "go_live_probe_fails_if_any_gate_not_passed",
  (gate.go_live_probe_requirements?.probe_must_fail_if || []).includes("any gate is not_passed"),
  "probe fails if any gate is not_passed"
);
addCheck(
  "recommended_next_step_architecture_no_build",
  gate.recommended_next_step?.action === "architecture_spike_no_build" &&
    gate.recommended_next_step?.hosted_launch === false &&
    gate.recommended_next_step?.external_publication === false,
  JSON.stringify(gate.recommended_next_step)
);

for (const [counter, expected] of Object.entries({
  hosted_mcp_launch_executed: 0,
  mcp_registry_submission_executed: 0,
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
  addCheck(`counter_${counter}_zero`, gate.execution_counters?.[counter] === expected, `${counter}=${gate.execution_counters?.[counter]}`);
}

const failed = checks.filter((check) => !check.ok);
const summary = {
  artifact: "hosted_mcp_go_live_gate_probe",
  version: "2026-06-12",
  status: failed.length === 0 ? "completed_hosted_mcp_go_live_gate_probe" : "failed_hosted_mcp_go_live_gate_probe",
  ok: failed.length === 0,
  mode: "NoBuildNoPublishNoHostedLaunchNoPaymentNoRealData",
  gate: gatePath,
  gates_total: (gate.gates || []).length,
  gates_passed_now: (gate.gates || []).filter((item) => item.status === "passed").length,
  checks_total: checks.length,
  checks_failed: failed.length,
  launch_allowed_now: gate.global_pass_rule?.hosted_mcp_launch_allowed,
  registry_submission_allowed_now: gate.global_pass_rule?.registry_submission_allowed,
  live_billing_allowed_now: gate.global_pass_rule?.live_billing_allowed,
  recommended_next_step: gate.recommended_next_step,
  execution_counters: gate.execution_counters,
  interpretation: failed.length === 0
    ? "The hosted MCP go-live gate is defined and correctly blocks launch, registry submission, live billing, production keys and real data until all required gates pass."
    : "The hosted MCP go-live gate has failed checks and should be corrected before use.",
  checks,
  failed_checks: failed
};

const report = [
  "# Hosted MCP Go-Live Gate Probe",
  "",
  "Date: 2026-06-12",
  "",
  `Status: ${summary.status}`,
  `Mode: ${summary.mode}`,
  "",
  "## Result",
  "",
  `- Gates total: ${summary.gates_total}`,
  `- Gates passed now: ${summary.gates_passed_now}`,
  `- Checks total: ${summary.checks_total}`,
  `- Checks failed: ${summary.checks_failed}`,
  `- Hosted MCP launch allowed now: ${summary.launch_allowed_now}`,
  `- Registry submission allowed now: ${summary.registry_submission_allowed_now}`,
  `- Live billing allowed now: ${summary.live_billing_allowed_now}`,
  `- Hosted MCP launch executed: ${gate.execution_counters.hosted_mcp_launch_executed}`,
  `- MCP registry submission executed: ${gate.execution_counters.mcp_registry_submission_executed}`,
  `- Payment executed: ${gate.execution_counters.payment_executed}`,
  `- Credits consumed: ${gate.execution_counters.credits_consumed}`,
  `- Personal data used: ${gate.execution_counters.personal_data_used}`,
  "",
  "## Interpretation",
  "",
  summary.interpretation,
  "",
  "## Recommended Next Step",
  "",
  `${gate.recommended_next_step.action}: ${gate.recommended_next_step.description}`,
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
  gates_total: summary.gates_total,
  gates_passed_now: summary.gates_passed_now,
  checks_total: summary.checks_total,
  checks_failed: summary.checks_failed,
  summary: summaryPath,
  report: reportPath
}, null, 2));
