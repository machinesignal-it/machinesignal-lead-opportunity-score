$ErrorActionPreference = "Stop"

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$mdPath = Join-Path $root "private-evaluator-pack\paid_beta_owner_decision_brief_20260617.md"
$jsonPath = Join-Path $root "private-evaluator-pack\paid_beta_owner_decision_brief_20260617.json"
$reportPath = Join-Path $root "private-evaluator-pack\paid_beta_owner_decision_brief_probe_report_20260617.md"
$summaryPath = Join-Path $root "private-evaluator-pack\paid_beta_owner_decision_brief_probe_summary_20260617.json"

$checks = New-Object System.Collections.Generic.List[object]

function Add-Check {
  param(
    [string]$Name,
    [bool]$Passed,
    [string]$Detail
  )
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

$requiredMarkdownPhrases = @(
  "The MachineSignal sandbox is technically ready",
  "What Is Ready",
  "What Is Not Approved Yet",
  "Owner Decisions Needed",
  "Option B",
  "not commercially live",
  "keeping every production and payment gate closed"
)

foreach ($phrase in $requiredMarkdownPhrases) {
  Add-Check "markdown_contains_$($phrase.Replace(' ', '_'))" ($md.Contains($phrase)) $phrase
}

$requiredBlocked = @(
  "paid_beta",
  "commercial_go_live",
  "production_api_keys",
  "real_payments",
  "payment_method_collection",
  "invoices",
  "real_customer_data",
  "personal_data",
  "external_outreach_or_email_campaigns",
  "automated_contact_with_real_companies_or_people",
  "marketplace_publication",
  "hosted_public_mcp",
  "mcp_registry_submission"
)

foreach ($item in $requiredBlocked) {
  Add-Check "json_blocks_$item" ($json.blocked_until_owner_approval -contains $item) $item
}

Add-Check "technical_ready_current_scope" ($json.technical_sandbox_status -eq "ready_for_current_scope") $json.technical_sandbox_status
Add-Check "commercial_not_live" ($json.commercial_status -eq "not_live") $json.commercial_status
Add-Check "recommended_option_b" ($json.recommended_option -eq "prepare_paid_beta_but_do_not_activate") $json.recommended_option

$failed = @($checks | Where-Object { -not $_.passed })
$status = if ($failed.Count -eq 0) { "PASSED" } else { "FAILED" }

$summary = [pscustomobject]@{
  date = "2026-06-17"
  status = $status
  checks = $checks.Count
  failed = $failed.Count
  next_step = "create_controlled_paid_beta_readiness_package_without_activating_payments"
}

$report = @(
  "# Paid Beta Owner Decision Brief - Probe Report"
  ""
  "- Date: 2026-06-17"
  "- Status: $status"
  "- Checks: $($checks.Count)"
  "- Failed: $($failed.Count)"
  ""
  "## Result"
  ""
  "The decision brief is complete, keeps paid beta blocked, and recommends preparing the paid beta package without activating payments."
) -join "`n"

Set-Content -LiteralPath $reportPath -Value $report -Encoding UTF8
Set-Content -LiteralPath $summaryPath -Value ($summary | ConvertTo-Json -Depth 5) -Encoding UTF8

if ($failed.Count -gt 0) {
  $failed | Format-Table -AutoSize | Out-String | Write-Host
  throw "Paid beta owner decision brief probe failed."
}

Write-Host $report
