import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const packDir = path.join(root, "private-evaluator-pack");
const jsonPath = path.join(packDir, "public_wording_remediation_draft_nowrite_20260613.json");
const mdPath = path.join(packDir, "public_wording_remediation_draft_nowrite_20260613.md");
const reportPath = path.join(packDir, "public_wording_remediation_draft_nowrite_probe_report_20260613.md");
const summaryPath = path.join(packDir, "public_wording_remediation_draft_nowrite_probe_summary_20260613.json");

const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
const md = fs.readFileSync(mdPath, "utf8");

const probe = {
  probe_id: "public_wording_remediation_draft_nowrite_probe_20260613",
  created_at: new Date().toISOString(),
  checks: [],
  errors: []
};

function check(name, ok, detail = "") {
  probe.checks.push({ name, ok, detail });
  if (!ok) probe.errors.push({ name, detail });
}

function containsAll(value, needles) {
  const text = JSON.stringify(value).toLowerCase();
  return needles.every((needle) => text.includes(String(needle).toLowerCase()));
}

check("status_prepared", data.status === "prepared", data.status);
check("mode_nowrite", data.mode === "NoWrite planning", data.mode);
check("source_scan_present", data.source_scan === "public_wording_scan_nowrite_20260613", data.source_scan);
check("commercial_not_live", data.commercial_status === "not_live", data.commercial_status);
check("go_live_no_go", data.go_live_decision === "no_go", data.go_live_decision);
check("does_not_apply_public_changes", data.applies_changes_to_public_files === false, String(data.applies_changes_to_public_files));
check("five_remediation_items", Array.isArray(data.remediation_items) && data.remediation_items.length === 5, String(data.remediation_items?.length || 0));

const itemIds = ["RW1", "RW2", "RW3", "RW4", "RW5"];
check("item_ids_present", containsAll(data.remediation_items, itemIds), itemIds.join(", "));
check("target_files_present", containsAll(data.remediation_items, ["README.md", "api_endpoint_minimal/core.mjs", "docs/api-directory-listing.md"]), "target files");
check("all_items_have_proposed_text", data.remediation_items.every((item) => item.current_text && item.proposed_text && item.reason), "current/proposed/reason");

const proposedText = data.remediation_items.map((item) => item.proposed_text).join("\n").toLowerCase();
const forbiddenInProposed = ["send outreach", "production api key", "guaranteed revenue"];
for (const phrase of forbiddenInProposed) {
  check(`proposed_text_avoids_${phrase.replaceAll(" ", "_")}`, !proposedText.includes(phrase), phrase);
}

check("expected_zero_findings", data.expected_after_remediation?.findings_total === 0 && data.expected_after_remediation?.critical === 0 && data.expected_after_remediation?.high === 0, JSON.stringify(data.expected_after_remediation));
check("owner_approval_still_required", data.expected_after_remediation?.still_requires_owner_approval_before_publication === true, String(data.expected_after_remediation?.still_requires_owner_approval_before_publication));

const hardBlocks = ["real_payments", "invoices", "payment_method_collection", "external_outreach", "email_sending_to_humans", "real_data_processing", "personal_data_processing", "production_api_key_issuing", "public_paid_marketplace", "hosted_mcp_public", "mcp_registry_publication", "commercial_go_live"];
check("hard_blocks_preserved", containsAll(data.hard_blocks_preserved, hardBlocks), hardBlocks.join(", "));
check("readiness_go_live_no_go", data.readiness_after_draft?.go_live_status === "no_go", data.readiness_after_draft?.go_live_status);
check("next_action_apply_remediation", data.recommended_next_action === "apply_public_wording_remediation_nowrite", data.recommended_next_action);

const forbiddenClaims = [
  "commercial_status\": \"live\"",
  "go_live_decision\": \"go\"",
  "applies_changes_to_public_files\": true",
  "pubblicazione approvata",
  "go-live: go"
];
for (const claim of forbiddenClaims) {
  check(`forbidden_claim_absent_${claim.replace(/[^a-z0-9]+/gi, "_")}`, !JSON.stringify(data).toLowerCase().includes(claim.toLowerCase()) && !md.toLowerCase().includes(claim.toLowerCase()), claim);
}

check("md_contains_no_public_change", md.includes("Modifica file pubblici: no"), "no public change");
check("md_next_action_present", md.includes("apply_public_wording_remediation_nowrite"), "next action");

const report = [
  "# Public Wording Remediation Draft NoWrite Probe - 2026-06-13",
  "",
  `Checks: ${probe.checks.length}`,
  `Errors: ${probe.errors.length}`,
  "",
  probe.errors.length === 0 ? "Result: PASS" : "Result: FAIL",
  "",
  "## Errors",
  "",
  probe.errors.length === 0 ? "None." : probe.errors.map((e) => `- ${e.name}: ${e.detail}`).join("\n")
].join("\n");

fs.writeFileSync(reportPath, report, "utf8");
fs.writeFileSync(summaryPath, JSON.stringify(probe, null, 2), "utf8");

if (probe.errors.length) {
  console.error(report);
  process.exit(1);
}

console.log(report);
