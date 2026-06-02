# MachineSignal - Lettura commerciale test 100 target dentisti Lombardia

Data: 2026-06-02

## Risultato

Il test da 100 target e' riuscito tecnicamente.

La macchina ha eseguito il flusso:

1. Target Discovery acquistato;
2. 100 target caricati e deduplicati;
3. 100 domini segnati;
4. add-on acquistati dove raccomandati;
5. Action Pack acquistato solo con gate prudente;
6. audit finale riconciliato.

## Numeri principali

- Target caricati: 100
- Target segnati: 100
- Ordini beta registrati: 78
- Audit riconciliato: true
- Pagamenti reali: false
- Contatti esterni/email: false
- Ricavo simulato totale: 298.69 EUR
- Ricavo Target Discovery: 149.00 EUR
- Ricavo downstream dopo discovery: 149.69 EUR
- Ricavo downstream per target: 1.4969 EUR

## Mix decisioni

| Decisione | Quantita' | Percentuale | Lettura |
|---|---:|---:|---|
| buy_deep_analysis | 9 | 9% | Target forti, ma meno del test da 50 |
| needs_verification | 45 | 45% | Troppo alto per scalare senza ottimizzazione |
| nurture | 20 | 20% | Buon serbatoio basso costo |
| watchlist | 26 | 26% | Target da non monetizzare subito |

## Mix acquisti

| Prodotto | Quantita' | Ricavo simulato |
|---|---:|---:|
| Target Discovery | 1 | 149.00 EUR |
| Score base | 100 | 9.90 EUR |
| Deep Analysis | 9 | 26.91 EUR |
| Verification | 45 | 45.00 EUR |
| Nurture Signal | 20 | 20.00 EUR |
| Action Pack | 3 | 47.88 EUR |

## Confronto con Mini 50

| Metrica | Mini 50 | Test 100 | Lettura |
|---|---:|---:|---|
| Downstream per target | 1.7562 EUR | 1.4969 EUR | Il 100 scende sotto/pari soglia |
| Deep Analysis rate | 12% | 9% | Peggiora leggermente |
| Action Pack rate su target | 4% | 3% | Accettabile ma basso |
| Deep -> Action Pack | 33.33% | 33.33% | Stabile |
| Verification rate | 48% | 45% | Migliora poco, resta alto |

## Lettura semplice

Il test da 100 conferma che il flusso regge, ma dice anche che non dobbiamo correre subito verso il pacchetto da 250.

Il dato piu' importante e':

> downstream per target = 1.4969 EUR.

La nostra soglia prudente era 1.50 EUR. Siamo praticamente sulla soglia, non nettamente sopra.

Quindi il modello non e' bocciato, ma non e' ancora abbastanza forte da scalare automaticamente a 250 target senza ottimizzazione.

## Cosa ci piace

Il flusso machine-to-machine continua a funzionare:

- 100 score completati;
- 78 ordini beta;
- ledger riconciliato;
- 3 Action Pack acquistati;
- nessun pagamento reale;
- nessun contatto esterno.

Il tasso Deep Analysis -> Action Pack resta stabile al 33.33%, come nel Mini 50. Questo e' un buon segnale: quando un target arriva a Deep Analysis, una parte concreta puo' diventare Action Pack.

## Cosa non ci piace

Verification resta troppo alta: 45 target su 100.

Questo indica che molti target sono valutabili, ma il sistema non ha abbastanza fiducia per portarli a Deep Analysis o Action Pack.

Per un cliente macchina, troppe verification possono essere percepite come:

- incertezza;
- costo a basso valore;
- rallentamento del workflow;
- troppi casi che richiedono un secondo passaggio.

## Decisione commerciale

Esito: PASS TECNICO, BORDERLINE COMMERCIALE.

Non e' un fallimento. E' un test utile perche' ci dice esattamente dove migliorare:

1. qualita' iniziale dei target;
2. segnali passati allo scoring;
3. regole che mandano troppi domini in verification;
4. condizioni che trasformano piu' Deep Analysis in Action Pack.

## Proiezione prudente a 250 target

Se il rapporto del test da 100 rimanesse stabile:

- downstream stimato: 1.4969 EUR x 250 = 374.23 EUR;
- ricavo Target Discovery: 149.00 EUR;
- ricavo simulato totale stimato: 523.23 EUR.

Questo e' interessante, ma non abbastanza forte da chiamarlo validazione piena.

Per essere piu' convincente, vorremmo vedere:

- downstream per target sopra 1.70 EUR;
- Verification sotto il 40%;
- Action Pack rate almeno 4%;
- Deep Analysis rate almeno 10-12%.

## Prossimo passo consigliato

Non passare ancora a 250.

Prima fare un test di ottimizzazione:

1. prendere i 45 target finiti in Verification;
2. capire perche' sono finiti li';
3. migliorare i segnali del target discovery;
4. arricchire categoria, area e indicatori pubblici;
5. rilanciare uno scoring su 100 target ottimizzati;
6. verificare se Verification scende sotto il 40%.

## Stato roadmap

- API e ledger: validati;
- audit: validato;
- Action Pack naturale: validato;
- no-list flow: validato;
- Target Discovery 50: positivo;
- Target Discovery 100: tecnicamente positivo, commercialmente borderline;
- prossimo blocco: ottimizzazione qualita' target e riduzione Verification.
