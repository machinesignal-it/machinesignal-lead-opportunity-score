# Report controllo modello supporto/escalation

Data controllo: 2026-06-18

Esito: SUPERATO

Controlli superati: 108/108

Sintesi:

- Il modello definisce livelli L0-L4, classi problema, ticket e regole di escalation.
- Gli agenti possono gestire i casi normali, ma devono scalare rischio, costi, dati reali/personali, chiavi production e decisioni commerciali.
- Il modello non autorizza pagamenti, fatture, dati reali, outreach o go-live.
- Il blocco support_escalation_model puÃ² diventare candidato giallo, ma non verde senza approvazione e simulazione.

Dettaglio controlli:

- [OK] Documento Markdown presente: Il modello leggibile deve esistere.
- [OK] Documento JSON presente: Il modello macchina deve esistere.
- [OK] Lingua italiana dichiarata: Il modello deve essere in italiano.
- [OK] Stato bozza interna: Il modello deve restare bozza interna.
- [OK] Nessuna attivazione commerciale: Il modello non deve attivare beta o go-live.
- [OK] Azione vietata dichiarata: real_payments: Il modello deve confermare che questa azione resta vietata.
- [OK] Azione vietata dichiarata: invoices: Il modello deve confermare che questa azione resta vietata.
- [OK] Azione vietata dichiarata: monetary_refunds: Il modello deve confermare che questa azione resta vietata.
- [OK] Azione vietata dichiarata: payment_method_collection: Il modello deve confermare che questa azione resta vietata.
- [OK] Azione vietata dichiarata: production_api_keys: Il modello deve confermare che questa azione resta vietata.
- [OK] Azione vietata dichiarata: real_customer_data: Il modello deve confermare che questa azione resta vietata.
- [OK] Azione vietata dichiarata: personal_data: Il modello deve confermare che questa azione resta vietata.
- [OK] Azione vietata dichiarata: external_outreach: Il modello deve confermare che questa azione resta vietata.
- [OK] Azione vietata dichiarata: marketplace_publication: Il modello deve confermare che questa azione resta vietata.
- [OK] Azione vietata dichiarata: hosted_public_mcp: Il modello deve confermare che questa azione resta vietata.
- [OK] Azione vietata dichiarata: mcp_registry_publication: Il modello deve confermare che questa azione resta vietata.
- [OK] Azione vietata dichiarata: commercial_go_live: Il modello deve confermare che questa azione resta vietata.
- [OK] Livello supporto presente: L0: Ogni livello L0-L4 deve essere mappato.
- [OK] Livello supporto presente: L1: Ogni livello L0-L4 deve essere mappato.
- [OK] Livello supporto presente: L2: Ogni livello L0-L4 deve essere mappato.
- [OK] Livello supporto presente: L3: Ogni livello L0-L4 deve essere mappato.
- [OK] Livello supporto presente: L4: Ogni livello L0-L4 deve essere mappato.
- [OK] Classe problema presente: invalid_input: Ogni classe problema deve essere prevista.
- [OK] Classe problema con risposta: invalid_input: Ogni classe deve avere risposta automatica.
- [OK] Classe problema con escalation: invalid_input: Ogni classe deve indicare escalation.
- [OK] Classe problema presente: duplicate: Ogni classe problema deve essere prevista.
- [OK] Classe problema con risposta: duplicate: Ogni classe deve avere risposta automatica.
- [OK] Classe problema con escalation: duplicate: Ogni classe deve indicare escalation.
- [OK] Classe problema presente: insufficient_signal: Ogni classe problema deve essere prevista.
- [OK] Classe problema con risposta: insufficient_signal: Ogni classe deve avere risposta automatica.
- [OK] Classe problema con escalation: insufficient_signal: Ogni classe deve indicare escalation.
- [OK] Classe problema presente: blocked_by_policy: Ogni classe problema deve essere prevista.
- [OK] Classe problema con risposta: blocked_by_policy: Ogni classe deve avere risposta automatica.
- [OK] Classe problema con escalation: blocked_by_policy: Ogni classe deve indicare escalation.
- [OK] Classe problema presente: cost_cap_exceeded: Ogni classe problema deve essere prevista.
- [OK] Classe problema con risposta: cost_cap_exceeded: Ogni classe deve avere risposta automatica.
- [OK] Classe problema con escalation: cost_cap_exceeded: Ogni classe deve indicare escalation.
- [OK] Classe problema presente: technical_error: Ogni classe problema deve essere prevista.
- [OK] Classe problema con risposta: technical_error: Ogni classe deve avere risposta automatica.
- [OK] Classe problema con escalation: technical_error: Ogni classe deve indicare escalation.
- [OK] Classe problema presente: disputed_output: Ogni classe problema deve essere prevista.
- [OK] Classe problema con risposta: disputed_output: Ogni classe deve avere risposta automatica.
- [OK] Classe problema con escalation: disputed_output: Ogni classe deve indicare escalation.
- [OK] Classe problema presente: refund_credit_request: Ogni classe problema deve essere prevista.
- [OK] Classe problema con risposta: refund_credit_request: Ogni classe deve avere risposta automatica.
- [OK] Classe problema con escalation: refund_credit_request: Ogni classe deve indicare escalation.
- [OK] Classe problema presente: production_key_request: Ogni classe problema deve essere prevista.
- [OK] Classe problema con risposta: production_key_request: Ogni classe deve avere risposta automatica.
- [OK] Classe problema con escalation: production_key_request: Ogni classe deve indicare escalation.
- [OK] Classe problema presente: payment_invoice_request: Ogni classe problema deve essere prevista.
- [OK] Classe problema con risposta: payment_invoice_request: Ogni classe deve avere risposta automatica.
- [OK] Classe problema con escalation: payment_invoice_request: Ogni classe deve indicare escalation.
- [OK] Classe problema presente: external_publication_request: Ogni classe problema deve essere prevista.
- [OK] Classe problema con risposta: external_publication_request: Ogni classe deve avere risposta automatica.
- [OK] Classe problema con escalation: external_publication_request: Ogni classe deve indicare escalation.
- [OK] Classe problema presente: security_incident: Ogni classe problema deve essere prevista.
- [OK] Classe problema con risposta: security_incident: Ogni classe deve avere risposta automatica.
- [OK] Classe problema con escalation: security_incident: Ogni classe deve indicare escalation.
- [OK] Escalation proprietario presente: real_payment_approval_needed: Le eccezioni critiche devono arrivare al proprietario.
- [OK] Escalation proprietario presente: invoice_needed: Le eccezioni critiche devono arrivare al proprietario.
- [OK] Escalation proprietario presente: real_or_personal_data_request: Le eccezioni critiche devono arrivare al proprietario.
- [OK] Escalation proprietario presente: production_key_request: Le eccezioni critiche devono arrivare al proprietario.
- [OK] Escalation proprietario presente: global_kill_switch_unlock: Le eccezioni critiche devono arrivare al proprietario.
- [OK] Escalation proprietario presente: potential_cost_above_zero: Le eccezioni critiche devono arrivare al proprietario.
- [OK] Escalation proprietario presente: repeated_customer_dispute: Le eccezioni critiche devono arrivare al proprietario.
- [OK] Escalation proprietario presente: policy_listino_terms_change: Le eccezioni critiche devono arrivare al proprietario.
- [OK] Escalation proprietario presente: marketplace_mcp_registry_publication_request: Le eccezioni critiche devono arrivare al proprietario.
- [OK] Escalation proprietario presente: security_incident_suspected: Le eccezioni critiche devono arrivare al proprietario.
- [OK] Escalation proprietario presente: legal_fiscal_reputational_risk: Le eccezioni critiche devono arrivare al proprietario.
- [OK] Campo ticket presente: ticket_id: Il ticket deve poter ricostruire il caso.
- [OK] Campo ticket presente: timestamp: Il ticket deve poter ricostruire il caso.
- [OK] Campo ticket presente: support_level: Il ticket deve poter ricostruire il caso.
- [OK] Campo ticket presente: support_code: Il ticket deve poter ricostruire il caso.
- [OK] Campo ticket presente: customer_id_or_sandbox_customer_id: Il ticket deve poter ricostruire il caso.
- [OK] Campo ticket presente: request_id: Il ticket deve poter ricostruire il caso.
- [OK] Campo ticket presente: product_code: Il ticket deve poter ricostruire il caso.
- [OK] Campo ticket presente: issue_class: Il ticket deve poter ricostruire il caso.
- [OK] Campo ticket presente: credits_consumed: Il ticket deve poter ricostruire il caso.
- [OK] Campo ticket presente: credit_action: Il ticket deve poter ricostruire il caso.
- [OK] Campo ticket presente: policy_reference: Il ticket deve poter ricostruire il caso.
- [OK] Campo ticket presente: owner_escalation_required: Il ticket deve poter ricostruire il caso.
- [OK] Campo ticket presente: next_action: Il ticket deve poter ricostruire il caso.
- [OK] Campo ticket presente: resolution: Il ticket deve poter ricostruire il caso.
- [OK] Azione supporto vietata: promise_monetary_refund: Gli agenti non devono fare promesse o attivazioni non approvate.
- [OK] Azione supporto vietata: promise_invoice: Gli agenti non devono fare promesse o attivazioni non approvate.
- [OK] Azione supporto vietata: promise_production_key: Gli agenti non devono fare promesse o attivazioni non approvate.
- [OK] Azione supporto vietata: accept_real_or_personal_data: Gli agenti non devono fare promesse o attivazioni non approvate.
- [OK] Azione supporto vietata: external_email_or_outreach: Gli agenti non devono fare promesse o attivazioni non approvate.
- [OK] Azione supporto vietata: change_listino_or_policy_without_approval: Gli agenti non devono fare promesse o attivazioni non approvate.
- [OK] Azione supporto vietata: unlock_global_cost_cap_without_approval: Gli agenti non devono fare promesse o attivazioni non approvate.
- [OK] Azione supporto vietata: buy_services_or_upgrades: Gli agenti non devono fare promesse o attivazioni non approvate.
- [OK] Azione supporto vietata: publish_marketplace_registry_or_hosted_mcp: Gli agenti non devono fare promesse o attivazioni non approvate.
- [OK] Frase chiave Markdown: supporto deve essere machine-first: Il Markdown deve essere comprensibile.
- [OK] Frase chiave Markdown: Quando gli agenti possono risolvere da soli: Il Markdown deve essere comprensibile.
- [OK] Frase chiave Markdown: Quando devono scalare al proprietario: Il Markdown deve essere comprensibile.
- [OK] Frase chiave Markdown: Ticket interno: Il Markdown deve essere comprensibile.
- [OK] Frase chiave Markdown: Azioni vietate nel supporto: Il Markdown deve essere comprensibile.
- [OK] Frase chiave Markdown: Divieti confermati: Il Markdown deve essere comprensibile.
- [OK] Nessuna frase di attivazione: pagamenti reali attivi: Il modello non deve sembrare un'approvazione.
- [OK] Nessuna frase di attivazione: fatture attive: Il modello non deve sembrare un'approvazione.
- [OK] Nessuna frase di attivazione: rimborso monetario promesso: Il modello non deve sembrare un'approvazione.
- [OK] Nessuna frase di attivazione: chiavi production autorizzate: Il modello non deve sembrare un'approvazione.
- [OK] Nessuna frase di attivazione: dati reali autorizzati: Il modello non deve sembrare un'approvazione.
- [OK] Nessuna frase di attivazione: outreach autorizzato: Il modello non deve sembrare un'approvazione.
- [OK] Nessuna frase di attivazione: go-live commerciale approvato: Il modello non deve sembrare un'approvazione.
- [OK] Nessuna frase di attivazione: support_escalation_model approved: Il modello non deve sembrare un'approvazione.
- [OK] Nessuna frase di attivazione: commercial go-live approved: Il modello non deve sembrare un'approvazione.
- [OK] Effetto dashboard corretto: Il modello puÃ² solo candidare il blocco a giallo.
