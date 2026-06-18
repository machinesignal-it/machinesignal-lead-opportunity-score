# MachineSignal - Payment/Invoice Readiness

Data: 2026-06-18  
Stato: bozza interna di readiness, non attivazione pagamenti, non attivazione fatture  
Ambito: definire cosa deve essere pronto prima di un checkout reale o di una fattura reale

## Sintesi semplice

Questo documento serve a separare tre cose che non vanno confuse:

1. simulazione di acquisto in sandbox;
2. intenzione di acquisto registrata da una macchina;
3. pagamento reale con eventuale fattura.

Oggi MachineSignal puo' gestire solo i primi due casi in modo controllato. Il terzo caso resta bloccato.

## Regola principale

Nessun flusso puo' trasformare una richiesta macchina in pagamento reale o fattura reale finche' non sono approvati:

- percorso fiscale/amministrativo;
- provider di pagamento;
- processo fattura/documento fiscale;
- profilo billing minimo;
- riconciliazione ordini, crediti, pagamenti e fatture;
- termini di vendita;
- regole di rimborso e riaccredito;
- approvazione proprietario.

## Stati ammessi ora

| Stato | Ammesso ora | Cosa significa |
|---|---:|---|
| sandbox_purchase_intent | Si | La macchina registra interesse o simulazione senza denaro |
| payment_test_intent | Si | Test tecnico senza carta reale e senza incasso |
| payment_test_reconciliation | Si | Controllo che il test non abbia prodotto pagamento o fattura |
| live_payment | No | Incasso reale bloccato |
| live_checkout | No | Checkout reale bloccato |
| payment_method_collection | No | Raccolta carta/metodo pagamento bloccata |
| invoice_generation | No | Fattura/documento fiscale reale bloccato |
| subscription_activation | No | Abbonamento reale bloccato |

## Cosa deve restituire la macchina se prova a pagare

```json
{
  "status": "blocked_by_payment_invoice_readiness",
  "decision": "stop",
  "reason": "live payment, payment method collection and invoice generation are not approved",
  "credits_consumed": 0,
  "payment_executed": false,
  "payment_method_collected": false,
  "invoice_issued": false,
  "subscription_activated": false,
  "owner_escalation_required": true,
  "support_code": "PAYMENT_INVOICE_NOT_READY"
}
```

## Provider di pagamento

Prima di scegliere o usare un provider servono decisioni su:

- provider candidato;
- modalita' test e modalita' live separate;
- chi puo' passare da test a live;
- dove si salvano le chiavi;
- rotazione e revoca chiavi;
- webhook ammessi;
- eventi webhook validi;
- riconciliazione tra provider e ledger interno;
- gestione fallimenti, chargeback e rimborsi;
- limiti antifrode e abuso.

## Fatture e documenti fiscali

Prima di emettere documenti reali servono decisioni su:

- se e quando emettere fattura o altro documento;
- chi emette il documento;
- dati minimi obbligatori;
- IVA/VAT e paese cliente;
- momento di emissione;
- relazione tra acquisto crediti e consumo crediti;
- note di credito o riaccrediti;
- conservazione documenti;
- numerazione e audit trail.

## Riconciliazione minima

Ogni evento economico reale, quando sara' approvato, dovra' collegare:

- `customer_id`;
- `order_id`;
- `product_id`;
- `credits_purchased`;
- `credits_consumed`;
- `payment_id`;
- `payment_status`;
- `invoice_id`;
- `invoice_status`;
- `ledger_event_id`;
- `refund_or_recredit_id`, se presente.

Se anche uno solo di questi elementi non e' riconciliabile, il flusso non deve diventare live.

## Controlli minimi prima del verde

Il gate payment/invoice puo' diventare verde solo dopo:

1. fiscal/admin readiness approvata;
2. provider pagamento scelto;
3. test mode separato da live mode;
4. chiavi live assenti dal repository;
5. webhook test verificati;
6. nessuna carta reale in sandbox;
7. fatturazione reale definita;
8. profilo billing minimo implementato;
9. riconciliazione ordini/crediti/pagamenti/fatture testata;
10. risposte bloccate verificate;
11. kill switch pagamenti presente;
12. policy rimborsi/riaccrediti approvata;
13. approvazione proprietario esplicita;
14. Company Brain e dashboard aggiornati.

## Cosa possono fare gli agenti

Gli agenti possono:

- preparare architettura payment/invoice;
- simulare purchase intent;
- simulare payment test intent;
- verificare che `payment_executed=false`;
- verificare che `invoice_issued=false`;
- preparare mapping ledger;
- proporre campi di riconciliazione;
- preparare checklist provider;
- preparare report in italiano.

Gli agenti non possono:

- attivare checkout reale;
- raccogliere carta o metodo di pagamento;
- incassare;
- emettere fattura;
- creare abbonamento reale;
- usare chiavi live;
- salvare segreti nel repository;
- cambiare prezzi in offerta commerciale live;
- considerare una simulazione come vendita reale.

## Stato dashboard

Effetto proposto:

- `payment_invoice_readiness`: da rosso a candidato giallo.

Motivo:

- esiste una bozza interna verificabile;
- sono chiari gli stati ammessi e bloccati;
- sono definite le condizioni minime;
- non c'e' approvazione proprietario;
- non c'e' provider live;
- non c'e' fatturazione reale.

## Prossima azione sicura

Preparare o verificare in sandbox/no-write un blocco `live_payment_requested`:

- richiesta checkout reale;
- risposta `blocked_by_payment_invoice_readiness`;
- `payment_executed=false`;
- `payment_method_collected=false`;
- `invoice_issued=false`;
- `subscription_activated=false`;
- `credits_consumed=0`.
