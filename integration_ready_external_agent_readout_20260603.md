# MachineSignal - Integration Ready External Agent Test

Finished at: 2026-06-03T12:06:30

## Result

Status: passed

This test simulates an external machine customer. It starts from the public Integration Ready page, reads public contracts and executes the beta API flow without human email outreach.

Entry point: https://machinesignal.it/integration-ready/

## Machine Decisions

| Decision | Reason | Action |
|---|---|---|
| create_sandbox_customer | The external machine has no private beta key yet and should test without a human sales conversation. | POST /v1/sandbox/customers |
| score_existing_list | The machine has one known CRM domain and needs a routing decision before spending. | POST /v1/lead-opportunity-score |
| buy_target_discovery | The machine has no starting list, so it asks for targets bound to a market, area and commercial objective. | POST /v1/purchase-intent product_code=target_discovery |
| score_discovered_target | Target Discovery only produces candidates; the machine still needs a score decision. | POST /v1/lead-opportunity-score for dentists-odontoiatric-clinics-lombardia-candidate-01.example |
| buy_recommended_deep_analysis | The score response recommends Deep Analysis and the spend policy allows bounded spend. | POST /v1/purchase-intent product_code=deep_analysis |
| buy_action_pack_after_deep_analysis | Deep Analysis recommends Action Pack and the simulated customer machine has a compliance gate. | POST /v1/purchase-intent product_code=action_pack |

## HTTP Actions

| Action | HTTP | Result | Details |
|---|---:|---|---|
| GET llms | 200 | OK | https://machinesignal.it/llms.txt |
| GET robots | 200 | OK | https://machinesignal.it/robots.txt |
| GET sitemap | 200 | OK | https://machinesignal.it/sitemap.xml |
| GET well_known_machine_discovery | 200 | OK | https://machinesignal.it/.well-known/machine-discovery.json |
| GET machine_discovery_pack | 200 | OK | https://machinesignal.it/machine-discovery/machine-discovery-pack.json |
| GET integration_partner_pack | 200 | OK | https://machinesignal.it/integration-partner-pack.json |
| GET mcp_installation_pack | 200 | OK | https://machinesignal.it/mcp-machine-client-installation-pack.json |
| GET product_catalog | 200 | OK | https://machinesignal.it/product-catalog.json |
| GET openapi | 200 | OK | https://machinesignal.it/openapi.json |
| POST sandbox customer | 200 | OK | limited sandbox key created |
| POST score existing list | 200 | OK | decision=watchlist |
| POST target discovery | 200 | OK | target_discovery |
| POST score discovered target | 200 | OK | dentists-odontoiatric-clinics-lombardia-candidate-01.example |
| POST deep analysis | 200 | OK | domain=dentists-odontoiatric-clinics-lombardia-candidate-01.example |
| POST action pack | 200 | OK | domain=dentists-odontoiatric-clinics-lombardia-candidate-01.example |
| GET onboarding | 200 | OK | customer onboarding |
| GET orders | 200 | OK | orders=3 |
| GET usage | 200 | OK | usage |

## Score Summary

- `studio-odontoiatrico-demo.it` from `existing_list`: score `61`, confidence `0.62`, decision `watchlist`, strength `weak`, next `None`
- `dentists-odontoiatric-clinics-lombardia-candidate-01.example` from `target_discovery`: score `77`, confidence `0.88`, decision `buy_deep_analysis`, strength `medium`, next `deep_analysis`

## Orders And Credits

- Orders retrieved: `3`
- Ordered products: `action_pack, deep_analysis, target_discovery`
- Score credits used: `2`
- Target Discovery credits used: `1`
- Deep Analysis credits used: `1`
- Action Pack credits used: `1`

## Checks

| Check | Result | Details |
|---|---|---|
| integration_ready_page_read | OK | HTTP 200 |
| integration_ready_has_machine_links | OK | 21 links found |
| llms_links_integration_ready | OK | llms.txt contains integration-ready URL |
| robots_links_integration_ready | OK | robots.txt contains Integration-ready directive |
| sitemap_links_integration_ready | OK | sitemap contains integration-ready URL |
| well_known_links_integration_ready | OK | well-known discovery includes integration_ready_page |
| integration_pack_has_three_cases | OK | existing list, no list and action payload cases present |
| openapi_has_core_paths | OK | core protected paths present |
| sandbox_customer_created | OK | HTTP 200 |
| existing_list_score_returned_decision | OK | HTTP 200 |
| target_discovery_order_created | OK | HTTP 200 |
| target_discovery_returned_samples | OK | 3 samples |
| discovered_target_1_score_returned_decision | OK | HTTP 200 |
| machine_spend_policy_read_before_addon | OK | next_product=deep_analysis; allowed=['deep_analysis'] |
| recommended_deep_analysis_bought | OK | HTTP 200 |
| action_pack_bought_after_deep_analysis | OK | HTTP 200 |
| customer_onboarding_read | OK | HTTP 200 |
| orders_retrieved | OK | HTTP 200 |
| usage_retrieved | OK | HTTP 200 |
| no_real_payment_executed | OK | False |
| no_external_contact_executed | OK | False |

## Guardrails

- Real payment executed: `False`
- External contact executed: `False`
- The report does not expose full API keys.
- The test did not send email or contact external targets.

## Interpretation

The result validates the machine-to-machine entry path: an external software client can start from the public Integration Ready page, discover the API contract, create a sandbox key, score targets, buy only permitted beta deliverables and retrieve usage/orders.
