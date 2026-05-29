# MachineSignal - Postman Public Workspace Update

## Goal

Make the Postman workspace usable as a machine-first API discovery and testing surface.

## Collection URL To Import

```text
https://machinesignal.it/postman_collection.json
```

## Workspace Description

MachineSignal Lead Opportunity Score API is a private technical beta for CRM systems, RevOps workflows and AI agents. The API lets machines score business domains, inspect credit usage, create beta purchase intents and retrieve JSON deliveries.

## Collection Must Include

- Fetch machine onboarding manifest
- Fetch OpenAPI schema
- Read authenticated onboarding
- Score business domain
- Create purchase intent
- List orders and deliveries
- Read usage ledger

## Public Workspace Warning

Use this text visibly:

```text
Private technical beta. Protected endpoints require X-API-Key. Public examples are synthetic. Beta purchase intents do not execute real payment and do not contact external targets.
```

## Environment Variables

```text
base_url = https://machinesignal-api.beta-878.workers.dev
machinesignal_api_key = paste_customer_beta_key_here
```

Do not publish real API keys in the workspace.

## Validation Checklist

- Import collection from `https://machinesignal.it/postman_collection.json`.
- Confirm no real API key is present.
- Confirm `machine-onboarding.json` request works without authentication.
- Confirm protected requests show `X-API-Key` placeholder.
- Confirm purchase-intent request includes `Idempotency-Key`.
- Confirm descriptions mention no real payment and no external contact in beta.
