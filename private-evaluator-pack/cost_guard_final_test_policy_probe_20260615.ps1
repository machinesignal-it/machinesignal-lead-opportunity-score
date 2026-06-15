$ErrorActionPreference = "Stop"

$jsonPath = Join-Path $PSScriptRoot "cost_guard_final_test_policy_20260615.json"
$mdPath = Join-Path $PSScriptRoot "cost_guard_final_test_policy_20260615.md"
$reportPath = Join-Path $PSScriptRoot "cost_guard_final_test_policy_probe_report_20260615.md"
$summaryPath = Join-Path $PSScriptRoot "cost_guard_final_test_policy_probe_summary_20260615.json"
$corePath = Join-Path (Split-Path -Parent $PSScriptRoot) "api_endpoint_minimal/core.mjs"

$policy = Get-Content -Raw -LiteralPath $jsonPath | ConvertFrom-Json
$md = Get-Content -Raw -LiteralPath $mdPath
$core = Get-Content -Raw -LiteralPath $corePath
$hardStopSignals = @($policy.hard_stops | ForEach-Object { [string]$_.signal })

$checks = [ordered]@{
    sandbox_allowed_with_limits = ($policy.decision.sandbox_tests -eq "allowed_with_limits")
    paid_beta_not_approved = ($policy.decision.paid_beta -eq "not_approved")
    commercial_go_live_no_go = ($policy.decision.commercial_go_live -eq "no_go")
    target_discovery_price_249 = ($policy.current_price_basis_eur.target_discovery_pack_250 -eq 249)
    score_pack_price_119 = ($policy.current_price_basis_eur.score_pack_1k -eq 119)
    action_pack_price_399 = ($policy.current_price_basis_eur.action_pack_25 -eq 399)
    hard_stop_includes_sandbox_limit = ($hardStopSignals -contains "sandbox_limit_exceeded")
    hard_stop_includes_real_payment = ($hardStopSignals -contains "real_payment_attempted")
    hard_stop_includes_external_outreach = ($hardStopSignals -contains "external_outreach_attempted")
    sandbox_global_limit_matches_core = ($core -match "MACHINESIGNAL_SANDBOX_DAILY_LIMIT,\s*25")
    sandbox_fingerprint_limit_matches_core = ($core -match "MACHINESIGNAL_SANDBOX_DAILY_FINGERPRINT_LIMIT,\s*3")
    sandbox_expiry_matches_docs = ($core -match "default_expires_after_days:\s*7")
    valid_output_rule_present = ($policy.valid_output_cost_rule.consume_credit_only_on_valid_usable_output -eq $true)
    not_consumable_gate_failures_present = ($policy.valid_output_cost_rule.not_consumable -contains "gate_failures_that_correctly_block_next_product")
    continued_testing_pass_with_limits = ($policy.status.continued_testing -eq "PASS_WITH_ACTIVE_LIMITS")
    paid_beta_conditional_not_pass = ($policy.status.paid_beta -eq "CONDITIONAL_NOT_YET_PASS")
    md_mentions_no_retries_after_429 = ($md -match "429" -and $md -match "not increase retries|stop creating sandbox keys")
    md_blocks_payment_method_collection = ($md -match "Payment method collection attempted" -and $md -match "stop immediately")
    md_blocks_production_key_distribution = ($md -match "Production API key" -and $md -match "stop")
}

$forbidden = @(
    "paid beta: approved",
    "commercial go-live: go",
    "real payments allowed",
    "invoices allowed",
    "production keys allowed",
    "external outreach allowed",
    "increase retries after 429"
)

foreach ($phrase in $forbidden) {
    $key = "forbidden_absent_" + (($phrase -replace "[^a-zA-Z0-9]+", "_").Trim("_"))
    $checks[$key] = (-not $md.ToLowerInvariant().Contains($phrase.ToLowerInvariant()))
}

$failed = @($checks.GetEnumerator() | Where-Object { -not $_.Value })
$result = [ordered]@{
    checked_at_utc = (Get-Date).ToUniversalTime().ToString("s") + "Z"
    test_id = "cost_guard_final_test_policy_probe_20260615"
    status = if ($failed.Count -eq 0) { "PASS" } else { "FAIL" }
    pass_count = @($checks.GetEnumerator() | Where-Object Value).Count
    total_count = $checks.Count
    failed_checks = @($failed | ForEach-Object { $_.Key })
    checks = $checks
}

$report = @(
    "# Cost Guard Final Test Policy Probe - 2026-06-15",
    "",
    "Status: $($result.status)",
    "Checks: $($result.pass_count)/$($result.total_count)",
    "",
    "## Failed Checks",
    "",
    $(if ($failed.Count -eq 0) { "None." } else { ($failed | ForEach-Object { "- $($_.Key)" }) -join "`n" })
) -join "`n"

$report | Set-Content -LiteralPath $reportPath -Encoding UTF8
$result | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $summaryPath -Encoding UTF8

if ($failed.Count -gt 0) {
    throw "Cost guard final test policy probe failed: $($result.failed_checks -join ', ')"
}

Write-Output "PASS $($result.pass_count)/$($result.total_count)"
