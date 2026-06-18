# MachineSignal - Owner action checklist NoWrite

Data: 2026-06-18  
Stato documento: checklist azioni proprietario NoWrite, non firmata, non attivata  
Risultato corrente: `NOT_YET_OWNER_REVIEW_REQUIRED`

Questa checklist trasforma la owner summary in decisioni concrete. Non e' una firma, non e' una approvazione commerciale e non attiva beta a pagamento, go-live, pagamenti, fatture, raccolta metodi di pagamento, chiavi API production, dati reali/personali, outreach o pubblicazioni marketplace/MCP.

## Stato di partenza

| Voce | Stato |
| --- | --- |
| Company Brain | v15 |
| Decisione corrente | `NOT_YET_OWNER_REVIEW_REQUIRED` |
| Dashboard | 3 verdi, 12 gialli, 1 rosso |
| Firma proprietario | assente |
| Attivazione | non consentita |
| Beta a pagamento | `no_go` |
| Go-live commerciale | `no_go` |

## Come usare questa checklist

Per ogni riga il proprietario puo' scegliere:

- `APPROVA_PREPARAZIONE`: consente solo preparazione NoWrite;
- `RINVIA`: lascia il punto aperto;
- `RICHIEDI_MODIFICA`: chiede agli agenti di correggere o dettagliare;
- `BLOCCA`: blocca quel percorso.

Nessuna scelta in questa checklist attiva vendite o incassi.

## Checklist decisionale

| # | Area | Decisione richiesta | Scelta consentita ora | Effetto massimo |
| ---: | --- | --- | --- | --- |
| 1 | Owner approval | Vuoi continuare verso una possibile beta controllata? | `APPROVA_PREPARAZIONE` / `RINVIA` / `BLOCCA` | Solo preparazione |
| 2 | Fiscal/admin | Vuoi definire il percorso fiscale/amministrativo prima di incassare? | `APPROVA_PREPARAZIONE` / `RICHIEDI_MODIFICA` / `RINVIA` | Solo bozza operativa |
| 3 | Payment/invoice | Vuoi preparare regole pagamento/fattura in test? | `APPROVA_PREPARAZIONE` / `RICHIEDI_MODIFICA` / `RINVIA` | Solo test NoWrite |
| 4 | Privacy/data | Vuoi finalizzare dati ammessi/vietati e filtro input? | `APPROVA_PREPARAZIONE` / `RICHIEDI_MODIFICA` / `RINVIA` | Solo policy e filtro |
| 5 | Product/listino/crediti | Vuoi confermare prodotto, prezzo ipotetico, limiti e crediti? | `APPROVA_PREPARAZIONE` / `RICHIEDI_MODIFICA` / `RINVIA` | Solo proposta |
| 6 | Production API keys | Vuoi preparare la policy chiavi production? | `APPROVA_PREPARAZIONE` / `RICHIEDI_MODIFICA` / `RINVIA` | Nessuna chiave emessa |
| 7 | Cost cap/kill switch | Vuoi implementare e simulare limiti costo e stop tecnico? | `APPROVA_PREPARAZIONE` / `RICHIEDI_MODIFICA` / `RINVIA` | Solo test |
| 8 | Support/escalation | Vuoi preparare processo supporto e ticket ledger? | `APPROVA_PREPARAZIONE` / `RICHIEDI_MODIFICA` / `RINVIA` | Solo processo |
| 9 | Security/incident | Vuoi preparare procedura incidente e test sintetico? | `APPROVA_PREPARAZIONE` / `RICHIEDI_MODIFICA` / `RINVIA` | Solo simulazione |
| 10 | Distribution | Vuoi definire canali ammessi e divieti outreach/marketplace/MCP? | `APPROVA_PREPARAZIONE` / `RICHIEDI_MODIFICA` / `RINVIA` / `BLOCCA` | Solo confini |

## Decisione raccomandata dagli agenti

Raccomandazione: `APPROVA_PREPARAZIONE` per i punti 2-10, mantenendo il punto 1 non firmato fino alla fine.

In pratica:

- gli agenti possono completare le bozze operative;
- gli agenti possono simulare;
- gli agenti possono preparare documenti finali;
- gli agenti non possono vendere;
- gli agenti non possono incassare;
- gli agenti non possono emettere chiavi production;
- gli agenti non possono contattare esterni.

## Azioni vietate anche se una riga viene approvata

Restano vietate:

- attivare beta a pagamento;
- fare go-live commerciale;
- incassare denaro;
- emettere fatture;
- raccogliere metodi di pagamento;
- emettere chiavi API production;
- usare dati reali o personali;
- inviare email/outreach esterni;
- pubblicare su marketplace, registry o hosted MCP pubblico;
- creare abbonamenti o rinnovi automatici.

## Output atteso se il proprietario approva solo la preparazione

```json
{
  "status": "owner_action_checklist_preparation_selected_nowrite",
  "decision": "prepare_remaining_gates_only",
  "activation_allowed": false,
  "owner_signature_present": false,
  "paid_beta_activation": false,
  "commercial_go_live": false,
  "next_allowed_actions": [
    "prepare_remaining_gate_workplan_nowrite",
    "continue_nowrite_preparation"
  ]
}
```

## Risposta macchina corrente

```json
{
  "status": "owner_action_checklist_ready_nowrite",
  "decision": "checklist_ready_not_signed_not_activation",
  "current_result": "NOT_YET_OWNER_REVIEW_REQUIRED",
  "activation_allowed": false,
  "owner_signature_present": false,
  "paid_beta_activation": false,
  "commercial_go_live": false,
  "real_payment_executed": false,
  "invoice_issued": false,
  "payment_method_collected": false,
  "production_key_issued": false,
  "real_or_personal_data_processed": false,
  "external_outreach_sent": false,
  "marketplace_or_public_mcp_published": false,
  "next_allowed_actions": [
    "prepare_remaining_gate_workplan_nowrite",
    "continue_nowrite_preparation"
  ],
  "support_code": "OWNER_ACTION_CHECKLIST_READY_NOWRITE"
}
```

## Prossimo step consigliato

Preparare un `remaining_gate_workplan_nowrite`: una lista operativa dei lavori NoWrite necessari per trasformare i 12 gialli in punti verificabili, senza attivare la beta.
