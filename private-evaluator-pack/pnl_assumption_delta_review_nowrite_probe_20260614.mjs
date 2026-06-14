import fs from "node:fs";

const jsonPath = "private-evaluator-pack/pnl_assumption_delta_review_nowrite_20260614.json";
const mdPath = "private-evaluator-pack/pnl_assumption_delta_review_nowrite_20260614.md";
const reportPath = "private-evaluator-pack/pnl_assumption_delta_review_nowrite_probe_report_20260614.md";
const summaryPath = "private-evaluator-pack/pnl_assumption_delta_review_nowrite_probe_summary_20260614.json";

const review = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
const md = fs.readFileSync(mdPath, "utf8");
const checks = [];

function check(name, ok, detail) {
  checks.push({ name, ok, detail: String(detail ?? "") });
}

function includesAll(values, required) {
  return required.every((item) => values.includes(item));
}

check("status_reported", review.status === "reported", review.status);
check("mode_nowrite", review.mode === "NoWrite P&L assumption delta review", review.mode);
check("commercial_not_live", review.commercial_status === "not_live", review.commercial_status);
check("go_live_no_go", review.go_live_decision === "no_go", review.go_live_decision);
check("no_api_calls_now", review.api_calls_executed_now === 0, review.api_calls_executed_now);
check("no_write_calls_now", review.write_calls_executed_now === 0, review.write_calls_executed_now);
check("no_real_revenue", review.real_revenue_booked === false, review.real_revenue_booked);
check("no_real_payment", review.real_payment_executed === false, review.real_payment_executed);
check("no_invoice", review.invoice_issued === false, review.invoice_issued);
check("no_payment_method", review.payment_method_collected === false, review.payment_method_collected);

const areas = (review.pnl_delta_findings || []).map((item) => item.area);
check(
  "required_delta_areas_present",
  includesAll(areas, [
    "revenue_timing",
    "product_pricing",
    "deep_analysis_pricing",
    "target_discovery_pricing",
    "action_pack_margin",
    "agent_credit_cost",
    "cloudflare_kv_cost_guard",
    "support_and_post_sale",
    "legal_fiscal_admin"
  ]),
  areas.join(", ")
);

const p0Areas = (review.pnl_delta_findings || []).filter((item) => item.severity === "P0").map((item) => item.area);
check("p0_revenue_agent_legal_present", includesAll(p0Areas, ["revenue_timing", "agent_credit_cost", "legal_fiscal_admin"]), p0Areas.join(", "));

const products = (review.product_pnl_status || []).map((item) => item.product_code);
check(
  "product_status_core_present",
  includesAll(products, ["score_pack_1k", "action_pack_25", "deep_analysis_pack_100", "target_discovery_pack_250"]),
  products.join(", ")
);
check("action_pack_mismatch_flagged", JSON.stringify(review.product_pnl_status || []).includes("mismatch"), JSON.stringify(review.product_pnl_status || []));

const updates = review.recommended_pnl_updates_when_owner_approves_file_edit || [];
check("recommended_updates_include_agent_cost", updates.some((item) => /agent credit/i.test(item)), updates.join(" | "));
check("recommended_updates_include_cloudflare", updates.some((item) => /Cloudflare|KV|Worker/i.test(item)), updates.join(" | "));
check("recommended_updates_include_action_pack_reconcile", updates.some((item) => /Action Pack price mismatch/i.test(item)), updates.join(" | "));

check("no_file_update_reason_present", /NoWrite/.test(review.no_file_update_reason || ""), review.no_file_update_reason);
check("readiness_go_live_no_go", review.readiness_after_review?.go_live_status === "no_go", review.readiness_after_review?.go_live_status);
check("test_phase_estimate_82", review.readiness_after_review?.test_phase_completion_estimate === 82, review.readiness_after_review?.test_phase_completion_estimate);
check("continue_internal_tests", review.stop_or_continue_decision === "continue_internal_tests", review.stop_or_continue_decision);
check("next_step_completion_gate", review.recommended_next_step === "test_phase_completion_gate_nowrite", review.recommended_next_step);

const mdRequired = [
  "Non ho modificato Excel o PowerPoint",
  "I ricavi restano simulati",
  "costo crediti agenti",
  "Cloudflare/Worker/KV",
  "Action Pack",
  "not_live",
  "no_go",
  "test_phase_completion_gate_nowrite"
];
check("md_required_phrases", mdRequired.every((phrase) => md.includes(phrase)), mdRequired.filter((phrase) => !md.includes(phrase)).join(", "));

const combined = JSON.stringify(review, null, 2) + "\n" + md;
for (const phrase of [
  '"commercial_status": "live"',
  '"go_live_decision": "go"',
  '"real_revenue_booked": true',
  '"real_payment_executed": true',
  '"invoice_issued": true',
  '"payment_method_collected": true',
  "ricavi reali registrati",
  "go-live approvato"
]) {
  check(`forbidden_absent_${phrase.replace(/[^a-z0-9]+/gi, "_").slice(0, 50)}`, !combined.toLowerCase().includes(phrase.toLowerCase()), phrase);
}

const errors = checks.filter((item) => !item.ok);
const report = [
  "# P&L Assumption Delta Review NoWrite Probe - 2026-06-14",
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
  review.recommended_next_step
].join("\n");

fs.writeFileSync(reportPath, report);
fs.writeFileSync(summaryPath, JSON.stringify({
  probe_id: "pnl_assumption_delta_review_nowrite_probe_20260614",
  created_at: new Date().toISOString(),
  checks,
  errors,
  recommended_next_step: review.recommended_next_step
}, null, 2));

console.log(report);
if (errors.length) process.exit(1);
