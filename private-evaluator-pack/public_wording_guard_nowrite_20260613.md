# MachineSignal - Public Wording Guard

Data: 2026-06-13  
Stato: prepared  
Modalita': NoWrite planning  
Fonte: agent_policy_compliance_rehearsal_nowrite_20260613  
Stato commerciale: not_live  
Go-live: no_go  
Pubblicazione pubblica: non approvata

## Sintesi

Questo guardrail evita che README, pagine, docs, OpenAPI, Postman, JSON contract o descrizioni pubbliche sembrino gia' una vendita live.

Finche' non ci sono approvazioni esplicite, il linguaggio deve restare:

- sandbox;
- pre-live;
- draft;
- synthetic data only;
- no payment;
- no real data;
- legal/privacy/fiscal review required.

## Wording consentito

- `sandbox synthetic testing only`
- `draft_not_live`
- `no_go`
- `requires owner approval`
- `requires professional/legal review`
- `no real payments`
- `synthetic data only`
- `machine-readable draft`

## Wording vietato

| Frase | Gravita' | Motivo |
| --- | --- | --- |
| `buy now` | critical | Sembra vendita live. |
| `subscribe now` | critical | Sembra abbonamento disponibile. |
| `pay now` | critical | Sembra raccolta pagamento. |
| `invoice available` | critical | Sembra readiness fiscale. |
| `production ready` | high | Sembra prodotto live. |
| `go live approved` | critical | Contraddice no_go. |
| `legally approved` | critical | Approvazione legale non concessa. |
| `GDPR compliant` | high | Claim da validare professionalmente. |
| `guaranteed leads` | high | Promessa commerciale. |
| `guaranteed revenue` | high | Promessa di ricavi. |
| `send outreach` | critical | Contraddice blocco outreach. |
| `real customer data supported` | critical | Contraddice blocco dati reali. |
| `production API key` | high | Puo' sembrare disponibile. |
| `public marketplace listing` | high | Pubblicazione non approvata. |

## Sostituzioni consigliate

| Evita | Usa |
| --- | --- |
| `buy now` | `request owner review for future commercial access` |
| `production ready` | `pre-live sandbox draft` |
| `GDPR compliant` | `privacy/legal review required before live` |
| `guaranteed leads` | `supports machine-readable lead prioritization` |
| `real customer data supported` | `synthetic data only until approval` |
| `production API key` | `sandbox or draft key policy only` |

## Avviso sicuro di esempio

```text
MachineSignal is currently a sandbox/pre-live API concept for synthetic testing and machine-readable evaluation flows. Commercial live use, payments, invoices, real data processing and production API keys require explicit owner approval and legal/privacy/fiscal review.
```

## File da controllare prima di pubblicare

- README.md
- docs
- api
- machinesignal_site
- public JSON contracts
- OpenAPI files
- Postman collections
- MCP descriptors
- landing pages

## Blocchi preservati

- Pagamenti reali.
- Fatture.
- Raccolta metodi di pagamento.
- Outreach esterno.
- Invio email a umani.
- Dati reali.
- Dati personali.
- API key produzione.
- Marketplace pubblico a pagamento.
- Hosted MCP pubblico.
- Registry MCP pubblico.
- Go-live commerciale.
- Claim legale.
- Pubblicazione termini/privacy finali.

## Readiness dopo guardrail

- Public wording safety readiness: 76%.
- Agent governance readiness: 84%.
- Commercial readiness: 68%.
- Go-live: no_go.

Motivo: il guardrail definisce claim vietati e sostituzioni, ma serve ancora una scansione dei file pubblici e approvazione owner prima di modificare pagine o listing.

## Prossimo step consigliato

`public_wording_scan_nowrite`

Serve per scansionare README, docs, API contract e pagine pubbliche alla ricerca di claim troppo live o commerciali.
