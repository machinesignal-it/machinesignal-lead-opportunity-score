# MachineSignal - Paid Beta Owner Decision Brief

Date: 2026-06-17
Status: owner decision required

## Simple Summary

The MachineSignal sandbox is technically ready for the current test scope.

The live API can be inspected by machines, documentation is available, the production access status endpoint is online, and the system clearly blocks paid beta, real payments, invoices, real customer data, personal data, external outreach, marketplace publication and public hosted MCP until the owner approves the next phase.

This means the project is not blocked by technical sandbox testing anymore. It is now blocked by business, fiscal, legal, payment and operating decisions.

## What Is Ready

- Public machine-readable discovery pages and files.
- OpenAPI contract and Postman collection.
- Public sandbox endpoints for testing.
- Credit ledger logic in sandbox/test mode.
- Deep analysis and action pack purchase logic simulated or sandboxed.
- Production access status endpoint live at `/v1/production-access/status`.
- Guardrails that explain why production use is blocked.
- Automated probes proving that the current public/live surface stays sandbox-only.
- Agent meeting evidence supporting technical closure for the current test phase.

## What Is Not Approved Yet

- Paid beta.
- Commercial go-live.
- Real production API keys.
- Real payments.
- Collection of payment methods.
- Invoices.
- Real customer data.
- Personal data.
- External outreach or email campaigns.
- Automated contact with real companies or people.
- Marketplace publication.
- Public hosted MCP.
- MCP registry submission.

## Owner Decisions Needed

1. Decide whether to launch a paid beta or continue with sandbox-only testing.
2. Decide the legal and fiscal setup before taking money.
3. Decide whether a VAT/P.IVA/accounting path is required before beta monetization.
4. Decide whether payments will be handled only in test mode or moved to live mode later.
5. Decide refund, credit and support policy.
6. Decide whether real customer lists will ever be accepted, and under which data rules.
7. Decide whether to publish to external directories, marketplaces or registries.
8. Decide who has authority to activate or stop production access.

## Recommended Next Step

Create a controlled paid beta readiness package, still without activating payments.

The package should include:

- paid beta terms draft;
- fiscal/admin checklist;
- legal/privacy checklist;
- production key policy;
- support and refund policy;
- cost cap and kill switch policy;
- final go/no-go approval page for the owner.

Only after this package is reviewed and approved should MachineSignal move from sandbox-ready to paid-beta-ready.

## Decision Options

### Option A - Continue Sandbox Only

Best if the owner wants more confidence before involving fiscal/legal/payment topics.

Effect:

- no payments;
- no invoices;
- no customer data;
- no commercial commitments;
- continued technical and product refinement.

### Option B - Prepare Paid Beta, But Do Not Activate It Yet

Best if the owner wants to get ready for revenue without taking money immediately.

Effect:

- create the paid beta operating package;
- keep all production gates blocked;
- prepare policies and documents;
- decide later when to activate.

### Option C - Activate Paid Beta

Not recommended today.

Reason:

- fiscal/legal/payment decisions are still unresolved;
- customer data and support rules are not finalized;
- production API key policy is not yet approved by the owner.

## Agent Recommendation

The agent team recommends Option B.

MachineSignal should be treated as technically test-complete for the current sandbox scope, but not commercially live. The safest next move is to prepare the paid beta package while keeping every production and payment gate closed.
