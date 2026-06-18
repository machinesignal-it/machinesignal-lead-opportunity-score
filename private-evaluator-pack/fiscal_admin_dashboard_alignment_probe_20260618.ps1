$ErrorActionPreference = "Stop"

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$brainMdPath = Join-Path $root "COMPANY_BRAIN.md"
$brainJsonPath = Join-Path $root "company-brain.json"
$graphPath = Join-Path $root "company-brain-graph.json"
$dashboardMdPath = Join-Path $root "private-evaluator-pack/owner_decision_dashboard_20260618.md"
$dashboardJsonPath = Join-Path $root "private-evaluator-pack/owner_decision_dashboard_20260618.json"
$fiscalJsonPath = Join-Path $root "private-evaluator-pack/fiscal_admin_readiness_20260618.json"
$reportPath = Join-Path $root "private-evaluator-pack/fiscal_admin_dashboard_alignment_probe_report_20260618.md"
$summaryPath = Join-Path $root "private-evaluator-pack/fiscal_admin_dashboard_alignment_probe_summary_20260618.json"

$brainMd = Get-Content -Raw -Encoding UTF8 $brainMdPath
$brainJsonText = Get-Content -Raw -Encoding UTF8 $brainJsonPath
$brainJson = $brainJsonText | ConvertFrom-Json
$graphText = Get-Content -Raw -Encoding UTF8 $graphPath
$graphJson = $graphText | ConvertFrom-Json
$dashboardMd = Get-Content -Raw -Encoding UTF8 $dashboardMdPath
$dashboardJsonText = Get-Content -Raw -Encoding UTF8 $dashboardJsonPath
$dashboard = $dashboardJsonText | ConvertFrom-Json
$fiscalText = Get-Content -Raw -Encoding UTF8 $fiscalJsonPath
$fiscal = $fiscalText | ConvertFrom-Json

$checks = New-Object System.Collections.Generic.List[object]

function Add-Check {
  param([string]$Name, [bool]$Passed, [string]$Detail)
  $script:checks.Add([pscustomobject]@{
    name = $Name
    passed = $Passed
    detail = $Detail
  })
}

Add-Check "Company Brain JSON versione v9" ($brainJson.company_brain_version -eq "2026-06-18-internal-v9") "La Company Brain deve riflettere l'allineamento fiscal/admin."
Add-Check "Company Brain graph versione v9" ($graphJson.graph_version -eq "2026-06-18-internal-v9") "Il grafo deve riflettere l'allineamento fiscal/admin."
Add-Check "Conteggi JSON 3/9/4" (($brainJson.owner_decision_dashboard.green_count -eq 3) -and ($brainJson.owner_decision_dashboard.yellow_count -eq 9) -and ($brainJson.owner_decision_dashboard.red_count -eq 4)) "Il JSON deve riportare 3 verdi, 9 gialli e 4 rossi."
Add-Check "Conteggi owner dashboard 3/9/4" (($dashboard.gate_counts.green -eq 3) -and ($dashboard.gate_counts.yellow -eq 9) -and ($dashboard.gate_counts.red -eq 4)) "Il dashboard owner deve riportare gli stessi conteggi."
Add-Check "Markdown Company Brain con conteggi aggiornati" (($brainMd -match "3 green gates") -and ($brainMd -match "9 yellow preparation items") -and ($brainMd -match "4 red blockers")) "Il Markdown deve mostrare i conteggi aggiornati."
Add-Check "Markdown owner dashboard con fiscal/admin giallo" ($dashboardMd -match "\| Fiscal/admin path \| Yellow \| Draft verified by 99 checks") "La tabella owner deve mostrare fiscal/admin come giallo verificato."

Add-Check "Fiscal/admin presente nei gialli JSON" ($brainJson.owner_decision_dashboard.yellow -contains "fiscal_admin_readiness_candidate") "Fiscal/admin deve essere candidato giallo."
Add-Check "Fiscal/admin rimosso dai rossi JSON" (-not ($brainJson.owner_decision_dashboard.red -contains "fiscal_admin_readiness")) "Fiscal/admin non deve restare rosso dopo la bozza verificata."

$fiscalEvidence = @($brainJson.owner_decision_dashboard.candidate_yellow_evidence | Where-Object { $_.area -eq "fiscal_admin_readiness" })
Add-Check "Evidenza fiscal/admin presente" ($fiscalEvidence.Count -eq 1) "La Company Brain deve citare la readiness verificata."
if ($fiscalEvidence.Count -eq 1) {
  Add-Check "Probe fiscal/admin 99 controlli" ($fiscalEvidence[0].probe -eq "99_checks_0_failed") "La prova deve citare i 99 controlli superati."
  Add-Check "Fiscal/admin non owner-approved" ($fiscalEvidence[0].status -match "not_owner_approved") "Il candidato giallo non deve essere approvato."
  Add-Check "Fiscal/admin non tax advice" ($fiscalEvidence[0].status -match "not_tax_advice") "Il candidato giallo non deve apparire come consulenza fiscale."
}

$dashboardFiscal = @($dashboard.dashboard | Where-Object { $_.area -eq "fiscal_admin_path" })
Add-Check "Area fiscal/admin dashboard presente" ($dashboardFiscal.Count -eq 1) "Il dashboard deve avere una riga fiscal/admin."
if ($dashboardFiscal.Count -eq 1) {
  Add-Check "Area fiscal/admin dashboard gialla" ($dashboardFiscal[0].status -eq "yellow") "Fiscal/admin deve essere gialla."
  Add-Check "Decisione fiscal/admin prudente" ($dashboardFiscal[0].decision -match "continue_owner_review") "La decisione deve restare review."
  Add-Check "Meaning blocca pagamenti e fatture" ($dashboardFiscal[0].meaning -match "no_payments_no_invoices") "Il significato deve ribadire nessun pagamento e nessuna fattura."
}

Add-Check "Fiscal JSON non abilita beta" ($fiscal.paid_beta_allowed -eq $false) "Il pacchetto fiscal/admin non deve abilitare beta a pagamento."
Add-Check "Fiscal JSON non abilita pagamenti" ($fiscal.real_payments_allowed -eq $false) "Il pacchetto fiscal/admin non deve abilitare pagamenti."
Add-Check "Fiscal JSON non abilita fatture" ($fiscal.invoices_allowed -eq $false) "Il pacchetto fiscal/admin non deve abilitare fatture."
Add-Check "Fiscal JSON non abilita metodi pagamento" ($fiscal.payment_method_collection_allowed -eq $false) "Il pacchetto fiscal/admin non deve abilitare raccolta metodo pagamento."
Add-Check "Fiscal JSON non e' tax advice" ($fiscal.final_tax_advice -eq $false) "Il pacchetto fiscal/admin non deve diventare consulenza fiscale finale."

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
Add-Check "Prossimo step aggiornato" ($dashboard.next_safe_action -eq "prepare_payment_invoice_readiness_or_product_listino_owner_review") "Il prossimo step deve spostarsi sui rossi rimanenti."

$combined = @(
  $brainMd,
  $brainJsonText,
  $graphText,
  $dashboardMd,
  $dashboardJsonText,
  $fiscalText
) -join "`n"

$unsafePhrases = @(
  "fiscal admin approved",
  "tax advice approved",
  "piva not required",
  "partita iva non serve",
  "partita iva non necessaria",
  "real payments active",
  "invoices active",
  "payment method collection active",
  "paid beta approved",
  "commercial go-live approved",
  "fiscal/admin approvato",
  "pagamenti reali attivi",
  "fatture attive",
  "metodi di pagamento attivi",
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
$report += "# Report allineamento dashboard fiscal/admin"
$report += ""
$report += "Data controllo: 2026-06-18"
$report += ""
$report += "Esito: $status"
$report += ""
$report += "Controlli superati: $passedCount/$totalCount"
$report += ""
$report += "Sintesi:"
$report += ""
$report += "- La readiness fiscal/admin e' stata recepita nel dashboard."
$report += "- Stato aggiornato: 3 verdi, 9 gialli, 4 rossi."
$report += "- Fiscal/admin passa a candidato giallo verificato, non approvato."
$report += "- Non e' consulenza fiscale e non autorizza pagamenti, fatture o raccolta metodi di pagamento."
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
  probe = "fiscal_admin_dashboard_alignment"
  date = "2026-06-18"
  status = $status
  passed = $passedCount
  total = $totalCount
  failed = @($failed | ForEach-Object { $_.name })
  owner_summary_it = "Dashboard aggiornato: 3 verdi, 9 gialli, 4 rossi. Fiscal/admin e' candidato giallo verificato, non approvato. Nessun pagamento, fattura o metodo di pagamento autorizzato."
}

$summary | ConvertTo-Json -Depth 6 | Set-Content -Path $summaryPath -Encoding UTF8

if ($failed.Count -gt 0) {
  throw "Fiscal/admin dashboard alignment probe failed: $($failed.Count) failed checks"
}

Write-Output "Probe completato: $passedCount/$totalCount controlli superati."
