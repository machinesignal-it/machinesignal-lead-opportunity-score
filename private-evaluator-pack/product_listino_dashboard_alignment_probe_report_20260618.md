# Report allineamento dashboard product/listino

Data controllo: 2026-06-18

Esito: SUPERATO

Controlli superati: 65/65

Sintesi:

- Il product/listino owner review e' stato recepito nel dashboard.
- Stato aggiornato: 3 verdi, 11 gialli, 2 rossi.
- Product/listino passa a candidato giallo verificato, non approvato.
- Non autorizza offerta live, prezzi definitivi, pagamenti, fatture, abbonamenti o marketplace.
- Restano rossi: owner commercial approval e production API keys.

Dettaglio controlli:

- [OK] Company Brain JSON versione v11: La Company Brain deve riflettere l'allineamento product/listino.
- [OK] Company Brain graph versione v11: Il grafo deve riflettere l'allineamento product/listino.
- [OK] Conteggi JSON 3/11/2: Il JSON deve riportare 3 verdi, 11 gialli e 2 rossi.
- [OK] Conteggi owner dashboard 3/11/2: Il dashboard owner deve riportare gli stessi conteggi.
- [OK] Markdown Company Brain con conteggi aggiornati: Il Markdown deve mostrare i conteggi aggiornati.
- [OK] Markdown owner dashboard con product/listino giallo: La tabella owner deve mostrare product/listino come giallo verificato.
- [OK] Product/listino presente nei gialli JSON: Product/listino deve essere candidato giallo.
- [OK] Product/listino rimosso dai rossi JSON: Product/listino non deve restare rosso dopo la bozza verificata.
- [OK] Evidenza product/listino presente: La Company Brain deve citare il review pack verificato.
- [OK] Probe product/listino 154 controlli: La prova deve citare i 154 controlli superati.
- [OK] Product/listino non owner-approved: Il candidato giallo non deve essere approvato.
- [OK] Product/listino non live offer: Il candidato giallo non deve essere live offer.
- [OK] Product/listino vieta payments/invoices: Il candidato giallo deve bloccare pagamenti e fatture.
- [OK] Area product/listino dashboard presente: Il dashboard deve avere una riga product/listino.
- [OK] Area product/listino dashboard gialla: Product/listino deve essere gialla.
- [OK] Decisione product/listino prudente: La decisione deve restare review.
- [OK] Meaning non live offer: Il significato deve bloccare offerta live.
- [OK] Listino JSON non abilita live offer: Il pack listino non deve abilitare offerta live.
- [OK] Listino JSON non abilita pagamento: Il pack listino non deve abilitare pagamenti.
- [OK] Listino JSON non abilita fattura: Il pack listino non deve abilitare fatture.
- [OK] Listino JSON non abilita abbonamento: Il pack listino non deve abilitare abbonamenti.
- [OK] Listino JSON non abilita marketplace: Il pack listino non deve abilitare marketplace.
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
- [OK] Prossimo step aggiornato: Il prossimo step deve spostarsi sui rossi rimanenti.
- [OK] Nessuna approvazione impropria: product listino approved: Non devono comparire frasi che sembrano autorizzare cio' che e' ancora bloccato.
- [OK] Nessuna approvazione impropria: listino approved: Non devono comparire frasi che sembrano autorizzare cio' che e' ancora bloccato.
- [OK] Nessuna approvazione impropria: live offer approved: Non devono comparire frasi che sembrano autorizzare cio' che e' ancora bloccato.
- [OK] Nessuna approvazione impropria: final prices approved: Non devono comparire frasi che sembrano autorizzare cio' che e' ancora bloccato.
- [OK] Nessuna approvazione impropria: real payment allowed: Non devono comparire frasi che sembrano autorizzare cio' che e' ancora bloccato.
- [OK] Nessuna approvazione impropria: invoice allowed true: Non devono comparire frasi che sembrano autorizzare cio' che e' ancora bloccato.
- [OK] Nessuna approvazione impropria: subscription approved: Non devono comparire frasi che sembrano autorizzare cio' che e' ancora bloccato.
- [OK] Nessuna approvazione impropria: marketplace listing approved: Non devono comparire frasi che sembrano autorizzare cio' che e' ancora bloccato.
- [OK] Nessuna approvazione impropria: paid beta approved: Non devono comparire frasi che sembrano autorizzare cio' che e' ancora bloccato.
- [OK] Nessuna approvazione impropria: commercial go-live approved: Non devono comparire frasi che sembrano autorizzare cio' che e' ancora bloccato.
- [OK] Nessuna approvazione impropria: listino approvato: Non devono comparire frasi che sembrano autorizzare cio' che e' ancora bloccato.
- [OK] Nessuna approvazione impropria: prezzi definitivi approvati: Non devono comparire frasi che sembrano autorizzare cio' che e' ancora bloccato.
- [OK] Nessuna approvazione impropria: offerta live approvata: Non devono comparire frasi che sembrano autorizzare cio' che e' ancora bloccato.
- [OK] Nessuna approvazione impropria: pagamenti reali attivi: Non devono comparire frasi che sembrano autorizzare cio' che e' ancora bloccato.
- [OK] Nessuna approvazione impropria: fatture attive: Non devono comparire frasi che sembrano autorizzare cio' che e' ancora bloccato.
- [OK] Nessuna approvazione impropria: beta a pagamento approvata: Non devono comparire frasi che sembrano autorizzare cio' che e' ancora bloccato.
- [OK] Nessuna approvazione impropria: go-live commerciale approvato: Non devono comparire frasi che sembrano autorizzare cio' che e' ancora bloccato.
