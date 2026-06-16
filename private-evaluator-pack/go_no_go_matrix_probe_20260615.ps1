$ErrorActionPreference = "Stop"

$jsonPath = Join-Path $PSScriptRoot "go_no_go_matrix_20260615.json"
$mdPath = Join-Path $PSScriptRoot "go_no_go_matrix_20260615.md"
$reportPath = Join-Path $PSScriptRoot "go_no_go_matrix_probe_report_20260615.md"
$summaryPath = Join-Path $PSScriptRoot "go_no_go_matrix_probe_summary_20260615.json"

$matrix = Get-Content -Raw -LiteralPath $jsonPath | ConvertFrom-Json
$md = Get-Content -Raw -LiteralPath $mdPath

$checks = [ordered]@{
    commercial_go_live_no_go = ($matrix.decision.commercial_go_live -eq "NO_GO")
    paid_beta_not_approved = ($matrix.decision.paid_beta -eq "NOT_APPROVED")
    sandbox_go_with_limits = ($matrix.decision.sandbox_test_work -eq "GO_WITH_LIMITS")
    includes_no_open_technical_sandbox_blocker = ($md -match "No technical sandbox blocker remains open")
    includes_authenticated_probe_pass = ($md -match "Authenticated Live API Probe" -and $md -match "Result: PASS")
    includes_target_discovery_249_recheck = ($md -match 'beta_price_range_eur: "249"')
    includes_no_real_payment_guard = ($md -match "real payment" -and $md -match "blocked|must not|No real payment|no real payment")
    includes_no_external_outreach_guard = ($md -match "external outreach" -or $md -match "email campaigns")
    includes_legal_fiscal_payment_blockers = ($md -match "Legal terms" -and $md -match "Fiscal/admin" -and $md -match "Payment provider")
    allows_only_test_work = ($md -match "sandbox/test probes" -and $md -match "local regression tests")
    blocks_production_keys = ($md -match "production API key" -and $md -match "blocked|must not|No production")
}

$forbidden = @(
    "Commercial go-live: GO",
    "Paid beta: APPROVED",
    "real payments allowed",
    "production keys allowed",
    "external outreach allowed",
    "marketplace launch approved"
)

foreach ($phrase in $forbidden) {
    $key = "forbidden_absent_" + (($phrase -replace "[^a-zA-Z0-9]+", "_").Trim("_"))
    $checks[$key] = (-not $md.ToLowerInvariant().Contains($phrase.ToLowerInvariant()))
}

$failed = @($checks.GetEnumerator() | Where-Object { -not $_.Value })
$result = [ordered]@{
    checked_at_utc = (Get-Date).ToUniversalTime().ToString("s") + "Z"
    test_id = "go_no_go_matrix_probe_20260615"
    status = if ($failed.Count -eq 0) { "PASS" } else { "FAIL" }
    pass_count = @($checks.GetEnumerator() | Where-Object Value).Count
    total_count = $checks.Count
    failed_checks = @($failed | ForEach-Object { $_.Key })
    checks = $checks
}

$report = @(
    "# Go/No-Go Matrix Probe - 2026-06-15",
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
    throw "Go/no-go matrix probe failed: $($result.failed_checks -join ', ')"
}

Write-Output "PASS $($result.pass_count)/$($result.total_count)"
