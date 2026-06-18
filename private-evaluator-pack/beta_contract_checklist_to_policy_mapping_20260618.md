# MachineSignal - Beta Contract Checklist-To-Policy Mapping

Date: 2026-06-18  
Status: no-write internal mapping, not signed, not activated  
Decision: prepare paid beta only, keep activation blocked

## Purpose

This mapping connects every mandatory owner approval gate to the policy document or policy section that must exist before paid beta can be considered.

It does not approve paid beta.

It does not activate payments, invoices, payment method collection, production API keys, real customer data, personal data, external outreach, public marketplace publication, hosted public MCP or MCP registry submission.

## Master Rule

Every mandatory gate must have:

- policy section;
- evidence required;
- owner approval value;
- machine-readable blocked state;
- stop rule if missing.

If any mandatory gate is not approved, the decision remains:

```text
DO_NOT_ACTIVATE
```

## Gate-To-Policy Map

| Mandatory Gate | Policy Area | Policy Section Needed | Evidence Required | Current Status | Stop Rule |
|---|---|---|---|---|---|
| Owner commercial decision | Owner approval policy | Final go/no-go page | Signed decision to run controlled paid beta | Not approved | Paid beta blocked |
| Fiscal/admin path | Fiscal/admin policy | P.IVA/accounting/revenue treatment | Written fiscal path decision | Not approved | Payments and invoices blocked |
| Invoice/receipt process | Fiscal/admin policy | Invoice/receipt process | Defined fiscal document flow before first payment | Not approved | Payments blocked |
| Payment mode | Payment policy | Payment model | Decision: no payment, manual invoice, prepaid credits, checkout or subscription | Not approved | Live payment blocked |
| Payment provider | Payment policy | Provider and mode controls | Provider, test/live mode and activation owner documented | Not approved | Live payment blocked |
| Terms of service | Terms policy | Beta terms | Reviewed beta terms including limits, disclaimers and customer responsibilities | Draft only | Customer onboarding blocked |
| Privacy policy | Privacy policy | Privacy notice/data processing summary | Reviewed privacy and data-handling language | Draft only | Real data blocked |
| Data policy | Data policy | Allowed/blocked data, retention, deletion | Decision on real business data, personal data, retention and deletion | Synthetic-only | Real and personal data blocked |
| Acceptable use policy | Acceptable use policy | Prohibited uses and abuse handling | Forbidden uses, spam/outreach, regulated use and abuse handling approved | Draft only | Production access blocked |
| Product catalog | Product policy | Product units and deliverables | Products, units, valid-output rules and deliverables approved | Draft reference | Paid offers blocked |
| Price list | Pricing policy | Beta price and tax treatment | Prices, VAT/tax treatment and beta discount status approved | Draft reference | Paid offers blocked |
| Credit consumption rule | Credit/refund policy | Valid-output rule | Non-consumption and replacement-credit rules approved | Draft only | Paid credits blocked |
| Refund/replacement rule | Credit/refund policy | Refund and replacement procedure | Refund exposure, time limit, approval owner and evidence rules approved | Not approved | Paid credits blocked |
| Production API key policy | Access policy | Key issuance, caps, rotation, revocation | Production key rules approved | Blocked | Production keys blocked |
| Customer limit | Access policy | Beta customer cap | Maximum beta customers or machine accounts approved | Not approved | Customer onboarding blocked |
| Usage caps | Access/cost policy | Daily/monthly usage caps | Score/write/API caps approved | Not approved | Production keys blocked |
| Cost cap | Cost guard policy | Daily/monthly spend caps | Maximum spend and provider/API budgets approved | Not approved | Production keys blocked |
| Kill switch | Cost/security policy | Stop/restart procedure | Kill switch owner and restart procedure approved | Not approved | Production keys blocked |
| Support policy | Support policy | Support states and escalation | Support channel, machine-readable statuses and owner escalation approved | Draft only | Paid onboarding blocked |
| Incident/security policy | Security policy | Secrets/incidents/access control | Secret handling, incident response and access rules approved | Draft only | Production access blocked |
| Distribution channel | Distribution policy | Allowed channels | Private-only, directory, marketplace or MCP path approved | Not approved | External publication blocked |
| External outreach | Distribution/compliance policy | Contact prohibition or approval rule | Explicit decision if any external contact is allowed | Blocked | Outreach blocked |

## Policy Pack Structure Needed

The future policy pack should contain:

1. Owner approval policy.
2. Fiscal/admin policy.
3. Payment and invoice policy.
4. Terms of service draft.
5. Privacy and data policy.
6. Acceptable use policy.
7. Product and listino policy.
8. Credit/refund/replacement policy.
9. Production API key and access policy.
10. Customer and usage cap policy.
11. Cost cap and kill switch policy.
12. Support and escalation policy.
13. Security and incident policy.
14. Distribution and no-outreach policy.

## Machine-Readable Decision Logic

```text
IF all mandatory gates == APPROVED BY OWNER
THEN paid_beta_activation can be reviewed
ELSE paid_beta_activation = NO_GO
```

Even if all gates are approved, activation still requires a final owner go/no-go decision.

## First Practical Gap To Close

The largest current gaps are not technical.

The first gaps to close are:

1. Fiscal/admin policy.
2. Payment and invoice policy.
3. Terms/privacy/data policy.
4. Production API key and usage cap policy.
5. Cost cap and kill switch policy.

## Current Decision

Paid beta preparation: go.

Paid beta activation: no-go.

Commercial go-live: no-go.

Next safe action:

> Draft the policy pack skeleton from this mapping, still no-write and without activating any commercial, data, outreach or publication function.
