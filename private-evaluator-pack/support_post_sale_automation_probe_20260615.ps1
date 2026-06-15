$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

$jsonPath = Join-Path $PSScriptRoot "support_post_sale_automation_policy_20260615.json"
$mdPath = Join-Path $PSScriptRoot "support_post_sale_automation_policy_20260615.md"
$reportPath = Join-Path $PSScriptRoot "support_post_sale_automation_probe_report_20260615.md"
$summaryPath = Join-Path $PSScriptRoot "support_post_sale_automation_probe_summary_20260615.json"

$policy = Get-Content -Raw -LiteralPath $jsonPath | ConvertFrom-Json
$md = Get-Content -Raw -LiteralPath $mdPath
$timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()

$workerOpenApi = (Invoke-WebRequest -Uri "https://machinesignal-api.beta-878.workers.dev/openapi.json?v=$timestamp" -UseBasicParsing -TimeoutSec 30).Content | ConvertFrom-Json
$workerOnboardingRaw = (Invoke-WebRequest -Uri "https://machinesignal-api.beta-878.workers.dev/machine-onboarding.json?v=$timestamp" -UseBasicParsing -TimeoutSec 30).Content
$publicLlms = (Invoke-WebRequest -Uri "https://machinesignal.it/llms.txt?v=$timestamp" -UseBasicParsing -TimeoutSec 30).Content
$publicCatalogRaw = (Invoke-WebRequest -Uri "https://machinesignal.it/product-catalog.json?v=$timestamp" -UseBasicParsing -TimeoutSec 30).Content
$publicCatalog = $publicCatalogRaw | ConvertFrom-Json

$paths = $workerOpenApi.paths.PSObject.Properties.Name
$combinedPublicText = @($workerOnboardingRaw, $publicLlms, $publicCatalogRaw) -join "`n"

$requiredContractFields = @(
    "status",
    "support_code",
    "severity",
    "owner_escalation_required",
    "credit_delta",
    "real_payment_executed",
    "invoice_issued",
    "external_contact_executed",
    "next_allowed_actions"
)
$contractFields = @($policy.support_response_contract.required_fields)

$checks = [ordered]@{
    sandbox_support_allowed = ($policy.decision.sandbox_support -eq "allowed")
    paid_customer_support_not_live = ($policy.decision.paid_customer_support -eq "not_live")
    commercial_go_live_no_go = ($policy.decision.commercial_go_live -eq "no_go")
    openapi_has_usage = ($paths -contains "/v1/usage")
    openapi_has_orders = ($paths -contains "/v1/orders")
    openapi_has_single_order = ($paths -contains "/v1/orders/{order_intent_id}")
    openapi_has_onboarding = ($paths -contains "/v1/onboarding")
    openapi_has_admin_metrics = ($paths -contains "/v1/admin/sandbox-metrics")
    onboarding_mentions_usage = ($workerOnboardingRaw -match "usage")
    onboarding_mentions_orders = ($workerOnboardingRaw -match "orders")
    public_llms_mentions_health = ($publicLlms -match "health")
    public_llms_mentions_usage = ($publicLlms -match "usage")
    public_llms_mentions_orders = ($publicLlms -match "orders")
    public_catalog_no_real_payment = ($publicCatalog.status.payment_mode.real_payment_executed -eq $false)
    public_catalog_no_invoice = ($publicCatalog.status.payment_mode.invoice_issued -eq $false)
    public_catalog_no_payment_method = ($publicCatalog.status.payment_mode.payment_method_collection -eq $false)
    public_docs_no_external_contact = ($combinedPublicText -match "external_contact|external outreach|outreach" -and $combinedPublicText -match "false|blocked|no_go|not_live|non")
    support_contract_required_fields_present = (@($requiredContractFields | Where-Object { $contractFields -contains $_ }).Count -eq $requiredContractFields.Count)
    support_codes_include_sandbox_limit = ($policy.support_codes.PSObject.Properties.Name -contains "MS_SUPPORT_SANDBOX_LIMIT")
    support_codes_include_gate_failed = ($policy.support_codes.PSObject.Properties.Name -contains "MS_SUPPORT_GATE_FAILED")
    support_codes_include_security_review = ($policy.support_codes.PSObject.Properties.Name -contains "MS_SUPPORT_SECURITY_REVIEW_REQUIRED")
    anti_accumulation_owner_limit_3 = ($policy.anti_accumulation.max_owner_escalations_per_day -eq 3)
    anti_accumulation_stop_threshold_5 = ($policy.anti_accumulation.critical_escalations_stop_threshold_per_day -eq 5)
    data_forbids_full_api_key = (@($policy.data_handling.forbidden_to_store) -contains "full_api_key")
    data_forbids_payment_card_data = (@($policy.data_handling.forbidden_to_store) -contains "payment_card_data")
    data_forbids_full_personal_payload = (@($policy.data_handling.forbidden_to_store) -contains "full_personal_payload")
    owner_escalates_paid_beta = (@($policy.owner_escalation_cases) -contains "enable_paid_beta")
    owner_escalates_invoice = (@($policy.owner_escalation_cases) -contains "issue_invoice")
    owner_escalates_production_key = (@($policy.owner_escalation_cases) -contains "production_api_key_request")
    md_states_paid_not_live = ($md -match "Support for paid customers: not live")
}

$forbidden = @(
    "paid customer support: live",
    "commercial go-live: go",
    "real payments allowed",
    "invoice issuance allowed",
    "external outreach allowed",
    "store full api key",
    "payment method collection allowed"
)

foreach ($phrase in $forbidden) {
    $key = "forbidden_absent_" + (($phrase -replace "[^a-zA-Z0-9]+", "_").Trim("_"))
    $checks[$key] = (-not $combinedPublicText.ToLowerInvariant().Contains($phrase.ToLowerInvariant())) -and (-not $md.ToLowerInvariant().Contains($phrase.ToLowerInvariant()))
}

$failed = @($checks.GetEnumerator() | Where-Object { -not $_.Value })
$result = [ordered]@{
    checked_at_utc = (Get-Date).ToUniversalTime().ToString("s") + "Z"
    test_id = "support_post_sale_automation_probe_20260615"
    status = if ($failed.Count -eq 0) { "PASS" } else { "FAIL" }
    pass_count = @($checks.GetEnumerator() | Where-Object Value).Count
    total_count = $checks.Count
    failed_checks = @($failed | ForEach-Object { $_.Key })
    checks = $checks
}

$report = @(
    "# Support / Post-Sale Automation Probe - 2026-06-15",
    "",
    "Status: $($result.status)",
    "Checks: $($result.pass_count)/$($result.total_count)",
    "",
    "## Failed Checks",
    "",
    $(if ($failed.Count -eq 0) { "None." } else { ($failed | ForEach-Object { "- $($_.Key)" }) -join "`n" }),
    "",
    "## Interpretation",
    "",
    "Support/post-sale automation is ready for continued sandbox testing. Paid customer support remains not live."
) -join "`n"

$report | Set-Content -LiteralPath $reportPath -Encoding UTF8
$result | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $summaryPath -Encoding UTF8

if ($failed.Count -gt 0) {
    throw "Support post-sale automation probe failed: $($result.failed_checks -join ', ')"
}

Write-Output "PASS $($result.pass_count)/$($result.total_count)"
