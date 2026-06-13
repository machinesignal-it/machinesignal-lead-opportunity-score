import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const packDir = path.join(root, "private-evaluator-pack");
const jsonPath = path.join(packDir, "apply_public_wording_remediation_nowrite_20260613.json");
const mdPath = path.join(packDir, "apply_public_wording_remediation_nowrite_20260613.md");
const scanSummaryPath = path.join(packDir, "public_wording_scan_nowrite_summary_20260613.json");
const reportPath = path.join(packDir, "apply_public_wording_remediation_nowrite_probe_report_20260613.md");
const summaryPath = path.join(packDir, "apply_public_wording_remediation_nowrite_probe_summary_20260613.json");

const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
const scan = JSON.parse(fs.readFileSync(scanSummaryPath, "utf8"));
const md = fs.readFileSync(mdPath, "utf8");

const probe = {
  probe_id: "apply_public_wording_remediation_nowrite_probe_20260613",
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

check("status_applied", data.status === "applied", data.status);
check("mode_nowrite_remediation", data.mode === "NoWrite remediation", data.mode);
check("commercial_not_live", data.commercial_status === "not_live", data.commercial_status);
check("go_live_no_go", data.go_live_decision === "no_go", data.go_live_decision);
check("five_replacements_applied", Array.isArray(data.applied_replacements) && data.applied_replacements.length === 5, String(data.applied_replacements?.length || 0));
check("changed_files_expected", containsAll(data.files_changed, ["README.md", "api_endpoint_minimal/core.mjs", "docs/api-directory-listing.md"]), JSON.stringify(data.files_changed));
check("scan_findings_zero", scan.findings_total === 0, String(scan.findings_total));
check("scan_publication_status_clean", scan.publication_status === "clean_for_wording_guard_only_not_owner_approved", scan.publication_status);
check("validation_zero_findings", data.validation?.public_wording_scan_findings === 0 && data.validation?.public_wording_scan_probe_errors === 0, JSON.stringify(data.validation));

const sensitivePatterns = ["send outreach", "production API key", "guaranteed revenue"];
for (const file of ["README.md", "api_endpoint_minimal/core.mjs", "docs/api-directory-listing.md"]) {
  const text = fs.readFileSync(path.join(root, file), "utf8").toLowerCase();
  for (const pattern of sensitivePatterns) {
    check(`sensitive_absent_${file}_${pattern}`.replace(/[^a-z0-9]+/gi, "_"), !text.includes(pattern), `${file} ${pattern}`);
  }
}

const hardBlocks = ["real_payments", "invoices", "payment_method_collection", "external_outreach", "email_sending_to_humans", "real_data_processing", "personal_data_processing", "production_api_key_issuing", "public_paid_marketplace", "hosted_mcp_public", "mcp_registry_publication", "commercial_go_live"];
check("hard_blocks_preserved", containsAll(data.hard_blocks_preserved, hardBlocks), hardBlocks.join(", "));
check("readiness_go_live_no_go", data.readiness_after_apply?.go_live_status === "no_go", data.readiness_after_apply?.go_live_status);
check("next_action_owner_gate", data.recommended_next_action === "public_docs_owner_approval_gate_nowrite", data.recommended_next_action);

const forbiddenClaims = [
  "commercial_status\": \"live\"",
  "go_live_decision\": \"go\"",
  "pagamenti abilitati",
  "pubblicazione approvata",
  "go-live: go"
];
for (const claim of forbiddenClaims) {
  check(`forbidden_claim_absent_${claim.replace(/[^a-z0-9]+/gi, "_")}`, !JSON.stringify(data).toLowerCase().includes(claim.toLowerCase()) && !md.toLowerCase().includes(claim.toLowerCase()), claim);
}

const probeReport = [
  "# Apply Public Wording Remediation NoWrite Probe - 2026-06-13",
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

fs.writeFileSync(reportPath, probeReport, "utf8");
fs.writeFileSync(summaryPath, JSON.stringify(probe, null, 2), "utf8");

if (probe.errors.length) {
  console.error(probeReport);
  process.exit(1);
}

console.log(probeReport);
