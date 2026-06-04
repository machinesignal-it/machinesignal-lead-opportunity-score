# MachineSignal Machine Customer E2E Live Test - 2026-06-04

## Result

Status: passed

Base URL: https://machinesignal-api.beta-878.workers.dev

Customer id: machine_e2e_20260604105126

## Flow tested

1. Create temporary beta customer.
2. Read authenticated onboarding.
3. Buy Target Discovery because the machine has no starting list.
4. Score a discovered/selected domain.
5. Buy Deep Analysis.
6. Buy Action Pack.
7. Create simulated payment-test intent for Score Pack 1k.
8. Verify live payment mode is blocked.
9. Simulate succeeded payment webhook.
10. Verify duplicate webhook does not duplicate credits.
11. Reconcile payment test.
12. Read orders, ledger audit and payment-test admin report.
13. Close temporary customer.

## Key results

- Target Discovery order: True
- Score decision: buy_deep_analysis
- Commercial strength: strong
- Deep Analysis order: True
- Action Pack order: True
- Payment test intent: True
- Live mode blocked HTTP status: 400
- Test credits activated: 1000
- Duplicate webhook handled: True
- Payment reconciliation OK: True
- Admin reports OK: True

## Safety

- Real payment executed: false
- External contact executed: false
- Real fiscal invoice issued: false
- Ready for real payments: false

## Interpretation

The machine-first beta flow is callable end to end. A customer machine can discover the contract, create a no-list target discovery order, score a domain, buy deeper machine-readable outputs, simulate checkout, activate test credits and reconcile the ledger without human email outreach or real payment execution.

Real payment remains blocked until fiscal, legal, privacy, provider and invoicing controls are complete.