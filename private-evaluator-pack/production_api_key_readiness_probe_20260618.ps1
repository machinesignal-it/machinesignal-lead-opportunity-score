$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$jsonPath = Join-Path $root "production_api_key_readiness_20260618.json"
$mdPath = Join-Path $root "production_api_key_readiness_20260618.md"
$reportPath = Join-Path $root "production_api_key_readiness_probe_report_20260618.md"
$summaryPath = Join-Path $root "production_api_key_readiness_probe_summary_20260618.json"

$jsonText = Get-Content -LiteralPath $jsonPath -Raw
$json = $jsonText | ConvertFrom-Json
$md = Get-Content -LiteralPath $mdPath -Raw
$mdLower = $md.ToLowerInvariant()

$checks = New-Object System.Collections.Generic.List[object]

function Add-Check {
  param(
    [string]$Name,
    [bool]$Pass,
    [string]$Detail
  )
  $checks.Add([pscustomobject]@{
    name = $Name
    pass = $Pass
    detail = $Detail
  })
}

Add-Check "Status is internal readiness only" ($json.status -eq "draft_internal_readiness_not_key_issuance") $json.status

$falseFlags = @(
  "production_api_keys_allowed",
  "production_key_issuance_allowed",
  "live_traffic_allowed",
  "production_secrets_allowed_in_repo",
  "commercial_activation"
)
foreach ($flag in $falseFlags) {
  Add-Check "Flag false: $flag" (-not [bool]$json.$flag) "$($json.$flag)"
}

$allowedRequired = @(
  "sandbox_key_usage",
  "production_key_policy_draft",
  "key_scope_design",
  "revocation_runbook",
  "rotation_runbook",
  "rate_limit_design",
  "audit_log_design",
  "blocked_production_key_response",
  "nowrite_probe"
)
foreach ($item in $allowedRequired) {
  Add-Check "Allowed-now item present: $item" ($json.allowed_now -contains $item) $item
}

$blockedRequired = @(
  "issue_production_api_key",
  "generate_live_key",
  "store_live_secret_in_repository",
  "send_production_key_to_customer",
  "enable_live_traffic",
  "enable_paid_production_access",
  "production_webhook_delivery",
  "production_customer_data_processing",
  "declare_production_ready"
)
foreach ($item in $blockedRequired) {
  Add-Check "Blocked-now item present: $item" ($json.blocked_now -contains $item) $item
}

$requiredBeforeGreen = @(
  "owner_approval",
  "fiscal_admin_readiness_approved",
  "payment_invoice_readiness_approved",
  "product_listino_approved",
  "terms_privacy_data_approved",
  "security_incident_approved",
  "cost_cap_kill_switch_implemented_and_tested",
  "support_escalation_implemented",
  "production_key_scopes_defined",
  "production_key_storage_secret_manager_selected",
  "key_generation_procedure",
  "key_rotation_procedure",
  "key_revocation_procedure",
  "rate_limits_and_quotas",
  "abuse_detection",
  "audit_logs",
  "customer_billing_profile_verified",
  "no_secrets_in_repository",
  "sandbox_to_production_migration_checklist",
  "synthetic_dry_run_with_no_real_key"
)
foreach ($item in $requiredBeforeGreen) {
  Add-Check "Before-green control present: $item" ($json.required_before_green -contains $item) $item
}

$keyClasses = @{}
foreach ($keyClass in $json.key_classes) {
  $keyClasses[$keyClass.prefix] = $keyClass
}
Add-Check "Sandbox prefix present" ($keyClasses.ContainsKey("ms_sbx_")) "ms_sbx_"
Add-Check "Live prefix present" ($keyClasses.ContainsKey("ms_live_")) "ms_live_"
Add-Check "Admin prefix present" ($keyClasses.ContainsKey("ms_admin_")) "ms_admin_"
Add-Check "Webhook prefix present" ($keyClasses.ContainsKey("ms_wh_")) "ms_wh_"
Add-Check "Live prefix blocked" ($keyClasses.ContainsKey("ms_live_") -and -not [bool]$keyClasses["ms_live_"].allowed_now) "ms_live_ allowed_now"
Add-Check "Webhook production prefix blocked" ($keyClasses.ContainsKey("ms_wh_") -and -not [bool]$keyClasses["ms_wh_"].allowed_now) "ms_wh_ allowed_now"

$minimumFields = @(
  "key_id",
  "customer_id",
  "environment",
  "scope",
  "rate_limit",
  "quota",
  "created_at",
  "expires_at",
  "revoked_at",
  "rotation_due_at",
  "status",
  "allowed_origins_or_ips",
  "billing_profile_id",
  "audit_log_id"
)
foreach ($field in $minimumFields) {
  Add-Check "Minimum key field present: $field" ($json.minimum_production_key_fields -contains $field) $field
}

$response = $json.blocked_machine_response
Add-Check "Blocked response status" ($response.status -eq "blocked_by_production_api_key_readiness") $response.status
Add-Check "Blocked response decision stop" ($response.decision -eq "stop") $response.decision
Add-Check "Blocked response consumes zero credits" ([int]$response.credits_consumed -eq 0) "$($response.credits_consumed)"
Add-Check "Blocked response no production key issued" (-not [bool]$response.production_key_issued) "$($response.production_key_issued)"
Add-Check "Blocked response no live traffic" (-not [bool]$response.live_traffic_enabled) "$($response.live_traffic_enabled)"
Add-Check "Blocked response no secret created" (-not [bool]$response.secret_created) "$($response.secret_created)"
Add-Check "Blocked response owner escalation true" ([bool]$response.owner_escalation_required) "$($response.owner_escalation_required)"
Add-Check "Blocked response support code" ($response.support_code -eq "PRODUCTION_API_KEYS_NOT_READY") $response.support_code

$mayRequired = @(
  "prepare_key_policy_runbooks_scopes",
  "run_nowrite_validation",
  "verify_no_keys_in_repository",
  "prepare_key_issuance_checklist",
  "propose_secret_manager_options",
  "design_rate_limits",
  "design_audit_logs",
  "produce_reports_it"
)
foreach ($item in $mayRequired) {
  Add-Check "Agent may-do present: $item" ($json.agent_may_do -contains $item) $item
}

$mustNotRequired = @(
  "generate_production_key",
  "expose_production_key",
  "commit_secret",
  "enable_live_traffic",
  "send_key_to_external_customer",
  "enable_production_webhooks",
  "process_real_customer_data",
  "process_personal_data",
  "bypass_owner_approval",
  "declare_production_ready"
)
foreach ($item in $mustNotRequired) {
  Add-Check "Agent must-not present: $item" ($json.agent_must_not_do -contains $item) $item
}

Add-Check "Dashboard effect present" ($json.dashboard_effect.production_api_keys -eq "red_to_yellow_candidate") "$($json.dashboard_effect.production_api_keys)"
Add-Check "Next safe action present" ($json.next_safe_action -eq "prepare_or_verify_production_key_request_block_in_nowrite") "$($json.next_safe_action)"

$mdRequired = @(
  "non e' una emissione chiavi production",
  "Regola principale",
  "Cosa e' ammesso ora",
  "Cosa resta bloccato",
  "Classi di chiavi",
  "Risposta macchina se richiede una chiave production",
  "Controlli minimi prima del verde",
  "Gli agenti non possono",
  "da rosso a candidato giallo"
)
foreach ($phrase in $mdRequired) {
  Add-Check "Markdown phrase present: $phrase" ($mdLower.Contains($phrase.ToLowerInvariant())) $phrase
}

$forbiddenPhrases = @(
  '"production_api_keys_allowed": true',
  '"production_key_issuance_allowed": true',
  '"live_traffic_allowed": true',
  '"production_secrets_allowed_in_repo": true',
  "production key approved",
  "live key issued",
  '"production_ready": true',
  "production traffic enabled",
  "chiave production approvata",
  "chiave live emessa",
  "traffico production attivo",
  "segreto production nel repository"
)
foreach ($phrase in $forbiddenPhrases) {
  Add-Check "Forbidden phrase absent: $phrase" (-not ($jsonText.Contains($phrase) -or $md.Contains($phrase))) $phrase
}

$failed = @($checks | Where-Object { -not $_.pass })
$passedCount = @($checks | Where-Object { $_.pass }).Count
$failedCount = $failed.Count

$report = New-Object System.Collections.Generic.List[string]
$report.Add("# Production API Key Readiness Probe Report")
$report.Add("")
$report.Add("Date: 2026-06-18")
$report.Add("")
$report.Add("Scope: controllo NoWrite su readiness API key production. Nessuna chiave vera e nessun segreto creato.")
$report.Add("")
$report.Add("Checks passed: $passedCount")
$report.Add("Checks failed: $failedCount")
$report.Add("")
foreach ($check in $checks) {
  $status = if ($check.pass) { "OK" } else { "FAIL" }
  $report.Add("- [$status] $($check.name): $($check.detail)")
}

Set-Content -LiteralPath $reportPath -Value $report -Encoding UTF8

$summary = [pscustomobject]@{
  document = "production_api_key_readiness_probe_summary"
  date = "2026-06-18"
  checks_passed = $passedCount
  checks_failed = $failedCount
  passed = ($failedCount -eq 0)
  scope_it = "Probe NoWrite su readiness API key production. Non crea chiavi, non crea segreti, non abilita traffico live."
  report = "production_api_key_readiness_probe_report_20260618.md"
  checked_files = @(
    "production_api_key_readiness_20260618.md",
    "production_api_key_readiness_20260618.json"
  )
}

$summary | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $summaryPath -Encoding UTF8

if ($failedCount -gt 0) {
  Write-Host "FAILED: $failedCount checks failed. See $reportPath"
  exit 1
}

Write-Host "PASSED: $passedCount checks passed. Report: $reportPath"
