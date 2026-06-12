import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const packDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(packDir, "..");
const readText = (relativePath) => fs.readFileSync(path.resolve(repoRoot, relativePath), "utf8");
const readJson = (relativePath) => JSON.parse(readText(relativePath));

const entrypoint = readJson("MACHINE_AGENT_ENTRYPOINT.json");
const entrypointMd = readText("MACHINE_AGENT_ENTRYPOINT.md");
const readme = readText("README.md");
const mcpProbe = readJson("private-evaluator-pack/mcp_channel_entrypoint_probe_summary_20260612.json");
const channelProbe = readJson("private-evaluator-pack/channel_selector_probe_summary_20260612.json");
const selector = readJson("private-evaluator-pack/product_selector_contract.json");

const checks = [];
const failures = [];

function check(id, ok, detail) {
  checks.push({ id, ok, detail });
  if (!ok) failures.push({ id, detail });
}

check(
  "entrypoint_json_status",
  entrypoint.status === "public_github_documentation_draft_not_live_offer",
  "machine agent JSON entrypoint must be draft and not live offer"
);

check(
  "readme_links_entrypoint",
  readme.includes("MACHINE_AGENT_ENTRYPOINT.md") &&
    readme.includes("MACHINE_AGENT_ENTRYPOINT.json"),
  "README must link both machine entrypoints"
);

check(
  "machine_first_rule_present",
  entrypoint.business_rule === "sell_to_machines_not_humans" &&
    entrypointMd.includes("machine-first API business"),
  "docs must preserve machine-first positioning"
);

check(
  "mcp_status_clear",
  entrypoint.mcp_status.local_stdio_adapter_available === true &&
    entrypoint.mcp_status.hosted_public_mcp_server_live === false &&
    entrypointMd.includes("hosted public MCP server: not live"),
  "docs must clearly state local adapter available and hosted MCP not live"
);

check(
  "product_routing_clear",
  entrypoint.product_routing.no_starting_list === "target_discovery_pack_250" &&
    entrypoint.product_routing.existing_domain_or_company_list === "score_pack_1k" &&
    selector.products.deep_analysis_pack_100.thresholds.buy_deep_analysis_if_score_gte === 75,
  "docs must expose core product routing and thresholds"
);

check(
  "channel_decision_clear",
  entrypoint.current_channel_decision.primary_next_channel === "mcp_tool_registry_draft" &&
    entrypoint.current_channel_decision.companion_channel === "github_machine_docs" &&
    channelProbe.ok === true,
  "docs must expose current channel decision"
);

check(
  "proofs_green",
  entrypoint.latest_local_proofs.mcp_channel_entrypoint_probe.checks_failed === 0 &&
    mcpProbe.ok === true &&
    mcpProbe.checks_failed === 0,
  "latest local proofs must be green"
);

check(
  "safety_blocks_visible",
  entrypoint.current_safety_state.external_send_allowed === false &&
    entrypoint.current_safety_state.live_payment_allowed === false &&
    entrypoint.current_safety_state.personal_data_allowed === false &&
    entrypointMd.includes("Blocked:"),
  "docs must show safety blocks"
);

check(
  "new_gate_required",
  entrypoint.requires_new_owner_gate_before.includes("hosted_mcp_launch") &&
    entrypoint.requires_new_owner_gate_before.includes("production_key_distribution") &&
    entrypoint.requires_new_owner_gate_before.includes("live_billing"),
  "docs must require new owner gate before external/live actions"
);

const summary = {
  artifact: "machinesignal_github_machine_docs_probe",
  generated_at: new Date().toISOString(),
  ok: failures.length === 0,
  checks_total: checks.length,
  checks_failed: failures.length,
  failures,
  docs_entrypoint: "MACHINE_AGENT_ENTRYPOINT.md",
  json_entrypoint: "MACHINE_AGENT_ENTRYPOINT.json",
  external_publication_executed: false,
  external_send_executed: false,
  post_calls_executed: 0,
  write_calls_executed: 0,
  payment_executed: false,
  credits_consumed: 0,
  personal_data_used: false,
  recommendation: failures.length === 0
    ? "github_machine_docs_ready_for_repo_readers_no_external_send"
    : "fix_github_machine_docs_before_next_step"
};

const report = [
  "# MachineSignal GitHub Machine Docs Probe",
  "",
  `Generated at: ${summary.generated_at}`,
  "",
  `Status: ${summary.ok ? "PASS" : "FAIL"}`,
  "",
  "## Entrypoints",
  "",
  `- Markdown: ${summary.docs_entrypoint}`,
  `- JSON: ${summary.json_entrypoint}`,
  "",
  "## Safety",
  "",
  `- external_publication_executed: ${summary.external_publication_executed}`,
  `- external_send_executed: ${summary.external_send_executed}`,
  `- post_calls_executed: ${summary.post_calls_executed}`,
  `- write_calls_executed: ${summary.write_calls_executed}`,
  `- payment_executed: ${summary.payment_executed}`,
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
  path.join(packDir, "github_machine_docs_probe_summary_20260612.json"),
  `${JSON.stringify(summary, null, 2)}\n`
);
fs.writeFileSync(
  path.join(packDir, "github_machine_docs_probe_report_20260612.md"),
  `${report}\n`
);

console.log(JSON.stringify(summary, null, 2));

