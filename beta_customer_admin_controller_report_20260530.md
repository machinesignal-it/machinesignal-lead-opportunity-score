# MachineSignal - Beta Customer/Admin Controller

Data: 2026-05-30

## Perche serviva

Nel test machine buyer flow abbiamo visto che la chiave demo principale puo esaurire crediti beta. Questo blocca i test successivi anche se il prodotto funziona.

Serviva quindi un controller admin per permettere agli agenti di:

- creare customer beta;
- leggere stato e crediti di un customer;
- ricaricare crediti beta;
- resettare usage per test controllati;
- sospendere o riattivare un customer;
- evitare che il lavoro si accumuli quando una chiave demo resta senza crediti.

## Cosa e stato aggiunto

Sono stati aggiunti due endpoint admin oltre a quello gia esistente:

### 1. Crea customer beta

`POST /v1/beta/customers`

Esisteva gia. Crea una macchina cliente beta, assegna crediti iniziali e restituisce la API key una sola volta.

### 2. Leggi customer beta

`GET /v1/beta/customers/{customer_id}`

Restituisce:

- stato customer;
- piano;
- email di contatto se presente;
- solo prefisso della API key, non la chiave completa;
- usage ledger;
- eventi recenti;
- ordini recenti.

### 3. Aggiorna customer beta

`PATCH /v1/beta/customers/{customer_id}`

Permette:

- `status: active`;
- `status: suspended`;
- `status: closed`;
- `add_credits` per aggiungere crediti;
- `set_credits` per impostare limiti esatti;
- `reset_usage: true` per riportare i consumi a zero;
- `reason` per lasciare traccia dell'intervento admin.

Esempio:

```json
{
  "add_credits": {
    "score_pack_1k": 20,
    "verification_pack_100": 10,
    "deep_analysis_pack_100": 5,
    "target_discovery_pack_250": 1
  },
  "reason": "top up beta test credits"
}
```

## Sicurezza

Il controller admin:

- richiede la chiave admin;
- non restituisce mai la API key completa del customer dopo la creazione;
- mostra solo `api_key_prefix`;
- scrive un evento admin nel ledger;
- mantiene `real_payment_executed = false`;
- mantiene `external_contact_executed = false`.

Se un customer viene sospeso, la sua API key non puo piu usare gli endpoint protetti.

## Test eseguiti

Test locale sul codice API:

- creazione customer beta;
- lettura usage con chiave customer;
- lettura customer da admin;
- ricarica crediti da admin;
- verifica saldo aggiornato;
- sospensione customer;
- verifica che customer sospeso riceva `401`;
- riattivazione customer.

Risultato:

`MachineSignal minimal API tests passed.`

## Impatto sul modello machine-first

Questo pezzo rende piu autonomo il test gestito dagli agenti.

Prima:

- una chiave esaurita bloccava il test;
- serviva intervento manuale;
- era difficile simulare piu macchine clienti.

Ora:

- gli agenti possono creare customer beta separati;
- ogni macchina cliente puo avere crediti propri;
- un customer problematico puo essere sospeso;
- i test possono ripartire senza usare sempre la stessa chiave.

## Blocco live residuo

Per usare questi endpoint sulla live API serve una vera chiave admin.

La chiave salvata oggi in Postman e una chiave customer/demo: funziona per scoring, usage e ordini, ma non autorizza gli endpoint admin.

Prossimo passo operativo:

1. creare o decidere una chiave admin separata;
2. salvarla come secret/variabile Cloudflare `MACHINESIGNAL_API_KEY`;
3. salvarla in Postman come `machinesignal_admin_api_key`;
4. eseguire il test live di creazione customer + ricarica crediti.

## Decisione agenti

Il controller e pronto lato codice.

Prima di continuare i test live in autonomia completa, va completata la configurazione della chiave admin live.
