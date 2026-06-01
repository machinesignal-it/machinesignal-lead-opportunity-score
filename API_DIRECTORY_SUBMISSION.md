# MachineSignal API Directory Submission

## Short description

Machine-first lead opportunity scoring API for CRM systems, RevOps workflows and AI agents.

## Long description

MachineSignal helps automated systems decide whether a business domain deserves more analysis, enrichment or CRM action. The API returns a score, confidence, decision and next machine action. A machine can create a limited sandbox key, run valid scores, test Deep Analysis and test Action Pack without a human sales conversation.

MachineSignal is built for machine customers: CRM systems, AI agents, workflow engines and software automations. Public resources include OpenAPI, llms.txt, Postman collection, machine onboarding manifest, product catalog and a machine discovery pack.

## Category

Sales intelligence, CRM automation, lead scoring, RevOps, AI agent tools.

## Public URLs

- Website: https://machinesignal.it/
- Distribution page: https://machinesignal.it/distribution/
- API directory JSON: https://machinesignal.it/distribution/api-directory-submission.json
- OpenAPI: https://machinesignal.it/openapi.json
- llms.txt: https://machinesignal.it/llms.txt
- Postman collection: https://machinesignal.it/postman_collection.json
- Product catalog: https://machinesignal.it/product-catalog.json
- Sandbox endpoint: https://machinesignal-api.beta-878.workers.dev/v1/sandbox/customers

## Sandbox test path

1. Fetch `https://machinesignal.it/machine-onboarding.json`.
2. Fetch `https://machinesignal.it/product-catalog.json`.
3. Create a sandbox key with `POST /v1/sandbox/customers`.
4. Call `GET /v1/onboarding`.
5. Call `POST /v1/lead-opportunity-score`.
6. If useful, call `POST /v1/purchase-intent` for `deep_analysis`.
7. If useful, call `POST /v1/purchase-intent` for `action_pack`.
8. Retrieve results with `GET /v1/orders`.

## Safety

The beta does not execute real payments and does not contact external targets. Action Pack prepares CRM/workflow payloads but requires a customer-side compliance gate before any external action.

