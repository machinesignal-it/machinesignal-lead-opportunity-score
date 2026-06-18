# Report controllo terms/privacy/data readiness

Data controllo: 2026-06-18

Esito: SUPERATO

Controlli superati: 112/112

Sintesi:

- La bozza definisce dati ammessi e vietati in sandbox.
- Dati reali e personali restano bloccati.
- Termini e privacy non sono finali e non sono approvati.
- Il blocco terms_privacy_data_readiness puÃ² diventare candidato giallo, ma non verde senza approvazione, testi finali e filtro tecnico.

Dettaglio controlli:

- [OK] Documento Markdown presente: La bozza leggibile deve esistere.
- [OK] Documento JSON presente: La bozza macchina deve esistere.
- [OK] Lingua italiana dichiarata: La bozza deve essere in italiano.
- [OK] Stato bozza interna: La bozza deve restare interna.
- [OK] Nessuna attivazione commerciale: La bozza non deve attivare beta o go-live.
- [OK] Non legale finale: Non deve sembrare testo legale finale.
- [OK] Privacy non finale: Non deve sembrare privacy finale.
- [OK] Dati reali non ammessi: I dati reali devono restare bloccati.
- [OK] Dati personali non ammessi: I dati personali devono restare bloccati.
- [OK] Azione vietata dichiarata: real_payments: La bozza deve confermare che questa azione resta vietata.
- [OK] Azione vietata dichiarata: invoices: La bozza deve confermare che questa azione resta vietata.
- [OK] Azione vietata dichiarata: payment_method_collection: La bozza deve confermare che questa azione resta vietata.
- [OK] Azione vietata dichiarata: production_api_keys: La bozza deve confermare che questa azione resta vietata.
- [OK] Azione vietata dichiarata: real_customer_data: La bozza deve confermare che questa azione resta vietata.
- [OK] Azione vietata dichiarata: personal_data: La bozza deve confermare che questa azione resta vietata.
- [OK] Azione vietata dichiarata: sensitive_data: La bozza deve confermare che questa azione resta vietata.
- [OK] Azione vietata dichiarata: external_outreach: La bozza deve confermare che questa azione resta vietata.
- [OK] Azione vietata dichiarata: marketplace_publication: La bozza deve confermare che questa azione resta vietata.
- [OK] Azione vietata dichiarata: hosted_public_mcp: La bozza deve confermare che questa azione resta vietata.
- [OK] Azione vietata dichiarata: mcp_registry_publication: La bozza deve confermare che questa azione resta vietata.
- [OK] Azione vietata dichiarata: commercial_go_live: La bozza deve confermare che questa azione resta vietata.
- [OK] Dato consentito ora presente: demo_domains: Devono essere chiari i soli dati ammessi ora.
- [OK] Dato consentito ora presente: synthetic_companies: Devono essere chiari i soli dati ammessi ora.
- [OK] Dato consentito ora presente: synthetic_datasets: Devono essere chiari i soli dati ammessi ora.
- [OK] Dato consentito ora presente: sandbox_requests_without_real_or_personal_data: Devono essere chiari i soli dati ammessi ora.
- [OK] Dato consentito ora presente: simulated_outputs: Devono essere chiari i soli dati ammessi ora.
- [OK] Dato consentito ora presente: nowrite_tests: Devono essere chiari i soli dati ammessi ora.
- [OK] Dato vietato ora presente: personal_data: Devono essere chiari i dati vietati ora.
- [OK] Dato vietato ora presente: natural_person_names: Devono essere chiari i dati vietati ora.
- [OK] Dato vietato ora presente: personal_or_identifiable_emails: Devono essere chiari i dati vietati ora.
- [OK] Dato vietato ora presente: phone_numbers: Devono essere chiari i dati vietati ora.
- [OK] Dato vietato ora presente: real_customer_or_prospect_lists: Devono essere chiari i dati vietati ora.
- [OK] Dato vietato ora presente: purchased_databases: Devono essere chiari i dati vietati ora.
- [OK] Dato vietato ora presente: personal_data_scraping: Devono essere chiari i dati vietati ora.
- [OK] Dato vietato ora presente: sensitive_information: Devono essere chiari i dati vietati ora.
- [OK] Dato vietato ora presente: real_customer_file_uploads: Devono essere chiari i dati vietati ora.
- [OK] Dato vietato ora presente: real_campaign_processing: Devono essere chiari i dati vietati ora.
- [OK] Dato vietato ora presente: person_profiling: Devono essere chiari i dati vietati ora.
- [OK] Dato vietato ora presente: person_scoring: Devono essere chiari i dati vietati ora.
- [OK] Classe input presente: synthetic_ok: Ogni input deve essere classificabile.
- [OK] Classe input presente: demo_domain_ok: Ogni input deve essere classificabile.
- [OK] Classe input presente: public_company_domain_low_risk: Ogni input deve essere classificabile.
- [OK] Classe input presente: real_company_dataset_blocked: Ogni input deve essere classificabile.
- [OK] Classe input presente: personal_data_blocked: Ogni input deve essere classificabile.
- [OK] Classe input presente: sensitive_data_blocked: Ogni input deve essere classificabile.
- [OK] Classe input presente: unknown_requires_review: Ogni input deve essere classificabile.
- [OK] Classe input bloccata: real_company_dataset_blocked: Le classi rischiose devono bloccare.
- [OK] Classe input bloccata: personal_data_blocked: Le classi rischiose devono bloccare.
- [OK] Classe input bloccata: sensitive_data_blocked: Le classi rischiose devono bloccare.
- [OK] Classe input bloccata: unknown_requires_review: Le classi rischiose devono bloccare.
- [OK] Risposta blocco dati non consuma crediti: Un input dati bloccato non deve consumare crediti.
- [OK] Risposta blocco dati richiede escalation: Dati reali/personali devono scalare.
- [OK] Termine richiesto presente: terms_of_use: I termini minimi devono essere elencati.
- [OK] Termine richiesto presente: service_description: I termini minimi devono essere elencati.
- [OK] Termine richiesto presente: liability_limitations: I termini minimi devono essere elencati.
- [OK] Termine richiesto presente: automated_output_rules: I termini minimi devono essere elencati.
- [OK] Termine richiesto presente: score_and_decision_rules: I termini minimi devono essere elencati.
- [OK] Termine richiesto presente: no_person_decisioning_rule: I termini minimi devono essere elencati.
- [OK] Termine richiesto presente: credit_consumption_and_restoration_rules: I termini minimi devono essere elencati.
- [OK] Termine richiesto presente: support_and_escalation_rules: I termini minimi devono essere elencati.
- [OK] Termine richiesto presente: cost_cap_and_kill_switch_rules: I termini minimi devono essere elencati.
- [OK] Termine richiesto presente: api_key_and_revocation_rules: I termini minimi devono essere elencati.
- [OK] Termine richiesto presente: allowed_and_blocked_data_rules: I termini minimi devono essere elencati.
- [OK] Privacy richiesta presente: privacy_policy: La privacy minima deve essere elencata.
- [OK] Privacy richiesta presente: data_processing_note: La privacy minima deve essere elencata.
- [OK] Privacy richiesta presente: allowed_data_categories: La privacy minima deve essere elencata.
- [OK] Privacy richiesta presente: blocked_data_categories: La privacy minima deve essere elencata.
- [OK] Privacy richiesta presente: retention_policy: La privacy minima deve essere elencata.
- [OK] Privacy richiesta presente: deletion_policy: La privacy minima deve essere elencata.
- [OK] Privacy richiesta presente: incident_contact_path: La privacy minima deve essere elencata.
- [OK] Privacy richiesta presente: personal_data_block_until_approval: La privacy minima deve essere elencata.
- [OK] Regola dati prodotto presente: target_discovery: Ogni prodotto principale deve avere regole dati.
- [OK] Regola dati ammessi prodotto: target_discovery: Ogni prodotto deve dire cosa Ã¨ ammesso.
- [OK] Regola dati vietati prodotto: target_discovery: Ogni prodotto deve dire cosa Ã¨ vietato.
- [OK] Regola dati prodotto presente: score_pack_1k: Ogni prodotto principale deve avere regole dati.
- [OK] Regola dati ammessi prodotto: score_pack_1k: Ogni prodotto deve dire cosa Ã¨ ammesso.
- [OK] Regola dati vietati prodotto: score_pack_1k: Ogni prodotto deve dire cosa Ã¨ vietato.
- [OK] Regola dati prodotto presente: domain_enrichment: Ogni prodotto principale deve avere regole dati.
- [OK] Regola dati ammessi prodotto: domain_enrichment: Ogni prodotto deve dire cosa Ã¨ ammesso.
- [OK] Regola dati vietati prodotto: domain_enrichment: Ogni prodotto deve dire cosa Ã¨ vietato.
- [OK] Regola dati prodotto presente: deep_analysis: Ogni prodotto principale deve avere regole dati.
- [OK] Regola dati ammessi prodotto: deep_analysis: Ogni prodotto deve dire cosa Ã¨ ammesso.
- [OK] Regola dati vietati prodotto: deep_analysis: Ogni prodotto deve dire cosa Ã¨ vietato.
- [OK] Regola dati prodotto presente: action_pack: Ogni prodotto principale deve avere regole dati.
- [OK] Regola dati ammessi prodotto: action_pack: Ogni prodotto deve dire cosa Ã¨ ammesso.
- [OK] Regola dati vietati prodotto: action_pack: Ogni prodotto deve dire cosa Ã¨ vietato.
- [OK] Regola dati prodotto presente: opportunity_feed: Ogni prodotto principale deve avere regole dati.
- [OK] Regola dati ammessi prodotto: opportunity_feed: Ogni prodotto deve dire cosa Ã¨ ammesso.
- [OK] Regola dati vietati prodotto: opportunity_feed: Ogni prodotto deve dire cosa Ã¨ vietato.
- [OK] Regola dati prodotto presente: api_starter: Ogni prodotto principale deve avere regole dati.
- [OK] Regola dati ammessi prodotto: api_starter: Ogni prodotto deve dire cosa Ã¨ ammesso.
- [OK] Regola dati vietati prodotto: api_starter: Ogni prodotto deve dire cosa Ã¨ vietato.
- [OK] Regola dati prodotto presente: api_pro: Ogni prodotto principale deve avere regole dati.
- [OK] Regola dati ammessi prodotto: api_pro: Ogni prodotto deve dire cosa Ã¨ ammesso.
- [OK] Regola dati vietati prodotto: api_pro: Ogni prodotto deve dire cosa Ã¨ vietato.
- [OK] Frase chiave Markdown: solo con dati sintetici: Il Markdown deve essere chiaro per il proprietario.
- [OK] Frase chiave Markdown: vietato ora: Il Markdown deve essere chiaro per il proprietario.
- [OK] Frase chiave Markdown: Regola input: Il Markdown deve essere chiaro per il proprietario.
- [OK] Frase chiave Markdown: Risposta macchina per dati bloccati: Il Markdown deve essere chiaro per il proprietario.
- [OK] Frase chiave Markdown: Divieti confermati: Il Markdown deve essere chiaro per il proprietario.
- [OK] Frase chiave Markdown: Nessun dato personale: Il Markdown deve essere chiaro per il proprietario.
- [OK] Nessuna frase di attivazione: dati reali ammessi: La bozza non deve sembrare un'approvazione.
- [OK] Nessuna frase di attivazione: dati personali ammessi: La bozza non deve sembrare un'approvazione.
- [OK] Nessuna frase di attivazione: privacy finale approvata: La bozza non deve sembrare un'approvazione.
- [OK] Nessuna frase di attivazione: termini approvati: La bozza non deve sembrare un'approvazione.
- [OK] Nessuna frase di attivazione: pagamenti reali attivi: La bozza non deve sembrare un'approvazione.
- [OK] Nessuna frase di attivazione: chiavi production autorizzate: La bozza non deve sembrare un'approvazione.
- [OK] Nessuna frase di attivazione: go-live commerciale approvato: La bozza non deve sembrare un'approvazione.
- [OK] Nessuna frase di attivazione: real data allowed: La bozza non deve sembrare un'approvazione.
- [OK] Nessuna frase di attivazione: personal data allowed: La bozza non deve sembrare un'approvazione.
- [OK] Nessuna frase di attivazione: commercial go-live approved: La bozza non deve sembrare un'approvazione.
- [OK] Effetto dashboard corretto: La bozza puÃ² solo candidare il blocco a giallo.
