# MachineSignal Postman Workspace Import Pack

Generated: 2026-06-06

Status: ready for private workspace import. Public publication still requires owner approval after final in-Postman secret scan.

## Goal

Prepare a Postman workspace that machines, developers and workflow tools can use to test MachineSignal in sandbox mode.

This is not a human cold-email workflow. It is an API discovery and testing surface for machine buyers.

## Import URLs

- Collection: https://machinesignal.it/postman_public_collection.json
- Environment template: https://machinesignal.it/postman_public_environment_template.json
- Secret scan: https://machinesignal.it/postman_workspace_secret_scan_20260606.json
- Workspace draft: https://machinesignal.it/distribution/postman-public-workspace-draft.json
- Publication execution pack: https://machinesignal.it/marketplace_publication_execution_pack_20260606.json

Direct import URL:

```text
https://machinesignal-it-2905764.postman.co/import?url=https%3A%2F%2Fmachinesignal.it%2Fpostman_public_collection.json
```

## Workspace settings

- Workspace name: `MachineSignal Lead Opportunity Score API`
- Visibility before final approval: private or team workspace.
- Visibility after final approval: public workspace, only if no secrets are present.
- Description source: `distribution/postman-public-workspace-draft.json`.

## Collection contents

The collection includes:

- public onboarding and product catalog;
- distribution and marketplace packs;
- Machine Buyer Evaluation Pack;
- Deep Analysis Commercial Brief;
- Postman Workspace Import Pack;
- Postman Public Environment Template;
- Postman Workspace Secret Scan;
- MCP Wrapper Pack;
- sandbox customer creation;
- authenticated onboarding;
- lead opportunity scoring;
- Target Discovery purchase intent;
- Deep Analysis purchase intent;
- Action Pack purchase intent;
- payment-test sandbox intent;
- payment-test reconciliation;
- order listing;
- OpenAPI fetch.

## Environment safety

The public environment template contains:

- `base_url` with the public Worker URL;
- blank `machinesignal_api_key`;
- blank `beta_customer_id`;
- blank `payment_test_id`;
- blank `payment_test_success_signature`.

No real customer key, admin key, token, password or payment credential should be published.

## Local secret scan

Latest local scan: https://machinesignal.it/postman_workspace_secret_scan_20260606.json

Result:

- status: passed;
- collection items: 23;
- sensitive variables: blank;
- secret hits: 0;
- live credits consumed: 0.

## Final checklist before public visibility

1. Import the collection.
2. Import or recreate the environment with blank secrets.
3. Confirm `machinesignal_api_key` is blank or secret.
4. Confirm no real key appears in collection variables.
5. Confirm public docs say sandbox-only.
6. Confirm live payment is not claimed.
7. Confirm no request sends external outreach.
8. Confirm Postman Secret Scanner shows no unresolved secret.
9. Only then ask owner approval to make workspace public.

## Current blocker

The Codex browser reached the Postman sign-in page. External import into the Postman account requires an active user session. No password or login token was entered by Codex.

## Next safe action

After the owner signs into Postman, import the collection URL above, attach the blank environment template and keep the workspace private until the final scan passes.
