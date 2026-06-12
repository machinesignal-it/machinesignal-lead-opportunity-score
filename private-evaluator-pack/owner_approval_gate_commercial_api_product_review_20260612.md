# MachineSignal Owner Approval Gate Review

Role: Commercial/API Product Agent

Date: 2026-06-12

Scope: evaluate whether the Private Evaluator Pack explains what MachineSignal sells to machines, when each product should be bought, what is missing before future monetization, and which product improvement should come next.

Status boundary: NoSend / NoWrite / NoPayment / NoLiveSales / NoPersonalData.

## Verdict

GO for draft presentable to the owner and internal agents.

NO-GO for live monetization, real external distribution, paid marketplace submission, live checkout, or production customer onboarding.

The pack is commercially understandable enough to continue the controlled testing path. It explains the core model: MachineSignal sells machine-readable commercial decisions to CRMs, AI agents, workflows, API clients, and software platforms.

It is not yet ready to sell live because billing, legal terms, customer-visible usage ledger, pricing proof, product selector UX, and value proof still need to be tightened.

## What Is Clear

1. The customer interface is clear.
   The operating buyer is the machine: CRM, AI agent, workflow, API client, or software platform.

2. The main decision split is clear.
   If the machine has no list, it should start with Target Discovery. If it already has domains or companies, it should start with Score Pack.

3. The upgrade path is mostly clear.
   Score Pack can lead to Deep Analysis, and Deep Analysis can lead to Action Pack only when evidence confirms the opportunity.

4. The safety boundary is clear.
   The pack correctly blocks real sends, writes, payments, invoices, production keys, customer accounts, and personal data.

## Product-By-Product Review

### Target Discovery Pack 250

Commercial clarity: GO.

When to buy: when the machine has no starting list and needs coherent targets for a sector, area, and commercial objective.

What the machine buys: exactly 250 coherent target records if the market pre-check passes. If not, the pack does not activate and suggests alternatives.

Main strength: solves the "no list" problem. This is important because many machines will not arrive with a clean lead list.

Main risk: the pack must prove that the 250 targets are not generic names. They must be coherent with a declared commercial objective.

Future monetization need: a clear market pre-check contract, delivery timing, source policy, and quality guarantee for what counts as a coherent target.

### Score Pack 1k

Commercial clarity: GO.

When to buy: when the machine already has domains or companies and needs prioritization.

What the machine buys: exactly 1000 valid scores. Invalid, duplicate, or non-analyzable records do not count as valid score credits.

Main strength: simple, measurable, and easy for a machine to understand.

Main risk: a score alone may feel like a commodity unless the output includes confidence, decision, reason, spend policy, and next recommended product.

Future monetization need: calibration evidence, score examples, benchmark samples, and clear proof that high scores correlate with better commercial prioritization.

### Deep Analysis Pack 100

Commercial clarity: GO with improvement needed.

When to buy: after a strong score, when the machine needs evidence before buying an Action Pack or spending more budget.

What the machine buys: 100 valid deep analyses with evidence, decision matrix, stop rules, CRM summary, and next machine call.

Main strength: this is where MachineSignal can escape the "generic score" problem. Deep Analysis is the bridge between score and operational action.

Main risk: the value can sound abstract if the pack does not show a concrete example of the evidence matrix and decision gate.

Future monetization need: include one fully worked synthetic Deep Analysis output, with evidence fields, action gate, limitations, and final recommendation.

### Action Pack 25

Commercial clarity: GO with improvement needed.

When to buy: only after Deep Analysis confirms that a lead deserves an operational action.

What the machine buys: 25 CRM/workflow action payloads with approval gate, webhook/event schema, task payload, agent instruction, compliance guardrail, and stop rules.

Main strength: this is a high-value product because it gives the machine something operational, not just information.

Main risk: if the pack does not show a concrete payload, the buyer machine may not understand why Action Pack costs more than Deep Analysis.

Future monetization need: include one fully worked synthetic Action Pack output with CRM patch, workflow payload, webhook event, approval gate, and no-human-outreach guardrail.

### API Starter Monthly

Commercial clarity: GO for concept, NO-GO for live sale.

When to buy: light recurring API access and ongoing testing.

What the machine buys: 500 valid scores/month, demo environment, documentation, and basic usage report.

Main strength: simple entry-level recurring plan.

Main risk: live monthly subscription requires billing, VAT/legal handling, customer-visible usage tracking, API key management, rate limits, overage rules, and support expectations.

Future monetization need: make it a simulated plan until checkout, terms, limits, and usage ledger are production-ready.

### API Pro Monthly

Commercial clarity: GO for concept, NO-GO for live sale.

When to buy: recurring workflow volume, CRM/API platform use, webhook support, and higher monthly usage.

What the machine buys: 3000 valid scores/month, 50 Deep Analysis outputs/month, 1 monthly Opportunity Feed, webhook support, priority processing, and advanced usage report.

Main strength: this is the scalable product if machines start integrating repeatedly.

Main risk: EUR 499/month may be too low if data provider costs, agent runtime, webhook support, and deep analysis quality checks are expensive.

Future monetization need: validate unit economics before offering this live.

## What Is Missing For Future Monetization

1. Product selector contract.
   A machine-readable selector should map the buyer state to the correct product: no list, has list, weak domains, high score, confirmed evidence, recurring volume.

2. Concrete output samples.
   The pack needs one complete sample for Target Discovery, Score Pack, Deep Analysis, Action Pack, API Starter usage report, and API Pro usage report.

3. Pricing proof.
   The current prices are reasonable planning assumptions, but need unit-economics validation: data costs, agent runtime, Cloudflare/KV costs, failed-record rates, and support cost.

4. Usage ledger visible to the buyer machine.
   Future customers need machine-readable usage: request_id, product_code, valid outputs, excluded records, credits consumed, credits remaining, and reason.

5. Billing and legal readiness.
   Live sale requires terms, payment flow, invoice/VAT handling, refund or replacement rule for invalid outputs, privacy wording, and limits of responsibility.

6. Clear no-human-outreach rule in commercial outputs.
   Since the business is machine-first, commercial outputs must prepare machine actions, not manual email campaigns to humans.

7. Go-live quality thresholds.
   Before monetization, define minimum pass thresholds for validity rate, duplicate rate, cost per valid output, latency, error rate, and confidence distribution.

## Price And Value Risks

1. Too many products can confuse a machine.
   The pack should include a stronger product decision tree to prevent wrong product selection.

2. Score Pack can look too cheap or too generic.
   The value is not just the score. The value is priority, confidence, spend policy, next product, and traceable decision.

3. Deep Analysis and Action Pack must show concrete value.
   Without full examples, they risk sounding like generic reports.

4. Target Discovery has hidden cost risk.
   If sourcing targets requires paid data or heavy agent work, EUR 149 may be too low unless the pre-check and delivery rules are strict.

5. API Pro needs margin validation.
   3000 scores, 50 deep analyses, webhook support, and feed delivery may be strong commercially, but only if infrastructure and agent costs stay controlled.

## Recommended Next Product Improvement

Create a Product Selector Contract for machines.

Recommended artifact:

`private-evaluator-pack/product_selector_contract.json`

It should let a machine answer:

- Do I have a list?
- Do I have reliable domains?
- Do I need only prioritization?
- Do I need evidence before spending more?
- Do I need an operational CRM/workflow payload?
- Do I need recurring access?

Expected output:

- recommended_product_code;
- reason;
- required_inputs;
- expected_outputs;
- simulated_price_eur;
- blocked_actions;
- next_allowed_products;
- why_not_other_products.

## Final Commercial/API Product Verdict

The pack is strong enough as an internal owner approval draft.

It is not yet strong enough for monetization or external distribution.

Next step: add the Product Selector Contract and one fully worked synthetic output for Deep Analysis and Action Pack. This will make the business model easier for machines to understand and will reduce confusion before the next approval gate.
