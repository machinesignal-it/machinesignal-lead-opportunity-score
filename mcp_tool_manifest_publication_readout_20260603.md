# MachineSignal MCP / tool-style manifest publication readout - 2026-06-03

## Objective

Make MachineSignal easier for AI agents, CRM workflows, RevOps automations and future MCP wrappers to understand as a callable tool, not only as a website or API documentation page.

## Published assets

- `https://machinesignal.it/mcp-tool-manifest.json`
- `https://machinesignal.it/.well-known/mcp-tool-manifest.json`
- `https://machinesignal.it/.well-known/machine-discovery.json`
- `https://machinesignal.it/machine-discovery/machine-discovery-pack.json`
- `https://machinesignal.it/llms.txt`
- `https://machinesignal.it/robots.txt`
- `https://machinesignal.it/sitemap.xml`

## Manifest positioning

The manifest is intentionally described as a `tool_style_manifest`.

It does not claim that MachineSignal has a hosted public MCP server yet.

Current status:

- public HTTP beta API: live;
- public OpenAPI: live;
- public tool-style manifest: live;
- public hosted MCP server: not live;
- adapter/wrapper: required for MCP-style execution.

## Tools described

The manifest exposes 11 tool contracts:

- `get_product_catalog`
- `get_machine_onboarding`
- `get_dentists_beta_pack`
- `create_sandbox_customer`
- `get_customer_onboarding`
- `score_lead_opportunity`
- `create_purchase_intent`
- `list_orders`
- `get_order`
- `get_usage`
- `get_admin_sandbox_metrics`

## Live verification

Live checks passed after FTP publication:

- `mcp-tool-manifest.json` returned HTTP 200.
- `.well-known/mcp-tool-manifest.json` returned HTTP 200.
- main manifest is valid JSON.
- well-known manifest is valid JSON.
- main manifest contains 11 tools.
- main manifest includes `score_lead_opportunity`, `create_purchase_intent` and `create_sandbox_customer`.
- main manifest states `public_mcp_server_live=false`.
- well-known manifest points to the canonical manifest.
- `.well-known/machine-discovery.json` links to both manifest URLs.
- `robots.txt`, `sitemap.xml` and `llms.txt` include the manifest URLs.

## Guardrails

- No real payment executed.
- No external contact executed.
- Action Pack does not send email.
- Human role remains supervision, approval and audit only.

## Next step

Build or simulate the first MCP wrapper that reads the manifest and maps the HTTP API into callable tools. The wrapper should test:

1. `get_product_catalog`;
2. `create_sandbox_customer`;
3. `score_lead_opportunity`;
4. `create_purchase_intent`;
5. `list_orders`;
6. `get_usage`.
