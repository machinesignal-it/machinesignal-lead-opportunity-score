# GitHub Repo Discoverability Probe

Date: 2026-06-12

Status: completed_github_first_discoverability_probe
Mode: GitHubRawReadOnlyNoWriteNoPostNoPaymentNoPersonalData
Primary customer interface: machine

## What Was Tested

This probe simulates a machine starting from the GitHub repository, using raw GitHub files as the first source of truth. It does not use the website as the primary entrypoint.

Files fetched from GitHub raw:
- README.md
- MACHINE_AGENT_ENTRYPOINT.md
- MACHINE_AGENT_ENTRYPOINT.json
- private-evaluator-pack/product_selector_contract.json
- private-evaluator-pack/mcp_channel_entrypoint_draft_nopublish.json
- private-evaluator-pack/channel_selection_matrix_20260612.json
- mcp-tool-manifest.json
- MCP_TOOL_CONTRACT.md
- mcp_adapter/README.md

## Result

- Checks total: 113
- Checks failed: 0
- External publication executed: 0
- External send executed: 0
- POST calls executed: 0
- Write calls executed: 0
- Payment executed: 0
- Credits consumed: 0
- Personal data used: 0

## Interpretation

A machine can start from GitHub raw repository files, find the machine-first entrypoint, understand product routing, understand MCP/local-adapter status, identify read-only public tools versus blocked write tools, and preserve NoPublish/NoSend/NoPayment/NoPersonalData boundaries.

## Recommended Next Step

Prepare an owner-approved public-safe GitHub repository metadata proposal, or run an agent go/no-go review before changing public GitHub description, topics or external distribution.

## Failed Checks

None.

## Checks

- PASS - github_raw_reachable_README.md: HTTP 200, bytes=67250
- PASS - github_raw_reachable_MACHINE_AGENT_ENTRYPOINT.md: HTTP 200, bytes=4048
- PASS - github_raw_reachable_MACHINE_AGENT_ENTRYPOINT.json: HTTP 200, bytes=4391
- PASS - github_raw_reachable_private-evaluator-pack_product_selector_contract.json: HTTP 200, bytes=7734
- PASS - github_raw_reachable_private-evaluator-pack_mcp_channel_entrypoint_draft_nopublish.json: HTTP 200, bytes=8792
- PASS - github_raw_reachable_private-evaluator-pack_channel_selection_matrix_20260612.json: HTTP 200, bytes=8007
- PASS - github_raw_reachable_mcp-tool-manifest.json: HTTP 200, bytes=130283
- PASS - github_raw_reachable_MCP_TOOL_CONTRACT.md: HTTP 200, bytes=6446
- PASS - github_raw_reachable_mcp_adapter_README.md: HTTP 200, bytes=2552
- PASS - json_valid_MACHINE_AGENT_ENTRYPOINT.json: valid JSON
- PASS - json_valid_private-evaluator-pack_product_selector_contract.json: valid JSON
- PASS - json_valid_private-evaluator-pack_mcp_channel_entrypoint_draft_nopublish.json: valid JSON
- PASS - json_valid_private-evaluator-pack_channel_selection_matrix_20260612.json: valid JSON
- PASS - json_valid_mcp-tool-manifest.json: valid JSON
- PASS - readme_has_machine_reader_quick_start: README exposes a machine-first section
- PASS - readme_links_MACHINE_AGENT_ENTRYPOINT.md: MACHINE_AGENT_ENTRYPOINT.md
- PASS - readme_links_MACHINE_AGENT_ENTRYPOINT.json: MACHINE_AGENT_ENTRYPOINT.json
- PASS - readme_links_private-evaluator-pack_product_selector_contract.json: private-evaluator-pack/product_selector_contract.json
- PASS - readme_links_private-evaluator-pack_mcp_channel_entrypoint_draft_nopublish.json: private-evaluator-pack/mcp_channel_entrypoint_draft_nopublish.json
- PASS - entrypoint_json_status_is_non_live_offer: status=public_github_documentation_draft_not_live_offer
- PASS - entrypoint_json_business_rule_machine_not_human: business_rule=sell_to_machines_not_humans
- PASS - entrypoint_safety_external_send_allowed: external_send_allowed=false
- PASS - entrypoint_safety_human_outreach_allowed: human_outreach_allowed=false
- PASS - entrypoint_safety_marketplace_publication_allowed: marketplace_publication_allowed=false
- PASS - entrypoint_safety_mcp_registry_submission_allowed: mcp_registry_submission_allowed=false
- PASS - entrypoint_safety_hosted_public_mcp_live: hosted_public_mcp_live=false
- PASS - entrypoint_safety_live_payment_allowed: live_payment_allowed=false
- PASS - entrypoint_safety_invoice_allowed: invoice_allowed=false
- PASS - entrypoint_safety_subscription_allowed: subscription_allowed=false
- PASS - entrypoint_safety_production_key_distribution_allowed: production_key_distribution_allowed=false
- PASS - entrypoint_safety_personal_data_allowed: personal_data_allowed=false
- PASS - entrypoint_safety_real_customer_data_allowed: real_customer_data_allowed=false
- PASS - entrypoint_safety_real_lead_list_allowed: real_lead_list_allowed=false
- PASS - entrypoint_read_order_includes_product-catalog.json: product-catalog.json
- PASS - entrypoint_read_order_includes_machine-onboarding.json: machine-onboarding.json
- PASS - entrypoint_read_order_includes_openapi.json: openapi.json
- PASS - entrypoint_read_order_includes_mcp-tool-manifest.json: mcp-tool-manifest.json
- PASS - entrypoint_read_order_includes_MCP_TOOL_CONTRACT.md: MCP_TOOL_CONTRACT.md
- PASS - entrypoint_read_order_includes_mcp_adapter_README.md: mcp_adapter/README.md
- PASS - entrypoint_read_order_includes_private-evaluator-pack_product_selector_contract.json: private-evaluator-pack/product_selector_contract.json
- PASS - entrypoint_read_order_includes_private-evaluator-pack_mcp_channel_entrypoint_draft_nopublish.json: private-evaluator-pack/mcp_channel_entrypoint_draft_nopublish.json
- PASS - entrypoint_product_route_no_starting_list: no_starting_list=>target_discovery_pack_250
- PASS - entrypoint_product_route_existing_domain_or_company_list: existing_domain_or_company_list=>score_pack_1k
- PASS - entrypoint_product_route_company_names_without_reliable_domains: company_names_without_reliable_domains=>domain_enrichment_pack_100
- PASS - entrypoint_product_route_score_gte_75_and_confidence_gte_0_75: score_gte_75_and_confidence_gte_0_75=>deep_analysis_pack_100
- PASS - entrypoint_product_route_deep_analysis_gate_confirmed: deep_analysis_gate_confirmed=>action_pack_25
- PASS - product_selector_status_is_simulated_not_live: status=machine_readable_simulated_pricing_not_live_offer
- PASS - product_selector_global_rule_prices_are_simulated: prices_are_simulated=true
- PASS - product_selector_global_rule_live_checkout_enabled: live_checkout_enabled=false
- PASS - product_selector_global_rule_real_payment_allowed: real_payment_allowed=false
- PASS - product_selector_global_rule_invoice_allowed: invoice_allowed=false
- PASS - product_selector_global_rule_credit_consumption_allowed: credit_consumption_allowed=false
- PASS - product_selector_global_rule_post_execution_allowed_in_this_pack: post_execution_allowed_in_this_pack=false
- PASS - product_selector_global_rule_write_execution_allowed_in_this_pack: write_execution_allowed_in_this_pack=false
- PASS - product_selector_global_rule_personal_data_allowed: personal_data_allowed=false
- PASS - product_selector_global_rule_real_lead_data_allowed: real_lead_data_allowed=false
- PASS - product_selector_has_target_discovery_pack_250: target_discovery_pack_250
- PASS - product_selector_price_target_discovery_pack_250: price=149
- PASS - product_selector_output_clear_target_discovery_pack_250: 250 coherent synthetic/evaluator targets if pre-check passes; otherwise no activation and suggested alternatives.
- PASS - product_selector_has_score_pack_1k: score_pack_1k
- PASS - product_selector_price_score_pack_1k: price=99
- PASS - product_selector_output_clear_score_pack_1k: 1000 valid scores with opportunity_score, confidence, decision, spend_policy, reason, priority and next_purchase.
- PASS - product_selector_has_domain_enrichment_pack_100: domain_enrichment_pack_100
- PASS - product_selector_price_domain_enrichment_pack_100: price=149
- PASS - product_selector_output_clear_domain_enrichment_pack_100: 100 completed domain-enrichment decisions with status, confidence, candidate domain and reason.
- PASS - product_selector_has_deep_analysis_pack_100: deep_analysis_pack_100
- PASS - product_selector_price_deep_analysis_pack_100: price=299
- PASS - product_selector_output_clear_deep_analysis_pack_100: 100 valid Deep Analysis outputs with evidence, decision matrix, action gate, stop rules and next_machine_call.
- PASS - product_selector_has_action_pack_25: action_pack_25
- PASS - product_selector_price_action_pack_25: price=399
- PASS - product_selector_output_clear_action_pack_25: 25 CRM/workflow payloads with record patch, task, webhook event, agent instruction, approval gate and compliance guardrail.
- PASS - target_discovery_requires_objective_and_250: Target Discovery requires objective and exactly 250 requested targets
- PASS - score_pack_tracks_valid_credit_rule: Score Pack includes 1000 valid scores; invalid or duplicate records do not consume valid score credits
- PASS - deep_analysis_thresholds_clear: Deep Analysis threshold score>=75 and confidence>=0.75
- PASS - action_pack_deep_gate_clear: Action Pack only after confirmed Deep Analysis gate
- PASS - mcp_channel_status_is_nopublish_nowrite: status=draft_nopublish_nosend_nowrite_simulation_only
- PASS - mcp_channel_business_rule_machine_not_human: business_rule=sell_to_machines_not_humans
- PASS - mcp_channel_hosted_not_live: public hosted MCP is not live
- PASS - mcp_channel_local_adapter_available: local stdio adapter available
- PASS - mcp_channel_registry_submission_blocked: registry submission blocked
- PASS - mcp_channel_blocks_mcp_registry_submission: mcp_registry_submission
- PASS - mcp_channel_blocks_hosted_mcp_launch: hosted_mcp_launch
- PASS - mcp_channel_blocks_public_marketplace_publication: public_marketplace_publication
- PASS - mcp_channel_blocks_external_send: external_send
- PASS - mcp_channel_blocks_human_outreach: human_outreach
- PASS - mcp_channel_blocks_live_payment: live_payment
- PASS - mcp_channel_blocks_invoice: invoice
- PASS - mcp_channel_blocks_subscription: subscription
- PASS - mcp_channel_blocks_sandbox_customer_creation_in_this_probe: sandbox_customer_creation_in_this_probe
- PASS - mcp_channel_blocks_score_call_execution_in_this_probe: score_call_execution_in_this_probe
- PASS - mcp_channel_blocks_ledger_write: ledger_write
- PASS - mcp_channel_blocks_credit_consumption: credit_consumption
- PASS - mcp_channel_blocks_personal_data_processing: personal_data_processing
- PASS - channel_matrix_primary_mcp_companion_github: primary=mcp_tool_registry_draft, companion=github_machine_docs
- PASS - channel_matrix_external_publication_blocked: external publication and writes are blocked
- PASS - mcp_manifest_has_read_only_public_tools: read_only_public_tools=20
- PASS - mcp_manifest_has_write_tool_create_sandbox_customer: create_sandbox_customer method=POST
- PASS - mcp_manifest_has_write_tool_score_lead_opportunity: score_lead_opportunity method=POST
- PASS - mcp_manifest_has_write_tool_create_purchase_intent: create_purchase_intent method=POST
- PASS - mcp_manifest_has_write_tool_create_payment_test_intent: create_payment_test_intent method=POST
- PASS - mcp_manifest_hosted_public_mcp_not_live: public_mcp_server_live=false
- PASS - mcp_manifest_local_adapter_available: local_adapter_status=available_in_github_repo
- PASS - mcp_contract_states_hosted_not_live: MCP contract clearly says hosted MCP is not live
- PASS - mcp_contract_states_no_payment_invoice_outreach: MCP contract states payment, invoice and external target blockers
- PASS - mcp_adapter_readme_states_local_and_no_credit_validation: MCP adapter README is clear for a local machine client
- PASS - machine_entrypoint_md_plain_language: Markdown entrypoint is readable and machine-first
- PASS - probe_counter_external_publication_executed_zero: external_publication_executed=0
- PASS - probe_counter_external_send_executed_zero: external_send_executed=0
- PASS - probe_counter_post_calls_executed_zero: post_calls_executed=0
- PASS - probe_counter_write_calls_executed_zero: write_calls_executed=0
- PASS - probe_counter_payment_executed_zero: payment_executed=0
- PASS - probe_counter_credits_consumed_zero: credits_consumed=0
- PASS - probe_counter_personal_data_used_zero: personal_data_used=0

