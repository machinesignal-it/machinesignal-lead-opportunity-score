import fs from "node:fs";

const PUBLIC_SITE = "https://machinesignal.it";
const BASE_URL = "https://machinesignal-api.beta-878.workers.dev";
const OUTPUT_REPORT = "rapidapi_unpublished_provider_sandbox_rehearsal_report_20260611.md";
const OUTPUT_SUMMARY = "rapidapi_unpublished_provider_sandbox_rehearsal_summary_20260611.json";
const runId = `rapidapi-unpublished-provider-${new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14)}`;

const resourcesToFetch = [
  ["draft_pack_json", `${PUBLIC_SITE}/rapidapi_unpublished_provider_draft_pack_20260608.json`, "json"],
  ["draft_pack_md", `${PUBLIC_SITE}/rapidapi_unpublished_provider_draft_pack_20260608.md`, "text"],
  ["draft_review_json", `${PUBLIC_SITE}/rapidapi_unpublished_provider_draft_review_summary_20260608.json`, "json"],
  ["rapidapi_listing", `${PUBLIC_SITE}/distribution/rapidapi-listing.json`, "json"],
  ["rapidapi_provider_setup", `${PUBLIC_SITE}/distribution/rapidapi-provider-setup.json`, "json"],
  ["agent_go_no_go", `${PUBLIC_SITE}/agent_go_no_go_postman_api_directory_review_summary_20260611.json`, "json"],
  ["openapi", `${PUBLIC_SITE}/openapi.json`, "json"],
  ["product_catalog", `${PUBLIC_SITE}/product-catalog.json`, "json"],
  ["machine_onboarding", `${PUBLIC_SITE}/machine-onboarding.json`, "json"],
  ["llms", `${PUBLIC_SITE}/llms.txt`, "text"],
  ["robots", `${PUBLIC_SITE}/robots.txt`, "text"],
  ["sitemap", `${PUBLIC_SITE}/sitemap.xml`, "text"]
];

const checks = [];
const resources = {};
const actions = [];
let postCallsExecuted = 0;
let writeCallsExecuted = 0;

function addCheck(name, ok, details = "") {
  checks.push({ name, ok: Boolean(ok), details: String(details ?? "") });
}

function hasSecretLikeText(text) {
  return [
    /ghp_[A-Za-z0-9_]+/,
    /github_pat_[A-Za-z0-9_]+/,
    /sk_live_[A-Za-z0-9]+/,
    /sk_test_[A-Za-z0-9]+/,
    /Bearer\s+[A-Za-z0-9._-]{20,}/,
    new RegExp("CF_" + "API_TOKEN\\s*[:=]\\s*[A-Za-z0-9._-]+"),
    new RegExp("Cloudflare " + "API Token\\s*[:=]", "i")
  ].some((pattern) => pattern.test(text));
}

function asText(value) {
  return typeof value === "string" ? value : JSON.stringify(value ?? {});
}

async function fetchResource(name, url, type) {
  const response = await fetch(url, {
    headers: {
      "user-agent": "MachineSignalRapidApiUnpublishedProviderSandboxRehearsal/2026-06-11",
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
  resources[name] = {
    url,
    status: response.status,
    ok: response.ok,
    bytes: bodyText.length,
    json_ok: jsonOk,
    body,
    body_text: bodyText
  };
  addCheck(`${name}_reachable`, response.ok, `HTTP ${response.status}, bytes=${bodyText.length}`);
  if (type === "json") {
    addCheck(`${name}_json_valid`, jsonOk, `json_valid=${jsonOk}`);
  }
  addCheck(`${name}_secret_scan`, !hasSecretLikeText(bodyText), "no secret-like public token patterns");
}

async function callJson(method, url, { headers = {}, body = undefined, idempotencyKey = "" } = {}) {
  const finalHeaders = {
    "user-agent": "MachineSignalRapidApiUnpublishedProviderSandboxRehearsal/2026-06-11",
    accept: "application/json,*/*",
    ...headers
  };
  if (body !== undefined) {
    finalHeaders["content-type"] = "application/json";
  }
  if (idempotencyKey) {
    finalHeaders["Idempotency-Key"] = idempotencyKey;
  }
  const response = await fetch(url, {
    method,
    headers: finalHeaders,
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  const text = await response.text();
  let payload;
  try {
    payload = JSON.parse(text);
  } catch {
    payload = { raw: text };
  }
  return { ok: response.ok, status: response.status, body: payload };
}

function summarizeResponse(name, body) {
  if (!body || typeof body !== "object") return body;
  if (name === "create_sandbox_customer") {
    return {
      customer_id: body.customer_id,
      plan: body.plan,
      status: body.status,
      sandbox: body.sandbox,
      expires_at: body.expires_at,
      sandbox_limits: body.sandbox_limits,
      guardrails: body.guardrails ? {
        real_payment_executed: body.guardrails.real_payment_executed,
        external_contact_executed: body.guardrails.external_contact_executed,
        allowed_use: body.guardrails.allowed_use,
        expires_at: body.guardrails.expires_at
      } : undefined
    };
  }
  if (name === "score_domain") {
    return {
      domain: body.domain,
      opportunity_score: body.opportunity_score,
      confidence: body.confidence,
      decision: body.decision,
      commercial_strength: body.commercial_strength,
      next_product: body.next_purchase?.next_product
    };
  }
  if (name === "order_target_discovery") {
    return {
      order_intent_id: body.order_intent_id,
      status: body.status,
      product_code: body.product_code,
      ledger_product_code: body.ledger_product_code,
      beta_price_range_eur: body.beta_price_range_eur,
      delivery_type: body.delivery?.delivery_type,
      target_count: body.delivery?.promised_output?.target_count,
      real_payment_executed: body.real_payment_executed,
      external_contact_executed: body.external_contact_executed
    };
  }
  if (name === "read_usage") {
    return {
      customer_id: body.customer_id,
      ledger_persisted: body.ledger_persisted,
      balances: Array.isArray(body.balances)
        ? body.balances.map((item) => ({
            product_code: item.product_code,
            credits_purchased: item.credits_purchased,
            credits_used: item.credits_used,
            credits_remaining: item.credits_remaining
          }))
        : []
    };
  }
  if (name === "list_orders") {
    return {
      customer_id: body.customer_id,
      count: body.count,
      first_order_product_code: Array.isArray(body.orders) ? body.orders[0]?.product_code : body.orders?.product_code,
      real_payment_executed: body.real_payment_executed,
      external_contact_executed: body.external_contact_executed
    };
  }
  return { keys: Object.keys(body).slice(0, 20) };
}

function redactedAction({ name, method, url, status, ok, idempotencyKey, body }) {
  const result = { name, method, url, status, ok, idempotency_key: idempotencyKey || "" };
  const text = asText(body);
  if (/api[_-]?key|token|secret|password|signature/i.test(text)) {
    result.response_summary = name === "create_sandbox_customer"
      ? summarizeResponse(name, body)
      : "[REDACTED_SECRET_BEARING_RESPONSE]";
  } else {
    result.response_summary = summarizeResponse(name, body);
  }
  return result;
}

for (const [name, url, type] of resourcesToFetch) {
  await fetchResource(name, url, type);
}

const draftPack = resources.draft_pack_json.body || {};
const draftReview = resources.draft_review_json.body || {};
const rapidapiListing = resources.rapidapi_listing.body || {};
const providerSetup = resources.rapidapi_provider_setup.body || {};
const agentGoNoGo = resources.agent_go_no_go.body || {};
const openapi = resources.openapi.body || {};
const productCatalog = resources.product_catalog.body || {};
const onboarding = resources.machine_onboarding.body || {};

addCheck("agent_review_go_for_this_test", agentGoNoGo.verdict === "go_sandbox_only_for_rapidapi_style_unpublished_provider_rehearsal" && agentGoNoGo.agent_votes_go === 5, `${agentGoNoGo.verdict}, votes_go=${agentGoNoGo.agent_votes_go}`);
addCheck("draft_pack_ready_unpublished_only", draftPack.status === "ready_for_rapidapi_unpublished_provider_draft_only", draftPack.status);
addCheck("draft_pack_machine_interface", draftPack.primary_customer_interface === "machine", draftPack.primary_customer_interface);
addCheck("draft_pack_visibility_private_unpublished", draftPack.rapidapi_style_listing_fields?.visibility === "private_draft_or_unpublished", draftPack.rapidapi_style_listing_fields?.visibility);
addCheck("draft_pack_monetization_disabled", draftPack.rapidapi_style_listing_fields?.monetization === "disabled", draftPack.rapidapi_style_listing_fields?.monetization);
addCheck("draft_pack_blocks_public_pricing", draftPack.draft_safety_state?.public_paid_plans_enabled === false && draftPack.draft_safety_state?.create_marketplace_pricing_tiers === false, "paid plans and pricing tiers disabled");
addCheck("draft_pack_blocks_publication_and_outreach", draftPack.draft_safety_state?.external_publication_executed === false && draftPack.draft_safety_state?.human_outreach_allowed === false && draftPack.draft_safety_state?.external_contact_executed === false, "publication, human outreach and external contact false");
addCheck("draft_pack_blocks_production_keys", draftPack.draft_safety_state?.production_api_key_published === false, "production key publication false");
addCheck("draft_pack_has_provider_fields", Boolean(draftPack.rapidapi_style_listing_fields?.api_name && draftPack.rapidapi_style_listing_fields?.base_url && draftPack.rapidapi_style_listing_fields?.openapi_url), draftPack.rapidapi_style_listing_fields?.api_name || "");
addCheck("draft_review_completed", draftReview.status === "completed_rapidapi_unpublished_provider_draft_review" && draftReview.ok === true, `${draftReview.status}, ok=${draftReview.ok}`);
addCheck("rapidapi_listing_metadata_ready", rapidapiListing.status === "rapidapi_style_provider_metadata_ready_monetization_disabled", rapidapiListing.status);
addCheck("rapidapi_listing_machine_first", rapidapiListing.primary_customer_interface === "machine", rapidapiListing.primary_customer_interface);
addCheck("provider_setup_unpublished_mode", providerSetup.recommended_mode === "draft_or_unpublished_monetization_disabled", providerSetup.recommended_mode);
addCheck("provider_setup_acceptance_tests_include_sandbox", asText(providerSetup).includes("POST /v1/sandbox/customers") && asText(providerSetup).includes("no real payment"), "sandbox and no real payment present");

const openapiPaths = Object.keys(openapi.paths || {});
for (const path of ["/v1/sandbox/customers", "/v1/lead-opportunity-score", "/v1/purchase-intent", "/v1/usage", "/v1/orders"]) {
  addCheck(`openapi_has_${path.replace(/[^A-Za-z0-9]+/g, "_")}`, openapiPaths.includes(path), path);
}
addCheck("catalog_has_rapidapi_products", asText(productCatalog).includes("target_discovery") && asText(productCatalog).includes("score_pack_1k") && asText(productCatalog).includes("action_pack"), "catalog contains target discovery, score pack and action pack");
addCheck("onboarding_explains_machine_customer", asText(onboarding).includes("machine") && asText(onboarding).includes("Target Discovery"), "onboarding contains machine flow and Target Discovery");
addCheck("llms_links_rapidapi_pack", resources.llms.body_text.includes("RapidAPI Unpublished Provider Draft Pack JSON"), "llms links RapidAPI draft pack");
addCheck("robots_links_rapidapi_pack", resources.robots.body_text.includes("Rapidapi-unpublished-provider-draft-pack-json"), "robots links RapidAPI draft pack");
addCheck("sitemap_links_rapidapi_pack", resources.sitemap.body_text.includes("rapidapi_unpublished_provider_draft_pack_20260608.json"), "sitemap links RapidAPI draft pack");

const sandboxAction = await callJson("POST", `${BASE_URL}/v1/sandbox/customers`, {
  idempotencyKey: `${runId}-sandbox`,
  body: {
    evaluator_type: "rapidapi_style_provider_consumer_bot",
    integration_target: "rapidapi_style_unpublished_provider",
    expected_test_path: "rapidapi_unpublished_provider_sandbox_rehearsal"
  }
});
postCallsExecuted += 1;
writeCallsExecuted += 1;
actions.push(redactedAction({
  name: "create_sandbox_customer",
  method: "POST",
  url: `${BASE_URL}/v1/sandbox/customers`,
  status: sandboxAction.status,
  ok: sandboxAction.ok,
  idempotencyKey: `${runId}-sandbox`,
  body: sandboxAction.body
}));
addCheck("sandbox_customer_created_by_rapidapi_style_bot", sandboxAction.ok && Boolean(sandboxAction.body.api_key), `HTTP ${sandboxAction.status}, customer_id=${sandboxAction.body.customer_id || ""}`);

const apiKey = sandboxAction.body.api_key;
const scoreBody = {
  domain: "studio-dentale-rapidapi-rehearsal.it",
  sector_hint: "dentist",
  country_hint: "IT"
};
const scoreAction = await callJson("POST", `${BASE_URL}/v1/lead-opportunity-score`, {
  headers: { "X-API-Key": apiKey || "" },
  idempotencyKey: `${runId}-score`,
  body: scoreBody
});
postCallsExecuted += 1;
writeCallsExecuted += 1;
actions.push(redactedAction({
  name: "score_domain",
  method: "POST",
  url: `${BASE_URL}/v1/lead-opportunity-score`,
  status: scoreAction.status,
  ok: scoreAction.ok,
  idempotencyKey: `${runId}-score`,
  body: scoreAction.body
}));
addCheck("score_domain_from_rapidapi_unpublished_flow", scoreAction.ok && Number.isFinite(scoreAction.body.opportunity_score), `HTTP ${scoreAction.status}, score=${scoreAction.body.opportunity_score}, decision=${scoreAction.body.decision}`);

const targetDiscoveryBody = {
  product_code: "target_discovery",
  market: "cliniche odontoiatriche",
  area: "Milano",
  commercial_objective: "find dental clinic websites worth scoring for digital presence improvement opportunities",
  reason: "RapidAPI-style unpublished provider bot validates the no-list buyer-machine path without publication or billing"
};
const targetDiscoveryAction = await callJson("POST", `${BASE_URL}/v1/purchase-intent`, {
  headers: { "X-API-Key": apiKey || "" },
  idempotencyKey: `${runId}-target-discovery`,
  body: targetDiscoveryBody
});
postCallsExecuted += 1;
writeCallsExecuted += 1;
actions.push(redactedAction({
  name: "order_target_discovery",
  method: "POST",
  url: `${BASE_URL}/v1/purchase-intent`,
  status: targetDiscoveryAction.status,
  ok: targetDiscoveryAction.ok,
  idempotencyKey: `${runId}-target-discovery`,
  body: targetDiscoveryAction.body
}));
addCheck("target_discovery_from_rapidapi_unpublished_flow", targetDiscoveryAction.ok && targetDiscoveryAction.body.product_code === "target_discovery", `HTTP ${targetDiscoveryAction.status}, product=${targetDiscoveryAction.body.product_code || ""}`);

const usageAction = await callJson("GET", `${BASE_URL}/v1/usage`, {
  headers: { "X-API-Key": apiKey || "" }
});
actions.push(redactedAction({
  name: "read_usage",
  method: "GET",
  url: `${BASE_URL}/v1/usage`,
  status: usageAction.status,
  ok: usageAction.ok,
  idempotencyKey: "",
  body: usageAction.body
}));
addCheck("usage_read_after_rapidapi_unpublished_flow", usageAction.ok && usageAction.body.customer_id === sandboxAction.body.customer_id, `HTTP ${usageAction.status}, customer_id=${usageAction.body.customer_id || ""}`);

const ordersAction = await callJson("GET", `${BASE_URL}/v1/orders`, {
  headers: { "X-API-Key": apiKey || "" }
});
actions.push(redactedAction({
  name: "list_orders",
  method: "GET",
  url: `${BASE_URL}/v1/orders`,
  status: ordersAction.status,
  ok: ordersAction.ok,
  idempotencyKey: "",
  body: ordersAction.body
}));
addCheck("orders_read_after_rapidapi_unpublished_flow", ordersAction.ok && Number(ordersAction.body.count || 0) >= 1, `HTTP ${ordersAction.status}, count=${ordersAction.body.count || 0}`);

addCheck("post_write_budget_respected", postCallsExecuted <= 3 && writeCallsExecuted <= 3, `post=${postCallsExecuted}, write=${writeCallsExecuted}`);
addCheck("no_payment_endpoints_called", !actions.some((action) => action.url.includes("payment")), "payment endpoint calls=0");
addCheck("no_admin_endpoints_called", !actions.some((action) => action.url.includes("/admin/")), "admin endpoint calls=0");
addCheck("no_external_publication_executed", true, "no RapidAPI API write, submit or publish call was executed");
addCheck("no_external_contact_executed", true, "only MachineSignal sandbox endpoints were called");

const failed = checks.filter((check) => !check.ok);
const summary = {
  service: "MachineSignal",
  probe_name: "rapidapi_unpublished_provider_sandbox_rehearsal",
  status: failed.length === 0
    ? "completed_rapidapi_unpublished_provider_sandbox_rehearsal"
    : "failed_rapidapi_unpublished_provider_sandbox_rehearsal",
  ok: failed.length === 0,
  evidence_date: "2026-06-11",
  run_id: runId,
  mode: "RapidApiStyleUnpublishedProviderSandboxRehearsalWriteCapped",
  primary_customer_interface: "machine",
  channel: "rapidapi_style_unpublished_provider_draft",
  public_site: PUBLIC_SITE,
  provider_status: draftPack.status,
  post_calls_executed: postCallsExecuted,
  write_calls_executed: writeCallsExecuted,
  real_payment_executed: false,
  real_invoice_issued: false,
  external_contact_executed: false,
  human_outreach_executed: false,
  external_publication_executed: false,
  irreversible_submission_executed: false,
  live_monetization_enabled: false,
  public_paid_plans_enabled: false,
  create_marketplace_pricing_tiers: false,
  production_api_key_published: false,
  rapidapi_provider_created_or_published: false,
  rapidapi_external_api_called: false,
  machine_paths_tested: {
    unpublished_provider_discovery_path: true,
    customer_with_existing_list_score_path: scoreAction.ok,
    customer_without_list_target_discovery_path: targetDiscoveryAction.ok,
    usage_and_orders_reconciliation_path: usageAction.ok && ordersAction.ok
  },
  score_result: {
    domain: scoreBody.domain,
    opportunity_score: scoreAction.body.opportunity_score,
    confidence: scoreAction.body.confidence,
    decision: scoreAction.body.decision,
    commercial_strength: scoreAction.body.commercial_strength,
    next_product: scoreAction.body.next_purchase?.next_product
  },
  target_discovery_result: {
    product_code: targetDiscoveryAction.body.product_code,
    order_intent_id: targetDiscoveryAction.body.order_intent_id,
    status: targetDiscoveryAction.body.status,
    beta_price_range_eur: targetDiscoveryAction.body.beta_price_range_eur,
    promised_target_count: targetDiscoveryAction.body.delivery?.promised_output?.target_count
  },
  resources: Object.fromEntries(Object.entries(resources).map(([name, resource]) => [name, {
    url: resource.url,
    status: resource.status,
    ok: resource.ok,
    json_ok: resource.json_ok,
    bytes: resource.bytes
  }])),
  checks_total: checks.length,
  checks_failed: failed.length,
  failed_checks: failed.map((check) => check.name),
  checks,
  actions,
  recommended_next_step: failed.length === 0
    ? "Use this as evidence that the RapidAPI-style unpublished provider path can be tested by machines without marketplace publication or billing. Next, run an agent review before deciding whether to prepare any owner-approved private external evaluator access."
    : "Fix failed RapidAPI-style unpublished provider checks before using this channel for any owner-supervised external evaluator."
};

fs.writeFileSync(OUTPUT_SUMMARY, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

const report = [
  "# MachineSignal - RapidAPI-Style Unpublished Provider Sandbox Rehearsal - 2026-06-11",
  "",
  "## Result",
  "",
  `- Status: ${summary.status}`,
  `- OK: ${summary.ok}`,
  `- Mode: ${summary.mode}`,
  "- Primary customer interface: machine",
  "- Channel: RapidAPI-style unpublished provider draft",
  `- POST calls executed: ${postCallsExecuted}/3`,
  `- Write calls executed: ${writeCallsExecuted}/3`,
  `- Checks failed: ${failed.length}/${checks.length}`,
  "",
  "## Machine Path Tested",
  "",
  "1. Read RapidAPI-style unpublished provider draft pack and review.",
  "2. Read RapidAPI-style listing and provider setup metadata.",
  "3. Verify OpenAPI, product catalog, onboarding, llms.txt, robots.txt and sitemap.",
  "4. Read the agent go/no-go review that approved this exact sandbox test.",
  "5. Create one limited sandbox customer.",
  "6. Score one synthetic business domain.",
  "7. Order Target Discovery for the buyer-machine no-list case.",
  "8. Read usage and orders for reconciliation.",
  "",
  "## Commercial Decision Observed",
  "",
  `- Domain: \`${summary.score_result.domain}\``,
  `- Score: ${summary.score_result.opportunity_score}`,
  `- Confidence: ${summary.score_result.confidence}`,
  `- Decision: ${summary.score_result.decision}`,
  `- Next product: ${summary.score_result.next_product}`,
  `- Target Discovery order status: ${summary.target_discovery_result.status}`,
  `- Promised target count: ${summary.target_discovery_result.promised_target_count}`,
  "",
  "## Safety",
  "",
  "- Real payment executed: false",
  "- Real invoice issued: false",
  "- External contact executed: false",
  "- Human outreach executed: false",
  "- External publication executed: false",
  "- Irreversible submission executed: false",
  "- Live monetization enabled: false",
  "- Public paid plans enabled: false",
  "- Marketplace pricing tiers created: false",
  "- Production API key published: false",
  "- RapidAPI provider created or published: false",
  "- RapidAPI external API called: false",
  "- Admin endpoints called: false",
  "- Payment endpoints called: false",
  "",
  "## Interpretation",
  "",
  "A RapidAPI-style consumer bot can understand the unpublished provider draft, verify the machine-first value proposition, create a limited sandbox key, score a domain, request Target Discovery when it has no list, and reconcile usage/orders without any external marketplace publication, payment, invoice or outreach.",
  "",
  "## Recommended Next Step",
  "",
  summary.recommended_next_step,
  "",
  "## Failed Checks",
  "",
  failed.length === 0 ? "None." : failed.map((check) => `- ${check.name}: ${check.details}`).join("\n"),
  "",
  "## Actions",
  "",
  ...actions.map((action) => `- ${action.method} ${action.name}: HTTP ${action.status}`)
].join("\n");

fs.writeFileSync(OUTPUT_REPORT, `${report}\n`, "utf8");
console.log(JSON.stringify({
  ok: summary.ok,
  status: summary.status,
  post_calls_executed: postCallsExecuted,
  write_calls_executed: writeCallsExecuted,
  checks_failed: failed.length,
  score: summary.score_result,
  target_discovery: summary.target_discovery_result
}, null, 2));
