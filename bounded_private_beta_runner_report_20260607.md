# MachineSignal Bounded Private Beta Runner - 2026-06-07

Status: completed_nowrite

Mode: NoWrite

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

## Full Run Results

| Domain | Score | Decision | Strength | Next product |
|---|---:|---|---|---|
| n/a | n/a | n/a | n/a | n/a |

## Credit Deltas

- Score delta: 0
- Deep Analysis delta: 0
- Action Pack delta: 0

## Safety

- Real payment executed: False
- External contact executed: False
- Real invoice issued: False
- Write calls executed: 0

## Interpretation

This runner is the operating guardrail for the next private beta test. In NoWrite mode it only verifies public discovery, documentation and readiness. In Full mode it requires explicit confirmation and enforces hard limits before creating a beta customer, scoring targets, buying at most one Deep Analysis and buying at most one Action Pack only after the Deep Analysis order gate passes.

## Recommended Next Step

NoWrite preflight is ready. The next step is to request an explicit Full run when you want to spend a very small bounded amount of beta credits.