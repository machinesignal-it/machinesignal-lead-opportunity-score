import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const packDir = path.join(root, "private-evaluator-pack");
const jsonPath = path.join(packDir, "support_privacy_terms_playbook_nowrite_20260613.json");
const mdPath = path.join(packDir, "support_privacy_terms_playbook_nowrite_20260613.md");
const reportPath = path.join(packDir, "support_privacy_terms_playbook_nowrite_probe_report_20260613.md");
const summaryPath = path.join(packDir, "support_privacy_terms_playbook_nowrite_probe_summary_20260613.json");

const summary = {
  probe_id: "support_privacy_terms_playbook_nowrite_probe_20260613",
  created_at: new Date().toISOString(),
  checks: [],
  errors: []
};

function check(name, ok, detail = "") {
  summary.checks.push({ name, ok, detail });
  if (!ok) summary.errors.push({ name, detail });
}

function containsAll(value, needles) {
  const text = JSON.stringify(value).toLowerCase();
  return needles.every((needle) => text.includes(String(needle).toLowerCase()));
}

const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
const md = fs.readFileSync(mdPath, "utf8");

check("status_prepared", data.status === "prepared", data.status);
check("mode_nowrite", data.mode === "NoWrite planning", data.mode);
check("source_acceptance_flow_present", data.source_acceptance_flow === "terms_acceptance_flow_draft_nowrite_20260613", data.source_acceptance_flow);
check("commercial_not_live", data.commercial_status === "not_live", data.commercial_status);
check("go_live_no_go", data.go_live_decision === "no_go", data.go_live_decision);

const allowedCases = ["S1_terms_explanation", "S2_credit_no_credit_question", "S3_schema_or_error_help", "S4_policy_status_question", "S5_sandbox_usage_question"];
check("allowed_cases_present", containsAll(data.allowed_agent_handling, allowedCases), allowedCases.join(", "));
check("allowed_cases_no_owner_escalation", data.allowed_agent_handling.every((c) => c.owner_escalation === false), "ordinary cases no escalation");

const escalationCases = ["E1_real_data_or_personal_data", "E2_payment_invoice_or_tax", "E3_legal_or_dpa_approval", "E4_external_outreach", "E5_security_or_key_exposure", "E6_publication_or_marketplace"];
check("mandatory_escalations_present", containsAll(data.mandatory_escalation_cases, escalationCases), escalationCases.join(", "));
check("mandatory_escalations_all_escalate", data.mandatory_escalation_cases.every((c) => c.owner_escalation === true), "all escalation true");

const standardResponses = ["MS_POLICY_LIVE_BLOCKED", "MS_POLICY_FORBIDDEN_INPUT", "MS_OUTPUT_INCOMPLETE", "MS_LEGAL_REVIEW_REQUIRED"];
check("standard_responses_present", containsAll(data.standard_responses, standardResponses), standardResponses.join(", "));
check("standard_responses_zero_credit", data.standard_responses.every((r) => r.machine_response?.credit_delta === 0), "zero credit");

check("queue_control_limits_owner", data.queue_control?.owner_escalation_digest_limit === 3 && data.queue_control?.hard_stop_if_escalations_exceed === 5, JSON.stringify(data.queue_control));
check("queue_control_owner_absence", containsAll(data.queue_control?.owner_absence_behavior, ["continue answering allowed cases", "block mandatory escalation cases", "preserve no-write mode"]), "absence behavior");

const evidence = ["case_id", "request_id", "error_code", "blocked_reason", "credit_delta", "redacted_payload_shape"];
check("evidence_without_sensitive_data", containsAll(data.evidence_to_store_without_sensitive_data, evidence), evidence.join(", "));

const forbiddenStorage = ["full_personal_payload", "full_api_key", "password", "payment_card_data", "personal_email_from_payload", "personal_phone_from_payload", "sensitive_data"];
check("forbidden_storage_present", containsAll(data.forbidden_storage, forbiddenStorage), forbiddenStorage.join(", "));

const hardBlocks = ["real_payments", "invoices", "payment_method_collection", "external_outreach", "email_sending_to_humans", "real_data_processing", "personal_data_processing", "production_api_key_issuing", "public_paid_marketplace", "hosted_mcp_public", "mcp_registry_publication", "commercial_go_live"];
check("hard_blocks_preserved", containsAll(data.hard_blocks_preserved, hardBlocks), hardBlocks.join(", "));

check("readiness_go_live_no_go", data.readiness_after_playbook?.go_live_status === "no_go", data.readiness_after_playbook?.go_live_status);
check("next_action_agent_policy", data.recommended_next_action === "agent_operating_policy_update_nowrite", data.recommended_next_action);

const forbiddenClaims = [
  "commercial_status\": \"live\"",
  "go_live_decision\": \"go\"",
  "pagamenti abilitati",
  "dati reali approvati",
  "legalmente approvato",
  "send_email\": true"
];
for (const claim of forbiddenClaims) {
  check(`forbidden_claim_absent_${claim.replace(/[^a-z0-9]+/gi, "_")}`, !JSON.stringify(data).toLowerCase().includes(claim.toLowerCase()) && !md.toLowerCase().includes(claim.toLowerCase()), claim);
}

check("md_contains_escalation_language", md.includes("Casi che richiedono blocco ed escalation"), "escalation heading");
check("md_next_action_present", md.includes("agent_operating_policy_update_nowrite"), "next action");

const report = [
  "# Support Privacy Terms Playbook NoWrite Probe - 2026-06-13",
  "",
  `Checks: ${summary.checks.length}`,
  `Errors: ${summary.errors.length}`,
  "",
  summary.errors.length === 0 ? "Result: PASS" : "Result: FAIL",
  "",
  "## Errors",
  "",
  summary.errors.length === 0 ? "None." : summary.errors.map((e) => `- ${e.name}: ${e.detail}`).join("\n")
].join("\n");

fs.writeFileSync(reportPath, report, "utf8");
fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2), "utf8");

if (summary.errors.length) {
  console.error(report);
  process.exit(1);
}

console.log(report);
