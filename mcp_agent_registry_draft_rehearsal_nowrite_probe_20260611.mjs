import fs from "node:fs";

const PUBLIC_SITE = "https://machinesignal.it";
const GITHUB_RAW = "https://raw.githubusercontent.com/machinesignal-it/machinesignal-lead-opportunity-score/main";
const OUTPUT_REPORT = "mcp_agent_registry_draft_rehearsal_nowrite_probe_report_20260611.md";
const OUTPUT_SUMMARY = "mcp_agent_registry_draft_rehearsal_nowrite_probe_summary_20260611.json";

const resourcesToFetch = [
  ["mcp_private_draft_pack", `${PUBLIC_SITE}/mcp_tool_registry_private_draft_pack_20260608.json`, "json", ["ready_for_mcp_tool_registry_private_draft_only", "MachineSignal Lead Opportunity Score", "hosted_mcp_live"]],
  ["mcp_private_draft_pack_md", `${PUBLIC_SITE}/mcp_tool_registry_private_draft_pack_20260608.md`, "text", ["MCP Tool Registry Private Draft Pack", "hosted_mcp_live=false"]],
  ["mcp_private_draft_review", `${PUBLIC_SITE}/mcp_tool_registry_private_draft_review_summary_20260608.json`, "json", ["completed_mcp_tool_registry_private_draft_review", "NoWriteMcpToolRegistryPrivateDraftReview"]],
  ["mcp_private_draft_review_md", `${PUBLIC_SITE}/mcp_tool_registry_private_draft_review_report_20260608.md`, "text", ["MCP Tool Registry Private Draft Review", "NoWriteMcpToolRegistryPrivateDraftReview"]],
  ["mcp_registry_checklist", `${PUBLIC_SITE}/mcp_tool_registry_draft_checklist_20260607.json`, "json", ["blocked_until_owner_approval", "do_not_contact_human_prospects_or_target_companies"]],
  ["mcp_registry_checklist_md", `${PUBLIC_SITE}/mcp_tool_registry_draft_checklist_20260607.md`, "text", ["MachineSignal MCP and Tool Registry Draft Checklist", "owner approval"]],
  ["mcp_manifest", `${PUBLIC_SITE}/mcp-tool-manifest.json`, "json", ["get_mcp_tool_registry_private_draft_pack", "get_mcp_tool_registry_private_draft_review"]],
  ["well_known_mcp_manifest", `${PUBLIC_SITE}/.well-known/mcp-tool-manifest.json`, "json", ["get_mcp_tool_registry_private_draft_pack", "get_mcp_tool_registry_private_draft_review"]],
  ["mcp_wrapper", `${PUBLIC_SITE}/mcp/machinesignal-mcp-wrapper.json`, "json", ["local_stdio_adapter_live_public_hosted_mcp_not_live", "hosted_mcp_live"]],
  ["mcp_landing", `${PUBLIC_SITE}/mcp/`, "text", ["MachineSignal", "MCP"]],
  ["mcp_installation_pack", `${PUBLIC_SITE}/mcp-machine-client-installation-pack.json`, "json", ["mcp_adapter/machinesignal_mcp_server.py", "primary_customer_interface"]],
  ["mcp_installation_md", `${PUBLIC_SITE}/MCP_MACHINE_CLIENT_INSTALLATION.md`, "text", ["MachineSignal", "MCP"]],
  ["mcp_contract_md", `${PUBLIC_SITE}/MCP_TOOL_CONTRACT.md`, "text", ["MachineSignal", "MCP"]],
  ["mcp_adapter_server_raw", `${GITHUB_RAW}/mcp_adapter/machinesignal_mcp_server.py`, "text", ["tools/list", "tools/call"]],
  ["mcp_adapter_config_raw", `${GITHUB_RAW}/mcp_adapter/mcp_client_config.example.json`, "json", ["machinesignal", "command"]],
  ["mcp_adapter_readme_raw", `${GITHUB_RAW}/mcp_adapter/README.md`, "text", ["MachineSignal", "MCP"]],
  ["mcp_local_adapter_validation", `${PUBLIC_SITE}/mcp_local_adapter_nowrite_validation_summary_20260610.json`, "json", ["completed_mcp_local_adapter_nowrite_validation", "NoWriteMcpLocalAdapterValidation"]],
  ["mcp_purchase_decision_probe", `${PUBLIC_SITE}/mcp_purchase_decision_probe_summary_20260610.json`, "json", ["completed_mcp_purchase_decision_probe"]],
  ["mcp_verification_gate_probe", `${PUBLIC_SITE}/mcp_verification_gate_probe_summary_20260610.json`, "json", ["completed_mcp_verification_gate_probe"]],
  ["mcp_full_chain_idempotency_probe", `${PUBLIC_SITE}/mcp_full_chain_idempotency_probe_summary_20260611.json`, "json", ["completed_mcp_full_chain_idempotency_probe"]],
  ["api_marketplace_rehearsal_dependency", `${PUBLIC_SITE}/api_marketplace_draft_rehearsal_nowrite_probe_summary_20260611.json`, "json", ["completed_api_marketplace_draft_rehearsal_nowrite"]],
  ["postman_rehearsal_dependency", `${PUBLIC_SITE}/postman_private_workspace_rehearsal_nowrite_probe_summary_20260611.json`, "json", ["completed_postman_private_workspace_rehearsal_nowrite"]],
  ["distribution_monitor", `${PUBLIC_SITE}/distribution_readiness_monitor_summary_20260607.json`, "json", ["ready_for_distribution_review", "checks_failed"]],
  ["machine_discovery", `${PUBLIC_SITE}/.well-known/machine-discovery.json`, "json", ["api_marketplace_draft_rehearsal_nowrite_probe_json"]],
  ["machine_onboarding", `${PUBLIC_SITE}/machine-onboarding.json`, "json", ["api_marketplace_draft_rehearsal_nowrite_probe_json"]],
  ["llms", `${PUBLIC_SITE}/llms.txt`, "text", ["MCP Tool Registry Private Draft Pack JSON", "API Marketplace Draft Rehearsal NoWrite Probe JSON"]],
  ["robots", `${PUBLIC_SITE}/robots.txt`, "text", ["Mcp-tool-registry-private-draft-pack-json", "Api-marketplace-draft-rehearsal-nowrite-probe-json"]],
  ["sitemap", `${PUBLIC_SITE}/sitemap.xml`, "text", ["mcp_tool_registry_private_draft_pack_20260608.json", "api_marketplace_draft_rehearsal_nowrite_probe_summary_20260611.json"]]
];

const mcpPackRequiredPaths = [
  "tool_registry_listing_fields.tool_name",
  "tool_registry_listing_fields.visibility",
  "tool_registry_listing_fields.transport_now",
  "tool_registry_listing_fields.hosted_mcp_live",
  "tool_registry_listing_fields.monetization",
  "tool_registry_listing_fields.short_description",
  "tool_registry_listing_fields.long_description",
  "tool_registry_listing_fields.primary_user",
  "tool_registry_listing_fields.human_role",
  "tool_registry_listing_fields.tool_manifest",
  "tool_registry_listing_fields.well_known_tool_manifest",
  "tool_registry_listing_fields.wrapper_pack",
  "tool_registry_listing_fields.installation_pack",
  "tool_registry_listing_fields.repository",
  "tool_registry_listing_fields.local_adapter_path",
  "tool_registry_listing_fields.client_config_example",
  "tools_to_expose_in_private_registry_draft",
  "blocked_before_registry_submit",
  "machine_decision.decision",
  "source_assets.distribution_monitor_json"
];

const hardFailPatterns = [
  ["hosted_mcp_live_true", /"hosted_mcp_live"\s*:\s*true|"hosted_mcp_endpoint_published"\s*:\s*true/i],
  ["external_publication_true", /"external_publication_executed"\s*:\s*true|"irreversible_submission_executed"\s*:\s*true/i],
  ["live_monetization_true", /"live_monetization_enabled"\s*:\s*true|"public_paid_plans_enabled"\s*:\s*true|"public_paid_plans_active"\s*:\s*true/i],
  ["real_payment_true", /"real_payment_executed"\s*:\s*true/i],
  ["real_invoice_true", /"real_invoice_issued"\s*:\s*true/i],
  ["external_contact_true", /"external_contact_executed"\s*:\s*true/i],
  ["human_outreach_true", /"human_outreach_allowed"\s*:\s*true|"human_outreach_executed"\s*:\s*true/i],
  ["production_key_published_true", /"real_api_keys_published"\s*:\s*true|"production_api_key_published"\s*:\s*true/i],
  ["production_secret_like_pattern", /sk_live_[A-Za-z0-9_-]+|ghp_[A-Za-z0-9_]+|github_pat_[A-Za-z0-9_]+|Bearer\s+[A-Za-z0-9._-]{20,}|msig_live_[A-Za-z0-9_-]{12,}/i]
];

const checks = [];
const resources = {};

function addCheck(name, ok, details = "") {
  checks.push({ name, ok: Boolean(ok), details });
}

function asText(value) {
  return typeof value === "string" ? value : JSON.stringify(value ?? {});
}

function getPath(obj, path) {
  return path.split(".").reduce((acc, key) => {
    if (acc === undefined || acc === null) return undefined;
    return Object.hasOwn(acc, key) ? acc[key] : undefined;
  }, obj);
}

function fieldPresent(obj, path) {
  const value = getPath(obj, path);
  if (typeof value === "boolean") return value === false;
  if (Array.isArray(value)) return value.length > 0;
  return Boolean(value);
}

function hardFailsForText(text) {
  return hardFailPatterns
    .filter(([, regex]) => regex.test(text))
    .map(([code]) => code);
}

async function fetchResource(name, url, type, markers) {
  const response = await fetch(url, {
    headers: {
      "user-agent": "MachineSignalMcpAgentRegistryDraftNoWriteProbe/2026-06-11",
      accept: type === "json" ? "application/json,*/*" : "text/plain,text/html,application/xml,*/*",
      "cache-control": "no-cache"
    }
  });
  const bodyText = await response.text();
  let body = bodyText;
  let jsonOk = false;
  if (type === "json") {
    try {
      body = JSON.parse(bodyText);
      jsonOk = true;
    } catch {
      jsonOk = false;
    }
  }
  const markerChecks = markers.map((marker) => ({ marker, ok: bodyText.includes(marker) }));
  const hardFails = hardFailsForText(bodyText);
  resources[name] = { url, status: response.status, ok: response.ok, bytes: bodyText.length, json_ok: jsonOk, body, body_text: bodyText, marker_checks: markerChecks, hard_fails: hardFails };
  addCheck(`${name}_reachable`, response.ok, `HTTP ${response.status}, bytes=${bodyText.length}`);
  if (type === "json") addCheck(`${name}_json_valid`, jsonOk, `json_valid=${jsonOk}`);
  for (const markerCheck of markerChecks) addCheck(`${name}_marker_${markerCheck.marker.replace(/[^A-Za-z0-9]+/g, "_").toLowerCase()}`, markerCheck.ok, markerCheck.marker);
  addCheck(`${name}_no_hard_fail_patterns`, hardFails.length === 0, hardFails.join(",") || "none");
}

for (const [name, url, type, markers] of resourcesToFetch) {
  await fetchResource(name, url, type, markers);
}

const pack = resources.mcp_private_draft_pack.body || {};
const review = resources.mcp_private_draft_review.body || {};
const checklist = resources.mcp_registry_checklist.body || {};
const manifest = resources.mcp_manifest.body || {};
const wellKnownManifest = resources.well_known_mcp_manifest.body || {};
const wrapper = resources.mcp_wrapper.body || {};
const installationPack = resources.mcp_installation_pack.body || {};
const adapterConfig = resources.mcp_adapter_config_raw.body || {};
const localAdapterValidation = resources.mcp_local_adapter_validation.body || {};
const fullChain = resources.mcp_full_chain_idempotency_probe.body || {};
const apiMarketplace = resources.api_marketplace_rehearsal_dependency.body || {};
const postman = resources.postman_rehearsal_dependency.body || {};
const monitor = resources.distribution_monitor.body || {};

for (const path of mcpPackRequiredPaths) {
  addCheck(`mcp_pack_required_${path.replace(/[^A-Za-z0-9]+/g, "_").toLowerCase()}`, fieldPresent(pack, path), path);
}

const packSafety = pack.draft_safety_state || {};
const tools = Array.isArray(manifest.tools) ? manifest.tools : [];
const toolNames = tools.map((tool) => tool.name);
const packTools = Array.isArray(pack.tools_to_expose_in_private_registry_draft)
  ? pack.tools_to_expose_in_private_registry_draft
  : [];
const checklistText = asText(checklist);
const manifestText = asText(manifest);
const wrapperText = asText(wrapper);
const installationText = asText(installationPack);

addCheck("mcp_pack_status_private_draft_only", pack.status === "ready_for_mcp_tool_registry_private_draft_only", `status=${pack.status}`);
addCheck("mcp_pack_primary_customer_machine", pack.primary_customer_interface === "machine", pack.primary_customer_interface || "");
addCheck("mcp_pack_visibility_private_or_unsubmitted", pack.tool_registry_listing_fields?.visibility === "private_draft_or_unsubmitted", pack.tool_registry_listing_fields?.visibility || "");
addCheck("mcp_pack_transport_local_stdio", String(pack.tool_registry_listing_fields?.transport_now || "").includes("stdio"), pack.tool_registry_listing_fields?.transport_now || "");
addCheck("mcp_pack_hosted_mcp_not_live", pack.tool_registry_listing_fields?.hosted_mcp_live === false && packSafety.hosted_mcp_live === false, `listing=${pack.tool_registry_listing_fields?.hosted_mcp_live}, safety=${packSafety.hosted_mcp_live}`);
addCheck("mcp_pack_monetization_disabled", pack.tool_registry_listing_fields?.monetization === "disabled" && packSafety.live_monetization_enabled === false, `monetization=${pack.tool_registry_listing_fields?.monetization}`);
addCheck("mcp_pack_no_external_publication", packSafety.external_publication_executed === false && packSafety.irreversible_submission_executed === false, "external publication blocked");
addCheck("mcp_pack_no_human_outreach", packSafety.human_outreach_allowed === false && pack.blocked_before_registry_submit?.includes("external_human_outreach"), "human outreach blocked");
addCheck("mcp_pack_no_production_key", packSafety.production_api_key_published === false && pack.blocked_before_registry_submit?.includes("production_key_distribution"), "production key distribution blocked");
addCheck("mcp_pack_tool_list_complete_enough", packTools.includes("score_lead_opportunity") && packTools.includes("create_purchase_intent") && packTools.includes("get_mcp_tool_registry_private_draft_pack"), `tools=${packTools.length}`);

addCheck("mcp_review_passed", review.ok === true && review.status === "completed_mcp_tool_registry_private_draft_review", `status=${review.status}`);
addCheck("mcp_review_nowrite", review.mode === "NoWriteMcpToolRegistryPrivateDraftReview" && Number(review.write_calls_executed) === 0 && Number(review.post_calls_executed) === 0, `mode=${review.mode}, writes=${review.write_calls_executed}, posts=${review.post_calls_executed}`);
addCheck("mcp_review_no_live_commerce", review.live_monetization_enabled === false && review.public_paid_plans_enabled === false && review.real_payment_executed === false, "no live commerce");
addCheck("mcp_review_no_external_contact", review.external_contact_executed === false && review.human_outreach_executed !== true, "no outreach");

addCheck("mcp_checklist_submission_blocked", checklist.external_submission === "blocked_until_owner_approval", checklist.external_submission || "");
addCheck("mcp_checklist_hosted_not_live", checklist.hosted_mcp_live === false, `hosted_mcp_live=${checklist.hosted_mcp_live}`);
addCheck("mcp_checklist_monetization_disabled", checklist.monetization === "disabled", checklist.monetization || "");
addCheck("mcp_checklist_master_rules_machine_safe", checklistText.includes("keep_public_hosted_mcp_marked_not_live") && checklistText.includes("do_not_contact_human_prospects_or_target_companies"), "required master rules present");
addCheck("mcp_checklist_owner_approval_gate", checklistText.includes("owner_approval_recorded"), "owner approval gate present");
addCheck("mcp_checklist_blocks_irreversible_registry_publication", checklistText.includes("submit_to_external_registry_irreversibly"), "irreversible registry publication blocked");

addCheck("mcp_manifest_machine_interface", manifest.primary_customer_interface === "machine" && wellKnownManifest.primary_customer_interface === "machine", "manifest and well-known manifest are machine-first");
addCheck("mcp_manifest_tool_registry_tools_present", toolNames.includes("get_mcp_tool_registry_private_draft_pack") && toolNames.includes("get_mcp_tool_registry_private_draft_review"), "MCP registry tools present");
addCheck("mcp_manifest_core_commerce_tools_present", toolNames.includes("score_lead_opportunity") && toolNames.includes("create_purchase_intent") && toolNames.includes("get_order"), "score, purchase intent and order tools present");
addCheck("mcp_manifest_flow_mentions_registry", manifestText.includes("get_mcp_tool_registry_private_draft_pack") && manifestText.includes("get_mcp_tool_registry_private_draft_review"), "recommended flow includes registry draft tools");
addCheck("mcp_manifest_safety_blocks_contact", manifest.safety?.external_contact_executed_by_machinesignal === false && String(manifest.safety?.human_role || "").includes("supervision"), "safety section blocks external contact");

addCheck("mcp_wrapper_local_adapter_status", String(wrapper.status || "").includes("local_stdio_adapter") && wrapperText.includes("hosted_mcp_not_live"), wrapper.status || "");
addCheck("mcp_wrapper_public_links_registry_present", wrapperText.includes("mcp_tool_registry_private_draft_pack") && wrapperText.includes("mcp_tool_registry_private_draft_review"), "wrapper links registry evidence");
addCheck("mcp_installation_pack_beta_local_adapter", installationPack.status === "beta" && installationText.includes("mcp_adapter/machinesignal_mcp_server.py"), `status=${installationPack.status}`);
addCheck("mcp_adapter_config_machine_signal_present", asText(adapterConfig).includes("machinesignal") && asText(adapterConfig).includes("machinesignal_mcp_server.py"), "client config can discover local adapter");

addCheck("local_adapter_validation_passed", localAdapterValidation.ok === true && localAdapterValidation.status === "completed_mcp_local_adapter_nowrite_validation", `status=${localAdapterValidation.status}`);
addCheck("local_adapter_validation_no_writes", Number(localAdapterValidation.write_calls_executed) === 0 && Number(localAdapterValidation.post_calls_executed) === 0, `writes=${localAdapterValidation.write_calls_executed}, posts=${localAdapterValidation.post_calls_executed}`);
addCheck("local_adapter_validation_no_outreach", localAdapterValidation.external_contact_executed === false && localAdapterValidation.human_outreach_executed === false, "no outreach");
addCheck("full_chain_idempotency_dependency_passed", fullChain.ok === true && fullChain.status === "completed_mcp_full_chain_idempotency_probe", `status=${fullChain.status}`);
addCheck("full_chain_no_real_payment_or_invoice", fullChain.real_payment_executed === false && fullChain.real_invoice_issued === false, "sandbox/test flow only");
addCheck("api_marketplace_dependency_passed", apiMarketplace.ok === true && apiMarketplace.status === "completed_api_marketplace_draft_rehearsal_nowrite", `status=${apiMarketplace.status}`);
addCheck("postman_dependency_passed", postman.ok === true && postman.status === "completed_postman_private_workspace_rehearsal_nowrite", `status=${postman.status}`);
addCheck("distribution_monitor_green", monitor.ok === true && Number(monitor.checks_failed) === 0, `ok=${monitor.ok}, failed=${monitor.checks_failed}`);

const failed = checks.filter((check) => !check.ok);
const summary = {
  service: "MachineSignal",
  probe_name: "mcp_agent_registry_draft_rehearsal_nowrite_probe",
  status: failed.length === 0 ? "completed_mcp_agent_registry_draft_rehearsal_nowrite" : "failed_mcp_agent_registry_draft_rehearsal_nowrite",
  ok: failed.length === 0,
  evidence_date: "2026-06-11",
  mode: "NoWriteMcpAgentRegistryDraftRehearsal",
  primary_customer_interface: "machine",
  machine_customer_mode: "machine_reads_mcp_manifest_registry_draft_and_local_adapter_contract_without_hosted_mcp_publication_or_live_commerce",
  channels_checked: ["mcp_tool_registry", "agent_registry", "local_mcp_adapter"],
  public_site: PUBLIC_SITE,
  write_calls_executed: 0,
  post_calls_executed: 0,
  real_payment_executed: false,
  real_invoice_issued: false,
  external_contact_executed: false,
  human_outreach_executed: false,
  external_publication_executed: false,
  irreversible_submission_executed: false,
  hosted_mcp_live: false,
  hosted_mcp_endpoint_published: false,
  live_monetization_enabled: false,
  public_paid_plans_enabled: false,
  production_api_key_published: false,
  marketplace_rehearsal_dependency_ok: apiMarketplace.ok === true,
  postman_rehearsal_dependency_ok: postman.ok === true,
  distribution_monitor_dependency_ok: monitor.ok === true && Number(monitor.checks_failed) === 0,
  tool_registry_status: pack.status,
  transport_now: pack.tool_registry_listing_fields?.transport_now || null,
  exposed_tool_count: packTools.length,
  manifest_tool_count: toolNames.length,
  resources_checked: Object.keys(resources).length,
  checks_total: checks.length,
  checks_failed: failed.length,
  failed_checks: failed,
  recommended_next_step: failed.length === 0
    ? "Keep MCP/tool-registry as private draft/local adapter. Next decision: owner-supervised choice between building a hosted MCP endpoint or keeping local adapter and preparing unpublished registry metadata."
    : "Fix failed MCP/agent-registry rehearsal checks before considering hosted MCP, external registry submission or broader machine discovery.",
  interpretation: failed.length === 0
    ? "A machine can discover the MCP manifest, registry draft, local adapter and evidence chain. The current channel is usable for private machine rehearsal, but it is intentionally not a live hosted MCP product and not monetized."
    : "The MCP/agent-registry channel is not yet clean enough for machine-facing rehearsal.",
  resources: Object.fromEntries(Object.entries(resources).map(([name, resource]) => [name, {
    url: resource.url,
    status: resource.status,
    ok: resource.ok,
    json_ok: resource.json_ok,
    bytes: resource.bytes,
    marker_checks: resource.marker_checks,
    hard_fails: resource.hard_fails
  }])),
  checks
};

const report = `# MCP Agent Registry Draft Rehearsal NoWrite Probe

Evidence date: 2026-06-11

## Result

- Status: ${summary.status}
- OK: ${summary.ok}
- Mode: ${summary.mode}
- Primary customer interface: ${summary.primary_customer_interface}
- Channels checked: ${summary.channels_checked.join(", ")}
- Resources checked: ${summary.resources_checked}
- Checks failed: ${summary.checks_failed}/${summary.checks_total}

## What Was Tested

This probe tested whether a machine can read the MachineSignal MCP and agent-registry assets without any irreversible action.

It checked:

- MCP/tool-registry private draft pack
- MCP/tool-registry NoWrite review
- Registry checklist and owner-approval gate
- Public MCP manifest and .well-known MCP manifest
- Local stdio MCP adapter evidence
- GitHub raw adapter files
- API marketplace and Postman NoWrite rehearsal dependencies
- Distribution monitor status

## Safety Result

- Write calls executed by this probe: 0
- POST calls executed by this probe: 0
- Hosted MCP live: false
- Hosted MCP endpoint published: false
- External publication executed: false
- Live monetization enabled: false
- Public paid plans enabled: false
- Real payment executed: false
- Real invoice issued: false
- Human outreach executed: false
- Production API key published: false

## Machine Interpretation

${summary.interpretation}

## Recommended Next Step

${summary.recommended_next_step}

## Failed Checks

${failed.length === 0 ? "None." : failed.map((check) => `- ${check.name}: ${check.details}`).join("\n")}

## Checked Resources

${Object.entries(summary.resources).map(([name, resource]) => `- ${name}: ${resource.url} (HTTP ${resource.status}, ok=${resource.ok}, json=${resource.json_ok})`).join("\n")}
`;

fs.writeFileSync(OUTPUT_SUMMARY, `${JSON.stringify(summary, null, 2)}\n`);
fs.writeFileSync(OUTPUT_REPORT, report);

if (!summary.ok) {
  console.error(JSON.stringify(summary, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({
  status: summary.status,
  ok: summary.ok,
  resources_checked: summary.resources_checked,
  checks_total: summary.checks_total,
  checks_failed: summary.checks_failed,
  output_summary: OUTPUT_SUMMARY,
  output_report: OUTPUT_REPORT
}, null, 2));
