# MachineSignal - Bounded Score Volume 25 Probe

Finished at: 2026-06-05T12:11:29
Status: PASS
Mode: BoundedScoreVolume25

## Scope

- Score requests: `25`
- New sandbox customer created: `false`
- Target discovery order created: `false`
- Purchase intents created: `0`
- Expected KV puts with Durable Object: `0`
- Expected Durable Object writes: `25`

## Ledger And Credits

- Ledger backend before: `durable_object`
- Ledger backend after: `durable_object`
- Score credits before: `1183`
- Score credits after: `1158`
- Score credit delta: `25`

## Guardrails

- Real payment executed: `False`
- External contact executed: `False`
- No purchase intent created: `true`
- No sandbox customer created: `true`

## Decisions

- buy_deep_analysis: 3
- watchlist: 12
- nurture: 8
- needs_verification: 2

## Commercial Strength

- strong: 1
- weak: 14
- medium: 10

## Recommended Next Products

- deep_analysis: 3
- none: 12
- nurture_signal: 8
- verification: 2

## Rows

| # | Domain | HTTP | Score | Confidence | Decision | Strength | Next product |
|---|---|---:|---:|---:|---|---|---|
| 1 | clinic3.it | 200 | 81 | 0.88 | buy_deep_analysis | strong | deep_analysis |
| 2 | studiorossidentale.it | 200 | 55 | 0.88 | watchlist | weak | none |
| 3 | odontoiatriabrianza.it | 200 | 66 | 0.66 | nurture | medium | nurture_signal |
| 4 | dentistalodi.it | 200 | 50 | 0.53 | watchlist | weak | none |
| 5 | clinicaoralemilano.it | 200 | 74 | 0.52 | nurture | medium | nurture_signal |
| 6 | sorrisobergamo.it | 200 | 62 | 0.56 | watchlist | weak | none |
| 7 | implantologiacomo.it | 200 | 78 | 0.52 | nurture | medium | nurture_signal |
| 8 | studiodentalepavia.it | 200 | 76 | 0.54 | nurture | medium | nurture_signal |
| 9 | ortodonziabrescia.it | 200 | 50 | 0.57 | watchlist | weak | none |
| 10 | dentistavarese.it | 200 | 68 | 0.88 | nurture | medium | nurture_signal |
| 11 | centrodentalemantova.it | 200 | 54 | 0.82 | watchlist | weak | none |
| 12 | clinicadentalemagenta.it | 200 | 61 | 0.58 | watchlist | weak | none |
| 13 | studiobianchiortodonzia.it | 200 | 77 | 0.88 | buy_deep_analysis | medium | deep_analysis |
| 14 | sorrisocremona.it | 200 | 66 | 0.68 | nurture | medium | nurture_signal |
| 15 | dentistalegnano.it | 200 | 64 | 0.52 | watchlist | weak | none |
| 16 | implantologiamonza.it | 200 | 61 | 0.58 | watchlist | weak | none |
| 17 | centroodontoiatricosondrio.it | 200 | 53 | 0.69 | watchlist | weak | none |
| 18 | studiopadentale.it | 200 | 80 | 0.56 | nurture | medium | nurture_signal |
| 19 | clinicadentalegarda.it | 200 | 55 | 0.35 | needs_verification | weak | verification |
| 20 | odontoiatriamartesana.it | 200 | 65 | 0.81 | nurture | medium | nurture_signal |
| 21 | studiodentalelecco.it | 200 | 75 | 0.67 | buy_deep_analysis | medium | deep_analysis |
| 22 | centroimplantarevarese.it | 200 | 60 | 0.77 | watchlist | weak | none |
| 23 | ortodonziacrema.it | 200 | 79 | 0.35 | needs_verification | weak | verification |
| 24 | dentistacantu.it | 200 | 59 | 0.58 | watchlist | weak | none |
| 25 | clinicaodontoiatricarho.it | 200 | 50 | 0.84 | watchlist | weak | none |

## Operational Conclusion

The API handled a bounded 25-score machine batch using the existing customer key. This remains a bounded write test, not daily automation. Daily monitoring must stay in NoWrite mode.
