# MachineSignal Owner Approval Gate

Role: Compliance/Admin/Legal/Finance Agent

Date: 2026-06-12

Status reviewed: Private Evaluator Pack - Draft - NoSend - NoWrite - Simulation Only

Important note: this is a prudent operational review, not final legal, tax, accounting, or privacy advice. Before any real sale, recurring offer, invoice, payment, customer onboarding, or personal data processing, MachineSignal should obtain a qualified accountant/legal/privacy review in Italy.

## Verdict

GO for internal draft only.

NO-GO for external exposure, live sale, payment, invoice, subscription, customer onboarding, marketplace publication, real lead processing, or personal data processing.

The pack can remain as an internal owner-review artifact because it is documentation and simulation only. It must not be treated as a live commercial offer.

## Scope Approved Now

Allowed now:

- keep the pack in the repository as internal draft material;
- run local machine-buyer simulations;
- run local validation, link checks, and secret scans;
- improve product clarity, examples, pricing assumptions, and NoWrite policy;
- use only synthetic examples and synthetic domains;
- keep all prices marked as planning assumptions or simulated prices.

Blocked now:

- sending the pack to external people, partners, marketplaces, beta users, or API directories;
- inviting external evaluators;
- publishing the pack as an indexed public commercial page;
- enabling real checkout, invoices, subscriptions, paid credits, or recurring billing;
- activating live P.IVA/fiscal workflows for this pack;
- creating real customer accounts;
- consuming real customer credits;
- processing real lead lists, real companies as customer payloads, email addresses, phone numbers, or other personal data;
- using production API keys, cookies, tokens, FTP credentials, Cloudflare credentials, GitHub credentials, Postman credentials, DataForSEO credentials, or payment credentials in the pack.

## Legal, Administrative, And Fiscal Conditions

### P.IVA

Do not activate P.IVA workflows now for this pack.

Reason: the current activity is internal preparation and simulation only. There is no live sale, no payment, no invoice, no customer contract, no external commercial delivery, and no recurring paid service.

Before any real monetization, MachineSignal should pause and obtain Italian accountant advice on the correct setup: individual activity, sole proprietorship, company, VAT treatment, ATECO classification, INPS/INAIL implications if relevant, invoicing duties, and possible SUAP/Registro Imprese steps.

The official administrative path for an Italian business may involve Agenzia delle Entrate, Registro Imprese, INPS, INAIL, and possible SUAP filings depending on the final legal form and activity. Registro Imprese describes Comunicazione Unica as the unified procedure covering requests such as Registro Imprese registration, fiscal code/VAT number, INPS/INAIL, and possible SCIA/SUAP. For individual businesses, Registro Imprese indicates Comunicazione Unica as the telematic route and mentions PEC and digital signature requirements.

### Invoicing And Billing

Do not activate invoicing or billing now.

Before live sale, MachineSignal needs:

- fiscal identity and invoicing setup;
- electronic invoicing process where required;
- payment provider account;
- invoice/receipt workflow;
- refund and cancellation terms;
- subscription and credit expiry rules;
- customer-visible usage ledger;
- tax/VAT treatment review for Italian, EU, and non-EU customers;
- reconciliation between payments, credits consumed, and delivered outputs.

Agenzia delle Entrate states that electronic invoicing rules apply to Italian resident or established VAT subjects in the relevant cases. This means billing design must be reviewed before any real paid offer.

### Contracts And Terms

Do not present prices as binding commercial offers now.

All pack prices must remain clearly marked as simulated/planning assumptions until terms are approved.

Before external exposure, the product needs at minimum:

- Terms of Service;
- acceptable-use policy;
- refund/credit policy;
- support policy;
- liability limitations;
- data-processing terms if any personal/customer data is processed;
- provider cost and availability disclaimers;
- no guaranteed ROI wording;
- no certification claims unless actually obtained.

## Privacy And Data Limits

The current pack must continue to use only synthetic examples.

Allowed now:

- invented `.test` domains;
- synthetic sectors and locations;
- synthetic CRM/workflow examples;
- mock API responses;
- public documentation links.

Blocked now:

- real names;
- real email addresses;
- phone numbers;
- real clinic, dentist, professional, or company records used as customer payloads;
- scraped contact lists;
- personal websites associated with identifiable individuals;
- IP/cookie/user tracking for evaluator profiling;
- screenshots showing authenticated panels or credentials;
- logs containing payloads that could identify a person.

Privacy rule of thumb: if data can relate to an identified or identifiable living person, treat it as personal data. The European Commission describes personal data as information relating to an identified or identifiable living individual.

Before any future personal/customer/lead data processing, MachineSignal needs a separate privacy gate:

- identify controller/processor roles;
- define legal basis;
- write privacy notice;
- define retention;
- define data subject rights process;
- list subprocessors and data locations;
- define security measures;
- check whether profiling or automated decision-making issues arise;
- assess whether a DPIA is needed;
- avoid special-category data;
- avoid cold outreach or contact harvesting unless separately reviewed and approved.

The EDPB Article 25 guidelines and the Garante cookie guidance both point toward privacy by design/default and minimization. For this project, that means: minimum data, no unnecessary tracking, no personal data in test packs, conservative defaults, and no external processing until the governance is ready.

## Admin And Finance Controls

Current finance status:

- revenue recognized: EUR 0;
- invoices issued: 0;
- payments collected: 0;
- subscriptions active: 0;
- customer credits sold: 0;
- customer credits consumed: 0;
- customer accounts created: 0.

Required controls before any real monetization:

- owner-approved legal/fiscal setup;
- price list marked live versus simulated;
- cost model updated with data-provider, agent-runtime, Cloudflare, Postman, GitHub, storage, email, domain/hosting, and payment fees;
- credit ledger audited and customer-visible;
- cancellation/refund rules;
- payment reconciliation;
- invoice numbering and conservation workflow;
- monthly admin review;
- abuse and cost caps;
- incident log and revocation process.

## Owner Approval Checklist

The owner should answer YES to all items before any external send or monetization:

1. Is the pack still marked Draft - NoSend - NoWrite - Simulation Only?
2. Are all prices clearly simulated and non-binding?
3. Are there zero real payments, invoices, orders, subscriptions, or customer accounts?
4. Are there zero real customer/lead lists and zero personal data?
5. Are there zero email/outreach instructions toward humans?
6. Are all examples synthetic and safe?
7. Has the secret scan passed?
8. Are production credentials absent from all files, logs, screenshots, and examples?
9. Are private draft files excluded from public indexing/discovery?
10. Are the product selector and output samples clear enough for a machine buyer?
11. Are usage limits, cost caps, and kill switch defined before any external evaluator access?
12. Has the commercial status field been added: `simulated`, `private_evaluation`, or `live`?
13. Has the accountant/fiscal review been completed before any live sale?
14. Has the privacy review been completed before any personal/customer data processing?
15. Has the owner explicitly approved the exact channel, file set, and allowed actions for the next step?

## Final Decision

Internal draft: GO.

Private external evaluator send: NO-GO for now.

Marketplace/API directory publication: NO-GO.

Live payment/invoice/subscription: NO-GO.

P.IVA/fiscal activation for this pack now: NO-GO.

Real customer data or personal data processing: NO-GO.

Next allowed action: update the pack with this gate, validate it locally, and run an internal owner-approval simulation. Do not send or publish externally.

## Sources Checked

- European Commission - Data protection explained: https://commission.europa.eu/law/law-topic/data-protection/data-protection-explained_en
- EDPB - Guidelines 4/2019 on Article 25 Data Protection by Design and by Default: https://www.edpb.europa.eu/our-work-tools/our-documents/guidelines/guidelines-42019-article-25-data-protection-design-and_en
- Garante Privacy - Linee guida cookie e altri strumenti di tracciamento: https://www.garanteprivacy.it/home/docweb/-/docweb-display/docweb/9677876
- Agenzia delle Entrate - Come aprire una Partita IVA: https://www.agenziaentrate.gov.it/portale/schede/istanze/aa9_11-apertura-variazione-chiusura-pf/quando-utilizzare
- Agenzia delle Entrate - Fatturazione elettronica: https://www.agenziaentrate.gov.it/portale/aree-tematiche/fatturazione-elettronica
- Registro Imprese - Comunicazione Unica d'Impresa: https://www.registroimprese.it/comunicazione-unica-d-impresa
- Registro Imprese - Impresa individuale: https://www.registroimprese.it/impresa-individuale
