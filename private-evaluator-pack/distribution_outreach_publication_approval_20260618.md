# Distribution, outreach e publication approval beta

Data: 2026-06-18

Stato: bozza operativa interna per beta controllata

Questo documento definisce cosa MachineSignal può pubblicare o rendere visibile alle macchine, e cosa resta vietato senza approvazione esplicita. Non abilita outreach umano, marketplace pubblico, hosted MCP pubblico, registry MCP, pagamenti, fatture, chiavi production o go-live commerciale.

## Principio base

MachineSignal deve farsi trovare dalle macchine con documentazione e file machine-readable, non con email commerciali a umani.

La distribuzione ammessa ora è passiva e documentale: il sistema può esporre file pubblici già coerenti con la sandbox, ma non deve iniziare vendite attive, marketplace, registry o contatti esterni.

## Distribuzione consentita ora

Sono consentiti, se coerenti con lo stato sandbox:

- sito informativo MachineSignal;
- pagina `/api/`;
- pagina `/beta/`;
- `llms.txt`;
- `product-catalog.json`;
- `machine-onboarding.json`;
- `openapi.json`;
- `postman_public_collection.json`;
- `machine-discovery-pack.json`;
- `SANDBOX_PUBLIC_DOCS.md`;
- `sandbox-public-docs.json`;
- README GitHub;
- repo GitHub pubblico se non contiene segreti, dati reali o promesse commerciali non approvate.

Questi canali servono a far capire alle macchine cosa esiste, come testare la sandbox e quali limiti ci sono.

## Distribuzione vietata senza approvazione

Sono vietati:

- email commerciali a persone;
- outreach manuale o automatico verso umani;
- scraping per contattare persone;
- invio LinkedIn/social;
- campagne marketing outbound;
- marketplace API a pagamento;
- RapidAPI o simili;
- pubblicazione MCP registry;
- hosted MCP pubblico;
- Zapier marketplace o app pubblica;
- plugin pubblico non approvato;
- directory agenti pubbliche;
- offerte con pagamento reale;
- claim di produzione o enterprise readiness;
- claim di compliance approvata;
- uso di dati reali/personali per mostrare demo;
- pubblicazione di chiavi, token o segreti;
- pubblicazione di prezzi come offerta commerciale attiva se non approvata.

## Canali e stato

| Canale | Stato ora | Cosa può fare | Cosa non può fare |
| --- | --- | --- | --- |
| Sito MachineSignal | consentito sandbox | spiegare prodotto e limiti | promettere vendita attiva |
| `/api/` | consentito sandbox | documentare endpoint e OpenAPI | offrire produzione |
| `/beta/` | consentito sandbox | spiegare beta non attiva commercialmente | raccogliere pagamenti |
| GitHub README | consentito | documentare API e sandbox | contenere segreti o claim commerciali live |
| OpenAPI | consentito | descrivere contratti sandbox | dichiarare produzione approvata |
| Postman collection | consentito | testare endpoint sandbox | raccogliere dati reali |
| llms.txt | consentito | aiutare agenti a leggere risorse | attivare acquisti reali |
| Marketplace API | vietato | solo bozza interna | pubblicazione esterna |
| MCP registry | vietato | solo bozza interna | submission pubblica |
| Hosted MCP pubblico | vietato | solo simulazione locale/interna | servizio pubblico |
| Email outbound | vietato | nessuna azione | contatto umano |

## Regola machine-first

Una macchina può:

- leggere documenti pubblici;
- leggere catalogo e OpenAPI;
- fare test sandbox;
- inviare purchase intent sandbox;
- ricevere errori e guardrail;
- capire che non ci sono pagamenti reali.

Una macchina non può:

- comprare davvero;
- ricevere produzione;
- ricevere API key production;
- inviare dati reali/personali;
- bypassare owner approval;
- attivare marketplace o MCP pubblico.

## Regola pubblicazione

Prima di pubblicare un nuovo canale esterno serve verificare:

- nessun segreto;
- nessun dato reale/personale;
- nessun claim di go-live;
- nessun pagamento attivo;
- nessuna promessa di fattura;
- nessuna production key;
- chiara dicitura sandbox/beta non commerciale;
- link a documenti coerenti;
- probe NoWrite superato;
- approvazione proprietario se il canale è marketplace, registry, hosted MCP, app pubblica o contatto esterno.

## Risposta macchina per canale vietato

```json
{
  "status": "blocked_by_distribution_policy",
  "decision": "stop",
  "reason": "public marketplace, outreach or hosted MCP publication is not approved",
  "credits_consumed": 0,
  "owner_escalation_required": true,
  "support_code": "DISTRIBUTION_POLICY_BLOCK"
}
```

## Cosa possono fare gli agenti

Gli agenti possono:

- aggiornare documenti sandbox;
- controllare coerenza di OpenAPI, catalogo e onboarding;
- preparare bozze marketplace/MCP non pubblicate;
- preparare checklist pubblicazione;
- produrre report in italiano;
- eseguire probe NoWrite;
- proporre canali machine-readable;
- aggiornare Company Brain se cambia lo stato.

## Cosa non possono fare gli agenti

Gli agenti non possono:

- inviare email esterne;
- contattare persone;
- pubblicare su marketplace;
- inviare submission MCP registry;
- lanciare hosted MCP pubblico;
- pubblicare app Zapier/plugin pubblico;
- attivare pagamenti;
- promettere disponibilità production;
- pubblicare dati reali/personali;
- pubblicare segreti;
- usare account o token per azioni esterne non approvate.

## Escalation al proprietario

Serve approvazione proprietario per:

- qualunque outreach esterno;
- marketplace API;
- MCP registry;
- hosted MCP pubblico;
- app pubblica o plugin pubblico;
- pubblicazione di offerta commerciale attiva;
- modifica sostanziale del posizionamento;
- claim compliance/security/enterprise;
- qualunque passaggio che possa generare clienti reali, pagamenti o richieste production.

## Criteri per passare da rosso a giallo

Il blocco `distribution_outreach_publication_approval` può diventare candidato giallo se:

- esiste questa bozza;
- esiste un probe che verifica canali consentiti, canali vietati, owner approval e divieti;
- la Company Brain viene aggiornata;
- nessun documento dichiara marketplace/MCP/outreach approvati.

## Criteri per passare da giallo a verde

Può diventare verde solo se:

- il proprietario approva il perimetro di distribuzione;
- i canali approvati sono elencati uno per uno;
- esiste checklist pre-pubblicazione;
- esiste probe su segreti, dati reali, claim e pagamenti;
- eventuali marketplace/MCP/restano bloccati o sono approvati esplicitamente;
- Company Brain e dashboard sono aggiornati.

## Divieti confermati

- Nessun outreach umano.
- Nessuna email commerciale esterna.
- Nessun marketplace pubblico.
- Nessun hosted MCP pubblico.
- Nessuna registry MCP.
- Nessuna app pubblica non approvata.
- Nessun pagamento reale.
- Nessuna fattura.
- Nessuna chiave production.
- Nessun dato reale o personale.
- Nessun claim di go-live commerciale.
