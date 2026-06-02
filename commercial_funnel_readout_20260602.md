# MachineSignal - Lettura commerciale dei test API

Data: 2026-06-02

## Sintesi

I test confermano che la parte tecnica del funnel regge: la macchina chiama l'API, riceve uno score, compra gli approfondimenti suggeriti, il ledger registra crediti e ordini, e l'audit riconcilia tutto.

La lettura commerciale e' diversa: il valore economico non nasce dallo score base, ma dagli add-on acquistati dopo lo score. Lo score serve come porta di ingresso e come filtro. Il margine vero nasce quando la macchina compra `deep_analysis`, `verification`, `nurture_signal` e soprattutto `action_pack`.

## Risultati comparati

| Test | Score | Acquisti | Ricavo simulato | Ricavo medio per score | Note |
|---|---:|---:|---:|---:|---|
| Fresh audit | 6 | 6 | 25.53 EUR | 4.255 EUR | Campione troppo piccolo, utile solo come test funzionale |
| Medium audit | 50 | 39 | 111.75 EUR | 2.235 EUR | Campione piu' utile per valutare il mix prodotti |
| Stress test | 300 | 280 | 408.90 EUR | 1.363 EUR | Utile per stabilita', meno preciso per pricing commerciale |

## Dettaglio test medio da 50 score

| Prodotto | Quantita' | Ricavo simulato | Peso sul ricavo totale | Lettura commerciale |
|---|---:|---:|---:|---|
| Score Pack 1k | 50 score usati | 4.95 EUR | 4.4% | Prezzo basso: serve come accesso al sistema, non come driver principale |
| Deep Analysis | 4 | 11.96 EUR | 10.7% | Buon prodotto intermedio, ma va collegato meglio all'Action Pack |
| Verification | 21 | 21.00 EUR | 18.8% | Alto volume, prezzo basso: utile per pulizia e rischio, non per margine alto |
| Nurture Signal | 10 | 10.00 EUR | 8.9% | Utile per non scartare lead deboli, ma va misurato il valore futuro |
| Action Pack | 4 | 63.84 EUR | 57.1% | Driver economico principale del test |

## Cosa significa

Il modello non deve essere presentato come "vendiamo solo score".

Il modello corretto e':

1. La macchina chiede dati, score o priorita' commerciali.
2. Lo score decide cosa fare del target.
3. Se il target merita attenzione, la macchina compra un approfondimento.
4. Se l'approfondimento e' davvero utile, la macchina compra un pacchetto operativo.
5. Il pacchetto operativo trasforma il dato in azione: priorita', ragione commerciale, prossima mossa, messaggio, tag CRM, rischio e istruzioni operative.

Quindi vendiamo un flusso decisionale machine-to-machine, non una semplice lista e non un report generico.

## Punto forte

Il funnel ha un meccanismo economico interessante: lo score costa poco, quindi puo' essere consumato in volume; gli add-on costano di piu' e vengono acquistati solo quando la macchina trova un motivo valido.

Questo e' coerente con un cliente macchina: la macchina non vuole parlare con un commerciale, vuole una risposta utile, misurabile e comprabile via API.

## Punto debole da validare

L'`Action Pack` e' il prodotto che fa salire molto il ricavo medio per score. Nel test medio ha generato 63.84 EUR su 111.75 EUR, cioe' oltre meta' del ricavo simulato.

Questo e' positivo, ma va trattato con prudenza: dobbiamo verificare che l'acquisto dell'Action Pack avvenga in modo naturale, quando il deep analysis produce davvero un'indicazione forte, e non per una regola di test troppo generosa.

## Rischio commerciale

Se il cliente macchina compra solo score e verification, il ricavo per score rimane basso.

Se invece compra anche deep analysis e action pack nei casi giusti, il funnel diventa molto piu' interessante.

Per questo il prossimo test non deve misurare solo se l'API funziona. Deve misurare se la macchina ha una ragione forte per comprare il prodotto successivo.

## Prossimo test consigliato

Eseguire un test da 100 score con acquisto naturale degli add-on.

Regole consigliate:

1. La macchina compra lo score.
2. Compra `deep_analysis` solo se lo score supera una soglia chiara.
3. Compra `verification` solo se il dubbio e' specifico e utile.
4. Compra `nurture_signal` solo se il lead non e' pronto ma non va scartato.
5. Compra `action_pack` solo se il `deep_analysis` restituisce una motivazione commerciale forte.

Obiettivo del test:

- misurare il tasso naturale di conversione da score ad add-on;
- capire quanti deep analysis diventano Action Pack;
- verificare se il ricavo medio per score rimane sopra 1.50 EUR senza forzature;
- capire se Verification genera valore o se rischia di essere solo una voce di costo;
- produrre un report commerciale usabile nel business plan e nel partner brief.

## Decisione operativa

La tecnologia e' sufficientemente stabile per continuare.

Prima di parlare di vendita reale, serve ancora un test commerciale piu' pulito:

- 100 score;
- acquisti add-on non forzati;
- audit finale;
- report su ricavo medio, mix prodotti e motivazioni di acquisto.

Se questo test conferma un ricavo medio per score superiore a 1.50 EUR e un Action Pack acquistato solo quando ha valore chiaro, il modello diventa molto piu' credibile per beta partner, marketplace API e documentazione machine-readable.
