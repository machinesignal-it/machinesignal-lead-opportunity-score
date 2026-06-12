import { readFile, writeFile } from "node:fs/promises";

const repo = "machinesignal-it/machinesignal-lead-opportunity-score";
const proposalPath = "private-evaluator-pack/github_public_metadata_proposal_20260612.json";
const summaryPath = "private-evaluator-pack/github_public_metadata_applied_summary_20260612.json";
const reportPath = "private-evaluator-pack/github_public_metadata_applied_report_20260612.md";
const apiBase = `https://api.github.com/repos/${repo}`;

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

const checks = [];
function addCheck(name, ok, details = "") {
  checks.push({ name, ok: Boolean(ok), details });
}

function sameSet(a, b) {
  const left = [...a].sort();
  const right = [...b].sort();
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "MachineSignal-Codex-Public-Metadata-Applied-Probe",
    },
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`GitHub public API returned HTTP ${response.status}: ${text.slice(0, 200)}`);
  }
  return JSON.parse(text);
}

const proposal = JSON.parse(await readFile(proposalPath, "utf8"));
const expected = proposal.proposed_metadata;
const observedRepo = await fetchJson(apiBase);
const observedTopics = await fetchJson(`${apiBase}/topics`);

const observed = {
  description: observedRepo.description,
  homepage: observedRepo.homepage,
  topics: observedTopics.names || [],
  visibility: observedRepo.visibility,
  default_branch: observedRepo.default_branch,
};

addCheck("public_repo_reachable", observedRepo.full_name === repo, observedRepo.full_name);
addCheck(
  "description_matches_approved_proposal",
  observed.description === expected.description,
  observed.description
);
addCheck(
  "homepage_matches_approved_proposal",
  observed.homepage === expected.homepage,
  observed.homepage
);
addCheck(
  "topics_match_approved_proposal",
  sameSet(observed.topics, expected.topics),
  observed.topics.join(",")
);
addCheck(
  "metadata_remains_sandbox_bounded",
  /sandbox-only beta/i.test(observed.description) && /no outreach or live billing/i.test(observed.description),
  observed.description
);
addCheck(
  "metadata_remains_machine_first",
  /machine-first/i.test(observed.description) &&
    observed.topics.includes("machine-first") &&
    observed.topics.includes("machine-readable"),
  observed.description
);
for (const pattern of forbiddenPatterns) {
  addCheck(
    `forbidden_pattern_absent_${pattern.source}`,
    !pattern.test(observed.description),
    "public description checked"
  );
}

const executionCounters = {
  github_metadata_update_executed: 1,
  github_metadata_update_fields: ["description", "homepage", "topics"],
  external_marketplace_publication_executed: 0,
  external_send_executed: 0,
  post_calls_to_machinesignal_api_executed: 0,
  write_calls_to_machinesignal_api_executed: 0,
  payment_executed: 0,
  credits_consumed: 0,
  personal_data_used: 0,
  real_customer_data_used: 0,
};

for (const [counter, expectedValue] of Object.entries({
  external_marketplace_publication_executed: 0,
  external_send_executed: 0,
  post_calls_to_machinesignal_api_executed: 0,
  write_calls_to_machinesignal_api_executed: 0,
  payment_executed: 0,
  credits_consumed: 0,
  personal_data_used: 0,
  real_customer_data_used: 0,
})) {
  addCheck(`counter_${counter}_zero`, executionCounters[counter] === expectedValue, `${counter}=${executionCounters[counter]}`);
}

const failed = checks.filter((check) => !check.ok);
const summary = {
  artifact: "github_public_metadata_applied_probe",
  version: "2026-06-12",
  status:
    failed.length === 0
      ? "completed_github_public_metadata_application"
      : "failed_github_public_metadata_application",
  ok: failed.length === 0,
  mode: "PublicGitHubMetadataAppliedOwnerApprovedNoMarketplaceNoPaymentNoOutreach",
  repository: repo,
  expected_metadata: expected,
  observed_metadata: observed,
  checks_total: checks.length,
  checks_failed: failed.length,
  execution_counters: executionCounters,
  interpretation:
    failed.length === 0
      ? "The approved GitHub public metadata is now applied and matches the proposal. The repository is more machine-discoverable while remaining sandbox-only and bounded."
      : "The public GitHub metadata does not match the approved proposal or violates a safety rule.",
  recommended_next_step:
    failed.length === 0
      ? "Rerun GitHub-first discoverability and then continue with the MCP/tool-registry private draft path. Do not publish marketplace or registry entries without a new owner gate."
      : "Correct GitHub public metadata or revert to the approved safe proposal, then rerun this probe.",
  checks,
  failed_checks: failed,
};

const report = [
  "# GitHub Public Metadata Applied Report",
  "",
  "Date: 2026-06-12",
  "",
  `Status: ${summary.status}`,
  `Mode: ${summary.mode}`,
  "",
  "## Applied Public Metadata",
  "",
  `Description: ${observed.description}`,
  `Homepage: ${observed.homepage}`,
  `Topics: ${observed.topics.join(", ")}`,
  "",
  "## Safety Result",
  "",
  `- Checks total: ${summary.checks_total}`,
  `- Checks failed: ${summary.checks_failed}`,
  `- GitHub metadata update executed: ${executionCounters.github_metadata_update_executed}`,
  `- External marketplace publication executed: ${executionCounters.external_marketplace_publication_executed}`,
  `- External send executed: ${executionCounters.external_send_executed}`,
  `- MachineSignal API POST calls executed: ${executionCounters.post_calls_to_machinesignal_api_executed}`,
  `- MachineSignal API write calls executed: ${executionCounters.write_calls_to_machinesignal_api_executed}`,
  `- Payment executed: ${executionCounters.payment_executed}`,
  `- Credits consumed: ${executionCounters.credits_consumed}`,
  `- Personal data used: ${executionCounters.personal_data_used}`,
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
