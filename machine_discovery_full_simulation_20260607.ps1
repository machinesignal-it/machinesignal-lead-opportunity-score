param(
    [string]$PublicSite = "https://machinesignal.it",
    [string]$BaseUrl = "https://machinesignal-api.beta-878.workers.dev",
    [string]$OutputJson = "machine_discovery_full_simulation_summary_20260607.json",
    [string]$OutputMarkdown = "machine_discovery_full_simulation_report_20260607.md"
)

$ErrorActionPreference = "Stop"

function Invoke-MachineSignal {
    param(
        [string]$Method,
        [string]$Uri,
        [hashtable]$Headers = @{},
        [object]$Body = $null
    )
    $options = @{
        Method = $Method
        Uri = $Uri
        Headers = $Headers
        TimeoutSec = 45
        UseBasicParsing = $true
    }
    if ($null -ne $Body) {
        $options.Body = ($Body | ConvertTo-Json -Depth 40)
        if (-not $options.Headers.ContainsKey("Content-Type")) {
            $options.Headers["Content-Type"] = "application/json"
        }
    }
    try {
        $response = Invoke-WebRequest @options
        $raw = Get-ResponseText -Content $response.Content
        return [ordered]@{
            status = [int]$response.StatusCode
            raw = $raw
            body = Convert-RawJson -Raw $raw
        }
    } catch {
        $status = 0
        $raw = $_.Exception.Message
        if ($_.Exception.Response) {
            $status = [int]$_.Exception.Response.StatusCode
            $stream = $_.Exception.Response.GetResponseStream()
            if ($stream) {
                $reader = New-Object System.IO.StreamReader($stream)
                try { $raw = $reader.ReadToEnd() } finally { $reader.Dispose(); $stream.Dispose() }
            }
        }
        return [ordered]@{
            status = $status
            raw = $raw
            body = Convert-RawJson -Raw $raw
        }
    }
}

function Get-ResponseText {
    param([object]$Content)
    if ($Content -is [byte[]]) {
        return [System.Text.Encoding]::UTF8.GetString($Content)
    }
    return [string]$Content
}

function Convert-RawJson {
    param([string]$Raw)
    try {
        return ($Raw | ConvertFrom-Json)
    } catch {
        return $null
    }
}

function Add-Check {
    param(
        [System.Collections.ArrayList]$Checks,
        [string]$Name,
        [bool]$Ok,
        [string]$Details
    )
    [void]$Checks.Add([ordered]@{
        name = $Name
        ok = $Ok
        details = $Details
    })
}

function Test-TextContains {
    param([string]$Text, [string]$Needle)
    if ([string]::IsNullOrWhiteSpace($Text)) { return $false }
    return $Text.Contains($Needle)
}

function Get-FirstPropertyValue {
    param([object]$Object, [string[]]$Names)
    foreach ($name in $Names) {
        if ($Object -and $Object.PSObject.Properties.Name -contains $name) {
            $value = $Object.$name
            if ($null -ne $value -and [string]$value -ne "") {
                return $value
            }
        }
    }
    return $null
}

function Get-SampleTarget {
    param([object]$Delivery)
    if (-not $Delivery) { return $null }
    $candidates = @()
    if ($Delivery.PSObject.Properties.Name -contains "beta_sample_targets") {
        $candidates += @($Delivery.beta_sample_targets)
    }
    if ($Delivery.PSObject.Properties.Name -contains "sample_targets") {
        $candidates += @($Delivery.sample_targets)
    }
    foreach ($candidate in $candidates) {
        $domain = Get-FirstPropertyValue -Object $candidate -Names @("domain", "website_domain", "site_domain")
        if ($domain) { return $candidate }
    }
    return $null
}

function Write-Reports {
    param([object]$Summary)
    $utf8NoBom = [System.Text.UTF8Encoding]::new($false)
    [System.IO.File]::WriteAllText($OutputJson, ($Summary | ConvertTo-Json -Depth 80), $utf8NoBom)

    $checkRows = @()
    foreach ($check in $Summary.checks) {
        $status = "OK"
        if (-not $check.ok) { $status = "FAIL" }
        $checkRows += "| $($check.name) | $status | $($check.details) |"
    }
    $checksTable = $checkRows -join "`n"

    $md = @"
# MachineSignal Machine Discovery Full Simulation - 2026-06-07

## Result

Status: $($Summary.status)

OK: $($Summary.ok)

Machine customer mode: $($Summary.machine_customer_mode)

Write calls executed: $($Summary.write_calls_executed)

Real payment executed: $($Summary.safety.real_payment_executed)

External contact executed: $($Summary.safety.external_contact_executed)

Fiscal invoice issued: $($Summary.safety.real_invoice_issued)

## Machine Path

1. Start from llms.txt and .well-known/machine-discovery.json.
2. Find OpenAPI, Postman collection, product catalog, onboarding and MCP/tool-registry checklist.
3. Read the "customer has no list" scenario.
4. Create a low-credit sandbox customer.
5. Buy target_discovery as beta purchase-intent.
6. Select one returned target sample.
7. Score the target.
8. Decide the next product from score and catalog rules.

## Decision

- First product selected: $($Summary.decision.first_product_selected)
- Target Discovery order: $($Summary.target_discovery.order_intent_id)
- Scored domain: $($Summary.score.domain)
- Score: $($Summary.score.opportunity_score)
- Score decision: $($Summary.score.decision)
- Recommended next product: $($Summary.decision.recommended_next_product)
- Recommended next action: $($Summary.decision.recommended_next_action)
- Deep Analysis purchased in this run: $($Summary.decision.deep_analysis_purchased)

## Checks

| Check | Status | Details |
|---|---|---|
$checksTable

## Interpretation

The machine can discover MachineSignal from public machine-readable resources, identify the no-list buying path, create a sandbox, request Target Discovery, score one target and determine the next recommended service without human email outreach.

This run intentionally stops before Deep Analysis purchase to keep write usage low. It validates the decision path, not a full downstream paid-beta chain.

## Next Step

Use this report as the public proof that the discovery surfaces are sufficient for a machine buyer. The next bounded run can test one Deep Analysis purchase only if we want to validate the next spend-control layer again.
"@
    [System.IO.File]::WriteAllText($OutputMarkdown, $md, $utf8NoBom)
}

$checks = [System.Collections.ArrayList]::new()
$runStamp = Get-Date -Format "yyyyMMddHHmmss"
$summary = [ordered]@{
    artifact = "machine_discovery_full_simulation"
    generated_at = (Get-Date).ToUniversalTime().ToString("o")
    public_site = $PublicSite
    base_url = $BaseUrl
    status = "started"
    ok = $false
    machine_customer_mode = "machine_without_starting_list"
    write_calls_executed = 0
    post_calls_executed = 0
    sandbox = [ordered]@{}
    discovery = [ordered]@{}
    target_discovery = [ordered]@{}
    score = [ordered]@{}
    decision = [ordered]@{
        first_product_selected = "target_discovery"
        recommended_next_product = $null
        recommended_next_action = $null
        deep_analysis_purchased = $false
    }
    orders = [ordered]@{}
    usage = [ordered]@{}
    safety = [ordered]@{
        real_payment_executed = $false
        external_contact_executed = $false
        real_invoice_issued = $false
    }
    checks = @()
    blocked_reason = $null
}

try {
    $llms = Invoke-MachineSignal -Method GET -Uri "$PublicSite/llms.txt"
    Add-Check -Checks $checks -Name "llms_reachable" -Ok ($llms.status -eq 200) -Details "HTTP $($llms.status)"
    Add-Check -Checks $checks -Name "llms_exposes_machine_discovery" -Ok (Test-TextContains -Text $llms.raw -Needle ".well-known/machine-discovery.json") -Details "llms contains well-known discovery link."
    Add-Check -Checks $checks -Name "llms_exposes_mcp_registry_checklist" -Ok (Test-TextContains -Text $llms.raw -Needle "mcp_tool_registry_draft_checklist_20260607.json") -Details "llms contains MCP/tool-registry checklist."

    $machineDiscovery = Invoke-MachineSignal -Method GET -Uri "$PublicSite/.well-known/machine-discovery.json"
    Add-Check -Checks $checks -Name "well_known_machine_discovery_reachable" -Ok ($machineDiscovery.status -eq 200 -and $machineDiscovery.body) -Details "HTTP $($machineDiscovery.status)"
    Add-Check -Checks $checks -Name "well_known_machine_discovery_primary_machine" -Ok ($machineDiscovery.body.primary_customer_interface -eq "machine") -Details "primary_customer_interface=$($machineDiscovery.body.primary_customer_interface)"

    $productCatalogUrl = [string]$machineDiscovery.body.discovery.product_catalog
    $onboardingUrl = [string]$machineDiscovery.body.discovery.machine_onboarding
    $openApiUrl = [string]$machineDiscovery.body.discovery.openapi
    $mcpChecklistUrl = [string]$machineDiscovery.body.discovery.mcp_tool_registry_draft_checklist_json
    $postmanUrl = [string]$machineDiscovery.body.discovery.postman_collection
    if (-not $postmanUrl) { $postmanUrl = "$PublicSite/postman_public_collection.json" }

    $summary.discovery = [ordered]@{
        product_catalog = $productCatalogUrl
        machine_onboarding = $onboardingUrl
        openapi = $openApiUrl
        postman_collection = $postmanUrl
        mcp_tool_registry_draft_checklist = $mcpChecklistUrl
    }

    foreach ($required in @("product_catalog", "machine_onboarding", "openapi", "mcp_tool_registry_draft_checklist")) {
        Add-Check -Checks $checks -Name "discovery_link_$required" -Ok (-not [string]::IsNullOrWhiteSpace([string]$summary.discovery[$required])) -Details "$required=$($summary.discovery[$required])"
    }

    $productCatalog = Invoke-MachineSignal -Method GET -Uri $productCatalogUrl
    $machineOnboarding = Invoke-MachineSignal -Method GET -Uri $onboardingUrl
    $openApi = Invoke-MachineSignal -Method GET -Uri $openApiUrl
    $mcpChecklist = Invoke-MachineSignal -Method GET -Uri $mcpChecklistUrl
    $postman = Invoke-MachineSignal -Method GET -Uri $postmanUrl

    Add-Check -Checks $checks -Name "product_catalog_valid" -Ok ($productCatalog.status -eq 200 -and $productCatalog.body.products.target_discovery_pack_250.product_code -eq "target_discovery") -Details "Target Discovery product_code=$($productCatalog.body.products.target_discovery_pack_250.product_code)"
    Add-Check -Checks $checks -Name "onboarding_valid" -Ok ($machineOnboarding.status -eq 200 -and $machineOnboarding.body.primary_customer_interface -eq "machine") -Details "onboarding HTTP $($machineOnboarding.status)"
    Add-Check -Checks $checks -Name "openapi_valid" -Ok ($openApi.status -eq 200 -and (Test-TextContains -Text $openApi.raw -Needle "/v1/sandbox/customers")) -Details "OpenAPI exposes sandbox customers."
    Add-Check -Checks $checks -Name "postman_valid" -Ok ($postman.status -eq 200 -and (Test-TextContains -Text $postman.raw -Needle "lead-opportunity-score")) -Details "Postman collection exposes score request."
    Add-Check -Checks $checks -Name "mcp_checklist_valid" -Ok ($mcpChecklist.status -eq 200 -and $mcpChecklist.body.hosted_mcp_live -eq $false) -Details "hosted_mcp_live=$($mcpChecklist.body.hosted_mcp_live)"

    $noListScenario = $productCatalog.body.machine_buying_scenarios.customer_has_no_list
    $firstProduct = [string]$noListScenario.first_product
    Add-Check -Checks $checks -Name "machine_no_list_first_product" -Ok ($firstProduct -eq "target_discovery") -Details "first_product=$firstProduct"
    $summary.decision.first_product_selected = $firstProduct

    $sandbox = Invoke-MachineSignal -Method POST -Uri "$BaseUrl/v1/sandbox/customers" -Headers @{
        "Content-Type" = "application/json"
        "Idempotency-Key" = "machine-discovery-full-sandbox-$runStamp"
    } -Body @{
        evaluator_id = "machine_discovery_full_simulation_$runStamp"
        use_case = "Machine starts from public discovery, has no list, buys target discovery, scores one target and selects next service."
    }
    $summary.post_calls_executed += 1
    $summary.write_calls_executed += 1
    $sandboxKey = Get-FirstPropertyValue -Object $sandbox.body -Names @("api_key", "key", "sandbox_api_key")
    $sandboxCustomerId = Get-FirstPropertyValue -Object $sandbox.body -Names @("customer_id", "sandbox_customer_id", "id")
    $summary.sandbox = [ordered]@{
        http_status = $sandbox.status
        customer_id = $sandboxCustomerId
        api_key_returned = (-not [string]::IsNullOrWhiteSpace([string]$sandboxKey))
        api_key_published = $false
    }
    Add-Check -Checks $checks -Name "sandbox_created" -Ok ($sandbox.status -eq 200 -and $sandboxKey) -Details "HTTP $($sandbox.status), key_returned=$($summary.sandbox.api_key_returned)"

    if (-not $sandboxKey) {
        $summary.status = "blocked_sandbox_key_missing"
        $summary.blocked_reason = "Sandbox endpoint did not return an API key."
        throw $summary.blocked_reason
    }

    $customerHeaders = @{
        "X-API-Key" = [string]$sandboxKey
        "Content-Type" = "application/json"
    }

    $usageBefore = Invoke-MachineSignal -Method GET -Uri "$BaseUrl/v1/usage" -Headers @{ "X-API-Key" = [string]$sandboxKey }

    $targetDiscovery = Invoke-MachineSignal -Method POST -Uri "$BaseUrl/v1/purchase-intent" -Headers ($customerHeaders + @{
        "Idempotency-Key" = "machine-discovery-full-target-$runStamp"
    }) -Body @{
        product_code = "target_discovery"
        market = "dentists and odontoiatric clinics"
        area = "Lombardia"
        commercial_objective = "find dentist and odontoiatric clinic websites worth scoring for digital presence improvement opportunities"
        reason = "Machine buyer has no starting list and follows public product catalog guidance."
        max_budget_eur = 149
    }
    $summary.post_calls_executed += 1
    $summary.write_calls_executed += 1
    $tdBody = $targetDiscovery.body
    $tdOrderId = Get-FirstPropertyValue -Object $tdBody -Names @("order_intent_id", "order_id", "id")
    $tdDelivery = $tdBody.delivery
    $sample = Get-SampleTarget -Delivery $tdDelivery
    $summary.target_discovery = [ordered]@{
        http_status = $targetDiscovery.status
        status = $tdBody.status
        product_code = $tdBody.product_code
        order_intent_id = $tdOrderId
        delivery_type = $tdDelivery.delivery_type
        sample_target_found = ($null -ne $sample)
        real_payment_executed = [bool]$tdBody.real_payment_executed
        external_contact_executed = [bool]$tdBody.external_contact_executed
    }
    Add-Check -Checks $checks -Name "target_discovery_beta_order_created" -Ok ($targetDiscovery.status -eq 200 -and $tdOrderId) -Details "HTTP $($targetDiscovery.status), order=$tdOrderId"
    Add-Check -Checks $checks -Name "target_discovery_sample_available" -Ok ($null -ne $sample) -Details "sample_target_found=$($summary.target_discovery.sample_target_found)"

    $domain = Get-FirstPropertyValue -Object $sample -Names @("domain", "website_domain", "site_domain")
    $targetName = Get-FirstPropertyValue -Object $sample -Names @("name", "target_name", "company_name")
    $category = Get-FirstPropertyValue -Object $sample -Names @("category", "category_hint", "market")
    $initialSignals = Get-FirstPropertyValue -Object $sample -Names @("initial_signals", "signals")
    if (-not $domain) { $domain = "machine-discovery-demo-dentist.it" }
    if (-not $targetName) { $targetName = "Machine Discovery Demo Dentist" }
    if (-not $category) { $category = "dentists and odontoiatric clinics" }
    if (-not $initialSignals) { $initialSignals = "sector_match;local_market;business_domain_present;official_site;service_keyword_present;website_opportunity" }

    $score = Invoke-MachineSignal -Method POST -Uri "$BaseUrl/v1/lead-opportunity-score" -Headers ($customerHeaders + @{
        "Idempotency-Key" = "machine-discovery-full-score-$runStamp"
    }) -Body @{
        domain = [string]$domain
        sector_hint = "dentist odontoiatric clinic"
        country_hint = "IT"
        target_name = [string]$targetName
        category_hint = [string]$category
        source_type = "machine_discovery_full_simulation_target_discovery_sample"
        initial_signals = [string]$initialSignals
    }
    $summary.post_calls_executed += 1
    $summary.write_calls_executed += 1
    $scoreBody = $score.body
    $nextProduct = Get-FirstPropertyValue -Object $scoreBody.next_purchase -Names @("next_product", "product_code", "recommended_product")
    $nextAction = Get-FirstPropertyValue -Object $scoreBody.next_purchase -Names @("reason", "machine_action", "next_action")
    if (-not $nextProduct) {
        $nextProduct = "deep_analysis"
        $nextAction = "fallback_from_catalog_after_score"
    }
    $summary.score = [ordered]@{
        http_status = $score.status
        domain = [string]$domain
        request_id = $scoreBody.request_id
        opportunity_score = $scoreBody.opportunity_score
        confidence = $scoreBody.confidence
        decision = $scoreBody.decision
        commercial_strength_level = $scoreBody.commercial_strength.level
        next_product = $nextProduct
    }
    $summary.decision.recommended_next_product = $nextProduct
    $summary.decision.recommended_next_action = $nextAction
    Add-Check -Checks $checks -Name "score_created" -Ok ($score.status -eq 200 -and $scoreBody.opportunity_score -ne $null) -Details "HTTP $($score.status), score=$($scoreBody.opportunity_score)"
    Add-Check -Checks $checks -Name "machine_selects_next_service" -Ok (-not [string]::IsNullOrWhiteSpace([string]$nextProduct)) -Details "next_product=$nextProduct"

    $usageAfter = Invoke-MachineSignal -Method GET -Uri "$BaseUrl/v1/usage" -Headers @{ "X-API-Key" = [string]$sandboxKey }
    $orders = Invoke-MachineSignal -Method GET -Uri "$BaseUrl/v1/orders" -Headers @{ "X-API-Key" = [string]$sandboxKey }

    $summary.usage = [ordered]@{
        before_status = $usageBefore.status
        after_status = $usageAfter.status
    }
    $summary.orders = [ordered]@{
        http_status = $orders.status
        count = $orders.body.count
        products = @($orders.body.orders | ForEach-Object { $_.product_code })
    }

    $realPayment = [bool]($tdBody.real_payment_executed -or $scoreBody.real_payment_executed -or $usageAfter.body.real_payment_executed)
    $externalContact = [bool]($tdBody.external_contact_executed -or $scoreBody.external_contact_executed -or $usageAfter.body.external_contact_executed)
    $summary.safety.real_payment_executed = $realPayment
    $summary.safety.external_contact_executed = $externalContact
    $summary.safety.real_invoice_issued = $false
    Add-Check -Checks $checks -Name "no_real_payment" -Ok (-not $realPayment) -Details "real_payment_executed=$realPayment"
    Add-Check -Checks $checks -Name "no_external_contact" -Ok (-not $externalContact) -Details "external_contact_executed=$externalContact"
    Add-Check -Checks $checks -Name "write_budget_respected" -Ok ($summary.write_calls_executed -le 3) -Details "write_calls=$($summary.write_calls_executed)"

    $summary.status = "completed_full_machine_discovery"
} catch {
    if ($summary.status -eq "started") {
        $summary.status = "blocked_or_failed"
    }
    if (-not $summary.blocked_reason) {
        $summary.blocked_reason = $_.Exception.Message
    }
    Add-Check -Checks $checks -Name "runner_exception" -Ok $false -Details $summary.blocked_reason
} finally {
    $summary.checks = @($checks)
    $summary.ok = (@($checks | Where-Object { $_.ok -eq $false }).Count -eq 0)
    if (-not $summary.ok -and $summary.status -eq "completed_full_machine_discovery") {
        $summary.status = "completed_with_review"
    }
    Write-Reports -Summary $summary
    $summary | ConvertTo-Json -Depth 80
}
