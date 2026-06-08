# MachineSignal - Machine Action Pack Single Purchase - 2026-06-08

## Result

Status: completed_action_pack_single_purchase

OK: True

Machine customer mode: machine_with_deep_analysis_gate_to_action_pack

Write calls executed: 4

POST calls executed: 4

Real payment executed: False

External contact executed: False

Fiscal invoice issued: False

## Machine Path Tested

1. Read public machine-discovery resources.
2. Create one limited sandbox customer.
3. Score one synthetic high-signal demo target.
4. Buy one Deep Analysis because the score recommends it.
5. Buy one Action Pack only by passing the Deep Analysis source order gate.
6. Retrieve the Action Pack order and usage.
7. Stop before any external action.

## Decision

- Demo target: premium-dental-conversion-gap.it
- Score: 78
- Score decision: buy_deep_analysis
- Deep Analysis order: ord_d216b7d2
- Action Pack order: ord_7c14bcc3
- Action Pack delivery type: action_pack
- Approval gate default state: blocked
- Email blocked without approval: True
- External contact executed: False

## Action Pack Fields

| Field | Present |
|---|---|
| what_is_included | True |
| crm_record_patch | True |
| crm_task | True |
| crm_platform_mappings | True |
| workflow_payload | True |
| webhook_event | True |
| webhook_delivery_policy | True |
| audit_event | True |
| approval_gate | True |
| agent_instructions | True |
| stop_rules | True |
| compliance_guardrail | True |
| next_api_calls | True |

## Checks

| Check | Status | Details |
|---|---|---|
| llms_reachable | OK | HTTP 200 |
| llms_exposes_machine_discovery | OK | llms contains well-known machine discovery link. |
| well_known_machine_discovery_reachable | OK | HTTP 200 |
| machine_discovery_customer_interface | OK | primary_customer_interface=machine |
| product_catalog_reachable | OK | HTTP 200 |
| openapi_reachable | OK | HTTP 200 |
| machine_onboarding_reachable | OK | HTTP 200 |
| action_pack_in_catalog | OK | Catalog includes action_pack. |
| purchase_intent_in_openapi | OK | OpenAPI exposes purchase-intent endpoint. |
| sandbox_customer_created | OK | HTTP 200 |
| score_created | OK | HTTP 200 |
| score_recommends_deep_analysis | OK | decision=buy_deep_analysis, next=deep_analysis |
| deep_analysis_created | OK | HTTP 200 |
| deep_analysis_gate_ready | OK | gate_present=True, status=deep_analysis_ready |
| action_pack_created | OK | HTTP 200 |
| action_pack_delivery_type_valid | OK | delivery_type=action_pack |
| action_pack_delivery_ready | OK | status=action_pack_ready |
| action_pack_consumed_one_credit | OK | credits_consumed=1 |
| action_pack_approval_gate_blocks_external_contact | OK | default=blocked, email_blocked=True |
| action_pack_has_crm_payload | OK | CRM record and task present. |
| action_pack_has_workflow_payload | OK | Workflow payload present. |
| action_pack_has_webhook_contract | OK | Webhook event and delivery policy present. |
| action_pack_agent_instructions_block_auto_contact | OK | Agent instruction blocks automatic target contact. |
| action_pack_audit_no_external_contact | OK | audit external_contact_executed=False |
| action_pack_order_retrieved | OK | HTTP 200 |
| orders_list_contains_deep_and_action | OK | HTTP 200, count=2 |
| usage_reachable_after_action_pack | OK | HTTP 200, backend=durable_object |
| no_real_payment | OK | No endpoint reported real_payment_executed=true. |
| no_external_contact | OK | No endpoint reported external_contact_executed=true. |
| api_key_not_published | OK | API key used only in memory. |

## Interpretation

This run proves the full controlled spend ladder for a machine buyer: score, Deep Analysis and exactly one Action Pack. The Action Pack prepares CRM and workflow payloads, but its default approval gate blocks external contact.

The API did not send email, did not contact a target, did not execute a real payment and did not issue a fiscal invoice.

## Next Step

Use this proof as the evidence that Action Pack is a machine-readable preparation product, not an automatic outreach product. The next step should be a no-write review of all public marketplace/discovery copy so it does not imply live paid production availability.
