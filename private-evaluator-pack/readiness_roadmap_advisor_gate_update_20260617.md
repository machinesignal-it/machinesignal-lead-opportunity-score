# MachineSignal - Readiness Roadmap Advisor Gate Update

Date: 2026-06-17
Status: updated roadmap, no commercial activation

## Executive Status

MachineSignal has completed the current technical sandbox scope.

The project can continue internal preparation.

The project cannot activate paid beta, accept money, issue invoices, use real/personal data, publish marketplace/MCP, issue production keys or perform outreach.

## Current Roadmap Position

| Area | Current State | Decision |
|---|---|---|
| Technical sandbox | Ready for current scope | Continue internal refinement |
| Public machine-readable docs | Available | Improve clarity only |
| OpenAPI/Postman | Available | Improve examples only |
| Advisor readiness agents | Created and rehearsed | Use as gate before commercial actions |
| Paid beta preparation | Allowed | Prepare only |
| Paid beta activation | Blocked | No-go |
| Commercial go-live | Blocked | No-go |
| Real payments | Blocked | No-go |
| Invoices | Blocked | No-go |
| Real/customer data | Blocked | No-go |
| Personal data | Blocked | No-go |
| Outreach/email | Blocked | No-go |
| Marketplace/MCP public publication | Blocked | No-go |

## Advisor Gate State

Three internal readiness agents are now active:

1. Fiscal/Admin Readiness Agent
2. Legal & Privacy Readiness Agent
3. Advisor Gatekeeper Agent

They are internal readiness agents only.

They can prepare, challenge and block.

They cannot create official fiscal/legal/privacy approval.

## Advisor Gate Rehearsal Result

The rehearsal tested 18 requests.

Result:

- `green_prepare_only`: 6
- `yellow_owner_review`: 2
- `red_blocked`: 10
- unexpected allows: 0
- hard block violations: 0

Meaning:

The gate behaves correctly. It allows only internal preparation and blocks commercial, payment, data, production key, outreach and publication actions.

## What Agents Can Do Next

Agents can continue with:

- OpenAPI examples improvement;
- machine-readable onboarding clarity;
- documentation wording;
- P&L assumption refinement;
- Company Brain update;
- readiness dashboard update;
- synthetic/no-personal-data tests;
- cost model checks;
- owner approval material improvements;
- policy consistency checks.

## What Agents Must Not Do

Agents must not:

- activate paid beta;
- accept money;
- collect payment methods;
- issue invoices;
- issue production API keys;
- process real customer lists;
- process personal data;
- send outreach email;
- contact companies or people;
- publish marketplace listing;
- publish hosted public MCP;
- submit MCP registry;
- declare final legal/privacy/fiscal approval.

## Updated Roadmap

### Phase A - Technical Sandbox

Status: complete for current scope.

Closed items:

- public sandbox;
- OpenAPI/Postman;
- machine-readable docs;
- production access status endpoint;
- guardrail schemas;
- sandbox probes;
- post-deploy agent review.

### Phase B - Advisor Gate Setup

Status: complete for current scope.

Closed items:

- advisor readiness agents created;
- advisor gate rehearsal passed;
- owner decision roadmap created;
- advisor review packet DOCX created.

### Phase C - Internal Preparation Refinement

Status: current safe workstream.

Allowed work:

- improve API examples;
- improve docs;
- improve P&L assumptions;
- update Company Brain;
- create readiness dashboard update.

### Phase D - Owner/Fiscal/Legal Decision

Status: blocked until owner chooses to decide.

Required before paid beta:

- owner approval;
- fiscal/admin approval;
- invoicing/payment path;
- legal/privacy terms;
- data policy;
- support policy;
- cost caps;
- kill switch owner;
- distribution approval.

### Phase E - Paid Beta Activation

Status: no-go.

No activation until Phase D is complete.

## Recommended Next Safe Step

Run an internal documentation/API examples refinement pass.

Reason:

This is useful for machine buyers, does not require money, does not use real data and does not create legal/fiscal exposure.

Suggested scope:

- improve `/openapi.json` examples;
- improve public machine onboarding wording;
- check that docs never imply paid beta is live;
- verify with no-write probes.

## Final Decision

Continue internal preparation: yes.

Activate paid beta: no.

Commercial go-live: no.

Need more agents now: no.
