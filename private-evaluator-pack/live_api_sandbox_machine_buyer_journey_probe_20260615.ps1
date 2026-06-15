$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

$baseUrl = "https://machinesignal-api.beta-878.workers.dev"
$runId = [guid]::NewGuid().ToString("N")
$checks = [ordered]@{}
$observations = [ordered]@{}

function Add-Check {
    param(
        [string]$Name,
        [bool]$Ok,
        [object]$Detail = $null
    )
    $checks[$Name] = [ordered]@{
        ok = $Ok
        detail = if ($null -eq $Detail) { "" } else { [string]$Detail }
    }
}

function Invoke-Json {
    param(
        [string]$Method,
        [string]$Path,
        [hashtable]$Headers = @{},
        [object]$Body = $null,
        [switch]$AllowHttpError
    )

    $uri = "$baseUrl$Path"
    $params = @{
        Uri = $uri
        Method = $Method
        Headers = $Headers
        UseBasicParsing = $true
        TimeoutSec = 30
    }
    if ($null -ne $Body) {
        $params.Body = ($Body | ConvertTo-Json -Depth 10)
        $params.ContentType = "application/json"
    }

    try {
        $response = Invoke-WebRequest @params
        $content = if ($response.Content) { $response.Content | ConvertFrom-Json } else { $null }
        return [ordered]@{
            status = [int]$response.StatusCode
            json = $content
            raw = $response.Content
        }
    } catch {
        $response = $_.Exception.Response
        if ($AllowHttpError -and $response) {
            $rawError = ""
            try {
                $stream = $response.GetResponseStream()
                if ($stream) {
                    $reader = New-Object System.IO.StreamReader($stream)
                    $rawError = $reader.ReadToEnd()
                    $reader.Close()
                }
            } catch {
                $rawError = ""
            }
            $jsonError = $null
            if (-not [string]::IsNullOrWhiteSpace($rawError)) {
                try {
                    $jsonError = $rawError | ConvertFrom-Json
                } catch {
                    $jsonError = $null
                }
            }
            return [ordered]@{
                status = [int]$response.StatusCode
                json = $jsonError
                raw = $rawError
            }
        }
        throw
    }
}

$health = Invoke-Json -Method "GET" -Path "/health"
Add-Check "health_200" ($health.status -eq 200) $health.status
Add-Check "health_beta_true" ($health.json.beta -eq $true) ($health.raw)

$unauth = Invoke-Json -Method "GET" -Path "/v1/onboarding" -AllowHttpError
Add-Check "unauthenticated_onboarding_401" ($unauth.status -eq 401) $unauth.status

$sandboxCreateBody = [ordered]@{
    evaluator_type = "ai_agent"
    integration_target = "synthetic CRM workflow"
    expected_test_path = "live_api_sandbox_machine_buyer_journey_probe"
}
$sandbox = Invoke-Json -Method "POST" -Path "/v1/sandbox/customers" -Headers @{
    "Idempotency-Key" = "live-api-sandbox-journey-$runId"
} -Body $sandboxCreateBody

$apiKey = [string]$sandbox.json.api_key
$customerId = [string]$sandbox.json.customer_id
$authHeaders = @{ "X-API-Key" = $apiKey }

Add-Check "sandbox_create_200" ($sandbox.status -eq 200) $sandbox.status
Add-Check "sandbox_api_key_returned_once_in_memory" (-not [string]::IsNullOrWhiteSpace($apiKey)) "redacted"
Add-Check "sandbox_customer_type" ($sandbox.json.customer_type -eq "sandbox") $sandbox.json.customer_type
Add-Check "sandbox_plan_limited" ($sandbox.json.plan -match "sandbox") $sandbox.json.plan
Add-Check "sandbox_usage_present" ($null -ne $sandbox.json.usage) "usage object present"

$observations.customer_id = $customerId
$observations.sandbox_key_redacted = $true
$observations.sandbox_expires_at = $sandbox.json.expires_at

$onboarding = Invoke-Json -Method "GET" -Path "/v1/onboarding" -Headers $authHeaders
Add-Check "authenticated_onboarding_200" ($onboarding.status -eq 200) $onboarding.status
Add-Check "authenticated_onboarding_mentions_customer" (($onboarding.raw -match [regex]::Escape($customerId)) -or ($onboarding.raw -match "sandbox")) ($onboarding.raw.Substring(0, [Math]::Min(200, $onboarding.raw.Length)))
Add-Check "authenticated_onboarding_has_safe_mode" ($onboarding.raw -match "sandbox|beta|test|real_payment_executed|external_contact") "safe onboarding language"

$scoreBody = [ordered]@{
    domain = "studio-dentale-sandbox.test"
    sector_hint = "dentist"
    country_hint = "IT"
}
$score = Invoke-Json -Method "POST" -Path "/v1/lead-opportunity-score" -Headers @{
    "X-API-Key" = $apiKey
    "Idempotency-Key" = "score-existing-list-$runId"
} -Body $scoreBody
Add-Check "score_endpoint_200" ($score.status -eq 200) $score.status
Add-Check "score_contains_opportunity_score" ($score.raw -match "opportunity_score") $score.raw
Add-Check "score_contains_confidence" ($score.raw -match "confidence") $score.raw
Add-Check "score_contains_decision_or_recommendation" ($score.raw -match "decision|recommended_next_purchase|recommended_next") $score.raw
Add-Check "score_no_real_payment" ($score.raw -match '"real_payment_executed"\s*:\s*false' -or $score.raw -notmatch '"real_payment_executed"\s*:\s*true') $score.raw
Add-Check "score_no_external_contact" ($score.raw -match '"external_contact_executed"\s*:\s*false' -or $score.raw -notmatch '"external_contact_executed"\s*:\s*true') $score.raw

$targetDiscoveryBody = [ordered]@{
    product_code = "target_discovery"
    market = "agenzie immobiliari"
    area = "Lombardia"
    commercial_objective = "find agency websites worth scoring for digital presence improvement opportunities"
    source_score_request_id = $null
    reason = "Synthetic buyer machine has no existing list and needs coherent targets before scoring"
}
$targetDiscovery = Invoke-Json -Method "POST" -Path "/v1/purchase-intent" -Headers @{
    "X-API-Key" = $apiKey
    "Idempotency-Key" = "target-discovery-no-list-$runId"
} -Body $targetDiscoveryBody
Add-Check "target_discovery_purchase_intent_200" ($targetDiscovery.status -eq 200) $targetDiscovery.status
Add-Check "target_discovery_mentions_product" ($targetDiscovery.raw -match "target_discovery|target_discovery_pack_250") $targetDiscovery.raw
Add-Check "target_discovery_price_matches_public_catalog_249" ($targetDiscovery.raw -match '"beta_price_range_eur"\s*:\s*"249"') $targetDiscovery.raw
Add-Check "target_discovery_no_real_payment" ($targetDiscovery.raw -match '"real_payment_executed"\s*:\s*false') $targetDiscovery.raw
Add-Check "target_discovery_no_external_contact" ($targetDiscovery.raw -match '"external_contact_executed"\s*:\s*false' -or $targetDiscovery.raw -notmatch '"external_contact_executed"\s*:\s*true') $targetDiscovery.raw
Add-Check "target_discovery_delivery_or_usage_present" ($targetDiscovery.raw -match "delivery|usage|what_is_included|validity") $targetDiscovery.raw

$actionPackBody = [ordered]@{
    product_code = "action_pack"
    domain = "studio-dentale-sandbox.test"
    reason = "Synthetic test: action pack should not proceed without a valid Deep Analysis source"
}
$actionPack = Invoke-Json -Method "POST" -Path "/v1/purchase-intent" -Headers @{
    "X-API-Key" = $apiKey
    "Idempotency-Key" = "action-pack-missing-gate-$runId"
} -Body $actionPackBody -AllowHttpError
Add-Check "action_pack_gate_response_is_controlled_error" ($actionPack.status -in @(400, 409, 422)) $actionPack.status
Add-Check "action_pack_gate_blocks_without_source" ($actionPack.status -in @(400, 409, 422) -or $actionPack.raw -match "action_pack_gate_failed|gate_failed|source_order_intent_id|required|no credit|consumes no credit") $actionPack.raw
Add-Check "action_pack_no_real_payment" ($actionPack.raw -match '"real_payment_executed"\s*:\s*false' -or $actionPack.raw -notmatch '"real_payment_executed"\s*:\s*true') $actionPack.raw
Add-Check "action_pack_no_external_contact" ($actionPack.raw -match '"external_contact_executed"\s*:\s*false' -or $actionPack.raw -notmatch '"external_contact_executed"\s*:\s*true') $actionPack.raw

$usage = Invoke-Json -Method "GET" -Path "/v1/usage" -Headers $authHeaders
Add-Check "usage_200" ($usage.status -eq 200) $usage.status
Add-Check "usage_mentions_customer" ($usage.raw -match [regex]::Escape($customerId) -or $usage.raw -match "score_pack_1k|target_discovery") $usage.raw
Add-Check "usage_no_real_payment_true" ($usage.raw -notmatch '"real_payment_executed"\s*:\s*true') $usage.raw
Add-Check "usage_no_external_contact_true" ($usage.raw -notmatch '"external_contact_executed"\s*:\s*true') $usage.raw

$combinedRaw = @(
    $health.raw,
    $onboarding.raw,
    $score.raw,
    $targetDiscovery.raw,
    $actionPack.raw,
    $usage.raw
) -join "`n"

foreach ($phrase in @(
    '"real_payment_executed":true',
    '"external_contact_executed":true',
    '"production_api_key":true',
    '"payment_method_collection":true',
    '"invoice_issued":true',
    'go-live approved',
    'commercial_status":"live'
)) {
    $key = "forbidden_absent_" + (($phrase -replace "[^a-zA-Z0-9]+", "_").Trim("_"))
    Add-Check $key (-not (($combinedRaw -replace "\s","").ToLowerInvariant().Contains(($phrase -replace "\s","").ToLowerInvariant()))) $phrase
}

$failed = @($checks.GetEnumerator() | Where-Object { -not $_.Value.ok })
$safeChecks = [ordered]@{}
foreach ($item in $checks.GetEnumerator()) {
    $detail = $item.Value.detail
    if ($apiKey) {
        $detail = $detail -replace [regex]::Escape($apiKey), "[REDACTED_API_KEY]"
    }
    $safeChecks[$item.Key] = [ordered]@{
        ok = $item.Value.ok
        detail = if ($detail.Length -gt 700) { $detail.Substring(0, 700) + "...[truncated]" } else { $detail }
    }
}

$result = [ordered]@{
    checked_at_utc = (Get-Date).ToUniversalTime().ToString("s") + "Z"
    test_id = "live_api_sandbox_machine_buyer_journey_probe_20260615"
    base_url = $baseUrl
    observations = $observations
    checks = $safeChecks
    pass_count = @($checks.GetEnumerator() | Where-Object { $_.Value.ok }).Count
    total_count = $checks.Count
    status = if ($failed.Count -eq 0) { "PASS" } else { "FAIL" }
    failed_checks = @($failed | ForEach-Object { $_.Key })
    api_key_redacted = $true
    recommended_next_step = "agent_review_after_live_api_sandbox_probe"
}

$reportPath = Join-Path $PSScriptRoot "live_api_sandbox_machine_buyer_journey_probe_report_20260615.md"
$summaryPath = Join-Path $PSScriptRoot "live_api_sandbox_machine_buyer_journey_probe_summary_20260615.json"

$report = @(
    "# Live API Sandbox Machine Buyer Journey Probe - 2026-06-15",
    "",
    "Status: $($result.status)",
    "Checks: $($result.pass_count)/$($result.total_count)",
    "Sandbox customer: $customerId",
    "API key: redacted, not stored",
    "",
    "## Failed Checks",
    "",
    $(if ($failed.Count -eq 0) { "None." } else { ($failed | ForEach-Object { "- $($_.Key)" }) -join "`n" }),
    "",
    "## Interpretation",
    "",
    "The live sandbox API supports a machine buyer journey using synthetic data: sandbox key creation, authenticated onboarding, Score Pack flow, Target Discovery flow and Action Pack gate protection.",
    "",
    "## Safety",
    "",
    "No real payment, invoice, payment method collection, external outreach, production API key or real customer data was used.",
    "",
    "## Recommended Next Step",
    "",
    $result.recommended_next_step
) -join "`n"

$report | Set-Content -LiteralPath $reportPath -Encoding UTF8
$result | ConvertTo-Json -Depth 10 | Set-Content -LiteralPath $summaryPath -Encoding UTF8

if ($failed.Count -gt 0) {
    throw "Live API sandbox machine buyer journey probe failed: $($result.failed_checks -join ', ')"
}

Write-Output "PASS $($result.pass_count)/$($result.total_count)"
