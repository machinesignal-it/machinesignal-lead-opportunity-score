$ErrorActionPreference = "Stop"

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$mdPath = Join-Path $root "private-evaluator-pack\readiness_roadmap_advisor_gate_update_20260617.md"
$jsonPath = Join-Path $root "private-evaluator-pack\readiness_roadmap_advisor_gate_update_20260617.json"
$reportPath = Join-Path $root "private-evaluator-pack\readiness_roadmap_advisor_gate_update_probe_report_20260617.md"
$summaryPath = Join-Path $root "private-evaluator-pack\readiness_roadmap_advisor_gate_update_probe_summary_20260617.json"

$checks = New-Object System.Collections.Generic.List[object]

function Add-Check {
  param([string]$Name, [bool]$Passed, [string]$Detail)
  $checks.Add([pscustomobject]@{ name = $Name; passed = $Passed; detail = $Detail })
}

Add-Check "markdown_exists" (Test-Path $mdPath) $mdPath
Add-Check "json_exists" (Test-Path $jsonPath) $jsonPath

$md = Get-Content -Raw -LiteralPath $mdPath
$json = Get-Content -Raw -LiteralPath $jsonPath | ConvertFrom-Json

$requiredPhrases = @(
  "Advisor Gate State",
  "The rehearsal tested 18 requests.",
  "current safe workstream",
  "Paid Beta Activation",
  "Status: no-go.",
  "Run an internal documentation/API examples refinement pass.",
  "Activate paid beta: no.",
  "Need more agents now: no."
)

foreach ($phrase in $requiredPhrases) {
  Add-Check "markdown_contains_$($phrase.Replace(' ', '_').Replace('/', '').Replace('.', '').Replace(':', ''))" ($md.Contains($phrase)) $phrase
}

Add-Check "json_technical_complete" ($json.technical_sandbox -eq "complete_for_current_scope") $json.technical_sandbox
Add-Check "json_advisor_complete" ($json.advisor_gate_setup -eq "complete_for_current_scope") $json.advisor_gate_setup
Add-Check "json_current_safe_workstream" ($json.current_safe_workstream -eq "internal_preparation_refinement") $json.current_safe_workstream
Add-Check "json_paid_beta_no_go" ($json.paid_beta_activation -eq "no_go") $json.paid_beta_activation
Add-Check "json_commercial_no_go" ($json.commercial_go_live -eq "no_go") $json.commercial_go_live

Add-Check "json_rehearsal_tests_18" ([int]$json.advisor_gate_rehearsal.tests_run -eq 18) "$($json.advisor_gate_rehearsal.tests_run)"
Add-Check "json_rehearsal_violations_0" ([int]$json.advisor_gate_rehearsal.hard_block_violations -eq 0) "$($json.advisor_gate_rehearsal.hard_block_violations)"
Add-Check "json_rehearsal_unexpected_allows_0" ([int]$json.advisor_gate_rehearsal.unexpected_allows -eq 0) "$($json.advisor_gate_rehearsal.unexpected_allows)"

$requiredAgents = @(
  "Fiscal/Admin Readiness Agent",
  "Legal & Privacy Readiness Agent",
  "Advisor Gatekeeper Agent"
)

foreach ($agent in $requiredAgents) {
  Add-Check "json_agent_$($agent.Replace(' ', '_'))" ($json.advisor_agents -contains $agent) $agent
}

$blocked = @(
  "activate_paid_beta",
  "accept_money",
  "collect_payment_methods",
  "issue_invoices",
  "issue_production_api_keys",
  "process_real_customer_lists",
  "process_personal_data",
  "send_outreach_email",
  "contact_companies_or_people",
  "publish_marketplace_listing",
  "publish_hosted_public_mcp",
  "submit_mcp_registry",
  "declare_final_legal_privacy_fiscal_approval"
)

foreach ($item in $blocked) {
  Add-Check "json_blocks_$item" ($json.blocked_agent_work -contains $item) $item
}

Add-Check "next_safe_step_docs" ($json.recommended_next_safe_step -eq "internal_documentation_api_examples_refinement_pass") $json.recommended_next_safe_step
Add-Check "final_continue_true" ([bool]$json.final_decision.continue_internal_preparation) "$($json.final_decision.continue_internal_preparation)"
Add-Check "final_activate_false" (-not [bool]$json.final_decision.activate_paid_beta) "$($json.final_decision.activate_paid_beta)"
Add-Check "final_go_live_false" (-not [bool]$json.final_decision.commercial_go_live) "$($json.final_decision.commercial_go_live)"
Add-Check "final_no_more_agents" (-not [bool]$json.final_decision.need_more_agents_now) "$($json.final_decision.need_more_agents_now)"

$failed = @($checks | Where-Object { -not $_.passed })
$status = if ($failed.Count -eq 0) { "PASSED" } else { "FAILED" }

$summary = [pscustomobject]@{
  date = "2026-06-17"
  status = $status
  checks = $checks.Count
  failed = $failed.Count
  current_safe_workstream = "internal_preparation_refinement"
  next_safe_step = "internal_documentation_api_examples_refinement_pass"
}

$report = @(
  "# Readiness Roadmap Advisor Gate Update - Probe Report"
  ""
  "- Date: 2026-06-17"
  "- Status: $status"
  "- Checks: $($checks.Count)"
  "- Failed: $($failed.Count)"
  ""
  "## Result"
  ""
  "The roadmap now includes the advisor gate state. Technical sandbox and advisor gate setup are complete for current scope; paid beta and commercial go-live remain no-go."
) -join "`n"

Set-Content -LiteralPath $reportPath -Value $report -Encoding UTF8
Set-Content -LiteralPath $summaryPath -Value ($summary | ConvertTo-Json -Depth 5) -Encoding UTF8

if ($failed.Count -gt 0) {
  $failed | Format-Table -AutoSize | Out-String | Write-Host
  throw "Readiness roadmap advisor gate update probe failed."
}

Write-Host $report
