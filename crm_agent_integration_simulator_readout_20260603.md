# MachineSignal - CRM/Agent Integration Simulator Readout

Finished at: 2026-06-03T11:23:28

## Result

Status: passed

This test simulates a customer CRM/agent integrating MachineSignal directly over HTTP. It reads the public integration pack, executes the three partner cases and stores simulated CRM outputs.

## Integration Cases

| Case | Status | Main Output |
|---|---|---|
| customer_has_existing_list | OK | score=61; decision=watchlist |
| customer_has_no_list | OK | target=dentists-odontoiatric-clinics-lombardia-candidate-01.example; score=77 |
| customer_wants_action_payload | OK | deep_analysis=True; action_pack=True; webhook=machinesignal.action_pack.ready |

## CRM Ledger

- CRM records stored: `3`
- CRM tasks created: `1`
- Webhook events prepared: `1`
- Audit events stored: `2`
- Orders retrieved: `3`

## Score Summary

- `studio-odontoiatrico-demo.it`: score `61`, decision `watchlist`, next `None`
- `dentists-odontoiatric-clinics-lombardia-candidate-01.example`: score `77`, decision `buy_deep_analysis`, next `deep_analysis`

## Checks

| Check | Result | Details |
|---|---|---|
| integration_pack_read | OK | HTTP 200 |
| integration_pack_has_three_cases | OK | ['customer_has_existing_list', 'customer_has_no_list', 'customer_wants_action_payload'] |
| sandbox_customer_created | OK | HTTP 200 |
| authenticated_onboarding | OK | HTTP 200 |
| existing_list_score | OK | HTTP 200 |
| no_list_target_discovery | OK | HTTP 200 |
| no_list_discovered_target_score | OK | HTTP 200 |
| action_case_deep_analysis | OK | HTTP 200 |
| action_case_action_pack | OK | HTTP 200 |
| orders_retrieved | OK | HTTP 200; orders=3 |
| usage_retrieved | OK | HTTP 200 |
| no_real_payment | OK | False |
| no_external_contact | OK | False |

## Guardrails

- Real payment executed: `False`
- External contact executed: `False`
- No email or external outreach was sent by this simulator.
- Full API keys are not exposed in this report.

## Interpretation

The result proves that a CRM/agent customer can use the public integration pack to run a machine-to-machine workflow: score an existing list, buy Target Discovery when no list exists, and prepare an Action Pack payload after gated Deep Analysis.
