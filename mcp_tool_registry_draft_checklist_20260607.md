# MachineSignal MCP and Tool Registry Draft Checklist

Generated: 2026-06-07

Status: ready for sandbox-only draft preparation. Hosted public MCP publication, production keys and monetization remain blocked until owner approval.

## Objective

Prepare MachineSignal for MCP-style clients, AI agent tool registries and local tool catalogs where machines can discover, install and test the service as a tool.

This checklist is not a public launch. It does not authorize hosted MCP exposure, production credentials, paid plans, external human outreach or live customer commitments.

## Master Rules

- Publish only draft, sandbox or local-adapter metadata.
- Keep the public hosted MCP server marked as not live.
- Use the local stdio adapter as the current implementation.
- Do not publish production API keys.
- Do not enable payments or paid plans.
- Do not claim SLA, legal, fiscal or production readiness.
- Do not contact human prospects or target companies.
- Stop before irreversible external registry publication unless owner approval is recorded.

## Registry Listing Fields

| Field | Value |
| --- | --- |
| Tool name | `MachineSignal Lead Opportunity Score` |
| Short description | `Machine-first lead scoring, target discovery and spend-control tool for CRMs, AI agents and automated RevOps workflows.` |
| Primary user | `Machine: CRM, AI agent, workflow, enrichment pipeline or software buyer.` |
| Human role | `Owner supervision, approval and audit only.` |
| Website | `https://machinesignal.it/` |
| Tool manifest | `https://machinesignal.it/mcp-tool-manifest.json` |
| Well-known manifest | `https://machinesignal.it/.well-known/mcp-tool-manifest.json` |
| Wrapper pack | `https://machinesignal.it/mcp/machinesignal-mcp-wrapper.json` |
| Installation pack | `https://machinesignal.it/mcp-machine-client-installation-pack.json` |
| Repository | `https://github.com/machinesignal-it/machinesignal-lead-opportunity-score` |
| Local adapter path | `mcp_adapter/machinesignal_mcp_server.py` |
| Client config example | `mcp_adapter/mcp_client_config.example.json` |
| Transport now | `stdio_json_rpc` |
| Hosted MCP live | `false` |
| Sandbox endpoint | `https://machinesignal-api.beta-878.workers.dev/v1/sandbox/customers` |
| OpenAPI | `https://machinesignal.it/openapi.json` |
| Product catalog | `https://machinesignal.it/product-catalog.json` |
| Machine onboarding | `https://machinesignal.it/machine-onboarding.json` |
| Evidence brief | `https://machinesignal.it/machine_beta_evidence_brief_20260607.json` |

## Registry Long Description

MachineSignal exposes lead opportunity scoring, Target Discovery, Deep Analysis, Action Pack, orders, usage and payment-test reconciliation as machine-readable tools.

The current implementation is designed for machine customers: CRMs, AI agents, workflow automations and enrichment pipelines. A machine can read the manifest, create a limited sandbox customer, request target discovery when it has no list, score a domain, buy only the recommended add-on in beta mode and verify usage without a human sales conversation.

The current MCP mode is local-adapter first. The customer machine runs the stdio adapter from the GitHub repository and the adapter calls the public HTTP API. Hosted public MCP is not live yet and must remain marked as a later decision.

## Tool Groups

### Public Discovery Tools

- `get_product_catalog`
- `get_machine_onboarding`
- `get_marketplace_api_directory_pack`
- `get_marketplace_publication_execution_pack`
- `get_machine_api_sandbox_test`
- `get_machine_buyer_evidence_brief`
- `get_mcp_tool_registry_draft_checklist`

### Sandbox Buyer Tools

- `create_sandbox_customer`
- `get_usage`
- `score_lead_opportunity`
- `create_purchase_intent`
- `list_orders`
- `get_order`
- `create_payment_test_intent`
- `reconcile_payment_test`

### Spend-Control Rule

A machine should call tools in this order:

1. Read catalog and onboarding.
2. Create a sandbox customer.
3. Request Target Discovery only if it has no lead list.
4. Score the discovered or provided target.
5. Request Deep Analysis only if the score and confidence pass the gate.
6. Request Action Pack only after Deep Analysis confirms the action gate.
7. Read usage and orders after each paid-beta intent.

## Registry Tags

`mcp`, `ai-agent-tool`, `tool-registry`, `lead-scoring`, `crm`, `revops`, `machine-customer`, `target-discovery`, `deep-analysis`, `action-pack`, `spend-control`, `openapi`, `llms-txt`

## Submission Gate

Before any public tool registry submission:

1. Distribution Readiness Monitor is OK.
2. Secret scan is OK.
3. Manifest and well-known manifest are reachable.
4. Local adapter installation validation has been reviewed.
5. Hosted MCP is still marked as not live unless explicitly approved.
6. No production API key is included.
7. Monetization remains disabled in registry copy.
8. Legal/fiscal readiness has been reviewed.
9. Owner approval is recorded.

## Blocked Actions

Agents must not:

- publish a hosted MCP endpoint as live;
- submit to an external registry irreversibly;
- publish production API keys;
- enable paid plans or live checkout;
- claim enterprise SLA, support SLA, legal readiness or fiscal readiness;
- contact human prospects;
- contact target companies;
- send external emails as primary distribution;
- make real payments or generate fiscal invoices.

## Current Recommendation

Prepare MCP/tool-registry fields as draft metadata only. Keep the current implementation local-adapter first and stop before public hosted MCP or irreversible external publication.
