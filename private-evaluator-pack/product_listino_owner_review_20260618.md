# MachineSignal - Product/Listino Owner Review

Data: 2026-06-18  
Stato: bozza interna di revisione listino, non offerta commerciale live  
Ambito: verificare prodotti, prezzi, unita' vendute e condizioni prima di qualunque vendita reale

## Sintesi semplice

Il catalogo prodotti esiste e le macchine possono leggerlo. Questo pero' non significa che il listino sia approvato per vendere.

Oggi i prezzi sono riferimenti di sandbox e pianificazione. Servono per:

- spiegare alla macchina cosa comprerebbe;
- testare il percorso di purchase intent;
- validare unita', output e regole di credito;
- preparare la decisione del proprietario.

Non servono ancora per:

- fare checkout reale;
- incassare;
- emettere fattura;
- promettere disponibilita' production;
- pubblicare un'offerta commerciale definitiva.

## Regola principale

Un prodotto puo' essere considerato vendibile solo se sono approvati:

- nome prodotto;
- prezzo;
- unita' venduta;
- cosa include;
- cosa non include;
- regola di validita' output;
- regola di consumo crediti;
- endpoint o canale di consegna;
- limiti operativi;
- condizioni di rimborso o riaccredito;
- dipendenze da altri gate;
- approvazione proprietario.

## Listino di riferimento da revisionare

| Prodotto | Prezzo EUR | Unita' | Stato |
|---|---:|---|---|
| Target Discovery Pack 250 | 249 | 250 target coerenti | sandbox reference |
| Score Pack 1k | 119 | 1000 score validi | sandbox reference |
| Domain Enrichment Pack 100 | 149 | 100 decisioni di arricchimento | sandbox reference |
| Deep Analysis Pack 100 | 349 | 100 analisi valide | sandbox reference |
| Action Pack 25 | 399 | 25 action pack validi | sandbox reference |
| Opportunity Feed | 249/mese | 1 feed mensile | sandbox reference |
| API Starter | 99/mese | 500 score validi/mese | sandbox reference |
| API Pro | 499/mese | 3000 score + 50 deep analysis/mese | sandbox reference |
| Custom / overage | da definire | scope personalizzato | owner quote required |

## Cosa include ogni prezzo

### Target Discovery Pack 250

Il prezzo include un pre-check automatico del mercato, normalizzazione dell'obiettivo commerciale, ipotesi di opportunita', 250 target normalizzati e deduplicati quando il mercato e' sufficiente, dominio se disponibile, categoria, area, segnali iniziali, motivo di inclusione ed export JSON/CSV.

Se non e' possibile produrre 250 target coerenti, il pack non deve essere attivato come consegna piena. La macchina deve ricevere alternative: Mini Discovery, area piu' ampia, criteri piu' larghi o obiettivo commerciale modificato.

### Score Pack 1k

Il prezzo include pulizia lista, deduplicazione, esclusione record invalidi o non analizzabili, 1000 score validi, confidence, commercial strength, spend policy, decisione operativa, motivo sintetico, priorita' e prossimo prodotto consigliato.

Record duplicati, invalidi o non analizzabili non consumano credito. Il pack termina dopo 1000 score validi.

### Domain Enrichment Pack 100

Il prezzo include 100 record processati, ricerca pubblica del dominio, dominio verificato quando disponibile, confidence, tipo fonte, stato per record, motivo quando non si trova un dominio affidabile ed export JSON/CSV.

Il prezzo non garantisce che ogni target avra' un dominio. Ogni decisione completata consuma credito: verified domain, candidate not reliable o no reliable domain.

### Deep Analysis Pack 100

Il prezzo include contesto settore, obiettivo commerciale, matrice evidenze, matrice decisionale macchina, gate per comprare Action Pack, payload CRM sintetico, segnali settoriali, segnali da validare, risk flags, stop rules e prossimo step macchina.

Lead senza dati sufficienti per una vera analisi non consumano credito deep-analysis.

### Action Pack 25

Il prezzo include record patch CRM, task CRM, mapping campi CRM, workflow payload, istruzioni agente, schema webhook, policy webhook, audit event, approval gate, deduplication key, message angle con claim vietati, stop rules e guardrail compliance.

Action Pack va comprato solo dopo Deep Analysis positiva o prova equivalente. Non autorizza contatto esterno automatico.

### Opportunity Feed

Il prezzo include un feed mensile ricorrente, 4 scan programmati, 4 consegne, target nuovi o aggiornati, base score, segnali principali, priorita' e output API/file/webhook.

Se lo scan non produce opportunita' coerenti, il sistema deve restituire market coverage report e suggerimenti, non riempire il feed con target deboli.

### API Starter

Il prezzo include una API key, documentazione, demo environment, score endpoint, 500 score validi/mese, report usage base e supporto asincrono standard.

Uso extra richiede pacchetti aggiuntivi o upgrade. La chiave production resta bloccata finche' il gate production API keys non e' approvato.

### API Pro

Il prezzo include una API key avanzata, 3000 score validi/mese, 50 deep analysis valide/mese, 1 Opportunity Feed mensile, webhook support, priorita' di processing, report usage avanzato e supporto tecnico asincrono.

Action Pack ed extra usage sono separati. Webhook e API production richiedono gate tecnici e proprietario.

### Custom / overage

Il prezzo non e' automatico. Ogni richiesta custom richiede scope, volume, output atteso, tempi, stima costi, limiti uso e approvazione proprietario prima di essere attivata.

## Decisioni proprietario richieste

Prima di usare il listino per vendere servono decisioni su:

1. primo prodotto da offrire;
2. prezzo beta iniziale;
3. numero massimo clienti beta;
4. sconti o nessuno sconto;
5. validita' dei crediti;
6. cosa succede a crediti non usati;
7. gestione riaccrediti;
8. gestione rimborsi cash;
9. limiti di uso per cliente;
10. limiti costo per cliente;
11. priorita' tra pacchetti one-shot e abbonamenti;
12. condizioni per passare da sandbox a production;
13. canali dove il listino puo' essere pubblicato;
14. testo da mostrare alle macchine quando il listino non e' live.

## Risposta macchina se prova a comprare da listino non approvato

```json
{
  "status": "blocked_by_product_listino_approval",
  "decision": "stop",
  "reason": "product listino is a sandbox reference and is not approved for live commercial sale",
  "credits_consumed": 0,
  "payment_executed": false,
  "invoice_issued": false,
  "subscription_activated": false,
  "owner_escalation_required": true,
  "support_code": "PRODUCT_LISTINO_NOT_APPROVED"
}
```

## Cosa possono fare gli agenti

Gli agenti possono:

- confrontare catalogo, OpenAPI, Postman e Company Brain;
- controllare prezzi, unita' vendute e descrizioni;
- verificare che ogni prezzo dica cosa include;
- proporre modifiche al listino;
- preparare P&L e scenari di marginalita';
- creare purchase intent sandbox;
- rispondere alle macchine con blocco se il listino non e' approvato;
- preparare report in italiano.

Gli agenti non possono:

- approvare il listino finale;
- trasformare prezzi sandbox in offerta commerciale live;
- incassare;
- emettere fattura;
- attivare abbonamenti;
- pubblicare marketplace a pagamento;
- dichiarare prezzi definitivi senza approvazione;
- cambiare prezzi production senza approvazione.

## Stato dashboard

Effetto proposto:

- `product_listino_approval`: da rosso a candidato giallo.

Motivo:

- il catalogo esiste;
- ogni prezzo ha unita', include, validita' e output;
- e' stata preparata una revisione proprietario;
- manca ancora approvazione finale;
- non c'e' offerta commerciale live.

## Prossima azione sicura

Preparare un `product_listino_owner_decision_packet` con:

- prodotto beta iniziale raccomandato;
- prezzo beta raccomandato;
- cosa include;
- cosa resta escluso;
- limiti cliente;
- blocchi attivi;
- decisione richiesta al proprietario: approva, modifica o rifiuta.
