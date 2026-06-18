$ErrorActionPreference = "Stop"

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$brainMdPath = Join-Path $root "COMPANY_BRAIN.md"
$brainJsonPath = Join-Path $root "company-brain.json"
$graphPath = Join-Path $root "company-brain-graph.json"
$dashboardPath = Join-Path $root "private-evaluator-pack/owner_decision_dashboard_20260618.json"
$reportPath = Join-Path $root "private-evaluator-pack/terms_privacy_candidate_yellow_alignment_probe_report_20260618.md"
$summaryPath = Join-Path $root "private-evaluator-pack/terms_privacy_candidate_yellow_alignment_probe_summary_20260618.json"

$brainMd = Get-Content -Raw -Encoding UTF8 $brainMdPath
$brainJson = Get-Content -Raw -Encoding UTF8 $brainJsonPath | ConvertFrom-Json
$graphJson = Get-Content -Raw -Encoding UTF8 $graphPath | ConvertFrom-Json
$dashboard = Get-Content -Raw -Encoding UTF8 $dashboardPath | ConvertFrom-Json

$checks = New-Object System.Collections.Generic.List[object]

function Add-Check {
  param([string]$Name, [bool]$Passed, [string]$Detail)
  $script:checks.Add([pscustomobject]@{
    name = $Name
    passed = $Passed
    detail = $Detail
  })
}

Add-Check "Company Brain JSON versione v6" ($brainJson.company_brain_version -eq "2026-06-18-internal-v6") "Il JSON deve riflettere il nuovo allineamento privacy/data."
Add-Check "Company Brain graph versione v6" ($graphJson.graph_version -eq "2026-06-18-internal-v6") "Il grafo deve riflettere il nuovo allineamento privacy/data."
Add-Check "Conteggi JSON corretti" (($brainJson.owner_decision_dashboard.green_count -eq 3) -and ($brainJson.owner_decision_dashboard.yellow_count -eq 6) -and ($brainJson.owner_decision_dashboard.red_count -eq 7)) "Il JSON deve riportare 3 verdi, 6 gialli e 7 rossi."
Add-Check "Conteggi dashboard corretti" (($dashboard.gate_counts.green -eq 3) -and ($dashboard.gate_counts.yellow -eq 6) -and ($dashboard.gate_counts.red -eq 7)) "Il dashboard deve riportare 3 verdi, 6 gialli e 7 rossi."
Add-Check "Markdown con conteggi aggiornati" (($brainMd -match "3 green gates") -and ($brainMd -match "6 yellow preparation items") -and ($brainMd -match "7 red blockers")) "Il Markdown deve riportare i conteggi aggiornati."

$item = @($dashboard.dashboard | Where-Object { $_.area -eq "terms_privacy_data" })
Add-Check "Terms/privacy/data presente nel dashboard" ($item.Count -eq 1) "L'area terms/privacy/data deve esistere."
if ($item.Count -eq 1) {
  Add-Check "Terms/privacy/data giallo" ($item[0].status -eq "yellow") "Deve essere giallo, non verde."
  Add-Check "Terms/privacy/data non approvato" ($item[0].meaning -match "not_owner_approved") "Deve chiarire che manca approvazione."
  Add-Check "Terms/privacy/data non finale" ($item[0].meaning -match "not_final") "Deve chiarire che i testi non sono finali."
  Add-Check "Terms/privacy/data non implementato" ($item[0].meaning -match "not_implemented") "Deve chiarire che manca implementazione."
}

$candidate = @($brainJson.owner_decision_dashboard.candidate_yellow_evidence | Where-Object { $_.area -eq "terms_privacy_data_readiness" })
Add-Check "Evidenza terms/privacy/data presente JSON" ($candidate.Count -eq 1) "Il JSON deve contenere l'evidenza."
if ($candidate.Count -eq 1) {
  Add-Check "Terms/privacy/data probe corretto" ($candidate[0].probe -eq "112_checks_0_failed") "Il probe deve essere riportato correttamente."
  Add-Check "Terms/privacy/data non approvato JSON" ($candidate[0].status -match "not_owner_approved") "Il candidato non deve risultare approvato."
  Add-Check "Terms/privacy/data non finale JSON" ($candidate[0].status -match "not_final") "Il candidato non deve risultare finale."
}

Add-Check "Terms/privacy/data rimosso dai rossi JSON" (-not ($brainJson.owner_decision_dashboard.red -contains "terms_privacy_data_readiness")) "Non deve restare nei rossi dopo bozza verificata."
Add-Check "Dati reali ancora bloccati Markdown" ($brainMd -match "real customer data and personal data remain blocked") "Il Markdown deve ribadire il blocco dati."
Add-Check "Decisione finale paid beta ancora no-go" ($dashboard.final_decision.paid_beta_activation -eq "no_go") "La beta a pagamento deve restare bloccata."
Add-Check "Go-live ancora no-go" ($dashboard.final_decision.commercial_go_live -eq "no_go") "Il go-live deve restare bloccato."

$unsafePhrases = @(
  "terms privacy data approved",
  "privacy final approved",
  "real data allowed",
  "personal data allowed",
  "paid beta approved",
  "commercial go-live approved",
  "dati reali ammessi",
  "dati personali ammessi",
  "privacy approvata",
  "termini approvati",
  "beta a pagamento approvata",
  "go-live commerciale approvato"
)

$combined = @(
  $brainMd,
  (Get-Content -Raw -Encoding UTF8 $brainJsonPath),
  (Get-Content -Raw -Encoding UTF8 $graphPath),
  (Get-Content -Raw -Encoding UTF8 $dashboardPath)
) -join "`n"

foreach ($phrase in $unsafePhrases) {
  Add-Check "Nessuna approvazione impropria: $phrase" ($combined -notmatch [regex]::Escape($phrase)) "Il candidato privacy/data non deve sembrare approvato."
}

$failed = @($checks | Where-Object { -not $_.passed })
$passedCount = @($checks | Where-Object { $_.passed }).Count
$totalCount = $checks.Count
$status = if ($failed.Count -eq 0) { "SUPERATO" } else { "FALLITO" }

$report = @()
$report += "# Report allineamento terms/privacy/data candidato giallo"
$report += ""
$report += "Data controllo: 2026-06-18"
$report += ""
$report += "Esito: $status"
$report += ""
$report += "Controlli superati: $passedCount/$totalCount"
$report += ""
$report += "Sintesi:"
$report += ""
$report += "- Il dashboard è stato aggiornato a 3 verdi, 6 gialli e 7 rossi."
$report += "- Terms/privacy/data è candidato giallo grazie a una bozza verificata da 112 controlli."
$report += "- Terms/privacy/data non è approvato, non è finale e non è implementato."
$report += "- Dati reali e personali restano bloccati."
$report += "- Beta a pagamento e go-live commerciale restano no-go."
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
  probe = "terms_privacy_candidate_yellow_alignment"
  date = "2026-06-18"
  status = $status
  passed = $passedCount
  total = $totalCount
  failed = @($failed | ForEach-Object { $_.name })
  owner_summary_it = "Dashboard aggiornato: 3 verdi, 6 gialli, 7 rossi. Terms/privacy/data è candidato giallo, non approvato, non finale e non implementato. Dati reali/personali restano bloccati."
}

$summary | ConvertTo-Json -Depth 6 | Set-Content -Path $summaryPath -Encoding UTF8

if ($failed.Count -gt 0) {
  throw "Terms/privacy candidate yellow alignment probe failed: $($failed.Count) failed checks"
}

Write-Output "Probe completato: $passedCount/$totalCount controlli superati."
