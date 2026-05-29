# MachineSignal - RapidAPI Listing Draft

Date: 2026-05-29
Status: draft ready for provider setup; publish publicly only after rate limits, terms and beta access gates are final

## API Name

MachineSignal Lead Opportunity Score API

## Short Description

Machine-readable lead opportunity scoring for CRM, RevOps workflows and AI agents.

## Category

Business / Sales / CRM / Data enrichment

## Tags

lead-scoring, crm, revops, ai-agents, b2b, sales-automation, data-enrichment, openapi

## Long Description

MachineSignal provides a structured Lead Opportunity Score for business domains.

The API is designed for automated systems that need to decide which company domains deserve more analysis before spending CRM, enrichment or campaign budget. It returns a score, confidence level, priority, routing decision, reason, recommended next product and machine-readable usage metadata.

Typical users are CRM workflows, RevOps automations, enrichment pipelines and AI agents that need a simple signal before deciding whether to request verification, nurturing, deep analysis or an action pack.

Current status: private technical beta. API keys are issued only after beta approval. Public examples are synthetic. Beta purchase intents return JSON deliveries and do not execute real payments.

## What This API Does

- Scores a business domain.
- Returns an opportunity score from 0 to 100.
- Adds confidence, priority, routing decision and recommended next product.
- Lets machines create beta purchase intents for verification, nurture signals, deep analysis and action packs.
- Lets machines retrieve beta order history and JSON deliveries.
- Helps automated workflows prioritize which records deserve more analysis.

## What This API Does Not Do

- It does not sell lead lists.
- It does not send outreach emails.
- It does not guarantee buyer intent.
- It does not expose customer or scraped private datasets.
- It does not execute real payment in the current beta.

## Endpoint

Method:

```text
POST
```

Main paths:

```text
GET  /machine-onboarding.json
GET  /v1/onboarding
GET  /v1/usage
POST /v1/lead-opportunity-score
POST /v1/purchase-intent
GET  /v1/orders
```

Callable beta base URL:

```text
https://machinesignal-api.beta-878.workers.dev
```

Important:
Protected endpoints require an API key. Keep RapidAPI public listing gated until beta access rules, rate limits and abuse controls are final.

## Authentication

Header:

```text
X-API-Key: {{api_key}}
Idempotency-Key: {{stable_request_id}}
```

## Example Request

```json
{
  "domain": "clinic3.it",
  "sector_hint": "dentist",
  "country_hint": "IT"
}
```

## Example Response

```json
{
  "domain": "clinic3.it",
  "opportunity_score": 81,
  "confidence": 0.79,
  "priority": "high",
  "decision": "buy_deep_analysis",
  "reason": "Signals suggest a high-priority opportunity where a paid deep analysis may be justified.",
  "next_purchase": {
    "next_product": "deep_analysis",
    "price_range_eur": "1-3",
    "machine_instruction": "Buy Deep Analysis before spending human or campaign budget."
  },
  "beta": true
}
```

## Pricing Draft

Beta:

```text
Free private technical beta for selected testers.
```

Future model:

```text
Phase 1: pay per score
Phase 2: score packs
Phase 3: monthly subscription for higher-volume machine workflows
```

## Public Resources

- Website: https://machinesignal.it/
- API overview: https://machinesignal.it/api/
- Beta access: https://machinesignal.it/beta/
- Machine onboarding: https://machinesignal.it/machine-onboarding.json
- OpenAPI schema: https://machinesignal.it/openapi.json
- Beta metadata: https://machinesignal.it/beta-access.json
- LLM discovery: https://machinesignal.it/llms.txt
- Postman collection: https://machinesignal.it/postman_collection.json
- GitHub: https://github.com/machinesignal-it/machinesignal-lead-opportunity-score

## Beta Access CTA

To request beta access, contact:

```text
beta@machinesignal.it
```

Suggested subject:

```text
MachineSignal beta access request
```

Required information:

- company or workflow name
- CRM or automation stack
- use case
- expected monthly score volume
- contact email

This email is for onboarding coordination only. The primary product interface remains machine-to-API.

## Publication Gate

Do not publish publicly on RapidAPI until:

- endpoint is callable
- API key flow is defined
- rate limits are defined
- terms and abuse controls are defined
- machine onboarding manifest is public
- OpenAPI and Postman contain purchase-intent and orders
- at least one successful machine-client flow has been tested
