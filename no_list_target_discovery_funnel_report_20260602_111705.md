# MachineSignal - No-list Target Discovery funnel test

- Data test: 2026-06-02T11:17:05
- Customer: `no_list_discovery_20260602_111704`
- Pagamenti reali: non eseguiti
- Contatti esterni/email: non eseguiti

## Esito sintetico

- Target Discovery order: `ord_2dfed196`
- Target beta restituiti: 3
- Score completati: 3
- Ordini registrati: 3
- Ledger backend: `durable_object`
- Audit riconciliato: `True`
- Ricavo simulato totale: 151.3 EUR
- Ricavo Target Discovery: 149.0 EUR
- Ricavo downstream dopo discovery: 2.3 EUR
- Ricavo downstream per target segnato: 0.7667 EUR

## Mix

- Decisioni score: `{"watchlist": 1, "needs_verification": 2}`
- Next product raccomandati: `{"verification": 2}`
- Acquisti eseguiti: `{"target_discovery": 1, "verification": 2}`

## Lettura commerciale

Questo test valida il flusso in cui il cliente macchina non ha una lista iniziale. La macchina compra prima Target Discovery, poi usa i target restituiti per chiamare lo score e acquistare eventuali add-on.

La limitazione attuale e' importante: in beta l'API restituisce solo target sintetici di esempio, non ancora una lista reale di 250 target. Il test quindi valida il flusso machine-to-machine e il ledger, ma non ancora la capacita' reale di scouting del mercato.

## Riconciliazione prodotti

| Prodotto ledger | Crediti usati | Ordini | Ricavo simulato | OK |
|---|---:|---:|---:|---|
| score_pack_1k | 3 | 0 | 0.3 | True |
| deep_analysis_pack_100 | 0 | 0 | 0 | True |
| verification_pack_100 | 2 | 2 | 2 | True |
| nurture_signal_pack_100 | 0 | 0 | 0 | True |
| action_pack_25 | 0 | 0 | 0 | True |
| target_discovery_pack_250 | 1 | 1 | 149 | True |
| domain_enrichment_pack_100 | 0 | 0 | 0 | True |
| opportunity_feed_monthly | 0 | 0 | 0 | True |

## Campione operativo

| Stage | Dominio | Score | Conf. | Decisione | Prodotto | Note |
|---|---|---:|---:|---|---|---|
| target_discovery |  |  |  |  | target_discovery | accepted_beta_order_intent |
| score | dentist-milano-e-lombardia-candidate-01.example | 49 | 0.52 | watchlist |  |  |
| score | dentist-milano-e-lombardia-candidate-02.example | 62 | 0.38 | needs_verification | verification |  |
| purchase | dentist-milano-e-lombardia-candidate-02.example | 62 | 0.38 | needs_verification | verification |  |
| score | dentist-milano-e-lombardia-candidate-03.example | 75 | 0.46 | needs_verification | verification |  |
| purchase | dentist-milano-e-lombardia-candidate-03.example | 75 | 0.46 | needs_verification | verification |  |

## Check

| Check | Esito | Dettaglio |
|---|---|---|
| beta_customer_created | OK | HTTP 200 |
| target_discovery_purchased | OK | HTTP 200, order=ord_2dfed196 |
| target_discovery_returned_targets | OK | targets=3 |
| audit_readable | OK | HTTP 200 |
| score_failures_zero | OK | failures=0 |
| purchase_failures_zero | OK | failures=0 |
| audit_reconciliation_ok | OK | True |
| safety_flags_false | OK | {"real_payment_executed": false, "external_contact_executed": false, "beta_payment_guardrail_ok": true, "beta_external_contact_guardrail_ok": true} |
