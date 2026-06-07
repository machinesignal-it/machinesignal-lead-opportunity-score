# MachineSignal Postman Private Workspace Checklist

Generated: 2026-06-07

Status: ready for private/team workspace setup. Public Postman publication remains blocked until owner approval.

## Objective

Prepare a Postman workspace that lets machines, developers, CRMs and AI-agent workflows evaluate MachineSignal in sandbox mode without exposing secrets, activating live payments or contacting external targets.

This checklist is setup-only. It does not require live payment, public publication or human outbound sales.

## Workspace Settings

| Setting | Required value |
| --- | --- |
| Workspace name | `MachineSignal Lead Opportunity Score API` |
| Initial visibility | Private or team only |
| Public visibility | Blocked until owner approval |
| Primary import source | `https://machinesignal.it/postman_public_collection.json` |
| Environment source | `https://machinesignal.it/postman_public_environment_template.json` |
| Description source | `https://machinesignal.it/distribution/postman-public-workspace-draft.json` |
| Evidence source | `https://machinesignal.it/machine_beta_evidence_brief_20260607.html` |

## Workspace Folder Structure

Use this folder order after import:

1. `00 Public Discovery`
2. `01 Sandbox Customer`
3. `02 Authenticated Onboarding`
4. `03 Lead Scoring`
5. `04 Purchase Intent`
6. `05 Payment Test`
7. `06 Orders And Deliveries`
8. `07 Evidence And Readiness`

If Postman imports with a different order, agents may reorganize folders only inside the private/team workspace.

## Environment Variables

| Variable | Type | Initial value | Rule |
| --- | --- | --- | --- |
| `base_url` | default | `https://machinesignal-api.beta-878.workers.dev` | Public value allowed. |
| `machinesignal_api_key` | secret | blank | Never publish a real key. |
| `beta_customer_id` | secret | blank | Never publish a real customer ID if tied to a private test. |
| `payment_test_id` | default | blank | Sandbox/test only. |
| `order_intent_id` | default | blank | Sandbox/test only. |
| `payment_test_success_signature` | secret | blank | Never publish real signature values. |

## Import Steps

1. Create or open the MachineSignal Postman workspace.
2. Keep visibility private or team.
3. Import the collection from `https://machinesignal.it/postman_public_collection.json`.
4. Import or recreate the environment from `https://machinesignal.it/postman_public_environment_template.json`.
5. Confirm all secret variables are blank.
6. Set `base_url` to the public Worker URL only.
7. Add the workspace description from `distribution/postman-public-workspace-draft.json`.
8. Add evidence links in the workspace description or documentation.
9. Do not make the workspace public.

## NoWrite Setup Checks

These checks are safe because they only verify setup:

- collection imported;
- environment exists;
- `base_url` is present;
- secret variables are blank;
- documentation says sandbox-only;
- evidence brief is linked;
- sandbox-only publication pack is linked;
- no real API key is visible;
- no live payment is claimed.

## Optional Sandbox Smoke Test

Only after explicit approval, agents may run a small sandbox smoke test:

1. `GET /health`
2. `GET /machine-onboarding.json`
3. `GET /product-catalog.json`
4. `POST /v1/sandbox/customers`
5. Store the returned sandbox key in `machinesignal_api_key` as secret.
6. Run one score call.
7. Read usage.

Stop there unless the owner approves deeper sandbox checks.

## Blocked Actions

Agents must not:

- make the workspace public;
- publish real API keys;
- publish admin keys;
- publish FTP, Cloudflare, GitHub or Postman tokens;
- activate live payments;
- claim paid plans are live;
- run external outreach;
- contact target companies;
- issue invoices or fiscal documents;
- create legal or SLA commitments.

## Public Visibility Gate

Before the workspace can become public, all checks must pass:

1. Postman secret scan has no unresolved issue.
2. MachineSignal public secret scan is passed.
3. Environment secrets are blank or marked secret.
4. Collection variables contain no real key.
5. Workspace text says sandbox-only.
6. Live payment is not claimed.
7. Evidence brief and readiness monitor are linked.
8. Owner approval is recorded.

## Current Recommendation

Prepare the workspace privately. Use it as an internal machine-buyer evaluation surface. Do not make it public yet.

