$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$pack = Join-Path $root "private-evaluator-pack"
$jsonPath = Join-Path $pack "owner_review_packet_from_verified_gate_coverage_nowrite_20260618.json"
$mdPath = Join-Path $pack "owner_review_packet_from_verified_gate_coverage_nowrite_20260618.md"
$sourceSummaryPath = Join-Path $pack "remaining_gate_coverage_review_nowrite_probe_summary_20260618.json"
$summaryPath = Join-Path $pack "owner_review_packet_from_verified_gate_coverage_nowrite_probe_summary_20260618.json"
$reportPath = Join-Path $pack "owner_review_packet_from_verified_gate_coverage_nowrite_probe_report_20260618.md"

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
Add-Check "source_coverage_summary_exists" (Test-Path $sourceSummaryPath) $sourceSummaryPath

$json = Get-Content $jsonPath -Raw | ConvertFrom-Json
$md = Get-Content $mdPath -Raw
$sourceSummary = Get-Content $sourceSummaryPath -Raw | ConvertFrom-Json
$combined = (Get-Content $jsonPath -Raw) + "`n" + $md

Add-Check "source_probe_success" ($sourceSummary.success -eq $true) "source success=$($sourceSummary.success)"
Add-Check "source_probe_140_passed" ($sourceSummary.passed -eq 140) "source passed=$($sourceSummary.passed)"
Add-Check "source_probe_zero_failed" ($sourceSummary.failed -eq 0) "source failed=$($sourceSummary.failed)"
Add-Check "source_current_result_not_yet" ($sourceSummary.current_result -eq "NOT_YET_OWNER_REVIEW_REQUIRED") $sourceSummary.current_result

Add-Check "status_exact" ($json.status -eq "owner_review_packet_ready_nowrite_not_signed_not_activated") $json.status
Add-Check "mode_owner_review_only" ($json.mode -eq "owner review preparation only") $json.mode
Add-Check "current_result_not_yet" ($json.current_result -eq "NOT_YET_OWNER_REVIEW_REQUIRED") $json.current_result
Add-Check "source_probe_recorded" ($json.source_evidence.remaining_gate_coverage_probe -eq "140_checks_0_failed") $json.source_evidence.remaining_gate_coverage_probe
Add-Check "source_yellow_12" ($json.source_evidence.yellow_gates_with_verified_nowrite_evidence -eq 12) "yellow=$($json.source_evidence.yellow_gates_with_verified_nowrite_evidence)"
Add-Check "source_failed_0" ($json.source_evidence.failed_probe_count -eq 0) "failed=$($json.source_evidence.failed_probe_count)"
Add-Check "remaining_red_owner" ($json.decision_state.remaining_red_gate -eq "owner_commercial_approval") $json.decision_state.remaining_red_gate
Add-Check "recommended_decision_no_activate" ($json.decision_state.recommended_decision_today -eq "continue_preparing_owner_review_but_do_not_activate_paid_beta") $json.decision_state.recommended_decision_today
Add-Check "test_ready_area_count" ($json.test_ready_only_areas.Count -eq 12) "count=$($json.test_ready_only_areas.Count)"
Add-Check "owner_decisions_count" ($json.owner_decisions_required_before_activation.Count -eq 10) "count=$($json.owner_decisions_required_before_activation.Count)"
Add-Check "recommended_next_form" ($json.recommended_next_safe_action -eq "prepare_owner_decision_form_from_review_packet_nowrite") $json.recommended_next_safe_action

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

$requiredAreas = @(
  "terms_privacy_data_readiness",
  "fiscal_admin_readiness",
  "payment_invoice_readiness",
  "product_listino_credits_candidate",
  "credit_refund_policy_candidate",
  "cost_cap_kill_switch_candidate",
  "production_api_key_policy_candidate",
  "security_incident_readiness",
  "support_escalation_model",
  "distribution_outreach_publication_boundary",
  "pnl_paid_beta_delta",
  "policy_pack_skeleton"
)
foreach ($area in $requiredAreas) {
  Add-Check "required_area_$area" ($json.test_ready_only_areas -contains $area) $area
}

$requiredDecisions = @(
  "confirm_whether_to_continue_toward_paid_beta_or_remain_sandbox_only",
  "confirm_allowed_and_forbidden_data_scope",
  "confirm_price_list_credits_and_refund_conditions",
  "confirm_cost_caps_kill_switch_and_maximum_budget",
  "confirm_fiscal_admin_path_before_collecting_money",
  "confirm_payment_invoice_rules_before_payment_collection",
  "confirm_if_and_when_production_api_keys_can_be_created",
  "confirm_allowed_distribution_channels_without_unauthorized_outreach",
  "confirm_support_escalation_and_incident_management",
  "sign_separate_activation_authorization_if_owner_decides_to_proceed"
)
foreach ($decision in $requiredDecisions) {
  Add-Check "required_decision_$decision" ($json.owner_decisions_required_before_activation -contains $decision) $decision
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
  "start_real_subscription_or_auto_renewal",
  "claim_service_is_live_or_sellable"
)
foreach ($action in $forbiddenActions) {
  Add-Check "forbidden_action_listed_$action" ($json.always_forbidden_actions -contains $action) $action
}

$machine = $json.current_machine_response
Add-Check "machine_status" ($machine.status -eq "owner_review_packet_ready_nowrite") $machine.status
Add-Check "machine_decision" ($machine.decision -eq "owner_review_required_before_any_activation") $machine.decision
Add-Check "machine_current_result" ($machine.current_result -eq "NOT_YET_OWNER_REVIEW_REQUIRED") $machine.current_result
Add-Check "machine_source_probe" ($machine.source_coverage_probe -eq "140_checks_0_failed") $machine.source_coverage_probe
Add-Check "machine_yellow_12" ($machine.yellow_gates_with_verified_nowrite_evidence -eq 12) "yellow=$($machine.yellow_gates_with_verified_nowrite_evidence)"
Add-Check "machine_remaining_red_owner" ($machine.remaining_red_gate -eq "owner_commercial_approval") $machine.remaining_red_gate
Add-Check "machine_activation_false" ($machine.activation_allowed -eq $false) "activation=$($machine.activation_allowed)"
Add-Check "machine_signature_false" ($machine.owner_signature_present -eq $false) "signature=$($machine.owner_signature_present)"
Add-Check "machine_next_form" ($machine.next_safe_action -eq "prepare_owner_decision_form_from_review_packet_nowrite") $machine.next_safe_action
Add-Check "machine_support_code" ($machine.support_code -eq "OWNER_REVIEW_PACKET_READY_NOWRITE") $machine.support_code

$machineFalseFields = @(
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
  "hosted_public_mcp_allowed"
)
foreach ($field in $machineFalseFields) {
  Add-FalseFlagCheck $machine $field
}

$requiredMarkdown = @(
  "Owner review packet from verified gate coverage NoWrite",
  "non firmato, non approvato, non attivato",
  "non costituisce una firma",
  "MachineSignal ha completato la preparazione NoWrite dei 12 gate gialli",
  "non ancora attivabile",
  "Cosa resta vietato",
  "Decisioni che il proprietario dovra' prendere",
  "continue_preparing_owner_review_but_do_not_activate_paid_beta",
  "prepare_owner_decision_form_from_review_packet_nowrite"
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
  "beta a pagamento attivata: si",
  "go-live commerciale: si",
  "pagamento reale eseguito",
  "fattura emessa",
  "chiave production emessa"
)
foreach ($pattern in $forbiddenPatterns) {
  Add-Check "forbidden_pattern_absent_$pattern" (-not $combined.Contains($pattern)) $pattern
}

$failed = @($checks | Where-Object { -not $_.pass })
$passed = @($checks | Where-Object { $_.pass })
$success = ($failed.Count -eq 0)

$summary = [pscustomobject]@{
  probe = "owner_review_packet_from_verified_gate_coverage_nowrite_probe_20260618"
  success = $success
  passed = $passed.Count
  failed = $failed.Count
  current_result = $json.current_result
  source_coverage_probe = $json.source_evidence.remaining_gate_coverage_probe
  yellow_gates_with_verified_nowrite_evidence = $json.source_evidence.yellow_gates_with_verified_nowrite_evidence
  remaining_red_gate = $json.decision_state.remaining_red_gate
  activation_allowed = $json.activation_allowed
  owner_signature_present = $json.owner_signature_present
  next_safe_action = $json.recommended_next_safe_action
  support_code = $machine.support_code
}
$summary | ConvertTo-Json -Depth 8 | Set-Content -Path $summaryPath -Encoding UTF8

$report = @()
$report += "# Owner review packet from verified gate coverage NoWrite probe report"
$report += ""
$report += "Data: 2026-06-18"
$report += ""
$report += "Success: $success"
$report += "Passed: $($passed.Count)"
$report += "Failed: $($failed.Count)"
$report += "Current result: $($json.current_result)"
$report += "Source coverage probe: $($json.source_evidence.remaining_gate_coverage_probe)"
$report += "Yellow gates with verified NoWrite evidence: $($json.source_evidence.yellow_gates_with_verified_nowrite_evidence)"
$report += "Remaining red gate: $($json.decision_state.remaining_red_gate)"
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
  throw "Owner review packet NoWrite probe failed with $($failed.Count) failed checks."
}

Write-Output ($summary | ConvertTo-Json -Depth 8)
