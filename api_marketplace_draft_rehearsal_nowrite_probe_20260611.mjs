import fs from "node:fs";

const PUBLIC_SITE = "https://machinesignal.it";
const OUTPUT_REPORT = "api_marketplace_draft_rehearsal_nowrite_probe_report_20260611.md";
const OUTPUT_SUMMARY = "api_marketplace_draft_rehearsal_nowrite_probe_summary_20260611.json";

const resourcesToFetch = [
  ["api_directory_pack", `${PUBLIC_SITE}/api_directory_private_draft_pack_20260608.json`, "json", ["ready_for_api_directory_private_draft_only", "MachineSignal Lead Opportunity Score API", "external_publication_executed"]],
  ["api_directory_pack_md", `${PUBLIC_SITE}/api_directory_private_draft_pack_20260608.md`, "text", ["API Directory Private Draft Pack", "external_publication_executed=false"]],
  ["api_directory_submission", `${PUBLIC_SITE}/distribution/api-directory-submission.json`, "json", ["sandbox_only_api_directory_draft_ready_owner_approval_required_for_external_submission", "api_directory_private_draft_pack_20260608.json"]],
  ["api_directory_review", `${PUBLIC_SITE}/api_directory_private_draft_review_summary_20260608.json`, "json", ["completed_api_directory_private_draft_review", "NoWriteApiDirectoryPrivateDraftReview"]],
  ["rapidapi_pack", `${PUBLIC_SITE}/rapidapi_unpublished_provider_draft_pack_20260608.json`, "json", ["ready_for_rapidapi_unpublished_provider_draft_only", "do_not_create_public_paid_plans_yet"]],
  ["rapidapi_pack_md", `${PUBLIC_SITE}/rapidapi_unpublished_provider_draft_pack_20260608.md`, "text", ["RapidAPI-Style Unpublished Provider Draft Pack", "monetization disabled"]],
  ["rapidapi_listing", `${PUBLIC_SITE}/distribution/rapidapi-listing.json`, "json", ["rapidapi_style_provider_metadata_ready_monetization_disabled", "public_paid_plans_enabled"]],
  ["rapidapi_provider_setup", `${PUBLIC_SITE}/distribution/rapidapi-provider-setup.json`, "json", ["draft_or_unpublished_monetization_disabled", "do_not_publish_monetized_until"]],
  ["rapidapi_review", `${PUBLIC_SITE}/rapidapi_unpublished_provider_draft_review_summary_20260608.json`, "json", ["completed_rapidapi_unpublished_provider_draft_review", "NoWriteRapidApiUnpublishedProviderDraftReview"]],
  ["draft_checklist", `${PUBLIC_SITE}/api_directory_rapidapi_draft_checklist_20260607.json`, "json", ["blocked_until_owner_approval", "do_not_contact_human_prospects_or_target_companies"]],
  ["marketplace_pack", `${PUBLIC_SITE}/distribution/marketplace-submission-pack.json`, "json", ["ready_for_sandbox_publication_drafts_with_full_beta_evidence", "channel_private_draft_packs"]],
  ["postman_rehearsal", `${PUBLIC_SITE}/postman_private_workspace_rehearsal_nowrite_probe_summary_20260611.json`, "json", ["completed_postman_private_workspace_rehearsal_nowrite"]],
  ["distribution_monitor", `${PUBLIC_SITE}/distribution_readiness_monitor_summary_20260607.json`, "json", ["ready_for_distribution_review", "checks_failed"]],
  ["openapi", `${PUBLIC_SITE}/openapi.json`, "json", ["lead-opportunity-score", "purchase-intent", "orders"]],
  ["machine_discovery", `${PUBLIC_SITE}/.well-known/machine-discovery.json`, "json", ["postman_private_workspace_rehearsal_nowrite_probe_json"]],
  ["llms", `${PUBLIC_SITE}/llms.txt`, "text", ["Postman Private Workspace Rehearsal NoWrite Probe JSON", "RapidAPI Listing JSON"]],
  ["robots", `${PUBLIC_SITE}/robots.txt`, "text", ["Postman-private-workspace-rehearsal-nowrite-probe-json", "RapidAPI-listing"]],
  ["sitemap", `${PUBLIC_SITE}/sitemap.xml`, "text", ["postman_private_workspace_rehearsal_nowrite_probe_summary_20260611.json", "rapidapi-listing.json"]]
];

const apiDirectoryRequiredPaths = [
  "directory_listing_fields.api_name",
  "directory_listing_fields.short_description",
  "directory_listing_fields.long_description",
  "directory_listing_fields.base_url",
  "directory_listing_fields.documentation_url",
  "directory_listing_fields.openapi_url",
  "directory_listing_fields.postman_collection_url",
  "directory_listing_fields.well_known_discovery_url",
  "directory_listing_fields.auth_type",
  "directory_listing_fields.auth_header",
  "endpoint_groups_for_directory",
  "products_to_describe",
  "blocked_before_public_submit",
  "machine_decision.decision"
];

const rapidApiRequiredPaths = [
  "rapidapi_style_listing_fields.api_name",
  "rapidapi_style_listing_fields.visibility",
  "rapidapi_style_listing_fields.monetization",
  "rapidapi_style_listing_fields.pricing_plans",
  "rapidapi_style_listing_fields.base_url",
  "rapidapi_style_listing_fields.auth_header",
  "rapidapi_style_listing_fields.openapi_url",
  "rapidapi_style_listing_fields.postman_collection_url",
  "source_assets.rapidapi_listing_json",
  "source_assets.rapidapi_provider_setup_json",
  "endpoint_groups_for_provider_draft",
  "draft_pricing_treatment.public_paid_plans_active",
  "draft_pricing_treatment.create_marketplace_pricing_tiers",
  "blocked_before_public_submit",
  "machine_decision.decision"
];

const hardFailPatterns = [
  ["external_publication_true", /"external_publication_executed"\s*:\s*true|"irreversible_submission_executed"\s*:\s*true/i],
  ["live_monetization_true", /"live_monetization_enabled"\s*:\s*true|"public_paid_plans_enabled"\s*:\s*true|"public_paid_plans_active"\s*:\s*true|"create_marketplace_pricing_tiers"\s*:\s*true/i],
  ["real_payment_true", /"real_payment_executed"\s*:\s*true/i],
  ["real_invoice_true", /"real_invoice_issued"\s*:\s*true/i],
  ["external_contact_true", /"external_contact_executed"\s*:\s*true/i],
  ["human_outreach_true", /"human_outreach_allowed"\s*:\s*true|"human_outreach_executed"\s*:\s*true/i],
  ["public_workspace_true", /"public_workspace_enabled"\s*:\s*true/i],
  ["real_key_published_true", /"real_api_keys_published"\s*:\s*true|"production_api_key_published"\s*:\s*true/i],
  ["production_key_exposed", /sk_live_[A-Za-z0-9_-]+|ghp_[A-Za-z0-9_]+|github_pat_[A-Za-z0-9_]+|Bearer\s+[A-Za-z0-9._-]{20,}/i]
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
      "user-agent": "MachineSignalApiMarketplaceDraftNoWriteProbe/2026-06-11",
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

const apiDirectoryPack = resources.api_directory_pack.body || {};
const rapidApiPack = resources.rapidapi_pack.body || {};
const apiDirectorySubmission = resources.api_directory_submission.body || {};
const rapidApiListing = resources.rapidapi_listing.body || {};
const rapidApiProviderSetup = resources.rapidapi_provider_setup.body || {};
const marketplacePack = resources.marketplace_pack.body || {};
const postmanRehearsal = resources.postman_rehearsal.body || {};
const monitor = resources.distribution_monitor.body || {};

for (const path of apiDirectoryRequiredPaths) {
  addCheck(`api_directory_required_${path.replace(/[^A-Za-z0-9]+/g, "_").toLowerCase()}`, fieldPresent(apiDirectoryPack, path), path);
}
for (const path of rapidApiRequiredPaths) {
  addCheck(`rapidapi_required_${path.replace(/[^A-Za-z0-9]+/g, "_").toLowerCase()}`, fieldPresent(rapidApiPack, path), path);
}

addCheck("api_directory_status_private_draft_only", apiDirectoryPack.status === "ready_for_api_directory_private_draft_only", `status=${apiDirectoryPack.status}`);
addCheck("rapidapi_status_unpublished_draft_only", rapidApiPack.status === "ready_for_rapidapi_unpublished_provider_draft_only", `status=${rapidApiPack.status}`);
addCheck("api_directory_submission_owner_approval_required", String(apiDirectorySubmission.status || "").includes("owner_approval_required"), apiDirectorySubmission.status || "");
addCheck("rapidapi_listing_monetization_disabled", rapidApiListing.status === "rapidapi_style_provider_metadata_ready_monetization_disabled", rapidApiListing.status || "");
addCheck("rapidapi_provider_setup_draft_or_unpublished", String(rapidApiProviderSetup.recommended_mode || "").includes("draft") || asText(rapidApiProviderSetup).includes("draft_or_unpublished_monetization_disabled"), rapidApiProviderSetup.recommended_mode || "");
addCheck("marketplace_sequence_has_rapidapi_and_api_directory", asText(marketplacePack.recommended_sequence).includes("RapidAPI style marketplace draft") && asText(marketplacePack.recommended_sequence).includes("Generic API directories"), "recommended sequence includes both channels");
addCheck("marketplace_channel_private_draft_packs_present", asText(marketplacePack.channel_private_draft_packs || marketplacePack.publication_policy?.channel_private_draft_packs).includes("api_directory_private_draft_pack_20260608.json") && asText(marketplacePack.channel_private_draft_packs || marketplacePack.publication_policy?.channel_private_draft_packs).includes("rapidapi_unpublished_provider_draft_pack_20260608.json"), "channel-specific draft packs present");
addCheck("postman_rehearsal_passed", postmanRehearsal.ok === true && postmanRehearsal.status === "completed_postman_private_workspace_rehearsal_nowrite", `status=${postmanRehearsal.status}`);
addCheck("distribution_monitor_green", monitor.ok === true && Number(monitor.checks_failed) === 0, `ok=${monitor.ok}, failed=${monitor.checks_failed}`);

const safetyObjects = [
  ["api_directory_pack", apiDirectoryPack.draft_safety_state],
  ["rapidapi_pack", rapidApiPack.draft_safety_state],
  ["api_directory_review", resources.api_directory_review.body],
  ["rapidapi_review", resources.rapidapi_review.body],
  ["postman_rehearsal", postmanRehearsal]
];
for (const [name, safety] of safetyObjects) {
  addCheck(`${name}_zero_writes`, Number(safety?.write_calls_executed || 0) === 0, `write_calls_executed=${safety?.write_calls_executed}`);
  addCheck(`${name}_zero_posts`, Number(safety?.post_calls_executed || 0) === 0, `post_calls_executed=${safety?.post_calls_executed}`);
  addCheck(`${name}_no_real_payment`, safety?.real_payment_executed === false, `real_payment_executed=${safety?.real_payment_executed}`);
  addCheck(`${name}_no_external_contact`, safety?.external_contact_executed === false || safety?.external_contact_executed === undefined, `external_contact_executed=${safety?.external_contact_executed}`);
  addCheck(`${name}_no_external_publication`, safety?.external_publication_executed === false || safety?.external_publication_executed === undefined, `external_publication_executed=${safety?.external_publication_executed}`);
  addCheck(`${name}_no_live_monetization`, safety?.live_monetization_enabled === false || safety?.live_monetization_enabled === undefined, `live_monetization_enabled=${safety?.live_monetization_enabled}`);
}

const failed = checks.filter((check) => !check.ok);
const summary = {
  service: "MachineSignal",
  probe_name: "api_marketplace_draft_rehearsal_nowrite_probe",
  status: failed.length === 0 ? "completed_api_marketplace_draft_rehearsal_nowrite" : "failed_api_marketplace_draft_rehearsal_nowrite",
  ok: failed.length === 0,
  evidence_date: "2026-06-11",
  mode: "NoWriteApiMarketplaceDraftRehearsal",
  primary_customer_interface: "machine",
  machine_customer_mode: "machine_evaluates_api_directory_and_rapidapi_style_drafts_without_external_publication_or_live_monetization",
  channels_checked: ["generic_api_directory", "rapidapi_style_marketplace"],
  write_calls_executed: 0,
  post_calls_executed: 0,
  real_payment_executed: false,
  real_invoice_issued: false,
  external_contact_executed: false,
  human_outreach_executed: false,
  external_publication_executed: false,
  irreversible_submission_executed: false,
  live_monetization_enabled: false,
  public_paid_plans_enabled: false,
  marketplace_pricing_tiers_created: false,
  production_api_key_published: false,
  postman_rehearsal_dependency_ok: postmanRehearsal.ok === true,
  distribution_monitor_dependency_ok: monitor.ok === true && Number(monitor.checks_failed) === 0,
  channel_decisions: [
    {
      channel: "Generic API directories",
      decision: "ready_for_private_or_unsubmitted_directory_draft",
      status: apiDirectoryPack.status,
      publication_blocked_until: "owner_approval",
      main_asset: `${PUBLIC_SITE}/api_directory_private_draft_pack_20260608.json`
    },
    {
      channel: "RapidAPI-style marketplace",
      decision: "ready_for_unpublished_provider_draft_monetization_blocked",
      status: rapidApiPack.status,
      publication_blocked_until: "owner_approval",
      main_asset: `${PUBLIC_SITE}/rapidapi_unpublished_provider_draft_pack_20260608.json`
    }
  ],
  recommended_next_step: failed.length === 0
    ? "Keep API-directory and RapidAPI-style assets as private/unsubmitted drafts; next run an MCP/agent-registry draft rehearsal or prepare owner-supervised manual review without publishing."
    : "Fix failed draft checks before any marketplace or API-directory preparation continues.",
  interpretation: failed.length === 0
    ? "A machine can evaluate both API-directory and RapidAPI-style draft metadata, understand the product and test route, and see that publication, monetization, production keys, payments, invoices and outreach remain blocked."
    : "The API marketplace draft path is not yet clean enough for a machine-buyer rehearsal.",
  resources: Object.fromEntries(Object.entries(resources).map(([name, resource]) => [name, {
    url: resource.url,
    status: resource.status,
    ok: resource.ok,
    json_ok: resource.json_ok,
    bytes: resource.bytes,
    hard_fails: resource.hard_fails,
    missing_markers: resource.marker_checks.filter((check) => !check.ok).map((check) => check.marker)
  }])),
  checks,
  failed_checks: failed
};

fs.writeFileSync(OUTPUT_SUMMARY, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

const lines = [
  "# MachineSignal - API Marketplace Draft Rehearsal NoWrite Probe",
  "",
  "## Scope",
  "",
  "This probe verifies whether a machine can evaluate the MachineSignal generic API-directory and RapidAPI-style marketplace draft assets without external publication, live monetization, real keys, real payments, invoices or human outreach.",
  "",
  "## Result",
  "",
  `- Status: **${summary.status}**`,
  `- OK: **${summary.ok}**`,
  "- Channels checked: Generic API directories; RapidAPI-style marketplace",
  "- Write calls executed: 0",
  "- POST calls executed by this probe: 0",
  "- External publication executed: false",
  "- Live monetization enabled: false",
  "- Public paid plans enabled: false",
  "- Production API key published: false",
  "- Human outreach executed: false",
  "",
  "## Machine Interpretation",
  "",
  summary.interpretation,
  "",
  "## Channel Decisions",
  "",
  ...summary.channel_decisions.map((decision) => `- ${decision.channel}: ${decision.decision}; status=${decision.status}; blocked_until=${decision.publication_blocked_until}`),
  "",
  "## Public Resources",
  "",
  ...Object.entries(resources).map(([name, resource]) => `- ${name}: HTTP ${resource.status}, json=${resource.json_ok}, hard_fails=${resource.hard_fails.length}, ${resource.url}`),
  "",
  "## Checks",
  "",
  ...checks.map((check) => `- ${check.ok ? "PASS" : "FAIL"} - ${check.name}: ${check.details}`),
  "",
  "## Guardrails Confirmed",
  "",
  "- API-directory draft remains private or unsubmitted until owner approval.",
  "- RapidAPI-style provider draft remains unpublished and monetization-disabled.",
  "- Marketplace pricing tiers are not created.",
  "- No production key is published.",
  "- No payment, fiscal invoice, external publication or human outreach is executed."
];

fs.writeFileSync(OUTPUT_REPORT, `${lines.join("\n")}\n`, "utf8");

if (failed.length > 0) {
  console.error(JSON.stringify(summary, null, 2));
  process.exit(2);
}

console.log(JSON.stringify(summary, null, 2));
