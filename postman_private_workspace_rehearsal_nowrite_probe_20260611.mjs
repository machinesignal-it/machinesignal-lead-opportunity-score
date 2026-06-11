import fs from "node:fs";

const PUBLIC_SITE = "https://machinesignal.it";
const OUTPUT_REPORT = "postman_private_workspace_rehearsal_nowrite_probe_report_20260611.md";
const OUTPUT_SUMMARY = "postman_private_workspace_rehearsal_nowrite_probe_summary_20260611.json";

const requiredItems = [
  "Read full machine buyer flow demo",
  "Read CRM consumer demo output",
  "Create limited sandbox customer",
  "Score business domain",
  "Order target discovery when machine has no list",
  "Order deep analysis after a strong score",
  "Order action pack after confirmed opportunity",
  "Repeat same score without double charge",
  "Fetch OpenAPI schema"
];

const sensitiveVariables = [
  "machinesignal_api_key",
  "machinesignal_admin_api_key",
  "beta_customer_id",
  "payment_test_success_signature"
];

const expectedEnvironmentVariables = [
  "base_url",
  "machinesignal_api_key",
  "machinesignal_admin_api_key",
  "beta_customer_id",
  "payment_test_id",
  "order_intent_id",
  "payment_test_success_signature"
];

const fetchedResources = [
  ["collection", `${PUBLIC_SITE}/postman_public_collection.json`, "json"],
  ["environment", `${PUBLIC_SITE}/postman_public_environment_template.json`, "json"],
  ["secret_scan", `${PUBLIC_SITE}/postman_workspace_secret_scan_20260606.json`, "json"],
  ["workspace_draft", `${PUBLIC_SITE}/distribution/postman-public-workspace-draft.json`, "json"],
  ["checklist", `${PUBLIC_SITE}/postman_private_workspace_checklist_20260607.json`, "json"],
  ["llms", `${PUBLIC_SITE}/llms.txt`, "text"],
  ["robots", `${PUBLIC_SITE}/robots.txt`, "text"],
  ["sitemap", `${PUBLIC_SITE}/sitemap.xml`, "text"]
];

const checks = [];
const resources = {};

function addCheck(name, ok, details = "") {
  checks.push({ name, ok: Boolean(ok), details });
}

function asText(value) {
  return typeof value === "string" ? value : JSON.stringify(value ?? {});
}

function flattenItems(items, prefix = []) {
  const out = [];
  for (const item of items || []) {
    if (item.item) {
      out.push(...flattenItems(item.item, prefix.concat(item.name)));
    } else {
      out.push({
        name: prefix.concat(item.name).join(" / "),
        method: item.request?.method || "",
        url: typeof item.request?.url === "string" ? item.request.url : item.request?.url?.raw || "",
        headers: item.request?.header || [],
        description: item.request?.description || ""
      });
    }
  }
  return out;
}

function hasSecretLikeText(text) {
  const patterns = [
    /ghp_[A-Za-z0-9_]+/,
    /github_pat_[A-Za-z0-9_]+/,
    /sk_live_[A-Za-z0-9]+/,
    /sk_test_[A-Za-z0-9]+/,
    /Bearer\s+[A-Za-z0-9._-]{20,}/,
    /CF_API_TOKEN\s*[:=]\s*[A-Za-z0-9._-]+/
  ];
  return patterns.some((pattern) => pattern.test(text));
}

async function fetchResource(name, url, type) {
  const response = await fetch(url, {
    headers: {
      "user-agent": "MachineSignalPostmanPrivateWorkspaceNoWriteProbe/2026-06-11",
      accept: type === "json" ? "application/json,*/*" : "text/plain,text/html,application/xml,*/*",
      "cache-control": "no-cache"
    }
  });
  const bodyText = await response.text();
  let body = bodyText;
  let jsonOk = false;
  if (type === "json") {
    try {
      body = JSON.parse(bodyText);
      jsonOk = true;
    } catch {
      jsonOk = false;
    }
  }
  resources[name] = {
    url,
    status: response.status,
    ok: response.ok,
    bytes: bodyText.length,
    json_ok: jsonOk,
    body,
    body_text: bodyText
  };
  addCheck(`${name}_reachable`, response.ok, `HTTP ${response.status}, bytes=${bodyText.length}`);
  if (type === "json") {
    addCheck(`${name}_json_valid`, jsonOk, `json_valid=${jsonOk}`);
  }
  addCheck(`${name}_no_secret_like_patterns`, !hasSecretLikeText(bodyText), "public content does not expose token-like patterns");
}

for (const [name, url, type] of fetchedResources) {
  await fetchResource(name, url, type);
}

const collection = resources.collection.body || {};
const environment = resources.environment.body || {};
const secretScan = resources.secret_scan.body || {};
const workspaceDraft = resources.workspace_draft.body || {};
const checklist = resources.checklist.body || {};
const collectionItems = flattenItems(collection.item);
const mutatingItems = collectionItems.filter((item) => ["POST", "PATCH", "PUT", "DELETE"].includes(item.method));
const methods = [...new Set(collectionItems.map((item) => item.method).filter(Boolean))].sort();

addCheck("collection_has_28_items", collectionItems.length === 28, `items=${collectionItems.length}`);
for (const name of requiredItems) {
  addCheck(`collection_required_item_${name.replace(/[^A-Za-z0-9]+/g, "_").toLowerCase()}`, collectionItems.some((item) => item.name.includes(name)), name);
}
addCheck("collection_uses_only_expected_methods", methods.every((method) => ["GET", "PATCH", "POST"].includes(method)), `methods=${methods.join(",")}`);
addCheck("collection_has_machine_demo_and_crm_output", asText(collection).includes("machine-buyer-flow") && asText(collection).includes("crm-consumer"), "machine flow and CRM consumer demos are included");
addCheck("collection_has_idempotency_examples", mutatingItems.filter((item) => item.headers.some((header) => header.key === "Idempotency-Key")).length >= 8, "most mutating sandbox examples include Idempotency-Key");
addCheck("collection_has_api_key_guarded_calls", asText(collection).includes("{{machinesignal_api_key}}") && asText(collection).includes("{{machinesignal_admin_api_key}}"), "customer and admin keys are referenced as variables");

for (const name of sensitiveVariables) {
  const collectionVar = (collection.variable || []).find((variable) => variable.key === name);
  const envVar = (environment.values || []).find((variable) => variable.key === name);
  addCheck(`collection_${name}_blank_secret`, collectionVar && String(collectionVar.value || "") === "" && collectionVar.type === "secret", `${name} collection variable is blank secret`);
  addCheck(`environment_${name}_blank_secret`, envVar && String(envVar.value || "") === "" && envVar.type === "secret", `${name} environment variable is blank secret`);
}

for (const name of expectedEnvironmentVariables) {
  addCheck(`environment_declares_${name}`, (environment.values || []).some((variable) => variable.key === name), name);
}
const nonBaseEnvValues = (environment.values || []).filter((variable) => variable.key !== "base_url" && String(variable.value || "") !== "");
addCheck("environment_private_values_blank", nonBaseEnvValues.length === 0, `non_base_non_blank=${nonBaseEnvValues.length}`);

addCheck("secret_scan_passed", secretScan.status === "passed", `status=${secretScan.status}`);
addCheck("secret_scan_item_count_matches_collection", Number(secretScan.collection_item_count) === collectionItems.length, `scan=${secretScan.collection_item_count}, collection=${collectionItems.length}`);
addCheck("secret_scan_has_no_hits", (secretScan.secret_hits || []).length === 0, `secret_hits=${(secretScan.secret_hits || []).length}`);
addCheck("secret_scan_blocks_public_keys", (secretScan.blocked_actions || []).includes("publish_real_api_keys") && (secretScan.blocked_actions || []).includes("publish_admin_keys"), "public key publication is blocked");

addCheck("workspace_private_or_team_only", workspaceDraft.workspace?.suggested_visibility === "private_or_team_before_owner_approval", workspaceDraft.workspace?.suggested_visibility || "");
addCheck("workspace_public_visibility_blocked", String(workspaceDraft.workspace?.public_visibility_gate || "").includes("owner_approval"), workspaceDraft.workspace?.public_visibility_gate || "");
addCheck("workspace_policy_blocks_live_payments", workspaceDraft.publication_policy?.live_payments_enabled === false, "live payments disabled");
addCheck("workspace_policy_blocks_real_keys", workspaceDraft.publication_policy?.real_keys_publishable === false, "real key publication disabled");
addCheck("workspace_policy_blocks_human_outreach", workspaceDraft.publication_policy?.human_outreach_allowed === false, "human outreach disabled");
addCheck("workspace_import_assets_include_secret_scan", asText(workspaceDraft.import_assets).includes("postman_workspace_secret_scan_20260606.json"), "secret scan linked in import assets");

const blockedActions = checklist.blocked_actions || [];
for (const blocked of [
  "make_workspace_public",
  "publish_real_api_keys",
  "publish_admin_keys",
  "activate_live_payments",
  "run_external_outreach",
  "contact_target_companies"
]) {
  addCheck(`checklist_blocks_${blocked}`, blockedActions.includes(blocked), blocked);
}

addCheck("llms_lists_postman_rehearsal_inputs", resources.llms.body_text.includes("postman_public_collection.json") && resources.llms.body_text.includes("postman_public_environment_template.json"), "llms points to Postman import inputs");
addCheck("robots_lists_postman_collection", resources.robots.body_text.includes("postman_public_collection.json"), "robots lists Postman collection");
addCheck("sitemap_lists_postman_collection", resources.sitemap.body_text.includes("postman_public_collection.json"), "sitemap lists Postman collection");

const failed = checks.filter((check) => !check.ok);
const summary = {
  service: "MachineSignal",
  probe_name: "postman_private_workspace_rehearsal_nowrite_probe",
  status: failed.length === 0 ? "completed_postman_private_workspace_rehearsal_nowrite" : "failed_postman_private_workspace_rehearsal_nowrite",
  ok: failed.length === 0,
  evidence_date: "2026-06-11",
  mode: "NoWritePostmanPrivateWorkspaceRehearsal",
  primary_customer_interface: "machine",
  machine_customer_mode: "machine_imports_private_postman_workspace_and_reads_sandbox_contract_without_publication_or_real_keys",
  public_site: PUBLIC_SITE,
  collection_item_count: collectionItems.length,
  methods,
  mutating_examples: mutatingItems.map((item) => item.name),
  write_calls_executed: 0,
  post_calls_executed: 0,
  real_payment_executed: false,
  external_contact_executed: false,
  human_outreach_executed: false,
  external_publication_executed: false,
  live_monetization_enabled: false,
  public_workspace_enabled: false,
  real_api_keys_published: false,
  recommended_next_step: failed.length === 0
    ? "Keep Postman private/team, optionally run an owner-supervised in-Postman import check, then decide whether to prepare an unpublished API-directory/RapidAPI draft."
    : "Fix failed private workspace checks before using Postman as a machine-buyer evaluation surface.",
  interpretation: failed.length === 0
    ? "A machine can import the MachineSignal Postman assets, see the machine-buyer flow, use blank secret variables, and understand that live payments, public publication, real keys and human outreach are blocked."
    : "The Postman private workspace path is not yet clean enough for a machine-buyer rehearsal.",
  resources: Object.fromEntries(Object.entries(resources).map(([name, resource]) => [name, {
    url: resource.url,
    status: resource.status,
    ok: resource.ok,
    json_ok: resource.json_ok,
    bytes: resource.bytes
  }])),
  checks,
  failed_checks: failed
};

fs.writeFileSync(OUTPUT_SUMMARY, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

const reportLines = [
  "# MachineSignal - Postman Private Workspace Rehearsal NoWrite Probe",
  "",
  "## Scope",
  "",
  "This probe verifies whether a machine, CRM, AI agent or workflow can read and import the MachineSignal Postman evaluation assets without public publication, real keys, live payments or human outreach.",
  "",
  "## Result",
  "",
  `- Status: **${summary.status}**`,
  `- OK: **${summary.ok}**`,
  `- Collection items: ${summary.collection_item_count}`,
  `- Methods: ${summary.methods.join(", ")}`,
  "- Write calls executed: 0",
  "- POST calls executed by this probe: 0",
  "- Real payment executed: false",
  "- External contact executed: false",
  "- Public workspace enabled: false",
  "- Real API keys published: false",
  "",
  "## Machine Interpretation",
  "",
  summary.interpretation,
  "",
  "## Required Machine-Buyer Items",
  "",
  ...requiredItems.map((name) => `- ${name}: ${collectionItems.some((item) => item.name.includes(name)) ? "present" : "missing"}`),
  "",
  "## Public Resources",
  "",
  ...Object.entries(resources).map(([name, resource]) => `- ${name}: HTTP ${resource.status}, json=${resource.json_ok}, ${resource.url}`),
  "",
  "## Checks",
  "",
  ...checks.map((check) => `- ${check.ok ? "PASS" : "FAIL"} - ${check.name}: ${check.details}`),
  "",
  "## Guardrails Confirmed",
  "",
  "- Postman workspace remains private or team-only until owner approval.",
  "- Secret variables are blank and marked secret.",
  "- Admin key is declared only as a blank secret variable.",
  "- Live payments, real keys, external publication and human outreach remain blocked.",
  "- This rehearsal is a machine-to-machine integration surface check, not a launch or sales campaign."
];

fs.writeFileSync(OUTPUT_REPORT, `${reportLines.join("\n")}\n`, "utf8");

if (failed.length > 0) {
  console.error(JSON.stringify(summary, null, 2));
  process.exit(2);
}

console.log(JSON.stringify(summary, null, 2));
