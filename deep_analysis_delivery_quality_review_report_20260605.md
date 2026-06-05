# MachineSignal - Deep Analysis Delivery Quality Review

Generated at: 2026-06-05T16:58:23
Status: PASS
Mode: NoCreditDeepAnalysisDeliveryQualityReview

## Question

Are the 3 Deep Analysis deliveries good enough to justify an Action Pack simulation?

## Answer

Technically yes, commercially with caution.

All 3 deliveries pass the API contract review: they return a Deep Analysis delivery, include stop rules, validation signals, budget cap, a compliant/budget-gated Action Pack recommendation and no external action.

However, all 3 deliveries are still marked `synthetic_demo_mode`. That means this validates the machine buying flow and delivery contract, but it does not yet prove that the Deep Analysis content is commercially differentiated enough for real paid customers.

## Routing Checks

- Reviewed deliveries: `3`
- Contract-valid deliveries: `3`
- Synthetic demo deliveries: `3`
- Commercial review-needed rows: `0`
- Deep Analysis credit delta: `0`
- Action Pack credit delta: `0`
- Expected KV puts with Durable Object: `0`
- Expected Durable Object writes: `0`

## Guardrails

- No POST calls executed: `true`
- No credits consumed: `True`
- Real payment executed: `False`
- External contact executed: `False`
- No Action Pack created: `true`

## Commercial Verdicts

- contract_valid_but_content_synthetic: 3

## Action Pack Eligibility

- technical_probe_only_synthetic_delivery: 3

## Rows

| # | Domain | Score | Confidence | Order intent | Contract valid | Synthetic | Action Pack eligibility |
|---|---|---:|---:|---|---|---|---|
| 1 | clinic3.it | 81 | 0.88 | ord_da750cd6 | True | True | technical_probe_only_synthetic_delivery |
| 13 | studiobianchiortodonzia.it | 77 | 0.88 | ord_2907ad93 | True | True | technical_probe_only_synthetic_delivery |
| 21 | studiodentalelecco.it | 75 | 0.67 | ord_ce2b3d8c | True | True | technical_probe_only_synthetic_delivery |

## Recommendation

Run at most one bounded Action Pack contract probe on the strongest reviewed row. Keep the caveat visible: this is still a contract and workflow test, not proof of final commercial Deep Analysis quality.

Before monetization, Deep Analysis should become more domain-specific and less generic.
