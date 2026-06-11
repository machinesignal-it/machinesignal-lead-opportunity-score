# MachineSignal - API Directory Private Listing Sandbox Rehearsal - 2026-06-11

## Result

- Status: completed_api_directory_private_listing_sandbox_rehearsal
- OK: true
- Mode: ApiDirectoryPrivateListingSandboxRehearsalWriteCapped
- Primary customer interface: machine
- Channel: generic API directory private draft
- POST calls executed: 3/3
- Write calls executed: 3/3
- Checks failed: 0/57

## Machine Path Tested

1. Read API directory private draft pack and review.
2. Read generic API directory submission metadata.
3. Verify OpenAPI, product catalog, onboarding, llms.txt, robots.txt and sitemap.
4. Create one limited sandbox customer.
5. Score one synthetic business domain.
6. Order Target Discovery for the buyer-machine no-list case.
7. Read usage and orders for reconciliation.

## Commercial Decision Observed

- Domain: `studio-legale-api-directory-rehearsal.it`
- Score: 77
- Confidence: 0.49
- Decision: needs_verification
- Target Discovery order status: accepted_beta_order_intent

## Safety

- Real payment executed: false
- Real invoice issued: false
- External contact executed: false
- Human outreach executed: false
- External publication executed: false
- Irreversible submission executed: false
- Live monetization enabled: false
- Public paid plans enabled: false
- Production API key published: false
- Admin endpoints called: false
- Payment endpoints called: false

## Interpretation

A generic API directory bot can understand the MachineSignal private listing draft, verify the machine-first value proposition, create a limited sandbox key, score a domain, request Target Discovery when it has no list, and reconcile usage/orders without any external publication, payment, invoice or outreach.

## Recommended Next Step

Use this as evidence that a generic API directory private listing can be prepared and tested by machines. Next, run an agent review before deciding whether to prepare an unpublished RapidAPI-style provider draft or keep improving directory copy.

## Failed Checks

None.

## Actions

- POST create_sandbox_customer: HTTP 200
- POST score_domain: HTTP 200
- POST order_target_discovery: HTTP 200
- GET read_usage: HTTP 200
- GET list_orders: HTTP 200
