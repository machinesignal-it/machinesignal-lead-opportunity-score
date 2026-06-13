# MachineSignal - Privacy Data Map Draft

Data: 2026-06-13  
Stato: prepared  
Modalita': NoWrite planning  
Fonte: terms_privacy_agent_review_20260613  
Stato commerciale: not_live  
Go-live: no_go

## Sintesi semplice

Questa mappa dati spiega quali dati potrebbero entrare, uscire o restare in MachineSignal.

Non contiene dati reali e non autorizza l'uso di dati reali o personali. Serve per sapere cosa manca prima di vendere davvero.

## Regole base

- Solo sandbox finche' non c'e' approvazione.
- Solo dati sintetici finche' non c'e' approvazione privacy.
- Minimizzare i campi in input.
- Separare dati account da dati scoring.
- Nessun dato sensibile.
- Nessun arricchimento di persone.
- Nessuna raccolta contatti per outreach.

## Flussi dati mappati

| Flusso | Stato | Dati principali | Rischio | Blocco live |
| --- | --- | --- | --- | --- |
| Account futuro | future_blocked | account business, email business, company, piano | medio | fiscal/admin + privacy notice |
| Richiesta API sandbox | allowed_sandbox_only | dati sintetici, request_id, product_code | basso se sintetico | nessuno per sandbox sintetico |
| Lista cliente futura | future_blocked | aziende, domini, settore, area | medio | data map, DPA, retention |
| Target discovery futura | future_blocked | settore, area, criteri business | medio | source policy e legal review |
| Score output/action pack | solo sintetico o futuro approvato | score, confidence, decisione, reason code | basso se niente persone | valid output e ledger retention |
| Credit ledger | design only | customer_id pseudonimo, product_code, delta crediti | basso se pseudonimo | retention e fiscal/admin |
| Supporto/privacy future | future_blocked | messaggi supporto, account id, categoria richiesta | medio | support playbook e intake privacy |
| Sicurezza/abusi | design only | key prefix, rate, error pattern, possibile IP | medio se IP loggato | retention security e incident response |

## Campi vietati fino ad approvazione

- Nomi di persone.
- Email personali.
- Telefoni personali.
- Indirizzi di casa.
- Dati sanitari.
- Opinioni politiche.
- Religione.
- Dati biometrici.
- Dati carta.
- Password.
- Secret.
- Testi liberi con dati personali.

## Fornitori da verificare prima del live

| Fornitore | Uso attuale/futuro | Rischio da verificare |
| --- | --- | --- |
| Cloudflare | Workers, routing, possibili log/KV | log tecnici e metadata API |
| GitHub | repository, Actions, documentazione | evitare dati cliente nel repo/log |
| Postman | collection e test API | evitare dati reali nelle collection |
| DataForSEO | scouting/test provider | query e parametri ricerca business |
| Register.it | dominio, hosting/email | email metadata, hosting log |

## Retention proposta, non approvata

| Categoria | Retention suggerita | Stato |
| --- | --- | --- |
| Sandbox test logs | 30 giorni | non approvata |
| Raw input cliente futuro | 7-30 giorni dopo processing | non approvata |
| Score output futuro | 30-90 giorni o configurabile | non approvata |
| Credit ledger | account lifetime + finestra disputa/contabile | non approvata |
| Security logs | 30-90 giorni salvo incidente | non approvata |
| Registro richieste privacy | periodo legale da definire | non approvata |

## Processo cancellazione bozza

1. Ricevere richiesta privacy/cancellazione da canale approvato.
2. Identificare account e categoria dati senza esporre altri dati.
3. Capire se MachineSignal e' titolare o responsabile per quel flusso.
4. Se responsabile, seguire istruzioni del cliente/titolare.
5. Cancellare raw input/output dove possibile.
6. Pseudonimizzare ledger/security record se non eliminabili per audit o obblighi.
7. Registrare esito nel registro richieste privacy.
8. Escalare in caso di dubbio legale/privacy.

## Decisioni ancora aperte

- Accettiamo liste reali di aziende/domini?
- Accettiamo mai dati personali business?
- Quali retention approviamo?
- Quali fornitori/subprocessor approviamo?
- In quali flussi siamo titolare, responsabile o sub-responsabile?
- Quali testi finali usiamo per privacy notice e DPA?
- Logghiamo IP? Per quanto?
- Possiamo fare target discovery da fonti pubbliche? Con quali limiti?

## Blocchi preservati

- Pagamenti reali.
- Fatture.
- Raccolta metodi di pagamento.
- Outreach o contatti esterni.
- Dati reali.
- Dati personali.
- API key produzione.
- Marketplace pubblico a pagamento.
- Hosted MCP pubblico.
- Registry MCP pubblico.
- Go-live commerciale.

## Readiness dopo questa mappa

- Legal/privacy readiness: 57%.
- Data governance readiness: 55%.
- Commercial readiness: 62%.
- Go-live: no_go.

Motivo: i flussi ora sono chiari, ma retention, ruoli privacy, DPA, fornitori, source policy e accettazione termini restano da approvare.

## Prossimo step consigliato

`machine_readable_terms_summary_draft_nowrite`

Serve per spiegare anche alle macchine quali prodotti esistono, cosa possono chiedere, quando si consuma credito e cosa e' vietato.
