# MachineSignal - Owner Decision Dashboard

Date: 2026-06-18  
Status: owner decision dashboard, no-write, not signed, not activated  
Decision today: continue preparation, do not activate paid beta

## One-Line Status

MachineSignal is technically ready for the current sandbox scope, but not commercially ready to take money.

## Dashboard

| Area | Status | Meaning | Decision |
|---|---|---|---|
| Technical sandbox | Green | Current sandbox scope completed and tested | Continue |
| Advisor gate setup | Green | Fiscal/Admin, Legal/Privacy and Gatekeeper agents exist for preparation/blocking | Continue |
| Machine-readable docs | Green | OpenAPI, catalog, onboarding and Company Brain are aligned | Continue |
| Policy preparation | Yellow | Draft policy sections exist but are not approved | Continue drafting |
| P&L paid-beta delta | Yellow | Small-beta economics modeled, not approved as commercial plan | Review later |
| Owner commercial approval | Red | No signed owner decision to activate beta | Block activation |
| Fiscal/admin path | Yellow | Draft verified by 99 checks, but not owner-approved, not tax advice and no payments/invoices allowed | Continue owner review before payments or invoices |
| Payment/invoice path | Red | Payment mode and fiscal document process not approved | Block live payment |
| Terms/privacy/data | Yellow | Draft verified by 112 checks, but not owner-approved, not final and not implemented | Continue owner review before onboarding or real data |
| Product/listino approval | Red | Score Pack 1k is recommended but not owner-approved for sale | Block paid offers |
| Credit/refund policy | Yellow | Draft verified by 78 checks, but not owner-approved and not implemented | Continue owner review and ledger test before paid credits |
| Production API keys | Red | Key issuance, caps and revocation not approved | Block production keys |
| Cost cap/kill switch | Yellow | Draft verified by 95 checks, but not owner-approved and not implemented | Continue owner review and simulation before production keys |
| Support/escalation | Yellow | Draft verified by 108 checks, but not owner-approved and not implemented | Continue owner review and ticket simulation before paid onboarding |
| Security/incident | Yellow | Draft verified by 130 checks, but not owner-approved, not final and not production-ready | Continue owner review and incident simulation before production access |
| Distribution/no outreach | Yellow | Draft verified by 121 checks, but not owner-approved; no external publication or outreach allowed | Continue owner review before publication or outreach |

## Recommended Decision Today

```text
Continue preparing paid beta materials, but do not activate paid beta.
```

This lets agents continue:

- policy drafting;
- P&L refinement;
- owner decision preparation;
- no-write consistency checks.

It still blocks:

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

## Recommended Defaults If Beta Is Considered Later

| Topic | Recommended Default |
|---|---|
| First product | Score Pack 1k |
| First price | EUR 119 |
| First beta size | 3-5 customers maximum |
| First access model | Manual owner approval only |
| Auto-renewal | No |
| Personal data | Not allowed |
| Real customer data | Blocked until data policy approval |
| Refund model | Replacement credits first |
| Cash refunds | Owner approval only |
| Distribution | Machine-readable docs only |
| Outreach | No human outreach |
| Marketplace | No public marketplace |
| Hosted public MCP | No hosted public MCP |

## Decision Sequence

Recommended order:

1. Confirm whether to continue paid-beta preparation.
2. Resolve payment/invoice path.
3. Resolve payment/invoice path.
4. Resolve terms/privacy/data path.
5. Approve or reject Score Pack 1k at EUR 119.
6. Approve customer, usage and cost caps.
7. Approve production key process.
8. Approve support and escalation.
9. Approve security and incident handling.
10. Decide distribution/no-outreach boundary.
11. Sign final owner approval only if every gate is ready.

## Current Blocked Actions

Do not:

- activate paid beta;
- execute real payment;
- issue invoice;
- collect payment method;
- issue production API key;
- process real customer dataset;
- process personal data;
- send external outreach;
- publish marketplace listing;
- launch hosted public MCP;
- submit MCP registry.

## Practical Interpretation

We are past the pure technical-test stage for the current scope.

We are now in a controlled pre-commercial readiness stage.

The next useful work is not more generic testing. The next useful work is making the owner decision path clear enough that a future yes/no decision is safe.

## Final Decision

Paid beta preparation: go.

Paid beta activation: no-go.

Commercial go-live: no-go.

Next safe action:

> Update Company Brain with this dashboard status and then decide whether to keep drafting policy details or pause for owner review.
