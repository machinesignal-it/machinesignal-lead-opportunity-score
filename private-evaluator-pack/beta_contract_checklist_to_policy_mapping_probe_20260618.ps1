$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent (Split-Path -Parent $PSCommandPath)
$MdPath = Join-Path $Root "private-evaluator-pack\beta_contract_checklist_to_policy_mapping_20260618.md"
$JsonPath = Join-Path $Root "private-evaluator-pack\beta_contract_checklist_to_policy_mapping_20260618.json"
$ChecklistPath = Join-Path $Root "private-evaluator-pack\final_owner_approval_checklist_v2_20260617.json"
$ReportPath = Join-Path $Root "private-evaluator-pack\beta_contract_checklist_to_policy_mapping_probe_report_20260618.md"
$SummaryPath = Join-Path $Root "private-evaluator-pack\beta_contract_checklist_to_policy_mapping_probe_summary_20260618.json"

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
$checklist = Get-Content -Raw -Path $ChecklistPath | ConvertFrom-Json

Assert-True "markdown exists" (Test-Path $MdPath) $results
Assert-True "json exists" (Test-Path $JsonPath) $results
Assert-True "mapping status is no-write not activated" ($json.status -eq "no_write_internal_mapping_not_signed_not_activated") $results
Assert-True "paid beta preparation go" ($json.decision.paid_beta_preparation -eq "go") $results
Assert-True "paid beta activation no-go" ($json.decision.paid_beta_activation -eq "no_go") $results
Assert-True "commercial go-live no-go" ($json.decision.commercial_go_live -eq "no_go") $results
Assert-True "fallback if missing is DO_NOT_ACTIVATE" ($json.decision.fallback_if_any_gate_missing -eq "DO_NOT_ACTIVATE") $results
Assert-True "master rule requires approved by owner" ($json.master_rule.required_final_value -eq "APPROVED BY OWNER") $results
Assert-True "final owner go/no-go still required" ($json.master_rule.final_owner_go_no_go_required_even_after_all_gates -eq $true) $results

$mappedGateIds = @($json.gate_to_policy_map.gate_id)
foreach ($gate in @(
  "owner_commercial_decision",
  "fiscal_admin_path",
  "invoice_receipt_process",
  "payment_mode",
  "payment_provider",
  "terms_of_service",
  "privacy_policy",
  "data_policy",
  "acceptable_use_policy",
  "product_catalog",
  "price_list",
  "credit_consumption_rule",
  "refund_replacement_rule",
  "production_api_key_policy",
  "customer_limit",
  "usage_caps",
  "cost_cap",
  "kill_switch",
  "support_policy",
  "incident_security_policy",
  "distribution_channel",
  "external_outreach"
)) {
  Assert-True "mapped gate exists: $gate" ($mappedGateIds -contains $gate) $results
}

$missingFields = @($json.gate_to_policy_map | Where-Object {
  [string]::IsNullOrWhiteSpace($_.policy_area) -or
  [string]::IsNullOrWhiteSpace($_.policy_section_needed) -or
  [string]::IsNullOrWhiteSpace($_.evidence_required) -or
  [string]::IsNullOrWhiteSpace($_.current_status) -or
  [string]::IsNullOrWhiteSpace($_.stop_rule)
})
Assert-True "all mapped gates have required fields" ($missingFields.Count -eq 0) $results

$approvedCurrent = @($json.gate_to_policy_map | Where-Object {
  $_.current_status -match "approved" -and $_.current_status -notmatch "not_approved"
})
Assert-True "no mapped gate is currently approved" ($approvedCurrent.Count -eq 0) $results

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
  Assert-True "policy structure includes: $policy" (@($json.policy_pack_structure_needed) -contains $policy) $results
}

foreach ($gap in @(
  "fiscal_admin_policy",
  "payment_and_invoice_policy",
  "terms_privacy_data_policy",
  "production_api_key_and_usage_cap_policy",
  "cost_cap_and_kill_switch_policy"
)) {
  Assert-True "first practical gap exists: $gap" (@($json.first_practical_gaps_to_close) -contains $gap) $results
}

$checklistGateIds = @($checklist.mandatory_gates.id)
foreach ($gate in $checklistGateIds) {
  if ($gate -eq "customer_and_usage_caps") {
    Assert-True "checklist gate customer_and_usage_caps mapped via customer_limit and usage_caps" (($mappedGateIds -contains "customer_limit") -and ($mappedGateIds -contains "usage_caps")) $results
  } elseif ($gate -eq "cost_cap_and_kill_switch") {
    Assert-True "checklist gate cost_cap_and_kill_switch mapped via cost_cap and kill_switch" (($mappedGateIds -contains "cost_cap") -and ($mappedGateIds -contains "kill_switch")) $results
  } elseif ($gate -eq "security_incident_policy") {
    Assert-True "checklist gate security_incident_policy mapped via incident_security_policy" ($mappedGateIds -contains "incident_security_policy") $results
  } elseif ($gate -eq "credit_refund_rules") {
    Assert-True "checklist gate credit_refund_rules mapped via credit and refund rules" (($mappedGateIds -contains "credit_consumption_rule") -and ($mappedGateIds -contains "refund_replacement_rule")) $results
  } else {
    Assert-True "checklist gate mapped: $gate" ($mappedGateIds -contains $gate) $results
  }
}

Assert-True "markdown states not approved" ($md -match "It does not approve paid beta") $results
Assert-True "markdown states no activation" ($md -match "It does not activate payments") $results
Assert-True "markdown has master rule" ($md -match "Master Rule") $results
Assert-True "markdown states DO_NOT_ACTIVATE" ($md -match "DO_NOT_ACTIVATE") $results
Assert-True "markdown next safe action is policy skeleton" ($md -match "Draft the policy pack skeleton") $results

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
  "external outreach approved"
)) {
  Assert-True "no unsafe approval claim: $pattern" ($combined -notmatch [regex]::Escape($pattern)) $results
}

$failed = @($results | Where-Object { -not $_.passed })
$passedCount = @($results | Where-Object { $_.passed }).Count
$totalCount = $results.Count

$report = @()
$report += "# Beta Contract Checklist-To-Policy Mapping Probe - 2026-06-18"
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
