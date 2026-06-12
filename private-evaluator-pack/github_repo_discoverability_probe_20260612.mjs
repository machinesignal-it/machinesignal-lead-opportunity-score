import { writeFile } from "node:fs/promises";

const repoRawBase =
  "https://raw.githubusercontent.com/machinesignal-it/machinesignal-lead-opportunity-score/main";

const artifactDate = "2026-06-12";
const outSummary =
  "private-evaluator-pack/github_repo_discoverability_probe_summary_20260612.json";
const outReport =
  "private-evaluator-pack/github_repo_discoverability_probe_report_20260612.md";

const paths = {
  readme: "README.md",
  machineEntrypointMd: "MACHINE_AGENT_ENTRYPOINT.md",
  machineEntrypointJson: "MACHINE_AGENT_ENTRYPOINT.json",
  productSelector: "private-evaluator-pack/product_selector_contract.json",
  mcpChannelEntrypoint:
    "private-evaluator-pack/mcp_channel_entrypoint_draft_nopublish.json",
  channelSelectionMatrix:
    "private-evaluator-pack/channel_selection_matrix_20260612.json",
  mcpToolManifest: "mcp-tool-manifest.json",
  mcpToolContract: "MCP_TOOL_CONTRACT.md",
  mcpAdapterReadme: "mcp_adapter/README.md",
};

const checks = [];
const fetched = {};
const parsed = {};
const safetyCounters = {
  external_publication_executed: 0,
  external_send_executed: 0,
  post_calls_executed: 0,
  write_calls_executed: 0,
  payment_executed: 0,
  credits_consumed: 0,
  personal_data_used: 0,
};

function addCheck(name, ok, details = "") {
  checks.push({ name, ok: Boolean(ok), details });
}

function valueAt(obj, path) {
  return path.split(".").reduce((acc, key) => (acc == null ? acc : acc[key]), obj);
}

function includesText(text, needle) {
  return typeof text === "string" && text.includes(needle);
}

function listIncludesPath(list, path) {
  return Array.isArray(list) && list.some((item) => item?.path === path);
}

function toolByName(name) {
  return (parsed.mcpToolManifest.tools || []).find((tool) => tool.name === name);
}

async function fetchRaw(path) {
  const url = `${repoRawBase}/${path}`;
  const response = await fetch(url, {
    headers: {
      "User-Agent": "MachineSignal-GitHub-Repo-Discoverability-Probe/2026-06-12",
    },
  });
  const text = await response.text();
  fetched[path] = { url, status: response.status, length: text.length, text };
  addCheck(`github_raw_reachable_${path.replaceAll("/", "_")}`, response.ok, `HTTP ${response.status}, bytes=${text.length}`);
  return text;
}

function parseJson(key, path) {
  try {
    parsed[key] = JSON.parse(fetched[path].text);
    addCheck(`json_valid_${path.replaceAll("/", "_")}`, true, "valid JSON");
  } catch (error) {
    parsed[key] = {};
    addCheck(`json_valid_${path.replaceAll("/", "_")}`, false, error.message);
  }
}

for (const path of Object.values(paths)) {
  await fetchRaw(path);
}

parseJson("machineEntrypoint", paths.machineEntrypointJson);
parseJson("productSelector", paths.productSelector);
parseJson("mcpChannelEntrypoint", paths.mcpChannelEntrypoint);
parseJson("channelSelectionMatrix", paths.channelSelectionMatrix);
parseJson("mcpToolManifest", paths.mcpToolManifest);

const readme = fetched[paths.readme].text;
const machineEntrypointMd = fetched[paths.machineEntrypointMd].text;
const mcpToolContract = fetched[paths.mcpToolContract].text;
const mcpAdapterReadme = fetched[paths.mcpAdapterReadme].text;
const machineEntrypoint = parsed.machineEntrypoint;
const productSelector = parsed.productSelector;
const mcpChannelEntrypoint = parsed.mcpChannelEntrypoint;
const channelSelectionMatrix = parsed.channelSelectionMatrix;
const mcpToolManifest = parsed.mcpToolManifest;

addCheck(
  "readme_has_machine_reader_quick_start",
  includesText(readme, "## Machine Reader Quick Start"),
  "README exposes a machine-first section"
);
for (const requiredLink of [
  "MACHINE_AGENT_ENTRYPOINT.md",
  "MACHINE_AGENT_ENTRYPOINT.json",
  "private-evaluator-pack/product_selector_contract.json",
  "private-evaluator-pack/mcp_channel_entrypoint_draft_nopublish.json",
]) {
  addCheck(
    `readme_links_${requiredLink.replaceAll("/", "_")}`,
    includesText(readme, requiredLink),
    requiredLink
  );
}

addCheck(
  "entrypoint_json_status_is_non_live_offer",
  machineEntrypoint.status === "public_github_documentation_draft_not_live_offer",
  `status=${machineEntrypoint.status}`
);
addCheck(
  "entrypoint_json_business_rule_machine_not_human",
  machineEntrypoint.business_rule === "sell_to_machines_not_humans",
  `business_rule=${machineEntrypoint.business_rule}`
);

for (const [key, expected] of Object.entries({
  external_send_allowed: false,
  human_outreach_allowed: false,
  marketplace_publication_allowed: false,
  mcp_registry_submission_allowed: false,
  hosted_public_mcp_live: false,
  live_payment_allowed: false,
  invoice_allowed: false,
  subscription_allowed: false,
  production_key_distribution_allowed: false,
  personal_data_allowed: false,
  real_customer_data_allowed: false,
  real_lead_list_allowed: false,
})) {
  addCheck(
    `entrypoint_safety_${key}`,
    machineEntrypoint.current_safety_state?.[key] === expected,
    `${key}=${machineEntrypoint.current_safety_state?.[key]}`
  );
}

for (const requiredPath of [
  "product-catalog.json",
  "machine-onboarding.json",
  "openapi.json",
  "mcp-tool-manifest.json",
  "MCP_TOOL_CONTRACT.md",
  "mcp_adapter/README.md",
  "private-evaluator-pack/product_selector_contract.json",
  "private-evaluator-pack/mcp_channel_entrypoint_draft_nopublish.json",
]) {
  addCheck(
    `entrypoint_read_order_includes_${requiredPath.replaceAll("/", "_")}`,
    listIncludesPath(machineEntrypoint.read_order, requiredPath),
    requiredPath
  );
}

for (const [route, expected] of Object.entries({
  no_starting_list: "target_discovery_pack_250",
  existing_domain_or_company_list: "score_pack_1k",
  company_names_without_reliable_domains: "domain_enrichment_pack_100",
  score_gte_75_and_confidence_gte_0_75: "deep_analysis_pack_100",
  deep_analysis_gate_confirmed: "action_pack_25",
})) {
  addCheck(
    `entrypoint_product_route_${route}`,
    machineEntrypoint.product_routing?.[route] === expected,
    `${route}=>${machineEntrypoint.product_routing?.[route]}`
  );
}

addCheck(
  "product_selector_status_is_simulated_not_live",
  productSelector.status === "machine_readable_simulated_pricing_not_live_offer",
  `status=${productSelector.status}`
);
for (const [key, expected] of Object.entries({
  prices_are_simulated: true,
  live_checkout_enabled: false,
  real_payment_allowed: false,
  invoice_allowed: false,
  credit_consumption_allowed: false,
  post_execution_allowed_in_this_pack: false,
  write_execution_allowed_in_this_pack: false,
  personal_data_allowed: false,
  real_lead_data_allowed: false,
})) {
  addCheck(
    `product_selector_global_rule_${key}`,
    productSelector.global_rules?.[key] === expected,
    `${key}=${productSelector.global_rules?.[key]}`
  );
}

for (const [productCode, expectedPrice] of Object.entries({
  target_discovery_pack_250: 149,
  score_pack_1k: 99,
  domain_enrichment_pack_100: 149,
  deep_analysis_pack_100: 299,
  action_pack_25: 399,
})) {
  const product = productSelector.products?.[productCode];
  addCheck(
    `product_selector_has_${productCode}`,
    Boolean(product),
    productCode
  );
  addCheck(
    `product_selector_price_${productCode}`,
    product?.simulated_price_eur === expectedPrice,
    `price=${product?.simulated_price_eur}`
  );
  addCheck(
    `product_selector_output_clear_${productCode}`,
    typeof product?.expected_output === "string" && product.expected_output.length > 40,
    product?.expected_output || "missing expected_output"
  );
}

addCheck(
  "target_discovery_requires_objective_and_250",
  valueAt(productSelector, "products.target_discovery_pack_250.valid_input_constraints.requested_target_count") === 250 &&
    valueAt(productSelector, "products.target_discovery_pack_250.valid_input_constraints.commercial_objective_required") === true,
  "Target Discovery requires objective and exactly 250 requested targets"
);
addCheck(
  "score_pack_tracks_valid_credit_rule",
  valueAt(productSelector, "products.score_pack_1k.valid_input_constraints.valid_scores_included") === 1000 &&
    valueAt(productSelector, "products.score_pack_1k.valid_input_constraints.duplicates_do_not_consume_valid_score_credits") === true &&
    valueAt(productSelector, "products.score_pack_1k.valid_input_constraints.invalid_records_do_not_consume_valid_score_credits") === true,
  "Score Pack includes 1000 valid scores; invalid or duplicate records do not consume valid score credits"
);
addCheck(
  "deep_analysis_thresholds_clear",
  valueAt(productSelector, "products.deep_analysis_pack_100.thresholds.buy_deep_analysis_if_score_gte") === 75 &&
    valueAt(productSelector, "products.deep_analysis_pack_100.thresholds.buy_deep_analysis_if_confidence_gte") === 0.75,
  "Deep Analysis threshold score>=75 and confidence>=0.75"
);
addCheck(
  "action_pack_deep_gate_clear",
  valueAt(productSelector, "products.action_pack_25.thresholds.buy_action_pack_only_if_deep_gate") === "confirmed",
  "Action Pack only after confirmed Deep Analysis gate"
);

addCheck(
  "mcp_channel_status_is_nopublish_nowrite",
  mcpChannelEntrypoint.status === "draft_nopublish_nosend_nowrite_simulation_only",
  `status=${mcpChannelEntrypoint.status}`
);
addCheck(
  "mcp_channel_business_rule_machine_not_human",
  mcpChannelEntrypoint.business_rule === "sell_to_machines_not_humans",
  `business_rule=${mcpChannelEntrypoint.business_rule}`
);
addCheck(
  "mcp_channel_hosted_not_live",
  valueAt(mcpChannelEntrypoint, "current_mcp_positioning.public_hosted_mcp_server_live") === false,
  "public hosted MCP is not live"
);
addCheck(
  "mcp_channel_local_adapter_available",
  valueAt(mcpChannelEntrypoint, "current_mcp_positioning.local_stdio_adapter_available") === true,
  "local stdio adapter available"
);
addCheck(
  "mcp_channel_registry_submission_blocked",
  valueAt(mcpChannelEntrypoint, "current_mcp_positioning.registry_submission_allowed_now") === false,
  "registry submission blocked"
);
for (const blockedAction of [
  "mcp_registry_submission",
  "hosted_mcp_launch",
  "public_marketplace_publication",
  "external_send",
  "human_outreach",
  "live_payment",
  "invoice",
  "subscription",
  "sandbox_customer_creation_in_this_probe",
  "score_call_execution_in_this_probe",
  "ledger_write",
  "credit_consumption",
  "personal_data_processing",
]) {
  addCheck(
    `mcp_channel_blocks_${blockedAction}`,
    mcpChannelEntrypoint.blocked_actions?.includes(blockedAction),
    blockedAction
  );
}

addCheck(
  "channel_matrix_primary_mcp_companion_github",
  channelSelectionMatrix.decision?.recommended_primary_next_channel === "mcp_tool_registry_draft" &&
    channelSelectionMatrix.decision?.recommended_companion_channel === "github_machine_docs",
  `primary=${channelSelectionMatrix.decision?.recommended_primary_next_channel}, companion=${channelSelectionMatrix.decision?.recommended_companion_channel}`
);
addCheck(
  "channel_matrix_external_publication_blocked",
  channelSelectionMatrix.safety_scope?.external_publication_allowed === false &&
    channelSelectionMatrix.safety_scope?.write_calls_allowed === false,
  "external publication and writes are blocked"
);

const readOnlyTools = (mcpToolManifest.tools || []).filter(
  (tool) => tool.method === "GET" && tool.auth === "none"
);
addCheck(
  "mcp_manifest_has_read_only_public_tools",
  readOnlyTools.length >= 10,
  `read_only_public_tools=${readOnlyTools.length}`
);
for (const toolName of [
  "create_sandbox_customer",
  "score_lead_opportunity",
  "create_purchase_intent",
  "create_payment_test_intent",
]) {
  const tool = toolByName(toolName);
  addCheck(
    `mcp_manifest_has_write_tool_${toolName}`,
    tool?.method === "POST",
    `${toolName} method=${tool?.method}`
  );
}
addCheck(
  "mcp_manifest_hosted_public_mcp_not_live",
  mcpToolManifest.mcp_compatibility?.public_mcp_server_live === false,
  `public_mcp_server_live=${mcpToolManifest.mcp_compatibility?.public_mcp_server_live}`
);
addCheck(
  "mcp_manifest_local_adapter_available",
  mcpToolManifest.mcp_compatibility?.local_adapter?.status === "available_in_github_repo",
  `local_adapter_status=${mcpToolManifest.mcp_compatibility?.local_adapter?.status}`
);

addCheck(
  "mcp_contract_states_hosted_not_live",
  includesText(mcpToolContract, "public hosted MCP server not live yet") &&
    includesText(mcpToolContract, "does not yet provide a public hosted MCP server"),
  "MCP contract clearly says hosted MCP is not live"
);
addCheck(
  "mcp_contract_states_no_payment_invoice_outreach",
  includesText(mcpToolContract, "does not execute real payment") &&
    includesText(mcpToolContract, "do not issue fiscal invoices") &&
    includesText(mcpToolContract, "does not contact external targets"),
  "MCP contract states payment, invoice and external target blockers"
);
addCheck(
  "mcp_adapter_readme_states_local_and_no_credit_validation",
  includesText(mcpAdapterReadme, "Local MCP stdio adapter") &&
    includesText(mcpAdapterReadme, "Hosted public MCP server: not live yet") &&
    includesText(mcpAdapterReadme, "does not consume credits"),
  "MCP adapter README is clear for a local machine client"
);
addCheck(
  "machine_entrypoint_md_plain_language",
  includesText(machineEntrypointMd, "MachineSignal is a machine-first API business") &&
    includesText(machineEntrypointMd, "## Fast Path"),
  "Markdown entrypoint is readable and machine-first"
);

for (const [counter, value] of Object.entries(safetyCounters)) {
  addCheck(`probe_counter_${counter}_zero`, value === 0, `${counter}=${value}`);
}

const checksFailed = checks.filter((check) => !check.ok);
const summary = {
  artifact: "github_repo_discoverability_probe",
  version: `${artifactDate}-github-first`,
  status: checksFailed.length === 0 ? "completed_github_first_discoverability_probe" : "failed_github_first_discoverability_probe",
  ok: checksFailed.length === 0,
  mode: "GitHubRawReadOnlyNoWriteNoPostNoPaymentNoPersonalData",
  primary_customer_interface: "machine",
  simulated_machine_starting_point: "GitHub repository raw README and machine entrypoint files",
  files_checked: Object.values(paths).length,
  github_raw_base: repoRawBase,
  checks_total: checks.length,
  checks_failed: checksFailed.length,
  safety_counters: safetyCounters,
  interpretation:
    checksFailed.length === 0
      ? "A machine can start from GitHub raw repository files, find the machine-first entrypoint, understand product routing, understand MCP/local-adapter status, identify read-only public tools versus blocked write tools, and preserve NoPublish/NoSend/NoPayment/NoPersonalData boundaries."
      : "One or more GitHub-first machine discoverability checks failed. Review failed_checks before changing public repository metadata or distribution channels.",
  recommended_next_step:
    checksFailed.length === 0
      ? "Prepare an owner-approved public-safe GitHub repository metadata proposal, or run an agent go/no-go review before changing public GitHub description, topics or external distribution."
      : "Fix failed discoverability checks, rerun this probe, then retest API and ledger.",
  checks,
  failed_checks: checksFailed,
};

const reportLines = [
  "# GitHub Repo Discoverability Probe",
  "",
  `Date: ${artifactDate}`,
  "",
  `Status: ${summary.status}`,
  `Mode: ${summary.mode}`,
  `Primary customer interface: ${summary.primary_customer_interface}`,
  "",
  "## What Was Tested",
  "",
  "This probe simulates a machine starting from the GitHub repository, using raw GitHub files as the first source of truth. It does not use the website as the primary entrypoint.",
  "",
  "Files fetched from GitHub raw:",
  ...Object.values(paths).map((path) => `- ${path}`),
  "",
  "## Result",
  "",
  `- Checks total: ${summary.checks_total}`,
  `- Checks failed: ${summary.checks_failed}`,
  `- External publication executed: ${safetyCounters.external_publication_executed}`,
  `- External send executed: ${safetyCounters.external_send_executed}`,
  `- POST calls executed: ${safetyCounters.post_calls_executed}`,
  `- Write calls executed: ${safetyCounters.write_calls_executed}`,
  `- Payment executed: ${safetyCounters.payment_executed}`,
  `- Credits consumed: ${safetyCounters.credits_consumed}`,
  `- Personal data used: ${safetyCounters.personal_data_used}`,
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
  ...(checksFailed.length
    ? checksFailed.map((check) => `- ${check.name}: ${check.details}`)
    : ["None."]),
  "",
  "## Checks",
  "",
  ...checks.map((check) => `- ${check.ok ? "PASS" : "FAIL"} - ${check.name}: ${check.details}`),
  "",
];

await writeFile(outSummary, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
await writeFile(outReport, `${reportLines.join("\n")}\n`, "utf8");

if (checksFailed.length > 0) {
  console.error(JSON.stringify({ ok: false, checks_failed: checksFailed.length, failed_checks: checksFailed }, null, 2));
  process.exit(1);
}

console.log(
  JSON.stringify(
    {
      ok: true,
      checks_total: summary.checks_total,
      checks_failed: summary.checks_failed,
      files_checked: summary.files_checked,
      report: outReport,
      summary: outSummary,
    },
    null,
    2
  )
);
