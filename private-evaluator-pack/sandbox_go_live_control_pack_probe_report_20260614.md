# Sandbox Go-Live Control Pack Probe - 2026-06-14

Status: pass

Checks: 66
Failed: 0

## Result

The control pack is internally consistent for a NoWrite sandbox go-live preparation. It does not authorize commercial go-live, payment collection, invoices, real data, personal data, outreach, production keys, marketplace publication or hosted MCP.

## Checks

| Check | Status | Severity | Detail |
|---|---:|---:|---|
| pack_exists | pass | P0 | private-evaluator-pack/sandbox_go_live_control_pack_20260614.json |
| status_not_live | pass | P0 | commercial_status=not_live |
| commercial_go_live_no_go | pass | P0 | go_live_decision=no_go_for_commercial_go_live |
| allowed_stage_sandbox_only | pass | P0 | allowed_stage=technical_sandbox_go_live_rehearsal_only |
| real_payment_blocked | pass | P0 | payment_collection_allowed must be false |
| invoice_blocked | pass | P0 | invoice_issuance_allowed must be false |
| personal_data_blocked | pass | P0 | personal_data_allowed must be false |
| real_customer_data_blocked | pass | P0 | real_customer_data_allowed must be false |
| external_contact_blocked | pass | P0 | external_contact_allowed must be false |
| idempotency_required | pass | P0 | idempotency_required_for_post must be true |
| post_cap_bounded | pass | P0 | max_post_calls=5 |
| openapi_has_POST_/v1/sandbox/customers | pass | P0 | POST /v1/sandbox/customers |
| post_requires_idempotency_/v1/sandbox/customers | pass | P0 | /v1/sandbox/customers requires_idempotency_key=true |
| post_write_cap_bounded_/v1/sandbox/customers | pass | P0 | /v1/sandbox/customers write_cap=1 |
| no_real_payment_/v1/sandbox/customers | pass | P0 | /v1/sandbox/customers real_payment=false |
| no_real_data_/v1/sandbox/customers | pass | P0 | /v1/sandbox/customers real_data_allowed=false |
| openapi_has_GET_/v1/onboarding | pass | P0 | GET /v1/onboarding |
| no_real_payment_/v1/onboarding | pass | P0 | /v1/onboarding real_payment=false |
| no_real_data_/v1/onboarding | pass | P0 | /v1/onboarding real_data_allowed=false |
| openapi_has_POST_/v1/lead-opportunity-score | pass | P0 | POST /v1/lead-opportunity-score |
| post_requires_idempotency_/v1/lead-opportunity-score | pass | P0 | /v1/lead-opportunity-score requires_idempotency_key=true |
| post_write_cap_bounded_/v1/lead-opportunity-score | pass | P0 | /v1/lead-opportunity-score write_cap=3 |
| no_real_payment_/v1/lead-opportunity-score | pass | P0 | /v1/lead-opportunity-score real_payment=false |
| no_real_data_/v1/lead-opportunity-score | pass | P0 | /v1/lead-opportunity-score real_data_allowed=false |
| openapi_has_POST_/v1/purchase-intent | pass | P0 | POST /v1/purchase-intent |
| post_requires_idempotency_/v1/purchase-intent | pass | P0 | /v1/purchase-intent requires_idempotency_key=true |
| post_write_cap_bounded_/v1/purchase-intent | pass | P0 | /v1/purchase-intent write_cap=2 |
| no_real_payment_/v1/purchase-intent | pass | P0 | /v1/purchase-intent real_payment=false |
| no_real_data_/v1/purchase-intent | pass | P0 | /v1/purchase-intent real_data_allowed=false |
| openapi_has_GET_/v1/orders/{order_intent_id} | pass | P0 | GET /v1/orders/{order_intent_id} |
| no_real_payment_/v1/orders/{order_intent_id} | pass | P0 | /v1/orders/{order_intent_id} real_payment=false |
| no_real_data_/v1/orders/{order_intent_id} | pass | P0 | /v1/orders/{order_intent_id} real_data_allowed=false |
| openapi_has_GET_/v1/usage | pass | P0 | GET /v1/usage |
| no_real_payment_/v1/usage | pass | P0 | /v1/usage real_payment=false |
| no_real_data_/v1/usage | pass | P0 | /v1/usage real_data_allowed=false |
| excluded_present_/v1/payment-test/intents | pass | P1 | /v1/payment-test/intents is explicitly excluded from public sandbox |
| excluded_present_/v1/payment-test/intents/{payment_test_id} | pass | P1 | /v1/payment-test/intents/{payment_test_id} is explicitly excluded from public sandbox |
| excluded_present_/v1/payment-test/webhooks/stripe | pass | P1 | /v1/payment-test/webhooks/stripe is explicitly excluded from public sandbox |
| excluded_present_/v1/payment-test/reconciliation/{payment_test_id} | pass | P1 | /v1/payment-test/reconciliation/{payment_test_id} is explicitly excluded from public sandbox |
| excluded_present_/v1/admin/payment-test-report | pass | P1 | /v1/admin/payment-test-report is explicitly excluded from public sandbox |
| excluded_present_/v1/beta/customers | pass | P1 | /v1/beta/customers is explicitly excluded from public sandbox |
| excluded_present_/v1/beta/customers/{customer_id} | pass | P1 | /v1/beta/customers/{customer_id} is explicitly excluded from public sandbox |
| excluded_present_production_api_keys | pass | P1 | production_api_keys is explicitly excluded from public sandbox |
| excluded_present_hosted_public_mcp | pass | P1 | hosted_public_mcp is explicitly excluded from public sandbox |
| excluded_present_mcp_registry_submission | pass | P1 | mcp_registry_submission is explicitly excluded from public sandbox |
| excluded_present_public_paid_marketplace_submission | pass | P1 | public_paid_marketplace_submission is explicitly excluded from public sandbox |
| must_say_technical sandbox | pass | P2 | technical sandbox |
| must_say_no real payment | pass | P2 | no real payment |
| must_say_no invoice | pass | P2 | no invoice |
| must_say_no personal data | pass | P2 | no personal data |
| must_say_synthetic/demo data only | pass | P2 | synthetic/demo data only |
| must_say_machine-readable API evaluation | pass | P2 | machine-readable API evaluation |
| must_not_say_ready to buy now | pass | P2 | ready to buy now |
| must_not_say_fully compliant | pass | P2 | fully compliant |
| must_not_say_GDPR approved | pass | P2 | GDPR approved |
| must_not_say_production API key available | pass | P2 | production API key available |
| must_not_say_hosted MCP live | pass | P2 | hosted MCP live |
| must_not_say_public marketplace live | pass | P2 | public marketplace live |
| must_not_say_guaranteed revenue | pass | P2 | guaranteed revenue |
| must_not_say_we contact leads for you | pass | P2 | we contact leads for you |
| required_asset_machine-onboarding.json | pass | P0 | machine-onboarding.json |
| required_asset_product-catalog.json | pass | P0 | product-catalog.json |
| required_asset_openapi.json | pass | P0 | openapi.json |
| required_asset_postman_public_collection.json | pass | P0 | postman_public_collection.json |
| required_asset_llms.txt | pass | P0 | llms.txt |
| required_asset_private-evaluator-pack/test_phase_completion_gate_nowrite_20260614.md | pass | P0 | private-evaluator-pack/test_phase_completion_gate_nowrite_20260614.md |

## Next Step

bounded_sandbox_go_live_rehearsal_nowrite_or_write_capped_with_owner_approval