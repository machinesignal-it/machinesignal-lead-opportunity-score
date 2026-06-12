import { readFile, writeFile } from "node:fs/promises";

const proposalPath = "private-evaluator-pack/github_public_metadata_proposal_20260612.json";
const summaryPath = "private-evaluator-pack/github_public_metadata_proposal_probe_summary_20260612.json";
const reportPath = "private-evaluator-pack/github_public_metadata_proposal_probe_report_20260612.md";

const checks = [];
const forbiddenPatterns = [
  /guaranteed\s+revenue/i,
  /automatic\s+income/i,
  /passive\s+income/i,
  /live\s+paid\s+checkout/i,
  /active\s+subscriptions/i,
  /production\s+keys\s+available/i,
  /automatic\s+email\s+outreach/i,
  /human\s+sales\s+outreach/i,
  /processing\s+real\s+customer\s+data/i,
  /processing\s+personal\s+data/i,
  /live\s+hosted\s+mcp\s+server/i,
];

function addCheck(name, ok, details = "") {
  checks.push({ name, ok: Boolean(ok), details });
}

function isTopic(topic) {
  return /^[a-z0-9][a-z0-9-]{0,49}$/.test(topic) && !topic.endsWith("-");
}

const proposal = JSON.parse(await readFile(proposalPath, "utf8"));
const description = proposal.proposed_metadata?.description || "";
const homepage = proposal.proposed_metadata?.homepage || "";
const topics = proposal.proposed_metadata?.topics || [];
const publicText = [
  description,
  homepage,
  topics.join(" "),
  ...(proposal.must_not_claim || []),
].join("\n");

addCheck(
  "proposal_status_not_applied",
  proposal.status === "proposal_only_not_applied",
  `status=${proposal.status}`
);
addCheck(
  "business_rule_machine_not_human",
  proposal.business_rule === "sell_to_machines_not_humans",
  `business_rule=${proposal.business_rule}`
);
addCheck(
  "description_length_safe",
  description.length > 60 && description.length <= 160,
  `length=${description.length}`
);
addCheck(
  "description_machine_first",
  /machine-first/i.test(description) && /AI agents|MCP clients|workflows/i.test(description),
  description
);
addCheck(
  "description_sandbox_only_no_live_billing",
  /sandbox-only beta/i.test(description) && /no outreach or live billing/i.test(description),
  description
);
addCheck(
  "homepage_machine_discovery",
  homepage === "https://machinesignal.it/machine-discovery/",
  homepage
);
addCheck(
  "topics_count_safe",
  topics.length >= 8 && topics.length <= 20,
  `topics=${topics.length}`
);
addCheck(
  "topics_format_valid",
  topics.every(isTopic),
  topics.filter((topic) => !isTopic(topic)).join(", ") || "all valid"
);
for (const requiredTopic of [
  "machine-first",
  "machine-readable",
  "lead-scoring",
  "opportunity-scoring",
  "ai-agents",
  "mcp",
  "openapi",
  "sandbox-beta",
]) {
  addCheck(
    `topic_present_${requiredTopic}`,
    topics.includes(requiredTopic),
    requiredTopic
  );
}
for (const pattern of forbiddenPatterns) {
  addCheck(
    `forbidden_pattern_absent_${pattern.source}`,
    !pattern.test(description),
    "description checked"
  );
}
addCheck(
  "owner_gate_required",
  proposal.approval_gate?.owner_approval_required_before_applying === true,
  "owner approval required before public metadata change"
);
for (const blockedAction of [
  "change_github_repository_description",
  "change_github_repository_homepage",
  "change_github_repository_topics",
  "publish_marketplace_listing",
  "submit_mcp_registry_entry",
  "enable_live_billing",
  "issue_production_keys",
]) {
  addCheck(
    `blocked_until_approval_${blockedAction}`,
    proposal.approval_gate?.blocked_until_explicit_owner_approval?.includes(blockedAction),
    blockedAction
  );
}
for (const [counter, expected] of Object.entries({
  github_metadata_update_executed: 0,
  external_marketplace_publication_executed: 0,
  external_send_executed: 0,
  payment_executed: 0,
  credits_consumed: 0,
  personal_data_used: 0,
  real_customer_data_used: 0,
})) {
  addCheck(
    `counter_${counter}_zero`,
    proposal.execution_counters?.[counter] === expected,
    `${counter}=${proposal.execution_counters?.[counter]}`
  );
}

const failed = checks.filter((check) => !check.ok);
const summary = {
  artifact: "github_public_metadata_proposal_probe",
  version: "2026-06-12",
  status:
    failed.length === 0
      ? "completed_github_metadata_proposal_probe"
      : "failed_github_metadata_proposal_probe",
  ok: failed.length === 0,
  mode: "NoWriteNoGitHubMetadataUpdateNoExternalPublication",
  proposal: proposalPath,
  proposed_description: description,
  proposed_homepage: homepage,
  proposed_topics: topics,
  checks_total: checks.length,
  checks_failed: failed.length,
  safety_counters: proposal.execution_counters,
  interpretation:
    failed.length === 0
      ? "The GitHub public metadata proposal is machine-first, sandbox-bounded, topic-format safe and ready for owner review. No GitHub metadata update was executed."
      : "The GitHub public metadata proposal needs corrections before owner review.",
  recommended_next_step:
    failed.length === 0
      ? "Ask owner whether to apply the proposed GitHub description, homepage and topics. Do not apply without explicit confirmation."
      : "Fix failed proposal checks and rerun this probe.",
  checks,
  failed_checks: failed,
};

const report = [
  "# GitHub Public Metadata Proposal Probe",
  "",
  "Date: 2026-06-12",
  "",
  `Status: ${summary.status}`,
  `Mode: ${summary.mode}`,
  "",
  "## Proposed Public Metadata",
  "",
  `Description: ${description}`,
  `Homepage: ${homepage}`,
  `Topics: ${topics.join(", ")}`,
  "",
  "## Result",
  "",
  `- Checks total: ${summary.checks_total}`,
  `- Checks failed: ${summary.checks_failed}`,
  `- GitHub metadata update executed: ${proposal.execution_counters.github_metadata_update_executed}`,
  `- External marketplace publication executed: ${proposal.execution_counters.external_marketplace_publication_executed}`,
  `- External send executed: ${proposal.execution_counters.external_send_executed}`,
  `- Payment executed: ${proposal.execution_counters.payment_executed}`,
  `- Credits consumed: ${proposal.execution_counters.credits_consumed}`,
  `- Personal data used: ${proposal.execution_counters.personal_data_used}`,
  "",
  "## Interpretation",
  "",
  summary.interpretation,
  "",
  "## Failed Checks",
  "",
  ...(failed.length ? failed.map((check) => `- ${check.name}: ${check.details}`) : ["None."]),
  "",
  "## Checks",
  "",
  ...checks.map((check) => `- ${check.ok ? "PASS" : "FAIL"} - ${check.name}: ${check.details}`),
  "",
].join("\n");

await writeFile(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
await writeFile(reportPath, `${report}\n`, "utf8");

if (failed.length > 0) {
  console.error(JSON.stringify({ ok: false, checks_failed: failed.length, failed_checks: failed }, null, 2));
  process.exit(1);
}

console.log(
  JSON.stringify(
    {
      ok: true,
      checks_total: summary.checks_total,
      checks_failed: summary.checks_failed,
      summary: summaryPath,
      report: reportPath,
    },
    null,
    2
  )
);
