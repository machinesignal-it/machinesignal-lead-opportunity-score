# MachineSignal - Bounded Write Budget Probe

Finished at: 2026-06-05T11:16:32
Status: PASS
Mode: BoundedFull

## Scope

- New sandbox customer created: `false`
- Target discovery order created: `false`
- Score requests: `1`
- Purchase intents: `1`
- Expected KV puts with Durable Object: `0`
- Expected Durable Object writes: `2`

## Result

- Ledger backend before: `durable_object`
- Ledger backend after: `durable_object`
- Domain scored: `clinic3.it`
- Opportunity score: `81`
- Decision: `buy_deep_analysis`
- Commercial strength: `medium`
- Recommended product: `deep_analysis`
- Purchase intent status: `200`
- Real payment executed: `false`
- External contact executed: `false`

## Credit Movement

- Score credits before: `1194`
- Score credits after: `1193`
- Deep analysis credits before: `45`
- Deep analysis credits after: `44`

## Operational Conclusion

The bounded Full test can be used as the manual write-budget probe. Daily monitoring must remain in NoWrite mode.
