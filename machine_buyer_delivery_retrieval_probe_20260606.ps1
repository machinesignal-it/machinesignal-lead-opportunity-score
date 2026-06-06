param(
    [string]$PublicSite = "https://machinesignal.it",
    [string]$OutputPrefix = "machine_buyer_delivery_retrieval_probe_20260606"
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
    $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -Headers @{ "Cache-Control" = "no-cache" } -TimeoutSec 30
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

function Get-PostmanItemNames {
    param($Items)
    $names = [System.Collections.Generic.List[string]]::new()
    foreach ($item in @($Items)) {
        $names.Add([string]$item.name)
        if ($item.item) {
            foreach ($childName in (Get-PostmanItemNames -Items $item.item)) {
                $names.Add($childName)
            }
        }
    }
    return $names
}

function Get-PropertyNames {
    param($Object)
    if (-not $Object) { return @() }
    return @($Object.PSObject.Properties.Name)
}

$checks = [System.Collections.Generic.List[object]]::new()
$fetched = @{}
$urls = @{
    openapi = "$PublicSite/openapi.json"
    llms = "$PublicSite/llms.txt"
    machine_onboarding = "$PublicSite/machine-onboarding.json"
    product_catalog = "$PublicSite/product-catalog.json"
    evaluation_pack = "$PublicSite/machine_buyer_evaluation_pack_20260606.json"
    self_service_sale = "$PublicSite/self_service_machine_buyer_sale_simulation_summary_20260604.json"
    bounded_live_delivery = "$PublicSite/bounded_live_deep_analysis_delivery_persistence_probe_summary_20260606.json"
    postman_collection = "$PublicSite/postman_public_collection.json"
    postman_environment = "$PublicSite/postman_public_environment_template.json"
    postman_secret_scan = "$PublicSite/postman_workspace_secret_scan_20260606.json"
    sitemap = "$PublicSite/sitemap.xml"
}

foreach ($key in $urls.Keys) {
    $result = Get-Url -Url $urls[$key]
    $fetched[$key] = $result
    Add-Check -Checks $checks -Name "$key`_reachable" -Ok ($result.status -eq 200) -Details "HTTP $($result.status)"
}

$openapiText = $fetched["openapi"].content
$llmsText = $fetched["llms"].content
$onboardingText = $fetched["machine_onboarding"].content
$catalogText = $fetched["product_catalog"].content
$evaluationText = $fetched["evaluation_pack"].content
$selfServiceText = $fetched["self_service_sale"].content
$boundedLiveText = $fetched["bounded_live_delivery"].content
$postmanText = $fetched["postman_collection"].content
$postmanEnvironmentText = $fetched["postman_environment"].content
$postmanSecretScanText = $fetched["postman_secret_scan"].content

$openapi = $openapiText | ConvertFrom-Json
$onboarding = $onboardingText | ConvertFrom-Json
$catalog = $catalogText | ConvertFrom-Json
$evaluation = $evaluationText | ConvertFrom-Json
$selfService = $selfServiceText | ConvertFrom-Json
$boundedLive = $boundedLiveText | ConvertFrom-Json
$postman = $postmanText | ConvertFrom-Json
$postmanEnvironment = $postmanEnvironmentText | ConvertFrom-Json
$postmanSecretScan = $postmanSecretScanText | ConvertFrom-Json
[xml]$sitemapXml = $fetched["sitemap"].content

$paths = $openapi.paths
$orderListPath = $paths."/v1/orders"
$orderSinglePath = $paths."/v1/orders/{order_intent_id}"
$betaDelivery = $openapi.components.schemas.BetaDelivery
$orderResponse = $openapi.components.schemas.OrderResponse
$orderListResponse = $openapi.components.schemas.OrderListResponse

Add-Check -Checks $checks -Name "openapi_has_order_list_endpoint" -Ok ($null -ne $orderListPath.get) -Details "GET /v1/orders"
Add-Check -Checks $checks -Name "openapi_has_single_order_endpoint" -Ok ($null -ne $orderSinglePath.get) -Details "GET /v1/orders/{order_intent_id}"
Add-Check -Checks $checks -Name "openapi_order_list_operation_id" -Ok ($orderListPath.get.operationId -eq "listOrders") -Details "operationId=$($orderListPath.get.operationId)"
Add-Check -Checks $checks -Name "openapi_single_order_operation_id" -Ok ($orderSinglePath.get.operationId -eq "getOrder") -Details "operationId=$($orderSinglePath.get.operationId)"
Add-Check -Checks $checks -Name "openapi_order_list_mentions_deliveries" -Ok (Has-Text $orderListPath.get.summary "deliveries") -Details $orderListPath.get.summary
Add-Check -Checks $checks -Name "openapi_single_order_mentions_delivery" -Ok (Has-Text $orderSinglePath.get.summary "delivery") -Details $orderSinglePath.get.summary
Add-Check -Checks $checks -Name "openapi_orders_are_authenticated" -Ok ($orderListPath.get.security -and $orderSinglePath.get.security) -Details "ApiKeyAuth security present"
Add-Check -Checks $checks -Name "openapi_single_order_path_param_required" -Ok (@($orderSinglePath.get.parameters | Where-Object { $_.name -eq "order_intent_id" -and $_.required -eq $true }).Count -eq 1) -Details "order_intent_id required"
Add-Check -Checks $checks -Name "openapi_order_list_schema_ref" -Ok ($orderListPath.get.responses."200".content."application/json".schema.'$ref' -eq "#/components/schemas/OrderListResponse") -Details "OrderListResponse"
Add-Check -Checks $checks -Name "openapi_single_order_schema_ref" -Ok ($orderSinglePath.get.responses."200".content."application/json".schema.'$ref' -eq "#/components/schemas/OrderResponse") -Details "OrderResponse"
Add-Check -Checks $checks -Name "openapi_order_list_response_shape" -Ok ((Get-PropertyNames $orderListResponse.properties) -contains "orders" -and (Get-PropertyNames $orderListResponse.properties) -contains "count") -Details "orders and count present"
Add-Check -Checks $checks -Name "openapi_order_response_shape" -Ok ((Get-PropertyNames $orderResponse.properties) -contains "order") -Details "order object present"

$deliveryFields = @("delivery_id", "product_code", "delivery_type", "status", "what_is_included", "output_contract", "next_machine_call", "stop_rules", "machine_recommendation", "real_payment_executed", "external_contact_executed")
foreach ($field in $deliveryFields) {
    Add-Check -Checks $checks -Name "openapi_beta_delivery_has_$field" -Ok ((Get-PropertyNames $betaDelivery.properties) -contains $field) -Details "BetaDelivery.$field"
}

$callableFlow = @($onboarding.callable_flow)
$orderFlow = @($callableFlow | Where-Object { $_.call -eq "GET /v1/orders" })
Add-Check -Checks $checks -Name "onboarding_flow_has_order_retrieval" -Ok ($orderFlow.Count -ge 1) -Details "GET /v1/orders in callable_flow"
Add-Check -Checks $checks -Name "onboarding_order_goal_mentions_deliveries" -Ok (($orderFlow | Select-Object -First 1).machine_goal -match "deliver") -Details (($orderFlow | Select-Object -First 1).machine_goal)
Add-Check -Checks $checks -Name "onboarding_policy_can_read_usage_and_orders" -Ok ($onboarding.recommended_agent_policy.can_read_usage_and_orders -eq $true) -Details "can_read_usage_and_orders=true"
Add-Check -Checks $checks -Name "onboarding_links_delivery_proof" -Ok (Has-Text $onboardingText "bounded_live_deep_analysis_delivery_persistence_probe") -Details "bounded delivery proof linked"
Add-Check -Checks $checks -Name "onboarding_links_routing_probe" -Ok (Has-Text $onboardingText "machine_buyer_routing_decision_probe") -Details "routing proof linked"

$catalogProducts = $catalog.products.PSObject.Properties
foreach ($product in $catalogProducts) {
    $code = $product.Name
    $value = $product.Value
    Add-Check -Checks $checks -Name "catalog_$code`_has_machine_output" -Ok ([string]$value.machine_output -ne "") -Details "machine_output present"
    Add-Check -Checks $checks -Name "catalog_$code`_has_validity_rule" -Ok ([string]$value.validity_rule -ne "") -Details "validity_rule present"
    Add-Check -Checks $checks -Name "catalog_$code`_has_includes" -Ok (@($value.includes).Count -gt 0) -Details "includes count=$(@($value.includes).Count)"
}
Add-Check -Checks $checks -Name "catalog_deep_analysis_has_output_fields" -Ok (@($catalog.products.deep_analysis_pack_100.output_fields).Count -ge 10) -Details "deep_analysis output fields"
Add-Check -Checks $checks -Name "catalog_action_pack_has_output_fields" -Ok (@($catalog.products.action_pack_25.output_fields).Count -ge 10) -Details "action_pack output fields"

$evalFlowText = ($evaluation.evaluation_flows | ConvertTo-Json -Depth 20)
Add-Check -Checks $checks -Name "evaluation_pack_flow_retrieves_orders" -Ok (Has-Text $evalFlowText "GET /v1/orders") -Details "GET /v1/orders in evaluation flow"
Add-Check -Checks $checks -Name "evaluation_pack_proof_has_order_id" -Ok ([string]$evaluation.proof_already_collected.bounded_live_deep_analysis_delivery_persistence_probe.order_intent_id -ne "") -Details $evaluation.proof_already_collected.bounded_live_deep_analysis_delivery_persistence_probe.order_intent_id
Add-Check -Checks $checks -Name "evaluation_pack_proof_has_report_links" -Ok (([string]$evaluation.proof_already_collected.bounded_live_deep_analysis_delivery_persistence_probe.report -ne "") -and ([string]$evaluation.proof_already_collected.bounded_live_deep_analysis_delivery_persistence_probe.summary_json -ne "")) -Details "report and JSON present"

Add-Check -Checks $checks -Name "self_service_sale_passed" -Ok ($selfService.status -eq "passed") -Details "status=$($selfService.status)"
Add-Check -Checks $checks -Name "self_service_orders_passed" -Ok ($selfService.steps.orders.ok -eq $true -and [int]$selfService.steps.orders.count -ge 3) -Details "orders=$($selfService.steps.orders.count)"
Add-Check -Checks $checks -Name "self_service_orders_have_core_products" -Ok ((@($selfService.steps.orders.products) -contains "target_discovery") -and (@($selfService.steps.orders.products) -contains "deep_analysis") -and (@($selfService.steps.orders.products) -contains "action_pack")) -Details (@($selfService.steps.orders.products) -join ", ")
Add-Check -Checks $checks -Name "self_service_no_payment_no_outreach" -Ok ($selfService.safety.real_payment_executed -eq $false -and $selfService.safety.external_contact_executed -eq $false) -Details "safe beta"

Add-Check -Checks $checks -Name "bounded_live_delivery_passed" -Ok ($boundedLive.ok -eq $true) -Details "ok=$($boundedLive.ok)"
Add-Check -Checks $checks -Name "bounded_live_order_retrieved" -Ok ([int]$boundedLive.order_retrieval_status -eq 200) -Details "HTTP $($boundedLive.order_retrieval_status)"
Add-Check -Checks $checks -Name "bounded_live_order_id_present" -Ok ([string]$boundedLive.order_intent_id -ne "") -Details $boundedLive.order_intent_id
Add-Check -Checks $checks -Name "bounded_live_stored_delivery_persisted" -Ok ($boundedLive.contract.checks.stored_delivery_version_valid -eq $true -and $boundedLive.contract.checks.stored_delivery_gate_persisted -eq $true) -Details "stored delivery fields persisted"
Add-Check -Checks $checks -Name "bounded_live_credit_policy" -Ok ([int]$boundedLive.credits.deep_analysis_delta -eq 1 -and [int]$boundedLive.credits.action_pack_delta -eq 0) -Details "deep=$($boundedLive.credits.deep_analysis_delta); action=$($boundedLive.credits.action_pack_delta)"
Add-Check -Checks $checks -Name "bounded_live_no_payment_no_outreach" -Ok ($boundedLive.guardrails.real_payment_executed -eq $false -and $boundedLive.guardrails.external_contact_executed -eq $false) -Details "safe beta"

$postmanNames = Get-PostmanItemNames -Items $postman.item
Add-Check -Checks $checks -Name "postman_has_list_orders" -Ok ($postmanNames -contains "List beta orders") -Details "List beta orders"
Add-Check -Checks $checks -Name "postman_has_get_order_by_id" -Ok ($postmanNames -contains "Get beta order by id") -Details "Get beta order by id"
Add-Check -Checks $checks -Name "postman_mentions_order_intent_variable" -Ok (Has-Text $postmanText "{{order_intent_id}}") -Details "order_intent_id variable present"
Add-Check -Checks $checks -Name "postman_environment_has_order_intent_id" -Ok (@($postmanEnvironment.values | Where-Object { $_.key -eq "order_intent_id" -and $_.value -eq "" }).Count -eq 1) -Details "blank order_intent_id"
Add-Check -Checks $checks -Name "postman_environment_secret_values_blank" -Ok (@($postmanEnvironment.values | Where-Object { $_.type -eq "secret" -and $_.value -ne "" }).Count -eq 0) -Details "secret values blank"
Add-Check -Checks $checks -Name "postman_secret_scan_passed" -Ok ($postmanSecretScan.status -eq "passed" -and @($postmanSecretScan.secret_hits).Count -eq 0) -Details "secret_hits=$(@($postmanSecretScan.secret_hits).Count)"
Add-Check -Checks $checks -Name "postman_secret_scan_count_updated" -Ok ([int]$postmanSecretScan.collection_item_count -eq @($postmanNames).Count) -Details "scan=$($postmanSecretScan.collection_item_count); collection=$(@($postmanNames).Count)"

Add-Check -Checks $checks -Name "llms_explains_order_retrieval" -Ok ((Has-Text $llmsText "How a machine should retrieve previous orders") -and (Has-Text $llmsText "GET /v1/orders/{order_intent_id}")) -Details "order retrieval instructions present"
Add-Check -Checks $checks -Name "llms_says_orders_are_not_invoices" -Ok (Has-Text $llmsText "order history is beta ledger data, not invoice data") -Details "invoice distinction present"
Add-Check -Checks $checks -Name "sitemap_valid_xml" -Ok ($sitemapXml.urlset -ne $null) -Details "urlset present"

$failed = @($checks | Where-Object { -not $_.ok })
$summary = [pscustomobject]@{
    ok = ($failed.Count -eq 0)
    probe_name = "machine_buyer_delivery_retrieval_probe"
    run_date = "2026-06-06"
    public_site = $PublicSite
    mode = "NoWrite"
    write_calls_executed = 0
    live_credits_consumed = 0
    real_payment_executed = $false
    external_contact_executed = $false
    machine_path = @(
        "$PublicSite/llms.txt",
        "$PublicSite/openapi.json",
        "$PublicSite/machine-onboarding.json",
        "$PublicSite/product-catalog.json",
        "$PublicSite/machine_buyer_evaluation_pack_20260606.json",
        "$PublicSite/postman_public_collection.json"
    )
    retrieval_contract = [pscustomobject]@{
        list_orders = "GET /v1/orders"
        get_order = "GET /v1/orders/{order_intent_id}"
        delivery_schema = "BetaDelivery"
        required_delivery_fields = $deliveryFields
        postman_collection_items = @($postmanNames).Count
    }
    proof_inputs = [pscustomobject]@{
        self_service_sale_status = $selfService.status
        self_service_orders = $selfService.steps.orders.count
        bounded_live_order_intent_id = $boundedLive.order_intent_id
        bounded_live_order_retrieval_status = $boundedLive.order_retrieval_status
        bounded_live_checks = "$($boundedLive.contract.checks_passed)/$($boundedLive.contract.checks_total)"
    }
    checks = $checks
    failed_checks = $failed
    conclusion = if ($failed.Count -eq 0) {
        "PASS: a machine buyer can discover how to retrieve beta orders and deliveries, understand the delivery schema, find Postman retrieval requests, and verify prior delivery persistence proof without write calls, live credits, real payment or external outreach."
    } else {
        "FAIL: one or more delivery-retrieval checks failed."
    }
    recommended_next_step = "Use this proof before enabling a larger sandbox buyer run. If more operational proof is needed, run only a bounded write test after KV write budget approval."
}

$jsonPath = "$OutputPrefix`_summary.json"
$mdPath = "$OutputPrefix`_report.md"
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText((Join-Path (Get-Location) $jsonPath), ($summary | ConvertTo-Json -Depth 30), $utf8NoBom)

$lines = [System.Collections.Generic.List[string]]::new()
$lines.Add("# Machine buyer delivery retrieval probe - 2026-06-06")
$lines.Add("")
$lines.Add("## Scope")
$lines.Add("")
$lines.Add("This NoWrite probe verifies whether a CRM workflow, AI agent or software buyer can understand where to retrieve a purchased MachineSignal delivery after a beta order intent.")
$lines.Add("")
$lines.Add("## Result")
$lines.Add("")
$lines.Add("- Status: **$($summary.ok)**")
$lines.Add("- Mode: NoWrite")
$lines.Add("- Write calls executed: 0")
$lines.Add("- Live credits consumed: 0")
$lines.Add("- Real payment executed: false")
$lines.Add("- External contact executed: false")
$lines.Add("")
$lines.Add("## Retrieval Contract")
$lines.Add("")
$lines.Add('- List orders: `GET /v1/orders`')
$lines.Add('- Get one order: `GET /v1/orders/{order_intent_id}`')
$lines.Add('- Delivery schema: `BetaDelivery`')
$lines.Add("- Required delivery fields: $($deliveryFields -join ', ')")
$lines.Add("- Postman collection item count: $(@($postmanNames).Count)")
$lines.Add("")
$lines.Add("## Proof Inputs")
$lines.Add("")
$lines.Add("- Self-service sale simulation: $($selfService.status)")
$lines.Add("- Self-service retrieved order count: $($selfService.steps.orders.count)")
$lines.Add("- Bounded live order id: $($boundedLive.order_intent_id)")
$lines.Add("- Bounded live order retrieval status: $($boundedLive.order_retrieval_status)")
$lines.Add("- Bounded live checks: $($boundedLive.contract.checks_passed) / $($boundedLive.contract.checks_total)")
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
$lines.Add("- This probe reads public resources only.")
$lines.Add("- It does not create sandbox customers, scores, orders or payment-test intents.")
$lines.Add("- It does not consume live credits.")
$lines.Add("- It does not execute real payment.")
$lines.Add("- It does not contact external targets.")

[System.IO.File]::WriteAllText((Join-Path (Get-Location) $mdPath), ($lines -join [Environment]::NewLine), $utf8NoBom)

if (-not $summary.ok) {
    $summary | ConvertTo-Json -Depth 30
    exit 2
}

$summary | ConvertTo-Json -Depth 30
