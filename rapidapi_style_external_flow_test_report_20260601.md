# MachineSignal - RapidAPI-style external flow test

Data test: 2026-06-01T13:32:13

## Obiettivo

Simulare una macchina esterna che arriva da un contesto tipo RapidAPI/API marketplace, senza usare chiavi preesistenti e senza intervento commerciale umano.

La macchina ha eseguito questo flusso:

1. legge il provider setup pubblico;
2. legge il listing RapidAPI pubblico;
3. legge la Postman public collection;
4. crea una sandbox key pubblica;
5. usa la sandbox key per onboarding autenticato;
6. ordina Target Discovery beta;
7. scorea un dominio;
8. ripete lo score con lo stesso Idempotency-Key per verificare che non venga addebitato due volte;
9. ordina Deep Analysis beta;
10. ordina Action Pack beta;
11. legge gli ordini;
12. legge un singolo ordine;
13. verifica usage e safety flag.

## Esito sintetico

- Check superati: 19
- Check falliti: 0
- Score credit delta: 1
- Target Discovery credit delta: 1
- Deep Analysis credit delta: 1
- Action Pack credit delta: 1
- Ordini letti: 3
- Score: 81
- Decisione score: buy_deep_analysis
- Next purchase: deep_analysis
- Pagamento reale eseguito: false
- Contatto esterno eseguito: false

## Ordini creati

- Target Discovery: ord_8ae1f1ca
- Deep Analysis: ord_78e1fd78
- Action Pack: ord_b3be73f8

## Metriche sandbox dopo il test

- Sandbox totali: 5
- Sandbox attive: 5
- Score usati: 4
- Target Discovery usati: 4
- Deep Analysis usati: 4
- Action Pack usati: 4
- Ordini totali: 12
- Progress sandbox key: 50%
- Progress score: 1.3%
- Progress Deep Analysis: 26.7%
- Progress Action Pack: 100%
- Safety OK: true

## Lettura business

Il test dimostra che il funnel tecnico regge anche partendo da una superficie stile RapidAPI: la macchina legge il setup pubblico, crea una sandbox key, consuma crediti beta e recupera consegne via API.

Questo non prova ancora la vendita monetizzata su RapidAPI, ma prova la parte essenziale prima della vendita: una macchina puo capire cosa comprare e completare il flusso senza una trattativa umana.

## Cosa resta aperto

- Pubblicazione effettiva su RapidAPI marketplace.
- Checkout reale, volutamente disattivato in beta.
- Decisione se pubblicare in bozza/unlisted o aspettare altri giorni di sandbox metrics.
- Aumento del volume score, perche al momento la metrica score e ancora bassa rispetto al target a 7 giorni.

## Decisione consigliata

Non pubblicare ancora monetizzato.

Continuare il test sandbox e aumentare il numero di score validi, per capire se la macchina usa davvero il prodotto nel modo previsto: score -> Deep Analysis -> Action Pack -> orders.
