# MachineSignal - KV Write Budget Profile

Version: 2026-06-05

## Why This Exists

Cloudflare warned that the daily Workers KV free-tier put limit was exceeded. That does not mean the MachineSignal public site is down, and it does not mean the machine discovery files are broken. It means automated tests can create too many backend write operations if they create sandbox customers or run write-heavy flows without limits.

This profile tells agents and machines which calls are safe for daily checks and which calls must be treated as controlled write-budget tests.

## Practical Rule

Daily automation should run in `NoWrite` mode:

- public discovery only;
- GET requests only;
- no sandbox customer creation;
- no score credit consumption;
- no purchase intent creation;
- no payment-test state creation.

Full tests should be manual and bounded.

## Estimated Write Budget

| Endpoint group | KV puts with Durable Object | Durable Object writes | Daily automation rule |
|---|---:|---:|---|
| GET public discovery endpoints | 0 | 0 | Safe |
| GET authenticated read endpoints | 0 | 0 | Safe |
| POST `/v1/sandbox/customers` | 3 | 1 | Manual only |
| POST `/v1/beta/customers` | 2 | 1 | Admin manual only |
| PATCH `/v1/beta/customers/{customer_id}` | 2 | 1 | Admin manual only |
| POST `/v1/lead-opportunity-score` | 0 | 1 | Bounded only |
| POST `/v1/purchase-intent` | 0 | 1 | Bounded only |
| POST `/v1/payment-test/intents` | 0 | 1 | Bounded only |
| POST `/v1/payment-test/webhooks/stripe` | 0 | 1 | Bounded only |

If Durable Object is unavailable, ledger writes can fall back to KV. In that case each ledger-writing POST may add one KV put.

## What Consumes KV

The main KV risk is customer record storage:

- sandbox customer creation writes the sandbox daily-limit tracker;
- sandbox or beta customer creation writes API-key lookup records;
- customer updates rewrite customer records.

The score ledger is intended to use Durable Object storage, not KV, after the ledger migration.

## Agent Instructions

1. Start every day with `monitoring/machinesignal_daily_machine_buyer_monitor.ps1` in default `NoWrite` mode.
2. Use public files first: `llms.txt`, `machine-onboarding.json`, `product-catalog.json`, OpenAPI, MCP manifests.
3. Reuse existing sandbox or beta keys for test sessions.
4. Use an `Idempotency-Key` for every write endpoint.
5. Do not run loops that create sandbox customers.
6. Run `-Mode Full` only after deciding the daily write budget.
7. Escalate before any paid Cloudflare upgrade decision.

## Recommended Next Test

Run one bounded Full-mode sandbox flow only when approved. The goal is not volume. The goal is to confirm that:

- public discovery works;
- one sandbox or stored customer key can score;
- one recommended purchase intent can be created;
- usage ledger remains consistent;
- no real payment, external contact or real invoice occurs.
