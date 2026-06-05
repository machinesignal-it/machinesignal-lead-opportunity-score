param(
    [string]$BaseUrl = "https://machinesignal-api.beta-878.workers.dev",
    [int]$Limit = 25,
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
$runId = "bounded-score-volume-25-probe-{0}" -f (Get-Date -Format "yyyyMMdd-HHmmss")

$targetSeeds = @(
    @{ domain = "clinic3.it"; target_name = "Clinic 3"; area = "Milano"; initial_signals = @("sector_match", "local_market", "business_domain_present", "website_opportunity", "booking_missing") },
    @{ domain = "studiorossidentale.it"; target_name = "Studio Rossi Dentale"; area = "Milano"; initial_signals = @("sector_match", "local_market", "business_domain_present", "weak_cta") },
    @{ domain = "odontoiatriabrianza.it"; target_name = "Odontoiatria Brianza"; area = "Monza"; initial_signals = @("sector_match", "regional_market", "clinic_keyword_present", "contact_friction") },
    @{ domain = "dentistalodi.it"; target_name = "Dentista Lodi"; area = "Lodi"; initial_signals = @("sector_match", "local_market", "business_domain_present") },
    @{ domain = "clinicaoralemilano.it"; target_name = "Clinica Orale Milano"; area = "Milano"; initial_signals = @("sector_match", "local_market", "business_domain_present", "conversion_friction") },
    @{ domain = "sorrisobergamo.it"; target_name = "Sorriso Bergamo"; area = "Bergamo"; initial_signals = @("sector_match", "regional_market", "service_keyword_present") },
    @{ domain = "implantologiacomo.it"; target_name = "Implantologia Como"; area = "Como"; initial_signals = @("sector_match", "local_market", "business_domain_present", "no_online_booking") },
    @{ domain = "studiodentalepavia.it"; target_name = "Studio Dentale Pavia"; area = "Pavia"; initial_signals = @("sector_match", "local_market", "business_domain_present") },
    @{ domain = "ortodonziabrescia.it"; target_name = "Ortodonzia Brescia"; area = "Brescia"; initial_signals = @("sector_match", "regional_market", "clinic_keyword_present", "website_opportunity") },
    @{ domain = "dentistavarese.it"; target_name = "Dentista Varese"; area = "Varese"; initial_signals = @("sector_match", "local_market", "business_domain_present", "outdated_site") },
    @{ domain = "centrodentalemantova.it"; target_name = "Centro Dentale Mantova"; area = "Mantova"; initial_signals = @("sector_match", "regional_market", "business_domain_present", "weak_cta") },
    @{ domain = "clinicadentalemagenta.it"; target_name = "Clinica Dentale Magenta"; area = "Milano"; initial_signals = @("sector_match", "local_market", "clinic_keyword_present", "contact_friction") },
    @{ domain = "studiobianchiortodonzia.it"; target_name = "Studio Bianchi Ortodonzia"; area = "Brescia"; initial_signals = @("sector_match", "regional_market", "business_domain_present") },
    @{ domain = "sorrisocremona.it"; target_name = "Sorriso Cremona"; area = "Cremona"; initial_signals = @("sector_match", "local_market", "service_keyword_present", "booking_missing") },
    @{ domain = "dentistalegnano.it"; target_name = "Dentista Legnano"; area = "Milano"; initial_signals = @("sector_match", "local_market", "business_domain_present", "website_opportunity") },
    @{ domain = "implantologiamonza.it"; target_name = "Implantologia Monza"; area = "Monza"; initial_signals = @("sector_match", "regional_market", "clinic_keyword_present", "no_online_booking") },
    @{ domain = "centroodontoiatricosondrio.it"; target_name = "Centro Odontoiatrico Sondrio"; area = "Sondrio"; initial_signals = @("sector_match", "local_market", "business_domain_present") },
    @{ domain = "studiopadentale.it"; target_name = "Studio PA Dentale"; area = "Pavia"; initial_signals = @("sector_match", "local_market", "business_domain_present", "outdated_site") },
    @{ domain = "clinicadentalegarda.it"; target_name = "Clinica Dentale Garda"; area = "Brescia"; initial_signals = @("sector_match", "regional_market", "clinic_keyword_present", "conversion_friction") },
    @{ domain = "odontoiatriamartesana.it"; target_name = "Odontoiatria Martesana"; area = "Milano"; initial_signals = @("sector_match", "local_market", "business_domain_present") },
    @{ domain = "studiodentalelecco.it"; target_name = "Studio Dentale Lecco"; area = "Lecco"; initial_signals = @("sector_match", "local_market", "business_domain_present", "weak_cta") },
    @{ domain = "centroimplantarevarese.it"; target_name = "Centro Implantare Varese"; area = "Varese"; initial_signals = @("sector_match", "regional_market", "clinic_keyword_present", "website_opportunity") },
    @{ domain = "ortodonziacrema.it"; target_name = "Ortodonzia Crema"; area = "Cremona"; initial_signals = @("sector_match", "local_market", "service_keyword_present") },
    @{ domain = "dentistacantu.it"; target_name = "Dentista Cantu"; area = "Como"; initial_signals = @("sector_match", "local_market", "business_domain_present", "contact_friction") },
    @{ domain = "clinicaodontoiatricarho.it"; target_name = "Clinica Odontoiatrica Rho"; area = "Milano"; initial_signals = @("sector_match", "regional_market", "clinic_keyword_present", "booking_missing") }
)

$targets = @($targetSeeds | Select-Object -First $Limit)
$usageBeforeResponse = Invoke-MachineSignalJson -Method GET -Uri "$BaseUrl/v1/usage" -ApiKey $apiKey
$scoreBefore = if ($usageBeforeResponse.status -eq 200) { Get-Balance -Usage $usageBeforeResponse.body -ProductCode "score_pack_1k" } else { $null }

$rows = @()
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
    $rows += [pscustomobject]@{
        index = $index
        status = $response.status
        domain = $target.domain
        target_name = $target.target_name
        area = $target.area
        opportunity_score = $body.opportunity_score
        confidence = $body.confidence
        decision = $body.decision
        commercial_strength = $body.commercial_strength.level
        next_product = $body.next_purchase.next_product
        credits_consumed = $body.usage.current_event.credits_consumed
        real_payment_executed = $body.usage.real_payment_executed
        external_contact_executed = $body.usage.external_contact_executed
        error = $response.error
    }
}

$usageAfterResponse = Invoke-MachineSignalJson -Method GET -Uri "$BaseUrl/v1/usage" -ApiKey $apiKey
$scoreAfter = if ($usageAfterResponse.status -eq 200) { Get-Balance -Usage $usageAfterResponse.body -ProductCode "score_pack_1k" } else { $null }

$rowsArray = @($rows | Sort-Object index)
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
    mode = "BoundedScoreVolume25"
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
        decisions = @($rowsArray | Group-Object decision | ForEach-Object { [pscustomobject]@{ decision = $_.Name; count = $_.Count } })
        commercial_strength = @($rowsArray | Group-Object commercial_strength | ForEach-Object { [pscustomobject]@{ level = $_.Name; count = $_.Count } })
        next_products = @($rowsArray | Group-Object next_product | ForEach-Object { [pscustomobject]@{ next_product = $(if ($_.Name) { $_.Name } else { "none" }); count = $_.Count } })
    }
    guardrails = [pscustomobject]@{
        real_payment_executed = $usageAfterResponse.body.real_payment_executed
        external_contact_executed = $usageAfterResponse.body.external_contact_executed
        no_purchase_intents_created = $true
        no_sandbox_customer_created = $true
    }
    rows = $rowsArray
}

$jsonPath = "bounded_score_volume_25_probe_summary_20260605.json"
$csvPath = "bounded_score_volume_25_probe_rows_20260605.csv"
$reportPath = "bounded_score_volume_25_probe_report_20260605.md"

$summaryJson = $summary | ConvertTo-Json -Depth 30
Write-Utf8NoBom -Path $jsonPath -Text ($summaryJson + [Environment]::NewLine)

$csvLines = New-Object System.Collections.Generic.List[string]
$csvLines.Add('"index","status","domain","target_name","area","opportunity_score","confidence","decision","commercial_strength","next_product","credits_consumed","real_payment_executed","external_contact_executed"')
foreach ($row in $rowsArray) {
    $confidence = if ($null -ne $row.confidence) { ([double]$row.confidence).ToString("0.##", [System.Globalization.CultureInfo]::InvariantCulture) } else { "" }
    $csvLines.Add((@(
        Csv-Escape $row.index
        Csv-Escape $row.status
        Csv-Escape $row.domain
        Csv-Escape $row.target_name
        Csv-Escape $row.area
        Csv-Escape $row.opportunity_score
        Csv-Escape $confidence
        Csv-Escape $row.decision
        Csv-Escape $row.commercial_strength
        Csv-Escape $(if ($row.next_product) { $row.next_product } else { "none" })
        Csv-Escape $row.credits_consumed
        Csv-Escape $row.real_payment_executed
        Csv-Escape $row.external_contact_executed
    ) -join ","))
}
Write-Utf8NoBom -Path $csvPath -Text (($csvLines -join [Environment]::NewLine) + [Environment]::NewLine)

$decisionLines = (@($summary.results.decisions) | ForEach-Object { "- $($_.decision): $($_.count)" }) -join "`n"
$strengthLines = (@($summary.results.commercial_strength) | ForEach-Object { "- $($_.level): $($_.count)" }) -join "`n"
$nextProductLines = (@($summary.results.next_products) | ForEach-Object { "- $($_.next_product): $($_.count)" }) -join "`n"
$rowLines = ($rowsArray | ForEach-Object {
    "| $($_.index) | $($_.domain) | $($_.status) | $($_.opportunity_score) | $($_.confidence) | $($_.decision) | $($_.commercial_strength) | $(if ($_.next_product) { $_.next_product } else { "none" }) |"
}) -join "`n"

$report = @"
# MachineSignal - Bounded Score Volume 25 Probe

Finished at: $($summary.finished_at)
Status: $(if ($summary.ok) { "PASS" } else { "FAIL" })
Mode: BoundedScoreVolume25

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
- No sandbox customer created: ``true``

## Decisions

$decisionLines

## Commercial Strength

$strengthLines

## Recommended Next Products

$nextProductLines

## Rows

| # | Domain | HTTP | Score | Confidence | Decision | Strength | Next product |
|---|---|---:|---:|---:|---|---|---|
$rowLines

## Operational Conclusion

The API handled a bounded 25-score machine batch using the existing customer key. This remains a bounded write test, not daily automation. Daily monitoring must stay in NoWrite mode.
"@
Write-Utf8NoBom -Path $reportPath -Text ($report + [Environment]::NewLine)

$summaryJson
