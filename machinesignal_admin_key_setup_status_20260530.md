# MachineSignal - Admin API key setup status

Data: 2026-05-30

## Stato

La chiave admin MachineSignal e stata generata e salvata senza stamparla.

## Dove e stata salvata

- GitHub Actions secret: `MACHINESIGNAL_ADMIN_API_KEY`
- Postman environment secret variable: `machinesignal_admin_api_key`
- Copia locale cifrata DPAPI: `C:\Users\natal\AppData\Roaming\MachineSignal\machinesignal_admin_api_key.dpapi`

## Cosa fa

La chiave admin viene sincronizzata nel Worker Cloudflare come runtime secret:

`MACHINESIGNAL_API_KEY`

Questo abilita gli endpoint admin live:

- `POST /v1/beta/customers`
- `GET /v1/beta/customers/{customer_id}`
- `PATCH /v1/beta/customers/{customer_id}`

## Sicurezza

- La chiave non e stata stampata.
- La chiave non e stata scritta in file di progetto.
- Il repository riceve solo il workflow che legge il secret da GitHub Actions.
- Il full value della chiave resta fuori dal codice.

## Prossima verifica

Dopo il deploy automatico:

1. creare un nuovo customer beta live;
2. usare la API key customer generata;
3. eseguire il machine buyer flow live completo;
4. confermare che i crediti sono separati dalla chiave demo principale.
