# MachineSignal - Controlled Paid Beta Readiness Package

Date: 2026-06-17
Status: draft readiness package, not activated

## Purpose

This package prepares MachineSignal for a possible paid beta without activating payments, invoices, production keys, real customer data, outreach or marketplace publication.

The goal is to make the next owner decision simple: either continue sandbox-only, prepare a controlled paid beta, or keep the project paused before commercial launch.

## Current Position

MachineSignal is technically ready for the current sandbox scope.

MachineSignal is not commercially live.

The customer interface remains machine-first: CRM systems, AI agents, workflows, API clients, internal tools and software that need to discover targets, score opportunities, prepare bounded actions or test an API integration.

## Readiness Areas

### 1. Fiscal And Admin Readiness

Decision needed before paid beta:

- Confirm whether a VAT/P.IVA or other fiscal setup is required before taking money.
- Define who issues invoices or receipts.
- Define how revenue, refunds, credits and costs are tracked.
- Define whether the paid beta can legally run before full company setup.

Current status: blocked.

Owner action: speak with accountant or fiscal advisor before accepting any real payment.

### 2. Legal And Compliance Readiness

Decision needed before paid beta:

- Approve Terms of Service.
- Approve Privacy Policy.
- Approve data processing rules.
- Decide whether real customer lists can be accepted.
- Define retention period for uploaded lists or generated results.
- Define liability limits for scores, signals and recommendations.

Current status: blocked.

Owner action: legal/privacy review required before real customer data or paid access.

### 3. Payment Readiness

Decision needed before paid beta:

- Decide payment provider.
- Decide test mode versus live mode.
- Define whether payments are manual invoice, prepaid credits, checkout, or subscription.
- Define refund rules.
- Define what happens when a customer uses all credits.
- Define what happens when a score is invalid and must not consume credit.

Current status: blocked.

Owner action: no real payment flow until fiscal/legal setup is clear.

### 4. Product And Price Readiness

Decision needed before paid beta:

- Confirm beta catalog.
- Confirm price list.
- Confirm exactly what each paid unit includes.
- Confirm minimum valid output rules.
- Confirm credit consumption rules.
- Confirm replacement rules when the output is invalid or incomplete.

Current status: partially ready.

Owner action: approve the listino and decide whether beta prices are temporary, discounted or final.

### 5. Production API Key Readiness

Decision needed before paid beta:

- Decide who can receive a production key.
- Decide whether production keys are manual-only during beta.
- Define daily/monthly credit caps.
- Define abuse limits.
- Define revocation rules.
- Define how keys are tracked.

Current status: blocked.

Owner action: approve production key policy before issuing any real key.

### 6. Data Readiness

Decision needed before paid beta:

- Decide whether beta users may submit real company domains.
- Decide whether personal data is always refused.
- Decide whether uploaded lists are stored, processed temporarily or rejected after processing.
- Define deletion policy.
- Define allowed and forbidden data types.

Current status: blocked for real data and personal data.

Owner action: keep sandbox synthetic/no-personal-data mode until data policy is approved.

### 7. Support And Post-Sale Readiness

Decision needed before paid beta:

- Define support channel.
- Define expected response time.
- Define what happens when a machine integration fails.
- Define what happens when a customer says the score is wrong.
- Define escalation path to the owner.

Current status: draft needed.

Owner action: approve a simple beta support policy before selling.

### 8. Cost Cap And Kill Switch Readiness

Decision needed before paid beta:

- Define maximum daily spend.
- Define maximum daily write operations.
- Define maximum daily external API calls.
- Define when the system must stop automatically.
- Define who can restart production after a stop.

Current status: technically guarded, business thresholds not approved.

Owner action: approve caps before any paid or real usage.

### 9. Distribution Readiness

Decision needed before paid beta:

- Decide whether to publish only private/direct docs.
- Decide whether to publish to Postman public workspace.
- Decide whether to publish to API directories.
- Decide whether to publish an MCP tool or hosted MCP.
- Decide whether to wait until fiscal/legal/payment setup is complete.

Current status: blocked for public marketplace, hosted MCP and registry publication.

Owner action: no external publication without explicit approval.

## Recommended Beta Structure

Recommended next commercial structure, not activated yet:

1. Private controlled beta only.
2. Manual approval for every beta customer.
3. Sandbox-first integration test.
4. No personal data.
5. No real customer data unless policy is approved.
6. Production API key issued manually only after owner approval.
7. Credit cap per customer.
8. Kill switch enabled.
9. Clear refund and replacement rules.
10. No public marketplace listing until beta evidence is strong.

## Required Owner Approval Before Activation

Paid beta can only be considered ready when all items below are approved:

- Fiscal/admin path approved.
- Legal/privacy path approved.
- Payment method approved.
- Product catalog approved.
- Price list approved.
- Refund and credit policy approved.
- Production key policy approved.
- Data policy approved.
- Support policy approved.
- Cost caps approved.
- Kill switch owner approved.
- Distribution channel approved.

## Current Go/No-Go

Technical sandbox: go.

Paid beta preparation: go.

Paid beta activation: no-go.

Commercial go-live: no-go.

Public marketplace or hosted MCP: no-go.

## Recommended Next Step

Create the individual beta policies from this package:

- beta terms draft;
- refund and credit policy;
- production API key policy;
- data handling policy;
- support policy;
- cost cap and kill switch policy.

These can be drafted now without activating payments or collecting real customer data.
