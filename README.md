# MachineSignal Lead Opportunity Score API

Machine-readable lead opportunity scoring for CRM systems, RevOps workflows and AI agents.

MachineSignal is a private technical beta. It helps automated systems decide which business domains may deserve deeper commercial analysis by returning a structured score, confidence level, reasons and a recommended next action.

## What It Does

Given a business domain, the API returns a machine-readable opportunity signal:

```json
{
  "domain": "localclinic.example",
  "opportunity_score": 82,
  "confidence": 0.74,
  "priority": "high",
  "reason": "Weak conversion paths and limited structured data.",
  "recommended_action": "request_deep_analysis",
  "beta": true
}
```

Higher scores indicate stronger potential opportunity for analysis or follow-up. Scores are signals, not guarantees.

## Designed For Machines

MachineSignal is built for workflows where the first user is not a human browsing a website, but a system deciding what to do next:

- CRM enrichment pipelines
- RevOps automation
- AI-agent workflows
- lead routing systems
- data quality and prioritization queues
- API marketplaces and integration platforms

The output is structured so downstream systems can use it directly.

## Public Technical Resources

- Website: https://machinesignal.it/
- API overview: https://machinesignal.it/api/
- Beta access: https://machinesignal.it/beta/
- OpenAPI schema: https://machinesignal.it/openapi.json
- LLM discovery file: https://machinesignal.it/llms.txt
- Beta metadata: https://machinesignal.it/beta-access.json
- Synthetic response example: https://machinesignal.it/api/lead-opportunity-score/example.json

## Endpoint

The current beta endpoint is available for technical testing:

```text
POST https://machinesignal-api.beta-878.workers.dev/v1/lead-opportunity-score
```

Example request:

```bash
curl -X POST "https://machinesignal-api.beta-878.workers.dev/v1/lead-opportunity-score" \
  -H "Content-Type: application/json" \
  -d '{"domain":"localclinic.example","sector_hint":"healthcare","country_hint":"IT"}'
```

The beta endpoint uses synthetic scoring logic. It does not scrape websites, sell lead lists, send outreach or expose private data.

## Beta Access

To request beta access, contact:

```text
beta@machinesignal.it
```

Suggested subject:

```text
MachineSignal beta access request
```

Useful details to include:

- company or workflow name
- CRM or automation stack
- use case
- expected monthly score volume
- contact email

## Status

Private technical beta.

Public examples are synthetic. The API contract may change while beta users validate the score format, recommended actions and pricing model.

## Planned Pricing Model

The planned commercial model is:

1. Pay per score
2. Score packages
3. Monthly subscription for higher-volume users

No public paid plan is active yet.

## Responsible Use

MachineSignal is not a spam engine and does not provide automated outreach. It is a scoring and prioritization API for compliant business workflows.

Do not use the service to generate spam, infer sensitive personal data, bypass consent requirements or make high-stakes decisions without human review.
