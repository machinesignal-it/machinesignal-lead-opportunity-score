# MachineSignal - Web Architect cross-vertical safety readout

Date: 2026-06-02

## Purpose

After adding Web Architect evidence to the score response, we tested whether the new logic improves the dentist/odontoiatric clinic funnel without creating false commercial strength in other verticals.

The test used the live Worker API and two existing public target samples:

- 50 real estate targets in Lombardia.
- 50 aesthetic medicine targets in Lombardia.

No real payment was executed. No external contact was executed.

## Result

The Web Architect gate remained selective outside the dentist vertical.

| Vertical | Targets scored | Total simulated revenue | Downstream revenue | Downstream / target | Strong leads | Action Pack candidates | External contact |
|---|---:|---:|---:|---:|---:|---:|---|
| Real estate | 50 | EUR 199.93 | EUR 50.93 | EUR 1.0186 | 0 | 0 | false |
| Aesthetic medicine | 50 | EUR 197.94 | EUR 48.94 | EUR 0.9788 | 0 | 0 | false |

## Interpretation

This is a positive safety signal.

The Web Architect evidence created more strong opportunities in the dentist test, where the commercial objective was website-led improvement for dental practices. In the two control verticals, the same logic did not promote targets to strong and did not unlock Action Pack purchases.

This means the model is not simply inflating revenue by making every scored target look strong. It is applying the stricter evidence gate only when the target, sector and website signals are coherent.

## Roadmap impact

The Web Architect optimization can remain active for the dentist beta funnel.

Before scaling to other niches, each new vertical should receive its own commercial evidence gate. The current dentist-specific evidence should not be reused blindly for real estate or aesthetic medicine.

Recommended next step:

1. Keep dentists / odontoiatric clinics as the main beta vertical.
2. Document the Web Architect evidence as a niche-specific conversion rule.
3. For any second niche, define a separate "strong opportunity" rule before monetization tests.

