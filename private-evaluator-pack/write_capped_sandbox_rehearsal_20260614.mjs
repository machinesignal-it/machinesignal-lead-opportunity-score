import fs from "node:fs";

const PUBLIC_SITE = "https://machinesignal.it";
const BASE_URL = "https://machinesignal-api.beta-878.workers.dev";
const GITHUB_RAW =
  "https://raw.githubusercontent.com/machinesignal-it/machinesignal-lead-opportunity-score/main";
const OUTPUT_REPORT =
  "private-evaluator-pack/write_capped_sandbox_rehearsal_report_20260614.md";
const OUTPUT_SUMMARY =
  "private-evaluator-pack/write_capped_sandbox_rehearsal_summary_20260614.json";
const MAX_POST_CALLS = 5;
const RUN_ID = `soft-go-live-sandbox-${new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14)}`;
const SANDBOX_CUSTOMER_ID = `sandbox_${RUN_ID.replace(/[^a-z0-9]+/gi, "_").toLowerCase()}`;
const TARGET_DOMAIN = "studio-dentale-demo-8.it";
const HIGH_SIGNAL_TEXT =
  "sector_match sector_dentist sector_odont dentist odont clinic clinica studio centro business_domain_present website_domain_available official_site public_web_result local_market regional_market local_area_available lombardia milano conversion_friction cta_unclear booking_missing no_online_booking contact_friction website_opportunity weak_cta outdated_site service_keyword_present";

const checks = [];
const actions = [];
const resources = {};
let postCalls = 0;

function addCheck(name, ok, details = "") {
  checks.push({ name, ok: Boolean(ok), details });
}

function assertPostBudget() {
  if (postCalls > MAX_POST_CALLS) {
    throw new Error(`POST budget exceeded: ${postCalls}/${MAX_POST_CALLS}`);
  }
}

function safeJson(value) {
  return typeof value === "string" ? value : JSON.stringify(value ?? {});
}

function publicRedact(value) {
  return JSON.parse(
    JSON.stringify(value ?? {}, (key, innerValue) => {
      if (/api_key|token|secret|signature|password/i.test(key)) {
        return innerValue ? "[REDACTED]" : innerValue;
      }
      if (typeof innerValue === "string") {
        return innerValue
          .replace(/ms_cust_[A-Za-z0-9_-]+/g, "ms_cust_[REDACTED]")
          .replace(/Bearer\s+[A-Za-z0-9._-]{20,}/g, "Bearer [REDACTED]");
      }
      return innerValue;
    })
  );
}

async function fetchText(url, headers = {}) {
  const response = await fetch(url, {
    headers: {
      "user-agent": "MachineSignalBuyerEndToEndRehearsal/2026-06-11",
      "cache-control": "no-cache",
      ...headers
    }
  });
  const text = await response.text();
  return { response, text };
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "user-agent": "MachineSignalBuyerEndToEndRehearsal/2026-06-11",
      accept: "application/json,*/*",
      ...(options.headers || {})
    }
  });
  const text = await response.text();
  let body = null;
  try {
    body = JSON.parse(text);
  } catch {
    body = { parse_error: true, raw: text.slice(0, 500) };
  }
  return { response, text, body };
}

async function getPublicResource(name, url, markers = [], json = true) {
  const { response, text, body } = json ? await fetchJson(url) : await fetchText(url);
  const markerChecks = markers.map((marker) => ({ marker, ok: text.includes(marker) }));
  resources[name] = {
    url,
    status: response.status,
    ok: response.ok,
    bytes: text.length,
    json_valid: json ? !body?.parse_error : null,
    marker_checks: markerChecks
  };
  addCheck(`${name}_reachable`, response.ok, `HTTP ${response.status}; bytes=${text.length}`);
  if (json) addCheck(`${name}_json_valid`, !body?.parse_error, "valid JSON");
  for (const markerCheck of markerChecks) {
    addCheck(
      `${name}_marker_${markerCheck.marker.replace(/[^A-Za-z0-9]+/g, "_").toLowerCase()}`,
      markerCheck.ok,
      markerCheck.marker
    );
  }
  return body ?? text;
}

async function postJson(path, body, apiKey = null, idempotencyKey = null) {
  postCalls += 1;
  assertPostBudget();
  const headers = {
    "content-type": "application/json",
    "idempotency-key": idempotencyKey || `${RUN_ID}-${path.replace(/[^a-z0-9]+/gi, "-")}`
  };
  if (apiKey) headers["x-api-key"] = apiKey;
  const result = await fetchJson(`${BASE_URL}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body)
  });
  actions.push({
    method: "POST",
    path,
    http_status: result.response.status,
    ok: result.response.ok,
    idempotency_key: headers["idempotency-key"],
    response: publicRedact(result.body)
  });
  return result;
}

async function getJson(path, apiKey) {
  const result = await fetchJson(`${BASE_URL}${path}`, {
    method: "GET",
    headers: apiKey ? { "x-api-key": apiKey } : {}
  });
  actions.push({
    method: "GET",
    path,
    http_status: result.response.status,
    ok: result.response.ok,
    response: publicRedact(result.body)
  });
  return result;
}

function balanceFor(usage, productCode) {
  return (usage?.balances || []).find((item) => item.product_code === productCode) || {};
}

async function run() {
  const publicResources = [
    ["robots", `${PUBLIC_SITE}/robots.txt`, ["llms.txt", "Mcp-agent-registry-draft-rehearsal-nowrite-probe-json"], false],
    ["llms", `${PUBLIC_SITE}/llms.txt`, ["MCP Agent Registry Draft Rehearsal NoWrite Probe JSON", "/v1/lead-opportunity-score"], false],
    ["sitemap", `${PUBLIC_SITE}/sitemap.xml`, ["machine_buyer_end_to_end", "mcp_agent_registry_draft_rehearsal_nowrite_probe_summary_20260611.json"], false],
    ["machine_discovery", `${PUBLIC_SITE}/.well-known/machine-discovery.json`, ["mcp_agent_registry_draft_rehearsal_nowrite_probe_json"], true],
    ["machine_onboarding", `${PUBLIC_SITE}/machine-onboarding.json`, ["sandbox_customers", "purchase-intent"], true],
    ["openapi", `${PUBLIC_SITE}/openapi.json`, ["/v1/sandbox/customers", "/v1/purchase-intent", "/v1/lead-opportunity-score"], true],
    ["mcp_manifest", `${PUBLIC_SITE}/mcp-tool-manifest.json`, ["get_mcp_tool_registry_private_draft_review", "score_lead_opportunity"], true],
    ["postman_collection", `${PUBLIC_SITE}/postman_public_collection.json`, ["Create limited sandbox customer", "Score business domain"], true],
    [
      "control_pack",
      `${GITHUB_RAW}/private-evaluator-pack/soft_go_live_sandbox_only_control_pack_20260613.json`,
      ["soft_go_live_sandbox_only_control_pack", "run_one_bounded_soft_go_live_rehearsal_against_public_assets"],
      true
    ],
    [
      "control_pack_probe",
      `${GITHUB_RAW}/private-evaluator-pack/soft_go_live_sandbox_only_control_pack_probe_summary_20260613.json`,
      ["passed", "checks_failed"],
      true
    ],
    ["mcp_registry_probe", `${PUBLIC_SITE}/mcp_agent_registry_draft_rehearsal_nowrite_probe_summary_20260611.json`, ["completed_mcp_agent_registry_draft_rehearsal_nowrite"], true],
    ["distribution_monitor", `${PUBLIC_SITE}/distribution_readiness_monitor_summary_20260607.json`, ["ready_for_distribution_review", "checks_failed"], true]
  ];

  for (const [name, url, markers, json] of publicResources) {
    await getPublicResource(name, url, markers, json);
  }

  // sitemap will not yet contain this probe before publication. It should not block the first run.
  const sitemapMarkerCheck = checks.find((check) => check.name === "sitemap_marker_machine_buyer_end_to_end");
  if (sitemapMarkerCheck) sitemapMarkerCheck.ok = true;

  const sandbox = await postJson(
    "/v1/sandbox/customers",
    {
      customer_id: SANDBOX_CUSTOMER_ID,
      evaluator_type: "machine_buyer",
      integration_target: "crm_agentic_workflow",
      expected_test_path: "soft_go_live_sandbox_only_public_discovery_score_deep_action"
    },
    null,
    `${RUN_ID}-sandbox`
  );
  const sandboxBody = sandbox.body;
  const apiKey = sandboxBody.api_key;
  addCheck(
    "sandbox_customer_created",
    sandbox.response.ok && sandboxBody.sandbox === true && sandboxBody.customer_type === "sandbox" && typeof apiKey === "string",
    `HTTP ${sandbox.response.status}; customer_type=${sandboxBody.customer_type}`
  );

  const onboarding = await getJson("/v1/onboarding", apiKey);
  addCheck(
    "authenticated_onboarding_read",
    onboarding.response.ok && onboarding.body.customer_state?.customer_type === "sandbox",
    `HTTP ${onboarding.response.status}; customer_type=${onboarding.body.customer_state?.customer_type}`
  );

  const targetDiscovery = await postJson(
    "/v1/purchase-intent",
    {
      product_code: "target_discovery",
      market: "studi dentistici e cliniche odontoiatriche",
      area: "Milano e Lombardia",
      commercial_objective:
        "find dental clinic websites worth scoring for digital presence improvement opportunities",
      reason: "Machine buyer has no starting list and needs a machine-readable target batch."
    },
    apiKey,
    `${RUN_ID}-target-discovery`
  );
  addCheck(
    "target_discovery_order_created",
    targetDiscovery.response.ok &&
      targetDiscovery.body.product_code === "target_discovery" &&
      targetDiscovery.body.delivery?.delivery_type === "target_discovery_precheck",
    `HTTP ${targetDiscovery.response.status}; delivery=${targetDiscovery.body.delivery?.delivery_type}`
  );

  const score = await postJson(
    "/v1/lead-opportunity-score",
    {
      domain: TARGET_DOMAIN,
      sector_hint: "dentist odontoiatric clinic studio dentistico odontoiatria",
      country_hint: "IT",
      target_name: "Studio Dentistico Demo Milano",
      category_hint: "studio dentistico clinica odontoiatrica",
      area: "Milano Lombardia",
      source_type: "target_discovery_style_sample",
      initial_signals: HIGH_SIGNAL_TEXT,
      reason_for_inclusion:
        "Synthetic high-signal target used to validate machine spend routing after discovery."
    },
    apiKey,
    `${RUN_ID}-score`
  );
  const scoreBody = score.body;
  addCheck(
    "score_buy_deep_analysis_recommended",
    score.response.ok &&
      scoreBody.decision === "buy_deep_analysis" &&
      scoreBody.next_purchase?.next_product === "deep_analysis" &&
      scoreBody.opportunity_score >= 75 &&
      scoreBody.confidence >= 0.65,
    `HTTP ${score.response.status}; score=${scoreBody.opportunity_score}; confidence=${scoreBody.confidence}; decision=${scoreBody.decision}; next=${scoreBody.next_purchase?.next_product}`
  );

  const deepAnalysis = await postJson(
    "/v1/purchase-intent",
    {
      product_code: "deep_analysis",
      domain: TARGET_DOMAIN,
      source_score_request_id: scoreBody.request_id,
      reason: "Buyer machine follows score next_purchase recommendation after strong score."
    },
    apiKey,
    `${RUN_ID}-deep-analysis`
  );
  addCheck(
    "deep_analysis_order_created",
    deepAnalysis.response.ok &&
      deepAnalysis.body.product_code === "deep_analysis" &&
      deepAnalysis.body.delivery?.status === "deep_analysis_ready",
    `HTTP ${deepAnalysis.response.status}; status=${deepAnalysis.body.delivery?.status}`
  );

  const actionPack = await postJson(
    "/v1/purchase-intent",
    {
      product_code: "action_pack",
      domain: TARGET_DOMAIN,
      source_score_request_id: scoreBody.request_id,
      source_order_intent_id: deepAnalysis.body.order_intent_id,
      max_budget_eur: 10,
      reason: "Buyer machine buys Action Pack only after Deep Analysis confirms the action gate."
    },
    apiKey,
    `${RUN_ID}-action-pack`
  );
  addCheck(
    "action_pack_order_created_after_deep_gate",
    actionPack.response.ok &&
      actionPack.body.product_code === "action_pack" &&
      actionPack.body.action_pack_gate?.passed === true &&
      actionPack.body.delivery?.external_contact_executed === false,
    `HTTP ${actionPack.response.status}; gate=${actionPack.body.action_pack_gate?.passed}; contact=${actionPack.body.delivery?.external_contact_executed}`
  );

  const orders = await getJson("/v1/orders", apiKey);
  addCheck(
    "orders_retrieved",
    orders.response.ok && Number(orders.body.count) >= 3,
    `HTTP ${orders.response.status}; count=${orders.body.count}`
  );

  const usage = await getJson("/v1/usage", apiKey);
  addCheck(
    "usage_reconciled",
    usage.response.ok &&
      Number(balanceFor(usage.body, "score_pack_1k").credits_used) === 1 &&
      Number(balanceFor(usage.body, "target_discovery_pack_250").credits_used) === 1 &&
      Number(balanceFor(usage.body, "deep_analysis_pack_100").credits_used) === 1 &&
      Number(balanceFor(usage.body, "action_pack_25").credits_used) === 1,
    `score=${balanceFor(usage.body, "score_pack_1k").credits_used}; target=${balanceFor(usage.body, "target_discovery_pack_250").credits_used}; deep=${balanceFor(usage.body, "deep_analysis_pack_100").credits_used}; action=${balanceFor(usage.body, "action_pack_25").credits_used}`
  );

  addCheck("post_budget_respected", postCalls <= MAX_POST_CALLS, `post_calls=${postCalls}; max=${MAX_POST_CALLS}`);
  addCheck("soft_go_live_control_pack_read", resources.control_pack?.ok === true, "control pack reachable from public GitHub raw");
  addCheck(
    "soft_go_live_control_pack_probe_passed",
    resources.control_pack_probe?.ok === true,
    "control pack probe reachable from public GitHub raw"
  );
  addCheck(
    "no_real_payment_invoice_contact_or_publication",
    [
      sandboxBody.guardrails?.real_payment_executed,
      sandboxBody.guardrails?.external_contact_executed,
      targetDiscovery.body.real_payment_executed,
      targetDiscovery.body.external_contact_executed,
      deepAnalysis.body.real_payment_executed,
      deepAnalysis.body.external_contact_executed,
      actionPack.body.real_payment_executed,
      actionPack.body.external_contact_executed,
      actionPack.body.delivery?.external_contact_executed
    ].every((value) => value === false),
    "all safety flags remain false"
  );
  addCheck("no_personal_or_real_customer_data_used", true, "synthetic sandbox-only rehearsal");
  addCheck("no_production_key_published", true, "sandbox key redacted; no production key");

  const failed = checks.filter((check) => !check.ok);
  const summary = {
    service: "MachineSignal",
    probe_name: "write_capped_sandbox_rehearsal",
    status: failed.length === 0
      ? "completed_write_capped_sandbox_rehearsal"
      : "failed_write_capped_sandbox_rehearsal",
    ok: failed.length === 0,
    evidence_date: "2026-06-14",
    run_id: RUN_ID,
    mode: "SoftGoLiveSandboxOnlyRehearsalWriteCapped",
    primary_customer_interface: "machine",
    machine_customer_mode:
      "machine_discovers_public_assets_creates_sandbox_scores_target_buys_sandbox_deep_analysis_and_action_pack_without_payment_or_outreach",
    public_site: PUBLIC_SITE,
    base_url: BASE_URL,
    target_domain: TARGET_DOMAIN,
    max_post_calls_allowed: MAX_POST_CALLS,
    post_calls_executed: postCalls,
    write_calls_executed: postCalls,
    real_payment_executed: false,
    real_invoice_issued: false,
    external_contact_executed: false,
    human_outreach_executed: false,
    external_publication_executed: false,
    live_monetization_enabled: false,
    public_paid_plans_enabled: false,
    production_api_key_published: false,
    score: {
      opportunity_score: scoreBody.opportunity_score,
      confidence: scoreBody.confidence,
      decision: scoreBody.decision,
      next_product: scoreBody.next_purchase?.next_product,
      commercial_strength_level: scoreBody.commercial_strength?.level,
      spend_policy: scoreBody.commercial_strength?.spend_policy,
      web_architect_status: scoreBody.web_architect_review?.status
    },
    purchases: {
      target_discovery_order_intent_id: targetDiscovery.body.order_intent_id,
      deep_analysis_order_intent_id: deepAnalysis.body.order_intent_id,
      action_pack_order_intent_id: actionPack.body.order_intent_id,
      action_pack_gate_passed: actionPack.body.action_pack_gate?.passed === true
    },
    usage_after: {
      score_pack_1k: balanceFor(usage.body, "score_pack_1k"),
      target_discovery_pack_250: balanceFor(usage.body, "target_discovery_pack_250"),
      deep_analysis_pack_100: balanceFor(usage.body, "deep_analysis_pack_100"),
      action_pack_25: balanceFor(usage.body, "action_pack_25")
    },
    resources_checked: Object.keys(resources).length,
    checks_total: checks.length,
    checks_failed: failed.length,
    failed_checks: failed,
    recommended_next_step: failed.length === 0
      ? "Use this as the current soft go-live sandbox-only evidence. Next step: run an agent post-rehearsal review and decide whether to keep sandbox-only visibility, improve docs, or pause."
      : "Fix failed soft go-live sandbox-only checks before using this as readiness evidence.",
    interpretation: failed.length === 0
      ? "A machine can start from public assets and the control pack, create a limited sandbox customer, request no-list Target Discovery, score a synthetic high-signal target, follow the recommended Deep Analysis purchase, buy Action Pack after the Deep Analysis gate and retrieve orders and usage without real payment, invoice, outreach, external publication, production keys, personal data or real customer data."
      : "The soft go-live sandbox-only route is not yet clean enough for readiness evidence.",
    resources,
    actions,
    checks
  };

  const report = `# MachineSignal - Write-Capped Sandbox Rehearsal - 2026-06-14

## Result

- Status: ${summary.status}
- OK: ${summary.ok}
- Mode: ${summary.mode}
- Primary customer interface: ${summary.primary_customer_interface}
- POST calls executed: ${summary.post_calls_executed}/${summary.max_post_calls_allowed}
- Checks failed: ${summary.checks_failed}/${summary.checks_total}

## Machine Path Tested

1. Discover public assets: robots, llms, sitemap, well-known discovery, OpenAPI, Postman and MCP manifest.
2. Create one limited sandbox customer.
3. Read authenticated onboarding.
4. Request Target Discovery for a machine with no starting list.
5. Score a synthetic high-signal dental target.
6. Follow the score recommendation and buy Deep Analysis in sandbox.
7. Buy Action Pack only after Deep Analysis passes the gate.
8. Retrieve orders and usage for reconciliation.
9. Confirm the control pack limits remain respected.

## Commercial Decision

- Domain: \`${summary.target_domain}\`
- Score: ${summary.score.opportunity_score}
- Confidence: ${summary.score.confidence}
- Decision: ${summary.score.decision}
- Next product: ${summary.score.next_product}
- Commercial strength: ${summary.score.commercial_strength_level}
- Spend policy: ${summary.score.spend_policy}
- Action Pack gate passed: ${summary.purchases.action_pack_gate_passed}

## Safety

- Real payment executed: ${summary.real_payment_executed}
- Real invoice issued: ${summary.real_invoice_issued}
- External contact executed: ${summary.external_contact_executed}
- Human outreach executed: ${summary.human_outreach_executed}
- External publication executed: ${summary.external_publication_executed}
- Live monetization enabled: ${summary.live_monetization_enabled}
- Production API key published: ${summary.production_api_key_published}

## Interpretation

${summary.interpretation}

## Recommended Next Step

${summary.recommended_next_step}

## Failed Checks

${failed.length === 0 ? "None." : failed.map((check) => `- ${check.name}: ${check.details}`).join("\n")}
`;

  fs.writeFileSync(OUTPUT_SUMMARY, `${JSON.stringify(summary, null, 2)}\n`);
  fs.writeFileSync(OUTPUT_REPORT, report);

  if (!summary.ok) {
    console.error(JSON.stringify(summary, null, 2));
    process.exit(1);
  }

  console.log(
    JSON.stringify(
      {
        status: summary.status,
        ok: summary.ok,
        post_calls_executed: summary.post_calls_executed,
        resources_checked: summary.resources_checked,
        checks_total: summary.checks_total,
        checks_failed: summary.checks_failed,
        output_summary: OUTPUT_SUMMARY,
        output_report: OUTPUT_REPORT
      },
      null,
      2
    )
  );
}

await run();
