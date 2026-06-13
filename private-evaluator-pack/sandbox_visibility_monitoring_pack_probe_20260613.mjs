import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const packPath = path.join(root, "private-evaluator-pack", "sandbox_visibility_monitoring_pack_20260613.json");
const monitorSummaryPath = path.join(root, "private-evaluator-pack", "sandbox_visibility_monitor_summary_20260613.json");
const probeSummaryPath = path.join(root, "private-evaluator-pack", "sandbox_visibility_monitoring_pack_probe_summary_20260613.json");
const probeReportPath = path.join(root, "private-evaluator-pack", "sandbox_visibility_monitoring_pack_probe_report_20260613.md");

const pack = JSON.parse(fs.readFileSync(packPath, "utf8"));
const monitorSummary = fs.existsSync(monitorSummaryPath)
  ? JSON.parse(fs.readFileSync(monitorSummaryPath, "utf8"))
  : null;

const checks = [];
function check(name, ok, detail = "") {
  checks.push({ name, ok: Boolean(ok), detail });
}

const blocked = new Set(pack.operating_mode?.blocked_network_actions ?? []);
const stopTriggers = new Set(pack.stop_triggers ?? []);
const resourceMethods = new Set((pack.monitored_resources ?? []).map((item) => item.method));

check("pack prepared", pack.status === "prepared", pack.status);
check("source decision preserved", pack.source_decision === "keep_sandbox_visible_continue_no_paid_no_external_publication", pack.source_decision);
check("default mode NoWrite", pack.operating_mode?.default_mode === "NoWrite", pack.operating_mode?.default_mode);
check("all monitored resources are GET", resourceMethods.size === 1 && resourceMethods.has("GET"), Array.from(resourceMethods).join(","));
check("has at least 8 monitored resources", (pack.monitored_resources ?? []).length >= 8, String((pack.monitored_resources ?? []).length));
check("includes openapi", (pack.monitored_resources ?? []).some((item) => item.id === "openapi"));
check("includes mcp manifest", (pack.monitored_resources ?? []).some((item) => item.id === "mcp_manifest"));
check("includes well-known mcp manifest", (pack.monitored_resources ?? []).some((item) => item.id === "well_known_mcp_manifest"));
check("includes postman public collection", (pack.monitored_resources ?? []).some((item) => item.id === "postman_public_collection"));
check("includes github docs", (pack.monitored_resources ?? []).some((item) => item.id === "github_readme"));

for (const action of [
  "POST to production endpoints",
  "PUT to production endpoints",
  "DELETE to production endpoints",
  "PATCH to production endpoints",
  "contact external companies",
  "send email campaigns",
  "publish to paid marketplace",
  "publish to public MCP registry",
  "collect payment methods",
  "process real lead lists",
  "process personal data"
]) {
  check(`blocked action: ${action}`, blocked.has(action));
}

for (const trigger of [
  "HTTP 429 from Cloudflare, Worker, KV or public API",
  "Cloudflare KV daily write limit warning",
  "any payment or checkout activation",
  "any invoice creation",
  "any request for payment method",
  "any external email or outreach attempt",
  "any real company list upload",
  "any personal data processing",
  "any production API key publication",
  "any public marketplace or MCP registry submission",
  "three repeated 5xx responses on critical public contracts"
]) {
  check(`stop trigger: ${trigger}`, stopTriggers.has(trigger));
}

check("daily report caps supervision", /15-30/.test(pack.daily_user_report?.target_supervision_time ?? ""), pack.daily_user_report?.target_supervision_time);
check("next step is observation log", /observation log/i.test(pack.next_step_after_pack ?? ""), pack.next_step_after_pack);

if (monitorSummary) {
  check("monitor ran in NoWrite", monitorSummary.mode === "NoWrite", monitorSummary.mode);
  check("monitor executed zero POST calls", monitorSummary.post_calls_executed === 0, String(monitorSummary.post_calls_executed));
  check("monitor produced non-red status", monitorSummary.status_level !== "red", monitorSummary.status_level);
  check("monitor checked all pack resources", monitorSummary.resources_total === (pack.monitored_resources ?? []).length, `${monitorSummary.resources_total}`);
}

const failed = checks.filter((item) => !item.ok);
const summary = {
  probe_id: "sandbox_visibility_monitoring_pack_probe_20260613",
  status: failed.length === 0 ? "passed" : "failed",
  checks_total: checks.length,
  checks_failed: failed.length,
  failed_checks: failed,
  monitor_status_level: monitorSummary?.status_level ?? null,
  recommended_next_step: pack.next_step_after_pack
};

const report = [
  "# Sandbox visibility monitoring pack probe",
  "",
  `Status: ${summary.status}`,
  `Checks total: ${summary.checks_total}`,
  `Checks failed: ${summary.checks_failed}`,
  `Monitor status level: ${summary.monitor_status_level ?? "not run"}`,
  "",
  "## Failed checks",
  "",
  failed.length === 0 ? "None." : failed.map((item) => `- ${item.name}: ${item.detail}`).join("\n"),
  "",
  "## Recommended next step",
  "",
  summary.recommended_next_step
].join("\n");

fs.writeFileSync(probeSummaryPath, JSON.stringify(summary, null, 2) + "\n");
fs.writeFileSync(probeReportPath, report + "\n");

if (failed.length > 0) {
  console.error(report);
  process.exit(1);
}

console.log(report);
