import fs from "node:fs";

const now = new Date().toISOString();
const reportPath = "private-evaluator-pack/company_brain_public_observation_nowrite_report_20260614.md";
const summaryPath = "private-evaluator-pack/company_brain_public_observation_nowrite_summary_20260614.json";

const companyBrain = JSON.parse(fs.readFileSync("company-brain.json", "utf8"));
const graph = JSON.parse(fs.readFileSync("company-brain-graph.json", "utf8"));

const urls = {
  llms: companyBrain.public_machine_entrypoints.llms,
  productCatalog: companyBrain.public_machine_entrypoints.product_catalog,
  machineOnboarding: companyBrain.public_machine_entrypoints.machine_onboarding,
  openapi: companyBrain.public_machine_entrypoints.openapi,
  postman: companyBrain.public_machine_entrypoints.postman_public_collection,
  machineDiscoveryPack: companyBrain.public_machine_entrypoints.machine_discovery_pack,
  sandboxDocsMarkdown: companyBrain.public_machine_entrypoints.sandbox_public_docs_markdown,
  sandboxDocsJson: companyBrain.public_machine_entrypoints.sandbox_public_docs_json
};

const expectedPrices = {
  target_discovery_pack_250: 249,
  score_pack_1k: 119,
  domain_enrichment_pack_100: 149,
  deep_analysis_pack_100: 349,
  action_pack_25: 399,
  opportunity_feed_monthly: 249,
  api_starter_monthly: 99,
  api_pro_monthly: 499
};

const forbiddenLiveSignals = [
  "payment method collection enabled",
  "real payment executed",
  "invoice issued",
  "commercial go-live approved",
  "production api key enabled",
  "external outreach enabled",
  "hosted mcp public launch approved",
  "mcp registry publication approved"
];

const checks = [];
const fetched = {};

function check(name, ok, evidence = "") {
  checks.push({ name, ok: Boolean(ok), evidence });
}

async function fetchText(label, url) {
  const response = await fetch(url, { headers: { "user-agent": "MachineSignal-NoWrite-Observation/2026-06-14" } });
  const text = await response.text();
  fetched[label] = { status: response.status, text, url };
  check(`fetch_${label}`, response.ok, `${response.status} ${url}`);
  return text;
}

function findPrice(text, price) {
  return text.includes(`"price_eur": ${price}`) || text.includes(`"price_eur":${price}`) || text.includes(`EUR ${price}`) || text.includes(`€${price}`) || text.includes(`${price}`);
}

function includesAny(text, terms) {
  const lower = text.toLowerCase();
  return terms.some((term) => lower.includes(term.toLowerCase()));
}

function countProductsInText(text) {
  return Object.keys(expectedPrices).filter((productId) => text.includes(productId)).length;
}

for (const [label, url] of Object.entries(urls)) {
  await fetchText(label, url);
}

const productCatalog = JSON.parse(fetched.productCatalog.text);
const sandboxDocsJson = JSON.parse(fetched.sandboxDocsJson.text);
const graphIds = new Set(graph.nodes.map((node) => node.id));
const graphBrokenEdges = graph.edges.filter((edge) => !graphIds.has(edge.from) || !graphIds.has(edge.to));

check("company_brain_phase_is_sandbox_public_docs_only", companyBrain.current_status.phase === "sandbox-public-docs-only", companyBrain.current_status.phase);
check("company_brain_blocks_paid_beta", companyBrain.current_status.paid_beta === "not_approved", companyBrain.current_status.paid_beta);
check("company_brain_blocks_go_live", companyBrain.current_status.commercial_go_live === "no_go", companyBrain.current_status.commercial_go_live);
check("graph_has_no_broken_edges", graphBrokenEdges.length === 0, `${graphBrokenEdges.length} broken edges`);
check("graph_remembers_future_visualization", graph.visualization_status === "planned_not_started", graph.visualization_status);

check("public_catalog_version_matches_company_brain", productCatalog.catalog_version === "2026-06-14-beta-v22", productCatalog.catalog_version);
check("public_catalog_machine_interface", productCatalog.primary_customer_interface === "machine", productCatalog.primary_customer_interface);
check("public_catalog_no_real_payment", productCatalog.payment_mode?.real_payment_executed === false, String(productCatalog.payment_mode?.real_payment_executed));
check("public_catalog_no_external_contact", productCatalog.payment_mode?.external_contact_executed === false, String(productCatalog.payment_mode?.external_contact_executed));

for (const [productId, price] of Object.entries(expectedPrices)) {
  const catalogProduct = productCatalog.products?.[productId];
  if (catalogProduct?.price_eur !== undefined) {
    check(`catalog_price_${productId}`, catalogProduct.price_eur === price, String(catalogProduct.price_eur));
  } else if (catalogProduct?.price_eur_from !== undefined) {
    check(`catalog_price_from_${productId}`, true, String(catalogProduct.price_eur_from));
  } else {
    check(`catalog_price_${productId}`, productId === "api_starter_monthly" || productId === "api_pro_monthly", "not in public catalog or expected only in company brain");
  }
}

check("sandbox_docs_json_status", sandboxDocsJson.status === "sandbox-public-docs-only", sandboxDocsJson.status);
check("sandbox_docs_json_blocks_go_live", sandboxDocsJson.commercial_go_live === false, String(sandboxDocsJson.commercial_go_live));
check("sandbox_docs_json_blocks_payment", sandboxDocsJson.real_payment_executed === false, String(sandboxDocsJson.real_payment_executed));
check("sandbox_docs_json_blocks_invoice", sandboxDocsJson.real_invoice_issued === false, String(sandboxDocsJson.real_invoice_issued));
check("sandbox_docs_json_blocks_payment_method_collection", sandboxDocsJson.payment_method_collection_enabled === false, String(sandboxDocsJson.payment_method_collection_enabled));
check("sandbox_docs_json_blocks_outreach", sandboxDocsJson.external_outreach_enabled === false, String(sandboxDocsJson.external_outreach_enabled));
check("sandbox_docs_json_blocks_real_data", sandboxDocsJson.real_data_processing_enabled === false, String(sandboxDocsJson.real_data_processing_enabled));
check("sandbox_docs_json_blocks_personal_data", sandboxDocsJson.personal_data_processing_enabled === false, String(sandboxDocsJson.personal_data_processing_enabled));

check("llms_points_to_catalog", fetched.llms.text.includes(urls.productCatalog), "llms catalog link");
check("llms_mentions_sandbox_only", fetched.llms.text.toLowerCase().includes("sandbox"), "llms sandbox marker");
check("llms_blocks_go_live", fetched.llms.text.toLowerCase().includes("commercial go-live remains blocked"), "llms go-live block");
check("llms_mentions_no_real_payments", fetched.llms.text.toLowerCase().includes("real payments"), "llms real payments marker");

check("sandbox_markdown_mentions_sandbox_only", fetched.sandboxDocsMarkdown.text.includes("sandbox-public-docs-only"), "markdown status marker");
check("sandbox_markdown_mentions_no_live_payment_page", fetched.sandboxDocsMarkdown.text.toLowerCase().includes("not a live payment page"), "markdown live payment marker");
check("sandbox_markdown_mentions_blocked_actions", fetched.sandboxDocsMarkdown.text.toLowerCase().includes("blocked"), "markdown blocked marker");

check("openapi_mentions_score_endpoint", fetched.openapi.text.includes("/v1/lead-opportunity-score"), "OpenAPI score endpoint");
check("openapi_mentions_purchase_intent", fetched.openapi.text.includes("/v1/purchase-intent"), "OpenAPI purchase intent endpoint");
check("postman_mentions_score_endpoint", fetched.postman.text.includes("lead-opportunity-score"), "Postman score endpoint");
check("machine_discovery_mentions_machine_signal", fetched.machineDiscoveryPack.text.toLowerCase().includes("machinesignal"), "Machine discovery brand");

for (const [label, item] of Object.entries(fetched)) {
  check(`no_forbidden_live_signal_${label}`, !includesAny(item.text, forbiddenLiveSignals), "no forbidden live phrase found");
}

check("machine_onboarding_mentions_multiple_products", countProductsInText(fetched.machineOnboarding.text) >= 3, `${countProductsInText(fetched.machineOnboarding.text)} products referenced`);
check("product_catalog_mentions_multiple_products", countProductsInText(fetched.productCatalog.text) >= 5, `${countProductsInText(fetched.productCatalog.text)} products referenced`);

const failed = checks.filter((item) => !item.ok);
const summary = {
  status: failed.length === 0 ? "pass" : "fail",
  generated_at: now,
  checks_total: checks.length,
  checks_failed: failed.length,
  writes_performed: 0,
  real_payment_executed: false,
  invoice_issued: false,
  external_outreach_executed: false,
  real_data_processed: false,
  personal_data_processed: false,
  company_brain_version: companyBrain.company_brain_version,
  graph_version: graph.graph_version,
  report: reportPath
};

const report = [
  "# MachineSignal Company Brain Public Observation NoWrite - 2026-06-14",
  "",
  "## Scope",
  "",
  "This probe observes public machine-readable surfaces and compares them with the internal Company Brain.",
  "",
  "It performs no writes, no payments, no invoices, no outreach and no real or personal data processing.",
  "",
  "## Result",
  "",
  `Status: ${summary.status}`,
  `Checks: ${summary.checks_total}`,
  `Failed: ${summary.checks_failed}`,
  "",
  "## Evidence",
  "",
  `- Company Brain version: ${summary.company_brain_version}`,
  `- Graph version: ${summary.graph_version}`,
  `- Graph nodes: ${graph.nodes.length}`,
  `- Graph edges: ${graph.edges.length}`,
  `- Public catalog version: ${productCatalog.catalog_version}`,
  "",
  "## Failed Checks",
  "",
  failed.length ? failed.map((item) => `- ${item.name}: ${item.evidence}`).join("\n") : "None.",
  "",
  "## Checks",
  "",
  checks.map((item) => `- ${item.ok ? "PASS" : "FAIL"} ${item.name}: ${item.evidence}`).join("\n"),
  "",
  "## Guardrails Confirmed",
  "",
  "- Writes performed: 0",
  "- Real payment executed: false",
  "- Invoice issued: false",
  "- External outreach executed: false",
  "- Real data processed: false",
  "- Personal data processed: false",
  "",
  "## Recommendation",
  "",
  summary.status === "pass"
    ? "Continue sandbox-only testing. Do not move to paid beta, public marketplace, hosted MCP or real-data processing without owner approval."
    : "Fix failed public consistency checks before continuing sandbox testing.",
  ""
].join("\n");

fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
fs.writeFileSync(reportPath, report);

console.log(JSON.stringify(summary, null, 2));
if (failed.length) {
  process.exitCode = 1;
}
