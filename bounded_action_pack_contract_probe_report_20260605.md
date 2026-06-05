# MachineSignal - Bounded Action Pack Contract Probe

Finished at: 2026-06-05T18:07:15
Status: PASS
Mode: BoundedActionPackContractProbe

## Scope

- Source Deep Analysis delivery review: `deep-analysis-delivery-quality-review-20260605`
- Candidate rows: `1`
- Domain: `clinic3.it`
- New Action Pack purchase intents created: `1`
- Existing Action Pack orders found: `0`
- New sandbox customer created: `false`
- Target discovery order created: `false`
- Expected KV puts with Durable Object: `0`
- Expected Durable Object writes: `1`

## Credit Movement

- Ledger backend before: `durable_object`
- Ledger backend after: `durable_object`
- Action Pack credits before: `18`
- Action Pack credits after: `17`
- Action Pack credit delta: `1`

## Contract Checks

- Contract valid: `True`
- Checks passed: `19` / `19`
- Delivery type: `action_pack`
- Approval gate default: `blocked`
- Send email blocked without approval: `True`
- Workflow trigger: `action_pack_ready`
- Webhook event: `machinesignal.action_pack.ready`

## Guardrails

- Real payment executed: `False`
- External contact executed: `False`
- Synthetic-output caveat visible: `true`

## Row

| # | Domain | Score | Confidence | Action | Order intent | Credits consumed | Contract valid |
|---|---|---:|---:|---|---|---:|---|
| 1 | clinic3.it | 81 | 0.88 | created_purchase_intent | ord_ee59fd3 | 1 | True |

## Operational Conclusion

The Action Pack contract probe passed for one strongest reviewed row. It produced a CRM/workflow/webhook payload and kept external actions blocked by default.

This validates the machine contract, not final commercial value. The next product work should improve Deep Analysis content from synthetic beta output into domain-specific commercial evidence before monetization.
