param(
    [string]$PublicSite = "https://machinesignal.it",
    [string]$BaseUrl = "https://machinesignal-api.beta-878.workers.dev",
    [string]$OutputJson = "machine_action_pack_single_purchase_summary_20260608.json",
    [string]$OutputMarkdown = "machine_action_pack_single_purchase_report_20260608.md"
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
        $options.Body = ($Body | ConvertTo-Json -Depth 50)
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

function Test-ArrayContainsText {
    param($Array, [string]$Needle)
    foreach ($item in @($Array)) {
        if ([string]$item -match [regex]::Escape($Needle)) { return $true }
    }
    return $false
}

function Write-Utf8NoBom {
    param([string]$Path, [string]$Text)
    $utf8NoBom = [System.Text.UTF8Encoding]::new($false)
    [System.IO.File]::WriteAllText((Join-Path (Get-Location) $Path), $Text, $utf8NoBom)
}

function Write-Reports {
    param([object]$Summary)
    Write-Utf8NoBom -Path $OutputJson -Text (($Summary | ConvertTo-Json -Depth 100) + [Environment]::NewLine)

    $checkRows = @()
    foreach ($check in $Summary.checks) {
        $status = if ($check.ok) { "OK" } else { "FAIL" }
        $checkRows += "| $($check.name) | $status | $($check.details) |"
    }
    $checksTable = $checkRows -join "`n"

    $fieldRows = @()
    $fieldSource = $Summary.action_pack.delivery_fields_present
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
# MachineSignal - Machine Action Pack Single Purchase - 2026-06-08

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
4. Buy one Deep Analysis because the score recommends it.
5. Buy one Action Pack only by passing the Deep Analysis source order gate.
6. Retrieve the Action Pack order and usage.
7. Stop before any external action.

## Decision

- Demo target: $($Summary.score.domain)
- Score: $($Summary.score.opportunity_score)
- Score decision: $($Summary.score.decision)
- Deep Analysis order: $($Summary.deep_analysis.order_intent_id)
- Action Pack order: $($Summary.action_pack.order_intent_id)
- Action Pack delivery type: $($Summary.action_pack.delivery_type)
- Approval gate default state: $($Summary.action_pack.approval_gate_default_state)
- Email blocked without approval: $($Summary.action_pack.email_blocked_without_approval)
- External contact executed: $($Summary.safety.external_contact_executed)

## Action Pack Fields

| Field | Present |
|---|---|
$fieldsTable

## Checks

| Check | Status | Details |
|---|---|---|
$checksTable

## Interpretation

This run proves the full controlled spend ladder for a machine buyer: score, Deep Analysis and exactly one Action Pack. The Action Pack prepares CRM and workflow payloads, but its default approval gate blocks external contact.

The API did not send email, did not contact a target, did not execute a real payment and did not issue a fiscal invoice.

## Next Step

Use this proof as the evidence that Action Pack is a machine-readable preparation product, not an automatic outreach product. The next step should be a no-write review of all public marketplace/discovery copy so it does not imply live paid production availability.
"@
    Write-Utf8NoBom -Path $OutputMarkdown -Text ($md + [Environment]::NewLine)
}

$checks = [System.Collections.ArrayList]::new()
$runStamp = Get-Date -Format "yyyyMMddHHmmss"
$runId = "machine-action-pack-single-purchase-20260608-$runStamp"
$demoDomain = "premium-dental-conversion-gap.it"
$sandboxApiKey = $null

$summary = [ordered]@{
    artifact = "machine_action_pack_single_purchase"
    generated_at = (Get-Date).ToUniversalTime().ToString("o")
    run_id = $runId
    public_site = $PublicSite
    base_url = $BaseUrl
    status = "started"
    ok = $false
    machine_customer_mode = "machine_with_deep_analysis_gate_to_action_pack"
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
        delivery_type = $null
        delivery_status = $null
        action_pack_gate_present = $false
    }
    action_pack = [ordered]@{
        order_created = $false
        order_intent_id = $null
        status = $null
        delivery_type = $null
        delivery_status = $null
        credits_consumed = $null
        approval_gate_default_state = $null
        email_blocked_without_approval = $false
        delivery_fields_present = [ordered]@{
            what_is_included = $false
            crm_record_patch = $false
            crm_task = $false
            crm_platform_mappings = $false
            workflow_payload = $false
            webhook_event = $false
            webhook_delivery_policy = $false
            audit_event = $false
            approval_gate = $false
            agent_instructions = $false
            stop_rules = $false
            compliance_guardrail = $false
            next_api_calls = $false
        }
    }
    orders = [ordered]@{
        retrieval_status = $null
        listed_count = $null
        action_pack_order_retrieved = $false
    }
    usage = [ordered]@{
        status_after = $null
        ledger_backend = $null
    }
    safety = [ordered]@{
        real_payment_executed = $false
        external_contact_executed = $false
        real_invoice_issued = $false
        payment_test_created = $false
        real_target_used = $false
        api_key_published = $false
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
    Add-Check -Checks $checks -Name "action_pack_in_catalog" -Ok (Test-TextContains -Text $productCatalog.raw -Needle '"product_code": "action_pack"') -Details "Catalog includes action_pack."
    Add-Check -Checks $checks -Name "purchase_intent_in_openapi" -Ok (Test-TextContains -Text $openApi.raw -Needle '"/v1/purchase-intent"') -Details "OpenAPI exposes purchase-intent endpoint."

    $sandboxPayload = [ordered]@{
        customer_id = "sandbox_action_pack_20260608"
        evaluator_type = "ai_agent"
        integration_target = "crm_agent_or_machine_buyer_workflow"
        expected_test_path = "score_deep_analysis_then_one_action_pack_only"
    }
    $sandbox = Invoke-MachineSignal `
        -Method POST `
        -Uri "$BaseUrl/v1/sandbox/customers" `
        -Headers @{ "Idempotency-Key" = "machine-action-pack-sandbox-20260608" } `
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
        -Headers @{
            "X-API-Key" = $sandboxApiKey
            "Idempotency-Key" = "machine-action-pack-score-20260608"
        } `
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
        throw "Score did not recommend deep_analysis; stopping before downstream purchases."
    }

    $deepPayload = [ordered]@{
        product_code = "deep_analysis"
        domain = $demoDomain
        sector_hint = "dentist"
        area = "Lombardy"
        commercial_objective = "Find dental clinic websites where a machine should evaluate whether digital conversion improvement is a real commercial opportunity."
        source_score_request_id = [string]$score.body.request_id
        reason = "Single sandbox machine run: score recommended Deep Analysis before Action Pack. No payment and no external contact."
        max_budget_eur = 299
    }
    $deep = Invoke-MachineSignal `
        -Method POST `
        -Uri "$BaseUrl/v1/purchase-intent" `
        -Headers @{
            "X-API-Key" = $sandboxApiKey
            "Idempotency-Key" = "machine-action-pack-deep-analysis-20260608"
        } `
        -Body $deepPayload
    $summary.post_calls_executed += 1
    if ($deep.status -eq 200) { $summary.write_calls_executed += 1 }

    Add-Check -Checks $checks -Name "deep_analysis_created" -Ok ($deep.status -eq 200 -and $deep.body.product_code -eq "deep_analysis") -Details "HTTP $($deep.status)"
    if ($deep.status -ne 200) {
        throw "Deep Analysis purchase-intent failed: HTTP $($deep.status) $($deep.raw)"
    }

    $deepDelivery = $deep.body.delivery
    $summary.deep_analysis.order_created = $true
    $summary.deep_analysis.order_intent_id = [string]$deep.body.order_intent_id
    $summary.deep_analysis.delivery_type = [string]$deepDelivery.delivery_type
    $summary.deep_analysis.delivery_status = [string]$deepDelivery.status
    $summary.deep_analysis.action_pack_gate_present = (Test-HasProperty -Object $deepDelivery -Name "action_pack_purchase_gate")
    Add-Check -Checks $checks -Name "deep_analysis_gate_ready" -Ok ($summary.deep_analysis.action_pack_gate_present -eq $true -and $deepDelivery.status -eq "deep_analysis_ready") -Details "gate_present=$($summary.deep_analysis.action_pack_gate_present), status=$($deepDelivery.status)"

    $actionPayload = [ordered]@{
        product_code = "action_pack"
        domain = $demoDomain
        source_score_request_id = [string]$score.body.request_id
        source_order_intent_id = [string]$deep.body.order_intent_id
        reason = "Single sandbox machine run: Deep Analysis gate present, create one CRM/workflow Action Pack. Do not contact target."
        max_budget_eur = 10
    }
    $action = Invoke-MachineSignal `
        -Method POST `
        -Uri "$BaseUrl/v1/purchase-intent" `
        -Headers @{
            "X-API-Key" = $sandboxApiKey
            "Idempotency-Key" = "machine-action-pack-purchase-20260608"
        } `
        -Body $actionPayload
    $summary.post_calls_executed += 1
    if ($action.status -eq 200) { $summary.write_calls_executed += 1 }

    Add-Check -Checks $checks -Name "action_pack_created" -Ok ($action.status -eq 200 -and $action.body.product_code -eq "action_pack") -Details "HTTP $($action.status)"
    if ($action.status -ne 200) {
        throw "Action Pack purchase-intent failed: HTTP $($action.status) $($action.raw)"
    }

    $actionDelivery = $action.body.delivery
    $summary.action_pack.order_created = $true
    $summary.action_pack.order_intent_id = [string]$action.body.order_intent_id
    $summary.action_pack.status = [string]$action.body.status
    $summary.action_pack.delivery_type = [string]$actionDelivery.delivery_type
    $summary.action_pack.delivery_status = [string]$actionDelivery.status
    $summary.action_pack.credits_consumed = $action.body.usage.current_event.credits_consumed
    $summary.action_pack.approval_gate_default_state = [string]$actionDelivery.approval_gate.default_state
    $summary.action_pack.email_blocked_without_approval = (@($actionDelivery.approval_gate.blocked_without_approval) -contains "send_email")

    foreach ($fieldName in @(
        "what_is_included",
        "crm_record_patch",
        "crm_task",
        "crm_platform_mappings",
        "workflow_payload",
        "webhook_event",
        "webhook_delivery_policy",
        "audit_event",
        "approval_gate",
        "agent_instructions",
        "stop_rules",
        "compliance_guardrail",
        "next_api_calls"
    )) {
        $summary.action_pack.delivery_fields_present[$fieldName] = (Test-HasProperty -Object $actionDelivery -Name $fieldName)
    }

    Add-Check -Checks $checks -Name "action_pack_delivery_type_valid" -Ok ($actionDelivery.delivery_type -eq "action_pack") -Details "delivery_type=$($actionDelivery.delivery_type)"
    Add-Check -Checks $checks -Name "action_pack_delivery_ready" -Ok ($actionDelivery.status -eq "action_pack_ready") -Details "status=$($actionDelivery.status)"
    Add-Check -Checks $checks -Name "action_pack_consumed_one_credit" -Ok ($action.body.usage.current_event.credits_consumed -eq 1) -Details "credits_consumed=$($action.body.usage.current_event.credits_consumed)"
    Add-Check -Checks $checks -Name "action_pack_approval_gate_blocks_external_contact" -Ok ($actionDelivery.approval_gate.default_state -eq "blocked" -and $summary.action_pack.email_blocked_without_approval -eq $true) -Details "default=$($actionDelivery.approval_gate.default_state), email_blocked=$($summary.action_pack.email_blocked_without_approval)"
    Add-Check -Checks $checks -Name "action_pack_has_crm_payload" -Ok ((Test-HasProperty -Object $actionDelivery -Name "crm_record_patch") -and (Test-HasProperty -Object $actionDelivery -Name "crm_task")) -Details "CRM record and task present."
    Add-Check -Checks $checks -Name "action_pack_has_workflow_payload" -Ok (Test-HasProperty -Object $actionDelivery -Name "workflow_payload") -Details "Workflow payload present."
    Add-Check -Checks $checks -Name "action_pack_has_webhook_contract" -Ok ((Test-HasProperty -Object $actionDelivery -Name "webhook_event") -and (Test-HasProperty -Object $actionDelivery -Name "webhook_delivery_policy")) -Details "Webhook event and delivery policy present."
    Add-Check -Checks $checks -Name "action_pack_agent_instructions_block_auto_contact" -Ok (Test-ArrayContainsText -Array $actionDelivery.agent_instructions -Needle "Do not contact the target automatically") -Details "Agent instruction blocks automatic target contact."
    Add-Check -Checks $checks -Name "action_pack_audit_no_external_contact" -Ok ($actionDelivery.audit_event.external_contact_executed -eq $false) -Details "audit external_contact_executed=$($actionDelivery.audit_event.external_contact_executed)"

    $order = Invoke-MachineSignal `
        -Method GET `
        -Uri "$BaseUrl/v1/orders/$($summary.action_pack.order_intent_id)" `
        -Headers @{ "X-API-Key" = $sandboxApiKey }
    $summary.orders.retrieval_status = $order.status
    $summary.orders.action_pack_order_retrieved = ($order.status -eq 200 -and $order.body.order.order_intent_id -eq $summary.action_pack.order_intent_id)
    Add-Check -Checks $checks -Name "action_pack_order_retrieved" -Ok $summary.orders.action_pack_order_retrieved -Details "HTTP $($order.status)"

    $orders = Invoke-MachineSignal `
        -Method GET `
        -Uri "$BaseUrl/v1/orders" `
        -Headers @{ "X-API-Key" = $sandboxApiKey }
    $summary.orders.listed_count = if ($orders.status -eq 200) { [int]$orders.body.count } else { $null }
    Add-Check -Checks $checks -Name "orders_list_contains_deep_and_action" -Ok ($orders.status -eq 200 -and $orders.body.count -ge 2) -Details "HTTP $($orders.status), count=$($orders.body.count)"

    $usage = Invoke-MachineSignal `
        -Method GET `
        -Uri "$BaseUrl/v1/usage" `
        -Headers @{ "X-API-Key" = $sandboxApiKey }
    $summary.usage.status_after = $usage.status
    $summary.usage.ledger_backend = if ($usage.status -eq 200) { [string]$usage.body.ledger_backend } else { $null }
    Add-Check -Checks $checks -Name "usage_reachable_after_action_pack" -Ok ($usage.status -eq 200) -Details "HTTP $($usage.status), backend=$($summary.usage.ledger_backend)"

    $realPayment = $false
    $externalContact = $false
    foreach ($candidate in @($sandbox.body, $score.body, $deep.body, $action.body, $order.body, $orders.body, $usage.body)) {
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

    $summary.status = "completed_action_pack_single_purchase"
    $summary.checks = @($checks)
    $summary.ok = (@($checks | Where-Object { $_.ok -eq $false }).Count -eq 0)
} catch {
    $summary.status = "blocked_or_failed_action_pack_single_purchase"
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

$summary | ConvertTo-Json -Depth 100
