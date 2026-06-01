# MachineSignal - Durable Object ledger migration status

- Date: 2026-06-01
- Status: implementation prepared, local tests passed, deploy pending through GitHub Actions.

## What changed

The Worker now supports a Durable Object ledger backend through the binding:

```text
MACHINESIGNAL_LEDGER_DO
```

The existing KV ledger remains as a fallback for compatibility. When the Durable Object binding exists, customer ledgers are loaded and written through one Durable Object per ledger key.

## Files changed

- `api_endpoint_minimal/core.mjs`
  - Added `MachineSignalLedgerDurableObject`.
  - Added Durable Object ledger helpers.
  - Added atomic score credit consumption through the Durable Object backend.
  - Added atomic purchase-intent credit consumption and order creation through the Durable Object backend.
  - Kept KV/memory compatibility for local and fallback paths.

- `api_endpoint_minimal/cloudflare_worker.mjs`
  - Exports `MachineSignalLedgerDurableObject` for Cloudflare Workers.

- `api_endpoint_minimal/wrangler.toml`
  - Adds Durable Object binding.
  - Adds migration `v20260601_ledger_do` with `new_sqlite_classes`.

- `api_endpoint_minimal/test_durable_ledger.mjs`
  - Adds a local mock Durable Object namespace.
  - Verifies score credits, purchase credits, idempotency and orders on the Durable Object backend.

- `.github/workflows/deploy-cloudflare-worker.yml`
  - Runs both the existing API test and the Durable Object ledger test before deploy.

## Local verification

Passed:

```text
node api_endpoint_minimal/test_api.mjs
node api_endpoint_minimal/test_durable_ledger.mjs
```

Durable Object local test result:

```json
{
  "ok": true,
  "ledger_backend": "durable_object",
  "score_count": 24,
  "purchase_count": 20,
  "purchase_by_product": {
    "deep_analysis": 8,
    "verification": 4,
    "nurture_signal": 8
  },
  "orders_count": 20
}
```

## Why this matters

The 300-score stress test showed that KV is not reliable enough as a paid ledger source of truth. Successful API responses could outpace persisted credit and order counts.

The Durable Object backend serializes writes per customer ledger and is the right operational layer before:

- public beta volume;
- marketplace traffic;
- real checkout;
- customer-facing paid credit balances.

## Next step after deploy

After GitHub Actions deploys the Worker:

1. create a new beta customer;
2. confirm `GET /v1/usage` returns `ledger_backend = durable_object`;
3. rerun the 300-score stress test;
4. confirm:
   - score responses equal score credit delta;
   - purchase responses equal add-on credit deltas;
   - purchase responses equal order count;
   - duplicate requests consume zero extra credits;
   - beta safety flags remain false.

If the 300-score test passes after deploy, the ledger migration is considered technically validated for controlled beta.
