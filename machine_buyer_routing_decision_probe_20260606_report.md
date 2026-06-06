# Machine buyer routing decision probe - 2026-06-06

## Scope

This probe verifies whether a CRM workflow, AI agent or software buyer can turn MachineSignal score and Deep Analysis signals into the correct operational decision.

## Result

- Status: **True**
- Score routing scenarios: 6
- Deep Analysis gate scenarios: 4
- Live credits consumed: 0
- Real payment executed: false
- External contact executed: false

## Score Routing

- PASS - `weak_discard`: route `discard`, buy `none`, action_pack_allowed `False`.
- PASS - `medium_watchlist`: route `watchlist`, buy `none`, action_pack_allowed `False`.
- PASS - `medium_nurture`: route `nurturing`, buy `none`, action_pack_allowed `False`.
- PASS - `needs_verification`: route `request_verification`, buy `verification`, action_pack_allowed `False`.
- PASS - `strong_buy_deep_analysis`: route `buy_deep_analysis`, buy `deep_analysis`, action_pack_allowed `False`.
- PASS - `strong_score_does_not_allow_direct_action_pack`: route `buy_deep_analysis`, buy `deep_analysis`, action_pack_allowed `False`.

## Deep Analysis Gate Routing

- PASS - `deep_confirms_all_gates`: route `buy_action_pack`, buy `action_pack`, action_pack_allowed `True`.
- PASS - `deep_partial_evidence`: route `watchlist`, buy `none`, action_pack_allowed `False`.
- PASS - `deep_missing_compliance`: route `block_action_pack`, buy `none`, action_pack_allowed `False`.
- PASS - `deep_missing_budget_approval`: route `block_action_pack`, buy `none`, action_pack_allowed `False`.

## Routing Policy

- `discard`: do not spend more budget.
- `watchlist`: monitor without buying add-ons.
- `nurturing`: save internally for nurturing; Action Pack remains blocked.
- `request_verification`: buy verification only if `next_purchase` recommends it and it is allowed.
- `buy_deep_analysis`: buy Deep Analysis first; Action Pack remains blocked.
- `buy_action_pack`: allowed only after Deep Analysis confirms all gates.

## Checks

- PASS - product_catalog_reachable: HTTP 200
- PASS - onboarding_reachable: HTTP 200
- PASS - evaluation_pack_reachable: HTTP 200
- PASS - llms_reachable: HTTP 200
- PASS - deep_analysis_brief_reachable: HTTP 200
- PASS - openapi_reachable: HTTP 200
- PASS - sitemap_reachable: HTTP 200
- PASS - openapi_decision_enum_has_discard: decision enum contains discard
- PASS - openapi_decision_enum_has_watchlist: decision enum contains watchlist
- PASS - openapi_decision_enum_has_nurture: decision enum contains nurture
- PASS - openapi_decision_enum_has_buy_deep_analysis: decision enum contains buy_deep_analysis
- PASS - openapi_decision_enum_has_needs_verification: decision enum contains needs_verification
- PASS - openapi_purchase_code_has_verification: purchase-intent supports verification
- PASS - openapi_purchase_code_has_nurture_signal: purchase-intent supports nurture_signal
- PASS - openapi_purchase_code_has_deep_analysis: purchase-intent supports deep_analysis
- PASS - openapi_purchase_code_has_action_pack: purchase-intent supports action_pack
- PASS - openapi_has_commercial_strength: commercial_strength present
- PASS - openapi_has_spend_policy: spend_policy present
- PASS - openapi_has_next_purchase: next_purchase present
- PASS - evaluation_pack_has_score_response_shape: score response routing example present
- PASS - evaluation_pack_has_deep_gate: deep gate example present
- PASS - deep_brief_has_routing_policy: weak/medium/strong policy present
- PASS - product_catalog_score_pack_returns_routing_fields: score pack returns routing fields
- PASS - llms_explains_routing_decisions: llms includes routing decisions
- PASS - onboarding_embeds_score_products: onboarding embeds products
- PASS - sitemap_valid_xml: urlset present
- PASS - score_route_weak_discard_route_ok: expected=discard; actual=discard
- PASS - score_route_weak_discard_buy_product_ok: expected=; actual=
- PASS - score_route_weak_discard_action_pack_blocked: action_pack_allowed=False
- PASS - score_route_medium_watchlist_route_ok: expected=watchlist; actual=watchlist
- PASS - score_route_medium_watchlist_buy_product_ok: expected=; actual=
- PASS - score_route_medium_watchlist_action_pack_blocked: action_pack_allowed=False
- PASS - score_route_medium_nurture_route_ok: expected=nurturing; actual=nurturing
- PASS - score_route_medium_nurture_buy_product_ok: expected=; actual=
- PASS - score_route_medium_nurture_action_pack_blocked: action_pack_allowed=False
- PASS - score_route_needs_verification_route_ok: expected=request_verification; actual=request_verification
- PASS - score_route_needs_verification_buy_product_ok: expected=verification; actual=verification
- PASS - score_route_needs_verification_action_pack_blocked: action_pack_allowed=False
- PASS - score_route_strong_buy_deep_analysis_route_ok: expected=buy_deep_analysis; actual=buy_deep_analysis
- PASS - score_route_strong_buy_deep_analysis_buy_product_ok: expected=deep_analysis; actual=deep_analysis
- PASS - score_route_strong_buy_deep_analysis_action_pack_blocked: action_pack_allowed=False
- PASS - score_route_strong_score_does_not_allow_direct_action_pack_route_ok: expected=buy_deep_analysis; actual=buy_deep_analysis
- PASS - score_route_strong_score_does_not_allow_direct_action_pack_buy_product_ok: expected=deep_analysis; actual=deep_analysis
- PASS - score_route_strong_score_does_not_allow_direct_action_pack_action_pack_blocked: action_pack_allowed=False
- PASS - deep_route_deep_confirms_all_gates_route_ok: expected=buy_action_pack; actual=buy_action_pack
- PASS - deep_route_deep_confirms_all_gates_buy_product_ok: expected=action_pack; actual=action_pack
- PASS - deep_route_deep_partial_evidence_route_ok: expected=watchlist; actual=watchlist
- PASS - deep_route_deep_partial_evidence_buy_product_ok: expected=; actual=
- PASS - deep_route_deep_missing_compliance_route_ok: expected=block_action_pack; actual=block_action_pack
- PASS - deep_route_deep_missing_compliance_buy_product_ok: expected=; actual=
- PASS - deep_route_deep_missing_budget_approval_route_ok: expected=block_action_pack; actual=block_action_pack
- PASS - deep_route_deep_missing_budget_approval_buy_product_ok: expected=; actual=

## Interpretation

PASS: a machine buyer can route score and Deep Analysis signals into discard, watchlist, nurturing, verification, Deep Analysis purchase or Action Pack blocking/approval without human email outreach.

## Guardrails

- This probe is read-only and does not call write endpoints.
- No product credits are consumed.
- No real payment is executed.
- No external contact or outreach is executed.
- `action_pack` is blocked until Deep Analysis confirms all required gates.