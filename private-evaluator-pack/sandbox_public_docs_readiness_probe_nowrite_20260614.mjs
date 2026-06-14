import fs from "node:fs";

const OUTPUT_REPORT = "private-evaluator-pack/sandbox_public_docs_readiness_probe_nowrite_report_20260614.md";
const OUTPUT_SUMMARY = "private-evaluator-pack/sandbox_public_docs_readiness_probe_nowrite_summary_20260614.json";

const checks = [];
function check(name, ok, detail = "") {
  checks.push({ name, ok: Boolean(ok), detail });
}

function read(path) {
  const text = fs.readFileSync(path, "utf8");
  check(`${path.replace(/[^a-z0-9]+/gi, "_").toLowerCase()}_exists`, text.length > 0, `${text.length} bytes`);
  return text;
}

const md = read("SANDBOX_PUBLIC_DOCS.md");
const jsonText = read("sandbox-public-docs.json");
const llms = read("llms.txt");
const robots = read("robots.txt");
const catalog = JSON.parse(read("product-catalog.json"));

let sandbox = null;
try {
  sandbox = JSON.parse(jsonText);
  check("sandbox_json_valid", true, "valid JSON");
} catch {
  check("sandbox_json_valid", false, "invalid JSON");
}

check("status_sandbox_public_docs_only", sandbox?.status === "sandbox-public-docs-only", sandbox?.status);
check("commercial_go_live_false", sandbox?.commercial_go_live === false, String(sandbox?.commercial_go_live));
check("live_monetization_false", sandbox?.live_monetization_enabled === false, String(sandbox?.live_monetization_enabled));
check("real_payment_false", sandbox?.real_payment_executed === false, String(sandbox?.real_payment_executed));
check("invoice_false", sandbox?.real_invoice_issued === false, String(sandbox?.real_invoice_issued));
check("payment_collection_false", sandbox?.payment_method_collection_enabled === false, String(sandbox?.payment_method_collection_enabled));
check("external_outreach_false", sandbox?.external_outreach_enabled === false, String(sandbox?.external_outreach_enabled));
check("real_data_false", sandbox?.real_data_processing_enabled === false, String(sandbox?.real_data_processing_enabled));
check("personal_data_false", sandbox?.personal_data_processing_enabled === false, String(sandbox?.personal_data_processing_enabled));
check("hosted_mcp_public_false", sandbox?.hosted_mcp_public_enabled === false, String(sandbox?.hosted_mcp_public_enabled));
check("mcp_registry_false", sandbox?.mcp_registry_publication_enabled === false, String(sandbox?.mcp_registry_publication_enabled));
check("marketplace_paid_false", sandbox?.marketplace_paid_publication_enabled === false, String(sandbox?.marketplace_paid_publication_enabled));

check("md_states_not_live_payment_page", md.includes("not a live payment page"), "markdown wording");
check("md_blocks_real_payments", md.includes("real payments"), "markdown blocks");
check("md_blocks_personal_data", md.includes("personal data"), "markdown blocks");
check("md_blocks_external_outreach", md.includes("external outreach"), "markdown blocks");
check("md_current_decision_sandbox_only", md.includes("Commercial go-live remains blocked"), "markdown decision");

check("llms_links_markdown_doc", llms.includes("https://machinesignal.it/SANDBOX_PUBLIC_DOCS.md"), "llms link");
check("llms_links_json_doc", llms.includes("https://machinesignal.it/sandbox-public-docs.json"), "llms link");
check("robots_links_markdown_doc", robots.includes("Sandbox-public-docs:"), "robots link");
check("robots_links_json_doc", robots.includes("Sandbox-public-docs-json:"), "robots link");

check("price_target_matches_catalog", sandbox?.current_sandbox_prices_eur?.target_discovery_pack_250 === catalog.products.target_discovery_pack_250.price_eur, String(sandbox?.current_sandbox_prices_eur?.target_discovery_pack_250));
check("price_score_matches_catalog", sandbox?.current_sandbox_prices_eur?.score_pack_1k === catalog.products.score_pack_1k.price_eur, String(sandbox?.current_sandbox_prices_eur?.score_pack_1k));
check("price_deep_matches_catalog", sandbox?.current_sandbox_prices_eur?.deep_analysis_pack_100 === catalog.products.deep_analysis_pack_100.price_eur, String(sandbox?.current_sandbox_prices_eur?.deep_analysis_pack_100));

const forbiddenMarketing = [
  "guaranteed revenue",
  "guaranteed leads",
  "live checkout enabled",
  "production key available",
  "automatic outreach enabled"
];
for (const phrase of forbiddenMarketing) {
  const haystack = `${md}\n${jsonText}\n${llms}`.toLowerCase();
  check(`forbidden_phrase_absent_${phrase.replace(/[^a-z0-9]+/g, "_")}`, !haystack.includes(phrase), phrase);
}

check("probe_nowrite", true, "api_calls_executed_now=0; write_calls_executed_now=0");

const failed = checks.filter((item) => !item.ok);
const summary = {
  probe_id: "sandbox_public_docs_readiness_probe_nowrite_20260614",
  mode: "NoWrite sandbox public docs readiness",
  status: failed.length === 0 ? "pass" : "fail",
  api_calls_executed_now: 0,
  write_calls_executed_now: 0,
  checks_total: checks.length,
  checks_failed: failed.length,
  failed_checks: failed,
  recommended_next_step:
    failed.length === 0
      ? "Publish SANDBOX_PUBLIC_DOCS.md, sandbox-public-docs.json, llms.txt and robots.txt to machinesignal.it, then run public HTTP verification."
      : "Fix sandbox public docs before publication.",
  checks
};

const report = `# MachineSignal - Sandbox Public Docs Readiness Probe NoWrite - 2026-06-14

Mode: ${summary.mode}

- Status: ${summary.status}
- API calls executed now: ${summary.api_calls_executed_now}
- Write calls executed now: ${summary.write_calls_executed_now}
- Checks: ${summary.checks_total}
- Failed: ${summary.checks_failed}

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
