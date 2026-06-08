# MachineSignal External Draft Submission Bundle - 2026-06-08

## Status

Status: ready_for_private_draft_only

Primary customer interface: machine

This bundle is for preparing API directory, RapidAPI-style and MCP/tool-registry drafts. It does not authorize public irreversible submission, live monetization, hosted MCP launch, production API keys, legal commitments or human outreach.

## What This Bundle Is For

MachineSignal sells machine-readable outputs, not a human consultancy conversation as the core product. A CRM, AI agent, RevOps workflow or enrichment pipeline can read the public files, create a sandbox customer, score a target, buy only the recommended sandbox deliverable and retrieve JSON results.

This bundle gives external technical platforms a single package that explains:

- what MachineSignal does;
- who the customer is;
- how a machine tests it;
- which evidence exists;
- which actions remain blocked before go-live.

## Current Business State

| Gate | Current state |
|---|---|
| External publication executed | false |
| Irreversible submission allowed | false |
| Live monetization enabled | false |
| Public paid plans enabled | false |
| Hosted MCP live | false |
| Production API key published | false |
| Real payment executed | false |
| Real invoice issued | false |
| External contact executed | false |
| Human outreach allowed | false |

## Recommended Submission Order

1. Generic API directory private draft

   Lowest-risk first step. Prepare metadata only and stop before final public submission.

2. RapidAPI-style unpublished provider draft

   Useful for marketplace-style API buyers, but monetization must stay disabled. Stop before paid plans, live checkout or production credentials.

3. MCP/tool registry local-adapter draft

   Best fit for machine customers and AI agents. Current implementation is local stdio adapter first. Hosted MCP is not live.

4. Postman private/team workspace

   Useful as a controlled machine-testing surface. Public visibility stays blocked until final secret scan and owner approval.

## Common Listing Copy

Product name: MachineSignal Lead Opportunity Score API

Short description: Machine-first lead opportunity scoring, target discovery and spend-control API for CRMs, AI agents and automated workflows.

Long description:

MachineSignal helps automated systems decide which business domains deserve more sales, CRM or enrichment budget. The API returns score, confidence, decision, spend policy and next machine action. A machine can start with a list of domains, or request Target Discovery when it has no list. If a score passes the gate, it can request Deep Analysis as a controlled spend layer. Only after Deep Analysis confirms the action gate can it request Action Pack, which returns CRM-ready JSON, workflow payloads, webhook policy, approval gates and stop rules.

MachineSignal is currently sandbox-only: no live payment, no fiscal invoice, no external target contact and no automatic outreach.

## Channel Drafts

| Channel | Current use | Stop before |
|---|---|---|
| Generic API directory | Prepare private/unsubmitted draft metadata | Final public submit button |
| RapidAPI-style marketplace | Prepare unpublished provider metadata | Paid plans, live checkout, production credentials |
| MCP/tool registry | Prepare local-adapter listing and manifest fields | Claiming hosted MCP is live |
| Postman private/team workspace | Controlled external machine testing | Public workspace publication |

## Machine Test Path

1. GET `https://machinesignal.it/.well-known/machine-discovery.json`
2. GET `https://machinesignal.it/machine-onboarding.json`
3. GET `https://machinesignal.it/product-catalog.json`
4. GET `https://machinesignal.it/openapi.json`
5. POST `https://machinesignal-api.beta-878.workers.dev/v1/sandbox/customers`
6. GET `/v1/onboarding` with sandbox key
7. POST `/v1/lead-opportunity-score` with sandbox key
8. POST `/v1/purchase-intent` only when the score recommends the product and budget rules allow it
9. GET `/v1/orders` to retrieve structured deliverables
10. GET `https://machinesignal.it/external_submission_pack_no_write_review_summary_20260608.json`

## Evidence

- Machine buyer evidence brief: https://machinesignal.it/machine_beta_evidence_brief_20260607.json
- Bounded private beta runner: https://machinesignal.it/bounded_private_beta_runner_summary_20260607.json
- Machine discovery full simulation: https://machinesignal.it/machine_discovery_full_simulation_summary_20260607.json
- Deep Analysis single purchase: https://machinesignal.it/machine_deep_analysis_single_purchase_summary_20260608.json
- Action Pack single purchase: https://machinesignal.it/machine_action_pack_single_purchase_summary_20260608.json
- Public sandbox claims NoWrite review: https://machinesignal.it/public_sandbox_claims_no_write_review_summary_20260608.json
- External submission pack NoWrite review: https://machinesignal.it/external_submission_pack_no_write_review_summary_20260608.json
- Distribution readiness monitor: https://machinesignal.it/distribution_readiness_monitor_summary_20260607.json

## Remaining Gap Before Go Live

Before public non-monetized go-live:

- owner-approved private draft submission rehearsal;
- external machine discovery test from a third-party surface;
- final secret scan after any external platform import.

Before paid commercial go-live:

- legal and fiscal setup;
- terms of service and commercial terms;
- live payment processor setup;
- invoice/accounting workflow;
- production key policy;
- rate limits and abuse controls;
- customer support and refund policy;
- owner approval.

## Recommended Next Step

Use this bundle to prepare a private draft submission rehearsal for a generic API directory first. Stop before irreversible publication or monetization.
