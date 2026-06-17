# MachineSignal - Controlled Paid Beta Policy Pack

Date: 2026-06-17
Status: draft policy pack, not legal approval, not activated

## Purpose

This pack translates the paid beta readiness package into operational policies.

It does not activate paid beta, real payments, invoices, production API keys, real customer data, personal data, outreach, marketplace publication, hosted MCP or registry publication.

These policies are drafts for owner, fiscal and legal review.

## Policy 1 - Beta Terms Draft

### Scope

The beta is a controlled machine-first test of MachineSignal.

The intended users are systems such as CRM, AI agents, workflow tools, API clients and internal software.

The beta is not a promise of final product availability, final pricing, uptime SLA or guaranteed commercial result.

### Allowed During Beta Preparation

- Sandbox API tests.
- Synthetic or non-personal test payloads.
- Machine-readable discovery and documentation review.
- Controlled scoring and product-flow validation.
- Internal reporting by agents.

### Not Allowed Until Explicit Approval

- Real payments.
- Payment method collection.
- Invoices.
- Production API keys.
- Real customer datasets.
- Personal data.
- External outreach or email campaigns.
- Public marketplace listing.
- Hosted public MCP.
- MCP registry submission.

### Owner Approval Required

The beta can move from preparation to activation only after owner approval of:

- fiscal/admin setup;
- legal/privacy setup;
- payment method;
- data policy;
- support policy;
- refund and credit policy;
- cost caps;
- production key policy.

## Policy 2 - Credit And Refund Policy Draft

### Principle

Credits are consumed only when MachineSignal produces a valid and usable output.

If the system cannot produce a valid output, the credit is not consumed or must be restored.

### Valid Output Rules

A credit can be consumed when:

- the request is accepted by policy;
- required fields are present;
- input is processable;
- output matches the purchased product;
- output includes the expected decision or structured result;
- output is traceable with a request or order id.

### No-Credit-Consumption Rules

No credit should be consumed when:

- the request is duplicate;
- the payload is invalid;
- the product gate blocks the request;
- the system cannot analyze the input;
- the output is incomplete;
- the result is a no-go coverage decision for a discovery pack;
- real or personal data is detected during sandbox-only mode;
- the request is blocked by production access policy.

### Replacement Rule

If a paid beta customer receives an invalid output, the replacement should be:

- same product;
- same quantity;
- no extra charge;
- tracked with the original request id;
- issued only after automated validation confirms the output was invalid.

### Refund Rule

Refunds are not active yet.

Before paid beta, the owner must decide:

- whether refunds are allowed;
- whether refunds are cash refunds or credit replacements;
- who approves refunds;
- time limit for refund requests;
- maximum refund exposure per customer.

## Policy 3 - Data Handling Policy Draft

### Default Rule

During the current phase, MachineSignal must operate with synthetic, test, public-business or non-personal data only.

Personal data is not allowed.

Real customer datasets are blocked until owner, legal and privacy approval.

### Allowed Data During Sandbox

- example domains;
- synthetic companies;
- non-personal business categories;
- test payloads;
- generated request ids;
- product codes;
- technical status codes;
- redacted error details.

### Forbidden Data During Sandbox

- personal emails;
- personal phone numbers;
- personal names as lead records;
- payment card data;
- passwords;
- API secrets;
- full customer datasets;
- confidential client lists;
- sensitive personal data.

### Storage Rule

Store only what is needed to prove technical behavior:

- request id;
- product code;
- support code;
- credit delta;
- sandbox customer id;
- timestamp;
- redacted result summary.

Do not store raw payloads containing real or personal data.

### Deletion Rule

Before paid beta, define:

- retention period;
- deletion request process;
- backup deletion policy;
- audit log retention;
- who can approve deletion.

## Policy 4 - Production API Key Policy Summary

Production API keys remain blocked.

Before issuing a production key:

- owner approval required;
- fiscal/admin gate required;
- legal/privacy gate required;
- payment/billing gate required;
- support gate required;
- cost guard gate required;
- customer-specific cap required;
- revocation rule required.

Public examples may show only placeholders such as `{{machinesignal_api_key}}`.

## Policy 5 - Support Policy Summary

Support remains machine-first.

The system should answer with structured support states, not human-heavy email threads.

Agents can resolve:

- invalid schema;
- duplicate request;
- sandbox limit;
- insufficient sandbox credits;
- output-not-valid;
- gate failed;
- policy blocked.

Owner escalation is required for:

- paid beta activation;
- payment or invoice request;
- production API key request;
- real or personal data request;
- legal/privacy/DPA/SLA request;
- suspected secret exposure;
- marketplace or hosted MCP publication.

## Policy 6 - Cost Cap And Kill Switch Policy Summary

During beta preparation:

- no live payment flows;
- no unknown paid external API calls;
- no repeated write-heavy tests after limits;
- stop if Cloudflare/KV/Worker limits are exceeded;
- stop if real payment, invoice, payment method collection or real data is attempted.

Before paid beta activation, owner must approve:

- daily spend cap;
- daily write cap;
- external API budget;
- maximum customer exposure;
- kill switch owner;
- restart procedure after stop.

## Current Decision

Paid beta preparation: allowed.

Paid beta activation: blocked.

Commercial go-live: blocked.

Real payments: blocked.

Production API keys: blocked.

Real and personal data: blocked.

External outreach: blocked.

Public marketplace or hosted MCP: blocked.

## Recommended Next Step

Create an owner approval checklist that maps each policy to a final approval field.

The checklist should be the final gate before any future paid beta activation.
