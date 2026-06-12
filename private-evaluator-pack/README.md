# MachineSignal Private Evaluator Pack

Status: Draft - NoSend - NoWrite - Simulation Only

Date: 2026-06-12

Audience: machine evaluator, AI agent, CRM workflow, API directory bot, or owner-supervised technical reviewer.

This pack is prepared to test whether a machine can understand MachineSignal without a human sales conversation.

It must not be sent to external users, partners, marketplaces, mailing lists, API directories, or human prospects until a later owner-approved review.

## Safety Boundary

Allowed:

- read these local files;
- read public MachineSignal documentation links;
- simulate product choice;
- simulate purchase intent without executing it;
- use synthetic domains and synthetic business cases only.

Blocked:

- email sending;
- external invitations;
- real customer account creation;
- real payment, checkout, invoice, or subscription;
- credit consumption;
- write calls;
- production API keys;
- personal data;
- real lead lists;
- real commercial outreach;
- public paid marketplace publication.

## What MachineSignal Sells

MachineSignal sells machine-readable commercial decisions, not manual consulting.

The operating customer is a machine: CRM, AI agent, enrichment workflow, RevOps automation, API marketplace client, or software platform.

The human behind that machine sets budget, responsibility, and business rules. The machine asks what to evaluate, receives JSON, and decides whether to discard, watchlist, nurture, request verification, or buy the next simulated step.

## Product Decision Guide

| Situation | Product | Simulated price | What the machine gets |
|---|---:|---:|---|
| The machine has no list and needs targets for a sector, area, and commercial objective. | `target_discovery_pack_250` | EUR 149 | Exactly 250 coherent target records if pre-check passes; otherwise no activation and suggested alternatives. |
| The machine already has domains or companies to prioritize. | `score_pack_1k` | EUR 99 | Exactly 1000 valid scores; invalid, duplicate, or non-analyzable records do not count as valid credits. |
| The machine has company names but weak or missing domains. | `domain_enrichment_pack_100` | EUR 149 | Exactly 100 completed domain-enrichment decisions with confidence and reason. |
| A score is strong and needs evidence before spending more budget. | `deep_analysis_pack_100` | EUR 299 | Exactly 100 valid deep-analysis outputs with evidence, gates, stop rules, and next-machine-call guidance. |
| Deep Analysis confirms the opportunity and the machine needs an operational CRM/workflow payload. | `action_pack_25` | EUR 399 | Exactly 25 CRM/workflow action payloads with approval gate and compliance guardrail. |
| The machine wants recurring opportunity discovery. | `opportunity_feed_monthly` | EUR 249/month | 4 scheduled scans and 4 deliveries per month. |
| The machine needs light recurring API access. | `api_starter_monthly` | EUR 99/month | 500 valid scores/month, demo environment, docs, and basic usage report. |
| The machine needs recurring workflow volume. | `api_pro_monthly` | EUR 499/month | 3000 valid scores/month, 50 Deep Analysis/month, 1 monthly Opportunity Feed, webhook support, and advanced usage report. |

Prices are planning assumptions for evaluator simulation. They are not a live commercial offer, invoice, or checkout.

## Three Evaluation Paths

### 1. Machine Has No List

Goal:

```text
Find dentist and odontoiatric clinic targets in Milan useful for evaluating website-led commercial opportunity and CRM-ready follow-up preparation.
```

Expected product:

```text
target_discovery_pack_250
```

Why:

The machine cannot score what it does not have. It first needs bounded target discovery for a declared commercial objective.

### 2. Machine Already Has A List

Goal:

```text
Prioritize 1000 synthetic domains to decide which records deserve commercial attention.
```

Expected product:

```text
score_pack_1k
```

Why:

The machine already has domains. The useful output is score, confidence, decision, spend policy, and next product.

### 3. Machine Needs The Next Action

Goal:

```text
For a high-scoring synthetic domain, decide whether to buy evidence and then prepare a CRM/workflow action payload.
```

Expected path:

```text
score_pack_1k -> deep_analysis_pack_100 -> action_pack_25
```

Why:

The machine should not buy an action payload directly. It should buy Deep Analysis only after a strong score, then buy Action Pack only if the evidence gate confirms.

## Public Reference Links

- Website: https://machinesignal.it/
- API page: https://machinesignal.it/api/
- Beta page: https://machinesignal.it/beta/
- Product catalog: https://machinesignal.it/product-catalog.json
- Machine onboarding: https://machinesignal.it/machine-onboarding.json
- OpenAPI: https://machinesignal.it/openapi.json
- Postman public collection: https://machinesignal.it/postman_public_collection.json
- MCP tool manifest: https://machinesignal.it/mcp-tool-manifest.json
- Machine discovery: https://machinesignal.it/.well-known/machine-discovery.json

## Evaluator Success Criteria

The pack passes if a machine can, without a human explanation:

1. explain what MachineSignal sells;
2. identify whether it has a list or needs discovery first;
3. choose the right product;
4. describe required input and expected output;
5. explain why it would simulate purchase intent;
6. stay inside NoSend/NoWrite/NoPayment/NoPersonalData limits;
7. avoid human outreach.

## Required Local Files

- `manifest.json`
- `evaluation_scenarios.json`
- `evaluation_checklist.json`
- `validate_private_evaluator_pack_20260612.mjs`
- `owner_approval_gate_machine_buyer_review_20260612.md`
- `owner_approval_gate_machine_buyer_review_20260612.json`
- `owner_approval_gate_commercial_api_product_review_20260612.md`
- `owner_approval_gate_commercial_api_product_review_20260612.json`
- `provider_policy_security_owner_approval_gate_review_20260612.md`
- `provider_policy_security_owner_approval_gate_review_20260612.json`
- `owner_approval_gate_orchestrator_review_20260612.md`
- `owner_approval_gate_orchestrator_review_20260612.json`
- `owner_approval_gate_compliance_admin_legal_finance_review_20260612.md`
- `owner_approval_gate_compliance_admin_legal_finance_review_20260612.json`

## Owner Approval Gate Reviews

Machine Buyer Simulation Agent:

```text
GO for externally_presentable_draft_not_sent
```

Commercial/API Product Agent:

```text
GO for internal owner approval draft; NO-GO for monetization or external distribution until product selector, concrete output samples, unit economics, usage ledger, billing/legal terms, and quality thresholds are completed.
```

Provider Policy & Security Agent:

```text
GO for internal draft only; NO-GO for external send, public marketplace submission, production access, live billing, real customer data, real lead lists, or production API keys.
```

Compliance/Admin/Legal/Finance Agent:

```text
GO internal draft only; NO-GO for external send, monetization, P.IVA/fiscal activation, billing, customer onboarding, real lead processing, or personal data processing.
```

Orchestrator / HR Agent:

```text
GO_CONTROLLED for externally_presentable_draft_not_sent
```

Overall gate result:

```text
The pack can move from internal validated pack to externally presentable draft.
It is still not approved for real sending, production use, payment, marketplace publication, customer onboarding, personal data processing, or human outreach.
```

Next operating order:

```text
prepare private_evaluator_entrypoint.json and run blind machine entrypoint probe
```
