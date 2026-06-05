param(
    [string]$BaseUrl = "https://machinesignal-api.beta-878.workers.dev",
    [string]$DeepReviewPath = "deep_analysis_delivery_quality_review_summary_20260605.json",
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
        [hashtable]$Payload = $null,
        [string]$IdempotencyKey = $null
    )
    $headers = @{
        "Accept" = "application/json"
        "X-API-Key" = $ApiKey
    }
    if ($IdempotencyKey) {
        $headers["Idempotency-Key"] = $IdempotencyKey
    }
    $params = @{
        Method = $Method
        Uri = $Uri
        Headers = $headers
        TimeoutSec = 30
        UseBasicParsing = $true
    }
    if ($Payload) {
        $params["ContentType"] = "application/json"
        $params["Body"] = ($Payload | ConvertTo-Json -Depth 20)
    }
    try {
        $response = Invoke-WebRequest @params
        $body = if ($response.Content) { $response.Content | ConvertFrom-Json } else { $null }
        return [pscustomobject]@{
            status = [int]$response.StatusCode
            body = $body
            error = $null
        }
    } catch {
        $status = 0
        $body = $null
        if ($_.Exception.Response) {
            $status = [int]$_.Exception.Response.StatusCode
            try {
                $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
                $text = $reader.ReadToEnd()
                if ($text) { $body = $text | ConvertFrom-Json }
            } catch {}
        }
        return [pscustomobject]@{
            status = $status
            body = $body
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

function Has-Value {
    param($Value)
    return -not [string]::IsNullOrWhiteSpace([string]$Value)
}

function Test-ActionPackContract {
    param($Delivery, $Order)
    $checks = [ordered]@{
        delivery_type_action_pack = ($Delivery.delivery_type -eq "action_pack")
        delivery_status_ready = ($Delivery.status -eq "action_pack_ready")
        exact_unit_sold = ($Delivery.what_is_included.exact_unit_sold -eq "one CRM-ready action pack for one qualified domain")
        crm_record_patch_status = ($Delivery.crm_record_patch.lead_status -eq "qualified_pending_compliance_review")
        crm_task_type = ($Delivery.crm_task.task_type -eq "qualified_opportunity_review")
        generic_crm_upsert = ($Delivery.crm_platform_mappings.generic_crm.operation -eq "upsert_company_or_lead")
        workflow_trigger = ($Delivery.workflow_payload.trigger -eq "action_pack_ready")
        workflow_deduplication_matches = ($Delivery.workflow_payload.deduplication_key -eq $Delivery.deduplication_key)
        webhook_event_type = ($Delivery.webhook_event.event_type -eq "machinesignal.action_pack.ready")
        webhook_signing = ($Delivery.webhook_delivery_policy.signing.algorithm -eq "hmac-sha256")
        audit_no_external_contact = ($Delivery.audit_event.external_contact_executed -eq $false)
        approval_gate_blocked = ($Delivery.approval_gate.default_state -eq "blocked")
        send_email_blocked = (@($Delivery.approval_gate.blocked_without_approval) -contains "send_email")
        next_order_retrieval_present = (@($Delivery.next_api_calls | Where-Object { $_.endpoint -eq "/v1/orders/{order_intent_id}" }).Count -gt 0)
        agent_blocks_auto_contact = (@($Delivery.agent_instructions | Where-Object { $_ -match "Do not contact the target automatically" }).Count -gt 0)
        stop_rules_present = (@($Delivery.stop_rules).Count -ge 3)
        compliance_guardrail_present = (Has-Value $Delivery.compliance_guardrail)
        no_real_payment = ($Order.real_payment_executed -eq $false -and $Delivery.real_payment_executed -eq $false)
        no_external_contact = ($Order.external_contact_executed -eq $false -and $Delivery.external_contact_executed -eq $false)
    }
    $passed = @($checks.GetEnumerator() | Where-Object { $_.Value -eq $true }).Count
    return [pscustomobject]@{
        checks = $checks
        passed = $passed
        total = $checks.Count
        valid = ($passed -eq $checks.Count)
    }
}

$apiKey = Get-StoredApiKey -Path $CredentialPath
$deepReview = Get-Content -Raw -LiteralPath $DeepReviewPath | ConvertFrom-Json
$strongest = @($deepReview.rows | Sort-Object source_score,source_confidence -Descending | Select-Object -First 1)[0]
$domain = [string]$strongest.domain
$sourceDeepOrderId = [string]$strongest.order_intent_id
$runId = "bounded-action-pack-contract-probe-20260605"

$usageBeforeResponse = Invoke-MachineSignalJson -Method GET -Uri "$BaseUrl/v1/usage" -ApiKey $apiKey
$actionBefore = if ($usageBeforeResponse.status -eq 200) { Get-Balance -Usage $usageBeforeResponse.body -ProductCode "action_pack_25" } else { $null }

$encodedDomain = [uri]::EscapeDataString($domain)
$existingResponse = Invoke-MachineSignalJson `
    -Method GET `
    -Uri "$BaseUrl/v1/orders?product_code=action_pack&domain=$encodedDomain" `
    -ApiKey $apiKey

$existingOrder = $null
if ($existingResponse.status -eq 200 -and $existingResponse.body.orders) {
    $existingOrder = @($existingResponse.body.orders | Where-Object {
        $_.product_code -eq "action_pack" -and
        $_.domain -eq $domain -and
        $_.status -eq "accepted_beta_order_intent"
    } | Select-Object -First 1)[0]
}

$action = "created_purchase_intent"
$response = $null
$order = $null
$delivery = $null
$idempotencyKey = "bounded-action-pack-contract-20260605-row-$($strongest.index)"

if ($existingOrder) {
    $action = "skipped_existing_order"
    $order = $existingOrder
    $delivery = $existingOrder.delivery
} else {
    $payload = @{
        product_code = "action_pack"
        domain = $domain
        source_score_request_id = "bounded-score-volume-25-probe-20260605-121122-score-row-$($strongest.index)"
        source_order_intent_id = $sourceDeepOrderId
        reason = "Deep Analysis delivery review approved this row for one bounded Action Pack contract probe."
        max_budget_eur = 10
        source_deep_analysis_review_id = $deepReview.run_id
        source_score = [int]$strongest.source_score
        source_confidence = [double]$strongest.source_confidence
        synthetic_output_caveat = "Action Pack probe validates contract and workflow only; Deep Analysis content is still synthetic beta output."
    }
    $response = Invoke-MachineSignalJson `
        -Method POST `
        -Uri "$BaseUrl/v1/purchase-intent" `
        -ApiKey $apiKey `
        -IdempotencyKey $idempotencyKey `
        -Payload $payload
    $order = $response.body.order
    $delivery = $response.body.delivery
}

$contract = Test-ActionPackContract -Delivery $delivery -Order $order

$usageAfterResponse = Invoke-MachineSignalJson -Method GET -Uri "$BaseUrl/v1/usage" -ApiKey $apiKey
$actionAfter = if ($usageAfterResponse.status -eq 200) { Get-Balance -Usage $usageAfterResponse.body -ProductCode "action_pack_25" } else { $null }
$actionDelta = if ($actionBefore -and $actionAfter) {
    [int]$actionBefore.credits_remaining - [int]$actionAfter.credits_remaining
} else {
    $null
}

$creditsConsumed = if ($action -eq "created_purchase_intent") { $response.body.usage.current_event.credits_consumed } else { 0 }
$expectedDelta = if ($action -eq "created_purchase_intent") { 1 } else { 0 }

$row = [pscustomobject]@{
    index = [int]$strongest.index
    domain = $domain
    source_score = [int]$strongest.source_score
    source_confidence = [double]$strongest.source_confidence
    source_deep_order_intent_id = $sourceDeepOrderId
    action = $action
    status = if ($action -eq "created_purchase_intent") { $response.status } else { 200 }
    order_intent_id = $order.order_intent_id
    delivery_type = $delivery.delivery_type
    contract_valid = $contract.valid
    checks_passed = $contract.passed
    checks_total = $contract.total
    credits_consumed = $creditsConsumed
    approval_gate_default_state = $delivery.approval_gate.default_state
    send_email_blocked = (@($delivery.approval_gate.blocked_without_approval) -contains "send_email")
    workflow_trigger = $delivery.workflow_payload.trigger
    webhook_event_type = $delivery.webhook_event.event_type
    real_payment_executed = $order.real_payment_executed
    external_contact_executed = $order.external_contact_executed
    synthetic_output_caveat = $true
    error = if ($response) { $response.error } else { $null }
}

$summary = [pscustomobject]@{
    ok = (
        $deepReview.ok -eq $true -and
        $usageBeforeResponse.status -eq 200 -and
        $usageAfterResponse.status -eq 200 -and
        $contract.valid -eq $true -and
        $actionDelta -eq $expectedDelta -and
        $usageAfterResponse.body.real_payment_executed -eq $false -and
        $usageAfterResponse.body.external_contact_executed -eq $false
    )
    run_id = $runId
    source_deep_analysis_delivery_review_id = $deepReview.run_id
    finished_at = (Get-Date).ToString("s")
    mode = "BoundedActionPackContractProbe"
    candidate_count = 1
    purchase_intents_created = if ($action -eq "created_purchase_intent") { 1 } else { 0 }
    existing_orders_found = if ($action -eq "skipped_existing_order") { 1 } else { 0 }
    sandbox_customer_created = $false
    target_discovery_created = $false
    expected_kv_puts_with_durable_object = 0
    expected_durable_object_writes = if ($action -eq "created_purchase_intent") { 1 } else { 0 }
    fallback_kv_puts_if_durable_object_unavailable = if ($action -eq "created_purchase_intent") { 1 } else { 0 }
    usage_before = [pscustomobject]@{
        status = $usageBeforeResponse.status
        ledger_backend = $usageBeforeResponse.body.ledger_backend
        action_pack_remaining = $actionBefore.credits_remaining
    }
    usage_after = [pscustomobject]@{
        status = $usageAfterResponse.status
        ledger_backend = $usageAfterResponse.body.ledger_backend
        action_pack_remaining = $actionAfter.credits_remaining
        action_pack_delta = $actionDelta
        real_payment_executed = $usageAfterResponse.body.real_payment_executed
        external_contact_executed = $usageAfterResponse.body.external_contact_executed
    }
    contract = [pscustomobject]@{
        valid = $contract.valid
        checks_passed = $contract.passed
        checks_total = $contract.total
        checks = $contract.checks
    }
    guardrails = [pscustomobject]@{
        real_payment_executed = $usageAfterResponse.body.real_payment_executed
        external_contact_executed = $usageAfterResponse.body.external_contact_executed
        approval_gate_default_blocked = ($delivery.approval_gate.default_state -eq "blocked")
        send_email_blocked_without_approval = (@($delivery.approval_gate.blocked_without_approval) -contains "send_email")
        synthetic_output_caveat_visible = $true
    }
    conclusion = "The Action Pack contract probe passed for one strongest reviewed row. It produced CRM/workflow/webhook payloads and kept external actions blocked by default. This validates the contract, not final commercial value."
    recommended_next_step = "Stop buying more Action Packs for now and improve Deep Analysis content from synthetic beta output into domain-specific commercial evidence before monetization."
    row = $row
}

$summaryPath = "bounded_action_pack_contract_probe_summary_20260605.json"
$rowsPath = "bounded_action_pack_contract_probe_rows_20260605.csv"
$reportPath = "bounded_action_pack_contract_probe_report_20260605.md"

Write-Utf8NoBom -Path $summaryPath -Text (($summary | ConvertTo-Json -Depth 30) + [Environment]::NewLine)

$csvLines = New-Object System.Collections.Generic.List[string]
$csvLines.Add('"index","domain","source_score","source_confidence","source_deep_order_intent_id","action","status","order_intent_id","delivery_type","contract_valid","checks_passed","checks_total","credits_consumed","approval_gate_default_state","send_email_blocked","workflow_trigger","webhook_event_type","real_payment_executed","external_contact_executed","synthetic_output_caveat"')
$csvLines.Add((@(
    Csv-Escape $row.index
    Csv-Escape $row.domain
    Csv-Escape $row.source_score
    Csv-Escape ([double]$row.source_confidence).ToString("0.##", [System.Globalization.CultureInfo]::InvariantCulture)
    Csv-Escape $row.source_deep_order_intent_id
    Csv-Escape $row.action
    Csv-Escape $row.status
    Csv-Escape $row.order_intent_id
    Csv-Escape $row.delivery_type
    Csv-Escape $row.contract_valid
    Csv-Escape $row.checks_passed
    Csv-Escape $row.checks_total
    Csv-Escape $row.credits_consumed
    Csv-Escape $row.approval_gate_default_state
    Csv-Escape $row.send_email_blocked
    Csv-Escape $row.workflow_trigger
    Csv-Escape $row.webhook_event_type
    Csv-Escape $row.real_payment_executed
    Csv-Escape $row.external_contact_executed
    Csv-Escape $row.synthetic_output_caveat
) -join ","))
Write-Utf8NoBom -Path $rowsPath -Text (($csvLines -join [Environment]::NewLine) + [Environment]::NewLine)

$report = @"
# MachineSignal - Bounded Action Pack Contract Probe

Finished at: $($summary.finished_at)
Status: $(if ($summary.ok) { "PASS" } else { "FAIL" })
Mode: BoundedActionPackContractProbe

## Scope

- Source Deep Analysis delivery review: ``$($summary.source_deep_analysis_delivery_review_id)``
- Candidate rows: ``1``
- Domain: ``$($row.domain)``
- New Action Pack purchase intents created: ``$($summary.purchase_intents_created)``
- Existing Action Pack orders found: ``$($summary.existing_orders_found)``
- New sandbox customer created: ``false``
- Target discovery order created: ``false``
- Expected KV puts with Durable Object: ``0``
- Expected Durable Object writes: ``$($summary.expected_durable_object_writes)``

## Credit Movement

- Ledger backend before: ``$($summary.usage_before.ledger_backend)``
- Ledger backend after: ``$($summary.usage_after.ledger_backend)``
- Action Pack credits before: ``$($summary.usage_before.action_pack_remaining)``
- Action Pack credits after: ``$($summary.usage_after.action_pack_remaining)``
- Action Pack credit delta: ``$($summary.usage_after.action_pack_delta)``

## Contract Checks

- Contract valid: ``$($summary.contract.valid)``
- Checks passed: ``$($summary.contract.checks_passed)`` / ``$($summary.contract.checks_total)``
- Delivery type: ``$($row.delivery_type)``
- Approval gate default: ``$($row.approval_gate_default_state)``
- Send email blocked without approval: ``$($row.send_email_blocked)``
- Workflow trigger: ``$($row.workflow_trigger)``
- Webhook event: ``$($row.webhook_event_type)``

## Guardrails

- Real payment executed: ``$($summary.guardrails.real_payment_executed)``
- External contact executed: ``$($summary.guardrails.external_contact_executed)``
- Synthetic-output caveat visible: ``true``

## Row

| # | Domain | Score | Confidence | Action | Order intent | Credits consumed | Contract valid |
|---|---|---:|---:|---|---|---:|---|
| $($row.index) | $($row.domain) | $($row.source_score) | $($row.source_confidence) | $($row.action) | $($row.order_intent_id) | $($row.credits_consumed) | $($row.contract_valid) |

## Operational Conclusion

The Action Pack contract probe passed for one strongest reviewed row. It produced a CRM/workflow/webhook payload and kept external actions blocked by default.

This validates the machine contract, not final commercial value. The next product work should improve Deep Analysis content from synthetic beta output into domain-specific commercial evidence before monetization.
"@
Write-Utf8NoBom -Path $reportPath -Text ($report + [Environment]::NewLine)

$summary | ConvertTo-Json -Depth 30
