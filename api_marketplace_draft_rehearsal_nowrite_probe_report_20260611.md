# MachineSignal - API Marketplace Draft Rehearsal NoWrite Probe

## Scope

This probe verifies whether a machine can evaluate the MachineSignal generic API-directory and RapidAPI-style marketplace draft assets without external publication, live monetization, real keys, real payments, invoices or human outreach.

## Result

- Status: **completed_api_marketplace_draft_rehearsal_nowrite**
- OK: **true**
- Channels checked: Generic API directories; RapidAPI-style marketplace
- Write calls executed: 0
- POST calls executed by this probe: 0
- External publication executed: false
- Live monetization enabled: false
- Public paid plans enabled: false
- Production API key published: false
- Human outreach executed: false

## Machine Interpretation

A machine can evaluate both API-directory and RapidAPI-style draft metadata, understand the product and test route, and see that publication, monetization, production keys, payments, invoices and outreach remain blocked.

## Channel Decisions

- Generic API directories: ready_for_private_or_unsubmitted_directory_draft; status=ready_for_api_directory_private_draft_only; blocked_until=owner_approval
- RapidAPI-style marketplace: ready_for_unpublished_provider_draft_monetization_blocked; status=ready_for_rapidapi_unpublished_provider_draft_only; blocked_until=owner_approval

## Public Resources

- api_directory_pack: HTTP 200, json=true, hard_fails=0, https://machinesignal.it/api_directory_private_draft_pack_20260608.json
- api_directory_pack_md: HTTP 200, json=false, hard_fails=0, https://machinesignal.it/api_directory_private_draft_pack_20260608.md
- api_directory_submission: HTTP 200, json=true, hard_fails=0, https://machinesignal.it/distribution/api-directory-submission.json
- api_directory_review: HTTP 200, json=true, hard_fails=0, https://machinesignal.it/api_directory_private_draft_review_summary_20260608.json
- rapidapi_pack: HTTP 200, json=true, hard_fails=0, https://machinesignal.it/rapidapi_unpublished_provider_draft_pack_20260608.json
- rapidapi_pack_md: HTTP 200, json=false, hard_fails=0, https://machinesignal.it/rapidapi_unpublished_provider_draft_pack_20260608.md
- rapidapi_listing: HTTP 200, json=true, hard_fails=0, https://machinesignal.it/distribution/rapidapi-listing.json
- rapidapi_provider_setup: HTTP 200, json=true, hard_fails=0, https://machinesignal.it/distribution/rapidapi-provider-setup.json
- rapidapi_review: HTTP 200, json=true, hard_fails=0, https://machinesignal.it/rapidapi_unpublished_provider_draft_review_summary_20260608.json
- draft_checklist: HTTP 200, json=true, hard_fails=0, https://machinesignal.it/api_directory_rapidapi_draft_checklist_20260607.json
- marketplace_pack: HTTP 200, json=true, hard_fails=0, https://machinesignal.it/distribution/marketplace-submission-pack.json
- postman_rehearsal: HTTP 200, json=true, hard_fails=0, https://machinesignal.it/postman_private_workspace_rehearsal_nowrite_probe_summary_20260611.json
- distribution_monitor: HTTP 200, json=true, hard_fails=0, https://machinesignal.it/distribution_readiness_monitor_summary_20260607.json
- openapi: HTTP 200, json=true, hard_fails=0, https://machinesignal.it/openapi.json
- machine_discovery: HTTP 200, json=true, hard_fails=0, https://machinesignal.it/.well-known/machine-discovery.json
- llms: HTTP 200, json=false, hard_fails=0, https://machinesignal.it/llms.txt
- robots: HTTP 200, json=false, hard_fails=0, https://machinesignal.it/robots.txt
- sitemap: HTTP 200, json=false, hard_fails=0, https://machinesignal.it/sitemap.xml

## Checks

- PASS - api_directory_pack_reachable: HTTP 200, bytes=24991
- PASS - api_directory_pack_json_valid: json_valid=true
- PASS - api_directory_pack_marker_ready_for_api_directory_private_draft_only: ready_for_api_directory_private_draft_only
- PASS - api_directory_pack_marker_machinesignal_lead_opportunity_score_api: MachineSignal Lead Opportunity Score API
- PASS - api_directory_pack_marker_external_publication_executed: external_publication_executed
- PASS - api_directory_pack_no_hard_fail_patterns: none
- PASS - api_directory_pack_md_reachable: HTTP 200, bytes=3555
- PASS - api_directory_pack_md_marker_api_directory_private_draft_pack: API Directory Private Draft Pack
- PASS - api_directory_pack_md_marker_external_publication_executed_false: external_publication_executed=false
- PASS - api_directory_pack_md_no_hard_fail_patterns: none
- PASS - api_directory_submission_reachable: HTTP 200, bytes=34017
- PASS - api_directory_submission_json_valid: json_valid=true
- PASS - api_directory_submission_marker_sandbox_only_api_directory_draft_ready_owner_approval_required_for_external_submission: sandbox_only_api_directory_draft_ready_owner_approval_required_for_external_submission
- PASS - api_directory_submission_marker_api_directory_private_draft_pack_20260608_json: api_directory_private_draft_pack_20260608.json
- PASS - api_directory_submission_no_hard_fail_patterns: none
- PASS - api_directory_review_reachable: HTTP 200, bytes=8322
- PASS - api_directory_review_json_valid: json_valid=true
- PASS - api_directory_review_marker_completed_api_directory_private_draft_review: completed_api_directory_private_draft_review
- PASS - api_directory_review_marker_nowriteapidirectoryprivatedraftreview: NoWriteApiDirectoryPrivateDraftReview
- PASS - api_directory_review_no_hard_fail_patterns: none
- PASS - rapidapi_pack_reachable: HTTP 200, bytes=23557
- PASS - rapidapi_pack_json_valid: json_valid=true
- PASS - rapidapi_pack_marker_ready_for_rapidapi_unpublished_provider_draft_only: ready_for_rapidapi_unpublished_provider_draft_only
- PASS - rapidapi_pack_marker_do_not_create_public_paid_plans_yet: do_not_create_public_paid_plans_yet
- PASS - rapidapi_pack_no_hard_fail_patterns: none
- PASS - rapidapi_pack_md_reachable: HTTP 200, bytes=4123
- PASS - rapidapi_pack_md_marker_rapidapi_style_unpublished_provider_draft_pack: RapidAPI-Style Unpublished Provider Draft Pack
- PASS - rapidapi_pack_md_marker_monetization_disabled: monetization disabled
- PASS - rapidapi_pack_md_no_hard_fail_patterns: none
- PASS - rapidapi_listing_reachable: HTTP 200, bytes=34288
- PASS - rapidapi_listing_json_valid: json_valid=true
- PASS - rapidapi_listing_marker_rapidapi_style_provider_metadata_ready_monetization_disabled: rapidapi_style_provider_metadata_ready_monetization_disabled
- PASS - rapidapi_listing_marker_public_paid_plans_enabled: public_paid_plans_enabled
- PASS - rapidapi_listing_no_hard_fail_patterns: none
- PASS - rapidapi_provider_setup_reachable: HTTP 200, bytes=22406
- PASS - rapidapi_provider_setup_json_valid: json_valid=true
- PASS - rapidapi_provider_setup_marker_draft_or_unpublished_monetization_disabled: draft_or_unpublished_monetization_disabled
- PASS - rapidapi_provider_setup_marker_do_not_publish_monetized_until: do_not_publish_monetized_until
- PASS - rapidapi_provider_setup_no_hard_fail_patterns: none
- PASS - rapidapi_review_reachable: HTTP 200, bytes=10630
- PASS - rapidapi_review_json_valid: json_valid=true
- PASS - rapidapi_review_marker_completed_rapidapi_unpublished_provider_draft_review: completed_rapidapi_unpublished_provider_draft_review
- PASS - rapidapi_review_marker_nowriterapidapiunpublishedproviderdraftreview: NoWriteRapidApiUnpublishedProviderDraftReview
- PASS - rapidapi_review_no_hard_fail_patterns: none
- PASS - draft_checklist_reachable: HTTP 200, bytes=9425
- PASS - draft_checklist_json_valid: json_valid=true
- PASS - draft_checklist_marker_blocked_until_owner_approval: blocked_until_owner_approval
- PASS - draft_checklist_marker_do_not_contact_human_prospects_or_target_companies: do_not_contact_human_prospects_or_target_companies
- PASS - draft_checklist_no_hard_fail_patterns: none
- PASS - marketplace_pack_reachable: HTTP 200, bytes=49702
- PASS - marketplace_pack_json_valid: json_valid=true
- PASS - marketplace_pack_marker_ready_for_sandbox_publication_drafts_with_full_beta_evidence: ready_for_sandbox_publication_drafts_with_full_beta_evidence
- PASS - marketplace_pack_marker_channel_private_draft_packs: channel_private_draft_packs
- PASS - marketplace_pack_no_hard_fail_patterns: none
- PASS - postman_rehearsal_reachable: HTTP 200, bytes=12985
- PASS - postman_rehearsal_json_valid: json_valid=true
- PASS - postman_rehearsal_marker_completed_postman_private_workspace_rehearsal_nowrite: completed_postman_private_workspace_rehearsal_nowrite
- PASS - postman_rehearsal_no_hard_fail_patterns: none
- PASS - distribution_monitor_reachable: HTTP 200, bytes=73652
- PASS - distribution_monitor_json_valid: json_valid=true
- PASS - distribution_monitor_marker_ready_for_distribution_review: ready_for_distribution_review
- PASS - distribution_monitor_marker_checks_failed: checks_failed
- PASS - distribution_monitor_no_hard_fail_patterns: none
- PASS - openapi_reachable: HTTP 200, bytes=61595
- PASS - openapi_json_valid: json_valid=true
- PASS - openapi_marker_lead_opportunity_score: lead-opportunity-score
- PASS - openapi_marker_purchase_intent: purchase-intent
- PASS - openapi_marker_orders: orders
- PASS - openapi_no_hard_fail_patterns: none
- PASS - machine_discovery_reachable: HTTP 200, bytes=60007
- PASS - machine_discovery_json_valid: json_valid=true
- PASS - machine_discovery_marker_postman_private_workspace_rehearsal_nowrite_probe_json: postman_private_workspace_rehearsal_nowrite_probe_json
- PASS - machine_discovery_no_hard_fail_patterns: none
- PASS - llms_reachable: HTTP 200, bytes=30943
- PASS - llms_marker_postman_private_workspace_rehearsal_nowrite_probe_json: Postman Private Workspace Rehearsal NoWrite Probe JSON
- PASS - llms_marker_rapidapi_listing_json: RapidAPI Listing JSON
- PASS - llms_no_hard_fail_patterns: none
- PASS - robots_reachable: HTTP 200, bytes=13064
- PASS - robots_marker_postman_private_workspace_rehearsal_nowrite_probe_json: Postman-private-workspace-rehearsal-nowrite-probe-json
- PASS - robots_marker_rapidapi_listing: RapidAPI-listing
- PASS - robots_no_hard_fail_patterns: none
- PASS - sitemap_reachable: HTTP 200, bytes=20289
- PASS - sitemap_marker_postman_private_workspace_rehearsal_nowrite_probe_summary_20260611_json: postman_private_workspace_rehearsal_nowrite_probe_summary_20260611.json
- PASS - sitemap_marker_rapidapi_listing_json: rapidapi-listing.json
- PASS - sitemap_no_hard_fail_patterns: none
- PASS - api_directory_required_directory_listing_fields_api_name: directory_listing_fields.api_name
- PASS - api_directory_required_directory_listing_fields_short_description: directory_listing_fields.short_description
- PASS - api_directory_required_directory_listing_fields_long_description: directory_listing_fields.long_description
- PASS - api_directory_required_directory_listing_fields_base_url: directory_listing_fields.base_url
- PASS - api_directory_required_directory_listing_fields_documentation_url: directory_listing_fields.documentation_url
- PASS - api_directory_required_directory_listing_fields_openapi_url: directory_listing_fields.openapi_url
- PASS - api_directory_required_directory_listing_fields_postman_collection_url: directory_listing_fields.postman_collection_url
- PASS - api_directory_required_directory_listing_fields_well_known_discovery_url: directory_listing_fields.well_known_discovery_url
- PASS - api_directory_required_directory_listing_fields_auth_type: directory_listing_fields.auth_type
- PASS - api_directory_required_directory_listing_fields_auth_header: directory_listing_fields.auth_header
- PASS - api_directory_required_endpoint_groups_for_directory: endpoint_groups_for_directory
- PASS - api_directory_required_products_to_describe: products_to_describe
- PASS - api_directory_required_blocked_before_public_submit: blocked_before_public_submit
- PASS - api_directory_required_machine_decision_decision: machine_decision.decision
- PASS - rapidapi_required_rapidapi_style_listing_fields_api_name: rapidapi_style_listing_fields.api_name
- PASS - rapidapi_required_rapidapi_style_listing_fields_visibility: rapidapi_style_listing_fields.visibility
- PASS - rapidapi_required_rapidapi_style_listing_fields_monetization: rapidapi_style_listing_fields.monetization
- PASS - rapidapi_required_rapidapi_style_listing_fields_pricing_plans: rapidapi_style_listing_fields.pricing_plans
- PASS - rapidapi_required_rapidapi_style_listing_fields_base_url: rapidapi_style_listing_fields.base_url
- PASS - rapidapi_required_rapidapi_style_listing_fields_auth_header: rapidapi_style_listing_fields.auth_header
- PASS - rapidapi_required_rapidapi_style_listing_fields_openapi_url: rapidapi_style_listing_fields.openapi_url
- PASS - rapidapi_required_rapidapi_style_listing_fields_postman_collection_url: rapidapi_style_listing_fields.postman_collection_url
- PASS - rapidapi_required_source_assets_rapidapi_listing_json: source_assets.rapidapi_listing_json
- PASS - rapidapi_required_source_assets_rapidapi_provider_setup_json: source_assets.rapidapi_provider_setup_json
- PASS - rapidapi_required_endpoint_groups_for_provider_draft: endpoint_groups_for_provider_draft
- PASS - rapidapi_required_draft_pricing_treatment_public_paid_plans_active: draft_pricing_treatment.public_paid_plans_active
- PASS - rapidapi_required_draft_pricing_treatment_create_marketplace_pricing_tiers: draft_pricing_treatment.create_marketplace_pricing_tiers
- PASS - rapidapi_required_blocked_before_public_submit: blocked_before_public_submit
- PASS - rapidapi_required_machine_decision_decision: machine_decision.decision
- PASS - api_directory_status_private_draft_only: status=ready_for_api_directory_private_draft_only
- PASS - rapidapi_status_unpublished_draft_only: status=ready_for_rapidapi_unpublished_provider_draft_only
- PASS - api_directory_submission_owner_approval_required: sandbox_only_api_directory_draft_ready_owner_approval_required_for_external_submission
- PASS - rapidapi_listing_monetization_disabled: rapidapi_style_provider_metadata_ready_monetization_disabled
- PASS - rapidapi_provider_setup_draft_or_unpublished: draft_or_unpublished_monetization_disabled
- PASS - marketplace_sequence_has_rapidapi_and_api_directory: recommended sequence includes both channels
- PASS - marketplace_channel_private_draft_packs_present: channel-specific draft packs present
- PASS - postman_rehearsal_passed: status=completed_postman_private_workspace_rehearsal_nowrite
- PASS - distribution_monitor_green: ok=true, failed=0
- PASS - api_directory_pack_zero_writes: write_calls_executed=0
- PASS - api_directory_pack_zero_posts: post_calls_executed=0
- PASS - api_directory_pack_no_real_payment: real_payment_executed=false
- PASS - api_directory_pack_no_external_contact: external_contact_executed=false
- PASS - api_directory_pack_no_external_publication: external_publication_executed=false
- PASS - api_directory_pack_no_live_monetization: live_monetization_enabled=false
- PASS - rapidapi_pack_zero_writes: write_calls_executed=0
- PASS - rapidapi_pack_zero_posts: post_calls_executed=0
- PASS - rapidapi_pack_no_real_payment: real_payment_executed=false
- PASS - rapidapi_pack_no_external_contact: external_contact_executed=false
- PASS - rapidapi_pack_no_external_publication: external_publication_executed=false
- PASS - rapidapi_pack_no_live_monetization: live_monetization_enabled=false
- PASS - api_directory_review_zero_writes: write_calls_executed=0
- PASS - api_directory_review_zero_posts: post_calls_executed=0
- PASS - api_directory_review_no_real_payment: real_payment_executed=false
- PASS - api_directory_review_no_external_contact: external_contact_executed=false
- PASS - api_directory_review_no_external_publication: external_publication_executed=false
- PASS - api_directory_review_no_live_monetization: live_monetization_enabled=false
- PASS - rapidapi_review_zero_writes: write_calls_executed=0
- PASS - rapidapi_review_zero_posts: post_calls_executed=0
- PASS - rapidapi_review_no_real_payment: real_payment_executed=false
- PASS - rapidapi_review_no_external_contact: external_contact_executed=false
- PASS - rapidapi_review_no_external_publication: external_publication_executed=false
- PASS - rapidapi_review_no_live_monetization: live_monetization_enabled=false
- PASS - postman_rehearsal_zero_writes: write_calls_executed=0
- PASS - postman_rehearsal_zero_posts: post_calls_executed=0
- PASS - postman_rehearsal_no_real_payment: real_payment_executed=false
- PASS - postman_rehearsal_no_external_contact: external_contact_executed=false
- PASS - postman_rehearsal_no_external_publication: external_publication_executed=false
- PASS - postman_rehearsal_no_live_monetization: live_monetization_enabled=false

## Guardrails Confirmed

- API-directory draft remains private or unsubmitted until owner approval.
- RapidAPI-style provider draft remains unpublished and monetization-disabled.
- Marketplace pricing tiers are not created.
- No production key is published.
- No payment, fiscal invoice, external publication or human outreach is executed.
