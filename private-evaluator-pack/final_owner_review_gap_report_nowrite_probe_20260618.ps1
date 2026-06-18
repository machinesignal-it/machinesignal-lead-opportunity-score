$ErrorActionPreference = "Stop"

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$pack = Join-Path $root "private-evaluator-pack"
$jsonPath = Join-Path $pack "final_owner_review_gap_report_nowrite_20260618.json"
$mdPath = Join-Path $pack "final_owner_review_gap_report_nowrite_20260618.md"
$checklistPath = Join-Path $pack "owner_decision_checklist_nowrite_20260618.json"
$checklistProbePath = Join-Path $pack "owner_decision_checklist_nowrite_probe_summary_20260618.json"
$dashboardPath = Join-Path $pack "owner_decision_dashboard_20260618.json"
$reportPath = Join-Path $pack "final_owner_review_gap_report_nowrite_probe_report_20260618.md"
$summaryPath = Join-Path $pack "final_owner_review_gap_report_nowrite_probe_summary_20260618.json"

$json = Get-Content -LiteralPath $jsonPath -Raw | ConvertFrom-Json
$md = Get-Content -LiteralPath $mdPath -Raw
$checklist = Get-Content -LiteralPath $checklistPath -Raw | ConvertFrom-Json
$checklistProbe = Get-Content -LiteralPath $checklistProbePath -Raw | ConvertFrom-Json
$dashboard = Get-Content -LiteralPath $dashboardPath -Raw | ConvertFrom-Json

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

Add-Check "status_is_gap_report_draft" ($json.status -eq "draft_nowrite_gap_report_not_signed_not_activated") "status=$($json.status)"
Add-Check "not_owner_approval" (($json.is_approval -eq $false) -and ($json.is_owner_signature -eq $false)) "is_approval=$($json.is_approval); is_owner_signature=$($json.is_owner_signature)"
Add-Check "activation_flags_false" (($json.activation_allowed -eq $false) -and ($json.paid_beta_activation_allowed -eq $false) -and ($json.commercial_go_live_allowed -eq $false)) "activation flags are false"
Add-Check "money_flags_false" (($json.real_payment_allowed -eq $false) -and ($json.invoice_allowed -eq $false) -and ($json.payment_method_collection_allowed -eq $false)) "money flags are false"
Add-Check "data_and_distribution_flags_false" (($json.production_key_issuance_allowed -eq $false) -and ($json.real_customer_data_allowed -eq $false) -and ($json.personal_data_allowed -eq $false) -and ($json.external_outreach_allowed -eq $false) -and ($json.marketplace_publication_allowed -eq $false) -and ($json.hosted_public_mcp_allowed -eq $false) -and ($json.mcp_registry_publication_allowed -eq $false)) "data/distribution flags are false"
Add-Check "dashboard_counts_3_12_1" (($json.current_dashboard_counts.green -eq 3) -and ($json.current_dashboard_counts.yellow -eq 12) -and ($json.current_dashboard_counts.red -eq 1)) "counts=$($json.current_dashboard_counts.green)/$($json.current_dashboard_counts.yellow)/$($json.current_dashboard_counts.red)"
Add-Check "current_result_not_yet" ($json.current_result -eq "NOT_YET_OWNER_REVIEW_REQUIRED") "current_result=$($json.current_result)"
Add-Check "red_gate_owner_approval" ($json.remaining_red_gate -eq "owner_commercial_approval") "remaining_red_gate=$($json.remaining_red_gate)"
Add-Check "final_decision_no_go" (($json.final_decision_now.paid_beta_activation -eq "no_go") -and ($json.final_decision_now.commercial_go_live -eq "no_go")) "final decision remains no_go"

$requiredGapIds = @(
  "owner_signature_final_decision",
  "fiscal_admin",
  "payment_invoice",
  "terms_privacy_data",
  "product_listino_credits",
  "production_api_access",
  "cost_security_support",
  "distribution"
)
foreach ($gapId in $requiredGapIds) {
  Add-Check "gap_group_$gapId" (@($json.gap_groups | Where-Object { $_.id -eq $gapId }).Count -eq 1) "gap group present"
}

$allowedActions = @($json.decision_table | Where-Object { $_.decision -eq "allowed" } | ForEach-Object { $_.action })
$blockedActions = @($json.decision_table | Where-Object { $_.decision -eq "blocked" } | ForEach-Object { $_.action })
Add-Check "allowed_actions_are_safe" ((@("continue_nowrite_preparation", "prepare_owner_review") | Where-Object { $allowedActions -notcontains $_ }).Count -eq 0 -and $allowedActions.Count -eq 2) "allowed=$($allowedActions -join ',')"
$hardBlocked = @(
  "activate_paid_beta",
  "execute_real_payment",
  "issue_invoice",
  "collect_payment_method",
  "issue_production_api_key",
  "process_real_customer_dataset",
  "process_personal_data",
  "send_external_outreach",
  "publish_marketplace_listing",
  "launch_hosted_public_mcp",
  "submit_mcp_registry"
)
foreach ($action in $hardBlocked) {
  Add-Check "blocked_$action" ($blockedActions -contains $action) "blocked action present"
}

$machine = $json.current_machine_response
Add-Check "machine_status_final_not_ready" ($machine.status -eq "final_owner_review_not_ready") "status=$($machine.status)"
Add-Check "machine_support_code" ($machine.support_code -eq "FINAL_OWNER_REVIEW_NOT_READY") "support_code=$($machine.support_code)"
Add-Check "machine_credits_zero" ($machine.credits_consumed -eq 0) "credits=$($machine.credits_consumed)"
Add-Check "machine_flags_false" (($machine.paid_beta_activation -eq $false) -and ($machine.commercial_go_live -eq $false) -and ($machine.real_payment_executed -eq $false) -and ($machine.invoice_issued -eq $false) -and ($machine.payment_method_collected -eq $false) -and ($machine.production_key_issued -eq $false) -and ($machine.real_or_personal_data_processed -eq $false) -and ($machine.external_outreach_sent -eq $false)) "machine flags are false"

$requiredMdPhrases = @(
  "Non è una approvazione",
  "NOT_YET_OWNER_REVIEW_REQUIRED",
  "3 verdi, 12 gialli, 1 rosso",
  "Cosa manca",
  "Cosa si può fare ora",
  "Cosa resta bloccato",
  "Risposta macchina corrente"
)
foreach ($phrase in $requiredMdPhrases) {
  Add-Check "md_contains_$($phrase.Replace(' ', '_'))" ($md.Contains($phrase)) "phrase=$phrase"
}

$unsafePhrases = @(
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
  "paid beta approved",
  "commercial go-live approved",
  "payment approved",
  "invoice approved",
  "production key approved",
  "beta a pagamento approvata",
  "go-live commerciale approvato",
  "pagamento approvato",
  "fattura approvata",
  "chiave di produzione approvata"
)
foreach ($phrase in $unsafePhrases) {
  Add-Check "unsafe_absent_$($phrase.Replace(' ', '_'))" ((-not $md.Contains($phrase)) -and (-not (Get-Content -LiteralPath $jsonPath -Raw).Contains($phrase))) "unsafe phrase absent"
}

Add-Check "source_checklist_current_result" ($checklist.current_result -eq "NOT_YET_OWNER_REVIEW_REQUIRED") "source checklist result=$($checklist.current_result)"
Add-Check "source_checklist_activation_false" ($checklist.activation_allowed -eq $false) "source checklist activation=$($checklist.activation_allowed)"
Add-Check "source_checklist_probe_passed" (($checklistProbe.passed -eq $true) -or ($checklistProbe.success -eq $true) -or ($checklistProbe.failed -eq 0)) "source checklist probe indicates pass"
Add-Check "source_dashboard_no_go" (($dashboard.final_decision.paid_beta_activation -eq "no_go") -and ($dashboard.final_decision.commercial_go_live -eq "no_go")) "source dashboard no_go"
Add-Check "source_dashboard_counts" (($dashboard.gate_counts.green -eq 3) -and ($dashboard.gate_counts.yellow -eq 12) -and ($dashboard.gate_counts.red -eq 1)) "source dashboard counts=$($dashboard.gate_counts.green)/$($dashboard.gate_counts.yellow)/$($dashboard.gate_counts.red)"

$passed = @($checks | Where-Object { $_.passed }).Count
$failedChecks = @($checks | Where-Object { -not $_.passed })
$failed = $failedChecks.Count

$lines = New-Object System.Collections.Generic.List[string]
$lines.Add("# Final owner review gap report NoWrite probe") | Out-Null
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
  document = "final_owner_review_gap_report_nowrite_probe_summary"
  date = "2026-06-18"
  target = "final_owner_review_gap_report_nowrite_20260618"
  passed = $passed
  failed = $failed
  success = ($failed -eq 0)
  current_result = $json.current_result
  remaining_red_gate = $json.remaining_red_gate
  activation_allowed = $json.activation_allowed
  paid_beta_activation_allowed = $json.paid_beta_activation_allowed
  commercial_go_live_allowed = $json.commercial_go_live_allowed
  next_safe_action = $json.recommended_next_safe_action
  failed_checks = @($failedChecks | ForEach-Object { $_.name })
}
$summary | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $summaryPath -Encoding UTF8

if ($failed -gt 0) {
  throw "Final owner review gap report probe failed: $failed checks failed. See $reportPath"
}

Write-Host "Final owner review gap report probe passed: $passed checks, 0 failed."
