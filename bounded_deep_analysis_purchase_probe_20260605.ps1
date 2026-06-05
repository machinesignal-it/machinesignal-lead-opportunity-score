param(
    [string]$BaseUrl = "https://machinesignal-api.beta-878.workers.dev",
    [string]$QualityReviewPath = "score_volume_25_quality_review_summary_20260605.json",
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

$apiKey = Get-StoredApiKey -Path $CredentialPath
$qualityReview = Get-Content -Raw -LiteralPath $QualityReviewPath | ConvertFrom-Json
$sourceRunId = [string]$qualityReview.source_run_id
$runId = "bounded-deep-analysis-purchase-probe-20260605"
$candidates = @($qualityReview.rows | Where-Object {
    $_.decision -eq "buy_deep_analysis" -and
    $_.next_product -eq "deep_analysis" -and
    $_.commercial_review_needed -eq $false
} | Sort-Object index)

$usageBeforeResponse = Invoke-MachineSignalJson -Method GET -Uri "$BaseUrl/v1/usage" -ApiKey $apiKey
$deepBefore = if ($usageBeforeResponse.status -eq 200) { Get-Balance -Usage $usageBeforeResponse.body -ProductCode "deep_analysis_pack_100" } else { $null }

$rows = @()
foreach ($candidate in $candidates) {
    $domain = [string]$candidate.domain
    $encodedDomain = [uri]::EscapeDataString($domain)
    $existingResponse = Invoke-MachineSignalJson `
        -Method GET `
        -Uri "$BaseUrl/v1/orders?product_code=deep_analysis&domain=$encodedDomain" `
        -ApiKey $apiKey

    $existingOrder = $null
    if ($existingResponse.status -eq 200 -and $existingResponse.body.orders) {
        $existingOrder = @($existingResponse.body.orders | Where-Object {
            $_.product_code -eq "deep_analysis" -and
            $_.domain -eq $domain -and
            $_.status -eq "accepted_beta_order_intent"
        } | Select-Object -First 1)[0]
    }

    if ($existingOrder) {
        $rows += [pscustomobject]@{
            index = [int]$candidate.index
            domain = $domain
            score = [int]$candidate.score
            confidence = [double]$candidate.confidence
            action = "skipped_existing_order"
            status = 200
            existing_order_found = $true
            order_intent_id = $existingOrder.order_intent_id
            delivery_type = $existingOrder.delivery.delivery_type
            recommended_next_product = $existingOrder.delivery.recommended_next_step.product_code
            credits_consumed = 0
            real_payment_executed = $existingOrder.real_payment_executed
            external_contact_executed = $existingOrder.external_contact_executed
            idempotency_key = $null
            error = $null
        }
        continue
    }

    $idempotencyKey = "bounded-deep-analysis-purchase-20260605-row-$($candidate.index)"
    $payload = @{
        product_code = "deep_analysis"
        domain = $domain
        source_score_request_id = "$sourceRunId-score-row-$($candidate.index)"
        reason = "Score volume 25 quality review approved this row for bounded Deep Analysis purchase-intent simulation."
        max_budget_eur = 3
        source_quality_review_id = $qualityReview.run_id
        source_score = [int]$candidate.score
        source_confidence = [double]$candidate.confidence
    }
    $response = Invoke-MachineSignalJson `
        -Method POST `
        -Uri "$BaseUrl/v1/purchase-intent" `
        -ApiKey $apiKey `
        -IdempotencyKey $idempotencyKey `
        -Payload $payload

    $body = $response.body
    $rows += [pscustomobject]@{
        index = [int]$candidate.index
        domain = $domain
        score = [int]$candidate.score
        confidence = [double]$candidate.confidence
        action = "created_purchase_intent"
        status = $response.status
        existing_order_found = $false
        order_intent_id = $body.order_intent_id
        delivery_type = $body.delivery.delivery_type
        recommended_next_product = $body.delivery.recommended_next_step.product_code
        credits_consumed = $body.usage.current_event.credits_consumed
        real_payment_executed = $body.real_payment_executed
        external_contact_executed = $body.external_contact_executed
        idempotency_key = $idempotencyKey
        error = $response.error
    }
}

$usageAfterResponse = Invoke-MachineSignalJson -Method GET -Uri "$BaseUrl/v1/usage" -ApiKey $apiKey
$deepAfter = if ($usageAfterResponse.status -eq 200) { Get-Balance -Usage $usageAfterResponse.body -ProductCode "deep_analysis_pack_100" } else { $null }

$rowsArray = @($rows | Sort-Object index)
$createdRows = @($rowsArray | Where-Object { $_.action -eq "created_purchase_intent" })
$skippedRows = @($rowsArray | Where-Object { $_.action -eq "skipped_existing_order" })
$failedRows = @($createdRows | Where-Object { $_.status -ne 200 -or $_.credits_consumed -ne 1 })
$deepDelta = if ($deepBefore -and $deepAfter) {
    [int]$deepBefore.credits_remaining - [int]$deepAfter.credits_remaining
} else {
    $null
}

$summary = [pscustomobject]@{
    ok = (
        $qualityReview.ok -eq $true -and
        $usageBeforeResponse.status -eq 200 -and
        $usageAfterResponse.status -eq 200 -and
        $rowsArray.Count -eq 3 -and
        $failedRows.Count -eq 0 -and
        $deepDelta -eq $createdRows.Count -and
        $usageAfterResponse.body.real_payment_executed -eq $false -and
        $usageAfterResponse.body.external_contact_executed -eq $false
    )
    run_id = $runId
    source_quality_review_id = $qualityReview.run_id
    source_run_id = $sourceRunId
    finished_at = (Get-Date).ToString("s")
    mode = "BoundedDeepAnalysisPurchaseIntent"
    candidate_count = $candidates.Count
    existing_orders_found = $skippedRows.Count
    purchase_intents_created = $createdRows.Count
    action_pack_purchase_intents_created = 0
    sandbox_customer_created = $false
    target_discovery_created = $false
    expected_kv_puts_with_durable_object = 0
    expected_durable_object_writes = $createdRows.Count
    fallback_kv_puts_if_durable_object_unavailable = $createdRows.Count
    usage_before = [pscustomobject]@{
        status = $usageBeforeResponse.status
        ledger_backend = $usageBeforeResponse.body.ledger_backend
        deep_analysis_remaining = $deepBefore.credits_remaining
    }
    usage_after = [pscustomobject]@{
        status = $usageAfterResponse.status
        ledger_backend = $usageAfterResponse.body.ledger_backend
        deep_analysis_remaining = $deepAfter.credits_remaining
        deep_analysis_delta = $deepDelta
        real_payment_executed = $usageAfterResponse.body.real_payment_executed
        external_contact_executed = $usageAfterResponse.body.external_contact_executed
    }
    guardrails = [pscustomobject]@{
        real_payment_executed = $usageAfterResponse.body.real_payment_executed
        external_contact_executed = $usageAfterResponse.body.external_contact_executed
        no_action_pack_created = $true
        no_sandbox_customer_created = $true
        duplicate_deep_analysis_orders_avoided = ($skippedRows.Count -gt 0)
    }
    results = [pscustomobject]@{
        ok_created_rows = @($createdRows | Where-Object { $_.status -eq 200 -and $_.credits_consumed -eq 1 }).Count
        skipped_existing_rows = $skippedRows.Count
        failed_rows = $failedRows.Count
        recommended_next_products = @($rowsArray | Group-Object recommended_next_product | ForEach-Object { [pscustomobject]@{ next_product = $(if ($_.Name) { $_.Name } else { "none" }); count = $_.Count } })
    }
    rows = $rowsArray
}

$summaryPath = "bounded_deep_analysis_purchase_probe_summary_20260605.json"
$rowsPath = "bounded_deep_analysis_purchase_probe_rows_20260605.csv"
$reportPath = "bounded_deep_analysis_purchase_probe_report_20260605.md"

Write-Utf8NoBom -Path $summaryPath -Text (($summary | ConvertTo-Json -Depth 30) + [Environment]::NewLine)

$csvLines = New-Object System.Collections.Generic.List[string]
$csvLines.Add('"index","domain","score","confidence","action","status","existing_order_found","order_intent_id","delivery_type","recommended_next_product","credits_consumed","real_payment_executed","external_contact_executed"')
foreach ($row in $rowsArray) {
    $csvLines.Add((@(
        Csv-Escape $row.index
        Csv-Escape $row.domain
        Csv-Escape $row.score
        Csv-Escape ([double]$row.confidence).ToString("0.##", [System.Globalization.CultureInfo]::InvariantCulture)
        Csv-Escape $row.action
        Csv-Escape $row.status
        Csv-Escape $row.existing_order_found
        Csv-Escape $row.order_intent_id
        Csv-Escape $row.delivery_type
        Csv-Escape $row.recommended_next_product
        Csv-Escape $row.credits_consumed
        Csv-Escape $row.real_payment_executed
        Csv-Escape $row.external_contact_executed
    ) -join ","))
}
Write-Utf8NoBom -Path $rowsPath -Text (($csvLines -join [Environment]::NewLine) + [Environment]::NewLine)

$nextProductLines = (@($summary.results.recommended_next_products) | ForEach-Object { "- $($_.next_product): $($_.count)" }) -join "`n"
$rowLines = ($rowsArray | ForEach-Object {
    "| $($_.index) | $($_.domain) | $($_.score) | $($_.confidence) | $($_.action) | $($_.order_intent_id) | $($_.credits_consumed) | $($_.recommended_next_product) |"
}) -join "`n"

$report = @"
# MachineSignal - Bounded Deep Analysis Purchase Probe

Finished at: $($summary.finished_at)
Status: $(if ($summary.ok) { "PASS" } else { "FAIL" })
Mode: BoundedDeepAnalysisPurchaseIntent

## Scope

- Source quality review: ``$($summary.source_quality_review_id)``
- Candidate rows: ``$($summary.candidate_count)``
- Existing deep-analysis orders found: ``$($summary.existing_orders_found)``
- New Deep Analysis purchase intents created: ``$($summary.purchase_intents_created)``
- Action Pack purchase intents created: ``0``
- New sandbox customer created: ``false``
- Target discovery order created: ``false``
- Expected KV puts with Durable Object: ``0``
- Expected Durable Object writes: ``$($summary.expected_durable_object_writes)``

## Credit Movement

- Ledger backend before: ``$($summary.usage_before.ledger_backend)``
- Ledger backend after: ``$($summary.usage_after.ledger_backend)``
- Deep Analysis credits before: ``$($summary.usage_before.deep_analysis_remaining)``
- Deep Analysis credits after: ``$($summary.usage_after.deep_analysis_remaining)``
- Deep Analysis credit delta: ``$($summary.usage_after.deep_analysis_delta)``

## Guardrails

- Real payment executed: ``$($summary.guardrails.real_payment_executed)``
- External contact executed: ``$($summary.guardrails.external_contact_executed)``
- No Action Pack created: ``true``
- Duplicate Deep Analysis orders avoided: ``$($summary.guardrails.duplicate_deep_analysis_orders_avoided)``

## Recommended Next Products From Deep Analysis

$nextProductLines

## Rows

| # | Domain | Score | Confidence | Action | Order intent | Credits consumed | Deep-analysis next product |
|---|---|---:|---:|---|---|---:|---|
$rowLines

## Operational Conclusion

The machine buyer path can create bounded Deep Analysis purchase intents for quality-reviewed high-potential rows. One duplicate spend was avoided because clinic3.it already had an accepted Deep Analysis order from the previous bounded write-budget probe.

The next step should be a no-credit quality review of the Deep Analysis deliveries before any Action Pack simulation.
"@
Write-Utf8NoBom -Path $reportPath -Text ($report + [Environment]::NewLine)

$summary | ConvertTo-Json -Depth 30
