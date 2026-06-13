import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const reviewPath = path.join(root, "private-evaluator-pack", "go_live_test_closure_review_20260613.json");
const markdownPath = path.join(root, "private-evaluator-pack", "go_live_test_closure_review_20260613.md");
const summaryPath = path.join(root, "private-evaluator-pack", "go_live_test_closure_review_probe_summary_20260613.json");
const reportPath = path.join(root, "private-evaluator-pack", "go_live_test_closure_review_probe_report_20260613.md");

const review = JSON.parse(fs.readFileSync(reviewPath, "utf8"));
const markdown = fs.readFileSync(markdownPath, "utf8");
const checks = [];

function check(name, ok, detail = "") {
  checks.push({ name, ok: Boolean(ok), detail });
}

const evidence = review.evidence_reviewed ?? [];
const blocked = new Set(review.blocked_until_owner_approval ?? []);

check("review completed", review.status === "completed", review.status);
check("roadmap phase test closure", review.roadmap?.phase === "test_closure", review.roadmap?.phase);
check("test percentage >= 94", Number(review.roadmap?.estimated_test_completion_percentage) >= 94, String(review.roadmap?.estimated_test_completion_percentage));
check("sandbox closure ready", review.roadmap?.sandbox_test_status === "closure_ready", review.roadmap?.sandbox_test_status);
check("commercial go-live blocked", review.roadmap?.commercial_go_live_status === "blocked", review.roadmap?.commercial_go_live_status);
check("sandbox phase closes as satisfactory", review.decision?.sandbox_test_phase === "close_as_technically_satisfactory", review.decision?.sandbox_test_phase);
check("commercial go-live remains no-go", review.decision?.commercial_go_live === "no_go_until_pre_commercial_gate_passes", review.decision?.commercial_go_live);
check("machine visibility passive only", review.decision?.machine_visibility === "keep_passive_visibility", review.decision?.machine_visibility);
check("next gate is pre-commercial", review.decision?.next_required_gate === "pre_commercial_go_live_gate_pack", review.decision?.next_required_gate);
check("owner supervision not required now", review.decision?.owner_supervision_required_now === false, String(review.decision?.owner_supervision_required_now));

for (const item of evidence) {
  check(`evidence passed: ${item.artifact}`, item.status === "passed", item.status);
  if (typeof item.checks_failed === "number") {
    check(`evidence zero failures: ${item.artifact}`, item.checks_failed === 0, String(item.checks_failed));
  }
}

for (const ready of [
  "OpenAPI public contract",
  "MCP manifest public contract",
  "Postman public collection",
  "sandbox-only control pack",
  "no-write visibility monitoring",
  "contract-docs consistency checks"
]) {
  check(`ready item present: ${ready}`, (review.what_is_ready ?? []).includes(ready));
}

for (const notReady of [
  "paid checkout",
  "real payment processing",
  "invoice issuance",
  "P.IVA-dependent commercial activation",
  "legal terms for paid customers",
  "privacy/data processing setup for real customer data",
  "production API key issuing process"
]) {
  check(`not ready item present: ${notReady}`, (review.what_is_not_yet_ready ?? []).includes(notReady));
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

check("next action pre-commercial gate pack", review.recommended_next_action?.name === "pre_commercial_go_live_gate_pack", review.recommended_next_action?.name);
check("next action NoWrite planning", review.recommended_next_action?.mode === "NoWrite planning", review.recommended_next_action?.mode);
check("next action no owner supervision required", review.recommended_next_action?.requires_owner_supervision === false, String(review.recommended_next_action?.requires_owner_supervision));

const forbiddenClaims = [
  /commercial go-live:\s*go/i,
  /paid launch approved/i,
  /real payments enabled/i,
  /checkout enabled/i,
  /invoice issuance enabled/i,
  /production api keys enabled/i,
  /external outreach approved/i,
  /real customer data approved/i
];
for (const pattern of forbiddenClaims) {
  check(`no forbidden claim: ${pattern}`, !pattern.test(markdown) && !pattern.test(JSON.stringify(review)));
}

check("markdown says go-live commerciale blocked", /Go-live commerciale:\s+\*\*blocked\*\*/i.test(markdown));
check("markdown says commercial no-go", /Commercial go-live:\s+\*\*no-go until pre-commercial gate passes\*\*/i.test(markdown));
check("markdown names pre-commercial gate", /pre-commercial go-live gate pack/i.test(markdown));

const failed = checks.filter((item) => !item.ok);
const summary = {
  probe_id: "go_live_test_closure_review_probe_20260613",
  status: failed.length === 0 ? "passed" : "failed",
  checks_total: checks.length,
  checks_failed: failed.length,
  failed_checks: failed,
  roadmap_percentage: review.roadmap?.estimated_test_completion_percentage,
  sandbox_test_status: review.roadmap?.sandbox_test_status,
  commercial_go_live_status: review.roadmap?.commercial_go_live_status,
  recommended_next_action: review.recommended_next_action?.name
};

const report = [
  "# Go-live test closure review probe",
  "",
  `Status: ${summary.status}`,
  `Checks total: ${summary.checks_total}`,
  `Checks failed: ${summary.checks_failed}`,
  `Roadmap percentage: ${summary.roadmap_percentage}`,
  `Sandbox test status: ${summary.sandbox_test_status}`,
  `Commercial go-live status: ${summary.commercial_go_live_status}`,
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
