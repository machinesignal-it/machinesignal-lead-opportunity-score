import fs from "node:fs";

const publicSite = "https://machinesignal.it";
const outputJson = "external_submission_pack_no_write_review_summary_20260608.json";
const outputMarkdown = "external_submission_pack_no_write_review_report_20260608.md";

const resources = [
  {
    name: "api_directory_checklist_md",
    url: `${publicSite}/api_directory_rapidapi_draft_checklist_20260607.md`,
    json: false,
    must: [
      "ready for sandbox-only draft preparation",
      "monetization disabled",
      "Do not submit irreversibly without owner approval",
      "Do not contact human prospects or target companies"
    ]
  },
  {
    name: "api_directory_checklist_json",
    url: `${publicSite}/api_directory_rapidapi_draft_checklist_20260607.json`,
    json: true,
    must: [
      "blocked_until_owner_approval",
      "monetization",
      "disabled",
      "do_not_contact_human_prospects_or_target_companies"
    ]
  },
  {
    name: "mcp_tool_registry_checklist_md",
    url: `${publicSite}/mcp_tool_registry_draft_checklist_20260607.md`,
    json: false,
    must: [
      "ready for sandbox-only draft preparation",
      "Hosted public MCP publication",
      "Keep the public hosted MCP server marked as not live",
      "Stop before irreversible external registry publication"
    ]
  },
  {
    name: "mcp_tool_registry_checklist_json",
    url: `${publicSite}/mcp_tool_registry_draft_checklist_20260607.json`,
    json: true,
    must: [
      "blocked_until_owner_approval",
      "hosted_mcp_live",
      "false",
      "publish_hosted_mcp_endpoint_as_live"
    ]
  },
  {
    name: "external_sandbox_publication_drafts_md",
    url: `${publicSite}/external_sandbox_publication_drafts_20260607.md`,
    json: false,
    must: [
      "ready for sandbox-only draft preparation",
      "Public irreversible publication remains blocked",
      "API Directory",
      "MCP / Agent Tool Registry Draft"
    ]
  },
  {
    name: "external_sandbox_publication_drafts_json",
    url: `${publicSite}/external_sandbox_publication_drafts_20260607.json`,
    json: true,
    must: [
      "blocked_until_owner_approval",
      "generic_api_directory",
      "rapidapi_style_marketplace",
      "mcp_tool_registry"
    ]
  },
  {
    name: "external_draft_submission_bundle_md",
    url: `${publicSite}/external_draft_submission_bundle_20260608.md`,
    json: false,
    must: [
      "External Draft Submission Bundle",
      "ready_for_private_draft_only",
      "Hosted MCP live | false",
      "Machine Test Path"
    ]
  },
  {
    name: "external_draft_submission_bundle_json",
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
    name: "marketplace_api_directory_pack_md",
    url: `${publicSite}/marketplace_api_directory_pack_20260606.md`,
    json: false,
    must: [
      "sandbox-only publication candidate",
      "Machine-first",
      "not a live paid checkout",
      "not an automatic outreach product"
    ]
  },
  {
    name: "marketplace_api_directory_pack_json",
    url: `${publicSite}/marketplace_api_directory_pack_20260606.json`,
    json: true,
    must: [
      "sandbox-only",
      "external_publication_policy",
      "latest_public_sandbox_claims_no_write_review",
      "public_sandbox_claims_no_write_review_json"
    ]
  },
  {
    name: "marketplace_publication_execution_pack_md",
    url: `${publicSite}/marketplace_publication_execution_pack_20260606.md`,
    json: false,
    must: [
      "Sandbox-Only External Publication Pack",
      "Public Sandbox Claims NoWrite Review",
      "no live payment",
      "no automatic external outreach"
    ]
  },
  {
    name: "marketplace_publication_execution_pack_json",
    url: `${publicSite}/marketplace_publication_execution_pack_20260606.json`,
    json: true,
    must: [
      "external_publication_policy",
      "latest_public_sandbox_claims_no_write_review",
      "blocked_without_owner_approval",
      "sandbox"
    ]
  },
  {
    name: "marketplace_submission_pack_json",
    url: `${publicSite}/distribution/marketplace-submission-pack.json`,
    json: true,
    must: [
      "external_publication_policy",
      "latest_public_sandbox_claims_no_write_review",
      "sandbox",
      "owner"
    ]
  },
  {
    name: "mcp_tool_manifest",
    url: `${publicSite}/mcp-tool-manifest.json`,
    json: true,
    must: [
      "get_public_sandbox_claims_no_write_review",
      "get_mcp_tool_registry_draft_checklist",
      "latest_public_sandbox_claims_no_write_review",
      "sandbox"
    ]
  },
  {
    name: "well_known_mcp_tool_manifest",
    url: `${publicSite}/.well-known/mcp-tool-manifest.json`,
    json: true,
    must: [
      "get_public_sandbox_claims_no_write_review",
      "get_mcp_tool_registry_draft_checklist",
      "latest_public_sandbox_claims_no_write_review",
      "sandbox"
    ]
  },
  {
    name: "public_sandbox_claims_nowrite_review_json",
    url: `${publicSite}/public_sandbox_claims_no_write_review_summary_20260608.json`,
    json: true,
    must: [
      "completed_public_sandbox_claims_no_write_review",
      "NoWritePublicClaimsReview",
      "real_payment_executed",
      "external_contact_executed"
    ]
  },
  {
    name: "distribution_readiness_monitor_json",
    url: `${publicSite}/distribution_readiness_monitor_summary_20260607.json`,
    json: true,
    must: [
      "ready_for_distribution_review",
      "checks_failed",
      "write_calls_executed",
      "post_calls_executed"
    ]
  }
];

const hardFailPatterns = [
  {
    code: "real_payment_true",
    regex: /"real_payment_executed"\s*:\s*true|Real payment executed:\s*True/i,
    reason: "External submission material must not claim a real payment was executed."
  },
  {
    code: "real_invoice_true",
    regex: /"real_invoice_issued"\s*:\s*true|real invoice issued:\s*true|Fiscal invoice issued:\s*True/i,
    reason: "External submission material must not claim real fiscal invoicing."
  },
  {
    code: "external_contact_true",
    regex: /"external_contact_executed"\s*:\s*true|External contact executed:\s*True/i,
    reason: "External submission material must not claim external target contact was executed."
  },
  {
    code: "monetization_enabled",
    regex: /"monetization"\s*:\s*"enabled"|"public_paid_plans_active"\s*:\s*true|"create_marketplace_pricing_tiers"\s*:\s*true/i,
    reason: "Marketplace monetization must stay disabled during this test phase."
  },
  {
    code: "hosted_mcp_live_true",
    regex: /"hosted_mcp_live"\s*:\s*true/i,
    reason: "Hosted MCP must remain not live until a later approved build."
  },
  {
    code: "owner_approval_recorded_true",
    regex: /"owner_approval_recorded"\s*:\s*true/i,
    reason: "Owner approval for irreversible external publication must not be pre-claimed."
  },
  {
    code: "production_key_exposed",
    regex: /"production_api_key"\s*:\s*"[^"]+"|"live_api_key"\s*:\s*"[^"]+"|sk_live_[A-Za-z0-9_-]+/i,
    reason: "External submission material must not expose production keys."
  },
  {
    code: "automatic_outreach_claim",
    regex: /automatically sends? (emails?|outreach|messages?)|contacts? external targets automatically|sends? outreach automatically/i,
    reason: "Action Pack and distribution material must not claim automatic external outreach."
  }
];

const positiveRules = [
  {
    name: "machine_customer_language",
    description: "Resource states the customer interface is machine-first.",
    test: (text) => /machine-first|machine customer|customer machine|AI agents?|CRM systems?|workflow/i.test(text)
  },
  {
    name: "sandbox_or_draft_language",
    description: "Resource states sandbox, beta or draft-only context.",
    test: (text) => /sandbox|beta|draft/i.test(text)
  },
  {
    name: "owner_approval_gate",
    description: "Resource blocks irreversible publication until owner approval.",
    test: (text) => /owner approval|blocked_until_owner_approval|blocked without owner approval|irreversible external/i.test(text)
  },
  {
    name: "monetization_disabled",
    description: "Resource keeps monetization, paid plans or live checkout disabled.",
    test: (text) => /monetization[^.\n]*(disabled|blocked)|paid plans[^.\n]*(not active|blocked|disabled)|live checkout[^.\n]*(not enabled|blocked|disabled)|public paid plans[^.\n]*(not enabled|not active)/i.test(text)
  },
  {
    name: "human_outreach_blocked",
    description: "Resource blocks human outreach or external target contact.",
    test: (text) => /do not contact human|external target contact[^.\n]*(blocked|false|not|no)|human outbound outreach[^.\n]*(blocked|not|no)|external outreach[^.\n]*(blocked|not|no|disabled)/i.test(text)
  }
];

function parseJsonMaybe(text) {
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

async function fetchText(url) {
  const response = await fetch(url);
  const text = await response.text();
  return { ok: response.ok, status: response.status, text };
}

function evaluateResource(resource, text) {
  const markerChecks = resource.must.map((marker) => ({ marker, ok: text.includes(marker) }));
  const hardFails = hardFailPatterns
    .filter((item) => item.regex.test(text))
    .map((item) => ({ code: item.code, reason: item.reason }));
  const positiveChecks = positiveRules.map((rule) => ({
    name: rule.name,
    description: rule.description,
    ok: rule.test(text)
  }));
  return {
    marker_checks: markerChecks,
    hard_fails: hardFails,
    positive_checks: positiveChecks,
    markers_ok: markerChecks.every((item) => item.ok),
    hard_fail_count: hardFails.length,
    positive_ok_count: positiveChecks.filter((item) => item.ok).length
  };
}

function writeReports(summary) {
  fs.writeFileSync(outputJson, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  const resourceRows = summary.resources.map((item) => {
    const status = item.ok ? "OK" : "FAIL";
    const missing = item.marker_checks.filter((check) => !check.ok).map((check) => check.marker).join(", ") || "-";
    const weak = item.positive_checks.filter((check) => !check.ok).map((check) => check.name).join(", ") || "-";
    const hardFails = item.hard_fails.map((fail) => fail.code).join(", ") || "-";
    return `| ${item.name} | ${status} | ${item.http_status} | ${item.bytes} | ${missing} | ${weak} | ${hardFails} |`;
  }).join("\n");

  const specificRows = summary.specific_checks.map((item) => (
    `| ${item.name} | ${item.ok ? "OK" : "FAIL"} | ${item.details} |`
  )).join("\n");

  const hardFailRows = summary.hard_fails.length
    ? summary.hard_fails.map((item) => `| ${item.resource} | ${item.code} | ${item.reason} |`).join("\n")
    : "| - | - | - |";

  const md = `# MachineSignal - External Submission Pack NoWrite Review - 2026-06-08

## Result

Status: ${summary.status}

OK: ${summary.ok}

Mode: ${summary.mode}

Resources checked: ${summary.resources_checked}

Write calls executed: ${summary.write_calls_executed}

POST calls executed: ${summary.post_calls_executed}

External publication executed: ${summary.external_publication_executed}

Live monetization enabled: ${summary.live_monetization_enabled}

Hosted MCP live: ${summary.hosted_mcp_live}

## What Was Checked

This review checks whether the API directory, RapidAPI-style and MCP/tool-registry material is safe to use as draft metadata for machine discovery:

- machine-first positioning is clear;
- sandbox/draft-only state is clear;
- monetization and public paid plans remain disabled;
- hosted MCP is not claimed as live;
- irreversible external submission remains blocked until owner approval;
- human outreach, external target contact, live payments, production keys and real invoices remain blocked.

## Resource Results

| Resource | Status | HTTP | Bytes | Missing markers | Weak positive checks | Hard fails |
|---|---|---:|---:|---|---|---|
${resourceRows}

## Specific Gate Checks

| Check | Status | Details |
|---|---|---|
${specificRows}

## Hard Fail Details

| Resource | Code | Reason |
|---|---|---|
${hardFailRows}

## Interpretation

If this review is OK, MachineSignal can continue preparing API directory and MCP registry drafts without changing the business state: the customer remains the machine, publication remains sandbox-only and no external marketplace/go-live action is authorized by this report.

## Recommended Next Step

Prepare a private/draft submission bundle only. Stop before public irreversible submission, hosted MCP launch, live checkout, paid plans, production keys or human outreach.
`;

  fs.writeFileSync(outputMarkdown, md, "utf8");
}

const startedAt = new Date().toISOString();
const results = [];
const hardFails = [];
const jsonByName = new Map();

for (const resource of resources) {
  const fetched = await fetchText(resource.url);
  const json = resource.json ? parseJsonMaybe(fetched.text) : { ok: null, value: null, error: null };
  if (json.ok) jsonByName.set(resource.name, json.value);
  const evaluated = evaluateResource(resource, fetched.text);
  for (const fail of evaluated.hard_fails) hardFails.push({ resource: resource.name, ...fail });

  const positiveMinimum = resource.name.includes("public_sandbox_claims_nowrite_review")
    ? 2
    : resource.name.includes("distribution_readiness_monitor")
      ? 3
      : resource.name.includes("mcp_tool_manifest")
        ? 2
        : 3;
  const resourceOk =
    fetched.ok &&
    (!resource.json || json.ok) &&
    evaluated.markers_ok &&
    evaluated.hard_fail_count === 0 &&
    evaluated.positive_ok_count >= positiveMinimum;

  results.push({
    name: resource.name,
    url: resource.url,
    ok: resourceOk,
    http_status: fetched.status,
    bytes: fetched.text.length,
    json_valid: resource.json ? json.ok : null,
    json_error: resource.json ? json.error : null,
    marker_checks: evaluated.marker_checks,
    positive_checks: evaluated.positive_checks,
    positive_ok_count: evaluated.positive_ok_count,
    hard_fails: evaluated.hard_fails
  });
}

const apiChecklist = jsonByName.get("api_directory_checklist_json");
const mcpChecklist = jsonByName.get("mcp_tool_registry_checklist_json");
const monitor = jsonByName.get("distribution_readiness_monitor_json");
const publicClaims = jsonByName.get("public_sandbox_claims_nowrite_review_json");

const specificChecks = [
  {
    name: "api_directory_external_submission_blocked",
    ok: apiChecklist?.external_submission === "blocked_until_owner_approval",
    details: `external_submission=${apiChecklist?.external_submission}`
  },
  {
    name: "api_directory_monetization_disabled",
    ok:
      apiChecklist?.monetization === "disabled" &&
      getPath(apiChecklist, "draft_pricing_treatment.public_paid_plans_active") === false &&
      getPath(apiChecklist, "draft_pricing_treatment.create_marketplace_pricing_tiers") === false,
    details: `monetization=${apiChecklist?.monetization}, public_paid_plans_active=${getPath(apiChecklist, "draft_pricing_treatment.public_paid_plans_active")}, create_marketplace_pricing_tiers=${getPath(apiChecklist, "draft_pricing_treatment.create_marketplace_pricing_tiers")}`
  },
  {
    name: "mcp_registry_hosted_mcp_not_live",
    ok: mcpChecklist?.hosted_mcp_live === false,
    details: `hosted_mcp_live=${mcpChecklist?.hosted_mcp_live}`
  },
  {
    name: "mcp_registry_external_submission_blocked",
    ok: mcpChecklist?.external_submission === "blocked_until_owner_approval",
    details: `external_submission=${mcpChecklist?.external_submission}`
  },
  {
    name: "mcp_registry_monetization_disabled",
    ok: mcpChecklist?.monetization === "disabled",
    details: `monetization=${mcpChecklist?.monetization}`
  },
  {
    name: "public_claims_review_ok",
    ok:
      publicClaims?.ok === true &&
      publicClaims?.write_calls_executed === 0 &&
      publicClaims?.post_calls_executed === 0 &&
      publicClaims?.real_payment_executed === false &&
      publicClaims?.external_contact_executed === false,
    details: `ok=${publicClaims?.ok}, writes=${publicClaims?.write_calls_executed}, posts=${publicClaims?.post_calls_executed}, payment=${publicClaims?.real_payment_executed}, contact=${publicClaims?.external_contact_executed}`
  },
  {
    name: "distribution_monitor_ok",
    ok:
      monitor?.ok === true &&
      monitor?.checks_failed === 0 &&
      monitor?.write_calls_executed === 0 &&
      monitor?.post_calls_executed === 0,
    details: `ok=${monitor?.ok}, resources=${monitor?.resources_checked}, checks=${monitor?.checks_total}, failed=${monitor?.checks_failed}, writes=${monitor?.write_calls_executed}, posts=${monitor?.post_calls_executed}`
  }
];

const summary = {
  artifact: "external_submission_pack_no_write_review",
  generated_at: startedAt,
  status: "completed_external_submission_pack_no_write_review",
  ok: results.every((item) => item.ok) && hardFails.length === 0 && specificChecks.every((item) => item.ok),
  mode: "NoWriteExternalSubmissionReview",
  public_site: publicSite,
  resources_checked: resources.length,
  write_calls_executed: 0,
  post_calls_executed: 0,
  external_publication_executed: false,
  irreversible_submission_executed: false,
  live_monetization_enabled: false,
  hosted_mcp_live: false,
  real_payment_executed: false,
  external_contact_executed: false,
  real_invoice_issued: false,
  production_api_key_published: false,
  hard_fails: hardFails,
  specific_checks: specificChecks,
  resources: results,
  recommended_next_step:
    "Prepare private/draft API directory and MCP registry submission bundles only. Stop before irreversible publication, hosted MCP launch, live checkout, public paid plans, production keys or human outreach."
};

if (!summary.ok) summary.status = "review_failed_external_submission_pack_needs_copy_fix";

writeReports(summary);
console.log(JSON.stringify(summary, null, 2));
