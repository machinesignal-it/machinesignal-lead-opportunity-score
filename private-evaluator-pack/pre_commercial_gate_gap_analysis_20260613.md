# Pre-commercial gate gap analysis

Date: 2026-06-13

## Sintesi

La parte tecnica sandbox e' quasi chiusa.

Il go-live commerciale resta bloccato da 8 gate:

- admin/fiscale;
- legale;
- privacy/dati;
- pagamenti/billing;
- API key produzione;
- supporto post-vendita;
- limiti costo;
- distribuzione pubblica.

Gli agenti possono preparare molto lavoro, ma alcune decisioni restano del proprietario: fiscalita'/P.IVA, approvazione termini, scelta provider pagamenti, budget massimo e pubblicazione esterna.

## Stato roadmap

Sandbox test: **94%**

Readiness go-live commerciale: **38%**

Go-live commerciale: **blocked**

Motivo: la sandbox tecnica funziona, ma amministrazione, legal, privacy, pagamenti e controllo costi non sono ancora pronti.

## Sequenza consigliata

1. Supporto post-vendita.
2. Limiti costo.
3. API key produzione.
4. Termini legali.
5. Privacy/dati.
6. Admin/fiscale.
7. Pagamenti/billing.
8. Distribuzione pubblica.

Perche' questa sequenza: prima si riduce il rischio operativo automatico, poi quello tecnico-live, poi legale/fiscale/pagamenti, e solo alla fine si aumenta la distribuzione.

## Gap principali

| Gate | Stato | Priorita' | Serve decisione proprietario |
|---|---|---|---|
| Admin/fiscale | blocked | critical | si |
| Termini legali | blocked | critical | si |
| Privacy/dati | blocked | critical | si |
| Pagamenti/billing | blocked | critical | si |
| API key produzione | blocked | high | si |
| Supporto post-vendita | not ready | high | si |
| Limiti costo | not ready | high | si |
| Distribuzione pubblica | blocked | medium | si |

## Cosa possono fare gli agenti ora

- Preparare support playbook automatico.
- Preparare catalogo errori.
- Preparare policy per non accumulare lavoro.
- Preparare cost guard policy.
- Simulare margini per prodotto.
- Preparare API key policy.
- Preparare bozze legal/privacy.
- Preparare domande per commercialista.
- Preparare bozze listing pubbliche, senza pubblicarle.

## Cosa richiede il proprietario

- Decidere assetto fiscale/P.IVA.
- Approvare termini legali finali.
- Decidere se e quando accettare dati reali.
- Scegliere provider pagamento.
- Definire budget massimo giornaliero/mensile.
- Approvare canale pubblico.
- Autorizzare ogni pubblicazione irreversibile.

## Prossimo step

**support_and_cost_guard_draft**

Preparare prima supporto automatico e limiti di costo, per evitare che il go-live crei lavoro umano o spese non controllate.

Modalita': NoWrite planning.
