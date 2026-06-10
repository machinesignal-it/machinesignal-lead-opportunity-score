# MachineSignal - MCP Purchase Decision Probe - 2026-06-10

## Result

Status: completed_mcp_purchase_decision_probe

OK: True

Mode: McpPurchaseDecisionProbeWriteCapped

POST calls executed: 3

Max POST calls allowed: 3

Purchased sandbox product: `verification`

Real payment executed: False

External contact executed: False

## What This Validates

A buyer machine can use the local MCP adapter to discover MachineSignal, create a sandbox, score a synthetic target, follow the score recommendation, create one sandbox purchase intent and retrieve the delivery without human sales contact.

## Machine Decisions

| Decision | Reason | Action |
|---|---|---|
| start_sandbox | The machine can evaluate the product through API/MCP without human sales contact. | create_sandbox_customer |
| score_target_before_purchase | The machine buys only after receiving a score, confidence and recommended next product. | score_lead_opportunity |
| buy_recommended_sandbox_product | The score response recommends verification; the machine follows only the API recommendation. | create_purchase_intent verification |

## Tool Calls

| Tool | Kind | HTTP | Result | Auth |
|---|---|---:|---|---|
| get_product_catalog | GET/read | 200 | OK | none |
| get_machine_onboarding | GET/read | 200 | OK | none |
| create_sandbox_customer | POST/write | 200 | OK | none |
| score_lead_opportunity | POST/write | 200 | OK | customer_api_key |
| create_purchase_intent | POST/write | 200 | OK | customer_api_key |
| list_orders | GET/read | 200 | OK | customer_api_key |
| get_order | GET/read | 200 | OK | customer_api_key |
| get_usage | GET/read | 200 | OK | customer_api_key |

## Score Summary

- Domain: `premium-dental-conversion-gap.it`
- Opportunity score: `81`
- Confidence: `0.44`
- Decision: `needs_verification`
- Recommended product: `verification`

## Delivery Summary

- Delivery present: `True`
- Delivery type: `data_quality_verification`
- Delivery status: `verification_ready`
- CRM payload: `False`
- Machine decision matrix: `False`
- Next machine call: `True`
- Stop rules: `True`

## Checks

| Check | Result | Details |
|---|---|---|
| mcp_initialize | OK | {'name': 'machinesignal-local-mcp-adapter', 'version': '2026-06-04'} |
| required_tools_present | OK | tools=31; missing=[] |
| catalog_read | OK | HTTP 200 |
| machine_onboarding_read | OK | HTTP 200 |
| sandbox_created | OK | HTTP 200 |
| sandbox_key_not_returned_full_to_client | OK | adapter_state={'customer_api_key_stored_in_memory': True, 'full_api_key_returned_to_client': False} |
| score_created | OK | HTTP 200; score=81 |
| score_has_machine_decision | OK | decision=needs_verification |
| score_recommends_product | OK | next_product=verification |
| purchase_intent_created | OK | HTTP 200; product=verification |
| purchase_returns_order_id | OK | order_id=ord_5b0823b2 |
| orders_list_read | OK | HTTP 200; orders=1 |
| order_retrieved | OK | HTTP 200; order_id=ord_5b0823b2 |
| delivery_present | OK | {'delivery_present': True, 'delivery_type': 'data_quality_verification', 'delivery_status': 'verification_ready', 'fields_present': ['beta_delivery', 'checks', 'data_quality_risk', 'delivery_id', 'delivery_type', 'domain', 'external_contact_executed', 'generated_at', 'machine_recommendation', 'next_allowed_actions', 'next_machine_call', 'product_code', 'real_payment_executed', 'source_score_request_id', 'status', 'stop_rules', 'synthetic_demo_mode', 'verification_verdict', 'what_is_included'], 'has_crm_payload': False, 'has_machine_decision_matrix': False, 'has_next_machine_call': True, 'has_stop_rules': True} |
| delivery_machine_usable | OK | {'delivery_present': True, 'delivery_type': 'data_quality_verification', 'delivery_status': 'verification_ready', 'fields_present': ['beta_delivery', 'checks', 'data_quality_risk', 'delivery_id', 'delivery_type', 'domain', 'external_contact_executed', 'generated_at', 'machine_recommendation', 'next_allowed_actions', 'next_machine_call', 'product_code', 'real_payment_executed', 'source_score_request_id', 'status', 'stop_rules', 'synthetic_demo_mode', 'verification_verdict', 'what_is_included'], 'has_crm_payload': False, 'has_machine_decision_matrix': False, 'has_next_machine_call': True, 'has_stop_rules': True} |
| usage_read | OK | HTTP 200 |
| post_budget_respected | OK | post_calls=3; max=3 |
| no_real_payment_or_external_contact | OK | payment=False; contact=False |
| no_payment_test_intent_created | OK | payment test tool not called |
| no_external_publication | OK | external publication not called |

## Guardrails

- One sandbox customer only.
- One score call only.
- One sandbox purchase intent only.
- No real payment.
- No invoice.
- No external contact.
- No external publication.
- No human outreach.
- Full sandbox API key is kept in adapter memory and is not published.

## Learning Loop Interpretation

This is the first Competitive Learning experiment after adding the learning agent. The result is used as evidence that the machine-first commercial loop can move from score to a bounded sandbox purchase decision. If it passes, QA can treat this as a valid building block for the next go-live readiness step.
