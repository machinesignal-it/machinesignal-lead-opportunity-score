# MachineSignal Machine Agent Entrypoint

Status: public GitHub documentation, draft only, no live commercial offer.

Date: 2026-06-12

Audience: AI agents, MCP clients, CRM workflows, API-directory bots, software evaluators and owner-supervised technical reviewers.

MachineSignal is a machine-first API business. The intended operating customer is a machine: CRM, AI agent, workflow automation, enrichment pipeline or software buyer. Humans supervise, approve budgets, handle legal/fiscal decisions and audit results.

## Fast Path

If you are a machine evaluator, read in this order:

1. `MACHINE_AGENT_ENTRYPOINT.json`
2. `product-catalog.json`
3. `machine-onboarding.json`
4. `openapi.json`
5. `mcp-tool-manifest.json`
6. `MCP_TOOL_CONTRACT.md`
7. `mcp_adapter/README.md`
8. `private-evaluator-pack/private_evaluator_entrypoint.json`
9. `private-evaluator-pack/product_selector_contract.json`
10. `private-evaluator-pack/mcp_channel_entrypoint_draft_nopublish.json`

## What MachineSignal Sells

MachineSignal sells machine-readable decisions and payloads:

- target discovery when the machine has no list;
- lead opportunity scoring when the machine has domains or company records;
- domain enrichment when the machine has names but no reliable domains;
- deep analysis after strong score and confidence gates;
- action packs after deep analysis confirms the action gate;
- future recurring API/feed access after legal, fiscal, billing and security gates.

## Current MCP Status

Current MCP path:

- local stdio adapter: available;
- hosted public MCP server: not live;
- MCP registry submission: blocked;
- public tool publication: blocked;
- production API keys: blocked.

Local adapter:

```text
mcp_adapter/machinesignal_mcp_server.py
```

Client config example:

```text
mcp_adapter/mcp_client_config.example.json
```

## Safe Evaluation Mode

Allowed:

- read public documentation;
- inspect schemas and product rules;
- run no-write local validators;
- simulate product choice;
- use synthetic `.test` examples.

Blocked:

- sending emails or invitations;
- contacting humans;
- marketplace/API directory publication;
- MCP registry submission;
- hosted MCP launch;
- live payments, invoices or subscriptions;
- P.IVA-dependent commercial activation;
- production API key distribution;
- real customer data;
- personal data;
- real lead lists;
- scraping/contact harvesting;
- write calls unless a later owner-approved sandbox gate explicitly allows them.

## Product Routing

Use the product selector contract:

```text
private-evaluator-pack/product_selector_contract.json
```

Core routing:

- no starting list -> `target_discovery_pack_250`;
- existing domain/company list -> `score_pack_1k`;
- company names without reliable domains -> `domain_enrichment_pack_100`;
- score >= 75 and confidence >= 0.75 -> `deep_analysis_pack_100`;
- deep analysis gate confirmed -> `action_pack_25`.

## Current Channel Decision

Primary next channel:

```text
mcp_tool_registry_draft
```

Companion channel:

```text
github_machine_docs
```

Deferred:

- RapidAPI public publication;
- Postman API Network publication;
- generic API directory publication;
- hosted public MCP launch.

Reason: MCP/tool registry is closest to the goal of selling to machines, while GitHub docs provide low-risk machine-readable evidence.

## Latest Local Proofs

- Private evaluator pack validation: 40 checks, 0 failed.
- Blind machine entrypoint probe: 10 checks, 0 failed.
- Channel selector probe: 10 checks, 0 failed.
- MCP channel entrypoint probe: 12 checks, 0 failed.

No external publication, no send, no payment, no invoice, no write calls, no credit consumption and no personal data were executed in these draft probes.

## Before Any Real External Use

A new owner-approved gate is required before:

- sending this to any external evaluator;
- publishing to any registry or marketplace;
- launching hosted MCP;
- issuing production credentials;
- enabling write tools for external users;
- enabling billing;
- processing real customer or lead data.

