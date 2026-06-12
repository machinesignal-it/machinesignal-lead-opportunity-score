import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const packDir = path.join(root, "private-evaluator-pack");
const jsonPath = path.join(packDir, "hosted_mcp_architecture_spike_20260612.json");
const mdPath = path.join(packDir, "hosted_mcp_architecture_spike_20260612.md");

const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
const markdown = fs.readFileSync(mdPath, "utf8");

const checks = [];

function check(id, pass, detail) {
  checks.push({ id, pass: Boolean(pass), detail });
}

function includesAll(list, required) {
  return required.every((item) => list.includes(item));
}

check(
  "artifact_name",
  data.artifact === "hosted_mcp_architecture_spike",
  "Artifact name must match the hosted MCP architecture spike."
);
check(
  "status_no_build",
  data.status === "architecture_spike_no_build_no_deploy",
  "Status must remain no-build and no-deploy."
);
check(
  "machine_first_rule",
  data.primary_customer_interface === "machine" &&
    data.business_rule === "sell_to_machines_not_humans",
  "The spike must remain machine-first."
);
check(
  "deployment_blocked",
  data.decision.recommended_path_now === "do_not_build_hosted_mcp_yet" &&
    data.decision.blocked_now.includes("hosted MCP deployment"),
  "Hosted MCP deployment must remain blocked."
);
check(
  "blocked_actions_core",
  includesAll(data.decision.blocked_now, [
    "public MCP registry submission",
    "write-enabled public MCP tools",
    "live billing",
    "production customer keys",
    "real customer data",
    "personal data",
    "real lead lists"
  ]),
  "Core blocked actions must be explicit."
);
check(
  "sources_present",
  data.official_sources_checked.length >= 8 &&
    data.official_sources_checked.every((source) => source.url.startsWith("https://")),
  "Official sources must be present and HTTPS."
);
check(
  "mcp_sources_present",
  data.official_sources_checked.some((source) => source.url.includes("modelcontextprotocol.io/specification/2025-11-25")) &&
    data.official_sources_checked.some((source) => source.url.includes("basic/authorization")) &&
    data.official_sources_checked.some((source) => source.url.includes("server/tools")),
  "MCP specification, authorization and tools sources must be present."
);
check(
  "cloudflare_sources_present",
  data.official_sources_checked.some((source) => source.url.includes("developers.cloudflare.com/durable-objects")) &&
    data.official_sources_checked.some((source) => source.url.includes("developers.cloudflare.com/kv/platform/limits")),
  "Cloudflare Durable Objects and KV limits sources must be present."
);
check(
  "future_endpoint_https",
  data.target_architecture.future_canonical_endpoint.startsWith("https://") &&
    data.target_architecture.future_alternative_endpoint.startsWith("https://"),
  "Future endpoints must be HTTPS."
);
check(
  "endpoint_not_live",
  data.target_architecture.current_endpoint_status === "not_live_not_configured",
  "Hosted MCP endpoint must not be marked live."
);
check(
  "local_adapter_current",
  data.target_architecture.transport.includes("local stdio remains current MCP path"),
  "Local stdio adapter must remain current MCP path."
);
check(
  "protected_metadata_future",
  data.target_architecture.protected_mcp_metadata_future.length >= 2 &&
    data.target_architecture.protected_mcp_metadata_future.every((url) => url.startsWith("https://")),
  "Future protected resource metadata URLs must be declared."
);
check(
  "durable_objects_hot_state",
  includesAll(data.target_architecture.storage_plane.durable_objects, [
    "customer ledger",
    "idempotency records",
    "quota counters",
    "spend caps",
    "audit summary indexes",
    "kill-switch state"
  ]),
  "Durable Objects must own coordinated mutable state."
);
check(
  "kv_not_hot_path",
  includesAll(data.target_architecture.storage_plane.no_go, [
    "per-request KV writes for every score",
    "storing tokens in logs",
    "storing raw personal data in telemetry",
    "mixing customer ledgers"
  ]),
  "KV must not be used for hot-path writes or unsafe data."
);

const scopes = new Map(data.scope_matrix.map((scope) => [scope.scope, scope]));
check(
  "scope_catalog_read_exists",
  scopes.has("mcp:catalog:read") && scopes.get("mcp:catalog:read").writes === false,
  "Read-only catalog scope must exist and not write."
);
check(
  "scope_score_create_protected",
  scopes.has("mcp:score:create") &&
    scopes.get("mcp:score:create").writes === true &&
    scopes.get("mcp:score:create").public_or_authenticated === "authenticated_only",
  "Score creation must be authenticated and write-scoped."
);
check(
  "scope_purchase_intent_protected",
  scopes.has("mcp:purchase_intent:create") &&
    scopes.get("mcp:purchase_intent:create").public_or_authenticated === "authenticated_only" &&
    String(scopes.get("mcp:purchase_intent:create").credit_consumption).includes("fiscal_gate"),
  "Purchase intent must be authenticated and live only after fiscal gate."
);
check(
  "scope_admin_never_public",
  scopes.has("mcp:admin:*") &&
    scopes.get("mcp:admin:*").public_or_authenticated === "owner_admin_only_never_registry_public",
  "Admin scope must never be public."
);
check(
  "dangerous_actions_blocked",
  includesAll(data.tool_exposure_policy.dangerous_actions_blocked_by_default, [
    "send_email",
    "contact_external_target",
    "charge_card",
    "issue_invoice",
    "export_personal_data",
    "process_real_customer_list",
    "publish_registry_listing"
  ]),
  "Dangerous actions must be blocked by default."
);
check(
  "write_tool_rules",
  data.tool_exposure_policy.write_tool_rules.some((rule) => rule.includes("idempotency key")) &&
    data.tool_exposure_policy.write_tool_rules.some((rule) => rule.includes("dry_run")) &&
    data.tool_exposure_policy.write_tool_rules.some((rule) => rule.includes("Action Pack")),
  "Write tool rules must include idempotency, dry-run and Action Pack no-outreach behavior."
);
check(
  "request_flow_ordered",
  data.request_flow.length === 7 &&
    data.request_flow[0].name === "machine_discovers_public_manifest" &&
    data.request_flow[6].name === "structured_response",
  "Request flow must be complete and ordered."
);
check(
  "threat_model_highs",
  data.threat_model.filter((threat) => threat.risk_level === "high").length >= 6,
  "Threat model must include multiple high-risk hosted MCP threats."
);
check(
  "go_live_phases_present",
  data.go_live_phases.length === 6 &&
    data.go_live_phases[0].phase === "P0_no_build_architecture" &&
    data.go_live_phases[5].phase === "P5_public_hosted_mcp_and_registry",
  "Go-live phases must run from no-build architecture to public hosted MCP."
);
check(
  "future_phases_blocked",
  data.go_live_phases.slice(2).every((phase) => phase.status.includes("blocked")),
  "Hosted staging, beta, paid beta and public launch phases must be blocked."
);
check(
  "env_flags_default_false",
  includesAll(data.minimum_build_spec_later.environment_flags, [
    "HOSTED_MCP_ENABLED=false",
    "MCP_WRITE_TOOLS_ENABLED=false",
    "LIVE_BILLING_ENABLED=false",
    "REAL_DATA_ENABLED=false",
    "PUBLIC_REGISTRY_SUBMISSION_ENABLED=false"
  ]),
  "Future build environment flags must default to false."
);
check(
  "recommendation_blocks_build",
  data.architecture_recommendation.next_allowed_action === "run_hosted_mcp_architecture_spike_probe" &&
    data.architecture_recommendation.next_blocked_action === "hosted_mcp_build_or_deploy",
  "Recommendation must allow only the probe and block build/deploy."
);
check(
  "markdown_mentions_no_build",
  markdown.includes("No build. No deploy. No publication."),
  "Markdown must state no-build/no-deploy/no-publication."
);
check(
  "markdown_mentions_kv_decision",
  markdown.includes("Do not use KV for:") &&
    markdown.includes("one write per score"),
  "Markdown must explain KV hot-path avoidance."
);
check(
  "markdown_mentions_scope_matrix",
  markdown.includes("## Scope Matrix") &&
    markdown.includes("mcp:score:create"),
  "Markdown must include the scope matrix."
);
check(
  "markdown_mentions_blocked_actions",
  markdown.includes("Dangerous actions blocked by default") &&
    markdown.includes("contact external target"),
  "Markdown must include dangerous blocked actions."
);
check(
  "markdown_mentions_go_live_phases",
  markdown.includes("## Go-Live Phases") &&
    markdown.includes("P5 Public Hosted MCP And Registry"),
  "Markdown must include go-live phases."
);

const filesToScan = [jsonPath, mdPath, import.meta.filename || new URL(import.meta.url).pathname];
const secretPatterns = [
  /api[_-]?key\s*[:=]\s*['"][^'"]+['"]/i,
  /password\s*[:=]\s*['"][^'"]+['"]/i,
  /token\s*[:=]\s*['"][A-Za-z0-9_\-.]{20,}['"]/i,
  /Bearer\s+[A-Za-z0-9_\-.]{20,}/i
];

for (const file of filesToScan) {
  const body = fs.readFileSync(file, "utf8");
  check(
    `ascii_${path.basename(file)}`,
    [...body].every((char) => char.charCodeAt(0) <= 127),
    `${path.basename(file)} must remain ASCII.`
  );
  check(
    `secret_scan_${path.basename(file)}`,
    !secretPatterns.some((pattern) => pattern.test(body)),
    `${path.basename(file)} must not contain obvious secrets.`
  );
}

const failed = checks.filter((item) => !item.pass);

const summary = {
  artifact: "hosted_mcp_architecture_spike_probe",
  version: "2026-06-12",
  ok: failed.length === 0,
  checks_total: checks.length,
  checks_failed: failed.length,
  hosted_mcp_build_allowed: false,
  hosted_mcp_deploy_allowed: false,
  registry_submission_allowed: false,
  live_billing_allowed: false,
  real_data_allowed: false,
  personal_data_allowed: false,
  next_allowed_action: data.architecture_recommendation.next_allowed_action,
  next_blocked_action: data.architecture_recommendation.next_blocked_action,
  failed_checks: failed,
  checked_files: filesToScan.map((file) => path.relative(root, file)),
  checks
};

const report = [
  "# Hosted MCP Architecture Spike Probe",
  "",
  "Date: 2026-06-12",
  "",
  `Status: ${summary.ok ? "passed" : "failed"}`,
  "",
  "This probe validates the no-build hosted MCP architecture spike.",
  "",
  "## Result",
  "",
  `- checks total: ${summary.checks_total}`,
  `- checks failed: ${summary.checks_failed}`,
  `- hosted MCP build allowed: ${summary.hosted_mcp_build_allowed ? "yes" : "no"}`,
  `- hosted MCP deploy allowed: ${summary.hosted_mcp_deploy_allowed ? "yes" : "no"}`,
  `- registry submission allowed: ${summary.registry_submission_allowed ? "yes" : "no"}`,
  `- live billing allowed: ${summary.live_billing_allowed ? "yes" : "no"}`,
  `- real data allowed: ${summary.real_data_allowed ? "yes" : "no"}`,
  `- personal data allowed: ${summary.personal_data_allowed ? "yes" : "no"}`,
  "",
  "## Interpretation",
  "",
  "The architecture spike is valid as a design artifact only. It does not authorize hosted MCP build, hosted MCP deployment, public registry submission, live billing, production keys, personal data or real customer data.",
  "",
  "## Next",
  "",
  `Allowed: ${summary.next_allowed_action}`,
  "",
  `Blocked: ${summary.next_blocked_action}`,
  "",
  "## Failed Checks",
  "",
  failed.length
    ? failed.map((item) => `- ${item.id}: ${item.detail}`).join("\n")
    : "None.",
  ""
].join("\n");

const summaryPath = path.join(packDir, "hosted_mcp_architecture_spike_probe_summary_20260612.json");
const reportPath = path.join(packDir, "hosted_mcp_architecture_spike_probe_report_20260612.md");

fs.writeFileSync(summaryPath, `${JSON.stringify(summary, null, 2)}\n`);
fs.writeFileSync(reportPath, report);

console.log(
  JSON.stringify(
    {
      ok: summary.ok,
      checks_total: summary.checks_total,
      checks_failed: summary.checks_failed,
      summary: path.relative(root, summaryPath),
      report: path.relative(root, reportPath)
    },
    null,
    2
  )
);

if (!summary.ok) {
  process.exit(1);
}
