import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const summaryPath = path.join(
  root,
  "private-evaluator-pack",
  "public_static_contract_deploy_probe_summary_20260612.json"
);
const reportPath = path.join(
  root,
  "private-evaluator-pack",
  "public_static_contract_deploy_probe_report_20260612.md"
);

const publicContracts = [
  {
    name: "openapi",
    localPath: "openapi.json",
    publicUrl: "https://machinesignal.it/openapi.json",
  },
  {
    name: "root_mcp_manifest",
    localPath: "mcp-tool-manifest.json",
    publicUrl: "https://machinesignal.it/mcp-tool-manifest.json",
  },
  {
    name: "well_known_mcp_manifest",
    localPath: ".well-known/mcp-tool-manifest.json",
    publicUrl: "https://machinesignal.it/.well-known/mcp-tool-manifest.json",
  },
];

const checks = [];

function addCheck(name, ok, details = "") {
  checks.push({ name, ok: Boolean(ok), details });
}

async function fetchJson(url) {
  const response = await fetch(`${url}?probe=20260612-${Date.now()}`, {
    headers: {
      Accept: "application/json",
      "Cache-Control": "no-cache",
      "User-Agent": "MachineSignal-Public-Static-Contract-Deploy-Probe",
    },
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`${url} returned HTTP ${response.status}: ${text.slice(0, 200)}`);
  }
  return {
    status: response.status,
    contentType: response.headers.get("content-type") || "",
    text,
    json: JSON.parse(text),
  };
}

function stable(value) {
  return JSON.stringify(value);
}

function toolByName(manifest, name) {
  return (manifest.tools || []).find((tool) => tool.name === name) || null;
}

const observed = [];

for (const contract of publicContracts) {
  const localText = await readFile(path.join(root, contract.localPath), "utf8");
  const localJson = JSON.parse(localText);
  const publicResult = await fetchJson(contract.publicUrl);
  observed.push({
    name: contract.name,
    public_url: contract.publicUrl,
    status: publicResult.status,
    content_type: publicResult.contentType,
    local_bytes: localText.length,
    public_bytes: publicResult.text.length,
  });
  addCheck(`${contract.name}_http_200`, publicResult.status === 200, contract.publicUrl);
  addCheck(
    `${contract.name}_json_matches_local`,
    stable(publicResult.json) === stable(localJson),
    contract.localPath
  );
}

const publicOpenapi = (await fetchJson("https://machinesignal.it/openapi.json")).json;
const purchaseIntentProps =
  publicOpenapi.components?.schemas?.PurchaseIntentRequest?.properties || {};
addCheck("public_openapi_has_market", Boolean(purchaseIntentProps.market));
addCheck("public_openapi_has_area", Boolean(purchaseIntentProps.area));
addCheck(
  "public_openapi_has_commercial_objective",
  Boolean(purchaseIntentProps.commercial_objective)
);

for (const url of [
  "https://machinesignal.it/mcp-tool-manifest.json",
  "https://machinesignal.it/.well-known/mcp-tool-manifest.json",
]) {
  const manifest = (await fetchJson(url)).json;
  const sandboxTool = toolByName(manifest, "create_sandbox_customer");
  const sandboxProps = sandboxTool?.input_schema?.properties || {};
  addCheck(`${url}_has_create_sandbox_customer`, Boolean(sandboxTool));
  addCheck(`${url}_has_evaluator_type`, Boolean(sandboxProps.evaluator_type));
  addCheck(`${url}_has_integration_target`, Boolean(sandboxProps.integration_target));
  addCheck(`${url}_has_expected_test_path`, Boolean(sandboxProps.expected_test_path));
  addCheck(`${url}_has_no_old_evaluator_id`, !sandboxProps.evaluator_id);
  addCheck(`${url}_has_no_old_use_case`, !sandboxProps.use_case);
}

const failedChecks = checks.filter((check) => !check.ok);
const summary = {
  date: "2026-06-12",
  status: failedChecks.length === 0 ? "passed" : "failed",
  purpose:
    "Verify that the deployed public static MachineSignal contracts match the local repo contracts after FTP publication.",
  scope: {
    public_site: "https://machinesignal.it",
    deployed_contracts: publicContracts.map((contract) => contract.publicUrl),
    no_live_billing: true,
    no_production_keys: true,
    no_real_customer_data: true,
    no_personal_data: true,
    no_human_outreach: true,
    no_hosted_mcp_deploy: true,
  },
  observed,
  checks_total: checks.length,
  checks_failed: failedChecks.length,
  checks,
  next_action_if_passed: "continue_p2_staging_design_only_or_public_machine_docs_probe",
  next_action_if_failed: "repair_public_static_contract_deploy_before_any_distribution_step",
};

await writeFile(summaryPath, `${JSON.stringify(summary, null, 2)}\n`);

const report = [
  "# Public Static Contract Deploy Probe",
  "",
  "Date: 2026-06-12",
  "",
  `Status: ${summary.status}`,
  "",
  "This probe verifies that the public MachineSignal static contracts match the local repository contracts after FTP publication.",
  "",
  "## Result",
  "",
  `- checks total: ${summary.checks_total}`,
  `- checks failed: ${summary.checks_failed}`,
  "- live billing executed: no",
  "- production keys exposed: no",
  "- real customer data used: no",
  "- personal data used: no",
  "- human outreach executed: no",
  "- hosted MCP deployed: no",
  "",
  "## Public Contracts",
  "",
  ...observed.map(
    (item) =>
      `- ${item.name}: ${item.public_url} HTTP ${item.status}, public bytes ${item.public_bytes}`
  ),
  "",
  "## Interpretation",
  "",
  failedChecks.length === 0
    ? "The public static contracts are aligned with the local repository and can be read by automated clients, CRM workflows, AI agents and API directories."
    : "The public static contracts are not aligned and must be repaired before any additional distribution or staging work.",
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
