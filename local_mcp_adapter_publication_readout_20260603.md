# MachineSignal - Local MCP Adapter Publication Readout

Finished at: 2026-06-03T10:20:00

## Result

Status: passed

The public machine-discovery assets now state that MachineSignal has a local stdio MCP-style adapter available in the GitHub repository.

## Published Resources

| Resource | Status | Adapter Reference |
|---|---|---|
| `https://machinesignal.it/mcp-tool-manifest.json` | HTTP 200 | present |
| `https://machinesignal.it/.well-known/mcp-tool-manifest.json` | HTTP 200 | present |
| `https://machinesignal.it/.well-known/machine-discovery.json` | HTTP 200 | present |
| `https://machinesignal.it/machine-discovery/machine-discovery-pack.json` | HTTP 200 | present |

## Adapter Reference

- Repository: `https://github.com/machinesignal-it/machinesignal-lead-opportunity-score`
- Adapter path: `mcp_adapter/machinesignal_mcp_server.py`
- Start command: `python mcp_adapter/machinesignal_mcp_server.py`
- Smoke test report: `mcp_adapter_smoke_test_readout_20260603.md`

## Guardrails

- The public hosted MCP server is not claimed as live.
- The local adapter is documented as an adapter/wrapper for the live HTTP beta API.
- Full API keys are not returned to the MCP client.
- No real payment is executed in beta.
- No external contact is executed in beta.
