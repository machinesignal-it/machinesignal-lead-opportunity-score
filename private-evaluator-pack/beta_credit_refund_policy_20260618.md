# Policy crediti e rimborsi beta

Data: 2026-06-18

Stato: bozza operativa interna per beta controllata

Questa policy serve a chiarire quando un credito viene consumato, quando non viene consumato e quando deve essere ripristinato. Non abilita pagamenti reali, fatture, metodi di pagamento, dati reali o go-live commerciale.

## Principio base

Un credito si consuma solo quando la macchina cliente riceve un output valido, tracciabile e utilizzabile per il prodotto acquistato.

Se l'output non è valido, non è completo oppure non può essere usato dal workflow del cliente macchina, il credito non deve essere consumato.

## Definizioni semplici

Credito: unità tecnica usata per misurare un output valido.

Output valido: risposta che rispetta il contratto del prodotto, contiene i campi obbligatori, ha un request_id tracciabile e può essere usata da una macchina o da un workflow.

Output non valido: risposta incompleta, duplicata, tecnicamente errata, non analizzabile oppure fuori dal contratto del prodotto.

Rimborso credito: ripristino di un credito già scalato per errore o per output non conforme.

Ledger crediti: registro tecnico che conserva ogni evento di consumo, non consumo, errore, ripristino o contestazione.

## Regola generale di consumo

Un credito viene consumato solo se sono vere tutte queste condizioni:

- il prodotto richiesto è riconosciuto;
- la richiesta è sintatticamente valida;
- l'output contiene i campi obbligatori del prodotto;
- l'output ha uno status finale utilizzabile;
- il request_id è registrato nel ledger;
- il risultato non è duplicato rispetto a una richiesta già conteggiata;
- il sistema può spiegare perché il credito è stato consumato.

## Casi in cui il credito non si consuma

Il credito non si consuma quando:

- il dominio è vuoto, malformato o non raggiungibile come input minimo;
- il record è duplicato nello stesso batch;
- il record è già stato analizzato nella stessa finestra di deduplica;
- mancano campi obbligatori;
- il sistema non riesce a produrre l'output minimo promesso;
- l'output è un errore tecnico;
- l'output è solo un messaggio di fallback;
- l'output non supera la soglia minima di confidence prevista per quel prodotto;
- la richiesta viola i blocchi beta, per esempio dati reali/personali non autorizzati;
- il prodotto non è disponibile nella modalità corrente.

## Casi in cui il credito si consuma

Il credito si consuma quando il sistema produce una decisione finale prevista dal prodotto.

Esempi:

- Score Pack: score valido con decisione, confidence, priorità, reason e next action;
- Domain Enrichment: decisione completata anche se il dominio non viene trovato, purché il risultato spieghi in modo affidabile il motivo;
- Deep Analysis: analisi completa con matrice decisionale e next machine call;
- Action Pack: payload azionabile completo con guardrail, deduplication key e approval gate;
- Target Discovery: target coerente consegnato dentro un pack attivato dopo pre-check positivo.

## Regola per prodotto

| Prodotto | Quando consuma credito | Quando non consuma credito | Nota |
| --- | --- | --- | --- |
| Target Discovery Pack 250 | Quando viene consegnato un target coerente dentro un pack attivato con pre-check positivo. | Se il pre-check dice che non si possono produrre 250 target coerenti. | In caso di mercato troppo piccolo si propongono alternative, non si forza il consumo. |
| Score Pack 1k | Quando viene prodotto uno score valido per un record unico e analizzabile. | Duplicati, domini invalidi, record non analizzabili, errori tecnici. | Il pack termina dopo 1000 score validi. |
| Domain Enrichment Pack 100 | Quando viene prodotta una decisione completata: dominio verificato, candidato non affidabile o nessun dominio affidabile. | Input duplicato, input insufficiente, errore tecnico, impossibilità di verificare con criteri minimi. | Non promette che ogni target avrà un dominio. Promette una decisione tracciata. |
| Deep Analysis Pack 100 | Quando l'analisi contiene evidenza commerciale, matrice decisionale, risk flag e next machine call. | Se i segnali sono insufficienti per una deep analysis completa. | Il sistema deve restituire un motivo di esclusione. |
| Action Pack 25 | Quando viene creato un payload CRM/workflow completo e azionabile. | Se il lead non ha abbastanza segnale per un'azione sensata o sicura. | Serve approval gate, anche se il cliente è una macchina. |
| Opportunity Feed | Quando viene consegnata una scansione programmata con opportunità coerenti o un market coverage report utile. | Se il sistema fallisce la consegna per errore tecnico. | Non si riempie il feed con target deboli solo per consumare. |
| API Starter / API Pro | Quando un endpoint produce output valido secondo il prodotto chiamato. | Errori tecnici, input non valido, output incompleto, richiesta bloccata dai guardrail. | Le quote mensili seguono sempre la regola output valido. |

## Regola duplicati

Un record duplicato non consuma credito se:

- ha lo stesso dominio normalizzato;
- ha lo stesso identificativo sorgente;
- è già stato elaborato nello stesso batch;
- è già stato elaborato entro la finestra di deduplica configurata.

La risposta deve indicare:

- status: duplicate;
- original_request_id quando disponibile;
- credits_consumed: 0;
- reason.

## Regola output contestato

Se una macchina cliente contesta un output, il sistema deve creare un evento di contestazione nel ledger.

La contestazione può avere tre esiti:

- confermato: il credito resta consumato;
- ripristinato: il credito viene restituito;
- da verificare: passa al flusso di escalation.

In beta, ogni contestazione deve restare in sandbox e non deve produrre rimborso monetario reale.

## Regola rimborsi

In questa fase il rimborso è solo tecnico, cioè ripristino di credito sandbox o beta. Non esiste rimborso monetario reale.

Un credito viene ripristinato se:

- era stato scalato su output incompleto;
- era stato scalato su errore tecnico;
- era stato scalato su duplicato;
- era stato scalato su prodotto non disponibile;
- era stato scalato senza ledger event valido;
- il probe dimostra incoerenza tra output e contratto prodotto.

## Campi minimi del ledger

Ogni evento crediti deve contenere:

- event_id;
- timestamp;
- customer_id o sandbox_customer_id;
- request_id;
- product_code;
- operation_type;
- input_hash;
- output_status;
- credits_before;
- credits_delta;
- credits_after;
- consumption_reason;
- non_consumption_reason quando applicabile;
- refund_reason quando applicabile;
- policy_version;
- environment.

## Status consigliati

Status di output:

- valid_output;
- invalid_input;
- duplicate;
- insufficient_signal;
- technical_error;
- blocked_by_policy;
- not_available_in_beta;
- disputed;
- credit_restored.

Status contabile:

- consumed;
- not_consumed;
- restored;
- pending_review.

## Esempi sintetici

### Esempio 1: score valido

Input: dominio demo valido.

Output: score 82, confidence high, decision buy_deep_analysis, reason e next action.

Esito: credito consumato.

### Esempio 2: dominio duplicato

Input: stesso dominio già presente nel batch.

Output: status duplicate, original_request_id, reason.

Esito: credito non consumato.

### Esempio 3: deep analysis non producibile

Input: lead con score alto ma segnali insufficienti.

Output: insufficient_signal, motivazione, suggerimento watchlist.

Esito: credito non consumato.

### Esempio 4: domain enrichment senza dominio affidabile

Input: nome azienda demo, area e categoria.

Output: no_reliable_domain, confidence, reason, source type.

Esito: credito consumato, perché la decisione è completa.

### Esempio 5: errore tecnico

Input: richiesta valida.

Output: errore interno o timeout.

Esito: credito non consumato; se già scalato, credito ripristinato.

## Cosa deve fare l'agente

L'agente deve:

- applicare prima la regola output valido;
- scrivere sempre un evento ledger;
- spiegare ogni consumo o mancato consumo;
- bloccare richieste con dati reali/personali non autorizzati;
- non trasformare mai un rimborso tecnico in rimborso monetario;
- segnalare al proprietario i casi non previsti;
- aggiornare la Company Brain se questa policy cambia.

## Cosa deve approvare il proprietario

Prima della beta a pagamento il proprietario deve approvare:

- questa policy crediti/rimborsi;
- la finestra di deduplica;
- la soglia minima di confidence per prodotto;
- le regole di contestazione;
- i casi che devono arrivare in escalation;
- il passaggio da credito sandbox a credito commerciale.

## Stato decisionale

Questa policy può ridurre il blocco rosso `credit_refund_policy` da rosso a giallo, perché crea una bozza verificabile.

Non rende verde il blocco, perché manca ancora approvazione esplicita del proprietario e test di coerenza sul ledger.

## Divieti confermati

- Nessun pagamento reale.
- Nessuna fattura.
- Nessun rimborso monetario.
- Nessuna raccolta di metodi di pagamento.
- Nessun dato reale o personale.
- Nessuna chiave production.
- Nessun outreach.
- Nessun go-live commerciale.
