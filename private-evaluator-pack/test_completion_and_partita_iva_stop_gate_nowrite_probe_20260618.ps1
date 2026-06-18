$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$pack = Join-Path $root "private-evaluator-pack"
$jsonPath = Join-Path $pack "test_completion_and_partita_iva_stop_gate_nowrite_20260618.json"
$mdPath = Join-Path $pack "test_completion_and_partita_iva_stop_gate_nowrite_20260618.md"
$summaryPath = Join-Path $pack "test_completion_and_partita_iva_stop_gate_nowrite_probe_summary_20260618.json"
$reportPath = Join-Path $pack "test_completion_and_partita_iva_stop_gate_nowrite_probe_report_20260618.md"

$sourcePaths = @{
  testPhase = Join-Path $pack "test_phase_completion_gate_nowrite_probe_summary_20260614.json"
  fiscal = Join-Path $pack "fiscal_admin_readiness_probe_summary_20260618.json"
  payment = Join-Path $pack "payment_invoice_readiness_probe_summary_20260618.json"
  finalOwner = Join-Path $pack "final_owner_go_no_go_summary_nowrite_probe_summary_20260618.json"
  hold = Join-Path $pack "post_hold_status_report_nowrite_probe_summary_20260618.json"
}

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

function Add-TrueFlagCheck {
  param([object]$Obj, [string]$Field)
  $value = $Obj.$Field
  Add-Check "flag_true_$Field" ($value -eq $true) "$Field=$value"
}

Add-Check "json_exists" (Test-Path $jsonPath) $jsonPath
Add-Check "markdown_exists" (Test-Path $mdPath) $mdPath
foreach ($key in $sourcePaths.Keys) {
  Add-Check "source_exists_$key" (Test-Path $sourcePaths[$key]) $sourcePaths[$key]
}

$json = Get-Content $jsonPath -Raw | ConvertFrom-Json
$md = Get-Content $mdPath -Raw
$combined = (Get-Content $jsonPath -Raw) + "`n" + $md
$testPhase = Get-Content $sourcePaths.testPhase -Raw | ConvertFrom-Json
$fiscal = Get-Content $sourcePaths.fiscal -Raw | ConvertFrom-Json
$payment = Get-Content $sourcePaths.payment -Raw | ConvertFrom-Json
$finalOwner = Get-Content $sourcePaths.finalOwner -Raw | ConvertFrom-Json
$hold = Get-Content $sourcePaths.hold -Raw | ConvertFrom-Json

Add-Check "source_test_phase_zero_errors" ($testPhase.errors.Count -eq 0) "errors=$($testPhase.errors.Count)"
Add-Check "source_test_phase_195_checks" (($testPhase.checks | Measure-Object).Count -ge 30) "checks=$((($testPhase.checks | Measure-Object).Count))"
Add-Check "source_fiscal_superato" ($fiscal.status -eq "SUPERATO" -and $fiscal.passed -eq 99 -and $fiscal.failed.Count -eq 0) "fiscal=$($fiscal.status) passed=$($fiscal.passed)"
Add-Check "source_payment_superato" ($payment.status -eq "SUPERATO" -and $payment.passed -eq 123 -and $payment.failed.Count -eq 0) "payment=$($payment.status) passed=$($payment.passed)"
Add-Check "source_final_no_go" ($finalOwner.success -eq $true -and $finalOwner.decision -eq "NO_GO_FOR_ACTIVATION" -and $finalOwner.activation_allowed -eq $false) "decision=$($finalOwner.decision)"
Add-Check "source_hold_active" ($hold.success -eq $true -and $hold.decision -eq "HOLD_UNTIL_EXPLICIT_OWNER_REQUEST" -and $hold.activation_allowed -eq $false) "decision=$($hold.decision)"

Add-Check "status_exact" ($json.status -eq "test_completion_and_partita_iva_stop_gate_ready_nowrite_not_signed_not_activated") $json.status
Add-Check "mode_stop_gate_only" ($json.mode -eq "test completion and fiscal stop gate only") $json.mode
Add-Check "current_result_not_yet" ($json.current_result -eq "NOT_YET_OWNER_REVIEW_REQUIRED") $json.current_result
Add-Check "decision_continue_tests_then_stop" ($json.decision -eq "CONTINUE_TESTS_UNTIL_COMMERCIAL_TRIGGER_THEN_STOP_FOR_FISCAL_PATH") $json.decision
Add-Check "commercial_not_live" ($json.commercial_status -eq "not_live") $json.commercial_status
Add-Check "partita_iva_not_required_for_tests" ($json.partita_iva_required_now_for_tests -eq $false) "partita_iva_required_now_for_tests=$($json.partita_iva_required_now_for_tests)"
Add-Check "fiscal_path_not_decided" ($json.fiscal_path_decided -eq $false) "fiscal_path_decided=$($json.fiscal_path_decided)"
Add-Check "allowed_tests_count" ($json.tests_allowed_without_partita_iva.Count -eq 8) "count=$($json.tests_allowed_without_partita_iva.Count)"
Add-Check "commercial_trigger_count" ($json.commercial_triggers_requiring_stop_before_proceeding.Count -eq 12) "count=$($json.commercial_triggers_requiring_stop_before_proceeding.Count)"
Add-Check "recommended_next_safe" ($json.recommended_next_safe_action -eq "complete_remaining_internal_tests_and_stop_before_paid_beta_or_payment") $json.recommended_next_safe_action

$trueFields = @(
  "must_stop_before_paid_beta",
  "must_stop_before_real_payment",
  "must_stop_before_invoice",
  "must_stop_before_payment_method_collection",
  "must_stop_before_real_customer_onboarding",
  "must_stop_before_public_commercial_offer",
  "must_stop_before_external_commercial_outreach"
)
foreach ($field in $trueFields) {
  Add-TrueFlagCheck $json $field
}

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

$requiredAllowedTests = @(
  "internal_technical_tests",
  "nowrite_probes",
  "synthetic_data_simulations",
  "document_review",
  "site_api_improvements_without_real_checkout",
  "internal_business_plan_updates",
  "partner_shareholder_reports_without_live_offer",
  "draft_policy_price_list_pnl_preparation"
)
foreach ($item in $requiredAllowedTests) {
  Add-Check "allowed_test_$item" ($json.tests_allowed_without_partita_iva -contains $item) $item
}

$requiredTriggers = @(
  "publish_active_prices",
  "open_real_checkout",
  "collect_card_or_payment_method",
  "collect_any_real_money",
  "issue_invoice",
  "activate_real_subscription",
  "sign_paid_beta_contract",
  "deliver_production_api_key_to_real_customer",
  "onboard_real_customer",
  "claim_service_is_commercially_available",
  "send_external_commercial_outreach",
  "process_real_or_personal_customer_data"
)
foreach ($item in $requiredTriggers) {
  Add-Check "commercial_trigger_$item" ($json.commercial_triggers_requiring_stop_before_proceeding -contains $item) $item
}

$machine = $json.current_machine_response
Add-Check "machine_status" ($machine.status -eq "test_completion_and_partita_iva_stop_gate_ready_nowrite") $machine.status
Add-Check "machine_decision" ($machine.decision -eq "CONTINUE_TESTS_UNTIL_COMMERCIAL_TRIGGER_THEN_STOP_FOR_FISCAL_PATH") $machine.decision
Add-Check "machine_current_result" ($machine.current_result -eq "NOT_YET_OWNER_REVIEW_REQUIRED") $machine.current_result
Add-Check "machine_commercial_not_live" ($machine.commercial_status -eq "not_live") $machine.commercial_status
Add-Check "machine_partita_iva_not_now" ($machine.partita_iva_required_now_for_tests -eq $false) "required=$($machine.partita_iva_required_now_for_tests)"
Add-Check "machine_stop_paid_beta" ($machine.must_stop_before_paid_beta -eq $true) "stop=$($machine.must_stop_before_paid_beta)"
Add-Check "machine_stop_payment" ($machine.must_stop_before_real_payment -eq $true) "stop=$($machine.must_stop_before_real_payment)"
Add-Check "machine_fiscal_path_not_decided" ($machine.fiscal_path_decided -eq $false) "fiscal=$($machine.fiscal_path_decided)"
Add-Check "machine_next_safe" ($machine.next_safe_action -eq "complete_remaining_internal_tests_and_stop_before_paid_beta_or_payment") $machine.next_safe_action
Add-Check "machine_support_code" ($machine.support_code -eq "TEST_COMPLETION_PARTITA_IVA_STOP_GATE_READY_NOWRITE") $machine.support_code

$machineFalseFields = @(
  "activation_allowed",
  "owner_signature_present",
  "real_payment_allowed",
  "invoice_allowed",
  "payment_method_collection_allowed",
  "production_key_issuance_allowed",
  "real_customer_data_allowed",
  "external_outreach_allowed"
)
foreach ($field in $machineFalseFields) {
  Add-FalseFlagCheck $machine $field
}

$requiredMarkdown = @(
  "Test completion and partita IVA stop gate NoWrite",
  "Stop obbligatorio prima della partita IVA",
  "Finche' facciamo test: possiamo continuare",
  "Prima di vendere: stop",
  "prima della beta a pagamento o di qualunque pagamento reale",
  "Test ancora consentiti senza partita IVA",
  "complete_remaining_internal_tests_and_stop_before_paid_beta_or_payment"
)
foreach ($phrase in $requiredMarkdown) {
  Add-Check "markdown_contains_$phrase" ($md.Contains($phrase)) $phrase
}

$forbiddenPatterns = @(
  '"partita_iva_required_now_for_tests": true',
  '"activation_allowed": true',
  '"paid_beta_activation_allowed": true',
  '"commercial_go_live_allowed": true',
  '"real_payment_allowed": true',
  '"invoice_allowed": true',
  '"payment_method_collection_allowed": true',
  '"production_key_issuance_allowed": true',
  '"real_customer_data_allowed": true',
  '"external_outreach_allowed": true',
  '"must_stop_before_paid_beta": false',
  '"must_stop_before_real_payment": false',
  '"must_stop_before_invoice": false',
  "puoi vendere senza partita iva",
  "incassa prima e apri dopo",
  "go-live commerciale approvato"
)
foreach ($pattern in $forbiddenPatterns) {
  Add-Check "forbidden_pattern_absent_$pattern" (-not $combined.Contains($pattern)) $pattern
}

$failed = @($checks | Where-Object { -not $_.pass })
$passed = @($checks | Where-Object { $_.pass })
$success = ($failed.Count -eq 0)

$summary = [pscustomobject]@{
  probe = "test_completion_and_partita_iva_stop_gate_nowrite_probe_20260618"
  success = $success
  passed = $passed.Count
  failed = $failed.Count
  current_result = $json.current_result
  decision = $json.decision
  commercial_status = $json.commercial_status
  partita_iva_required_now_for_tests = $json.partita_iva_required_now_for_tests
  must_stop_before_paid_beta = $json.must_stop_before_paid_beta
  must_stop_before_real_payment = $json.must_stop_before_real_payment
  fiscal_path_decided = $json.fiscal_path_decided
  activation_allowed = $json.activation_allowed
  next_safe_action = $json.recommended_next_safe_action
  support_code = $machine.support_code
}
$summary | ConvertTo-Json -Depth 8 | Set-Content -Path $summaryPath -Encoding UTF8

$report = @()
$report += "# Test completion and partita IVA stop gate NoWrite probe report"
$report += ""
$report += "Data: 2026-06-18"
$report += ""
$report += "Success: $success"
$report += "Passed: $($passed.Count)"
$report += "Failed: $($failed.Count)"
$report += "Current result: $($json.current_result)"
$report += "Decision: $($json.decision)"
$report += "Partita IVA required now for tests: $($json.partita_iva_required_now_for_tests)"
$report += "Must stop before paid beta: $($json.must_stop_before_paid_beta)"
$report += "Must stop before real payment: $($json.must_stop_before_real_payment)"
$report += "Activation allowed: $($json.activation_allowed)"
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
  throw "Test completion and partita IVA stop gate NoWrite probe failed with $($failed.Count) failed checks."
}

Write-Output ($summary | ConvertTo-Json -Depth 8)
