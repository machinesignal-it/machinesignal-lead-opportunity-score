# MachineSignal - Lettura economica del funnel automatico

- Data: 2026-06-01
- Test di riferimento: beta customer automatic purchase funnel test
- Logica testata: la macchina chiede score, legge `next_purchase` e compra automaticamente solo i prodotti consigliati.
- Pagamenti reali: non eseguiti.
- Contatti esterni/email: non eseguiti.

## Risultato tecnico del test

| Voce | Risultato |
|---|---:|
| Score richiesti | 100 |
| Score riusciti | 100 |
| Acquisti automatici consigliati | 93 |
| Acquisti automatici riusciti | 93 |
| Conversione score -> acquisto beta | 93,0% |
| Ordini leggibili via API | 93 |
| Extra addebiti duplicati | 0 |

## Mix prodotti generato

| Prodotto | Volumi test | Prezzo unitario usato |
|---|---:|---:|
| Score Pack 1k | 100 score | 0,099 euro per score |
| Deep Analysis | 34 analisi | 2,99 euro per analisi |
| Verification | 45 verifiche | scenario |
| Nurture Signal | 14 segnali | scenario |

## Scenari ricavi su 100 score

| Scenario | Prezzo Verification | Prezzo Nurture | Ricavi Score | Ricavi Deep Analysis | Ricavi Verification | Ricavi Nurture | Ricavi totali | Ricavo per score iniziale |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Prudente | 0,25 | 0,15 | 9,90 | 101,66 | 11,25 | 2,10 | 124,91 | 1,249 |
| Base | 0,49 | 0,29 | 9,90 | 101,66 | 22,05 | 4,06 | 137,67 | 1,377 |
| Alto | 0,99 | 0,49 | 9,90 | 101,66 | 44,55 | 6,86 | 162,97 | 1,630 |

## Costi variabili stimati

Questi costi sono ancora assunzioni interne, non dati definitivi di produzione.

| Voce costo | Assunzione |
|---|---:|
| Score | 0,0065 euro per score |
| Deep Analysis | 0,0800 euro per analisi |
| Verification | 0,0200 euro per verifica |
| Nurture Signal | 0,0150 euro per segnale |
| Pagamenti e billing | 3% dei ricavi |

## Margine stimato su 100 score

| Scenario | Ricavi | Costo tecnico diretto | Billing 3% | Margine lordo stimato | Margine % |
|---|---:|---:|---:|---:|---:|
| Prudente | 124,91 | 4,48 | 3,75 | 116,68 | 93,4% |
| Base | 137,67 | 4,48 | 4,13 | 129,06 | 93,7% |
| Alto | 162,97 | 4,48 | 4,89 | 153,60 | 94,3% |

## Lettura business

Il test conferma che il valore non sta solo nello score. Lo score è la porta di ingresso: la macchina paga poco per classificare molti domini, poi compra prodotti successivi quando il risultato lo giustifica.

Nel test base, 100 score producono circa 137,67 euro di ricavi teorici. Di questi, solo 9,90 euro arrivano dagli score. La parte importante arriva dagli add-on automatici:

- Deep Analysis: 101,66 euro;
- Verification: 22,05 euro nello scenario base;
- Nurture Signal: 4,06 euro nello scenario base.

Quindi il modello commerciale da validare non è "vendere score". È:

1. vendere score come filtro automatico iniziale;
2. far comprare alla macchina gli approfondimenti quando servono;
3. mantenere un ledger crediti chiaro, tracciato e senza doppio addebito;
4. usare ordini e consegne API come prova di valore per CRM, agenti AI e workflow.

## Prudenza sul risultato

Il 93% di conversione score -> acquisto beta non deve essere usato come conversione commerciale definitiva.

Motivi:

- il test usa domini ripetuti;
- la macchina è configurata per comprare automaticamente ogni `next_purchase` acquistabile;
- non c'è ancora un budget cap reale del cliente;
- non c'è ancora pagamento reale;
- non c'è ancora reazione di un sistema esterno indipendente.

Per il P&L, suggerisco di usare tre livelli:

| Livello P&L | Conversione add-on suggerita |
|---|---:|
| Prudente | 20-30% degli score |
| Base | 35-50% degli score |
| Alto | 60-70% degli score |

Il test tecnico ha dimostrato che il sistema può arrivare al 93%, ma il piano economico deve restare più prudente finché non vediamo comportamento reale di clienti macchina esterni.

## Ledger: quando spostarlo

Non sposterei il ledger immediatamente oggi. Lo farei dopo aver chiuso ancora due test:

1. test funnel con 300-500 score e backoff controllato;
2. test con budget cap, cioè la macchina compra solo fino a una soglia massima per batch.

Lo spostamento diventa obbligatorio prima di:

- aprire beta pubblica a volume;
- collegare pagamenti reali;
- pubblicare su marketplace con uso non controllato;
- superare 1.000 score/giorno o 100 ordini/giorno;
- vedere ancora errori `KV PUT failed: 429 Too Many Requests` nonostante retry/backoff.

Soluzione consigliata:

- Durable Objects per serializzare il ledger per singolo cliente;
- D1 per storico ordini, reporting, P&L e audit;
- Queue per elaborare ordini o consegne non urgenti;
- KV solo per configurazioni pubbliche, cataloghi, manifest e cache leggera.

Decisione operativa: per ora KV resta accettabile per test controllati. Prima della beta commerciale vera, il ledger va spostato.
