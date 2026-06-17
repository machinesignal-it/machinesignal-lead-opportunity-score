$ErrorActionPreference = "Stop"

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$mdPath = Join-Path $root "private-evaluator-pack\controlled_paid_beta_policy_pack_20260617.md"
$jsonPath = Join-Path $root "private-evaluator-pack\controlled_paid_beta_policy_pack_20260617.json"
$reportPath = Join-Path $root "private-evaluator-pack\controlled_paid_beta_policy_pack_probe_report_20260617.md"
$summaryPath = Join-Path $root "private-evaluator-pack\controlled_paid_beta_policy_pack_probe_summary_20260617.json"

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

$requiredPolicies = @(
  "Policy 1 - Beta Terms Draft",
  "Policy 2 - Credit And Refund Policy Draft",
  "Policy 3 - Data Handling Policy Draft",
  "Policy 4 - Production API Key Policy Summary",
  "Policy 5 - Support Policy Summary",
  "Policy 6 - Cost Cap And Kill Switch Policy Summary"
)

foreach ($policy in $requiredPolicies) {
  Add-Check "markdown_has_$($policy.Replace(' ', '_'))" ($md.Contains($policy)) $policy
}

$requiredBlocks = @(
  "Paid beta activation: blocked",
  "Commercial go-live: blocked",
  "Real payments: blocked",
  "Production API keys: blocked",
  "Real and personal data: blocked",
  "External outreach: blocked",
  "Public marketplace or hosted MCP: blocked"
)

foreach ($block in $requiredBlocks) {
  Add-Check "markdown_blocks_$($block.Replace(' ', '_').Replace(':', ''))" ($md.Contains($block)) $block
}

$requiredJsonBlocks = @{
  paid_beta_activation = "blocked"
  commercial_go_live = "blocked"
  real_payments = "blocked"
  production_api_keys = "blocked"
  real_customer_data = "blocked"
  personal_data = "blocked"
  external_outreach = "blocked"
  public_marketplace_or_hosted_mcp = "blocked"
}

foreach ($key in $requiredJsonBlocks.Keys) {
  Add-Check "json_$key" ($json.$key -eq $requiredJsonBlocks[$key]) "$key=$($json.$key)"
}

$policyNames = @($json.policies | ForEach-Object { $_.name })
$expectedPolicyNames = @(
  "beta_terms_draft",
  "credit_and_refund_policy_draft",
  "data_handling_policy_draft",
  "production_api_key_policy_summary",
  "support_policy_summary",
  "cost_cap_and_kill_switch_policy_summary"
)

foreach ($name in $expectedPolicyNames) {
  Add-Check "json_policy_$name" ($policyNames -contains $name) $name
}

$requiredEscalations = @(
  "paid_beta_activation",
  "payment_or_invoice_request",
  "production_api_key_request",
  "real_or_personal_data_request",
  "legal_privacy_dpa_sla_request",
  "suspected_secret_exposure",
  "marketplace_or_hosted_mcp_publication"
)

foreach ($item in $requiredEscalations) {
  Add-Check "json_escalates_$item" ($json.owner_escalation_required_for -contains $item) $item
}

Add-Check "next_step_owner_checklist" ($json.next_step -eq "create_owner_approval_checklist_final_gate") $json.next_step

$failed = @($checks | Where-Object { -not $_.passed })
$status = if ($failed.Count -eq 0) { "PASSED" } else { "FAILED" }

$summary = [pscustomobject]@{
  date = "2026-06-17"
  status = $status
  checks = $checks.Count
  failed = $failed.Count
  decision = "policy_pack_draft_ready_activation_blocked"
  next_step = "create_owner_approval_checklist_final_gate"
}

$report = @(
  "# Controlled Paid Beta Policy Pack - Probe Report"
  ""
  "- Date: 2026-06-17"
  "- Status: $status"
  "- Checks: $($checks.Count)"
  "- Failed: $($failed.Count)"
  ""
  "## Result"
  ""
  "The policy pack is drafted, includes the required beta policies, and keeps activation, payments, real data, outreach and public publication blocked."
) -join "`n"

Set-Content -LiteralPath $reportPath -Value $report -Encoding UTF8
Set-Content -LiteralPath $summaryPath -Value ($summary | ConvertTo-Json -Depth 5) -Encoding UTF8

if ($failed.Count -gt 0) {
  $failed | Format-Table -AutoSize | Out-String | Write-Host
  throw "Controlled paid beta policy pack probe failed."
}

Write-Host $report
