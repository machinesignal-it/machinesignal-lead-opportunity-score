# MachineSignal Live Machine Buyer Journey Test

Date: 2026-06-15

## Purpose

Verify that a machine buyer can understand the MachineSignal public journey from live documentation without human sales contact.

This is still a test/readiness check. It does not approve commercial go-live.

## Live Sources Checked

- `https://machinesignal.it/product-catalog.json`
- `https://machinesignal.it/machine-onboarding.json`
- `https://machinesignal.it/llms.txt`
- `https://machinesignal.it/openapi.json`
- `https://machinesignal.it/machine-discovery/`
- `https://machinesignal.it/api/`
- `https://machinesignal.it/beta/`

## Machine Buyer Decisions

### Scenario 1: buyer already has a list

The buyer machine has a domain or company list and needs prioritization.

Expected decision:

- start with `score_pack_1k`
- price: EUR 119
- use valid-output credit logic
- proceed to deeper analysis only when score and confidence justify it

### Scenario 2: buyer has no list

The buyer machine has a sector, geography and commercial objective, but no initial target list.

Expected decision:

- start with `target_discovery_pack_250`
- price: EUR 249
- require a market availability pre-check
- do not deliver weak filler targets if 250 coherent targets cannot be produced

### Scenario 3: buyer needs next action

The buyer machine wants CRM/workflow action, but should not contact external targets automatically.

Expected decision:

- buy/prepare Action Pack only after valid prior signal and gate
- produce internal CRM/workflow/action instructions
- block external contact, outreach and legal-permission assumptions

## Guardrails Confirmed

- commercial status remains `not_live`
- go-live remains `no_go`
- paid beta remains `not_approved`
- no real payment
- no payment method collection
- no invoice issuance
- no production API keys
- no personal / real customer data
- no external outreach

## Result

PASS.

The live public documentation is coherent enough for a machine buyer to understand the current sandbox/test journey and select the correct first product without human sales interaction.

## Next Step

Run the same journey against the live API sandbox behavior, including `/v1/purchase-intent` and `/v1/lead-opportunity-score`, using only synthetic data and no write-to-production action.
