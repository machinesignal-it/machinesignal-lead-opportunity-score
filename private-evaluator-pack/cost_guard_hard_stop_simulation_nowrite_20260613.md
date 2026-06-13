# Cost guard hard stop simulation - NoWrite

Date: 2026-06-13

## Sintesi

La simulazione verifica che i cost guard fermino o mettano in pausa l'uso prima di generare costi non autorizzati.

Risultato: **passed**.

Commercial status: **not live**.

## Regole della simulazione

- Pagamenti reali: 0.
- Fatture: 0.
- Metodi di pagamento raccolti: 0.
- Chiamate paid esterne: 0.
- Contatti esterni: 0.
- Dati reali: no.
- Dati personali: no.
- POST: 0.
- Scritture: 0.

## Soglie

- KV writes soft limit: 500/giorno.
- KV writes hard stop: 900/giorno.
- POST write-capped: massimo 5.
- Chiamate paid esterne senza budget: 0.
- Pagamenti reali: 0.
- Outreach umano: 0.

## Scenari testati

| Scenario | Livello | Hard stop | Risultato |
|---|---|---|---|
| HTTP 429 | red | si | passed |
| KV sopra soft limit | yellow | no | passed |
| KV sopra hard stop | red | si | passed |
| Chiamata paid esterna senza budget | red | si | passed |
| Costo prodotto sopra soglia | yellow | no | passed |
| Dati reali/personali in test | red | si | passed |
| Sospetta esposizione API key | red | si | passed |

## Risultato

- Scenari totali: 7.
- Scenari passati: 7.
- Scenari red: 5.
- Scenari yellow: 2.
- Hard stop attivati: 5.
- Retry automatici costosi: no.
- NoWrite preservato: si.
- Go-live commerciale: NO-GO.

## Blocchi confermati

Restano bloccati:

- pagamenti reali;
- fatture;
- raccolta metodi di pagamento;
- chiamate paid esterne;
- outreach;
- dati reali;
- dati personali;
- API key produzione;
- marketplace paid;
- hosted MCP pubblico;
- registry MCP;
- go-live commerciale.

## Prossimo step

**production_api_key_policy_draft**

Preparare una policy per API key di produzione: emissione, prefissi, rotazione, revoca, separazione test/live e cosa fare in caso di esposizione chiavi.
