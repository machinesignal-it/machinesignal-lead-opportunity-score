$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$pack = Join-Path $root "private-evaluator-pack"
$jsonPath = Join-Path $pack "remaining_gate_workplan_nowrite_20260618.json"
$mdPath = Join-Path $pack "remaining_gate_workplan_nowrite_20260618.md"
$summaryPath = Join-Path $pack "remaining_gate_workplan_nowrite_probe_summary_20260618.json"
$reportPath = Join-Path $pack "remaining_gate_workplan_nowrite_probe_report_20260618.md"

$checks = New-Object System.Collections.Generic.List[object]

function Add-Check {
  param(
    [string]$Name,
    [bool]$Pass,
    [string]$Detail
  )
  $checks.Add([pscustomobject]@{
    name = $Name
    pass = $Pass
    detail = $Detail
  })
}

function Test-FalseField {
  param(
    [object]$Obj,
    [string]$Name
  )
  $value = $Obj.$Name
  Add-Check "flag_false_$Name" ($value -eq $false) "$Name=$value"
}

Add-Check "json_exists" (Test-Path $jsonPath) $jsonPath
Add-Check "markdown_exists" (Test-Path $mdPath) $mdPath

$plan = Get-Content $jsonPath -Raw | ConvertFrom-Json
$md = Get-Content $mdPath -Raw
$combined = (Get-Content $jsonPath -Raw) + "`n" + $md

Add-Check "status_exact" ($plan.status -eq "remaining_gate_workplan_ready_nowrite_not_signed_not_activated") $plan.status
Add-Check "mode_preparation_only" ($plan.mode -eq "remaining gate preparation only") $plan.mode
Add-Check "current_result_not_yet" ($plan.current_result -eq "NOT_YET_OWNER_REVIEW_REQUIRED") $plan.current_result
Add-Check "source_probe_ok" ($plan.source_evidence.owner_action_checklist_probe -eq "81_checks_0_failed") $plan.source_evidence.owner_action_checklist_probe
Add-Check "source_summary_ok" ($plan.source_evidence.owner_action_checklist_summary_success -eq $true) "summary_success=$($plan.source_evidence.owner_action_checklist_summary_success)"
Add-Check "dashboard_green_count" ($plan.dashboard_counts.green -eq 3) "green=$($plan.dashboard_counts.green)"
Add-Check "dashboard_yellow_count" ($plan.dashboard_counts.yellow -eq 12) "yellow=$($plan.dashboard_counts.yellow)"
Add-Check "dashboard_red_count" ($plan.dashboard_counts.red -eq 1) "red=$($plan.dashboard_counts.red)"
Add-Check "red_gate_owner_approval" ($plan.remaining_red_gate -eq "owner_commercial_approval") $plan.remaining_red_gate
Add-Check "workplan_goal" ($plan.workplan_goal -eq "prepare_12_yellow_gates_for_owner_review_without_activation") $plan.workplan_goal
Add-Check "yellow_gate_count" ($plan.yellow_gate_workplan.Count -eq 12) "count=$($plan.yellow_gate_workplan.Count)"
Add-Check "first_gate_terms_privacy" ($plan.yellow_gate_workplan[0].gate -eq "terms_privacy_data_readiness_candidate") $plan.yellow_gate_workplan[0].gate
Add-Check "recommended_next_action" ($plan.recommended_next_safe_action -eq "prepare_terms_privacy_data_gate_nowrite") $plan.recommended_next_safe_action

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
  Test-FalseField $plan $field
}

$requiredGates = @(
  "policy_preparation",
  "pnl_paid_beta_delta",
  "credit_refund_policy_candidate",
  "cost_cap_kill_switch_candidate",
  "support_escalation_model_candidate",
  "terms_privacy_data_readiness_candidate",
  "security_incident_readiness_candidate",
  "distribution_outreach_publication_approval_candidate",
  "fiscal_admin_readiness_candidate",
  "payment_invoice_readiness_candidate",
  "product_listino_approval_candidate",
  "production_api_key_readiness_candidate"
)
$actualGates = @($plan.yellow_gate_workplan | ForEach-Object { $_.gate })
foreach ($gate in $requiredGates) {
  Add-Check "required_gate_$gate" ($actualGates -contains $gate) $gate
}

$requiredCriteria = @(
  "human_readable_deliverable_exists",
  "machine_readable_json_exists",
  "probe_exists",
  "probe_passes_zero_errors",
  "deliverable_declares_not_live",
  "activation_flags_remain_false",
  "no_real_world_side_effects"
)
foreach ($criterion in $requiredCriteria) {
  Add-Check "required_criterion_$criterion" ($plan.gate_ready_criteria -contains $criterion) $criterion
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
  Add-Check "forbidden_action_listed_$action" ($plan.always_forbidden_actions -contains $action) $action
}

$machine = $plan.current_machine_response
Add-Check "machine_status" ($machine.status -eq "remaining_gate_workplan_ready_nowrite") $machine.status
Add-Check "machine_decision" ($machine.decision -eq "prepare_remaining_gates_only") $machine.decision
Add-Check "machine_current_result" ($machine.current_result -eq "NOT_YET_OWNER_REVIEW_REQUIRED") $machine.current_result
Add-Check "machine_activation_false" ($machine.activation_allowed -eq $false) "activation_allowed=$($machine.activation_allowed)"
Add-Check "machine_signature_false" ($machine.owner_signature_present -eq $false) "owner_signature_present=$($machine.owner_signature_present)"
Add-Check "machine_yellow_count" ($machine.yellow_gates_planned -eq 12) "yellow_gates_planned=$($machine.yellow_gates_planned)"
Add-Check "machine_paid_beta_false" ($machine.paid_beta_activation -eq $false) "paid_beta_activation=$($machine.paid_beta_activation)"
Add-Check "machine_go_live_false" ($machine.commercial_go_live -eq $false) "commercial_go_live=$($machine.commercial_go_live)"
Add-Check "machine_real_payment_false" ($machine.real_payment_executed -eq $false) "real_payment_executed=$($machine.real_payment_executed)"
Add-Check "machine_invoice_false" ($machine.invoice_issued -eq $false) "invoice_issued=$($machine.invoice_issued)"
Add-Check "machine_payment_method_false" ($machine.payment_method_collected -eq $false) "payment_method_collected=$($machine.payment_method_collected)"
Add-Check "machine_production_key_false" ($machine.production_key_issued -eq $false) "production_key_issued=$($machine.production_key_issued)"
Add-Check "machine_data_false" ($machine.real_or_personal_data_processed -eq $false) "real_or_personal_data_processed=$($machine.real_or_personal_data_processed)"
Add-Check "machine_outreach_false" ($machine.external_outreach_sent -eq $false) "external_outreach_sent=$($machine.external_outreach_sent)"
Add-Check "machine_marketplace_false" ($machine.marketplace_or_public_mcp_published -eq $false) "marketplace_or_public_mcp_published=$($machine.marketplace_or_public_mcp_published)"
Add-Check "machine_support_code" ($machine.support_code -eq "REMAINING_GATE_WORKPLAN_READY_NOWRITE") $machine.support_code
Add-Check "machine_next_terms_gate" ($machine.next_allowed_actions -contains "prepare_terms_privacy_data_gate_nowrite") ($machine.next_allowed_actions -join ", ")

$requiredMarkdown = @(
  "Remaining gate workplan NoWrite",
  "non firmato, non attivato",
  "12 gate gialli",
  "Regola base",
  "Piano dei 12 gate gialli",
  "Ordine consigliato",
  "Criteri per considerare un gate pronto alla review",
  "Cosa resta vietato durante questo workplan",
  "terms_privacy_data_gate_nowrite"
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
  '"owner_signature_present": true',
  '"paid_beta_activation": true',
  '"commercial_go_live": true',
  '"real_payment_executed": true',
  '"invoice_issued": true',
  '"production_key_issued": true',
  '"commercial_go_live": "go"',
  '"paid_beta_activation": "go"',
  "approvato dal proprietario",
  "firma del proprietario presente",
  "beta a pagamento attiva",
  "go-live commerciale attivo"
)
foreach ($pattern in $forbiddenPatterns) {
  Add-Check "forbidden_pattern_absent_$pattern" (-not $combined.Contains($pattern)) $pattern
}

$failed = @($checks | Where-Object { -not $_.pass })
$passed = @($checks | Where-Object { $_.pass })
$success = ($failed.Count -eq 0)

$summary = [pscustomobject]@{
  probe = "remaining_gate_workplan_nowrite_probe_20260618"
  success = $success
  passed = $passed.Count
  failed = $failed.Count
  current_result = $plan.current_result
  activation_allowed = $plan.activation_allowed
  owner_signature_present = $plan.owner_signature_present
  yellow_gates_planned = $plan.yellow_gate_workplan.Count
  next_safe_action = $plan.recommended_next_safe_action
  support_code = $machine.support_code
}
$summary | ConvertTo-Json -Depth 8 | Set-Content -Path $summaryPath -Encoding UTF8

$report = @()
$report += "# Remaining gate workplan NoWrite probe report"
$report += ""
$report += "Data: 2026-06-18"
$report += ""
$report += "Success: $success"
$report += "Passed: $($passed.Count)"
$report += "Failed: $($failed.Count)"
$report += "Current result: $($plan.current_result)"
$report += "Activation allowed: $($plan.activation_allowed)"
$report += "Owner signature present: $($plan.owner_signature_present)"
$report += "Yellow gates planned: $($plan.yellow_gate_workplan.Count)"
$report += "Next safe action: $($plan.recommended_next_safe_action)"
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
  throw "Remaining gate workplan NoWrite probe failed with $($failed.Count) failed checks."
}

Write-Output ($summary | ConvertTo-Json -Depth 8)
