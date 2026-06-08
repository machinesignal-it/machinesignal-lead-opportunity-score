# MachineSignal - Private Draft Submission Rehearsal - 2026-06-08

## Result

Status: completed_private_draft_submission_rehearsal

OK: true

Primary customer interface: machine

Mode: NoWritePrivateDraftSubmissionRehearsal

Write calls executed: 0

POST calls executed: 0

External publication executed: false

Live monetization enabled: false

Hosted MCP live: false

## What This Simulated

A NoWrite machine rehearsal simulates a machine buyer or API directory bot reading MachineSignal public discovery files, reconstructing private draft listing metadata and deciding whether each external channel is ready for a private or unpublished draft.

This is not a marketplace submission. It does not contact humans, does not publish to a third-party marketplace, does not create paid plans, does not expose production keys and does not launch hosted MCP. Human outreach and external target contact remain blocked.

## Channel Rehearsal

| Channel | Private draft ready | Draft status | Blocked actions |
|---|---|---|---|
| generic_api_directory_private_draft | OK | draft_only | irreversible_public_submission, production_key_publication, live_payment_claim, human_outreach |
| rapidapi_style_unpublished_provider_draft | OK | metadata_ready_monetization_disabled | create_public_paid_plans, connect_live_checkout, claim_production_availability, publish_production_credentials |
| mcp_tool_registry_local_adapter_draft | OK | local_adapter_draft_only | claim_hosted_mcp_live, submit_to_registry_requiring_hosted_endpoint_without_build, publish_customer_or_production_keys, enable_paid_plans |
| postman_private_or_team_workspace | OK | private_or_team_draft_only | public_workspace_publication_without_secret_scan, production_environment_publication, real_customer_key_publication |

## Resource Checks

| Resource | Status | HTTP | Bytes | Missing markers | Hard fails |
|---|---|---:|---:|---|---|
| machine_discovery | OK | 200 | 23084 | - | - |
| external_draft_submission_bundle | OK | 200 | 12396 | - | - |
| api_directory_submission | OK | 200 | 8667 | - | - |
| rapidapi_listing | OK | 200 | 11250 | - | - |
| mcp_tool_manifest | OK | 200 | 36537 | - | - |
| mcp_wrapper | OK | 200 | 18560 | - | - |
| postman_workspace_draft | OK | 200 | 9559 | - | - |
| postman_private_workspace_checklist | OK | 200 | 5098 | - | - |
| openapi | OK | 200 | 58945 | - | - |
| machine_onboarding | OK | 200 | 45715 | - | - |
| external_submission_nowrite_review | OK | 200 | 29953 | - | - |
| distribution_readiness_monitor | OK | 200 | 41990 | - | - |

## Machine Decision

Decision: prepare_private_draft_only

Recommended next step: Use the bundle to prepare an owner-supervised private API-directory draft rehearsal. Stop before final submit, paid plan creation, hosted MCP launch or external outreach.

## Go-Live Blockers

- legal and fiscal setup
- terms of service and privacy/commercial terms
- live payment processor setup
- invoice/accounting workflow
- production key policy
- rate limits and abuse controls
- customer support and refund policy
- owner approval
