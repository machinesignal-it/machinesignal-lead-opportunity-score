# Agent Go/No-Go Soft Go-Live Sandbox-Only Review

Date: 2026-06-13

Status: completed

Primary customer interface: machine

## Decision

Final decision:

```text
GO conditionally for soft go-live sandbox-only.
NO-GO for paid go-live, live checkout, invoices, public paid marketplace, hosted public MCP, registry submission, human outreach, external contact, production keys, real customer data or personal data.
```

In simple terms: we can proceed with a controlled sandbox-only soft go-live where machines can discover, read and test MachineSignal. This is not a paid launch.

## Evidence Reviewed

- Public Machine Readability Probe: `97` checks, `0` failed.
- Public Static Contract Deploy Probe: `21` checks, `0` failed.
- Machine Buyer End-to-End Rehearsal: `46` checks, `0` failed.
- Sandbox Agent Go/No-Go Review: conditional GO for sandbox-only.
- MCP Schema Parity + Error Taxonomy P1: `105` checks, `0` failed.

## Agent Votes

| Agent seat | Vote | Main reason |
| --- | --- | --- |
| Orchestratore | GO sandbox-only | Evidence supports a controlled machine-first sandbox stage. |
| Agente analisi mercato potenziale | GO sandbox-only | The business model is coherent: sell machine-readable decisions and payloads. |
| Architetto web AI | GO sandbox-only | Public assets are reachable and machine-readable. |
| Agente API | GO sandbox-only | OpenAPI and MCP manifests expose the core machine actions. |
| Data Scout | GO sandbox-only | No-list Target Discovery is understandable through market, area and commercial objective. |
| Data Quality & Compliance | GO sandbox-only | Valid-output rules and no-real-data perimeter are explicit. |
| Scoring Optimizer | GO sandbox-only | Score, confidence and next-product routing are usable by workflows. |
| API Product Manager | GO sandbox-only | Products, prices, validity rules and machine outputs are clear. |
| Growth & Distribution | GO sandbox-only | Passive machine-readable discovery can proceed. |
| Customer Feedback | GO sandbox-only | Next feedback should come from machine comprehension and endpoint errors. |
| Machine-to-Machine Sales Ops | GO sandbox-only | The commercial test can run as machine discovery plus sandbox evaluation. |
| Customer Success & Post-Sale | GO sandbox-only | Usage, order retrieval and delivery are testable in sandbox. |
| Admin & Finance Controller | NO-GO paid | Fiscal, payment, invoice and reconciliation gates are not ready. |
| Legal & Compliance | NO-GO paid or real data | Real data, terms, DPA, retention and privacy policies are not ready. |
| Continuous Improvement / Competitive Learning | GO sandbox-only | The next learning loop should compare machine comprehension and failures. |
| HR / Agent Manager | GO sandbox-only | Agent coverage is sufficient for the next controlled stage. |

## Consolidated Findings

1. A machine can understand what MachineSignal sells and which endpoint to call.
2. The product routing is clear enough for sandbox use:
   - existing list -> Score Pack;
   - no list -> Target Discovery;
   - high score -> Deep Analysis;
   - confirmed action gate -> Action Pack.
3. OpenAPI, MCP root manifest and `.well-known` manifest are aligned.
4. The system remains safely bounded: no payment, no invoice, no outreach, no external publication, no production keys and no real data.
5. The main remaining risk is business activation, not product clarity: fiscal/legal/payment readiness and real external demand are not yet validated.
6. The soft go-live must be framed as sandbox-only machine evaluation, not as a paid public launch.

## Allowed Now

- Public machine-readable documentation.
- Public OpenAPI and MCP manifests.
- Sandbox-only machine discovery.
- Bounded sandbox customer creation.
- Synthetic examples.
- No-write or write-capped probes.
- Public GitHub documentation.
- Private draft distribution packs.

## Still Blocked

- Charging money.
- Collecting payment methods.
- Issuing invoices.
- Publishing paid marketplace plans.
- Submitting to a public MCP registry.
- Launching hosted MCP publicly.
- Contacting humans.
- Contacting external target companies.
- Processing real customer data.
- Processing personal data.

## Recommended Next Action

Prepare the Soft Go-Live Sandbox-Only Control Pack.

It must define:

- exact machine test path;
- what is allowed and blocked;
- safety gates;
- success metrics;
- rollback rules;
- owner approval checklist;
- conditions required before any paid or public escalation.
