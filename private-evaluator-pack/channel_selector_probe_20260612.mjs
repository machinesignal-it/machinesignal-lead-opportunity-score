import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const packDir = path.dirname(fileURLToPath(import.meta.url));
const readJson = (name) => JSON.parse(fs.readFileSync(path.join(packDir, name), "utf8"));

const matrix = readJson("channel_selection_matrix_20260612.json");
const entrypoint = readJson("private_evaluator_entrypoint.json");
const productSelector = readJson("product_selector_contract.json");

const checks = [];
const failures = [];

function check(id, ok, detail) {
  checks.push({ id, ok, detail });
  if (!ok) failures.push({ id, detail });
}

const channels = new Map((matrix.channels || []).map((channel) => [channel.channel_id, channel]));
const recommended = channels.get(matrix.decision.recommended_primary_next_channel);
const companion = channels.get(matrix.decision.recommended_companion_channel);

check(
  "matrix_is_nopublish",
  matrix.status === "nopublish_nosend_nowrite_simulation_only",
  "channel matrix must stay NoPublish/NoSend/NoWrite"
);

check(
  "business_rule_machine_first",
  matrix.business_rule === "sell_to_machines_not_humans" &&
    entrypoint.business_rule === "sell_to_machines_not_humans",
  "channel selector must preserve machine-first business rule"
);

check(
  "recommended_channel_exists",
  Boolean(recommended),
  "recommended primary next channel must exist"
);

check(
  "recommended_channel_is_mcp",
  recommended?.channel_id === "mcp_tool_registry_draft",
  "primary recommendation should be MCP/tool-registry draft"
);

check(
  "companion_channel_is_github_docs",
  companion?.channel_id === "github_machine_docs",
  "companion recommendation should be GitHub machine docs"
);

check(
  "rapidapi_deferred",
  matrix.decision.recommended_defer_channels.includes("rapidapi_marketplace_publication"),
  "RapidAPI publication must be deferred"
);

check(
  "publication_blocked",
  matrix.safety_scope.external_publication_allowed === false &&
    matrix.safety_scope.marketplace_submission_allowed === false &&
    matrix.safety_scope.live_payment_allowed === false &&
    matrix.safety_scope.production_key_distribution_allowed === false,
  "external publication, marketplace submission, payment and production keys must be blocked"
);

check(
  "mcp_score_highest",
  [...channels.values()].every((channel) => recommended.weighted_score >= channel.weighted_score),
  "MCP/tool-registry draft should have the highest weighted score"
);

check(
  "product_selector_still_nolive",
  productSelector.global_rules.live_checkout_enabled === false &&
    productSelector.global_rules.write_execution_allowed_in_this_pack === false,
  "product selector must still block live checkout and writes"
);

check(
  "new_gate_required_before_external_actions",
  matrix.requires_new_gate_before.includes("submitting_mcp_registry_entry") &&
    matrix.requires_new_gate_before.includes("launching_hosted_mcp") &&
    matrix.requires_new_gate_before.includes("activating_live_billing"),
  "new gate must be required before MCP registry submission, hosted MCP launch or billing"
);

const summary = {
  artifact: "machinesignal_channel_selector_probe",
  generated_at: new Date().toISOString(),
  ok: failures.length === 0,
  checks_total: checks.length,
  checks_failed: failures.length,
  failures,
  recommended_primary_next_channel: matrix.decision.recommended_primary_next_channel,
  recommended_companion_channel: matrix.decision.recommended_companion_channel,
  deferred_channels: matrix.decision.recommended_defer_channels,
  external_publication_executed: false,
  external_send_executed: false,
  post_calls_executed: 0,
  write_calls_executed: 0,
  payment_executed: false,
  credits_consumed: 0,
  personal_data_used: false,
  recommendation: failures.length === 0
    ? "prepare_mcp_channel_entrypoint_draft_nopublish_nowrite_next"
    : "fix_channel_matrix_before_next_step"
};

const report = [
  "# MachineSignal Channel Selector Probe",
  "",
  `Generated at: ${summary.generated_at}`,
  "",
  `Status: ${summary.ok ? "PASS" : "FAIL"}`,
  "",
  "## Recommended Channel",
  "",
  `Primary: ${summary.recommended_primary_next_channel}`,
  `Companion: ${summary.recommended_companion_channel}`,
  "",
  "## Deferred Channels",
  "",
  ...summary.deferred_channels.map((channel) => `- ${channel}`),
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
  path.join(packDir, "channel_selector_probe_summary_20260612.json"),
  `${JSON.stringify(summary, null, 2)}\n`
);
fs.writeFileSync(
  path.join(packDir, "channel_selector_probe_report_20260612.md"),
  `${report}\n`
);

console.log(JSON.stringify(summary, null, 2));

