# Modello supporto ed escalation beta

Data: 2026-06-18

Stato: bozza operativa interna per beta controllata

Questo documento definisce come gli agenti devono gestire errori, contestazioni, richieste di chiarimento, superamento limiti e casi non previsti. Non abilita pagamenti reali, fatture, dati reali, chiavi production, outreach o go-live commerciale.

## Obiettivo

Il supporto deve essere machine-first.

La macchina cliente deve ricevere risposte strutturate, codici errore, motivazioni, retry policy e next action senza richiedere intervento umano per i casi normali.

Il proprietario deve essere coinvolto solo quando esiste rischio, costo, decisione commerciale, dati reali/personali o blocco non risolvibile dagli agenti.

## Livelli di supporto

| Livello | Nome | Gestione | Esempi | Obiettivo |
| --- | --- | --- | --- | --- |
| L0 | Risposta automatica API | Sistema/API | input non valido, duplicato, rate limit, prodotto non disponibile in beta | Risolvere senza ticket |
| L1 | Agente supporto automatico | Customer Feedback Agent + Orchestratore | contestazione semplice, chiarimento output, credito non consumato, retry consigliato | Dare risposta strutturata |
| L2 | Agenti specialisti | API Product Manager, Data Quality, Legal/Privacy, Admin/Finance | policy dubbia, errore ricorrente, limite costi, richiesta fuori perimetro | Preparare decisione |
| L3 | Proprietario | Supervisione umana massima 1-2 ore/giorno | approvazione rischio, spesa reale, dati personali, sblocco manuale, go/no-go | Decidere solo eccezioni |
| L4 | Stop globale | Kill switch | abuso, incidente, dati reali, costo potenziale, ledger non affidabile | Proteggere sistema |

## Classi di problemi

| Classe | Esempio | Risposta automatica | Escalation |
| --- | --- | --- | --- |
| invalid_input | dominio malformato, campo obbligatorio mancante | credits_consumed: 0, reason, schema hint | No |
| duplicate | record già analizzato | credits_consumed: 0, original_request_id | No |
| insufficient_signal | output non producibile con qualità minima | credits_consumed: 0, reason, recommended_next_step | No, salvo ripetizione |
| blocked_by_policy | dati reali/personali non autorizzati o uso fuori beta | stop, credits_consumed: 0, policy code | Sì L2/L3 |
| cost_cap_exceeded | superata soglia cliente o endpoint | stop/rate limit, retry_after, support_code | Sì se ricorrente |
| technical_error | timeout, errore interno, ledger temporaneamente non disponibile | credits_consumed: 0, retry policy | Sì se consecutivo |
| disputed_output | macchina contesta score, analisi o consumo credito | ticket interno, status pending_review | Sì L1/L2 |
| refund_credit_request | richiesta ripristino credito | valutazione secondo policy crediti | Sì L1/L2 |
| production_key_request | richiesta chiave production | rifiuto controllato | Sì L3 |
| payment_invoice_request | richiesta pagamento/fattura | rifiuto controllato in fase beta non approvata | Sì L3 |
| external_publication_request | marketplace, registry, hosted MCP, outreach | rifiuto controllato | Sì L3 |
| security_incident | chiave esposta, abuso, accesso anomalo | kill switch, incident event | Sì L4 |

## Risposta API standard per supporto automatico

```json
{
  "status": "needs_support_action",
  "support_level": "L1",
  "support_code": "DISPUTED_OUTPUT",
  "decision": "open_internal_review",
  "credits_consumed": 0,
  "retry_after_seconds": null,
  "machine_message": "The output has been flagged for internal review. No additional credit is consumed.",
  "next_allowed_actions": [
    "check_usage",
    "submit_context",
    "wait_for_review"
  ],
  "owner_escalation_required": false
}
```

## Quando gli agenti possono risolvere da soli

Gli agenti possono risolvere senza proprietario quando:

- l'input è invalido;
- il record è duplicato;
- il credito non è stato consumato;
- l'errore è tecnico ma isolato;
- il caso è già previsto da policy crediti/rimborsi;
- il caso è già previsto da cost cap/kill switch;
- non ci sono pagamenti, fatture, dati reali/personali o chiavi production;
- non serve cambiare listino, termini, privacy o condizioni commerciali.

## Quando devono scalare al proprietario

Gli agenti devono scalare al proprietario quando:

- serve approvare un pagamento reale;
- serve emettere o gestire una fattura;
- compare una richiesta con dati reali o personali;
- viene richiesta una chiave production;
- bisogna sbloccare un kill switch globale;
- il costo potenziale supera EUR 0 in fase non approvata;
- un cliente macchina contesta ripetutamente output o crediti;
- serve cambiare policy, listino o termini;
- viene chiesta pubblicazione marketplace, hosted MCP o registry;
- c'è sospetto di incidente sicurezza;
- una decisione può creare rischio legale, fiscale o reputazionale.

## Tempi di risposta beta

| Tipo | Risposta macchina | Gestione agente | Escalation proprietario |
| --- | --- | --- | --- |
| invalid_input / duplicate | immediata | nessuna | no |
| insufficient_signal | immediata | controllo aggregato settimanale | no |
| technical_error isolato | immediata con retry | entro 24 ore | no |
| technical_error ricorrente | immediata con stop | entro 4 ore | sì se blocca beta |
| disputed_output | immediata con ticket | entro 24 ore | sì se ripetuto |
| blocked_by_policy | immediata con stop | entro 4 ore | sì |
| security_incident | immediata con stop | immediata | sì |

## Ticket interno

Ogni ticket interno deve contenere:

- ticket_id;
- timestamp;
- support_level;
- support_code;
- customer_id o sandbox_customer_id;
- request_id;
- product_code;
- issue_class;
- credits_consumed;
- credit_action;
- policy_reference;
- current_status;
- owner_escalation_required;
- next_action;
- resolution;
- closed_at.

## Azioni vietate nel supporto

Gli agenti non devono:

- promettere rimborsi monetari;
- promettere emissione fattura;
- promettere attivazione di chiavi production;
- accettare dati reali/personali;
- contattare esterni via email o outreach;
- modificare listino o policy senza approvazione;
- sbloccare cost cap globali senza approvazione;
- acquistare servizi o upgrade;
- pubblicare su marketplace, registry o hosted MCP.

## Ruoli agenti

| Agente | Responsabilità supporto |
| --- | --- |
| Orchestratore | assegna ticket, controlla blocchi, mantiene lo stato |
| Customer Feedback Agent | legge errori, contestazioni, richieste e propone risposta |
| Data Quality & Compliance | verifica duplicati, input, dati reali/personali, qualità |
| Scoring Optimizer | valuta contestazioni su score e falsi positivi |
| API Product Manager | aggiorna error code, response schema e documentazione |
| Admin & Finance Controller | blocca pagamenti/fatture/rimborsi monetari non approvati |
| Legal & Privacy Readiness Agent | blocca dati personali, termini, privacy e rischio compliance |
| Agent HR & Continuous Learning | trasforma casi ripetuti in miglioramenti agenti/processo |
| Advisor Gatekeeper | impedisce passaggi da supporto a commerciale senza approvazione |

## Metriche supporto

Metriche da monitorare:

- ticket per classe problema;
- percentuale risolta da L0/L1;
- crediti ripristinati;
- contestazioni confermate;
- contestazioni respinte;
- errori tecnici ricorrenti;
- richieste bloccate da policy;
- richieste che arrivano al proprietario;
- tempo medio di chiusura;
- casi convertiti in miglioramento prodotto.

## Stato decisionale

Questa policy può ridurre il blocco rosso `support_escalation_model` da rosso a giallo, perché crea una bozza verificabile.

Non rende verde il blocco, perché mancano approvazione proprietario, implementazione ticket/ledger e simulazione con casi sintetici.

## Divieti confermati

- Nessun pagamento reale.
- Nessuna fattura.
- Nessun rimborso monetario.
- Nessuna raccolta di metodi di pagamento.
- Nessuna chiave production.
- Nessun dato reale o personale.
- Nessun outreach.
- Nessuna pubblicazione marketplace, registry o hosted MCP.
- Nessun go-live commerciale.
