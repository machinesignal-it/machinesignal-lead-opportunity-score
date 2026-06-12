# MCP Schema Parity And Error Taxonomy P1

Date: 2026-06-12

Status: P1 schema parity and error taxonomy defined. No write calls.

Primary customer interface: machine.

## Decision

This step checks whether the local machine-readable contracts agree with each other:

- `mcp-tool-manifest.json`;
- `.well-known/mcp-tool-manifest.json`;
- `openapi.json`;
- `api_endpoint_minimal/core.mjs`;
- `mcp_adapter/machinesignal_mcp_server.py`.

It does not authorize hosted MCP, registry submission, live billing, production keys, real customer data, personal data or outreach.

## Included

- manifest parity;
- OpenAPI path and method parity;
- auth parity;
- idempotency parity;
- required input parity;
- manifest input property coverage;
- target discovery fields;
- sandbox customer fields;
- local adapter error taxonomy.

## Excluded

- hosted MCP build;
- hosted MCP deploy;
- public MCP registry submission;
- sandbox customer creation;
- score execution;
- purchase intent execution;
- payment-test intent execution;
- live billing;
- real payment;
- invoice;
- external target contact;
- real customer data;
- personal data;
- real lead lists.

## Schema Parity Rules

Root manifest and `.well-known` manifest must expose the same tool names and same input schemas for core API tools.

Every manifest tool that points to the MachineSignal API worker must map to an OpenAPI method and path.

Manifest auth must match OpenAPI security:

- `none` means public;
- `customer_api_key` means `ApiKeyAuth`;
- `admin_api_key` means `ApiKeyAuth` plus admin-only semantics.

Manifest idempotency must match OpenAPI required `Idempotency-Key` headers for score, purchase and payment-test writes.

Every manifest API tool input property must be documented in OpenAPI as body, path or query input.

Target Discovery must clearly expose these machine-specific fields:

- `market`;
- `area`;
- `commercial_objective`.

Sandbox customer creation must consistently expose:

- `evaluator_type`;
- `integration_target`;
- `expected_test_path`.

## Error Taxonomy

JSON-RPC errors:

| Code | Name | Meaning |
|---:|---|---|
| -32700 | `parse_error` | Invalid JSON received by adapter |
| -32601 | `method_not_found` | Unsupported JSON-RPC method |
| -32603 | `internal_error` | Unexpected adapter runtime error |
| -32000 | `adapter_startup_failed` | Adapter could not load manifest or start |

Adapter tool errors:

| Error | Meaning |
|---|---|
| `unknown_tool` | Requested tool is not present in manifest |
| `missing_customer_api_key` | Customer tool called without customer key |
| `missing_admin_api_key` | Admin tool called without admin key |
| `missing_idempotency_key` | Write tool called without idempotency key |
| `url_error` | Remote resource could not be reached |

API error families:

- `unauthorized`;
- `bad_request`;
- `not_found`;
- `sandbox_key_creation_disabled`;
- `sandbox_creation_rate_limited`;
- `live_payment_mode_blocked`;
- `invalid_provider_mode`;
- `invalid_provider`;
- `deep_analysis_verification_gate_failed`;
- `action_pack_gate_failed`.

## Known Non-Blocking Strictness

`create_payment_test_intent.amount_eur` is required by the manifest but optional in OpenAPI.

This is allowed for now because the manifest is stricter than the API. A machine-facing payment-test call is clearer when it supplies `amount_eur`; the API can still tolerate a missing amount in sandbox mode.

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

P1 schema parity passes only if:

- root and `.well-known` manifests match;
- all API tools in manifest map to OpenAPI operations;
- auth, idempotency, path parameters and required inputs align;
- target discovery fields are documented in OpenAPI and manifest;
- sandbox customer fields align between manifest and OpenAPI;
- local adapter negative errors are structured;
- all safety counters remain false;
- no obvious secrets are written to reports.

## Next

If passed:

```text
verify_public_deployed_contracts_or_prepare_p2_staging_design_only
```

If failed:

```text
fix_manifest_openapi_or_adapter_before_any_hosted_mcp_work
```
