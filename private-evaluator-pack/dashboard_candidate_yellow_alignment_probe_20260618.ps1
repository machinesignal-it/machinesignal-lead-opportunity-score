$ErrorActionPreference = "Stop"

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$brainMdPath = Join-Path $root "COMPANY_BRAIN.md"
$brainJsonPath = Join-Path $root "company-brain.json"
$graphPath = Join-Path $root "company-brain-graph.json"
$dashboardPath = Join-Path $root "private-evaluator-pack/owner_decision_dashboard_20260618.json"
$reportPath = Join-Path $root "private-evaluator-pack/dashboard_candidate_yellow_alignment_probe_report_20260618.md"
$summaryPath = Join-Path $root "private-evaluator-pack/dashboard_candidate_yellow_alignment_probe_summary_20260618.json"

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

Add-Check "Company Brain JSON versione v4" ($brainJson.company_brain_version -eq "2026-06-18-internal-v4") "Il JSON deve riflettere il nuovo allineamento."
Add-Check "Company Brain graph versione v4" ($graphJson.graph_version -eq "2026-06-18-internal-v4") "Il grafo deve riflettere il nuovo allineamento."
Add-Check "Conteggi JSON corretti" (($brainJson.owner_decision_dashboard.green_count -eq 3) -and ($brainJson.owner_decision_dashboard.yellow_count -eq 4) -and ($brainJson.owner_decision_dashboard.red_count -eq 9)) "Il JSON deve riportare 3 verdi, 4 gialli e 9 rossi."
Add-Check "Conteggi dashboard corretti" (($dashboard.gate_counts.green -eq 3) -and ($dashboard.gate_counts.yellow -eq 4) -and ($dashboard.gate_counts.red -eq 9)) "Il dashboard deve riportare 3 verdi, 4 gialli e 9 rossi."
Add-Check "Markdown con conteggi aggiornati" (($brainMd -match "3 green gates") -and ($brainMd -match "4 yellow preparation items") -and ($brainMd -match "9 red blockers")) "Il Markdown deve riportare i conteggi aggiornati."

$yellowAreas = @("credit_refund_policy", "cost_cap_kill_switch")
foreach ($area in $yellowAreas) {
  $dashItem = @($dashboard.dashboard | Where-Object { $_.area -eq $area })
  Add-Check "Area dashboard presente: $area" ($dashItem.Count -eq 1) "L'area deve esistere nel dashboard."
  if ($dashItem.Count -eq 1) {
    Add-Check "Area dashboard gialla: $area" ($dashItem[0].status -eq "yellow") "L'area deve essere gialla, non verde."
    Add-Check "Area dashboard non approvata: $area" ($dashItem[0].meaning -match "not_owner_approved") "Il significato deve chiarire che manca approvazione."
  }

  $candidate = @($brainJson.owner_decision_dashboard.candidate_yellow_evidence | Where-Object { $_.area -eq $area })
  Add-Check "Evidenza candidata presente JSON: $area" ($candidate.Count -eq 1) "Il JSON deve contenere l'evidenza del candidato giallo."
  if ($candidate.Count -eq 1) {
    Add-Check "Candidato non approvato JSON: $area" ($candidate[0].status -match "not_owner_approved") "Il candidato non deve risultare approvato."
  }
}

Add-Check "Credit refund rimosso dai rossi JSON" (-not ($brainJson.owner_decision_dashboard.red -contains "credit_refund_policy")) "Credit/refund non deve restare nei rossi dopo la bozza verificata."
Add-Check "Cost cap rimosso dai rossi JSON" (-not ($brainJson.owner_decision_dashboard.red -contains "cost_cap_kill_switch")) "Cost cap non deve restare nei rossi dopo la bozza verificata."
Add-Check "Decisione finale paid beta ancora no-go" ($dashboard.final_decision.paid_beta_activation -eq "no_go") "La beta a pagamento deve restare bloccata."
Add-Check "Go-live ancora no-go" ($dashboard.final_decision.commercial_go_live -eq "no_go") "Il go-live deve restare bloccato."

$unsafePhrases = @(
  "credit_refund_policy approved",
  "cost_cap_kill_switch approved",
  "paid beta approved",
  "paid beta activation go",
  "commercial go-live approved",
  "real payments active",
  "production keys approved",
  "policy crediti approvata",
  "cost cap approvato",
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
  Add-Check "Nessuna approvazione impropria: $phrase" ($combined -notmatch [regex]::Escape($phrase)) "I candidati gialli non devono sembrare approvati."
}

$failed = @($checks | Where-Object { -not $_.passed })
$passedCount = @($checks | Where-Object { $_.passed }).Count
$totalCount = $checks.Count
$status = if ($failed.Count -eq 0) { "SUPERATO" } else { "FALLITO" }

$report = @()
$report += "# Report allineamento dashboard candidati gialli"
$report += ""
$report += "Data controllo: 2026-06-18"
$report += ""
$report += "Esito: $status"
$report += ""
$report += "Controlli superati: $passedCount/$totalCount"
$report += ""
$report += "Sintesi:"
$report += ""
$report += "- Il dashboard è stato aggiornato a 3 verdi, 4 gialli e 9 rossi."
$report += "- Credit/refund policy e cost cap/kill switch sono candidati gialli grazie a bozze verificate."
$report += "- I due candidati non sono approvati e non sono verdi."
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
  probe = "dashboard_candidate_yellow_alignment"
  date = "2026-06-18"
  status = $status
  passed = $passedCount
  total = $totalCount
  failed = @($failed | ForEach-Object { $_.name })
  owner_summary_it = "Dashboard aggiornato: 3 verdi, 4 gialli, 9 rossi. Credit/refund e cost cap sono candidati gialli, non approvati. Beta a pagamento resta no-go."
}

$summary | ConvertTo-Json -Depth 6 | Set-Content -Path $summaryPath -Encoding UTF8

if ($failed.Count -gt 0) {
  throw "Dashboard candidate yellow alignment probe failed: $($failed.Count) failed checks"
}

Write-Output "Probe completato: $passedCount/$totalCount controlli superati."
