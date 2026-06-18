# MachineSignal - Controlled beta activation packet NoWrite

Data: 2026-06-18  
Stato documento: pacchetto operativo NoWrite, non firmato, non attivato  
Risultato corrente: `NOT_YET_OWNER_REVIEW_REQUIRED`

Questo documento prepara le condizioni per una possibile beta controllata. Non attiva la beta, non autorizza vendite, non incassa denaro, non emette fatture, non raccoglie metodi di pagamento, non emette chiavi API di produzione e non consente dati reali o personali.

In forma ancora piu' esplicita: questo packet non attiva la beta.

## Principio guida

La beta controllata puo' esistere solo se resta piccola, reversibile, tracciata e approvata separatamente. Questo packet serve a definire come dovrebbe essere fatta, non a farla partire.

## Stato corrente

| Area | Stato |
| --- | --- |
| Preparazione beta | consentita in NoWrite |
| Attivazione beta a pagamento | bloccata |
| Go-live commerciale | bloccato |
| Pagamenti reali | bloccati |
| Fatture | bloccate |
| Raccolta metodi di pagamento | bloccata |
| Chiavi API production | bloccate |
| Dati reali/personali | bloccati |
| Outreach esterno | bloccato |
| Marketplace/MCP pubblico | bloccati |

Dashboard corrente: 3 verdi, 12 gialli, 1 rosso.  
Rosso residuo: `owner_commercial_approval`.

## Perimetro beta proposto

La beta eventuale dovrebbe essere molto limitata:

| Elemento | Proposta controllata |
| --- | --- |
| Numero clienti | massimo 3 clienti beta |
| Durata | 30 giorni |
| Primo prodotto | Score Pack 1k |
| Prezzo ipotetico | 119 EUR per pacchetto |
| Rinnovo automatico | no |
| Dati ammessi | solo domini, URL aziendali, settore, area geografica |
| Dati personali | non ammessi |
| Accesso production | non ammesso finche' la policy chiavi non e' approvata |
| Canale vendita | nessun outreach; solo review interna e documentazione machine-readable |

Questi valori sono una proposta di lavoro, non un listino live.

## Criteri minimi per attivare in futuro

Prima di qualsiasi futura attivazione, tutti questi punti devono diventare veri:

1. firma proprietario presente;
2. percorso fiscale/amministrativo approvato;
3. regole pagamento/fattura approvate e testate;
4. termini, privacy e policy dati approvati;
5. prodotto, prezzo, crediti e limiti cliente approvati;
6. policy chiavi API production approvata;
7. cost cap e kill switch implementati e testati;
8. supporto, escalation e ticket ledger testati;
9. procedura sicurezza/incidente testata;
10. canali di distribuzione approvati.

Se anche uno solo di questi punti manca, la beta resta bloccata.

## Flusso operativo futuro

Questo e' il flusso che gli agenti dovranno seguire solo dopo approvazione separata:

1. creare cliente beta nel ledger;
2. assegnare limite volume e crediti;
3. verificare che l'input contenga solo dati ammessi;
4. generare score solo se l'output e' valido;
5. tracciare ogni credito consumato;
6. bloccare automaticamente richieste fuori policy;
7. creare report sintetico per il proprietario;
8. non rinnovare automaticamente nulla.

Nella fase attuale, questo flusso puo' essere solo simulato.

## Regole di blocco automatico

Gli agenti devono bloccare immediatamente:

| Richiesta | Azione agente |
| --- | --- |
| Pagamento reale | blocca |
| Fattura | blocca |
| Carta o metodo di pagamento | blocca |
| Chiave API production | blocca |
| Dataset reale cliente | blocca |
| Dato personale | blocca |
| Email/outreach esterno | blocca |
| Marketplace o registry pubblico | blocca |
| Hosted MCP pubblico | blocca |
| Richiesta oltre limite costo | blocca |

## Simulazioni richieste prima della decisione

Prima di tornare al proprietario con una vera richiesta di firma, vanno simulati almeno questi casi:

| Simulazione | Risultato atteso |
| --- | --- |
| Cliente richiede beta senza firma | blocco |
| Cliente prova a pagare | blocco |
| Cliente invia dati personali | blocco |
| Cliente chiede chiave production | blocco |
| Cliente supera limite costi | blocco |
| Output scoring non valido | credito non consumato |
| Output scoring valido | credito simulato consumato |
| Richiesta con dominio duplicato | deduplica o blocco |
| Richiesta marketplace/MCP pubblico | blocco |

## Risposta macchina corrente

```json
{
  "status": "controlled_beta_activation_packet_ready_nowrite",
  "decision": "packet_only_not_activation",
  "current_result": "NOT_YET_OWNER_REVIEW_REQUIRED",
  "paid_beta_activation": false,
  "commercial_go_live": false,
  "real_payment_executed": false,
  "invoice_issued": false,
  "payment_method_collected": false,
  "production_key_issued": false,
  "real_or_personal_data_processed": false,
  "external_outreach_sent": false,
  "marketplace_or_public_mcp_published": false,
  "credits_consumed": 0,
  "remaining_red_gate": "owner_commercial_approval",
  "next_allowed_actions": [
    "simulate_controlled_beta_blocking_cases_nowrite",
    "continue_nowrite_preparation"
  ],
  "support_code": "CONTROLLED_BETA_PACKET_READY_NOWRITE"
}
```

## Prossimo step consigliato

Il prossimo step sicuro e' creare ed eseguire una suite di simulazioni NoWrite sui casi di blocco della beta controllata. Se le simulazioni passano, si potra' preparare un report di readiness per il proprietario, ma non ancora attivare la beta.
