# MachineSignal - Beta customer automatic purchase funnel test

- Data test: 2026-06-01T14:15:19
- Scenario: customer macchina controllato con score e acquisti automatici consigliati
- API key cliente: creata in memoria, non salvata nel report
- Pagamenti reali: non eseguiti
- Contatti esterni/email: non eseguiti

## Esito sintetico

- Check superati: 14
- Check falliti: 0
- Score richiesti: 100
- Score riusciti: 100
- Acquisti consigliati acquistabili: 93
- Acquisti automatici riusciti: 93
- Conversione score -> acquisto: 93.0%
- Fallimenti acquisto: 0
- Ordini leggibili: 93
- Extra addebito su acquisto duplicato: 0

## Mix decisioni

- Decisioni score: `{"buy_deep_analysis": 34, "watchlist": 7, "needs_verification": 45, "nurture": 14}`
- Next purchase suggeriti: `{"deep_analysis": 34, "verification": 45, "nurture_signal": 14}`
- Acquisti eseguiti: `{"deep_analysis": 34, "verification": 45, "nurture_signal": 14}`

## Consumo crediti

- Score Pack 1k: 100
- Deep Analysis Pack 100: 34
- Verification Pack 100: 45
- Nurture Signal Pack 100: 14

## Campione funnel

| # | Dominio | Score | Decisione | Next purchase | Acquisto automatico | Ordine |
|---:|---|---:|---|---|---|---|
| 1 | quinta-essenza.com | 81 | buy_deep_analysis | deep_analysis | OK | ord_543768ec |
| 2 | clinic3.it | 81 | buy_deep_analysis | deep_analysis | OK | ord_78b72f18 |
| 3 | studio-odontoiatrico-demo.it | 61 | watchlist | - | - | - |
| 4 | avalonbenessere.it | 80 | buy_deep_analysis | deep_analysis | OK | ord_a3a1329e |
| 5 | centromedico-besana.it | 81 | buy_deep_analysis | deep_analysis | OK | ord_fdb934c7 |
| 6 | vistavisiongroup.com | 63 | needs_verification | verification | OK | ord_23278431 |
| 7 | bianchiosteopata.it | 63 | needs_verification | verification | OK | ord_2709b0c4 |
| 8 | example-dentist-milano.it | 75 | needs_verification | verification | OK | ord_242e2bc |
| 9 | demo-clinic-lombardia.it | 70 | nurture | nurture_signal | OK | ord_5d6440a2 |
| 10 | studio-legale-demo.it | 68 | nurture | nurture_signal | OK | ord_39a7a9f1 |
| 11 | cogebra.com | 37 | needs_verification | verification | OK | ord_cc798fe8 |
| 12 | valcavallinaimmobili.it | 64 | needs_verification | verification | OK | ord_1d875c0 |
| 13 | agenzia-immobiliare-demo.it | 78 | needs_verification | verification | OK | ord_a583addd |
| 14 | centromedicosanpiox.it | 76 | buy_deep_analysis | deep_analysis | OK | ord_ccc886e2 |
| 15 | studiofamilydental.it | 76 | needs_verification | verification | OK | ord_a15a8dfb |

## Lettura business

Il test misura la parte piu importante del modello machine-to-machine: non basta che una macchina chieda uno score, deve anche poter comprare automaticamente il passo successivo quando lo score lo giustifica.

In questa prova il cliente macchina ha eseguito gli score, letto `next_purchase`, creato ordini beta per i prodotti consigliati e recuperato le consegne via API. La conversione score -> acquisto puo ora essere usata per aggiornare il P&L e stimare il ROI del funnel.

## Check tecnici

| Check | Esito | Dettaglio |
|---|---|---|
| beta_customer_created | OK | HTTP 200 |
| usage_before | OK | HTTP 200 |
| duplicate_purchase_not_double_charged | OK | HTTP 200, delta=0 |
| duplicate_purchase_usage_reads_ok | OK | before=200, after=200 |
| orders_readable | OK | HTTP 200, count=93 |
| single_order_delivery_readable | OK | HTTP 200 |
| usage_after | OK | HTTP 200 |
| all_scores_successful | OK | 100/100 |
| score_delta_expected | OK | delta=100 |
| purchase_failures_zero | OK | failures=0 |
| deep_analysis_delta_expected | OK | delta=34, purchases=34 |
| verification_delta_expected | OK | delta=45, purchases=45 |
| nurture_signal_delta_expected | OK | delta=14, purchases=14 |
| safety_flags | OK | beta flags must remain false |
