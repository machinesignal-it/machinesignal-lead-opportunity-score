$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$JsonPath = Join-Path $Root "agent_meeting_after_authenticated_probe_20260616.json"
$MdPath = Join-Path $Root "agent_meeting_after_authenticated_probe_20260616.md"
$ReportPath = Join-Path $Root "agent_meeting_after_authenticated_probe_probe_report_20260616.md"
$SummaryPath = Join-Path $Root "agent_meeting_after_authenticated_probe_probe_summary_20260616.json"

$checks = New-Object System.Collections.Generic.List[object]

function Add-Check {
  param(
    [string]$Name,
    [bool]$Passed,
    [string]$Detail
  )
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

Add-Check "Technical sandbox closure approved for current scope" ($json.technical_sandbox_closure -eq "approved_for_current_scope") $json.technical_sandbox_closure
Add-Check "Paid beta remains not approved" ($json.paid_beta -eq "not_approved") $json.paid_beta
Add-Check "Commercial go-live remains no-go" ($json.commercial_go_live -eq "no_go") $json.commercial_go_live
Add-Check "Next phase is pre-beta decision readiness" ($json.next_phase -eq "pre_beta_decision_readiness") $json.next_phase

$requiredEvidence = @(
  "authenticated_live_api_probe",
  "go_no_go_matrix_probe",
  "public_api_catalog_price_consistency_probe",
  "live_machine_buyer_journey_probe",
  "public_docs_validation"
)

foreach ($name in $requiredEvidence) {
  $found = @($json.evidence_reviewed | Where-Object { $_.name -eq $name }).Count -gt 0
  Add-Check "Evidence present: $name" $found $name
}

$requiredAgents = @(
  "Orchestratore",
  "Agente API",
  "Data Scout",
  "Data Quality & Compliance",
  "Scoring Optimizer",
  "API Product Manager",
  "Growth & Distribution",
  "Customer Feedback",
  "Machine-to-Machine Sales Ops",
  "Customer Success & Post-Sale",
  "Admin & Finance Controller",
  "Legal & Compliance",
  "HR / Agent Manager"
)

foreach ($agent in $requiredAgents) {
  $found = @($json.agent_votes | Where-Object { $_.agent -eq $agent }).Count -gt 0
  Add-Check "Agent vote present: $agent" $found $agent
}

$requiredBlocks = @(
  "real_payments",
  "payment_method_collection",
  "invoices_or_fiscal_documents",
  "real_customer_data",
  "personal_data",
  "public_marketplace_listing_with_paid_plans",
  "hosted_public_mcp_launch",
  "mcp_registry_submission"
)

foreach ($block in $requiredBlocks) {
  $found = @($json.still_blocked | Where-Object { $_ -eq $block }).Count -gt 0
  Add-Check "Blocked item present: $block" $found $block
}

$requiredGates = @(
  "owner_approval_of_paid_beta_decision_packet",
  "fiscal_admin_decision_piva_invoicing_payment_reconciliation",
  "legal_review_terms_privacy_dpa_liability_retention_acceptable_use",
  "payment_safety_live_payments_disabled_until_owner_decision",
  "production_key_policy_limits_revocation_abuse_customer_isolation"
)

foreach ($gate in $requiredGates) {
  $found = @($json.remaining_gates_before_paid_beta | Where-Object { $_ -eq $gate }).Count -gt 0
  Add-Check "Remaining gate present: $gate" $found $gate
}

Add-Check "Markdown states technical sandbox approved" ($md -match "TECHNICAL SANDBOX: APPROVED FOR CURRENT SCOPE") "markdown verdict"
Add-Check "Markdown states paid beta not approved" ($md -match "PAID BETA: NOT APPROVED YET") "markdown verdict"
Add-Check "Markdown states commercial go-live no-go" ($md -match "COMMERCIAL GO-LIVE: NO-GO") "markdown verdict"

$failed = @($checks | Where-Object { -not $_.passed })
$summary = [pscustomobject]@{
  probe = "agent_meeting_after_authenticated_probe_probe"
  date = "2026-06-16"
  status = if ($failed.Count -eq 0) { "passed" } else { "failed" }
  checks_total = $checks.Count
  checks_failed = $failed.Count
  checks = $checks
}

$summary | ConvertTo-Json -Depth 8 | Set-Content -Path $SummaryPath -Encoding UTF8

$lines = @()
$lines += "# Agent Meeting After Authenticated Probe - Probe Report"
$lines += ""
$lines += "- Date: 2026-06-16"
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
