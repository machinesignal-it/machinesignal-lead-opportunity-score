$ErrorActionPreference = "Stop"

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$pack = Join-Path $root "private-evaluator-pack"
$jsonPath = Join-Path $pack "activation_review_packet_nowrite_20260618.json"
$mdPath = Join-Path $pack "activation_review_packet_nowrite_20260618.md"
$formSummaryPath = Join-Path $pack "owner_approval_form_nowrite_probe_summary_20260618.json"
$reportPath = Join-Path $pack "activation_review_packet_nowrite_probe_report_20260618.md"
$summaryPath = Join-Path $pack "activation_review_packet_nowrite_probe_summary_20260618.json"

$jsonRaw = Get-Content -LiteralPath $jsonPath -Raw
$md = Get-Content -LiteralPath $mdPath -Raw
$json = $jsonRaw | ConvertFrom-Json
$formSummary = Get-Content -LiteralPath $formSummaryPath -Raw | ConvertFrom-Json

$checks = New-Object System.Collections.Generic.List[object]

function Add-Check {
  param([string]$Name, [bool]$Passed, [string]$Details)
  $script:checks.Add([pscustomobject]@{ name = $Name; passed = $Passed; details = $Details }) | Out-Null
}

Add-Check "status_is_activation_review_ready" ($json.status -eq "activation_review_packet_ready_nowrite_not_signed_not_activated") "status=$($json.status)"
Add-Check "not_approval_not_signature" (($json.is_approval -eq $false) -and ($json.is_owner_signature -eq $false) -and ($json.owner_signature_present -eq $false)) "approval/signature false"
Add-Check "activation_flags_false" (($json.activation_allowed -eq $false) -and ($json.paid_beta_activation_allowed -eq $false) -and ($json.commercial_go_live_allowed -eq $false)) "activation flags false"
Add-Check "money_flags_false" (($json.real_payment_allowed -eq $false) -and ($json.invoice_allowed -eq $false) -and ($json.payment_method_collection_allowed -eq $false)) "money flags false"
Add-Check "production_data_distribution_flags_false" (($json.production_key_issuance_allowed -eq $false) -and ($json.real_customer_data_allowed -eq $false) -and ($json.personal_data_allowed -eq $false) -and ($json.external_outreach_allowed -eq $false) -and ($json.marketplace_publication_allowed -eq $false) -and ($json.hosted_public_mcp_allowed -eq $false) -and ($json.mcp_registry_publication_allowed -eq $false)) "production/data/distribution flags false"
Add-Check "current_result_not_yet" ($json.current_result -eq "NOT_YET_OWNER_REVIEW_REQUIRED") "current_result=$($json.current_result)"
Add-Check "decision_review_not_activation" ($json.decision -eq "review_ready_but_activation_not_allowed") "decision=$($json.decision)"
Add-Check "future_result_requires_separate_activation" ($json.future_possible_result_if_all_gates_green_and_separate_signature_exists -eq "GO_REQUIRES_SEPARATE_ACTIVATION_STEP") "future=$($json.future_possible_result_if_all_gates_green_and_separate_signature_exists)"
Add-Check "remaining_red_gate_owner" ($json.remaining_red_gate -eq "owner_commercial_approval") "red_gate=$($json.remaining_red_gate)"
Add-Check "source_form_probe" ($json.source_evidence.owner_approval_form_probe -eq "72_checks_0_failed") "source=$($json.source_evidence.owner_approval_form_probe)"
Add-Check "form_summary_success" (($formSummary.success -eq $true) -and ($formSummary.failed -eq 0) -and ($formSummary.owner_signature_present -eq $false)) "form summary success=$($formSummary.success)"

$requiredReviewAreas = @(
  "owner_approval",
  "fiscal_admin",
  "payment_invoice",
  "terms_privacy_data",
  "product_listino_credits",
  "production_api_keys",
  "cost_cap_kill_switch",
  "support_escalation",
  "security_incident",
  "distribution_boundary"
)
foreach ($area in $requiredReviewAreas) {
  Add-Check "review_area_$area" (@($json.review_checklist | Where-Object { $_.area -eq $area }).Count -eq 1) "review area present"
}
Add-Check "owner_review_area_red" (@($json.review_checklist | Where-Object { $_.area -eq "owner_approval" -and $_.current_status -eq "red" }).Count -eq 1) "owner approval remains red"

$requiredGo = @(
  "separate_owner_signature_present",
  "fiscal_admin_green",
  "payment_invoice_green",
  "terms_privacy_data_green",
  "product_listino_credits_green",
  "production_api_keys_green",
  "cost_cap_kill_switch_green",
  "support_escalation_green",
  "security_incident_green",
  "distribution_boundary_green",
  "separate_activation_decision_record_generated",
  "activation_remains_separate_step"
)
foreach ($item in $requiredGo) {
  Add-Check "future_go_condition_$item" (@($json.future_go_conditions) -contains $item) "future go condition present"
}

$requiredNoGo = @(
  "owner_signature_missing",
  "fiscal_admin_missing",
  "payment_invoice_missing",
  "terms_privacy_data_missing",
  "real_or_personal_data_requested",
  "production_key_requested_before_policy",
  "outreach_requested",
  "marketplace_or_mcp_publication_requested",
  "cost_cap_not_implemented",
  "ambiguous_owner_instruction"
)
foreach ($item in $requiredNoGo) {
  Add-Check "no_go_condition_$item" (@($json.no_go_conditions) -contains $item) "no-go condition present"
}

$scope = $json.future_beta_max_scope_not_live
Add-Check "future_scope_limited_not_live" (($scope.max_beta_customers -eq 3) -and ($scope.duration_days -eq 30) -and ($scope.first_product -eq "score_pack_1k") -and ($scope.hypothetical_price_eur -eq 119) -and ($scope.auto_renewal -eq $false) -and ($scope.personal_data_allowed -eq $false) -and ($scope.outreach_allowed -eq $false) -and ($scope.marketplace_or_public_mcp_allowed -eq $false)) "future scope limited"

$machine = $json.current_machine_response
Add-Check "machine_status" ($machine.status -eq "activation_review_packet_ready_nowrite") "status=$($machine.status)"
Add-Check "machine_decision" ($machine.decision -eq "review_ready_but_activation_not_allowed") "decision=$($machine.decision)"
Add-Check "machine_future_possible" ($machine.future_possible_result -eq "GO_REQUIRES_SEPARATE_ACTIVATION_STEP") "future=$($machine.future_possible_result)"
Add-Check "machine_signature_false" ($machine.owner_signature_present -eq $false) "signature=$($machine.owner_signature_present)"
Add-Check "machine_flags_false" (($machine.paid_beta_activation -eq $false) -and ($machine.commercial_go_live -eq $false) -and ($machine.real_payment_executed -eq $false) -and ($machine.invoice_issued -eq $false) -and ($machine.payment_method_collected -eq $false) -and ($machine.production_key_issued -eq $false) -and ($machine.real_or_personal_data_processed -eq $false) -and ($machine.external_outreach_sent -eq $false) -and ($machine.marketplace_or_public_mcp_published -eq $false)) "machine flags false"
Add-Check "machine_support_code" ($machine.support_code -eq "ACTIVATION_REVIEW_PACKET_READY_NOWRITE") "support=$($machine.support_code)"
Add-Check "next_safe_action_final_record" ($json.recommended_next_safe_action -eq "prepare_final_activation_decision_record_nowrite") "next=$($json.recommended_next_safe_action)"

$requiredMdPhrases = @(
  'Activation review packet NoWrite',
  'non firmato, non attivato',
  "La risposta corrente e': non ancora",
  'Checklist finale di review',
  'Condizioni per un futuro GO',
  'Condizioni per un NO-GO',
  'Decisione corrente: `review_ready_but_activation_not_allowed`',
  'Risposta macchina corrente',
  'final_activation_decision_record_nowrite'
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
$lines.Add("# Activation review packet NoWrite probe") | Out-Null
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
  document = "activation_review_packet_nowrite_probe_summary"
  date = "2026-06-18"
  target = "activation_review_packet_nowrite_20260618"
  passed = $passed
  failed = $failed
  success = ($failed -eq 0)
  current_result = $json.current_result
  decision = $json.decision
  activation_allowed = $json.activation_allowed
  owner_signature_present = $json.owner_signature_present
  future_possible_result = $json.future_possible_result_if_all_gates_green_and_separate_signature_exists
  next_safe_action = $json.recommended_next_safe_action
  failed_checks = @($failedChecks | ForEach-Object { $_.name })
}
$summary | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $summaryPath -Encoding UTF8

if ($failed -gt 0) {
  throw "Activation review packet NoWrite probe failed: $failed checks failed. See $reportPath"
}

Write-Host "Activation review packet NoWrite probe passed: $passed checks, 0 failed."
