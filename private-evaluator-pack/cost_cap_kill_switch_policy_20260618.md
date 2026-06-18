# Policy cost cap e kill switch beta

Data: 2026-06-18

Stato: bozza operativa interna per beta controllata

Questa policy serve a evitare costi incontrollati, loop automatici, consumo anomalo di crediti e uso eccessivo di risorse. Non abilita pagamenti reali, fatture, chiavi production, dati reali o go-live commerciale.

## Principio base

Ogni macchina cliente deve poter usare il servizio solo entro limiti misurabili.

Se una richiesta, un cliente, un endpoint o un job supera le soglie definite, il sistema deve rallentare, bloccare o mettere in revisione prima che si generino costi o consumi eccessivi.

## Cosa protegge

La policy protegge da:

- loop di agenti o workflow;
- chiamate ripetute per errore;
- batch troppo grandi;
- abuso intenzionale;
- consumo eccessivo di crediti sandbox;
- uso eccessivo di Cloudflare Workers, KV o chiamate esterne;
- errori di integrazione del cliente macchina;
- tentativi di usare dati reali/personali non autorizzati;
- richieste non compatibili con la beta.

## Livelli di controllo

| Livello | Cosa controlla | Azione |
| --- | --- | --- |
| Request cap | Singola richiesta troppo grande o non valida. | Rifiuto con errore controllato. |
| Customer cap | Troppe richieste da uno stesso cliente/macchina. | Rate limit o sospensione temporanea. |
| Product cap | Uso anomalo di un prodotto specifico. | Blocco prodotto per quel cliente. |
| Daily cost cap | Consumo giornaliero sopra soglia. | Kill switch giornaliero. |
| External cost cap | Chiamate a servizi esterni sopra soglia. | Stop immediato chiamate esterne. |
| Policy cap | Richieste vietate dai guardrail. | Blocco e ledger event. |
| Incident cap | Pattern rischioso o non previsto. | Escalation e stop manuale. |

## Soglie beta consigliate

Queste soglie sono conservative e servono solo per test controllati.

| Soglia | Valore iniziale consigliato | Azione |
| --- | --- | --- |
| Richieste per minuto per cliente sandbox | 20 | Rate limit automatico. |
| Richieste per ora per cliente sandbox | 200 | Sospensione temporanea cliente. |
| Richieste al giorno per cliente sandbox | 1000 | Stop cliente fino al giorno successivo. |
| Batch massimo Score Pack | 100 record per richiesta | Rifiuto batch o richiesta di spezzare. |
| Batch massimo Domain Enrichment | 50 record per richiesta | Rifiuto batch o richiesta di spezzare. |
| Batch massimo Target Discovery | 1 richiesta per mercato/area/obiettivo ogni 24 ore | Watchlist se duplicata. |
| Errori tecnici consecutivi | 5 | Stop endpoint o cliente e apertura incident. |
| Duplicati consecutivi | 20 | Stop batch e risposta deduplication_required. |
| Costo esterno giornaliero sandbox | EUR 0 in assenza di approvazione | Chiamate esterne non consentite. |
| Budget massimo beta non approvata | EUR 0 | Nessun costo production o pagamento. |

## Kill switch

Il kill switch è il blocco automatico che ferma l'uso quando viene superata una soglia critica.

Tipi di kill switch:

- customer_kill_switch: blocca un cliente o sandbox_customer_id;
- product_kill_switch: blocca un prodotto specifico;
- endpoint_kill_switch: blocca un endpoint;
- external_call_kill_switch: blocca chiamate a servizi esterni;
- global_beta_kill_switch: blocca tutta la beta;
- policy_kill_switch: blocca richieste vietate dai guardrail.

## Quando scatta il kill switch

Il kill switch deve scattare quando:

- vengono superate le soglie giornaliere;
- un loop genera richieste ripetute;
- il tasso di errore supera la soglia;
- le richieste contengono dati reali/personali non autorizzati;
- il sistema tenta di usare chiavi production non approvate;
- un endpoint produce output incoerenti ripetuti;
- il ledger non riesce a registrare eventi;
- la spesa esterna supera il limite autorizzato;
- il proprietario imposta stop manuale.

## Risposta della macchina quando il servizio viene bloccato

La risposta deve essere strutturata e comprensibile:

```json
{
  "status": "blocked_by_cost_cap",
  "decision": "stop",
  "reason": "daily sandbox request cap exceeded",
  "credits_consumed": 0,
  "retry_after_seconds": 86400,
  "escalation_required": false,
  "support_code": "COST_CAP_DAILY_SANDBOX"
}
```

## Ledger cost cap

Ogni blocco o limitazione deve scrivere un evento nel ledger.

Campi minimi:

- event_id;
- timestamp;
- customer_id o sandbox_customer_id;
- request_id;
- endpoint;
- product_code;
- cap_type;
- threshold_name;
- threshold_value;
- observed_value;
- action_taken;
- credits_consumed;
- cost_estimate_eur;
- policy_version;
- environment;
- escalation_required;
- support_code.

## Regole per chiamate esterne

In questa fase:

- costo esterno autorizzato: EUR 0;
- chiavi production non autorizzate;
- chiamate a servizi a pagamento non consentite;
- se un test richiede chiamate esterne, deve essere NoWrite o simulato;
- ogni uso reale richiede approvazione esplicita del proprietario.

## Regole per Cloudflare e storage

Gli agenti devono evitare scritture ripetute inutili.

Regole:

- preferire test NoWrite quando possibile;
- usare piccoli batch sintetici;
- evitare loop di put/list su KV;
- interrompere se compare un avviso di limite Cloudflare;
- registrare l'incidente e proporre riduzione del carico;
- non passare a piani a pagamento senza approvazione.

## Escalation

Escalation automatica al proprietario solo se:

- il kill switch globale scatta;
- compare una richiesta con dati reali/personali;
- si rileva tentativo di usare production API key;
- il sistema non riesce a registrare ledger event;
- una macchina cliente contesta ripetutamente gli output;
- un costo potenziale supera EUR 0 in fase non approvata;
- serve una decisione di sblocco manuale.

## Cosa fanno gli agenti

Gli agenti devono:

- controllare soglie prima di eseguire job;
- preferire NoWrite;
- interrompere loop o richieste ripetute;
- scrivere eventi ledger;
- produrre report in italiano;
- proporre aumenti soglia solo con motivazione;
- non acquistare piani, crediti o servizi;
- non attivare chiavi production;
- non inviare outreach.

## Cosa deve approvare il proprietario

Prima della beta a pagamento il proprietario deve approvare:

- budget massimo giornaliero;
- soglie per cliente;
- soglie per prodotto;
- uso eventuale di servizi esterni;
- procedura di kill switch globale;
- chi può riattivare un cliente bloccato;
- quando una richiesta deve arrivare al proprietario;
- eventuale passaggio da EUR 0 a budget reale.

## Stato decisionale

Questa policy può ridurre il blocco rosso `cost_cap_kill_switch` da rosso a giallo, perché crea una bozza verificabile.

Non rende verde il blocco, perché mancano approvazione del proprietario, implementazione tecnica effettiva e test di simulazione sul ledger.

## Divieti confermati

- Nessun pagamento reale.
- Nessuna fattura.
- Nessuna raccolta di metodi di pagamento.
- Nessuna chiave production.
- Nessun dato reale o personale.
- Nessuna chiamata esterna a pagamento.
- Nessun aumento piano Cloudflare senza approvazione.
- Nessun outreach.
- Nessun go-live commerciale.
