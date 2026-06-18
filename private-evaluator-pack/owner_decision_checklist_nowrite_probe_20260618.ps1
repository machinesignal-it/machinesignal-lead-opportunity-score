$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$jsonPath = Join-Path $root "owner_decision_checklist_nowrite_20260618.json"
$mdPath = Join-Path $root "owner_decision_checklist_nowrite_20260618.md"
$approvalPath = Join-Path $root "owner_commercial_approval_packet_20260618.json"
$dashboardPath = Join-Path $root "owner_decision_dashboard_20260618.json"
$reportPath = Join-Path $root "owner_decision_checklist_nowrite_probe_report_20260618.md"
$summaryPath = Join-Path $root "owner_decision_checklist_nowrite_probe_summary_20260618.json"

$jsonText = Get-Content -LiteralPath $jsonPath -Raw -Encoding UTF8
$json = $jsonText | ConvertFrom-Json
$md = Get-Content -LiteralPath $mdPath -Raw -Encoding UTF8
$approval = (Get-Content -LiteralPath $approvalPath -Raw -Encoding UTF8) | ConvertFrom-Json
$dashboard = (Get-Content -LiteralPath $dashboardPath -Raw -Encoding UTF8) | ConvertFrom-Json

$checks = New-Object System.Collections.Generic.List[object]
function Add-Check {
  param([string]$Name, [bool]$Pass, [string]$Detail)
  $script:checks.Add([pscustomobject]@{ name = $Name; pass = $Pass; detail = $Detail })
}

Add-Check "Status draft nowrite" ($json.status -eq "draft_nowrite_not_signed_not_activated") $json.status
Add-Check "Mode NoWrite" ($json.mode -eq "NoWrite final decision simulation") $json.mode
Add-Check "Current result not yet" ($json.current_result -eq "NOT_YET_OWNER_REVIEW_REQUIRED") $json.current_result
Add-Check "Remaining red owner approval" ($json.remaining_red_gate -eq "owner_commercial_approval") $json.remaining_red_gate
Add-Check "Counts 3 green" ([int]$json.current_dashboard_counts.green -eq 3) "$($json.current_dashboard_counts.green)"
Add-Check "Counts 12 yellow" ([int]$json.current_dashboard_counts.yellow -eq 12) "$($json.current_dashboard_counts.yellow)"
Add-Check "Counts 1 red" ([int]$json.current_dashboard_counts.red -eq 1) "$($json.current_dashboard_counts.red)"

$falseFlags = @(
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
foreach ($flag in $falseFlags) {
  Add-Check "Flag false: $flag" (-not [bool]$json.$flag) "$($json.$flag)"
}

$requiredResults = @(
  "GO_SANDBOX_PREPARATION",
  "NOT_YET_OWNER_REVIEW_REQUIRED",
  "NO_GO_BLOCKED",
  "GO_REQUIRES_SEPARATE_ACTIVATION_STEP"
)
foreach ($item in $requiredResults) {
  Add-Check "Allowed simulation result present: $item" ($json.allowed_simulation_results -contains $item) $item
}

$requiredGates = @(
  "owner_commercial_approval",
  "fiscal_admin_path",
  "payment_invoice_path",
  "terms_privacy_data",
  "product_listino",
  "credit_refund_policy",
  "production_api_keys",
  "cost_cap_kill_switch",
  "support_escalation",
  "security_incident",
  "distribution_no_outreach",
  "final_go_no_go_report"
)
foreach ($gate in $requiredGates) {
  $matches = @($json.checklist | Where-Object { $_.gate -eq $gate })
  Add-Check "Checklist gate present: $gate" ($matches.Count -eq 1) $gate
}

$ownerGate = @($json.checklist | Where-Object { $_.gate -eq "owner_commercial_approval" })[0]
Add-Check "Owner gate is red not signed" ($ownerGate.current_status -eq "red_not_signed") $ownerGate.current_status
$finalReportGate = @($json.checklist | Where-Object { $_.gate -eq "final_go_no_go_report" })[0]
Add-Check "Final report missing" ($finalReportGate.current_status -eq "missing") $finalReportGate.current_status

$simIds = @("owner_not_signed", "forbidden_production_key_request", "future_all_green_requires_separate_activation")
foreach ($id in $simIds) {
  $matches = @($json.simulations | Where-Object { $_.id -eq $id })
  Add-Check "Simulation present: $id" ($matches.Count -eq 1) $id
}

$simOwner = @($json.simulations | Where-Object { $_.id -eq "owner_not_signed" })[0]
Add-Check "Owner not signed result not yet" ($simOwner.expected_output.simulation_result -eq "NOT_YET_OWNER_REVIEW_REQUIRED") $simOwner.expected_output.simulation_result
Add-Check "Owner not signed no paid beta" (-not [bool]$simOwner.expected_output.paid_beta_activation) "$($simOwner.expected_output.paid_beta_activation)"
Add-Check "Owner not signed zero credits" ([int]$simOwner.expected_output.credits_consumed -eq 0) "$($simOwner.expected_output.credits_consumed)"

$simKey = @($json.simulations | Where-Object { $_.id -eq "forbidden_production_key_request" })[0]
Add-Check "Forbidden key request blocked" ($simKey.expected_output.simulation_result -eq "NO_GO_BLOCKED") $simKey.expected_output.simulation_result
Add-Check "Forbidden key request no key" (-not [bool]$simKey.expected_output.production_key_issued) "$($simKey.expected_output.production_key_issued)"
Add-Check "Forbidden key request support code" ($simKey.expected_output.support_code -eq "OWNER_COMMERCIAL_APPROVAL_NOT_SIGNED") $simKey.expected_output.support_code

$simFuture = @($json.simulations | Where-Object { $_.id -eq "future_all_green_requires_separate_activation" })[0]
Add-Check "Future all green requires separate activation" ($simFuture.expected_output.simulation_result -eq "GO_REQUIRES_SEPARATE_ACTIVATION_STEP") $simFuture.expected_output.simulation_result
Add-Check "Future all green no automatic paid beta" (-not [bool]$simFuture.expected_output.paid_beta_activation) "$($simFuture.expected_output.paid_beta_activation)"
Add-Check "Future all green no automatic go-live" (-not [bool]$simFuture.expected_output.commercial_go_live) "$($simFuture.expected_output.commercial_go_live)"

$response = $json.current_machine_response
Add-Check "Current response status" ($response.status -eq "owner_decision_not_ready") $response.status
Add-Check "Current response result not yet" ($response.current_result -eq "NOT_YET_OWNER_REVIEW_REQUIRED") $response.current_result
Add-Check "Current response no payment" (-not [bool]$response.real_payment_executed) "$($response.real_payment_executed)"
Add-Check "Current response no invoice" (-not [bool]$response.invoice_issued) "$($response.invoice_issued)"
Add-Check "Current response no production key" (-not [bool]$response.production_key_issued) "$($response.production_key_issued)"
Add-Check "Current response no data" (-not [bool]$response.real_or_personal_data_processed) "$($response.real_or_personal_data_processed)"
Add-Check "Current response no outreach" (-not [bool]$response.external_outreach_sent) "$($response.external_outreach_sent)"
Add-Check "Current response zero credits" ([int]$response.credits_consumed -eq 0) "$($response.credits_consumed)"
Add-Check "Current response support code" ($response.support_code -eq "OWNER_DECISION_NOT_READY") $response.support_code

Add-Check "Approval packet still not activated" ($approval.commercial_activation -eq $false) "approval packet commercial activation"
Add-Check "Dashboard paid beta no-go" ($dashboard.final_decision.paid_beta_activation -eq "no_go") $dashboard.final_decision.paid_beta_activation
Add-Check "Dashboard go-live no-go" ($dashboard.final_decision.commercial_go_live -eq "no_go") $dashboard.final_decision.commercial_go_live

$mdRequired = @(
  "Non firma nulla",
  "NOT_YET_OWNER_REVIEW_REQUIRED",
  "NO_GO_BLOCKED",
  "GO_REQUIRES_SEPARATE_ACTIVATION_STEP",
  "Risposta macchina corrente",
  "Cosa gli agenti non possono fare",
  "Aggiornare Company Brain e dashboard"
)
foreach ($phrase in $mdRequired) {
  Add-Check "Markdown phrase present: $phrase" ($md.Contains($phrase)) $phrase
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
  '"hosted_public_mcp_allowed": true',
  '"mcp_registry_publication_allowed": true',
  "paid beta approved",
  "commercial go-live approved",
  "payment approved",
  "invoice approved",
  "production key approved",
  "outreach approved",
  "beta a pagamento approvata",
  "go-live commerciale approvato",
  "pagamento approvato",
  "fattura approvata",
  "chiave production approvata",
  "outreach approvato"
)
foreach ($phrase in $unsafePhrases) {
  Add-Check "Forbidden phrase absent: $phrase" (-not ($jsonText.Contains($phrase) -or $md.Contains($phrase))) $phrase
}

$failed = @($checks | Where-Object { -not $_.pass })
$passedCount = @($checks | Where-Object { $_.pass }).Count
$failedCount = $failed.Count

$report = New-Object System.Collections.Generic.List[string]
$report.Add("# Owner Decision Checklist NoWrite Probe Report")
$report.Add("")
$report.Add("Date: 2026-06-18")
$report.Add("")
$report.Add("Scope: controllo NoWrite su checklist decisionale e simulazione finale.")
$report.Add("")
$report.Add("Checks passed: $passedCount")
$report.Add("Checks failed: $failedCount")
$report.Add("")
$report.Add("Sintesi:")
$report.Add("")
$report.Add("- La checklist esiste e lo stato corrente resta NOT_YET_OWNER_REVIEW_REQUIRED.")
$report.Add("- Anche nello scenario futuro all-green non c'e' attivazione automatica.")
$report.Add("- Pagamenti, fatture, chiavi production, dati, outreach e go-live restano bloccati.")
$report.Add("")
$report.Add("Dettaglio controlli:")
$report.Add("")
foreach ($check in $checks) {
  $status = if ($check.pass) { "OK" } else { "FAIL" }
  $report.Add("- [$status] $($check.name): $($check.detail)")
}
Set-Content -LiteralPath $reportPath -Value $report -Encoding UTF8

$summary = [pscustomobject]@{
  document = "owner_decision_checklist_nowrite_probe_summary"
  date = "2026-06-18"
  passed = ($failedCount -eq 0)
  checks_passed = $passedCount
  checks_failed = $failedCount
  current_result = "NOT_YET_OWNER_REVIEW_REQUIRED"
  activation_allowed = $false
  report = "owner_decision_checklist_nowrite_probe_report_20260618.md"
}
$summary | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $summaryPath -Encoding UTF8

if ($failedCount -gt 0) {
  Write-Host "FAILED: $failedCount checks failed. See $reportPath"
  exit 1
}

Write-Host "PASSED: $passedCount checks passed. Report: $reportPath"
