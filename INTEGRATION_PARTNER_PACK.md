# MachineSignal Integration Partner Pack

Status: beta integration pack for CRM systems, AI agents, RevOps workflows and software automations.

MachineSignal sells machine-readable decisions and deliverables. The customer
interface is a machine: a CRM, workflow engine, AI agent or software platform
that can discover the API, test it, buy bounded beta outputs and route the
result into its own system.

## Integration Goal

The integration should answer one of three operational questions:

1. Existing list: which domains in this list deserve budget?
2. No list: which targets should be discovered for this commercial objective?
3. Next action: what CRM or agent payload should be created after a confirmed opportunity?

The integration should not depend on human cold email as the primary channel.
Humans supervise, approve and audit.

## Entry Points

### Case 1: Customer Machine Has A List

Use when a CRM, enrichment pipeline or agent already has domains or company records.

Start with:

```text
POST /v1/lead-opportunity-score
```

Required input:

- `domain`
- `Idempotency-Key`
- `X-API-Key`

Recommended optional input:

- `sector_hint`
- `country_hint`
- `commercial_objective`
- `target_name`
- `area`
- `initial_signals`

Expected output:

- `opportunity_score`
- `confidence`
- `decision`
- `web_architect_review`
- `commercial_strength`
- `spend_policy`
- `next_purchase`
- `usage`

Machine action:

- discard weak targets;
- keep watchlist or nurture for medium/uncertain targets;
- buy `deep_analysis` only when the response recommends it.

### Case 2: Customer Machine Has No List

Use when the machine asks MachineSignal to find targets before scoring.

Start with:

```text
POST /v1/purchase-intent
```

Use:

```json
{
  "product_code": "target_discovery",
  "market": "dentists_odontoiatric_clinics",
  "area": "Lombardia",
  "commercial_objective": "find dentist and odontoiatric clinic domains worth scoring for website-led commercial opportunity and CRM-ready follow-up preparation"
}
```

The commercial objective is mandatory because "interesting domains" is not
specific enough. The machine must say what opportunity it wants to find.

Expected output:

- market availability pre-check;
- target list or no-go decision;
- target records with domain, category, area, initial signals and reason for inclusion;
- next machine call, usually `POST /v1/lead-opportunity-score`.

Machine action:

- score the delivered targets;
- stop if the market coverage decision says the pack is not available;
- widen area or criteria only if the response recommends it.

### Case 3: Customer Machine Wants A Next Action

Use after score and Deep Analysis confirm that a target deserves a prepared action.

Start with:

```text
POST /v1/purchase-intent
```

Use:

```json
{
  "product_code": "action_pack",
  "domain": "example.it",
  "source_score_request_id": "crm-import-20260603-row-0001",
  "reason": "Deep Analysis confirmed enough signal for a supervised CRM action."
}
```

Expected output:

- `crm_record_patch`
- `crm_task`
- `workflow_payload`
- `agent_instructions`
- `webhook_event`
- `approval_gate`
- `deduplication_key`
- `message_angle`
- `stop_rules`
- `compliance_guardrail`

Machine action:

- update CRM record;
- create internal task or workflow event;
- run customer compliance gate;
- do not send external outreach automatically during beta.

## Budget Rules

MachineSignal uses bounded beta purchase intents. In beta, no real payment is executed.

Recommended budget logic:

| Signal | Machine Decision | Allowed Spend |
|---|---|---|
| weak score, low confidence or failed Web Architect evidence | discard or watchlist | no add-on |
| medium signal | nurture or low-cost review | `nurture_signal` or `deep_analysis` only if recommended |
| strong signal and clear next product | buy bounded add-on | only `next_purchase.next_product` |
| Deep Analysis confirms but compliance gate is missing | hold | no Action Pack execution |
| Deep Analysis confirms and compliance gate exists | prepare action | `action_pack` |

Per-target beta cap:

- score: 1 valid score credit;
- deep analysis: buy only when `decision=buy_deep_analysis`;
- action pack: buy only after deep confirmation and compliance gate;
- repeated calls must reuse the same `Idempotency-Key` to avoid duplicate consumption.

## Deep Analysis As The Spend-Control Layer

Deep Analysis is the commercial bridge between score and Action Pack.

It is not a generic report for a human. It is a machine-readable decision pack
that tells the customer machine whether a record deserves more budget.

The delivery includes:

- `commercial_evidence`;
- `machine_decision_matrix`;
- `action_pack_purchase_gate`;
- `crm_summary_payload`;
- `signals_to_validate`;
- `stop_rules`;
- `next_machine_call`.

Commercial policy:

- if the score is weak, do not buy Deep Analysis;
- if the score is medium, buy Deep Analysis only when the score recommends it;
- if the score is strong, buy Deep Analysis before Action Pack;
- buy Action Pack only if Deep Analysis confirms sector fit, digital friction, CRM/workflow destination, compliance gate and budget approval;
- if any gate fails, stop or keep the record in watchlist.

Latest live evidence: order `ord_e128da05` persisted a Deep Analysis delivery
with `21 / 21` checks passed. Deep Analysis credits moved from `42` to `41`.
Action Pack credits stayed at `17`, which means the test bought only the
intermediate evidence layer and did not automatically buy the next product.

Partner-facing explanation:

- `https://machinesignal.it/deep_analysis_commercial_partner_brief_20260606.md`
- `https://machinesignal.it/deep_analysis_commercial_partner_brief_20260606.json`

## Required Headers

Protected calls require:

```text
X-API-Key: <customer_or_sandbox_key>
Idempotency-Key: <stable_request_id_for_credit_consuming_calls>
```

Use stable idempotency keys based on the customer's internal row id, domain and batch id.

Example:

```text
crm-import-20260603-row-0001-score
```

## Integration Outputs

MachineSignal outputs are JSON-first. A CRM or workflow should store:

- request id;
- domain;
- opportunity score;
- confidence;
- decision;
- commercial strength level;
- recommended next product;
- usage event;
- order intent id when a purchase intent is created;
- delivery payload.

## Guardrails

- Full API keys are not returned by local MCP adapter responses.
- The beta does not execute real payment.
- The beta does not contact external targets.
- Action Pack does not send email.
- External actions require the customer machine's compliance gate.
- Humans supervise, approve and audit.

## Public Machine Resources

- Integration pack JSON: `https://machinesignal.it/integration-partner-pack.json`
- MCP installation pack: `https://machinesignal.it/mcp-machine-client-installation-pack.json`
- Tool manifest: `https://machinesignal.it/mcp-tool-manifest.json`
- OpenAPI: `https://machinesignal.it/openapi.json`
- Product catalog: `https://machinesignal.it/product-catalog.json`
- Machine onboarding: `https://machinesignal.it/machine-onboarding.json`
