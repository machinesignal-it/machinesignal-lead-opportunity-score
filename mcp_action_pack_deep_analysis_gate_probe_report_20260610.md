# MachineSignal - MCP Action Pack Deep Analysis Gate Probe - 2026-06-10

## Result

Status: completed_mcp_action_pack_deep_analysis_gate_probe

OK: True

Mode: McpActionPackDeepAnalysisGateProbeWriteCapped

POST calls executed: 5

Max POST calls allowed: 5

Blocked Action Pack error: `action_pack_gate_failed`

Deep Analysis order: `ord_afca5bd4`

Action Pack order: `ord_a8312125`

Action Pack gate passed: True

Action Pack credits used before blocked attempt: 0

Action Pack credits used after blocked attempt: 0

Action Pack credits used after valid purchase: 1

Real payment executed: False

External contact executed: False

## What This Validates

A buyer machine cannot buy Action Pack without a valid `source_order_intent_id`. The same machine can buy Action Pack after a same-domain accepted Deep Analysis order. The live API records the passed gate and consumes exactly one Action Pack credit.

## Tool Calls

| Tool | Kind | HTTP | Result |
|---|---|---:|---|
| create_sandbox_customer | POST/write | 429 | FAIL |
| direct_create_sandbox_customer fallback | POST/write | 200 | OK |
| get_usage before | GET/read | 200 | OK |
| create_purchase_intent action_pack without source | POST/write | 400 | FAIL |
| get_usage after blocked action_pack | GET/read | 200 | OK |
| create_purchase_intent deep_analysis source | POST/write | 200 | OK |
| create_purchase_intent action_pack with deep_analysis source | POST/write | 200 | OK |
| get_usage after valid action_pack | GET/read | 200 | OK |

## Checks

| Check | Result | Details |
|---|---|---|
| mcp_initialize | OK | {'name': 'machinesignal-local-mcp-adapter', 'version': '2026-06-04'} |
| required_tools_present | OK | tools=31; missing=[] |
| sandbox_mcp_create_rate_limited | OK | MCP adapter fingerprint reached the daily sandbox creation limit; using direct machine fallback for sandbox creation only. |
| mcp_reinitialized_with_precreated_sandbox_key | OK | fallback sandbox key stored in adapter memory through environment |
| sandbox_created | OK | HTTP 200 |
| usage_before_read | OK | HTTP 200; action_used=0; deep_used=0 |
| action_pack_without_deep_analysis_blocked | OK | HTTP 400; error=action_pack_gate_failed |
| blocked_action_pack_consumes_no_credit | OK | before=0; after_blocked=0 |
| deep_analysis_source_created | OK | HTTP 200; order_id=ord_afca5bd4 |
| deep_analysis_ready_for_action_pack | OK | type=deep_opportunity_analysis; status=deep_analysis_ready; gate_present=True |
| action_pack_created_after_deep_analysis | OK | HTTP 200; order_id=ord_a8312125 |
| action_pack_gate_passed | OK | {'required': True, 'passed': True, 'source_order_intent_id': 'ord_afca5bd4', 'source_delivery_id': 'del_4b6fd188', 'source_deep_analysis_version': 'domain_specific_commercial_evidence_v1'} |
| action_pack_delivery_ready | OK | type=action_pack; status=action_pack_ready |
| action_pack_blocks_external_contact_by_default | OK | default=blocked; contact=False |
| usage_after_read | OK | HTTP 200; action_used=1; deep_used=1 |
| one_deep_analysis_credit_consumed | OK | before=0; after=1 |
| one_action_pack_credit_consumed | OK | before=0; after=1 |
| post_budget_respected | OK | post_calls=5; max=5 |
| no_real_payment_or_external_contact | OK | payment=False; contact=False |

## Guardrails

- Synthetic `.test` sandbox domain only.
- No real payment.
- No invoice.
- No external contact.
- No external publication.
- No human outreach.
