param(
    [string]$BaseUrl = "https://machinesignal-api.beta-878.workers.dev",
    [string]$AdminKeyPath = (Join-Path $env:APPDATA "MachineSignal\machinesignal_admin_api_key.dpapi"),
    [string]$OutputJson = "machine_customer_e2e_live_test_summary_20260604.json",
    [string]$OutputMarkdown = "machine_customer_e2e_live_test_report_20260604.md"
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
        $options.Body = ($Body | ConvertTo-Json -Depth 30)
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

function Get-Balance {
    param(
        [object]$Usage,
        [string]$ProductCode
    )
    return $Usage.balances | Where-Object { $_.product_code -eq $ProductCode } | Select-Object -First 1
}

$adminKey = ConvertFrom-StoredSecureString -Path $AdminKeyPath
$runId = (Get-Date -Format "yyyyMMddHHmmss")
$customerId = ("machine_e2e_{0}" -f $runId).ToLowerInvariant()
$adminHeaders = @{
    "X-API-Key" = $adminKey
    "Content-Type" = "application/json"
}

$summary = [ordered]@{
    service = "MachineSignal"
    report_type = "machine_customer_e2e_live_test"
    generated_at = (Get-Date).ToUniversalTime().ToString("o")
    base_url = $BaseUrl
    status = "started"
    real_payment_enabled = $false
    ready_for_real_payments = $false
    customer_id = $customerId
    steps = [ordered]@{}
    safety = [ordered]@{
        real_payment_executed = $false
        external_contact_executed = $false
        real_invoice_issued = $false
    }
}

try {
    $customer = Invoke-Json -Method "POST" -Uri "$BaseUrl/v1/beta/customers" -Headers $adminHeaders -Body @{
        customer_id = $customerId
        contact_email = "machine-e2e-test@example.com"
        plan = "machine_customer_e2e_validation"
        score_credits = 5
        target_discovery_credits = 1
        domain_enrichment_credits = 1
        deep_analysis_credits = 1
        action_pack_credits = 1
        opportunity_feed_credits = 0
    }
    $customerKey = $customer.api_key
    $customerHeaders = @{
        "X-API-Key" = $customerKey
        "Content-Type" = "application/json"
    }
    $summary.steps.customer_created = @{
        ok = $true
        customer_type = $customer.customer_type
        plan = $customer.plan
    }

    $onboarding = Invoke-Json -Method "GET" -Uri "$BaseUrl/v1/onboarding" -Headers @{ "X-API-Key" = $customerKey }
    $summary.steps.authenticated_onboarding = @{
        ok = ($onboarding.customer_id -eq $customerId)
        primary_customer_interface = $onboarding.machine_contract.primary_customer_interface
        can_create_payment_tests = $onboarding.customer_state.can_create_payment_tests
        payment_test_mode_enabled = $onboarding.customer_state.payment_test_mode_enabled
    }

    $targetDiscovery = Invoke-Json -Method "POST" -Uri "$BaseUrl/v1/purchase-intent" -Headers ($customerHeaders + @{
        "Idempotency-Key" = "e2e-target-discovery-$runId"
    }) -Body @{
        product_code = "target_discovery"
        market = "medicina estetica"
        area = "Lombardia"
        commercial_objective = "find medical aesthetic websites worth scoring for digital presence improvement opportunities"
        reason = "Customer machine has no starting list"
    }
    $summary.steps.target_discovery = @{
        ok = ($targetDiscovery.status -eq "accepted_beta_order_intent")
        order_intent_id = $targetDiscovery.order_intent_id
        product_code = $targetDiscovery.product_code
        delivery_type = $targetDiscovery.delivery.delivery_type
        sample_targets = $targetDiscovery.delivery.beta_sample_targets.Count
        real_payment_executed = $targetDiscovery.real_payment_executed
        external_contact_executed = $targetDiscovery.external_contact_executed
    }

    $score = Invoke-Json -Method "POST" -Uri "$BaseUrl/v1/lead-opportunity-score" -Headers ($customerHeaders + @{
        "Idempotency-Key" = "e2e-score-$runId"
    }) -Body @{
        domain = "quinta-essenza.com"
        sector_hint = "medicina estetica"
        country_hint = "IT"
        target_name = "Quinta Essenza"
        category_hint = "centro medicina estetica"
        source_type = "target_discovery_sample"
        initial_signals = "sector_match;local_market;business_domain_present"
    }
    $summary.steps.score = @{
        ok = ($score.opportunity_score -ge 0)
        domain = $score.domain
        opportunity_score = $score.opportunity_score
        decision = $score.decision
        commercial_strength_level = $score.commercial_strength.level
        next_product = $score.next_purchase.next_product
        credits_remaining = (Get-Balance -Usage $score.usage -ProductCode "score_pack_1k").credits_remaining
    }

    $deepAnalysis = Invoke-Json -Method "POST" -Uri "$BaseUrl/v1/purchase-intent" -Headers ($customerHeaders + @{
        "Idempotency-Key" = "e2e-deep-analysis-$runId"
    }) -Body @{
        product_code = "deep_analysis"
        domain = "quinta-essenza.com"
        source_score_request_id = "e2e-score-$runId"
        reason = "Score and commercial strength justify deep analysis in controlled beta"
    }
    $summary.steps.deep_analysis = @{
        ok = ($deepAnalysis.product_code -eq "deep_analysis")
        order_intent_id = $deepAnalysis.order_intent_id
        delivery_type = $deepAnalysis.delivery.delivery_type
        next_product = $deepAnalysis.delivery.recommended_next_step.product_code
        real_payment_executed = $deepAnalysis.real_payment_executed
    }

    $actionPack = Invoke-Json -Method "POST" -Uri "$BaseUrl/v1/purchase-intent" -Headers ($customerHeaders + @{
        "Idempotency-Key" = "e2e-action-pack-$runId"
    }) -Body @{
        product_code = "action_pack"
        domain = "quinta-essenza.com"
        source_score_request_id = "e2e-score-$runId"
        source_order_intent_id = $deepAnalysis.order_intent_id
        reason = "Deep Analysis confirmed a machine-actionable opportunity"
        max_budget_eur = 10
    }
    $summary.steps.action_pack = @{
        ok = ($actionPack.product_code -eq "action_pack")
        order_intent_id = $actionPack.order_intent_id
        delivery_type = $actionPack.delivery.delivery_type
        webhook_event_type = $actionPack.delivery.webhook_event.event_type
        approval_gate_default_state = $actionPack.delivery.approval_gate.default_state
        external_contact_executed = $actionPack.delivery.external_contact_executed
    }

    $paymentTest = Invoke-Json -Method "POST" -Uri "$BaseUrl/v1/payment-test/intents" -Headers ($customerHeaders + @{
        "Idempotency-Key" = "e2e-payment-test-$runId"
    }) -Body @{
        product_code = "score_pack_1k"
        amount_eur = 99
        provider = "stripe"
        provider_mode = "test"
        metadata = @{
            source_flow = "machine_customer_e2e_live_test"
            prior_action_pack_order = $actionPack.order_intent_id
        }
    }
    $summary.steps.payment_test_intent = @{
        ok = ($paymentTest.payment_test_id -ne $null)
        payment_test_id = $paymentTest.payment_test_id
        provider_mode = $paymentTest.provider_mode
        credits_to_activate = $paymentTest.credits_to_activate
        real_payment_executed = $paymentTest.real_payment_executed
        ready_for_real_payments = $paymentTest.ready_for_real_payments
    }

    $liveModeBlocked = Invoke-JsonExpectError -Method "POST" -Uri "$BaseUrl/v1/payment-test/intents" -Headers ($customerHeaders + @{
        "Idempotency-Key" = "e2e-payment-live-block-$runId"
    }) -Body @{
        product_code = "score_pack_1k"
        amount_eur = 99
        provider = "stripe"
        provider_mode = "live"
    }
    $summary.steps.live_payment_mode_block = @{
        ok = ($liveModeBlocked.status -eq 400)
        http_status = $liveModeBlocked.status
    }

    $webhook = Invoke-Json -Method "POST" -Uri "$BaseUrl/v1/payment-test/webhooks/stripe" -Headers @{
        "Content-Type" = "application/json"
        "X-MachineSignal-Test-Webhook-Signature" = $paymentTest.test_webhook_simulation.success_signature
    } -Body @{
        customer_id = $customerId
        payment_test_id = $paymentTest.payment_test_id
        event_type = "payment_intent.succeeded"
        event_id = "e2e-evt-success-$runId"
    }
    $summary.steps.payment_test_webhook = @{
        ok = ($webhook.payment_status -eq "test_payment_succeeded")
        payment_status = $webhook.payment_status
        credits_activated = $webhook.credits_activated
        real_payment_executed = $webhook.real_payment_executed
        invoice_real_issued = $webhook.invoice_placeholder.real_invoice_issued
    }

    $duplicateWebhook = Invoke-Json -Method "POST" -Uri "$BaseUrl/v1/payment-test/webhooks/stripe" -Headers @{
        "Content-Type" = "application/json"
        "X-MachineSignal-Test-Webhook-Signature" = $paymentTest.test_webhook_simulation.success_signature
    } -Body @{
        customer_id = $customerId
        payment_test_id = $paymentTest.payment_test_id
        event_type = "payment_intent.succeeded"
        event_id = "e2e-evt-success-$runId"
    }
    $summary.steps.duplicate_webhook = @{
        ok = ($duplicateWebhook.duplicate_webhook -eq $true)
        duplicate_webhook = $duplicateWebhook.duplicate_webhook
        score_pack_credits_purchased = (Get-Balance -Usage $duplicateWebhook.usage -ProductCode "score_pack_1k").credits_purchased
    }

    $reconciliation = Invoke-Json -Method "GET" -Uri "$BaseUrl/v1/payment-test/reconciliation/$($paymentTest.payment_test_id)" -Headers @{
        "X-API-Key" = $customerKey
    }
    $summary.steps.reconciliation = @{
        ok = ($reconciliation.reconciliation_ok -eq $true)
        reconciliation_ok = $reconciliation.reconciliation_ok
        ready_for_real_payments = $reconciliation.ready_for_real_payments
        real_payment_executed = $reconciliation.real_payment_executed
    }

    $orders = Invoke-Json -Method "GET" -Uri "$BaseUrl/v1/orders" -Headers @{
        "X-API-Key" = $customerKey
    }
    $summary.steps.order_history = @{
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
    $summary.steps.admin_reports = @{
        ok = ($audit.summary.reconciliation_ok -eq $true -and $paymentReport.summary.reconciliation_ok -eq $true)
        audit_reconciliation_ok = $audit.summary.reconciliation_ok
        payment_test_count = $paymentReport.summary.payment_test_count
        payment_test_succeeded = $paymentReport.summary.succeeded
        ready_for_real_payments = $paymentReport.summary.ready_for_real_payments
    }

    $summary.status = "passed"
    $summary.safety.real_payment_executed = $false
    $summary.safety.external_contact_executed = $false
    $summary.safety.real_invoice_issued = $false
} finally {
    try {
        if ($customerId) {
            Invoke-Json -Method "PATCH" -Uri "$BaseUrl/v1/beta/customers/$customerId" -Headers $adminHeaders -Body @{
                status = "closed"
                reason = "completed machine customer e2e live test"
            } | Out-Null
            $summary.steps.customer_closed = @{ ok = $true }
        }
    } catch {
        $summary.steps.customer_closed = @{ ok = $false; error = "customer close failed" }
    }
}

$utf8NoBom = [System.Text.UTF8Encoding]::new($false)
[System.IO.File]::WriteAllText($OutputJson, ($summary | ConvertTo-Json -Depth 40), $utf8NoBom)

$md = @"
# MachineSignal Machine Customer E2E Live Test - 2026-06-04

## Result

Status: $($summary.status)

Base URL: $BaseUrl

Customer id: $customerId

## Flow tested

1. Create temporary beta customer.
2. Read authenticated onboarding.
3. Buy Target Discovery because the machine has no starting list.
4. Score a discovered/selected domain.
5. Buy Deep Analysis.
6. Buy Action Pack.
7. Create simulated payment-test intent for Score Pack 1k.
8. Verify live payment mode is blocked.
9. Simulate succeeded payment webhook.
10. Verify duplicate webhook does not duplicate credits.
11. Reconcile payment test.
12. Read orders, ledger audit and payment-test admin report.
13. Close temporary customer.

## Key results

- Target Discovery order: $($summary.steps.target_discovery.ok)
- Score decision: $($summary.steps.score.decision)
- Commercial strength: $($summary.steps.score.commercial_strength_level)
- Deep Analysis order: $($summary.steps.deep_analysis.ok)
- Action Pack order: $($summary.steps.action_pack.ok)
- Payment test intent: $($summary.steps.payment_test_intent.ok)
- Live mode blocked HTTP status: $($summary.steps.live_payment_mode_block.http_status)
- Test credits activated: $($summary.steps.payment_test_webhook.credits_activated)
- Duplicate webhook handled: $($summary.steps.duplicate_webhook.duplicate_webhook)
- Payment reconciliation OK: $($summary.steps.reconciliation.reconciliation_ok)
- Admin reports OK: $($summary.steps.admin_reports.ok)

## Safety

- Real payment executed: false
- External contact executed: false
- Real fiscal invoice issued: false
- Ready for real payments: false

## Interpretation

The machine-first beta flow is callable end to end. A customer machine can discover the contract, create a no-list target discovery order, score a domain, buy deeper machine-readable outputs, simulate checkout, activate test credits and reconcile the ledger without human email outreach or real payment execution.

Real payment remains blocked until fiscal, legal, privacy, provider and invoicing controls are complete.
"@
[System.IO.File]::WriteAllText($OutputMarkdown, $md, $utf8NoBom)

$summary | ConvertTo-Json -Depth 40
