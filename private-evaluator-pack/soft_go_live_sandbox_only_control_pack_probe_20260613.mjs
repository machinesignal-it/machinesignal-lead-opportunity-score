import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const packDir = path.join(root, "private-evaluator-pack");
const controlPackPath = path.join(packDir, "soft_go_live_sandbox_only_control_pack_20260613.json");
const controlPackMdPath = path.join(packDir, "soft_go_live_sandbox_only_control_pack_20260613.md");
const summaryPath = path.join(packDir, "soft_go_live_sandbox_only_control_pack_probe_summary_20260613.json");
const reportPath = path.join(packDir, "soft_go_live_sandbox_only_control_pack_probe_report_20260613.md");

const pack = JSON.parse(await readFile(controlPackPath, "utf8"));
const markdown = await readFile(controlPackMdPath, "utf8");
const checks = [];

function addCheck(name, ok, details = "") {
  checks.push({ name, ok: Boolean(ok), details });
}

function includesAll(list, required) {
  return required.every((item) => list.includes(item));
}

function hasPath(pathId) {
  return (pack.machine_test_paths || []).some((item) => item.path_id === pathId);
}

const allowed = pack.scope?.allowed || [];
const blocked = pack.scope?.blocked || [];
const ownerApproval = pack.owner_approval_required_before || [];
const rollback = pack.rollback_rules || [];
const paths = pack.machine_test_paths || [];
const responsibilities = pack.agent_responsibilities || [];

addCheck("pack_status_prepared", pack.status === "prepared", pack.status);
addCheck("primary_customer_machine", pack.primary_customer_interface === "machine");
addCheck(
  "source_verdict_is_soft_go_live_sandbox_only",
  pack.source_decision?.verdict === "go_conditionally_for_soft_go_live_sandbox_only",
  pack.source_decision?.verdict || ""
);
addCheck("scope_allowed_present", allowed.length >= 10, `${allowed.length} allowed items`);
addCheck("scope_blocked_present", blocked.length >= 15, `${blocked.length} blocked items`);

for (const requiredAllowed of [
  "machine reads public website",
  "machine reads openapi.json",
  "machine reads mcp-tool-manifest.json",
  "machine creates bounded sandbox customer",
  "machine creates beta purchase-intent records",
  "machine retrieves usage and orders",
]) {
  addCheck(`allowed_${requiredAllowed.replaceAll(" ", "_")}`, allowed.includes(requiredAllowed), requiredAllowed);
}

for (const requiredBlocked of [
  "real payment",
  "paid checkout",
  "payment method collection",
  "invoice issuance",
  "public paid marketplace launch",
  "public MCP registry submission",
  "hosted public MCP launch",
  "production API key distribution",
  "human outreach",
  "automatic external contact",
  "contacting target companies",
  "real customer data",
  "personal data",
  "real lead lists",
  "unbounded write tests",
]) {
  addCheck(`blocked_${requiredBlocked.replaceAll(" ", "_")}`, blocked.includes(requiredBlocked), requiredBlocked);
}

for (const pathId of [
  "existing_list_score_path",
  "no_list_target_discovery_path",
  "action_after_deep_analysis_path",
  "mcp_manifest_read_path",
]) {
  addCheck(`has_${pathId}`, hasPath(pathId), pathId);
}

const noList = paths.find((item) => item.path_id === "no_list_target_discovery_path") || {};
addCheck(
  "no_list_requires_market_area_objective",
  includesAll(noList.required_inputs || [], ["market", "area", "commercial_objective"]),
  JSON.stringify(noList.required_inputs || [])
);

const actionPath = paths.find((item) => item.path_id === "action_after_deep_analysis_path") || {};
addCheck(
  "action_pack_requires_deep_analysis_gate",
  /Action Pack is allowed only after Deep Analysis confirms/.test(actionPath.required_gate || ""),
  actionPath.required_gate || ""
);

const mcpPath = paths.find((item) => item.path_id === "mcp_manifest_read_path") || {};
addCheck(
  "mcp_path_states_hosted_public_mcp_not_live",
  /hosted public MCP is not live/i.test(mcpPath.success_condition || ""),
  mcpPath.success_condition || ""
);

addCheck("write_budget_default_nowrite", pack.write_budget?.default_mode === "NoWrite");
addCheck("write_budget_capped_enabled", pack.write_budget?.write_capped_mode_allowed === true);
addCheck("write_budget_max_posts_5", pack.write_budget?.max_post_calls_per_controlled_rehearsal === 5);
addCheck("write_budget_idempotency_required", pack.write_budget?.idempotency_required === true);
addCheck(
  "write_budget_cloudflare_kv_stop_rule",
  /Cloudflare KV/.test(pack.write_budget?.daily_kv_write_budget_rule || ""),
  pack.write_budget?.daily_kv_write_budget_rule || ""
);

for (const [metric, expected] of Object.entries({
  machine_readability_checks_failed: 0,
  public_contract_checks_failed: 0,
  e2e_rehearsal_checks_failed: 0,
  agent_go_no_go_probe_checks_failed: 0,
  forbidden_actions_count: 0,
  real_payment_count: 0,
  invoice_count: 0,
  external_contact_count: 0,
  personal_data_records_used: 0,
  real_customer_records_used: 0,
})) {
  addCheck(`success_metric_${metric}`, pack.success_metrics?.[metric] === expected, String(pack.success_metrics?.[metric]));
}

for (const rollbackNeedle of [
  "HTTP 4xx/5xx",
  "OpenAPI and MCP manifests diverge",
  "payment, invoice or external contact flags become true",
  "production key",
  "real customer data or personal data",
  "Cloudflare KV write limits",
]) {
  addCheck(
    `rollback_mentions_${rollbackNeedle.replaceAll(" ", "_")}`,
    rollback.some((rule) => rule.includes(rollbackNeedle)),
    rollbackNeedle
  );
}

for (const approvalItem of [
  "enabling real payment",
  "collecting payment methods",
  "issuing invoices",
  "using partita iva or fiscal identity for sale",
  "publishing paid plans",
  "submitting to public MCP registry",
  "launching hosted MCP",
  "issuing production API keys",
  "processing real customer data",
  "processing personal data",
  "contacting humans or companies",
]) {
  addCheck(
    `owner_approval_before_${approvalItem.replaceAll(" ", "_")}`,
    ownerApproval.includes(approvalItem),
    approvalItem
  );
}

for (const agent of [
  "Orchestratore",
  "Agente API",
  "Machine-to-Machine Sales Ops",
  "Customer Success & Post-Sale",
  "Admin & Finance Controller",
  "Legal & Compliance",
  "Continuous Improvement / Competitive Learning",
  "HR / Agent Manager",
]) {
  addCheck(
    `responsibility_${agent.replaceAll(" ", "_")}`,
    responsibilities.some((item) => item.agent === agent && item.responsibility),
    agent
  );
}

addCheck(
  "markdown_states_not_paid_launch",
  /This is not a paid launch\./.test(markdown),
  "not paid launch"
);
addCheck(
  "markdown_has_next_step_probe",
  /Run the Soft Go-Live Control Pack Probe/.test(markdown),
  "next step"
);

const forbiddenPositivePatterns = [
  /(^|[^-A-Z])GO\s+for\s+paid/i,
  /(^|[^-A-Z])GO\s+for\s+payment/i,
  /(^|[^-A-Z])GO\s+for\s+invoice/i,
  /(^|[^-A-Z])GO\s+for\s+human\s+outreach/i,
  /(^|[^-A-Z])GO\s+for\s+hosted\s+public\s+MCP/i,
  /(^|[^-A-Z])GO\s+for\s+real\s+customer\s+data/i,
  /(^|[^-A-Z])GO\s+for\s+personal\s+data/i,
];
addCheck(
  "pack_has_no_forbidden_positive_go",
  forbiddenPositivePatterns.every((pattern) => !pattern.test(markdown)),
  "no forbidden positive go phrase"
);

const failedChecks = checks.filter((check) => !check.ok);
const summary = {
  date: "2026-06-13",
  status: failedChecks.length === 0 ? "passed" : "failed",
  purpose:
    "Validate the Soft Go-Live Sandbox-Only Control Pack before any bounded rehearsal.",
  control_pack: "private-evaluator-pack/soft_go_live_sandbox_only_control_pack_20260613.json",
  checks_total: checks.length,
  checks_failed: failedChecks.length,
  checks,
  safety: {
    paid_launch_allowed: false,
    live_payment_allowed: false,
    invoice_allowed: false,
    hosted_public_mcp_allowed: false,
    mcp_registry_submission_allowed: false,
    human_outreach_allowed: false,
    external_contact_allowed: false,
    real_customer_data_allowed: false,
    personal_data_allowed: false,
    max_post_calls_per_controlled_rehearsal: pack.write_budget?.max_post_calls_per_controlled_rehearsal,
  },
  next_action_if_passed: "run_one_bounded_soft_go_live_rehearsal_against_public_assets",
  next_action_if_failed: "repair_control_pack_before_rehearsal",
};

await writeFile(summaryPath, `${JSON.stringify(summary, null, 2)}\n`);

const report = [
  "# Soft Go-Live Sandbox-Only Control Pack Probe",
  "",
  "Date: 2026-06-13",
  "",
  `Status: ${summary.status}`,
  "",
  "This probe validates the control pack before any bounded soft go-live rehearsal.",
  "",
  "## Result",
  "",
  `- checks total: ${summary.checks_total}`,
  `- checks failed: ${summary.checks_failed}`,
  `- max POST calls per controlled rehearsal: ${summary.safety.max_post_calls_per_controlled_rehearsal}`,
  "- paid launch allowed: false",
  "- live payment allowed: false",
  "- invoice allowed: false",
  "- hosted public MCP allowed: false",
  "- human outreach allowed: false",
  "- real customer data allowed: false",
  "- personal data allowed: false",
  "",
  "## Interpretation",
  "",
  failedChecks.length === 0
    ? "The control pack is complete enough to run one bounded soft go-live sandbox-only rehearsal."
    : "The control pack must be repaired before any bounded soft go-live rehearsal.",
  "",
  "## Next",
  "",
  `Allowed: ${summary.next_action_if_passed}`,
  "",
  `Blocked if failed: ${summary.next_action_if_failed}`,
  "",
  "## Failed Checks",
  "",
  ...(failedChecks.length === 0
    ? ["None."]
    : failedChecks.map((check) => `- ${check.name}: ${check.details}`)),
  "",
].join("\n");

await writeFile(reportPath, report);

console.log(JSON.stringify(summary, null, 2));
