# MachineSignal - MCP Write-Capped Sandbox Probe - 2026-06-10

## Result

Status: completed_mcp_write_capped_sandbox_probe

OK: True

Mode: WriteCappedMcpSandboxProbe

POST calls executed: 2

Max POST calls allowed: 2

Real payment executed: False

External contact executed: False

Purchase intent created: False

## What This Validates

A machine client can use the local stdio MCP adapter for a minimal real sandbox path: create one sandbox customer, score one provided target and read state back, without buying add-ons or contacting humans.

## Actions

| Tool | Kind | HTTP | Result |
|---|---|---:|---|
| create_sandbox_customer | POST/write | 200 | OK |
| score_lead_opportunity | POST/write | 200 | OK |
| get_usage | GET/read | 200 | OK |
| list_orders | GET/read | 200 | OK |

## Score Summary

- Domain: `mcp-write-capped-demo-dentist.example`
- Opportunity score: `74`
- Confidence: `0.62`
- Decision: `nurture`
- Recommended next product: `nurture_signal`

## Checks

| Check | Result | Details |
|---|---|---|
| mcp_initialize | OK | {'name': 'machinesignal-local-mcp-adapter', 'version': '2026-06-04'} |
| required_tools_present | OK | tools=31; missing=[] |
| sandbox_created | OK | HTTP 200 |
| sandbox_key_not_returned_full_to_client | OK | adapter_state={'customer_api_key_stored_in_memory': True, 'full_api_key_returned_to_client': False} |
| score_created | OK | HTTP 200; score=74 |
| score_has_machine_decision | OK | decision=nurture |
| usage_read | OK | HTTP 200 |
| orders_read | OK | HTTP 200; products=[] |
| no_purchase_orders_created | OK | products=[] |
| post_budget_respected | OK | post_calls=2; max=2 |
| no_purchase_intent_created | OK | create_purchase_intent not called |
| no_payment_test_intent_created | OK | create_payment_test_intent not called |
| no_payment_or_external_contact | OK | payment=False; contact=False |

## Guardrails

- No purchase intent was created.
- No payment-test intent was created.
- No real payment was executed.
- No invoice was issued.
- No external contact or human outreach was executed.
- The full sandbox API key was stored by the adapter and not published in this report.

## Interpretation

The local MCP adapter can perform the first write-capped sandbox use by a machine while staying under the configured POST budget. The next step can be either a similarly capped Deep Analysis purchase probe or a partner/socio review package, depending on whether we want more product evidence or more commercial packaging.
