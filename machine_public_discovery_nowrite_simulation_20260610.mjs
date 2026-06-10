import fs from "node:fs";

const PUBLIC_SITE = "https://machinesignal.it";
const OUTPUT_JSON = "machine_public_discovery_nowrite_simulation_summary_20260610.json";
const OUTPUT_MD = "machine_public_discovery_nowrite_simulation_report_20260610.md";

const resources = {};
const checks = [];

function addCheck(name, ok, details = "") {
  checks.push({ name, ok: Boolean(ok), details });
}

function getPath(value, path, fallback = undefined) {
  let cur = value;
  for (const part of path) {
    if (!cur || typeof cur !== "object" || !(part in cur)) return fallback;
    cur = cur[part];
  }
  return cur ?? fallback;
}

function hasText(text, needle) {
  return typeof text === "string" && text.includes(needle);
}

function strictSecretScan(text) {
  const patterns = [
    /ghp_[A-Za-z0-9_]{20,}/,
    /github_pat_[A-Za-z0-9_]{20,}/,
    /sk_live_[A-Za-z0-9]{20,}/,
    /AKIA[0-9A-Z]{16}/,
    /-----BEGIN (RSA |EC |OPENSSH |)PRIVATE KEY-----/,
    /msig_live_[A-Za-z0-9_-]{12,}/,
    /cf_[A-Za-z0-9_-]{30,}/
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
        "User-Agent": "MachineSignal-NoWrite-Machine-Discovery-Simulation/2026-06-10"
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
      result.marker_checks.every((item) => item.ok);
  } catch (error) {
    result.error = error.message;
  } finally {
    result.elapsed_ms = Date.now() - started;
  }
  resources[name] = result;
  addCheck(
    `${name}_reachable`,
    result.ok,
    `HTTP ${result.http_status}; bytes=${result.bytes}; json=${result.json_valid}; secrets=${result.secret_hits.length}`
  );
  return result;
}

function summarizeTools(manifest) {
  const tools = Array.isArray(manifest.tools) ? manifest.tools : [];
  const byName = new Map(tools.map((tool) => [tool.name, tool]));
  const noAuthReadTools = tools.filter((tool) => tool.method === "GET" && tool.auth === "none").map((tool) => tool.name);
  const postTools = tools.filter((tool) => tool.method === "POST").map((tool) => ({
    name: tool.name,
    auth: tool.auth,
    url: tool.url
  }));
  const required = [
    "get_product_catalog",
    "get_machine_onboarding",
    "get_machine_api_sandbox_test",
    "get_mcp_tool_registry_private_draft_pack",
    "get_mcp_tool_registry_private_draft_review"
  ];
  for (const name of required) {
    addCheck(`manifest_exposes_${name}`, byName.has(name), byName.has(name) ? "present" : "missing");
  }
  addCheck("manifest_has_readable_public_tools", noAuthReadTools.length >= 8, `${noAuthReadTools.length} public GET tools`);
  addCheck("manifest_post_tools_classified", postTools.length >= 3, `${postTools.length} POST tools classified`);
  return { total: tools.length, no_auth_read_tools: noAuthReadTools, post_tools: postTools, required_present: required.filter((name) => byName.has(name)) };
}

function buildReport(summary) {
  const checkRows = summary.checks
    .map((check) => `| ${check.name} | ${check.ok ? "OK" : "FAIL"} | ${String(check.details || "").replace(/\|/g, "\\|")} |`)
    .join("\n");
  const resourceRows = summary.resources
    .map((resource) => `| ${resource.name} | ${resource.http_status} | ${resource.bytes} | ${resource.json_valid} | ${resource.ok ? "OK" : "FAIL"} |`)
    .join("\n");

  return `# MachineSignal - Public Machine Discovery NoWrite Simulation - 2026-06-10

## Result

Status: ${summary.status}

OK: ${summary.ok}

Mode: ${summary.mode}

Write calls executed: ${summary.write_calls_executed}

POST calls executed: ${summary.post_calls_executed}

Real payment executed: ${summary.safety.real_payment_executed}

External contact executed: ${summary.safety.external_contact_executed}

Hosted MCP live: ${summary.safety.hosted_mcp_live}

## What This Simulates

A software client, CRM workflow or AI agent starts from public MachineSignal discovery surfaces. It reads llms.txt, .well-known/machine-discovery.json, the MCP tool manifest and the private MCP/tool-registry draft pack. It verifies that MachineSignal is machine-first, local-adapter-first, sandbox/private-draft only and safe to evaluate without sending email to humans or executing payments.

## Machine Decision Path

1. Read public machine discovery resources.
2. Confirm the customer interface is machine-first.
3. Confirm public hosted MCP is not live.
4. Confirm the local stdio adapter is the current MCP path.
5. Confirm the private tool-registry pack exists.
6. Confirm NoWrite reviews and distribution monitor are OK.
7. Stop before sandbox creation, purchase intent, checkout, external publication or outreach.

## Resources

| Resource | HTTP | Bytes | JSON | Result |
|---|---:|---:|---|---|
${resourceRows}

## Checks

| Check | Result | Details |
|---|---|---|
${checkRows}

## Tool Discovery Summary

- Total manifest tools: \`${summary.tool_discovery.total}\`
- Public no-auth GET tools: \`${summary.tool_discovery.no_auth_read_tools.length}\`
- POST tools classified but not executed: \`${summary.tool_discovery.post_tools.length}\`
- Required MCP/private-draft tools present: \`${summary.tool_discovery.required_present.join(", ")}\`

## Interpretation

The public surfaces are sufficient for a machine to discover MachineSignal, understand the current MCP/local-adapter path, find product and onboarding materials, and stop safely before any action that would create records, spend budget, publish externally, contact humans or enable monetization.

This is a NoWrite proof. It complements the earlier sandbox buyer tests by validating technical discoverability without consuming Cloudflare KV write quota.
`;
}

async function main() {
  const generatedAt = new Date().toISOString();

  const llms = await fetchResource("llms_txt", `${PUBLIC_SITE}/llms.txt`, {
    json: false,
    markers: [".well-known/machine-discovery.json", "mcp_tool_registry_private_draft_pack_20260608.json"]
  });

  const machineDiscovery = await fetchResource("machine_discovery", `${PUBLIC_SITE}/.well-known/machine-discovery.json`, {
    markers: ["primary_customer_interface", "mcp_tool_registry_private_draft_pack_json"]
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
    ["product_catalog", discovery.product_catalog, ["target_discovery"]],
    ["machine_onboarding", discovery.machine_onboarding, ["primary_customer_interface"]],
    ["openapi", discovery.openapi, ["/v1/lead-opportunity-score"]],
    ["postman_collection", discovery.postman_collection, ["lead-opportunity-score"]],
    ["mcp_tool_manifest", discovery.mcp_tool_manifest, ["get_mcp_tool_registry_private_draft_pack"]],
    ["well_known_mcp_tool_manifest", discovery.well_known_mcp_tool_manifest, ["get_mcp_tool_registry_private_draft_review"]],
    ["mcp_wrapper_pack", discovery.mcp_wrapper_pack, ["local_stdio_adapter"]],
    ["mcp_installation_pack", discovery.mcp_machine_client_installation_pack, ["machinesignal_mcp_server.py"]],
    ["mcp_private_draft_pack", discovery.mcp_tool_registry_private_draft_pack_json, ["ready_for_mcp_tool_registry_private_draft_only"]],
    ["mcp_private_draft_review", discovery.mcp_tool_registry_private_draft_review_json, ["completed_mcp_tool_registry_private_draft_review"]],
    ["external_submission_nowrite_review", discovery.external_submission_pack_no_write_review_json, ["completed_external_submission_pack_no_write_review"]],
    ["distribution_readiness_monitor", discovery.distribution_readiness_monitor_json, ["ready_for_distribution_review"]]
  ];

  for (const [name, url, markers] of resourcePlan) {
    addCheck(`discovery_link_${name}`, typeof url === "string" && url.startsWith("https://"), String(url || ""));
    if (typeof url === "string" && url.startsWith("https://")) {
      await fetchResource(name, url, { markers });
    }
  }

  const manifest = resources.mcp_tool_manifest?.body || {};
  const wrapper = resources.mcp_wrapper_pack?.body || {};
  const privateDraft = resources.mcp_private_draft_pack?.body || {};
  const privateReview = resources.mcp_private_draft_review?.body || {};
  const externalReview = resources.external_submission_nowrite_review?.body || {};
  const distributionMonitor = resources.distribution_readiness_monitor?.body || {};

  const toolDiscovery = summarizeTools(manifest);
  const publicMcpLive = getPath(manifest, ["mcp_compatibility", "public_mcp_server_live"], null);
  const hostedMcpLive = privateDraft?.draft_safety_state?.hosted_mcp_live ?? privateReview?.hosted_mcp_live ?? null;

  addCheck("mcp_public_server_not_live", publicMcpLive === false, `public_mcp_server_live=${publicMcpLive}`);
  addCheck(
    "mcp_wrapper_local_adapter_available",
    hasText(JSON.stringify(wrapper), "local_stdio_adapter"),
    "wrapper mentions local stdio adapter"
  );
  addCheck(
    "private_draft_status_valid",
    privateDraft?.status === "ready_for_mcp_tool_registry_private_draft_only",
    `status=${privateDraft?.status}`
  );
  addCheck(
    "private_draft_review_ok",
    privateReview?.ok === true && privateReview?.write_calls_executed === 0 && privateReview?.post_calls_executed === 0,
    `ok=${privateReview?.ok}; writes=${privateReview?.write_calls_executed}; posts=${privateReview?.post_calls_executed}`
  );
  addCheck(
    "external_nowrite_review_ok",
    externalReview?.ok === true && externalReview?.write_calls_executed === 0 && externalReview?.post_calls_executed === 0,
    `ok=${externalReview?.ok}; writes=${externalReview?.write_calls_executed}; posts=${externalReview?.post_calls_executed}`
  );
  addCheck(
    "distribution_monitor_ok",
    distributionMonitor?.ok === true && distributionMonitor?.checks_failed === 0,
    `ok=${distributionMonitor?.ok}; failed=${distributionMonitor?.checks_failed}`
  );

  const draftSafety = privateDraft?.draft_safety_state || {};
  const safetyChecks = {
    external_publication_executed: false,
    irreversible_submission_executed: false,
    live_monetization_enabled: false,
    public_paid_plans_enabled: false,
    hosted_mcp_live: false,
    hosted_mcp_endpoint_published: false,
    real_payment_executed: false,
    real_invoice_issued: false,
    external_contact_executed: false,
    production_api_key_published: false,
    human_outreach_allowed: false
  };
  for (const [field, expected] of Object.entries(safetyChecks)) {
    addCheck(`draft_safety_${field}`, draftSafety[field] === expected, `${field}=${draftSafety[field]}`);
  }
  addCheck("draft_safety_writes_zero", draftSafety.write_calls_executed === 0, `write_calls=${draftSafety.write_calls_executed}`);
  addCheck("draft_safety_posts_zero", draftSafety.post_calls_executed === 0, `post_calls=${draftSafety.post_calls_executed}`);

  const publicResources = Object.values(resources).map((resource) => ({
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
    artifact: "machine_public_discovery_nowrite_simulation",
    generated_at: generatedAt,
    public_site: PUBLIC_SITE,
    status: "completed_machine_public_discovery_nowrite",
    ok: checks.every((check) => check.ok),
    mode: "NoWriteMachineDiscoverySimulation",
    primary_customer_interface: machineDiscovery.body?.primary_customer_interface,
    machine_customer_mode: "machine_discovers_public_surfaces_without_write_calls",
    write_calls_executed: 0,
    post_calls_executed: 0,
    real_payment_executed: false,
    external_contact_executed: false,
    hosted_mcp_live: hostedMcpLive === true,
    safety: {
      real_payment_executed: false,
      real_invoice_issued: false,
      external_contact_executed: false,
      hosted_mcp_live: hostedMcpLive === true,
      external_publication_executed: false,
      production_api_key_published: false,
      human_outreach_executed: false
    },
    discovery_links_used: {
      machine_discovery: `${PUBLIC_SITE}/.well-known/machine-discovery.json`,
      llms: `${PUBLIC_SITE}/llms.txt`,
      mcp_tool_manifest: discovery.mcp_tool_manifest,
      mcp_private_draft_pack: discovery.mcp_tool_registry_private_draft_pack_json,
      mcp_private_draft_review: discovery.mcp_tool_registry_private_draft_review_json
    },
    tool_discovery: toolDiscovery,
    machine_decision: {
      decision: checks.every((check) => check.ok) ? "public_machine_discovery_ready_for_nowrite_review" : "public_machine_discovery_needs_fix",
      recommended_next_step: checks.every((check) => check.ok)
        ? "Use this as evidence that machine-facing discovery works without writes. Next bounded step is a local MCP adapter NoWrite install validation."
        : "Fix failed discovery checks before any further marketplace or registry preparation."
    },
    resources: publicResources,
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
