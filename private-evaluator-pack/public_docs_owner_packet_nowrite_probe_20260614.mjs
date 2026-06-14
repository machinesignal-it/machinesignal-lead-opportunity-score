import fs from "node:fs";

const jsonPath = "private-evaluator-pack/public_docs_owner_packet_nowrite_20260614.json";
const mdPath = "private-evaluator-pack/public_docs_owner_packet_nowrite_20260614.md";
const reportPath = "private-evaluator-pack/public_docs_owner_packet_nowrite_probe_report_20260614.md";
const summaryPath = "private-evaluator-pack/public_docs_owner_packet_nowrite_probe_summary_20260614.json";

const packet = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
const md = fs.readFileSync(mdPath, "utf8");
const checks = [];

function check(name, ok, detail) {
  checks.push({ name, ok, detail: String(detail ?? "") });
}

function includesAll(values, required) {
  return required.every((item) => values.includes(item));
}

check("status_prepared", packet.status === "prepared", packet.status);
check("mode_nowrite_owner_packet", packet.mode === "NoWrite owner review packet", packet.mode);
check("source_gate_present", packet.source_gate === "public_docs_owner_approval_gate_nowrite_20260614", packet.source_gate);
check("commercial_not_live", packet.commercial_status === "not_live", packet.commercial_status);
check("go_live_no_go", packet.go_live_decision === "no_go", packet.go_live_decision);
check("owner_approval_required", packet.owner_approval_required === true, packet.owner_approval_required);
check("review_budget_max_20", packet.review_budget?.max_minutes === 20, packet.review_budget?.max_minutes);

const decisions = (packet.decision_options || []).map((item) => item.decision);
check(
  "decision_options_complete",
  includesAll(decisions, [
    "approve_as_internal_only",
    "approve_as_sandbox_public_docs_only",
    "request_rewording",
    "block_publication",
    "defer_until_legal_review"
  ]),
  decisions.join(", ")
);

const areas = (packet.review_cards || []).map((item) => item.area);
check(
  "review_cards_complete",
  includesAll(areas, [
    "README and top positioning",
    "What the API does not do",
    "OpenAPI and Postman examples",
    "MCP and machine discovery",
    "Legal, privacy and compliance wording"
  ]),
  areas.join(", ")
);

const blockList = packet.hard_blocks_confirmed || [];
check(
  "hard_blocks_preserved",
  includesAll(blockList, [
    "no_real_payments",
    "no_invoices",
    "no_payment_method_collection",
    "no_external_outreach",
    "no_email_sending_to_humans",
    "no_real_data_processing",
    "no_personal_data_processing",
    "no_production_api_key_issuing",
    "no_public_paid_marketplace",
    "no_hosted_mcp_public",
    "no_mcp_registry_publication",
    "no_commercial_go_live",
    "no_claim_legal_approval",
    "no_publish_final_terms",
    "no_publish_final_privacy_notice"
  ]),
  blockList.join(", ")
);

check(
  "default_internal_only",
  packet.recommended_default_without_owner_response === "approve_as_internal_only",
  packet.recommended_default_without_owner_response
);
check(
  "sandbox_next_action_present",
  packet.recommended_next_action_if_owner_approves_sandbox_docs === "sandbox_public_docs_readiness_probe_nowrite",
  packet.recommended_next_action_if_owner_approves_sandbox_docs
);
check(
  "no_decision_next_action_present",
  packet.recommended_next_action_if_no_owner_decision === "continue_internal_test_backlog_nowrite",
  packet.recommended_next_action_if_no_owner_decision
);
check("readiness_go_live_no_go", packet.readiness_after_packet?.go_live_status === "no_go", packet.readiness_after_packet?.go_live_status);
check(
  "publication_readiness_zero_without_owner",
  packet.readiness_after_packet?.public_docs_publication_readiness_without_owner_decision === 0,
  packet.readiness_after_packet?.public_docs_publication_readiness_without_owner_decision
);

const mdRequired = [
  "Non e' un via libera commerciale",
  "Default se il proprietario non risponde",
  "approve_as_internal_only",
  "approve_as_sandbox_public_docs_only",
  "no real payments",
  "no external outreach",
  "no hosted MCP public",
  "sandbox_public_docs_readiness_probe_nowrite"
];
check("md_required_phrases", mdRequired.every((phrase) => md.includes(phrase)), mdRequired.filter((phrase) => !md.includes(phrase)).join(", "));

const forbidden = [
  '"commercial_status": "live"',
  '"go_live_decision": "go"',
  '"owner_approval_required": false',
  "via libera commerciale approvato",
  "pagamenti reali attivi",
  "hosted MCP pubblico approvato"
];
const combined = JSON.stringify(packet, null, 2) + "\n" + md;
for (const phrase of forbidden) {
  check(`forbidden_absent_${phrase.replace(/[^a-z0-9]+/gi, "_").slice(0, 40)}`, !combined.includes(phrase), phrase);
}

const errors = checks.filter((item) => !item.ok);
const report = [
  "# Public Docs Owner Packet NoWrite Probe - 2026-06-14",
  "",
  `Checks: ${checks.length}`,
  `Errors: ${errors.length}`,
  "",
  `Result: ${errors.length === 0 ? "PASS" : "FAIL"}`,
  "",
  "## Errors",
  "",
  errors.length ? errors.map((item) => `- ${item.name}: ${item.detail}`).join("\n") : "None.",
  "",
  "## Next Action",
  "",
  packet.recommended_next_action_if_no_owner_decision
].join("\n");

fs.writeFileSync(reportPath, report);
fs.writeFileSync(summaryPath, JSON.stringify({
  probe_id: "public_docs_owner_packet_nowrite_probe_20260614",
  created_at: new Date().toISOString(),
  checks,
  errors
}, null, 2));

console.log(report);
if (errors.length) {
  process.exit(1);
}
