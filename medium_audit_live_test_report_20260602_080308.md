# Medium audit live test - 20260602_080308

## Summary

- Customer: `medium_audit_20260602_080308`
- Ledger backend: `durable_object`
- Reconciliation OK: `True`
- Ready for real payments: `False`
- Real payment executed: `False`
- External contact executed: `False`
- Scores completed: `50`
- Purchases completed: `39`
- Orders count: `39`
- Simulated revenue: `111.75 EUR`

## Decisions

- buy_deep_analysis: 4
- needs_verification: 21
- watchlist: 14
- nurture: 10
- discard: 1

## Purchases

- deep_analysis: 4
- action_pack: 4
- verification: 21
- nurture_signal: 10

## Product reconciliation

- score_pack_1k: credits_used=50, orders=0, simulated_revenue_eur=4.95, credits_reconcile=True
- deep_analysis_pack_100: credits_used=4, orders=4, simulated_revenue_eur=11.96, credits_reconcile=True
- verification_pack_100: credits_used=21, orders=21, simulated_revenue_eur=21, credits_reconcile=True
- nurture_signal_pack_100: credits_used=10, orders=10, simulated_revenue_eur=10, credits_reconcile=True
- action_pack_25: credits_used=4, orders=4, simulated_revenue_eur=63.84, credits_reconcile=True

## Interpretation

The medium-volume audit confirms that 50 score events, machine purchase intents and order history reconcile on the Durable Object ledger. Real payments and external contact remain disabled.
