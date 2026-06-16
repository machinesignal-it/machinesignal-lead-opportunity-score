# MachineSignal Paid-Beta Owner Approval Checklist

Date: 2026-06-16

Status: draft for owner review

Primary customer interface: machine

## Purpose

This checklist defines exactly what must be approved before MachineSignal accepts the first real paid customer or paid machine account.

It does not approve paid beta.

It does not activate real payments, invoices, payment method collection, production API keys, real customer data, personal data, marketplace publication, hosted public MCP, registry submission or outreach.

## Current Decision

```text
TECHNICAL SANDBOX: CLOSED FOR CURRENT SCOPE
PAID BETA: NOT APPROVED
COMMERCIAL GO-LIVE: NO-GO
```

## Plain Summary For The Owner

The product test is technically strong enough.

The business is not yet ready to sell.

Before selling, the owner must explicitly approve the legal, fiscal, payment, data, support, cost and production-access rules below.

## Approval Rule

Paid beta can start only when every mandatory gate below is marked:

```text
APPROVED BY OWNER
```

Any gate marked `missing`, `draft`, `blocked` or `not reviewed` keeps paid beta blocked.

## Mandatory Owner Gates

| Gate | Current state | Owner approval needed | Why it matters |
| --- | --- | --- | --- |
| Owner commercial decision | missing | Decide whether to run a paid beta at all | Without explicit approval, agents must continue only sandbox/test work. |
| Fiscal setup | not closed | Decide PIVA/accounting/invoicing path | We must know whether and how money can be collected and recorded. |
| Invoice flow | blocked | Define invoice/receipt process before charging | No customer should pay if the fiscal document process is unclear. |
| Payment provider | blocked | Approve live payment provider or keep test-only | Live checkout must not activate accidentally. |
| Terms of service | draft/not reviewed | Approve legal terms for beta use | Customers need clear limits, disclaimers and responsibilities. |
| Privacy policy | draft/not reviewed | Approve privacy/data language | We must define what data is processed and what is excluded. |
| Data policy | synthetic-only | Approve whether real business data can be accepted | Real or personal data remains blocked until rules are explicit. |
| Acceptable use | draft/not reviewed | Approve prohibited uses and abuse handling | Machines must know what they cannot ask the API to do. |
| Refund/credit policy | draft | Approve valid-output and refund/credit rules | We need clear rules when an output is invalid or incomplete. |
| Support policy | sandbox-ready only | Approve beta support, escalation and incident handling | Paid users need a defined support path, even if machine-first. |
| Production API keys | blocked | Approve issuance, limits, rotation and revocation | External paid users need controlled access, not unlimited access. |
| Cost guard | test-ready only | Approve hard monthly/daily budget caps | Prevent runaway Cloudflare, provider or API costs. |
| Security baseline | partial | Approve key storage, secret handling and access control | Protect credentials, customers and infrastructure. |
| Marketplace/registry | blocked | Decide whether publication is allowed later | Public distribution can create obligations and demand before readiness. |
| External outreach | blocked | Decide whether any outreach is allowed later | Current strategy remains machine-first and no human outreach. |

## Minimum Paid-Beta Shape If Approved Later

The recommended first paid beta should be deliberately small:

- 1 customer or machine account first;
- 1 product first;
- sandbox-to-paid transition manually approved by owner;
- hard usage limits;
- hard daily and monthly cost caps;
- no auto-renewal;
- no real personal data;
- no external outreach;
- no marketplace launch;
- no hosted public MCP launch;
- no public registry submission;
- immediate kill switch.

## Recommended First Product

First paid product:

```text
Score Pack 1k
```

Reason:

- easiest for a machine buyer to understand;
- requires the customer machine to already have a list;
- credit consumption can be audited record by record;
- less operational ambiguity than Target Discovery;
- easier to support if output quality is challenged.

## Recommended Second Product

Second paid product:

```text
Target Discovery Pack 250
```

Only after the owner approves:

- minimum deliverable rule;
- replacement/credit rule if fewer than 250 valid targets are found;
- data source policy;
- no-personal-data rule;
- quality acceptance rule.

## Explicitly Not Approved By This Checklist

This checklist does not approve:

- live payments;
- payment method collection;
- invoices;
- paid customer onboarding;
- production API key release;
- real customer data;
- personal data;
- external outreach;
- marketplace publication;
- hosted public MCP;
- MCP registry submission;
- automated contact with real companies or people.

## Machine-First Beta Principle

Even in paid beta, the buyer interface should remain machine-first.

The machine should be able to:

- read what products exist;
- understand price and credit consumption;
- ask for purchase intent;
- understand what is blocked;
- retrieve order and usage status;
- receive error codes and next allowed actions;
- stop before any action requiring owner approval.

## Owner Approval Table

| Approval item | Required before paid beta | Current value |
| --- | --- | --- |
| Paid beta yes/no | yes | not approved |
| First product allowed | yes | proposed: Score Pack 1k |
| Maximum beta customers | yes | proposed: 1 first |
| Maximum monthly cost | yes | not approved |
| Maximum daily writes/API calls | yes | not approved |
| Data allowed | yes | synthetic/non-personal only for now |
| Live payment provider | yes | blocked |
| Invoice process | yes | blocked |
| Terms/privacy accepted | yes | not reviewed |
| Production key policy | yes | draft/test only |
| Support policy | yes | sandbox-ready only |
| Kill switch owner | yes | not assigned |

## Agent Instruction Until Approval

Until every mandatory gate is approved:

- keep paid beta blocked;
- keep commercial go-live blocked;
- keep real payments blocked;
- keep invoices blocked;
- keep payment method collection blocked;
- keep production customer onboarding blocked;
- keep real and personal data blocked;
- keep outreach blocked;
- keep marketplace and registry publication blocked.

Agents may continue:

- no-write readiness work;
- local and sandbox tests;
- documentation hardening;
- legal/admin/payment drafts;
- support flow drafts;
- cost guard probes;
- owner-decision preparation.

## Recommended Next Step

Prepare a no-write beta contract pack:

```text
terms draft + privacy/data policy draft + refund/credit policy draft + support/SLA draft
```

This is the next useful step because it closes the largest non-technical gap without activating payments or customers.
