# MachineSignal external machine discoverability readout - 2026-06-03

## Scope

This readout checks whether MachineSignal is easier for machines, API directories, CRM workflows, AI agents and software evaluators to discover and test without human cold email.

## What was changed

- Updated `.well-known/machine-discovery.json` to version `2026-06-03`.
- Updated `machine-discovery-pack.json` to version `2026-06-03`.
- Added search intents for lead opportunity scoring, dentist lead scoring, target discovery for dentists, CRM lead scoring, RevOps workflow scoring and machine-readable sales intelligence.
- Added the dentists beta machine buyer pack to public discovery links.
- Updated API directory submission JSON with dentist-specific keywords and sandbox endpoint.
- Updated RapidAPI draft JSON with dentist-specific tags, product entries and public assets.
- Added `robots.txt` and `sitemap.xml` to the repo tracking set.
- Published the updated website assets to `https://machinesignal.it/`.

## Live verification

All URLs below returned HTTP 200 after FTP publication:

- `https://machinesignal.it/.well-known/machine-discovery.json`
- `https://machinesignal.it/machine-discovery/machine-discovery-pack.json`
- `https://machinesignal.it/distribution/api-directory-submission.json`
- `https://machinesignal.it/distribution/rapidapi-listing.json`
- `https://machinesignal.it/dentists-beta-machine-buyer-pack.json`
- `https://machinesignal.it/DENTISTS_BETA_MACHINE_BUYER_PACK.md`
- `https://machinesignal.it/robots.txt`
- `https://machinesignal.it/sitemap.xml`

Content checks passed:

- `.well-known/machine-discovery.json` exposes `search_intents`, `dentists_beta_machine_buyer_pack` and the primary beta vertical.
- `machine-discovery-pack.json` exposes 8 search intents and the dentist benchmark: 250 targets scored, EUR 552.95 total simulated revenue, EUR 403.95 downstream simulated revenue.
- `api-directory-submission.json` contains `dentist lead scoring API` and the sandbox endpoint.
- `rapidapi-listing.json` contains dentist tags, 7 product entries and the dentists beta pack URL.
- `robots.txt` points machines to `llms.txt`, OpenAPI, product catalog, discovery pack, dentists pack, directory JSON and RapidAPI JSON.
- `sitemap.xml` includes the dentists JSON and Markdown pack.
- `openapi.json` is the current repo version and includes `/v1/sandbox/customers` plus `/v1/admin/sandbox-metrics`.
- `machine-onboarding.json`, `product-catalog.json` and `postman_collection.json` were republished from the current repo package, not the older local site copy.

## External search check

Generic public search does not yet surface MachineSignal for broad queries such as `MachineSignal lead opportunity score API` or `lead opportunity score API`.

This is expected for a newly published domain and does not mean the machine interface failed. It means we should not rely on organic search indexing yet.

The same search space currently surfaces established or adjacent API/data players, including:

- Lusha API for B2B data, enrichment and signals: `https://www.lusha.com/lusha-api/`
- 6sense real-time lead scoring API: `https://support.6sense.com/docs/6sense-real-time-lead-scoring`
- Coresignal public web data and agentic search API: `https://coresignal.com/`
- Lead Distro AI lead distribution API article: `https://www.leaddistro.ai/blog/lead-distribution-api`
- RapidAPI-style/API documentation competitors and generic lead scoring repositories.

## Interpretation

MachineSignal is now discoverable by direct machine-readable routes:

- known domain
- `.well-known` manifest
- `llms.txt`
- OpenAPI
- product catalog
- machine onboarding JSON
- API directory JSON
- RapidAPI listing JSON
- dentists beta pack JSON and Markdown
- GitHub repository

MachineSignal is not yet discoverable enough through generic web search. That requires time, backlinks, directory submissions, marketplace listing and repeated public references.

## Recommended next step

Run the first machine-distribution step:

1. keep the current site assets live;
2. update GitHub with these discoverability files;
3. submit or prepare listing drafts for API directories and marketplaces;
4. create an MCP/tool-style manifest next, so AI agents can treat MachineSignal as a callable tool;
5. continue daily monitor checks without human email outreach.

## Guardrails

- No real payment executed.
- No external contact executed.
- No human cold email used.
- Machine-first distribution only.
