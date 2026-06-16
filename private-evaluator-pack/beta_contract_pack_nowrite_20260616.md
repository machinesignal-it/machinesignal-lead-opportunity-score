# MachineSignal Beta Contract Pack - No-Write Draft

Date: 2026-06-16

Status: draft for owner/legal review

Company name: MachineSignal, operational name only. Final legal entity/name to be confirmed.

Primary customer interface: machine

## Purpose

This pack prepares the legal, privacy, refund/credit and support language needed before any paid beta.

It is not a final contract.

It does not approve paid beta, live payments, invoices, payment method collection, production API keys, real customer data, personal data, marketplace publication, hosted public MCP, registry submission or outreach.

## Owner Summary

The API is technically close enough for sandbox use.

The next risk is not technical: it is commercial, legal, fiscal and support responsibility.

Before a first paid machine account, MachineSignal needs clear rules for:

- what the API sells;
- what counts as a valid output;
- what is not guaranteed;
- what data is allowed;
- when credits are consumed;
- when replacement credits are issued;
- how support works;
- what happens if the service is unavailable;
- who can approve a live paid beta.

## Section A - Terms Of Service Draft Outline

### A1. Parties

Provider:

```text
MachineSignal / legal entity to be confirmed
```

Customer:

```text
The organization, developer, software system, agent, workflow or CRM account using the API.
```

Important note:

The customer interface may be a machine, but the responsible contracting party is still the legal person or organization behind that machine.

### A2. Service Description

MachineSignal provides machine-readable commercial decision-support outputs through API endpoints.

Example outputs:

- lead opportunity score;
- confidence level;
- decision suggestion;
- target discovery payload;
- deep analysis summary;
- action pack payload;
- usage and order status.

The service provides decision-support signals. It does not guarantee sales, revenue, lead conversion, business results, legal compliance of customer actions or accuracy of third-party/public data.

### A3. Beta Nature

During beta:

- the service may change;
- endpoints, schemas and pricing can be revised with notice;
- outputs are experimental;
- usage limits may be stricter than future production plans;
- access can be paused for security, abuse, cost or compliance reasons.

### A4. Allowed Use

Allowed use in beta:

- sandbox testing;
- API integration testing;
- scoring synthetic or approved non-personal business records;
- evaluating machine-to-machine purchase-intent flows;
- retrieving order, usage and support status.

### A5. Prohibited Use

Blocked unless separately approved:

- processing personal data;
- scraping or enriching personal contact data;
- sending outreach to real people or companies through MachineSignal;
- using outputs for spam, harassment or unlawful targeting;
- reselling raw outputs as guaranteed verified data;
- bypassing usage, cost or rate limits;
- using production keys without approval;
- using the API for regulated decisions such as credit, employment, insurance or legal determinations.

### A6. Valid Output Rule

A credit should be consumed only when the API returns a valid output for the purchased product.

An invalid output should not consume a paid credit or should create replacement credit, depending on the approved product rule.

Valid output means the API returns:

- required schema fields;
- clear status;
- usable decision or deliverable;
- no internal error;
- no blocked-policy state.

### A7. Customer Responsibilities

The customer or customer machine is responsible for:

- sending lawful input;
- excluding personal data unless approved;
- respecting rate limits;
- using outputs as support signals, not absolute truth;
- checking outputs before taking real commercial actions;
- keeping API keys secure;
- not sharing credentials publicly.

## Section B - Privacy And Data Policy Draft Outline

### B1. Current Data Rule

Current approved rule:

```text
Synthetic data and non-personal test data only.
```

Real customer data and personal data remain blocked until the owner approves a formal data policy and legal review.

### B2. Data Categories

Possible allowed future data, only after approval:

- company name;
- domain;
- city/area;
- industry;
- public website signals;
- non-personal business metadata.

Blocked by default:

- personal names;
- personal emails;
- phone numbers linked to individuals;
- private contact lists;
- sensitive personal data;
- employee-level profiling;
- private CRM notes containing personal data.

### B3. Data Use

MachineSignal may use approved input data to:

- calculate score;
- classify opportunity;
- generate target discovery output;
- prepare machine-readable next actions;
- track usage, orders and support events;
- improve product quality through aggregated non-personal metrics.

### B4. Data Retention Draft

Default beta principle:

- retain only what is needed for order, usage, audit and support;
- avoid storing raw customer datasets when not needed;
- retain sandbox/test records for a limited period;
- allow deletion/export process before real beta.

Exact retention periods must be approved before paid beta.

### B5. No Training Without Approval

Customer data should not be used to train external models or create public datasets unless the customer and owner explicitly approve it.

## Section C - Refund And Credit Policy Draft

### C1. Core Principle

MachineSignal sells valid machine-readable outputs, not guaranteed commercial results.

A refund or replacement credit should be tied to delivery validity, not to whether the customer later closes a deal.

### C2. Score Pack 1k

Credit consumed when:

- one submitted record receives a valid score response;
- required fields are present;
- response includes score, confidence, decision and status.

Credit not consumed or replacement credit issued when:

- internal API error;
- blocked-policy response;
- malformed provider-side response;
- duplicate caused by MachineSignal processing error;
- missing required output fields.

Credit consumed even if:

- the score is low;
- the recommendation is discard;
- the customer disagrees with the commercial assessment;
- the website/target is not attractive.

### C3. Target Discovery Pack 250

Price includes:

```text
250 valid non-personal target records matching the approved market, area and commercial objective.
```

If fewer than 250 valid targets are found:

- deliver the valid targets found;
- state the gap clearly;
- issue replacement credits or a new discovery run for the missing valid records;
- do not claim the pack is complete until the minimum deliverable rule is satisfied or the owner/customer accepts partial completion.

### C4. Deep Analysis

Credit consumed when:

- a valid eligible target receives a structured deep analysis;
- the response includes evidence summary, opportunity reasons, risks and recommended next action.

Credit not consumed or replacement credit issued when:

- target is not analyzable due to provider/API failure;
- required fields are missing;
- output is blocked by policy.

### C5. Action Pack

Action Pack can be generated only after a valid Deep Analysis or approved equivalent source.

Credit consumed when:

- the API returns machine-readable action fields;
- CRM tags, next action, message angle and follow-up logic are present.

Blocked when:

- no valid source analysis exists;
- customer asks the API to contact humans or companies directly;
- action would violate no-outreach or compliance rules.

## Section D - Support And SLA Draft

### D1. Machine-First Support

Default support path should be machine-readable:

- status endpoint;
- order status;
- usage status;
- error code;
- suggested next action;
- support category;
- escalation flag.

### D2. Support Categories

Proposed beta categories:

- API unavailable;
- authentication/key issue;
- usage ledger mismatch;
- missing output fields;
- invalid target discovery result;
- duplicate handling;
- credit/refund request;
- billing/fiscal question;
- data/privacy concern;
- abuse/security incident.

### D3. Beta SLA Draft

Proposed beta SLA language:

```text
MachineSignal beta is provided with commercially reasonable efforts, not guaranteed uptime.
```

Suggested internal target before paid beta:

- acknowledge critical incidents within 1 business day;
- provide machine-readable status where possible;
- pause affected keys if cost, abuse or data risk is detected;
- issue replacement credits for confirmed delivery failures under the refund/credit policy.

This SLA must be reviewed before paid beta.

### D4. Kill Switch

The beta must include a clear kill switch:

- pause paid key;
- stop credit consumption;
- block new purchase-intent;
- preserve audit trail;
- notify support/status endpoint.

## Section E - Required Review Before Use

Before using this pack with any paying customer, the owner must confirm:

- final company/legal name;
- fiscal/invoice setup;
- payment provider and live/test mode;
- legal review of terms;
- privacy/data review;
- refund/credit policy approval;
- support/SLA approval;
- cost limits;
- production API key policy;
- kill switch owner.

## Current Decision

```text
PAID BETA: NOT APPROVED
COMMERCIAL GO-LIVE: NO-GO
CONTRACT PACK: DRAFT ONLY
```

## Recommended Next Step

Prepare the operational beta gate:

```text
production key policy + cost cap + kill switch + support/status endpoint alignment
```

This is the next practical gap after the contract draft because a paid beta cannot run safely without controlled access and immediate stop controls.
