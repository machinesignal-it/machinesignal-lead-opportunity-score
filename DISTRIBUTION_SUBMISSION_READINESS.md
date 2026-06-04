# MachineSignal Distribution Submission Readiness

Date: 2026-06-04

Status: ready for sandbox-only publication drafts.

## What changed

MachineSignal now has a single public submission pack for API directories, Postman-style public workspaces and marketplace drafts:

- Distribution index: https://machinesignal.it/distribution/
- Marketplace submission pack: https://machinesignal.it/distribution/marketplace-submission-pack.json
- Postman workspace draft: https://machinesignal.it/distribution/postman-public-workspace-draft.json
- Sandbox Buyer Kit listing: https://machinesignal.it/distribution/sandbox-buyer-kit-listing.json
- Postman public collection smoke report: https://machinesignal.it/postman_public_collection_smoke_report_20260604.md
- Postman public collection smoke JSON: https://machinesignal.it/postman_public_collection_smoke_summary_20260604.json

## Recommended order

1. Postman Public API Network draft.
2. Own-domain discovery surfaces.
3. RapidAPI-style provider draft.
4. Generic API directories.
5. MCP and agent registries after the MCP wrapper is ready.

## Publication rule

Publish only as sandbox/test documentation for now.

Do not claim live checkout, real payments or automatic external outreach. Real monetization remains blocked until legal, fiscal, privacy, invoicing, refund and payment-provider controls are complete.

## Latest Postman validation

The public collection smoke test passed. The test confirmed that the public collection contains the required machine-first requests, exposes no real API keys, uses sandbox payment mode, and can complete score, Deep Analysis, Action Pack, payment-test webhook and reconciliation without real payment, external contact or fiscal invoice.

## Why Postman first

Postman is the best next controlled step because it lets software and developers import a collection, create a sandbox key and run the machine buyer flow without touching real payments.

## What still needs human approval

- Making an external workspace or listing public.
- Adding real API keys.
- Enabling real payments.
- Publishing legal or fiscal commitments.
- Submitting to a marketplace that creates commercial obligations.
