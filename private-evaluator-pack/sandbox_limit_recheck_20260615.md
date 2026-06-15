# MachineSignal Sandbox Limit Recheck

Date: 2026-06-15

## Purpose

Recheck whether the live public sandbox customer endpoint is available again after the previous authenticated API journey test consumed the available sandbox key creations.

## Result

Status: BLOCKED

HTTP status: `429`

Interpretation: the sandbox customer creation daily limit is still active for this evaluator fingerprint.

## Live API Availability

The unauthenticated/public worker checks are healthy:

- `/health`: reachable
- `/product-catalog.json`: reachable
- `/machine-onboarding.json`: reachable
- `/openapi.json`: reachable

The live API product catalog currently exposes:

- `target_discovery_pack_250.price_eur = 249`
- `score_pack_1k.price_eur = 119`

## Boundary

No new sandbox API key was obtained during this recheck.

No real payment, invoice, payment method collection, real data, personal data, external outreach or production key was used.

## Next Step

After the sandbox limit resets, rerun:

`private-evaluator-pack/live_api_sandbox_machine_buyer_journey_probe_20260615.ps1`

Expected confirmation:

- `target_discovery` purchase-intent returns `beta_price_range_eur: "249"`
- Score Pack response remains coherent
- Action Pack without valid Deep Analysis source remains blocked
- no real-payment or external-contact flag becomes true
