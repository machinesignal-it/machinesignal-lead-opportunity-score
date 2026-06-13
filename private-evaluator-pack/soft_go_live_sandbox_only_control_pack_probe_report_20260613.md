# Soft Go-Live Sandbox-Only Control Pack Probe

Date: 2026-06-13

Status: passed

This probe validates the control pack before any bounded soft go-live rehearsal.

## Result

- checks total: 76
- checks failed: 0
- max POST calls per controlled rehearsal: 5
- paid launch allowed: false
- live payment allowed: false
- invoice allowed: false
- hosted public MCP allowed: false
- human outreach allowed: false
- real customer data allowed: false
- personal data allowed: false

## Interpretation

The control pack is complete enough to run one bounded soft go-live sandbox-only rehearsal.

## Next

Allowed: run_one_bounded_soft_go_live_rehearsal_against_public_assets

Blocked if failed: repair_control_pack_before_rehearsal

## Failed Checks

None.
