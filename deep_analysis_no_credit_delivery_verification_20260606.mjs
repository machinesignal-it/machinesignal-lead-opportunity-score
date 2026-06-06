import fs from "node:fs";
import assert from "node:assert/strict";
import { handleRequest } from "./api_endpoint_minimal/core.mjs";

const baseUrl = "https://machinesignal-api.beta-878.workers.dev";
const runId = "deep-analysis-no-credit-delivery-verification-20260606";

async function fetchJson(url) {
  const response = await fetch(url);
  const text = await response.text();
  return {
    status: response.status,
    body: JSON.parse(text),
    length: text.length
  };
}

async function fetchText(url) {
  const response = await fetch(url);
  const text = await response.text();
  return {
    status: response.status,
    body: text,
    length: text.length
  };
}

const productCatalog = await fetchJson(`${baseUrl}/product-catalog.json`);
assert.equal(productCatalog.status, 200);

const liveDeepProduct = productCatalog.body.products.deep_analysis_pack_100;
const requiredOutputFields = [
  "commercial_evidence",
  "machine_decision_matrix",
  "action_pack_purchase_gate",
  "crm_summary_payload",
  "sector_specific_signals",
  "evidence_limitations"
];
const liveProductChecks = requiredOutputFields.map((field) => ({
  field,
  present: Array.isArray(liveDeepProduct.output_fields) && liveDeepProduct.output_fields.includes(field)
}));
assert.ok(liveProductChecks.every((item) => item.present));

const liveLlms = await fetchText(`${baseUrl}/llms.txt`);
assert.equal(liveLlms.status, 200);
const liveLlmsChecks = [
  {
    check: "deep_analysis_delivery_contract_present",
    passed: liveLlms.body.includes("Deep Analysis delivery contract")
  },
  {
    check: "deep_analysis_version_present",
    passed: liveLlms.body.includes("domain_specific_commercial_evidence_v1")
  },
  {
    check: "action_pack_gate_documented",
    passed: liveLlms.body.includes("action_pack_purchase_gate")
  }
];
assert.ok(liveLlmsChecks.every((item) => item.passed));

const localResponse = await handleRequest(
  new Request("http://localhost/v1/purchase-intent", {
    method: "POST",
    body: JSON.stringify({
      product_code: "deep_analysis",
      domain: "strong-clinic.it",
      sector_hint: "dentist",
      area: "Lombardy",
      commercial_objective:
        "Find dental clinic websites that deserve CRM-ready digital opportunity action",
      source_score_request_id: "no-credit-delivery-check-score-001",
      reason: "No-credit local delivery shape verification"
    }),
    headers: {
      "content-type": "application/json",
      "x-api-key": "test-key",
      "idempotency-key": "no-credit-deep-analysis-delivery-check-001"
    }
  }),
  { MACHINESIGNAL_API_KEY: "test-key" }
);
assert.equal(localResponse.status, 200);
const localPayload = await localResponse.json();
const delivery = localPayload.delivery;

const localDeliveryChecks = [
  { check: "delivery_type", passed: delivery.delivery_type === "deep_opportunity_analysis" },
  {
    check: "deep_analysis_version",
    passed: delivery.deep_analysis_version === "domain_specific_commercial_evidence_v1"
  },
  { check: "sector_context", passed: delivery.sector_context?.code === "dentists_clinics" },
  {
    check: "commercial_evidence",
    passed: Array.isArray(delivery.commercial_evidence) && delivery.commercial_evidence.length >= 4
  },
  {
    check: "machine_decision_matrix",
    passed:
      Array.isArray(delivery.machine_decision_matrix?.buy_action_pack_if) &&
      delivery.machine_decision_matrix.buy_action_pack_if.includes("budget approval exists")
  },
  {
    check: "action_pack_purchase_gate",
    passed:
      delivery.action_pack_purchase_gate?.product_code === "action_pack" &&
      delivery.action_pack_purchase_gate?.allowed === "conditional"
  },
  {
    check: "crm_summary_payload",
    passed:
      delivery.crm_summary_payload?.domain === "strong-clinic.it" &&
      delivery.crm_summary_payload?.next_product_allowed === "conditional"
  },
  {
    check: "stop_rules",
    passed: Array.isArray(delivery.stop_rules) && delivery.stop_rules.length >= 5
  },
  {
    check: "safety_flags",
    passed: delivery.real_payment_executed === false && delivery.external_contact_executed === false
  }
];
assert.ok(localDeliveryChecks.every((item) => item.passed));

const summary = {
  ok: true,
  run_id: runId,
  generated_at: new Date().toISOString(),
  mode: "NoCreditDeliveryShapeVerification",
  base_url: baseUrl,
  live_credits_consumed: 0,
  live_payment_executed: false,
  live_external_contact_executed: false,
  local_simulation_only: true,
  live_checks: {
    product_catalog_status: productCatalog.status,
    llms_status: liveLlms.status,
    product_output_fields: liveProductChecks,
    llms_contract_checks: liveLlmsChecks
  },
  local_delivery_checks: {
    response_status: localResponse.status,
    product_code: localPayload.product_code,
    delivery_type: delivery.delivery_type,
    deep_analysis_version: delivery.deep_analysis_version,
    sector_code: delivery.sector_context.code,
    local_simulated_credit_event: localPayload.usage.current_event.credits_consumed,
    checks: localDeliveryChecks
  },
  conclusion:
    "The upgraded Deep Analysis delivery contract is visible in the live Worker documentation and produces the expected commercial evidence structure in local no-credit simulation.",
  recommended_next_step:
    "If live delivery persistence must be verified, run one bounded Deep Analysis purchase intent with a new idempotency key and stop after one credit."
};

fs.writeFileSync(
  "deep_analysis_no_credit_delivery_verification_summary_20260606.json",
  JSON.stringify(summary, null, 2)
);

const report = `# MachineSignal - Deep Analysis No-Credit Delivery Verification

Generated at: ${summary.generated_at}

Status: PASS

Mode: NoCreditDeliveryShapeVerification

## Scope

- Worker base URL: ${baseUrl}
- Live credits consumed: \`0\`
- Live payment executed: \`false\`
- Live external contact executed: \`false\`
- Local simulation only: \`true\`

## Live Worker Checks

- Product catalog reachable: \`${productCatalog.status}\`
- llms.txt reachable: \`${liveLlms.status}\`
- Deep Analysis output fields include: \`${requiredOutputFields.join("`, `")}\`
- Deep Analysis contract visible in llms.txt: \`true\`

## Local Delivery Shape

- Product code: \`${localPayload.product_code}\`
- Delivery type: \`${delivery.delivery_type}\`
- Version: \`${delivery.deep_analysis_version}\`
- Sector code: \`${delivery.sector_context.code}\`
- Commercial evidence items: \`${delivery.commercial_evidence.length}\`
- Stop rules: \`${delivery.stop_rules.length}\`
- Action Pack gate: \`${delivery.action_pack_purchase_gate.allowed}\`
- Local simulated credit event: \`${localPayload.usage.current_event.credits_consumed}\`

## Conclusion

The upgraded Deep Analysis delivery contract is visible in the live Worker documentation and produces the expected commercial evidence structure in local no-credit simulation.

## Recommended Next Step

If live delivery persistence must be verified, run one bounded Deep Analysis purchase intent with a new idempotency key and stop after one credit.
`;

fs.writeFileSync("deep_analysis_no_credit_delivery_verification_readout_20260606.md", report);
console.log(JSON.stringify(summary, null, 2));
