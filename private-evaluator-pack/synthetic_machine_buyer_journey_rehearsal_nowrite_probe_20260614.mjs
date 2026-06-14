import fs from "node:fs";

const jsonPath = "private-evaluator-pack/synthetic_machine_buyer_journey_rehearsal_nowrite_20260614.json";
const mdPath = "private-evaluator-pack/synthetic_machine_buyer_journey_rehearsal_nowrite_20260614.md";
const reportPath = "private-evaluator-pack/synthetic_machine_buyer_journey_rehearsal_nowrite_probe_report_20260614.md";
const summaryPath = "private-evaluator-pack/synthetic_machine_buyer_journey_rehearsal_nowrite_probe_summary_20260614.json";

const rehearsal = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
const md = fs.readFileSync(mdPath, "utf8");
const checks = [];

function check(name, ok, detail) {
  checks.push({ name, ok, detail: String(detail ?? "") });
}

function includesAll(values, required) {
  return required.every((item) => values.includes(item));
}

check("mode_nowrite", rehearsal.mode === "NoWrite synthetic machine buyer journey rehearsal", rehearsal.mode);
check("commercial_not_live", rehearsal.commercial_status === "not_live", rehearsal.commercial_status);
check("go_live_no_go", rehearsal.go_live_decision === "no_go", rehearsal.go_live_decision);
check("no_api_calls_now", rehearsal.api_calls_executed_now === 0, rehearsal.api_calls_executed_now);
check("no_write_calls_now", rehearsal.write_calls_executed_now === 0, rehearsal.write_calls_executed_now);
check("synthetic_inputs", rehearsal.inputs_are_synthetic === true, rehearsal.inputs_are_synthetic);

for (const flag of [
  "real_payment_executed",
  "real_invoice_issued",
  "external_contact_executed",
  "human_outreach_executed",
  "external_publication_executed",
  "production_api_key_published"
]) {
  check(`${flag}_false`, rehearsal[flag] === false, rehearsal[flag]);
}

const journeys = rehearsal.journeys || [];
const scenarios = journeys.map((journey) => journey.scenario);
check(
  "three_required_scenarios_present",
  includesAll(scenarios, [
    "customer_has_existing_list",
    "customer_has_no_list",
    "customer_wants_next_action_after_deep_analysis"
  ]),
  scenarios.join(", ")
);

const productByScenario = Object.fromEntries(journeys.map((journey) => [journey.scenario, journey.selected_product]));
check("existing_list_selects_score_pack", productByScenario.customer_has_existing_list === "score_pack_1k", productByScenario.customer_has_existing_list);
check("no_list_selects_target_discovery", productByScenario.customer_has_no_list === "target_discovery", productByScenario.customer_has_no_list);
check("next_action_selects_action_pack", productByScenario.customer_wants_next_action_after_deep_analysis === "action_pack", productByScenario.customer_wants_next_action_after_deep_analysis);

for (const journey of journeys) {
  check(`${journey.scenario}_pass`, journey.rehearsal_decision === "PASS", journey.rehearsal_decision);
  check(`${journey.scenario}_has_budget_rule`, Boolean(journey.budget_rule), JSON.stringify(journey.budget_rule || {}));
  check(`${journey.scenario}_has_stop_rules`, Array.isArray(journey.stop_rules) && journey.stop_rules.length >= 3, (journey.stop_rules || []).join(", "));
  check(`${journey.scenario}_has_next_decision_rules`, Array.isArray(journey.next_decision_rules) && journey.next_decision_rules.length >= 3, JSON.stringify(journey.next_decision_rules || []));
}

const noList = journeys.find((journey) => journey.scenario === "customer_has_no_list");
check("no_list_has_required_inputs", includesAll(Object.keys(noList?.synthetic_input || {}), ["market", "area", "commercial_objective"]), JSON.stringify(noList?.synthetic_input || {}));
check("no_list_has_no_weak_filler_stop", (noList?.stop_rules || []).some((rule) => /weak targets/i.test(rule)), (noList?.stop_rules || []).join(", "));

const action = journeys.find((journey) => journey.scenario === "customer_wants_next_action_after_deep_analysis");
check("action_requires_deep_gate", JSON.stringify(action || {}).includes("Deep Analysis") || JSON.stringify(action || {}).includes("deep analysis"), JSON.stringify(action || {}).slice(0, 500));
check("action_blocks_external_contact", (action?.stop_rules || []).some((rule) => /contact target|send email/i.test(rule)), (action?.stop_rules || []).join(", "));

check("overall_pass", rehearsal.overall_machine_decision === "PASS", rehearsal.overall_machine_decision);
check("next_step_agent_roles", rehearsal.recommended_next_step === "agent_roles_operating_check_nowrite", rehearsal.recommended_next_step);

const mdRequired = [
  "PASS",
  "score_pack_1k",
  "target_discovery",
  "action_pack",
  "non invia email",
  "non contatta il target",
  "agent_roles_operating_check_nowrite"
];
check("md_required_phrases", mdRequired.every((phrase) => md.includes(phrase)), mdRequired.filter((phrase) => !md.includes(phrase)).join(", "));

const combined = JSON.stringify(rehearsal, null, 2) + "\n" + md;
for (const phrase of [
  '"commercial_status": "live"',
  '"go_live_decision": "go"',
  '"real_payment_executed": true',
  '"external_contact_executed": true',
  "pagamento reale attivo",
  "outreach attivo",
  "go-live approvato"
]) {
  check(`forbidden_absent_${phrase.replace(/[^a-z0-9]+/gi, "_").slice(0, 50)}`, !combined.toLowerCase().includes(phrase.toLowerCase()), phrase);
}

const errors = checks.filter((item) => !item.ok);
const report = [
  "# Synthetic Machine Buyer Journey Rehearsal NoWrite Probe - 2026-06-14",
  "",
  `Checks: ${checks.length}`,
  `Errors: ${errors.length}`,
  `Result: ${errors.length === 0 ? "PASS" : "FAIL"}`,
  "",
  "## Errors",
  "",
  errors.length ? errors.map((item) => `- ${item.name}: ${item.detail}`).join("\n") : "None.",
  "",
  "## Recommended Next Step",
  "",
  rehearsal.recommended_next_step
].join("\n");

fs.writeFileSync(reportPath, report);
fs.writeFileSync(summaryPath, JSON.stringify({
  probe_id: "synthetic_machine_buyer_journey_rehearsal_nowrite_probe_20260614",
  created_at: new Date().toISOString(),
  checks,
  errors,
  recommended_next_step: rehearsal.recommended_next_step
}, null, 2));

console.log(report);
if (errors.length) process.exit(1);
