import { writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const packDir = path.join(root, "private-evaluator-pack");
const summaryPath = path.join(packDir, "public_machine_readability_probe_summary_20260613.json");
const reportPath = path.join(packDir, "public_machine_readability_probe_report_20260613.md");

const resources = {
  homepage: "https://machinesignal.it/",
  robots: "https://machinesignal.it/robots.txt",
  llms: "https://machinesignal.it/llms.txt",
  machine_onboarding: "https://machinesignal.it/machine-onboarding.json",
  product_catalog: "https://machinesignal.it/product-catalog.json",
  openapi: "https://machinesignal.it/openapi.json",
  mcp_manifest: "https://machinesignal.it/mcp-tool-manifest.json",
  well_known_manifest: "https://machinesignal.it/.well-known/mcp-tool-manifest.json",
  github_readme:
    "https://raw.githubusercontent.com/machinesignal-it/machinesignal-lead-opportunity-score/main/README.md",
  github_machine_entrypoint:
    "https://raw.githubusercontent.com/machinesignal-it/machinesignal-lead-opportunity-score/main/MACHINE_AGENT_ENTRYPOINT.md",
};

const forbiddenPositiveClaimPatterns = [
  /guaranteed\s+revenue/i,
  /automatic\s+income/i,
  /passive\s+income/i,
  /production\s+keys\s+available/i,
  /automatic\s+email\s+outreach/i,
  /human\s+sales\s+outreach/i,
  /processing\s+real\s+customer\s+data/i,
  /processing\s+personal\s+data/i,
  /hosted\s+public\s+mcp\s+server\s*:\s*live/i,
];

const checks = [];

function addCheck(name, ok, details = "") {
  checks.push({ name, ok: Boolean(ok), details });
}

function get(obj, pathParts) {
  return pathParts.reduce((current, part) => current?.[part], obj);
}

function hasText(text, pattern) {
  return pattern.test(text || "");
}

function textIncludesAll(text, fragments) {
  const lower = (text || "").toLowerCase();
  return fragments.every((fragment) => lower.includes(fragment.toLowerCase()));
}

async function fetchResource(name, url) {
  const response = await fetch(`${url}${url.includes("?") ? "&" : "?"}probe=20260613-${Date.now()}`, {
    headers: {
      Accept: "*/*",
      "Cache-Control": "no-cache",
      "User-Agent": "MachineSignal-Public-Machine-Readability-Probe",
    },
  });
  const text = await response.text();
  return {
    name,
    url,
    status: response.status,
    ok: response.ok,
    contentType: response.headers.get("content-type") || "",
    text,
    bytes: text.length,
    json: (() => {
      try {
        return JSON.parse(text);
      } catch {
        return null;
      }
    })(),
  };
}

const fetchedEntries = await Promise.all(
  Object.entries(resources).map(([name, url]) => fetchResource(name, url))
);
const fetched = Object.fromEntries(fetchedEntries.map((entry) => [entry.name, entry]));

for (const entry of fetchedEntries) {
  addCheck(`${entry.name}_reachable`, entry.ok && entry.status === 200, `HTTP ${entry.status}`);
  addCheck(`${entry.name}_non_empty`, entry.bytes > 200, `${entry.bytes} bytes`);
}

for (const name of ["machine_onboarding", "product_catalog", "openapi", "mcp_manifest", "well_known_manifest"]) {
  addCheck(`${name}_json_valid`, Boolean(fetched[name].json), fetched[name].contentType);
}

const allPublicText = fetchedEntries.map((entry) => entry.text).join("\n\n");

addCheck(
  "public_assets_state_machine_first_customer",
  textIncludesAll(allPublicText, ["machine-first", "primary_customer_interface", "machine"]),
  "machine-first wording and structured interface markers"
);
addCheck(
  "public_assets_explain_human_supervision_only",
  textIncludesAll(allPublicText, ["human_role", "supervision"]) ||
    textIncludesAll(allPublicText, ["Humans supervise", "approval"]),
  "human role is bounded to supervision, approval or audit"
);

const onboarding = fetched.machine_onboarding.json || {};
const catalog = fetched.product_catalog.json || {};
const openapi = fetched.openapi.json || {};
const manifest = fetched.mcp_manifest.json || {};
const wellKnownManifest = fetched.well_known_manifest.json || {};

addCheck(
  "onboarding_has_machine_first_rule",
  /Do not rely on human email persuasion/i.test(onboarding.machine_first_rule || ""),
  onboarding.machine_first_rule || ""
);
addCheck("onboarding_has_base_url", /^https:\/\//.test(onboarding.base_url || ""), onboarding.base_url || "");
addCheck(
  "onboarding_points_to_openapi",
  Boolean(onboarding.discovery?.openapi || allPublicText.includes("/openapi.json")),
  onboarding.discovery?.openapi || ""
);
addCheck(
  "onboarding_points_to_product_catalog",
  Boolean(onboarding.discovery?.product_catalog || allPublicText.includes("/product-catalog.json")),
  onboarding.discovery?.product_catalog || ""
);
addCheck(
  "onboarding_points_to_well_known_machine_discovery",
  Boolean(onboarding.discovery?.well_known_machine_discovery),
  onboarding.discovery?.well_known_machine_discovery || ""
);

const scenarios = catalog.machine_buying_scenarios || {};
addCheck(
  "catalog_has_existing_list_scenario",
  Boolean(scenarios.customer_has_list?.first_call && scenarios.customer_has_list?.first_product),
  JSON.stringify(scenarios.customer_has_list || {})
);
addCheck(
  "catalog_has_no_list_scenario",
  Boolean(scenarios.customer_has_no_list?.first_call && scenarios.customer_has_no_list?.first_product),
  JSON.stringify(scenarios.customer_has_no_list || {})
);
addCheck(
  "catalog_no_list_requires_market_area_objective",
  ["market", "area", "commercial_objective"].every((field) =>
    (scenarios.customer_has_no_list?.required_inputs || []).includes(field)
  ),
  JSON.stringify(scenarios.customer_has_no_list?.required_inputs || [])
);
addCheck(
  "catalog_has_next_action_scenario",
  Boolean(scenarios.customer_wants_next_action?.first_call && scenarios.customer_wants_next_action?.first_product),
  JSON.stringify(scenarios.customer_wants_next_action || {})
);

const products = catalog.products || {};
const requiredProducts = [
  "target_discovery_pack_250",
  "score_pack_1k",
  "domain_enrichment_pack_100",
  "deep_analysis_pack_100",
  "action_pack_25",
  "opportunity_feed_monthly",
  "api_starter_monthly",
  "api_pro_monthly",
];
for (const productCode of requiredProducts) {
  const product = products[productCode];
  addCheck(`${productCode}_exists`, Boolean(product), productCode);
  addCheck(`${productCode}_has_price_or_quote`, Boolean(product?.price_eur || product?.price_eur_from), product?.name || "");
  addCheck(`${productCode}_has_when_to_buy`, Boolean(product?.when_to_buy), product?.when_to_buy || "");
  addCheck(
    `${productCode}_has_machine_output`,
    Boolean(product?.machine_output),
    product?.machine_output || ""
  );
  addCheck(
    `${productCode}_has_validity_rule`,
    Boolean(product?.validity_rule),
    product?.validity_rule || ""
  );
}

const openapiPaths = Object.keys(openapi.paths || {});
const requiredPaths = [
  "/v1/lead-opportunity-score",
  "/v1/purchase-intent",
  "/v1/sandbox/customers",
  "/v1/orders/{order_intent_id}",
];
for (const apiPath of requiredPaths) {
  addCheck(`openapi_has_${apiPath}`, openapiPaths.includes(apiPath), apiPath);
}

const purchaseIntentProps = get(openapi, [
  "components",
  "schemas",
  "PurchaseIntentRequest",
  "properties",
]) || {};
for (const field of ["market", "area", "commercial_objective"]) {
  addCheck(`openapi_purchase_intent_has_${field}`, Boolean(purchaseIntentProps[field]), field);
}

const tools = manifest.tools || [];
const wellKnownTools = wellKnownManifest.tools || [];
const toolNames = tools.map((tool) => tool.name);
const wellKnownToolNames = wellKnownTools.map((tool) => tool.name);
const requiredTools = [
  "score_lead_opportunity",
  "create_purchase_intent",
  "create_sandbox_customer",
  "get_order",
];
for (const toolName of requiredTools) {
  addCheck(`mcp_manifest_has_${toolName}`, toolNames.includes(toolName), toolName);
  addCheck(`well_known_manifest_has_${toolName}`, wellKnownToolNames.includes(toolName), toolName);
}
addCheck(
  "root_and_well_known_tool_names_match",
  JSON.stringify([...toolNames].sort()) === JSON.stringify([...wellKnownToolNames].sort()),
  `${toolNames.length} root tools, ${wellKnownToolNames.length} well-known tools`
);

const gitHubEntrypoint = fetched.github_machine_entrypoint.text || "";
addCheck(
  "github_entrypoint_has_fast_path",
  textIncludesAll(gitHubEntrypoint, ["Fast Path", "product-catalog.json", "openapi.json", "mcp-tool-manifest.json"]),
  "machine evaluator reading order"
);
addCheck(
  "github_entrypoint_blocks_external_publication",
  textIncludesAll(gitHubEntrypoint, ["MCP registry submission", "blocked"]) &&
    textIncludesAll(gitHubEntrypoint, ["live payments", "production API key"]),
  "unsafe channels blocked"
);

const safetySignalPatterns = [
  /purchase-intent\s+only/i,
  /real_payment_executed["\s:]+false/i,
  /external_contact_executed["\s:]+false/i,
  /human_outreach_executed["\s:]+false/i,
  /production\s+api\s+key/i,
  /blocked/i,
  /not\s+live/i,
  /no\s+live\s+billing/i,
  /no\s+production\s+keys/i,
  /no\s+real\s+customer\s+data/i,
  /no\s+personal\s+data/i,
  /no\s+human\s+outreach/i,
];
const safetySignalsFound = safetySignalPatterns.filter((pattern) => pattern.test(allPublicText));
addCheck(
  "public_assets_include_safety_signals",
  safetySignalsFound.length >= 6,
  `${safetySignalsFound.length} safety markers found`
);
addCheck(
  "public_assets_have_no_forbidden_positive_claims",
  forbiddenPositiveClaimPatterns.every((pattern) => !pattern.test(allPublicText)),
  "no risky positive commercial or operational claims"
);
addCheck(
  "public_assets_paid_checkout_only_appears_as_blocked_claim",
  !/live\s+paid\s+checkout/i.test(allPublicText) ||
    /claim\s+live\s+paid\s+checkout/i.test(allPublicText) ||
    /live\s+paid\s+checkout[^.\n]*(blocked|not live|disabled|forbidden)/i.test(allPublicText),
  "live paid checkout is not advertised as active"
);

const machineDecision = {
  customer_with_existing_list: {
    understood: Boolean(scenarios.customer_has_list?.first_call && scenarios.customer_has_list?.first_product),
    product: scenarios.customer_has_list?.first_product || null,
    first_call: scenarios.customer_has_list?.first_call || null,
    expected_endpoint_present: openapiPaths.includes("/v1/lead-opportunity-score"),
  },
  customer_without_list: {
    understood: Boolean(scenarios.customer_has_no_list?.first_call && scenarios.customer_has_no_list?.first_product),
    product: scenarios.customer_has_no_list?.first_product || null,
    first_call: scenarios.customer_has_no_list?.first_call || null,
    required_inputs: scenarios.customer_has_no_list?.required_inputs || [],
    expected_endpoint_present: openapiPaths.includes("/v1/purchase-intent"),
  },
  customer_wants_next_action: {
    understood: Boolean(scenarios.customer_wants_next_action?.first_call && scenarios.customer_wants_next_action?.first_product),
    product: scenarios.customer_wants_next_action?.first_product || null,
    first_call: scenarios.customer_wants_next_action?.first_call || null,
    expected_endpoint_present: openapiPaths.includes("/v1/purchase-intent"),
  },
  mcp_client: {
    understood: requiredTools.every((toolName) => toolNames.includes(toolName)),
    tools: requiredTools,
    hosted_mcp_live: false,
    local_adapter_or_manifest_path: "mcp-tool-manifest.json",
  },
};

const failedChecks = checks.filter((check) => !check.ok);
const categoryScores = {
  discoverability: checks.filter((check) =>
    /reachable|non_empty|points_to|fast_path|machine_first/.test(check.name)
  ),
  commercial_clarity: checks.filter((check) =>
    /scenario|exists|has_price|has_when_to_buy|has_machine_output|has_validity_rule/.test(check.name)
  ),
  technical_actionability: checks.filter((check) =>
    /openapi|mcp_manifest|well_known_manifest|tool_names_match/.test(check.name)
  ),
  safety_boundedness: checks.filter((check) =>
    /safety|forbidden|blocks|human_supervision/.test(check.name)
  ),
};
const categorySummary = Object.fromEntries(
  Object.entries(categoryScores).map(([name, categoryChecks]) => {
    const failed = categoryChecks.filter((check) => !check.ok).length;
    return [
      name,
      {
        checks_total: categoryChecks.length,
        checks_failed: failed,
        score_pct:
          categoryChecks.length === 0
            ? 0
            : Math.round(((categoryChecks.length - failed) / categoryChecks.length) * 100),
      },
    ];
  })
);

const summary = {
  date: "2026-06-13",
  status: failedChecks.length === 0 ? "passed" : "failed",
  purpose:
    "Simulate a machine evaluator discovering MachineSignal from public assets and deciding what product or endpoint to use.",
  mode: "NoWritePublicMachineReadabilityProbe",
  resources_checked: Object.keys(resources).length,
  category_summary: categorySummary,
  machine_decision: machineDecision,
  safety: {
    write_calls_executed: 0,
    post_calls_executed: 0,
    real_payment_executed: false,
    real_invoice_issued: false,
    external_contact_executed: false,
    human_outreach_executed: false,
    external_publication_executed: false,
    live_monetization_enabled: false,
    production_api_key_published: false,
    personal_data_used: false,
    real_customer_data_used: false,
  },
  checks_total: checks.length,
  checks_failed: failedChecks.length,
  checks,
  next_action_if_passed: "run_agent_go_no_go_review_for_soft_go_live_readiness",
  next_action_if_failed: "repair_public_docs_machine_clarity_before_any_soft_go_live_review",
};

await writeFile(summaryPath, `${JSON.stringify(summary, null, 2)}\n`);

const report = [
  "# Public Machine Readability Probe",
  "",
  "Date: 2026-06-13",
  "",
  `Status: ${summary.status}`,
  "",
  "This probe simulates a machine evaluator reading MachineSignal's public assets without human explanation.",
  "",
  "## Result",
  "",
  `- resources checked: ${summary.resources_checked}`,
  `- checks total: ${summary.checks_total}`,
  `- checks failed: ${summary.checks_failed}`,
  `- write calls executed: ${summary.safety.write_calls_executed}`,
  `- post calls executed: ${summary.safety.post_calls_executed}`,
  `- real payment executed: ${summary.safety.real_payment_executed}`,
  `- human outreach executed: ${summary.safety.human_outreach_executed}`,
  `- external publication executed: ${summary.safety.external_publication_executed}`,
  "",
  "## Category Scores",
  "",
  ...Object.entries(categorySummary).map(
    ([name, value]) =>
      `- ${name}: ${value.score_pct}% (${value.checks_total - value.checks_failed}/${value.checks_total})`
  ),
  "",
  "## Machine Decision",
  "",
  `- existing list: ${machineDecision.customer_with_existing_list.product} via ${machineDecision.customer_with_existing_list.first_call}`,
  `- no list: ${machineDecision.customer_without_list.product} via ${machineDecision.customer_without_list.first_call}`,
  `- next action: ${machineDecision.customer_wants_next_action.product} via ${machineDecision.customer_wants_next_action.first_call}`,
  `- MCP client: ${machineDecision.mcp_client.understood ? "manifest/tools understood" : "not understood"}`,
  "",
  "## Interpretation",
  "",
  failedChecks.length === 0
    ? "A machine evaluator can discover the service, understand the main buying scenarios, identify the right products and map them to OpenAPI or MCP-readable actions without human outreach."
    : "The public machine-readable path is incomplete and should be repaired before any soft go-live readiness review.",
  "",
  "## Next",
  "",
  `Allowed: ${summary.next_action_if_passed}`,
  "",
  `Blocked if failed: ${summary.next_action_if_failed}`,
  "",
  "## Failed Checks",
  "",
  ...(failedChecks.length === 0
    ? ["None."]
    : failedChecks.map((check) => `- ${check.name}: ${check.details}`)),
  "",
].join("\n");

await writeFile(reportPath, report);

console.log(JSON.stringify(summary, null, 2));
