$ErrorActionPreference = "Stop"

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$pack = Join-Path $root "private-evaluator-pack"
$jsonPath = Join-Path $pack "controlled_beta_simulation_readiness_report_nowrite_20260618.json"
$mdPath = Join-Path $pack "controlled_beta_simulation_readiness_report_nowrite_20260618.md"
$simSummaryPath = Join-Path $pack "controlled_beta_blocking_simulations_nowrite_summary_20260618.json"
$reportPath = Join-Path $pack "controlled_beta_simulation_readiness_report_nowrite_probe_report_20260618.md"
$summaryPath = Join-Path $pack "controlled_beta_simulation_readiness_report_nowrite_probe_summary_20260618.json"

$jsonRaw = Get-Content -LiteralPath $jsonPath -Raw
$md = Get-Content -LiteralPath $mdPath -Raw
$json = $jsonRaw | ConvertFrom-Json
$simSummary = Get-Content -LiteralPath $simSummaryPath -Raw | ConvertFrom-Json

$checks = New-Object System.Collections.Generic.List[object]

function Add-Check {
  param([string]$Name, [bool]$Passed, [string]$Details)
  $script:checks.Add([pscustomobject]@{ name = $Name; passed = $Passed; details = $Details }) | Out-Null
}

Add-Check "status_is_readiness_report" ($json.status -eq "controlled_beta_simulation_readiness_ready_nowrite_not_signed_not_activated") "status=$($json.status)"
Add-Check "not_approval_not_signature" (($json.is_approval -eq $false) -and ($json.is_owner_signature -eq $false)) "is_approval=$($json.is_approval); is_owner_signature=$($json.is_owner_signature)"
Add-Check "activation_flags_false" (($json.activation_allowed -eq $false) -and ($json.paid_beta_activation_allowed -eq $false) -and ($json.commercial_go_live_allowed -eq $false)) "activation flags false"
Add-Check "money_flags_false" (($json.real_payment_allowed -eq $false) -and ($json.invoice_allowed -eq $false) -and ($json.payment_method_collection_allowed -eq $false)) "money flags false"
Add-Check "production_data_distribution_flags_false" (($json.production_key_issuance_allowed -eq $false) -and ($json.real_customer_data_allowed -eq $false) -and ($json.personal_data_allowed -eq $false) -and ($json.external_outreach_allowed -eq $false) -and ($json.marketplace_publication_allowed -eq $false) -and ($json.hosted_public_mcp_allowed -eq $false) -and ($json.mcp_registry_publication_allowed -eq $false)) "production/data/distribution flags false"
Add-Check "current_result_not_yet" ($json.current_result -eq "NOT_YET_OWNER_REVIEW_REQUIRED") "current_result=$($json.current_result)"
Add-Check "remaining_red_gate_owner" ($json.remaining_red_gate -eq "owner_commercial_approval") "red_gate=$($json.remaining_red_gate)"

Add-Check "source_sim_cases_9_0" (($json.source_evidence.simulation_cases_passed -eq 9) -and ($json.source_evidence.simulation_cases_failed -eq 0)) "source cases=$($json.source_evidence.simulation_cases_passed)/$($json.source_evidence.simulation_cases_failed)"
Add-Check "source_probe_checks_28_0" (($json.source_evidence.probe_checks_passed -eq 28) -and ($json.source_evidence.probe_checks_failed -eq 0)) "source probe=$($json.source_evidence.probe_checks_passed)/$($json.source_evidence.probe_checks_failed)"
Add-Check "sim_summary_success" (($simSummary.success -eq $true) -and ($simSummary.simulation_cases_passed -eq 9) -and ($simSummary.simulation_cases_failed -eq 0) -and ($simSummary.probe_checks_failed -eq 0)) "summary success=$($simSummary.success)"
Add-Check "simulation_result_passed" ($json.simulation_result.passed -eq $true) "passed=$($json.simulation_result.passed)"
Add-Check "simulation_result_no_side_effects" ($json.simulation_result.real_world_side_effects -eq 0) "side_effects=$($json.simulation_result.real_world_side_effects)"
Add-Check "simulation_result_no_real_credits" ($json.simulation_result.real_credits_consumed -eq 0) "real_credits=$($json.simulation_result.real_credits_consumed)"
Add-Check "simulation_result_one_sim_credit" ($json.simulation_result.simulated_credits_consumed -eq 1) "sim_credits=$($json.simulation_result.simulated_credits_consumed)"

$requiredValidated = @(
  "owner_signature_missing_blocks_beta",
  "payment_attempt_blocked",
  "personal_data_blocked",
  "production_key_request_blocked",
  "cost_cap_exceeded_blocked",
  "invalid_output_not_billable",
  "valid_synthetic_output_simulates_one_credit",
  "duplicate_domain_deduplicated_or_blocked",
  "public_marketplace_or_mcp_blocked"
)
foreach ($item in $requiredValidated) {
  Add-Check "validated_$item" (@($json.validated_blocking_areas) -contains $item) "validated area present"
}

$requiredBlocked = @(
  "paid_beta_activation",
  "commercial_go_live",
  "real_payments",
  "invoices",
  "payment_method_collection",
  "production_api_keys",
  "real_customer_data",
  "personal_data",
  "external_outreach",
  "marketplace_publication",
  "hosted_public_mcp",
  "mcp_registry_publication",
  "subscriptions_or_auto_renewals"
)
foreach ($item in $requiredBlocked) {
  Add-Check "still_blocked_$item" (@($json.still_blocked) -contains $item) "blocked item present"
}

$machine = $json.current_machine_response
Add-Check "machine_status" ($machine.status -eq "controlled_beta_simulation_readiness_ready_nowrite") "status=$($machine.status)"
Add-Check "machine_decision_not_activation" ($machine.decision -eq "simulation_ready_not_activation") "decision=$($machine.decision)"
Add-Check "machine_support_code" ($machine.support_code -eq "CONTROLLED_BETA_SIMULATION_READY_NOWRITE") "support=$($machine.support_code)"
Add-Check "machine_counts" (($machine.simulation_cases_passed -eq 9) -and ($machine.simulation_cases_failed -eq 0) -and ($machine.probe_checks_passed -eq 28) -and ($machine.probe_checks_failed -eq 0)) "machine counts ok"
Add-Check "machine_flags_false" (($machine.paid_beta_activation -eq $false) -and ($machine.commercial_go_live -eq $false) -and ($machine.real_payment_executed -eq $false) -and ($machine.invoice_issued -eq $false) -and ($machine.payment_method_collected -eq $false) -and ($machine.production_key_issued -eq $false) -and ($machine.real_or_personal_data_processed -eq $false) -and ($machine.external_outreach_sent -eq $false) -and ($machine.marketplace_or_public_mcp_published -eq $false)) "machine flags false"
Add-Check "next_safe_action_owner_decision" ($json.recommended_next_safe_action -eq "prepare_owner_decision_readiness_packet_nowrite") "next=$($json.recommended_next_safe_action)"

$requiredMdPhrases = @(
  "Controlled beta simulation readiness report NoWrite",
  "non firmato, non attivato",
  "Le simulazioni NoWrite della beta controllata sono passate",
  "Cosa hanno provato le simulazioni",
  "Cosa resta bloccato",
  "La raccomandazione non e' attivare la beta",
  "Risposta macchina corrente",
  "owner_decision_readiness_packet_nowrite"
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
  "fattura approvata"
)
foreach ($pattern in $forbiddenPatterns) {
  Add-Check "forbidden_absent_$($pattern.Replace(' ', '_'))" ((-not $jsonRaw.Contains($pattern)) -and (-not $md.Contains($pattern))) "forbidden pattern absent"
}

$passed = @($checks | Where-Object { $_.passed }).Count
$failedChecks = @($checks | Where-Object { -not $_.passed })
$failed = $failedChecks.Count

$lines = New-Object System.Collections.Generic.List[string]
$lines.Add("# Controlled beta simulation readiness report NoWrite probe") | Out-Null
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
  document = "controlled_beta_simulation_readiness_report_nowrite_probe_summary"
  date = "2026-06-18"
  target = "controlled_beta_simulation_readiness_report_nowrite_20260618"
  passed = $passed
  failed = $failed
  success = ($failed -eq 0)
  current_result = $json.current_result
  activation_allowed = $json.activation_allowed
  paid_beta_activation_allowed = $json.paid_beta_activation_allowed
  commercial_go_live_allowed = $json.commercial_go_live_allowed
  simulation_cases_passed = $json.simulation_result.simulation_cases_passed
  simulation_cases_failed = $json.simulation_result.simulation_cases_failed
  real_world_side_effects = $json.simulation_result.real_world_side_effects
  simulated_credits_consumed = $json.simulation_result.simulated_credits_consumed
  next_safe_action = $json.recommended_next_safe_action
  failed_checks = @($failedChecks | ForEach-Object { $_.name })
}
$summary | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $summaryPath -Encoding UTF8

if ($failed -gt 0) {
  throw "Controlled beta simulation readiness report NoWrite probe failed: $failed checks failed. See $reportPath"
}

Write-Host "Controlled beta simulation readiness report NoWrite probe passed: $passed checks, 0 failed."
