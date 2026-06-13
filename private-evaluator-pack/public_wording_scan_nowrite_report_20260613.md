# Public Wording Scan NoWrite - 2026-06-13

Status: reported
Mode: NoWrite scan
Commercial status: not_live
Go-live: no_go

Files scanned: 49
Findings: 5
Publication status: blocked_until_wording_review

## Severity counts

- critical: 3
- high: 2
- medium: 0
- low: 0

## Findings

- CRITICAL README.md:571 pattern `send outreach` -> rewrite as sandbox/pre-live/no-go wording
  - - It does not send outreach emails.
- HIGH README.md:864 pattern `production API key` -> sandbox or draft key policy only
  - The agent review consolidated technical, commercial, compliance/admin/legal and orchestration feedback after the machine-buyer end-to-end rehearsal. The verdict is GO for the next sandbox-only machine-to-machine test and
- CRITICAL api_endpoint_minimal/core.mjs:3926 pattern `send outreach` -> rewrite as sandbox/pre-live/no-go wording
  - "the customer machine would send outreach automatically"
- HIGH api_endpoint_minimal/core.mjs:5968 pattern `guaranteed revenue` -> rewrite as sandbox/pre-live/no-go wording
  - "guaranteed revenue uplift",
- CRITICAL docs/api-directory-listing.md:59 pattern `send outreach` -> rewrite as sandbox/pre-live/no-go wording
  - - Does not send outreach.

## Hard blocks preserved

- real_payments
- invoices
- payment_method_collection
- external_outreach
- real_data_processing
- personal_data_processing
- production_api_key_issuing
- public_paid_marketplace
- hosted_mcp_public
- mcp_registry_publication
- commercial_go_live

## Next action

public_wording_remediation_draft_nowrite