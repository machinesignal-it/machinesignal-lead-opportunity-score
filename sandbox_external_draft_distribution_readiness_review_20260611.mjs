import fs from "node:fs";

const PUBLIC_SITE = "https://machinesignal.it";
const OUTPUT_JSON = "sandbox_external_draft_distribution_readiness_review_summary_20260611.json";
const OUTPUT_MD = "sandbox_external_draft_distribution_readiness_review_report_20260611.md";

const checks = [];
const resources = {};

function addCheck(name, ok, details = "") {
  checks.push({ name, ok: Boolean(ok), details });
}

function textOf(value) {
  return typeof value === "string" ? value : JSON.stringify(value ?? {});
}

function includes(value, needle) {
  return textOf(value).includes(needle);
}

function getPath(object, path) {
  return path.split(".").reduce((acc, key) => {
    if (acc === undefined || acc === null) return undefined;
    return Object.hasOwn(acc, key) ? acc[key] : undefined;
  }, object);
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
    /Bearer\s+[A-Za-z0-9._-]{20,}/
  ];
  return patterns.filter((pattern) => pattern.test(text)).map(String);
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
    marker_checks: [],
    secret_hits: [],
    elapsed_ms: 0,
    error: null,
    body: null,
    text: ""
  };

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "MachineSignal-Sandbox-External-Draft-Distribution-Readiness/2026-06-11",
        Accept: json ? "application/json,text/plain,*/*" : "text/plain,text/html,application/xml,*/*",
        "Cache-Control": "no-cache"
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
    result.marker_checks = markers.map((marker) => ({ marker, ok: text.includes(marker) }));
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
    `${name}_reachable_and_clean`,
    result.ok,
    `HTTP ${result.http_status}; bytes=${result.bytes}; json=${result.json_valid}; markers=${result.marker_checks.filter((item) => item.ok).length}/${result.marker_checks.length}; secrets=${result.secret_hits.length}`
  );
  return result;
}

const resourcePlan = [
  ["product_catalog", `${PUBLIC_SITE}/product-catalog.json`, true, ["machine_buying_scenarios", "target_discovery_pack_250", "action_pack_25"]],
  ["machine_onboarding", `${PUBLIC_SITE}/machine-onboarding.json`, true, ["completed_agent_go_no_go_sandbox_review", "sandbox_customers", "purchase-intent"]],
  ["openapi", `${PUBLIC_SITE}/openapi.json`, true, ["/v1/lead-opportunity-score", "/v1/purchase-intent", "action_pack_gate_failed"]],
  ["postman_collection", `${PUBLIC_SITE}/postman_public_collection.json`, true, ["Score business domain", "Create beta purchase intent"]],
  ["mcp_manifest", `${PUBLIC_SITE}/mcp-tool-manifest.json`, true, ["score_lead_opportunity", "create_purchase_intent", "agent_go_no_go_sandbox_review_json"]],
  ["marketplace_pack", `${PUBLIC_SITE}/distribution/marketplace-submission-pack.json`, true, ["external_publication_policy", "latest_agent_go_no_go_sandbox_review"]],
  ["channel_shortlist", `${PUBLIC_SITE}/distribution/channel-shortlist.json`, true, ["Postman", "RapidAPI", "MCP"]],
  ["agent_review", `${PUBLIC_SITE}/agent_go_no_go_sandbox_review_summary_20260611.json`, true, ["completed_agent_go_no_go_sandbox_review", "go_conditionally_for_sandbox_only_next_step"]],
  ["machine_buyer_e2e", `${PUBLIC_SITE}/machine_buyer_end_to_end_rehearsal_summary_20260611.json`, true, ["completed_machine_buyer_end_to_end_rehearsal", "buy_deep_analysis"]],
  ["distribution_monitor", `${PUBLIC_SITE}/distribution_readiness_monitor_summary_20260607.json`, true, ["ready_for_distribution_review", "checks_failed"]],
  ["existing_list_example", `${PUBLIC_SITE}/examples/integration_existing_list_score_request.json`, true, ["customer_has_existing_list", "lead-opportunity-score"]],
  ["no_list_example", `${PUBLIC_SITE}/examples/integration_no_list_target_discovery_request.json`, true, ["customer_has_no_list", "target_discovery"]],
  ["action_pack_example", `${PUBLIC_SITE}/examples/integration_action_pack_crm_payload.json`, true, ["customer_wants_action_payload", "action_pack"]],
  ["llms", `${PUBLIC_SITE}/llms.txt`, false, ["Agent Go/No-Go Sandbox Review JSON", "Machine Buyer End-to-End Rehearsal JSON"]],
  ["robots", `${PUBLIC_SITE}/robots.txt`, false, ["Agent-go-no-go-sandbox-review-json", "Machine-buyer-end-to-end-rehearsal-json"]],
  ["sitemap", `${PUBLIC_SITE}/sitemap.xml`, false, ["agent_go_no_go_sandbox_review_summary_20260611.json", "machine_buyer_end_to_end_rehearsal_summary_20260611.json"]]
];

for (const [name, url, json, markers] of resourcePlan) {
  await fetchResource(name, url, { json, markers });
}

const catalog = resources.product_catalog.body ?? {};
const onboarding = resources.machine_onboarding.body ?? {};
const openapi = resources.openapi.body ?? {};
const postman = resources.postman_collection.body ?? {};
const mcpManifest = resources.mcp_manifest.body ?? {};
const marketplacePack = resources.marketplace_pack.body ?? {};
const channelShortlist = resources.channel_shortlist.body ?? {};
const agentReview = resources.agent_review.body ?? {};
const e2e = resources.machine_buyer_e2e.body ?? {};
const monitor = resources.distribution_monitor.body ?? {};
const existingListExample = resources.existing_list_example.body ?? {};
const noListExample = resources.no_list_example.body ?? {};
const actionPackExample = resources.action_pack_example.body ?? {};

function scenarioCheck(prefix, name, ok, details = "") {
  addCheck(`${prefix}_${name}`, ok, details);
  return Boolean(ok);
}

function summarizeScenario(prefix, title, checksForScenario, machineDecision, nextMachineCall) {
  const passed = checksForScenario.filter(Boolean).length;
  return {
    scenario: prefix,
    title,
    understood_by_machine: passed === checksForScenario.length,
    checks_passed: passed,
    checks_total: checksForScenario.length,
    machine_decision: passed === checksForScenario.length ? machineDecision : "needs_public_asset_fix_before_machine_can_buy",
    next_machine_call: nextMachineCall
  };
}

const postmanText = textOf(postman);
const onboardingText = textOf(onboarding);
const openapiText = textOf(openapi);
const mcpText = textOf(mcpManifest);
const catalogText = textOf(catalog);
const marketplaceText = textOf(marketplacePack);
const channelText = textOf(channelShortlist);

const existingListChecks = [
  scenarioCheck("existing_list", "example_declares_existing_list", existingListExample.scenario === "customer_has_existing_list", existingListExample.scenario),
  scenarioCheck("existing_list", "first_call_is_score_endpoint", includes(existingListExample.url, "/v1/lead-opportunity-score") && includes(openapiText, "/v1/lead-opportunity-score"), "score endpoint documented"),
  scenarioCheck("existing_list", "catalog_maps_to_score_pack", getPath(catalog, "machine_buying_scenarios.customer_has_list.first_product") === "score_pack_1k", getPath(catalog, "machine_buying_scenarios.customer_has_list.first_product")),
  scenarioCheck("existing_list", "score_product_has_valid_output_rule", includes(getPath(catalog, "products.score_pack_1k.validity_rule"), "1000 valid scores") && includes(catalogText, "Duplicate"), "valid-output and duplicate rules present"),
  scenarioCheck("existing_list", "machine_knows_output_fields", ["opportunity_score", "confidence", "decision", "recommended next product"].every((needle) => includes(catalogText, needle) || includes(existingListExample, needle)), "score output fields present"),
  scenarioCheck("existing_list", "postman_or_mcp_has_score_tool", includes(postmanText, "Score business domain") && includes(mcpText, "score_lead_opportunity"), "Postman and MCP score path present"),
  scenarioCheck("existing_list", "idempotency_documented", includes(existingListExample, "Idempotency-Key") && includes(openapiText, "Idempotency-Key"), "idempotency key present")
];

const noListChecks = [
  scenarioCheck("no_list", "example_declares_no_list", noListExample.scenario === "customer_has_no_list", noListExample.scenario),
  scenarioCheck("no_list", "first_call_is_purchase_intent", includes(noListExample.url, "/v1/purchase-intent") && includes(openapiText, "/v1/purchase-intent"), "purchase-intent endpoint documented"),
  scenarioCheck("no_list", "product_code_target_discovery", getPath(noListExample, "body.product_code") === "target_discovery" && includes(catalogText, "target_discovery_pack_250"), getPath(noListExample, "body.product_code")),
  scenarioCheck("no_list", "catalog_explains_commercial_objective", includes(getPath(catalog, "machine_buying_scenarios.customer_has_no_list.required_inputs"), "commercial_objective") && includes(catalogText, "specific commercial objective"), "commercial objective present"),
  scenarioCheck("no_list", "insufficient_market_alternatives_present", includes(getPath(catalog, "products.target_discovery_pack_250.validity_rule"), "Mini Discovery") && includes(getPath(catalog, "products.target_discovery_pack_250.validity_rule"), "wider area"), "fallback alternatives present"),
  scenarioCheck("no_list", "machine_knows_next_call_after_discovery", includes(getPath(noListExample, "machine_policy.next_call"), "/v1/lead-opportunity-score") && includes(catalogText, "ready for scoring"), "next scoring call present"),
  scenarioCheck("no_list", "mcp_or_onboarding_exposes_purchase_intent", includes(mcpText, "create_purchase_intent") && includes(onboardingText, "purchase-intent"), "MCP/onboarding purchase-intent present")
];

const actionPackChecks = [
  scenarioCheck("action_pack_after_deep_analysis", "example_declares_action_payload", actionPackExample.scenario === "customer_wants_action_payload", actionPackExample.scenario),
  scenarioCheck("action_pack_after_deep_analysis", "deep_analysis_product_has_gate", includes(getPath(catalog, "products.deep_analysis_pack_100.includes"), "Action Pack purchase gate") && includes(getPath(catalog, "products.deep_analysis_pack_100.output_fields"), "action_pack_purchase_gate"), "Deep Analysis gate present"),
  scenarioCheck("action_pack_after_deep_analysis", "action_pack_requires_prior_evidence", includes(getPath(catalog, "products.action_pack_25.when_to_buy"), "Deep Analysis confirms") && includes(openapiText, "source_order_intent_id"), "source order gate present"),
  scenarioCheck("action_pack_after_deep_analysis", "gate_failure_documented", includes(openapiText, "action_pack_gate_failed") && includes(postmanText, "Action Pack"), "gate failure documented"),
  scenarioCheck("action_pack_after_deep_analysis", "e2e_proves_gate_passed", e2e.ok === true && e2e.purchases?.action_pack_gate_passed === true, `e2e ok=${e2e.ok}; gate=${e2e.purchases?.action_pack_gate_passed}`),
  scenarioCheck("action_pack_after_deep_analysis", "payload_is_crm_workflow_ready", ["crm_record_patch", "crm_task", "workflow_payload", "approval_gate"].every((needle) => includes(actionPackExample, needle) && includes(catalogText, needle)), "CRM/workflow payload fields present"),
  scenarioCheck("action_pack_after_deep_analysis", "external_contact_blocked", includes(actionPackExample, "External action is not executed automatically") && includes(catalogText, "compliance_guardrail"), "approval/compliance gate present")
];

const distributionChecks = [
  scenarioCheck("external_draft_distribution", "agent_review_go_sandbox_only", agentReview.ok === true && agentReview.verdict === "go_conditionally_for_sandbox_only_next_step", agentReview.verdict),
  scenarioCheck("external_draft_distribution", "monitor_green", monitor.ok === true && Number(monitor.checks_failed) === 0, `failed=${monitor.checks_failed}`),
  scenarioCheck("external_draft_distribution", "channels_cover_api_postman_mcp", ["Postman", "RapidAPI", "MCP"].every((needle) => includes(channelText, needle)) && includes(marketplaceText, "api-directory"), "channel assets present"),
  scenarioCheck("external_draft_distribution", "publication_stays_blocked", includes(marketplaceText, "external_publication_policy") && includes(marketplaceText, "owner_approval"), "owner approval required"),
  scenarioCheck("external_draft_distribution", "live_monetization_stays_false", [agentReview, e2e].every((item) => item.real_payment_executed !== true && item.live_monetization_enabled !== true), "real payment and live monetization not enabled"),
  scenarioCheck("external_draft_distribution", "public_surfaces_link_current_evidence", ["Agent Go/No-Go Sandbox Review JSON", "Machine Buyer End-to-End Rehearsal JSON"].every((needle) => includes(resources.llms.text, needle)), "llms links evidence")
];

const scenario_results = [
  summarizeScenario(
    "customer_with_existing_list",
    "Machine has a list and wants to score/prioritize it",
    existingListChecks,
    "buy_or_use_score_pack_1k_then_follow_score_next_product",
    "POST /v1/lead-opportunity-score"
  ),
  summarizeScenario(
    "customer_without_list",
    "Machine has no list and needs targets for a commercial objective",
    noListChecks,
    "buy_target_discovery_then_score_delivered_targets",
    "POST /v1/purchase-intent product_code=target_discovery"
  ),
  summarizeScenario(
    "action_pack_after_deep_analysis",
    "Machine buys Action Pack only after Deep Analysis confirms the gate",
    actionPackChecks,
    "buy_action_pack_only_with_valid_deep_analysis_source_order",
    "POST /v1/purchase-intent product_code=action_pack with source_order_intent_id"
  )
];

const failedChecks = checks.filter((check) => !check.ok);
const summary = {
  service: "MachineSignal",
  review_name: "sandbox_external_draft_distribution_readiness_review",
  status: failedChecks.length === 0
    ? "completed_sandbox_external_draft_distribution_readiness_review"
    : "failed_sandbox_external_draft_distribution_readiness_review",
  ok: failedChecks.length === 0,
  evidence_date: "2026-06-11",
  mode: "NoWriteExternalDraftDistributionReadiness",
  primary_customer_interface: "machine",
  machine_customer_mode: "machine_reads_public_assets_and_decides_whether_three_sandbox_only_purchase_paths_are_clear",
  write_calls_executed: 0,
  post_calls_executed: 0,
  real_payment_executed: false,
  real_invoice_issued: false,
  external_contact_executed: false,
  human_outreach_executed: false,
  external_publication_executed: false,
  live_monetization_enabled: false,
  production_api_key_published: false,
  public_paid_plans_enabled: false,
  resources_checked: Object.keys(resources).length,
  checks_total: checks.length,
  checks_failed: failedChecks.length,
  failed_checks: failedChecks,
  scenario_results,
  overall_machine_decision: scenario_results.every((scenario) => scenario.understood_by_machine)
    ? "ready_for_one_owner_approved_sandbox_only_external_draft_channel"
    : "fix_public_assets_before_external_draft_channel",
  blocked_until_owner_approval: [
    "enable_live_checkout",
    "issue_real_invoice",
    "publish_paid_marketplace_plan",
    "launch_hosted_mcp_publicly",
    "publish_production_api_key",
    "contact_humans_or_external_companies",
    "irreversible_external_publication"
  ],
  recommended_next_step: "Proceed to one owner-approved sandbox-only external draft channel, preferably Postman private/team workspace or an unpublished API directory draft, keeping monetization disabled.",
  public_report: `${PUBLIC_SITE}/sandbox_external_draft_distribution_readiness_review_report_20260611.md`,
  public_json: `${PUBLIC_SITE}/sandbox_external_draft_distribution_readiness_review_summary_20260611.json`,
  resources: Object.fromEntries(
    Object.entries(resources).map(([name, resource]) => [
      name,
      {
        url: resource.url,
        ok: resource.ok,
        http_status: resource.http_status,
        bytes: resource.bytes,
        json_valid: resource.json_valid,
        marker_checks: resource.marker_checks,
        secret_hits: resource.secret_hits,
        elapsed_ms: resource.elapsed_ms,
        error: resource.error
      }
    ])
  ),
  checks
};

const report = `# MachineSignal Sandbox External Draft Distribution Readiness Review - 2026-06-11

## Verdict

${summary.ok ? "GO for one owner-approved sandbox-only external draft channel." : "NO-GO until the failed checks are fixed."}

This was a NoWrite review. It performed only public GET requests. It did not create sandbox customers, did not score domains, did not create purchase intents, did not execute payments, did not issue invoices, did not contact external parties and did not publish to third-party marketplaces.

## Public Evidence

- Agent Go/No-Go Review: ${PUBLIC_SITE}/agent_go_no_go_sandbox_review_summary_20260611.json
- Machine Buyer End-to-End Rehearsal: ${PUBLIC_SITE}/machine_buyer_end_to_end_rehearsal_summary_20260611.json
- Distribution Monitor: ${PUBLIC_SITE}/distribution_readiness_monitor_summary_20260607.json
- OpenAPI: ${PUBLIC_SITE}/openapi.json
- Postman Collection: ${PUBLIC_SITE}/postman_public_collection.json
- MCP Manifest: ${PUBLIC_SITE}/mcp-tool-manifest.json

## Scenario Results

| Scenario | Machine understood? | Checks | Machine decision | Next call |
| --- | --- | ---: | --- | --- |
${scenario_results.map((scenario) => `| ${scenario.title} | ${scenario.understood_by_machine ? "yes" : "no"} | ${scenario.checks_passed}/${scenario.checks_total} | ${scenario.machine_decision} | \`${scenario.next_machine_call}\` |`).join("\n")}

## Distribution Guardrails

- write_calls_executed: ${summary.write_calls_executed}
- post_calls_executed: ${summary.post_calls_executed}
- real_payment_executed: ${summary.real_payment_executed}
- real_invoice_issued: ${summary.real_invoice_issued}
- external_contact_executed: ${summary.external_contact_executed}
- external_publication_executed: ${summary.external_publication_executed}
- live_monetization_enabled: ${summary.live_monetization_enabled}

## Checks

- resources_checked: ${summary.resources_checked}
- checks_total: ${summary.checks_total}
- checks_failed: ${summary.checks_failed}

${failedChecks.length === 0 ? "No failed checks." : failedChecks.map((check) => `- ${check.name}: ${check.details}`).join("\n")}

## Recommended Next Step

${summary.recommended_next_step}

## Blocked Until Owner Approval

${summary.blocked_until_owner_approval.map((item) => `- ${item}`).join("\n")}
`;

fs.writeFileSync(OUTPUT_JSON, `${JSON.stringify(summary, null, 2)}\n`);
fs.writeFileSync(OUTPUT_MD, report);

console.log(JSON.stringify({
  status: summary.status,
  ok: summary.ok,
  resources_checked: summary.resources_checked,
  checks_total: summary.checks_total,
  checks_failed: summary.checks_failed,
  overall_machine_decision: summary.overall_machine_decision,
  scenario_results: summary.scenario_results.map((scenario) => ({
    scenario: scenario.scenario,
    understood_by_machine: scenario.understood_by_machine,
    checks: `${scenario.checks_passed}/${scenario.checks_total}`
  }))
}, null, 2));
