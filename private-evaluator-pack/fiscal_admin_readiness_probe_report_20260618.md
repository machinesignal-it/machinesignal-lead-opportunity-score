# Report controllo Fiscal/Admin Readiness

Data controllo: 2026-06-18

Esito: SUPERATO

Controlli superati: 99/99

Sintesi:

- Il documento fiscal/admin e' una bozza interna, non una consulenza fiscale.
- Non autorizza pagamenti, fatture, metodi di pagamento, abbonamenti reali o beta a pagamento.
- Definisce decisioni, campi billing, oggetti economici e blocchi macchina.
- Propone fiscal_admin_readiness come candidato giallo, non come gate verde.

Dettaglio controlli:

- [OK] Documento italiano: Il report deve essere in italiano.
- [OK] Stato bozza interna non consulenza: Deve essere una bozza interna, non consulenza fiscale.
- [OK] Attivazione commerciale falsa: Non deve autorizzare attivazione commerciale.
- [OK] Beta a pagamento non ammessa: Non deve autorizzare beta a pagamento.
- [OK] Pagamenti reali non ammessi: Non deve autorizzare pagamenti reali.
- [OK] Fatture non ammesse: Non deve autorizzare fatture.
- [OK] Raccolta metodo pagamento non ammessa: Non deve raccogliere carte o metodi di pagamento.
- [OK] Non e' parere fiscale finale: Non deve sostituire parere fiscale.
- [OK] Decisione richiesta presente: forma_operativa_per_vendere: La checklist deve includere questa decisione.
- [OK] Decisione richiesta presente: partita_iva_o_altra_struttura: La checklist deve includere questa decisione.
- [OK] Decisione richiesta presente: codice_attivita_e_regime_fiscale: La checklist deve includere questa decisione.
- [OK] Decisione richiesta presente: regole_iva_clienti_italia_ue_extra_ue: La checklist deve includere questa decisione.
- [OK] Decisione richiesta presente: documento_fiscale_da_emettere: La checklist deve includere questa decisione.
- [OK] Decisione richiesta presente: momento_emissione_documento: La checklist deve includere questa decisione.
- [OK] Decisione richiesta presente: dati_minimi_fatturazione: La checklist deve includere questa decisione.
- [OK] Decisione richiesta presente: cliente_macchina_con_soggetto_umano_o_societario: La checklist deve includere questa decisione.
- [OK] Decisione richiesta presente: riconciliazione_ordini_crediti_pagamenti_fatture: La checklist deve includere questa decisione.
- [OK] Decisione richiesta presente: regole_crediti_sostitutivi_riaccrediti_rimborsi: La checklist deve includere questa decisione.
- [OK] Decisione richiesta presente: limiti_costo_e_responsabilita_amministrativa: La checklist deve includere questa decisione.
- [OK] Decisione richiesta presente: conservazione_documenti_e_registro_operazioni: La checklist deve includere questa decisione.
- [OK] Oggetto economico presente: pay_per_score: Il modello economico deve essere coperto.
- [OK] Oggetto economico presente: score_pack_1k: Il modello economico deve essere coperto.
- [OK] Oggetto economico presente: deep_analysis_pack: Il modello economico deve essere coperto.
- [OK] Oggetto economico presente: action_pack: Il modello economico deve essere coperto.
- [OK] Oggetto economico presente: api_subscription: Il modello economico deve essere coperto.
- [OK] Oggetto economico presente: replacement_credits: Il modello economico deve essere coperto.
- [OK] Oggetto economico presente: cash_refund: Il modello economico deve essere coperto.
- [OK] Campo billing presente: customer_type: Il profilo billing minimo deve includere questo campo.
- [OK] Campo billing presente: country: Il profilo billing minimo deve includere questo campo.
- [OK] Campo billing presente: legal_name_or_person_name: Il profilo billing minimo deve includere questo campo.
- [OK] Campo billing presente: billing_address: Il profilo billing minimo deve includere questo campo.
- [OK] Campo billing presente: tax_identifier_if_required: Il profilo billing minimo deve includere questo campo.
- [OK] Campo billing presente: vat_number_if_applicable: Il profilo billing minimo deve includere questo campo.
- [OK] Campo billing presente: admin_email: Il profilo billing minimo deve includere questo campo.
- [OK] Campo billing presente: terms_acceptance: Il profilo billing minimo deve includere questo campo.
- [OK] Campo billing presente: credit_replacement_refund_terms_acceptance: Il profilo billing minimo deve includere questo campo.
- [OK] Campo billing presente: approved_payment_channel: Il profilo billing minimo deve includere questo campo.
- [OK] Campo billing presente: customer_id: Il profilo billing minimo deve includere questo campo.
- [OK] Risposta bloccata status corretto: La macchina deve ricevere uno stato bloccato.
- [OK] Risposta bloccata stop: La decisione deve essere stop.
- [OK] Crediti consumati zero: Nessun credito deve essere consumato.
- [OK] Pagamento falso: Nessun pagamento reale.
- [OK] Fattura falsa: Nessuna fattura.
- [OK] Escalation proprietario richiesta: Serve decisione proprietario.
- [OK] Support code corretto: Il codice deve essere stabile.
- [OK] Controllo prima del verde presente: owner_decision_on_fiscal_path: Il gate verde deve richiedere questo controllo.
- [OK] Controllo prima del verde presente: documented_piva_or_alternative_operating_rule: Il gate verde deve richiedere questo controllo.
- [OK] Controllo prima del verde presente: documented_vat_and_fiscal_document_rule: Il gate verde deve richiedere questo controllo.
- [OK] Controllo prima del verde presente: invoice_process_selected: Il gate verde deve richiedere questo controllo.
- [OK] Controllo prima del verde presente: payment_process_selected: Il gate verde deve richiedere questo controllo.
- [OK] Controllo prima del verde presente: minimum_billing_profile_implemented: Il gate verde deve richiedere questo controllo.
- [OK] Controllo prima del verde presente: orders_credits_payments_invoices_reconcilable: Il gate verde deve richiedere questo controllo.
- [OK] Controllo prima del verde presente: replacement_credit_and_refund_rule_approved: Il gate verde deve richiedere questo controllo.
- [OK] Controllo prima del verde presente: sandbox_test_payment_false_invoice_false: Il gate verde deve richiedere questo controllo.
- [OK] Controllo prima del verde presente: pre_production_test_only_after_owner_approval: Il gate verde deve richiedere questo controllo.
- [OK] Controllo prima del verde presente: company_brain_and_dashboard_updated: Il gate verde deve richiedere questo controllo.
- [OK] Controllo prima del verde presente: no_secret_or_personal_data_published: Il gate verde deve richiedere questo controllo.
- [OK] Azione agente ammessa: prepare_fiscal_admin_checklists: Gli agenti devono poter preparare senza attivare.
- [OK] Azione agente ammessa: generate_owner_questions: Gli agenti devono poter preparare senza attivare.
- [OK] Azione agente ammessa: simulate_order_reconciliation_without_real_money: Gli agenti devono poter preparare senza attivare.
- [OK] Azione agente ammessa: verify_blocked_api_responses: Gli agenti devono poter preparare senza attivare.
- [OK] Azione agente ammessa: update_pnl_and_sandbox_ledger: Gli agenti devono poter preparare senza attivare.
- [OK] Azione agente ammessa: verify_no_invoices_are_issued: Gli agenti devono poter preparare senza attivare.
- [OK] Azione agente ammessa: propose_billing_profile_fields: Gli agenti devono poter preparare senza attivare.
- [OK] Azione agente ammessa: prepare_italian_reports: Gli agenti devono poter preparare senza attivare.
- [OK] Divieto agente presente: decide_finally_whether_piva_is_required: Gli agenti non devono fare questa azione.
- [OK] Divieto agente presente: replace_official_tax_advice: Gli agenti non devono fare questa azione.
- [OK] Divieto agente presente: execute_real_payment: Gli agenti non devono fare questa azione.
- [OK] Divieto agente presente: issue_invoice: Gli agenti non devono fare questa azione.
- [OK] Divieto agente presente: collect_card_or_payment_method: Gli agenti non devono fare questa azione.
- [OK] Divieto agente presente: activate_real_subscription: Gli agenti non devono fare questa azione.
- [OK] Divieto agente presente: convert_simulation_to_real_sale: Gli agenti non devono fare questa azione.
- [OK] Divieto agente presente: declare_business_tax_ready: Gli agenti non devono fare questa azione.
- [OK] Effetto dashboard candidato giallo: Il documento deve proporre solo candidato giallo.
- [OK] Prossima azione sandbox/no-write: La prossima azione deve restare no-write/sandbox.
- [OK] Frase MD presente: non consulenza fiscale: Il Markdown deve spiegare chiaramente questo punto.
- [OK] Frase MD presente: non approvazione commerciale: Il Markdown deve spiegare chiaramente questo punto.
- [OK] Frase MD presente: Regola principale: Il Markdown deve spiegare chiaramente questo punto.
- [OK] Frase MD presente: Cosa deve essere deciso prima della beta a pagamento: Il Markdown deve spiegare chiaramente questo punto.
- [OK] Frase MD presente: Billing profile minimo: Il Markdown deve spiegare chiaramente questo punto.
- [OK] Frase MD presente: Risposta macchina per acquisto non pronto: Il Markdown deve spiegare chiaramente questo punto.
- [OK] Frase MD presente: Controlli minimi prima del passaggio a verde: Il Markdown deve spiegare chiaramente questo punto.
- [OK] Frase MD presente: Gli agenti non possono: Il Markdown deve spiegare chiaramente questo punto.
- [OK] Frase MD presente: da rosso a candidato giallo: Il Markdown deve spiegare chiaramente questo punto.
- [OK] Nessuna frase pericolosa: "paid_beta_allowed": true: Non devono comparire affermazioni fiscali o commerciali non autorizzate.
- [OK] Nessuna frase pericolosa: "real_payments_allowed": true: Non devono comparire affermazioni fiscali o commerciali non autorizzate.
- [OK] Nessuna frase pericolosa: "invoices_allowed": true: Non devono comparire affermazioni fiscali o commerciali non autorizzate.
- [OK] Nessuna frase pericolosa: "payment_method_collection_allowed": true: Non devono comparire affermazioni fiscali o commerciali non autorizzate.
- [OK] Nessuna frase pericolosa: "final_tax_advice": true: Non devono comparire affermazioni fiscali o commerciali non autorizzate.
- [OK] Nessuna frase pericolosa: Partita IVA non serve: Non devono comparire affermazioni fiscali o commerciali non autorizzate.
- [OK] Nessuna frase pericolosa: Partita IVA non e' necessaria: Non devono comparire affermazioni fiscali o commerciali non autorizzate.
- [OK] Nessuna frase pericolosa: puoi incassare: Non devono comparire affermazioni fiscali o commerciali non autorizzate.
- [OK] Nessuna frase pericolosa: puoi emettere fattura: Non devono comparire affermazioni fiscali o commerciali non autorizzate.
- [OK] Nessuna frase pericolosa: fiscalmente pronto: Non devono comparire affermazioni fiscali o commerciali non autorizzate.
- [OK] Nessuna frase pericolosa: tax ready: Non devono comparire affermazioni fiscali o commerciali non autorizzate.
- [OK] Nessuna frase pericolosa: commercial activation approved: Non devono comparire affermazioni fiscali o commerciali non autorizzate.
- [OK] Nessuna frase pericolosa: paid beta approved: Non devono comparire affermazioni fiscali o commerciali non autorizzate.
- [OK] Nessuna frase pericolosa: real payments active: Non devono comparire affermazioni fiscali o commerciali non autorizzate.
- [OK] Nessuna frase pericolosa: "invoice_issued": true: Non devono comparire affermazioni fiscali o commerciali non autorizzate.
