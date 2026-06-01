# MachineSignal - Budget-cap automatic funnel test

- Data test: 2026-06-01T16:06:22
- Score richiesti: 300
- Budget massimo simulato: 450.00 euro
- Pagamenti reali: non eseguiti
- Contatti esterni/email: non eseguiti

## Esito sintetico

- Check superati: 9
- Check falliti: 3
- Score riusciti: 300
- Raccomandazioni acquistabili: 280
- Acquisti tentati: 280
- Acquisti riusciti: 280
- Acquisti saltati per budget: 0
- Spesa/ricavo simulato: 408.9 euro
- Budget residuo: 41.1 euro
- Ricavo medio per score eseguito: 1.363 euro

## Mix

- Decisioni score: `{"buy_deep_analysis": 100, "watchlist": 20, "needs_verification": 140, "nurture": 40}`
- Raccomandazioni: `{"deep_analysis": 100, "verification": 140, "nurture_signal": 40}`
- Acquisti eseguiti: `{"deep_analysis": 100, "verification": 140, "nurture_signal": 40}`
- Saltati per budget: `{}`

## Ricavi simulati

- Score: 29.7 euro
- Add-on: 379.2 euro
- Totale: 408.9 euro

## Lettura business

Questo test è più realistico del funnel senza limiti, perché la macchina non compra ogni approfondimento possibile: si ferma quando il budget impostato non consente nuovi acquisti.

Il risultato serve a tarare il P&L: non dobbiamo usare la conversione tecnica massima, ma una conversione compatibile con budget cap, regole di priorità e rischio di spreco.

## Campione operativo

| # | Dominio | Score | Decisione | Next purchase | Stato acquisto | Speso |
|---:|---|---:|---|---|---|---:|
| 1 | quinta-essenza.com | 81 | buy_deep_analysis | deep_analysis | purchased | 3.089 |
| 2 | clinic3.it | 81 | buy_deep_analysis | deep_analysis | purchased | 6.178 |
| 3 | studio-odontoiatrico-demo.it | 61 | watchlist | None | not_recommended | 6.277 |
| 4 | avalonbenessere.it | 80 | buy_deep_analysis | deep_analysis | purchased | 9.366 |
| 5 | centromedico-besana.it | 81 | buy_deep_analysis | deep_analysis | purchased | 12.455 |
| 6 | vistavisiongroup.com | 63 | needs_verification | verification | purchased | 13.044 |
| 7 | bianchiosteopata.it | 63 | needs_verification | verification | purchased | 13.633 |
| 8 | example-dentist-milano.it | 75 | needs_verification | verification | purchased | 14.222 |
| 9 | demo-clinic-lombardia.it | 70 | nurture | nurture_signal | purchased | 14.611 |
| 10 | studio-legale-demo.it | 68 | nurture | nurture_signal | purchased | 15.0 |
| 11 | cogebra.com | 37 | needs_verification | verification | purchased | 15.589 |
| 12 | valcavallinaimmobili.it | 64 | needs_verification | verification | purchased | 16.178 |
| 13 | agenzia-immobiliare-demo.it | 78 | needs_verification | verification | purchased | 16.767 |
| 14 | centromedicosanpiox.it | 76 | buy_deep_analysis | deep_analysis | purchased | 19.856 |
| 15 | studiofamilydental.it | 76 | needs_verification | verification | purchased | 20.445 |
| 16 | quinta-essenza.com | 81 | buy_deep_analysis | deep_analysis | purchased | 23.534 |
| 17 | clinic3.it | 81 | buy_deep_analysis | deep_analysis | purchased | 26.623 |
| 18 | studio-odontoiatrico-demo.it | 61 | watchlist | None | not_recommended | 26.722 |
| 19 | avalonbenessere.it | 80 | buy_deep_analysis | deep_analysis | purchased | 29.811 |
| 20 | centromedico-besana.it | 81 | buy_deep_analysis | deep_analysis | purchased | 32.9 |

## Check tecnici

| Check | Esito | Dettaglio |
|---|---|---|
| beta_customer_created | OK | HTTP 200 |
| usage_before | OK | HTTP 200 |
| orders_readable | OK | HTTP 200 |
| usage_after | OK | HTTP 200 |
| scores_completed | OK | 300/300 |
| score_delta_expected | KO | delta=299 |
| purchase_failures_zero | OK | failures=0 |
| deep_analysis_delta_expected | KO | delta=99, purchases=100 |
| verification_delta_expected | KO | delta=139, purchases=140 |
| nurture_signal_delta_expected | OK | delta=40, purchases=40 |
| budget_not_exceeded | OK | spent=408.90, cap=450.00 |
| safety_flags | OK | beta flags must remain false |
