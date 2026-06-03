# MachineSignal - Controlled Beta Operational Readiness Test

Finished at: 2026-06-03T17:19:55

## Result

Status: passed
Customer audited: `ops_beta_20260603_171952_1780499992`

## What This Test Validates

- a controlled private beta customer can be created by the admin layer;
- the customer machine can read onboarding and usage;
- score idempotency prevents double credit consumption;
- purchase-intent idempotency prevents duplicate charging of beta credits;
- order history, product filters and single-order detail are retrievable;
- admin audit reconciles ledger events, product balances and orders;
- beta guardrails keep real payment and external contact disabled.

## Usage Summary

- Ledger backend: `durable_object`
- Score credits used: `1`
- Verification credits used: `1`
- Target Discovery credits used: `1`
- Deep Analysis credits used: `1`
- Action Pack credits used: `1`
- Real payment executed: `False`
- External contact executed: `False`

## Audit Summary

- Ledger backend: `durable_object`
- Orders: `4`
- Valid credit events: `5`
- Simulated beta revenue: `EUR 169.05`
- Reconciliation OK: `True`
- Ready for real payments: `False`

## Checks

| Check | Result | Details |
|---|---|---|
| admin_created_controlled_beta_customer | OK | HTTP 200 |
| customer_machine_can_read_onboarding | OK | HTTP 200 |
| initial_usage_has_expected_credits | OK | HTTP 200 |
| score_first_call_consumed_one_credit | OK | HTTP 200 |
| score_duplicate_did_not_consume_second_credit | OK | HTTP 200 |
| verification_order_created | OK | HTTP 200 |
| target_discovery_order_created | OK | HTTP 200 |
| deep_analysis_order_created | OK | HTTP 200 |
| action_pack_order_created | OK | HTTP 200 |
| purchase_duplicate_did_not_consume_second_credit | OK | HTTP 200 |
| machine_can_read_order_history | OK | HTTP 200 |
| machine_can_filter_orders_by_product | OK | HTTP 200 |
| machine_can_read_single_order_detail | OK | HTTP 200 |
| final_usage_balances_are_coherent | OK | HTTP 200 |
| final_usage_real_payment_disabled | OK |  |
| final_usage_external_contact_disabled | OK |  |
| admin_audit_reconciles_controlled_beta_customer | OK | HTTP 200 |

## Machine Interpretation

A customer machine can use MachineSignal in a controlled beta loop and retrieve the operational records it needs to reconcile spend decisions. The service is not ready for real payments yet because fiscal, legal, billing, retention and long-term reporting controls still need to be completed.

## Public Resources

- Integration Ready: https://machinesignal.it/integration-ready/
- Product catalog: https://machinesignal.it/product-catalog.json
- OpenAPI: https://machinesignal.it/openapi.json
- This JSON summary: https://machinesignal.it/controlled_beta_operational_readiness_summary_20260603.json
