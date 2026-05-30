# MachineSignal - Test medicina estetica Lombardia

Data: 2026-05-30

## Obiettivo

Testare una terza nicchia più transazionale, senza contatto umano e senza invio email:

Target Discovery -> Quality Gate MachineSignal -> Lead Opportunity Score.

In questo caso non è stato necessario usare DataForSEO per trovare domini, perché la fonte pubblica iniziale aveva già molti siti disponibili.

## Target discovery

- Nicchia: medicina estetica / beauty clinic / dermatologia / laser / benessere estetico
- Area: Lombardia
- Fonte: OpenStreetMap Overpass API
- Target pubblici trovati: 1.388
- Target selezionati nel pack: 250
- Target selezionati già con dominio: 250
- Target totali con dominio nella fonte: 269

## Quality gate

Il quality gate ha filtrato i target non coerenti o non abbastanza puliti.

Decisioni:

- verified_domain: 210
- rejected_beauty_retail_or_nails: 14
- rejected_healthcare_not_aesthetic: 11
- rejected_social_directory_or_hosted_builder: 10
- rejected_tld_mismatch: 5

Lettura: la nicchia produce molti domini utilizzabili, ma serve un filtro forte perché dentro compaiono anche profumerie, nails, sanità generica, riabilitazione e pagine social.

## Scoring live

- Domini verificati scoreati: 100
- Score completati: 100
- Errori: 0

Decisioni prodotte:

- watchlist: 44
- needs_verification: 41
- nurture: 9
- discard: 6
- buy_deep_analysis: 0

## Migliori score del batch

| Target | Dominio | Score | Decisione | Confidence |
|---|---|---:|---|---:|
| NeoClinic | bianchiosteopata.it | 72 | nurture | 0,77 |
| Vista Vision | vistavisiongroup.com | 72 | nurture | 0,79 |
| QuintaEssenza | quinta-essenza.com | 72 | nurture | 0,79 |
| CRAGIF | cragif.it | 72 | needs_verification | 0,39 |
| Centro Medico Besana | centromedico-besana.it | 71 | needs_verification | 0,35 |
| Avalon | avalonbenessere.it | 71 | nurture | 0,68 |
| Esser Dea | esserdea.it | 70 | nurture | 0,71 |
| Beauty femme | esteticabeautyfemme.it | 70 | nurture | 0,64 |
| Incanto | bellezzaincanto.it | 69 | needs_verification | 0,36 |
| Overbeauty | overbeauty.it | 68 | nurture | 0,52 |

## Confronto con le altre nicchie

| Nicchia | Input | Costo provider | Domini verificati | Score live | Buy deep analysis | Needs verification | Nurture | Watchlist | Discard |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Dentisti / cliniche odontoiatriche | 100 DataForSEO | 0,150 USD | 17 | 17 | 2 | 8 | 4 | 3 | 0 |
| Studi legali | 94 DataForSEO | 0,141 USD | 17 | 17 | 0 | 10 | 4 | 3 | 0 |
| Medicina estetica / beauty medical | 250 OSM | 0,000 USD | 210 | 100 | 0 | 41 | 9 | 44 | 6 |

## Lettura commerciale

Questa nicchia è molto interessante per vendere:

- Target Discovery Pack, perché ci sono molti target pubblici disponibili;
- Score Pack, perché ci sono molti domini già score-ready;
- Watchlist/Nurturing, perché molti target non sono da buttare ma nemmeno abbastanza forti da comprare subito un approfondimento.

Però la prima versione dello scoring non era ancora tarata bene per vendere `Deep Analysis`, perché il motore non riconosceva `medicina estetica` come settore medicale/ad alto valore.

## Aggiornamento Scoring Optimizer

Dopo la taratura del settore `medicina estetica`, lo stesso campione da 100 produce:

- buy_deep_analysis: 5
- needs_verification: 41
- nurture: 21
- watchlist: 33
- discard: 0

Questo rende la nicchia più interessante, ma richiede ancora un quality gate più severo per distinguere medicina estetica reale da beauty generico, osteopatia, vista/oculistica o sanità non estetica.

## Decisione consigliata dagli agenti

- Non scartare la nicchia: è forte per volume e costo basso.
- Non metterla ancora al primo posto per monetizzazione ad alto valore.
- Lo Scoring Optimizer ha migliorato la taratura: ora emergono 5 candidati `buy_deep_analysis` su 100 score.
- Il prossimo intervento deve essere sul quality gate settoriale, non solo sullo score.
- Usare dentisti/cliniche come nicchia principale di monetizzazione iniziale.
- Usare medicina estetica come seconda linea per dimostrare scalabilità e vendere discovery/scoring a basso costo.

## File tecnici prodotti

- Target discovery JSON: `C:\Users\natal\AppData\Local\Temp\MachineSignal\target_discovery_lombardia_aesthetic_medicine_20260530\target_discovery_lombardia_aesthetic_medicine_250.json`
- Quality gate JSON: `C:\Users\natal\AppData\Local\Temp\MachineSignal\aesthetic_medicine_scoring_20260530\aesthetic_medicine_quality_gate_20260530.json`
- Scoring JSON: `C:\Users\natal\AppData\Local\Temp\MachineSignal\aesthetic_medicine_scoring_20260530\aesthetic_medicine_scoring_results_100_20260530.json`
