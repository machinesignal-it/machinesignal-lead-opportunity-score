# MachineSignal - Pre-Monetization Readiness Control

Generated at: 2026-06-03

## Executive Result

Status: not ready for real payments.

Machine-to-machine controlled beta is technically usable. Real monetization must remain blocked until fiscal, legal, billing, data-retention and post-sale controls are completed and approved.

This is an operational control, not tax or legal advice. The fiscal and legal gates must be validated by a commercialista and a legal/privacy advisor before enabling paid production.

## Why This Control Exists

MachineSignal is designed to sell to customer machines: CRM systems, AI agents, RevOps workflows and software automations. These systems can discover the API, create or receive an API key, consume credits, buy beta order intents, retrieve orders and reconcile usage.

The technical beta has passed the core machine tests:

- external-agent discovery and purchase flow passed;
- Durable Object ledger audit passed;
- controlled beta operational readiness passed;
- real payments remain disabled;
- external contact remains disabled.

That is enough for controlled beta testing. It is not enough for paid commercial launch.

## Gate Decision

Do not enable real payments yet.

Allowed now:

- public machine discovery;
- sandbox testing;
- private beta keys;
- simulated beta purchase-intent;
- beta usage, orders and audit reporting;
- partner/technical evaluation without charging money.

Blocked now:

- real card payments;
- automatic subscription activation;
- paid invoice issuance;
- production paid customer onboarding;
- public marketplace listing with paid checkout;
- automatic renewals;
- any external outreach executed by the system.

## Readiness Gate Matrix

| Gate | Area | Status | Why | Required Before Real Payment | Owner Agent |
|---|---|---|---|---|---|
| G1 | Machine buyer flow | Pass | Discovery, sandbox, scoring, purchase-intent, orders and usage have passed live tests. | Keep daily monitor active. | Orchestratore, API Product Manager |
| G2 | Ledger and audit | Pass for beta | Durable Object ledger reconciles credits, orders and simulated revenue. | Add long-term reporting/export before paid scale. | Admin & Finance Controller, Scoring Optimizer |
| G3 | Fiscal identity | Blocker | The business is not yet fiscally ready to issue paid invoices from the project. | Confirm legal/fiscal setup, Partita IVA/VAT position, invoice issuer and tax regime with commercialista. | Admin & Finance Controller |
| G4 | Electronic invoicing | Blocker | Paid Italian B2B/B2C flows need an invoice process, not only API orders. | Select invoicing process/provider, map API order to invoice, define receipt/fattura timing and conservation. | Admin & Finance Controller |
| G5 | Payment provider | Blocker | Payment is intentionally disabled and no production checkout reconciliation exists. | Configure provider in test mode first, then production only after fiscal/legal approval. | Billing & Payment Ops Agent |
| G6 | Terms of service | Blocker | Customer machines need binding rules: service limits, no guarantees, credit validity, refunds, acceptable use and API responsibilities. | Draft and approve terms for API, credits, beta status, automated use and limitation of liability. | Legal & Compliance Agent |
| G7 | Privacy and data roles | Blocker | Lead/domain data may include business and possibly personal data depending on inputs. Roles, purposes and processor/controller obligations must be clear. | Privacy policy, DPA template if needed, data categories, lawful basis, retention, deletion and sub-processors. | Legal & Compliance Agent, Data Quality & Compliance |
| G8 | Cookie/site compliance | Partial | The public site is simple, but privacy/cookie/accessibility notices should be verified before commercial launch. | Publish privacy notice and cookie notice/banner only if tracking cookies or analytics are used. | Legal & Compliance Agent, Architetto Web AI |
| G9 | Data retention | Blocker | The beta ledger works, but paid production needs documented retention, deletion and export rules. | Define retention windows for API logs, orders, customer records, scoring inputs and audit data. | Data Quality & Compliance, Admin & Finance Controller |
| G10 | Refund/credit correction | Blocker | The API has valid-output credit logic, but paid customers need clear remedies. | Define refund, credit top-up, invalid output, dispute and SLA rules. | Customer Success & Post-Sale Agent, Admin & Finance Controller |
| G11 | Abuse and rate limits | Partial | Sandbox limits exist, but paid plan limits and misuse rules need production policy. | Add plan limits, alert thresholds, abuse suspension and high-volume approval rules. | Security & Abuse Guard Agent, API Product Manager |
| G12 | Customer support automation | Partial | Usage and order retrieval exist. Post-sale handling must be automated end to end. | Add support intake, incident status, credit correction workflow and customer-facing machine status output. | Customer Success & Post-Sale Agent |
| G13 | Commercial reporting | Partial | Simulated revenue is tracked in audit, but paid P&L needs invoice/payment reconciliation. | Connect order, payment, invoice, credit ledger and revenue report. | Admin & Finance Controller, Business Analyst Agent |
| G14 | Human supervision limit | Pass if gates stay automated | The model still fits the 1-2 hour/day supervision target if agents handle monitoring and exceptions. | Build exception dashboard so the user sees only blockers and approvals. | Orchestratore |

## Non-Negotiable Blockers

Real payments stay disabled until all of these are true:

1. Fiscal setup is approved.
2. Invoice process is ready.
3. Payment provider is configured and reconciled in test mode.
4. Terms of service are approved.
5. Privacy/DPA/retention rules are approved.
6. Refund and credit correction policy is approved.
7. A paid test in test mode reconciles order, payment, invoice placeholder, credit ledger and audit report.

## Machine-Facing Commercial Rule

The API can continue to expose products and prices, but the machine-facing payment state must remain:

```json
{
  "payment_mode": "purchase_intent_only",
  "real_payment_executed": false,
  "ready_for_real_payments": false,
  "allowed_use": "technical_beta_and_partner_evaluation"
}
```

When the gates are approved, the state can move to:

```json
{
  "payment_mode": "paid_checkout_enabled",
  "real_payment_executed": "only_after_customer_machine_or_authorized_operator_approval",
  "ready_for_real_payments": true
}
```

## Agent Additions Recommended

The existing agent team should be extended with these operational roles if not already formalized:

- Billing & Payment Ops Agent: checkout, payment provider, failed payments, reconciliation.
- Legal & Compliance Agent: terms, privacy, DPA, retention, acceptable use.
- Security & Abuse Guard Agent: rate limits, misuse detection, key suspension, abnormal spend.
- Customer Success & Post-Sale Agent: support, credit corrections, post-sale machine responses.
- Admin & Finance Controller: invoice mapping, revenue reports, P&L controls, tax advisor handoff.

## 7-Day Practical Plan

Day 1: freeze real-payment guardrail and publish pre-monetization status.

Day 2: draft terms of service, privacy policy, DPA skeleton and acceptable-use policy.

Day 3: define fiscal and invoice workflow with commercialista: who invoices, which data is needed, when an invoice is created, and how records are conserved.

Day 4: choose payment provider in test mode and define checkout objects: pay-per-score, score packs, add-ons and subscription.

Day 5: build payment-test ledger mapping: order intent, payment intent, invoice placeholder, credit activation, usage and audit.

Day 6: run fake paid checkout test in provider test mode only.

Day 7: produce go/no-go report. If any blocker remains, keep beta as purchase-intent only.

## Official Reference Links

- Agenzia delle Entrate, Fatturazione elettronica: https://www1.agenziaentrate.gov.it/web_app_entrate/fatturazione_elettronica.html
- GDPR Regulation (EU) 2016/679: https://eur-lex.europa.eu/eli/reg/2016/679/oj
- European Commission, controller/processor roles: https://commission.europa.eu/law/law-topic/data-protection/rules-business-and-organisations/obligations/controllerprocessor/what-data-controller-or-processor_en
- Garante Privacy, cookie guidelines: https://www.garanteprivacy.it/home/docweb/-/docweb-display/docweb/9679893
