# MachineSignal Company Brain Public Observation NoWrite - 2026-06-14

## Scope

This probe observes public machine-readable surfaces and compares them with the internal Company Brain.

It performs no writes, no payments, no invoices, no outreach and no real or personal data processing.

## Result

Status: pass
Checks: 54
Failed: 0

## Evidence

- Company Brain version: 2026-06-14-internal-v1
- Graph version: 2026-06-14-internal-v1
- Graph nodes: 28
- Graph edges: 27
- Public catalog version: 2026-06-14-beta-v22

## Failed Checks

None.

## Checks

- PASS fetch_llms: 200 https://machinesignal.it/llms.txt
- PASS fetch_productCatalog: 200 https://machinesignal.it/product-catalog.json
- PASS fetch_machineOnboarding: 200 https://machinesignal.it/machine-onboarding.json
- PASS fetch_openapi: 200 https://machinesignal.it/openapi.json
- PASS fetch_postman: 200 https://machinesignal.it/postman_public_collection.json
- PASS fetch_machineDiscoveryPack: 200 https://machinesignal.it/machine-discovery/machine-discovery-pack.json
- PASS fetch_sandboxDocsMarkdown: 200 https://machinesignal.it/SANDBOX_PUBLIC_DOCS.md
- PASS fetch_sandboxDocsJson: 200 https://machinesignal.it/sandbox-public-docs.json
- PASS company_brain_phase_is_sandbox_public_docs_only: sandbox-public-docs-only
- PASS company_brain_blocks_paid_beta: not_approved
- PASS company_brain_blocks_go_live: no_go
- PASS graph_has_no_broken_edges: 0 broken edges
- PASS graph_remembers_future_visualization: planned_not_started
- PASS public_catalog_version_matches_company_brain: 2026-06-14-beta-v22
- PASS public_catalog_machine_interface: machine
- PASS public_catalog_no_real_payment: false
- PASS public_catalog_no_external_contact: false
- PASS catalog_price_target_discovery_pack_250: 249
- PASS catalog_price_score_pack_1k: 119
- PASS catalog_price_domain_enrichment_pack_100: 149
- PASS catalog_price_deep_analysis_pack_100: 349
- PASS catalog_price_action_pack_25: 399
- PASS catalog_price_opportunity_feed_monthly: 249
- PASS catalog_price_api_starter_monthly: 99
- PASS catalog_price_api_pro_monthly: 499
- PASS sandbox_docs_json_status: sandbox-public-docs-only
- PASS sandbox_docs_json_blocks_go_live: false
- PASS sandbox_docs_json_blocks_payment: false
- PASS sandbox_docs_json_blocks_invoice: false
- PASS sandbox_docs_json_blocks_payment_method_collection: false
- PASS sandbox_docs_json_blocks_outreach: false
- PASS sandbox_docs_json_blocks_real_data: false
- PASS sandbox_docs_json_blocks_personal_data: false
- PASS llms_points_to_catalog: llms catalog link
- PASS llms_mentions_sandbox_only: llms sandbox marker
- PASS llms_blocks_go_live: llms go-live block
- PASS llms_mentions_no_real_payments: llms real payments marker
- PASS sandbox_markdown_mentions_sandbox_only: markdown status marker
- PASS sandbox_markdown_mentions_no_live_payment_page: markdown live payment marker
- PASS sandbox_markdown_mentions_blocked_actions: markdown blocked marker
- PASS openapi_mentions_score_endpoint: OpenAPI score endpoint
- PASS openapi_mentions_purchase_intent: OpenAPI purchase intent endpoint
- PASS postman_mentions_score_endpoint: Postman score endpoint
- PASS machine_discovery_mentions_machine_signal: Machine discovery brand
- PASS no_forbidden_live_signal_llms: no forbidden live phrase found
- PASS no_forbidden_live_signal_productCatalog: no forbidden live phrase found
- PASS no_forbidden_live_signal_machineOnboarding: no forbidden live phrase found
- PASS no_forbidden_live_signal_openapi: no forbidden live phrase found
- PASS no_forbidden_live_signal_postman: no forbidden live phrase found
- PASS no_forbidden_live_signal_machineDiscoveryPack: no forbidden live phrase found
- PASS no_forbidden_live_signal_sandboxDocsMarkdown: no forbidden live phrase found
- PASS no_forbidden_live_signal_sandboxDocsJson: no forbidden live phrase found
- PASS machine_onboarding_mentions_multiple_products: 8 products referenced
- PASS product_catalog_mentions_multiple_products: 8 products referenced

## Guardrails Confirmed

- Writes performed: 0
- Real payment executed: false
- Invoice issued: false
- External outreach executed: false
- Real data processed: false
- Personal data processed: false

## Recommendation

Continue sandbox-only testing. Do not move to paid beta, public marketplace, hosted MCP or real-data processing without owner approval.
