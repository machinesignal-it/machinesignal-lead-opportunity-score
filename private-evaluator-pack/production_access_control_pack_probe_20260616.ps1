$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$JsonPath = Join-Path $Root "production_access_control_pack_20260616.json"
$MdPath = Join-Path $Root "production_access_control_pack_20260616.md"
$ReportPath = Join-Path $Root "production_access_control_pack_probe_report_20260616.md"
$SummaryPath = Join-Path $Root "production_access_control_pack_probe_summary_20260616.json"

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

Add-Check "Status is draft/no live activation" ($json.status -eq "draft_no_live_activation") $json.status
Add-Check "Production API keys blocked" ($json.production_api_keys -eq "blocked") $json.production_api_keys
Add-Check "Paid beta not approved" ($json.paid_beta -eq "not_approved") $json.paid_beta
Add-Check "Commercial go-live no-go" ($json.commercial_go_live -eq "no_go") $json.commercial_go_live

$notApproved = @(
  "real_payments",
  "invoices",
  "payment_method_collection",
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

$requiredPrefixes = @("ms_sbx_", "ms_live_", "ms_admin_", "ms_wh_test_")
foreach ($prefix in $requiredPrefixes) {
  $found = @($json.key_classes | Where-Object { $_.prefix -eq $prefix }).Count -eq 1
  Add-Check "Key prefix present: $prefix" $found $prefix
}

$liveKey = @($json.key_classes | Where-Object { $_.prefix -eq "ms_live_" })[0]
Add-Check "Live key class is blocked" ($liveKey.status -eq "blocked") $liveKey.status

$requiredGates = @(
  "owner_paid_beta_approval",
  "fiscal_admin_path",
  "invoice_receipt_path",
  "payment_provider_decision",
  "terms_privacy_data_review",
  "refund_credit_policy",
  "support_sla_policy",
  "cost_cap_policy",
  "kill_switch_owner",
  "production_key_storage_rotation_revocation_process"
)

foreach ($gate in $requiredGates) {
  $found = @($json.production_key_required_gates | Where-Object { $_ -eq $gate }).Count -gt 0
  Add-Check "Production key gate present: $gate" $found $gate
}

$requiredCaps = @(
  "per_key_daily_request_cap",
  "per_key_monthly_request_cap",
  "per_key_credit_cap",
  "global_daily_write_cap",
  "global_monthly_spend_cap",
  "provider_specific_spend_cap",
  "cloudflare_kv_write_cap",
  "alert_threshold",
  "hard_stop_threshold"
)

foreach ($cap in $requiredCaps) {
  $found = @($json.required_cost_caps | Where-Object { $_ -eq $cap }).Count -gt 0
  Add-Check "Cost cap present: $cap" $found $cap
}

Add-Check "First beta limited to one account" ($json.default_beta_access_limits.customers_or_machine_accounts -eq 1) "$($json.default_beta_access_limits.customers_or_machine_accounts)"
Add-Check "Auto-renewal disabled" (-not [bool]$json.default_beta_access_limits.auto_renewal) "auto_renewal=false"
Add-Check "Personal data disabled" (-not [bool]$json.default_beta_access_limits.personal_data) "personal_data=false"
Add-Check "External outreach disabled" (-not [bool]$json.default_beta_access_limits.external_outreach) "external_outreach=false"

Add-Check "Kill switch required" ([bool]$json.kill_switch.required) "kill_switch.required"
Add-Check "Kill switch blocks real payment" (-not [bool]$json.kill_switch.response_contract.real_payment_executed) "real_payment_executed=false"
Add-Check "Kill switch blocks invoice" (-not [bool]$json.kill_switch.response_contract.invoice_issued) "invoice_issued=false"
Add-Check "Kill switch blocks external contact" (-not [bool]$json.kill_switch.response_contract.external_contact_executed) "external_contact_executed=false"
Add-Check "Kill switch requires owner escalation" ([bool]$json.kill_switch.response_contract.owner_escalation_required) "owner_escalation_required=true"

$requiredStates = @(
  "blocked_production_key",
  "blocked_cost_cap",
  "blocked_real_data",
  "blocked_payment",
  "blocked_invoice",
  "paused_kill_switch",
  "security_review_required",
  "needs_owner_review"
)

foreach ($state in $requiredStates) {
  $found = @($json.support_status_states | Where-Object { $_ -eq $state }).Count -gt 0
  Add-Check "Support/status state present: $state" $found $state
}

$forbiddenAudit = @("full_api_key", "password", "payment_card_data", "full_personal_payload")
foreach ($field in $forbiddenAudit) {
  $found = @($json.audit_trail_forbidden_fields | Where-Object { $_ -eq $field }).Count -gt 0
  Add-Check "Forbidden audit field present: $field" $found $field
}

$publicMustNot = @(
  "real_production_keys",
  "admin_keys",
  "payment_provider_secrets",
  "real_customer_data",
  "owner_credentials"
)

foreach ($item in $publicMustNot) {
  $found = @($json.public_docs_must_not_show | Where-Object { $_ -eq $item }).Count -gt 0
  Add-Check "Public docs must not show: $item" $found $item
}

Add-Check "Markdown states production keys blocked" ($md -match "PRODUCTION API KEYS: BLOCKED") "markdown verdict"
Add-Check "Markdown states paid beta not approved" ($md -match "PAID BETA: NOT APPROVED") "markdown verdict"
Add-Check "Markdown states commercial go-live no-go" ($md -match "COMMERCIAL GO-LIVE: NO-GO") "markdown verdict"
Add-Check "Markdown includes kill switch response" ($md -match "MS_KILL_SWITCH_ACTIVE") "kill switch response"

$failed = @($checks | Where-Object { -not $_.passed })
$summary = [pscustomobject]@{
  probe = "production_access_control_pack_probe"
  date = "2026-06-16"
  status = if ($failed.Count -eq 0) { "passed" } else { "failed" }
  checks_total = $checks.Count
  checks_failed = $failed.Count
  checks = $checks
}

$summary | ConvertTo-Json -Depth 8 | Set-Content -Path $SummaryPath -Encoding UTF8

$lines = @()
$lines += "# Production Access Control Pack - Probe Report"
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
