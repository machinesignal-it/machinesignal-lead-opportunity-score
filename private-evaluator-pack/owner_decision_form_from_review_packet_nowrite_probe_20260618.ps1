$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$pack = Join-Path $root "private-evaluator-pack"
$jsonPath = Join-Path $pack "owner_decision_form_from_review_packet_nowrite_20260618.json"
$mdPath = Join-Path $pack "owner_decision_form_from_review_packet_nowrite_20260618.md"
$sourceSummaryPath = Join-Path $pack "owner_review_packet_from_verified_gate_coverage_nowrite_probe_summary_20260618.json"
$summaryPath = Join-Path $pack "owner_decision_form_from_review_packet_nowrite_probe_summary_20260618.json"
$reportPath = Join-Path $pack "owner_decision_form_from_review_packet_nowrite_probe_report_20260618.md"

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
Add-Check "source_review_summary_exists" (Test-Path $sourceSummaryPath) $sourceSummaryPath

$json = Get-Content $jsonPath -Raw | ConvertFrom-Json
$md = Get-Content $mdPath -Raw
$sourceSummary = Get-Content $sourceSummaryPath -Raw | ConvertFrom-Json
$combined = (Get-Content $jsonPath -Raw) + "`n" + $md

Add-Check "source_probe_success" ($sourceSummary.success -eq $true) "source success=$($sourceSummary.success)"
Add-Check "source_probe_119_passed" ($sourceSummary.passed -eq 119) "source passed=$($sourceSummary.passed)"
Add-Check "source_probe_zero_failed" ($sourceSummary.failed -eq 0) "source failed=$($sourceSummary.failed)"
Add-Check "source_current_result_not_yet" ($sourceSummary.current_result -eq "NOT_YET_OWNER_REVIEW_REQUIRED") $sourceSummary.current_result

Add-Check "status_exact" ($json.status -eq "owner_decision_form_ready_nowrite_not_signed_not_activated") $json.status
Add-Check "mode_decision_preparation_only" ($json.mode -eq "owner decision preparation only") $json.mode
Add-Check "current_result_not_yet" ($json.current_result -eq "NOT_YET_OWNER_REVIEW_REQUIRED") $json.current_result
Add-Check "decision_not_yet" ($json.decision -eq "not_yet_owner_review_required") $json.decision
Add-Check "selected_option_null" ($null -eq $json.selected_option) "selected_option=$($json.selected_option)"
Add-Check "source_owner_review_probe" ($json.source_evidence.owner_review_packet_probe -eq "119_checks_0_failed") $json.source_evidence.owner_review_packet_probe
Add-Check "source_coverage_probe" ($json.source_evidence.remaining_gate_coverage_probe -eq "140_checks_0_failed") $json.source_evidence.remaining_gate_coverage_probe
Add-Check "remaining_red_owner" ($json.remaining_red_gate -eq "owner_commercial_approval") $json.remaining_red_gate
Add-Check "future_options_count" ($json.future_options.Count -eq 5) "count=$($json.future_options.Count)"
Add-Check "minimum_conditions_count" ($json.minimum_conditions_before_paid_beta.Count -eq 10) "count=$($json.minimum_conditions_before_paid_beta.Count)"
Add-Check "recommended_next_matrix" ($json.recommended_next_safe_action -eq "prepare_no_go_or_activation_preconditions_matrix_nowrite") $json.recommended_next_safe_action

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

$requiredOptions = @(
  "remain_sandbox_only",
  "prepare_controlled_beta_without_activation",
  "request_external_review_before_monetization",
  "authorize_separate_activation_step_preparation",
  "do_not_proceed"
)
$actualOptions = @($json.future_options | ForEach-Object { $_.id })
foreach ($option in $requiredOptions) {
  Add-Check "required_option_$option" ($actualOptions -contains $option) $option
}
foreach ($option in $json.future_options) {
  Add-Check "option_$($option.code)_no_activation" ($option.automatic_effect -eq "no_activation") "$($option.id) effect=$($option.automatic_effect)"
}

$requiredConditions = @(
  "explicit_tracked_owner_decision",
  "fiscal_admin_path_confirmed",
  "payment_invoice_rules_confirmed",
  "privacy_data_boundaries_confirmed",
  "price_list_credits_refunds_confirmed",
  "cost_cap_kill_switch_confirmed",
  "production_api_key_policy_confirmed",
  "support_escalation_incident_process_confirmed",
  "allowed_distribution_channels_confirmed",
  "separate_activation_record_if_owner_decides_to_proceed"
)
foreach ($condition in $requiredConditions) {
  Add-Check "required_condition_$condition" ($json.minimum_conditions_before_paid_beta -contains $condition) $condition
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
Add-Check "machine_status" ($machine.status -eq "owner_decision_form_ready_nowrite") $machine.status
Add-Check "machine_decision" ($machine.decision -eq "not_yet_owner_review_required") $machine.decision
Add-Check "machine_current_result" ($machine.current_result -eq "NOT_YET_OWNER_REVIEW_REQUIRED") $machine.current_result
Add-Check "machine_source_review_probe" ($machine.source_owner_review_packet_probe -eq "119_checks_0_failed") $machine.source_owner_review_packet_probe
Add-Check "machine_options_count" ($machine.available_future_options.Count -eq 5) "count=$($machine.available_future_options.Count)"
Add-Check "machine_selected_option_null" ($null -eq $machine.selected_option) "selected_option=$($machine.selected_option)"
Add-Check "machine_activation_false" ($machine.activation_allowed -eq $false) "activation=$($machine.activation_allowed)"
Add-Check "machine_signature_false" ($machine.owner_signature_present -eq $false) "signature=$($machine.owner_signature_present)"
Add-Check "machine_next_matrix" ($machine.next_safe_action -eq "prepare_no_go_or_activation_preconditions_matrix_nowrite") $machine.next_safe_action
Add-Check "machine_support_code" ($machine.support_code -eq "OWNER_DECISION_FORM_READY_NOWRITE") $machine.support_code

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
  "Owner decision form from review packet NoWrite",
  "non firmato, non approvato, non attivato",
  "Non e' una firma",
  "Decisione corrente",
  "Opzioni decisionali future",
  "Nessuna di queste opzioni",
  "Condizioni minime prima di qualsiasi beta a pagamento",
  "Blocco commerciale ancora attivo",
  "Cosa resta vietato",
  "prepare_no_go_or_activation_preconditions_matrix_nowrite"
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
  '"selected_option": "',
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
  probe = "owner_decision_form_from_review_packet_nowrite_probe_20260618"
  success = $success
  passed = $passed.Count
  failed = $failed.Count
  current_result = $json.current_result
  decision = $json.decision
  selected_option = $json.selected_option
  future_options = $json.future_options.Count
  remaining_red_gate = $json.remaining_red_gate
  activation_allowed = $json.activation_allowed
  owner_signature_present = $json.owner_signature_present
  next_safe_action = $json.recommended_next_safe_action
  support_code = $machine.support_code
}
$summary | ConvertTo-Json -Depth 8 | Set-Content -Path $summaryPath -Encoding UTF8

$report = @()
$report += "# Owner decision form NoWrite probe report"
$report += ""
$report += "Data: 2026-06-18"
$report += ""
$report += "Success: $success"
$report += "Passed: $($passed.Count)"
$report += "Failed: $($failed.Count)"
$report += "Current result: $($json.current_result)"
$report += "Decision: $($json.decision)"
$report += "Selected option: $($json.selected_option)"
$report += "Future options: $($json.future_options.Count)"
$report += "Remaining red gate: $($json.remaining_red_gate)"
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
  throw "Owner decision form NoWrite probe failed with $($failed.Count) failed checks."
}

Write-Output ($summary | ConvertTo-Json -Depth 8)
