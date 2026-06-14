# Synthetic Machine Buyer Journey Rehearsal NoWrite - 2026-06-14

## Scopo

Questo test simula una macchina cliente che prova a capire cosa comprare da MachineSignal.

Non sono state fatte chiamate API nuove. Non sono stati usati dati reali. Non sono stati creati pagamenti, fatture, outreach, marketplace o chiavi production.

## Risultato

PASS.

La macchina sintetica capisce tre casi:

1. Se ha gia' una lista, deve partire da `score_pack_1k`.
2. Se non ha una lista, deve partire da `target_discovery`.
3. Se vuole una prossima azione commerciale, deve comprare `action_pack` solo dopo un gate Deep Analysis valido.

## Scenario 1 - cliente con lista

La macchina ha 1.000 domini sintetici di studi dentistici a Milano.

Decisione:
compra `score_pack_1k`.

Perche':
ha gia' una lista e deve solo capire dove spendere budget.

Stop rule:
non consuma credito su duplicati, domini invalidi o output non utilizzabili.

## Scenario 2 - cliente senza lista

La macchina vuole trovare agenzie immobiliari in Lombardia con opportunita' di miglioramento della presenza digitale.

Decisione:
compra `target_discovery`.

Perche':
non ha una lista da valutare. Prima serve costruire un elenco coerente di target.

Stop rule:
se non ci sono 250 target coerenti, non deve ricevere target deboli. Deve ricevere alternative: mini discovery, area piu' ampia, criteri piu' larghi o obiettivo commerciale riscritto.

## Scenario 3 - prossima azione dopo Deep Analysis

La macchina ha un dominio sintetico e una Deep Analysis gia' confermata.

Decisione:
compra `action_pack`.

Perche':
Action Pack serve solo quando Deep Analysis dice che vale la pena preparare una prossima azione.

Stop rule:
l'output prepara CRM, workflow e istruzioni agentiche, ma non invia email e non contatta il target. L'azione esterna resta bloccata finche' il cliente non approva canale e base lecita.

## Conclusione

Il journey machine-first e' comprensibile:

- lista esistente -> Score Pack;
- nessuna lista -> Target Discovery;
- alta qualita' dopo Deep Analysis -> Action Pack;
- incertezza o segnale debole -> watchlist, verifica o stop.

Prossimo step consigliato: `agent_roles_operating_check_nowrite`.
