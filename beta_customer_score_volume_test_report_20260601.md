# MachineSignal - Beta customer score volume test

Data test: 2026-06-01T13:59:13

## Obiettivo

Simulare un cliente macchina controllato con piu volume rispetto alla sandbox pubblica.

La sandbox pubblica ha dimostrato di funzionare, ma ha un limite anti-abuso intenzionale. Questo test usa una beta customer key creata dagli agenti tramite admin API, con piu crediti score, per capire se lo score endpoint regge un volume piu realistico.

## Esito sintetico

- Check superati: 7
- Check falliti: 0
- Customer beta: beta_volume_20260601_135904
- Piano: beta_volume_test
- Score richiesti: 50
- Score riusciti: 50
- Score credit delta: 50
- Extra addebiti duplicati: 0
- Pagamenti reali: non eseguiti
- Contatti esterni/email: non eseguiti

## Bilancio crediti customer

- Score credits acquistati/test: 55
- Score credits usati: 50
- Score credits residui: 5

## Decisioni generate

- buy_deep_analysis: 15
- watchlist: 5
- needs_verification: 20
- nurture: 10

## Next purchase generati

- deep_analysis: 15
- verification: 20
- nurture_signal: 10

## Campione score

| # | Dominio | Score | Decisione | Next purchase | Credito |
|---:|---|---:|---|---|---:|
| 1 | quinta-essenza.com | 81 | buy_deep_analysis | deep_analysis | 1 |
| 2 | clinic3.it | 81 | buy_deep_analysis | deep_analysis | 1 |
| 3 | studio-odontoiatrico-demo.it | 61 | watchlist | - | 1 |
| 4 | avalonbenessere.it | 80 | buy_deep_analysis | deep_analysis | 1 |
| 5 | centromedico-besana.it | 80 | needs_verification | verification | 1 |
| 6 | vistavisiongroup.com | 63 | needs_verification | verification | 1 |
| 7 | bianchiosteopata.it | 63 | needs_verification | verification | 1 |
| 8 | example-dentist-milano.it | 75 | needs_verification | verification | 1 |
| 9 | demo-clinic-lombardia.it | 70 | nurture | nurture_signal | 1 |
| 10 | studio-legale-demo.it | 68 | nurture | nurture_signal | 1 |
| 11 | quinta-essenza.com | 81 | buy_deep_analysis | deep_analysis | 1 |
| 12 | clinic3.it | 81 | buy_deep_analysis | deep_analysis | 1 |

## Lettura business

Il limite principale non e tecnico sullo score endpoint. Con una beta customer key controllata il sistema ha gestito 50 score consecutivi senza errori, senza doppio addebito e senza azioni esterne.

La sandbox pubblica resta adatta a discovery e prova iniziale. Il test ROI/volume, invece, deve essere fatto con customer key controllate o piani API dedicati.

## Implicazione commerciale

Per vendere alle macchine, il percorso sensato e:

1. sandbox pubblica per far capire il prodotto;
2. beta customer key controllata per test di volume;
3. piano API quando il cliente macchina dimostra uso ricorrente;
4. marketplace/API directory solo dopo metriche sufficienti.

## Prossimo passo consigliato

Eseguire un test volume misto:

- 100 score su beta customer;
- acquisto automatico solo dove `next_purchase` consiglia Deep Analysis o Verification;
- lettura ordini;
- controllo rapporto score -> acquisti.

Questo e il test piu vicino al P&L, perche misura quante richieste score generano acquisti successivi.
