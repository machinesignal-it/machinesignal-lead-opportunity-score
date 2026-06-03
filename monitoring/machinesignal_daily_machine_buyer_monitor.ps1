param(
    [string]$BaseUrl = "https://machinesignal-api.beta-878.workers.dev",
    [string]$PublicSite = "https://machinesignal.it",
    [string]$OutputRoot = "outputs\machinesignal_daily_monitor",
    [string]$MonitorCredentialStorePath = (Join-Path $env:APPDATA "MachineSignal\machinesignal_monitor_api_key.dpapi")
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

function Invoke-MachineSignalJson {
    param(
        [ValidateSet("GET", "POST")]
        [string]$Method,
        [string]$Uri,
        [object]$Payload = $null,
        [string]$ApiKey = "",
        [string]$IdempotencyKey = ""
    )

    $headers = @{
        "Accept" = "application/json,text/plain,*/*"
        "User-Agent" = "MachineSignalDailyMachineBuyerMonitor/2026-06-02"
    }
    if ($ApiKey) {
        $headers["X-API-Key"] = $ApiKey
    }
    if ($IdempotencyKey) {
        $headers["Idempotency-Key"] = $IdempotencyKey
    }

    try {
        if ($Payload -ne $null) {
            $body = $Payload | ConvertTo-Json -Depth 20
            $response = Invoke-WebRequest -Uri $Uri -Method $Method -Headers $headers -Body $body -ContentType "application/json" -UseBasicParsing -TimeoutSec 30
        } else {
            $response = Invoke-WebRequest -Uri $Uri -Method $Method -Headers $headers -UseBasicParsing -TimeoutSec 30
        }
        $content = $response.Content
        try {
            $parsed = $content | ConvertFrom-Json
        } catch {
            $parsed = $content
        }
        return [pscustomobject]@{ Status = [int]$response.StatusCode; Body = $parsed }
    } catch {
        $status = 599
        $body = [pscustomobject]@{ error = "request_error"; message = $_.Exception.Message }
        if ($_.Exception.Response) {
            try {
                $status = [int]$_.Exception.Response.StatusCode
                $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
                $raw = $reader.ReadToEnd()
                $reader.Close()
                try {
                    $body = $raw | ConvertFrom-Json
                } catch {
                    $body = $raw
                }
            } catch {
                $body = [pscustomobject]@{ error = "request_error"; message = $_.Exception.Message }
            }
        }
        return [pscustomobject]@{ Status = $status; Body = $body }
    }
}

function Add-Check {
    param(
        [System.Collections.Generic.List[object]]$Checks,
        [string]$Name,
        [bool]$Ok,
        [string]$Details = ""
    )
    $Checks.Add([pscustomobject]@{ name = $Name; ok = $Ok; details = $Details }) | Out-Null
}

function Mask-Key {
    param([string]$Value)
    if (-not $Value) { return "" }
    if ($Value.Length -le 14) { return ($Value.Substring(0, [Math]::Min(4, $Value.Length)) + "...") }
    return ($Value.Substring(0, 10) + "..." + $Value.Substring($Value.Length - 4))
}

function Convert-SecureStringToPlainText {
    param([securestring]$SecureValue)
    if (-not $SecureValue) { return "" }
    $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($SecureValue)
    try {
        return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)
    } finally {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)
    }
}

function Get-StoredMonitorApiKey {
    param([string]$CredentialPath)
    if ($env:MACHINESIGNAL_MONITOR_API_KEY) {
        return [string]$env:MACHINESIGNAL_MONITOR_API_KEY
    }
    if (-not (Test-Path -LiteralPath $CredentialPath)) {
        return ""
    }
    try {
        $encrypted = (Get-Content -LiteralPath $CredentialPath -Raw).Trim()
        $secure = $encrypted | ConvertTo-SecureString
        return Convert-SecureStringToPlainText $secure
    } catch {
        return ""
    }
}

function Get-FirstSampleTarget {
    param([object]$Payload)
    if ($null -eq $Payload) { return $null }
    if ($Payload.PSObject.Properties.Name -contains "delivery") {
        $samples = $Payload.delivery.beta_sample_targets
        if ($samples -and $samples.Count -gt 0) { return $samples[0] }
    }
    if ($Payload.PSObject.Properties.Name -contains "order") {
        $samples = $Payload.order.delivery.beta_sample_targets
        if ($samples -and $samples.Count -gt 0) { return $samples[0] }
    }
    return $null
}

function Get-RecommendedProduct {
    param([object]$Score)
    if ($null -eq $Score) { return "" }
    if ($Score.next_purchase -and $Score.next_purchase.next_product) {
        return [string]$Score.next_purchase.next_product
    }
    switch ([string]$Score.decision) {
        "buy_deep_analysis" { return "deep_analysis" }
        "nurture" { return "nurture_signal" }
        "needs_verification" { return "verification" }
        default { return "" }
    }
}

$stamp = Get-Date -Format "yyyyMMdd_HHmmss"
$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not [System.IO.Path]::IsPathRooted($OutputRoot)) {
    $OutputRoot = Join-Path $scriptRoot $OutputRoot
}
$outputDir = $OutputRoot
if (-not (Test-Path -LiteralPath $outputDir)) {
    [System.IO.Directory]::CreateDirectory($outputDir) | Out-Null
}
$runId = "daily-machine-monitor-$stamp-$([int][double]::Parse((Get-Date -UFormat %s)))"
$checks = New-Object "System.Collections.Generic.List[object]"

$resources = @{
    llms = "$PublicSite/llms.txt"
    dentists_beta_pack = "$PublicSite/dentists-beta-machine-buyer-pack.json"
    product_catalog = "$PublicSite/product-catalog.json"
    machine_onboarding = "$PublicSite/machine-onboarding.json"
    openapi = "$PublicSite/openapi.json"
}

$fetched = @{}
foreach ($name in $resources.Keys) {
    $result = Invoke-MachineSignalJson -Method GET -Uri $resources[$name]
    $fetched[$name] = $result.Body
    Add-Check -Checks $checks -Name "public_${name}_reachable" -Ok ($result.Status -eq 200) -Details "HTTP $($result.Status)"
}

$llmsText = [string]$fetched["llms"]
Add-Check -Checks $checks -Name "machine_can_discover_dentists_pack" -Ok ($llmsText.Contains("dentists-beta-machine-buyer-pack.json")) -Details "llms.txt includes dentists pack"
Add-Check -Checks $checks -Name "dentists_pack_contains_benchmark" -Ok ($fetched["dentists_beta_pack"].benchmark.targets_scored -eq 250) -Details "expected benchmark targets_scored=250"

$apiKey = Get-StoredMonitorApiKey -CredentialPath $MonitorCredentialStorePath
$customerId = "stored_monitor_customer"
if ($apiKey) {
    Add-Check -Checks $checks -Name "monitor_api_key_loaded" -Ok $true -Details "stored key=$(Mask-Key $apiKey)"
    Add-Check -Checks $checks -Name "sandbox_customer_created" -Ok $true -Details "skipped: using stored monitor beta key"
} else {
    Add-Check -Checks $checks -Name "monitor_api_key_loaded" -Ok $false -Details "no stored monitor key; fallback to public sandbox"
    $sandbox = Invoke-MachineSignalJson -Method POST -Uri "$BaseUrl/v1/sandbox/customers" -IdempotencyKey "$runId-sandbox" -Payload @{
        evaluator_type = "ai_agent"
        integration_target = "daily machine-buyer monitor"
        expected_test_path = "dentists_beta_machine_buyer_pack_flow"
    }
    $apiKey = [string]$sandbox.Body.api_key
    $customerId = [string]$sandbox.Body.customer_id
    Add-Check -Checks $checks -Name "sandbox_customer_created" -Ok (($sandbox.Status -eq 200) -and [bool]$apiKey) -Details "HTTP $($sandbox.Status), key=$(Mask-Key $apiKey)"
}

$onboarding = Invoke-MachineSignalJson -Method GET -Uri "$BaseUrl/v1/onboarding" -ApiKey $apiKey
Add-Check -Checks $checks -Name "authenticated_onboarding_reachable" -Ok ($onboarding.Status -eq 200) -Details "HTTP $($onboarding.Status)"

$discoveryOrder = Invoke-MachineSignalJson -Method POST -Uri "$BaseUrl/v1/purchase-intent" -ApiKey $apiKey -IdempotencyKey "$runId-target-discovery" -Payload @{
    product_code = "target_discovery"
    market = "dentists_odontoiatric_clinics"
    area = "Lombardia"
    commercial_objective = "identify dentist and odontoiatric clinic domains worth scoring for website-led commercial opportunity and CRM-ready follow-up preparation"
    reason = "Daily monitor verifies machine-buyer target discovery flow."
    max_budget_eur = 149
}
Add-Check -Checks $checks -Name "target_discovery_purchase_intent_created" -Ok ($discoveryOrder.Status -eq 200) -Details "HTTP $($discoveryOrder.Status)"

$sample = Get-FirstSampleTarget $discoveryOrder.Body
$sampleDomain = if ($sample) { [string]$sample.domain } else { "" }
Add-Check -Checks $checks -Name "target_discovery_returns_sample_target" -Ok ([bool]$sampleDomain) -Details $sampleDomain

$scoreBody = $null
if ($sampleDomain) {
    $score = Invoke-MachineSignalJson -Method POST -Uri "$BaseUrl/v1/lead-opportunity-score" -ApiKey $apiKey -IdempotencyKey "$runId-score-001" -Payload @{
        domain = $sampleDomain
        sector_hint = "dentist"
        country_hint = "IT"
        target_name = $sample.target_name
        category_hint = $sample.category
        area = $sample.area
        region = "Lombardia"
        initial_signals = $sample.initial_signals
        commercial_objective = "website-led commercial opportunity and CRM-ready follow-up preparation"
    }
    $scoreBody = $score.Body
    Add-Check -Checks $checks -Name "score_created" -Ok (($score.Status -eq 200) -and ($null -ne $scoreBody.opportunity_score)) -Details "HTTP $($score.Status)"
    Add-Check -Checks $checks -Name "score_has_web_architect_review" -Ok ($null -ne $scoreBody.web_architect_review) -Details ([string]$scoreBody.web_architect_review.status)
    Add-Check -Checks $checks -Name "score_has_commercial_strength" -Ok ($null -ne $scoreBody.commercial_strength) -Details ([string]$scoreBody.commercial_strength.level)
}

$product = Get-RecommendedProduct $scoreBody
$addOnStatus = ""
if ($product) {
    $addOn = Invoke-MachineSignalJson -Method POST -Uri "$BaseUrl/v1/purchase-intent" -ApiKey $apiKey -IdempotencyKey "$runId-$product" -Payload @{
        product_code = $product
        domain = $scoreBody.domain
        source_score_request_id = "$runId-score-001"
        reason = "Daily monitor follows recommended product $product."
    }
    if ($addOn.Body.status) { $addOnStatus = [string]$addOn.Body.status }
    elseif ($addOn.Body.order.status) { $addOnStatus = [string]$addOn.Body.order.status }
    Add-Check -Checks $checks -Name "recommended_add_on_purchase_intent_created" -Ok ($addOn.Status -eq 200) -Details "HTTP $($addOn.Status), product=$product"
} else {
    Add-Check -Checks $checks -Name "recommended_add_on_purchase_intent_created" -Ok $true -Details "no add-on recommended"
}

$orders = Invoke-MachineSignalJson -Method GET -Uri "$BaseUrl/v1/orders" -ApiKey $apiKey
$ordersCount = if ($orders.Body.orders) { @($orders.Body.orders).Count } else { 0 }
Add-Check -Checks $checks -Name "orders_reachable" -Ok (($orders.Status -eq 200) -and ($ordersCount -ge 1)) -Details "HTTP $($orders.Status), orders=$ordersCount"

$usage = Invoke-MachineSignalJson -Method GET -Uri "$BaseUrl/v1/usage" -ApiKey $apiKey
Add-Check -Checks $checks -Name "usage_reachable" -Ok ($usage.Status -eq 200) -Details "HTTP $($usage.Status)"
Add-Check -Checks $checks -Name "real_payment_guardrail_false" -Ok ($usage.Body.real_payment_executed -eq $false) -Details ([string]$usage.Body.real_payment_executed)
Add-Check -Checks $checks -Name "external_contact_guardrail_false" -Ok ($usage.Body.external_contact_executed -eq $false) -Details ([string]$usage.Body.external_contact_executed)

$ok = -not ($checks | Where-Object { -not $_.ok })
$result = [pscustomobject]@{
    ok = $ok
    monitor_name = "machinesignal_daily_machine_buyer_monitor"
    finished_at = (Get-Date).ToString("s")
    base_url = $BaseUrl
    public_site = $PublicSite
    sandbox_customer_id = $customerId
    sandbox_key_prefix = (Mask-Key $apiKey)
    checks = $checks
    score_summary = [pscustomobject]@{
        domain = $scoreBody.domain
        opportunity_score = $scoreBody.opportunity_score
        confidence = $scoreBody.confidence
        decision = $scoreBody.decision
        web_architect_status = $scoreBody.web_architect_review.status
        commercial_strength = $scoreBody.commercial_strength.level
        recommended_product = $product
    }
    orders_count = $ordersCount
    add_on_product = $product
    add_on_status = $addOnStatus
    real_payment_executed = $usage.Body.real_payment_executed
    external_contact_executed = $usage.Body.external_contact_executed
    output_dir = $outputDir
}

$summaryPath = Join-Path $outputDir ("summary_{0}.json" -f $stamp)
$reportPath = Join-Path $outputDir ("report_{0}.md" -f $stamp)
$fileOutputOk = $true
$fileOutputError = ""
try {
    $result | ConvertTo-Json -Depth 20 | Set-Content -LiteralPath $summaryPath -Encoding UTF8
} catch {
    $fileOutputOk = $false
    $fileOutputError = $_.Exception.Message
}

$checkRows = ($checks | ForEach-Object {
    $status = if ($_.ok) { "OK" } else { "FAIL" }
    "| $($_.name) | $status | $($_.details) |"
}) -join "`n"

$report = @"
# MachineSignal Daily Machine-Buyer Monitor

Finished at: $($result.finished_at)
Status: $(if ($ok) { "PASS" } else { "FAIL" })

## Score Summary

- Domain: ``$($result.score_summary.domain)``
- Opportunity score: ``$($result.score_summary.opportunity_score)``
- Confidence: ``$($result.score_summary.confidence)``
- Decision: ``$($result.score_summary.decision)``
- Web Architect status: ``$($result.score_summary.web_architect_status)``
- Commercial strength: ``$($result.score_summary.commercial_strength)``
- Recommended product: ``$($result.score_summary.recommended_product)``

## Checks

| Check | Result | Details |
|---|---|---|
$checkRows

## Guardrails

- Real payment executed: ``$($result.real_payment_executed)``
- External contact executed: ``$($result.external_contact_executed)``
"@

$result | Add-Member -NotePropertyName file_output_ok -NotePropertyValue $fileOutputOk -Force
$result | Add-Member -NotePropertyName file_output_error -NotePropertyValue $fileOutputError -Force
$result | Add-Member -NotePropertyName summary_path -NotePropertyValue $summaryPath -Force
$result | Add-Member -NotePropertyName report_path -NotePropertyValue $reportPath -Force

if ($fileOutputOk) {
    try {
        $report | Set-Content -LiteralPath $reportPath -Encoding UTF8
    } catch {
        $result.file_output_ok = $false
        $result.file_output_error = $_.Exception.Message
    }
}
$result | ConvertTo-Json -Depth 20
