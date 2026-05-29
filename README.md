# MachineSignal Lead Opportunity Score API

Machine-readable lead opportunity scoring for CRM systems, RevOps workflows, enrichment pipelines and AI agents.

MachineSignal is a private technical beta. The first customer interface is a machine, not a human browsing a sales page. A CRM, workflow engine or AI agent can discover the product through public manifests, read the OpenAPI contract, call protected endpoints with an API key, consume credits and retrieve JSON deliveries.

## Machine-First Contract

Public discovery starts here:

- Website: https://machinesignal.it/
- Machine onboarding manifest: https://machinesignal.it/machine-onboarding.json
- Canonical Worker manifest: https://machinesignal-api.beta-878.workers.dev/machine-onboarding.json
- Product catalog: https://machinesignal.it/product-catalog.json
- Canonical Worker product catalog: https://machinesignal-api.beta-878.workers.dev/product-catalog.json
- LLM discovery file: https://machinesignal.it/llms.txt
- OpenAPI schema: https://machinesignal.it/openapi.json
- Postman collection: https://machinesignal.it/postman_collection.json
- API overview: https://machinesignal.it/api/

Primary rule: do not rely on human email persuasion as the primary sales channel. The product should be discoverable and usable through manifests, OpenAPI, Postman and callable endpoints. Humans supervise, approve and audit.

## What The API Does

Given a business domain, the API returns a machine-readable opportunity signal:

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

Scores are routing signals, not guarantees. Higher scores indicate stronger potential opportunity for further analysis.

## Callable Beta Base URL

```text
https://machinesignal-api.beta-878.workers.dev
```

Protected endpoints require:

```text
X-API-Key: <customer_beta_api_key>
Idempotency-Key: <stable_request_id_for_paid_or_credit_consuming_calls>
```

## Core Flow For Machines

1. Fetch `https://machinesignal.it/machine-onboarding.json`.
2. Fetch `https://machinesignal.it/product-catalog.json` to read product codes, exact beta prices, deliverables and credit rules.
3. Fetch `https://machinesignal.it/openapi.json`.
4. If an API key is available, call `GET /v1/onboarding`.
5. Score a domain with `POST /v1/lead-opportunity-score`.
6. If `next_purchase` recommends an add-on, create a beta order with `POST /v1/purchase-intent`.
7. Retrieve previous orders and deliveries with `GET /v1/orders`.

## Main Endpoints

```text
GET  /machine-onboarding.json
GET  /product-catalog.json
GET  /openapi.json
GET  /llms.txt
GET  /postman_collection.json
GET  /v1/onboarding
GET  /v1/usage
POST /v1/lead-opportunity-score
POST /v1/purchase-intent
GET  /v1/orders
GET  /v1/orders/{order_intent_id}
```

## Example Score Request

```bash
curl -X POST "https://machinesignal-api.beta-878.workers.dev/v1/lead-opportunity-score" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $MACHINESIGNAL_API_KEY" \
  -H "Idempotency-Key: demo-score-001" \
  -d '{"domain":"clinic3.it","sector_hint":"dentist","country_hint":"IT"}'
```

## Example Purchase Intent

```bash
curl -X POST "https://machinesignal-api.beta-878.workers.dev/v1/purchase-intent" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $MACHINESIGNAL_API_KEY" \
  -H "Idempotency-Key: demo-order-001" \
  -d '{
    "domain": "clinic3.it",
    "product_code": "deep_analysis",
    "reason": "Score response recommended a deeper opportunity analysis.",
    "max_budget_eur": 3
  }'
```

In beta, purchase-intent consumes beta credits and returns an immediate JSON delivery. It does not execute real payment.

## Products Under Validation

- `score_pack_1k`: base lead opportunity score.
- `verification`: data quality verification delivery.
- `nurture_signal`: lightweight signal for leads that should be saved but not pushed immediately.
- `deep_analysis`: deeper opportunity analysis before spending campaign or sales budget.
- `action_pack`: CRM/action preparation delivery.

## Current Test Status

Validated on 2026-05-29:

- public domain discovery from `https://machinesignal.it`;
- machine onboarding manifest online;
- product catalog online with exact beta prices and valid-output credit rules;
- OpenAPI includes onboarding, purchase intent and orders;
- Postman collection includes onboarding, usage, purchase intent and orders;
- protected Postman flow passed with a disposable beta customer;
- beta customer creation through admin flow;
- 10-score machine-client test;
- 7 beta purchase-intent orders;
- score and deep-analysis credit ledger validated;
- target discovery purchase-intent validated on the live Worker;
- no-list machine flow validated: target discovery delivery can feed the score endpoint;
- order history and single-order retrieval;
- idempotency protection against double charge;
- Cloudflare KV ledger persistence;
- no real payment execution;
- no external outreach execution.

## What This API Does Not Do

- It does not sell lead lists.
- It does not send outreach emails.
- It does not guarantee buyer intent.
- It does not expose private customer data.
- It does not execute real payment in beta.
- It should not be used for spam, sensitive personal inference or high-stakes decisions without review.

## Beta Access

The beta is API-key based. Access is currently approved manually while the product, pricing and abuse controls are validated.

Contact:

```text
beta@machinesignal.it
```

This email is for onboarding coordination only. The product itself is designed to be consumed by machines through API calls.
