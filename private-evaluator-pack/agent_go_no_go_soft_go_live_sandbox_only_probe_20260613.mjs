import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const packDir = path.join(root, "private-evaluator-pack");
const reviewJsonPath = path.join(packDir, "agent_go_no_go_soft_go_live_sandbox_only_20260613.json");
const reviewMdPath = path.join(packDir, "agent_go_no_go_soft_go_live_sandbox_only_20260613.md");
const summaryPath = path.join(
  packDir,
  "agent_go_no_go_soft_go_live_sandbox_only_probe_summary_20260613.json"
);
const reportPath = path.join(
  packDir,
  "agent_go_no_go_soft_go_live_sandbox_only_probe_report_20260613.md"
);

const review = JSON.parse(await readFile(reviewJsonPath, "utf8"));
const markdown = await readFile(reviewMdPath, "utf8");
const checks = [];

function addCheck(name, ok, details = "") {
  checks.push({ name, ok: Boolean(ok), details });
}

function includesAll(text, fragments) {
  const lower = text.toLowerCase();
  return fragments.every((fragment) => lower.includes(fragment.toLowerCase()));
}

const votes = review.agent_votes || [];
const blocked = review.blocked_until_owner_approval || [];
const allowed = review.soft_go_live_sandbox_only_definition?.allowed || [];
const notAllowed = review.soft_go_live_sandbox_only_definition?.not_allowed || [];
const evidence = review.evidence_reviewed || [];

addCheck("review_status_completed", review.status === "completed", review.status);
addCheck(
  "verdict_go_conditionally_sandbox_only",
  review.verdict === "go_conditionally_for_soft_go_live_sandbox_only",
  review.verdict
);
addCheck("primary_customer_machine", review.primary_customer_interface === "machine");
addCheck("agent_votes_count_at_least_12", votes.length >= 12, `${votes.length} votes`);
addCheck(
  "admin_finance_blocks_paid",
  votes.some((vote) => vote.agent === "Admin & Finance Controller" && /no_go_paid/i.test(vote.vote)),
  "Admin & Finance Controller vote"
);
addCheck(
  "legal_blocks_paid_or_real_data",
  votes.some((vote) => vote.agent === "Legal & Compliance" && /no_go_paid_or_real_data/i.test(vote.vote)),
  "Legal & Compliance vote"
);
addCheck(
  "evidence_has_public_readability_pass",
  evidence.some(
    (item) =>
      item.name === "public_machine_readability_probe" &&
      item.status === "passed" &&
      item.checks_failed === 0
  ),
  "public readability evidence"
);
addCheck(
  "evidence_has_e2e_machine_buyer_pass",
  evidence.some(
    (item) =>
      item.name === "machine_buyer_end_to_end_rehearsal" &&
      item.status === "passed" &&
      item.checks_failed === 0
  ),
  "machine buyer e2e evidence"
);

for (const requiredBlock of [
  "live_payment",
  "real_invoice",
  "paid_checkout",
  "hosted_public_mcp_launch",
  "mcp_registry_submission",
  "production_api_key_distribution",
  "human_outreach",
  "automatic_external_contact",
  "real_customer_data",
  "personal_data",
]) {
  addCheck(`blocked_${requiredBlock}`, blocked.includes(requiredBlock), requiredBlock);
}

for (const allowedItem of [
  "public machine-readable documentation",
  "public OpenAPI and MCP manifests",
  "sandbox-only machine discovery",
  "bounded sandbox customer creation",
  "synthetic examples",
]) {
  addCheck(`allowed_${allowedItem.replaceAll(" ", "_")}`, allowed.includes(allowedItem), allowedItem);
}

for (const forbiddenAllowedItem of [
  "charging money",
  "collecting payment methods",
  "issuing invoices",
  "publishing paid marketplace plans",
  "submitting to public MCP registry",
  "launching hosted MCP publicly",
  "contacting humans",
  "processing real customer data",
  "processing personal data",
]) {
  addCheck(
    `not_allowed_${forbiddenAllowedItem.replaceAll(" ", "_")}`,
    notAllowed.includes(forbiddenAllowedItem),
    forbiddenAllowedItem
  );
}

addCheck(
  "markdown_repeats_not_paid_launch",
  includesAll(markdown, ["sandbox-only", "not a paid launch"]),
  "markdown wording"
);
addCheck(
  "markdown_lists_still_blocked",
  includesAll(markdown, ["Charging money", "Issuing invoices", "Launching hosted MCP publicly"]),
  "blocked list"
);
addCheck(
  "recommended_next_action_control_pack",
  review.recommended_next_action?.step === "prepare_soft_go_live_sandbox_only_control_pack",
  review.recommended_next_action?.step || ""
);

const forbiddenPositivePatterns = [
  /(^|[^-A-Z])GO\s+for\s+paid\s+go-live/i,
  /(^|[^-A-Z])GO\s+for\s+live\s+checkout/i,
  /(^|[^-A-Z])GO\s+for\s+hosted\s+public\s+MCP/i,
  /(^|[^-A-Z])GO\s+for\s+human\s+outreach/i,
  /(^|[^-A-Z])GO\s+for\s+real\s+customer\s+data/i,
  /(^|[^-A-Z])GO\s+for\s+personal\s+data/i,
];
addCheck(
  "review_has_no_forbidden_positive_go",
  forbiddenPositivePatterns.every((pattern) => !pattern.test(markdown)),
  "no forbidden positive go phrase"
);

const failedChecks = checks.filter((check) => !check.ok);
const summary = {
  date: "2026-06-13",
  status: failedChecks.length === 0 ? "passed" : "failed",
  purpose:
    "Validate the agent go/no-go review for a sandbox-only soft go-live without enabling paid, outreach, hosted MCP or real-data activity.",
  review: "private-evaluator-pack/agent_go_no_go_soft_go_live_sandbox_only_20260613.json",
  checks_total: checks.length,
  checks_failed: failedChecks.length,
  checks,
  safety: {
    live_payment_allowed: false,
    real_invoice_allowed: false,
    paid_checkout_allowed: false,
    hosted_public_mcp_allowed: false,
    mcp_registry_submission_allowed: false,
    human_outreach_allowed: false,
    external_contact_allowed: false,
    real_customer_data_allowed: false,
    personal_data_allowed: false,
  },
  next_action_if_passed: "prepare_soft_go_live_sandbox_only_control_pack",
  next_action_if_failed: "repair_agent_go_no_go_review_before_control_pack",
};

await writeFile(summaryPath, `${JSON.stringify(summary, null, 2)}\n`);

const report = [
  "# Agent Go/No-Go Soft Go-Live Sandbox-Only Probe",
  "",
  "Date: 2026-06-13",
  "",
  `Status: ${summary.status}`,
  "",
  "This probe validates that the agent review approves only a sandbox-only soft go-live and keeps paid, outreach, hosted MCP and real-data activity blocked.",
  "",
  "## Result",
  "",
  `- checks total: ${summary.checks_total}`,
  `- checks failed: ${summary.checks_failed}`,
  "- paid checkout allowed: false",
  "- real invoice allowed: false",
  "- hosted public MCP allowed: false",
  "- human outreach allowed: false",
  "- real customer data allowed: false",
  "- personal data allowed: false",
  "",
  "## Interpretation",
  "",
  failedChecks.length === 0
    ? "The agent go/no-go review is internally consistent and authorizes only a controlled sandbox-only soft go-live preparation step."
    : "The agent go/no-go review contains gaps and must be repaired before preparing the control pack.",
  "",
  "## Next",
  "",
  `Allowed: ${summary.next_action_if_passed}`,
  "",
  `Blocked if failed: ${summary.next_action_if_failed}`,
  "",
  "## Failed Checks",
  "",
  ...(failedChecks.length === 0
    ? ["None."]
    : failedChecks.map((check) => `- ${check.name}: ${check.details}`)),
  "",
].join("\n");

await writeFile(reportPath, report);

console.log(JSON.stringify(summary, null, 2));
