# Production API Key Readiness - No Key Issuance

Date: 2026-06-18

Language: it

Status: draft_internal_readiness_not_key_issuance

## Purpose

Questo documento prepara la readiness interna per le chiavi API production MachineSignal.

Non e' una emissione chiavi production, non crea segreti, non abilita traffico live e non autorizza clienti reali.

## Regola principale

Fino ad approvazione esplicita del proprietario e completamento di tutti i controlli, qualsiasi richiesta macchina per accesso production deve ricevere una risposta bloccata, leggibile da software, con consumo crediti pari a zero.

Valori obbligatori:

- production API keys allowed: false;
- production key issuance allowed: false;
- live traffic allowed: false;
- production secrets in repository allowed: false;
- commercial activation: false.

## Cosa e' ammesso ora

- uso di sandbox key;
- bozza policy per production key;
- disegno scope chiavi;
- runbook di revoca;
- runbook di rotazione;
- disegno rate limit;
- disegno audit log;
- risposta bloccata per richiesta production key;
- probe NoWrite.

## Cosa resta bloccato

- emettere una API key production;
- generare una chiave live;
- salvare segreti live nel repository;
- inviare una chiave production a clienti esterni;
- abilitare traffico live;
- abilitare accesso production a pagamento;
- consegna webhook production;
- elaborazione di dati reali o personali;
- dichiarare production ready.

## Classi di chiavi

| Prefix | Classe | Stato attuale |
| --- | --- | --- |
| `ms_sbx_` | sandbox customer key | ammessa solo in contesto sandbox e con limiti |
| `ms_live_` | production customer key | bloccata |
| `ms_admin_` | internal admin key | ristretta, non pubblicabile |
| `ms_wh_` | webhook signing secret | bloccata per production |

## Campi minimi per una futura chiave production

Una futura chiave production, se mai approvata, dovra' avere almeno:

- key_id;
- customer_id;
- environment;
- scope;
- rate_limit;
- quota;
- created_at;
- expires_at;
- revoked_at;
- rotation_due_at;
- status;
- allowed_origins_or_ips;
- billing_profile_id;
- audit_log_id.

## Risposta macchina se richiede una chiave production

```json
{
  "status": "blocked_by_production_api_key_readiness",
  "decision": "stop",
  "reason": "production API keys and live traffic are not approved",
  "credits_consumed": 0,
  "production_key_issued": false,
  "live_traffic_enabled": false,
  "secret_created": false,
  "owner_escalation_required": true,
  "support_code": "PRODUCTION_API_KEYS_NOT_READY"
}
```

## Controlli minimi prima del verde

- approvazione proprietario;
- fiscal/admin readiness approvata;
- payment/invoice readiness approvata;
- product/listino approvato;
- terms/privacy/data approvati;
- security/incident approvato;
- cost cap/kill switch implementato e testato;
- support/escalation implementato;
- scope chiavi production definiti;
- secret manager per production scelto;
- procedura generazione chiavi;
- procedura rotazione chiavi;
- procedura revoca chiavi;
- rate limit e quote;
- abuso e anomaly detection;
- audit log;
- profilo billing cliente verificato;
- nessun segreto nel repository;
- checklist sandbox-to-production;
- dry-run sintetico senza chiave reale.

## Cosa possono fare gli agenti

- preparare policy, runbook e scope;
- eseguire validazioni NoWrite;
- verificare che non ci siano chiavi nel repository;
- preparare checklist di emissione futura;
- proporre opzioni di secret manager;
- disegnare rate limit e audit log;
- produrre report in italiano.

## Gli agenti non possono

- generare una chiave production;
- esporre una chiave production;
- committare segreti;
- abilitare traffico live;
- inviare chiavi a clienti esterni;
- abilitare webhook production;
- processare dati reali o personali;
- bypassare approvazione proprietario;
- dichiarare il sistema production ready.

## Effetto dashboard

Il blocco `production_api_keys` puo' passare da rosso a candidato giallo solo come readiness documentale verificata.

Questo non significa verde, non significa go-live e non significa accesso production.

## Prossima azione sicura

Preparare o verificare nel Worker una risposta bloccata NoWrite per ogni richiesta di production key.
