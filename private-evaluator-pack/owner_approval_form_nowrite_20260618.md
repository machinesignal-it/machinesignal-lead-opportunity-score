# MachineSignal - Owner approval form NoWrite

Data: 2026-06-18  
Stato documento: modulo di approvazione NoWrite, non firmato, non attivato  
Risultato corrente: `NOT_YET_OWNER_REVIEW_REQUIRED`

Questo modulo serve a preparare una futura decisione del proprietario. Non contiene una firma reale, non e' una approvazione eseguita e non attiva beta a pagamento, go-live, pagamenti, fatture, raccolta metodi di pagamento, chiavi API production, dati reali/personali, outreach o pubblicazioni marketplace/MCP.

## Avvertenza principale

Compilare o leggere questo modulo non attiva nulla. Una eventuale firma futura dovra' essere uno step separato, esplicito e verificato.

## Stato verificato prima del modulo

| Evidenza | Stato |
| --- | --- |
| Owner decision readiness packet | creato |
| Probe readiness packet | 73 controlli, 0 errori |
| Simulazioni beta | 9 casi passati, 0 falliti |
| Effetti reali | 0 |
| Crediti reali consumati | 0 |
| Crediti simulati consumati | 1 |
| Gate rosso residuo | owner_commercial_approval |

## Decisione richiesta al proprietario

Il proprietario puo' scegliere una sola opzione:

| Opzione | Significato | Effetto immediato |
| --- | --- | --- |
| A - Continua NoWrite | Gli agenti continuano a preparare e testare | Nessuna vendita |
| B - Prepara activation review | Gli agenti preparano un pacchetto successivo di review per eventuale beta controllata | Nessuna vendita |
| C - Richiedi modifiche | Gli agenti correggono condizioni, limiti o documenti | Nessuna vendita |
| D - Stop commerciale | Gli agenti fermano il percorso commerciale | Nessuna vendita |

Opzione raccomandata dagli agenti: **B - Prepara activation review**.

Questa opzione non attiva la beta. Serve solo a preparare un ulteriore pacchetto di review, ancora NoWrite.

## Ambito massimo dell'eventuale beta futura

Se in futuro verra' approvata con firma separata, la beta non potra' superare questo perimetro senza nuova approvazione:

| Elemento | Limite |
| --- | --- |
| Clienti beta | massimo 3 |
| Durata | 30 giorni |
| Primo prodotto | Score Pack 1k |
| Prezzo ipotetico | 119 EUR |
| Rinnovo automatico | no |
| Dati ammessi | domini, URL aziendali, settore, area geografica |
| Dati personali | vietati |
| Outreach | vietato |
| Marketplace/MCP pubblico | vietati |

## Blocchi che restano attivi anche dopo questo modulo

Anche se il proprietario scegliesse l'opzione B, restano bloccati:

- incassi reali;
- fatture;
- raccolta metodi di pagamento;
- emissione chiavi API production;
- uso di dati reali o personali;
- contatti esterni o outreach;
- pubblicazione marketplace, registry o hosted MCP pubblico;
- rinnovi automatici;
- go-live commerciale.

## Campi del modulo

Questi campi sono placeholder NoWrite. Non rappresentano firma reale.

| Campo | Valore |
| --- | --- |
| Nome proprietario | `[DA_COMPILARE_DAL_PROPRIETARIO]` |
| Decisione scelta | `[A/B/C/D - DA_COMPILARE]` |
| Note proprietario | `[DA_COMPILARE]` |
| Data decisione | `[DA_COMPILARE]` |
| Firma reale | `[NON_PRESENTE_IN_NOWRITE]` |

## Frase di approvazione futura ammessa

Solo se il proprietario decidera' di firmare in un passaggio separato, la frase ammessa sara':

```text
Approvo solo la preparazione della activation review NoWrite. Non autorizzo ancora beta a pagamento, go-live, pagamenti, fatture, raccolta metodi di pagamento, chiavi API production, dati reali/personali, outreach o pubblicazioni marketplace/MCP.
```

Questa frase approva la preparazione della review, non l'attivazione.

## Frasi non ammesse

Non sono ammesse frasi ambigue come:

- "partiamo";
- "vendiamo";
- "attiva la beta";
- "incassa";
- "manda email";
- "pubblica su marketplace";
- "apri le chiavi production";
- "usa dati reali".

Se compaiono queste frasi, gli agenti devono bloccare e chiedere una decisione piu' precisa.

## Risposta macchina corrente

```json
{
  "status": "owner_approval_form_ready_nowrite",
  "decision": "form_ready_not_signed_not_activation",
  "current_result": "NOT_YET_OWNER_REVIEW_REQUIRED",
  "recommended_option": "B_prepare_activation_review_nowrite",
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
  "remaining_red_gate": "owner_commercial_approval",
  "next_allowed_actions": [
    "prepare_activation_review_packet_nowrite",
    "continue_nowrite_preparation"
  ],
  "support_code": "OWNER_APPROVAL_FORM_READY_NOWRITE"
}
```

## Prossimo step consigliato

Preparare un `activation_review_packet_nowrite`: un pacchetto di review successivo, ancora non firmato e non attivante, che trasformi l'eventuale opzione B in checklist finale prima di una decisione reale.
