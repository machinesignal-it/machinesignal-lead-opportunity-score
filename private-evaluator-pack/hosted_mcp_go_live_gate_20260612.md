# Hosted MCP Go-Live Gate

Date: 2026-06-12

Status: gate defined, not passed.

Primary customer interface: machine.

## Decision

This is not a build plan and not a publication plan.

It is the control gate that must be passed before MachineSignal can do any of the following:

- launch a hosted public MCP endpoint;
- submit to an MCP/tool registry;
- expose write-enabled public MCP tools;
- distribute production keys;
- enable live billing;
- process real customer data;
- process personal data.

Current decision:

```text
Hosted MCP launch allowed: no
Registry submission allowed: no
Live billing allowed: no
Production key distribution allowed: no
Real data processing allowed: no
```

## Why This Exists

The agent review concluded:

```text
GO for private MCP v2 review and local adapter.
NO-GO for hosted MCP, registry submission or live monetization now.
```

The local stdio adapter is useful now because it lets machines test the concept without creating a public hosted attack surface.

Hosted MCP is different. It creates new obligations around authorization, scopes, rate limits, audit logs, privacy, billing, invoices, support and abuse prevention.

## Official Sources Checked

- MCP specification 2025-11-25: `https://modelcontextprotocol.io/specification/2025-11-25`
- MCP authorization: `https://modelcontextprotocol.io/docs/tutorials/security/authorization`
- MCP security best practices: `https://modelcontextprotocol.io/docs/tutorials/security/security_best_practices`
- MCP tools: `https://modelcontextprotocol.io/specification/2025-11-25/server/tools`
- MCP schema reference: `https://modelcontextprotocol.io/specification/2025-11-25/schema`
- EDPB legal basis: `https://www.edpb.europa.eu/sme-data-protection-guide/process-personal-data-lawfully_en`
- EDPB data subject rights: `https://www.edpb.europa.eu/sme-data-protection-guide/respect-individuals-rights_en`
- EDPB secure personal data: `https://www.edpb.europa.eu/sme-data-protection-guide/secure-personal-data_en`
- EU VAT invoicing: `https://taxation-customs.ec.europa.eu/taxation/vat/vat-businesses/invoicing_en`
- EU VAT for businesses: `https://taxation-customs.ec.europa.eu/taxation/vat/vat-businesses_en`

## Gates

### G0 Owner Strategy And Scope

Purpose:

Decide what hosted MCP is allowed to do before anything is built.

Must define:

- read-only hosted MCP scope;
- write-enabled hosted MCP scope;
- admin-only scope;
- customer type;
- countries served;
- data categories;
- monetization mode;
- support model;
- kill switch.

Pass criteria:

- owner approves hosted MCP architecture scope;
- public claims remain sandbox-bounded until all gates pass.

### G1 MCP Protocol And Conformance

Purpose:

Prove the hosted endpoint follows current MCP expectations.

Required evidence:

- MCP conformance smoke report;
- MCP Inspector or equivalent test run;
- tool schema parity report against `mcp-tool-manifest.json`;
- negative/error test report.

Pass criteria:

- all public tools have stable names, descriptions and schemas;
- tool errors are returned as structured tool results;
- no admin tool is exposed publicly;
- no write tool is exposed without write scope.

### G2 Authorization, Scopes And Revocation

Purpose:

Protect sensitive tools and customer data with scoped authorization.

Required evidence:

- authorization design;
- scope matrix;
- revocation test;
- least-privilege test;
- credential storage review.

Pass criteria:

- read-only, write-enabled and admin scopes are separated;
- revoked credentials stop working;
- production keys are never logged or returned in full;
- admin tools are unreachable from customer scopes.

### G3 Tool Safety And User Consent

Purpose:

Prevent unintended tool execution by machines or users.

Required evidence:

- tool safety matrix;
- dry-run examples;
- idempotency tests;
- write confirmation tests;
- spend cap tests.

Pass criteria:

- write tools cannot run without explicit scope and idempotency key;
- payment and invoice tools remain disabled until fiscal gate passes;
- Action Pack does not send email or execute outreach;
- dangerous tools are labeled and blocked by default.

### G4 Abuse, Rate Limit And Cost Controls

Purpose:

Avoid runaway usage, provider limits, cost spikes and automated abuse.

Required evidence:

- load test;
- rate-limit test;
- daily write budget test;
- cost forecast;
- abuse simulation.

Pass criteria:

- over-limit requests fail safely;
- write usage cannot exceed approved budget;
- customer-facing errors are structured;
- kill switch can stop writes.

### G5 Observability, Audit And Incident Response

Purpose:

Make hosted MCP debuggable and auditable before real customers use it.

Required evidence:

- observability dashboard;
- audit event sample;
- incident runbook;
- redaction test;
- ledger reconciliation test.

Pass criteria:

- each protected tool call has an audit record;
- logs redact secrets and personal data;
- incident runbook exists;
- usage ledger reconciles with credits and orders.

### G6 Data Protection And Privacy

Purpose:

Block personal data and real customer data until privacy controls are defined.

Required evidence:

- data protection pack;
- privacy notice draft;
- DPA draft;
- retention matrix;
- DSAR workflow;
- real-data no-go checklist.

Pass criteria:

- real customer data remains blocked until owner/legal approval;
- personal data remains blocked until lawful basis and rights workflow are approved;
- logs and telemetry do not contain personal data by default;
- data minimization is documented.

### G7 Fiscal, Legal And Live Billing

Purpose:

Avoid accidental commercial or fiscal activation before the business is ready.

Required evidence:

- fiscal advisor approval;
- billing design;
- test-mode payment reconciliation;
- invoice workflow;
- terms approval.

Pass criteria:

- live billing is explicitly approved;
- invoice workflow is defined;
- VAT treatment is defined;
- payment provider is in live-ready compliant mode;
- terms are published before checkout.

### G8 Product, API Schema And Quality

Purpose:

Make the product reliable enough for machines to buy and consume.

Required evidence:

- OpenAPI-to-tool schema diff;
- contract tests;
- credit ledger tests;
- negative input tests;
- batch/volume test;
- product fulfillment sample set.

Pass criteria:

- tools and OpenAPI agree;
- invalid or duplicate records do not consume valid credits;
- all product outputs are machine-readable;
- errors are stable and actionable.

### G9 Registry, Distribution And Claims

Purpose:

Ensure public registry or marketplace descriptions do not overclaim readiness.

Required evidence:

- registry submission draft;
- claim review;
- security review;
- owner approval;
- rollback plan.

Pass criteria:

- listing says hosted MCP only if it is live and passed gates;
- billing claims match fiscal gate;
- write tools are not advertised without scopes and policies;
- owner approves exact public copy.

## Next Step

Recommended next step:

```text
architecture_spike_no_build
```

Meaning:

Create a hosted MCP architecture design and threat model based on these gates.

Do not implement, publish, submit, bill, issue production keys or process real data yet.
