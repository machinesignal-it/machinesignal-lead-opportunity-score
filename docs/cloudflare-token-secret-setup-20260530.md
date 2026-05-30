# MachineSignal - Setup secret Cloudflare per deploy automatico

Data: 2026-05-30

## Stato

La pipeline GitHub Actions è già pronta e parte correttamente.

Repository:

`https://github.com/machinesignal-it/machinesignal-lead-opportunity-score`

Workflow:

`Deploy MachineSignal Worker`

Il run si blocca perché manca il secret GitHub:

`CLOUDFLARE_API_TOKEN`

## Cosa serve creare in Cloudflare

Serve un API token Cloudflare con permessi per pubblicare il Worker:

- Account: `8782dd68928c8e75daac4d5d5dcc4344`
- Worker: `machinesignal-api`
- Permesso minimo consigliato: Workers Scripts edit/deploy sull'account interessato.

Il token non va scritto nel codice, non va inviato in chat e non va salvato in file normali.

## Dove inserirlo in GitHub

Nel repository GitHub:

`machinesignal-it/machinesignal-lead-opportunity-score`

andare in:

`Settings > Secrets and variables > Actions > New repository secret`

Nome secret:

`CLOUDFLARE_API_TOKEN`

Valore:

il token Cloudflare appena creato.

## Cosa succede dopo

Dopo aver inserito il secret, rilanciare il workflow:

`Actions > Deploy MachineSignal Worker > Run workflow`

Oppure fare un nuovo push su `main`.

## Verifica attesa

Dopo il deploy, questo test deve cambiare:

Input:

```json
{
  "domain": "quinta-essenza.com",
  "sector_hint": "medicina estetica",
  "country_hint": "IT"
}
```

Risultato atteso dopo deploy:

```json
{
  "opportunity_score": 81,
  "decision": "buy_deep_analysis",
  "next_product": "deep_analysis"
}
```

Se il Worker restituisce ancora `nurture`, significa che il deploy non è ancora arrivato al live.
