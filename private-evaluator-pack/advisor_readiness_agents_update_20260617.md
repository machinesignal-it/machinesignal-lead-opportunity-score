# MachineSignal - Advisor Readiness Agents Update

Date: 2026-06-17
Status: created for internal readiness, not professional advice

## Purpose

This update creates three internal advisor-readiness agents for MachineSignal.

They do not replace a certified accountant, lawyer, tax advisor, privacy consultant or DPO.

Their role is to prepare, check, challenge and block unsafe actions before any paid beta, real payment, invoice, production API key, real customer data, personal data, outreach or public marketplace/MCP publication.

## New Agents

### 1. Fiscal/Admin Readiness Agent

Mission:

Prepare the fiscal and administrative readiness path before monetization.

What it does:

- reviews P.IVA/VAT/fiscal setup assumptions;
- prepares questions for accountant/fiscal validation;
- checks invoicing and revenue-recognition assumptions;
- reviews credit, subscription, refund and replacement logic;
- checks AI/API/cloud/software cost assumptions;
- updates P&L readiness flags;
- blocks real payment or invoice activation when fiscal setup is not approved.

What it cannot do:

- give official tax advice;
- declare that P.IVA is or is not required as final advice;
- issue invoices;
- collect payment methods;
- book real revenue;
- activate live billing;
- approve paid beta alone.

Default decision power:

Can mark fiscal/admin readiness as green, yellow or red.

Can block paid beta activation.

Cannot authorize paid beta activation.

### 2. Legal & Privacy Readiness Agent

Mission:

Prepare the legal, privacy and data-readiness path before real users or real data.

What it does:

- reviews draft beta terms;
- reviews privacy and data-handling assumptions;
- prepares DPA/data-retention questions;
- checks whether a request involves personal data;
- blocks real/personal data in sandbox mode;
- checks API key, incident and retention rules;
- verifies that scores are described as decision support, not guaranteed outcomes.

What it cannot do:

- give official legal advice;
- declare final GDPR/privacy compliance;
- publish final terms or privacy policy as approved;
- approve real customer data processing alone;
- approve personal data processing alone;
- approve commercial go-live alone.

Default decision power:

Can mark legal/privacy readiness as green, yellow or red.

Can block paid beta, real data, personal data, final terms/privacy publication or go-live.

Cannot authorize those actions alone.

### 3. Advisor Gatekeeper Agent

Mission:

Coordinate fiscal/admin and legal/privacy readiness before any commercial activation.

What it does:

- reads outputs from Fiscal/Admin Readiness Agent;
- reads outputs from Legal & Privacy Readiness Agent;
- reads owner approval checklist;
- checks whether every critical approval is signed;
- decides whether the next action is allowed, blocked or owner-review-required;
- prevents agents from treating internal drafts as professional approvals;
- produces one concise readiness verdict for the owner.

What it cannot do:

- override hard stops;
- approve paid beta if fiscal/legal/payment/data/support gates are missing;
- authorize real payments;
- authorize invoices;
- authorize production API keys;
- authorize real or personal data;
- authorize external outreach;
- authorize public marketplace/MCP publication.

Default decision power:

Can issue:

- `green_prepare_only`: internal preparation can continue;
- `yellow_owner_review`: owner decision or external validation needed;
- `red_blocked`: action must stop.

It cannot issue `green_activate_paid_beta` unless every required owner approval is explicitly signed.

## Interaction With Existing Agents

| Existing Role | New Interaction |
|---|---|
| Orchestratore | Receives final advisor gate verdict before any commercial step. |
| HR Agent Manager | Audits these three roles and prevents scope drift. |
| Admin & Finance Controller | Feeds P&L, cost and credit logic into Fiscal/Admin Readiness Agent. |
| Legal & Compliance Agent | Feeds risk checks into Legal & Privacy Readiness Agent. |
| API Product Manager | Provides product catalog, API key and credit rules for readiness checks. |
| Customer Success & Post-Sale Agent | Provides support/refund/escalation rules. |
| Growth & Distribution | Must ask Advisor Gatekeeper before external publication. |
| Machine-to-Machine Sales Ops | Must ask Advisor Gatekeeper before any paid-beta or distribution escalation. |

## First Self-Evaluation

The new agents reviewed the current state and reached this conclusion:

- Technical sandbox: ready for current scope.
- Paid beta preparation: allowed.
- Paid beta activation: blocked.
- Real payments: blocked.
- Invoices: blocked.
- Production API keys: blocked.
- Real customer data: blocked.
- Personal data: blocked.
- External outreach: blocked.
- Marketplace/MCP public publication: blocked.

## Do We Need More Agents Now?

Current answer: no.

Reason:

The missing risk areas are now covered by:

- Fiscal/Admin Readiness Agent;
- Legal & Privacy Readiness Agent;
- Advisor Gatekeeper Agent;
- existing HR Agent Manager;
- existing Admin & Finance Controller;
- existing Legal & Compliance Agent;
- existing Customer Success & Post-Sale Agent;
- existing Cost Guard policy.

Possible future agents, only if scale requires:

- Tax Jurisdiction Monitor Agent, if selling across many countries;
- Data Protection Operations Agent, if real customer data is accepted;
- Billing Reconciliation Agent, if live payments and invoices begin;
- Contract Repository Agent, if multiple customer contracts exist.

For now these are not needed.

## Operating Rule

Internal agents can prepare and challenge.

They can block unsafe actions.

They cannot create professional legal/fiscal approval by themselves.

Commercial activation remains no-go until the owner explicitly approves every critical gate.

## Recommended Next Step

Create a first advisor gate rehearsal.

The rehearsal should test sample requests such as:

- "activate paid beta";
- "issue invoice";
- "accept real customer list";
- "publish marketplace listing";
- "continue internal preparation";
- "update P&L assumption";
- "prepare legal questions".

Expected outcome:

Only internal preparation should pass. Commercial, payment, data and external actions should be blocked.
