param(
    [string]$BaseUrl = "https://machinesignal-api.beta-878.workers.dev",
    [int]$Limit = 10,
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

$apiKey = Get-StoredApiKey -Path $CredentialPath
$runId = "bounded-score-volume-probe-{0}" -f (Get-Date -Format "yyyyMMdd-HHmmss")

$targets = @(
    @{ domain = "clinic3.it"; target_name = "Clinic 3"; area = "Milano"; initial_signals = @("sector_match", "local_market", "business_domain_present", "website_opportunity", "booking_missing") },
    @{ domain = "studiorossidentale.it"; target_name = "Studio Rossi Dentale"; area = "Milano"; initial_signals = @("sector_match", "local_market", "business_domain_present", "weak_cta") },
    @{ domain = "odontoiatriabrianza.it"; target_name = "Odontoiatria Brianza"; area = "Monza"; initial_signals = @("sector_match", "regional_market", "clinic_keyword_present", "contact_friction") },
    @{ domain = "dentistalodi.it"; target_name = "Dentista Lodi"; area = "Lodi"; initial_signals = @("sector_match", "local_market", "business_domain_present") },
    @{ domain = "clinicaoralemilano.it"; target_name = "Clinica Orale Milano"; area = "Milano"; initial_signals = @("sector_match", "local_market", "business_domain_present", "conversion_friction") },
    @{ domain = "sorrisobergamo.it"; target_name = "Sorriso Bergamo"; area = "Bergamo"; initial_signals = @("sector_match", "regional_market", "service_keyword_present") },
    @{ domain = "implantologiacomo.it"; target_name = "Implantologia Como"; area = "Como"; initial_signals = @("sector_match", "local_market", "business_domain_present", "no_online_booking") },
    @{ domain = "studiodentalepavia.it"; target_name = "Studio Dentale Pavia"; area = "Pavia"; initial_signals = @("sector_match", "local_market", "business_domain_present") },
    @{ domain = "ortodonziabrescia.it"; target_name = "Ortodonzia Brescia"; area = "Brescia"; initial_signals = @("sector_match", "regional_market", "clinic_keyword_present", "website_opportunity") },
    @{ domain = "dentistavarese.it"; target_name = "Dentista Varese"; area = "Varese"; initial_signals = @("sector_match", "local_market", "business_domain_present", "outdated_site") }
) | Select-Object -First $Limit

$usageBeforeResponse = Invoke-MachineSignalJson -Method GET -Uri "$BaseUrl/v1/usage" -ApiKey $apiKey
$scoreBefore = if ($usageBeforeResponse.status -eq 200) { Get-Balance -Usage $usageBeforeResponse.body -ProductCode "score_pack_1k" } else { $null }

$rows = New-Object "System.Collections.Generic.List[object]"
$index = 0
foreach ($target in $targets) {
    $index += 1
    $payload = @{
        domain = $target.domain
        target_name = $target.target_name
        sector_hint = "dentist"
        country_hint = "IT"
        area = $target.area
        region = "Lombardia"
        initial_signals = $target.initial_signals
        commercial_objective = "website-led commercial opportunity and CRM-ready follow-up preparation"
        batch_id = $runId
    }
    $response = Invoke-MachineSignalJson `
        -Method POST `
        -Uri "$BaseUrl/v1/lead-opportunity-score" `
        -ApiKey $apiKey `
        -IdempotencyKey "$runId-score-$index" `
        -Payload $payload

    $body = $response.body
    $rows.Add([pscustomobject]@{
        index = $index
        status = $response.status
        domain = $target.domain
        target_name = $target.target_name
        opportunity_score = $body.opportunity_score
        confidence = $body.confidence
        decision = $body.decision
        commercial_strength = $body.commercial_strength.level
        next_product = $body.next_purchase.next_product
        credits_consumed = $body.usage.current_event.credits_consumed
        real_payment_executed = $body.usage.real_payment_executed
        external_contact_executed = $body.usage.external_contact_executed
        error = $response.error
    })
}

$usageAfterResponse = Invoke-MachineSignalJson -Method GET -Uri "$BaseUrl/v1/usage" -ApiKey $apiKey
$scoreAfter = if ($usageAfterResponse.status -eq 200) { Get-Balance -Usage $usageAfterResponse.body -ProductCode "score_pack_1k" } else { $null }

$rowsArray = @($rows.ToArray())
$okRows = @($rowsArray | Where-Object { $_.status -eq 200 -and $_.credits_consumed -eq 1 })
$failedRows = @($rowsArray | Where-Object { $_.status -ne 200 -or $_.credits_consumed -ne 1 })
$scoreDelta = if ($scoreBefore -and $scoreAfter) {
    [int]$scoreBefore.credits_remaining - [int]$scoreAfter.credits_remaining
} else {
    $null
}

$summary = [pscustomobject]@{
    ok = ($usageBeforeResponse.status -eq 200 -and $usageAfterResponse.status -eq 200 -and $failedRows.Count -eq 0 -and $scoreDelta -eq $rowsArray.Count)
    run_id = $runId
    finished_at = (Get-Date).ToString("s")
    mode = "BoundedScoreVolume10"
    target_count = $rowsArray.Count
    sandbox_customer_created = $false
    target_discovery_created = $false
    purchase_intents_created = 0
    expected_kv_puts_with_durable_object = 0
    expected_durable_object_writes = $rowsArray.Count
    fallback_kv_puts_if_durable_object_unavailable = $rowsArray.Count
    usage_before = [pscustomobject]@{
        status = $usageBeforeResponse.status
        ledger_backend = $usageBeforeResponse.body.ledger_backend
        score_remaining = $scoreBefore.credits_remaining
    }
    usage_after = [pscustomobject]@{
        status = $usageAfterResponse.status
        ledger_backend = $usageAfterResponse.body.ledger_backend
        score_remaining = $scoreAfter.credits_remaining
        score_delta = $scoreDelta
        real_payment_executed = $usageAfterResponse.body.real_payment_executed
        external_contact_executed = $usageAfterResponse.body.external_contact_executed
    }
    results = [pscustomobject]@{
        ok_rows = $okRows.Count
        failed_rows = $failedRows.Count
        decisions = ($rowsArray | Group-Object decision | ForEach-Object { [pscustomobject]@{ decision = $_.Name; count = $_.Count } })
        commercial_strength = ($rowsArray | Group-Object commercial_strength | ForEach-Object { [pscustomobject]@{ level = $_.Name; count = $_.Count } })
        next_products = ($rowsArray | Group-Object next_product | ForEach-Object { [pscustomobject]@{ next_product = $_.Name; count = $_.Count } })
    }
    guardrails = [pscustomobject]@{
        real_payment_executed = $usageAfterResponse.body.real_payment_executed
        external_contact_executed = $usageAfterResponse.body.external_contact_executed
        no_purchase_intents_created = $true
        no_sandbox_customer_created = $true
    }
    rows = $rowsArray
}

$jsonPath = "bounded_score_volume_probe_summary_20260605.json"
$csvPath = "bounded_score_volume_probe_rows_20260605.csv"
$reportPath = "bounded_score_volume_probe_report_20260605.md"
$summaryJson = $summary | ConvertTo-Json -Depth 30
Write-Utf8NoBom -Path $jsonPath -Text ($summaryJson + [Environment]::NewLine)
$rowsArray | Export-Csv -LiteralPath $csvPath -NoTypeInformation -Encoding utf8

$decisionLines = ($summary.results.decisions | ForEach-Object { "- {0}: {1}" -f $_.decision, $_.count }) -join "`n"
$strengthLines = ($summary.results.commercial_strength | ForEach-Object { "- {0}: {1}" -f $_.level, $_.count }) -join "`n"
$nextProductLines = ($summary.results.next_products | ForEach-Object { "- {0}: {1}" -f $_.next_product, $_.count }) -join "`n"
$rowLines = ($rowsArray | ForEach-Object {
    "| $($_.index) | $($_.domain) | $($_.status) | $($_.opportunity_score) | $($_.decision) | $($_.commercial_strength) | $($_.next_product) |"
}) -join "`n"

$report = @"
# MachineSignal - Bounded Score Volume Probe

Finished at: $($summary.finished_at)
Status: $(if ($summary.ok) { "PASS" } else { "FAIL" })
Mode: BoundedScoreVolume10

## Scope

- Score requests: ``$($summary.target_count)``
- New sandbox customer created: ``false``
- Target discovery order created: ``false``
- Purchase intents created: ``0``
- Expected KV puts with Durable Object: ``0``
- Expected Durable Object writes: ``$($summary.expected_durable_object_writes)``

## Ledger And Credits

- Ledger backend before: ``$($summary.usage_before.ledger_backend)``
- Ledger backend after: ``$($summary.usage_after.ledger_backend)``
- Score credits before: ``$($summary.usage_before.score_remaining)``
- Score credits after: ``$($summary.usage_after.score_remaining)``
- Score credit delta: ``$($summary.usage_after.score_delta)``

## Guardrails

- Real payment executed: ``$($summary.guardrails.real_payment_executed)``
- External contact executed: ``$($summary.guardrails.external_contact_executed)``
- No purchase intent created: ``true``

## Decisions

$decisionLines

## Commercial Strength

$strengthLines

## Recommended Next Products

$nextProductLines

## Rows

| # | Domain | HTTP | Score | Decision | Strength | Next product |
|---|---|---:|---:|---|---|---|
$rowLines

## Operational Conclusion

The API handled a 10-score machine batch using the existing customer key. This remains a bounded write test, not daily automation. Daily monitoring must stay in NoWrite mode.
"@
Write-Utf8NoBom -Path $reportPath -Text ($report + [Environment]::NewLine)

$summaryJson
