# MachineSignal - Terms and Privacy Outline Draft

Data: 2026-06-13  
Stato: prepared  
Modalita': NoWrite planning  
Stato commerciale: not_live

## Sintesi semplice

Questa e' una bozza operativa per termini, privacy e condizioni d'uso di MachineSignal. Non e' un documento legale definitivo e non deve essere pubblicato come contratto senza revisione professionale.

Il punto centrale e' questo: vendiamo output machine-readable a macchine operative, come CRM, agenti AI, workflow e software. Tuttavia dietro la macchina resta sempre un soggetto umano o aziendale che deve accettare condizioni, responsabilita', privacy e pagamenti.

La bozza non abilita:

- pagamenti reali;
- fatture;
- raccolta metodi di pagamento;
- outreach esterno;
- dati reali o personali;
- API key produzione;
- marketplace pubblico a pagamento;
- hosted MCP pubblico;
- go-live commerciale.

## Termini di servizio: cosa deve essere coperto

### 1. Ambito del servizio

MachineSignal fornisce API e output leggibili da software per aiutare sistemi automatici a decidere quali aziende, domini o liste meritano attenzione commerciale.

I termini devono dire chiaramente che:

- il servizio supporta decisioni operative, ma non garantisce vendite o ricavi;
- gli output possono includere score, motivazioni, priorita', azioni consigliate e approfondimenti;
- il cliente operativo puo' essere una macchina, ma la responsabilita' contrattuale resta umana o aziendale.

### 2. Beta e sandbox

Prima del go-live il servizio resta in beta o sandbox.

Regole minime:

- solo dati sintetici o dimostrativi;
- nessun pagamento reale;
- nessun uso per campagne reali;
- nessuna decisione automatica su persone;
- API e schema possono cambiare.

### 3. Uso consentito

I termini devono vietare:

- raccolta o contatto di persone senza base giuridica;
- uso per spam;
- uso con dati sensibili;
- violazione di piattaforme terze;
- aggiramento di rate limit, ledger crediti o controlli anti-abuso.

### 4. Crediti e output valido

Il modello crediti deve essere scritto in modo molto chiaro:

- un credito si consuma solo su output valido;
- errori tecnici o input non validi non consumano credito;
- ogni consumo deve avere request_id, product_code, timestamp, idempotency_key e motivo.

### 5. API key e sicurezza

Le chiavi API devono essere trattate come credenziali riservate.

Prima del live:

- nessuna chiave produzione;
- solo chiavi sandbox controllate;
- revoca immediata in caso di abuso;
- rotazione se c'e' sospetto di esposizione.

### 6. Disponibilita' e limiti

Durante beta e pre-live non deve essere promesso uno SLA commerciale.

Il servizio deve poter applicare:

- rate limit;
- hard stop;
- protezioni cost guard;
- sospensione di richieste anomale.

### 7. Pagamenti e fatture

Prima dei gate fiscali e legali:

- non si raccolgono pagamenti;
- non si raccolgono metodi di pagamento;
- non si emettono fatture;
- i prezzi restano materiale di modellazione e test.

### 8. Supporto ed escalation

Gli agenti possono gestire casi comuni, report, diagnostica e preparazione commerciale.

Devono invece andare in escalation:

- reclami legali;
- privacy;
- sicurezza;
- pagamenti;
- blocchi produzione;
- richieste non standard.

## Privacy: cosa deve essere coperto

### 1. Ruoli privacy

Prima del live bisogna decidere quando MachineSignal e':

- titolare del trattamento;
- responsabile del trattamento;
- sub-responsabile.

La decisione cambia se il cliente invia una lista, se MachineSignal genera score, se un agente terzo chiama l'API o se vengono raccolti dati di supporto/fatturazione.

### 2. Categorie di dati

Possibili dati futuri:

- dati account cliente;
- contatti business;
- dati aziendali pubblici;
- domini;
- input e output API;
- log tecnici;
- credit ledger;
- supporto;
- dati fiscali e billing dopo abilitazione commerciale.

In questa fase i dati reali e personali restano bloccati.

### 3. Finalita' e basi giuridiche

Ogni trattamento deve avere finalita' e base giuridica.

Esempi da definire:

- erogazione API;
- sicurezza;
- prevenzione abusi;
- supporto;
- adempimenti fiscali;
- miglioramento prodotto con dati minimizzati.

### 4. Minimizzazione, retention e cancellazione

Prima del live servono regole per:

- retention log tecnici;
- retention ledger crediti;
- retention input cliente;
- retention output report;
- cancellazione;
- anonimizzazione;
- dati sandbox.

### 5. Diritti degli interessati

Serve una procedura per richieste di:

- accesso;
- rettifica;
- cancellazione;
- limitazione;
- opposizione;
- portabilita', quando applicabile.

### 6. Fornitori, subprocessor e trasferimenti

Serve una lista dei fornitori realmente usati, ad esempio Cloudflare, GitHub, Postman, DataForSEO e altri.

Per ciascuno bisogna chiarire:

- ruolo;
- dati trattati;
- DPA o accordo applicabile;
- eventuali trasferimenti extra UE/SEE;
- uso di SCC se necessario.

### 7. Cookie e sito pubblico

La landing deve essere coerente con cio' che fa davvero.

Da verificare:

- solo cookie tecnici oppure analytics/marketing;
- eventuale banner cookie;
- informativa privacy visibile;
- form o strumenti terzi.

### 8. Data breach

Serve una procedura per:

- rilevare incidenti;
- valutare rischio;
- decidere notifiche;
- documentare evento, impatto e rimedio.

## Decisioni proprietario prima del live legale

- Confermare forma fiscale e amministrativa.
- Far revisionare termini, privacy e DPA da professionista competente.
- Decidere se accettare dati reali, e quali.
- Approvare mappa dati e ruoli privacy.
- Approvare retention per log, input, output e ledger.
- Approvare lista fornitori/subprocessor.
- Approvare cookie/banner/privacy page.
- Approvare processo data breach.
- Approvare termini pagamento/fatturazione solo dopo readiness fiscale.
- Approvare produzione API key e condizioni live.

## Fonti consultate

- Garante Privacy - Regolamento UE: https://www.garanteprivacy.it/regolamentoue
- Garante Privacy - Informativa: https://www.garanteprivacy.it/temi/informativa
- Garante Privacy - Principi fondamentali del trattamento: https://www.garanteprivacy.it/home/principi-fondamentali-del-trattamento
- Garante Privacy - Diritti degli interessati: https://www.garanteprivacy.it/home/diritti/come-agire-per-tutelare-i-tuoi-dati-personali
- Garante Privacy - Cookie FAQ: https://www.garanteprivacy.it/faq/cookie
- Garante Privacy - Data breach: https://www.garanteprivacy.it/data-breach
- Garante Privacy - Dati personali: https://www.garanteprivacy.it/home/diritti/cosa-intendiamo-per-dati-personali
- European Commission - Controller or processor: https://commission.europa.eu/law/law-topic/data-protection/rules-business-and-organisations/obligations/controllerprocessor/what-data-controller-or-data-processor_en
- European Commission - Processing on behalf of organisation: https://commission.europa.eu/law/law-topic/data-protection/rules-business-and-organisations/obligations/controllerprocessor/can-someone-else-process-data-my-organisations-behalf_en
- European Commission - Standard Contractual Clauses: https://commission.europa.eu/law/law-topic/data-protection/international-dimension-data-protection/standard-contractual-clauses-scc_en

## Esito operativo

Readiness legale/privacy stimata prima: 25%.  
Readiness legale/privacy stimata dopo questa bozza: 45%.  
Go-live commerciale: no_go.

Motivo: la struttura ora e' piu' chiara, ma mancano revisione professionale, decisioni proprietario, mappa dati, DPA, retention approvata e readiness fiscale.

Prossimo step consigliato: terms_privacy_agent_review.
