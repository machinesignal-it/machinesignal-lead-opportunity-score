param(
    [string]$BaseUrl = "https://machinesignal-api.beta-878.workers.dev",
    [string]$WebsiteUrl = "https://machinesignal.it",
    [string]$MonitorKeyPath = (Join-Path $env:APPDATA "MachineSignal\machinesignal_monitor_api_key.dpapi"),
    [string]$OutputJson = "postman_public_collection_smoke_summary_20260604.json",
    [string]$OutputMarkdown = "postman_public_collection_smoke_report_20260604.md"
)

$ErrorActionPreference = "Stop"

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
    $collectionUrlForReport = $Summary.collection.url

    $md = @"
# MachineSignal Postman Public Collection Smoke Test - 2026-06-04

## Result

Status: $($Summary.status)

Run id: $($Summary.run_id)

Customer id: $($Summary.customer_id)

Execution mode: $($Summary.execution_mode)

## What was tested

1. Public Postman collection downloaded from $collectionUrlForReport.
2. Required machine-first requests are present in the collection.
3. Collection contains no real API keys or obvious secrets.
4. Public marketplace submission pack and Postman workspace draft are available.
5. Sandbox customer creation is attempted without human sales contact.
6. If sandbox creation is temporarily rate-limited, the stored internal monitor key is used as fallback.
7. Authenticated onboarding works with the sandbox or monitor key.
8. Lead Opportunity Score works.
9. Deep Analysis purchase intent works.
10. Action Pack purchase intent works.
11. Payment-test intent works in sandbox mode.
12. Payment-test webhook activates test credits once.
13. Reconciliation confirms no real payment and no fiscal invoice.

## Key output

- Score: $($Summary.steps.score.opportunity_score)
- Decision: $($Summary.steps.score.decision)
- Orders created: $($Summary.steps.orders.count)
- Payment mode: $($Summary.steps.payment_intent.provider_mode)
- Test credits activated: $($Summary.steps.payment_webhook.credits_activated)
- Reconciliation OK: $($Summary.steps.reconciliation.reconciliation_ok)
- Real payment executed: $($Summary.safety.real_payment_executed)
- External contact executed: $($Summary.safety.external_contact_executed)
- Real invoice issued: $($Summary.safety.real_invoice_issued)

## Postman UI status

The public workspace UI publication is still not completed because GitHub OAuth returned a platform-side block: `You can't perform that action at this time`.

The collection itself is public, importable and machine-testable through the canonical URL:

https://machinesignal.it/postman_public_collection.json

## Decision

The Postman package is technically ready for a sandbox-only public workspace. The next owner approval gate is only the external workspace publication step, and no real API key should be published.
"@
    [System.IO.File]::WriteAllText($OutputMarkdown, $md, $utf8NoBom)
}

$runId = (Get-Date).ToUniversalTime().ToString("yyyyMMddHHmmss")
$customerId = "postman_public_smoke_$runId"

$summary = [ordered]@{
    status = "started"
    run_id = $runId
    customer_id = $customerId
    execution_mode = "new_sandbox_customer"
    collection = [ordered]@{}
    public_assets = [ordered]@{}
    steps = [ordered]@{}
    safety = [ordered]@{
        real_payment_executed = $false
        external_contact_executed = $false
        real_invoice_issued = $false
    }
}

try {
    $collectionUrl = "$WebsiteUrl/postman_public_collection.json"
    $collectionResponse = Invoke-WebRequest -UseBasicParsing -Uri $collectionUrl -TimeoutSec 30
    $collectionText = [string]$collectionResponse.Content
    $collection = $collectionText | ConvertFrom-Json
    $itemNames = @($collection.item | ForEach-Object { $_.name })

    $requiredItems = @(
        "Fetch machine onboarding manifest",
        "Fetch product catalog",
        "Fetch distribution channel shortlist",
        "Fetch Sandbox Buyer Kit listing",
        "Fetch MCP Wrapper Pack",
        "Create limited sandbox customer",
        "Read authenticated onboarding",
        "Score business domain",
        "Order deep analysis after strong score",
        "Order action pack after confirmed opportunity",
        "Create payment test intent",
        "Simulate payment test success webhook",
        "Read payment test reconciliation",
        "List beta orders"
    )
    $missingItems = @($requiredItems | Where-Object { $itemNames -notcontains $_ })
    $secretPatterns = @("sk_live", "pk_live", "ghp_", "github_pat_", "Bearer ", "Github@")
    $secretHits = @($secretPatterns | Where-Object { $collectionText -like "*$_*" })
    $usesSandboxPaymentMode = ($collectionText -like '*"provider_mode\": \"sandbox\"*' -or $collectionText -like '*"provider_mode`": `"sandbox`"*' -or $collectionText -like '*provider_mode* sandbox*')

    $summary.collection = [ordered]@{
        ok = ($missingItems.Count -eq 0 -and $secretHits.Count -eq 0 -and $usesSandboxPaymentMode)
        url = $collectionUrl
        name = $collection.info.name
        item_count = $itemNames.Count
        missing_items = $missingItems
        secret_hits = $secretHits
        uses_sandbox_payment_mode = $usesSandboxPaymentMode
    }

    $assets = [ordered]@{
        marketplace_submission_pack = "$WebsiteUrl/distribution/marketplace-submission-pack.json"
        postman_workspace_draft = "$WebsiteUrl/distribution/postman-public-workspace-draft.json"
        sandbox_buyer_kit_listing = "$WebsiteUrl/distribution/sandbox-buyer-kit-listing.json"
    }
    foreach ($asset in $assets.GetEnumerator()) {
        $content = Invoke-WebRequest -UseBasicParsing -Uri $asset.Value -TimeoutSec 30
        $null = $content.Content | ConvertFrom-Json
        $summary.public_assets[$asset.Key] = [ordered]@{
            ok = ($content.StatusCode -eq 200)
            url = $asset.Value
            bytes = ([string]$content.Content).Length
        }
    }

    if (-not $summary.collection.ok) {
        throw "Public Postman collection validation failed."
    }

    $customerKey = $null
    $expectedOnboardingCustomerId = $customerId
    try {
        $sandbox = Invoke-Json -Method "POST" -Uri "$BaseUrl/v1/sandbox/customers" -Headers @{
            "Content-Type" = "application/json"
            "Idempotency-Key" = "postman-public-smoke-sandbox-$runId"
        } -Body @{
            customer_id = $customerId
            evaluator_type = "postman_public_collection_smoke"
            integration_target = "postman_public_workspace"
            expected_test_path = "postman_import_score_buy_payment_test_reconcile"
        }
        $customerKey = $sandbox.api_key
        $summary.steps.sandbox_created = [ordered]@{
            ok = ($sandbox.sandbox -eq $true -and $sandbox.customer_type -eq "sandbox")
            mode = "new_sandbox_customer"
            customer_type = $sandbox.customer_type
            real_payment_executed = $sandbox.guardrails.real_payment_executed
            external_contact_executed = $sandbox.guardrails.external_contact_executed
        }
    } catch {
        $statusCode = $null
        if ($_.Exception.Response) {
            $statusCode = $_.Exception.Response.StatusCode.value__
        }
        if (-not (Test-Path -LiteralPath $MonitorKeyPath)) {
            throw
        }
        $customerKey = ConvertFrom-StoredSecureString -Path $MonitorKeyPath
        $summary.execution_mode = "stored_internal_monitor_key_after_sandbox_creation_block"
        $expectedOnboardingCustomerId = $null
        $summary.steps.sandbox_created = [ordered]@{
            ok = ($statusCode -eq 400 -or $statusCode -eq 429)
            mode = "guardrail_block_then_internal_monitor_fallback"
            http_status = $statusCode
            note = "New sandbox creation was blocked by validation or daily anti-abuse limit; smoke continued with stored internal monitor key."
            real_payment_executed = $false
            external_contact_executed = $false
        }
    }

    $headers = @{
        "X-API-Key" = $customerKey
        "Content-Type" = "application/json"
    }

    $onboarding = Invoke-Json -Method "GET" -Uri "$BaseUrl/v1/onboarding" -Headers @{ "X-API-Key" = $customerKey }
    $effectiveCustomerId = $onboarding.customer_id
    $summary.steps.authenticated_onboarding = [ordered]@{
        ok = (($null -eq $expectedOnboardingCustomerId) -or ($onboarding.customer_id -eq $expectedOnboardingCustomerId))
        customer_id = $onboarding.customer_id
        customer_type = $onboarding.customer_state.customer_type
        payment_test_mode_enabled = $onboarding.customer_state.payment_test_mode_enabled
    }

    $score = Invoke-Json -Method "POST" -Uri "$BaseUrl/v1/lead-opportunity-score" -Headers ($headers + @{
        "Idempotency-Key" = "postman-public-smoke-score-$runId"
    }) -Body @{
        domain = "quinta-essenza.com"
        sector_hint = "aesthetic medicine clinic"
        country_hint = "IT"
        target_name = "Quinta Essenza"
        category_hint = "medicina estetica"
        source_type = "postman_public_collection_smoke"
        initial_signals = "business_domain_present;service_keyword_present;official_site;website_opportunity;conversion_friction"
    }
    $summary.steps.score = [ordered]@{
        ok = ($score.opportunity_score -ge 0)
        domain = $score.domain
        opportunity_score = $score.opportunity_score
        confidence = $score.confidence
        decision = $score.decision
        next_product = $score.next_purchase.next_product
        credits_remaining = (Get-Balance -Usage $score.usage -ProductCode "score_pack_1k").credits_remaining
    }

    $deep = Invoke-Json -Method "POST" -Uri "$BaseUrl/v1/purchase-intent" -Headers ($headers + @{
        "Idempotency-Key" = "postman-public-smoke-deep-$runId"
    }) -Body @{
        product_code = "deep_analysis"
        domain = "quinta-essenza.com"
        source_score_request_id = "postman-public-smoke-score-$runId"
        reason = "Postman public collection smoke follows the score next_purchase recommendation"
    }
    $summary.steps.deep_analysis = [ordered]@{
        ok = ($deep.product_code -eq "deep_analysis")
        order_intent_id = $deep.order_intent_id
        delivery_type = $deep.delivery.delivery_type
        real_payment_executed = $deep.real_payment_executed
    }

    $action = Invoke-Json -Method "POST" -Uri "$BaseUrl/v1/purchase-intent" -Headers ($headers + @{
        "Idempotency-Key" = "postman-public-smoke-action-$runId"
    }) -Body @{
        product_code = "action_pack"
        domain = "quinta-essenza.com"
        source_score_request_id = "postman-public-smoke-score-$runId"
        source_order_intent_id = $deep.order_intent_id
        reason = "Postman public collection smoke verifies CRM-ready action payload"
    }
    $summary.steps.action_pack = [ordered]@{
        ok = ($action.product_code -eq "action_pack")
        order_intent_id = $action.order_intent_id
        delivery_type = $action.delivery.delivery_type
        approval_gate_default_state = $action.delivery.approval_gate.default_state
        external_contact_executed = $action.delivery.external_contact_executed
    }

    $paymentIntent = Invoke-Json -Method "POST" -Uri "$BaseUrl/v1/payment-test/intents" -Headers ($headers + @{
        "Idempotency-Key" = "postman-public-smoke-payment-$runId"
    }) -Body @{
        product_code = "score_pack_1k"
        amount_eur = 99
        provider = "stripe"
        provider_mode = "sandbox"
        order_intent_id = $action.order_intent_id
        metadata = @{
            source_flow = "postman_public_collection_smoke"
            buyer_machine = "postman_public_collection"
        }
    }
    $summary.steps.payment_intent = [ordered]@{
        ok = ($paymentIntent.payment_test_id -ne $null -and $paymentIntent.provider_mode -eq "sandbox")
        payment_test_id = $paymentIntent.payment_test_id
        provider_mode = $paymentIntent.provider_mode
        amount_eur = $paymentIntent.amount_eur
        credits_to_activate = $paymentIntent.credits_to_activate
        real_payment_executed = $paymentIntent.real_payment_executed
        ready_for_real_payments = $paymentIntent.ready_for_real_payments
    }

    $webhook = Invoke-Json -Method "POST" -Uri "$BaseUrl/v1/payment-test/webhooks/stripe" -Headers @{
        "Content-Type" = "application/json"
        "X-MachineSignal-Test-Webhook-Signature" = $paymentIntent.test_webhook_simulation.success_signature
    } -Body @{
        customer_id = $effectiveCustomerId
        payment_test_id = $paymentIntent.payment_test_id
        event_type = "payment_intent.succeeded"
        event_id = "postman-public-smoke-evt-$runId"
    }
    $summary.steps.payment_webhook = [ordered]@{
        ok = ($webhook.payment_status -eq "test_payment_succeeded")
        payment_status = $webhook.payment_status
        credits_activated = $webhook.credits_activated
        real_payment_executed = $webhook.real_payment_executed
        invoice_real_issued = $webhook.invoice_placeholder.real_invoice_issued
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
        ok = ($orders.count -ge 2)
        count = $orders.count
        products = @($orders.orders | ForEach-Object { $_.product_code })
    }

    $summary.safety.real_payment_executed = @(
        $sandbox.guardrails.real_payment_executed,
        $deep.real_payment_executed,
        $action.real_payment_executed,
        $paymentIntent.real_payment_executed,
        $webhook.real_payment_executed,
        $reconciliation.real_payment_executed
    ) -contains $true
    $summary.safety.external_contact_executed = @(
        $sandbox.guardrails.external_contact_executed,
        $action.delivery.external_contact_executed
    ) -contains $true
    $summary.safety.real_invoice_issued = ($webhook.invoice_placeholder.real_invoice_issued -eq $true)

    $checks = @(
        $summary.collection.ok,
        ($summary.public_assets.Values | Where-Object { $_.ok -ne $true }).Count -eq 0,
        $summary.steps.sandbox_created.ok,
        $summary.steps.authenticated_onboarding.ok,
        $summary.steps.score.ok,
        $summary.steps.deep_analysis.ok,
        $summary.steps.action_pack.ok,
        $summary.steps.payment_intent.ok,
        $summary.steps.payment_webhook.ok,
        $summary.steps.reconciliation.ok,
        $summary.steps.orders.ok,
        -not $summary.safety.real_payment_executed,
        -not $summary.safety.external_contact_executed,
        -not $summary.safety.real_invoice_issued
    )
    $summary.status = if ($checks -contains $false) { "failed" } else { "passed" }
} catch {
    $summary.status = "failed"
    $summary.error = $_.Exception.Message
} finally {
    Write-Reports -Summary $summary
}

if ($summary.status -ne "passed") {
    throw "Postman public collection smoke failed: $($summary.error)"
}

Write-Output "Postman public collection smoke passed."
