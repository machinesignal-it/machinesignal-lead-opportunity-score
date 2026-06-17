$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent (Split-Path -Parent $PSCommandPath)
$MdPath = Join-Path $Root "private-evaluator-pack\final_owner_approval_checklist_v2_20260617.md"
$JsonPath = Join-Path $Root "private-evaluator-pack\final_owner_approval_checklist_v2_20260617.json"
$ReportPath = Join-Path $Root "private-evaluator-pack\final_owner_approval_checklist_v2_probe_report_20260617.md"
$SummaryPath = Join-Path $Root "private-evaluator-pack\final_owner_approval_checklist_v2_probe_summary_20260617.json"

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
Assert-True "status is draft not signed not activated" ($json.status -eq "draft_not_signed_not_activated") $results
Assert-True "recommended decision is prepare not activate" ($json.recommended_decision_today -eq "prepare_paid_beta_do_not_activate") $results
Assert-True "technical sandbox complete" ($json.current_decision.technical_sandbox -eq "complete_for_current_scope") $results
Assert-True "advisor gate complete" ($json.current_decision.advisor_gate_setup -eq "complete_for_current_scope") $results
Assert-True "paid beta preparation go" ($json.current_decision.paid_beta_preparation -eq "go") $results
Assert-True "paid beta activation no-go" ($json.current_decision.paid_beta_activation -eq "no_go") $results
Assert-True "commercial go-live no-go" ($json.current_decision.commercial_go_live -eq "no_go") $results
Assert-True "master rule requires APPROVED BY OWNER" ($json.master_activation_rule.required_value_for_every_mandatory_gate -eq "APPROVED BY OWNER") $results
Assert-True "fallback is do not activate" ($json.master_activation_rule.fallback_decision -eq "DO_NOT_ACTIVATE") $results

$gateIds = @($json.mandatory_gates.id)
foreach ($gate in @(
  "owner_commercial_decision",
  "fiscal_admin_path",
  "invoice_receipt_process",
  "payment_mode",
  "terms_of_service",
  "privacy_policy",
  "data_policy",
  "product_catalog",
  "price_list",
  "credit_refund_rules",
  "production_api_key_policy",
  "customer_and_usage_caps",
  "cost_cap_and_kill_switch",
  "support_policy",
  "security_incident_policy",
  "distribution_channel",
  "external_outreach"
)) {
  Assert-True "mandatory gate exists: $gate" ($gateIds -contains $gate) $results
}

$approvedGates = @($json.mandatory_gates | Where-Object { $_.current_status -match "approved" -and $_.current_status -notmatch "not_approved" })
Assert-True "no mandatory gate currently approved" ($approvedGates.Count -eq 0) $results

$signatureValues = @()
$json.signature_fields.PSObject.Properties | ForEach-Object { $signatureValues += $_.Value }
Assert-True "all signature fields not signed" (($signatureValues | Where-Object { $_ -ne "not_signed" }).Count -eq 0) $results

foreach ($stop in @(
  "payment_action",
  "invoice_action",
  "payment_method_collection",
  "production_api_key",
  "real_customer_dataset",
  "personal_data",
  "external_contact",
  "public_marketplace_publication",
  "hosted_public_mcp",
  "mcp_registry_submission"
)) {
  Assert-True "agents stop before: $stop" (@($json.agents_must_stop_before) -contains $stop) $results
}

Assert-True "markdown has master activation rule" ($md -match "Master Activation Rule") $results
Assert-True "markdown says DO NOT ACTIVATE fallback" ($md -match "DO NOT ACTIVATE") $results
Assert-True "markdown says paid beta activation no-go" ($md -match "Paid beta activation \\| No-go") $results
Assert-True "markdown says commercial go-live no-go" ($md -match "Commercial go-live \\| No-go") $results
Assert-True "markdown says fields intentionally blank" ($md -match "These fields are intentionally blank") $results
Assert-True "markdown next safe action is no-write" ($md -match "no-write beta contract pack") $results

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
  Assert-True "no unsafe approval claim: $pattern" ($combined -notmatch [regex]::Escape($pattern)) $results
}

$failed = @($results | Where-Object { -not $_.passed })
$passedCount = @($results | Where-Object { $_.passed }).Count
$totalCount = $results.Count

$report = @()
$report += "# Final Owner Approval Checklist v2 Probe - 2026-06-17"
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
