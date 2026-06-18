# Piano di sblocco dei blocchi rossi

Data: 2026-06-18

Stato: preparazione interna, nessuna attivazione commerciale

Questo documento trasforma gli 11 blocchi rossi del dashboard decisionale in azioni operative verificabili. Non autorizza beta a pagamento, pagamenti, fatture, dati reali, outreach o pubblicazioni pubbliche.

## Sintesi

La piattaforma tecnica è pronta per la sandbox, ma non è ancora pronta per vendere. Il problema non è più principalmente tecnico: è operativo, amministrativo, legale, di controllo costi e di gestione post-vendita.

Gli agenti possono preparare bozze, controlli, checklist, simulazioni e report. Non possono sostituire una decisione del proprietario quando serve approvare un rischio, un costo, una policy o un passaggio commerciale.

## Regola di avanzamento

Un blocco rosso può diventare giallo solo quando esiste una bozza completa e verificabile.

Un blocco giallo può diventare verde solo quando:

- il proprietario ha approvato esplicitamente;
- l'evidenza è salvata nel repository;
- un probe NoWrite conferma che non sono stati attivati pagamenti, fatture, dati reali o outreach;
- la Company Brain è aggiornata.

## Blocchi rossi e piano di sblocco

| Blocco rosso | Cosa significa in pratica | Cosa fanno gli agenti | Cosa deve decidere il proprietario | Evidenza richiesta | Stato attuale |
| --- | --- | --- | --- | --- | --- |
| Owner commercial approval | Serve una decisione esplicita sul passaggio da test interno a beta controllata. | Preparano decision memo, rischi, condizioni minime e opzioni go/no-go. | Decidere se autorizzare una beta, con quali limiti e quando. | Documento di approvazione proprietario con perimetro, limiti e blocchi residui. | Rosso |
| Fiscal/admin readiness | Serve capire se e come si può incassare legalmente. | Preparano scenari operativi, lista informazioni mancanti e checklist amministrativa. | Decidere se restare in test gratuito, aprire posizione fiscale o attendere. | Checklist amministrativa firmata/approvata dal proprietario. | Rosso |
| Payment and invoice readiness | Serve sapere come ricevere pagamenti e produrre documenti fiscali senza errori. | Disegnano flusso simulato di pagamento, ricevuta/fattura, rimborso e riconciliazione. | Approvare se e quale canale usare. | Flusso pagamento/fattura approvato, ma non attivato finché non autorizzato. | Rosso |
| Terms/privacy/data readiness | Serve avere regole chiare su uso del servizio, dati, privacy, responsabilità e limiti. | Preparano bozze di termini, privacy, data policy e regole sandbox/paid beta. | Approvare il testo e il livello di rischio accettato. | Pacchetto policy completo e approvato. | Rosso |
| Product/listino approval | Serve congelare cosa vendiamo, quanto costa e cosa include ogni prezzo. | Confrontano catalogo, listino, P&L, OpenAPI e documenti pubblici. | Approvare listino, pacchetti e regole di consumo crediti. | Listino approvato con descrizione esatta di cosa include ogni prodotto. | Rosso |
| Credit/refund policy | Serve decidere quando un credito viene consumato, restituito o non scalato. | Preparano regole per record validi, invalidi, duplicati, incompleti e output non producibili. | Approvare la policy crediti/rimborsi. | Documento policy crediti con esempi e casi limite. | Rosso |
| Production API keys | Serve decidere se e quando usare chiavi API vere e ambiente production. | Preparano schema di secret management, ambienti, rotazione e test NoWrite. | Autorizzare o bloccare l'uso di chiavi production. | Checklist secret management e autorizzazione esplicita. | Rosso |
| Cost cap/kill switch | Serve impedire costi incontrollati se una macchina fa troppe richieste. | Preparano limiti, quote, soglie, alert, blocchi automatici e simulazioni. | Approvare budget massimo e soglie di stop. | Policy cost cap e kill switch testata in sandbox. | Rosso |
| Support/escalation model | Serve sapere cosa succede se il cliente macchina segnala errori, output contestati o richieste. | Disegnano flussi di supporto automatico, ticket, risposta standard e casi da portare al proprietario. | Approvare quali problemi devono arrivare a te. | Matrice supporto/escalation con tempi e responsabilità. | Rosso |
| Security/incident readiness | Serve gestire incidenti, abuso, chiavi esposte, errori e accessi non previsti. | Preparano incident playbook, checklist sicurezza e simulazioni. | Approvare soglie di blocco e procedura di emergenza. | Playbook sicurezza e incidente. | Rosso |
| Distribution/outreach/publication approval | Serve decidere dove renderci visibili senza contattare umani o pubblicare troppo presto. | Preparano opzioni machine-readable: docs, GitHub, OpenAPI, Postman, llms.txt, pagine discovery. | Approvare eventuale pubblicazione o mantenimento privato. | Piano distribuzione approvato, senza outreach umano automatico. | Rosso |

## Priorità consigliata

1. Product/listino approval e Credit/refund policy.
2. Cost cap/kill switch.
3. Terms/privacy/data readiness.
4. Support/escalation model.
5. Fiscal/admin readiness e Payment/invoice readiness.
6. Security/incident readiness.
7. Production API keys.
8. Distribution/outreach/publication approval.
9. Owner commercial approval finale.

Questa priorità ha senso perché prima dobbiamo sapere esattamente cosa vendiamo, quando consumiamo crediti e come blocchiamo costi o richieste anomale. Solo dopo ha senso parlare di pagamento, fattura, pubblicazione o beta commerciale.

## Prossimo step operativo sicuro

Preparare la policy crediti/rimborsi in versione beta, usando solo esempi sintetici. Questo riduce due blocchi: Product/listino approval e Credit/refund policy.

## Cosa resta vietato

- Nessun pagamento reale.
- Nessuna fattura.
- Nessuna raccolta di carte o metodi di pagamento.
- Nessuna chiave API production.
- Nessun dato reale o personale.
- Nessun contatto esterno.
- Nessuna email commerciale.
- Nessuna pubblicazione marketplace.
- Nessun hosted MCP pubblico.
- Nessuna registry MCP.
- Nessun go-live commerciale.
