$ErrorActionPreference = "Stop"

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$pack = Join-Path $root "private-evaluator-pack"
$jsonPath = Join-Path $pack "owner_summary_nowrite_20260618.json"
$mdPath = Join-Path $pack "owner_summary_nowrite_20260618.md"
$alignmentSummaryPath = Join-Path $pack "final_activation_decision_alignment_probe_summary_20260618.json"
$reportPath = Join-Path $pack "owner_summary_nowrite_probe_report_20260618.md"
$summaryPath = Join-Path $pack "owner_summary_nowrite_probe_summary_20260618.json"

$jsonRaw = Get-Content -LiteralPath $jsonPath -Raw
$md = Get-Content -LiteralPath $mdPath -Raw
$json = $jsonRaw | ConvertFrom-Json
$alignmentSummary = Get-Content -LiteralPath $alignmentSummaryPath -Raw | ConvertFrom-Json

$checks = New-Object System.Collections.Generic.List[object]

function Add-Check {
  param([string]$Name, [bool]$Passed, [string]$Details)
  $script:checks.Add([pscustomobject]@{ name = $Name; passed = $Passed; details = $Details }) | Out-Null
}

Add-Check "status_is_owner_summary" ($json.status -eq "owner_summary_ready_nowrite_not_signed_not_activated") "status=$($json.status)"
Add-Check "not_approval_not_signature" (($json.is_approval -eq $false) -and ($json.is_owner_signature -eq $false) -and ($json.owner_signature_present -eq $false)) "approval/signature false"
Add-Check "activation_flags_false" (($json.activation_allowed -eq $false) -and ($json.paid_beta_activation_allowed -eq $false) -and ($json.commercial_go_live_allowed -eq $false)) "activation flags false"
Add-Check "money_flags_false" (($json.real_payment_allowed -eq $false) -and ($json.invoice_allowed -eq $false) -and ($json.payment_method_collection_allowed -eq $false)) "money flags false"
Add-Check "production_data_distribution_flags_false" (($json.production_key_issuance_allowed -eq $false) -and ($json.real_customer_data_allowed -eq $false) -and ($json.personal_data_allowed -eq $false) -and ($json.external_outreach_allowed -eq $false) -and ($json.marketplace_publication_allowed -eq $false) -and ($json.hosted_public_mcp_allowed -eq $false) -and ($json.mcp_registry_publication_allowed -eq $false)) "production/data/distribution flags false"
Add-Check "current_result_not_yet" ($json.current_result -eq "NOT_YET_OWNER_REVIEW_REQUIRED") "current_result=$($json.current_result)"
Add-Check "classification_review_required" ($json.classification -eq "review_required_before_any_activation") "classification=$($json.classification)"
Add-Check "source_brain_v15" ($json.source_evidence.company_brain_version -eq "2026-06-18-internal-v15") "source=$($json.source_evidence.company_brain_version)"
Add-Check "source_alignment_probe" ($json.source_evidence.alignment_probe -eq "41_checks_0_failed") "source alignment=$($json.source_evidence.alignment_probe)"
Add-Check "alignment_summary_success" (($alignmentSummary.success -eq $true) -and ($alignmentSummary.failed -eq 0) -and ($alignmentSummary.current_result -eq "NOT_YET_OWNER_REVIEW_REQUIRED")) "alignment success=$($alignmentSummary.success)"
Add-Check "dashboard_counts_3_12_1" (($json.dashboard_counts.green -eq 3) -and ($json.dashboard_counts.yellow -eq 12) -and ($json.dashboard_counts.red -eq 1)) "counts=$($json.dashboard_counts.green)/$($json.dashboard_counts.yellow)/$($json.dashboard_counts.red)"

$requiredArtifacts = @(
  "final_owner_review_gap_report",
  "owner_review_meeting_pack",
  "controlled_beta_activation_packet",
  "controlled_beta_blocking_simulations",
  "controlled_beta_simulation_readiness_report",
  "owner_decision_readiness_packet",
  "owner_approval_form",
  "activation_review_packet",
  "final_activation_decision_record",
  "company_brain_v15_dashboard_alignment"
)
foreach ($artifact in $requiredArtifacts) {
  Add-Check "completed_artifact_$artifact" (@($json.completed_artifacts) -contains $artifact) "artifact present"
}

$sim = $json.validated_simulation_results
Add-Check "simulation_results_all_true" (($sim.beta_without_signature_blocked -eq $true) -and ($sim.payment_blocked -eq $true) -and ($sim.personal_data_blocked -eq $true) -and ($sim.production_key_blocked -eq $true) -and ($sim.cost_cap_exceeded_blocked -eq $true) -and ($sim.invalid_output_not_billable -eq $true) -and ($sim.valid_output_consumes_one_simulated_credit -eq $true) -and ($sim.duplicate_domain_deduplicated_or_blocked -eq $true) -and ($sim.public_marketplace_or_mcp_blocked -eq $true) -and ($sim.real_world_side_effects -eq 0)) "simulation results safe"

$requiredBlocked = @(
  "paid_beta_activation",
  "commercial_go_live",
  "real_payments",
  "invoices",
  "payment_method_collection",
  "production_api_keys",
  "real_customer_data",
  "personal_data",
  "external_outreach",
  "marketplace_publication",
  "hosted_public_mcp",
  "mcp_registry_publication",
  "subscriptions_or_auto_renewals"
)
foreach ($item in $requiredBlocked) {
  Add-Check "still_blocked_$item" (@($json.still_blocked) -contains $item) "blocked item present"
}

$requiredMissing = @(
  "explicit_owner_signature",
  "fiscal_admin_choice",
  "payment_invoice_rules",
  "final_privacy_data_texts",
  "product_price_limits_credit_confirmation",
  "production_api_key_policy",
  "cost_cap_kill_switch_implementation",
  "support_escalation",
  "security_incident_procedure",
  "distribution_channel_decision"
)
foreach ($item in $requiredMissing) {
  Add-Check "missing_before_real_decision_$item" (@($json.missing_before_real_decision) -contains $item) "missing item present"
}

$machine = $json.current_machine_response
Add-Check "machine_status" ($machine.status -eq "owner_summary_ready_nowrite") "status=$($machine.status)"
Add-Check "machine_decision_not_yet" ($machine.decision -eq "NOT_YET_OWNER_REVIEW_REQUIRED") "decision=$($machine.decision)"
Add-Check "machine_signature_activation_false" (($machine.activation_allowed -eq $false) -and ($machine.owner_signature_present -eq $false)) "machine activation/signature false"
Add-Check "machine_flags_false" (($machine.paid_beta_activation -eq $false) -and ($machine.commercial_go_live -eq $false) -and ($machine.real_payment_executed -eq $false) -and ($machine.invoice_issued -eq $false) -and ($machine.payment_method_collected -eq $false) -and ($machine.production_key_issued -eq $false) -and ($machine.real_or_personal_data_processed -eq $false) -and ($machine.external_outreach_sent -eq $false) -and ($machine.marketplace_or_public_mcp_published -eq $false)) "machine flags false"
Add-Check "machine_counts_3_12_1" (($machine.dashboard_counts.green -eq 3) -and ($machine.dashboard_counts.yellow -eq 12) -and ($machine.dashboard_counts.red -eq 1)) "machine counts ok"
Add-Check "machine_support_code" ($machine.support_code -eq "OWNER_SUMMARY_READY_NOWRITE") "support=$($machine.support_code)"
Add-Check "next_safe_action_owner_checklist" ($json.recommended_next_safe_action -eq "prepare_owner_action_checklist_nowrite") "next=$($json.recommended_next_safe_action)"

$requiredMdPhrases = @(
  "Owner summary NoWrite",
  "non firmata, non attivata",
  "Non ancora. Serve review proprietario prima di qualsiasi attivazione.",
  "Cosa e' stato completato",
  "Cosa hanno dimostrato i test",
  "Cosa resta bloccato",
  "Cosa manca prima di una decisione reale",
  "owner action checklist NoWrite",
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
$lines.Add("# Owner summary NoWrite probe") | Out-Null
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
  document = "owner_summary_nowrite_probe_summary"
  date = "2026-06-18"
  target = "owner_summary_nowrite_20260618"
  passed = $passed
  failed = $failed
  success = ($failed -eq 0)
  current_result = $json.current_result
  activation_allowed = $json.activation_allowed
  owner_signature_present = $json.owner_signature_present
  dashboard_counts = $json.dashboard_counts
  next_safe_action = $json.recommended_next_safe_action
  failed_checks = @($failedChecks | ForEach-Object { $_.name })
}
$summary | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $summaryPath -Encoding UTF8

if ($failed -gt 0) {
  throw "Owner summary NoWrite probe failed: $failed checks failed. See $reportPath"
}

Write-Host "Owner summary NoWrite probe passed: $passed checks, 0 failed."
