$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent (Split-Path -Parent $PSCommandPath)
$MdPath = Join-Path $Root "private-evaluator-pack\policy_pack_skeleton_nowrite_20260618.md"
$JsonPath = Join-Path $Root "private-evaluator-pack\policy_pack_skeleton_nowrite_20260618.json"
$ReportPath = Join-Path $Root "private-evaluator-pack\policy_pack_skeleton_nowrite_probe_report_20260618.md"
$SummaryPath = Join-Path $Root "private-evaluator-pack\policy_pack_skeleton_nowrite_probe_summary_20260618.json"

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
Assert-True "status is skeleton no-write not activated" ($json.status -eq "skeleton_draft_no_write_not_signed_not_activated") $results
Assert-True "paid beta preparation go" ($json.decision.paid_beta_preparation -eq "go") $results
Assert-True "paid beta activation no-go" ($json.decision.paid_beta_activation -eq "no_go") $results
Assert-True "commercial go-live no-go" ($json.decision.commercial_go_live -eq "no_go") $results
Assert-True "fallback is DO_NOT_ACTIVATE" ($json.decision.fallback -eq "DO_NOT_ACTIVATE") $results
Assert-True "required final value APPROVED BY OWNER" ($json.master_rule.required_final_value -eq "APPROVED BY OWNER") $results
Assert-True "master rule blocks until policies approved" ($json.master_rule.paid_beta_remains_blocked_until_every_mandatory_policy_is_completed_reviewed_and_owner_approved -eq $true) $results

$policyIds = @($json.policies.id)
foreach ($policy in @(
  "owner_approval_policy",
  "fiscal_admin_policy",
  "payment_and_invoice_policy",
  "terms_of_service_draft",
  "privacy_and_data_policy",
  "acceptable_use_policy",
  "product_and_listino_policy",
  "credit_refund_replacement_policy",
  "production_api_key_and_access_policy",
  "customer_and_usage_cap_policy",
  "cost_cap_and_kill_switch_policy",
  "support_and_escalation_policy",
  "security_and_incident_policy",
  "distribution_and_no_outreach_policy"
)) {
  Assert-True "policy exists: $policy" ($policyIds -contains $policy) $results
}

Assert-True "exactly 14 policies" ($json.policies.Count -eq 14) $results

$invalidPolicies = @($json.policies | Where-Object {
  $_.status -ne "skeleton_only" -or
  [string]::IsNullOrWhiteSpace($_.purpose) -or
  @($_.must_include).Count -lt 5 -or
  [string]::IsNullOrWhiteSpace($_.evidence_required) -or
  [string]::IsNullOrWhiteSpace($_.stop_rule_if_missing)
})
Assert-True "all policies have skeleton status and required fields" ($invalidPolicies.Count -eq 0) $results

foreach ($gap in @(
  "fiscal_admin_policy",
  "payment_and_invoice_policy",
  "terms_privacy_data_policy",
  "production_api_key_and_usage_cap_policy",
  "cost_cap_and_kill_switch_policy"
)) {
  Assert-True "current gap priority includes: $gap" (@($json.current_gap_priority) -contains $gap) $results
}

Assert-True "privacy policy default is synthetic or non-personal only" (($json.policies | Where-Object { $_.id -eq "privacy_and_data_policy" }).current_default -eq "synthetic_or_non_personal_sandbox_test_data_only") $results
Assert-True "refund policy recommends replacement credits first" (($json.policies | Where-Object { $_.id -eq "credit_refund_replacement_policy" }).recommended_current_draft -eq "replacement_credits_first_cash_refunds_only_by_explicit_owner_approval") $results
Assert-True "customer cap recommends 3 to 5" (($json.policies | Where-Object { $_.id -eq "customer_and_usage_cap_policy" }).recommended_first_cap -eq "3_to_5_beta_customers_score_pack_1k_first_no_auto_renewal") $results

Assert-True "markdown says not legal document" ($md -match "It is not a legal document") $results
Assert-True "markdown says not fiscal approval" ($md -match "It is not fiscal approval") $results
Assert-True "markdown says not owner approval" ($md -match "It is not owner approval") $results
Assert-True "markdown says does not activate payments" ($md -match "does not activate payments") $results
Assert-True "markdown has 14th policy" ($md -match "Policy 14 - Distribution And No-Outreach Policy") $results
Assert-True "markdown next action no-write" ($md -match "still no-write") $results

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
$report += "# Policy Pack Skeleton No-Write Probe - 2026-06-18"
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
