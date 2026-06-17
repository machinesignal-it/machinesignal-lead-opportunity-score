$ErrorActionPreference = "Stop"

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$mdPath = Join-Path $root "private-evaluator-pack\advisor_readiness_agents_update_20260617.md"
$jsonPath = Join-Path $root "private-evaluator-pack\advisor_readiness_agents_update_20260617.json"
$reportPath = Join-Path $root "private-evaluator-pack\advisor_readiness_agents_update_probe_report_20260617.md"
$summaryPath = Join-Path $root "private-evaluator-pack\advisor_readiness_agents_update_probe_summary_20260617.json"

$checks = New-Object System.Collections.Generic.List[object]

function Add-Check {
  param([string]$Name, [bool]$Passed, [string]$Detail)
  $checks.Add([pscustomobject]@{ name = $Name; passed = $Passed; detail = $Detail })
}

Add-Check "markdown_exists" (Test-Path $mdPath) $mdPath
Add-Check "json_exists" (Test-Path $jsonPath) $jsonPath

$md = Get-Content -Raw -LiteralPath $mdPath
$json = Get-Content -Raw -LiteralPath $jsonPath | ConvertFrom-Json

$requiredAgents = @(
  "Fiscal/Admin Readiness Agent",
  "Legal & Privacy Readiness Agent",
  "Advisor Gatekeeper Agent"
)

foreach ($agent in $requiredAgents) {
  Add-Check "markdown_agent_$($agent.Replace(' ', '_'))" ($md.Contains($agent)) $agent
}

$agentNames = @($json.new_agents | ForEach-Object { $_.name })
foreach ($agent in $requiredAgents) {
  Add-Check "json_agent_$($agent.Replace(' ', '_'))" ($agentNames -contains $agent) $agent
}

$blocked = @{
  paid_beta_activation = "blocked"
  real_payments = "blocked"
  invoices = "blocked"
  production_api_keys = "blocked"
  real_customer_data = "blocked"
  personal_data = "blocked"
  external_outreach = "blocked"
  marketplace_mcp_publication = "blocked"
}

foreach ($key in $blocked.Keys) {
  Add-Check "json_blocks_$key" ($json.first_self_evaluation.$key -eq $blocked[$key]) "$key=$($json.first_self_evaluation.$key)"
}

$requiredPhrases = @(
  "They do not replace a certified accountant, lawyer, tax advisor, privacy consultant or DPO.",
  "Can block paid beta activation.",
  "Cannot authorize paid beta activation.",
  "Current answer: no.",
  "Commercial activation remains no-go until the owner explicitly approves every critical gate."
)

foreach ($phrase in $requiredPhrases) {
  Add-Check "markdown_contains_$($phrase.Replace(' ', '_').Replace('.', '').Replace(':', ''))" ($md.Contains($phrase)) $phrase
}

Add-Check "json_need_more_agents_false" (-not [bool]$json.need_more_agents_now) "$($json.need_more_agents_now)"
Add-Check "json_operating_rule_present" ($json.operating_rule -like "*cannot_create_professional*") $json.operating_rule
Add-Check "json_next_step_rehearsal" ($json.recommended_next_step -eq "advisor_gate_rehearsal") $json.recommended_next_step

$gatekeeper = @($json.new_agents | Where-Object { $_.name -eq "Advisor Gatekeeper Agent" })[0]
Add-Check "gatekeeper_no_green_activate_without_signatures" (-not [bool]$gatekeeper.decision_power.can_issue_green_activate_paid_beta_without_all_signatures) "$($gatekeeper.decision_power.can_issue_green_activate_paid_beta_without_all_signatures)"

$failed = @($checks | Where-Object { -not $_.passed })
$status = if ($failed.Count -eq 0) { "PASSED" } else { "FAILED" }

$summary = [pscustomobject]@{
  date = "2026-06-17"
  status = $status
  checks = $checks.Count
  failed = $failed.Count
  agents_created = $requiredAgents
  need_more_agents_now = $false
  next_step = "advisor_gate_rehearsal"
}

$report = @(
  "# Advisor Readiness Agents Update - Probe Report"
  ""
  "- Date: 2026-06-17"
  "- Status: $status"
  "- Checks: $($checks.Count)"
  "- Failed: $($failed.Count)"
  ""
  "## Result"
  ""
  "The three advisor-readiness agents are defined, scoped as internal readiness agents, and cannot authorize paid beta, payments, invoices, production keys, real data, outreach or public publication."
) -join "`n"

Set-Content -LiteralPath $reportPath -Value $report -Encoding UTF8
Set-Content -LiteralPath $summaryPath -Value ($summary | ConvertTo-Json -Depth 5) -Encoding UTF8

if ($failed.Count -gt 0) {
  $failed | Format-Table -AutoSize | Out-String | Write-Host
  throw "Advisor readiness agents update probe failed."
}

Write-Host $report
