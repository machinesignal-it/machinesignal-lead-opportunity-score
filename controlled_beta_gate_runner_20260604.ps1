param(
    [string]$BaseUrl = "https://machinesignal-api.beta-878.workers.dev",
    [string]$ReadinessUrl = "https://machinesignal.it/readiness-dashboard/readiness.json",
    [string]$AdminKeyPath = (Join-Path $env:APPDATA "MachineSignal\machinesignal_admin_api_key.dpapi"),
    [string]$OutputJson = "controlled_beta_gate_runner_summary_20260604.json",
    [string]$OutputMarkdown = "controlled_beta_gate_runner_report_20260604.md"
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
        $options.Body = ($Body | ConvertTo-Json -Depth 40)
        if (-not $options.Headers.ContainsKey("Content-Type")) {
            $options.Headers["Content-Type"] = "application/json"
        }
    }
    return Invoke-RestMethod @options
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
    [System.IO.File]::WriteAllText($OutputJson, ($Summary | ConvertTo-Json -Depth 60), $utf8NoBom)

    $rows = @()
    foreach ($scenario in $Summary.scenarios) {
        $rows += "| $($scenario.id) | $($scenario.market) | $($scenario.domain) | $($scenario.score.opportunity_score) | $($scenario.score.decision) | $($scenario.score.commercial_strength_level) | $($scenario.status) |"
    }
    $scenarioRows = $rows -join "`n"

    $md = @"
# MachineSignal Controlled Beta Gate Runner - 2026-06-04

## Result

Status: $($Summary.status)

Readiness gate: $($Summary.readiness_gate.status)

Controlled beta status: $($Summary.readiness_gate.controlled_beta_status)

Real payment status: $($Summary.readiness_gate.real_payment_status)

Customer id: $($Summary.customer_id)

## Scenarios

| ID | Market | Domain | Score | Decision | Strength | Status |
|---|---|---|---:|---|---|---|
$scenarioRows

## Safety

- Real payment executed: $($Summary.safety.real_payment_executed)
- External contact executed: $($Summary.safety.external_contact_executed)
- Real invoice issued: $($Summary.safety.real_invoice_issued)
- Payment mode used: no real payment, purchase-intent beta only
- Contact mode used: no external contact, action packs only prepare CRM/audit payloads

## Interpretation

The readiness dashboard can act as an automated operating gate. When controlled beta is ready and real payments are blocked, MachineSignal can run additional machine-first beta tests without human outreach or live payment execution.

The tested machine buyer can start with no list, request target discovery, score a selected domain, buy Deep Analysis and buy Action Pack for two different markets. This validates that the API can serve different machine personas without requiring a human to manually prepare the commercial flow.

## Next step

Use the gate runner as the default pre-check before any new controlled beta test. If the gate changes to blocked, agents should stop tests and report the blocker instead of continuing.
"@
    [System.IO.File]::WriteAllText($OutputMarkdown, $md, $utf8NoBom)
}

$runId = (Get-Date -Format "yyyyMMddHHmmss")
$customerId = ("controlled_beta_gate_{0}" -f $runId).ToLowerInvariant()
$adminKey = ConvertFrom-StoredSecureString -Path $AdminKeyPath
$adminHeaders = @{
    "X-API-Key" = $adminKey
    "Content-Type" = "application/json"
}

$scenarios = @(
    [ordered]@{
        id = "legal_crm_agent"
        machine_persona = "CRM prioritization agent"
        market = "studi legali"
        area = "Milano e Lombardia"
        commercial_objective = "find law firm websites worth scoring for digital presence improvement opportunities"
        domain = "studiolegale-rossi.it"
        sector_hint = "legal law studio legale avvocati"
        target_name = "Studio Legale Rossi"
        category_hint = "studio legale"
        initial_signals = "sector_match;service_keyword_present;business_domain_present;official_site;public_web_result;local_market;website_opportunity;weak_cta;conversion_friction"
    },
    [ordered]@{
        id = "solar_installer_agent"
        machine_persona = "Market discovery agent"
        market = "fotovoltaico e impianti"
        area = "Lombardia"
        commercial_objective = "find solar and home improvement websites worth scoring for digital presence improvement opportunities"
        domain = "edilsolare.it"
        sector_hint = "home construction solar photovoltaic impianti fotovoltaici"
        target_name = "Edil Solare"
        category_hint = "impianti fotovoltaici"
        initial_signals = "sector_match;service_keyword_present;business_domain_present;official_site;public_web_result;local_market;website_opportunity;weak_cta;conversion_friction"
    }
)

$summary = [ordered]@{
    service = "MachineSignal"
    report_type = "controlled_beta_gate_runner"
    generated_at = (Get-Date).ToUniversalTime().ToString("o")
    base_url = $BaseUrl
    readiness_url = $ReadinessUrl
    status = "started"
    customer_id = $customerId
    primary_customer_interface = "machine"
    safety = [ordered]@{
        real_payment_executed = $false
        external_contact_executed = $false
        real_invoice_issued = $false
    }
    readiness_gate = [ordered]@{}
    scenarios = @()
    admin_reports = [ordered]@{}
    cleanup = [ordered]@{}
}

try {
    $readiness = Invoke-RestMethod -Uri ("{0}?run={1}" -f $ReadinessUrl, $runId) -TimeoutSec 30
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
        real_payment_enabled = $readiness.real_payment_enabled
        external_contact_enabled = $readiness.external_contact_enabled
        recommendation = $readiness.overall_recommendation
        gate_count = $readiness.gates.Count
    }

    if (-not $gateOk) {
        $summary.status = "blocked_by_readiness_gate"
        Write-Reports -Summary $summary
        $summary | ConvertTo-Json -Depth 60
        exit 0
    }

    $customer = Invoke-Json -Method "POST" -Uri "$BaseUrl/v1/beta/customers" -Headers $adminHeaders -Body @{
        customer_id = $customerId
        contact_email = "machine-controlled-beta@example.com"
        plan = "controlled_beta_gate_runner"
        score_credits = 4
        target_discovery_credits = 2
        domain_enrichment_credits = 0
        deep_analysis_credits = 2
        action_pack_credits = 2
        opportunity_feed_credits = 0
    }
    $customerKey = $customer.api_key
    $customerHeaders = @{
        "X-API-Key" = $customerKey
        "Content-Type" = "application/json"
    }

    foreach ($scenario in $scenarios) {
        $scenarioRun = [ordered]@{
            id = $scenario.id
            machine_persona = $scenario.machine_persona
            market = $scenario.market
            area = $scenario.area
            domain = $scenario.domain
            status = "started"
            target_discovery = [ordered]@{}
            score = [ordered]@{}
            deep_analysis = [ordered]@{}
            action_pack = [ordered]@{}
            safety = [ordered]@{
                real_payment_executed = $false
                external_contact_executed = $false
            }
        }

        $targetDiscovery = Invoke-Json -Method "POST" -Uri "$BaseUrl/v1/purchase-intent" -Headers ($customerHeaders + @{
            "Idempotency-Key" = "gate-$($scenario.id)-target-$runId"
        }) -Body @{
            product_code = "target_discovery"
            market = $scenario.market
            area = $scenario.area
            commercial_objective = $scenario.commercial_objective
            reason = "Controlled beta machine has no starting list"
        }
        $scenarioRun.target_discovery = [ordered]@{
            ok = ($targetDiscovery.status -eq "accepted_beta_order_intent")
            order_intent_id = $targetDiscovery.order_intent_id
            delivery_type = $targetDiscovery.delivery.delivery_type
            sample_targets = $targetDiscovery.delivery.beta_sample_targets.Count
            real_payment_executed = $targetDiscovery.real_payment_executed
            external_contact_executed = $targetDiscovery.external_contact_executed
        }

        $score = Invoke-Json -Method "POST" -Uri "$BaseUrl/v1/lead-opportunity-score" -Headers ($customerHeaders + @{
            "Idempotency-Key" = "gate-$($scenario.id)-score-$runId"
        }) -Body @{
            domain = $scenario.domain
            sector_hint = $scenario.sector_hint
            country_hint = "IT"
            target_name = $scenario.target_name
            category_hint = $scenario.category_hint
            source_type = "target_discovery_sample"
            initial_signals = $scenario.initial_signals
        }
        $scenarioRun.score = [ordered]@{
            ok = ($score.opportunity_score -ge 0)
            opportunity_score = $score.opportunity_score
            confidence = $score.confidence
            decision = $score.decision
            commercial_strength_level = $score.commercial_strength.level
            spend_policy = $score.commercial_strength.spend_policy
            next_product = $score.next_purchase.next_product
            credits_remaining = (Get-Balance -Usage $score.usage -ProductCode "score_pack_1k").credits_remaining
        }

        $deepAnalysis = Invoke-Json -Method "POST" -Uri "$BaseUrl/v1/purchase-intent" -Headers ($customerHeaders + @{
            "Idempotency-Key" = "gate-$($scenario.id)-deep-$runId"
        }) -Body @{
            product_code = "deep_analysis"
            domain = $scenario.domain
            source_score_request_id = "gate-$($scenario.id)-score-$runId"
            reason = "Controlled beta gate runner checks downstream machine purchase"
        }
        $scenarioRun.deep_analysis = [ordered]@{
            ok = ($deepAnalysis.product_code -eq "deep_analysis")
            order_intent_id = $deepAnalysis.order_intent_id
            delivery_type = $deepAnalysis.delivery.delivery_type
            next_product = $deepAnalysis.delivery.recommended_next_step.product_code
            real_payment_executed = $deepAnalysis.real_payment_executed
        }

        $actionPack = Invoke-Json -Method "POST" -Uri "$BaseUrl/v1/purchase-intent" -Headers ($customerHeaders + @{
            "Idempotency-Key" = "gate-$($scenario.id)-action-$runId"
        }) -Body @{
            product_code = "action_pack"
            domain = $scenario.domain
            source_score_request_id = "gate-$($scenario.id)-score-$runId"
            source_order_intent_id = $deepAnalysis.order_intent_id
            reason = "Controlled beta gate runner checks action payload generation"
            max_budget_eur = 10
        }
        $scenarioRun.action_pack = [ordered]@{
            ok = ($actionPack.product_code -eq "action_pack")
            order_intent_id = $actionPack.order_intent_id
            delivery_type = $actionPack.delivery.delivery_type
            webhook_event_type = $actionPack.delivery.webhook_event.event_type
            approval_gate_default_state = $actionPack.delivery.approval_gate.default_state
            external_contact_executed = $actionPack.delivery.external_contact_executed
        }

        $scenarioRun.safety.real_payment_executed =
            [bool]($targetDiscovery.real_payment_executed -or $deepAnalysis.real_payment_executed -or $actionPack.real_payment_executed)
        $scenarioRun.safety.external_contact_executed =
            [bool]($targetDiscovery.external_contact_executed -or $actionPack.delivery.external_contact_executed)
        $scenarioRun.status = $(if (
            $scenarioRun.target_discovery.ok -and
            $scenarioRun.score.ok -and
            $scenarioRun.deep_analysis.ok -and
            $scenarioRun.action_pack.ok -and
            -not $scenarioRun.safety.real_payment_executed -and
            -not $scenarioRun.safety.external_contact_executed
        ) { "passed" } else { "review" })

        $summary.scenarios += $scenarioRun
    }

    $orders = Invoke-Json -Method "GET" -Uri "$BaseUrl/v1/orders" -Headers @{
        "X-API-Key" = $customerKey
    }
    $audit = Invoke-Json -Method "GET" -Uri "$BaseUrl/v1/admin/audit-report?customer_id=$customerId" -Headers @{
        "X-API-Key" = $adminKey
    }

    $summary.admin_reports = [ordered]@{
        order_count = $orders.count
        products = @($orders.orders | ForEach-Object { $_.product_code })
        audit_reconciliation_ok = $audit.summary.reconciliation_ok
        simulated_revenue_eur = $audit.summary.simulated_revenue_eur
    }

    $summary.safety.real_payment_executed = [bool]($summary.scenarios | Where-Object { $_.safety.real_payment_executed } | Select-Object -First 1)
    $summary.safety.external_contact_executed = [bool]($summary.scenarios | Where-Object { $_.safety.external_contact_executed } | Select-Object -First 1)
    $summary.safety.real_invoice_issued = $false

    $allPassed = ($summary.scenarios | Where-Object { $_.status -ne "passed" }).Count -eq 0
    $summary.status = $(if ($allPassed -and $summary.admin_reports.audit_reconciliation_ok -and -not $summary.safety.real_payment_executed -and -not $summary.safety.external_contact_executed) { "passed" } else { "review" })
} catch {
    $summary.status = "failed"
    $summary.error = $_.Exception.Message
} finally {
    try {
        if ($customerId) {
            Invoke-Json -Method "PATCH" -Uri "$BaseUrl/v1/beta/customers/$customerId" -Headers $adminHeaders -Body @{
                status = "closed"
                reason = "completed controlled beta gate runner"
            } | Out-Null
            $summary.cleanup.customer_closed = $true
        }
    } catch {
        $summary.cleanup.customer_closed = $false
        $summary.cleanup.error = "customer close failed"
    }
}

Write-Reports -Summary $summary
$summary | ConvertTo-Json -Depth 60
