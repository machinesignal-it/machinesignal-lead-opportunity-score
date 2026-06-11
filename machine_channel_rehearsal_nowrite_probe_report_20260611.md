# MachineSignal - Channel Publication Rehearsal NoWrite Probe - 2026-06-11

## Result

Status: completed_machine_channel_rehearsal_nowrite_probe

OK: true

Mode: NoWriteChannelPublicationRehearsal

Primary customer interface: machine

Write calls executed: 0

POST calls executed: 0

Real payment executed: false

External publication executed: false

Human outreach executed: false

## What This Rehearses

A machine evaluates whether MachineSignal is ready to be prepared for external discovery channels: Postman, RapidAPI-style marketplace, generic API directories and MCP/agent registries. The probe reads only public metadata and current evidence. It does not log into third-party platforms, publish listings, enable monetization, send messages, create real API keys or execute payments.

## Machine Decision

Decision: channels_ready_for_owner_supervised_nowrite_rehearsal

Recommended next step: Run a private Postman workspace rehearsal first, then prepare unpublished RapidAPI/API-directory/MCP registry drafts; keep monetization and public submission blocked.

## Channel Decisions

| Channel | Fit | Decision | Checks | Next Step |
|---|---|---|---:|---|
| Postman Public API Network | high | ready_for_owner_supervised_private_workspace_rehearsal | 10/10 | Keep workspace private/team, import the public collection, run final in-Postman secret scan, then ask owner before public visibility. |
| RapidAPI style marketplace draft | medium_high | ready_for_unpublished_provider_draft_rehearsal_monetization_blocked | 8/8 | Prepare provider/listing metadata only; keep paid plans, live checkout and production key distribution disabled. |
| Generic API directories | medium | ready_for_private_or_unsubmitted_directory_draft | 8/8 | Use the directory draft copy as metadata source only; public submission remains blocked until owner approval. |
| MCP and agent registries | high_after_mcp | ready_for_local_adapter_registry_draft_hosted_mcp_blocked | 8/8 | Prepare local-adapter registry metadata; decide separately if a hosted MCP endpoint is worth building before public registry submission. |

## Recommended Order

1. Postman Public API Network - ready_to_setup_public_workspace_draft - https://machinesignal.it/postman_public_collection.json
2. Own-domain API and agent discovery surfaces - published_keep_current - https://machinesignal.it/sandbox-buyer-kit/sandbox-buyer-kit.json
3. RapidAPI style marketplace draft - provider_ready_draft_do_not_monetize_yet - https://machinesignal.it/openapi.json
4. Generic API directories - ready_to_submit_as_sandbox_listing - https://machinesignal.it/openapi.json
5. MCP and agent registries - ready_for_sandbox_validation_after_wrapper_publication - https://machinesignal.it/mcp-tool-manifest.json

## Resources

| Resource | HTTP | Bytes | JSON | Result |
|---|---:|---:|---|---|
| channel_shortlist | 200 | 6100 | true | OK |
| postman_workspace_draft | 200 | 9559 | true | OK |
| rapidapi_listing | 200 | 43020 | true | OK |
| api_directory_submission | 200 | 41335 | true | OK |
| marketplace_submission_pack | 200 | 67665 | true | OK |
| mcp_tool_manifest | 200 | 69059 | true | OK |
| mcp_wrapper_pack | 200 | 46438 | true | OK |
| openapi | 200 | 61595 | true | OK |
| postman_public_collection | 200 | 27631 | true | OK |
| postman_smoke | 200 | 6946 | true | OK |
| postman_secret_scan | 200 | 4329 | true | OK |
| distribution_readiness_probe | 200 | 17633 | true | OK |
| distribution_monitor | 200 | 69993 | true | OK |

## Checks

| Check | Result | Details |
|---|---|---|
| channel_shortlist_reachable | OK | HTTP 200; bytes=6100; json=true; markers=1/1; secrets=0 |
| postman_workspace_draft_reachable | OK | HTTP 200; bytes=9559; json=true; markers=1/1; secrets=0 |
| rapidapi_listing_reachable | OK | HTTP 200; bytes=43020; json=true; markers=1/1; secrets=0 |
| api_directory_submission_reachable | OK | HTTP 200; bytes=41335; json=true; markers=1/1; secrets=0 |
| marketplace_submission_pack_reachable | OK | HTTP 200; bytes=67665; json=true; markers=1/1; secrets=0 |
| mcp_tool_manifest_reachable | OK | HTTP 200; bytes=69059; json=true; markers=1/1; secrets=0 |
| mcp_wrapper_pack_reachable | OK | HTTP 200; bytes=46438; json=true; markers=1/1; secrets=0 |
| openapi_reachable | OK | HTTP 200; bytes=61595; json=true; markers=1/1; secrets=0 |
| postman_public_collection_reachable | OK | HTTP 200; bytes=27631; json=true; markers=1/1; secrets=0 |
| postman_smoke_reachable | OK | HTTP 200; bytes=6946; json=true; markers=1/1; secrets=0 |
| postman_secret_scan_reachable | OK | HTTP 200; bytes=4329; json=true; markers=1/1; secrets=0 |
| distribution_readiness_probe_reachable | OK | HTTP 200; bytes=17633; json=true; markers=1/1; secrets=0 |
| distribution_monitor_reachable | OK | HTTP 200; bytes=69993; json=true; markers=1/1; secrets=0 |
| postman_status_ready_private_or_team | OK |  |
| postman_collection_import_asset_present | OK |  |
| postman_openapi_import_asset_present | OK |  |
| postman_api_key_blank_before_publish | OK |  |
| postman_owner_approval_gate_present | OK |  |
| postman_collection_has_core_flow | OK |  |
| postman_smoke_test_ok_or_available | OK |  |
| postman_secret_scan_available | OK |  |
| postman_public_visibility_still_blocked | OK |  |
| postman_acceptance_gates_actionable | OK |  |
| rapidapi_metadata_ready | OK |  |
| rapidapi_base_url_present | OK |  |
| rapidapi_auth_headers_documented | OK |  |
| rapidapi_core_endpoints_present | OK |  |
| rapidapi_products_cover_purchase_ladder | OK |  |
| rapidapi_monetization_disabled | OK |  |
| rapidapi_safety_no_external_contact | OK |  |
| rapidapi_openapi_gate_errors_documented | OK |  |
| api_directory_status_draft_ready | OK |  |
| api_directory_short_description_present | OK |  |
| api_directory_categories_present | OK |  |
| api_directory_keywords_present | OK |  |
| api_directory_canonical_urls_present | OK |  |
| api_directory_products_present | OK |  |
| api_directory_publication_blocked | OK |  |
| api_directory_safety_no_external_contact | OK |  |
| mcp_registry_tool_manifest_has_many_tools | OK |  |
| mcp_registry_core_tools_present | OK |  |
| mcp_registry_public_read_tools_present | OK |  |
| mcp_registry_hosted_mcp_not_claimed_live | OK |  |
| mcp_registry_local_stdio_adapter_available | OK |  |
| mcp_registry_registry_submission_blocked | OK |  |
| mcp_registry_wrapper_installation_flow_present | OK |  |
| mcp_registry_no_real_keys_publishable | OK |  |
| marketplace_pack_sequence_has_postman_first | OK |  |
| marketplace_pack_sequence_has_rapidapi | OK |  |
| marketplace_pack_sequence_has_mcp | OK |  |
| marketplace_pack_policy_blocks_external_submission | OK |  |
| marketplace_pack_policy_blocks_real_payments | OK |  |
| marketplace_pack_canonical_assets_present | OK |  |
| marketplace_pack_all_channel_decisions_ready_or_blocked_safely | OK |  |
| channel_shortlist_machine_first_rule | OK | Do not rely on human cold email. Prioritize machine-readable assets, public API documentation and sandbox-callable flows. |
| distribution_readiness_probe_current_ok | OK | ok=true; post=0; write=0 |
| distribution_monitor_current_ok | OK | ok=true; failed=0 |
| no_write_policy_respected | OK | probe executed only GET requests |

## Interpretation

MachineSignal is ready for owner-supervised channel rehearsal. The safest first channel remains Postman because a machine can import examples and run the sandbox path without public paid plans. RapidAPI-style and generic API directory drafts are metadata-ready but monetization and public submission remain blocked. MCP/agent registry material is ready as a local-adapter draft, while hosted MCP claims remain blocked until a separate build decision.
