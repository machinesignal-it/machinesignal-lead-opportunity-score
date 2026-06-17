$ErrorActionPreference = "Stop"

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$mdPath = Join-Path $root "private-evaluator-pack\advisor_review_packet_summary_20260617.md"
$jsonPath = Join-Path $root "private-evaluator-pack\advisor_review_packet_summary_20260617.json"
$reportPath = Join-Path $root "private-evaluator-pack\advisor_review_packet_summary_probe_report_20260617.md"
$summaryPath = Join-Path $root "private-evaluator-pack\advisor_review_packet_summary_probe_summary_20260617.json"

$checks = New-Object System.Collections.Generic.List[object]

function Add-Check {
  param([string]$Name, [bool]$Passed, [string]$Detail)
  $checks.Add([pscustomobject]@{ name = $Name; passed = $Passed; detail = $Detail })
}

Add-Check "markdown_exists" (Test-Path $mdPath) $mdPath
Add-Check "json_exists" (Test-Path $jsonPath) $jsonPath

$md = Get-Content -Raw -LiteralPath $mdPath
$json = Get-Content -Raw -LiteralPath $jsonPath | ConvertFrom-Json

$requiredPhrases = @(
  "Cos'e' MachineSignal",
  "Cosa Potremmo Vendere In Futuro",
  "Cosa Non E' Attivo",
  "Cosa Vogliamo Capire Dal Commercialista",
  "Cosa Vogliamo Capire Dal Legale / Privacy",
  "Attivare beta a pagamento: no.",
  "Incassare denaro: no.",
  "Usare dati reali/personali: no.",
  "Contattare clienti: no."
)

foreach ($phrase in $requiredPhrases) {
  Add-Check "markdown_contains_$($phrase.Replace(' ', '_').Replace('/', '').Replace(':', '').Replace('.', ''))" ($md.Contains($phrase)) $phrase
}

$notActive = @(
  "real_payments",
  "invoices",
  "payment_method_collection",
  "production_api_keys",
  "real_customer_lists",
  "personal_data_processing",
  "email_campaigns",
  "external_commercial_contacts",
  "marketplace_publication",
  "public_hosted_mcp",
  "public_mcp_registry"
)

foreach ($item in $notActive) {
  Add-Check "json_not_active_$item" ($json.not_active -contains $item) $item
}

Add-Check "json_phase_sandbox" ($json.current_phase -eq "sandbox_test") $json.current_phase
Add-Check "json_model_machine_first" ($json.business_model -eq "machine_first_api_services") $json.business_model
Add-Check "json_prepare_true" ([bool]$json.current_decision.prepare_materials) "$($json.current_decision.prepare_materials)"
Add-Check "json_ask_advisors_true" ([bool]$json.current_decision.ask_advisors) "$($json.current_decision.ask_advisors)"
Add-Check "json_activate_false" (-not [bool]$json.current_decision.activate_paid_beta) "$($json.current_decision.activate_paid_beta)"
Add-Check "json_money_false" (-not [bool]$json.current_decision.accept_money) "$($json.current_decision.accept_money)"
Add-Check "json_invoices_false" (-not [bool]$json.current_decision.issue_invoices) "$($json.current_decision.issue_invoices)"
Add-Check "json_data_false" (-not [bool]$json.current_decision.use_real_or_personal_data) "$($json.current_decision.use_real_or_personal_data)"
Add-Check "json_contact_false" (-not [bool]$json.current_decision.contact_customers) "$($json.current_decision.contact_customers)"

$failed = @($checks | Where-Object { -not $_.passed })
$status = if ($failed.Count -eq 0) { "PASSED" } else { "FAILED" }

$summary = [pscustomobject]@{
  date = "2026-06-17"
  status = $status
  checks = $checks.Count
  failed = $failed.Count
  next_step = "package_advisor_docs_for_owner_review"
}

$report = @(
  "# Advisor Review Packet Summary - Probe Report"
  ""
  "- Date: 2026-06-17"
  "- Status: $status"
  "- Checks: $($checks.Count)"
  "- Failed: $($failed.Count)"
  ""
  "## Result"
  ""
  "The advisor summary explains MachineSignal clearly while confirming that paid beta, money collection, invoices, real data and customer contact are not active."
) -join "`n"

Set-Content -LiteralPath $reportPath -Value $report -Encoding UTF8
Set-Content -LiteralPath $summaryPath -Value ($summary | ConvertTo-Json -Depth 5) -Encoding UTF8

if ($failed.Count -gt 0) {
  $failed | Format-Table -AutoSize | Out-String | Write-Host
  throw "Advisor review packet summary probe failed."
}

Write-Host $report
