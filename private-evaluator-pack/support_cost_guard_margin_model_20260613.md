# Support cost guard margin model

Date: 2026-06-13

## Obiettivo

Stimare i margini minimi prima di vendere davvero.

Questo modello non attiva:

- pagamenti;
- fatture;
- chiamate paid esterne;
- dati reali;
- contatti esterni.

## Regola generale

Prima del live ogni prodotto deve dimostrare:

- costo misurabile per output valido;
- credito consumato solo su output valido;
- idempotenza e protezione duplicati;
- stop automatico se il costo supera la soglia;
- margine sufficiente anche includendo il costo crediti agenti.

Target:

- margine lordo minimo: 70%;
- margine minimo dopo costo agenti: 55%;

## Prodotti

| Prodotto | Prezzo planning | Costo max | Margine stimato | Stato |
|---|---:|---:|---:|---|
| Target Discovery Pack 250 | 149 EUR | 65 EUR | 56% | needs cost reduction or price review |
| Score Pack 1k | 99 EUR | 33 EUR | 67% | close to margin target |
| Deep Analysis Pack 100 | 249 EUR | 106 EUR | 57% | needs cost reduction or price review |
| Action Pack 25 | 149 EUR | 45 EUR | 70% | meets margin target |

## Lettura semplice

Il prodotto piu' interessante per partire, dal punto di vista margine, e' **Action Pack 25**, ma solo se viene venduto dopo Deep Analysis.

Il prodotto piu' scalabile e' **Score Pack 1k**, ma deve dimostrare costo per score molto basso.

**Target Discovery** e **Deep Analysis** sono utili commercialmente, ma prima del live richiedono riduzione costi o revisione prezzo.

## Stop rule globale

Fermare il live se:

- pagamento reale prima dell'approvazione;
- fattura prima dell'approvazione;
- chiamata paid esterna senza budget;
- costo agenti non misurabile per output valido;
- output validi sotto 85%;
- costo prodotto sopra soglia;
- idempotenza non funziona;
- dati reali o personali appaiono in test;
- Cloudflare 429.

## Prossimo step

**margin_model_agent_review**

Far rivedere il modello agli agenti Admin, API Product, Sales Ops e Legal per decidere se i prezzi sono sostenibili o se serve cambiare listino prima del live.
