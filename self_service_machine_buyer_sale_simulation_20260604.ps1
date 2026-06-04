param(
    [string]$BaseUrl = "https://machinesignal-api.beta-878.workers.dev",
    [string]$WebsiteUrl = "https://machinesignal.it",
    [string]$AdminKeyPath = (Join-Path $env:APPDATA "MachineSignal\machinesignal_admin_api_key.dpapi"),
    [string]$OutputJson = "self_service_machine_buyer_sale_simulation_summary_20260604.json",
    [string]$OutputMarkdown = "self_service_machine_buyer_sale_simulation_report_20260604.md"
)

$ErrorActionPreference = "Stop"

function ConvertFrom-StoredSecureString {
    param([string]$Path)
    $secure = ((Get-Content -LiteralPath $Path -Raw).Trim() | ConvertTo-SecureString)
    $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
    try {
        return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)
    } finally {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)
    }
}

function Invoke-Json {
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
    }
    if ($null -ne $Body) {
        $options.Body = ($Body | ConvertTo-Json -Depth 50)
        if (-not $options.Headers.ContainsKey("Content-Type")) {
            $options.Headers["Content-Type"] = "application/json"
        }
    }
    return Invoke-RestMethod @options
}

function Invoke-JsonExpectError {
    param(
        [string]$Method,
        [string]$Uri,
        [hashtable]$Headers = @{},
        [object]$Body = $null
    )
    try {
        Invoke-Json -Method $Method -Uri $Uri -Headers $Headers -Body $Body | Out-Null
        return @{ status = "unexpected_success"; body = $null }
    } catch {
        $statusCode = $null
        if ($_.Exception.Response) {
            $statusCode = $_.Exception.Response.StatusCode.value__
        }
        return @{ status = $statusCode; body = $null }
    }
}

function Get-Text {
    param([string]$Uri)
    $response = Invoke-WebRequest -UseBasicParsing -Uri $Uri -TimeoutSec 30
    if ($response.Content -is [byte[]]) {
        return [System.Text.Encoding]::UTF8.GetString($response.Content)
    }
    return [string]$response.Content
}

function Get-Balance {
    param(
        [object]$Usage,
        [string]$ProductCode
    )
    return $Usage.balances | Where-Object { $_.product_code -eq $ProductCode } | Select-Object -First 1
}

function Write-Reports {
    param([object]$Summary)

    $utf8NoBom = [System.Text.UTF8Encoding]::new($false)
    [System.IO.File]::WriteAllText($OutputJson, ($Summary | ConvertTo-Json -Depth 70), $utf8NoBom)

    $md = @"
# MachineSignal Self-Service Machine Buyer Sale Simulation - 2026-06-04

## Result

Status: $($Summary.status)

Customer id: $($Summary.customer_id)

Customer type: $($Summary.customer_type)

Readiness gate: $($Summary.readiness_gate.status)

## What was tested

1. Public machine discovery through llms.txt, machine-onboarding.json, product-catalog.json and .well-known/machine-discovery.json.
2. Self-service sandbox customer creation without human sales contact.
3. Authenticated onboarding with the sandbox key.
4. No-list Target Discovery order intent.
5. Lead Opportunity Score for a selected target.
6. Deep Analysis order intent after score recommendation.
7. Action Pack order intent after Deep Analysis.
8. Simulated checkout for Score Pack 1k in sandbox mode.
9. Live payment mode blocked.
10. Sandbox webhook success, duplicate webhook check and reconciliation.
11. Internal admin audit, payment-test report and sandbox metrics.
12. Sandbox customer closed by the internal agent after the test.

## Key commercial result

- Score: $($Summary.steps.score.opportunity_score)
- Decision: $($Summary.steps.score.decision)
- Commercial strength: $($Summary.steps.score.commercial_strength_level)
- Orders created: $($Summary.steps.orders.count)
- Test credits activated: $($Summary.steps.payment_webhook.credits_activated)
- Simulated checkout product: $($Summary.steps.payment_intent.product_code)
- Provider mode: $($Summary.steps.payment_intent.provider_mode)

## Safety

- Real payment executed: $($Summary.safety.real_payment_executed)
- External contact executed: $($Summary.safety.external_contact_executed)
- Real invoice issued: $($Summary.safety.real_invoice_issued)
- Live payment mode blocked HTTP status: $($Summary.steps.live_payment_mode_block.http_status)
- Payment reconciliation OK: $($Summary.steps.reconciliation.reconciliation_ok)

## Interpretation

This is the closest current test to a machine-first sale. A buyer machine can discover MachineSignal publicly, create a limited sandbox key, evaluate the API, request machine-readable deliverables and simulate a checkout without human email persuasion.

The business is still not ready for real payments. The correct next commercial step is to keep using sandbox/test-mode checkout while preparing fiscal, legal, invoicing, refund and provider controls.
"@
    [System.IO.File]::WriteAllText($OutputMarkdown, $md, $utf8NoBom)
}

$runId = (Get-Date -Format "yyyyMMddHHmmss")
$customerId = ("sandbox_sale_sim_{0}" -f $runId).ToLowerInvariant()
$adminKey = ConvertFrom-StoredSecureString -Path $AdminKeyPath
$adminHeaders = @{
    "X-API-Key" = $adminKey
    "Content-Type" = "application/json"
}

$summary = [ordered]@{
    service = "MachineSignal"
    report_type = "self_service_machine_buyer_sale_simulation"
    generated_at = (Get-Date).ToUniversalTime().ToString("o")
    base_url = $BaseUrl
    website_url = $WebsiteUrl
    status = "started"
    customer_id = $customerId
    customer_type = $null
    primary_customer_interface = "machine"
    readiness_gate = [ordered]@{}
    public_discovery = [ordered]@{}
    steps = [ordered]@{}
    safety = [ordered]@{
        real_payment_executed = $false
        external_contact_executed = $false
        real_invoice_issued = $false
    }
    internal_admin_checks = [ordered]@{}
    cleanup = [ordered]@{}
}

try {
    $readiness = Invoke-RestMethod -Uri "$WebsiteUrl/readiness-dashboard/readiness.json?run=$runId" -TimeoutSec 30
    $gateOk =
        $readiness.controlled_beta_status -eq "ready_for_controlled_beta" -and
        $readiness.real_payment_status -eq "blocked_for_real_payments" -and
        $readiness.real_payment_enabled -eq $false -and
        $readiness.external_contact_enabled -eq $false
    $summary.readiness_gate = [ordered]@{
        ok = $gateOk
        status = $(if ($gateOk) { "passed" } else { "blocked" })
        controlled_beta_status = $readiness.controlled_beta_status
        real_payment_status = $readiness.real_payment_status
        gate_count = $readiness.gates.Count
    }
    if (-not $gateOk) {
        $summary.status = "blocked_by_readiness_gate"
        Write-Reports -Summary $summary
        $summary | ConvertTo-Json -Depth 70
        exit 0
    }

    $publicFiles = [ordered]@{
        llms = "$WebsiteUrl/llms.txt"
        machine_onboarding = "$WebsiteUrl/machine-onboarding.json"
        product_catalog = "$WebsiteUrl/product-catalog.json"
        machine_discovery = "$WebsiteUrl/.well-known/machine-discovery.json"
        readiness_dashboard = "$WebsiteUrl/readiness-dashboard/readiness.json"
    }
    foreach ($item in $publicFiles.GetEnumerator()) {
        $content = Get-Text -Uri "$($item.Value)?run=$runId"
        $summary.public_discovery[$item.Key] = [ordered]@{
            ok = $content.Length -gt 50
            url = $item.Value
            bytes = $content.Length
        }
    }

    $sandbox = Invoke-Json -Method "POST" -Uri "$BaseUrl/v1/sandbox/customers" -Headers @{
        "Content-Type" = "application/json"
        "Idempotency-Key" = "self-service-sale-sandbox-$runId"
    } -Body @{
        customer_id = $customerId
        evaluator_type = "machine_buyer"
        integration_target = "crm_agentic_workflow"
        expected_test_path = "discover_score_buy_payment_test_reconcile"
    }
    $customerKey = $sandbox.api_key
    $summary.customer_type = $sandbox.customer_type
    $summary.steps.sandbox_created = [ordered]@{
        ok = ($sandbox.sandbox -eq $true -and $sandbox.customer_type -eq "sandbox")
        customer_type = $sandbox.customer_type
        expires_at = $sandbox.expires_at
        real_payment_executed = $sandbox.guardrails.real_payment_executed
        external_contact_executed = $sandbox.guardrails.external_contact_executed
        score_limit = $sandbox.sandbox_limits.score_pack_1k
        deep_analysis_limit = $sandbox.sandbox_limits.deep_analysis_pack_100
        action_pack_limit = $sandbox.sandbox_limits.action_pack_25
    }

    $customerHeaders = @{
        "X-API-Key" = $customerKey
        "Content-Type" = "application/json"
    }

    $onboarding = Invoke-Json -Method "GET" -Uri "$BaseUrl/v1/onboarding" -Headers @{ "X-API-Key" = $customerKey }
    $summary.steps.authenticated_onboarding = [ordered]@{
        ok = ($onboarding.customer_id -eq $customerId)
        primary_customer_interface = $onboarding.machine_contract.primary_customer_interface
        customer_type = $onboarding.customer_state.customer_type
        payment_test_mode_enabled = $onboarding.customer_state.payment_test_mode_enabled
        can_create_payment_tests = $onboarding.customer_state.can_create_payment_tests
    }

    $targetDiscovery = Invoke-Json -Method "POST" -Uri "$BaseUrl/v1/purchase-intent" -Headers ($customerHeaders + @{
        "Idempotency-Key" = "self-service-sale-target-$runId"
    }) -Body @{
        product_code = "target_discovery"
        market = "studi legali"
        area = "Milano e Lombardia"
        commercial_objective = "find law firm websites worth scoring for digital presence improvement opportunities"
        reason = "Self-service buyer machine has no starting list"
    }
    $summary.steps.target_discovery = [ordered]@{
        ok = ($targetDiscovery.status -eq "accepted_beta_order_intent")
        order_intent_id = $targetDiscovery.order_intent_id
        delivery_type = $targetDiscovery.delivery.delivery_type
        sample_targets = $targetDiscovery.delivery.beta_sample_targets.Count
        real_payment_executed = $targetDiscovery.real_payment_executed
        external_contact_executed = $targetDiscovery.external_contact_executed
    }

    $score = Invoke-Json -Method "POST" -Uri "$BaseUrl/v1/lead-opportunity-score" -Headers ($customerHeaders + @{
        "Idempotency-Key" = "self-service-sale-score-$runId"
    }) -Body @{
        domain = "studiolegale-rossi.it"
        sector_hint = "legal law studio legale avvocati"
        country_hint = "IT"
        target_name = "Studio Legale Rossi"
        category_hint = "studio legale"
        source_type = "target_discovery_sample"
        initial_signals = "sector_match;service_keyword_present;business_domain_present;official_site;public_web_result;local_market;website_opportunity;weak_cta;conversion_friction"
    }
    $summary.steps.score = [ordered]@{
        ok = ($score.opportunity_score -ge 0)
        domain = $score.domain
        opportunity_score = $score.opportunity_score
        confidence = $score.confidence
        decision = $score.decision
        commercial_strength_level = $score.commercial_strength.level
        spend_policy = $score.commercial_strength.spend_policy
        next_product = $score.next_purchase.next_product
        credits_remaining = (Get-Balance -Usage $score.usage -ProductCode "score_pack_1k").credits_remaining
    }

    $deepAnalysis = Invoke-Json -Method "POST" -Uri "$BaseUrl/v1/purchase-intent" -Headers ($customerHeaders + @{
        "Idempotency-Key" = "self-service-sale-deep-$runId"
    }) -Body @{
        product_code = "deep_analysis"
        domain = "studiolegale-rossi.it"
        source_score_request_id = "self-service-sale-score-$runId"
        reason = "Self-service buyer follows score next_purchase recommendation"
    }
    $summary.steps.deep_analysis = [ordered]@{
        ok = ($deepAnalysis.product_code -eq "deep_analysis")
        order_intent_id = $deepAnalysis.order_intent_id
        delivery_type = $deepAnalysis.delivery.delivery_type
        next_product = $deepAnalysis.delivery.recommended_next_step.product_code
        real_payment_executed = $deepAnalysis.real_payment_executed
    }

    $actionPack = Invoke-Json -Method "POST" -Uri "$BaseUrl/v1/purchase-intent" -Headers ($customerHeaders + @{
        "Idempotency-Key" = "self-service-sale-action-$runId"
    }) -Body @{
        product_code = "action_pack"
        domain = "studiolegale-rossi.it"
        source_score_request_id = "self-service-sale-score-$runId"
        source_order_intent_id = $deepAnalysis.order_intent_id
        reason = "Self-service buyer wants a CRM-ready action payload after Deep Analysis"
        max_budget_eur = 10
    }
    $summary.steps.action_pack = [ordered]@{
        ok = ($actionPack.product_code -eq "action_pack")
        order_intent_id = $actionPack.order_intent_id
        delivery_type = $actionPack.delivery.delivery_type
        webhook_event_type = $actionPack.delivery.webhook_event.event_type
        approval_gate_default_state = $actionPack.delivery.approval_gate.default_state
        external_contact_executed = $actionPack.delivery.external_contact_executed
    }

    $paymentIntent = Invoke-Json -Method "POST" -Uri "$BaseUrl/v1/payment-test/intents" -Headers ($customerHeaders + @{
        "Idempotency-Key" = "self-service-sale-payment-$runId"
    }) -Body @{
        product_code = "score_pack_1k"
        amount_eur = 99
        provider = "stripe"
        provider_mode = "sandbox"
        order_intent_id = $actionPack.order_intent_id
        metadata = @{
            source_flow = "self_service_machine_buyer_sale_simulation"
            buyer_machine = "sandbox_public_endpoint"
        }
    }
    $summary.steps.payment_intent = [ordered]@{
        ok = ($paymentIntent.payment_test_id -ne $null)
        payment_test_id = $paymentIntent.payment_test_id
        product_code = $paymentIntent.product_code
        provider_mode = $paymentIntent.provider_mode
        amount_eur = $paymentIntent.amount_eur
        credits_to_activate = $paymentIntent.credits_to_activate
        real_payment_executed = $paymentIntent.real_payment_executed
        ready_for_real_payments = $paymentIntent.ready_for_real_payments
    }

    $liveModeBlocked = Invoke-JsonExpectError -Method "POST" -Uri "$BaseUrl/v1/payment-test/intents" -Headers ($customerHeaders + @{
        "Idempotency-Key" = "self-service-sale-live-block-$runId"
    }) -Body @{
        product_code = "score_pack_1k"
        amount_eur = 99
        provider = "stripe"
        provider_mode = "live"
    }
    $summary.steps.live_payment_mode_block = [ordered]@{
        ok = ($liveModeBlocked.status -eq 400)
        http_status = $liveModeBlocked.status
    }

    $webhook = Invoke-Json -Method "POST" -Uri "$BaseUrl/v1/payment-test/webhooks/stripe" -Headers @{
        "Content-Type" = "application/json"
        "X-MachineSignal-Test-Webhook-Signature" = $paymentIntent.test_webhook_simulation.success_signature
    } -Body @{
        customer_id = $customerId
        payment_test_id = $paymentIntent.payment_test_id
        event_type = "payment_intent.succeeded"
        event_id = "self-service-sale-evt-$runId"
    }
    $summary.steps.payment_webhook = [ordered]@{
        ok = ($webhook.payment_status -eq "test_payment_succeeded")
        payment_status = $webhook.payment_status
        credits_activated = $webhook.credits_activated
        real_payment_executed = $webhook.real_payment_executed
        invoice_real_issued = $webhook.invoice_placeholder.real_invoice_issued
    }

    $duplicateWebhook = Invoke-Json -Method "POST" -Uri "$BaseUrl/v1/payment-test/webhooks/stripe" -Headers @{
        "Content-Type" = "application/json"
        "X-MachineSignal-Test-Webhook-Signature" = $paymentIntent.test_webhook_simulation.success_signature
    } -Body @{
        customer_id = $customerId
        payment_test_id = $paymentIntent.payment_test_id
        event_type = "payment_intent.succeeded"
        event_id = "self-service-sale-evt-$runId"
    }
    $summary.steps.duplicate_webhook = [ordered]@{
        ok = ($duplicateWebhook.duplicate_webhook -eq $true)
        duplicate_webhook = $duplicateWebhook.duplicate_webhook
        score_pack_credits_purchased = (Get-Balance -Usage $duplicateWebhook.usage -ProductCode "score_pack_1k").credits_purchased
    }

    $reconciliation = Invoke-Json -Method "GET" -Uri "$BaseUrl/v1/payment-test/reconciliation/$($paymentIntent.payment_test_id)" -Headers @{
        "X-API-Key" = $customerKey
    }
    $summary.steps.reconciliation = [ordered]@{
        ok = ($reconciliation.reconciliation_ok -eq $true)
        reconciliation_ok = $reconciliation.reconciliation_ok
        ready_for_real_payments = $reconciliation.ready_for_real_payments
        real_payment_executed = $reconciliation.real_payment_executed
    }

    $orders = Invoke-Json -Method "GET" -Uri "$BaseUrl/v1/orders" -Headers @{
        "X-API-Key" = $customerKey
    }
    $summary.steps.orders = [ordered]@{
        ok = ($orders.count -ge 3)
        count = $orders.count
        products = @($orders.orders | ForEach-Object { $_.product_code })
    }

    $audit = Invoke-Json -Method "GET" -Uri "$BaseUrl/v1/admin/audit-report?customer_id=$customerId" -Headers @{
        "X-API-Key" = $adminKey
    }
    $paymentReport = Invoke-Json -Method "GET" -Uri "$BaseUrl/v1/admin/payment-test-report?customer_id=$customerId" -Headers @{
        "X-API-Key" = $adminKey
    }
    $sandboxMetrics = Invoke-Json -Method "GET" -Uri "$BaseUrl/v1/admin/sandbox-metrics" -Headers @{
        "X-API-Key" = $adminKey
    }
    $summary.internal_admin_checks = [ordered]@{
        audit_reconciliation_ok = $audit.summary.reconciliation_ok
        simulated_revenue_eur = $audit.summary.simulated_revenue_eur
        payment_test_count = $paymentReport.summary.payment_test_count
        payment_test_succeeded = $paymentReport.summary.succeeded
        payment_report_reconciliation_ok = $paymentReport.summary.reconciliation_ok
        sandbox_customers_total = $sandboxMetrics.sandbox_customers.total
        sandbox_scores_used = $sandboxMetrics.usage.score_credits_used
    }

    $summary.safety.real_payment_executed = [bool](
        $targetDiscovery.real_payment_executed -or
        $deepAnalysis.real_payment_executed -or
        $actionPack.real_payment_executed -or
        $paymentIntent.real_payment_executed -or
        $webhook.real_payment_executed -or
        $reconciliation.real_payment_executed
    )
    $summary.safety.external_contact_executed = [bool](
        $targetDiscovery.external_contact_executed -or
        $actionPack.delivery.external_contact_executed
    )
    $summary.safety.real_invoice_issued = [bool]($webhook.invoice_placeholder.real_invoice_issued)

    $requiredSteps = @(
        $summary.steps.sandbox_created.ok,
        $summary.steps.authenticated_onboarding.ok,
        $summary.steps.target_discovery.ok,
        $summary.steps.score.ok,
        $summary.steps.deep_analysis.ok,
        $summary.steps.action_pack.ok,
        $summary.steps.payment_intent.ok,
        $summary.steps.live_payment_mode_block.ok,
        $summary.steps.payment_webhook.ok,
        $summary.steps.duplicate_webhook.ok,
        $summary.steps.reconciliation.ok,
        $summary.steps.orders.ok,
        $summary.internal_admin_checks.audit_reconciliation_ok,
        $summary.internal_admin_checks.payment_report_reconciliation_ok
    )
    $summary.status = $(if (
        ($requiredSteps | Where-Object { $_ -ne $true }).Count -eq 0 -and
        -not $summary.safety.real_payment_executed -and
        -not $summary.safety.external_contact_executed -and
        -not $summary.safety.real_invoice_issued
    ) { "passed" } else { "review" })
} catch {
    $summary.status = "failed"
    $summary.error = $_.Exception.Message
} finally {
    try {
        Invoke-Json -Method "PATCH" -Uri "$BaseUrl/v1/beta/customers/$customerId" -Headers $adminHeaders -Body @{
            status = "closed"
            reason = "completed self-service machine buyer sale simulation"
        } | Out-Null
        $summary.cleanup.customer_closed = $true
    } catch {
        $summary.cleanup.customer_closed = $false
        $summary.cleanup.error = "customer close failed"
    }
}

Write-Reports -Summary $summary
$summary | ConvertTo-Json -Depth 70
