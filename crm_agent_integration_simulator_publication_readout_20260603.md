# MachineSignal - CRM/Agent Integration Simulator Publication Readout

Finished at: 2026-06-03T11:28:00

## Result

Status: passed

The CRM/agent integration simulator report and simulated CRM ledger are now published and referenced by MachineSignal discovery resources.

## Published Resources

| Resource | Status | Expected Reference |
|---|---|---|
| `https://machinesignal.it/crm-agent-integration-simulator-readout.md` | HTTP 200 | `CRM/Agent Integration Simulator Readout` |
| `https://machinesignal.it/crm-agent-integration-simulated-ledger.json` | HTTP 200 | `machinesignal.action_pack.ready` |
| `https://machinesignal.it/integration-partner-pack.json` | HTTP 200 | `crm-agent-integration-simulator-readout.md` |
| `https://machinesignal.it/.well-known/machine-discovery.json` | HTTP 200 | `crm-agent-integration-simulated-ledger.json` |
| `https://machinesignal.it/machine-discovery/machine-discovery-pack.json` | HTTP 200 | `crm-agent-integration-simulator-readout.md` |
| `https://machinesignal.it/llms.txt` | HTTP 200 | `crm-agent-integration-simulator-readout.md` |
| `https://machinesignal.it/robots.txt` | HTTP 200 | `CRM-agent-integration-simulator-readout` |
| `https://machinesignal.it/sitemap.xml` | HTTP 200 | `crm-agent-integration-simulated-ledger.json` |

## Tested Flow

The simulator covered all three integration cases:

1. existing-list score;
2. no-list Target Discovery and follow-up score;
3. Deep Analysis to Action Pack and CRM payload preparation.

## Guardrails

- No real payment executed.
- No external contact executed.
- No email or external outreach sent by the simulator.
- Full API keys are not exposed in the public report.
