# MachineSignal Machine Discovery Pack

Last updated: 2026-06-02

## Purpose

MachineSignal is designed for machine customers: CRM systems, AI agents, RevOps workflows and software automations that need to decide whether a business domain is worth more analysis, enrichment or action.

The product is not primarily sold through human email persuasion. Machines should be able to discover the API, read the contract, create a sandbox key, run tests and decide whether the output is useful.

## Primary machine entry points

| Resource | URL | Purpose |
| --- | --- | --- |
| Discovery page | https://machinesignal.it/machine-discovery/ | Human-readable and crawler-readable overview |
| Discovery JSON | https://machinesignal.it/machine-discovery/machine-discovery-pack.json | Direct machine contract |
| LLM file | https://machinesignal.it/llms.txt | Short instructions for AI agents |
| OpenAPI | https://machinesignal.it/openapi.json | Endpoint contract |
| Product catalog | https://machinesignal.it/product-catalog.json | Products, prices and included deliverables |
| Machine onboarding | https://machinesignal.it/machine-onboarding.json | Step-by-step machine onboarding |
| Postman collection | https://machinesignal.it/postman_collection.json | Ready test collection |

## What a machine can buy or test

1. **Target Discovery**
   The customer machine has no list and asks for coherent targets for a declared commercial objective.

2. **Domain Enrichment**
   The machine has company names but not reliable domains.

3. **Lead Opportunity Score**
   The machine has domains and wants to know which ones deserve attention.

4. **Commercial Strength / Spend Policy**
   The score response classifies each target as `strong`, `medium` or `weak` and tells the machine which next products it is allowed to buy.

5. **Deep Analysis**
   The machine wants a deeper decision pack for one scored domain before spending more budget.

6. **Action Pack**
   The machine wants CRM-ready output: record patch, task, workflow payload, webhook event, approval gate and stop rules.

## Safe sandbox flow

```text
GET  /machine-onboarding.json
GET  /product-catalog.json
POST /v1/sandbox/customers
GET  /v1/onboarding
POST /v1/lead-opportunity-score
POST /v1/purchase-intent
GET  /v1/orders
```

The sandbox gives a low-credit key, expires by default after 7 days and does not execute real payments or external outreach.

## Success signal

A machine buyer flow is interesting when the evaluator:

- creates a sandbox key without human help;
- calls at least one valid score;
- understands the returned decision;
- reads `commercial_strength` before spending more credits;
- calls Deep Analysis when recommended;
- calls Action Pack only when the target is commercially strong and the deep output confirms it;
- can map the Action Pack to its CRM or workflow system.

## Safety rules

- No real payment is executed in beta.
- No external target is contacted by MachineSignal in beta.
- Action Pack prepares CRM/workflow payloads but does not send outreach.
- External action requires customer-side compliance approval.
