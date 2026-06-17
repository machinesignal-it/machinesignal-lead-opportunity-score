$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$JsonPath = Join-Path $Root "agent_meeting_post_deploy_technical_closure_20260617.json"
$MdPath = Join-Path $Root "agent_meeting_post_deploy_technical_closure_20260617.md"
$ReportPath = Join-Path $Root "agent_meeting_post_deploy_technical_closure_probe_report_20260617.md"
$SummaryPath = Join-Path $Root "agent_meeting_post_deploy_technical_closure_probe_summary_20260617.json"

$checks = New-Object System.Collections.Generic.List[object]

function Add-Check {
  param([string]$Name, [bool]$Passed, [string]$Detail)
  $script:checks.Add([pscustomobject]@{
    name = $Name
    passed = $Passed
    detail = $Detail
  }) | Out-Null
}

if (!(Test-Path $JsonPath)) { throw "Missing JSON artifact: $JsonPath" }
if (!(Test-Path $MdPath)) { throw "Missing markdown artifact: $MdPath" }

$json = Get-Content $JsonPath -Raw | ConvertFrom-Json
$md = Get-Content $MdPath -Raw

Add-Check "Technical test phase closed for current scope" ($json.technical_test_phase -eq "closed_for_current_scope") "$($json.technical_test_phase)"
Add-Check "Read-only production access status live and verified" ($json.read_only_production_access_status -eq "live_and_verified") "$($json.read_only_production_access_status)"
Add-Check "Paid beta remains not approved" ($json.paid_beta -eq "not_approved") "$($json.paid_beta)"
Add-Check "Commercial go-live remains no-go" ($json.commercial_go_live -eq "no_go") "$($json.commercial_go_live)"
Add-Check "Next phase is decision gates" ($json.next_phase -eq "owner_fiscal_legal_payment_decision_gates") "$($json.next_phase)"

foreach ($evidence in @(
  "authenticated_live_api_sandbox_probe",
  "production_access_status_endpoint_probe",
  "deployment_readiness_check",
  "live_production_access_status_deploy_probe",
  "openapi_production_guard_schema_probe",
  "worker_production_guard_helpers_patch_probe",
  "worker_production_guard_checklist_probe"
)) {
  $item = @($json.evidence_reviewed | Where-Object { $_.name -eq $evidence })[0]
  Add-Check "Evidence present: $evidence" ($null -ne $item) $evidence
  if ($null -ne $item -and $null -ne $item.checks_failed) {
    Add-Check "Evidence has zero failed checks: $evidence" ($item.checks_failed -eq 0) "$($item.checks_failed)"
  }
}

foreach ($closed in @(
  "machine_discovery",
  "sandbox_api_journey",
  "score_pack_path",
  "target_discovery_path",
  "deep_analysis_action_pack_gates",
  "payment_test_safety",
  "ledger_safety",
  "production_access_status_live",
  "openapi_guardrail_schemas"
)) {
  Add-Check "Closed scope present: $closed" ($json.closed_for_current_scope -contains $closed) $closed
}

foreach ($agent in @(
  "Orchestratore",
  "Agente API",
  "Architetto web AI",
  "API Product Manager",
  "Data Quality & Compliance",
  "Growth & Distribution",
  "Admin & Finance Controller",
  "Legal & Compliance",
  "HR / Agent Manager"
)) {
  Add-Check "Agent vote present: $agent" (@($json.agent_votes | Where-Object { $_.agent -eq $agent }).Count -eq 1) $agent
}

foreach ($gate in @(
  "owner_decision_whether_to_run_paid_beta",
  "company_legal_name_and_fiscal_setup",
  "piva_accounting_invoicing_path",
  "payment_provider_live_or_test_mode_decision",
  "terms_of_service_review",
  "privacy_data_policy_review",
  "refund_credit_policy_approval",
  "support_sla_approval",
  "production_api_key_issuance_policy",
  "cost_caps_and_kill_switch_owner"
)) {
  Add-Check "Remaining non-technical gate present: $gate" ($json.remaining_non_technical_gates -contains $gate) $gate
}

foreach ($blocked in @(
  "paid_beta",
  "commercial_go_live",
  "production_api_keys",
  "real_payments",
  "payment_method_collection",
  "invoices",
  "real_customer_data",
  "personal_data",
  "marketplace_publication",
  "hosted_public_mcp",
  "mcp_registry_submission"
)) {
  Add-Check "Still blocked item present: $blocked" ($json.still_blocked -contains $blocked) $blocked
}

Add-Check "Recommended next step is owner decision brief" ($json.recommended_next_step -eq "create_paid_beta_owner_decision_brief") "$($json.recommended_next_step)"
Add-Check "Markdown states technical test phase closed" ($md -match "TECHNICAL TEST PHASE: CLOSED FOR CURRENT SCOPE") "markdown"
Add-Check "Markdown states paid beta not approved" ($md -match "PAID BETA: NOT APPROVED") "markdown"
Add-Check "Markdown states commercial go-live no-go" ($md -match "COMMERCIAL GO-LIVE: NO-GO") "markdown"

$failed = @($checks | Where-Object { -not $_.passed })
$summary = [pscustomobject]@{
  probe = "agent_meeting_post_deploy_technical_closure_probe"
  date = "2026-06-17"
  status = if ($failed.Count -eq 0) { "passed" } else { "failed" }
  checks_total = $checks.Count
  checks_failed = $failed.Count
  checks = $checks
}

$summary | ConvertTo-Json -Depth 8 | Set-Content -Path $SummaryPath -Encoding UTF8

$lines = @()
$lines += "# Agent Meeting Post-Deploy Technical Closure - Probe Report"
$lines += ""
$lines += "- Date: 2026-06-17"
$lines += "- Status: $($summary.status.ToUpperInvariant())"
$lines += "- Checks: $($checks.Count)"
$lines += "- Failed: $($failed.Count)"

if ($failed.Count -gt 0) {
  $lines += ""
  $lines += "## Failed Checks"
  foreach ($item in $failed) {
    $lines += "- $($item.name): $($item.detail)"
  }
}

$lines | Set-Content -Path $ReportPath -Encoding UTF8

if ($failed.Count -gt 0) {
  Write-Host "FAIL $($failed.Count)/$($checks.Count)"
  exit 1
}

Write-Host "PASS $($checks.Count)/$($checks.Count)"
