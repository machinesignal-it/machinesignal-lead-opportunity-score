# MachineSignal - Paid-Beta Readiness Checklist - 2026-06-15

## Scope

This document prepares the next phase after technical sandbox closure.

It does not approve paid beta, does not activate payments, does not issue invoices, does not collect payment methods, does not process real customer data, does not process personal data, does not perform outreach and does not publish to public marketplaces, hosted MCP channels or registries.

## Current Starting Point

- Technical sandbox tests: 97%
- Pre-go-live readiness: 84-86%
- Commercial go-live readiness: 69%
- Commercial go-live: NO-GO
- Paid beta: not approved

The product is technically understandable by machines, but not yet commercially activated.

## Paid-Beta Readiness Goal

Prepare the system so that the owner can later decide whether to run a controlled paid beta.

The paid beta should remain:

- limited;
- measurable;
- reversible;
- budget-capped;
- compliant before money is collected;
- machine-first, with minimal human workload.

## Mandatory Gates Before Any Paid Beta

### 1. Owner Decision Gate

Required decision:

`approve_paid_beta_readiness_preparation`

This only approves preparation work. It does not approve real charging.

Still blocked:

- real payment collection;
- invoice issuance;
- payment-method collection;
- public paid marketplace publication;
- production customer onboarding.

### 2. Legal And Privacy Gate

Required outputs:

- draft terms of service;
- draft privacy policy aligned with actual data use;
- cookie/privacy review for public site;
- clear statement that beta outputs are decision-support signals, not guaranteed business results;
- acceptable use policy;
- refund/credit policy draft;
- data retention policy;
- disclaimer for synthetic/demo testing versus real customer data.

Pass condition:

Legal and privacy language is reviewed before any real customer or payment flow is activated.

### 3. Admin And Fiscal Gate

Required outputs:

- owner decision on fiscal structure;
- invoice flow definition;
- VAT/tax treatment check;
- accounting record policy for credits, refunds and failed delivery;
- maximum monthly cost budget;
- decision on whether payments can be accepted before full commercial go-live.

Pass condition:

No real invoice or payment event can happen until the owner confirms the fiscal path.

### 4. Payment Architecture Gate

Required outputs:

- test-mode payment architecture only;
- no real card collection;
- no live checkout;
- payment success/failure simulation;
- order state model;
- refund/credit state model;
- usage-to-order reconciliation.

Pass condition:

The system can simulate the full payment/order lifecycle without moving money.

### 5. Production Key And Access Gate

Required outputs:

- API key policy;
- sandbox key versus production key distinction;
- rate limits;
- credit limits;
- abuse controls;
- key revocation policy;
- usage ledger consistency checks;
- support path for blocked keys.

Pass condition:

No production key is issued until legal, admin, fiscal and support gates are ready.

### 6. Product And Pricing Gate

Required outputs:

- final beta catalog version;
- exact listino with no "up to" language;
- definition of valid output for each product;
- definition of non-billable records;
- minimum deliverable rule for Target Discovery;
- credit consumption rule for Score Pack 1k;
- Deep Analysis gate rule;
- Action Pack gate rule;
- refund/credit handling rule.

Pass condition:

A machine can understand what is sold, what is included, when credits are consumed and what happens if output is invalid.

### 7. Support And Post-Sale Gate

Required outputs:

- machine-readable support/status endpoint;
- incident categories;
- SLA draft for beta;
- escalation rules;
- refund/credit request handling;
- order status states;
- usage status states;
- customer-facing support copy.

Pass condition:

A machine can check status, usage, orders and support path without human back-and-forth as the default route.

### 8. Data Quality And Compliance Gate

Required outputs:

- real-data policy;
- personal-data exclusion policy;
- public-source evidence rule;
- deduplication rule;
- invalid/non-analyzable record rule;
- audit trail rule;
- source confidence labels.

Pass condition:

The beta can run without uncontrolled personal data processing or invented data.

### 9. Commercial Automation Gate

Required outputs:

- machine-first onboarding flow;
- product selection rules;
- purchase-intent flow;
- budget cap logic;
- recommended next product logic;
- commercial status endpoint;
- no-human outreach rule unless separately approved.

Pass condition:

The commercial flow can be discovered and tested by software, but external outreach remains blocked.

### 10. Cost And Abuse Gate

Required outputs:

- Cloudflare KV write/read budget;
- DataForSEO test budget;
- daily write cap;
- per-key usage cap;
- alert threshold;
- kill switch;
- retry/backoff policy;
- abuse scenario checklist.

Pass condition:

The beta cannot accidentally create runaway costs or uncontrolled write volume.

## Readiness Score Model

| Area | Current status | Readiness target before paid beta |
|---|---:|---:|
| Technical sandbox | 97% | 100% closure decision |
| Public machine discovery | Pass | Pass |
| API/product contract | Strong | Final beta catalog |
| Legal/privacy | Draft needed | Reviewed |
| Admin/fiscal | Decision needed | Owner-approved path |
| Payment architecture | Sandbox only | Test-mode lifecycle only |
| Production access | Blocked | Policy ready, issuance blocked |
| Support/post-sale | Sandbox pass | Beta SLA/policy ready |
| Cost/abuse controls | Partial | Budget caps and kill switch |
| Commercial go-live | 69% NO-GO | Still no-go until explicit approval |

## Recommended Next Step

Recommended next operational step:

`prepare_paid_beta_readiness_pack_nowrite`

This means:

- create draft terms/privacy/admin/payment/support requirements;
- update product catalog only if needed for clarity;
- run NoWrite validation;
- do not activate payment;
- do not collect payment methods;
- do not contact external humans;
- do not publish to public paid channels.

## Owner Decision Needed Later

After the readiness pack is prepared, the owner must decide one of:

1. continue sandbox only;
2. prepare limited paid beta in test mode;
3. stop before paid beta and do more calibration;
4. start legal/fiscal setup before any commercial move.

## Final Guardrail

This checklist is preparation only. It does not authorize paid beta, commercial go-live, real payments, invoices, payment-method collection, real-data processing, personal-data processing, external outreach, public marketplace publication, hosted MCP public launch or MCP registry publication.
