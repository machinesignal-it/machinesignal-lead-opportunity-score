# MachineSignal - Natural Action Pack funnel test

- Data test: 2026-06-02T11:09:40
- Customer: `natural_action_20260602_110914`
- Pagamenti reali: non eseguiti
- Contatti esterni/email: non eseguiti

## Esito sintetico

- Score richiesti: 100
- Score completati: 100
- Ordini registrati: 100
- Ledger backend: `durable_object`
- Riconciliazione audit: `True`
- Ricavo simulato: 309.25 EUR
- Ricavo medio per score: 3.0925 EUR
- Pagamenti reali: `False`
- Contatti esterni: `False`

## Mix decisioni e acquisti

- Decisioni score: `{"buy_deep_analysis": 25, "watchlist": 10, "needs_verification": 50, "nurture": 15}`
- Next product raccomandati: `{"deep_analysis": 25, "verification": 50, "nurture_signal": 15}`
- Acquisti eseguiti: `{"deep_analysis": 25, "action_pack": 10, "verification": 50, "nurture_signal": 15}`
- Deep Analysis -> Action Pack rate: 0.4
- Score -> Deep Analysis rate: 0.25
- Action Pack candidati naturali: 10
- Action Pack bloccati dopo Deep Analysis: 15

## Lettura commerciale

Questo test misura una macchina prudente: l'Action Pack non viene comprato automaticamente dopo ogni Deep Analysis. Viene comprato solo quando score, confidence, quality review e Deep Analysis superano soglie chiare.

Se il ricavo medio resta interessante anche con questa regola, il modello commerciale e' piu' credibile per un cliente macchina. Se invece cala troppo, significa che il listino deve essere spostato verso pacchetti ricorrenti, discovery o verification follow-through.

## Riconciliazione prodotti

| Prodotto ledger | Crediti usati | Ordini | Ricavo simulato | OK |
|---|---:|---:|---:|---|
| score_pack_1k | 100 | 0 | 9.9 | True |
| deep_analysis_pack_100 | 25 | 25 | 74.75 | True |
| verification_pack_100 | 50 | 50 | 50 | True |
| nurture_signal_pack_100 | 15 | 15 | 15 | True |
| action_pack_25 | 10 | 10 | 159.6 | True |
| target_discovery_pack_250 | 0 | 0 | 0 | True |
| domain_enrichment_pack_100 | 0 | 0 | 0 | True |
| opportunity_feed_monthly | 0 | 0 | 0 | True |

## Campione operativo

| # | Dominio | Score | Conf. | Decisione | Prodotto | Stage | Gate Action Pack |
|---:|---|---:|---:|---|---|---|---|
| 1 | quinta-essenza.com | 81 | 0.79 | buy_deep_analysis | deep_analysis | score |  |
| 1 | quinta-essenza.com | 81 | 0.79 | buy_deep_analysis | deep_analysis | purchase |  |
| 1 | quinta-essenza.com | 81 | 0.79 | buy_deep_analysis | action_pack | purchase | score, confidence, quality and deep analysis gates passed |
| 2 | clinic3.it | 81 | 0.79 | buy_deep_analysis | deep_analysis | score |  |
| 2 | clinic3.it | 81 | 0.79 | buy_deep_analysis | deep_analysis | purchase |  |
| 2 | clinic3.it | 81 | 0.79 | buy_deep_analysis | action_pack | purchase | score, confidence, quality and deep analysis gates passed |
| 3 | studio-odontoiatrico-demo.it | 61 | 0.62 | watchlist |  | score |  |
| 4 | avalonbenessere.it | 80 | 0.68 | buy_deep_analysis | deep_analysis | score |  |
| 4 | avalonbenessere.it | 80 | 0.68 | buy_deep_analysis | deep_analysis | purchase |  |
| 4 | avalonbenessere.it | 80 | 0.68 | buy_deep_analysis | action_pack | action_pack_not_bought | confidence below natural action threshold 0.70 |
| 5 | centromedico-besana.it | 81 | 0.66 | buy_deep_analysis | deep_analysis | score |  |
| 5 | centromedico-besana.it | 81 | 0.66 | buy_deep_analysis | deep_analysis | purchase |  |
| 5 | centromedico-besana.it | 81 | 0.66 | buy_deep_analysis | action_pack | action_pack_not_bought | confidence below natural action threshold 0.70 |
| 6 | vistavisiongroup.com | 63 | 0.49 | needs_verification | verification | score |  |
| 6 | vistavisiongroup.com | 63 | 0.49 | needs_verification | verification | purchase |  |
| 7 | bianchiosteopata.it | 63 | 0.49 | needs_verification | verification | score |  |
| 7 | bianchiosteopata.it | 63 | 0.49 | needs_verification | verification | purchase |  |
| 8 | example-dentist-milano.it | 75 | 0.35 | needs_verification | verification | score |  |
| 8 | example-dentist-milano.it | 75 | 0.35 | needs_verification | verification | purchase |  |
| 9 | demo-clinic-lombardia.it | 70 | 0.5 | nurture | nurture_signal | score |  |
| 9 | demo-clinic-lombardia.it | 70 | 0.5 | nurture | nurture_signal | purchase |  |
| 10 | studio-legale-demo.it | 68 | 0.67 | nurture | nurture_signal | score |  |
| 10 | studio-legale-demo.it | 68 | 0.67 | nurture | nurture_signal | purchase |  |
| 11 | cogebra.com | 37 | 0.49 | needs_verification | verification | score |  |
| 11 | cogebra.com | 37 | 0.49 | needs_verification | verification | purchase |  |
| 12 | valcavallinaimmobili.it | 64 | 0.36 | needs_verification | verification | score |  |
| 12 | valcavallinaimmobili.it | 64 | 0.36 | needs_verification | verification | purchase |  |
| 13 | agenzia-immobiliare-demo.it | 78 | 0.47 | needs_verification | verification | score |  |
| 13 | agenzia-immobiliare-demo.it | 78 | 0.47 | needs_verification | verification | purchase |  |
| 14 | centromedicosanpiox.it | 76 | 0.8 | buy_deep_analysis | deep_analysis | score |  |
| 14 | centromedicosanpiox.it | 76 | 0.8 | buy_deep_analysis | deep_analysis | purchase |  |
| 14 | centromedicosanpiox.it | 76 | 0.8 | buy_deep_analysis | action_pack | action_pack_not_bought | score below natural action threshold 80 |
| 15 | studiofamilydental.it | 76 | 0.35 | needs_verification | verification | score |  |
| 15 | studiofamilydental.it | 76 | 0.35 | needs_verification | verification | purchase |  |
| 16 | studio-bianco-avvocati.it | 56 | 0.38 | needs_verification | verification | score |  |
| 16 | studio-bianco-avvocati.it | 56 | 0.38 | needs_verification | verification | purchase |  |
| 17 | impresa-edile-demo.it | 73 | 0.66 | nurture | nurture_signal | score |  |
| 17 | impresa-edile-demo.it | 73 | 0.66 | nurture | nurture_signal | purchase |  |
| 18 | agenzia-marketing-demo.it | 53 | 0.81 | watchlist |  | score |  |
| 19 | tecnocasa.it | 31 | 0.49 | needs_verification | verification | score |  |
| 19 | tecnocasa.it | 31 | 0.49 | needs_verification | verification | purchase |  |
| 20 | farmacia-demo.it | 45 | 0.49 | needs_verification | verification | score |  |
| 20 | farmacia-demo.it | 45 | 0.49 | needs_verification | verification | purchase |  |
| 21 | quinta-essenza.com | 81 | 0.79 | buy_deep_analysis | deep_analysis | score |  |
| 21 | quinta-essenza.com | 81 | 0.79 | buy_deep_analysis | deep_analysis | purchase |  |
| 21 | quinta-essenza.com | 81 | 0.79 | buy_deep_analysis | action_pack | purchase | score, confidence, quality and deep analysis gates passed |
| 22 | clinic3.it | 81 | 0.79 | buy_deep_analysis | deep_analysis | score |  |
| 22 | clinic3.it | 81 | 0.79 | buy_deep_analysis | deep_analysis | purchase |  |
| 22 | clinic3.it | 81 | 0.79 | buy_deep_analysis | action_pack | purchase | score, confidence, quality and deep analysis gates passed |
| 23 | studio-odontoiatrico-demo.it | 61 | 0.62 | watchlist |  | score |  |
| 24 | avalonbenessere.it | 80 | 0.68 | buy_deep_analysis | deep_analysis | score |  |
| 24 | avalonbenessere.it | 80 | 0.68 | buy_deep_analysis | deep_analysis | purchase |  |
| 24 | avalonbenessere.it | 80 | 0.68 | buy_deep_analysis | action_pack | action_pack_not_bought | confidence below natural action threshold 0.70 |
| 25 | centromedico-besana.it | 81 | 0.66 | buy_deep_analysis | deep_analysis | score |  |
| 25 | centromedico-besana.it | 81 | 0.66 | buy_deep_analysis | deep_analysis | purchase |  |
| 25 | centromedico-besana.it | 81 | 0.66 | buy_deep_analysis | action_pack | action_pack_not_bought | confidence below natural action threshold 0.70 |
| 26 | vistavisiongroup.com | 63 | 0.49 | needs_verification | verification | score |  |
| 26 | vistavisiongroup.com | 63 | 0.49 | needs_verification | verification | purchase |  |
| 27 | bianchiosteopata.it | 63 | 0.49 | needs_verification | verification | score |  |
| 27 | bianchiosteopata.it | 63 | 0.49 | needs_verification | verification | purchase |  |
| 28 | example-dentist-milano.it | 75 | 0.35 | needs_verification | verification | score |  |
| 28 | example-dentist-milano.it | 75 | 0.35 | needs_verification | verification | purchase |  |
| 29 | demo-clinic-lombardia.it | 70 | 0.5 | nurture | nurture_signal | score |  |
| 29 | demo-clinic-lombardia.it | 70 | 0.5 | nurture | nurture_signal | purchase |  |
| 30 | studio-legale-demo.it | 68 | 0.67 | nurture | nurture_signal | score |  |
| 30 | studio-legale-demo.it | 68 | 0.67 | nurture | nurture_signal | purchase |  |
| 31 | cogebra.com | 37 | 0.49 | needs_verification | verification | score |  |
| 31 | cogebra.com | 37 | 0.49 | needs_verification | verification | purchase |  |
| 32 | valcavallinaimmobili.it | 64 | 0.36 | needs_verification | verification | score |  |
| 32 | valcavallinaimmobili.it | 64 | 0.36 | needs_verification | verification | purchase |  |
| 33 | agenzia-immobiliare-demo.it | 78 | 0.47 | needs_verification | verification | score |  |
| 33 | agenzia-immobiliare-demo.it | 78 | 0.47 | needs_verification | verification | purchase |  |
| 34 | centromedicosanpiox.it | 76 | 0.8 | buy_deep_analysis | deep_analysis | score |  |
| 34 | centromedicosanpiox.it | 76 | 0.8 | buy_deep_analysis | deep_analysis | purchase |  |
| 34 | centromedicosanpiox.it | 76 | 0.8 | buy_deep_analysis | action_pack | action_pack_not_bought | score below natural action threshold 80 |
| 35 | studiofamilydental.it | 76 | 0.35 | needs_verification | verification | score |  |
| 35 | studiofamilydental.it | 76 | 0.35 | needs_verification | verification | purchase |  |
| 36 | studio-bianco-avvocati.it | 56 | 0.38 | needs_verification | verification | score |  |
| 36 | studio-bianco-avvocati.it | 56 | 0.38 | needs_verification | verification | purchase |  |
| 37 | impresa-edile-demo.it | 73 | 0.66 | nurture | nurture_signal | score |  |

## Check

| Check | Esito | Dettaglio |
|---|---|---|
| beta_customer_created | OK | HTTP 200 |
| usage_readable | OK | HTTP 200 |
| orders_readable | OK | HTTP 200 |
| audit_readable | OK | HTTP 200 |
| scores_completed | OK | 100/100 |
| score_failures_zero | OK | failures=0 |
| purchase_failures_zero | OK | failures=0 |
| ledger_backend_durable_object | OK | durable_object |
| audit_reconciliation_ok | OK | True |
| safety_flags_false | OK | {"real_payment_executed": false, "external_contact_executed": false, "beta_payment_guardrail_ok": true, "beta_external_contact_guardrail_ok": true} |
