# Production API key policy draft

Date: 2026-06-13

## Sintesi

Questa policy definisce come dovranno funzionare le API key di produzione.

Non genera chiavi reali.

Non abilita accessi live.

Commercial status: **not live**.

## Classi di chiavi

| Classe | Prefisso | Stato |
|---|---|---|
| Sandbox customer key | `ms_sbx_` | allowed for sandbox |
| Production customer key | `ms_live_` | blocked until owner approval |
| Admin key | `ms_admin_` | restricted internal only |
| Test webhook signature | `ms_wh_test_` | test only |

## Regola emissione production key

Le chiavi produzione non possono essere generate ora.

Servono prima:

- approvazione proprietario;
- gate admin/fiscale;
- gate legal;
- gate privacy/dati;
- gate pagamenti/billing;
- gate supporto;
- gate cost guard.

## Cosa non va mai pubblicato

- Chiave produzione completa in chiaro.
- Admin key completa.
- Payment provider secret.
- Dati personali cliente nei metadati chiave.

## Regole documentazione pubblica

- I documenti pubblici possono mostrare prefissi, non chiavi complete.
- Gli esempi devono usare placeholder tipo `{{machinesignal_api_key}}`.
- Gli ambienti Postman devono lasciare vuoti i valori sensibili.
- OpenAPI puo' documentare lo schema security, non credenziali reali.
- GitHub non deve contenere production key o admin key.

## Revoca e rotazione

Rotazione standard: ogni 90 giorni.

Revoca immediata se:

- una chiave appare in repository pubblico;
- una chiave appare in screenshot o documento pubblico;
- c'e' spike uso inatteso;
- evento rosso da cost guard;
- richiesta cliente;
- sospetto abuso;
- dati reali rilevati in test mode.

## Incident response

In caso di sospetta esposizione chiave:

- pausa emissione production key;
- stop flussi scriventi per la chiave sospetta;
- nota incidente;
- secret scan artefatti pubblici/locali;
- riepilogo al proprietario con decisione richiesta.

## Readiness impact

Prima della policy: 45%.

Dopo la policy: 60%.

Restano bloccanti:

- nessun test generazione key live;
- nessuna approvazione proprietario;
- gate fiscale/legal/payment/privacy non passati;
- storage production key non validato.

## Prossimo step

**production_api_key_policy_probe_and_secret_scan**

Validare la policy e fare una secret scan dei documenti pubblici/locali per verificare che non ci siano chiavi reali o valori sensibili.
