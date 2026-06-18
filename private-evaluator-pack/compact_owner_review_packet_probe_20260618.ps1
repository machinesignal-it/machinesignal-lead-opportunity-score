$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent (Split-Path -Parent $PSCommandPath)
$MdPath = Join-Path $Root "private-evaluator-pack\compact_owner_review_packet_unresolved_policy_questions_20260618.md"
$JsonPath = Join-Path $Root "private-evaluator-pack\compact_owner_review_packet_unresolved_policy_questions_20260618.json"
$ReportPath = Join-Path $Root "private-evaluator-pack\compact_owner_review_packet_probe_report_20260618.md"
$SummaryPath = Join-Path $Root "private-evaluator-pack\compact_owner_review_packet_probe_summary_20260618.json"

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
Assert-True "status is owner review no-write not activated" ($json.status -eq "compact_owner_review_packet_no_write_not_signed_not_activated") $results
Assert-True "paid beta preparation go" ($json.decision_today.paid_beta_preparation -eq "go") $results
Assert-True "paid beta activation no-go" ($json.decision_today.paid_beta_activation -eq "no_go") $results
Assert-True "commercial go-live no-go" ($json.decision_today.commercial_go_live -eq "no_go") $results
Assert-True "minimal decision is prepare not activate" ($json.decision_today.recommended_minimal_decision -eq "continue_preparing_paid_beta_materials_but_do_not_activate_paid_beta") $results
Assert-True "technical sandbox complete" ($json.current_summary.technical_sandbox -eq "complete_for_current_scope") $results
Assert-True "advisor gate complete" ($json.current_summary.advisor_gate -eq "complete_for_current_scope") $results

$decisionIds = @($json.unresolved_owner_decisions.id)
foreach ($decision in @(
  "prepare_controlled_paid_beta",
  "fiscal_admin_setup",
  "payment_invoice_path",
  "terms_privacy_data",
  "product_and_listino",
  "credit_refund_replacement",
  "production_api_keys",
  "beta_customer_usage_caps",
  "cost_cap_kill_switch",
  "support_escalation",
  "security_incident",
  "distribution_no_outreach"
)) {
  Assert-True "unresolved decision exists: $decision" ($decisionIds -contains $decision) $results
}

Assert-True "exactly 12 unresolved decisions" ($json.unresolved_owner_decisions.Count -eq 12) $results

$missingQuestionOrBlock = @($json.unresolved_owner_decisions | Where-Object {
  [string]::IsNullOrWhiteSpace($_.question) -or
  [string]::IsNullOrWhiteSpace($_.current_block)
})
Assert-True "all decisions include question and current block" ($missingQuestionOrBlock.Count -eq 0) $results

foreach ($blockedAction in @(
  "activate_paid_beta",
  "execute_real_payment",
  "issue_invoice",
  "collect_payment_method",
  "issue_production_api_key",
  "process_real_customer_dataset",
  "process_personal_data",
  "send_external_outreach",
  "publish_marketplace",
  "launch_hosted_public_mcp",
  "submit_mcp_registry"
)) {
  Assert-True "agents must not do: $blockedAction" (@($json.agents_must_not_do) -contains $blockedAction) $results
}

foreach ($sequence in @(
  "decide_continue_preparing_paid_beta_or_remain_sandbox_only",
  "resolve_fiscal_admin_path",
  "resolve_payment_invoice_path",
  "resolve_terms_privacy_data_path",
  "approve_or_reject_score_pack_1k_as_first_paid_beta_product",
  "approve_production_key_and_usage_caps",
  "approve_cost_cap_and_kill_switch",
  "approve_support_escalation_model",
  "decide_distribution_no_outreach_boundaries",
  "sign_final_owner_approval_only_if_all_gates_are_ready"
)) {
  Assert-True "recommended sequence includes: $sequence" (@($json.recommended_owner_sequence) -contains $sequence) $results
}

Assert-True "markdown says does not approve paid beta" ($md -match "It does not approve paid beta") $results
Assert-True "markdown says does not activate payments" ($md -match "It does not activate payments") $results
Assert-True "markdown says minimal decision continue prepare but not activate" ($md -match "Continue preparing paid beta materials, but do not activate paid beta") $results
Assert-True "markdown next action dashboard" ($md -match "owner decision dashboard") $results
Assert-True "markdown no-go paid beta" ($md -match "Paid beta activation: no-go") $results

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
$report += "# Compact Owner Review Packet Probe - 2026-06-18"
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
