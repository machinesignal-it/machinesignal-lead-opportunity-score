# MCP Local Conformance P1 Probe

Date: 2026-06-12

Status: passed

Mode: local stdio adapter, NoWrite.

## Result

- checks total: 56
- checks failed: 0
- hosted MCP build allowed: no
- hosted MCP deploy allowed: no
- registry submission allowed: no
- live billing allowed: no
- real data allowed: no
- credits consumed: no

## Public Calls

| Tool | HTTP | OK | Auth |
|---|---:|---|---|
| get_product_catalog | 200 | yes | none |
| get_machine_onboarding | 200 | yes | none |
| get_machine_api_sandbox_test | 200 | yes | none |

## Negative Local Checks

| Case | Error |
|---|---|
| unknown_tool | unknown_tool |
| score_without_customer_key | missing_customer_api_key |
| purchase_without_customer_key | missing_customer_api_key |
| get_order_without_customer_key | missing_customer_api_key |
| admin_without_key | missing_admin_api_key |

## Interpretation

The local MCP adapter passes P1 conformance in NoWrite mode if this report is passed. The result does not authorize hosted MCP, public registry submission, billing, production keys, real data or outreach.

## Next

continue_with_p1_schema_parity_and_error_taxonomy_or_prepare_p2_staging_design_only

## Failed Checks

None.
