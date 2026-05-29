# MachineSignal - GitHub Repository Update Pack

## Repository

`machinesignal-it/machinesignal-lead-opportunity-score`

## Current Connector Status

The GitHub connector is read-only in this session:

- `pull`: true
- `push`: false

The local `gh` CLI is not installed, so this session cannot push directly from shell.

## Files Prepared Locally

- `github_README_machine_signal.md`
- `machinesignal_site/openapi.json`
- `machinesignal_site/postman_collection.json`
- `machinesignal_site/machine-onboarding.json`
- `api_directory_listing_machine_first_20260529.md`
- `postman_public_workspace_update_20260529.md`
- `rapidapi_listing_draft_20260527.md`

## GitHub Files To Update

1. `README.md`
   - replace with `github_README_machine_signal.md`;
   - highlights machine-first flow, manifest, OpenAPI, Postman, purchase intent and orders.

2. `openapi.json`
   - replace with `machinesignal_site/openapi.json`;
   - includes onboarding, purchase intent and orders.

3. `postman_collection.json`
   - replace with `machinesignal_site/postman_collection.json`;
   - includes onboarding, purchase intent and orders.

4. `machine-onboarding.json`
   - add from `machinesignal_site/machine-onboarding.json`.

5. `docs/api-directory-listing.md`
   - add from `api_directory_listing_machine_first_20260529.md`.

6. `docs/postman-public-workspace.md`
   - add from `postman_public_workspace_update_20260529.md`.

## Recommended Commit Message

```text
Update machine-first API discovery package
```

## Why This Matters

The repository should tell machines and technical evaluators exactly how to discover and call MachineSignal:

- public manifest;
- OpenAPI;
- Postman;
- callable Worker base URL;
- API-key protected scoring;
- purchase-intent flow;
- order retrieval;
- no real payment or external contact in beta.
