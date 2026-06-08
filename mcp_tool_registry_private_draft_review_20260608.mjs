import fs from "node:fs";

const publicSite = "https://machinesignal.it";
const outputJson = "mcp_tool_registry_private_draft_review_summary_20260608.json";
const outputMarkdown = "mcp_tool_registry_private_draft_review_report_20260608.md";

const resources = [
  {
    name: "mcp_tool_registry_private_draft_pack_json",
    url: `${publicSite}/mcp_tool_registry_private_draft_pack_20260608.json`,
    json: true,
    must: [
      "ready_for_mcp_tool_registry_private_draft_only",
      "mcp_tool_registry_local_adapter_private_draft",
      "prepare_mcp_tool_registry_private_draft_only",
      "stdio_json_rpc_local_adapter"
    ]
  },
  {
    name: "mcp_tool_registry_private_draft_pack_md",
    url: `${publicSite}/mcp_tool_registry_private_draft_pack_20260608.md`,
    json: false,
    must: [
      "MCP Tool Registry Private Draft Pack",
      "Hosted MCP live: false",
      "external_publication_executed=false",
      "Decision: prepare_mcp_tool_registry_private_draft_only"
    ]
  },
  {
    name: "mcp_tool_registry_checklist_json",
    url: `${publicSite}/mcp_tool_registry_draft_checklist_20260607.json`,
    json: true,
    must: [
      "blocked_until_owner_approval",
      "hosted_mcp_live",
      "publish_hosted_mcp_endpoint_as_live",
      "do_not_contact_human_prospects_or_target_companies"
    ]
  },
  {
    name: "mcp_tool_manifest",
    url: `${publicSite}/mcp-tool-manifest.json`,
    json: true,
    must: [
      "mcp_compatibility",
      "public_mcp_server_live",
      "local_adapter",
      "get_mcp_tool_registry_draft_checklist"
    ]
  },
  {
    name: "well_known_mcp_tool_manifest",
    url: `${publicSite}/.well-known/mcp-tool-manifest.json`,
    json: true,
    must: [
      "mcp_compatibility",
      "public_mcp_server_live",
      "local_adapter",
      "get_mcp_tool_registry_draft_checklist"
    ]
  },
  {
    name: "mcp_wrapper_pack",
    url: `${publicSite}/mcp/machinesignal-mcp-wrapper.json`,
    json: true,
    must: [
      "local_stdio_adapter_live_public_hosted_mcp_not_live",
      "mcp_tools_expected",
      "external_publication_policy"
    ]
  },
  {
    name: "mcp_installation_pack",
    url: `${publicSite}/mcp-machine-client-installation-pack.json`,
    json: true,
    must: [
      "mcp",
      "machinesignal_mcp_server.py",
      "stdio"
    ]
  },
  {
    name: "private_draft_submission_rehearsal",
    url: `${publicSite}/private_draft_submission_rehearsal_summary_20260608.json`,
    json: true,
    must: ["completed_private_draft_submission_rehearsal", "mcp_tool_registry_local_adapter_draft"]
  },
  {
    name: "external_submission_nowrite_review",
    url: `${publicSite}/external_submission_pack_no_write_review_summary_20260608.json`,
    json: true,
    must: ["completed_external_submission_pack_no_write_review", "hosted_mcp_live"]
  },
  {
    name: "distribution_readiness_monitor",
    url: `${publicSite}/distribution_readiness_monitor_summary_20260607.json`,
    json: true,
    must: ["ready_for_distribution_review", "checks_failed"]
  }
];

const hardFailPatterns = [
  {
    code: "hosted_mcp_live_true",
    regex: /"hosted_mcp_live"\s*:\s*true|"public_mcp_server_live"\s*:\s*true|"hosted_public_mcp_server_live"\s*:\s*true/i,
    reason: "Hosted MCP must remain not live for this private draft phase."
  },
  {
    code: "external_publication_true",
    regex: /"external_publication_executed"\s*:\s*true|"irreversible_submission_executed"\s*:\s*true/i,
    reason: "MCP/tool-registry private draft must not execute irreversible external publication."
  },
  {
    code: "live_monetization_true",
    regex: /"live_monetization_enabled"\s*:\s*true|"public_paid_plans_enabled"\s*:\s*true|"public_paid_plans_active"\s*:\s*true/i,
    reason: "MCP/tool-registry private draft must not enable paid plans or live monetization."
  },
  {
    code: "real_payment_true",
    regex: /"real_payment_executed"\s*:\s*true/i,
    reason: "MCP/tool-registry private draft must not execute real payments."
  },
  {
    code: "external_contact_true",
    regex: /"external_contact_executed"\s*:\s*true/i,
    reason: "MCP/tool-registry private draft must not contact external targets or humans."
  },
  {
    code: "production_key_exposed",
    regex: /sk_live_[A-Za-z0-9_-]+|"production_api_key"\s*:\s*"[^"]+"|"live_api_key"\s*:\s*"[^"]+"/i,
    reason: "MCP/tool-registry private draft must not expose production keys."
  }
];

const requiredPackPaths = [
  "tool_registry_listing_fields.tool_name",
  "tool_registry_listing_fields.visibility",
  "tool_registry_listing_fields.transport_now",
  "tool_registry_listing_fields.hosted_mcp_live",
  "tool_registry_listing_fields.monetization",
  "tool_registry_listing_fields.tool_manifest",
  "tool_registry_listing_fields.well_known_tool_manifest",
  "tool_registry_listing_fields.wrapper_pack",
  "tool_registry_listing_fields.installation_pack",
  "tool_registry_listing_fields.repository",
  "tool_registry_listing_fields.local_adapter_path",
  "local_adapter_installation_flow",
  "tools_to_expose_in_private_registry_draft",
  "blocked_before_registry_submit",
  "machine_decision.decision"
];

function parseJson(text) {
  try {
    return { ok: true, value: JSON.parse(text), error: null };
  } catch (error) {
    return { ok: false, value: null, error: error.message };
  }
}

function getPath(obj, path) {
  return path.split(".").reduce((acc, key) => {
    if (acc === undefined || acc === null) return undefined;
    return Object.hasOwn(acc, key) ? acc[key] : undefined;
  }, obj);
}

function fieldCheck(obj, path) {
  const value = getPath(obj, path);
  const ok = typeof value === "boolean" ? value === false : Array.isArray(value) ? value.length > 0 : Boolean(value);
  return { path, ok };
}

async function fetchResource(resource) {
  const response = await fetch(resource.url, {
    method: "GET",
    headers: {
      "User-Agent": "MachineSignalMcpToolRegistryPrivateDraftReview/2026-06-08",
      "Accept": "application/json,text/plain,*/*"
    }
  });
  const text = await response.text();
  const json = resource.json ? parseJson(text) : { ok: null, value: null, error: null };
  const marker_checks = resource.must.map((marker) => ({ marker, ok: text.includes(marker) }));
  const hard_fails = hardFailPatterns
    .filter((item) => item.regex.test(text))
    .map((item) => ({ code: item.code, reason: item.reason }));
  return {
    name: resource.name,
    url: resource.url,
    ok: response.ok && (!resource.json || json.ok) && marker_checks.every((item) => item.ok) && hard_fails.length === 0,
    http_status: response.status,
    bytes: text.length,
    json_valid: resource.json ? json.ok : null,
    json_error: resource.json ? json.error : null,
    marker_checks,
    hard_fails,
    text,
    json: json.value
  };
}

function writeReports(summary) {
  fs.writeFileSync(outputJson, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  const resourceRows = summary.resources.map((item) => {
    const missing = item.marker_checks.filter((check) => !check.ok).map((check) => check.marker).join(", ") || "-";
    const hardFails = item.hard_fails.map((fail) => fail.code).join(", ") || "-";
    return `| ${item.name} | ${item.ok ? "OK" : "FAIL"} | ${item.http_status} | ${item.bytes} | ${missing} | ${hardFails} |`;
  }).join("\n");

  const fieldRows = summary.pack_field_checks.map((item) => (
    `| ${item.path} | ${item.ok ? "OK" : "FAIL"} |`
  )).join("\n");

  const safetyRows = summary.safety_checks.map((item) => (
    `| ${item.name} | ${item.ok ? "OK" : "FAIL"} | ${item.details} |`
  )).join("\n");

  const md = `# MachineSignal - MCP Tool Registry Private Draft Review - 2026-06-08

## Result

Status: ${summary.status}

OK: ${summary.ok}

Mode: ${summary.mode}

Primary customer interface: ${summary.primary_customer_interface}

Write calls executed: ${summary.write_calls_executed}

POST calls executed: ${summary.post_calls_executed}

External publication executed: ${summary.external_publication_executed}

Live monetization enabled: ${summary.live_monetization_enabled}

Hosted MCP live: ${summary.hosted_mcp_live}

## What This Checked

This NoWrite review checks whether the MCP/tool-registry private draft pack contains enough exact fields for a private or unsubmitted agent-tool registry draft while keeping all go-live actions blocked.

Machine-first context: the intended reader and buyer interface is a CRM system, AI agent, workflow or other software process.

Implementation state: local stdio adapter first. Hosted public MCP is not live.

Approval gate: irreversible external registry publication remains blocked until owner approval.

Commercial gate: monetization disabled; public paid plans not active; live checkout disabled.

Contact gate: external target contact false; human outbound outreach blocked; do not contact human prospects or target companies.

## Pack Field Checks

| Field | Status |
|---|---|
${fieldRows}

## Safety Checks

| Check | Status | Details |
|---|---|---|
${safetyRows}

## Resource Checks

| Resource | Status | HTTP | Bytes | Missing markers | Hard fails |
|---|---|---:|---:|---|---|
${resourceRows}

## Machine Decision

Decision: ${summary.machine_decision.decision}

Recommended next step: ${summary.machine_decision.recommended_next_step}
`;

  fs.writeFileSync(outputMarkdown, md, "utf8");
}

const startedAt = new Date().toISOString();
const fetchedList = [];
const fetched = new Map();

for (const resource of resources) {
  const result = await fetchResource(resource);
  fetchedList.push(result);
  fetched.set(result.name, result);
}

const pack = fetched.get("mcp_tool_registry_private_draft_pack_json")?.json || {};
const checklist = fetched.get("mcp_tool_registry_checklist_json")?.json || {};
const manifest = fetched.get("mcp_tool_manifest")?.json || {};
const wrapper = fetched.get("mcp_wrapper_pack")?.json || {};
const rehearsal = fetched.get("private_draft_submission_rehearsal")?.json || {};
const noWrite = fetched.get("external_submission_nowrite_review")?.json || {};
const monitor = fetched.get("distribution_readiness_monitor")?.json || {};
const fieldChecks = requiredPackPaths.map((path) => fieldCheck(pack, path));
const allHardFails = fetchedList.flatMap((item) => item.hard_fails.map((fail) => ({ resource: item.name, ...fail })));

const safetyChecks = [
  {
    name: "pack_status_private_draft_only",
    ok: pack.status === "ready_for_mcp_tool_registry_private_draft_only",
    details: `status=${pack.status}`
  },
  {
    name: "machine_customer_interface",
    ok: pack.primary_customer_interface === "machine",
    details: `primary_customer_interface=${pack.primary_customer_interface}`
  },
  {
    name: "mcp_public_server_not_live_in_manifest",
    ok:
      getPath(manifest, "mcp_compatibility.public_mcp_server_live") === false &&
      getPath(manifest, "mcp_compatibility.local_adapter.status") === "available_in_github_repo",
    details: `public_mcp_server_live=${getPath(manifest, "mcp_compatibility.public_mcp_server_live")}, local_adapter_status=${getPath(manifest, "mcp_compatibility.local_adapter.status")}`
  },
  {
    name: "mcp_wrapper_local_adapter_mode",
    ok:
      wrapper.status === "local_stdio_adapter_live_public_hosted_mcp_not_live" &&
      getPath(wrapper, "mcp_status.hosted_public_mcp_server_live") === false,
    details: `status=${wrapper.status}, hosted=${getPath(wrapper, "mcp_status.hosted_public_mcp_server_live")}`
  },
  {
    name: "checklist_blocks_hosted_mcp_and_submission",
    ok:
      checklist.external_submission === "blocked_until_owner_approval" &&
      checklist.hosted_mcp_live === false &&
      checklist.monetization === "disabled",
    details: `submission=${checklist.external_submission}, hosted=${checklist.hosted_mcp_live}, monetization=${checklist.monetization}`
  },
  {
    name: "draft_safety_state_blocks_go_live",
    ok:
      pack.draft_safety_state?.external_publication_executed === false &&
      pack.draft_safety_state?.live_monetization_enabled === false &&
      pack.draft_safety_state?.hosted_mcp_live === false &&
      pack.draft_safety_state?.hosted_mcp_endpoint_published === false &&
      pack.draft_safety_state?.real_payment_executed === false &&
      pack.draft_safety_state?.external_contact_executed === false &&
      pack.draft_safety_state?.production_api_key_published === false,
    details: JSON.stringify(pack.draft_safety_state || {})
  },
  {
    name: "private_draft_rehearsal_ok",
    ok:
      rehearsal.ok === true &&
      rehearsal.external_publication_executed === false &&
      rehearsal.hosted_mcp_live === false &&
      rehearsal.live_monetization_enabled === false,
    details: `ok=${rehearsal.ok}, external_publication=${rehearsal.external_publication_executed}, hosted=${rehearsal.hosted_mcp_live}, monetization=${rehearsal.live_monetization_enabled}`
  },
  {
    name: "external_submission_nowrite_ok",
    ok:
      noWrite.ok === true &&
      noWrite.write_calls_executed === 0 &&
      noWrite.post_calls_executed === 0 &&
      noWrite.hosted_mcp_live === false,
    details: `ok=${noWrite.ok}, writes=${noWrite.write_calls_executed}, posts=${noWrite.post_calls_executed}, hosted=${noWrite.hosted_mcp_live}`
  },
  {
    name: "distribution_monitor_ok",
    ok:
      monitor.ok === true &&
      monitor.checks_failed === 0 &&
      monitor.write_calls_executed === 0 &&
      monitor.post_calls_executed === 0,
    details: `ok=${monitor.ok}, failed=${monitor.checks_failed}, writes=${monitor.write_calls_executed}, posts=${monitor.post_calls_executed}`
  }
];

const ok =
  fetchedList.every((item) => item.ok) &&
  fieldChecks.every((item) => item.ok) &&
  safetyChecks.every((item) => item.ok) &&
  allHardFails.length === 0;

const summary = {
  artifact: "mcp_tool_registry_private_draft_review",
  generated_at: startedAt,
  status: ok ? "completed_mcp_tool_registry_private_draft_review" : "mcp_tool_registry_private_draft_review_needs_fix",
  ok,
  mode: "NoWriteMcpToolRegistryPrivateDraftReview",
  public_site: publicSite,
  primary_customer_interface: "machine",
  safety_copy: {
    machine_customer_language:
      "machine-first customer interface for AI agents, CRM systems and workflow software",
    local_adapter_language:
      "local stdio adapter first; hosted public MCP is not live",
    owner_approval_gate:
      "irreversible external registry publication remains blocked until owner approval",
    monetization_disabled:
      "monetization disabled; public paid plans not active; live checkout disabled",
    human_outreach_blocked:
      "external target contact false; human outbound outreach blocked; do not contact human prospects or target companies"
  },
  write_calls_executed: 0,
  post_calls_executed: 0,
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
  resources_checked: fetchedList.length,
  required_fields_checked: fieldChecks.length,
  pack_field_checks: fieldChecks,
  safety_checks: safetyChecks,
  resources: fetchedList.map(({ text, json, ...rest }) => rest),
  hard_fails: allHardFails,
  machine_decision: {
    decision: ok ? "mcp_tool_registry_private_draft_ready" : "fix_mcp_tool_registry_private_draft_pack",
    recommended_next_step: ok
      ? "Use the pack to prepare owner-supervised private or unsubmitted MCP/tool-registry metadata. Stop before hosted MCP launch, irreversible registry submission, paid plan creation, live checkout, production key distribution or outreach."
      : "Fix failed fields or resources, then rerun the review."
  }
};

writeReports(summary);
console.log(JSON.stringify(summary, null, 2));
