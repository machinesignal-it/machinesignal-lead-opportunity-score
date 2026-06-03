# MachineSignal - MCP Client Installation Validation Readout

Finished at: 2026-06-03T10:49:18

## Result

Status: passed

This validation checks that a machine client can start the local MCP adapter and read public MachineSignal tools without consuming credits.

## Checks

| Check | Result | Details |
|---|---|---|
| adapter_file_exists | OK | C:\Users\natal\AppData\Local\Temp\MachineSignal\github_repo_sync_20260530\mcp_adapter\machinesignal_mcp_server.py |
| client_config_exists | OK | C:\Users\natal\AppData\Local\Temp\MachineSignal\github_repo_sync_20260530\mcp_adapter\mcp_client_config.example.json |
| client_config_has_machinesignal_server | OK | mcpServers.machinesignal |
| mcp_initialize | OK | {'name': 'machinesignal-local-mcp-adapter', 'version': '2026-06-03'} |
| mcp_tools_list | OK | 11 tools |
| credit_tools_present_but_not_called | OK | score and purchase tools listed only |
| public_catalog_read | OK | HTTP 200 |
| public_onboarding_read | OK | HTTP 200 |
| dentists_beta_pack_read | OK | HTTP 200 |

## Guardrails

- Sandbox customer created: `False`
- Credit-consuming calls executed: `False`
- Real payment executed: `False`
- External contact executed: `False`

## Interpretation

The installation is ready for a machine client to connect. The next optional step is the full buyer-machine test, which uses sandbox credits.
