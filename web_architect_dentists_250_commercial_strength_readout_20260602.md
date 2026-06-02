# Web Architect commercial strength evidence test - dentists 250 Lombardia - 2026-06-02

## Executive result

The Web Architect evidence layer improved the machine-to-machine purchase funnel while preserving beta safety controls.

- Market: dentists and dental clinics
- Area: Lombardia
- Targets scored: 250
- Ledger backend: durable_object
- Audit reconciliation: True
- Real payments executed: False
- External contacts executed: False

## Before vs after

| Metric | Before Web Architect | After Web Architect |
|---|---:|---:|
| Total simulated revenue EUR | 420.44 | 552.95 |
| Downstream revenue EUR | 271.44 | 403.95 |
| Downstream per target EUR | 1.0858 | 1.6158 |
| Deep Analysis orders | 27 | 36 |
| Action Pack orders | 1 | 11 |
| Strong commercial strength | 1 | 11 |

## New result details

```json
{
  "decisions": {
    "buy_deep_analysis": 36,
    "nurture": 96,
    "watchlist": 118
  },
  "commercial_strength": {
    "medium": 121,
    "weak": 118,
    "strong": 11
  },
  "purchases": {
    "target_discovery": 1,
    "deep_analysis": 36,
    "nurture_signal": 96,
    "action_pack": 11
  }
}
```

## Agent meeting readout

- Web Architect AI: the new `web_architect_review` confirms website, sector and local-market evidence before allowing controlled downstream action.
- Scoring Optimizer: strong cases increased from 1 to 11 without turning the full list into high spend.
- API Product Manager: `web_architect_review` is now part of the score contract and should be exposed in OpenAPI, llms.txt and product catalog.
- Admin & Finance Controller: this supports an optimized P&L scenario, but it should remain separate from the conservative baseline until more tests confirm it.
- Compliance/Data Quality: beta remains safe: no real payment and no external contact were executed.

## Business interpretation

This is the first evidence that the Architetto Web AI can materially improve the commercial funnel. It does not sell to humans; it gives the customer machine more evidence before spending on an Action Pack. The result is stronger than the previous dentists 250 test and makes the dental/clinic vertical the best candidate for the first machine-facing demo and early beta monetization.

## Recommended next step

Keep two P&L readings:

- conservative baseline: dentists 250 before Web Architect optimization;
- optimized scenario: dentists 250 with Web Architect evidence.

The next technical step is to publish the updated machine-readable docs and keep testing whether `web_architect_review` remains selective on non-dental verticals.
