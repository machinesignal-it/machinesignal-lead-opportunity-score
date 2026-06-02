# MachineSignal - Target Discovery Mini 50 test

- Data test: 2026-06-02T11:43:09
- Customer: `mini_50_dentists_20260602_114256`
- Pagamenti reali: non eseguiti
- Contatti esterni/email: non eseguiti

## Esito sintetico

- Target caricati: 50
- Target segnati: 50
- Ordini beta registrati: 42
- Ledger backend: `durable_object`
- Audit riconciliato: `True`
- Ricavo simulato totale: 236.81 EUR
- Ricavo Target Discovery: 149.0 EUR
- Ricavo downstream: 87.81 EUR
- Ricavo downstream per target: 1.7562 EUR

## Mix

- Decisioni score: `{"buy_deep_analysis": 6, "nurture": 9, "needs_verification": 24, "watchlist": 11}`
- Next product raccomandati: `{"deep_analysis": 6, "nurture_signal": 9, "verification": 24}`
- Acquisti eseguiti: `{"target_discovery": 1, "deep_analysis": 6, "nurture_signal": 9, "verification": 24, "action_pack": 2}`
- Score -> Deep Analysis rate: 0.12
- Deep Analysis -> Action Pack rate: 0.3333

## Lettura commerciale

Questo test parte da una lista reale/semi-reale di 50 domini pubblici di studi dentistici e cliniche odontoiatriche lombarde. Serve a capire se un Target Discovery ridotto puo' generare downstream revenue dopo lo score.

La lista non contiene contatti personali e non attiva outreach: valuta solo domini e acquisti beta machine-to-machine.

## Riconciliazione prodotti

| Prodotto ledger | Crediti usati | Ordini | Ricavo simulato | OK |
|---|---:|---:|---:|---|
| score_pack_1k | 50 | 0 | 4.95 | True |
| deep_analysis_pack_100 | 6 | 6 | 17.94 | True |
| verification_pack_100 | 24 | 24 | 24 | True |
| nurture_signal_pack_100 | 9 | 9 | 9 | True |
| action_pack_25 | 2 | 2 | 31.92 | True |
| target_discovery_pack_250 | 1 | 1 | 149 | True |
| domain_enrichment_pack_100 | 0 | 0 | 0 | True |
| opportunity_feed_monthly | 0 | 0 | 0 | True |

## Campione operativo

| # | Dominio | Citta' | Score | Conf. | Decisione | Prodotto | Stage |
|---:|---|---|---:|---:|---|---|---|
| 1 | studiodentisticocozzolino.it | Milano | 77 | 0.75 | buy_deep_analysis | deep_analysis | score |
| 1 | studiodentisticocozzolino.it | Milano | 77 | 0.75 | buy_deep_analysis | deep_analysis | purchase |
| 1 | studiodentisticocozzolino.it | Milano | 77 | 0.75 | buy_deep_analysis | action_pack | action_pack_not_bought |
| 2 | studiodentisticocavorretti.it | Milano | 81 | 0.53 | nurture | nurture_signal | score |
| 2 | studiodentisticocavorretti.it | Milano | 81 | 0.53 | nurture | nurture_signal | purchase |
| 3 | studiodentisticocannizzo.it | Milano | 80 | 0.62 | nurture | nurture_signal | score |
| 3 | studiodentisticocannizzo.it | Milano | 80 | 0.62 | nurture | nurture_signal | purchase |
| 4 | studiodottorpini.it | Milano | 74 | 0.73 | nurture | nurture_signal | score |
| 4 | studiodottorpini.it | Milano | 74 | 0.73 | nurture | nurture_signal | purchase |
| 5 | studiodentisticozambianchi.it | Milano | 64 | 0.44 | needs_verification | verification | score |
| 5 | studiodentisticozambianchi.it | Milano | 64 | 0.44 | needs_verification | verification | purchase |
| 6 | studiobelloni.com | Milano | 69 | 0.77 | nurture | nurture_signal | score |
| 6 | studiobelloni.com | Milano | 69 | 0.77 | nurture | nurture_signal | purchase |
| 7 | studiolombardo.srl | Milano | 76 | 0.35 | needs_verification | verification | score |
| 7 | studiolombardo.srl | Milano | 76 | 0.35 | needs_verification | verification | purchase |
| 8 | studiodentisticosalvetti.it | Milano | 56 | 0.35 | needs_verification | verification | score |
| 8 | studiodentisticosalvetti.it | Milano | 56 | 0.35 | needs_verification | verification | purchase |
| 9 | studiodentisticodonati.eu | Milano | 70 | 0.4 | needs_verification | verification | score |
| 9 | studiodentisticodonati.eu | Milano | 70 | 0.4 | needs_verification | verification | purchase |
| 10 | studiodentisticoaiello.it | Milano | 50 | 0.42 | needs_verification | verification | score |
| 10 | studiodentisticoaiello.it | Milano | 50 | 0.42 | needs_verification | verification | purchase |
| 11 | claradent.it | Milano | 74 | 0.48 | needs_verification | verification | score |
| 11 | claradent.it | Milano | 74 | 0.48 | needs_verification | verification | purchase |
| 12 | studiodentisticogazzoli.it | Brescia | 56 | 0.49 | needs_verification | verification | score |
| 12 | studiodentisticogazzoli.it | Brescia | 56 | 0.49 | needs_verification | verification | purchase |
| 13 | dentalp.it | Brescia | 76 | 0.35 | needs_verification | verification | score |
| 13 | dentalp.it | Brescia | 76 | 0.35 | needs_verification | verification | purchase |
| 14 | ferlinghettiandrea.it | Brescia | 64 | 0.48 | needs_verification | verification | score |
| 14 | ferlinghettiandrea.it | Brescia | 64 | 0.48 | needs_verification | verification | purchase |
| 15 | studioodontoiatricofranchini.it | Brescia | 54 | 0.63 | watchlist |  | score |
| 16 | studioodontoiatricomarini.it | Brescia | 52 | 0.74 | watchlist |  | score |
| 17 | studiodentisticobrescia.it | Brescia | 65 | 0.48 | needs_verification | verification | score |
| 17 | studiodentisticobrescia.it | Brescia | 65 | 0.48 | needs_verification | verification | purchase |
| 18 | studiodentisticosandrozamboni.it | Brescia | 79 | 0.54 | nurture | nurture_signal | score |
| 18 | studiodentisticosandrozamboni.it | Brescia | 79 | 0.54 | nurture | nurture_signal | purchase |
| 19 | benacuslab.com | Brescia | 64 | 0.87 | watchlist |  | score |
| 20 | studiobeghetti.com | Brescia | 78 | 0.53 | nurture | nurture_signal | score |
| 20 | studiobeghetti.com | Brescia | 78 | 0.53 | nurture | nurture_signal | purchase |
| 21 | studiodentisticodebiasi.com | Brescia | 63 | 0.47 | needs_verification | verification | score |
| 21 | studiodentisticodebiasi.com | Brescia | 63 | 0.47 | needs_verification | verification | purchase |
| 22 | studiodentisticoredaelli.it | Bergamo | 80 | 0.35 | needs_verification | verification | score |
| 22 | studiodentisticoredaelli.it | Bergamo | 80 | 0.35 | needs_verification | verification | purchase |
| 23 | studiodentisticorusso.eu | Bergamo | 63 | 0.62 | watchlist |  | score |
| 24 | studiomottarossi.it | Bergamo | 77 | 0.79 | buy_deep_analysis | deep_analysis | score |
| 24 | studiomottarossi.it | Bergamo | 77 | 0.79 | buy_deep_analysis | deep_analysis | purchase |
| 24 | studiomottarossi.it | Bergamo | 77 | 0.79 | buy_deep_analysis | action_pack | action_pack_not_bought |
| 25 | studiodentisticotrebeschi.it | Bergamo | 59 | 0.58 | watchlist |  | score |
| 26 | studiodentisticomaragliano.it | Bergamo | 61 | 0.35 | needs_verification | verification | score |
| 26 | studiodentisticomaragliano.it | Bergamo | 61 | 0.35 | needs_verification | verification | purchase |
| 27 | studiodentisticodentisalute.com | Bergamo | 60 | 0.35 | needs_verification | verification | score |
| 27 | studiodentisticodentisalute.com | Bergamo | 60 | 0.35 | needs_verification | verification | purchase |
| 28 | studiodentisticoperico.it | Bergamo | 52 | 0.35 | needs_verification | verification | score |
| 28 | studiodentisticoperico.it | Bergamo | 52 | 0.35 | needs_verification | verification | purchase |
| 29 | studioodontoiatricobergamo.it | Bergamo | 61 | 0.35 | needs_verification | verification | score |
| 29 | studioodontoiatricobergamo.it | Bergamo | 61 | 0.35 | needs_verification | verification | purchase |
| 30 | sdbergamo.it | Bergamo | 52 | 0.53 | watchlist |  | score |
| 31 | studiodentisticoferroni.it | Bergamo | 81 | 0.72 | buy_deep_analysis | deep_analysis | score |
| 31 | studiodentisticoferroni.it | Bergamo | 81 | 0.72 | buy_deep_analysis | deep_analysis | purchase |
| 31 | studiodentisticoferroni.it | Bergamo | 81 | 0.72 | buy_deep_analysis | action_pack | purchase |
| 32 | studiodentisticoabaco.it | Monza | 78 | 0.73 | buy_deep_analysis | deep_analysis | score |
| 32 | studiodentisticoabaco.it | Monza | 78 | 0.73 | buy_deep_analysis | deep_analysis | purchase |
| 32 | studiodentisticoabaco.it | Monza | 78 | 0.73 | buy_deep_analysis | action_pack | action_pack_not_bought |
| 33 | centrodentisticomonza.com | Monza | 66 | 0.53 | nurture | nurture_signal | score |
| 33 | centrodentisticomonza.com | Monza | 66 | 0.53 | nurture | nurture_signal | purchase |
| 34 | studiodentistico-russo.it | Monza | 81 | 0.77 | buy_deep_analysis | deep_analysis | score |
| 34 | studiodentistico-russo.it | Monza | 81 | 0.77 | buy_deep_analysis | deep_analysis | purchase |
| 34 | studiodentistico-russo.it | Monza | 81 | 0.77 | buy_deep_analysis | action_pack | purchase |
| 35 | studiodentisticocalvi.it | Monza | 63 | 0.73 | watchlist |  | score |
| 36 | studiodentisticospreafico.it | Monza | 76 | 0.35 | needs_verification | verification | score |
| 36 | studiodentisticospreafico.it | Monza | 76 | 0.35 | needs_verification | verification | purchase |
| 37 | dentalmonza.it | Monza | 67 | 0.35 | needs_verification | verification | score |
| 37 | dentalmonza.it | Monza | 67 | 0.35 | needs_verification | verification | purchase |
| 38 | studiodentisticolissone.com | Lissone | 77 | 0.81 | buy_deep_analysis | deep_analysis | score |
| 38 | studiodentisticolissone.com | Lissone | 77 | 0.81 | buy_deep_analysis | deep_analysis | purchase |
| 38 | studiodentisticolissone.com | Lissone | 77 | 0.81 | buy_deep_analysis | action_pack | action_pack_not_bought |
| 39 | studiodentisticocomo.it | Como | 58 | 0.55 | watchlist |  | score |
| 40 | studiobrunodonzelli.it | Como | 81 | 0.35 | needs_verification | verification | score |
| 40 | studiobrunodonzelli.it | Como | 81 | 0.35 | needs_verification | verification | purchase |
| 41 | studiofoggiato.it | Como | 62 | 0.58 | watchlist |  | score |
| 42 | studiodentisticomontagna.it | Varese | 51 | 0.63 | watchlist |  | score |
| 43 | studiodentisticodallatorre.it | Varese | 70 | 0.35 | needs_verification | verification | score |
| 43 | studiodentisticodallatorre.it | Varese | 70 | 0.35 | needs_verification | verification | purchase |
| 44 | studiodentisticocairoli.it | Varese | 69 | 0.52 | nurture | nurture_signal | score |
| 44 | studiodentisticocairoli.it | Varese | 69 | 0.52 | nurture | nurture_signal | purchase |
| 45 | studiodentisticomasullo.it | Varese | 69 | 0.71 | nurture | nurture_signal | score |
| 45 | studiodentisticomasullo.it | Varese | 69 | 0.71 | nurture | nurture_signal | purchase |
| 46 | studiopozziodontoiatria.it | Varese | 75 | 0.35 | needs_verification | verification | score |
| 46 | studiopozziodontoiatria.it | Varese | 75 | 0.35 | needs_verification | verification | purchase |
| 47 | studiodentisticopavia.it | Pavia | 55 | 0.35 | needs_verification | verification | score |
| 47 | studiodentisticopavia.it | Pavia | 55 | 0.35 | needs_verification | verification | purchase |
| 48 | dentistapavia.it | Pavia | 63 | 0.35 | needs_verification | verification | score |
| 48 | dentistapavia.it | Pavia | 63 | 0.35 | needs_verification | verification | purchase |
| 49 | studiodentisticosanmarco.com | Pavia | 54 | 0.72 | watchlist |  | score |
| 50 | studiomascetti.it | Pavia | 70 | 0.35 | needs_verification | verification | score |
| 50 | studiomascetti.it | Pavia | 70 | 0.35 | needs_verification | verification | purchase |

## Check

| Check | Esito | Dettaglio |
|---|---|---|
| target_count_50 | OK | targets=50 |
| target_domains_unique | OK | dedupe by domain |
| beta_customer_created | OK | HTTP 200 |
| target_discovery_order_created | OK | HTTP 200, order=ord_43fd1c5c |
| audit_readable | OK | HTTP 200 |
| scores_completed_50 | OK | 50/50 |
| score_failures_zero | OK | failures=0 |
| purchase_failures_zero | OK | failures=0 |
| audit_reconciliation_ok | OK | True |
| safety_flags_false | OK | {"real_payment_executed": false, "external_contact_executed": false, "beta_payment_guardrail_ok": true, "beta_external_contact_guardrail_ok": true} |
