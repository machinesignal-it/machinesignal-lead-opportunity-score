# MachineSignal - MCP Positive Verification Deep Analysis Probe - 2026-06-10

## Result

Status: completed_mcp_positive_verification_deep_analysis_probe

OK: True

Mode: McpPositiveVerificationDeepAnalysisProbeWriteCapped

POST calls executed: 4

Max POST calls allowed: 5

Verification order: `ord_351eecf6`

Verification verdict: `verified_for_deep_analysis`

Deep Analysis order: `ord_191f7f6f`

Deep Analysis gate passed: True

Deep Analysis credits used before: 0

Deep Analysis credits used after: 1

Real payment executed: False

External contact executed: False

## What This Validates

A buyer machine can move from a positive sandbox Verification delivery to a Deep Analysis purchase by passing `source_verification_order_intent_id`. The live API accepts the request, records the passed gate and consumes exactly one Deep Analysis credit.

## Tool Calls

| Tool | Kind | HTTP | Result |
|---|---|---:|---|
| create_sandbox_customer | POST/write | 429 | FAIL |
| direct_create_sandbox_customer fallback | POST/write | 200 | OK |
| create_purchase_intent positive verification | POST/write | 200 | OK |
| get_order verification | GET/read | 200 | OK |
| get_usage before | GET/read | 200 | OK |
| create_purchase_intent deep_analysis allowed | POST/write | 200 | OK |
| get_usage after | GET/read | 200 | OK |

## Checks

| Check | Result | Details |
|---|---|---|
| mcp_initialize | OK | {'name': 'machinesignal-local-mcp-adapter', 'version': '2026-06-04'} |
| required_tools_present | OK | tools=31; missing=[] |
| sandbox_mcp_create_rate_limited | OK | MCP adapter fingerprint reached the daily sandbox creation limit; using direct machine fallback for sandbox creation only. |
| mcp_reinitialized_with_precreated_sandbox_key | OK | fallback sandbox key stored in adapter memory through environment |
| sandbox_created | OK | HTTP 200 |
| positive_verification_created | OK | HTTP 200 |
| verification_order_retrieved | OK | HTTP 200; order_id=ord_351eecf6 |
| verification_verdict_positive | OK | verdict=verified_for_deep_analysis |
| verification_points_to_purchase_intent | OK | {'method': 'POST', 'endpoint': '/v1/purchase-intent', 'when': 'if budget rules allow Deep Analysis after this positive Verification', 'required_headers': ['X-API-Key', 'Idempotency-Key'], 'body': {'product_code': 'deep_analysis', 'domain': 'verified-deep-analysis-ready.test', 'source_verification_order_intent_id': 'use_this_verification_order_intent_id'}} |
| usage_before_read | OK | HTTP 200; deep_used=0 |
| deep_analysis_created | OK | HTTP 200 |
| deep_analysis_gate_passed | OK | {'required': True, 'passed': True, 'source_verification_order_intent_id': 'ord_351eecf6', 'source_delivery_id': 'del_c5df9552', 'source_verification_verdict_status': 'verified_for_deep_analysis'} |
| deep_analysis_delivery_ready | OK | deep_opportunity_analysis |
| usage_after_read | OK | HTTP 200; deep_used=1 |
| one_deep_analysis_credit_consumed | OK | before=0; after=1 |
| verification_credit_consumed_once | OK | verification_used=1 |
| post_budget_respected | OK | post_calls=4; max=5 |
| no_real_payment_or_external_contact | OK | payment=False; contact=False |

## Guardrails

- Synthetic `.test` sandbox fixture only.
- No real payment.
- No invoice.
- No external contact.
- No external publication.
- No human outreach.
