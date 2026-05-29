# MachineSignal No-List Machine Flow Test - 2026-05-29

## Objective

Validate the machine-first flow for the case where the customer machine does not already have a list of companies or domains to score.

The tested flow is:

1. read product catalog;
2. authenticate as beta customer;
3. create `target_discovery` purchase intent;
4. retrieve target-discovery delivery;
5. use a returned beta sample target as input for score;
6. verify orders and credit usage.

## Result

Status: passed.

Live Worker:

`https://machinesignal-api.beta-878.workers.dev`

Disposable beta customer:

`no_list_flow_20260529151645`

Visible key prefix for audit:

`ms_cust_raYzEA`

## Live Result

| Step | Result |
|---|---|
| Product catalog read | OK |
| Authenticated onboarding | OK, customer auth |
| Target discovery purchase intent | OK |
| Target discovery order status | `accepted_beta_order_intent` |
| Target discovery order id | `ord_67a0a584` |
| Target discovery credits consumed | 1 |
| Beta sample targets returned | 3 |
| First target scored | `studio-odontoiatrico-demo-milano.it` |
| Score status | `valid_output` |
| Score value | 76 |
| Score decision | `nurture` |
| Score credits consumed | 1 |
| Orders available | 1 |
| Real payment executed | false |
| External contact executed | false |

## Interpretation

The no-list flow is now machine-usable in beta:

- a machine can read what `target_discovery` costs and includes;
- a machine can create a beta purchase intent for target discovery;
- the API returns a structured delivery with beta sample targets;
- a machine can immediately pass one returned target into the score endpoint;
- credits are tracked separately for target discovery and score;
- no human outreach, real payment or external contact is executed.

## Current Beta Limitation

The returned targets are synthetic beta samples. This validates the machine handoff and delivery schema, but does not yet validate production-grade discovery of 250 real coherent targets.

The next real product test should validate whether agents can produce a compliant 250-target list for one selected market and area.
