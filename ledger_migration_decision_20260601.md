# MachineSignal - Ledger migration decision

- Date: 2026-06-01
- Trigger: 300-score budget-cap stress test
- Decision: start ledger migration planning now; implement before public beta volume, marketplace listing or real payments.

## What happened

The 300-score stress test completed the customer-machine workflow at the API response level:

| Metric | Result |
|---|---:|
| Requested scores | 300 |
| Successful score responses | 300 |
| Recommended add-on purchases | 280 |
| Successful purchase responses | 280 |
| Simulated revenue | EUR 408.90 |
| Real payments executed | false |
| External contacts executed | false |

However, the persisted ledger did not match the successful response count:

| Ledger check | Expected | Persisted delta | Result |
|---|---:|---:|---|
| Score credits | 300 | 299 | KO |
| Deep Analysis credits | 100 | 99 | KO |
| Verification credits | 140 | 139 | KO |
| Nurture Signal credits | 40 | 40 | OK |
| Orders | 280 | 278 | KO |

## Interpretation

This is not a product-demand issue. It is an infrastructure issue.

The current Cloudflare KV ledger can answer small and medium beta tests, especially with retry/backoff. But at 300 score calls plus 280 purchase intents for one customer, the ledger becomes insufficient as the source of truth.

The issue is not only rate limiting. The more important risk is consistency:

- successful API responses can outpace persisted ledger state;
- credit deltas can become lower than successful operations;
- order counts can become lower than accepted purchase intents;
- billing, customer trust and auditability would be exposed if real payments were enabled.

## Decision

Do not enable real payments, open marketplace traffic or public beta volume on the current KV ledger.

Proceed with ledger migration before:

- real checkout;
- public marketplace launch;
- unrestricted external API keys;
- more than 100 orders/day;
- more than 1,000 scores/day;
- customer-facing paid credit balances.

## Recommended architecture

Use a split architecture:

1. Durable Objects for per-customer ledger writes.
   - One object per customer or API key.
   - Serializes score and purchase-intent consumption.
   - Prevents lost increments and race conditions.
   - Owns idempotency for a customer.

2. D1 for durable reporting and audit.
   - Customer table.
   - Ledger events table.
   - Orders table.
   - Product balances table.
   - Daily metrics table.

3. Queues for non-immediate work.
   - Async order enrichment.
   - Report generation.
   - CRM/webhook delivery later.

4. KV only for low-risk public/static data.
   - Product catalog.
   - Public manifests.
   - OpenAPI cache.
   - Discovery package cache.

## Suggested implementation phases

### Phase 1 - Compatibility layer

Add a ledger adapter interface in the Worker:

- `loadCustomerLedger(customerKey)`
- `consumeCredit(customerKey, productCode, idempotencyKey, metadata)`
- `saveOrder(customerKey, order)`
- `listOrders(customerKey, filters)`
- `getUsage(customerKey)`

Keep the existing KV implementation behind this adapter so current tests keep running.

### Phase 2 - Durable Object ledger

Add a Durable Object implementation for:

- credit balances;
- idempotency;
- ledger events;
- recent orders;
- atomic consume-and-order operations.

The purchase-intent endpoint should execute credit consumption and order creation inside the same Durable Object transaction path.

### Phase 3 - D1 audit mirror

Write ledger events and orders to D1 for:

- reporting;
- P&L;
- customer support;
- admin dashboard;
- post-sale management.

The API response should not depend on D1 being instantly available. Durable Object is the operational source of truth; D1 is the audit/reporting layer.

### Phase 4 - Migration tests

Repeat:

- 100-score auto purchase funnel;
- 200-score budget-cap funnel;
- 300-score stress funnel;
- duplicate idempotency test;
- customer usage read;
- orders list and single-order read.

Go/no-go criterion:

- successful score responses equal score credit delta;
- successful purchase responses equal product credit deltas;
- successful purchase responses equal order count;
- duplicate requests consume zero extra credits;
- no real payment or external contact in beta.

## Business implication

The funnel economics are promising, but the ledger must be reliable before we sell it.

Current conclusion:

- product logic: promising;
- machine-to-machine workflow: validated;
- budget-cap behavior: validated;
- current KV ledger: not acceptable for paid volume;
- next engineering milestone: ledger migration.
