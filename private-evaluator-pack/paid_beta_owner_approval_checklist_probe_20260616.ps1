$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$JsonPath = Join-Path $Root "paid_beta_owner_approval_checklist_20260616.json"
$MdPath = Join-Path $Root "paid_beta_owner_approval_checklist_20260616.md"
$ReportPath = Join-Path $Root "paid_beta_owner_approval_checklist_probe_report_20260616.md"
$SummaryPath = Join-Path $Root "paid_beta_owner_approval_checklist_probe_summary_20260616.json"

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

Add-Check "Technical sandbox is closed for current scope" ($json.technical_sandbox -eq "closed_for_current_scope") $json.technical_sandbox
Add-Check "Paid beta remains not approved" ($json.paid_beta -eq "not_approved") $json.paid_beta
Add-Check "Commercial go-live remains no-go" ($json.commercial_go_live -eq "no_go") $json.commercial_go_live
Add-Check "Approval rule requires all gates approved by owner" ($json.approval_rule -match "every mandatory gate") $json.approval_rule

$requiredGates = @(
  "owner_commercial_decision",
  "fiscal_setup",
  "invoice_flow",
  "payment_provider",
  "terms_of_service",
  "privacy_policy",
  "data_policy",
  "acceptable_use",
  "refund_credit_policy",
  "support_policy",
  "production_api_keys",
  "cost_guard",
  "security_baseline",
  "marketplace_registry",
  "external_outreach"
)

foreach ($gate in $requiredGates) {
  $items = @($json.mandatory_gates | Where-Object { $_.gate -eq $gate })
  Add-Check "Mandatory gate present: $gate" ($items.Count -eq 1) $gate
  if ($items.Count -eq 1) {
    Add-Check "Mandatory gate is blocking: $gate" ([bool]$items[0].blocking) $gate
  }
}

$blocked = @(
  "live_payments",
  "payment_method_collection",
  "invoices",
  "paid_customer_onboarding",
  "production_api_key_release",
  "real_customer_data",
  "personal_data",
  "external_outreach",
  "marketplace_publication",
  "hosted_public_mcp",
  "mcp_registry_submission",
  "automated_contact_with_real_companies_or_people"
)

foreach ($item in $blocked) {
  $found = @($json.explicitly_not_approved | Where-Object { $_ -eq $item }).Count -gt 0
  Add-Check "Explicitly not approved: $item" $found $item
}

Add-Check "Recommended first product is Score Pack 1k" ($json.recommended_first_product.name -eq "Score Pack 1k") $json.recommended_first_product.name
Add-Check "First paid beta is limited to one account" ($json.minimum_paid_beta_shape_if_later_approved.first_customer_or_machine_accounts -eq 1) "$($json.minimum_paid_beta_shape_if_later_approved.first_customer_or_machine_accounts)"
Add-Check "No auto-renewal in proposed paid beta" (-not [bool]$json.minimum_paid_beta_shape_if_later_approved.auto_renewal) "auto_renewal=false"
Add-Check "No personal data in proposed paid beta" (-not [bool]$json.minimum_paid_beta_shape_if_later_approved.personal_data_allowed) "personal_data_allowed=false"
Add-Check "No external outreach in proposed paid beta" (-not [bool]$json.minimum_paid_beta_shape_if_later_approved.external_outreach_allowed) "external_outreach_allowed=false"
Add-Check "Markdown states paid beta not approved" ($md -match "PAID BETA: NOT APPROVED") "markdown verdict"
Add-Check "Markdown states commercial go-live no-go" ($md -match "COMMERCIAL GO-LIVE: NO-GO") "markdown verdict"
Add-Check "Markdown recommends no-write beta contract pack" ($md -match "no-write beta contract pack") "markdown next step"

$failed = @($checks | Where-Object { -not $_.passed })
$summary = [pscustomobject]@{
  probe = "paid_beta_owner_approval_checklist_probe"
  date = "2026-06-16"
  status = if ($failed.Count -eq 0) { "passed" } else { "failed" }
  checks_total = $checks.Count
  checks_failed = $failed.Count
  checks = $checks
}

$summary | ConvertTo-Json -Depth 8 | Set-Content -Path $SummaryPath -Encoding UTF8

$lines = @()
$lines += "# Paid-Beta Owner Approval Checklist - Probe Report"
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
