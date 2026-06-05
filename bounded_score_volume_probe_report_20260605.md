# MachineSignal - Bounded Score Volume Probe

Finished at: 2026-06-05T11:41:18
Status: PASS
Mode: BoundedScoreVolume10

## Scope

- Score requests: `10`
- New sandbox customer created: `false`
- Target discovery order created: `false`
- Purchase intents created: `0`
- Expected KV puts with Durable Object: `0`
- Expected Durable Object writes: `10`

## Ledger And Credits

- Ledger backend before: `durable_object`
- Ledger backend after: `durable_object`
- Score credits before: `1193`
- Score credits after: `1183`
- Score credit delta: `10`

## Guardrails

- Real payment executed: `false`
- External contact executed: `false`
- No purchase intent created: `true`
- No sandbox customer created: `true`

## Decisions

- buy_deep_analysis: 1
- nurture: 5
- watchlist: 4

## Inferred Next Products

- deep_analysis: 1
- nurture_signal: 5
- none: 4

## Rows

| # | Domain | Score | Confidence | Decision | Inferred next product |
|---|---|---:|---:|---|---|
| 1 | clinic3.it | 81 | 0.88 | buy_deep_analysis | deep_analysis |
| 2 | studiorossidentale.it | 55 | 0.88 | watchlist | none |
| 3 | odontoiatriabrianza.it | 66 | 0.66 | nurture | nurture_signal |
| 4 | dentistalodi.it | 50 | 0.53 | watchlist | none |
| 5 | clinicaoralemilano.it | 74 | 0.52 | nurture | nurture_signal |
| 6 | sorrisobergamo.it | 62 | 0.56 | watchlist | none |
| 7 | implantologiacomo.it | 78 | 0.52 | nurture | nurture_signal |
| 8 | studiodentalepavia.it | 76 | 0.54 | nurture | nurture_signal |
| 9 | ortodonziabrescia.it | 50 | 0.57 | watchlist | none |
| 10 | dentistavarese.it | 68 | 0.88 | nurture | nurture_signal |

## Note

The API calls completed successfully. This report was reconstructed from `/v1/usage` after a local report aggregation error. No extra score calls were made during recovery.

## Operational Conclusion

The API handled a 10-score machine batch using the existing customer key. This remains a bounded write test, not daily automation. Daily monitoring must stay in NoWrite mode.
