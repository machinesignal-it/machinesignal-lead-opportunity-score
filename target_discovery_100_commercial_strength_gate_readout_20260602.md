# MachineSignal - Lettura commercial strength gate

Data: 2026-06-02

## Obiettivo

Il test precedente aveva migliorato la confidence tecnica, ma mancava una lettura commerciale esplicita per la macchina cliente.

La domanda non era solo:

> questo target ha uno score?

Ma:

> quanto budget puo' spendere la macchina dopo questo score?

Abbiamo quindi aggiunto alla risposta API il blocco `commercial_strength`.

## Cosa restituisce ora la macchina

Ogni score contiene:

- `commercial_strength.level`: `strong`, `medium` o `weak`;
- `spend_policy`: regola di spesa consigliata;
- `allowed_next_products`: prodotti successivi ammessi;
- `reason`: motivo leggibile dalla macchina.

In pratica, la macchina cliente non riceve solo uno score. Riceve anche una regola operativa su cosa comprare dopo.

## Risultato test live 100 target

- Target caricati: 100
- Target segnati: 100
- Audit riconciliato: true
- Pagamenti reali: false
- Contatti esterni/email: false
- Ricavo simulato totale: 301.60 EUR
- Ricavo Target Discovery: 149.00 EUR
- Ricavo downstream: 152.60 EUR
- Downstream per target: 1.5260 EUR

## Segmentazione commerciale

| Strength | Target | Lettura |
|---|---:|---|
| strong | 4 | Target con segnale sufficiente per Deep Analysis e possibile Action Pack dopo conferma |
| medium | 47 | Target utilizzabili, ma con spesa limitata a Deep Analysis o Nurture Signal |
| weak | 49 | Target da watchlist, senza ulteriore spesa immediata |

## Acquisti beta generati

| Prodotto | Quantita' | Ricavo simulato |
|---|---:|---:|
| Target Discovery | 1 | 149.00 EUR |
| Score base | 100 | 9.90 EUR |
| Deep Analysis | 14 | 41.86 EUR |
| Nurture Signal | 37 | 37.00 EUR |
| Action Pack | 4 | 63.84 EUR |

## Lettura importante

Il gate commerciale non ha ridotto il ricavo rispetto al test ottimizzato precedente.

Questo significa che i 4 Action Pack comprati erano gia' coerenti con la fascia `strong`.

La modifica quindi aumenta la qualita' del controllo senza peggiorare il risultato economico.

## Cosa cambia nel modello di business

Prima vendevamo alla macchina:

- lista target;
- score;
- approfondimenti;
- action pack.

Ora vendiamo anche una cosa piu' forte:

- una regola di budget automatica.

Questo e' molto importante per un cliente macchina, perche' un CRM, un agente AI o un workflow non vuole solo sapere "chi e' interessante". Vuole sapere:

- quale target scartare;
- quale target tenere in watchlist;
- quale target nutrire a basso costo;
- quale target approfondire;
- quale target trasformare in azione commerciale preparata.

## Decisione

Esito: PASS.

Il commercial strength gate rende il prodotto piu' spiegabile e piu' vendibile a sistemi automatici.

## Prossimo passo consigliato

Non serve rilanciare subito un altro test identico.

Il prossimo passo utile e' aggiornare documentazione API, partner brief e business plan con questa logica:

- MachineSignal non vende solo dati;
- vende una decisione di spesa per macchine;
- ogni output dice alla macchina cosa comprare dopo e cosa non comprare;
- i crediti vengono consumati solo su output validi e tracciati.

Poi possiamo passare al test 250 target.
