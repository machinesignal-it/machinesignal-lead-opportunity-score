# MachineSignal - Bounded Live Deep Analysis Delivery Persistence Probe

Finished at: 2026-06-06T10:39:23

Status: PASS

Mode: BoundedLiveDeepAnalysisDeliveryPersistenceProbe

## Scope

- Domain: deep-persistence-dental-demo-20260606103921.it
- Product: deep_analysis
- Order intent: ord_e128da05
- Idempotency key: bounded-live-deep-analysis-persistence-20260606-20260606103921
- Action Pack purchase created: false
- Real payment executed: false
- External contact executed: false

## Credit Movement

- Deep Analysis credits before: 42
- Deep Analysis credits after: 41
- Deep Analysis credit delta: 1
- Action Pack credits before: 17
- Action Pack credits after: 17
- Action Pack credit delta: 0

## Delivery Contract

- Delivery type: deep_opportunity_analysis
- Version: domain_specific_commercial_evidence_v1
- Sector code: dentists_clinics
- Commercial evidence items: 4
- Stop rules: 5
- Action Pack gate: conditional
- Next product allowed: conditional

## Checks

- Checks passed: 21 / 21
- Order retrieval status: 200
- Stored delivery version persisted: true
- Stored Action Pack gate persisted: true

## Conclusion

The live Deep Analysis delivery persistence probe created one Deep Analysis order, consumed exactly one Deep Analysis credit, persisted the upgraded delivery fields, and did not create any Action Pack, payment or external contact.

## Recommended Next Step

Stop live credit-consuming probes and use this persisted delivery as evidence before updating commercial materials or deciding whether to test one Action Pack again.
