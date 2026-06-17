$ErrorActionPreference = "Stop"

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$mdPath = Join-Path $root "private-evaluator-pack\owner_paid_beta_activation_checklist_20260617.md"
$jsonPath = Join-Path $root "private-evaluator-pack\owner_paid_beta_activation_checklist_20260617.json"
$reportPath = Join-Path $root "private-evaluator-pack\owner_paid_beta_activation_checklist_probe_report_20260617.md"
$summaryPath = Join-Path $root "private-evaluator-pack\owner_paid_beta_activation_checklist_probe_summary_20260617.json"

$checks = New-Object System.Collections.Generic.List[object]

function Add-Check {
  param([string]$Name, [bool]$Passed, [string]$Detail)
  $checks.Add([pscustomobject]@{
    name = $Name
    passed = $Passed
    detail = $Detail
  })
}

Add-Check "markdown_exists" (Test-Path $mdPath) $mdPath
Add-Check "json_exists" (Test-Path $jsonPath) $jsonPath

$md = Get-Content -Raw -LiteralPath $mdPath
$json = Get-Content -Raw -LiteralPath $jsonPath | ConvertFrom-Json

$requiredPhrases = @(
  "It does not approve paid beta.",
  "Paid beta activation: no-go.",
  "Commercial go-live: no-go.",
  "If one critical item is missing, the decision remains: do not activate.",
  "Owner approval: not signed.",
  "Next safe action: keep preparing approval materials"
)

foreach ($phrase in $requiredPhrases) {
  Add-Check "markdown_contains_$($phrase.Replace(' ', '_').Replace(':', '').Replace('.', ''))" ($md.Contains($phrase)) $phrase
}

$requiredCriticalItems = @(
  "owner_decision",
  "fiscal_admin",
  "vat_piva_invoicing",
  "legal_terms",
  "privacy_data",
  "payment_provider",
  "refund_credit",
  "product_catalog",
  "price_list",
  "production_api_keys",
  "real_data",
  "personal_data",
  "support",
  "sla_liability",
  "cost_caps",
  "kill_switch",
  "security",
  "distribution",
  "marketplace_mcp"
)

foreach ($item in $requiredCriticalItems) {
  Add-Check "json_critical_$item" ($json.critical_items -contains $item) $item
}

Add-Check "json_paid_beta_no_go" ($json.paid_beta_activation_decision -eq "no_go") $json.paid_beta_activation_decision
Add-Check "json_commercial_no_go" ($json.commercial_go_live_decision -eq "no_go") $json.commercial_go_live_decision
Add-Check "json_default_not_approved" ($json.critical_item_status_default -eq "not_approved") $json.critical_item_status_default

$requiredNoGo = @(
  "fiscal_admin_path_unclear",
  "live_payment_provider_not_approved",
  "invoice_process_unclear",
  "terms_privacy_data_policy_not_approved",
  "production_keys_not_governed",
  "customer_data_rules_unclear",
  "cost_caps_missing",
  "kill_switch_owner_missing",
  "support_process_unclear",
  "marketplace_or_mcp_without_explicit_approval"
)

foreach ($item in $requiredNoGo) {
  Add-Check "json_no_go_$item" ($json.no_go_conditions -contains $item) $item
}

$signatureNames = @(
  "owner_approval",
  "fiscal_admin_approval",
  "legal_privacy_approval",
  "payment_approval",
  "data_approval",
  "support_approval",
  "cost_kill_switch_approval",
  "distribution_approval"
)

foreach ($name in $signatureNames) {
  Add-Check "json_signature_$name" ($json.signature_fields.$name -eq "not_signed") "$name=$($json.signature_fields.$name)"
}

$failed = @($checks | Where-Object { -not $_.passed })
$status = if ($failed.Count -eq 0) { "PASSED" } else { "FAILED" }

$summary = [pscustomobject]@{
  date = "2026-06-17"
  status = $status
  checks = $checks.Count
  failed = $failed.Count
  decision = "paid_beta_activation_no_go_until_all_owner_approvals_signed"
  next_safe_action = "prepare_approval_materials_without_activation"
}

$report = @(
  "# Owner Paid Beta Activation Checklist - Probe Report"
  ""
  "- Date: 2026-06-17"
  "- Status: $status"
  "- Checks: $($checks.Count)"
  "- Failed: $($failed.Count)"
  ""
  "## Result"
  ""
  "The owner checklist is complete as a final approval gate. It keeps paid beta activation and commercial go-live at no-go until every critical owner approval is explicitly signed."
) -join "`n"

Set-Content -LiteralPath $reportPath -Value $report -Encoding UTF8
Set-Content -LiteralPath $summaryPath -Value ($summary | ConvertTo-Json -Depth 5) -Encoding UTF8

if ($failed.Count -gt 0) {
  $failed | Format-Table -AutoSize | Out-String | Write-Host
  throw "Owner paid beta activation checklist probe failed."
}

Write-Host $report
