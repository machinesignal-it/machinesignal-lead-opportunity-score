# Live API Sandbox Machine Buyer Journey - Blocked Follow-Up

Date: 2026-06-15

## What Was Tested

The live API sandbox journey was started against:

`https://machinesignal-api.beta-878.workers.dev`

Confirmed before blocker:

- `/health` returns `200`
- public API documents are reachable
- protected onboarding rejects unauthenticated calls with `401`
- sandbox customer creation works until the daily limit is reached

## Issue Found

The live sandbox journey revealed a pricing mismatch:

- public product catalog: `Target Discovery Pack 250 = EUR 249`
- purchase-intent delivery metadata: `beta_price_range_eur = "149"`

## Fix Applied

Updated:

- `api_endpoint_minimal/core.mjs`
- `api_endpoint_minimal/test_api.mjs`

Local tests passed:

- `api_endpoint_minimal/test_api.mjs`
- `api_endpoint_minimal/test_durable_ledger.mjs`

## Current Blocker

The full live authenticated probe cannot be completed immediately because the API returned:

`sandbox_limit_exceeded`

Meaning: the public sandbox key creation daily limit for this evaluator fingerprint has been reached.

## Safety Status

No real payment was executed.

No invoice was issued.

No payment method was collected.

No real customer data or personal data was used.

No external outreach was executed.

No production API key was created or published.

## Next Step

After the sandbox daily limit resets, rerun:

`private-evaluator-pack/live_api_sandbox_machine_buyer_journey_probe_20260615.ps1`

Required live confirmation:

- `target_discovery` purchase-intent returns `beta_price_range_eur: "249"`
- Score Pack flow still returns score/confidence/decision
- Action Pack without Deep Analysis source is still blocked
- no real payment/external contact flags become true
