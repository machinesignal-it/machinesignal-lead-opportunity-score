import fs from "node:fs/promises";

const mdPath = "private-evaluator-pack/public_docs_alignment_nowrite_20260615.md";
const jsonPath = "private-evaluator-pack/public_docs_alignment_nowrite_20260615.json";
const reportPath = "private-evaluator-pack/public_docs_alignment_nowrite_probe_report_20260615.md";
const summaryPath = "private-evaluator-pack/public_docs_alignment_nowrite_probe_summary_20260615.json";

const md = await fs.readFile(mdPath, "utf8");
const json = JSON.parse(await fs.readFile(jsonPath, "utf8"));
const lower = md.toLowerCase();

const required = [
  "mode: `nowrite`",
  "commercial status: `not_live`",
  "go-live status: `no_go`",
  "alignment_partial_update_recommended_nowrite",
  "pricing version mismatch",
  "target discovery pack: eur 149",
  "score pack 1k: eur 99",
  "target discovery pack 250: eur 249",
  "score pack 1k: eur 119",
  "paid beta: `not_approved`",
  "personal_data_allowed",
  "production_keys_allowed",
  "do not upload to register.it yet",
  "prepare_public_docs_alignment_patch_nowrite"
];

const forbidden = [
  "upload now",
  "publish now",
  "commercial status: `live`",
  "go-live status: `go`",
  "paid beta approved",
  "real payments enabled",
  "collect payment methods",
  "issue invoices"
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
  ["paid_beta_not_approved", json.paid_beta === "not_approved"],
  ["gaps_at_least_5", Array.isArray(json.gaps) && json.gaps.length >= 5],
  ["publication_false", json.authorizes_publication === false],
  ["payments_false", json.authorizes_real_payments === false],
  ["invoices_false", json.authorizes_invoices === false],
  ["payment_method_collection_false", json.authorizes_payment_method_collection === false],
  ["external_outreach_false", json.authorizes_external_outreach === false],
  ["paid_beta_false", json.authorizes_paid_beta === false],
  ["next_step_patch_nowrite", json.recommended_next_step === "prepare_public_docs_alignment_patch_nowrite"]
];

for (const [check, pass] of jsonChecks) checks.push({ check, pass });

const failed = checks.filter((item) => !item.pass);
const summary = {
  artifact: "public_docs_alignment_nowrite_probe",
  date: "2026-06-15",
  mode: "NoWrite",
  total_checks: checks.length,
  failed_checks: failed.length,
  passed: failed.length === 0,
  commercial_status: json.commercial_status,
  go_live: json.go_live,
  next_step: failed.length === 0 ? "prepare_public_docs_alignment_patch_nowrite" : "fix_alignment_report_before_patch",
  failed
};

const report = [
  "# MachineSignal - Public Docs Alignment NoWrite Probe - 2026-06-15",
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
  "This probe is NoWrite. It does not modify public docs, does not upload files, does not publish to the website, does not call payment systems and does not authorize paid beta."
].join("\n");

await fs.writeFile(reportPath, `${report}\n`, "utf8");
await fs.writeFile(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

console.log(JSON.stringify(summary, null, 2));
