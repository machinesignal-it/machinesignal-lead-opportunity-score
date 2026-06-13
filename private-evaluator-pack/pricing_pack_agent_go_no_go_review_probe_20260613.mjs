import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const reviewPath = path.join(root, "private-evaluator-pack", "pricing_pack_agent_go_no_go_review_20260613.json");
const markdownPath = path.join(root, "private-evaluator-pack", "pricing_pack_agent_go_no_go_review_20260613.md");
const summaryPath = path.join(root, "private-evaluator-pack", "pricing_pack_agent_go_no_go_review_probe_summary_20260613.json");
const reportPath = path.join(root, "private-evaluator-pack", "pricing_pack_agent_go_no_go_review_probe_report_20260613.md");

const review = JSON.parse(fs.readFileSync(reviewPath, "utf8"));
const markdown = fs.readFileSync(markdownPath, "utf8");
const checks = [];
function check(name, ok, detail = "") {
  checks.push({ name, ok: Boolean(ok), detail });
}

const votes = review.agent_votes ?? [];
const blocked = new Set(review.blocked_until_owner_approval ?? []);
const conditions = new Set(review.conditions_before_live ?? []);

check("review completed", review.status === "completed", review.status);
check("mode NoWrite planning", review.mode === "NoWrite planning", review.mode);
check("commercial not live", review.commercial_status === "not_live", review.commercial_status);
check("bundle approved only for pre-live modeling", review.reviewed_bundle?.status === "approved_for_pre_live_modeling_only", review.reviewed_bundle?.status);
check("bundle live not allowed", review.reviewed_bundle?.commercial_go_live_allowed === false, String(review.reviewed_bundle?.commercial_go_live_allowed));
check("six agent votes", votes.length === 6, String(votes.length));
check("all votes no-go live", votes.every((vote) => /NO_GO_live/i.test(vote.vote)), votes.map((vote) => vote.vote).join("; "));
check("pre-live pricing go", review.decision?.pre_live_pricing_model === "go", review.decision?.pre_live_pricing_model);
check("commercial sale no-go", review.decision?.commercial_live_sale === "no_go", review.decision?.commercial_live_sale);
check("paid distribution no-go", review.decision?.public_paid_distribution === "no_go", review.decision?.public_paid_distribution);
check("bundle includes score", (review.decision?.recommended_first_bundle_components ?? []).includes("score_pack_1k"));
check("bundle includes action", (review.decision?.recommended_first_bundle_components ?? []).includes("action_pack_25"));
check("target discovery deferred", (review.decision?.products_deferred_from_first_bundle ?? []).includes("target_discovery_pack_250"));
check("deep analysis deferred", (review.decision?.products_deferred_from_first_bundle ?? []).includes("deep_analysis_pack_100"));

for (const condition of [
  "P.IVA/fiscal decision completed",
  "terms of service approved",
  "privacy and data processing rules approved",
  "payment provider live flow approved",
  "invoice or receipt process approved",
  "production API key process ready",
  "support automation readiness tested",
  "cost guard hard stops tested",
  "owner explicit approval recorded"
]) {
  check(`condition before live: ${condition}`, conditions.has(condition));
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

check("next action readiness matrix", review.recommended_next_action?.name === "pre_live_readiness_matrix", review.recommended_next_action?.name);
check("next action NoWrite", review.recommended_next_action?.mode === "NoWrite planning", review.recommended_next_action?.mode);
check("next action no supervision", review.recommended_next_action?.requires_owner_supervision === false, String(review.recommended_next_action?.requires_owner_supervision));

for (const phrase of [
  "Commercial status: **not live**",
  "approved for pre-live modeling only",
  "Commercial go-live allowed: **false**",
  "Vendita commerciale reale: **NO-GO**",
  "pre_live_readiness_matrix"
]) {
  check(`markdown contains: ${phrase}`, markdown.includes(phrase), phrase);
}

const forbidden = [
  /Commercial go-live allowed:\s+\*\*true\*\*/i,
  /Vendita commerciale reale:\s+\*\*GO\*\*/i,
  /pagamenti reali abilitati/i,
  /fatture abilitate/i,
  /outreach approvato/i
];
for (const pattern of forbidden) {
  check(`no forbidden claim: ${pattern}`, !pattern.test(markdown) && !pattern.test(JSON.stringify(review)));
}

const failed = checks.filter((item) => !item.ok);
const summary = {
  probe_id: "pricing_pack_agent_go_no_go_review_probe_20260613",
  status: failed.length === 0 ? "passed" : "failed",
  checks_total: checks.length,
  checks_failed: failed.length,
  failed_checks: failed,
  commercial_status: review.commercial_status,
  commercial_live_sale: review.decision?.commercial_live_sale,
  recommended_next_action: review.recommended_next_action?.name
};

const report = [
  "# Pricing pack agent go/no-go review probe",
  "",
  `Status: ${summary.status}`,
  `Checks total: ${summary.checks_total}`,
  `Checks failed: ${summary.checks_failed}`,
  `Commercial status: ${summary.commercial_status}`,
  `Commercial live sale: ${summary.commercial_live_sale}`,
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
