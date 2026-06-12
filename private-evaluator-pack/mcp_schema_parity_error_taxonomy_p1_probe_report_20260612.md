# MCP Schema Parity And Error Taxonomy P1 Probe

Date: 2026-06-12

Status: passed

Mode: local contract validation, NoWrite.

## Result

- checks total: 105
- checks failed: 0
- API tools checked: 11
- hosted MCP build allowed: no
- hosted MCP deploy allowed: no
- registry submission allowed: no
- live billing allowed: no
- credits consumed: no

## API Tool Parity

| Tool | Path | Auth | Idempotency | Required | Properties | Strict fields |
|---|---|---|---|---|---|---|
| create_sandbox_customer | POST /v1/sandbox/customers | OK | OK | OK | OK | - |
| get_customer_onboarding | GET /v1/onboarding | OK | OK | OK | OK | - |
| score_lead_opportunity | POST /v1/lead-opportunity-score | OK | OK | OK | OK | - |
| create_purchase_intent | POST /v1/purchase-intent | OK | OK | OK | OK | - |
| list_orders | GET /v1/orders | OK | OK | OK | OK | - |
| get_order | GET /v1/orders/{order_intent_id} | OK | OK | OK | OK | - |
| get_usage | GET /v1/usage | OK | OK | OK | OK | - |
| create_payment_test_intent | POST /v1/payment-test/intents | OK | OK | OK | OK | amount_eur |
| get_payment_test_intent | GET /v1/payment-test/intents/{payment_test_id} | OK | OK | OK | OK | - |
| get_payment_test_reconciliation | GET /v1/payment-test/reconciliation/{payment_test_id} | OK | OK | OK | OK | - |
| get_admin_sandbox_metrics | GET /v1/admin/sandbox-metrics | OK | OK | OK | OK | - |

## Runtime Negative Errors

| Case | Error |
|---|---|
| unknown_tool | unknown_tool |
| missing_customer_api_key | missing_customer_api_key |
| missing_admin_api_key | missing_admin_api_key |
| method_not_found | Method not found |
| missing_idempotency_key | missing_idempotency_key |

## Interpretation

The local machine-readable contracts pass schema parity and error-taxonomy validation if this report is passed. This does not authorize hosted MCP, registry submission, billing, production keys, real data or outreach.

## Next

verify_public_deployed_contracts_or_prepare_p2_staging_design_only

## Failed Checks

None.
