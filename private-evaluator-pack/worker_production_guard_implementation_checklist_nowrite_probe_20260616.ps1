$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$JsonPath = Join-Path $Root "worker_production_guard_implementation_checklist_nowrite_20260616.json"
$MdPath = Join-Path $Root "worker_production_guard_implementation_checklist_nowrite_20260616.md"
$ReportPath = Join-Path $Root "worker_production_guard_implementation_checklist_nowrite_probe_report_20260616.md"
$SummaryPath = Join-Path $Root "worker_production_guard_implementation_checklist_nowrite_probe_summary_20260616.json"

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

Add-Check "Artifact is checklist only" ($json.status -eq "implementation_checklist_only") $json.status
Add-Check "No Worker code changed by artifact" ($json.code_change_status -eq "no_worker_code_changed_by_this_artifact") $json.code_change_status
Add-Check "Production API keys blocked" ($json.production_api_keys -eq "blocked") $json.production_api_keys
Add-Check "Paid beta not approved" ($json.paid_beta -eq "not_approved") $json.paid_beta
Add-Check "Commercial go-live no-go" ($json.commercial_go_live -eq "no_go") $json.commercial_go_live

$guardDefaults = $json.guard_object_defaults.production_access
$falseGuards = @(
  "enabled",
  "owner_approved",
  "production_keys_enabled",
  "paid_beta_enabled",
  "real_payments_enabled",
  "invoices_enabled",
  "personal_data_enabled",
  "real_customer_data_enabled",
  "external_outreach_enabled",
  "marketplace_publication_enabled",
  "hosted_public_mcp_enabled",
  "registry_submission_enabled"
)

foreach ($field in $falseGuards) {
  Add-Check "Guard default false: $field" (-not [bool]$guardDefaults.$field) "$field=false"
}

$requiredPrefixes = @("ms_sbx_", "ms_live_", "ms_admin_", "ms_wh_test_")
foreach ($prefix in $requiredPrefixes) {
  $found = @($json.key_classes | Where-Object { $_.prefix -eq $prefix }).Count -eq 1
  Add-Check "Key prefix present: $prefix" $found $prefix
}

$live = @($json.key_classes | Where-Object { $_.prefix -eq "ms_live_" })[0]
Add-Check "Live key not allowed now" (-not [bool]$live.allowed_now) "ms_live_ allowed_now=false"

$requiredActions = @(
  "issue_production_api_key",
  "activate_production_customer",
  "execute_live_payment",
  "collect_payment_method",
  "issue_invoice",
  "process_real_customer_data",
  "process_personal_data",
  "contact_external_company_or_person",
  "publish_marketplace_listing",
  "launch_hosted_public_mcp",
  "submit_mcp_registry",
  "exceed_cost_cap",
  "kill_switch_active"
)

foreach ($action in $requiredActions) {
  $items = @($json.guarded_actions | Where-Object { $_.action -eq $action })
  Add-Check "Guarded action present: $action" ($items.Count -eq 1) $action
  if ($items.Count -eq 1) {
    Add-Check "Guarded action not allowed by default: $action" (($items[0].default_state -eq "blocked") -or ($items[0].default_state -eq "paused")) $items[0].default_state
  }
}

$requiredCodes = @(
  "MS_PRODUCTION_KEY_BLOCKED",
  "MS_COST_CAP_BLOCKED",
  "MS_PAYMENT_BLOCKED",
  "MS_INVOICE_BLOCKED",
  "MS_REAL_DATA_BLOCKED",
  "MS_PERSONAL_DATA_BLOCKED",
  "MS_EXTERNAL_CONTACT_BLOCKED",
  "MS_KILL_SWITCH_ACTIVE",
  "MS_SUPPORT_OWNER_REVIEW_REQUIRED",
  "MS_SUPPORT_SECURITY_REVIEW_REQUIRED"
)

foreach ($code in $requiredCodes) {
  $found = @($json.required_support_codes | Where-Object { $_ -eq $code }).Count -gt 0
  Add-Check "Support code present: $code" $found $code
}

$requiredBlockedFields = @(
  "status",
  "support_code",
  "owner_escalation_required",
  "credit_delta",
  "production_key_active",
  "real_payment_executed",
  "invoice_issued",
  "external_contact_executed",
  "next_allowed_actions"
)

foreach ($field in $requiredBlockedFields) {
  $found = @($json.required_blocked_response_fields | Where-Object { $_ -eq $field }).Count -gt 0
  Add-Check "Blocked response field present: $field" $found $field
}

$requiredInvariants = @(
  "blocked_responses_never_consume_new_paid_credits",
  "blocked_payment_invoice_contact_responses_report_false",
  "production_access_blocked_responses_are_machine_readable",
  "blocked_responses_do_not_reveal_secrets"
)

foreach ($item in $requiredInvariants) {
  $found = @($json.required_invariants | Where-Object { $_ -eq $item }).Count -gt 0
  Add-Check "Invariant present: $item" $found $item
}

$forbiddenAudit = @(
  "full_api_key",
  "password",
  "payment_card_data",
  "full_personal_payload",
  "real_customer_datasets",
  "provider_log_secrets"
)

foreach ($field in $forbiddenAudit) {
  $found = @($json.audit_forbidden_fields | Where-Object { $_ -eq $field }).Count -gt 0
  Add-Check "Forbidden audit field present: $field" $found $field
}

$requiredEndpointFamilies = @(
  "/v1/sandbox/*",
  "/v1/score",
  "/v1/purchase-intent",
  "/v1/payment-test/*",
  "/v1/orders*",
  "/v1/usage",
  "/v1/admin/*",
  "public_docs_endpoints"
)

foreach ($endpoint in $requiredEndpointFamilies) {
  $found = @($json.endpoint_impact_map | Where-Object { $_.endpoint_family -eq $endpoint }).Count -gt 0
  Add-Check "Endpoint impact present: $endpoint" $found $endpoint
}

$requiredTests = @(
  "production_key_blocked_by_default",
  "payment_blocked_by_default",
  "invoice_blocked_by_default",
  "personal_data_blocked_by_default",
  "external_contact_blocked_by_default",
  "cost_cap_block_returns_MS_COST_CAP_BLOCKED",
  "kill_switch_returns_MS_KILL_SWITCH_ACTIVE",
  "blocked_actions_consume_no_credit",
  "audit_records_are_redacted",
  "sandbox_path_still_works"
)

foreach ($test in $requiredTests) {
  $found = @($json.after_implementation_tests | Where-Object { $_ -eq $test }).Count -gt 0
  Add-Check "After-implementation test present: $test" $found $test
}

Add-Check "Markdown says no Worker code changed" ($md -match "no Worker code changed") "markdown no-write"
Add-Check "Markdown states production API keys blocked" ($md -match "PRODUCTION API KEYS: BLOCKED") "markdown verdict"
Add-Check "Markdown states paid beta not approved" ($md -match "PAID BETA: NOT APPROVED") "markdown verdict"
Add-Check "Markdown states go-live no-go" ($md -match "COMMERCIAL GO-LIVE: NO-GO") "markdown verdict"
Add-Check "Markdown includes kill switch code" ($md -match "MS_KILL_SWITCH_ACTIVE") "markdown kill switch"

$failed = @($checks | Where-Object { -not $_.passed })
$summary = [pscustomobject]@{
  probe = "worker_production_guard_implementation_checklist_nowrite_probe"
  date = "2026-06-16"
  status = if ($failed.Count -eq 0) { "passed" } else { "failed" }
  checks_total = $checks.Count
  checks_failed = $failed.Count
  checks = $checks
}

$summary | ConvertTo-Json -Depth 8 | Set-Content -Path $SummaryPath -Encoding UTF8

$lines = @()
$lines += "# Worker Production Guard Implementation Checklist No-Write - Probe Report"
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
