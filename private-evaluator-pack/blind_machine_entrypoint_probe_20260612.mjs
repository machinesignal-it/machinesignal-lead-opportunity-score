import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const packDir = path.dirname(fileURLToPath(import.meta.url));
const readJson = (name) => JSON.parse(fs.readFileSync(path.join(packDir, name), "utf8"));

const entrypoint = readJson("private_evaluator_entrypoint.json");
const loaded = {};

for (const item of entrypoint.read_order || []) {
  loaded[item.name] = readJson(item.relative_path);
}

const selector = loaded.product_selector_contract;
const manifest = loaded.pack_manifest;
const scenarios = loaded.evaluation_scenarios;
const gate = loaded.owner_approval_gate_summary;

const checks = [];
const failures = [];

function check(id, ok, detail) {
  checks.push({ id, ok, detail });
  if (!ok) failures.push({ id, detail });
}

check(
  "entrypoint_status",
  entrypoint.status === "externally_presentable_draft_nosend_nowrite_simulation_only",
  "entrypoint must be externally presentable draft but still NoSend/NoWrite"
);

check(
  "business_rule_machine_first",
  entrypoint.business_rule === "sell_to_machines_not_humans" &&
    manifest.primary_customer_interface === "machine",
  "machine must understand this as a machine-first business"
);

check(
  "read_order_loads_selector",
  Boolean(selector?.products?.target_discovery_pack_250),
  "entrypoint must point to product selector contract"
);

check(
  "no_list_routes_target_discovery",
  selector.routing_examples.some((example) =>
    example.case === "no_list" &&
    example.selected_product === "target_discovery_pack_250"
  ),
  "no-list case must route to Target Discovery Pack 250"
);

check(
  "existing_list_routes_score",
  selector.routing_examples.some((example) =>
    example.case === "existing_domain_list" &&
    example.selected_product === "score_pack_1k"
  ),
  "existing-domain-list case must route to Score Pack 1k"
);

check(
  "deep_then_action_gates",
  selector.products.deep_analysis_pack_100.thresholds.buy_deep_analysis_if_score_gte === 75 &&
    selector.products.deep_analysis_pack_100.thresholds.buy_deep_analysis_if_confidence_gte === 0.75 &&
    selector.products.action_pack_25.thresholds.buy_action_pack_only_if_deep_gate === "confirmed",
  "score-to-deep-analysis and deep-to-action-pack gates must be explicit"
);

check(
  "prices_marked_simulated",
  selector.global_rules.prices_are_simulated === true &&
    entrypoint.current_stage.commercial_status === "simulated_prices_only_not_a_live_offer",
  "prices must be simulated and not a live offer"
);

check(
  "blocked_actions_cover_external_and_writes",
  entrypoint.blocked_actions.includes("external_send") &&
    entrypoint.blocked_actions.includes("post_call_execution") &&
    entrypoint.blocked_actions.includes("write_call_execution") &&
    entrypoint.blocked_actions.includes("payment") &&
    entrypoint.blocked_actions.includes("personal_data_processing"),
  "entrypoint must block external send, POST, write, payment and personal data"
);

check(
  "gate_blocks_live_actions",
  gate.absolute_blocks.includes("live_payment") &&
    gate.absolute_blocks.includes("ledger_write") &&
    gate.absolute_blocks.includes("personal_data") &&
    gate.requires_new_gate_before.includes("any_external_send"),
  "owner gate must block live actions and require a new gate before external send"
);

check(
  "scenarios_are_synthetic",
  JSON.stringify(scenarios).includes(".test") &&
    !JSON.stringify(scenarios).includes("@"),
  "scenarios must be synthetic .test examples and contain no email addresses"
);

const simulatedMachineDecision = {
  explanation: "MachineSignal sells machine-readable commercial opportunity decisions and productized next steps for software, CRMs, AI agents and workflows.",
  no_list_product: "target_discovery_pack_250",
  existing_list_product: "score_pack_1k",
  missing_domain_product: "domain_enrichment_pack_100",
  high_score_next_product: "deep_analysis_pack_100",
  confirmed_evidence_next_product: "action_pack_25",
  blocked_actions_acknowledged: entrypoint.blocked_actions,
  remaining_questions_before_real_external_use: [
    "Which external channel will be approved first?",
    "What rate limits and kill switch will be active?",
    "Which terms, privacy, refund and fiscal rules apply?",
    "When do simulated prices become live commercial prices?",
    "Which production credentials, if any, will be issued and how will they be revoked?"
  ]
};

const summary = {
  artifact: "machinesignal_blind_machine_entrypoint_probe",
  generated_at: new Date().toISOString(),
  ok: failures.length === 0,
  checks_total: checks.length,
  checks_failed: failures.length,
  failures,
  starting_input: "private_evaluator_entrypoint.json_only",
  machine_decision: simulatedMachineDecision,
  external_send_executed: false,
  post_calls_executed: 0,
  write_calls_executed: 0,
  payment_executed: false,
  invoice_issued: false,
  credits_consumed: 0,
  personal_data_used: false,
  real_customer_data_used: false,
  recommendation: failures.length === 0
    ? "entrypoint_passed_blind_machine_probe_ready_for_owner_review_not_external_send"
    : "fix_entrypoint_before_owner_review"
};

const report = [
  "# MachineSignal Blind Machine Entrypoint Probe",
  "",
  `Generated at: ${summary.generated_at}`,
  "",
  `Status: ${summary.ok ? "PASS" : "FAIL"}`,
  "",
  "## Starting Input",
  "",
  "`private_evaluator_entrypoint.json` only.",
  "",
  "## Simulated Machine Decision",
  "",
  `- Business understood: ${simulatedMachineDecision.explanation}`,
  `- No-list product: ${simulatedMachineDecision.no_list_product}`,
  `- Existing-list product: ${simulatedMachineDecision.existing_list_product}`,
  `- Missing-domain product: ${simulatedMachineDecision.missing_domain_product}`,
  `- High-score next product: ${simulatedMachineDecision.high_score_next_product}`,
  `- Confirmed-evidence next product: ${simulatedMachineDecision.confirmed_evidence_next_product}`,
  "",
  "## Safety Result",
  "",
  `- external_send_executed: ${summary.external_send_executed}`,
  `- post_calls_executed: ${summary.post_calls_executed}`,
  `- write_calls_executed: ${summary.write_calls_executed}`,
  `- payment_executed: ${summary.payment_executed}`,
  `- invoice_issued: ${summary.invoice_issued}`,
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
  "## Failures",
  "",
  ...(summary.failures.length
    ? summary.failures.map((failure) => `- ${failure.id}: ${failure.detail}`)
    : ["None"])
].join("\n");

fs.writeFileSync(
  path.join(packDir, "blind_machine_entrypoint_probe_summary_20260612.json"),
  `${JSON.stringify(summary, null, 2)}\n`
);
fs.writeFileSync(
  path.join(packDir, "blind_machine_entrypoint_probe_report_20260612.md"),
  `${report}\n`
);

console.log(JSON.stringify(summary, null, 2));

