import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const summaryPath = path.join(root, "private-evaluator-pack", "contract_docs_consistency_check_summary_20260613.json");
const reportPath = path.join(root, "private-evaluator-pack", "contract_docs_consistency_check_report_20260613.md");
const probeSummaryPath = path.join(root, "private-evaluator-pack", "contract_docs_consistency_check_probe_summary_20260613.json");
const probeReportPath = path.join(root, "private-evaluator-pack", "contract_docs_consistency_check_probe_report_20260613.md");

const summary = JSON.parse(fs.readFileSync(summaryPath, "utf8"));
const report = fs.readFileSync(reportPath, "utf8");

const checks = [];
function check(name, ok, detail = "") {
  checks.push({ name, ok: Boolean(ok), detail });
}

check("summary passed", summary.status === "passed", summary.status);
check("status level green", summary.status_level === "green", summary.status_level);
check("mode NoWrite", summary.mode === "NoWrite", summary.mode);
check("zero POST calls", summary.post_calls_executed === 0, String(summary.post_calls_executed));
check("zero write calls", summary.write_calls_executed === 0, String(summary.write_calls_executed));
check("no failed checks", summary.checks_failed === 0, String(summary.checks_failed));
check("checks total high enough", summary.checks_total >= 60, String(summary.checks_total));
check("public resources checked", summary.public_resources_checked >= 7, String(summary.public_resources_checked));
check("OpenAPI methods detected", summary.openapi_methods_count > 0, String(summary.openapi_methods_count));
check("Postman items detected", summary.postman_items_count >= 10, String(summary.postman_items_count));
check("payment test items detected", summary.payment_test_items_count >= 1, String(summary.payment_test_items_count));
check("next action is closure review", summary.next_recommended_action === "prepare_go_live_test_closure_review", summary.next_recommended_action);

for (const phrase of [
  "machine-first",
  "Target Discovery",
  "Score",
  "Deep Analysis",
  "Action Pack",
  "test-mode/simulated only",
  "Live payments, invoices, hosted public MCP, external publication, outreach, real data and personal data remain blocked",
  "GET only"
]) {
  check(`report contains: ${phrase}`, report.includes(phrase), phrase);
}

const failed = checks.filter((item) => !item.ok);
const probeSummary = {
  probe_id: "contract_docs_consistency_check_probe_20260613",
  status: failed.length === 0 ? "passed" : "failed",
  checks_total: checks.length,
  checks_failed: failed.length,
  failed_checks: failed,
  source_status: summary.status,
  source_status_level: summary.status_level,
  recommended_next_action: summary.next_recommended_action
};

const probeReport = [
  "# Contract-docs consistency check probe",
  "",
  `Status: ${probeSummary.status}`,
  `Checks total: ${probeSummary.checks_total}`,
  `Checks failed: ${probeSummary.checks_failed}`,
  `Source status: ${probeSummary.source_status}`,
  `Source status level: ${probeSummary.source_status_level}`,
  "",
  "## Failed checks",
  "",
  failed.length === 0 ? "None." : failed.map((item) => `- ${item.name}: ${item.detail}`).join("\n"),
  "",
  "## Recommended next action",
  "",
  probeSummary.recommended_next_action
].join("\n");

fs.writeFileSync(probeSummaryPath, JSON.stringify(probeSummary, null, 2) + "\n");
fs.writeFileSync(probeReportPath, probeReport + "\n");

if (failed.length > 0) {
  console.error(probeReport);
  process.exit(1);
}

console.log(probeReport);
