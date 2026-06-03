# MachineSignal - Integration Ready External Agent Ledger Audit

Finished at: 2026-06-03T16:55:44

## Result

Status: passed

Customer audited: `sandbox_e4d2d829_mpxwj26h`
Ledger backend: `durable_object`
Ledger persisted: `True`

## Summary

- Total events: `5`
- Valid credit events: `5`
- Blocked events: `0`
- Orders: `3`
- Simulated beta revenue: `EUR 168.15`
- Reconciliation OK: `True`
- Ready for real payments: `False`

## Product Reconciliation

| Product | Purchased | Used | Remaining | Events | Orders | Revenue EUR | Reconcile |
|---|---:|---:|---:|---:|---:|---:|---|
| score_pack_1k | 5 | 2 | 3 | 2 | 0 | 0.2 | OK |
| deep_analysis_pack_100 | 1 | 1 | 0 | 1 | 1 | 2.99 | OK |
| verification_pack_100 | 1 | 0 | 1 | 0 | 0 | 0 | OK |
| nurture_signal_pack_100 | 1 | 0 | 1 | 0 | 0 | 0 | OK |
| action_pack_25 | 1 | 1 | 0 | 1 | 1 | 15.96 | OK |
| target_discovery_pack_250 | 1 | 1 | 0 | 1 | 1 | 149 | OK |
| domain_enrichment_pack_100 | 1 | 0 | 1 | 0 | 0 | 0 | OK |
| opportunity_feed_monthly | 0 | 0 | 0 | 0 | 0 | 0 | OK |

## Safety

- Real payment executed: `False`
- External contact executed: `False`
- Payment guardrail OK: `True`
- External contact guardrail OK: `True`

## Checks

| Check | Result | Details |
|---|---|---|
| audit_endpoint_http_200 | OK | HTTP 200 |
| ledger_backend_durable_object | OK | durable_object |
| reconciliation_ok | OK | True |
| real_payments_still_disabled | OK | False |
| no_real_payment_executed | OK | False |
| no_external_contact_executed | OK | False |

## Interpretation

The external-agent test ledger reconciles on the Durable Object backend. This means the machine-to-machine flow is technically safe for controlled beta usage, while real payments must remain disabled until fiscal, legal and long-term audit controls are completed.
