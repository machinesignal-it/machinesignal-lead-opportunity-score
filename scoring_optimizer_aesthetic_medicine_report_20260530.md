# MachineSignal - Scoring Optimizer medicina estetica

Data: 2026-05-30

## Obiettivo

Capire perché il test su medicina estetica produceva molti `watchlist` e `needs_verification`, ma nessun `buy_deep_analysis`.

## Diagnosi

Il problema non era il mercato, ma la taratura del motore.

Nel codice precedente, il settore `medicina estetica` non veniva riconosciuto come nicchia medicale/ad alto valore. Il boost settore veniva quindi trattato quasi come generico.

## Correzione applicata

Lo Scoring Optimizer ha aggiunto al motore il riconoscimento di questi segnali settore:

- medicina;
- estetica / estetic;
- aesthetic;
- beauty;
- laser;
- derma;
- antiage / anti-age.

La modifica è volutamente piccola: non cambia le soglie generali e non forza artificialmente tutti i lead in `buy_deep_analysis`.

## Test automatico

Aggiunto un test su:

- dominio: `quinta-essenza.com`;
- sector_hint: `medicina estetica`;
- country_hint: `IT`.

Il test verifica che il motore generi `buy_deep_analysis` quando il dominio ha score e confidence sufficienti.

I test API sono stati eseguiti tramite Node REPL interno Codex, perché PowerShell non riesce ad avviare `node.exe` a causa del blocco Windows già rilevato.

Risultato: test passati.

## Risultato sul campione da 100

### Prima della correzione

- buy_deep_analysis: 0
- needs_verification: 41
- nurture: 9
- watchlist: 44
- discard: 6

### Dopo la correzione

- buy_deep_analysis: 5
- needs_verification: 41
- nurture: 21
- watchlist: 33
- discard: 0

## Lettura commerciale

La nicchia medicina estetica diventa più interessante dopo la taratura: non è più solo volume basso costo, ma produce anche alcuni casi candidati a `Deep Analysis`.

Resta però meno forte dei dentisti/cliniche se guardiamo alla qualità immediata degli output, perché alcuni casi alti richiedono un quality gate più specifico per evitare ambiguità, ad esempio osteopatia, vista/oculistica o benessere generico.

## Decisione consigliata

- Dentisti/cliniche: nicchia principale di monetizzazione iniziale.
- Medicina estetica: seconda nicchia da tenere, ma con quality gate più severo.
- Studi legali: utile come prova cross-nicchia, meno forte per monetizzazione alta.

## Prossimo miglioramento consigliato

Creare un quality gate settoriale per medicina estetica che distingua:

- clinica medicina estetica;
- dermatologia estetica;
- laser / epilazione laser medicale;
- beauty center generico;
- nails / retail cosmetico;
- sanità generica;
- osteopatia/fisioterapia;
- vista/oculistica.

Solo i primi tre dovrebbero essere candidati forti per `Deep Analysis`.

## File tecnici

- Risultati calibrati: `C:\Users\natal\AppData\Local\Temp\MachineSignal\aesthetic_medicine_scoring_20260530\aesthetic_medicine_scoring_results_100_calibrated_20260530.json`
- Codice aggiornato: `api_endpoint_minimal/core.mjs`
- Test aggiornato: `api_endpoint_minimal/test_api.mjs`
