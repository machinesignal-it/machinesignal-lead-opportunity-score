import fs from "node:fs/promises";

const mdPath = "private-evaluator-pack/terms_privacy_admin_payment_support_draft_pack_nowrite_20260615.md";
const jsonPath = "private-evaluator-pack/terms_privacy_admin_payment_support_draft_pack_nowrite_20260615.json";
const reportPath = "private-evaluator-pack/terms_privacy_admin_payment_support_draft_pack_nowrite_probe_report_20260615.md";
const summaryPath = "private-evaluator-pack/terms_privacy_admin_payment_support_draft_pack_nowrite_probe_summary_20260615.json";

const md = await fs.readFile(mdPath, "utf8");
const json = JSON.parse(await fs.readFile(jsonPath, "utf8"));
const lower = md.toLowerCase();

const required = [
  "mode: `nowrite`",
  "commercial status: `not_live`",
  "go-live status: `no_go`",
  "not a final legal document",
  "not fiscal advice",
  "no real payments",
  "no invoices",
  "no payment-method collection",
  "no production api keys",
  "no real customer data processing",
  "no personal data processing",
  "no external outreach",
  "terms of service draft requirements",
  "privacy policy draft requirements",
  "admin and fiscal draft requirements",
  "payment and billing test-mode draft requirements",
  "support, refund and credit draft requirements",
  "test_payment_authorized",
  "blocked_requires_owner",
  "commercial go-live: no-go"
];

const forbidden = [
  "commercial status: `live`",
  "go-live status: `go`",
  "start paid beta now",
  "accept real payment",
  "collect card",
  "issue invoice now",
  "production keys are allowed",
  "send outreach now",
  "publish paid marketplace now"
];

const checks = [];

for (const phrase of required) {
  checks.push({ check: `required: ${phrase}`, pass: lower.includes(phrase.toLowerCase()) });
}

for (const phrase of forbidden) {
  checks.push({ check: `forbidden absent: ${phrase}`, pass: !lower.includes(phrase.toLowerCase()) });
}

const jsonChecks = [
  ["commercial_status_not_live", json.commercial_status === "not_live"],
  ["go_live_no_go", json.go_live === "no_go"],
  ["not_final_legal_document", json.not_final_legal_document === true],
  ["not_fiscal_advice", json.not_fiscal_advice === true],
  ["not_public_policy", json.not_public_policy === true],
  ["authorizes_paid_beta_false", json.authorizes_paid_beta === false],
  ["authorizes_real_payments_false", json.authorizes_real_payments === false],
  ["authorizes_invoices_false", json.authorizes_invoices === false],
  ["authorizes_payment_method_collection_false", json.authorizes_payment_method_collection === false],
  ["authorizes_production_keys_false", json.authorizes_production_keys === false],
  ["authorizes_real_customer_data_false", json.authorizes_real_customer_data === false],
  ["authorizes_personal_data_false", json.authorizes_personal_data === false],
  ["authorizes_external_outreach_false", json.authorizes_external_outreach === false],
  ["sections_5", Array.isArray(json.sections) && json.sections.length === 5],
  ["blocked_actions_12", Array.isArray(json.blocked_actions) && json.blocked_actions.length >= 12]
];

for (const [check, pass] of jsonChecks) checks.push({ check, pass });

const failed = checks.filter((item) => !item.pass);
const summary = {
  artifact: "terms_privacy_admin_payment_support_draft_pack_nowrite_probe",
  date: "2026-06-15",
  mode: "NoWrite",
  total_checks: checks.length,
  failed_checks: failed.length,
  passed: failed.length === 0,
  commercial_status: json.commercial_status,
  go_live: json.go_live,
  next_step: failed.length === 0 ? json.recommended_next_step_after_probe : "fix_draft_pack_before_next_step",
  failed
};

const report = [
  "# MachineSignal - Terms Privacy Admin Payment Support Draft Pack NoWrite Probe - 2026-06-15",
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
  "This probe is NoWrite. It does not call external services, does not publish documents, does not collect payment methods, does not issue invoices, does not process real or personal data and does not authorize paid beta."
].join("\n");

await fs.writeFile(reportPath, `${report}\n`, "utf8");
await fs.writeFile(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

console.log(JSON.stringify(summary, null, 2));
