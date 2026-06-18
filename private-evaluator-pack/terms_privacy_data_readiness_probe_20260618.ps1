$ErrorActionPreference = "Stop"

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$mdPath = Join-Path $root "private-evaluator-pack/terms_privacy_data_readiness_20260618.md"
$jsonPath = Join-Path $root "private-evaluator-pack/terms_privacy_data_readiness_20260618.json"
$reportPath = Join-Path $root "private-evaluator-pack/terms_privacy_data_readiness_probe_report_20260618.md"
$summaryPath = Join-Path $root "private-evaluator-pack/terms_privacy_data_readiness_probe_summary_20260618.json"

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
Add-Check "Nessuna attivazione commerciale" ($json.commercial_activation -eq $false) "La bozza non deve attivare beta o go-live."
Add-Check "Non legale finale" ($json.legal_final -eq $false) "Non deve sembrare testo legale finale."
Add-Check "Privacy non finale" ($json.privacy_final -eq $false) "Non deve sembrare privacy finale."
Add-Check "Dati reali non ammessi" ($json.real_data_allowed -eq $false) "I dati reali devono restare bloccati."
Add-Check "Dati personali non ammessi" ($json.personal_data_allowed -eq $false) "I dati personali devono restare bloccati."

$requiredBlocks = @(
  "real_payments",
  "invoices",
  "payment_method_collection",
  "production_api_keys",
  "real_customer_data",
  "personal_data",
  "sensitive_data",
  "external_outreach",
  "marketplace_publication",
  "hosted_public_mcp",
  "mcp_registry_publication",
  "commercial_go_live"
)

foreach ($block in $requiredBlocks) {
  Add-Check "Azione vietata dichiarata: $block" ($json.does_not_authorize -contains $block) "La bozza deve confermare che questa azione resta vietata."
}

$requiredAllowed = @(
  "demo_domains",
  "synthetic_companies",
  "synthetic_datasets",
  "sandbox_requests_without_real_or_personal_data",
  "simulated_outputs",
  "nowrite_tests"
)

foreach ($item in $requiredAllowed) {
  Add-Check "Dato consentito ora presente: $item" ($json.allowed_now -contains $item) "Devono essere chiari i soli dati ammessi ora."
}

$requiredBlocked = @(
  "personal_data",
  "natural_person_names",
  "personal_or_identifiable_emails",
  "phone_numbers",
  "real_customer_or_prospect_lists",
  "purchased_databases",
  "personal_data_scraping",
  "sensitive_information",
  "real_customer_file_uploads",
  "real_campaign_processing",
  "person_profiling",
  "person_scoring"
)

foreach ($item in $requiredBlocked) {
  Add-Check "Dato vietato ora presente: $item" ($json.blocked_now -contains $item) "Devono essere chiari i dati vietati ora."
}

$requiredInputClasses = @(
  "synthetic_ok",
  "demo_domain_ok",
  "public_company_domain_low_risk",
  "real_company_dataset_blocked",
  "personal_data_blocked",
  "sensitive_data_blocked",
  "unknown_requires_review"
)

foreach ($class in $requiredInputClasses) {
  Add-Check "Classe input presente: $class" ($json.input_classes -contains $class) "Ogni input deve essere classificabile."
}

foreach ($class in @("real_company_dataset_blocked", "personal_data_blocked", "sensitive_data_blocked", "unknown_requires_review")) {
  Add-Check "Classe input bloccata: $class" ($json.blocked_input_classes -contains $class) "Le classi rischiose devono bloccare."
}

Add-Check "Risposta blocco dati non consuma crediti" ($json.blocked_response_example.credits_consumed -eq 0) "Un input dati bloccato non deve consumare crediti."
Add-Check "Risposta blocco dati richiede escalation" ($json.blocked_response_example.owner_escalation_required -eq $true) "Dati reali/personali devono scalare."

$requiredTerms = @(
  "terms_of_use",
  "service_description",
  "liability_limitations",
  "automated_output_rules",
  "score_and_decision_rules",
  "no_person_decisioning_rule",
  "credit_consumption_and_restoration_rules",
  "support_and_escalation_rules",
  "cost_cap_and_kill_switch_rules",
  "api_key_and_revocation_rules",
  "allowed_and_blocked_data_rules"
)

foreach ($item in $requiredTerms) {
  Add-Check "Termine richiesto presente: $item" ($json.terms_required_before_paid_beta -contains $item) "I termini minimi devono essere elencati."
}

$requiredPrivacy = @(
  "privacy_policy",
  "data_processing_note",
  "allowed_data_categories",
  "blocked_data_categories",
  "retention_policy",
  "deletion_policy",
  "incident_contact_path",
  "personal_data_block_until_approval"
)

foreach ($item in $requiredPrivacy) {
  Add-Check "Privacy richiesta presente: $item" ($json.privacy_required_before_paid_beta -contains $item) "La privacy minima deve essere elencata."
}

$requiredProducts = @("target_discovery", "score_pack_1k", "domain_enrichment", "deep_analysis", "action_pack", "opportunity_feed", "api_starter", "api_pro")
foreach ($product in $requiredProducts) {
  $found = @($json.product_data_rules | Where-Object { $_.product_code -eq $product })
  Add-Check "Regola dati prodotto presente: $product" ($found.Count -eq 1) "Ogni prodotto principale deve avere regole dati."
  if ($found.Count -eq 1) {
    Add-Check "Regola dati ammessi prodotto: $product" (-not [string]::IsNullOrWhiteSpace($found[0].allowed_now_it)) "Ogni prodotto deve dire cosa è ammesso."
    Add-Check "Regola dati vietati prodotto: $product" (-not [string]::IsNullOrWhiteSpace($found[0].blocked_now_it)) "Ogni prodotto deve dire cosa è vietato."
  }
}

$mustAppearInMd = @(
  "solo con dati sintetici",
  "vietato ora",
  "Regola input",
  "Risposta macchina per dati bloccati",
  "Divieti confermati",
  "Nessun dato personale"
)

foreach ($phrase in $mustAppearInMd) {
  Add-Check "Frase chiave Markdown: $phrase" ($md -match [regex]::Escape($phrase)) "Il Markdown deve essere chiaro per il proprietario."
}

$unsafePhrases = @(
  "dati reali ammessi",
  "dati personali ammessi",
  "privacy finale approvata",
  "termini approvati",
  "pagamenti reali attivi",
  "chiavi production autorizzate",
  "go-live commerciale approvato",
  "real data allowed",
  "personal data allowed",
  "commercial go-live approved"
)

$combined = $md + "`n" + (Get-Content -Raw -Encoding UTF8 $jsonPath)
foreach ($phrase in $unsafePhrases) {
  Add-Check "Nessuna frase di attivazione: $phrase" ($combined -notmatch [regex]::Escape($phrase)) "La bozza non deve sembrare un'approvazione."
}

Add-Check "Effetto dashboard corretto" ($json.dashboard_effect.terms_privacy_data_readiness -eq "red_to_yellow_candidate") "La bozza può solo candidare il blocco a giallo."

$failed = @($checks | Where-Object { -not $_.passed })
$passedCount = @($checks | Where-Object { $_.passed }).Count
$totalCount = $checks.Count
$status = if ($failed.Count -eq 0) { "SUPERATO" } else { "FALLITO" }

$report = @()
$report += "# Report controllo terms/privacy/data readiness"
$report += ""
$report += "Data controllo: 2026-06-18"
$report += ""
$report += "Esito: $status"
$report += ""
$report += "Controlli superati: $passedCount/$totalCount"
$report += ""
$report += "Sintesi:"
$report += ""
$report += "- La bozza definisce dati ammessi e vietati in sandbox."
$report += "- Dati reali e personali restano bloccati."
$report += "- Termini e privacy non sono finali e non sono approvati."
$report += "- Il blocco terms_privacy_data_readiness può diventare candidato giallo, ma non verde senza approvazione, testi finali e filtro tecnico."
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
  probe = "terms_privacy_data_readiness"
  date = "2026-06-18"
  status = $status
  passed = $passedCount
  total = $totalCount
  failed = @($failed | ForEach-Object { $_.name })
  owner_summary_it = "Bozza terms/privacy/data readiness creata. Dati reali e personali restano bloccati; termini e privacy non sono finali né approvati."
}

$summary | ConvertTo-Json -Depth 6 | Set-Content -Path $summaryPath -Encoding UTF8

if ($failed.Count -gt 0) {
  throw "Terms/privacy/data readiness probe failed: $($failed.Count) failed checks"
}

Write-Output "Probe completato: $passedCount/$totalCount controlli superati."
