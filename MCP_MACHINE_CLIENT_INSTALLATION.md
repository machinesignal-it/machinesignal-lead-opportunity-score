# MachineSignal MCP Machine Client Installation

Status: beta installation pack for machine clients.

MachineSignal is designed to be discovered and tested by software: CRM systems,
AI agents, RevOps workflows and automation tools. This guide explains how a
machine client can connect to the local stdio MCP adapter without human email
outreach.

## What This Installs

The package exposes MachineSignal as MCP-style tools through a local adapter:

- adapter: `mcp_adapter/machinesignal_mcp_server.py`
- client config example: `mcp_adapter/mcp_client_config.example.json`
- no-credit validation: `mcp_adapter/validate_machine_client_installation_20260603.py`
- full buyer-machine test: `mcp_adapter/machine_buyer_agent_runner_20260603.py`

The adapter calls the live HTTP beta API and keeps full API keys out of tool
responses.

## Requirements

- Python 3.10 or newer.
- Network access to `https://machinesignal.it/`.
- Network access to `https://machinesignal-api.beta-878.workers.dev/`.
- Repository checkout:

```powershell
git clone https://github.com/machinesignal-it/machinesignal-lead-opportunity-score.git
cd machinesignal-lead-opportunity-score
```

## Step 1: Validate Installation Without Consuming Credits

Run:

```powershell
python mcp_adapter\validate_machine_client_installation_20260603.py
```

This validation checks:

- the adapter process starts;
- MCP `initialize` works;
- MCP `tools/list` returns the expected tools;
- public catalog, onboarding and dentist beta pack are readable;
- no sandbox key is created;
- no paid or credit-consuming endpoint is called.

Expected result:

```text
Status: passed
Credit-consuming calls executed: false
Real payment executed: false
External contact executed: false
```

## Step 2: Connect An MCP Client

Use:

```text
mcp_adapter/mcp_client_config.example.json
```

Minimal config:

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

## Step 3: Full Buyer-Machine Test

Run:

```powershell
python mcp_adapter\machine_buyer_agent_runner_20260603.py
```

This test simulates a buyer machine that:

1. reads catalog and onboarding;
2. creates a limited sandbox customer;
3. buys `target_discovery` when it has no starting list;
4. scores one discovered target;
5. buys only the recommended `deep_analysis` add-on;
6. reads orders and usage.

This uses sandbox credits only. It does not execute real payment and does not
contact external targets.

## Tool Flow For A Real Machine Client

Recommended sequence:

1. `get_product_catalog`
2. `get_machine_onboarding`
3. `create_sandbox_customer`
4. `get_customer_onboarding`
5. `create_purchase_intent` with `product_code=target_discovery` if no list is available
6. `score_lead_opportunity` for selected domains
7. `create_purchase_intent` only when `next_purchase.next_product` recommends a bounded add-on
8. `list_orders`
9. `get_usage`

## Guardrails

- Full API keys are not returned to the MCP client.
- The beta does not execute real payment.
- The beta does not contact external targets.
- Action Pack does not send email.
- External actions require the customer machine's compliance gate.
- Humans supervise, approve and audit; they are not the primary buyer interface.

## Public Discovery

Machine-readable installation pack:

`https://machinesignal.it/mcp-machine-client-installation-pack.json`

Tool manifest:

`https://machinesignal.it/mcp-tool-manifest.json`

Well-known discovery:

`https://machinesignal.it/.well-known/machine-discovery.json`
