# MachineSignal - RapidAPI-style score volume test

Data test: 2026-06-01T13:52:46

## Obiettivo

Testare se piu macchine esterne possono creare sandbox key e usare il percorso score senza onboarding umano, senza pagamenti reali e senza contatti esterni.

## Esito sintetico

- Check superati: 13
- Check falliti: 0
- Sandbox richieste: 5
- Sandbox create: 3
- Sandbox bloccate/limitate: 2
- Score credit delta: 15
- Extra addebiti duplicati: 0
- Pagamenti reali: non eseguiti
- Contatti esterni/email: non eseguiti

## Sandbox

| Sandbox | Creata | Score OK | Delta score | Extra duplicato | Errore |
|---:|---|---:|---:|---:|---|
| 1 | true | 5 | 5 | 0 | - |
| 2 | true | 5 | 5 | 0 | - |
| 3 | true | 5 | 5 | 0 | - |
| 4 | false | 0 | 0 | 0 | sandbox_limit_exceeded |
| 5 | false | 0 | 0 | 0 | sandbox_limit_exceeded |

## Metriche sandbox dopo il test

- Sandbox totali: 8
- Sandbox attive: 8
- Score usati: 19
- Target Discovery usati: 4
- Deep Analysis usati: 4
- Action Pack usati: 4
- Ordini totali: 12
- Progress sandbox key: 80%
- Progress score: 6.3%
- Progress Deep Analysis: 26.7%
- Progress Action Pack: 100%
- Safety OK: true

## Lettura business

Il percorso score regge: piu sandbox esterne possono scoreare domini, il credito viene consumato correttamente e l'idempotenza impedisce doppi addebiti.

Il blocco di 2 sandbox e positivo: dimostra che il limite anti-abuso sta funzionando.

Il limite emerso e quantitativo: con sandbox da 5 score, non possiamo avvicinarci al target di 300 score in 7 giorni usando solo sandbox pubbliche. Per testare il volume reale servono una di queste due strade:

- creare una beta customer key controllata con piu crediti;
- aumentare temporaneamente i crediti sandbox per il test.

## Decisione consigliata

Non aumentare subito i limiti pubblici sandbox.

Prossimo passo: creare una beta customer test key controllata, con volume piu alto, per simulare un cliente macchina reale senza esporre il sistema ad abuso pubblico.

## Nota sul rerun immediato

Un secondo lancio immediato del test e stato bloccato dal limite sandbox pubblico. Questo conferma che il controllo anti-abuso sta impedendo la creazione ripetuta di sandbox nello stesso ciclo di test.
