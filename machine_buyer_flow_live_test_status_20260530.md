# MachineSignal - Test live machine buyer completato

Data: 2026-05-30

## Esito

Test live completato con successo.

- Check superati: 22 su 22
- Check falliti: 0
- Endpoint testato: `https://machinesignal-api.beta-878.workers.dev`
- Cliente beta live creato tramite endpoint admin
- Chiavi usate: non stampate e non salvate in chiaro nel report
- Pagamenti reali: non eseguiti
- Email o contatti esterni: non eseguiti

## Cosa ha fatto la macchina cliente

1. Ha letto i contratti pubblici dell'API: root, `machine-onboarding.json` e OpenAPI.
2. Non avendo una lista iniziale, ha comprato un `target_discovery`.
3. Ha scoreato 5 target reali della nicchia medicina estetica.
4. Ha comprato `deep_analysis` solo sui target forti.
5. Ha comprato `verification` sui target ambigui.
6. Ha controllato usage, crediti, ordini e consegne beta via API.

## Consumi verificati

- Target discovery consumati: 1
- Score consumati: 5
- Extra addebiti da score duplicato: 0
- Deep analysis comprati: 2
- Verification comprate: 3
- Ledger crediti persistente: confermato

## Lettura business

Il test conferma il comportamento che vogliamo vendere: una macchina non compra una lista generica e non parla con un commerciale umano. Legge la documentazione, capisce cosa puo' chiedere, compra un primo servizio di discovery se non ha una lista, poi consuma score e compra approfondimenti solo quando l'API glielo consiglia.

Questo rende il modello piu' forte perche' il cliente macchina acquista decisioni operative a piccoli step controllati dai crediti, invece di comprare un abbonamento generico o un report manuale.

## Limiti ancora aperti

- Checkout reale non ancora attivo.
- Deep Analysis completo non ancora generato automaticamente come report finale.
- Signup pubblica self-service ancora da costruire.
- Serve rendere piu' evidente nella documentazione pubblica il flusso "no human contact".

## Report tecnico completo

Report live generato qui:

`C:\Users\natal\AppData\Local\Temp\MachineSignal\machine_buyer_flow_live_test\machine_buyer_flow_live_test_20260530_165439.md`

JSON tecnico generato qui:

`C:\Users\natal\AppData\Local\Temp\MachineSignal\machine_buyer_flow_live_test\machine_buyer_flow_live_test_20260530_165439.json`

