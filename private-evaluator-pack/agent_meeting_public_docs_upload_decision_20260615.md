# MachineSignal - Agent Meeting On Public Docs Upload Decision - 2026-06-15

## Meeting Scope

Question for the agent team:

Should MachineSignal upload the locally aligned public docs to the live website now?

Files currently aligned locally:

- `product-catalog.json`
- `machine-onboarding.json`
- `llms.txt`

Current validation:

- local validation probe: PASS;
- checks passed: 28/28;
- commercial status: `not_live`;
- go-live: `no_go`;
- FTP upload executed: false;
- live publication executed: false.

This meeting does not upload files and does not approve paid beta.

## Agent Feedback

### Business Orchestrator

Verdict: conditional GO for publishing the three files, but only as sandbox/readiness documentation.

Reason:

The live website currently risks showing older prices and less explicit guardrails. Publishing the aligned files would reduce confusion for machines reading the service.

Condition:

No copy may imply paid beta is active.

### API Product Manager

Verdict: GO for publishing `product-catalog.json`, `machine-onboarding.json` and `llms.txt`.

Reason:

These files are machine contracts. If they remain stale, machines may consume old pricing or weaker policy status.

Condition:

After upload, run a live GET validation on the three URLs.

### Data Quality & Compliance

Verdict: GO with caution.

Reason:

The updated files strengthen boundaries around personal data and real customer data.

Condition:

Do not add any flow that asks for real customer data. Keep `personal_data_allowed: false`.

### Legal & Risk

Verdict: conditional GO.

Reason:

The updated wording is safer than the old wording because it states `not_live`, `no_go`, `paid_beta: not_approved`, and non-final legal/privacy status.

Condition:

Do not publish these files as final legal terms or privacy policy. They are machine-readable product/status docs only.

### Admin & Finance Controller

Verdict: conditional GO.

Reason:

The updated files reduce pricing inconsistency. The price alignment is useful before any machine reads the catalog.

Condition:

No payment provider, invoice, fiscal process or checkout is activated.

### Security & Abuse Control

Verdict: GO with post-upload validation.

Reason:

The files do not contain secrets and explicitly keep production keys blocked.

Condition:

After upload, scan the live files for accidental secrets and confirm `production_keys_allowed: false`.

### Growth & Distribution

Verdict: GO.

Reason:

Machine discovery depends on public docs being current. `llms.txt` is especially important because machines may start there.

Condition:

No marketplace or external publication beyond updating own site files.

### Sales Automation

Verdict: GO, but do not treat this as sales launch.

Reason:

This is not outreach. It only makes the machine-facing docs clearer.

Condition:

No email, no external contact, no lead capture campaign.

### Post-Sale & Support

Verdict: GO.

Reason:

The updated onboarding clarifies support/status/payment-test expectations.

Condition:

Do not promise a production SLA.

### Customer Feedback

Verdict: GO.

Reason:

If a technical evaluator checks the website, it is better that they see the current safe status rather than old beta prices.

Condition:

Keep the contact/support path informational, not a sales push.

### Agent HR & Continuous Learning

Verdict: GO with learning log.

Reason:

This is a good example of agent process: identify stale public docs, prepare NoWrite patch, validate locally, then ask owner before upload.

Condition:

After upload, record validation result and any drift in Company Brain if needed.

## Consolidated Decision

Agent team recommendation:

`approve_ftp_upload_of_three_aligned_docs_to_live_site`

Confidence:

High, with guardrails.

Reason:

The update makes the public machine-facing documentation more accurate and safer. It does not activate paid beta, does not collect payments and does not change commercial go-live status.

## What Should Be Uploaded If Owner Approves

Upload only:

1. `machinesignal_site/product-catalog.json`
2. `machinesignal_site/machine-onboarding.json`
3. `machinesignal_site/llms.txt`

Do not upload:

- legal/privacy final terms;
- payment provider files;
- invoice files;
- marketplace files;
- hosted MCP public launch materials;
- anything involving production keys.

## Required Post-Upload Checks

After upload, run live checks:

- `https://machinesignal.it/product-catalog.json`
- `https://machinesignal.it/machine-onboarding.json`
- `https://machinesignal.it/llms.txt`

Confirm:

- `commercial_status: not_live`;
- `go_live: no_go`;
- `paid_beta: not_approved`;
- Target Discovery Pack 250 price is EUR 249;
- Score Pack 1k price is EUR 119;
- no real payment enabled;
- no payment-method collection;
- no invoice issued;
- no production keys allowed;
- no personal data allowed.

## Final Guardrail

Uploading these three files would be a documentation alignment step only.

It would not authorize paid beta, commercial go-live, real payments, invoices, payment-method collection, real-data processing, personal-data processing, external outreach, public paid marketplace publication, hosted MCP public launch or MCP registry publication.
