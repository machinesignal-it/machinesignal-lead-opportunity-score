$ErrorActionPreference = "Stop"

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$brainMdPath = Join-Path $root "COMPANY_BRAIN.md"
$brainJsonPath = Join-Path $root "company-brain.json"
$graphPath = Join-Path $root "company-brain-graph.json"
$dashboardMdPath = Join-Path $root "private-evaluator-pack/owner_decision_dashboard_20260618.md"
$dashboardJsonPath = Join-Path $root "private-evaluator-pack/owner_decision_dashboard_20260618.json"
$policyJsonPath = Join-Path $root "private-evaluator-pack/distribution_outreach_publication_approval_20260618.json"
$reportPath = Join-Path $root "private-evaluator-pack/distribution_dashboard_alignment_probe_report_20260618.md"
$summaryPath = Join-Path $root "private-evaluator-pack/distribution_dashboard_alignment_probe_summary_20260618.json"

$brainMd = Get-Content -Raw -Encoding UTF8 $brainMdPath
$brainJsonText = Get-Content -Raw -Encoding UTF8 $brainJsonPath
$brainJson = $brainJsonText | ConvertFrom-Json
$graphText = Get-Content -Raw -Encoding UTF8 $graphPath
$graphJson = $graphText | ConvertFrom-Json
$dashboardMd = Get-Content -Raw -Encoding UTF8 $dashboardMdPath
$dashboardJsonText = Get-Content -Raw -Encoding UTF8 $dashboardJsonPath
$dashboard = $dashboardJsonText | ConvertFrom-Json
$policyJsonText = Get-Content -Raw -Encoding UTF8 $policyJsonPath
$policy = $policyJsonText | ConvertFrom-Json

$checks = New-Object System.Collections.Generic.List[object]

function Add-Check {
  param([string]$Name, [bool]$Passed, [string]$Detail)
  $script:checks.Add([pscustomobject]@{
    name = $Name
    passed = $Passed
    detail = $Detail
  })
}

Add-Check "Company Brain JSON versione v8" ($brainJson.company_brain_version -eq "2026-06-18-internal-v8") "La Company Brain deve riflettere il nuovo allineamento distribution/outreach."
Add-Check "Company Brain graph versione v8" ($graphJson.graph_version -eq "2026-06-18-internal-v8") "Il grafo deve riflettere il nuovo allineamento."
Add-Check "Conteggi JSON 3/8/5" (($brainJson.owner_decision_dashboard.green_count -eq 3) -and ($brainJson.owner_decision_dashboard.yellow_count -eq 8) -and ($brainJson.owner_decision_dashboard.red_count -eq 5)) "Il JSON deve riportare 3 verdi, 8 gialli e 5 rossi."
Add-Check "Conteggi owner dashboard 3/8/5" (($dashboard.gate_counts.green -eq 3) -and ($dashboard.gate_counts.yellow -eq 8) -and ($dashboard.gate_counts.red -eq 5)) "Il dashboard owner deve riportare gli stessi conteggi."
Add-Check "Markdown Company Brain con conteggi aggiornati" (($brainMd -match "3 green gates") -and ($brainMd -match "8 yellow preparation items") -and ($brainMd -match "5 red blockers")) "Il Markdown deve mostrare i conteggi aggiornati."
Add-Check "Markdown owner dashboard con distribution giallo" ($dashboardMd -match "\| Distribution/no outreach \| Yellow \| Draft verified by 121 checks") "La tabella owner deve mostrare distribution come giallo verificato."

Add-Check "Distribution presente nei gialli JSON" ($brainJson.owner_decision_dashboard.yellow -contains "distribution_outreach_publication_approval_candidate") "Distribution/outreach deve essere candidato giallo."
Add-Check "Distribution rimossa dai rossi JSON" (-not ($brainJson.owner_decision_dashboard.red -contains "distribution_outreach_publication_approval")) "Distribution/outreach non deve restare rosso dopo la policy verificata."

$distributionEvidence = @($brainJson.owner_decision_dashboard.candidate_yellow_evidence | Where-Object { $_.area -eq "distribution_outreach_publication_approval" })
Add-Check "Evidenza distribution presente" ($distributionEvidence.Count -eq 1) "La Company Brain deve citare la policy verificata."
if ($distributionEvidence.Count -eq 1) {
  Add-Check "Probe distribution 121 controlli" ($distributionEvidence[0].probe -eq "121_checks_0_failed") "La prova deve citare i 121 controlli superati."
  Add-Check "Distribution non owner-approved" ($distributionEvidence[0].status -match "not_owner_approved") "Il candidato giallo non deve essere approvato."
}

$dashboardDistribution = @($dashboard.dashboard | Where-Object { $_.area -eq "distribution_no_outreach" })
Add-Check "Area distribution dashboard presente" ($dashboardDistribution.Count -eq 1) "Il dashboard deve avere una riga distribution/no outreach."
if ($dashboardDistribution.Count -eq 1) {
  Add-Check "Area distribution dashboard gialla" ($dashboardDistribution[0].status -eq "yellow") "Distribution deve essere gialla."
  Add-Check "Decisione distribution prudente" ($dashboardDistribution[0].decision -match "continue_owner_review") "La decisione deve restare review, non pubblicazione."
  Add-Check "Meaning blocca pubblicazione esterna" ($dashboardDistribution[0].meaning -match "no_external_publication_no_outreach") "Il significato deve ribadire nessuna pubblicazione esterna e nessun outreach."
}

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
Add-Check "Policy distribution non abilita outreach" ($policy.external_outreach_allowed -eq $false) "La policy verificata deve lasciare outreach disabilitato."
Add-Check "Policy distribution non abilita marketplace" ($policy.marketplace_publication_allowed -eq $false) "La policy verificata deve lasciare marketplace disabilitato."
Add-Check "Policy distribution non abilita hosted MCP" ($policy.hosted_public_mcp_allowed -eq $false) "La policy verificata deve lasciare hosted public MCP disabilitato."
Add-Check "Policy distribution non abilita registry MCP" ($policy.mcp_registry_submission_allowed -eq $false) "La policy verificata deve lasciare MCP registry disabilitato."

$combined = @(
  $brainMd,
  $brainJsonText,
  $graphText,
  $dashboardMd,
  $dashboardJsonText,
  $policyJsonText
) -join "`n"

$unsafePhrases = @(
  "distribution approved",
  "outreach approved",
  "marketplace publication allowed",
  "hosted public MCP allowed",
  "MCP registry approved",
  "paid beta approved",
  "commercial go-live approved",
  "real payments active",
  "production keys approved",
  "distribuzione approvata",
  "outreach approvato",
  "marketplace approvato",
  "MCP pubblico approvato",
  "go-live commerciale approvato",
  "pagamenti reali attivi",
  "chiavi production approvate"
)

foreach ($phrase in $unsafePhrases) {
  Add-Check "Nessuna approvazione impropria: $phrase" ($combined -notmatch [regex]::Escape($phrase)) "Non devono comparire frasi che sembrano autorizzare cio che e' ancora bloccato."
}

$failed = @($checks | Where-Object { -not $_.passed })
$passedCount = @($checks | Where-Object { $_.passed }).Count
$totalCount = $checks.Count
$status = if ($failed.Count -eq 0) { "SUPERATO" } else { "FALLITO" }

$report = @()
$report += "# Report allineamento dashboard distribution/outreach"
$report += ""
$report += "Data controllo: 2026-06-18"
$report += ""
$report += "Esito: $status"
$report += ""
$report += "Controlli superati: $passedCount/$totalCount"
$report += ""
$report += "Sintesi:"
$report += ""
$report += "- La policy distribution/outreach/publication e' stata recepita nel dashboard."
$report += "- Stato aggiornato: 3 verdi, 8 gialli, 5 rossi."
$report += "- Distribution/outreach passa a candidato giallo verificato, non approvato."
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
  probe = "distribution_dashboard_alignment"
  date = "2026-06-18"
  status = $status
  passed = $passedCount
  total = $totalCount
  failed = @($failed | ForEach-Object { $_.name })
  owner_summary_it = "Dashboard aggiornato: 3 verdi, 8 gialli, 5 rossi. Distribution/outreach e' candidato giallo verificato, non approvato. Nessuna pubblicazione esterna o outreach autorizzati."
}

$summary | ConvertTo-Json -Depth 6 | Set-Content -Path $summaryPath -Encoding UTF8

if ($failed.Count -gt 0) {
  throw "Distribution dashboard alignment probe failed: $($failed.Count) failed checks"
}

Write-Output "Probe completato: $passedCount/$totalCount controlli superati."
