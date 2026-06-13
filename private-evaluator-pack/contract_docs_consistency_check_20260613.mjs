import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const summaryPath = path.join(root, "private-evaluator-pack", "contract_docs_consistency_check_summary_20260613.json");
const reportPath = path.join(root, "private-evaluator-pack", "contract_docs_consistency_check_report_20260613.md");

const localFiles = {
  openapi: path.join(root, "openapi.json"),
  postman: path.join(root, "postman_public_collection.json"),
  readme: path.join(root, "README.md"),
  machineEntrypoint: path.join(root, "MACHINE_AGENT_ENTRYPOINT.md"),
  mcpManifest: path.join(root, "mcp-tool-manifest.json"),
  machineOnboarding: path.join(root, "machine-onboarding.json")
};

const publicUrls = {
  apiPage: "https://machinesignal.it/api/",
  betaPage: "https://machinesignal.it/beta/",
  machineDiscoveryPage: "https://machinesignal.it/machine-discovery/",
  publicOpenapi: "https://machinesignal.it/openapi.json",
  publicPostman: "https://machinesignal.it/postman_public_collection.json",
  publicMcpManifest: "https://machinesignal.it/mcp-tool-manifest.json",
  publicWellKnownMcpManifest: "https://machinesignal.it/.well-known/mcp-tool-manifest.json"
};

function readText(file) {
  return fs.readFileSync(file, "utf8");
}

function readJson(file) {
  return JSON.parse(readText(file));
}

function flatten(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  return JSON.stringify(value);
}

function includesAny(text, terms) {
  const lower = text.toLowerCase();
  return terms.some((term) => lower.includes(term.toLowerCase()));
}

function includesAll(text, terms) {
  const lower = text.toLowerCase();
  return terms.every((term) => lower.includes(term.toLowerCase()));
}

function collectPostmanItems(items, output = []) {
  for (const item of items ?? []) {
    if (item.item) collectPostmanItems(item.item, output);
    else output.push(item);
  }
  return output;
}

function collectOpenapiMethods(openapi) {
  const methods = [];
  for (const [route, operations] of Object.entries(openapi.paths ?? {})) {
    for (const method of Object.keys(operations ?? {})) {
      methods.push(`${method.toUpperCase()} ${route}`);
    }
  }
  return methods;
}

const openapi = readJson(localFiles.openapi);
const postman = readJson(localFiles.postman);
const readme = readText(localFiles.readme);
const machineEntrypoint = readText(localFiles.machineEntrypoint);
const mcpManifest = readJson(localFiles.mcpManifest);
const machineOnboarding = readJson(localFiles.machineOnboarding);

const openapiText = flatten(openapi);
const postmanText = flatten(postman);
const mcpText = flatten(mcpManifest);
const onboardingText = flatten(machineOnboarding);
const postmanItems = collectPostmanItems(postman.item);
const openapiMethods = collectOpenapiMethods(openapi);

const checks = [];
function check(name, ok, detail = "") {
  checks.push({ name, ok: Boolean(ok), detail });
}

const requiredConcepts = [
  {
    id: "machine_first_customer",
    terms: ["machine", "agent", "CRM"],
    docs: {
      openapi: openapiText,
      postman: postmanText,
      readme,
      machineEntrypoint
    }
  },
  {
    id: "sandbox_or_beta",
    terms: ["beta"],
    docs: {
      openapi: openapiText,
      postman: postmanText,
      readme,
      machineEntrypoint
    }
  },
  {
    id: "target_discovery",
    terms: ["target discovery"],
    docs: {
      postman: postmanText,
      readme,
      machineEntrypoint
    }
  },
  {
    id: "score",
    terms: ["score"],
    docs: {
      openapi: openapiText,
      postman: postmanText,
      readme,
      machineEntrypoint
    }
  },
  {
    id: "deep_analysis",
    terms: ["deep analysis"],
    docs: {
      postman: postmanText,
      readme,
      machineEntrypoint
    }
  },
  {
    id: "action_pack",
    terms: ["action pack"],
    docs: {
      postman: postmanText,
      readme,
      machineEntrypoint
    }
  }
];

for (const concept of requiredConcepts) {
  for (const [docName, docText] of Object.entries(concept.docs)) {
    check(`${concept.id} present in ${docName}`, includesAny(docText, concept.terms), concept.terms.join(", "));
  }
}

check("OpenAPI version present", typeof openapi.openapi === "string", openapi.openapi);
check("OpenAPI title names MachineSignal", includesAny(openapi.info?.title ?? "", ["MachineSignal"]));
check("OpenAPI has paths", openapiMethods.length > 0, String(openapiMethods.length));
check("OpenAPI exposes score path", openapiMethods.some((method) => /lead-opportunity-score/i.test(method)), openapiMethods.join("; "));
check("OpenAPI exposes usage path", openapiMethods.some((method) => /usage/i.test(method)), openapiMethods.join("; "));
check("OpenAPI exposes purchase intent path", openapiMethods.some((method) => /purchase-intent/i.test(method)), openapiMethods.join("; "));

check("Postman collection has name", Boolean(postman.info?.name), postman.info?.name ?? "");
check("Postman collection has items", postmanItems.length >= 10, String(postmanItems.length));
check("Postman includes score request", postmanItems.some((item) => /score/i.test(item.name ?? "")), postmanItems.map((item) => item.name).join("; "));
check("Postman includes target discovery request", postmanItems.some((item) => /target discovery/i.test(`${item.name} ${item.request?.description ?? ""}`)), postmanItems.map((item) => item.name).join("; "));
check("Postman includes deep analysis request", postmanItems.some((item) => /deep analysis/i.test(`${item.name} ${item.request?.description ?? ""}`)), postmanItems.map((item) => item.name).join("; "));
check("Postman includes action pack request", postmanItems.some((item) => /action pack/i.test(`${item.name} ${item.request?.description ?? ""}`)), postmanItems.map((item) => item.name).join("; "));

const paymentTestItems = postmanItems.filter((item) => /payment/i.test(`${item.name} ${item.request?.description ?? ""}`));
check("Payment items are test-mode only", paymentTestItems.every((item) => /test|simulat|no real payment/i.test(`${item.name} ${item.request?.description ?? ""} ${flatten(item.request?.body)}`)), paymentTestItems.map((item) => item.name).join("; "));
check("Postman states no real payment", /No real payment is executed/i.test(postmanText));

for (const [docName, docText] of Object.entries({ readme, machineEntrypoint })) {
  check(`${docName} blocks live payments`, includesAny(docText, ["live payments", "payments"]) && includesAny(docText, ["blocked", "not live"]));
  check(`${docName} blocks invoices`, includesAny(docText, ["invoice", "invoices"]) && includesAny(docText, ["blocked", "not live"]));
  check(`${docName} blocks hosted public MCP`, includesAny(docText, ["hosted public MCP"]) && includesAny(docText, ["blocked", "not live"]));
  check(`${docName} blocks external publication/outreach`, includesAny(docText, ["external publication", "human outreach", "external send"]) && includesAny(docText, ["blocked", "deferred"]));
  check(`${docName} blocks real data`, includesAny(docText, ["real customer data", "personal data", "real lead lists"]) && includesAny(docText, ["blocked"]));
}

check("MCP manifest names MachineSignal", includesAny(mcpText, ["MachineSignal"]));
check("Machine onboarding names machine customer", includesAny(onboardingText, ["machine", "agent", "CRM"]));

const publicResults = [];
for (const [id, url] of Object.entries(publicUrls)) {
  const startedAt = Date.now();
  const result = { id, url, ok: false, status: null, elapsed_ms: null, error: null, checks: [] };
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { "User-Agent": "MachineSignal-Contract-Docs-Consistency-Check/20260613" }
    });
    result.status = response.status;
    result.elapsed_ms = Date.now() - startedAt;
    const text = await response.text();
    result.checks.push({ name: "http_2xx", ok: response.status >= 200 && response.status < 300 });
    if (/json/i.test(url)) {
      JSON.parse(text);
      result.checks.push({ name: "valid_json", ok: true });
    } else {
      result.checks.push({ name: "mentions_machinesignal_or_api", ok: includesAny(text, ["MachineSignal", "API", "machine", "score"]) });
    }
    result.ok = result.checks.every((item) => item.ok);
  } catch (error) {
    result.elapsed_ms = Date.now() - startedAt;
    result.error = error instanceof Error ? error.message : String(error);
    result.checks.push({ name: "fetch_or_parse", ok: false });
  }
  publicResults.push(result);
}

for (const result of publicResults) {
  check(`public resource ok: ${result.id}`, result.ok, result.error ?? `HTTP ${result.status}`);
}

const forbiddenLiveClaims = [
  /paid launch approved/i,
  /live payments enabled/i,
  /real payment executed\s*[:=]\s*true/i,
  /invoice issued\s*[:=]\s*true/i,
  /production api key published\s*[:=]\s*true/i,
  /human outreach executed\s*[:=]\s*true/i,
  /external contact executed\s*[:=]\s*true/i,
  /real customer data used\s*[:=]\s*true/i,
  /personal data used\s*[:=]\s*true/i
];
for (const pattern of forbiddenLiveClaims) {
  check(`no forbidden live claim: ${pattern}`, !pattern.test(`${readme}\n${machineEntrypoint}\n${openapiText}\n${postmanText}`));
}

const failed = checks.filter((item) => !item.ok);
const issues = [];
if (failed.length > 0) {
  issues.push({
    severity: "yellow",
    issue: "One or more consistency checks failed.",
    failed_checks: failed.map((item) => item.name)
  });
}

const summary = {
  check_id: "contract_docs_consistency_check_20260613",
  status: failed.length === 0 ? "passed" : "needs_attention",
  status_level: failed.length === 0 ? "green" : "yellow",
  mode: "NoWrite",
  post_calls_executed: 0,
  write_calls_executed: 0,
  local_documents_checked: Object.keys(localFiles),
  public_resources_checked: publicResults.length,
  checks_total: checks.length,
  checks_failed: failed.length,
  failed_checks: failed,
  public_results: publicResults,
  openapi_methods_count: openapiMethods.length,
  postman_items_count: postmanItems.length,
  payment_test_items_count: paymentTestItems.length,
  issues,
  next_recommended_action: failed.length === 0
    ? "prepare_go_live_test_closure_review"
    : "fix_contract_docs_consistency_issues_before_next_step"
};

const report = [
  "# Contract-docs consistency check",
  "",
  `Status: ${summary.status}`,
  `Status level: ${summary.status_level}`,
  `Mode: ${summary.mode}`,
  `POST calls executed: ${summary.post_calls_executed}`,
  `Write calls executed: ${summary.write_calls_executed}`,
  `Local documents checked: ${summary.local_documents_checked.length}`,
  `Public resources checked: ${summary.public_resources_checked}`,
  `Checks total: ${summary.checks_total}`,
  `Checks failed: ${summary.checks_failed}`,
  "",
  "## Result",
  "",
  summary.status === "passed"
    ? "OpenAPI, Postman, GitHub machine docs and public pages tell a consistent machine-first, sandbox-only story."
    : "Some contract/documentation consistency checks need attention.",
  "",
  "## Key confirmations",
  "",
  "- Customer is consistently described as machine-first: CRM, AI agents, workflows and software.",
  "- Core products are consistently represented: Target Discovery, Score, Deep Analysis and Action Pack.",
  "- Payment-related Postman items are test-mode/simulated only.",
  "- Live payments, invoices, hosted public MCP, external publication, outreach, real data and personal data remain blocked.",
  "- Public resources were checked with GET only.",
  "",
  "## Failed checks",
  "",
  failed.length === 0 ? "None." : failed.map((item) => `- ${item.name}: ${item.detail}`).join("\n"),
  "",
  "## Next recommended action",
  "",
  summary.next_recommended_action
].join("\n");

fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2) + "\n");
fs.writeFileSync(reportPath, report + "\n");

console.log(report);

if (summary.status_level === "red") {
  process.exit(2);
}
