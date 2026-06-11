# MCP Agent Registry Draft Rehearsal NoWrite Probe

Evidence date: 2026-06-11

## Result

- Status: completed_mcp_agent_registry_draft_rehearsal_nowrite
- OK: true
- Mode: NoWriteMcpAgentRegistryDraftRehearsal
- Primary customer interface: machine
- Channels checked: mcp_tool_registry, agent_registry, local_mcp_adapter
- Resources checked: 28
- Checks failed: 0/180

## What Was Tested

This probe tested whether a machine can read the MachineSignal MCP and agent-registry assets without any irreversible action.

It checked:

- MCP/tool-registry private draft pack
- MCP/tool-registry NoWrite review
- Registry checklist and owner-approval gate
- Public MCP manifest and .well-known MCP manifest
- Local stdio MCP adapter evidence
- GitHub raw adapter files
- API marketplace and Postman NoWrite rehearsal dependencies
- Distribution monitor status

## Safety Result

- Write calls executed by this probe: 0
- POST calls executed by this probe: 0
- Hosted MCP live: false
- Hosted MCP endpoint published: false
- External publication executed: false
- Live monetization enabled: false
- Public paid plans enabled: false
- Real payment executed: false
- Real invoice issued: false
- Human outreach executed: false
- Production API key published: false

## Machine Interpretation

A machine can discover the MCP manifest, registry draft, local adapter and evidence chain. The current channel is usable for private machine rehearsal, but it is intentionally not a live hosted MCP product and not monetized.

## Recommended Next Step

Keep MCP/tool-registry as private draft/local adapter. Next decision: owner-supervised choice between building a hosted MCP endpoint or keeping local adapter and preparing unpublished registry metadata.

## Failed Checks

None.

## Checked Resources

- mcp_private_draft_pack: https://machinesignal.it/mcp_tool_registry_private_draft_pack_20260608.json (HTTP 200, ok=true, json=true)
- mcp_private_draft_pack_md: https://machinesignal.it/mcp_tool_registry_private_draft_pack_20260608.md (HTTP 200, ok=true, json=false)
- mcp_private_draft_review: https://machinesignal.it/mcp_tool_registry_private_draft_review_summary_20260608.json (HTTP 200, ok=true, json=true)
- mcp_private_draft_review_md: https://machinesignal.it/mcp_tool_registry_private_draft_review_report_20260608.md (HTTP 200, ok=true, json=false)
- mcp_registry_checklist: https://machinesignal.it/mcp_tool_registry_draft_checklist_20260607.json (HTTP 200, ok=true, json=true)
- mcp_registry_checklist_md: https://machinesignal.it/mcp_tool_registry_draft_checklist_20260607.md (HTTP 200, ok=true, json=false)
- mcp_manifest: https://machinesignal.it/mcp-tool-manifest.json (HTTP 200, ok=true, json=true)
- well_known_mcp_manifest: https://machinesignal.it/.well-known/mcp-tool-manifest.json (HTTP 200, ok=true, json=true)
- mcp_wrapper: https://machinesignal.it/mcp/machinesignal-mcp-wrapper.json (HTTP 200, ok=true, json=true)
- mcp_landing: https://machinesignal.it/mcp/ (HTTP 200, ok=true, json=false)
- mcp_installation_pack: https://machinesignal.it/mcp-machine-client-installation-pack.json (HTTP 200, ok=true, json=true)
- mcp_installation_md: https://machinesignal.it/MCP_MACHINE_CLIENT_INSTALLATION.md (HTTP 200, ok=true, json=false)
- mcp_contract_md: https://machinesignal.it/MCP_TOOL_CONTRACT.md (HTTP 200, ok=true, json=false)
- mcp_adapter_server_raw: https://raw.githubusercontent.com/machinesignal-it/machinesignal-lead-opportunity-score/main/mcp_adapter/machinesignal_mcp_server.py (HTTP 200, ok=true, json=false)
- mcp_adapter_config_raw: https://raw.githubusercontent.com/machinesignal-it/machinesignal-lead-opportunity-score/main/mcp_adapter/mcp_client_config.example.json (HTTP 200, ok=true, json=true)
- mcp_adapter_readme_raw: https://raw.githubusercontent.com/machinesignal-it/machinesignal-lead-opportunity-score/main/mcp_adapter/README.md (HTTP 200, ok=true, json=false)
- mcp_local_adapter_validation: https://machinesignal.it/mcp_local_adapter_nowrite_validation_summary_20260610.json (HTTP 200, ok=true, json=true)
- mcp_purchase_decision_probe: https://machinesignal.it/mcp_purchase_decision_probe_summary_20260610.json (HTTP 200, ok=true, json=true)
- mcp_verification_gate_probe: https://machinesignal.it/mcp_verification_gate_probe_summary_20260610.json (HTTP 200, ok=true, json=true)
- mcp_full_chain_idempotency_probe: https://machinesignal.it/mcp_full_chain_idempotency_probe_summary_20260611.json (HTTP 200, ok=true, json=true)
- api_marketplace_rehearsal_dependency: https://machinesignal.it/api_marketplace_draft_rehearsal_nowrite_probe_summary_20260611.json (HTTP 200, ok=true, json=true)
- postman_rehearsal_dependency: https://machinesignal.it/postman_private_workspace_rehearsal_nowrite_probe_summary_20260611.json (HTTP 200, ok=true, json=true)
- distribution_monitor: https://machinesignal.it/distribution_readiness_monitor_summary_20260607.json (HTTP 200, ok=true, json=true)
- machine_discovery: https://machinesignal.it/.well-known/machine-discovery.json (HTTP 200, ok=true, json=true)
- machine_onboarding: https://machinesignal.it/machine-onboarding.json (HTTP 200, ok=true, json=true)
- llms: https://machinesignal.it/llms.txt (HTTP 200, ok=true, json=false)
- robots: https://machinesignal.it/robots.txt (HTTP 200, ok=true, json=false)
- sitemap: https://machinesignal.it/sitemap.xml (HTTP 200, ok=true, json=false)
