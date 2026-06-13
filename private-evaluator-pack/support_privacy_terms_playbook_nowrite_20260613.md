# MachineSignal - Support Privacy Terms Playbook

Data: 2026-06-13  
Stato: prepared  
Modalita': NoWrite planning  
Fonte: terms_acceptance_flow_draft_nowrite_20260613  
Stato commerciale: not_live  
Go-live: no_go

## Sintesi

Questo playbook serve a far lavorare gli agenti in modo autonomo sui casi ordinari di supporto, privacy e termini, senza creare lavoro accumulato per il proprietario.

Gli agenti possono rispondere a domande semplici, spiegare errori, crediti, sandbox e blocchi. Devono invece fermarsi quando compaiono dati reali, dati personali, pagamenti, fatture, decisioni legali, outreach o pubblicazioni esterne.

## Casi che l'agente puo' gestire da solo

| Caso | Cosa puo' fare l'agente | Escalation owner |
| --- | --- | --- |
| Spiegazione servizio | Spiegare che MachineSignal supporta decisioni machine-first, senza garantire ricavi. | No |
| Crediti/no-credit | Spiegare request_id, product_code, credit_delta e motivo. | No |
| Schema/errori | Indicare campi mancanti, error_code e retry con dati sintetici. | No |
| Policy status | Dire se puo' consumare crediti, usare dati reali o pagare. | No |
| Sandbox | Guidare demo sintetica, senza dati reali e senza pagamento. | No |

## Casi che richiedono blocco ed escalation

| Caso | Azione agente | Vietato |
| --- | --- | --- |
| Dati reali/personali | Bloccare processing ed escalare. | Processare, salvare, riassumere dettagli personali. |
| Pagamenti/fatture/fisco | Bloccare azione commerciale ed escalare. | Raccogliere pagamento, emettere fattura, promettere attivazione. |
| Legal/DPA/SLA | Dire che non e' finale ed escalare. | Dichiarare approvazione legale o promettere SLA. |
| Outreach esterno | Bloccare. | Inviare email, contattare persone, raccogliere contatti. |
| Sicurezza/chiavi | Redigere secret ed escalare. | Ripetere secret, committare chiavi, loggare chiave completa. |
| Marketplace/registry/MCP pubblico | Bloccare senza approvazione esplicita. | Pubblicare o attivare offerta pubblica. |

## Risposte standard

### Live non abilitato

```json
{
  "status": "blocked",
  "error_code": "MS_POLICY_LIVE_BLOCKED",
  "credit_delta": 0,
  "message": "Commercial live usage is not enabled. Sandbox synthetic testing only.",
  "next_allowed_actions": ["run_synthetic_demo", "read_machine_readable_terms", "request_owner_review"]
}
```

### Dati reali/personali bloccati

```json
{
  "status": "blocked",
  "error_code": "MS_POLICY_FORBIDDEN_INPUT",
  "credit_delta": 0,
  "message": "Real/personal data processing is not approved. Payload not processed.",
  "next_allowed_actions": ["retry_with_synthetic_data", "remove_personal_fields", "request_privacy_review"]
}
```

### Output non valido, nessun credito

```json
{
  "status": "rejected",
  "error_code": "MS_OUTPUT_INCOMPLETE",
  "credit_delta": 0,
  "message": "No credit consumed because required valid output was not produced.",
  "next_allowed_actions": ["retry_with_valid_schema", "check_required_fields"]
}
```

### Termini/privacy non finali

```json
{
  "status": "blocked",
  "error_code": "MS_LEGAL_REVIEW_REQUIRED",
  "credit_delta": 0,
  "message": "Terms/privacy/DPA are draft and require owner/professional approval before live use.",
  "next_allowed_actions": ["read_draft_summary", "request_owner_review"]
}
```

## Controllo coda

- Gli agenti gestiscono fino a 25 casi ordinari al giorno.
- Al proprietario arrivano massimo 3 escalation sintetiche.
- Ticket duplicati a basso rischio si chiudono automaticamente.
- Dopo 24 ore senza owner, resta attivo solo cio' che e' sicuro e NoWrite.
- Se le escalation superano 5, stop operativo.

## Evidenze salvabili

Salvare solo:

- case_id;
- request_id;
- product_code se presente;
- error_code;
- blocked_reason;
- credit_delta;
- forma redatta del payload;
- flag escalation owner;
- timestamp.

## Vietato salvare

- Payload personale completo.
- Chiave API completa.
- Password.
- Dati carta.
- Email personali dal payload.
- Telefoni personali dal payload.
- Dati sensibili.

## Blocchi preservati

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

## Readiness dopo questa bozza

- Support agent-only readiness: 72%.
- Privacy/terms support readiness: 64%.
- Machine buyer contract readiness: 62%.
- Commercial readiness: 65%.
- Go-live: no_go.

Motivo: il playbook riduce lavoro umano e definisce escalation, ma non sostituisce approvazioni legali, privacy, fiscali e supporto live.

## Prossimo step consigliato

`agent_operating_policy_update_nowrite`

Serve per aggiornare le regole operative di tutti gli agenti, cosi' non propongano piu' azioni vietate e usino sempre questi blocchi.
