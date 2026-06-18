$ErrorActionPreference = "Stop"

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$pack = Join-Path $root "private-evaluator-pack"
$jsonPath = Join-Path $pack "owner_approval_form_nowrite_20260618.json"
$mdPath = Join-Path $pack "owner_approval_form_nowrite_20260618.md"
$readinessSummaryPath = Join-Path $pack "owner_decision_readiness_packet_nowrite_probe_summary_20260618.json"
$reportPath = Join-Path $pack "owner_approval_form_nowrite_probe_report_20260618.md"
$summaryPath = Join-Path $pack "owner_approval_form_nowrite_probe_summary_20260618.json"

$jsonRaw = Get-Content -LiteralPath $jsonPath -Raw
$md = Get-Content -LiteralPath $mdPath -Raw
$json = $jsonRaw | ConvertFrom-Json
$readinessSummary = Get-Content -LiteralPath $readinessSummaryPath -Raw | ConvertFrom-Json

$checks = New-Object System.Collections.Generic.List[object]

function Add-Check {
  param([string]$Name, [bool]$Passed, [string]$Details)
  $script:checks.Add([pscustomobject]@{ name = $Name; passed = $Passed; details = $Details }) | Out-Null
}

Add-Check "status_is_form_ready" ($json.status -eq "owner_approval_form_ready_nowrite_not_signed_not_activated") "status=$($json.status)"
Add-Check "not_approval_not_signature" (($json.is_approval -eq $false) -and ($json.is_owner_signature -eq $false) -and ($json.owner_signature_present -eq $false)) "approval/signature false"
Add-Check "activation_flags_false" (($json.activation_allowed -eq $false) -and ($json.paid_beta_activation_allowed -eq $false) -and ($json.commercial_go_live_allowed -eq $false)) "activation flags false"
Add-Check "money_flags_false" (($json.real_payment_allowed -eq $false) -and ($json.invoice_allowed -eq $false) -and ($json.payment_method_collection_allowed -eq $false)) "money flags false"
Add-Check "production_data_distribution_flags_false" (($json.production_key_issuance_allowed -eq $false) -and ($json.real_customer_data_allowed -eq $false) -and ($json.personal_data_allowed -eq $false) -and ($json.external_outreach_allowed -eq $false) -and ($json.marketplace_publication_allowed -eq $false) -and ($json.hosted_public_mcp_allowed -eq $false) -and ($json.mcp_registry_publication_allowed -eq $false)) "production/data/distribution flags false"
Add-Check "current_result_not_yet" ($json.current_result -eq "NOT_YET_OWNER_REVIEW_REQUIRED") "current_result=$($json.current_result)"
Add-Check "remaining_red_gate_owner" ($json.remaining_red_gate -eq "owner_commercial_approval") "red_gate=$($json.remaining_red_gate)"
Add-Check "source_readiness_probe" ($json.source_evidence.owner_decision_readiness_probe -eq "73_checks_0_failed") "source=$($json.source_evidence.owner_decision_readiness_probe)"
Add-Check "readiness_summary_success" (($readinessSummary.success -eq $true) -and ($readinessSummary.failed -eq 0)) "readiness success=$($readinessSummary.success)"

$requiredOptions = @(
  "A_continue_nowrite",
  "B_prepare_activation_review_nowrite",
  "C_request_changes",
  "D_stop_commercial_path"
)
foreach ($option in $requiredOptions) {
  Add-Check "decision_option_$option" (@($json.decision_options | Where-Object { $_.id -eq $option }).Count -eq 1) "option present"
}
Add-Check "recommended_option_B_only" (@($json.decision_options | Where-Object { $_.id -eq "B_prepare_activation_review_nowrite" -and $_.recommended -eq $true -and $_.immediate_effect -eq "no_sales_no_activation" }).Count -eq 1) "B recommended with no activation"

$scope = $json.future_beta_max_scope_not_live
Add-Check "future_scope_limited" (($scope.max_beta_customers -eq 3) -and ($scope.duration_days -eq 30) -and ($scope.first_product -eq "score_pack_1k") -and ($scope.hypothetical_price_eur -eq 119) -and ($scope.auto_renewal -eq $false) -and ($scope.personal_data_allowed -eq $false) -and ($scope.outreach_allowed -eq $false) -and ($scope.marketplace_or_public_mcp_allowed -eq $false)) "future scope limited and not live"

$requiredBlocked = @(
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
  "auto_renewals",
  "commercial_go_live"
)
foreach ($item in $requiredBlocked) {
  Add-Check "still_blocked_$item" (@($json.still_blocked_after_form) -contains $item) "blocked item present"
}

Add-Check "placeholders_not_signed" (($json.form_placeholders.real_signature -eq "[NON_PRESENTE_IN_NOWRITE]") -and ($json.form_placeholders.selected_decision -like "*DA_COMPILARE*")) "signature placeholder only"
Add-Check "future_phrase_is_limited" ($json.future_allowed_phrase -like "Approvo solo la preparazione della activation review NoWrite*") "future phrase limited"

$requiredAmbiguous = @(
  "partiamo",
  "vendiamo",
  "attiva la beta",
  "incassa",
  "manda email",
  "pubblica su marketplace",
  "apri le chiavi production",
  "usa dati reali"
)
foreach ($phrase in $requiredAmbiguous) {
  Add-Check "ambiguous_phrase_blocked_$($phrase.Replace(' ', '_'))" (@($json.ambiguous_phrases_to_block) -contains $phrase) "ambiguous phrase listed"
}

$machine = $json.current_machine_response
Add-Check "machine_status_form_ready" ($machine.status -eq "owner_approval_form_ready_nowrite") "status=$($machine.status)"
Add-Check "machine_decision_not_activation" ($machine.decision -eq "form_ready_not_signed_not_activation") "decision=$($machine.decision)"
Add-Check "machine_signature_false" ($machine.owner_signature_present -eq $false) "signature=$($machine.owner_signature_present)"
Add-Check "machine_flags_false" (($machine.paid_beta_activation -eq $false) -and ($machine.commercial_go_live -eq $false) -and ($machine.real_payment_executed -eq $false) -and ($machine.invoice_issued -eq $false) -and ($machine.payment_method_collected -eq $false) -and ($machine.production_key_issued -eq $false) -and ($machine.real_or_personal_data_processed -eq $false) -and ($machine.external_outreach_sent -eq $false) -and ($machine.marketplace_or_public_mcp_published -eq $false)) "machine flags false"
Add-Check "machine_support_code" ($machine.support_code -eq "OWNER_APPROVAL_FORM_READY_NOWRITE") "support=$($machine.support_code)"
Add-Check "next_safe_action_activation_review" ($json.recommended_next_safe_action -eq "prepare_activation_review_packet_nowrite") "next=$($json.recommended_next_safe_action)"

$requiredMdPhrases = @(
  "Owner approval form NoWrite",
  "non firmato, non attivato",
  "Compilare o leggere questo modulo non attiva nulla",
  "Decisione richiesta al proprietario",
  "Blocchi che restano attivi anche dopo questo modulo",
  "Questi campi sono placeholder NoWrite",
  "Frasi non ammesse",
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
$lines.Add("# Owner approval form NoWrite probe") | Out-Null
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
  document = "owner_approval_form_nowrite_probe_summary"
  date = "2026-06-18"
  target = "owner_approval_form_nowrite_20260618"
  passed = $passed
  failed = $failed
  success = ($failed -eq 0)
  current_result = $json.current_result
  activation_allowed = $json.activation_allowed
  owner_signature_present = $json.owner_signature_present
  recommended_option = "B_prepare_activation_review_nowrite"
  next_safe_action = $json.recommended_next_safe_action
  failed_checks = @($failedChecks | ForEach-Object { $_.name })
}
$summary | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $summaryPath -Encoding UTF8

if ($failed -gt 0) {
  throw "Owner approval form NoWrite probe failed: $failed checks failed. See $reportPath"
}

Write-Host "Owner approval form NoWrite probe passed: $passed checks, 0 failed."
