# MachineSignal - Machine Deep Analysis Single Purchase - 2026-06-08

## Result

Status: completed_deep_analysis_single_purchase

OK: True

Machine customer mode: machine_with_scored_target_and_spend_gate

Write calls executed: 3

POST calls executed: 3

Real payment executed: False

External contact executed: False

Fiscal invoice issued: False

## Machine Path Tested

1. Read public machine-discovery resources.
2. Create one limited sandbox customer.
3. Score one synthetic high-signal demo target.
4. If the score recommends Deep Analysis, create one Deep Analysis beta purchase-intent.
5. Retrieve the created order and usage.
6. Stop before Action Pack.

## Decision

- Demo target: premium-dental-conversion-gap.it
- Score: 78
- Confidence: 0.88
- Score decision: buy_deep_analysis
- Score recommended next product: deep_analysis
- Deep Analysis order: ord_c354a9af
- Deep Analysis delivery type: deep_opportunity_analysis
- Deep Analysis recommended next product: action_pack
- Action Pack purchased in this run: False

## Deep Analysis Fields

| Field | Present |
|---|---|
| what_is_included | True |
| sector_context | True |
| commercial_objective | True |
| commercial_evidence | True |
| machine_decision_matrix | True |
| action_pack_purchase_gate | True |
| crm_summary_payload | True |
| recommended_next_step | True |
| stop_rules | True |
| next_machine_call | True |

## Checks

| Check | Status | Details |
|---|---|---|
| llms_reachable | OK | HTTP 200 |
| llms_exposes_machine_discovery | OK | llms contains well-known machine discovery link. |
| well_known_machine_discovery_reachable | OK | HTTP 200 |
| machine_discovery_customer_interface | OK | primary_customer_interface=machine |
| product_catalog_reachable | OK | HTTP 200 |
| openapi_reachable | OK | HTTP 200 |
| machine_onboarding_reachable | OK | HTTP 200 |
| deep_analysis_in_catalog | OK | Catalog includes deep_analysis. |
| purchase_intent_in_openapi | OK | OpenAPI exposes purchase-intent endpoint. |
| sandbox_customer_created | OK | HTTP 200 |
| score_created | OK | HTTP 200 |
| score_recommends_deep_analysis | OK | decision=buy_deep_analysis, next=deep_analysis |
| deep_analysis_purchase_intent_created | OK | HTTP 200 |
| deep_analysis_delivery_type_valid | OK | delivery_type=deep_opportunity_analysis |
| deep_analysis_delivery_ready | OK | status=deep_analysis_ready |
| deep_analysis_consumed_one_credit | OK | credits_consumed=1 |
| action_pack_gate_present_but_not_purchased | OK | gate_present=True, purchased=false |
| deep_analysis_has_crm_payload | OK | CRM summary payload present. |
| deep_analysis_has_machine_decision_matrix | OK | Machine decision matrix present. |
| deep_analysis_order_retrieved | OK | HTTP 200 |
| orders_list_reachable | OK | HTTP 200, count=1 |
| usage_reachable_after_deep_analysis | OK | HTTP 200, backend=durable_object |
| no_real_payment | OK | No endpoint reported real_payment_executed=true. |
| no_external_contact | OK | No endpoint reported external_contact_executed=true. |
| api_key_not_published | OK | API key used only in memory. |

## Interpretation

This run proves the next controlled spend layer: a machine can start from public MachineSignal resources, create a sandbox key, score a target and buy exactly one Deep Analysis only when the score justifies it.

The delivery is machine-readable and includes the commercial evidence, CRM summary and Action Pack gate needed to decide whether another paid machine action is justified. The run intentionally does not buy Action Pack.

## Next Step

Use this proof as the public evidence for the score-to-Deep-Analysis gate. The next bounded test can validate the Action Pack gate with one purchase only after checking that the Deep Analysis delivery says the gate is conditional and useful.
