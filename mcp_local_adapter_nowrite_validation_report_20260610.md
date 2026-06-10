# MachineSignal - MCP Local Adapter NoWrite Validation - 2026-06-10

## Result

Status: completed_mcp_local_adapter_nowrite_validation

OK: True

Mode: NoWriteMcpLocalAdapterValidation

Write calls executed: 0

POST calls executed: 0

Real payment executed: False

External contact executed: False

## What This Validates

A machine client can start the local stdio MCP adapter, initialize it, list the available MachineSignal tools and read public/no-auth resources through the adapter. The validation confirms the new MCP private-draft tools are visible and callable as read-only tools.

## Public Tools Called

| Tool | HTTP | Result | Auth |
|---|---:|---|---|
| get_product_catalog | 200 | OK | none |
| get_machine_onboarding | 200 | OK | none |
| get_marketplace_api_directory_pack | 200 | OK | none |
| get_machine_api_sandbox_test | 200 | OK | none |
| get_machine_buyer_evidence_brief | 200 | OK | none |
| get_mcp_tool_registry_draft_checklist | 200 | OK | none |
| get_external_submission_pack_no_write_review | 200 | OK | none |
| get_external_draft_submission_bundle | 200 | OK | none |
| get_private_draft_submission_rehearsal | 200 | OK | none |
| get_api_directory_private_draft_pack | 200 | OK | none |
| get_api_directory_private_draft_review | 200 | OK | none |
| get_rapidapi_unpublished_provider_draft_pack | 200 | OK | none |
| get_rapidapi_unpublished_provider_draft_review | 200 | OK | none |
| get_mcp_tool_registry_private_draft_pack | 200 | OK | none |
| get_mcp_tool_registry_private_draft_review | 200 | OK | none |

## Write/POST Tools Not Called

| Tool | Status |
|---|---|
| create_payment_test_intent | not executed |
| create_purchase_intent | not executed |
| create_sandbox_customer | not executed |
| score_lead_opportunity | not executed |

## Checks

| Check | Result | Details |
|---|---|---|
| adapter_file_exists | OK | C:\Users\natal\AppData\Local\Temp\MachineSignal\github_repo_sync_20260530\mcp_adapter\machinesignal_mcp_server.py |
| client_config_exists | OK | C:\Users\natal\AppData\Local\Temp\MachineSignal\github_repo_sync_20260530\mcp_adapter\mcp_client_config.example.json |
| client_config_has_machinesignal_server | OK | mcpServers.machinesignal |
| mcp_initialize | OK | {'name': 'machinesignal-local-mcp-adapter', 'version': '2026-06-04'} |
| mcp_tools_list | OK | 31 tools listed |
| public_nowrite_tools_present | OK | missing=[] |
| write_tools_present_but_not_called | OK | listed_only=['create_payment_test_intent', 'create_purchase_intent', 'create_sandbox_customer', 'score_lead_opportunity'] |
| get_product_catalog_read | OK | HTTP 200; auth=none |
| get_machine_onboarding_read | OK | HTTP 200; auth=none |
| get_marketplace_api_directory_pack_read | OK | HTTP 200; auth=none |
| get_machine_api_sandbox_test_read | OK | HTTP 200; auth=none |
| get_machine_buyer_evidence_brief_read | OK | HTTP 200; auth=none |
| get_mcp_tool_registry_draft_checklist_read | OK | HTTP 200; auth=none |
| get_external_submission_pack_no_write_review_read | OK | HTTP 200; auth=none |
| external_submission_nowrite_review_ok | OK | ok=True; writes=0; posts=0 |
| get_external_draft_submission_bundle_read | OK | HTTP 200; auth=none |
| get_private_draft_submission_rehearsal_read | OK | HTTP 200; auth=none |
| get_api_directory_private_draft_pack_read | OK | HTTP 200; auth=none |
| get_api_directory_private_draft_review_read | OK | HTTP 200; auth=none |
| get_rapidapi_unpublished_provider_draft_pack_read | OK | HTTP 200; auth=none |
| get_rapidapi_unpublished_provider_draft_review_read | OK | HTTP 200; auth=none |
| get_mcp_tool_registry_private_draft_pack_read | OK | HTTP 200; auth=none |
| mcp_private_draft_pack_status | OK | status=ready_for_mcp_tool_registry_private_draft_only |
| mcp_private_draft_pack_hosted_mcp_false | OK | hosted_mcp_live=False |
| get_mcp_tool_registry_private_draft_review_read | OK | HTTP 200; auth=none |
| mcp_private_draft_review_nowrite_ok | OK | ok=True; writes=0; posts=0 |

## Interpretation

The local adapter is installable and usable by a machine in NoWrite mode. It can expose MachineSignal discovery, onboarding, evidence, API-directory, RapidAPI-style and MCP/tool-registry private-draft materials without creating a sandbox, consuming credits, creating purchase intents, enabling payments, publishing externally or contacting humans.
