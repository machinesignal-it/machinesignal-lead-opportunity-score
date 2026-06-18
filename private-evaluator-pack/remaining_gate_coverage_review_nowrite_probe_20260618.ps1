$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$pack = Join-Path $root "private-evaluator-pack"
$jsonPath = Join-Path $pack "remaining_gate_coverage_review_nowrite_20260618.json"
$mdPath = Join-Path $pack "remaining_gate_coverage_review_nowrite_20260618.md"
$summaryPath = Join-Path $pack "remaining_gate_coverage_review_nowrite_probe_summary_20260618.json"
$reportPath = Join-Path $pack "remaining_gate_coverage_review_nowrite_probe_report_20260618.md"

$checks = New-Object System.Collections.Generic.List[object]

function Add-Check {
  param([string]$Name, [bool]$Pass, [string]$Detail)
  $checks.Add([pscustomobject]@{
    name = $Name
    pass = $Pass
    detail = $Detail
  })
}

function Add-FalseFlagCheck {
  param([object]$Obj, [string]$Field)
  $value = $Obj.$Field
  Add-Check "flag_false_$Field" ($value -eq $false) "$Field=$value"
}

Add-Check "json_exists" (Test-Path $jsonPath) $jsonPath
Add-Check "markdown_exists" (Test-Path $mdPath) $mdPath

$json = Get-Content $jsonPath -Raw | ConvertFrom-Json
$md = Get-Content $mdPath -Raw
$combined = (Get-Content $jsonPath -Raw) + "`n" + $md

Add-Check "status_exact" ($json.status -eq "remaining_gate_coverage_verified_nowrite_not_signed_not_activated") $json.status
Add-Check "mode_coverage_only" ($json.mode -eq "coverage review only") $json.mode
Add-Check "current_result_not_yet" ($json.current_result -eq "NOT_YET_OWNER_REVIEW_REQUIRED") $json.current_result
Add-Check "dashboard_green_3" ($json.dashboard_before_owner_review.green -eq 3) "green=$($json.dashboard_before_owner_review.green)"
Add-Check "dashboard_yellow_12" ($json.dashboard_before_owner_review.yellow -eq 12) "yellow=$($json.dashboard_before_owner_review.yellow)"
Add-Check "dashboard_red_1" ($json.dashboard_before_owner_review.red -eq 1) "red=$($json.dashboard_before_owner_review.red)"
Add-Check "remaining_red_owner" ($json.dashboard_before_owner_review.remaining_red_gate -eq "owner_commercial_approval") $json.dashboard_before_owner_review.remaining_red_gate
Add-Check "coverage_planned_12" ($json.coverage_summary.yellow_gates_planned -eq 12) "planned=$($json.coverage_summary.yellow_gates_planned)"
Add-Check "coverage_verified_12" ($json.coverage_summary.yellow_gates_with_verified_nowrite_evidence -eq 12) "verified=$($json.coverage_summary.yellow_gates_with_verified_nowrite_evidence)"
Add-Check "coverage_failed_0" ($json.coverage_summary.failed_probe_count -eq 0) "failed=$($json.coverage_summary.failed_probe_count)"
Add-Check "gate_coverage_count_12" ($json.verified_gate_coverage.Count -eq 12) "count=$($json.verified_gate_coverage.Count)"
Add-Check "recommended_next_owner_packet" ($json.recommended_next_safe_action -eq "prepare_owner_review_packet_from_verified_gate_coverage_nowrite") $json.recommended_next_safe_action

$falseFields = @(
  "is_approval",
  "is_owner_signature",
  "owner_signature_present",
  "activation_allowed",
  "paid_beta_activation_allowed",
  "commercial_go_live_allowed",
  "real_payment_allowed",
  "invoice_allowed",
  "payment_method_collection_allowed",
  "production_key_issuance_allowed",
  "real_customer_data_allowed",
  "personal_data_allowed",
  "external_outreach_allowed",
  "marketplace_publication_allowed",
  "hosted_public_mcp_allowed",
  "mcp_registry_publication_allowed"
)
foreach ($field in $falseFields) {
  Add-FalseFlagCheck $json $field
}

$requiredGates = @(
  "terms_privacy_data_readiness_candidate",
  "fiscal_admin_readiness_candidate",
  "payment_invoice_readiness_candidate",
  "product_listino_approval_candidate",
  "credit_refund_policy_candidate",
  "cost_cap_kill_switch_candidate",
  "production_api_key_readiness_candidate",
  "security_incident_readiness_candidate",
  "support_escalation_model_candidate",
  "distribution_outreach_publication_approval_candidate",
  "pnl_paid_beta_delta",
  "policy_preparation"
)
$actualGates = @($json.verified_gate_coverage | ForEach-Object { $_.gate })
foreach ($gate in $requiredGates) {
  Add-Check "required_gate_$gate" ($actualGates -contains $gate) $gate
}

foreach ($gate in $json.verified_gate_coverage) {
  Add-Check "gate_$($gate.order)_checks_failed_zero" ($gate.checks_failed -eq 0) "$($gate.gate) failed=$($gate.checks_failed)"
  Add-Check "gate_$($gate.order)_checks_passed_positive" ($gate.checks_passed -gt 0) "$($gate.gate) passed=$($gate.checks_passed)"
  Add-Check "gate_$($gate.order)_checks_total_positive" ($gate.checks_total -gt 0) "$($gate.gate) total=$($gate.checks_total)"
  $statusLooksBlocked = ($gate.commercial_status -match "no_|not_|candidate|draft|skeleton|scenario")
  $statusLooksLive = ($gate.commercial_status -match "approved_final|enabled_live|active_live|commercially_active")
  Add-Check "gate_$($gate.order)_not_live_status" ($statusLooksBlocked -and -not $statusLooksLive) "$($gate.gate) status=$($gate.commercial_status)"
}

$forbiddenActions = @(
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
foreach ($action in $forbiddenActions) {
  Add-Check "forbidden_action_listed_$action" ($json.always_forbidden_actions -contains $action) $action
}

$machine = $json.current_machine_response
Add-Check "machine_status" ($machine.status -eq "remaining_gate_coverage_verified_nowrite") $machine.status
Add-Check "machine_decision" ($machine.decision -eq "prepare_owner_review_packet_next") $machine.decision
Add-Check "machine_current_result" ($machine.current_result -eq "NOT_YET_OWNER_REVIEW_REQUIRED") $machine.current_result
Add-Check "machine_yellow_planned_12" ($machine.yellow_gates_planned -eq 12) "planned=$($machine.yellow_gates_planned)"
Add-Check "machine_yellow_verified_12" ($machine.yellow_gates_with_verified_nowrite_evidence -eq 12) "verified=$($machine.yellow_gates_with_verified_nowrite_evidence)"
Add-Check "machine_failed_0" ($machine.failed_probe_count -eq 0) "failed=$($machine.failed_probe_count)"
Add-Check "machine_remaining_red_owner" ($machine.remaining_red_gate -eq "owner_commercial_approval") $machine.remaining_red_gate
Add-Check "machine_activation_false" ($machine.activation_allowed -eq $false) "activation=$($machine.activation_allowed)"
Add-Check "machine_signature_false" ($machine.owner_signature_present -eq $false) "signature=$($machine.owner_signature_present)"
Add-Check "machine_next_owner_packet" ($machine.next_safe_action -eq "prepare_owner_review_packet_from_verified_gate_coverage_nowrite") $machine.next_safe_action
Add-Check "machine_support_code" ($machine.support_code -eq "REMAINING_GATE_COVERAGE_VERIFIED_NOWRITE") $machine.support_code

$requiredMarkdown = @(
  "Remaining gate coverage review NoWrite",
  "non firmata, non approvata, non attivata",
  "I 12 gate gialli hanno una copertura NoWrite verificata",
  "Non significa pero' che MachineSignal possa andare live o vendere",
  "owner_commercial_approval",
  "Cosa resta vietato",
  "prepare_owner_review_packet_from_verified_gate_coverage_nowrite"
)
foreach ($phrase in $requiredMarkdown) {
  Add-Check "markdown_contains_$phrase" ($md.Contains($phrase)) $phrase
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
  '"hosted_public_mcp_allowed": true',
  '"mcp_registry_publication_allowed": true',
  '"owner_signature_present": true',
  "beta a pagamento attiva",
  "go-live commerciale attivo",
  "pagamento reale eseguito",
  "fattura emessa",
  "chiave production emessa: si"
)
foreach ($pattern in $forbiddenPatterns) {
  Add-Check "forbidden_pattern_absent_$pattern" (-not $combined.Contains($pattern)) $pattern
}

$failed = @($checks | Where-Object { -not $_.pass })
$passed = @($checks | Where-Object { $_.pass })
$success = ($failed.Count -eq 0)

$summary = [pscustomobject]@{
  probe = "remaining_gate_coverage_review_nowrite_probe_20260618"
  success = $success
  passed = $passed.Count
  failed = $failed.Count
  current_result = $json.current_result
  yellow_gates_planned = $json.coverage_summary.yellow_gates_planned
  yellow_gates_with_verified_nowrite_evidence = $json.coverage_summary.yellow_gates_with_verified_nowrite_evidence
  remaining_red_gate = $json.dashboard_before_owner_review.remaining_red_gate
  activation_allowed = $json.activation_allowed
  owner_signature_present = $json.owner_signature_present
  next_safe_action = $json.recommended_next_safe_action
  support_code = $machine.support_code
}
$summary | ConvertTo-Json -Depth 8 | Set-Content -Path $summaryPath -Encoding UTF8

$report = @()
$report += "# Remaining gate coverage review NoWrite probe report"
$report += ""
$report += "Data: 2026-06-18"
$report += ""
$report += "Success: $success"
$report += "Passed: $($passed.Count)"
$report += "Failed: $($failed.Count)"
$report += "Current result: $($json.current_result)"
$report += "Yellow gates planned: $($json.coverage_summary.yellow_gates_planned)"
$report += "Yellow gates with verified NoWrite evidence: $($json.coverage_summary.yellow_gates_with_verified_nowrite_evidence)"
$report += "Remaining red gate: $($json.dashboard_before_owner_review.remaining_red_gate)"
$report += "Activation allowed: $($json.activation_allowed)"
$report += "Owner signature present: $($json.owner_signature_present)"
$report += "Next safe action: $($json.recommended_next_safe_action)"
$report += ""
$report += "## Failed checks"
if ($failed.Count -eq 0) {
  $report += "None."
} else {
  foreach ($item in $failed) {
    $report += "- $($item.name): $($item.detail)"
  }
}
$report += ""
$report += "## Passed checks"
foreach ($item in $passed) {
  $report += "- $($item.name): $($item.detail)"
}
$report -join "`n" | Set-Content -Path $reportPath -Encoding UTF8

if (-not $success) {
  throw "Remaining gate coverage review NoWrite probe failed with $($failed.Count) failed checks."
}

Write-Output ($summary | ConvertTo-Json -Depth 8)
