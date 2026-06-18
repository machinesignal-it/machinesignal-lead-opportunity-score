$ErrorActionPreference = "Stop"

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$reportPath = Join-Path $root "private-evaluator-pack/company_brain_owner_dashboard_alignment_probe_report_20260618.md"
$summaryPath = Join-Path $root "private-evaluator-pack/company_brain_owner_dashboard_alignment_probe_summary_20260618.json"

$brainMdPath = Join-Path $root "COMPANY_BRAIN.md"
$brainJsonPath = Join-Path $root "company-brain.json"
$graphPath = Join-Path $root "company-brain-graph.json"

$brainMd = Get-Content -Raw -Encoding UTF8 $brainMdPath
$brainJson = Get-Content -Raw -Encoding UTF8 $brainJsonPath | ConvertFrom-Json
$graphJson = Get-Content -Raw -Encoding UTF8 $graphPath | ConvertFrom-Json

$checks = New-Object System.Collections.Generic.List[object]

function Add-Check {
  param(
    [string]$Name,
    [bool]$Passed,
    [string]$Detail
  )
  $script:checks.Add([pscustomobject]@{
    name = $Name
    passed = $Passed
    detail = $Detail
  })
}

Add-Check "Company Brain aggiornata al 2026-06-18" ($brainMd -match "Updated: 2026-06-18") "Il documento Markdown deve riportare la data aggiornata."
Add-Check "Sezione Owner Decision Dashboard presente" ($brainMd -match "Owner Decision Dashboard Status") "La Company Brain deve contenere la sezione del dashboard decisionale."
Add-Check "Conteggi dashboard nel Markdown" (($brainMd -match "3 green gates") -and ($brainMd -match "2 yellow preparation items") -and ($brainMd -match "11 red blockers")) "Il Markdown deve riportare 3 verdi, 2 gialli e 11 rossi."
Add-Check "Beta a pagamento esplicitamente non attivabile" (($brainMd -match "paid beta must not be activated yet") -and ($brainMd -match "do not activate paid beta")) "La decisione deve restare no-go per la beta a pagamento."

Add-Check "Versione JSON aggiornata" ($brainJson.company_brain_version -eq "2026-06-18-internal-v3") "Il JSON deve avere la nuova versione interna."
Add-Check "Data JSON aggiornata" ($brainJson.updated_at -eq "2026-06-18") "Il JSON deve riportare la data aggiornata."
Add-Check "Dashboard JSON presente" ($null -ne $brainJson.owner_decision_dashboard) "Il JSON deve esporre il dashboard agli agenti."
Add-Check "Conteggi dashboard JSON corretti" (($brainJson.owner_decision_dashboard.green_count -eq 3) -and ($brainJson.owner_decision_dashboard.yellow_count -eq 2) -and ($brainJson.owner_decision_dashboard.red_count -eq 11)) "Il JSON deve riportare 3 verdi, 2 gialli e 11 rossi."
Add-Check "Decisione raccomandata JSON corretta" ($brainJson.owner_decision_dashboard.recommended_decision_today -eq "continue_preparing_paid_beta_materials_but_do_not_activate_paid_beta") "Il JSON deve dire di preparare ma non attivare."
Add-Check "Sintesi owner in italiano presente" ($brainJson.owner_decision_dashboard.owner_facing_summary_it -match "Beta a pagamento non attivabile") "Il JSON deve contenere una sintesi leggibile in italiano."

$requiredBlocked = @(
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

foreach ($item in $requiredBlocked) {
  Add-Check "Blocco presente: $item" ($brainJson.owner_decision_dashboard.blocked_actions -contains $item) "Il dashboard deve mantenere il blocco operativo."
}

Add-Check "Grafo aggiornato alla nuova versione" ($graphJson.graph_version -eq "2026-06-18-internal-v3") "Il grafo deve avere la nuova versione."
Add-Check "Data grafo aggiornata" ($graphJson.updated_at -eq "2026-06-18") "Il grafo deve riportare la data aggiornata."
Add-Check "Nodo dashboard presente nel grafo" (@($graphJson.nodes | Where-Object { $_.id -eq "owner_decision_dashboard_20260618" }).Count -eq 1) "Il grafo deve avere il nodo del dashboard."
Add-Check "Edge dashboard verso blocchi presente" (@($graphJson.edges | Where-Object { $_.from -eq "owner_decision_dashboard_20260618" -and $_.to -eq "blocked_actions" -and $_.relation -eq "keeps_blocked" }).Count -eq 1) "Il grafo deve collegare il dashboard ai blocchi."
Add-Check "Edge dashboard verso company-brain JSON presente" (@($graphJson.edges | Where-Object { $_.from -eq "owner_decision_dashboard_20260618" -and $_.to -eq "company_brain_json" -and $_.relation -eq "updates" }).Count -eq 1) "Il grafo deve collegare il dashboard alla Company Brain macchina."

$combinedText = @(
  $brainMd,
  (Get-Content -Raw -Encoding UTF8 $brainJsonPath),
  (Get-Content -Raw -Encoding UTF8 $graphPath)
) -join "`n"

$unsafePhrases = @(
  "paid beta approved",
  "paid beta is live",
  "commercial go-live approved",
  "real payments are active",
  "invoices are active",
  "production API keys approved",
  "marketplace publication allowed",
  "hosted public MCP live",
  "external outreach approved",
  "owner approval granted",
  "beta a pagamento approvata",
  "pagamenti reali attivi",
  "go-live commerciale approvato",
  "chiavi production approvate",
  "outreach approvato"
)

foreach ($phrase in $unsafePhrases) {
  Add-Check "Nessuna frase pericolosa: $phrase" ($combinedText -notmatch [regex]::Escape($phrase)) "Non devono comparire approvazioni o attivazioni non concesse."
}

$failed = @($checks | Where-Object { -not $_.passed })
$passedCount = @($checks | Where-Object { $_.passed }).Count
$totalCount = $checks.Count
$status = if ($failed.Count -eq 0) { "SUPERATO" } else { "FALLITO" }

$report = @()
$report += "# Report controllo Company Brain - Dashboard decisionale"
$report += ""
$report += "Data controllo: 2026-06-18"
$report += ""
$report += "Esito: $status"
$report += ""
$report += "Controlli superati: $passedCount/$totalCount"
$report += ""
$report += "Sintesi:"
$report += ""
$report += "- La Company Brain è stata allineata al dashboard decisionale del 2026-06-18."
$report += "- Stato dashboard: 3 elementi verdi, 2 elementi gialli, 11 elementi rossi."
$report += "- La preparazione interna può continuare."
$report += "- La beta a pagamento resta bloccata: niente pagamenti reali, fatture, metodi di pagamento, chiavi production, dati reali/personali, outreach, marketplace pubblico o MCP pubblico."
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
  probe = "company_brain_owner_dashboard_alignment"
  date = "2026-06-18"
  status = $status
  passed = $passedCount
  total = $totalCount
  failed = @($failed | ForEach-Object { $_.name })
  owner_summary_it = "Company Brain allineata al dashboard: 3 verdi, 2 gialli, 11 rossi. Preparazione consentita, beta a pagamento non attivabile."
}

$summary | ConvertTo-Json -Depth 6 | Set-Content -Path $summaryPath -Encoding UTF8

if ($failed.Count -gt 0) {
  throw "Company Brain owner dashboard alignment probe failed: $($failed.Count) failed checks"
}

Write-Output "Probe completato: $passedCount/$totalCount controlli superati."
