# MachineSignal - MCP Machine Buyer Agent Readout

Finished at: 2026-06-03T10:32:03

## Result

Status: passed

This test connects to the local MachineSignal MCP adapter as a buyer machine. It validates that a machine can move from discovery to sandbox, target discovery, score, recommended add-on purchase, orders and usage without human email outreach.

## Agent Decisions

| Decision | Reason | Action |
|---|---|---|
| start_with_sandbox | The buyer machine can evaluate MachineSignal without human email or sales calls. | create_sandbox_customer |
| buy_target_discovery | No starting prospect list was provided, so the buyer machine asks MachineSignal to produce a bounded list for a specific market and area. | create_purchase_intent target_discovery |
| score_selected_target | The buyer machine needs a decision, not just a raw domain list. | score_lead_opportunity |
| buy_recommended_add_on | The score response recommends deep_analysis; the buyer machine buys only that next bounded deliverable. | create_purchase_intent deep_analysis |

## Tool Calls

| Tool | HTTP | Result | Auth |
|---|---:|---|---|
| get_product_catalog | 200 | OK | none |
| get_machine_onboarding | 200 | OK | none |
| create_sandbox_customer | 200 | OK | none |
| get_customer_onboarding | 200 | OK | customer_api_key |
| create_purchase_intent | 200 | OK | customer_api_key |
| score_lead_opportunity | 200 | OK | customer_api_key |
| create_purchase_intent | 200 | OK | customer_api_key |
| list_orders | 200 | OK | customer_api_key |
| get_usage | 200 | OK | customer_api_key |

## Score Summary

- Domain: `dentists-odontoiatric-clinics-lombardia-candidate-01.example`
- Opportunity score: `77`
- Confidence: `0.88`
- Decision: `buy_deep_analysis`
- Web Architect status: `architect_signal_insufficient`
- Commercial strength: `medium`
- Recommended product: `deep_analysis`

## Checks

| Check | Result | Details |
|---|---|---|
| initialize | OK | {'name': 'machinesignal-local-mcp-adapter', 'version': '2026-06-03'} |
| tools_available | OK | 11 tools listed |
| catalog_read | OK | HTTP 200 |
| onboarding_read | OK | HTTP 200 |
| sandbox_created_and_key_hidden | OK | HTTP 200; key=ms_cust_SU...5NXC |
| customer_onboarding_read | OK | HTTP 200 |
| target_selected | OK | dentists-odontoiatric-clinics-lombardia-candidate-01.example |
| score_returned_decision | OK | score=77; decision=buy_deep_analysis |
| recommended_add_on_bought | OK | HTTP 200; product=deep_analysis |
| orders_visible | OK | orders=2 |
| usage_visible | OK | HTTP 200 |
| no_real_payment | OK | False |
| no_external_contact | OK | False |

## Guardrails

- Orders retrieved: `2`
- Real payment executed: `False`
- External contact executed: `False`
- Full API keys are not exposed in this report.

## Interpretation

The result supports the machine-first business model: a software client can discover MachineSignal, test it through a sandbox, request a bounded target discovery deliverable, score a target and buy the next recommended deliverable without requiring a human sales conversation.
