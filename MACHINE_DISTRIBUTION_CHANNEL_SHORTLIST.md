# MachineSignal - Machine-first distribution channel shortlist

Date: 2026-06-01

## Selection logic

The goal is not to send cold emails to humans. The goal is to expose MachineSignal where software, developers, API crawlers, CRM builders and AI agents already look for tools.

Channels are scored on:

- machine discoverability;
- API/OpenAPI compatibility;
- ability to test without human conversation;
- commercial relevance;
- setup effort;
- fit with the current beta stage.

## Recommended order

| Priority | Channel | Status | Why it matters | What we publish | Human action |
| --- | --- | --- | --- | --- | --- |
| 1 | Own domain machine surfaces | Done, keep improving | Highest control and no platform dependency | `llms.txt`, OpenAPI, product catalog, machine onboarding, discovery pack, distribution pack, well-known JSON | None |
| 2 | GitHub repository | Active | Developers, crawlers and agents can inspect versioned docs and JSON assets | README, OpenAPI, Postman, discovery JSON, distribution JSON, examples | None unless GitHub asks for account confirmation |
| 3 | Postman Public API Network | Ready next | Strong API discovery surface; public workspaces help onboarding and search discovery | Public workspace, collection, documentation, examples | User may need to confirm workspace visibility |
| 4 | RapidAPI Hub | Good beta test | API marketplace with provider dashboard, listing metadata, OpenAPI/docs and browser testing | API listing, OpenAPI, docs, base URL, sandbox endpoint | User may need provider account/payment/tax checks later |
| 5 | APILayer / curated API marketplaces | Evaluate | Potential API buyer traffic, but may be curated and less self-service | Submission profile and docs | Likely requires review or contact form |
| 6 | Smithery | Later | Relevant for agent/tool discovery, but expects an MCP server URL | MCP server listing | Build MCP wrapper first |
| 7 | Glama MCP registry | Later | Large MCP registry/discovery surface | MCP server metadata | Build MCP wrapper first |
| 8 | AgentNDX | Later | Agentic registry focused on MCP/A2A/x402 services | MCP/A2A/x402 service metadata | Build MCP/A2A or x402-compatible surface first |
| 9 | MCPDrop | Later | MCP directory, useful after tool wrapper exists | MCP server listing | Build MCP wrapper first |

## Immediate execution plan

1. Publish and polish Postman public workspace.
2. Prepare RapidAPI listing fields from `API_DIRECTORY_SUBMISSION.md`.
3. Keep GitHub and own domain as canonical source of truth.
4. Add a future MCP wrapper only after REST sandbox metrics show real usage.
5. Do not spend time on human outreach until machine discovery traffic is measurable.

## Channel notes

### Postman Public API Network

Best next step because we already have a Postman account and a collection. It can expose the API through a public workspace and public API documentation.

### RapidAPI

Useful for testing marketplace-style discovery and later billing. It should not be treated as guaranteed revenue. The listing should use our existing OpenAPI, product copy and sandbox flow. We should start with a beta/free or low-friction plan before real paid plans.

### MCP directories

Not first. These become attractive only after MachineSignal exposes an MCP server or agent tool wrapper. Listing a plain REST API as if it were an MCP server would be confusing and weak.

## Recommendation

Proceed in this order:

1. Postman public workspace.
2. RapidAPI provider listing draft.
3. Public GitHub release/tag for Machine Discovery Pack.
4. MCP wrapper feasibility test.

