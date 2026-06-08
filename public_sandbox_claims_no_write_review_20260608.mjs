import fs from "node:fs";

const publicSite = "https://machinesignal.it";
const outputJson = "public_sandbox_claims_no_write_review_summary_20260608.json";
const outputMarkdown = "public_sandbox_claims_no_write_review_report_20260608.md";

const resources = [
  {
    name: "well_known_machine_discovery",
    url: `${publicSite}/.well-known/machine-discovery.json`,
    json: true,
    must: ["primary_customer_interface", "machine", "real_payment_executed", "external_contact_executed", "machine_action_pack_single_purchase_json"]
  },
  {
    name: "machine_onboarding",
    url: `${publicSite}/machine-onboarding.json`,
    json: true,
    must: ["machine_first_rule", "sandbox", "real_payment", "external_contact", "NoWrite"]
  },
  {
    name: "product_catalog",
    url: `${publicSite}/product-catalog.json`,
    json: true,
    must: ["purchase-intent only", "real_payment_executed", "external_contact_executed", "action_pack"]
  },
  {
    name: "openapi",
    url: `${publicSite}/openapi.json`,
    json: true,
    must: ["/v1/purchase-intent", "action_pack_gate", "real_payment_executed", "external_contact_executed"]
  },
  {
    name: "mcp_tool_manifest",
    url: `${publicSite}/mcp-tool-manifest.json`,
    json: true,
    must: ["get_machine_action_pack_single_purchase_proof", "real_payment_executed", "external_contact_executed", "action_pack"]
  },
  {
    name: "llms",
    url: `${publicSite}/llms.txt`,
    json: false,
    must: ["Machine Action Pack Single Purchase JSON", "real_payment_executed=false", "external_contact_executed=false"]
  },
  {
    name: "marketplace_api_directory_pack",
    url: `${publicSite}/marketplace_api_directory_pack_20260606.md`,
    json: false,
    must: ["Sandbox-Only External Publication Pack", "Machine Action Pack Single Purchase Proof", "not an automatic outreach product"]
  },
  {
    name: "marketplace_publication_execution_pack",
    url: `${publicSite}/marketplace_publication_execution_pack_20260606.md`,
    json: false,
    must: ["Sandbox-Only External Publication Pack", "Machine Action Pack Single Purchase Proof", "not an automatic outreach product"]
  },
  {
    name: "external_sandbox_publication_drafts",
    url: `${publicSite}/external_sandbox_publication_drafts_20260607.json`,
    json: true,
    must: ["blocked_until_owner_approval", "Live payments", "external target contact"]
  },
  {
    name: "sandbox_only_external_publication_pack",
    url: `${publicSite}/sandbox_only_external_publication_pack_20260607.json`,
    json: true,
    must: ["blocked_without_owner_approval", "real_payments", "external_outreach"]
  },
  {
    name: "action_pack_single_purchase_report",
    url: `${publicSite}/machine_action_pack_single_purchase_report_20260608.md`,
    json: false,
    must: ["Machine Action Pack Single Purchase", "Approval gate default state: blocked", "External contact executed: False"]
  },
  {
    name: "action_pack_single_purchase_json",
    url: `${publicSite}/machine_action_pack_single_purchase_summary_20260608.json`,
    json: true,
    must: ["completed_action_pack_single_purchase", "email_blocked_without_approval", "external_contact_executed"]
  }
];

const hardFailPatterns = [
  {
    code: "real_payment_true",
    regex: /"real_payment_executed"\s*:\s*true|Real payment executed:\s*True/i,
    reason: "Public material must not claim a real payment was executed."
  },
  {
    code: "external_contact_true",
    regex: /"external_contact_executed"\s*:\s*true|External contact executed:\s*True/i,
    reason: "Public material must not claim an external contact was executed."
  },
  {
    code: "real_invoice_true",
    regex: /"real_invoice_issued"\s*:\s*true|Fiscal invoice issued:\s*True/i,
    reason: "Public material must not claim a real fiscal invoice was issued."
  },
  {
    code: "live_mode_allowed_true",
    regex: /"live_mode_allowed"\s*:\s*true|"ready_for_real_payments"\s*:\s*true/i,
    reason: "Public material must not claim live payments are enabled."
  },
  {
    code: "paid_plans_active",
    regex: /public paid plans are active|live paid plans are active|monetized checkout is active/i,
    reason: "Public material must not say paid production plans are active."
  },
  {
    code: "automatic_external_outreach_claim",
    regex: /automatically sends? (emails?|outreach|messages?)|contacts? external targets automatically|sends? outreach automatically/i,
    reason: "Action Pack must not be represented as automatic outreach."
  }
];

const positiveRules = [
  {
    name: "sandbox_or_beta_language",
    description: "Resource states sandbox or beta context.",
    test: (text) => /sandbox|beta/i.test(text)
  },
  {
    name: "payment_safety_language",
    description: "Resource states payment is disabled, false, test-mode or blocked.",
    test: (text) => /real_payment_executed["\s:=]*false|real payment[^.\n]*(false|not|no|disabled|blocked)|payment[^.\n]*(test|sandbox|disabled|blocked|not executed)/i.test(text)
  },
  {
    name: "external_contact_safety_language",
    description: "Resource states external contact/outreach is disabled, false or blocked.",
    test: (text) => /external_contact_executed["\s:]*false|external_contact_executed=false|external contact[^.\n]*(false|not|no|disabled|blocked)|external outreach[^.\n]*(false|not|no|disabled|blocked)|outreach[^.\n]*(not|blocked|disabled|no)/i.test(text)
  }
];

async function fetchText(url) {
  const response = await fetch(url);
  const text = await response.text();
  return {
    ok: response.ok,
    status: response.status,
    text
  };
}

function parseJsonMaybe(text) {
  try {
    return { ok: true, value: JSON.parse(text), error: null };
  } catch (error) {
    return { ok: false, value: null, error: error.message };
  }
}

function evaluateResource(resource, text) {
  const markerChecks = resource.must.map((marker) => ({
    marker,
    ok: text.includes(marker)
  }));
  const hardFails = hardFailPatterns
    .filter((item) => item.regex.test(text))
    .map((item) => ({
      code: item.code,
      reason: item.reason
    }));
  const positiveChecks = positiveRules.map((rule) => ({
    name: rule.name,
    description: rule.description,
    ok: rule.test(text)
  }));

  return {
    marker_checks: markerChecks,
    hard_fails: hardFails,
    positive_checks: positiveChecks,
    markers_ok: markerChecks.every((item) => item.ok),
    hard_fail_count: hardFails.length,
    positive_ok_count: positiveChecks.filter((item) => item.ok).length
  };
}

function jsonPath(obj, path) {
  return path.split(".").reduce((acc, key) => (acc && Object.hasOwn(acc, key) ? acc[key] : undefined), obj);
}

function writeReports(summary) {
  fs.writeFileSync(outputJson, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  const resourceRows = summary.resources.map((item) => {
    const status = item.ok ? "OK" : "FAIL";
    const missing = item.marker_checks.filter((check) => !check.ok).map((check) => check.marker).join(", ") || "-";
    const hardFails = item.hard_fails.map((fail) => fail.code).join(", ") || "-";
    return `| ${item.name} | ${status} | ${item.http_status} | ${item.bytes} | ${missing} | ${hardFails} |`;
  }).join("\n");

  const hardFailRows = summary.hard_fails.length
    ? summary.hard_fails.map((item) => `| ${item.resource} | ${item.code} | ${item.reason} |`).join("\n")
    : "| - | - | - |";

  const md = `# MachineSignal - Public Sandbox Claims NoWrite Review - 2026-06-08

## Result

Status: ${summary.status}

OK: ${summary.ok}

Mode: ${summary.mode}

Resources checked: ${summary.resources_checked}

Write calls executed: ${summary.write_calls_executed}

POST calls executed: ${summary.post_calls_executed}

Real payment executed: ${summary.real_payment_executed}

External contact executed: ${summary.external_contact_executed}

## What Was Checked

This review checks whether public MachineSignal materials clearly preserve the current beta/sandbox position:

- no real payment is active;
- no real invoice is issued;
- no external target contact is executed;
- Action Pack is a CRM/workflow preparation product, not automatic outreach;
- public marketplace/directory material remains sandbox-only and owner-approval gated.

## Resource Results

| Resource | Status | HTTP | Bytes | Missing markers | Hard fails |
|---|---|---:|---:|---|---|
${resourceRows}

## Hard Fail Details

| Resource | Code | Reason |
|---|---|---|
${hardFailRows}

## Interpretation

The latest public copy and machine-readable manifests are aligned with the sandbox-only model if this review is OK. Machines can discover the product ladder, read the Action Pack proof and understand that the payload prepares CRM/workflow actions while external outreach stays blocked by default.

## Recommended Next Step

Proceed with a no-write packaging review for API-directory and MCP/tool-registry submission wording. Do not enable real payments, real paid plans, public production monetization or external outreach.
`;

  fs.writeFileSync(outputMarkdown, md, "utf8");
}

const startedAt = new Date().toISOString();
const results = [];
const hardFails = [];

for (const resource of resources) {
  const fetched = await fetchText(resource.url);
  const json = resource.json ? parseJsonMaybe(fetched.text) : { ok: null, value: null, error: null };
  const evaluated = evaluateResource(resource, fetched.text);
  for (const fail of evaluated.hard_fails) {
    hardFails.push({
      resource: resource.name,
      ...fail
    });
  }

  const resourceOk =
    fetched.ok &&
    (!resource.json || json.ok) &&
    evaluated.markers_ok &&
    evaluated.hard_fail_count === 0;

  results.push({
    name: resource.name,
    url: resource.url,
    ok: resourceOk,
    http_status: fetched.status,
    bytes: fetched.text.length,
    json_valid: resource.json ? json.ok : null,
    json_error: resource.json ? json.error : null,
    marker_checks: evaluated.marker_checks,
    positive_checks: evaluated.positive_checks,
    positive_ok_count: evaluated.positive_ok_count,
    hard_fails: evaluated.hard_fails
  });
}

const actionPackJson = results.find((item) => item.name === "action_pack_single_purchase_json");
const actionPackPayload = actionPackJson ? parseJsonMaybe((await fetchText(actionPackJson.url)).text).value : null;

const specificChecks = [
  {
    name: "latest_action_pack_gate_blocked",
    ok: jsonPath(actionPackPayload, "action_pack.approval_gate_default_state") === "blocked",
    details: `approval_gate=${jsonPath(actionPackPayload, "action_pack.approval_gate_default_state")}`
  },
  {
    name: "latest_action_pack_email_blocked",
    ok: jsonPath(actionPackPayload, "action_pack.email_blocked_without_approval") === true,
    details: `email_blocked=${jsonPath(actionPackPayload, "action_pack.email_blocked_without_approval")}`
  },
  {
    name: "latest_action_pack_no_payment_or_contact",
    ok:
      jsonPath(actionPackPayload, "safety.real_payment_executed") === false &&
      jsonPath(actionPackPayload, "safety.external_contact_executed") === false &&
      jsonPath(actionPackPayload, "safety.real_invoice_issued") === false,
    details: `payment=${jsonPath(actionPackPayload, "safety.real_payment_executed")}, contact=${jsonPath(actionPackPayload, "safety.external_contact_executed")}, invoice=${jsonPath(actionPackPayload, "safety.real_invoice_issued")}`
  }
];

const summary = {
  artifact: "public_sandbox_claims_no_write_review",
  generated_at: startedAt,
  status: "completed_public_sandbox_claims_no_write_review",
  ok: results.every((item) => item.ok) && hardFails.length === 0 && specificChecks.every((item) => item.ok),
  mode: "NoWritePublicClaimsReview",
  public_site: publicSite,
  resources_checked: resources.length,
  write_calls_executed: 0,
  post_calls_executed: 0,
  real_payment_executed: false,
  external_contact_executed: false,
  real_invoice_issued: false,
  hard_fails: hardFails,
  specific_checks: specificChecks,
  resources: results,
  recommended_next_step:
    "Proceed with no-write packaging review for API-directory and MCP/tool-registry submission wording. Keep sandbox-only, no live payments and no automatic outreach."
};

if (!summary.ok) {
  summary.status = "review_failed_public_claims_need_copy_fix";
}

writeReports(summary);
console.log(JSON.stringify(summary, null, 2));
