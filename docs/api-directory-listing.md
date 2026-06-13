# MachineSignal - API Directory Listing Copy

## Title

MachineSignal Lead Opportunity Score API

## Short Description

Machine-readable lead opportunity scoring for CRM systems, RevOps workflows and AI agents.

## Long Description

MachineSignal returns a structured opportunity score and a machine-readable budget decision for business domains. It is built for automated systems that need to decide which company records deserve verification, nurturing, deep analysis or CRM action preparation before spending more budget.

The API is machine-first: agents, CRMs and workflows can inspect `machine-onboarding.json`, `llms.txt`, OpenAPI and Postman, then call protected endpoints with an API key.

Each score includes `commercial_strength`: `strong`, `medium` or `weak`. This tells the customer machine whether it can buy Deep Analysis, limit spend to Nurture Signal, keep the target in watchlist, or consider Action Pack only after a confirmed deep analysis.

The current beta supports score calls, credit usage tracking, purchase-intent creation and order/delivery retrieval. Beta purchase intents return machine-readable JSON deliveries and do not execute real payment.

## Category

Business / Sales / CRM / RevOps / Data enrichment / AI agents

## Tags

lead-scoring, crm, revops, ai-agents, openapi, postman, machine-readable, b2b, data-enrichment, sales-automation

## Public Resources

- Website: https://machinesignal.it/
- Machine onboarding: https://machinesignal.it/machine-onboarding.json
- LLM discovery: https://machinesignal.it/llms.txt
- OpenAPI: https://machinesignal.it/openapi.json
- Postman: https://machinesignal.it/postman_collection.json
- API overview: https://machinesignal.it/api/
- GitHub: https://github.com/machinesignal-it/machinesignal-lead-opportunity-score

## Callable Beta Base URL

```text
https://machinesignal-api.beta-878.workers.dev
```

## Core Endpoints

```text
GET  /machine-onboarding.json
GET  /v1/onboarding
GET  /v1/usage
POST /v1/lead-opportunity-score
POST /v1/purchase-intent
GET  /v1/orders
```

## What It Does Not Do

- Does not sell generic lead lists.
- Does not execute external-contact workflows.
- Does not guarantee buyer intent.
- Does not execute real payment in beta.
- Does not expose private customer data.

## Beta Note

Private technical beta. API keys are issued after approval. The product is designed for machine-to-API usage; email is only for onboarding coordination.
