# Target Discovery 250 real estate Lombardia commercial strength test - 2026-06-02

## Executive result

The 250-target real estate test passed technically after enforcing unique-domain target quality.

- Market: real estate agencies
- Area: Lombardia
- Input quality issue found first: the previous 250-row list contained only 227 unique domains.
- Corrected list: 250 unique domains.
- Scores completed: 250
- Ledger backend: durable_object
- Audit reconciliation: True
- Real payments executed: False
- External contacts executed: False

## Revenue simulation

- Total simulated revenue: 399.7 EUR
- Target Discovery revenue: 149.0 EUR
- Downstream revenue: 250.7 EUR
- Downstream revenue per target: 1.0028 EUR

## Decision mix

```json
{
  "needs_verification": 192,
  "watchlist": 32,
  "nurture": 19,
  "buy_deep_analysis": 5,
  "discard": 2
}
```

## Commercial strength mix

```json
{
  "weak": 226,
  "medium": 24
}
```

## Purchases

```json
{
  "target_discovery": 1,
  "verification": 192,
  "nurture_signal": 19,
  "deep_analysis": 5
}
```

## Agent meeting readout

- Data Quality & Compliance: the first failed run is commercially useful; a 250-target pack must validate unique domains before it is charged or delivered.
- Scoring Optimizer: real estate is currently too verification-heavy: 192 of 250 targets require verification and only 5 recommend deep analysis.
- API Product Manager: the commercial_strength gate behaved correctly. No Action Pack was purchased because no target reached strong commercial strength.
- Growth & Distribution: do not use real estate as the primary monetization benchmark yet. It can be a secondary proof that the system works across sectors.
- Admin & Finance Controller: P&L should not be increased from this result. Add it as a conservative benchmark and keep dental/healthcare as higher-priority tests.

## Business interpretation

This result is good for technical robustness and ledger control, but weaker for high-margin monetization. The real estate segment generated useful score and verification revenue, but did not naturally trigger Action Pack purchases under the current commercial-strength rules. That means the model should keep real estate as a broad, lower-ticket feed/verification use case unless later sector-specific evidence improves confidence.

## Recommended next step

Run a 250-target test on a higher-intent vertical, preferably dentists/clinics or another professional service segment, then compare:

- downstream revenue per target;
- buy_deep_analysis rate;
- commercial_strength strong rate;
- Action Pack conversion after Deep Analysis;
- duplicate/quality failure rate before delivery.
