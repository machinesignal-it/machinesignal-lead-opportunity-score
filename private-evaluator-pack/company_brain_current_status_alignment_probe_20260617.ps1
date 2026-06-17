$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent (Split-Path -Parent $PSCommandPath)
$ReportPath = Join-Path $Root "private-evaluator-pack\company_brain_current_status_alignment_probe_report_20260617.md"
$SummaryPath = Join-Path $Root "private-evaluator-pack\company_brain_current_status_alignment_probe_summary_20260617.json"

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

$brainMd = Get-Content -Raw -Path (Join-Path $Root "COMPANY_BRAIN.md")
$brain = Read-Json "company-brain.json"
$graph = Read-Json "company-brain-graph.json"
$openapi = Read-Json "openapi.json"
$onboarding = Read-Json "machine-onboarding.json"
$catalog = Read-Json "product-catalog.json"

Assert-True "Company Brain Markdown updated to 2026-06-17" ($brainMd -match "Updated: 2026-06-17") $results
Assert-True "Company Brain Markdown states technical sandbox complete" ($brainMd -match "technical-sandbox-complete-for-current-scope") $results
Assert-True "Company Brain Markdown states commercial activation blocked" ($brainMd -match "commercial-activation-blocked") $results
Assert-True "Company Brain Markdown states advisor gate rehearsal zero violations" ($brainMd -match "18 tests, 0 hard-block violations, 0 unexpected allows") $results

Assert-True "company-brain JSON version updated" ($brain.company_brain_version -eq "2026-06-17-internal-v2") $results
Assert-True "company-brain JSON updated date" ($brain.updated_at -eq "2026-06-17") $results
Assert-True "company-brain phase current" ($brain.current_status.phase -eq "technical-sandbox-complete-current-scope") $results
Assert-True "company-brain technical sandbox complete" ($brain.current_status.technical_sandbox -eq "complete_for_current_scope") $results
Assert-True "company-brain advisor gate complete" ($brain.current_status.advisor_gate_setup -eq "complete_for_current_scope") $results
Assert-True "company-brain paid beta not approved" ($brain.current_status.paid_beta -eq "not_approved") $results
Assert-True "company-brain commercial go-live no-go" ($brain.current_status.commercial_go_live -eq "no_go") $results
Assert-True "company-brain technical estimate 100" ($brain.current_status.technical_sandbox_tests_estimate_percent -eq 100) $results
Assert-True "company-brain advisor gate object exists" ($null -ne $brain.advisor_gate) $results
Assert-True "company-brain advisor gate zero hard block violations" ($brain.advisor_gate.latest_rehearsal.hard_block_violations -eq 0) $results
Assert-True "company-brain advisor gate zero unexpected allows" ($brain.advisor_gate.latest_rehearsal.unexpected_allows -eq 0) $results

Assert-True "graph version updated" ($graph.graph_version -eq "2026-06-17-internal-v2") $results
Assert-True "graph has technical sandbox complete node" (@($graph.nodes.id) -contains "technical_sandbox_complete_current_scope") $results
Assert-True "graph has advisor gate complete node" (@($graph.nodes.id) -contains "advisor_gate_complete_current_scope") $results
Assert-True "graph has safe workstream node" (@($graph.nodes.id) -contains "internal_docs_api_examples_company_brain_refinement") $results
Assert-True "graph links advisor gate to blocked actions" (@($graph.edges | Where-Object { $_.from -eq "advisor_gate_complete_current_scope" -and $_.to -eq "blocked_actions" -and $_.relation -eq "enforces" }).Count -gt 0) $results

$openapiStatus = $openapi.'x-machinesignal-current-status'
Assert-True "openapi advisor gate complete matches brain" ($openapiStatus.advisor_gate_setup -eq $brain.current_status.advisor_gate_setup) $results
Assert-True "openapi paid beta no-go" ($openapiStatus.paid_beta_activation -eq "no_go") $results
Assert-True "openapi commercial go-live no-go" ($openapiStatus.commercial_go_live -eq $brain.current_status.commercial_go_live) $results
Assert-True "onboarding paid beta no-go" ($onboarding.current_status.paid_beta_activation -eq "no_go") $results
Assert-True "onboarding commercial go-live no-go" ($onboarding.current_status.commercial_go_live -eq "no_go") $results
Assert-True "catalog paid beta no-go" ($catalog.catalog_status.paid_beta_activation -eq "no_go") $results
Assert-True "catalog real payments blocked" ($catalog.catalog_status.real_payments -eq "blocked") $results

$blockedRequired = @(
  "real_payments",
  "invoices",
  "payment_method_collection",
  "production_api_keys",
  "real_customer_data_processing",
  "personal_data_processing",
  "external_outreach",
  "public_paid_marketplace_publication",
  "hosted_mcp_public_launch",
  "mcp_registry_publication",
  "commercial_go_live"
)
foreach ($action in $blockedRequired) {
  Assert-True "company-brain blocked action: $action" (@($brain.blocked_actions) -contains $action) $results
}

$combined = @(
  $brainMd,
  (Get-Content -Raw -Path (Join-Path $Root "company-brain.json")),
  (Get-Content -Raw -Path (Join-Path $Root "company-brain-graph.json"))
) -join "`n"

foreach ($pattern in @(
  "commercial go-live approved",
  "paid beta is live",
  "real payments are active",
  "production keys available",
  "marketplace publication allowed",
  "hosted public MCP live"
)) {
  Assert-True "no unsafe Company Brain claim: $pattern" ($combined -notmatch [regex]::Escape($pattern)) $results
}

$failed = @($results | Where-Object { -not $_.passed })
$passedCount = @($results | Where-Object { $_.passed }).Count
$totalCount = $results.Count

$report = @()
$report += "# Company Brain Current Status Alignment Probe - 2026-06-17"
$report += ""
$report += "- Checks passed: $passedCount/$totalCount"
$report += "- Failed checks: $($failed.Count)"
$report += "- Scope: COMPANY_BRAIN.md, company-brain.json, company-brain-graph.json, OpenAPI, onboarding and catalog status alignment."
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
  scope = @("COMPANY_BRAIN.md", "company-brain.json", "company-brain-graph.json", "openapi.json", "machine-onboarding.json", "product-catalog.json")
} | ConvertTo-Json -Depth 6 | Set-Content -Path $SummaryPath -Encoding UTF8

if ($failed.Count -gt 0) {
  throw "Probe failed with $($failed.Count) failed checks. See $ReportPath"
}

Write-Host "Probe passed: $passedCount/$totalCount checks"
