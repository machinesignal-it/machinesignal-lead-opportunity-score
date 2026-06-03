# MachineSignal - MCP / Tool Wrapper Simulation

Finished at: 2026-06-03T09:59:36

## Result

Status: passed
Manifest: `https://machinesignal.it/mcp-tool-manifest.json`
Auth source: `public_sandbox`
Sandbox customer: `sandbox_720c2216_mpxrzuvp`
Customer key prefix: `ms_cust_vo...m7gf`

## Score Summary

- Domain: `dentists-odontoiatric-clinics-lombardia-candidate-01.example`
- Opportunity score: `77`
- Confidence: `0.88`
- Decision: `buy_deep_analysis`
- Web Architect status: `architect_signal_insufficient`
- Commercial strength: `medium`
- Recommended product: `deep_analysis`

## Tool Calls

| Tool | Method | HTTP | Result | Auth |
|---|---:|---:|---|---|
| get_product_catalog | GET | 200 | OK | none |
| get_machine_onboarding | GET | 200 | OK | none |
| get_dentists_beta_pack | GET | 200 | OK | none |
| create_sandbox_customer | POST | 200 | OK | none |
| get_customer_onboarding | GET | 200 | OK | customer_api_key |
| create_purchase_intent | POST | 200 | OK | customer_api_key |
| score_lead_opportunity | POST | 200 | OK | customer_api_key |
| create_purchase_intent | POST | 200 | OK | customer_api_key |
| list_orders | GET | 200 | OK | customer_api_key |
| get_order | GET | 200 | OK | customer_api_key |
| get_usage | GET | 200 | OK | customer_api_key |

## Checks

| Check | Result | Details |
|---|---|---|
| manifest_readable | OK | HTTP 200 |
| manifest_has_expected_tools | OK | 11 tools |
| manifest_does_not_claim_public_mcp_server | OK | public_mcp_server_live=false |
| manifest_requires_adapter | OK | adapter_required=true |
| tool_get_product_catalog | OK | HTTP 200 |
| tool_get_machine_onboarding | OK | HTTP 200 |
| tool_get_dentists_beta_pack | OK | HTTP 200 |
| tool_create_sandbox_customer | OK | HTTP 200; key=ms_cust_vo...m7gf |
| tool_get_customer_onboarding | OK | HTTP 200 |
| tool_create_purchase_intent_target_discovery | OK | HTTP 200 |
| target_discovery_sample_available | OK | dentists-odontoiatric-clinics-lombardia-candidate-01.example |
| tool_score_lead_opportunity | OK | HTTP 200 |
| score_has_decision | OK | buy_deep_analysis |
| score_has_web_architect_review | OK | architect_signal_insufficient |
| score_has_commercial_strength | OK | medium |
| tool_create_purchase_intent_recommended_add_on | OK | HTTP 200; product=deep_analysis |
| tool_list_orders | OK | HTTP 200; orders=2 |
| tool_get_order | OK | HTTP 200; order=ord_8102df02 |
| tool_get_usage | OK | HTTP 200 |
| no_real_payment | OK | False |
| no_external_contact | OK | False |

## Orders And Guardrails

- Orders retrieved: `2`
- First order id: `ord_8102df02`
- Add-on product: `deep_analysis`
- Add-on status: `accepted_beta_order_intent`
- Real payment executed: `False`
- External contact executed: `False`

## Interpretation

The wrapper simulation confirms that an agent can read the public tool-style manifest, map tool names to HTTP endpoints and execute a safe machine-buyer flow without human email outreach.

The current setup is MCP-ready but not yet a hosted public MCP server. A future MCP adapter can wrap these same tools using the manifest as the contract.
