import { readFile, writeFile } from "node:fs/promises";

const draftPath = "private-evaluator-pack/mcp_tool_registry_private_draft_pack_v2_20260612.json";
const manifestPath = "mcp-tool-manifest.json";
const productSelectorPath = "private-evaluator-pack/product_selector_contract.json";
const githubMetadataAppliedPath = "private-evaluator-pack/github_public_metadata_applied_summary_20260612.json";
const summaryPath = "private-evaluator-pack/mcp_tool_registry_private_draft_v2_probe_summary_20260612.json";
const reportPath = "private-evaluator-pack/mcp_tool_registry_private_draft_v2_probe_report_20260612.md";

const checks = [];
function addCheck(name, ok, details = "") {
  checks.push({ name, ok: Boolean(ok), details });
}

function valueAt(obj, path) {
  return path.split(".").reduce((acc, key) => (acc == null ? acc : acc[key]), obj);
}

function arrayIncludesAll(arr, required) {
  return Array.isArray(arr) && required.every((item) => arr.includes(item));
}

const draft = JSON.parse(await readFile(draftPath, "utf8"));
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const productSelector = JSON.parse(await readFile(productSelectorPath, "utf8"));
const githubMetadata = JSON.parse(await readFile(githubMetadataAppliedPath, "utf8"));

const manifestToolNames = (manifest.tools || []).map((tool) => tool.name);
const publicReadOnly = draft.tools_to_expose_in_private_registry_draft?.public_read_only_no_auth || [];
const sandboxWriteBlocked = draft.tools_to_expose_in_private_registry_draft?.sandbox_write_tools_blocked_in_this_draft_review || [];
const protectedRead = draft.tools_to_expose_in_private_registry_draft?.protected_customer_read_tools_require_sandbox_or_customer_key || [];
const adminBlocked = draft.tools_to_expose_in_private_registry_draft?.admin_tools_not_for_registry_public_use || [];

addCheck("draft_status_private_not_published", draft.status === "private_draft_ready_not_submitted_not_published", draft.status);
addCheck("business_rule_machine_not_human", draft.business_rule === "sell_to_machines_not_humans", draft.business_rule);
addCheck("primary_customer_interface_machine", draft.primary_customer_interface === "machine", draft.primary_customer_interface);

addCheck(
  "github_metadata_description_matches_applied",
  draft.public_positioning_already_applied?.description === githubMetadata.observed_metadata?.description,
  draft.public_positioning_already_applied?.description || "missing"
);
addCheck(
  "github_metadata_homepage_matches_applied",
  draft.public_positioning_already_applied?.homepage === githubMetadata.observed_metadata?.homepage,
  draft.public_positioning_already_applied?.homepage || "missing"
);
addCheck(
  "github_metadata_topics_include_mcp_and_sandbox",
  arrayIncludesAll(draft.public_positioning_already_applied?.topics, ["mcp", "machine-first", "machine-readable", "sandbox-beta"]),
  (draft.public_positioning_already_applied?.topics || []).join(",")
);

addCheck(
  "official_context_has_stable_spec_basis",
  draft.official_mcp_context_checked?.stable_spec_basis === "2025-11-25",
  draft.official_mcp_context_checked?.stable_spec_basis
);
addCheck(
  "official_context_monitors_2026_release_candidate",
  (draft.official_mcp_context_checked?.draft_or_future_items_to_monitor || []).some((item) => item.includes("2026-07-28")),
  "2026-07-28 release candidate monitored"
);
addCheck(
  "official_context_sources_present",
  arrayIncludesAll(draft.official_mcp_context_checked?.sources, [
    "https://modelcontextprotocol.io/specification/2025-11-25",
    "https://modelcontextprotocol.io/specification/draft/server/tools",
    "https://modelcontextprotocol.io/docs/tutorials/security/authorization"
  ]),
  (draft.official_mcp_context_checked?.sources || []).join(",")
);

addCheck("listing_name_present", draft.registry_listing?.name === "MachineSignal Lead Opportunity Score", draft.registry_listing?.name);
addCheck("listing_visibility_private", draft.registry_listing?.visibility === "private_draft_or_unsubmitted", draft.registry_listing?.visibility);
addCheck("listing_long_description_sandbox_bounded", /sandbox\/private-draft only/i.test(draft.registry_listing?.long_description || ""), draft.registry_listing?.long_description || "");
addCheck("listing_long_description_blocks_outreach", /no external contact/i.test(draft.registry_listing?.long_description || "") && /no human outreach/i.test(draft.registry_listing?.long_description || ""), "outreach blockers present");
addCheck("listing_keywords_machine_safe", arrayIncludesAll(draft.registry_listing?.keywords, ["machine-first", "mcp", "openapi", "sandbox-beta"]), (draft.registry_listing?.keywords || []).join(","));

addCheck("transport_current_local_stdio", draft.transport_strategy?.current_transport === "local_stdio_adapter", draft.transport_strategy?.current_transport);
addCheck("transport_hosted_mcp_not_live", draft.transport_strategy?.hosted_public_mcp_server_live === false && draft.transport_strategy?.hosted_mcp_endpoint_published === false, "hosted MCP blocked");
addCheck("transport_remote_requirements_before_launch", (draft.transport_strategy?.remote_mcp_requirements_before_launch || []).length >= 6, `requirements=${(draft.transport_strategy?.remote_mcp_requirements_before_launch || []).length}`);
addCheck("transport_requires_authorization", (draft.transport_strategy?.remote_mcp_requirements_before_launch || []).some((item) => item.includes("authorization")), "authorization requirement present");

for (const toolName of publicReadOnly) {
  const tool = (manifest.tools || []).find((item) => item.name === toolName);
  addCheck(`public_read_tool_exists_${toolName}`, Boolean(tool), toolName);
  if (tool) {
    addCheck(`public_read_tool_get_or_readonly_${toolName}`, tool.method === "GET" && tool.auth === "none", `method=${tool.method}; auth=${tool.auth}`);
  }
}
for (const toolName of sandboxWriteBlocked) {
  const tool = (manifest.tools || []).find((item) => item.name === toolName);
  addCheck(`blocked_write_tool_exists_${toolName}`, Boolean(tool), toolName);
  if (tool) {
    addCheck(`blocked_write_tool_is_post_${toolName}`, tool.method === "POST", `method=${tool.method}`);
  }
}
for (const toolName of protectedRead) {
  addCheck(`protected_read_tool_exists_${toolName}`, manifestToolNames.includes(toolName), toolName);
}
for (const toolName of adminBlocked) {
  addCheck(`admin_blocked_tool_exists_${toolName}`, manifestToolNames.includes(toolName), toolName);
}

addCheck("product_map_has_five_routes", (draft.product_to_tool_map || []).length === 5, `routes=${(draft.product_to_tool_map || []).length}`);
for (const requiredProduct of [
  "target_discovery_pack_250",
  "score_pack_1k",
  "domain_enrichment_pack_100",
  "deep_analysis_pack_100",
  "action_pack_25"
]) {
  addCheck(
    `product_map_includes_${requiredProduct}`,
    (draft.product_to_tool_map || []).some((item) => item.product === requiredProduct),
    requiredProduct
  );
  addCheck(
    `product_selector_contains_${requiredProduct}`,
    Boolean(productSelector.products?.[requiredProduct]),
    requiredProduct
  );
}
addCheck(
  "target_discovery_requires_250_and_objective",
  (draft.product_to_tool_map || []).some((item) => item.product === "target_discovery_pack_250" && item.preconditions?.includes("requested_target_count exactly 250") && item.preconditions?.includes("commercial_objective present")),
  "target discovery preconditions"
);
addCheck(
  "deep_analysis_requires_score_confidence_gate",
  (draft.product_to_tool_map || []).some((item) => item.product === "deep_analysis_pack_100" && item.preconditions?.includes("score >= 75") && item.preconditions?.includes("confidence >= 0.75")),
  "deep analysis gate"
);
addCheck(
  "action_pack_requires_deep_gate",
  (draft.product_to_tool_map || []).some((item) => item.product === "action_pack_25" && item.preconditions?.includes("deep analysis gate confirmed")),
  "action pack deep gate"
);

for (const expectedNoGo of [
  "public registry submission",
  "hosted public MCP launch",
  "live monetization",
  "real payment",
  "invoices",
  "production API keys",
  "automatic outreach",
  "external target contact",
  "personal data",
  "real customer data",
  "real lead lists"
]) {
  addCheck(`go_no_go_blocks_${expectedNoGo.replaceAll(" ", "_")}`, draft.go_no_go?.no_go_now?.includes(expectedNoGo), expectedNoGo);
}

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
  addCheck(`counter_${counter}_zero`, draft.execution_counters?.[counter] === expected, `${counter}=${draft.execution_counters?.[counter]}`);
}

addCheck(
  "machine_decision_private_review_only",
  draft.machine_decision?.decision === "ready_for_private_mcp_tool_registry_review_only",
  draft.machine_decision?.decision
);
addCheck(
  "machine_decision_blocks_submit_and_launch",
  arrayIncludesAll(draft.machine_decision?.do_not_execute, ["registry submit", "hosted MCP launch", "live payment", "production key sharing", "outreach", "real data processing"]),
  (draft.machine_decision?.do_not_execute || []).join(",")
);

const failed = checks.filter((check) => !check.ok);
const summary = {
  artifact: "mcp_tool_registry_private_draft_v2_probe",
  version: "2026-06-12",
  status: failed.length === 0 ? "completed_mcp_tool_registry_private_draft_v2_probe" : "failed_mcp_tool_registry_private_draft_v2_probe",
  ok: failed.length === 0,
  mode: "NoPublishNoWriteNoHostedMcpNoPaymentNoOutreachNoRealData",
  draft: draftPath,
  checks_total: checks.length,
  checks_failed: failed.length,
  public_read_only_tools_checked: publicReadOnly.length,
  sandbox_write_tools_blocked_checked: sandboxWriteBlocked.length,
  protected_read_tools_checked: protectedRead.length,
  admin_tools_blocked_checked: adminBlocked.length,
  execution_counters: draft.execution_counters,
  interpretation: failed.length === 0
    ? "The v2 MCP/tool-registry private draft is registry-ready for owner review while remaining unpublished, local-adapter-first, sandbox-bounded and machine-first."
    : "The v2 MCP/tool-registry private draft has failed checks and should not be used for review until corrected.",
  recommended_next_step: failed.length === 0
    ? "Keep this as the current private registry-ready MCP draft. Next, run an agent go/no-go review before any external registry submission or hosted MCP build decision."
    : "Fix failed checks and rerun the v2 probe.",
  checks,
  failed_checks: failed
};

const report = [
  "# MCP Tool Registry Private Draft v2 Probe",
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
  `- Public read-only tools checked: ${summary.public_read_only_tools_checked}`,
  `- Sandbox write tools blocked checked: ${summary.sandbox_write_tools_blocked_checked}`,
  `- Protected read tools checked: ${summary.protected_read_tools_checked}`,
  `- Admin tools blocked checked: ${summary.admin_tools_blocked_checked}`,
  `- MCP registry submission executed: ${draft.execution_counters.mcp_registry_submission_executed}`,
  `- Hosted MCP launch executed: ${draft.execution_counters.hosted_mcp_launch_executed}`,
  `- External marketplace publication executed: ${draft.execution_counters.external_marketplace_publication_executed}`,
  `- External send executed: ${draft.execution_counters.external_send_executed}`,
  `- MachineSignal API POST calls executed: ${draft.execution_counters.machinesignal_api_post_calls_executed}`,
  `- Payment executed: ${draft.execution_counters.payment_executed}`,
  `- Credits consumed: ${draft.execution_counters.credits_consumed}`,
  `- Personal data used: ${draft.execution_counters.personal_data_used}`,
  "",
  "## Interpretation",
  "",
  summary.interpretation,
  "",
  "## Recommended Next Step",
  "",
  summary.recommended_next_step,
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
  public_read_only_tools_checked: summary.public_read_only_tools_checked,
  sandbox_write_tools_blocked_checked: summary.sandbox_write_tools_blocked_checked,
  summary: summaryPath,
  report: reportPath
}, null, 2));
