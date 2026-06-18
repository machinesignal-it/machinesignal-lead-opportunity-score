$ErrorActionPreference = "Stop"

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$pack = Join-Path $root "private-evaluator-pack"
$jsonPath = Join-Path $pack "controlled_beta_activation_packet_nowrite_20260618.json"
$mdPath = Join-Path $pack "controlled_beta_activation_packet_nowrite_20260618.md"
$ownerReviewSummaryPath = Join-Path $pack "owner_review_meeting_pack_nowrite_probe_summary_20260618.json"
$reportPath = Join-Path $pack "controlled_beta_activation_packet_nowrite_probe_report_20260618.md"
$summaryPath = Join-Path $pack "controlled_beta_activation_packet_nowrite_probe_summary_20260618.json"

$jsonRaw = Get-Content -LiteralPath $jsonPath -Raw
$md = Get-Content -LiteralPath $mdPath -Raw
$json = $jsonRaw | ConvertFrom-Json
$ownerReviewSummary = Get-Content -LiteralPath $ownerReviewSummaryPath -Raw | ConvertFrom-Json

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

Add-Check "status_is_packet_ready_nowrite" ($json.status -eq "controlled_beta_activation_packet_ready_nowrite_not_signed_not_activated") "status=$($json.status)"
Add-Check "not_approval_not_signature" (($json.is_approval -eq $false) -and ($json.is_owner_signature -eq $false)) "is_approval=$($json.is_approval); is_owner_signature=$($json.is_owner_signature)"
Add-Check "activation_flags_false" (($json.activation_allowed -eq $false) -and ($json.paid_beta_activation_allowed -eq $false) -and ($json.commercial_go_live_allowed -eq $false)) "activation flags false"
Add-Check "money_flags_false" (($json.real_payment_allowed -eq $false) -and ($json.invoice_allowed -eq $false) -and ($json.payment_method_collection_allowed -eq $false)) "money flags false"
Add-Check "production_data_distribution_flags_false" (($json.production_key_issuance_allowed -eq $false) -and ($json.real_customer_data_allowed -eq $false) -and ($json.personal_data_allowed -eq $false) -and ($json.external_outreach_allowed -eq $false) -and ($json.marketplace_publication_allowed -eq $false) -and ($json.hosted_public_mcp_allowed -eq $false) -and ($json.mcp_registry_publication_allowed -eq $false)) "production/data/distribution flags false"
Add-Check "source_owner_review" ($json.source_evidence.owner_review_pack -eq "owner_review_meeting_pack_nowrite_20260618") "source=$($json.source_evidence.owner_review_pack)"
Add-Check "source_owner_review_probe" ($json.source_evidence.owner_review_pack_probe -eq "64_checks_0_failed") "probe=$($json.source_evidence.owner_review_pack_probe)"
Add-Check "counts_3_12_1" (($json.current_dashboard_counts.green -eq 3) -and ($json.current_dashboard_counts.yellow -eq 12) -and ($json.current_dashboard_counts.red -eq 1)) "counts=$($json.current_dashboard_counts.green)/$($json.current_dashboard_counts.yellow)/$($json.current_dashboard_counts.red)"
Add-Check "current_result_not_yet" ($json.current_result -eq "NOT_YET_OWNER_REVIEW_REQUIRED") "current_result=$($json.current_result)"
Add-Check "remaining_red_gate_owner" ($json.remaining_red_gate -eq "owner_commercial_approval") "red_gate=$($json.remaining_red_gate)"

$scope = $json.proposed_beta_scope
Add-Check "scope_max_three_customers" ($scope.max_beta_customers -eq 3) "max=$($scope.max_beta_customers)"
Add-Check "scope_duration_30_days" ($scope.duration_days -eq 30) "duration=$($scope.duration_days)"
Add-Check "scope_first_product_score_pack" ($scope.first_product -eq "score_pack_1k") "product=$($scope.first_product)"
Add-Check "scope_no_auto_renewal" ($scope.auto_renewal -eq $false) "auto_renewal=$($scope.auto_renewal)"
Add-Check "scope_no_personal_data" ($scope.personal_data_allowed -eq $false) "personal_data=$($scope.personal_data_allowed)"
Add-Check "scope_no_production_access" ($scope.production_access_allowed -eq $false) "production_access=$($scope.production_access_allowed)"

$requiredCriteria = @(
  "owner_signature_present",
  "fiscal_admin_path_approved",
  "payment_invoice_rules_approved_and_tested",
  "terms_privacy_data_policy_approved",
  "product_price_credits_customer_limits_approved",
  "production_api_key_policy_approved",
  "cost_cap_and_kill_switch_implemented_and_tested",
  "support_escalation_ticket_ledger_tested",
  "security_incident_procedure_tested",
  "distribution_channels_approved"
)
foreach ($criterion in $requiredCriteria) {
  Add-Check "criterion_$criterion" (@($json.minimum_future_activation_criteria) -contains $criterion) "criterion present"
}

$requiredBlocks = @(
  "real_payment",
  "invoice",
  "payment_method",
  "production_api_key",
  "real_customer_dataset",
  "personal_data",
  "external_outreach",
  "marketplace_or_registry_publication",
  "hosted_public_mcp",
  "cost_limit_exceeded"
)
foreach ($block in $requiredBlocks) {
  $entry = @($json.automatic_block_rules | Where-Object { $_.request -eq $block -and $_.action -eq "block" })
  Add-Check "block_rule_$block" ($entry.Count -eq 1) "block rule present"
}

$requiredSims = @(
  "beta_request_without_signature",
  "customer_attempts_payment",
  "customer_submits_personal_data",
  "customer_requests_production_key",
  "customer_exceeds_cost_limit",
  "invalid_scoring_output",
  "valid_scoring_output",
  "duplicate_domain_request",
  "public_marketplace_or_mcp_request"
)
foreach ($sim in $requiredSims) {
  Add-Check "required_sim_$sim" (@($json.required_nowrite_simulations | Where-Object { $_.id -eq $sim }).Count -eq 1) "simulation present"
}

$machine = $json.current_machine_response
Add-Check "machine_status_packet_ready" ($machine.status -eq "controlled_beta_activation_packet_ready_nowrite") "status=$($machine.status)"
Add-Check "machine_decision_packet_only" ($machine.decision -eq "packet_only_not_activation") "decision=$($machine.decision)"
Add-Check "machine_support_code" ($machine.support_code -eq "CONTROLLED_BETA_PACKET_READY_NOWRITE") "support=$($machine.support_code)"
Add-Check "machine_flags_false" (($machine.paid_beta_activation -eq $false) -and ($machine.commercial_go_live -eq $false) -and ($machine.real_payment_executed -eq $false) -and ($machine.invoice_issued -eq $false) -and ($machine.payment_method_collected -eq $false) -and ($machine.production_key_issued -eq $false) -and ($machine.real_or_personal_data_processed -eq $false) -and ($machine.external_outreach_sent -eq $false) -and ($machine.marketplace_or_public_mcp_published -eq $false)) "machine flags false"
Add-Check "machine_credits_zero" ($machine.credits_consumed -eq 0) "credits=$($machine.credits_consumed)"
Add-Check "next_safe_action_simulations" ($json.recommended_next_safe_action -eq "simulate_controlled_beta_blocking_cases_nowrite") "next=$($json.recommended_next_safe_action)"

$requiredMdPhrases = @(
  "Controlled beta activation packet NoWrite",
  "non firmato, non attivato",
  "non attiva la beta",
  "Perimetro beta proposto",
  "Criteri minimi per attivare in futuro",
  "Regole di blocco automatico",
  "Simulazioni richieste prima della decisione",
  "Risposta macchina corrente"
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
  "chiave API production approvata"
)
foreach ($pattern in $forbiddenPatterns) {
  Add-Check "forbidden_absent_$($pattern.Replace(' ', '_'))" ((-not $jsonRaw.Contains($pattern)) -and (-not $md.Contains($pattern))) "forbidden pattern absent"
}

Add-Check "owner_review_probe_success" (($ownerReviewSummary.success -eq $true) -and ($ownerReviewSummary.failed -eq 0)) "owner review probe success=$($ownerReviewSummary.success); failed=$($ownerReviewSummary.failed)"

$passed = @($checks | Where-Object { $_.passed }).Count
$failedChecks = @($checks | Where-Object { -not $_.passed })
$failed = $failedChecks.Count

$lines = New-Object System.Collections.Generic.List[string]
$lines.Add("# Controlled beta activation packet NoWrite probe") | Out-Null
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
  document = "controlled_beta_activation_packet_nowrite_probe_summary"
  date = "2026-06-18"
  target = "controlled_beta_activation_packet_nowrite_20260618"
  passed = $passed
  failed = $failed
  success = ($failed -eq 0)
  current_result = $json.current_result
  remaining_red_gate = $json.remaining_red_gate
  activation_allowed = $json.activation_allowed
  paid_beta_activation_allowed = $json.paid_beta_activation_allowed
  commercial_go_live_allowed = $json.commercial_go_live_allowed
  proposed_max_beta_customers = $json.proposed_beta_scope.max_beta_customers
  proposed_first_product = $json.proposed_beta_scope.first_product
  required_simulation_count = @($json.required_nowrite_simulations).Count
  next_safe_action = $json.recommended_next_safe_action
  failed_checks = @($failedChecks | ForEach-Object { $_.name })
}
$summary | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $summaryPath -Encoding UTF8

if ($failed -gt 0) {
  throw "Controlled beta activation packet NoWrite probe failed: $failed checks failed. See $reportPath"
}

Write-Host "Controlled beta activation packet NoWrite probe passed: $passed checks, 0 failed."
