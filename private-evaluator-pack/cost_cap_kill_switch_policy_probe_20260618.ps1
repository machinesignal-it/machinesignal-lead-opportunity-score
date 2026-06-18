$ErrorActionPreference = "Stop"

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$mdPath = Join-Path $root "private-evaluator-pack/cost_cap_kill_switch_policy_20260618.md"
$jsonPath = Join-Path $root "private-evaluator-pack/cost_cap_kill_switch_policy_20260618.json"
$reportPath = Join-Path $root "private-evaluator-pack/cost_cap_kill_switch_policy_probe_report_20260618.md"
$summaryPath = Join-Path $root "private-evaluator-pack/cost_cap_kill_switch_policy_probe_summary_20260618.json"

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

Add-Check "Documento Markdown presente" (Test-Path $mdPath) "La policy leggibile deve esistere."
Add-Check "Documento JSON presente" (Test-Path $jsonPath) "La policy macchina deve esistere."
Add-Check "Lingua italiana dichiarata" ($json.language -eq "it") "I report owner-facing devono essere in italiano."
Add-Check "Stato bozza interna" ($json.status -eq "draft_internal_policy") "La policy deve restare bozza interna."
Add-Check "Nessuna attivazione commerciale" ($json.commercial_activation -eq $false) "La policy non deve attivare beta o go-live."
Add-Check "Nessun uso esterno a pagamento autorizzato" ($json.external_paid_usage_authorized -eq $false) "Le chiamate esterne a pagamento restano bloccate."
Add-Check "Nessun upgrade Cloudflare autorizzato" ($json.cloudflare_paid_upgrade_authorized -eq $false) "Gli upgrade a pagamento restano bloccati."

$requiredBlocks = @(
  "real_payments",
  "invoices",
  "payment_method_collection",
  "production_api_keys",
  "real_customer_data",
  "personal_data",
  "external_paid_api_calls",
  "cloudflare_paid_plan_upgrade",
  "external_outreach",
  "commercial_go_live"
)

foreach ($block in $requiredBlocks) {
  Add-Check "Azione vietata dichiarata: $block" ($json.does_not_authorize -contains $block) "La policy deve confermare che questa azione resta vietata."
}

$requiredCapLevels = @(
  "request_cap",
  "customer_cap",
  "product_cap",
  "daily_cost_cap",
  "external_cost_cap",
  "policy_cap",
  "incident_cap"
)

foreach ($cap in $requiredCapLevels) {
  $found = @($json.cap_levels | Where-Object { $_.id -eq $cap })
  Add-Check "Livello cap presente: $cap" ($found.Count -eq 1) "Ogni livello di controllo deve essere mappato."
  if ($found.Count -eq 1) {
    Add-Check "Livello cap con azione: $cap" (-not [string]::IsNullOrWhiteSpace($found[0].action_it)) "Ogni livello deve avere un'azione."
  }
}

$requiredThresholds = @(
  "requests_per_minute_per_sandbox_customer",
  "requests_per_hour_per_sandbox_customer",
  "requests_per_day_per_sandbox_customer",
  "score_pack_batch_max",
  "domain_enrichment_batch_max",
  "target_discovery_frequency",
  "consecutive_technical_errors",
  "consecutive_duplicates",
  "daily_external_cost_sandbox_eur",
  "unapproved_beta_budget_eur"
)

foreach ($threshold in $requiredThresholds) {
  Add-Check "Soglia presente: $threshold" (@($json.recommended_beta_thresholds | Where-Object { $_.id -eq $threshold }).Count -eq 1) "Ogni soglia beta consigliata deve essere esplicita."
}

Add-Check "Costo esterno giornaliero a zero" ((@($json.recommended_beta_thresholds | Where-Object { $_.id -eq "daily_external_cost_sandbox_eur" })[0].value -eq 0)) "Le chiamate esterne a pagamento non devono essere autorizzate."
Add-Check "Budget beta non approvata a zero" ((@($json.recommended_beta_thresholds | Where-Object { $_.id -eq "unapproved_beta_budget_eur" })[0].value -eq 0)) "La beta non approvata deve avere budget reale zero."

$requiredSwitches = @(
  "customer_kill_switch",
  "product_kill_switch",
  "endpoint_kill_switch",
  "external_call_kill_switch",
  "global_beta_kill_switch",
  "policy_kill_switch"
)

foreach ($switch in $requiredSwitches) {
  Add-Check "Kill switch presente: $switch" ($json.kill_switch_types -contains $switch) "Ogni kill switch principale deve essere dichiarato."
}

$requiredTriggers = @(
  "daily_threshold_exceeded",
  "repeated_request_loop",
  "error_rate_exceeded",
  "real_or_personal_data_detected",
  "unapproved_production_key_attempt",
  "ledger_write_failure",
  "external_spend_above_authorized_limit",
  "owner_manual_stop"
)

foreach ($trigger in $requiredTriggers) {
  Add-Check "Trigger kill switch presente: $trigger" ($json.kill_switch_triggers -contains $trigger) "I trigger critici devono essere dichiarati."
}

Add-Check "Risposta bloccata non consuma crediti" ($json.blocked_response_example.credits_consumed -eq 0) "Una richiesta bloccata non deve consumare crediti."
Add-Check "Risposta bloccata dice stop" ($json.blocked_response_example.decision -eq "stop") "Il cliente macchina deve sapere che deve fermarsi."

$requiredLedgerFields = @(
  "event_id",
  "timestamp",
  "customer_id_or_sandbox_customer_id",
  "request_id",
  "endpoint",
  "product_code",
  "cap_type",
  "threshold_name",
  "threshold_value",
  "observed_value",
  "action_taken",
  "credits_consumed",
  "cost_estimate_eur",
  "policy_version",
  "environment",
  "escalation_required",
  "support_code"
)

foreach ($field in $requiredLedgerFields) {
  Add-Check "Campo ledger presente: $field" ($json.ledger_required_fields -contains $field) "Il ledger deve poter ricostruire il blocco."
}

$mustAppearInMd = @(
  "Ogni macchina cliente",
  "Kill switch",
  "Costo esterno giornaliero sandbox",
  "EUR 0",
  "Cloudflare",
  "Escalation",
  "Divieti confermati"
)

foreach ($phrase in $mustAppearInMd) {
  Add-Check "Frase chiave Markdown: $phrase" ($md -match [regex]::Escape($phrase)) "Il Markdown deve essere comprensibile per il proprietario."
}

$unsafePhrases = @(
  "pagamenti reali attivi",
  "fatture attive",
  "chiavi production autorizzate",
  "dati reali autorizzati",
  "chiamate esterne a pagamento autorizzate",
  "upgrade Cloudflare autorizzato",
  "go-live commerciale approvato",
  "real payments active",
  "production keys approved",
  "commercial go-live approved"
)

$combined = $md + "`n" + (Get-Content -Raw -Encoding UTF8 $jsonPath)
foreach ($phrase in $unsafePhrases) {
  Add-Check "Nessuna frase di attivazione: $phrase" ($combined -notmatch [regex]::Escape($phrase)) "La policy non deve sembrare un'approvazione."
}

Add-Check "Effetto dashboard corretto" ($json.dashboard_effect.cost_cap_kill_switch -eq "red_to_yellow_candidate") "La policy può solo candidare il blocco a giallo, non verde."
Add-Check "Approvazione proprietario richiesta" ($json.owner_approval_required_for -contains "move_from_zero_budget_to_real_budget") "Serve approvazione per qualsiasi budget reale."

$failed = @($checks | Where-Object { -not $_.passed })
$passedCount = @($checks | Where-Object { $_.passed }).Count
$totalCount = $checks.Count
$status = if ($failed.Count -eq 0) { "SUPERATO" } else { "FALLITO" }

$report = @()
$report += "# Report controllo policy cost cap e kill switch"
$report += ""
$report += "Data controllo: 2026-06-18"
$report += ""
$report += "Esito: $status"
$report += ""
$report += "Controlli superati: $passedCount/$totalCount"
$report += ""
$report += "Sintesi:"
$report += ""
$report += "- La policy definisce soglie, rate limit e kill switch per la beta controllata."
$report += "- Il budget reale resta zero finché il proprietario non approva diversamente."
$report += "- Le chiamate esterne a pagamento e gli upgrade Cloudflare restano vietati."
$report += "- Il blocco cost_cap_kill_switch può diventare candidato giallo, ma non verde senza implementazione, test e approvazione."
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
  probe = "cost_cap_kill_switch_policy"
  date = "2026-06-18"
  status = $status
  passed = $passedCount
  total = $totalCount
  failed = @($failed | ForEach-Object { $_.name })
  owner_summary_it = "Policy cost cap e kill switch creata. Budget reale zero, chiamate esterne a pagamento vietate, upgrade Cloudflare vietato senza approvazione."
}

$summary | ConvertTo-Json -Depth 6 | Set-Content -Path $summaryPath -Encoding UTF8

if ($failed.Count -gt 0) {
  throw "Cost cap kill switch policy probe failed: $($failed.Count) failed checks"
}

Write-Output "Probe completato: $passedCount/$totalCount controlli superati."
