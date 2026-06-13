import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const packPath = path.join(root, "private-evaluator-pack", "price_revision_and_live_candidate_pack_20260613.json");
const markdownPath = path.join(root, "private-evaluator-pack", "price_revision_and_live_candidate_pack_20260613.md");
const summaryPath = path.join(root, "private-evaluator-pack", "price_revision_and_live_candidate_pack_probe_summary_20260613.json");
const reportPath = path.join(root, "private-evaluator-pack", "price_revision_and_live_candidate_pack_probe_report_20260613.md");

const pack = JSON.parse(fs.readFileSync(packPath, "utf8"));
const markdown = fs.readFileSync(markdownPath, "utf8");
const checks = [];
function check(name, ok, detail = "") {
  checks.push({ name, ok: Boolean(ok), detail });
}

const products = new Map((pack.revised_products ?? []).map((item) => [item.product_code, item]));
const blocked = new Set(pack.blocked_until_owner_approval ?? []);
const bundle = pack.recommended_pre_live_bundle ?? {};

check("pack prepared", pack.status === "prepared", pack.status);
check("mode NoWrite planning", pack.mode === "NoWrite planning", pack.mode);
check("commercial not live", pack.commercial_status === "not_live", pack.commercial_status);
check("go-live not allowed", pack.commercial_go_live_allowed === false, String(pack.commercial_go_live_allowed));
check("four products revised", (pack.revised_products ?? []).length === 4, String((pack.revised_products ?? []).length));

check("action price unchanged", products.get("action_pack_25")?.recommended_planning_price_eur === 149, String(products.get("action_pack_25")?.recommended_planning_price_eur));
check("score price raised to 119", products.get("score_pack_1k")?.recommended_planning_price_eur === 119, String(products.get("score_pack_1k")?.recommended_planning_price_eur));
check("deep analysis price raised to 349", products.get("deep_analysis_pack_100")?.recommended_planning_price_eur === 349, String(products.get("deep_analysis_pack_100")?.recommended_planning_price_eur));
check("target discovery price raised to 249", products.get("target_discovery_pack_250")?.recommended_planning_price_eur === 249, String(products.get("target_discovery_pack_250")?.recommended_planning_price_eur));

check("action rank 1", products.get("action_pack_25")?.live_candidate_rank === 1, String(products.get("action_pack_25")?.live_candidate_rank));
check("score rank 2", products.get("score_pack_1k")?.live_candidate_rank === 2, String(products.get("score_pack_1k")?.live_candidate_rank));
check("deep analysis not first bundle", (bundle.excluded_from_first_live_bundle ?? []).includes("deep_analysis_pack_100"));
check("target discovery not first bundle", (bundle.excluded_from_first_live_bundle ?? []).includes("target_discovery_pack_250"));
check("bundle planning only", bundle.status === "planning_only", bundle.status);
check("bundle includes score", (bundle.components ?? []).includes("score_pack_1k"));
check("bundle includes action", (bundle.components ?? []).includes("action_pack_25"));

for (const product of pack.revised_products ?? []) {
  check(`must hold rules present: ${product.product_code}`, (product.must_hold_before_live ?? []).length >= 4, String((product.must_hold_before_live ?? []).length));
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
  "MCP registry publication"
]) {
  check(`blocked: ${blockedItem}`, blocked.has(blockedItem));
}

check("next action go/no-go review", pack.recommended_next_action?.name === "pricing_pack_agent_go_no_go_review", pack.recommended_next_action?.name);
check("next action NoWrite", pack.recommended_next_action?.mode === "NoWrite planning", pack.recommended_next_action?.mode);
check("next action no supervision", pack.recommended_next_action?.requires_owner_supervision === false, String(pack.recommended_next_action?.requires_owner_supervision));

for (const phrase of [
  "Commercial status: **not live**",
  "MachineSignal Controlled Entry Bundle",
  "Score Pack 1k",
  "Action Pack 25",
  "pricing_pack_agent_go_no_go_review"
]) {
  check(`markdown contains: ${phrase}`, markdown.includes(phrase), phrase);
}

const forbidden = [
  /commercial_go_live_allowed["':\s]+true/i,
  /pagamenti reali abilitati/i,
  /checkout attivo/i,
  /fatture abilitate/i,
  /API key produzione attive/i
];
for (const pattern of forbidden) {
  check(`no forbidden live claim: ${pattern}`, !pattern.test(markdown) && !pattern.test(JSON.stringify(pack)));
}

const failed = checks.filter((item) => !item.ok);
const summary = {
  probe_id: "price_revision_and_live_candidate_pack_probe_20260613",
  status: failed.length === 0 ? "passed" : "failed",
  checks_total: checks.length,
  checks_failed: failed.length,
  failed_checks: failed,
  commercial_status: pack.commercial_status,
  recommended_bundle: bundle.name,
  recommended_next_action: pack.recommended_next_action?.name
};

const report = [
  "# Price revision and live candidate pack probe",
  "",
  `Status: ${summary.status}`,
  `Checks total: ${summary.checks_total}`,
  `Checks failed: ${summary.checks_failed}`,
  `Commercial status: ${summary.commercial_status}`,
  `Recommended bundle: ${summary.recommended_bundle}`,
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
