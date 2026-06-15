import fs from "node:fs/promises";
import path from "node:path";

const workspaceRoot = "C:/Users/natal/Documents/Codex/2026-05-24/vorrei-ora-creare-un-agente-che";
const siteDir = `${workspaceRoot}/machinesignal_site`;
const outDir = "private-evaluator-pack/proposed_public_docs_alignment_20260615";

const statusBlock = {
  commercial_status: "not_live",
  go_live: "no_go",
  paid_beta: "not_approved",
  readiness_mode: "sandbox_and_nowrite_readiness_only",
  publication_status: "local_patch_proposal_not_uploaded",
  payment_mode: {
    sandbox: "purchase-intent and payment-test only",
    real_payment_executed: false,
    payment_method_collection: false,
    invoice_issued: false
  },
  legal_privacy_status: {
    terms_final: false,
    privacy_final: false,
    admin_fiscal_path_approved: false,
    support_sla_final: false
  },
  data_policy: {
    personal_data_allowed: false,
    real_customer_data_allowed: false,
    allowed_now: [
      "synthetic data",
      "demo-domain tests",
      "public non-personal business signals",
      "NoWrite public observations"
    ]
  },
  key_policy: {
    sandbox_keys_allowed: true,
    production_keys_allowed: false,
    production_key_gate: [
      "owner approval",
      "legal/privacy review",
      "admin/fiscal approval",
      "payment/support/cost guard readiness"
    ]
  }
};

function updateProducts(products) {
  if (products.target_discovery_pack_250) {
    products.target_discovery_pack_250.name = "Target Discovery Pack 250";
    products.target_discovery_pack_250.price_eur = 249;
    products.target_discovery_pack_250.includes = [
      "market availability pre-check",
      "commercial objective normalization",
      "opportunity hypothesis",
      "250 normalized and deduplicated coherent targets when the market is available",
      "domain when available",
      "category",
      "area",
      "initial opportunity signals",
      "reason for inclusion",
      "JSON or CSV export"
    ];
  }
  if (products.score_pack_1k) {
    products.score_pack_1k.price_eur = 119;
    products.score_pack_1k.includes = [
      "list cleaning",
      "deduplication",
      "exclusion of invalid or non-analyzable records",
      "opportunity_score",
      "confidence",
      "commercial_strength",
      "spend_policy",
      "allowed next products",
      "operational decision",
      "short reason",
      "priority",
      "recommended next purchase"
    ];
  }
}

async function readJson(file) {
  return JSON.parse(await fs.readFile(file, "utf8"));
}

async function writeJson(file, data) {
  await fs.writeFile(file, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

await fs.mkdir(outDir, { recursive: true });

const productCatalog = await readJson(`${siteDir}/product-catalog.json`);
productCatalog.catalog_version = "2026-06-15-beta-readiness-proposal";
productCatalog.status = statusBlock;
productCatalog.payment_mode = {
  beta: "purchase-intent and payment-test only",
  real_payment_executed: false,
  payment_method_collection: false,
  invoice_issued: false,
  external_contact_executed: false,
  note: "This local patch proposal does not activate paid beta. It aligns public machine-readable wording before any owner-approved publication."
};
updateProducts(productCatalog.products);
await writeJson(`${outDir}/product-catalog.json`, productCatalog);

const onboarding = await readJson(`${siteDir}/machine-onboarding.json`);
onboarding.status = statusBlock;
if (onboarding.products) updateProducts(onboarding.products);
onboarding.payment_and_billing = {
  mode: "test_mode_only",
  live_checkout_enabled: false,
  payment_method_collection: false,
  invoice_issued: false,
  allowed_states: [
    "draft_intent",
    "test_payment_pending",
    "test_payment_authorized",
    "test_payment_failed",
    "sandbox_fulfillment_ready",
    "sandbox_fulfilled",
    "test_credit_reversal",
    "blocked_requires_owner"
  ]
};
onboarding.support_policy_summary = {
  support_interface: "machine_readable_first",
  human_escalation: [
    "owner approval decisions",
    "legal/fiscal questions",
    "policy exceptions",
    "severe incidents"
  ],
  refunds_now: "simulated credits only; no real refunds because no real payments are accepted"
};
await writeJson(`${outDir}/machine-onboarding.json`, onboarding);

const buyerKit = await readJson("sandbox-buyer-kit/sandbox-buyer-kit.json");
buyerKit.version = "2026-06-15-beta-readiness-proposal";
buyerKit.readiness = {
  ...buyerKit.readiness,
  commercial_status: "not_live",
  go_live: "no_go",
  paid_beta: "not_approved",
  payment_method_collection: false,
  invoice_issued: false,
  production_keys_allowed: false,
  real_customer_data_allowed: false,
  personal_data_allowed: false
};
buyerKit.publication_status = "local_patch_proposal_not_uploaded";
buyerKit.owner_gate = {
  required_before_paid_beta: [
    "owner approval",
    "legal/privacy review",
    "admin/fiscal path approval",
    "test-mode payment lifecycle validation",
    "support/refund/credit policy approval",
    "cost guard active"
  ]
};
await writeJson(`${outDir}/sandbox-buyer-kit.json`, buyerKit);

const llms = await fs.readFile(`${siteDir}/llms.txt`, "utf8");
const alignedLlms = llms
  .replace("Target Discovery Pack: EUR 149 for 250 coherent targets after market availability pre-check;", "Target Discovery Pack 250: EUR 249 for 250 coherent targets after market availability pre-check;")
  .replace("Score Pack 1k: EUR 99 for 1000 valid scores;", "Score Pack 1k: EUR 119 for 1000 valid scores;")
  .replace("Commercial model under test:", [
    "Commercial model under test:",
    "- commercial_status: not_live;",
    "- go_live: no_go;",
    "- paid_beta: not_approved;",
    "- payment mode: purchase-intent and payment-test only, no real payment, no payment-method collection, no invoice;",
    "- data policy: synthetic/demo/public non-personal business signals only during readiness;",
    "- production API keys: blocked until owner, legal/privacy, admin/fiscal, payment/support and cost gates pass;"
  ].join("\n"));
await fs.writeFile(`${outDir}/llms.txt`, alignedLlms, "utf8");

const summary = {
  artifact: "public_docs_alignment_patch_nowrite",
  date: "2026-06-15",
  mode: "NoWrite",
  status: "local_patch_proposal_created_not_uploaded",
  output_dir: outDir,
  files_created: [
    `${outDir}/product-catalog.json`,
    `${outDir}/machine-onboarding.json`,
    `${outDir}/sandbox-buyer-kit.json`,
    `${outDir}/llms.txt`
  ],
  changes: [
    "updated catalog version to 2026-06-15-beta-readiness-proposal",
    "aligned Target Discovery Pack 250 price to EUR 249",
    "aligned Score Pack 1k price to EUR 119",
    "added not_live/no_go/paid_beta_not_approved status blocks",
    "added data policy boundaries",
    "added key policy boundaries",
    "added test-mode payment and support policy summaries"
  ],
  authorizes_publication: false,
  authorizes_upload: false,
  authorizes_paid_beta: false,
  authorizes_real_payments: false
};

await writeJson("private-evaluator-pack/public_docs_alignment_patch_nowrite_20260615.json", summary);

const report = [
  "# MachineSignal - Public Docs Alignment Patch NoWrite - 2026-06-15",
  "",
  "Mode: NoWrite",
  "Commercial status: not_live",
  "Go-live: no_go",
  "",
  "## Result",
  "",
  "Created local patch proposal files only. No live website files were modified and nothing was uploaded.",
  "",
  "## Proposed Files",
  "",
  ...summary.files_created.map((file) => `- ${file}`),
  "",
  "## Main Changes",
  "",
  ...summary.changes.map((change) => `- ${change}`),
  "",
  "## Guardrail",
  "",
  "This patch proposal does not authorize publication, upload, paid beta, real payments, invoices, payment-method collection, real-data processing, personal-data processing, external outreach, hosted MCP public launch or marketplace publication."
].join("\n");
await fs.writeFile("private-evaluator-pack/public_docs_alignment_patch_nowrite_20260615.md", `${report}\n`, "utf8");

console.log(JSON.stringify(summary, null, 2));
