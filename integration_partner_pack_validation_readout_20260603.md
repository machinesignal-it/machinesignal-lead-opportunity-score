# MachineSignal - Integration Partner Pack Validation Readout

Finished at: 2026-06-03T11:12:08

## Result

Status: passed

## Checks

| Check | Result | Details |
|---|---|---|
| file_exists:INTEGRATION_PARTNER_PACK.md | OK | C:\Users\natal\AppData\Local\Temp\MachineSignal\github_repo_sync_20260530\INTEGRATION_PARTNER_PACK.md |
| file_exists:integration-partner-pack.json | OK | C:\Users\natal\AppData\Local\Temp\MachineSignal\github_repo_sync_20260530\integration-partner-pack.json |
| file_exists:integration_existing_list_score_request.json | OK | C:\Users\natal\AppData\Local\Temp\MachineSignal\github_repo_sync_20260530\examples\integration_existing_list_score_request.json |
| file_exists:integration_no_list_target_discovery_request.json | OK | C:\Users\natal\AppData\Local\Temp\MachineSignal\github_repo_sync_20260530\examples\integration_no_list_target_discovery_request.json |
| file_exists:integration_action_pack_crm_payload.json | OK | C:\Users\natal\AppData\Local\Temp\MachineSignal\github_repo_sync_20260530\examples\integration_action_pack_crm_payload.json |
| pack_type | OK | integration_partner_pack |
| machine_interface | OK | machine |
| three_cases_present | OK | customer_has_existing_list,customer_has_no_list,customer_wants_action_payload |
| budget_rules_present | OK | 5 |
| guardrail_no_payment | OK | False |
| guardrail_no_external_contact | OK | False |
| existing_list_uses_score_endpoint | OK | https://machinesignal-api.beta-878.workers.dev/v1/lead-opportunity-score |
| no_list_uses_target_discovery | OK | target_discovery |
| action_pack_requires_approval_gate | OK | approval_gate.required |

## Interpretation

The integration pack is ready for machine clients and technical partners. It covers existing-list scoring, no-list target discovery, CRM/action payload preparation, budget rules and beta guardrails.
