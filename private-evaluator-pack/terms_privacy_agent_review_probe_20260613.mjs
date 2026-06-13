import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const packDir = path.join(root, "private-evaluator-pack");
const jsonPath = path.join(packDir, "terms_privacy_agent_review_20260613.json");
const mdPath = path.join(packDir, "terms_privacy_agent_review_20260613.md");
const reportPath = path.join(packDir, "terms_privacy_agent_review_probe_report_20260613.md");
const summaryPath = path.join(packDir, "terms_privacy_agent_review_probe_summary_20260613.json");

const summary = {
  probe_id: "terms_privacy_agent_review_probe_20260613",
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
check("source_outline_present", data.source_outline === "terms_privacy_outline_draft_20260613", data.source_outline);
check("commercial_not_live", data.commercial_status === "not_live", data.commercial_status);
check("go_live_no_go", data.go_live_decision === "no_go", data.go_live_decision);

const requiredAgents = [
  "Orchestratore",
  "API Product Manager",
  "Data Quality & Compliance",
  "Admin & Finance Controller",
  "Legal & Risk",
  "Growth & Distribution",
  "Customer Feedback",
  "HR Agent Manager"
];
check("agent_votes_complete", containsAll(data.agent_votes, requiredAgents), requiredAgents.join(", "));

const requiredFindings = [
  "account umano",
  "machine-readable",
  "privacy data map",
  "supporto post-vendita",
  "forbidden_claims_check"
];
check("cross_agent_findings_cover_key_risks", containsAll(data.cross_agent_findings, requiredFindings), requiredFindings.join(", "));

const requiredArtifacts = [
  "terms_acceptance_flow",
  "privacy_data_map",
  "dpa_and_subprocessor_inventory",
  "fiscal_admin_go_live_gate",
  "support_privacy_terms_playbook",
  "machine_readable_terms_summary"
];
check("required_artifacts_present", containsAll(data.required_artifacts_before_live, requiredArtifacts), requiredArtifacts.join(", "));

const hardBlocks = [
  "real_payments",
  "invoices",
  "payment_method_collection",
  "external_outreach",
  "real_data_processing",
  "personal_data_processing",
  "production_api_key_issuing",
  "public_paid_marketplace",
  "hosted_mcp_public",
  "mcp_registry_publication",
  "commercial_go_live"
];
check("hard_blocks_preserved", containsAll(data.not_approved_now, hardBlocks), hardBlocks.join(", "));

check("approved_now_internal_only", containsAll(data.approved_now, ["internal", "non-public", "no real data", "gate"]), JSON.stringify(data.approved_now));
check("legal_privacy_readiness_50", data.readiness_after_review?.legal_privacy_readiness === 50, String(data.readiness_after_review?.legal_privacy_readiness));
check("go_live_status_no_go", data.readiness_after_review?.go_live_status === "no_go", data.readiness_after_review?.go_live_status);
check("next_action_privacy_data_map", data.recommended_next_action === "privacy_data_map_draft_nowrite", data.recommended_next_action);

const forbidden = [
  "go_live_decision\": \"go\"",
  "commercial_status\": \"live\"",
  "real_payments approved",
  "publish_final_terms approved",
  "dati reali approvati"
];
for (const item of forbidden) {
  check(`forbidden_absent_${item.replace(/[^a-z0-9]+/gi, "_")}`, !JSON.stringify(data).toLowerCase().includes(item.toLowerCase()) && !md.toLowerCase().includes(item.toLowerCase()), item);
}

check("md_contains_machine_responsibility", md.includes("dietro ogni macchina deve esserci un account umano o aziendale"), "machine responsibility");
check("md_contains_next_action", md.includes("privacy_data_map_draft_nowrite"), "next action");

const report = [
  "# Terms Privacy Agent Review Probe - 2026-06-13",
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
