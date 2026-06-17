$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent (Split-Path -Parent $PSCommandPath)
$MdPath = Join-Path $Root "private-evaluator-pack\nowrite_beta_contract_pack_and_pnl_delta_20260617.md"
$JsonPath = Join-Path $Root "private-evaluator-pack\nowrite_beta_contract_pack_and_pnl_delta_20260617.json"
$ReportPath = Join-Path $Root "private-evaluator-pack\nowrite_beta_contract_pack_and_pnl_delta_probe_report_20260617.md"
$SummaryPath = Join-Path $Root "private-evaluator-pack\nowrite_beta_contract_pack_and_pnl_delta_probe_summary_20260617.json"

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
Assert-True "status is no-write not activation" ($json.status -eq "internal_draft_nowrite_not_activation") $results
Assert-True "recommended decision prepare not activate" ($json.recommended_decision -eq "prepare_controlled_paid_beta_do_not_activate") $results
Assert-True "technical sandbox complete" ($json.current_gate.technical_sandbox -eq "complete_for_current_scope") $results
Assert-True "advisor gate complete" ($json.current_gate.advisor_gate_setup -eq "complete_for_current_scope") $results
Assert-True "paid beta preparation go" ($json.current_gate.paid_beta_preparation -eq "go") $results
Assert-True "paid beta activation no-go" ($json.current_gate.paid_beta_activation -eq "no_go") $results
Assert-True "commercial go-live no-go" ($json.current_gate.commercial_go_live -eq "no_go") $results

Assert-True "contract has no legal approval" ($json.contract_pack.legal_approval -eq $false) $results
Assert-True "contract has no fiscal approval" ($json.contract_pack.fiscal_approval -eq $false) $results
Assert-True "contract has no activation" ($json.contract_pack.activation -eq $false) $results
Assert-True "provider legal entity to be confirmed" ($json.contract_pack.provider_legal_entity -eq "to_be_confirmed") $results
Assert-True "machine interface recognizes responsible legal person" ($json.contract_pack.customer_interface -match "responsible_legal_person") $results
Assert-True "credit rule is valid output only" ($json.contract_pack.credit_rule -eq "credits_are_consumed_only_when_valid_usable_output_is_produced") $results

$blocked = @($json.contract_pack.blocked_until_future_approval)
foreach ($action in @(
  "real_payments",
  "invoices",
  "payment_method_collection",
  "production_api_keys",
  "real_customer_datasets",
  "personal_data",
  "external_outreach",
  "marketplace_publication",
  "hosted_public_mcp",
  "mcp_registry_submission"
)) {
  Assert-True "blocked until future approval: $action" ($blocked -contains $action) $results
}

$pnl = $json.pnl_paid_beta_delta
Assert-True "P&L records no revenue" ($pnl.records_revenue -eq $false) $results
Assert-True "P&L is model only" ($pnl.models_possible_beta_economics_only -eq $true) $results
Assert-True "recommended first product Score Pack 1k" ($pnl.recommended_first_product -eq "score_pack_1k") $results
Assert-True "reference price 119" ($pnl.reference_price_eur -eq 119) $results
Assert-True "variable cost total 35" ($pnl.estimated_variable_cost_per_pack_eur.total -eq 35) $results
Assert-True "contribution is 84" ($pnl.estimated_contribution_per_pack_eur -eq 84) $results
Assert-True "margin percent about 71" ($pnl.estimated_contribution_margin_percent -eq 71) $results
Assert-True "break-even pack estimate 3" ($pnl.break_even_packs_estimate -eq 3) $results

foreach ($scenario in $pnl.tiny_beta_scenarios) {
  $expectedRevenue = [int]$scenario.beta_customers * [int]$scenario.packs_per_customer * [int]$pnl.reference_price_eur
  $expectedCost = [int]$scenario.beta_customers * [int]$scenario.packs_per_customer * [int]$pnl.estimated_variable_cost_per_pack_eur.total
  $expectedContribution = $expectedRevenue - $expectedCost
  Assert-True "scenario revenue coherent: $($scenario.scenario)" ($scenario.revenue_eur -eq $expectedRevenue) $results
  Assert-True "scenario variable cost coherent: $($scenario.scenario)" ($scenario.variable_cost_eur -eq $expectedCost) $results
  Assert-True "scenario contribution coherent: $($scenario.scenario)" ($scenario.contribution_eur -eq $expectedContribution) $results
}

Assert-True "recommended cap 3 to 5 customers" ($pnl.recommended_first_cap.max_beta_customers -eq "3_to_5") $results
Assert-True "auto renewal false" ($pnl.recommended_first_cap.auto_renewal -eq $false) $results
Assert-True "manual production key approval only" ($pnl.recommended_first_cap.production_key_manual_approval_only -eq $true) $results
Assert-True "hard monthly cost cap required" ($pnl.recommended_first_cap.hard_monthly_beta_cost_cap_required -eq $true) $results
Assert-True "personal data not allowed" ($pnl.recommended_first_cap.personal_data -eq "not_allowed") $results

foreach ($condition in @(
  "heavy_manual_support_required",
  "uncontrolled_real_data_processing",
  "uncapped_external_data_calls",
  "public_marketplace_demand_spike",
  "uncapped_cloudflare_or_kv_writes",
  "custom_work_hidden_inside_low_price_packs",
  "refunds_beyond_replacement_credit_logic"
)) {
  Assert-True "risk stop condition exists: $condition" (@($json.risk_stop_conditions) -contains $condition) $results
}

Assert-True "markdown states no-write" ($md -match "no-write") $results
Assert-True "markdown says not activation" ($md -match "not activation") $results
Assert-True "markdown says paid beta activation no-go" ($md -match "Paid beta activation \\| No-go") $results
Assert-True "markdown says commercial go-live no-go" ($md -match "Commercial go-live \\| No-go") $results
Assert-True "markdown contains contribution calculation" ($md -match "Revenue 119 - variable cost 35 = contribution 84 EUR") $results
Assert-True "markdown contains break-even view" ($md -match "Break-Even View") $results
Assert-True "markdown next action avoids activation" ($md -match "without activating payments") $results

$combined = "$md`n$jsonText"
foreach ($pattern in @(
  "paid beta approved",
  "paid beta is live",
  "commercial go-live approved",
  "real payments are active",
  "invoices are active",
  "production API keys approved",
  "marketplace publication allowed",
  "hosted public MCP live"
)) {
  Assert-True "no unsafe activation claim: $pattern" ($combined -notmatch [regex]::Escape($pattern)) $results
}

$failed = @($results | Where-Object { -not $_.passed })
$passedCount = @($results | Where-Object { $_.passed }).Count
$totalCount = $results.Count

$report = @()
$report += "# No-Write Beta Contract Pack + P&L Delta Probe - 2026-06-17"
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
  generated_at = "2026-06-17"
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
