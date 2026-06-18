$ErrorActionPreference = "Stop"

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$mdPath = Join-Path $root "private-evaluator-pack/support_escalation_model_20260618.md"
$jsonPath = Join-Path $root "private-evaluator-pack/support_escalation_model_20260618.json"
$reportPath = Join-Path $root "private-evaluator-pack/support_escalation_model_probe_report_20260618.md"
$summaryPath = Join-Path $root "private-evaluator-pack/support_escalation_model_probe_summary_20260618.json"

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

Add-Check "Documento Markdown presente" (Test-Path $mdPath) "Il modello leggibile deve esistere."
Add-Check "Documento JSON presente" (Test-Path $jsonPath) "Il modello macchina deve esistere."
Add-Check "Lingua italiana dichiarata" ($json.language -eq "it") "Il modello deve essere in italiano."
Add-Check "Stato bozza interna" ($json.status -eq "draft_internal_policy") "Il modello deve restare bozza interna."
Add-Check "Nessuna attivazione commerciale" ($json.commercial_activation -eq $false) "Il modello non deve attivare beta o go-live."

$requiredBlocks = @(
  "real_payments",
  "invoices",
  "monetary_refunds",
  "payment_method_collection",
  "production_api_keys",
  "real_customer_data",
  "personal_data",
  "external_outreach",
  "marketplace_publication",
  "hosted_public_mcp",
  "mcp_registry_publication",
  "commercial_go_live"
)

foreach ($block in $requiredBlocks) {
  Add-Check "Azione vietata dichiarata: $block" ($json.does_not_authorize -contains $block) "Il modello deve confermare che questa azione resta vietata."
}

$requiredLevels = @("L0", "L1", "L2", "L3", "L4")
foreach ($level in $requiredLevels) {
  $found = @($json.support_levels | Where-Object { $_.id -eq $level })
  Add-Check "Livello supporto presente: $level" ($found.Count -eq 1) "Ogni livello L0-L4 deve essere mappato."
}

$requiredIssueClasses = @(
  "invalid_input",
  "duplicate",
  "insufficient_signal",
  "blocked_by_policy",
  "cost_cap_exceeded",
  "technical_error",
  "disputed_output",
  "refund_credit_request",
  "production_key_request",
  "payment_invoice_request",
  "external_publication_request",
  "security_incident"
)

foreach ($issue in $requiredIssueClasses) {
  $found = @($json.issue_classes | Where-Object { $_.id -eq $issue })
  Add-Check "Classe problema presente: $issue" ($found.Count -eq 1) "Ogni classe problema deve essere prevista."
  if ($found.Count -eq 1) {
    Add-Check "Classe problema con risposta: $issue" (-not [string]::IsNullOrWhiteSpace($found[0].automatic_response)) "Ogni classe deve avere risposta automatica."
    Add-Check "Classe problema con escalation: $issue" (-not [string]::IsNullOrWhiteSpace($found[0].escalation)) "Ogni classe deve indicare escalation."
  }
}

$requiredOwnerEscalations = @(
  "real_payment_approval_needed",
  "invoice_needed",
  "real_or_personal_data_request",
  "production_key_request",
  "global_kill_switch_unlock",
  "potential_cost_above_zero",
  "repeated_customer_dispute",
  "policy_listino_terms_change",
  "marketplace_mcp_registry_publication_request",
  "security_incident_suspected",
  "legal_fiscal_reputational_risk"
)

foreach ($rule in $requiredOwnerEscalations) {
  Add-Check "Escalation proprietario presente: $rule" ($json.owner_escalation_required_when -contains $rule) "Le eccezioni critiche devono arrivare al proprietario."
}

$requiredTicketFields = @(
  "ticket_id",
  "timestamp",
  "support_level",
  "support_code",
  "customer_id_or_sandbox_customer_id",
  "request_id",
  "product_code",
  "issue_class",
  "credits_consumed",
  "credit_action",
  "policy_reference",
  "owner_escalation_required",
  "next_action",
  "resolution"
)

foreach ($field in $requiredTicketFields) {
  Add-Check "Campo ticket presente: $field" ($json.ticket_required_fields -contains $field) "Il ticket deve poter ricostruire il caso."
}

$requiredForbidden = @(
  "promise_monetary_refund",
  "promise_invoice",
  "promise_production_key",
  "accept_real_or_personal_data",
  "external_email_or_outreach",
  "change_listino_or_policy_without_approval",
  "unlock_global_cost_cap_without_approval",
  "buy_services_or_upgrades",
  "publish_marketplace_registry_or_hosted_mcp"
)

foreach ($item in $requiredForbidden) {
  Add-Check "Azione supporto vietata: $item" ($json.forbidden_support_actions -contains $item) "Gli agenti non devono fare promesse o attivazioni non approvate."
}

$mustAppearInMd = @(
  "supporto deve essere machine-first",
  "Quando gli agenti possono risolvere da soli",
  "Quando devono scalare al proprietario",
  "Ticket interno",
  "Azioni vietate nel supporto",
  "Divieti confermati"
)

foreach ($phrase in $mustAppearInMd) {
  Add-Check "Frase chiave Markdown: $phrase" ($md -match [regex]::Escape($phrase)) "Il Markdown deve essere comprensibile."
}

$unsafePhrases = @(
  "pagamenti reali attivi",
  "fatture attive",
  "rimborso monetario promesso",
  "chiavi production autorizzate",
  "dati reali autorizzati",
  "outreach autorizzato",
  "go-live commerciale approvato",
  "support_escalation_model approved",
  "commercial go-live approved"
)

$combined = $md + "`n" + (Get-Content -Raw -Encoding UTF8 $jsonPath)
foreach ($phrase in $unsafePhrases) {
  Add-Check "Nessuna frase di attivazione: $phrase" ($combined -notmatch [regex]::Escape($phrase)) "Il modello non deve sembrare un'approvazione."
}

Add-Check "Effetto dashboard corretto" ($json.dashboard_effect.support_escalation_model -eq "red_to_yellow_candidate") "Il modello può solo candidare il blocco a giallo."

$failed = @($checks | Where-Object { -not $_.passed })
$passedCount = @($checks | Where-Object { $_.passed }).Count
$totalCount = $checks.Count
$status = if ($failed.Count -eq 0) { "SUPERATO" } else { "FALLITO" }

$report = @()
$report += "# Report controllo modello supporto/escalation"
$report += ""
$report += "Data controllo: 2026-06-18"
$report += ""
$report += "Esito: $status"
$report += ""
$report += "Controlli superati: $passedCount/$totalCount"
$report += ""
$report += "Sintesi:"
$report += ""
$report += "- Il modello definisce livelli L0-L4, classi problema, ticket e regole di escalation."
$report += "- Gli agenti possono gestire i casi normali, ma devono scalare rischio, costi, dati reali/personali, chiavi production e decisioni commerciali."
$report += "- Il modello non autorizza pagamenti, fatture, dati reali, outreach o go-live."
$report += "- Il blocco support_escalation_model può diventare candidato giallo, ma non verde senza approvazione e simulazione."
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
  probe = "support_escalation_model"
  date = "2026-06-18"
  status = $status
  passed = $passedCount
  total = $totalCount
  failed = @($failed | ForEach-Object { $_.name })
  owner_summary_it = "Modello supporto/escalation creato. I casi normali restano agli agenti; rischio, costi, dati reali/personali, chiavi production e decisioni commerciali scalano al proprietario."
}

$summary | ConvertTo-Json -Depth 6 | Set-Content -Path $summaryPath -Encoding UTF8

if ($failed.Count -gt 0) {
  throw "Support escalation model probe failed: $($failed.Count) failed checks"
}

Write-Output "Probe completato: $passedCount/$totalCount controlli superati."
