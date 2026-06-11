import fs from "node:fs";

const PUBLIC_SITE = "https://machinesignal.it";
const OUTPUT_JSON = "machine_channel_rehearsal_nowrite_probe_summary_20260611.json";
const OUTPUT_MD = "machine_channel_rehearsal_nowrite_probe_report_20260611.md";

const resources = {};
const checks = [];

function addCheck(name, ok, details = "") {
  checks.push({ name, ok: Boolean(ok), details });
}

function hasText(value, needle) {
  return typeof value === "string" && value.includes(needle);
}

function asText(value) {
  return JSON.stringify(value ?? {});
}

function strictSecretScan(text) {
  const patterns = [
    /ghp_[A-Za-z0-9_]{20,}/,
    /github_pat_[A-Za-z0-9_]{20,}/,
    /sk_live_[A-Za-z0-9]{20,}/,
    /AKIA[0-9A-Z]{16}/,
    /-----BEGIN (RSA |EC |OPENSSH |)PRIVATE KEY-----/,
    /msig_live_[A-Za-z0-9_-]{12,}/,
    /cf_[A-Za-z0-9_-]{30,}/,
    /ms_cust_[A-Za-z0-9_-]{20,}/
  ];
  return patterns.filter((pattern) => pattern.test(text)).map((pattern) => String(pattern));
}

async function fetchResource(name, url, { json = true, markers = [] } = {}) {
  const started = Date.now();
  const result = {
    name,
    url,
    ok: false,
    http_status: 0,
    bytes: 0,
    json_valid: null,
    elapsed_ms: 0,
    marker_checks: [],
    secret_hits: [],
    error: null,
    body: null,
    text: ""
  };

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "MachineSignal-Channel-Rehearsal-NoWrite-Probe/2026-06-11",
        Accept: "application/json,text/plain,text/html,*/*"
      }
    });
    const text = await response.text();
    result.http_status = response.status;
    result.text = text;
    result.bytes = Buffer.byteLength(text, "utf8");
    result.secret_hits = strictSecretScan(text);
    if (json) {
      try {
        result.body = JSON.parse(text);
        result.json_valid = true;
      } catch (error) {
        result.json_valid = false;
        result.error = `JSON parse failed: ${error.message}`;
      }
    }
    result.marker_checks = markers.map((marker) => ({ marker, ok: hasText(text, marker) }));
    result.ok =
      response.ok &&
      result.secret_hits.length === 0 &&
      (!json || result.json_valid === true) &&
      result.marker_checks.every((marker) => marker.ok);
  } catch (error) {
    result.error = error.message;
  } finally {
    result.elapsed_ms = Date.now() - started;
  }

  resources[name] = result;
  addCheck(
    `${name}_reachable`,
    result.ok,
    `HTTP ${result.http_status}; bytes=${result.bytes}; json=${result.json_valid}; markers=${result.marker_checks.filter((item) => item.ok).length}/${result.marker_checks.length}; secrets=${result.secret_hits.length}`
  );
  return result;
}

function evaluatePostman(postmanDraft, postmanCollection, smoke, secretScan) {
  const env = Array.isArray(postmanDraft.environment_variables) ? postmanDraft.environment_variables : [];
  const apiKey = env.find((item) => item.name === "api_key");
  const gates = Array.isArray(postmanDraft.acceptance_gates_before_public_visibility)
    ? postmanDraft.acceptance_gates_before_public_visibility
    : [];
  const items = Array.isArray(postmanCollection.item) ? postmanCollection.item : [];

  const checksForChannel = [
    ["status_ready_private_or_team", hasText(postmanDraft.status, "ready_for_private_or_team_workspace_setup")],
    ["collection_import_asset_present", hasText(postmanDraft.import_assets?.postman_public_collection, "postman_public_collection.json")],
    ["openapi_import_asset_present", hasText(postmanDraft.import_assets?.openapi, "openapi.json")],
    ["api_key_blank_before_publish", apiKey?.initial_value === "" && apiKey?.type === "secret"],
    ["owner_approval_gate_present", hasText(asText(postmanDraft), "owner_approval")],
    ["collection_has_core_flow", items.some((item) => item.name === "Score business domain") && items.some((item) => item.name === "Repeat same score without double charge")],
    ["smoke_test_ok_or_available", smoke.status === "passed" && smoke.collection?.ok === true],
    ["secret_scan_available", hasText(asText(secretScan), "postman_public_collection") || hasText(asText(secretScan), "secret_scan")],
    ["public_visibility_still_blocked", hasText(asText(postmanDraft.publication_policy), "owner_approval") && postmanDraft.publication_policy?.live_payments_enabled === false],
    ["acceptance_gates_actionable", gates.length >= 5]
  ];

  for (const [name, ok] of checksForChannel) addCheck(`postman_${name}`, ok);

  return {
    channel: "Postman Public API Network",
    fit: "high",
    decision: checksForChannel.every(([, ok]) => ok)
      ? "ready_for_owner_supervised_private_workspace_rehearsal"
      : "needs_fix_before_workspace_rehearsal",
    next_step: "Keep workspace private/team, import the public collection, run final in-Postman secret scan, then ask owner before public visibility.",
    blocked_actions: ["publish public workspace", "publish real API key", "claim live paid checkout"],
    checks_passed: checksForChannel.filter(([, ok]) => ok).length,
    checks_total: checksForChannel.length
  };
}

function evaluateRapidApi(listing, openapi) {
  const products = Array.isArray(listing.products) ? listing.products : [];
  const endpoints = Array.isArray(listing.endpoints) ? listing.endpoints : [];
  const productCodes = products.map((product) => product.product_code);

  const checksForChannel = [
    ["metadata_ready", listing.status === "rapidapi_style_provider_metadata_ready_monetization_disabled"],
    ["base_url_present", hasText(listing.base_url, "https://machinesignal-api.beta-878.workers.dev")],
    ["auth_headers_documented", listing.authentication?.header === "X-API-Key" && listing.authentication?.idempotency_header === "Idempotency-Key"],
    ["core_endpoints_present", endpoints.includes("POST /v1/lead-opportunity-score") && endpoints.includes("POST /v1/purchase-intent")],
    ["products_cover_purchase_ladder", productCodes.includes("target_discovery") && productCodes.includes("deep_analysis") && productCodes.includes("action_pack")],
    ["monetization_disabled", listing.monetization_state?.live_checkout_enabled === false && listing.monetization_state?.owner_approval_required === true],
    ["safety_no_external_contact", listing.safety?.external_contact_executed_by_machinesignal === false && listing.safety?.action_pack_sends_email === false],
    ["openapi_gate_errors_documented", hasText(asText(openapi), "deep_analysis_verification_gate_failed") && hasText(asText(openapi), "action_pack_gate_failed")]
  ];

  for (const [name, ok] of checksForChannel) addCheck(`rapidapi_${name}`, ok);

  return {
    channel: "RapidAPI style marketplace draft",
    fit: "medium_high",
    decision: checksForChannel.every(([, ok]) => ok)
      ? "ready_for_unpublished_provider_draft_rehearsal_monetization_blocked"
      : "needs_fix_before_unpublished_provider_draft",
    next_step: "Prepare provider/listing metadata only; keep paid plans, live checkout and production key distribution disabled.",
    blocked_actions: ["public paid plan", "live checkout", "production key publication"],
    checks_passed: checksForChannel.filter(([, ok]) => ok).length,
    checks_total: checksForChannel.length
  };
}

function evaluateApiDirectory(directoryDraft) {
  const products = Array.isArray(directoryDraft.products) ? directoryDraft.products : [];
  const checksForChannel = [
    ["status_draft_ready", hasText(directoryDraft.status, "sandbox_only_api_directory_draft_ready")],
    ["short_description_present", String(directoryDraft.short_description || "").length > 40],
    ["categories_present", Array.isArray(directoryDraft.categories) && directoryDraft.categories.length >= 5],
    ["keywords_present", Array.isArray(directoryDraft.keywords) && directoryDraft.keywords.length >= 8],
    ["canonical_urls_present", hasText(directoryDraft.urls?.openapi, "openapi.json") && hasText(directoryDraft.urls?.well_known_discovery, ".well-known/machine-discovery.json")],
    ["products_present", products.some((product) => product.product_code === "score_pack_1k") && products.some((product) => product.product_code === "action_pack")],
    ["publication_blocked", directoryDraft.publication_policy?.live_payments_enabled === false && directoryDraft.publication_policy?.human_outreach_allowed === false],
    ["safety_no_external_contact", directoryDraft.safety?.external_contact_executed_by_machinesignal === false]
  ];

  for (const [name, ok] of checksForChannel) addCheck(`api_directory_${name}`, ok);

  return {
    channel: "Generic API directories",
    fit: "medium",
    decision: checksForChannel.every(([, ok]) => ok)
      ? "ready_for_private_or_unsubmitted_directory_draft"
      : "needs_fix_before_directory_draft",
    next_step: "Use the directory draft copy as metadata source only; public submission remains blocked until owner approval.",
    blocked_actions: ["irreversible external submission", "live payment claim", "human outreach"],
    checks_passed: checksForChannel.filter(([, ok]) => ok).length,
    checks_total: checksForChannel.length
  };
}

function evaluateMcpRegistry(manifest, wrapper) {
  const tools = Array.isArray(manifest.tools) ? manifest.tools : [];
  const toolNames = tools.map((tool) => tool.name);
  const checksForChannel = [
    ["tool_manifest_has_many_tools", tools.length >= 25],
    ["core_tools_present", ["get_product_catalog", "score_lead_opportunity", "create_purchase_intent", "get_usage", "get_order"].every((name) => toolNames.includes(name))],
    ["public_read_tools_present", tools.filter((tool) => tool.method === "GET" && tool.auth === "none").length >= 15],
    ["hosted_mcp_not_claimed_live", manifest.publication_policy?.hosted_mcp_live === false && wrapper.mcp_status?.hosted_public_mcp_server_live === false],
    ["local_stdio_adapter_available", wrapper.mcp_status?.local_stdio_adapter_available === true],
    ["registry_submission_blocked", hasText(asText(manifest.publication_policy), "blocked_until_owner_approval")],
    ["wrapper_installation_flow_present", Array.isArray(wrapper.machine_installation_flow) && wrapper.machine_installation_flow.length >= 4],
    ["no_real_keys_publishable", wrapper.external_publication_policy?.real_keys_publishable === false]
  ];

  for (const [name, ok] of checksForChannel) addCheck(`mcp_registry_${name}`, ok);

  return {
    channel: "MCP and agent registries",
    fit: "high_after_mcp",
    decision: checksForChannel.every(([, ok]) => ok)
      ? "ready_for_local_adapter_registry_draft_hosted_mcp_blocked"
      : "needs_fix_before_registry_draft",
    next_step: "Prepare local-adapter registry metadata; decide separately if a hosted MCP endpoint is worth building before public registry submission.",
    blocked_actions: ["claim hosted MCP live", "submit irreversible registry listing", "publish production keys"],
    checks_passed: checksForChannel.filter(([, ok]) => ok).length,
    checks_total: checksForChannel.length
  };
}

function evaluateMarketplacePack(pack, channelDecisions) {
  const sequence = Array.isArray(pack.recommended_sequence) ? pack.recommended_sequence : [];
  const checksForPack = [
    ["sequence_has_postman_first", sequence[0]?.channel === "Postman Public API Network"],
    ["sequence_has_rapidapi", sequence.some((item) => String(item.channel || "").includes("RapidAPI"))],
    ["sequence_has_mcp", sequence.some((item) => String(item.channel || "").includes("MCP"))],
    ["policy_blocks_external_submission", pack.publication_policy?.external_submission_allowed_without_owner_confirmation === false],
    ["policy_blocks_real_payments", pack.publication_policy?.real_payments_allowed === false],
    ["canonical_assets_present", hasText(pack.canonical_public_assets?.openapi, "openapi.json") && hasText(pack.canonical_public_assets?.postman_public_collection, "postman_public_collection.json")],
    ["all_channel_decisions_ready_or_blocked_safely", channelDecisions.every((decision) => !decision.decision.startsWith("needs_fix"))]
  ];

  for (const [name, ok] of checksForPack) addCheck(`marketplace_pack_${name}`, ok);

  return {
    recommended_sequence: sequence.map((item) => ({
      rank: item.rank,
      channel: item.channel,
      status: item.status,
      main_import_asset: item.main_import_asset
    })),
    checks_passed: checksForPack.filter(([, ok]) => ok).length,
    checks_total: checksForPack.length
  };
}

function buildReport(summary) {
  const channelRows = summary.channel_decisions
    .map((channel) => `| ${channel.channel} | ${channel.fit} | ${channel.decision} | ${channel.checks_passed}/${channel.checks_total} | ${channel.next_step.replace(/\|/g, "\\|")} |`)
    .join("\n");
  const resourceRows = summary.resources
    .map((resource) => `| ${resource.name} | ${resource.http_status} | ${resource.bytes} | ${resource.json_valid} | ${resource.ok ? "OK" : "FAIL"} |`)
    .join("\n");
  const checkRows = summary.checks
    .map((check) => `| ${check.name} | ${check.ok ? "OK" : "FAIL"} | ${String(check.details || "").replace(/\|/g, "\\|")} |`)
    .join("\n");

  return `# MachineSignal - Channel Publication Rehearsal NoWrite Probe - 2026-06-11

## Result

Status: ${summary.status}

OK: ${summary.ok}

Mode: ${summary.mode}

Primary customer interface: ${summary.primary_customer_interface}

Write calls executed: ${summary.write_calls_executed}

POST calls executed: ${summary.post_calls_executed}

Real payment executed: ${summary.safety.real_payment_executed}

External publication executed: ${summary.safety.external_publication_executed}

Human outreach executed: ${summary.safety.human_outreach_executed}

## What This Rehearses

A machine evaluates whether MachineSignal is ready to be prepared for external discovery channels: Postman, RapidAPI-style marketplace, generic API directories and MCP/agent registries. The probe reads only public metadata and current evidence. It does not log into third-party platforms, publish listings, enable monetization, send messages, create real API keys or execute payments.

## Machine Decision

Decision: ${summary.machine_decision.decision}

Recommended next step: ${summary.machine_decision.recommended_next_step}

## Channel Decisions

| Channel | Fit | Decision | Checks | Next Step |
|---|---|---|---:|---|
${channelRows}

## Recommended Order

${summary.marketplace_pack_summary.recommended_sequence.map((item) => `${item.rank}. ${item.channel} - ${item.status} - ${item.main_import_asset}`).join("\n")}

## Resources

| Resource | HTTP | Bytes | JSON | Result |
|---|---:|---:|---|---|
${resourceRows}

## Checks

| Check | Result | Details |
|---|---|---|
${checkRows}

## Interpretation

MachineSignal is ready for owner-supervised channel rehearsal. The safest first channel remains Postman because a machine can import examples and run the sandbox path without public paid plans. RapidAPI-style and generic API directory drafts are metadata-ready but monetization and public submission remain blocked. MCP/agent registry material is ready as a local-adapter draft, while hosted MCP claims remain blocked until a separate build decision.
`;
}

async function main() {
  const generatedAt = new Date().toISOString();

  const plan = [
    ["channel_shortlist", `${PUBLIC_SITE}/distribution/channel-shortlist.json`, ["Do not rely on human cold email"]],
    ["postman_workspace_draft", `${PUBLIC_SITE}/distribution/postman-public-workspace-draft.json`, ["public_visibility_blocked_until_owner_approval"]],
    ["rapidapi_listing", `${PUBLIC_SITE}/distribution/rapidapi-listing.json`, ["rapidapi_style_provider_metadata_ready_monetization_disabled"]],
    ["api_directory_submission", `${PUBLIC_SITE}/distribution/api-directory-submission.json`, ["sandbox_only_api_directory_draft_ready_owner_approval_required_for_external_submission"]],
    ["marketplace_submission_pack", `${PUBLIC_SITE}/distribution/marketplace-submission-pack.json`, ["ready_for_sandbox_publication_drafts_with_full_beta_evidence"]],
    ["mcp_tool_manifest", `${PUBLIC_SITE}/mcp-tool-manifest.json`, ["create_purchase_intent"]],
    ["mcp_wrapper_pack", `${PUBLIC_SITE}/mcp/machinesignal-mcp-wrapper.json`, ["local_stdio_adapter_live_public_hosted_mcp_not_live"]],
    ["openapi", `${PUBLIC_SITE}/openapi.json`, ["action_pack_gate_failed"]],
    ["postman_public_collection", `${PUBLIC_SITE}/postman_public_collection.json`, ["Repeat same score without double charge"]],
    ["postman_smoke", `${PUBLIC_SITE}/postman_public_collection_smoke_summary_20260604.json`, ["passed"]],
    ["postman_secret_scan", `${PUBLIC_SITE}/postman_workspace_secret_scan_20260606.json`, ["postman_public_collection.json"]],
    ["distribution_readiness_probe", `${PUBLIC_SITE}/machine_distribution_readiness_nowrite_probe_summary_20260611.json`, ["completed_machine_distribution_readiness_nowrite_probe"]],
    ["distribution_monitor", `${PUBLIC_SITE}/distribution_readiness_monitor_summary_20260607.json`, ["ready_for_distribution_review"]]
  ];

  for (const [name, url, markers] of plan) {
    await fetchResource(name, url, { markers });
  }

  const postmanDecision = evaluatePostman(
    resources.postman_workspace_draft.body || {},
    resources.postman_public_collection.body || {},
    resources.postman_smoke.body || {},
    resources.postman_secret_scan.body || {}
  );
  const rapidapiDecision = evaluateRapidApi(resources.rapidapi_listing.body || {}, resources.openapi.body || {});
  const apiDirectoryDecision = evaluateApiDirectory(resources.api_directory_submission.body || {});
  const mcpDecision = evaluateMcpRegistry(resources.mcp_tool_manifest.body || {}, resources.mcp_wrapper_pack.body || {});
  const channelDecisions = [postmanDecision, rapidapiDecision, apiDirectoryDecision, mcpDecision];
  const marketplacePackSummary = evaluateMarketplacePack(resources.marketplace_submission_pack.body || {}, channelDecisions);

  const shortlist = resources.channel_shortlist.body || {};
  addCheck(
    "channel_shortlist_machine_first_rule",
    hasText(shortlist.primary_rule, "Do not rely on human cold email"),
    shortlist.primary_rule || ""
  );
  addCheck(
    "distribution_readiness_probe_current_ok",
    resources.distribution_readiness_probe.body?.ok === true &&
      resources.distribution_readiness_probe.body?.post_calls_executed === 0 &&
      resources.distribution_readiness_probe.body?.write_calls_executed === 0,
    `ok=${resources.distribution_readiness_probe.body?.ok}; post=${resources.distribution_readiness_probe.body?.post_calls_executed}; write=${resources.distribution_readiness_probe.body?.write_calls_executed}`
  );
  addCheck(
    "distribution_monitor_current_ok",
    resources.distribution_monitor.body?.ok === true && Number(resources.distribution_monitor.body?.checks_failed || 0) === 0,
    `ok=${resources.distribution_monitor.body?.ok}; failed=${resources.distribution_monitor.body?.checks_failed}`
  );
  addCheck("no_write_policy_respected", true, "probe executed only GET requests");

  const resourceSummaries = Object.values(resources).map((resource) => ({
    name: resource.name,
    url: resource.url,
    ok: resource.ok,
    http_status: resource.http_status,
    bytes: resource.bytes,
    json_valid: resource.json_valid,
    elapsed_ms: resource.elapsed_ms,
    markers_ok: resource.marker_checks.every((marker) => marker.ok),
    secret_hits: resource.secret_hits
  }));

  const ok = checks.every((check) => check.ok);
  const summary = {
    artifact: "machine_channel_rehearsal_nowrite_probe",
    generated_at: generatedAt,
    public_site: PUBLIC_SITE,
    status: "completed_machine_channel_rehearsal_nowrite_probe",
    ok,
    mode: "NoWriteChannelPublicationRehearsal",
    primary_customer_interface: "machine",
    machine_customer_mode: "machine_evaluates_channel_publication_drafts_without_third_party_write_actions",
    write_calls_executed: 0,
    post_calls_executed: 0,
    real_payment_executed: false,
    external_contact_executed: false,
    human_outreach_executed: false,
    external_publication_executed: false,
    live_monetization_enabled: false,
    safety: {
      real_payment_executed: false,
      real_invoice_issued: false,
      external_contact_executed: false,
      human_outreach_executed: false,
      external_publication_executed: false,
      production_api_key_published: false,
      live_monetization_enabled: false,
      third_party_login_used: false
    },
    channel_decisions: channelDecisions,
    marketplace_pack_summary: marketplacePackSummary,
    machine_decision: {
      decision: ok
        ? "channels_ready_for_owner_supervised_nowrite_rehearsal"
        : "channels_need_fix_before_owner_supervised_rehearsal",
      recommended_next_step: ok
        ? "Run a private Postman workspace rehearsal first, then prepare unpublished RapidAPI/API-directory/MCP registry drafts; keep monetization and public submission blocked."
        : "Fix failed channel checks before any third-party channel work."
    },
    resources: resourceSummaries,
    checks,
    source_note: "No POST, write, third-party login, publication, payment, production key or outreach action was executed."
  };

  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(summary, null, 2) + "\n");
  fs.writeFileSync(OUTPUT_MD, buildReport(summary));
  console.log(JSON.stringify(summary, null, 2));

  if (!summary.ok) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
