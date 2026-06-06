param(
    [string]$PublicSite = "https://machinesignal.it",
    [string]$OutputPrefix = "machine_buyer_routing_decision_probe_20260606"
)

$ErrorActionPreference = "Stop"

function Add-Check {
    param(
        [System.Collections.Generic.List[object]]$Checks,
        [string]$Name,
        [bool]$Ok,
        [string]$Details
    )
    $Checks.Add([pscustomobject]@{
        name = $Name
        ok = $Ok
        details = $Details
    })
}

function Get-ContentText {
    param($Response)
    if ($Response.Content -is [byte[]]) {
        return [System.Text.Encoding]::UTF8.GetString($Response.Content)
    }
    return [string]$Response.Content
}

function Get-Url {
    param([string]$Url)
    $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -Headers @{ "Cache-Control" = "no-cache" } -TimeoutSec 25
    [pscustomobject]@{
        url = $Url
        status = [int]$response.StatusCode
        content = Get-ContentText $response
    }
}

function Has-Text {
    param([string]$Text, [string]$Needle)
    return $Text.IndexOf($Needle, [System.StringComparison]::OrdinalIgnoreCase) -ge 0
}

function Test-AllowedProduct {
    param($Score, [string]$ProductCode)
    $allowed = @($Score.commercial_strength.allowed_next_products)
    return $allowed -contains $ProductCode
}

function Get-ScoreRoutingDecision {
    param($Score)

    $decision = [string]$Score.decision
    $level = [string]$Score.commercial_strength.level
    $nextProduct = if ($Score.next_purchase -and $Score.next_purchase.next_product) { [string]$Score.next_purchase.next_product } else { $null }

    if ($decision -eq "discard" -or $level -eq "weak") {
        return [pscustomobject]@{
            route = "discard"
            buy_product = $null
            action_pack_allowed = $false
            reason = "Weak or discarded score: do not spend more budget."
        }
    }

    if ($decision -eq "watchlist") {
        return [pscustomobject]@{
            route = "watchlist"
            buy_product = $null
            action_pack_allowed = $false
            reason = "Monitor the lead; do not buy paid add-ons now."
        }
    }

    if ($decision -eq "nurture") {
        return [pscustomobject]@{
            route = "nurturing"
            buy_product = if ($nextProduct -eq "nurture_signal" -and (Test-AllowedProduct -Score $Score -ProductCode "nurture_signal")) { "nurture_signal" } else { $null }
            action_pack_allowed = $false
            reason = "Save for nurturing; Action Pack is blocked."
        }
    }

    if ($decision -eq "needs_verification") {
        return [pscustomobject]@{
            route = "request_verification"
            buy_product = if ($nextProduct -eq "verification" -and (Test-AllowedProduct -Score $Score -ProductCode "verification")) { "verification" } else { $null }
            action_pack_allowed = $false
            reason = "Verify data quality before any further spend."
        }
    }

    if ($decision -eq "buy_deep_analysis" -and $nextProduct -eq "deep_analysis" -and (Test-AllowedProduct -Score $Score -ProductCode "deep_analysis")) {
        return [pscustomobject]@{
            route = "buy_deep_analysis"
            buy_product = "deep_analysis"
            action_pack_allowed = $false
            reason = "Buy Deep Analysis first; Action Pack remains blocked until deep gates pass."
        }
    }

    return [pscustomobject]@{
        route = "watchlist"
        buy_product = $null
        action_pack_allowed = $false
        reason = "Fallback to watchlist because score routing was not sufficient for spend."
    }
}

function Get-DeepRoutingDecision {
    param($Deep)

    $gate = $Deep.action_pack_purchase_gate
    $status = [string]$gate.status
    $failed = @($gate.failed_gates)
    $passed = @($gate.passed_gates)

    if (($status -eq "confirmed" -or $status -eq "pass") -and $failed.Count -eq 0 -and $passed.Count -ge 5) {
        return [pscustomobject]@{
            route = "buy_action_pack"
            buy_product = "action_pack"
            action_pack_allowed = $true
            reason = "Deep Analysis confirms all gates."
        }
    }

    if ($status -eq "partial" -or $status -eq "conditional") {
        return [pscustomobject]@{
            route = "watchlist"
            buy_product = $null
            action_pack_allowed = $false
            reason = "Evidence is partial or conditional; keep in watchlist."
        }
    }

    return [pscustomobject]@{
        route = "block_action_pack"
        buy_product = $null
        action_pack_allowed = $false
        reason = "At least one gate failed or compliance/budget approval is missing."
    }
}

$checks = [System.Collections.Generic.List[object]]::new()
$fetched = @{}
$urls = @{
    llms = "$PublicSite/llms.txt"
    onboarding = "$PublicSite/machine-onboarding.json"
    product_catalog = "$PublicSite/product-catalog.json"
    evaluation_pack = "$PublicSite/machine_buyer_evaluation_pack_20260606.json"
    deep_analysis_brief = "$PublicSite/deep_analysis_commercial_partner_brief_20260606.json"
    openapi = "$PublicSite/openapi.json"
    sitemap = "$PublicSite/sitemap.xml"
}

foreach ($key in $urls.Keys) {
    $result = Get-Url -Url $urls[$key]
    $fetched[$key] = $result
    Add-Check -Checks $checks -Name "$key`_reachable" -Ok ($result.status -eq 200) -Details "HTTP $($result.status)"
}

$llms = $fetched["llms"].content
$onboardingText = $fetched["onboarding"].content
$productCatalogText = $fetched["product_catalog"].content
$evaluationPackText = $fetched["evaluation_pack"].content
$deepBriefText = $fetched["deep_analysis_brief"].content
$openapiText = $fetched["openapi"].content
$openapi = $openapiText | ConvertFrom-Json
[xml]$sitemapXml = $fetched["sitemap"].content

$leadScoreSchema = $openapi.components.schemas.LeadScoreResponse
$decisionEnum = @($leadScoreSchema.properties.decision.enum)
$purchaseEnum = @($openapi.components.schemas.PurchaseIntentRequest.properties.product_code.enum)
$requiredDecisionValues = @("discard", "watchlist", "nurture", "buy_deep_analysis", "needs_verification")
$requiredPurchaseCodes = @("verification", "nurture_signal", "deep_analysis", "action_pack")

foreach ($value in $requiredDecisionValues) {
    Add-Check -Checks $checks -Name "openapi_decision_enum_has_$value" -Ok ($decisionEnum -contains $value) -Details "decision enum contains $value"
}

foreach ($code in $requiredPurchaseCodes) {
    Add-Check -Checks $checks -Name "openapi_purchase_code_has_$code" -Ok ($purchaseEnum -contains $code) -Details "purchase-intent supports $code"
}

Add-Check -Checks $checks -Name "openapi_has_commercial_strength" -Ok (Has-Text $openapiText "commercial_strength") -Details "commercial_strength present"
Add-Check -Checks $checks -Name "openapi_has_spend_policy" -Ok (Has-Text $openapiText "spend_policy") -Details "spend_policy present"
Add-Check -Checks $checks -Name "openapi_has_next_purchase" -Ok (Has-Text $openapiText "next_purchase") -Details "next_purchase present"
Add-Check -Checks $checks -Name "evaluation_pack_has_score_response_shape" -Ok ((Has-Text $evaluationPackText "score_response_shape") -and (Has-Text $evaluationPackText "buy_deep_analysis")) -Details "score response routing example present"
Add-Check -Checks $checks -Name "evaluation_pack_has_deep_gate" -Ok ((Has-Text $evaluationPackText "action_pack_purchase_gate") -and (Has-Text $evaluationPackText "only if all gates pass")) -Details "deep gate example present"
Add-Check -Checks $checks -Name "deep_brief_has_routing_policy" -Ok ((Has-Text $deepBriefText "discard or watchlist") -and (Has-Text $deepBriefText "buy Deep Analysis") -and (Has-Text $deepBriefText "buy Action Pack")) -Details "weak/medium/strong policy present"
Add-Check -Checks $checks -Name "product_catalog_score_pack_returns_routing_fields" -Ok ((Has-Text $productCatalogText "spend_policy") -and (Has-Text $productCatalogText "recommended next product")) -Details "score pack returns routing fields"
Add-Check -Checks $checks -Name "llms_explains_routing_decisions" -Ok ((Has-Text $llms "discard") -and (Has-Text $llms "watchlist") -and (Has-Text $llms "nurture") -and (Has-Text $llms "buy_deep_analysis")) -Details "llms includes routing decisions"
Add-Check -Checks $checks -Name "onboarding_embeds_score_products" -Ok ((Has-Text $onboardingText "score_pack_1k") -and (Has-Text $onboardingText "deep_analysis") -and (Has-Text $onboardingText "action_pack")) -Details "onboarding embeds products"
Add-Check -Checks $checks -Name "sitemap_valid_xml" -Ok ($sitemapXml.urlset -ne $null) -Details "urlset present"

$scoreScenarios = @(
    [pscustomobject]@{
        name = "weak_discard"
        expected_route = "discard"
        expected_buy_product = $null
        score = [pscustomobject]@{
            decision = "discard"
            opportunity_score = 18
            confidence = 0.82
            commercial_strength = [pscustomobject]@{
                level = "weak"
                spend_policy = "do_not_spend"
                allowed_next_products = @()
            }
            next_purchase = [pscustomobject]@{ next_product = $null }
        }
    },
    [pscustomobject]@{
        name = "medium_watchlist"
        expected_route = "watchlist"
        expected_buy_product = $null
        score = [pscustomobject]@{
            decision = "watchlist"
            opportunity_score = 48
            confidence = 0.66
            commercial_strength = [pscustomobject]@{
                level = "medium"
                spend_policy = "watch_before_spend"
                allowed_next_products = @()
            }
            next_purchase = [pscustomobject]@{ next_product = $null }
        }
    },
    [pscustomobject]@{
        name = "medium_nurture"
        expected_route = "nurturing"
        expected_buy_product = $null
        score = [pscustomobject]@{
            decision = "nurture"
            opportunity_score = 57
            confidence = 0.7
            commercial_strength = [pscustomobject]@{
                level = "medium"
                spend_policy = "save_to_nurturing_no_action_pack"
                allowed_next_products = @()
            }
            next_purchase = [pscustomobject]@{ next_product = $null }
        }
    },
    [pscustomobject]@{
        name = "needs_verification"
        expected_route = "request_verification"
        expected_buy_product = "verification"
        score = [pscustomobject]@{
            decision = "needs_verification"
            opportunity_score = 63
            confidence = 0.52
            commercial_strength = [pscustomobject]@{
                level = "medium"
                spend_policy = "verify_before_spend"
                allowed_next_products = @("verification")
            }
            next_purchase = [pscustomobject]@{ next_product = "verification" }
        }
    },
    [pscustomobject]@{
        name = "strong_buy_deep_analysis"
        expected_route = "buy_deep_analysis"
        expected_buy_product = "deep_analysis"
        score = [pscustomobject]@{
            decision = "buy_deep_analysis"
            opportunity_score = 84
            confidence = 0.88
            commercial_strength = [pscustomobject]@{
                level = "strong"
                spend_policy = "buy_deep_analysis_then_consider_action_pack_if_deep_confirms"
                allowed_next_products = @("deep_analysis", "action_pack_after_deep_analysis")
            }
            next_purchase = [pscustomobject]@{ next_product = "deep_analysis" }
        }
    },
    [pscustomobject]@{
        name = "strong_score_does_not_allow_direct_action_pack"
        expected_route = "buy_deep_analysis"
        expected_buy_product = "deep_analysis"
        score = [pscustomobject]@{
            decision = "buy_deep_analysis"
            opportunity_score = 91
            confidence = 0.91
            commercial_strength = [pscustomobject]@{
                level = "strong"
                spend_policy = "buy_deep_analysis_then_consider_action_pack_if_deep_confirms"
                allowed_next_products = @("deep_analysis", "action_pack_after_deep_analysis")
            }
            next_purchase = [pscustomobject]@{ next_product = "deep_analysis" }
        }
    }
)

$scoreScenarioResults = @()
foreach ($scenario in $scoreScenarios) {
    $route = Get-ScoreRoutingDecision -Score $scenario.score
    $routeOk = $route.route -eq $scenario.expected_route
    $buyOk = [string]$route.buy_product -eq [string]$scenario.expected_buy_product
    $actionBlockedOk = -not [bool]$route.action_pack_allowed
    Add-Check -Checks $checks -Name "score_route_$($scenario.name)_route_ok" -Ok $routeOk -Details "expected=$($scenario.expected_route); actual=$($route.route)"
    Add-Check -Checks $checks -Name "score_route_$($scenario.name)_buy_product_ok" -Ok $buyOk -Details "expected=$($scenario.expected_buy_product); actual=$($route.buy_product)"
    Add-Check -Checks $checks -Name "score_route_$($scenario.name)_action_pack_blocked" -Ok $actionBlockedOk -Details "action_pack_allowed=$($route.action_pack_allowed)"
    $scoreScenarioResults += [pscustomobject]@{
        scenario = $scenario.name
        expected_route = $scenario.expected_route
        actual_route = $route.route
        expected_buy_product = $scenario.expected_buy_product
        actual_buy_product = $route.buy_product
        action_pack_allowed = $route.action_pack_allowed
        ok = ($routeOk -and $buyOk -and $actionBlockedOk)
        reason = $route.reason
    }
}

$deepScenarios = @(
    [pscustomobject]@{
        name = "deep_confirms_all_gates"
        expected_route = "buy_action_pack"
        expected_buy_product = "action_pack"
        deep = [pscustomobject]@{
            action_pack_purchase_gate = [pscustomobject]@{
                status = "confirmed"
                passed_gates = @("sector_fit", "digital_friction", "crm_or_workflow_destination", "customer_compliance_gate", "budget_approval")
                failed_gates = @()
            }
        }
    },
    [pscustomobject]@{
        name = "deep_partial_evidence"
        expected_route = "watchlist"
        expected_buy_product = $null
        deep = [pscustomobject]@{
            action_pack_purchase_gate = [pscustomobject]@{
                status = "partial"
                passed_gates = @("sector_fit", "digital_friction")
                failed_gates = @()
            }
        }
    },
    [pscustomobject]@{
        name = "deep_missing_compliance"
        expected_route = "block_action_pack"
        expected_buy_product = $null
        deep = [pscustomobject]@{
            action_pack_purchase_gate = [pscustomobject]@{
                status = "failed"
                passed_gates = @("sector_fit", "digital_friction", "crm_or_workflow_destination")
                failed_gates = @("customer_compliance_gate")
            }
        }
    },
    [pscustomobject]@{
        name = "deep_missing_budget_approval"
        expected_route = "block_action_pack"
        expected_buy_product = $null
        deep = [pscustomobject]@{
            action_pack_purchase_gate = [pscustomobject]@{
                status = "failed"
                passed_gates = @("sector_fit", "digital_friction", "crm_or_workflow_destination", "customer_compliance_gate")
                failed_gates = @("budget_approval")
            }
        }
    }
)

$deepScenarioResults = @()
foreach ($scenario in $deepScenarios) {
    $route = Get-DeepRoutingDecision -Deep $scenario.deep
    $routeOk = $route.route -eq $scenario.expected_route
    $buyOk = [string]$route.buy_product -eq [string]$scenario.expected_buy_product
    Add-Check -Checks $checks -Name "deep_route_$($scenario.name)_route_ok" -Ok $routeOk -Details "expected=$($scenario.expected_route); actual=$($route.route)"
    Add-Check -Checks $checks -Name "deep_route_$($scenario.name)_buy_product_ok" -Ok $buyOk -Details "expected=$($scenario.expected_buy_product); actual=$($route.buy_product)"
    $deepScenarioResults += [pscustomobject]@{
        scenario = $scenario.name
        expected_route = $scenario.expected_route
        actual_route = $route.route
        expected_buy_product = $scenario.expected_buy_product
        actual_buy_product = $route.buy_product
        action_pack_allowed = $route.action_pack_allowed
        ok = ($routeOk -and $buyOk)
        reason = $route.reason
    }
}

$failed = @($checks | Where-Object { -not $_.ok })
$summary = [pscustomobject]@{
    ok = ($failed.Count -eq 0)
    probe_name = "machine_buyer_routing_decision_probe"
    run_date = "2026-06-06"
    public_site = $PublicSite
    machine_path = @(
        "$PublicSite/llms.txt",
        "$PublicSite/openapi.json",
        "$PublicSite/machine_buyer_evaluation_pack_20260606.json",
        "$PublicSite/deep_analysis_commercial_partner_brief_20260606.json",
        "$PublicSite/product-catalog.json"
    )
    score_scenarios = $scoreScenarioResults
    deep_analysis_scenarios = $deepScenarioResults
    routing_policy = [pscustomobject]@{
        discard = "Do not spend more budget."
        watchlist = "Monitor without buying add-ons."
        nurturing = "Save internally for nurturing; Action Pack blocked."
        request_verification = "Buy verification only if next_purchase recommends verification and it is allowed."
        buy_deep_analysis = "Buy Deep Analysis first; Action Pack remains blocked."
        buy_action_pack = "Allowed only after Deep Analysis confirms all gates."
    }
    live_credits_consumed = 0
    real_payment_executed = $false
    external_contact_executed = $false
    checks = $checks
    failed_checks = $failed
    conclusion = if ($failed.Count -eq 0) {
        "PASS: a machine buyer can route score and Deep Analysis signals into discard, watchlist, nurturing, verification, Deep Analysis purchase or Action Pack blocking/approval without human email outreach."
    } else {
        "FAIL: one or more routing-decision checks failed."
    }
}

$jsonPath = "$OutputPrefix`_summary.json"
$mdPath = "$OutputPrefix`_report.md"
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText((Join-Path (Get-Location) $jsonPath), ($summary | ConvertTo-Json -Depth 20), $utf8NoBom)

$lines = [System.Collections.Generic.List[string]]::new()
$lines.Add("# Machine buyer routing decision probe - 2026-06-06")
$lines.Add("")
$lines.Add("## Scope")
$lines.Add("")
$lines.Add("This probe verifies whether a CRM workflow, AI agent or software buyer can turn MachineSignal score and Deep Analysis signals into the correct operational decision.")
$lines.Add("")
$lines.Add("## Result")
$lines.Add("")
$lines.Add("- Status: **$($summary.ok)**")
$lines.Add("- Score routing scenarios: $($scoreScenarioResults.Count)")
$lines.Add("- Deep Analysis gate scenarios: $($deepScenarioResults.Count)")
$lines.Add("- Live credits consumed: 0")
$lines.Add("- Real payment executed: false")
$lines.Add("- External contact executed: false")
$lines.Add("")
$lines.Add("## Score Routing")
$lines.Add("")
foreach ($scenario in $scoreScenarioResults) {
    $status = if ($scenario.ok) { "PASS" } else { "FAIL" }
    $buy = if ($scenario.actual_buy_product) { $scenario.actual_buy_product } else { "none" }
    $lines.Add(("- {0} - ``{1}``: route ``{2}``, buy ``{3}``, action_pack_allowed ``{4}``." -f $status, $scenario.scenario, $scenario.actual_route, $buy, $scenario.action_pack_allowed))
}
$lines.Add("")
$lines.Add("## Deep Analysis Gate Routing")
$lines.Add("")
foreach ($scenario in $deepScenarioResults) {
    $status = if ($scenario.ok) { "PASS" } else { "FAIL" }
    $buy = if ($scenario.actual_buy_product) { $scenario.actual_buy_product } else { "none" }
    $lines.Add(("- {0} - ``{1}``: route ``{2}``, buy ``{3}``, action_pack_allowed ``{4}``." -f $status, $scenario.scenario, $scenario.actual_route, $buy, $scenario.action_pack_allowed))
}
$lines.Add("")
$lines.Add("## Routing Policy")
$lines.Add("")
$lines.Add('- `discard`: do not spend more budget.')
$lines.Add('- `watchlist`: monitor without buying add-ons.')
$lines.Add('- `nurturing`: save internally for nurturing; Action Pack remains blocked.')
$lines.Add('- `request_verification`: buy verification only if `next_purchase` recommends it and it is allowed.')
$lines.Add('- `buy_deep_analysis`: buy Deep Analysis first; Action Pack remains blocked.')
$lines.Add('- `buy_action_pack`: allowed only after Deep Analysis confirms all gates.')
$lines.Add("")
$lines.Add("## Checks")
$lines.Add("")
foreach ($check in $checks) {
    $status = if ($check.ok) { "PASS" } else { "FAIL" }
    $lines.Add("- $status - $($check.name): $($check.details)")
}
$lines.Add("")
$lines.Add("## Interpretation")
$lines.Add("")
$lines.Add($summary.conclusion)
$lines.Add("")
$lines.Add("## Guardrails")
$lines.Add("")
$lines.Add("- This probe is read-only and does not call write endpoints.")
$lines.Add("- No product credits are consumed.")
$lines.Add("- No real payment is executed.")
$lines.Add("- No external contact or outreach is executed.")
$lines.Add('- `action_pack` is blocked until Deep Analysis confirms all required gates.')

[System.IO.File]::WriteAllText((Join-Path (Get-Location) $mdPath), ($lines -join [Environment]::NewLine), $utf8NoBom)

if (-not $summary.ok) {
    $summary | ConvertTo-Json -Depth 20
    exit 2
}

$summary | ConvertTo-Json -Depth 20
