# MachineSignal Distribution Readiness Monitor - 2026-06-07

Mode: NoWrite

Status: ready_for_distribution_review

Overall OK: True

Alert level: OK

Write calls executed: 0

POST calls executed: 0

## What This Monitor Checks

This monitor verifies that MachineSignal's machine-readable distribution layer is online before external publication preparation:

- marketplace and API directory packs;
- Postman workspace draft;
- MCP manifests and well-known discovery;
- evidence brief and full beta runner evidence;
- llms.txt, robots.txt, sitemap.xml, OpenAPI and Postman collection;
- public files contain no secret-like token patterns.

It performs only public GET requests. It does not create customers, consume credits, execute payments, issue invoices or contact external targets.

## Resources

| Resource | HTTP | JSON valid | Bytes |
|---|---:|---|---:|
| distribution_index | 200 | n/a | 18523 |
| evidence_brief_html | 200 | n/a | 8526 |
| evidence_brief_md | 200 | n/a | 4942 |
| evidence_brief_json | 200 | True | 4415 |
| bounded_beta_runner_json | 200 | True | 109267 |
| sandbox_only_external_publication_pack_md | 200 | n/a | 5741 |
| sandbox_only_external_publication_pack_json | 200 | True | 21714 |
| external_sandbox_publication_drafts_md | 200 | n/a | 7076 |
| external_sandbox_publication_drafts_json | 200 | True | 23217 |
| api_directory_rapidapi_draft_checklist_md | 200 | n/a | 6325 |
| api_directory_rapidapi_draft_checklist_json | 200 | True | 7141 |
| mcp_tool_registry_draft_checklist_md | 200 | n/a | 5569 |
| mcp_tool_registry_draft_checklist_json | 200 | True | 6202 |
| machine_discovery_full_simulation_md | 200 | n/a | 3486 |
| machine_discovery_full_simulation_json | 200 | True | 8211 |
| machine_deep_analysis_single_purchase_md | 200 | n/a | 3793 |
| machine_deep_analysis_single_purchase_json | 200 | True | 9106 |
| machine_action_pack_single_purchase_md | 200 | n/a | 4175 |
| machine_action_pack_single_purchase_json | 200 | True | 10640 |
| public_sandbox_claims_nowrite_review_md | 200 | n/a | 2133 |
| public_sandbox_claims_nowrite_review_json | 200 | True | 15906 |
| external_submission_pack_nowrite_review_md | 200 | n/a | 4552 |
| external_submission_pack_nowrite_review_json | 200 | True | 46838 |
| external_draft_submission_bundle_md | 200 | n/a | 5818 |
| external_draft_submission_bundle_json | 200 | True | 17495 |
| private_draft_submission_rehearsal_md | 200 | n/a | 3067 |
| private_draft_submission_rehearsal_json | 200 | True | 14202 |
| api_directory_private_draft_pack_md | 200 | n/a | 3555 |
| api_directory_private_draft_pack_json | 200 | True | 9808 |
| api_directory_private_draft_review_md | 200 | n/a | 2510 |
| api_directory_private_draft_review_json | 200 | True | 8322 |
| rapidapi_unpublished_provider_draft_pack_md | 200 | n/a | 4123 |
| rapidapi_unpublished_provider_draft_pack_json | 200 | True | 7853 |
| rapidapi_unpublished_provider_draft_review_md | 200 | n/a | 2783 |
| rapidapi_unpublished_provider_draft_review_json | 200 | True | 10630 |
| marketplace_api_directory_pack_md | 200 | n/a | 14870 |
| marketplace_api_directory_pack_json | 200 | True | 29352 |
| marketplace_publication_execution_pack_md | 200 | n/a | 14318 |
| marketplace_publication_execution_pack_json | 200 | True | 26469 |
| api_directory_submission | 200 | True | 14412 |
| rapidapi_listing | 200 | True | 14400 |
| marketplace_submission_pack | 200 | True | 29105 |
| postman_workspace_draft | 200 | True | 9559 |
| postman_private_workspace_checklist_md | 200 | n/a | 4368 |
| postman_private_workspace_checklist_json | 200 | True | 5098 |
| mcp_tool_manifest | 200 | True | 43084 |
| well_known_mcp_tool_manifest | 200 | True | 43084 |
| well_known_machine_discovery | 200 | True | 27616 |
| llms | 200 | n/a | 21842 |
| robots | 200 | n/a | 9543 |
| sitemap | 200 | n/a | 17052 |
| openapi | 200 | True | 58945 |
| postman_public_collection | 200 | True | 27401 |
| product_catalog | 200 | True | 12370 |
| machine_onboarding | 200 | True | 50247 |

## Checks

| Check | Status | Details |
|---|---|---|
| distribution_index_reachable | OK | HTTP 200, bytes=18523 |
| distribution_index_contains_expected_marker | OK | marker=Sandbox-Only Publication Pack |
| distribution_index_secret_scan | OK | public content has no secret-like token patterns |
| evidence_brief_html_reachable | OK | HTTP 200, bytes=8526 |
| evidence_brief_html_contains_expected_marker | OK | marker=Machine-buyer beta flow proven |
| evidence_brief_html_secret_scan | OK | public content has no secret-like token patterns |
| evidence_brief_md_reachable | OK | HTTP 200, bytes=4942 |
| evidence_brief_md_contains_expected_marker | OK | marker=MachineSignal Machine Buyer Evidence Brief |
| evidence_brief_md_secret_scan | OK | public content has no secret-like token patterns |
| evidence_brief_json_reachable | OK | HTTP 200, bytes=4415 |
| evidence_brief_json_json_valid | OK | json_valid=True |
| evidence_brief_json_contains_expected_marker | OK | marker=completed_full |
| evidence_brief_json_secret_scan | OK | public content has no secret-like token patterns |
| bounded_beta_runner_json_reachable | OK | HTTP 200, bytes=109267 |
| bounded_beta_runner_json_json_valid | OK | json_valid=True |
| bounded_beta_runner_json_contains_expected_marker | OK | marker=completed_full |
| bounded_beta_runner_json_secret_scan | OK | public content has no secret-like token patterns |
| sandbox_only_external_publication_pack_md_reachable | OK | HTTP 200, bytes=5741 |
| sandbox_only_external_publication_pack_md_contains_expected_marker | OK | marker=What Remains Blocked |
| sandbox_only_external_publication_pack_md_secret_scan | OK | public content has no secret-like token patterns |
| sandbox_only_external_publication_pack_json_reachable | OK | HTTP 200, bytes=21714 |
| sandbox_only_external_publication_pack_json_json_valid | OK | json_valid=True |
| sandbox_only_external_publication_pack_json_contains_expected_marker | OK | marker=blocked_without_owner_approval |
| sandbox_only_external_publication_pack_json_secret_scan | OK | public content has no secret-like token patterns |
| external_sandbox_publication_drafts_md_reachable | OK | HTTP 200, bytes=7076 |
| external_sandbox_publication_drafts_md_contains_expected_marker | OK | marker=Channel 1: Postman Workspace Draft |
| external_sandbox_publication_drafts_md_secret_scan | OK | public content has no secret-like token patterns |
| external_sandbox_publication_drafts_json_reachable | OK | HTTP 200, bytes=23217 |
| external_sandbox_publication_drafts_json_json_valid | OK | json_valid=True |
| external_sandbox_publication_drafts_json_contains_expected_marker | OK | marker=rapidapi_style_marketplace |
| external_sandbox_publication_drafts_json_secret_scan | OK | public content has no secret-like token patterns |
| api_directory_rapidapi_draft_checklist_md_reachable | OK | HTTP 200, bytes=6325 |
| api_directory_rapidapi_draft_checklist_md_contains_expected_marker | OK | marker=Generic API Directory Fields |
| api_directory_rapidapi_draft_checklist_md_secret_scan | OK | public content has no secret-like token patterns |
| api_directory_rapidapi_draft_checklist_json_reachable | OK | HTTP 200, bytes=7141 |
| api_directory_rapidapi_draft_checklist_json_json_valid | OK | json_valid=True |
| api_directory_rapidapi_draft_checklist_json_contains_expected_marker | OK | marker=draft_pricing_treatment |
| api_directory_rapidapi_draft_checklist_json_secret_scan | OK | public content has no secret-like token patterns |
| mcp_tool_registry_draft_checklist_md_reachable | OK | HTTP 200, bytes=5569 |
| mcp_tool_registry_draft_checklist_md_contains_expected_marker | OK | marker=Registry Listing Fields |
| mcp_tool_registry_draft_checklist_md_secret_scan | OK | public content has no secret-like token patterns |
| mcp_tool_registry_draft_checklist_json_reachable | OK | HTTP 200, bytes=6202 |
| mcp_tool_registry_draft_checklist_json_json_valid | OK | json_valid=True |
| mcp_tool_registry_draft_checklist_json_contains_expected_marker | OK | marker=hosted_mcp_live |
| mcp_tool_registry_draft_checklist_json_secret_scan | OK | public content has no secret-like token patterns |
| machine_discovery_full_simulation_md_reachable | OK | HTTP 200, bytes=3486 |
| machine_discovery_full_simulation_md_contains_expected_marker | OK | marker=Machine Discovery Full Simulation |
| machine_discovery_full_simulation_md_secret_scan | OK | public content has no secret-like token patterns |
| machine_discovery_full_simulation_json_reachable | OK | HTTP 200, bytes=8211 |
| machine_discovery_full_simulation_json_json_valid | OK | json_valid=True |
| machine_discovery_full_simulation_json_contains_expected_marker | OK | marker=completed_full_machine_discovery |
| machine_discovery_full_simulation_json_secret_scan | OK | public content has no secret-like token patterns |
| machine_deep_analysis_single_purchase_md_reachable | OK | HTTP 200, bytes=3793 |
| machine_deep_analysis_single_purchase_md_contains_expected_marker | OK | marker=Machine Deep Analysis Single Purchase |
| machine_deep_analysis_single_purchase_md_secret_scan | OK | public content has no secret-like token patterns |
| machine_deep_analysis_single_purchase_json_reachable | OK | HTTP 200, bytes=9106 |
| machine_deep_analysis_single_purchase_json_json_valid | OK | json_valid=True |
| machine_deep_analysis_single_purchase_json_contains_expected_marker | OK | marker=completed_deep_analysis_single_purchase |
| machine_deep_analysis_single_purchase_json_secret_scan | OK | public content has no secret-like token patterns |
| machine_action_pack_single_purchase_md_reachable | OK | HTTP 200, bytes=4175 |
| machine_action_pack_single_purchase_md_contains_expected_marker | OK | marker=Machine Action Pack Single Purchase |
| machine_action_pack_single_purchase_md_secret_scan | OK | public content has no secret-like token patterns |
| machine_action_pack_single_purchase_json_reachable | OK | HTTP 200, bytes=10640 |
| machine_action_pack_single_purchase_json_json_valid | OK | json_valid=True |
| machine_action_pack_single_purchase_json_contains_expected_marker | OK | marker=completed_action_pack_single_purchase |
| machine_action_pack_single_purchase_json_secret_scan | OK | public content has no secret-like token patterns |
| public_sandbox_claims_nowrite_review_md_reachable | OK | HTTP 200, bytes=2133 |
| public_sandbox_claims_nowrite_review_md_contains_expected_marker | OK | marker=Public Sandbox Claims NoWrite Review |
| public_sandbox_claims_nowrite_review_md_secret_scan | OK | public content has no secret-like token patterns |
| public_sandbox_claims_nowrite_review_json_reachable | OK | HTTP 200, bytes=15906 |
| public_sandbox_claims_nowrite_review_json_json_valid | OK | json_valid=True |
| public_sandbox_claims_nowrite_review_json_contains_expected_marker | OK | marker=completed_public_sandbox_claims_no_write_review |
| public_sandbox_claims_nowrite_review_json_secret_scan | OK | public content has no secret-like token patterns |
| external_submission_pack_nowrite_review_md_reachable | OK | HTTP 200, bytes=4552 |
| external_submission_pack_nowrite_review_md_contains_expected_marker | OK | marker=External Submission Pack NoWrite Review |
| external_submission_pack_nowrite_review_md_secret_scan | OK | public content has no secret-like token patterns |
| external_submission_pack_nowrite_review_json_reachable | OK | HTTP 200, bytes=46838 |
| external_submission_pack_nowrite_review_json_json_valid | OK | json_valid=True |
| external_submission_pack_nowrite_review_json_contains_expected_marker | OK | marker=completed_external_submission_pack_no_write_review |
| external_submission_pack_nowrite_review_json_secret_scan | OK | public content has no secret-like token patterns |
| external_draft_submission_bundle_md_reachable | OK | HTTP 200, bytes=5818 |
| external_draft_submission_bundle_md_contains_expected_marker | OK | marker=External Draft Submission Bundle |
| external_draft_submission_bundle_md_secret_scan | OK | public content has no secret-like token patterns |
| external_draft_submission_bundle_json_reachable | OK | HTTP 200, bytes=17495 |
| external_draft_submission_bundle_json_json_valid | OK | json_valid=True |
| external_draft_submission_bundle_json_contains_expected_marker | OK | marker=ready_for_private_draft_only |
| external_draft_submission_bundle_json_secret_scan | OK | public content has no secret-like token patterns |
| private_draft_submission_rehearsal_md_reachable | OK | HTTP 200, bytes=3067 |
| private_draft_submission_rehearsal_md_contains_expected_marker | OK | marker=Private Draft Submission Rehearsal |
| private_draft_submission_rehearsal_md_secret_scan | OK | public content has no secret-like token patterns |
| private_draft_submission_rehearsal_json_reachable | OK | HTTP 200, bytes=14202 |
| private_draft_submission_rehearsal_json_json_valid | OK | json_valid=True |
| private_draft_submission_rehearsal_json_contains_expected_marker | OK | marker=completed_private_draft_submission_rehearsal |
| private_draft_submission_rehearsal_json_secret_scan | OK | public content has no secret-like token patterns |
| api_directory_private_draft_pack_md_reachable | OK | HTTP 200, bytes=3555 |
| api_directory_private_draft_pack_md_contains_expected_marker | OK | marker=API Directory Private Draft Pack |
| api_directory_private_draft_pack_md_secret_scan | OK | public content has no secret-like token patterns |
| api_directory_private_draft_pack_json_reachable | OK | HTTP 200, bytes=9808 |
| api_directory_private_draft_pack_json_json_valid | OK | json_valid=True |
| api_directory_private_draft_pack_json_contains_expected_marker | OK | marker=ready_for_api_directory_private_draft_only |
| api_directory_private_draft_pack_json_secret_scan | OK | public content has no secret-like token patterns |
| api_directory_private_draft_review_md_reachable | OK | HTTP 200, bytes=2510 |
| api_directory_private_draft_review_md_contains_expected_marker | OK | marker=API Directory Private Draft Review |
| api_directory_private_draft_review_md_secret_scan | OK | public content has no secret-like token patterns |
| api_directory_private_draft_review_json_reachable | OK | HTTP 200, bytes=8322 |
| api_directory_private_draft_review_json_json_valid | OK | json_valid=True |
| api_directory_private_draft_review_json_contains_expected_marker | OK | marker=completed_api_directory_private_draft_review |
| api_directory_private_draft_review_json_secret_scan | OK | public content has no secret-like token patterns |
| rapidapi_unpublished_provider_draft_pack_md_reachable | OK | HTTP 200, bytes=4123 |
| rapidapi_unpublished_provider_draft_pack_md_contains_expected_marker | OK | marker=RapidAPI-Style Unpublished Provider Draft Pack |
| rapidapi_unpublished_provider_draft_pack_md_secret_scan | OK | public content has no secret-like token patterns |
| rapidapi_unpublished_provider_draft_pack_json_reachable | OK | HTTP 200, bytes=7853 |
| rapidapi_unpublished_provider_draft_pack_json_json_valid | OK | json_valid=True |
| rapidapi_unpublished_provider_draft_pack_json_contains_expected_marker | OK | marker=ready_for_rapidapi_unpublished_provider_draft_only |
| rapidapi_unpublished_provider_draft_pack_json_secret_scan | OK | public content has no secret-like token patterns |
| rapidapi_unpublished_provider_draft_review_md_reachable | OK | HTTP 200, bytes=2783 |
| rapidapi_unpublished_provider_draft_review_md_contains_expected_marker | OK | marker=RapidAPI-Style Unpublished Provider Draft Review |
| rapidapi_unpublished_provider_draft_review_md_secret_scan | OK | public content has no secret-like token patterns |
| rapidapi_unpublished_provider_draft_review_json_reachable | OK | HTTP 200, bytes=10630 |
| rapidapi_unpublished_provider_draft_review_json_json_valid | OK | json_valid=True |
| rapidapi_unpublished_provider_draft_review_json_contains_expected_marker | OK | marker=completed_rapidapi_unpublished_provider_draft_review |
| rapidapi_unpublished_provider_draft_review_json_secret_scan | OK | public content has no secret-like token patterns |
| marketplace_api_directory_pack_md_reachable | OK | HTTP 200, bytes=14870 |
| marketplace_api_directory_pack_md_contains_expected_marker | OK | marker=Sandbox-Only External Publication Pack |
| marketplace_api_directory_pack_md_secret_scan | OK | public content has no secret-like token patterns |
| marketplace_api_directory_pack_json_reachable | OK | HTTP 200, bytes=29352 |
| marketplace_api_directory_pack_json_json_valid | OK | json_valid=True |
| marketplace_api_directory_pack_json_contains_expected_marker | OK | marker=external_publication_policy |
| marketplace_api_directory_pack_json_secret_scan | OK | public content has no secret-like token patterns |
| marketplace_publication_execution_pack_md_reachable | OK | HTTP 200, bytes=14318 |
| marketplace_publication_execution_pack_md_contains_expected_marker | OK | marker=Sandbox-Only External Publication Pack |
| marketplace_publication_execution_pack_md_secret_scan | OK | public content has no secret-like token patterns |
| marketplace_publication_execution_pack_json_reachable | OK | HTTP 200, bytes=26469 |
| marketplace_publication_execution_pack_json_json_valid | OK | json_valid=True |
| marketplace_publication_execution_pack_json_contains_expected_marker | OK | marker=external_publication_policy |
| marketplace_publication_execution_pack_json_secret_scan | OK | public content has no secret-like token patterns |
| api_directory_submission_reachable | OK | HTTP 200, bytes=14412 |
| api_directory_submission_json_valid | OK | json_valid=True |
| api_directory_submission_contains_expected_marker | OK | marker=latest_machine_buyer_evidence |
| api_directory_submission_secret_scan | OK | public content has no secret-like token patterns |
| rapidapi_listing_reachable | OK | HTTP 200, bytes=14400 |
| rapidapi_listing_json_valid | OK | json_valid=True |
| rapidapi_listing_contains_expected_marker | OK | marker=rapidapi_style_provider_metadata_ready_monetization_disabled |
| rapidapi_listing_secret_scan | OK | public content has no secret-like token patterns |
| marketplace_submission_pack_reachable | OK | HTTP 200, bytes=29105 |
| marketplace_submission_pack_json_valid | OK | json_valid=True |
| marketplace_submission_pack_contains_expected_marker | OK | marker=external_publication_policy |
| marketplace_submission_pack_secret_scan | OK | public content has no secret-like token patterns |
| postman_workspace_draft_reachable | OK | HTTP 200, bytes=9559 |
| postman_workspace_draft_json_valid | OK | json_valid=True |
| postman_workspace_draft_contains_expected_marker | OK | marker=ready_for_private_or_team_workspace_setup_public_visibility_blocked_until_owner_approval |
| postman_workspace_draft_secret_scan | OK | public content has no secret-like token patterns |
| postman_private_workspace_checklist_md_reachable | OK | HTTP 200, bytes=4368 |
| postman_private_workspace_checklist_md_contains_expected_marker | OK | marker=Workspace Folder Structure |
| postman_private_workspace_checklist_md_secret_scan | OK | public content has no secret-like token patterns |
| postman_private_workspace_checklist_json_reachable | OK | HTTP 200, bytes=5098 |
| postman_private_workspace_checklist_json_json_valid | OK | json_valid=True |
| postman_private_workspace_checklist_json_contains_expected_marker | OK | marker=blocked_actions |
| postman_private_workspace_checklist_json_secret_scan | OK | public content has no secret-like token patterns |
| mcp_tool_manifest_reachable | OK | HTTP 200, bytes=43084 |
| mcp_tool_manifest_json_valid | OK | json_valid=True |
| mcp_tool_manifest_contains_expected_marker | OK | marker=get_rapidapi_unpublished_provider_draft_review |
| mcp_tool_manifest_secret_scan | OK | public content has no secret-like token patterns |
| well_known_mcp_tool_manifest_reachable | OK | HTTP 200, bytes=43084 |
| well_known_mcp_tool_manifest_json_valid | OK | json_valid=True |
| well_known_mcp_tool_manifest_contains_expected_marker | OK | marker=get_rapidapi_unpublished_provider_draft_review |
| well_known_mcp_tool_manifest_secret_scan | OK | public content has no secret-like token patterns |
| well_known_machine_discovery_reachable | OK | HTTP 200, bytes=27616 |
| well_known_machine_discovery_json_valid | OK | json_valid=True |
| well_known_machine_discovery_contains_expected_marker | OK | marker=rapidapi_unpublished_provider_draft_review_json |
| well_known_machine_discovery_secret_scan | OK | public content has no secret-like token patterns |
| llms_reachable | OK | HTTP 200, bytes=21842 |
| llms_contains_expected_marker | OK | marker=RapidAPI Unpublished Provider Draft Review JSON |
| llms_secret_scan | OK | public content has no secret-like token patterns |
| robots_reachable | OK | HTTP 200, bytes=9543 |
| robots_contains_expected_marker | OK | marker=Rapidapi-unpublished-provider-draft-review-json |
| robots_secret_scan | OK | public content has no secret-like token patterns |
| sitemap_reachable | OK | HTTP 200, bytes=17052 |
| sitemap_contains_expected_marker | OK | marker=rapidapi_unpublished_provider_draft_review_summary_20260608.json |
| sitemap_secret_scan | OK | public content has no secret-like token patterns |
| openapi_reachable | OK | HTTP 200, bytes=58945 |
| openapi_json_valid | OK | json_valid=True |
| openapi_contains_expected_marker | OK | marker=action_pack_gate |
| openapi_secret_scan | OK | public content has no secret-like token patterns |
| postman_public_collection_reachable | OK | HTTP 200, bytes=27401 |
| postman_public_collection_json_valid | OK | json_valid=True |
| postman_public_collection_contains_expected_marker | OK | marker=action_pack_gate_failed |
| postman_public_collection_secret_scan | OK | public content has no secret-like token patterns |
| product_catalog_reachable | OK | HTTP 200, bytes=12370 |
| product_catalog_json_valid | OK | json_valid=True |
| product_catalog_contains_expected_marker | OK | marker=action_pack |
| product_catalog_secret_scan | OK | public content has no secret-like token patterns |
| machine_onboarding_reachable | OK | HTTP 200, bytes=50247 |
| machine_onboarding_json_valid | OK | json_valid=True |
| machine_onboarding_contains_expected_marker | OK | marker=NoWrite |
| machine_onboarding_secret_scan | OK | public content has no secret-like token patterns |
| evidence_status_completed_full | OK | status=completed_full, ok=True |
| evidence_machine_customer_interface | OK | primary_customer_interface=machine |
| evidence_no_payment_or_contact | OK | payment=False, contact=False, invoice=False |
| runner_full_beta_ok | OK | status=completed_full, ok=True |
| runner_credit_caps_respected | OK | score=5, deep=1, action=1 |
| runner_safety_flags_false | OK | payment=False, contact=False, invoice=False |
| sitemap_xml_valid | OK | valid XML |

## Safety

- Real payment executed: false
- External contact executed: false
- Real invoice issued: false
- Credit-consuming calls executed: false

## Recommended Next Step

Distribution assets are ready for owner review and sandbox-only external publication preparation. Do not enable live payments or publish real keys.