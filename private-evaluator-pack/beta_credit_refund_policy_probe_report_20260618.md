# Report controllo policy crediti/rimborsi beta

Data controllo: 2026-06-18

Esito: SUPERATO

Controlli superati: 78/78

Sintesi:

- La policy definisce quando un credito si consuma, non si consuma o viene ripristinato.
- Il rimborso previsto in beta Ã¨ solo tecnico, cioÃ¨ ripristino credito.
- La policy non autorizza pagamenti, fatture, dati reali, chiavi production o go-live.
- Il blocco credit_refund_policy puÃ² diventare candidato giallo, ma non verde senza approvazione.

Dettaglio controlli:

- [OK] Documento Markdown presente: La policy leggibile deve esistere.
- [OK] Documento JSON presente: La policy macchina deve esistere.
- [OK] Lingua italiana dichiarata: La policy owner-facing deve essere in italiano.
- [OK] Stato bozza interna: La policy deve essere una bozza interna.
- [OK] Nessuna attivazione commerciale: La policy non deve attivare beta o go-live.
- [OK] Nessun rimborso monetario reale: In beta il rimborso deve essere solo tecnico.
- [OK] Sintesi italiana presente: Il JSON deve contenere sintesi chiara per il proprietario.
- [OK] Azione vietata dichiarata: real_payments: La policy deve confermare che questa azione resta vietata.
- [OK] Azione vietata dichiarata: invoices: La policy deve confermare che questa azione resta vietata.
- [OK] Azione vietata dichiarata: monetary_refunds: La policy deve confermare che questa azione resta vietata.
- [OK] Azione vietata dichiarata: payment_method_collection: La policy deve confermare che questa azione resta vietata.
- [OK] Azione vietata dichiarata: production_api_keys: La policy deve confermare che questa azione resta vietata.
- [OK] Azione vietata dichiarata: real_customer_data: La policy deve confermare che questa azione resta vietata.
- [OK] Azione vietata dichiarata: personal_data: La policy deve confermare che questa azione resta vietata.
- [OK] Azione vietata dichiarata: external_outreach: La policy deve confermare che questa azione resta vietata.
- [OK] Azione vietata dichiarata: commercial_go_live: La policy deve confermare che questa azione resta vietata.
- [OK] Regola prodotto presente: target_discovery: Ogni prodotto principale deve avere una regola crediti.
- [OK] Regola consumo presente: target_discovery: Deve dire quando consuma.
- [OK] Regola non consumo presente: target_discovery: Deve dire quando non consuma.
- [OK] Regola prodotto presente: score_pack_1k: Ogni prodotto principale deve avere una regola crediti.
- [OK] Regola consumo presente: score_pack_1k: Deve dire quando consuma.
- [OK] Regola non consumo presente: score_pack_1k: Deve dire quando non consuma.
- [OK] Regola prodotto presente: domain_enrichment: Ogni prodotto principale deve avere una regola crediti.
- [OK] Regola consumo presente: domain_enrichment: Deve dire quando consuma.
- [OK] Regola non consumo presente: domain_enrichment: Deve dire quando non consuma.
- [OK] Regola prodotto presente: deep_analysis: Ogni prodotto principale deve avere una regola crediti.
- [OK] Regola consumo presente: deep_analysis: Deve dire quando consuma.
- [OK] Regola non consumo presente: deep_analysis: Deve dire quando non consuma.
- [OK] Regola prodotto presente: action_pack: Ogni prodotto principale deve avere una regola crediti.
- [OK] Regola consumo presente: action_pack: Deve dire quando consuma.
- [OK] Regola non consumo presente: action_pack: Deve dire quando non consuma.
- [OK] Regola prodotto presente: opportunity_feed: Ogni prodotto principale deve avere una regola crediti.
- [OK] Regola consumo presente: opportunity_feed: Deve dire quando consuma.
- [OK] Regola non consumo presente: opportunity_feed: Deve dire quando non consuma.
- [OK] Regola prodotto presente: api_starter: Ogni prodotto principale deve avere una regola crediti.
- [OK] Regola consumo presente: api_starter: Deve dire quando consuma.
- [OK] Regola non consumo presente: api_starter: Deve dire quando non consuma.
- [OK] Regola prodotto presente: api_pro: Ogni prodotto principale deve avere una regola crediti.
- [OK] Regola consumo presente: api_pro: Deve dire quando consuma.
- [OK] Regola non consumo presente: api_pro: Deve dire quando non consuma.
- [OK] Campo ledger presente: event_id: Il ledger deve poter spiegare e ricostruire il consumo crediti.
- [OK] Campo ledger presente: timestamp: Il ledger deve poter spiegare e ricostruire il consumo crediti.
- [OK] Campo ledger presente: customer_id_or_sandbox_customer_id: Il ledger deve poter spiegare e ricostruire il consumo crediti.
- [OK] Campo ledger presente: request_id: Il ledger deve poter spiegare e ricostruire il consumo crediti.
- [OK] Campo ledger presente: product_code: Il ledger deve poter spiegare e ricostruire il consumo crediti.
- [OK] Campo ledger presente: operation_type: Il ledger deve poter spiegare e ricostruire il consumo crediti.
- [OK] Campo ledger presente: input_hash: Il ledger deve poter spiegare e ricostruire il consumo crediti.
- [OK] Campo ledger presente: output_status: Il ledger deve poter spiegare e ricostruire il consumo crediti.
- [OK] Campo ledger presente: credits_before: Il ledger deve poter spiegare e ricostruire il consumo crediti.
- [OK] Campo ledger presente: credits_delta: Il ledger deve poter spiegare e ricostruire il consumo crediti.
- [OK] Campo ledger presente: credits_after: Il ledger deve poter spiegare e ricostruire il consumo crediti.
- [OK] Campo ledger presente: policy_version: Il ledger deve poter spiegare e ricostruire il consumo crediti.
- [OK] Campo ledger presente: environment: Il ledger deve poter spiegare e ricostruire il consumo crediti.
- [OK] Status output presente: valid_output: Gli status devono coprire casi validi e non validi.
- [OK] Status output presente: invalid_input: Gli status devono coprire casi validi e non validi.
- [OK] Status output presente: duplicate: Gli status devono coprire casi validi e non validi.
- [OK] Status output presente: insufficient_signal: Gli status devono coprire casi validi e non validi.
- [OK] Status output presente: technical_error: Gli status devono coprire casi validi e non validi.
- [OK] Status output presente: blocked_by_policy: Gli status devono coprire casi validi e non validi.
- [OK] Status output presente: credit_restored: Gli status devono coprire casi validi e non validi.
- [OK] Frase chiave Markdown: Un credito si consuma solo: Il Markdown deve essere comprensibile per il proprietario.
- [OK] Frase chiave Markdown: credito non si consuma: Il Markdown deve essere comprensibile per il proprietario.
- [OK] Frase chiave Markdown: rimborso tecnico: Il Markdown deve essere comprensibile per il proprietario.
- [OK] Frase chiave Markdown: Ledger crediti: Il Markdown deve essere comprensibile per il proprietario.
- [OK] Frase chiave Markdown: Divieti confermati: Il Markdown deve essere comprensibile per il proprietario.
- [OK] Frase chiave Markdown: Nessun pagamento reale: Il Markdown deve essere comprensibile per il proprietario.
- [OK] Nessuna frase di attivazione: pagamenti reali attivi: La policy non deve sembrare un'approvazione.
- [OK] Nessuna frase di attivazione: fatture attive: La policy non deve sembrare un'approvazione.
- [OK] Nessuna frase di attivazione: rimborso monetario attivo: La policy non deve sembrare un'approvazione.
- [OK] Nessuna frase di attivazione: raccolta carte attiva: La policy non deve sembrare un'approvazione.
- [OK] Nessuna frase di attivazione: chiavi production autorizzate: La policy non deve sembrare un'approvazione.
- [OK] Nessuna frase di attivazione: dati reali autorizzati: La policy non deve sembrare un'approvazione.
- [OK] Nessuna frase di attivazione: go-live commerciale approvato: La policy non deve sembrare un'approvazione.
- [OK] Nessuna frase di attivazione: real payments active: La policy non deve sembrare un'approvazione.
- [OK] Nessuna frase di attivazione: production keys approved: La policy non deve sembrare un'approvazione.
- [OK] Nessuna frase di attivazione: commercial go-live approved: La policy non deve sembrare un'approvazione.
- [OK] Effetto dashboard corretto: La policy puÃ² solo candidare il blocco a giallo, non verde.
- [OK] Approvazione proprietario richiesta: Serve approvazione esplicita del proprietario.
