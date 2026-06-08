import fs from "node:fs";

const publicSite = "https://machinesignal.it";
const outputJson = "private_draft_submission_rehearsal_summary_20260608.json";
const outputMarkdown = "private_draft_submission_rehearsal_report_20260608.md";

const resources = [
  {
    name: "machine_discovery",
    url: `${publicSite}/.well-known/machine-discovery.json`,
    json: true,
    must: ["external_draft_submission_bundle_json", "primary_customer_interface"]
  },
  {
    name: "external_draft_submission_bundle",
    url: `${publicSite}/external_draft_submission_bundle_20260608.json`,
    json: true,
    must: [
      "ready_for_private_draft_only",
      "generic_api_directory_private_draft",
      "rapidapi_style_unpublished_provider_draft",
      "mcp_tool_registry_local_adapter_draft"
    ]
  },
  {
    name: "api_directory_submission",
    url: `${publicSite}/distribution/api-directory-submission.json`,
    json: true,
    must: ["latest_machine_buyer_evidence", "machine"]
  },
  {
    name: "rapidapi_listing",
    url: `${publicSite}/distribution/rapidapi-listing.json`,
    json: true,
    must: ["rapidapi_style_provider_metadata_ready_monetization_disabled"]
  },
  {
    name: "mcp_tool_manifest",
    url: `${publicSite}/mcp-tool-manifest.json`,
    json: true,
    must: ["get_external_draft_submission_bundle", "machine"]
  },
  {
    name: "mcp_wrapper",
    url: `${publicSite}/mcp/machinesignal-mcp-wrapper.json`,
    json: true,
    must: ["mcp_tools_expected", "get_external_draft_submission_bundle"]
  },
  {
    name: "postman_workspace_draft",
    url: `${publicSite}/distribution/postman-public-workspace-draft.json`,
    json: true,
    must: ["ready_for_private_or_team_workspace_setup_public_visibility_blocked_until_owner_approval"]
  },
  {
    name: "postman_private_workspace_checklist",
    url: `${publicSite}/postman_private_workspace_checklist_20260607.json`,
    json: true,
    must: ["blocked_actions"]
  },
  {
    name: "openapi",
    url: `${publicSite}/openapi.json`,
    json: true,
    must: ["lead-opportunity-score", "purchase-intent", "orders"]
  },
  {
    name: "machine_onboarding",
    url: `${publicSite}/machine-onboarding.json`,
    json: true,
    must: ["NoWrite", "sandbox"]
  },
  {
    name: "external_submission_nowrite_review",
    url: `${publicSite}/external_submission_pack_no_write_review_summary_20260608.json`,
    json: true,
    must: ["completed_external_submission_pack_no_write_review"]
  },
  {
    name: "distribution_readiness_monitor",
    url: `${publicSite}/distribution_readiness_monitor_summary_20260607.json`,
    json: true,
    must: ["ready_for_distribution_review"]
  }
];

const hardFailPatterns = [
  {
    code: "real_payment_true",
    regex: /"real_payment_executed"\s*:\s*true/i,
    reason: "The rehearsal must not execute or claim real payments."
  },
  {
    code: "external_contact_true",
    regex: /"external_contact_executed"\s*:\s*true/i,
    reason: "The rehearsal must not contact external targets or human prospects."
  },
  {
    code: "real_invoice_true",
    regex: /"real_invoice_issued"\s*:\s*true/i,
    reason: "The rehearsal must not issue real invoices."
  },
  {
    code: "irreversible_publication_true",
    regex: /"external_publication_executed"\s*:\s*true|"irreversible_submission_executed"\s*:\s*true/i,
    reason: "The rehearsal must not submit irreversibly to an external marketplace or registry."
  },
  {
    code: "live_monetization_true",
    regex: /"live_monetization_enabled"\s*:\s*true|"public_paid_plans_enabled"\s*:\s*true|"pricing_plans_public"\s*:\s*true/i,
    reason: "The rehearsal must not enable paid public plans."
  },
  {
    code: "hosted_mcp_live_true",
    regex: /"hosted_mcp_live"\s*:\s*true/i,
    reason: "Hosted MCP must remain not live in this phase."
  },
  {
    code: "production_key_exposed",
    regex: /sk_live_[A-Za-z0-9_-]+|"production_api_key"\s*:\s*"[^"]+"|"live_api_key"\s*:\s*"[^"]+"/i,
    reason: "Public draft material must not expose production keys."
  }
];

const requiredListingFields = [
  "product_name",
  "short_description",
  "long_description",
  "primary_user",
  "categories",
  "tags"
];

function parseJson(text) {
  try {
    return { ok: true, value: JSON.parse(text), error: null };
  } catch (error) {
    return { ok: false, value: null, error: error.message };
  }
}

async function fetchResource(resource) {
  const response = await fetch(resource.url, {
    method: "GET",
    headers: {
      "User-Agent": "MachineSignalPrivateDraftSubmissionRehearsal/2026-06-08",
      "Accept": "application/json,text/plain,*/*"
    }
  });
  const text = await response.text();
  const json = resource.json ? parseJson(text) : { ok: null, value: null, error: null };
  const markerChecks = resource.must.map((marker) => ({
    marker,
    ok: text.includes(marker)
  }));
  const hardFails = hardFailPatterns
    .filter((item) => item.regex.test(text))
    .map((item) => ({ code: item.code, reason: item.reason }));

  return {
    name: resource.name,
    url: resource.url,
    ok:
      response.ok &&
      (!resource.json || json.ok) &&
      markerChecks.every((item) => item.ok) &&
      hardFails.length === 0,
    http_status: response.status,
    bytes: text.length,
    json_valid: resource.json ? json.ok : null,
    json_error: resource.json ? json.error : null,
    marker_checks: markerChecks,
    hard_fails: hardFails,
    text,
    json: json.value
  };
}

function getPath(obj, path) {
  return path.split(".").reduce((acc, key) => {
    if (acc === undefined || acc === null) return undefined;
    return Object.hasOwn(acc, key) ? acc[key] : undefined;
  }, obj);
}

function hasFields(obj, fields) {
  return fields.map((field) => {
    const value = obj?.[field];
    const ok = Array.isArray(value) ? value.length > 0 : Boolean(value);
    return { field, ok };
  });
}

function channelRehearsal({ channel, bundle, fetched }) {
  const common = bundle.common_listing_fields || {};
  const draft = bundle.channel_drafts?.[channel] || {};
  const fieldChecks = hasFields(common, requiredListingFields);
  const blockedActions = draft.blocked_actions || [];
  const commonReady = fieldChecks.every((item) => item.ok);
  const channelDraftOnly =
    /draft|unpublished|private|local_adapter/i.test(`${draft.status || ""} ${draft.visibility_now || ""}`);
  const monetizationBlocked =
    draft.monetization === "disabled" ||
    draft.pricing_plans_public === false ||
    bundle.current_business_state?.live_monetization_enabled === false;

  const resourceNamesByChannel = {
    generic_api_directory_private_draft: ["api_directory_submission", "openapi", "machine_onboarding"],
    rapidapi_style_unpublished_provider_draft: ["rapidapi_listing", "openapi"],
    mcp_tool_registry_local_adapter_draft: ["mcp_tool_manifest", "mcp_wrapper"],
    postman_private_or_team_workspace: ["postman_workspace_draft", "postman_private_workspace_checklist"]
  };
  const resourceNames = resourceNamesByChannel[channel] || [];
  const resourceChecks = resourceNames.map((name) => ({ name, ok: fetched.get(name)?.ok === true }));
  const blockersPresent = blockedActions.length > 0;
  const readyForPrivateDraft =
    commonReady &&
    channelDraftOnly &&
    monetizationBlocked &&
    blockersPresent &&
    resourceChecks.every((item) => item.ok);

  return {
    channel,
    simulated_action: "prepare_private_draft_metadata_only",
    ready_for_private_draft: readyForPrivateDraft,
    irreversible_submit_executed: false,
    write_calls_executed: 0,
    post_calls_executed: 0,
    public_visibility_enabled: false,
    monetization_enabled: false,
    field_checks: fieldChecks,
    resource_checks: resourceChecks,
    draft_status: draft.status || null,
    stop_before: draft.stop_before || blockedActions,
    blocked_actions: blockedActions
  };
}

function writeReports(summary) {
  fs.writeFileSync(outputJson, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  const channelRows = summary.channel_rehearsals.map((item) => (
    `| ${item.channel} | ${item.ready_for_private_draft ? "OK" : "FAIL"} | ${item.draft_status || "-"} | ${item.blocked_actions.join(", ")} |`
  )).join("\n");

  const resourceRows = summary.resources.map((item) => {
    const missing = item.marker_checks.filter((check) => !check.ok).map((check) => check.marker).join(", ") || "-";
    const hardFails = item.hard_fails.map((fail) => fail.code).join(", ") || "-";
    return `| ${item.name} | ${item.ok ? "OK" : "FAIL"} | ${item.http_status} | ${item.bytes} | ${missing} | ${hardFails} |`;
  }).join("\n");

  const md = `# MachineSignal - Private Draft Submission Rehearsal - 2026-06-08

## Result

Status: ${summary.status}

OK: ${summary.ok}

Primary customer interface: ${summary.primary_customer_interface}

Mode: ${summary.mode}

Write calls executed: ${summary.write_calls_executed}

POST calls executed: ${summary.post_calls_executed}

External publication executed: ${summary.external_publication_executed}

Live monetization enabled: ${summary.live_monetization_enabled}

Hosted MCP live: ${summary.hosted_mcp_live}

## What This Simulated

A NoWrite machine rehearsal simulates a machine buyer or API directory bot reading MachineSignal public discovery files, reconstructing private draft listing metadata and deciding whether each external channel is ready for a private or unpublished draft.

This is not a marketplace submission. It does not contact humans, does not publish to a third-party marketplace, does not create paid plans, does not expose production keys and does not launch hosted MCP. Human outreach and external target contact remain blocked.

## Channel Rehearsal

| Channel | Private draft ready | Draft status | Blocked actions |
|---|---|---|---|
${channelRows}

## Resource Checks

| Resource | Status | HTTP | Bytes | Missing markers | Hard fails |
|---|---|---:|---:|---|---|
${resourceRows}

## Machine Decision

Decision: ${summary.machine_decision.decision}

Recommended next step: ${summary.machine_decision.recommended_next_step}

## Go-Live Blockers

${summary.go_live_blockers.map((item) => `- ${item}`).join("\n")}
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

const bundle = fetched.get("external_draft_submission_bundle")?.json || {};
const noWrite = fetched.get("external_submission_nowrite_review")?.json || {};
const monitor = fetched.get("distribution_readiness_monitor")?.json || {};

const channels = [
  "generic_api_directory_private_draft",
  "rapidapi_style_unpublished_provider_draft",
  "mcp_tool_registry_local_adapter_draft",
  "postman_private_or_team_workspace"
];
const channelRehearsals = channels.map((channel) => channelRehearsal({ channel, bundle, fetched }));
const allHardFails = fetchedList.flatMap((item) => item.hard_fails.map((fail) => ({ resource: item.name, ...fail })));

const safetyChecks = [
  {
    name: "bundle_status_private_draft_only",
    ok: bundle.status === "ready_for_private_draft_only",
    details: `status=${bundle.status}`
  },
  {
    name: "machine_customer_interface",
    ok: bundle.primary_customer_interface === "machine",
    details: `primary_customer_interface=${bundle.primary_customer_interface}`
  },
  {
    name: "current_business_state_blocks_go_live",
    ok:
      bundle.current_business_state?.external_publication_executed === false &&
      bundle.current_business_state?.live_monetization_enabled === false &&
      bundle.current_business_state?.hosted_mcp_live === false &&
      bundle.current_business_state?.real_payment_executed === false &&
      bundle.current_business_state?.external_contact_executed === false,
    details: JSON.stringify(bundle.current_business_state || {})
  },
  {
    name: "nowrite_review_ok",
    ok:
      noWrite.ok === true &&
      noWrite.write_calls_executed === 0 &&
      noWrite.post_calls_executed === 0 &&
      noWrite.external_publication_executed === false &&
      noWrite.live_monetization_enabled === false,
    details: `ok=${noWrite.ok}, writes=${noWrite.write_calls_executed}, posts=${noWrite.post_calls_executed}`
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
  channelRehearsals.every((item) => item.ready_for_private_draft) &&
  safetyChecks.every((item) => item.ok) &&
  allHardFails.length === 0;

const summary = {
  artifact: "private_draft_submission_rehearsal",
  generated_at: startedAt,
  status: ok ? "completed_private_draft_submission_rehearsal" : "private_draft_submission_rehearsal_needs_fix",
  ok,
  mode: "NoWritePrivateDraftSubmissionRehearsal",
  public_site: publicSite,
  primary_customer_interface: "machine",
  write_calls_executed: 0,
  post_calls_executed: 0,
  external_publication_executed: false,
  irreversible_submission_executed: false,
  live_monetization_enabled: false,
  public_paid_plans_enabled: false,
  hosted_mcp_live: false,
  real_payment_executed: false,
  real_invoice_issued: false,
  external_contact_executed: false,
  production_api_key_published: false,
  resources_checked: fetchedList.length,
  channels_checked: channelRehearsals.length,
  safety_checks: safetyChecks,
  channel_rehearsals: channelRehearsals,
  resources: fetchedList.map(({ text, json, ...rest }) => rest),
  hard_fails: allHardFails,
  machine_decision: {
    decision: ok ? "prepare_private_draft_only" : "fix_public_machine_metadata_before_private_draft",
    recommended_next_step: ok
      ? "Use the bundle to prepare an owner-supervised private API-directory draft rehearsal. Stop before final submit, paid plan creation, hosted MCP launch or external outreach."
      : "Fix failed resources or channel fields, then rerun the rehearsal."
  },
  go_live_blockers: bundle.go_live_gap?.remaining_before_paid_commercial_go_live || [
    "legal and fiscal setup",
    "terms of service",
    "live payment processor",
    "production key policy",
    "owner approval"
  ]
};

writeReports(summary);
console.log(JSON.stringify(summary, null, 2));
