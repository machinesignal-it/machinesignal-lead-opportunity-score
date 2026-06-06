# Machine buyer Postman discovery probe - 2026-06-06

## Scope

This probe verifies whether a software system, CRM workflow or AI agent can discover MachineSignal's Postman testing resources without human email outreach.

## Result

- Status: **True**
- Collection requests: 23
- Secret variables: 4
- Non-blank secret variables: 0
- Live credits consumed: 0
- Real payment executed: false
- External contact executed: false

## Machine path

- `https://machinesignal.it/llms.txt`
- `https://machinesignal.it/postman/`
- `https://machinesignal.it/postman_public_collection.json`
- `https://machinesignal.it/postman_public_environment_template.json`
- `https://machinesignal.it/postman_workspace_secret_scan_20260606.json`
- `https://machinesignal.it/machine-onboarding.json`

## Import URL

`https://go.postman.co/import?url=https%3A%2F%2Fmachinesignal.it%2Fpostman_public_collection.json`

## Checks

- PASS - postman_page_reachable: HTTP 200
- PASS - onboarding_reachable: HTTP 200
- PASS - import_pack_reachable: HTTP 200
- PASS - secret_scan_reachable: HTTP 200
- PASS - collection_reachable: HTTP 200
- PASS - sitemap_reachable: HTTP 200
- PASS - llms_reachable: HTTP 200
- PASS - environment_reachable: HTTP 200
- PASS - llms_lists_postman_page: llms.txt includes /postman/
- PASS - llms_lists_postman_collection: llms.txt includes public collection
- PASS - llms_lists_environment_template: llms.txt includes environment template
- PASS - llms_lists_secret_scan: llms.txt includes secret scan
- PASS - postman_page_has_import_link: direct Postman import URL present
- PASS - postman_page_links_collection: collection JSON linked
- PASS - postman_page_links_environment: environment template linked
- PASS - postman_page_links_secret_scan: secret scan linked
- PASS - collection_valid_json: MachineSignal Lead Opportunity Score API - Public Machine Discovery
- PASS - collection_has_expected_request_count: items=23
- PASS - collection_secret_variables_blank: secret_variables=4, non_blank=0
- PASS - collection_has_import_pack_request: import pack request present
- PASS - collection_has_secret_scan_request: secret scan request present
- PASS - environment_valid_json: MachineSignal Public Sandbox Environment
- PASS - environment_base_url_present: base_url=https://machinesignal-api.beta-878.workers.dev
- PASS - environment_private_values_blank: non_blank_private_values=0
- PASS - secret_scan_passed: status=passed
- PASS - secret_scan_no_secret_hits: secret_hits=0
- PASS - secret_scan_no_live_credits: live_credits_consumed=0
- PASS - import_pack_private_workspace_rule: private workspace language present
- PASS - onboarding_lists_postman_import_page: postman_import_page=https://machinesignal.it/postman/
- PASS - onboarding_latest_status_published_candidate: latest status field present
- PASS - sitemap_valid_xml: urlset present
- PASS - sitemap_lists_postman_page: sitemap includes /postman/

## Interpretation

PASS: a machine buyer can discover the Postman import route, validate the collection, import a blank environment template and verify the secret scan without human email outreach.

## Guardrails

- Keep the Postman workspace private until owner approval.
- Do not publish private API keys, customer IDs, payment test IDs or webhook signatures.
- Do not run live payment or external outreach flows during this discovery test.
- This probe does not consume product credits.
