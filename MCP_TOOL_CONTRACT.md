# MachineSignal MCP / Tool Contract

Status: public tool-style manifest live; local stdio MCP adapter available; public hosted MCP server not live yet.

MachineSignal currently exposes a callable HTTP beta API. The public `mcp-tool-manifest.json` describes how an agent, CRM workflow or MCP wrapper can expose the API as tools.

Canonical manifest:

- `https://machinesignal.it/mcp-tool-manifest.json`
- `https://machinesignal.it/.well-known/mcp-tool-manifest.json`

Source of truth:

- OpenAPI: `https://machinesignal.it/openapi.json`
- llms.txt: `https://machinesignal.it/llms.txt`
- Product catalog: `https://machinesignal.it/product-catalog.json`

## MCP Compatibility

MachineSignal does not yet provide a public hosted MCP server.

A local stdio MCP-style adapter is available in the GitHub repository:

- adapter: `mcp_adapter/machinesignal_mcp_server.py`
- client config example: `mcp_adapter/mcp_client_config.example.json`
- machine buyer agent runner: `mcp_adapter/machine_buyer_agent_runner_20260603.py`

A customer machine or integration partner can build a wrapper that exposes the HTTP endpoints as MCP tools. The wrapper should use:

- tool names from `mcp-tool-manifest.json`;
- input schemas from `mcp-tool-manifest.json`;
- endpoint details from `openapi.json`;
- `X-API-Key` authentication for protected calls;
- `Idempotency-Key` for score and purchase calls.

## Public Tools

### get_product_catalog

Reads products, prices, deliverables and credit rules.

HTTP mapping:

`GET https://machinesignal.it/product-catalog.json`

### get_machine_onboarding

Reads the machine buyer flow and guardrails.

HTTP mapping:

`GET https://machinesignal.it/machine-onboarding.json`

### get_dentists_beta_pack

Reads the current dentist vertical beta benchmark and product flow.

HTTP mapping:

`GET https://machinesignal.it/dentists-beta-machine-buyer-pack.json`

### create_sandbox_customer

Creates a limited sandbox API key for machine evaluation without human sales contact.

HTTP mapping:

`POST https://machinesignal-api.beta-878.workers.dev/v1/sandbox/customers`

## Authenticated Customer Tools

### get_customer_onboarding

HTTP mapping:

`GET https://machinesignal-api.beta-878.workers.dev/v1/onboarding`

Auth:

`X-API-Key: <customer_or_sandbox_key>`

### score_lead_opportunity

Scores one business domain and returns the machine decision.

HTTP mapping:

`POST https://machinesignal-api.beta-878.workers.dev/v1/lead-opportunity-score`

Input:

- `domain`: required business domain without protocol;
- `sector_hint`: optional sector hint;
- `country_hint`: optional country hint.

Output includes:

- `opportunity_score`;
- `confidence`;
- `decision`;
- `web_architect_review`;
- `commercial_strength`;
- `spend_policy`;
- `next_purchase`;
- `usage`.

Auth:

`X-API-Key: <customer_or_sandbox_key>`

Required:

`Idempotency-Key: <stable_request_key>`

### create_purchase_intent

Creates a beta order intent for machine-readable outputs.

HTTP mapping:

`POST https://machinesignal-api.beta-878.workers.dev/v1/purchase-intent`

Supported `product_code` values:

- `target_discovery`;
- `domain_enrichment`;
- `verification`;
- `nurture_signal`;
- `deep_analysis`;
- `action_pack`;
- `opportunity_feed`.

For `target_discovery`, the machine should provide `market`, `area` and `commercial_objective`. The objective must describe what opportunity the machine wants to find, not only a generic sector name.

### list_orders

Retrieves previous beta orders and deliveries.

HTTP mapping:

`GET https://machinesignal-api.beta-878.workers.dev/v1/orders`

### get_order

Retrieves one beta order delivery.

HTTP mapping:

`GET https://machinesignal-api.beta-878.workers.dev/v1/orders/{order_intent_id}`

### get_usage

Reads current credit balances and usage.

HTTP mapping:

`GET https://machinesignal-api.beta-878.workers.dev/v1/usage`

## Admin Tool

### get_admin_sandbox_metrics

Admin-only daily monitor for sandbox keys, score usage, Deep Analysis orders, Action Pack orders and safety flags.

HTTP mapping:

`GET https://machinesignal-api.beta-878.workers.dev/v1/admin/sandbox-metrics`

## Safety Rules

- The beta does not execute real payment.
- The beta does not contact external targets.
- Action Pack does not send email.
- External actions require the customer machine's compliance gate.
- Humans supervise, approve and audit; they are not the primary buyer interface.

## Commercial Rule

MachineSignal sells machine-readable decisions and outputs, not generic human persuasion.

The current beta products include target discovery, scoring, deep analysis, nurture signal and action pack outputs. Target Discovery is a controlled, objective-based output; it is not an uncontrolled scraped lead list.
