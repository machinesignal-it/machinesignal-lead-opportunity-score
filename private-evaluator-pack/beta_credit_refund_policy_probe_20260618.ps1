$ErrorActionPreference = "Stop"

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$mdPath = Join-Path $root "private-evaluator-pack/beta_credit_refund_policy_20260618.md"
$jsonPath = Join-Path $root "private-evaluator-pack/beta_credit_refund_policy_20260618.json"
$reportPath = Join-Path $root "private-evaluator-pack/beta_credit_refund_policy_probe_report_20260618.md"
$summaryPath = Join-Path $root "private-evaluator-pack/beta_credit_refund_policy_probe_summary_20260618.json"

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

Add-Check "Documento Markdown presente" (Test-Path $mdPath) "La policy leggibile deve esistere."
Add-Check "Documento JSON presente" (Test-Path $jsonPath) "La policy macchina deve esistere."
Add-Check "Lingua italiana dichiarata" ($json.language -eq "it") "La policy owner-facing deve essere in italiano."
Add-Check "Stato bozza interna" ($json.status -eq "draft_internal_policy") "La policy deve essere una bozza interna."
Add-Check "Nessuna attivazione commerciale" ($json.commercial_activation -eq $false) "La policy non deve attivare beta o go-live."
Add-Check "Nessun rimborso monetario reale" ($json.real_monetary_refunds -eq $false) "In beta il rimborso deve essere solo tecnico."
Add-Check "Sintesi italiana presente" ($json.summary_it -match "credito") "Il JSON deve contenere sintesi chiara per il proprietario."

$requiredBlocks = @(
  "real_payments",
  "invoices",
  "monetary_refunds",
  "payment_method_collection",
  "production_api_keys",
  "real_customer_data",
  "personal_data",
  "external_outreach",
  "commercial_go_live"
)

foreach ($block in $requiredBlocks) {
  Add-Check "Azione vietata dichiarata: $block" ($json.does_not_authorize -contains $block) "La policy deve confermare che questa azione resta vietata."
}

$requiredProducts = @(
  "target_discovery",
  "score_pack_1k",
  "domain_enrichment",
  "deep_analysis",
  "action_pack",
  "opportunity_feed",
  "api_starter",
  "api_pro"
)

foreach ($product in $requiredProducts) {
  $rule = @($json.product_rules | Where-Object { $_.product_code -eq $product })
  Add-Check "Regola prodotto presente: $product" ($rule.Count -eq 1) "Ogni prodotto principale deve avere una regola crediti."
  if ($rule.Count -eq 1) {
    Add-Check "Regola consumo presente: $product" (-not [string]::IsNullOrWhiteSpace($rule[0].consumes_it)) "Deve dire quando consuma."
    Add-Check "Regola non consumo presente: $product" (-not [string]::IsNullOrWhiteSpace($rule[0].does_not_consume_it)) "Deve dire quando non consuma."
  }
}

$requiredLedgerFields = @(
  "event_id",
  "timestamp",
  "customer_id_or_sandbox_customer_id",
  "request_id",
  "product_code",
  "operation_type",
  "input_hash",
  "output_status",
  "credits_before",
  "credits_delta",
  "credits_after",
  "policy_version",
  "environment"
)

foreach ($field in $requiredLedgerFields) {
  Add-Check "Campo ledger presente: $field" ($json.ledger_required_fields -contains $field) "Il ledger deve poter spiegare e ricostruire il consumo crediti."
}

$requiredStatuses = @(
  "valid_output",
  "invalid_input",
  "duplicate",
  "insufficient_signal",
  "technical_error",
  "blocked_by_policy",
  "credit_restored"
)

foreach ($status in $requiredStatuses) {
  Add-Check "Status output presente: $status" ($json.output_statuses -contains $status) "Gli status devono coprire casi validi e non validi."
}

$mustAppearInMd = @(
  "Un credito si consuma solo",
  "credito non si consuma",
  "rimborso tecnico",
  "Ledger crediti",
  "Divieti confermati",
  "Nessun pagamento reale"
)

foreach ($phrase in $mustAppearInMd) {
  Add-Check "Frase chiave Markdown: $phrase" ($md -match [regex]::Escape($phrase)) "Il Markdown deve essere comprensibile per il proprietario."
}

$unsafePhrases = @(
  "pagamenti reali attivi",
  "fatture attive",
  "rimborso monetario attivo",
  "raccolta carte attiva",
  "chiavi production autorizzate",
  "dati reali autorizzati",
  "go-live commerciale approvato",
  "real payments active",
  "production keys approved",
  "commercial go-live approved"
)

$combined = $md + "`n" + (Get-Content -Raw -Encoding UTF8 $jsonPath)
foreach ($phrase in $unsafePhrases) {
  Add-Check "Nessuna frase di attivazione: $phrase" ($combined -notmatch [regex]::Escape($phrase)) "La policy non deve sembrare un'approvazione."
}

Add-Check "Effetto dashboard corretto" ($json.dashboard_effect.credit_refund_policy -eq "red_to_yellow_candidate") "La policy può solo candidare il blocco a giallo, non verde."
Add-Check "Approvazione proprietario richiesta" ($json.owner_approval_required_for -contains "credit_refund_policy") "Serve approvazione esplicita del proprietario."

$failed = @($checks | Where-Object { -not $_.passed })
$passedCount = @($checks | Where-Object { $_.passed }).Count
$totalCount = $checks.Count
$status = if ($failed.Count -eq 0) { "SUPERATO" } else { "FALLITO" }

$report = @()
$report += "# Report controllo policy crediti/rimborsi beta"
$report += ""
$report += "Data controllo: 2026-06-18"
$report += ""
$report += "Esito: $status"
$report += ""
$report += "Controlli superati: $passedCount/$totalCount"
$report += ""
$report += "Sintesi:"
$report += ""
$report += "- La policy definisce quando un credito si consuma, non si consuma o viene ripristinato."
$report += "- Il rimborso previsto in beta è solo tecnico, cioè ripristino credito."
$report += "- La policy non autorizza pagamenti, fatture, dati reali, chiavi production o go-live."
$report += "- Il blocco credit_refund_policy può diventare candidato giallo, ma non verde senza approvazione."
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
  probe = "beta_credit_refund_policy"
  date = "2026-06-18"
  status = $status
  passed = $passedCount
  total = $totalCount
  failed = @($failed | ForEach-Object { $_.name })
  owner_summary_it = "Policy crediti/rimborsi beta creata. Definisce consumo, non consumo e ripristino crediti. Nessun pagamento reale o rimborso monetario autorizzato."
}

$summary | ConvertTo-Json -Depth 6 | Set-Content -Path $summaryPath -Encoding UTF8

if ($failed.Count -gt 0) {
  throw "Beta credit refund policy probe failed: $($failed.Count) failed checks"
}

Write-Output "Probe completato: $passedCount/$totalCount controlli superati."
