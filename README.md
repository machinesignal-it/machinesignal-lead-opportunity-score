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
- Beta tester onboarding packet: https://machinesignal.it/beta/onboarding-packet.html
- Beta tester onboarding JSON: https://machinesignal.it/beta/onboarding-packet.json
- Beta feedback schema: https://machinesignal.it/beta/feedback-schema.json
- Machine beta test kit: https://machinesignal.it/beta/machine-test-kit.html
- Machine beta test kit JSON: https://machinesignal.it/beta/machine-test-kit.json
- Full machine buyer flow demo: https://machinesignal.it/demo/machine-buyer-flow/
- CRM consumer demo: https://machinesignal.it/demo/crm-consumer/

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

## Limited Sandbox Key

A machine evaluator can create a low-credit sandbox key without a human sales conversation:

```bash
curl -X POST "https://machinesignal-api.beta-878.workers.dev/v1/sandbox/customers" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: sandbox-evaluator-001" \
  -d '{
    "evaluator_type": "ai_agent",
    "integration_target": "custom CRM workflow",
    "expected_test_path": "full_flow"
  }'
```

The response returns `api_key` once. Store it immediately and use it as `X-API-Key` for the protected beta endpoints.

Sandbox limits are intentionally small: 5 scores, 1 target discovery, 1 deep analysis, 1 action pack, 1 verification, 1 nurture signal and 1 domain enrichment. The sandbox does not execute real payments or external outreach.

## Core Flow For Machines

1. Fetch `https://machinesignal.it/machine-onboarding.json`.
2. Fetch `https://machinesignal.it/product-catalog.json` to read product codes, exact beta prices, deliverables and credit rules.
3. Fetch `https://machinesignal.it/openapi.json`.
4. If no beta key is available, create a limited sandbox key with `POST /v1/sandbox/customers`.
5. Call `GET /v1/onboarding`.
6. If the machine already has domains, score them with `POST /v1/lead-opportunity-score`.
7. If the machine has no list, order `target_discovery` with `POST /v1/purchase-intent`, then score the returned candidate domains.
8. If `next_purchase` recommends an add-on, create a beta order with `POST /v1/purchase-intent`.
9. Retrieve previous orders and deliveries with `GET /v1/orders`.

## Beta Tester Onboarding Packet

The beta tester packet is the entry point for a partner machine, API evaluator or technical operator that wants to test MachineSignal without a human sales conversation.

It provides:

- a 6-step beta run from public discovery to scored domains and optional paid-intent products;
- exact success metrics for machine evaluation;
- stop rules that prevent real payment, external outreach or unsafe automation during beta;
- a feedback schema so a tester can return structured commercial and technical feedback;
- links to the machine test kit and demo outputs.

The goal is simple: let a machine decide whether MachineSignal is useful enough to integrate, while a human only supervises approval and audit.

## Full Machine Buyer Flow Demo

The public demo shows the full machine-first sequence without relying on human email persuasion:

1. A customer machine has no list and needs commercially relevant targets.
2. It orders `target_discovery` for a specific market, area and commercial objective.
3. It receives candidate domains and scores them through the API.
4. It buys `deep_analysis` only for high-potential records.
5. It buys `action_pack` only when the output is useful for a CRM or workflow.
6. The Action Pack becomes CRM-ready JSON and webhook events.
7. No real payment is executed in beta and no external outreach is sent.

Public demo assets:

- Full flow page: https://machinesignal.it/demo/machine-buyer-flow/
- Full flow JSON: https://machinesignal.it/demo/machine-buyer-flow/flow.json
- Score results JSON: https://machinesignal.it/demo/machine-buyer-flow/score_results.json
- Order events JSON: https://machinesignal.it/demo/machine-buyer-flow/order_events.json
- CRM consumer page: https://machinesignal.it/demo/crm-consumer/
- CRM records JSON: https://machinesignal.it/demo/crm-consumer/crm_records.json
- Webhook events JSON: https://machinesignal.it/demo/crm-consumer/webhook_events.json

## Main Endpoints

```text
GET  /machine-onboarding.json
GET  /product-catalog.json
GET  /openapi.json
GET  /llms.txt
GET  /postman_collection.json
POST /v1/sandbox/customers
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

- `target_discovery`: pre-check and delivery for machines that have a market need but no list yet.
- `domain_enrichment`: decision pack for machines that have company names but need reliable domains before scoring.
- `score_pack_1k`: base lead opportunity score.
- `verification`: data quality verification delivery.
- `nurture_signal`: lightweight signal for leads that should be saved but not pushed immediately.
- `deep_analysis`: deeper opportunity analysis before spending campaign or sales budget.
- `action_pack`: CRM-ready action delivery with record patch, CRM task, platform mappings, workflow payload, webhook policy, audit event, approval gate, agent instructions, stop rules and follow-up sequence.

## Action Pack Contract

`action_pack` is the commercial product that turns a high-potential score and a Deep Analysis into an operational machine payload.

It returns:

- `crm_record_patch`: fields to create or update the CRM record.
- `crm_task`: the internal task the customer machine should create.
- `crm_platform_mappings`: generic CRM mapping plus HubSpot, Salesforce and Pipedrive-oriented field suggestions.
- `workflow_payload`: trigger, deduplication key and recommended workflow steps.
- `webhook_event`: event contract for downstream systems.
- `webhook_delivery_policy`: retry, signing and idempotency policy for customer-configured webhooks.
- `audit_event`: internal audit payload showing that no payment or external contact was executed.
- `approval_gate`: explicit blocked/allowed actions before any external outreach.
- `agent_instructions`: instructions for a customer machine or approved agent.
- `stop_rules`: conditions where the workflow must stop instead of spending more budget.

The key rule remains: `action_pack` prepares CRM/workflow actions, but it does not send external outreach automatically.

## Current Test Status

Validated through 2026-05-31:

- public domain discovery from `https://machinesignal.it`;
- machine onboarding manifest online;
- product catalog online with exact beta prices and valid-output credit rules;
- OpenAPI includes onboarding, purchase intent and orders;
- Postman collection includes onboarding, usage, purchase intent, public demos and orders;
- protected Postman flow passed with a disposable beta customer;
- beta customer creation through admin flow;
- 10-score machine-client test;
- 7 beta purchase-intent orders;
- score and deep-analysis credit ledger validated;
- target discovery purchase-intent validated on the live Worker;
- no-list machine flow validated: target discovery delivery can feed the score endpoint;
- full machine buyer flow demo published;
- CRM consumer demo published;
- Action Pack output validated as CRM-ready JSON payload;
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
