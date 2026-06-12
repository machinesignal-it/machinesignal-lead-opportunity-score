import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const packDir = path.dirname(fileURLToPath(import.meta.url));
const read = (name) => fs.readFileSync(path.join(packDir, name), "utf8");
const parse = (name) => JSON.parse(read(name));

const manifest = parse("manifest.json");
const scenarios = parse("evaluation_scenarios.json");
const checklist = parse("evaluation_checklist.json");
const entrypoint = parse("private_evaluator_entrypoint.json");
const productSelector = parse("product_selector_contract.json");
const readme = read("README.md");
const files = [
  "README.md",
  "manifest.json",
  "private_evaluator_entrypoint.json",
  "product_selector_contract.json",
  "evaluation_scenarios.json",
  "evaluation_checklist.json",
  "owner_approval_gate_summary_20260612.md",
  "owner_approval_gate_summary_20260612.json",
  "agent_review_summary_20260612.md",
  "agent_review_summary_20260612.json"
];

const failures = [];
const checks = [];

function check(id, ok, detail) {
  checks.push({ id, ok, detail });
  if (!ok) failures.push({ id, detail });
}

check(
  "status_is_draft_nosend_nowrite",
  manifest.status === "draft_nosend_nowrite_simulation_only" &&
    readme.includes("Draft - NoSend - NoWrite - Simulation Only"),
  "manifest and README must declare draft NoSend NoWrite simulation status"
);

const safety = manifest.safety_state || {};
for (const key of [
  "send_allowed",
  "write_allowed",
  "payment_allowed",
  "invoice_allowed",
  "credit_consumption_allowed",
  "external_invitation_allowed",
  "human_outreach_allowed",
  "personal_data_allowed",
  "real_customer_data_allowed",
  "production_key_allowed",
  "marketplace_publication_allowed"
]) {
  check(`safety_${key}_false`, safety[key] === false, `${key} must be false`);
}

const productCodes = new Set((manifest.products || []).map((p) => p.product_code));
for (const required of [
  "target_discovery_pack_250",
  "score_pack_1k",
  "domain_enrichment_pack_100",
  "deep_analysis_pack_100",
  "action_pack_25",
  "opportunity_feed_monthly",
  "api_starter_monthly",
  "api_pro_monthly"
]) {
  check(`product_${required}`, productCodes.has(required), `${required} must be present`);
}

check(
  "three_scenarios_present",
  Array.isArray(scenarios.scenarios) && scenarios.scenarios.length === 3,
  "exactly three synthetic evaluator scenarios must be present"
);

check(
  "entrypoint_present",
  entrypoint.status === "externally_presentable_draft_nosend_nowrite_simulation_only" &&
    Array.isArray(entrypoint.read_order) &&
    entrypoint.read_order.some((item) => item.relative_path === "product_selector_contract.json"),
  "entrypoint must be externally presentable draft and point to product selector"
);

check(
  "product_selector_present",
  productSelector.status === "machine_readable_simulated_pricing_not_live_offer" &&
    productSelector.global_rules?.prices_are_simulated === true &&
    productSelector.global_rules?.live_checkout_enabled === false,
  "product selector must mark prices as simulated and live checkout disabled"
);

check(
  "product_selector_thresholds",
  productSelector.products?.deep_analysis_pack_100?.thresholds?.buy_deep_analysis_if_score_gte === 75 &&
    productSelector.products?.deep_analysis_pack_100?.thresholds?.buy_deep_analysis_if_confidence_gte === 0.75 &&
    productSelector.products?.action_pack_25?.thresholds?.buy_action_pack_only_if_deep_gate === "confirmed",
  "product selector must define deep-analysis and action-pack gates"
);

const allScenarioText = JSON.stringify(scenarios);
check(
  "synthetic_domains_only",
  /\.test/.test(allScenarioText) && !/@/.test(allScenarioText),
  "scenarios must use .test synthetic domains and no email addresses"
);

for (const scenario of scenarios.scenarios || []) {
  check(
    `scenario_${scenario.scenario_id}_blocks_writes`,
    Array.isArray(scenario.must_not_execute) &&
      scenario.must_not_execute.includes("write_call") &&
      scenario.must_not_execute.some((v) => v.includes("payment") || v === "payment") &&
      scenario.must_not_execute.some((v) => v.includes("external_send") || v === "external_send"),
    `${scenario.scenario_id} must block writes, payments, and external send`
  );
}

check(
  "checklist_required_checks",
  Array.isArray(checklist.required_checks) && checklist.required_checks.length >= 10,
  "checklist must contain at least 10 required checks"
);

const combined = files.map((file) => read(file)).join("\n");
const forbiddenPatterns = [
  new RegExp(["BEGIN", "RSA", "PRIVATE", "KEY"].join(" "), "i"),
  new RegExp(["BEGIN", "OPENSSH", "PRIVATE", "KEY"].join(" "), "i"),
  /Bearer\s+[A-Za-z0-9_.-]{20,}/i,
  /ghp_[A-Za-z0-9]{20,}/i,
  /xox[baprs]-[A-Za-z0-9-]{10,}/i,
  /password\s*[:=]\s*[^\s,;]{8,}/i,
  /api[_-]?key\s*[:=]\s*[A-Za-z0-9_.-]{20,}/i,
  /token\s*[:=]\s*[A-Za-z0-9_.-]{24,}/i,
  /cookie\s*[:=]\s*[A-Za-z0-9_.-]{20,}/i
];

for (const pattern of forbiddenPatterns) {
  check(
    `secret_scan_${pattern.source}`,
    !pattern.test(combined),
    `forbidden secret-like pattern must not appear: ${pattern.source}`
  );
}

const publicLinks = Object.values(manifest.public_reference_links || {});
check("public_links_count", publicLinks.length >= 8, "expected at least 8 public reference links");
check(
  "public_links_are_https",
  publicLinks.every((url) => typeof url === "string" && url.startsWith("https://machinesignal.it/")),
  "all public reference links must stay on machinesignal.it"
);

const summary = {
  artifact: "machinesignal_private_evaluator_pack_validation",
  generated_at: new Date().toISOString(),
  pack_status: manifest.status,
  ok: failures.length === 0,
  checks_total: checks.length,
  checks_failed: failures.length,
  failures,
  safety_result: "nosend_nowrite_nopayment_nopersonaldata",
  external_send_executed: false,
  write_calls_executed: 0,
  post_calls_executed: 0,
  payment_executed: false,
  credits_consumed: 0,
  personal_data_used: false,
  products_checked: [...productCodes],
  scenarios_checked: (scenarios.scenarios || []).map((s) => s.scenario_id),
  entrypoint_checked: "private_evaluator_entrypoint.json",
  product_selector_checked: "product_selector_contract.json",
  recommendation: failures.length === 0
    ? "pack_ready_for_owner_review_not_for_external_send"
    : "fix_failures_before_owner_review"
};

const report = [
  "# MachineSignal Private Evaluator Pack Validation",
  "",
  `Generated at: ${summary.generated_at}`,
  "",
  `Status: ${summary.ok ? "PASS" : "FAIL"}`,
  "",
  "## Safety Result",
  "",
  `- external_send_executed: ${summary.external_send_executed}`,
  `- write_calls_executed: ${summary.write_calls_executed}`,
  `- post_calls_executed: ${summary.post_calls_executed}`,
  `- payment_executed: ${summary.payment_executed}`,
  `- credits_consumed: ${summary.credits_consumed}`,
  `- personal_data_used: ${summary.personal_data_used}`,
  "",
  "## Checks",
  "",
  `- checks_total: ${summary.checks_total}`,
  `- checks_failed: ${summary.checks_failed}`,
  "",
  "## Recommendation",
  "",
  summary.recommendation,
  "",
  "## Scenario Coverage",
  "",
  ...summary.scenarios_checked.map((scenario) => `- ${scenario}`),
  "",
  "## Failures",
  "",
  ...(summary.failures.length
    ? summary.failures.map((failure) => `- ${failure.id}: ${failure.detail}`)
    : ["None"])
].join("\n");

fs.writeFileSync(
  path.join(packDir, "private_evaluator_pack_validation_summary_20260612.json"),
  `${JSON.stringify(summary, null, 2)}\n`
);
fs.writeFileSync(
  path.join(packDir, "private_evaluator_pack_validation_report_20260612.md"),
  `${report}\n`
);

console.log(JSON.stringify(summary, null, 2));
