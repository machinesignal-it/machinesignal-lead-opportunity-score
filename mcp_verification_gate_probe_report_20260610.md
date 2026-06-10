# MachineSignal - MCP Verification Gate Probe - 2026-06-10

## Result

Status: completed_mcp_verification_gate_probe

OK: True

Mode: McpVerificationGateProbeWriteCapped

POST calls executed: 3

Max POST calls allowed: 3

Verification product purchased in sandbox: `verification`

Deep Analysis purchase executed: False

Real payment executed: False

External contact executed: False

## What This Validates

A buyer machine can stop after a cautious verification delivery instead of buying Deep Analysis immediately. This protects the machine-first commercial model from unnecessary spend and avoids pretending that every verification result is a green light.

## Verification Gate

- Verification verdict status: `keep_with_caution`
- Next machine call endpoint: `/v1/lead-opportunity-score`
- Gate allows Deep Analysis now: `False`
- Machine policy decision: `stop_before_deep_analysis`
- Stop rules count: `3`

## Machine Decisions

| Decision | Reason | Action |
|---|---|---|
| start_sandbox | The buyer machine needs a temporary environment before evaluating paid add-ons. | create_sandbox_customer |
| score_target | The machine must receive a score and routing recommendation before buying any add-on. | score_lead_opportunity |
| buy_verification_only | The score requires verification, so the machine buys exactly one verification and no higher-cost product. | create_purchase_intent verification |
| stop_before_deep_analysis | Verification returned keep_with_caution and points the machine back to scoring after new/corrected evidence, not to immediate purchase-intent. | no deep_analysis purchase |

## Tool Calls

| Tool | Kind | HTTP | Result |
|---|---|---:|---|
| create_sandbox_customer | POST/write | 200 | OK |
| score_lead_opportunity | POST/write | 200 | OK |
| create_purchase_intent | POST/write | 200 | OK |
| get_order | GET/read | 200 | OK |
| get_usage | GET/read | 200 | OK |

## Checks

| Check | Result | Details |
|---|---|---|
| mcp_initialize | OK | {'name': 'machinesignal-local-mcp-adapter', 'version': '2026-06-04'} |
| required_tools_present | OK | tools=31; missing=[] |
| sandbox_created | OK | HTTP 200 |
| score_created | OK | HTTP 200; decision=needs_verification |
| score_requires_verification | OK | decision=needs_verification; next=verification |
| verification_purchase_created | OK | HTTP 200 |
| verification_order_retrieved | OK | HTTP 200; order_id=ord_d70b90a6 |
| verification_delivery_present | OK | {'delivery_present': True, 'delivery_type': 'data_quality_verification', 'delivery_status': 'verification_ready', 'verification_verdict_status': 'keep_with_caution', 'verification_verdict_meaning': 'The lead can stay in the workflow, but the machine should not spend paid outreach or campaign budget until quality is confirmed.', 'next_allowed_actions': ['rescore', 'save_to_crm', 'request_deep_analysis_after_verification'], 'next_machine_call_endpoint': '/v1/lead-opportunity-score', 'stop_rules_count': 3, 'has_request_deep_analysis_after_verification_hint': True, 'gate_allows_deep_analysis_now': False, 'machine_policy_decision': 'stop_before_deep_analysis'} |
| verification_verdict_cautious | OK | verdict=keep_with_caution |
| verification_gate_does_not_allow_deep_analysis_now | OK | {'delivery_present': True, 'delivery_type': 'data_quality_verification', 'delivery_status': 'verification_ready', 'verification_verdict_status': 'keep_with_caution', 'verification_verdict_meaning': 'The lead can stay in the workflow, but the machine should not spend paid outreach or campaign budget until quality is confirmed.', 'next_allowed_actions': ['rescore', 'save_to_crm', 'request_deep_analysis_after_verification'], 'next_machine_call_endpoint': '/v1/lead-opportunity-score', 'stop_rules_count': 3, 'has_request_deep_analysis_after_verification_hint': True, 'gate_allows_deep_analysis_now': False, 'machine_policy_decision': 'stop_before_deep_analysis'} |
| machine_stops_before_deep_analysis | OK | No deep_analysis tool call executed. |
| usage_read | OK | HTTP 200 |
| post_budget_respected | OK | post_calls=3; max=3 |
| no_real_payment_or_external_contact | OK | payment=False; contact=False |

## Guardrails

- One sandbox customer only.
- One score call only.
- One verification purchase intent only.
- No Deep Analysis purchase when verification is cautious.
- No real payment.
- No invoice.
- No external contact.
- No external publication.
- No human outreach.
