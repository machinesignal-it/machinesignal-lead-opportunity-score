# MachineSignal Self-Service Machine Buyer Sale Simulation - 2026-06-04

## Result

Status: passed

Customer id: sandbox_sale_sim_20260604124741

Customer type: sandbox

Readiness gate: passed

## What was tested

1. Public machine discovery through llms.txt, machine-onboarding.json, product-catalog.json and .well-known/machine-discovery.json.
2. Self-service sandbox customer creation without human sales contact.
3. Authenticated onboarding with the sandbox key.
4. No-list Target Discovery order intent.
5. Lead Opportunity Score for a selected target.
6. Deep Analysis order intent after score recommendation.
7. Action Pack order intent after Deep Analysis.
8. Simulated checkout for Score Pack 1k in sandbox mode.
9. Live payment mode blocked.
10. Sandbox webhook success, duplicate webhook check and reconciliation.
11. Internal admin audit, payment-test report and sandbox metrics.
12. Sandbox customer closed by the internal agent after the test.

## Key commercial result

- Score: 78
- Decision: buy_deep_analysis
- Commercial strength: medium
- Orders created: 3
- Test credits activated: 1000
- Simulated checkout product: score_pack_1k
- Provider mode: sandbox

## Safety

- Real payment executed: False
- External contact executed: False
- Real invoice issued: False
- Live payment mode blocked HTTP status: 400
- Payment reconciliation OK: True

## Interpretation

This is the closest current test to a machine-first sale. A buyer machine can discover MachineSignal publicly, create a limited sandbox key, evaluate the API, request machine-readable deliverables and simulate a checkout without human email persuasion.

The business is still not ready for real payments. The correct next commercial step is to keep using sandbox/test-mode checkout while preparing fiscal, legal, invoicing, refund and provider controls.