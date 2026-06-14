import fs from "node:fs";

const root = process.cwd();
const packPath = "private-evaluator-pack/sandbox_go_live_control_pack_20260614.json";
const reportPath = "private-evaluator-pack/sandbox_go_live_control_pack_probe_report_20260614.md";
const summaryPath = "private-evaluator-pack/sandbox_go_live_control_pack_probe_summary_20260614.json";

function readJson(path) {
  return JSON.parse(fs.readFileSync(path, "utf8"));
}

function exists(path) {
  return fs.existsSync(path);
}

const pack = readJson(packPath);
const openapi = readJson("openapi.json");

const checks = [];
function check(id, pass, detail, severity = "P1") {
  checks.push({ id, pass: Boolean(pass), severity, detail });
}

check("pack_exists", exists(packPath), packPath, "P0");
check("status_not_live", pack.commercial_status === "not_live", `commercial_status=${pack.commercial_status}`, "P0");
check("commercial_go_live_no_go", pack.go_live_decision === "no_go_for_commercial_go_live", `go_live_decision=${pack.go_live_decision}`, "P0");
check("allowed_stage_sandbox_only", pack.allowed_stage === "technical_sandbox_go_live_rehearsal_only", `allowed_stage=${pack.allowed_stage}`, "P0");
check("real_payment_blocked", pack.sandbox_limits?.payment_collection_allowed === false, "payment_collection_allowed must be false", "P0");
check("invoice_blocked", pack.sandbox_limits?.invoice_issuance_allowed === false, "invoice_issuance_allowed must be false", "P0");
check("personal_data_blocked", pack.sandbox_limits?.personal_data_allowed === false, "personal_data_allowed must be false", "P0");
check("real_customer_data_blocked", pack.sandbox_limits?.real_customer_data_allowed === false, "real_customer_data_allowed must be false", "P0");
check("external_contact_blocked", pack.sandbox_limits?.external_contact_allowed === false, "external_contact_allowed must be false", "P0");
check("idempotency_required", pack.sandbox_limits?.idempotency_required_for_post === true, "idempotency_required_for_post must be true", "P0");
check("post_cap_bounded", pack.sandbox_limits?.max_post_calls_per_rehearsal <= 5, `max_post_calls=${pack.sandbox_limits?.max_post_calls_per_rehearsal}`, "P0");

for (const endpoint of pack.allowed_callable_sandbox_endpoints ?? []) {
  check(
    `openapi_has_${endpoint.method}_${endpoint.path}`,
    Boolean(openapi.paths?.[endpoint.path]),
    `${endpoint.method} ${endpoint.path}`,
    "P0"
  );
  if (endpoint.method === "POST") {
    check(
      `post_requires_idempotency_${endpoint.path}`,
      endpoint.requires_idempotency_key === true,
      `${endpoint.path} requires_idempotency_key=${endpoint.requires_idempotency_key}`,
      "P0"
    );
    check(
      `post_write_cap_bounded_${endpoint.path}`,
      Number(endpoint.write_cap) >= 0 && Number(endpoint.write_cap) <= 3,
      `${endpoint.path} write_cap=${endpoint.write_cap}`,
      "P0"
    );
  }
  check(
    `no_real_payment_${endpoint.path}`,
    endpoint.real_payment === false,
    `${endpoint.path} real_payment=${endpoint.real_payment}`,
    "P0"
  );
  check(
    `no_real_data_${endpoint.path}`,
    endpoint.real_data_allowed === false,
    `${endpoint.path} real_data_allowed=${endpoint.real_data_allowed}`,
    "P0"
  );
}

for (const excluded of pack.explicitly_excluded_from_public_sandbox ?? []) {
  check(
    `excluded_present_${excluded}`,
    true,
    `${excluded} is explicitly excluded from public sandbox`,
    "P1"
  );
}

for (const phrase of pack.public_copy_guardrails?.must_say ?? []) {
  check(`must_say_${phrase}`, Boolean(phrase), phrase, "P2");
}
for (const phrase of pack.public_copy_guardrails?.must_not_say ?? []) {
  check(`must_not_say_${phrase}`, Boolean(phrase), phrase, "P2");
}

for (const required of [
  "machine-onboarding.json",
  "product-catalog.json",
  "openapi.json",
  "postman_public_collection.json",
  "llms.txt",
  "private-evaluator-pack/test_phase_completion_gate_nowrite_20260614.md"
]) {
  check(`required_asset_${required}`, exists(required), required, "P0");
}

const failed = checks.filter(c => !c.pass);
const summary = {
  probe_id: "sandbox_go_live_control_pack_probe_20260614",
  status: failed.length === 0 ? "pass" : "fail",
  checks_total: checks.length,
  checks_failed: failed.length,
  failed_checks: failed,
  forbidden_actions_confirmed_blocked: {
    real_payments: pack.sandbox_limits?.payment_collection_allowed === false,
    invoices: pack.sandbox_limits?.invoice_issuance_allowed === false,
    personal_data: pack.sandbox_limits?.personal_data_allowed === false,
    real_customer_data: pack.sandbox_limits?.real_customer_data_allowed === false,
    external_contact: pack.sandbox_limits?.external_contact_allowed === false
  },
  next_allowed_step: failed.length === 0
    ? "bounded_sandbox_go_live_rehearsal_nowrite_or_write_capped_with_owner_approval"
    : "fix_control_pack_before_rehearsal"
};

const lines = [
  "# Sandbox Go-Live Control Pack Probe - 2026-06-14",
  "",
  `Status: ${summary.status}`,
  "",
  `Checks: ${summary.checks_total}`,
  `Failed: ${summary.checks_failed}`,
  "",
  "## Result",
  "",
  failed.length === 0
    ? "The control pack is internally consistent for a NoWrite sandbox go-live preparation. It does not authorize commercial go-live, payment collection, invoices, real data, personal data, outreach, production keys, marketplace publication or hosted MCP."
    : "The control pack has blocking failures and must not proceed to rehearsal.",
  "",
  "## Checks",
  "",
  "| Check | Status | Severity | Detail |",
  "|---|---:|---:|---|",
  ...checks.map(c => `| ${c.id} | ${c.pass ? "pass" : "fail"} | ${c.severity} | ${String(c.detail).replaceAll("|", "/")} |`),
  "",
  "## Next Step",
  "",
  summary.next_allowed_step
];

fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
fs.writeFileSync(reportPath, lines.join("\n"));

console.log(JSON.stringify(summary, null, 2));
