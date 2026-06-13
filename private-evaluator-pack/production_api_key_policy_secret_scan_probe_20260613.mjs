import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const scanPath = path.join(root, "private-evaluator-pack", "production_api_key_policy_secret_scan_20260613.json");
const markdownPath = path.join(root, "private-evaluator-pack", "production_api_key_policy_secret_scan_20260613.md");
const summaryPath = path.join(root, "private-evaluator-pack", "production_api_key_policy_secret_scan_probe_summary_20260613.json");
const reportPath = path.join(root, "private-evaluator-pack", "production_api_key_policy_secret_scan_probe_report_20260613.md");

const scan = JSON.parse(fs.readFileSync(scanPath, "utf8"));
const markdown = fs.readFileSync(markdownPath, "utf8");
const checks = [];
function check(name, ok, detail = "") {
  checks.push({ name, ok: Boolean(ok), detail });
}

const blocked = new Set(scan.blocked_until_owner_approval ?? []);

check("scan completed", scan.status === "completed", scan.status);
check("mode NoWrite validation", scan.mode === "NoWrite validation", scan.mode);
check("commercial not live", scan.commercial_status === "not_live", scan.commercial_status);
check("raw matches are classified", scan.raw_matches_count === 8, String(scan.raw_matches_count));
check("one classified finding group", (scan.classified_findings ?? []).length === 1, String((scan.classified_findings ?? []).length));
check("finding classified safe", scan.classified_findings?.[0]?.classification === "safe_report_text", scan.classified_findings?.[0]?.classification);
check("unresolved findings zero", scan.risk_result?.unresolved_findings === 0, String(scan.risk_result?.unresolved_findings));
check("no production key", scan.risk_result?.real_production_key_found === false, String(scan.risk_result?.real_production_key_found));
check("no admin key", scan.risk_result?.real_admin_key_found === false, String(scan.risk_result?.real_admin_key_found));
check("no payment secret", scan.risk_result?.real_payment_secret_found === false, String(scan.risk_result?.real_payment_secret_found));
check("no password", scan.risk_result?.real_password_found === false, String(scan.risk_result?.real_password_found));
check("no token", scan.risk_result?.real_token_found === false, String(scan.risk_result?.real_token_found));
check("no key rotation required", scan.risk_result?.requires_key_rotation === false, String(scan.risk_result?.requires_key_rotation));
check("no owner action required", scan.risk_result?.requires_owner_action === false, String(scan.risk_result?.requires_owner_action));
check("production key generation blocked", scan.policy_result?.production_api_key_generation_allowed_now === false, String(scan.policy_result?.production_api_key_generation_allowed_now));
check("production key publication blocked", scan.policy_result?.production_api_key_publication_allowed_now === false, String(scan.policy_result?.production_api_key_publication_allowed_now));
check("admin key sharing blocked", scan.policy_result?.admin_key_sharing_allowed_now === false, String(scan.policy_result?.admin_key_sharing_allowed_now));
check("placeholder rule respected", scan.policy_result?.public_docs_placeholder_rule_respected === true, String(scan.policy_result?.public_docs_placeholder_rule_respected));
check("postman blank secret rule respected", scan.policy_result?.postman_blank_secret_rule_respected === true, String(scan.policy_result?.postman_blank_secret_rule_respected));

for (const blockedItem of [
  "production API key generation",
  "production API key publication",
  "admin key sharing",
  "real payments",
  "invoices",
  "payment method collection",
  "external outreach",
  "real data processing",
  "personal data processing",
  "public paid marketplace publication",
  "hosted public MCP launch",
  "MCP registry publication",
  "commercial go-live"
]) {
  check(`blocked: ${blockedItem}`, blocked.has(blockedItem));
}

check("readiness after scan 65", scan.readiness_impact?.production_api_key_readiness_after_secret_scan === 65, String(scan.readiness_impact?.production_api_key_readiness_after_secret_scan));
check("next action terms privacy outline", scan.recommended_next_action?.name === "terms_privacy_outline_draft", scan.recommended_next_action?.name);
check("next action no supervision", scan.recommended_next_action?.requires_owner_supervision === false, String(scan.recommended_next_action?.requires_owner_supervision));

for (const phrase of [
  "Finding reali non risolti: 0",
  "Chiavi produzione trovate: no",
  "Postman blank secret rule: ok",
  "Dopo secret scan: 65%",
  "terms_privacy_outline_draft"
]) {
  check(`markdown contains: ${phrase}`, markdown.includes(phrase), phrase);
}

const failed = checks.filter((item) => !item.ok);
const summary = {
  probe_id: "production_api_key_policy_secret_scan_probe_20260613",
  status: failed.length === 0 ? "passed" : "failed",
  checks_total: checks.length,
  checks_failed: failed.length,
  failed_checks: failed,
  commercial_status: scan.commercial_status,
  unresolved_findings: scan.risk_result?.unresolved_findings,
  production_api_key_readiness_after_secret_scan: scan.readiness_impact?.production_api_key_readiness_after_secret_scan,
  recommended_next_action: scan.recommended_next_action?.name
};

const report = [
  "# Production API key policy secret scan probe",
  "",
  `Status: ${summary.status}`,
  `Checks total: ${summary.checks_total}`,
  `Checks failed: ${summary.checks_failed}`,
  `Commercial status: ${summary.commercial_status}`,
  `Unresolved findings: ${summary.unresolved_findings}`,
  `Production API key readiness after secret scan: ${summary.production_api_key_readiness_after_secret_scan}%`,
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
