$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$JsonPath = Join-Path $Root "beta_contract_pack_nowrite_20260616.json"
$MdPath = Join-Path $Root "beta_contract_pack_nowrite_20260616.md"
$ReportPath = Join-Path $Root "beta_contract_pack_nowrite_probe_report_20260616.md"
$SummaryPath = Join-Path $Root "beta_contract_pack_nowrite_probe_summary_20260616.json"

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

Add-Check "Company name is operational only" ($json.company_name_status -eq "operational_name_only_final_legal_entity_to_be_confirmed") $json.company_name_status
Add-Check "Paid beta remains not approved" ($json.paid_beta -eq "not_approved") $json.paid_beta
Add-Check "Commercial go-live remains no-go" ($json.commercial_go_live -eq "no_go") $json.commercial_go_live
Add-Check "Contract pack is draft only" ($json.contract_pack -eq "draft_only") $json.contract_pack

$notApproved = @(
  "paid_beta",
  "live_payments",
  "invoices",
  "payment_method_collection",
  "production_api_keys",
  "real_customer_data",
  "personal_data",
  "marketplace_publication",
  "hosted_public_mcp",
  "registry_submission",
  "external_outreach"
)

foreach ($item in $notApproved) {
  $found = @($json.not_approved | Where-Object { $_ -eq $item }).Count -gt 0
  Add-Check "Not approved item present: $item" $found $item
}

$requiredTerms = @(
  "processing_personal_data_without_approval",
  "sending_outreach_through_machinesignal",
  "bypassing_limits",
  "regulated_decisions"
)

foreach ($item in $requiredTerms) {
  $found = @($json.terms_outline.prohibited_use | Where-Object { $_ -eq $item }).Count -gt 0
  Add-Check "Prohibited use present: $item" $found $item
}

Add-Check "Current data rule is synthetic/non-personal only" ($json.privacy_data_policy.current_data_rule -eq "synthetic_data_and_non_personal_test_data_only") $json.privacy_data_policy.current_data_rule
Add-Check "Real customer data blocked" ($json.privacy_data_policy.real_customer_data -eq "blocked_until_owner_and_legal_review") $json.privacy_data_policy.real_customer_data
Add-Check "Personal data blocked" ($json.privacy_data_policy.personal_data -eq "blocked_until_owner_and_legal_review") $json.privacy_data_policy.personal_data
Add-Check "No training without approval" ([bool]$json.privacy_data_policy.no_training_without_approval) "no_training_without_approval"

$requiredRefundSections = @(
  "score_pack_1k",
  "target_discovery_pack_250",
  "deep_analysis",
  "action_pack"
)

foreach ($section in $requiredRefundSections) {
  $exists = $null -ne $json.refund_credit_policy.$section
  Add-Check "Refund/credit section present: $section" $exists $section
}

Add-Check "Target Discovery has exact 250 valid record inclusion" ($json.refund_credit_policy.target_discovery_pack_250.included -match "250 valid non-personal target records") $json.refund_credit_policy.target_discovery_pack_250.included
Add-Check "Action Pack requires valid prior analysis" ($json.refund_credit_policy.action_pack.requires -match "valid Deep Analysis") $json.refund_credit_policy.action_pack.requires
Add-Check "Machine-first support enabled" ([bool]$json.support_sla_draft.machine_first_support) "machine_first_support"
Add-Check "Kill switch required" ([bool]$json.support_sla_draft.kill_switch_required) "kill_switch_required"

$requiredReview = @(
  "final_company_legal_name",
  "fiscal_invoice_setup",
  "payment_provider_live_or_test_mode",
  "legal_review_of_terms",
  "privacy_data_review",
  "refund_credit_policy_approval",
  "support_sla_approval",
  "cost_limits",
  "production_api_key_policy",
  "kill_switch_owner"
)

foreach ($item in $requiredReview) {
  $found = @($json.required_review_before_use | Where-Object { $_ -eq $item }).Count -gt 0
  Add-Check "Required review item present: $item" $found $item
}

Add-Check "Markdown states contract is not final" ($md -match "It is not a final contract") "markdown disclaimer"
Add-Check "Markdown states paid beta not approved" ($md -match "PAID BETA: NOT APPROVED") "markdown verdict"
Add-Check "Markdown states commercial go-live no-go" ($md -match "COMMERCIAL GO-LIVE: NO-GO") "markdown verdict"
Add-Check "Markdown includes legal entity placeholder" ($md -match "Final legal entity/name to be confirmed") "company placeholder"

$failed = @($checks | Where-Object { -not $_.passed })
$summary = [pscustomobject]@{
  probe = "beta_contract_pack_nowrite_probe"
  date = "2026-06-16"
  status = if ($failed.Count -eq 0) { "passed" } else { "failed" }
  checks_total = $checks.Count
  checks_failed = $failed.Count
  checks = $checks
}

$summary | ConvertTo-Json -Depth 8 | Set-Content -Path $SummaryPath -Encoding UTF8

$lines = @()
$lines += "# Beta Contract Pack No-Write - Probe Report"
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
