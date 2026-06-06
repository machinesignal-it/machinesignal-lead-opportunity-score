# Machine buyer product evaluation probe - 2026-06-06

## Scope

This probe verifies whether a CRM workflow, AI agent or software buyer can understand MachineSignal's purchasable products and budget rules without human email outreach.

## Result

- Status: **True**
- Products checked: 8
- Live credits consumed: 0
- Real payment executed: false
- External contact executed: false

## Machine path

- `https://machinesignal.it/llms.txt`
- `https://machinesignal.it/machine-onboarding.json`
- `https://machinesignal.it/product-catalog.json`
- `https://machinesignal.it/machine_buyer_evaluation_pack_20260606.json`
- `https://machinesignal.it/deep_analysis_commercial_partner_brief_20260606.json`
- `https://machinesignal.it/openapi.json`

## Commercial ladder

1. `score_pack_1k` screens an existing list and returns score, confidence, commercial strength, spend policy and next purchase.
2. `deep_analysis` is bought only for promising records and returns evidence, decision matrix, Action Pack gate, CRM summary, stop rules and next machine call.
3. `action_pack` is bought only after Deep Analysis confirms the gates, and returns CRM/workflow payloads, webhook event, agent instructions, approval gate and compliance guardrail.

## Products checked

- PASS - `target_discovery`: EUR 149, Target Discovery Pack
- PASS - `score_pack_1k`: EUR 99, Score Pack 1k
- PASS - `domain_enrichment`: EUR 149, Domain Enrichment Pack 100
- PASS - `deep_analysis`: EUR 299, Deep Analysis Pack 100
- PASS - `action_pack`: EUR 399, Action Pack 25
- PASS - `opportunity_feed`: EUR 249, Opportunity Feed
- PASS - `api_starter`: EUR 99, API Starter
- PASS - `api_pro`: EUR 499, API Pro

## Checks

- PASS - product_catalog_reachable: HTTP 200
- PASS - evaluation_pack_reachable: HTTP 200
- PASS - onboarding_reachable: HTTP 200
- PASS - sitemap_reachable: HTTP 200
- PASS - deep_analysis_brief_reachable: HTTP 200
- PASS - evaluation_pack_md_reachable: HTTP 200
- PASS - openapi_reachable: HTTP 200
- PASS - llms_reachable: HTTP 200
- PASS - product_catalog_valid_json: service=MachineSignal
- PASS - catalog_machine_first: primary_customer_interface=machine
- PASS - catalog_beta_no_real_payment: beta=purchase-intent only; real_payment=False
- PASS - catalog_valid_output_credit_rule: credits are consumed only when the system produces a valid usable output
- PASS - catalog_tracks_credit_consumption: Each consumption event is tracked with request_id, product_code, status, credits_consumed and credits_remaining.
- PASS - catalog_product_target_discovery_present: Target Discovery Pack
- PASS - catalog_product_target_discovery_price_ok: expected=149; actual=149
- PASS - catalog_product_target_discovery_when_to_buy_present: When the customer machine does not already have a list and wants targets for a specific commercial objective, sector and area.
- PASS - catalog_product_target_discovery_output_present: A target list built for a declared commercial objective, ready for scoring or CRM enrichment workflows.
- PASS - catalog_product_target_discovery_required_terms_present: terms=commercial objective, 250, JSON
- PASS - catalog_product_score_pack_1k_present: Score Pack 1k
- PASS - catalog_product_score_pack_1k_price_ok: expected=99; actual=99
- PASS - catalog_product_score_pack_1k_when_to_buy_present: When the customer machine already has a list and needs to prioritize where to spend budget.
- PASS - catalog_product_score_pack_1k_output_present: Score, confidence, commercial strength, spend policy, decision, reason, priority and recommended next product.
- PASS - catalog_product_score_pack_1k_required_terms_present: terms=1000, spend_policy, next
- PASS - catalog_product_domain_enrichment_present: Domain Enrichment Pack 100
- PASS - catalog_product_domain_enrichment_price_ok: expected=149; actual=149
- PASS - catalog_product_domain_enrichment_when_to_buy_present: When the customer machine has target names but does not have reliable domains to score.
- PASS - catalog_product_domain_enrichment_output_present: A domain-enrichment result list that tells the workflow which records can move to scoring and which records should stop or be widened.
- PASS - catalog_product_domain_enrichment_required_terms_present: terms=domain, confidence, reason
- PASS - catalog_product_deep_analysis_present: Deep Analysis Pack 100
- PASS - catalog_product_deep_analysis_price_ok: expected=299; actual=299
- PASS - catalog_product_deep_analysis_when_to_buy_present: When a high score needs operational commercial evidence before the workflow buys Action Pack or spends more budget.
- PASS - catalog_product_deep_analysis_output_present: A spend-control JSON decision pack that tells the workflow whether to buy Action Pack, keep the lead in watchlist or stop.
- PASS - catalog_product_deep_analysis_required_terms_present: terms=commercial_evidence, machine_decision_matrix, action_pack_purchase_gate
- PASS - catalog_product_action_pack_present: Action Pack 25
- PASS - catalog_product_action_pack_price_ok: expected=399; actual=399
- PASS - catalog_product_action_pack_when_to_buy_present: When Deep Analysis confirms that a lead deserves a prepared commercial action.
- PASS - catalog_product_action_pack_output_present: A CRM-ready JSON action payload for workflow automation, webhook forwarding or supervised agent execution.
- PASS - catalog_product_action_pack_required_terms_present: terms=crm_record_patch, workflow_payload, approval_gate
- PASS - catalog_product_opportunity_feed_present: Opportunity Feed
- PASS - catalog_product_opportunity_feed_price_ok: expected=249; actual=249
- PASS - catalog_product_opportunity_feed_when_to_buy_present: When the customer machine wants recurring opportunities without launching one-off discovery requests.
- PASS - catalog_product_opportunity_feed_output_present: A scheduled feed of targets, scores and signals for automated systems.
- PASS - catalog_product_opportunity_feed_required_terms_present: terms=scheduled, targets, signals
- PASS - catalog_product_api_starter_present: API Starter
- PASS - catalog_product_api_starter_price_ok: expected=99; actual=99
- PASS - catalog_product_api_starter_when_to_buy_present: For light recurring use and continuous testing.
- PASS - catalog_product_api_starter_output_present: Authenticated access to the score API with monthly usage visibility.
- PASS - catalog_product_api_starter_required_terms_present: terms=API key, 500, usage
- PASS - catalog_product_api_pro_present: API Pro
- PASS - catalog_product_api_pro_price_ok: expected=499; actual=499
- PASS - catalog_product_api_pro_when_to_buy_present: For CRMs, agencies, platforms or automated workflows with recurring volume.
- PASS - catalog_product_api_pro_output_present: Higher-volume API access with feed, webhook and usage reporting.
- PASS - catalog_product_api_pro_required_terms_present: terms=3000, Deep Analysis, webhook
- PASS - evaluation_pack_has_three_step_ladder: steps=3
- PASS - evaluation_pack_score_step_ok: score_pack_1k step
- PASS - evaluation_pack_deep_step_ok: deep_analysis step
- PASS - evaluation_pack_action_step_ok: action_pack step
- PASS - evaluation_pack_answers_core_questions: evaluation questions present
- PASS - evaluation_pack_has_existing_list_flow: machine_has_domains flow present
- PASS - evaluation_pack_has_no_list_flow: machine_has_no_list flow present
- PASS - evaluation_pack_blocks_action_pack_without_deep: stop rule present
- PASS - evaluation_pack_blocks_real_payment_and_outreach: beta safety stop rules present
- PASS - deep_brief_has_weak_medium_strong_policy: weak/medium/strong policy present
- PASS - deep_brief_action_pack_conditional: deep confirmation gate present
- PASS - openapi_has_score_endpoint: score endpoint present
- PASS - openapi_has_purchase_intent_endpoint: purchase-intent endpoint present
- PASS - openapi_exposes_next_purchase_or_spend_policy: routing fields present
- PASS - llms_lists_product_catalog: product catalog linked
- PASS - llms_lists_evaluation_pack: evaluation pack linked
- PASS - llms_explains_core_prices: price ladder terms present
- PASS - llms_explains_deep_action_gate: deep/action gate terms present
- PASS - onboarding_lists_evaluation_pack: evaluation pack status present
- PASS - onboarding_embeds_catalog_products: catalog products embedded
- PASS - sitemap_valid_xml: urlset present
- PASS - sitemap_lists_evaluation_pack: evaluation pack in sitemap

## Interpretation

PASS: a machine buyer can understand what MachineSignal sells, when to buy each product, what JSON it receives, which actions are blocked and how budget waste is avoided.

## Guardrails

- The beta model records purchase intent and consumes beta credits only for valid outputs.
- The probe does not run write endpoints, real payments or external outreach.
- `action_pack` remains blocked unless Deep Analysis confirms the required gates.
- The customer machine must still apply its own compliance and budget policy before external action.