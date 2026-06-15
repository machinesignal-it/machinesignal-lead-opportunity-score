# MachineSignal Cost Guard Final Test Policy

Date: 2026-06-15

## Purpose

Define the cost guard policy for the remaining sandbox and pre-beta test phase.

This policy does not approve commercial go-live, paid beta, real payments, invoices, production keys or real customer data.

## Current Decision

**Sandbox tests: allowed with limits**

**Paid beta: not approved**

**Commercial go-live: no-go**

## Current Price Basis

| Product | Current Planning Price | Unit |
|---|---:|---|
| Target Discovery Pack 250 | EUR 249 | 250 coherent targets or no-go coverage decision |
| Score Pack 1k | EUR 119 | 1000 valid scores |
| Domain Enrichment Pack 100 | EUR 149 | 100 enrichment decisions |
| Deep Analysis Pack 100 | EUR 349 | 100 valid deep analyses |
| Action Pack 25 | EUR 399 | 25 valid action packs |
| Opportunity Feed | EUR 249/month | 4 scans and 4 deliveries |
| API Starter | EUR 99/month | 500 valid scores |
| API Pro | EUR 499/month | 3000 valid scores, 50 deep analyses, 1 monthly feed |

## Test-Phase Hard Stops

| Signal | Level | Required Action |
|---|---|---|
| Cloudflare/KV/Worker returns repeated `429` | red | stop write-capped tests and continue only no-write checks |
| Sandbox customer creation daily limit reached | red | stop creating sandbox keys until reset |
| KV writes exceed 900/day | red | stop all write-capped tests |
| Unknown paid external API call requested | red | block call unless owner approved budget and provider |
| Real payment attempted | red | stop immediately |
| Invoice attempted | red | stop immediately |
| Payment method collection attempted | red | stop immediately |
| Real or personal data appears in test payload | red | block processing and do not store payload |
| Production API key appears in public artifact | red | stop and require rotation/revocation review |
| External outreach/email/contact attempted | red | stop immediately |

## Test-Phase Warning Thresholds

| Signal | Level | Required Action |
|---|---|---|
| KV writes exceed 500/day | yellow | pause write-heavy tests and prefer no-write/public checks |
| More than 2 failed deploys in the same day | yellow | pause deploy loop and inspect root cause |
| More than 3 sandbox keys created by same evaluator fingerprint | yellow/red | stop creating keys until reset |
| Same API bug repeats after fix | yellow | create regression test before further live tests |
| Product cost estimate exceeds target margin | yellow | mark product as not live-ready until price/cost review |

## Sandbox Key Limits

Current worker default:

- global sandbox customer creation limit: 25/day;
- fingerprint sandbox customer creation limit: 3/day;
- sandbox key expiry: 7 days;
- sandbox score credits: 5;
- sandbox target discovery credits: 1;
- sandbox deep analysis credits: 1;
- sandbox action pack credits: 1;
- sandbox verification credits: 1;
- sandbox nurture signal credits: 1;
- sandbox domain enrichment credits: 1;
- opportunity feed credits: 0.

Interpretation:

The sandbox is intentionally small. If we hit the limit, it means the guard is working. The correct action is to stop and resume after reset, not increase retries.

## Valid Output Cost Rule

Credits may be consumed only when a valid, usable output is produced.

Not billable / not consumable:

- duplicate records;
- invalid domains;
- non-analyzable records;
- outputs with insufficient signal for the purchased product;
- gate failures that correctly block the next product;
- no-go market coverage decisions where the pack cannot be delivered.

## Margin Targets Before Paid Beta

Minimum target:

- gross margin before agent credits: 70%;
- margin after agent/automation cost: 55%;
- unknown external-cost dependency: no-go until measured.

Current pricing improves the previous weak-margin products:

- Target Discovery moved from EUR 149 to EUR 249;
- Score Pack 1k moved from EUR 99 to EUR 119;
- Deep Analysis moved from EUR 249 to EUR 349;
- Action Pack moved from EUR 149 to EUR 399.

Before paid beta, each product still needs measured cost-per-valid-output.

## Agent Operating Rules

Agents may:

- run no-write checks;
- run public documentation checks;
- run local regression tests;
- run one controlled sandbox-key recheck after reset;
- create reports, matrices and probes;
- stop automatically when limits are reached.

Agents may not:

- retry sandbox key creation repeatedly after `429`;
- call paid external APIs without approved budget;
- use real or personal data;
- execute payment flows in live mode;
- collect payment methods;
- issue invoices;
- contact external targets;
- distribute production API keys;
- launch public paid marketplace or hosted MCP channels.

## Current Recommendation

Cost guard status for continued testing: **PASS WITH ACTIVE LIMITS**.

Cost guard status for paid beta: **CONDITIONAL / NOT YET PASS**.

The immediate next safe action is to wait for sandbox key reset and rerun the authenticated live API sandbox journey once. If it passes, run an agent review before preparing any paid-beta decision packet.
