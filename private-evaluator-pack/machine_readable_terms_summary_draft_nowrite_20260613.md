# MachineSignal - Machine-Readable Terms Summary Draft

Data: 2026-06-13  
Stato: prepared  
Modalita': NoWrite planning  
Fonte: privacy_data_map_draft_nowrite_20260613  
Stato commerciale: not_live  
Go-live: no_go  
Pubblicazione: non approvata

## Sintesi

Questa bozza spiega i termini in modo che una macchina possa capirli.

Serve a dire a CRM, agenti AI, workflow e software:

- quali prodotti esistono;
- quali input sono ammessi;
- quali input sono vietati;
- quando si consuma credito;
- quando non si consuma credito;
- quali azioni sono bloccate.

Non abilita pagamenti, fatture, dati reali, dati personali, marketplace o go-live.

## Regola fondamentale

MachineSignal e' machine-first nell'uso, ma ogni macchina deve essere collegata a un account umano o aziendale responsabile.

La macchina puo' chiamare API, leggere output e decidere il prossimo step tecnico. Non puo' accettare responsabilita' legali da sola senza un account owner.

## Prodotti in bozza

| Product code | Cosa fa | Stato |
| --- | --- | --- |
| `score_pack_1k` | Valuta una lista fornita dal cliente e restituisce score, confidence, decisione e reason code. | draft_not_live |
| `target_discovery_pack_250` | Trova 250 target business-domain in una nicchia/area senza contatti personali. | draft_not_live |
| `action_pack_25` | Trasforma lead gia' score-ati in tag CRM e next action senza inviare outreach. | draft_not_live |
| `deepening_report_single` | Produce un approfondimento strutturato su una singola opportunita' gia' score-ata. | draft_not_live |

## Decisioni supportate

- `discard`: scarta, non spendere altri crediti.
- `watchlist`: tieni sotto osservazione.
- `nurture`: salva in una fase CRM a bassa priorita', senza outreach.
- `buy_deepening`: richiedi approfondimento solo se account, crediti, termini e gate live sono approvati.
- `request_verification`: chiedi verifica automatica o owner review.

## Regole credito

Un credito si consuma solo se l'output e' valido.

Non si consuma credito se:

- schema input non valido;
- richiesta duplicata con stessa idempotency key;
- errore di sistema;
- input vietato;
- dati personali rilevati;
- output incompleto;
- operazione bloccata da policy.

Ogni consumo futuro deve avere:

- request_id;
- product_code;
- idempotency_key;
- timestamp;
- credit_delta;
- valid_output_reason.

## Input vietati

- Nomi di persone.
- Email personali.
- Telefoni personali.
- Dati sensibili.
- Dati carta.
- Password.
- Secret.
- Testo libero con dati personali.
- Richieste di invio email a umani.
- Richieste di outreach.

## Schema minimo di risposta

```json
{
  "request_id": "string",
  "product_code": "string",
  "environment": "sandbox | pre_live | future_live",
  "status": "ok | rejected | blocked | error",
  "decision": "discard | watchlist | nurture | buy_deepening | request_verification",
  "opportunity_score": "number_or_null",
  "confidence": "number_or_null",
  "reason_codes": [],
  "credit_delta": 0,
  "credit_reason": "string",
  "policy_flags": [],
  "next_allowed_actions": []
}
```

## Errori machine-readable

| Error code | Credito | Significato |
| --- | --- | --- |
| `MS_POLICY_FORBIDDEN_INPUT` | 0 | Input vietato o non approvato. |
| `MS_POLICY_LIVE_BLOCKED` | 0 | Operazione richiede live approval non concessa. |
| `MS_SCHEMA_INVALID` | 0 | Schema richiesta non valido. |
| `MS_OUTPUT_INCOMPLETE` | 0 | Output obbligatorio incompleto. |
| `MS_RATE_LIMITED` | 0 | Richiesta bloccata da rate/cost guard. |

## Blocchi globali

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

## Decisioni ancora richieste

- Quando questa sintesi puo' diventare pubblica.
- Prezzi/crediti finali per i pack.
- Flow di accettazione termini per machine buyer.
- Privacy data map e retention.
- API key produzione.
- Go-live commerciale.

## Readiness dopo questa bozza

- Machine buyer contract readiness: 52%.
- API product readiness: 72%.
- Legal/privacy readiness: 58%.
- Commercial readiness: 63%.
- Go-live: no_go.

Motivo: ora il comportamento e' piu' leggibile da macchine, ma non e' pubblico, non e' approvato legalmente e non abilita vendita.

## Prossimo step consigliato

`terms_acceptance_flow_draft_nowrite`

Serve per definire chi accetta i termini quando a usare il servizio e' una macchina.
