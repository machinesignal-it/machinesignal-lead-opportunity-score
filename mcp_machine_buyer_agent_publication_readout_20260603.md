# MachineSignal - MCP Machine Buyer Agent Publication Readout

Finished at: 2026-06-03T10:36:00

## Result

Status: passed

The public machine-discovery assets now reference the MachineSignal local MCP client configuration and machine-buyer agent runner.

## Published Resources

| Resource | Status | Buyer Agent Reference |
|---|---|---|
| `https://machinesignal.it/mcp-tool-manifest.json` | HTTP 200 | present |
| `https://machinesignal.it/.well-known/mcp-tool-manifest.json` | HTTP 200 | present |
| `https://machinesignal.it/.well-known/machine-discovery.json` | HTTP 200 | present |
| `https://machinesignal.it/machine-discovery/machine-discovery-pack.json` | HTTP 200 | present |

## Added Repository Assets

- `mcp_adapter/mcp_client_config.example.json`
- `mcp_adapter/machine_buyer_agent_runner_20260603.py`
- `mcp_machine_buyer_agent_readout_20260603.md`

## Tested Buyer-Machine Flow

1. Read product catalog and machine onboarding.
2. Create a sandbox customer without human sales contact.
3. Buy `target_discovery` because the buyer machine has no starting list.
4. Score one discovered target.
5. Buy only the recommended `deep_analysis` add-on.
6. Read orders and usage.

## Guardrails

- No real payment executed.
- No external contact executed.
- Full API keys not exposed to the MCP client or report.
