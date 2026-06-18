$ErrorActionPreference = "Stop"

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$mdPath = Join-Path $root "private-evaluator-pack/payment_invoice_readiness_20260618.md"
$jsonPath = Join-Path $root "private-evaluator-pack/payment_invoice_readiness_20260618.json"
$reportPath = Join-Path $root "private-evaluator-pack/payment_invoice_readiness_probe_report_20260618.md"
$summaryPath = Join-Path $root "private-evaluator-pack/payment_invoice_readiness_probe_summary_20260618.json"

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
Add-Check "Stato bozza interna" ($json.status -eq "draft_internal_readiness_not_payment_activation") "Deve essere una bozza interna, non attivazione."
Add-Check "Attivazione commerciale falsa" ($json.commercial_activation -eq $false) "Non deve autorizzare attivazione commerciale."
Add-Check "Live payment non ammesso" ($json.live_payment_allowed -eq $false) "Non deve autorizzare pagamenti reali."
Add-Check "Live checkout non ammesso" ($json.live_checkout_allowed -eq $false) "Non deve autorizzare checkout live."
Add-Check "Raccolta metodo pagamento non ammessa" ($json.payment_method_collection_allowed -eq $false) "Non deve raccogliere carte o metodi di pagamento."
Add-Check "Fattura non ammessa" ($json.invoice_generation_allowed -eq $false) "Non deve generare fatture reali."
Add-Check "Abbonamento reale non ammesso" ($json.subscription_activation_allowed -eq $false) "Non deve attivare abbonamenti reali."

$allowed = @(
  "sandbox_purchase_intent",
  "payment_test_intent",
  "payment_test_reconciliation",
  "blocked_live_payment_response",
  "ledger_mapping_draft",
  "provider_checklist_draft"
)
foreach ($item in $allowed) {
  Add-Check "Stato ammesso presente: $item" ($json.allowed_now -contains $item) "Questo stato deve essere ammesso solo in sandbox/preparazione."
}

$blocked = @(
  "live_payment",
  "live_checkout",
  "payment_method_collection",
  "invoice_generation",
  "subscription_activation",
  "live_payment_provider_keys",
  "real_card_data",
  "real_invoice_document",
  "real_refund_execution"
)
foreach ($item in $blocked) {
  Add-Check "Stato bloccato presente: $item" ($json.blocked_now -contains $item) "Questo stato deve restare bloccato."
}

$response = $json.machine_blocked_response_example
Add-Check "Risposta bloccata status corretto" ($response.status -eq "blocked_by_payment_invoice_readiness") "La macchina deve ricevere uno stato bloccato."
Add-Check "Risposta bloccata stop" ($response.decision -eq "stop") "La decisione deve essere stop."
Add-Check "Crediti consumati zero" ($response.credits_consumed -eq 0) "Nessun credito deve essere consumato."
Add-Check "Pagamento falso" ($response.payment_executed -eq $false) "Nessun pagamento reale."
Add-Check "Metodo pagamento non raccolto" ($response.payment_method_collected -eq $false) "Nessun metodo di pagamento raccolto."
Add-Check "Fattura falsa" ($response.invoice_issued -eq $false) "Nessuna fattura."
Add-Check "Abbonamento falso" ($response.subscription_activated -eq $false) "Nessun abbonamento reale."
Add-Check "Escalation proprietario richiesta" ($response.owner_escalation_required -eq $true) "Serve decisione proprietario."
Add-Check "Support code corretto" ($response.support_code -eq "PAYMENT_INVOICE_NOT_READY") "Il codice deve essere stabile."

$providerDecisions = @(
  "candidate_provider",
  "test_mode_and_live_mode_separation",
  "owner_who_can_switch_test_to_live",
  "secret_storage_location",
  "key_rotation_and_revocation",
  "allowed_webhooks",
  "valid_webhook_events",
  "provider_to_internal_ledger_reconciliation",
  "failure_chargeback_refund_handling",
  "fraud_and_abuse_limits"
)
foreach ($item in $providerDecisions) {
  Add-Check "Decisione provider presente: $item" ($json.payment_provider_decisions_required -contains $item) "La checklist provider deve includere questo punto."
}

$invoiceDecisions = @(
  "whether_and_when_to_issue_invoice_or_document",
  "issuer_identity",
  "mandatory_billing_data",
  "vat_and_customer_country_rule",
  "issue_timing",
  "credit_purchase_vs_credit_consumption_relation",
  "credit_note_or_recredit_rule",
  "document_retention",
  "numbering_and_audit_trail"
)
foreach ($item in $invoiceDecisions) {
  Add-Check "Decisione fattura presente: $item" ($json.invoice_decisions_required -contains $item) "La checklist fattura deve includere questo punto."
}

$reconciliationFields = @(
  "customer_id",
  "order_id",
  "product_id",
  "credits_purchased",
  "credits_consumed",
  "payment_id",
  "payment_status",
  "invoice_id",
  "invoice_status",
  "ledger_event_id",
  "refund_or_recredit_id"
)
foreach ($item in $reconciliationFields) {
  Add-Check "Campo riconciliazione presente: $item" ($json.minimum_reconciliation_fields -contains $item) "La riconciliazione deve includere questo campo."
}

$controls = @(
  "fiscal_admin_readiness_approved",
  "payment_provider_selected",
  "test_mode_separated_from_live_mode",
  "live_keys_absent_from_repository",
  "test_webhooks_verified",
  "no_real_card_in_sandbox",
  "real_invoice_process_defined",
  "minimum_billing_profile_implemented",
  "orders_credits_payments_invoices_reconciliation_tested",
  "blocked_responses_verified",
  "payment_kill_switch_present",
  "refund_and_recredit_policy_approved",
  "explicit_owner_approval",
  "company_brain_and_dashboard_updated"
)
foreach ($item in $controls) {
  Add-Check "Controllo prima del verde presente: $item" ($json.minimum_controls_before_green -contains $item) "Il gate verde deve richiedere questo controllo."
}

$may = @(
  "prepare_payment_invoice_architecture",
  "simulate_purchase_intent",
  "simulate_payment_test_intent",
  "verify_payment_executed_false",
  "verify_invoice_issued_false",
  "prepare_ledger_mapping",
  "propose_reconciliation_fields",
  "prepare_provider_checklist",
  "prepare_italian_reports"
)
foreach ($item in $may) {
  Add-Check "Azione agente ammessa: $item" ($json.agents_may_do -contains $item) "Gli agenti devono poter preparare senza attivare."
}

$mustNot = @(
  "activate_live_checkout",
  "collect_card_or_payment_method",
  "execute_real_payment",
  "issue_invoice",
  "create_real_subscription",
  "use_live_keys",
  "store_secrets_in_repository",
  "change_prices_into_live_commercial_offer",
  "treat_simulation_as_real_sale"
)
foreach ($item in $mustNot) {
  Add-Check "Divieto agente presente: $item" ($json.agents_must_not_do -contains $item) "Gli agenti non devono fare questa azione."
}

Add-Check "Effetto dashboard candidato giallo" ($json.dashboard_effect.payment_invoice_readiness -eq "red_to_yellow_candidate") "Il documento deve proporre solo candidato giallo."
Add-Check "Prossima azione sandbox/no-write" ($json.next_safe_action -eq "prepare_or_verify_live_payment_requested_block_in_sandbox_nowrite") "La prossima azione deve restare no-write/sandbox."

$requiredMdPhrases = @(
  "non attivazione pagamenti",
  "non attivazione fatture",
  "Regola principale",
  "Stati ammessi ora",
  "Cosa deve restituire la macchina se prova a pagare",
  "Provider di pagamento",
  "Fatture e documenti fiscali",
  "Riconciliazione minima",
  "Controlli minimi prima del verde",
  "Gli agenti non possono",
  "da rosso a candidato giallo"
)
foreach ($phrase in $requiredMdPhrases) {
  Add-Check "Frase MD presente: $phrase" ($md -match [regex]::Escape($phrase)) "Il Markdown deve spiegare chiaramente questo punto."
}

$combined = "$md`n$jsonText"
$unsafePhrases = @(
  '"live_payment_allowed": true',
  '"live_checkout_allowed": true',
  '"payment_method_collection_allowed": true',
  '"invoice_generation_allowed": true',
  '"subscription_activation_allowed": true',
  "pagamento reale attivo",
  "checkout reale attivo",
  "fattura reale attiva",
  "abbonamento reale attivo",
  "puoi incassare",
  "puoi raccogliere carta",
  "puoi emettere fattura",
  "payment approved",
  "invoice approved",
  "checkout approved",
  "subscription approved"
)
foreach ($phrase in $unsafePhrases) {
  Add-Check "Nessuna frase pericolosa: $phrase" ($combined -notmatch [regex]::Escape($phrase)) "Non devono comparire affermazioni di attivazione non autorizzate."
}

$failed = @($checks | Where-Object { -not $_.passed })
$passedCount = @($checks | Where-Object { $_.passed }).Count
$totalCount = $checks.Count
$status = if ($failed.Count -eq 0) { "SUPERATO" } else { "FALLITO" }

$report = @()
$report += "# Report controllo Payment/Invoice Readiness"
$report += ""
$report += "Data controllo: 2026-06-18"
$report += ""
$report += "Esito: $status"
$report += ""
$report += "Controlli superati: $passedCount/$totalCount"
$report += ""
$report += "Sintesi:"
$report += ""
$report += "- Il documento payment/invoice e' una bozza interna, non attivazione pagamenti."
$report += "- Non autorizza checkout live, carte, incassi, fatture o abbonamenti reali."
$report += "- Definisce stati ammessi/bloccati, risposta macchina, provider, fatture e riconciliazione."
$report += "- Propone payment_invoice_readiness come candidato giallo, non come gate verde."
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
  probe = "payment_invoice_readiness"
  date = "2026-06-18"
  status = $status
  passed = $passedCount
  total = $totalCount
  failed = @($failed | ForEach-Object { $_.name })
  owner_summary_it = "Payment/Invoice Readiness e' una bozza interna verificata: prepara checkout, provider, fatture e riconciliazione, ma non autorizza pagamenti, carte, fatture o abbonamenti reali."
}

$summary | ConvertTo-Json -Depth 6 | Set-Content -Path $summaryPath -Encoding UTF8

if ($failed.Count -gt 0) {
  throw "Payment/invoice readiness probe failed: $($failed.Count) failed checks"
}

Write-Output "Probe completato: $passedCount/$totalCount controlli superati."
