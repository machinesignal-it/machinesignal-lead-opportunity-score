$ErrorActionPreference = "Stop"

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$pack = Join-Path $root "private-evaluator-pack"
$brainPath = Join-Path $root "company-brain.json"
$dashboardPath = Join-Path $pack "owner_decision_dashboard_20260618.json"
$gapPath = Join-Path $pack "final_owner_review_gap_report_nowrite_20260618.json"
$gapProbeSummaryPath = Join-Path $pack "final_owner_review_gap_report_nowrite_probe_summary_20260618.json"
$reportPath = Join-Path $pack "final_gap_report_alignment_probe_report_20260618.md"
$summaryPath = Join-Path $pack "final_gap_report_alignment_probe_summary_20260618.json"

$brainRaw = Get-Content -LiteralPath $brainPath -Raw
$dashboardRaw = Get-Content -LiteralPath $dashboardPath -Raw
$brain = $brainRaw | ConvertFrom-Json
$dashboard = $dashboardRaw | ConvertFrom-Json
$gap = Get-Content -LiteralPath $gapPath -Raw | ConvertFrom-Json
$gapProbe = Get-Content -LiteralPath $gapProbeSummaryPath -Raw | ConvertFrom-Json

$checks = New-Object System.Collections.Generic.List[object]

function Add-Check {
  param(
    [string]$Name,
    [bool]$Passed,
    [string]$Details
  )
  $script:checks.Add([pscustomobject]@{
    name = $Name
    passed = $Passed
    details = $Details
  }) | Out-Null
}

Add-Check "brain_version_updated" ($brain.company_brain_version -eq "2026-06-18-internal-v14") "version=$($brain.company_brain_version)"
Add-Check "brain_source_of_truth_gap_report" ($brain.source_of_truth.final_owner_review_gap_report -eq "private-evaluator-pack/final_owner_review_gap_report_nowrite_20260618.md") "source=$($brain.source_of_truth.final_owner_review_gap_report)"
Add-Check "brain_workstream_aligned" ($brain.current_status.current_safe_workstream -eq "final_owner_review_gap_report_aligned") "workstream=$($brain.current_status.current_safe_workstream)"
Add-Check "brain_gap_report_evidence" ($brain.owner_decision_dashboard.final_owner_review_gap_report.evidence -eq "final_owner_review_gap_report_nowrite_20260618") "evidence=$($brain.owner_decision_dashboard.final_owner_review_gap_report.evidence)"
Add-Check "brain_gap_report_probe" ($brain.owner_decision_dashboard.final_owner_review_gap_report.probe -eq "66_checks_0_failed") "probe=$($brain.owner_decision_dashboard.final_owner_review_gap_report.probe)"
Add-Check "brain_gap_report_activation_false" ($brain.owner_decision_dashboard.final_owner_review_gap_report.activation_allowed -eq $false) "activation=$($brain.owner_decision_dashboard.final_owner_review_gap_report.activation_allowed)"
Add-Check "brain_last_completed_action" ($brain.owner_decision_dashboard.last_completed_safe_action -eq "align_company_brain_dashboard_with_final_gap_report") "last=$($brain.owner_decision_dashboard.last_completed_safe_action)"
Add-Check "brain_next_safe_action" ($brain.owner_decision_dashboard.next_safe_action -eq "prepare_owner_review_meeting_pack_nowrite") "next=$($brain.owner_decision_dashboard.next_safe_action)"
Add-Check "brain_current_decision_next" ($brain.current_decision.next_recommended_action -like "Prepare an owner review meeting pack NoWrite*") "next_recommended_action=$($brain.current_decision.next_recommended_action)"

Add-Check "dashboard_gap_report_evidence" ($dashboard.final_owner_review_gap_report.evidence -eq "final_owner_review_gap_report_nowrite_20260618") "evidence=$($dashboard.final_owner_review_gap_report.evidence)"
Add-Check "dashboard_gap_report_probe" ($dashboard.final_owner_review_gap_report.probe -eq "66_checks_0_failed") "probe=$($dashboard.final_owner_review_gap_report.probe)"
Add-Check "dashboard_gap_report_activation_false" ($dashboard.final_owner_review_gap_report.activation_allowed -eq $false) "activation=$($dashboard.final_owner_review_gap_report.activation_allowed)"
Add-Check "dashboard_last_completed_action" ($dashboard.last_completed_safe_action -eq "align_company_brain_dashboard_with_final_gap_report") "last=$($dashboard.last_completed_safe_action)"
Add-Check "dashboard_next_safe_action" ($dashboard.next_safe_action -eq "prepare_owner_review_meeting_pack_nowrite") "next=$($dashboard.next_safe_action)"

Add-Check "counts_remain_3_12_1" (($dashboard.gate_counts.green -eq 3) -and ($dashboard.gate_counts.yellow -eq 12) -and ($dashboard.gate_counts.red -eq 1) -and ($brain.owner_decision_dashboard.green_count -eq 3) -and ($brain.owner_decision_dashboard.yellow_count -eq 12) -and ($brain.owner_decision_dashboard.red_count -eq 1)) "dashboard=$($dashboard.gate_counts.green)/$($dashboard.gate_counts.yellow)/$($dashboard.gate_counts.red); brain=$($brain.owner_decision_dashboard.green_count)/$($brain.owner_decision_dashboard.yellow_count)/$($brain.owner_decision_dashboard.red_count)"
Add-Check "current_result_remains_not_yet" (($dashboard.owner_decision_checklist.current_result -eq "NOT_YET_OWNER_REVIEW_REQUIRED") -and ($brain.current_decision.owner_decision_current_result -eq "NOT_YET_OWNER_REVIEW_REQUIRED") -and ($gap.current_result -eq "NOT_YET_OWNER_REVIEW_REQUIRED")) "current result remains not yet"
Add-Check "final_decision_remains_no_go" (($dashboard.final_decision.paid_beta_activation -eq "no_go") -and ($dashboard.final_decision.commercial_go_live -eq "no_go") -and ($gap.final_decision_now.paid_beta_activation -eq "no_go") -and ($gap.final_decision_now.commercial_go_live -eq "no_go")) "final decision remains no_go"
Add-Check "gap_probe_success" (($gapProbe.success -eq $true) -and ($gapProbe.failed -eq 0)) "gap probe success=$($gapProbe.success); failed=$($gapProbe.failed)"

$blockedActions = @(
  "real_payments",
  "invoices",
  "payment_method_collection",
  "production_api_keys",
  "real_customer_data_processing",
  "personal_data_processing",
  "external_outreach",
  "email_sending_to_external_humans",
  "public_paid_marketplace_publication",
  "hosted_mcp_public_launch",
  "mcp_registry_publication",
  "commercial_go_live"
)
foreach ($action in $blockedActions) {
  Add-Check "brain_blocked_$action" (@($brain.owner_decision_dashboard.blocked_actions) -contains $action) "blocked action present"
}

$forbiddenPatterns = @(
  '"activation_allowed": true',
  '"paid_beta_activation_allowed": true',
  '"commercial_go_live_allowed": true',
  '"real_payment_allowed": true',
  '"invoice_allowed": true',
  '"payment_method_collection_allowed": true',
  '"production_key_issuance_allowed": true',
  '"real_customer_data_allowed": true',
  '"personal_data_allowed": true',
  '"external_outreach_allowed": true',
  '"marketplace_publication_allowed": true',
  'paid_beta_activation": "go"',
  'commercial_go_live": "go"',
  'start_paid_commercial_activity": true'
)
foreach ($pattern in $forbiddenPatterns) {
  Add-Check "forbidden_absent_$($pattern.Replace(' ', '_'))" ((-not $brainRaw.Contains($pattern)) -and (-not $dashboardRaw.Contains($pattern))) "forbidden pattern absent"
}

$passed = @($checks | Where-Object { $_.passed }).Count
$failedChecks = @($checks | Where-Object { -not $_.passed })
$failed = $failedChecks.Count

$lines = New-Object System.Collections.Generic.List[string]
$lines.Add("# Final gap report alignment probe") | Out-Null
$lines.Add("") | Out-Null
$lines.Add("Date: 2026-06-18") | Out-Null
$lines.Add("") | Out-Null
$lines.Add("Passed: $passed") | Out-Null
$lines.Add("Failed: $failed") | Out-Null
$lines.Add("") | Out-Null
foreach ($check in $checks) {
  $mark = if ($check.passed) { "PASS" } else { "FAIL" }
  $lines.Add("- $mark - $($check.name): $($check.details)") | Out-Null
}
Set-Content -LiteralPath $reportPath -Value $lines -Encoding UTF8

$summary = [pscustomobject]@{
  document = "final_gap_report_alignment_probe_summary"
  date = "2026-06-18"
  passed = $passed
  failed = $failed
  success = ($failed -eq 0)
  company_brain_version = $brain.company_brain_version
  current_result = $brain.current_decision.owner_decision_current_result
  dashboard_counts = [pscustomobject]@{
    green = $dashboard.gate_counts.green
    yellow = $dashboard.gate_counts.yellow
    red = $dashboard.gate_counts.red
  }
  final_decision = $dashboard.final_decision
  last_completed_safe_action = $dashboard.last_completed_safe_action
  next_safe_action = $dashboard.next_safe_action
  failed_checks = @($failedChecks | ForEach-Object { $_.name })
}
$summary | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $summaryPath -Encoding UTF8

if ($failed -gt 0) {
  throw "Final gap report alignment probe failed: $failed checks failed. See $reportPath"
}

Write-Host "Final gap report alignment probe passed: $passed checks, 0 failed."
