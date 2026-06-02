# MachineSignal - Target Discovery 100 commercial strength routing test

- Data test: 2026-06-02T12:29:41
- Customer: `target_discovery_100_dentists_lombardy_strength_routing_20260602_122911`
- Pagamenti reali: non eseguiti
- Contatti esterni/email: non eseguiti

## Esito sintetico

- Target caricati: 100
- Target segnati: 100
- Ordini beta registrati: 56
- Ledger backend: `durable_object`
- Audit riconciliato: `True`
- Ricavo simulato totale: 301.6 EUR
- Ricavo Target Discovery: 149.0 EUR
- Ricavo downstream: 152.6 EUR
- Ricavo downstream per target: 1.526 EUR

## Mix

- Decisioni score: `{"buy_deep_analysis": 14, "nurture": 37, "watchlist": 49}`
- Next product raccomandati: `{"deep_analysis": 14, "nurture_signal": 37}`
- Commercial strength: `{"medium": 47, "strong": 4, "weak": 49}`
- Acquisti eseguiti: `{"target_discovery": 1, "deep_analysis": 14, "action_pack": 4, "nurture_signal": 37}`
- Score -> Deep Analysis rate: 0.14
- Deep Analysis -> Action Pack rate: 0.2857

## Lettura commerciale

Questo test parte da una lista reale/semi-reale di 100 domini pubblici di studi dentistici e cliniche odontoiatriche lombarde. Serve a capire se un Target Discovery ridotto puo' generare downstream revenue dopo lo score.

La lista non contiene contatti personali e non attiva outreach: valuta solo domini e acquisti beta machine-to-machine.

## Riconciliazione prodotti

| Prodotto ledger | Crediti usati | Ordini | Ricavo simulato | OK |
|---|---:|---:|---:|---|
| score_pack_1k | 100 | 0 | 9.9 | True |
| deep_analysis_pack_100 | 14 | 14 | 41.86 | True |
| verification_pack_100 | 0 | 0 | 0 | True |
| nurture_signal_pack_100 | 37 | 37 | 37 | True |
| action_pack_25 | 4 | 4 | 63.84 | True |
| target_discovery_pack_250 | 1 | 1 | 149 | True |
| domain_enrichment_pack_100 | 0 | 0 | 0 | True |
| opportunity_feed_monthly | 0 | 0 | 0 | True |

## Campione operativo

| # | Dominio | Citta' | Score | Conf. | Decisione | Strength | Prodotto | Stage |
|---:|---|---|---:|---:|---|---|---|
| 1 | studiodentisticocozzolino.it | Milano | 77 | 0.88 | buy_deep_analysis | medium | deep_analysis | score |
| 1 | studiodentisticocozzolino.it | Milano | 77 | 0.88 | buy_deep_analysis | medium | deep_analysis | purchase |
| 1 | studiodentisticocozzolino.it | Milano | 77 | 0.88 | buy_deep_analysis | medium | action_pack | action_pack_not_bought |
| 2 | studiodentisticocavorretti.it | Milano | 81 | 0.67 | buy_deep_analysis | medium | deep_analysis | score |
| 2 | studiodentisticocavorretti.it | Milano | 81 | 0.67 | buy_deep_analysis | medium | deep_analysis | purchase |
| 2 | studiodentisticocavorretti.it | Milano | 81 | 0.67 | buy_deep_analysis | medium | action_pack | action_pack_not_bought |
| 3 | studiodentisticocannizzo.it | Milano | 80 | 0.76 | buy_deep_analysis | strong | deep_analysis | score |
| 3 | studiodentisticocannizzo.it | Milano | 80 | 0.76 | buy_deep_analysis | strong | deep_analysis | purchase |
| 3 | studiodentisticocannizzo.it | Milano | 80 | 0.76 | buy_deep_analysis | strong | action_pack | purchase |
| 4 | studiodottorpini.it | Milano | 74 | 0.87 | nurture | medium | nurture_signal | score |
| 4 | studiodottorpini.it | Milano | 74 | 0.87 | nurture | medium | nurture_signal | purchase |
| 5 | studiodentisticozambianchi.it | Milano | 64 | 0.58 | watchlist | weak |  | score |
| 6 | studiobelloni.com | Milano | 69 | 0.88 | nurture | medium | nurture_signal | score |
| 6 | studiobelloni.com | Milano | 69 | 0.88 | nurture | medium | nurture_signal | purchase |
| 7 | studiolombardo.srl | Milano | 76 | 0.52 | nurture | medium | nurture_signal | score |
| 7 | studiolombardo.srl | Milano | 76 | 0.52 | nurture | medium | nurture_signal | purchase |
| 8 | studiodentisticosalvetti.it | Milano | 56 | 0.52 | watchlist | weak |  | score |
| 9 | studiodentisticodonati.eu | Milano | 70 | 0.54 | nurture | medium | nurture_signal | score |
| 9 | studiodentisticodonati.eu | Milano | 70 | 0.54 | nurture | medium | nurture_signal | purchase |
| 10 | studiodentisticoaiello.it | Milano | 50 | 0.56 | watchlist | weak |  | score |
| 11 | claradent.it | Milano | 74 | 0.62 | nurture | medium | nurture_signal | score |
| 11 | claradent.it | Milano | 74 | 0.62 | nurture | medium | nurture_signal | purchase |
| 12 | studiodentisticogazzoli.it | Brescia | 56 | 0.63 | watchlist | weak |  | score |
| 13 | dentalp.it | Brescia | 76 | 0.52 | nurture | medium | nurture_signal | score |
| 13 | dentalp.it | Brescia | 76 | 0.52 | nurture | medium | nurture_signal | purchase |
| 14 | ferlinghettiandrea.it | Brescia | 64 | 0.62 | watchlist | weak |  | score |
| 15 | studioodontoiatricofranchini.it | Brescia | 54 | 0.77 | watchlist | weak |  | score |
| 16 | studioodontoiatricomarini.it | Brescia | 52 | 0.88 | watchlist | weak |  | score |
| 17 | studiodentisticobrescia.it | Brescia | 65 | 0.62 | nurture | medium | nurture_signal | score |
| 17 | studiodentisticobrescia.it | Brescia | 65 | 0.62 | nurture | medium | nurture_signal | purchase |
| 18 | studiodentisticosandrozamboni.it | Brescia | 79 | 0.68 | buy_deep_analysis | medium | deep_analysis | score |
| 18 | studiodentisticosandrozamboni.it | Brescia | 79 | 0.68 | buy_deep_analysis | medium | deep_analysis | purchase |
| 18 | studiodentisticosandrozamboni.it | Brescia | 79 | 0.68 | buy_deep_analysis | medium | action_pack | action_pack_not_bought |
| 19 | benacuslab.com | Brescia | 64 | 0.88 | watchlist | weak |  | score |
| 20 | studiobeghetti.com | Brescia | 78 | 0.67 | buy_deep_analysis | medium | deep_analysis | score |
| 20 | studiobeghetti.com | Brescia | 78 | 0.67 | buy_deep_analysis | medium | deep_analysis | purchase |
| 20 | studiobeghetti.com | Brescia | 78 | 0.67 | buy_deep_analysis | medium | action_pack | action_pack_not_bought |
| 21 | studiodentisticodebiasi.com | Brescia | 63 | 0.61 | watchlist | weak |  | score |
| 22 | studiodentisticoredaelli.it | Bergamo | 80 | 0.52 | nurture | medium | nurture_signal | score |
| 22 | studiodentisticoredaelli.it | Bergamo | 80 | 0.52 | nurture | medium | nurture_signal | purchase |
| 23 | studiodentisticorusso.eu | Bergamo | 63 | 0.76 | watchlist | weak |  | score |
| 24 | studiomottarossi.it | Bergamo | 77 | 0.88 | buy_deep_analysis | medium | deep_analysis | score |
| 24 | studiomottarossi.it | Bergamo | 77 | 0.88 | buy_deep_analysis | medium | deep_analysis | purchase |
| 24 | studiomottarossi.it | Bergamo | 77 | 0.88 | buy_deep_analysis | medium | action_pack | action_pack_not_bought |
| 25 | studiodentisticotrebeschi.it | Bergamo | 59 | 0.72 | watchlist | weak |  | score |
| 26 | studiodentisticomaragliano.it | Bergamo | 61 | 0.52 | watchlist | weak |  | score |
| 27 | studiodentisticodentisalute.com | Bergamo | 60 | 0.52 | watchlist | weak |  | score |
| 28 | studiodentisticoperico.it | Bergamo | 52 | 0.52 | watchlist | weak |  | score |
| 29 | studioodontoiatricobergamo.it | Bergamo | 61 | 0.52 | watchlist | weak |  | score |
| 30 | sdbergamo.it | Bergamo | 52 | 0.67 | watchlist | weak |  | score |
| 31 | studiodentisticoferroni.it | Bergamo | 81 | 0.86 | buy_deep_analysis | strong | deep_analysis | score |
| 31 | studiodentisticoferroni.it | Bergamo | 81 | 0.86 | buy_deep_analysis | strong | deep_analysis | purchase |
| 31 | studiodentisticoferroni.it | Bergamo | 81 | 0.86 | buy_deep_analysis | strong | action_pack | purchase |
| 32 | studiodentisticoabaco.it | Monza | 78 | 0.87 | buy_deep_analysis | medium | deep_analysis | score |
| 32 | studiodentisticoabaco.it | Monza | 78 | 0.87 | buy_deep_analysis | medium | deep_analysis | purchase |
| 32 | studiodentisticoabaco.it | Monza | 78 | 0.87 | buy_deep_analysis | medium | action_pack | action_pack_not_bought |
| 33 | centrodentisticomonza.com | Monza | 66 | 0.67 | nurture | medium | nurture_signal | score |
| 33 | centrodentisticomonza.com | Monza | 66 | 0.67 | nurture | medium | nurture_signal | purchase |
| 34 | studiodentistico-russo.it | Monza | 81 | 0.88 | buy_deep_analysis | strong | deep_analysis | score |
| 34 | studiodentistico-russo.it | Monza | 81 | 0.88 | buy_deep_analysis | strong | deep_analysis | purchase |
| 34 | studiodentistico-russo.it | Monza | 81 | 0.88 | buy_deep_analysis | strong | action_pack | purchase |
| 35 | studiodentisticocalvi.it | Monza | 63 | 0.87 | watchlist | weak |  | score |
| 36 | studiodentisticospreafico.it | Monza | 76 | 0.52 | nurture | medium | nurture_signal | score |
| 36 | studiodentisticospreafico.it | Monza | 76 | 0.52 | nurture | medium | nurture_signal | purchase |
| 37 | dentalmonza.it | Monza | 67 | 0.52 | nurture | medium | nurture_signal | score |
| 37 | dentalmonza.it | Monza | 67 | 0.52 | nurture | medium | nurture_signal | purchase |
| 38 | studiodentisticolissone.com | Lissone | 77 | 0.88 | buy_deep_analysis | medium | deep_analysis | score |
| 38 | studiodentisticolissone.com | Lissone | 77 | 0.88 | buy_deep_analysis | medium | deep_analysis | purchase |
| 38 | studiodentisticolissone.com | Lissone | 77 | 0.88 | buy_deep_analysis | medium | action_pack | action_pack_not_bought |
| 39 | studiodentisticocomo.it | Como | 58 | 0.69 | watchlist | weak |  | score |
| 40 | studiobrunodonzelli.it | Como | 81 | 0.52 | nurture | medium | nurture_signal | score |
| 40 | studiobrunodonzelli.it | Como | 81 | 0.52 | nurture | medium | nurture_signal | purchase |
| 41 | studiofoggiato.it | Como | 62 | 0.72 | watchlist | weak |  | score |
| 42 | studiodentisticomontagna.it | Varese | 51 | 0.77 | watchlist | weak |  | score |
| 43 | studiodentisticodallatorre.it | Varese | 70 | 0.52 | nurture | medium | nurture_signal | score |
| 43 | studiodentisticodallatorre.it | Varese | 70 | 0.52 | nurture | medium | nurture_signal | purchase |
| 44 | studiodentisticocairoli.it | Varese | 69 | 0.66 | nurture | medium | nurture_signal | score |
| 44 | studiodentisticocairoli.it | Varese | 69 | 0.66 | nurture | medium | nurture_signal | purchase |
| 45 | studiodentisticomasullo.it | Varese | 69 | 0.85 | nurture | medium | nurture_signal | score |
| 45 | studiodentisticomasullo.it | Varese | 69 | 0.85 | nurture | medium | nurture_signal | purchase |
| 46 | studiopozziodontoiatria.it | Varese | 75 | 0.52 | nurture | medium | nurture_signal | score |
| 46 | studiopozziodontoiatria.it | Varese | 75 | 0.52 | nurture | medium | nurture_signal | purchase |
| 47 | studiodentisticopavia.it | Pavia | 55 | 0.52 | watchlist | weak |  | score |
| 48 | dentistapavia.it | Pavia | 63 | 0.52 | watchlist | weak |  | score |
| 49 | studiodentisticosanmarco.com | Pavia | 54 | 0.86 | watchlist | weak |  | score |
| 50 | studiomascetti.it | Pavia | 70 | 0.52 | nurture | medium | nurture_signal | score |
| 50 | studiomascetti.it | Pavia | 70 | 0.52 | nurture | medium | nurture_signal | purchase |
| 51 | studiodentisticolecco.it | Lecco | 68 | 0.52 | nurture | medium | nurture_signal | score |
| 51 | studiodentisticolecco.it | Lecco | 68 | 0.52 | nurture | medium | nurture_signal | purchase |
| 52 | studioodontoiatricolecco.it | Lecco | 50 | 0.83 | watchlist | weak |  | score |
| 53 | centrodentisticolecco.it | Lecco | 61 | 0.52 | watchlist | weak |  | score |
| 54 | studiodentisticomerate.it | Merate | 72 | 0.88 | nurture | medium | nurture_signal | score |
| 54 | studiodentisticomerate.it | Merate | 72 | 0.88 | nurture | medium | nurture_signal | purchase |
| 55 | studiodentisticomantova.it | Mantova | 66 | 0.52 | nurture | medium | nurture_signal | score |
| 55 | studiodentisticomantova.it | Mantova | 66 | 0.52 | nurture | medium | nurture_signal | purchase |
| 56 | studioodontoiatricomantova.it | Mantova | 80 | 0.65 | buy_deep_analysis | medium | deep_analysis | score |
| 56 | studioodontoiatricomantova.it | Mantova | 80 | 0.65 | buy_deep_analysis | medium | deep_analysis | purchase |
| 56 | studioodontoiatricomantova.it | Mantova | 80 | 0.65 | buy_deep_analysis | medium | action_pack | action_pack_not_bought |
| 57 | centrodentisticomantova.it | Mantova | 71 | 0.87 | nurture | medium | nurture_signal | score |
| 57 | centrodentisticomantova.it | Mantova | 71 | 0.87 | nurture | medium | nurture_signal | purchase |
| 58 | studiodentisticocastiglione.it | Castiglione delle Stiviere | 58 | 0.79 | watchlist | weak |  | score |
| 59 | studiodentisticocremona.it | Cremona | 51 | 0.88 | watchlist | weak |  | score |
| 60 | studioodontoiatricocremona.it | Cremona | 77 | 0.86 | buy_deep_analysis | medium | deep_analysis | score |
| 60 | studioodontoiatricocremona.it | Cremona | 77 | 0.86 | buy_deep_analysis | medium | deep_analysis | purchase |
| 60 | studioodontoiatricocremona.it | Cremona | 77 | 0.86 | buy_deep_analysis | medium | action_pack | action_pack_not_bought |
| 61 | centrodentisticocremona.it | Cremona | 50 | 0.7 | watchlist | weak |  | score |
| 62 | studiodentisticocrema.it | Crema | 72 | 0.71 | nurture | medium | nurture_signal | score |
| 62 | studiodentisticocrema.it | Crema | 72 | 0.71 | nurture | medium | nurture_signal | purchase |
| 63 | studiodentisticolodi.it | Lodi | 58 | 0.52 | watchlist | weak |  | score |
| 64 | studioodontoiatricolodi.it | Lodi | 76 | 0.52 | nurture | medium | nurture_signal | score |
| 64 | studioodontoiatricolodi.it | Lodi | 76 | 0.52 | nurture | medium | nurture_signal | purchase |
| 65 | centrodentisticolodi.it | Lodi | 53 | 0.52 | watchlist | weak |  | score |
| 66 | studiodentisticocodogno.it | Codogno | 81 | 0.53 | nurture | medium | nurture_signal | score |
| 66 | studiodentisticocodogno.it | Codogno | 81 | 0.53 | nurture | medium | nurture_signal | purchase |
| 67 | studiodentisticosondrio.it | Sondrio | 72 | 0.65 | nurture | medium | nurture_signal | score |
| 67 | studiodentisticosondrio.it | Sondrio | 72 | 0.65 | nurture | medium | nurture_signal | purchase |
| 68 | studioodontoiatricosondrio.it | Sondrio | 62 | 0.52 | watchlist | weak |  | score |
| 69 | centrodentisticosondrio.it | Sondrio | 57 | 0.77 | watchlist | weak |  | score |
| 70 | studiodentisticomorbegno.it | Morbegno | 79 | 0.56 | nurture | medium | nurture_signal | score |
| 70 | studiodentisticomorbegno.it | Morbegno | 79 | 0.56 | nurture | medium | nurture_signal | purchase |
| 71 | studiodentisticorho.it | Rho | 61 | 0.86 | watchlist | weak |  | score |
| 72 | studiodentisticolegnano.it | Legnano | 72 | 0.88 | nurture | medium | nurture_signal | score |
| 72 | studiodentisticolegnano.it | Legnano | 72 | 0.88 | nurture | medium | nurture_signal | purchase |
| 73 | studiodentisticosesto.it | Sesto San Giovanni | 50 | 0.52 | watchlist | weak |  | score |
| 74 | studiodentisticocinisello.it | Cinisello Balsamo | 80 | 0.88 | buy_deep_analysis | strong | deep_analysis | score |
| 74 | studiodentisticocinisello.it | Cinisello Balsamo | 80 | 0.88 | buy_deep_analysis | strong | deep_analysis | purchase |
| 74 | studiodentisticocinisello.it | Cinisello Balsamo | 80 | 0.88 | buy_deep_analysis | strong | action_pack | purchase |
| 75 | studiodentisticosandonato.it | San Donato Milanese | 53 | 0.69 | watchlist | weak |  | score |
| 76 | studiodentisticotreviglio.it | Treviglio | 77 | 0.52 | nurture | medium | nurture_signal | score |
| 76 | studiodentisticotreviglio.it | Treviglio | 77 | 0.52 | nurture | medium | nurture_signal | purchase |
| 77 | studiodentisticoseriate.it | Seriate | 65 | 0.7 | nurture | medium | nurture_signal | score |
| 77 | studiodentisticoseriate.it | Seriate | 65 | 0.7 | nurture | medium | nurture_signal | purchase |
| 78 | studiodentisticodalmine.it | Dalmine | 68 | 0.88 | nurture | medium | nurture_signal | score |
| 78 | studiodentisticodalmine.it | Dalmine | 68 | 0.88 | nurture | medium | nurture_signal | purchase |
| 79 | studiodentisticoromano.it | Romano di Lombardia | 50 | 0.87 | watchlist | weak |  | score |
| 80 | studiodentisticochiari.it | Chiari | 56 | 0.53 | watchlist | weak |  | score |
| 81 | studiodentisticodesenzano.it | Desenzano del Garda | 67 | 0.52 | nurture | medium | nurture_signal | score |
| 81 | studiodentisticodesenzano.it | Desenzano del Garda | 67 | 0.52 | nurture | medium | nurture_signal | purchase |
| 82 | studiodentisticosalo.it | Salo | 57 | 0.52 | watchlist | weak |  | score |
| 83 | studiodentisticogardone.it | Gardone Val Trompia | 68 | 0.52 | nurture | medium | nurture_signal | score |
| 83 | studiodentisticogardone.it | Gardone Val Trompia | 68 | 0.52 | nurture | medium | nurture_signal | purchase |
| 84 | studiodentisticovigevano.it | Vigevano | 79 | 0.88 | buy_deep_analysis | medium | deep_analysis | score |
| 84 | studiodentisticovigevano.it | Vigevano | 79 | 0.88 | buy_deep_analysis | medium | deep_analysis | purchase |
| 84 | studiodentisticovigevano.it | Vigevano | 79 | 0.88 | buy_deep_analysis | medium | action_pack | action_pack_not_bought |
| 85 | studiodentisticovoghera.it | Voghera | 72 | 0.88 | nurture | medium | nurture_signal | score |
| 85 | studiodentisticovoghera.it | Voghera | 72 | 0.88 | nurture | medium | nurture_signal | purchase |
| 86 | studiodentisticomortara.it | Mortara | 50 | 0.63 | watchlist | weak |  | score |
| 87 | studiodentisticogallarate.it | Gallarate | 63 | 0.54 | watchlist | weak |  | score |
| 88 | studiodentisticobustoarsizio.it | Busto Arsizio | 50 | 0.61 | watchlist | weak |  | score |
| 89 | studiodentisticosaronno.it | Saronno | 74 | 0.52 | nurture | medium | nurture_signal | score |
| 89 | studiodentisticosaronno.it | Saronno | 74 | 0.52 | nurture | medium | nurture_signal | purchase |
| 90 | studiodentisticotradate.it | Tradate | 63 | 0.88 | watchlist | weak |  | score |
| 91 | studiodentisticocantu.it | Cantu | 51 | 0.88 | watchlist | weak |  | score |
| 92 | studiodentisticoerba.it | Erba | 66 | 0.52 | nurture | medium | nurture_signal | score |
| 92 | studiodentisticoerba.it | Erba | 66 | 0.52 | nurture | medium | nurture_signal | purchase |
| 93 | studiodentisticomariano.it | Mariano Comense | 55 | 0.52 | watchlist | weak |  | score |
| 94 | studiodentisticodesio.it | Desio | 50 | 0.86 | watchlist | weak |  | score |
| 95 | studiodentisticoseregno.it | Seregno | 55 | 0.87 | watchlist | weak |  | score |
| 96 | studiodentisticovimercate.it | Vimercate | 74 | 0.7 | nurture | medium | nurture_signal | score |
| 96 | studiodentisticovimercate.it | Vimercate | 74 | 0.7 | nurture | medium | nurture_signal | purchase |
| 97 | centroodontoiatricobrianza.it | Monza | 58 | 0.83 | watchlist | weak |  | score |
| 98 | studiodentisticorozzano.it | Rozzano | 71 | 0.88 | nurture | medium | nurture_signal | score |
| 98 | studiodentisticorozzano.it | Rozzano | 71 | 0.88 | nurture | medium | nurture_signal | purchase |
| 99 | studiodentisticocorsico.it | Corsico | 52 | 0.71 | watchlist | weak |  | score |
| 100 | studiodentisticomelegnano.it | Melegnano | 50 | 0.66 | watchlist | weak |  | score |

## Check

| Check | Esito | Dettaglio |
|---|---|---|
| target_count_100 | OK | targets=100 |
| target_domains_unique | OK | dedupe by domain |
| beta_customer_created | OK | HTTP 200 |
| target_discovery_order_created | OK | HTTP 200, order=ord_4c360f00 |
| audit_readable | OK | HTTP 200 |
| scores_completed_100 | OK | 100/100 |
| score_failures_zero | OK | failures=0 |
| purchase_failures_zero | OK | failures=0 |
| audit_reconciliation_ok | OK | True |
| safety_flags_false | OK | {"real_payment_executed": false, "external_contact_executed": false, "beta_payment_guardrail_ok": true, "beta_external_contact_guardrail_ok": true} |
