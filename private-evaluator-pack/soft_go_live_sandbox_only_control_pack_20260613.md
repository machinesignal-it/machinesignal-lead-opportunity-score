# Soft Go-Live Sandbox-Only Control Pack

Date: 2026-06-13

Status: prepared

Primary customer interface: machine

## What This Authorizes

This pack authorizes only a controlled sandbox soft go-live.

In simple terms: a machine can discover MachineSignal, read the public contracts, create a limited sandbox customer, run synthetic score and purchase-intent tests, retrieve usage/orders and understand what would be bought.

This is not a paid launch.

## What Remains Blocked

- Real payment.
- Paid checkout.
- Payment method collection.
- Invoice issuance.
- Public paid marketplace launch.
- Public MCP registry submission.
- Hosted public MCP launch.
- Production API key distribution.
- Human outreach.
- Automatic external contact.
- Contacting target companies.
- Real customer data.
- Personal data.
- Real lead lists.
- Unbounded write tests.
- Scraping contact data.
- Email campaign execution.

## Allowed Machine Test Paths

### 1. Existing List -> Score Pack

When the customer machine already has domains or company records.

- Goal: prioritize where to spend CRM, campaign or agent budget.
- Product: `score_pack_1k`.
- First call: `POST /v1/lead-opportunity-score`.
- Success: the machine receives score, confidence, commercial strength, spend policy, decision, reason, priority and recommended next product.

Stop if:

- domain is invalid;
- record is duplicate;
- signal is insufficient;
- sandbox key is missing;
- write budget is exceeded.

### 2. No List -> Target Discovery

When the customer machine has no target list.

- Goal: find companies or domains useful for a specific commercial objective, sector and area.
- Product: `target_discovery`.
- First call: `POST /v1/purchase-intent`.
- Required inputs: `market`, `area`, `commercial_objective`.
- Success: the machine receives a target-discovery pre-check or synthetic target list output with a clear next call.

Stop if:

- market is too narrow;
- commercial objective is unclear;
- area is too narrow;
- 250 coherent targets cannot be produced;
- write budget is exceeded.

### 3. Deep Analysis -> Action Pack

When the customer machine has a high-signal scored opportunity.

- Goal: turn a confirmed opportunity into a CRM- or agent-readable action payload.
- First product: `deep_analysis`.
- Second product: `action_pack`.
- First call: `POST /v1/purchase-intent product_code=deep_analysis`.
- Second call: `POST /v1/purchase-intent product_code=action_pack`.
- Required gate: Action Pack is allowed only after Deep Analysis confirms the `action_pack_purchase_gate`.
- Success: the machine receives CRM-ready JSON with approval gate, stop rules, webhook policy, CRM mappings and no automatic external contact.

Stop if:

- Deep Analysis gate is not passed;
- `source_order_intent_id` is missing;
- compliance gate is absent;
- external contact is requested;
- write budget is exceeded.

### 4. MCP Manifest Read Path

When the customer machine is an MCP-aware agent or tool evaluator.

- Goal: read available tool contracts and decide if a local/private MCP adapter can be evaluated.
- First call: `GET /mcp-tool-manifest.json`.
- Allowed tools: `score_lead_opportunity`, `create_purchase_intent`, `create_sandbox_customer`, `get_order`.
- Success: the machine understands tool names, input schemas and that hosted public MCP is not live.

Stop if:

- hosted public MCP is requested;
- registry submission is requested;
- production key is requested;
- real data is requested.

## Write Budget

Default mode: `NoWrite`.

Write-capped mode is allowed only for controlled rehearsals.

Limits:

- max `5` POST calls per controlled rehearsal;
- max `1` sandbox customer per rehearsal;
- max `1` Target Discovery order per rehearsal;
- max `1` Deep Analysis order per rehearsal;
- max `1` Action Pack order per rehearsal;
- idempotency key required;
- stop if Cloudflare KV limit risk or `429` errors appear.

## Success Metrics

The stage is acceptable only if:

- machine readability checks failed: `0`;
- public contract checks failed: `0`;
- end-to-end rehearsal checks failed: `0`;
- agent go/no-go probe checks failed: `0`;
- all core public assets return HTTP `200`;
- all machine paths are understood;
- forbidden actions count: `0`;
- real payments: `0`;
- invoices: `0`;
- external contacts: `0`;
- personal data records used: `0`;
- real customer records used: `0`.

## Rollback Rules

Stop the soft go-live preparation if:

- any core discovery asset returns HTTP `4xx` or `5xx`;
- OpenAPI and MCP manifests diverge;
- sandbox creation can be abused beyond capped limits;
- payment, invoice or external contact flags become true;
- any production key appears in public artifacts;
- real customer data or personal data is detected;
- Cloudflare KV write limits are exceeded;
- a machine cannot identify the correct product for existing-list, no-list or action-pack scenarios.

## Owner Approval Required Before

Your explicit approval is required before:

- enabling real payment;
- collecting payment methods;
- issuing invoices;
- using P.IVA or fiscal identity for sale;
- publishing paid plans;
- submitting to a public MCP registry;
- launching hosted MCP;
- issuing production API keys;
- processing real customer data;
- processing personal data;
- contacting humans or companies;
- running any external publication that cannot be reversed.

## Agent Responsibilities

- Orchestratore: keep the soft go-live inside sandbox-only limits and trigger stop rules.
- Agente API: maintain OpenAPI, MCP manifest, endpoint examples and schema parity.
- Machine-to-Machine Sales Ops: prepare passive machine-readable distribution drafts without submitting them publicly.
- Customer Success & Post-Sale: monitor sandbox usage, order retrieval, delivery clarity and machine support signals.
- Admin & Finance Controller: confirm that no real payment, invoice or paid checkout is enabled.
- Legal & Compliance: confirm that no real data, personal data, external contact or public paid terms are activated.
- Continuous Improvement / Competitive Learning: compare machine comprehension, API clarity and product packaging against public competitor/provider patterns without copying protected material.
- HR / Agent Manager: check whether any missing agent role is needed and keep agent learning evidence-based.

## Next Step

Run the Soft Go-Live Control Pack Probe.

If it passes, the next allowed step is one bounded soft go-live rehearsal against public assets, still sandbox-only.
