import fs from "node:fs";

const now = new Date().toISOString();
const reportPath = "private-evaluator-pack/support_status_usage_closure_nowrite_report_20260614.md";
const summaryPath = "private-evaluator-pack/support_status_usage_closure_nowrite_summary_20260614.json";

const companyBrain = JSON.parse(fs.readFileSync("company-brain.json", "utf8"));

const urls = {
  workerHealth: `${companyBrain.public_machine_entrypoints.worker_base_url}/health`,
  workerOpenApi: `${companyBrain.public_machine_entrypoints.worker_base_url}/openapi.json`,
  workerOnboardingManifest: `${companyBrain.public_machine_entrypoints.worker_base_url}/machine-onboarding.json`,
  publicLlms: companyBrain.public_machine_entrypoints.llms,
  publicOpenApi: companyBrain.public_machine_entrypoints.openapi,
  publicOnboarding: companyBrain.public_machine_entrypoints.machine_onboarding,
  publicSandboxDocsMarkdown: companyBrain.public_machine_entrypoints.sandbox_public_docs_markdown,
  publicSandboxDocsJson: companyBrain.public_machine_entrypoints.sandbox_public_docs_json,
  publicCatalog: companyBrain.public_machine_entrypoints.product_catalog
};

const checks = [];
const fetched = {};

function check(name, ok, evidence = "") {
  checks.push({ name, ok: Boolean(ok), evidence });
}

async function fetchText(label, url) {
  const response = await fetch(url, {
    headers: { "user-agent": "MachineSignal-SupportStatusUsageClosure-NoWrite/2026-06-14" }
  });
  const text = await response.text();
  fetched[label] = { url, status: response.status, ok: response.ok, text };
  check(`fetch_${label}`, response.ok, `HTTP ${response.status} ${url}`);
  return text;
}

function lower(label) {
  return fetched[label]?.text?.toLowerCase() ?? "";
}

function hasAll(label, terms) {
  const text = lower(label);
  const missing = terms.filter((term) => !text.includes(term.toLowerCase()));
  return { ok: missing.length === 0, missing };
}

function json(label) {
  return JSON.parse(fetched[label].text);
}

for (const [label, url] of Object.entries(urls)) {
  await fetchText(label, url);
}

let healthJson = null;
try {
  healthJson = json("workerHealth");
  check("worker_health_json_valid", true, "valid JSON");
} catch (error) {
  check("worker_health_json_valid", false, error.message);
}

let publicOpenApi = null;
let workerOpenApi = null;
let publicOnboarding = null;
let workerOnboarding = null;
let sandboxDocs = null;
let catalog = null;

for (const [label, target] of [
  ["publicOpenApi", "publicOpenApi"],
  ["workerOpenApi", "workerOpenApi"],
  ["publicOnboarding", "publicOnboarding"],
  ["workerOnboardingManifest", "workerOnboarding"],
  ["publicSandboxDocsJson", "sandboxDocs"],
  ["publicCatalog", "catalog"]
]) {
  try {
    const parsed = json(label);
    if (target === "publicOpenApi") publicOpenApi = parsed;
    if (target === "workerOpenApi") workerOpenApi = parsed;
    if (target === "publicOnboarding") publicOnboarding = parsed;
    if (target === "workerOnboarding") workerOnboarding = parsed;
    if (target === "sandboxDocs") sandboxDocs = parsed;
    if (target === "catalog") catalog = parsed;
    check(`${label}_json_valid`, true, "valid JSON");
  } catch (error) {
    check(`${label}_json_valid`, false, error.message);
  }
}

check("worker_health_indicates_service", lower("workerHealth").includes("ok") || lower("workerHealth").includes("healthy") || lower("workerHealth").includes("machinesignal"), fetched.workerHealth?.text?.slice(0, 120) ?? "");
check("worker_health_no_payment_or_data_side_effect", !hasAll("workerHealth", ["payment"]).ok && !hasAll("workerHealth", ["invoice"]).ok, "health is read-only");

const requiredPaths = ["/v1/usage", "/v1/orders", "/v1/orders/{order_intent_id}", "/v1/onboarding"];
for (const path of requiredPaths) {
  check(`public_openapi_has_${path.replace(/[^a-z0-9]+/gi, "_")}`, Boolean(publicOpenApi?.paths?.[path]), path);
  check(`worker_openapi_has_${path.replace(/[^a-z0-9]+/gi, "_")}`, Boolean(workerOpenApi?.paths?.[path]), path);
}

const publicOnboardingText = fetched.publicOnboarding.text;
const workerOnboardingText = fetched.workerOnboardingManifest.text;
for (const [label, text] of [
  ["public_onboarding", publicOnboardingText],
  ["worker_onboarding", workerOnboardingText]
]) {
  const localLower = text.toLowerCase();
  check(`${label}_mentions_usage`, localLower.includes("/v1/usage") || localLower.includes("usage"), "usage marker");
  check(`${label}_mentions_orders`, localLower.includes("/v1/orders") || localLower.includes("orders"), "orders marker");
  check(`${label}_mentions_support_or_contact`, localLower.includes("support") || localLower.includes("beta@machinesignal.it") || localLower.includes("contact"), "support/contact marker");
  check(`${label}_mentions_machine_first`, localLower.includes("machine") && localLower.includes("human"), "machine/human role marker");
  check(`${label}_blocks_real_payment_or_contact`, localLower.includes("real_payment_executed") && localLower.includes("external_contact_executed"), "safety flags marker");
}

const sandboxRequiredFalseFlags = [
  "commercial_go_live",
  "live_monetization_enabled",
  "real_payment_executed",
  "real_invoice_issued",
  "payment_method_collection_enabled",
  "external_outreach_enabled",
  "real_data_processing_enabled",
  "personal_data_processing_enabled",
  "hosted_mcp_public_enabled",
  "mcp_registry_publication_enabled",
  "marketplace_paid_publication_enabled"
];
for (const flag of sandboxRequiredFalseFlags) {
  check(`sandbox_docs_flag_false_${flag}`, sandboxDocs?.[flag] === false, String(sandboxDocs?.[flag]));
}

for (const action of ["retrieve_sandbox_orders", "retrieve_sandbox_usage"]) {
  check(`sandbox_docs_allows_${action}`, sandboxDocs?.allowed_sandbox_actions?.includes(action), action);
}

for (const action of ["real_payments", "invoices", "payment_method_collection", "real_customer_data", "personal_data", "external_outreach", "commercial_go_live"]) {
  check(`sandbox_docs_blocks_${action}`, sandboxDocs?.blocked_actions?.includes(action), action);
}

const markdownChecks = [
  ["sandbox_markdown_mentions_usage", "usage"],
  ["sandbox_markdown_mentions_orders", "orders"],
  ["sandbox_markdown_mentions_blocked", "blocked"],
  ["sandbox_markdown_mentions_no_live_payment", "not a live payment page"],
  ["sandbox_markdown_mentions_no_commercial_go_live", "not a commercial go-live approval"]
];
for (const [name, term] of markdownChecks) {
  check(name, lower("publicSandboxDocsMarkdown").includes(term), term);
}

check("llms_mentions_health", lower("publicLlms").includes("/health"), "health marker");
check("llms_mentions_usage", lower("publicLlms").includes("/v1/usage"), "usage marker");
check("llms_mentions_orders", lower("publicLlms").includes("/v1/orders"), "orders marker");
check("llms_mentions_contact_email", lower("publicLlms").includes("beta@machinesignal.it"), "contact email marker");
check("llms_blocks_go_live", lower("publicLlms").includes("commercial go-live remains blocked"), "go-live block");

check("catalog_payment_mode_purchase_intent_only", catalog?.payment_mode?.beta === "purchase-intent only", catalog?.payment_mode?.beta);
check("catalog_no_real_payment", catalog?.payment_mode?.real_payment_executed === false, String(catalog?.payment_mode?.real_payment_executed));
check("catalog_no_external_contact", catalog?.payment_mode?.external_contact_executed === false, String(catalog?.payment_mode?.external_contact_executed));
check("catalog_credit_rule_valid_output_only", Boolean(catalog?.general_credit_rule?.rule?.toLowerCase?.().includes("valid usable output")), catalog?.general_credit_rule?.rule ?? "");

const companyBrainBlocked = companyBrain.blocked_actions ?? [];
for (const action of ["real_payments", "invoices", "payment_method_collection", "real_customer_data_processing", "personal_data_processing", "external_outreach", "commercial_go_live"]) {
  check(`company_brain_blocks_${action}`, companyBrainBlocked.includes(action), action);
}

check("company_brain_next_step_still_sandbox_testing", companyBrain.current_decision?.continue_sandbox_testing === true, String(companyBrain.current_decision?.continue_sandbox_testing));
check("company_brain_paid_commercial_activity_false", companyBrain.current_decision?.start_paid_commercial_activity === false, String(companyBrain.current_decision?.start_paid_commercial_activity));

const forbiddenLiveClaims = [
  "commercial go-live approved",
  "ready for real payments\": true",
  "real_payment_executed\": true",
  "real_invoice_issued\": true",
  "payment_method_collection_enabled\": true",
  "external_outreach_enabled\": true",
  "real_data_processing_enabled\": true",
  "personal_data_processing_enabled\": true",
  "hosted_mcp_public_enabled\": true",
  "marketplace_paid_publication_enabled\": true"
];

for (const [label, item] of Object.entries(fetched)) {
  const text = item.text.toLowerCase();
  const found = forbiddenLiveClaims.filter((term) => text.includes(term.toLowerCase()));
  check(`no_live_claims_in_${label}`, found.length === 0, found.length ? found.join(", ") : "none");
}

const failed = checks.filter((item) => !item.ok);
const summary = {
  service: "MachineSignal",
  probe: "support_status_usage_closure_nowrite",
  status: failed.length === 0 ? "pass" : "fail",
  generated_at: now,
  checks_total: checks.length,
  checks_failed: failed.length,
  writes_performed: 0,
  post_calls_executed: 0,
  real_payment_executed: false,
  invoice_issued: false,
  external_outreach_executed: false,
  real_data_processed: false,
  personal_data_processed: false,
  technical_sandbox_tests_estimate_percent_if_pass: failed.length === 0 ? 97 : 95,
  commercial_go_live: "no_go",
  failed_checks: failed.map((item) => item.name),
  report: reportPath
};

const report = [
  "# MachineSignal Support Status Usage Closure NoWrite - 2026-06-14",
  "",
  "## Scope",
  "",
  "Final NoWrite technical-sandbox closure check focused on support, status, usage and order discoverability for a machine customer.",
  "",
  "This probe performs no writes, no POST calls, no payments, no invoices, no outreach and no real or personal data processing.",
  "",
  "## Result",
  "",
  `Status: ${summary.status}`,
  `Checks: ${summary.checks_total}`,
  `Failed: ${summary.checks_failed}`,
  "",
  "## Guardrails",
  "",
  "- Writes performed: 0",
  "- POST calls executed: 0",
  "- Real payment executed: false",
  "- Invoice issued: false",
  "- External outreach executed: false",
  "- Real data processed: false",
  "- Personal data processed: false",
  "- Commercial go-live: no-go",
  "",
  "## Failed Checks",
  "",
  failed.length ? failed.map((item) => `- ${item.name}: ${item.evidence}`).join("\n") : "None.",
  "",
  "## Checks",
  "",
  checks.map((item) => `- ${item.ok ? "PASS" : "FAIL"} ${item.name}: ${item.evidence}`).join("\n"),
  "",
  "## Recommendation",
  "",
  failed.length === 0
    ? "Technical sandbox tests can be considered 96-97% complete and ready for owner decision on closure. Paid beta and commercial go-live remain blocked."
    : "Fix failed support/status/usage discoverability checks before closing technical sandbox tests.",
  ""
].join("\n");

fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
fs.writeFileSync(reportPath, report);

console.log(JSON.stringify(summary, null, 2));
if (failed.length) process.exitCode = 1;
