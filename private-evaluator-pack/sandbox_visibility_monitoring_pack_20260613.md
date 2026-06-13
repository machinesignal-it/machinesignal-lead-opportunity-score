# Sandbox Visibility Monitoring Pack

Date: 2026-06-13

## Obiettivo

Controllare ogni giorno se le macchine riescono a trovare, leggere e testare MachineSignal senza trasformare il test in vendita live.

Il pack serve agli agenti per lavorare in autonomia, ma dentro limiti chiari:

- niente pagamenti;
- niente fatture;
- niente checkout;
- niente contatti esterni;
- niente email a umani;
- niente dati reali;
- niente dati personali;
- niente pubblicazione su marketplace o registry senza approvazione.

## Modalita' operativa

Modalita' predefinita: **NoWrite**.

Gli agenti possono fare solo controlli pubblici in lettura:

- leggere il sito MachineSignal;
- leggere la pagina API;
- leggere la pagina beta;
- leggere la pagina machine discovery;
- leggere OpenAPI;
- leggere il manifest MCP;
- leggere la collection Postman pubblica;
- leggere la documentazione GitHub pubblica.

Le chiamate scriventi restano bloccate, salvo rehearsal separato approvato dal proprietario.

## Cosa controllano gli agenti

| Area | Agente responsabile | Cosa verifica |
|---|---|---|
| Visibilita' pubblica | Growth & Distribution | Le pagine pubbliche sono online e chiare per sistemi automatici. |
| Contratti macchina | API Product Manager | OpenAPI, manifest MCP e Postman collection sono validi. |
| Costi e pagamenti | Admin & Finance Controller | Nessun pagamento, fattura, checkout o raccolta metodo di pagamento. |
| Compliance | Legal & Compliance | Nessun dato reale, personale o contatto esterno. |
| Limiti tecnici | Orchestratore | Nessun 429, nessun limite KV, nessun 5xx critico. |
| Miglioramento continuo | Continuous Learning | Suggerisce micro-miglioramenti senza azioni commerciali live. |

## Stati

**Green**

Tutto funziona e resta nei limiti sandbox-only.

Azione: continuare il monitoraggio e produrre un breve report giornaliero.

**Yellow**

Uno o piu' asset pubblici sono lenti, poco chiari o parzialmente non leggibili, ma non ci sono rischi commerciali o legali.

Azione: preparare proposta di correzione e attendere approvazione se la modifica e' significativa.

**Red**

C'e' rischio di costo, pagamento, dato reale, contatto esterno, limite Cloudflare/KV, errore critico o pubblicazione non approvata.

Azione: fermare i test, non riprovare scritture, creare nota di incidente e chiedere approvazione.

## Stop trigger

Gli agenti devono fermarsi se vedono:

- HTTP 429;
- warning su limite Cloudflare KV;
- attivazione pagamento o checkout;
- creazione fattura;
- richiesta metodo di pagamento;
- invio email o outreach;
- caricamento liste reali;
- dati personali;
- pubblicazione chiave API di produzione;
- pubblicazione su marketplace o MCP registry;
- tre errori 5xx ripetuti sui contratti pubblici.

## Report giornaliero

Il report giornaliero deve essere semplice e richiedere poca supervisione.

Campi minimi:

- percentuale roadmap;
- stato green/yellow/red;
- cosa e' stato controllato;
- cosa e' passato;
- cosa e' bloccato;
- eventuali segnali di costo o rischio;
- prossimo passo consigliato;
- azioni che richiedono approvazione.

Tempo obiettivo per l'utente: 15-30 minuti, non 1-2 ore salvo eccezioni.

## Prossimo passo

Eseguire il primo monitor no-write di visibilita' pubblica.

Se il risultato e' green, preparare il **MachineSignal sandbox observation log**, cioe' il registro giornaliero dei test e dei segnali macchina.
