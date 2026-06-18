$ErrorActionPreference = "Stop"

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$brainMdPath = Join-Path $root "COMPANY_BRAIN.md"
$brainJsonPath = Join-Path $root "company-brain.json"
$graphPath = Join-Path $root "company-brain-graph.json"
$dashboardMdPath = Join-Path $root "private-evaluator-pack/owner_decision_dashboard_20260618.md"
$dashboardJsonPath = Join-Path $root "private-evaluator-pack/owner_decision_dashboard_20260618.json"
$readinessJsonPath = Join-Path $root "private-evaluator-pack/production_api_key_readiness_20260618.json"
$readinessSummaryPath = Join-Path $root "private-evaluator-pack/production_api_key_readiness_probe_summary_20260618.json"
$reportPath = Join-Path $root "private-evaluator-pack/production_api_key_dashboard_alignment_probe_report_20260618.md"
$summaryPath = Join-Path $root "private-evaluator-pack/production_api_key_dashboard_alignment_probe_summary_20260618.json"

$brainMd = Get-Content -Raw -Encoding UTF8 $brainMdPath
$brainJsonText = Get-Content -Raw -Encoding UTF8 $brainJsonPath
$brainJson = $brainJsonText | ConvertFrom-Json
$graphText = Get-Content -Raw -Encoding UTF8 $graphPath
$graphJson = $graphText | ConvertFrom-Json
$dashboardMd = Get-Content -Raw -Encoding UTF8 $dashboardMdPath
$dashboardJsonText = Get-Content -Raw -Encoding UTF8 $dashboardJsonPath
$dashboard = $dashboardJsonText | ConvertFrom-Json
$readinessText = Get-Content -Raw -Encoding UTF8 $readinessJsonPath
$readiness = $readinessText | ConvertFrom-Json
$readinessSummary = (Get-Content -Raw -Encoding UTF8 $readinessSummaryPath) | ConvertFrom-Json

$checks = New-Object System.Collections.Generic.List[object]

function Add-Check {
  param([string]$Name, [bool]$Passed, [string]$Detail)
  $script:checks.Add([pscustomobject]@{
    name = $Name
    passed = $Passed
    detail = $Detail
  })
}

Add-Check "Company Brain JSON versione v12" ($brainJson.company_brain_version -eq "2026-06-18-internal-v12") "La Company Brain deve riflettere la readiness production key."
Add-Check "Company Brain graph versione v12" ($graphJson.graph_version -eq "2026-06-18-internal-v12") "Il grafo deve riflettere la readiness production key."
Add-Check "Conteggi JSON 3/12/1" (($brainJson.owner_decision_dashboard.green_count -eq 3) -and ($brainJson.owner_decision_dashboard.yellow_count -eq 12) -and ($brainJson.owner_decision_dashboard.red_count -eq 1)) "Il JSON deve riportare 3 verdi, 12 gialli e 1 rosso."
Add-Check "Conteggi owner dashboard 3/12/1" (($dashboard.gate_counts.green -eq 3) -and ($dashboard.gate_counts.yellow -eq 12) -and ($dashboard.gate_counts.red -eq 1)) "Il dashboard owner deve riportare gli stessi conteggi."
Add-Check "Markdown Company Brain con conteggi aggiornati" (($brainMd -match "3 green gates") -and ($brainMd -match "12 yellow preparation items") -and ($brainMd -match "1 red blocker")) "Il Markdown deve mostrare i conteggi aggiornati."
Add-Check "Markdown owner dashboard con production API keys gialla" ($dashboardMd -match "\| Production API keys \| Yellow \| Draft verified by 113 checks") "La tabella owner deve mostrare production API keys come giallo verificato."

Add-Check "Production API key readiness presente nei gialli JSON" ($brainJson.owner_decision_dashboard.yellow -contains "production_api_key_readiness_candidate") "Production key readiness deve essere candidata gialla."
Add-Check "Production API keys rimosse dai rossi JSON" (-not ($brainJson.owner_decision_dashboard.red -contains "production_api_keys")) "Production API keys non deve restare rosso dopo la bozza verificata."
Add-Check "Owner commercial approval resta rosso" ($brainJson.owner_decision_dashboard.red -contains "owner_commercial_approval") "L'approvazione commerciale resta il rosso rimanente."

$brainEvidence = @($brainJson.owner_decision_dashboard.candidate_yellow_evidence | Where-Object { $_.area -eq "production_api_key_readiness" })
Add-Check "Evidenza production key readiness presente in Company Brain" ($brainEvidence.Count -eq 1) "La Company Brain deve citare il readiness pack verificato."
if ($brainEvidence.Count -eq 1) {
  Add-Check "Probe production key readiness 113 controlli" ($brainEvidence[0].probe -eq "113_checks_0_failed") "La prova deve citare i 113 controlli superati."
  Add-Check "Production key readiness non owner-approved" ($brainEvidence[0].status -match "not_owner_approved") "Il candidato giallo non deve essere approvato."
  Add-Check "Production key readiness non emette chiavi" ($brainEvidence[0].status -match "no_key_issuance") "Il candidato giallo deve vietare emissione chiavi."
  Add-Check "Production key readiness non abilita live traffic" ($brainEvidence[0].status -match "no_live_traffic") "Il candidato giallo deve vietare traffico live."
  Add-Check "Production key readiness non crea segreti" ($brainEvidence[0].status -match "no_secrets") "Il candidato giallo deve vietare segreti production."
}

$dashboardItem = @($dashboard.dashboard | Where-Object { $_.area -eq "production_api_keys" })
Add-Check "Area production_api_keys dashboard presente" ($dashboardItem.Count -eq 1) "Il dashboard deve avere una riga production API keys."
if ($dashboardItem.Count -eq 1) {
  Add-Check "Area production_api_keys dashboard gialla" ($dashboardItem[0].status -eq "yellow") "Production API keys deve essere gialla come readiness."
  Add-Check "Decisione production key prudente" ($dashboardItem[0].decision -match "continue_owner_review") "La decisione deve restare review."
  Add-Check "Meaning non abilita key issuance" ($dashboardItem[0].meaning -match "no_key_issuance") "Il significato deve bloccare emissione chiavi."
  Add-Check "Meaning non abilita live traffic" ($dashboardItem[0].meaning -match "no_live_traffic") "Il significato deve bloccare traffico live."
  Add-Check "Meaning non abilita secrets" ($dashboardItem[0].meaning -match "no_secrets") "Il significato deve bloccare segreti."
}

Add-Check "Readiness JSON probe passato" ($readinessSummary.passed -eq $true) "Il readiness pack deve avere probe superato."
Add-Check "Readiness JSON 113 controlli" (($readinessSummary.checks_passed -eq 113) -and ($readinessSummary.checks_failed -eq 0)) "Il readiness probe deve avere 113/0."
Add-Check "Readiness JSON non abilita production keys" ($readiness.production_api_keys_allowed -eq $false) "Nessuna chiave production consentita."
Add-Check "Readiness JSON non abilita emissione chiavi" ($readiness.production_key_issuance_allowed -eq $false) "Nessuna emissione chiavi consentita."
Add-Check "Readiness JSON non abilita live traffic" ($readiness.live_traffic_allowed -eq $false) "Nessun traffico live consentito."
Add-Check "Readiness JSON non abilita segreti repo" ($readiness.production_secrets_allowed_in_repo -eq $false) "Nessun segreto production nel repo."

$requiredStillBlockedBrain = @(
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
foreach ($item in $requiredStillBlockedBrain) {
  Add-Check "Blocco ancora presente in Company Brain: $item" ($brainJson.owner_decision_dashboard.blocked_actions -contains $item) "Il passaggio a giallo non deve sbloccare azioni commerciali."
}

$requiredStillBlockedDashboard = @(
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
foreach ($item in $requiredStillBlockedDashboard) {
  Add-Check "Blocco ancora presente nel dashboard owner: $item" ($dashboard.blocked_actions -contains $item) "Il dashboard deve continuare a bloccare questa azione."
}

Add-Check "Paid beta resta no-go" ($dashboard.final_decision.paid_beta_activation -eq "no_go") "La beta a pagamento non deve essere attivata."
Add-Check "Go-live resta no-go" ($dashboard.final_decision.commercial_go_live -eq "no_go") "Il go-live commerciale deve restare bloccato."
Add-Check "Prossimo step owner approval packet" ($dashboard.next_safe_action -eq "prepare_owner_commercial_approval_packet") "Il prossimo step deve spostarsi sul rosso rimanente."
Add-Check "Company Brain next safe action owner approval packet" ($brainJson.owner_decision_dashboard.next_safe_action -eq "prepare_owner_commercial_approval_packet") "La Company Brain deve indicare il prossimo passo."

$combined = @(
  $brainMd,
  $brainJsonText,
  $graphText,
  $dashboardMd,
  $dashboardJsonText,
  $readinessText
) -join "`n"

$unsafePhrases = @(
  "production key approved",
  "production keys approved",
  "live key issued",
  "production traffic enabled",
  "production secrets allowed",
  "production_api_keys_allowed`": true",
  "production_key_issuance_allowed`": true",
  "live_traffic_allowed`": true",
  "production_secrets_allowed_in_repo`": true",
  "paid beta approved",
  "commercial go-live approved",
  "chiave production approvata",
  "chiavi production approvate",
  "chiave live emessa",
  "traffico production attivo",
  "segreti production ammessi",
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
$report += "# Report allineamento dashboard production API key readiness"
$report += ""
$report += "Data controllo: 2026-06-18"
$report += ""
$report += "Esito: $status"
$report += ""
$report += "Controlli superati: $passedCount/$totalCount"
$report += ""
$report += "Sintesi:"
$report += ""
$report += "- Production API key readiness e' stata recepita nel dashboard."
$report += "- Stato aggiornato: 3 verdi, 12 gialli, 1 rosso."
$report += "- Production API keys passa a candidato giallo verificato, non approvato."
$report += "- Non autorizza emissione chiavi, traffico live, segreti, pagamenti o go-live."
$report += "- Resta rosso: owner commercial approval."
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
  probe = "production_api_key_dashboard_alignment"
  date = "2026-06-18"
  passed = ($failed.Count -eq 0)
  checks_passed = $passedCount
  checks_total = $totalCount
  checks_failed = $failed.Count
  dashboard_counts = @{
    green = 3
    yellow = 12
    red = 1
  }
  production_api_keys_status = "yellow_candidate_readiness_only"
  remaining_red = @("owner_commercial_approval")
  report = "production_api_key_dashboard_alignment_probe_report_20260618.md"
}

$summary | ConvertTo-Json -Depth 6 | Set-Content -Path $summaryPath -Encoding UTF8

if ($failed.Count -gt 0) {
  Write-Host "FAILED: $($failed.Count) checks failed. See $reportPath"
  exit 1
}

Write-Host "PASSED: $passedCount/$totalCount checks. Report: $reportPath"
