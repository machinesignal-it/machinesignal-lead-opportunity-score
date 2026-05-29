# Domain Enrichment product update - 2026-05-29

MachineSignal now exposes `domain_enrichment` as a machine-buyable beta product.

## Product contract

- Catalog product: `domain_enrichment_pack_100`
- Purchase-intent product code: `domain_enrichment`
- Beta price: EUR 149
- Unit: 100 completed domain-enrichment decisions
- Endpoint: `POST /v1/purchase-intent`

## What the product returns

For each processed target record, the workflow returns one of three decisions:

- `verified_domain`: the target can move to `/v1/lead-opportunity-score`;
- `candidate_not_reliable`: a possible domain exists, but confidence is not sufficient;
- `no_reliable_domain`: no reliable public domain was found.

The product does not promise that every target will have a website domain. Its value is to prevent low-confidence records from entering the scoring workflow.

## Test finding

A stricter automated pilot confirmed that generic search alone is not strong enough as the only enrichment source. The recommended next step is to connect stronger machine-readable sources, such as structured directories, search APIs, knowledge graph providers or other licensed enrichment sources.

No human outreach, email or phone contact is required for this product flow.
