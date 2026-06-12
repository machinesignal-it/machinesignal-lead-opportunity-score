import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const packDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(packDir, "..");
const readJson = (relativePath, base = packDir) =>
  JSON.parse(fs.readFileSync(path.resolve(base, relativePath), "utf8"));
const readText = (relativePath, base = packDir) =>
  fs.readFileSync(path.resolve(base, relativePath), "utf8");

const entrypoint = readJson("mcp_channel_entrypoint_draft_nopublish.json");
const matrix = readJson("channel_selection_matrix_20260612.json");
const productSelector = readJson("product_selector_contract.json");
const manifest = readJson("../mcp-tool-manifest.json");
const wrapper = readJson("../mcp/machinesignal-mcp-wrapper.json");
const clientConfig = readJson("../mcp_adapter/mcp_client_config.example.json");
const adapterReadme = readText("../mcp_adapter/README.md");
const registryDraft = readJson("../mcp_tool_registry_private_draft_pack_20260608.json");

const checks = [];
const failures = [];

function check(id, ok, detail) {
  checks.push({ id, ok, detail });
  if (!ok) failures.push({ id, detail });
}

const tools = Array.isArray(manifest.tools) ? manifest.tools : [];
const toolByName = new Map(tools.map((tool) => [tool.name, tool]));
const publicGetTools = tools.filter((tool) => tool.method === "GET" && tool.auth === "none");

check(
  "entrypoint_status",
  entrypoint.status === "draft_nopublish_nosend_nowrite_simulation_only",
  "MCP entrypoint must remain draft NoPublish NoSend NoWrite"
);

check(
  "matrix_recommends_mcp",
  matrix.decision?.recommended_primary_next_channel === "mcp_tool_registry_draft",
  "channel matrix must recommend MCP/tool registry draft"
);

check(
  "hosted_mcp_not_live",
  entrypoint.current_mcp_positioning.public_hosted_mcp_server_live === false &&
    wrapper.mcp_status?.hosted_public_mcp_server_live === false,
  "hosted public MCP must remain not live"
);

check(
  "local_stdio_adapter_available",
  entrypoint.current_mcp_positioning.local_stdio_adapter_available === true &&
    wrapper.mcp_status?.local_stdio_adapter_available === true &&
    adapterReadme.includes("local stdio MCP-style adapter"),
  "local stdio adapter must be available as current MCP path"
);

check(
  "registry_submission_blocked",
  entrypoint.current_mcp_positioning.registry_submission_allowed_now === false &&
    entrypoint.blocked_actions.includes("mcp_registry_submission"),
  "registry submission must be blocked"
);

check(
  "client_config_points_to_adapter",
  Boolean(clientConfig.mcpServers?.machinesignal?.args?.includes("mcp_adapter/machinesignal_mcp_server.py")),
  "MCP client config must point to the local adapter"
);

check(
  "read_only_public_tools_available",
  publicGetTools.length >= 10 &&
    entrypoint.tool_groups.read_only_public_tools_allowed_for_draft_review.every((name) =>
      toolByName.has(name)
    ),
  "read-only public tool group must map to manifest tools"
);

check(
  "write_tools_blocked_in_probe",
  entrypoint.tool_groups.sandbox_or_write_tools_blocked_in_this_nopublish_probe.every((name) =>
    toolByName.has(name)
  ) &&
    entrypoint.blocked_actions.includes("sandbox_customer_creation_in_this_probe") &&
    entrypoint.blocked_actions.includes("purchase_intent_execution_in_this_probe"),
  "write/sandbox tools must exist but be blocked in this probe"
);

check(
  "product_selector_maps_machine_products",
  productSelector.products?.target_discovery_pack_250 &&
    productSelector.products?.score_pack_1k &&
    productSelector.products?.deep_analysis_pack_100 &&
    productSelector.products?.action_pack_25,
  "product selector must still map the core machine products"
);

check(
  "registry_draft_is_private_unsubmitted",
  registryDraft.status === "ready_for_mcp_tool_registry_private_draft_only" &&
    JSON.stringify(registryDraft).includes("hosted_mcp_live"),
  "MCP registry pack must remain private/unsubmitted draft"
);

check(
  "official_sources_present",
  entrypoint.official_context.sources.includes("https://modelcontextprotocol.io/docs/getting-started/intro") &&
    entrypoint.official_context.sources.includes("https://modelcontextprotocol.io/specification/2025-06-18/server/tools") &&
    entrypoint.official_context.sources.includes("https://modelcontextprotocol.io/docs/tutorials/security/authorization"),
  "official MCP context links must be present"
);

check(
  "no_live_actions_allowed",
  entrypoint.success_criteria.post_calls_executed === 0 &&
    entrypoint.success_criteria.write_calls_executed === 0 &&
    entrypoint.success_criteria.external_publication_executed === false &&
    entrypoint.success_criteria.payment_executed === false &&
    entrypoint.success_criteria.credits_consumed === 0 &&
    entrypoint.success_criteria.personal_data_used === false,
  "success criteria must require no live actions"
);

const simulatedMachineDecision = {
  channel_understood: "MachineSignal should be prepared as an MCP/tool-registry draft through the local stdio adapter, not as a hosted public MCP server.",
  registry_submission_decision: "blocked_until_new_gate",
  hosted_mcp_decision: "not_live",
  current_adapter_path: entrypoint.current_mcp_positioning.adapter_path,
  read_only_tools_count: publicGetTools.length,
  blocked_write_tools: entrypoint.tool_groups.sandbox_or_write_tools_blocked_in_this_nopublish_probe,
  product_mapping_understood: [
    "target_discovery_pack_250",
    "score_pack_1k",
    "deep_analysis_pack_100",
    "action_pack_25"
  ],
  next_allowed_action: entrypoint.next_allowed_action_if_probe_passes
};

const summary = {
  artifact: "machinesignal_mcp_channel_entrypoint_probe",
  generated_at: new Date().toISOString(),
  ok: failures.length === 0,
  checks_total: checks.length,
  checks_failed: failures.length,
  failures,
  starting_input: "mcp_channel_entrypoint_draft_nopublish.json",
  machine_decision: simulatedMachineDecision,
  external_publication_executed: false,
  external_send_executed: false,
  post_calls_executed: 0,
  write_calls_executed: 0,
  payment_executed: false,
  invoice_issued: false,
  credits_consumed: 0,
  personal_data_used: false,
  real_customer_data_used: false,
  recommendation: failures.length === 0
    ? "mcp_channel_entrypoint_passed_prepare_github_machine_docs_patch_nopublish_next"
    : "fix_mcp_channel_entrypoint_before_next_step"
};

const report = [
  "# MachineSignal MCP Channel Entrypoint Probe",
  "",
  `Generated at: ${summary.generated_at}`,
  "",
  `Status: ${summary.ok ? "PASS" : "FAIL"}`,
  "",
  "## Starting Input",
  "",
  "`mcp_channel_entrypoint_draft_nopublish.json`",
  "",
  "## Simulated Machine Decision",
  "",
  `- Channel understood: ${simulatedMachineDecision.channel_understood}`,
  `- Registry submission: ${simulatedMachineDecision.registry_submission_decision}`,
  `- Hosted MCP: ${simulatedMachineDecision.hosted_mcp_decision}`,
  `- Current adapter path: ${simulatedMachineDecision.current_adapter_path}`,
  `- Read-only public tools found: ${simulatedMachineDecision.read_only_tools_count}`,
  `- Next allowed action: ${simulatedMachineDecision.next_allowed_action}`,
  "",
  "## Safety",
  "",
  `- external_publication_executed: ${summary.external_publication_executed}`,
  `- external_send_executed: ${summary.external_send_executed}`,
  `- post_calls_executed: ${summary.post_calls_executed}`,
  `- write_calls_executed: ${summary.write_calls_executed}`,
  `- payment_executed: ${summary.payment_executed}`,
  `- invoice_issued: ${summary.invoice_issued}`,
  `- credits_consumed: ${summary.credits_consumed}`,
  `- personal_data_used: ${summary.personal_data_used}`,
  "",
  "## Checks",
  "",
  `- checks_total: ${summary.checks_total}`,
  `- checks_failed: ${summary.checks_failed}`,
  "",
  "## Recommendation",
  "",
  summary.recommendation,
  "",
  "## Failures",
  "",
  ...(summary.failures.length
    ? summary.failures.map((failure) => `- ${failure.id}: ${failure.detail}`)
    : ["None"])
].join("\n");

fs.writeFileSync(
  path.join(packDir, "mcp_channel_entrypoint_probe_summary_20260612.json"),
  `${JSON.stringify(summary, null, 2)}\n`
);
fs.writeFileSync(
  path.join(packDir, "mcp_channel_entrypoint_probe_report_20260612.md"),
  `${report}\n`
);

console.log(JSON.stringify(summary, null, 2));

