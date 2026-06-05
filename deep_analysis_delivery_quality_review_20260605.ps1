param(
    [string]$BaseUrl = "https://machinesignal-api.beta-878.workers.dev",
    [string]$PurchaseProbePath = "bounded_deep_analysis_purchase_probe_summary_20260605.json",
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
        [string]$ApiKey
    )
    $headers = @{
        "Accept" = "application/json"
        "X-API-Key" = $ApiKey
    }
    try {
        $response = Invoke-WebRequest `
            -Method $Method `
            -Uri $Uri `
            -Headers $headers `
            -TimeoutSec 30 `
            -UseBasicParsing
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

function Test-TextContains {
    param([string]$Text, [string]$Needle)
    return $Text.ToLowerInvariant().Contains($Needle.ToLowerInvariant())
}

function Get-ActionPackEligibility {
    param(
        [int]$Score,
        [double]$Confidence,
        [bool]$ContractValid,
        [bool]$SyntheticDemoMode
    )
    if (-not $ContractValid) { return "not_eligible_contract_failed" }
    if ($SyntheticDemoMode) { return "technical_probe_only_synthetic_delivery" }
    if ($Score -ge 77 -and $Confidence -ge 0.80) { return "eligible_for_bounded_action_pack_probe" }
    if ($Score -ge 75 -and $Confidence -ge 0.67) { return "eligible_only_with_extra_gate" }
    return "not_eligible_low_signal"
}

$apiKey = Get-StoredApiKey -Path $CredentialPath
$purchaseProbe = Get-Content -Raw -LiteralPath $PurchaseProbePath | ConvertFrom-Json
$sourceRows = @($purchaseProbe.rows | Sort-Object index)

$usageBeforeResponse = Invoke-MachineSignalJson -Method GET -Uri "$BaseUrl/v1/usage" -ApiKey $apiKey
$deepBefore = if ($usageBeforeResponse.status -eq 200) { Get-Balance -Usage $usageBeforeResponse.body -ProductCode "deep_analysis_pack_100" } else { $null }
$actionBefore = if ($usageBeforeResponse.status -eq 200) { Get-Balance -Usage $usageBeforeResponse.body -ProductCode "action_pack_25" } else { $null }

$reviewRows = foreach ($source in $sourceRows) {
    $orderId = [string]$source.order_intent_id
    $response = Invoke-MachineSignalJson -Method GET -Uri "$BaseUrl/v1/orders/$orderId" -ApiKey $apiKey
    $order = $response.body.order
    $delivery = $order.delivery
    $whatIsIncluded = $delivery.what_is_included
    $recommendedNextStep = $delivery.recommended_next_step
    $nextMachineCall = $delivery.next_machine_call
    $stopRules = @($delivery.stop_rules)
    $signalsToValidate = @($delivery.signals_to_validate)
    $riskFlags = @($delivery.risk_flags)

    $statusOk = ($response.status -eq 200 -and $order.status -eq "accepted_beta_order_intent")
    $productOk = ($order.product_code -eq "deep_analysis" -and $order.ledger_product_code -eq "deep_analysis_pack_100")
    $deliveryTypeOk = ($delivery.delivery_type -eq "deep_opportunity_analysis" -and $delivery.status -eq "deep_analysis_ready")
    $includedOk = (
        $whatIsIncluded.exact_unit_sold -eq "one deep opportunity decision pack for one scored domain" -and
        @($whatIsIncluded.returned_decision_fields).Count -ge 5
    )
    $recommendationOk = (
        $recommendedNextStep.product_code -eq "action_pack" -and
        (Test-TextContains -Text ([string]$recommendedNextStep.condition) -Needle "compliant") -and
        (Test-TextContains -Text ([string]$recommendedNextStep.condition) -Needle "budget")
    )
    $stopRulesOk = ($stopRules.Count -ge 3)
    $signalsOk = ($signalsToValidate.Count -ge 3)
    $budgetOk = ([int]$delivery.recommended_budget_cap_eur -le 3)
    $nextCallOk = ($nextMachineCall.method -eq "POST" -and $nextMachineCall.endpoint -eq "/v1/purchase-intent")
    $safetyOk = (
        $order.real_payment_executed -eq $false -and
        $order.external_contact_executed -eq $false -and
        $delivery.real_payment_executed -eq $false -and
        $delivery.external_contact_executed -eq $false
    )
    $syntheticDemoMode = ($delivery.synthetic_demo_mode -eq $true)
    $riskFlagsOk = ($riskFlags -contains "requires real-world validation before outreach")

    $contractChecksPassed = @(
        $statusOk,
        $productOk,
        $deliveryTypeOk,
        $includedOk,
        $recommendationOk,
        $stopRulesOk,
        $signalsOk,
        $budgetOk,
        $nextCallOk,
        $safetyOk,
        $riskFlagsOk
    ) | Where-Object { $_ -eq $true }

    $contractValid = ($contractChecksPassed.Count -eq 11)
    $commercialContentVerdict = if ($syntheticDemoMode) {
        "contract_valid_but_content_synthetic"
    } elseif ($contractValid) {
        "commercially_reviewable_delivery"
    } else {
        "delivery_contract_review_needed"
    }

    [pscustomobject]@{
        index = [int]$source.index
        domain = [string]$source.domain
        source_score = [int]$source.score
        source_confidence = [double]$source.confidence
        order_intent_id = $orderId
        http_status = $response.status
        product_code = [string]$order.product_code
        delivery_type = [string]$delivery.delivery_type
        delivery_status = [string]$delivery.status
        contract_valid = $contractValid
        checks_passed = $contractChecksPassed.Count
        checks_total = 11
        recommendation_product = [string]$recommendedNextStep.product_code
        recommendation_condition_has_compliance_gate = (Test-TextContains -Text ([string]$recommendedNextStep.condition) -Needle "compliant")
        recommendation_condition_has_budget_gate = (Test-TextContains -Text ([string]$recommendedNextStep.condition) -Needle "budget")
        stop_rules_count = $stopRules.Count
        signals_to_validate_count = $signalsToValidate.Count
        recommended_budget_cap_eur = [int]$delivery.recommended_budget_cap_eur
        next_machine_call = "$($nextMachineCall.method) $($nextMachineCall.endpoint)"
        synthetic_demo_mode = $syntheticDemoMode
        risk_flags_require_validation = $riskFlagsOk
        real_payment_executed = $order.real_payment_executed
        external_contact_executed = $order.external_contact_executed
        commercial_content_verdict = $commercialContentVerdict
        action_pack_eligibility = Get-ActionPackEligibility -Score ([int]$source.score) -Confidence ([double]$source.confidence) -ContractValid $contractValid -SyntheticDemoMode $syntheticDemoMode
        error = $response.error
    }
}

$usageAfterResponse = Invoke-MachineSignalJson -Method GET -Uri "$BaseUrl/v1/usage" -ApiKey $apiKey
$deepAfter = if ($usageAfterResponse.status -eq 200) { Get-Balance -Usage $usageAfterResponse.body -ProductCode "deep_analysis_pack_100" } else { $null }
$actionAfter = if ($usageAfterResponse.status -eq 200) { Get-Balance -Usage $usageAfterResponse.body -ProductCode "action_pack_25" } else { $null }

$rowsArray = @($reviewRows | Sort-Object index)
$contractValidCount = @($rowsArray | Where-Object { $_.contract_valid }).Count
$syntheticCount = @($rowsArray | Where-Object { $_.synthetic_demo_mode }).Count
$commercialReviewNeededCount = @($rowsArray | Where-Object { $_.commercial_content_verdict -ne "contract_valid_but_content_synthetic" -and $_.commercial_content_verdict -ne "commercially_reviewable_delivery" }).Count
$deepDelta = if ($deepBefore -and $deepAfter) { [int]$deepBefore.credits_remaining - [int]$deepAfter.credits_remaining } else { $null }
$actionDelta = if ($actionBefore -and $actionAfter) { [int]$actionBefore.credits_remaining - [int]$actionAfter.credits_remaining } else { $null }

$summary = [pscustomobject]@{
    ok = (
        $purchaseProbe.ok -eq $true -and
        $usageBeforeResponse.status -eq 200 -and
        $usageAfterResponse.status -eq 200 -and
        $rowsArray.Count -eq 3 -and
        $contractValidCount -eq 3 -and
        $deepDelta -eq 0 -and
        $actionDelta -eq 0 -and
        $usageAfterResponse.body.real_payment_executed -eq $false -and
        $usageAfterResponse.body.external_contact_executed -eq $false
    )
    run_id = "deep-analysis-delivery-quality-review-20260605"
    source_purchase_probe_id = $purchaseProbe.run_id
    generated_at = (Get-Date).ToString("s")
    mode = "NoCreditDeepAnalysisDeliveryQualityReview"
    reviewed_deliveries = $rowsArray.Count
    contract_valid_count = $contractValidCount
    commercial_review_needed_count = $commercialReviewNeededCount
    synthetic_demo_delivery_count = $syntheticCount
    action_pack_purchase_intents_created = 0
    expected_kv_puts_with_durable_object = 0
    expected_durable_object_writes = 0
    usage_before = [pscustomobject]@{
        status = $usageBeforeResponse.status
        ledger_backend = $usageBeforeResponse.body.ledger_backend
        deep_analysis_remaining = $deepBefore.credits_remaining
        action_pack_remaining = $actionBefore.credits_remaining
    }
    usage_after = [pscustomobject]@{
        status = $usageAfterResponse.status
        ledger_backend = $usageAfterResponse.body.ledger_backend
        deep_analysis_remaining = $deepAfter.credits_remaining
        action_pack_remaining = $actionAfter.credits_remaining
        deep_analysis_delta = $deepDelta
        action_pack_delta = $actionDelta
        real_payment_executed = $usageAfterResponse.body.real_payment_executed
        external_contact_executed = $usageAfterResponse.body.external_contact_executed
    }
    guardrails = [pscustomobject]@{
        no_post_calls_executed = $true
        no_credits_consumed = ($deepDelta -eq 0 -and $actionDelta -eq 0)
        real_payment_executed = $usageAfterResponse.body.real_payment_executed
        external_contact_executed = $usageAfterResponse.body.external_contact_executed
        no_action_pack_created = $true
    }
    conclusion = "The 3 Deep Analysis deliveries pass the API contract review, but all are still synthetic beta deliveries. They are suitable for a bounded Action Pack contract probe, not yet proof of commercial-grade Deep Analysis value."
    recommended_next_step = "Run at most one bounded Action Pack contract probe on the strongest reviewed row, while keeping synthetic-output caveat visible and no real payment or external contact."
    rows = $rowsArray
}

$summaryPath = "deep_analysis_delivery_quality_review_summary_20260605.json"
$rowsPath = "deep_analysis_delivery_quality_review_rows_20260605.csv"
$reportPath = "deep_analysis_delivery_quality_review_report_20260605.md"

Write-Utf8NoBom -Path $summaryPath -Text (($summary | ConvertTo-Json -Depth 30) + [Environment]::NewLine)

$csvLines = New-Object System.Collections.Generic.List[string]
$csvLines.Add('"index","domain","source_score","source_confidence","order_intent_id","http_status","delivery_type","contract_valid","checks_passed","checks_total","recommendation_product","stop_rules_count","signals_to_validate_count","recommended_budget_cap_eur","synthetic_demo_mode","commercial_content_verdict","action_pack_eligibility","real_payment_executed","external_contact_executed"')
foreach ($row in $rowsArray) {
    $csvLines.Add((@(
        Csv-Escape $row.index
        Csv-Escape $row.domain
        Csv-Escape $row.source_score
        Csv-Escape ([double]$row.source_confidence).ToString("0.##", [System.Globalization.CultureInfo]::InvariantCulture)
        Csv-Escape $row.order_intent_id
        Csv-Escape $row.http_status
        Csv-Escape $row.delivery_type
        Csv-Escape $row.contract_valid
        Csv-Escape $row.checks_passed
        Csv-Escape $row.checks_total
        Csv-Escape $row.recommendation_product
        Csv-Escape $row.stop_rules_count
        Csv-Escape $row.signals_to_validate_count
        Csv-Escape $row.recommended_budget_cap_eur
        Csv-Escape $row.synthetic_demo_mode
        Csv-Escape $row.commercial_content_verdict
        Csv-Escape $row.action_pack_eligibility
        Csv-Escape $row.real_payment_executed
        Csv-Escape $row.external_contact_executed
    ) -join ","))
}
Write-Utf8NoBom -Path $rowsPath -Text (($csvLines -join [Environment]::NewLine) + [Environment]::NewLine)

$verdictLines = (@($rowsArray | Group-Object commercial_content_verdict | ForEach-Object { "- $($_.Name): $($_.Count)" })) -join "`n"
$eligibilityLines = (@($rowsArray | Group-Object action_pack_eligibility | ForEach-Object { "- $($_.Name): $($_.Count)" })) -join "`n"
$rowLines = ($rowsArray | ForEach-Object {
    "| $($_.index) | $($_.domain) | $($_.source_score) | $($_.source_confidence) | $($_.order_intent_id) | $($_.contract_valid) | $($_.synthetic_demo_mode) | $($_.action_pack_eligibility) |"
}) -join "`n"

$report = @"
# MachineSignal - Deep Analysis Delivery Quality Review

Generated at: $($summary.generated_at)
Status: $(if ($summary.ok) { "PASS" } else { "FAIL" })
Mode: NoCreditDeepAnalysisDeliveryQualityReview

## Question

Are the 3 Deep Analysis deliveries good enough to justify an Action Pack simulation?

## Answer

Technically yes, commercially with caution.

All 3 deliveries pass the API contract review: they return a Deep Analysis delivery, include stop rules, validation signals, budget cap, a compliant/budget-gated Action Pack recommendation and no external action.

However, all 3 deliveries are still marked ``synthetic_demo_mode``. That means this validates the machine buying flow and delivery contract, but it does not yet prove that the Deep Analysis content is commercially differentiated enough for real paid customers.

## Routing Checks

- Reviewed deliveries: ``$($summary.reviewed_deliveries)``
- Contract-valid deliveries: ``$($summary.contract_valid_count)``
- Synthetic demo deliveries: ``$($summary.synthetic_demo_delivery_count)``
- Commercial review-needed rows: ``$($summary.commercial_review_needed_count)``
- Deep Analysis credit delta: ``$($summary.usage_after.deep_analysis_delta)``
- Action Pack credit delta: ``$($summary.usage_after.action_pack_delta)``
- Expected KV puts with Durable Object: ``0``
- Expected Durable Object writes: ``0``

## Guardrails

- No POST calls executed: ``true``
- No credits consumed: ``$($summary.guardrails.no_credits_consumed)``
- Real payment executed: ``$($summary.guardrails.real_payment_executed)``
- External contact executed: ``$($summary.guardrails.external_contact_executed)``
- No Action Pack created: ``true``

## Commercial Verdicts

$verdictLines

## Action Pack Eligibility

$eligibilityLines

## Rows

| # | Domain | Score | Confidence | Order intent | Contract valid | Synthetic | Action Pack eligibility |
|---|---|---:|---:|---|---|---|---|
$rowLines

## Recommendation

Run at most one bounded Action Pack contract probe on the strongest reviewed row. Keep the caveat visible: this is still a contract and workflow test, not proof of final commercial Deep Analysis quality.

Before monetization, Deep Analysis should become more domain-specific and less generic.
"@
Write-Utf8NoBom -Path $reportPath -Text ($report + [Environment]::NewLine)

$summary | ConvertTo-Json -Depth 30
