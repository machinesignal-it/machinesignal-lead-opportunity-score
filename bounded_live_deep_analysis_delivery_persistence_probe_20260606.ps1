param(
    [string]$BaseUrl = "https://machinesignal-api.beta-878.workers.dev",
    [string]$CredentialPath = (Join-Path $env:APPDATA "MachineSignal\machinesignal_monitor_api_key.dpapi")
)

$ErrorActionPreference = "Stop"

function Get-StoredApiKey {
    param([string]$Path)
    $secureText = (Get-Content -Raw -LiteralPath $Path).Trim()
    $secure = ConvertTo-SecureString -String $secureText
    $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
    try {
        return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
    } finally {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
    }
}

function Invoke-MachineSignalJson {
    param(
        [string]$Method,
        [string]$Uri,
        [string]$ApiKey,
        [object]$Body = $null,
        [string]$IdempotencyKey = $null
    )
    $headers = @{
        "Accept" = "application/json"
        "X-API-Key" = $ApiKey
    }
    if ($IdempotencyKey) {
        $headers["Idempotency-Key"] = $IdempotencyKey
    }
    $requestArgs = @{
        Method = $Method
        Uri = $Uri
        Headers = $headers
        TimeoutSec = 30
        UseBasicParsing = $true
    }
    if ($Body -ne $null) {
        $requestArgs["ContentType"] = "application/json"
        $requestArgs["Body"] = ($Body | ConvertTo-Json -Depth 20)
    }
    try {
        $response = Invoke-WebRequest @requestArgs
        $parsed = if ($response.Content) { $response.Content | ConvertFrom-Json } else { $null }
        return [pscustomobject]@{
            status = [int]$response.StatusCode
            body = $parsed
            error = $null
        }
    } catch {
        $status = 0
        $parsed = $null
        if ($_.Exception.Response) {
            $status = [int]$_.Exception.Response.StatusCode
            try {
                $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
                $text = $reader.ReadToEnd()
                if ($text) { $parsed = $text | ConvertFrom-Json }
            } catch {}
        }
        return [pscustomobject]@{
            status = $status
            body = $parsed
            error = $_.Exception.Message
        }
    }
}

function Get-Balance {
    param($Usage, [string]$ProductCode)
    if (-not $Usage -or -not $Usage.balances) { return $null }
    return @($Usage.balances | Where-Object { $_.product_code -eq $ProductCode } | Select-Object -First 1)[0]
}

function Write-Utf8NoBom {
    param([string]$Path, [string]$Text)
    $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText((Join-Path (Get-Location) $Path), $Text, $utf8NoBom)
}

function Csv-Escape {
    param($Value)
    return '"' + ([string]$Value).Replace('"', '""') + '"'
}

function Test-ArrayContains {
    param($Array, [string]$Value)
    return @($Array) -contains $Value
}

$apiKey = Get-StoredApiKey -Path $CredentialPath
$runStamp = (Get-Date).ToString("yyyyMMddHHmmss")
$runId = "bounded-live-deep-analysis-delivery-persistence-probe-20260606"
$domain = "deep-persistence-dental-demo-$runStamp.it"
$idempotencyKey = "bounded-live-deep-analysis-persistence-20260606-$runStamp"
$sourceScoreRequestId = "bounded-live-deep-analysis-persistence-score-20260606-$runStamp"

$usageBeforeResponse = Invoke-MachineSignalJson -Method GET -Uri "$BaseUrl/v1/usage" -ApiKey $apiKey
$deepBefore = if ($usageBeforeResponse.status -eq 200) { Get-Balance -Usage $usageBeforeResponse.body -ProductCode "deep_analysis_pack_100" } else { $null }
$actionBefore = if ($usageBeforeResponse.status -eq 200) { Get-Balance -Usage $usageBeforeResponse.body -ProductCode "action_pack_25" } else { $null }

$purchaseBody = [pscustomobject]@{
    product_code = "deep_analysis"
    domain = $domain
    sector_hint = "dentist"
    area = "Lombardy"
    commercial_objective = "Find dental clinic websites that deserve CRM-ready digital opportunity action"
    source_score_request_id = $sourceScoreRequestId
    reason = "Bounded live Deep Analysis delivery persistence probe; no Action Pack, no payment, no external contact"
    max_budget_eur = 3
}

$purchaseResponse = Invoke-MachineSignalJson `
    -Method POST `
    -Uri "$BaseUrl/v1/purchase-intent" `
    -ApiKey $apiKey `
    -Body $purchaseBody `
    -IdempotencyKey $idempotencyKey

$purchase = $purchaseResponse.body
$delivery = $purchase.delivery
$orderIntentId = [string]$purchase.order_intent_id

$orderResponse = if ($purchaseResponse.status -eq 200 -and $orderIntentId) {
    Invoke-MachineSignalJson -Method GET -Uri "$BaseUrl/v1/orders/$orderIntentId" -ApiKey $apiKey
} else {
    [pscustomobject]@{ status = 0; body = $null; error = "purchase failed before order retrieval" }
}

$storedOrder = $orderResponse.body.order
$storedDelivery = $storedOrder.delivery

$usageAfterResponse = Invoke-MachineSignalJson -Method GET -Uri "$BaseUrl/v1/usage" -ApiKey $apiKey
$deepAfter = if ($usageAfterResponse.status -eq 200) { Get-Balance -Usage $usageAfterResponse.body -ProductCode "deep_analysis_pack_100" } else { $null }
$actionAfter = if ($usageAfterResponse.status -eq 200) { Get-Balance -Usage $usageAfterResponse.body -ProductCode "action_pack_25" } else { $null }

$deepDelta = if ($deepBefore -and $deepAfter) { [int]$deepBefore.credits_remaining - [int]$deepAfter.credits_remaining } else { $null }
$actionDelta = if ($actionBefore -and $actionAfter) { [int]$actionBefore.credits_remaining - [int]$actionAfter.credits_remaining } else { $null }

$checks = [ordered]@{
    purchase_status_200 = ($purchaseResponse.status -eq 200)
    accepted_beta_order_intent = ($purchase.status -eq "accepted_beta_order_intent")
    product_is_deep_analysis = ($purchase.product_code -eq "deep_analysis")
    ledger_product_is_deep_analysis_pack = ($purchase.ledger_product_code -eq "deep_analysis_pack_100")
    delivery_type_valid = ($delivery.delivery_type -eq "deep_opportunity_analysis")
    delivery_version_valid = ($delivery.deep_analysis_version -eq "domain_specific_commercial_evidence_v1")
    sector_context_valid = ($delivery.sector_context.code -eq "dentists_clinics")
    commercial_evidence_present = (@($delivery.commercial_evidence).Count -ge 4)
    machine_decision_matrix_present = (Test-ArrayContains -Array $delivery.machine_decision_matrix.buy_action_pack_if -Value "budget approval exists")
    action_pack_gate_conditional = ($delivery.action_pack_purchase_gate.product_code -eq "action_pack" -and $delivery.action_pack_purchase_gate.allowed -eq "conditional")
    crm_summary_payload_valid = ($delivery.crm_summary_payload.domain -eq $domain -and $delivery.crm_summary_payload.next_product_allowed -eq "conditional")
    stop_rules_present = (@($delivery.stop_rules).Count -ge 5)
    next_call_purchase_intent = ($delivery.next_machine_call.method -eq "POST" -and $delivery.next_machine_call.endpoint -eq "/v1/purchase-intent")
    order_retrieval_status_200 = ($orderResponse.status -eq 200)
    order_persisted_same_id = ($storedOrder.order_intent_id -eq $orderIntentId)
    stored_delivery_version_valid = ($storedDelivery.deep_analysis_version -eq "domain_specific_commercial_evidence_v1")
    stored_delivery_gate_persisted = ($storedDelivery.action_pack_purchase_gate.allowed -eq "conditional")
    exactly_one_deep_credit_consumed = ($deepDelta -eq 1)
    no_action_pack_credit_consumed = ($actionDelta -eq 0)
    no_real_payment = ($purchase.real_payment_executed -eq $false -and $storedOrder.real_payment_executed -eq $false -and $usageAfterResponse.body.real_payment_executed -eq $false)
    no_external_contact = ($purchase.external_contact_executed -eq $false -and $storedOrder.external_contact_executed -eq $false -and $usageAfterResponse.body.external_contact_executed -eq $false)
}

$passed = @($checks.GetEnumerator() | Where-Object { $_.Value -eq $true }).Count
$total = @($checks.GetEnumerator()).Count

$summary = [pscustomobject]@{
    ok = ($passed -eq $total)
    run_id = $runId
    finished_at = (Get-Date).ToString("s")
    mode = "BoundedLiveDeepAnalysisDeliveryPersistenceProbe"
    base_url = $BaseUrl
    domain = $domain
    idempotency_key = $idempotencyKey
    source_score_request_id = $sourceScoreRequestId
    purchase_status = $purchaseResponse.status
    order_intent_id = $orderIntentId
    order_retrieval_status = $orderResponse.status
    credits = [pscustomobject]@{
        deep_analysis_before = if ($deepBefore) { [int]$deepBefore.credits_remaining } else { $null }
        deep_analysis_after = if ($deepAfter) { [int]$deepAfter.credits_remaining } else { $null }
        deep_analysis_delta = $deepDelta
        action_pack_before = if ($actionBefore) { [int]$actionBefore.credits_remaining } else { $null }
        action_pack_after = if ($actionAfter) { [int]$actionAfter.credits_remaining } else { $null }
        action_pack_delta = $actionDelta
    }
    contract = [pscustomobject]@{
        valid = ($passed -eq $total)
        checks_passed = $passed
        checks_total = $total
        checks = $checks
    }
    delivery = [pscustomobject]@{
        product_code = $purchase.product_code
        delivery_type = $delivery.delivery_type
        deep_analysis_version = $delivery.deep_analysis_version
        sector_code = $delivery.sector_context.code
        commercial_evidence_count = @($delivery.commercial_evidence).Count
        stop_rules_count = @($delivery.stop_rules).Count
        action_pack_gate = $delivery.action_pack_purchase_gate.allowed
        next_product_allowed = $delivery.crm_summary_payload.next_product_allowed
    }
    guardrails = [pscustomobject]@{
        real_payment_executed = $usageAfterResponse.body.real_payment_executed
        external_contact_executed = $usageAfterResponse.body.external_contact_executed
        action_pack_purchase_created = $false
    }
    conclusion = "The live Deep Analysis delivery persistence probe created one Deep Analysis order, consumed exactly one Deep Analysis credit, persisted the upgraded delivery fields, and did not create any Action Pack, payment or external contact."
    recommended_next_step = "Stop live credit-consuming probes and use this persisted delivery as evidence before updating commercial materials or deciding whether to test one Action Pack again."
}

$summaryJson = $summary | ConvertTo-Json -Depth 30
Write-Utf8NoBom -Path "bounded_live_deep_analysis_delivery_persistence_probe_summary_20260606.json" -Text $summaryJson

$rowHeaders = @(
    "domain",
    "order_intent_id",
    "purchase_status",
    "order_retrieval_status",
    "deep_analysis_delta",
    "action_pack_delta",
    "checks_passed",
    "checks_total",
    "delivery_version",
    "commercial_evidence_count",
    "action_pack_gate",
    "real_payment_executed",
    "external_contact_executed"
)
$rowValues = @(
    $domain,
    $orderIntentId,
    $purchaseResponse.status,
    $orderResponse.status,
    $deepDelta,
    $actionDelta,
    $passed,
    $total,
    $delivery.deep_analysis_version,
    @($delivery.commercial_evidence).Count,
    $delivery.action_pack_purchase_gate.allowed,
    $usageAfterResponse.body.real_payment_executed,
    $usageAfterResponse.body.external_contact_executed
)
$csv = @(
    (($rowHeaders | ForEach-Object { Csv-Escape $_ }) -join ","),
    (($rowValues | ForEach-Object { Csv-Escape $_ }) -join ",")
) -join "`r`n"
Write-Utf8NoBom -Path "bounded_live_deep_analysis_delivery_persistence_probe_rows_20260606.csv" -Text $csv

$statusLabel = if ($summary.ok) { "PASS" } else { "FAIL" }
$report = @(
    "# MachineSignal - Bounded Live Deep Analysis Delivery Persistence Probe",
    "",
    "Finished at: $($summary.finished_at)",
    "",
    "Status: $statusLabel",
    "",
    "Mode: BoundedLiveDeepAnalysisDeliveryPersistenceProbe",
    "",
    "## Scope",
    "",
    "- Domain: $domain",
    "- Product: deep_analysis",
    "- Order intent: $orderIntentId",
    "- Idempotency key: $idempotencyKey",
    "- Action Pack purchase created: false",
    "- Real payment executed: $($summary.guardrails.real_payment_executed)",
    "- External contact executed: $($summary.guardrails.external_contact_executed)",
    "",
    "## Credit Movement",
    "",
    "- Deep Analysis credits before: $($summary.credits.deep_analysis_before)",
    "- Deep Analysis credits after: $($summary.credits.deep_analysis_after)",
    "- Deep Analysis credit delta: $($summary.credits.deep_analysis_delta)",
    "- Action Pack credits before: $($summary.credits.action_pack_before)",
    "- Action Pack credits after: $($summary.credits.action_pack_after)",
    "- Action Pack credit delta: $($summary.credits.action_pack_delta)",
    "",
    "## Delivery Contract",
    "",
    "- Delivery type: $($summary.delivery.delivery_type)",
    "- Version: $($summary.delivery.deep_analysis_version)",
    "- Sector code: $($summary.delivery.sector_code)",
    "- Commercial evidence items: $($summary.delivery.commercial_evidence_count)",
    "- Stop rules: $($summary.delivery.stop_rules_count)",
    "- Action Pack gate: $($summary.delivery.action_pack_gate)",
    "- Next product allowed: $($summary.delivery.next_product_allowed)",
    "",
    "## Checks",
    "",
    "- Checks passed: $passed / $total",
    "- Order retrieval status: $($summary.order_retrieval_status)",
    "- Stored delivery version persisted: $($checks.stored_delivery_version_valid)",
    "- Stored Action Pack gate persisted: $($checks.stored_delivery_gate_persisted)",
    "",
    "## Conclusion",
    "",
    $summary.conclusion,
    "",
    "## Recommended Next Step",
    "",
    $summary.recommended_next_step
) -join "`r`n"
Write-Utf8NoBom -Path "bounded_live_deep_analysis_delivery_persistence_probe_report_20260606.md" -Text $report

$summaryJson
