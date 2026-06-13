import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const policyPath = path.join(root, "private-evaluator-pack", "production_api_key_policy_draft_20260613.json");
const markdownPath = path.join(root, "private-evaluator-pack", "production_api_key_policy_draft_20260613.md");
const summaryPath = path.join(root, "private-evaluator-pack", "production_api_key_policy_draft_probe_summary_20260613.json");
const reportPath = path.join(root, "private-evaluator-pack", "production_api_key_policy_draft_probe_report_20260613.md");

const policy = JSON.parse(fs.readFileSync(policyPath, "utf8"));
const markdown = fs.readFileSync(markdownPath, "utf8");
const checks = [];
function check(name, ok, detail = "") {
  checks.push({ name, ok: Boolean(ok), detail });
}

const keyClasses = new Map((policy.key_classes ?? []).map((item) => [item.class, item]));
const blocked = new Set(policy.blocked_until_owner_approval ?? []);
const publicRules = new Set(policy.public_documentation_rules ?? []);
const revocationTriggers = new Set(policy.rotation_revocation_policy?.immediate_revocation_triggers ?? []);

check("policy prepared", policy.status === "prepared", policy.status);
check("mode NoWrite planning", policy.mode === "NoWrite planning", policy.mode);
check("commercial not live", policy.commercial_status === "not_live", policy.commercial_status);
check("live key generation false", policy.production_key_issuance_policy?.live_key_generation_allowed_now === false, String(policy.production_key_issuance_policy?.live_key_generation_allowed_now));
check("requires owner approval", policy.production_key_issuance_policy?.requires_owner_approval === true, String(policy.production_key_issuance_policy?.requires_owner_approval));

for (const [klass, prefix] of [
  ["sandbox_customer_key", "ms_sbx_"],
  ["production_customer_key", "ms_live_"],
  ["admin_key", "ms_admin_"],
  ["test_webhook_signature", "ms_wh_test_"]
]) {
  check(`key class exists: ${klass}`, keyClasses.has(klass));
  check(`key prefix: ${klass}`, keyClasses.get(klass)?.prefix === prefix, keyClasses.get(klass)?.prefix);
}

check("production key blocked", keyClasses.get("production_customer_key")?.status === "blocked_until_owner_approval", keyClasses.get("production_customer_key")?.status);
check("admin key internal only", keyClasses.get("admin_key")?.status === "restricted_internal_only", keyClasses.get("admin_key")?.status);
check("test webhook test only", keyClasses.get("test_webhook_signature")?.status === "test_only", keyClasses.get("test_webhook_signature")?.status);

for (const gate of [
  "admin_fiscal_readiness",
  "legal_terms_readiness",
  "privacy_data_readiness",
  "payment_billing_readiness",
  "support_post_sale_readiness",
  "cost_guard_readiness"
]) {
  check(`required gate: ${gate}`, (policy.production_key_issuance_policy?.requires_passed_gates ?? []).includes(gate));
}

for (const forbiddenStore of [
  "full plaintext production key",
  "full admin key",
  "payment provider secret",
  "customer personal data in key metadata"
]) {
  check(`never store/publish: ${forbiddenStore}`, (policy.production_key_issuance_policy?.never_store_or_publish ?? []).includes(forbiddenStore));
}

for (const rule of [
  "Public docs may show prefixes but never full keys.",
  "Examples must use placeholders such as {{machinesignal_api_key}}.",
  "Postman environments must keep secret values blank.",
  "OpenAPI may document security scheme but not real credentials.",
  "GitHub must never contain production or admin keys."
]) {
  check(`public doc rule: ${rule}`, publicRules.has(rule));
}

check("rotation every 90 days", policy.rotation_revocation_policy?.rotation_required_every_days === 90, String(policy.rotation_revocation_policy?.rotation_required_every_days));
for (const trigger of [
  "key appears in public repository",
  "key appears in browser screenshot or public document",
  "unexpected usage spike",
  "429 or cost guard red event",
  "customer asks to revoke",
  "suspected abuse",
  "real data detected during test mode"
]) {
  check(`revocation trigger: ${trigger}`, revocationTriggers.has(trigger));
}

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

check("readiness before 45", policy.readiness_impact?.production_api_key_readiness_before === 45, String(policy.readiness_impact?.production_api_key_readiness_before));
check("readiness after 60", policy.readiness_impact?.production_api_key_readiness_after_policy === 60, String(policy.readiness_impact?.production_api_key_readiness_after_policy));
check("next action probe and scan", policy.recommended_next_action?.name === "production_api_key_policy_probe_and_secret_scan", policy.recommended_next_action?.name);
check("next action no supervision", policy.recommended_next_action?.requires_owner_supervision === false, String(policy.recommended_next_action?.requires_owner_supervision));

for (const phrase of [
  "Commercial status: **not live**",
  "Le chiavi produzione non possono essere generate ora",
  "ms_live_",
  "GitHub non deve contenere production key o admin key",
  "production_api_key_policy_probe_and_secret_scan"
]) {
  check(`markdown contains: ${phrase}`, markdown.includes(phrase), phrase);
}

const forbidden = [
  /live_key_generation_allowed_now["':\s]+true/i,
  /production key(?:s)?.{0,40}(?:are|is)\s+enabled/i,
  /production api key(?:s)?.{0,40}(?:enabled|active|live)/i,
  /chiavi produzione.*generate ora.*si/i,
  /admin key(?:s)?.{0,40}(?:public|published|shared publicly)/i
];
for (const pattern of forbidden) {
  check(`no forbidden key claim: ${pattern}`, !pattern.test(markdown) && !pattern.test(JSON.stringify(policy)));
}

const failed = checks.filter((item) => !item.ok);
const summary = {
  probe_id: "production_api_key_policy_draft_probe_20260613",
  status: failed.length === 0 ? "passed" : "failed",
  checks_total: checks.length,
  checks_failed: failed.length,
  failed_checks: failed,
  commercial_status: policy.commercial_status,
  production_api_key_readiness_after_policy: policy.readiness_impact?.production_api_key_readiness_after_policy,
  recommended_next_action: policy.recommended_next_action?.name
};

const report = [
  "# Production API key policy draft probe",
  "",
  `Status: ${summary.status}`,
  `Checks total: ${summary.checks_total}`,
  `Checks failed: ${summary.checks_failed}`,
  `Commercial status: ${summary.commercial_status}`,
  `Production API key readiness after policy: ${summary.production_api_key_readiness_after_policy}%`,
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
