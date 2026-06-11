# MachineSignal - Postman Private Team Workspace Setup - 2026-06-11

## Result

The Postman private/team workspace setup was completed for sandbox-only machine-to-machine testing.

- Status: completed_postman_private_team_workspace_setup
- OK: true
- Workspace: MachineSignal Public API
- Workspace type: team
- Workspace visibility: team
- Collection action: created
- Collection name: MachineSignal Lead Opportunity Score API - Callable Beta
- Collection UID: 55284144-66c391f0-73a9-460e-8906-e79996af4eec
- Collection item count: 28
- Environment action: created
- Environment name: MachineSignal Public Sandbox Environment
- Environment UID: 55284144-dcb6c177-7820-4b14-9f7e-66a20d47e3a0
- Environment values count: 7

## What Was Set Up

Postman now has a team/private workspace path that a machine-side evaluator can use before any public marketplace launch.

The uploaded collection covers:

- public machine-readable discovery resources;
- sandbox customer creation;
- lead opportunity scoring;
- usage ledger reading;
- product catalog reading;
- target discovery order when the buyer machine has no list;
- deep analysis order after a strong score;
- action pack order after the deep analysis gate;
- beta order listing;
- payment-test endpoints in test mode only.

The uploaded environment contains blank placeholders for sensitive values. No real production API key, customer key, admin key or payment secret was uploaded.

## Machine Buyer Paths Covered

- Customer with an existing list: supported through score and follow-on purchase intent requests.
- Customer without a list: supported through target discovery order requests.
- Action Pack after Deep Analysis: supported only after the deep analysis gate has been satisfied.

## Safety Controls

- Public workspace enabled: false
- Live payments enabled: false
- Real payment executed: false
- Real invoice issued: false
- External contact executed: false
- Human outreach executed: false
- Production API key uploaded: false
- Real secret values uploaded: false
- Collection secret variable types uploaded: false

## Agent Decision Context

The agent meeting selected Postman private/team workspace as the first distribution channel because it is the lowest-risk way to let software, agents and technical evaluators inspect and run the API contract without human sales outreach.

Sequence agreed by agents:

1. Postman private/team workspace first.
2. API directory draft next.
3. MCP / agent registry local-adapter path after that.

## Next Step

Run a controlled Postman-oriented sandbox rehearsal against the team/private setup. The rehearsal should keep the same limits:

- no public publication;
- no real keys;
- no live payment;
- no invoice;
- no external outreach;
- limited sandbox calls only;
- idempotency keys on any write-style request.
