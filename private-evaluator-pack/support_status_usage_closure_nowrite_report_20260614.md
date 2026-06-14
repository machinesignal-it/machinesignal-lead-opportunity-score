# MachineSignal Support Status Usage Closure NoWrite - 2026-06-14

## Scope

Final NoWrite technical-sandbox closure check focused on support, status, usage and order discoverability for a machine customer.

This probe performs no writes, no POST calls, no payments, no invoices, no outreach and no real or personal data processing.

## Result

Status: pass
Checks: 88
Failed: 0

## Guardrails

- Writes performed: 0
- POST calls executed: 0
- Real payment executed: false
- Invoice issued: false
- External outreach executed: false
- Real data processed: false
- Personal data processed: false
- Commercial go-live: no-go

## Failed Checks

None.

## Checks

- PASS fetch_workerHealth: HTTP 200 https://machinesignal-api.beta-878.workers.dev/health
- PASS fetch_workerOpenApi: HTTP 200 https://machinesignal-api.beta-878.workers.dev/openapi.json
- PASS fetch_workerOnboardingManifest: HTTP 200 https://machinesignal-api.beta-878.workers.dev/machine-onboarding.json
- PASS fetch_publicLlms: HTTP 200 https://machinesignal.it/llms.txt
- PASS fetch_publicOpenApi: HTTP 200 https://machinesignal.it/openapi.json
- PASS fetch_publicOnboarding: HTTP 200 https://machinesignal.it/machine-onboarding.json
- PASS fetch_publicSandboxDocsMarkdown: HTTP 200 https://machinesignal.it/SANDBOX_PUBLIC_DOCS.md
- PASS fetch_publicSandboxDocsJson: HTTP 200 https://machinesignal.it/sandbox-public-docs.json
- PASS fetch_publicCatalog: HTTP 200 https://machinesignal.it/product-catalog.json
- PASS worker_health_json_valid: valid JSON
- PASS publicOpenApi_json_valid: valid JSON
- PASS workerOpenApi_json_valid: valid JSON
- PASS publicOnboarding_json_valid: valid JSON
- PASS workerOnboardingManifest_json_valid: valid JSON
- PASS publicSandboxDocsJson_json_valid: valid JSON
- PASS publicCatalog_json_valid: valid JSON
- PASS worker_health_indicates_service: {
  "status": "ok",
  "service": "MachineSignal Lead Opportunity Score API",
  "beta": true
}
- PASS worker_health_no_payment_or_data_side_effect: health is read-only
- PASS public_openapi_has__v1_usage: /v1/usage
- PASS worker_openapi_has__v1_usage: /v1/usage
- PASS public_openapi_has__v1_orders: /v1/orders
- PASS worker_openapi_has__v1_orders: /v1/orders
- PASS public_openapi_has__v1_orders_order_intent_id_: /v1/orders/{order_intent_id}
- PASS worker_openapi_has__v1_orders_order_intent_id_: /v1/orders/{order_intent_id}
- PASS public_openapi_has__v1_onboarding: /v1/onboarding
- PASS worker_openapi_has__v1_onboarding: /v1/onboarding
- PASS public_onboarding_mentions_usage: usage marker
- PASS public_onboarding_mentions_orders: orders marker
- PASS public_onboarding_mentions_support_or_contact: support/contact marker
- PASS public_onboarding_mentions_machine_first: machine/human role marker
- PASS public_onboarding_blocks_real_payment_or_contact: safety flags marker
- PASS worker_onboarding_mentions_usage: usage marker
- PASS worker_onboarding_mentions_orders: orders marker
- PASS worker_onboarding_mentions_support_or_contact: support/contact marker
- PASS worker_onboarding_mentions_machine_first: machine/human role marker
- PASS worker_onboarding_blocks_real_payment_or_contact: safety flags marker
- PASS sandbox_docs_flag_false_commercial_go_live: false
- PASS sandbox_docs_flag_false_live_monetization_enabled: false
- PASS sandbox_docs_flag_false_real_payment_executed: false
- PASS sandbox_docs_flag_false_real_invoice_issued: false
- PASS sandbox_docs_flag_false_payment_method_collection_enabled: false
- PASS sandbox_docs_flag_false_external_outreach_enabled: false
- PASS sandbox_docs_flag_false_real_data_processing_enabled: false
- PASS sandbox_docs_flag_false_personal_data_processing_enabled: false
- PASS sandbox_docs_flag_false_hosted_mcp_public_enabled: false
- PASS sandbox_docs_flag_false_mcp_registry_publication_enabled: false
- PASS sandbox_docs_flag_false_marketplace_paid_publication_enabled: false
- PASS sandbox_docs_allows_retrieve_sandbox_orders: retrieve_sandbox_orders
- PASS sandbox_docs_allows_retrieve_sandbox_usage: retrieve_sandbox_usage
- PASS sandbox_docs_blocks_real_payments: real_payments
- PASS sandbox_docs_blocks_invoices: invoices
- PASS sandbox_docs_blocks_payment_method_collection: payment_method_collection
- PASS sandbox_docs_blocks_real_customer_data: real_customer_data
- PASS sandbox_docs_blocks_personal_data: personal_data
- PASS sandbox_docs_blocks_external_outreach: external_outreach
- PASS sandbox_docs_blocks_commercial_go_live: commercial_go_live
- PASS sandbox_markdown_mentions_usage: usage
- PASS sandbox_markdown_mentions_orders: orders
- PASS sandbox_markdown_mentions_blocked: blocked
- PASS sandbox_markdown_mentions_no_live_payment: not a live payment page
- PASS sandbox_markdown_mentions_no_commercial_go_live: not a commercial go-live approval
- PASS llms_mentions_health: health marker
- PASS llms_mentions_usage: usage marker
- PASS llms_mentions_orders: orders marker
- PASS llms_mentions_contact_email: contact email marker
- PASS llms_blocks_go_live: go-live block
- PASS catalog_payment_mode_purchase_intent_only: purchase-intent only
- PASS catalog_no_real_payment: false
- PASS catalog_no_external_contact: false
- PASS catalog_credit_rule_valid_output_only: credits are consumed only when the system produces a valid usable output
- PASS company_brain_blocks_real_payments: real_payments
- PASS company_brain_blocks_invoices: invoices
- PASS company_brain_blocks_payment_method_collection: payment_method_collection
- PASS company_brain_blocks_real_customer_data_processing: real_customer_data_processing
- PASS company_brain_blocks_personal_data_processing: personal_data_processing
- PASS company_brain_blocks_external_outreach: external_outreach
- PASS company_brain_blocks_commercial_go_live: commercial_go_live
- PASS company_brain_next_step_still_sandbox_testing: true
- PASS company_brain_paid_commercial_activity_false: false
- PASS no_live_claims_in_workerHealth: none
- PASS no_live_claims_in_workerOpenApi: none
- PASS no_live_claims_in_workerOnboardingManifest: none
- PASS no_live_claims_in_publicLlms: none
- PASS no_live_claims_in_publicOpenApi: none
- PASS no_live_claims_in_publicOnboarding: none
- PASS no_live_claims_in_publicSandboxDocsMarkdown: none
- PASS no_live_claims_in_publicSandboxDocsJson: none
- PASS no_live_claims_in_publicCatalog: none

## Recommendation

Technical sandbox tests can be considered 96-97% complete and ready for owner decision on closure. Paid beta and commercial go-live remain blocked.
