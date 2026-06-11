# MachineSignal - RapidAPI-Style Unpublished Provider Sandbox Rehearsal - 2026-06-11

## Result

- Status: completed_rapidapi_unpublished_provider_sandbox_rehearsal
- OK: true
- Mode: RapidApiStyleUnpublishedProviderSandboxRehearsalWriteCapped
- Primary customer interface: machine
- Channel: RapidAPI-style unpublished provider draft
- POST calls executed: 3/3
- Write calls executed: 3/3
- Checks failed: 0/66

## Machine Path Tested

1. Read RapidAPI-style unpublished provider draft pack and review.
2. Read RapidAPI-style listing and provider setup metadata.
3. Verify OpenAPI, product catalog, onboarding, llms.txt, robots.txt and sitemap.
4. Read the agent go/no-go review that approved this exact sandbox test.
5. Create one limited sandbox customer.
6. Score one synthetic business domain.
7. Order Target Discovery for the buyer-machine no-list case.
8. Read usage and orders for reconciliation.

## Commercial Decision Observed

- Domain: `studio-dentale-rapidapi-rehearsal.it`
- Score: 51
- Confidence: 0.35
- Decision: needs_verification
- Next product: verification
- Target Discovery order status: accepted_beta_order_intent
- Promised target count: 250

## Safety

- Real payment executed: false
- Real invoice issued: false
- External contact executed: false
- Human outreach executed: false
- External publication executed: false
- Irreversible submission executed: false
- Live monetization enabled: false
- Public paid plans enabled: false
- Marketplace pricing tiers created: false
- Production API key published: false
- RapidAPI provider created or published: false
- RapidAPI external API called: false
- Admin endpoints called: false
- Payment endpoints called: false

## Interpretation

A RapidAPI-style consumer bot can understand the unpublished provider draft, verify the machine-first value proposition, create a limited sandbox key, score a domain, request Target Discovery when it has no list, and reconcile usage/orders without any external marketplace publication, payment, invoice or outreach.

## Recommended Next Step

Use this as evidence that the RapidAPI-style unpublished provider path can be tested by machines without marketplace publication or billing. Next, run an agent review before deciding whether to prepare any owner-approved private external evaluator access.

## Failed Checks

None.

## Actions

- POST create_sandbox_customer: HTTP 200
- POST score_domain: HTTP 200
- POST order_target_discovery: HTTP 200
- GET read_usage: HTTP 200
- GET list_orders: HTTP 200
