$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent (Split-Path -Parent $PSCommandPath)
$MdPath = Join-Path $Root "private-evaluator-pack\paid_beta_owner_decision_pack_v2_20260617.md"
$JsonPath = Join-Path $Root "private-evaluator-pack\paid_beta_owner_decision_pack_v2_20260617.json"
$ReportPath = Join-Path $Root "private-evaluator-pack\paid_beta_owner_decision_pack_v2_probe_report_20260617.md"
$SummaryPath = Join-Path $Root "private-evaluator-pack\paid_beta_owner_decision_pack_v2_probe_summary_20260617.json"

function Assert-True($Name, $Condition, [System.Collections.Generic.List[object]]$Results) {
  $Results.Add([pscustomobject]@{
    name = $Name
    passed = [bool]$Condition
  })
}

$results = [System.Collections.Generic.List[object]]::new()
$md = Get-Content -Raw -Path $MdPath
$json = Get-Content -Raw -Path $JsonPath | ConvertFrom-Json

Assert-True "markdown exists" (Test-Path $MdPath) $results
Assert-True "json exists" (Test-Path $JsonPath) $results
Assert-True "json status is not activation" ($json.status -eq "owner_decision_pack_not_activation") $results
Assert-True "technical sandbox complete" ($json.current_decision.technical_sandbox -eq "complete_for_current_scope") $results
Assert-True "advisor gate complete" ($json.current_decision.advisor_gate_setup -eq "complete_for_current_scope") $results
Assert-True "recommended option is preparation only" ($json.current_decision.recommended_option -eq "prepare_controlled_paid_beta_do_not_activate") $results
Assert-True "paid beta preparation go" ($json.current_decision.paid_beta_preparation -eq "go") $results
Assert-True "paid beta activation no-go" ($json.current_decision.paid_beta_activation -eq "no_go") $results
Assert-True "commercial go-live no-go" ($json.current_decision.commercial_go_live -eq "no_go") $results

Assert-True "probe evidence 62/62 present" ($json.evidence.internal_docs_api_examples_refinement_probe.checks_passed -eq 62 -and $json.evidence.internal_docs_api_examples_refinement_probe.checks_total -eq 62) $results
Assert-True "Company Brain evidence 44/44 present" ($json.evidence.company_brain_alignment_probe.checks_passed -eq 44 -and $json.evidence.company_brain_alignment_probe.checks_total -eq 44) $results
Assert-True "advisor gate evidence zero hard block violations" ($json.evidence.advisor_gate_rehearsal.hard_block_violations -eq 0) $results
Assert-True "advisor gate evidence zero unexpected allows" ($json.evidence.advisor_gate_rehearsal.unexpected_allows -eq 0) $results

$conditions = @($json.minimum_conditions_before_activation)
foreach ($condition in @(
  "fiscal_admin_readiness_approved",
  "legal_privacy_readiness_approved",
  "payment_and_invoice_path_approved",
  "production_api_key_policy_approved",
  "real_data_and_personal_data_policy_approved",
  "owner_final_go_no_go_signed"
)) {
  Assert-True "minimum condition exists: $condition" ($conditions -contains $condition) $results
}

$blocked = @($json.blocked_actions)
foreach ($action in @(
  "activate_real_payments",
  "issue_invoices",
  "collect_payment_methods",
  "issue_production_api_keys",
  "process_real_customer_lists",
  "process_personal_data",
  "send_outreach_or_emails_to_external_people",
  "contact_companies_or_prospects",
  "publish_to_paid_marketplaces",
  "launch_hosted_public_mcp",
  "submit_to_mcp_registry",
  "claim_legal_privacy_or_fiscal_approval"
)) {
  Assert-True "blocked action exists: $action" ($blocked -contains $action) $results
}

Assert-True "markdown says not activation" ($md -match "not an activation") $results
Assert-True "markdown recommends Option B" ($md -match "Proceed with Option B") $results
Assert-True "markdown blocks paid beta activation" ($md -match "Paid beta activation.*No-go") $results
Assert-True "markdown blocks real payments" ($md -match "Real payments.*No-go") $results
Assert-True "markdown blocks invoices" ($md -match "Invoices.*No-go") $results
Assert-True "markdown blocks production API keys" ($md -match "Production API keys.*No-go") $results
Assert-True "markdown blocks external outreach" ($md -match "External outreach.*No-go") $results

$combined = "$md`n$(Get-Content -Raw -Path $JsonPath)"
foreach ($pattern in @(
  "paid beta is live",
  "paid beta approved",
  "commercial go-live approved",
  "real payments are active",
  "invoices are active",
  "production keys are available",
  "marketplace publication allowed",
  "hosted public MCP live"
)) {
  Assert-True "no unsafe activation claim: $pattern" ($combined -notmatch [regex]::Escape($pattern)) $results
}

$failed = @($results | Where-Object { -not $_.passed })
$passedCount = @($results | Where-Object { $_.passed }).Count
$totalCount = $results.Count

$report = @()
$report += "# Paid Beta Owner Decision Pack v2 Probe - 2026-06-17"
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
  recommended_next_step = $json.recommended_next_step
} | ConvertTo-Json -Depth 6 | Set-Content -Path $SummaryPath -Encoding UTF8

if ($failed.Count -gt 0) {
  throw "Probe failed with $($failed.Count) failed checks. See $ReportPath"
}

Write-Host "Probe passed: $passedCount/$totalCount checks"
