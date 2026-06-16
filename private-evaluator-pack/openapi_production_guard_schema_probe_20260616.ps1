$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$Repo = Split-Path -Parent $Root
$Node = "C:\Users\natal\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
$ScriptPath = Join-Path $Root "openapi_production_guard_schema_probe_20260616.mjs"
$ReportPath = Join-Path $Root "openapi_production_guard_schema_probe_report_20260616.md"
$SummaryPath = Join-Path $Root "openapi_production_guard_schema_probe_summary_20260616.json"

@'
import { writeFileSync } from "node:fs";
import { handleRequest } from "../api_endpoint_minimal/core.mjs";

const root = new URL(".", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const reportPath = new URL("./openapi_production_guard_schema_probe_report_20260616.md", import.meta.url);
const summaryPath = new URL("./openapi_production_guard_schema_probe_summary_20260616.json", import.meta.url);

const checks = [];
function check(name, passed, detail = "") {
  checks.push({ name, passed: Boolean(passed), detail });
}

const response = await handleRequest(new Request("http://localhost/openapi.json"));
check("OpenAPI endpoint returns 200", response.status === 200, String(response.status));
const openapi = await response.json();
const schemas = openapi.components?.schemas || {};

const requiredSchemas = [
  "SupportCode",
  "ProductionAccessGuard",
  "GuardedBlockedResponse",
  "ProductionKeyBlockedResponse",
  "KillSwitchResponse"
];

for (const name of requiredSchemas) {
  check(`Schema present: ${name}`, Boolean(schemas[name]), name);
}

const supportEnum = schemas.SupportCode?.enum || [];
for (const code of [
  "MS_PRODUCTION_KEY_BLOCKED",
  "MS_PRODUCTION_ACCESS_BLOCKED",
  "MS_COST_CAP_BLOCKED",
  "MS_PAYMENT_BLOCKED",
  "MS_PAYMENT_METHOD_BLOCKED",
  "MS_INVOICE_BLOCKED",
  "MS_REAL_DATA_BLOCKED",
  "MS_PERSONAL_DATA_BLOCKED",
  "MS_EXTERNAL_CONTACT_BLOCKED",
  "MS_MARKETPLACE_BLOCKED",
  "MS_HOSTED_MCP_BLOCKED",
  "MS_REGISTRY_BLOCKED",
  "MS_KILL_SWITCH_ACTIVE"
]) {
  check(`Support code exposed: ${code}`, supportEnum.includes(code), code);
}

const guardProps = schemas.ProductionAccessGuard?.properties || {};
for (const field of [
  "enabled",
  "owner_approved",
  "production_keys_enabled",
  "paid_beta_enabled",
  "real_payments_enabled",
  "invoices_enabled",
  "personal_data_enabled",
  "real_customer_data_enabled",
  "external_outreach_enabled",
  "marketplace_publication_enabled",
  "hosted_public_mcp_enabled",
  "registry_submission_enabled"
]) {
  check(`Production guard field defaults false: ${field}`, guardProps[field]?.example === false, `${field}=${guardProps[field]?.example}`);
}

const blockedProps = schemas.GuardedBlockedResponse?.properties || {};
for (const field of [
  "status",
  "support_code",
  "owner_escalation_required",
  "credit_delta",
  "production_key_active",
  "credit_consumption_enabled",
  "real_payment_executed",
  "invoice_issued",
  "external_contact_executed",
  "next_allowed_actions"
]) {
  check(`Blocked response property present: ${field}`, Boolean(blockedProps[field]), field);
}

const prodExample = schemas.ProductionKeyBlockedResponse?.example || {};
check("Production key blocked status", prodExample.status === "blocked_production_key", prodExample.status);
check("Production key blocked support code", prodExample.support_code === "MS_PRODUCTION_KEY_BLOCKED", prodExample.support_code);
check("Production key blocked credit delta zero", prodExample.credit_delta === 0, String(prodExample.credit_delta));
check("Production key blocked no real payment", prodExample.real_payment_executed === false, String(prodExample.real_payment_executed));
check("Production key blocked no invoice", prodExample.invoice_issued === false, String(prodExample.invoice_issued));
check("Production key blocked no external contact", prodExample.external_contact_executed === false, String(prodExample.external_contact_executed));

const killExample = schemas.KillSwitchResponse?.example || {};
check("Kill switch status", killExample.status === "paused_kill_switch", killExample.status);
check("Kill switch support code", killExample.support_code === "MS_KILL_SWITCH_ACTIVE", killExample.support_code);
check("Kill switch severity critical", killExample.severity === "critical", killExample.severity);
check("Kill switch credit delta zero", killExample.credit_delta === 0, String(killExample.credit_delta));
check("Kill switch no real payment", killExample.real_payment_executed === false, String(killExample.real_payment_executed));
check("Kill switch no invoice", killExample.invoice_issued === false, String(killExample.invoice_issued));
check("Kill switch no external contact", killExample.external_contact_executed === false, String(killExample.external_contact_executed));

const failed = checks.filter((item) => !item.passed);
const summary = {
  probe: "openapi_production_guard_schema_probe",
  date: "2026-06-16",
  status: failed.length === 0 ? "passed" : "failed",
  checks_total: checks.length,
  checks_failed: failed.length,
  checks
};

writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
const lines = [
  "# OpenAPI Production Guard Schema - Probe Report",
  "",
  "- Date: 2026-06-16",
  `- Status: ${summary.status.toUpperCase()}`,
  `- Checks: ${summary.checks_total}`,
  `- Failed: ${summary.checks_failed}`
];
if (failed.length) {
  lines.push("", "## Failed Checks");
  for (const item of failed) lines.push(`- ${item.name}: ${item.detail}`);
}
writeFileSync(reportPath, `${lines.join("\n")}\n`);

if (failed.length) {
  console.log(`FAIL ${failed.length}/${checks.length}`);
  process.exit(1);
}
console.log(`PASS ${checks.length}/${checks.length}`);
'@ | Set-Content -Path $ScriptPath -Encoding UTF8

Push-Location $Repo
try {
  & $Node $ScriptPath
} finally {
  Pop-Location
}
