import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const modelPath = path.join(root, "private-evaluator-pack", "support_cost_guard_margin_model_20260613.json");
const markdownPath = path.join(root, "private-evaluator-pack", "support_cost_guard_margin_model_20260613.md");
const summaryPath = path.join(root, "private-evaluator-pack", "support_cost_guard_margin_model_probe_summary_20260613.json");
const reportPath = path.join(root, "private-evaluator-pack", "support_cost_guard_margin_model_probe_report_20260613.md");

const model = JSON.parse(fs.readFileSync(modelPath, "utf8"));
const markdown = fs.readFileSync(markdownPath, "utf8");
const checks = [];

function check(name, ok, detail = "") {
  checks.push({ name, ok: Boolean(ok), detail });
}

const products = model.products ?? [];
const productMap = new Map(products.map((product) => [product.product_code, product]));
const stopRules = new Set(model.global_stop_rules ?? []);

check("model prepared", model.status === "prepared", model.status);
check("mode NoWrite planning", model.mode === "NoWrite planning", model.mode);
check("commercial not live", model.commercial_status === "not_live", model.commercial_status);
check("real payments disabled", model.assumptions?.real_payments_enabled === false, String(model.assumptions?.real_payments_enabled));
check("invoices disabled", model.assumptions?.invoices_enabled === false, String(model.assumptions?.invoices_enabled));
check("external paid APIs disabled", model.assumptions?.external_paid_api_calls_enabled === false, String(model.assumptions?.external_paid_api_calls_enabled));
check("real customer data disabled", model.assumptions?.real_customer_data_enabled === false, String(model.assumptions?.real_customer_data_enabled));
check("agent cost variable", model.assumptions?.agent_credit_cost_is_variable === true, String(model.assumptions?.agent_credit_cost_is_variable));
check("minimum gross margin target 70", model.assumptions?.minimum_gross_margin_target === 0.7, String(model.assumptions?.minimum_gross_margin_target));
check("minimum after-agent margin target 55", model.assumptions?.minimum_margin_after_agent_cost_target === 0.55, String(model.assumptions?.minimum_margin_after_agent_cost_target));

for (const productCode of [
  "target_discovery_pack_250",
  "score_pack_1k",
  "deep_analysis_pack_100",
  "action_pack_25"
]) {
  const product = productMap.get(productCode);
  check(`product exists: ${productCode}`, Boolean(product));
  check(`price positive: ${productCode}`, product?.planning_price_eur > 0, String(product?.planning_price_eur));
  check(`max cost positive: ${productCode}`, product?.max_total_cost_eur > 0, String(product?.max_total_cost_eur));
  check(`margin pct present: ${productCode}`, typeof product?.minimum_expected_gross_margin_pct === "number", String(product?.minimum_expected_gross_margin_pct));
  check(`valid output rule present: ${productCode}`, /Consume|Charge/i.test(product?.valid_output_rule ?? ""), product?.valid_output_rule ?? "");
  check(`stop rule present: ${productCode}`, /Do not sell live/i.test(product?.stop_rule ?? ""), product?.stop_rule ?? "");
}

check("portfolio product count 4", model.portfolio_summary?.products_count === 4, String(model.portfolio_summary?.products_count));
check("one meets target", model.portfolio_summary?.meets_margin_target_count === 1, String(model.portfolio_summary?.meets_margin_target_count));
check("two need review", model.portfolio_summary?.needs_price_or_cost_review_count === 2, String(model.portfolio_summary?.needs_price_or_cost_review_count));
check("action pack first recommended", model.portfolio_summary?.recommended_live_order?.[0] === "action_pack_25", model.portfolio_summary?.recommended_live_order?.join(","));

for (const stopRule of [
  "real payment attempted before owner approval",
  "invoice attempted before owner approval",
  "external paid API call attempted without budget approval",
  "agent credit cost cannot be measured per valid output",
  "valid-output rate below 85%",
  "cost per product exceeds max_total_cost_eur",
  "idempotency or duplicate protection fails",
  "personal data or real customer data appears in test mode",
  "Cloudflare KV or Worker 429 appears"
]) {
  check(`global stop rule: ${stopRule}`, stopRules.has(stopRule));
}

check("next action agent review", model.recommended_next_action?.name === "margin_model_agent_review", model.recommended_next_action?.name);
check("next action NoWrite", model.recommended_next_action?.mode === "NoWrite planning", model.recommended_next_action?.mode);
check("next action no supervision", model.recommended_next_action?.requires_owner_supervision === false, String(model.recommended_next_action?.requires_owner_supervision));

for (const phrase of [
  "Action Pack 25",
  "Score Pack 1k",
  "needs cost reduction or price review",
  "costo crediti agenti",
  "margin_model_agent_review"
]) {
  check(`markdown contains: ${phrase}`, markdown.includes(phrase), phrase);
}

const failed = checks.filter((item) => !item.ok);
const summary = {
  probe_id: "support_cost_guard_margin_model_probe_20260613",
  status: failed.length === 0 ? "passed" : "failed",
  checks_total: checks.length,
  checks_failed: failed.length,
  failed_checks: failed,
  commercial_status: model.commercial_status,
  products_count: products.length,
  recommended_next_action: model.recommended_next_action?.name
};

const report = [
  "# Support cost guard margin model probe",
  "",
  `Status: ${summary.status}`,
  `Checks total: ${summary.checks_total}`,
  `Checks failed: ${summary.checks_failed}`,
  `Commercial status: ${summary.commercial_status}`,
  `Products count: ${summary.products_count}`,
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
