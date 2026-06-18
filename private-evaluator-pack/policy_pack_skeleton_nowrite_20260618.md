# MachineSignal - Policy Pack Skeleton No-Write

Date: 2026-06-18  
Status: skeleton draft, no-write, not signed, not activated  
Decision: prepare paid beta only, keep activation blocked

## Purpose

This document is the skeleton of the policy pack required before a future controlled paid beta can be considered.

It is not a legal document.

It is not fiscal approval.

It is not owner approval.

It does not activate payments, invoices, payment method collection, production API keys, real customer data, personal data, external outreach, public marketplace publication, hosted public MCP or MCP registry submission.

## Master Rule

Paid beta remains blocked until every mandatory policy is completed, reviewed and explicitly approved by the owner.

Required final value:

```text
APPROVED BY OWNER
```

Fallback:

```text
DO_NOT_ACTIVATE
```

## Policy 1 - Owner Approval Policy

Status: skeleton only.

Purpose:

Define who can move MachineSignal from sandbox/preparation to controlled paid beta.

Must include:

- final go/no-go page;
- approval date;
- owner signature or explicit written approval;
- scope of approval;
- maximum beta customer count;
- first product allowed;
- blocked actions that remain blocked even after beta approval;
- rollback/stop authority.

Evidence required:

- signed decision to run controlled paid beta.

Stop rule if missing:

- paid beta blocked.

## Policy 2 - Fiscal/Admin Policy

Status: skeleton only.

Purpose:

Define whether and how MachineSignal can legally collect and record money.

Must include:

- P.IVA/company/fiscal path decision;
- accounting treatment;
- revenue recognition approach;
- invoice or receipt responsibility;
- tax/VAT treatment;
- refund accounting;
- cost tracking;
- admin owner.

Evidence required:

- written fiscal path decision.

Stop rule if missing:

- payments and invoices blocked.

## Policy 3 - Payment And Invoice Policy

Status: skeleton only.

Purpose:

Define how a customer can pay and how the fiscal document is generated.

Must include:

- payment model: no payment, manual invoice, prepaid credits, checkout or subscription;
- provider decision;
- test mode versus live mode;
- who can switch live mode on;
- invoice/receipt workflow;
- failed payment handling;
- refund flow;
- payment data prohibition;
- no storage of card data by MachineSignal.

Evidence required:

- payment mode and invoice/receipt process approved.

Stop rule if missing:

- live payment blocked.

## Policy 4 - Terms Of Service Draft

Status: skeleton only.

Purpose:

Define the commercial and usage terms for beta customers.

Must include:

- parties;
- machine interface and responsible human/legal entity behind it;
- beta nature;
- service description;
- no guarantee of sales or revenue;
- output limitations;
- customer responsibilities;
- API key responsibilities;
- usage limits;
- suspension and termination;
- disclaimers;
- liability limits;
- governing law placeholder.

Evidence required:

- reviewed beta terms including limits, disclaimers and customer responsibilities.

Stop rule if missing:

- customer onboarding blocked.

## Policy 5 - Privacy And Data Policy

Status: skeleton only.

Purpose:

Define what data MachineSignal can process and what remains forbidden.

Must include:

- allowed data categories;
- blocked data categories;
- personal data rule;
- real customer data rule;
- retention period;
- deletion process;
- export process;
- log minimization;
- no training without approval;
- data incident escalation.

Current default:

```text
Synthetic or non-personal sandbox/test data only.
```

Evidence required:

- reviewed privacy and data handling language.

Stop rule if missing:

- real and personal data blocked.

## Policy 6 - Acceptable Use Policy

Status: skeleton only.

Purpose:

Define what machines and customers cannot use MachineSignal for.

Must include:

- no spam;
- no harassment;
- no unlawful targeting;
- no scraping of personal contact data;
- no regulated decisions such as credit, employment, insurance or legal determinations;
- no bypassing usage/cost/rate limits;
- no resale as guaranteed verified data;
- abuse detection;
- suspension rules.

Evidence required:

- forbidden uses and abuse handling approved.

Stop rule if missing:

- production access blocked.

## Policy 7 - Product And Listino Policy

Status: skeleton only.

Purpose:

Define what each product sells, what the customer receives and how credits work.

Must include:

- product codes;
- units;
- deliverables;
- valid-output rule per product;
- non-consumption rule;
- replacement rule;
- beta price;
- tax/VAT treatment;
- discount/temporary price status;
- what is explicitly not included.

Evidence required:

- products, units, prices, tax treatment and deliverables approved.

Stop rule if missing:

- paid offers blocked.

## Policy 8 - Credit, Refund And Replacement Policy

Status: skeleton only.

Purpose:

Define when credits are consumed and what happens if an output is invalid.

Must include:

- valid-output rule;
- duplicate rule;
- invalid input rule;
- blocked-policy rule;
- replacement-credit rule;
- refund rule;
- refund approval owner;
- maximum refund exposure;
- claim time limit;
- audit trail fields.

Recommended current draft:

```text
Replacement credits first, cash refunds only by explicit owner approval.
```

Evidence required:

- non-consumption, replacement and refund rules approved.

Stop rule if missing:

- paid credits blocked.

## Policy 9 - Production API Key And Access Policy

Status: skeleton only.

Purpose:

Define how production access is issued, limited, rotated and revoked.

Must include:

- who can receive a production key;
- manual approval workflow;
- key naming;
- key scope;
- daily/monthly usage caps;
- rotation process;
- revocation process;
- lost key process;
- abuse response;
- audit log.

Evidence required:

- production key rules approved.

Stop rule if missing:

- production keys blocked.

## Policy 10 - Customer And Usage Cap Policy

Status: skeleton only.

Purpose:

Define how small the first beta must remain.

Must include:

- maximum beta customers;
- maximum machine accounts;
- maximum monthly scores;
- maximum daily writes;
- maximum API calls;
- maximum Deep Analysis outputs;
- maximum Action Packs;
- overage behavior;
- stop behavior when limit is reached.

Recommended first cap:

```text
3-5 beta customers, Score Pack 1k first, no auto-renewal.
```

Evidence required:

- customer count and usage caps approved.

Stop rule if missing:

- production keys blocked.

## Policy 11 - Cost Cap And Kill Switch Policy

Status: skeleton only.

Purpose:

Prevent uncontrolled cost, storage or write growth.

Must include:

- daily spend cap;
- monthly spend cap;
- Cloudflare/Worker/KV cap;
- external provider/API budget;
- write operation cap;
- alert threshold;
- kill switch owner;
- stop procedure;
- restart procedure;
- post-stop audit.

Evidence required:

- maximum spend, provider/API budgets, kill switch owner and restart procedure approved.

Stop rule if missing:

- production keys blocked.

## Policy 12 - Support And Escalation Policy

Status: skeleton only.

Purpose:

Define how support remains machine-first and bounded.

Must include:

- support channels;
- machine-readable support states;
- error categories;
- support response targets;
- owner escalation triggers;
- paid customer escalation cap;
- invalid-output handling;
- ledger mismatch handling;
- security/data concern handling.

Evidence required:

- support channel, machine-readable statuses and owner escalation approved.

Stop rule if missing:

- paid onboarding blocked.

## Policy 13 - Security And Incident Policy

Status: skeleton only.

Purpose:

Define how secrets, keys, incidents and access risks are handled.

Must include:

- secret storage rule;
- no secrets in public repo;
- API key rotation;
- access control;
- incident categories;
- incident owner;
- revoke/disable process;
- audit log;
- customer notification rule if relevant.

Evidence required:

- secret handling, incident response and access rules approved.

Stop rule if missing:

- production access blocked.

## Policy 14 - Distribution And No-Outreach Policy

Status: skeleton only.

Purpose:

Define how machines can discover MachineSignal without uncontrolled publication or human outreach.

Must include:

- allowed private/direct documentation;
- allowed public docs;
- marketplace decision;
- hosted MCP decision;
- MCP registry decision;
- Postman/public directory decision;
- no-human-outreach rule;
- external contact approval rule;
- takedown/unpublish process.

Evidence required:

- distribution channel and external contact decision approved.

Stop rule if missing:

- external publication and outreach blocked.

## Current Gap Priority

Close in this order:

1. Fiscal/admin policy.
2. Payment and invoice policy.
3. Terms/privacy/data policy.
4. Production API key and usage cap policy.
5. Cost cap and kill switch policy.

## Current Final Decision

Paid beta preparation: go.

Paid beta activation: no-go.

Commercial go-live: no-go.

Next safe action:

> Turn the skeleton into short draft policy sections, still no-write and without activating payments, invoices, production keys, real data, outreach or publication.
