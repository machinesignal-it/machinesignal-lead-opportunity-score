# MachineSignal - Local MCP Adapter Smoke Test

Finished at: 2026-06-03T10:11:39

## Result

Status: passed
Server: `C:\Users\natal\AppData\Local\Temp\MachineSignal\github_repo_sync_20260530\mcp_adapter\machinesignal_mcp_server.py`

## Score Summary

- Domain: `dentists-odontoiatric-clinics-lombardia-candidate-01.example`
- Opportunity score: `77`
- Confidence: `0.88`
- Decision: `buy_deep_analysis`
- Web Architect status: `architect_signal_insufficient`
- Commercial strength: `medium`
- Recommended product: `deep_analysis`

## MCP Tool Calls

| Tool | HTTP | Result | Auth |
|---|---:|---|---|
| get_product_catalog | 200 | OK | none |
| get_machine_onboarding | 200 | OK | none |
| get_dentists_beta_pack | 200 | OK | none |
| create_sandbox_customer | 200 | OK | none |
| get_customer_onboarding | 200 | OK | customer_api_key |
| create_purchase_intent_target_discovery | 200 | OK | customer_api_key |
| score_lead_opportunity | 200 | OK | customer_api_key |
| create_purchase_intent_recommended_add_on | 200 | OK | customer_api_key |
| list_orders | 200 | OK | customer_api_key |
| get_order | 200 | OK | customer_api_key |
| get_usage | 200 | OK | customer_api_key |

## Checks

| Check | Result | Details |
|---|---|---|
| mcp_initialize | OK | {'name': 'machinesignal-local-mcp-adapter', 'version': '2026-06-03'} |
| mcp_tools_list | OK | 11 tools |
| tool_get_product_catalog | OK | HTTP 200 |
| tool_get_machine_onboarding | OK | HTTP 200 |
| tool_get_dentists_beta_pack | OK | HTTP 200 |
| tool_create_sandbox_customer | OK | HTTP 200 |
| sandbox_key_not_exposed_full | OK | ms_cust_tN...ZBGp |
| tool_get_customer_onboarding | OK | HTTP 200 |
| tool_create_purchase_intent_target_discovery | OK | HTTP 200 |
| target_discovery_sample_available | OK | dentists-odontoiatric-clinics-lombardia-candidate-01.example |
| tool_score_lead_opportunity | OK | HTTP 200 |
| score_has_decision | OK | buy_deep_analysis |
| score_has_web_architect_review | OK | architect_signal_insufficient |
| score_has_commercial_strength | OK | medium |
| tool_create_purchase_intent_recommended_add_on | OK | HTTP 200; product=deep_analysis |
| tool_list_orders | OK | HTTP 200; orders=2 |
| tool_get_order | OK | HTTP 200; order=ord_6f42a17d |
| tool_get_usage | OK | HTTP 200 |
| no_real_payment | OK | False |
| no_external_contact | OK | False |

## Orders And Guardrails

- Orders retrieved: `2`
- First order id: `ord_6f42a17d`
- Real payment executed: `False`
- External contact executed: `False`

## Interpretation

The test proves that the local adapter can expose MachineSignal as MCP-style tools over stdio. The client used JSON-RPC initialize, tools/list and tools/call, then completed a safe machine-buyer flow.

The adapter stores the sandbox key in memory and does not return the full key to the MCP client.
