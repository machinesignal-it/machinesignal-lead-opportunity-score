# MachineSignal - RapidAPI listing ready

Date: 2026-06-01
Status: provider-ready draft for RapidAPI setup

## API name

MachineSignal Lead Opportunity Score API

## Short description

Machine-first lead opportunity scoring API for CRM workflows, RevOps automations and AI agents.

## Category

Business, Sales Intelligence, CRM, Data Enrichment, AI Agent Tools

## Tags

lead-scoring, crm, revops, ai-agents, b2b, sales-automation, data-enrichment, lead-routing, openapi, machine-customer

## Long description

MachineSignal helps automated systems decide when a business domain is worth additional budget.

The API is built for machine customers: CRM systems, RevOps workflows, enrichment pipelines and AI agents. A machine can discover the API, create a limited sandbox key, score domains, read usage, create beta purchase intents and retrieve structured JSON deliveries.

The API does not rely on cold email to humans as the primary channel. It is designed to be found, imported and tested through machine-readable assets: OpenAPI, llms.txt, Postman public collection, product catalog, onboarding manifest and sandbox endpoints.

## What the API sells

### Score Pack

The customer machine sends a business domain. MachineSignal returns:

- opportunity score;
- confidence;
- priority;
- routing decision;
- reason;
- recommended next purchase;
- usage event.

Use case: a CRM or enrichment workflow has many domains and wants to decide which ones deserve more budget.

### Target Discovery Pack

The customer machine does not have a starting list and sends market, area and commercial objective.

MachineSignal returns a target discovery output contract: coherent targets for the declared objective or a no-go coverage decision when the market is not usable.

Use case: a workflow wants to find a structured batch of domains worth scoring before spending enrichment budget.

### Deep Analysis

The customer machine has a high-score domain and wants a deeper decision before buying an Action Pack or involving a human.

MachineSignal returns a structured deeper analysis delivery with clear stop rules.

### Action Pack

The customer machine has a confirmed opportunity and wants CRM-ready output.

MachineSignal returns structured payloads such as CRM record patch, task, workflow payload, webhook event, agent instructions, approval gate and stop rules.

## What the API does not do

- It does not execute real payments in beta.
- It does not send outreach emails.
- It does not contact external targets.
- It does not guarantee buyer intent.
- It does not sell private scraped datasets.

## Base URL

```text
https://machinesignal-api.beta-878.workers.dev
```

## Main endpoints

```text
GET  /health
GET  /machine-onboarding.json
GET  /product-catalog.json
GET  /openapi.json
GET  /postman_collection.json
POST /v1/sandbox/customers
GET  /v1/onboarding
GET  /v1/usage
POST /v1/lead-opportunity-score
POST /v1/purchase-intent
GET  /v1/orders
GET  /v1/orders/{order_intent_id}
```

## Authentication

Protected endpoints require:

```text
X-API-Key: <sandbox_or_customer_key>
Idempotency-Key: <stable_request_id>
```

Public endpoints do not require an API key.

## Sandbox test path

1. `GET /machine-onboarding.json`
2. `GET /product-catalog.json`
3. `POST /v1/sandbox/customers`
4. Store `api_key` from the response.
5. `GET /v1/onboarding` with `X-API-Key`.
6. `POST /v1/lead-opportunity-score` with `X-API-Key` and `Idempotency-Key`.
7. If recommended, `POST /v1/purchase-intent` with `product_code=deep_analysis`.
8. If useful, `POST /v1/purchase-intent` with `product_code=action_pack`.
9. `GET /v1/orders`.

## Example score request

```json
{
  "domain": "clinic3.it",
  "sector_hint": "dentist",
  "country_hint": "IT"
}
```

## Example score response

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
    "machine_instruction": "Buy Deep Analysis before spending human or campaign budget."
  },
  "usage": {
    "current_event": {
      "product_code": "score_pack_1k",
      "status": "valid_output",
      "credits_consumed": 1
    },
    "real_payment_executed": false,
    "external_contact_executed": false
  },
  "beta": true
}
```

## Beta pricing for listing

| Product | Price | Unit |
| --- | ---: | --- |
| Target Discovery Pack | EUR 149 | 250 coherent target records or no-go decision |
| Domain Enrichment Pack 100 | EUR 149 | 100 enrichment decisions |
| Score Pack 1k | EUR 99 | 1000 valid scores |
| Deep Analysis Pack 100 | EUR 299 | 100 valid deep analyses |
| Action Pack 25 | EUR 399 | 25 valid action packs |
| Opportunity Feed | EUR 249/month | 4 scans and 4 deliveries |
| API Starter | EUR 99/month | 500 valid scores |
| API Pro | EUR 499/month | 3000 valid scores, 50 deep analyses and 1 monthly feed |

## Public assets

- Website: https://machinesignal.it/
- Distribution page: https://machinesignal.it/distribution/
- RapidAPI listing JSON: https://machinesignal.it/distribution/rapidapi-listing.json
- API directory JSON: https://machinesignal.it/distribution/api-directory-submission.json
- OpenAPI: https://machinesignal.it/openapi.json
- llms.txt: https://machinesignal.it/llms.txt
- Postman public collection: https://machinesignal.it/postman_public_collection.json
- Product catalog: https://machinesignal.it/product-catalog.json
- Machine onboarding: https://machinesignal.it/machine-onboarding.json
- Sandbox endpoint: https://machinesignal-api.beta-878.workers.dev/v1/sandbox/customers
- GitHub: https://github.com/machinesignal-it/machinesignal-lead-opportunity-score

## Publication gate

RapidAPI can be prepared now. Public monetized launch should wait until:

- sandbox monitoring has at least 7 days of data;
- abuse limits are confirmed;
- terms are finalized;
- public documentation has been reviewed;
- pricing experiment is confirmed.
