# Public Machine Readability Probe

Date: 2026-06-13

Status: passed

This probe simulates a machine evaluator reading MachineSignal's public assets without human explanation.

## Result

- resources checked: 10
- checks total: 97
- checks failed: 0
- write calls executed: 0
- post calls executed: 0
- real payment executed: false
- human outreach executed: false
- external publication executed: false

## Category Scores

- discoverability: 100% (26/26)
- commercial_clarity: 100% (43/43)
- technical_actionability: 100% (26/26)
- safety_boundedness: 100% (4/4)

## Machine Decision

- existing list: score_pack_1k via POST /v1/lead-opportunity-score
- no list: target_discovery via POST /v1/purchase-intent
- next action: action_pack via POST /v1/purchase-intent
- MCP client: manifest/tools understood

## Interpretation

A machine evaluator can discover the service, understand the main buying scenarios, identify the right products and map them to OpenAPI or MCP-readable actions without human outreach.

## Next

Allowed: run_agent_go_no_go_review_for_soft_go_live_readiness

Blocked if failed: repair_public_docs_machine_clarity_before_any_soft_go_live_review

## Failed Checks

None.
