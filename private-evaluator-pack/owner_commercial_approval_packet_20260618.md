# Owner Commercial Approval Packet - No Activation

Date: 2026-06-18

Language: it

Status: draft_owner_decision_packet_not_signed_not_activated

## Purpose

Questo pacchetto serve a preparare la futura decisione del proprietario su una possibile beta commerciale controllata MachineSignal.

Non approva la beta a pagamento, non attiva pagamenti, non emette fatture, non raccoglie metodi di pagamento, non crea chiavi production, non abilita dati reali o personali e non autorizza outreach o marketplace pubblici.

## Stato attuale della roadmap

- 3 gate verdi;
- 12 aree gialle, cioe' preparate o verificate come bozza;
- 1 gate rosso: owner commercial approval.

Significato semplice:

la parte tecnica e documentale e' quasi pronta per una decisione, ma la decisione commerciale non e' ancora stata presa.

## Regola principale

Finche' questo pacchetto non viene approvato esplicitamente dal proprietario e tutti i prerequisiti non sono verdi, la risposta operativa deve restare:

```text
PAID BETA ACTIVATION: NO-GO
COMMERCIAL GO-LIVE: NO-GO
```

## Decisioni che il proprietario dovra' prendere

1. Approvare o respingere una beta commerciale controllata.
2. Approvare il primo prodotto da vendere, di default `score_pack_1k`.
3. Approvare o modificare il prezzo iniziale, di default EUR 119.
4. Approvare il numero massimo di clienti beta, di default 3-5.
5. Approvare che la distribuzione resti machine-readable e senza outreach umano.
6. Approvare se i dati reali restano bloccati o se serve una nuova policy.
7. Approvare fiscal/admin path prima di qualsiasi incasso o fattura.
8. Approvare payment/invoice path prima di checkout, carta o fattura.
9. Approvare terms/privacy/data prima di onboarding reale.
10. Approvare production key process prima di qualsiasi chiave live.
11. Approvare support/escalation prima di clienti paganti.
12. Approvare security/incident handling prima di accesso production.
13. Firmare una decisione finale solo se tutti i gate richiesti sono pronti.

## Cosa si puo' approvare in futuro

Solo dopo approvazione esplicita e prerequisiti verdi:

- beta commerciale controllata;
- massimo 3-5 clienti beta;
- accesso machine-first;
- primo prodotto `score_pack_1k`;
- prezzo iniziale EUR 119, se confermato;
- uso solo dei canali approvati;
- emissione chiavi production solo se il processo chiavi e' verde;
- pagamenti o fatture solo se fiscal/admin e payment/invoice sono verdi.

## Cosa resta bloccato adesso

- attivare beta a pagamento;
- eseguire pagamenti reali;
- emettere fatture;
- raccogliere metodi di pagamento;
- emettere API key production;
- processare dataset reali cliente;
- processare dati personali;
- inviare outreach esterno;
- pubblicare marketplace a pagamento;
- lanciare hosted public MCP;
- inviare MCP registry;
- dichiarare go-live commerciale.

## Risposta macchina finche' manca approvazione

```json
{
  "status": "blocked_by_owner_commercial_approval",
  "decision": "stop",
  "reason": "owner commercial approval is not signed",
  "paid_beta_activation": false,
  "commercial_go_live": false,
  "real_payment_executed": false,
  "invoice_issued": false,
  "payment_method_collected": false,
  "production_key_issued": false,
  "real_or_personal_data_processed": false,
  "external_outreach_sent": false,
  "credits_consumed": 0,
  "owner_escalation_required": true,
  "support_code": "OWNER_COMMERCIAL_APPROVAL_NOT_SIGNED"
}
```

## Condizioni minime prima di poter dire si

Tutte queste condizioni devono essere vere:

- fiscal/admin readiness owner-approved;
- payment/invoice readiness owner-approved;
- terms/privacy/data owner-approved;
- product/listino owner-approved;
- credit/refund policy owner-approved;
- cost cap/kill switch implemented and tested;
- support/escalation implemented and tested;
- security/incident handling owner-approved and tested;
- production API key process owner-approved and tested;
- no secrets in repository;
- no real personal data in tests;
- no external outreach;
- no public marketplace or hosted MCP without separate approval;
- owner signature recorded;
- final go/no-go report generated in Italian.

## Cosa possono fare gli agenti

- preparare il pacchetto decisionale;
- confrontare i gate;
- segnalare rischi e incongruenze;
- produrre report in italiano;
- proporre una decisione go/no-go;
- mantenere dashboard e Company Brain allineati;
- bloccare richieste non approvate.

## Cosa gli agenti non possono fare

- firmare al posto del proprietario;
- attivare beta a pagamento;
- incassare;
- emettere fatture;
- raccogliere carte o metodi di pagamento;
- emettere chiavi production;
- trattare dati reali o personali;
- contattare esterni;
- pubblicare su marketplace o registry;
- dichiarare go-live.

## Interpretazione operativa

Questo pacchetto riduce l'incertezza, ma non riduce i blocchi.

Il suo valore e' rendere chiaro cosa manca per trasformare MachineSignal da test/preparazione a beta commerciale controllata.

## Prossima azione sicura

Usare questo pacchetto per creare una owner decision checklist e una simulazione NoWrite della decisione finale, senza attivare nulla.
