$ErrorActionPreference = "Stop"

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$mdPath = Join-Path $root "private-evaluator-pack/owner_red_gate_resolution_plan_20260618.md"
$jsonPath = Join-Path $root "private-evaluator-pack/owner_red_gate_resolution_plan_20260618.json"
$reportPath = Join-Path $root "private-evaluator-pack/owner_red_gate_resolution_plan_probe_report_20260618.md"
$summaryPath = Join-Path $root "private-evaluator-pack/owner_red_gate_resolution_plan_probe_summary_20260618.json"

$md = Get-Content -Raw -Encoding UTF8 $mdPath
$json = Get-Content -Raw -Encoding UTF8 $jsonPath | ConvertFrom-Json

$checks = New-Object System.Collections.Generic.List[object]

function Add-Check {
  param([string]$Name, [bool]$Passed, [string]$Detail)
  $script:checks.Add([pscustomobject]@{
    name = $Name
    passed = $Passed
    detail = $Detail
  })
}

$requiredGates = @(
  "owner_commercial_approval",
  "fiscal_admin_readiness",
  "payment_invoice_readiness",
  "terms_privacy_data_readiness",
  "product_listino_approval",
  "credit_refund_policy",
  "production_api_keys",
  "cost_cap_kill_switch",
  "support_escalation_model",
  "security_incident_readiness",
  "distribution_outreach_publication_approval"
)

Add-Check "Documento Markdown presente" (Test-Path $mdPath) "Il piano leggibile deve esistere."
Add-Check "Documento JSON presente" (Test-Path $jsonPath) "Il piano macchina deve esistere."
Add-Check "Lingua italiana dichiarata" ($json.language -eq "it") "I report owner-facing devono essere in italiano."
Add-Check "Stato solo preparazione interna" ($json.status -eq "internal_preparation_only") "Il piano non deve autorizzare attivazioni commerciali."
Add-Check "Undici blocchi nel JSON" (@($json.red_gates).Count -eq 11) "Devono esserci esattamente 11 blocchi rossi."

foreach ($gate in $requiredGates) {
  $found = @($json.red_gates | Where-Object { $_.id -eq $gate })
  Add-Check "Blocco JSON presente: $gate" ($found.Count -eq 1) "Ogni blocco rosso del dashboard deve essere mappato."
  if ($found.Count -eq 1) {
    Add-Check "Blocco JSON con azione agente: $gate" (-not [string]::IsNullOrWhiteSpace($found[0].agent_work_it)) "Ogni blocco deve dire cosa fanno gli agenti."
    Add-Check "Blocco JSON con decisione proprietario: $gate" (-not [string]::IsNullOrWhiteSpace($found[0].owner_decision_it)) "Ogni blocco deve dire cosa resta decisione del proprietario."
    Add-Check "Blocco JSON con evidenza: $gate" (-not [string]::IsNullOrWhiteSpace($found[0].required_evidence_it)) "Ogni blocco deve avere evidenza richiesta."
  }
  Add-Check "Blocco Markdown presente: $gate" ($md -match [regex]::Escape($gate) -or $md -match ($gate -replace "_", ".*")) "Il Markdown deve coprire ogni blocco."
}

$mustBlock = @(
  "real_payments",
  "invoices",
  "payment_method_collection",
  "production_api_keys",
  "real_customer_data",
  "personal_data",
  "external_outreach",
  "marketplace_publication",
  "hosted_public_mcp",
  "mcp_registry_publication",
  "commercial_go_live"
)

foreach ($block in $mustBlock) {
  Add-Check "Azione non autorizzata dichiarata: $block" ($json.does_not_authorize -contains $block) "Il piano deve confermare che questa azione resta vietata."
}

$unsafePhrases = @(
  "autorizza la beta a pagamento",
  "beta a pagamento autorizzata",
  "pagamenti reali attivi",
  "fatture attive",
  "chiavi production autorizzate",
  "dati reali autorizzati",
  "outreach autorizzato",
  "go-live commerciale approvato",
  "paid beta approved",
  "real payments active",
  "production keys approved"
)

$combined = $md + "`n" + (Get-Content -Raw -Encoding UTF8 $jsonPath)
foreach ($phrase in $unsafePhrases) {
  Add-Check "Nessuna frase di attivazione: $phrase" ($combined -notmatch [regex]::Escape($phrase)) "Il piano non deve sembrare un'approvazione."
}

Add-Check "Prossimo step sicuro indicato" ($json.next_safe_step_it -match "policy crediti") "Il piano deve indicare il prossimo step sicuro."

$failed = @($checks | Where-Object { -not $_.passed })
$passedCount = @($checks | Where-Object { $_.passed }).Count
$totalCount = $checks.Count
$status = if ($failed.Count -eq 0) { "SUPERATO" } else { "FALLITO" }

$report = @()
$report += "# Report controllo piano blocchi rossi"
$report += ""
$report += "Data controllo: 2026-06-18"
$report += ""
$report += "Esito: $status"
$report += ""
$report += "Controlli superati: $passedCount/$totalCount"
$report += ""
$report += "Sintesi:"
$report += ""
$report += "- Il piano mappa gli 11 blocchi rossi in azioni, decisioni ed evidenze."
$report += "- Il documento conferma che la beta a pagamento non è autorizzata."
$report += "- Il prossimo step sicuro è preparare la policy crediti/rimborsi con esempi sintetici."
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
  probe = "owner_red_gate_resolution_plan"
  date = "2026-06-18"
  status = $status
  passed = $passedCount
  total = $totalCount
  failed = @($failed | ForEach-Object { $_.name })
  owner_summary_it = "Piano blocchi rossi creato. Gli 11 blocchi sono mappati; la beta a pagamento resta non autorizzata."
}

$summary | ConvertTo-Json -Depth 6 | Set-Content -Path $summaryPath -Encoding UTF8

if ($failed.Count -gt 0) {
  throw "Owner red gate resolution plan probe failed: $($failed.Count) failed checks"
}

Write-Output "Probe completato: $passedCount/$totalCount controlli superati."
