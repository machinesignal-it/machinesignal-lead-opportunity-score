$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$pack = Join-Path $root "private-evaluator-pack"
$jsonPath = Join-Path $pack "no_go_or_activation_preconditions_matrix_nowrite_20260618.json"
$mdPath = Join-Path $pack "no_go_or_activation_preconditions_matrix_nowrite_20260618.md"
$sourceSummaryPath = Join-Path $pack "owner_decision_form_from_review_packet_nowrite_probe_summary_20260618.json"
$summaryPath = Join-Path $pack "no_go_or_activation_preconditions_matrix_nowrite_probe_summary_20260618.json"
$reportPath = Join-Path $pack "no_go_or_activation_preconditions_matrix_nowrite_probe_report_20260618.md"

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
Add-Check "source_decision_form_summary_exists" (Test-Path $sourceSummaryPath) $sourceSummaryPath

$json = Get-Content $jsonPath -Raw | ConvertFrom-Json
$md = Get-Content $mdPath -Raw
$sourceSummary = Get-Content $sourceSummaryPath -Raw | ConvertFrom-Json
$combined = (Get-Content $jsonPath -Raw) + "`n" + $md

Add-Check "source_probe_success" ($sourceSummary.success -eq $true) "source success=$($sourceSummary.success)"
Add-Check "source_probe_119_passed" ($sourceSummary.passed -eq 119) "source passed=$($sourceSummary.passed)"
Add-Check "source_probe_zero_failed" ($sourceSummary.failed -eq 0) "source failed=$($sourceSummary.failed)"
Add-Check "source_selected_null" ($null -eq $sourceSummary.selected_option) "selected=$($sourceSummary.selected_option)"
Add-Check "source_current_result_not_yet" ($sourceSummary.current_result -eq "NOT_YET_OWNER_REVIEW_REQUIRED") $sourceSummary.current_result

Add-Check "status_exact" ($json.status -eq "no_go_or_activation_preconditions_matrix_ready_nowrite_not_signed_not_activated") $json.status
Add-Check "mode_matrix_only" ($json.mode -eq "preconditions matrix only") $json.mode
Add-Check "current_result_not_yet" ($json.current_result -eq "NOT_YET_OWNER_REVIEW_REQUIRED") $json.current_result
Add-Check "decision_no_go" ($json.decision -eq "NO_GO_FOR_ACTIVATION") $json.decision
Add-Check "selected_option_null" ($null -eq $json.selected_option) "selected=$($json.selected_option)"
Add-Check "source_probe_recorded" ($json.source_evidence.owner_decision_form_probe -eq "119_checks_0_failed") $json.source_evidence.owner_decision_form_probe
Add-Check "source_selected_null_json" ($null -eq $json.source_evidence.selected_option) "selected=$($json.source_evidence.selected_option)"
Add-Check "option_matrix_count" ($json.option_matrix.Count -eq 5) "count=$($json.option_matrix.Count)"
Add-Check "minimum_preconditions_count" ($json.minimum_preconditions_before_any_activation.Count -eq 12) "count=$($json.minimum_preconditions_before_any_activation.Count)"
Add-Check "recommended_next_final_summary" ($json.recommended_next_safe_action -eq "prepare_final_owner_go_no_go_summary_nowrite") $json.recommended_next_safe_action

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
$actualOptions = @($json.option_matrix | ForEach-Object { $_.id })
foreach ($option in $requiredOptions) {
  Add-Check "required_option_$option" ($actualOptions -contains $option) $option
}
foreach ($option in $json.option_matrix) {
  Add-Check "option_$($option.option)_not_allowed_present" ($option.not_allowed.Count -gt 0) "$($option.id) not_allowed=$($option.not_allowed.Count)"
  Add-Check "option_$($option.option)_not_activation_status" (-not ($option.status_today -match "activation_allowed|go_live_allowed|approved_live")) "$($option.id) status=$($option.status_today)"
}

$requiredPreconditions = @(
  "explicit_tracked_owner_decision",
  "separate_signature_or_authorization_record",
  "selected_path_sandbox_beta_pause_or_no_go",
  "fiscal_admin_path_confirmed_before_collecting_money",
  "payment_invoice_rules_confirmed_before_payment_method_collection",
  "privacy_data_boundaries_confirmed_before_real_or_personal_data",
  "price_list_credits_refunds_confirmed",
  "cost_cap_kill_switch_max_budget_confirmed",
  "production_api_key_policy_confirmed_before_key_creation",
  "support_escalation_incident_process_confirmed",
  "allowed_distribution_channels_confirmed",
  "final_nowrite_control_passes_zero_errors_before_real_step"
)
foreach ($condition in $requiredPreconditions) {
  Add-Check "required_precondition_$condition" ($json.minimum_preconditions_before_any_activation -contains $condition) $condition
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
Add-Check "machine_status" ($machine.status -eq "no_go_or_activation_preconditions_matrix_ready_nowrite") $machine.status
Add-Check "machine_decision_no_go" ($machine.decision -eq "NO_GO_FOR_ACTIVATION") $machine.decision
Add-Check "machine_current_result" ($machine.current_result -eq "NOT_YET_OWNER_REVIEW_REQUIRED") $machine.current_result
Add-Check "machine_source_probe" ($machine.source_owner_decision_form_probe -eq "119_checks_0_failed") $machine.source_owner_decision_form_probe
Add-Check "machine_options_5" ($machine.options_mapped -eq 5) "options=$($machine.options_mapped)"
Add-Check "machine_preconditions_12" ($machine.minimum_preconditions_count -eq 12) "preconditions=$($machine.minimum_preconditions_count)"
Add-Check "machine_selected_null" ($null -eq $machine.selected_option) "selected=$($machine.selected_option)"
Add-Check "machine_activation_false" ($machine.activation_allowed -eq $false) "activation=$($machine.activation_allowed)"
Add-Check "machine_signature_false" ($machine.owner_signature_present -eq $false) "signature=$($machine.owner_signature_present)"
Add-Check "machine_next_final_summary" ($machine.next_safe_action -eq "prepare_final_owner_go_no_go_summary_nowrite") $machine.next_safe_action
Add-Check "machine_support_code" ($machine.support_code -eq "NO_GO_OR_ACTIVATION_PRECONDITIONS_MATRIX_READY_NOWRITE") $machine.support_code

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
  "No-Go / Activation Preconditions Matrix NoWrite",
  "non firmata, non approvata, non attivata",
  "NO_GO_FOR_ACTIVATION",
  "Matrice per opzione",
  "Precondizioni minime per uscire dal No-Go",
  "questa matrice non attiva nulla",
  "Cosa resta vietato",
  "prepare_final_owner_go_no_go_summary_nowrite"
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
  probe = "no_go_or_activation_preconditions_matrix_nowrite_probe_20260618"
  success = $success
  passed = $passed.Count
  failed = $failed.Count
  current_result = $json.current_result
  decision = $json.decision
  selected_option = $json.selected_option
  options_mapped = $json.option_matrix.Count
  minimum_preconditions_count = $json.minimum_preconditions_before_any_activation.Count
  activation_allowed = $json.activation_allowed
  owner_signature_present = $json.owner_signature_present
  next_safe_action = $json.recommended_next_safe_action
  support_code = $machine.support_code
}
$summary | ConvertTo-Json -Depth 8 | Set-Content -Path $summaryPath -Encoding UTF8

$report = @()
$report += "# No-Go / Activation Preconditions Matrix NoWrite probe report"
$report += ""
$report += "Data: 2026-06-18"
$report += ""
$report += "Success: $success"
$report += "Passed: $($passed.Count)"
$report += "Failed: $($failed.Count)"
$report += "Current result: $($json.current_result)"
$report += "Decision: $($json.decision)"
$report += "Selected option: $($json.selected_option)"
$report += "Options mapped: $($json.option_matrix.Count)"
$report += "Minimum preconditions: $($json.minimum_preconditions_before_any_activation.Count)"
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
  throw "No-Go / Activation Preconditions Matrix NoWrite probe failed with $($failed.Count) failed checks."
}

Write-Output ($summary | ConvertTo-Json -Depth 8)
