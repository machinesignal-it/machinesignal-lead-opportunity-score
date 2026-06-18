# Terms, privacy e data readiness beta

Data: 2026-06-18

Stato: bozza operativa interna per beta controllata

Questo documento definisce le regole minime su termini, privacy e dati prima di qualsiasi beta a pagamento. Non è un testo legale definitivo, non abilita dati reali/personali, non abilita pagamenti, fatture, chiavi production o go-live commerciale.

## Principio base

In questa fase MachineSignal deve lavorare solo con dati sintetici, demo o non personali.

Qualsiasi dato reale di cliente, lista reale, dato personale, email, telefono, nominativo o informazione riconducibile a persone fisiche resta bloccato fino ad approvazione esplicita del proprietario e fino alla presenza di policy legali/privacy complete.

## Cosa è consentito ora

Sono consentiti:

- domini demo;
- aziende fittizie;
- dataset sintetici;
- esempi generati per test;
- richieste sandbox senza dati reali/personali;
- output simulati;
- purchase intent sandbox senza pagamento;
- ledger tecnico sandbox;
- report interni in italiano;
- test NoWrite;
- piccoli test write-capped solo se non coinvolgono dati reali/personali.

## Cosa è vietato ora

Sono vietati:

- dati personali;
- nomi di persone fisiche;
- email personali o aziendali riconducibili a persone;
- numeri di telefono;
- liste reali di clienti o prospect;
- database acquistati;
- scraping con dati personali;
- richieste contenenti informazioni sensibili;
- dati sanitari, finanziari, giudiziari o categorie particolari;
- upload di file cliente reali;
- elaborazione di campagne reali;
- outreach o email esterne;
- profilazione di persone;
- scoring di persone;
- pagamento reale;
- fattura;
- chiave production;
- marketplace o MCP pubblico.

## Regola input

Ogni input deve essere classificato prima dell'elaborazione.

Classi input:

- synthetic_ok;
- demo_domain_ok;
- public_company_domain_low_risk;
- real_company_dataset_blocked;
- personal_data_blocked;
- sensitive_data_blocked;
- unknown_requires_review.

Se l'input è `real_company_dataset_blocked`, `personal_data_blocked`, `sensitive_data_blocked` o `unknown_requires_review`, il sistema deve fermarsi e non consumare crediti.

## Risposta macchina per dati bloccati

```json
{
  "status": "blocked_by_data_policy",
  "decision": "stop",
  "reason": "real or personal data is not allowed in the current beta stage",
  "credits_consumed": 0,
  "owner_escalation_required": true,
  "support_code": "DATA_POLICY_BLOCK"
}
```

## Termini minimi da preparare prima della beta a pagamento

Prima di qualunque beta a pagamento servono bozze approvate di:

- condizioni d'uso;
- descrizione del servizio;
- limitazioni di responsabilità;
- regole su output automatici;
- regole su score e decisioni;
- divieto di uso per decisioni su persone;
- regole su credito consumato e credito ripristinato;
- regole su disponibilità del servizio;
- regole su sospensione e abuso;
- regole su supporto ed escalation;
- regole su cost cap e kill switch;
- regole su API key e revoca;
- regole su dati ammessi e vietati.

## Privacy minima da preparare prima della beta a pagamento

Prima di qualunque beta a pagamento servono bozze approvate di:

- privacy policy;
- data processing note;
- elenco categorie dati ammesse;
- elenco categorie dati vietate;
- retention policy;
- deletion policy;
- incident contact path;
- ruoli privacy minimi;
- base dati ammessa in sandbox;
- divieto dati personali fino ad approvazione.

## Regole dati per prodotto

| Prodotto | Dati ammessi ora | Dati vietati ora |
| --- | --- | --- |
| Target Discovery | settore/area/obiettivo sintetico o generico | liste reali, contatti, persone |
| Score Pack 1k | domini demo o dataset sintetici | liste reali di aziende/prospect senza approvazione |
| Domain Enrichment | nomi fittizi o demo | nomi reali con dati personali o contatti |
| Deep Analysis | domini demo e segnali sintetici | analisi su clienti/prospect reali |
| Action Pack | payload demo | messaggi reali, campagne reali, contatti reali |
| Opportunity Feed | feed sintetico | feed reale con prospect non approvati |
| API Starter / Pro | uso sandbox con demo data | uso production con dati reali/personali |

## Retention provvisoria

In sandbox:

- conservare solo dati tecnici minimi;
- evitare contenuti reali nei log;
- usare hash input quando possibile;
- mantenere request_id e ledger tecnico;
- cancellare esempi non necessari;
- non salvare file cliente reali;
- non salvare dati personali.

## Regole per gli agenti

Gli agenti devono:

- classificare input prima di elaborare;
- bloccare dati reali/personali;
- non chiedere dati personali al cliente;
- non inviare email o outreach;
- non arricchire persone;
- non fare scraping personale;
- non usare dati sensibili;
- scrivere report in italiano;
- aprire escalation se il dato è dubbio;
- non procedere se non è chiaro se il dato è sintetico o reale.

## Escalation al proprietario

Serve escalation quando:

- una richiesta contiene dati reali;
- una richiesta contiene dati personali;
- una macchina chiede di caricare una lista reale;
- una macchina chiede scoring su persone;
- una macchina chiede output per campagne reali;
- un agente non riesce a classificare il dato;
- una policy deve essere modificata;
- serve decidere retention o cancellazione;
- serve approvare un testo privacy/termini.

## Criteri per passare da rosso a giallo

Il blocco `terms_privacy_data_readiness` può diventare candidato giallo se:

- esiste questa bozza;
- esiste un probe che verifica dati vietati, dati ammessi, escalation e divieti;
- la Company Brain viene aggiornata;
- nessun file pubblico dichiara che dati reali/personali sono ammessi.

## Criteri per passare da giallo a verde

Può diventare verde solo se:

- il proprietario approva;
- i testi finali di termini/privacy/data policy sono pronti;
- esiste un filtro tecnico input classification;
- esiste un test NoWrite su casi ammessi e vietati;
- esiste procedura di cancellazione/retention;
- la beta commerciale, se mai approvata, ha limiti espliciti sui dati.

## Divieti confermati

- Nessun dato reale.
- Nessun dato personale.
- Nessun dato sensibile.
- Nessuna lista reale di clienti/prospect.
- Nessun upload cliente reale.
- Nessun outreach.
- Nessun pagamento reale.
- Nessuna fattura.
- Nessuna chiave production.
- Nessun marketplace/MCP pubblico.
- Nessun go-live commerciale.
