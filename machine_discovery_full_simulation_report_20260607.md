# MachineSignal Machine Discovery Full Simulation - 2026-06-07

## Result

Status: completed_full_machine_discovery

OK: True

Machine customer mode: machine_without_starting_list

Write calls executed: 3

Real payment executed: False

External contact executed: False

Fiscal invoice issued: False

## Machine Path

1. Start from llms.txt and .well-known/machine-discovery.json.
2. Find OpenAPI, Postman collection, product catalog, onboarding and MCP/tool-registry checklist.
3. Read the "customer has no list" scenario.
4. Create a low-credit sandbox customer.
5. Buy target_discovery as beta purchase-intent.
6. Select one returned target sample.
7. Score the target.
8. Decide the next product from score and catalog rules.

## Decision

- First product selected: target_discovery
- Target Discovery order: ord_a7d3fc85
- Scored domain: dentists-and-odontoiatric-clinics-lombardia-candidate-01.example
- Score: 74
- Score decision: nurture
- Recommended next product: nurture_signal
- Recommended next action: not provided by score response
- Deep Analysis purchased in this run: False

## Checks

| Check | Status | Details |
|---|---|---|
| llms_reachable | OK | HTTP 200 |
| llms_exposes_machine_discovery | OK | llms contains well-known discovery link. |
| llms_exposes_mcp_registry_checklist | OK | llms contains MCP/tool-registry checklist. |
| well_known_machine_discovery_reachable | OK | HTTP 200 |
| well_known_machine_discovery_primary_machine | OK | primary_customer_interface=machine |
| discovery_link_product_catalog | OK | product_catalog=https://machinesignal.it/product-catalog.json |
| discovery_link_machine_onboarding | OK | machine_onboarding=https://machinesignal.it/machine-onboarding.json |
| discovery_link_openapi | OK | openapi=https://machinesignal.it/openapi.json |
| discovery_link_mcp_tool_registry_draft_checklist | OK | mcp_tool_registry_draft_checklist=https://machinesignal.it/mcp_tool_registry_draft_checklist_20260607.json |
| product_catalog_valid | OK | Target Discovery product_code=target_discovery |
| onboarding_valid | OK | onboarding HTTP 200 |
| openapi_valid | OK | OpenAPI exposes sandbox customers. |
| postman_valid | OK | Postman collection exposes score request. |
| mcp_checklist_valid | OK | hosted_mcp_live=False |
| machine_no_list_first_product | OK | first_product=target_discovery |
| sandbox_created | OK | HTTP 200, key_returned=True |
| target_discovery_beta_order_created | OK | HTTP 200, order=ord_a7d3fc85 |
| target_discovery_sample_available | OK | sample_target_found=True |
| score_created | OK | HTTP 200, score=74 |
| machine_selects_next_service | OK | next_product=nurture_signal |
| no_real_payment | OK | real_payment_executed=False |
| no_external_contact | OK | external_contact_executed=False |
| write_budget_respected | OK | write_calls=3 |

## Interpretation

The machine can discover MachineSignal from public machine-readable resources, identify the no-list buying path, create a sandbox, request Target Discovery, score one target and determine the next recommended service without human email outreach.

This run intentionally stops before Deep Analysis purchase to keep write usage low. It validates the decision path, not a full downstream paid-beta chain.

## Next Step

Use this report as the public proof that the discovery surfaces are sufficient for a machine buyer. The next bounded run can test one Deep Analysis purchase only if we want to validate the next spend-control layer again.
