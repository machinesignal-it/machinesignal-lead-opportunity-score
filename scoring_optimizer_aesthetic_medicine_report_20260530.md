# MachineSignal - Scoring Optimizer medicina estetica

Data: 2026-05-30

## Obiettivo

Capire perche il test su medicina estetica produceva molti `watchlist` e `needs_verification`, ma nessun `buy_deep_analysis`.

## Diagnosi iniziale

Il problema non era il mercato, ma la taratura del motore.

Nel codice precedente, il settore `medicina estetica` non veniva riconosciuto come nicchia medicale/ad alto valore. Il boost settore veniva quindi trattato quasi come generico.

## Prima correzione: riconoscimento settore

Lo Scoring Optimizer ha aggiunto al motore il riconoscimento di questi segnali settore:

- medicina;
- estetica / estetic;
- aesthetic;
- beauty;
- laser;
- derma;
- antiage / anti-age.

La modifica non cambia le soglie generali e non forza artificialmente tutti i lead in `buy_deep_analysis`.

## Risultato sul campione da 100

Prima della correzione:

- buy_deep_analysis: 0
- needs_verification: 41
- nurture: 9
- watchlist: 44
- discard: 6

Dopo la correzione:

- buy_deep_analysis: 5
- needs_verification: 41
- nurture: 21
- watchlist: 33
- discard: 0

## Seconda correzione: quality review settoriale

La taratura ha fatto emergere 5 candidati `buy_deep_analysis`, ma due erano rischiosi:

- `bianchiosteopata.it`: settore osteopatia, non medicina estetica pura.
- `vistavisiongroup.com`: possibile vista/oculistica, non medicina estetica pura.

Per evitare acquisti automatici sbagliati, e stato aggiunto un quality review specifico per medicina estetica.

Quando il sistema rileva segnali di settore adiacente ma non coerente, fa tre cose:

- applica una penalizzazione allo score;
- limita la confidence massima a 0,49;
- cambia l'acquisto consigliato da `deep_analysis` a `verification`.

## Risultato dopo quality review

- buy_deep_analysis: 3
- needs_verification: 43
- nurture: 21
- watchlist: 33
- discard: 0

Quality review:

- sector_quality_passed: 98
- sector_mismatch_needs_verification: 2

## Test automatici

Sono stati aggiunti due test:

- `quinta-essenza.com` con settore `medicina estetica` deve produrre `buy_deep_analysis`.
- `bianchiosteopata.it` con categoria `osteopata` deve produrre `needs_verification` e `next_product = verification`.

I test API sono stati eseguiti tramite Node REPL interno Codex, perche PowerShell non riesce ad avviare `node.exe` a causa del blocco Windows gia rilevato.

Risultato: test passati.

## Lettura commerciale

La nicchia medicina estetica diventa piu interessante dopo la taratura, ma il valore vero non e solo aumentare gli score. Il valore e far comprare alla macchina l'approfondimento giusto solo quando il target e coerente.

Questo rafforza il modello commerciale:

- Score Pack per analisi di massa;
- Verification Pack per casi ambigui;
- Deep Analysis Pack solo per casi forti e coerenti.

## Decisione consigliata

- Dentisti/cliniche: nicchia principale di monetizzazione iniziale.
- Medicina estetica: seconda nicchia valida, da usare con quality review attiva.
- Studi legali: utile come prova cross-nicchia, meno forte per monetizzazione alta nel campione attuale.

## File tecnici

- Risultati calibrati: `C:\Users\natal\AppData\Local\Temp\MachineSignal\aesthetic_medicine_scoring_20260530\aesthetic_medicine_scoring_results_100_calibrated_20260530.json`
- Risultati con quality review: `C:\Users\natal\AppData\Local\Temp\MachineSignal\aesthetic_medicine_scoring_20260530\aesthetic_medicine_scoring_results_100_quality_review_20260530.json`
- Codice aggiornato: `api_endpoint_minimal/core.mjs`
- Test aggiornato: `api_endpoint_minimal/test_api.mjs`
