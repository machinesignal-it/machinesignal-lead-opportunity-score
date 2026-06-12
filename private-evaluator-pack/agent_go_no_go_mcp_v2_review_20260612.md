# Agent Go/No-Go MCP v2 Review

Date: 2026-06-12

Status: completed agent go/no-go review.

Primary customer interface: machine.

## Decision

Final decision:

```text
GO for private MCP v2 review and local adapter.
NO-GO for hosted MCP, registry submission or live monetization now.
```

In simple terms: il lavoro fatto sul canale MCP e' buono, ma resta una bozza privata. Non siamo ancora nella fase in cui conviene pubblicare un MCP hosted o inviare il prodotto a un registro pubblico.

## Evidence

- MCP v2 probe: `110` checks, `0` failed.
- GitHub-first discoverability probe: `113` checks, `0` failed.
- GitHub public metadata applied probe: `25` checks, `0` failed.
- Public read-only tools checked: `18`.
- Sandbox write tools blocked: `4`.
- MCP registry submission executed: `0`.
- Hosted MCP launch executed: `0`.
- Payment executed: `0`.
- Credits consumed: `0`.
- Personal data used: `0`.

## Agent Votes

### Architetto Web AI / MCP Architect

Vote:

```text
GO local stdio adapter.
NO-GO hosted public MCP now.
```

Reason:

The local adapter and manifest are ready for private review. Hosted MCP would introduce remote security, auth, rate-limit, cost and key-management risks.

### Data Quality & Compliance + Legal

Vote:

```text
GO private review.
NO-GO public registry submission or hosted MCP.
```

Reason:

The current perimeter is safe because it blocks real data, personal data, billing, production keys and outreach. If hosted MCP or real data enters, privacy, fiscal and security gates become mandatory.

### Growth & Distribution + Customer Feedback

Vote:

```text
GO passive discoverability.
NO-GO irreversible external publication.
```

Reason:

GitHub and public docs are now machine-readable enough. The exposure risk is acceptable only while writes, billing, production keys and outreach stay blocked.

### API Product Manager + Scoring Optimizer Desk

Vote:

```text
GO product private draft.
NO-GO public MCP go-live.
```

Reason:

The product routing is clear enough for private MCP review:

- no starting list -> Target Discovery;
- existing list -> Score Pack;
- names without domains -> Domain Enrichment;
- high score and confidence -> Deep Analysis;
- confirmed Deep Analysis gate -> Action Pack.

Before go-live, API schema, quotas, write scopes, telemetry and error taxonomy must be hardened.

## Go Now

- Keep MCP/tool-registry v2 as private registry-ready draft.
- Continue local stdio adapter as the official MCP path.
- Keep GitHub machine docs and passive public machine discovery.
- Run no-credit/local read-only validation.
- Prepare owner-supervised hosted MCP architecture checklist.

## No-Go Now

- Public MCP/tool-registry submission.
- Hosted public MCP endpoint.
- Write-enabled public MCP tools.
- Live billing.
- Real payment.
- Invoices.
- Production key distribution.
- Automatic outreach.
- External target contact.
- Real customer data.
- Personal data.
- Real lead lists.
- Public marketplace launch.

## Main Risks

Hosted MCP security surface:

Needs scoped authorization, revocation, audit logging, rate limits, cost guardrails and separation between read-only, write-enabled and admin scopes.

Privacy and real data:

The current test is safe because it avoids real and personal data. Before real data, we need data map, legal basis, retention, DSAR flow and processor terms.

Fiscal and live billing:

Prices are still simulated and billing is disabled. Before live payments, IVA/fatturazione/reconciliation/legal terms must be resolved.

Cloning and exposure:

GitHub is now readable by machines and by competitors. This is acceptable for passive discovery, but not enough reason to publish marketplace/registry yet.

False maturity signal:

The project has many proofs, so it may look more live than it is. We must keep repeating: sandbox-only, no hosted MCP, no live billing, no outreach, no production keys.

## Minimum Hosted MCP Prerequisites

- Scoped authorization and revocation.
- Rate limits and abuse controls.
- Usage logging and audit trail.
- Separate read-only, write-enabled and admin scopes.
- Production key distribution and rotation policy.
- Personal-data and real-customer-data policy.
- MCP conformance smoke tests against current spec.
- Cost guardrails for hosted operation.
- Fiscal gate for live billing and invoices.
- Owner-approved go-live decision.

## Recommended Next Action

Create a hosted MCP architecture checklist and go-live gate, but do not build or publish a hosted endpoint yet.

This is the right next step because it moves us toward the "machines buy from us" model without prematurely creating legal, fiscal, security or operational exposure.
