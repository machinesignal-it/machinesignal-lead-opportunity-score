$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$jsonPath = Join-Path $root "owner_commercial_approval_packet_20260618.json"
$mdPath = Join-Path $root "owner_commercial_approval_packet_20260618.md"
$dashboardPath = Join-Path $root "owner_decision_dashboard_20260618.json"
$brainPath = Join-Path (Split-Path -Parent $root) "company-brain.json"
$reportPath = Join-Path $root "owner_commercial_approval_packet_probe_report_20260618.md"
$summaryPath = Join-Path $root "owner_commercial_approval_packet_probe_summary_20260618.json"

$jsonText = Get-Content -LiteralPath $jsonPath -Raw -Encoding UTF8
$json = $jsonText | ConvertFrom-Json
$md = Get-Content -LiteralPath $mdPath -Raw -Encoding UTF8
$dashboard = (Get-Content -LiteralPath $dashboardPath -Raw -Encoding UTF8) | ConvertFrom-Json
$brain = (Get-Content -LiteralPath $brainPath -Raw -Encoding UTF8) | ConvertFrom-Json

$checks = New-Object System.Collections.Generic.List[object]

function Add-Check {
  param([string]$Name, [bool]$Pass, [string]$Detail)
  $script:checks.Add([pscustomobject]@{
    name = $Name
    pass = $Pass
    detail = $Detail
  })
}

Add-Check "Status draft not activated" ($json.status -eq "draft_owner_decision_packet_not_signed_not_activated") $json.status
Add-Check "Remaining red gate owner approval" ($json.remaining_red_gate -eq "owner_commercial_approval") $json.remaining_red_gate
Add-Check "Dashboard 3 green" ([int]$json.current_dashboard_counts.green -eq 3) "$($json.current_dashboard_counts.green)"
Add-Check "Dashboard 12 yellow" ([int]$json.current_dashboard_counts.yellow -eq 12) "$($json.current_dashboard_counts.yellow)"
Add-Check "Dashboard 1 red" ([int]$json.current_dashboard_counts.red -eq 1) "$($json.current_dashboard_counts.red)"

$falseFlags = @(
  "commercial_activation",
  "paid_beta_activation_allowed",
  "commercial_go_live_allowed",
  "real_payments_allowed",
  "invoices_allowed",
  "payment_method_collection_allowed",
  "production_api_key_issuance_allowed",
  "real_customer_data_allowed",
  "personal_data_allowed",
  "external_outreach_allowed",
  "marketplace_publication_allowed",
  "hosted_public_mcp_allowed",
  "mcp_registry_publication_allowed"
)
foreach ($flag in $falseFlags) {
  Add-Check "Flag false: $flag" (-not [bool]$json.$flag) "$($json.$flag)"
}

$requiredOwnerDecisions = @(
  "approve_or_reject_controlled_paid_beta",
  "approve_or_change_first_product_score_pack_1k",
  "approve_or_change_initial_price_119_eur",
  "approve_beta_customer_cap_3_to_5",
  "approve_machine_readable_distribution_no_human_outreach",
  "approve_real_data_policy_or_keep_real_data_blocked",
  "approve_fiscal_admin_path_before_any_money_or_invoice",
  "approve_payment_invoice_path_before_checkout_card_or_invoice",
  "approve_terms_privacy_data_before_real_onboarding",
  "approve_production_key_process_before_live_keys",
  "approve_support_escalation_before_paying_customers",
  "approve_security_incident_handling_before_production_access",
  "sign_final_decision_only_if_all_required_gates_are_ready"
)
foreach ($item in $requiredOwnerDecisions) {
  Add-Check "Owner decision required: $item" ($json.owner_decisions_required -contains $item) $item
}

$requiredBlocked = @(
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
  "submit_mcp_registry",
  "declare_commercial_go_live"
)
foreach ($item in $requiredBlocked) {
  Add-Check "Blocked now item present: $item" ($json.blocked_now -contains $item) $item
}

$response = $json.blocked_machine_response
Add-Check "Blocked response status" ($response.status -eq "blocked_by_owner_commercial_approval") $response.status
Add-Check "Blocked response decision stop" ($response.decision -eq "stop") $response.decision
Add-Check "Blocked response paid beta false" (-not [bool]$response.paid_beta_activation) "$($response.paid_beta_activation)"
Add-Check "Blocked response go-live false" (-not [bool]$response.commercial_go_live) "$($response.commercial_go_live)"
Add-Check "Blocked response payment false" (-not [bool]$response.real_payment_executed) "$($response.real_payment_executed)"
Add-Check "Blocked response invoice false" (-not [bool]$response.invoice_issued) "$($response.invoice_issued)"
Add-Check "Blocked response payment method false" (-not [bool]$response.payment_method_collected) "$($response.payment_method_collected)"
Add-Check "Blocked response production key false" (-not [bool]$response.production_key_issued) "$($response.production_key_issued)"
Add-Check "Blocked response data false" (-not [bool]$response.real_or_personal_data_processed) "$($response.real_or_personal_data_processed)"
Add-Check "Blocked response outreach false" (-not [bool]$response.external_outreach_sent) "$($response.external_outreach_sent)"
Add-Check "Blocked response zero credits" ([int]$response.credits_consumed -eq 0) "$($response.credits_consumed)"
Add-Check "Blocked response owner escalation true" ([bool]$response.owner_escalation_required) "$($response.owner_escalation_required)"
Add-Check "Blocked response support code" ($response.support_code -eq "OWNER_COMMERCIAL_APPROVAL_NOT_SIGNED") $response.support_code

$requiredConditions = @(
  "fiscal_admin_readiness_owner_approved",
  "payment_invoice_readiness_owner_approved",
  "terms_privacy_data_owner_approved",
  "product_listino_owner_approved",
  "credit_refund_policy_owner_approved",
  "cost_cap_kill_switch_implemented_and_tested",
  "support_escalation_implemented_and_tested",
  "security_incident_handling_owner_approved_and_tested",
  "production_api_key_process_owner_approved_and_tested",
  "no_secrets_in_repository",
  "no_real_personal_data_in_tests",
  "no_external_outreach",
  "no_public_marketplace_or_hosted_mcp_without_separate_approval",
  "owner_signature_recorded",
  "final_go_no_go_report_generated_it"
)
foreach ($item in $requiredConditions) {
  Add-Check "Minimum condition before yes: $item" ($json.minimum_conditions_before_yes -contains $item) $item
}

$agentMustNot = @(
  "sign_for_owner",
  "activate_paid_beta",
  "execute_payment",
  "issue_invoice",
  "collect_payment_method",
  "issue_production_api_key",
  "process_real_customer_data",
  "process_personal_data",
  "contact_external_parties",
  "publish_marketplace_or_registry",
  "declare_commercial_go_live"
)
foreach ($item in $agentMustNot) {
  Add-Check "Agent must-not present: $item" ($json.agent_must_not_do -contains $item) $item
}

Add-Check "Dashboard owner approval remains red" ($json.dashboard_effect.owner_commercial_approval -eq "red_remains_red_until_owner_signature") "$($json.dashboard_effect.owner_commercial_approval)"
Add-Check "Next safe action present" ($json.next_safe_action -eq "create_owner_decision_checklist_and_nowrite_final_decision_simulation") "$($json.next_safe_action)"
Add-Check "Source dashboard has 1 red" ([int]$dashboard.gate_counts.red -eq 1) "$($dashboard.gate_counts.red)"
Add-Check "Source dashboard final paid beta no-go" ($dashboard.final_decision.paid_beta_activation -eq "no_go") $dashboard.final_decision.paid_beta_activation
Add-Check "Source dashboard final go-live no-go" ($dashboard.final_decision.commercial_go_live -eq "no_go") $dashboard.final_decision.commercial_go_live
Add-Check "Company Brain red is owner approval" ($brain.owner_decision_dashboard.red -contains "owner_commercial_approval") "company-brain red"

$mdRequired = @(
  "Non approva la beta a pagamento",
  "PAID BETA ACTIVATION: NO-GO",
  "COMMERCIAL GO-LIVE: NO-GO",
  "Cosa resta bloccato adesso",
  "Risposta macchina finche' manca approvazione",
  "Condizioni minime prima di poter dire si",
  "Cosa gli agenti non possono fare",
  "Questo pacchetto riduce l'incertezza, ma non riduce i blocchi"
)
foreach ($phrase in $mdRequired) {
  Add-Check "Markdown phrase present: $phrase" ($md.Contains($phrase)) $phrase
}

$unsafePhrases = @(
  '"commercial_activation": true',
  '"paid_beta_activation_allowed": true',
  '"commercial_go_live_allowed": true',
  '"real_payments_allowed": true',
  '"invoices_allowed": true',
  '"payment_method_collection_allowed": true',
  '"production_api_key_issuance_allowed": true',
  '"real_customer_data_allowed": true',
  '"personal_data_allowed": true',
  '"external_outreach_allowed": true',
  '"marketplace_publication_allowed": true',
  '"hosted_public_mcp_allowed": true',
  '"mcp_registry_publication_allowed": true',
  "paid beta approved",
  "commercial go-live approved",
  "payment approved",
  "invoice approved",
  "production key approved",
  "outreach approved",
  "beta a pagamento approvata",
  "go-live commerciale approvato",
  "pagamento approvato",
  "fattura approvata",
  "chiave production approvata",
  "outreach approvato"
)
foreach ($phrase in $unsafePhrases) {
  Add-Check "Forbidden phrase absent: $phrase" (-not ($jsonText.Contains($phrase) -or $md.Contains($phrase))) $phrase
}

$failed = @($checks | Where-Object { -not $_.pass })
$passedCount = @($checks | Where-Object { $_.pass }).Count
$failedCount = $failed.Count

$report = New-Object System.Collections.Generic.List[string]
$report.Add("# Owner Commercial Approval Packet Probe Report")
$report.Add("")
$report.Add("Date: 2026-06-18")
$report.Add("")
$report.Add("Scope: controllo NoWrite sul pacchetto approvazione commerciale proprietario. Nessuna attivazione commerciale.")
$report.Add("")
$report.Add("Checks passed: $passedCount")
$report.Add("Checks failed: $failedCount")
$report.Add("")
$report.Add("Sintesi:")
$report.Add("")
$report.Add("- Il pacchetto prepara la decisione proprietario ma non approva nulla.")
$report.Add("- Paid beta, pagamenti, fatture, chiavi production, dati reali/personali, outreach e go-live restano bloccati.")
$report.Add("- Il rosso owner_commercial_approval resta rosso finche' manca firma esplicita.")
$report.Add("")
$report.Add("Dettaglio controlli:")
$report.Add("")
foreach ($check in $checks) {
  $status = if ($check.pass) { "OK" } else { "FAIL" }
  $report.Add("- [$status] $($check.name): $($check.detail)")
}

Set-Content -LiteralPath $reportPath -Value $report -Encoding UTF8

$summary = [pscustomobject]@{
  document = "owner_commercial_approval_packet_probe_summary"
  date = "2026-06-18"
  checks_passed = $passedCount
  checks_failed = $failedCount
  passed = ($failedCount -eq 0)
  remaining_red_gate = "owner_commercial_approval"
  commercial_activation = $false
  report = "owner_commercial_approval_packet_probe_report_20260618.md"
}

$summary | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $summaryPath -Encoding UTF8

if ($failedCount -gt 0) {
  Write-Host "FAILED: $failedCount checks failed. See $reportPath"
  exit 1
}

Write-Host "PASSED: $passedCount checks passed. Report: $reportPath"
