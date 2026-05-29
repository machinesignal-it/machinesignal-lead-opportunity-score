# Protected Postman Flow Test - 2026-05-29

This document records the first safe protected-flow test for the MachineSignal beta API.

## Objective

Verify that a machine client can discover the API, authenticate with a beta API key, consume credits, create a purchase intent and retrieve the resulting JSON delivery.

The test was designed to avoid real payments, avoid human outreach and avoid exposing secrets.

## Result

Status: passed.

The public discovery package and the protected beta flow are aligned:

- public OpenAPI schema is available;
- public Postman collection is available;
- machine onboarding manifest is available;
- protected requests require `X-API-Key`;
- a disposable beta customer can call protected endpoints;
- credit usage is recorded in the ledger;
- purchase intent creates a retrievable beta order;
- no real payment was executed;
- no external contact or email outreach was executed.

## Tested Flow

1. `GET /v1/usage`
2. `GET /v1/onboarding`
3. `POST /v1/lead-opportunity-score`
4. `POST /v1/purchase-intent`
5. `GET /v1/orders`
6. `GET /v1/orders/{order_intent_id}`

## Test Evidence

- Disposable customer id: `postman_safe_20260529143242`
- Visible key prefix for audit: `ms_cust_2bc7e1`
- Score balance: 20 purchased, 1 used, 19 remaining
- Deep analysis balance: 5 purchased, 1 used, 4 remaining
- Purchase intent order id: `ord_bb4b7fe4`
- Payment mode: beta only
- Real payment executed: `false`
- External contact executed: `false`

The full sanitized technical report is available in `docs/protected-postman-flow-test-20260529.json`.

## Postman Collection

The collection name is:

`MachineSignal Lead Opportunity Score API - Beta Discovery`

The collection includes:

1. Score business domain - synthetic demo endpoint
2. Read usage ledger
3. Fetch public OpenAPI schema
4. Fetch beta access metadata
5. Fetch machine onboarding manifest
6. Read authenticated onboarding
7. Create purchase intent
8. List orders and deliveries

## Safety Notes

No API keys are stored in this repository.

Beta purchase intent records a machine-readable intent and returns a JSON delivery. It does not execute checkout or charge a payment method during this beta phase.
