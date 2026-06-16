# MachineSignal Production Access Control Pack

Date: 2026-06-16

Status: draft / no live activation

Company name: MachineSignal, operational name only. Final legal entity/name to be confirmed.

Primary customer interface: machine

## Purpose

This pack defines the control rules required before MachineSignal can issue any production API key or allow a paid beta customer/machine account.

It combines:

- production API key policy;
- cost caps;
- kill switch;
- support/status alignment.

It does not approve paid beta, commercial go-live, real payments, invoices, payment method collection, real customer data, personal data, marketplace publication, hosted public MCP, registry submission or outreach.

## Current Decision

```text
TECHNICAL SANDBOX: CLOSED FOR CURRENT SCOPE
PRODUCTION API KEYS: BLOCKED
PAID BETA: NOT APPROVED
COMMERCIAL GO-LIVE: NO-GO
```

## Plain Summary

The API can be tested.

It must not yet be opened to real paying customers.

Before any production key is issued, the system needs:

- exact key classes;
- owner approval rules;
- hard usage limits;
- hard cost caps;
- automatic stop rules;
- revocation process;
- support/status response states;
- audit trail;
- no-real-data and no-payment guardrails.

## Section A - API Key Classes

| Key class | Prefix | Current status | Use |
| --- | --- | --- | --- |
| Sandbox customer key | `ms_sbx_` | allowed with limits | synthetic/test usage only |
| Production customer key | `ms_live_` | blocked | future paid beta only after owner approval |
| Admin key | `ms_admin_` | internal restricted | operational/admin use only |
| Test webhook signature | `ms_wh_test_` | test only | simulated payment/order events |

## Section B - Production Key Issuance Rule

A production API key cannot be issued until all gates are approved:

- owner paid-beta approval;
- fiscal/admin path;
- invoice/receipt path;
- payment provider decision;
- terms/privacy/data review;
- refund/credit policy;
- support/SLA policy;
- cost cap policy;
- kill switch owner;
- production key storage/rotation/revocation process.

If any gate is missing, the correct machine-readable state is:

```json
{
  "status": "blocked_policy",
  "support_code": "MS_PRODUCTION_KEY_BLOCKED",
  "owner_escalation_required": true,
  "production_key_issued": false,
  "next_allowed_actions": ["continue_sandbox", "review_owner_checklist"]
}
```

## Section C - Default Beta Access Limits

If a future paid beta is explicitly approved, the first production key should start with the smallest viable limits:

| Limit | Proposed first-beta value | Notes |
| --- | ---: | --- |
| Customers/machine accounts | 1 | first controlled account only |
| Products enabled | 1 | recommended first product: Score Pack 1k |
| Monthly spend cap | owner to approve | must be set before activation |
| Daily API write cap | owner to approve | must be set before activation |
| Daily provider spend cap | owner to approve | must be set before activation |
| Score credits | product-specific | no unlimited usage |
| Deep Analysis credits | disabled first | enable later only after approval |
| Action Pack credits | disabled first | requires Deep Analysis gate |
| Auto-renewal | disabled | no automatic recurring billing in first beta |
| Personal data | disabled | blocked unless explicitly approved |
| External outreach | disabled | blocked |

## Section D - Cost Cap Rules

Cost caps must be enforced before any production key is active.

Required caps:

- per-key daily request cap;
- per-key monthly request cap;
- per-key credit cap;
- global daily write cap;
- global monthly spend cap;
- provider-specific spend cap;
- Cloudflare/KV write cap;
- alert threshold;
- hard stop threshold.

Recommended initial policy:

| Signal | Level | Action |
| --- | --- | --- |
| Any live payment attempted before approval | red | stop and block |
| Any invoice attempted before approval | red | stop and block |
| Any production key request before gates pass | red | block issuance |
| Any personal data detected | red | block processing and do not store payload |
| Any external outreach requested | red | block |
| Unknown paid provider call | red | block unless owner approved budget |
| Cost estimate exceeds cap | red | block request |
| Repeated 429 / provider limit | yellow/red | pause write-heavy operations |
| Usage exceeds 80% of cap | yellow | warn and reduce writes |
| Usage reaches 100% of cap | red | hard stop |

## Section E - Kill Switch

The kill switch must stop risk without waiting for a manual debugging session.

Minimum kill switch actions:

- pause production key;
- stop credit consumption;
- block purchase-intent;
- block live payment flow;
- block invoice flow;
- block provider calls;
- block writes that increase cost;
- preserve audit trail;
- return machine-readable support/status response;
- require owner review before reactivation.

Machine-readable kill switch response:

```json
{
  "status": "paused",
  "support_code": "MS_KILL_SWITCH_ACTIVE",
  "severity": "critical",
  "owner_escalation_required": true,
  "production_key_active": false,
  "credit_consumption_enabled": false,
  "real_payment_executed": false,
  "invoice_issued": false,
  "external_contact_executed": false,
  "next_allowed_actions": ["read_status", "wait_for_owner_review"]
}
```

## Section F - Revocation And Rotation

Production keys, when allowed later, must support:

- immediate revocation;
- scheduled rotation;
- customer-requested rotation;
- compromise response;
- owner-level pause;
- audit trail;
- redacted logs only.

Mandatory revocation triggers:

- key appears in public repository;
- key appears in screenshot or document;
- unexpected usage spike;
- cost cap red event;
- customer request;
- suspected abuse;
- personal data detected in unapproved flow;
- payment/fiscal/legal gate violation.

## Section G - Support/Status Alignment

The support/status layer must expose clear states for machines.

Required states:

| State | Meaning | Owner escalation |
| --- | --- | --- |
| `ok` | system available | no |
| `blocked_policy` | action not allowed | maybe |
| `blocked_production_key` | production key cannot be issued | yes |
| `blocked_cost_cap` | request would exceed budget | maybe |
| `blocked_real_data` | real/personal data not allowed | yes if repeated |
| `blocked_payment` | payment flow not approved | yes |
| `blocked_invoice` | invoice flow not approved | yes |
| `paused_kill_switch` | access paused by kill switch | yes |
| `security_review_required` | key/security concern | yes |
| `needs_owner_review` | owner decision required | yes |

Required response fields:

```json
{
  "status": "blocked_cost_cap",
  "support_code": "MS_COST_CAP_BLOCKED",
  "severity": "medium",
  "owner_escalation_required": false,
  "credit_delta": 0,
  "production_key_active": false,
  "real_payment_executed": false,
  "invoice_issued": false,
  "external_contact_executed": false,
  "next_allowed_actions": ["reduce_scope", "wait_for_cap_reset", "request_owner_review"]
}
```

## Section H - Audit Trail

Every production-access decision must produce an audit record.

Minimum fields:

- timestamp;
- customer_id;
- key_class;
- product_code;
- request_id;
- decision;
- support_code;
- credit_delta;
- cost_estimate;
- cap_state;
- owner_escalation_required;
- redacted reason;
- no full API key;
- no password;
- no payment card data;
- no full personal payload.

## Section I - Public Documentation Rule

Public docs may show:

- key prefixes;
- placeholder API key examples;
- authentication scheme;
- sandbox flow;
- blocked production-key state;
- support/status codes.

Public docs must not show:

- real production keys;
- admin keys;
- payment provider secrets;
- real customer data;
- private support logs;
- owner credentials.

## Section J - Readiness Decision

Current readiness:

```text
Production key policy: draft
Cost caps: draft
Kill switch: draft
Support/status alignment: draft
Paid beta: not approved
Commercial go-live: no-go
```

## Recommended Next Step

Create a no-write implementation checklist for the worker:

```text
production-access guard fields + kill-switch response contract + support/status code map
```

This should remain no-write first. Only after the contract is checked should the worker implementation be patched.
