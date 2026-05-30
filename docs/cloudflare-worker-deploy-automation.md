# Cloudflare Worker deploy automation

This repository includes a GitHub Actions workflow that can deploy the MachineSignal Worker to Cloudflare.

Workflow file:

`.github/workflows/deploy-cloudflare-worker.yml`

## Required GitHub secret

Create this repository secret before running the workflow:

`CLOUDFLARE_API_TOKEN`

The token must be created in Cloudflare with permissions to edit/deploy Workers for the account that owns:

- account id: `8782dd68928c8e75daac4d5d5dcc4344`
- Worker name: `machinesignal-api`

Do not commit the token to the repository.

## How it runs

The workflow runs automatically on pushes to `main` that modify `api_endpoint_minimal/**` or the workflow itself.

It can also be started manually from GitHub Actions with `workflow_dispatch`.

## Expected deploy command

The workflow runs from `api_endpoint_minimal` and executes:

`wrangler deploy`

Wrangler reads `api_endpoint_minimal/wrangler.toml`, including the Worker name, account id and KV namespace binding.
