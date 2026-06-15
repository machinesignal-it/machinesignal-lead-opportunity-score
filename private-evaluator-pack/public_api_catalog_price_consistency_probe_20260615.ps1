$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

$timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$siteCatalogUrl = "https://machinesignal.it/product-catalog.json?v=$timestamp"
$apiCatalogUrl = "https://machinesignal-api.beta-878.workers.dev/product-catalog.json?v=$timestamp"
$corePath = Join-Path (Split-Path -Parent $PSScriptRoot) "api_endpoint_minimal/core.mjs"

$siteCatalog = (Invoke-WebRequest -Uri $siteCatalogUrl -UseBasicParsing -TimeoutSec 30).Content | ConvertFrom-Json
$apiCatalog = (Invoke-WebRequest -Uri $apiCatalogUrl -UseBasicParsing -TimeoutSec 30).Content | ConvertFrom-Json
$core = Get-Content -Raw -LiteralPath $corePath

function Get-TextBlock {
    param(
        [string]$Text,
        [string]$StartPattern,
        [string]$EndPattern
    )
    $start = [regex]::Match($Text, $StartPattern)
    if (-not $start.Success) {
        return ""
    }
    $rest = $Text.Substring($start.Index)
    $end = [regex]::Match($rest, $EndPattern)
    if (-not $end.Success) {
        return $rest
    }
    return $rest.Substring(0, $end.Index)
}

$targetDiscoveryDeliveryBlock = Get-TextBlock $core 'target_discovery:\s*\{' '\n\s*domain_enrichment:\s*\{'
$domainEnrichmentDeliveryBlock = Get-TextBlock $core 'domain_enrichment:\s*\{' '\n\s*verification:\s*\{'

$checks = [ordered]@{
    site_target_discovery_price_249 = ($siteCatalog.products.target_discovery_pack_250.price_eur -eq 249)
    api_target_discovery_price_249 = ($apiCatalog.products.target_discovery_pack_250.price_eur -eq 249)
    core_target_discovery_delivery_price_249 = ($targetDiscoveryDeliveryBlock -match 'beta_price_range_eur:\s*"249"')
    core_target_discovery_delivery_not_149 = ($targetDiscoveryDeliveryBlock -notmatch 'beta_price_range_eur:\s*"149"')
    site_score_pack_price_119 = ($siteCatalog.products.score_pack_1k.price_eur -eq 119)
    api_score_pack_price_119 = ($apiCatalog.products.score_pack_1k.price_eur -eq 119)
    core_score_revenue_per_credit_0119 = ($core -match 'score_pack_1k:\s*0\.119')
    site_domain_enrichment_price_149 = ($siteCatalog.products.domain_enrichment_pack_100.price_eur -eq 149)
    api_domain_enrichment_price_149 = ($apiCatalog.products.domain_enrichment_pack_100.price_eur -eq 149)
    core_domain_enrichment_delivery_price_149 = ($domainEnrichmentDeliveryBlock -match 'beta_price_range_eur:\s*"149"')
    site_no_go = ($siteCatalog.status.go_live -eq "no_go")
    site_not_live = ($siteCatalog.status.commercial_status -eq "not_live")
    site_paid_beta_not_approved = ($siteCatalog.status.paid_beta -eq "not_approved")
}

$failed = @($checks.GetEnumerator() | Where-Object { -not $_.Value })
$result = [ordered]@{
    checked_at_utc = (Get-Date).ToUniversalTime().ToString("s") + "Z"
    test_id = "public_api_catalog_price_consistency_probe_20260615"
    urls = [ordered]@{
        site_catalog = $siteCatalogUrl
        api_catalog = $apiCatalogUrl
    }
    checks = $checks
    pass_count = @($checks.GetEnumerator() | Where-Object Value).Count
    total_count = $checks.Count
    status = if ($failed.Count -eq 0) { "PASS" } else { "FAIL" }
    failed_checks = @($failed | ForEach-Object { $_.Key })
    recommended_next_step = "rerun authenticated live API sandbox buyer journey after sandbox limit reset"
}

$reportPath = Join-Path $PSScriptRoot "public_api_catalog_price_consistency_probe_report_20260615.md"
$summaryPath = Join-Path $PSScriptRoot "public_api_catalog_price_consistency_probe_summary_20260615.json"

$report = @(
    "# Public/API Catalog Price Consistency Probe - 2026-06-15",
    "",
    "Status: $($result.status)",
    "Checks: $($result.pass_count)/$($result.total_count)",
    "",
    "## Failed Checks",
    "",
    $(if ($failed.Count -eq 0) { "None." } else { ($failed | ForEach-Object { "- $($_.Key)" }) -join "`n" }),
    "",
    "## Confirmed Prices",
    "",
    "- Target Discovery Pack 250: EUR 249",
    "- Score Pack 1k: EUR 119",
    "- Domain Enrichment Pack 100: EUR 149",
    "",
    "## Safety",
    "",
    "The public site catalog remains not-live, no-go and paid-beta-not-approved.",
    "",
    "## Recommended Next Step",
    "",
    $result.recommended_next_step
) -join "`n"

$report | Set-Content -LiteralPath $reportPath -Encoding UTF8
$result | ConvertTo-Json -Depth 10 | Set-Content -LiteralPath $summaryPath -Encoding UTF8

if ($failed.Count -gt 0) {
    throw "Catalog price consistency probe failed: $($result.failed_checks -join ', ')"
}

Write-Output "PASS $($result.pass_count)/$($result.total_count)"
