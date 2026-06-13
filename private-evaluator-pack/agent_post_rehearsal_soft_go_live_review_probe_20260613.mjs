import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const reviewPath = path.join(root, "private-evaluator-pack", "agent_post_rehearsal_soft_go_live_review_20260613.json");
const markdownPath = path.join(root, "private-evaluator-pack", "agent_post_rehearsal_soft_go_live_review_20260613.md");
const summaryPath = path.join(root, "private-evaluator-pack", "agent_post_rehearsal_soft_go_live_review_probe_summary_20260613.json");
const reportPath = path.join(root, "private-evaluator-pack", "agent_post_rehearsal_soft_go_live_review_probe_report_20260613.md");

const review = JSON.parse(fs.readFileSync(reviewPath, "utf8"));
const markdown = fs.readFileSync(markdownPath, "utf8");

const checks = [];
function check(name, ok, detail = "") {
  checks.push({ name, ok: Boolean(ok), detail });
}

const blocked = new Set(review.decision?.blocked_until_owner_approval ?? []);
const votes = new Map((review.agent_votes ?? []).map((vote) => [vote.agent, vote]));
const evidence = review.evidence_reviewed ?? [];

check("review status completed", review.status === "completed", review.status);
check(
  "verdict keeps sandbox visible without paid launch",
  review.decision?.verdict === "keep_sandbox_visible_continue_no_paid_no_external_publication",
  review.decision?.verdict
);
check("customer is machine-first", review.business_positioning?.customer === "machines_first");
check("human role is supervision only", /supervisiona/i.test(review.business_positioning?.human_role ?? ""));
check("public machine readability evidence passed", evidence.some((item) => item.artifact === "public_machine_readability_probe_report_20260613.md" && item.checks_failed === 0));
check("control pack evidence passed", evidence.some((item) => item.artifact === "soft_go_live_sandbox_only_control_pack_probe_report_20260613.md" && item.checks_failed === 0));
check("rehearsal evidence passed", evidence.some((item) => item.artifact === "soft_go_live_sandbox_only_rehearsal_report_20260613.md" && item.checks_failed === 0));
check("rehearsal used max 5 POST calls", review.rehearsal_result?.ok === true && evidence.some((item) => item.post_calls_executed === 5 && item.max_post_calls_allowed === 5));
check("score decision is present", review.rehearsal_result?.decision === "buy_deep_analysis");
check("action pack gate passed in sandbox", review.rehearsal_result?.action_pack_gate_passed === true);

for (const flag of [
  "real_payment_executed",
  "real_invoice_issued",
  "external_contact_executed",
  "human_outreach_executed",
  "external_publication_executed",
  "production_api_key_published",
  "real_customer_data_used",
  "personal_data_used"
]) {
  check(`${flag} is false`, review.rehearsal_result?.[flag] === false, String(review.rehearsal_result?.[flag]));
}

for (const requiredBlock of [
  "real payment",
  "paid checkout",
  "invoice issuance",
  "payment method collection",
  "public paid marketplace listing",
  "hosted public MCP",
  "MCP registry publication",
  "production API key publication",
  "human outreach",
  "email campaign",
  "external contact",
  "real customer data",
  "personal data",
  "real lead list processing",
  "unbounded write operations"
]) {
  check(`blocked: ${requiredBlock}`, blocked.has(requiredBlock));
}

check("Admin blocks paid launch", votes.get("Agente Admin & Finance Controller")?.vote === "no_go_paid");
check("Legal blocks real data and external contact", votes.get("Agente Legal & Compliance")?.vote === "no_go_real_data_or_external_contact");
check("Growth holds distribution", votes.get("Agente Growth & Distribution")?.vote === "hold_distribution");
check("Sales ops keeps passive machine visibility", /passive/i.test(votes.get("Machine-to-Machine Sales Ops")?.position ?? ""));
check("next action is monitoring pack", review.recommended_next_step?.name === "Sandbox Visibility Monitoring Pack");

const forbiddenPositiveClaims = [
  /go\s+for\s+paid/i,
  /paid\s+launch\s+approved/i,
  /real\s+payment\s+approved/i,
  /invoice\s+approved/i,
  /hosted\s+public\s+MCP\s+approved/i,
  /human\s+outreach\s+approved/i,
  /real\s+data\s+approved/i
];
for (const pattern of forbiddenPositiveClaims) {
  check(`no forbidden positive claim: ${pattern}`, !pattern.test(markdown) && !pattern.test(JSON.stringify(review)));
}

check("markdown states not paid launch", /Non e' un paid launch/i.test(markdown));
check("markdown states no external contact", /Nessun contatto esterno/i.test(markdown));
check("markdown names monitoring pack", /Sandbox Visibility Monitoring Pack/i.test(markdown));

const failed = checks.filter((item) => !item.ok);
const summary = {
  probe_id: "agent_post_rehearsal_soft_go_live_review_probe_20260613",
  status: failed.length === 0 ? "passed" : "failed",
  checks_total: checks.length,
  checks_failed: failed.length,
  failed_checks: failed,
  reviewed_artifact: path.relative(root, reviewPath),
  recommended_next_step: review.recommended_next_step?.name ?? null
};

const report = [
  "# Agent post-rehearsal soft go-live review probe",
  "",
  `Status: ${summary.status}`,
  `Checks total: ${summary.checks_total}`,
  `Checks failed: ${summary.checks_failed}`,
  "",
  "## Result",
  "",
  summary.status === "passed"
    ? "The post-rehearsal agent review is internally consistent and preserves the sandbox-only guardrails."
    : "One or more review checks failed.",
  "",
  "## Failed checks",
  "",
  failed.length === 0 ? "None." : failed.map((item) => `- ${item.name}: ${item.detail}`).join("\n"),
  "",
  "## Recommended next step",
  "",
  summary.recommended_next_step ?? "None."
].join("\n");

fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2) + "\n");
fs.writeFileSync(reportPath, report + "\n");

if (failed.length > 0) {
  console.error(report);
  process.exit(1);
}

console.log(report);
