$ErrorActionPreference = "Stop"

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$mdPath = Join-Path $root "private-evaluator-pack\paid_beta_readiness_package_20260617.md"
$jsonPath = Join-Path $root "private-evaluator-pack\paid_beta_readiness_package_20260617.json"
$reportPath = Join-Path $root "private-evaluator-pack\paid_beta_readiness_package_probe_report_20260617.md"
$summaryPath = Join-Path $root "private-evaluator-pack\paid_beta_readiness_package_probe_summary_20260617.json"

$checks = New-Object System.Collections.Generic.List[object]

function Add-Check {
  param([string]$Name, [bool]$Passed, [string]$Detail)
  $checks.Add([pscustomobject]@{
    name = $Name
    passed = $Passed
    detail = $Detail
  })
}

Add-Check "markdown_exists" (Test-Path $mdPath) $mdPath
Add-Check "json_exists" (Test-Path $jsonPath) $jsonPath

$md = Get-Content -Raw -LiteralPath $mdPath
$json = Get-Content -Raw -LiteralPath $jsonPath | ConvertFrom-Json

$requiredPhrases = @(
  "without activating payments",
  "MachineSignal is not commercially live",
  "The customer interface remains machine-first",
  "Paid beta activation: no-go",
  "Commercial go-live: no-go",
  "Public marketplace or hosted MCP: no-go",
  "No personal data",
  "No real customer data unless policy is approved",
  "Kill switch enabled"
)

foreach ($phrase in $requiredPhrases) {
  Add-Check "markdown_contains_$($phrase.Replace(' ', '_').Replace(':', ''))" ($md.Contains($phrase)) $phrase
}

$requiredAreas = @(
  "fiscal_and_admin",
  "legal_and_compliance",
  "payment",
  "product_and_price",
  "production_api_key",
  "data",
  "support_and_post_sale",
  "cost_cap_and_kill_switch",
  "distribution"
)

$areas = @($json.readiness_areas | ForEach-Object { $_.area })
foreach ($area in $requiredAreas) {
  Add-Check "json_area_$area" ($areas -contains $area) $area
}

Add-Check "json_paid_beta_activation_no_go" ($json.paid_beta_activation -eq "no_go") $json.paid_beta_activation
Add-Check "json_commercial_go_live_no_go" ($json.commercial_go_live -eq "no_go") $json.commercial_go_live
Add-Check "json_paid_beta_preparation_go" ($json.paid_beta_preparation -eq "go") $json.paid_beta_preparation
Add-Check "json_machine_first" ($json.customer_interface -eq "machine_first") $json.customer_interface

$requiredApprovals = @(
  "fiscal_admin_path",
  "legal_privacy_path",
  "payment_method",
  "product_catalog",
  "price_list",
  "refund_and_credit_policy",
  "production_key_policy",
  "data_policy",
  "support_policy",
  "cost_caps",
  "kill_switch_owner",
  "distribution_channel"
)

foreach ($approval in $requiredApprovals) {
  Add-Check "json_requires_$approval" ($json.required_owner_approval_before_activation -contains $approval) $approval
}

$failed = @($checks | Where-Object { -not $_.passed })
$status = if ($failed.Count -eq 0) { "PASSED" } else { "FAILED" }

$summary = [pscustomobject]@{
  date = "2026-06-17"
  status = $status
  checks = $checks.Count
  failed = $failed.Count
  decision = "paid_beta_preparation_go_activation_no_go"
  next_step = "draft_individual_beta_policies_without_activation"
}

$report = @(
  "# Paid Beta Readiness Package - Probe Report"
  ""
  "- Date: 2026-06-17"
  "- Status: $status"
  "- Checks: $($checks.Count)"
  "- Failed: $($failed.Count)"
  ""
  "## Result"
  ""
  "The package allows preparation work but keeps paid beta activation, real payments, commercial go-live and public publication blocked."
) -join "`n"

Set-Content -LiteralPath $reportPath -Value $report -Encoding UTF8
Set-Content -LiteralPath $summaryPath -Value ($summary | ConvertTo-Json -Depth 5) -Encoding UTF8

if ($failed.Count -gt 0) {
  $failed | Format-Table -AutoSize | Out-String | Write-Host
  throw "Paid beta readiness package probe failed."
}

Write-Host $report
