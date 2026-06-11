# MachineSignal - MCP Full Chain Idempotency Probe - 2026-06-11

## Result

Status: completed_mcp_full_chain_idempotency_probe

OK: True

Mode: McpFullChainIdempotencyProbeWriteCapped

POST calls executed: 7

Max POST calls allowed: 8

Domain: `idempotent-action-chain.test`

Score duplicate detected: True

Deep Analysis duplicate detected: True

Action Pack duplicate detected: True

Deep Analysis order: `ord_52f1a0dd`

Action Pack order: `ord_f526797d`

Score credits used after retries: 1

Deep Analysis credits used after retries: 1

Action Pack credits used after retries: 1

Real payment executed: False

External contact executed: False

## What This Validates

A buyer machine can retry the same Score, Deep Analysis and Action Pack calls with the same `Idempotency-Key`. The live API returns duplicate markers and does not consume extra credits or create extra paid units.

## Tool Calls

| Tool | Kind | HTTP | Result |
|---|---|---:|---|
| create_sandbox_customer | POST/write | 200 | OK |
| get_usage before | GET/read | 200 | OK |
| score_lead_opportunity first | POST/write | 200 | OK |
| score_lead_opportunity duplicate | POST/write | 200 | OK |
| get_usage after score retry | GET/read | 200 | OK |
| create_purchase_intent deep_analysis first | POST/write | 200 | OK |
| create_purchase_intent deep_analysis duplicate | POST/write | 200 | OK |
| get_usage after deep retry | GET/read | 200 | OK |
| create_purchase_intent action_pack first | POST/write | 200 | OK |
| create_purchase_intent action_pack duplicate | POST/write | 200 | OK |
| get_usage after action retry | GET/read | 200 | OK |

## Checks

| Check | Result | Details |
|---|---|---|
| mcp_initialize | OK | {'name': 'machinesignal-local-mcp-adapter', 'version': '2026-06-04'} |
| required_tools_present | OK | tools=31; missing=[] |
| sandbox_created | OK | HTTP 200 |
| usage_before_read | OK | HTTP 200; score=0; deep=0; action=0 |
| score_created | OK | HTTP 200; score=52 |
| score_duplicate_detected | OK | {'event_id': 'evt_0001', 'timestamp': '2026-06-11T07:51:10.052Z', 'customer_id': 'sandbox_146add1a_mq977tuy', 'product_code': 'score_pack_1k', 'request_id': 'mcp-full-chain-idempotency-20260611075108-1781164268-score', 'status': 'valid_output', 'reason': 'score_delivered', 'units_requested': 1, 'credits_consumed': 1, 'credits_remaining': 4, 'metadata': {'domain': 'idempotent-action-chain.test', 'decision': 'watchlist', 'opportunity_score': 52, 'confidence': 0.5}, 'duplicate_request': True} |
| score_retry_consumes_one_credit_total | OK | before=0; after_score_retry=1 |
| deep_analysis_created | OK | HTTP 200; order_id=ord_52f1a0dd |
| deep_analysis_ready_for_action_pack | OK | type=deep_opportunity_analysis; status=deep_analysis_ready |
| deep_analysis_duplicate_detected | OK | {'event_id': 'evt_0002', 'timestamp': '2026-06-11T07:51:10.303Z', 'customer_id': 'sandbox_146add1a_mq977tuy', 'product_code': 'deep_analysis_pack_100', 'request_id': 'mcp-full-chain-idempotency-20260611075108-1781164268-deep-analysis', 'status': 'valid_output', 'reason': 'beta_order_intent_created', 'units_requested': 1, 'credits_consumed': 1, 'credits_remaining': 0, 'metadata': {'domain': 'idempotent-action-chain.test', 'product_code': 'deep_analysis', 'source_score_request_id': 'mcp-full-chain-idempotency-20260611075108-1781164268-score', 'source_order_intent_id': None, 'source_verification_order_intent_id': None, 'action_pack_gate': None, 'deep_analysis_verification_gate': None, 'real_payment_executed': False, 'external_contact_executed': False}, 'duplicate_request': True} |
| deep_analysis_duplicate_returns_same_order | OK | first=ord_52f1a0dd; duplicate=ord_52f1a0dd |
| deep_analysis_retry_consumes_one_credit_total | OK | before=0; after_deep_retry=1 |
| action_pack_created | OK | HTTP 200; order_id=ord_f526797d; gate=True |
| action_pack_duplicate_detected | OK | {'event_id': 'evt_0003', 'timestamp': '2026-06-11T07:51:10.557Z', 'customer_id': 'sandbox_146add1a_mq977tuy', 'product_code': 'action_pack_25', 'request_id': 'mcp-full-chain-idempotency-20260611075108-1781164268-action-pack', 'status': 'valid_output', 'reason': 'beta_order_intent_created', 'units_requested': 1, 'credits_consumed': 1, 'credits_remaining': 0, 'metadata': {'domain': 'idempotent-action-chain.test', 'product_code': 'action_pack', 'source_score_request_id': 'mcp-full-chain-idempotency-20260611075108-1781164268-score', 'source_order_intent_id': 'ord_52f1a0dd', 'source_verification_order_intent_id': None, 'action_pack_gate': {'gate_passed': True, 'source_order_intent_id': 'ord_52f1a0dd', 'source_event_id': 'evt_0002', 'source_delivery_id': 'del_2007a519', 'source_deep_analysis_version': 'domain_specific_commercial_evidence_v1'}, 'deep_analysis_verification_gate': None, 'real_payment_executed': False, 'external_contact_executed': False}, 'duplicate_request': True} |
| action_pack_duplicate_returns_same_order | OK | first=ord_f526797d; duplicate=ord_f526797d |
| usage_after_read | OK | HTTP 200; score=1; deep=1; action=1 |
| score_final_credit_delta_one | OK | before=0; after=1 |
| deep_final_credit_delta_one | OK | before=0; after=1 |
| action_final_credit_delta_one | OK | before=0; after=1 |
| post_budget_respected | OK | post_calls=7; max=8 |
| no_real_payment_or_external_contact | OK | payment=False; contact=False |

## Guardrails

- Synthetic `.test` sandbox domain only.
- No real payment.
- No invoice.
- No external contact.
- No external publication.
- No human outreach.
