# MachineSignal Go/No-Go Matrix

Date: 2026-06-15

## Executive Summary

MachineSignal is technically close to a controlled sandbox/beta readiness state, but it is not commercially live.

Current decision:

**Commercial go-live: NO-GO**

**Paid beta: NOT APPROVED**

**Sandbox/test work: GO, with limits**

## Readiness Estimate

| Area | Readiness | Status |
|---|---:|---|
| Public site and machine-readable docs | 98% | GO for test |
| Public catalog/listino consistency | 98% | GO for test |
| Machine buyer journey from docs | 98% | GO for test |
| API public availability | 95% | GO for test |
| API authenticated sandbox journey | 80% | BLOCKED by sandbox daily limit |
| Pre-beta preparation | 86-88% | CONDITIONAL |
| Commercial go-live | 69-72% | NO-GO |

## What Is Validated

| Gate | Evidence | Status | Blocks Test | Blocks Paid Beta |
|---|---|---|---|---|
| Public site documentation | Live docs uploaded and validated 20/20 | PASS | no | no |
| Machine buyer journey from public docs | Live journey probe 39/39 | PASS | no | no |
| Public/API catalog pricing | Price consistency probe 13/13 | PASS | no | no |
| Target Discovery price alignment | Code fixed from 149 to 249, local tests pass | PASS locally | no | yes, until live authenticated recheck |
| API public endpoints | `/health`, catalog, onboarding, OpenAPI reachable | PASS | no | no |
| No unauthenticated protected access | `/v1/onboarding` returns 401 without key | PASS | no | no |
| Sandbox key creation | Works, then daily limit reached | PARTIAL | yes, for authenticated retest | yes |
| Local API tests | `test_api.mjs` and `test_durable_ledger.mjs` pass | PASS | no | no |

## Current Blocker

The live authenticated sandbox journey cannot be completed right now because the public sandbox customer creation endpoint returns:

`HTTP 429 sandbox_limit_exceeded`

This means the daily sandbox key creation limit has been reached for this evaluator fingerprint.

This is not a commercial failure. It is a cost/abuse guard doing its job.

## Must Recheck After Sandbox Reset

Rerun:

`private-evaluator-pack/live_api_sandbox_machine_buyer_journey_probe_20260615.ps1`

Required confirmations:

- `target_discovery` purchase-intent returns `beta_price_range_eur: "249"`;
- Score Pack returns score/confidence/decision/recommended next purchase;
- Action Pack without valid Deep Analysis source remains blocked;
- no real payment flag becomes true;
- no external contact flag becomes true.

## Commercial Gates Still Blocking Go-Live

| Gate | Status | Why It Blocks |
|---|---|---|
| Owner explicit go-live approval | missing | No commercial launch can happen without owner decision |
| Legal terms | draft only | Needs review before real customers or payments |
| Privacy/data policy | draft only | Needed before real/personal data processing |
| Fiscal/admin path | not closed | P.IVA/invoicing/tax flow not finalized |
| Payment provider live mode | blocked | No real card collection or real checkout approved |
| Production API key policy | draft/test only | No production customer access approved |
| Support/post-sale operations | draft/test only | Needed before paid customers |
| Cost guard | partially validated | Needs final budget thresholds |
| External distribution/marketplace | blocked | Requires explicit owner approval |

## Allowed Next Work

The agents may continue:

- sandbox/test probes;
- public documentation consistency checks;
- no-write legal/admin/support drafts;
- cost guard tests;
- synthetic API tests;
- local regression tests;
- monitoring for sandbox limit reset;
- roadmap updates.

## Still Blocked

The agents must not do:

- real payments;
- invoices;
- payment method collection;
- real customer onboarding;
- personal data processing;
- external outreach;
- email campaigns;
- public paid marketplace launch;
- hosted MCP public launch;
- production API key distribution;
- commercial go-live.

## Recommendation

Do not move to paid beta today.

Use the remaining test time for:

1. Wait for sandbox limit reset.
2. Rerun authenticated live API sandbox journey.
3. Run agent review after the authenticated probe.
4. If the authenticated probe passes, prepare a controlled paid-beta decision packet for owner review.

Owner workload today: no action required unless choosing to approve a future paid-beta decision packet.
