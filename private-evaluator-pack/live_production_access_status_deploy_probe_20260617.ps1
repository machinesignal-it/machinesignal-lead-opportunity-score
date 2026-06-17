$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$ReportPath = Join-Path $Root "live_production_access_status_deploy_probe_report_20260617.md"
$SummaryPath = Join-Path $Root "live_production_access_status_deploy_probe_summary_20260617.json"
$BaseUrl = "https://machinesignal-api.beta-878.workers.dev"

$checks = New-Object System.Collections.Generic.List[object]

function Add-Check {
  param([string]$Name, [bool]$Passed, [string]$Detail)
  $script:checks.Add([pscustomobject]@{
    name = $Name
    passed = $Passed
    detail = $Detail
  }) | Out-Null
}

function Get-Json {
  param([string]$Path)
  $response = Invoke-WebRequest -UseBasicParsing -Uri "$BaseUrl$Path" -TimeoutSec 30
  return @{
    StatusCode = [int]$response.StatusCode
    Json = $response.Content | ConvertFrom-Json
    Raw = $response.Content
  }
}

$health = Get-Json "/health"
Add-Check "Live health returns 200" ($health.StatusCode -eq 200) "$($health.StatusCode)"
Add-Check "Live health status ok" ($health.Json.status -eq "ok") "$($health.Json.status)"

$status = Get-Json "/v1/production-access/status"
Add-Check "Live production access status returns 200" ($status.StatusCode -eq 200) "$($status.StatusCode)"
Add-Check "Live status is sandbox_only" ($status.Json.status -eq "sandbox_only") "$($status.Json.status)"
Add-Check "Live status blocks production access" ($status.Json.support_code -eq "MS_PRODUCTION_ACCESS_BLOCKED") "$($status.Json.support_code)"
Add-Check "Live status reports no real payment" ($status.Json.real_payment_executed -eq $false) "$($status.Json.real_payment_executed)"
Add-Check "Live status reports no invoice" ($status.Json.invoice_issued -eq $false) "$($status.Json.invoice_issued)"
Add-Check "Live status reports no external contact" ($status.Json.external_contact_executed -eq $false) "$($status.Json.external_contact_executed)"

$guard = $status.Json.production_access
foreach ($field in @(
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
)) {
  Add-Check "Live production guard false: $field" ($guard.$field -eq $false) "$field=$($guard.$field)"
}

foreach ($blocked in @(
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
)) {
  Add-Check "Live blocked item present: $blocked" ($status.Json.blocked_now -contains $blocked) $blocked
}

Add-Check "Live production key response blocked" ($status.Json.production_key.status -eq "blocked_production_key") "$($status.Json.production_key.status)"
Add-Check "Live production key no real payment" ($status.Json.production_key.real_payment_executed -eq $false) "$($status.Json.production_key.real_payment_executed)"
Add-Check "Live production key no invoice" ($status.Json.production_key.invoice_issued -eq $false) "$($status.Json.production_key.invoice_issued)"
Add-Check "Live production key no external contact" ($status.Json.production_key.external_contact_executed -eq $false) "$($status.Json.production_key.external_contact_executed)"
Add-Check "Live kill switch contract exposed" ($status.Json.kill_switch_contract.support_code -eq "MS_KILL_SWITCH_ACTIVE") "$($status.Json.kill_switch_contract.support_code)"

$openapi = Get-Json "/openapi.json"
Add-Check "Live OpenAPI returns 200" ($openapi.StatusCode -eq 200) "$($openapi.StatusCode)"
Add-Check "Live OpenAPI exposes production status path" ($null -ne $openapi.Json.paths."/v1/production-access/status") "path"
Add-Check "Live OpenAPI exposes ProductionAccessStatus schema" ($null -ne $openapi.Json.components.schemas.ProductionAccessStatus) "schema"

$root = Get-Json "/"
Add-Check "Live root returns 200" ($root.StatusCode -eq 200) "$($root.StatusCode)"
Add-Check "Live root exposes production status doc" ($root.Json.docs.production_access_status -eq "/v1/production-access/status") "$($root.Json.docs.production_access_status)"

$failed = @($checks | Where-Object { -not $_.passed })
$summary = [pscustomobject]@{
  probe = "live_production_access_status_deploy_probe"
  date = "2026-06-17"
  status = if ($failed.Count -eq 0) { "passed" } else { "failed" }
  base_url = $BaseUrl
  checks_total = $checks.Count
  checks_failed = $failed.Count
  deployed_endpoint = "$BaseUrl/v1/production-access/status"
  still_blocked = @(
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
  )
  checks = $checks
}

$summary | ConvertTo-Json -Depth 8 | Set-Content -Path $SummaryPath -Encoding UTF8

$lines = @()
$lines += "# Live Production Access Status Deploy Probe"
$lines += ""
$lines += "- Date: 2026-06-17"
$lines += "- Status: $($summary.status.ToUpperInvariant())"
$lines += "- Base URL: $BaseUrl"
$lines += "- Endpoint: $($summary.deployed_endpoint)"
$lines += "- Checks: $($checks.Count)"
$lines += "- Failed: $($failed.Count)"
$lines += ""
$lines += "## Still Blocked"
foreach ($item in $summary.still_blocked) {
  $lines += "- $item"
}

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
