$ErrorActionPreference = "Stop"

$jsonPath = Join-Path $PSScriptRoot "paid_beta_decision_packet_20260615.json"
$mdPath = Join-Path $PSScriptRoot "paid_beta_decision_packet_20260615.md"
$reportPath = Join-Path $PSScriptRoot "paid_beta_decision_packet_probe_report_20260615.md"
$summaryPath = Join-Path $PSScriptRoot "paid_beta_decision_packet_probe_summary_20260615.json"

$packet = Get-Content -Raw -LiteralPath $jsonPath | ConvertFrom-Json
$md = Get-Content -Raw -LiteralPath $mdPath

$blocked = @($packet.default_agent_instruction_until_owner_approval.blocked)
$allowed = @($packet.default_agent_instruction_until_owner_approval.allowed)
$gates = $packet.mandatory_gates_before_paid_beta

$checks = [ordered]@{
    paid_beta_not_approved = ($packet.current_default_decision.paid_beta -eq "NOT_APPROVED")
    commercial_go_live_no_go = ($packet.current_default_decision.commercial_go_live -eq "NO_GO")
    allowed_now_sandbox_only = ($packet.current_default_decision.allowed_now -eq "sandbox_test_work_only")
    current_blocker_sandbox_daily_limit = ($packet.current_blocker.blocked_by -eq "sandbox_daily_limit")
    requires_probe_rerun = ($packet.current_blocker.required_probe -match "live_api_sandbox_machine_buyer_journey_probe_20260615.ps1")
    must_confirm_target_249 = (@($packet.current_blocker.must_confirm) -contains "target_discovery_purchase_intent_beta_price_range_eur_249")
    option_a_present = ($null -ne $packet.options.A_do_nothing_yet)
    option_b_present = ($null -ne $packet.options.B_controlled_machine_only_paid_beta)
    option_c_present = ($null -ne $packet.options.C_wait_for_legal_fiscal_setup_first)
    option_b_later_only = ($packet.options.B_controlled_machine_only_paid_beta.decision -match "later_only_after_all_gates_pass")
    gate_owner_missing = ($gates.owner_approval -eq "missing")
    gate_fiscal_not_closed = ($gates.fiscal_admin_path -eq "not_closed")
    gate_legal_draft_only = ($gates.legal_terms -eq "draft_only")
    gate_payment_blocked = ($gates.payment_provider -eq "blocked")
    gate_support_paid_not_live = ($gates.support_post_sale -match "paid_not_live")
    minimum_scope_one_customer = ($packet.minimum_scope_if_approved_later.customers -eq 1)
    minimum_scope_no_auto_renewal = ($packet.minimum_scope_if_approved_later.auto_renewal -eq $false)
    minimum_scope_no_personal_data = ($packet.minimum_scope_if_approved_later.personal_data -eq $false)
    recommended_first_score_pack = ($packet.recommended_first_product.product_code -eq "score_pack_1k")
    recommended_second_target_discovery = ($packet.recommended_second_product.product_code -eq "target_discovery_pack_250")
    blocks_collect_money = ($blocked -contains "collect_money")
    blocks_payment_methods = ($blocked -contains "collect_payment_methods")
    blocks_invoices = ($blocked -contains "issue_invoices")
    blocks_real_customers = ($blocked -contains "onboard_real_customers")
    blocks_production_keys = ($blocked -contains "issue_production_api_keys")
    allows_probe_once_after_reset = ($allowed -contains "rerun_authenticated_live_api_probe_once_after_sandbox_reset")
    md_says_not_approve = ($md -match "does not approve paid beta")
}

$forbidden = @(
    "paid beta: approved",
    "commercial go-live: go",
    "activate real payments now",
    "issue invoices now",
    "collect payment methods now",
    "production api keys allowed",
    "onboard real customers now"
)

foreach ($phrase in $forbidden) {
    $key = "forbidden_absent_" + (($phrase -replace "[^a-zA-Z0-9]+", "_").Trim("_"))
    $checks[$key] = (-not $md.ToLowerInvariant().Contains($phrase.ToLowerInvariant()))
}

$failed = @($checks.GetEnumerator() | Where-Object { -not $_.Value })
$result = [ordered]@{
    checked_at_utc = (Get-Date).ToUniversalTime().ToString("s") + "Z"
    test_id = "paid_beta_decision_packet_probe_20260615"
    status = if ($failed.Count -eq 0) { "PASS" } else { "FAIL" }
    pass_count = @($checks.GetEnumerator() | Where-Object Value).Count
    total_count = $checks.Count
    failed_checks = @($failed | ForEach-Object { $_.Key })
    checks = $checks
}

$report = @(
    "# Paid-Beta Decision Packet Probe - 2026-06-15",
    "",
    "Status: $($result.status)",
    "Checks: $($result.pass_count)/$($result.total_count)",
    "",
    "## Failed Checks",
    "",
    $(if ($failed.Count -eq 0) { "None." } else { ($failed | ForEach-Object { "- $($_.Key)" }) -join "`n" }),
    "",
    "## Interpretation",
    "",
    "The packet prepares a future owner decision while preserving paid-beta-not-approved and commercial no-go defaults."
) -join "`n"

$report | Set-Content -LiteralPath $reportPath -Encoding UTF8
$result | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $summaryPath -Encoding UTF8

if ($failed.Count -gt 0) {
    throw "Paid-beta decision packet probe failed: $($result.failed_checks -join ', ')"
}

Write-Output "PASS $($result.pass_count)/$($result.total_count)"
