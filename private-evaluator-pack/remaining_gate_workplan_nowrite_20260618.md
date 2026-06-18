# MachineSignal - Remaining gate workplan NoWrite

Data: 2026-06-18  
Stato documento: piano operativo gate residui NoWrite, non firmato, non attivato  
Risultato corrente: `NOT_YET_OWNER_REVIEW_REQUIRED`

Questo piano trasforma i 12 gate gialli in lavori verificabili. Non e' una firma, non e' una approvazione e non attiva beta a pagamento, go-live, pagamenti, fatture, raccolta metodi di pagamento, chiavi API production, dati reali/personali, outreach o pubblicazioni marketplace/MCP.

## Stato di partenza

| Stato dashboard | Numero |
| --- | ---: |
| Verdi | 3 |
| Gialli | 12 |
| Rossi | 1 |

Rosso residuo: `owner_commercial_approval`.

Obiettivo di questo workplan: portare i 12 gialli a lavori preparati e verificabili in NoWrite. Non portarli automaticamente a verde e non attivare la beta.

## Regola base

Ogni gate deve produrre:

1. un deliverable leggibile;
2. un file JSON leggibile dagli agenti;
3. un probe con 0 errori;
4. nessun effetto reale;
5. nessuna apertura commerciale.

## Piano dei 12 gate gialli

| # | Gate | Deliverable NoWrite | Probe richiesto | Effetto massimo |
| ---: | --- | --- | --- | --- |
| 1 | policy_preparation | policy pack finale di preparazione | policy_pack_probe | bozza controllata |
| 2 | pnl_paid_beta_delta | delta P&L beta controllata | pnl_delta_probe | scenario economico |
| 3 | credit_refund_policy_candidate | regole crediti/rimborsi | credit_refund_probe | policy non live |
| 4 | cost_cap_kill_switch_candidate | piano cost cap e kill switch | cost_cap_probe | simulazione |
| 5 | support_escalation_model_candidate | supporto e ticket ledger | support_probe | processo |
| 6 | terms_privacy_data_readiness_candidate | termini/privacy/data filter | terms_privacy_probe | policy e filtro |
| 7 | security_incident_readiness_candidate | procedura sicurezza/incidente | incident_probe | simulazione |
| 8 | distribution_outreach_publication_approval_candidate | confini canali/no outreach | distribution_probe | confini |
| 9 | fiscal_admin_readiness_candidate | percorso fiscal/admin | fiscal_admin_probe | bozza operativa |
| 10 | payment_invoice_readiness_candidate | regole payment/invoice | payment_invoice_probe | test NoWrite |
| 11 | product_listino_approval_candidate | prodotto/listino/crediti | product_listino_probe | proposta |
| 12 | production_api_key_readiness_candidate | policy chiavi production | production_key_probe | nessuna chiave |

## Ordine consigliato

Ordine consigliato dagli agenti:

1. terms/privacy/data readiness;
2. fiscal/admin readiness;
3. payment/invoice readiness;
4. product/listino/crediti;
5. credit/refund policy;
6. cost cap/kill switch;
7. production API keys;
8. security/incident;
9. support/escalation;
10. distribution boundary;
11. P&L delta;
12. policy pack finale.

Motivo: prima si chiudono i rischi dati, fiscali e pagamento; poi si rafforza il prodotto; infine si consolida la documentazione finale.

## Criteri per considerare un gate pronto alla review

Un gate puo' essere definito `ready_for_owner_review` solo se:

- esiste il deliverable;
- esiste il JSON;
- esiste il probe;
- il probe passa con 0 errori;
- il deliverable dice chiaramente che non e' live;
- nessun flag di attivazione e' `true`;
- nessun pagamento/fattura/chiave/dato reale/outreach viene abilitato.

## Cosa resta vietato durante questo workplan

Restano vietati:

- attivare beta a pagamento;
- fare go-live commerciale;
- incassare denaro;
- emettere fatture;
- raccogliere metodi di pagamento;
- emettere chiavi API production;
- usare dati reali o personali;
- inviare email/outreach esterni;
- pubblicare marketplace, registry o hosted MCP pubblico;
- creare abbonamenti o rinnovi automatici.

## Risposta macchina corrente

```json
{
  "status": "remaining_gate_workplan_ready_nowrite",
  "decision": "prepare_remaining_gates_only",
  "current_result": "NOT_YET_OWNER_REVIEW_REQUIRED",
  "activation_allowed": false,
  "owner_signature_present": false,
  "yellow_gates_planned": 12,
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
    "prepare_terms_privacy_data_gate_nowrite",
    "continue_nowrite_preparation"
  ],
  "support_code": "REMAINING_GATE_WORKPLAN_READY_NOWRITE"
}
```

## Prossimo step consigliato

Preparare il primo gate del piano: `terms_privacy_data_gate_nowrite`, per chiarire input ammessi, input vietati, retention, cancellazione e filtro tecnico NoWrite.
