# MCP Tool Registry Private Draft Pack v2

Date: 2026-06-12

Status: private draft only, not submitted, not published.

Primary customer interface: machine.

## Purpose

This pack prepares MachineSignal for a future MCP/tool-registry review while keeping the product inside a safe private-draft boundary.

It is designed for machines, registry reviewers and technical partners that need to understand:

- what the tool does;
- which customer is intended, meaning machines rather than humans;
- which tools are read-only;
- which tools are write-capable but blocked in this draft;
- why hosted public MCP is not live yet;
- which gates must pass before any registry submission or live monetization.

## Current Position

MachineSignal is now publicly clearer on GitHub:

- description: `Machine-first lead opportunity scoring API for CRMs, AI agents, MCP clients and workflows. Sandbox-only beta: no outreach or live billing.`
- homepage: `https://machinesignal.it/machine-discovery/`
- topics: `machine-first`, `machine-readable`, `lead-scoring`, `opportunity-scoring`, `ai-agents`, `mcp`, `openapi`, `sandbox-beta`.

The MCP channel remains private draft only.

## Listing Draft

Name:

```text
MachineSignal Lead Opportunity Score
```

Short description:

```text
Machine-first lead opportunity scoring, target discovery and action-pack decision tool for CRMs, AI agents, MCP clients and automated workflows.
```

Long description:

```text
MachineSignal helps customer machines decide which companies or domains deserve commercial attention. It exposes machine-readable products for target discovery, lead opportunity scoring, domain enrichment, deep analysis and CRM/workflow action packs. The current channel is sandbox/private-draft only: local stdio adapter available, hosted public MCP not live, registry submission blocked, live billing disabled, production keys blocked, no external contact, no human outreach and no real customer or personal data processing.
```

## Transport Strategy

Current transport:

```text
local_stdio_adapter
```

Current adapter:

```text
mcp_adapter/machinesignal_mcp_server.py
```

Client config example:

```text
mcp_adapter/mcp_client_config.example.json
```

Hosted public MCP:

```text
not live
```

Why not hosted yet:

- authorization and revocation must be designed;
- rate limits and abuse controls must be added;
- read-only and write-enabled scopes must be separated;
- production key policy must be approved;
- cost limits and logs must be validated;
- real customer and personal-data policy must be approved.

## Products Mapped To Tools

| Machine state | Product | Tool/call | Value |
|---|---|---|---|
| No starting list | `target_discovery_pack_250` | `create_purchase_intent` with `product_code=target_discovery` | Finds bounded targets or returns no-go coverage. |
| Existing domains or company records | `score_pack_1k` | `score_lead_opportunity` | Returns score, confidence, decision and next product. |
| Company names without domains | `domain_enrichment_pack_100` | `create_purchase_intent` with `product_code=domain_enrichment` | Resolves domains before scoring. |
| High score and confidence | `deep_analysis_pack_100` | `create_purchase_intent` with `product_code=deep_analysis` | Adds evidence before more budget is spent. |
| Deep analysis gate confirmed | `action_pack_25` | `create_purchase_intent` with `product_code=action_pack` | Produces CRM/workflow payloads and stop rules. |

## Tool Groups

Allowed for private draft review:

- public read-only discovery tools;
- local adapter documentation;
- no-credit validator;
- GitHub machine docs;
- OpenAPI and product selector review.

Blocked in this draft review:

- sandbox customer creation;
- scoring calls;
- purchase-intent calls;
- payment-test calls;
- hosted MCP launch;
- public registry submission;
- live billing;
- production keys;
- outreach;
- real customer data;
- personal data;
- real lead lists.

## Registry Review Answers

Is this a hosted public MCP server?

No. Current mode is local stdio adapter only.

Can a machine test without talking to a human?

Yes, through sandbox/private beta flows and public read-only docs. This draft review itself performs no sandbox writes.

Can this listing take payments?

No. Live billing, subscriptions, invoices and production keys are blocked.

Does Action Pack send emails or contact targets?

No. It produces payloads and approval gates. It does not send emails or execute external contact.

Does this process personal data or real customer data now?

No. This private draft uses synthetic or public documentation only.

## Go / No-Go

Go now:

- private registry draft review;
- local adapter documentation;
- no-credit validator;
- GitHub machine docs;
- read-only public manifest discovery.

No-go now:

- public registry submission;
- hosted public MCP launch;
- live monetization;
- real payment;
- invoices;
- production API keys;
- automatic outreach;
- external target contact;
- personal data;
- real customer data;
- real lead lists.

## Official MCP Context

Checked on 2026-06-12:

- stable spec basis: MCP 2025-11-25;
- tools are the right conceptual model for exposing external system actions;
- authorization is required before sensitive or remote production access;
- a 2026-07-28 release candidate exists and should be monitored, but it is not used as a go-live basis yet.

Sources:

- `https://modelcontextprotocol.io/specification/2025-11-25`
- `https://modelcontextprotocol.io/specification/draft/server/tools`
- `https://modelcontextprotocol.io/docs/tutorials/security/authorization`
- `https://blog.modelcontextprotocol.io/posts/2026-07-28-release-candidate/`

## Machine Decision

Decision:

```text
ready_for_private_mcp_tool_registry_review_only
```

Recommended next step:

```text
Run the v2 NoPublish/NoWrite probe. If it passes, keep this as the current private registry-ready draft. Do not submit externally until an owner-approved go-live gate is completed.
```
