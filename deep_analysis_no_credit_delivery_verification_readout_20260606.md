# MachineSignal - Deep Analysis No-Credit Delivery Verification

Generated at: 2026-06-06T08:29:46.521Z

Status: PASS

Mode: NoCreditDeliveryShapeVerification

## Scope

- Worker base URL: https://machinesignal-api.beta-878.workers.dev
- Live credits consumed: `0`
- Live payment executed: `false`
- Live external contact executed: `false`
- Local simulation only: `true`

## Live Worker Checks

- Product catalog reachable: `200`
- llms.txt reachable: `200`
- Deep Analysis output fields include: `commercial_evidence`, `machine_decision_matrix`, `action_pack_purchase_gate`, `crm_summary_payload`, `sector_specific_signals`, `evidence_limitations`
- Deep Analysis contract visible in llms.txt: `true`

## Local Delivery Shape

- Product code: `deep_analysis`
- Delivery type: `deep_opportunity_analysis`
- Version: `domain_specific_commercial_evidence_v1`
- Sector code: `dentists_clinics`
- Commercial evidence items: `4`
- Stop rules: `5`
- Action Pack gate: `conditional`
- Local simulated credit event: `1`

## Conclusion

The upgraded Deep Analysis delivery contract is visible in the live Worker documentation and produces the expected commercial evidence structure in local no-credit simulation.

## Recommended Next Step

If live delivery persistence must be verified, run one bounded Deep Analysis purchase intent with a new idempotency key and stop after one credit.
