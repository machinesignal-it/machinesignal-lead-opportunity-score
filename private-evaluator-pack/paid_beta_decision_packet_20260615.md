# MachineSignal Paid-Beta Decision Packet

Date: 2026-06-15

## Purpose

Prepare the owner decision packet for a future controlled paid beta.

This document does not approve paid beta. It does not activate real payments, invoices, payment method collection, production API keys, real customer onboarding, external outreach or commercial go-live.

## Current Default Decision

**Paid beta: NOT APPROVED**

**Commercial go-live: NO-GO**

**Allowed now: sandbox/test work only**

## Plain-Language Summary

MachineSignal is close to being technically testable by machines.

It is not yet ready to sell for real money.

Before selling, the owner must approve a controlled paid-beta decision and close legal, fiscal, payment, production-key and support gates.

## What Is Already Strong

| Area | Status |
|---|---|
| Public site and machine-readable documents | validated |
| Product catalog and prices | validated |
| Machine buyer journey from public docs | validated |
| API public availability | validated |
| Cost guard for test phase | validated |
| Support/post-sale automation policy | validated |
| Local API regression tests | validated |

## Current Blocker Before Paid-Beta Decision

The authenticated live API sandbox journey still needs one final recheck after the sandbox daily limit resets.

Required recheck:

`private-evaluator-pack/live_api_sandbox_machine_buyer_journey_probe_20260615.ps1`

The recheck must confirm:

- Target Discovery purchase-intent returns `beta_price_range_eur: "249"`;
- Score Pack flow returns score, confidence, decision and recommended next purchase;
- Action Pack without valid Deep Analysis source remains blocked;
- no real payment flag becomes true;
- no external contact flag becomes true.

## Paid-Beta Option A: Do Nothing Yet

Decision:

Continue sandbox tests only.

When to choose:

- if fiscal/legal/payment path is not ready;
- if owner wants no commercial risk;
- if sandbox authenticated recheck has not passed.

Impact:

- safest;
- no revenue;
- no customer obligation;
- more time to harden API and documentation.

## Paid-Beta Option B: Controlled Machine-Only Paid Beta

Decision:

Approve a very small paid beta only after all gates pass.

Suggested limits:

- max 1-3 beta customers;
- synthetic or non-personal business data only at first;
- no external outreach by MachineSignal;
- no public marketplace listing;
- no hosted public MCP listing;
- manual owner approval before each customer activation;
- daily cost cap;
- automatic support/usage reporting;
- reversible access.

Candidate products:

- Score Pack 1k;
- Target Discovery Pack 250;
- possibly Action Pack 25 only after Deep Analysis gate.

Do not include yet:

- full API Pro;
- Opportunity Feed recurring;
- custom/overage;
- real-data enrichment at scale.

## Paid-Beta Option C: Wait For Legal/Fiscal Setup First

Decision:

No paid beta until fiscal/admin/legal/payment path is complete.

When to choose:

- if P.IVA/accounting/invoicing is not clear;
- if terms/privacy have not been reviewed;
- if payment provider live mode is not configured;
- if owner wants zero compliance ambiguity.

Impact:

- slower;
- cleanest from legal/fiscal point of view;
- avoids rework after first paid customer.

## Mandatory Gates Before Any Paid Beta

| Gate | Required Before Paid Beta | Current State |
|---|---|---|
| Owner approval | explicit approval required | missing |
| Authenticated sandbox recheck | must pass after reset | pending |
| Fiscal/admin path | invoicing/tax path defined | not closed |
| Legal terms | reviewed for paid beta | draft only |
| Privacy/data policy | reviewed for actual data use | draft only |
| Payment provider | live mode approved, or test-only kept | blocked |
| Production API key policy | issue/rotate/revoke process ready | draft/test only |
| Support/post-sale | machine-first support ready | sandbox-ready, paid not live |
| Cost guard | hard limits and budget approved | test-ready, paid budget not approved |
| Data policy | real/personal data rules approved | synthetic/test only |

## Minimum Paid-Beta Scope If Approved Later

Recommended initial scope:

- one controlled customer;
- one limited API key;
- one product at a time;
- hard usage limits;
- no auto-renewal;
- no external outreach;
- no personal data;
- no marketplace publication;
- no production scale.

Recommended first paid product:

**Score Pack 1k**

Reason:

- easiest to understand for a machine with an existing list;
- clear valid-output credit rule;
- less operational ambiguity than Target Discovery;
- easier to audit usage.

Second product:

**Target Discovery Pack 250**

Only after:

- authenticated recheck confirms EUR 249 in purchase-intent;
- no-go/coverage fallback is clear;
- target quality acceptance rule is approved.

## Owner Decisions Needed Later

The owner must explicitly decide:

- whether to run a paid beta at all;
- whether fiscal setup is ready;
- whether legal/privacy language is acceptable;
- whether to accept real payments;
- whether to issue invoices;
- whether to allow real business data;
- which product is allowed first;
- maximum daily/monthly spend;
- maximum number of beta customers;
- whether support escalation rules are acceptable.

## Default Agent Instruction

Until owner approval:

- do not sell;
- do not collect money;
- do not collect payment methods;
- do not issue invoices;
- do not onboard real customers;
- do not process personal data;
- do not send outreach;
- do not publish to paid marketplaces;
- do not issue production API keys.

Agents may continue:

- sandbox testing;
- no-write documentation;
- local regression tests;
- support/cost guard probes;
- readiness reports;
- waiting for sandbox reset and rerunning the authenticated live API probe once.

## Recommendation

Do not approve paid beta today.

Recommended next step:

Wait for sandbox reset, rerun the authenticated live API sandbox journey, then hold an agent review. If that review passes, present this decision packet to the owner for a yes/no choice on a very small controlled paid beta.
