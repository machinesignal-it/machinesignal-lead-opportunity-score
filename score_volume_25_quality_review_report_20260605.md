# MachineSignal - Score Volume 25 Quality Review

Generated at: 2026-06-05T15:08:29
Status: PASS
Source run: bounded-score-volume-25-probe-20260605-121122

## Question

Do the 25 score decisions make commercial sense before we test purchase intents or increase score volume?

## Answer

Yes. The 25-score batch is commercially coherent and still conservative.

The important commercial point is that the API did not turn every medium score into a paid next step. It routed most rows to watchlist or nurture, sent two high-score but low-confidence rows to verification, and reserved Deep Analysis for only 3 rows.

## Routing Checks

- Reviewed rows: `25`
- Decision-rule matches: `25`
- Next-product rule matches: `25`
- Commercial review-needed rows: `0`
- Low-confidence nurture caution rows: `4`
- High-score low-confidence verification rows: `1`
- Near-threshold watchlist rows: `5`

## Decisions

- buy_deep_analysis: 3
- watchlist: 12
- nurture: 8
- needs_verification: 2

## Commercial Verdicts

- commercially_coherent_deep_analysis: 3
- commercially_coherent_watchlist: 12
- commercially_coherent_nurture: 8
- commercially_coherent_verification: 2

## Risk Notes

- none: 11
- high_confidence_low_score_watchlist_ok: 3
- low_confidence_nurture_watch: 4
- near_threshold_watchlist_ok: 5
- deep_analysis_allowed_but_watch_confidence: 1
- high_score_low_confidence_verification_ok: 1

## Rows

| # | Domain | Score | Confidence | Decision | Expected decision | Commercial verdict | Risk note |
|---|---|---:|---:|---|---|---|---|
| 1 | clinic3.it | 81 | 0.88 | buy_deep_analysis | buy_deep_analysis | commercially_coherent_deep_analysis | none |
| 2 | studiorossidentale.it | 55 | 0.88 | watchlist | watchlist | commercially_coherent_watchlist | high_confidence_low_score_watchlist_ok |
| 3 | odontoiatriabrianza.it | 66 | 0.66 | nurture | nurture | commercially_coherent_nurture | none |
| 4 | dentistalodi.it | 50 | 0.53 | watchlist | watchlist | commercially_coherent_watchlist | none |
| 5 | clinicaoralemilano.it | 74 | 0.52 | nurture | nurture | commercially_coherent_nurture | low_confidence_nurture_watch |
| 6 | sorrisobergamo.it | 62 | 0.56 | watchlist | watchlist | commercially_coherent_watchlist | near_threshold_watchlist_ok |
| 7 | implantologiacomo.it | 78 | 0.52 | nurture | nurture | commercially_coherent_nurture | low_confidence_nurture_watch |
| 8 | studiodentalepavia.it | 76 | 0.54 | nurture | nurture | commercially_coherent_nurture | low_confidence_nurture_watch |
| 9 | ortodonziabrescia.it | 50 | 0.57 | watchlist | watchlist | commercially_coherent_watchlist | none |
| 10 | dentistavarese.it | 68 | 0.88 | nurture | nurture | commercially_coherent_nurture | none |
| 11 | centrodentalemantova.it | 54 | 0.82 | watchlist | watchlist | commercially_coherent_watchlist | high_confidence_low_score_watchlist_ok |
| 12 | clinicadentalemagenta.it | 61 | 0.58 | watchlist | watchlist | commercially_coherent_watchlist | near_threshold_watchlist_ok |
| 13 | studiobianchiortodonzia.it | 77 | 0.88 | buy_deep_analysis | buy_deep_analysis | commercially_coherent_deep_analysis | none |
| 14 | sorrisocremona.it | 66 | 0.68 | nurture | nurture | commercially_coherent_nurture | none |
| 15 | dentistalegnano.it | 64 | 0.52 | watchlist | watchlist | commercially_coherent_watchlist | near_threshold_watchlist_ok |
| 16 | implantologiamonza.it | 61 | 0.58 | watchlist | watchlist | commercially_coherent_watchlist | near_threshold_watchlist_ok |
| 17 | centroodontoiatricosondrio.it | 53 | 0.69 | watchlist | watchlist | commercially_coherent_watchlist | none |
| 18 | studiopadentale.it | 80 | 0.56 | nurture | nurture | commercially_coherent_nurture | low_confidence_nurture_watch |
| 19 | clinicadentalegarda.it | 55 | 0.35 | needs_verification | needs_verification | commercially_coherent_verification | none |
| 20 | odontoiatriamartesana.it | 65 | 0.81 | nurture | nurture | commercially_coherent_nurture | none |
| 21 | studiodentalelecco.it | 75 | 0.67 | buy_deep_analysis | buy_deep_analysis | commercially_coherent_deep_analysis | deep_analysis_allowed_but_watch_confidence |
| 22 | centroimplantarevarese.it | 60 | 0.77 | watchlist | watchlist | commercially_coherent_watchlist | near_threshold_watchlist_ok |
| 23 | ortodonziacrema.it | 79 | 0.35 | needs_verification | needs_verification | commercially_coherent_verification | high_score_low_confidence_verification_ok |
| 24 | dentistacantu.it | 59 | 0.58 | watchlist | watchlist | commercially_coherent_watchlist | none |
| 25 | clinicaodontoiatricarho.it | 50 | 0.84 | watchlist | watchlist | commercially_coherent_watchlist | high_confidence_low_score_watchlist_ok |

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
