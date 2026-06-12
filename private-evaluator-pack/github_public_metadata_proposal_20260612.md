# GitHub Public Metadata Proposal

Date: 2026-06-12

Status: proposal only, not applied.

Primary customer interface: machine.

## Purpose

This proposal improves how GitHub presents MachineSignal to AI agents, MCP clients, CRM workflows, API-directory bots and technical software evaluators.

It does not change public repository metadata yet. Description, homepage and topics should be applied only after explicit owner approval because they are public positioning changes.

## Current Metadata Observed

- Repository: `machinesignal-it/machinesignal-lead-opportunity-score`
- Visibility: public
- Current description: `Machine-readable lead opportunity scoring API for CRM, RevOps and AI-agent workflows. Private beta.`
- Current homepage: empty
- Current topics: none

## Proposed Description

```text
Machine-first lead opportunity scoring API for CRMs, AI agents, MCP clients and workflows. Sandbox-only beta: no outreach or live billing.
```

Why this is stronger:

- It says clearly that the buyer interface is machine-first.
- It names the real product category: lead opportunity scoring API.
- It mentions CRMs, AI agents, MCP clients and workflows, which are the machine buyers we care about.
- It keeps the correct boundary: sandbox-only beta, no outreach, no live billing.

## Proposed Homepage

```text
https://machinesignal.it/machine-discovery/
```

Why:

- A machine or technical evaluator lands directly on the machine-discovery path.
- It is more specific than the generic homepage.
- It supports the current strategy: GitHub machine docs plus MCP/tool-registry draft.

## Proposed Topics

```text
machine-first
machine-readable
lead-scoring
opportunity-scoring
ai-agents
crm
revops
mcp
openapi
api
workflow-automation
data-enrichment
sandbox-beta
```

## Language To Avoid

Do not use these claims in GitHub public metadata:

- guaranteed revenue;
- automatic income;
- live paid checkout;
- active subscriptions;
- production keys available;
- automatic email outreach;
- human sales outreach;
- processing real customer data;
- processing personal data;
- live hosted MCP server.

## Approval Gate

Allowed now:

- keep this proposal as evidence;
- validate it with a NoWrite probe;
- share it internally with the owner.

Blocked until explicit owner approval:

- changing repository description;
- changing repository homepage;
- changing repository topics;
- submitting to marketplace or MCP registry;
- enabling live billing;
- issuing production keys.

## Recommended Next Step

If the owner approves, apply only these three GitHub metadata fields and then rerun the GitHub-first discoverability probe.
