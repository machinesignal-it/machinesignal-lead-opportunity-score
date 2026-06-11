import fs from "node:fs";

const PUBLIC_SITE = "https://machinesignal.it";
const OUTPUT_REPORT = "private_external_evaluator_access_simulated_nowrite_report_20260611.md";
const OUTPUT_SUMMARY = "private_external_evaluator_access_simulated_nowrite_summary_20260611.json";

const checks = [];
const resources = {};

const simulatedEvaluatorProfile = {
  evaluator_type: "external_machine_buyer_simulator",
  starting_knowledge: "none",
  has_existing_list: false,
  market: "cliniche odontoiatriche",
  area: "Milano",
  commercial_objective: "find dental clinic websites worth scoring for digital presence improvement opportunities"
};

function addCheck(name, ok, details = "") {
  checks.push({ name, ok: Boolean(ok), details: String(details ?? "") });
}

function textOf(value) {
  return typeof value === "string" ? value : JSON.stringify(value ?? {});
}

function includes(value, needle) {
  return textOf(value).includes(needle);
}

function getPath(object, path, fallback = undefined) {
  return path.split(".").reduce((acc, key) => {
    if (acc === undefined || acc === null) return undefined;
    if (!Object.hasOwn(acc, key)) return undefined;
    return acc[key];
  }, object) ?? fallback;
}

function strictSecretScan(text) {
  const patterns = [
    /ghp_[A-Za-z0-9_]{20,}/,
    /github_pat_[A-Za-z0-9_]{20,}/,
    /sk_live_[A-Za-z0-9]{20,}/,
    /sk_test_[A-Za-z0-9]{20,}/,
    /AKIA[0-9A-Z]{16}/,
    /-----BEGIN (RSA |EC |OPENSSH |)PRIVATE KEY-----/,
    /msig_live_[A-Za-z0-9_-]{12,}/,
    /cf_[A-Za-z0-9_-]{30,}/,
    /Bearer\s+[A-Za-z0-9._-]{20,}/
  ];
  return patterns.filter((pattern) => pattern.test(text)).map(String);
}

function scanNoPersonalData(value) {
  const text = textOf(value);
  const personalLikePatterns = [
    /[A-Z][a-z]+ [A-Z][a-z]+/g,
    /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,
    /\+?\d[\d\s().-]{7,}\d/g
  ];
  const hits = [];
  for (const pattern of personalLikePatterns) {
    const matches = text.match(pattern) || [];
    for (const match of matches) {
      if (match.includes("MachineSignal")) continue;
      if (match.includes("RapidAPI")) continue;
      hits.push(match);
    }
  }
  return hits;
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
      method: "GET",
      headers: {
        "User-Agent": "MachineSignal-Private-External-Evaluator-NoWrite/2026-06-11",
        Accept: json ? "application/json,text/plain,text/html,application/xml,*/*" : "text/plain,text/html,application/xml,*/*",
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
    } else {
      result.json_valid = null;
      result.body = text;
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
  ["home_page", `${PUBLIC_SITE}/`, false, ["MachineSignal"]],
  ["api_page", `${PUBLIC_SITE}/api/`, false, ["MachineSignal"]],
  ["beta_page", `${PUBLIC_SITE}/beta/`, false, ["MachineSignal"]],
  ["llms", `${PUBLIC_SITE}/llms.txt`, false, ["Agent Go/No-Go Private External Evaluator Review JSON", "RapidAPI-Style Unpublished Provider Sandbox Rehearsal JSON"]],
  ["robots", `${PUBLIC_SITE}/robots.txt`, false, ["Agent-go-no-go-private-external-evaluator-review-json", "Rapidapi-unpublished-provider-sandbox-rehearsal-json"]],
  ["sitemap", `${PUBLIC_SITE}/sitemap.xml`, false, ["agent_go_no_go_private_external_evaluator_review_summary_20260611.json", "rapidapi_unpublished_provider_sandbox_rehearsal_summary_20260611.json"]],
  ["well_known_machine_discovery", `${PUBLIC_SITE}/.well-known/machine-discovery.json`, true, ["machine", "openapi"]],
  ["openapi", `${PUBLIC_SITE}/openapi.json`, true, ["/v1/lead-opportunity-score", "/v1/purchase-intent", "Idempotency-Key"]],
  ["product_catalog", `${PUBLIC_SITE}/product-catalog.json`, true, ["target_discovery_pack_250", "score_pack_1k", "action_pack_25"]],
  ["machine_onboarding", `${PUBLIC_SITE}/machine-onboarding.json`, true, ["sandbox_customers", "purchase-intent", "Target Discovery"]],
  ["postman_collection", `${PUBLIC_SITE}/postman_public_collection.json`, true, ["Score business domain", "Create beta purchase intent"]],
  ["mcp_manifest", `${PUBLIC_SITE}/mcp-tool-manifest.json`, true, ["score_lead_opportunity", "create_purchase_intent"]],
  ["rapidapi_listing", `${PUBLIC_SITE}/distribution/rapidapi-listing.json`, true, ["rapidapi_style_provider_metadata_ready_monetization_disabled", "machine-customer"]],
  ["rapidapi_provider_setup", `${PUBLIC_SITE}/distribution/rapidapi-provider-setup.json`, true, ["draft_or_unpublished_monetization_disabled", "do_not_publish_monetized_until"]],
  ["rapidapi_rehearsal", `${PUBLIC_SITE}/rapidapi_unpublished_provider_sandbox_rehearsal_summary_20260611.json`, true, ["completed_rapidapi_unpublished_provider_sandbox_rehearsal", "rapidapi_style_unpublished_provider_draft"]],
  ["agent_private_evaluator_review", `${PUBLIC_SITE}/agent_go_no_go_private_external_evaluator_review_summary_20260611.json`, true, ["completed_agent_go_no_go_private_external_evaluator_review", "private_external_evaluator_access_simulated_no_write"]],
  ["distribution_monitor", `${PUBLIC_SITE}/distribution_readiness_monitor_summary_20260607.json`, true, ["ready_for_distribution_review", "checks_failed"]]
];

for (const [name, url, json, markers] of resourcePlan) {
  await fetchResource(name, url, { json, markers });
}

const openapi = resources.openapi.body ?? {};
const catalog = resources.product_catalog.body ?? {};
const onboarding = resources.machine_onboarding.body ?? {};
const postman = resources.postman_collection.body ?? {};
const mcp = resources.mcp_manifest.body ?? {};
const rapidapiListing = resources.rapidapi_listing.body ?? {};
const providerSetup = resources.rapidapi_provider_setup.body ?? {};
const rapidapiRehearsal = resources.rapidapi_rehearsal.body ?? {};
const agentReview = resources.agent_private_evaluator_review.body ?? {};
const monitor = resources.distribution_monitor.body ?? {};

const openapiText = textOf(openapi);
const catalogText = textOf(catalog);
const onboardingText = textOf(onboarding);
const postmanText = textOf(postman);
const mcpText = textOf(mcp);
const listingText = textOf(rapidapiListing);
const providerSetupText = textOf(providerSetup);

const requiredPaths = [
  "/v1/sandbox/customers",
  "/v1/lead-opportunity-score",
  "/v1/purchase-intent",
  "/v1/usage",
  "/v1/orders"
];
for (const path of requiredPaths) {
  addCheck(`openapi_has_${path.replace(/[^A-Za-z0-9]+/g, "_")}`, Boolean(openapi.paths?.[path]), path);
}

addCheck("catalog_explains_no_list_path", getPath(catalog, "machine_buying_scenarios.customer_has_no_list.first_product") === "target_discovery", getPath(catalog, "machine_buying_scenarios.customer_has_no_list.first_product"));
addCheck("catalog_explains_existing_list_path", getPath(catalog, "machine_buying_scenarios.customer_has_list.first_product") === "score_pack_1k", getPath(catalog, "machine_buying_scenarios.customer_has_list.first_product"));
addCheck("catalog_has_exact_target_discovery_price", Number(getPath(catalog, "products.target_discovery_pack_250.price_eur")) === 149, getPath(catalog, "products.target_discovery_pack_250.price_eur"));
addCheck("catalog_has_exact_score_pack_price", Number(getPath(catalog, "products.score_pack_1k.price_eur")) === 99, getPath(catalog, "products.score_pack_1k.price_eur"));
addCheck("catalog_defines_valid_output_rule", includes(catalogText, "credits are consumed only when the system produces a valid usable output"), "valid-output credit rule present");
addCheck("onboarding_explains_sandbox_and_purchase_intent", includes(onboardingText, "sandbox") && includes(onboardingText, "purchase-intent"), "sandbox and purchase-intent language present");
addCheck("postman_has_machine_flow_items", includes(postmanText, "Create limited sandbox customer") && includes(postmanText, "Score business domain"), "Postman collection includes evaluator path");
addCheck("mcp_manifest_has_machine_tools", includes(mcpText, "get_product_catalog") && includes(mcpText, "score_lead_opportunity"), "MCP manifest includes machine tools");
addCheck("rapidapi_listing_is_machine_first", rapidapiListing.primary_customer_interface === "machine", rapidapiListing.primary_customer_interface);
addCheck("rapidapi_listing_keeps_monetization_disabled", rapidapiListing.status === "rapidapi_style_provider_metadata_ready_monetization_disabled", rapidapiListing.status);
addCheck("provider_setup_blocks_public_paid_mode", providerSetup.recommended_mode === "draft_or_unpublished_monetization_disabled" && includes(providerSetupText, "do_not_publish_monetized_until"), providerSetup.recommended_mode);
addCheck("latest_rapidapi_rehearsal_ok", rapidapiRehearsal.ok === true && rapidapiRehearsal.checks_failed === 0, `${rapidapiRehearsal.status}, checks_failed=${rapidapiRehearsal.checks_failed}`);
addCheck("agent_review_approved_nowrite_only", agentReview.verdict === "go_simulated_private_external_evaluator_nowrite_only" && agentReview.agent_votes_go === 5, `${agentReview.verdict}, votes=${agentReview.agent_votes_go}`);
addCheck("monitor_currently_clean", monitor.ok === true && Number(monitor.checks_failed) === 0, `ok=${monitor.ok}, checks_failed=${monitor.checks_failed}`);

const noListChoice = {
  selected_product: "target_discovery_pack_250",
  reason: "The simulated external evaluator has no starting list and needs coherent targets for a declared market, area and commercial objective.",
  price_eur: getPath(catalog, "products.target_discovery_pack_250.price_eur"),
  required_input: {
    product_code: "target_discovery",
    market: simulatedEvaluatorProfile.market,
    area: simulatedEvaluatorProfile.area,
    commercial_objective: simulatedEvaluatorProfile.commercial_objective
  },
  expected_output: {
    target_count: 250,
    format: "machine-readable JSON or CSV",
    next_machine_call: "POST /v1/lead-opportunity-score for each valid discovered domain"
  },
  simulated_purchase_intent: "would_simulate_purchase_intent_if_write_allowed",
  actual_purchase_intent_executed: false
};

const existingListChoice = {
  selected_product: "score_pack_1k",
  reason: "If the evaluator already had domains, it would buy valid scores before spending campaign or CRM budget.",
  price_eur: getPath(catalog, "products.score_pack_1k.price_eur"),
  required_input: {
    domain: "example-business-domain.test",
    sector_hint: "sector",
    country_hint: "IT"
  },
  expected_output: {
    fields: ["opportunity_score", "confidence", "decision", "commercial_strength", "next_purchase"]
  },
  actual_score_executed: false
};

const simulatedDecision = {
  decision: "machine_understands_and_would_test_target_discovery_in_sandbox_if_write_allowed",
  confidence: 0.83,
  selected_primary_product: noListChoice.selected_product,
  secondary_product_if_list_exists: existingListChoice.selected_product,
  would_create_sandbox_customer_if_write_allowed: true,
  actual_sandbox_customer_created: false,
  would_create_purchase_intent_if_write_allowed: true,
  actual_purchase_intent_created: false,
  why: [
    "Public assets explain that MachineSignal sells machine-readable lead opportunity decisions and target discovery outputs.",
    "Product catalog gives exact products, prices, required inputs and output expectations.",
    "OpenAPI and Postman expose the endpoint path a machine would use once writes are allowed."
  ],
  remaining_trust_gaps_before_real_external_access: [
    "private evaluator access pack with expiration and revocation policy",
    "terms/privacy/DPA review before real data",
    "rate limits and abuse policy for external keys",
    "retention period for evaluator logs",
    "owner approval before any real invite"
  ]
};

const personalDataHits = scanNoPersonalData({
  simulatedEvaluatorProfile,
  noListChoice,
  existingListChoice,
  simulatedDecision
});
addCheck("simulated_inputs_have_no_personal_data", personalDataHits.length === 0, personalDataHits.join(", "));

const failed = checks.filter((check) => !check.ok);
const summary = {
  service: "MachineSignal",
  probe_name: "private_external_evaluator_access_simulated_no_write",
  status: failed.length === 0
    ? "completed_private_external_evaluator_access_simulated_no_write"
    : "failed_private_external_evaluator_access_simulated_no_write",
  ok: failed.length === 0,
  evidence_date: "2026-06-11",
  mode: "NoWriteExternalEvaluatorSimulation",
  primary_customer_interface: "machine",
  simulated_evaluator_profile: simulatedEvaluatorProfile,
  public_site: PUBLIC_SITE,
  post_calls_executed: 0,
  write_calls_executed: 0,
  external_invites_sent: 0,
  sandbox_customers_created: 0,
  orders_created: 0,
  credits_consumed: 0,
  real_payment_executed: false,
  real_invoice_issued: false,
  external_contact_executed: false,
  human_outreach_executed: false,
  external_publication_executed: false,
  production_api_key_published: false,
  real_customer_data_used: false,
  personal_data_used: false,
  third_party_api_called: false,
  no_list_product_choice: noListChoice,
  existing_list_product_choice: existingListChoice,
  simulated_machine_decision: simulatedDecision,
  resources: Object.fromEntries(Object.entries(resources).map(([name, resource]) => [name, {
    url: resource.url,
    status: resource.http_status,
    ok: resource.ok,
    json_ok: resource.json_valid,
    bytes: resource.bytes
  }])),
  checks_total: checks.length,
  checks_failed: failed.length,
  failed_checks: failed.map((check) => check.name),
  checks,
  recommended_next_step: failed.length === 0
    ? "Run an agent review. If approved, prepare an owner-approved private external evaluator pack, still without sending real invitations until the owner explicitly authorizes it."
    : "Fix failed public machine-readability checks before preparing any external evaluator pack."
};

fs.writeFileSync(OUTPUT_SUMMARY, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

const report = [
  "# MachineSignal - Private External Evaluator Access Simulated NoWrite - 2026-06-11",
  "",
  "## Result",
  "",
  `- Status: ${summary.status}`,
  `- OK: ${summary.ok}`,
  `- Mode: ${summary.mode}`,
  "- Primary customer interface: machine",
  `- POST calls executed: ${summary.post_calls_executed}`,
  `- Write calls executed: ${summary.write_calls_executed}`,
  `- Checks failed: ${failed.length}/${checks.length}`,
  "",
  "## What This Simulates",
  "",
  "A machine evaluator starts with no prior explanation and reads only public MachineSignal resources. It does not create an account, does not create a sandbox customer, does not order anything, does not consume credits and does not invite any external user.",
  "",
  "## Machine Decision",
  "",
  `- Decision: ${simulatedDecision.decision}`,
  `- Confidence: ${simulatedDecision.confidence}`,
  `- Primary product selected: ${noListChoice.selected_product}`,
  `- Reason: ${noListChoice.reason}`,
  `- Simulated purchase intent: ${noListChoice.simulated_purchase_intent}`,
  "- Actual purchase intent executed: false",
  "",
  "## What The Machine Would Buy If Writes Were Allowed",
  "",
  `- Product: ${noListChoice.selected_product}`,
  `- Price: EUR ${noListChoice.price_eur}`,
  `- Required input: market=${noListChoice.required_input.market}; area=${noListChoice.required_input.area}; commercial_objective=${noListChoice.required_input.commercial_objective}`,
  `- Expected output: ${noListChoice.expected_output.target_count} targets, ${noListChoice.expected_output.format}`,
  `- Next machine call: ${noListChoice.expected_output.next_machine_call}`,
  "",
  "## Safety",
  "",
  "- External invites sent: 0",
  "- Sandbox customers created: 0",
  "- Orders created: 0",
  "- Credits consumed: 0",
  "- Real payment executed: false",
  "- Real invoice issued: false",
  "- External contact executed: false",
  "- Human outreach executed: false",
  "- External publication executed: false",
  "- Production API key published: false",
  "- Real customer data used: false",
  "- Personal data used: false",
  "- Third-party API called: false",
  "",
  "## Remaining Trust Gaps",
  "",
  ...simulatedDecision.remaining_trust_gaps_before_real_external_access.map((item) => `- ${item}`),
  "",
  "## Failed Checks",
  "",
  failed.length === 0 ? "None." : failed.map((check) => `- ${check.name}: ${check.details}`).join("\n"),
  "",
  "## Recommended Next Step",
  "",
  summary.recommended_next_step
].join("\n");

fs.writeFileSync(OUTPUT_REPORT, `${report}\n`, "utf8");
console.log(JSON.stringify({
  ok: summary.ok,
  status: summary.status,
  post_calls_executed: summary.post_calls_executed,
  write_calls_executed: summary.write_calls_executed,
  checks_failed: summary.checks_failed,
  decision: simulatedDecision.decision,
  selected_product: noListChoice.selected_product,
  external_invites_sent: summary.external_invites_sent,
  credits_consumed: summary.credits_consumed
}, null, 2));
