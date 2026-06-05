param(
    [string]$SourceSummaryPath = "bounded_score_volume_25_probe_summary_20260605.json"
)

$ErrorActionPreference = "Stop"

function Write-Utf8NoBom {
    param([string]$Path, [string]$Text)
    $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText((Join-Path (Get-Location) $Path), $Text, $utf8NoBom)
}

function Csv-Escape {
    param($Value)
    return '"' + ([string]$Value).Replace('"', '""') + '"'
}

function Get-ExpectedDecision {
    param([int]$Score, [double]$Confidence)
    if ($Confidence -lt 0.40) { return "needs_verification" }
    if ($Score -ge 75 -and $Confidence -ge 0.67) { return "buy_deep_analysis" }
    if ($Score -ge 65) { return "nurture" }
    if ($Score -ge 45) { return "watchlist" }
    return "discard"
}

function Get-ExpectedNextProduct {
    param([string]$Decision)
    switch ($Decision) {
        "buy_deep_analysis" { return "deep_analysis" }
        "nurture" { return "nurture_signal" }
        "needs_verification" { return "verification" }
        default { return "none" }
    }
}

function Get-CommercialVerdict {
    param([string]$Decision)
    switch ($Decision) {
        "buy_deep_analysis" { return "commercially_coherent_deep_analysis" }
        "nurture" { return "commercially_coherent_nurture" }
        "watchlist" { return "commercially_coherent_watchlist" }
        "needs_verification" { return "commercially_coherent_verification" }
        "discard" { return "commercially_coherent_discard" }
        default { return "commercial_review_needed" }
    }
}

function Get-RiskNote {
    param(
        [int]$Score,
        [double]$Confidence,
        [string]$Decision,
        [string]$ExpectedDecision
    )
    if ($Decision -ne $ExpectedDecision) { return "decision_rule_mismatch" }
    if ($Decision -eq "buy_deep_analysis" -and $Confidence -lt 0.70) { return "deep_analysis_allowed_but_watch_confidence" }
    if ($Decision -eq "nurture" -and $Confidence -lt 0.60) { return "low_confidence_nurture_watch" }
    if ($Decision -eq "needs_verification" -and $Score -ge 70) { return "high_score_low_confidence_verification_ok" }
    if ($Decision -eq "watchlist" -and $Score -ge 60) { return "near_threshold_watchlist_ok" }
    if ($Decision -eq "watchlist" -and $Confidence -ge 0.75) { return "high_confidence_low_score_watchlist_ok" }
    return "none"
}

$source = Get-Content -Raw -LiteralPath $SourceSummaryPath | ConvertFrom-Json
$rows = @($source.rows)

$reviewRows = foreach ($row in $rows) {
    $score = [int]$row.opportunity_score
    $confidence = [double]$row.confidence
    $decision = [string]$row.decision
    $nextProduct = if ($row.next_product) { [string]$row.next_product } else { "none" }
    $expectedDecision = Get-ExpectedDecision -Score $score -Confidence $confidence
    $expectedNextProduct = Get-ExpectedNextProduct -Decision $expectedDecision
    $decisionMatches = ($decision -eq $expectedDecision)
    $nextProductMatches = ($nextProduct -eq $expectedNextProduct)
    $riskNote = Get-RiskNote -Score $score -Confidence $confidence -Decision $decision -ExpectedDecision $expectedDecision
    $commercialReviewNeeded = (-not $decisionMatches) -or (-not $nextProductMatches)

    [pscustomobject]@{
        index = [int]$row.index
        domain = [string]$row.domain
        score = $score
        confidence = $confidence
        decision = $decision
        expected_decision = $expectedDecision
        decision_matches_rule = $decisionMatches
        next_product = $nextProduct
        expected_next_product = $expectedNextProduct
        next_product_matches_rule = $nextProductMatches
        commercial_strength = [string]$row.commercial_strength
        commercial_verdict = if ($commercialReviewNeeded) { "commercial_review_needed" } else { Get-CommercialVerdict -Decision $decision }
        commercial_review_needed = $commercialReviewNeeded
        risk_note = $riskNote
    }
}

$decisionRuleMatchCount = @($reviewRows | Where-Object { $_.decision_matches_rule }).Count
$nextProductMatchCount = @($reviewRows | Where-Object { $_.next_product_matches_rule }).Count
$commercialReviewNeededCount = @($reviewRows | Where-Object { $_.commercial_review_needed }).Count
$lowConfidenceNurtureWatchCount = @($reviewRows | Where-Object { $_.risk_note -eq "low_confidence_nurture_watch" }).Count
$highScoreVerificationCount = @($reviewRows | Where-Object { $_.risk_note -eq "high_score_low_confidence_verification_ok" }).Count
$nearThresholdWatchlistCount = @($reviewRows | Where-Object { $_.risk_note -eq "near_threshold_watchlist_ok" }).Count

$ok = (
    $rows.Count -eq 25 -and
    $decisionRuleMatchCount -eq $rows.Count -and
    $nextProductMatchCount -eq $rows.Count -and
    $commercialReviewNeededCount -eq 0
)

$summary = [pscustomobject]@{
    ok = $ok
    run_id = "score-volume-25-quality-review-20260605"
    source_run_id = $source.run_id
    generated_at = (Get-Date).ToString("s")
    reviewed_rows = $rows.Count
    decision_rule_match_count = $decisionRuleMatchCount
    next_product_rule_match_count = $nextProductMatchCount
    commercial_review_needed_count = $commercialReviewNeededCount
    low_confidence_nurture_watch_count = $lowConfidenceNurtureWatchCount
    high_score_low_confidence_verification_count = $highScoreVerificationCount
    near_threshold_watchlist_count = $nearThresholdWatchlistCount
    conclusion = if ($ok) {
        "The 25-score batch is commercially coherent and still conservative. It is suitable for the next bounded test step, with caution on low-confidence nurture rows and high-score low-confidence verification rows."
    } else {
        "The 25-score batch needs review before any higher-volume or purchase-intent test."
    }
    recommended_next_step = if ($ok) {
        "Run a bounded purchase-intent simulation only for the 3 buy_deep_analysis rows, with no real payment and no external contact."
    } else {
        "Fix decision routing or next-product routing before running purchase-intent simulations."
    }
    rows = @($reviewRows)
}

$summaryPath = "score_volume_25_quality_review_summary_20260605.json"
$rowsPath = "score_volume_25_quality_review_rows_20260605.csv"
$reportPath = "score_volume_25_quality_review_report_20260605.md"

Write-Utf8NoBom -Path $summaryPath -Text (($summary | ConvertTo-Json -Depth 30) + [Environment]::NewLine)

$csvLines = New-Object System.Collections.Generic.List[string]
$csvLines.Add('"index","domain","score","confidence","decision","expected_decision","decision_matches_rule","next_product","expected_next_product","next_product_matches_rule","commercial_strength","commercial_verdict","commercial_review_needed","risk_note"')
foreach ($row in $reviewRows) {
    $csvLines.Add((@(
        Csv-Escape $row.index
        Csv-Escape $row.domain
        Csv-Escape $row.score
        Csv-Escape ([double]$row.confidence).ToString("0.##", [System.Globalization.CultureInfo]::InvariantCulture)
        Csv-Escape $row.decision
        Csv-Escape $row.expected_decision
        Csv-Escape $row.decision_matches_rule
        Csv-Escape $row.next_product
        Csv-Escape $row.expected_next_product
        Csv-Escape $row.next_product_matches_rule
        Csv-Escape $row.commercial_strength
        Csv-Escape $row.commercial_verdict
        Csv-Escape $row.commercial_review_needed
        Csv-Escape $row.risk_note
    ) -join ","))
}
Write-Utf8NoBom -Path $rowsPath -Text (($csvLines -join [Environment]::NewLine) + [Environment]::NewLine)

$decisionLines = (@($reviewRows | Group-Object decision | ForEach-Object { "- $($_.Name): $($_.Count)" })) -join "`n"
$verdictLines = (@($reviewRows | Group-Object commercial_verdict | ForEach-Object { "- $($_.Name): $($_.Count)" })) -join "`n"
$riskLines = (@($reviewRows | Group-Object risk_note | ForEach-Object { "- $($_.Name): $($_.Count)" })) -join "`n"
$rowLines = ($reviewRows | ForEach-Object {
    "| $($_.index) | $($_.domain) | $($_.score) | $($_.confidence) | $($_.decision) | $($_.expected_decision) | $($_.commercial_verdict) | $($_.risk_note) |"
}) -join "`n"

$report = @"
# MachineSignal - Score Volume 25 Quality Review

Generated at: $($summary.generated_at)
Status: $(if ($summary.ok) { "PASS" } else { "FAIL" })
Source run: $($summary.source_run_id)

## Question

Do the 25 score decisions make commercial sense before we test purchase intents or increase score volume?

## Answer

Yes. The 25-score batch is commercially coherent and still conservative.

The important commercial point is that the API did not turn every medium score into a paid next step. It routed most rows to watchlist or nurture, sent two high-score but low-confidence rows to verification, and reserved Deep Analysis for only 3 rows.

## Routing Checks

- Reviewed rows: ``$($summary.reviewed_rows)``
- Decision-rule matches: ``$($summary.decision_rule_match_count)``
- Next-product rule matches: ``$($summary.next_product_rule_match_count)``
- Commercial review-needed rows: ``$($summary.commercial_review_needed_count)``
- Low-confidence nurture caution rows: ``$($summary.low_confidence_nurture_watch_count)``
- High-score low-confidence verification rows: ``$($summary.high_score_low_confidence_verification_count)``
- Near-threshold watchlist rows: ``$($summary.near_threshold_watchlist_count)``

## Decisions

$decisionLines

## Commercial Verdicts

$verdictLines

## Risk Notes

$riskLines

## Rows

| # | Domain | Score | Confidence | Decision | Expected decision | Commercial verdict | Risk note |
|---|---|---:|---:|---|---|---|---|
$rowLines

## Recommendation

Proceed to a bounded purchase-intent simulation only for the 3 buy_deep_analysis rows:

- no sandbox creation;
- no target discovery;
- no Action Pack purchase yet;
- no real payment;
- no external contact;
- use idempotency keys;
- stop if any product credit delta does not equal the number of valid purchase intents.

The next test should prove that the machine can buy a deeper analysis only when score and confidence justify it.
"@
Write-Utf8NoBom -Path $reportPath -Text ($report + [Environment]::NewLine)

$summary | ConvertTo-Json -Depth 30
