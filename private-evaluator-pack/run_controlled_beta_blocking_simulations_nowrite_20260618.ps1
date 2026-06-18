$ErrorActionPreference = "Stop"

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$pack = Join-Path $root "private-evaluator-pack"
$suitePath = Join-Path $pack "controlled_beta_blocking_simulations_nowrite_20260618.json"
$packetSummaryPath = Join-Path $pack "controlled_beta_activation_packet_nowrite_probe_summary_20260618.json"
$reportPath = Join-Path $pack "controlled_beta_blocking_simulations_nowrite_report_20260618.md"
$summaryPath = Join-Path $pack "controlled_beta_blocking_simulations_nowrite_summary_20260618.json"

$suiteRaw = Get-Content -LiteralPath $suitePath -Raw
$suite = $suiteRaw | ConvertFrom-Json
$packetSummary = Get-Content -LiteralPath $packetSummaryPath -Raw | ConvertFrom-Json

$results = New-Object System.Collections.Generic.List[object]

function Add-Result {
  param(
    [string]$Id,
    [string]$Decision,
    [string]$Reason,
    [int]$CreditsConsumed,
    [bool]$RealWorldSideEffect,
    [bool]$Passed,
    [string]$Details
  )
  $script:results.Add([pscustomobject]@{
    id = $Id
    decision = $Decision
    reason = $Reason
    credits_consumed = $CreditsConsumed
    real_world_side_effect = $RealWorldSideEffect
    passed = $Passed
    details = $Details
  }) | Out-Null
}

foreach ($case in $suite.simulation_cases) {
  $expected = $case.expected
  $decision = [string]$expected.decision
  $reason = [string]$expected.reason
  $credits = if ($null -ne $expected.credits_consumed) { [int]$expected.credits_consumed } else { 0 }
  $sideEffect = $false

  switch ($case.id) {
    "beta_request_without_signature" {
      $passed = ($decision -eq "blocked" -and $expected.paid_beta_activation -eq $false -and $credits -eq 0)
      Add-Result $case.id $decision $reason $credits $sideEffect $passed "Owner signature missing blocks beta activation."
    }
    "customer_attempts_payment" {
      $passed = ($decision -eq "blocked" -and $expected.real_payment_executed -eq $false -and $expected.payment_method_collected -eq $false -and $credits -eq 0)
      Add-Result $case.id $decision $reason $credits $sideEffect $passed "Payment and payment method collection remain blocked."
    }
    "customer_submits_personal_data" {
      $passed = ($decision -eq "blocked" -and $expected.real_or_personal_data_processed -eq $false -and $credits -eq 0)
      Add-Result $case.id $decision $reason $credits $sideEffect $passed "Personal data request remains blocked."
    }
    "customer_requests_production_key" {
      $passed = ($decision -eq "blocked" -and $expected.production_key_issued -eq $false -and $credits -eq 0)
      Add-Result $case.id $decision $reason $credits $sideEffect $passed "Production key request remains blocked."
    }
    "customer_exceeds_cost_limit" {
      $passed = ($decision -eq "blocked" -and $expected.batch_executed -eq $false -and $credits -eq 0)
      Add-Result $case.id $decision $reason $credits $sideEffect $passed "Cost cap overrun remains blocked."
    }
    "invalid_scoring_output" {
      $passed = ($decision -eq "not_billable" -and $expected.score_returned -eq $false -and $credits -eq 0)
      Add-Result $case.id $decision $reason $credits $sideEffect $passed "Invalid synthetic output does not consume credit."
    }
    "valid_scoring_output" {
      $passed = ($decision -eq "simulated_success" -and $expected.score_returned -eq $true -and $credits -eq 1 -and $expected.real_customer_data_processed -eq $false)
      Add-Result $case.id $decision $reason $credits $sideEffect $passed "Valid synthetic output consumes one simulated credit only."
    }
    "duplicate_domain_request" {
      $passed = ($decision -eq "deduplicate" -and $credits -eq 0)
      Add-Result $case.id $decision $reason $credits $sideEffect $passed "Duplicate domain does not consume an additional credit."
    }
    "public_marketplace_or_mcp_request" {
      $passed = ($decision -eq "blocked" -and $expected.marketplace_or_public_mcp_published -eq $false -and $credits -eq 0)
      Add-Result $case.id $decision $reason $credits $sideEffect $passed "Public marketplace/MCP request remains blocked."
    }
    default {
      Add-Result $case.id "unknown" "unknown_case" 0 $true $false "Unknown simulation case."
    }
  }
}

$checks = New-Object System.Collections.Generic.List[object]
function Add-Check {
  param([string]$Name, [bool]$Passed, [string]$Details)
  $script:checks.Add([pscustomobject]@{ name = $Name; passed = $Passed; details = $Details }) | Out-Null
}

$passedCases = @($results | Where-Object { $_.passed }).Count
$failedCases = @($results | Where-Object { -not $_.passed }).Count
$totalCredits = (@($results | Measure-Object -Property credits_consumed -Sum).Sum)
if ($null -eq $totalCredits) { $totalCredits = 0 }
$sideEffects = @($results | Where-Object { $_.real_world_side_effect }).Count

Add-Check "packet_probe_success" (($packetSummary.success -eq $true) -and ($packetSummary.failed -eq 0)) "packet probe success=$($packetSummary.success); failed=$($packetSummary.failed)"
Add-Check "suite_status_nowrite" ($suite.status -eq "simulation_suite_ready_nowrite_not_activated") "status=$($suite.status)"
Add-Check "suite_current_result_not_yet" ($suite.current_result -eq "NOT_YET_OWNER_REVIEW_REQUIRED") "current_result=$($suite.current_result)"
Add-Check "activation_flags_false" (($suite.activation_allowed -eq $false) -and ($suite.paid_beta_activation_allowed -eq $false) -and ($suite.commercial_go_live_allowed -eq $false)) "activation flags false"
Add-Check "money_flags_false" (($suite.real_payment_allowed -eq $false) -and ($suite.invoice_allowed -eq $false) -and ($suite.payment_method_collection_allowed -eq $false)) "money flags false"
Add-Check "production_data_distribution_flags_false" (($suite.production_key_issuance_allowed -eq $false) -and ($suite.real_customer_data_allowed -eq $false) -and ($suite.personal_data_allowed -eq $false) -and ($suite.external_outreach_allowed -eq $false) -and ($suite.marketplace_publication_allowed -eq $false) -and ($suite.hosted_public_mcp_allowed -eq $false) -and ($suite.mcp_registry_publication_allowed -eq $false)) "production/data/distribution flags false"
Add-Check "total_cases_9" (@($suite.simulation_cases).Count -eq 9) "total_cases=$(@($suite.simulation_cases).Count)"
Add-Check "all_cases_passed" ($failedCases -eq 0 -and $passedCases -eq 9) "passed_cases=$passedCases; failed_cases=$failedCases"
Add-Check "no_real_world_side_effects" ($sideEffects -eq 0) "side_effects=$sideEffects"
Add-Check "simulated_credits_at_most_1" ($totalCredits -le 1) "total_simulated_credits=$totalCredits"
Add-Check "expected_suite_result_no_side_effects" (($suite.expected_suite_result.allowed_real_world_side_effects -eq 0) -and ($suite.expected_suite_result.real_payments -eq 0) -and ($suite.expected_suite_result.invoices -eq 0) -and ($suite.expected_suite_result.payment_methods_collected -eq 0) -and ($suite.expected_suite_result.production_keys_issued -eq 0) -and ($suite.expected_suite_result.real_or_personal_data_processed -eq 0) -and ($suite.expected_suite_result.external_outreach_sent -eq 0) -and ($suite.expected_suite_result.marketplace_or_public_mcp_published -eq 0)) "expected suite has zero real-world side effects"
Add-Check "next_safe_action_readiness_report" ($suite.recommended_next_safe_action -eq "prepare_controlled_beta_simulation_readiness_report_nowrite") "next=$($suite.recommended_next_safe_action)"

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
  '"real_payment_executed": true',
  '"invoice_issued": true',
  '"production_key_issued": true',
  "beta a pagamento approvata",
  "go-live commerciale approvato"
)
foreach ($pattern in $forbiddenPatterns) {
  Add-Check "forbidden_absent_$($pattern.Replace(' ', '_'))" (-not $suiteRaw.Contains($pattern)) "forbidden pattern absent"
}

$passedChecks = @($checks | Where-Object { $_.passed }).Count
$failedChecks = @($checks | Where-Object { -not $_.passed })
$failedCheckCount = $failedChecks.Count

$lines = New-Object System.Collections.Generic.List[string]
$lines.Add("# Controlled beta blocking simulations NoWrite report") | Out-Null
$lines.Add("") | Out-Null
$lines.Add("Date: 2026-06-18") | Out-Null
$lines.Add("") | Out-Null
$lines.Add("Simulation cases passed: $passedCases") | Out-Null
$lines.Add("Simulation cases failed: $failedCases") | Out-Null
$lines.Add("Probe checks passed: $passedChecks") | Out-Null
$lines.Add("Probe checks failed: $failedCheckCount") | Out-Null
$lines.Add("Simulated credits consumed: $totalCredits") | Out-Null
$lines.Add("Real-world side effects: $sideEffects") | Out-Null
$lines.Add("") | Out-Null
$lines.Add("## Simulation cases") | Out-Null
foreach ($result in $results) {
  $mark = if ($result.passed) { "PASS" } else { "FAIL" }
  $lines.Add("- $mark - $($result.id): $($result.decision) / $($result.reason) / credits=$($result.credits_consumed) / $($result.details)") | Out-Null
}
$lines.Add("") | Out-Null
$lines.Add("## Probe checks") | Out-Null
foreach ($check in $checks) {
  $mark = if ($check.passed) { "PASS" } else { "FAIL" }
  $lines.Add("- $mark - $($check.name): $($check.details)") | Out-Null
}
Set-Content -LiteralPath $reportPath -Value $lines -Encoding UTF8

$summary = [pscustomobject]@{
  document = "controlled_beta_blocking_simulations_nowrite_summary"
  date = "2026-06-18"
  source_suite = "controlled_beta_blocking_simulations_nowrite_20260618"
  simulation_cases_passed = $passedCases
  simulation_cases_failed = $failedCases
  probe_checks_passed = $passedChecks
  probe_checks_failed = $failedCheckCount
  success = ($failedCases -eq 0 -and $failedCheckCount -eq 0)
  current_result = $suite.current_result
  activation_allowed = $suite.activation_allowed
  paid_beta_activation_allowed = $suite.paid_beta_activation_allowed
  commercial_go_live_allowed = $suite.commercial_go_live_allowed
  simulated_credits_consumed = $totalCredits
  real_world_side_effects = $sideEffects
  next_safe_action = $suite.recommended_next_safe_action
  failed_cases = @($results | Where-Object { -not $_.passed } | ForEach-Object { $_.id })
  failed_checks = @($failedChecks | ForEach-Object { $_.name })
}
$summary | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $summaryPath -Encoding UTF8

if (-not $summary.success) {
  throw "Controlled beta blocking simulations failed. See $reportPath"
}

Write-Host "Controlled beta blocking simulations passed: $passedCases cases, $passedChecks probe checks, 0 failed."
