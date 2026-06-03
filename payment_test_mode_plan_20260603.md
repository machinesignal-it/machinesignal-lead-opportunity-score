# MachineSignal - Payment Test Mode Plan

Generated at: 2026-06-03

## Executive Result

Status: planned, not implemented.

Real payments remain disabled. The next technical step is to build a test-mode checkout layer that simulates the paid customer-machine journey without moving money.

This plan is provider-neutral, with Stripe sandbox/test mode as the first reference candidate. Stripe documentation states that sandbox/test API calls return simulated objects and that card networks/payment providers do not process payments in sandbox. Production/live mode is separate and processes real money.

## Why We Need This

The API already proves that a customer machine can:

- discover MachineSignal;
- create or receive an API key;
- read products and prices;
- score domains;
- create beta purchase intents;
- consume beta credits;
- retrieve orders and usage;
- reconcile the ledger through admin audit.

What is still missing is the payment bridge:

- order intent;
- payment intent;
- payment status;
- credit activation;
- invoice placeholder;
- audit reconciliation;
- hard block against real money until fiscal/legal gates are approved.

## Scope

Allowed in this phase:

- test-mode payment objects only;
- simulated payment success, failure, 3D Secure/action-required and refund cases;
- test webhook signature validation;
- credit activation only after a simulated successful payment event;
- audit reports that clearly say `real_payment_executed=false`.

Not allowed in this phase:

- live payment provider keys;
- real card payments;
- real subscription renewals;
- real invoices issued to customers;
- live marketplace checkout;
- automatic upgrade to production.

## Candidate Provider

First candidate: Stripe test mode / sandbox.

Reasons:

- official sandbox/test mode exists;
- PaymentIntent is a standard object for tracking payment lifecycle;
- test cards can simulate success, decline and authentication flows;
- webhook signature verification is documented;
- live and test modes are separated by keys and objects.

Provider decision remains open until fiscal/legal setup is confirmed.

## Proposed Machine Flow

1. Customer machine reads `product-catalog.json`.
2. Customer machine selects a product, for example `score_pack_1k`.
3. Customer machine calls MachineSignal to create a beta order intent.
4. MachineSignal creates a test payment intent, not a live payment.
5. Payment provider returns a simulated test payment object.
6. MachineSignal stores mapping:
   - customer_id;
   - order_intent_id;
   - product_code;
   - amount_eur;
   - currency;
   - provider;
   - provider_mode;
   - provider_payment_intent_id;
   - payment_status;
   - credit_activation_status.
7. Test webhook arrives and signature is verified.
8. If test payment succeeds, MachineSignal activates credits in test mode.
9. If test payment fails, MachineSignal keeps credits inactive.
10. Admin audit reconciles order, payment, credit activation and invoice placeholder.

## Proposed Internal State Machine

| State | Meaning | Credits Active | Real Payment |
|---|---|---:|---:|
| `order_intent_created` | Machine wants to buy a product. | No | No |
| `test_payment_intent_created` | Provider test object exists. | No | No |
| `test_payment_requires_action` | Simulated authentication or extra step required. | No | No |
| `test_payment_failed` | Simulated payment failed or declined. | No | No |
| `test_payment_succeeded` | Simulated payment succeeded. | Pending | No |
| `test_credits_activated` | Credits activated after successful simulated event. | Yes | No |
| `test_invoice_placeholder_created` | Invoice placeholder mapped for accounting test. | Yes | No |
| `test_reconciled` | Audit reconciles order, payment, invoice placeholder and credits. | Yes | No |

## Proposed Future Endpoints

These endpoints are not implemented yet. They are the target design for the next development step.

```text
POST /v1/payment-test/intents
GET  /v1/payment-test/intents/{payment_test_id}
POST /v1/payment-test/webhooks/stripe
GET  /v1/payment-test/reconciliation/{payment_test_id}
GET  /v1/admin/payment-test-report?customer_id=<customer_id>
```

## Proposed Request: Create Test Payment Intent

```json
{
  "order_intent_id": "ord_demo_123",
  "customer_id": "beta_customer_123",
  "product_code": "score_pack_1k",
  "amount_eur": 99,
  "currency": "EUR",
  "provider": "stripe",
  "provider_mode": "test",
  "success_behavior": "simulate_success",
  "idempotency_key": "payment-test-score-pack-001"
}
```

## Proposed Response

```json
{
  "payment_test_id": "paytest_20260603_001",
  "order_intent_id": "ord_demo_123",
  "provider": "stripe",
  "provider_mode": "test",
  "provider_payment_intent_id": "pi_test_redacted",
  "payment_status": "test_payment_intent_created",
  "real_payment_executed": false,
  "credits_activated": false,
  "next_machine_action": "confirm simulated payment and wait for test webhook"
}
```

## Reconciliation Rules

The payment test is considered passed only if all conditions are true:

- order exists;
- payment test intent exists;
- provider mode is test/sandbox;
- no live provider key is used;
- successful test payment activates the exact purchased credits;
- failed test payment activates zero credits;
- duplicate webhook does not activate duplicate credits;
- duplicate idempotency key does not create duplicate payment intent;
- audit reports `real_payment_executed=false`;
- audit reports `ready_for_real_payments=false`;
- invoice placeholder exists but no real invoice is issued.

## Required Test Cases

| Case | Purpose | Expected Result |
|---|---|---|
| T1 success | Simulate a successful payment for Score Pack 1k. | Credits activated once. |
| T2 duplicate success webhook | Verify duplicate webhook does not activate credits twice. | No duplicate credits. |
| T3 failed payment | Simulate declined/failed payment. | No credits activated. |
| T4 requires action | Simulate authentication-required state. | Credits remain pending. |
| T5 refund/credit reversal placeholder | Simulate refund policy path. | Credits marked pending correction, no live refund. |
| T6 wrong mode | Simulate accidental live mode flag. | Request blocked. |
| T7 audit | Reconcile order, payment, invoice placeholder and credits. | Audit passed but `ready_for_real_payments=false`. |

## Hard Safety Rules

- Never store live provider secret keys in this phase.
- Never accept real card details in this phase.
- Never activate credits from unverified webhook events.
- Never use a webhook event if signature verification fails.
- Never treat a provider dashboard test object as accounting revenue.
- Never create a real invoice from a test payment.
- Never switch to live mode automatically.

## Agent Responsibilities

| Agent | Responsibility |
|---|---|
| Orchestratore | Own the gate and stop any real-payment activation. |
| API Product Manager | Define endpoint contracts and OpenAPI changes. |
| Billing & Payment Ops Agent | Map order, payment, invoice placeholder and credit activation. |
| Admin & Finance Controller | Validate accounting fields and P&L impact. |
| Legal & Compliance Agent | Validate terms, refunds, privacy and retention implications. |
| Security & Abuse Guard Agent | Check key separation, webhook verification and replay protection. |
| Customer Success & Post-Sale Agent | Define failed payment, credit correction and customer-machine responses. |

## Go / No-Go For Implementation

Go for implementation:

- build test-mode endpoints;
- add provider-neutral payment test records;
- simulate Stripe PaymentIntent lifecycle;
- add webhook verification placeholder;
- add payment test reconciliation report.

No-go for real payment:

- fiscal setup not approved;
- terms/privacy not approved;
- payment provider not configured in live mode;
- invoice workflow not approved;
- data retention not approved.

## Official Reference Links

- Stripe test mode / sandbox: https://docs.stripe.com/testing-use-cases
- Stripe PaymentIntent lifecycle: https://docs.stripe.com/payments/paymentintents/lifecycle
- Stripe webhooks and signature verification: https://docs.stripe.com/webhooks

