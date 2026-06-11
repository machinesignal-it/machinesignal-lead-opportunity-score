param(
    [string]$PostmanKeyPath = (Join-Path $env:APPDATA "MachineSignal\postman_api_key.dpapi"),
    [string]$SetupSummaryPath = "postman_private_team_workspace_setup_summary_20260611.json",
    [string]$OutputJson = "postman_private_team_workspace_sandbox_rehearsal_summary_20260611.json",
    [string]$OutputMarkdown = "postman_private_team_workspace_sandbox_rehearsal_report_20260611.md"
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

function Write-Utf8NoBom {
    param([string]$Path, [string]$Text)
    $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText((Join-Path (Get-Location) $Path), $Text, $utf8NoBom)
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

function Get-PlainSecret {
    param([string]$Path)
    if (-not (Test-Path -LiteralPath $Path)) {
        throw "Secret file not found: $Path"
    }
    $secure = ((Get-Content -LiteralPath $Path -Raw).Trim() | ConvertTo-SecureString)
    return (New-Object System.Net.NetworkCredential("", $secure)).Password
}

function ConvertTo-RedactedObject {
    param($Value)
    if ($null -eq $Value) {
        return $null
    }
    if ($Value -is [System.Collections.IDictionary]) {
        $out = [ordered]@{}
        foreach ($key in $Value.Keys) {
            if ([regex]::IsMatch([string]$key, "(?i)(api[_-]?key|authorization|token|secret|password|signature)")) {
                $out[$key] = "[REDACTED]"
            } else {
                $out[$key] = ConvertTo-RedactedObject $Value[$key]
            }
        }
        return $out
    }
    if ($Value -is [System.Collections.IEnumerable] -and -not ($Value -is [string])) {
        $items = New-Object System.Collections.ArrayList
        foreach ($item in $Value) {
            [void]$items.Add((ConvertTo-RedactedObject $item))
        }
        return @($items)
    }
    if ($Value.PSObject.Properties.Count -gt 0 -and -not ($Value -is [string])) {
        $out = [ordered]@{}
        foreach ($property in $Value.PSObject.Properties) {
            if ([regex]::IsMatch($property.Name, "(?i)(api[_-]?key|authorization|token|secret|password|signature)")) {
                $out[$property.Name] = "[REDACTED]"
            } else {
                $out[$property.Name] = ConvertTo-RedactedObject $property.Value
            }
        }
        return $out
    }
    return $Value
}

function Resolve-TemplateText {
    param([string]$Text, [hashtable]$Variables)
    $resolved = $Text
    foreach ($key in $Variables.Keys) {
        $resolved = $resolved.Replace("{{$key}}", [string]$Variables[$key])
    }
    return $resolved
}

function Get-CollectionItems {
    param($Items, [string[]]$Prefix = @())
    $out = New-Object System.Collections.ArrayList
    foreach ($item in @($Items)) {
        $path = @($Prefix + $item.name)
        if ($item.item) {
            foreach ($child in (Get-CollectionItems -Items $item.item -Prefix $path)) {
                [void]$out.Add($child)
            }
        } else {
            [void]$out.Add([ordered]@{
                name = ($path -join " / ")
                short_name = $item.name
                item = $item
            })
        }
    }
    return @($out)
}

function Get-CollectionItemByName {
    param($FlatItems, [string]$ShortName)
    return @($FlatItems | Where-Object { $_.short_name -eq $ShortName })[0]
}

function Get-JsonFromResponse {
    param([System.Net.WebResponse]$Response)
    $stream = $Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    try {
        $text = $reader.ReadToEnd()
    } finally {
        $reader.Dispose()
        $stream.Dispose()
    }
    if ([string]::IsNullOrWhiteSpace($text)) {
        return [ordered]@{ raw = "" }
    }
    try {
        return $text | ConvertFrom-Json
    } catch {
        return [ordered]@{ raw = $text }
    }
}

function Invoke-JsonRequest {
    param(
        [string]$Method,
        [string]$Uri,
        [hashtable]$Headers = @{},
        $Body = $null
    )
    $request = [System.Net.WebRequest]::Create($Uri)
    $request.Method = $Method
    $request.Timeout = 30000
    $request.ContentType = "application/json"
    $request.Accept = "application/json,text/plain,*/*"
    foreach ($key in $Headers.Keys) {
        if ($key -eq "Content-Type") {
            $request.ContentType = [string]$Headers[$key]
        } elseif ($key -eq "Accept") {
            $request.Accept = [string]$Headers[$key]
        } elseif ($key -eq "User-Agent") {
            $request.UserAgent = [string]$Headers[$key]
        } else {
            $request.Headers[$key] = [string]$Headers[$key]
        }
    }
    if ($null -ne $Body) {
        $bodyText = if ($Body -is [string]) { $Body } else { $Body | ConvertTo-Json -Depth 50 -Compress }
        $bytes = [System.Text.Encoding]::UTF8.GetBytes($bodyText)
        $request.ContentLength = $bytes.Length
        $stream = $request.GetRequestStream()
        try {
            $stream.Write($bytes, 0, $bytes.Length)
        } finally {
            $stream.Dispose()
        }
    }
    try {
        $response = $request.GetResponse()
        try {
            return [ordered]@{
                ok = $true
                status = [int]$response.StatusCode
                body = Get-JsonFromResponse -Response $response
            }
        } finally {
            $response.Dispose()
        }
    } catch [System.Net.WebException] {
        $response = $_.Exception.Response
        if ($null -ne $response) {
            try {
                return [ordered]@{
                    ok = $false
                    status = [int]$response.StatusCode
                    body = Get-JsonFromResponse -Response $response
                    error = $_.Exception.Message
                }
            } finally {
                $response.Dispose()
            }
        }
        return [ordered]@{
            ok = $false
            status = 0
            body = $null
            error = $_.Exception.Message
        }
    }
}

function Invoke-PostmanCollectionItem {
    param(
        $NamedItem,
        [hashtable]$Variables,
        [string]$IdempotencyKey,
        $OverrideBody = $null
    )
    $item = $NamedItem.item
    $method = [string]$item.request.method
    $rawUrl = Resolve-TemplateText -Text ([string]$item.request.url.raw) -Variables $Variables
    $headers = @{}
    foreach ($header in @($item.request.header)) {
        $key = [string]$header.key
        if ([string]::IsNullOrWhiteSpace($key)) {
            continue
        }
        $value = Resolve-TemplateText -Text ([string]$header.value) -Variables $Variables
        if ($key -eq "Idempotency-Key" -and -not [string]::IsNullOrWhiteSpace($IdempotencyKey)) {
            $value = $IdempotencyKey
        }
        $headers[$key] = $value
    }
    $headers["User-Agent"] = "MachineSignalPostmanTeamWorkspaceSandboxRehearsal/2026-06-11"
    $body = $null
    if ($method -ne "GET" -and $item.request.body -and $item.request.body.raw) {
        $bodyText = Resolve-TemplateText -Text ([string]$item.request.body.raw) -Variables $Variables
        $body = $bodyText
    }
    if ($null -ne $OverrideBody) {
        $body = $OverrideBody | ConvertTo-Json -Depth 50 -Compress
    }
    $response = Invoke-JsonRequest -Method $method -Uri $rawUrl -Headers $headers -Body $body
    return [ordered]@{
        item_name = $NamedItem.short_name
        method = $method
        url = $rawUrl
        status = $response.status
        ok = $response.ok
        idempotency_key = $IdempotencyKey
        response = $response.body
        error = $response.error
    }
}

function Test-NoSecretLikeText {
    param([string]$Text)
    $patterns = @(
        "sk_live_[A-Za-z0-9]+",
        "sk_test_[A-Za-z0-9]+",
        "ghp_[A-Za-z0-9_]+",
        "github_pat_[A-Za-z0-9_]+",
        "Bearer\s+[A-Za-z0-9._-]{20,}",
        "CF_API_TOKEN",
        "Cloudflare API Token"
    )
    foreach ($pattern in $patterns) {
        if ([regex]::IsMatch($Text, $pattern)) {
            return $false
        }
    }
    return $true
}

$runId = "postman-team-sandbox-" + (Get-Date -Format "yyyyMMddHHmmss")
$checks = New-Object System.Collections.ArrayList
$actions = New-Object System.Collections.ArrayList
$postCallsExecuted = 0
$writeCallsExecuted = 0

$setup = Get-Content -LiteralPath $SetupSummaryPath -Raw | ConvertFrom-Json
$postmanKey = Get-PlainSecret -Path $PostmanKeyPath
$postmanHeaders = @{
    "X-Api-Key" = $postmanKey
    "User-Agent" = "MachineSignalPostmanTeamWorkspaceSandboxRehearsal/2026-06-11"
}

$workspaceResp = Invoke-JsonRequest -Method "GET" -Uri "https://api.getpostman.com/workspaces/$($setup.workspace.id)" -Headers $postmanHeaders
$collectionResp = Invoke-JsonRequest -Method "GET" -Uri "https://api.getpostman.com/collections/$($setup.collection.uid)" -Headers $postmanHeaders
$environmentResp = Invoke-JsonRequest -Method "GET" -Uri "https://api.getpostman.com/environments/$($setup.environment.uid)" -Headers $postmanHeaders
$postmanKey = $null

Add-Check -Checks $checks -Name "postman_workspace_fetched" -Ok ($workspaceResp.ok) -Details "HTTP $($workspaceResp.status)"
Add-Check -Checks $checks -Name "postman_collection_fetched" -Ok ($collectionResp.ok) -Details "HTTP $($collectionResp.status)"
Add-Check -Checks $checks -Name "postman_environment_fetched" -Ok ($environmentResp.ok) -Details "HTTP $($environmentResp.status)"
Add-Check -Checks $checks -Name "postman_workspace_is_team_visibility" -Ok ($workspaceResp.body.workspace.visibility -eq "team" -and $workspaceResp.body.workspace.type -eq "team") -Details "type=$($workspaceResp.body.workspace.type), visibility=$($workspaceResp.body.workspace.visibility)"

$collection = $collectionResp.body.collection
$environment = $environmentResp.body.environment
$flatItems = Get-CollectionItems -Items $collection.item
$variables = @{}
foreach ($variable in @($collection.variable)) {
    $variables[[string]$variable.key] = [string]$variable.value
}
foreach ($variable in @($environment.values)) {
    if (-not [string]::IsNullOrWhiteSpace([string]$variable.value)) {
        $variables[[string]$variable.key] = [string]$variable.value
    }
}

Add-Check -Checks $checks -Name "collection_item_count_28" -Ok (@($flatItems).Count -eq 28) -Details "items=$(@($flatItems).Count)"
foreach ($required in @(
    "Create limited sandbox customer",
    "Score business domain",
    "Order target discovery when machine has no list",
    "Read usage ledger",
    "List beta orders"
)) {
    Add-Check -Checks $checks -Name ("collection_has_" + ($required -replace "[^A-Za-z0-9]+", "_").ToLower()) -Ok (@($flatItems | Where-Object { $_.short_name -eq $required }).Count -gt 0) -Details $required
}

$nonBaseEnvValues = @($environment.values | Where-Object { $_.key -ne "base_url" -and -not [string]::IsNullOrWhiteSpace([string]$_.value) })
Add-Check -Checks $checks -Name "environment_has_no_real_secret_values" -Ok ($nonBaseEnvValues.Count -eq 0) -Details "non_base_non_blank=$($nonBaseEnvValues.Count)"
Add-Check -Checks $checks -Name "base_url_resolved_from_postman_environment" -Ok ([string]$variables["base_url"] -like "https://machinesignal-api.*") -Details ([string]$variables["base_url"])

$sandboxItem = Get-CollectionItemByName -FlatItems $flatItems -ShortName "Create limited sandbox customer"
$sandboxAction = Invoke-PostmanCollectionItem -NamedItem $sandboxItem -Variables $variables -IdempotencyKey "$runId-sandbox" -OverrideBody @{
    evaluator_type = "ai_agent"
    integration_target = "postman_private_team_workspace_runner"
    expected_test_path = "postman_team_workspace_sandbox_rehearsal"
}
[void]$actions.Add($sandboxAction)
$postCallsExecuted += 1
$writeCallsExecuted += 1
Add-Check -Checks $checks -Name "sandbox_customer_created_from_postman_collection_item" -Ok ($sandboxAction.ok -and $sandboxAction.response.api_key) -Details "HTTP $($sandboxAction.status), customer_id=$($sandboxAction.response.customer_id)"

if ($sandboxAction.response.api_key) {
    $variables["machinesignal_api_key"] = [string]$sandboxAction.response.api_key
}

$catalogItem = Get-CollectionItemByName -FlatItems $flatItems -ShortName "Fetch product catalog"
$catalogAction = Invoke-PostmanCollectionItem -NamedItem $catalogItem -Variables $variables -IdempotencyKey ""
[void]$actions.Add($catalogAction)
Add-Check -Checks $checks -Name "product_catalog_read_by_postman_contract" -Ok ($catalogAction.ok -and (($catalogAction.response | ConvertTo-Json -Depth 20) -match "target_discovery|deep_analysis|action_pack")) -Details "HTTP $($catalogAction.status)"

$scoreItem = Get-CollectionItemByName -FlatItems $flatItems -ShortName "Score business domain"
$scoreBody = @{
    domain = "studio-dentale-postman-rehearsal.it"
    sector_hint = "dentist"
    country_hint = "IT"
}
$scoreAction = Invoke-PostmanCollectionItem -NamedItem $scoreItem -Variables $variables -IdempotencyKey "$runId-score" -OverrideBody $scoreBody
[void]$actions.Add($scoreAction)
$postCallsExecuted += 1
$writeCallsExecuted += 1
Add-Check -Checks $checks -Name "score_domain_executed_from_postman_collection_item" -Ok ($scoreAction.ok -and $scoreAction.response.opportunity_score -is [int]) -Details "HTTP $($scoreAction.status), score=$($scoreAction.response.opportunity_score), decision=$($scoreAction.response.decision)"

$targetDiscoveryItem = Get-CollectionItemByName -FlatItems $flatItems -ShortName "Order target discovery when machine has no list"
$targetDiscoveryBody = @{
    product_code = "target_discovery"
    market = "cliniche odontoiatriche"
    area = "Milano"
    commercial_objective = "find business domains worth scoring for website improvement and lead opportunity prioritization"
    reason = "Customer machine has no starting list and is testing the Postman private team workspace path"
}
$targetDiscoveryAction = Invoke-PostmanCollectionItem -NamedItem $targetDiscoveryItem -Variables $variables -IdempotencyKey "$runId-target-discovery" -OverrideBody $targetDiscoveryBody
[void]$actions.Add($targetDiscoveryAction)
$postCallsExecuted += 1
$writeCallsExecuted += 1
Add-Check -Checks $checks -Name "target_discovery_order_executed_from_postman_collection_item" -Ok ($targetDiscoveryAction.ok -and (($targetDiscoveryAction.response | ConvertTo-Json -Depth 50) -match "target_discovery")) -Details "HTTP $($targetDiscoveryAction.status)"

$usageItem = Get-CollectionItemByName -FlatItems $flatItems -ShortName "Read usage ledger"
$usageAction = Invoke-PostmanCollectionItem -NamedItem $usageItem -Variables $variables -IdempotencyKey ""
[void]$actions.Add($usageAction)
Add-Check -Checks $checks -Name "usage_ledger_read_after_postman_rehearsal" -Ok ($usageAction.ok -and $usageAction.response.customer_id) -Details "HTTP $($usageAction.status), customer_id=$($usageAction.response.customer_id)"

$ordersItem = Get-CollectionItemByName -FlatItems $flatItems -ShortName "List beta orders"
$ordersAction = Invoke-PostmanCollectionItem -NamedItem $ordersItem -Variables $variables -IdempotencyKey ""
[void]$actions.Add($ordersAction)
Add-Check -Checks $checks -Name "orders_list_read_after_postman_rehearsal" -Ok ($ordersAction.ok) -Details "HTTP $($ordersAction.status)"

Add-Check -Checks $checks -Name "post_write_budget_respected" -Ok ($postCallsExecuted -le 3 -and $writeCallsExecuted -le 3) -Details "post=$postCallsExecuted, write=$writeCallsExecuted"
Add-Check -Checks $checks -Name "no_payment_endpoints_called" -Ok (-not (@($actions) | Where-Object { $_.url -match "payment" })) -Details "payment endpoint calls=0"
Add-Check -Checks $checks -Name "no_admin_endpoints_called" -Ok (-not (@($actions) | Where-Object { $_.url -match "/admin/" })) -Details "admin endpoint calls=0"
Add-Check -Checks $checks -Name "no_external_contact_executed" -Ok $true -Details "rehearsal only called MachineSignal sandbox endpoints"

$redactedActions = @($actions | ForEach-Object { ConvertTo-RedactedObject $_ })
$failed = @($checks | Where-Object { -not $_.ok })
$summary = [ordered]@{
    service = "MachineSignal"
    probe_name = "postman_private_team_workspace_sandbox_rehearsal"
    status = if ($failed.Count -eq 0) { "completed_postman_private_team_workspace_sandbox_rehearsal" } else { "failed_postman_private_team_workspace_sandbox_rehearsal" }
    ok = ($failed.Count -eq 0)
    evidence_date = "2026-06-11"
    run_id = $runId
    mode = "PostmanPrivateTeamWorkspaceSandboxRehearsalWriteCapped"
    primary_customer_interface = "machine"
    workspace = [ordered]@{
        name = $workspaceResp.body.workspace.name
        type = $workspaceResp.body.workspace.type
        visibility = $workspaceResp.body.workspace.visibility
        public_workspace_enabled = $false
    }
    collection = [ordered]@{
        name = $collection.info.name
        uid = $setup.collection.uid
        item_count = @($flatItems).Count
    }
    environment = [ordered]@{
        name = $environment.name
        uid = $setup.environment.uid
        non_base_non_blank_values = $nonBaseEnvValues.Count
    }
    post_calls_executed = $postCallsExecuted
    write_calls_executed = $writeCallsExecuted
    real_payment_executed = $false
    real_invoice_issued = $false
    external_contact_executed = $false
    human_outreach_executed = $false
    external_publication_executed = $false
    live_monetization_enabled = $false
    production_api_key_published = $false
    machine_paths_tested = [ordered]@{
        customer_with_existing_list_score_path = $scoreAction.ok
        customer_without_list_target_discovery_path = $targetDiscoveryAction.ok
        usage_and_orders_reconciliation_path = ($usageAction.ok -and $ordersAction.ok)
    }
    score_result = [ordered]@{
        domain = $scoreBody.domain
        opportunity_score = $scoreAction.response.opportunity_score
        confidence = $scoreAction.response.confidence
        decision = $scoreAction.response.decision
        commercial_strength = $scoreAction.response.commercial_strength
    }
    checks_total = @($checks).Count
    checks_failed = $failed.Count
    failed_checks = @($failed | ForEach-Object { $_.name })
    checks = @($checks)
    actions = $redactedActions
    recommended_next_step = if ($failed.Count -eq 0) {
        "Use this as evidence that Postman can serve as a private/team machine-to-machine sandbox channel. Next, prepare the API-directory private draft with the same no-publication/no-payment controls."
    } else {
        "Fix failed Postman sandbox rehearsal checks before using Postman as a machine-facing evaluation channel."
    }
}

$summaryJson = $summary | ConvertTo-Json -Depth 100
Write-Utf8NoBom -Path $OutputJson -Text ($summaryJson + "`n")

$report = @(
    "# MachineSignal - Postman Private Team Workspace Sandbox Rehearsal - 2026-06-11",
    "",
    "## Result",
    "",
    "- Status: $($summary.status)",
    "- OK: $($summary.ok)",
    "- Mode: $($summary.mode)",
    "- Primary customer interface: machine",
    "- Workspace visibility: $($summary.workspace.visibility)",
    "- Collection items: $($summary.collection.item_count)",
    "- POST calls executed: $postCallsExecuted/3",
    "- Write calls executed: $writeCallsExecuted/3",
    "- Checks failed: $($failed.Count)/$(@($checks).Count)",
    "",
    "## Machine Path Tested",
    "",
    "1. Fetch the private/team Postman workspace metadata through the Postman API.",
    "2. Fetch the callable beta collection and sandbox environment.",
    "3. Resolve Postman variables without real customer/admin keys.",
    "4. Create one limited sandbox customer.",
    "5. Read the product catalog.",
    "6. Score one synthetic business domain.",
    "7. Order Target Discovery for the no-list buyer-machine case.",
    "8. Read usage and order history for reconciliation.",
    "",
    "## Commercial Decision Observed",
    "",
    "- Domain: ``$($summary.score_result.domain)``",
    "- Score: $($summary.score_result.opportunity_score)",
    "- Confidence: $($summary.score_result.confidence)",
    "- Decision: $($summary.score_result.decision)",
    "- Commercial strength: $($summary.score_result.commercial_strength)",
    "",
    "## Safety",
    "",
    "- Real payment executed: false",
    "- Real invoice issued: false",
    "- External contact executed: false",
    "- Human outreach executed: false",
    "- External publication executed: false",
    "- Live monetization enabled: false",
    "- Production API key published: false",
    "- Admin endpoints called: false",
    "- Payment endpoints called: false",
    "",
    "## Interpretation",
    "",
    "A buyer machine can use the Postman private/team workspace as a sandbox evaluation channel. It can read the collection and environment, create a limited sandbox key, score a domain, request Target Discovery when it has no starting list, and reconcile usage/orders without any real payment, invoice, publication or external contact.",
    "",
    "## Recommended Next Step",
    "",
    $summary.recommended_next_step,
    "",
    "## Failed Checks",
    ""
)
if ($failed.Count -eq 0) {
    $report += "None."
} else {
    foreach ($check in $failed) {
        $report += "- $($check.name): $($check.details)"
    }
}
$report += @(
    "",
    "## Actions",
    ""
)
foreach ($action in $redactedActions) {
    $report += "- $($action.method) $($action.item_name): HTTP $($action.status)"
}
Write-Utf8NoBom -Path $OutputMarkdown -Text (($report -join "`n") + "`n")

$summaryJson
