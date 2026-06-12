# Public Static Contract Deploy Probe

Date: 2026-06-12

Status: passed

This probe verifies that the public MachineSignal static contracts match the local repository contracts after FTP publication.

## Result

- checks total: 21
- checks failed: 0
- live billing executed: no
- production keys exposed: no
- real customer data used: no
- personal data used: no
- human outreach executed: no
- hosted MCP deployed: no

## Public Contracts

- openapi: https://machinesignal.it/openapi.json HTTP 200, public bytes 62565
- root_mcp_manifest: https://machinesignal.it/mcp-tool-manifest.json HTTP 200, public bytes 130510
- well_known_mcp_manifest: https://machinesignal.it/.well-known/mcp-tool-manifest.json HTTP 200, public bytes 130510

## Interpretation

The public static contracts are aligned with the local repository and can be read by automated clients, CRM workflows, AI agents and API directories.

## Next

Allowed: continue_p2_staging_design_only_or_public_machine_docs_probe

Blocked if failed: repair_public_static_contract_deploy_before_any_distribution_step

## Failed Checks

None.
