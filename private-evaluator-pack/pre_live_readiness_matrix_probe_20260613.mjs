import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const matrixPath = path.join(root, "private-evaluator-pack", "pre_live_readiness_matrix_20260613.json");
const markdownPath = path.join(root, "private-evaluator-pack", "pre_live_readiness_matrix_20260613.md");
const summaryPath = path.join(root, "private-evaluator-pack", "pre_live_readiness_matrix_probe_summary_20260613.json");
const reportPath = path.join(root, "private-evaluator-pack", "pre_live_readiness_matrix_probe_report_20260613.md");

const matrix = JSON.parse(fs.readFileSync(matrixPath, "utf8"));
const markdown = fs.readFileSync(markdownPath, "utf8");
const checks = [];
function check(name, ok, detail = "") {
  checks.push({ name, ok: Boolean(ok), detail });
}

const rows = matrix.readiness_matrix ?? [];
const rowMap = new Map(rows.map((row) => [row.gate, row]));
const ownerDecisions = new Set(matrix.owner_decisions_needed_before_live ?? []);
const allowedNext = new Set(matrix.allowed_next_steps_without_owner_decision ?? []);
const blocked = new Set(matrix.blocked_until_owner_approval ?? []);

check("matrix completed", matrix.status === "completed", matrix.status);
check("mode NoWrite planning", matrix.mode === "NoWrite planning", matrix.mode);
check("commercial not live", matrix.commercial_status === "not_live", matrix.commercial_status);
check("sandbox readiness 94", matrix.overall_readiness?.sandbox_test_readiness_percentage === 94, String(matrix.overall_readiness?.sandbox_test_readiness_percentage));
check("commercial readiness 45", matrix.overall_readiness?.pre_live_commercial_readiness_percentage === 45, String(matrix.overall_readiness?.pre_live_commercial_readiness_percentage));
check("commercial live sale no-go", matrix.overall_readiness?.commercial_live_sale === "no_go", matrix.overall_readiness?.commercial_live_sale);
check("bundle live not allowed", matrix.recommended_first_bundle?.live_sale_allowed === false, String(matrix.recommended_first_bundle?.live_sale_allowed));
check("bundle includes score", (matrix.recommended_first_bundle?.components ?? []).includes("score_pack_1k"));
check("bundle includes action", (matrix.recommended_first_bundle?.components ?? []).includes("action_pack_25"));
check("has 10 readiness rows", rows.length === 10, String(rows.length));

for (const gate of [
  "sandbox_machine_readiness",
  "pricing_bundle_readiness",
  "admin_fiscal_readiness",
  "legal_terms_readiness",
  "privacy_data_readiness",
  "payment_billing_readiness",
  "production_api_key_readiness",
  "support_post_sale_readiness",
  "cost_guard_readiness",
  "public_distribution_readiness"
]) {
  const row = rowMap.get(gate);
  check(`gate exists: ${gate}`, Boolean(row));
  check(`gate has evidence: ${gate}`, (row?.evidence_available ?? []).length >= 1, String((row?.evidence_available ?? []).length));
  check(`gate has missing list: ${gate}`, (row?.missing_before_live ?? []).length >= 1, String((row?.missing_before_live ?? []).length));
}

check("sandbox does not block commercial live", rowMap.get("sandbox_machine_readiness")?.blocks_commercial_live === false, String(rowMap.get("sandbox_machine_readiness")?.blocks_commercial_live));
for (const gate of [
  "pricing_bundle_readiness",
  "admin_fiscal_readiness",
  "legal_terms_readiness",
  "privacy_data_readiness",
  "payment_billing_readiness",
  "production_api_key_readiness",
  "support_post_sale_readiness",
  "cost_guard_readiness",
  "public_distribution_readiness"
]) {
  check(`gate blocks live: ${gate}`, rowMap.get(gate)?.blocks_commercial_live === true, String(rowMap.get(gate)?.blocks_commercial_live));
}

for (const decision of [
  "P.IVA/fiscal route",
  "final live listino",
  "legal terms approval",
  "privacy/data processing approval",
  "payment provider and live checkout approval",
  "daily/monthly budget limits",
  "public distribution channel approval",
  "explicit commercial go-live approval"
]) {
  check(`owner decision: ${decision}`, ownerDecisions.has(decision));
}

for (const step of [
  "live_support_readiness_test_nowrite",
  "cost_guard_hard_stop_simulation_nowrite",
  "production_api_key_policy_draft",
  "terms_privacy_outline_draft"
]) {
  check(`allowed next without owner: ${step}`, allowedNext.has(step));
}

for (const blockedItem of [
  "real payments",
  "invoices",
  "payment method collection",
  "external outreach",
  "real data processing",
  "personal data processing",
  "production API key issuing",
  "public paid marketplace publication",
  "hosted public MCP launch",
  "MCP registry publication",
  "commercial go-live"
]) {
  check(`blocked: ${blockedItem}`, blocked.has(blockedItem));
}

check("next action live support no-write", matrix.recommended_next_action?.name === "live_support_readiness_test_nowrite", matrix.recommended_next_action?.name);
check("next action no supervision", matrix.recommended_next_action?.requires_owner_supervision === false, String(matrix.recommended_next_action?.requires_owner_supervision));

for (const phrase of [
  "vendita reale: **NO-GO**",
  "pre-live commerciale: **45%**",
  "live_support_readiness_test_nowrite",
  "go-live commerciale"
]) {
  check(`markdown contains: ${phrase}`, markdown.includes(phrase), phrase);
}

const forbidden = [
  /vendita reale:\s+\*\*GO\*\*/i,
  /live_sale_allowed["':\s]+true/i,
  /pagamenti reali abilitati/i,
  /API key produzione attive/i
];
for (const pattern of forbidden) {
  check(`no forbidden live claim: ${pattern}`, !pattern.test(markdown) && !pattern.test(JSON.stringify(matrix)));
}

const failed = checks.filter((item) => !item.ok);
const summary = {
  probe_id: "pre_live_readiness_matrix_probe_20260613",
  status: failed.length === 0 ? "passed" : "failed",
  checks_total: checks.length,
  checks_failed: failed.length,
  failed_checks: failed,
  commercial_live_sale: matrix.overall_readiness?.commercial_live_sale,
  pre_live_commercial_readiness_percentage: matrix.overall_readiness?.pre_live_commercial_readiness_percentage,
  recommended_next_action: matrix.recommended_next_action?.name
};

const report = [
  "# Pre-live readiness matrix probe",
  "",
  `Status: ${summary.status}`,
  `Checks total: ${summary.checks_total}`,
  `Checks failed: ${summary.checks_failed}`,
  `Commercial live sale: ${summary.commercial_live_sale}`,
  `Pre-live commercial readiness: ${summary.pre_live_commercial_readiness_percentage}%`,
  "",
  "## Failed checks",
  "",
  failed.length === 0 ? "None." : failed.map((item) => `- ${item.name}: ${item.detail}`).join("\n"),
  "",
  "## Recommended next action",
  "",
  summary.recommended_next_action
].join("\n");

fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2) + "\n");
fs.writeFileSync(reportPath, report + "\n");

if (failed.length > 0) {
  console.error(report);
  process.exit(1);
}
console.log(report);
