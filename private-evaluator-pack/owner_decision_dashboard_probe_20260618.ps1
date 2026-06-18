$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent (Split-Path -Parent $PSCommandPath)
$MdPath = Join-Path $Root "private-evaluator-pack\owner_decision_dashboard_20260618.md"
$JsonPath = Join-Path $Root "private-evaluator-pack\owner_decision_dashboard_20260618.json"
$ReportPath = Join-Path $Root "private-evaluator-pack\owner_decision_dashboard_probe_report_20260618.md"
$SummaryPath = Join-Path $Root "private-evaluator-pack\owner_decision_dashboard_probe_summary_20260618.json"

function Assert-True($Name, $Condition, [System.Collections.Generic.List[object]]$Results) {
  $Results.Add([pscustomobject]@{
    name = $Name
    passed = [bool]$Condition
  })
}

$results = [System.Collections.Generic.List[object]]::new()
$md = Get-Content -Raw -Path $MdPath
$jsonText = Get-Content -Raw -Path $JsonPath
$json = $jsonText | ConvertFrom-Json

Assert-True "markdown exists" (Test-Path $MdPath) $results
Assert-True "json exists" (Test-Path $JsonPath) $results
Assert-True "status is dashboard no-write not activated" ($json.status -eq "owner_decision_dashboard_no_write_not_signed_not_activated") $results
Assert-True "recommended decision prepare not activate" ($json.recommended_decision_today -eq "continue_preparing_paid_beta_materials_but_do_not_activate_paid_beta") $results
Assert-True "final decision preparation go" ($json.final_decision.paid_beta_preparation -eq "go") $results
Assert-True "final decision paid beta no-go" ($json.final_decision.paid_beta_activation -eq "no_go") $results
Assert-True "final decision commercial no-go" ($json.final_decision.commercial_go_live -eq "no_go") $results

$areas = @($json.dashboard.area)
foreach ($area in @(
  "technical_sandbox",
  "advisor_gate_setup",
  "machine_readable_docs",
  "policy_preparation",
  "pnl_paid_beta_delta",
  "owner_commercial_approval",
  "fiscal_admin_path",
  "payment_invoice_path",
  "terms_privacy_data",
  "product_listino_approval",
  "credit_refund_policy",
  "production_api_keys",
  "cost_cap_kill_switch",
  "support_escalation",
  "security_incident",
  "distribution_no_outreach"
)) {
  Assert-True "dashboard area exists: $area" ($areas -contains $area) $results
}

Assert-True "exactly 16 dashboard rows" ($json.dashboard.Count -eq 16) $results
Assert-True "green rows are 3" (@($json.dashboard | Where-Object { $_.status -eq "green" }).Count -eq 3) $results
Assert-True "yellow rows are 2" (@($json.dashboard | Where-Object { $_.status -eq "yellow" }).Count -eq 2) $results
Assert-True "red rows are 11" (@($json.dashboard | Where-Object { $_.status -eq "red" }).Count -eq 11) $results

Assert-True "technical sandbox is green" (($json.dashboard | Where-Object { $_.area -eq "technical_sandbox" }).status -eq "green") $results
Assert-True "policy preparation is yellow" (($json.dashboard | Where-Object { $_.area -eq "policy_preparation" }).status -eq "yellow") $results
Assert-True "fiscal/admin is red" (($json.dashboard | Where-Object { $_.area -eq "fiscal_admin_path" }).status -eq "red") $results
Assert-True "production keys are red" (($json.dashboard | Where-Object { $_.area -eq "production_api_keys" }).status -eq "red") $results
Assert-True "distribution/no outreach is red" (($json.dashboard | Where-Object { $_.area -eq "distribution_no_outreach" }).status -eq "red") $results

Assert-True "default first product Score Pack 1k" ($json.recommended_defaults_if_beta_later_considered.first_product -eq "score_pack_1k") $results
Assert-True "default first price 119" ($json.recommended_defaults_if_beta_later_considered.first_price_eur -eq 119) $results
Assert-True "default beta size 3 to 5" ($json.recommended_defaults_if_beta_later_considered.first_beta_size -eq "3_to_5_customers_maximum") $results
Assert-True "default no auto renewal" ($json.recommended_defaults_if_beta_later_considered.auto_renewal -eq $false) $results
Assert-True "default no personal data" ($json.recommended_defaults_if_beta_later_considered.personal_data -eq "not_allowed") $results
Assert-True "default no marketplace" ($json.recommended_defaults_if_beta_later_considered.marketplace -eq "no_public_marketplace") $results
Assert-True "default no hosted MCP" ($json.recommended_defaults_if_beta_later_considered.hosted_public_mcp -eq "no_hosted_public_mcp") $results

foreach ($action in @(
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
)) {
  Assert-True "blocked action exists: $action" (@($json.blocked_actions) -contains $action) $results
}

Assert-True "markdown says one-line status" ($md -match "not commercially ready to take money") $results
Assert-True "markdown says continue preparation not activate" ($md -match "Continue preparing paid beta materials, but do not activate paid beta") $results
Assert-True "markdown has dashboard table" ($md -match "## Dashboard") $results
Assert-True "markdown says paid beta no-go" ($md -match "Paid beta activation: no-go") $results
Assert-True "markdown says commercial no-go" ($md -match "Commercial go-live: no-go") $results

$combined = "$md`n$jsonText"
foreach ($pattern in @(
  "paid beta approved",
  "paid beta is live",
  "commercial go-live approved",
  "real payments are active",
  "invoices are active",
  "production API keys approved",
  "marketplace publication allowed",
  "hosted public MCP live",
  "external outreach approved",
  "owner approval granted"
)) {
  Assert-True "no unsafe approval claim: $pattern" ($combined -notmatch [regex]::Escape($pattern)) $results
}

$failed = @($results | Where-Object { -not $_.passed })
$passedCount = @($results | Where-Object { $_.passed }).Count
$totalCount = $results.Count

$report = @()
$report += "# Owner Decision Dashboard Probe - 2026-06-18"
$report += ""
$report += "- Checks passed: $passedCount/$totalCount"
$report += "- Failed checks: $($failed.Count)"
$report += "- Decision: $(if ($failed.Count -eq 0) { "pass" } else { "fail" })"
$report += ""
foreach ($item in $results) {
  $mark = if ($item.passed) { "PASS" } else { "FAIL" }
  $report += "- [$mark] $($item.name)"
}
$report -join "`n" | Set-Content -Path $ReportPath -Encoding UTF8

[pscustomobject]@{
  generated_at = "2026-06-18"
  checks_passed = $passedCount
  checks_total = $totalCount
  failed_checks = @($failed | ForEach-Object { $_.name })
  decision = if ($failed.Count -eq 0) { "pass" } else { "fail" }
  next_safe_action = $json.next_safe_action
} | ConvertTo-Json -Depth 6 | Set-Content -Path $SummaryPath -Encoding UTF8

if ($failed.Count -gt 0) {
  throw "Probe failed with $($failed.Count) failed checks. See $ReportPath"
}

Write-Host "Probe passed: $passedCount/$totalCount checks"
