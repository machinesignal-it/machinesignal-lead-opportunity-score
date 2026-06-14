import fs from "node:fs";

const reportPath = "private-evaluator-pack/internal_contract_consistency_probe_nowrite_report_20260614.md";
const summaryPath = "private-evaluator-pack/internal_contract_consistency_probe_nowrite_summary_20260614.json";

const files = {
  readme: "README.md",
  openapi: "openapi.json",
  postman: "postman_public_collection.json",
  postmanWorkspace: "docs/postman-public-workspace.md",
  productCatalog: "product-catalog.json",
  machineEntrypoint: "MACHINE_AGENT_ENTRYPOINT.json",
  mcpManifest: "mcp-tool-manifest.json",
  mcpDraft: "private-evaluator-pack/mcp_channel_entrypoint_draft_nopublish.json",
  backlog: "private-evaluator-pack/internal_test_backlog_nowrite_20260614.json"
};

function read(path) {
  return fs.readFileSync(path, "utf8");
}

function parse(path) {
  return JSON.parse(read(path));
}

const text = Object.fromEntries(Object.entries(files).map(([key, path]) => [key, read(path)]));
const json = {
  openapi: parse(files.openapi),
  productCatalog: parse(files.productCatalog),
  machineEntrypoint: parse(files.machineEntrypoint),
  mcpManifest: parse(files.mcpManifest),
  mcpDraft: parse(files.mcpDraft),
  backlog: parse(files.backlog)
};

const checks = [];
function check(name, ok, detail) {
  checks.push({ name, ok, detail: String(detail ?? "") });
}

function contains(key, phrase) {
  return text[key].toLowerCase().includes(phrase.toLowerCase());
}

function anyContains(keys, phrase) {
  return keys.some((key) => contains(key, phrase));
}

function hasAll(values, required) {
  return required.every((item) => values.includes(item));
}

const coreFiles = Object.values(files);
check("core_files_present", coreFiles.every((path) => fs.existsSync(path)), coreFiles.join(", "));

check("readme_machine_first", contains("readme", "primary customer interface: machine") || contains("readme", "the first customer interface is a machine"), "README machine-first wording");
check("catalog_machine_first", json.productCatalog.primary_customer_interface === "machine", json.productCatalog.primary_customer_interface);
check("entrypoint_machine_first", json.machineEntrypoint.primary_customer_interface === "machine", json.machineEntrypoint.primary_customer_interface);
check("mcp_manifest_machine_first", json.mcpManifest.primary_customer_interface === "machine", json.mcpManifest.primary_customer_interface);

check("catalog_purchase_intent_no_payment", json.productCatalog.payment_mode?.real_payment_executed === false, JSON.stringify(json.productCatalog.payment_mode));
check("catalog_no_external_contact", json.productCatalog.payment_mode?.external_contact_executed === false, JSON.stringify(json.productCatalog.payment_mode));
check("entrypoint_safety_no_payment", json.machineEntrypoint.current_safety_state?.live_payment_allowed === false, JSON.stringify(json.machineEntrypoint.current_safety_state));
check("entrypoint_safety_no_outreach", json.machineEntrypoint.current_safety_state?.human_outreach_allowed === false, JSON.stringify(json.machineEntrypoint.current_safety_state));
check("entrypoint_safety_no_real_data", json.machineEntrypoint.current_safety_state?.real_customer_data_allowed === false && json.machineEntrypoint.current_safety_state?.personal_data_allowed === false, JSON.stringify(json.machineEntrypoint.current_safety_state));

const openapiDescription = JSON.stringify(json.openapi.info || {});
check("openapi_beta_description", /beta/i.test(openapiDescription), openapiDescription);
check("openapi_purchase_intent_present", JSON.stringify(json.openapi.paths || {}).includes("/v1/purchase-intent"), "OpenAPI paths");
check("openapi_sandbox_customer_present", JSON.stringify(json.openapi.paths || {}).includes("/v1/sandbox/customers"), "OpenAPI paths");
check("postman_private_beta_warning", contains("postmanWorkspace", "Private technical beta"), "docs/postman-public-workspace.md");
check("postman_no_real_payment_warning", contains("postmanWorkspace", "do not execute real payment"), "docs/postman-public-workspace.md");
check("postman_synthetic_examples", contains("postmanWorkspace", "synthetic"), "docs/postman-public-workspace.md");

const productCodes = Object.values(json.productCatalog.products || {}).map((product) => product.product_code);
check(
  "catalog_core_products_present",
  hasAll(productCodes, ["target_discovery", "score_pack_1k", "domain_enrichment", "deep_analysis", "action_pack", "opportunity_feed", "api_starter", "api_pro"]),
  productCodes.join(", ")
);
check("catalog_credit_rule_valid_output", /valid usable output/i.test(json.productCatalog.general_credit_rule?.rule || ""), json.productCatalog.general_credit_rule?.rule);
check("catalog_credit_tracking", /credits_consumed/i.test(json.productCatalog.general_credit_rule?.tracking || ""), json.productCatalog.general_credit_rule?.tracking);

const routing = json.machineEntrypoint.product_routing || {};
check("entrypoint_routing_no_list", routing.no_starting_list === "target_discovery_pack_250", routing.no_starting_list);
check("entrypoint_routing_existing_list", routing.existing_domain_or_company_list === "score_pack_1k", routing.existing_domain_or_company_list);
check("entrypoint_routing_deep_analysis", routing.score_gte_75_and_confidence_gte_0_75 === "deep_analysis_pack_100", routing.score_gte_75_and_confidence_gte_0_75);
check("entrypoint_routing_action_pack", routing.deep_analysis_gate_confirmed === "action_pack_25", routing.deep_analysis_gate_confirmed);

const deferredChannels = json.machineEntrypoint.current_channel_decision?.deferred_channels || [];
check(
  "entrypoint_deferred_channels_blocked",
  hasAll(deferredChannels, ["rapidapi_marketplace_publication", "postman_api_network_publication", "generic_api_directory_publication", "hosted_public_mcp_launch"]),
  deferredChannels.join(", ")
);
check("mcp_manifest_public_mcp_false", json.mcpManifest.mcp_compatibility?.public_mcp_server_live === false, json.mcpManifest.mcp_compatibility?.public_mcp_server_live);
check("mcp_manifest_local_adapter_available", json.mcpManifest.mcp_compatibility?.local_adapter?.status === "available_in_github_repo", json.mcpManifest.mcp_compatibility?.local_adapter?.status);
check("mcp_draft_nopublish", /nopublish|no.?publish|not.?publish|registry.*false/i.test(text.mcpDraft), "mcp draft publication guard");

const hardBlocks = json.backlog.hard_blocks || [];
check(
  "backlog_hard_blocks_core",
  hasAll(hardBlocks, ["no_real_payments", "no_external_outreach", "no_real_data_processing", "no_personal_data_processing", "no_public_paid_marketplace", "no_hosted_mcp_public", "no_commercial_go_live"]),
  hardBlocks.join(", ")
);

const global = Object.values(text).join("\n").toLowerCase();
const forbiddenClaims = [
  "commercial_status\": \"live\"",
  "go_live_decision\": \"go\"",
  "real payment executed\": true",
  "live_payment_allowed\": true",
  "human_outreach_allowed\": true",
  "personal_data_allowed\": true",
  "hosted_public_mcp_server_live\": true"
];
for (const claim of forbiddenClaims) {
  check(`forbidden_absent_${claim.replace(/[^a-z0-9]+/gi, "_").slice(0, 50)}`, !global.includes(claim.toLowerCase()), claim);
}

const findings = [];
if (!contains("readme", "live payments, invoices, subscriptions and production keys: blocked")) {
  findings.push({
    severity: "P2",
    area: "README",
    issue: "README does not contain the exact consolidated blocked-commerce sentence, although it contains multiple equivalent blocks.",
    recommendation: "Keep as observation only unless wording clarity becomes a user concern."
  });
}
if (!contains("openapi", "no real payment") && !contains("openapi", "does not execute real payment")) {
  findings.push({
    severity: "P2",
    area: "OpenAPI",
    issue: "OpenAPI contains beta and purchase-intent semantics, but the exact no-real-payment wording is stronger in catalog/Postman than in the API info block.",
    recommendation: "Consider a later wording-only OpenAPI description alignment if public sandbox docs are owner-approved."
  });
}

const errors = checks.filter((item) => !item.ok);
const summary = {
  probe_id: "internal_contract_consistency_probe_nowrite_20260614",
  created_at: new Date().toISOString(),
  mode: "NoWrite internal contract consistency probe",
  commercial_status: "not_live",
  go_live_decision: "no_go",
  files_checked: coreFiles,
  checks_total: checks.length,
  checks_failed: errors.length,
  findings,
  interpretation: errors.length === 0
    ? "Core machine-first, beta, credit, purchase-intent and hard-block semantics are consistent enough for internal testing. Minor wording observations remain non-blocking."
    : "One or more core consistency checks failed and should be remediated before further test expansion.",
  recommended_next_step: errors.length === 0 ? "sandbox_api_safety_regression_nowrite" : "internal_contract_consistency_remediation_nowrite",
  checks
};

const report = [
  "# Internal Contract Consistency Probe NoWrite - 2026-06-14",
  "",
  `Mode: ${summary.mode}`,
  `Commercial status: ${summary.commercial_status}`,
  `Go-live decision: ${summary.go_live_decision}`,
  "",
  `Files checked: ${coreFiles.length}`,
  `Checks: ${checks.length}`,
  `Errors: ${errors.length}`,
  `Findings: ${findings.length}`,
  "",
  `Result: ${errors.length === 0 ? "PASS" : "FAIL"}`,
  "",
  "## Interpretation",
  "",
  summary.interpretation,
  "",
  "## Findings",
  "",
  findings.length ? findings.map((item) => `- ${item.severity} ${item.area}: ${item.issue} Recommendation: ${item.recommendation}`).join("\n") : "None.",
  "",
  "## Errors",
  "",
  errors.length ? errors.map((item) => `- ${item.name}: ${item.detail}`).join("\n") : "None.",
  "",
  "## Recommended Next Step",
  "",
  summary.recommended_next_step
].join("\n");

fs.writeFileSync(reportPath, report);
fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));

console.log(report);
if (errors.length) {
  process.exit(1);
}
