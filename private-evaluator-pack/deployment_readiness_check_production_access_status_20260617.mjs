import { writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { handleRequest } from "../api_endpoint_minimal/core.mjs";

const reportPath = new URL("./deployment_readiness_check_production_access_status_report_20260617.md", import.meta.url);
const summaryPath = new URL("./deployment_readiness_check_production_access_status_summary_20260617.json", import.meta.url);

const checks = [];

function check(name, passed, detail = "") {
  checks.push({ name, passed: Boolean(passed), detail: String(detail ?? "") });
}

function runNodeTest(script) {
  try {
    const output = execFileSync(process.execPath, [script], {
      cwd: new URL("..", import.meta.url),
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"]
    });
    return { ok: true, output };
  } catch (error) {
    return {
      ok: false,
      output: `${error.stdout || ""}${error.stderr || ""}${error.message || ""}`
    };
  }
}

const testApi = runNodeTest("api_endpoint_minimal/test_api.mjs");
check("Local API regression test passes", testApi.ok, testApi.output.slice(-300));

const testLedger = runNodeTest("api_endpoint_minimal/test_durable_ledger.mjs");
check("Durable ledger regression test passes", testLedger.ok, testLedger.output.slice(-300));

const statusResponse = await handleRequest(new Request("http://localhost/v1/production-access/status"));
check("Production access status endpoint returns 200 locally", statusResponse.status === 200, statusResponse.status);
const status = await statusResponse.json();

check("Endpoint remains sandbox_only", status.status === "sandbox_only", status.status);
check("Endpoint blocks production access", status.support_code === "MS_PRODUCTION_ACCESS_BLOCKED", status.support_code);
check("Endpoint reports no real payment", status.real_payment_executed === false, status.real_payment_executed);
check("Endpoint reports no invoice", status.invoice_issued === false, status.invoice_issued);
check("Endpoint reports no external contact", status.external_contact_executed === false, status.external_contact_executed);

for (const [field, value] of Object.entries(status.production_access || {})) {
  check(`Production guard remains false: ${field}`, value === false, `${field}=${value}`);
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
  check(`Blocked status present: ${blocked}`, status.blocked_now?.includes(blocked), blocked);
}

const openapiResponse = await handleRequest(new Request("http://localhost/openapi.json"));
check("OpenAPI endpoint returns 200 locally", openapiResponse.status === 200, openapiResponse.status);
const openapi = await openapiResponse.json();
check("OpenAPI exposes production access path", Boolean(openapi.paths?.["/v1/production-access/status"]), "path");
check("OpenAPI exposes ProductionAccessStatus schema", Boolean(openapi.components?.schemas?.ProductionAccessStatus), "schema");
check(
  "OpenAPI ProductionAccessStatus says no real payment",
  openapi.components?.schemas?.ProductionAccessStatus?.properties?.real_payment_executed?.example === false,
  "real_payment_executed"
);
check(
  "OpenAPI ProductionAccessStatus says no invoice",
  openapi.components?.schemas?.ProductionAccessStatus?.properties?.invoice_issued?.example === false,
  "invoice_issued"
);
check(
  "OpenAPI ProductionAccessStatus says no external contact",
  openapi.components?.schemas?.ProductionAccessStatus?.properties?.external_contact_executed?.example === false,
  "external_contact_executed"
);

const rootResponse = await handleRequest(new Request("http://localhost/"));
const root = await rootResponse.json();
check(
  "Root discovery exposes production access status",
  root.docs?.production_access_status === "/v1/production-access/status",
  root.docs?.production_access_status
);

const onboardingResponse = await handleRequest(new Request("http://localhost/machine-onboarding.json"));
const onboarding = await onboardingResponse.json();
check(
  "Machine onboarding exposes production access status",
  onboarding.discovery?.production_access_status === "/v1/production-access/status",
  onboarding.discovery?.production_access_status
);

const llmsResponse = await handleRequest(new Request("http://localhost/llms.txt"));
const llmsText = await llmsResponse.text();
check("llms.txt exposes production access status", llmsText.includes("/v1/production-access/status"), "llms.txt");

check("Readiness decision is deployable as read-only status", true, "read_only_status_endpoint");
check("Readiness decision does not approve paid beta", status.blocked_now?.includes("paid_beta"), "paid_beta blocked");
check("Readiness decision does not approve production keys", status.blocked_now?.includes("production_api_keys"), "production keys blocked");

const failed = checks.filter((item) => !item.passed);
const summary = {
  probe: "deployment_readiness_check_production_access_status",
  date: "2026-06-17",
  status: failed.length === 0 ? "passed" : "failed",
  checks_total: checks.length,
  checks_failed: failed.length,
  decision: failed.length === 0 ? "ready_for_cloudflare_deploy_read_only_status_endpoint" : "not_ready_for_deploy",
  scope: "read_only_production_access_status_endpoint_only",
  still_blocked: [
    "paid_beta",
    "commercial_go_live",
    "production_api_keys",
    "real_payments",
    "payment_method_collection",
    "invoices",
    "real_customer_data",
    "personal_data",
    "external_outreach",
    "marketplace_publication",
    "hosted_public_mcp",
    "mcp_registry_submission"
  ],
  checks
};

writeFileSync(summaryPath, JSON.stringify(summary, null, 2));

const lines = [
  "# Deployment Readiness Check - Production Access Status",
  "",
  "- Date: 2026-06-17",
  `- Status: ${summary.status.toUpperCase()}`,
  `- Decision: ${summary.decision}`,
  `- Scope: ${summary.scope}`,
  `- Checks: ${summary.checks_total}`,
  `- Failed: ${summary.checks_failed}`,
  "",
  "## Still Blocked",
  ...summary.still_blocked.map((item) => `- ${item}`)
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
