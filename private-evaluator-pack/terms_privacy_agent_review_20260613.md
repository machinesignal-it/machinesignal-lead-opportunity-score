# MachineSignal - Terms/Privacy Agent Review

Data: 2026-06-13  
Stato: prepared  
Modalita': NoWrite planning  
Fonte: terms_privacy_outline_draft_20260613  
Stato commerciale: not_live  
Decisione go-live: no_go

## Sintesi

Gli agenti confermano che la bozza termini/privacy e' una buona base interna, ma non basta per vendere.

La cosa piu' importante: MachineSignal vuole vendere a macchine, ma dietro ogni macchina deve esserci un account umano o aziendale responsabile. Quindi il sistema puo' essere machine-first nell'uso, ma non puo' essere senza responsabilita' contrattuale.

## Esito riunione agenti

| Agente | Esito | Motivo |
| --- | --- | --- |
| Orchestratore | GO solo preparazione interna | Il perimetro e' chiaro, ma manca owner approval e revisione professionale. |
| API Product Manager | GO per allineamento contratto/API | Crediti e output valido sono coerenti, ma vanno collegati agli endpoint. |
| Data Quality & Compliance | NO-GO dati reali | Serve mappa dati, retention, cancellazione e subprocessor inventory. |
| Admin & Finance Controller | NO-GO vendita pagata | Pagamenti e fatture restano bloccati fino a decisione fiscale. |
| Legal & Risk | NO-GO fino a revisione professionale | La bozza non e' contratto, privacy notice o DPA definitivo. |
| Growth & Distribution | GO solo asset non-outreach | Si possono preparare pagine/documenti, ma non marketplace o contatti esterni. |
| Customer Feedback | GO support playbook | Serve supporto agent-only con escalation privacy/legale/pagamenti. |
| HR Agent Manager | GO training agenti | Gli agenti devono memorizzare i blocchi e non proporre azioni vietate. |

## Punti critici emersi

1. Il cliente operativo puo' essere una macchina, ma l'accettazione legale deve essere riconducibile a un soggetto umano o aziendale.
2. Il modello crediti va scritto anche in formato machine-readable, non solo in testo umano.
3. La privacy data map e' il blocco principale prima di usare dati reali.
4. La gestione post-vendita puo' essere agent-only, ma deve avere escalation obbligatoria.
5. I documenti non devono promettere ricavi, lead garantiti, accuratezza assoluta o SLA non approvati.

## Artefatti necessari prima del live

- `terms_acceptance_flow`: chi accetta i termini, quando, con quale account e quale versione.
- `privacy_data_map`: quali dati entrano, perche', dove vanno, per quanto restano e come si cancellano.
- `dpa_and_subprocessor_inventory`: accordi e fornitori usati.
- `fiscal_admin_go_live_gate`: blocco incassi/fatture fino a decisione amministrativa.
- `support_privacy_terms_playbook`: risposte agent-only e casi di escalation.
- `machine_readable_terms_summary`: riepilogo leggibile da software su prodotti, limiti e crediti.

## Approvato ora

- Usare la bozza come base interna.
- Creare riepilogo termini machine-readable non pubblico.
- Creare mappa dati senza dati reali.
- Creare support playbook per gestione agent-only.
- Mantenere tutti i gate commerciali bloccati.

## Non approvato ora

- Pagamenti reali.
- Fatture.
- Raccolta metodi di pagamento.
- Outreach o contatti esterni.
- Dati reali.
- Dati personali.
- API key produzione.
- Marketplace pubblico a pagamento.
- Hosted MCP pubblico.
- Registry MCP pubblico.
- Go-live commerciale.
- Pubblicazione di termini/privacy definitivi.

## Readiness dopo review

- Legal/privacy readiness: 50%.
- Commercial readiness: 62%.
- Machine buyer contract readiness: 40%.
- Go-live: no_go.

Motivo: ora sappiamo quali artefatti mancano, ma non abbiamo ancora revisione legale/fiscale, mappa dati approvata, DPA, retention o flow di accettazione contrattuale.

## Prossimo step consigliato

`privacy_data_map_draft_nowrite`

Questo e' il passo piu' utile perche' chiarisce cosa succede ai dati prima di fare qualsiasi vendita reale o integrazione con dati veri.
