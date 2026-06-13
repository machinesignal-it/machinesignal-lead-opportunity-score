# Pre-commercial go-live gate pack

Date: 2026-06-13

## Obiettivo

Definire cosa deve essere pronto prima di vendere davvero MachineSignal.

Questo pack non attiva nulla:

- non abilita pagamenti;
- non emette fatture;
- non raccoglie metodi di pagamento;
- non pubblica marketplace;
- non pubblica hosted MCP;
- non invia email;
- non contatta aziende;
- non usa dati reali.

## Stato attuale

Fase test sandbox: tecnicamente chiudibile.

Go-live commerciale: **blocked**.

Regola: il go-live commerciale puo' partire solo quando tutti i gate obbligatori sono passati e il proprietario approva esplicitamente.

## Gate obbligatori

| Gate | Agente responsabile | Stato | Blocca il live |
|---|---|---|---|
| Admin/fiscale | Admin & Finance Controller | blocked | si |
| Termini legali | Legal & Compliance | blocked | si |
| Privacy e dati | Legal & Compliance | blocked | si |
| Pagamenti e billing | Admin & Finance Controller | blocked | si |
| API key produzione | API Product Manager | blocked | si |
| Supporto post-vendita | Customer Success & Post-Sale | not ready | si |
| Limiti costo | Orchestratore | not ready | si |
| Distribuzione pubblica | Growth & Distribution | blocked | si |

## Cosa serve prima del live

Admin/fiscale:

- decisione su P.IVA o altra forma fiscale;
- regole emissione fattura;
- conto o provider incassi;
- riconciliazione ricavi/costi;
- registro crediti cliente.

Legale:

- termini di servizio;
- limitazione responsabilita';
- output come supporto decisionale, non garanzia;
- regole rimborso/no-credit se output non valido;
- uso accettabile.

Privacy/dati:

- privacy policy per clienti paganti;
- data processing terms se usiamo dati cliente;
- regola synthetic vs real data;
- minimizzazione dati;
- retention e cancellazione.

Pagamenti:

- provider live;
- checkout live separato dal test mode;
- webhook verificato;
- invoice/receipt flow deciso;
- stop automatico se pagamento e crediti non tornano.

API key produzione:

- emissione key reale;
- rate limit;
- revoca;
- rotazione;
- separazione test/live.

Supporto automatico:

- risposte automatiche agli errori comuni;
- usage e order status via API;
- escalation al proprietario;
- limite lavoro umano giornaliero;
- procedura per non accumulare lavoro.

Costi:

- soglie Cloudflare/DataForSEO/OpenAI;
- limiti giornalieri per cliente;
- circuit breaker;
- costo per output valido;
- margine minimo per prodotto.

Distribuzione:

- scelta canale;
- messaggio pubblico coerente;
- nessuna promessa di risultato garantito;
- nessun claim hosted MCP se non live;
- approvazione prima di pubblicazioni irreversibili.

## Definizione minima di go-live

Go-live significa che una macchina cliente puo':

- comprare un prodotto paid;
- ricevere crediti;
- chiamare l'API;
- consumare crediti solo su output validi;
- leggere usage e ordini;
- ricevere supporto automatico;
- non creare lavoro manuale ordinario.

Prodotti minimi:

- Target Discovery Pack 250;
- Score Pack 1k;
- Deep Analysis Pack 100;
- Action Pack 25.

## Prossimo step

**pre_commercial_gate_gap_analysis**

Confrontare ogni gate con quello che abbiamo gia' pronto e produrre una lista concreta di gap:

- cosa manca;
- chi lo deve preparare;
- se serve il proprietario;
- quanto blocca il go-live.

Modalita': NoWrite planning.
