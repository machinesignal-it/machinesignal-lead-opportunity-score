# MachineSignal Machine Buyer Evaluation Pack

Status: short evaluation pack for machines, agents, CRM systems, RevOps workflows and technical partners.

Date: 2026-06-06

## One-Page Explanation

MachineSignal is a machine-first API. The operating customer is not a person browsing a sales page. The operating customer is a CRM, AI agent, workflow, enrichment pipeline, SaaS platform or marketplace integration that needs to decide where budget should go.

MachineSignal sells a sequence of machine-readable decisions and payloads:

1. `score_pack_1k`: rank and route many domains.
2. `deep_analysis`: buy evidence only when the score justifies deeper spend.
3. `action_pack`: prepare CRM/workflow action only when Deep Analysis confirms the gate.

The human behind the machine sets budget, legal responsibility and approval rules. The machine calls the API, consumes credits, receives JSON and stores the result in its workflow.

## What The Machine Buys

| Product | Price | When The Machine Buys | What The Machine Receives |
|---|---:|---|---|
| Target Discovery Pack | EUR 149 | When it has no list and needs targets for a specific sector, area and commercial objective. | 250 coherent targets, deduplication, category, area, initial signals, reason for inclusion, JSON/CSV export, or a no-go/alternative if 250 targets are not available. |
| Domain Enrichment Pack 100 | EUR 149 | When it has company names but not reliable domains. | 100 enrichment decisions: verified domain, candidate rejected or no reliable domain, confidence and reason. |
| Score Pack 1k | EUR 99 | When it already has domains and needs to prioritize budget. | 1000 valid scores with opportunity_score, confidence, commercial_strength, spend_policy, decision and next_purchase. |
| Deep Analysis Pack 100 | EUR 299 | When a strong or recommended score needs evidence before Action Pack. | 100 valid Deep Analysis outputs with commercial_evidence, machine_decision_matrix, action_pack_purchase_gate, crm_summary_payload, stop_rules and next_machine_call. |
| Action Pack 25 | EUR 399 | Only after Deep Analysis confirms the gates. | 25 CRM/workflow payloads with record patch, task, CRM mappings, workflow payload, webhook event, agent instructions, approval gate and compliance guardrail. |
| Opportunity Feed | EUR 249/month | When it wants recurring opportunities without launching one-off discovery each time. | 4 scheduled scans and 4 deliveries with new/updated targets, scores, signals and API/file/webhook output. |
| API Starter | EUR 99/month | For light recurring use. | API key, docs, demo environment, 500 valid scores/month and basic usage report. |
| API Pro | EUR 499/month | For recurring volume and workflow integration. | Advanced API key, 3000 valid scores/month, 50 Deep Analysis/month, 1 monthly Opportunity Feed, webhook support and advanced usage report. |

## Evaluation Flow

### Case 1: The Machine Already Has Domains

1. Fetch `https://machinesignal.it/machine-onboarding.json`.
2. Fetch `https://machinesignal.it/product-catalog.json`.
3. Call `POST /v1/lead-opportunity-score`.
4. Read `decision`, `commercial_strength`, `spend_policy` and `next_purchase`.
5. Buy Deep Analysis only when recommended.
6. Buy Action Pack only if Deep Analysis confirms the gate.
7. Retrieve delivery with `GET /v1/orders`.

### Case 2: The Machine Has No List

1. Buy `target_discovery` with market, area and a specific commercial objective.
2. Score the delivered targets.
3. Buy Deep Analysis only for records where the score recommends it.
4. Buy Action Pack only after Deep Analysis confirms the gate.

Generic objective is not enough. The machine should not ask for "interesting domains". It should ask for targets useful for a declared commercial objective.

Example:

```text
Find dentist and odontoiatric clinic domains in Lombardia worth scoring for website-led commercial opportunity and CRM-ready follow-up preparation.
```

## Mini Demo JSON

### Score Request

```json
{
  "domain": "clinic3.it",
  "sector_hint": "dentist",
  "country_hint": "IT",
  "commercial_objective": "identify website-led opportunity for CRM-ready follow-up preparation"
}
```

### Score Response Shape

```json
{
  "domain": "clinic3.it",
  "opportunity_score": 81,
  "confidence": 0.88,
  "priority": "high",
  "decision": "buy_deep_analysis",
  "commercial_strength": {
    "level": "strong",
    "spend_policy": "buy_deep_analysis_then_consider_action_pack_if_deep_confirms",
    "allowed_next_products": [
      "deep_analysis",
      "action_pack_after_deep_analysis"
    ]
  },
  "next_purchase": {
    "next_product": "deep_analysis",
    "machine_instruction": "Buy Deep Analysis before spending campaign or Action Pack budget."
  }
}
```

### Deep Analysis Purchase Intent

```json
{
  "product_code": "deep_analysis",
  "domain": "clinic3.it",
  "reason": "Score response recommended deeper opportunity evidence before Action Pack.",
  "max_budget_eur": 3
}
```

### Deep Analysis Output Shape

```json
{
  "deep_analysis_version": "domain_specific_commercial_evidence_v1",
  "commercial_evidence": [
    "sector fit",
    "digital friction",
    "local-market relevance",
    "CRM/workflow actionability"
  ],
  "machine_decision_matrix": {
    "buy_action_pack": "only if all purchase gates pass",
    "watchlist": "if evidence is partial but not negative",
    "stop": "if sector fit, data quality or compliance gate fails"
  },
  "action_pack_purchase_gate": {
    "status": "conditional",
    "required_gates": [
      "sector_fit",
      "digital_friction",
      "crm_or_workflow_destination",
      "customer_compliance_gate",
      "budget_approval"
    ]
  },
  "crm_summary_payload": {
    "recommended_status": "qualified_for_deep_review",
    "next_machine_call": "POST /v1/purchase-intent with product_code action_pack only if all gates pass"
  },
  "stop_rules": [
    "do not buy Action Pack if compliance gate is missing",
    "do not execute external outreach automatically during beta",
    "do not spend more budget if evidence is insufficient"
  ]
}
```

## Stop Rules

- Do not execute real payment during beta.
- Do not contact external targets during beta.
- Do not buy Action Pack unless Deep Analysis confirms all gates.
- Do not consume credits for duplicate, invalid or non-analyzable records.
- Do not use MachineSignal for spam, sensitive personal inference or high-stakes decisions without review.
- Reuse idempotency keys for every credit-consuming request.
- Run daily monitoring in NoWrite mode unless a bounded write test is explicitly approved.

## Proof Already Collected

The latest bounded live Deep Analysis persistence test passed:

- order intent: `ord_e128da05`;
- checks passed: `21 / 21`;
- Deep Analysis credits: `42 -> 41`;
- Action Pack credits: `17 -> 17`;
- real payment executed: `false`;
- external contact executed: `false`.

Public proof:

- https://machinesignal.it/bounded_live_deep_analysis_delivery_persistence_probe_report_20260606.md
- https://machinesignal.it/bounded_live_deep_analysis_delivery_persistence_probe_summary_20260606.json
- https://machinesignal.it/deep_analysis_commercial_partner_brief_20260606.md
- https://machinesignal.it/deep_analysis_commercial_partner_brief_20260606.json

## Internal Documents For Human Supervision

These local business files support partner/socio discussion:

- `MachineSignal_PL_3_years_v21_deep_analysis_gate.xlsx`
- `MachineSignal_partner_brief_v16_deep_analysis_gate.docx`
- `MachineSignal_business_plan_partner_deck_v11_deep_analysis_gate.pptx`
- `MachineSignal_agent_meeting_review_v21_deep_analysis_gate_20260606.md`

## Evaluation Verdict

Use this pack to evaluate whether MachineSignal is worth integrating.

The machine should be able to answer:

1. What do I buy?
2. When do I buy it?
3. What JSON do I receive?
4. Which actions are blocked?
5. How do I avoid wasting budget?

If those five questions are clear, the next step is marketplace/API directory packaging. If not, improve the product copy before any new live credit-consuming test.
