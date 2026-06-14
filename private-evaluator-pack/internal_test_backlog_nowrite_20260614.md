# Internal Test Backlog NoWrite - 2026-06-14

## Scopo

Questo backlog ordina i prossimi test interni MachineSignal senza attivare vendita, contatti esterni, dati reali, dati personali, marketplace o go-live.

Assunzione corrente: non c'e' ancora una tua approvazione esplicita per usare i materiali come documentazione sandbox pubblica. Quindi il default resta `approve_as_internal_only`.

## Blocchi sempre attivi

- no real payments
- no invoices
- no payment method collection
- no external outreach
- no email sending to humans
- no real data processing
- no personal data processing
- no production API key issuing
- no public paid marketplace
- no hosted MCP public
- no MCP registry publication
- no commercial go-live
- no claim legal approval
- no publish final terms
- no publish final privacy notice

## Backlog ordinato

### P0 - internal_contract_consistency_probe_nowrite

Verifica che README, OpenAPI, Postman, MCP draft e catalogo prodotto dicano la stessa cosa su beta, blocchi, credit ledger e no-go commerciale.

Perche' conta:
una macchina cliente deve ricevere messaggi coerenti su tutti i canali.

Fatto quando:
- i contratti principali sono confrontati;
- le incoerenze sono classificate;
- viene proposta la prossima remediation.

### P0 - sandbox_api_safety_regression_nowrite

Ripete i controlli sugli endpoint sandbox usando solo chiamate sintetiche e verifica che il purchase-intent non generi pagamenti reali.

Fatto quando:
- auth verificata;
- credito verificato entro limiti;
- purchase-intent resta non-payment.

### P1 - synthetic_machine_buyer_journey_rehearsal_nowrite

Simula una macchina cliente che scopre il prodotto, legge il catalogo, sceglie un servizio, valuta budget e chiede un output sintetico.

Fatto quando:
- il percorso ha decisioni chiare;
- i crediti sono tracciabili;
- i failure case sono documentati.

### P1 - agent_roles_operating_check_nowrite

Verifica che agenti commerciali, post-vendita, admin, legal e HR agentica non possano superare i blocchi di test.

Fatto quando:
- i ruoli sono mappati;
- i conflitti sono segnalati;
- il miglioramento automatico resta bounded.

### P2 - pnl_assumption_delta_review_nowrite

Controlla se blocchi tecnici, Cloudflare/KV, crediti agenti e tempi di go-live richiedono aggiornamenti al P&L.

Fatto quando:
- delta P&L classificati;
- aggiornamenti necessari elencati;
- nessuna azione finanziaria reale eseguita.

## Prossimo step consigliato

`internal_contract_consistency_probe_nowrite`

## Stima fase test

Completamento stimato fase test: 76%.

La fase test non e' conclusa. Mancano almeno i test P0/P1 interni prima di parlare di go-live.
