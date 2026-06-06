param(
    [string]$PublicSite = "https://machinesignal.it",
    [string]$OutputPrefix = "machine_buyer_postman_discovery_probe_20260606"
)

$ErrorActionPreference = "Stop"

function Add-Check {
    param(
        [System.Collections.Generic.List[object]]$Checks,
        [string]$Name,
        [bool]$Ok,
        [string]$Details
    )
    $Checks.Add([pscustomobject]@{
        name = $Name
        ok = $Ok
        details = $Details
    })
}

function Get-Url {
    param([string]$Url)
    $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -Headers @{ "Cache-Control" = "no-cache" } -TimeoutSec 25
    [pscustomobject]@{
        url = $Url
        status = [int]$response.StatusCode
        content = [string]$response.Content
    }
}

$checks = [System.Collections.Generic.List[object]]::new()
$fetched = @{}

$urls = @{
    llms = "$PublicSite/llms.txt"
    postman_page = "$PublicSite/postman/"
    collection = "$PublicSite/postman_public_collection.json"
    environment = "$PublicSite/postman_public_environment_template.json"
    secret_scan = "$PublicSite/postman_workspace_secret_scan_20260606.json"
    import_pack = "$PublicSite/postman_workspace_import_pack_20260606.json"
    onboarding = "$PublicSite/machine-onboarding.json"
    sitemap = "$PublicSite/sitemap.xml"
}

foreach ($key in $urls.Keys) {
    $result = Get-Url -Url $urls[$key]
    $fetched[$key] = $result
    Add-Check -Checks $checks -Name "$key`_reachable" -Ok ($result.status -eq 200) -Details "HTTP $($result.status)"
}

$llms = $fetched["llms"].content
Add-Check -Checks $checks -Name "llms_lists_postman_page" -Ok ($llms.Contains("$PublicSite/postman/")) -Details "llms.txt includes /postman/"
Add-Check -Checks $checks -Name "llms_lists_postman_collection" -Ok ($llms.Contains("$PublicSite/postman_public_collection.json")) -Details "llms.txt includes public collection"
Add-Check -Checks $checks -Name "llms_lists_environment_template" -Ok ($llms.Contains("$PublicSite/postman_public_environment_template.json")) -Details "llms.txt includes environment template"
Add-Check -Checks $checks -Name "llms_lists_secret_scan" -Ok ($llms.Contains("$PublicSite/postman_workspace_secret_scan_20260606.json")) -Details "llms.txt includes secret scan"

$postmanPage = $fetched["postman_page"].content
Add-Check -Checks $checks -Name "postman_page_has_import_link" -Ok ($postmanPage.Contains("https://go.postman.co/import?url=https%3A%2F%2Fmachinesignal.it%2Fpostman_public_collection.json")) -Details "direct Postman import URL present"
Add-Check -Checks $checks -Name "postman_page_links_collection" -Ok ($postmanPage.Contains("/postman_public_collection.json")) -Details "collection JSON linked"
Add-Check -Checks $checks -Name "postman_page_links_environment" -Ok ($postmanPage.Contains("/postman_public_environment_template.json")) -Details "environment template linked"
Add-Check -Checks $checks -Name "postman_page_links_secret_scan" -Ok ($postmanPage.Contains("/postman_workspace_secret_scan_20260606.json")) -Details "secret scan linked"

$collection = $fetched["collection"].content | ConvertFrom-Json
$collectionItemCount = @($collection.item).Count
$secretVariables = @($collection.variable | Where-Object { $_.type -eq "secret" })
$nonBlankSecretVariables = @($secretVariables | Where-Object { [string]$_.value -ne "" })
$collectionText = $fetched["collection"].content
Add-Check -Checks $checks -Name "collection_valid_json" -Ok ($collection.info.name -ne $null) -Details $collection.info.name
Add-Check -Checks $checks -Name "collection_has_expected_request_count" -Ok ($collectionItemCount -ge 23) -Details "items=$collectionItemCount"
Add-Check -Checks $checks -Name "collection_secret_variables_blank" -Ok ($nonBlankSecretVariables.Count -eq 0) -Details "secret_variables=$($secretVariables.Count), non_blank=$($nonBlankSecretVariables.Count)"
Add-Check -Checks $checks -Name "collection_has_import_pack_request" -Ok ($collectionText.Contains("postman_workspace_import_pack_20260606.json")) -Details "import pack request present"
Add-Check -Checks $checks -Name "collection_has_secret_scan_request" -Ok ($collectionText.Contains("postman_workspace_secret_scan_20260606.json")) -Details "secret scan request present"

$environment = $fetched["environment"].content | ConvertFrom-Json
$environmentValues = @($environment.values)
$baseUrlValue = @($environmentValues | Where-Object { $_.key -eq "base_url" })[0]
$nonBlankPrivateValues = @($environmentValues | Where-Object { $_.key -ne "base_url" -and [string]$_.value -ne "" })
Add-Check -Checks $checks -Name "environment_valid_json" -Ok ($environment.name -ne $null) -Details $environment.name
Add-Check -Checks $checks -Name "environment_base_url_present" -Ok ($baseUrlValue.value -eq "https://machinesignal-api.beta-878.workers.dev") -Details "base_url=$($baseUrlValue.value)"
Add-Check -Checks $checks -Name "environment_private_values_blank" -Ok ($nonBlankPrivateValues.Count -eq 0) -Details "non_blank_private_values=$($nonBlankPrivateValues.Count)"

$secretScan = $fetched["secret_scan"].content | ConvertFrom-Json
Add-Check -Checks $checks -Name "secret_scan_passed" -Ok ($secretScan.status -eq "passed") -Details "status=$($secretScan.status)"
Add-Check -Checks $checks -Name "secret_scan_no_secret_hits" -Ok (@($secretScan.secret_hits).Count -eq 0) -Details "secret_hits=$(@($secretScan.secret_hits).Count)"
Add-Check -Checks $checks -Name "secret_scan_no_live_credits" -Ok ([int]$secretScan.live_credits_consumed -eq 0) -Details "live_credits_consumed=$($secretScan.live_credits_consumed)"

$importPack = $fetched["import_pack"].content | ConvertFrom-Json
Add-Check -Checks $checks -Name "import_pack_private_workspace_rule" -Ok (($importPack | ConvertTo-Json -Depth 20).Contains("private")) -Details "private workspace language present"

$onboarding = $fetched["onboarding"].content | ConvertFrom-Json
$onboardingText = $fetched["onboarding"].content
Add-Check -Checks $checks -Name "onboarding_lists_postman_import_page" -Ok ($onboarding.discovery.postman_import_page -eq "$PublicSite/postman/") -Details "postman_import_page=$($onboarding.discovery.postman_import_page)"
Add-Check -Checks $checks -Name "onboarding_latest_status_published_candidate" -Ok ($onboardingText.Contains("latest_postman_import_page_status")) -Details "latest status field present"

[xml]$sitemapXml = $fetched["sitemap"].content
Add-Check -Checks $checks -Name "sitemap_valid_xml" -Ok ($sitemapXml.urlset -ne $null) -Details "urlset present"
Add-Check -Checks $checks -Name "sitemap_lists_postman_page" -Ok ($fetched["sitemap"].content.Contains("$PublicSite/postman/")) -Details "sitemap includes /postman/"

$failed = @($checks | Where-Object { -not $_.ok })
$summary = [pscustomobject]@{
    ok = ($failed.Count -eq 0)
    probe_name = "machine_buyer_postman_discovery_probe"
    run_date = "2026-06-06"
    public_site = $PublicSite
    machine_path = @(
        "$PublicSite/llms.txt",
        "$PublicSite/postman/",
        "$PublicSite/postman_public_collection.json",
        "$PublicSite/postman_public_environment_template.json",
        "$PublicSite/postman_workspace_secret_scan_20260606.json",
        "$PublicSite/machine-onboarding.json"
    )
    postman_import_url = "https://go.postman.co/import?url=https%3A%2F%2Fmachinesignal.it%2Fpostman_public_collection.json"
    collection_item_count = $collectionItemCount
    secret_variables = $secretVariables.Count
    non_blank_secret_variables = $nonBlankSecretVariables.Count
    live_credits_consumed = 0
    real_payment_executed = $false
    external_contact_executed = $false
    checks = $checks
    failed_checks = $failed
    conclusion = if ($failed.Count -eq 0) {
        "PASS: a machine buyer can discover the Postman import route, validate the collection, import a blank environment template and verify the secret scan without human email outreach."
    } else {
        "FAIL: one or more Postman discovery checks failed."
    }
}

$jsonPath = "$OutputPrefix`_summary.json"
$mdPath = "$OutputPrefix`_report.md"
$summary | ConvertTo-Json -Depth 20 | Set-Content -LiteralPath $jsonPath -Encoding utf8

$lines = [System.Collections.Generic.List[string]]::new()
$lines.Add("# Machine buyer Postman discovery probe - 2026-06-06")
$lines.Add("")
$lines.Add("## Scope")
$lines.Add("")
$lines.Add("This probe verifies whether a software system, CRM workflow or AI agent can discover MachineSignal's Postman testing resources without human email outreach.")
$lines.Add("")
$lines.Add("## Result")
$lines.Add("")
$lines.Add("- Status: **$($summary.ok)**")
$lines.Add("- Collection requests: $collectionItemCount")
$lines.Add("- Secret variables: $($secretVariables.Count)")
$lines.Add("- Non-blank secret variables: $($nonBlankSecretVariables.Count)")
$lines.Add("- Live credits consumed: 0")
$lines.Add("- Real payment executed: false")
$lines.Add("- External contact executed: false")
$lines.Add("")
$lines.Add("## Machine path")
$lines.Add("")
foreach ($path in $summary.machine_path) {
    $lines.Add("- ``$path``")
}
$lines.Add("")
$lines.Add("## Import URL")
$lines.Add("")
$lines.Add("``$($summary.postman_import_url)``")
$lines.Add("")
$lines.Add("## Checks")
$lines.Add("")
foreach ($check in $checks) {
    $status = if ($check.ok) { "PASS" } else { "FAIL" }
    $lines.Add("- $status - $($check.name): $($check.details)")
}
$lines.Add("")
$lines.Add("## Interpretation")
$lines.Add("")
$lines.Add($summary.conclusion)
$lines.Add("")
$lines.Add("## Guardrails")
$lines.Add("")
$lines.Add("- Keep the Postman workspace private until owner approval.")
$lines.Add("- Do not publish private API keys, customer IDs, payment test IDs or webhook signatures.")
$lines.Add("- Do not run live payment or external outreach flows during this discovery test.")
$lines.Add("- This probe does not consume product credits.")

$lines | Set-Content -LiteralPath $mdPath -Encoding utf8

if (-not $summary.ok) {
    $summary | ConvertTo-Json -Depth 20
    exit 2
}

$summary | ConvertTo-Json -Depth 20
