$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$Repo = Split-Path -Parent $Root
$CorePath = Join-Path $Repo "api_endpoint_minimal\core.mjs"
$TestPath = Join-Path $Repo "api_endpoint_minimal\test_api.mjs"
$ReportPath = Join-Path $Root "worker_production_guard_helpers_patch_probe_report_20260616.md"
$SummaryPath = Join-Path $Root "worker_production_guard_helpers_patch_probe_summary_20260616.json"

$checks = New-Object System.Collections.Generic.List[object]

function Add-Check {
  param([string]$Name, [bool]$Passed, [string]$Detail)
  $script:checks.Add([pscustomobject]@{
    name = $Name
    passed = $Passed
    detail = $Detail
  }) | Out-Null
}

if (!(Test-Path $CorePath)) { throw "Missing core file: $CorePath" }
if (!(Test-Path $TestPath)) { throw "Missing test file: $TestPath" }

$core = Get-Content $CorePath -Raw
$test = Get-Content $TestPath -Raw

$requiredCoreSymbols = @(
  "DEFAULT_PRODUCTION_ACCESS_GUARD",
  "SUPPORT_CODES",
  "function classifyApiKey",
  "function buildBlockedGuardResponse",
  "function buildProductionKeyBlockedResponse",
  "function buildKillSwitchResponse",
  "productionGuardInternals"
)

foreach ($symbol in $requiredCoreSymbols) {
  Add-Check "Core symbol present: $symbol" ($core.Contains($symbol)) $symbol
}

$requiredFalseFields = @(
  "production_keys_enabled: false",
  "paid_beta_enabled: false",
  "real_payments_enabled: false",
  "invoices_enabled: false",
  "personal_data_enabled: false",
  "real_customer_data_enabled: false",
  "external_outreach_enabled: false",
  "marketplace_publication_enabled: false",
  "hosted_public_mcp_enabled: false",
  "registry_submission_enabled: false"
)

foreach ($field in $requiredFalseFields) {
  Add-Check "Production guard default false: $field" ($core.Contains($field)) $field
}

$requiredCodes = @(
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
)

foreach ($code in $requiredCodes) {
  Add-Check "Support code present: $code" ($core.Contains($code)) $code
}

$requiredResponseFields = @(
  "credit_delta: 0",
  "production_key_active: false",
  "credit_consumption_enabled: false",
  "real_payment_executed: false",
  "invoice_issued: false",
  "external_contact_executed: false"
)

foreach ($field in $requiredResponseFields) {
  Add-Check "Blocked response field present: $field" ($core.Contains($field)) $field
}

$requiredTestSnippets = @(
  "productionGuardInternals",
  "Production guard default must remain false",
  "ms_sbx_example",
  "ms_live_example",
  "buildProductionKeyBlockedResponse",
  "buildKillSwitchResponse",
  "blocked_production_key",
  "paused_kill_switch"
)

foreach ($snippet in $requiredTestSnippets) {
  Add-Check "Test assertion snippet present: $snippet" ($test.Contains($snippet)) $snippet
}

$forbiddenCoreSnippets = @(
  "real_payments_enabled: true",
  "invoices_enabled: true",
  "personal_data_enabled: true",
  "real_customer_data_enabled: true",
  "external_outreach_enabled: true",
  "marketplace_publication_enabled: true",
  "hosted_public_mcp_enabled: true",
  "registry_submission_enabled: true"
)

foreach ($snippet in $forbiddenCoreSnippets) {
  Add-Check "Forbidden enabled flag absent: $snippet" (-not $core.Contains($snippet)) $snippet
}

$failed = @($checks | Where-Object { -not $_.passed })
$summary = [pscustomobject]@{
  probe = "worker_production_guard_helpers_patch_probe"
  date = "2026-06-16"
  status = if ($failed.Count -eq 0) { "passed" } else { "failed" }
  checks_total = $checks.Count
  checks_failed = $failed.Count
  checks = $checks
}

$summary | ConvertTo-Json -Depth 8 | Set-Content -Path $SummaryPath -Encoding UTF8

$lines = @()
$lines += "# Worker Production Guard Helpers Patch - Probe Report"
$lines += ""
$lines += "- Date: 2026-06-16"
$lines += "- Status: $($summary.status.ToUpperInvariant())"
$lines += "- Checks: $($checks.Count)"
$lines += "- Failed: $($failed.Count)"

if ($failed.Count -gt 0) {
  $lines += ""
  $lines += "## Failed Checks"
  foreach ($item in $failed) {
    $lines += "- $($item.name): $($item.detail)"
  }
}

$lines | Set-Content -Path $ReportPath -Encoding UTF8

if ($failed.Count -gt 0) {
  Write-Host "FAIL $($failed.Count)/$($checks.Count)"
  exit 1
}

Write-Host "PASS $($checks.Count)/$($checks.Count)"
