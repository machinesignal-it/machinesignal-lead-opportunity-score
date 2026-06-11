# MachineSignal - Machine Distribution Readiness NoWrite Probe - 2026-06-11

## Result

Status: completed_machine_distribution_readiness_nowrite_probe

OK: true

Mode: NoWriteMachineDistributionReadinessProbe

Write calls executed: 0

POST calls executed: 0

Real payment executed: false

External contact executed: false

Human outreach executed: false

## What This Simulates

A machine starts from public discovery channels rather than from an email or a human sales conversation. It reads robots.txt, llms.txt, well-known machine discovery, OpenAPI, Postman collection, MCP manifest, distribution channel shortlist and current evidence probes. It decides whether the product is technically discoverable and safe to evaluate without creating records, sending messages, enabling payment or publishing anything externally.

## Machine Decision

Decision: machine_distribution_surfaces_ready_for_owner_supervised_channel_work

Recommended next step: Prepare owner-supervised Postman/RapidAPI/private registry publication rehearsal without enabling paid plans or contacting humans.

## Channel Summary

- Total channels: `9`
- High-fit channels: `Own domain machine surfaces, GitHub repository, Postman Public API Network, RapidAPI Hub, Smithery, Glama MCP registry, AgentNDX`
- Ready/metadata-ready channels: `Postman Public API Network, Smithery, Glama MCP registry, MCPDrop`

## Tool/API Summary

- OpenAPI required paths present: `/v1/sandbox/customers, /v1/lead-opportunity-score, /v1/purchase-intent, /v1/orders, /v1/usage`
- Postman required examples present: `Create limited sandbox customer, Score business domain, Create beta purchase intent, Order deep analysis after a strong score, Order action pack after confirmed opportunity, Repeat same score without double charge`
- MCP total tools: `31`
- MCP public read tools: `20`
- MCP POST tools classified: `4`

## Resources

| Resource | HTTP | Bytes | JSON | Result |
|---|---:|---:|---|---|
| robots_txt | 200 | 12230 | null | OK |
| llms_txt | 200 | 28734 | null | OK |
| sitemap_xml | 200 | 19554 | null | OK |
| well_known_machine_discovery | 200 | 49986 | true | OK |
| product_catalog | 200 | 12086 | true | OK |
| machine_onboarding | 200 | 73671 | true | OK |
| openapi | 200 | 61595 | true | OK |
| postman_public_collection | 200 | 27631 | true | OK |
| mcp_tool_manifest | 200 | 67258 | true | OK |
| well_known_mcp_tool_manifest | 200 | 67258 | true | OK |
| mcp_wrapper_pack | 200 | 44104 | true | OK |
| channel_shortlist | 200 | 6100 | true | OK |
| api_directory_submission | 200 | 41335 | true | OK |
| rapidapi_listing | 200 | 43020 | true | OK |
| postman_workspace_draft | 200 | 9559 | true | OK |
| full_chain_idempotency_probe | 200 | 8745 | true | OK |
| action_pack_gate_probe | 200 | 6070 | true | OK |
| distribution_monitor | 200 | 68148 | true | OK |

## Checks

| Check | Result | Details |
|---|---|---|
| robots_txt_reachable | OK | HTTP 200; bytes=12230; json=null; markers=2/2; secrets=0 |
| llms_txt_reachable | OK | HTTP 200; bytes=28734; json=null; markers=3/3; secrets=0 |
| sitemap_xml_reachable | OK | HTTP 200; bytes=19554; json=null; markers=2/2; secrets=0 |
| well_known_machine_discovery_reachable | OK | HTTP 200; bytes=49986; json=true; markers=2/2; secrets=0 |
| machine_discovery_primary_customer_interface | OK | primary_customer_interface=machine |
| machine_discovery_base_url_present | OK | base_url=https://machinesignal-api.beta-878.workers.dev |
| discovery_link_product_catalog | OK | https://machinesignal.it/product-catalog.json |
| product_catalog_reachable | OK | HTTP 200; bytes=12086; json=true; markers=2/2; secrets=0 |
| discovery_link_machine_onboarding | OK | https://machinesignal.it/machine-onboarding.json |
| machine_onboarding_reachable | OK | HTTP 200; bytes=73671; json=true; markers=2/2; secrets=0 |
| discovery_link_openapi | OK | https://machinesignal.it/openapi.json |
| openapi_reachable | OK | HTTP 200; bytes=61595; json=true; markers=2/2; secrets=0 |
| discovery_link_postman_public_collection | OK | https://machinesignal.it/postman_public_collection.json |
| postman_public_collection_reachable | OK | HTTP 200; bytes=27631; json=true; markers=1/1; secrets=0 |
| discovery_link_mcp_tool_manifest | OK | https://machinesignal.it/mcp-tool-manifest.json |
| mcp_tool_manifest_reachable | OK | HTTP 200; bytes=67258; json=true; markers=2/2; secrets=0 |
| discovery_link_well_known_mcp_tool_manifest | OK | https://machinesignal.it/.well-known/mcp-tool-manifest.json |
| well_known_mcp_tool_manifest_reachable | OK | HTTP 200; bytes=67258; json=true; markers=2/2; secrets=0 |
| discovery_link_mcp_wrapper_pack | OK | https://machinesignal.it/mcp/machinesignal-mcp-wrapper.json |
| mcp_wrapper_pack_reachable | OK | HTTP 200; bytes=44104; json=true; markers=1/1; secrets=0 |
| discovery_link_channel_shortlist | OK | https://machinesignal.it/distribution/channel-shortlist.json |
| channel_shortlist_reachable | OK | HTTP 200; bytes=6100; json=true; markers=1/1; secrets=0 |
| discovery_link_api_directory_submission | OK | https://machinesignal.it/distribution/api-directory-submission.json |
| api_directory_submission_reachable | OK | HTTP 200; bytes=41335; json=true; markers=1/1; secrets=0 |
| discovery_link_rapidapi_listing | OK | https://machinesignal.it/distribution/rapidapi-listing.json |
| rapidapi_listing_reachable | OK | HTTP 200; bytes=43020; json=true; markers=1/1; secrets=0 |
| discovery_link_postman_workspace_draft | OK | https://machinesignal.it/distribution/postman-public-workspace-draft.json |
| postman_workspace_draft_reachable | OK | HTTP 200; bytes=9559; json=true; markers=1/1; secrets=0 |
| discovery_link_full_chain_idempotency_probe | OK | https://machinesignal.it/mcp_full_chain_idempotency_probe_summary_20260611.json |
| full_chain_idempotency_probe_reachable | OK | HTTP 200; bytes=8745; json=true; markers=1/1; secrets=0 |
| discovery_link_action_pack_gate_probe | OK | https://machinesignal.it/mcp_action_pack_deep_analysis_gate_probe_summary_20260610.json |
| action_pack_gate_probe_reachable | OK | HTTP 200; bytes=6070; json=true; markers=1/1; secrets=0 |
| discovery_link_distribution_monitor | OK | https://machinesignal.it/distribution_readiness_monitor_summary_20260607.json |
| distribution_monitor_reachable | OK | HTTP 200; bytes=68148; json=true; markers=1/1; secrets=0 |
| openapi_exposes_/v1/sandbox/customers | OK | present |
| openapi_exposes_/v1/lead-opportunity-score | OK | present |
| openapi_exposes_/v1/purchase-intent | OK | present |
| openapi_exposes_/v1/orders | OK | present |
| openapi_exposes_/v1/usage | OK | present |
| openapi_documents_idempotency | OK | OpenAPI mentions Idempotency-Key |
| openapi_documents_gate_errors | OK | purchase-intent docs mention Deep Analysis and Action Pack gate errors |
| postman_includes_Create limited sandbox customer | OK | present |
| postman_includes_Score business domain | OK | present |
| postman_includes_Create beta purchase intent | OK | present |
| postman_includes_Order deep analysis after a strong score | OK | present |
| postman_includes_Order action pack after confirmed opportunity | OK | present |
| postman_includes_Repeat same score without double charge | OK | present |
| mcp_manifest_exposes_get_product_catalog | OK | present |
| mcp_manifest_exposes_get_machine_onboarding | OK | present |
| mcp_manifest_exposes_get_machine_api_sandbox_test | OK | present |
| mcp_manifest_exposes_score_lead_opportunity | OK | present |
| mcp_manifest_exposes_create_purchase_intent | OK | present |
| mcp_manifest_exposes_get_usage | OK | present |
| mcp_manifest_exposes_get_order | OK | present |
| mcp_manifest_has_public_read_tools | OK | 20 public no-auth GET tools |
| mcp_manifest_classifies_post_tools | OK | 4 POST tools |
| channel_shortlist_has_own_domain | OK | done_keep_improving |
| channel_shortlist_has_github | OK | active |
| channel_shortlist_has_postman | OK | ready_next |
| channel_shortlist_has_mcp_channels | OK | 2 MCP-related channels |
| channel_shortlist_machine_first_rule | OK | Do not rely on human cold email. Prioritize machine-readable assets, public API documentation and sandbox-callable flows. |
| idempotency_probe_current_ok | OK | ok=true; score_dup=true; deep_dup=true; action_dup=true |
| action_pack_gate_probe_current_ok | OK | ok=true; blocked=action_pack_gate_failed; gate=true |
| distribution_monitor_current_ok | OK | ok=true; failed=0 |
| rapidapi_listing_monetization_disabled | OK | RapidAPI-style listing is metadata-ready and does not expose live monetization secrets |
| postman_workspace_public_visibility_blocked_until_owner_approval | OK | Postman workspace draft remains owner-supervised |
| no_write_policy_respected | OK | probe executed only GET requests |

## Interpretation

MachineSignal is discoverable through owned machine-readable surfaces and versioned public artifacts. The current safe distribution posture is sandbox/private-draft/NoWrite: machines can inspect docs, manifests, examples, probes and channel copy, but this probe does not create customers, score targets, purchase products, publish to external marketplaces, contact humans or enable live monetization.
