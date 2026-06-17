# MachineSignal - Final Owner Approval Checklist v2

Date: 2026-06-17  
Status: final approval checklist draft, not signed, not activated  
Recommended decision today: prepare paid beta, do not activate paid beta

## Purpose

This checklist is the final gate before MachineSignal can move from sandbox/preparation to a controlled paid beta.

It does not approve or activate:

- real payments;
- invoices;
- payment method collection;
- production API keys;
- real customer data;
- personal data;
- external outreach;
- marketplace publication;
- hosted public MCP;
- MCP registry submission;
- commercial go-live.

## Current Decision

| Area | Status |
|---|---|
| Technical sandbox | Complete for current scope |
| Advisor gate setup | Complete for current scope |
| Paid beta preparation | Go |
| Paid beta activation | No-go |
| Commercial go-live | No-go |

## Master Activation Rule

Paid beta remains blocked unless every mandatory gate below is explicitly marked:

```text
APPROVED BY OWNER
```

Any other value means:

```text
DO NOT ACTIVATE
```

## Mandatory Gates

| Gate | Current Status | Approval Owner | Evidence Required | If Missing |
|---|---|---|---|---|
| Owner commercial decision | Not approved | Owner | Signed decision to run controlled paid beta | Paid beta blocked |
| Fiscal/admin path | Not approved | Owner + fiscal/admin advisor | Written decision on P.IVA/accounting/revenue treatment | Payments and invoices blocked |
| Invoice/receipt process | Not approved | Owner + fiscal/admin advisor | Defined invoice or receipt flow before first payment | Payments blocked |
| Payment mode | Not approved | Owner | Decision: no payment, manual invoice, prepaid credits, checkout or subscription | Live payment blocked |
| Payment provider | Not approved | Owner | Provider selected and test/live mode rules documented | Live payment blocked |
| Terms of service | Draft/not approved | Owner + legal/privacy review | Beta terms reviewed and approved | Customer onboarding blocked |
| Privacy policy | Draft/not approved | Owner + legal/privacy review | Privacy/data handling language reviewed and approved | Real data blocked |
| Data policy | Synthetic-only | Owner + legal/privacy review | Decision on real business data, personal data, retention and deletion | Real/personal data blocked |
| Acceptable use policy | Draft/not approved | Owner + legal/privacy review | Forbidden uses and abuse handling approved | Production access blocked |
| Product catalog | Draft/reference | Owner | Products, units and deliverables approved | Paid offers blocked |
| Price list | Draft/reference | Owner | Beta prices and VAT/tax treatment approved | Paid offers blocked |
| Credit consumption rule | Draft/reference | Owner | Valid-output rule and non-consumption rule approved | Paid credits blocked |
| Refund/replacement rule | Not approved | Owner | Refund or credit replacement process approved | Paid credits blocked |
| Production API key policy | Blocked | Owner + technical gate | Key issuance, caps, rotation and revocation approved | Production keys blocked |
| Customer limit | Not approved | Owner | Maximum number of beta customers approved | Customer onboarding blocked |
| Usage caps | Not approved | Owner + technical gate | Daily/monthly score, write and API limits approved | Production keys blocked |
| Cost cap | Not approved | Owner + admin/finance | Daily/monthly maximum cost approved | Production keys blocked |
| Kill switch | Not approved | Owner + technical gate | Stop/restart owner and procedure approved | Production keys blocked |
| Support policy | Draft/not approved | Owner | Support channel, response logic and escalation rules approved | Paid onboarding blocked |
| Incident/security policy | Draft/not approved | Owner + technical gate | Secret handling, incident response and access rules approved | Production access blocked |
| Distribution channel | Not approved | Owner | Private-only, selected directory, marketplace or MCP path approved | External publication blocked |
| External outreach | Blocked | Owner | Explicit decision if any external contact is ever allowed | Outreach blocked |

## Recommended First Paid Beta Shape If Approved Later

If the owner later approves every gate, the first paid beta should be deliberately small:

- 1 customer or machine account first;
- Score Pack 1k as first product;
- manual owner approval before issuing any production key;
- no auto-renewal;
- no personal data;
- real customer data allowed only if data policy is approved;
- hard monthly cost cap;
- hard daily write/API cap;
- support escalation capped;
- private access only;
- no public marketplace;
- no hosted public MCP;
- no MCP registry submission;
- kill switch enabled.

## Current Safe Agent Work

Agents may continue:

- internal documentation refinement;
- Company Brain alignment;
- OpenAPI/catalog/onboarding consistency checks;
- P&L and cost assumption updates;
- no-write policy drafts;
- synthetic or non-personal sandbox tests;
- owner decision material preparation.

Agents must stop and ask for owner approval before:

- any payment action;
- any invoice action;
- any payment method collection;
- any production API key;
- any real customer dataset;
- any personal data;
- any external contact;
- any public marketplace publication;
- any hosted public MCP;
- any MCP registry submission.

## Signature Fields

These fields are intentionally blank.

| Approval Area | Required Value | Current Value |
|---|---|---|
| Owner commercial approval | APPROVED BY OWNER | Not signed |
| Fiscal/admin approval | APPROVED BY OWNER | Not signed |
| Payment/invoice approval | APPROVED BY OWNER | Not signed |
| Legal/privacy approval | APPROVED BY OWNER | Not signed |
| Data policy approval | APPROVED BY OWNER | Not signed |
| Product/listino approval | APPROVED BY OWNER | Not signed |
| Credit/refund approval | APPROVED BY OWNER | Not signed |
| Production key approval | APPROVED BY OWNER | Not signed |
| Support approval | APPROVED BY OWNER | Not signed |
| Cost/kill switch approval | APPROVED BY OWNER | Not signed |
| Distribution approval | APPROVED BY OWNER | Not signed |

## Final Decision Today

Paid beta preparation: go.

Paid beta activation: no-go.

Commercial go-live: no-go.

Next safe action:

> Prepare the no-write beta contract pack and P&L paid-beta delta, still without activating payments, invoices, production keys, real data, outreach or public publication.
