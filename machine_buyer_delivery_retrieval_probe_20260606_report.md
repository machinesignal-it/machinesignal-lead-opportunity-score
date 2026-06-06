# Machine buyer delivery retrieval probe - 2026-06-06

## Scope

This NoWrite probe verifies whether a CRM workflow, AI agent or software buyer can understand where to retrieve a purchased MachineSignal delivery after a beta order intent.

## Result

- Status: **True**
- Mode: NoWrite
- Write calls executed: 0
- Live credits consumed: 0
- Real payment executed: false
- External contact executed: false

## Retrieval Contract

- List orders: `GET /v1/orders`
- Get one order: `GET /v1/orders/{order_intent_id}`
- Delivery schema: `BetaDelivery`
- Required delivery fields: delivery_id, product_code, delivery_type, status, what_is_included, output_contract, next_machine_call, stop_rules, machine_recommendation, real_payment_executed, external_contact_executed
- Postman collection item count: 24

## Proof Inputs

- Self-service sale simulation: passed
- Self-service retrieved order count: 3
- Bounded live order id: ord_e128da05
- Bounded live order retrieval status: 200
- Bounded live checks: 21 / 21

## Checks

- PASS - product_catalog_reachable: HTTP 200
- PASS - llms_reachable: HTTP 200
- PASS - bounded_live_delivery_reachable: HTTP 200
- PASS - evaluation_pack_reachable: HTTP 200
- PASS - openapi_reachable: HTTP 200
- PASS - sitemap_reachable: HTTP 200
- PASS - postman_secret_scan_reachable: HTTP 200
- PASS - postman_environment_reachable: HTTP 200
- PASS - self_service_sale_reachable: HTTP 200
- PASS - postman_collection_reachable: HTTP 200
- PASS - machine_onboarding_reachable: HTTP 200
- PASS - openapi_has_order_list_endpoint: GET /v1/orders
- PASS - openapi_has_single_order_endpoint: GET /v1/orders/{order_intent_id}
- PASS - openapi_order_list_operation_id: operationId=listOrders
- PASS - openapi_single_order_operation_id: operationId=getOrder
- PASS - openapi_order_list_mentions_deliveries: List beta order intents and deliveries
- PASS - openapi_single_order_mentions_delivery: Get one beta order intent and delivery
- PASS - openapi_orders_are_authenticated: ApiKeyAuth security present
- PASS - openapi_single_order_path_param_required: order_intent_id required
- PASS - openapi_order_list_schema_ref: OrderListResponse
- PASS - openapi_single_order_schema_ref: OrderResponse
- PASS - openapi_order_list_response_shape: orders and count present
- PASS - openapi_order_response_shape: order object present
- PASS - openapi_beta_delivery_has_delivery_id: BetaDelivery.delivery_id
- PASS - openapi_beta_delivery_has_product_code: BetaDelivery.product_code
- PASS - openapi_beta_delivery_has_delivery_type: BetaDelivery.delivery_type
- PASS - openapi_beta_delivery_has_status: BetaDelivery.status
- PASS - openapi_beta_delivery_has_what_is_included: BetaDelivery.what_is_included
- PASS - openapi_beta_delivery_has_output_contract: BetaDelivery.output_contract
- PASS - openapi_beta_delivery_has_next_machine_call: BetaDelivery.next_machine_call
- PASS - openapi_beta_delivery_has_stop_rules: BetaDelivery.stop_rules
- PASS - openapi_beta_delivery_has_machine_recommendation: BetaDelivery.machine_recommendation
- PASS - openapi_beta_delivery_has_real_payment_executed: BetaDelivery.real_payment_executed
- PASS - openapi_beta_delivery_has_external_contact_executed: BetaDelivery.external_contact_executed
- PASS - onboarding_flow_has_order_retrieval: GET /v1/orders in callable_flow
- PASS - onboarding_order_goal_mentions_deliveries: Retrieve orders and deliveries.
- PASS - onboarding_policy_can_read_usage_and_orders: can_read_usage_and_orders=true
- PASS - onboarding_links_delivery_proof: bounded delivery proof linked
- PASS - onboarding_links_routing_probe: routing proof linked
- PASS - catalog_target_discovery_pack_250_has_machine_output: machine_output present
- PASS - catalog_target_discovery_pack_250_has_validity_rule: validity_rule present
- PASS - catalog_target_discovery_pack_250_has_includes: includes count=10
- PASS - catalog_score_pack_1k_has_machine_output: machine_output present
- PASS - catalog_score_pack_1k_has_validity_rule: validity_rule present
- PASS - catalog_score_pack_1k_has_includes: includes count=12
- PASS - catalog_domain_enrichment_pack_100_has_machine_output: machine_output present
- PASS - catalog_domain_enrichment_pack_100_has_validity_rule: validity_rule present
- PASS - catalog_domain_enrichment_pack_100_has_includes: includes count=8
- PASS - catalog_deep_analysis_pack_100_has_machine_output: machine_output present
- PASS - catalog_deep_analysis_pack_100_has_validity_rule: validity_rule present
- PASS - catalog_deep_analysis_pack_100_has_includes: includes count=12
- PASS - catalog_action_pack_25_has_machine_output: machine_output present
- PASS - catalog_action_pack_25_has_validity_rule: validity_rule present
- PASS - catalog_action_pack_25_has_includes: includes count=14
- PASS - catalog_opportunity_feed_monthly_has_machine_output: machine_output present
- PASS - catalog_opportunity_feed_monthly_has_validity_rule: validity_rule present
- PASS - catalog_opportunity_feed_monthly_has_includes: includes count=8
- PASS - catalog_api_starter_monthly_has_machine_output: machine_output present
- PASS - catalog_api_starter_monthly_has_validity_rule: validity_rule present
- PASS - catalog_api_starter_monthly_has_includes: includes count=7
- PASS - catalog_api_pro_monthly_has_machine_output: machine_output present
- PASS - catalog_api_pro_monthly_has_validity_rule: validity_rule present
- PASS - catalog_api_pro_monthly_has_includes: includes count=8
- PASS - catalog_custom_overage_has_machine_output: machine_output present
- PASS - catalog_custom_overage_has_validity_rule: validity_rule present
- PASS - catalog_custom_overage_has_includes: includes count=6
- PASS - catalog_deep_analysis_has_output_fields: deep_analysis output fields
- PASS - catalog_action_pack_has_output_fields: action_pack output fields
- PASS - evaluation_pack_flow_retrieves_orders: GET /v1/orders in evaluation flow
- PASS - evaluation_pack_proof_has_order_id: ord_e128da05
- PASS - evaluation_pack_proof_has_report_links: report and JSON present
- PASS - self_service_sale_passed: status=passed
- PASS - self_service_orders_passed: orders=3
- PASS - self_service_orders_have_core_products: action_pack, deep_analysis, target_discovery
- PASS - self_service_no_payment_no_outreach: safe beta
- PASS - bounded_live_delivery_passed: ok=True
- PASS - bounded_live_order_retrieved: HTTP 200
- PASS - bounded_live_order_id_present: ord_e128da05
- PASS - bounded_live_stored_delivery_persisted: stored delivery fields persisted
- PASS - bounded_live_credit_policy: deep=1; action=0
- PASS - bounded_live_no_payment_no_outreach: safe beta
- PASS - postman_has_list_orders: List beta orders
- PASS - postman_has_get_order_by_id: Get beta order by id
- PASS - postman_mentions_order_intent_variable: order_intent_id variable present
- PASS - postman_environment_has_order_intent_id: blank order_intent_id
- PASS - postman_environment_secret_values_blank: secret values blank
- PASS - postman_secret_scan_passed: secret_hits=0
- PASS - postman_secret_scan_count_updated: scan=24; collection=24
- PASS - llms_explains_order_retrieval: order retrieval instructions present
- PASS - llms_says_orders_are_not_invoices: invoice distinction present
- PASS - sitemap_valid_xml: urlset present

## Interpretation

PASS: a machine buyer can discover how to retrieve beta orders and deliveries, understand the delivery schema, find Postman retrieval requests, and verify prior delivery persistence proof without write calls, live credits, real payment or external outreach.

## Guardrails

- This probe reads public resources only.
- It does not create sandbox customers, scores, orders or payment-test intents.
- It does not consume live credits.
- It does not execute real payment.
- It does not contact external targets.