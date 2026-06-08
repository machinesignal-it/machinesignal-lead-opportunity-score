# MachineSignal Marketplace Publication Execution Pack

Generated: 2026-06-06

Status: ready for sandbox-only publication preparation with full bounded beta evidence.

## Purpose

This pack turns the MachineSignal marketplace/API directory material into operational publication instructions for agents.

The goal is not human cold email. The goal is to place MachineSignal where software, CRMs, AI agents, API directories and workflow tools can discover, read, import and test it.

## Non-negotiable guardrails

- Do not publish real API keys.
- Do not claim live payment is available.
- Do not publish monetized checkout until legal, fiscal, payment, privacy and refund controls are ready.
- Do not send external outreach to targets.
- Do not run write or credit-consuming API tests unless explicitly approved.
- Keep Postman/RapidAPI/API directory work sandbox-only.
- Keep the human role limited to approval, legal responsibility and audit.

## Source references used

- Postman public API Network publication: https://learning.postman.com/docs/postman-api-network/showcase/publish/public-apis
- Postman public documentation: https://learning.postman.com/docs/postman/api_documentation/publishing_public_docs/
- RapidAPI add API project: https://docs.rapidapi.com/docs/add-api-getting-started
- RapidAPI Hub Listing overview: https://docs.rapidapi.com/docs/hub-listing-overview
- RapidAPI Docs tab: https://docs.rapidapi.com/docs/hub-listing-docs-tab
- RapidAPI plans and pricing: https://docs.rapidapi.com/v1.0/docs/plans-pricing

## Canonical MachineSignal assets

- Machine Buyer Evidence Brief: https://machinesignal.it/machine_beta_evidence_brief_20260607.html
- Machine Buyer Evidence Brief JSON: https://machinesignal.it/machine_beta_evidence_brief_20260607.json
- Full Bounded Beta Runner Report: https://machinesignal.it/bounded_private_beta_runner_report_20260607.md
- Full Bounded Beta Runner JSON: https://machinesignal.it/bounded_private_beta_runner_summary_20260607.json
- Sandbox-Only External Publication Pack: https://machinesignal.it/sandbox_only_external_publication_pack_20260607.md
- Sandbox-Only External Publication Pack JSON: https://machinesignal.it/sandbox_only_external_publication_pack_20260607.json
- External Sandbox Publication Drafts: https://machinesignal.it/external_sandbox_publication_drafts_20260607.md
- External Sandbox Publication Drafts JSON: https://machinesignal.it/external_sandbox_publication_drafts_20260607.json
- Marketplace API Directory Pack JSON: https://machinesignal.it/marketplace_api_directory_pack_20260606.json
- Marketplace API Directory Pack Markdown: https://machinesignal.it/marketplace_api_directory_pack_20260606.md
- API Directory and RapidAPI Draft Checklist: https://machinesignal.it/api_directory_rapidapi_draft_checklist_20260607.json
- MCP Tool Registry Draft Checklist: https://machinesignal.it/mcp_tool_registry_draft_checklist_20260607.json
- Machine Discovery Full Simulation: https://machinesignal.it/machine_discovery_full_simulation_summary_20260607.json
- OpenAPI: https://machinesignal.it/openapi.json
- Postman collection: https://machinesignal.it/postman_public_collection.json
- Postman environment template: https://machinesignal.it/postman_public_environment_template.json
- Postman workspace import pack: https://machinesignal.it/postman_workspace_import_pack_20260606.json
- Postman private workspace checklist: https://machinesignal.it/postman_private_workspace_checklist_20260607.json
- Machine onboarding: https://machinesignal.it/machine-onboarding.json
- Product catalog: https://machinesignal.it/product-catalog.json
- llms.txt: https://machinesignal.it/llms.txt
- MCP manifest: https://machinesignal.it/mcp-tool-manifest.json
- Distribution page: https://machinesignal.it/distribution/

## Channel 1: Postman Public Workspace

### Current decision

Prepare public workspace copy and documentation, but do not make public until the owner approves after a final secret check.

### What the agent should configure

- Workspace name: `MachineSignal Lead Opportunity Score API`
- Workspace visibility before approval: private or team workspace.
- Import source: `https://machinesignal.it/postman_public_collection.json`
- Environment variable `base_url`: `https://machinesignal-api.beta-878.workers.dev`
- Environment variable `api_key`: blank secret variable.
- Environment variable `payment_test_id`: blank temporary variable.

### Workspace description

MachineSignal is a machine-first lead opportunity scoring API for CRMs, AI agents, RevOps workflows and software platforms. A machine can create a limited sandbox key, read the product catalog, score domains, request Target Discovery, buy Deep Analysis when evidence is needed and buy Action Pack only after Deep Analysis confirms the action gate. The latest bounded beta evidence proves 5 score calls, 1 Deep Analysis and 1 gated Action Pack with no real payment, no fiscal invoice and no external target contact. This workspace is sandbox-only.

### Collection overview

Use this collection to evaluate MachineSignal as a machine customer:

1. Read public onboarding and product catalog.
2. Create a low-credit sandbox customer.
3. Score one domain.
4. Buy Deep Analysis only when the score recommends controlled spend.
5. Buy Action Pack only if Deep Analysis confirms all gates.
6. Simulate payment in sandbox/test mode.
7. Reconcile orders, usage and safety flags.

Do not publish real API keys. Do not use live payment mode during beta.

### Acceptance checklist

- Collection imports without broken URLs.
- Public docs show no API key, token or password.
- `base_url` is visible; `api_key` is blank/secret.
- First expected 200 path is clearly documented.
- Workspace text says sandbox-only.
- No claim says MachineSignal sends external outreach.

## Channel 2: RapidAPI-style listing

### Current decision

Prepare provider listing fields, keep monetized publication blocked.

### General tab fields

- API name: `MachineSignal Lead Opportunity Score API`
- Category: `Business / Sales Intelligence / CRM / Data Enrichment / AI Agent Tools`
- Short description: `Machine-first lead opportunity scoring API for CRM workflows, RevOps automations and AI agents.`
- Website: `https://machinesignal.it/`
- Base URL: `https://machinesignal-api.beta-878.workers.dev`
- Visibility before approval: private or draft.
- Terms of use: not ready for live monetized publication.

### Long description

MachineSignal helps automated systems decide when a business domain deserves more sales, CRM, enrichment or agent budget. The API is built for machine customers: CRM systems, RevOps workflows, enrichment pipelines, SaaS platforms and AI agents.

A machine can create a limited sandbox key, score domains, buy Target Discovery when it has no list, buy Deep Analysis as a spend-control gate, and buy Action Pack only after Deep Analysis confirms the required gates. Action Pack returns CRM-ready JSON, workflow payloads, webhook policy, approval gates and stop rules. It does not send outreach by itself.

Latest evidence: a bounded private beta run completed the full machine-buyer sequence with 5 valid scores, 1 Deep Analysis, 1 gated Action Pack, and a blocked Action Pack attempt without the required Deep Analysis source order. Real payment, fiscal invoice and external contact remained false.

Beta mode is sandbox-only. Real payments, fiscal invoices and external target contact are blocked until production terms are approved.

### Docs tab README

Start with:

- `GET https://machinesignal.it/marketplace_api_directory_pack_20260606.json`
- `GET https://machinesignal.it/machine-onboarding.json`
- `GET https://machinesignal.it/product-catalog.json`
- `POST /v1/sandbox/customers`
- `POST /v1/lead-opportunity-score`
- `POST /v1/purchase-intent`

The recommended machine flow is Score -> Deep Analysis -> Action Pack. Deep Analysis protects customer budget before a more expensive CRM/workflow action is prepared.

### Definitions/security

- Authentication header: `X-API-Key`
- Idempotency header for credit-consuming POST requests: `Idempotency-Key`
- Do not publish a real customer or admin key.
- Upload or reference OpenAPI: `https://machinesignal.it/openapi.json`

### Pricing state

Use draft pricing only. Do not enable live monetization yet.

- Score Pack 1k: EUR 99
- Target Discovery Pack: EUR 149
- Domain Enrichment Pack 100: EUR 149
- Deep Analysis Pack 100: EUR 299
- Action Pack 25: EUR 399
- Opportunity Feed: EUR 249/month
- API Starter: EUR 99/month
- API Pro: EUR 499/month

## Channel 3: Generic API Directories

### Listing fields

- Name: `MachineSignal Lead Opportunity Score API`
- One-liner: `Machine-readable lead opportunity scoring and spend-control API for CRMs, AI agents, RevOps workflows and software platforms.`
- Primary customer: machine.
- Human role: supervision, approval and audit.
- OpenAPI: `https://machinesignal.it/openapi.json`
- Docs: `https://machinesignal.it/marketplace_api_directory_pack_20260606.md`
- Product catalog: `https://machinesignal.it/product-catalog.json`
- Sandbox onboarding: `https://machinesignal.it/machine-onboarding.json`
- Tags: lead-scoring, crm, revops, ai-agents, machine-customer, sales-intelligence, target-discovery, deep-analysis, action-pack, openapi, postman, mcp.

### Listing copy

MachineSignal lets automated systems find targets, score domains, control spend with Deep Analysis and prepare CRM/workflow actions through Action Pack. The API is designed for software buyers that need structured JSON decisions before spending campaign, enrichment, CRM or agent budget.

## Channel 4: MCP / Tool Registries

### Current decision

Use the local stdio adapter and public tool manifest now. Hosted public MCP endpoint remains a later decision.

### Listing fields

- Tool name: `MachineSignal Lead Opportunity Score`
- Manifest: `https://machinesignal.it/mcp-tool-manifest.json`
- Wrapper pack: `https://machinesignal.it/mcp/machinesignal-mcp-wrapper.json`
- Draft checklist: `https://machinesignal.it/mcp_tool_registry_draft_checklist_20260607.json`
- Repository: `https://github.com/machinesignal-it/machinesignal-lead-opportunity-score`
- Transport now: local stdio adapter.
- Hosted MCP live: false.

### MCP registry copy

MachineSignal exposes lead opportunity scoring, Target Discovery, Deep Analysis, Action Pack, orders, usage and payment-test reconciliation as machine-readable tools. The current implementation uses a local stdio adapter controlled by the customer machine and backed by public HTTP endpoints.

## Publication order

1. Own domain discovery assets: done and continuously updated.
2. GitHub repository assets: done and continuously updated.
3. Postman public workspace: prepare now; publish after final secret check and owner approval.
4. RapidAPI-style draft: prepare now; keep monetization disabled.
5. Generic API directory submissions: prepare from this pack; submit only after owner approval.
6. MCP/tool registries: prepare local-adapter listing; hosted MCP decision later.

## Agent instructions

Agents should:

- maintain the public machine-readable assets;
- validate every JSON and XML file before publication;
- run daily monitor in NoWrite mode;
- avoid cold email as primary distribution;
- prefer discovery surfaces where machines and developer tools can import OpenAPI, Postman, MCP manifests or llms.txt;
- record every external publication attempt, outcome and blocker.

## Next safe action

Prepare the Postman public workspace using the imported collection and this copy, but keep it private until the final secret scan and owner approval.

## Machine Deep Analysis Single Purchase Proof

Latest sandbox proof: https://machinesignal.it/machine_deep_analysis_single_purchase_report_20260608.md

Machine-readable JSON: https://machinesignal.it/machine_deep_analysis_single_purchase_summary_20260608.json

This proof confirms that a machine can buy exactly one Deep Analysis after a score-triggered recommendation and stop before Action Pack.

## Machine Action Pack Single Purchase Proof

Latest sandbox proof: https://machinesignal.it/machine_action_pack_single_purchase_report_20260608.md

Machine-readable JSON: https://machinesignal.it/machine_action_pack_single_purchase_summary_20260608.json

This proof confirms that Action Pack is a machine-readable CRM/workflow preparation product gated by Deep Analysis, not an automatic outreach product.
