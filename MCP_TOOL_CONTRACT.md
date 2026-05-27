# MCP Tool Contract

Status: draft contract. MCP server is not public yet.

## Tool

score_lead_opportunity

Scores a business domain and returns a structured opportunity signal for CRM, RevOps and AI-agent workflows.

## Input

- domain: business domain without protocol
- sector_hint: optional sector hint
- country_hint: optional country hint

## Output

- domain
- opportunity_score: 0-100
- confidence: 0-1
- priority: low, medium or high
- reason
- recommended_action
- beta

## API Mapping

POST https://api.machinesignal.it/v1/lead-opportunity-score

Auth header: X-API-Key

OpenAPI: https://machinesignal.it/openapi.json

## Constraints

The public endpoint is not live yet. Beta API key required. Public examples are synthetic. MachineSignal does not sell lead lists and does not run outreach automation.

## Beta Access

Request access at beta@machinesignal.it.
