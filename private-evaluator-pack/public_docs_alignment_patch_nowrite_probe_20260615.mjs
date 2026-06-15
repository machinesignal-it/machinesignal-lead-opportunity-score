import fs from "node:fs/promises";

const summaryPath = "private-evaluator-pack/public_docs_alignment_patch_nowrite_20260615.json";
const outDir = "private-evaluator-pack/proposed_public_docs_alignment_20260615";
const reportPath = "private-evaluator-pack/public_docs_alignment_patch_nowrite_probe_report_20260615.md";
const probeSummaryPath = "private-evaluator-pack/public_docs_alignment_patch_nowrite_probe_summary_20260615.json";

const summary = JSON.parse(await fs.readFile(summaryPath, "utf8"));
const productCatalog = JSON.parse(await fs.readFile(`${outDir}/product-catalog.json`, "utf8"));
const onboarding = JSON.parse(await fs.readFile(`${outDir}/machine-onboarding.json`, "utf8"));
const buyerKit = JSON.parse(await fs.readFile(`${outDir}/sandbox-buyer-kit.json`, "utf8"));
const llms = await fs.readFile(`${outDir}/llms.txt`, "utf8");

const checks = [
  ["summary_nowrite", summary.mode === "NoWrite"],
  ["summary_not_uploaded", summary.status === "local_patch_proposal_created_not_uploaded"],
  ["summary_publication_false", summary.authorizes_publication === false],
  ["summary_upload_false", summary.authorizes_upload === false],
  ["summary_paid_beta_false", summary.authorizes_paid_beta === false],
  ["summary_real_payments_false", summary.authorizes_real_payments === false],
  ["catalog_version_updated", productCatalog.catalog_version === "2026-06-15-beta-readiness-proposal"],
  ["catalog_status_not_live", productCatalog.status?.commercial_status === "not_live"],
  ["catalog_go_live_no_go", productCatalog.status?.go_live === "no_go"],
  ["catalog_paid_beta_not_approved", productCatalog.status?.paid_beta === "not_approved"],
  ["catalog_target_discovery_249", productCatalog.products?.target_discovery_pack_250?.price_eur === 249],
  ["catalog_score_pack_119", productCatalog.products?.score_pack_1k?.price_eur === 119],
  ["catalog_no_payment_method_collection", productCatalog.payment_mode?.payment_method_collection === false],
  ["catalog_no_invoice", productCatalog.payment_mode?.invoice_issued === false],
  ["onboarding_status_not_live", onboarding.status?.commercial_status === "not_live"],
  ["onboarding_go_live_no_go", onboarding.status?.go_live === "no_go"],
  ["onboarding_target_discovery_249", onboarding.products?.target_discovery_pack_250?.price_eur === 249],
  ["onboarding_score_pack_119", onboarding.products?.score_pack_1k?.price_eur === 119],
  ["onboarding_payment_test_mode", onboarding.payment_and_billing?.mode === "test_mode_only"],
  ["buyer_kit_not_live", buyerKit.readiness?.commercial_status === "not_live"],
  ["buyer_kit_go_live_no_go", buyerKit.readiness?.go_live === "no_go"],
  ["buyer_kit_paid_beta_not_approved", buyerKit.readiness?.paid_beta === "not_approved"],
  ["buyer_kit_production_keys_false", buyerKit.readiness?.production_keys_allowed === false],
  ["llms_target_discovery_249", llms.includes("Target Discovery Pack 250: EUR 249")],
  ["llms_score_pack_119", llms.includes("Score Pack 1k: EUR 119")],
  ["llms_not_live", llms.includes("commercial_status: not_live")],
  ["llms_no_go", llms.includes("go_live: no_go")],
  ["llms_paid_beta_not_approved", llms.includes("paid_beta: not_approved")],
  ["llms_no_real_payment", llms.includes("no real payment")]
];

const failed = checks.filter(([, pass]) => !pass).map(([check]) => check);
const probe = {
  artifact: "public_docs_alignment_patch_nowrite_probe",
  date: "2026-06-15",
  mode: "NoWrite",
  total_checks: checks.length,
  failed_checks: failed.length,
  passed: failed.length === 0,
  commercial_status: "not_live",
  go_live: "no_go",
  output_dir: outDir,
  next_step: failed.length === 0 ? "owner_review_before_any_publication_or_upload" : "fix_patch_proposal_before_owner_review",
  failed
};

const report = [
  "# MachineSignal - Public Docs Alignment Patch NoWrite Probe - 2026-06-15",
  "",
  `Mode: ${probe.mode}`,
  `Commercial status: ${probe.commercial_status}`,
  `Go-live: ${probe.go_live}`,
  `Total checks: ${probe.total_checks}`,
  `Failed checks: ${probe.failed_checks}`,
  `Result: ${probe.passed ? "PASS" : "FAIL"}`,
  "",
  "## Failed Checks",
  "",
  failed.length ? failed.map((item) => `- ${item}`).join("\n") : "None.",
  "",
  "## Guardrail",
  "",
  "This probe validates local patch proposal files only. It does not modify live public files, upload to Register.it, publish to GitHub pages, activate paid beta, collect payment methods, issue invoices or process real/personal data."
].join("\n");

await fs.writeFile(reportPath, `${report}\n`, "utf8");
await fs.writeFile(probeSummaryPath, `${JSON.stringify(probe, null, 2)}\n`, "utf8");

console.log(JSON.stringify(probe, null, 2));
