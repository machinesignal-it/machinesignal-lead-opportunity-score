$ErrorActionPreference = "Stop"

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$mdPath = Join-Path $root "private-evaluator-pack\owner_decision_roadmap_20260617.md"
$jsonPath = Join-Path $root "private-evaluator-pack\owner_decision_roadmap_20260617.json"
$reportPath = Join-Path $root "private-evaluator-pack\owner_decision_roadmap_probe_report_20260617.md"
$summaryPath = Join-Path $root "private-evaluator-pack\owner_decision_roadmap_probe_summary_20260617.json"

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
  "This does not mean the business is live.",
  "Paid beta activation | No-go",
  "Commercial go-live | No-go",
  "Track 1 - Decisions You Can Make Directly",
  "Track 2 - Decisions To Validate Externally",
  "Track 3 - Work Agents Can Continue Autonomously",
  "Not allowed autonomous work",
  "Activate paid beta: no.",
  "Go live commercially: no."
)

foreach ($phrase in $requiredPhrases) {
  Add-Check "markdown_contains_$($phrase.Replace(' ', '_').Replace('|', '').Replace('.', '').Replace(':', ''))" ($md.Contains($phrase)) $phrase
}

Add-Check "json_paid_beta_no_go" ($json.paid_beta_activation -eq "no_go") $json.paid_beta_activation
Add-Check "json_commercial_no_go" ($json.commercial_go_live -eq "no_go") $json.commercial_go_live
Add-Check "json_preparation_allowed" ($json.paid_beta_preparation -eq "allowed") $json.paid_beta_preparation
Add-Check "json_next_step_questions" ($json.recommended_next_step -eq "create_accountant_and_legal_privacy_question_lists") $json.recommended_next_step
Add-Check "json_final_activate_false" (-not [bool]$json.final_decision.activate_paid_beta) "$($json.final_decision.activate_paid_beta)"
Add-Check "json_final_go_live_false" (-not [bool]$json.final_decision.commercial_go_live) "$($json.final_decision.commercial_go_live)"

$requiredBlocked = @(
  "activate_payments",
  "collect_payment_methods",
  "issue_invoices",
  "send_external_emails",
  "contact_companies_or_people",
  "process_personal_data",
  "process_real_customer_lists",
  "publish_marketplace_or_mcp_registry",
  "issue_production_api_keys",
  "change_fiscal_legal_commitments"
)

foreach ($item in $requiredBlocked) {
  Add-Check "json_blocks_$item" ($json.tracks.agent_autonomous_work_blocked -contains $item) $item
}

$failed = @($checks | Where-Object { -not $_.passed })
$status = if ($failed.Count -eq 0) { "PASSED" } else { "FAILED" }

$summary = [pscustomobject]@{
  date = "2026-06-17"
  status = $status
  checks = $checks.Count
  failed = $failed.Count
  next_step = "create_accountant_and_legal_privacy_question_lists"
}

$report = @(
  "# Owner Decision Roadmap - Probe Report"
  ""
  "- Date: 2026-06-17"
  "- Status: $status"
  "- Checks: $($checks.Count)"
  "- Failed: $($failed.Count)"
  ""
  "## Result"
  ""
  "The roadmap separates owner decisions, external validations and autonomous agent work while keeping paid beta and commercial go-live blocked."
) -join "`n"

Set-Content -LiteralPath $reportPath -Value $report -Encoding UTF8
Set-Content -LiteralPath $summaryPath -Value ($summary | ConvertTo-Json -Depth 5) -Encoding UTF8

if ($failed.Count -gt 0) {
  $failed | Format-Table -AutoSize | Out-String | Write-Host
  throw "Owner decision roadmap probe failed."
}

Write-Host $report
