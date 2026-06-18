$ErrorActionPreference = "Stop"

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$mdPath = Join-Path $root "private-evaluator-pack/fiscal_admin_readiness_20260618.md"
$jsonPath = Join-Path $root "private-evaluator-pack/fiscal_admin_readiness_20260618.json"
$reportPath = Join-Path $root "private-evaluator-pack/fiscal_admin_readiness_probe_report_20260618.md"
$summaryPath = Join-Path $root "private-evaluator-pack/fiscal_admin_readiness_probe_summary_20260618.json"

$md = Get-Content -Raw -Encoding UTF8 $mdPath
$jsonText = Get-Content -Raw -Encoding UTF8 $jsonPath
$json = $jsonText | ConvertFrom-Json

$checks = New-Object System.Collections.Generic.List[object]

function Add-Check {
  param([string]$Name, [bool]$Passed, [string]$Detail)
  $script:checks.Add([pscustomobject]@{
    name = $Name
    passed = $Passed
    detail = $Detail
  })
}

Add-Check "Documento italiano" ($json.language -eq "it") "Il report deve essere in italiano."
Add-Check "Stato bozza interna non consulenza" ($json.status -eq "draft_internal_readiness_not_tax_advice") "Deve essere una bozza interna, non consulenza fiscale."
Add-Check "Attivazione commerciale falsa" ($json.commercial_activation -eq $false) "Non deve autorizzare attivazione commerciale."
Add-Check "Beta a pagamento non ammessa" ($json.paid_beta_allowed -eq $false) "Non deve autorizzare beta a pagamento."
Add-Check "Pagamenti reali non ammessi" ($json.real_payments_allowed -eq $false) "Non deve autorizzare pagamenti reali."
Add-Check "Fatture non ammesse" ($json.invoices_allowed -eq $false) "Non deve autorizzare fatture."
Add-Check "Raccolta metodo pagamento non ammessa" ($json.payment_method_collection_allowed -eq $false) "Non deve raccogliere carte o metodi di pagamento."
Add-Check "Non e' parere fiscale finale" ($json.final_tax_advice -eq $false) "Non deve sostituire parere fiscale."

$requiredDecisions = @(
  "forma_operativa_per_vendere",
  "partita_iva_o_altra_struttura",
  "codice_attivita_e_regime_fiscale",
  "regole_iva_clienti_italia_ue_extra_ue",
  "documento_fiscale_da_emettere",
  "momento_emissione_documento",
  "dati_minimi_fatturazione",
  "cliente_macchina_con_soggetto_umano_o_societario",
  "riconciliazione_ordini_crediti_pagamenti_fatture",
  "regole_crediti_sostitutivi_riaccrediti_rimborsi",
  "limiti_costo_e_responsabilita_amministrativa",
  "conservazione_documenti_e_registro_operazioni"
)

foreach ($item in $requiredDecisions) {
  Add-Check "Decisione richiesta presente: $item" ($json.decisions_required_before_paid_beta -contains $item) "La checklist deve includere questa decisione."
}

$requiredEconomicObjects = @(
  "pay_per_score",
  "score_pack_1k",
  "deep_analysis_pack",
  "action_pack",
  "api_subscription",
  "replacement_credits",
  "cash_refund"
)

$economicItems = @($json.economic_objects | ForEach-Object { $_.item })
foreach ($item in $requiredEconomicObjects) {
  Add-Check "Oggetto economico presente: $item" ($economicItems -contains $item) "Il modello economico deve essere coperto."
}

$requiredBillingFields = @(
  "customer_type",
  "country",
  "legal_name_or_person_name",
  "billing_address",
  "tax_identifier_if_required",
  "vat_number_if_applicable",
  "admin_email",
  "terms_acceptance",
  "credit_replacement_refund_terms_acceptance",
  "approved_payment_channel",
  "customer_id"
)

foreach ($item in $requiredBillingFields) {
  Add-Check "Campo billing presente: $item" ($json.minimum_billing_profile_fields -contains $item) "Il profilo billing minimo deve includere questo campo."
}

$blocked = $json.blocked_response_example
Add-Check "Risposta bloccata status corretto" ($blocked.status -eq "blocked_by_fiscal_admin_readiness") "La macchina deve ricevere uno stato bloccato."
Add-Check "Risposta bloccata stop" ($blocked.decision -eq "stop") "La decisione deve essere stop."
Add-Check "Crediti consumati zero" ($blocked.credits_consumed -eq 0) "Nessun credito deve essere consumato."
Add-Check "Pagamento falso" ($blocked.payment_executed -eq $false) "Nessun pagamento reale."
Add-Check "Fattura falsa" ($blocked.invoice_issued -eq $false) "Nessuna fattura."
Add-Check "Escalation proprietario richiesta" ($blocked.owner_escalation_required -eq $true) "Serve decisione proprietario."
Add-Check "Support code corretto" ($blocked.support_code -eq "FISCAL_ADMIN_NOT_READY") "Il codice deve essere stabile."

$requiredControls = @(
  "owner_decision_on_fiscal_path",
  "documented_piva_or_alternative_operating_rule",
  "documented_vat_and_fiscal_document_rule",
  "invoice_process_selected",
  "payment_process_selected",
  "minimum_billing_profile_implemented",
  "orders_credits_payments_invoices_reconcilable",
  "replacement_credit_and_refund_rule_approved",
  "sandbox_test_payment_false_invoice_false",
  "pre_production_test_only_after_owner_approval",
  "company_brain_and_dashboard_updated",
  "no_secret_or_personal_data_published"
)

foreach ($item in $requiredControls) {
  Add-Check "Controllo prima del verde presente: $item" ($json.minimum_controls_before_green -contains $item) "Il gate verde deve richiedere questo controllo."
}

$requiredMay = @(
  "prepare_fiscal_admin_checklists",
  "generate_owner_questions",
  "simulate_order_reconciliation_without_real_money",
  "verify_blocked_api_responses",
  "update_pnl_and_sandbox_ledger",
  "verify_no_invoices_are_issued",
  "propose_billing_profile_fields",
  "prepare_italian_reports"
)

foreach ($item in $requiredMay) {
  Add-Check "Azione agente ammessa: $item" ($json.agents_may_do -contains $item) "Gli agenti devono poter preparare senza attivare."
}

$requiredMustNot = @(
  "decide_finally_whether_piva_is_required",
  "replace_official_tax_advice",
  "execute_real_payment",
  "issue_invoice",
  "collect_card_or_payment_method",
  "activate_real_subscription",
  "convert_simulation_to_real_sale",
  "declare_business_tax_ready"
)

foreach ($item in $requiredMustNot) {
  Add-Check "Divieto agente presente: $item" ($json.agents_must_not_do -contains $item) "Gli agenti non devono fare questa azione."
}

Add-Check "Effetto dashboard candidato giallo" ($json.dashboard_effect.fiscal_admin_readiness -eq "red_to_yellow_candidate") "Il documento deve proporre solo candidato giallo."
Add-Check "Prossima azione sandbox/no-write" ($json.next_safe_action -eq "prepare_or_verify_billing_profile_required_flow_in_sandbox_nowrite") "La prossima azione deve restare no-write/sandbox."

$requiredMdPhrases = @(
  "non consulenza fiscale",
  "non approvazione commerciale",
  "Regola principale",
  "Cosa deve essere deciso prima della beta a pagamento",
  "Billing profile minimo",
  "Risposta macchina per acquisto non pronto",
  "Controlli minimi prima del passaggio a verde",
  "Gli agenti non possono",
  "da rosso a candidato giallo"
)

foreach ($phrase in $requiredMdPhrases) {
  Add-Check "Frase MD presente: $phrase" ($md -match [regex]::Escape($phrase)) "Il Markdown deve spiegare chiaramente questo punto."
}

$combined = "$md`n$jsonText"
$unsafePhrases = @(
  '"paid_beta_allowed": true',
  '"real_payments_allowed": true',
  '"invoices_allowed": true',
  '"payment_method_collection_allowed": true',
  '"final_tax_advice": true',
  "Partita IVA non serve",
  "Partita IVA non e' necessaria",
  "puoi incassare",
  "puoi emettere fattura",
  "fiscalmente pronto",
  "tax ready",
  "commercial activation approved",
  "paid beta approved",
  "real payments active",
  '"invoice_issued": true'
)

foreach ($phrase in $unsafePhrases) {
  Add-Check "Nessuna frase pericolosa: $phrase" ($combined -notmatch [regex]::Escape($phrase)) "Non devono comparire affermazioni fiscali o commerciali non autorizzate."
}

$failed = @($checks | Where-Object { -not $_.passed })
$passedCount = @($checks | Where-Object { $_.passed }).Count
$totalCount = $checks.Count
$status = if ($failed.Count -eq 0) { "SUPERATO" } else { "FALLITO" }

$report = @()
$report += "# Report controllo Fiscal/Admin Readiness"
$report += ""
$report += "Data controllo: 2026-06-18"
$report += ""
$report += "Esito: $status"
$report += ""
$report += "Controlli superati: $passedCount/$totalCount"
$report += ""
$report += "Sintesi:"
$report += ""
$report += "- Il documento fiscal/admin e' una bozza interna, non una consulenza fiscale."
$report += "- Non autorizza pagamenti, fatture, metodi di pagamento, abbonamenti reali o beta a pagamento."
$report += "- Definisce decisioni, campi billing, oggetti economici e blocchi macchina."
$report += "- Propone fiscal_admin_readiness come candidato giallo, non come gate verde."
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
  probe = "fiscal_admin_readiness"
  date = "2026-06-18"
  status = $status
  passed = $passedCount
  total = $totalCount
  failed = @($failed | ForEach-Object { $_.name })
  owner_summary_it = "Fiscal/Admin Readiness e' una bozza interna verificata: prepara decisioni e blocchi, ma non autorizza pagamenti, fatture, metodi di pagamento o beta a pagamento."
}

$summary | ConvertTo-Json -Depth 6 | Set-Content -Path $summaryPath -Encoding UTF8

if ($failed.Count -gt 0) {
  throw "Fiscal/Admin readiness probe failed: $($failed.Count) failed checks"
}

Write-Output "Probe completato: $passedCount/$totalCount controlli superati."
