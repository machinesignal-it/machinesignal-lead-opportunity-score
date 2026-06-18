$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent (Split-Path -Parent $PSCommandPath)
$MdPath = Join-Path $Root "private-evaluator-pack\short_draft_policy_sections_nowrite_20260618.md"
$JsonPath = Join-Path $Root "private-evaluator-pack\short_draft_policy_sections_nowrite_20260618.json"
$ReportPath = Join-Path $Root "private-evaluator-pack\short_draft_policy_sections_nowrite_probe_report_20260618.md"
$SummaryPath = Join-Path $Root "private-evaluator-pack\short_draft_policy_sections_nowrite_probe_summary_20260618.json"

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
Assert-True "status is no-write not approval not activated" ($json.status -eq "short_draft_sections_no_write_not_legal_fiscal_owner_approval_not_activated") $results
Assert-True "paid beta preparation go" ($json.decision.paid_beta_preparation -eq "go") $results
Assert-True "paid beta activation no-go" ($json.decision.paid_beta_activation -eq "no_go") $results
Assert-True "commercial go-live no-go" ($json.decision.commercial_go_live -eq "no_go") $results
Assert-True "fallback is DO_NOT_ACTIVATE" ($json.decision.fallback -eq "DO_NOT_ACTIVATE") $results

$sectionIds = @($json.sections.id)
foreach ($section in @(
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
  Assert-True "section exists: $section" ($sectionIds -contains $section) $results
}

Assert-True "exactly 14 sections" ($json.sections.Count -eq 14) $results

$invalidSections = @($json.sections | Where-Object {
  [string]::IsNullOrWhiteSpace($_.draft_rule) -or
  [string]::IsNullOrWhiteSpace($_.current_state) -or
  [string]::IsNullOrWhiteSpace($_.stop_rule)
})
Assert-True "all sections have draft rule state and stop rule" ($invalidSections.Count -eq 0) $results

$approvedSections = @($json.sections | Where-Object {
  $_.current_state -match "approved" -and $_.current_state -notmatch "not_approved"
})
Assert-True "no section is currently approved" ($approvedSections.Count -eq 0) $results

Assert-True "privacy blocks personal emails" ((($json.sections | Where-Object { $_.id -eq "privacy_and_data_policy" }).blocked_now) -contains "personal_emails") $results
Assert-True "payment blocks live checkout" ((($json.sections | Where-Object { $_.id -eq "payment_and_invoice_policy" }).blocked_now) -contains "live_checkout") $results
Assert-True "distribution blocks outreach" ((($json.sections | Where-Object { $_.id -eq "distribution_and_no_outreach_policy" }).blocked_now) -contains "outreach_to_people_or_companies") $results
Assert-True "product first assumption is Score Pack 1k" ((($json.sections | Where-Object { $_.id -eq "product_and_listino_policy" }).current_first_product_assumption.product) -eq "score_pack_1k") $results
Assert-True "product first price 119" ((($json.sections | Where-Object { $_.id -eq "product_and_listino_policy" }).current_first_product_assumption.price_eur) -eq 119) $results
Assert-True "customer cap is 3 to 5" ((($json.sections | Where-Object { $_.id -eq "customer_and_usage_cap_policy" }).recommended_first_cap) -eq "3_to_5_beta_customers_score_pack_1k_first_no_auto_renewal") $results
Assert-True "refund recommends replacement credits first" ((($json.sections | Where-Object { $_.id -eq "credit_refund_replacement_policy" }).recommended_beta_rule) -eq "replacement_credits_first_cash_refunds_only_by_explicit_owner_approval") $results

foreach ($priority in @(
  "fiscal_admin",
  "payment_and_invoice",
  "terms_privacy_data",
  "production_key_and_usage_caps",
  "cost_cap_and_kill_switch"
)) {
  Assert-True "priority includes: $priority" (@($json.current_priority) -contains $priority) $results
}

Assert-True "markdown states not legal fiscal approval" ($md -match "not legal/fiscal approval") $results
Assert-True "markdown states does not activate payments" ($md -match "does not activate payments") $results
Assert-True "markdown has master rule" ($md -match "Master Rule") $results
Assert-True "markdown contains all 14 numbered sections" (($md -split "## ").Count -ge 16) $results
Assert-True "markdown final decision beta no-go" ($md -match "Paid beta activation: no-go") $results
Assert-True "markdown next action owner review packet" ($md -match "compact owner-review packet") $results

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
$report += "# Short Draft Policy Sections No-Write Probe - 2026-06-18"
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
