$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

$timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$catalogUrl = "https://machinesignal.it/product-catalog.json?v=$timestamp"
$onboardingUrl = "https://machinesignal.it/machine-onboarding.json?v=$timestamp"
$llmsUrl = "https://machinesignal.it/llms.txt?v=$timestamp"

$catalog = (Invoke-WebRequest -Uri $catalogUrl -UseBasicParsing -TimeoutSec 30).Content | ConvertFrom-Json
$onboarding = (Invoke-WebRequest -Uri $onboardingUrl -UseBasicParsing -TimeoutSec 30).Content | ConvertFrom-Json
$llms = (Invoke-WebRequest -Uri $llmsUrl -UseBasicParsing -TimeoutSec 30).Content

$checks = [ordered]@{
    catalog_version = ($catalog.catalog_version -eq "2026-06-15-beta-readiness-proposal")
    catalog_not_live = ($catalog.status.commercial_status -eq "not_live")
    catalog_no_go = ($catalog.status.go_live -eq "no_go")
    catalog_paid_beta_not_approved = ($catalog.status.paid_beta -eq "not_approved")
    catalog_real_payment_false = ($catalog.status.payment_mode.real_payment_executed -eq $false)
    catalog_payment_method_false = ($catalog.status.payment_mode.payment_method_collection -eq $false)
    catalog_invoice_false = ($catalog.status.payment_mode.invoice_issued -eq $false)
    catalog_production_keys_false = ($catalog.status.key_policy.production_keys_allowed -eq $false)
    catalog_personal_data_false = ($catalog.status.data_policy.personal_data_allowed -eq $false)
    target_discovery_price_249 = ($catalog.products.target_discovery_pack_250.price_eur -eq 249)
    score_pack_price_119 = ($catalog.products.score_pack_1k.price_eur -eq 119)
    onboarding_not_live = ($onboarding.status.commercial_status -eq "not_live")
    onboarding_no_go = ($onboarding.status.go_live -eq "no_go")
    onboarding_paid_beta_not_approved = ($onboarding.status.paid_beta -eq "not_approved")
    onboarding_payment_test_mode = ($onboarding.payment_and_billing.mode -eq "test_mode_only")
    llms_not_live = ($llms -match "commercial_status: not_live")
    llms_no_go = ($llms -match "go_live: no_go")
    llms_target_price = ($llms -match "Target Discovery Pack 250: EUR 249")
    llms_score_price = ($llms -match "Score Pack 1k: EUR 119")
    llms_no_real_payment = ($llms -match "no real payment")
}

$failed = @($checks.GetEnumerator() | Where-Object { -not $_.Value })
$result = [ordered]@{
    checked_at_utc = (Get-Date).ToUniversalTime().ToString("s") + "Z"
    urls = [ordered]@{
        product_catalog = $catalogUrl
        machine_onboarding = $onboardingUrl
        llms = $llmsUrl
    }
    checks = $checks
    pass_count = @($checks.GetEnumerator() | Where-Object Value).Count
    total_count = $checks.Count
    status = if ($failed.Count -eq 0) { "PASS" } else { "FAIL" }
    failed_checks = @($failed | ForEach-Object { $_.Key })
}

$reportPath = Join-Path $PSScriptRoot "live_public_docs_alignment_validation_probe_20260615.report.json"
$summaryPath = Join-Path $PSScriptRoot "live_public_docs_alignment_validation_probe_20260615.summary.txt"

$result | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $reportPath -Encoding UTF8
@(
    "MachineSignal live public docs alignment validation",
    "Status: $($result.status)",
    "Checks: $($result.pass_count)/$($result.total_count)",
    "Failed checks: $($result.failed_checks -join ', ')",
    "Checked at UTC: $($result.checked_at_utc)"
) | Set-Content -LiteralPath $summaryPath -Encoding UTF8

if ($failed.Count -gt 0) {
    throw "Live public docs validation failed: $($result.failed_checks -join ', ')"
}

Write-Output "PASS $($result.pass_count)/$($result.total_count)"
