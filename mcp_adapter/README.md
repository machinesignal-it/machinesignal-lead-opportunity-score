# MachineSignal Local MCP Adapter

This folder contains a local stdio MCP-style adapter for MachineSignal.

It exposes the HTTP beta API as tools using the public manifest:

`https://machinesignal.it/mcp-tool-manifest.json`

## Status

- Public HTTP beta API: live.
- Tool-style manifest: live.
- Local MCP stdio adapter: available in this folder.
- Hosted public MCP server: not live yet.

## Run

```powershell
python mcp_adapter\machinesignal_mcp_server.py
```

The process reads JSON-RPC requests from stdin and writes JSON-RPC responses to stdout.

Supported methods:

- `initialize`
- `tools/list`
- `tools/call`

## Authentication

The adapter keeps full API keys out of tool responses.

For a normal machine test:

1. call `create_sandbox_customer`;
2. the adapter stores the returned sandbox key in memory;
3. call customer tools such as `score_lead_opportunity`, `create_purchase_intent`, `list_orders` and `get_usage`.

Optional environment variables:

- `MACHINESIGNAL_CUSTOMER_API_KEY`
- `MACHINESIGNAL_ADMIN_API_KEY`

## Connect A Client

Use `mcp_client_config.example.json` as the starting point for a local MCP
client configuration:

```json
{
  "mcpServers": {
    "machinesignal": {
      "command": "python",
      "args": ["mcp_adapter/machinesignal_mcp_server.py"]
    }
  }
}
```

Run the client from the repository root, or replace the adapter path with an
absolute path.

## Validate Installation Without Credits

Run this before the full buyer-machine test:

```powershell
python mcp_adapter\validate_machine_client_installation_20260603.py
```

This starts the adapter and reads only public resources. It does not create a
sandbox customer, does not call score tools and does not consume credits.

Full installation guide:

`MCP_MACHINE_CLIENT_INSTALLATION.md`

## Machine Buyer Agent Test

Run this to simulate a buyer machine using the adapter as MCP-style tools:

```powershell
python mcp_adapter\machine_buyer_agent_runner_20260603.py
```

The runner creates a sandbox customer, buys a bounded target discovery pack,
scores one discovered target, buys the recommended add-on only when justified,
then reads orders and usage.

## Guardrails

- No real payment is executed in beta.
- No external contact is executed.
- Action Pack does not send email.
- External action requires a customer compliance gate.
