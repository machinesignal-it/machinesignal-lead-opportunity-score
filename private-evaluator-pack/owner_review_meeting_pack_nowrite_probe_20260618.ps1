$ErrorActionPreference = "Stop"

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$pack = Join-Path $root "private-evaluator-pack"
$jsonPath = Join-Path $pack "owner_review_meeting_pack_nowrite_20260618.json"
$mdPath = Join-Path $pack "owner_review_meeting_pack_nowrite_20260618.md"
$brainPath = Join-Path $root "company-brain.json"
$gapPath = Join-Path $pack "final_owner_review_gap_report_nowrite_20260618.json"
$alignmentSummaryPath = Join-Path $pack "final_gap_report_alignment_probe_summary_20260618.json"
$reportPath = Join-Path $pack "owner_review_meeting_pack_nowrite_probe_report_20260618.md"
$summaryPath = Join-Path $pack "owner_review_meeting_pack_nowrite_probe_summary_20260618.json"

$jsonRaw = Get-Content -LiteralPath $jsonPath -Raw
$md = Get-Content -LiteralPath $mdPath -Raw
$json = $jsonRaw | ConvertFrom-Json
$brain = Get-Content -LiteralPath $brainPath -Raw | ConvertFrom-Json
$gap = Get-Content -LiteralPath $gapPath -Raw | ConvertFrom-Json
$alignment = Get-Content -LiteralPath $alignmentSummaryPath -Raw | ConvertFrom-Json

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

Add-Check "status_is_review_pack" ($json.status -eq "owner_review_pack_ready_nowrite_not_signed_not_activated") "status=$($json.status)"
Add-Check "not_approval_not_signature" (($json.is_approval -eq $false) -and ($json.is_owner_signature -eq $false)) "is_approval=$($json.is_approval); is_owner_signature=$($json.is_owner_signature)"
Add-Check "all_activation_flags_false" (($json.activation_allowed -eq $false) -and ($json.paid_beta_activation_allowed -eq $false) -and ($json.commercial_go_live_allowed -eq $false)) "activation flags false"
Add-Check "money_flags_false" (($json.real_payment_allowed -eq $false) -and ($json.invoice_allowed -eq $false) -and ($json.payment_method_collection_allowed -eq $false)) "money flags false"
Add-Check "production_data_distribution_flags_false" (($json.production_key_issuance_allowed -eq $false) -and ($json.real_customer_data_allowed -eq $false) -and ($json.personal_data_allowed -eq $false) -and ($json.external_outreach_allowed -eq $false) -and ($json.marketplace_publication_allowed -eq $false) -and ($json.hosted_public_mcp_allowed -eq $false) -and ($json.mcp_registry_publication_allowed -eq $false)) "production/data/distribution flags false"
Add-Check "source_brain_v14" ($json.source_evidence.company_brain_version -eq "2026-06-18-internal-v14") "source brain=$($json.source_evidence.company_brain_version)"
Add-Check "source_gap_report" ($json.source_evidence.final_gap_report -eq "final_owner_review_gap_report_nowrite_20260618") "gap=$($json.source_evidence.final_gap_report)"
Add-Check "source_gap_probe" ($json.source_evidence.final_gap_report_probe -eq "66_checks_0_failed") "gap_probe=$($json.source_evidence.final_gap_report_probe)"
Add-Check "source_alignment_probe" ($json.source_evidence.alignment_probe -eq "44_checks_0_failed") "alignment_probe=$($json.source_evidence.alignment_probe)"
Add-Check "counts_3_12_1" (($json.current_dashboard_counts.green -eq 3) -and ($json.current_dashboard_counts.yellow -eq 12) -and ($json.current_dashboard_counts.red -eq 1)) "counts=$($json.current_dashboard_counts.green)/$($json.current_dashboard_counts.yellow)/$($json.current_dashboard_counts.red)"
Add-Check "current_result_not_yet" ($json.current_result -eq "NOT_YET_OWNER_REVIEW_REQUIRED") "current_result=$($json.current_result)"
Add-Check "remaining_red_gate_owner" ($json.remaining_red_gate -eq "owner_commercial_approval") "red_gate=$($json.remaining_red_gate)"
Add-Check "meeting_objective_no_activation" ($json.meeting_objective -eq "decide_whether_to_prepare_controlled_beta_activation_packet_without_activating_sales") "objective=$($json.meeting_objective)"
Add-Check "recommended_owner_decision_nowrite" ($json.recommended_owner_decision_today -eq "prepare_controlled_beta_activation_packet_nowrite") "recommended=$($json.recommended_owner_decision_today)"
Add-Check "next_safe_action_nowrite" ($json.recommended_next_safe_action -eq "prepare_controlled_beta_activation_packet_nowrite") "next=$($json.recommended_next_safe_action)"

$requiredDecisionOptions = @(
  "continue_nowrite_only",
  "prepare_controlled_beta_activation_packet_nowrite",
  "stop_commercial_path"
)
foreach ($option in $requiredDecisionOptions) {
  Add-Check "decision_option_$option" (@($json.decision_options | Where-Object { $_.id -eq $option }).Count -eq 1) "decision option present"
}

$requiredSections = @(
  "owner_commercial_decision",
  "fiscal_admin",
  "payments",
  "product_listino",
  "privacy_data",
  "production_api_keys",
  "cost_support_security"
)
foreach ($section in $requiredSections) {
  Add-Check "review_section_$section" (@($json.review_sections | Where-Object { $_.id -eq $section }).Count -eq 1) "review section present"
}

$machine = $json.current_machine_response
Add-Check "machine_status_review_pack_ready" ($machine.status -eq "owner_review_pack_ready_nowrite") "status=$($machine.status)"
Add-Check "machine_decision_review_only" ($machine.decision -eq "review_only") "decision=$($machine.decision)"
Add-Check "machine_support_code" ($machine.support_code -eq "OWNER_REVIEW_PACK_READY_NOWRITE") "support=$($machine.support_code)"
Add-Check "machine_recommended_owner_decision" ($machine.recommended_owner_decision -eq "prepare_controlled_beta_activation_packet_nowrite") "recommended=$($machine.recommended_owner_decision)"
Add-Check "machine_flags_false" (($machine.paid_beta_activation -eq $false) -and ($machine.commercial_go_live -eq $false) -and ($machine.real_payment_executed -eq $false) -and ($machine.invoice_issued -eq $false) -and ($machine.payment_method_collected -eq $false) -and ($machine.production_key_issued -eq $false) -and ($machine.real_or_personal_data_processed -eq $false) -and ($machine.external_outreach_sent -eq $false)) "machine flags false"
Add-Check "machine_credits_zero" ($machine.credits_consumed -eq 0) "credits=$($machine.credits_consumed)"

$requiredMdPhrases = @(
  "Non e' una approvazione",
  "NOT_YET_OWNER_REVIEW_REQUIRED",
  "Owner review meeting pack NoWrite",
  "Obiettivo della review",
  "Decisioni da prendere",
  "Decisione proposta per oggi",
  "Check finale prima di qualsiasi futura attivazione",
  "Output macchina corrente"
)
foreach ($phrase in $requiredMdPhrases) {
  Add-Check "md_contains_$($phrase.Replace(' ', '_'))" ($md.Contains($phrase)) "phrase=$phrase"
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
  '"paid_beta_activation": true',
  '"commercial_go_live": true',
  '"real_payment_executed": true',
  '"invoice_issued": true',
  '"production_key_issued": true',
  "beta a pagamento approvata",
  "go-live commerciale approvato",
  "pagamento approvato",
  "fattura approvata",
  "chiave production approvata",
  "chiave di produzione approvata"
)
foreach ($pattern in $forbiddenPatterns) {
  Add-Check "forbidden_absent_$($pattern.Replace(' ', '_'))" ((-not $jsonRaw.Contains($pattern)) -and (-not $md.Contains($pattern))) "forbidden pattern absent"
}

Add-Check "brain_next_was_meeting_pack" ($brain.owner_decision_dashboard.next_safe_action -eq "prepare_owner_review_meeting_pack_nowrite") "brain next=$($brain.owner_decision_dashboard.next_safe_action)"
Add-Check "gap_current_result_not_yet" ($gap.current_result -eq "NOT_YET_OWNER_REVIEW_REQUIRED") "gap result=$($gap.current_result)"
Add-Check "alignment_probe_success" (($alignment.success -eq $true) -and ($alignment.failed -eq 0)) "alignment success=$($alignment.success); failed=$($alignment.failed)"

$passed = @($checks | Where-Object { $_.passed }).Count
$failedChecks = @($checks | Where-Object { -not $_.passed })
$failed = $failedChecks.Count

$lines = New-Object System.Collections.Generic.List[string]
$lines.Add("# Owner review meeting pack NoWrite probe") | Out-Null
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
  document = "owner_review_meeting_pack_nowrite_probe_summary"
  date = "2026-06-18"
  target = "owner_review_meeting_pack_nowrite_20260618"
  passed = $passed
  failed = $failed
  success = ($failed -eq 0)
  current_result = $json.current_result
  remaining_red_gate = $json.remaining_red_gate
  activation_allowed = $json.activation_allowed
  paid_beta_activation_allowed = $json.paid_beta_activation_allowed
  commercial_go_live_allowed = $json.commercial_go_live_allowed
  recommended_owner_decision_today = $json.recommended_owner_decision_today
  next_safe_action = $json.recommended_next_safe_action
  failed_checks = @($failedChecks | ForEach-Object { $_.name })
}
$summary | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $summaryPath -Encoding UTF8

if ($failed -gt 0) {
  throw "Owner review meeting pack NoWrite probe failed: $failed checks failed. See $reportPath"
}

Write-Host "Owner review meeting pack NoWrite probe passed: $passed checks, 0 failed."
