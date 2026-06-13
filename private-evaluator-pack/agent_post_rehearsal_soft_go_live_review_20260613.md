# Agent post-rehearsal review - soft go-live sandbox-only

Date: 2026-06-13

## Sintesi

Gli agenti hanno rivalutato il test dopo il rehearsal sandbox-only.

Verdetto: **keep_sandbox_visible_continue_no_paid_no_external_publication**.

In parole semplici: la sandbox puo' restare visibile e puo' essere testata dalle macchine. Non e' un paid launch, non e' ancora vendita, non e' marketplace pubblico e non richiede contatti umani.

## Cosa e' stato verificato

- Il sito e i contratti macchina sono pubblici e leggibili.
- OpenAPI e manifest MCP sono raggiungibili.
- Il percorso macchina ha funzionato da inizio a fine:
  - lettura risorse pubbliche;
  - creazione sandbox sintetica;
  - target discovery;
  - score;
  - deep analysis;
  - action pack;
  - usage e orders sandbox.
- Il rehearsal ha eseguito 5 POST su 5 consentiti.
- I controlli sono passati: 58 superati, 0 falliti.
- Nessun pagamento reale.
- Nessuna fattura reale.
- Nessun contatto esterno.
- Nessun outreach umano.
- Nessuna pubblicazione commerciale esterna.
- Nessuna chiave API di produzione pubblicata.
- Nessun dato reale o personale.

## Parere degli agenti

| Agente | Parere | Indicazione |
|---|---|---|
| Orchestratore | go conditional | Tenere la sandbox visibile e continuare i test controllati. |
| API Product Manager | go conditional | Preparare metriche di osservazione e integrita' dei contratti. |
| Machine-to-Machine Sales Ops | go conditional | Solo visibilita' passiva machine-first, niente outreach umano. |
| Customer Success & Post-Sale | go conditional | Preparare regole di supporto e post-vendita sandbox automatiche. |
| Admin & Finance Controller | no-go paid | Bloccare pagamenti e fatture finche' non e' pronto l'assetto amministrativo. |
| Legal & Compliance | no-go real data | Restare su dati sintetici e nessun contatto esterno. |
| Growth & Distribution | hold distribution | Non andare ancora su marketplace o registry pubblici. |
| Continuous Learning | go conditional | Migliorare scoring, documentazione e listino con test interni. |
| HR & Agent Manager | go conditional | Copertura agenti sufficiente per procedere. |

## Decisione

Possiamo mantenere visibili:

- sito pubblico;
- pagina API;
- OpenAPI;
- manifest MCP;
- esempi sandbox;
- documentazione GitHub.

Restano bloccati:

- pagamenti reali;
- checkout paid;
- fatture;
- raccolta metodi di pagamento;
- marketplace paid;
- hosted MCP pubblico;
- pubblicazione su registry MCP;
- chiavi API di produzione;
- outreach umano;
- campagne email;
- contatti esterni;
- dati cliente reali;
- dati personali;
- liste lead reali;
- scritture non limitate.

## Prossimo passo consigliato

Creare il **Sandbox Visibility Monitoring Pack**.

Serve a controllare ogni giorno se le macchine riescono a trovare, leggere e testare MachineSignal senza generare costi, contatti esterni o rischi commerciali.

Il pack deve includere:

- controlli giornalieri degli endpoint pubblici;
- verifica integrita' OpenAPI e manifest MCP;
- contatori di uso sandbox;
- guardrail Cloudflare KV;
- controllo documentazione GitHub pubblica;
- stop trigger per 429, billing, pagamento, contatto esterno o dato reale;
- report giornaliero semplice per il proprietario, entro massimo 1-2 ore di supervisione.
