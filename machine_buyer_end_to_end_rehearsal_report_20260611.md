# MachineSignal - Machine Buyer End-to-End Rehearsal - 2026-06-11

## Result

- Status: completed_machine_buyer_end_to_end_rehearsal
- OK: true
- Mode: MachineBuyerEndToEndRehearsalWriteCapped
- Primary customer interface: machine
- POST calls executed: 5/5
- Checks failed: 0/46

## Machine Path Tested

1. Discover public assets: robots, llms, sitemap, well-known discovery, OpenAPI, Postman and MCP manifest.
2. Create one limited sandbox customer.
3. Read authenticated onboarding.
4. Request Target Discovery for a machine with no starting list.
5. Score a synthetic high-signal dental target.
6. Follow the score recommendation and buy Deep Analysis in sandbox.
7. Buy Action Pack only after Deep Analysis passes the gate.
8. Retrieve orders and usage for reconciliation.

## Commercial Decision

- Domain: `studio-dentale-demo-8.it`
- Score: 81
- Confidence: 0.88
- Decision: buy_deep_analysis
- Next product: deep_analysis
- Commercial strength: strong
- Spend policy: buy_deep_analysis_then_consider_action_pack_if_deep_confirms
- Action Pack gate passed: true

## Safety

- Real payment executed: false
- Real invoice issued: false
- External contact executed: false
- Human outreach executed: false
- External publication executed: false
- Live monetization enabled: false
- Production API key published: false

## Interpretation

A buyer machine can discover MachineSignal, create a limited sandbox customer, request no-list Target Discovery, score a synthetic high-signal target, follow the recommended Deep Analysis purchase, buy Action Pack after the Deep Analysis gate and retrieve orders and usage without real payment, invoice, outreach or external publication.

## Recommended Next Step

Use this as the current strongest machine-buyer evidence. Next step: run an owner-supervised go/no-go review before enabling hosted MCP, marketplace publication or paid checkout.

## Failed Checks

None.
