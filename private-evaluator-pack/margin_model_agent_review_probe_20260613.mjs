import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const reviewPath = path.join(root, "private-evaluator-pack", "margin_model_agent_review_20260613.json");
const markdownPath = path.join(root, "private-evaluator-pack", "margin_model_agent_review_20260613.md");
const summaryPath = path.join(root, "private-evaluator-pack", "margin_model_agent_review_probe_summary_20260613.json");
const reportPath = path.join(root, "private-evaluator-pack", "margin_model_agent_review_probe_report_20260613.md");

const review = JSON.parse(fs.readFileSync(reviewPath, "utf8"));
const markdown = fs.readFileSync(markdownPath, "utf8");
const checks = [];

function check(name, ok, detail = "") {
  checks.push({ name, ok: Boolean(ok), detail });
}

const decisions = new Map((review.product_decisions ?? []).map((item) => [item.product_code, item]));
const blocked = new Set(review.blocked_until_owner_approval ?? []);
const votes = review.agent_votes ?? [];

check("review completed", review.status === "completed", review.status);
check("mode NoWrite planning", review.mode === "NoWrite planning", review.mode);
check("commercial not live", review.commercial_status === "not_live", review.commercial_status);
check("has five agent votes", votes.length === 5, String(votes.length));
check("portfolio live not allowed", review.portfolio_decision?.commercial_go_live_allowed === false, String(review.portfolio_decision?.commercial_go_live_allowed));
check("first live candidate action pack", review.portfolio_decision?.recommended_first_live_candidate === "action_pack_25", review.portfolio_decision?.recommended_first_live_candidate);
check("scalable candidate score", review.portfolio_decision?.recommended_scalable_candidate === "score_pack_1k", review.portfolio_decision?.recommended_scalable_candidate);

for (const product of [
  "action_pack_25",
  "score_pack_1k",
  "deep_analysis_pack_100",
  "target_discovery_pack_250"
]) {
  const decision = decisions.get(product);
  check(`decision exists: ${product}`, Boolean(decision));
  check(`requirements present: ${product}`, (decision?.required_before_live ?? []).length >= 4, String((decision?.required_before_live ?? []).length));
}

check("action pack keep", decisions.get("action_pack_25")?.decision === "keep_as_best_margin_candidate", decisions.get("action_pack_25")?.decision);
check("score keep", decisions.get("score_pack_1k")?.decision === "keep_as_scalable_entry_candidate", decisions.get("score_pack_1k")?.decision);
check("deep analysis revise", decisions.get("deep_analysis_pack_100")?.decision === "revise_price_or_reduce_cost", decisions.get("deep_analysis_pack_100")?.decision);
check("target discovery revise", decisions.get("target_discovery_pack_250")?.decision === "revise_price_or_reduce_cost", decisions.get("target_discovery_pack_250")?.decision);

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

check("next action price revision", review.recommended_next_action?.name === "price_revision_and_live_candidate_pack", review.recommended_next_action?.name);
check("next action NoWrite", review.recommended_next_action?.mode === "NoWrite planning", review.recommended_next_action?.mode);
check("next action no supervision", review.recommended_next_action?.requires_owner_supervision === false, String(review.recommended_next_action?.requires_owner_supervision));

for (const phrase of [
  "Commercial status: **not live**",
  "Action Pack 25",
  "Score Pack 1k",
  "Revise price or reduce cost",
  "price_revision_and_live_candidate_pack"
]) {
  check(`markdown contains: ${phrase}`, markdown.includes(phrase), phrase);
}

const forbidden = [
  /commercial_go_live_allowed["':\s]+true/i,
  /pagamenti reali abilitati/i,
  /live commerciale autorizzato/i,
  /production API key enabled/i,
  /outreach approved/i
];
for (const pattern of forbidden) {
  check(`no forbidden claim: ${pattern}`, !pattern.test(markdown) && !pattern.test(JSON.stringify(review)));
}

const failed = checks.filter((item) => !item.ok);
const summary = {
  probe_id: "margin_model_agent_review_probe_20260613",
  status: failed.length === 0 ? "passed" : "failed",
  checks_total: checks.length,
  checks_failed: failed.length,
  failed_checks: failed,
  commercial_status: review.commercial_status,
  recommended_first_live_candidate: review.portfolio_decision?.recommended_first_live_candidate,
  recommended_next_action: review.recommended_next_action?.name
};

const report = [
  "# Margin model agent review probe",
  "",
  `Status: ${summary.status}`,
  `Checks total: ${summary.checks_total}`,
  `Checks failed: ${summary.checks_failed}`,
  `Commercial status: ${summary.commercial_status}`,
  `Recommended first live candidate: ${summary.recommended_first_live_candidate}`,
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
