# Hosted MCP Architecture Spike

Date: 2026-06-12

Status: architecture spike only. No build. No deploy. No publication.

Primary customer interface: machine.

## Decision

Hosted MCP should not be built or launched yet.

The correct next step is to define the architecture and threat model, then keep using the current local MCP adapter and passive machine-readable discovery until the go-live gates pass.

Current allowed work:

- architecture review;
- threat model;
- scope matrix;
- no-build probe;
- local adapter validation;
- private draft documentation.

Current blocked work:

- hosted MCP deployment;
- public MCP registry submission;
- write-enabled public MCP tools;
- live billing;
- real payments;
- invoices;
- production customer keys;
- automatic outreach;
- external target contact;
- real customer data;
- personal data;
- real lead lists.

## Why

The business goal is still clear: sell to machines, not to humans.

But hosted MCP is a different risk class from the local adapter. It creates an internet-facing tool server. A customer machine could call tools, consume credits, create purchase intents, retrieve deliveries and trigger state changes.

So the hosted MCP version must be designed as a controlled, authenticated, logged and rate-limited machine interface.

## Official Sources Checked

- MCP specification 2025-11-25: `https://modelcontextprotocol.io/specification/2025-11-25`
- MCP authorization specification: `https://modelcontextprotocol.io/specification/2025-11-25/basic/authorization`
- MCP tools specification: `https://modelcontextprotocol.io/specification/2025-11-25/server/tools`
- MCP security best practices: `https://modelcontextprotocol.io/docs/tutorials/security/security_best_practices`
- Cloudflare Durable Objects overview: `https://developers.cloudflare.com/durable-objects/`
- Cloudflare Durable Objects storage: `https://developers.cloudflare.com/durable-objects/best-practices/access-durable-objects-storage/`
- Cloudflare Workers KV limits: `https://developers.cloudflare.com/kv/platform/limits/`
- EDPB legal basis guide: `https://www.edpb.europa.eu/sme-data-protection-guide/process-personal-data-lawfully_en`
- EU VAT invoicing: `https://taxation-customs.ec.europa.eu/taxation/vat/vat-businesses/invoicing_en`

## Target Architecture

Future canonical endpoint:

```text
https://mcp.machinesignal.it/mcp
```

Future alternative endpoint:

```text
https://api.machinesignal.it/mcp
```

Current endpoint status:

```text
not live, not configured
```

Current MCP path:

```text
local stdio adapter
```

Future hosting plane:

```text
Cloudflare Workers + Durable Objects
```

Future public discovery without tool execution:

- `https://machinesignal.it/.well-known/machine-discovery.json`
- `https://machinesignal.it/mcp-tool-manifest.json`
- `https://machinesignal.it/openapi.json`
- `https://machinesignal.it/product-catalog.json`

Future protected MCP metadata:

- `https://mcp.machinesignal.it/.well-known/oauth-protected-resource`
- `https://mcp.machinesignal.it/.well-known/oauth-protected-resource/mcp`

## Storage Decision

Use Durable Objects for:

- customer ledger;
- idempotency records;
- quota counters;
- spend caps;
- audit summary indexes;
- kill-switch state.

Use KV only for:

- static manifests;
- read-only cache with strict write budget;
- non-critical public metadata.

Do not use KV for:

- one write per score;
- one write per tool call;
- one write per log event;
- hot-path credit ledger;
- customer secrets.

This matters because we already received evidence that KV write budgets can be exceeded. The hosted MCP path must not make KV writes part of the normal scoring hot path.

## Scope Matrix

| Scope | Class | Tools | Writes | Credits | Access |
|---|---|---|---:|---:|---|
| `mcp:catalog:read` | read only | product catalog, onboarding, MCP status, public evidence pack | no | no | public or authenticated |
| `mcp:score:create` | customer write | score lead opportunity | yes | yes | authenticated only |
| `mcp:purchase_intent:create` | customer write | create purchase intent | yes | simulated now, live later only after fiscal gate | authenticated only |
| `mcp:orders:read` | customer read | get order, list orders, get delivery | no | no | authenticated only |
| `mcp:admin:*` | admin | admin metrics, kill switch, ledger reconciliation | yes | no | owner admin only |

## Tool Exposure Policy

Public registry safe tools:

- `get_product_catalog`
- `get_machine_onboarding`
- `get_mcp_status`
- `get_public_evidence_pack`

Authenticated customer tools:

- `score_lead_opportunity`
- `create_purchase_intent`
- `get_order`
- `list_orders`
- `get_delivery`
- `get_usage`

Admin tools never public:

- `get_admin_metrics`
- `set_kill_switch`
- `reconcile_ledger`
- `rotate_customer_key`

Dangerous actions blocked by default:

- send email;
- contact external target;
- charge card;
- issue invoice;
- export personal data;
- process real customer list;
- publish registry listing.

## Write Tool Rules

Every write tool must satisfy these rules:

- authentication required;
- idempotency key required;
- customer identity binding required;
- daily quota required;
- monthly credit cap required;
- structured `429` on over-limit;
- dry-run supported;
- one redacted audit event per write;
- no partial write on failure.

Action Pack must only create machine-readable payloads. It must not send emails or contact anyone.

## Future Request Flow

1. Machine reads public discovery assets.
2. Machine learns hosted MCP is not live yet, or reaches future protected MCP endpoint.
3. Future MCP endpoint returns OAuth protected-resource metadata or a clear not-live response.
4. Machine obtains a scoped token through the approved authorization server.
5. Machine calls `tools/list`; only tools allowed by scope are returned.
6. Machine calls a tool.
7. Server validates schema, scope, idempotency, customer binding, quota and spend policy.
8. Durable Object records quota, ledger and audit event.
9. Response returns structured JSON with decision, evidence, usage impact and next allowed machine action.

## Threat Model

| Threat | Risk | Mitigation |
|---|---|---|
| Token theft | high | short-lived tokens, revocation, scopes, no token logging, rotation runbook |
| Prompt or tool poisoning | high | stable tool descriptions, dangerous action labels, no hidden external actions |
| Runaway write costs | high | Durable Object quotas, daily write budget, monthly cap, structured 429, kill switch |
| Cross-customer leakage | high | customer-bound tokens, per-customer state, redacted logs, negative auth tests |
| Accidental live billing | high | live billing flag false, no invoice tool, fiscal gate, owner approval |
| Privacy boundary break | high | synthetic/public-only beta, no personal data before legal basis and DSAR workflow |
| Premature registry launch | medium | owner approval gate, no submission automation, private draft labels |
| Schema confusion | medium | machine-readable scope matrix, product selector, structured errors, versioned schemas |

## Go-Live Phases

### P0 No-Build Architecture

Current phase.

Allowed:

- write architecture spike;
- write threat model;
- run no-build probe.

Exit criteria:

- architecture probe passes;
- owner understands hosted MCP is still blocked.

### P1 Local Conformance

Future.

Allowed:

- local MCP adapter conformance checks;
- schema parity checks;
- negative tests.

Exit criteria:

- local `tools/list` and `tools/call` behavior verified;
- no write calls require live data.

### P2 Private Staging Hosted

Future blocked.

Allowed only later:

- private authenticated staging endpoint;
- synthetic data only;
- no billing;
- no registry.

Exit criteria:

- authorization implemented;
- revocation test passes;
- rate-limit test passes;
- audit log test passes.

### P3 Closed Machine Beta

Future blocked.

Allowed only later:

- selected machine clients;
- test credits;
- synthetic or approved non-personal data;
- support runbook.

Exit criteria:

- no data leakage;
- no runaway costs;
- usage ledger reconciles;
- support workflow works.

### P4 Controlled Paid Beta

Future blocked.

Allowed only later:

- test-to-live billing after fiscal approval;
- terms accepted;
- invoice workflow approved.

Exit criteria:

- fiscal gate passed;
- legal gate passed;
- payment reconciliation passed.

### P5 Public Hosted MCP And Registry

Future blocked.

Allowed only later:

- public hosted MCP;
- registry submission;
- public machine discovery claim.

Exit criteria:

- all hosted MCP go-live gates pass;
- owner signs final go-live;
- rollback plan tested.

## Later Build Spec

Only after gate approval, create:

- `mcp_hosted_worker.mjs`
- `mcp_hosted_auth.mjs`
- `mcp_hosted_scope_matrix.json`
- `mcp_hosted_conformance_probe.mjs`
- `mcp_hosted_threat_model_report.md`

Default environment flags:

```text
HOSTED_MCP_ENABLED=false
MCP_WRITE_TOOLS_ENABLED=false
LIVE_BILLING_ENABLED=false
REAL_DATA_ENABLED=false
PUBLIC_REGISTRY_SUBMISSION_ENABLED=false
```

Kill switches:

- `global_disable_mcp`
- `disable_write_tools`
- `disable_credit_consumption`
- `disable_purchase_intents`
- `disable_delivery_exports`

## Recommendation

Keep MachineSignal on local MCP plus passive machine-readable discovery now.

Prepare hosted MCP only as a staged, authenticated, read-first architecture.

Do not expose credit-consuming or purchase-intent tools publicly until authorization, quotas, audit, privacy and fiscal gates are passed.

Next allowed action:

```text
run_hosted_mcp_architecture_spike_probe
```

Next blocked action:

```text
hosted_mcp_build_or_deploy
```
