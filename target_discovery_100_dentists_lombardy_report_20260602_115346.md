# MachineSignal - Target Discovery 100 test

- Data test: 2026-06-02T11:53:46
- Customer: `target_discovery_100_dentists_lombardy_20260602_115322`
- Pagamenti reali: non eseguiti
- Contatti esterni/email: non eseguiti

## Esito sintetico

- Target caricati: 100
- Target segnati: 100
- Ordini beta registrati: 78
- Ledger backend: `durable_object`
- Audit riconciliato: `True`
- Ricavo simulato totale: 298.69 EUR
- Ricavo Target Discovery: 149.0 EUR
- Ricavo downstream: 149.69 EUR
- Ricavo downstream per target: 1.4969 EUR

## Mix

- Decisioni score: `{"buy_deep_analysis": 9, "nurture": 20, "needs_verification": 45, "watchlist": 26}`
- Next product raccomandati: `{"deep_analysis": 9, "nurture_signal": 20, "verification": 45}`
- Acquisti eseguiti: `{"target_discovery": 1, "deep_analysis": 9, "nurture_signal": 20, "verification": 45, "action_pack": 3}`
- Score -> Deep Analysis rate: 0.09
- Deep Analysis -> Action Pack rate: 0.3333

## Lettura commerciale

Questo test parte da una lista reale/semi-reale di 100 domini pubblici di studi dentistici e cliniche odontoiatriche lombarde. Serve a capire se un Target Discovery ridotto puo' generare downstream revenue dopo lo score.

La lista non contiene contatti personali e non attiva outreach: valuta solo domini e acquisti beta machine-to-machine.

## Riconciliazione prodotti

| Prodotto ledger | Crediti usati | Ordini | Ricavo simulato | OK |
|---|---:|---:|---:|---|
| score_pack_1k | 100 | 0 | 9.9 | True |
| deep_analysis_pack_100 | 9 | 9 | 26.91 | True |
| verification_pack_100 | 45 | 45 | 45 | True |
| nurture_signal_pack_100 | 20 | 20 | 20 | True |
| action_pack_25 | 3 | 3 | 47.88 | True |
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
| 51 | studiodentisticolecco.it | Lecco | 68 | 0.35 | needs_verification | verification | score |
| 51 | studiodentisticolecco.it | Lecco | 68 | 0.35 | needs_verification | verification | purchase |
| 52 | studioodontoiatricolecco.it | Lecco | 50 | 0.69 | watchlist |  | score |
| 53 | centrodentisticolecco.it | Lecco | 61 | 0.35 | needs_verification | verification | score |
| 53 | centrodentisticolecco.it | Lecco | 61 | 0.35 | needs_verification | verification | purchase |
| 54 | studiodentisticomerate.it | Merate | 72 | 0.76 | nurture | nurture_signal | score |
| 54 | studiodentisticomerate.it | Merate | 72 | 0.76 | nurture | nurture_signal | purchase |
| 55 | studiodentisticomantova.it | Mantova | 66 | 0.35 | needs_verification | verification | score |
| 55 | studiodentisticomantova.it | Mantova | 66 | 0.35 | needs_verification | verification | purchase |
| 56 | studioodontoiatricomantova.it | Mantova | 80 | 0.51 | nurture | nurture_signal | score |
| 56 | studioodontoiatricomantova.it | Mantova | 80 | 0.51 | nurture | nurture_signal | purchase |
| 57 | centrodentisticomantova.it | Mantova | 71 | 0.73 | nurture | nurture_signal | score |
| 57 | centrodentisticomantova.it | Mantova | 71 | 0.73 | nurture | nurture_signal | purchase |
| 58 | studiodentisticocastiglione.it | Castiglione delle Stiviere | 58 | 0.65 | watchlist |  | score |
| 59 | studiodentisticocremona.it | Cremona | 51 | 0.81 | watchlist |  | score |
| 60 | studioodontoiatricocremona.it | Cremona | 77 | 0.72 | buy_deep_analysis | deep_analysis | score |
| 60 | studioodontoiatricocremona.it | Cremona | 77 | 0.72 | buy_deep_analysis | deep_analysis | purchase |
| 60 | studioodontoiatricocremona.it | Cremona | 77 | 0.72 | buy_deep_analysis | action_pack | action_pack_not_bought |
| 61 | centrodentisticocremona.it | Cremona | 50 | 0.56 | watchlist |  | score |
| 62 | studiodentisticocrema.it | Crema | 72 | 0.57 | nurture | nurture_signal | score |
| 62 | studiodentisticocrema.it | Crema | 72 | 0.57 | nurture | nurture_signal | purchase |
| 63 | studiodentisticolodi.it | Lodi | 58 | 0.35 | needs_verification | verification | score |
| 63 | studiodentisticolodi.it | Lodi | 58 | 0.35 | needs_verification | verification | purchase |
| 64 | studioodontoiatricolodi.it | Lodi | 76 | 0.35 | needs_verification | verification | score |
| 64 | studioodontoiatricolodi.it | Lodi | 76 | 0.35 | needs_verification | verification | purchase |
| 65 | centrodentisticolodi.it | Lodi | 53 | 0.38 | needs_verification | verification | score |
| 65 | centrodentisticolodi.it | Lodi | 53 | 0.38 | needs_verification | verification | purchase |
| 66 | studiodentisticocodogno.it | Codogno | 81 | 0.39 | needs_verification | verification | score |
| 66 | studiodentisticocodogno.it | Codogno | 81 | 0.39 | needs_verification | verification | purchase |
| 67 | studiodentisticosondrio.it | Sondrio | 72 | 0.51 | nurture | nurture_signal | score |
| 67 | studiodentisticosondrio.it | Sondrio | 72 | 0.51 | nurture | nurture_signal | purchase |
| 68 | studioodontoiatricosondrio.it | Sondrio | 62 | 0.35 | needs_verification | verification | score |
| 68 | studioodontoiatricosondrio.it | Sondrio | 62 | 0.35 | needs_verification | verification | purchase |
| 69 | centrodentisticosondrio.it | Sondrio | 57 | 0.63 | watchlist |  | score |
| 70 | studiodentisticomorbegno.it | Morbegno | 79 | 0.42 | needs_verification | verification | score |
| 70 | studiodentisticomorbegno.it | Morbegno | 79 | 0.42 | needs_verification | verification | purchase |
| 71 | studiodentisticorho.it | Rho | 61 | 0.72 | watchlist |  | score |
| 72 | studiodentisticolegnano.it | Legnano | 72 | 0.78 | nurture | nurture_signal | score |
| 72 | studiodentisticolegnano.it | Legnano | 72 | 0.78 | nurture | nurture_signal | purchase |
| 73 | studiodentisticosesto.it | Sesto San Giovanni | 50 | 0.35 | needs_verification | verification | score |
| 73 | studiodentisticosesto.it | Sesto San Giovanni | 50 | 0.35 | needs_verification | verification | purchase |
| 74 | studiodentisticocinisello.it | Cinisello Balsamo | 80 | 0.81 | buy_deep_analysis | deep_analysis | score |
| 74 | studiodentisticocinisello.it | Cinisello Balsamo | 80 | 0.81 | buy_deep_analysis | deep_analysis | purchase |
| 74 | studiodentisticocinisello.it | Cinisello Balsamo | 80 | 0.81 | buy_deep_analysis | action_pack | purchase |
| 75 | studiodentisticosandonato.it | San Donato Milanese | 53 | 0.55 | watchlist |  | score |
| 76 | studiodentisticotreviglio.it | Treviglio | 77 | 0.36 | needs_verification | verification | score |
| 76 | studiodentisticotreviglio.it | Treviglio | 77 | 0.36 | needs_verification | verification | purchase |
| 77 | studiodentisticoseriate.it | Seriate | 65 | 0.56 | nurture | nurture_signal | score |
| 77 | studiodentisticoseriate.it | Seriate | 65 | 0.56 | nurture | nurture_signal | purchase |
| 78 | studiodentisticodalmine.it | Dalmine | 68 | 0.85 | nurture | nurture_signal | score |
| 78 | studiodentisticodalmine.it | Dalmine | 68 | 0.85 | nurture | nurture_signal | purchase |
| 79 | studiodentisticoromano.it | Romano di Lombardia | 50 | 0.73 | watchlist |  | score |
| 80 | studiodentisticochiari.it | Chiari | 56 | 0.39 | needs_verification | verification | score |
| 80 | studiodentisticochiari.it | Chiari | 56 | 0.39 | needs_verification | verification | purchase |
| 81 | studiodentisticodesenzano.it | Desenzano del Garda | 67 | 0.35 | needs_verification | verification | score |
| 81 | studiodentisticodesenzano.it | Desenzano del Garda | 67 | 0.35 | needs_verification | verification | purchase |
| 82 | studiodentisticosalo.it | Salo | 57 | 0.35 | needs_verification | verification | score |
| 82 | studiodentisticosalo.it | Salo | 57 | 0.35 | needs_verification | verification | purchase |
| 83 | studiodentisticogardone.it | Gardone Val Trompia | 68 | 0.38 | needs_verification | verification | score |
| 83 | studiodentisticogardone.it | Gardone Val Trompia | 68 | 0.38 | needs_verification | verification | purchase |
| 84 | studiodentisticovigevano.it | Vigevano | 79 | 0.84 | buy_deep_analysis | deep_analysis | score |
| 84 | studiodentisticovigevano.it | Vigevano | 79 | 0.84 | buy_deep_analysis | deep_analysis | purchase |
| 84 | studiodentisticovigevano.it | Vigevano | 79 | 0.84 | buy_deep_analysis | action_pack | action_pack_not_bought |
| 85 | studiodentisticovoghera.it | Voghera | 72 | 0.86 | nurture | nurture_signal | score |
| 85 | studiodentisticovoghera.it | Voghera | 72 | 0.86 | nurture | nurture_signal | purchase |
| 86 | studiodentisticomortara.it | Mortara | 50 | 0.49 | needs_verification | verification | score |
| 86 | studiodentisticomortara.it | Mortara | 50 | 0.49 | needs_verification | verification | purchase |
| 87 | studiodentisticogallarate.it | Gallarate | 63 | 0.4 | needs_verification | verification | score |
| 87 | studiodentisticogallarate.it | Gallarate | 63 | 0.4 | needs_verification | verification | purchase |
| 88 | studiodentisticobustoarsizio.it | Busto Arsizio | 50 | 0.47 | needs_verification | verification | score |
| 88 | studiodentisticobustoarsizio.it | Busto Arsizio | 50 | 0.47 | needs_verification | verification | purchase |
| 89 | studiodentisticosaronno.it | Saronno | 74 | 0.37 | needs_verification | verification | score |
| 89 | studiodentisticosaronno.it | Saronno | 74 | 0.37 | needs_verification | verification | purchase |
| 90 | studiodentisticotradate.it | Tradate | 63 | 0.84 | watchlist |  | score |
| 91 | studiodentisticocantu.it | Cantu | 51 | 0.84 | watchlist |  | score |
| 92 | studiodentisticoerba.it | Erba | 66 | 0.35 | needs_verification | verification | score |
| 92 | studiodentisticoerba.it | Erba | 66 | 0.35 | needs_verification | verification | purchase |
| 93 | studiodentisticomariano.it | Mariano Comense | 55 | 0.35 | needs_verification | verification | score |
| 93 | studiodentisticomariano.it | Mariano Comense | 55 | 0.35 | needs_verification | verification | purchase |
| 94 | studiodentisticodesio.it | Desio | 50 | 0.72 | watchlist |  | score |
| 95 | studiodentisticoseregno.it | Seregno | 55 | 0.73 | watchlist |  | score |
| 96 | studiodentisticovimercate.it | Vimercate | 74 | 0.56 | nurture | nurture_signal | score |
| 96 | studiodentisticovimercate.it | Vimercate | 74 | 0.56 | nurture | nurture_signal | purchase |
| 97 | centroodontoiatricobrianza.it | Monza | 58 | 0.69 | watchlist |  | score |
| 98 | studiodentisticorozzano.it | Rozzano | 71 | 0.74 | nurture | nurture_signal | score |
| 98 | studiodentisticorozzano.it | Rozzano | 71 | 0.74 | nurture | nurture_signal | purchase |
| 99 | studiodentisticocorsico.it | Corsico | 52 | 0.57 | watchlist |  | score |
| 100 | studiodentisticomelegnano.it | Melegnano | 50 | 0.52 | watchlist |  | score |

## Check

| Check | Esito | Dettaglio |
|---|---|---|
| target_count_100 | OK | targets=100 |
| target_domains_unique | OK | dedupe by domain |
| beta_customer_created | OK | HTTP 200 |
| target_discovery_order_created | OK | HTTP 200, order=ord_8f9d4c62 |
| audit_readable | OK | HTTP 200 |
| scores_completed_100 | OK | 100/100 |
| score_failures_zero | OK | failures=0 |
| purchase_failures_zero | OK | failures=0 |
| audit_reconciliation_ok | OK | True |
| safety_flags_false | OK | {"real_payment_executed": false, "external_contact_executed": false, "beta_payment_guardrail_ok": true, "beta_external_contact_guardrail_ok": true} |
