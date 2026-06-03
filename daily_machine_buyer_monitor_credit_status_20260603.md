# MachineSignal Daily Monitor Credit Status

Date: 2026-06-03

## Purpose

Check whether the stored monitor beta key has enough credits to run the daily machine-buyer monitor without consuming the public sandbox creation limit.

## Result

The monitor key is active and usable.

| Product ledger | Purchased | Used | Remaining |
|---|---:|---:|---:|
| score_pack_1k | 200 | 2 | 198 |
| deep_analysis_pack_100 | 50 | 2 | 48 |
| verification_pack_100 | 50 | 0 | 50 |
| nurture_signal_pack_100 | 50 | 0 | 50 |
| action_pack_25 | 20 | 0 | 20 |
| target_discovery_pack_250 | 50 | 2 | 48 |
| domain_enrichment_pack_100 | 10 | 0 | 10 |
| opportunity_feed_monthly | 0 | 0 | 0 |

## Guardrails

- real_payment_executed: false
- external_contact_executed: false

## Operational Reading

The daily monitor currently consumes one `target_discovery`, one score and usually one `deep_analysis` per full run.

At the current rate, the limiting balances are:

- `target_discovery_pack_250`: 48 remaining;
- `deep_analysis_pack_100`: 48 remaining.

This means the monitor can run for about 48 full daily checks before a beta credit top-up is needed.

