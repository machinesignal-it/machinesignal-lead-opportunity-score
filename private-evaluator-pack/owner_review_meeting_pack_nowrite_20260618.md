# MachineSignal - Owner review meeting pack NoWrite

Data: 2026-06-18  
Stato documento: pacchetto di review proprietario, NoWrite, non firmato, non attivato  
Risultato corrente: `NOT_YET_OWNER_REVIEW_REQUIRED`

Questo documento serve a preparare una futura decisione del proprietario. Non e' una approvazione, non e' una firma e non autorizza beta a pagamento, pagamenti, fatture, raccolta metodi di pagamento, chiavi API di produzione, uso di dati reali/personali, outreach o pubblicazioni marketplace/MCP.

## Sintesi da leggere prima

MachineSignal e' in una fase avanzata di preparazione: la sandbox tecnica e' pronta per lo scope corrente, gli agenti di controllo sono presenti, la documentazione macchina e' allineata e il final gap report e' stato validato.

La dashboard resta pero':

| Stato | Numero |
| --- | ---: |
| Verdi | 3 |
| Gialli | 12 |
| Rossi | 1 |

Il rosso ancora aperto e': `owner_commercial_approval`.

Decisione corrente:

| Decisione | Esito |
| --- | --- |
| Continuare preparazione NoWrite | consentito |
| Preparare revisione proprietario | consentito |
| Attivare beta a pagamento | bloccato |
| Go-live commerciale | bloccato |
| Incassare denaro | bloccato |
| Emettere fatture | bloccato |
| Emettere chiavi API production | bloccato |
| Usare dati reali/personali | bloccato |
| Fare outreach esterno | bloccato |

## Obiettivo della review

La review non deve decidere "partiamo subito". Deve decidere se il progetto puo' passare dal lavoro NoWrite alla preparazione controllata della beta, mantenendo ancora separata l'eventuale attivazione commerciale.

In pratica, l'obiettivo e':

1. capire se il modello e' abbastanza chiaro;
2. capire quali blocchi possono diventare verdi;
3. confermare quali azioni restano vietate;
4. preparare una decisione successiva, separata, per una beta a pagamento eventualmente limitata.

## Decisioni da prendere

### 1. Decisione commerciale proprietario

Domanda: il proprietario vuole continuare verso una beta controllata, senza ancora vendere?

Opzioni:

| Opzione | Significato | Effetto |
| --- | --- | --- |
| Continua NoWrite | Si continua a preparare e testare | Nessuna vendita |
| Prepara beta controllata | Si prepara un activation packet separato | Nessuna vendita immediata |
| Stop commerciale | Si ferma la parte commerciale | Solo manutenzione tecnica |

Decisione raccomandata ora: `prepara beta controllata`, ma senza attivazione.

### 2. Fiscalita' e amministrazione

Domanda: prima di incassare, quale percorso fiscale/amministrativo usera' MachineSignal?

Da decidere:

- partita IVA o altra struttura ammessa;
- regole IVA;
- quando e come emettere fattura;
- profilo di fatturazione;
- riconciliazione tra ordine, credito, pagamento e fattura.

Finche' questa parte non e' approvata, pagamenti e fatture restano bloccati.

### 3. Pagamenti

Domanda: quale modalita' di incasso verra' usata, e con quali limiti?

Da decidere:

- provider di pagamento;
- ambiente test e live separati;
- kill switch pagamenti;
- limite massimo di incasso beta;
- regola di rimborso o sostituzione crediti.

Finche' questa parte non e' approvata, non si raccolgono carte o metodi di pagamento.

### 4. Prodotto e listino

Domanda: quale prodotto si propone per primo?

Ipotesi attuale da review:

| Prodotto | Uso | Stato |
| --- | --- | --- |
| Score Pack 1k | Valutare 1.000 target con output valido e tracciato | candidato |
| Target Discovery Pack | Trovare target utili quando il cliente non ha una lista | candidato |
| Action Pack | Preparare azioni operative leggibili da CRM/agenti | candidato |

Da decidere:

- primo prodotto beta;
- prezzo beta;
- limiti per cliente;
- cosa succede se un output non e' valido;
- validita' dei crediti;
- gestione crediti non usati.

### 5. Privacy, dati e input ammessi

Domanda: quali dati puo' ricevere MachineSignal nella beta?

Regola prudente raccomandata:

- solo domini, URL aziendali, settore e area geografica;
- niente dati personali;
- niente dataset clienti reali fino a policy approvata;
- niente liste con email personali, numeri personali o note sensibili.

Da decidere:

- testi finali privacy/termini;
- filtro tecnico input ammessi/bloccati;
- retention e cancellazione;
- test NoWrite su dati ammessi e dati bloccati.

### 6. Chiavi API production

Domanda: quando e come si emette una chiave API di produzione?

Da decidere:

- secret manager;
- generazione, rotazione e revoca;
- rate limit e quote;
- audit log;
- regola "nessun segreto nel repository";
- dry-run senza chiavi reali.

Finche' questa parte non e' approvata, nessuna chiave production viene emessa.

### 7. Cost cap, supporto e sicurezza

Domanda: come evitiamo costi incontrollati e problemi operativi?

Da decidere:

- limite massimo di costo;
- kill switch tecnico;
- ticket ledger;
- simulazione caso supporto;
- procedura incidente;
- gestione segreti;
- alert provider.

## Decisione proposta per oggi

La decisione proposta oggi non e': "vendiamo".

La decisione proposta oggi e':

```text
Autorizzo gli agenti a preparare un activation packet NoWrite per una beta controllata, mantenendo bloccati pagamenti, fatture, raccolta metodi di pagamento, chiavi API production, dati reali/personali, outreach e pubblicazioni marketplace/MCP finche' non daro' una approvazione separata.
```

Questa decisione non consuma crediti cliente, non incassa denaro e non apre il servizio al pubblico.

## Check finale prima di qualsiasi futura attivazione

Prima di attivare davvero una beta a pagamento, dovranno essere veri tutti questi punti:

| Punto | Stato richiesto |
| --- | --- |
| Firma proprietario | approvata |
| Fiscalita'/amministrazione | approvata |
| Pagamenti/fatture | approvati e testati |
| Termini/privacy/dati | approvati e implementati |
| Prodotto/listino/crediti | approvati |
| Chiavi API production | policy approvata e testata |
| Cost cap/kill switch | implementati e testati |
| Supporto/escalation | implementati e testati |
| Sicurezza/incidente | approvati e testati |
| Distribuzione | canali approvati |

## Output macchina corrente

```json
{
  "status": "owner_review_pack_ready_nowrite",
  "decision": "review_only",
  "current_result": "NOT_YET_OWNER_REVIEW_REQUIRED",
  "recommended_owner_decision": "prepare_controlled_beta_activation_packet_nowrite",
  "paid_beta_activation": false,
  "commercial_go_live": false,
  "real_payment_executed": false,
  "invoice_issued": false,
  "payment_method_collected": false,
  "production_key_issued": false,
  "real_or_personal_data_processed": false,
  "external_outreach_sent": false,
  "credits_consumed": 0,
  "remaining_red_gate": "owner_commercial_approval",
  "next_allowed_actions": [
    "prepare_controlled_beta_activation_packet_nowrite",
    "continue_nowrite_preparation"
  ],
  "support_code": "OWNER_REVIEW_PACK_READY_NOWRITE"
}
```

## Prossimo step consigliato

Creare un `controlled_beta_activation_packet_nowrite`: un pacchetto ancora non attivante che traduce questa review in condizioni operative, checklist finale e simulazioni di blocco prima di qualunque decisione commerciale reale.
