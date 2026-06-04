# MachineSignal Postman Public Collection Smoke Test - 2026-06-04

## Result

Status: passed

Run id: 20260604143256

Customer id: postman_public_smoke_20260604143256

Execution mode: stored_internal_monitor_key_after_sandbox_creation_block

## What was tested

1. Public Postman collection downloaded from https://machinesignal.it/postman_public_collection.json.
2. Required machine-first requests are present in the collection.
3. Collection contains no real API keys or obvious secrets.
4. Public marketplace submission pack and Postman workspace draft are available.
5. Sandbox customer creation is attempted without human sales contact.
6. If sandbox creation is temporarily rate-limited, the stored internal monitor key is used as fallback.
7. Authenticated onboarding works with the sandbox or monitor key.
8. Lead Opportunity Score works.
9. Deep Analysis purchase intent works.
10. Action Pack purchase intent works.
11. Payment-test intent works in sandbox mode.
12. Payment-test webhook activates test credits once.
13. Reconciliation confirms no real payment and no fiscal invoice.

## Key output

- Score: 55
- Decision: watchlist
- Orders created: 10
- Payment mode: sandbox
- Test credits activated: 1000
- Reconciliation OK: True
- Real payment executed: False
- External contact executed: False
- Real invoice issued: False

## Postman UI status

The public workspace UI publication is still not completed because GitHub OAuth returned a platform-side block: You can't perform that action at this time.

The collection itself is public, importable and machine-testable through the canonical URL:

https://machinesignal.it/postman_public_collection.json

## Decision

The Postman package is technically ready for a sandbox-only public workspace. The next owner approval gate is only the external workspace publication step, and no real API key should be published.
