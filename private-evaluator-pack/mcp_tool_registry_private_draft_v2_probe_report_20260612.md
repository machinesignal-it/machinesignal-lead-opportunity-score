# MCP Tool Registry Private Draft v2 Probe

Date: 2026-06-12

Status: completed_mcp_tool_registry_private_draft_v2_probe
Mode: NoPublishNoWriteNoHostedMcpNoPaymentNoOutreachNoRealData

## Result

- Checks total: 110
- Checks failed: 0
- Public read-only tools checked: 18
- Sandbox write tools blocked checked: 4
- Protected read tools checked: 6
- Admin tools blocked checked: 1
- MCP registry submission executed: 0
- Hosted MCP launch executed: 0
- External marketplace publication executed: 0
- External send executed: 0
- MachineSignal API POST calls executed: 0
- Payment executed: 0
- Credits consumed: 0
- Personal data used: 0

## Interpretation

The v2 MCP/tool-registry private draft is registry-ready for owner review while remaining unpublished, local-adapter-first, sandbox-bounded and machine-first.

## Recommended Next Step

Keep this as the current private registry-ready MCP draft. Next, run an agent go/no-go review before any external registry submission or hosted MCP build decision.

## Failed Checks

None.

## Checks

- PASS - draft_status_private_not_published: private_draft_ready_not_submitted_not_published
- PASS - business_rule_machine_not_human: sell_to_machines_not_humans
- PASS - primary_customer_interface_machine: machine
- PASS - github_metadata_description_matches_applied: Machine-first lead opportunity scoring API for CRMs, AI agents, MCP clients and workflows. Sandbox-only beta: no outreach or live billing.
- PASS - github_metadata_homepage_matches_applied: https://machinesignal.it/machine-discovery/
- PASS - github_metadata_topics_include_mcp_and_sandbox: ai-agents,api,crm,data-enrichment,lead-scoring,machine-first,machine-readable,mcp,openapi,opportunity-scoring,revops,workflow-automation,sandbox-beta
- PASS - official_context_has_stable_spec_basis: 2025-11-25
- PASS - official_context_monitors_2026_release_candidate: 2026-07-28 release candidate monitored
- PASS - official_context_sources_present: https://modelcontextprotocol.io/specification/2025-11-25,https://modelcontextprotocol.io/specification/draft/server/tools,https://modelcontextprotocol.io/docs/tutorials/security/authorization,https://blog.modelcontextprotocol.io/posts/2026-07-28-release-candidate/
- PASS - listing_name_present: MachineSignal Lead Opportunity Score
- PASS - listing_visibility_private: private_draft_or_unsubmitted
- PASS - listing_long_description_sandbox_bounded: MachineSignal helps customer machines decide which companies or domains deserve commercial attention. It exposes machine-readable products for target discovery, lead opportunity scoring, domain enrichment, deep analysis and CRM/workflow action packs. The current channel is sandbox/private-draft only: local stdio adapter available, hosted public MCP not live, registry submission blocked, live billing disabled, production keys blocked, no external contact, no human outreach and no real customer or personal data processing.
- PASS - listing_long_description_blocks_outreach: outreach blockers present
- PASS - listing_keywords_machine_safe: machine-first,machine-readable,lead-scoring,opportunity-scoring,ai-agents,crm,revops,mcp,openapi,workflow-automation,data-enrichment,sandbox-beta
- PASS - transport_current_local_stdio: local_stdio_adapter
- PASS - transport_hosted_mcp_not_live: hosted MCP blocked
- PASS - transport_remote_requirements_before_launch: requirements=8
- PASS - transport_requires_authorization: authorization requirement present
- PASS - public_read_tool_exists_get_product_catalog: get_product_catalog
- PASS - public_read_tool_get_or_readonly_get_product_catalog: method=GET; auth=none
- PASS - public_read_tool_exists_get_machine_onboarding: get_machine_onboarding
- PASS - public_read_tool_get_or_readonly_get_machine_onboarding: method=GET; auth=none
- PASS - public_read_tool_exists_get_machine_api_sandbox_test: get_machine_api_sandbox_test
- PASS - public_read_tool_get_or_readonly_get_machine_api_sandbox_test: method=GET; auth=none
- PASS - public_read_tool_exists_get_dentists_beta_pack: get_dentists_beta_pack
- PASS - public_read_tool_get_or_readonly_get_dentists_beta_pack: method=GET; auth=none
- PASS - public_read_tool_exists_get_machine_buyer_evidence_brief: get_machine_buyer_evidence_brief
- PASS - public_read_tool_get_or_readonly_get_machine_buyer_evidence_brief: method=GET; auth=none
- PASS - public_read_tool_exists_get_mcp_tool_registry_draft_checklist: get_mcp_tool_registry_draft_checklist
- PASS - public_read_tool_get_or_readonly_get_mcp_tool_registry_draft_checklist: method=GET; auth=none
- PASS - public_read_tool_exists_get_machine_deep_analysis_single_purchase_proof: get_machine_deep_analysis_single_purchase_proof
- PASS - public_read_tool_get_or_readonly_get_machine_deep_analysis_single_purchase_proof: method=GET; auth=none
- PASS - public_read_tool_exists_get_machine_action_pack_single_purchase_proof: get_machine_action_pack_single_purchase_proof
- PASS - public_read_tool_get_or_readonly_get_machine_action_pack_single_purchase_proof: method=GET; auth=none
- PASS - public_read_tool_exists_get_public_sandbox_claims_no_write_review: get_public_sandbox_claims_no_write_review
- PASS - public_read_tool_get_or_readonly_get_public_sandbox_claims_no_write_review: method=GET; auth=none
- PASS - public_read_tool_exists_get_external_submission_pack_no_write_review: get_external_submission_pack_no_write_review
- PASS - public_read_tool_get_or_readonly_get_external_submission_pack_no_write_review: method=GET; auth=none
- PASS - public_read_tool_exists_get_external_draft_submission_bundle: get_external_draft_submission_bundle
- PASS - public_read_tool_get_or_readonly_get_external_draft_submission_bundle: method=GET; auth=none
- PASS - public_read_tool_exists_get_private_draft_submission_rehearsal: get_private_draft_submission_rehearsal
- PASS - public_read_tool_get_or_readonly_get_private_draft_submission_rehearsal: method=GET; auth=none
- PASS - public_read_tool_exists_get_api_directory_private_draft_pack: get_api_directory_private_draft_pack
- PASS - public_read_tool_get_or_readonly_get_api_directory_private_draft_pack: method=GET; auth=none
- PASS - public_read_tool_exists_get_api_directory_private_draft_review: get_api_directory_private_draft_review
- PASS - public_read_tool_get_or_readonly_get_api_directory_private_draft_review: method=GET; auth=none
- PASS - public_read_tool_exists_get_rapidapi_unpublished_provider_draft_pack: get_rapidapi_unpublished_provider_draft_pack
- PASS - public_read_tool_get_or_readonly_get_rapidapi_unpublished_provider_draft_pack: method=GET; auth=none
- PASS - public_read_tool_exists_get_rapidapi_unpublished_provider_draft_review: get_rapidapi_unpublished_provider_draft_review
- PASS - public_read_tool_get_or_readonly_get_rapidapi_unpublished_provider_draft_review: method=GET; auth=none
- PASS - public_read_tool_exists_get_mcp_tool_registry_private_draft_pack: get_mcp_tool_registry_private_draft_pack
- PASS - public_read_tool_get_or_readonly_get_mcp_tool_registry_private_draft_pack: method=GET; auth=none
- PASS - public_read_tool_exists_get_mcp_tool_registry_private_draft_review: get_mcp_tool_registry_private_draft_review
- PASS - public_read_tool_get_or_readonly_get_mcp_tool_registry_private_draft_review: method=GET; auth=none
- PASS - blocked_write_tool_exists_create_sandbox_customer: create_sandbox_customer
- PASS - blocked_write_tool_is_post_create_sandbox_customer: method=POST
- PASS - blocked_write_tool_exists_score_lead_opportunity: score_lead_opportunity
- PASS - blocked_write_tool_is_post_score_lead_opportunity: method=POST
- PASS - blocked_write_tool_exists_create_purchase_intent: create_purchase_intent
- PASS - blocked_write_tool_is_post_create_purchase_intent: method=POST
- PASS - blocked_write_tool_exists_create_payment_test_intent: create_payment_test_intent
- PASS - blocked_write_tool_is_post_create_payment_test_intent: method=POST
- PASS - protected_read_tool_exists_get_customer_onboarding: get_customer_onboarding
- PASS - protected_read_tool_exists_list_orders: list_orders
- PASS - protected_read_tool_exists_get_order: get_order
- PASS - protected_read_tool_exists_get_usage: get_usage
- PASS - protected_read_tool_exists_get_payment_test_intent: get_payment_test_intent
- PASS - protected_read_tool_exists_get_payment_test_reconciliation: get_payment_test_reconciliation
- PASS - admin_blocked_tool_exists_get_admin_sandbox_metrics: get_admin_sandbox_metrics
- PASS - product_map_has_five_routes: routes=5
- PASS - product_map_includes_target_discovery_pack_250: target_discovery_pack_250
- PASS - product_selector_contains_target_discovery_pack_250: target_discovery_pack_250
- PASS - product_map_includes_score_pack_1k: score_pack_1k
- PASS - product_selector_contains_score_pack_1k: score_pack_1k
- PASS - product_map_includes_domain_enrichment_pack_100: domain_enrichment_pack_100
- PASS - product_selector_contains_domain_enrichment_pack_100: domain_enrichment_pack_100
- PASS - product_map_includes_deep_analysis_pack_100: deep_analysis_pack_100
- PASS - product_selector_contains_deep_analysis_pack_100: deep_analysis_pack_100
- PASS - product_map_includes_action_pack_25: action_pack_25
- PASS - product_selector_contains_action_pack_25: action_pack_25
- PASS - target_discovery_requires_250_and_objective: target discovery preconditions
- PASS - deep_analysis_requires_score_confidence_gate: deep analysis gate
- PASS - action_pack_requires_deep_gate: action pack deep gate
- PASS - go_no_go_blocks_public_registry_submission: public registry submission
- PASS - go_no_go_blocks_hosted_public_MCP_launch: hosted public MCP launch
- PASS - go_no_go_blocks_live_monetization: live monetization
- PASS - go_no_go_blocks_real_payment: real payment
- PASS - go_no_go_blocks_invoices: invoices
- PASS - go_no_go_blocks_production_API_keys: production API keys
- PASS - go_no_go_blocks_automatic_outreach: automatic outreach
- PASS - go_no_go_blocks_external_target_contact: external target contact
- PASS - go_no_go_blocks_personal_data: personal data
- PASS - go_no_go_blocks_real_customer_data: real customer data
- PASS - go_no_go_blocks_real_lead_lists: real lead lists
- PASS - counter_mcp_registry_submission_executed_zero: mcp_registry_submission_executed=0
- PASS - counter_hosted_mcp_launch_executed_zero: hosted_mcp_launch_executed=0
- PASS - counter_external_marketplace_publication_executed_zero: external_marketplace_publication_executed=0
- PASS - counter_external_send_executed_zero: external_send_executed=0
- PASS - counter_human_outreach_executed_zero: human_outreach_executed=0
- PASS - counter_machinesignal_api_post_calls_executed_zero: machinesignal_api_post_calls_executed=0
- PASS - counter_machinesignal_api_write_calls_executed_zero: machinesignal_api_write_calls_executed=0
- PASS - counter_payment_executed_zero: payment_executed=0
- PASS - counter_invoice_issued_zero: invoice_issued=0
- PASS - counter_credits_consumed_zero: credits_consumed=0
- PASS - counter_production_key_published_zero: production_key_published=0
- PASS - counter_personal_data_used_zero: personal_data_used=0
- PASS - counter_real_customer_data_used_zero: real_customer_data_used=0
- PASS - counter_real_lead_list_used_zero: real_lead_list_used=0
- PASS - machine_decision_private_review_only: ready_for_private_mcp_tool_registry_review_only
- PASS - machine_decision_blocks_submit_and_launch: registry submit,hosted MCP launch,live payment,production key sharing,outreach,real data processing

