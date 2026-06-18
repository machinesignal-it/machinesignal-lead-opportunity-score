# MachineSignal - Fiscal/Admin Readiness

Data: 2026-06-18  
Stato: bozza interna di readiness, non consulenza fiscale, non approvazione commerciale  
Ambito: preparare il percorso amministrativo prima di qualunque beta a pagamento

## Sintesi semplice

Questo documento serve a evitare un errore pratico: far funzionare tecnicamente il prodotto, ma non sapere come gestire denaro, fatture, crediti, rimborsi e registrazioni.

MachineSignal puo' continuare la preparazione interna e i test sandbox. Non puo' ancora:

- incassare denaro reale;
- emettere fatture;
- raccogliere metodi di pagamento;
- vendere crediti reali;
- attivare abbonamenti reali;
- dichiarare che la parte fiscale e' risolta.

## Regola principale

Fino a quando il percorso fiscale/amministrativo non e' approvato dal proprietario, ogni richiesta di acquisto reale deve restare una simulazione o una richiesta bloccata.

La macchina cliente puo' leggere listino, catalogo, API, esempi e sandbox. Non puo' concludere un acquisto reale.

## Cosa deve essere deciso prima della beta a pagamento

Prima di una beta a pagamento servono decisioni esplicite su:

1. forma operativa da usare per vendere;
2. eventuale necessita' di Partita IVA o altro inquadramento;
3. codice attivita' e regime fiscale applicabile;
4. regole IVA per clienti italiani, UE ed extra UE;
5. tipo di documento fiscale da emettere;
6. quando emettere il documento: acquisto crediti, consumo crediti, abbonamento o rimborso;
7. dati minimi di fatturazione da raccogliere;
8. gestione di clienti macchina con soggetto umano o societario dietro;
9. processo di riconciliazione tra ordini, crediti, pagamenti e fatture;
10. regole contabili per crediti sostitutivi, riaccrediti e rimborsi;
11. limiti di costo e responsabilita' amministrativa;
12. conservazione dei documenti e registro operazioni.

## Oggetti economici da controllare

MachineSignal non vende solo una singola chiamata API. Il modello puo' includere:

| Oggetto | Rischio amministrativo | Decisione richiesta |
|---|---|---|
| Pay per score | Micro-transazioni o pacchetti di consumo | Quando fatturare e come riconciliare |
| Score Pack 1k | Pacchetto prepagato | Se fatturare all'acquisto o al consumo |
| Deep Analysis Pack | Output premium | Regola di validita' output e riaccredito |
| Action Pack | Payload operativo | Responsabilita' e descrizione servizio |
| Abbonamento API | Ricavo ricorrente | Periodo, rinnovo, fattura e disdetta |
| Crediti sostitutivi | Non sempre rimborso cash | Trattamento amministrativo |
| Rimborso cash | Movimento economico reale | Approvazione proprietario e registrazione |

## Billing profile minimo

Prima di qualunque pagamento reale, ogni cliente deve avere un profilo di fatturazione approvato.

Campi minimi da definire:

- tipo cliente: privato, societa', professionista o altro;
- paese;
- nome/ragione sociale;
- indirizzo fiscale;
- codice fiscale o identificativo fiscale, se richiesto;
- Partita IVA/VAT number, se applicabile;
- email amministrativa;
- accettazione termini;
- consenso alle condizioni di crediti, sostituzioni e rimborsi;
- canale di pagamento approvato;
- riferimento interno customer_id.

Se questi dati non sono presenti o non sono ammessi, la macchina deve ricevere una risposta bloccata.

## Risposta macchina per acquisto non pronto

```json
{
  "status": "blocked_by_fiscal_admin_readiness",
  "decision": "stop",
  "reason": "paid purchase, invoice and billing profile are not approved",
  "credits_consumed": 0,
  "payment_executed": false,
  "invoice_issued": false,
  "owner_escalation_required": true,
  "support_code": "FISCAL_ADMIN_NOT_READY"
}
```

## Controlli minimi prima del passaggio a verde

Il gate fiscal/admin puo' diventare verde solo dopo:

1. decisione proprietario sul percorso fiscale;
2. regola documentata su Partita IVA o alternativa operativa;
3. regola documentata su IVA e documenti fiscali;
4. scelta processo di fatturazione;
5. scelta processo di incasso;
6. billing profile minimo implementato;
7. ledger ordini/crediti/pagamenti/fatture riconciliabile;
8. regola crediti sostitutivi e rimborsi approvata;
9. test sandbox con `payment_executed=false` e `invoice_issued=false`;
10. test pre-produzione solo dopo approvazione proprietario;
11. aggiornamento Company Brain e dashboard;
12. nessun segreto o dato personale pubblicato.

## Cosa possono fare gli agenti

Gli agenti possono:

- preparare checklist fiscali/amministrative;
- generare domande per il proprietario;
- simulare flussi di ordine e riconciliazione senza denaro reale;
- verificare che le API rispondano con blocchi corretti;
- aggiornare P&L e ledger sandbox;
- controllare che non vengano emesse fatture;
- proporre struttura dei campi billing;
- preparare report in italiano.

Gli agenti non possono:

- decidere in modo definitivo se serve o non serve Partita IVA;
- sostituire un parere fiscale ufficiale;
- incassare denaro reale;
- emettere fatture;
- raccogliere carte o metodi di pagamento;
- attivare abbonamenti reali;
- trasformare una simulazione in vendita reale;
- dichiarare risolta la readiness fiscale/amministrativa.

## Stato dashboard

Effetto proposto:

- `fiscal_admin_readiness`: da rosso a candidato giallo.

Motivo:

- esiste una bozza interna verificabile;
- sono chiari i blocchi;
- sono definite le decisioni minime;
- non c'e' ancora approvazione proprietario;
- non c'e' ancora attivazione commerciale.

## Prossima azione sicura

Preparare o verificare il flusso `billing_profile_required` in modalita' sandbox/no-write:

- richiesta acquisto reale;
- blocco automatico;
- `payment_executed=false`;
- `invoice_issued=false`;
- `credits_consumed=0`;
- escalation proprietario richiesta.
