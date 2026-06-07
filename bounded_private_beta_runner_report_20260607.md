# MachineSignal Bounded Private Beta Runner - 2026-06-07

Status: completed_full

Mode: Full

Overall OK: True

Base URL: https://machinesignal-api.beta-878.workers.dev

## Limits

- Max score calls: 5
- Max Deep Analysis orders: 1
- Max Action Pack orders: 1
- External contact allowed: false
- Real payment allowed: false

## Checks

| Check | Status | Details |
|---|---|---|
| worker_health_reachable | OK | HTTP 200 |
| worker_llms_action_pack_gate | OK | Worker llms.txt exposes Action Pack gate. |
| site_llms_dentists_pack | OK | Public llms.txt exposes dentists beta pack. |
| site_llms_mcp_wrapper | OK | Public llms.txt exposes MCP wrapper. |
| openapi_action_pack_gate_documented | OK | OpenAPI documents source_order_intent_id and action_pack_gate. |
| postman_action_pack_gate_documented | OK | Postman public collection includes gate instruction and variable. |
| readiness_gate | OK | controlled_beta=ready_for_controlled_beta, real_payment=blocked_for_real_payments |
| kv_nowrite_default | OK | mode=NoWrite |
| full_customer_created | OK | HTTP 200, customer=bounded_private_beta_20260607105940 |
| full_deep_analysis_cap | OK | Deep Analysis orders <= 1. |
| full_action_pack_missing_gate_blocked | OK | Blocked Action Pack without source_order_intent_id; HTTP 400. No Action Pack credit consumed by the blocked request. |
| full_action_pack_gate_passed | OK | Action Pack created only after Deep Analysis gate. |
| full_score_cap | OK | score_delta=5 |
| full_deep_cap | OK | deep_delta=1 |
| full_action_cap | OK | action_delta=1 |
| full_no_payment_or_outreach | OK | payment=False, external_contact=False |

## Full Run Results

| Domain | Score | Decision | Strength | Next product |
|---|---:|---|---|---|
| bounded-dental-clinic-demo.it | 67 | nurture | medium | nurture_signal |
| bounded-legal-studio-demo.it | 71 | nurture | medium | nurture_signal |
| bounded-solar-installer-demo.it | 44 | needs_verification | weak | verification |
| bounded-aesthetic-clinic-demo.it | 74 | nurture | medium | nurture_signal |
| bounded-real-estate-demo.it | 56 | watchlist | weak |  |

## Orders

- Deep Analysis order: ord_45991984 on bounded-aesthetic-clinic-demo.it
- Blocked Action Pack negative test: HTTP 400, no valid source_order_intent_id
- Valid Action Pack order: ord_62808e76, gate passed: True

## Credit Deltas

- Score delta: 5
- Deep Analysis delta: 1
- Action Pack delta: 1

## Safety

- Real payment executed: False
- External contact executed: False
- Real invoice issued: False
- Write calls executed: 8

## Interpretation

This Full bounded private beta run proves that a customer machine can receive a bounded credit ledger, score a limited list of targets, buy one Deep Analysis, and buy one Action Pack only after the Deep Analysis gate passes. The negative Action Pack request was blocked with HTTP 400 because it did not include a valid source_order_intent_id. No real payment, invoice or external contact was executed.

## Recommended Next Step

Use this Full bounded private beta result as the first evidence pack. Next step: update/publicare il report e poi preparare il primo evidence brief per macchine/partner.