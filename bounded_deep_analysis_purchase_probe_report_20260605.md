# MachineSignal - Bounded Deep Analysis Purchase Probe

Finished at: 2026-06-05T16:37:33
Status: PASS
Mode: BoundedDeepAnalysisPurchaseIntent

## Scope

- Source quality review: `score-volume-25-quality-review-20260605`
- Candidate rows: `3`
- Existing deep-analysis orders found: `1`
- New Deep Analysis purchase intents created: `2`
- Action Pack purchase intents created: `0`
- New sandbox customer created: `false`
- Target discovery order created: `false`
- Expected KV puts with Durable Object: `0`
- Expected Durable Object writes: `2`

## Credit Movement

- Ledger backend before: `durable_object`
- Ledger backend after: `durable_object`
- Deep Analysis credits before: `44`
- Deep Analysis credits after: `42`
- Deep Analysis credit delta: `2`

## Guardrails

- Real payment executed: `False`
- External contact executed: `False`
- No Action Pack created: `true`
- Duplicate Deep Analysis orders avoided: `True`

## Recommended Next Products From Deep Analysis

- action_pack: 3

## Rows

| # | Domain | Score | Confidence | Action | Order intent | Credits consumed | Deep-analysis next product |
|---|---|---:|---:|---|---|---:|---|
| 1 | clinic3.it | 81 | 0.88 | skipped_existing_order | ord_da750cd6 | 0 | action_pack |
| 13 | studiobianchiortodonzia.it | 77 | 0.88 | created_purchase_intent | ord_2907ad93 | 1 | action_pack |
| 21 | studiodentalelecco.it | 75 | 0.67 | created_purchase_intent | ord_ce2b3d8c | 1 | action_pack |

## Operational Conclusion

The machine buyer path can create bounded Deep Analysis purchase intents for quality-reviewed high-potential rows. One duplicate spend was avoided because clinic3.it already had an accepted Deep Analysis order from the previous bounded write-budget probe.

The next step should be a no-credit quality review of the Deep Analysis deliveries before any Action Pack simulation.
