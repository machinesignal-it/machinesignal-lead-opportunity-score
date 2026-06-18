$ErrorActionPreference = "Stop"

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$pack = Join-Path $root "private-evaluator-pack"
$jsonPath = Join-Path $pack "owner_action_checklist_nowrite_20260618.json"
$mdPath = Join-Path $pack "owner_action_checklist_nowrite_20260618.md"
$ownerSummaryPath = Join-Path $pack "owner_summary_nowrite_probe_summary_20260618.json"
$reportPath = Join-Path $pack "owner_action_checklist_nowrite_probe_report_20260618.md"
$summaryPath = Join-Path $pack "owner_action_checklist_nowrite_probe_summary_20260618.json"

$jsonRaw = Get-Content -LiteralPath $jsonPath -Raw
$md = Get-Content -LiteralPath $mdPath -Raw
$json = $jsonRaw | ConvertFrom-Json
$ownerSummary = Get-Content -LiteralPath $ownerSummaryPath -Raw | ConvertFrom-Json

$checks = New-Object System.Collections.Generic.List[object]

function Add-Check {
  param([string]$Name, [bool]$Passed, [string]$Details)
  $script:checks.Add([pscustomobject]@{ name = $Name; passed = $Passed; details = $Details }) | Out-Null
}

Add-Check "status_is_action_checklist" ($json.status -eq "owner_action_checklist_ready_nowrite_not_signed_not_activated") "status=$($json.status)"
Add-Check "not_approval_not_signature" (($json.is_approval -eq $false) -and ($json.is_owner_signature -eq $false) -and ($json.owner_signature_present -eq $false)) "approval/signature false"
Add-Check "activation_flags_false" (($json.activation_allowed -eq $false) -and ($json.paid_beta_activation_allowed -eq $false) -and ($json.commercial_go_live_allowed -eq $false)) "activation flags false"
Add-Check "money_flags_false" (($json.real_payment_allowed -eq $false) -and ($json.invoice_allowed -eq $false) -and ($json.payment_method_collection_allowed -eq $false)) "money flags false"
Add-Check "production_data_distribution_flags_false" (($json.production_key_issuance_allowed -eq $false) -and ($json.real_customer_data_allowed -eq $false) -and ($json.personal_data_allowed -eq $false) -and ($json.external_outreach_allowed -eq $false) -and ($json.marketplace_publication_allowed -eq $false) -and ($json.hosted_public_mcp_allowed -eq $false) -and ($json.mcp_registry_publication_allowed -eq $false)) "production/data/distribution flags false"
Add-Check "current_result_not_yet" ($json.current_result -eq "NOT_YET_OWNER_REVIEW_REQUIRED") "current_result=$($json.current_result)"
Add-Check "source_owner_summary_probe" ($json.source_evidence.owner_summary_probe -eq "82_checks_0_failed") "source=$($json.source_evidence.owner_summary_probe)"
Add-Check "owner_summary_success" (($ownerSummary.success -eq $true) -and ($ownerSummary.failed -eq 0) -and ($ownerSummary.current_result -eq "NOT_YET_OWNER_REVIEW_REQUIRED")) "owner summary success=$($ownerSummary.success)"
Add-Check "dashboard_counts_3_12_1" (($json.dashboard_counts.green -eq 3) -and ($json.dashboard_counts.yellow -eq 12) -and ($json.dashboard_counts.red -eq 1)) "counts=$($json.dashboard_counts.green)/$($json.dashboard_counts.yellow)/$($json.dashboard_counts.red)"
Add-Check "choice_values_limited" ((@($json.allowed_choice_values) -contains "APPROVA_PREPARAZIONE") -and (@($json.allowed_choice_values) -contains "RINVIA") -and (@($json.allowed_choice_values) -contains "RICHIEDI_MODIFICA") -and (@($json.allowed_choice_values) -contains "BLOCCA") -and (@($json.allowed_choice_values).Count -eq 4)) "choice values limited"
Add-Check "ten_checklist_items" (@($json.checklist_items).Count -eq 10) "items=$(@($json.checklist_items).Count)"

$requiredAreas = @(
  "owner_approval",
  "fiscal_admin",
  "payment_invoice",
  "privacy_data",
  "product_listino_credits",
  "production_api_keys",
  "cost_cap_kill_switch",
  "support_escalation",
  "security_incident",
  "distribution"
)
foreach ($area in $requiredAreas) {
  Add-Check "checklist_area_$area" (@($json.checklist_items | Where-Object { $_.area -eq $area }).Count -eq 1) "area present"
}

foreach ($item in $json.checklist_items) {
  Add-Check "item_$($item.id)_maximum_effect_safe" ($item.maximum_effect -notmatch "activation|payment|invoice|production_key|go_live") "effect=$($item.maximum_effect)"
}

Add-Check "recommended_choices_safe" (($json.recommended_owner_choices_now.items_2_to_10 -eq "APPROVA_PREPARAZIONE") -and ($json.recommended_owner_choices_now.item_1 -eq "RINVIA_UNTIL_ALL_OTHER_GATES_ARE_READY")) "recommended choices safe"

$requiredForbidden = @(
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
foreach ($item in $requiredForbidden) {
  Add-Check "forbidden_action_$item" (@($json.always_forbidden_actions) -contains $item) "forbidden action present"
}

$machine = $json.current_machine_response
Add-Check "machine_status" ($machine.status -eq "owner_action_checklist_ready_nowrite") "status=$($machine.status)"
Add-Check "machine_decision_not_activation" ($machine.decision -eq "checklist_ready_not_signed_not_activation") "decision=$($machine.decision)"
Add-Check "machine_current_result" ($machine.current_result -eq "NOT_YET_OWNER_REVIEW_REQUIRED") "result=$($machine.current_result)"
Add-Check "machine_activation_signature_false" (($machine.activation_allowed -eq $false) -and ($machine.owner_signature_present -eq $false)) "activation/signature false"
Add-Check "machine_flags_false" (($machine.paid_beta_activation -eq $false) -and ($machine.commercial_go_live -eq $false) -and ($machine.real_payment_executed -eq $false) -and ($machine.invoice_issued -eq $false) -and ($machine.payment_method_collected -eq $false) -and ($machine.production_key_issued -eq $false) -and ($machine.real_or_personal_data_processed -eq $false) -and ($machine.external_outreach_sent -eq $false) -and ($machine.marketplace_or_public_mcp_published -eq $false)) "machine flags false"
Add-Check "machine_support_code" ($machine.support_code -eq "OWNER_ACTION_CHECKLIST_READY_NOWRITE") "support=$($machine.support_code)"
Add-Check "next_safe_action_remaining_gate_workplan" ($json.recommended_next_safe_action -eq "prepare_remaining_gate_workplan_nowrite") "next=$($json.recommended_next_safe_action)"

$requiredMdPhrases = @(
  "Owner action checklist NoWrite",
  "non firmata, non attivata",
  "Nessuna scelta in questa checklist attiva vendite o incassi.",
  "Checklist decisionale",
  "Decisione raccomandata dagli agenti",
  "Azioni vietate anche se una riga viene approvata",
  "Risposta macchina corrente",
  "remaining_gate_workplan_nowrite"
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
  '"owner_signature_present": true',
  '"paid_beta_activation": true',
  '"commercial_go_live": true',
  '"real_payment_executed": true',
  '"invoice_issued": true',
  '"production_key_issued": true',
  "beta a pagamento approvata",
  "go-live commerciale approvato",
  "pagamento approvato",
  "fattura approvata"
)
foreach ($pattern in $forbiddenPatterns) {
  Add-Check "forbidden_absent_$($pattern.Replace(' ', '_'))" ((-not $jsonRaw.Contains($pattern)) -and (-not $md.Contains($pattern))) "forbidden pattern absent"
}

$passed = @($checks | Where-Object { $_.passed }).Count
$failedChecks = @($checks | Where-Object { -not $_.passed })
$failed = $failedChecks.Count

$lines = New-Object System.Collections.Generic.List[string]
$lines.Add("# Owner action checklist NoWrite probe") | Out-Null
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
  document = "owner_action_checklist_nowrite_probe_summary"
  date = "2026-06-18"
  target = "owner_action_checklist_nowrite_20260618"
  passed = $passed
  failed = $failed
  success = ($failed -eq 0)
  current_result = $json.current_result
  activation_allowed = $json.activation_allowed
  owner_signature_present = $json.owner_signature_present
  checklist_items = @($json.checklist_items).Count
  dashboard_counts = $json.dashboard_counts
  next_safe_action = $json.recommended_next_safe_action
  failed_checks = @($failedChecks | ForEach-Object { $_.name })
}
$summary | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $summaryPath -Encoding UTF8

if ($failed -gt 0) {
  throw "Owner action checklist NoWrite probe failed: $failed checks failed. See $reportPath"
}

Write-Host "Owner action checklist NoWrite probe passed: $passed checks, 0 failed."
