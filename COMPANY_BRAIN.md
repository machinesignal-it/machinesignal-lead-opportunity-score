# MachineSignal Company Brain

Updated: 2026-06-14  
Status: internal operating brain  
Primary customer interface: machine

## Purpose

This file is the internal memory for MachineSignal and API Lead Opportunity Score.

It is not a public sales document, not a legal document and not a commercial go-live approval. Its job is to keep the project coherent while agents, tests, documentation, product decisions and roadmap evolve.

When there is conflict between older project files and this Company Brain, agents must treat this file as the current internal operating reference, then verify against the latest public machine-readable files before changing anything.

## What We Are Building

MachineSignal builds machine-readable APIs, datasets and decision packs for automated systems.

The first product line is API Lead Opportunity Score: a system that helps machines, CRM systems, AI agents, workflow tools and software decide which business targets are worth attention, scoring, enrichment or further analysis.

The business is intentionally machine-first:

- the buyer interface is not primarily a human salesperson conversation;
- the customer machine reads public documentation, catalogs and API contracts;
- the machine tests sandbox endpoints;
- the machine requests scores, discovery packs or purchase intents;
- the system returns structured JSON decisions, usage and order records.

Humans may still exist behind the customer's machine, but MachineSignal tries to reduce human selling, manual onboarding and manual post-sale work as much as possible.

## Current Business Thesis

Machines on the web increasingly need to:

- find useful targets for a commercial objective;
- prioritize lists of companies or domains;
- enrich incomplete records;
- decide whether to spend budget on deeper analysis;
- prepare CRM or workflow actions;
- consume APIs through OpenAPI, Postman, docs, MCP-like adapters or marketplace-style discovery.

MachineSignal sells the structured outputs that help these machines decide what to do next.

The core promise is not "we sell websites" and not "we manually contact leads". The core promise is:

> We help automated systems decide where commercial attention and budget should go.

## Current Valid Status

The current status is sandbox-public-docs-only.

Allowed now:

- read public documentation;
- read machine-readable catalog and onboarding files;
- run NoWrite tests;
- run synthetic or demo-domain tests;
- create limited sandbox customers;
- create sandbox purchase intents;
- retrieve sandbox orders and usage;
- validate contracts, prices, outputs and safety gates.

Blocked now:

- real payments;
- invoices;
- collection of payment methods;
- production API keys;
- processing real customer data;
- processing personal data;
- outreach or email to external humans;
- public paid marketplace publication;
- hosted MCP public launch;
- MCP registry publication;
- commercial go-live.

Any step that touches a blocked item requires explicit owner approval before execution.

## Current Public Machine Entry Points

Primary public machine discovery files:

- `https://machinesignal.it/llms.txt`
- `https://machinesignal.it/product-catalog.json`
- `https://machinesignal.it/machine-onboarding.json`
- `https://machinesignal.it/openapi.json`
- `https://machinesignal.it/postman_public_collection.json`
- `https://machinesignal.it/machine-discovery/machine-discovery-pack.json`
- `https://machinesignal.it/SANDBOX_PUBLIC_DOCS.md`
- `https://machinesignal.it/sandbox-public-docs.json`

Primary Worker endpoint:

- `https://machinesignal-api.beta-878.workers.dev`

## Product Model

The products are designed for two machine-buying scenarios.

### Scenario 1: The Customer Machine Has A List

The customer machine already has domains, companies or records.

It asks:

> Which of these targets deserve attention, budget or deeper analysis for a declared commercial objective?

Main product:

- Score Pack 1k

Possible next products:

- Deep Analysis Pack;
- Action Pack;
- Domain Enrichment Pack if records are incomplete;
- API Starter or API Pro for recurring usage.

### Scenario 2: The Customer Machine Has No List

The customer machine has a sector, area and commercial objective, but no target list.

It asks:

> Find companies or domains that are relevant for this commercial objective in this sector and area.

Main product:

- Target Discovery Pack

Possible next products:

- Score Pack 1k;
- Domain Enrichment Pack;
- Deep Analysis Pack;
- Opportunity Feed.

Important clarification:

"Interesting domains" always means interesting for a declared commercial objective. It does not mean generically nice websites or random companies.

## Current Listino

Current catalog version: `2026-06-14-beta-v22`  
Currency: EUR  
Payment mode during beta: purchase-intent only, no real charge.

### Target Discovery Pack 250

Price: EUR 249  
Product code: `target_discovery`  
Unit: 250 coherent targets

What it does:

Finds targets for a declared commercial objective, sector and area when the customer machine does not already have a list.

What the price includes:

- market availability pre-check;
- commercial objective normalization;
- opportunity hypothesis;
- 250 normalized and deduplicated targets when the market is available;
- domain when available;
- category;
- area;
- initial opportunity signals;
- reason for inclusion;
- JSON or CSV export.

Validity rule:

The pack is activated only if the pre-check says that 250 coherent targets can be produced. If not, the machine receives alternatives such as Mini Discovery, wider area, broader criteria or changed commercial objective.

### Score Pack 1k

Price: EUR 119  
Product code: `score_pack_1k`  
Unit: 1000 valid scores

What it does:

Scores an existing list and tells the customer machine which records deserve budget, attention or next analysis.

What the price includes:

- list cleaning;
- deduplication;
- exclusion of invalid or non-analyzable records;
- opportunity score;
- confidence;
- commercial strength;
- spend policy;
- allowed next products;
- operational decision;
- short reason;
- priority;
- recommended next purchase.

Validity rule:

Duplicate, invalid or non-analyzable records do not consume score credits. The pack ends after 1000 valid scores.

### Domain Enrichment Pack 100

Price: EUR 149  
Product code: `domain_enrichment`  
Unit: 100 completed domain-enrichment decisions

What it does:

Helps when the customer machine has target names but not reliable domains.

What the price includes:

- 100 target records processed;
- public-source lookup;
- domain when verified;
- confidence level;
- evidence source type;
- status for each target;
- reason when no reliable domain is found;
- JSON or CSV export ready for scoring workflows.

Validity rule:

One credit is consumed for each completed enrichment decision: verified domain, candidate not reliable or no reliable domain. The product does not promise that every target will have a domain.

### Deep Analysis Pack 100

Price: EUR 349  
Product code: `deep_analysis`  
Unit: 100 valid deep analyses

What it does:

Gives operational commercial evidence before the machine buys an Action Pack or spends more budget.

What the price includes:

- what-is-included contract;
- sector context;
- commercial objective;
- commercial evidence matrix;
- machine decision matrix;
- Action Pack purchase gate;
- CRM summary payload;
- sector-specific signals;
- signals to validate;
- risk flags;
- stop rules;
- recommended next machine call.

Validity rule:

Leads without enough data for a complete analysis do not consume deep-analysis credits and return an exclusion reason.

### Action Pack 25

Price: EUR 399  
Product code: `action_pack`  
Unit: 25 valid action packs

What it does:

Turns a confirmed opportunity into a CRM-ready or workflow-ready action payload.

What the price includes:

- CRM-ready record patch;
- CRM task payload;
- CRM platform field mappings;
- workflow payload;
- agent instructions;
- webhook event schema;
- webhook delivery policy;
- audit event;
- approval gate;
- deduplication key;
- message angle with forbidden claims;
- stop rules;
- compliance guardrail.

Validity rule:

If the lead does not have enough signal for a sensible commercial action, the pack is not consumed and the system returns the exclusion reason.

### Opportunity Feed

Price: EUR 249/month  
Product code: `opportunity_feed`

What it does:

Provides recurring opportunities without requiring one-off discovery requests each time.

What the price includes:

- one recurring monthly feed;
- four scheduled scans;
- four scheduled deliveries;
- new or updated targets;
- base score;
- main signals;
- priority;
- API, file or webhook output.

### API Starter

Price: EUR 99/month  
Product code: `api_starter`

What it does:

Gives light recurring API access for testing and small workflows.

What the price includes:

- one API key;
- documentation;
- demo environment;
- score endpoint;
- 500 valid scores per month;
- basic usage report;
- standard asynchronous support.

### API Pro

Price: EUR 499/month  
Product code: `api_pro`

What it does:

Supports recurring volume for CRMs, agencies, platforms or automated workflows.

What the price includes:

- one advanced API key;
- 3000 valid scores per month;
- 50 valid Deep Analysis outputs per month;
- one monthly Opportunity Feed;
- webhook support;
- processing priority;
- advanced usage report;
- asynchronous technical support.

### Custom / Overage

Price: from EUR 2000, custom quote  
Product code: `custom_overage`

What it does:

Covers larger volumes, dedicated integrations, custom scoring rules or special delivery requirements.

Validity rule:

Each custom request must be quoted before activation with volume, expected output, delivery timing, estimated cost and usage limits.

## Credit Rule

Credits are consumed only when the system produces a valid usable output.

Not charged:

- duplicate records;
- invalid domains;
- records that cannot be analyzed;
- outputs with insufficient signal for the purchased product.

Every consumption event should be tracked with:

- request_id;
- product_code;
- status;
- credits_consumed;
- credits_remaining.

## Current Roadmap State

Technical sandbox tests are approximately 93-94% complete.

Internal NoWrite test phase completed:

- P0 contract consistency;
- P0 sandbox API safety regression;
- P1 synthetic machine buyer journey;
- P1 agent roles operating check;
- P2 P&L assumption delta review.

Write-capped sandbox rehearsal completed:

- sandbox customer created;
- public machine assets read;
- Target Discovery purchase-intent created;
- synthetic score created;
- Deep Analysis purchase-intent created;
- Action Pack purchase-intent created;
- orders and usage reconciled;
- no real payment;
- no invoice;
- no outreach;
- no real or personal data.

Public sandbox docs published:

- `SANDBOX_PUBLIC_DOCS.md`;
- `sandbox-public-docs.json`;
- `llms.txt`;
- `robots.txt`.

Latest readiness result:

- sandbox public docs readiness probe: 36 checks, 0 failed.

Overall pre-go-live readiness estimate:

- pre-go-live readiness: about 84%;
- commercial go-live readiness: about 69%;
- commercial go-live: no-go.

## Current Next Steps

Recommended next step:

Run sandbox public observation and consistency monitoring NoWrite. Confirm that all machine-readable public files remain coherent and do not imply live monetization.

Then prepare one of these owner decisions:

1. keep sandbox private/internal;
2. approve limited public sandbox visibility;
3. prepare legal/fiscal/payment readiness before paid beta;
4. update P&L and business plan after latest technical evidence.

## Machine-Readable Company Brain

The Company Brain now has two machine-readable companion files:

- `company-brain.json`: structured operating brain for agents and future automation.
- `company-brain-graph.json`: lightweight node/edge graph for future visual mapping.

The visual graph/dashboard is planned but not started. It should be built only after the JSON and graph stay stable across several test cycles. This avoids spending effort on the visual layer before the operating brain is reliable.

## Agents

The current agent system includes:

- Orchestrator: coordinates all agents and future agents.
- Agente analisi mercato potenziale: analyzes markets and business models.
- Architetto web AI: evaluates web/product experience and usability.
- API Agent: handles API-first machine buyer model.
- Data Scout: finds public sources, sectors, directories and potential markets.
- Data Quality & Compliance: checks data quality, deduplication, privacy and anti-spam risk.
- Scoring Optimizer: improves scoring logic and detects misleading signals.
- API Product Manager: manages endpoint logic, JSON formats, OpenAPI, docs and usage limits.
- Growth & Distribution: manages machine-readable discovery channels, documentation and distribution.
- Customer Feedback: reads feedback, errors and requests, then proposes improvements.
- Sales Ops Agent: designs the machine-first commercial flow.
- Post-Sale Agent: manages usage, orders, support and retention logic.
- Admin & Finance Controller: monitors costs, P&L, margins, invoices and fiscal readiness.
- Legal & Compliance Agent: checks legal, privacy, terms, data and publication gates.
- Agent HR & Continuous Learning: proposes, evaluates and controls agents, and manages learning loops.

## Agent Operating Rules

All agents must follow these rules:

- machine-first thinking comes before human outreach;
- use synthetic or demo data during tests;
- do not process real or personal data unless explicitly approved;
- do not send external emails or contact people unless explicitly approved;
- do not enable payments, invoices or payment method collection unless explicitly approved;
- do not publish to public marketplace, MCP registry or hosted MCP unless explicitly approved;
- record evidence after tests;
- prefer NoWrite probes before any write-capped test;
- preserve cost limits and avoid unnecessary repeated writes;
- update docs, catalog, OpenAPI, Postman, onboarding and distribution files together after product or price changes;
- raise owner-decision gates clearly instead of guessing.

## Continuous Learning Loop

Agents should improve the system by maintaining a learning loop:

1. observe test results;
2. identify mismatch, risk or unclear output;
3. propose a bounded improvement;
4. validate with NoWrite checks;
5. only then perform write-capped changes if approved and necessary;
6. update Company Brain if the decision changes the operating model.

The goal is not autonomous uncontrolled change. The goal is controlled learning with evidence, guardrails and owner decision gates.

## Owner Decision Gates

The owner must approve before:

- live payment activation;
- invoice generation;
- payment method collection;
- processing real customer data;
- processing personal data;
- external outreach;
- public marketplace submission;
- hosted MCP public launch;
- MCP registry publication;
- legal/privacy/terms final claims;
- production API keys;
- commercial go-live.

## Cost And Resource Guardrails

MachineSignal should stay agent-only as much as possible.

Expected costs are mainly:

- agent/model usage;
- Cloudflare Worker and storage usage;
- domain, email and hosting;
- API/data provider usage;
- legal, fiscal and compliance setup when needed;
- occasional tooling subscriptions if justified.

The system must avoid wasteful loops. If a test can be done NoWrite, do it NoWrite first.

## Current Strategic Positioning

MachineSignal is not trying to compete as a generic lead database.

The intended positioning is:

- more machine-readable than traditional lead-gen services;
- more decision-oriented than raw data providers;
- safer and more budget-aware than generic AI scraping workflows;
- more operational than a simple scoring API;
- more autonomous than a human sales agency.

The current strongest wedge is:

> A machine-readable lead opportunity decision layer for agents, CRMs and automated workflows.

## Known Risks

Open risks:

- commercial demand is still unproven with real paying customers;
- legal/fiscal readiness is not complete;
- terms and privacy are not final;
- real-data handling is blocked;
- live payment flow is blocked;
- marketplace and MCP public distribution are blocked;
- scoring needs broader calibration across sectors and negative examples;
- agent-only operation must be tested under real support and exception cases;
- Cloudflare and storage usage must remain controlled.

## Definition Of Done For Test Phase

The test phase can be considered complete when:

- public machine docs are coherent;
- sandbox tests pass NoWrite and write-capped checks;
- pricing and products match across catalog, OpenAPI, Postman, docs and site;
- owner approval gates are documented;
- no public file implies live monetization before approval;
- support/status and usage reporting are machine-readable;
- P&L is updated with current technical assumptions;
- all agents agree on GO for sandbox and NO-GO/GO for paid beta based on evidence.

## Current Decision

MachineSignal can continue sandbox-only testing.

MachineSignal must not start paid commercial activity yet.

Next recommended action:

Run the sandbox public observation/monitoring step, then update roadmap and decide whether to prepare a controlled paid-beta readiness pack or continue strengthening sandbox evidence.
