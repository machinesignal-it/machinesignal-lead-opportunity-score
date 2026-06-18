$ErrorActionPreference = "Stop"

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$mdPath = Join-Path $root "private-evaluator-pack/security_incident_readiness_20260618.md"
$jsonPath = Join-Path $root "private-evaluator-pack/security_incident_readiness_20260618.json"
$reportPath = Join-Path $root "private-evaluator-pack/security_incident_readiness_probe_report_20260618.md"
$summaryPath = Join-Path $root "private-evaluator-pack/security_incident_readiness_probe_summary_20260618.json"

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

Add-Check "Documento Markdown presente" (Test-Path $mdPath) "La bozza leggibile deve esistere."
Add-Check "Documento JSON presente" (Test-Path $jsonPath) "La bozza macchina deve esistere."
Add-Check "Lingua italiana dichiarata" ($json.language -eq "it") "La bozza deve essere in italiano."
Add-Check "Stato bozza interna" ($json.status -eq "draft_internal_policy") "La bozza deve restare interna."
Add-Check "Security non finale" ($json.security_final -eq $false) "Non deve sembrare certificazione finale."
Add-Check "Nessuna attivazione commerciale" ($json.commercial_activation -eq $false) "La bozza non deve attivare beta o go-live."
Add-Check "Non production ready" ($json.production_ready -eq $false) "Non deve dichiarare production readiness."
Add-Check "Chiavi production non ammesse" ($json.production_keys_allowed -eq $false) "Le chiavi production devono restare bloccate."
Add-Check "Dati reali non ammessi" ($json.real_data_allowed -eq $false) "I dati reali devono restare bloccati."
Add-Check "Dati personali non ammessi" ($json.personal_data_allowed -eq $false) "I dati personali devono restare bloccati."
Add-Check "Costi esterni non ammessi" ($json.external_cost_allowed -eq $false) "I costi esterni devono restare bloccati."

$requiredBlocks = @(
  "real_payments",
  "invoices",
  "payment_method_collection",
  "production_api_keys",
  "production_secrets",
  "real_customer_data",
  "personal_data",
  "sensitive_data",
  "external_paid_api_calls",
  "cloudflare_paid_plan_upgrade",
  "external_outreach",
  "marketplace_publication",
  "hosted_public_mcp",
  "mcp_registry_publication",
  "commercial_go_live"
)

foreach ($block in $requiredBlocks) {
  Add-Check "Azione vietata dichiarata: $block" ($json.does_not_authorize -contains $block) "La bozza deve confermare che questa azione resta vietata."
}

$requiredIncidentClasses = @(
  "exposed_secret",
  "production_key_attempt",
  "real_data_detected",
  "abnormal_request_pattern",
  "ledger_failure",
  "repeated_incoherent_outputs",
  "external_cost_attempt",
  "unauthorized_publication",
  "account_access_anomaly",
  "dependency_or_platform_alert",
  "customer_abuse",
  "global_emergency"
)

foreach ($class in $requiredIncidentClasses) {
  Add-Check "Classe incidente presente: $class" ($json.incident_classes -contains $class) "Ogni classe incidente critica deve essere mappata."
}

foreach ($sev in @("S0", "S1", "S2", "S3", "S4")) {
  $found = @($json.severity_levels | Where-Object { $_.id -eq $sev })
  Add-Check "Severità presente: $sev" ($found.Count -eq 1) "Ogni severità S0-S4 deve essere presente."
  if ($found.Count -eq 1) {
    Add-Check "Severità con azione: $sev" (-not [string]::IsNullOrWhiteSpace($found[0].action_it)) "Ogni severità deve avere un'azione."
  }
}

$requiredSwitches = @(
  "secret_kill_switch",
  "data_policy_kill_switch",
  "endpoint_security_kill_switch",
  "customer_security_kill_switch",
  "external_cost_kill_switch",
  "publication_kill_switch",
  "global_beta_kill_switch"
)

foreach ($switch in $requiredSwitches) {
  Add-Check "Kill switch sicurezza presente: $switch" ($json.security_kill_switch_types -contains $switch) "Ogni kill switch sicurezza deve essere dichiarato."
}

$requiredTriggers = @(
  "exposed_secret_detected",
  "real_or_personal_data_detected",
  "production_key_attempt",
  "ledger_event_failure",
  "external_cost_above_zero",
  "repeated_endpoint_errors",
  "unauthorized_publication_attempt",
  "unclassified_risk"
)

foreach ($trigger in $requiredTriggers) {
  Add-Check "Trigger sicurezza presente: $trigger" ($json.kill_switch_triggers -contains $trigger) "I trigger sicurezza devono essere dichiarati."
}

$requiredIncidentFields = @(
  "incident_id",
  "timestamp",
  "severity",
  "incident_class",
  "detected_by",
  "environment",
  "affected_endpoint",
  "affected_product_code",
  "request_id",
  "data_policy_impact",
  "secret_impact",
  "cost_impact_eur",
  "credits_consumed",
  "kill_switch_applied",
  "owner_escalation_required",
  "immediate_action",
  "next_action",
  "status"
)

foreach ($field in $requiredIncidentFields) {
  Add-Check "Campo incident presente: $field" ($json.incident_event_required_fields -contains $field) "L'incident event deve poter ricostruire il caso."
}

Add-Check "Risposta blocco security non consuma crediti" ($json.blocked_response_example.credits_consumed -eq 0) "Un incidente bloccato non deve consumare crediti."
Add-Check "Risposta blocco security richiede escalation" ($json.blocked_response_example.owner_escalation_required -eq $true) "Incidenti sicurezza devono scalare quando rilevanti."
Add-Check "Risposta blocco security dice stop" ($json.blocked_response_example.decision -eq "stop") "La macchina cliente deve fermarsi."

$requiredSecretRules = @(
  "Non scrivere password, token o API key nei report.",
  "Non committare segreti.",
  "Non usare chiavi production.",
  "Usare placeholder nei documenti."
)

foreach ($rule in $requiredSecretRules) {
  Add-Check "Regola segreti presente: $rule" ($json.secret_rules_it -contains $rule) "Le regole minime sui segreti devono essere presenti."
}

$requiredAlerts = @(
  "cloudflare_limit_exceeded",
  "github_actions_failed",
  "windows_security_alert",
  "provider_billing_or_cost_alert",
  "unexpected_permission_or_token_alert"
)

foreach ($alert in $requiredAlerts) {
  Add-Check "Provider alert presente: $alert" ($json.provider_alert_rules -contains $alert) "Gli alert provider principali devono essere previsti."
}

$requiredForbidden = @(
  "buy_plans_or_credits",
  "authorize_real_costs",
  "use_production_keys",
  "process_real_or_personal_data",
  "contact_external_parties",
  "publish_marketplace_or_mcp",
  "declare_incident_closed_without_evidence",
  "ignore_severe_alerts"
)

foreach ($item in $requiredForbidden) {
  Add-Check "Azione agente vietata: $item" ($json.agent_must_not_do -contains $item) "Gli agenti non devono superare i blocchi."
}

$requiredEscalations = @(
  "severity_s3_or_s4",
  "exposed_secret",
  "real_or_personal_data_detected",
  "potential_cost_above_zero",
  "production_key_request_or_attempt",
  "external_publication_request",
  "account_access_anomaly",
  "global_kill_switch",
  "uncovered_policy_decision"
)

foreach ($item in $requiredEscalations) {
  Add-Check "Escalation proprietario presente: $item" ($json.owner_escalation_required_when -contains $item) "I casi critici devono scalare al proprietario."
}

$mustAppearInMd = @(
  "bloccare prima",
  "Classi di incidente",
  "Kill switch di sicurezza",
  "Regole sui segreti",
  "Regole provider e alert",
  "Divieti confermati"
)

foreach ($phrase in $mustAppearInMd) {
  Add-Check "Frase chiave Markdown: $phrase" ($md -match [regex]::Escape($phrase)) "Il Markdown deve essere chiaro per il proprietario."
}

$unsafePhrases = @(
  "security approved",
  "production is ready",
  "production keys allowed",
  "real data allowed",
  "personal data allowed",
  "external cost allowed",
  "commercial go-live approved",
  "sicurezza finale approvata",
  "production pronta",
  "chiavi production ammesse",
  "dati reali ammessi",
  "dati personali ammessi",
  "go-live commerciale approvato"
)

$combined = $md + "`n" + (Get-Content -Raw -Encoding UTF8 $jsonPath)
foreach ($phrase in $unsafePhrases) {
  Add-Check "Nessuna frase di attivazione: $phrase" ($combined -notmatch [regex]::Escape($phrase)) "La bozza non deve sembrare un'approvazione."
}

Add-Check "Effetto dashboard corretto" ($json.dashboard_effect.security_incident_readiness -eq "red_to_yellow_candidate") "La bozza può solo candidare il blocco a giallo."

$failed = @($checks | Where-Object { -not $_.passed })
$passedCount = @($checks | Where-Object { $_.passed }).Count
$totalCount = $checks.Count
$status = if ($failed.Count -eq 0) { "SUPERATO" } else { "FALLITO" }

$report = @()
$report += "# Report controllo security/incident readiness"
$report += ""
$report += "Data controllo: 2026-06-18"
$report += ""
$report += "Esito: $status"
$report += ""
$report += "Controlli superati: $passedCount/$totalCount"
$report += ""
$report += "Sintesi:"
$report += ""
$report += "- La bozza definisce classi incidente, severità, kill switch, incident event e regole sui segreti."
$report += "- Chiavi production, dati reali/personali, costi esterni e go-live restano bloccati."
$report += "- Il blocco security_incident_readiness può diventare candidato giallo, ma non verde senza approvazione, test sintetico e procedure finali."
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
  probe = "security_incident_readiness"
  date = "2026-06-18"
  status = $status
  passed = $passedCount
  total = $totalCount
  failed = @($failed | ForEach-Object { $_.name })
  owner_summary_it = "Bozza security/incident readiness creata. Chiavi production, segreti, dati reali/personali, costi esterni e go-live restano bloccati."
}

$summary | ConvertTo-Json -Depth 6 | Set-Content -Path $summaryPath -Encoding UTF8

if ($failed.Count -gt 0) {
  throw "Security/incident readiness probe failed: $($failed.Count) failed checks"
}

Write-Output "Probe completato: $passedCount/$totalCount controlli superati."
