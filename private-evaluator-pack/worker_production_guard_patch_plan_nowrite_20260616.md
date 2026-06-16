# Worker Production Guard Patch Plan - No-Write

Date: 2026-06-16

Status: patch plan only

Code change status: no Worker code changed by this artifact

Primary customer interface: machine

## Purpose

This plan defines the smallest safe Worker patch needed to add production guard constants, blocked response helpers, kill switch response contract and tests.

It does not patch the Worker.

It does not deploy anything.

It does not approve paid beta, production API keys, real payments, invoices, payment method collection, real customer data, personal data, marketplace publication, hosted public MCP, registry submission or outreach.

## Current Code Finding

Relevant files:

| File | Role | Patch impact |
| --- | --- | --- |
| `api_endpoint_minimal/core.mjs` | Main API logic, OpenAPI docs, request handling and product logic | primary patch target |
| `api_endpoint_minimal/test_api.mjs` | Main local API regression tests | primary test target |
| `api_endpoint_minimal/test_durable_ledger.mjs` | Durable ledger tests | likely no patch needed |
| `api_endpoint_minimal/cloudflare_worker.mjs` | Thin Cloudflare wrapper around `handleRequest` | no patch expected |

## Patch Scope

Recommended first patch scope:

```text
Add constants and helper responses only.
Do not enable production access.
Do not create real production keys.
Do not add live payment or invoice logic.
Do not call external providers.
```

This keeps the patch low risk and testable.

## Proposed Code Additions In `core.mjs`

### 1. Production guard defaults

Add a frozen object near top-level constants:

```js
const DEFAULT_PRODUCTION_ACCESS_GUARD = Object.freeze({
  enabled: false,
  owner_approved: false,
  production_keys_enabled: false,
  paid_beta_enabled: false,
  real_payments_enabled: false,
  invoices_enabled: false,
  personal_data_enabled: false,
  real_customer_data_enabled: false,
  external_outreach_enabled: false,
  marketplace_publication_enabled: false,
  hosted_public_mcp_enabled: false,
  registry_submission_enabled: false
});
```

### 2. Support code constants

Add a frozen map:

```js
const SUPPORT_CODES = Object.freeze({
  OK: "MS_SUPPORT_OK",
  INVALID_SCHEMA: "MS_SUPPORT_INVALID_SCHEMA",
  DUPLICATE_REQUEST: "MS_SUPPORT_DUPLICATE_REQUEST",
  INSUFFICIENT_CREDITS: "MS_SUPPORT_INSUFFICIENT_CREDITS",
  SANDBOX_LIMIT: "MS_SUPPORT_SANDBOX_LIMIT",
  OUTPUT_NOT_VALID: "MS_SUPPORT_OUTPUT_NOT_VALID",
  GATE_FAILED: "MS_SUPPORT_GATE_FAILED",
  PRODUCTION_KEY_BLOCKED: "MS_PRODUCTION_KEY_BLOCKED",
  PRODUCTION_ACCESS_BLOCKED: "MS_PRODUCTION_ACCESS_BLOCKED",
  COST_CAP_BLOCKED: "MS_COST_CAP_BLOCKED",
  PAYMENT_BLOCKED: "MS_PAYMENT_BLOCKED",
  PAYMENT_METHOD_BLOCKED: "MS_PAYMENT_METHOD_BLOCKED",
  INVOICE_BLOCKED: "MS_INVOICE_BLOCKED",
  REAL_DATA_BLOCKED: "MS_REAL_DATA_BLOCKED",
  PERSONAL_DATA_BLOCKED: "MS_PERSONAL_DATA_BLOCKED",
  EXTERNAL_CONTACT_BLOCKED: "MS_EXTERNAL_CONTACT_BLOCKED",
  MARKETPLACE_BLOCKED: "MS_MARKETPLACE_BLOCKED",
  HOSTED_MCP_BLOCKED: "MS_HOSTED_MCP_BLOCKED",
  REGISTRY_BLOCKED: "MS_REGISTRY_BLOCKED",
  KILL_SWITCH_ACTIVE: "MS_KILL_SWITCH_ACTIVE",
  OWNER_REVIEW_REQUIRED: "MS_SUPPORT_OWNER_REVIEW_REQUIRED",
  SECURITY_REVIEW_REQUIRED: "MS_SUPPORT_SECURITY_REVIEW_REQUIRED"
});
```

### 3. Key class detector

Add helper:

```js
function classifyApiKey(apiKey = "") {
  if (apiKey.startsWith("ms_sbx_")) return "sandbox_customer_key";
  if (apiKey.startsWith("ms_live_")) return "production_customer_key";
  if (apiKey.startsWith("ms_admin_")) return "admin_key";
  if (apiKey.startsWith("ms_wh_test_")) return "test_webhook_signature";
  return "unknown";
}
```

### 4. Blocked response helper

Add helper:

```js
function buildBlockedGuardResponse({
  status = "blocked_policy",
  support_code,
  severity = "medium",
  owner_escalation_required = false,
  next_allowed_actions = ["continue_sandbox", "request_owner_review"]
}) {
  return {
    status,
    support_code,
    severity,
    owner_escalation_required,
    credit_delta: 0,
    production_key_active: false,
    credit_consumption_enabled: false,
    real_payment_executed: false,
    invoice_issued: false,
    external_contact_executed: false,
    next_allowed_actions
  };
}
```

### 5. Production key blocked helper

Add helper:

```js
function buildProductionKeyBlockedResponse() {
  return buildBlockedGuardResponse({
    status: "blocked_production_key",
    support_code: SUPPORT_CODES.PRODUCTION_KEY_BLOCKED,
    owner_escalation_required: true,
    next_allowed_actions: ["continue_sandbox", "review_owner_checklist"]
  });
}
```

### 6. Kill switch response helper

Add helper:

```js
function buildKillSwitchResponse() {
  return buildBlockedGuardResponse({
    status: "paused_kill_switch",
    support_code: SUPPORT_CODES.KILL_SWITCH_ACTIVE,
    severity: "critical",
    owner_escalation_required: true,
    next_allowed_actions: ["read_status", "wait_for_owner_review"]
  });
}
```

### 7. Optional internal export for tests

If current test style supports it, export a test-only object:

```js
export const productionGuardInternals = {
  DEFAULT_PRODUCTION_ACCESS_GUARD,
  SUPPORT_CODES,
  classifyApiKey,
  buildBlockedGuardResponse,
  buildProductionKeyBlockedResponse,
  buildKillSwitchResponse
};
```

If the project avoids internals export, test via public endpoints only. The internals export is simpler but should not leak secrets because it contains only constants and pure helpers.

## Proposed Test Additions In `test_api.mjs`

Add tests that verify:

1. All production guard defaults are `false`.
2. `classifyApiKey("ms_sbx_example")` returns `sandbox_customer_key`.
3. `classifyApiKey("ms_live_example")` returns `production_customer_key`.
4. Production key blocked response includes:
   - `status: "blocked_production_key"`;
   - `support_code: "MS_PRODUCTION_KEY_BLOCKED"`;
   - `credit_delta: 0`;
   - `production_key_active: false`;
   - `real_payment_executed: false`;
   - `invoice_issued: false`;
   - `external_contact_executed: false`.
5. Kill switch response includes:
   - `status: "paused_kill_switch"`;
   - `support_code: "MS_KILL_SWITCH_ACTIVE"`;
   - `severity: "critical"`;
   - `owner_escalation_required: true`;
   - `credit_delta: 0`.
6. No existing sandbox journey regresses.
7. No payment-test endpoint starts reporting real payment or invoice execution.

## Suggested Public Contract Addition

Only after helper tests pass, add documentation to OpenAPI schemas:

- `GuardedBlockedResponse`;
- `ProductionKeyBlockedResponse`;
- `KillSwitchResponse`;
- support code enum.

This can be a second patch if we want to keep the first patch smaller.

## Risk Assessment

Low risk if we add constants/helpers and tests only.

Medium risk if we wire helpers into endpoints immediately.

High risk if we change auth, ledger writes, payment-test flow or admin endpoints in the same patch.

Recommended sequence:

1. Add constants/helpers/tests.
2. Run local tests.
3. Commit.
4. Later wire into selected endpoints one family at a time.

## Explicitly Out Of Scope

Do not include in this patch:

- live payment code;
- invoice generation;
- real production key generation;
- provider calls;
- real customer data processing;
- personal data processing;
- marketplace publication;
- hosted public MCP launch;
- registry submission;
- external outreach automation;
- Cloudflare deploy.

## Validation Before Patch

Before applying the code patch, verify this plan includes:

- production guard defaults;
- support codes;
- key classification;
- blocked response helper;
- production key block response;
- kill switch response;
- tests;
- no deploy;
- no live commercial activation.

## Recommended Next Step

Run the patch-plan probe.

If it passes, apply the small constants/helpers/tests patch locally and run:

```text
node api_endpoint_minimal/test_api.mjs
node api_endpoint_minimal/test_durable_ledger.mjs
```
