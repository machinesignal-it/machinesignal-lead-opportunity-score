import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const packDir = path.join(root, "private-evaluator-pack");
const jsonPath = path.join(packDir, "public_wording_guard_nowrite_20260613.json");
const mdPath = path.join(packDir, "public_wording_guard_nowrite_20260613.md");
const reportPath = path.join(packDir, "public_wording_guard_nowrite_probe_report_20260613.md");
const summaryPath = path.join(packDir, "public_wording_guard_nowrite_probe_summary_20260613.json");

const summary = {
  probe_id: "public_wording_guard_nowrite_probe_20260613",
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
check("source_rehearsal_present", data.source_rehearsal === "agent_policy_compliance_rehearsal_nowrite_20260613", data.source_rehearsal);
check("commercial_not_live", data.commercial_status === "not_live", data.commercial_status);
check("go_live_no_go", data.go_live_decision === "no_go", data.go_live_decision);
check("public_publication_not_allowed", data.public_publication_allowed === false, String(data.public_publication_allowed));

const allowed = ["sandbox synthetic testing only", "draft_not_live", "no_go", "requires owner approval", "no real payments", "synthetic data only"];
check("allowed_patterns_present", containsAll(data.allowed_wording_patterns, allowed), allowed.join(", "));

const forbidden = ["buy now", "subscribe now", "pay now", "invoice available", "production ready", "go live approved", "legally approved", "GDPR compliant", "guaranteed leads", "guaranteed revenue", "send outreach", "real customer data supported", "production API key", "public marketplace listing"];
check("forbidden_patterns_present", containsAll(data.forbidden_wording_patterns, forbidden), forbidden.join(", "));
check("critical_patterns_exist", data.forbidden_wording_patterns.filter((p) => p.severity === "critical").length >= 7, "critical count");
check("replacement_guidance_present", containsAll(data.replacement_guidance, ["buy now", "production ready", "GDPR compliant", "guaranteed leads", "real customer data supported", "production API key"]), "replacement guidance");
check("files_to_scan_present", containsAll(data.files_to_scan_before_publication, ["README.md", "docs", "OpenAPI files", "Postman collections", "MCP descriptors", "landing pages"]), "files to scan");
check("scan_policy_blocks_critical", data.scan_policy?.block_on_critical === true && data.scan_policy?.block_on_high_if_public === true, JSON.stringify(data.scan_policy));
check("safe_notice_blocks_live", containsAll(data.sample_safe_public_notice?.text, ["sandbox/pre-live", "synthetic testing", "Commercial live use", "require explicit owner approval"]), data.sample_safe_public_notice?.text);

const hardBlocks = ["real_payments", "invoices", "payment_method_collection", "external_outreach", "email_sending_to_humans", "real_data_processing", "personal_data_processing", "production_api_key_issuing", "public_paid_marketplace", "hosted_mcp_public", "mcp_registry_publication", "commercial_go_live", "claim_legal_approval", "publish_final_terms", "publish_final_privacy_notice"];
check("hard_blocks_preserved", containsAll(data.hard_blocks_preserved, hardBlocks), hardBlocks.join(", "));
check("readiness_go_live_no_go", data.readiness_after_guard?.go_live_status === "no_go", data.readiness_after_guard?.go_live_status);
check("next_action_scan", data.recommended_next_action === "public_wording_scan_nowrite", data.recommended_next_action);

const forbiddenClaims = [
  "commercial_status\": \"live\"",
  "go_live_decision\": \"go\"",
  "public_publication_allowed\": true",
  "pagamenti abilitati",
  "go-live: go"
];
for (const claim of forbiddenClaims) {
  check(`forbidden_claim_absent_${claim.replace(/[^a-z0-9]+/gi, "_")}`, !JSON.stringify(data).toLowerCase().includes(claim.toLowerCase()) && !md.toLowerCase().includes(claim.toLowerCase()), claim);
}

check("md_contains_forbidden_table", md.includes("Wording vietato") && md.includes("buy now"), "forbidden table");
check("md_next_action_present", md.includes("public_wording_scan_nowrite"), "next action");

const report = [
  "# Public Wording Guard NoWrite Probe - 2026-06-13",
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
