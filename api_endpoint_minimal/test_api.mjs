import assert from "node:assert/strict";
import { handleRequest, scoreLeadOpportunity } from "./core.mjs";

const sample = {
  domain: "clinic3.it",
  sector_hint: "dentist",
  country_hint: "IT"
};

const score = scoreLeadOpportunity(sample);
assert.equal(score.domain, "clinic3.it");
assert.equal(score.beta, true);
assert.equal(typeof score.opportunity_score, "number");
assert.ok(score.opportunity_score >= 0 && score.opportunity_score <= 100);
assert.ok(["low", "medium", "high"].includes(score.priority));
assert.ok(["discard", "watchlist", "nurture", "buy_deep_analysis", "needs_verification"].includes(score.decision));
assert.equal(score.recommended_action, score.decision);
assert.equal(score.product_level, "score_base");
assert.equal(typeof score.next_purchase, "object");
assert.equal(typeof score.machine_next_step, "object");

const aestheticScore = scoreLeadOpportunity({
  domain: "quinta-essenza.com",
  sector_hint: "medicina estetica",
  country_hint: "IT"
});
assert.equal(aestheticScore.decision, "buy_deep_analysis");
assert.ok(aestheticScore.opportunity_score >= 75);
assert.equal(aestheticScore.next_purchase.next_product, "deep_analysis");

const aestheticMismatchScore = scoreLeadOpportunity({
  domain: "bianchiosteopata.it",
  sector_hint: "medicina estetica",
  country_hint: "IT",
  target_name: "NeoClinic",
  category_hint: "osteopata"
});
assert.equal(aestheticMismatchScore.decision, "needs_verification");
assert.equal(aestheticMismatchScore.quality_review.status, "sector_mismatch_needs_verification");
assert.equal(aestheticMismatchScore.next_purchase.next_product, "verification");

const healthResponse = await handleRequest(new Request("http://localhost/health"));
assert.equal(healthResponse.status, 200);
assert.equal((await healthResponse.json()).status, "ok");

const rootResponse = await handleRequest(new Request("http://localhost/"));
assert.equal(rootResponse.status, 200);
const rootPayload = await rootResponse.json();
assert.equal(rootPayload.docs.usage, "/v1/usage");
assert.equal(rootPayload.docs.machine_onboarding, "/machine-onboarding.json");
assert.equal(rootPayload.docs.product_catalog, "/product-catalog.json");
assert.equal(rootPayload.docs.authenticated_onboarding, "/v1/onboarding");

const openApiResponse = await handleRequest(new Request("http://localhost/openapi.json"));
assert.equal(openApiResponse.status, 200);
const openApiPayload = await openApiResponse.json();
assert.ok(openApiPayload.paths["/v1/usage"]);
assert.ok(openApiPayload.paths["/v1/purchase-intent"]);
assert.ok(openApiPayload.paths["/machine-onboarding.json"]);
assert.ok(openApiPayload.paths["/product-catalog.json"]);
assert.ok(openApiPayload.paths["/v1/onboarding"]);
assert.ok(openApiPayload.components.schemas.PurchaseIntentRequest);

const postmanResponse = await handleRequest(new Request("http://localhost/postman_collection.json"));
assert.equal(postmanResponse.status, 200);
const postmanPayload = await postmanResponse.json();
assert.equal(postmanPayload.item[1].name, "Read usage ledger");
assert.equal(postmanPayload.item[2].name, "Fetch product catalog");
assert.equal(postmanPayload.item[3].name, "Create beta purchase intent");
assert.ok(postmanPayload.item.some((item) => item.name === "Fetch machine onboarding manifest"));
assert.ok(postmanPayload.item.some((item) => item.name === "Read authenticated onboarding"));

const productCatalogResponse = await handleRequest(new Request("http://localhost/product-catalog.json"));
assert.equal(productCatalogResponse.status, 200);
const productCatalogPayload = await productCatalogResponse.json();
assert.equal(productCatalogPayload.products.score_pack_1k.price_eur, 99);
assert.equal(productCatalogPayload.products.target_discovery_pack_250.price_eur, 149);
assert.equal(productCatalogPayload.products.domain_enrichment_pack_100.price_eur, 149);

const llmsResponse = await handleRequest(new Request("http://localhost/llms.txt"));
assert.equal(llmsResponse.status, 200);
const llmsText = await llmsResponse.text();
assert.ok(llmsText.includes("Idempotency-Key"));
assert.ok(llmsText.includes("/v1/purchase-intent"));
assert.ok(llmsText.includes("/product-catalog.json"));
assert.ok(llmsText.includes("Machine-first rule"));

const machineOnboardingResponse = await handleRequest(new Request("http://localhost/machine-onboarding.json"));
assert.equal(machineOnboardingResponse.status, 200);
const machineOnboardingPayload = await machineOnboardingResponse.json();
assert.equal(machineOnboardingPayload.primary_customer_interface, "machine");
assert.equal(machineOnboardingPayload.discovery.product_catalog, "/product-catalog.json");
assert.equal(machineOnboardingPayload.discovery.authenticated_onboarding, "/v1/onboarding");
assert.equal(machineOnboardingPayload.recommended_agent_policy.must_not_execute_external_outreach, true);

const badResponse = await handleRequest(
  new Request("http://localhost/v1/lead-opportunity-score", {
    method: "POST",
    body: "{}",
    headers: { "content-type": "application/json" }
  })
);
assert.equal(badResponse.status, 400);

const unauthorizedResponse = await handleRequest(
  new Request("http://localhost/v1/lead-opportunity-score", {
    method: "POST",
    body: JSON.stringify(sample),
    headers: { "content-type": "application/json" }
  }),
  { MACHINESIGNAL_API_KEY: "test-key" }
);
assert.equal(unauthorizedResponse.status, 401);

const okResponse = await handleRequest(
  new Request("http://localhost/v1/lead-opportunity-score", {
    method: "POST",
    body: JSON.stringify(sample),
    headers: {
      "content-type": "application/json",
      "x-api-key": "test-key",
      "idempotency-key": "test-score-001"
    }
  }),
  { MACHINESIGNAL_API_KEY: "test-key" }
);
assert.equal(okResponse.status, 200);
const okPayload = await okResponse.json();
assert.equal(okPayload.domain, "clinic3.it");
assert.equal(okPayload.request_id, "test-score-001");
assert.equal(okPayload.usage.current_event.credits_consumed, 1);
assert.equal(okPayload.usage.current_event.product_code, "score_pack_1k");
assert.equal(okPayload.usage.balances.find((item) => item.product_code === "score_pack_1k").credits_remaining, 999);

const duplicateResponse = await handleRequest(
  new Request("http://localhost/v1/lead-opportunity-score", {
    method: "POST",
    body: JSON.stringify(sample),
    headers: {
      "content-type": "application/json",
      "x-api-key": "test-key",
      "idempotency-key": "test-score-001"
    }
  }),
  { MACHINESIGNAL_API_KEY: "test-key" }
);
const duplicatePayload = await duplicateResponse.json();
assert.equal(duplicatePayload.usage.current_event.duplicate_request, true);
assert.equal(duplicatePayload.usage.balances.find((item) => item.product_code === "score_pack_1k").credits_remaining, 999);

const usageResponse = await handleRequest(
  new Request("http://localhost/v1/usage", {
    method: "GET",
    headers: { "x-api-key": "test-key" }
  }),
  { MACHINESIGNAL_API_KEY: "test-key" }
);
assert.equal(usageResponse.status, 200);
const usagePayload = await usageResponse.json();
assert.equal(usagePayload.balances.find((item) => item.product_code === "score_pack_1k").credits_used, 1);
assert.equal(usagePayload.real_payment_executed, false);
assert.equal(usagePayload.external_contact_executed, false);

const purchaseIntentResponse = await handleRequest(
  new Request("http://localhost/v1/purchase-intent", {
    method: "POST",
    body: JSON.stringify({
      product_code: "verification",
      domain: "clinic3.it",
      source_score_request_id: "test-score-001",
      reason: "Score recommended verification"
    }),
    headers: {
      "content-type": "application/json",
      "x-api-key": "test-key",
      "idempotency-key": "test-order-001"
    }
  }),
  { MACHINESIGNAL_API_KEY: "test-key" }
);
assert.equal(purchaseIntentResponse.status, 200);
const purchaseIntentPayload = await purchaseIntentResponse.json();
assert.equal(purchaseIntentPayload.status, "accepted_beta_order_intent");
assert.equal(purchaseIntentPayload.product_code, "verification");
assert.equal(purchaseIntentPayload.ledger_product_code, "verification_pack_100");
assert.equal(purchaseIntentPayload.real_payment_executed, false);
assert.equal(purchaseIntentPayload.usage.current_event.credits_consumed, 1);
assert.equal(purchaseIntentPayload.delivery.delivery_type, "data_quality_verification");
assert.equal(purchaseIntentPayload.delivery.domain, "clinic3.it");
assert.equal(purchaseIntentPayload.delivery.external_contact_executed, false);
assert.equal(purchaseIntentPayload.order.order_intent_id, purchaseIntentPayload.order_intent_id);
assert.equal(purchaseIntentPayload.order.delivery.delivery_type, "data_quality_verification");

const duplicatePurchaseIntentResponse = await handleRequest(
  new Request("http://localhost/v1/purchase-intent", {
    method: "POST",
    body: JSON.stringify({
      product_code: "verification",
      domain: "clinic3.it",
      source_score_request_id: "test-score-001"
    }),
    headers: {
      "content-type": "application/json",
      "x-api-key": "test-key",
      "idempotency-key": "test-order-001"
    }
  }),
  { MACHINESIGNAL_API_KEY: "test-key" }
);
const duplicatePurchaseIntentPayload = await duplicatePurchaseIntentResponse.json();
assert.equal(duplicatePurchaseIntentPayload.usage.current_event.duplicate_request, true);
assert.equal(
  duplicatePurchaseIntentPayload.usage.balances.find((item) => item.product_code === "verification_pack_100").credits_used,
  1
);

const targetDiscoveryResponse = await handleRequest(
  new Request("http://localhost/v1/purchase-intent", {
    method: "POST",
    body: JSON.stringify({
      product_code: "target_discovery",
      domain: "dentist-market-demo.it",
      market: "dentists",
      area: "Milan",
      reason: "Customer machine needs a starting target list"
    }),
    headers: {
      "content-type": "application/json",
      "x-api-key": "test-key",
      "idempotency-key": "test-target-discovery-001"
    }
  }),
  { MACHINESIGNAL_API_KEY: "test-key" }
);
assert.equal(targetDiscoveryResponse.status, 200);
const targetDiscoveryPayload = await targetDiscoveryResponse.json();
assert.equal(targetDiscoveryPayload.product_code, "target_discovery");
assert.equal(targetDiscoveryPayload.ledger_product_code, "target_discovery_pack_250");
assert.equal(targetDiscoveryPayload.delivery.delivery_type, "target_discovery_precheck");
assert.equal(targetDiscoveryPayload.delivery.beta_sample_targets.length, 3);
assert.equal(targetDiscoveryPayload.delivery.next_machine_call.endpoint, "/v1/lead-opportunity-score");
assert.equal(targetDiscoveryPayload.usage.current_event.credits_consumed, 1);

const domainEnrichmentResponse = await handleRequest(
  new Request("http://localhost/v1/purchase-intent", {
    method: "POST",
    body: JSON.stringify({
      product_code: "domain_enrichment",
      target_name: "Studio Dentistico Demo",
      batch_id: "dentists-lombardy-demo",
      area: "Lombardy",
      reason: "Customer machine has target names but needs reliable domains before scoring"
    }),
    headers: {
      "content-type": "application/json",
      "x-api-key": "test-key",
      "idempotency-key": "test-domain-enrichment-001"
    }
  }),
  { MACHINESIGNAL_API_KEY: "test-key" }
);
assert.equal(domainEnrichmentResponse.status, 200);
const domainEnrichmentPayload = await domainEnrichmentResponse.json();
assert.equal(domainEnrichmentPayload.product_code, "domain_enrichment");
assert.equal(domainEnrichmentPayload.ledger_product_code, "domain_enrichment_pack_100");
assert.equal(domainEnrichmentPayload.delivery.delivery_type, "domain_enrichment_decision_pack");
assert.equal(domainEnrichmentPayload.delivery.beta_sample_results.length, 3);
assert.equal(domainEnrichmentPayload.usage.current_event.credits_consumed, 1);

const ordersResponse = await handleRequest(
  new Request("http://localhost/v1/orders", {
    method: "GET",
    headers: { "x-api-key": "test-key" }
  }),
  { MACHINESIGNAL_API_KEY: "test-key" }
);
assert.equal(ordersResponse.status, 200);
const ordersPayload = await ordersResponse.json();
assert.equal(ordersPayload.count, 3);
assert.ok(ordersPayload.orders.some((order) => order.order_intent_id === purchaseIntentPayload.order_intent_id));

const filteredOrdersResponse = await handleRequest(
  new Request("http://localhost/v1/orders?product_code=verification", {
    method: "GET",
    headers: { "x-api-key": "test-key" }
  }),
  { MACHINESIGNAL_API_KEY: "test-key" }
);
assert.equal(filteredOrdersResponse.status, 200);
assert.equal((await filteredOrdersResponse.json()).count, 1);

const singleOrderResponse = await handleRequest(
  new Request(`http://localhost/v1/orders/${purchaseIntentPayload.order_intent_id}`, {
    method: "GET",
    headers: { "x-api-key": "test-key" }
  }),
  { MACHINESIGNAL_API_KEY: "test-key" }
);
assert.equal(singleOrderResponse.status, 200);
assert.equal((await singleOrderResponse.json()).order.delivery.status, "verification_ready");

const createCustomerResponse = await handleRequest(
  new Request("http://localhost/v1/beta/customers", {
    method: "POST",
    body: JSON.stringify({
      customer_id: "beta_partner_test",
      contact_email: "partner@example.com",
      plan: "beta_starter",
      score_credits: 12,
      verification_credits: 3,
      nurture_signal_credits: 2,
      deep_analysis_credits: 1,
      action_pack_credits: 1,
      domain_enrichment_credits: 1
    }),
    headers: {
      "content-type": "application/json",
      "x-api-key": "test-key"
    }
  }),
  { MACHINESIGNAL_API_KEY: "test-key" }
);
assert.equal(createCustomerResponse.status, 200);
const createCustomerPayload = await createCustomerResponse.json();
assert.equal(createCustomerPayload.customer_id, "beta_partner_test");
assert.ok(createCustomerPayload.api_key.startsWith("ms_cust_"));
assert.equal(
  createCustomerPayload.usage.balances.find((item) => item.product_code === "score_pack_1k").credits_purchased,
  12
);

const customerUsageResponse = await handleRequest(
  new Request("http://localhost/v1/usage", {
    method: "GET",
    headers: { "x-api-key": createCustomerPayload.api_key }
  }),
  { MACHINESIGNAL_API_KEY: "test-key" }
);
assert.equal(customerUsageResponse.status, 200);
const customerUsagePayload = await customerUsageResponse.json();
assert.equal(customerUsagePayload.customer_id, "beta_partner_test");
assert.equal(
  customerUsagePayload.balances.find((item) => item.product_code === "score_pack_1k").credits_remaining,
  12
);

const customerOnboardingResponse = await handleRequest(
  new Request("http://localhost/v1/onboarding", {
    method: "GET",
    headers: { "x-api-key": createCustomerPayload.api_key }
  }),
  { MACHINESIGNAL_API_KEY: "test-key" }
);
assert.equal(customerOnboardingResponse.status, 200);
const customerOnboardingPayload = await customerOnboardingResponse.json();
assert.equal(customerOnboardingPayload.customer_id, "beta_partner_test");
assert.equal(customerOnboardingPayload.auth_type, "customer");
assert.equal(customerOnboardingPayload.machine_contract.primary_customer_interface, "machine");
assert.equal(customerOnboardingPayload.customer_state.can_score, true);

const customerScoreResponse = await handleRequest(
  new Request("http://localhost/v1/lead-opportunity-score", {
    method: "POST",
    body: JSON.stringify(sample),
    headers: {
      "content-type": "application/json",
      "x-api-key": createCustomerPayload.api_key,
      "idempotency-key": "customer-score-001"
    }
  }),
  { MACHINESIGNAL_API_KEY: "test-key" }
);
assert.equal(customerScoreResponse.status, 200);
const customerScorePayload = await customerScoreResponse.json();
assert.equal(customerScorePayload.usage.customer_id, "beta_partner_test");
assert.equal(
  customerScorePayload.usage.balances.find((item) => item.product_code === "score_pack_1k").credits_remaining,
  11
);

console.log("MachineSignal minimal API tests passed.");
