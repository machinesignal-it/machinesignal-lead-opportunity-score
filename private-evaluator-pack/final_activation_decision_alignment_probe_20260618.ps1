$ErrorActionPreference = "Stop"

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$pack = Join-Path $root "private-evaluator-pack"
$brainPath = Join-Path $root "company-brain.json"
$dashboardPath = Join-Path $pack "owner_decision_dashboard_20260618.json"
$recordSummaryPath = Join-Path $pack "final_activation_decision_record_nowrite_probe_summary_20260618.json"
$reportPath = Join-Path $pack "final_activation_decision_alignment_probe_report_20260618.md"
$summaryPath = Join-Path $pack "final_activation_decision_alignment_probe_summary_20260618.json"

$brainRaw = Get-Content -LiteralPath $brainPath -Raw
$dashboardRaw = Get-Content -LiteralPath $dashboardPath -Raw
$brain = $brainRaw | ConvertFrom-Json
$dashboard = $dashboardRaw | ConvertFrom-Json
$recordSummary = Get-Content -LiteralPath $recordSummaryPath -Raw | ConvertFrom-Json

$checks = New-Object System.Collections.Generic.List[object]

function Add-Check {
  param([string]$Name, [bool]$Passed, [string]$Details)
  $script:checks.Add([pscustomobject]@{ name = $Name; passed = $Passed; details = $Details }) | Out-Null
}

Add-Check "brain_version_v15" ($brain.company_brain_version -eq "2026-06-18-internal-v15") "version=$($brain.company_brain_version)"
Add-Check "brain_source_final_record" ($brain.source_of_truth.final_activation_decision_record -eq "private-evaluator-pack/final_activation_decision_record_nowrite_20260618.md") "source=$($brain.source_of_truth.final_activation_decision_record)"
Add-Check "brain_workstream_aligned" ($brain.current_status.current_safe_workstream -eq "final_activation_decision_record_aligned") "workstream=$($brain.current_status.current_safe_workstream)"
Add-Check "brain_final_record_evidence" ($brain.owner_decision_dashboard.final_activation_decision_record.evidence -eq "final_activation_decision_record_nowrite_20260618") "evidence=$($brain.owner_decision_dashboard.final_activation_decision_record.evidence)"
Add-Check "brain_final_record_probe" ($brain.owner_decision_dashboard.final_activation_decision_record.probe -eq "80_checks_0_failed") "probe=$($brain.owner_decision_dashboard.final_activation_decision_record.probe)"
Add-Check "brain_final_record_decision_not_yet" ($brain.owner_decision_dashboard.final_activation_decision_record.decision -eq "NOT_YET_OWNER_REVIEW_REQUIRED") "decision=$($brain.owner_decision_dashboard.final_activation_decision_record.decision)"
Add-Check "brain_final_record_activation_false" (($brain.owner_decision_dashboard.final_activation_decision_record.activation_allowed -eq $false) -and ($brain.owner_decision_dashboard.final_activation_decision_record.owner_signature_present -eq $false)) "activation/signature false"
Add-Check "brain_last_completed_action" ($brain.owner_decision_dashboard.last_completed_safe_action -eq "align_company_brain_dashboard_with_final_activation_decision_record") "last=$($brain.owner_decision_dashboard.last_completed_safe_action)"
Add-Check "brain_next_safe_action" ($brain.owner_decision_dashboard.next_safe_action -eq "prepare_owner_summary_nowrite") "next=$($brain.owner_decision_dashboard.next_safe_action)"
Add-Check "brain_current_decision_next" ($brain.current_decision.next_recommended_action -like "Prepare an owner summary NoWrite*") "next_recommended=$($brain.current_decision.next_recommended_action)"

Add-Check "dashboard_final_record_evidence" ($dashboard.final_activation_decision_record.evidence -eq "final_activation_decision_record_nowrite_20260618") "evidence=$($dashboard.final_activation_decision_record.evidence)"
Add-Check "dashboard_final_record_probe" ($dashboard.final_activation_decision_record.probe -eq "80_checks_0_failed") "probe=$($dashboard.final_activation_decision_record.probe)"
Add-Check "dashboard_final_record_decision_not_yet" ($dashboard.final_activation_decision_record.decision -eq "NOT_YET_OWNER_REVIEW_REQUIRED") "decision=$($dashboard.final_activation_decision_record.decision)"
Add-Check "dashboard_final_record_activation_false" (($dashboard.final_activation_decision_record.activation_allowed -eq $false) -and ($dashboard.final_activation_decision_record.owner_signature_present -eq $false)) "activation/signature false"
Add-Check "dashboard_last_completed_action" ($dashboard.last_completed_safe_action -eq "align_company_brain_dashboard_with_final_activation_decision_record") "last=$($dashboard.last_completed_safe_action)"
Add-Check "dashboard_next_safe_action" ($dashboard.next_safe_action -eq "prepare_owner_summary_nowrite") "next=$($dashboard.next_safe_action)"

Add-Check "record_summary_success" (($recordSummary.success -eq $true) -and ($recordSummary.failed -eq 0)) "record summary success=$($recordSummary.success); failed=$($recordSummary.failed)"
Add-Check "record_summary_not_yet" (($recordSummary.current_result -eq "NOT_YET_OWNER_REVIEW_REQUIRED") -and ($recordSummary.decision -eq "NOT_YET_OWNER_REVIEW_REQUIRED")) "record summary result=$($recordSummary.current_result)"
Add-Check "record_summary_flags" (($recordSummary.activation_allowed -eq $false) -and ($recordSummary.owner_signature_present -eq $false) -and ($recordSummary.result_flags.go_requires_separate_activation_step -eq $false)) "record flags safe"
Add-Check "dashboard_counts_3_12_1" (($dashboard.gate_counts.green -eq 3) -and ($dashboard.gate_counts.yellow -eq 12) -and ($dashboard.gate_counts.red -eq 1)) "counts=$($dashboard.gate_counts.green)/$($dashboard.gate_counts.yellow)/$($dashboard.gate_counts.red)"
Add-Check "dashboard_final_decision_no_go" (($dashboard.final_decision.paid_beta_activation -eq "no_go") -and ($dashboard.final_decision.commercial_go_live -eq "no_go")) "final decision=$($dashboard.final_decision.paid_beta_activation)/$($dashboard.final_decision.commercial_go_live)"
Add-Check "brain_current_decision_no_paid_activity" (($brain.current_decision.start_paid_commercial_activity -eq $false) -and ($brain.current_decision.owner_decision_current_result -eq "NOT_YET_OWNER_REVIEW_REQUIRED")) "brain current decision safe"

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
  '"owner_signature_present": true',
  '"paid_beta_activation": true',
  '"commercial_go_live": true',
  '"go_requires_separate_activation_step": true',
  '"start_paid_commercial_activity": true',
  '"paid_beta_activation": "go"',
  '"commercial_go_live": "go"',
  'GO_REQUIRES_SEPARATE_ACTIVATION_STEP", "activation_allowed": true'
)
foreach ($pattern in $forbiddenPatterns) {
  Add-Check "forbidden_absent_$($pattern.Replace(' ', '_'))" ((-not $brainRaw.Contains($pattern)) -and (-not $dashboardRaw.Contains($pattern))) "forbidden pattern absent"
}

$passed = @($checks | Where-Object { $_.passed }).Count
$failedChecks = @($checks | Where-Object { -not $_.passed })
$failed = $failedChecks.Count

$lines = New-Object System.Collections.Generic.List[string]
$lines.Add("# Final activation decision alignment probe") | Out-Null
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
  document = "final_activation_decision_alignment_probe_summary"
  date = "2026-06-18"
  passed = $passed
  failed = $failed
  success = ($failed -eq 0)
  company_brain_version = $brain.company_brain_version
  current_result = $brain.current_decision.owner_decision_current_result
  final_activation_decision = $dashboard.final_activation_decision_record.decision
  activation_allowed = $dashboard.final_activation_decision_record.activation_allowed
  owner_signature_present = $dashboard.final_activation_decision_record.owner_signature_present
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
  throw "Final activation decision alignment probe failed: $failed checks failed. See $reportPath"
}

Write-Host "Final activation decision alignment probe passed: $passed checks, 0 failed."
