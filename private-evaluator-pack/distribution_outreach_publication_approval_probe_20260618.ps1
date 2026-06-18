$ErrorActionPreference = "Stop"

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$mdPath = Join-Path $root "private-evaluator-pack/distribution_outreach_publication_approval_20260618.md"
$jsonPath = Join-Path $root "private-evaluator-pack/distribution_outreach_publication_approval_20260618.json"
$reportPath = Join-Path $root "private-evaluator-pack/distribution_outreach_publication_approval_probe_report_20260618.md"
$summaryPath = Join-Path $root "private-evaluator-pack/distribution_outreach_publication_approval_probe_summary_20260618.json"

$md = Get-Content -Raw -Encoding UTF8 $mdPath
$json = Get-Content -Raw -Encoding UTF8 $jsonPath | ConvertFrom-Json

$checks = New-Object System.Collections.Generic.List[object]

function Add-Check {
  param([string]$Name, [bool]$Passed, [string]$Detail)
  $script:checks.Add([pscustomobject]@{
    name = $Name
    passed = $Passed
    detail = $Detail
  })
}

Add-Check "Documento Markdown presente" (Test-Path $mdPath) "La bozza leggibile deve esistere."
Add-Check "Documento JSON presente" (Test-Path $jsonPath) "La bozza macchina deve esistere."
Add-Check "Lingua italiana dichiarata" ($json.language -eq "it") "La bozza deve essere in italiano."
Add-Check "Stato bozza interna" ($json.status -eq "draft_internal_policy") "La bozza deve restare interna."
Add-Check "Nessuna attivazione commerciale" ($json.commercial_activation -eq $false) "La bozza non deve attivare go-live."
Add-Check "Outreach esterno non consentito" ($json.external_outreach_allowed -eq $false) "L'outreach deve restare bloccato."
Add-Check "Marketplace non consentito" ($json.marketplace_publication_allowed -eq $false) "Marketplace deve restare bloccato."
Add-Check "Hosted MCP pubblico non consentito" ($json.hosted_public_mcp_allowed -eq $false) "Hosted MCP pubblico deve restare bloccato."
Add-Check "MCP registry non consentita" ($json.mcp_registry_submission_allowed -eq $false) "MCP registry deve restare bloccata."

$requiredBlocks = @(
  "real_payments",
  "invoices",
  "payment_method_collection",
  "production_api_keys",
  "real_customer_data",
  "personal_data",
  "external_outreach",
  "email_sending_to_external_humans",
  "api_marketplace_publication",
  "marketplace_publication",
  "hosted_public_mcp",
  "mcp_registry_publication",
  "zapier_public_app",
  "public_plugin_publication",
  "commercial_go_live"
)

foreach ($block in $requiredBlocks) {
  Add-Check "Azione vietata dichiarata: $block" ($json.does_not_authorize -contains $block) "La bozza deve confermare che questa azione resta vietata."
}

$requiredAllowed = @(
  "machinesignal_informational_site",
  "api_page",
  "beta_page",
  "llms_txt",
  "product_catalog_json",
  "machine_onboarding_json",
  "openapi_json",
  "postman_public_collection_json",
  "machine_discovery_pack_json",
  "sandbox_public_docs_md",
  "sandbox_public_docs_json",
  "github_readme"
)

foreach ($item in $requiredAllowed) {
  Add-Check "Canale consentito presente: $item" ($json.allowed_now -contains $item) "I canali machine-readable consentiti devono essere espliciti."
}

$requiredBlocked = @(
  "external_human_email_outreach",
  "manual_or_automated_human_outreach",
  "paid_api_marketplace",
  "rapidapi_or_similar_publication",
  "mcp_registry_submission",
  "hosted_public_mcp_launch",
  "zapier_marketplace_or_public_app",
  "public_plugin_publication",
  "agent_directory_publication",
  "real_payment_offer",
  "production_or_enterprise_readiness_claim",
  "real_or_personal_data_demo",
  "secret_or_token_publication"
)

foreach ($item in $requiredBlocked) {
  Add-Check "Canale vietato presente: $item" ($json.blocked_without_owner_approval -contains $item) "I canali rischiosi devono essere espliciti."
}

$requiredChannels = @(
  "machinesignal_site",
  "api_page",
  "beta_page",
  "github_readme",
  "openapi",
  "postman_collection",
  "llms_txt",
  "api_marketplace",
  "mcp_registry",
  "hosted_public_mcp",
  "email_outbound"
)

foreach ($channel in $requiredChannels) {
  $found = @($json.channel_status | Where-Object { $_.channel -eq $channel })
  Add-Check "Canale mappato: $channel" ($found.Count -eq 1) "Ogni canale principale deve essere mappato."
  if ($found.Count -eq 1) {
    Add-Check "Canale con status: $channel" (-not [string]::IsNullOrWhiteSpace($found[0].status)) "Ogni canale deve avere status."
  }
}

$requiredPrecheck = @(
  "no_secrets",
  "no_real_or_personal_data",
  "no_go_live_claim",
  "no_active_payment",
  "no_invoice_promise",
  "no_production_key",
  "clear_sandbox_non_commercial_status",
  "nowrite_probe_passed",
  "owner_approval_for_marketplace_registry_hosted_mcp_public_app_or_external_contact"
)

foreach ($item in $requiredPrecheck) {
  Add-Check "Precheck pubblicazione presente: $item" ($json.publication_precheck -contains $item) "Ogni pubblicazione nuova deve passare precheck."
}

Add-Check "Risposta blocco distribuzione non consuma crediti" ($json.blocked_response_example.credits_consumed -eq 0) "Un canale bloccato non deve consumare crediti."
Add-Check "Risposta blocco distribuzione richiede escalation" ($json.blocked_response_example.owner_escalation_required -eq $true) "Canali vietati devono scalare."
Add-Check "Risposta blocco distribuzione dice stop" ($json.blocked_response_example.decision -eq "stop") "La macchina deve fermarsi."

$requiredAgentForbidden = @(
  "send_external_emails",
  "contact_people",
  "publish_to_marketplace",
  "submit_mcp_registry",
  "launch_hosted_public_mcp",
  "publish_zapier_or_public_plugin",
  "activate_payments",
  "promise_production_availability",
  "publish_real_or_personal_data",
  "publish_secrets",
  "use_accounts_or_tokens_for_unapproved_external_actions"
)

foreach ($item in $requiredAgentForbidden) {
  Add-Check "Azione agente vietata: $item" ($json.agent_must_not_do -contains $item) "Gli agenti non devono superare i blocchi di distribuzione."
}

$requiredOwnerApproval = @(
  "any_external_outreach",
  "api_marketplace",
  "mcp_registry",
  "hosted_public_mcp",
  "public_app_or_plugin",
  "active_commercial_offer_publication",
  "compliance_security_enterprise_claim",
  "any_step_that_can_generate_real_customers_payments_or_production_requests"
)

foreach ($item in $requiredOwnerApproval) {
  Add-Check "Owner approval richiesta: $item" ($json.owner_approval_required_for -contains $item) "Questi passaggi devono restare a decisione del proprietario."
}

$mustAppearInMd = @(
  "documentazione e file machine-readable",
  "Distribuzione vietata senza approvazione",
  "Regola machine-first",
  "Regola pubblicazione",
  "Risposta macchina per canale vietato",
  "Divieti confermati"
)

foreach ($phrase in $mustAppearInMd) {
  Add-Check "Frase chiave Markdown: $phrase" ($md -match [regex]::Escape($phrase)) "Il Markdown deve essere chiaro per il proprietario."
}

$unsafePhrases = @(
  "outreach allowed",
  "marketplace publication allowed",
  "hosted public MCP allowed",
  "MCP registry approved",
  "commercial go-live approved",
  "real payments active",
  "production keys approved",
  "outreach approvato",
  "marketplace approvato",
  "MCP pubblico approvato",
  "go-live commerciale approvato",
  "pagamenti reali attivi"
)

$combined = $md + "`n" + (Get-Content -Raw -Encoding UTF8 $jsonPath)
foreach ($phrase in $unsafePhrases) {
  Add-Check "Nessuna frase di attivazione: $phrase" ($combined -notmatch [regex]::Escape($phrase)) "La bozza non deve sembrare un'approvazione."
}

Add-Check "Effetto dashboard corretto" ($json.dashboard_effect.distribution_outreach_publication_approval -eq "red_to_yellow_candidate") "La bozza può solo candidare il blocco a giallo."

$failed = @($checks | Where-Object { -not $_.passed })
$passedCount = @($checks | Where-Object { $_.passed }).Count
$totalCount = $checks.Count
$status = if ($failed.Count -eq 0) { "SUPERATO" } else { "FALLITO" }

$report = @()
$report += "# Report controllo distribution/outreach/publication approval"
$report += ""
$report += "Data controllo: 2026-06-18"
$report += ""
$report += "Esito: $status"
$report += ""
$report += "Controlli superati: $passedCount/$totalCount"
$report += ""
$report += "Sintesi:"
$report += ""
$report += "- La bozza distingue distribuzione machine-readable consentita da outreach e pubblicazioni vietate."
$report += "- Outreach umano, marketplace, hosted MCP pubblico e MCP registry restano bloccati senza approvazione."
$report += "- Il blocco distribution_outreach_publication_approval può diventare candidato giallo, ma non verde senza approvazione e checklist pre-pubblicazione."
$report += ""
$report += "Dettaglio controlli:"
$report += ""
foreach ($check in $checks) {
  $mark = if ($check.passed) { "OK" } else { "KO" }
  $report += "- [$mark] $($check.name): $($check.detail)"
}

if ($failed.Count -gt 0) {
  $report += ""
  $report += "Controlli falliti:"
  foreach ($check in $failed) {
    $report += "- $($check.name): $($check.detail)"
  }
}

Set-Content -Path $reportPath -Value ($report -join "`n") -Encoding UTF8

$summary = [pscustomobject]@{
  probe = "distribution_outreach_publication_approval"
  date = "2026-06-18"
  status = $status
  passed = $passedCount
  total = $totalCount
  failed = @($failed | ForEach-Object { $_.name })
  owner_summary_it = "Bozza distribution/outreach/publication creata. Canali machine-readable sandbox consentiti; outreach umano, marketplace, hosted MCP pubblico e MCP registry restano bloccati senza approvazione."
}

$summary | ConvertTo-Json -Depth 6 | Set-Content -Path $summaryPath -Encoding UTF8

if ($failed.Count -gt 0) {
  throw "Distribution/outreach/publication approval probe failed: $($failed.Count) failed checks"
}

Write-Output "Probe completato: $passedCount/$totalCount controlli superati."
