import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const packDir = path.join(root, "private-evaluator-pack");
const summaryPath = path.join(packDir, "public_wording_scan_nowrite_summary_20260613.json");
const reportPath = path.join(packDir, "public_wording_scan_nowrite_report_20260613.md");
const probeReportPath = path.join(packDir, "public_wording_scan_nowrite_probe_report_20260613.md");
const probeSummaryPath = path.join(packDir, "public_wording_scan_nowrite_probe_summary_20260613.json");

const summary = JSON.parse(fs.readFileSync(summaryPath, "utf8"));
const report = fs.readFileSync(reportPath, "utf8");

const probe = {
  probe_id: "public_wording_scan_nowrite_probe_20260613",
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

check("status_reported", summary.status === "reported", summary.status);
check("mode_nowrite_scan", summary.mode === "NoWrite scan", summary.mode);
check("source_guard_present", summary.source_guard === "public_wording_guard_nowrite_20260613", summary.source_guard);
check("commercial_not_live", summary.commercial_status === "not_live", summary.commercial_status);
check("go_live_no_go", summary.go_live_decision === "no_go", summary.go_live_decision);
check("files_scanned_positive", summary.files_scanned > 0, String(summary.files_scanned));
check("findings_total_number", Number.isInteger(summary.findings_total), String(summary.findings_total));
check("publication_status_valid", ["clean_for_wording_guard_only_not_owner_approved", "blocked_until_wording_review"].includes(summary.publication_status), summary.publication_status);
check("findings_match_total", Array.isArray(summary.findings) && summary.findings.length === summary.findings_total, `${summary.findings?.length} vs ${summary.findings_total}`);

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
check("hard_blocks_preserved", containsAll(summary.hard_blocks_preserved, hardBlocks), hardBlocks.join(", "));
check("readiness_go_live_no_go", summary.readiness_after_scan?.go_live_status === "no_go", summary.readiness_after_scan?.go_live_status);
check("next_action_valid", ["public_docs_owner_approval_gate_nowrite", "public_wording_remediation_draft_nowrite"].includes(summary.recommended_next_action), summary.recommended_next_action);

for (const finding of summary.findings) {
  check(`finding_has_required_fields_${finding.file}_${finding.line}_${finding.pattern}`.slice(0, 120), Boolean(finding.file && finding.line && finding.pattern && finding.severity && finding.suggested_replacement), JSON.stringify(finding));
}

const forbiddenClaims = [
  "commercial_status: live",
  "go-live: go",
  "publication_status: approved",
  "real payments enabled"
];
for (const claim of forbiddenClaims) {
  check(`forbidden_report_claim_absent_${claim.replace(/[^a-z0-9]+/gi, "_")}`, !report.toLowerCase().includes(claim.toLowerCase()), claim);
}

check("report_contains_counts", report.includes("Files scanned:") && report.includes("Findings:"), "counts");
check("report_contains_next_action", report.includes(summary.recommended_next_action), "next action");

const probeReport = [
  "# Public Wording Scan NoWrite Probe - 2026-06-13",
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

fs.writeFileSync(probeReportPath, probeReport, "utf8");
fs.writeFileSync(probeSummaryPath, JSON.stringify(probe, null, 2), "utf8");

if (probe.errors.length) {
  console.error(probeReport);
  process.exit(1);
}

console.log(probeReport);
