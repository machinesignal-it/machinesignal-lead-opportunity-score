# MachineSignal - RapidAPI provider setup checklist

Date: 2026-06-01
Status: ready for RapidAPI provider UI setup, keep as draft until sandbox metrics are reviewed

## Goal

Prepare RapidAPI as a machine-first marketplace channel without launching a monetized public product too early.

The goal is not human outreach. The goal is to make the API discoverable and testable by software, developers, API tools and agent workflows.

## Recommended setup mode

Use draft or unpublished mode if RapidAPI allows it.

If RapidAPI requires immediate public publication, do not publish yet. Keep this package ready and wait until the 7-day sandbox test produces enough metrics.

## Provider fields

### API name

MachineSignal Lead Opportunity Score API

### Short description

Machine-first lead opportunity scoring API for CRM workflows, RevOps automations and AI agents.

### Category

Business / Sales Intelligence / CRM / Data Enrichment / AI Agent Tools

### Tags

lead-scoring, crm, revops, ai-agents, b2b, sales-automation, data-enrichment, lead-routing, openapi, machine-customer

### Base URL

```text
https://machinesignal-api.beta-878.workers.dev
```

### OpenAPI URL

```text
https://machinesignal.it/openapi.json
```

### Public documentation URL

```text
https://machinesignal.it/distribution/rapidapi-listing.json
```

### Public Postman collection

```text
https://machinesignal.it/postman_public_collection.json
```

## RapidAPI endpoint groups

### Public discovery

These endpoints are public and safe:

```text
GET /health
GET /machine-onboarding.json
GET /product-catalog.json
GET /openapi.json
GET /postman_collection.json
```

### Sandbox onboarding

```text
POST /v1/sandbox/customers
```

Purpose:

- lets a machine create a low-credit sandbox key;
- no real payment;
- no external contact;
- expires and is limited.

### Customer API

Protected by `X-API-Key`:

```text
GET  /v1/onboarding
GET  /v1/usage
POST /v1/lead-opportunity-score
POST /v1/purchase-intent
GET  /v1/orders
GET  /v1/orders/{order_intent_id}
```

## Authentication setup

RapidAPI normally adds its own gateway headers. For our current direct beta, protected endpoints require:

```text
X-API-Key: <sandbox_or_customer_key>
Idempotency-Key: <stable_request_id>
```

Recommended RapidAPI listing note:

```text
Create a sandbox customer first with POST /v1/sandbox/customers. Use the returned api_key as X-API-Key for protected endpoints.
```

## Example requests to configure

### Create sandbox customer

```json
{
  "evaluator_type": "ai_agent",
  "integration_target": "crm_workflow",
  "expected_test_path": "full_flow"
}
```

### Score domain

```json
{
  "domain": "clinic3.it",
  "sector_hint": "dentist",
  "country_hint": "IT"
}
```

### Buy Deep Analysis in beta

```json
{
  "product_code": "deep_analysis",
  "domain": "clinic3.it",
  "source_score_request_id": "rapidapi-demo-score-001",
  "reason": "Score decision was buy_deep_analysis"
}
```

### Buy Action Pack in beta

```json
{
  "product_code": "action_pack",
  "domain": "clinic3.it",
  "source_score_request_id": "rapidapi-demo-score-001",
  "reason": "Deep Analysis confirmed an opportunity and the CRM needs a machine-readable next action"
}
```

## Draft pricing to enter only after metrics

Do not activate paid public pricing until after sandbox validation.

Internal beta price references:

- Score Pack 1k: EUR 99;
- Target Discovery Pack: EUR 149;
- Domain Enrichment Pack 100: EUR 149;
- Deep Analysis Pack 100: EUR 299;
- Action Pack 25: EUR 399;
- Opportunity Feed: EUR 249/month;
- API Starter: EUR 99/month;
- API Pro: EUR 499/month.

## Publication gate

Do not publish monetized listing until all items are true:

- sandbox metrics have been collected for at least 7 days;
- API abuse limits are confirmed;
- no unexpected credit leakage;
- no real payment is executed in beta;
- no external outreach is executed by MachineSignal;
- terms and privacy wording are checked;
- at least one full sandbox flow works from an external/API-tool context.

## Acceptance test after provider setup

1. Public listing loads.
2. OpenAPI is accepted or docs can be entered manually.
3. Public endpoints return HTTP 200.
4. `POST /v1/sandbox/customers` returns an `api_key`.
5. Protected endpoints work with the sandbox key.
6. Repeated score with same `Idempotency-Key` does not double consume credit.
7. Purchase intent returns JSON delivery and does not execute payment.
8. Orders endpoint retrieves the delivery.

## Decision

Prepare RapidAPI now. Publish only as draft/unlisted if available. Avoid public monetized launch until sandbox metrics support it.
