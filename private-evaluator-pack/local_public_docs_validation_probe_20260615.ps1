$ErrorActionPreference = "Stop"

$site = "C:\Users\natal\Documents\Codex\2026-05-24\vorrei-ora-creare-un-agente-che\machinesignal_site"
$reportPath = "private-evaluator-pack/local_public_docs_validation_probe_report_20260615.md"
$summaryPath = "private-evaluator-pack/local_public_docs_validation_probe_summary_20260615.json"

$catalog = Get-Content -Raw (Join-Path $site "product-catalog.json") | ConvertFrom-Json
$onboarding = Get-Content -Raw (Join-Path $site "machine-onboarding.json") | ConvertFrom-Json
$llms = Get-Content -Raw (Join-Path $site "llms.txt")

$checks = @()

function Add-Check($Name, $Pass) {
  $script:checks += [pscustomobject]@{
    check = $Name
    pass = [bool]$Pass
  }
}

Add-Check "catalog_version_updated" ($catalog.catalog_version -eq "2026-06-15-beta-readiness-proposal")
Add-Check "catalog_commercial_status_not_live" ($catalog.status.commercial_status -eq "not_live")
Add-Check "catalog_go_live_no_go" ($catalog.status.go_live -eq "no_go")
Add-Check "catalog_paid_beta_not_approved" ($catalog.status.paid_beta -eq "not_approved")
Add-Check "catalog_target_discovery_249" ($catalog.products.target_discovery_pack_250.price_eur -eq 249)
Add-Check "catalog_score_pack_119" ($catalog.products.score_pack_1k.price_eur -eq 119)
Add-Check "catalog_no_real_payment" ($catalog.payment_mode.real_payment_executed -eq $false)
Add-Check "catalog_no_payment_method_collection" ($catalog.payment_mode.payment_method_collection -eq $false)
Add-Check "catalog_no_invoice" ($catalog.payment_mode.invoice_issued -eq $false)
Add-Check "catalog_no_personal_data" ($catalog.status.data_policy.personal_data_allowed -eq $false)
Add-Check "catalog_no_real_customer_data" ($catalog.status.data_policy.real_customer_data_allowed -eq $false)
Add-Check "catalog_no_production_keys" ($catalog.status.key_policy.production_keys_allowed -eq $false)

Add-Check "onboarding_commercial_status_not_live" ($onboarding.status.commercial_status -eq "not_live")
Add-Check "onboarding_go_live_no_go" ($onboarding.status.go_live -eq "no_go")
Add-Check "onboarding_paid_beta_not_approved" ($onboarding.status.paid_beta -eq "not_approved")
Add-Check "onboarding_target_discovery_249" ($onboarding.products.target_discovery_pack_250.price_eur -eq 249)
Add-Check "onboarding_score_pack_119" ($onboarding.products.score_pack_1k.price_eur -eq 119)
Add-Check "onboarding_payment_test_mode" ($onboarding.payment_and_billing.mode -eq "test_mode_only")
Add-Check "onboarding_live_checkout_false" ($onboarding.payment_and_billing.live_checkout_enabled -eq $false)
Add-Check "onboarding_invoice_false" ($onboarding.payment_and_billing.invoice_issued -eq $false)

Add-Check "llms_target_discovery_249" ($llms.Contains("Target Discovery Pack 250: EUR 249"))
Add-Check "llms_score_pack_119" ($llms.Contains("Score Pack 1k: EUR 119"))
Add-Check "llms_not_live" ($llms.Contains("commercial_status: not_live"))
Add-Check "llms_no_go" ($llms.Contains("go_live: no_go"))
Add-Check "llms_paid_beta_not_approved" ($llms.Contains("paid_beta: not_approved"))
Add-Check "llms_no_real_payment" ($llms.Contains("no real payment"))
Add-Check "llms_no_payment_method_collection" ($llms.Contains("no payment-method collection"))
Add-Check "llms_no_invoice" ($llms.Contains("no invoice"))

$failed = @($checks | Where-Object { -not $_.pass })
$summary = [ordered]@{
  artifact = "local_public_docs_validation_probe"
  date = "2026-06-15"
  mode = "NoWrite-local-validation"
  total_checks = $checks.Count
  failed_checks = $failed.Count
  passed = ($failed.Count -eq 0)
  commercial_status = "not_live"
  go_live = "no_go"
  ftp_upload_executed = $false
  live_publication_executed = $false
  next_step = if ($failed.Count -eq 0) { "owner_decision_keep_local_or_approve_ftp_upload" } else { "fix_local_site_docs_before_owner_decision" }
  failed = @($failed | ForEach-Object { $_.check })
}

$report = @(
  "# MachineSignal - Local Public Docs Validation Probe - 2026-06-15",
  "",
  "Mode: NoWrite local validation",
  "Commercial status: not_live",
  "Go-live: no_go",
  "FTP upload executed: false",
  "Live publication executed: false",
  "Total checks: $($summary.total_checks)",
  "Failed checks: $($summary.failed_checks)",
  "Result: $(if ($summary.passed) { 'PASS' } else { 'FAIL' })",
  "",
  "## Failed Checks",
  "",
  $(if ($failed.Count -eq 0) { "None." } else { ($failed | ForEach-Object { "- $($_.check)" }) -join "`n" }),
  "",
  "## Guardrail",
  "",
  "This probe validates local site files only. It does not upload to Register.it, does not publish live files, does not activate paid beta, does not collect payment methods, does not issue invoices and does not process real/personal data."
) -join "`n"

Set-Content -Path $reportPath -Value ($report + "`n") -Encoding UTF8
($summary | ConvertTo-Json -Depth 8) | Set-Content -Path $summaryPath -Encoding UTF8

$summary | ConvertTo-Json -Depth 8
