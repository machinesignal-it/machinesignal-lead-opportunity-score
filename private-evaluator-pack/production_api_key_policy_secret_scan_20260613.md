# Production API key policy secret scan

Date: 2026-06-13

## Sintesi

La secret scan mirata non ha trovato chiavi produzione, admin key, token live, password o segreti reali.

Commercial status: **not live**.

## Risultato

- Match grezzi: 8.
- Finding reali non risolti: 0.
- Chiavi produzione trovate: no.
- Admin key trovate: no.
- Payment secret trovati: no.
- Password reali trovate: no.
- Token reali trovati: no.
- Rotazione chiavi richiesta: no.
- Azione proprietario richiesta: no.

## Cosa e' stato trovato

Gli unici match sono nel file:

`postman_private_workspace_rehearsal_nowrite_probe_report_20260611.md`

Le righe trovate indicano che alcune variabili Postman sono **blank secret**:

- `machinesignal_api_key`;
- `machinesignal_admin_api_key`;
- `beta_customer_id`;
- `payment_test_success_signature`.

Quindi non sono segreti reali: sono righe di report che confermano che i valori sono vuoti.

## Policy confermata

- Generazione production API key: bloccata.
- Pubblicazione production API key: bloccata.
- Condivisione admin key: bloccata.
- Esempi pubblici solo con placeholder: ok.
- Postman blank secret rule: ok.

## Readiness impact

- Readiness API key prima della policy: 45%.
- Dopo policy: 60%.
- Dopo secret scan: 65%.

Restano bloccanti:

- nessun test generazione key live;
- nessuna approvazione proprietario;
- gate fiscale/legal/payment/privacy non passati;
- storage production key non validato.

## Prossimo step

**terms_privacy_outline_draft**

Preparare una bozza di outline per termini di servizio e privacy/data processing, senza pubblicarla come documento legale definitivo.
