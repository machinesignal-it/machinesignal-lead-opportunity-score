$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$JsonPath = Join-Path $Root "worker_production_guard_patch_plan_nowrite_20260616.json"
$MdPath = Join-Path $Root "worker_production_guard_patch_plan_nowrite_20260616.md"
$ReportPath = Join-Path $Root "worker_production_guard_patch_plan_nowrite_probe_report_20260616.md"
$SummaryPath = Join-Path $Root "worker_production_guard_patch_plan_nowrite_probe_summary_20260616.json"

$checks = New-Object System.Collections.Generic.List[object]

function Add-Check {
  param([string]$Name, [bool]$Passed, [string]$Detail)
  $script:checks.Add([pscustomobject]@{
    name = $Name
    passed = $Passed
    detail = $Detail
  }) | Out-Null
}

if (!(Test-Path $JsonPath)) { throw "Missing JSON artifact: $JsonPath" }
if (!(Test-Path $MdPath)) { throw "Missing markdown artifact: $MdPath" }

$json = Get-Content $JsonPath -Raw | ConvertFrom-Json
$md = Get-Content $MdPath -Raw

Add-Check "Artifact is patch plan only" ($json.status -eq "patch_plan_only") $json.status
Add-Check "No Worker code changed by artifact" ($json.code_change_status -eq "no_worker_code_changed_by_this_artifact") $json.code_change_status
Add-Check "No deploy" ($json.deploy_status -eq "no_deploy") $json.deploy_status
Add-Check "Production API keys blocked" ($json.production_api_keys -eq "blocked") $json.production_api_keys
Add-Check "Paid beta not approved" ($json.paid_beta -eq "not_approved") $json.paid_beta
Add-Check "Commercial go-live no-go" ($json.commercial_go_live -eq "no_go") $json.commercial_go_live

$requiredFiles = @(
  "api_endpoint_minimal/core.mjs",
  "api_endpoint_minimal/test_api.mjs",
  "api_endpoint_minimal/cloudflare_worker.mjs"
)

foreach ($file in $requiredFiles) {
  $found = @($json.relevant_files | Where-Object { $_.file -eq $file }).Count -gt 0
  Add-Check "Relevant file present: $file" $found $file
}

$requiredAdditions = @(
  "DEFAULT_PRODUCTION_ACCESS_GUARD",
  "SUPPORT_CODES",
  "classifyApiKey",
  "buildBlockedGuardResponse",
  "buildProductionKeyBlockedResponse",
  "buildKillSwitchResponse"
)

foreach ($item in $requiredAdditions) {
  $found = @($json.proposed_code_additions | Where-Object { $_ -eq $item }).Count -gt 0
  Add-Check "Proposed code addition present: $item" $found $item
}

$requiredTests = @(
  "all_production_guard_defaults_are_false",
  "sandbox_key_classification",
  "production_key_classification",
  "production_key_blocked_response_contract",
  "kill_switch_response_contract",
  "sandbox_journey_no_regression",
  "payment_test_still_reports_no_real_payment_or_invoice"
)

foreach ($test in $requiredTests) {
  $found = @($json.proposed_test_additions | Where-Object { $_ -eq $test }).Count -gt 0
  Add-Check "Proposed test present: $test" $found $test
}

$requiredOutOfScope = @(
  "live_payment_code",
  "invoice_generation",
  "real_production_key_generation",
  "provider_calls",
  "real_customer_data_processing",
  "personal_data_processing",
  "marketplace_publication",
  "hosted_public_mcp_launch",
  "registry_submission",
  "external_outreach_automation",
  "cloudflare_deploy"
)

foreach ($item in $requiredOutOfScope) {
  $found = @($json.explicitly_out_of_scope | Where-Object { $_ -eq $item }).Count -gt 0
  Add-Check "Out-of-scope item present: $item" $found $item
}

Add-Check "Low-risk scope is constants/helpers/tests only" ($json.risk_assessment.constants_helpers_tests_only -eq "low") $json.risk_assessment.constants_helpers_tests_only
Add-Check "High-risk combined auth/ledger/payment/admin change flagged" ($json.risk_assessment.change_auth_ledger_payment_admin_in_same_patch -eq "high") $json.risk_assessment.change_auth_ledger_payment_admin_in_same_patch

$requiredValidation = @(
  "production_guard_defaults",
  "support_codes",
  "key_classification",
  "blocked_response_helper",
  "production_key_block_response",
  "kill_switch_response",
  "tests",
  "no_deploy",
  "no_live_commercial_activation"
)

foreach ($item in $requiredValidation) {
  $found = @($json.validation_requirements | Where-Object { $_ -eq $item }).Count -gt 0
  Add-Check "Validation requirement present: $item" $found $item
}

Add-Check "Markdown says no Worker patch happened" ($md -match "It does not patch the Worker") "markdown no patch"
Add-Check "Markdown says no deploy" ($md -match "It does not deploy anything") "markdown no deploy"
Add-Check "Markdown states production keys blocked" ($md -match "production API keys, real payments") "markdown blocks"
Add-Check "Markdown includes local test commands" ($md -match "node api_endpoint_minimal/test_api.mjs") "test command"
Add-Check "Markdown excludes live payment code" ($md -match "live payment code") "out of scope"

$failed = @($checks | Where-Object { -not $_.passed })
$summary = [pscustomobject]@{
  probe = "worker_production_guard_patch_plan_nowrite_probe"
  date = "2026-06-16"
  status = if ($failed.Count -eq 0) { "passed" } else { "failed" }
  checks_total = $checks.Count
  checks_failed = $failed.Count
  checks = $checks
}

$summary | ConvertTo-Json -Depth 8 | Set-Content -Path $SummaryPath -Encoding UTF8

$lines = @()
$lines += "# Worker Production Guard Patch Plan No-Write - Probe Report"
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
