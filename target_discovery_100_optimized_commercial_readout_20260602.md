# MachineSignal - Lettura commerciale test 100 target ottimizzato

Data: 2026-06-02

## Cosa e' stato ottimizzato

Il test precedente da 100 target aveva un problema chiaro:

- 45 target su 100 finivano in `needs_verification`;
- tutti i 45 avevano `confidence < 0.50`;
- nessuno aveva un vero problema di qualita' target;
- lo scoring non valorizzava abbastanza i segnali gia' prodotti dal Target Discovery.

Abbiamo quindi aggiornato lo scoring:

- se il target arriva da discovery con `sector_match`;
- se ha `business_domain_present`;
- se ha fonte ufficiale o pubblica valutabile;
- se il settore e' coerente con dentisti/odontoiatria;
- allora la confidence viene alzata in modo prudente prima della decisione.

La modifica non riguarda target generici o senza evidenza.

## Risultato test ottimizzato

- Target caricati: 100
- Target segnati: 100
- Ordini beta registrati: 56
- Audit riconciliato: true
- Pagamenti reali: false
- Contatti esterni/email: false
- Ricavo simulato totale: 301.60 EUR
- Ricavo Target Discovery: 149.00 EUR
- Ricavo downstream: 152.60 EUR
- Downstream per target: 1.5260 EUR

## Confronto prima / dopo

| Metrica | Test 100 precedente | Test 100 ottimizzato | Lettura |
|---|---:|---:|---|
| Downstream per target | 1.4969 EUR | 1.5260 EUR | Migliora e torna sopra soglia |
| Ricavo downstream | 149.69 EUR | 152.60 EUR | +2.91 EUR |
| Verification rate | 45% | 0% | Problema risolto, forse in modo troppo netto |
| Deep Analysis rate | 9% | 14% | Migliora |
| Action Pack rate su target | 3% | 4% | Raggiunge la soglia minima desiderata |
| Deep -> Action Pack | 33.33% | 28.57% | Scende leggermente |
| Ordini beta | 78 | 56 | Meno ordini, ma piu' puliti |

## Mix decisioni ottimizzato

| Decisione | Quantita' | Percentuale | Lettura |
|---|---:|---:|---|
| buy_deep_analysis | 14 | 14% | Migliora rispetto al 9% precedente |
| nurture | 37 | 37% | Molti target diventano recuperabili a basso costo |
| watchlist | 49 | 49% | Molti target vengono salvati senza spesa immediata |
| needs_verification | 0 | 0% | Il problema di confidence e' stato eliminato per target con evidenza forte |

## Mix acquisti ottimizzato

| Prodotto | Quantita' | Ricavo simulato |
|---|---:|---:|
| Target Discovery | 1 | 149.00 EUR |
| Score base | 100 | 9.90 EUR |
| Deep Analysis | 14 | 41.86 EUR |
| Verification | 0 | 0.00 EUR |
| Nurture Signal | 37 | 37.00 EUR |
| Action Pack | 4 | 63.84 EUR |

## Lettura semplice

L'ottimizzazione ha funzionato:

- il test torna sopra la soglia minima di 1.50 EUR per target;
- il tasso Action Pack arriva al 4%;
- il tasso Deep Analysis sale al 14%;
- l'audit resta pulito.

Pero' il miglioramento economico non e' enorme.

Questo significa che il vero limite non era solo `verification`. Il limite e':

> molti target sono validi da valutare, ma non abbastanza forti da comprare subito Deep Analysis o Action Pack.

## Decisione commerciale

Esito: PASS MIGLIORATO, MA NON ANCORA VALIDAZIONE PIENA A 250.

Il test ottimizzato giustifica un passaggio successivo, ma non ancora una vendita piena del pacchetto da 250 senza altre cautele.

## Cosa fare prima di scalare a 250

Serve migliorare la qualita' commerciale del Target Discovery, non solo la confidence tecnica.

Il prossimo test dovrebbe filtrare i 100 target prima dello score usando segnali piu' forti, per esempio:

- sito ufficiale chiaramente attivo;
- servizi ad alto valore visibili;
- sito con possibile frizione commerciale;
- presenza locale chiara;
- struttura piu' commerciale rispetto al singolo professionista;
- esclusione di domini troppo generici o poco informativi.

## Prossimo passo consigliato

Creare un filtro `commercial_strength` nel Target Discovery:

- `strong`: mandare allo score subito;
- `medium`: mandare allo score ma limitare add-on;
- `weak`: watchlist o enrichment, non score immediato.

Poi rilanciare un test da 100 solo sui target `strong` e `medium`.

Obiettivo:

- downstream per target sopra 1.70 EUR;
- Action Pack rate almeno 5%;
- Deep Analysis rate almeno 15%;
- watchlist sotto 40%;
- verification non oltre 10-15%, non necessariamente zero.

## Stato roadmap

- API e ledger: validati;
- audit: validato;
- Action Pack naturale: validato;
- no-list flow: validato;
- Target Discovery 50: positivo;
- Target Discovery 100: borderline;
- Target Discovery 100 ottimizzato: sopra soglia, ma ancora da rafforzare;
- prossimo blocco: filtro commerciale dei target prima dello score.
