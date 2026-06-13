# MachineSignal - Public Wording Remediation Draft

Data: 2026-06-13  
Stato: prepared  
Modalita': NoWrite planning  
Fonte: public_wording_scan_nowrite_20260613  
Stato commerciale: not_live  
Go-live: no_go  
Modifica file pubblici: no

## Sintesi

Questa bozza prepara le riscritture per i 5 finding del public wording scan.

Non modifica ancora README, docs o codice. Serve a rendere chiaro cosa cambiare per togliere wording ambiguo, senza aprire vendita live, pagamenti, dati reali, outreach o claim legali.

## Remediation proposta

| ID | File | Riga | Testo attuale | Testo proposto |
| --- | --- | ---: | --- | --- |
| RW1 | README.md | 571 | `- It does not send outreach emails.` | `- It does not execute external-contact workflows.` |
| RW2 | README.md | 864 | `production API keys`, `human outreach` | `live credential issuance`, `human contact workflows` |
| RW3 | api_endpoint_minimal/core.mjs | 3926 | `"the customer machine would send outreach automatically"` | `"the customer machine would trigger an external-contact workflow automatically"` |
| RW4 | api_endpoint_minimal/core.mjs | 5968 | `"guaranteed revenue uplift",` | `"assured commercial uplift",` |
| RW5 | docs/api-directory-listing.md | 59 | `- Does not send outreach.` | `- Does not execute external-contact workflows.` |

## Perche' queste modifiche

- Mantengono i blocchi esistenti.
- Non cambiano funzionalita'.
- Non autorizzano pubblicazione.
- Non introducono pagamenti o fatture.
- Non introducono dati reali o personali.
- Riducono falsi positivi nel wording scan.

## Risultato atteso dopo applicazione

- Findings wording: 0.
- Critical: 0.
- High: 0.
- Publication status: clean_for_wording_guard_only_not_owner_approved.
- Go-live: no_go.

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

## Prossimo step consigliato

`apply_public_wording_remediation_nowrite`

Applicare solo queste 5 sostituzioni, poi rieseguire scanner e probe.
