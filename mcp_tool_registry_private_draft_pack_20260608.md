# MachineSignal - MCP Tool Registry Private Draft Pack - 2026-06-08

Status: ready_for_mcp_tool_registry_private_draft_only

Primary customer interface: machine

Channel: mcp_tool_registry_local_adapter_private_draft

## Purpose

Prepare exact MCP/tool-registry metadata for private or unsubmitted agent-tool catalogs.

This is not a public launch. It does not authorize hosted MCP publication, irreversible external registry submission, public paid plans, live checkout, production keys, human outreach or external target contact.

## Plain-Language Summary

MachineSignal can be presented to machines as a tool. The machine customer can be a CRM, an AI agent, a workflow automation, an enrichment pipeline or another software buyer.

Current mode is local adapter first. The customer machine runs the local stdio adapter from the GitHub repository. The adapter then calls the public HTTP API.

Hosted public MCP is not live.

## Listing Fields

Tool name: MachineSignal Lead Opportunity Score

Provider: MachineSignal

Visibility: private_draft_or_unsubmitted

Transport now: stdio_json_rpc_local_adapter

Hosted MCP live: false

Monetization: disabled

Short description: Machine-first lead scoring, target discovery and spend-control tool for CRMs, AI agents and automated RevOps workflows.

Primary user: Machine: CRM, AI agent, workflow, enrichment pipeline or software buyer.

Human role: Owner supervision, approval and audit only.

Website: https://machinesignal.it/

Tool manifest: https://machinesignal.it/mcp-tool-manifest.json

Well-known manifest: https://machinesignal.it/.well-known/mcp-tool-manifest.json

Wrapper pack: https://machinesignal.it/mcp/machinesignal-mcp-wrapper.json

Installation pack: https://machinesignal.it/mcp-machine-client-installation-pack.json

Repository: https://github.com/machinesignal-it/machinesignal-lead-opportunity-score

Local adapter path: mcp_adapter/machinesignal_mcp_server.py

Client config example: mcp_adapter/mcp_client_config.example.json

OpenAPI: https://machinesignal.it/openapi.json

Product catalog: https://machinesignal.it/product-catalog.json

Machine onboarding: https://machinesignal.it/machine-onboarding.json

## Draft Safety State

- write_calls_executed=0
- post_calls_executed=0
- external_publication_executed=false
- irreversible_submission_executed=false
- live_monetization_enabled=false
- public_paid_plans_enabled=false
- hosted_mcp_live=false
- hosted_mcp_endpoint_published=false
- real_payment_executed=false
- real_invoice_issued=false
- external_contact_executed=false
- production_api_key_published=false
- human_outreach_allowed=false

## Tools to Expose in Private Draft

- get_product_catalog
- get_machine_onboarding
- get_machine_api_sandbox_test
- create_sandbox_customer
- get_customer_onboarding
- score_lead_opportunity
- create_purchase_intent
- list_orders
- get_order
- get_usage
- create_payment_test_intent
- get_payment_test_reconciliation
- get_machine_buyer_evidence_brief
- get_mcp_tool_registry_draft_checklist
- get_mcp_tool_registry_private_draft_pack

## Spend-Control Rule

1. Read catalog and onboarding.
2. Create sandbox customer only for test.
3. Request Target Discovery only if no lead list exists.
4. Score discovered or provided target.
5. Request Deep Analysis only if score and confidence pass gate.
6. Request Action Pack only after Deep Analysis confirms action gate.
7. Read usage and orders after each beta intent.

## Blocked Before Registry Submit

- claim hosted MCP live;
- publish hosted MCP endpoint;
- irreversible external registry publication;
- public paid plan creation;
- live checkout activation;
- production key distribution;
- claim production availability;
- claim enterprise SLA;
- legal or fiscal commitment;
- external human outreach;
- external target company contact.

## Evidence Links

- MCP checklist: https://machinesignal.it/mcp_tool_registry_draft_checklist_20260607.json
- MCP manifest: https://machinesignal.it/mcp-tool-manifest.json
- MCP wrapper: https://machinesignal.it/mcp/machinesignal-mcp-wrapper.json
- Installation pack: https://machinesignal.it/mcp-machine-client-installation-pack.json
- Private Draft Submission Rehearsal: https://machinesignal.it/private_draft_submission_rehearsal_summary_20260608.json
- External Submission NoWrite Review: https://machinesignal.it/external_submission_pack_no_write_review_summary_20260608.json
- Distribution Monitor: https://machinesignal.it/distribution_readiness_monitor_summary_20260607.json

## Machine Decision

Decision: prepare_mcp_tool_registry_private_draft_only

Recommended next step: use this pack to prepare owner-supervised private or unsubmitted MCP/tool-registry metadata. Stop before hosted MCP launch, irreversible registry submission, monetization, live checkout, production credentials or outreach.
