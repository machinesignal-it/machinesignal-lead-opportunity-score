$ErrorActionPreference = "Stop"

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$brainMdPath = Join-Path $root "COMPANY_BRAIN.md"
$brainJsonPath = Join-Path $root "company-brain.json"
$graphPath = Join-Path $root "company-brain-graph.json"
$dashboardMdPath = Join-Path $root "private-evaluator-pack/owner_decision_dashboard_20260618.md"
$dashboardJsonPath = Join-Path $root "private-evaluator-pack/owner_decision_dashboard_20260618.json"
$listinoJsonPath = Join-Path $root "private-evaluator-pack/product_listino_owner_review_20260618.json"
$reportPath = Join-Path $root "private-evaluator-pack/product_listino_dashboard_alignment_probe_report_20260618.md"
$summaryPath = Join-Path $root "private-evaluator-pack/product_listino_dashboard_alignment_probe_summary_20260618.json"

$brainMd = Get-Content -Raw -Encoding UTF8 $brainMdPath
$brainJsonText = Get-Content -Raw -Encoding UTF8 $brainJsonPath
$brainJson = $brainJsonText | ConvertFrom-Json
$graphText = Get-Content -Raw -Encoding UTF8 $graphPath
$graphJson = $graphText | ConvertFrom-Json
$dashboardMd = Get-Content -Raw -Encoding UTF8 $dashboardMdPath
$dashboardJsonText = Get-Content -Raw -Encoding UTF8 $dashboardJsonPath
$dashboard = $dashboardJsonText | ConvertFrom-Json
$listinoText = Get-Content -Raw -Encoding UTF8 $listinoJsonPath
$listino = $listinoText | ConvertFrom-Json

$checks = New-Object System.Collections.Generic.List[object]

function Add-Check {
  param([string]$Name, [bool]$Passed, [string]$Detail)
  $script:checks.Add([pscustomobject]@{
    name = $Name
    passed = $Passed
    detail = $Detail
  })
}

Add-Check "Company Brain JSON versione v11" ($brainJson.company_brain_version -eq "2026-06-18-internal-v11") "La Company Brain deve riflettere l'allineamento product/listino."
Add-Check "Company Brain graph versione v11" ($graphJson.graph_version -eq "2026-06-18-internal-v11") "Il grafo deve riflettere l'allineamento product/listino."
Add-Check "Conteggi JSON 3/11/2" (($brainJson.owner_decision_dashboard.green_count -eq 3) -and ($brainJson.owner_decision_dashboard.yellow_count -eq 11) -and ($brainJson.owner_decision_dashboard.red_count -eq 2)) "Il JSON deve riportare 3 verdi, 11 gialli e 2 rossi."
Add-Check "Conteggi owner dashboard 3/11/2" (($dashboard.gate_counts.green -eq 3) -and ($dashboard.gate_counts.yellow -eq 11) -and ($dashboard.gate_counts.red -eq 2)) "Il dashboard owner deve riportare gli stessi conteggi."
Add-Check "Markdown Company Brain con conteggi aggiornati" (($brainMd -match "3 green gates") -and ($brainMd -match "11 yellow preparation items") -and ($brainMd -match "2 red blockers")) "Il Markdown deve mostrare i conteggi aggiornati."
Add-Check "Markdown owner dashboard con product/listino giallo" ($dashboardMd -match "\| Product/listino approval \| Yellow \| Draft verified by 154 checks") "La tabella owner deve mostrare product/listino come giallo verificato."

Add-Check "Product/listino presente nei gialli JSON" ($brainJson.owner_decision_dashboard.yellow -contains "product_listino_approval_candidate") "Product/listino deve essere candidato giallo."
Add-Check "Product/listino rimosso dai rossi JSON" (-not ($brainJson.owner_decision_dashboard.red -contains "product_listino_approval")) "Product/listino non deve restare rosso dopo la bozza verificata."

$evidence = @($brainJson.owner_decision_dashboard.candidate_yellow_evidence | Where-Object { $_.area -eq "product_listino_approval" })
Add-Check "Evidenza product/listino presente" ($evidence.Count -eq 1) "La Company Brain deve citare il review pack verificato."
if ($evidence.Count -eq 1) {
  Add-Check "Probe product/listino 154 controlli" ($evidence[0].probe -eq "154_checks_0_failed") "La prova deve citare i 154 controlli superati."
  Add-Check "Product/listino non owner-approved" ($evidence[0].status -match "not_owner_approved") "Il candidato giallo non deve essere approvato."
  Add-Check "Product/listino non live offer" ($evidence[0].status -match "not_live_offer") "Il candidato giallo non deve essere live offer."
  Add-Check "Product/listino vieta payments/invoices" (($evidence[0].status -match "no_payments") -and ($evidence[0].status -match "no_invoices")) "Il candidato giallo deve bloccare pagamenti e fatture."
}

$dashboardItem = @($dashboard.dashboard | Where-Object { $_.area -eq "product_listino_approval" })
Add-Check "Area product/listino dashboard presente" ($dashboardItem.Count -eq 1) "Il dashboard deve avere una riga product/listino."
if ($dashboardItem.Count -eq 1) {
  Add-Check "Area product/listino dashboard gialla" ($dashboardItem[0].status -eq "yellow") "Product/listino deve essere gialla."
  Add-Check "Decisione product/listino prudente" ($dashboardItem[0].decision -match "continue_owner_review") "La decisione deve restare review."
  Add-Check "Meaning non live offer" ($dashboardItem[0].meaning -match "not_live_offer") "Il significato deve bloccare offerta live."
}

Add-Check "Listino JSON non abilita live offer" ($listino.live_offer_allowed -eq $false) "Il pack listino non deve abilitare offerta live."
Add-Check "Listino JSON non abilita pagamento" ($listino.real_payment_allowed -eq $false) "Il pack listino non deve abilitare pagamenti."
Add-Check "Listino JSON non abilita fattura" ($listino.invoice_allowed -eq $false) "Il pack listino non deve abilitare fatture."
Add-Check "Listino JSON non abilita abbonamento" ($listino.subscription_activation_allowed -eq $false) "Il pack listino non deve abilitare abbonamenti."
Add-Check "Listino JSON non abilita marketplace" ($listino.marketplace_publication_allowed -eq $false) "Il pack listino non deve abilitare marketplace."

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
Add-Check "Prossimo step aggiornato" ($dashboard.next_safe_action -eq "prepare_production_api_key_readiness_or_owner_commercial_approval_packet") "Il prossimo step deve spostarsi sui rossi rimanenti."

$combined = @(
  $brainMd,
  $brainJsonText,
  $graphText,
  $dashboardMd,
  $dashboardJsonText,
  $listinoText
) -join "`n"

$unsafePhrases = @(
  "product listino approved",
  "listino approved",
  "live offer approved",
  "final prices approved",
  "real payment allowed",
  "invoice allowed true",
  "subscription approved",
  "marketplace listing approved",
  "paid beta approved",
  "commercial go-live approved",
  "listino approvato",
  "prezzi definitivi approvati",
  "offerta live approvata",
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
$report += "# Report allineamento dashboard product/listino"
$report += ""
$report += "Data controllo: 2026-06-18"
$report += ""
$report += "Esito: $status"
$report += ""
$report += "Controlli superati: $passedCount/$totalCount"
$report += ""
$report += "Sintesi:"
$report += ""
$report += "- Il product/listino owner review e' stato recepito nel dashboard."
$report += "- Stato aggiornato: 3 verdi, 11 gialli, 2 rossi."
$report += "- Product/listino passa a candidato giallo verificato, non approvato."
$report += "- Non autorizza offerta live, prezzi definitivi, pagamenti, fatture, abbonamenti o marketplace."
$report += "- Restano rossi: owner commercial approval e production API keys."
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
  probe = "product_listino_dashboard_alignment"
  date = "2026-06-18"
  status = $status
  passed = $passedCount
  total = $totalCount
  failed = @($failed | ForEach-Object { $_.name })
  owner_summary_it = "Dashboard aggiornato: 3 verdi, 11 gialli, 2 rossi. Product/listino e' candidato giallo verificato, non approvato. Nessuna offerta live o prezzo finale autorizzato."
}

$summary | ConvertTo-Json -Depth 6 | Set-Content -Path $summaryPath -Encoding UTF8

if ($failed.Count -gt 0) {
  throw "Product/listino dashboard alignment probe failed: $($failed.Count) failed checks"
}

Write-Output "Probe completato: $passedCount/$totalCount controlli superati."
