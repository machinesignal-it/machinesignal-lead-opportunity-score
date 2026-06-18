$ErrorActionPreference = "Stop"

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$brainMdPath = Join-Path $root "COMPANY_BRAIN.md"
$brainJsonPath = Join-Path $root "company-brain.json"
$graphPath = Join-Path $root "company-brain-graph.json"
$dashboardPath = Join-Path $root "private-evaluator-pack/owner_decision_dashboard_20260618.json"
$reportPath = Join-Path $root "private-evaluator-pack/support_candidate_yellow_alignment_probe_report_20260618.md"
$summaryPath = Join-Path $root "private-evaluator-pack/support_candidate_yellow_alignment_probe_summary_20260618.json"

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

Add-Check "Company Brain JSON versione v5" ($brainJson.company_brain_version -eq "2026-06-18-internal-v5") "Il JSON deve riflettere il nuovo allineamento supporto."
Add-Check "Company Brain graph versione v5" ($graphJson.graph_version -eq "2026-06-18-internal-v5") "Il grafo deve riflettere il nuovo allineamento supporto."
Add-Check "Conteggi JSON corretti" (($brainJson.owner_decision_dashboard.green_count -eq 3) -and ($brainJson.owner_decision_dashboard.yellow_count -eq 5) -and ($brainJson.owner_decision_dashboard.red_count -eq 8)) "Il JSON deve riportare 3 verdi, 5 gialli e 8 rossi."
Add-Check "Conteggi dashboard corretti" (($dashboard.gate_counts.green -eq 3) -and ($dashboard.gate_counts.yellow -eq 5) -and ($dashboard.gate_counts.red -eq 8)) "Il dashboard deve riportare 3 verdi, 5 gialli e 8 rossi."
Add-Check "Markdown con conteggi aggiornati" (($brainMd -match "3 green gates") -and ($brainMd -match "5 yellow preparation items") -and ($brainMd -match "8 red blockers")) "Il Markdown deve riportare i conteggi aggiornati."

$supportItem = @($dashboard.dashboard | Where-Object { $_.area -eq "support_escalation" })
Add-Check "Support escalation presente nel dashboard" ($supportItem.Count -eq 1) "L'area support/escalation deve esistere nel dashboard."
if ($supportItem.Count -eq 1) {
  Add-Check "Support escalation giallo" ($supportItem[0].status -eq "yellow") "Support/escalation deve essere giallo, non rosso o verde."
  Add-Check "Support escalation non approvato" ($supportItem[0].meaning -match "not_owner_approved") "Il dashboard deve dire che manca approvazione."
  Add-Check "Support escalation non implementato" ($supportItem[0].meaning -match "not_implemented") "Il dashboard deve dire che manca implementazione."
}

$candidate = @($brainJson.owner_decision_dashboard.candidate_yellow_evidence | Where-Object { $_.area -eq "support_escalation_model" })
Add-Check "Evidenza support candidate presente JSON" ($candidate.Count -eq 1) "Il JSON deve contenere l'evidenza support/escalation."
if ($candidate.Count -eq 1) {
  Add-Check "Support candidate probe corretto" ($candidate[0].probe -eq "108_checks_0_failed") "Il probe supporto deve essere riportato correttamente."
  Add-Check "Support candidate non approvato JSON" ($candidate[0].status -match "not_owner_approved") "Il candidato non deve risultare approvato."
}

Add-Check "Support escalation rimosso dai rossi JSON" (-not ($brainJson.owner_decision_dashboard.red -contains "support_escalation_model")) "Support/escalation non deve restare nei rossi dopo la bozza verificata."
Add-Check "Decisione finale paid beta ancora no-go" ($dashboard.final_decision.paid_beta_activation -eq "no_go") "La beta a pagamento deve restare bloccata."
Add-Check "Go-live ancora no-go" ($dashboard.final_decision.commercial_go_live -eq "no_go") "Il go-live deve restare bloccato."

$unsafePhrases = @(
  "support_escalation_model approved",
  "support escalation approved",
  "paid onboarding approved",
  "paid beta approved",
  "commercial go-live approved",
  "real payments active",
  "production keys approved",
  "supporto approvato",
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
  Add-Check "Nessuna approvazione impropria: $phrase" ($combined -notmatch [regex]::Escape($phrase)) "Il candidato supporto non deve sembrare approvato."
}

$failed = @($checks | Where-Object { -not $_.passed })
$passedCount = @($checks | Where-Object { $_.passed }).Count
$totalCount = $checks.Count
$status = if ($failed.Count -eq 0) { "SUPERATO" } else { "FALLITO" }

$report = @()
$report += "# Report allineamento supporto candidato giallo"
$report += ""
$report += "Data controllo: 2026-06-18"
$report += ""
$report += "Esito: $status"
$report += ""
$report += "Controlli superati: $passedCount/$totalCount"
$report += ""
$report += "Sintesi:"
$report += ""
$report += "- Il dashboard è stato aggiornato a 3 verdi, 5 gialli e 8 rossi."
$report += "- Support/escalation è candidato giallo grazie a una bozza verificata da 108 controlli."
$report += "- Support/escalation non è approvato, non è implementato e non è verde."
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
  probe = "support_candidate_yellow_alignment"
  date = "2026-06-18"
  status = $status
  passed = $passedCount
  total = $totalCount
  failed = @($failed | ForEach-Object { $_.name })
  owner_summary_it = "Dashboard aggiornato: 3 verdi, 5 gialli, 8 rossi. Support/escalation è candidato giallo, non approvato e non implementato. Beta a pagamento resta no-go."
}

$summary | ConvertTo-Json -Depth 6 | Set-Content -Path $summaryPath -Encoding UTF8

if ($failed.Count -gt 0) {
  throw "Support candidate yellow alignment probe failed: $($failed.Count) failed checks"
}

Write-Output "Probe completato: $passedCount/$totalCount controlli superati."
