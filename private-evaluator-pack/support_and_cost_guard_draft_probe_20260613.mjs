import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const draftPath = path.join(root, "private-evaluator-pack", "support_and_cost_guard_draft_20260613.json");
const markdownPath = path.join(root, "private-evaluator-pack", "support_and_cost_guard_draft_20260613.md");
const summaryPath = path.join(root, "private-evaluator-pack", "support_and_cost_guard_draft_probe_summary_20260613.json");
const reportPath = path.join(root, "private-evaluator-pack", "support_and_cost_guard_draft_probe_report_20260613.md");

const draft = JSON.parse(fs.readFileSync(draftPath, "utf8"));
const markdown = fs.readFileSync(markdownPath, "utf8");
const checks = [];

function check(name, ok, detail = "") {
  checks.push({ name, ok: Boolean(ok), detail });
}

const support = draft.support_guard ?? {};
const cost = draft.cost_guard ?? {};
const blocked = new Set(draft.blocked_now ?? []);
const supportCases = new Map((support.automatic_responses ?? []).map((item) => [item.case, item]));
const stopTriggers = new Set(cost.stop_triggers ?? []);
const responsibilities = new Set((draft.agent_responsibilities ?? []).map((item) => item.agent));

check("draft prepared", draft.status === "prepared", draft.status);
check("mode NoWrite planning", draft.mode === "NoWrite planning", draft.mode);
check("support default machine self service", support.default_handling === "machine_self_service", support.default_handling);
check("support has at least five channels", (support.support_channels ?? []).length >= 5, String((support.support_channels ?? []).length));
check("support has no work accumulation policy", Boolean(support.no_work_accumulation_policy));
check("normal queue limit <= 10", support.no_work_accumulation_policy?.normal_queue_limit <= 10, String(support.no_work_accumulation_policy?.normal_queue_limit));
check("hard stop after critical items <= 3", support.no_work_accumulation_policy?.hard_stop_after_critical_items <= 3, String(support.no_work_accumulation_policy?.hard_stop_after_critical_items));

for (const caseName of [
  "invalid_input",
  "insufficient_credits",
  "duplicate_request",
  "output_not_valid",
  "suspected_abuse_or_unbounded_usage",
  "payment_or_invoice_request_before_gate",
  "real_data_detected_in_test"
]) {
  check(`support case exists: ${caseName}`, supportCases.has(caseName));
}

for (const escalationCase of [
  "suspected_abuse_or_unbounded_usage",
  "payment_or_invoice_request_before_gate",
  "real_data_detected_in_test"
]) {
  check(`critical support case escalates: ${escalationCase}`, supportCases.get(escalationCase)?.owner_escalation === true, String(supportCases.get(escalationCase)?.owner_escalation));
}

check("cost guard conservative", cost.default_mode === "cost_conservative", cost.default_mode);
check("cost sources include Cloudflare", (cost.cost_sources ?? []).some((item) => /Cloudflare/i.test(item)));
check("cost sources include DataForSEO", (cost.cost_sources ?? []).some((item) => /DataForSEO/i.test(item)));
check("cost sources include OpenAI/Codex", (cost.cost_sources ?? []).some((item) => /OpenAI|Codex/i.test(item)));
check("KV soft limit <= 500", cost.daily_soft_limits?.cloudflare_kv_writes <= 500, String(cost.daily_soft_limits?.cloudflare_kv_writes));
check("KV hard stop <= 900", cost.daily_soft_limits?.cloudflare_kv_write_hard_stop <= 900, String(cost.daily_soft_limits?.cloudflare_kv_write_hard_stop));
check("write capped POST <= 5", cost.daily_soft_limits?.write_capped_post_calls <= 5, String(cost.daily_soft_limits?.write_capped_post_calls));
check("external paid calls 0", cost.daily_soft_limits?.external_paid_api_calls === 0, String(cost.daily_soft_limits?.external_paid_api_calls));
check("real payment attempts 0", cost.daily_soft_limits?.real_payment_attempts === 0, String(cost.daily_soft_limits?.real_payment_attempts));
check("human outreach attempts 0", cost.daily_soft_limits?.human_outreach_attempts === 0, String(cost.daily_soft_limits?.human_outreach_attempts));

for (const trigger of [
  "HTTP 429 from Cloudflare, Worker, KV or public API",
  "Cloudflare KV write usage above soft limit",
  "external paid API call attempted without budget approval",
  "real payment attempted before gate",
  "invoice attempted before gate",
  "personal or real customer data detected in test mode",
  "unexpected 5xx repeated three times on critical endpoints",
  "API key exposure suspected"
]) {
  check(`stop trigger: ${trigger}`, stopTriggers.has(trigger));
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
  "hosted public MCP launch"
]) {
  check(`blocked now: ${blockedItem}`, blocked.has(blockedItem));
}

for (const agent of [
  "Orchestratore",
  "Customer Success & Post-Sale",
  "Admin & Finance Controller",
  "Legal & Compliance",
  "API Product Manager"
]) {
  check(`agent responsibility: ${agent}`, responsibilities.has(agent));
}

check("next action margin model", draft.recommended_next_action?.name === "support_cost_guard_probe_and_margin_model", draft.recommended_next_action?.name);
check("next action NoWrite", draft.recommended_next_action?.mode === "NoWrite planning", draft.recommended_next_action?.mode);
check("next action no supervision", draft.recommended_next_action?.requires_owner_supervision === false, String(draft.recommended_next_action?.requires_owner_supervision));

for (const phrase of [
  "lavoro umano accumulato",
  "Cost guard",
  "KV writes soft limit",
  "support_cost_guard_probe_and_margin_model",
  "senza attivare pagamenti"
]) {
  check(`markdown contains: ${phrase}`, markdown.includes(phrase), phrase);
}

const failed = checks.filter((item) => !item.ok);
const summary = {
  probe_id: "support_and_cost_guard_draft_probe_20260613",
  status: failed.length === 0 ? "passed" : "failed",
  checks_total: checks.length,
  checks_failed: failed.length,
  failed_checks: failed,
  mode: draft.mode,
  recommended_next_action: draft.recommended_next_action?.name
};

const report = [
  "# Support and cost guard draft probe",
  "",
  `Status: ${summary.status}`,
  `Checks total: ${summary.checks_total}`,
  `Checks failed: ${summary.checks_failed}`,
  `Mode: ${summary.mode}`,
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
