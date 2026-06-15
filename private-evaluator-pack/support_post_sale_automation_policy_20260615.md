# MachineSignal Support / Post-Sale Automation Policy

Date: 2026-06-15

## Purpose

Define how MachineSignal handles support and post-sale operations in a machine-first way, without creating daily manual workload for the owner.

This is a test/pre-beta policy. It does not approve paid beta, real payments, invoices, real customer data, production API keys or commercial go-live.

## Current Decision

**Support for sandbox/test: allowed**

**Support for paid customers: not live**

**Commercial go-live: no-go**

## Machine-First Support Principle

The default support customer is a machine:

- CRM;
- AI agent;
- workflow automation;
- API client;
- RevOps tool;
- integration script.

The support system should answer with structured machine-readable states first, not human email threads.

## Support Surfaces

| Need | Surface | Status |
|---|---|---|
| Check API health | `GET /health` | live |
| Read public docs | `/openapi.json`, `/machine-onboarding.json`, `/product-catalog.json`, `/llms.txt` | live |
| Check authenticated onboarding | `GET /v1/onboarding` | sandbox/auth only |
| Check usage and credits | `GET /v1/usage` | sandbox/auth only |
| List order intents/deliveries | `GET /v1/orders` | sandbox/auth only |
| Read one order | `GET /v1/orders/{order_intent_id}` | sandbox/auth only |
| Check payment-test state | `/v1/payment-test/*` | test mode only |
| Admin metrics/audit | `/v1/admin/*` | admin only |

## Standard Support States

| State | Meaning | Owner Action |
|---|---|---|
| `ok` | System is available | none |
| `blocked_policy` | Request is not allowed by current policy | none unless repeated |
| `blocked_sandbox_limit` | Sandbox daily limit reached | none, wait for reset |
| `blocked_insufficient_credits` | No usable credits remain | none during test |
| `duplicate_request` | Idempotency key reused | none |
| `output_not_valid` | No valid output, no credit consumed | none |
| `gate_failed` | Deep Analysis or Action Pack gate blocked | none |
| `needs_owner_review` | Legal/fiscal/payment/security decision required | owner review |
| `security_review_required` | Key/payload/security issue | owner review |

## What Agents Can Resolve Automatically

Agents can resolve without owner involvement:

- explain API health and status;
- explain missing or invalid fields;
- explain duplicate requests;
- explain insufficient sandbox credits;
- explain why a gate failed;
- explain that `429 sandbox_limit_exceeded` means wait until reset;
- confirm that no real payment, invoice or external contact happened;
- summarize usage and orders from API responses;
- close low-risk duplicate support cases;
- produce a daily support summary.

## What Must Escalate To Owner

Escalate only when needed:

- request to enable paid beta;
- request to collect payment method;
- request to issue invoice;
- request to use real or personal data;
- suspected API key exposure;
- production API key request;
- legal/privacy/DPA/SLA approval request;
- request to contact external people or companies;
- marketplace/registry/hosted MCP publication request;
- repeated system failure after two retry-safe checks.

## Anti-Accumulation Rule

Owner should not receive an endless queue.

Rules:

- maximum owner escalation items per day: 3;
- low-risk duplicate cases: auto-close;
- sandbox limit cases: auto-close with retry-after guidance;
- invalid schema cases: auto-reply with required fields;
- gate failure cases: auto-reply with blocked reason and next valid action;
- after 24 hours without owner response, only safe/no-write work continues;
- if critical escalations exceed 5/day, stop operational expansion and create one consolidated incident note.

## Machine-Readable Support Response Contract

Every support outcome should contain:

```json
{
  "status": "blocked_policy",
  "support_code": "MS_SUPPORT_POLICY_BLOCKED",
  "severity": "low",
  "owner_escalation_required": false,
  "credit_delta": 0,
  "real_payment_executed": false,
  "invoice_issued": false,
  "external_contact_executed": false,
  "next_allowed_actions": [
    "read_docs",
    "retry_with_synthetic_data",
    "wait_for_sandbox_reset"
  ]
}
```

## Support Codes

| Code | Meaning | Escalation |
|---|---|---|
| `MS_SUPPORT_OK` | Request completed or status retrieved | no |
| `MS_SUPPORT_INVALID_SCHEMA` | Required fields missing or invalid | no |
| `MS_SUPPORT_DUPLICATE_REQUEST` | Idempotency prevented duplicate spend | no |
| `MS_SUPPORT_INSUFFICIENT_CREDITS` | Credit balance insufficient | no during sandbox |
| `MS_SUPPORT_SANDBOX_LIMIT` | Sandbox daily limit reached | no |
| `MS_SUPPORT_OUTPUT_NOT_VALID` | No usable output, no credit consumed | no |
| `MS_SUPPORT_GATE_FAILED` | Required product gate not satisfied | no |
| `MS_SUPPORT_POLICY_BLOCKED` | Action blocked by policy | maybe |
| `MS_SUPPORT_OWNER_REVIEW_REQUIRED` | Owner decision needed | yes |
| `MS_SUPPORT_SECURITY_REVIEW_REQUIRED` | Key/security issue | yes |

## Data Handling

Allowed to store:

- support_case_id;
- request_id;
- customer_id or sandbox id;
- product_code;
- support_code;
- redacted error body;
- credit_delta;
- owner_escalation_required;
- timestamp.

Forbidden to store:

- full API key;
- password;
- payment card data;
- full personal payload;
- personal emails/phones from payloads;
- real customer datasets;
- secrets copied from logs.

## Readiness Assessment

| Area | Readiness | Status |
|---|---:|---|
| Sandbox support automation | 88% | ready for test |
| Machine-readable status/usage/orders | 90% | ready for test |
| Anti-accumulation workflow | 82% | ready for test |
| Paid customer support | 58% | not live |
| Legal/fiscal/payment escalation | 55% | draft only |

## Recommendation

Support/post-sale automation is ready for continued sandbox testing.

It is not ready for paid customer support until legal, fiscal, payment and production-key gates are approved.

Next step: verify public/API documentation exposes the support surfaces and blocked states without claiming paid customer support is live.
