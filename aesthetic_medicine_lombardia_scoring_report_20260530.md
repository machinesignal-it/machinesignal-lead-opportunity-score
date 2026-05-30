# MachineSignal - Test medicina estetica Lombardia

Data: 2026-05-30

## Obiettivo

Testare una terza nicchia piu transazionale, senza contatto umano e senza invio email:

Target Discovery -> Quality Gate MachineSignal -> Lead Opportunity Score.

In questo caso non e stato necessario usare DataForSEO per trovare domini, perche la fonte pubblica iniziale aveva gia molti siti disponibili.

## Target discovery

- Nicchia: medicina estetica / beauty clinic / dermatologia / laser / benessere estetico
- Area: Lombardia
- Fonte: OpenStreetMap Overpass API
- Target pubblici trovati: 1.388
- Target selezionati nel pack: 250
- Target selezionati gia con dominio: 250
- Target totali con dominio nella fonte: 269

## Quality gate iniziale

Il quality gate ha filtrato i target non coerenti o non abbastanza puliti.

Decisioni:

- verified_domain: 210
- rejected_beauty_retail_or_nails: 14
- rejected_healthcare_not_aesthetic: 11
- rejected_social_directory_or_hosted_builder: 10
- rejected_tld_mismatch: 5

Lettura: la nicchia produce molti domini utilizzabili, ma serve un filtro forte perche dentro compaiono anche profumerie, nails, sanita generica, riabilitazione e pagine social.

## Scoring live prima della taratura

- Domini verificati scoreati: 100
- Score completati: 100
- Errori: 0

Decisioni prodotte:

- watchlist: 44
- needs_verification: 41
- nurture: 9
- discard: 6
- buy_deep_analysis: 0

## Aggiornamento Scoring Optimizer

Dopo la taratura del settore `medicina estetica`, lo stesso campione da 100 produce:

- buy_deep_analysis: 5
- needs_verification: 41
- nurture: 21
- watchlist: 33
- discard: 0

Questo rende la nicchia piu interessante, ma ha evidenziato un secondo problema: alcuni candidati alti erano in settori vicini ma non perfettamente coerenti, per esempio osteopatia o vista/oculistica.

## Quality review settoriale

E stata aggiunta una revisione automatica specifica per medicina estetica. La revisione non cambia tutta la logica dello score: controlla solo se, dentro nome target, dominio, categoria o segnali iniziali, emergono indizi di settore adiacente ma non coerente.

Esempi di segnali da verificare:

- osteopatia / fisioterapia / riabilitazione;
- vista / oculistica / ottica;
- nails / parrucchieri / profumeria;
- farmacia, ospedale o sanita generica.

Se uno di questi segnali compare, l'API non compra subito un Deep Analysis: abbassa la confidence, riduce lo score e manda il lead in `needs_verification`.

## Risultato dopo quality review

Sul campione da 100:

- buy_deep_analysis: 3
- needs_verification: 43
- nurture: 21
- watchlist: 33
- discard: 0

Casi spostati da acquisto automatico a verifica:

- NeoClinic / `bianchiosteopata.it`: possibile osteopatia, quindi verifica prima di spendere crediti deep analysis.
- Vista Vision / `vistavisiongroup.com`: possibile vista/oculistica, quindi verifica prima di spendere crediti deep analysis.

## Confronto con le altre nicchie

| Nicchia | Input | Costo provider | Domini verificati | Score live | Buy deep analysis | Needs verification | Nurture | Watchlist | Discard |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Dentisti / cliniche odontoiatriche | 100 DataForSEO | 0,150 USD | 17 | 17 | 2 | 8 | 4 | 3 | 0 |
| Studi legali | 94 DataForSEO | 0,141 USD | 17 | 17 | 0 | 10 | 4 | 3 | 0 |
| Medicina estetica / beauty medical | 250 OSM | 0,000 USD | 210 | 100 | 3 | 43 | 21 | 33 | 0 |

## Lettura commerciale

Questa nicchia e molto interessante per vendere:

- Target Discovery Pack, perche ci sono molti target pubblici disponibili;
- Score Pack, perche ci sono molti domini gia score-ready;
- Watchlist/Nurturing, perche molti target non sono da buttare ma nemmeno abbastanza forti da comprare subito un approfondimento;
- Deep Analysis, ma solo dopo quality review settoriale.

Il punto importante e che la macchina non deve comprare approfondimenti a caso. Deve comprare solo quando lo score e alto, la confidence e sufficiente e il target e coerente con la nicchia richiesta.

## Decisione consigliata dagli agenti

- Non scartare la nicchia: e forte per volume e costo basso.
- Non metterla ancora sopra dentisti/cliniche per monetizzazione iniziale.
- Usarla come seconda nicchia dimostrativa per mostrare che il sistema scala su mercati diversi.
- Tenere attivo il quality review settoriale prima di consentire acquisti automatici di Deep Analysis.

## File tecnici prodotti

- Target discovery JSON: `C:\Users\natal\AppData\Local\Temp\MachineSignal\target_discovery_lombardia_aesthetic_medicine_20260530\target_discovery_lombardia_aesthetic_medicine_250.json`
- Quality gate JSON: `C:\Users\natal\AppData\Local\Temp\MachineSignal\aesthetic_medicine_scoring_20260530\aesthetic_medicine_quality_gate_20260530.json`
- Scoring JSON iniziale: `C:\Users\natal\AppData\Local\Temp\MachineSignal\aesthetic_medicine_scoring_20260530\aesthetic_medicine_scoring_results_100_20260530.json`
- Scoring JSON calibrato: `C:\Users\natal\AppData\Local\Temp\MachineSignal\aesthetic_medicine_scoring_20260530\aesthetic_medicine_scoring_results_100_calibrated_20260530.json`
- Scoring JSON con quality review: `C:\Users\natal\AppData\Local\Temp\MachineSignal\aesthetic_medicine_scoring_20260530\aesthetic_medicine_scoring_results_100_quality_review_20260530.json`
