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

## Guardrails

- No real payment is executed in beta.
- No external contact is executed.
- Action Pack does not send email.
- External action requires a customer compliance gate.
