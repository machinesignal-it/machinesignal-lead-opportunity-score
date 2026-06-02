# MachineSignal - Lettura commerciale Mini Test 50 target dentisti Lombardia

Data: 2026-06-02

## Risultato

Il Mini Test reale/semi-reale da 50 target e' riuscito.

La macchina ha eseguito il flusso:

1. Target Discovery acquistato;
2. 50 target caricati e deduplicati;
3. 50 domini segnati;
4. add-on acquistati dove raccomandati;
5. Action Pack acquistato solo con gate prudente;
6. audit finale riconciliato.

## Numeri principali

- Target caricati: 50
- Target segnati: 50
- Ordini beta registrati: 42
- Audit riconciliato: true
- Pagamenti reali: false
- Contatti esterni/email: false
- Ricavo simulato totale: 236.81 EUR
- Ricavo Target Discovery: 149.00 EUR
- Ricavo downstream dopo discovery: 87.81 EUR
- Ricavo downstream per target: 1.7562 EUR

## Mix decisioni

| Decisione | Quantita' | Lettura |
|---|---:|---|
| buy_deep_analysis | 6 | Target potenzialmente forti |
| needs_verification | 24 | Molti target richiedono controllo prima di spesa ulteriore |
| nurture | 9 | Target da mantenere a basso costo |
| watchlist | 11 | Target da salvare senza ulteriore spesa immediata |

## Mix acquisti

| Prodotto | Quantita' | Ricavo simulato |
|---|---:|---:|
| Target Discovery | 1 | 149.00 EUR |
| Score base | 50 | 4.95 EUR |
| Deep Analysis | 6 | 17.94 EUR |
| Verification | 24 | 24.00 EUR |
| Nurture Signal | 9 | 9.00 EUR |
| Action Pack | 2 | 31.92 EUR |

## Lettura semplice

Questo e' il primo test che somiglia davvero al prodotto commerciale:

> la macchina non parte da una lista gia' pronta, ma usa una lista costruita dagli agenti e poi compra score e add-on via API.

Il risultato e' buono per due motivi:

1. il flusso tecnico regge su target reali/semi-reali;
2. il downstream genera 87.81 EUR su 50 target, cioe' 1.7562 EUR per target segnato.

La soglia che avevamo indicato come prudente era 1.50 EUR per score/target. Qui siamo sopra.

## Cosa ci piace

Il Target Discovery non e' solo una lista: genera traffico verso i prodotti successivi.

Su 50 target:

- 6 sono diventati Deep Analysis;
- 2 sono diventati Action Pack;
- 24 hanno richiesto Verification;
- 9 sono entrati in Nurture Signal.

Questo mostra che la macchina riesce a distinguere tra target forti, incerti, deboli ma recuperabili e target da osservare.

## Cosa va migliorato

Verification e' ancora molto alta: 24 su 50.

Questo puo' voler dire due cose:

1. la lista contiene molti target utili ma con segnali non abbastanza chiari;
2. lo scoring e' prudente e chiede troppi controlli prima di comprare prodotti piu' ricchi.

Commercialmente non e' un problema grave, ma va monitorato. Se il cliente macchina riceve troppe verification, potrebbe percepire il sistema come troppo incerto.

## Proiezione prudente a 250 target

Se il rapporto del Mini Test rimanesse simile:

- ricavo Target Discovery: 149 EUR;
- downstream stimato: 1.7562 EUR x 250 = 439.05 EUR;
- ricavo simulato complessivo stimato: 588.05 EUR.

Questa e' una proiezione indicativa, non una garanzia.

La parte interessante e' che il downstream potenziale supera il prezzo del Target Discovery. Questo rende il pacchetto piu' credibile: la macchina compra discovery non solo per avere una lista, ma per alimentare uno scoring funnel che puo' generare ulteriori acquisti.

## Decisione consigliata

Esito: PASS CON CAUTELA.

Il Mini Test giustifica il passaggio a un test piu' grande, ma prima conviene fare due miglioramenti:

1. rendere piu' rigorosa la qualita' della lista iniziale;
2. ridurre i casi che finiscono in Verification se il dominio e la categoria sono gia' chiari.

## Prossimo passo consigliato

Eseguire un test da 100 target reali/semi-reali nella stessa nicchia.

Obiettivo:

- verificare se il downstream per target resta sopra 1.50 EUR;
- capire se il tasso Action Pack resta almeno tra 3% e 5%;
- capire se Verification scende sotto il 40%;
- decidere se scalare a 250 target.

## Stato roadmap

La fase test e' ora piu' avanzata:

- API e ledger: validati;
- audit: validato;
- Action Pack naturale: validato su 100 score;
- no-list flow: validato tecnicamente;
- Target Discovery Mini 50: validato commercialmente con cautela;
- prossimo blocco: Target Discovery 100 e ottimizzazione Verification.
