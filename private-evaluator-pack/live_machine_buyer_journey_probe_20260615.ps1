$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

$timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()

function Get-LiveContent {
    param([string]$Url)
    return (Invoke-WebRequest -Uri "${Url}?v=$timestamp" -UseBasicParsing -TimeoutSec 30).Content
}

$sourceUrls = [ordered]@{
    product_catalog = "https://machinesignal.it/product-catalog.json"
    machine_onboarding = "https://machinesignal.it/machine-onboarding.json"
    llms = "https://machinesignal.it/llms.txt"
    openapi = "https://machinesignal.it/openapi.json"
    machine_discovery = "https://machinesignal.it/machine-discovery/"
    api_page = "https://machinesignal.it/api/"
    beta_page = "https://machinesignal.it/beta/"
}

$catalogRaw = Get-LiveContent $sourceUrls.product_catalog
$onboardingRaw = Get-LiveContent $sourceUrls.machine_onboarding
$llms = Get-LiveContent $sourceUrls.llms
$openapiRaw = Get-LiveContent $sourceUrls.openapi
$machineDiscoveryHtml = Get-LiveContent $sourceUrls.machine_discovery
$apiHtml = Get-LiveContent $sourceUrls.api_page
$betaHtml = Get-LiveContent $sourceUrls.beta_page

$catalog = $catalogRaw | ConvertFrom-Json
$onboarding = $onboardingRaw | ConvertFrom-Json
$openapi = $openapiRaw | ConvertFrom-Json

$combinedText = @(
    $catalogRaw,
    $onboardingRaw,
    $llms,
    $openapiRaw,
    $machineDiscoveryHtml,
    $apiHtml,
    $betaHtml
) -join "`n"

$checks = [ordered]@{
    all_live_sources_200_and_readable = ($catalogRaw.Length -gt 1000 -and $onboardingRaw.Length -gt 1000 -and $llms.Length -gt 500 -and $openapiRaw.Length -gt 1000)
    catalog_status_not_live = ($catalog.status.commercial_status -eq "not_live")
    catalog_go_live_no_go = ($catalog.status.go_live -eq "no_go")
    catalog_paid_beta_not_approved = ($catalog.status.paid_beta -eq "not_approved")
    catalog_blocks_real_payment = ($catalog.status.payment_mode.real_payment_executed -eq $false)
    catalog_blocks_payment_method_collection = ($catalog.status.payment_mode.payment_method_collection -eq $false)
    catalog_blocks_invoice = ($catalog.status.payment_mode.invoice_issued -eq $false)
    catalog_blocks_production_keys = ($catalog.status.key_policy.production_keys_allowed -eq $false)
    catalog_blocks_personal_data = ($catalog.status.data_policy.personal_data_allowed -eq $false)
    onboarding_status_not_live = ($onboarding.status.commercial_status -eq "not_live")
    onboarding_payment_test_mode = ($onboarding.payment_and_billing.mode -eq "test_mode_only")
    score_pack_present = ($null -ne $catalog.products.score_pack_1k)
    score_pack_price_119 = ($catalog.products.score_pack_1k.price_eur -eq 119)
    score_pack_valid_output_logic = ($combinedText -match "valid-output|valid output|output valido|valid scores")
    score_pack_recommended_next_purchase = ($combinedText -match "recommended_next_purchase|recommended next purchase")
    target_discovery_present = ($null -ne $catalog.products.target_discovery_pack_250)
    target_discovery_price_249 = ($catalog.products.target_discovery_pack_250.price_eur -eq 249)
    target_discovery_market_precheck = ($combinedText -match "market availability pre-check|pre-check")
    target_discovery_250_coherent_targets = ($combinedText -match "250 coherent targets|250 target coerenti|250 target")
    target_discovery_no_weak_filler = ($combinedText -match "weak filler|target deboli|weak targets")
    action_pack_present = ($combinedText -match "action_pack|Action Pack")
    action_pack_internal_action = ($combinedText -match "CRM|workflow|agent_instructions|action instructions")
    external_contact_blocked = ($combinedText -match "external contact|outreach|human_outreach|contatta" -and $combinedText -match "blocked|false|non invia|non contatta|blocc")
    llms_machine_readable = ($llms -match "MachineSignal" -and $llms -match "commercial_status: not_live" -and $llms -match "go_live: no_go")
    openapi_has_score_endpoint = ($openapiRaw -match "/v1/lead-opportunity-score")
    openapi_has_purchase_intent_endpoint = ($openapiRaw -match "/v1/purchase-intent")
    machine_discovery_points_to_machine_docs = ($machineDiscoveryHtml -match "machine" -and $machineDiscoveryHtml -match "llms|openapi|catalog|onboarding")
    api_page_points_to_docs = ($apiHtml -match "openapi|API|endpoint")
    beta_page_remains_test_or_beta = ($betaHtml -match "beta|sandbox|test|demo")
}

$forbiddenPhrases = @(
    '"commercial_status": "live"',
    '"go_live": "go"',
    '"paid_beta": "approved"',
    '"real_payment_executed": true',
    '"payment_method_collection": true',
    '"invoice_issued": true',
    '"production_keys_allowed": true',
    '"personal_data_allowed": true',
    'pagamento reale attivo',
    'go-live approvato'
)

foreach ($phrase in $forbiddenPhrases) {
    $key = "forbidden_absent_" + (($phrase -replace "[^a-zA-Z0-9]+", "_").Trim("_"))
    $checks[$key] = (-not $combinedText.ToLowerInvariant().Contains($phrase.ToLowerInvariant()))
}

$failed = @($checks.GetEnumerator() | Where-Object { -not $_.Value })
$result = [ordered]@{
    checked_at_utc = (Get-Date).ToUniversalTime().ToString("s") + "Z"
    test_id = "live_machine_buyer_journey_probe_20260615"
    source_urls = $sourceUrls
    checks = $checks
    pass_count = @($checks.GetEnumerator() | Where-Object Value).Count
    total_count = $checks.Count
    status = if ($failed.Count -eq 0) { "PASS" } else { "FAIL" }
    failed_checks = @($failed | ForEach-Object { $_.Key })
    recommended_next_step = "live_api_sandbox_machine_buyer_journey_probe"
}

$reportPath = Join-Path $PSScriptRoot "live_machine_buyer_journey_probe_report_20260615.md"
$summaryPath = Join-Path $PSScriptRoot "live_machine_buyer_journey_probe_summary_20260615.json"

$report = @(
    "# Live Machine Buyer Journey Probe - 2026-06-15",
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
    "The live public documentation can guide a synthetic machine buyer through list scoring, target discovery and next-action preparation while preserving the not-live/no-go/test-only guardrails.",
    "",
    "## Recommended Next Step",
    "",
    $result.recommended_next_step
) -join "`n"

$report | Set-Content -LiteralPath $reportPath -Encoding UTF8
$result | ConvertTo-Json -Depth 10 | Set-Content -LiteralPath $summaryPath -Encoding UTF8

if ($failed.Count -gt 0) {
    throw "Live machine buyer journey probe failed: $($result.failed_checks -join ', ')"
}

Write-Output "PASS $($result.pass_count)/$($result.total_count)"
