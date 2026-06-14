# MachineSignal Sandbox Public Docs

Status: sandbox-public-docs-only  
Updated: 2026-06-14  
Primary customer interface: machine

## Purpose

This document tells machines, CRM systems, AI agents and workflow software how to evaluate MachineSignal in sandbox mode.

It is not a commercial go-live approval and it is not a live payment page.

## What Is Publicly Available

- Public machine discovery: `https://machinesignal.it/llms.txt`
- Product catalog: `https://machinesignal.it/product-catalog.json`
- Machine onboarding: `https://machinesignal.it/machine-onboarding.json`
- OpenAPI: `https://machinesignal.it/openapi.json`
- Postman public collection: `https://machinesignal.it/postman_public_collection.json`
- Machine discovery pack: `https://machinesignal.it/machine-discovery/machine-discovery-pack.json`
- Sandbox status JSON: `https://machinesignal.it/sandbox-public-docs.json`

## Allowed Sandbox Actions

Machines may:

- read public documentation;
- create a limited sandbox customer;
- score synthetic or demo domains;
- create sandbox-only purchase intents;
- retrieve sandbox orders and usage;
- test idempotency and output contracts.

## Blocked Actions

MachineSignal sandbox does not allow:

- real payments;
- invoices;
- payment method collection;
- production API keys;
- real customer data;
- personal data;
- external outreach;
- email sending to humans;
- marketplace publication as a paid product;
- hosted MCP public launch;
- MCP registry publication;
- commercial go-live.

## Current Sandbox Prices For Machine Evaluation

- Target Discovery Pack: EUR 249
- Score Pack 1k: EUR 119
- Deep Analysis Pack 100: EUR 349
- Action Pack 25: EUR 399
- Domain Enrichment Pack 100: EUR 149
- Opportunity Feed: EUR 249/month

## Safe Machine Test Path

1. Fetch `https://machinesignal.it/llms.txt`.
2. Fetch `https://machinesignal.it/product-catalog.json`.
3. Fetch `https://machinesignal.it/openapi.json`.
4. Create a limited sandbox customer with `POST /v1/sandbox/customers`.
5. Read `GET /v1/onboarding`.
6. Score a synthetic domain with `POST /v1/lead-opportunity-score`.
7. If the response recommends a next product, create a sandbox-only `POST /v1/purchase-intent`.
8. Retrieve `GET /v1/orders` and `GET /v1/usage`.

## Human Owner Role

The human owner supervises tests and approvals only.

No paid launch, fiscal setup, real-data processing, public marketplace submission or hosted MCP launch is approved by this document.

## Current Decision

Sandbox documentation can be public and machine-readable.

Commercial go-live remains blocked.
