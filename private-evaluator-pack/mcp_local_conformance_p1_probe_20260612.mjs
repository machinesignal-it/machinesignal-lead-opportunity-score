import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import readline from "node:readline";

const root = process.cwd();
const packDir = path.join(root, "private-evaluator-pack");
const specPath = path.join(packDir, "mcp_local_conformance_p1_20260612.json");
const mdPath = path.join(packDir, "mcp_local_conformance_p1_20260612.md");
const manifestPath = path.join(root, "mcp-tool-manifest.json");
const wellKnownManifestPath = path.join(root, ".well-known", "mcp-tool-manifest.json");
const adapterPath = path.join(root, "mcp_adapter", "machinesignal_mcp_server.py");
const readmePath = path.join(root, "mcp_adapter", "README.md");
const clientConfigPath = path.join(root, "mcp_adapter", "mcp_client_config.example.json");

const spec = JSON.parse(fs.readFileSync(specPath, "utf8"));
const markdown = fs.readFileSync(mdPath, "utf8");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const wellKnownManifest = JSON.parse(fs.readFileSync(wellKnownManifestPath, "utf8"));
const adapterSource = fs.readFileSync(adapterPath, "utf8");
const readme = fs.readFileSync(readmePath, "utf8");
const clientConfig = JSON.parse(fs.readFileSync(clientConfigPath, "utf8"));

const checks = [];
const publicToolCalls = [];
const negativeToolCalls = [];
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

function parseToolResult(result) {
  const content = result?.content || [];
  const text = content[0]?.text || "";
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

function toolNamesFromManifest(value) {
  return (value.tools || []).map((tool) => tool.name).filter(Boolean).sort();
}

function sameArray(a, b) {
  return a.length === b.length && a.every((item, index) => item === b[index]);
}

function containsAll(list, required) {
  return required.every((item) => list.includes(item));
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

async function startAdapter() {
  const env = {
    ...process.env,
    PYTHONIOENCODING: "utf-8",
    MACHINESIGNAL_MCP_MANIFEST_URL: "https://machinesignal.it/mcp-tool-manifest.json",
    MACHINESIGNAL_CUSTOMER_API_KEY: "",
    MACHINESIGNAL_ADMIN_API_KEY: ""
  };
  const proc = spawn("python", [adapterPath], {
    cwd: root,
    env,
    stdio: ["pipe", "pipe", "pipe"]
  });
  const rl = readline.createInterface({ input: proc.stdout });
  const stderrLines = [];
  proc.stderr.on("data", (chunk) => stderrLines.push(String(chunk)));

  function close() {
    try {
      proc.stdin.end();
      proc.kill();
    } catch {
      // ignore cleanup errors
    }
    rl.close();
  }

  async function request(method, params) {
    const id = nextId++;
    const message = { jsonrpc: "2.0", id, method };
    if (params !== undefined) {
      message.params = params;
    }
    proc.stdin.write(`${JSON.stringify(message)}\n`);
    const timeout = new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`timeout waiting for ${method}; stderr=${stderrLines.join("")}`)), 30000);
    });
    const responseLine = new Promise((resolve) => {
      rl.once("line", resolve);
    });
    const line = await Promise.race([responseLine, timeout]);
    return JSON.parse(line);
  }

  function notify(method, params) {
    const message = { jsonrpc: "2.0", method };
    if (params !== undefined) {
      message.params = params;
    }
    proc.stdin.write(`${JSON.stringify(message)}\n`);
  }

  return { proc, request, notify, close };
}

check("spec_artifact", spec.artifact === "mcp_local_conformance_p1", "P1 artifact must be named correctly.");
check("spec_status", spec.status === "p1_local_conformance_defined_no_write", "P1 status must be NoWrite.");
check(
  "spec_machine_first",
  spec.primary_customer_interface === "machine" && spec.business_rule === "sell_to_machines_not_humans",
  "P1 must remain machine-first."
);
check(
  "spec_blocks_hosted_and_billing",
  containsAll(spec.decision.blocked_now, [
    "hosted MCP build",
    "hosted MCP deploy",
    "public MCP registry submission",
    "live billing",
    "real payment",
    "invoice",
    "external target contact",
    "real customer data",
    "personal data"
  ]),
  "P1 must explicitly block hosted MCP, billing, outreach and real data."
);
check(
  "manifest_hosted_false",
  manifest.mcp_compatibility?.public_mcp_server_live === false,
  "Manifest must say hosted public MCP is not live."
);
check(
  "manifest_adapter_required",
  manifest.mcp_compatibility?.adapter_required === true,
  "Manifest must require adapter for MCP compatibility."
);
check(
  "manifest_local_adapter_status",
  manifest.mcp_compatibility?.local_adapter?.status === "available_in_github_repo" &&
    manifest.mcp_compatibility?.local_adapter?.transport === "stdio_json_rpc",
  "Manifest must point to local stdio adapter."
);
check(
  "manifest_guardrails_false",
  manifest.mcp_compatibility?.local_adapter?.full_api_keys_returned_to_client === false &&
    manifest.mcp_compatibility?.local_adapter?.real_payment_executed_in_beta === false &&
    manifest.mcp_compatibility?.local_adapter?.external_contact_executed_in_beta === false,
  "Manifest guardrails must keep keys hidden, real payment false and external contact false."
);
check(
  "well_known_manifest_parity",
  sameArray(toolNamesFromManifest(manifest), toolNamesFromManifest(wellKnownManifest)),
  ".well-known manifest must expose same tool names as root manifest."
);

const manifestToolNames = toolNamesFromManifest(manifest);
check(
  "manifest_core_public_tools",
  containsAll(manifestToolNames, spec.manifest_conformance_requirements.public_read_tools_must_be_callable_without_auth),
  "Manifest must include required public read tools."
);
check(
  "manifest_core_protected_tools",
  containsAll(manifestToolNames, spec.manifest_conformance_requirements.protected_tools_must_fail_without_credentials),
  "Manifest must include required protected tools."
);

for (const toolName of spec.manifest_conformance_requirements.idempotency_tools_must_expose_idempotency_key) {
  const tool = (manifest.tools || []).find((item) => item.name === toolName);
  check(
    `manifest_requires_idempotency_${toolName}`,
    Boolean(tool?.requires_idempotency_key),
    `${toolName} must require idempotency in manifest.`
  );
}

check("adapter_file_exists", fs.existsSync(adapterPath), "Adapter file must exist.");
check("adapter_supports_initialize", adapterSource.includes('method == "initialize"'), "Adapter must support initialize.");
check("adapter_supports_tools_list", adapterSource.includes('method == "tools/list"'), "Adapter must support tools/list.");
check("adapter_supports_tools_call", adapterSource.includes('method == "tools/call"'), "Adapter must support tools/call.");
check("adapter_redacts_secrets", adapterSource.includes("redact_secrets") && adapterSource.includes("SECRET_KEYS"), "Adapter must redact secrets.");
check("adapter_notification_no_response", adapterSource.includes("notifications/") && adapterSource.includes("continue"), "Adapter must ignore notifications.");
check(
  "client_config_points_to_adapter",
  clientConfig.mcpServers?.machinesignal?.args?.includes("mcp_adapter/machinesignal_mcp_server.py"),
  "Client config must point to local adapter."
);
check(
  "readme_guardrails",
  readme.includes("Hosted public MCP server: not live yet.") &&
    readme.includes("No real payment is executed in beta.") &&
    readme.includes("No external contact is executed."),
  "README must keep hosted MCP and unsafe actions blocked."
);

const adapter = await startAdapter();
try {
  const initResponse = await adapter.request("initialize", {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: { name: "machinesignal-p1-local-conformance-probe", version: "2026-06-12" }
  });
  check(
    "runtime_initialize_result",
    initResponse.result?.serverInfo?.name === "machinesignal-local-mcp-adapter" &&
      Boolean(initResponse.result?.capabilities?.tools),
    "initialize must return serverInfo and tools capability."
  );

  adapter.notify("notifications/initialized");

  const toolsListResponse = await adapter.request("tools/list");
  const tools = toolsListResponse.result?.tools || [];
  const adapterToolNames = tools.map((tool) => tool.name).filter(Boolean).sort();
  check("runtime_tools_list_count", tools.length >= 30, `${tools.length} tools listed.`);
  check(
    "runtime_tools_list_core_parity",
    containsAll(adapterToolNames, spec.manifest_conformance_requirements.public_read_tools_must_be_callable_without_auth) &&
      containsAll(adapterToolNames, spec.manifest_conformance_requirements.protected_tools_must_fail_without_credentials),
    "Adapter tools/list must include core public and protected tools."
  );
  check(
    "runtime_tools_have_schemas",
    tools.every((tool) => tool.name && tool.description && tool.inputSchema?.type === "object"),
    "Every listed tool must have name, description and object inputSchema."
  );

  for (const toolName of spec.manifest_conformance_requirements.idempotency_tools_must_expose_idempotency_key) {
    const tool = tools.find((item) => item.name === toolName);
    check(
      `runtime_idempotency_in_schema_${toolName}`,
      Boolean(tool?.inputSchema?.properties?.idempotency_key) &&
        (tool?.inputSchema?.required || []).includes("idempotency_key"),
      `${toolName} must expose required idempotency_key through adapter schema.`
    );
  }

  for (const toolName of spec.manifest_conformance_requirements.public_read_tools_must_be_callable_without_auth) {
    const response = await adapter.request("tools/call", { name: toolName, arguments: {} });
    const parsed = parseToolResult(response.result);
    publicToolCalls.push({
      tool: toolName,
      isError: response.result?.isError === true,
      ok: parsed.ok === true,
      http_status: parsed.http_status,
      auth: parsed.auth
    });
    check(
      `runtime_public_call_${toolName}`,
      response.result?.isError !== true && parsed.ok === true && parsed.auth === "none" && parsed.http_status >= 200 && parsed.http_status < 300,
      `${toolName} must return OK without auth.`
    );
  }

  const unknownToolResponse = await adapter.request("tools/call", {
    name: "not_a_real_machinesignal_tool",
    arguments: {}
  });
  const unknownToolPayload = parseToolResult(unknownToolResponse.result);
  negativeToolCalls.push({ case: "unknown_tool", payload: unknownToolPayload });
  check(
    "runtime_unknown_tool_structured_error",
    unknownToolResponse.result?.isError === true && unknownToolPayload.error === "unknown_tool",
    "Unknown tool must return structured isError result."
  );

  const scoreWithoutKeyResponse = await adapter.request("tools/call", {
    name: "score_lead_opportunity",
    arguments: { domain: "synthetic-example.test", idempotency_key: "p1-local-no-write-score" }
  });
  const scoreWithoutKeyPayload = parseToolResult(scoreWithoutKeyResponse.result);
  negativeToolCalls.push({ case: "score_without_customer_key", payload: scoreWithoutKeyPayload });
  check(
    "runtime_score_without_key_blocked",
    scoreWithoutKeyResponse.result?.isError === true && scoreWithoutKeyPayload.error === "missing_customer_api_key",
    "Score must fail locally without customer key."
  );

  const purchaseWithoutKeyResponse = await adapter.request("tools/call", {
    name: "create_purchase_intent",
    arguments: { product_code: "deep_analysis", domain: "synthetic-example.test", idempotency_key: "p1-local-no-write-purchase" }
  });
  const purchaseWithoutKeyPayload = parseToolResult(purchaseWithoutKeyResponse.result);
  negativeToolCalls.push({ case: "purchase_without_customer_key", payload: purchaseWithoutKeyPayload });
  check(
    "runtime_purchase_without_key_blocked",
    purchaseWithoutKeyResponse.result?.isError === true && purchaseWithoutKeyPayload.error === "missing_customer_api_key",
    "Purchase intent must fail locally without customer key."
  );

  const getOrderWithoutKeyResponse = await adapter.request("tools/call", {
    name: "get_order",
    arguments: { order_intent_id: "synthetic-order" }
  });
  const getOrderWithoutKeyPayload = parseToolResult(getOrderWithoutKeyResponse.result);
  negativeToolCalls.push({ case: "get_order_without_customer_key", payload: getOrderWithoutKeyPayload });
  check(
    "runtime_get_order_without_key_blocked",
    getOrderWithoutKeyResponse.result?.isError === true && getOrderWithoutKeyPayload.error === "missing_customer_api_key",
    "Order read must fail locally without customer key."
  );

  const adminWithoutKeyResponse = await adapter.request("tools/call", {
    name: "get_admin_sandbox_metrics",
    arguments: {}
  });
  const adminWithoutKeyPayload = parseToolResult(adminWithoutKeyResponse.result);
  negativeToolCalls.push({ case: "admin_without_key", payload: adminWithoutKeyPayload });
  check(
    "runtime_admin_without_key_blocked",
    adminWithoutKeyResponse.result?.isError === true && adminWithoutKeyPayload.error === "missing_admin_api_key",
    "Admin metrics must fail locally without admin key."
  );

  const methodNotFoundResponse = await adapter.request("resources/list", {});
  check(
    "runtime_unknown_method_jsonrpc_error",
    methodNotFoundResponse.error?.code === -32601,
    "Unknown JSON-RPC method must return Method not found."
  );
} finally {
  adapter.close();
}

for (const [key, expected] of Object.entries(spec.safety_counters_required)) {
  check(
    `safety_counter_${key}`,
    safetyCounters[key] === expected,
    `${key} must remain ${expected}.`
  );
}

const filesToScan = [
  specPath,
  mdPath,
  import.meta.filename || new URL(import.meta.url).pathname
];

for (const file of filesToScan) {
  const body = fs.readFileSync(file, "utf8");
  check(
    `ascii_${path.basename(file)}`,
    [...body].every((char) => char.charCodeAt(0) <= 127),
    `${path.basename(file)} must remain ASCII.`
  );
  check(
    `secret_scan_${path.basename(file)}`,
    assertNoSecretText(body),
    `${path.basename(file)} must not contain obvious secrets.`
  );
}

check(
  "markdown_states_no_write",
  markdown.includes("No write calls.") && markdown.includes("All must remain false:"),
  "Markdown must state no-write and false counters."
);

const failed = checks.filter((item) => !item.pass);
const summary = {
  artifact: "mcp_local_conformance_p1_probe",
  version: "2026-06-12",
  ok: failed.length === 0,
  checks_total: checks.length,
  checks_failed: failed.length,
  phase: "P1_local_conformance",
  mode: "nowrite_local_stdio_adapter",
  public_tool_calls: publicToolCalls,
  negative_tool_calls: negativeToolCalls,
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
  "# MCP Local Conformance P1 Probe",
  "",
  "Date: 2026-06-12",
  "",
  `Status: ${summary.ok ? "passed" : "failed"}`,
  "",
  "Mode: local stdio adapter, NoWrite.",
  "",
  "## Result",
  "",
  `- checks total: ${summary.checks_total}`,
  `- checks failed: ${summary.checks_failed}`,
  `- hosted MCP build allowed: ${summary.hosted_mcp_build_allowed ? "yes" : "no"}`,
  `- hosted MCP deploy allowed: ${summary.hosted_mcp_deploy_allowed ? "yes" : "no"}`,
  `- registry submission allowed: ${summary.registry_submission_allowed ? "yes" : "no"}`,
  `- live billing allowed: ${summary.live_billing_allowed ? "yes" : "no"}`,
  `- real data allowed: ${summary.real_data_allowed ? "yes" : "no"}`,
  `- credits consumed: ${summary.safety_counters.credits_consumed ? "yes" : "no"}`,
  "",
  "## Public Calls",
  "",
  "| Tool | HTTP | OK | Auth |",
  "|---|---:|---|---|",
  ...publicToolCalls.map((call) => `| ${call.tool} | ${call.http_status} | ${call.ok ? "yes" : "no"} | ${call.auth} |`),
  "",
  "## Negative Local Checks",
  "",
  "| Case | Error |",
  "|---|---|",
  ...negativeToolCalls.map((call) => `| ${call.case} | ${call.payload?.error || "jsonrpc_error"} |`),
  "",
  "## Interpretation",
  "",
  "The local MCP adapter passes P1 conformance in NoWrite mode if this report is passed. The result does not authorize hosted MCP, public registry submission, billing, production keys, real data or outreach.",
  "",
  "## Next",
  "",
  summary.ok ? summary.next_action_if_passed : summary.next_action_if_failed,
  "",
  "## Failed Checks",
  "",
  failed.length
    ? failed.map((item) => `- ${item.id}: ${item.detail}`).join("\n")
    : "None.",
  ""
].join("\n");

const summaryPath = path.join(packDir, "mcp_local_conformance_p1_probe_summary_20260612.json");
const reportPath = path.join(packDir, "mcp_local_conformance_p1_probe_report_20260612.md");

fs.writeFileSync(summaryPath, `${JSON.stringify(summary, null, 2)}\n`);
fs.writeFileSync(reportPath, report);

console.log(
  JSON.stringify(
    {
      ok: summary.ok,
      checks_total: summary.checks_total,
      checks_failed: summary.checks_failed,
      public_tool_calls: publicToolCalls.length,
      negative_tool_calls: negativeToolCalls.length,
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
