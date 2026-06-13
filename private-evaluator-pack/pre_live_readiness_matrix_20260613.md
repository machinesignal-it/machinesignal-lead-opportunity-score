# Pre-live readiness matrix

Date: 2026-06-13

## Sintesi

La parte test sandbox e machine-readable e' forte.

Il go-live commerciale resta **NO-GO**.

Readiness stimata:

- sandbox test: **94%**;
- pre-live commerciale: **45%**;
- vendita reale: **NO-GO**.

Motivo: gli asset tecnici e machine-readable sono buoni, ma restano incompleti fiscalita', legal/privacy, pagamenti, API key produzione, supporto live, cost guard e distribuzione pubblica.

## Bundle candidato

**MachineSignal Controlled Entry Bundle**

Componenti:

- Score Pack 1k;
- Action Pack 25.

Stato: approvato solo per modellazione pre-live.

Vendita live: **non consentita**.

## Matrice gate

| Gate | Stato | Readiness | Serve decisione proprietario | Blocca live |
|---|---|---:|---|---|
| Sandbox machine readiness | ready | 95% | no | no |
| Pricing bundle readiness | pre-live ready | 75% | si | si |
| Admin/fiscal | blocked | 20% | si | si |
| Legal terms | blocked | 25% | si | si |
| Privacy/data | blocked | 25% | si | si |
| Payment/billing | blocked | 20% | si | si |
| Production API key | not ready | 45% | si | si |
| Support post-sale | draft ready | 60% | no | si |
| Cost guard | draft ready | 60% | si | si |
| Public distribution | blocked | 35% | si | si |

## Decisioni proprietario necessarie prima del live

- P.IVA / strada fiscale.
- Listino live finale.
- Approvazione termini legali.
- Approvazione privacy e trattamento dati.
- Provider pagamento e checkout live.
- Budget giornaliero/mensile massimo.
- Canale di distribuzione pubblico.
- Approvazione esplicita go-live commerciale.

## Cosa possono fare gli agenti senza decisione proprietario

- Test no-write del supporto live automatico.
- Simulazione no-write cost guard hard stop.
- Bozza policy API key produzione.
- Bozza outline termini/privacy.

## Blocchi confermati

Restano bloccati:

- pagamenti reali;
- fatture;
- raccolta metodi di pagamento;
- outreach;
- dati reali;
- dati personali;
- API key produzione;
- marketplace paid;
- hosted MCP pubblico;
- registry MCP;
- go-live commerciale.

## Prossimo step

**live_support_readiness_test_nowrite**

Testare in simulazione il supporto live automatico e la procedura anti-accumulo lavoro, senza clienti reali e senza inviare messaggi.
