$ErrorActionPreference = "Stop"

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$pack = Join-Path $root "private-evaluator-pack"
$jsonPath = Join-Path $pack "owner_decision_readiness_packet_nowrite_20260618.json"
$mdPath = Join-Path $pack "owner_decision_readiness_packet_nowrite_20260618.md"
$readinessSummaryPath = Join-Path $pack "controlled_beta_simulation_readiness_report_nowrite_probe_summary_20260618.json"
$reportPath = Join-Path $pack "owner_decision_readiness_packet_nowrite_probe_report_20260618.md"
$summaryPath = Join-Path $pack "owner_decision_readiness_packet_nowrite_probe_summary_20260618.json"

$jsonRaw = Get-Content -LiteralPath $jsonPath -Raw
$md = Get-Content -LiteralPath $mdPath -Raw
$json = $jsonRaw | ConvertFrom-Json
$readinessSummary = Get-Content -LiteralPath $readinessSummaryPath -Raw | ConvertFrom-Json

$checks = New-Object System.Collections.Generic.List[object]

function Add-Check {
  param([string]$Name, [bool]$Passed, [string]$Details)
  $script:checks.Add([pscustomobject]@{ name = $Name; passed = $Passed; details = $Details }) | Out-Null
}

Add-Check "status_is_owner_decision_readiness" ($json.status -eq "owner_decision_readiness_ready_nowrite_not_signed_not_activated") "status=$($json.status)"
Add-Check "not_approval_not_signature" (($json.is_approval -eq $false) -and ($json.is_owner_signature -eq $false)) "is_approval=$($json.is_approval); is_owner_signature=$($json.is_owner_signature)"
Add-Check "activation_flags_false" (($json.activation_allowed -eq $false) -and ($json.paid_beta_activation_allowed -eq $false) -and ($json.commercial_go_live_allowed -eq $false)) "activation flags false"
Add-Check "money_flags_false" (($json.real_payment_allowed -eq $false) -and ($json.invoice_allowed -eq $false) -and ($json.payment_method_collection_allowed -eq $false)) "money flags false"
Add-Check "production_data_distribution_flags_false" (($json.production_key_issuance_allowed -eq $false) -and ($json.real_customer_data_allowed -eq $false) -and ($json.personal_data_allowed -eq $false) -and ($json.external_outreach_allowed -eq $false) -and ($json.marketplace_publication_allowed -eq $false) -and ($json.hosted_public_mcp_allowed -eq $false) -and ($json.mcp_registry_publication_allowed -eq $false)) "production/data/distribution flags false"
Add-Check "current_result_not_yet" ($json.current_result -eq "NOT_YET_OWNER_REVIEW_REQUIRED") "current_result=$($json.current_result)"
Add-Check "remaining_red_gate_owner" ($json.remaining_red_gate -eq "owner_commercial_approval") "red_gate=$($json.remaining_red_gate)"

Add-Check "source_readiness_probe_70_0" ($json.source_evidence.simulation_readiness_probe -eq "70_checks_0_failed") "source probe=$($json.source_evidence.simulation_readiness_probe)"
Add-Check "source_blocking_9_0" ($json.source_evidence.blocking_simulations -eq "9_cases_0_failed") "blocking=$($json.source_evidence.blocking_simulations)"
Add-Check "source_no_side_effects" (($json.source_evidence.real_world_side_effects -eq 0) -and ($json.source_evidence.real_credits_consumed -eq 0) -and ($json.source_evidence.simulated_credits_consumed -eq 1)) "source effects=$($json.source_evidence.real_world_side_effects)"
Add-Check "readiness_summary_success" (($readinessSummary.success -eq $true) -and ($readinessSummary.failed -eq 0) -and ($readinessSummary.simulation_cases_passed -eq 9) -and ($readinessSummary.simulation_cases_failed -eq 0)) "readiness summary success=$($readinessSummary.success)"

$allowed = $json.decision_now_allowed
Add-Check "allowed_only_safe_preparation" (($allowed.prepare_owner_approval_form_nowrite -eq $true) -and ($allowed.continue_nowrite_preparation -eq $true) -and ($allowed.activate_paid_beta -eq $false) -and ($allowed.commercial_go_live -eq $false) -and ($allowed.execute_real_payment -eq $false) -and ($allowed.issue_invoice -eq $false) -and ($allowed.collect_payment_method -eq $false) -and ($allowed.issue_production_api_key -eq $false) -and ($allowed.process_real_customer_data -eq $false) -and ($allowed.process_personal_data -eq $false) -and ($allowed.send_external_outreach -eq $false) -and ($allowed.publish_marketplace_or_public_mcp -eq $false)) "only safe preparation actions allowed"

$requiredGates = @(
  "owner_commercial_approval",
  "fiscal_admin_path",
  "payment_invoice_path",
  "terms_privacy_data",
  "product_listino_credits",
  "production_api_keys",
  "cost_cap_kill_switch",
  "support_escalation",
  "security_incident",
  "distribution_boundary"
)
foreach ($gate in $requiredGates) {
  Add-Check "residual_gate_$gate" (@($json.residual_gates | Where-Object { $_.gate -eq $gate }).Count -eq 1) "gate present"
}
Add-Check "owner_gate_red" (@($json.residual_gates | Where-Object { $_.gate -eq "owner_commercial_approval" -and $_.status -eq "red" }).Count -eq 1) "owner gate remains red"

$proposal = $json.future_beta_proposal_not_live
Add-Check "future_beta_scope_small" (($proposal.max_beta_customers -eq 3) -and ($proposal.duration_days -eq 30) -and ($proposal.first_product -eq "score_pack_1k") -and ($proposal.hypothetical_price_eur -eq 119) -and ($proposal.auto_renewal -eq $false) -and ($proposal.personal_data_allowed -eq $false) -and ($proposal.outreach_allowed -eq $false)) "future beta proposal remains limited and not live"

$minimumItems = @(
  "owner_approval_form_separate",
  "residual_gate_list_with_recommendation",
  "final_fiscal_admin_checklist",
  "final_payment_invoice_checklist",
  "final_privacy_data_checklist",
  "final_production_api_key_checklist",
  "cost_cap_kill_switch_plan",
  "support_incident_plan",
  "distribution_no_outreach_boundary",
  "machine_response_go_requires_separate_activation_step_only_if_all_gates_ready"
)
foreach ($item in $minimumItems) {
  Add-Check "minimum_before_signature_$item" (@($json.minimum_before_real_signature_request) -contains $item) "minimum item present"
}

$machine = $json.current_machine_response
Add-Check "machine_status_readiness" ($machine.status -eq "owner_decision_readiness_ready_nowrite") "status=$($machine.status)"
Add-Check "machine_decision_not_activation" ($machine.decision -eq "ready_for_owner_approval_form_not_activation") "decision=$($machine.decision)"
Add-Check "machine_counts_and_credits" (($machine.simulation_cases_passed -eq 9) -and ($machine.simulation_cases_failed -eq 0) -and ($machine.real_world_side_effects -eq 0) -and ($machine.real_credits_consumed -eq 0) -and ($machine.simulated_credits_consumed -eq 1)) "machine counts/credits ok"
Add-Check "machine_flags_false" (($machine.paid_beta_activation -eq $false) -and ($machine.commercial_go_live -eq $false) -and ($machine.real_payment_executed -eq $false) -and ($machine.invoice_issued -eq $false) -and ($machine.payment_method_collected -eq $false) -and ($machine.production_key_issued -eq $false) -and ($machine.real_or_personal_data_processed -eq $false) -and ($machine.external_outreach_sent -eq $false) -and ($machine.marketplace_or_public_mcp_published -eq $false)) "machine flags false"
Add-Check "machine_support_code" ($machine.support_code -eq "OWNER_DECISION_READINESS_READY_NOWRITE") "support=$($machine.support_code)"
Add-Check "next_safe_action_owner_form" ($json.recommended_next_safe_action -eq "prepare_owner_approval_form_nowrite") "next=$($json.recommended_next_safe_action)"

$requiredMdPhrases = @(
  "Owner decision readiness packet NoWrite",
  "non firmato, non attivato",
  "Questa decisione non equivale ad attivare la beta",
  "Decisione che puo' essere presa ora",
  "Decisione che non puo' essere presa automaticamente",
  "Gate residui prima di qualsiasi attivazione",
  "Esito raccomandato oggi",
  "Risposta macchina corrente",
  "owner_approval_form_nowrite"
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
  '"activate_paid_beta": true',
  '"commercial_go_live": true',
  '"execute_real_payment": true',
  '"issue_invoice": true',
  '"issue_production_api_key": true',
  '"paid_beta_activation": true',
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
$lines.Add("# Owner decision readiness packet NoWrite probe") | Out-Null
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
  document = "owner_decision_readiness_packet_nowrite_probe_summary"
  date = "2026-06-18"
  target = "owner_decision_readiness_packet_nowrite_20260618"
  passed = $passed
  failed = $failed
  success = ($failed -eq 0)
  current_result = $json.current_result
  activation_allowed = $json.activation_allowed
  paid_beta_activation_allowed = $json.paid_beta_activation_allowed
  commercial_go_live_allowed = $json.commercial_go_live_allowed
  remaining_red_gate = $json.remaining_red_gate
  simulation_cases_passed = $json.source_evidence.blocking_simulations
  real_world_side_effects = $json.source_evidence.real_world_side_effects
  next_safe_action = $json.recommended_next_safe_action
  failed_checks = @($failedChecks | ForEach-Object { $_.name })
}
$summary | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $summaryPath -Encoding UTF8

if ($failed -gt 0) {
  throw "Owner decision readiness packet NoWrite probe failed: $failed checks failed. See $reportPath"
}

Write-Host "Owner decision readiness packet NoWrite probe passed: $passed checks, 0 failed."
