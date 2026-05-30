# Riunione agenti - Machine buyer flow

Data: 2026-05-30

## Contesto

Obiettivo: verificare se il modello MachineSignal regge come flusso venduto alle macchine, non agli umani.

Scenario testato:

1. La macchina non ha una lista iniziale.
2. Legge il contratto pubblico della API.
3. Compra un Target Discovery Pack.
4. Scorea target reali.
5. Compra Verification sui casi ambigui.
6. Compra Deep Analysis sui casi forti.
7. Controlla ledger, ordini e duplicati via API.

## Esito test

Il test locale sul codice Worker aggiornato e passato:

- check superati: 18;
- check falliti: 0;
- target discovery comprati: 1;
- score consumati: 5;
- deep analysis comprati: 2;
- verification comprati: 3;
- extra addebiti da richiesta duplicata: 0;
- pagamenti reali: non eseguiti;
- contatti esterni/email: non eseguiti.

La prova live parziale ha confermato score, ordini, verification, deep analysis e ledger. Il flusso live completo richiede una beta key fresca o una chiave admin, perche la chiave demo corrente ha esaurito alcuni crediti beta e non consente creazione customer.

## Parere agenti

### Orchestratore

Il test e soddisfacente per dimostrare il concetto: la macchina puo passare da richiesta generica a decisione di acquisto senza intervento umano.

### API Product Manager

La sequenza endpoint e corretta:

- `GET /machine-onboarding.json`
- `POST /v1/purchase-intent` per target discovery
- `POST /v1/lead-opportunity-score`
- `POST /v1/purchase-intent` per verification/deep analysis
- `GET /v1/orders`
- `GET /v1/usage`

Manca ancora una vera consegna completa del Deep Analysis, oggi rappresentata da beta order intent.

### Scoring Optimizer

La logica e migliorata: i casi ambigui non comprano Deep Analysis, ma Verification. Questo riduce spreco di crediti e rende il comportamento piu credibile per una macchina cliente.

### Data Quality & Compliance

Il test non invia email, non contatta target esterni e non fa pagamento reale. Questo e coerente con la fase senza partita IVA e con il modello beta.

### Revenue Offer Architect

Il flusso commerciale e piu forte del semplice Score Pack, perche vende una sequenza:

- target discovery se manca la lista;
- score per priorita;
- verification per casi incerti;
- deep analysis per casi forti.

Questa sequenza e piu monetizzabile perche ogni step ha una ragione economica.

### Admin & Finance Controller

Il prossimo blocco da risolvere e amministrativo/operativo: servono crediti beta separati per ogni customer test, oppure una funzione admin sicura per creare customer e ricaricare crediti senza toccare manualmente il ledger.

### Legal & Privacy Governance

Il test resta in area sicura perche non tratta dati personali sensibili, non invia comunicazioni commerciali e non esegue pagamenti. Prima del checkout reale serviranno termini API, policy beta e condizioni di uso piu esplicite.

## Decisione

Il flusso e validato a livello prodotto e logica commerciale.

Non e ancora validato al 100% come beta live self-service perche manca:

- una chiave admin operativa salvata in modo sicuro;
- creazione customer live autonoma;
- ricarica/reset crediti beta;
- consegna reale del Deep Analysis.

## Prossimo passo consigliato

Costruire la funzione operativa per gestire i customer beta:

- creare customer test;
- assegnare crediti;
- leggere usage;
- ricaricare crediti beta;
- bloccare customer in caso di abuso;
- generare report automatico.

Questo e il prossimo pezzo necessario per continuare i test senza consumare o bloccare la chiave demo principale.
