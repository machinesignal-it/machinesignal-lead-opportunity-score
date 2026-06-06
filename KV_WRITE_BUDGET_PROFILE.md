# MachineSignal - KV Write Budget Profile

Version: 2026-06-05

## Why This Exists

Cloudflare warned that the daily Workers KV free-tier put limit was exceeded. That does not mean the MachineSignal public site is down, and it does not mean the machine discovery files are broken. It means automated tests can create too many backend write operations if they create sandbox customers or run write-heavy flows without limits.

This profile tells agents and machines which calls are safe for daily checks and which calls must be treated as controlled write-budget tests.

## Practical Rule

Daily automation should run in `NoWrite` mode:

- public discovery only;
- GET requests only;
- no sandbox customer creation;
- no score credit consumption;
- no purchase intent creation;
- no payment-test state creation.

Full tests should be manual and bounded.

## Estimated Write Budget

| Endpoint group | KV puts with Durable Object | Durable Object writes | Daily automation rule |
|---|---:|---:|---|
| GET public discovery endpoints | 0 | 0 | Safe |
| GET authenticated read endpoints | 0 | 0 | Safe |
| POST `/v1/sandbox/customers` | 3 | 1 | Manual only |
| POST `/v1/beta/customers` | 2 | 1 | Admin manual only |
| PATCH `/v1/beta/customers/{customer_id}` | 2 | 1 | Admin manual only |
| POST `/v1/lead-opportunity-score` | 0 | 1 | Bounded only |
| POST `/v1/purchase-intent` | 0 | 1 | Bounded only |
| POST `/v1/payment-test/intents` | 0 | 1 | Bounded only |
| POST `/v1/payment-test/webhooks/stripe` | 0 | 1 | Bounded only |

If Durable Object is unavailable, ledger writes can fall back to KV. In that case each ledger-writing POST may add one KV put.

## What Consumes KV

The main KV risk is customer record storage:

- sandbox customer creation writes the sandbox daily-limit tracker;
- sandbox or beta customer creation writes API-key lookup records;
- customer updates rewrite customer records.

The score ledger is intended to use Durable Object storage, not KV, after the ledger migration.

## Agent Instructions

1. Start every day with `monitoring/machinesignal_daily_machine_buyer_monitor.ps1` in default `NoWrite` mode.
2. Use public files first: `llms.txt`, `machine-onboarding.json`, `product-catalog.json`, OpenAPI, MCP manifests.
3. Reuse existing sandbox or beta keys for test sessions.
4. Use an `Idempotency-Key` for every write endpoint.
5. Do not run loops that create sandbox customers.
6. Run `-Mode Full` only after deciding the daily write budget.
7. Escalate before any paid Cloudflare upgrade decision.

## Recommended Next Test

Deploy the upgraded Deep Analysis delivery and run a no-credit retrieval review first. Do not buy more Action Packs for now. The goal is to confirm that:

- Deep Analysis gives a buyer machine concrete reasons to spend more;
- sector-specific evidence is stronger than generic website commentary;
- Action Pack is triggered only after clear commercial evidence;
- no external action is executed without approval;
- no real payment, external contact or real invoice occurs during beta tests.

## Latest Bounded Probe

Last run: 2026-06-05T11:16:32

Status: `PASS`

- New sandbox customer created: `false`
- Target discovery order created: `false`
- Score requests: `1`
- Purchase intents: `1`
- Ledger backend before: `durable_object`
- Ledger backend after: `durable_object`
- Expected KV puts with Durable Object: `0`
- Expected Durable Object writes: `2`
- Real payment executed: `false`
- External contact executed: `false`

Machine-readable summary: https://machinesignal.it/bounded_write_budget_probe_summary_20260605.json

Report: https://machinesignal.it/bounded_write_budget_probe_report_20260605.md

## Latest Score Volume Probe

Last run: 2026-06-05T11:41:18

Status: `PASS`

- Score requests: `10`
- New sandbox customer created: `false`
- Target discovery order created: `false`
- Purchase intents created: `0`
- Ledger backend before: `durable_object`
- Ledger backend after: `durable_object`
- Score credits before: `1193`
- Score credits after: `1183`
- Score credit delta: `10`
- Expected KV puts with Durable Object: `0`
- Expected Durable Object writes: `10`
- Real payment executed: `false`
- External contact executed: `false`

Machine-readable summary: https://machinesignal.it/bounded_score_volume_probe_summary_20260605.json

Rows CSV: https://machinesignal.it/bounded_score_volume_probe_rows_20260605.csv

Report: https://machinesignal.it/bounded_score_volume_probe_report_20260605.md

## Latest Score Volume Quality Review

Generated at: 2026-06-05T11:51:06

Status: `PASS`

- Reviewed rows: `10`
- Decision-rule matches: `10`
- Commercial review-needed rows: `0`
- Low-confidence nurture caution rows: `3`
- Conclusion: the 10-score batch is commercially coherent and conservative enough to proceed to a bounded 25-score test.
- Caution: nurture at confidence `0.52-0.54` should remain low-cost only.

Machine-readable summary: https://machinesignal.it/score_volume_quality_review_summary_20260605.json

Rows CSV: https://machinesignal.it/score_volume_quality_review_rows_20260605.csv

Report: https://machinesignal.it/score_volume_quality_review_report_20260605.md

## Latest Bounded Score Volume 25 Probe

Last run: 2026-06-05T12:11:29

Status: `PASS`

- Score requests: `25`
- New sandbox customer created: `false`
- Target discovery order created: `false`
- Purchase intents created: `0`
- Ledger backend before: `durable_object`
- Ledger backend after: `durable_object`
- Score credits before: `1183`
- Score credits after: `1158`
- Score credit delta: `25`
- Expected KV puts with Durable Object: `0`
- Expected Durable Object writes: `25`
- Real payment executed: `false`
- External contact executed: `false`

Decision distribution:

- `buy_deep_analysis`: `3`
- `watchlist`: `12`
- `nurture`: `8`
- `needs_verification`: `2`

Machine-readable summary: https://machinesignal.it/bounded_score_volume_25_probe_summary_20260605.json

Rows CSV: https://machinesignal.it/bounded_score_volume_25_probe_rows_20260605.csv

Report: https://machinesignal.it/bounded_score_volume_25_probe_report_20260605.md

## Latest Score Volume 25 Quality Review

Generated at: 2026-06-05T15:08:29

Status: `PASS`

- Reviewed rows: `25`
- Decision-rule matches: `25`
- Next-product rule matches: `25`
- Commercial review-needed rows: `0`
- Low-confidence nurture caution rows: `4`
- High-score low-confidence verification rows: `1`
- Near-threshold watchlist rows: `5`
- Conclusion: the 25-score batch is commercially coherent and still conservative enough to proceed to a bounded purchase-intent simulation for the 3 `buy_deep_analysis` rows only.

Machine-readable summary: https://machinesignal.it/score_volume_25_quality_review_summary_20260605.json

Rows CSV: https://machinesignal.it/score_volume_25_quality_review_rows_20260605.csv

Report: https://machinesignal.it/score_volume_25_quality_review_report_20260605.md

## Latest Bounded Deep Analysis Purchase Probe

Last run: 2026-06-05T16:37:33

Status: `PASS`

- Source quality review: `score-volume-25-quality-review-20260605`
- Candidate rows: `3`
- Existing Deep Analysis orders found: `1`
- New Deep Analysis purchase intents created: `2`
- Action Pack purchase intents created: `0`
- Ledger backend before: `durable_object`
- Ledger backend after: `durable_object`
- Deep Analysis credits before: `44`
- Deep Analysis credits after: `42`
- Deep Analysis credit delta: `2`
- Expected KV puts with Durable Object: `0`
- Expected Durable Object writes: `2`
- Real payment executed: `false`
- External contact executed: `false`
- Duplicate Deep Analysis orders avoided: `true`

Machine-readable summary: https://machinesignal.it/bounded_deep_analysis_purchase_probe_summary_20260605.json

Rows CSV: https://machinesignal.it/bounded_deep_analysis_purchase_probe_rows_20260605.csv

Report: https://machinesignal.it/bounded_deep_analysis_purchase_probe_report_20260605.md

## Latest Deep Analysis Delivery Quality Review

Generated at: 2026-06-05T16:58:23

Status: `PASS`

- Reviewed deliveries: `3`
- Contract-valid deliveries: `3`
- Synthetic demo deliveries: `3`
- Commercial review-needed rows: `0`
- Deep Analysis credit delta: `0`
- Action Pack credit delta: `0`
- Expected KV puts with Durable Object: `0`
- Expected Durable Object writes: `0`
- Real payment executed: `false`
- External contact executed: `false`
- Conclusion: the Deep Analysis delivery contract is valid, but content is still synthetic beta output. This validates the machine buying flow, not yet final commercial-grade Deep Analysis value.

Machine-readable summary: https://machinesignal.it/deep_analysis_delivery_quality_review_summary_20260605.json

Rows CSV: https://machinesignal.it/deep_analysis_delivery_quality_review_rows_20260605.csv

Report: https://machinesignal.it/deep_analysis_delivery_quality_review_report_20260605.md

## Latest Bounded Action Pack Contract Probe

Last run: 2026-06-05T18:07:15

Status: `PASS`

- Source Deep Analysis delivery review: `deep-analysis-delivery-quality-review-20260605`
- Domain tested: `clinic3.it`
- Source score: `81`
- Source confidence: `0.88`
- New Action Pack purchase intents created: `1`
- Action Pack credits before: `18`
- Action Pack credits after: `17`
- Action Pack credit delta: `1`
- Contract checks passed: `19 / 19`
- Approval gate default state: `blocked`
- Send email blocked without approval: `true`
- Expected KV puts with Durable Object: `0`
- Expected Durable Object writes: `1`
- Real payment executed: `false`
- External contact executed: `false`

Conclusion: the Action Pack contract is valid for one strongest reviewed row. It produced CRM, workflow and webhook payloads and kept external actions blocked by default. This validates the machine contract, not yet final commercial-grade value.

Machine-readable summary: https://machinesignal.it/bounded_action_pack_contract_probe_summary_20260605.json

Rows CSV: https://machinesignal.it/bounded_action_pack_contract_probe_rows_20260605.csv

Report: https://machinesignal.it/bounded_action_pack_contract_probe_report_20260605.md

## Latest Deep Analysis Content Upgrade

Generated at: 2026-06-06

Status: `PASS`

- Mode: `NoCreditProductUpgrade`
- Product: `deep_analysis`
- Version: `domain_specific_commercial_evidence_v1`
- Credits consumed: `0`
- Real payment executed: `false`
- External contact executed: `false`
- Added `commercial_evidence`
- Added `machine_decision_matrix`
- Added `action_pack_purchase_gate`
- Added `crm_summary_payload`
- Added stronger sector-specific signals and stop rules

Machine-readable summary: https://machinesignal.it/deep_analysis_content_upgrade_summary_20260606.json

Report: https://machinesignal.it/deep_analysis_content_upgrade_readout_20260606.md
