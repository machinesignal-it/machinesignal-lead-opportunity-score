# MachineSignal - Compact Owner Review Packet

Date: 2026-06-18  
Status: compact owner-review packet, no-write, not signed, not activated  
Decision today: prepare paid beta only, keep activation blocked

## Purpose

This packet lists the unresolved owner decisions required before a controlled paid beta can even be considered.

It does not approve paid beta.

It does not activate payments, invoices, payment method collection, production API keys, real customer data, personal data, external outreach, marketplace publication, hosted public MCP or MCP registry submission.

## Current Summary

Technical sandbox: complete for current scope.  
Advisor gate: complete for current scope.  
Policy preparation: in progress.  
Paid beta activation: no-go.  
Commercial go-live: no-go.

## Owner Decisions Still Open

### 1. Do We Prepare A Controlled Paid Beta?

Recommended answer today:

```text
Yes, prepare. No, do not activate.
```

Decision needed:

- continue sandbox only;
- prepare controlled paid beta;
- pause monetization preparation.

Why it matters:

This determines whether agents keep working on policy/P&L/beta readiness or go back to product-only tests.

Current block:

```text
paid_beta_activation = no_go
```

### 2. Fiscal/Admin Setup

Decision needed:

- Is a P.IVA/company/fiscal setup required before taking money?
- Who issues invoices or receipts?
- How are refunds and replacement credits recorded?
- Who owns cost and revenue tracking?

Recommended next action:

Prepare fiscal/admin questions for external or official review when the owner decides to move toward real monetization.

Current block:

```text
payments_and_invoices_blocked
```

### 3. Payment And Invoice Path

Decision needed:

- no payment;
- manual invoice;
- prepaid credits;
- checkout;
- subscription.

Recommended starting model if approved later:

```text
manual approval + Score Pack 1k + no auto-renewal
```

Current block:

```text
live_payment_blocked
```

### 4. Terms / Privacy / Data

Decision needed:

- Are real company/domain lists allowed later?
- Is personal data always forbidden?
- How long are input/output records retained?
- What is the deletion/export process?
- What disclaimers must be shown before beta use?

Recommended starting rule:

```text
synthetic or non-personal business data only
```

Current block:

```text
real_and_personal_data_blocked
```

### 5. Product And Listino

Decision needed:

- Is Score Pack 1k the first paid-beta product?
- Is EUR 119 the accepted beta price?
- Is VAT/tax included or excluded?
- Are replacement credits the default remedy for invalid output?
- Are Target Discovery, Deep Analysis and Action Pack deferred until after first beta proof?

Recommended starting product:

```text
Score Pack 1k at EUR 119 for 1,000 valid scores
```

Current block:

```text
paid_offers_blocked
```

### 6. Credit / Refund / Replacement

Decision needed:

- What counts as a valid output?
- When is credit not consumed?
- When are replacement credits issued?
- Are cash refunds allowed?
- Who approves refunds?

Recommended starting rule:

```text
replacement credits first; cash refunds only by explicit owner approval
```

Current block:

```text
paid_credits_blocked
```

### 7. Production API Keys

Decision needed:

- Who can receive a production key?
- Who approves each key?
- What are the usage limits?
- How are keys revoked?
- How are keys rotated after suspected exposure?

Recommended starting rule:

```text
manual owner approval only
```

Current block:

```text
production_keys_blocked
```

### 8. Beta Customer And Usage Caps

Decision needed:

- Maximum beta customers?
- Maximum monthly scores?
- Maximum daily writes?
- Maximum API calls?
- What happens when cap is reached?

Recommended first cap:

```text
3-5 beta customers, Score Pack 1k only, no auto-renewal
```

Current block:

```text
production_keys_blocked
```

### 9. Cost Cap And Kill Switch

Decision needed:

- Maximum monthly beta cost?
- Maximum daily cost?
- Cloudflare/Worker/KV cap?
- External API/data provider cap?
- Who can stop the beta?
- Who can restart it?

Recommended starting rule:

```text
no paid beta without approved cost cap and kill switch owner
```

Current block:

```text
production_keys_blocked
```

### 10. Support And Escalation

Decision needed:

- What support channel is allowed?
- What should be handled by machine-readable status?
- Which events escalate to the owner?
- What is the maximum daily owner workload?

Recommended starting rule:

```text
machine-first support; owner escalation only for payment, data, legal, production key, security or publication decisions
```

Current block:

```text
paid_onboarding_blocked
```

### 11. Security And Incident Handling

Decision needed:

- Where are secrets stored?
- What happens if a key is exposed?
- Who revokes keys?
- What is logged?
- When is a customer notified?

Recommended starting rule:

```text
no production key until revoke, rotation and incident procedure are approved
```

Current block:

```text
production_access_blocked
```

### 12. Distribution And No Outreach

Decision needed:

- Private/direct docs only?
- Public API directory later?
- Postman public workspace later?
- Marketplace later?
- Hosted public MCP later?
- Is any external outreach ever allowed?

Recommended starting rule:

```text
machine-readable docs only; no human outreach; no marketplace; no hosted public MCP
```

Current block:

```text
external_publication_and_outreach_blocked
```

## Recommended Owner Sequence

Recommended sequence for the owner:

1. Decide whether to keep preparing paid beta or remain sandbox-only.
2. Resolve fiscal/admin path.
3. Resolve payment/invoice path.
4. Resolve terms/privacy/data path.
5. Approve or reject Score Pack 1k as first paid-beta product.
6. Approve production key and usage caps.
7. Approve cost cap and kill switch.
8. Approve support/escalation model.
9. Decide distribution/no-outreach boundaries.
10. Sign final owner approval only if all gates are ready.

## Minimal Decision Needed Today

The only decision needed now is:

```text
Continue preparing paid beta materials, but do not activate paid beta.
```

If accepted, agents can continue drafting policy details and P&L refinements.

## Current Final Decision

Paid beta preparation: go.

Paid beta activation: no-go.

Commercial go-live: no-go.

Next safe action:

> Prepare an owner decision dashboard summarizing open gates, recommended defaults and what remains blocked.
