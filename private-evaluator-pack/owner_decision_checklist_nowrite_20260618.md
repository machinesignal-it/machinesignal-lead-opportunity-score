# Owner Decision Checklist And NoWrite Final Decision Simulation

Date: 2026-06-18

Language: it

Status: draft_nowrite_not_signed_not_activated

## Purpose

Questa checklist trasforma il pacchetto di approvazione commerciale in una simulazione decisionale.

Non firma nulla, non attiva beta a pagamento, non attiva go-live, non crea chiavi production, non incassa, non emette fatture, non raccoglie metodi di pagamento, non usa dati reali o personali e non contatta esterni.

## Input usati

- Owner decision dashboard: 3 verdi, 12 gialli, 1 rosso.
- Rosso rimanente: owner commercial approval.
- Pacchetto owner commercial approval: creato e validato, ma non firmato.

## Regola della simulazione

La simulazione puo' restituire solo uno di questi esiti:

| Esito | Significato | Azione |
| --- | --- | --- |
| `GO_SANDBOX_PREPARATION` | Si puo' continuare a preparare internamente. | Continua NoWrite e sandbox. |
| `NOT_YET_OWNER_REVIEW_REQUIRED` | Mancano firma o gate approvati. | Non attivare. Preparare review. |
| `NO_GO_BLOCKED` | Una richiesta prova ad attivare qualcosa di vietato. | Bloccare e spiegare. |

Con lo stato attuale l'esito corretto e':

```text
NOT_YET_OWNER_REVIEW_REQUIRED
```

## Checklist proprietario

Per poter passare a una beta commerciale controllata, ogni voce deve diventare `APPROVED_BY_OWNER` o `IMPLEMENTED_AND_TESTED` dove richiesto.

| Gate | Stato attuale | Cosa serve | Se manca |
| --- | --- | --- | --- |
| Owner commercial approval | red / not signed | Firma esplicita del proprietario | Beta commerciale bloccata |
| Fiscal/admin path | yellow draft | Decisione fiscal/admin owner-approved | Pagamenti e fatture bloccati |
| Payment/invoice path | yellow draft | Provider/processo approvato e test-mode separato | Checkout, carte e fatture bloccati |
| Terms/privacy/data | yellow draft | Testi finali e filtro dati implementato | Onboarding reale e dati reali bloccati |
| Product/listino | yellow draft | Prodotto, prezzo, limiti e testo live approvati | Offerte live bloccate |
| Credit/refund policy | yellow draft | Regole crediti/rimborsi approvate e ledger testato | Crediti pagati bloccati |
| Production API keys | yellow readiness | Processo chiavi, revoca, rotazione e audit approvati/testati | Chiavi production bloccate |
| Cost cap/kill switch | yellow draft | Implementazione e simulazione superata | Accesso production bloccato |
| Support/escalation | yellow draft | Ticket/support ledger e simulazione casi | Clienti paganti bloccati |
| Security/incident | yellow draft | Procedura finale e test incidenti | Accesso production bloccato |
| Distribution/no outreach | yellow draft | Canali finali approvati | Marketplace/outreach bloccati |
| Final go/no-go report | missing | Report finale in italiano | Attivazione bloccata |

## Simulazioni

### Scenario A - Il proprietario non firma

Input:

```json
{
  "owner_signature": false,
  "all_required_gates_green": false,
  "request": "activate_paid_beta"
}
```

Output atteso:

```json
{
  "simulation_result": "NOT_YET_OWNER_REVIEW_REQUIRED",
  "decision": "stop",
  "paid_beta_activation": false,
  "commercial_go_live": false,
  "reason": "owner signature and required green gates are missing",
  "next_allowed_actions": ["continue_nowrite_preparation", "prepare_owner_review"],
  "credits_consumed": 0
}
```

### Scenario B - La macchina chiede un'azione vietata

Input:

```json
{
  "owner_signature": false,
  "request": "issue_production_api_key"
}
```

Output atteso:

```json
{
  "simulation_result": "NO_GO_BLOCKED",
  "decision": "stop",
  "production_key_issued": false,
  "support_code": "OWNER_COMMERCIAL_APPROVAL_NOT_SIGNED",
  "credits_consumed": 0
}
```

### Scenario C - Tutto fosse approvato in futuro

Input:

```json
{
  "owner_signature": true,
  "all_required_gates_green": true,
  "request": "prepare_controlled_paid_beta"
}
```

Output atteso:

```json
{
  "simulation_result": "GO_REQUIRES_SEPARATE_ACTIVATION_STEP",
  "decision": "prepare_activation_packet_only",
  "paid_beta_activation": false,
  "commercial_go_live": false,
  "reason": "even after approvals, activation requires a separate explicit activation step",
  "next_allowed_actions": ["prepare_activation_packet", "run_final_pre_activation_probe"],
  "credits_consumed": 0
}
```

## Risposta macchina corrente

```json
{
  "status": "owner_decision_not_ready",
  "decision": "not_yet",
  "current_result": "NOT_YET_OWNER_REVIEW_REQUIRED",
  "paid_beta_activation": false,
  "commercial_go_live": false,
  "real_payment_executed": false,
  "invoice_issued": false,
  "payment_method_collected": false,
  "production_key_issued": false,
  "real_or_personal_data_processed": false,
  "external_outreach_sent": false,
  "credits_consumed": 0,
  "remaining_red_gate": "owner_commercial_approval",
  "next_allowed_actions": ["continue_nowrite_preparation", "prepare_owner_review"],
  "support_code": "OWNER_DECISION_NOT_READY"
}
```

## Cosa possono fare gli agenti

- aggiornare la checklist;
- simulare richieste senza scrivere su sistemi esterni;
- preparare report in italiano;
- evidenziare cosa manca;
- bloccare azioni non approvate;
- proporre una decisione, senza firmarla.

## Cosa gli agenti non possono fare

- firmare per il proprietario;
- attivare beta a pagamento;
- incassare o emettere fattura;
- raccogliere metodi di pagamento;
- emettere chiavi production;
- processare dati reali o personali;
- inviare outreach;
- pubblicare marketplace, MCP pubblico o registry;
- dichiarare go-live commerciale.

## Prossima azione sicura

Aggiornare Company Brain e dashboard per indicare che la checklist decisionale e la simulazione NoWrite esistono, ma che l'esito corrente resta `NOT_YET_OWNER_REVIEW_REQUIRED`.
