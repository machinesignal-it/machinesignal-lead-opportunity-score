# MachineSignal - RapidAPI-Style Unpublished Provider Draft Review - 2026-06-08

## Result

Status: completed_rapidapi_unpublished_provider_draft_review

OK: true

Mode: NoWriteRapidApiUnpublishedProviderDraftReview

Primary customer interface: machine

Write calls executed: 0

POST calls executed: 0

External publication executed: false

Live monetization enabled: false

Hosted MCP live: false

## What This Checked

This NoWrite review checks whether the RapidAPI-style unpublished provider draft pack contains enough exact fields for a private marketplace-style draft while keeping all go-live actions blocked.

Machine-first context: the intended reader and buyer interface is a CRM system, AI agent, workflow or other software process.

Approval gate: irreversible external publication remains blocked until owner approval.

Commercial gate: monetization disabled; public paid plans not active; live checkout disabled; marketplace pricing tiers must not be created.

Contact gate: external target contact false; human outbound outreach blocked; do not contact human prospects or target companies.

## Pack Field Checks

| Field | Status |
|---|---|
| rapidapi_style_listing_fields.api_name | OK |
| rapidapi_style_listing_fields.visibility | OK |
| rapidapi_style_listing_fields.monetization | OK |
| rapidapi_style_listing_fields.base_url | OK |
| rapidapi_style_listing_fields.auth_header | OK |
| rapidapi_style_listing_fields.openapi_url | OK |
| source_assets.rapidapi_listing_json | OK |
| source_assets.rapidapi_provider_setup_json | OK |
| endpoint_groups_for_provider_draft | OK |
| draft_pricing_treatment.public_paid_plans_active | OK |
| draft_pricing_treatment.create_marketplace_pricing_tiers | OK |
| blocked_before_public_submit | OK |
| machine_decision.decision | OK |

## Resource Checks

| Resource | Status | HTTP | Bytes | Missing markers | Hard fails |
|---|---|---:|---:|---|---|
| rapidapi_unpublished_provider_draft_pack_json | OK | 200 | 7853 | - | - |
| rapidapi_unpublished_provider_draft_pack_md | OK | 200 | 4123 | - | - |
| rapidapi_listing_json | OK | 200 | 11250 | - | - |
| rapidapi_provider_setup_json | OK | 200 | 5880 | - | - |
| api_directory_rapidapi_checklist_json | OK | 200 | 7141 | - | - |
| private_draft_submission_rehearsal | OK | 200 | 14202 | - | - |
| external_submission_nowrite_review | OK | 200 | 39980 | - | - |
| distribution_readiness_monitor | OK | 200 | 45415 | - | - |
| openapi | OK | 200 | 58945 | - | - |

## Machine Decision

Decision: rapidapi_unpublished_provider_draft_ready

Recommended next step: Use the pack to prepare an owner-supervised private or unpublished RapidAPI-style provider draft. Stop before public submit, paid plan creation, live checkout, production key distribution or external outreach.
