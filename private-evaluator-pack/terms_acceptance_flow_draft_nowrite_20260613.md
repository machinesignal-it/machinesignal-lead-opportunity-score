# MachineSignal - Terms Acceptance Flow Draft

Data: 2026-06-13  
Stato: prepared  
Modalita': NoWrite planning  
Fonte: machine_readable_terms_summary_draft_nowrite_20260613  
Stato commerciale: not_live  
Go-live: no_go

## Sintesi

Questa bozza chiarisce come dovra' funzionare l'accettazione dei termini quando a usare MachineSignal e' una macchina.

Regola centrale: la macchina puo' usare l'API, ma non puo' essere l'unico soggetto che accetta responsabilita' legali. Ogni macchina deve essere collegata a un account umano o aziendale responsabile.

## Stati di accettazione

| Stato | Significato | Consentito | Bloccato |
| --- | --- | --- | --- |
| `not_present` | Nessun owner responsabile e nessun termine accettato. | Eventuale demo pubblica futura se approvata. | API key, crediti, dati reali, deepening, discovery. |
| `sandbox_accepted` | Owner umano/azienda ha accettato termini sandbox. | Chiamate sintetiche sandbox. | Pagamenti, fatture, dati reali, API key produzione. |
| `pre_live_owner_approved` | Owner approva test controllati pre-live. | Test interni e batch sintetici. | Vendita pagata, dati personali, marketplace, hosted MCP pubblico. |
| `future_live_accepted` | Stato futuro dopo gate legali/fiscali/privacy. | Da definire dopo approvazione. | Tutte le azioni live restano bloccate oggi. |

## Record minimo di accettazione

In futuro ogni accettazione dovra' salvare:

- account_owner_id pseudonimo;
- tipo account owner;
- versione termini accettata;
- versione privacy accettata;
- eventuale versione DPA;
- data/ora accettazione;
- canale di accettazione;
- prova che l'accettazione e' umana/azienda;
- machine_client_id;
- solo prefisso API key, mai chiave completa;
- ambiente;
- prodotti ammessi;
- data scope ammesso;
- hash dei documenti;
- eventuale revoca.

## Flow operativo

1. Identificare owner responsabile.
2. Presentare termini e privacy versionati.
3. Far accettare a owner umano/azienda.
4. Collegare machine client all'owner.
5. Emettere chiave per ambiente specifico, solo quando permesso.
6. Auditare ogni chiamata che consuma crediti.
7. Richiedere nuova accettazione se cambiano termini materiali.
8. Revocare accesso se c'e' violazione policy.

## Risposta machine-readable policy status

Ogni macchina dovrebbe poter sapere:

- stato account owner;
- stato machine client;
- versione termini;
- versione privacy;
- ambiente;
- prodotti ammessi;
- data scope ammesso;
- se puo' consumare crediti;
- se puo' processare dati reali;
- se puo' pagare;
- se serve nuova accettazione;
- motivi di blocco;
- prossime azioni ammesse.

Esempio sandbox: puo' fare demo sintetica, non puo' pagare, non puo' usare dati reali, non puo' andare live.

## Audit richiesto

- Mai salvare chiave API completa nei log.
- Salvare solo prefisso o key id.
- Salvare versione/hash termini e privacy.
- Salvare ambiente e prodotti ammessi.
- Salvare idempotency key per chiamate con credito.
- Salvare credit_delta e valid_output_reason.
- Salvare revoche e ri-accettazioni.
- Retention audit ancora non approvata.

## Vietato ora

- Pagamenti reali.
- Fatture.
- Raccolta metodi di pagamento.
- Outreach esterno.
- Invio email a umani.
- Dati reali.
- Dati personali.
- API key produzione.
- Marketplace pubblico a pagamento.
- Hosted MCP pubblico.
- Registry MCP pubblico.
- Go-live commerciale.
- Trattare la macchina come unica controparte legale.

## Decisioni proprietario richieste

- Approccio versionamento termini.
- Tipi di account owner accettati.
- Meccanismo di accettazione UI/API console.
- Retention audit delle accettazioni.
- Versioni privacy e DPA.
- Regole API key sandbox/live.
- Quando richiedere nuova accettazione.
- Processo revoca/contestazione.

## Readiness dopo questa bozza

- Machine buyer contract readiness: 61%.
- API product readiness: 73%.
- Legal/privacy readiness: 60%.
- Commercial readiness: 64%.
- Go-live: no_go.

Motivo: ora e' chiaro chi accetta i termini per conto della macchina, ma restano da approvare termini legali, privacy, DPA, retention e gate fiscali/pagamenti.

## Prossimo step consigliato

`support_privacy_terms_playbook_nowrite`

Serve per rendere agent-only la gestione ordinaria di domande su privacy, termini, crediti, blocchi e supporto post-vendita.
