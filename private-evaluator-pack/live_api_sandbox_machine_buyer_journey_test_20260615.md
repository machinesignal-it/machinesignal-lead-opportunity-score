# MachineSignal Live API Sandbox Machine Buyer Journey Test

Date: 2026-06-15

## Purpose

Verify that the live sandbox API behavior matches the public machine-readable buyer journey.

This test uses only synthetic data. It creates one temporary sandbox customer key through the public sandbox endpoint, uses the key in memory, and does not store the key in the repository.

## Boundaries

- no real payment
- no invoice
- no payment method collection
- no real customer data
- no personal data
- no external outreach
- no production API key
- no marketplace publication
- no commercial go-live

## Scenarios

1. Public/API health and unauthenticated guardrails.
2. Sandbox customer key creation for a machine evaluator.
3. Authenticated onboarding visibility.
4. Existing-list flow through `POST /v1/lead-opportunity-score`.
5. No-list flow through `POST /v1/purchase-intent` with `target_discovery`.
6. Action Pack gate behavior through `POST /v1/purchase-intent` with `action_pack` and no valid Deep Analysis source.
7. Usage ledger visibility after synthetic sandbox calls.

## Expected Result

The API should let a machine test the journey in sandbox mode while preserving all safety blocks.

## Result

PASS after live probe execution.

## Next Step

Use this probe result in the next agent review to decide whether remaining tests should focus on resilience, cost limits, or go-live blockers.
