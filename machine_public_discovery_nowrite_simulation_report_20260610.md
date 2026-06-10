# MachineSignal - Public Machine Discovery NoWrite Simulation - 2026-06-10

## Result

Status: completed_machine_public_discovery_nowrite

OK: true

Mode: NoWriteMachineDiscoverySimulation

Write calls executed: 0

POST calls executed: 0

Real payment executed: false

External contact executed: false

Hosted MCP live: false

## What This Simulates

A software client, CRM workflow or AI agent starts from public MachineSignal discovery surfaces. It reads llms.txt, .well-known/machine-discovery.json, the MCP tool manifest and the private MCP/tool-registry draft pack. It verifies that MachineSignal is machine-first, local-adapter-first, sandbox/private-draft only and safe to evaluate without sending email to humans or executing payments.

## Machine Decision Path

1. Read public machine discovery resources.
2. Confirm the customer interface is machine-first.
3. Confirm public hosted MCP is not live.
4. Confirm the local stdio adapter is the current MCP path.
5. Confirm the private tool-registry pack exists.
6. Confirm NoWrite reviews and distribution monitor are OK.
7. Stop before sandbox creation, purchase intent, checkout, external publication or outreach.

## Resources

| Resource | HTTP | Bytes | JSON | Result |
|---|---:|---:|---|---|
| llms_txt | 200 | 22658 | null | OK |
| machine_discovery | 200 | 47656 | true | OK |
| product_catalog | 200 | 12370 | true | OK |
| machine_onboarding | 200 | 52703 | true | OK |
| openapi | 200 | 58945 | true | OK |
| postman_collection | 200 | 27401 | true | OK |
| mcp_tool_manifest | 200 | 47302 | true | OK |
| well_known_mcp_tool_manifest | 200 | 47302 | true | OK |
| mcp_wrapper_pack | 200 | 26037 | true | OK |
| mcp_installation_pack | 200 | 22635 | true | OK |
| mcp_private_draft_pack | 200 | 7155 | true | OK |
| mcp_private_draft_review | 200 | 11232 | true | OK |
| external_submission_nowrite_review | 200 | 53607 | true | OK |
| distribution_readiness_monitor | 200 | 52520 | true | OK |

## Checks

| Check | Result | Details |
|---|---|---|
| llms_txt_reachable | OK | HTTP 200; bytes=22658; json=null; secrets=0 |
| machine_discovery_reachable | OK | HTTP 200; bytes=47656; json=true; secrets=0 |
| machine_discovery_primary_customer_interface | OK | primary_customer_interface=machine |
| machine_discovery_base_url_present | OK | base_url=https://machinesignal-api.beta-878.workers.dev |
| discovery_link_product_catalog | OK | https://machinesignal.it/product-catalog.json |
| product_catalog_reachable | OK | HTTP 200; bytes=12370; json=true; secrets=0 |
| discovery_link_machine_onboarding | OK | https://machinesignal.it/machine-onboarding.json |
| machine_onboarding_reachable | OK | HTTP 200; bytes=52703; json=true; secrets=0 |
| discovery_link_openapi | OK | https://machinesignal.it/openapi.json |
| openapi_reachable | OK | HTTP 200; bytes=58945; json=true; secrets=0 |
| discovery_link_postman_collection | OK | https://machinesignal.it/postman_collection.json |
| postman_collection_reachable | OK | HTTP 200; bytes=27401; json=true; secrets=0 |
| discovery_link_mcp_tool_manifest | OK | https://machinesignal.it/mcp-tool-manifest.json |
| mcp_tool_manifest_reachable | OK | HTTP 200; bytes=47302; json=true; secrets=0 |
| discovery_link_well_known_mcp_tool_manifest | OK | https://machinesignal.it/.well-known/mcp-tool-manifest.json |
| well_known_mcp_tool_manifest_reachable | OK | HTTP 200; bytes=47302; json=true; secrets=0 |
| discovery_link_mcp_wrapper_pack | OK | https://machinesignal.it/mcp/machinesignal-mcp-wrapper.json |
| mcp_wrapper_pack_reachable | OK | HTTP 200; bytes=26037; json=true; secrets=0 |
| discovery_link_mcp_installation_pack | OK | https://machinesignal.it/mcp-machine-client-installation-pack.json |
| mcp_installation_pack_reachable | OK | HTTP 200; bytes=22635; json=true; secrets=0 |
| discovery_link_mcp_private_draft_pack | OK | https://machinesignal.it/mcp_tool_registry_private_draft_pack_20260608.json |
| mcp_private_draft_pack_reachable | OK | HTTP 200; bytes=7155; json=true; secrets=0 |
| discovery_link_mcp_private_draft_review | OK | https://machinesignal.it/mcp_tool_registry_private_draft_review_summary_20260608.json |
| mcp_private_draft_review_reachable | OK | HTTP 200; bytes=11232; json=true; secrets=0 |
| discovery_link_external_submission_nowrite_review | OK | https://machinesignal.it/external_submission_pack_no_write_review_summary_20260608.json |
| external_submission_nowrite_review_reachable | OK | HTTP 200; bytes=53607; json=true; secrets=0 |
| discovery_link_distribution_readiness_monitor | OK | https://machinesignal.it/distribution_readiness_monitor_summary_20260607.json |
| distribution_readiness_monitor_reachable | OK | HTTP 200; bytes=52520; json=true; secrets=0 |
| manifest_exposes_get_product_catalog | OK | present |
| manifest_exposes_get_machine_onboarding | OK | present |
| manifest_exposes_get_machine_api_sandbox_test | OK | present |
| manifest_exposes_get_mcp_tool_registry_private_draft_pack | OK | present |
| manifest_exposes_get_mcp_tool_registry_private_draft_review | OK | present |
| manifest_has_readable_public_tools | OK | 20 public GET tools |
| manifest_post_tools_classified | OK | 4 POST tools classified |
| mcp_public_server_not_live | OK | public_mcp_server_live=false |
| mcp_wrapper_local_adapter_available | OK | wrapper mentions local stdio adapter |
| private_draft_status_valid | OK | status=ready_for_mcp_tool_registry_private_draft_only |
| private_draft_review_ok | OK | ok=true; writes=0; posts=0 |
| external_nowrite_review_ok | OK | ok=true; writes=0; posts=0 |
| distribution_monitor_ok | OK | ok=true; failed=0 |
| draft_safety_external_publication_executed | OK | external_publication_executed=false |
| draft_safety_irreversible_submission_executed | OK | irreversible_submission_executed=false |
| draft_safety_live_monetization_enabled | OK | live_monetization_enabled=false |
| draft_safety_public_paid_plans_enabled | OK | public_paid_plans_enabled=false |
| draft_safety_hosted_mcp_live | OK | hosted_mcp_live=false |
| draft_safety_hosted_mcp_endpoint_published | OK | hosted_mcp_endpoint_published=false |
| draft_safety_real_payment_executed | OK | real_payment_executed=false |
| draft_safety_real_invoice_issued | OK | real_invoice_issued=false |
| draft_safety_external_contact_executed | OK | external_contact_executed=false |
| draft_safety_production_api_key_published | OK | production_api_key_published=false |
| draft_safety_human_outreach_allowed | OK | human_outreach_allowed=false |
| draft_safety_writes_zero | OK | write_calls=0 |
| draft_safety_posts_zero | OK | post_calls=0 |

## Tool Discovery Summary

- Total manifest tools: `31`
- Public no-auth GET tools: `20`
- POST tools classified but not executed: `4`
- Required MCP/private-draft tools present: `get_product_catalog, get_machine_onboarding, get_machine_api_sandbox_test, get_mcp_tool_registry_private_draft_pack, get_mcp_tool_registry_private_draft_review`

## Interpretation

The public surfaces are sufficient for a machine to discover MachineSignal, understand the current MCP/local-adapter path, find product and onboarding materials, and stop safely before any action that would create records, spend budget, publish externally, contact humans or enable monetization.

This is a NoWrite proof. It complements the earlier sandbox buyer tests by validating technical discoverability without consuming Cloudflare KV write quota.
