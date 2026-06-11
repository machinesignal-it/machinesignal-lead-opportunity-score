# MachineSignal - Postman Private Team Workspace Sandbox Rehearsal - 2026-06-11

## Result

- Status: completed_postman_private_team_workspace_sandbox_rehearsal
- OK: True
- Mode: PostmanPrivateTeamWorkspaceSandboxRehearsalWriteCapped
- Primary customer interface: machine
- Workspace visibility: team
- Collection items: 28
- POST calls executed: 3/3
- Write calls executed: 3/3
- Checks failed: 0/22

## Machine Path Tested

1. Fetch the private/team Postman workspace metadata through the Postman API.
2. Fetch the callable beta collection and sandbox environment.
3. Resolve Postman variables without real customer/admin keys.
4. Create one limited sandbox customer.
5. Read the product catalog.
6. Score one synthetic business domain.
7. Order Target Discovery for the no-list buyer-machine case.
8. Read usage and order history for reconciliation.

## Commercial Decision Observed

- Domain: `studio-dentale-postman-rehearsal.it`
- Score: 67
- Confidence: 0.35
- Decision: needs_verification
- Commercial strength: @{level=weak; spend_policy=do_not_buy_paid_addons_before_verification; allowed_next_products=System.Object[]; reason=Commercial signal is not reliable enough; the customer machine should stop paid add-ons until data quality improves.}

## Safety

- Real payment executed: false
- Real invoice issued: false
- External contact executed: false
- Human outreach executed: false
- External publication executed: false
- Live monetization enabled: false
- Production API key published: false
- Admin endpoints called: false
- Payment endpoints called: false

## Interpretation

A buyer machine can use the Postman private/team workspace as a sandbox evaluation channel. It can read the collection and environment, create a limited sandbox key, score a domain, request Target Discovery when it has no starting list, and reconcile usage/orders without any real payment, invoice, publication or external contact.

## Recommended Next Step

Use this as evidence that Postman can serve as a private/team machine-to-machine sandbox channel. Next, prepare the API-directory private draft with the same no-publication/no-payment controls.

## Failed Checks

None.

## Actions

- POST Create limited sandbox customer: HTTP 200
- GET Fetch product catalog: HTTP 200
- POST Score business domain: HTTP 200
- POST Order target discovery when machine has no list: HTTP 200
- GET Read usage ledger: HTTP 200
- GET List beta orders: HTTP 200
