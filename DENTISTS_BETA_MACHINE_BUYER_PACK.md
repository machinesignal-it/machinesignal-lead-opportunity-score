# MachineSignal - Dentists Beta Machine Buyer Pack

Last updated: 2026-06-02

## Purpose

This pack describes the current beta funnel for machines that want to evaluate dentist and odontoiatric clinic domains in Lombardia.

The customer interface is a machine: CRM, RevOps workflow, AI agent, enrichment pipeline or API evaluator. The human role is supervision and audit only.

## What the machine buys

The beta funnel sells controlled, credit-based outputs. It does not sell human outreach.

1. Target Discovery Pack
   The machine has no list and asks for dentist / odontoiatric clinic targets in a specific area and for a specific commercial objective.

2. Score Pack
   The machine scores the returned domains and receives `opportunity_score`, `confidence`, `decision`, `web_architect_review`, `commercial_strength` and `next_purchase`.

3. Deep Analysis
   The machine buys a deeper explanation only when the score recommends it.

4. Nurture Signal
   The machine saves medium-potential domains for later follow-up or rescoring.

5. Action Pack
   The machine buys CRM-ready action JSON only when the lead is commercially strong and the deep analysis confirms the opportunity.

## Valid beta result

A valid beta result is not "many leads". A valid result is a controlled routing system where the machine knows what to do next and avoids unnecessary spend.

For the dentist beta, a strong lead requires:

- score high enough to justify downstream spend;
- confidence high enough to avoid random action;
- no quality mismatch;
- website evidence;
- dentist / clinic sector evidence;
- local-market evidence;
- Web Architect evidence that supports controlled downstream action.

## Live test result

The current benchmark used 250 dentist / odontoiatric clinic targets in Lombardia.

| Metric | Result |
|---|---:|
| Targets loaded | 250 |
| Targets scored | 250 |
| Score failures | 0 |
| Purchase failures | 0 |
| Ledger backend | durable_object |
| Ledger reconciliation | true |
| Real payment executed | false |
| External contact executed | false |
| Total simulated revenue | EUR 552.95 |
| Target Discovery revenue | EUR 149.00 |
| Downstream revenue | EUR 403.95 |
| Downstream revenue per target | EUR 1.6158 |

## Routing result

| Routing outcome | Count |
|---|---:|
| buy_deep_analysis | 36 |
| nurture | 96 |
| watchlist | 118 |

| Commercial strength | Count |
|---|---:|
| strong | 11 |
| medium | 121 |
| weak | 118 |

| Product intent | Count |
|---|---:|
| target_discovery | 1 |
| deep_analysis | 36 |
| nurture_signal | 96 |
| action_pack | 11 |

## Why this matters commercially

The machine does not need a salesperson to explain every record.

It receives a decision:

- `watchlist`: keep but do not spend more now;
- `nurture`: save for low-cost follow-up or later rescoring;
- `buy_deep_analysis`: buy a deeper machine-readable explanation;
- `action_pack`: prepare CRM/workflow action only after strict evidence gates.

The economic signal is the downstream revenue after the first list purchase. In the current dentist test, the EUR 149 target discovery order generated EUR 403.95 of additional simulated beta demand.

## Control test

The same Web Architect logic was tested on 50 real estate targets and 50 aesthetic medicine targets.

Result:

- 0 strong leads in real estate;
- 0 Action Pack candidates in real estate;
- 0 strong leads in aesthetic medicine;
- 0 Action Pack candidates in aesthetic medicine.

This suggests the Web Architect gate is not simply inflating every vertical. It remains selective outside the dentist beta funnel.

## Machine-safe next step

The dentist beta funnel is ready for a machine buyer package:

1. publish this pack as Markdown and JSON;
2. expose it in `llms.txt`, README and machine onboarding;
3. keep the beta guardrails active: no real payment and no external outreach;
4. collect machine feedback through API calls, audit reports and structured deliveries;
5. use dentists / odontoiatric clinics as the main beta vertical before adding another niche.

