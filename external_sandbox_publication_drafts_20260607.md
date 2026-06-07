# MachineSignal External Sandbox Publication Drafts

Generated: 2026-06-07

Status: ready for sandbox-only draft preparation. Public irreversible publication remains blocked until owner approval.

## Master Rule

These drafts are for machine discovery and sandbox evaluation only. They can be used to prepare external listings, but they must not activate live payments, public paid plans, real API keys, invoices, legal commitments or human outbound outreach.

## Channel 1: Postman Workspace Draft

### Draft Status

Prepare as private or team workspace first. Public visibility is blocked until final in-Postman secret scan and owner approval.

### Workspace Name

MachineSignal Lead Opportunity Score API

### Workspace Summary

Machine-first lead opportunity scoring API for CRMs, AI agents and workflow automations.

### Workspace Description

MachineSignal lets automated systems create a limited sandbox key, score business domains, request beta deliverables, simulate sandbox checkout and reconcile test credits without a human sales conversation.

The workspace is for sandbox evaluation only. It does not execute real payments, issue fiscal invoices or contact external targets. Latest bounded beta evidence completed 5 scores, 1 Deep Analysis and 1 gated Action Pack while payment, invoice and external contact stayed false.

### Import Assets

- Collection: https://machinesignal.it/postman_public_collection.json
- Environment template: https://machinesignal.it/postman_public_environment_template.json
- Import pack: https://machinesignal.it/postman_workspace_import_pack_20260606.json
- Secret scan: https://machinesignal.it/postman_workspace_secret_scan_20260606.json
- Evidence brief: https://machinesignal.it/machine_beta_evidence_brief_20260607.html
- Sandbox-only publication pack: https://machinesignal.it/sandbox_only_external_publication_pack_20260607.json

### Blocked

- Do not publish a real API key.
- Do not make the workspace public before owner approval.
- Do not claim live payment is available.
- Do not include credentials in environment variables.

## Channel 2: Generic API Directory Draft

### Listing Title

MachineSignal Lead Opportunity Score API

### Short Description

Machine-first lead opportunity scoring and spend-control API for CRMs, AI agents, RevOps workflows and software platforms.

### Long Description

MachineSignal helps automated systems decide whether a business domain deserves more analysis, enrichment or CRM action. The API returns score, confidence, decision, spend policy and next machine action.

If a machine has no list, it can request Target Discovery for a declared commercial objective. If a score is strong, it can request Deep Analysis as a spend-control gate. Only after Deep Analysis confirms the action gate should the machine request Action Pack, which returns CRM-ready JSON and workflow payloads.

The current publication mode is sandbox-only. A machine can create a limited sandbox key and test the flow without a human sales conversation. Live payments, real invoices, external target contact and public paid plans are blocked until owner approval.

### Categories

- Sales Intelligence
- CRM Automation
- Lead Scoring
- RevOps
- AI Agent Tools
- Workflow Automation
- Data Enrichment

### Core Links

- Website: https://machinesignal.it/
- OpenAPI: https://machinesignal.it/openapi.json
- Product catalog: https://machinesignal.it/product-catalog.json
- Machine onboarding: https://machinesignal.it/machine-onboarding.json
- llms.txt: https://machinesignal.it/llms.txt
- Distribution pack: https://machinesignal.it/distribution/
- Evidence brief: https://machinesignal.it/machine_beta_evidence_brief_20260607.html

### Blocked

- Do not submit as a paid production service.
- Do not claim customer support SLAs.
- Do not claim legal/fiscal readiness.
- Do not publish before owner approval if the directory action is irreversible.

## Channel 3: RapidAPI-Style Draft

### Draft Status

Prepare provider metadata only. Monetization must stay disabled.

### API Name

MachineSignal Lead Opportunity Score API

### Category

Business / Sales Intelligence / CRM / Data Enrichment / AI Agent Tools

### Short Description

Machine-first lead opportunity scoring API for CRM workflows, RevOps automations and AI agents.

### Pricing State

Sandbox-only. Public paid plans are not active. Prices remain part of the business model under test, not a live marketplace checkout.

### Endpoint Showcase

- `GET /health`
- `GET /machine-onboarding.json`
- `GET /product-catalog.json`
- `POST /v1/sandbox/customers`
- `GET /v1/onboarding`
- `POST /v1/lead-opportunity-score`
- `POST /v1/purchase-intent`
- `POST /v1/payment-test/intents`
- `GET /v1/payment-test/reconciliation/{payment_test_id}`
- `GET /v1/orders`

### Blocked

- Do not activate paid plans.
- Do not connect live checkout.
- Do not publish production API keys.
- Do not list as generally available production service.

## Channel 4: MCP / Agent Tool Registry Draft

### Draft Status

Prepare local stdio adapter listing and manifest. Hosted MCP publication remains a later decision.

### Tool Name

MachineSignal Lead Opportunity Score Tools

### Description

MCP-style local adapter for CRMs, AI agents and workflow engines that want to expose MachineSignal lead scoring, product catalog, sandbox customer creation, purchase intents, order retrieval and payment-test reconciliation as callable tools.

### Current Transport

Local stdio JSON-RPC adapter.

### Public Assets

- MCP page: https://machinesignal.it/mcp/
- MCP wrapper pack: https://machinesignal.it/mcp/machinesignal-mcp-wrapper.json
- Tool manifest: https://machinesignal.it/mcp-tool-manifest.json
- Well-known tool manifest: https://machinesignal.it/.well-known/mcp-tool-manifest.json
- Repository: https://github.com/machinesignal-it/machinesignal-lead-opportunity-score

### Blocked

- Do not claim hosted MCP is live.
- Do not submit to registries that require a hosted endpoint unless owner approves the next build.
- Do not expose customer keys.

## Final Readiness Checklist

Before any draft becomes public externally:

1. Distribution Readiness Monitor is OK.
2. Secret scan is OK.
3. OpenAPI, Postman, MCP, `llms.txt`, product catalog and onboarding links are reachable.
4. Evidence brief is linked.
5. Sandbox-only publication pack is linked.
6. No live payment, invoice, external contact or SLA is claimed.
7. Owner approval is recorded.

## Current Recommendation

Proceed with draft preparation in this order:

1. Postman private/team workspace draft.
2. Generic API directory sandbox draft.
3. RapidAPI-style provider metadata with monetization disabled.
4. MCP/tool registry local-adapter draft.

Stop before irreversible public publication.

