# MachineSignal Deep Analysis Commercial Partner Brief

Status: partner-facing commercial brief for the machine-first beta.

Date: 2026-06-06

## Simple Summary

MachineSignal sells decisions and delivery payloads to machines, not to a person reading a normal website.

The customer interface is a CRM, AI agent, RevOps workflow, enrichment pipeline or software platform. That machine may already have a list of domains, or it may ask MachineSignal to find targets for a declared commercial objective.

The commercial ladder is:

1. `score_pack_1k`: screen many domains cheaply.
2. `deep_analysis`: buy evidence only for the strongest or most uncertain opportunities.
3. `action_pack`: buy a CRM/workflow action payload only after Deep Analysis says the spend is justified.

The important point is that Deep Analysis is not a generic report. It is a spend-control product. It tells the customer machine whether to buy the next product, hold the record in watchlist or stop spending.

## What We Sell

### Score Pack

The machine sends a domain and receives:

- opportunity score;
- confidence;
- commercial strength;
- decision;
- recommended next product;
- usage and credit event.

The Score Pack is useful when the machine has many records and needs to decide where attention and budget should go.

### Deep Analysis

Deep Analysis is bought only after a score suggests enough potential.

It returns:

- `commercial_evidence`: what evidence makes this target commercially relevant;
- `machine_decision_matrix`: when to buy Action Pack, when to watchlist, when to stop;
- `action_pack_purchase_gate`: the required checks before spending on Action Pack;
- `crm_summary_payload`: compact fields for CRM or workflow storage;
- `sector_context`: why the sector matters for the declared objective;
- `signals_to_validate`: checks the customer machine should run before more spend;
- `stop_rules`: conditions where the workflow must stop;
- `next_machine_call`: the next endpoint or action the machine should take.

Deep Analysis has one job: protect the customer machine from wasting money on Action Pack when the evidence is not strong enough.

### Action Pack

Action Pack is bought only after Deep Analysis confirms that the lead deserves an operational action.

It returns:

- CRM record patch;
- CRM task;
- CRM platform mappings;
- workflow payload;
- webhook event;
- agent instructions;
- approval gate;
- stop rules;
- compliance guardrail.

Action Pack prepares internal CRM/workflow execution. It does not send external outreach automatically during beta.

## Customer Machine Scenarios

### Case 1: The Customer Machine Has A List

Example: a CRM has 1000 companies or domains.

The machine asks:

```text
Which records are worth budget for my declared commercial objective?
```

Flow:

1. Call `POST /v1/lead-opportunity-score`.
2. Discard weak records.
3. Put uncertain records in watchlist or nurture.
4. Buy Deep Analysis only when recommended.
5. Buy Action Pack only if Deep Analysis confirms the purchase gate.

### Case 2: The Customer Machine Has No List

Example: an agent wants useful targets in a sector and geography.

The machine asks:

```text
Find companies or domains useful for this commercial objective, sector and area.
```

The commercial objective is mandatory. "Interesting domains" is not enough. The machine must say why the targets are needed.

Example objective:

```text
Find dentist and odontoiatric clinic domains in Lombardia worth scoring for website-led commercial opportunity and CRM-ready follow-up preparation.
```

Flow:

1. Buy `target_discovery`.
2. Receive target records or a no-go market coverage decision.
3. Score delivered domains.
4. Buy Deep Analysis only for records where the score recommends it.
5. Buy Action Pack only after Deep Analysis confirms the gate.

### Case 3: The Customer Machine Wants An Action

Example: a RevOps workflow wants to update CRM and prepare a supervised next step.

The machine asks:

```text
Create a CRM/workflow payload for this confirmed opportunity.
```

Flow:

1. Verify that Score and Deep Analysis support the action.
2. Buy `action_pack`.
3. Store CRM record patch, task, webhook event and approval gate.
4. Keep external outreach blocked unless the customer's own compliance gate allows it.

## Commercial Proof From Latest Beta Test

The latest bounded live Deep Analysis persistence probe passed.

Evidence:

- order intent: `ord_e128da05`;
- product: `deep_analysis`;
- delivery version: `domain_specific_commercial_evidence_v1`;
- checks passed: `21 / 21`;
- Deep Analysis credits: `42 -> 41`;
- Action Pack credits: `17 -> 17`;
- real payment executed: `false`;
- external contact executed: `false`;
- persisted delivery included commercial evidence, decision matrix, Action Pack gate and CRM summary payload.

Public proof:

- report: https://machinesignal.it/bounded_live_deep_analysis_delivery_persistence_probe_report_20260606.md
- JSON summary: https://machinesignal.it/bounded_live_deep_analysis_delivery_persistence_probe_summary_20260606.json
- CSV rows: https://machinesignal.it/bounded_live_deep_analysis_delivery_persistence_probe_rows_20260606.csv

This proves that the beta can persist a paid Deep Analysis delivery with the upgraded commercial fields. It does not yet prove full market demand, so the next work should update partner materials, pricing logic and the P&L rather than spend more live credits.

## Why This Matters Commercially

Without Deep Analysis, a customer machine could move too quickly from score to Action Pack and spend money on weak or unclear opportunities.

With Deep Analysis:

- the machine has a reason to buy an intermediate paid product;
- Action Pack becomes conditional, not automatic;
- the customer gets a traceable audit of why budget was or was not spent;
- CRM workflows can store the reasoning in structured fields;
- MachineSignal can sell multiple levels of value without relying on a human sales call.

## Recommended Machine Buying Policy

```text
If score is weak: discard or watchlist.
If score is medium: nurture, verify or buy Deep Analysis only when recommended.
If score is strong: buy Deep Analysis.
If Deep Analysis confirms sector fit, digital friction, CRM destination, compliance gate and budget approval: buy Action Pack.
If any gate fails: stop or keep in watchlist.
```

## Current Limits

- Beta purchase intents consume credits but do not execute real payments.
- External outreach is blocked in beta.
- Deep Analysis is a decision and evidence layer, not a promise that a target will buy.
- Customer machines must still apply their own compliance rules before any external action.

## Next Commercial Step

Stop additional live credit-consuming probes for now.

Use this evidence to update:

- partner brief;
- business plan;
- P&L and pricing assumptions;
- product catalog language;
- machine onboarding and distribution copy.

The next live test should happen only after the commercial materials clearly explain what the machine buys, when it buys it and why each purchase protects budget.
