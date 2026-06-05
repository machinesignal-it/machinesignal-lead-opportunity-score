# MachineSignal - Score Volume Quality Review

Generated at: 2026-06-05T11:51:06
Status: PASS
Source run: bounded-score-volume-probe-20260605-113755

## Question

Do the 10 score decisions make commercial sense before we move from 10 to 25 scores?

## Answer

Yes. The batch is commercially coherent and conservative enough to continue with a bounded 25-score test.

Important nuance: nurture decisions with confidence around 0.52-0.54 must stay low-cost only. They should not trigger deep analysis or action packs without stronger evidence.

## Routing Checks

- Reviewed rows: `10`
- Decision-rule matches: `10`
- Commercial review-needed rows: `0`
- Low-confidence nurture caution rows: `3`

## Decisions

- buy_deep_analysis: 1
- watchlist: 4
- nurture: 5

## Commercial Verdicts

- commercially_coherent_deep_analysis: 1
- commercially_coherent_watchlist: 4
- commercially_coherent_nurture: 5

## Risk Notes

- none: 6
- high_confidence_low_score_watchlist_ok: 1
- low_confidence_nurture_watch: 3

## Rows

| # | Domain | Score | Confidence | Decision | Commercial verdict | Risk note |
|---|---|---:|---:|---|---|---|
| 1 | clinic3.it | 81 | 0.88 | buy_deep_analysis | commercially_coherent_deep_analysis | none |
| 2 | studiorossidentale.it | 55 | 0.88 | watchlist | commercially_coherent_watchlist | high_confidence_low_score_watchlist_ok |
| 3 | odontoiatriabrianza.it | 66 | 0.66 | nurture | commercially_coherent_nurture | none |
| 4 | dentistalodi.it | 50 | 0.53 | watchlist | commercially_coherent_watchlist | none |
| 5 | clinicaoralemilano.it | 74 | 0.52 | nurture | commercially_coherent_nurture | low_confidence_nurture_watch |
| 6 | sorrisobergamo.it | 62 | 0.56 | watchlist | commercially_coherent_watchlist | none |
| 7 | implantologiacomo.it | 78 | 0.52 | nurture | commercially_coherent_nurture | low_confidence_nurture_watch |
| 8 | studiodentalepavia.it | 76 | 0.54 | nurture | commercially_coherent_nurture | low_confidence_nurture_watch |
| 9 | ortodonziabrescia.it | 50 | 0.57 | watchlist | commercially_coherent_watchlist | none |
| 10 | dentistavarese.it | 68 | 0.88 | nurture | commercially_coherent_nurture | none |

## Recommendation

Proceed to a bounded 25-score test with these rules:

- no sandbox creation;
- no target discovery;
- no purchase intents;
- no external contact;
- keep daily monitor in NoWrite mode;
- stop if score credit delta does not equal number of valid score rows.
