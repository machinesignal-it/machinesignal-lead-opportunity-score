# Report allineamento dashboard production API key readiness

Data controllo: 2026-06-18

Esito: SUPERATO

Controlli superati: 72/72

Sintesi:

- Production API key readiness e' stata recepita nel dashboard.
- Stato aggiornato: 3 verdi, 12 gialli, 1 rosso.
- Production API keys passa a candidato giallo verificato, non approvato.
- Non autorizza emissione chiavi, traffico live, segreti, pagamenti o go-live.
- Resta rosso: owner commercial approval.

Dettaglio controlli:

- [OK] Company Brain JSON versione v12: La Company Brain deve riflettere la readiness production key.
- [OK] Company Brain graph versione v12: Il grafo deve riflettere la readiness production key.
- [OK] Conteggi JSON 3/12/1: Il JSON deve riportare 3 verdi, 12 gialli e 1 rosso.
- [OK] Conteggi owner dashboard 3/12/1: Il dashboard owner deve riportare gli stessi conteggi.
- [OK] Markdown Company Brain con conteggi aggiornati: Il Markdown deve mostrare i conteggi aggiornati.
- [OK] Markdown owner dashboard con production API keys gialla: La tabella owner deve mostrare production API keys come giallo verificato.
- [OK] Production API key readiness presente nei gialli JSON: Production key readiness deve essere candidata gialla.
- [OK] Production API keys rimosse dai rossi JSON: Production API keys non deve restare rosso dopo la bozza verificata.
- [OK] Owner commercial approval resta rosso: L'approvazione commerciale resta il rosso rimanente.
- [OK] Evidenza production key readiness presente in Company Brain: La Company Brain deve citare il readiness pack verificato.
- [OK] Probe production key readiness 113 controlli: La prova deve citare i 113 controlli superati.
- [OK] Production key readiness non owner-approved: Il candidato giallo non deve essere approvato.
- [OK] Production key readiness non emette chiavi: Il candidato giallo deve vietare emissione chiavi.
- [OK] Production key readiness non abilita live traffic: Il candidato giallo deve vietare traffico live.
- [OK] Production key readiness non crea segreti: Il candidato giallo deve vietare segreti production.
- [OK] Area production_api_keys dashboard presente: Il dashboard deve avere una riga production API keys.
- [OK] Area production_api_keys dashboard gialla: Production API keys deve essere gialla come readiness.
- [OK] Decisione production key prudente: La decisione deve restare review.
- [OK] Meaning non abilita key issuance: Il significato deve bloccare emissione chiavi.
- [OK] Meaning non abilita live traffic: Il significato deve bloccare traffico live.
- [OK] Meaning non abilita secrets: Il significato deve bloccare segreti.
- [OK] Readiness JSON probe passato: Il readiness pack deve avere probe superato.
- [OK] Readiness JSON 113 controlli: Il readiness probe deve avere 113/0.
- [OK] Readiness JSON non abilita production keys: Nessuna chiave production consentita.
- [OK] Readiness JSON non abilita emissione chiavi: Nessuna emissione chiavi consentita.
- [OK] Readiness JSON non abilita live traffic: Nessun traffico live consentito.
- [OK] Readiness JSON non abilita segreti repo: Nessun segreto production nel repo.
- [OK] Blocco ancora presente in Company Brain: real_payments: Il passaggio a giallo non deve sbloccare azioni commerciali.
- [OK] Blocco ancora presente in Company Brain: invoices: Il passaggio a giallo non deve sbloccare azioni commerciali.
- [OK] Blocco ancora presente in Company Brain: payment_method_collection: Il passaggio a giallo non deve sbloccare azioni commerciali.
- [OK] Blocco ancora presente in Company Brain: production_api_keys: Il passaggio a giallo non deve sbloccare azioni commerciali.
- [OK] Blocco ancora presente in Company Brain: real_customer_data_processing: Il passaggio a giallo non deve sbloccare azioni commerciali.
- [OK] Blocco ancora presente in Company Brain: personal_data_processing: Il passaggio a giallo non deve sbloccare azioni commerciali.
- [OK] Blocco ancora presente in Company Brain: external_outreach: Il passaggio a giallo non deve sbloccare azioni commerciali.
- [OK] Blocco ancora presente in Company Brain: email_sending_to_external_humans: Il passaggio a giallo non deve sbloccare azioni commerciali.
- [OK] Blocco ancora presente in Company Brain: public_paid_marketplace_publication: Il passaggio a giallo non deve sbloccare azioni commerciali.
- [OK] Blocco ancora presente in Company Brain: hosted_mcp_public_launch: Il passaggio a giallo non deve sbloccare azioni commerciali.
- [OK] Blocco ancora presente in Company Brain: mcp_registry_publication: Il passaggio a giallo non deve sbloccare azioni commerciali.
- [OK] Blocco ancora presente in Company Brain: commercial_go_live: Il passaggio a giallo non deve sbloccare azioni commerciali.
- [OK] Blocco ancora presente nel dashboard owner: activate_paid_beta: Il dashboard deve continuare a bloccare questa azione.
- [OK] Blocco ancora presente nel dashboard owner: execute_real_payment: Il dashboard deve continuare a bloccare questa azione.
- [OK] Blocco ancora presente nel dashboard owner: issue_invoice: Il dashboard deve continuare a bloccare questa azione.
- [OK] Blocco ancora presente nel dashboard owner: collect_payment_method: Il dashboard deve continuare a bloccare questa azione.
- [OK] Blocco ancora presente nel dashboard owner: issue_production_api_key: Il dashboard deve continuare a bloccare questa azione.
- [OK] Blocco ancora presente nel dashboard owner: process_real_customer_dataset: Il dashboard deve continuare a bloccare questa azione.
- [OK] Blocco ancora presente nel dashboard owner: process_personal_data: Il dashboard deve continuare a bloccare questa azione.
- [OK] Blocco ancora presente nel dashboard owner: send_external_outreach: Il dashboard deve continuare a bloccare questa azione.
- [OK] Blocco ancora presente nel dashboard owner: publish_marketplace_listing: Il dashboard deve continuare a bloccare questa azione.
- [OK] Blocco ancora presente nel dashboard owner: launch_hosted_public_mcp: Il dashboard deve continuare a bloccare questa azione.
- [OK] Blocco ancora presente nel dashboard owner: submit_mcp_registry: Il dashboard deve continuare a bloccare questa azione.
- [OK] Paid beta resta no-go: La beta a pagamento non deve essere attivata.
- [OK] Go-live resta no-go: Il go-live commerciale deve restare bloccato.
- [OK] Prossimo step owner approval packet: Il prossimo step deve spostarsi sul rosso rimanente.
- [OK] Company Brain next safe action owner approval packet: La Company Brain deve indicare il prossimo passo.
- [OK] Nessuna approvazione impropria: production key approved: Non devono comparire frasi che sembrano autorizzare cio' che e' ancora bloccato.
- [OK] Nessuna approvazione impropria: production keys approved: Non devono comparire frasi che sembrano autorizzare cio' che e' ancora bloccato.
- [OK] Nessuna approvazione impropria: live key issued: Non devono comparire frasi che sembrano autorizzare cio' che e' ancora bloccato.
- [OK] Nessuna approvazione impropria: production traffic enabled: Non devono comparire frasi che sembrano autorizzare cio' che e' ancora bloccato.
- [OK] Nessuna approvazione impropria: production secrets allowed: Non devono comparire frasi che sembrano autorizzare cio' che e' ancora bloccato.
- [OK] Nessuna approvazione impropria: production_api_keys_allowed": true: Non devono comparire frasi che sembrano autorizzare cio' che e' ancora bloccato.
- [OK] Nessuna approvazione impropria: production_key_issuance_allowed": true: Non devono comparire frasi che sembrano autorizzare cio' che e' ancora bloccato.
- [OK] Nessuna approvazione impropria: live_traffic_allowed": true: Non devono comparire frasi che sembrano autorizzare cio' che e' ancora bloccato.
- [OK] Nessuna approvazione impropria: production_secrets_allowed_in_repo": true: Non devono comparire frasi che sembrano autorizzare cio' che e' ancora bloccato.
- [OK] Nessuna approvazione impropria: paid beta approved: Non devono comparire frasi che sembrano autorizzare cio' che e' ancora bloccato.
- [OK] Nessuna approvazione impropria: commercial go-live approved: Non devono comparire frasi che sembrano autorizzare cio' che e' ancora bloccato.
- [OK] Nessuna approvazione impropria: chiave production approvata: Non devono comparire frasi che sembrano autorizzare cio' che e' ancora bloccato.
- [OK] Nessuna approvazione impropria: chiavi production approvate: Non devono comparire frasi che sembrano autorizzare cio' che e' ancora bloccato.
- [OK] Nessuna approvazione impropria: chiave live emessa: Non devono comparire frasi che sembrano autorizzare cio' che e' ancora bloccato.
- [OK] Nessuna approvazione impropria: traffico production attivo: Non devono comparire frasi che sembrano autorizzare cio' che e' ancora bloccato.
- [OK] Nessuna approvazione impropria: segreti production ammessi: Non devono comparire frasi che sembrano autorizzare cio' che e' ancora bloccato.
- [OK] Nessuna approvazione impropria: beta a pagamento approvata: Non devono comparire frasi che sembrano autorizzare cio' che e' ancora bloccato.
- [OK] Nessuna approvazione impropria: go-live commerciale approvato: Non devono comparire frasi che sembrano autorizzare cio' che e' ancora bloccato.
