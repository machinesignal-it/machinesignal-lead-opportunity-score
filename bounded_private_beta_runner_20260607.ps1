param(
    [ValidateSet("NoWrite", "Full")]
    [string]$Mode = "NoWrite",
    [switch]$ConfirmFullRun,
    [string]$BaseUrl = "https://machinesignal-api.beta-878.workers.dev",
    [string]$PublicSite = "https://machinesignal.it",
    [string]$ReadinessUrl = "https://machinesignal.it/readiness-dashboard/readiness.json",
    [string]$AdminKeyPath = (Join-Path $env:APPDATA "MachineSignal\machinesignal_admin_api_key.dpapi"),
    [int]$MaxScores = 5,
    [int]$MaxDeepAnalysis = 1,
    [int]$MaxActionPack = 1,
    [string]$OutputJson = "bounded_private_beta_runner_summary_20260607.json",
    [string]$OutputMarkdown = "bounded_private_beta_runner_report_20260607.md"
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

function Invoke-MachineSignalJson {
    param(
        [string]$Method,
        [string]$Uri,
        [hashtable]$Headers = @{},
        [object]$Body = $null,
        [int]$TimeoutSec = 45
    )

    $args = @{
        Method = $Method
        Uri = $Uri
        Headers = $Headers
        TimeoutSec = $TimeoutSec
        UseBasicParsing = $true
    }

    if ($null -ne $Body) {
        $args.ContentType = "application/json"
        $args.Body = ($Body | ConvertTo-Json -Depth 40)
    }

    try {
        $response = Invoke-WebRequest @args
        $parsed = $null
        if ($response.Content) {
            try {
                $parsed = $response.Content | ConvertFrom-Json
            } catch {
                $parsed = $null
            }
        }
        return [pscustomobject]@{
            ok = $true
            status = [int]$response.StatusCode
            body = $parsed
            raw = $response.Content
            error = $null
        }
    } catch {
        $status = 0
        $parsed = $null
        $text = ""
        if ($_.Exception.Response) {
            $status = [int]$_.Exception.Response.StatusCode
            try {
                $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
                $text = $reader.ReadToEnd()
                if ($text) { $parsed = $text | ConvertFrom-Json }
            } catch {}
        }
        return [pscustomobject]@{
            ok = $false
            status = $status
            body = $parsed
            raw = $text
            error = $_.Exception.Message
        }
    }
}

function Write-Utf8NoBom {
    param([string]$Path, [string]$Text)
    $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText((Join-Path (Get-Location) $Path), $Text, $utf8NoBom)
}

function Get-Balance {
    param(
        [object]$Usage,
        [string]$ProductCode
    )
    if (-not $Usage -or -not $Usage.balances) { return $null }
    return @($Usage.balances | Where-Object { $_.product_code -eq $ProductCode } | Select-Object -First 1)[0]
}

function Add-Check {
    param(
        [System.Collections.ArrayList]$Checks,
        [string]$Name,
        [bool]$Ok,
        [string]$Details
    )
    [void]$Checks.Add([ordered]@{
        name = $Name
        ok = $Ok
        details = $Details
    })
}

function Test-TextContains {
    param(
        [string]$Text,
        [string]$Needle
    )
    return $Text.IndexOf($Needle, [StringComparison]::OrdinalIgnoreCase) -ge 0
}

function Write-Reports {
    param([object]$Summary)

    Write-Utf8NoBom -Path $OutputJson -Text ($Summary | ConvertTo-Json -Depth 80)

    $checkRows = @()
    foreach ($check in $Summary.checks) {
        $status = if ($check.ok) { "OK" } else { "FAIL" }
        $checkRows += "| $($check.name) | $status | $($check.details) |"
    }
    $checksTable = $checkRows -join "`n"

    $scoreRows = @()
    foreach ($score in $Summary.full_run.score_results) {
        $scoreRows += "| $($score.domain) | $($score.opportunity_score) | $($score.decision) | $($score.commercial_strength_level) | $($score.next_product) |"
    }
    if (-not $scoreRows) {
        $scoreRows = @("| n/a | n/a | n/a | n/a | n/a |")
    }
    $scoresTable = $scoreRows -join "`n"

    $md = @"
# MachineSignal Bounded Private Beta Runner - 2026-06-07

Status: $($Summary.status)

Mode: $($Summary.mode)

Base URL: $($Summary.base_url)

## Limits

- Max score calls: $($Summary.limits.max_scores)
- Max Deep Analysis orders: $($Summary.limits.max_deep_analysis)
- Max Action Pack orders: $($Summary.limits.max_action_pack)
- External contact allowed: false
- Real payment allowed: false

## Checks

| Check | Status | Details |
|---|---|---|
$checksTable

## Full Run Results

| Domain | Score | Decision | Strength | Next product |
|---|---:|---|---|---|
$scoresTable

## Credit Deltas

- Score delta: $($Summary.full_run.credit_deltas.score_pack_1k)
- Deep Analysis delta: $($Summary.full_run.credit_deltas.deep_analysis_pack_100)
- Action Pack delta: $($Summary.full_run.credit_deltas.action_pack_25)

## Safety

- Real payment executed: $($Summary.safety.real_payment_executed)
- External contact executed: $($Summary.safety.external_contact_executed)
- Real invoice issued: $($Summary.safety.real_invoice_issued)
- Write calls executed: $($Summary.write_calls_executed)

## Interpretation

This runner is the operating guardrail for the next private beta test. In NoWrite mode it only verifies public discovery, documentation and readiness. In Full mode it requires explicit confirmation and enforces hard limits before creating a beta customer, scoring targets, buying at most one Deep Analysis and buying at most one Action Pack only after the Deep Analysis order gate passes.

## Recommended Next Step

$($Summary.recommended_next_step)
"@
    Write-Utf8NoBom -Path $OutputMarkdown -Text $md
}

$runStamp = (Get-Date).ToString("yyyyMMddHHmmss")
$checks = New-Object System.Collections.ArrayList
$summary = [ordered]@{
    ok = $false
    status = "started"
    mode = $Mode
    generated_at = (Get-Date).ToUniversalTime().ToString("o")
    run_stamp = $runStamp
    base_url = $BaseUrl
    public_site = $PublicSite
    readiness_url = $ReadinessUrl
    primary_customer_interface = "machine"
    limits = [ordered]@{
        max_scores = $MaxScores
        max_deep_analysis = $MaxDeepAnalysis
        max_action_pack = $MaxActionPack
        max_real_payments = 0
        max_external_contacts = 0
    }
    checks = @()
    write_calls_executed = 0
    safety = [ordered]@{
        real_payment_executed = $false
        external_contact_executed = $false
        real_invoice_issued = $false
    }
    full_run = [ordered]@{
        customer_id = $null
        score_results = @()
        deep_analysis_order = $null
        blocked_action_pack_without_deep = $null
        action_pack_order = $null
        usage_before = $null
        usage_after = $null
        credit_deltas = [ordered]@{
            score_pack_1k = 0
            deep_analysis_pack_100 = 0
            action_pack_25 = 0
        }
    }
    recommended_next_step = "Run NoWrite first. Run Full only after explicit user approval because it consumes bounded beta credits."
}

try {
    $health = Invoke-MachineSignalJson -Method GET -Uri "$BaseUrl/health"
    Add-Check -Checks $checks -Name "worker_health_reachable" -Ok ($health.status -eq 200) -Details "HTTP $($health.status)"

    $workerLlms = Invoke-MachineSignalJson -Method GET -Uri "$BaseUrl/llms.txt"
    $workerLlmsText = [string]$workerLlms.raw
    Add-Check -Checks $checks -Name "worker_llms_action_pack_gate" -Ok (Test-TextContains -Text $workerLlmsText -Needle "action_pack requires source_order_intent_id") -Details "Worker llms.txt exposes Action Pack gate."

    $siteLlms = Invoke-MachineSignalJson -Method GET -Uri "$PublicSite/llms.txt"
    $siteLlmsText = [string]$siteLlms.raw
    Add-Check -Checks $checks -Name "site_llms_dentists_pack" -Ok (Test-TextContains -Text $siteLlmsText -Needle "dentists-beta-machine-buyer-pack.json") -Details "Public llms.txt exposes dentists beta pack."
    Add-Check -Checks $checks -Name "site_llms_mcp_wrapper" -Ok (Test-TextContains -Text $siteLlmsText -Needle "mcp/machinesignal-mcp-wrapper.json") -Details "Public llms.txt exposes MCP wrapper."

    $openApi = Invoke-MachineSignalJson -Method GET -Uri "$PublicSite/openapi.json"
    $openApiText = [string]$openApi.raw
    Add-Check -Checks $checks -Name "openapi_action_pack_gate_documented" -Ok ((Test-TextContains -Text $openApiText -Needle "source_order_intent_id") -and (Test-TextContains -Text $openApiText -Needle "action_pack_gate")) -Details "OpenAPI documents source_order_intent_id and action_pack_gate."

    $postman = Invoke-MachineSignalJson -Method GET -Uri "$PublicSite/postman_public_collection.json"
    $postmanText = [string]$postman.raw
    Add-Check -Checks $checks -Name "postman_action_pack_gate_documented" -Ok ((Test-TextContains -Text $postmanText -Needle "action_pack_gate_failed") -and (Test-TextContains -Text $postmanText -Needle "order_intent_id")) -Details "Postman public collection includes gate instruction and variable."

    $readiness = Invoke-MachineSignalJson -Method GET -Uri "$ReadinessUrl"
    $readinessBody = $readiness.body
    $readinessOk =
        $readiness.status -eq 200 -and
        $readinessBody.controlled_beta_status -eq "ready_for_controlled_beta" -and
        $readinessBody.real_payment_status -eq "blocked_for_real_payments" -and
        $readinessBody.real_payment_enabled -eq $false -and
        $readinessBody.external_contact_enabled -eq $false
    Add-Check -Checks $checks -Name "readiness_gate" -Ok $readinessOk -Details "controlled_beta=$($readinessBody.controlled_beta_status), real_payment=$($readinessBody.real_payment_status)"

    $kvProfile = Invoke-MachineSignalJson -Method GET -Uri "$PublicSite/kv-write-budget-profile.json"
    $kvOk =
        $kvProfile.status -eq 200 -and
        $kvProfile.body.default_monitor_policy.mode -eq "NoWrite" -and
        [int]$kvProfile.body.default_monitor_policy.write_calls_executed -eq 0
    Add-Check -Checks $checks -Name "kv_nowrite_default" -Ok $kvOk -Details "mode=$($kvProfile.body.default_monitor_policy.mode)"

    if ($Mode -eq "NoWrite") {
        $summary.status = "completed_nowrite"
        $summary.write_calls_executed = 0
        $summary.recommended_next_step = "NoWrite preflight is ready. The next step is to request an explicit Full run when you want to spend a very small bounded amount of beta credits."
    } else {
        if (-not $ConfirmFullRun) {
            Add-Check -Checks $checks -Name "full_run_confirmation" -Ok $false -Details "Full mode requires -ConfirmFullRun."
            $summary.status = "blocked_missing_full_confirmation"
            $summary.recommended_next_step = "Re-run with -Mode Full -ConfirmFullRun only after confirming you want to consume bounded beta credits."
        } elseif (-not $readinessOk) {
            Add-Check -Checks $checks -Name "full_run_readiness" -Ok $false -Details "Readiness gate blocked Full mode."
            $summary.status = "blocked_by_readiness_gate"
            $summary.recommended_next_step = "Fix readiness blockers before consuming credits."
        } else {
            $adminKey = ConvertFrom-StoredSecureString -Path $AdminKeyPath
            $customerId = "bounded_private_beta_$runStamp".ToLowerInvariant()
            $adminHeaders = @{
                "X-API-Key" = $adminKey
                "Content-Type" = "application/json"
                "Idempotency-Key" = "bounded-private-beta-customer-$runStamp"
            }

            $customer = Invoke-MachineSignalJson -Method POST -Uri "$BaseUrl/v1/beta/customers" -Headers $adminHeaders -Body @{
                customer_id = $customerId
                contact_email = "bounded-private-beta@example.com"
                plan = "bounded_private_beta_runner"
                score_credits = $MaxScores
                deep_analysis_credits = $MaxDeepAnalysis
                action_pack_credits = $MaxActionPack
                verification_credits = 0
                nurture_signal_credits = 0
                target_discovery_credits = 0
                domain_enrichment_credits = 0
                opportunity_feed_credits = 0
            }
            $summary.write_calls_executed += 1
            $summary.full_run.customer_id = $customerId
            Add-Check -Checks $checks -Name "full_customer_created" -Ok ($customer.status -eq 200 -and $customer.body.api_key) -Details "HTTP $($customer.status), customer=$customerId"

            $customerKey = [string]$customer.body.api_key
            $customerHeaders = @{
                "X-API-Key" = $customerKey
                "Content-Type" = "application/json"
            }

            $usageBefore = Invoke-MachineSignalJson -Method GET -Uri "$BaseUrl/v1/usage" -Headers @{ "X-API-Key" = $customerKey }
            $summary.full_run.usage_before = $usageBefore.body

            $targets = @(
                @{ domain = "bounded-dental-clinic-demo.it"; sector_hint = "dentist"; target_name = "Bounded Dental Clinic Demo"; category_hint = "studio dentistico"; initial_signals = "sector_match;local_market;business_domain_present;official_site;service_keyword_present;website_opportunity;weak_cta;conversion_friction" },
                @{ domain = "bounded-legal-studio-demo.it"; sector_hint = "studio legale"; target_name = "Bounded Legal Studio Demo"; category_hint = "studio legale"; initial_signals = "sector_match;local_market;business_domain_present;official_site;service_keyword_present" },
                @{ domain = "bounded-solar-installer-demo.it"; sector_hint = "fotovoltaico impianti"; target_name = "Bounded Solar Installer Demo"; category_hint = "impianti fotovoltaici"; initial_signals = "sector_match;local_market;business_domain_present;official_site;service_keyword_present" },
                @{ domain = "bounded-aesthetic-clinic-demo.it"; sector_hint = "medicina estetica"; target_name = "Bounded Aesthetic Clinic Demo"; category_hint = "medicina estetica"; initial_signals = "sector_match;local_market;business_domain_present;official_site;service_keyword_present" },
                @{ domain = "bounded-real-estate-demo.it"; sector_hint = "agenzia immobiliare"; target_name = "Bounded Real Estate Demo"; category_hint = "agenzia immobiliare"; initial_signals = "sector_match;local_market;business_domain_present;official_site;service_keyword_present" }
            ) | Select-Object -First $MaxScores

            foreach ($target in $targets) {
                $score = Invoke-MachineSignalJson -Method POST -Uri "$BaseUrl/v1/lead-opportunity-score" -Headers ($customerHeaders + @{
                    "Idempotency-Key" = "bounded-private-beta-score-$runStamp-$($target.domain)"
                }) -Body @{
                    domain = $target.domain
                    sector_hint = $target.sector_hint
                    country_hint = "IT"
                    target_name = $target.target_name
                    category_hint = $target.category_hint
                    source_type = "bounded_private_beta_runner"
                    initial_signals = $target.initial_signals
                }
                $summary.write_calls_executed += 1
                $summary.full_run.score_results += [ordered]@{
                    domain = $target.domain
                    http_status = $score.status
                    opportunity_score = $score.body.opportunity_score
                    decision = $score.body.decision
                    commercial_strength_level = $score.body.commercial_strength.level
                    next_product = $score.body.next_purchase.next_product
                    request_id = $score.body.request_id
                }
            }

            $selected = @($summary.full_run.score_results | Sort-Object -Property @{ Expression = { [double]$_.opportunity_score }; Descending = $true } | Select-Object -First 1)[0]
            if ($selected -and $MaxDeepAnalysis -gt 0) {
                $deep = Invoke-MachineSignalJson -Method POST -Uri "$BaseUrl/v1/purchase-intent" -Headers ($customerHeaders + @{
                    "Idempotency-Key" = "bounded-private-beta-deep-$runStamp"
                }) -Body @{
                    product_code = "deep_analysis"
                    domain = $selected.domain
                    sector_hint = "dentist"
                    area = "Italy"
                    commercial_objective = "decide whether this scored domain deserves a CRM-ready Action Pack"
                    source_score_request_id = $selected.request_id
                    reason = "Bounded private beta runner selected the strongest scored target for one Deep Analysis"
                    max_budget_eur = 3
                }
                $summary.write_calls_executed += 1
                $summary.full_run.deep_analysis_order = [ordered]@{
                    http_status = $deep.status
                    product_code = $deep.body.product_code
                    order_intent_id = $deep.body.order_intent_id
                    domain = $deep.body.domain
                    delivery_type = $deep.body.delivery.delivery_type
                    recommended_next_product = $deep.body.delivery.recommended_next_step.product_code
                }
                Add-Check -Checks $checks -Name "full_deep_analysis_cap" -Ok ($summary.full_run.deep_analysis_order.product_code -eq "deep_analysis") -Details "Deep Analysis orders <= $MaxDeepAnalysis."

                $blockedAction = Invoke-MachineSignalJson -Method POST -Uri "$BaseUrl/v1/purchase-intent" -Headers ($customerHeaders + @{
                    "Idempotency-Key" = "bounded-private-beta-action-blocked-$runStamp"
                }) -Body @{
                    product_code = "action_pack"
                    domain = $selected.domain
                    source_score_request_id = $selected.request_id
                    reason = "Negative gate test: missing Deep Analysis source order"
                    max_budget_eur = 10
                }
                $summary.full_run.blocked_action_pack_without_deep = [ordered]@{
                    http_status = $blockedAction.status
                    error = $blockedAction.body.error
                    details = $blockedAction.body.details
                }
                $blockedActionGateOk =
                    $blockedAction.status -eq 400 -and (
                        $blockedAction.body.error -eq "action_pack_gate_failed" -or
                        (Test-TextContains -Text ([string]$blockedAction.raw) -Needle "action_pack_gate_failed") -or
                        -not $blockedAction.body.error
                    )
                Add-Check -Checks $checks -Name "full_action_pack_missing_gate_blocked" -Ok $blockedActionGateOk -Details "Blocked Action Pack without source_order_intent_id; HTTP $($blockedAction.status)."

                if ($MaxActionPack -gt 0) {
                    $action = Invoke-MachineSignalJson -Method POST -Uri "$BaseUrl/v1/purchase-intent" -Headers ($customerHeaders + @{
                        "Idempotency-Key" = "bounded-private-beta-action-valid-$runStamp"
                    }) -Body @{
                        product_code = "action_pack"
                        domain = $selected.domain
                        source_score_request_id = $selected.request_id
                        source_order_intent_id = $deep.body.order_intent_id
                        reason = "Bounded private beta runner: Deep Analysis gate passed"
                        max_budget_eur = 10
                    }
                    $summary.write_calls_executed += 1
                    $summary.full_run.action_pack_order = [ordered]@{
                        http_status = $action.status
                        product_code = $action.body.product_code
                        order_intent_id = $action.body.order_intent_id
                        gate_passed = $action.body.action_pack_gate.passed
                        delivery_type = $action.body.delivery.delivery_type
                        external_contact_executed = $action.body.external_contact_executed
                    }
                    Add-Check -Checks $checks -Name "full_action_pack_gate_passed" -Ok ($action.status -eq 200 -and $action.body.action_pack_gate.passed -eq $true) -Details "Action Pack created only after Deep Analysis gate."
                }
            }

            $usageAfter = Invoke-MachineSignalJson -Method GET -Uri "$BaseUrl/v1/usage" -Headers @{ "X-API-Key" = $customerKey }
            $summary.full_run.usage_after = $usageAfter.body

            foreach ($product in @("score_pack_1k", "deep_analysis_pack_100", "action_pack_25")) {
                $before = Get-Balance -Usage $usageBefore.body -ProductCode $product
                $after = Get-Balance -Usage $usageAfter.body -ProductCode $product
                $delta = if ($before -and $after) { [int]$before.credits_remaining - [int]$after.credits_remaining } else { 0 }
                $summary.full_run.credit_deltas[$product] = $delta
            }

            Add-Check -Checks $checks -Name "full_score_cap" -Ok ([int]$summary.full_run.credit_deltas.score_pack_1k -le $MaxScores) -Details "score_delta=$($summary.full_run.credit_deltas.score_pack_1k)"
            Add-Check -Checks $checks -Name "full_deep_cap" -Ok ([int]$summary.full_run.credit_deltas.deep_analysis_pack_100 -le $MaxDeepAnalysis) -Details "deep_delta=$($summary.full_run.credit_deltas.deep_analysis_pack_100)"
            Add-Check -Checks $checks -Name "full_action_cap" -Ok ([int]$summary.full_run.credit_deltas.action_pack_25 -le $MaxActionPack) -Details "action_delta=$($summary.full_run.credit_deltas.action_pack_25)"
            Add-Check -Checks $checks -Name "full_no_payment_or_outreach" -Ok ($usageAfter.body.real_payment_executed -eq $false -and $usageAfter.body.external_contact_executed -eq $false) -Details "payment=$($usageAfter.body.real_payment_executed), external_contact=$($usageAfter.body.external_contact_executed)"

            $summary.safety.real_payment_executed = [bool]$usageAfter.body.real_payment_executed
            $summary.safety.external_contact_executed = [bool]$usageAfter.body.external_contact_executed
            $summary.status = "completed_full"
            $summary.recommended_next_step = "Review Full run results. If all caps and guardrails passed, use the results as the first bounded private beta evidence pack."
        }
    }

    $summary.checks = @($checks)
    $summary.ok = (@($checks | Where-Object { $_.ok -eq $false }).Count -eq 0)
    if (-not $summary.ok -and $summary.status -eq "completed_nowrite") {
        $summary.status = "nowrite_checks_failed"
    }
} catch {
    $summary.status = "error"
    $summary.error = $_.Exception.Message
    $summary.checks = @($checks)
}

Write-Reports -Summary $summary
$summary | ConvertTo-Json -Depth 80
