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
| distribution_index | 200 | n/a | 12882 |
| evidence_brief_html | 200 | n/a | 8526 |
| evidence_brief_md | 200 | n/a | 4942 |
| evidence_brief_json | 200 | True | 4415 |
| bounded_beta_runner_json | 200 | True | 109267 |
| sandbox_only_external_publication_pack_md | 200 | n/a | 5741 |
| sandbox_only_external_publication_pack_json | 200 | True | 7664 |
| external_sandbox_publication_drafts_md | 200 | n/a | 7076 |
| external_sandbox_publication_drafts_json | 200 | True | 8549 |
| api_directory_rapidapi_draft_checklist_md | 200 | n/a | 6325 |
| api_directory_rapidapi_draft_checklist_json | 200 | True | 7141 |
| marketplace_api_directory_pack_md | 200 | n/a | 9680 |
| marketplace_api_directory_pack_json | 200 | True | 14553 |
| marketplace_publication_execution_pack_md | 200 | n/a | 11295 |
| marketplace_publication_execution_pack_json | 200 | True | 12979 |
| api_directory_submission | 200 | True | 8667 |
| rapidapi_listing | 200 | True | 11250 |
| marketplace_submission_pack | 200 | True | 14306 |
| postman_workspace_draft | 200 | True | 9559 |
| postman_private_workspace_checklist_md | 200 | n/a | 4368 |
| postman_private_workspace_checklist_json | 200 | True | 5098 |
| mcp_tool_manifest | 200 | True | 40123 |
| well_known_mcp_tool_manifest | 200 | True | 40123 |
| well_known_machine_discovery | 200 | True | 13291 |
| llms | 200 | n/a | 14667 |
| robots | 200 | n/a | 6667 |
| sitemap | 200 | n/a | 14370 |
| openapi | 200 | True | 58945 |
| postman_public_collection | 200 | True | 27401 |
| product_catalog | 200 | True | 12370 |
| machine_onboarding | 200 | True | 35339 |

## Checks

| Check | Status | Details |
|---|---|---|
| distribution_index_reachable | OK | HTTP 200, bytes=12882 |
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
| sandbox_only_external_publication_pack_json_reachable | OK | HTTP 200, bytes=7664 |
| sandbox_only_external_publication_pack_json_json_valid | OK | json_valid=True |
| sandbox_only_external_publication_pack_json_contains_expected_marker | OK | marker=blocked_without_owner_approval |
| sandbox_only_external_publication_pack_json_secret_scan | OK | public content has no secret-like token patterns |
| external_sandbox_publication_drafts_md_reachable | OK | HTTP 200, bytes=7076 |
| external_sandbox_publication_drafts_md_contains_expected_marker | OK | marker=Channel 1: Postman Workspace Draft |
| external_sandbox_publication_drafts_md_secret_scan | OK | public content has no secret-like token patterns |
| external_sandbox_publication_drafts_json_reachable | OK | HTTP 200, bytes=8549 |
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
| marketplace_api_directory_pack_md_reachable | OK | HTTP 200, bytes=9680 |
| marketplace_api_directory_pack_md_contains_expected_marker | OK | marker=Sandbox-Only External Publication Pack |
| marketplace_api_directory_pack_md_secret_scan | OK | public content has no secret-like token patterns |
| marketplace_api_directory_pack_json_reachable | OK | HTTP 200, bytes=14553 |
| marketplace_api_directory_pack_json_json_valid | OK | json_valid=True |
| marketplace_api_directory_pack_json_contains_expected_marker | OK | marker=external_publication_policy |
| marketplace_api_directory_pack_json_secret_scan | OK | public content has no secret-like token patterns |
| marketplace_publication_execution_pack_md_reachable | OK | HTTP 200, bytes=11295 |
| marketplace_publication_execution_pack_md_contains_expected_marker | OK | marker=Sandbox-Only External Publication Pack |
| marketplace_publication_execution_pack_md_secret_scan | OK | public content has no secret-like token patterns |
| marketplace_publication_execution_pack_json_reachable | OK | HTTP 200, bytes=12979 |
| marketplace_publication_execution_pack_json_json_valid | OK | json_valid=True |
| marketplace_publication_execution_pack_json_contains_expected_marker | OK | marker=external_publication_policy |
| marketplace_publication_execution_pack_json_secret_scan | OK | public content has no secret-like token patterns |
| api_directory_submission_reachable | OK | HTTP 200, bytes=8667 |
| api_directory_submission_json_valid | OK | json_valid=True |
| api_directory_submission_contains_expected_marker | OK | marker=latest_machine_buyer_evidence |
| api_directory_submission_secret_scan | OK | public content has no secret-like token patterns |
| rapidapi_listing_reachable | OK | HTTP 200, bytes=11250 |
| rapidapi_listing_json_valid | OK | json_valid=True |
| rapidapi_listing_contains_expected_marker | OK | marker=rapidapi_style_provider_metadata_ready_monetization_disabled |
| rapidapi_listing_secret_scan | OK | public content has no secret-like token patterns |
| marketplace_submission_pack_reachable | OK | HTTP 200, bytes=14306 |
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
| mcp_tool_manifest_reachable | OK | HTTP 200, bytes=40123 |
| mcp_tool_manifest_json_valid | OK | json_valid=True |
| mcp_tool_manifest_contains_expected_marker | OK | marker=get_machine_buyer_evidence_brief |
| mcp_tool_manifest_secret_scan | OK | public content has no secret-like token patterns |
| well_known_mcp_tool_manifest_reachable | OK | HTTP 200, bytes=40123 |
| well_known_mcp_tool_manifest_json_valid | OK | json_valid=True |
| well_known_mcp_tool_manifest_contains_expected_marker | OK | marker=get_machine_buyer_evidence_brief |
| well_known_mcp_tool_manifest_secret_scan | OK | public content has no secret-like token patterns |
| well_known_machine_discovery_reachable | OK | HTTP 200, bytes=13291 |
| well_known_machine_discovery_json_valid | OK | json_valid=True |
| well_known_machine_discovery_contains_expected_marker | OK | marker=external_sandbox_publication_drafts_json |
| well_known_machine_discovery_secret_scan | OK | public content has no secret-like token patterns |
| llms_reachable | OK | HTTP 200, bytes=14667 |
| llms_contains_expected_marker | OK | marker=API Directory and RapidAPI Draft Checklist JSON |
| llms_secret_scan | OK | public content has no secret-like token patterns |
| robots_reachable | OK | HTTP 200, bytes=6667 |
| robots_contains_expected_marker | OK | marker=API-directory-RapidAPI-draft-checklist-json |
| robots_secret_scan | OK | public content has no secret-like token patterns |
| sitemap_reachable | OK | HTTP 200, bytes=14370 |
| sitemap_contains_expected_marker | OK | marker=api_directory_rapidapi_draft_checklist_20260607.json |
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
| machine_onboarding_reachable | OK | HTTP 200, bytes=35339 |
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