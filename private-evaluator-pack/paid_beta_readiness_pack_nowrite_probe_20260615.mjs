import fs from "node:fs/promises";

const mdPath = "private-evaluator-pack/paid_beta_readiness_pack_nowrite_20260615.md";
const jsonPath = "private-evaluator-pack/paid_beta_readiness_pack_nowrite_20260615.json";
const reportPath = "private-evaluator-pack/paid_beta_readiness_pack_nowrite_probe_report_20260615.md";
const summaryPath = "private-evaluator-pack/paid_beta_readiness_pack_nowrite_probe_summary_20260615.json";

const md = await fs.readFile(mdPath, "utf8");
const json = JSON.parse(await fs.readFile(jsonPath, "utf8"));
const lower = md.toLowerCase();

const requiredPhrases = [
  "commercial status: `not_live`",
  "go-live status: `no_go`",
  "real payments",
  "invoices",
  "collection of payment methods",
  "production api keys",
  "real customer data processing",
  "personal data processing",
  "external outreach",
  "public paid marketplace publication",
  "hosted mcp public launch",
  "commercial go-live",
  "legal and privacy",
  "admin and fiscal",
  "test-mode payment",
  "support, refund and credit policy",
  "cost and abuse controls",
  "owner approval matrix"
];

const forbiddenAuthorizations = [
  "commercial status: `live`",
  "go-live status: `go`",
  "authorizes paid beta",
  "authorizes real payment",
  "production keys are allowed now",
  "collect payment method now",
  "issue invoice now",
  "start paid beta now",
  "publish marketplace now",
  "launch hosted mcp now"
];

const checks = [];

for (const phrase of requiredPhrases) {
  checks.push({
    check: `required phrase: ${phrase}`,
    pass: lower.includes(phrase.toLowerCase())
  });
}

for (const phrase of forbiddenAuthorizations) {
  checks.push({
    check: `forbidden authorization absent: ${phrase}`,
    pass: !lower.includes(phrase.toLowerCase())
  });
}

const booleanChecks = [
  ["commercial_status_not_live", json.commercial_status === "not_live"],
  ["go_live_no_go", json.go_live === "no_go"],
  ["authorizes_paid_beta_false", json.authorizes_paid_beta === false],
  ["authorizes_real_payments_false", json.authorizes_real_payments === false],
  ["authorizes_invoices_false", json.authorizes_invoices === false],
  ["authorizes_payment_method_collection_false", json.authorizes_payment_method_collection === false],
  ["authorizes_production_keys_false", json.authorizes_production_keys === false],
  ["authorizes_real_data_processing_false", json.authorizes_real_data_processing === false],
  ["authorizes_personal_data_processing_false", json.authorizes_personal_data_processing === false],
  ["authorizes_external_outreach_false", json.authorizes_external_outreach === false],
  ["authorizes_public_paid_marketplace_false", json.authorizes_public_paid_marketplace === false],
  ["authorizes_hosted_mcp_public_launch_false", json.authorizes_hosted_mcp_public_launch === false],
  ["workstreams_10", Array.isArray(json.workstreams) && json.workstreams.length === 10],
  ["blocked_actions_12", Array.isArray(json.blocked_actions) && json.blocked_actions.length >= 12],
  ["next_step_probe", json.recommended_next_step === "paid_beta_readiness_pack_nowrite_probe_20260615"]
];

for (const [check, pass] of booleanChecks) {
  checks.push({ check, pass });
}

const failed = checks.filter((item) => !item.pass);
const summary = {
  artifact: "paid_beta_readiness_pack_nowrite_probe",
  date: "2026-06-15",
  mode: "NoWrite",
  total_checks: checks.length,
  failed_checks: failed.length,
  passed: failed.length === 0,
  commercial_status: json.commercial_status,
  go_live: json.go_live,
  next_step: failed.length === 0 ? "owner_review_or_terms_privacy_admin_drafts_nowrite" : "fix_pack_before_next_step",
  failed
};

const report = [
  "# MachineSignal - Paid-Beta Readiness Pack NoWrite Probe - 2026-06-15",
  "",
  `Mode: ${summary.mode}`,
  `Commercial status: ${summary.commercial_status}`,
  `Go-live: ${summary.go_live}`,
  `Total checks: ${summary.total_checks}`,
  `Failed checks: ${summary.failed_checks}`,
  `Result: ${summary.passed ? "PASS" : "FAIL"}`,
  "",
  "## Failed Checks",
  "",
  failed.length ? failed.map((item) => `- ${item.check}`).join("\n") : "None.",
  "",
  "## Guardrail",
  "",
  "This probe is NoWrite. It does not call external services, does not create customers, does not collect payment methods, does not issue invoices, does not process real or personal data and does not authorize paid beta."
].join("\n");

await fs.writeFile(reportPath, `${report}\n`, "utf8");
await fs.writeFile(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

console.log(JSON.stringify(summary, null, 2));
