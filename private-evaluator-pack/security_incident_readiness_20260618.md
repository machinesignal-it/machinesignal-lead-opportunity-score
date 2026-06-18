# Security e incident readiness beta

Data: 2026-06-18

Stato: bozza operativa interna per beta controllata

Questo documento definisce come gestire sicurezza, incidenti, abuso, chiavi esposte, accessi anomali, errori gravi e stop di emergenza. Non è una certificazione di sicurezza, non abilita chiavi production, dati reali, pagamenti, fatture, marketplace, MCP pubblico o go-live commerciale.

## Principio base

In questa fase la regola è: bloccare prima, capire dopo.

Se compare un evento che può creare rischio tecnico, economico, legale, privacy o reputazionale, il sistema deve fermare l'azione rischiosa, registrare l'evento e scalare secondo il modello supporto/escalation.

## Cosa resta vietato

Restano vietati:

- chiavi API production;
- segreti production;
- dati reali;
- dati personali;
- dati sensibili;
- pagamenti reali;
- fatture;
- upgrade Cloudflare o servizi a pagamento senza approvazione;
- chiamate esterne a pagamento;
- outreach;
- pubblicazione marketplace;
- hosted MCP pubblico;
- registry MCP;
- go-live commerciale.

## Classi di incidente

| Classe | Esempio | Azione immediata | Escalation |
| --- | --- | --- | --- |
| exposed_secret | token, API key o password esposta in log, repo o chat | revoca/rotazione se possibile, blocco uso, report | L3/L4 |
| production_key_attempt | richiesta o tentativo di usare chiave production | rifiuto, stop, ledger event | L3 |
| real_data_detected | dati reali/personali in input, log o file | stop, blocco dati, support_code DATA_POLICY_BLOCK | L2/L3 |
| abnormal_request_pattern | loop, molte richieste, batch anomalo | rate limit o kill switch | L2 |
| ledger_failure | impossibile registrare eventi ledger | stop endpoint o job | L3 |
| repeated_incoherent_outputs | output incoerenti ripetuti | stop prodotto o endpoint | L2/L3 |
| external_cost_attempt | tentativo di usare servizio a pagamento | blocco chiamata esterna | L3 |
| unauthorized_publication | marketplace/MCP/registry/outreach non approvato | stop pubblicazione | L3 |
| account_access_anomaly | login sospetto, permesso inatteso, token nuovo non tracciato | freeze operativo e verifica | L3/L4 |
| dependency_or_platform_alert | alert GitHub, Cloudflare, Windows o provider | verifica, stop se grave | L2/L3 |
| customer_abuse | uso improprio, bypass limiti, input vietati ripetuti | sospensione cliente sandbox | L2/L3 |
| global_emergency | rischio non classificabile o grave | global beta kill switch | L4 |

## Severità

| Severità | Definizione | Azione |
| --- | --- | --- |
| S0 | Nessun rischio reale, evento informativo | registrare e monitorare |
| S1 | Rischio basso o isolato | correggere e chiudere con report |
| S2 | Rischio operativo ricorrente | sospendere endpoint/prodotto interessato |
| S3 | Rischio dati, segreti, costi o compliance | kill switch mirato e escalation proprietario |
| S4 | Rischio grave o non controllato | global beta kill switch e stop operativo |

## Kill switch di sicurezza

Tipi:

- secret_kill_switch;
- data_policy_kill_switch;
- endpoint_security_kill_switch;
- customer_security_kill_switch;
- external_cost_kill_switch;
- publication_kill_switch;
- global_beta_kill_switch.

Il kill switch deve scattare quando:

- viene rilevato un segreto esposto;
- compare dato reale/personale non autorizzato;
- una richiesta tenta uso production key;
- il ledger non registra eventi;
- c'è costo esterno potenziale maggiore di EUR 0;
- un endpoint genera errori o output incoerenti ripetuti;
- un agente tenta pubblicazione non approvata;
- l'incidente non è classificabile in modo sicuro.

## Procedura incident

1. Fermare l'azione rischiosa.
2. Evitare ulteriori scritture non necessarie.
3. Registrare un incident event.
4. Classificare severità e classe incidente.
5. Applicare kill switch se necessario.
6. Non consumare crediti per richieste bloccate.
7. Preparare report in italiano.
8. Scalare al proprietario se S3/S4 o se serve decisione.
9. Proporre prevenzione futura.
10. Aggiornare policy o Company Brain se cambia il modello operativo.

## Incident event minimo

Ogni incidente deve avere:

- incident_id;
- timestamp;
- severity;
- incident_class;
- detected_by;
- environment;
- affected_endpoint;
- affected_product_code;
- request_id quando disponibile;
- customer_id o sandbox_customer_id quando disponibile;
- data_policy_impact;
- secret_impact;
- cost_impact_eur;
- credits_consumed;
- kill_switch_applied;
- owner_escalation_required;
- immediate_action;
- next_action;
- status;
- closed_at.

## Risposta macchina per incidente

```json
{
  "status": "blocked_by_security_policy",
  "decision": "stop",
  "reason": "security incident or unsafe request detected",
  "credits_consumed": 0,
  "support_code": "SECURITY_POLICY_BLOCK",
  "owner_escalation_required": true,
  "retry_after_seconds": null
}
```

## Regole sui segreti

Gli agenti devono:

- non scrivere password, token o API key nei report;
- non committare segreti;
- non incollare segreti in file pubblici;
- non usare chiavi production;
- non creare nuove chiavi production;
- non ruotare chiavi reali senza autorizzazione;
- segnalare subito qualsiasi segreto visibile;
- usare placeholder nei documenti;
- preferire NoWrite quando si verifica configurazione.

Se un segreto appare in un file o log, il documento deve considerarlo incidente anche se il sistema sembra funzionare.

## Regole account e permessi

Ogni accesso o token deve essere:

- necessario;
- limitato al minimo;
- documentato;
- revocabile;
- non condiviso in chat o documenti;
- non usato per azioni commerciali non approvate.

Ogni permesso nuovo o anomalo deve essere verificato prima di procedere.

## Regole dati

Se compaiono dati reali/personali:

- bloccare elaborazione;
- non consumare crediti;
- non arricchire;
- non salvare contenuto non necessario;
- non usare per test;
- aprire escalation;
- proporre cancellazione o isolamento;
- non procedere finché non c'è decisione.

## Regole provider e alert

Alert da Cloudflare, GitHub, Windows, Postman, DataForSEO o altri provider devono essere classificati.

Esempi:

- limite Cloudflare superato: bloccare loop e ridurre scritture;
- GitHub Actions failed: verificare log, nessuna chiave production;
- Windows security alert: fermare script sospetto e verificare comando;
- provider billing/cost alert: stop immediato e escalation.

## Cosa possono fare gli agenti

Gli agenti possono:

- classificare incidenti;
- produrre report in italiano;
- proporre mitigazioni;
- aggiornare bozze policy;
- preparare checklist;
- eseguire probe NoWrite;
- applicare stop logico nei documenti o test sandbox.

Gli agenti non possono:

- comprare piani o crediti;
- autorizzare costi reali;
- usare chiavi production;
- processare dati reali/personali;
- contattare esterni;
- pubblicare marketplace/MCP;
- dichiarare incidente chiuso se manca evidenza;
- ignorare alert gravi.

## Escalation al proprietario

Escalare sempre quando:

- severità S3 o S4;
- segreto esposto;
- dato reale/personale rilevato;
- costo potenziale maggiore di EUR 0;
- richiesta production key;
- richiesta pubblicazione esterna;
- sospetto accesso anomalo;
- kill switch globale;
- decisione non prevista dalle policy.

## Criteri per passare da rosso a giallo

Il blocco `security_incident_readiness` può diventare candidato giallo se:

- esiste questa bozza;
- esiste un probe che verifica classi incidente, severità, kill switch, segreti, dati, alert e divieti;
- la Company Brain viene aggiornata;
- nessun documento dichiara sicurezza approvata o production ready.

## Criteri per passare da giallo a verde

Può diventare verde solo se:

- il proprietario approva;
- esiste procedura incident finale;
- esiste test sintetico di incidente;
- esiste procedura secret handling;
- esiste procedura per provider alert;
- esiste log/ledger incident verificato;
- esiste procedura di chiusura incidente;
- Company Brain e dashboard sono aggiornati.

## Divieti confermati

- Nessuna chiave production.
- Nessun segreto in repo, report o chat.
- Nessun dato reale.
- Nessun dato personale.
- Nessun costo reale.
- Nessun upgrade provider.
- Nessun pagamento reale.
- Nessuna fattura.
- Nessun outreach.
- Nessuna pubblicazione marketplace/MCP.
- Nessun go-live commerciale.
