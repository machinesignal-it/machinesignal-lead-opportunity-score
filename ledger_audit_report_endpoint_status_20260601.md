# Ledger audit report endpoint - 2026-06-01

## Stato

Implementato endpoint admin:

`GET /v1/admin/audit-report?customer_id=<customer_id>`

L'endpoint serve per verificare il ledger prima di qualsiasi test con pagamenti reali.

## Cosa controlla

- customer id, stato cliente, tipo cliente e piano;
- backend ledger usato;
- persistenza del ledger;
- numero eventi;
- numero eventi validi che consumano crediti;
- numero eventi bloccati;
- numero ordini beta;
- crediti acquistati, usati e residui per prodotto;
- riconciliazione tra crediti usati e crediti consumati dagli eventi;
- ricavo beta simulato per prodotto;
- ricavo beta simulato totale;
- flag di sicurezza `real_payment_executed`;
- flag di sicurezza `external_contact_executed`.

## Regola operativa

Durante la beta l'endpoint deve restituire:

- `summary.reconciliation_ok = true`;
- `summary.ready_for_real_payments = false`;
- `safety.real_payment_executed = false`;
- `safety.external_contact_executed = false`.

Questo significa che il cliente macchina può usare score, purchase intent e ordini beta, ma il sistema non deve ancora eseguire pagamenti reali o contatti esterni.

## Test completati

Test locali superati:

- `node api_endpoint_minimal/test_api.mjs`;
- `node api_endpoint_minimal/test_durable_ledger.mjs`.

I test verificano che:

- l'endpoint sia visibile in OpenAPI, onboarding e `llms.txt`;
- l'accesso senza admin key venga rifiutato;
- un cliente beta venga riconciliato correttamente;
- il ledger Durable Object resti coerente dopo score e purchase intent.
- un cliente legacy ancora salvato in KV venga migrato in modo lazy al Durable Object quando viene richiesto l'audit.

## Prossimo passaggio

Dopo il deploy:

1. creare o usare un cliente beta reale;
2. chiamare `/v1/admin/audit-report?customer_id=<customer_id>`;
3. salvare output e confrontarlo con `/v1/usage` e `/v1/orders`;
4. solo dopo diversi audit coerenti valutare D1 come storico reporting a lungo termine.

## Validazione live post-deploy

Workflow GitHub Actions:

- run: `26765219937`;
- commit: `1d07dad`;
- esito: `success`.

Audit live eseguito su cliente legacy:

- customer richiesto: `beta_volume_20260601_135904`;
- customer restituito: `beta_volume_20260601_135904`;
- ledger backend: `durable_object`;
- `reconciliation_ok`: `true`;
- `ready_for_real_payments`: `false`;
- `real_payment_executed`: `false`;
- `external_contact_executed`: `false`;
- score riconciliati: `50`;
- ordini: `0`;
- ricavo beta simulato: `4,95 EUR`.

Nota: durante il test non è stato possibile creare un nuovo cliente beta perché Cloudflare KV ha restituito `KV put() limit exceeded for the day`. Per questo è stato usato un cliente esistente; il test è comunque utile perché ha verificato il caso legacy KV -> Durable Object.
