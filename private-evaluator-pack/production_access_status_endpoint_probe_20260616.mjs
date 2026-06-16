import { writeFileSync } from "node:fs";
import { handleRequest } from "../api_endpoint_minimal/core.mjs";

const reportPath = new URL("./production_access_status_endpoint_probe_report_20260616.md", import.meta.url);
const summaryPath = new URL("./production_access_status_endpoint_probe_summary_20260616.json", import.meta.url);

const checks = [];

function check(name, passed, detail = "") {
  checks.push({ name, passed: Boolean(passed), detail });
}

const rootResponse = await handleRequest(new Request("http://localhost/"));
check("Root endpoint returns 200", rootResponse.status === 200, String(rootResponse.status));
const rootPayload = await rootResponse.json();
check(
  "Root docs expose production access status",
  rootPayload.docs?.production_access_status === "/v1/production-access/status",
  rootPayload.docs?.production_access_status
);

const onboardingResponse = await handleRequest(new Request("http://localhost/machine-onboarding.json"));
check("Public onboarding returns 200", onboardingResponse.status === 200, String(onboardingResponse.status));
const onboardingPayload = await onboardingResponse.json();
check(
  "Public onboarding exposes production access status",
  onboardingPayload.discovery?.production_access_status === "/v1/production-access/status",
  onboardingPayload.discovery?.production_access_status
);

const openapiResponse = await handleRequest(new Request("http://localhost/openapi.json"));
check("OpenAPI returns 200", openapiResponse.status === 200, String(openapiResponse.status));
const openapi = await openapiResponse.json();
check(
  "OpenAPI path exposes production access status",
  Boolean(openapi.paths?.["/v1/production-access/status"]),
  "/v1/production-access/status"
);
check(
  "OpenAPI schema exposes ProductionAccessStatus",
  Boolean(openapi.components?.schemas?.ProductionAccessStatus),
  "ProductionAccessStatus"
);

const llmsResponse = await handleRequest(new Request("http://localhost/llms.txt"));
check("llms.txt returns 200", llmsResponse.status === 200, String(llmsResponse.status));
const llmsText = await llmsResponse.text();
check(
  "llms.txt includes production access status endpoint",
  llmsText.includes("/v1/production-access/status"),
  "/v1/production-access/status"
);

const statusResponse = await handleRequest(new Request("http://localhost/v1/production-access/status"));
check("Production access status returns 200", statusResponse.status === 200, String(statusResponse.status));
const status = await statusResponse.json();

check("Status is sandbox_only", status.status === "sandbox_only", status.status);
check(
  "Support code blocks production access",
  status.support_code === "MS_PRODUCTION_ACCESS_BLOCKED",
  status.support_code
);
check("Primary customer interface is machine", status.primary_customer_interface === "machine", status.primary_customer_interface);

for (const [field, value] of Object.entries(status.production_access || {})) {
  check(`Production access guard false: ${field}`, value === false, `${field}=${value}`);
}

for (const blocked of [
  "production_api_keys",
  "paid_beta",
  "commercial_go_live",
  "real_payments",
  "payment_method_collection",
  "invoices",
  "real_customer_data",
  "personal_data",
  "external_outreach",
  "marketplace_publication",
  "hosted_public_mcp",
  "mcp_registry_submission"
]) {
  check(`Blocked item present: ${blocked}`, status.blocked_now?.includes(blocked), blocked);
}

for (const allowed of [
  "read_public_docs",
  "read_product_catalog",
  "create_limited_sandbox_customer",
  "use_sandbox_api_key",
  "run_synthetic_tests"
]) {
  check(`Allowed sandbox item present: ${allowed}`, status.allowed_now?.includes(allowed), allowed);
}

check("Production key response is blocked", status.production_key?.status === "blocked_production_key", status.production_key?.status);
check(
  "Production key support code is blocked",
  status.production_key?.support_code === "MS_PRODUCTION_KEY_BLOCKED",
  status.production_key?.support_code
);
check("Production key credit delta zero", status.production_key?.credit_delta === 0, String(status.production_key?.credit_delta));
check("Production key no real payment", status.production_key?.real_payment_executed === false, String(status.production_key?.real_payment_executed));
check("Production key no invoice", status.production_key?.invoice_issued === false, String(status.production_key?.invoice_issued));
check("Production key no external contact", status.production_key?.external_contact_executed === false, String(status.production_key?.external_contact_executed));

check("Kill switch contract is paused", status.kill_switch_contract?.status === "paused_kill_switch", status.kill_switch_contract?.status);
check(
  "Kill switch support code exposed",
  status.kill_switch_contract?.support_code === "MS_KILL_SWITCH_ACTIVE",
  status.kill_switch_contract?.support_code
);
check("Kill switch no real payment", status.kill_switch_contract?.real_payment_executed === false, String(status.kill_switch_contract?.real_payment_executed));
check("Kill switch no invoice", status.kill_switch_contract?.invoice_issued === false, String(status.kill_switch_contract?.invoice_issued));
check("Kill switch no external contact", status.kill_switch_contract?.external_contact_executed === false, String(status.kill_switch_contract?.external_contact_executed));

check("Top-level no real payment", status.real_payment_executed === false, String(status.real_payment_executed));
check("Top-level no invoice", status.invoice_issued === false, String(status.invoice_issued));
check("Top-level no external contact", status.external_contact_executed === false, String(status.external_contact_executed));

const failed = checks.filter((item) => !item.passed);
const summary = {
  probe: "production_access_status_endpoint_probe",
  date: "2026-06-16",
  status: failed.length === 0 ? "passed" : "failed",
  checks_total: checks.length,
  checks_failed: failed.length,
  checks
};

writeFileSync(summaryPath, JSON.stringify(summary, null, 2));

const lines = [
  "# Production Access Status Endpoint - Probe Report",
  "",
  "- Date: 2026-06-16",
  `- Status: ${summary.status.toUpperCase()}`,
  `- Checks: ${summary.checks_total}`,
  `- Failed: ${summary.checks_failed}`
];

if (failed.length > 0) {
  lines.push("", "## Failed Checks");
  for (const item of failed) {
    lines.push(`- ${item.name}: ${item.detail}`);
  }
}

writeFileSync(reportPath, `${lines.join("\n")}\n`);

if (failed.length > 0) {
  console.log(`FAIL ${failed.length}/${checks.length}`);
  process.exit(1);
}

console.log(`PASS ${checks.length}/${checks.length}`);
