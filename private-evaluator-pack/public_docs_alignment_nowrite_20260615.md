# MachineSignal - Public Docs Alignment NoWrite - 2026-06-15

## Status

Mode: `NoWrite`.

Commercial status: `not_live`.

Go-live status: `no_go`.

This review compares local/public-facing documentation against the latest internal readiness and pricing position. It does not publish files, does not upload to the website, does not contact external users and does not activate paid beta.

## Sources Reviewed

Internal sources:

- `COMPANY_BRAIN.md`
- `company-brain.json`
- `private-evaluator-pack/paid_beta_readiness_pack_nowrite_20260615.md`
- `private-evaluator-pack/terms_privacy_admin_payment_support_draft_pack_nowrite_20260615.md`

Public/local sources:

- `machinesignal_site/llms.txt`
- `machinesignal_site/product-catalog.json`
- `machinesignal_site/machine-onboarding.json`
- `sandbox-buyer-kit/sandbox-buyer-kit.json`
- `docs/postman-public-workspace.md`

## Overall Result

Public docs are directionally aligned with the machine-first model and correctly state that beta purchase intents do not execute real payment.

However, they should not be considered ready for public paid beta alignment yet.

Result:

`alignment_partial_update_recommended_nowrite`

## What Is Aligned

The public/local docs correctly communicate:

- machine-first interface;
- API/OpenAPI/catalog discovery;
- beta purchase intents;
- no real payment in beta;
- no external target contact in beta;
- credits consumed only for valid usable outputs;
- Idempotency-Key requirement;
- order and usage retrieval;
- Postman workspace should not contain real API keys.

## Main Gaps

### Gap 1 - Pricing Version Mismatch

`machinesignal_site/product-catalog.json` and `machinesignal_site/llms.txt` still show older beta prices:

- Target Discovery Pack: EUR 149;
- Score Pack 1k: EUR 99;
- catalog version: `2026-05-29-beta`.

Latest internal Company Brain / P&L position uses:

- Target Discovery Pack 250: EUR 249;
- Score Pack 1k: EUR 119;
- catalog version: `2026-06-14-beta-v22`.

Impact:

High.

Reason:

A machine could read a lower public beta price than the latest internal listino.

Recommended NoWrite action:

Prepare a local public-docs patch proposal, but do not upload until owner approves.

### Gap 2 - Commercial Status Not Explicit Enough

Public docs say beta does not execute real payment, but they do not consistently expose:

- commercial status: `not_live`;
- go-live status: `no_go`;
- paid beta: `not_approved`;
- terms/privacy/admin/payment/support are internal drafts only.

Impact:

Medium-high.

Reason:

Machine consumers should not infer that paid beta is already commercially available.

Recommended NoWrite action:

Add a clear machine-readable status block to catalog/onboarding docs.

### Gap 3 - Legal/Privacy Draft Status Missing

Public docs do not clearly state that:

- terms are not final;
- privacy policy is not final;
- admin/fiscal path is not approved;
- payment flow is test-mode only;
- refunds/credits are simulated in sandbox.

Impact:

Medium.

Reason:

This matters before any paid beta or broader publication.

Recommended NoWrite action:

Prepare wording for public sandbox docs only, not final legal documents.

### Gap 4 - Real Data And Personal Data Boundaries Need Stronger Machine Labeling

Public docs mention beta rules, but should more explicitly say:

- do not submit personal data;
- do not submit confidential customer datasets;
- do not use for person-level outreach enrichment;
- demo/synthetic/public non-personal data only during readiness.

Impact:

Medium.

Recommended NoWrite action:

Add a `data_policy` or `privacy_boundary` block to machine-readable docs.

### Gap 5 - Production Key Status Should Be More Explicit

Docs mention beta keys and API keys, but should clearly separate:

- sandbox/beta keys;
- production keys;
- admin keys;
- production keys blocked until owner/legal/admin/payment/support/cost gates pass.

Impact:

Medium.

Recommended NoWrite action:

Add `key_policy_summary` to onboarding/catalog docs.

## Proposed Public Alignment Fields

If owner later approves a public-docs update, add or align fields like:

```json
{
  "commercial_status": "not_live",
  "go_live": "no_go",
  "paid_beta": "not_approved",
  "payment_mode": {
    "sandbox": "purchase-intent and payment-test only",
    "real_payment_executed": false,
    "payment_method_collection": false,
    "invoice_issued": false
  },
  "legal_privacy_status": {
    "terms_final": false,
    "privacy_final": false,
    "admin_fiscal_path_approved": false,
    "support_sla_final": false
  },
  "data_policy": {
    "personal_data_allowed": false,
    "real_customer_data_allowed": false,
    "allowed_now": [
      "synthetic data",
      "demo-domain tests",
      "public non-personal business signals",
      "NoWrite public observations"
    ]
  },
  "key_policy": {
    "sandbox_keys_allowed": true,
    "production_keys_allowed": false,
    "production_key_gate": [
      "owner approval",
      "legal/privacy review",
      "admin/fiscal approval",
      "payment/support/cost guard readiness"
    ]
  }
}
```

## Recommended Local File Updates Before Publication

Prepare local patch proposals for:

1. `machinesignal_site/product-catalog.json`
2. `machinesignal_site/machine-onboarding.json`
3. `machinesignal_site/llms.txt`
4. `sandbox-buyer-kit/sandbox-buyer-kit.json`

Do not upload to Register.it yet.

Do not publish to GitHub as public commercial claim unless owner approves.

## Readiness Impact

Before alignment:

- Public docs alignment: 74-78%
- Paid-beta readiness: 60-64%
- Commercial go-live: NO-GO

After a NoWrite patch proposal:

- Public docs alignment: 86-90%
- Paid-beta readiness: 63-67%
- Commercial go-live: still NO-GO

After owner-approved publication and legal/admin review:

- Public docs alignment can move above 90%.
- Paid-beta readiness can move toward 70%+.
- Commercial go-live remains NO-GO until payment, fiscal, support and owner approval gates pass.

## Recommended Next Step

`prepare_public_docs_alignment_patch_nowrite`

This means:

- create local patch proposals only;
- update no live website;
- upload nothing by FTP;
- collect no payments;
- issue no invoices;
- do not contact external humans.

## Final Guardrail

This review does not authorize paid beta, commercial go-live, real payments, invoices, payment-method collection, real-data processing, personal-data processing, external outreach, public marketplace publication, hosted MCP public launch or MCP registry publication.
