$ErrorActionPreference = "Stop"

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$brainMdPath = Join-Path $root "COMPANY_BRAIN.md"
$brainJsonPath = Join-Path $root "company-brain.json"
$graphPath = Join-Path $root "company-brain-graph.json"
$dashboardMdPath = Join-Path $root "private-evaluator-pack/owner_decision_dashboard_20260618.md"
$dashboardJsonPath = Join-Path $root "private-evaluator-pack/owner_decision_dashboard_20260618.json"
$paymentJsonPath = Join-Path $root "private-evaluator-pack/payment_invoice_readiness_20260618.json"
$reportPath = Join-Path $root "private-evaluator-pack/payment_invoice_dashboard_alignment_probe_report_20260618.md"
$summaryPath = Join-Path $root "private-evaluator-pack/payment_invoice_dashboard_alignment_probe_summary_20260618.json"

$brainMd = Get-Content -Raw -Encoding UTF8 $brainMdPath
$brainJsonText = Get-Content -Raw -Encoding UTF8 $brainJsonPath
$brainJson = $brainJsonText | ConvertFrom-Json
$graphText = Get-Content -Raw -Encoding UTF8 $graphPath
$graphJson = $graphText | ConvertFrom-Json
$dashboardMd = Get-Content -Raw -Encoding UTF8 $dashboardMdPath
$dashboardJsonText = Get-Content -Raw -Encoding UTF8 $dashboardJsonPath
$dashboard = $dashboardJsonText | ConvertFrom-Json
$paymentText = Get-Content -Raw -Encoding UTF8 $paymentJsonPath
$payment = $paymentText | ConvertFrom-Json

$checks = New-Object System.Collections.Generic.List[object]

function Add-Check {
  param([string]$Name, [bool]$Passed, [string]$Detail)
  $script:checks.Add([pscustomobject]@{
    name = $Name
    passed = $Passed
    detail = $Detail
  })
}

Add-Check "Company Brain JSON versione v10" ($brainJson.company_brain_version -eq "2026-06-18-internal-v10") "La Company Brain deve riflettere l'allineamento payment/invoice."
Add-Check "Company Brain graph versione v10" ($graphJson.graph_version -eq "2026-06-18-internal-v10") "Il grafo deve riflettere l'allineamento payment/invoice."
Add-Check "Conteggi JSON 3/10/3" (($brainJson.owner_decision_dashboard.green_count -eq 3) -and ($brainJson.owner_decision_dashboard.yellow_count -eq 10) -and ($brainJson.owner_decision_dashboard.red_count -eq 3)) "Il JSON deve riportare 3 verdi, 10 gialli e 3 rossi."
Add-Check "Conteggi owner dashboard 3/10/3" (($dashboard.gate_counts.green -eq 3) -and ($dashboard.gate_counts.yellow -eq 10) -and ($dashboard.gate_counts.red -eq 3)) "Il dashboard owner deve riportare gli stessi conteggi."
Add-Check "Markdown Company Brain con conteggi aggiornati" (($brainMd -match "3 green gates") -and ($brainMd -match "10 yellow preparation items") -and ($brainMd -match "3 red blockers")) "Il Markdown deve mostrare i conteggi aggiornati."
Add-Check "Markdown owner dashboard con payment/invoice giallo" ($dashboardMd -match "\| Payment/invoice path \| Yellow \| Draft verified by 123 checks") "La tabella owner deve mostrare payment/invoice come giallo verificato."

Add-Check "Payment/invoice presente nei gialli JSON" ($brainJson.owner_decision_dashboard.yellow -contains "payment_invoice_readiness_candidate") "Payment/invoice deve essere candidato giallo."
Add-Check "Payment/invoice rimosso dai rossi JSON" (-not ($brainJson.owner_decision_dashboard.red -contains "payment_invoice_readiness")) "Payment/invoice non deve restare rosso dopo la bozza verificata."

$paymentEvidence = @($brainJson.owner_decision_dashboard.candidate_yellow_evidence | Where-Object { $_.area -eq "payment_invoice_readiness" })
Add-Check "Evidenza payment/invoice presente" ($paymentEvidence.Count -eq 1) "La Company Brain deve citare la readiness verificata."
if ($paymentEvidence.Count -eq 1) {
  Add-Check "Probe payment/invoice 123 controlli" ($paymentEvidence[0].probe -eq "123_checks_0_failed") "La prova deve citare i 123 controlli superati."
  Add-Check "Payment/invoice non owner-approved" ($paymentEvidence[0].status -match "not_owner_approved") "Il candidato giallo non deve essere approvato."
  Add-Check "Payment/invoice vieta live payment" ($paymentEvidence[0].status -match "no_live_payment") "Il candidato giallo deve bloccare pagamenti live."
  Add-Check "Payment/invoice vieta invoice" ($paymentEvidence[0].status -match "no_invoice") "Il candidato giallo deve bloccare fatture."
}

$dashboardPayment = @($dashboard.dashboard | Where-Object { $_.area -eq "payment_invoice_path" })
Add-Check "Area payment/invoice dashboard presente" ($dashboardPayment.Count -eq 1) "Il dashboard deve avere una riga payment/invoice."
if ($dashboardPayment.Count -eq 1) {
  Add-Check "Area payment/invoice dashboard gialla" ($dashboardPayment[0].status -eq "yellow") "Payment/invoice deve essere gialla."
  Add-Check "Decisione payment/invoice prudente" ($dashboardPayment[0].decision -match "continue_owner_review") "La decisione deve restare review."
  Add-Check "Meaning blocca live payment" ($dashboardPayment[0].meaning -match "no_live_payment") "Il significato deve bloccare pagamenti live."
  Add-Check "Meaning blocca invoice" ($dashboardPayment[0].meaning -match "no_invoice") "Il significato deve bloccare fatture."
  Add-Check "Meaning blocca payment method collection" ($dashboardPayment[0].meaning -match "no_payment_method_collection") "Il significato deve bloccare raccolta metodi di pagamento."
}

Add-Check "Payment JSON non abilita live payment" ($payment.live_payment_allowed -eq $false) "Il pack payment/invoice non deve abilitare pagamenti live."
Add-Check "Payment JSON non abilita checkout live" ($payment.live_checkout_allowed -eq $false) "Il pack payment/invoice non deve abilitare checkout live."
Add-Check "Payment JSON non abilita metodi pagamento" ($payment.payment_method_collection_allowed -eq $false) "Il pack payment/invoice non deve abilitare raccolta metodo pagamento."
Add-Check "Payment JSON non abilita fatture" ($payment.invoice_generation_allowed -eq $false) "Il pack payment/invoice non deve abilitare fatture."
Add-Check "Payment JSON non abilita abbonamenti" ($payment.subscription_activation_allowed -eq $false) "Il pack payment/invoice non deve abilitare abbonamenti reali."

$requiredStillBlocked = @(
  "real_payments",
  "invoices",
  "payment_method_collection",
  "production_api_keys",
  "real_customer_data_processing",
  "personal_data_processing",
  "external_outreach",
  "email_sending_to_external_humans",
  "public_paid_marketplace_publication",
  "hosted_mcp_public_launch",
  "mcp_registry_publication",
  "commercial_go_live"
)
foreach ($item in $requiredStillBlocked) {
  Add-Check "Blocco ancora presente in Company Brain: $item" ($brainJson.owner_decision_dashboard.blocked_actions -contains $item) "Il passaggio a giallo non deve sbloccare azioni commerciali."
}

$requiredDashboardBlocked = @(
  "activate_paid_beta",
  "execute_real_payment",
  "issue_invoice",
  "collect_payment_method",
  "issue_production_api_key",
  "process_real_customer_dataset",
  "process_personal_data",
  "send_external_outreach",
  "publish_marketplace_listing",
  "launch_hosted_public_mcp",
  "submit_mcp_registry"
)
foreach ($item in $requiredDashboardBlocked) {
  Add-Check "Blocco ancora presente nel dashboard owner: $item" ($dashboard.blocked_actions -contains $item) "Il dashboard deve continuare a bloccare questa azione."
}

Add-Check "Paid beta resta no-go" ($dashboard.final_decision.paid_beta_activation -eq "no_go") "La beta a pagamento non deve essere attivata."
Add-Check "Go-live resta no-go" ($dashboard.final_decision.commercial_go_live -eq "no_go") "Il go-live commerciale deve restare bloccato."
Add-Check "Prossimo step aggiornato" ($dashboard.next_safe_action -eq "prepare_product_listino_owner_review_or_production_api_key_readiness") "Il prossimo step deve spostarsi sui rossi rimanenti."

$combined = @(
  $brainMd,
  $brainJsonText,
  $graphText,
  $dashboardMd,
  $dashboardJsonText,
  $paymentText
) -join "`n"

$unsafePhrases = @(
  "payment approved",
  "invoice approved",
  "checkout approved",
  "subscription approved",
  "live payment allowed",
  "live checkout allowed",
  "payment method collection allowed",
  "invoice generation allowed",
  "paid beta approved",
  "commercial go-live approved",
  "pagamenti approvati",
  "fatture approvate",
  "checkout approvato",
  "abbonamenti approvati",
  "pagamenti reali attivi",
  "fatture attive",
  "beta a pagamento approvata",
  "go-live commerciale approvato"
)
foreach ($phrase in $unsafePhrases) {
  Add-Check "Nessuna approvazione impropria: $phrase" ($combined -notmatch [regex]::Escape($phrase)) "Non devono comparire frasi che sembrano autorizzare cio' che e' ancora bloccato."
}

$failed = @($checks | Where-Object { -not $_.passed })
$passedCount = @($checks | Where-Object { $_.passed }).Count
$totalCount = $checks.Count
$status = if ($failed.Count -eq 0) { "SUPERATO" } else { "FALLITO" }

$report = @()
$report += "# Report allineamento dashboard payment/invoice"
$report += ""
$report += "Data controllo: 2026-06-18"
$report += ""
$report += "Esito: $status"
$report += ""
$report += "Controlli superati: $passedCount/$totalCount"
$report += ""
$report += "Sintesi:"
$report += ""
$report += "- La readiness payment/invoice e' stata recepita nel dashboard."
$report += "- Stato aggiornato: 3 verdi, 10 gialli, 3 rossi."
$report += "- Payment/invoice passa a candidato giallo verificato, non approvato."
$report += "- Non autorizza checkout live, carte, incassi, fatture, abbonamenti o chiavi live provider."
$report += "- Restano bloccati: pagamenti reali, fatture, metodi di pagamento, chiavi production, dati reali/personali, outreach, marketplace, MCP pubblico e go-live commerciale."
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
  probe = "payment_invoice_dashboard_alignment"
  date = "2026-06-18"
  status = $status
  passed = $passedCount
  total = $totalCount
  failed = @($failed | ForEach-Object { $_.name })
  owner_summary_it = "Dashboard aggiornato: 3 verdi, 10 gialli, 3 rossi. Payment/invoice e' candidato giallo verificato, non approvato. Nessun checkout live, carta, pagamento, fattura o abbonamento autorizzato."
}

$summary | ConvertTo-Json -Depth 6 | Set-Content -Path $summaryPath -Encoding UTF8

if ($failed.Count -gt 0) {
  throw "Payment/invoice dashboard alignment probe failed: $($failed.Count) failed checks"
}

Write-Output "Probe completato: $passedCount/$totalCount controlli superati."
