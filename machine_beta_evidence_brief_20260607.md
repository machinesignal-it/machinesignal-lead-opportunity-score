# MachineSignal Machine Buyer Evidence Brief - 2026-06-07

## Executive Summary

MachineSignal has completed a bounded private beta run proving the core machine-buyer flow:

1. a customer machine receives a bounded credit ledger;
2. the customer machine scores a controlled list of business domains;
3. the customer machine buys one Deep Analysis for the strongest target;
4. the customer machine is blocked when it tries to buy an Action Pack without a valid Deep Analysis source order;
5. the customer machine buys one Action Pack only after the Deep Analysis gate passes;
6. no real payment, invoice or external contact is executed.

This is evidence that the product can be used by software, CRM workflows and AI agents as the primary buyer interface, with humans supervising and auditing rather than manually selling by email.

## What Was Tested

The beta runner executed a full bounded flow against the live beta API:

- API base URL: `https://machinesignal-api.beta-878.workers.dev`
- mode: `Full`
- status: `completed_full`
- overall result: `OK`
- score calls allowed: `5`
- Deep Analysis orders allowed: `1`
- Action Pack orders allowed: `1`
- real payments allowed: `0`
- external contacts allowed: `0`

## Results

| Evidence point | Result |
|---|---|
| Worker health reachable | OK |
| Public machine discovery available | OK |
| OpenAPI documents Action Pack gate | OK |
| Postman collection documents Action Pack gate | OK |
| Readiness gate allows controlled beta | OK |
| Beta customer ledger created | OK |
| Score cap respected | OK, 5 score credits consumed |
| Deep Analysis cap respected | OK, 1 Deep Analysis credit consumed |
| Action Pack cap respected | OK, 1 Action Pack credit consumed |
| Action Pack without Deep Analysis blocked | OK, HTTP 400 |
| Action Pack after Deep Analysis accepted | OK |
| Real payment executed | false |
| External contact executed | false |
| Real invoice issued | false |

## Scored Targets

| Domain | Score | Decision | Strength | Suggested next product |
|---|---:|---|---|---|
| `bounded-dental-clinic-demo.it` | 67 | nurture | medium | nurture_signal |
| `bounded-legal-studio-demo.it` | 71 | nurture | medium | nurture_signal |
| `bounded-solar-installer-demo.it` | 44 | needs_verification | weak | verification |
| `bounded-aesthetic-clinic-demo.it` | 74 | nurture | medium | nurture_signal |
| `bounded-real-estate-demo.it` | 56 | watchlist | weak | none |

The runner selected `bounded-aesthetic-clinic-demo.it` as the strongest target and bought one Deep Analysis. The valid Action Pack was accepted only after that Deep Analysis order existed.

## Machine-Buyer Meaning

This test matters because the customer interface is not a human sales conversation. The expected customer is a machine:

- a CRM workflow deciding which records deserve budget;
- a RevOps automation deciding whether to enrich, watchlist or stop;
- an AI agent looking for a callable API with clear product rules;
- an integration partner checking whether the service has a safe beta contract.

The machine can use the public manifest, OpenAPI, Postman collection, product catalog and beta endpoints to discover the service, understand the rules, call the API, consume credits and retrieve JSON deliveries.

## Commercial Meaning

The current beta supports three commercial events:

1. **Score Pack consumption**: the machine pays with credits for valid opportunity scores.
2. **Deep Analysis purchase**: the machine buys deeper evidence only when a scored target is promising enough.
3. **Action Pack purchase**: the machine buys CRM/workflow-ready action output only after a Deep Analysis gate confirms that the target is worth downstream action.

The Action Pack is intentionally gated. This avoids selling a generic follow-up package before the system has enough evidence.

## Safety Meaning

The beta run confirms these guardrails:

- no live payment execution;
- no fiscal invoice generation;
- no unsolicited external contact;
- no Action Pack without a valid Deep Analysis source order;
- bounded credit consumption;
- order and credit usage are auditable through the beta ledger.

## Public Evidence Links

- Full beta runner report: `https://machinesignal.it/bounded_private_beta_runner_report_20260607.md`
- Full beta runner JSON: `https://machinesignal.it/bounded_private_beta_runner_summary_20260607.json`
- Evidence brief JSON: `https://machinesignal.it/machine_beta_evidence_brief_20260607.json`
- Evidence brief HTML: `https://machinesignal.it/machine_beta_evidence_brief_20260607.html`

## Recommended Next Step

Use this evidence brief as the first public proof pack for machine-oriented distribution. The next product step is to prepare the marketplace/API submission wording around this message:

> MachineSignal lets a customer machine score domains, buy deeper analysis and buy CRM-ready action outputs under bounded credits, explicit gates and no automatic external outreach.

