# MachineSignal - Durable Object ledger post-deploy validation

- Date: 2026-06-01
- Commit deployed: `de307da`
- GitHub Actions run: success
- Result: Durable Object ledger validated for controlled beta volume.

## Live smoke test

A temporary beta customer was created after deploy.

| Check | Result |
|---|---|
| `GET /v1/usage` backend before score | `durable_object` |
| Score backend | `durable_object` |
| Purchase backend | `durable_object` |
| `GET /v1/usage` backend after purchase | `durable_object` |
| Score credits used | 1 |
| Deep Analysis credits used | 1 |
| Recent orders | 1 |
| Real payment executed | false |
| External contact executed | false |

## 300-score stress retest

This is the same stress class that previously exposed KV ledger inconsistency.

| Metric | Before Durable Object | After Durable Object |
|---|---:|---:|
| Score responses | 300 | 300 |
| Purchase responses | 280 | 280 |
| Score credit delta | 299 | 300 |
| Deep Analysis credit delta | 99 | 100 |
| Verification credit delta | 139 | 140 |
| Nurture Signal credit delta | 40 | 40 |
| Orders count | 278 | 280 |
| Failed checks | 3 | 0 |

## Post-migration result

The Durable Object ledger fixes the paid-volume blocker found in the KV stress test:

- successful score responses now equal score credit consumption;
- successful purchase responses now equal product credit consumption;
- accepted purchase intents now equal order count;
- safety flags remain false;
- no real payments or external contacts are executed.

## Current decision

The ledger migration is technically validated for controlled beta.

Next steps:

1. keep KV for catalog/cache/public manifests;
2. keep Durable Object as operational ledger source of truth;
3. add D1 later for audit/reporting before real payments;
4. run one higher-volume test only after D1/audit design is ready.
