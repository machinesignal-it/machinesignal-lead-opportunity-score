$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent (Split-Path -Parent $PSCommandPath)
$ReportPath = Join-Path $Root "private-evaluator-pack\internal_docs_api_examples_refinement_probe_report_20260617.md"
$SummaryPath = Join-Path $Root "private-evaluator-pack\internal_docs_api_examples_refinement_probe_summary_20260617.json"

function Read-Json($RelativePath) {
  $path = Join-Path $Root $RelativePath
  return Get-Content -Raw -Path $path | ConvertFrom-Json
}

function Assert-True($Name, $Condition, [System.Collections.Generic.List[object]]$Results) {
  $Results.Add([pscustomobject]@{
    name = $Name
    passed = [bool]$Condition
  })
}

$results = [System.Collections.Generic.List[object]]::new()

$openapi = Read-Json "openapi.json"
$onboarding = Read-Json "machine-onboarding.json"
$catalog = Read-Json "product-catalog.json"
$readme = Get-Content -Raw -Path (Join-Path $Root "README.md")

Assert-True "openapi parsed" ($null -ne $openapi.openapi) $results
Assert-True "machine onboarding parsed" ($null -ne $onboarding) $results
Assert-True "product catalog parsed" ($null -ne $catalog) $results
Assert-True "README includes advisor gate update" ($readme -match "Advisor gate update \(2026-06-17\)") $results

$status = $openapi.'x-machinesignal-current-status'
Assert-True "openapi declares sandbox-only description" ($openapi.info.description -match "Sandbox-only") $results
Assert-True "openapi paid beta is no-go" ($status.paid_beta_activation -eq "no_go") $results
Assert-True "openapi commercial go-live is no-go" ($status.commercial_go_live -eq "no_go") $results
Assert-True "openapi real payments blocked" ($status.real_payments -eq "blocked") $results
Assert-True "openapi invoices blocked" ($status.invoices -eq "blocked") $results
Assert-True "openapi production keys blocked" ($status.production_api_keys -eq "blocked") $results
Assert-True "openapi real customer data blocked" ($status.real_customer_data -eq "blocked") $results
Assert-True "openapi personal data blocked" ($status.personal_data -eq "blocked") $results
Assert-True "openapi external outreach blocked" ($status.external_outreach -eq "blocked") $results
Assert-True "openapi marketplace publication blocked" ($status.marketplace_publication -eq "blocked") $results
Assert-True "openapi hosted public MCP blocked" ($status.hosted_public_mcp -eq "blocked") $results
Assert-True "openapi advisor rehearsal has zero hard block violations" ($status.advisor_gate_rehearsal.hard_block_violations -eq 0) $results

$blockedOpenApi = @($openapi.'x-machinesignal-blocked-actions')
foreach ($action in @(
  "activate_paid_beta",
  "execute_real_payment",
  "issue_invoice",
  "collect_payment_method",
  "issue_production_api_key",
  "process_real_customer_list",
  "process_personal_data",
  "send_outreach",
  "publish_marketplace_listing",
  "launch_hosted_public_mcp",
  "submit_mcp_registry"
)) {
  Assert-True "openapi blocked action: $action" ($blockedOpenApi -contains $action) $results
}

Assert-True "onboarding current status exists" ($null -ne $onboarding.current_status) $results
Assert-True "onboarding paid beta no-go" ($onboarding.current_status.paid_beta_activation -eq "no_go") $results
Assert-True "onboarding commercial go-live no-go" ($onboarding.current_status.commercial_go_live -eq "no_go") $results
Assert-True "onboarding advisor gate passed" ($onboarding.advisor_gate.rehearsal_status -eq "passed") $results
Assert-True "onboarding advisor gate zero hard block violations" ($onboarding.advisor_gate.hard_block_violations -eq 0) $results

$blockedOnboarding = @($onboarding.blocked_actions)
foreach ($action in @(
  "activate_paid_beta",
  "accept_money",
  "collect_payment_method",
  "issue_invoice",
  "issue_production_api_key",
  "process_real_customer_list",
  "process_personal_data",
  "send_outreach_email",
  "contact_companies_or_people",
  "publish_marketplace_listing",
  "launch_hosted_public_mcp",
  "submit_mcp_registry",
  "declare_final_legal_privacy_fiscal_approval"
)) {
  Assert-True "onboarding blocked action: $action" ($blockedOnboarding -contains $action) $results
}

Assert-True "catalog status exists" ($null -ne $catalog.catalog_status) $results
Assert-True "catalog paid beta no-go" ($catalog.catalog_status.paid_beta_activation -eq "no_go") $results
Assert-True "catalog real payments blocked" ($catalog.catalog_status.real_payments -eq "blocked") $results
Assert-True "catalog invoices blocked" ($catalog.catalog_status.invoices -eq "blocked") $results
Assert-True "catalog production keys blocked" ($catalog.catalog_status.production_api_keys -eq "blocked") $results
Assert-True "catalog real payment flag false" ($catalog.payment_mode.real_payment_executed -eq $false) $results
Assert-True "catalog invoice flag false" ($catalog.payment_mode.invoice_issued -eq $false) $results
Assert-True "catalog payment method collection false" ($catalog.payment_mode.payment_method_collection -eq $false) $results
Assert-True "catalog not ready for real payments" ($catalog.payment_mode.ready_for_real_payments -eq $false) $results
Assert-True "catalog machine warning exists" ($catalog.machine_reader_warning -match "sandbox product contract") $results

$combinedParts = @()
$combinedParts += Get-Content -Raw -Path (Join-Path $Root "README.md")
$combinedParts += Get-Content -Raw -Path (Join-Path $Root "openapi.json")
$combinedParts += Get-Content -Raw -Path (Join-Path $Root "machine-onboarding.json")
$combinedParts += Get-Content -Raw -Path (Join-Path $Root "product-catalog.json")
$combined = $combinedParts -join "`n"

foreach ($pattern in @(
  "real payments are active",
  "payments active",
  "commercial go-live approved",
  "paid beta is live",
  "production keys available",
  "hosted public MCP live",
  "marketplace publication allowed"
)) {
  Assert-True "no unsafe positive claim: $pattern" ($combined -notmatch [regex]::Escape($pattern)) $results
}

$failed = @($results | Where-Object { -not $_.passed })
$passedCount = @($results | Where-Object { $_.passed }).Count
$totalCount = $results.Count

$report = @()
$report += "# Internal Docs/API Examples Refinement Probe - 2026-06-17"
$report += ""
$report += "- Checks passed: $passedCount/$totalCount"
$report += "- Failed checks: $($failed.Count)"
$report += "- Scope: README, OpenAPI, machine onboarding and product catalog safety status."
$report += ""
foreach ($item in $results) {
  $mark = if ($item.passed) { "PASS" } else { "FAIL" }
  $report += "- [$mark] $($item.name)"
}
$report -join "`n" | Set-Content -Path $ReportPath -Encoding UTF8

[pscustomobject]@{
  generated_at = "2026-06-17"
  checks_passed = $passedCount
  checks_total = $totalCount
  failed_checks = @($failed | ForEach-Object { $_.name })
  decision = if ($failed.Count -eq 0) { "pass" } else { "fail" }
  scope = @("README.md", "openapi.json", "machine-onboarding.json", "product-catalog.json")
} | ConvertTo-Json -Depth 6 | Set-Content -Path $SummaryPath -Encoding UTF8

if ($failed.Count -gt 0) {
  throw "Probe failed with $($failed.Count) failed checks. See $ReportPath"
}

Write-Host "Probe passed: $passedCount/$totalCount checks"
