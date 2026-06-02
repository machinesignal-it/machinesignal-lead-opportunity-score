# Target Discovery 250 dentists Lombardia commercial strength test - 2026-06-02

## Executive result

The 250-target dentists/dental clinics test passed technically and is the strongest 250-target benchmark so far.

- Market: dentists and dental clinics
- Area: Lombardia
- Corrected list: 250 unique score-ready domains.
- Scores completed: 250
- Ledger backend: durable_object
- Audit reconciliation: True
- Real payments executed: False
- External contacts executed: False

## Revenue simulation

- Total simulated revenue: 420.44 EUR
- Target Discovery revenue: 149.0 EUR
- Downstream revenue: 271.44 EUR
- Downstream revenue per target: 1.0858 EUR

## Decision mix

```json
{
  "buy_deep_analysis": 27,
  "needs_verification": 95,
  "watchlist": 73,
  "nurture": 55
}
```

## Commercial strength mix

```json
{
  "medium": 78,
  "weak": 171,
  "strong": 1
}
```

## Purchases

```json
{
  "target_discovery": 1,
  "deep_analysis": 27,
  "verification": 95,
  "nurture_signal": 55,
  "action_pack": 1
}
```

## Benchmark comparison

| Metric | Dentists 100 | Dentists 250 | Real estate 250 | Aesthetic medicine 250 |
|---|---:|---:|---:|---:|
| Targets scored | 100 | 250 | 250 | 250 |
| Total simulated revenue EUR | 301.6 | 420.44 | 399.7 | 385.63 |
| Downstream revenue EUR | 152.6 | 271.44 | 250.7 | 236.63 |
| Downstream per target EUR | 1.526 | 1.0858 | 1.0028 | 0.9465 |
| Deep Analysis orders | 14 | 27 | 5 | 12 |
| Action Pack orders | 4 | 1 | 0 | 0 |
| Strong commercial strength | 4 | 1 | 0 | 0 |

## Agent meeting readout

- Data Quality & Compliance: the previous dental pack had too few unique score-ready domains. The corrected 250-domain list passes the delivery rule.
- Scoring Optimizer: dentists/dental clinics are still the strongest vertical because they are the only 250-target test with Action Pack revenue.
- API Product Manager: the commercial_strength gate is conservative: only 1 of 27 Deep Analysis orders converted to Action Pack.
- Growth & Distribution: dental/clinic should remain the first vertical shown in machine-facing examples and partner materials.
- Admin & Finance Controller: update P&L evidence and positioning, but do not inflate revenue assumptions from the 100-target test. Use the 250-target benchmark as the more conservative scaling baseline.

## Business interpretation

The 250-target dental test confirms that the product can scale technically and can still produce high-margin add-on demand. However, the downstream revenue per target is lower than the 100-target test, so the correct business conclusion is disciplined: dentists/clinics remain the primary vertical, but the P&L should use conservative 250-target economics until more verticals produce Action Pack revenue.

## Recommended next step

Use dentists/clinics as the lead machine-facing demo vertical. The next product improvement should focus on increasing `strong` commercial strength without weakening quality controls, for example by adding better evidence signals before recommending Action Pack.
