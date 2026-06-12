# MCP Local Conformance P1

Date: 2026-06-12

Status: P1 local conformance defined. No write calls.

Primary customer interface: machine.

## Decision

This step validates the local stdio MCP adapter before any hosted MCP work.

It does not authorize hosted MCP, registry submission, live billing, production keys, real customer data, personal data or outreach.

## Allowed Now

- start local stdio adapter;
- initialize JSON-RPC session;
- list tools;
- read public no-auth tools;
- run local negative/error tests;
- compare adapter output with manifest safety rules.

## Blocked Now

- hosted MCP build;
- hosted MCP deploy;
- public MCP registry submission;
- create sandbox customer;
- score real domains;
- create purchase intent;
- create payment-test intent;
- live billing;
- real payment;
- invoice;
- external target contact;
- automatic outreach;
- real customer data;
- personal data;
- real lead lists.

## What This Validates

The local MCP adapter must satisfy the following:

- it starts from the repository root;
- it supports `initialize`;
- it supports `tools/list`;
- it supports `tools/call`;
- it returns manifest-derived tools with input schemas;
- it can read public no-auth tools;
- it blocks protected customer tools when no customer key exists;
- it blocks admin tools when no admin key exists;
- it returns structured tool errors for unknown tools;
- it keeps full API keys out of client responses;
- it does not create sandbox customers in this run;
- it does not consume credits;
- it does not create purchase intents;
- it does not create payment-test intents;
- it does not contact external targets.

## Source Evidence

- `mcp_adapter/machinesignal_mcp_server.py`
- `mcp_adapter/README.md`
- `mcp_adapter/mcp_client_config.example.json`
- `mcp-tool-manifest.json`
- `.well-known/mcp-tool-manifest.json`
- `MCP_TOOL_CONTRACT.md`
- `MCP_MACHINE_CLIENT_INSTALLATION.md`
- `private-evaluator-pack/hosted_mcp_architecture_spike_20260612.json`

## Manifest Requirements

The manifest must keep these controls:

```text
public_mcp_server_live: false
adapter_required: true
local_adapter_transport: stdio_json_rpc
full_api_keys_returned_to_client: false
real_payment_executed_in_beta: false
external_contact_executed_in_beta: false
```

Public tools that must be callable without auth:

- `get_product_catalog`
- `get_machine_onboarding`
- `get_machine_api_sandbox_test`

Protected tools that must fail without credentials:

- `score_lead_opportunity`
- `create_purchase_intent`
- `get_order`
- `get_admin_sandbox_metrics`

Tools that must expose `idempotency_key` in the adapter schema:

- `score_lead_opportunity`
- `create_purchase_intent`
- `create_payment_test_intent`

## Expected Negative Tests

| Case | Expected result |
|---|---|
| Unknown JSON-RPC method | JSON-RPC method not found error |
| Unknown tool | Tool result with `isError: true` and `unknown_tool` |
| Score without customer key | Tool result with `isError: true` and `missing_customer_api_key` |
| Purchase intent without customer key | Tool result with `isError: true` and `missing_customer_api_key` |
| Admin metrics without admin key | Tool result with `isError: true` and `missing_admin_api_key` |

## Safety Counters Required

All must remain false:

- sandbox customer created;
- score call executed;
- purchase intent created;
- payment-test intent created;
- real payment executed;
- invoice issued;
- external contact executed;
- external publication executed;
- hosted MCP deployed;
- registry submission executed;
- credits consumed.

## Pass Criteria

P1 passes only if:

- all runtime checks pass;
- all manifest conformance checks pass;
- all blocked actions remain false;
- no secrets are written to report files;
- local adapter remains the only MCP execution path;
- hosted MCP remains blocked.

## Next

If P1 passes:

```text
continue_with_p1_schema_parity_and_error_taxonomy_or_prepare_p2_staging_design_only
```

If P1 fails:

```text
fix_local_adapter_or_manifest_before_any_hosted_mcp_work
```
