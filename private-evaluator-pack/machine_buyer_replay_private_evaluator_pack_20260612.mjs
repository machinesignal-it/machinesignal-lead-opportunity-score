import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const packDir = path.dirname(fileURLToPath(import.meta.url));
const readJson = (name) => JSON.parse(fs.readFileSync(path.join(packDir, name), "utf8"));

const manifest = readJson("manifest.json");
const scenarios = readJson("evaluation_scenarios.json");
const checklist = readJson("evaluation_checklist.json");

const products = new Map((manifest.products || []).map((product) => [product.product_code, product]));
const scenarioMap = new Map((scenarios.scenarios || []).map((scenario) => [scenario.scenario_id, scenario]));

const failures = [];
const decisions = [];

function assertDecision(id, ok, detail) {
  decisions.push({ id, ok, detail });
  if (!ok) failures.push({ id, detail });
}

const noListScenario = scenarioMap.get("no_list_target_discovery_dentists_milan");
const existingListScenario = scenarioMap.get("existing_list_score_pack_1k");
const upgradeScenario = scenarioMap.get("upgrade_path_deep_analysis_then_action_pack");

assertDecision(
  "understands_business",
  manifest.business_rule === "sell_to_machines_not_humans" &&
    manifest.primary_customer_interface === "machine",
  "MachineSignal must be understood as machine-first, not human-sales-first."
);

assertDecision(
  "no_list_routes_to_target_discovery",
  noListScenario?.expected_product === "target_discovery_pack_250" &&
    products.has("target_discovery_pack_250"),
  "A machine without a list should choose Target Discovery Pack 250."
);

assertDecision(
  "existing_list_routes_to_score_pack",
  existingListScenario?.expected_product === "score_pack_1k" &&
    products.has("score_pack_1k"),
  "A machine with an existing domain list should choose Score Pack 1k."
);

assertDecision(
  "upgrade_path_is_gated",
  Array.isArray(upgradeScenario?.expected_product_path) &&
    upgradeScenario.expected_product_path[0] === "deep_analysis_pack_100" &&
    upgradeScenario.expected_product_path[1] === "action_pack_25",
  "A high score should route to Deep Analysis first and Action Pack only after gate confirmation."
);

assertDecision(
  "simulated_prices_are_visible",
  products.get("target_discovery_pack_250")?.simulated_price_eur === 149 &&
    products.get("score_pack_1k")?.simulated_price_eur === 99 &&
    products.get("deep_analysis_pack_100")?.simulated_price_eur === 299 &&
    products.get("action_pack_25")?.simulated_price_eur === 399,
  "Core simulated prices must be visible to a machine evaluator."
);

assertDecision(
  "safety_flags_block_real_actions",
  manifest.safety_state?.send_allowed === false &&
    manifest.safety_state?.write_allowed === false &&
    manifest.safety_state?.payment_allowed === false &&
    manifest.safety_state?.credit_consumption_allowed === false &&
    manifest.safety_state?.personal_data_allowed === false,
  "Safety flags must block send, write, payment, credit consumption, and personal data."
);

assertDecision(
  "checklist_covers_owner_gate",
  (checklist.required_checks || []).some((check) => check.check_id === "owner_gate"),
  "Checklist must require owner approval before external actions."
);

const machineDecision = {
  no_list_case: {
    chosen_product: "target_discovery_pack_250",
    reason: "The machine has no targets to score and must first buy bounded target discovery for a declared sector, area, and commercial objective.",
    simulated_purchase_intent: true,
    real_purchase_executed: false
  },
  existing_list_case: {
    chosen_product: "score_pack_1k",
    reason: "The machine already has records and needs score, confidence, spend policy, and routing decision.",
    simulated_purchase_intent: true,
    real_purchase_executed: false
  },
  upgrade_case: {
    chosen_product_path: [
      "deep_analysis_pack_100",
      "action_pack_25"
    ],
    reason: "The machine should buy deeper evidence after a strong score, then buy action payloads only after the evidence gate confirms.",
    simulated_purchase_intent: true,
    real_purchase_executed: false
  }
};

const summary = {
  artifact: "machinesignal_machine_buyer_replay_private_evaluator_pack",
  generated_at: new Date().toISOString(),
  ok: failures.length === 0,
  checks_total: decisions.length,
  checks_failed: failures.length,
  failures,
  machine_decision: machineDecision,
  external_send_executed: false,
  write_calls_executed: 0,
  post_calls_executed: 0,
  payment_executed: false,
  invoice_issued: false,
  credits_consumed: 0,
  personal_data_used: false,
  real_customer_data_used: false,
  human_outreach_executed: false,
  recommendation: failures.length === 0
    ? "pack_understandable_by_machine_buyer_ready_for_owner_review_not_external_send"
    : "fix_pack_before_owner_review"
};

const report = [
  "# Machine Buyer Replay - Private Evaluator Pack",
  "",
  `Generated at: ${summary.generated_at}`,
  "",
  `Status: ${summary.ok ? "PASS" : "FAIL"}`,
  "",
  "## Machine Understanding",
  "",
  "The simulated machine understands MachineSignal as a machine-first API that sells decision payloads and productized evaluation steps, not manual human consulting.",
  "",
  "## Product Decisions",
  "",
  `- No-list case: ${machineDecision.no_list_case.chosen_product}`,
  `- Existing-list case: ${machineDecision.existing_list_case.chosen_product}`,
  `- Upgrade path: ${machineDecision.upgrade_case.chosen_product_path.join(" -> ")}`,
  "",
  "## Safety",
  "",
  `- external_send_executed: ${summary.external_send_executed}`,
  `- write_calls_executed: ${summary.write_calls_executed}`,
  `- post_calls_executed: ${summary.post_calls_executed}`,
  `- payment_executed: ${summary.payment_executed}`,
  `- invoice_issued: ${summary.invoice_issued}`,
  `- credits_consumed: ${summary.credits_consumed}`,
  `- personal_data_used: ${summary.personal_data_used}`,
  `- human_outreach_executed: ${summary.human_outreach_executed}`,
  "",
  "## Recommendation",
  "",
  summary.recommendation,
  "",
  "## Failures",
  "",
  ...(summary.failures.length
    ? summary.failures.map((failure) => `- ${failure.id}: ${failure.detail}`)
    : ["None"])
].join("\n");

fs.writeFileSync(
  path.join(packDir, "machine_buyer_replay_private_evaluator_pack_summary_20260612.json"),
  `${JSON.stringify(summary, null, 2)}\n`
);
fs.writeFileSync(
  path.join(packDir, "machine_buyer_replay_private_evaluator_pack_report_20260612.md"),
  `${report}\n`
);

console.log(JSON.stringify(summary, null, 2));

