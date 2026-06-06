param(
    [string]$PublicSite = "https://machinesignal.it",
    [string]$OutputPrefix = "machine_buyer_product_evaluation_probe_20260606"
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

function Get-ContentText {
    param($Response)
    if ($Response.Content -is [byte[]]) {
        return [System.Text.Encoding]::UTF8.GetString($Response.Content)
    }
    return [string]$Response.Content
}

function Get-Url {
    param([string]$Url)
    $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -Headers @{ "Cache-Control" = "no-cache" } -TimeoutSec 25
    [pscustomobject]@{
        url = $Url
        status = [int]$response.StatusCode
        content = Get-ContentText $response
    }
}

function Get-ProductByCode {
    param($Catalog, [string]$Code)
    $Catalog.products.PSObject.Properties.Value | Where-Object { $_.product_code -eq $Code } | Select-Object -First 1
}

function Has-Text {
    param([string]$Text, [string]$Needle)
    return $Text.IndexOf($Needle, [System.StringComparison]::OrdinalIgnoreCase) -ge 0
}

$checks = [System.Collections.Generic.List[object]]::new()
$fetched = @{}
$urls = @{
    llms = "$PublicSite/llms.txt"
    onboarding = "$PublicSite/machine-onboarding.json"
    product_catalog = "$PublicSite/product-catalog.json"
    evaluation_pack = "$PublicSite/machine_buyer_evaluation_pack_20260606.json"
    evaluation_pack_md = "$PublicSite/machine_buyer_evaluation_pack_20260606.md"
    deep_analysis_brief = "$PublicSite/deep_analysis_commercial_partner_brief_20260606.json"
    openapi = "$PublicSite/openapi.json"
    sitemap = "$PublicSite/sitemap.xml"
}

foreach ($key in $urls.Keys) {
    $result = Get-Url -Url $urls[$key]
    $fetched[$key] = $result
    Add-Check -Checks $checks -Name "$key`_reachable" -Ok ($result.status -eq 200) -Details "HTTP $($result.status)"
}

$llms = $fetched["llms"].content
$catalog = $fetched["product_catalog"].content | ConvertFrom-Json
$evaluationPack = $fetched["evaluation_pack"].content | ConvertFrom-Json
$evaluationText = $fetched["evaluation_pack"].content
$deepBrief = $fetched["deep_analysis_brief"].content | ConvertFrom-Json
$onboarding = $fetched["onboarding"].content | ConvertFrom-Json
$onboardingText = $fetched["onboarding"].content
$openapi = $fetched["openapi"].content | ConvertFrom-Json
[xml]$sitemapXml = $fetched["sitemap"].content

Add-Check -Checks $checks -Name "product_catalog_valid_json" -Ok ($catalog.service -eq "MachineSignal") -Details "service=$($catalog.service)"
Add-Check -Checks $checks -Name "catalog_machine_first" -Ok ($catalog.primary_customer_interface -eq "machine") -Details "primary_customer_interface=$($catalog.primary_customer_interface)"
Add-Check -Checks $checks -Name "catalog_beta_no_real_payment" -Ok (($catalog.payment_mode.beta -eq "purchase-intent only") -and (-not [bool]$catalog.payment_mode.real_payment_executed)) -Details "beta=$($catalog.payment_mode.beta); real_payment=$($catalog.payment_mode.real_payment_executed)"
Add-Check -Checks $checks -Name "catalog_valid_output_credit_rule" -Ok (Has-Text $catalog.general_credit_rule.rule "valid usable output") -Details $catalog.general_credit_rule.rule
Add-Check -Checks $checks -Name "catalog_tracks_credit_consumption" -Ok ((Has-Text $catalog.general_credit_rule.tracking "request_id") -and (Has-Text $catalog.general_credit_rule.tracking "credits_remaining")) -Details $catalog.general_credit_rule.tracking

$expectedProducts = @(
    @{ code = "target_discovery"; price = 149; name = "Target Discovery Pack"; required = @("commercial objective", "250", "JSON") },
    @{ code = "score_pack_1k"; price = 99; name = "Score Pack 1k"; required = @("1000", "spend_policy", "next") },
    @{ code = "domain_enrichment"; price = 149; name = "Domain Enrichment Pack 100"; required = @("domain", "confidence", "reason") },
    @{ code = "deep_analysis"; price = 299; name = "Deep Analysis Pack 100"; required = @("commercial_evidence", "machine_decision_matrix", "action_pack_purchase_gate") },
    @{ code = "action_pack"; price = 399; name = "Action Pack 25"; required = @("crm_record_patch", "workflow_payload", "approval_gate") },
    @{ code = "opportunity_feed"; price = 249; name = "Opportunity Feed"; required = @("scheduled", "targets", "signals") },
    @{ code = "api_starter"; price = 99; name = "API Starter"; required = @("API key", "500", "usage") },
    @{ code = "api_pro"; price = 499; name = "API Pro"; required = @("3000", "Deep Analysis", "webhook") }
)

$productResults = @()
foreach ($expected in $expectedProducts) {
    $product = Get-ProductByCode -Catalog $catalog -Code $expected.code
    $productText = if ($product) { $product | ConvertTo-Json -Depth 12 } else { "" }
    $hasProduct = $null -ne $product
    $priceOk = $hasProduct -and ([int]$product.price_eur -eq [int]$expected.price)
    $whenOk = $hasProduct -and -not [string]::IsNullOrWhiteSpace([string]$product.when_to_buy)
    $machineOutputOk = $hasProduct -and -not [string]::IsNullOrWhiteSpace([string]$product.machine_output)
    $requiredOk = $true
    foreach ($required in $expected.required) {
        if (-not (Has-Text $productText $required)) { $requiredOk = $false }
    }
    Add-Check -Checks $checks -Name "catalog_product_$($expected.code)_present" -Ok $hasProduct -Details $expected.name
    Add-Check -Checks $checks -Name "catalog_product_$($expected.code)_price_ok" -Ok $priceOk -Details "expected=$($expected.price); actual=$($product.price_eur)"
    Add-Check -Checks $checks -Name "catalog_product_$($expected.code)_when_to_buy_present" -Ok $whenOk -Details ([string]$product.when_to_buy)
    Add-Check -Checks $checks -Name "catalog_product_$($expected.code)_output_present" -Ok $machineOutputOk -Details ([string]$product.machine_output)
    Add-Check -Checks $checks -Name "catalog_product_$($expected.code)_required_terms_present" -Ok $requiredOk -Details ("terms=" + ($expected.required -join ", "))
    $productResults += [pscustomobject]@{
        product_code = $expected.code
        name = $expected.name
        expected_price_eur = $expected.price
        actual_price_eur = if ($hasProduct) { $product.price_eur } else { $null }
        ok = ($hasProduct -and $priceOk -and $whenOk -and $machineOutputOk -and $requiredOk)
    }
}

$ladder = @($evaluationPack.commercial_ladder)
$scoreStep = $ladder | Where-Object { $_.product_code -eq "score_pack_1k" } | Select-Object -First 1
$deepStep = $ladder | Where-Object { $_.product_code -eq "deep_analysis" } | Select-Object -First 1
$actionStep = $ladder | Where-Object { $_.product_code -eq "action_pack" } | Select-Object -First 1
Add-Check -Checks $checks -Name "evaluation_pack_has_three_step_ladder" -Ok ($ladder.Count -eq 3) -Details "steps=$($ladder.Count)"
Add-Check -Checks $checks -Name "evaluation_pack_score_step_ok" -Ok (($scoreStep.price_eur -eq 99) -and (Has-Text ($scoreStep | ConvertTo-Json -Depth 8) "spend_policy")) -Details "score_pack_1k step"
Add-Check -Checks $checks -Name "evaluation_pack_deep_step_ok" -Ok (($deepStep.price_eur -eq 299) -and (Has-Text ($deepStep | ConvertTo-Json -Depth 8) "action_pack_purchase_gate")) -Details "deep_analysis step"
Add-Check -Checks $checks -Name "evaluation_pack_action_step_ok" -Ok (($actionStep.price_eur -eq 399) -and (Has-Text ($actionStep | ConvertTo-Json -Depth 8) "approval_gate")) -Details "action_pack step"
Add-Check -Checks $checks -Name "evaluation_pack_answers_core_questions" -Ok ((Has-Text $evaluationText "What do I buy?") -and (Has-Text $evaluationText "When do I buy it?") -and (Has-Text $evaluationText "How do I avoid wasting budget?")) -Details "evaluation questions present"
Add-Check -Checks $checks -Name "evaluation_pack_has_existing_list_flow" -Ok ((@($evaluationPack.evaluation_flows.machine_has_domains).Count -ge 5) -and (Has-Text (($evaluationPack.evaluation_flows.machine_has_domains | ConvertTo-Json -Depth 8)) "POST /v1/lead-opportunity-score")) -Details "machine_has_domains flow present"
Add-Check -Checks $checks -Name "evaluation_pack_has_no_list_flow" -Ok ((@($evaluationPack.evaluation_flows.machine_has_no_list).Count -ge 4) -and (Has-Text (($evaluationPack.evaluation_flows.machine_has_no_list | ConvertTo-Json -Depth 8)) "target_discovery")) -Details "machine_has_no_list flow present"
Add-Check -Checks $checks -Name "evaluation_pack_blocks_action_pack_without_deep" -Ok (Has-Text ($evaluationPack.stop_rules | ConvertTo-Json -Depth 8) "Do not buy Action Pack unless Deep Analysis confirms all gates") -Details "stop rule present"
Add-Check -Checks $checks -Name "evaluation_pack_blocks_real_payment_and_outreach" -Ok ((Has-Text ($evaluationPack.stop_rules | ConvertTo-Json -Depth 8) "real payment") -and (Has-Text ($evaluationPack.stop_rules | ConvertTo-Json -Depth 8) "external targets")) -Details "beta safety stop rules present"

$policyText = $deepBrief.recommended_machine_buying_policy | ConvertTo-Json -Depth 8
Add-Check -Checks $checks -Name "deep_brief_has_weak_medium_strong_policy" -Ok ((Has-Text $policyText "weak") -and (Has-Text $policyText "medium") -and (Has-Text $policyText "strong")) -Details "weak/medium/strong policy present"
Add-Check -Checks $checks -Name "deep_brief_action_pack_conditional" -Ok (Has-Text $policyText "deep_confirms_all_gates") -Details "deep confirmation gate present"

$openapiText = $fetched["openapi"].content
Add-Check -Checks $checks -Name "openapi_has_score_endpoint" -Ok (Has-Text $openapiText "/v1/lead-opportunity-score") -Details "score endpoint present"
Add-Check -Checks $checks -Name "openapi_has_purchase_intent_endpoint" -Ok (Has-Text $openapiText "/v1/purchase-intent") -Details "purchase-intent endpoint present"
Add-Check -Checks $checks -Name "openapi_exposes_next_purchase_or_spend_policy" -Ok ((Has-Text $openapiText "next_purchase") -or (Has-Text $openapiText "spend_policy")) -Details "routing fields present"

Add-Check -Checks $checks -Name "llms_lists_product_catalog" -Ok (Has-Text $llms "$PublicSite/product-catalog.json") -Details "product catalog linked"
Add-Check -Checks $checks -Name "llms_lists_evaluation_pack" -Ok (Has-Text $llms "$PublicSite/machine_buyer_evaluation_pack_20260606.json") -Details "evaluation pack linked"
Add-Check -Checks $checks -Name "llms_explains_core_prices" -Ok ((Has-Text $llms "Score Pack 1k: EUR 99") -and (Has-Text $llms "Action Pack 25: EUR 399")) -Details "price ladder terms present"
Add-Check -Checks $checks -Name "llms_explains_deep_action_gate" -Ok ((Has-Text $llms "buy Deep Analysis") -and (Has-Text $llms "buy action_pack only")) -Details "deep/action gate terms present"

Add-Check -Checks $checks -Name "onboarding_lists_evaluation_pack" -Ok (Has-Text $onboardingText "latest_machine_buyer_evaluation_pack_status") -Details "evaluation pack status present"
Add-Check -Checks $checks -Name "onboarding_embeds_catalog_products" -Ok ((Has-Text $onboardingText "score_pack_1k") -and (Has-Text $onboardingText "deep_analysis_pack_100") -and (Has-Text $onboardingText "action_pack_25")) -Details "catalog products embedded"
Add-Check -Checks $checks -Name "sitemap_valid_xml" -Ok ($sitemapXml.urlset -ne $null) -Details "urlset present"
Add-Check -Checks $checks -Name "sitemap_lists_evaluation_pack" -Ok (Has-Text $fetched["sitemap"].content "$PublicSite/machine_buyer_evaluation_pack_20260606.json") -Details "evaluation pack in sitemap"

$failed = @($checks | Where-Object { -not $_.ok })
$summary = [pscustomobject]@{
    ok = ($failed.Count -eq 0)
    probe_name = "machine_buyer_product_evaluation_probe"
    run_date = "2026-06-06"
    public_site = $PublicSite
    machine_path = @(
        "$PublicSite/llms.txt",
        "$PublicSite/machine-onboarding.json",
        "$PublicSite/product-catalog.json",
        "$PublicSite/machine_buyer_evaluation_pack_20260606.json",
        "$PublicSite/deep_analysis_commercial_partner_brief_20260606.json",
        "$PublicSite/openapi.json"
    )
    products_checked = $productResults
    commercial_ladder = @(
        "score_pack_1k: screen existing lists and route spend",
        "deep_analysis: buy evidence and spend-control gate before action",
        "action_pack: buy CRM/workflow payload only after deep confirmation"
    )
    live_credits_consumed = 0
    real_payment_executed = $false
    external_contact_executed = $false
    checks = $checks
    failed_checks = $failed
    conclusion = if ($failed.Count -eq 0) {
        "PASS: a machine buyer can understand what MachineSignal sells, when to buy each product, what JSON it receives, which actions are blocked and how budget waste is avoided."
    } else {
        "FAIL: one or more product-evaluation checks failed."
    }
}

$jsonPath = "$OutputPrefix`_summary.json"
$mdPath = "$OutputPrefix`_report.md"
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText((Join-Path (Get-Location) $jsonPath), ($summary | ConvertTo-Json -Depth 20), $utf8NoBom)

$lines = [System.Collections.Generic.List[string]]::new()
$lines.Add("# Machine buyer product evaluation probe - 2026-06-06")
$lines.Add("")
$lines.Add("## Scope")
$lines.Add("")
$lines.Add("This probe verifies whether a CRM workflow, AI agent or software buyer can understand MachineSignal's purchasable products and budget rules without human email outreach.")
$lines.Add("")
$lines.Add("## Result")
$lines.Add("")
$lines.Add("- Status: **$($summary.ok)**")
$lines.Add("- Products checked: $($productResults.Count)")
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
$lines.Add("## Commercial ladder")
$lines.Add("")
$lines.Add('1. `score_pack_1k` screens an existing list and returns score, confidence, commercial strength, spend policy and next purchase.')
$lines.Add('2. `deep_analysis` is bought only for promising records and returns evidence, decision matrix, Action Pack gate, CRM summary, stop rules and next machine call.')
$lines.Add('3. `action_pack` is bought only after Deep Analysis confirms the gates, and returns CRM/workflow payloads, webhook event, agent instructions, approval gate and compliance guardrail.')
$lines.Add("")
$lines.Add("## Products checked")
$lines.Add("")
foreach ($productResult in $productResults) {
    $status = if ($productResult.ok) { "PASS" } else { "FAIL" }
    $lines.Add(("- {0} - ``{1}``: EUR {2}, {3}" -f $status, $productResult.product_code, $productResult.actual_price_eur, $productResult.name))
}
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
$lines.Add("- The beta model records purchase intent and consumes beta credits only for valid outputs.")
$lines.Add("- The probe does not run write endpoints, real payments or external outreach.")
$lines.Add('- `action_pack` remains blocked unless Deep Analysis confirms the required gates.')
$lines.Add("- The customer machine must still apply its own compliance and budget policy before external action.")

[System.IO.File]::WriteAllText((Join-Path (Get-Location) $mdPath), ($lines -join [Environment]::NewLine), $utf8NoBom)

if (-not $summary.ok) {
    $summary | ConvertTo-Json -Depth 20
    exit 2
}

$summary | ConvertTo-Json -Depth 20
