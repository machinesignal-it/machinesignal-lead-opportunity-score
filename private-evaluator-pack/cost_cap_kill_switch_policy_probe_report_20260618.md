# Report controllo policy cost cap e kill switch

Data controllo: 2026-06-18

Esito: SUPERATO

Controlli superati: 95/95

Sintesi:

- La policy definisce soglie, rate limit e kill switch per la beta controllata.
- Il budget reale resta zero finchÃ© il proprietario non approva diversamente.
- Le chiamate esterne a pagamento e gli upgrade Cloudflare restano vietati.
- Il blocco cost_cap_kill_switch puÃ² diventare candidato giallo, ma non verde senza implementazione, test e approvazione.

Dettaglio controlli:

- [OK] Documento Markdown presente: La policy leggibile deve esistere.
- [OK] Documento JSON presente: La policy macchina deve esistere.
- [OK] Lingua italiana dichiarata: I report owner-facing devono essere in italiano.
- [OK] Stato bozza interna: La policy deve restare bozza interna.
- [OK] Nessuna attivazione commerciale: La policy non deve attivare beta o go-live.
- [OK] Nessun uso esterno a pagamento autorizzato: Le chiamate esterne a pagamento restano bloccate.
- [OK] Nessun upgrade Cloudflare autorizzato: Gli upgrade a pagamento restano bloccati.
- [OK] Azione vietata dichiarata: real_payments: La policy deve confermare che questa azione resta vietata.
- [OK] Azione vietata dichiarata: invoices: La policy deve confermare che questa azione resta vietata.
- [OK] Azione vietata dichiarata: payment_method_collection: La policy deve confermare che questa azione resta vietata.
- [OK] Azione vietata dichiarata: production_api_keys: La policy deve confermare che questa azione resta vietata.
- [OK] Azione vietata dichiarata: real_customer_data: La policy deve confermare che questa azione resta vietata.
- [OK] Azione vietata dichiarata: personal_data: La policy deve confermare che questa azione resta vietata.
- [OK] Azione vietata dichiarata: external_paid_api_calls: La policy deve confermare che questa azione resta vietata.
- [OK] Azione vietata dichiarata: cloudflare_paid_plan_upgrade: La policy deve confermare che questa azione resta vietata.
- [OK] Azione vietata dichiarata: external_outreach: La policy deve confermare che questa azione resta vietata.
- [OK] Azione vietata dichiarata: commercial_go_live: La policy deve confermare che questa azione resta vietata.
- [OK] Livello cap presente: request_cap: Ogni livello di controllo deve essere mappato.
- [OK] Livello cap con azione: request_cap: Ogni livello deve avere un'azione.
- [OK] Livello cap presente: customer_cap: Ogni livello di controllo deve essere mappato.
- [OK] Livello cap con azione: customer_cap: Ogni livello deve avere un'azione.
- [OK] Livello cap presente: product_cap: Ogni livello di controllo deve essere mappato.
- [OK] Livello cap con azione: product_cap: Ogni livello deve avere un'azione.
- [OK] Livello cap presente: daily_cost_cap: Ogni livello di controllo deve essere mappato.
- [OK] Livello cap con azione: daily_cost_cap: Ogni livello deve avere un'azione.
- [OK] Livello cap presente: external_cost_cap: Ogni livello di controllo deve essere mappato.
- [OK] Livello cap con azione: external_cost_cap: Ogni livello deve avere un'azione.
- [OK] Livello cap presente: policy_cap: Ogni livello di controllo deve essere mappato.
- [OK] Livello cap con azione: policy_cap: Ogni livello deve avere un'azione.
- [OK] Livello cap presente: incident_cap: Ogni livello di controllo deve essere mappato.
- [OK] Livello cap con azione: incident_cap: Ogni livello deve avere un'azione.
- [OK] Soglia presente: requests_per_minute_per_sandbox_customer: Ogni soglia beta consigliata deve essere esplicita.
- [OK] Soglia presente: requests_per_hour_per_sandbox_customer: Ogni soglia beta consigliata deve essere esplicita.
- [OK] Soglia presente: requests_per_day_per_sandbox_customer: Ogni soglia beta consigliata deve essere esplicita.
- [OK] Soglia presente: score_pack_batch_max: Ogni soglia beta consigliata deve essere esplicita.
- [OK] Soglia presente: domain_enrichment_batch_max: Ogni soglia beta consigliata deve essere esplicita.
- [OK] Soglia presente: target_discovery_frequency: Ogni soglia beta consigliata deve essere esplicita.
- [OK] Soglia presente: consecutive_technical_errors: Ogni soglia beta consigliata deve essere esplicita.
- [OK] Soglia presente: consecutive_duplicates: Ogni soglia beta consigliata deve essere esplicita.
- [OK] Soglia presente: daily_external_cost_sandbox_eur: Ogni soglia beta consigliata deve essere esplicita.
- [OK] Soglia presente: unapproved_beta_budget_eur: Ogni soglia beta consigliata deve essere esplicita.
- [OK] Costo esterno giornaliero a zero: Le chiamate esterne a pagamento non devono essere autorizzate.
- [OK] Budget beta non approvata a zero: La beta non approvata deve avere budget reale zero.
- [OK] Kill switch presente: customer_kill_switch: Ogni kill switch principale deve essere dichiarato.
- [OK] Kill switch presente: product_kill_switch: Ogni kill switch principale deve essere dichiarato.
- [OK] Kill switch presente: endpoint_kill_switch: Ogni kill switch principale deve essere dichiarato.
- [OK] Kill switch presente: external_call_kill_switch: Ogni kill switch principale deve essere dichiarato.
- [OK] Kill switch presente: global_beta_kill_switch: Ogni kill switch principale deve essere dichiarato.
- [OK] Kill switch presente: policy_kill_switch: Ogni kill switch principale deve essere dichiarato.
- [OK] Trigger kill switch presente: daily_threshold_exceeded: I trigger critici devono essere dichiarati.
- [OK] Trigger kill switch presente: repeated_request_loop: I trigger critici devono essere dichiarati.
- [OK] Trigger kill switch presente: error_rate_exceeded: I trigger critici devono essere dichiarati.
- [OK] Trigger kill switch presente: real_or_personal_data_detected: I trigger critici devono essere dichiarati.
- [OK] Trigger kill switch presente: unapproved_production_key_attempt: I trigger critici devono essere dichiarati.
- [OK] Trigger kill switch presente: ledger_write_failure: I trigger critici devono essere dichiarati.
- [OK] Trigger kill switch presente: external_spend_above_authorized_limit: I trigger critici devono essere dichiarati.
- [OK] Trigger kill switch presente: owner_manual_stop: I trigger critici devono essere dichiarati.
- [OK] Risposta bloccata non consuma crediti: Una richiesta bloccata non deve consumare crediti.
- [OK] Risposta bloccata dice stop: Il cliente macchina deve sapere che deve fermarsi.
- [OK] Campo ledger presente: event_id: Il ledger deve poter ricostruire il blocco.
- [OK] Campo ledger presente: timestamp: Il ledger deve poter ricostruire il blocco.
- [OK] Campo ledger presente: customer_id_or_sandbox_customer_id: Il ledger deve poter ricostruire il blocco.
- [OK] Campo ledger presente: request_id: Il ledger deve poter ricostruire il blocco.
- [OK] Campo ledger presente: endpoint: Il ledger deve poter ricostruire il blocco.
- [OK] Campo ledger presente: product_code: Il ledger deve poter ricostruire il blocco.
- [OK] Campo ledger presente: cap_type: Il ledger deve poter ricostruire il blocco.
- [OK] Campo ledger presente: threshold_name: Il ledger deve poter ricostruire il blocco.
- [OK] Campo ledger presente: threshold_value: Il ledger deve poter ricostruire il blocco.
- [OK] Campo ledger presente: observed_value: Il ledger deve poter ricostruire il blocco.
- [OK] Campo ledger presente: action_taken: Il ledger deve poter ricostruire il blocco.
- [OK] Campo ledger presente: credits_consumed: Il ledger deve poter ricostruire il blocco.
- [OK] Campo ledger presente: cost_estimate_eur: Il ledger deve poter ricostruire il blocco.
- [OK] Campo ledger presente: policy_version: Il ledger deve poter ricostruire il blocco.
- [OK] Campo ledger presente: environment: Il ledger deve poter ricostruire il blocco.
- [OK] Campo ledger presente: escalation_required: Il ledger deve poter ricostruire il blocco.
- [OK] Campo ledger presente: support_code: Il ledger deve poter ricostruire il blocco.
- [OK] Frase chiave Markdown: Ogni macchina cliente: Il Markdown deve essere comprensibile per il proprietario.
- [OK] Frase chiave Markdown: Kill switch: Il Markdown deve essere comprensibile per il proprietario.
- [OK] Frase chiave Markdown: Costo esterno giornaliero sandbox: Il Markdown deve essere comprensibile per il proprietario.
- [OK] Frase chiave Markdown: EUR 0: Il Markdown deve essere comprensibile per il proprietario.
- [OK] Frase chiave Markdown: Cloudflare: Il Markdown deve essere comprensibile per il proprietario.
- [OK] Frase chiave Markdown: Escalation: Il Markdown deve essere comprensibile per il proprietario.
- [OK] Frase chiave Markdown: Divieti confermati: Il Markdown deve essere comprensibile per il proprietario.
- [OK] Nessuna frase di attivazione: pagamenti reali attivi: La policy non deve sembrare un'approvazione.
- [OK] Nessuna frase di attivazione: fatture attive: La policy non deve sembrare un'approvazione.
- [OK] Nessuna frase di attivazione: chiavi production autorizzate: La policy non deve sembrare un'approvazione.
- [OK] Nessuna frase di attivazione: dati reali autorizzati: La policy non deve sembrare un'approvazione.
- [OK] Nessuna frase di attivazione: chiamate esterne a pagamento autorizzate: La policy non deve sembrare un'approvazione.
- [OK] Nessuna frase di attivazione: upgrade Cloudflare autorizzato: La policy non deve sembrare un'approvazione.
- [OK] Nessuna frase di attivazione: go-live commerciale approvato: La policy non deve sembrare un'approvazione.
- [OK] Nessuna frase di attivazione: real payments active: La policy non deve sembrare un'approvazione.
- [OK] Nessuna frase di attivazione: production keys approved: La policy non deve sembrare un'approvazione.
- [OK] Nessuna frase di attivazione: commercial go-live approved: La policy non deve sembrare un'approvazione.
- [OK] Effetto dashboard corretto: La policy puÃ² solo candidare il blocco a giallo, non verde.
- [OK] Approvazione proprietario richiesta: Serve approvazione per qualsiasi budget reale.
