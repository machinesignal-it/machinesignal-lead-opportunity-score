# MachineSignal - MCP Deep Analysis Verification Gate Probe - 2026-06-10

## Result

Status: completed_mcp_deep_analysis_verification_gate_probe

OK: True

Mode: McpDeepAnalysisVerificationGateProbeWriteCapped

POST calls executed: 5

Max POST calls allowed: 5

Verification order: `ord_c601ecb5`

Blocked Deep Analysis HTTP status: 400

Blocked Deep Analysis error: `deep_analysis_verification_gate_failed`

Deep Analysis credits used before: 0

Deep Analysis credits used after: 0

Real payment executed: False

External contact executed: False

## What This Validates

A buyer machine cannot spend a Deep Analysis credit by referencing a Verification order whose verdict is cautious. The live API rejects that call with `deep_analysis_verification_gate_failed` and keeps the Deep Analysis credit balance unchanged.

## Tool Calls

| Tool | Kind | HTTP | Result |
|---|---|---:|---|
| create_sandbox_customer | POST/write | 429 | FAIL |
| direct_create_sandbox_customer fallback | POST/write | 200 | OK |
| score_lead_opportunity | POST/write | 200 | OK |
| create_purchase_intent verification | POST/write | 200 | OK |
| get_order verification | GET/read | 200 | OK |
| get_usage before | GET/read | 200 | OK |
| create_purchase_intent deep_analysis blocked | POST/write-blocked | 400 | FAIL |
| get_usage after | GET/read | 200 | OK |

## Checks

| Check | Result | Details |
|---|---|---|
| mcp_initialize | OK | {'name': 'machinesignal-local-mcp-adapter', 'version': '2026-06-04'} |
| required_tools_present | OK | tools=31; missing=[] |
| sandbox_mcp_create_rate_limited | OK | MCP adapter fingerprint reached the daily sandbox creation limit; using direct machine fallback for sandbox creation only. |
| mcp_reinitialized_with_precreated_sandbox_key | OK | fallback sandbox key stored in adapter memory through environment |
| sandbox_created | OK | HTTP 200 |
| score_created | OK | HTTP 200; decision=needs_verification |
| score_requires_verification | OK | decision=needs_verification; next=verification |
| verification_purchase_created | OK | HTTP 200 |
| verification_order_retrieved | OK | HTTP 200; order_id=ord_c601ecb5 |
| verification_delivery_present | OK | fields=['beta_delivery', 'checks', 'data_quality_risk', 'delivery_id', 'delivery_type', 'domain', 'external_contact_executed', 'generated_at', 'machine_recommendation', 'next_allowed_actions', 'next_machine_call', 'product_code', 'real_payment_executed', 'source_score_request_id', 'status', 'stop_rules', 'synthetic_demo_mode', 'verification_verdict', 'what_is_included'] |
| verification_verdict_cautious | OK | verdict=keep_with_caution |
| usage_before_read | OK | HTTP 200; deep_used=0 |
| deep_analysis_blocked_http_400 | OK | HTTP 400 |
| deep_analysis_blocked_with_gate_error | OK | error=deep_analysis_verification_gate_failed; details={'source_verification_order_intent_id': 'ord_c601ecb5', 'source_verification_verdict_status': 'keep_with_caution', 'accepted_positive_verdict_statuses': ['verified', 'verified_for_deep_analysis', 'safe_to_deepen']} |
| blocked_error_references_cautious_verdict | OK | {'source_verification_order_intent_id': 'ord_c601ecb5', 'source_verification_verdict_status': 'keep_with_caution', 'accepted_positive_verdict_statuses': ['verified', 'verified_for_deep_analysis', 'safe_to_deepen']} |
| usage_after_read | OK | HTTP 200; deep_used=0 |
| no_deep_analysis_credit_consumed_on_block | OK | before=0; after=0 |
| verification_credit_consumed_once | OK | verification_used=1 |
| post_budget_respected | OK | post_calls=5; max=5 |
| no_real_payment_or_external_contact | OK | payment=False; contact=False |

## Guardrails

- One sandbox customer only.
- One score call only.
- One Verification purchase intent only.
- One blocked Deep Analysis attempt only.
- No real payment.
- No invoice.
- No external contact.
- No external publication.
- No human outreach.
