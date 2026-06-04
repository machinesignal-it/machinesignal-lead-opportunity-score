# MachineSignal Payment Test Mode Implementation Report - 2026-06-04

## Executive status

Payment test mode is implemented locally and covered by automated tests.

This mode is strictly simulation-only:

- no real payment is executed;
- provider mode is limited to `test` or `sandbox`;
- `live`, `production` and `prod` provider modes are blocked;
- no fiscal invoice is issued;
- test credits are activated only after a valid simulated webhook;
- duplicate webhook events do not activate duplicate credits;
- admin reports keep `ready_for_real_payments=false`.

## Implemented callable endpoints

- `POST /v1/payment-test/intents`
- `GET /v1/payment-test/intents/{payment_test_id}`
- `POST /v1/payment-test/webhooks/stripe`
- `GET /v1/payment-test/reconciliation/{payment_test_id}`
- `GET /v1/admin/payment-test-report?customer_id=<customer_id>`

## Machine buyer flow

1. Customer machine has or creates a beta customer key.
2. Customer machine creates a simulated payment intent with `POST /v1/payment-test/intents`.
3. API returns deterministic test webhook signatures.
4. Customer or evaluator machine simulates provider webhook.
5. API activates test credits once if the webhook is a valid succeeded test event.
6. Customer machine reads reconciliation.
7. Admin/agents read customer-level payment-test report.

## Validated controls

- idempotent payment-test intent creation;
- invalid webhook signature rejected;
- succeeded test webhook activates Score Pack credits once;
- duplicate succeeded webhook does not double-credit;
- failed test webhook does not activate credits;
- live provider mode is blocked;
- reconciliation confirms no real payment and no real invoice.

## Tests run

- `api_endpoint_minimal/test_api.mjs`: passed.
- `api_endpoint_minimal/test_durable_ledger.mjs`: passed.

## Remaining before real payment

Real payment is still not enabled. Before live checkout, MachineSignal still needs:

- fiscal/Partita IVA decision;
- payment provider account in live mode;
- terms of service;
- privacy/DPA and retention policy;
- refund and credit policy;
- real invoicing workflow;
- final admin approval.
