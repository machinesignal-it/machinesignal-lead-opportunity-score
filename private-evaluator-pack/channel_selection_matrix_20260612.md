# MachineSignal Channel Selection Matrix

Date: 2026-06-12

Status: NoPublish - NoSend - NoWrite - Simulation Only

## Decision

Recommended primary next channel: `mcp_tool_registry_draft`.

Recommended companion channel: `github_machine_docs`.

Deferred channels:

- `rapidapi_marketplace_publication`
- `postman_api_network_publication`
- `generic_api_directory_publication`

## Why

MachineSignal is trying to sell to machines, not persuade humans by email. The next channel should therefore be the one closest to AI agents and software tools.

MCP/tool-registry draft is the best primary simulation path because MCP is built for AI applications to connect to external tools and resources. It fits the idea that a machine discovers a tool, understands what it does, and decides whether to call it.

GitHub machine docs are the best companion path because they are low-risk and strengthen the evidence layer without activating payments, invitations or marketplace publication.

Postman, generic API directories and RapidAPI-style marketplaces remain useful, but they move closer to public distribution, live API consumers, pricing, support, keys and policy obligations. They should stay blocked until a new gate.

## Weighted Scores

| Channel | Score | Decision |
|---|---:|---|
| MCP / Tool Registry Draft | 7.85 | Prepare next, but NoPublish |
| GitHub Machine Docs | 7.15 | Improve as companion evidence |
| Postman API Network Draft | 7.00 | Keep ready, do not publish |
| Generic API Directory Draft | 6.75 | Keep as unsubmitted draft |
| RapidAPI-Style Marketplace Draft | 6.45 | Defer until legal/fiscal/billing gate |

## Safety Blocks

- No external send.
- No public marketplace/API directory publication.
- No hosted MCP launch.
- No live billing.
- No invoices.
- No subscription.
- No production API key distribution.
- No personal data.
- No write calls.
- No credit consumption.
- No human outreach.

## Next Allowed Action

Prepare:

```text
mcp_channel_entrypoint_draft_nopublish.json
```

Then run a NoPublish MCP channel probe where a machine reads the entrypoint and decides whether the MCP path is understandable, without submitting to any registry and without launching hosted MCP.

## Sources Checked

- Postman API Network overview: https://learning.postman.com/docs/postman-api-network/overview
- Postman public API publishing: https://learning.postman.com/docs/postman-api-network/showcase/publish/public-apis
- RapidAPI add API project: https://docs.rapidapi.com/docs/add-api-getting-started
- RapidAPI key rotation: https://docs.rapidapi.com/docs/keys-and-key-rotation
- MCP introduction: https://modelcontextprotocol.io/docs/getting-started/intro
- MCP tools specification: https://modelcontextprotocol.io/specification/2025-06-18/server/tools
- GitHub repository topics: https://docs.github.com/articles/classifying-your-repository-with-topics
- GitHub README docs: https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes

