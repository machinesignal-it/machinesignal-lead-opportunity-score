# MachineSignal - Short Draft Policy Sections No-Write

Date: 2026-06-18  
Status: short draft sections, no-write, not legal/fiscal approval, not signed, not activated  
Decision: prepare paid beta only, keep activation blocked

## Purpose

This document turns the policy skeleton into short draft policy sections. It is written so the owner and agents can see the intended operating rules before any formal review.

It does not activate payments, invoices, payment method collection, production API keys, real customer data, personal data, external outreach, public marketplace publication, hosted public MCP or MCP registry submission.

## Master Rule

Paid beta remains blocked unless every mandatory policy is completed, reviewed and explicitly marked:

```text
APPROVED BY OWNER
```

Current fallback:

```text
DO_NOT_ACTIVATE
```

## 1. Owner Approval Policy

Draft rule:

Only the owner can authorize a move from sandbox/preparation to controlled paid beta. Agent recommendations, technical test success and document completion are not enough.

Required owner decision:

- approve or reject paid beta activation;
- define scope and first product;
- define maximum beta customers;
- define what remains blocked;
- appoint who can stop and restart the beta.

Current state:

```text
not approved
```

Stop rule:

```text
paid_beta_blocked
```

## 2. Fiscal/Admin Policy

Draft rule:

MachineSignal must not collect money until the fiscal/admin path is clear. The policy must define whether a P.IVA, company setup, receipt, invoice or other fiscal process is required before the first payment.

Required owner decision:

- fiscal setup;
- invoice/receipt responsibility;
- VAT/tax treatment;
- revenue and refund recording;
- cost tracking owner.

Current state:

```text
not approved
```

Stop rule:

```text
payments_and_invoices_blocked
```

## 3. Payment And Invoice Policy

Draft rule:

Payments remain disabled until the owner approves the payment model, provider, invoice/receipt process and live-mode activation owner.

Allowed now:

- payment architecture draft;
- test-mode planning;
- no-write policy review.

Not allowed now:

- real payment;
- invoice;
- payment method collection;
- live checkout.

Current state:

```text
not approved
```

Stop rule:

```text
live_payment_blocked
```

## 4. Terms Of Service Draft

Draft rule:

The beta terms must explain that MachineSignal provides machine-readable decision-support outputs, not guaranteed sales, revenue, legal compliance or perfect data accuracy.

The responsible party is the legal person or organization behind the machine using the API.

Terms must include:

- beta nature;
- service limits;
- customer responsibilities;
- API key responsibility;
- usage limits;
- suspension rules;
- disclaimers and liability limits.

Current state:

```text
draft only
```

Stop rule:

```text
customer_onboarding_blocked
```

## 5. Privacy And Data Policy

Draft rule:

The default data mode remains synthetic or non-personal sandbox/test data only. Real customer datasets and personal data remain blocked until owner and legal/privacy review.

Allowed now:

- synthetic domains;
- demo companies;
- non-personal business categories;
- technical usage/status records.

Blocked now:

- personal names;
- personal emails;
- phone numbers linked to individuals;
- private contact lists;
- payment data;
- passwords or secrets;
- confidential customer lists.

Current state:

```text
synthetic/non-personal only
```

Stop rule:

```text
real_and_personal_data_blocked
```

## 6. Acceptable Use Policy

Draft rule:

MachineSignal must not be used for spam, harassment, unlawful targeting, scraping personal contact data, regulated decisions or bypassing limits.

Forbidden uses:

- spam or automated outreach through MachineSignal;
- harassment or unlawful targeting;
- personal contact scraping;
- credit, employment, insurance or legal determinations;
- resale as guaranteed verified data;
- bypassing rate, usage or cost controls.

Current state:

```text
draft only
```

Stop rule:

```text
production_access_blocked
```

## 7. Product And Listino Policy

Draft rule:

Every product must state exactly what is sold, what is delivered, when a credit is consumed and what is not included.

Current first product assumption:

```text
Score Pack 1k at EUR 119 for 1,000 valid scores
```

Must define:

- product code;
- unit;
- deliverable;
- valid-output rule;
- replacement rule;
- price;
- VAT/tax treatment;
- excluded services.

Current state:

```text
draft reference
```

Stop rule:

```text
paid_offers_blocked
```

## 8. Credit, Refund And Replacement Policy

Draft rule:

Credits are consumed only when MachineSignal produces a valid usable output for the purchased product.

Recommended beta rule:

```text
replacement credits first, cash refunds only by explicit owner approval
```

Must define:

- valid-output rule;
- duplicate rule;
- invalid input rule;
- blocked-policy rule;
- replacement-credit rule;
- cash refund rule;
- maximum refund exposure;
- claim time limit;
- audit trail.

Current state:

```text
draft only
```

Stop rule:

```text
paid_credits_blocked
```

## 9. Production API Key And Access Policy

Draft rule:

Production API keys remain blocked. If beta is later approved, keys must be issued manually, scoped, capped, rotated and revocable.

Must define:

- who can receive a key;
- approval workflow;
- key scope;
- usage caps;
- rotation;
- revocation;
- lost key handling;
- abuse response;
- audit log.

Current state:

```text
blocked
```

Stop rule:

```text
production_keys_blocked
```

## 10. Customer And Usage Cap Policy

Draft rule:

The first controlled beta must remain small enough to be stopped quickly.

Recommended first cap:

```text
3-5 beta customers, Score Pack 1k first, no auto-renewal
```

Must define:

- maximum beta customers;
- maximum machine accounts;
- monthly score cap;
- daily write cap;
- API call cap;
- overage behavior;
- stop behavior when limits are reached.

Current state:

```text
not approved
```

Stop rule:

```text
production_keys_blocked
```

## 11. Cost Cap And Kill Switch Policy

Draft rule:

The beta must stop automatically or manually when cost, write, usage or risk thresholds are reached.

Must define:

- daily spend cap;
- monthly spend cap;
- Cloudflare/Worker/KV cap;
- external API/provider cap;
- alert threshold;
- kill switch owner;
- stop procedure;
- restart procedure;
- post-stop audit.

Current state:

```text
not approved
```

Stop rule:

```text
production_keys_blocked
```

## 12. Support And Escalation Policy

Draft rule:

Support remains machine-first and bounded. The API should return support states and escalation flags before creating human-heavy support work.

Support states should include:

- authentication error;
- schema error;
- insufficient credits;
- usage ledger mismatch;
- invalid output claim;
- blocked policy;
- cost cap reached;
- production access denied;
- security/data concern.

Owner escalation required for:

- payment/invoice;
- production key;
- real/personal data;
- legal/privacy/fiscal request;
- security incident;
- publication request.

Current state:

```text
draft only
```

Stop rule:

```text
paid_onboarding_blocked
```

## 13. Security And Incident Policy

Draft rule:

Secrets, API keys and credentials must never be committed to public files. Incidents must be logged, contained and escalated.

Must define:

- secret storage rule;
- no-secrets-in-public-repo rule;
- access control;
- key rotation;
- revoke/disable procedure;
- incident categories;
- incident owner;
- audit trail;
- customer notification rule if needed.

Current state:

```text
draft only
```

Stop rule:

```text
production_access_blocked
```

## 14. Distribution And No-Outreach Policy

Draft rule:

MachineSignal should remain machine-first. Discovery can happen through documentation and machine-readable files, but uncontrolled public publication and human outreach remain blocked.

Allowed now:

- internal docs;
- GitHub docs;
- machine-readable files;
- sandbox documentation.

Blocked now:

- public paid marketplace publication;
- hosted public MCP launch;
- MCP registry submission;
- outreach to people or companies;
- external email campaigns.

Current state:

```text
blocked
```

Stop rule:

```text
external_publication_and_outreach_blocked
```

## Current Priority

The first policies to mature are:

1. Fiscal/admin.
2. Payment and invoice.
3. Terms/privacy/data.
4. Production key and usage caps.
5. Cost cap and kill switch.

## Current Final Decision

Paid beta preparation: go.

Paid beta activation: no-go.

Commercial go-live: no-go.

Next safe action:

> Prepare a compact owner-review packet that lists the unresolved policy questions, still without activating payments, invoices, production keys, real data, outreach or publication.
