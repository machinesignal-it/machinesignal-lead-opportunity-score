# Support and cost guard draft

Date: 2026-06-13

## Obiettivo

Evitare che il go-live crei:

- lavoro umano accumulato;
- costi non controllati;
- richieste commerciali non autorizzate;
- uso di dati reali prima dei gate legali/privacy;
- pagamenti o fatture prima dell'approvazione.

Modalita': **NoWrite planning**.

## Supporto automatico

Il supporto deve essere prima di tutto machine self-service.

Canali:

- usage via API;
- orders via API;
- errori strutturati;
- documentazione pubblica;
- observation log giornaliero.

Risposte automatiche previste:

| Caso | Risposta macchina | Escalation |
|---|---|---|
| Input non valido | campi mancanti, schema atteso, retry permesso | no |
| Crediti insufficienti | saldo, prodotto richiesto, motivo blocco | no |
| Richiesta duplicata | risultato precedente, zero doppio consumo | no |
| Output non valido | no-credit, motivi, retry payload | no |
| Abuso o uso non limitato | pausa uso, motivo, prossimo controllo | si |
| Pagamento/fattura prima del gate | commercial_go_live_blocked | si |
| Dati reali in test | real_data_blocked, payload non processato | si |

## No-work-accumulation

Se il proprietario non controlla per qualche giorno:

- continuano solo i monitor no-write;
- si fermano i rehearsal scriventi;
- non si ritentano operazioni costose;
- vengono riassunti solo i 3 punti piu' importanti;
- eventi duplicati o a basso rischio vengono chiusi automaticamente;
- dopo 3 elementi critici, stop e richiesta decisione.

## Cost guard

Fonti costo da controllare:

- Cloudflare Workers;
- Cloudflare KV;
- DataForSEO;
- OpenAI/Codex credits;
- dominio/email/hosting;
- future fee provider pagamenti.

Limiti iniziali in bozza:

- KV writes soft limit: 500/giorno;
- KV writes hard stop: 900/giorno;
- POST write-capped: massimo 5 per rehearsal;
- chiamate paid esterne: 0 senza budget approvato;
- pagamenti reali: 0;
- outreach umano: 0.

## Stop trigger

Fermare o mettere in pausa se:

- HTTP 429;
- KV sopra soft limit;
- chiamata paid esterna senza budget;
- pagamento reale prima del gate;
- fattura prima del gate;
- dati reali o personali in test;
- tre 5xx ripetuti su endpoint critici;
- sospetta esposizione chiavi.

## Responsabilita' agenti

| Agente | Responsabilita' |
|---|---|
| Orchestratore | Stop trigger, escalation e roadmap. |
| Customer Success & Post-Sale | Supporto automatico e coda senza accumulo. |
| Admin & Finance Controller | Costi, margini, blocchi billing. |
| Legal & Compliance | Blocco dati reali, pagamenti, outreach. |
| API Product Manager | Errori, usage, orders e gate leggibili dalle macchine. |

## Prossimo step

**support_cost_guard_probe_and_margin_model**

Validare questa bozza e poi preparare un modello di margine minimo per prodotto, senza attivare pagamenti o chiamate paid esterne.
