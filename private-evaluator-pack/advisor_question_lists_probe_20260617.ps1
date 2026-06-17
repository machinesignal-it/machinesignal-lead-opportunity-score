$ErrorActionPreference = "Stop"

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$mdPath = Join-Path $root "private-evaluator-pack\advisor_question_lists_20260617.md"
$jsonPath = Join-Path $root "private-evaluator-pack\advisor_question_lists_20260617.json"
$reportPath = Join-Path $root "private-evaluator-pack\advisor_question_lists_probe_report_20260617.md"
$summaryPath = Join-Path $root "private-evaluator-pack\advisor_question_lists_probe_summary_20260617.json"

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
  "Domande Per Commercialista / Fisco",
  "Domande Per Legale / Privacy",
  "Non vogliamo ancora:",
  "Attivare beta a pagamento: no.",
  "Incassare pagamenti reali: no.",
  "Usare dati reali/personali: no.",
  "Fare outreach: no."
)

foreach ($phrase in $requiredPhrases) {
  Add-Check "markdown_contains_$($phrase.Replace(' ', '_').Replace('/', '').Replace(':', '').Replace('.', ''))" ($md.Contains($phrase)) $phrase
}

$blocked = @(
  "real_payments",
  "invoices",
  "payment_method_collection",
  "personal_data",
  "real_customer_lists",
  "external_outreach",
  "marketplace_publication",
  "public_mcp_or_registry_publication"
)

foreach ($item in $blocked) {
  Add-Check "json_blocks_$item" ($json.still_blocked -contains $item) $item
}

$accountantTopics = @(
  "starting_without_vat_or_piva",
  "correct_business_form",
  "invoicing_and_revenue_recognition",
  "vat_and_digital_services",
  "cost_deductibility",
  "controlled_paid_beta"
)

foreach ($item in $accountantTopics) {
  Add-Check "json_accountant_$item" ($json.accountant_topics -contains $item) $item
}

$legalTopics = @(
  "terms_of_service",
  "privacy_and_data",
  "privacy_roles",
  "data_retention",
  "public_business_data_and_enrichment",
  "machine_or_ai_agent_usage",
  "security_and_incidents",
  "commercial_communication"
)

foreach ($item in $legalTopics) {
  Add-Check "json_legal_$item" ($json.legal_privacy_topics -contains $item) $item
}

Add-Check "json_prepare_true" ([bool]$json.current_decision.prepare_materials) "$($json.current_decision.prepare_materials)"
Add-Check "json_activate_false" (-not [bool]$json.current_decision.activate_paid_beta) "$($json.current_decision.activate_paid_beta)"
Add-Check "json_payments_false" (-not [bool]$json.current_decision.accept_real_payments) "$($json.current_decision.accept_real_payments)"
Add-Check "json_data_false" (-not [bool]$json.current_decision.use_real_or_personal_data) "$($json.current_decision.use_real_or_personal_data)"
Add-Check "json_outreach_false" (-not [bool]$json.current_decision.perform_outreach) "$($json.current_decision.perform_outreach)"

$failed = @($checks | Where-Object { -not $_.passed })
$status = if ($failed.Count -eq 0) { "PASSED" } else { "FAILED" }

$summary = [pscustomobject]@{
  date = "2026-06-17"
  status = $status
  checks = $checks.Count
  failed = $failed.Count
  next_step = "create_advisor_review_packet_summary"
}

$report = @(
  "# Advisor Question Lists - Probe Report"
  ""
  "- Date: 2026-06-17"
  "- Status: $status"
  "- Checks: $($checks.Count)"
  "- Failed: $($failed.Count)"
  ""
  "## Result"
  ""
  "The accountant and legal/privacy question lists are complete and keep commercial activation, real payments, real data and outreach blocked."
) -join "`n"

Set-Content -LiteralPath $reportPath -Value $report -Encoding UTF8
Set-Content -LiteralPath $summaryPath -Value ($summary | ConvertTo-Json -Depth 5) -Encoding UTF8

if ($failed.Count -gt 0) {
  $failed | Format-Table -AutoSize | Out-String | Write-Host
  throw "Advisor question lists probe failed."
}

Write-Host $report
