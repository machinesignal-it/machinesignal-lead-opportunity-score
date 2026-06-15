# MachineSignal - Paid-Beta Readiness Pack NoWrite - 2026-06-15

## Status

Prepared for internal owner review.

Commercial status: `not_live`.

Go-live status: `no_go`.

This pack prepares the paid-beta readiness phase. It does not approve paid beta and does not authorize commercial launch.

## Non-Negotiable Guardrails

The following actions remain blocked:

- real payments;
- invoices;
- collection of payment methods;
- production API keys;
- real customer data processing;
- personal data processing;
- external outreach;
- email sending to external humans;
- public paid marketplace publication;
- hosted MCP public launch;
- MCP registry publication;
- commercial go-live.

## Purpose

The purpose of paid-beta readiness is to make MachineSignal ready for a future owner decision.

The system should be able to simulate and document the full commercial lifecycle without moving money, collecting cards, issuing invoices or onboarding live customers.

The intended future beta remains machine-first:

- the customer machine reads catalog, OpenAPI and onboarding files;
- the customer machine sees products, prices, gates and credit rules;
- the customer machine creates purchase intents in sandbox/test mode;
- MachineSignal returns order status, usage status, support path and next recommended product;
- the human owner only supervises exceptions, policy decisions and commercial authorization.

## Readiness Workstream 1 - Legal And Privacy Draft Requirements

Draft documents needed before paid beta can be approved:

1. Terms of service draft.
2. Privacy policy draft.
3. Acceptable use policy draft.
4. Data retention policy draft.
5. Refund and credit policy draft.
6. Beta disclaimer.

Minimum language these drafts must include:

- MachineSignal provides decision-support signals, not guaranteed business results.
- Outputs are based on available public signals and declared commercial objectives.
- During sandbox and preparation, no real payment is accepted.
- During sandbox and preparation, no payment method is collected.
- During sandbox and preparation, no live customer data is required.
- Personal data should not be submitted unless a later approved policy explicitly allows it.
- Outputs can be wrong, incomplete or stale and must be treated as machine decision support.
- Usage can be rate-limited, blocked, refunded as credits or revoked for abuse.

Legal status:

`draft_required_not_final`.

Owner action later:

Have legal/privacy language reviewed before any public paid beta.

## Readiness Workstream 2 - Admin And Fiscal Requirements

Admin/fiscal items needed before money can move:

1. Owner decision on fiscal structure.
2. VAT/tax treatment check.
3. Invoice flow definition.
4. Accounting treatment for credits.
5. Accounting treatment for refunds.
6. Accounting treatment for failed delivery.
7. Monthly operating cost budget.
8. Maximum daily external API spend.
9. Cloudflare cost threshold.
10. DataForSEO spend threshold.

Current admin/fiscal status:

`decision_required`.

Hard rule:

No real invoice or payment event can happen before the owner approves the fiscal path.

## Readiness Workstream 3 - Test-Mode Payment And Order Lifecycle

Allowed now:

- define test-mode order states;
- simulate payment success;
- simulate payment failure;
- simulate refund as credit;
- simulate credit exhaustion;
- simulate failed delivery;
- reconcile usage with order records.

Still blocked:

- live checkout;
- card collection;
- bank transfer collection;
- live payment provider activation;
- invoices;
- real refunds.

Recommended order states:

| State | Meaning | Live money? |
|---|---|---:|
| `draft_intent` | Machine has selected a product in sandbox. | No |
| `test_payment_pending` | Simulated payment step is pending. | No |
| `test_payment_authorized` | Simulated payment succeeded. | No |
| `sandbox_fulfillment_ready` | Output can be generated with synthetic/demo data. | No |
| `sandbox_fulfilled` | Output delivered in sandbox. | No |
| `test_refund_credit_issued` | Credit simulated for invalid output. | No |
| `blocked_requires_owner` | Action would cross a live/commercial boundary. | No |

Pass condition:

The whole lifecycle can be tested without moving money.

## Readiness Workstream 4 - Production API Key Policy

Existing draft:

`private-evaluator-pack/production_api_key_policy_draft_20260613.md`

Current status:

`policy_drafted_live_key_blocked`.

Production keys remain blocked until:

- owner approval;
- admin/fiscal gate;
- legal gate;
- privacy/data gate;
- payment/billing gate;
- support gate;
- cost guard gate.

Required before production keys:

- sandbox key prefix;
- production key prefix;
- admin key restriction;
- rotation policy;
- revocation policy;
- usage caps;
- abuse controls;
- secret scan;
- support path for blocked/revoked keys.

## Readiness Workstream 5 - Product, Pricing And Valid Output Rules

The beta catalog must remain exact.

Avoid vague language such as:

- "up to";
- "best effort" without a remedy;
- "unlimited";
- "guaranteed clients";
- "guaranteed revenue".

Required product rules:

### Target Discovery Pack 250

Price includes exactly:

- market availability pre-check;
- commercial objective normalization;
- opportunity hypothesis;
- 250 normalized and deduplicated coherent targets if the market is available;
- domain when available;
- category;
- area;
- initial opportunity signals;
- reason for inclusion;
- JSON or CSV export.

If 250 coherent targets are not available, the pack must not silently consume full value. The machine must receive alternatives:

- Mini Discovery;
- wider area;
- broader criteria;
- changed commercial objective.

### Score Pack 1k

Price includes exactly:

- 1,000 valid scores;
- list cleaning;
- deduplication;
- exclusion of invalid or non-analyzable records;
- score;
- confidence;
- commercial strength;
- spend policy;
- allowed next products;
- operational decision;
- short reason;
- priority;
- recommended next purchase.

Duplicate, invalid or non-analyzable records do not consume score credits.

### Domain Enrichment Pack 100

Price includes exactly:

- 100 target records processed;
- public-source lookup;
- domain when verified;
- confidence level;
- evidence source type;
- unresolved reason when no reliable domain is found.

### Deep Analysis Pack

Price includes exactly:

- deeper machine-readable analysis for leads that passed the score gate;
- risk and opportunity signals;
- recommended next action;
- evidence summary;
- confidence and limitations.

Deep Analysis should not be offered for leads below gate threshold unless the spend policy explicitly allows a manual override.

### Action Pack

Price includes exactly:

- CRM-ready action payload;
- next step;
- priority;
- message angle;
- follow-up category;
- reason code;
- do-not-contact or risk flag if applicable.

Action Pack should only be offered when the score and confidence justify an operational next step.

## Readiness Workstream 6 - Support, Refund And Credit Policy

Support should be machine-readable first.

Required support states:

| State | Meaning |
|---|---|
| `ok` | No known issue. |
| `degraded` | Service works but with limitation. |
| `blocked_by_policy` | Requested action is not allowed. |
| `blocked_by_owner_gate` | Owner approval required. |
| `invalid_input` | Input cannot be processed. |
| `credit_review_required` | Output may qualify for credit review. |
| `incident_open` | Operational issue under review. |

Credit/refund principles:

- In sandbox, only simulated credits exist.
- Invalid or duplicate inputs should not consume credits.
- Failed valid-output delivery should create a credit review state.
- Refunds before paid beta are simulated only.
- Real refunds require payment architecture and fiscal readiness.

Beta SLA draft:

- support is best-effort during controlled beta;
- status endpoint is preferred over email;
- incidents are categorized by severity;
- no financial remedy is promised until payment terms are approved.

## Readiness Workstream 7 - Data Quality And Compliance

Allowed now:

- synthetic data;
- demo-domain tests;
- public non-personal business signals;
- NoWrite public observations;
- internal reports.

Blocked now:

- personal data;
- customer-uploaded real personal data;
- scraping contact persons for outreach;
- email lists;
- phone/person enrichment;
- unverified private data.

Data quality rules:

- never invent a domain;
- mark unresolved records;
- separate "not found" from "low confidence";
- deduplicate before scoring;
- do not charge credits for duplicate invalid records;
- store evidence type, not unnecessary personal details.

## Readiness Workstream 8 - Commercial Automation Without Outreach

Allowed now:

- machine-readable onboarding;
- purchase-intent simulation;
- budget cap design;
- next-product recommendation;
- catalog clarity;
- status/usage/order endpoints;
- commercial decision rules.

Blocked now:

- external email;
- human outreach;
- prospect contact;
- public paid listing;
- hosted MCP public launch;
- marketplace paid publication.

Machine-first commercial flow:

1. Machine discovers `llms.txt`.
2. Machine reads catalog and OpenAPI.
3. Machine selects scenario: has list, no list or wants next action.
4. Machine creates sandbox purchase intent.
5. Machine receives status, usage and allowed next products.
6. Machine hits a blocker if an action would cross into live commercial mode.

## Readiness Workstream 9 - Cost And Abuse Controls

Required controls before paid beta:

- daily Cloudflare KV write cap;
- daily Cloudflare KV read awareness;
- DataForSEO test spend cap;
- per-key score cap;
- per-key purchase-intent cap;
- retry/backoff policy;
- kill switch;
- suspicious usage detection;
- owner alert threshold;
- incident log.

Cost rule:

No beta test should be able to create uncontrolled external cost.

## Readiness Workstream 10 - Owner Approval Matrix

| Action | Current state | Owner approval needed? |
|---|---|---:|
| Prepare internal readiness pack | Allowed | No |
| Run NoWrite readiness probe | Allowed | No |
| Simulate payment lifecycle | Allowed in test mode | No |
| Collect payment method | Blocked | Yes |
| Accept real payment | Blocked | Yes |
| Issue invoice | Blocked | Yes |
| Process real customer data | Blocked | Yes |
| Publish marketplace paid listing | Blocked | Yes |
| Launch hosted MCP public endpoint | Blocked | Yes |
| Start paid beta | Blocked | Yes |

## Readiness Impact

Estimated after this pack:

- Technical sandbox: 97%
- Pre-go-live readiness: 87-89%
- Commercial go-live readiness: 71-73%
- Paid beta readiness: 55-60%
- Commercial go-live: NO-GO

Why commercial readiness remains low:

- no fiscal path approved;
- no legal/privacy review completed;
- no live payment architecture approved;
- no production key issuance approved;
- no support SLA approved;
- no public paid distribution approved.

## Recommended Next Step

Run:

`paid_beta_readiness_pack_nowrite_probe_20260615`

The probe should verify:

- all hard stops are preserved;
- all mandatory gates are present;
- commercial status remains `not_live`;
- go-live remains `no_go`;
- no live payment language is accidentally introduced;
- no production key issuance is authorized;
- next step remains owner-controlled.

## Final Statement

MachineSignal is now better prepared for a future paid-beta decision, but this pack does not authorize any commercial activation.
