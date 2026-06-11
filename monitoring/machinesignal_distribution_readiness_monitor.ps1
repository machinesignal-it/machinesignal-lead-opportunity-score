param(
    [string]$PublicSite = "https://machinesignal.it",
    [string]$OutputJson = "distribution_readiness_monitor_summary_20260607.json",
    [string]$OutputMarkdown = "distribution_readiness_monitor_report_20260607.md"
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

function Get-PublicResource {
    param(
        [string]$Name,
        [string]$Url,
        [bool]$ExpectJson = $false
    )

    try {
        $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 30 -Headers @{
            "User-Agent" = "MachineSignalDistributionReadinessMonitor/2026-06-07"
            "Accept" = "application/json,text/plain,text/html,application/xml,*/*"
        }
        $content = if ($response.Content -is [byte[]]) {
            [System.Text.Encoding]::UTF8.GetString($response.Content)
        } else {
            [string]($response.Content -join "`n")
        }
        $json = $null
        $jsonOk = $false
        if ($ExpectJson) {
            try {
                $json = $content | ConvertFrom-Json
                $jsonOk = $true
            } catch {
                $jsonOk = $false
            }
        }
        return [ordered]@{
            name = $Name
            url = $Url
            status = [int]$response.StatusCode
            ok = ([int]$response.StatusCode -eq 200)
            content = $content
            json = $json
            json_ok = $jsonOk
            length = $content.Length
            error = $null
        }
    } catch {
        return [ordered]@{
            name = $Name
            url = $Url
            status = 0
            ok = $false
            content = ""
            json = $null
            json_ok = $false
            length = 0
            error = $_.Exception.Message
        }
    }
}

function Test-Contains {
    param([string]$Text, [string]$Needle)
    return $Text.IndexOf($Needle, [StringComparison]::OrdinalIgnoreCase) -ge 0
}

function Test-NoSecretLikeText {
    param([string]$Text)
    $patterns = @(
        "sk_live_[A-Za-z0-9]+",
        "sk_test_[A-Za-z0-9]+",
        "ghp_[A-Za-z0-9_]+",
        "github_pat_[A-Za-z0-9_]+",
        "Bearer\s+[A-Za-z0-9._-]{20,}",
        ("CF_" + "API_TOKEN"),
        ("Cloudflare " + "API Token"),
        "ms_cust_[A-Za-z0-9_-]+"
    )
    foreach ($pattern in $patterns) {
        $matches = [regex]::Matches($Text, $pattern)
        foreach ($match in $matches) {
            if ($match.Value -eq "ms_cust_abc123") {
                continue
            }
            return $false
        }
    }
    return $true
}

$resources = @(
    @{ name = "distribution_index"; url = "$PublicSite/distribution/"; json = $false; must = "Sandbox-Only Publication Pack" },
    @{ name = "evidence_brief_html"; url = "$PublicSite/machine_beta_evidence_brief_20260607.html"; json = $false; must = "Machine-buyer beta flow proven" },
    @{ name = "evidence_brief_md"; url = "$PublicSite/machine_beta_evidence_brief_20260607.md"; json = $false; must = "MachineSignal Machine Buyer Evidence Brief" },
    @{ name = "evidence_brief_json"; url = "$PublicSite/machine_beta_evidence_brief_20260607.json"; json = $true; must = "completed_full" },
    @{ name = "bounded_beta_runner_json"; url = "$PublicSite/bounded_private_beta_runner_summary_20260607.json"; json = $true; must = "completed_full" },
    @{ name = "sandbox_only_external_publication_pack_md"; url = "$PublicSite/sandbox_only_external_publication_pack_20260607.md"; json = $false; must = "What Remains Blocked" },
    @{ name = "sandbox_only_external_publication_pack_json"; url = "$PublicSite/sandbox_only_external_publication_pack_20260607.json"; json = $true; must = "blocked_without_owner_approval" },
    @{ name = "external_sandbox_publication_drafts_md"; url = "$PublicSite/external_sandbox_publication_drafts_20260607.md"; json = $false; must = "Channel 1: Postman Workspace Draft" },
    @{ name = "external_sandbox_publication_drafts_json"; url = "$PublicSite/external_sandbox_publication_drafts_20260607.json"; json = $true; must = "rapidapi_style_marketplace" },
    @{ name = "api_directory_rapidapi_draft_checklist_md"; url = "$PublicSite/api_directory_rapidapi_draft_checklist_20260607.md"; json = $false; must = "Generic API Directory Fields" },
    @{ name = "api_directory_rapidapi_draft_checklist_json"; url = "$PublicSite/api_directory_rapidapi_draft_checklist_20260607.json"; json = $true; must = "draft_pricing_treatment" },
    @{ name = "mcp_tool_registry_draft_checklist_md"; url = "$PublicSite/mcp_tool_registry_draft_checklist_20260607.md"; json = $false; must = "Registry Listing Fields" },
    @{ name = "mcp_tool_registry_draft_checklist_json"; url = "$PublicSite/mcp_tool_registry_draft_checklist_20260607.json"; json = $true; must = "hosted_mcp_live" },
    @{ name = "machine_discovery_full_simulation_md"; url = "$PublicSite/machine_discovery_full_simulation_report_20260607.md"; json = $false; must = "Machine Discovery Full Simulation" },
    @{ name = "machine_discovery_full_simulation_json"; url = "$PublicSite/machine_discovery_full_simulation_summary_20260607.json"; json = $true; must = "completed_full_machine_discovery" },
    @{ name = "machine_deep_analysis_single_purchase_md"; url = "$PublicSite/machine_deep_analysis_single_purchase_report_20260608.md"; json = $false; must = "Machine Deep Analysis Single Purchase" },
    @{ name = "machine_deep_analysis_single_purchase_json"; url = "$PublicSite/machine_deep_analysis_single_purchase_summary_20260608.json"; json = $true; must = "completed_deep_analysis_single_purchase" },
    @{ name = "machine_action_pack_single_purchase_md"; url = "$PublicSite/machine_action_pack_single_purchase_report_20260608.md"; json = $false; must = "Machine Action Pack Single Purchase" },
    @{ name = "machine_action_pack_single_purchase_json"; url = "$PublicSite/machine_action_pack_single_purchase_summary_20260608.json"; json = $true; must = "completed_action_pack_single_purchase" },
    @{ name = "public_sandbox_claims_nowrite_review_md"; url = "$PublicSite/public_sandbox_claims_no_write_review_report_20260608.md"; json = $false; must = "Public Sandbox Claims NoWrite Review" },
    @{ name = "public_sandbox_claims_nowrite_review_json"; url = "$PublicSite/public_sandbox_claims_no_write_review_summary_20260608.json"; json = $true; must = "completed_public_sandbox_claims_no_write_review" },
    @{ name = "external_submission_pack_nowrite_review_md"; url = "$PublicSite/external_submission_pack_no_write_review_report_20260608.md"; json = $false; must = "External Submission Pack NoWrite Review" },
    @{ name = "external_submission_pack_nowrite_review_json"; url = "$PublicSite/external_submission_pack_no_write_review_summary_20260608.json"; json = $true; must = "completed_external_submission_pack_no_write_review" },
    @{ name = "external_draft_submission_bundle_md"; url = "$PublicSite/external_draft_submission_bundle_20260608.md"; json = $false; must = "External Draft Submission Bundle" },
    @{ name = "external_draft_submission_bundle_json"; url = "$PublicSite/external_draft_submission_bundle_20260608.json"; json = $true; must = "ready_for_private_draft_only" },
    @{ name = "private_draft_submission_rehearsal_md"; url = "$PublicSite/private_draft_submission_rehearsal_report_20260608.md"; json = $false; must = "Private Draft Submission Rehearsal" },
    @{ name = "private_draft_submission_rehearsal_json"; url = "$PublicSite/private_draft_submission_rehearsal_summary_20260608.json"; json = $true; must = "completed_private_draft_submission_rehearsal" },
    @{ name = "api_directory_private_draft_pack_md"; url = "$PublicSite/api_directory_private_draft_pack_20260608.md"; json = $false; must = "API Directory Private Draft Pack" },
    @{ name = "api_directory_private_draft_pack_json"; url = "$PublicSite/api_directory_private_draft_pack_20260608.json"; json = $true; must = "ready_for_api_directory_private_draft_only" },
    @{ name = "api_directory_private_draft_review_md"; url = "$PublicSite/api_directory_private_draft_review_report_20260608.md"; json = $false; must = "API Directory Private Draft Review" },
    @{ name = "api_directory_private_draft_review_json"; url = "$PublicSite/api_directory_private_draft_review_summary_20260608.json"; json = $true; must = "completed_api_directory_private_draft_review" },
    @{ name = "rapidapi_unpublished_provider_draft_pack_md"; url = "$PublicSite/rapidapi_unpublished_provider_draft_pack_20260608.md"; json = $false; must = "RapidAPI-Style Unpublished Provider Draft Pack" },
    @{ name = "rapidapi_unpublished_provider_draft_pack_json"; url = "$PublicSite/rapidapi_unpublished_provider_draft_pack_20260608.json"; json = $true; must = "ready_for_rapidapi_unpublished_provider_draft_only" },
    @{ name = "rapidapi_unpublished_provider_draft_review_md"; url = "$PublicSite/rapidapi_unpublished_provider_draft_review_report_20260608.md"; json = $false; must = "RapidAPI-Style Unpublished Provider Draft Review" },
    @{ name = "rapidapi_unpublished_provider_draft_review_json"; url = "$PublicSite/rapidapi_unpublished_provider_draft_review_summary_20260608.json"; json = $true; must = "completed_rapidapi_unpublished_provider_draft_review" },
    @{ name = "mcp_tool_registry_private_draft_pack_md"; url = "$PublicSite/mcp_tool_registry_private_draft_pack_20260608.md"; json = $false; must = "MCP Tool Registry Private Draft Pack" },
    @{ name = "mcp_tool_registry_private_draft_pack_json"; url = "$PublicSite/mcp_tool_registry_private_draft_pack_20260608.json"; json = $true; must = "ready_for_mcp_tool_registry_private_draft_only" },
    @{ name = "mcp_tool_registry_private_draft_review_md"; url = "$PublicSite/mcp_tool_registry_private_draft_review_report_20260608.md"; json = $false; must = "MCP Tool Registry Private Draft Review" },
    @{ name = "mcp_tool_registry_private_draft_review_json"; url = "$PublicSite/mcp_tool_registry_private_draft_review_summary_20260608.json"; json = $true; must = "completed_mcp_tool_registry_private_draft_review" },
    @{ name = "machine_public_discovery_nowrite_simulation_md"; url = "$PublicSite/machine_public_discovery_nowrite_simulation_report_20260610.md"; json = $false; must = "Public Machine Discovery NoWrite Simulation" },
    @{ name = "machine_public_discovery_nowrite_simulation_json"; url = "$PublicSite/machine_public_discovery_nowrite_simulation_summary_20260610.json"; json = $true; must = "completed_machine_public_discovery_nowrite" },
    @{ name = "mcp_local_adapter_nowrite_validation_md"; url = "$PublicSite/mcp_local_adapter_nowrite_validation_report_20260610.md"; json = $false; must = "MCP Local Adapter NoWrite Validation" },
    @{ name = "mcp_local_adapter_nowrite_validation_json"; url = "$PublicSite/mcp_local_adapter_nowrite_validation_summary_20260610.json"; json = $true; must = "completed_mcp_local_adapter_nowrite_validation" },
    @{ name = "mcp_write_capped_sandbox_probe_md"; url = "$PublicSite/mcp_write_capped_sandbox_probe_report_20260610.md"; json = $false; must = "MCP Write-Capped Sandbox Probe" },
    @{ name = "mcp_write_capped_sandbox_probe_json"; url = "$PublicSite/mcp_write_capped_sandbox_probe_summary_20260610.json"; json = $true; must = "completed_mcp_write_capped_sandbox_probe" },
    @{ name = "mcp_purchase_decision_probe_md"; url = "$PublicSite/mcp_purchase_decision_probe_report_20260610.md"; json = $false; must = "MCP Purchase Decision Probe" },
    @{ name = "mcp_purchase_decision_probe_json"; url = "$PublicSite/mcp_purchase_decision_probe_summary_20260610.json"; json = $true; must = "completed_mcp_purchase_decision_probe" },
    @{ name = "mcp_verification_gate_probe_md"; url = "$PublicSite/mcp_verification_gate_probe_report_20260610.md"; json = $false; must = "MCP Verification Gate Probe" },
    @{ name = "mcp_verification_gate_probe_json"; url = "$PublicSite/mcp_verification_gate_probe_summary_20260610.json"; json = $true; must = "completed_mcp_verification_gate_probe" },
    @{ name = "mcp_deep_analysis_verification_gate_probe_md"; url = "$PublicSite/mcp_deep_analysis_verification_gate_probe_report_20260610.md"; json = $false; must = "MCP Deep Analysis Verification Gate Probe" },
    @{ name = "mcp_deep_analysis_verification_gate_probe_json"; url = "$PublicSite/mcp_deep_analysis_verification_gate_probe_summary_20260610.json"; json = $true; must = "completed_mcp_deep_analysis_verification_gate_probe" },
    @{ name = "mcp_positive_verification_deep_analysis_probe_md"; url = "$PublicSite/mcp_positive_verification_deep_analysis_probe_report_20260610.md"; json = $false; must = "MCP Positive Verification Deep Analysis Probe" },
    @{ name = "mcp_positive_verification_deep_analysis_probe_json"; url = "$PublicSite/mcp_positive_verification_deep_analysis_probe_summary_20260610.json"; json = $true; must = "completed_mcp_positive_verification_deep_analysis_probe" },
    @{ name = "mcp_action_pack_deep_analysis_gate_probe_md"; url = "$PublicSite/mcp_action_pack_deep_analysis_gate_probe_report_20260610.md"; json = $false; must = "MCP Action Pack Deep Analysis Gate Probe" },
    @{ name = "mcp_action_pack_deep_analysis_gate_probe_json"; url = "$PublicSite/mcp_action_pack_deep_analysis_gate_probe_summary_20260610.json"; json = $true; must = "completed_mcp_action_pack_deep_analysis_gate_probe" },
    @{ name = "mcp_full_chain_idempotency_probe_md"; url = "$PublicSite/mcp_full_chain_idempotency_probe_report_20260611.md"; json = $false; must = "MCP Full Chain Idempotency Probe" },
    @{ name = "mcp_full_chain_idempotency_probe_json"; url = "$PublicSite/mcp_full_chain_idempotency_probe_summary_20260611.json"; json = $true; must = "completed_mcp_full_chain_idempotency_probe" },
    @{ name = "machine_distribution_readiness_nowrite_probe_md"; url = "$PublicSite/machine_distribution_readiness_nowrite_probe_report_20260611.md"; json = $false; must = "Machine Distribution Readiness NoWrite Probe" },
    @{ name = "machine_distribution_readiness_nowrite_probe_json"; url = "$PublicSite/machine_distribution_readiness_nowrite_probe_summary_20260611.json"; json = $true; must = "completed_machine_distribution_readiness_nowrite_probe" },
    @{ name = "machine_channel_rehearsal_nowrite_probe_md"; url = "$PublicSite/machine_channel_rehearsal_nowrite_probe_report_20260611.md"; json = $false; must = "MachineSignal - Channel Publication Rehearsal NoWrite Probe" },
    @{ name = "machine_channel_rehearsal_nowrite_probe_json"; url = "$PublicSite/machine_channel_rehearsal_nowrite_probe_summary_20260611.json"; json = $true; must = "completed_machine_channel_rehearsal_nowrite_probe" },
    @{ name = "postman_private_workspace_rehearsal_nowrite_probe_md"; url = "$PublicSite/postman_private_workspace_rehearsal_nowrite_probe_report_20260611.md"; json = $false; must = "Postman Private Workspace Rehearsal NoWrite Probe" },
    @{ name = "postman_private_workspace_rehearsal_nowrite_probe_json"; url = "$PublicSite/postman_private_workspace_rehearsal_nowrite_probe_summary_20260611.json"; json = $true; must = "completed_postman_private_workspace_rehearsal_nowrite" },
    @{ name = "api_marketplace_draft_rehearsal_nowrite_probe_md"; url = "$PublicSite/api_marketplace_draft_rehearsal_nowrite_probe_report_20260611.md"; json = $false; must = "API Marketplace Draft Rehearsal NoWrite Probe" },
    @{ name = "api_marketplace_draft_rehearsal_nowrite_probe_json"; url = "$PublicSite/api_marketplace_draft_rehearsal_nowrite_probe_summary_20260611.json"; json = $true; must = "completed_api_marketplace_draft_rehearsal_nowrite" },
    @{ name = "marketplace_api_directory_pack_md"; url = "$PublicSite/marketplace_api_directory_pack_20260606.md"; json = $false; must = "Sandbox-Only External Publication Pack" },
    @{ name = "marketplace_api_directory_pack_json"; url = "$PublicSite/marketplace_api_directory_pack_20260606.json"; json = $true; must = "external_publication_policy" },
    @{ name = "marketplace_publication_execution_pack_md"; url = "$PublicSite/marketplace_publication_execution_pack_20260606.md"; json = $false; must = "Sandbox-Only External Publication Pack" },
    @{ name = "marketplace_publication_execution_pack_json"; url = "$PublicSite/marketplace_publication_execution_pack_20260606.json"; json = $true; must = "external_publication_policy" },
    @{ name = "api_directory_submission"; url = "$PublicSite/distribution/api-directory-submission.json"; json = $true; must = "latest_machine_buyer_evidence" },
    @{ name = "rapidapi_listing"; url = "$PublicSite/distribution/rapidapi-listing.json"; json = $true; must = "rapidapi_style_provider_metadata_ready_monetization_disabled" },
    @{ name = "marketplace_submission_pack"; url = "$PublicSite/distribution/marketplace-submission-pack.json"; json = $true; must = "external_publication_policy" },
    @{ name = "postman_workspace_draft"; url = "$PublicSite/distribution/postman-public-workspace-draft.json"; json = $true; must = "ready_for_private_or_team_workspace_setup_public_visibility_blocked_until_owner_approval" },
    @{ name = "postman_private_workspace_checklist_md"; url = "$PublicSite/postman_private_workspace_checklist_20260607.md"; json = $false; must = "Workspace Folder Structure" },
    @{ name = "postman_private_workspace_checklist_json"; url = "$PublicSite/postman_private_workspace_checklist_20260607.json"; json = $true; must = "blocked_actions" },
    @{ name = "mcp_tool_manifest"; url = "$PublicSite/mcp-tool-manifest.json"; json = $true; must = "get_mcp_tool_registry_private_draft_review" },
    @{ name = "well_known_mcp_tool_manifest"; url = "$PublicSite/.well-known/mcp-tool-manifest.json"; json = $true; must = "get_mcp_tool_registry_private_draft_review" },
    @{ name = "well_known_machine_discovery"; url = "$PublicSite/.well-known/machine-discovery.json"; json = $true; must = "api_marketplace_draft_rehearsal_nowrite_probe_json" },
    @{ name = "llms"; url = "$PublicSite/llms.txt"; json = $false; must = "API Marketplace Draft Rehearsal NoWrite Probe JSON" },
    @{ name = "robots"; url = "$PublicSite/robots.txt"; json = $false; must = "Api-marketplace-draft-rehearsal-nowrite-probe-json" },
    @{ name = "sitemap"; url = "$PublicSite/sitemap.xml"; json = $false; must = "api_marketplace_draft_rehearsal_nowrite_probe_summary_20260611.json" },
    @{ name = "openapi"; url = "$PublicSite/openapi.json"; json = $true; must = "action_pack_gate_failed" },
    @{ name = "postman_public_collection"; url = "$PublicSite/postman_public_collection.json"; json = $true; must = "deep_analysis_verification_gate_failed" },
    @{ name = "product_catalog"; url = "$PublicSite/product-catalog.json"; json = $true; must = "action_pack" },
    @{ name = "machine_onboarding"; url = "$PublicSite/machine-onboarding.json"; json = $true; must = "NoWrite" }
)

$checks = New-Object System.Collections.ArrayList
$fetched = @{}

foreach ($resource in $resources) {
    $result = Get-PublicResource -Name $resource.name -Url $resource.url -ExpectJson ([bool]$resource.json)
    $fetched[$resource.name] = $result
    Add-Check -Checks $checks -Name "$($resource.name)_reachable" -Ok ($result.ok) -Details "HTTP $($result.status), bytes=$($result.length)"
    if ($resource.json) {
        Add-Check -Checks $checks -Name "$($resource.name)_json_valid" -Ok ($result.json_ok) -Details "json_valid=$($result.json_ok)"
    }
    Add-Check -Checks $checks -Name "$($resource.name)_contains_expected_marker" -Ok (Test-Contains -Text $result.content -Needle $resource.must) -Details "marker=$($resource.must)"
    Add-Check -Checks $checks -Name "$($resource.name)_secret_scan" -Ok (Test-NoSecretLikeText -Text $result.content) -Details "public content has no secret-like token patterns"
}

$evidence = $fetched["evidence_brief_json"].json
if ($evidence) {
    Add-Check -Checks $checks -Name "evidence_status_completed_full" -Ok ($evidence.status -eq "completed_full" -and $evidence.ok -eq $true) -Details "status=$($evidence.status), ok=$($evidence.ok)"
    Add-Check -Checks $checks -Name "evidence_machine_customer_interface" -Ok ($evidence.primary_customer_interface -eq "machine") -Details "primary_customer_interface=$($evidence.primary_customer_interface)"
    Add-Check -Checks $checks -Name "evidence_no_payment_or_contact" -Ok ($evidence.safety.real_payment_executed -eq $false -and $evidence.safety.external_contact_executed -eq $false -and $evidence.safety.real_invoice_issued -eq $false) -Details "payment=$($evidence.safety.real_payment_executed), contact=$($evidence.safety.external_contact_executed), invoice=$($evidence.safety.real_invoice_issued)"
}

$runner = $fetched["bounded_beta_runner_json"].json
if ($runner) {
    Add-Check -Checks $checks -Name "runner_full_beta_ok" -Ok ($runner.ok -eq $true -and $runner.status -eq "completed_full") -Details "status=$($runner.status), ok=$($runner.ok)"
    Add-Check -Checks $checks -Name "runner_credit_caps_respected" -Ok ([int]$runner.full_run.credit_deltas.score_pack_1k -eq 5 -and [int]$runner.full_run.credit_deltas.deep_analysis_pack_100 -eq 1 -and [int]$runner.full_run.credit_deltas.action_pack_25 -eq 1) -Details "score=$($runner.full_run.credit_deltas.score_pack_1k), deep=$($runner.full_run.credit_deltas.deep_analysis_pack_100), action=$($runner.full_run.credit_deltas.action_pack_25)"
    Add-Check -Checks $checks -Name "runner_safety_flags_false" -Ok ($runner.safety.real_payment_executed -eq $false -and $runner.safety.external_contact_executed -eq $false -and $runner.safety.real_invoice_issued -eq $false) -Details "payment=$($runner.safety.real_payment_executed), contact=$($runner.safety.external_contact_executed), invoice=$($runner.safety.real_invoice_issued)"
}

$sitemapText = [string]$fetched["sitemap"].content
if ($sitemapText) {
    try {
        [xml]$null = $sitemapText
        Add-Check -Checks $checks -Name "sitemap_xml_valid" -Ok $true -Details "valid XML"
    } catch {
        Add-Check -Checks $checks -Name "sitemap_xml_valid" -Ok $false -Details $_.Exception.Message
    }
}

$failed = @($checks | Where-Object { $_.ok -eq $false })
$summary = [ordered]@{
    monitor_name = "machinesignal_distribution_readiness_monitor"
    mode = "NoWrite"
    generated_at = (Get-Date).ToUniversalTime().ToString("o")
    public_site = $PublicSite
    ok = ($failed.Count -eq 0)
    status = if ($failed.Count -eq 0) { "ready_for_distribution_review" } else { "distribution_readiness_failed" }
    alert_level = if ($failed.Count -eq 0) { "OK" } else { "ALERT" }
    write_calls_executed = 0
    post_calls_executed = 0
    real_payment_executed = $false
    external_contact_executed = $false
    resources_checked = $resources.Count
    checks_total = $checks.Count
    checks_failed = $failed.Count
    failed_checks = @($failed | ForEach-Object { $_.name })
    checks = @($checks)
    recommended_next_step = if ($failed.Count -eq 0) {
        "Distribution assets are ready for owner review and sandbox-only external publication preparation. Do not enable live payments or publish real keys."
    } else {
        "Fix failed public discovery checks before external publication."
    }
}

Write-Utf8NoBom -Path $OutputJson -Text ($summary | ConvertTo-Json -Depth 80)

$checkRows = @()
foreach ($check in $summary.checks) {
    $status = if ($check.ok) { "OK" } else { "FAIL" }
    $checkRows += "| $($check.name) | $status | $($check.details) |"
}

$resourceRows = @()
foreach ($resource in $resources) {
    $r = $fetched[$resource.name]
    $jsonStatus = if ($resource.json) { $r.json_ok } else { "n/a" }
    $resourceRows += "| $($resource.name) | $($r.status) | $jsonStatus | $($r.length) |"
}

$md = @"
# MachineSignal Distribution Readiness Monitor - 2026-06-07

Mode: NoWrite

Status: $($summary.status)

Overall OK: $($summary.ok)

Alert level: $($summary.alert_level)

Write calls executed: 0

POST calls executed: 0

## What This Monitor Checks

This monitor verifies that MachineSignal's machine-readable distribution layer is online before external publication preparation:

- marketplace and API directory packs;
- Postman workspace draft;
- MCP manifests and well-known discovery;
- evidence brief and full beta runner evidence;
- llms.txt, robots.txt, sitemap.xml, OpenAPI and Postman collection;
- public files contain no secret-like token patterns.

It performs only public GET requests. It does not create customers, consume credits, execute payments, issue invoices or contact external targets.

## Resources

| Resource | HTTP | JSON valid | Bytes |
|---|---:|---|---:|
$($resourceRows -join "`n")

## Checks

| Check | Status | Details |
|---|---|---|
$($checkRows -join "`n")

## Safety

- Real payment executed: false
- External contact executed: false
- Real invoice issued: false
- Credit-consuming calls executed: false

## Recommended Next Step

$($summary.recommended_next_step)
"@

Write-Utf8NoBom -Path $OutputMarkdown -Text $md

$summary | ConvertTo-Json -Depth 80
