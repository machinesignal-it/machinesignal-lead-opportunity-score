param(
    [string]$PublicSite = "https://machinesignal.it",
    [string]$BaseUrl = "https://machinesignal-api.beta-878.workers.dev",
    [string]$OutputJson = "machine_deep_analysis_single_purchase_summary_20260608.json",
    [string]$OutputMarkdown = "machine_deep_analysis_single_purchase_report_20260608.md"
)

$ErrorActionPreference = "Stop"

function Convert-RawJson {
    param([string]$Raw)
    try {
        if ([string]::IsNullOrWhiteSpace($Raw)) { return $null }
        return ($Raw | ConvertFrom-Json)
    } catch {
        return $null
    }
}

function Get-ResponseText {
    param([object]$Content)
    if ($Content -is [byte[]]) {
        return [System.Text.Encoding]::UTF8.GetString($Content)
    }
    return [string]$Content
}

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
            error = $null
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
            error = $_.Exception.Message
        }
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

function Test-HasProperty {
    param([object]$Object, [string]$Name)
    return ($Object -and $Object.PSObject.Properties.Name -contains $Name)
}

function Write-Utf8NoBom {
    param([string]$Path, [string]$Text)
    $utf8NoBom = [System.Text.UTF8Encoding]::new($false)
    [System.IO.File]::WriteAllText((Join-Path (Get-Location) $Path), $Text, $utf8NoBom)
}

function Write-Reports {
    param([object]$Summary)
    Write-Utf8NoBom -Path $OutputJson -Text (($Summary | ConvertTo-Json -Depth 80) + [Environment]::NewLine)

    $checkRows = @()
    foreach ($check in $Summary.checks) {
        $status = if ($check.ok) { "OK" } else { "FAIL" }
        $checkRows += "| $($check.name) | $status | $($check.details) |"
    }
    $checksTable = $checkRows -join "`n"

    $fieldRows = @()
    $fieldSource = $Summary.deep_analysis.delivery_fields_present
    if ($fieldSource -is [System.Collections.IDictionary]) {
        foreach ($key in $fieldSource.Keys) {
            $fieldRows += "| $key | $($fieldSource[$key]) |"
        }
    } else {
        foreach ($field in $fieldSource.PSObject.Properties) {
            $fieldRows += "| $($field.Name) | $($field.Value) |"
        }
    }
    $fieldsTable = $fieldRows -join "`n"

    $md = @"
# MachineSignal - Machine Deep Analysis Single Purchase - 2026-06-08

## Result

Status: $($Summary.status)

OK: $($Summary.ok)

Machine customer mode: $($Summary.machine_customer_mode)

Write calls executed: $($Summary.write_calls_executed)

POST calls executed: $($Summary.post_calls_executed)

Real payment executed: $($Summary.safety.real_payment_executed)

External contact executed: $($Summary.safety.external_contact_executed)

Fiscal invoice issued: $($Summary.safety.real_invoice_issued)

## Machine Path Tested

1. Read public machine-discovery resources.
2. Create one limited sandbox customer.
3. Score one synthetic high-signal demo target.
4. If the score recommends Deep Analysis, create one Deep Analysis beta purchase-intent.
5. Retrieve the created order and usage.
6. Stop before Action Pack.

## Decision

- Demo target: $($Summary.score.domain)
- Score: $($Summary.score.opportunity_score)
- Confidence: $($Summary.score.confidence)
- Score decision: $($Summary.score.decision)
- Score recommended next product: $($Summary.score.recommended_next_product)
- Deep Analysis order: $($Summary.deep_analysis.order_intent_id)
- Deep Analysis delivery type: $($Summary.deep_analysis.delivery_type)
- Deep Analysis recommended next product: $($Summary.deep_analysis.recommended_next_product)
- Action Pack purchased in this run: $($Summary.decision.action_pack_purchased)

## Deep Analysis Fields

| Field | Present |
|---|---|
$fieldsTable

## Checks

| Check | Status | Details |
|---|---|---|
$checksTable

## Interpretation

This run proves the next controlled spend layer: a machine can start from public MachineSignal resources, create a sandbox key, score a target and buy exactly one Deep Analysis only when the score justifies it.

The delivery is machine-readable and includes the commercial evidence, CRM summary and Action Pack gate needed to decide whether another paid machine action is justified. The run intentionally does not buy Action Pack.

## Next Step

Use this proof as the public evidence for the score-to-Deep-Analysis gate. The next bounded test can validate the Action Pack gate with one purchase only after checking that the Deep Analysis delivery says the gate is conditional and useful.
"@
    Write-Utf8NoBom -Path $OutputMarkdown -Text ($md + [Environment]::NewLine)
}

$checks = [System.Collections.ArrayList]::new()
$runStamp = Get-Date -Format "yyyyMMddHHmmss"
$runId = "machine-deep-analysis-single-purchase-20260608-$runStamp"
$demoDomain = "premium-dental-conversion-gap.it"
$sandboxApiKey = $null

$summary = [ordered]@{
    artifact = "machine_deep_analysis_single_purchase"
    generated_at = (Get-Date).ToUniversalTime().ToString("o")
    run_id = $runId
    public_site = $PublicSite
    base_url = $BaseUrl
    status = "started"
    ok = $false
    machine_customer_mode = "machine_with_scored_target_and_spend_gate"
    write_calls_executed = 0
    post_calls_executed = 0
    discovery = [ordered]@{}
    sandbox = [ordered]@{
        customer_created = $false
        customer_id = $null
        api_key_returned = $false
        api_key_published = $false
    }
    score = [ordered]@{
        domain = $demoDomain
        opportunity_score = $null
        confidence = $null
        decision = $null
        request_id = $null
        recommended_next_product = $null
    }
    deep_analysis = [ordered]@{
        order_created = $false
        order_intent_id = $null
        status = $null
        delivery_type = $null
        delivery_status = $null
        recommended_next_product = $null
        credits_consumed = $null
        delivery_fields_present = [ordered]@{
            what_is_included = $false
            sector_context = $false
            commercial_objective = $false
            commercial_evidence = $false
            machine_decision_matrix = $false
            action_pack_purchase_gate = $false
            crm_summary_payload = $false
            recommended_next_step = $false
            stop_rules = $false
            next_machine_call = $false
        }
    }
    orders = [ordered]@{
        retrieval_status = $null
        listed_count = $null
        order_retrieved = $false
    }
    usage = [ordered]@{
        status_after = $null
        ledger_backend = $null
    }
    decision = [ordered]@{
        deep_analysis_purchased = $false
        action_pack_gate_evaluated = $false
        action_pack_purchased = $false
    }
    safety = [ordered]@{
        real_payment_executed = $false
        external_contact_executed = $false
        real_invoice_issued = $false
        payment_test_created = $false
        real_target_used = $false
    }
    checks = @()
    blocked_reason = $null
}

try {
    $llms = Invoke-MachineSignal -Method GET -Uri "$PublicSite/llms.txt"
    Add-Check -Checks $checks -Name "llms_reachable" -Ok ($llms.status -eq 200) -Details "HTTP $($llms.status)"
    Add-Check -Checks $checks -Name "llms_exposes_machine_discovery" -Ok (Test-TextContains -Text $llms.raw -Needle ".well-known/machine-discovery.json") -Details "llms contains well-known machine discovery link."

    $machineDiscovery = Invoke-MachineSignal -Method GET -Uri "$PublicSite/.well-known/machine-discovery.json"
    Add-Check -Checks $checks -Name "well_known_machine_discovery_reachable" -Ok ($machineDiscovery.status -eq 200 -and $null -ne $machineDiscovery.body) -Details "HTTP $($machineDiscovery.status)"
    Add-Check -Checks $checks -Name "machine_discovery_customer_interface" -Ok ($machineDiscovery.body.primary_customer_interface -eq "machine") -Details "primary_customer_interface=$($machineDiscovery.body.primary_customer_interface)"

    $productCatalogUrl = [string]$machineDiscovery.body.discovery.product_catalog
    $openApiUrl = [string]$machineDiscovery.body.discovery.openapi
    $onboardingUrl = [string]$machineDiscovery.body.discovery.machine_onboarding
    $summary.discovery = [ordered]@{
        product_catalog = $productCatalogUrl
        openapi = $openApiUrl
        machine_onboarding = $onboardingUrl
    }

    $productCatalog = Invoke-MachineSignal -Method GET -Uri $productCatalogUrl
    $openApi = Invoke-MachineSignal -Method GET -Uri $openApiUrl
    $machineOnboarding = Invoke-MachineSignal -Method GET -Uri $onboardingUrl
    Add-Check -Checks $checks -Name "product_catalog_reachable" -Ok ($productCatalog.status -eq 200 -and $null -ne $productCatalog.body) -Details "HTTP $($productCatalog.status)"
    Add-Check -Checks $checks -Name "openapi_reachable" -Ok ($openApi.status -eq 200 -and $null -ne $openApi.body) -Details "HTTP $($openApi.status)"
    Add-Check -Checks $checks -Name "machine_onboarding_reachable" -Ok ($machineOnboarding.status -eq 200 -and $null -ne $machineOnboarding.body) -Details "HTTP $($machineOnboarding.status)"
    Add-Check -Checks $checks -Name "deep_analysis_in_catalog" -Ok (Test-TextContains -Text $productCatalog.raw -Needle '"product_code": "deep_analysis"') -Details "Catalog includes deep_analysis."
    Add-Check -Checks $checks -Name "purchase_intent_in_openapi" -Ok (Test-TextContains -Text $openApi.raw -Needle '"/v1/purchase-intent"') -Details "OpenAPI exposes purchase-intent endpoint."

    $sandboxPayload = [ordered]@{
        customer_id = "sandbox_deep_analysis_20260608"
        evaluator_type = "ai_agent"
        integration_target = "crm_agent_or_machine_buyer_workflow"
        expected_test_path = "score_then_one_deep_analysis_only"
    }
    $sandbox = Invoke-MachineSignal `
        -Method POST `
        -Uri "$BaseUrl/v1/sandbox/customers" `
        -Headers @{ "Idempotency-Key" = "machine-deep-analysis-sandbox-20260608" } `
        -Body $sandboxPayload
    $summary.post_calls_executed += 1
    if ($sandbox.status -eq 200) { $summary.write_calls_executed += 1 }

    Add-Check -Checks $checks -Name "sandbox_customer_created" -Ok ($sandbox.status -eq 200 -and $sandbox.body.sandbox -eq $true) -Details "HTTP $($sandbox.status)"
    if ($sandbox.status -ne 200 -or -not $sandbox.body.api_key) {
        throw "Sandbox creation failed: HTTP $($sandbox.status) $($sandbox.raw)"
    }

    $sandboxApiKey = [string]$sandbox.body.api_key
    $summary.sandbox.customer_created = $true
    $summary.sandbox.customer_id = [string]$sandbox.body.customer_id
    $summary.sandbox.api_key_returned = $true
    $summary.sandbox.api_key_published = $false

    $authHeaders = @{
        "X-API-Key" = $sandboxApiKey
        "Idempotency-Key" = "machine-deep-analysis-score-20260608"
    }
    $scorePayload = [ordered]@{
        domain = $demoDomain
        sector_hint = "dentist"
        country_hint = "IT"
        target_name = "Premium Dental Conversion Gap Demo"
        category_hint = "studio dentistico"
        initial_signals = @(
            "sector_match",
            "local_market",
            "business_domain_present",
            "official_site",
            "service_keyword_present",
            "website_opportunity",
            "weak_cta",
            "conversion_friction"
        )
    }
    $score = Invoke-MachineSignal `
        -Method POST `
        -Uri "$BaseUrl/v1/lead-opportunity-score" `
        -Headers $authHeaders `
        -Body $scorePayload
    $summary.post_calls_executed += 1
    if ($score.status -eq 200) { $summary.write_calls_executed += 1 }

    Add-Check -Checks $checks -Name "score_created" -Ok ($score.status -eq 200 -and $null -ne $score.body.request_id) -Details "HTTP $($score.status)"
    if ($score.status -ne 200) {
        throw "Score call failed: HTTP $($score.status) $($score.raw)"
    }

    $summary.score.domain = [string]$score.body.domain
    $summary.score.opportunity_score = [int]$score.body.opportunity_score
    $summary.score.confidence = [double]$score.body.confidence
    $summary.score.decision = [string]$score.body.decision
    $summary.score.request_id = [string]$score.body.request_id
    $summary.score.recommended_next_product = [string]$score.body.next_purchase.next_product
    Add-Check -Checks $checks -Name "score_recommends_deep_analysis" -Ok ($score.body.decision -eq "buy_deep_analysis" -and $score.body.next_purchase.next_product -eq "deep_analysis") -Details "decision=$($score.body.decision), next=$($score.body.next_purchase.next_product)"

    if ($score.body.decision -ne "buy_deep_analysis" -or $score.body.next_purchase.next_product -ne "deep_analysis") {
        throw "Score did not recommend deep_analysis; stopping before purchase-intent."
    }

    $deepPayload = [ordered]@{
        product_code = "deep_analysis"
        domain = $demoDomain
        sector_hint = "dentist"
        area = "Lombardy"
        commercial_objective = "Find dental clinic websites where a machine should evaluate whether digital conversion improvement is a real commercial opportunity."
        source_score_request_id = [string]$score.body.request_id
        reason = "Single sandbox machine run: score recommended Deep Analysis. No Action Pack, no payment, no external contact."
        max_budget_eur = 299
    }
    $deepHeaders = @{
        "X-API-Key" = $sandboxApiKey
        "Idempotency-Key" = "machine-deep-analysis-purchase-20260608"
    }
    $deep = Invoke-MachineSignal `
        -Method POST `
        -Uri "$BaseUrl/v1/purchase-intent" `
        -Headers $deepHeaders `
        -Body $deepPayload
    $summary.post_calls_executed += 1
    if ($deep.status -eq 200) { $summary.write_calls_executed += 1 }

    Add-Check -Checks $checks -Name "deep_analysis_purchase_intent_created" -Ok ($deep.status -eq 200 -and $deep.body.product_code -eq "deep_analysis") -Details "HTTP $($deep.status)"
    if ($deep.status -ne 200) {
        throw "Deep Analysis purchase-intent failed: HTTP $($deep.status) $($deep.raw)"
    }

    $delivery = $deep.body.delivery
    $summary.deep_analysis.order_created = $true
    $summary.deep_analysis.order_intent_id = [string]$deep.body.order_intent_id
    $summary.deep_analysis.status = [string]$deep.body.status
    $summary.deep_analysis.delivery_type = [string]$delivery.delivery_type
    $summary.deep_analysis.delivery_status = [string]$delivery.status
    $summary.deep_analysis.recommended_next_product = [string]$delivery.recommended_next_step.product_code
    $summary.deep_analysis.credits_consumed = $deep.body.usage.current_event.credits_consumed
    $summary.decision.deep_analysis_purchased = $true
    $summary.decision.action_pack_gate_evaluated = (Test-HasProperty -Object $delivery -Name "action_pack_purchase_gate")

    foreach ($fieldName in @(
        "what_is_included",
        "sector_context",
        "commercial_objective",
        "commercial_evidence",
        "machine_decision_matrix",
        "action_pack_purchase_gate",
        "crm_summary_payload",
        "recommended_next_step",
        "stop_rules",
        "next_machine_call"
    )) {
        $summary.deep_analysis.delivery_fields_present[$fieldName] = (Test-HasProperty -Object $delivery -Name $fieldName)
    }

    Add-Check -Checks $checks -Name "deep_analysis_delivery_type_valid" -Ok ($delivery.delivery_type -eq "deep_opportunity_analysis") -Details "delivery_type=$($delivery.delivery_type)"
    Add-Check -Checks $checks -Name "deep_analysis_delivery_ready" -Ok ($delivery.status -eq "deep_analysis_ready") -Details "status=$($delivery.status)"
    Add-Check -Checks $checks -Name "deep_analysis_consumed_one_credit" -Ok ($deep.body.usage.current_event.credits_consumed -eq 1) -Details "credits_consumed=$($deep.body.usage.current_event.credits_consumed)"
    Add-Check -Checks $checks -Name "action_pack_gate_present_but_not_purchased" -Ok (($summary.decision.action_pack_gate_evaluated -eq $true) -and ($summary.decision.action_pack_purchased -eq $false)) -Details "gate_present=$($summary.decision.action_pack_gate_evaluated), purchased=false"
    Add-Check -Checks $checks -Name "deep_analysis_has_crm_payload" -Ok (Test-HasProperty -Object $delivery -Name "crm_summary_payload") -Details "CRM summary payload present."
    Add-Check -Checks $checks -Name "deep_analysis_has_machine_decision_matrix" -Ok (Test-HasProperty -Object $delivery -Name "machine_decision_matrix") -Details "Machine decision matrix present."

    $order = Invoke-MachineSignal `
        -Method GET `
        -Uri "$BaseUrl/v1/orders/$($summary.deep_analysis.order_intent_id)" `
        -Headers @{ "X-API-Key" = $sandboxApiKey }
    $summary.orders.retrieval_status = $order.status
    $summary.orders.order_retrieved = ($order.status -eq 200 -and $order.body.order.order_intent_id -eq $summary.deep_analysis.order_intent_id)
    Add-Check -Checks $checks -Name "deep_analysis_order_retrieved" -Ok $summary.orders.order_retrieved -Details "HTTP $($order.status)"

    $orders = Invoke-MachineSignal `
        -Method GET `
        -Uri "$BaseUrl/v1/orders" `
        -Headers @{ "X-API-Key" = $sandboxApiKey }
    $summary.orders.listed_count = if ($orders.status -eq 200) { [int]$orders.body.count } else { $null }
    Add-Check -Checks $checks -Name "orders_list_reachable" -Ok ($orders.status -eq 200 -and $orders.body.count -ge 1) -Details "HTTP $($orders.status), count=$($orders.body.count)"

    $usage = Invoke-MachineSignal `
        -Method GET `
        -Uri "$BaseUrl/v1/usage" `
        -Headers @{ "X-API-Key" = $sandboxApiKey }
    $summary.usage.status_after = $usage.status
    $summary.usage.ledger_backend = if ($usage.status -eq 200) { [string]$usage.body.ledger_backend } else { $null }
    Add-Check -Checks $checks -Name "usage_reachable_after_deep_analysis" -Ok ($usage.status -eq 200) -Details "HTTP $($usage.status), backend=$($summary.usage.ledger_backend)"

    $realPayment = $false
    $externalContact = $false
    foreach ($candidate in @($sandbox.body, $score.body, $deep.body, $order.body, $orders.body, $usage.body)) {
        if ($candidate -and $candidate.PSObject.Properties.Name -contains "real_payment_executed" -and $candidate.real_payment_executed -eq $true) {
            $realPayment = $true
        }
        if ($candidate -and $candidate.PSObject.Properties.Name -contains "external_contact_executed" -and $candidate.external_contact_executed -eq $true) {
            $externalContact = $true
        }
    }
    $summary.safety.real_payment_executed = $realPayment
    $summary.safety.external_contact_executed = $externalContact
    Add-Check -Checks $checks -Name "no_real_payment" -Ok (-not $realPayment) -Details "No endpoint reported real_payment_executed=true."
    Add-Check -Checks $checks -Name "no_external_contact" -Ok (-not $externalContact) -Details "No endpoint reported external_contact_executed=true."
    Add-Check -Checks $checks -Name "api_key_not_published" -Ok ($summary.sandbox.api_key_returned -eq $true -and $summary.sandbox.api_key_published -eq $false) -Details "API key used only in memory."

    $summary.status = "completed_deep_analysis_single_purchase"
    $summary.checks = @($checks)
    $summary.ok = (@($checks | Where-Object { $_.ok -eq $false }).Count -eq 0)
} catch {
    $summary.status = "blocked_or_failed_deep_analysis_single_purchase"
    $summary.blocked_reason = [string]$_
    Add-Check -Checks $checks -Name "run_completed_without_blocker" -Ok $false -Details ([string]$_)
    $summary.checks = @($checks)
    $summary.ok = $false
} finally {
    if ($sandboxApiKey) {
        $sandboxApiKey = $null
    }
    Write-Reports -Summary $summary
}

$summary | ConvertTo-Json -Depth 80
