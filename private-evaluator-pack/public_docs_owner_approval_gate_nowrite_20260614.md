# MachineSignal - Public Docs Owner Approval Gate

Data: 2026-06-14  
Stato: prepared  
Modalita': NoWrite planning  
Fonte: apply_public_wording_remediation_nowrite_20260613  
Stato commerciale: not_live  
Go-live: no_go

## Sintesi

Lo scan wording pubblico e' pulito: 49 file controllati, 0 finding.

Questo pero' non significa che i documenti siano automaticamente approvati per pubblicazione commerciale. Significa solo che il linguaggio non contiene piu' claim vietati secondo il guardrail.

Serve ancora approvazione proprietario.

## Cosa deve approvare il proprietario

### README e docs

- Il posizionamento machine-first e' chiaro.
- Non sembra una vendita live.
- Non contiene claim legali/privacy finali.
- Non promette ricavi, lead o buyer intent.

### OpenAPI/Postman

- Endpoint e esempi sono coerenti con sandbox/pre-live.
- Non ci sono dati reali.
- Non ci sono secret.
- Non ci sono istruzioni di pagamento.

### MCP e machine discovery

- Nessuna pubblicazione registry ora.
- Hosted MCP resta bloccato.
- Local/sandbox MCP va bene solo come test.
- Ogni pubblicazione esterna richiede approvazione separata.

### Legal/privacy

- Termini, privacy e DPA restano bozze.
- Serve review professionale.
- Nessun claim GDPR/compliance finale.
- Nessun trattamento dati reali/personali.

## Decisioni possibili

- `approve_as_internal_only`
- `approve_as_sandbox_public_docs_only`
- `request_rewording`
- `block_publication`
- `defer_until_legal_review`

Decisione attuale se il proprietario non risponde: `approve_as_internal_only`.

## Cosa resta bloccato

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

## Pacchetto review proprietario

Tempo stimato: massimo 20 minuti.

Ordine suggerito:

1. README top positioning.
2. Sezione "What This API Does Not Do".
3. API directory listing.
4. OpenAPI/Postman examples.
5. MCP/local adapter wording.
6. Safety blocks.

Domande:

- Il posizionamento machine-first e' chiaro?
- E' chiaro che non vendiamo ancora live?
- E' chiaro che non facciamo outreach?
- E' chiaro che non usiamo dati reali/personali?
- C'e' qualche frase che sembra una promessa commerciale?

## Readiness dopo gate

- Public docs owner gate readiness: 75%.
- Public wording safety readiness: 84%.
- Commercial readiness: 69%.
- Go-live: no_go.

Motivo: il gate e' pronto, ma il proprietario non ha ancora approvato i documenti come pubblicabili e i gate live/commerciali restano bloccati.

## Prossimo step consigliato

`public_docs_owner_packet_nowrite`

Serve per preparare un pacchetto breve, leggibile in 20 minuti, con solo le parti che il proprietario deve approvare.
