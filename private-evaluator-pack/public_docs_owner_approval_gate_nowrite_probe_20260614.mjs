import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const packDir = path.join(root, "private-evaluator-pack");
const jsonPath = path.join(packDir, "public_docs_owner_approval_gate_nowrite_20260614.json");
const mdPath = path.join(packDir, "public_docs_owner_approval_gate_nowrite_20260614.md");
const reportPath = path.join(packDir, "public_docs_owner_approval_gate_nowrite_probe_report_20260614.md");
const summaryPath = path.join(packDir, "public_docs_owner_approval_gate_nowrite_probe_summary_20260614.json");

const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
const md = fs.readFileSync(mdPath, "utf8");

const probe = {
  probe_id: "public_docs_owner_approval_gate_nowrite_probe_20260614",
  created_at: new Date().toISOString(),
  checks: [],
  errors: []
};

function check(name, ok, detail = "") {
  probe.checks.push({ name, ok, detail });
  if (!ok) probe.errors.push({ name, detail });
}

function containsAll(value, needles) {
  const text = JSON.stringify(value).toLowerCase();
  return needles.every((needle) => text.includes(String(needle).toLowerCase()));
}

check("status_prepared", data.status === "prepared", data.status);
check("mode_nowrite", data.mode === "NoWrite planning", data.mode);
check("source_remediation_present", data.source_remediation === "apply_public_wording_remediation_nowrite_20260613", data.source_remediation);
check("commercial_not_live", data.commercial_status === "not_live", data.commercial_status);
check("go_live_no_go", data.go_live_decision === "no_go", data.go_live_decision);
check("owner_approval_required", data.owner_approval_required === true, String(data.owner_approval_required));
check("wording_findings_zero", data.current_evidence?.public_wording_scan_findings === 0, String(data.current_evidence?.public_wording_scan_findings));
check("probe_errors_zero", data.current_evidence?.probe_errors === 0, String(data.current_evidence?.probe_errors));

const categories = ["public_readme_and_docs", "openapi_postman_contracts", "mcp_and_machine_discovery", "commercial_claims", "legal_privacy_terms"];
check("approval_categories_present", containsAll(data.approval_categories, categories), categories.join(", "));

const decisions = ["approve_as_internal_only", "approve_as_sandbox_public_docs_only", "request_rewording", "block_publication", "defer_until_legal_review"];
check("decision_model_present", containsAll(data.approval_decision_model?.possible_owner_decisions, decisions), decisions.join(", "));
check("default_internal_only", data.approval_decision_model?.default_if_no_owner_response === "approve_as_internal_only", data.approval_decision_model?.default_if_no_owner_response);
check("current_internal_only", data.approval_decision_model?.current_decision === "approve_as_internal_only", data.approval_decision_model?.current_decision);

const hardBlocks = ["real_payments", "invoices", "payment_method_collection", "external_outreach", "email_sending_to_humans", "real_data_processing", "personal_data_processing", "production_api_key_issuing", "public_paid_marketplace", "hosted_mcp_public", "mcp_registry_publication", "commercial_go_live", "claim_legal_approval", "publish_final_terms", "publish_final_privacy_notice"];
check("hard_blocks_preserved", containsAll(data.must_remain_blocked_after_this_gate, hardBlocks), hardBlocks.join(", "));

check("owner_packet_time_limit", data.owner_review_packet?.max_owner_time_minutes === 20, String(data.owner_review_packet?.max_owner_time_minutes));
check("owner_questions_present", containsAll(data.owner_review_packet?.owner_questions, ["machine-first", "vendiamo ancora live", "outreach", "dati reali/personali", "promessa commerciale"]), JSON.stringify(data.owner_review_packet?.owner_questions));
check("readiness_go_live_no_go", data.readiness_after_gate?.go_live_status === "no_go", data.readiness_after_gate?.go_live_status);
check("next_action_owner_packet", data.recommended_next_action === "public_docs_owner_packet_nowrite", data.recommended_next_action);

const forbiddenClaims = [
  "commercial_status\": \"live\"",
  "go_live_decision\": \"go\"",
  "owner_approval_required\": false",
  "pubblicazione approvata",
  "go-live: go"
];
for (const claim of forbiddenClaims) {
  check(`forbidden_claim_absent_${claim.replace(/[^a-z0-9]+/gi, "_")}`, !JSON.stringify(data).toLowerCase().includes(claim.toLowerCase()) && !md.toLowerCase().includes(claim.toLowerCase()), claim);
}

check("md_contains_owner_approval", md.includes("Serve ancora approvazione proprietario"), "owner approval");
check("md_next_action_present", md.includes("public_docs_owner_packet_nowrite"), "next action");

const report = [
  "# Public Docs Owner Approval Gate NoWrite Probe - 2026-06-14",
  "",
  `Checks: ${probe.checks.length}`,
  `Errors: ${probe.errors.length}`,
  "",
  probe.errors.length === 0 ? "Result: PASS" : "Result: FAIL",
  "",
  "## Errors",
  "",
  probe.errors.length === 0 ? "None." : probe.errors.map((e) => `- ${e.name}: ${e.detail}`).join("\n")
].join("\n");

fs.writeFileSync(reportPath, report, "utf8");
fs.writeFileSync(summaryPath, JSON.stringify(probe, null, 2), "utf8");

if (probe.errors.length) {
  console.error(report);
  process.exit(1);
}

console.log(report);
