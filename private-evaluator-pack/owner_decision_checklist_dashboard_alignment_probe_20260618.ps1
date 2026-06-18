$ErrorActionPreference = "Stop"

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$brainMdPath = Join-Path $root "COMPANY_BRAIN.md"
$brainJsonPath = Join-Path $root "company-brain.json"
$graphPath = Join-Path $root "company-brain-graph.json"
$dashboardMdPath = Join-Path $root "private-evaluator-pack/owner_decision_dashboard_20260618.md"
$dashboardJsonPath = Join-Path $root "private-evaluator-pack/owner_decision_dashboard_20260618.json"
$checklistSummaryPath = Join-Path $root "private-evaluator-pack/owner_decision_checklist_nowrite_probe_summary_20260618.json"
$reportPath = Join-Path $root "private-evaluator-pack/owner_decision_checklist_dashboard_alignment_probe_report_20260618.md"
$summaryPath = Join-Path $root "private-evaluator-pack/owner_decision_checklist_dashboard_alignment_probe_summary_20260618.json"

$brainMd = Get-Content -Raw -Encoding UTF8 $brainMdPath
$brainJsonText = Get-Content -Raw -Encoding UTF8 $brainJsonPath
$brain = $brainJsonText | ConvertFrom-Json
$graphText = Get-Content -Raw -Encoding UTF8 $graphPath
$graph = $graphText | ConvertFrom-Json
$dashboardMd = Get-Content -Raw -Encoding UTF8 $dashboardMdPath
$dashboardText = Get-Content -Raw -Encoding UTF8 $dashboardJsonPath
$dashboard = $dashboardText | ConvertFrom-Json
$checklistSummary = (Get-Content -Raw -Encoding UTF8 $checklistSummaryPath) | ConvertFrom-Json

$checks = New-Object System.Collections.Generic.List[object]
function Add-Check {
  param([string]$Name, [bool]$Pass, [string]$Detail)
  $script:checks.Add([pscustomobject]@{ name = $Name; pass = $Pass; detail = $Detail })
}

Add-Check "Company Brain version v13" ($brain.company_brain_version -eq "2026-06-18-internal-v13") $brain.company_brain_version
Add-Check "Graph version v13" ($graph.graph_version -eq "2026-06-18-internal-v13") $graph.graph_version
Add-Check "Current workstream checklist alignment" ($brain.current_status.current_safe_workstream -eq "owner_decision_checklist_alignment") $brain.current_status.current_safe_workstream
Add-Check "Dashboard counts remain 3/12/1 in brain" (($brain.owner_decision_dashboard.green_count -eq 3) -and ($brain.owner_decision_dashboard.yellow_count -eq 12) -and ($brain.owner_decision_dashboard.red_count -eq 1)) "brain counts"
Add-Check "Dashboard counts remain 3/12/1 in owner dashboard" (($dashboard.gate_counts.green -eq 3) -and ($dashboard.gate_counts.yellow -eq 12) -and ($dashboard.gate_counts.red -eq 1)) "dashboard counts"

Add-Check "Checklist object present in brain" ($null -ne $brain.owner_decision_dashboard.owner_decision_checklist) "brain checklist"
Add-Check "Checklist evidence in brain" ($brain.owner_decision_dashboard.owner_decision_checklist.evidence -eq "owner_decision_checklist_nowrite_20260618") "$($brain.owner_decision_dashboard.owner_decision_checklist.evidence)"
Add-Check "Checklist probe in brain" ($brain.owner_decision_dashboard.owner_decision_checklist.probe -eq "94_checks_0_failed") "$($brain.owner_decision_dashboard.owner_decision_checklist.probe)"
Add-Check "Checklist result in brain" ($brain.owner_decision_dashboard.owner_decision_checklist.current_result -eq "NOT_YET_OWNER_REVIEW_REQUIRED") "$($brain.owner_decision_dashboard.owner_decision_checklist.current_result)"
Add-Check "Checklist activation false in brain" ($brain.owner_decision_dashboard.owner_decision_checklist.activation_allowed -eq $false) "$($brain.owner_decision_dashboard.owner_decision_checklist.activation_allowed)"

Add-Check "Checklist object present in dashboard" ($null -ne $dashboard.owner_decision_checklist) "dashboard checklist"
Add-Check "Checklist evidence in dashboard" ($dashboard.owner_decision_checklist.evidence -eq "owner_decision_checklist_nowrite_20260618") "$($dashboard.owner_decision_checklist.evidence)"
Add-Check "Checklist result in dashboard" ($dashboard.owner_decision_checklist.current_result -eq "NOT_YET_OWNER_REVIEW_REQUIRED") "$($dashboard.owner_decision_checklist.current_result)"
Add-Check "Checklist activation false in dashboard" ($dashboard.owner_decision_checklist.activation_allowed -eq $false) "$($dashboard.owner_decision_checklist.activation_allowed)"

Add-Check "Checklist summary passed" ($checklistSummary.passed -eq $true) "$($checklistSummary.passed)"
Add-Check "Checklist summary 94 checks" (($checklistSummary.checks_passed -eq 94) -and ($checklistSummary.checks_failed -eq 0)) "$($checklistSummary.checks_passed)/$($checklistSummary.checks_failed)"
Add-Check "Checklist summary not yet" ($checklistSummary.current_result -eq "NOT_YET_OWNER_REVIEW_REQUIRED") "$($checklistSummary.current_result)"
Add-Check "Checklist summary activation false" ($checklistSummary.activation_allowed -eq $false) "$($checklistSummary.activation_allowed)"

Add-Check "Owner commercial approval remains red in brain" ($brain.owner_decision_dashboard.red -contains "owner_commercial_approval") "brain red"
Add-Check "Paid beta still no-go dashboard" ($dashboard.final_decision.paid_beta_activation -eq "no_go") "$($dashboard.final_decision.paid_beta_activation)"
Add-Check "Commercial go-live still no-go dashboard" ($dashboard.final_decision.commercial_go_live -eq "no_go") "$($dashboard.final_decision.commercial_go_live)"
Add-Check "Current decision result in brain" ($brain.current_decision.owner_decision_current_result -eq "NOT_YET_OWNER_REVIEW_REQUIRED") "$($brain.current_decision.owner_decision_current_result)"

$requiredBrainBlocked = @(
  "real_payments",
  "invoices",
  "payment_method_collection",
  "production_api_keys",
  "real_customer_data_processing",
  "personal_data_processing",
  "external_outreach",
  "email_sending_to_external_humans",
  "public_paid_marketplace_publication",
  "hosted_mcp_public_launch",
  "mcp_registry_publication",
  "commercial_go_live"
)
foreach ($item in $requiredBrainBlocked) {
  Add-Check "Brain blocked action still present: $item" ($brain.owner_decision_dashboard.blocked_actions -contains $item) $item
}

$requiredDashboardBlocked = @(
  "activate_paid_beta",
  "execute_real_payment",
  "issue_invoice",
  "collect_payment_method",
  "issue_production_api_key",
  "process_real_customer_dataset",
  "process_personal_data",
  "send_external_outreach",
  "publish_marketplace_listing",
  "launch_hosted_public_mcp",
  "submit_mcp_registry"
)
foreach ($item in $requiredDashboardBlocked) {
  Add-Check "Dashboard blocked action still present: $item" ($dashboard.blocked_actions -contains $item) $item
}

Add-Check "Next safe action in brain" ($brain.owner_decision_dashboard.next_safe_action -eq "prepare_final_owner_review_gap_report_nowrite") "$($brain.owner_decision_dashboard.next_safe_action)"
Add-Check "Next safe action in dashboard" ($dashboard.next_safe_action -eq "prepare_final_owner_review_gap_report_nowrite") "$($dashboard.next_safe_action)"
Add-Check "Roadmap next step in brain" ($brain.roadmap.current_next_step -match "final owner review gap report NoWrite") "$($brain.roadmap.current_next_step)"
Add-Check "Recommended action in brain" ($brain.current_decision.next_recommended_action -match "final owner review gap report NoWrite") "$($brain.current_decision.next_recommended_action)"

Add-Check "Dashboard markdown mentions checklist" ($dashboardMd -match "owner_decision_checklist_nowrite_20260618") "dashboard md"
Add-Check "Dashboard markdown mentions not yet" ($dashboardMd -match "NOT_YET_OWNER_REVIEW_REQUIRED") "dashboard md"
Add-Check "Company Brain markdown mentions checklist probe" ($brainMd -match "owner decision checklist NoWrite probe: 94 checks, 0 failed") "brain md"
Add-Check "Company Brain markdown mentions not yet" ($brainMd -match "NOT_YET_OWNER_REVIEW_REQUIRED") "brain md"

$node = @($graph.nodes | Where-Object { $_.id -eq "owner_decision_checklist_nowrite_20260618" })
Add-Check "Graph checklist node present" ($node.Count -eq 1) "graph node"
$edge1 = @($graph.edges | Where-Object { $_.from -eq "owner_decision_dashboard_20260618" -and $_.to -eq "owner_decision_checklist_nowrite_20260618" -and $_.relation -eq "uses_decision_simulation" })
Add-Check "Graph dashboard to checklist edge present" ($edge1.Count -eq 1) "graph edge"
$edge2 = @($graph.edges | Where-Object { $_.from -eq "owner_decision_checklist_nowrite_20260618" -and $_.to -eq "blocked_actions" -and $_.relation -eq "keeps_blocked_until_owner_signature" })
Add-Check "Graph checklist to blocked actions edge present" ($edge2.Count -eq 1) "graph edge"

$combined = @($brainMd, $brainJsonText, $graphText, $dashboardMd, $dashboardText) -join "`n"
$unsafePhrases = @(
  '"paid_beta_activation_allowed": true',
  '"commercial_go_live_allowed": true',
  '"real_payment_allowed": true',
  '"invoice_allowed": true',
  '"production_key_issuance_allowed": true',
  "paid beta approved",
  "commercial go-live approved",
  "payment approved",
  "invoice approved",
  "production key approved",
  "beta a pagamento approvata",
  "go-live commerciale approvato",
  "pagamento approvato",
  "fattura approvata",
  "chiave production approvata"
)
foreach ($phrase in $unsafePhrases) {
  Add-Check "Unsafe phrase absent: $phrase" (-not ($combined.Contains($phrase))) $phrase
}

$failed = @($checks | Where-Object { -not $_.pass })
$passedCount = @($checks | Where-Object { $_.pass }).Count
$failedCount = $failed.Count

$report = New-Object System.Collections.Generic.List[string]
$report.Add("# Owner Decision Checklist Dashboard Alignment Probe Report")
$report.Add("")
$report.Add("Date: 2026-06-18")
$report.Add("")
$report.Add("Scope: allineamento Company Brain, dashboard e grafo con checklist decisionale NoWrite.")
$report.Add("")
$report.Add("Checks passed: $passedCount")
$report.Add("Checks failed: $failedCount")
$report.Add("")
$report.Add("Sintesi:")
$report.Add("")
$report.Add("- La checklist decisionale e' registrata nella memoria operativa.")
$report.Add("- Il risultato corrente resta NOT_YET_OWNER_REVIEW_REQUIRED.")
$report.Add("- I blocchi commerciali restano attivi.")
$report.Add("- Il prossimo passo e' un final owner review gap report NoWrite.")
$report.Add("")
$report.Add("Dettaglio controlli:")
$report.Add("")
foreach ($check in $checks) {
  $status = if ($check.pass) { "OK" } else { "FAIL" }
  $report.Add("- [$status] $($check.name): $($check.detail)")
}
Set-Content -LiteralPath $reportPath -Value $report -Encoding UTF8

$summary = [pscustomobject]@{
  document = "owner_decision_checklist_dashboard_alignment_probe_summary"
  date = "2026-06-18"
  passed = ($failedCount -eq 0)
  checks_passed = $passedCount
  checks_failed = $failedCount
  current_result = "NOT_YET_OWNER_REVIEW_REQUIRED"
  next_safe_action = "prepare_final_owner_review_gap_report_nowrite"
  report = "owner_decision_checklist_dashboard_alignment_probe_report_20260618.md"
}
$summary | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $summaryPath -Encoding UTF8

if ($failedCount -gt 0) {
  Write-Host "FAILED: $failedCount checks failed. See $reportPath"
  exit 1
}

Write-Host "PASSED: $passedCount checks passed. Report: $reportPath"
