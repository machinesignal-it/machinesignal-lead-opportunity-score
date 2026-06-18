$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$pack = Join-Path $root "private-evaluator-pack"
$jsonPath = Join-Path $pack "post_hold_status_report_nowrite_20260618.json"
$mdPath = Join-Path $pack "post_hold_status_report_nowrite_20260618.md"
$sourceSummaryPath = Join-Path $pack "post_final_owner_summary_hold_checkpoint_nowrite_probe_summary_20260618.json"
$summaryPath = Join-Path $pack "post_hold_status_report_nowrite_probe_summary_20260618.json"
$reportPath = Join-Path $pack "post_hold_status_report_nowrite_probe_report_20260618.md"

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
Add-Check "source_hold_summary_exists" (Test-Path $sourceSummaryPath) $sourceSummaryPath

$json = Get-Content $jsonPath -Raw | ConvertFrom-Json
$md = Get-Content $mdPath -Raw
$sourceSummary = Get-Content $sourceSummaryPath -Raw | ConvertFrom-Json
$combined = (Get-Content $jsonPath -Raw) + "`n" + $md

Add-Check "source_probe_success" ($sourceSummary.success -eq $true) "source success=$($sourceSummary.success)"
Add-Check "source_probe_112_passed" ($sourceSummary.passed -eq 112) "source passed=$($sourceSummary.passed)"
Add-Check "source_probe_zero_failed" ($sourceSummary.failed -eq 0) "source failed=$($sourceSummary.failed)"
Add-Check "source_decision_hold" ($sourceSummary.decision -eq "HOLD_UNTIL_EXPLICIT_OWNER_REQUEST") $sourceSummary.decision
Add-Check "source_current_result_not_yet" ($sourceSummary.current_result -eq "NOT_YET_OWNER_REVIEW_REQUIRED") $sourceSummary.current_result
Add-Check "source_signature_record_not_allowed" ($sourceSummary.owner_signature_record_allowed -eq $false) "signature_record_allowed=$($sourceSummary.owner_signature_record_allowed)"

Add-Check "status_exact" ($json.status -eq "post_hold_status_report_ready_nowrite_not_signed_not_activated") $json.status
Add-Check "mode_status_only" ($json.mode -eq "status report only") $json.mode
Add-Check "current_result_not_yet" ($json.current_result -eq "NOT_YET_OWNER_REVIEW_REQUIRED") $json.current_result
Add-Check "decision_hold" ($json.decision -eq "HOLD_UNTIL_EXPLICIT_OWNER_REQUEST") $json.decision
Add-Check "prior_decision_no_go" ($json.prior_decision -eq "NO_GO_FOR_ACTIVATION") $json.prior_decision
Add-Check "explicit_false" ($json.explicit_owner_request_present -eq $false) "explicit=$($json.explicit_owner_request_present)"
Add-Check "selected_null" ($null -eq $json.selected_option) "selected=$($json.selected_option)"
Add-Check "source_probe_recorded" ($json.source_evidence.hold_checkpoint_probe -eq "112_checks_0_failed") $json.source_evidence.hold_checkpoint_probe
Add-Check "source_next_wait" ($json.source_evidence.hold_checkpoint_next_safe_action -eq "wait_for_explicit_owner_request_or_report_status") $json.source_evidence.hold_checkpoint_next_safe_action
Add-Check "allowed_count" ($json.allowed_now.Count -eq 5) "count=$($json.allowed_now.Count)"
Add-Check "blocked_count" ($json.blocked_now.Count -eq 12) "count=$($json.blocked_now.Count)"
Add-Check "next_report_or_wait" ($json.recommended_next_safe_action -eq "report_status_or_wait_for_explicit_owner_request") $json.recommended_next_safe_action

$falseFields = @(
  "is_approval",
  "is_owner_signature",
  "owner_signature_present",
  "owner_signature_record_allowed",
  "activation_record_allowed",
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

$requiredAllowed = @(
  "read_status",
  "report_status",
  "verify_blocks_still_active",
  "fix_internal_document_errors",
  "prepare_noncommercial_summaries"
)
foreach ($item in $requiredAllowed) {
  Add-Check "allowed_item_$item" ($json.allowed_now -contains $item) $item
}

$requiredBlocked = @(
  "prepare_owner_signature_record",
  "prepare_activation_record",
  "select_future_option",
  "change_decision_from_no_go_or_hold",
  "activate_paid_beta",
  "commercial_go_live",
  "collect_payment_or_payment_method",
  "issue_invoice",
  "issue_production_api_key",
  "process_real_or_personal_data",
  "send_external_outreach",
  "publish_marketplace_or_public_mcp"
)
foreach ($item in $requiredBlocked) {
  Add-Check "blocked_item_$item" ($json.blocked_now -contains $item) $item
}

$machine = $json.current_machine_response
Add-Check "machine_status" ($machine.status -eq "post_hold_status_report_ready_nowrite") $machine.status
Add-Check "machine_decision_hold" ($machine.decision -eq "HOLD_UNTIL_EXPLICIT_OWNER_REQUEST") $machine.decision
Add-Check "machine_current_result" ($machine.current_result -eq "NOT_YET_OWNER_REVIEW_REQUIRED") $machine.current_result
Add-Check "machine_source_probe" ($machine.source_hold_checkpoint_probe -eq "112_checks_0_failed") $machine.source_hold_checkpoint_probe
Add-Check "machine_explicit_false" ($machine.explicit_owner_request_present -eq $false) "explicit=$($machine.explicit_owner_request_present)"
Add-Check "machine_selected_null" ($null -eq $machine.selected_option) "selected=$($machine.selected_option)"
Add-Check "machine_next_report_or_wait" ($machine.next_safe_action -eq "report_status_or_wait_for_explicit_owner_request") $machine.next_safe_action
Add-Check "machine_support_code" ($machine.support_code -eq "POST_HOLD_STATUS_REPORT_READY_NOWRITE") $machine.support_code

$machineFalseFields = @(
  "activation_allowed",
  "owner_signature_present",
  "owner_signature_record_allowed",
  "activation_record_allowed",
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
  "Post-hold status report NoWrite",
  "non firmato, non approvato, non attivato",
  "HOLD_UNTIL_EXPLICIT_OWNER_REQUEST",
  "senza richiesta esplicita",
  "Cosa possono fare gli agenti adesso",
  "Gli agenti non possono",
  "report_status_or_wait_for_explicit_owner_request"
)
foreach ($phrase in $requiredMarkdown) {
  Add-Check "markdown_contains_$phrase" ($md.Contains($phrase)) $phrase
}

$forbiddenPatterns = @(
  '"activation_allowed": true',
  '"owner_signature_present": true',
  '"owner_signature_record_allowed": true',
  '"activation_record_allowed": true',
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
  '"explicit_owner_request_present": true',
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
  probe = "post_hold_status_report_nowrite_probe_20260618"
  success = $success
  passed = $passed.Count
  failed = $failed.Count
  current_result = $json.current_result
  decision = $json.decision
  explicit_owner_request_present = $json.explicit_owner_request_present
  selected_option = $json.selected_option
  activation_allowed = $json.activation_allowed
  owner_signature_record_allowed = $json.owner_signature_record_allowed
  next_safe_action = $json.recommended_next_safe_action
  support_code = $machine.support_code
}
$summary | ConvertTo-Json -Depth 8 | Set-Content -Path $summaryPath -Encoding UTF8

$report = @()
$report += "# Post-hold status report NoWrite probe report"
$report += ""
$report += "Data: 2026-06-18"
$report += ""
$report += "Success: $success"
$report += "Passed: $($passed.Count)"
$report += "Failed: $($failed.Count)"
$report += "Current result: $($json.current_result)"
$report += "Decision: $($json.decision)"
$report += "Explicit owner request present: $($json.explicit_owner_request_present)"
$report += "Activation allowed: $($json.activation_allowed)"
$report += "Owner signature record allowed: $($json.owner_signature_record_allowed)"
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
  throw "Post-hold status report NoWrite probe failed with $($failed.Count) failed checks."
}

Write-Output ($summary | ConvertTo-Json -Depth 8)
