import fs from "node:fs";

const REPORT = "private-evaluator-pack/bounded_sandbox_go_live_rehearsal_nowrite_report_20260614.md";
const SUMMARY = "private-evaluator-pack/bounded_sandbox_go_live_rehearsal_nowrite_summary_20260614.json";

function readJson(path) {
  return JSON.parse(fs.readFileSync(path, "utf8"));
}

function exists(path) {
  return fs.existsSync(path);
}

const controlPack = readJson("private-evaluator-pack/sandbox_go_live_control_pack_20260614.json");
const controlPackProbe = readJson("private-evaluator-pack/sandbox_go_live_control_pack_probe_summary_20260614.json");
const openapi = readJson("openapi.json");
const productCatalog = readJson("product-catalog.json");
const machineOnboarding = readJson("machine-onboarding.json");

const checks = [];
const warnings = [];
const simulatedActions = [];

function check(id, pass, detail, severity = "P1") {
  checks.push({ id, pass: Boolean(pass), severity, detail });
}

function warn(id, detail) {
  warnings.push({ id, detail });
}

function addAction(step, method, path, mode, expectedOutcome, safety) {
  simulatedActions.push({ step, method, path, mode, expectedOutcome, safety });
}

const forbiddenFlags = [
  ["payment_collection_allowed", controlPack.sandbox_limits?.payment_collection_allowed],
  ["invoice_issuance_allowed", controlPack.sandbox_limits?.invoice_issuance_allowed],
  ["personal_data_allowed", controlPack.sandbox_limits?.personal_data_allowed],
  ["real_customer_data_allowed", controlPack.sandbox_limits?.real_customer_data_allowed],
  ["external_contact_allowed", controlPack.sandbox_limits?.external_contact_allowed]
];

check("control_pack_probe_passed", controlPackProbe.status === "pass", `status=${controlPackProbe.status}`, "P0");
check("stage_is_sandbox_only", controlPack.allowed_stage === "technical_sandbox_go_live_rehearsal_only", controlPack.allowed_stage, "P0");
check("commercial_go_live_blocked", controlPack.go_live_decision === "no_go_for_commercial_go_live", controlPack.go_live_decision, "P0");
for (const [flag, value] of forbiddenFlags) {
  check(`forbidden_${flag}_false`, value === false, `${flag}=${value}`, "P0");
}
check("post_budget_max_5", controlPack.sandbox_limits?.max_post_calls_per_rehearsal <= 5, `max=${controlPack.sandbox_limits?.max_post_calls_per_rehearsal}`, "P0");
check("synthetic_data_only", controlPack.sandbox_limits?.synthetic_data_only === true, "synthetic_data_only must be true", "P0");

for (const asset of [
  "machine-onboarding.json",
  "product-catalog.json",
  "openapi.json",
  "postman_public_collection.json",
  "llms.txt",
  "private-evaluator-pack/sandbox_go_live_control_pack_20260614.json",
  "private-evaluator-pack/sandbox_go_live_control_pack_probe_summary_20260614.json"
]) {
  check(`asset_exists_${asset}`, exists(asset), asset, "P0");
}

for (const endpoint of controlPack.allowed_callable_sandbox_endpoints ?? []) {
  check(`openapi_has_${endpoint.path}`, Boolean(openapi.paths?.[endpoint.path]), `${endpoint.method} ${endpoint.path}`, "P0");
  check(`endpoint_no_payment_${endpoint.path}`, endpoint.real_payment === false, `${endpoint.path}`, "P0");
  check(`endpoint_no_real_data_${endpoint.path}`, endpoint.real_data_allowed === false, `${endpoint.path}`, "P0");
  if (endpoint.method === "POST") {
    check(`post_endpoint_idempotent_${endpoint.path}`, endpoint.requires_idempotency_key === true, `${endpoint.path}`, "P0");
  }
}

const allowedPaths = new Set((controlPack.allowed_callable_sandbox_endpoints ?? []).map(e => e.path));
for (const excluded of controlPack.explicitly_excluded_from_public_sandbox ?? []) {
  if (excluded.startsWith("/")) {
    check(`excluded_not_allowed_${excluded}`, !allowedPaths.has(excluded), excluded, "P0");
  }
}

const syntheticDomains = controlPack.synthetic_data_rules?.allowed_domains ?? [];
check("synthetic_domains_are_test_domains", syntheticDomains.length > 0 && syntheticDomains.every(d => d.endsWith(".test")), syntheticDomains.join(", "), "P0");

const products = productCatalog.products ?? {};
for (const productCode of [
  "target_discovery_pack_250",
  "score_pack_1k",
  "deep_analysis_pack_100",
  "action_pack_25"
]) {
  check(`product_catalog_has_${productCode}`, Boolean(products[productCode]), productCode, "P0");
}

if (products.target_discovery_pack_250?.price_eur !== 249) {
  warn("price_alignment_target_discovery", `product-catalog.json has ${products.target_discovery_pack_250?.price_eur}, P&L v22 uses 249`);
}
if (products.score_pack_1k?.price_eur !== 119) {
  warn("price_alignment_score_pack", `product-catalog.json has ${products.score_pack_1k?.price_eur}, P&L v22 uses 119`);
}
if (products.deep_analysis_pack_100?.price_eur !== 349) {
  warn("price_alignment_deep_analysis", `product-catalog.json has ${products.deep_analysis_pack_100?.price_eur}, P&L v22 uses 349`);
}

check(
  "machine_onboarding_machine_first",
  machineOnboarding.primary_customer_interface === "machine" || machineOnboarding.human_role?.includes("supervision"),
  `primary_customer_interface=${machineOnboarding.primary_customer_interface}`,
  "P1"
);

addAction(
  1,
  "GET",
  "/machine-onboarding.json, /product-catalog.json, /openapi.json, /llms.txt",
  "NoWrite local contract read",
  "machine understands service, product catalog and sandbox limits",
  "read-only"
);
addAction(
  2,
  "POST",
  "/v1/sandbox/customers",
  "simulated only",
  "one limited sandbox customer would be created with idempotency key",
  "no payment, no invoice, synthetic evaluator"
);
addAction(
  3,
  "GET",
  "/v1/onboarding",
  "simulated only",
  "machine receives available test paths and credit balances",
  "read-only with sandbox key"
);
addAction(
  4,
  "POST",
  "/v1/lead-opportunity-score",
  "simulated only",
  "synthetic .test domain receives score, confidence, decision and next product",
  "idempotent, no real data"
);
addAction(
  5,
  "POST",
  "/v1/purchase-intent",
  "simulated only",
  "target_discovery or deep_analysis intent is recorded as sandbox intent",
  "no charge, no invoice"
);
addAction(
  6,
  "POST",
  "/v1/purchase-intent",
  "simulated only",
  "action_pack intent only after deep_analysis gate",
  "no outreach, no external contact"
);
addAction(
  7,
  "GET",
  "/v1/orders/{order_intent_id}, /v1/usage",
  "simulated only",
  "machine retrieves delivery and reconciles demo credits",
  "read-only"
);

const simulatedPostCalls = simulatedActions.filter(a => a.method === "POST").length;
check("simulated_post_budget_respected", simulatedPostCalls <= controlPack.sandbox_limits.max_post_calls_per_rehearsal, `simulated=${simulatedPostCalls}`, "P0");

const failed = checks.filter(c => !c.pass);
const summary = {
  probe_id: "bounded_sandbox_go_live_rehearsal_nowrite_20260614",
  status: failed.length === 0 ? "pass" : "fail",
  mode: "NoWrite bounded sandbox rehearsal",
  api_calls_executed_now: 0,
  write_calls_executed_now: 0,
  simulated_post_calls: simulatedPostCalls,
  max_post_calls_allowed: controlPack.sandbox_limits.max_post_calls_per_rehearsal,
  checks_total: checks.length,
  checks_failed: failed.length,
  warnings_total: warnings.length,
  warnings,
  failed_checks: failed,
  forbidden_actions_confirmed_blocked: {
    payment_collection: controlPack.sandbox_limits.payment_collection_allowed === false,
    invoice_issuance: controlPack.sandbox_limits.invoice_issuance_allowed === false,
    personal_data: controlPack.sandbox_limits.personal_data_allowed === false,
    real_customer_data: controlPack.sandbox_limits.real_customer_data_allowed === false,
    external_contact: controlPack.sandbox_limits.external_contact_allowed === false
  },
  simulated_actions: simulatedActions,
  recommendation: failed.length === 0
    ? warnings.length > 0
      ? "Pass with warnings. Before any public sandbox docs update, align product-catalog pricing with P&L v22."
      : "Pass. Next step can be owner-approved write-capped sandbox rehearsal."
    : "Fail. Fix P0/P1 checks before any write-capped rehearsal."
};

const report = [
  "# Bounded Sandbox Go-Live Rehearsal NoWrite - 2026-06-14",
  "",
  `Status: ${summary.status}`,
  `Mode: ${summary.mode}`,
  `API calls executed now: ${summary.api_calls_executed_now}`,
  `Write calls executed now: ${summary.write_calls_executed_now}`,
  `Simulated POST calls: ${summary.simulated_post_calls}/${summary.max_post_calls_allowed}`,
  `Checks: ${summary.checks_total}`,
  `Failed: ${summary.checks_failed}`,
  `Warnings: ${summary.warnings_total}`,
  "",
  "## Result",
  "",
  failed.length === 0
    ? "The bounded sandbox go-live path is coherent in NoWrite mode. It can be rehearsed without enabling commercial go-live, payments, invoices, personal data, real customer data, outreach, production keys, marketplace publication or hosted MCP."
    : "The bounded sandbox go-live path has blocking issues and must not proceed.",
  "",
  "## Simulated Machine Path",
  "",
  "| Step | Method | Path | Mode | Expected outcome | Safety |",
  "|---:|---|---|---|---|---|",
  ...simulatedActions.map(a => `| ${a.step} | ${a.method} | ${a.path} | ${a.mode} | ${a.expectedOutcome} | ${a.safety} |`),
  "",
  "## Warnings",
  "",
  warnings.length === 0 ? "None." : warnings.map(w => `- ${w.id}: ${w.detail}`).join("\n"),
  "",
  "## Failed Checks",
  "",
  failed.length === 0 ? "None." : failed.map(c => `- ${c.id}: ${c.detail}`).join("\n"),
  "",
  "## Recommendation",
  "",
  summary.recommendation
].join("\n");

fs.writeFileSync(SUMMARY, JSON.stringify(summary, null, 2));
fs.writeFileSync(REPORT, report);

console.log(JSON.stringify({
  status: summary.status,
  checks_total: summary.checks_total,
  checks_failed: summary.checks_failed,
  warnings_total: summary.warnings_total,
  api_calls_executed_now: summary.api_calls_executed_now,
  write_calls_executed_now: summary.write_calls_executed_now,
  recommendation: summary.recommendation,
  report: REPORT,
  summary: SUMMARY
}, null, 2));

if (failed.length > 0) process.exit(1);
