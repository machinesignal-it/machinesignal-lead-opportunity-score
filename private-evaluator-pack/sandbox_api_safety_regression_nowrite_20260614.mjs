import fs from "node:fs";

const reportPath = "private-evaluator-pack/sandbox_api_safety_regression_nowrite_report_20260614.md";
const summaryPath = "private-evaluator-pack/sandbox_api_safety_regression_nowrite_summary_20260614.json";

const evidenceFiles = {
  machineBuyerEndToEnd: "machine_buyer_end_to_end_rehearsal_summary_20260611.json",
  apiDirectorySandbox: "api_directory_private_listing_sandbox_rehearsal_summary_20260611.json",
  postmanSandbox: "postman_private_team_workspace_sandbox_rehearsal_summary_20260611.json",
  agentGoNoGoSandbox: "agent_go_no_go_sandbox_review_summary_20260611.json",
  openapi: "openapi.json",
  productCatalog: "product-catalog.json",
  backlog: "private-evaluator-pack/internal_test_backlog_nowrite_20260614.json"
};

function read(path) {
  return fs.readFileSync(path, "utf8");
}

function parse(path) {
  return JSON.parse(read(path));
}

const evidence = Object.fromEntries(Object.entries(evidenceFiles).map(([key, path]) => [key, parse(path)]));
const checks = [];

function check(name, ok, detail) {
  checks.push({ name, ok, detail: String(detail ?? "") });
}

function hasAll(values, required) {
  return required.every((item) => values.includes(item));
}

function flagFalse(source, path, value) {
  check(`${source}_${path}_false`, value === false, value);
}

check("mode_nowrite_no_new_live_calls", true, "This regression reads local evidence only and performs 0 new API writes.");
check("machine_buyer_e2e_ok", evidence.machineBuyerEndToEnd.ok === true, evidence.machineBuyerEndToEnd.status);
check("api_directory_sandbox_ok", evidence.apiDirectorySandbox.ok === true, evidence.apiDirectorySandbox.status);
check("postman_sandbox_ok", evidence.postmanSandbox.ok === true, evidence.postmanSandbox.status);
check("agent_go_no_go_sandbox_ok", evidence.agentGoNoGoSandbox.ok === true, evidence.agentGoNoGoSandbox.status);

check("machine_buyer_write_cap_respected", evidence.machineBuyerEndToEnd.write_calls_executed <= evidence.machineBuyerEndToEnd.max_post_calls_allowed, `${evidence.machineBuyerEndToEnd.write_calls_executed}/${evidence.machineBuyerEndToEnd.max_post_calls_allowed}`);
check("machine_buyer_post_cap_respected", evidence.machineBuyerEndToEnd.post_calls_executed <= evidence.machineBuyerEndToEnd.max_post_calls_allowed, `${evidence.machineBuyerEndToEnd.post_calls_executed}/${evidence.machineBuyerEndToEnd.max_post_calls_allowed}`);
check("postman_checks_zero_failed", evidence.postmanSandbox.checks_failed === 0, evidence.postmanSandbox.checks_failed);
check("api_directory_checks_zero_failed", evidence.apiDirectorySandbox.checks_failed === 0, evidence.apiDirectorySandbox.checks_failed);

for (const [source, object] of [
  ["machine_buyer_e2e", evidence.machineBuyerEndToEnd],
  ["api_directory_sandbox", evidence.apiDirectorySandbox]
]) {
  flagFalse(source, "real_payment_executed", object.real_payment_executed);
  flagFalse(source, "real_invoice_issued", object.real_invoice_issued);
  flagFalse(source, "external_contact_executed", object.external_contact_executed);
  flagFalse(source, "human_outreach_executed", object.human_outreach_executed);
}

flagFalse("machine_buyer_e2e", "live_monetization_enabled", evidence.machineBuyerEndToEnd.live_monetization_enabled);
flagFalse("machine_buyer_e2e", "public_paid_plans_enabled", evidence.machineBuyerEndToEnd.public_paid_plans_enabled);
flagFalse("machine_buyer_e2e", "production_api_key_published", evidence.machineBuyerEndToEnd.production_api_key_published);

const noGoFor = evidence.agentGoNoGoSandbox.no_go_for || [];
check(
  "agent_no_go_blocks_commercial_actions",
  hasAll(noGoFor, [
    "live_monetization",
    "real_payment",
    "real_invoice",
    "public_paid_marketplace_launch",
    "hosted_mcp_public_launch",
    "production_api_keys",
    "human_outreach",
    "automatic_external_contact"
  ]),
  noGoFor.join(", ")
);
check("agent_approved_next_step_not_monetization", evidence.agentGoNoGoSandbox.approved_next_step?.monetization_enabled === false, JSON.stringify(evidence.agentGoNoGoSandbox.approved_next_step));

const openapiText = JSON.stringify(evidence.openapi);
check("openapi_has_sandbox_customer_endpoint", openapiText.includes("/v1/sandbox/customers"), "OpenAPI paths");
check("openapi_has_purchase_intent_endpoint", openapiText.includes("/v1/purchase-intent"), "OpenAPI paths");
check("openapi_has_api_key_auth", openapiText.includes("ApiKeyAuth") || openapiText.includes("X-API-Key"), "OpenAPI security");

const catalog = evidence.productCatalog;
check("catalog_beta_purchase_intent_only", catalog.payment_mode?.beta === "purchase-intent only", catalog.payment_mode?.beta);
check("catalog_no_real_payment", catalog.payment_mode?.real_payment_executed === false, JSON.stringify(catalog.payment_mode));
check("catalog_no_external_contact", catalog.payment_mode?.external_contact_executed === false, JSON.stringify(catalog.payment_mode));
check("catalog_valid_output_credit_rule", /valid usable output/i.test(catalog.general_credit_rule?.rule || ""), catalog.general_credit_rule?.rule);
check("catalog_credit_tracking_has_request_id", /request_id/i.test(catalog.general_credit_rule?.tracking || ""), catalog.general_credit_rule?.tracking);

const backlog = evidence.backlog;
check("backlog_commercial_not_live", backlog.commercial_status === "not_live", backlog.commercial_status);
check("backlog_go_live_no_go", backlog.go_live_decision === "no_go", backlog.go_live_decision);
check("backlog_owner_not_required_now", backlog.owner_decision_required_now === false, backlog.owner_decision_required_now);
check(
  "backlog_blocks_sandbox_risks",
  hasAll(backlog.hard_blocks || [], [
    "no_real_payments",
    "no_invoices",
    "no_payment_method_collection",
    "no_external_outreach",
    "no_real_data_processing",
    "no_personal_data_processing",
    "no_production_api_key_issuing",
    "no_public_paid_marketplace",
    "no_hosted_mcp_public",
    "no_commercial_go_live"
  ]),
  (backlog.hard_blocks || []).join(", ")
);

const forbiddenRaw = Object.entries(evidenceFiles)
  .filter(([key]) => key !== "openapi")
  .map(([, path]) => read(path))
  .join("\n")
  .toLowerCase();

const forbiddenClaims = [
  '"real_payment_executed": true',
  '"real_invoice_issued": true',
  '"external_contact_executed": true',
  '"human_outreach_executed": true',
  '"live_monetization_enabled": true',
  '"public_paid_plans_enabled": true',
  '"production_api_key_published": true',
  '"go_live_decision": "go"',
  '"commercial_status": "live"'
];
for (const claim of forbiddenClaims) {
  check(`forbidden_absent_${claim.replace(/[^a-z0-9]+/gi, "_").slice(0, 50)}`, !forbiddenRaw.includes(claim.toLowerCase()), claim);
}

const errors = checks.filter((item) => !item.ok);
const authStatus = errors.some((item) => item.name.includes("auth") || item.name.includes("api_key")) ? "needs_review" : "verified_from_contract";
const creditStatus = errors.some((item) => item.name.includes("credit")) ? "needs_review" : "verified_from_catalog_and_prior_runs";
const purchaseIntentStatus = errors.some((item) => item.name.includes("payment") || item.name.includes("invoice")) ? "needs_review" : "non_payment_beta_intent";

const summary = {
  probe_id: "sandbox_api_safety_regression_nowrite_20260614",
  created_at: new Date().toISOString(),
  mode: "NoWrite sandbox API safety regression",
  api_calls_executed_now: 0,
  write_calls_executed_now: 0,
  evidence_files: evidenceFiles,
  checks_total: checks.length,
  checks_failed: errors.length,
  auth_behavior: authStatus,
  credit_behavior: creditStatus,
  purchase_intent_behavior: purchaseIntentStatus,
  safety_flags: {
    real_payment_executed: false,
    real_invoice_issued: false,
    external_contact_executed: false,
    human_outreach_executed: false,
    live_monetization_enabled: false,
    production_api_key_published: false
  },
  interpretation: errors.length === 0
    ? "Sandbox safety regression passes from local evidence: auth is contractually present, credit behavior follows valid-output rules, and purchase-intent remains non-payment with no invoice, outreach, real data or go-live."
    : "Sandbox safety regression found a blocker in local evidence. Remediate before continuing with synthetic buyer journey tests.",
  recommended_next_step: errors.length === 0 ? "synthetic_machine_buyer_journey_rehearsal_nowrite" : "sandbox_api_safety_regression_remediation_nowrite",
  checks
};

const report = [
  "# Sandbox API Safety Regression NoWrite - 2026-06-14",
  "",
  `Mode: ${summary.mode}`,
  `API calls executed now: ${summary.api_calls_executed_now}`,
  `Write calls executed now: ${summary.write_calls_executed_now}`,
  "",
  `Checks: ${summary.checks_total}`,
  `Errors: ${summary.checks_failed}`,
  `Result: ${errors.length === 0 ? "PASS" : "FAIL"}`,
  "",
  "## Behavior Status",
  "",
  `- Auth behavior: ${summary.auth_behavior}`,
  `- Credit behavior: ${summary.credit_behavior}`,
  `- Purchase-intent behavior: ${summary.purchase_intent_behavior}`,
  "",
  "## Safety Flags",
  "",
  "- real_payment_executed=false",
  "- real_invoice_issued=false",
  "- external_contact_executed=false",
  "- human_outreach_executed=false",
  "- live_monetization_enabled=false",
  "- production_api_key_published=false",
  "",
  "## Interpretation",
  "",
  summary.interpretation,
  "",
  "## Errors",
  "",
  errors.length ? errors.map((item) => `- ${item.name}: ${item.detail}`).join("\n") : "None.",
  "",
  "## Recommended Next Step",
  "",
  summary.recommended_next_step
].join("\n");

fs.writeFileSync(reportPath, report);
fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));

console.log(report);
if (errors.length) {
  process.exit(1);
}
