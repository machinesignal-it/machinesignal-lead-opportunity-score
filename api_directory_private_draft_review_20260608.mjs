import fs from "node:fs";

const publicSite = "https://machinesignal.it";
const outputJson = "api_directory_private_draft_review_summary_20260608.json";
const outputMarkdown = "api_directory_private_draft_review_report_20260608.md";

const resources = [
  {
    name: "api_directory_private_draft_pack_json",
    url: `${publicSite}/api_directory_private_draft_pack_20260608.json`,
    json: true,
    must: [
      "ready_for_api_directory_private_draft_only",
      "prepare_api_directory_private_draft_only",
      "MachineSignal Lead Opportunity Score API",
      "blocked_before_public_submit"
    ]
  },
  {
    name: "api_directory_private_draft_pack_md",
    url: `${publicSite}/api_directory_private_draft_pack_20260608.md`,
    json: false,
    must: [
      "API Directory Private Draft Pack",
      "external_publication_executed=false",
      "production_api_key_published=false",
      "Decision: prepare_api_directory_private_draft_only"
    ]
  },
  {
    name: "api_directory_submission_json",
    url: `${publicSite}/distribution/api-directory-submission.json`,
    json: true,
    must: ["sandbox_only_api_directory_draft_ready_owner_approval_required_for_external_submission"]
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
    name: "private_draft_submission_rehearsal",
    url: `${publicSite}/private_draft_submission_rehearsal_summary_20260608.json`,
    json: true,
    must: ["completed_private_draft_submission_rehearsal", "prepare_private_draft_only"]
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
    code: "external_publication_true",
    regex: /"external_publication_executed"\s*:\s*true|"irreversible_submission_executed"\s*:\s*true/i,
    reason: "API directory private draft must not execute or claim irreversible external publication."
  },
  {
    code: "live_monetization_true",
    regex: /"live_monetization_enabled"\s*:\s*true|"public_paid_plans_enabled"\s*:\s*true|"public_paid_plans_active"\s*:\s*true/i,
    reason: "API directory private draft must not enable public paid plans or live monetization."
  },
  {
    code: "real_payment_true",
    regex: /"real_payment_executed"\s*:\s*true/i,
    reason: "API directory private draft must not execute real payments."
  },
  {
    code: "external_contact_true",
    regex: /"external_contact_executed"\s*:\s*true/i,
    reason: "API directory private draft must not contact external targets or humans."
  },
  {
    code: "hosted_mcp_live_true",
    regex: /"hosted_mcp_live"\s*:\s*true/i,
    reason: "Hosted MCP must remain not live."
  },
  {
    code: "production_key_exposed",
    regex: /sk_live_[A-Za-z0-9_-]+|"production_api_key"\s*:\s*"[^"]+"|"live_api_key"\s*:\s*"[^"]+"/i,
    reason: "API directory draft must not expose production keys."
  }
];

const requiredPackPaths = [
  "directory_listing_fields.api_name",
  "directory_listing_fields.short_description",
  "directory_listing_fields.long_description",
  "directory_listing_fields.base_url",
  "directory_listing_fields.documentation_url",
  "directory_listing_fields.openapi_url",
  "directory_listing_fields.well_known_discovery_url",
  "directory_listing_fields.auth_type",
  "directory_listing_fields.auth_header",
  "endpoint_groups_for_directory",
  "products_to_describe",
  "blocked_before_public_submit",
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
  const ok = Array.isArray(value) ? value.length > 0 : Boolean(value);
  return { path, ok };
}

async function fetchResource(resource) {
  const response = await fetch(resource.url, {
    method: "GET",
    headers: {
      "User-Agent": "MachineSignalApiDirectoryPrivateDraftReview/2026-06-08",
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

  const md = `# MachineSignal - API Directory Private Draft Review - 2026-06-08

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

This NoWrite review checks whether the API directory private draft pack contains enough exact fields for a generic API directory draft while keeping all go-live actions blocked.

Machine-first context: the intended reader and buyer interface is a CRM system, AI agent, workflow or other software process.

Approval gate: irreversible external publication remains blocked until owner approval.

Commercial gate: monetization disabled; public paid plans not active; live checkout disabled.

Contact gate: external target contact false; human outbound outreach blocked; do not contact human prospects or target companies.

## Pack Field Checks

| Field | Status |
|---|---|
${fieldRows}

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

const pack = fetched.get("api_directory_private_draft_pack_json")?.json || {};
const rehearsal = fetched.get("private_draft_submission_rehearsal")?.json || {};
const noWrite = fetched.get("external_submission_nowrite_review")?.json || {};
const monitor = fetched.get("distribution_readiness_monitor")?.json || {};
const fieldChecks = requiredPackPaths.map((path) => fieldCheck(pack, path));
const allHardFails = fetchedList.flatMap((item) => item.hard_fails.map((fail) => ({ resource: item.name, ...fail })));

const safetyChecks = [
  {
    name: "pack_status_private_draft_only",
    ok: pack.status === "ready_for_api_directory_private_draft_only",
    details: `status=${pack.status}`
  },
  {
    name: "machine_customer_interface",
    ok: pack.primary_customer_interface === "machine",
    details: `primary_customer_interface=${pack.primary_customer_interface}`
  },
  {
    name: "draft_safety_state_blocks_go_live",
    ok:
      pack.draft_safety_state?.external_publication_executed === false &&
      pack.draft_safety_state?.live_monetization_enabled === false &&
      pack.draft_safety_state?.hosted_mcp_live === false &&
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
      rehearsal.live_monetization_enabled === false,
    details: `ok=${rehearsal.ok}, external_publication=${rehearsal.external_publication_executed}, monetization=${rehearsal.live_monetization_enabled}`
  },
  {
    name: "external_submission_nowrite_ok",
    ok:
      noWrite.ok === true &&
      noWrite.write_calls_executed === 0 &&
      noWrite.post_calls_executed === 0 &&
      noWrite.external_publication_executed === false,
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
  fieldChecks.every((item) => item.ok) &&
  safetyChecks.every((item) => item.ok) &&
  allHardFails.length === 0;

const summary = {
  artifact: "api_directory_private_draft_review",
  generated_at: startedAt,
  status: ok ? "completed_api_directory_private_draft_review" : "api_directory_private_draft_review_needs_fix",
  ok,
  mode: "NoWriteApiDirectoryPrivateDraftReview",
  public_site: publicSite,
  primary_customer_interface: "machine",
  safety_copy: {
    machine_customer_language:
      "machine-first customer interface for AI agents, CRM systems and workflow software",
    sandbox_or_draft_language:
      "sandbox private draft only; not a live public listing",
    owner_approval_gate:
      "irreversible external publication remains blocked until owner approval",
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
    decision: ok ? "api_directory_private_draft_ready" : "fix_api_directory_private_draft_pack",
    recommended_next_step: ok
      ? "Use the pack to prepare an owner-supervised private or unsubmitted API directory draft. Stop before public submit, paid plan creation, production key distribution or external outreach."
      : "Fix failed fields or resources, then rerun the review."
  }
};

writeReports(summary);
console.log(JSON.stringify(summary, null, 2));
