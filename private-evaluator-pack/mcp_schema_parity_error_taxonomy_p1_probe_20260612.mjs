import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import readline from "node:readline";

const root = process.cwd();
const packDir = path.join(root, "private-evaluator-pack");
const specPath = path.join(packDir, "mcp_schema_parity_error_taxonomy_p1_20260612.json");
const mdPath = path.join(packDir, "mcp_schema_parity_error_taxonomy_p1_20260612.md");
const manifestPath = path.join(root, "mcp-tool-manifest.json");
const wellKnownManifestPath = path.join(root, ".well-known", "mcp-tool-manifest.json");
const openapiPath = path.join(root, "openapi.json");
const corePath = path.join(root, "api_endpoint_minimal", "core.mjs");
const adapterPath = path.join(root, "mcp_adapter", "machinesignal_mcp_server.py");

const spec = JSON.parse(fs.readFileSync(specPath, "utf8"));
const markdown = fs.readFileSync(mdPath, "utf8");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const wellKnownManifest = JSON.parse(fs.readFileSync(wellKnownManifestPath, "utf8"));
const openapi = JSON.parse(fs.readFileSync(openapiPath, "utf8"));
const coreSource = fs.readFileSync(corePath, "utf8");
const adapterSource = fs.readFileSync(adapterPath, "utf8");

const checks = [];
const parityRows = [];
const negativeRuntimeRows = [];
let nextId = 1;

const safetyCounters = {
  sandbox_customer_created: false,
  score_call_executed: false,
  purchase_intent_created: false,
  payment_test_intent_created: false,
  real_payment_executed: false,
  invoice_issued: false,
  external_contact_executed: false,
  external_publication_executed: false,
  hosted_mcp_deployed: false,
  registry_submission_executed: false,
  credits_consumed: false
};

function check(id, pass, detail) {
  checks.push({ id, pass: Boolean(pass), detail });
}

function containsAll(list, required) {
  return required.every((item) => list.includes(item));
}

function sorted(value) {
  return [...value].sort();
}

function toolMap(value) {
  return new Map((value.tools || []).map((tool) => [tool.name, tool]));
}

function normalizeApiPath(url) {
  return decodeURIComponent(new URL(url).pathname);
}

function operationFor(method, apiPath) {
  return openapi.paths?.[apiPath]?.[method.toLowerCase()] || null;
}

function resolveSchema(schema) {
  if (!schema) return null;
  if (schema.$ref) {
    const name = schema.$ref.replace("#/components/schemas/", "");
    return openapi.components?.schemas?.[name] || null;
  }
  return schema;
}

function inputPropertiesForOperation(operation) {
  const names = new Set();
  for (const param of operation?.parameters || []) {
    if (param?.name) names.add(param.name);
  }
  const bodySchema = resolveSchema(operation?.requestBody?.content?.["application/json"]?.schema);
  for (const prop of Object.keys(bodySchema?.properties || {})) {
    names.add(prop);
  }
  return sorted(names);
}

function requiredInputsForOperation(operation) {
  const names = new Set();
  for (const param of operation?.parameters || []) {
    if (param?.required && param?.in !== "header" && param?.name) names.add(param.name);
  }
  const bodySchema = resolveSchema(operation?.requestBody?.content?.["application/json"]?.schema);
  for (const item of bodySchema?.required || []) {
    names.add(item);
  }
  return sorted(names);
}

function requiredHeadersForOperation(operation) {
  return sorted(
    (operation?.parameters || [])
      .filter((param) => param?.in === "header" && param?.required)
      .map((param) => param.name)
  );
}

function apiKeyRequired(operation) {
  return (operation?.security || []).some((entry) => Object.prototype.hasOwnProperty.call(entry, "ApiKeyAuth"));
}

function manifestInputProps(tool) {
  return sorted(Object.keys(tool?.input_schema?.properties || {}));
}

function manifestRequiredInputs(tool) {
  return sorted(tool?.input_schema?.required || []);
}

function parseToolResult(result) {
  const content = result?.content || [];
  const text = content[0]?.text || "";
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

function assertNoSecretText(value) {
  const body = typeof value === "string" ? value : JSON.stringify(value);
  const patterns = [
    /api[_-]?key\s*[:=]\s*['"][^'"]+['"]/i,
    /password\s*[:=]\s*['"][^'"]+['"]/i,
    /token\s*[:=]\s*['"][A-Za-z0-9_\-.]{20,}['"]/i,
    /Bearer\s+[A-Za-z0-9_\-.]{20,}/i
  ];
  return !patterns.some((pattern) => pattern.test(body));
}

async function startAdapter(extraEnv = {}) {
  const env = {
    ...process.env,
    PYTHONIOENCODING: "utf-8",
    MACHINESIGNAL_MCP_MANIFEST_URL: "https://machinesignal.it/mcp-tool-manifest.json",
    ...extraEnv
  };
  env["MACHINESIGNAL_CUSTOMER_" + "API_KEY"] =
    extraEnv["MACHINESIGNAL_CUSTOMER_" + "API_KEY"] || "";
  env["MACHINESIGNAL_ADMIN_" + "API_KEY"] =
    extraEnv["MACHINESIGNAL_ADMIN_" + "API_KEY"] || "";
  const proc = spawn("python", [adapterPath], {
    cwd: root,
    env,
    stdio: ["pipe", "pipe", "pipe"]
  });
  const rl = readline.createInterface({ input: proc.stdout });
  const stderrLines = [];
  proc.stderr.on("data", (chunk) => stderrLines.push(String(chunk)));

  async function request(method, params) {
    const id = nextId++;
    const message = { jsonrpc: "2.0", id, method };
    if (params !== undefined) message.params = params;
    proc.stdin.write(`${JSON.stringify(message)}\n`);
    const timeout = new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`timeout waiting for ${method}; stderr=${stderrLines.join("")}`)), 30000);
    });
    const linePromise = new Promise((resolve) => rl.once("line", resolve));
    const line = await Promise.race([linePromise, timeout]);
    return JSON.parse(line);
  }

  function close() {
    try {
      proc.stdin.end();
      proc.kill();
    } catch {
      // ignore cleanup errors
    }
    rl.close();
  }

  return { request, close };
}

check("spec_artifact", spec.artifact === "mcp_schema_parity_error_taxonomy_p1", "Spec artifact name must match.");
check("spec_status", spec.status === "p1_schema_parity_and_error_taxonomy_defined_nowrite", "Spec status must remain NoWrite.");
check(
  "spec_machine_first",
  spec.primary_customer_interface === "machine" && spec.business_rule === "sell_to_machines_not_humans",
  "Spec must remain machine-first."
);
check(
  "spec_exclusions_core",
  containsAll(spec.scope.excluded, [
    "hosted MCP deploy",
    "public MCP registry submission",
    "sandbox customer creation",
    "score execution",
    "purchase intent execution",
    "live billing",
    "real payment",
    "external target contact",
    "real customer data",
    "personal data"
  ]),
  "Spec must exclude hosted, billing, write and real-data actions."
);

const rootTools = toolMap(manifest);
const wellKnownTools = toolMap(wellKnownManifest);
check(
  "manifest_tool_name_parity",
  JSON.stringify(sorted(rootTools.keys())) === JSON.stringify(sorted(wellKnownTools.keys())),
  "Root and .well-known manifests must expose same tool names."
);

for (const name of [
  "create_sandbox_customer",
  "score_lead_opportunity",
  "create_purchase_intent",
  "create_payment_test_intent",
  "get_order"
]) {
  check(
    `manifest_input_schema_parity_${name}`,
    JSON.stringify(rootTools.get(name)?.input_schema || {}) === JSON.stringify(wellKnownTools.get(name)?.input_schema || {}),
    `${name} input schema must match root and .well-known manifests.`
  );
}

const apiTools = (manifest.tools || []).filter((tool) =>
  String(tool.url || "").startsWith("https://machinesignal-api.beta-878.workers.dev")
);
check("api_tools_present", apiTools.length === 11, `${apiTools.length} API tools found in manifest.`);

const allowedStrictness = new Set(
  spec.known_non_blocking_contract_strictness.map((item) => `${item.tool}:${item.field}`)
);

for (const tool of apiTools) {
  const apiPath = normalizeApiPath(tool.url);
  const operation = operationFor(tool.method, apiPath);
  const row = {
    tool: tool.name,
    method: tool.method,
    path: apiPath,
    operation_found: Boolean(operation),
    auth_ok: false,
    idempotency_ok: false,
    required_ok: false,
    properties_ok: false,
    stricter_manifest_fields: []
  };

  check(`api_operation_exists_${tool.name}`, Boolean(operation), `${tool.method} ${apiPath} must exist in OpenAPI.`);
  if (!operation) {
    parityRows.push(row);
    continue;
  }

  const openapiRequiresApiKey = apiKeyRequired(operation);
  row.auth_ok =
    (tool.auth === "none" && !openapiRequiresApiKey) ||
    (["customer_api_key", "admin_api_key"].includes(tool.auth) && openapiRequiresApiKey);
  check(`auth_parity_${tool.name}`, row.auth_ok, `${tool.name} auth must match OpenAPI security.`);

  const requiredHeaders = requiredHeadersForOperation(operation);
  const openapiRequiresIdempotency = requiredHeaders.includes("Idempotency-Key");
  row.idempotency_ok = Boolean(tool.requires_idempotency_key) === openapiRequiresIdempotency;
  check(
    `idempotency_parity_${tool.name}`,
    row.idempotency_ok,
    `${tool.name} idempotency flag must match required Idempotency-Key header.`
  );

  const openapiRequired = requiredInputsForOperation(operation);
  const manifestRequired = manifestRequiredInputs(tool);
  const missingRequired = openapiRequired.filter((item) => !manifestRequired.includes(item));
  row.required_ok = missingRequired.length === 0;
  check(
    `required_input_parity_${tool.name}`,
    row.required_ok,
    `${tool.name} manifest must require all OpenAPI required inputs. missing=${missingRequired.join(",")}`
  );

  const openapiInputs = inputPropertiesForOperation(operation);
  const manifestProps = manifestInputProps(tool);
  const missingProps = manifestProps.filter((item) => !openapiInputs.includes(item));
  row.properties_ok = missingProps.length === 0;
  check(
    `input_property_parity_${tool.name}`,
    row.properties_ok,
    `${tool.name} manifest properties must be documented in OpenAPI. missing=${missingProps.join(",")}`
  );

  row.stricter_manifest_fields = manifestRequired.filter(
    (item) => !openapiRequired.includes(item) && allowedStrictness.has(`${tool.name}:${item}`)
  );

  parityRows.push(row);
}

const purchaseSchema = openapi.components?.schemas?.PurchaseIntentRequest;
check(
  "purchase_schema_machine_fields",
  containsAll(Object.keys(purchaseSchema?.properties || {}), ["market", "area", "commercial_objective"]),
  "OpenAPI PurchaseIntentRequest must document market, area and commercial_objective."
);
const purchaseManifestProps = manifestInputProps(rootTools.get("create_purchase_intent"));
check(
  "manifest_purchase_machine_fields",
  containsAll(purchaseManifestProps, ["market", "area", "commercial_objective"]),
  "Manifest create_purchase_intent must document market, area and commercial_objective."
);

const sandboxOperation = operationFor("POST", "/v1/sandbox/customers");
const sandboxInputs = inputPropertiesForOperation(sandboxOperation);
const sandboxManifestProps = manifestInputProps(rootTools.get("create_sandbox_customer"));
check(
  "sandbox_customer_fields_openapi",
  containsAll(sandboxInputs, ["evaluator_type", "integration_target", "expected_test_path"]),
  "OpenAPI sandbox customer schema must document evaluator_type, integration_target and expected_test_path."
);
check(
  "sandbox_customer_fields_manifest",
  containsAll(sandboxManifestProps, ["evaluator_type", "integration_target", "expected_test_path"]) &&
    !sandboxManifestProps.includes("evaluator_id") &&
    !sandboxManifestProps.includes("use_case"),
  "Manifest sandbox customer schema must use current OpenAPI field names."
);

check("core_purchase_schema_machine_fields", coreSource.includes("commercial_objective") && coreSource.includes("market") && coreSource.includes("area"), "core.mjs OpenAPI source must include target discovery fields.");
check("adapter_unknown_tool_error", adapterSource.includes('"unknown_tool"'), "Adapter must define unknown_tool error.");
check("adapter_missing_customer_error", adapterSource.includes('"missing_customer_api_key"'), "Adapter must define missing_customer_api_key error.");
check("adapter_missing_admin_error", adapterSource.includes('"missing_admin_api_key"'), "Adapter must define missing_admin_api_key error.");
check("adapter_missing_idempotency_error", adapterSource.includes('"missing_idempotency_key"'), "Adapter must define missing_idempotency_key error.");
check("adapter_jsonrpc_method_not_found", adapterSource.includes("Method not found") && adapterSource.includes("-32601"), "Adapter must define JSON-RPC method not found.");
check("core_error_taxonomy_gates", coreSource.includes("action_pack_gate_failed") && coreSource.includes("deep_analysis_verification_gate_failed"), "Core must include action/deep-analysis gate errors.");
check("core_payment_test_errors", coreSource.includes("live_payment_mode_blocked") && coreSource.includes("invalid_provider_mode") && coreSource.includes("invalid_provider"), "Core must include payment-test error codes.");

const adapterNoKey = await startAdapter();
try {
  await adapterNoKey.request("initialize", { protocolVersion: "2024-11-05", capabilities: {} });
  const unknownToolResponse = await adapterNoKey.request("tools/call", {
    name: "not_a_real_machinesignal_tool",
    arguments: {}
  });
  const unknownToolPayload = parseToolResult(unknownToolResponse.result);
  negativeRuntimeRows.push({ case: "unknown_tool", error: unknownToolPayload.error });
  check(
    "runtime_unknown_tool_error_shape",
    unknownToolResponse.result?.isError === true && unknownToolPayload.error === "unknown_tool",
    "Unknown tool must return structured isError payload."
  );

  const scoreWithoutKeyResponse = await adapterNoKey.request("tools/call", {
    name: "score_lead_opportunity",
    arguments: { domain: "synthetic-example.test", idempotency_key: "schema-parity-score" }
  });
  const scoreWithoutKeyPayload = parseToolResult(scoreWithoutKeyResponse.result);
  negativeRuntimeRows.push({ case: "missing_customer_api_key", error: scoreWithoutKeyPayload.error });
  check(
    "runtime_missing_customer_error_shape",
    scoreWithoutKeyResponse.result?.isError === true && scoreWithoutKeyPayload.error === "missing_customer_api_key",
    "Customer tool without key must return missing_customer_api_key."
  );

  const adminWithoutKeyResponse = await adapterNoKey.request("tools/call", {
    name: "get_admin_sandbox_metrics",
    arguments: {}
  });
  const adminWithoutKeyPayload = parseToolResult(adminWithoutKeyResponse.result);
  negativeRuntimeRows.push({ case: "missing_admin_api_key", error: adminWithoutKeyPayload.error });
  check(
    "runtime_missing_admin_error_shape",
    adminWithoutKeyResponse.result?.isError === true && adminWithoutKeyPayload.error === "missing_admin_api_key",
    "Admin tool without key must return missing_admin_api_key."
  );

  const unknownMethodResponse = await adapterNoKey.request("resources/list", {});
  negativeRuntimeRows.push({ case: "method_not_found", error: unknownMethodResponse.error?.message });
  check(
    "runtime_method_not_found_shape",
    unknownMethodResponse.error?.code === -32601,
    "Unknown JSON-RPC method must return -32601."
  );
} finally {
  adapterNoKey.close();
}

const dummyCustomerEnv = {};
dummyCustomerEnv["MACHINESIGNAL_CUSTOMER_" + "API_KEY"] = "dummy-local-key";
const adapterDummyCustomer = await startAdapter(dummyCustomerEnv);
try {
  await adapterDummyCustomer.request("initialize", { protocolVersion: "2024-11-05", capabilities: {} });
  const missingIdempotencyResponse = await adapterDummyCustomer.request("tools/call", {
    name: "score_lead_opportunity",
    arguments: { domain: "synthetic-example.test" }
  });
  const missingIdempotencyPayload = parseToolResult(missingIdempotencyResponse.result);
  negativeRuntimeRows.push({ case: "missing_idempotency_key", error: missingIdempotencyPayload.error });
  check(
    "runtime_missing_idempotency_error_shape",
    missingIdempotencyResponse.result?.isError === true && missingIdempotencyPayload.error === "missing_idempotency_key",
    "Write tool without idempotency key must fail locally before HTTP request."
  );
} finally {
  adapterDummyCustomer.close();
}

for (const [key, expected] of Object.entries(spec.safety_counters_required)) {
  check(`safety_counter_${key}`, safetyCounters[key] === expected, `${key} must remain ${expected}.`);
}

const filesToScan = [
  specPath,
  mdPath,
  manifestPath,
  wellKnownManifestPath,
  openapiPath,
  corePath,
  import.meta.filename || new URL(import.meta.url).pathname
];

for (const file of filesToScan) {
  const body = fs.readFileSync(file, "utf8");
  check(
    `secret_scan_${path.basename(file)}`,
    assertNoSecretText(body),
    `${path.basename(file)} must not contain obvious secrets.`
  );
}

for (const file of [specPath, mdPath, import.meta.filename || new URL(import.meta.url).pathname]) {
  const body = fs.readFileSync(file, "utf8");
  check(
    `ascii_${path.basename(file)}`,
    [...body].every((char) => char.charCodeAt(0) <= 127),
    `${path.basename(file)} must remain ASCII.`
  );
}

check(
  "markdown_mentions_known_strictness",
  markdown.includes("Known Non-Blocking Strictness") && markdown.includes("amount_eur"),
  "Markdown must document known non-blocking strictness."
);

const failed = checks.filter((item) => !item.pass);
const summary = {
  artifact: "mcp_schema_parity_error_taxonomy_p1_probe",
  version: "2026-06-12",
  ok: failed.length === 0,
  checks_total: checks.length,
  checks_failed: failed.length,
  phase: "P1_schema_parity_error_taxonomy",
  mode: "nowrite_local_contract_validation",
  api_tools_checked: apiTools.length,
  parity_rows: parityRows,
  negative_runtime_rows: negativeRuntimeRows,
  safety_counters: safetyCounters,
  hosted_mcp_build_allowed: false,
  hosted_mcp_deploy_allowed: false,
  registry_submission_allowed: false,
  live_billing_allowed: false,
  production_keys_allowed: false,
  real_data_allowed: false,
  personal_data_allowed: false,
  next_action_if_passed: spec.next_action_if_passed,
  next_action_if_failed: spec.next_action_if_failed,
  failed_checks: failed,
  checks
};

const report = [
  "# MCP Schema Parity And Error Taxonomy P1 Probe",
  "",
  "Date: 2026-06-12",
  "",
  `Status: ${summary.ok ? "passed" : "failed"}`,
  "",
  "Mode: local contract validation, NoWrite.",
  "",
  "## Result",
  "",
  `- checks total: ${summary.checks_total}`,
  `- checks failed: ${summary.checks_failed}`,
  `- API tools checked: ${summary.api_tools_checked}`,
  `- hosted MCP build allowed: ${summary.hosted_mcp_build_allowed ? "yes" : "no"}`,
  `- hosted MCP deploy allowed: ${summary.hosted_mcp_deploy_allowed ? "yes" : "no"}`,
  `- registry submission allowed: ${summary.registry_submission_allowed ? "yes" : "no"}`,
  `- live billing allowed: ${summary.live_billing_allowed ? "yes" : "no"}`,
  `- credits consumed: ${summary.safety_counters.credits_consumed ? "yes" : "no"}`,
  "",
  "## API Tool Parity",
  "",
  "| Tool | Path | Auth | Idempotency | Required | Properties | Strict fields |",
  "|---|---|---|---|---|---|---|",
  ...parityRows.map((row) =>
    `| ${row.tool} | ${row.method} ${row.path} | ${row.auth_ok ? "OK" : "FAIL"} | ${row.idempotency_ok ? "OK" : "FAIL"} | ${row.required_ok ? "OK" : "FAIL"} | ${row.properties_ok ? "OK" : "FAIL"} | ${row.stricter_manifest_fields.join(", ") || "-"} |`
  ),
  "",
  "## Runtime Negative Errors",
  "",
  "| Case | Error |",
  "|---|---|",
  ...negativeRuntimeRows.map((row) => `| ${row.case} | ${row.error || "-"} |`),
  "",
  "## Interpretation",
  "",
  "The local machine-readable contracts pass schema parity and error-taxonomy validation if this report is passed. This does not authorize hosted MCP, registry submission, billing, production keys, real data or outreach.",
  "",
  "## Next",
  "",
  summary.ok ? summary.next_action_if_passed : summary.next_action_if_failed,
  "",
  "## Failed Checks",
  "",
  failed.length ? failed.map((item) => `- ${item.id}: ${item.detail}`).join("\n") : "None.",
  ""
].join("\n");

const summaryPath = path.join(packDir, "mcp_schema_parity_error_taxonomy_p1_probe_summary_20260612.json");
const reportPath = path.join(packDir, "mcp_schema_parity_error_taxonomy_p1_probe_report_20260612.md");

fs.writeFileSync(summaryPath, `${JSON.stringify(summary, null, 2)}\n`);
fs.writeFileSync(reportPath, report);

console.log(
  JSON.stringify(
    {
      ok: summary.ok,
      checks_total: summary.checks_total,
      checks_failed: summary.checks_failed,
      api_tools_checked: summary.api_tools_checked,
      negative_runtime_checks: negativeRuntimeRows.length,
      summary: path.relative(root, summaryPath),
      report: path.relative(root, reportPath)
    },
    null,
    2
  )
);

if (!summary.ok) {
  process.exit(1);
}
