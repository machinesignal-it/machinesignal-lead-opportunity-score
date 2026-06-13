import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const packDir = path.join(root, "private-evaluator-pack");
const jsonPath = path.join(packDir, "agent_operating_policy_update_nowrite_20260613.json");
const mdPath = path.join(packDir, "agent_operating_policy_update_nowrite_20260613.md");
const reportPath = path.join(packDir, "agent_operating_policy_update_nowrite_probe_report_20260613.md");
const summaryPath = path.join(packDir, "agent_operating_policy_update_nowrite_probe_summary_20260613.json");

const summary = {
  probe_id: "agent_operating_policy_update_nowrite_probe_20260613",
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
check("source_playbook_present", data.source_playbook === "support_privacy_terms_playbook_nowrite_20260613", data.source_playbook);
check("commercial_not_live", data.commercial_status === "not_live", data.commercial_status);
check("go_live_no_go", data.go_live_decision === "no_go", data.go_live_decision);

const requiredAgents = [
  "Orchestratore",
  "Agente API",
  "Architetto web AI",
  "Data Scout",
  "Data Quality & Compliance",
  "Scoring Optimizer",
  "API Product Manager",
  "Growth & Distribution",
  "Customer Feedback",
  "Admin & Finance Controller",
  "Legal & Risk",
  "HR Agent Manager"
];
check("required_agents_present", containsAll(data.applies_to_agents, requiredAgents), requiredAgents.join(", "));

const alwaysAllowed = [
  "create_internal_drafts",
  "run_synthetic_tests",
  "validate_schema",
  "run_secret_scans",
  "run_cost_guard_simulations",
  "commit_and_push_internal_artifacts"
];
check("always_allowed_nowrite_present", containsAll(data.always_allowed_nowrite_actions, alwaysAllowed), alwaysAllowed.join(", "));

const hardStops = [
  "real_payments",
  "invoices",
  "payment_method_collection",
  "external_outreach",
  "email_sending_to_humans",
  "real_data_processing",
  "personal_data_processing",
  "production_api_key_issuing",
  "public_paid_marketplace",
  "hosted_mcp_public",
  "mcp_registry_publication",
  "commercial_go_live",
  "claim_legal_approval",
  "publish_final_terms",
  "publish_final_privacy_notice",
  "treat_machine_as_sole_legal_counterparty"
];
check("hard_stops_present", containsAll(data.hard_stop_actions, hardStops), hardStops.join(", "));

check("decision_protocol_six_steps", Array.isArray(data.agent_decision_protocol) && data.agent_decision_protocol.length === 6, String(data.agent_decision_protocol?.length || 0));
check("decision_protocol_checks_hard_stops", containsAll(data.agent_decision_protocol, ["Check hard stops", "Check data scope", "Check externality", "Produce one bounded artifact"]), "protocol core");

check("self_improvement_allowed", data.self_improvement_loop?.allowed === true, String(data.self_improvement_loop?.allowed));
check("self_improvement_has_limits", containsAll(data.self_improvement_loop?.not_allowed, ["changing hard stops", "real personal data", "auto-publishing", "paid tools", "auto-contacting prospects"]), "limits");
check("self_improvement_has_memory", containsAll(data.self_improvement_loop?.memory_artifacts, ["probe summaries", "agent reviews", "readiness matrices", "support playbooks", "data maps"]), "memory artifacts");

const roleAgents = ["Growth & Distribution", "Sales Automation Agent", "Data Scout", "Admin & Finance Controller", "Legal & Risk", "Customer Feedback"];
check("role_specific_rules_present", containsAll(data.role_specific_rules, roleAgents), roleAgents.join(", "));

const qualityGates = [
  "commercial_status_not_live",
  "go_live_no_go_unless_explicit_owner_approval",
  "hard_blocks_preserved",
  "no_real_personal_data",
  "no_secret_leak",
  "probe_errors_zero",
  "repo_clean_after_commit",
  "remote_head_matches_local_head"
];
check("quality_gates_present", containsAll(data.quality_gates_for_each_step, qualityGates), qualityGates.join(", "));

check("output_contract_present", containsAll(data.agent_output_contract?.must_include, ["what_was_done", "validation_checks", "errors_count", "commit_hash_if_committed", "go_live_status", "next_step"]), "must include");
check("output_contract_forbids_sensitive", containsAll(data.agent_output_contract?.must_not_include, ["secret_values", "full_api_keys", "personal_data", "unapproved_legal_claims", "payment_collection_instructions"]), "must not include");

check("readiness_go_live_no_go", data.readiness_after_policy_update?.go_live_status === "no_go", data.readiness_after_policy_update?.go_live_status);
check("next_action_rehearsal", data.recommended_next_action === "agent_policy_compliance_rehearsal_nowrite", data.recommended_next_action);

const forbiddenClaims = [
  "commercial_status\": \"live\"",
  "go_live_decision\": \"go\"",
  "pagamenti abilitati",
  "dati reali approvati",
  "hard stop rimossi",
  "auto-contattare prospect"
];
for (const claim of forbiddenClaims) {
  check(`forbidden_claim_absent_${claim.replace(/[^a-z0-9]+/gi, "_")}`, !JSON.stringify(data).toLowerCase().includes(claim.toLowerCase()) && !md.toLowerCase().includes(claim.toLowerCase()), claim);
}

check("md_contains_hard_stop", md.includes("Hard stop"), "hard stop heading");
check("md_next_action_present", md.includes("agent_policy_compliance_rehearsal_nowrite"), "next action");

const report = [
  "# Agent Operating Policy Update NoWrite Probe - 2026-06-13",
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
