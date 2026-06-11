import fs from "node:fs";

const PUBLIC_SITE = "https://machinesignal.it";
const OUTPUT_JSON = "machine_distribution_readiness_nowrite_probe_summary_20260611.json";
const OUTPUT_MD = "machine_distribution_readiness_nowrite_probe_report_20260611.md";

const resources = {};
const checks = [];

function addCheck(name, ok, details = "") {
  checks.push({ name, ok: Boolean(ok), details });
}

function hasText(text, needle) {
  return typeof text === "string" && text.includes(needle);
}

function getPath(value, path, fallback = undefined) {
  let current = value;
  for (const key of path) {
    if (!current || typeof current !== "object" || !(key in current)) return fallback;
    current = current[key];
  }
  return current ?? fallback;
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
        "User-Agent": "MachineSignal-Distribution-Readiness-NoWrite-Probe/2026-06-11",
        Accept: "application/json,text/plain,text/html,application/xml,*/*"
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

function summarizeOpenApi(openapi) {
  const paths = openapi.paths || {};
  const requiredPaths = [
    "/v1/sandbox/customers",
    "/v1/lead-opportunity-score",
    "/v1/purchase-intent",
    "/v1/orders",
    "/v1/usage"
  ];
  for (const path of requiredPaths) {
    addCheck(`openapi_exposes_${path}`, Boolean(paths[path]), Boolean(paths[path]) ? "present" : "missing");
  }
  const purchaseDescription = JSON.stringify(paths["/v1/purchase-intent"] || {});
  addCheck(
    "openapi_documents_idempotency",
    hasText(JSON.stringify(openapi), "Idempotency-Key"),
    "OpenAPI mentions Idempotency-Key"
  );
  addCheck(
    "openapi_documents_gate_errors",
    hasText(purchaseDescription, "deep_analysis_verification_gate_failed") &&
      hasText(purchaseDescription, "action_pack_gate_failed"),
    "purchase-intent docs mention Deep Analysis and Action Pack gate errors"
  );
}

function summarizePostman(collection) {
  const items = Array.isArray(collection.item) ? collection.item : [];
  const names = items.map((item) => item.name);
  const requiredNames = [
    "Create limited sandbox customer",
    "Score business domain",
    "Create beta purchase intent",
    "Order deep analysis after a strong score",
    "Order action pack after confirmed opportunity",
    "Repeat same score without double charge"
  ];
  for (const name of requiredNames) {
    addCheck(`postman_includes_${name}`, names.includes(name), names.includes(name) ? "present" : "missing");
  }
  return { total_items: items.length, required_present: requiredNames.filter((name) => names.includes(name)) };
}

function summarizeManifest(manifest) {
  const tools = Array.isArray(manifest.tools) ? manifest.tools : [];
  const byName = new Map(tools.map((tool) => [tool.name, tool]));
  const requiredTools = [
    "get_product_catalog",
    "get_machine_onboarding",
    "get_machine_api_sandbox_test",
    "score_lead_opportunity",
    "create_purchase_intent",
    "get_usage",
    "get_order"
  ];
  for (const name of requiredTools) {
    addCheck(`mcp_manifest_exposes_${name}`, byName.has(name), byName.has(name) ? "present" : "missing");
  }
  const postTools = tools.filter((tool) => tool.method === "POST");
  const readTools = tools.filter((tool) => tool.method === "GET" && tool.auth === "none");
  addCheck("mcp_manifest_has_public_read_tools", readTools.length >= 15, `${readTools.length} public no-auth GET tools`);
  addCheck("mcp_manifest_classifies_post_tools", postTools.length >= 4, `${postTools.length} POST tools`);
  return { total_tools: tools.length, public_read_tools: readTools.length, post_tools: postTools.length };
}

function summarizeChannels(channelShortlist) {
  const channels = Array.isArray(channelShortlist.channels) ? channelShortlist.channels : [];
  const highFit = channels.filter((channel) => String(channel.fit || "").includes("high"));
  const ownDomain = channels.find((channel) => channel.name === "Own domain machine surfaces");
  const github = channels.find((channel) => channel.name === "GitHub repository");
  const postman = channels.find((channel) => channel.name === "Postman Public API Network");
  const mcpChannels = channels.filter((channel) => String(channel.name || "").toLowerCase().includes("mcp"));

  addCheck("channel_shortlist_has_own_domain", Boolean(ownDomain), ownDomain?.status || "missing");
  addCheck("channel_shortlist_has_github", Boolean(github), github?.status || "missing");
  addCheck("channel_shortlist_has_postman", Boolean(postman), postman?.status || "missing");
  addCheck("channel_shortlist_has_mcp_channels", mcpChannels.length >= 2, `${mcpChannels.length} MCP-related channels`);
  addCheck("channel_shortlist_machine_first_rule", channelShortlist.primary_rule?.includes("Do not rely on human cold email"), channelShortlist.primary_rule || "");

  return {
    total_channels: channels.length,
    high_fit_channels: highFit.map((channel) => channel.name),
    next_ready_channels: channels.filter((channel) => String(channel.status || "").includes("ready")).map((channel) => channel.name)
  };
}

function buildReport(summary) {
  const resourceRows = summary.resources
    .map((resource) => `| ${resource.name} | ${resource.http_status} | ${resource.bytes} | ${resource.json_valid} | ${resource.ok ? "OK" : "FAIL"} |`)
    .join("\n");
  const checkRows = summary.checks
    .map((check) => `| ${check.name} | ${check.ok ? "OK" : "FAIL"} | ${String(check.details || "").replace(/\|/g, "\\|")} |`)
    .join("\n");

  return `# MachineSignal - Machine Distribution Readiness NoWrite Probe - 2026-06-11

## Result

Status: ${summary.status}

OK: ${summary.ok}

Mode: ${summary.mode}

Write calls executed: ${summary.write_calls_executed}

POST calls executed: ${summary.post_calls_executed}

Real payment executed: ${summary.safety.real_payment_executed}

External contact executed: ${summary.safety.external_contact_executed}

Human outreach executed: ${summary.safety.human_outreach_executed}

## What This Simulates

A machine starts from public discovery channels rather than from an email or a human sales conversation. It reads robots.txt, llms.txt, well-known machine discovery, OpenAPI, Postman collection, MCP manifest, distribution channel shortlist and current evidence probes. It decides whether the product is technically discoverable and safe to evaluate without creating records, sending messages, enabling payment or publishing anything externally.

## Machine Decision

Decision: ${summary.machine_decision.decision}

Recommended next step: ${summary.machine_decision.recommended_next_step}

## Channel Summary

- Total channels: \`${summary.channel_summary.total_channels}\`
- High-fit channels: \`${summary.channel_summary.high_fit_channels.join(", ")}\`
- Ready/metadata-ready channels: \`${summary.channel_summary.next_ready_channels.join(", ")}\`

## Tool/API Summary

- OpenAPI required paths present: \`${summary.openapi_summary.required_paths_present.join(", ")}\`
- Postman required examples present: \`${summary.postman_summary.required_present.join(", ")}\`
- MCP total tools: \`${summary.mcp_manifest_summary.total_tools}\`
- MCP public read tools: \`${summary.mcp_manifest_summary.public_read_tools}\`
- MCP POST tools classified: \`${summary.mcp_manifest_summary.post_tools}\`

## Resources

| Resource | HTTP | Bytes | JSON | Result |
|---|---:|---:|---|---|
${resourceRows}

## Checks

| Check | Result | Details |
|---|---|---|
${checkRows}

## Interpretation

MachineSignal is discoverable through owned machine-readable surfaces and versioned public artifacts. The current safe distribution posture is sandbox/private-draft/NoWrite: machines can inspect docs, manifests, examples, probes and channel copy, but this probe does not create customers, score targets, purchase products, publish to external marketplaces, contact humans or enable live monetization.
`;
}

async function main() {
  const generatedAt = new Date().toISOString();

  await fetchResource("robots_txt", `${PUBLIC_SITE}/robots.txt`, {
    json: false,
    markers: ["Mcp-full-chain-idempotency-probe-json", "Sitemap:"]
  });
  await fetchResource("llms_txt", `${PUBLIC_SITE}/llms.txt`, {
    json: false,
    markers: ["MCP Full Chain Idempotency Probe JSON", "Idempotency-Key", ".well-known/machine-discovery.json"]
  });
  await fetchResource("sitemap_xml", `${PUBLIC_SITE}/sitemap.xml`, {
    json: false,
    markers: ["mcp_full_chain_idempotency_probe_summary_20260611.json", "openapi.json"]
  });

  const machineDiscovery = await fetchResource("well_known_machine_discovery", `${PUBLIC_SITE}/.well-known/machine-discovery.json`, {
    markers: ["primary_customer_interface", "mcp_full_chain_idempotency_probe_json"]
  });
  const discovery = machineDiscovery.body?.discovery || {};

  addCheck(
    "machine_discovery_primary_customer_interface",
    machineDiscovery.body?.primary_customer_interface === "machine",
    `primary_customer_interface=${machineDiscovery.body?.primary_customer_interface}`
  );
  addCheck(
    "machine_discovery_base_url_present",
    typeof machineDiscovery.body?.base_url === "string" && machineDiscovery.body.base_url.startsWith("https://"),
    `base_url=${machineDiscovery.body?.base_url}`
  );

  const resourcePlan = [
    ["product_catalog", discovery.product_catalog, ["target_discovery", "action_pack"]],
    ["machine_onboarding", discovery.machine_onboarding, ["primary_customer_interface", "machine"]],
    ["openapi", discovery.openapi, ["/v1/lead-opportunity-score", "Idempotency-Key"]],
    ["postman_public_collection", "https://machinesignal.it/postman_public_collection.json", ["Repeat same score without double charge"]],
    ["mcp_tool_manifest", discovery.mcp_tool_manifest, ["create_purchase_intent", "get_usage"]],
    ["well_known_mcp_tool_manifest", discovery.well_known_mcp_tool_manifest, ["create_purchase_intent", "get_order"]],
    ["mcp_wrapper_pack", discovery.mcp_wrapper_pack, ["local_stdio_adapter"]],
    ["channel_shortlist", `${PUBLIC_SITE}/distribution/channel-shortlist.json`, ["Do not rely on human cold email"]],
    ["api_directory_submission", `${PUBLIC_SITE}/distribution/api-directory-submission.json`, ["latest_machine_buyer_evidence"]],
    ["rapidapi_listing", `${PUBLIC_SITE}/distribution/rapidapi-listing.json`, ["rapidapi_style_provider_metadata_ready_monetization_disabled"]],
    ["postman_workspace_draft", `${PUBLIC_SITE}/distribution/postman-public-workspace-draft.json`, ["ready_for_private_or_team_workspace_setup_public_visibility_blocked_until_owner_approval"]],
    ["full_chain_idempotency_probe", `${PUBLIC_SITE}/mcp_full_chain_idempotency_probe_summary_20260611.json`, ["completed_mcp_full_chain_idempotency_probe"]],
    ["action_pack_gate_probe", `${PUBLIC_SITE}/mcp_action_pack_deep_analysis_gate_probe_summary_20260610.json`, ["completed_mcp_action_pack_deep_analysis_gate_probe"]],
    ["distribution_monitor", discovery.distribution_readiness_monitor_json || `${PUBLIC_SITE}/distribution_readiness_monitor_summary_20260607.json`, ["ready_for_distribution_review"]]
  ];

  for (const [name, url, markers] of resourcePlan) {
    addCheck(`discovery_link_${name}`, typeof url === "string" && url.startsWith("https://"), String(url || ""));
    if (typeof url === "string" && url.startsWith("https://")) {
      await fetchResource(name, url, { markers });
    }
  }

  const openapi = resources.openapi?.body || {};
  const postman = resources.postman_public_collection?.body || {};
  const manifest = resources.mcp_tool_manifest?.body || {};
  const channelShortlist = resources.channel_shortlist?.body || {};
  const idempotencyProbe = resources.full_chain_idempotency_probe?.body || {};
  const actionPackProbe = resources.action_pack_gate_probe?.body || {};
  const distributionMonitor = resources.distribution_monitor?.body || {};
  const rapidapiListing = resources.rapidapi_listing?.body || {};
  const postmanWorkspaceDraft = resources.postman_workspace_draft?.body || {};

  summarizeOpenApi(openapi);
  const requiredPathsPresent = [
    "/v1/sandbox/customers",
    "/v1/lead-opportunity-score",
    "/v1/purchase-intent",
    "/v1/orders",
    "/v1/usage"
  ].filter((path) => Boolean(openapi.paths?.[path]));
  const postmanSummary = summarizePostman(postman);
  const mcpManifestSummary = summarizeManifest(manifest);
  const channelSummary = summarizeChannels(channelShortlist);

  addCheck(
    "idempotency_probe_current_ok",
    idempotencyProbe.ok === true &&
      idempotencyProbe.score_duplicate_detected === true &&
      idempotencyProbe.deep_analysis_duplicate_detected === true &&
      idempotencyProbe.action_pack_duplicate_detected === true,
    `ok=${idempotencyProbe.ok}; score_dup=${idempotencyProbe.score_duplicate_detected}; deep_dup=${idempotencyProbe.deep_analysis_duplicate_detected}; action_dup=${idempotencyProbe.action_pack_duplicate_detected}`
  );
  addCheck(
    "action_pack_gate_probe_current_ok",
    actionPackProbe.ok === true &&
      actionPackProbe.blocked_action_pack_error === "action_pack_gate_failed" &&
      actionPackProbe.action_pack_gate_passed === true,
    `ok=${actionPackProbe.ok}; blocked=${actionPackProbe.blocked_action_pack_error}; gate=${actionPackProbe.action_pack_gate_passed}`
  );
  addCheck(
    "distribution_monitor_current_ok",
    distributionMonitor.ok === true && Number(distributionMonitor.checks_failed || 0) === 0,
    `ok=${distributionMonitor.ok}; failed=${distributionMonitor.checks_failed}`
  );
  addCheck(
    "rapidapi_listing_monetization_disabled",
    hasText(JSON.stringify(rapidapiListing), "rapidapi_style_provider_metadata_ready_monetization_disabled") &&
      !hasText(JSON.stringify(rapidapiListing), "sk_live"),
    "RapidAPI-style listing is metadata-ready and does not expose live monetization secrets"
  );
  addCheck(
    "postman_workspace_public_visibility_blocked_until_owner_approval",
    hasText(JSON.stringify(postmanWorkspaceDraft), "public_visibility_blocked_until_owner_approval"),
    "Postman workspace draft remains owner-supervised"
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

  const summary = {
    artifact: "machine_distribution_readiness_nowrite_probe",
    generated_at: generatedAt,
    public_site: PUBLIC_SITE,
    status: "completed_machine_distribution_readiness_nowrite_probe",
    ok: checks.every((check) => check.ok),
    mode: "NoWriteMachineDistributionReadinessProbe",
    primary_customer_interface: machineDiscovery.body?.primary_customer_interface,
    machine_customer_mode: "machine_discovers_and_evaluates_public_distribution_surfaces_without_write_calls",
    write_calls_executed: 0,
    post_calls_executed: 0,
    real_payment_executed: false,
    external_contact_executed: false,
    human_outreach_executed: false,
    external_publication_executed: false,
    safety: {
      real_payment_executed: false,
      real_invoice_issued: false,
      external_contact_executed: false,
      human_outreach_executed: false,
      external_publication_executed: false,
      production_api_key_published: false,
      live_monetization_enabled: false
    },
    machine_decision: {
      decision: checks.every((check) => check.ok)
        ? "machine_distribution_surfaces_ready_for_owner_supervised_channel_work"
        : "machine_distribution_surfaces_need_fix_before_channel_work",
      recommended_next_step: checks.every((check) => check.ok)
        ? "Prepare owner-supervised Postman/RapidAPI/private registry publication rehearsal without enabling paid plans or contacting humans."
        : "Fix failed distribution discovery checks before any channel rehearsal."
    },
    channel_summary: channelSummary,
    openapi_summary: { required_paths_present: requiredPathsPresent },
    postman_summary: postmanSummary,
    mcp_manifest_summary: mcpManifestSummary,
    current_evidence: {
      full_chain_idempotency_probe: `${PUBLIC_SITE}/mcp_full_chain_idempotency_probe_summary_20260611.json`,
      action_pack_gate_probe: `${PUBLIC_SITE}/mcp_action_pack_deep_analysis_gate_probe_summary_20260610.json`,
      distribution_monitor: discovery.distribution_readiness_monitor_json || `${PUBLIC_SITE}/distribution_readiness_monitor_summary_20260607.json`
    },
    resources: resourceSummaries,
    checks,
    source_note: "No POST, write, payment, publication, production key or outreach action was executed."
  };

  fs.writeFileSync(OUTPUT_JSON, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
  fs.writeFileSync(OUTPUT_MD, buildReport(summary), "utf8");
  console.log(JSON.stringify(summary, null, 2));
  process.exitCode = summary.ok ? 0 : 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
