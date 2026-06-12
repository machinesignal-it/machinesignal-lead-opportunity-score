# MachineSignal Provider Policy & Security Owner Approval Gate

Date: 2026-06-12

Role: Provider Policy & Security Agent

Scope: Private Evaluator Pack - Draft - NoSend - NoWrite - Simulation Only

## Verdict

GO for keeping the Private Evaluator Pack as an internal draft that may be used for additional NoSend/NoWrite simulations.

NO-GO for external send, public marketplace submission, production access, live billing, real customer data, real lead lists, or production API keys.

The pack is safe as a future-presentable draft because it is machine-readable, synthetic, explicitly marked as simulation-only, and validated with zero writes, zero payments, zero external invitations, zero personal data, and zero credit consumption.

It is not yet safe for external distribution.

## Evidence Reviewed

- Private Evaluator Pack manifest: status `draft_nosend_nowrite_simulation_only`.
- Pack validation: 37 checks, 0 failed.
- Machine buyer replay: 7 checks, 0 failed.
- Agent review summary: GO to prepare pack only.
- Orchestrator/HR review: GO for pack preparation, owner review required before external action.

## Approved Use

The pack may be used only for:

- internal machine-buyer simulations;
- internal agent review;
- local JSON and link validation;
- secret scanning;
- NoSend/NoWrite policy checks;
- owner-supervised review of product clarity.

## Not Approved

The pack is not approved for:

- sending to external machines, people, partners, directories, marketplaces, or beta users;
- publishing as a public marketplace listing;
- enabling real checkout, payment, invoice, subscription, or credit consumption;
- distributing production keys or bearer tokens;
- processing real customer data, personal data, real lead lists, or real company-contact lists;
- creating customer accounts, orders, ledger entries, webhooks, or CRM writes.

## Key And Credential Constraints

1. No secret may appear in the pack, examples, screenshots, logs, README files, JSON files, or test outputs.
2. Forbidden secrets include Cloudflare tokens, GitHub tokens, Postman tokens, DataForSEO credentials, FTP credentials, API keys, bearer tokens, cookies, session ids, webhook secrets, SMTP passwords, and private URLs with embedded tokens.
3. Production keys are not allowed in evaluator material.
4. Any future evaluator access must use a separate sandbox credential, with minimum scope, explicit expiry, and revocation path.
5. Cloudflare API tokens must follow least privilege. Tokens should be scoped to the minimum account, zone, and permission groups required for the specific automation.
6. Broad edit permissions are not acceptable for an external evaluator. Any token able to edit Workers, routes, KV, R2, Pages, or account settings must remain internal only.
7. Secrets must stay in controlled stores such as GitHub Actions secrets, Cloudflare secrets, local DPAPI-protected files, or another approved secret manager. They must not be committed to the repository.
8. Rotation must be possible without code changes.

## Rate Limit Constraints

The current pack should not execute API calls that mutate state. Therefore rate exposure is low.

Before any future external evaluator access, the following must exist:

- per-IP or per-key request caps;
- endpoint-level quotas;
- hard budget caps for any endpoint that could trigger third-party cost;
- 429 responses for over-limit usage;
- retry guidance that does not encourage aggressive polling;
- separate limits for read-only documentation access and any simulated API evaluation;
- a kill switch that can disable evaluator traffic quickly;
- protection against repeated KV writes or other storage writes from unauthenticated traffic.

Cloudflare Workers and storage limits must be treated as real operational constraints, especially because accidental write loops can exhaust free-tier or configured quotas.

## Abuse Controls

The pack must not enable:

- scraping at scale;
- bypassing anti-bot controls;
- automated contact harvesting;
- email/phone enrichment for outreach;
- spam or cold outreach;
- real lead generation without owner approval;
- repeated calls designed to create cost or denial-of-wallet risk;
- user-controlled webhooks to third parties;
- prompt instructions that make an evaluator contact humans.

For future testing, inputs must remain synthetic unless a separate owner-approved data-processing review is completed.

## Revocation Plan

If anything behaves unexpectedly, the shutdown order is:

1. Disable external access path or remove the route/listing/import link.
2. Revoke or rotate any evaluator token.
3. Remove or rotate GitHub Actions and Cloudflare secrets if exposed.
4. Disable Worker routes or place the Worker in maintenance/deny mode.
5. Disable webhook destinations and third-party API calls.
6. Remove public discovery references if they point to unsafe material.
7. Run a secret scan and repository history check.
8. Record incident notes in an internal review file before resuming tests.

No future evaluator should receive a token that cannot be revoked independently.

## Logging Constraints

Current draft: no external tracking is needed.

Future evaluator access may log only minimum operational metadata:

- request id;
- timestamp;
- endpoint;
- status code;
- synthetic scenario id;
- quota decision;
- error category;
- cost bucket if applicable.

Logs must not store:

- production secrets;
- bearer tokens;
- cookies;
- full request bodies containing customer data;
- personal data;
- real lead lists;
- email addresses or phone numbers;
- payment details.

Recommended retention for evaluator logs: short retention, for example 30 days, unless a legal or security reason requires otherwise.

## Marketplace Policy Constraints

The pack is not approved for marketplace publication.

Before any future API directory or marketplace review, a fresh policy check is required for each channel, including RapidAPI/API marketplace, Postman Public API Network, MCP/tool directories, GitHub discovery, and any agent marketplace.

Minimum future checks:

- docs must be accurate and not misleading;
- pricing must be clearly marked as live or simulated;
- sandbox and production endpoints must be separated;
- support contact must be valid;
- usage limits and abuse rules must be visible;
- no unsupported claims such as guaranteed ROI, certified compliance, or guaranteed lead conversion;
- no personal data processing claim unless reviewed separately;
- no hidden billing behavior;
- no key or secret exposure in public examples;
- no endpoint that can create cost without explicit authenticated approval.

## Five Absolute Blocks

1. Block any secret, production key, token, cookie, password, session id, webhook secret, or credential in the pack, repository, examples, screenshots, or logs.
2. Block any real write action: orders, payments, invoices, subscriptions, account creation, ledger mutation, credit consumption, CRM write, webhook execution, or third-party API spend.
3. Block any external distribution without explicit owner approval: emails, invites, partner sends, beta tester sends, marketplace submissions, public paid listings, or public indexing of private draft material.
4. Block any real personal/customer/lead data: real names, emails, phone numbers, contact lists, customer files, real lead lists, aggressive scraping, or human outreach workflows.
5. Block any uncapped automated access path: anonymous POST, unlimited polling, unbounded storage writes, uncontrolled third-party spend, missing kill switch, missing revocation path, or missing abuse logging.

## Final Decision

GO: internal draft and further NoSend/NoWrite simulation.

NO-GO: external evaluator send, marketplace publication, production deployment, live monetization, real customer-data processing, or production key distribution.

Next allowed action: run an internal owner-approval simulation against this gate and confirm that every future step remains NoSend, NoWrite, NoPayment, NoPersonalData, and Simulation Only.

## Reference Sources Checked

- Cloudflare API token permissions: https://developers.cloudflare.com/fundamentals/api/reference/permissions/
- Cloudflare API token creation and permission scope: https://developers.cloudflare.com/fundamentals/api/get-started/create-token/
- Cloudflare Workers limits: https://developers.cloudflare.com/workers/platform/limits/
- Cloudflare Workers pricing and accidental cost controls: https://developers.cloudflare.com/workers/platform/pricing/
- Rapid API Hub documentation: https://docs.rapidapi.com/
- Postman API Network overview: https://learning.postman.com/docs/postman-api-network/overview/
- Postman public documentation publishing: https://learning.postman.com/docs/publishing-your-api/publishing-your-docs
