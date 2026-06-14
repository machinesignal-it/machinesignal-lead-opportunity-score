# Sandbox Go-Live Control Pack - 2026-06-14

Status: prepared, NoWrite

Commercial status: not live

Primary customer interface: machine

## Perche' questo pacchetto esiste

La fase test interna e' completata: 195 controlli, 0 errori.

Il prodotto/API e' abbastanza maturo per preparare una sandbox tecnica controllata, ma non e' ancora pronto per vendita reale.

Questo pacchetto separa tre cose:

1. cosa possiamo mostrare a una macchina in sandbox;
2. cosa possiamo far chiamare a una macchina con limiti stretti;
3. cosa resta bloccato finche' non ci sono approvazioni legali, fiscali e commerciali.

## Cosa autorizza

Autorizza solo una preparazione di **go-live tecnico sandbox**, non una vendita.

In pratica:

- una macchina puo' leggere documentazione e manifest;
- una macchina puo' capire quali prodotti esistono;
- una macchina puo' creare una chiave sandbox limitata solo se approvato in rehearsal;
- una macchina puo' provare flussi con dati sintetici;
- una macchina puo' ricevere score, purchase-intent demo, order demo e usage demo;
- nessun pagamento viene raccolto;
- nessuna fattura viene emessa;
- nessun dato reale/personale viene usato;
- nessun contatto esterno viene eseguito.

## Cosa resta bloccato

- Pagamenti reali.
- Raccolta metodo di pagamento.
- Fatture.
- P.IVA/fatturazione commerciale.
- Dati reali di clienti.
- Dati personali.
- Liste reali di lead.
- Email/outreach a persone o aziende.
- Marketplace/API directory submission pubblica.
- Hosted MCP pubblico.
- Registry MCP pubblico.
- Chiavi production.
- Claim legali/privacy definitivi.

## Asset pubblici ammessi in sandbox

Solo in modalita' documentazione/sandbox:

| Asset | Ruolo |
|---|---|
| `GET /machine-onboarding.json` | Spiega alla macchina come orientarsi. |
| `GET /product-catalog.json` | Spiega prodotti, prezzi beta e regole credito. |
| `GET /openapi.json` | Contratto API leggibile da software. |
| `GET /postman_public_collection.json` | Esempi importabili in Postman. |
| `GET /llms.txt` | Entrypoint per agenti/LLM. |
| `GET /health` | Controllo disponibilita'. |

## Endpoint callable ammessi solo in rehearsal controllato

| Endpoint | Uso sandbox | Limite |
|---|---|---:|
| `POST /v1/sandbox/customers` | Crea una chiave sandbox limitata. | 1 cliente sandbox per rehearsal |
| `GET /v1/onboarding` | Restituisce stato onboarding della chiave sandbox. | read-only |
| `POST /v1/lead-opportunity-score` | Score su domini sintetici/demo. | 3 POST per rehearsal |
| `POST /v1/purchase-intent` | Registra intenzione demo senza pagamento. | 2 POST per rehearsal |
| `GET /v1/orders/{order_intent_id}` | Recupera ordine/demo delivery. | read-only |
| `GET /v1/usage` | Mostra usage e crediti sandbox. | read-only |

Tutti i POST devono avere `Idempotency-Key`.

## Endpoint esclusi dalla sandbox pubblica

Questi endpoint non devono essere proposti come percorso pubblico di prova:

- `/v1/payment-test/intents`
- `/v1/payment-test/intents/{payment_test_id}`
- `/v1/payment-test/webhooks/stripe`
- `/v1/payment-test/reconciliation/{payment_test_id}`
- `/v1/admin/payment-test-report`
- `/v1/beta/customers`
- `/v1/beta/customers/{customer_id}`

Motivo: possono confondere la sandbox tecnica con vendita, pagamento, beta cliente reale o flussi amministrativi.

## Regole dati

La sandbox deve usare solo dati sintetici.

Esempi ammessi:

- `example-dentist.test`
- `example-realestate.test`
- `example-clinic.test`
- `example-lawfirm.test`

Non sono ammessi:

- nomi reali di persone;
- email reali;
- numeri di telefono;
- indirizzi;
- liste clienti;
- lead reali;
- record CRM reali;
- dati personali.

## Regole crediti

I crediti sandbox servono solo a simulare consumo e tracciamento.

Regola:

- output valido consuma credito demo;
- duplicato non consuma;
- dominio non valido non consuma;
- input non analizzabile non consuma;
- pagamento reale non esiste;
- fattura non esiste;
- rimborso reale non esiste.

## Cosa deve capire una macchina

La macchina deve capire rapidamente:

1. se ha gia' una lista, deve usare Score Pack;
2. se non ha una lista, deve usare Target Discovery;
3. se un target ha score alto, puo' chiedere Deep Analysis;
4. se Deep Analysis conferma il gate, puo' chiedere Action Pack;
5. tutto e' sandbox/demo finche' non viene approvato il go-live commerciale.

## Cosa deve essere scritto chiaramente nei testi pubblici

Deve comparire:

- technical sandbox;
- no real payment;
- no invoice;
- no personal data;
- synthetic/demo data only;
- machine-readable API evaluation.

Non deve comparire:

- ready to buy now;
- fully compliant;
- GDPR approved;
- production API key available;
- hosted MCP live;
- public marketplace live;
- guaranteed revenue;
- we contact leads for you.

## Stop rules

Fermare il go-live tecnico se:

- un asset pubblico core restituisce 4xx o 5xx;
- OpenAPI, Postman, catalogo e onboarding non sono coerenti;
- un POST funziona senza idempotency key durante rehearsal;
- un path puo' attivare pagamento, fattura, contatto esterno o chiave production;
- appaiono dati reali o personali in esempi, log o payload;
- Cloudflare/KV/Worker supera i limiti o compaiono 429;
- una macchina non distingue sandbox tecnica da lancio commerciale.

## Collegamento con P&L e business plan

Materiali aggiornati:

- `MachineSignal_business_plan_partner_deck_v12_post_test_pricing.pptx`
- `MachineSignal_PL_3_years_v22_post_test_pricing.xlsx`

Nel P&L v22:

- i ricavi restano previsionali;
- non sono inclusi incassi reali;
- i costi agenti sono trattati come costo per output valido;
- Cloudflare/KV/Worker, legal/fiscal/admin e supporto restano costi espliciti;
- il go-live commerciale resta bloccato.

## Prossimo step

Eseguire il probe NoWrite:

```text
private-evaluator-pack/sandbox_go_live_control_pack_probe_20260614.mjs
```

Se passa, il prossimo step consentito e' preparare una rehearsal sandbox bounded.

Anche in quel caso restano bloccati:

- pagamenti;
- fatture;
- dati reali;
- dati personali;
- outreach;
- marketplace;
- hosted MCP;
- production API keys.

