# MachineSignal - External Machine Evaluator Sandbox Readout

Date: 2026-06-02

## Purpose

Validate whether an external machine can test MachineSignal without admin credentials, human email persuasion, real payment or external outreach.

## Flow tested

1. Read public `llms.txt`.
2. Read public Dentists Beta Machine Buyer Pack.
3. Read public product catalog.
4. Read public machine onboarding manifest.
5. Read public OpenAPI schema.
6. Create a sandbox customer through `POST /v1/sandbox/customers`.
7. Read authenticated onboarding with the sandbox key.
8. Create a `target_discovery` beta purchase intent.
9. Use the returned sample target as input for `POST /v1/lead-opportunity-score`.
10. Create the recommended `deep_analysis` beta purchase intent.
11. Retrieve orders and usage.

## Result

Status: passed.

| Check | Result |
|---|---|
| Public resources readable | OK |
| `llms.txt` points to dentists beta pack | OK |
| Dentists beta pack includes 250-target benchmark | OK |
| Sandbox customer created | OK |
| Authenticated onboarding readable | OK |
| Target Discovery purchase intent | OK |
| Sample target returned | OK |
| Sample target scored | OK |
| `web_architect_review` returned | OK |
| `commercial_strength` returned | OK |
| Recommended add-on purchase intent | OK |
| Orders readable | OK |
| Usage readable | OK |
| Real payment executed | false |
| External contact executed | false |

## Live details

- Sandbox customer: `sandbox_d3ca9383_mpwrpnf8`
- Sandbox key prefix: `ms_cust_aC...e2Gq`
- Sample domain scored: `dentists-odontoiatric-clinics-lombardia-candidate-01.example`
- Opportunity score: `77`
- Confidence: `0.88`
- Decision: `buy_deep_analysis`
- Web Architect status: `architect_signal_insufficient`
- Commercial strength: `medium`
- Recommended product: `deep_analysis`
- Orders created/read: `2`

## Interpretation

The public machine-buyer path is working.

An external machine can discover the product, create a sandbox key, read customer-specific onboarding, order a beta target discovery, score a returned target, create a recommended add-on purchase intent and retrieve the resulting orders.

The test also confirms the guardrails:

- no real payment was executed;
- no external contact was executed;
- the Web Architect gate did not force the sample target to `strong`;
- the system still allowed controlled medium-strength spend through Deep Analysis.

## Limitation

The sandbox target returned by Target Discovery is synthetic and uses an `.example` domain. This is correct for sandbox safety, but it means the test validates machine usability and purchase flow, not real 250-target discovery quality.

Real vertical quality is validated separately by the 250 dentist benchmark.

