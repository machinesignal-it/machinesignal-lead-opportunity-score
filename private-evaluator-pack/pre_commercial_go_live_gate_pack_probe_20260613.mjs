import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const packPath = path.join(root, "private-evaluator-pack", "pre_commercial_go_live_gate_pack_20260613.json");
const markdownPath = path.join(root, "private-evaluator-pack", "pre_commercial_go_live_gate_pack_20260613.md");
const summaryPath = path.join(root, "private-evaluator-pack", "pre_commercial_go_live_gate_pack_probe_summary_20260613.json");
const reportPath = path.join(root, "private-evaluator-pack", "pre_commercial_go_live_gate_pack_probe_report_20260613.md");

const pack = JSON.parse(fs.readFileSync(packPath, "utf8"));
const markdown = fs.readFileSync(markdownPath, "utf8");
const checks = [];

function check(name, ok, detail = "") {
  checks.push({ name, ok: Boolean(ok), detail });
}

const gates = pack.required_gates ?? [];
const gateMap = new Map(gates.map((gate) => [gate.gate, gate]));
const blockedNow = new Set(pack.blocked_now ?? []);
const allowedNow = new Set(pack.allowed_now ?? []);
const minimumProducts = new Set(pack.minimum_go_live_definition?.minimum_products ?? []);
const minimumControls = new Set(pack.minimum_go_live_definition?.minimum_controls ?? []);

check("pack prepared", pack.status === "prepared", pack.status);
check("mode NoWrite planning", pack.mode === "NoWrite planning", pack.mode);
check("commercial go-live blocked", pack.commercial_go_live_current_status === "blocked", pack.commercial_go_live_current_status);
check("activation requires all gates and owner approval", /all required gates are passed/i.test(pack.activation_rule ?? "") && /owner gives explicit approval/i.test(pack.activation_rule ?? ""), pack.activation_rule);
check("has 8 required gates", gates.length === 8, String(gates.length));

for (const gateName of [
  "admin_fiscal_gate",
  "legal_terms_gate",
  "privacy_data_gate",
  "payment_billing_gate",
  "production_api_key_gate",
  "support_post_sale_gate",
  "cost_limit_gate",
  "public_distribution_gate"
]) {
  const gate = gateMap.get(gateName);
  check(`gate exists: ${gateName}`, Boolean(gate));
  check(`gate blocks live: ${gateName}`, gate?.live_blocker === true, String(gate?.live_blocker));
  check(`gate has requirements: ${gateName}`, (gate?.required_before_live ?? []).length >= 5, String((gate?.required_before_live ?? []).length));
}

for (const allowed of [
  "prepare documents",
  "run no-write checks",
  "improve docs and examples",
  "simulate billing logic with fake/test data",
  "prepare owner approval checklist",
  "prepare support automation draft"
]) {
  check(`allowed now: ${allowed}`, allowedNow.has(allowed));
}

for (const blocked of [
  "enable real payments",
  "issue invoices",
  "collect payment methods",
  "publish paid marketplace listing",
  "publish hosted public MCP",
  "publish to MCP registry",
  "issue production API keys",
  "send outreach",
  "contact external companies",
  "process real customer data",
  "process personal data",
  "process real lead lists"
]) {
  check(`blocked now: ${blocked}`, blockedNow.has(blocked));
}

for (const product of [
  "target_discovery_pack_250",
  "score_pack_1k",
  "deep_analysis_pack_100",
  "action_pack_25"
]) {
  check(`minimum product: ${product}`, minimumProducts.has(product));
}

for (const control of [
  "payment success activates credits once",
  "duplicate events do not double-credit",
  "invalid outputs do not consume credits",
  "usage ledger is auditable",
  "cost guard stops runaway usage",
  "owner can disable live mode"
]) {
  check(`minimum control: ${control}`, minimumControls.has(control));
}

check("next action gap analysis", pack.recommended_next_action?.name === "pre_commercial_gate_gap_analysis", pack.recommended_next_action?.name);
check("next action NoWrite planning", pack.recommended_next_action?.mode === "NoWrite planning", pack.recommended_next_action?.mode);
check("next action no supervision", pack.recommended_next_action?.requires_owner_supervision === false, String(pack.recommended_next_action?.requires_owner_supervision));

const forbidden = [
  /commercial go-live current status["':\s]+ready/i,
  /enable real payments/i,
  /issue invoices/i,
  /production api keys enabled/i,
  /send outreach approved/i,
  /process real customer data approved/i
];
for (const pattern of forbidden) {
  check(`no forbidden activation claim: ${pattern}`, !pattern.test(markdown));
}

check("markdown says commercial blocked", /Go-live commerciale:\s+\*\*blocked\*\*/i.test(markdown));
check("markdown says no activation", /non abilita pagamenti/i.test(markdown));
check("markdown names gap analysis", /pre_commercial_gate_gap_analysis/i.test(markdown));

const failed = checks.filter((item) => !item.ok);
const summary = {
  probe_id: "pre_commercial_go_live_gate_pack_probe_20260613",
  status: failed.length === 0 ? "passed" : "failed",
  checks_total: checks.length,
  checks_failed: failed.length,
  failed_checks: failed,
  commercial_go_live_current_status: pack.commercial_go_live_current_status,
  required_gates_count: gates.length,
  recommended_next_action: pack.recommended_next_action?.name
};

const report = [
  "# Pre-commercial go-live gate pack probe",
  "",
  `Status: ${summary.status}`,
  `Checks total: ${summary.checks_total}`,
  `Checks failed: ${summary.checks_failed}`,
  `Commercial go-live current status: ${summary.commercial_go_live_current_status}`,
  `Required gates count: ${summary.required_gates_count}`,
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
