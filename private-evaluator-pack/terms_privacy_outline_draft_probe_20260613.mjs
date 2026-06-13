import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const packDir = path.join(root, "private-evaluator-pack");
const jsonPath = path.join(packDir, "terms_privacy_outline_draft_20260613.json");
const mdPath = path.join(packDir, "terms_privacy_outline_draft_20260613.md");
const reportPath = path.join(packDir, "terms_privacy_outline_draft_probe_report_20260613.md");
const summaryPath = path.join(packDir, "terms_privacy_outline_draft_probe_summary_20260613.json");

const summary = {
  probe_id: "terms_privacy_outline_draft_probe_20260613",
  created_at: new Date().toISOString(),
  files_checked: [jsonPath, mdPath],
  checks: [],
  errors: []
};

function check(name, ok, detail = "") {
  summary.checks.push({ name, ok, detail });
  if (!ok) summary.errors.push({ name, detail });
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function hasAll(haystack, needles) {
  const text = Array.isArray(haystack)
    ? JSON.stringify(haystack).toLowerCase()
    : String(haystack).toLowerCase();
  return needles.every((needle) => text.includes(String(needle).toLowerCase()));
}

const data = readJson(jsonPath);
const md = fs.readFileSync(mdPath, "utf8");

check("status_prepared", data.status === "prepared", data.status);
check("mode_nowrite", data.mode === "NoWrite planning", data.mode);
check("commercial_not_live", data.commercial_status === "not_live", data.commercial_status);
check("not_final_legal_document", data.legal_document_final === false, String(data.legal_document_final));
check("requires_professional_review", data.requires_professional_review === true, String(data.requires_professional_review));

const scope = data.current_allowed_scope || {};
for (const [key, expected] of Object.entries({
  sandbox_only: true,
  synthetic_data_only: true,
  real_customer_data_allowed: false,
  personal_data_processing_allowed: false,
  real_payments_allowed: false,
  invoices_allowed: false,
  external_outreach_allowed: false,
  public_marketplace_allowed: false,
  hosted_mcp_public_allowed: false
})) {
  check(`scope_${key}`, scope[key] === expected, `${scope[key]} expected ${expected}`);
}

const requiredTerms = [
  "Service scope",
  "Beta and sandbox",
  "Acceptable use",
  "Credits and valid output",
  "API keys and security",
  "Availability and limits",
  "Payments and invoices",
  "Support and escalation"
];
check("terms_sections_present", hasAll(data.terms_outline, requiredTerms), requiredTerms.join(", "));

const requiredPrivacy = [
  "Roles and responsibility",
  "Data categories",
  "Purposes and legal bases",
  "Minimization, retention and deletion",
  "Data subject rights",
  "Processors, subprocessors and transfers",
  "Cookies and website privacy",
  "Data breach"
];
check("privacy_sections_present", hasAll(data.privacy_outline, requiredPrivacy), requiredPrivacy.join(", "));

const requiredBlocks = [
  "real_payments",
  "invoices",
  "payment_method_collection",
  "external_outreach",
  "real_data_processing",
  "personal_data_processing",
  "production_api_key_issuing",
  "public_paid_marketplace",
  "hosted_mcp_public",
  "mcp_registry_publication",
  "commercial_go_live"
];
check("blocked_items_present", hasAll(data.blocked_until_owner_approval, requiredBlocks), requiredBlocks.join(", "));

check("owner_decisions_count", Array.isArray(data.owner_decisions_before_legal_live) && data.owner_decisions_before_legal_live.length >= 10, String(data.owner_decisions_before_legal_live?.length || 0));

const sources = data.source_refs || [];
check("source_refs_count", sources.length >= 10, String(sources.length));
check("source_refs_garante_present", sources.some((s) => s.url.includes("garanteprivacy.it")), "garanteprivacy.it");
check("source_refs_ec_present", sources.some((s) => s.url.includes("commission.europa.eu")), "commission.europa.eu");

check("readiness_no_go", data.readiness_impact?.commercial_go_live_status === "no_go", data.readiness_impact?.commercial_go_live_status);
check("readiness_after_45", data.readiness_impact?.legal_privacy_readiness_after_outline === 45, String(data.readiness_impact?.legal_privacy_readiness_after_outline));
check("next_action_terms_privacy_agent_review", data.recommended_next_action === "terms_privacy_agent_review", data.recommended_next_action);

const forbiddenClaims = [
  "legal approved",
  "privacy approved",
  "commercial live enabled",
  "payment enabled",
  "real data allowed",
  "production keys enabled",
  "go-live commerciale: go"
];
for (const claim of forbiddenClaims) {
  check(`forbidden_claim_absent_${claim.replaceAll(" ", "_")}`, !md.toLowerCase().includes(claim), claim);
}

check("md_not_legal_final_notice", md.toLowerCase().includes("non e' un documento legale definitivo"), "notice");
check("md_sources_present", md.includes("https://www.garanteprivacy.it/regolamentoue") && md.includes("https://commission.europa.eu/"), "official links");
check("md_next_action_present", md.includes("terms_privacy_agent_review"), "next action");

const report = [
  "# Terms Privacy Outline Draft Probe - 2026-06-13",
  "",
  `Checks: ${summary.checks.length}`,
  `Errors: ${summary.errors.length}`,
  "",
  summary.errors.length === 0 ? "Result: PASS" : "Result: FAIL",
  "",
  "## Errors",
  "",
  summary.errors.length === 0 ? "None." : summary.errors.map((e) => `- ${e.name}: ${e.detail}`).join("\n")
].join("\n");

fs.writeFileSync(reportPath, report, "utf8");
fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2), "utf8");

if (summary.errors.length) {
  console.error(report);
  process.exit(1);
}

console.log(report);
