$ErrorActionPreference = "Stop"

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$pack = Join-Path $root "private-evaluator-pack"
$jsonPath = Join-Path $pack "final_activation_decision_record_nowrite_20260618.json"
$mdPath = Join-Path $pack "final_activation_decision_record_nowrite_20260618.md"
$activationReviewSummaryPath = Join-Path $pack "activation_review_packet_nowrite_probe_summary_20260618.json"
$reportPath = Join-Path $pack "final_activation_decision_record_nowrite_probe_report_20260618.md"
$summaryPath = Join-Path $pack "final_activation_decision_record_nowrite_probe_summary_20260618.json"

$jsonRaw = Get-Content -LiteralPath $jsonPath -Raw
$md = Get-Content -LiteralPath $mdPath -Raw
$json = $jsonRaw | ConvertFrom-Json
$activationReviewSummary = Get-Content -LiteralPath $activationReviewSummaryPath -Raw | ConvertFrom-Json

$checks = New-Object System.Collections.Generic.List[object]

function Add-Check {
  param([string]$Name, [bool]$Passed, [string]$Details)
  $script:checks.Add([pscustomobject]@{ name = $Name; passed = $Passed; details = $Details }) | Out-Null
}

Add-Check "status_is_final_decision_record" ($json.status -eq "final_activation_decision_record_ready_nowrite_not_signed_not_activated") "status=$($json.status)"
Add-Check "not_approval_not_signature" (($json.is_approval -eq $false) -and ($json.is_owner_signature -eq $false) -and ($json.owner_signature_present -eq $false)) "approval/signature false"
Add-Check "activation_flags_false" (($json.activation_allowed -eq $false) -and ($json.paid_beta_activation_allowed -eq $false) -and ($json.commercial_go_live_allowed -eq $false)) "activation flags false"
Add-Check "money_flags_false" (($json.real_payment_allowed -eq $false) -and ($json.invoice_allowed -eq $false) -and ($json.payment_method_collection_allowed -eq $false)) "money flags false"
Add-Check "production_data_distribution_flags_false" (($json.production_key_issuance_allowed -eq $false) -and ($json.real_customer_data_allowed -eq $false) -and ($json.personal_data_allowed -eq $false) -and ($json.external_outreach_allowed -eq $false) -and ($json.marketplace_publication_allowed -eq $false) -and ($json.hosted_public_mcp_allowed -eq $false) -and ($json.mcp_registry_publication_allowed -eq $false)) "production/data/distribution flags false"
Add-Check "current_result_not_yet" ($json.current_result -eq "NOT_YET_OWNER_REVIEW_REQUIRED") "current_result=$($json.current_result)"
Add-Check "decision_not_yet" ($json.decision -eq "NOT_YET_OWNER_REVIEW_REQUIRED") "decision=$($json.decision)"
Add-Check "classification_review_required" ($json.classification -eq "review_required_before_any_activation") "classification=$($json.classification)"
Add-Check "allowed_results_present" ((@($json.allowed_results) -contains "NO_GO_BLOCKED") -and (@($json.allowed_results) -contains "NOT_YET_OWNER_REVIEW_REQUIRED") -and (@($json.allowed_results) -contains "GO_REQUIRES_SEPARATE_ACTIVATION_STEP")) "allowed results present"
Add-Check "result_flags_correct" (($json.result_flags.no_go_blocked -eq $false) -and ($json.result_flags.not_yet_owner_review_required -eq $true) -and ($json.result_flags.go_requires_separate_activation_step -eq $false)) "result flags correct"
Add-Check "remaining_red_gate_owner" ($json.remaining_red_gate -eq "owner_commercial_approval") "red_gate=$($json.remaining_red_gate)"
Add-Check "source_activation_review_probe" ($json.source_evidence.activation_review_probe -eq "82_checks_0_failed") "source=$($json.source_evidence.activation_review_probe)"
Add-Check "activation_review_summary_success" (($activationReviewSummary.success -eq $true) -and ($activationReviewSummary.failed -eq 0) -and ($activationReviewSummary.owner_signature_present -eq $false) -and ($activationReviewSummary.activation_allowed -eq $false)) "activation review summary success=$($activationReviewSummary.success)"

$requiredReasons = @(
  "owner_signature_missing",
  "owner_commercial_approval_red",
  "fiscal_admin_not_green",
  "payment_invoice_not_green",
  "terms_privacy_data_not_green",
  "product_listino_credits_not_green",
  "production_api_keys_not_green",
  "cost_cap_kill_switch_not_green",
  "support_escalation_not_green",
  "security_incident_not_green",
  "distribution_boundary_not_green"
)
foreach ($reason in $requiredReasons) {
  Add-Check "not_go_reason_$reason" (@($json.not_go_reasons) -contains $reason) "reason present"
}

$requiredAllowed = @(
  "continue_nowrite_preparation",
  "align_company_brain_dashboard_with_final_activation_decision_record",
  "prepare_owner_summary",
  "run_additional_internal_simulations",
  "keep_automatic_blocks_active"
)
foreach ($item in $requiredAllowed) {
  Add-Check "allowed_now_$item" (@($json.allowed_now) -contains $item) "allowed item present"
}

$requiredBlocked = @(
  "activate_paid_beta",
  "commercial_go_live",
  "execute_real_payment",
  "issue_invoice",
  "collect_payment_method",
  "issue_production_api_key",
  "process_real_customer_data",
  "process_personal_data",
  "send_external_outreach",
  "publish_marketplace_listing",
  "launch_hosted_public_mcp",
  "submit_mcp_registry",
  "start_real_subscription_or_auto_renewal"
)
foreach ($item in $requiredBlocked) {
  Add-Check "blocked_now_$item" (@($json.blocked_now) -contains $item) "blocked item present"
}

$machine = $json.current_machine_response
Add-Check "machine_status" ($machine.status -eq "final_activation_decision_record_ready_nowrite") "status=$($machine.status)"
Add-Check "machine_decision_not_yet" ($machine.decision -eq "NOT_YET_OWNER_REVIEW_REQUIRED") "decision=$($machine.decision)"
Add-Check "machine_no_go_false_go_false" (($machine.no_go_blocked -eq $false) -and ($machine.go_requires_separate_activation_step -eq $false)) "machine go flags false"
Add-Check "machine_signature_false" ($machine.owner_signature_present -eq $false) "signature=$($machine.owner_signature_present)"
Add-Check "machine_activation_false" ($machine.activation_allowed -eq $false) "activation=$($machine.activation_allowed)"
Add-Check "machine_flags_false" (($machine.paid_beta_activation -eq $false) -and ($machine.commercial_go_live -eq $false) -and ($machine.real_payment_executed -eq $false) -and ($machine.invoice_issued -eq $false) -and ($machine.payment_method_collected -eq $false) -and ($machine.production_key_issued -eq $false) -and ($machine.real_or_personal_data_processed -eq $false) -and ($machine.external_outreach_sent -eq $false) -and ($machine.marketplace_or_public_mcp_published -eq $false)) "machine flags false"
Add-Check "machine_support_code" ($machine.support_code -eq "FINAL_ACTIVATION_DECISION_NOT_YET_NOWRITE") "support=$($machine.support_code)"
Add-Check "next_safe_action_alignment" ($json.recommended_next_safe_action -eq "align_company_brain_dashboard_with_final_activation_decision_record") "next=$($json.recommended_next_safe_action)"

$requiredMdPhrases = @(
  'Final activation decision record NoWrite',
  'non firmato, non attivato',
  'Esito corrente: `NOT_YET_OWNER_REVIEW_REQUIRED`',
  "Perche' non e' GO",
  "Cosa e' consentito ora",
  'Cosa resta vietato',
  'Stato macchina finale corrente',
  'align_company_brain_dashboard_with_final_activation_decision_record'
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
  '"owner_signature_present": true',
  '"paid_beta_activation": true',
  '"commercial_go_live": true',
  '"real_payment_executed": true',
  '"invoice_issued": true',
  '"production_key_issued": true',
  '"go_requires_separate_activation_step": true',
  "beta a pagamento approvata",
  "go-live commerciale approvato",
  "pagamento approvato",
  "fattura approvata"
)
foreach ($pattern in $forbiddenPatterns) {
  Add-Check "forbidden_absent_$($pattern.Replace(' ', '_'))" ((-not $jsonRaw.Contains($pattern)) -and (-not $md.Contains($pattern))) "forbidden pattern absent"
}

$passed = @($checks | Where-Object { $_.passed }).Count
$failedChecks = @($checks | Where-Object { -not $_.passed })
$failed = $failedChecks.Count

$lines = New-Object System.Collections.Generic.List[string]
$lines.Add("# Final activation decision record NoWrite probe") | Out-Null
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
  document = "final_activation_decision_record_nowrite_probe_summary"
  date = "2026-06-18"
  target = "final_activation_decision_record_nowrite_20260618"
  passed = $passed
  failed = $failed
  success = ($failed -eq 0)
  current_result = $json.current_result
  decision = $json.decision
  classification = $json.classification
  activation_allowed = $json.activation_allowed
  owner_signature_present = $json.owner_signature_present
  result_flags = $json.result_flags
  remaining_red_gate = $json.remaining_red_gate
  next_safe_action = $json.recommended_next_safe_action
  failed_checks = @($failedChecks | ForEach-Object { $_.name })
}
$summary | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $summaryPath -Encoding UTF8

if ($failed -gt 0) {
  throw "Final activation decision record NoWrite probe failed: $failed checks failed. See $reportPath"
}

Write-Host "Final activation decision record NoWrite probe passed: $passed checks, 0 failed."
