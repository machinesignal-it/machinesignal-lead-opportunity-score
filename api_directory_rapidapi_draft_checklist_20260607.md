# MachineSignal API Directory and RapidAPI-Style Draft Checklist

Generated: 2026-06-07

Status: ready for sandbox-only draft preparation. External submission and monetization remain blocked until owner approval.

## Objective

Prepare listing fields for API directories and RapidAPI-style marketplaces so machines, API tools, CRMs and AI agents can discover MachineSignal and evaluate it in sandbox mode.

This checklist is not a go-live. It does not authorize paid plans, live checkout, real keys, legal commitments or human outreach.

## Master Rules

- Use these fields only for draft or sandbox listing preparation.
- Keep monetization disabled.
- Do not publish paid plans.
- Do not publish production API keys.
- Do not claim live payments are available.
- Do not submit irreversibly without owner approval.
- Do not contact human prospects or target companies.

## Generic API Directory Fields

| Field | Value |
| --- | --- |
| Listing title | `MachineSignal Lead Opportunity Score API` |
| Short description | `Machine-first lead opportunity scoring and spend-control API for CRMs, AI agents, RevOps workflows and software platforms.` |
| Category | `Sales Intelligence`, `CRM Automation`, `Lead Scoring`, `RevOps`, `AI Agent Tools`, `Workflow Automation`, `Data Enrichment` |
| Primary customer interface | `Machine-first: CRM systems, AI agents, workflows and API clients.` |
| Human role | `Supervision, approval and audit only.` |
| Website | `https://machinesignal.it/` |
| OpenAPI | `https://machinesignal.it/openapi.json` |
| Postman collection | `https://machinesignal.it/postman_public_collection.json` |
| Product catalog | `https://machinesignal.it/product-catalog.json` |
| Machine onboarding | `https://machinesignal.it/machine-onboarding.json` |
| llms.txt | `https://machinesignal.it/llms.txt` |
| Evidence brief | `https://machinesignal.it/machine_beta_evidence_brief_20260607.html` |
| Sandbox-only pack | `https://machinesignal.it/sandbox_only_external_publication_pack_20260607.json` |
| Draft source JSON | `https://machinesignal.it/distribution/api-directory-submission.json` |

### Generic Long Description

MachineSignal helps automated systems decide whether a business domain deserves more analysis, enrichment or CRM action. The API returns score, confidence, decision, spend policy and next machine action.

If a machine has no list, it can request Target Discovery for a declared commercial objective. If a score is strong, it can request Deep Analysis as a spend-control gate. Only after Deep Analysis confirms the action gate should the machine request Action Pack, which returns CRM-ready JSON and workflow payloads.

Current publication mode is sandbox-only. A machine can create a limited sandbox key and test the flow without a human sales conversation. Live payments, real invoices, external target contact and public paid plans are blocked until owner approval.

## RapidAPI-Style Provider Fields

| Field | Value |
| --- | --- |
| API name | `MachineSignal Lead Opportunity Score API` |
| API category | `Business / Sales Intelligence / CRM / Data Enrichment / AI Agent Tools` |
| API visibility | `Private draft` or `unpublished` |
| Monetization | `Disabled` |
| Pricing plans | `Do not create public paid plans yet` |
| Base URL | `https://machinesignal-api.beta-878.workers.dev` |
| Authentication | API key in `X-API-Key`; idempotency with `Idempotency-Key` |
| Public docs | `https://machinesignal.it/sandbox-buyer-kit/` |
| OpenAPI | `https://machinesignal.it/openapi.json` |
| Provider setup JSON | `https://machinesignal.it/distribution/rapidapi-provider-setup.json` |
| Listing JSON | `https://machinesignal.it/distribution/rapidapi-listing.json` |

### RapidAPI Short Description

Machine-first lead opportunity scoring API for CRM workflows, RevOps automations and AI agents.

### RapidAPI Long Description

MachineSignal helps automated systems decide when a business domain is worth additional budget. The API is built for machine customers: CRM systems, RevOps workflows, enrichment pipelines and AI agents.

A machine can discover the API, create a limited sandbox key, score domains, request Target Discovery when no list exists, request Deep Analysis as a spend-control gate, request Action Pack only after Deep Analysis confirms the gates, read usage, create beta purchase intents and retrieve structured JSON deliveries.

The current listing should remain draft-only with monetization disabled. The bounded beta evidence validates the machine-buyer flow under limited credits, with no real payment, no fiscal invoice and no external target contact.

## Endpoint Groups

### Public Discovery

- `GET /health`
- `GET /machine-onboarding.json`
- `GET /product-catalog.json`
- `GET /openapi.json`
- `GET /postman_collection.json`

### Sandbox Onboarding

- `POST /v1/sandbox/customers`

### Customer API

- `GET /v1/onboarding`
- `GET /v1/usage`
- `POST /v1/lead-opportunity-score`
- `POST /v1/purchase-intent`
- `GET /v1/orders`
- `GET /v1/orders/{order_intent_id}`
- `POST /v1/payment-test/intents`
- `GET /v1/payment-test/reconciliation/{payment_test_id}`

## Tags

`lead-scoring`, `crm`, `revops`, `ai-agents`, `machine-customer`, `sales-intelligence`, `target-discovery`, `deep-analysis`, `action-pack`, `openapi`, `postman`, `mcp`, `llms-txt`

## Draft Pricing Treatment

The business model has pricing under test, but public paid plans are not active.

Use this wording:

`Pricing model under beta validation. Sandbox evaluation only. Public paid plans and live checkout are not enabled.`

Do not create marketplace pricing tiers yet.

## Submission Gate

Before submitting publicly:

1. Distribution Readiness Monitor is OK.
2. Secret scan is OK.
3. Public docs state sandbox-only.
4. No production key is present.
5. Monetization remains disabled.
6. Legal/fiscal readiness has been reviewed.
7. Owner approval is recorded.

## Blocked Actions

Agents must not:

- submit an irreversible public listing;
- enable monetization;
- create paid marketplace plans;
- connect live checkout;
- publish production keys;
- claim production availability;
- promise SLAs, refunds or legal terms;
- contact human prospects;
- contact target companies.

## Current Recommendation

Prepare fields as drafts only. Stop before final public submission or monetization.

