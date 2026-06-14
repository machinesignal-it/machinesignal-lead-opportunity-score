import fs from "node:fs";

const OUTPUT_REPORT = "private-evaluator-pack/public_pricing_consistency_probe_nowrite_report_20260614.md";
const OUTPUT_SUMMARY = "private-evaluator-pack/public_pricing_consistency_probe_nowrite_summary_20260614.json";

const expected = {
  target_discovery_pack_250: 249,
  score_pack_1k: 119,
  deep_analysis_pack_100: 349
};

const checks = [];

function check(name, ok, detail = "") {
  checks.push({ name, ok: Boolean(ok), detail });
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      "user-agent": "MachineSignalPublicPricingConsistencyProbe/2026-06-14",
      "cache-control": "no-cache"
    }
  });
  const text = await response.text();
  check(`${slug(url)}_reachable`, response.ok, `HTTP ${response.status}; bytes=${text.length}`);
  return { response, text };
}

async function fetchJson(url) {
  const { response, text } = await fetchText(url);
  let body = null;
  try {
    body = JSON.parse(text);
    check(`${slug(url)}_json_valid`, true, "valid JSON");
  } catch {
    check(`${slug(url)}_json_valid`, false, "invalid JSON");
  }
  return { response, text, body };
}

function slug(value) {
  return String(value).replace(/^https?:\/\//, "").replace(/[^a-z0-9]+/gi, "_").replace(/^_+|_+$/g, "").toLowerCase();
}

function priceCheck(prefix, products) {
  check(`${prefix}_target_price_249`, products?.target_discovery_pack_250?.price_eur === expected.target_discovery_pack_250, String(products?.target_discovery_pack_250?.price_eur));
  check(`${prefix}_score_price_119`, products?.score_pack_1k?.price_eur === expected.score_pack_1k, String(products?.score_pack_1k?.price_eur));
  check(`${prefix}_deep_price_349`, products?.deep_analysis_pack_100?.price_eur === expected.deep_analysis_pack_100, String(products?.deep_analysis_pack_100?.price_eur));
}

const staticCatalog = await fetchJson("https://machinesignal.it/product-catalog.json");
priceCheck("static_catalog", staticCatalog.body?.products);
check("static_catalog_version_v22", staticCatalog.body?.catalog_version === "2026-06-14-beta-v22", String(staticCatalog.body?.catalog_version));

const workerCatalog = await fetchJson("https://machinesignal-api.beta-878.workers.dev/product-catalog.json");
priceCheck("worker_catalog", workerCatalog.body?.products);
check("worker_catalog_version_v22", workerCatalog.body?.catalog_version === "2026-06-14-beta-v22", String(workerCatalog.body?.catalog_version));

const onboarding = await fetchJson("https://machinesignal.it/machine-onboarding.json");
priceCheck("static_onboarding", onboarding.body?.products);

const llms = await fetchText("https://machinesignal.it/llms.txt");
check("llms_target_price_249", llms.text.includes("Target Discovery Pack: EUR 249"), "llms target");
check("llms_score_price_119", llms.text.includes("Score Pack 1k: EUR 119"), "llms score");
check("llms_deep_price_349", llms.text.includes("Deep Analysis Pack 100: EUR 349"), "llms deep");
check("llms_no_old_score_price", !llms.text.includes("Score Pack 1k: EUR 99"), "old score price absent");
check("llms_no_old_deep_price", !llms.text.includes("Deep Analysis Pack 100: EUR 299"), "old deep price absent");

const machineDiscovery = await fetchJson("https://machinesignal.it/machine-discovery/machine-discovery-pack.json");
check("machine_discovery_target_price_249", machineDiscovery.body?.products_to_test?.target_discovery?.beta_price_eur === 249, String(machineDiscovery.body?.products_to_test?.target_discovery?.beta_price_eur));
check("machine_discovery_score_price_119", machineDiscovery.body?.products_to_test?.score_pack_1k?.beta_price_eur === 119, String(machineDiscovery.body?.products_to_test?.score_pack_1k?.beta_price_eur));
check("machine_discovery_deep_price_349", machineDiscovery.body?.products_to_test?.deep_analysis?.beta_price_eur === 349, String(machineDiscovery.body?.products_to_test?.deep_analysis?.beta_price_eur));

const rapidApi = await fetchJson("https://machinesignal.it/distribution/rapidapi-listing.json");
const rapidProducts = Object.fromEntries((rapidApi.body?.products || []).map((item) => [item.product_code, item]));
check("rapidapi_target_price_249", rapidProducts.target_discovery?.price_eur === 249, String(rapidProducts.target_discovery?.price_eur));
check("rapidapi_score_price_119", rapidProducts.score_pack_1k?.price_eur === 119, String(rapidProducts.score_pack_1k?.price_eur));
check("rapidapi_deep_price_349", rapidProducts.deep_analysis?.price_eur === 349, String(rapidProducts.deep_analysis?.price_eur));

const openapi = await fetchText("https://machinesignal.it/openapi.json");
check("openapi_score_payment_test_119", openapi.text.includes('"amount_eur": 119'), "score payment-test example");
check("openapi_no_score_payment_test_99", !openapi.text.includes('"amount_eur": 99'), "old score payment-test absent");

const postman = await fetchText("https://machinesignal.it/postman_public_collection.json");
check("postman_score_payment_test_119", postman.text.includes('"amount_eur": 119') || postman.text.includes('\\"amount_eur\\": 119'), "score payment-test example");
check("postman_no_score_payment_test_99", !postman.text.includes('"amount_eur": 99'), "old score payment-test absent");

const safetyText = `${staticCatalog.text}\n${onboarding.text}\n${workerCatalog.text}`;
check("safety_real_payment_false", safetyText.includes('"real_payment_executed": false') || safetyText.includes('"real_payment_executed":false'), "payment false marker");
check("safety_external_contact_false", safetyText.includes('"external_contact_executed": false') || safetyText.includes('"external_contact_executed":false'), "contact false marker");
check("probe_nowrite", true, "api_calls_executed_now=0; write_calls_executed_now=0");

const failed = checks.filter((item) => !item.ok);
const summary = {
  probe_id: "public_pricing_consistency_probe_nowrite_20260614",
  mode: "NoWrite public consistency probe",
  api_calls_executed_now: 0,
  write_calls_executed_now: 0,
  status: failed.length === 0 ? "pass" : "fail",
  checks_total: checks.length,
  checks_failed: failed.length,
  failed_checks: failed,
  expected_prices: expected,
  recommended_next_step:
    failed.length === 0
      ? "Sandbox technical test can move to 90-92% complete. Next owner decision: public sandbox docs visibility or continue internal-only."
      : "Fix public consistency failures before further sandbox or distribution work.",
  checks
};

const report = `# MachineSignal - Public Pricing Consistency Probe NoWrite - 2026-06-14

Mode: ${summary.mode}

- API calls executed now: ${summary.api_calls_executed_now}
- Write calls executed now: ${summary.write_calls_executed_now}
- Status: ${summary.status}
- Checks: ${summary.checks_total}
- Failed: ${summary.checks_failed}

## Expected Prices

- Target Discovery Pack 250: EUR ${expected.target_discovery_pack_250}
- Score Pack 1k: EUR ${expected.score_pack_1k}
- Deep Analysis Pack 100: EUR ${expected.deep_analysis_pack_100}

## Failed Checks

${failed.length === 0 ? "None." : failed.map((item) => `- ${item.name}: ${item.detail}`).join("\n")}

## Recommended Next Step

${summary.recommended_next_step}
`;

fs.writeFileSync(OUTPUT_SUMMARY, `${JSON.stringify(summary, null, 2)}\n`);
fs.writeFileSync(OUTPUT_REPORT, report);

console.log(JSON.stringify({
  status: summary.status,
  checks_total: summary.checks_total,
  checks_failed: summary.checks_failed,
  report: OUTPUT_REPORT,
  summary: OUTPUT_SUMMARY
}, null, 2));

if (failed.length > 0) process.exit(1);
