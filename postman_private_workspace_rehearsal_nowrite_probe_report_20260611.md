# MachineSignal - Postman Private Workspace Rehearsal NoWrite Probe

## Scope

This probe verifies whether a machine, CRM, AI agent or workflow can read and import the MachineSignal Postman evaluation assets without public publication, real keys, live payments or human outreach.

## Result

- Status: **completed_postman_private_workspace_rehearsal_nowrite**
- OK: **true**
- Collection items: 28
- Methods: GET, PATCH, POST
- Write calls executed: 0
- POST calls executed by this probe: 0
- Real payment executed: false
- External contact executed: false
- Public workspace enabled: false
- Real API keys published: false

## Machine Interpretation

A machine can import the MachineSignal Postman assets, see the machine-buyer flow, use blank secret variables, and understand that live payments, public publication, real keys and human outreach are blocked.

## Required Machine-Buyer Items

- Read full machine buyer flow demo: present
- Read CRM consumer demo output: present
- Create limited sandbox customer: present
- Score business domain: present
- Order target discovery when machine has no list: present
- Order deep analysis after a strong score: present
- Order action pack after confirmed opportunity: present
- Repeat same score without double charge: present
- Fetch OpenAPI schema: present

## Public Resources

- collection: HTTP 200, json=true, https://machinesignal.it/postman_public_collection.json
- environment: HTTP 200, json=true, https://machinesignal.it/postman_public_environment_template.json
- secret_scan: HTTP 200, json=true, https://machinesignal.it/postman_workspace_secret_scan_20260606.json
- workspace_draft: HTTP 200, json=true, https://machinesignal.it/distribution/postman-public-workspace-draft.json
- checklist: HTTP 200, json=true, https://machinesignal.it/postman_private_workspace_checklist_20260607.json
- llms: HTTP 200, json=false, https://machinesignal.it/llms.txt
- robots: HTTP 200, json=false, https://machinesignal.it/robots.txt
- sitemap: HTTP 200, json=false, https://machinesignal.it/sitemap.xml

## Checks

- PASS - collection_reachable: HTTP 200, bytes=27564
- PASS - collection_json_valid: json_valid=true
- PASS - collection_no_secret_like_patterns: public content does not expose token-like patterns
- PASS - environment_reachable: HTTP 200, bytes=1148
- PASS - environment_json_valid: json_valid=true
- PASS - environment_no_secret_like_patterns: public content does not expose token-like patterns
- PASS - secret_scan_reachable: HTTP 200, bytes=3896
- PASS - secret_scan_json_valid: json_valid=true
- PASS - secret_scan_no_secret_like_patterns: public content does not expose token-like patterns
- PASS - workspace_draft_reachable: HTTP 200, bytes=16661
- PASS - workspace_draft_json_valid: json_valid=true
- PASS - workspace_draft_no_secret_like_patterns: public content does not expose token-like patterns
- PASS - checklist_reachable: HTTP 200, bytes=5098
- PASS - checklist_json_valid: json_valid=true
- PASS - checklist_no_secret_like_patterns: public content does not expose token-like patterns
- PASS - llms_reachable: HTTP 200, bytes=30943
- PASS - llms_no_secret_like_patterns: public content does not expose token-like patterns
- PASS - robots_reachable: HTTP 200, bytes=13064
- PASS - robots_no_secret_like_patterns: public content does not expose token-like patterns
- PASS - sitemap_reachable: HTTP 200, bytes=20289
- PASS - sitemap_no_secret_like_patterns: public content does not expose token-like patterns
- PASS - collection_has_28_items: items=28
- PASS - collection_required_item_read_full_machine_buyer_flow_demo: Read full machine buyer flow demo
- PASS - collection_required_item_read_crm_consumer_demo_output: Read CRM consumer demo output
- PASS - collection_required_item_create_limited_sandbox_customer: Create limited sandbox customer
- PASS - collection_required_item_score_business_domain: Score business domain
- PASS - collection_required_item_order_target_discovery_when_machine_has_no_list: Order target discovery when machine has no list
- PASS - collection_required_item_order_deep_analysis_after_a_strong_score: Order deep analysis after a strong score
- PASS - collection_required_item_order_action_pack_after_confirmed_opportunity: Order action pack after confirmed opportunity
- PASS - collection_required_item_repeat_same_score_without_double_charge: Repeat same score without double charge
- PASS - collection_required_item_fetch_openapi_schema: Fetch OpenAPI schema
- PASS - collection_uses_only_expected_methods: methods=GET,PATCH,POST
- PASS - collection_has_machine_demo_and_crm_output: machine flow and CRM consumer demos are included
- PASS - collection_has_idempotency_examples: most mutating sandbox examples include Idempotency-Key
- PASS - collection_has_api_key_guarded_calls: customer and admin keys are referenced as variables
- PASS - collection_machinesignal_api_key_blank_secret: machinesignal_api_key collection variable is blank secret
- PASS - environment_machinesignal_api_key_blank_secret: machinesignal_api_key environment variable is blank secret
- PASS - collection_machinesignal_admin_api_key_blank_secret: machinesignal_admin_api_key collection variable is blank secret
- PASS - environment_machinesignal_admin_api_key_blank_secret: machinesignal_admin_api_key environment variable is blank secret
- PASS - collection_beta_customer_id_blank_secret: beta_customer_id collection variable is blank secret
- PASS - environment_beta_customer_id_blank_secret: beta_customer_id environment variable is blank secret
- PASS - collection_payment_test_success_signature_blank_secret: payment_test_success_signature collection variable is blank secret
- PASS - environment_payment_test_success_signature_blank_secret: payment_test_success_signature environment variable is blank secret
- PASS - environment_declares_base_url: base_url
- PASS - environment_declares_machinesignal_api_key: machinesignal_api_key
- PASS - environment_declares_machinesignal_admin_api_key: machinesignal_admin_api_key
- PASS - environment_declares_beta_customer_id: beta_customer_id
- PASS - environment_declares_payment_test_id: payment_test_id
- PASS - environment_declares_order_intent_id: order_intent_id
- PASS - environment_declares_payment_test_success_signature: payment_test_success_signature
- PASS - environment_private_values_blank: non_base_non_blank=0
- PASS - secret_scan_passed: status=passed
- PASS - secret_scan_item_count_matches_collection: scan=28, collection=28
- PASS - secret_scan_has_no_hits: secret_hits=0
- PASS - secret_scan_blocks_public_keys: public key publication is blocked
- PASS - workspace_private_or_team_only: private_or_team_before_owner_approval
- PASS - workspace_public_visibility_blocked: final_in_postman_secret_scan_and_owner_approval
- PASS - workspace_policy_blocks_live_payments: live payments disabled
- PASS - workspace_policy_blocks_real_keys: real key publication disabled
- PASS - workspace_policy_blocks_human_outreach: human outreach disabled
- PASS - workspace_import_assets_include_secret_scan: secret scan linked in import assets
- PASS - checklist_blocks_make_workspace_public: make_workspace_public
- PASS - checklist_blocks_publish_real_api_keys: publish_real_api_keys
- PASS - checklist_blocks_publish_admin_keys: publish_admin_keys
- PASS - checklist_blocks_activate_live_payments: activate_live_payments
- PASS - checklist_blocks_run_external_outreach: run_external_outreach
- PASS - checklist_blocks_contact_target_companies: contact_target_companies
- PASS - llms_lists_postman_rehearsal_inputs: llms points to Postman import inputs
- PASS - robots_lists_postman_collection: robots lists Postman collection
- PASS - sitemap_lists_postman_collection: sitemap lists Postman collection

## Guardrails Confirmed

- Postman workspace remains private or team-only until owner approval.
- Secret variables are blank and marked secret.
- Admin key is declared only as a blank secret variable.
- Live payments, real keys, external publication and human outreach remain blocked.
- This rehearsal is a machine-to-machine integration surface check, not a launch or sales campaign.
