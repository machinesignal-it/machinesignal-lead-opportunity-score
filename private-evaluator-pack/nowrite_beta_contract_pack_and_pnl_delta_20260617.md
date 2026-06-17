# MachineSignal - No-Write Beta Contract Pack + P&L Paid-Beta Delta

Date: 2026-06-17  
Status: internal draft, no-write, not legal approval, not fiscal approval, not activation  
Recommended decision: prepare controlled paid beta, do not activate paid beta

## Purpose

This pack combines two things:

1. A no-write beta contract/policy pack.
2. A paid-beta P&L delta model for owner decision.

It does not activate payments, invoices, payment method collection, production API keys, real customer data, personal data, external outreach, public marketplace publication, hosted public MCP or MCP registry submission.

## Current Gate

| Area | Current Status |
|---|---|
| Technical sandbox | Complete for current scope |
| Advisor gate setup | Complete for current scope |
| Paid beta preparation | Go |
| Paid beta activation | No-go |
| Commercial go-live | No-go |

## Part A - No-Write Beta Contract Pack

### A1. Parties Draft

Provider:

```text
MachineSignal / legal entity to be confirmed
```

Customer:

```text
The organization, developer, CRM, workflow, AI agent operator or software account that uses the API.
```

Important rule:

The interface can be a machine, but there is still a responsible legal person or organization behind that machine.

### A2. Service Draft

MachineSignal provides machine-readable commercial decision-support outputs.

Examples:

- lead opportunity score;
- confidence;
- spend policy;
- next product recommendation;
- target discovery result;
- deep analysis;
- action pack payload;
- usage and order status.

MachineSignal sells structured decision-support outputs. It does not guarantee sales, revenue, legal compliance of the customer's actions, lead conversion or perfect accuracy of third-party/public data.

### A3. Beta Nature Draft

During beta:

- endpoints may change;
- schemas may change;
- price and credit rules may be revised before final launch;
- usage may be capped;
- access can be paused for cost, abuse, security, data or policy risk;
- outputs must be treated as decision-support, not final truth.

### A4. Allowed Beta Preparation

Allowed now:

- sandbox API tests;
- synthetic or non-personal data tests;
- machine-readable documentation review;
- no-write contract review;
- no-write P&L review;
- internal agent review;
- owner decision preparation.

### A5. Not Allowed Until Future Approval

Blocked:

- real payments;
- invoices;
- payment method collection;
- production API keys;
- real customer datasets;
- personal data;
- external outreach;
- marketplace publication;
- hosted public MCP;
- MCP registry submission.

### A6. Data Policy Draft

Current rule:

```text
Synthetic or non-personal sandbox/test data only.
```

Allowed in preparation:

- synthetic domains;
- demo companies;
- non-personal business categories;
- generated request IDs;
- product codes;
- technical usage/status records.

Blocked in preparation:

- personal names;
- personal emails;
- personal phone numbers;
- private contact lists;
- payment card data;
- passwords;
- API secrets;
- confidential customer lists;
- sensitive personal data.

Future paid beta must define retention, deletion, export, support and incident rules before any real data is accepted.

### A7. Credit And Replacement Draft

Core rule:

> Credits are consumed only when MachineSignal produces a valid usable output for the purchased product.

No consumption or replacement credit should apply when:

- internal API error;
- required output fields missing;
- duplicate caused by MachineSignal processing;
- blocked-policy state;
- invalid provider-side response;
- output fails the product's validity rule.

Credits can be consumed even when:

- the score is low;
- the decision is discard;
- the customer disagrees with the commercial judgement;
- the target is unattractive but the output is complete and valid.

### A8. Refund Draft

Refunds are not active.

Before paid beta, owner must decide:

- whether refunds exist;
- whether refunds are cash refunds or replacement credits;
- maximum refund exposure per customer;
- who approves refunds;
- time limit for claims;
- evidence required for invalid output.

Recommended beta approach:

```text
Replacement credits first, cash refunds only by explicit owner approval.
```

### A9. Support Draft

Support should remain machine-first.

Machine-readable support categories:

- authentication error;
- schema error;
- usage ledger mismatch;
- missing output fields;
- invalid output claim;
- blocked policy;
- insufficient credits;
- cost cap reached;
- production access denied;
- security/data concern.

Owner escalation required for:

- paid beta activation;
- payment/invoice issue;
- production key request;
- real-data request;
- personal-data request;
- legal/privacy/fiscal request;
- suspected secret exposure;
- public marketplace or MCP request.

### A10. Security And Kill Switch Draft

Before paid beta, the system must have:

- production key cap;
- daily usage cap;
- monthly usage cap;
- daily cost cap;
- monthly cost cap;
- revoke key procedure;
- pause customer procedure;
- restart procedure;
- incident log.

If any cap is missing, paid beta remains blocked.

## Part B - P&L Paid-Beta Delta

### B1. Why This Delta Exists

The previous P&L is still useful for long-range planning, but the immediate decision is smaller:

> Can a tiny controlled paid beta be economically sensible without creating unmanaged legal, fiscal, support or infrastructure risk?

This delta does not record revenue. It only models possible beta economics.

### B2. Beta Product Assumption

Recommended first product:

```text
Score Pack 1k
```

Reason:

- easiest for a machine buyer to understand;
- easiest to meter;
- valid-output rule is simple;
- lower operational ambiguity than Target Discovery;
- easier to support in a controlled beta.

Reference price:

```text
EUR 119 per 1,000 valid scores
```

### B3. Cost Assumption Per Score Pack 1k

Indicative variable cost per Score Pack 1k:

| Cost Item | Estimated Cost EUR | Why It Exists |
|---|---:|---|
| Agent/model processing | 8 | Score reasoning, validation, short decision payloads and automated checks |
| Data/source checks | 10 | Public source lookup, domain/status verification and enrichment-light checks |
| Cloudflare/API/storage | 2 | Worker execution, request handling, KV/storage and logs |
| QA/replacement reserve | 6 | Invalid output checks, replacement credits and edge-case handling |
| Support reserve | 5 | Machine support states, owner escalation buffer and incident handling |
| Admin/compliance reserve | 4 | Fiscal/privacy/admin preparation overhead allocated per pack |
| Total estimated variable cost | 35 | Planning assumption only |

Estimated contribution per Score Pack 1k:

```text
Revenue 119 - variable cost 35 = contribution 84 EUR
```

Estimated contribution margin:

```text
about 71%
```

### B4. Tiny Beta Scenarios

| Scenario | Beta Customers | Packs Per Customer | Revenue EUR | Variable Cost EUR | Contribution EUR |
|---|---:|---:|---:|---:|---:|
| Test 1 | 1 | 1 | 119 | 35 | 84 |
| Test 3 | 3 | 1 | 357 | 105 | 252 |
| Test 5 | 5 | 1 | 595 | 175 | 420 |
| Test 10 | 10 | 1 | 1,190 | 350 | 840 |

Interpretation:

- A very small paid beta is not meaningful as a business result.
- It is meaningful as a validation of willingness to pay, metering, support and cost controls.
- The first goal is not profit scale; the first goal is proof that a machine/customer can pay for valid outputs without manual chaos.

### B5. Break-Even View

If monthly fixed readiness cost is estimated at EUR 250:

| Packs Sold | Contribution EUR | Fixed Readiness Cost EUR | Beta Net EUR |
|---:|---:|---:|---:|
| 1 | 84 | 250 | -166 |
| 3 | 252 | 250 | 2 |
| 5 | 420 | 250 | 170 |
| 10 | 840 | 250 | 590 |

Interpretation:

- At 1 customer, beta is a learning test, not a profit event.
- Around 3 packs, beta can roughly cover a small readiness cost assumption.
- From 5-10 packs, the beta starts to show useful contribution, if support remains agent-first and bounded.

### B6. Risk Adjustment

The margin only makes sense if these remain true:

- no heavy manual support;
- no uncontrolled real-data processing;
- no expensive external data calls without cap;
- no public marketplace demand spike;
- no uncapped Cloudflare/KV writes;
- no custom work hidden inside low-price packs;
- no refunds beyond replacement-credit logic.

If any of these break, the beta should stop.

### B7. P&L Decision

P&L conclusion:

```text
Small paid beta can be economically sensible as a validation test, not as a revenue launch.
```

Recommended first cap:

- maximum 3-5 beta customers;
- Score Pack 1k only;
- no auto-renewal;
- production key manual approval only;
- hard monthly beta cost cap;
- replacement credits instead of automatic cash refunds;
- no real personal data.

### B8. What Changes In The General P&L Later

If beta is approved later, the general P&L should add:

- paid-beta ramp line separate from full commercial revenue;
- Score Pack 1k as first monetization product;
- beta support reserve;
- replacement-credit reserve;
- cost cap assumption;
- legal/fiscal/admin setup cost as pre-commercial readiness cost;
- no full-scale marketplace revenue until distribution approval.

## Current Final Decision

Paid beta preparation: go.

Paid beta activation: no-go.

Commercial go-live: no-go.

Next safe action:

> Prepare a beta contract checklist-to-policy mapping and, later, update the formal Excel/PPT P&L only after owner approval of the beta assumptions.

Machine-readable guardrail:

```text
Continue without activating payments, invoices, production keys, real data, outreach or public publication.
```
