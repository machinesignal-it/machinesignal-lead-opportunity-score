# MachineSignal - Terms, Privacy, Admin, Payment And Support Draft Pack - NoWrite - 2026-06-15

## Status

Mode: `NoWrite`.

Commercial status: `not_live`.

Go-live status: `no_go`.

This pack contains internal draft requirements and draft language for future review. It is not a final legal document, not a public policy, not fiscal advice and not permission to start paid beta.

## Hard Stops Still Active

- No real payments.
- No invoices.
- No payment-method collection.
- No production API keys.
- No real customer data processing.
- No personal data processing.
- No external outreach.
- No email sending to external humans.
- No public paid marketplace publication.
- No hosted MCP public launch.
- No MCP registry publication.
- No commercial go-live.

## 1. Terms Of Service Draft Requirements

### Purpose

The terms must explain that MachineSignal provides machine-readable decision-support outputs for automated systems.

The terms must not promise:

- guaranteed customers;
- guaranteed revenue;
- guaranteed accuracy;
- unlimited use;
- legal, fiscal or commercial advice;
- manual lead generation;
- human outreach.

### Draft Positioning Language

MachineSignal provides API-based decision-support signals, scores, discovery outputs and action payloads for automated systems, CRM software, workflow tools and AI agents.

MachineSignal outputs are intended to help automated systems prioritize attention and budget for a declared commercial objective. Outputs are not guarantees of commercial success.

### Draft Beta Limitation Language

During sandbox and readiness phases, the service is not live for commercial use.

Sandbox purchase intents, test payment states, credits, refunds and orders are simulations only. They do not create a real payment obligation, invoice, refund or live customer relationship.

### Draft Usage Restrictions

Users and customer machines must not use the service to:

- submit personal data unless later explicitly permitted by approved policy;
- scrape or enrich individual people for outreach;
- send spam or unlawful communications;
- bypass rate limits;
- attempt to extract secrets or production credentials;
- rely on outputs as the only basis for legal, financial or regulated decisions.

### Draft Machine-First Clause

Customer systems may interact with MachineSignal through public machine-readable documentation, OpenAPI contracts, catalog files, sandbox endpoints and status endpoints.

Human legal responsibility remains with the organization operating or authorizing the customer machine.

## 2. Privacy Policy Draft Requirements

### Current Privacy Position

Current phase: sandbox-public-docs-only and NoWrite readiness.

Current allowed data:

- synthetic records;
- demo-domain tests;
- public non-personal business signals;
- technical logs needed for debugging;
- usage metadata for sandbox simulations.

Current blocked data:

- personal data;
- customer-uploaded real personal data;
- email lists;
- phone/person enrichment;
- contact-person scraping;
- private or confidential customer datasets;
- payment method data.

### Draft Data Minimization Language

MachineSignal should collect only the minimum information necessary to provide machine-readable scoring, discovery, enrichment, usage and support-status outputs.

In the current readiness phase, users should not submit personal data or confidential customer data.

### Draft Output Evidence Language

Where possible, MachineSignal records evidence type and confidence rather than unnecessary personal details.

Examples of evidence type:

- public website signal;
- public search result signal;
- domain availability or domain match;
- category/sector signal;
- unresolved or low-confidence signal.

### Draft Retention Language

Retention rules must be defined before paid beta.

Minimum future retention model:

- sandbox request logs: short retention;
- order/usage records: retained only as needed for audit and support;
- invalid records: kept only as aggregated error categories where possible;
- personal data: not accepted in current phase.

### Draft Privacy Gate

No paid beta can start until privacy language is reviewed against the actual data flow.

## 3. Admin And Fiscal Draft Requirements

### Current Position

Admin/fiscal status: `decision_required`.

No real invoice or payment event is authorized.

### Decisions Required Before Money Moves

The owner must decide:

1. whether and when to open/use the appropriate fiscal structure;
2. how VAT/tax treatment should work;
3. when invoices can be issued;
4. whether beta can accept money before full launch;
5. monthly budget cap for external services;
6. accounting treatment for credits;
7. accounting treatment for failed delivery;
8. accounting treatment for refunds;
9. who reviews legal/fiscal wording;
10. when commercial go-live can be reconsidered.

### Draft Accounting Event Types

Allowed now as simulated records only:

- `sandbox_purchase_intent`;
- `test_payment_authorized`;
- `test_payment_failed`;
- `sandbox_credit_allocated`;
- `sandbox_credit_consumed`;
- `sandbox_credit_reversal`;
- `blocked_requires_owner`.

Blocked now:

- `live_payment_received`;
- `invoice_issued`;
- `real_refund_issued`;
- `payment_method_saved`;
- `production_customer_created`.

## 4. Payment And Billing Test-Mode Draft Requirements

### Current Position

Payment mode: test-mode only.

No live checkout.

No real payment provider activation.

No card, IBAN or payment method collection.

### Test-Mode Lifecycle

| State | Meaning | Allowed now |
|---|---|---:|
| `draft_intent` | Machine selected a product in sandbox. | Yes |
| `test_payment_pending` | Simulated payment is pending. | Yes |
| `test_payment_authorized` | Simulated payment succeeded. | Yes |
| `test_payment_failed` | Simulated payment failed. | Yes |
| `sandbox_fulfillment_ready` | Simulated order can be fulfilled with synthetic/demo input. | Yes |
| `sandbox_fulfilled` | Simulated order was delivered. | Yes |
| `test_credit_reversal` | Simulated credit was restored. | Yes |
| `blocked_requires_owner` | Action would become live/commercial. | Yes |

### Draft Billing Rules

- Credits are consumed only by valid billable outputs.
- Invalid records do not consume score credits.
- Duplicate records do not consume score credits.
- Non-analyzable records do not consume score credits.
- If Target Discovery cannot produce the defined target count, the machine must receive alternatives instead of silent full consumption.
- Deep Analysis and Action Pack should be available only when gate logic says the lead justifies the next spend.

### Payment Gate

Live payments remain blocked until:

- owner approval;
- fiscal path approval;
- legal/privacy review;
- test-mode lifecycle validation;
- refund/credit policy approval;
- cost guard active.

## 5. Support, Refund And Credit Draft Requirements

### Current Position

Support should be machine-readable first.

Human escalation should be reserved for:

- owner approval decisions;
- legal/fiscal questions;
- policy exceptions;
- severe incidents;
- disputed live money after future paid approval.

### Draft Support Statuses

| Status | Meaning |
|---|---|
| `ok` | No known issue. |
| `degraded` | Service works with limitation. |
| `blocked_by_policy` | Requested action is not allowed. |
| `blocked_by_owner_gate` | Owner approval required. |
| `invalid_input` | Input cannot be processed. |
| `credit_review_required` | Output may qualify for simulated credit review. |
| `incident_open` | Operational issue is under review. |
| `resolved` | Issue has been closed. |

### Draft Credit Review Conditions

Credit review can be triggered when:

- a duplicate record consumed credit by mistake;
- an invalid/non-analyzable record consumed credit by mistake;
- an output failed validation;
- a sandbox fulfillment failed after simulated payment authorization;
- a system incident caused unusable output.

### Draft No-Refund Limitation For Current Phase

Since current flows do not move real money, refunds are simulated only.

Future real refunds require:

- approved payment provider;
- fiscal path;
- invoice/credit note handling;
- refund policy;
- owner approval.

## 6. Machine-Readable Readiness Summary

Current readiness after this draft pack:

- Technical sandbox: 97%
- Pre-go-live readiness: 88-90%
- Paid-beta readiness: 60-64%
- Commercial go-live readiness: 72-74%
- Commercial go-live: NO-GO

Why readiness improves:

- terms requirements are clearer;
- privacy boundaries are clearer;
- admin/fiscal blockers are explicit;
- payment lifecycle is defined in test mode;
- support/refund/credit rules are clearer.

Why go-live remains blocked:

- no legal/privacy review;
- no fiscal approval;
- no payment activation;
- no production keys;
- no real support SLA;
- no owner approval for paid beta.

## Recommended Next Step

Run:

`terms_privacy_admin_payment_support_draft_pack_nowrite_probe_20260615`

If the probe passes, the next operational step is:

`owner_review_decision_or_public_docs_alignment_nowrite`

This means the owner can choose whether to:

1. keep everything internal;
2. update public sandbox docs for clarity only;
3. ask for legal/fiscal review;
4. continue technical calibration.

## Final Statement

This pack improves readiness but does not authorize any commercial activation.
