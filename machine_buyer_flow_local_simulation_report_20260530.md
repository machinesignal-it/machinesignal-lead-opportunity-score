# MachineSignal - Machine buyer flow simulation

- Data test: 2026-05-30T13:59:04.442Z
- Ambito: local Worker logic with fresh in-memory ledger, same core API code
- Pagamenti reali: non eseguiti
- Contatti esterni/email: non eseguiti

## Esito sintetico

- Check superati: 18
- Check falliti: 0
- Target discovery comprati: 1
- Score consumati: 5
- Deep Analysis comprati: 2
- Verification comprati: 3
- Extra addebiti da score duplicato: 0

## Decisioni sui target

| Target | Dominio | Score | Confidence | Decisione | Quality | Azione macchina | Ordine |
|---|---|---:|---:|---|---|---|---|
| QuintaEssenza | quinta-essenza.com | 81 | 0.79 | buy_deep_analysis | sector_quality_passed | buy_deep_analysis | deep_opportunity_analysis |
| NeoClinic | bianchiosteopata.it | 63 | 0.49 | needs_verification | sector_mismatch_needs_verification | buy_verification | data_quality_verification |
| Vista Vision | vistavisiongroup.com | 63 | 0.49 | needs_verification | sector_mismatch_needs_verification | buy_verification | data_quality_verification |
| Avalon | avalonbenessere.it | 80 | 0.68 | buy_deep_analysis | sector_quality_passed | buy_deep_analysis | deep_opportunity_analysis |
| Centro Medico Besana | centromedico-besana.it | 80 | 0.35 | needs_verification | sector_quality_passed | buy_verification | data_quality_verification |

## Lettura business

Il test dimostra il comportamento che vogliamo vendere alle macchine: la macchina non compra tutto. Prima chiede target discovery se non ha una lista, poi scorea, poi compra verification quando il dato e ambiguo e deep analysis quando il lead e forte.

## Nota live

La prova live parziale ha confermato score, verification, deep analysis, ordini e ledger. Il flusso target discovery live completo richiede una beta key fresca o una chiave admin, perche la chiave demo corrente ha esaurito alcuni crediti beta.

## Check tecnici

| Check | Esito | Dettaglio |
|---|---|---|
| public_root_available | OK | HTTP 200 |
| machine_onboarding_available | OK | HTTP 200 |
| openapi_has_purchase_intent | OK | HTTP 200 |
| usage_before_available | OK | HTTP 200 |
| target_discovery_order_created | OK | HTTP 200 |
| score_1_created | OK | quinta-essenza.com HTTP 200 |
| order_1_deep_analysis | OK | quinta-essenza.com HTTP 200 |
| score_2_created | OK | bianchiosteopata.it HTTP 200 |
| order_2_verification | OK | bianchiosteopata.it HTTP 200 |
| score_3_created | OK | vistavisiongroup.com HTTP 200 |
| order_3_verification | OK | vistavisiongroup.com HTTP 200 |
| score_4_created | OK | avalonbenessere.it HTTP 200 |
| order_4_deep_analysis | OK | avalonbenessere.it HTTP 200 |
| score_5_created | OK | centromedico-besana.it HTTP 200 |
| order_5_verification | OK | centromedico-besana.it HTTP 200 |
| duplicate_score_not_double_charged | OK | HTTP 200 |
| usage_after_available | OK | HTTP 200 |
| orders_readable | OK | HTTP 200 |
