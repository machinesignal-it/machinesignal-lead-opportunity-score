# MachineSignal Daily Machine-Buyer Monitor

Finished at: 2026-06-03T08:39:14
Status: PASS

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
| public_product_catalog_reachable | OK | HTTP 200 |
| public_machine_onboarding_reachable | OK | HTTP 200 |
| public_openapi_reachable | OK | HTTP 200 |
| public_llms_reachable | OK | HTTP 200 |
| public_dentists_beta_pack_reachable | OK | HTTP 200 |
| machine_can_discover_dentists_pack | OK | llms.txt includes dentists pack |
| dentists_pack_contains_benchmark | OK | expected benchmark targets_scored=250 |
| monitor_api_key_loaded | OK | stored key=ms_cust_Vq...sdBi |
| sandbox_customer_created | OK | skipped: using stored monitor beta key |
| authenticated_onboarding_reachable | OK | HTTP 200 |
| target_discovery_purchase_intent_created | OK | HTTP 200 |
| target_discovery_returns_sample_target | OK | dentists-odontoiatric-clinics-lombardia-candidate-01.example |
| score_created | OK | HTTP 200 |
| score_has_web_architect_review | OK | architect_signal_insufficient |
| score_has_commercial_strength | OK | medium |
| recommended_add_on_purchase_intent_created | OK | HTTP 200, product=deep_analysis |
| orders_reachable | OK | HTTP 200, orders=4 |
| usage_reachable | OK | HTTP 200 |
| real_payment_guardrail_false | OK | False |
| external_contact_guardrail_false | OK | False |

## Guardrails

- Real payment executed: `False`
- External contact executed: `False`

## Interpretation

The daily machine-buyer monitor passed on 2026-06-03. The public discovery layer, stored monitor beta key, authenticated flow, target discovery, scoring, recommended beta add-on, orders and usage checks are all operational.

The flow remains machine-to-machine: no real payment and no external target contact were executed.

