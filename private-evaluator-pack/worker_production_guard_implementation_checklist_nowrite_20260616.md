# Worker Production Guard Implementation Checklist - No-Write

Date: 2026-06-16

Status: implementation checklist only

Code change status: no Worker code changed by this artifact

Primary customer interface: machine

## Purpose

This checklist defines what should be implemented in the Cloudflare Worker before MachineSignal can safely issue production API keys or accept a paid beta machine account.

It does not approve paid beta, production API keys, real payments, invoices, payment method collection, real customer data, personal data, marketplace publication, hosted public MCP, registry submission or outreach.

## Current Decision

```text
TECHNICAL SANDBOX: CLOSED FOR CURRENT SCOPE
WORKER IMPLEMENTATION: CHECKLIST ONLY
PRODUCTION API KEYS: BLOCKED
PAID BETA: NOT APPROVED
COMMERCIAL GO-LIVE: NO-GO
```

## Implementation Principle

The Worker should default to blocked for anything irreversible.

Default safe rule:

```text
If a request implies production access, money, invoices, personal data, real customer data, external outreach or public marketplace activation, return a machine-readable blocked state unless owner approval and all gates are present.
```

## Section A - New Guard Object

Add or centralize a guard object in Worker state/config:

```json
{
  "production_access": {
    "enabled": false,
    "owner_approved": false,
    "production_keys_enabled": false,
    "paid_beta_enabled": false,
    "real_payments_enabled": false,
    "invoices_enabled": false,
    "personal_data_enabled": false,
    "real_customer_data_enabled": false,
    "external_outreach_enabled": false,
    "marketplace_publication_enabled": false,
    "hosted_public_mcp_enabled": false,
    "registry_submission_enabled": false
  }
}
```

Required behavior:

- all values default to `false`;
- any missing value is treated as `false`;
- production access cannot be inferred from sandbox success;
- owner approval must be explicit, not implied.

## Section B - Key Class Detection

Implement a normalized key-class detector:

| Prefix | Key class | Allowed now |
| --- | --- | --- |
| `ms_sbx_` | sandbox_customer_key | yes, with limits |
| `ms_live_` | production_customer_key | no |
| `ms_admin_` | admin_key | restricted internal only |
| `ms_wh_test_` | test_webhook_signature | test only |

Required blocked response for production key use before approval:

```json
{
  "status": "blocked_production_key",
  "support_code": "MS_PRODUCTION_KEY_BLOCKED",
  "owner_escalation_required": true,
  "production_key_active": false,
  "credit_delta": 0,
  "real_payment_executed": false,
  "invoice_issued": false,
  "external_contact_executed": false,
  "next_allowed_actions": ["continue_sandbox", "review_owner_checklist"]
}
```

## Section C - Guarded Actions

Every endpoint or helper that can trigger one of these actions must call the same guard:

| Action | Default state | Required support code |
| --- | --- | --- |
| issue production API key | blocked | `MS_PRODUCTION_KEY_BLOCKED` |
| activate production customer | blocked | `MS_PRODUCTION_ACCESS_BLOCKED` |
| execute live payment | blocked | `MS_PAYMENT_BLOCKED` |
| collect payment method | blocked | `MS_PAYMENT_METHOD_BLOCKED` |
| issue invoice | blocked | `MS_INVOICE_BLOCKED` |
| process real customer data | blocked | `MS_REAL_DATA_BLOCKED` |
| process personal data | blocked | `MS_PERSONAL_DATA_BLOCKED` |
| contact external company/person | blocked | `MS_EXTERNAL_CONTACT_BLOCKED` |
| publish marketplace listing | blocked | `MS_MARKETPLACE_BLOCKED` |
| launch hosted public MCP | blocked | `MS_HOSTED_MCP_BLOCKED` |
| submit MCP registry | blocked | `MS_REGISTRY_BLOCKED` |
| exceed cost cap | blocked | `MS_COST_CAP_BLOCKED` |
| kill switch active | paused | `MS_KILL_SWITCH_ACTIVE` |

## Section D - Cost Cap Fields

Add cost cap fields to customer/account state before production access:

```json
{
  "cost_caps": {
    "per_key_daily_request_cap": null,
    "per_key_monthly_request_cap": null,
    "per_key_credit_cap": null,
    "global_daily_write_cap": null,
    "global_monthly_spend_cap_eur": null,
    "provider_daily_spend_cap_eur": null,
    "cloudflare_kv_daily_write_cap": null,
    "alert_threshold_pct": 80,
    "hard_stop_threshold_pct": 100
  }
}
```

Required behavior:

- if a required cap is `null`, production access remains blocked;
- requests that would exceed the cap return `MS_COST_CAP_BLOCKED`;
- 80% usage returns warning metadata;
- 100% usage blocks the request;
- blocked cost-cap requests must not consume credits.

## Section E - Kill Switch Fields

Add kill switch fields:

```json
{
  "kill_switch": {
    "active": false,
    "reason": null,
    "activated_at": null,
    "activated_by": null,
    "reactivation_requires_owner_review": true
  }
}
```

If active, every risky endpoint returns:

```json
{
  "status": "paused_kill_switch",
  "support_code": "MS_KILL_SWITCH_ACTIVE",
  "severity": "critical",
  "owner_escalation_required": true,
  "production_key_active": false,
  "credit_consumption_enabled": false,
  "credit_delta": 0,
  "real_payment_executed": false,
  "invoice_issued": false,
  "external_contact_executed": false,
  "next_allowed_actions": ["read_status", "wait_for_owner_review"]
}
```

## Section F - Support/Status Code Map

The Worker should expose the same support codes in API responses and docs:

| Support code | Meaning | Credit delta |
| --- | --- | ---: |
| `MS_SUPPORT_OK` | request completed | product-specific |
| `MS_SUPPORT_INVALID_SCHEMA` | input missing/invalid | 0 |
| `MS_SUPPORT_DUPLICATE_REQUEST` | idempotency hit | 0 or previous delta |
| `MS_SUPPORT_INSUFFICIENT_CREDITS` | credits unavailable | 0 |
| `MS_SUPPORT_SANDBOX_LIMIT` | sandbox limit reached | 0 |
| `MS_SUPPORT_OUTPUT_NOT_VALID` | no valid output | 0 |
| `MS_SUPPORT_GATE_FAILED` | product gate failed | 0 |
| `MS_PRODUCTION_KEY_BLOCKED` | production key unavailable | 0 |
| `MS_COST_CAP_BLOCKED` | cap would be exceeded | 0 |
| `MS_PAYMENT_BLOCKED` | payment not approved | 0 |
| `MS_INVOICE_BLOCKED` | invoice not approved | 0 |
| `MS_REAL_DATA_BLOCKED` | real data not approved | 0 |
| `MS_PERSONAL_DATA_BLOCKED` | personal data not approved | 0 |
| `MS_EXTERNAL_CONTACT_BLOCKED` | outreach/contact blocked | 0 |
| `MS_KILL_SWITCH_ACTIVE` | key/account paused | 0 |
| `MS_SUPPORT_OWNER_REVIEW_REQUIRED` | owner decision needed | 0 |
| `MS_SUPPORT_SECURITY_REVIEW_REQUIRED` | security review needed | 0 |

## Section G - Response Contract

Every blocked response should include:

```json
{
  "status": "blocked_policy",
  "support_code": "MS_PAYMENT_BLOCKED",
  "severity": "medium",
  "owner_escalation_required": true,
  "credit_delta": 0,
  "production_key_active": false,
  "real_payment_executed": false,
  "invoice_issued": false,
  "external_contact_executed": false,
  "next_allowed_actions": ["continue_sandbox", "request_owner_review"]
}
```

Required invariants:

- blocked responses never consume new paid credits;
- blocked payment/invoice/contact responses always report `false`;
- production access blocked responses must be machine-readable;
- no blocked response should reveal secrets.

## Section H - Audit Trail

Add audit record for each production-guard decision:

```json
{
  "timestamp": "ISO-8601",
  "customer_id": "redacted_or_internal_id",
  "key_class": "sandbox_customer_key",
  "product_code": "score_pack_1k",
  "request_id": "request_id",
  "decision": "blocked",
  "support_code": "MS_COST_CAP_BLOCKED",
  "credit_delta": 0,
  "cost_estimate": 0,
  "cap_state": "blocked",
  "owner_escalation_required": false,
  "redacted_reason": "daily cap reached"
}
```

Forbidden in audit:

- full API key;
- password;
- payment card data;
- full personal payload;
- real customer datasets;
- secrets from provider logs.

## Section I - Endpoint Impact Map

Endpoints likely requiring guard review before production:

| Endpoint family | Required guard |
| --- | --- |
| `/v1/sandbox/*` | sandbox limits, no real payment, no outreach |
| `/v1/score` | key class, credits, cost cap, no personal data |
| `/v1/purchase-intent` | product gate, credits, payment blocked, cost cap |
| `/v1/payment-test/*` | test-only payment mode, no fiscal invoice |
| `/v1/orders*` | key class, customer scope, redacted output |
| `/v1/usage` | key class, customer scope, no secret leakage |
| `/v1/admin/*` | admin key only, redacted audit |
| public docs endpoints | no secrets, no claim paid beta is live |

## Section J - Test Checklist Before Code Patch

Before implementation:

- confirm all support codes are final enough;
- confirm owner wants code changes now;
- confirm no live payment code will be added;
- confirm no real production key will be created;
- confirm tests remain synthetic/sandbox only.

After implementation, tests should verify:

- production key is blocked by default;
- payment is blocked by default;
- invoice is blocked by default;
- personal data is blocked by default;
- external contact is blocked by default;
- cost cap block returns `MS_COST_CAP_BLOCKED`;
- kill switch returns `MS_KILL_SWITCH_ACTIVE`;
- blocked actions consume no credit;
- audit records are redacted;
- sandbox path still works.

## Current Recommendation

Do not patch the Worker yet until this checklist is validated.

Next safe step:

```text
Run a no-write checklist probe. If it passes, prepare a small Worker patch plan for production guard constants and blocked response helpers.
```
