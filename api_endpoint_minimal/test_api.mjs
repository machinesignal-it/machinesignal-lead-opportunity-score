import assert from "node:assert/strict";
import { handleRequest, productionGuardInternals, scoreLeadOpportunity } from "./core.mjs";

const sample = {
  domain: "clinic3.it",
  sector_hint: "dentist",
  country_hint: "IT"
};

for (const [key, value] of Object.entries(
  productionGuardInternals.DEFAULT_PRODUCTION_ACCESS_GUARD
)) {
  assert.equal(value, false, `Production guard default must remain false: ${key}`);
}

assert.equal(productionGuardInternals.classifyApiKey("ms_sbx_example"), "sandbox_customer_key");
assert.equal(productionGuardInternals.classifyApiKey("ms_live_example"), "production_customer_key");
assert.equal(productionGuardInternals.classifyApiKey("ms_admin_example"), "admin_key");
assert.equal(
  productionGuardInternals.classifyApiKey("ms_wh_test_example"),
  "test_webhook_signature"
);
assert.equal(productionGuardInternals.classifyApiKey("unknown_example"), "unknown");

const productionKeyBlocked = productionGuardInternals.buildProductionKeyBlockedResponse();
assert.equal(productionKeyBlocked.status, "blocked_production_key");
assert.equal(
  productionKeyBlocked.support_code,
  productionGuardInternals.SUPPORT_CODES.PRODUCTION_KEY_BLOCKED
);
assert.equal(productionKeyBlocked.owner_escalation_required, true);
assert.equal(productionKeyBlocked.credit_delta, 0);
assert.equal(productionKeyBlocked.production_key_active, false);
assert.equal(productionKeyBlocked.credit_consumption_enabled, false);
assert.equal(productionKeyBlocked.real_payment_executed, false);
assert.equal(productionKeyBlocked.invoice_issued, false);
assert.equal(productionKeyBlocked.external_contact_executed, false);
assert.deepEqual(productionKeyBlocked.next_allowed_actions, [
  "continue_sandbox",
  "review_owner_checklist"
]);

const killSwitchBlocked = productionGuardInternals.buildKillSwitchResponse();
assert.equal(killSwitchBlocked.status, "paused_kill_switch");
assert.equal(
  killSwitchBlocked.support_code,
  productionGuardInternals.SUPPORT_CODES.KILL_SWITCH_ACTIVE
);
assert.equal(killSwitchBlocked.severity, "critical");
assert.equal(killSwitchBlocked.owner_escalation_required, true);
assert.equal(killSwitchBlocked.credit_delta, 0);
assert.equal(killSwitchBlocked.production_key_active, false);
assert.equal(killSwitchBlocked.credit_consumption_enabled, false);
assert.equal(killSwitchBlocked.real_payment_executed, false);
assert.equal(killSwitchBlocked.invoice_issued, false);
assert.equal(killSwitchBlocked.external_contact_executed, false);

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

const realEstatePortalScore = scoreLeadOpportunity({
  domain: "immobiliare.it",
  sector_hint: "real estate agency",
  country_hint: "IT",
  target_name: "Agenzia immobiliare demo",
  category_hint: "agenzia immobiliare"
});
assert.equal(realEstatePortalScore.decision, "needs_verification");
assert.equal(realEstatePortalScore.quality_review.status, "real_estate_portal_or_franchise_needs_verification");
assert.equal(realEstatePortalScore.next_purchase.next_product, "verification");

const healthResponse = await handleRequest(new Request("http://localhost/health"));
assert.equal(healthResponse.status, 200);
assert.equal((await healthResponse.json()).status, "ok");

const rootResponse = await handleRequest(new Request("http://localhost/"));
assert.equal(rootResponse.status, 200);
const rootPayload = await rootResponse.json();
assert.equal(rootPayload.docs.usage, "/v1/usage");
assert.equal(rootPayload.docs.machine_onboarding, "/machine-onboarding.json");
assert.equal(rootPayload.docs.product_catalog, "/product-catalog.json");
assert.equal(rootPayload.docs.production_access_status, "/v1/production-access/status");
assert.equal(rootPayload.docs.authenticated_onboarding, "/v1/onboarding");
assert.equal(rootPayload.docs.intake, "/v1/intake");
assert.equal(rootPayload.docs.payment_test_intents, "/v1/payment-test/intents");
assert.equal(rootPayload.docs.payment_test_reconciliation, "/v1/payment-test/reconciliation/{payment_test_id}");
assert.equal(rootPayload.docs.postman_public_collection, "https://machinesignal.it/postman_public_collection.json");
assert.equal(rootPayload.docs.sandbox_metrics, undefined);
assert.equal(rootPayload.docs.audit_report, undefined);
assert.equal(rootPayload.docs.payment_test_report, undefined);
assert.equal(rootPayload.docs.beta_customers, undefined);

const openApiResponse = await handleRequest(new Request("http://localhost/openapi.json"));
assert.equal(openApiResponse.status, 200);
const openApiPayload = await openApiResponse.json();
assert.ok(openApiPayload.paths["/v1/usage"]);
assert.ok(openApiPayload.paths["/v1/intake"]);
assert.ok(openApiPayload.paths["/v1/purchase-intent"]);
assert.ok(openApiPayload.paths["/v1/payment-test/intents"]);
assert.ok(openApiPayload.paths["/v1/payment-test/intents/{payment_test_id}"]);
assert.ok(openApiPayload.paths["/v1/payment-test/webhooks/stripe"]);
assert.ok(openApiPayload.paths["/v1/payment-test/reconciliation/{payment_test_id}"]);
assert.ok(openApiPayload.paths["/v1/sandbox/customers"]);
assert.ok(openApiPayload.paths["/v1/production-access/status"]);
assert.ok(openApiPayload.paths["/machine-onboarding.json"]);
assert.ok(openApiPayload.paths["/product-catalog.json"]);
assert.ok(openApiPayload.paths["/v1/onboarding"]);
assert.equal(openApiPayload.paths["/v1/admin/payment-test-report"], undefined);
assert.equal(openApiPayload.paths["/v1/admin/sandbox-metrics"], undefined);
assert.equal(openApiPayload.paths["/v1/admin/audit-report"], undefined);
assert.equal(openApiPayload.paths["/v1/beta/customers"], undefined);
assert.ok(openApiPayload.components.schemas.PurchaseIntentRequest);
assert.ok(openApiPayload.components.schemas.PaymentTestIntentRequest);
assert.ok(openApiPayload.components.schemas.PaymentTestIntentResponse);
assert.ok(openApiPayload.components.schemas.PaymentTestWebhookRequest);
assert.ok(openApiPayload.components.schemas.BetaDelivery);
assert.ok(openApiPayload.components.schemas.SupportCode);
assert.ok(openApiPayload.components.schemas.ProductionAccessGuard);
assert.ok(openApiPayload.components.schemas.ProductionAccessStatus);
assert.ok(openApiPayload.components.schemas.GuardedBlockedResponse);
assert.ok(openApiPayload.components.schemas.ProductionKeyBlockedResponse);
assert.ok(openApiPayload.components.schemas.KillSwitchResponse);
assert.ok(openApiPayload.components.schemas.MachineIntakeRequest);
assert.ok(openApiPayload.components.schemas.MachineIntakeResponse);
assert.ok(
  openApiPayload.components.schemas.SupportCode.enum.includes("MS_PRODUCTION_KEY_BLOCKED")
);
assert.ok(openApiPayload.components.schemas.SupportCode.enum.includes("MS_KILL_SWITCH_ACTIVE"));
assert.equal(
  openApiPayload.components.schemas.ProductionAccessGuard.properties.real_payments_enabled.example,
  false
);
assert.equal(
  openApiPayload.components.schemas.ProductionAccessGuard.properties.invoices_enabled.example,
  false
);
assert.equal(
  openApiPayload.components.schemas.ProductionAccessGuard.properties.personal_data_enabled.example,
  false
);
assert.equal(
  openApiPayload.components.schemas.ProductionAccessGuard.properties.external_outreach_enabled.example,
  false
);
assert.equal(
  openApiPayload.components.schemas.ProductionAccessStatus.properties.real_payment_executed.example,
  false
);
assert.equal(openApiPayload.components.schemas.ProductionAccessStatus.properties.invoice_issued.example, false);
assert.equal(
  openApiPayload.components.schemas.ProductionAccessStatus.properties.external_contact_executed.example,
  false
);
assert.equal(
  openApiPayload.components.schemas.ProductionKeyBlockedResponse.example.real_payment_executed,
  false
);
assert.equal(openApiPayload.components.schemas.ProductionKeyBlockedResponse.example.invoice_issued, false);
assert.equal(
  openApiPayload.components.schemas.ProductionKeyBlockedResponse.example.external_contact_executed,
  false
);
assert.equal(openApiPayload.components.schemas.KillSwitchResponse.example.status, "paused_kill_switch");
assert.equal(openApiPayload.components.schemas.KillSwitchResponse.example.credit_delta, 0);
assert.ok(JSON.stringify(openApiPayload.paths["/v1/purchase-intent"]).includes("deep_analysis_verification_gate_failed"));
assert.ok(JSON.stringify(openApiPayload.paths["/v1/purchase-intent"]).includes("action_pack_gate_failed"));
assert.equal(
  openApiPayload.components.schemas.PurchaseIntentResponse.properties.delivery.$ref,
  "#/components/schemas/BetaDelivery"
);

const postmanResponse = await handleRequest(new Request("http://localhost/postman_collection.json"));
assert.equal(postmanResponse.status, 200);
const postmanPayload = await postmanResponse.json();
const postmanItemNames = postmanPayload.item.map((item) => item.name);
assert.ok(postmanItemNames.includes("Read full machine buyer flow demo"));
assert.ok(postmanItemNames.includes("Read CRM consumer demo output"));
assert.ok(postmanItemNames.includes("Read usage ledger"));
assert.ok(postmanItemNames.includes("Fetch product catalog"));
assert.ok(postmanItemNames.includes("Read beta tester onboarding packet"));
assert.ok(postmanItemNames.includes("Read beta feedback schema"));
assert.ok(postmanItemNames.includes("Read machine beta test kit"));
assert.ok(postmanItemNames.includes("Create limited sandbox customer"));
assert.ok(postmanItemNames.includes("Route first machine intent"));
assert.ok(postmanItemNames.includes("Create beta purchase intent"));
assert.ok(postmanItemNames.includes("Create payment test intent"));
assert.ok(postmanItemNames.includes("Simulate payment test success webhook"));
assert.ok(postmanItemNames.includes("Read payment test reconciliation"));
assert.ok(postmanItemNames.includes("Order target discovery when machine has no list"));
assert.ok(postmanItemNames.includes("Order deep analysis after a strong score"));
assert.ok(postmanItemNames.includes("Order action pack after confirmed opportunity"));
assert.ok(postmanItemNames.includes("Fetch machine onboarding manifest"));
assert.ok(postmanItemNames.includes("Read authenticated onboarding"));
assert.ok(!postmanItemNames.includes("Admin read payment test report"));
assert.ok(!postmanItemNames.includes("Admin read sandbox metrics"));
assert.ok(!postmanItemNames.includes("Admin read ledger audit report"));
assert.ok(!postmanItemNames.includes("Create beta customer"));

const productCatalogResponse = await handleRequest(new Request("http://localhost/product-catalog.json"));
assert.equal(productCatalogResponse.status, 200);
const productCatalogPayload = await productCatalogResponse.json();
assert.equal(productCatalogPayload.products.score_pack_1k.price_eur, 49);
assert.equal(productCatalogPayload.products.target_discovery_pack_250.price_eur, 299);
assert.equal(productCatalogPayload.products.domain_enrichment_pack_100.price_eur, 149);
assert.equal(productCatalogPayload.products.api_starter_monthly.billing_code, "MS-SUB-STARTER-250");
assert.equal(productCatalogPayload.products.opportunity_feed_monthly.price_eur, 199);
assert.equal(
  productCatalogPayload.machine_buying_scenarios.customer_has_no_list.first_product,
  "target_discovery"
);
assert.ok(
  productCatalogPayload.machine_buying_scenarios.customer_has_no_list.required_inputs.includes(
    "commercial_objective"
  )
);

const productionAccessStatusResponse = await handleRequest(
  new Request("http://localhost/v1/production-access/status")
);
assert.equal(productionAccessStatusResponse.status, 200);
const productionAccessStatusPayload = await productionAccessStatusResponse.json();
assert.equal(productionAccessStatusPayload.status, "sandbox_only");
assert.equal(productionAccessStatusPayload.support_code, "MS_PRODUCTION_ACCESS_BLOCKED");
assert.equal(productionAccessStatusPayload.production_access.production_keys_enabled, false);
assert.equal(productionAccessStatusPayload.production_access.paid_beta_enabled, false);
assert.equal(productionAccessStatusPayload.production_access.real_payments_enabled, false);
assert.equal(productionAccessStatusPayload.production_access.invoices_enabled, false);
assert.equal(productionAccessStatusPayload.production_access.personal_data_enabled, false);
assert.equal(productionAccessStatusPayload.production_access.external_outreach_enabled, false);
assert.equal(productionAccessStatusPayload.production_key.status, "blocked_production_key");
assert.equal(productionAccessStatusPayload.production_key.real_payment_executed, false);
assert.equal(productionAccessStatusPayload.production_key.invoice_issued, false);
assert.equal(productionAccessStatusPayload.production_key.external_contact_executed, false);
assert.equal(productionAccessStatusPayload.kill_switch_contract.status, "paused_kill_switch");
assert.equal(productionAccessStatusPayload.real_payment_executed, false);
assert.equal(productionAccessStatusPayload.invoice_issued, false);
assert.equal(productionAccessStatusPayload.external_contact_executed, false);
assert.ok(productionAccessStatusPayload.allowed_now.includes("create_limited_sandbox_customer"));
assert.ok(productionAccessStatusPayload.blocked_now.includes("production_api_keys"));
assert.ok(productionAccessStatusPayload.blocked_now.includes("real_payments"));
assert.ok(productionAccessStatusPayload.blocked_now.includes("personal_data"));
assert.ok(productionAccessStatusPayload.blocked_now.includes("external_outreach"));

const publicOnboardingResponse = await handleRequest(new Request("http://localhost/machine-onboarding.json"));
assert.equal(publicOnboardingResponse.status, 200);
const publicOnboardingPayload = await publicOnboardingResponse.json();
assert.equal(publicOnboardingPayload.discovery.production_access_status, "/v1/production-access/status");

const llmsResponse = await handleRequest(new Request("http://localhost/llms.txt"));
assert.equal(llmsResponse.status, 200);
const llmsText = await llmsResponse.text();
assert.ok(llmsText.includes("Idempotency-Key"));
assert.ok(llmsText.includes("/v1/intake"));
assert.ok(llmsText.includes("recommended_product_code"));
assert.ok(llmsText.includes("/v1/purchase-intent"));
assert.ok(llmsText.includes("/product-catalog.json"));
assert.ok(llmsText.includes("what_is_included"));
assert.ok(llmsText.includes("Machine-first rule"));
assert.ok(llmsText.includes("Customer machine has no list"));
assert.ok(llmsText.includes("Target Discovery"));
assert.ok(llmsText.includes("/beta/onboarding-packet.json"));
assert.ok(llmsText.includes("/beta/feedback-schema.json"));
assert.ok(llmsText.includes("/beta/machine-test-kit.json"));
assert.ok(llmsText.includes("/v1/sandbox/customers"));
assert.ok(llmsText.includes("/v1/production-access/status"));
assert.ok(!llmsText.includes("/v1/admin/sandbox-metrics"));
assert.ok(!llmsText.includes("/v1/admin/audit-report"));
assert.ok(!llmsText.includes("/v1/admin/payment-test-report"));
assert.ok(!llmsText.includes("/v1/beta/customers"));
assert.ok(llmsText.includes("https://machinesignal.it/machine-discovery/machine-discovery-pack.json"));
assert.ok(llmsText.includes("https://machinesignal.it/distribution/api-directory-submission.json"));
assert.ok(llmsText.includes("https://machinesignal.it/distribution/rapidapi-listing.json"));
assert.ok(llmsText.includes("https://machinesignal.it/distribution/rapidapi-provider-setup.json"));
assert.ok(llmsText.includes("https://machinesignal.it/distribution/channel-shortlist.json"));
assert.ok(llmsText.includes("https://machinesignal.it/postman_public_collection.json"));
assert.ok(llmsText.includes("https://machinesignal.it/.well-known/machine-discovery.json"));
assert.ok(llmsText.includes("/v1/payment-test/intents"));
assert.ok(llmsText.includes("/v1/payment-test/webhooks/stripe"));
assert.ok(llmsText.includes("Payment test mode"));
assert.ok(llmsText.includes("provider_mode live, production or prod is blocked"));

const machineOnboardingResponse = await handleRequest(new Request("http://localhost/machine-onboarding.json"));
assert.equal(machineOnboardingResponse.status, 200);
const machineOnboardingPayload = await machineOnboardingResponse.json();
assert.equal(machineOnboardingPayload.primary_customer_interface, "machine");
assert.equal(machineOnboardingPayload.discovery.product_catalog, "/product-catalog.json");
assert.equal(machineOnboardingPayload.discovery.sandbox_customers, "/v1/sandbox/customers");
assert.equal(machineOnboardingPayload.discovery.authenticated_onboarding, "/v1/onboarding");
assert.equal(machineOnboardingPayload.discovery.intake, "/v1/intake");
assert.equal(machineOnboardingPayload.discovery.payment_test_intents, "/v1/payment-test/intents");
assert.equal(
  machineOnboardingPayload.discovery.payment_test_reconciliation,
  "/v1/payment-test/reconciliation/{payment_test_id}"
);
assert.equal(machineOnboardingPayload.discovery.sandbox_metrics, undefined);
assert.equal(machineOnboardingPayload.discovery.audit_report, undefined);
assert.equal(machineOnboardingPayload.discovery.payment_test_report, undefined);
assert.equal(machineOnboardingPayload.authentication.customer_keys_created_by, undefined);
assert.equal(
  machineOnboardingPayload.discovery.machine_discovery_pack,
  "https://machinesignal.it/machine-discovery/machine-discovery-pack.json"
);
assert.equal(
  machineOnboardingPayload.discovery.api_directory_submission,
  "https://machinesignal.it/distribution/api-directory-submission.json"
);
assert.equal(
  machineOnboardingPayload.discovery.rapidapi_listing,
  "https://machinesignal.it/distribution/rapidapi-listing.json"
);
assert.equal(
  machineOnboardingPayload.discovery.rapidapi_provider_setup,
  "https://machinesignal.it/distribution/rapidapi-provider-setup.json"
);
assert.equal(
  machineOnboardingPayload.discovery.distribution_channel_shortlist,
  "https://machinesignal.it/distribution/channel-shortlist.json"
);
assert.equal(
  machineOnboardingPayload.discovery.postman_public_collection,
  "https://machinesignal.it/postman_public_collection.json"
);
assert.equal(
  machineOnboardingPayload.discovery.well_known_machine_discovery,
  "https://machinesignal.it/.well-known/machine-discovery.json"
);
assert.equal(machineOnboardingPayload.authentication.sandbox_keys_created_by, "POST /v1/sandbox/customers");
assert.equal(machineOnboardingPayload.recommended_agent_policy.must_not_execute_external_outreach, true);
assert.equal(machineOnboardingPayload.recommended_agent_policy.can_create_payment_test_intents, true);
assert.equal(machineOnboardingPayload.recommended_agent_policy.must_not_use_live_payment_mode, true);
assert.equal(machineOnboardingPayload.beta_limits.payment_test_mode.live_mode_allowed, false);
assert.equal(machineOnboardingPayload.entry_points.has_no_list.start_with, "POST /v1/intake");
assert.equal(machineOnboardingPayload.entry_points.has_no_list.product_code, "target_discovery");

const sandboxCustomerResponse = await handleRequest(
  new Request("http://localhost/v1/sandbox/customers", {
    method: "POST",
    body: JSON.stringify({
      evaluator_type: "ai_agent",
      integration_target: "custom CRM workflow",
      expected_test_path: "full_flow"
    }),
    headers: {
      "content-type": "application/json",
      "idempotency-key": "sandbox-test-001"
    }
  }),
  { MACHINESIGNAL_API_KEY: "test-key" }
);
assert.equal(sandboxCustomerResponse.status, 200);
const sandboxCustomerPayload = await sandboxCustomerResponse.json();
assert.equal(sandboxCustomerPayload.sandbox, true);
assert.equal(sandboxCustomerPayload.plan, "sandbox_limited");
assert.equal(sandboxCustomerPayload.customer_type, "sandbox");
assert.ok(sandboxCustomerPayload.customer_id.startsWith("sandbox_"));
assert.ok(sandboxCustomerPayload.api_key.startsWith("ms_cust_"));
assert.ok(Date.parse(sandboxCustomerPayload.expires_at) > Date.now());
assert.equal(sandboxCustomerPayload.guardrails.allowed_use, "low-volume technical evaluation only");
assert.equal(sandboxCustomerPayload.guardrails.daily_creation_limits.global_limit, 25);
assert.equal(
  sandboxCustomerPayload.usage.balances.find((item) => item.product_code === "score_pack_1k").credits_purchased,
  5
);
assert.equal(
  sandboxCustomerPayload.usage.balances.find((item) => item.product_code === "action_pack_25").credits_purchased,
  1
);

const sandboxUsageResponse = await handleRequest(
  new Request("http://localhost/v1/usage", {
    method: "GET",
    headers: { "x-api-key": sandboxCustomerPayload.api_key }
  }),
  { MACHINESIGNAL_API_KEY: "test-key" }
);
assert.equal(sandboxUsageResponse.status, 200);
assert.equal((await sandboxUsageResponse.json()).customer_id, sandboxCustomerPayload.customer_id);

const unauthorizedIntakeResponse = await handleRequest(
  new Request("http://localhost/v1/intake", {
    method: "POST",
    body: JSON.stringify({ objective: "find companies worth evaluating", market: "dentists" }),
    headers: { "content-type": "application/json" }
  }),
  { MACHINESIGNAL_API_KEY: "test-key" }
);
assert.equal(unauthorizedIntakeResponse.status, 401);

const noListIntakeResponse = await handleRequest(
  new Request("http://localhost/v1/intake", {
    method: "POST",
    body: JSON.stringify({
      objective: "find companies worth evaluating",
      market: "dentists",
      area: "Milano",
      commercial_objective: "find websites with appointment conversion gaps",
      has_list: false
    }),
    headers: {
      "content-type": "application/json",
      "x-api-key": sandboxCustomerPayload.api_key,
      "idempotency-key": "sandbox-intake-no-list-001"
    }
  }),
  { MACHINESIGNAL_API_KEY: "test-key" }
);
assert.equal(noListIntakeResponse.status, 200);
const noListIntakePayload = await noListIntakeResponse.json();
assert.equal(noListIntakePayload.status, "intake_ready");
assert.equal(noListIntakePayload.credit_consumed, false);
assert.equal(noListIntakePayload.real_payment_executed, false);
assert.equal(noListIntakePayload.external_contact_executed, false);
assert.equal(noListIntakePayload.recommendation.recommended_product_code, "target_discovery");
assert.equal(noListIntakePayload.recommendation.billing_code, "MS-BND-DISC-250");
assert.equal(noListIntakePayload.recommendation.next_api_call.endpoint, "/v1/purchase-intent");

const reliableListIntakeResponse = await handleRequest(
  new Request("http://localhost/v1/intake", {
    method: "POST",
    body: JSON.stringify({
      objective: "score existing list",
      has_list: true,
      domains_reliable: true,
      domain: "sandbox-clinic-demo.it",
      sector_hint: "dentist",
      country_hint: "IT"
    }),
    headers: {
      "content-type": "application/json",
      "x-api-key": sandboxCustomerPayload.api_key,
      "idempotency-key": "sandbox-intake-reliable-list-001"
    }
  }),
  { MACHINESIGNAL_API_KEY: "test-key" }
);
assert.equal(reliableListIntakeResponse.status, 200);
const reliableListIntakePayload = await reliableListIntakeResponse.json();
assert.equal(reliableListIntakePayload.recommendation.recommended_product_code, "score_pack_1k");
assert.equal(reliableListIntakePayload.recommendation.billing_code, "MS-DEC-250");
assert.equal(reliableListIntakePayload.recommendation.next_api_call.endpoint, "/v1/lead-opportunity-score");

const unreliableListIntakeResponse = await handleRequest(
  new Request("http://localhost/v1/intake", {
    method: "POST",
    body: JSON.stringify({
      objective: "evaluate list",
      has_list: true,
      domains_reliable: false,
      list_quality: "domains missing or unreliable",
      batch_id: "sandbox-dirty-list-001",
      targets: [{ company_name: "Studio Demo", city: "Milano" }]
    }),
    headers: {
      "content-type": "application/json",
      "x-api-key": sandboxCustomerPayload.api_key,
      "idempotency-key": "sandbox-intake-unreliable-list-001"
    }
  }),
  { MACHINESIGNAL_API_KEY: "test-key" }
);
assert.equal(unreliableListIntakeResponse.status, 200);
const unreliableListIntakePayload = await unreliableListIntakeResponse.json();
assert.equal(unreliableListIntakePayload.recommendation.recommended_product_code, "domain_enrichment");
assert.equal(unreliableListIntakePayload.recommendation.billing_code, "MS-BND-DOM-100");
assert.equal(unreliableListIntakePayload.recommendation.next_api_call.endpoint, "/v1/purchase-intent");
assert.equal(unreliableListIntakePayload.can_continue_automatically, true);

const sandboxOnboardingResponse = await handleRequest(
  new Request("http://localhost/v1/onboarding", {
    method: "GET",
    headers: { "x-api-key": sandboxCustomerPayload.api_key }
  }),
  { MACHINESIGNAL_API_KEY: "test-key" }
);
assert.equal(sandboxOnboardingResponse.status, 200);
const sandboxOnboardingPayload = await sandboxOnboardingResponse.json();
assert.equal(sandboxOnboardingPayload.customer_state.sandbox, true);
assert.equal(sandboxOnboardingPayload.customer_state.customer_type, "sandbox");
assert.equal(sandboxOnboardingPayload.customer_state.expires_at, sandboxCustomerPayload.expires_at);

const sandboxScoreResponse = await handleRequest(
  new Request("http://localhost/v1/lead-opportunity-score", {
    method: "POST",
    body: JSON.stringify({
      domain: "sandbox-clinic-demo.it",
      sector_hint: "dentist",
      country_hint: "IT"
    }),
    headers: {
      "content-type": "application/json",
      "x-api-key": sandboxCustomerPayload.api_key,
      "idempotency-key": "sandbox-score-metrics-001"
    }
  }),
  { MACHINESIGNAL_API_KEY: "test-key" }
);
assert.equal(sandboxScoreResponse.status, 200);
assert.equal((await sandboxScoreResponse.json()).usage.current_event.credits_consumed, 1);

const sandboxDeepAnalysisResponse = await handleRequest(
  new Request("http://localhost/v1/purchase-intent", {
    method: "POST",
    body: JSON.stringify({
      product_code: "deep_analysis",
      domain: "sandbox-clinic-demo.it",
      source_score_request_id: "sandbox-score-metrics-001",
      reason: "Sandbox machine test continues to Deep Analysis"
    }),
    headers: {
      "content-type": "application/json",
      "x-api-key": sandboxCustomerPayload.api_key,
      "idempotency-key": "sandbox-deep-analysis-metrics-001"
    }
  }),
  { MACHINESIGNAL_API_KEY: "test-key" }
);
assert.equal(sandboxDeepAnalysisResponse.status, 200);
const sandboxDeepAnalysisPayload = await sandboxDeepAnalysisResponse.json();
assert.equal(sandboxDeepAnalysisPayload.product_code, "deep_analysis");

const sandboxDeepAnalysisCreditExhaustedResponse = await handleRequest(
  new Request("http://localhost/v1/purchase-intent", {
    method: "POST",
    body: JSON.stringify({
      product_code: "deep_analysis",
      domain: "sandbox-clinic-demo.it",
      source_score_request_id: "sandbox-score-metrics-001",
      reason: "Sandbox machine test verifies exhausted Deep Analysis credit"
    }),
    headers: {
      "content-type": "application/json",
      "x-api-key": sandboxCustomerPayload.api_key,
      "idempotency-key": "sandbox-deep-analysis-credit-exhausted-001"
    }
  }),
  { MACHINESIGNAL_API_KEY: "test-key" }
);
assert.equal(sandboxDeepAnalysisCreditExhaustedResponse.status, 200);
const sandboxDeepAnalysisCreditExhaustedPayload =
  await sandboxDeepAnalysisCreditExhaustedResponse.json();
assert.equal(sandboxDeepAnalysisCreditExhaustedPayload.status, "blocked_insufficient_credits");
assert.equal(
  sandboxDeepAnalysisCreditExhaustedPayload.usage.current_event.status,
  "blocked_insufficient_credits"
);
assert.equal(sandboxDeepAnalysisCreditExhaustedPayload.usage.current_event.credits_consumed, 0);
assert.equal(sandboxDeepAnalysisCreditExhaustedPayload.delivery.status, "blocked_insufficient_credits");
assert.equal(sandboxDeepAnalysisCreditExhaustedPayload.delivery.blocked, true);
assert.equal(sandboxDeepAnalysisCreditExhaustedPayload.delivery.credits_consumed, 0);

const sandboxActionPackResponse = await handleRequest(
  new Request("http://localhost/v1/purchase-intent", {
    method: "POST",
    body: JSON.stringify({
      product_code: "action_pack",
      domain: "sandbox-clinic-demo.it",
      source_score_request_id: "sandbox-score-metrics-001",
      source_order_intent_id: sandboxDeepAnalysisPayload.order_intent_id,
      reason: "Sandbox machine test continues to Action Pack"
    }),
    headers: {
      "content-type": "application/json",
      "x-api-key": sandboxCustomerPayload.api_key,
      "idempotency-key": "sandbox-action-pack-metrics-001"
    }
  }),
  { MACHINESIGNAL_API_KEY: "test-key" }
);
assert.equal(sandboxActionPackResponse.status, 200);
assert.equal((await sandboxActionPackResponse.json()).product_code, "action_pack");

const unauthorizedSandboxMetricsResponse = await handleRequest(
  new Request("http://localhost/v1/admin/sandbox-metrics", {
    method: "GET"
  }),
  { MACHINESIGNAL_API_KEY: "test-key" }
);
assert.equal(unauthorizedSandboxMetricsResponse.status, 401);

const sandboxMetricsResponse = await handleRequest(
  new Request("http://localhost/v1/admin/sandbox-metrics", {
    method: "GET",
    headers: { "x-api-key": "test-key" }
  }),
  { MACHINESIGNAL_API_KEY: "test-key" }
);
assert.equal(sandboxMetricsResponse.status, 200);
const sandboxMetricsPayload = await sandboxMetricsResponse.json();
assert.ok(sandboxMetricsPayload.sandbox_customers.total >= 1);
assert.ok(sandboxMetricsPayload.usage.score_credits_used >= 1);
assert.ok(sandboxMetricsPayload.orders.deep_analysis >= 1);
assert.ok(sandboxMetricsPayload.orders.action_pack >= 1);
assert.ok(sandboxMetricsPayload.score_decisions.total_valid_scores >= 1);
assert.ok(sandboxMetricsPayload.score_decisions.interesting_scores >= 1);
assert.ok(
  sandboxMetricsPayload.score_decisions.buy_deep_analysis +
    sandboxMetricsPayload.score_decisions.needs_verification +
    sandboxMetricsPayload.score_decisions.nurture +
    sandboxMetricsPayload.score_decisions.watchlist >=
    1
);
assert.equal(sandboxMetricsPayload.safety.real_payment_executed, false);
assert.equal(sandboxMetricsPayload.safety.external_contact_executed, false);
assert.equal(sandboxMetricsPayload.targets.sandbox_keys, 10);
assert.equal(sandboxMetricsPayload.progress.safety_ok, true);

const sandboxDisabledResponse = await handleRequest(
  new Request("http://localhost/v1/sandbox/customers", {
    method: "POST",
    body: "{}",
    headers: { "content-type": "application/json" }
  }),
  { MACHINESIGNAL_API_KEY: "test-key", MACHINESIGNAL_SANDBOX_ENABLED: "false" }
);
assert.equal(sandboxDisabledResponse.status, 403);

const sandboxLimitEnv = {
  MACHINESIGNAL_API_KEY: "test-key",
  MACHINESIGNAL_SANDBOX_LIMIT_NAMESPACE: "sandbox_limit_test",
  MACHINESIGNAL_SANDBOX_DAILY_LIMIT: "1",
  MACHINESIGNAL_SANDBOX_DAILY_FINGERPRINT_LIMIT: "1"
};
const sandboxLimitedFirstResponse = await handleRequest(
  new Request("http://localhost/v1/sandbox/customers", {
    method: "POST",
    body: "{}",
    headers: {
      "content-type": "application/json",
      "user-agent": "sandbox-limit-test-agent",
      "cf-connecting-ip": "203.0.113.10"
    }
  }),
  sandboxLimitEnv
);
assert.equal(sandboxLimitedFirstResponse.status, 200);

const sandboxLimitedSecondResponse = await handleRequest(
  new Request("http://localhost/v1/sandbox/customers", {
    method: "POST",
    body: "{}",
    headers: {
      "content-type": "application/json",
      "user-agent": "sandbox-limit-test-agent",
      "cf-connecting-ip": "203.0.113.10"
    }
  }),
  sandboxLimitEnv
);
assert.equal(sandboxLimitedSecondResponse.status, 429);
assert.equal((await sandboxLimitedSecondResponse.json()).error, "sandbox_limit_exceeded");

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
assert.equal(purchaseIntentPayload.delivery.what_is_included.exact_unit_sold, "one verification decision for one target/domain");
assert.equal(purchaseIntentPayload.delivery.verification_verdict.status, "keep_with_caution");
assert.ok(purchaseIntentPayload.delivery.stop_rules.includes("stop if no compliant action channel exists"));
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

const blockedDeepAnalysisAfterCautiousVerificationResponse = await handleRequest(
  new Request("http://localhost/v1/purchase-intent", {
    method: "POST",
    body: JSON.stringify({
      product_code: "deep_analysis",
      domain: "clinic3.it",
      sector_hint: "dentist",
      source_score_request_id: "test-score-001",
      source_verification_order_intent_id: purchaseIntentPayload.order_intent_id,
      reason: "Invalid Deep Analysis after cautious verification"
    }),
    headers: {
      "content-type": "application/json",
      "x-api-key": "test-key",
      "idempotency-key": "test-deep-analysis-after-cautious-verification-001"
    }
  }),
  { MACHINESIGNAL_API_KEY: "test-key" }
);
assert.equal(blockedDeepAnalysisAfterCautiousVerificationResponse.status, 400);
const blockedDeepAnalysisAfterCautiousVerificationPayload =
  await blockedDeepAnalysisAfterCautiousVerificationResponse.json();
assert.equal(
  blockedDeepAnalysisAfterCautiousVerificationPayload.error,
  "deep_analysis_verification_gate_failed"
);
assert.equal(
  blockedDeepAnalysisAfterCautiousVerificationPayload.details.source_verification_verdict_status,
  "keep_with_caution"
);

const usageAfterBlockedDeepAnalysisResponse = await handleRequest(
  new Request("http://localhost/v1/usage", {
    headers: { "x-api-key": "test-key" }
  }),
  { MACHINESIGNAL_API_KEY: "test-key" }
);
const usageAfterBlockedDeepAnalysisPayload = await usageAfterBlockedDeepAnalysisResponse.json();
assert.equal(
  usageAfterBlockedDeepAnalysisPayload.balances.find((item) => item.product_code === "deep_analysis_pack_100").credits_used,
  0
);

const positiveGateApiKey = "test-positive-gate-key";
const positiveGateEnv = { MACHINESIGNAL_API_KEY: positiveGateApiKey };

const positiveVerificationResponse = await handleRequest(
  new Request("http://localhost/v1/purchase-intent", {
    method: "POST",
    body: JSON.stringify({
      product_code: "verification",
      domain: "verified-deep-analysis-ready.test",
      verification_fixture: "positive_for_deep_analysis",
      source_score_request_id: "test-score-positive-verification-001",
      reason: "Sandbox positive verification fixture for Deep Analysis gate"
    }),
    headers: {
      "content-type": "application/json",
      "x-api-key": positiveGateApiKey,
      "idempotency-key": "test-positive-verification-001"
    }
  }),
  positiveGateEnv
);
assert.equal(positiveVerificationResponse.status, 200);
const positiveVerificationPayload = await positiveVerificationResponse.json();
assert.equal(positiveVerificationPayload.delivery.delivery_type, "data_quality_verification");
assert.equal(positiveVerificationPayload.delivery.data_quality_risk, "low");
assert.equal(
  positiveVerificationPayload.delivery.verification_verdict.status,
  "verified_for_deep_analysis"
);
assert.equal(positiveVerificationPayload.delivery.next_machine_call.endpoint, "/v1/purchase-intent");
assert.equal(
  positiveVerificationPayload.delivery.next_machine_call.body.product_code,
  "deep_analysis"
);

const deepAnalysisAfterPositiveVerificationResponse = await handleRequest(
  new Request("http://localhost/v1/purchase-intent", {
    method: "POST",
    body: JSON.stringify({
      product_code: "deep_analysis",
      domain: "verified-deep-analysis-ready.test",
      sector_hint: "dentist",
      source_score_request_id: "test-score-positive-verification-001",
      source_verification_order_intent_id: positiveVerificationPayload.order_intent_id,
      reason: "Valid Deep Analysis after positive sandbox Verification"
    }),
    headers: {
      "content-type": "application/json",
      "x-api-key": positiveGateApiKey,
      "idempotency-key": "test-deep-analysis-after-positive-verification-001"
    }
  }),
  positiveGateEnv
);
assert.equal(deepAnalysisAfterPositiveVerificationResponse.status, 200);
const deepAnalysisAfterPositiveVerificationPayload =
  await deepAnalysisAfterPositiveVerificationResponse.json();
assert.equal(deepAnalysisAfterPositiveVerificationPayload.product_code, "deep_analysis");
assert.equal(
  deepAnalysisAfterPositiveVerificationPayload.source_verification_order_intent_id,
  positiveVerificationPayload.order_intent_id
);
assert.equal(
  deepAnalysisAfterPositiveVerificationPayload.deep_analysis_verification_gate.passed,
  true
);
assert.equal(
  deepAnalysisAfterPositiveVerificationPayload.deep_analysis_verification_gate.source_verification_verdict_status,
  "verified_for_deep_analysis"
);
assert.equal(
  deepAnalysisAfterPositiveVerificationPayload.delivery.delivery_type,
  "deep_opportunity_analysis"
);

const usageAfterPositiveDeepAnalysisResponse = await handleRequest(
  new Request("http://localhost/v1/usage", {
    headers: { "x-api-key": positiveGateApiKey }
  }),
  positiveGateEnv
);
const usageAfterPositiveDeepAnalysisPayload = await usageAfterPositiveDeepAnalysisResponse.json();
assert.equal(
  usageAfterPositiveDeepAnalysisPayload.balances.find((item) => item.product_code === "deep_analysis_pack_100").credits_used,
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
assert.equal(targetDiscoveryPayload.beta_price_range_eur, "249");
assert.equal(targetDiscoveryPayload.delivery.delivery_type, "target_discovery_precheck");
assert.equal(targetDiscoveryPayload.delivery.beta_sample_targets.length, 3);
assert.equal(targetDiscoveryPayload.delivery.commercial_objective, "Customer machine needs a starting target list");
assert.equal(targetDiscoveryPayload.delivery.output_contract.exact_unit_sold, "250 coherent target records or a no-go market coverage decision");
assert.equal(targetDiscoveryPayload.delivery.beta_sample_targets[0].category, "dentists");
assert.equal(targetDiscoveryPayload.delivery.beta_sample_targets[0].next_machine_action, "send domain to /v1/lead-opportunity-score");
assert.equal(targetDiscoveryPayload.delivery.next_machine_call.endpoint, "/v1/lead-opportunity-score");
assert.equal(targetDiscoveryPayload.usage.current_event.credits_consumed, 1);

const deepAnalysisResponse = await handleRequest(
  new Request("http://localhost/v1/purchase-intent", {
    method: "POST",
    body: JSON.stringify({
      product_code: "deep_analysis",
      domain: "strong-clinic.it",
      sector_hint: "dentist",
      area: "Lombardy",
      commercial_objective:
        "Find dental clinic websites that deserve CRM-ready digital opportunity action",
      source_score_request_id: "test-score-strong-001",
      reason: "Score recommended deep analysis"
    }),
    headers: {
      "content-type": "application/json",
      "x-api-key": "test-key",
      "idempotency-key": "test-deep-analysis-001"
    }
  }),
  { MACHINESIGNAL_API_KEY: "test-key" }
);
assert.equal(deepAnalysisResponse.status, 200);
const deepAnalysisPayload = await deepAnalysisResponse.json();
assert.equal(deepAnalysisPayload.product_code, "deep_analysis");
assert.equal(deepAnalysisPayload.delivery.delivery_type, "deep_opportunity_analysis");
assert.equal(deepAnalysisPayload.delivery.deep_analysis_version, "domain_specific_commercial_evidence_v1");
assert.equal(deepAnalysisPayload.delivery.what_is_included.exact_unit_sold, "one deep opportunity decision pack for one scored domain");
assert.equal(deepAnalysisPayload.delivery.sector_context.code, "dentists_clinics");
assert.equal(deepAnalysisPayload.delivery.requested_area, "Lombardy");
assert.ok(deepAnalysisPayload.delivery.what_is_included.returned_decision_fields.includes("commercial_evidence"));
assert.ok(deepAnalysisPayload.delivery.what_is_included.returned_decision_fields.includes("machine_decision_matrix"));
assert.ok(deepAnalysisPayload.delivery.commercial_evidence.length >= 4);
assert.ok(deepAnalysisPayload.delivery.commercial_evidence.some((item) => item.code === "digital_friction"));
assert.ok(deepAnalysisPayload.delivery.machine_decision_matrix.buy_action_pack_if.includes("budget approval exists"));
assert.ok(deepAnalysisPayload.delivery.machine_decision_matrix.stop_if.includes("sector fit fails"));
assert.equal(deepAnalysisPayload.delivery.action_pack_purchase_gate.product_code, "action_pack");
assert.ok(deepAnalysisPayload.delivery.action_pack_purchase_gate.required_before_purchase.includes("budget_approval"));
assert.equal(deepAnalysisPayload.delivery.crm_summary_payload.domain, "strong-clinic.it");
assert.equal(deepAnalysisPayload.delivery.crm_summary_payload.next_product_allowed, "conditional");
assert.equal(deepAnalysisPayload.delivery.recommended_next_step.product_code, "action_pack");
assert.ok(deepAnalysisPayload.delivery.recommended_next_step.condition.includes("sector fit"));
assert.equal(deepAnalysisPayload.delivery.next_machine_call.endpoint, "/v1/purchase-intent");

const duplicateDeepAnalysisResponse = await handleRequest(
  new Request("http://localhost/v1/purchase-intent", {
    method: "POST",
    body: JSON.stringify({
      product_code: "deep_analysis",
      domain: "strong-clinic.it",
      sector_hint: "dentist",
      area: "Lombardy",
      commercial_objective:
        "Find dental clinic websites that deserve CRM-ready digital opportunity action",
      source_score_request_id: "test-score-strong-001",
      reason: "Repeated Deep Analysis request with same idempotency key"
    }),
    headers: {
      "content-type": "application/json",
      "x-api-key": "test-key",
      "idempotency-key": "test-deep-analysis-001"
    }
  }),
  { MACHINESIGNAL_API_KEY: "test-key" }
);
assert.equal(duplicateDeepAnalysisResponse.status, 200);
const duplicateDeepAnalysisPayload = await duplicateDeepAnalysisResponse.json();
assert.equal(duplicateDeepAnalysisPayload.order_intent_id, deepAnalysisPayload.order_intent_id);
assert.equal(duplicateDeepAnalysisPayload.order.duplicate_request, true);
assert.equal(duplicateDeepAnalysisPayload.usage.current_event.duplicate_request, true);

const actionPackWithoutDeepSourceResponse = await handleRequest(
  new Request("http://localhost/v1/purchase-intent", {
    method: "POST",
    body: JSON.stringify({
      product_code: "action_pack",
      domain: "strong-clinic.it",
      source_score_request_id: "test-score-strong-001",
      reason: "Invalid Action Pack without Deep Analysis source"
    }),
    headers: {
      "content-type": "application/json",
      "x-api-key": "test-key",
      "idempotency-key": "test-action-pack-missing-deep-001"
    }
  }),
  { MACHINESIGNAL_API_KEY: "test-key" }
);
assert.equal(actionPackWithoutDeepSourceResponse.status, 400);
const actionPackWithoutDeepSourcePayload = await actionPackWithoutDeepSourceResponse.json();
assert.equal(actionPackWithoutDeepSourcePayload.error, "action_pack_gate_failed");
assert.equal(actionPackWithoutDeepSourcePayload.details.required_input, "source_order_intent_id");

const actionPackWithMissingDeepSourceResponse = await handleRequest(
  new Request("http://localhost/v1/purchase-intent", {
    method: "POST",
    body: JSON.stringify({
      product_code: "action_pack",
      domain: "strong-clinic.it",
      source_score_request_id: "test-score-strong-001",
      source_order_intent_id: "ord_not_found",
      reason: "Invalid Action Pack with unknown source order"
    }),
    headers: {
      "content-type": "application/json",
      "x-api-key": "test-key",
      "idempotency-key": "test-action-pack-missing-deep-002"
    }
  }),
  { MACHINESIGNAL_API_KEY: "test-key" }
);
assert.equal(actionPackWithMissingDeepSourceResponse.status, 400);
assert.equal((await actionPackWithMissingDeepSourceResponse.json()).error, "action_pack_gate_failed");

const actionPackWithWrongSourceProductResponse = await handleRequest(
  new Request("http://localhost/v1/purchase-intent", {
    method: "POST",
    body: JSON.stringify({
      product_code: "action_pack",
      domain: "strong-clinic.it",
      source_score_request_id: "test-score-strong-001",
      source_order_intent_id: purchaseIntentPayload.order_intent_id,
      reason: "Invalid Action Pack using a verification order as source"
    }),
    headers: {
      "content-type": "application/json",
      "x-api-key": "test-key",
      "idempotency-key": "test-action-pack-wrong-source-001"
    }
  }),
  { MACHINESIGNAL_API_KEY: "test-key" }
);
assert.equal(actionPackWithWrongSourceProductResponse.status, 400);
const actionPackWithWrongSourceProductPayload = await actionPackWithWrongSourceProductResponse.json();
assert.equal(actionPackWithWrongSourceProductPayload.error, "action_pack_gate_failed");
assert.equal(actionPackWithWrongSourceProductPayload.details.source_product_code, "verification");

const actionPackWithDomainMismatchResponse = await handleRequest(
  new Request("http://localhost/v1/purchase-intent", {
    method: "POST",
    body: JSON.stringify({
      product_code: "action_pack",
      domain: "different-clinic.it",
      source_score_request_id: "test-score-strong-001",
      source_order_intent_id: deepAnalysisPayload.order_intent_id,
      reason: "Invalid Action Pack with mismatched domain"
    }),
    headers: {
      "content-type": "application/json",
      "x-api-key": "test-key",
      "idempotency-key": "test-action-pack-domain-mismatch-001"
    }
  }),
  { MACHINESIGNAL_API_KEY: "test-key" }
);
assert.equal(actionPackWithDomainMismatchResponse.status, 400);
const actionPackWithDomainMismatchPayload = await actionPackWithDomainMismatchResponse.json();
assert.equal(actionPackWithDomainMismatchPayload.error, "action_pack_gate_failed");
assert.equal(actionPackWithDomainMismatchPayload.details.source_domain, "strong-clinic.it");
assert.equal(actionPackWithDomainMismatchPayload.details.requested_domain, "different-clinic.it");

const actionPackResponse = await handleRequest(
  new Request("http://localhost/v1/purchase-intent", {
    method: "POST",
    body: JSON.stringify({
      product_code: "action_pack",
      domain: "strong-clinic.it",
      source_score_request_id: "test-score-strong-001",
      source_order_intent_id: deepAnalysisPayload.order_intent_id,
      reason: "Deep analysis recommended action pack",
      max_budget_eur: 10
    }),
    headers: {
      "content-type": "application/json",
      "x-api-key": "test-key",
      "idempotency-key": "test-action-pack-001"
    }
  }),
  { MACHINESIGNAL_API_KEY: "test-key" }
);
assert.equal(actionPackResponse.status, 200);
const actionPackPayload = await actionPackResponse.json();
assert.equal(actionPackPayload.product_code, "action_pack");
assert.equal(actionPackPayload.source_order_intent_id, deepAnalysisPayload.order_intent_id);
assert.equal(actionPackPayload.action_pack_gate.required, true);
assert.equal(actionPackPayload.action_pack_gate.passed, true);
assert.equal(actionPackPayload.action_pack_gate.source_order_intent_id, deepAnalysisPayload.order_intent_id);
assert.equal(actionPackPayload.delivery.delivery_type, "action_pack");
assert.equal(actionPackPayload.delivery.what_is_included.exact_unit_sold, "one CRM-ready action pack for one qualified domain");
assert.equal(actionPackPayload.delivery.crm_record_patch.lead_status, "qualified_pending_compliance_review");
assert.equal(actionPackPayload.delivery.crm_task.task_type, "qualified_opportunity_review");
assert.equal(actionPackPayload.delivery.crm_platform_mappings.generic_crm.operation, "upsert_company_or_lead");
assert.equal(actionPackPayload.delivery.workflow_payload.trigger, "action_pack_ready");
assert.equal(actionPackPayload.delivery.workflow_payload.deduplication_key, actionPackPayload.delivery.deduplication_key);
assert.equal(actionPackPayload.delivery.webhook_event.event_type, "machinesignal.action_pack.ready");
assert.equal(actionPackPayload.delivery.webhook_delivery_policy.signing.algorithm, "hmac-sha256");
assert.equal(actionPackPayload.delivery.audit_event.external_contact_executed, false);
assert.equal(actionPackPayload.delivery.approval_gate.default_state, "blocked");
assert.ok(actionPackPayload.delivery.approval_gate.blocked_without_approval.includes("send_email"));
assert.ok(actionPackPayload.delivery.next_api_calls.some((item) => item.endpoint === "/v1/orders/{order_intent_id}"));
assert.ok(actionPackPayload.delivery.agent_instructions.includes("Do not contact the target automatically."));
assert.ok(actionPackPayload.delivery.stop_rules.length >= 3);

const duplicateActionPackResponse = await handleRequest(
  new Request("http://localhost/v1/purchase-intent", {
    method: "POST",
    body: JSON.stringify({
      product_code: "action_pack",
      domain: "strong-clinic.it",
      source_score_request_id: "test-score-strong-001",
      source_order_intent_id: deepAnalysisPayload.order_intent_id,
      reason: "Repeated Action Pack request with same idempotency key",
      max_budget_eur: 10
    }),
    headers: {
      "content-type": "application/json",
      "x-api-key": "test-key",
      "idempotency-key": "test-action-pack-001"
    }
  }),
  { MACHINESIGNAL_API_KEY: "test-key" }
);
assert.equal(duplicateActionPackResponse.status, 200);
const duplicateActionPackPayload = await duplicateActionPackResponse.json();
assert.equal(duplicateActionPackPayload.order_intent_id, actionPackPayload.order_intent_id);
assert.equal(duplicateActionPackPayload.order.duplicate_request, true);
assert.equal(duplicateActionPackPayload.usage.current_event.duplicate_request, true);

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
assert.equal(ordersPayload.count, 5);
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
assert.equal(customerOnboardingPayload.customer_state.can_create_payment_tests, true);
assert.equal(customerOnboardingPayload.customer_state.real_payment_enabled, false);
assert.equal(customerOnboardingPayload.customer_state.payment_test_mode_enabled, true);

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

const discoveredDentalScoreResponse = await handleRequest(
  new Request("http://localhost/v1/lead-opportunity-score", {
    method: "POST",
    body: JSON.stringify({
      domain: "studiodentisticocozzolino.it",
      sector_hint: "dentist",
      country_hint: "IT",
      target_name: "Studio Dentistico Cozzolino",
      category_hint: "studio dentistico",
      source_url: "https://studiodentisticocozzolino.it/",
      source_type: "official_site",
      initial_signals: "sector_match;local_market;business_domain_present"
    }),
    headers: {
      "content-type": "application/json",
      "x-api-key": createCustomerPayload.api_key,
      "idempotency-key": "customer-score-discovered-dental-001"
    }
  }),
  { MACHINESIGNAL_API_KEY: "test-key" }
);
assert.equal(discoveredDentalScoreResponse.status, 200);
const discoveredDentalScorePayload = await discoveredDentalScoreResponse.json();
assert.equal(
  discoveredDentalScorePayload.target_discovery_evidence_review.status,
  "target_discovery_evidence_passed"
);
assert.ok(discoveredDentalScorePayload.confidence >= 0.52);
assert.notEqual(discoveredDentalScorePayload.decision, "needs_verification");
assert.ok(["strong", "medium", "weak"].includes(discoveredDentalScorePayload.commercial_strength.level));
assert.ok(discoveredDentalScorePayload.commercial_strength.spend_policy);
assert.ok(Array.isArray(discoveredDentalScorePayload.commercial_strength.allowed_next_products));

const adminCustomerReadResponse = await handleRequest(
  new Request("http://localhost/v1/beta/customers/beta_partner_test", {
    method: "GET",
    headers: { "x-api-key": "test-key" }
  }),
  { MACHINESIGNAL_API_KEY: "test-key" }
);
assert.equal(adminCustomerReadResponse.status, 200);
const adminCustomerReadPayload = await adminCustomerReadResponse.json();
assert.equal(adminCustomerReadPayload.customer_id, "beta_partner_test");
assert.ok(adminCustomerReadPayload.api_key_prefix.startsWith("ms_cust_"));
assert.equal(adminCustomerReadPayload.api_key, undefined);

const unauthorizedAuditResponse = await handleRequest(
  new Request("http://localhost/v1/admin/audit-report?customer_id=beta_partner_test", {
    method: "GET"
  }),
  { MACHINESIGNAL_API_KEY: "test-key" }
);
assert.equal(unauthorizedAuditResponse.status, 401);

const auditReportResponse = await handleRequest(
  new Request("http://localhost/v1/admin/audit-report?customer_id=beta_partner_test", {
    method: "GET",
    headers: { "x-api-key": "test-key" }
  }),
  { MACHINESIGNAL_API_KEY: "test-key" }
);
assert.equal(auditReportResponse.status, 200);
const auditReportPayload = await auditReportResponse.json();
assert.equal(auditReportPayload.customer_id, "beta_partner_test");
assert.equal(auditReportPayload.summary.reconciliation_ok, true);
assert.equal(auditReportPayload.summary.ready_for_real_payments, false);
assert.equal(auditReportPayload.safety.real_payment_executed, false);
assert.equal(auditReportPayload.safety.external_contact_executed, false);
assert.ok(
  auditReportPayload.product_reconciliation.some(
    (item) =>
      item.product_code === "score_pack_1k" &&
      item.credits_used === 2 &&
      item.credits_consumed_from_events === 2 &&
      item.credits_reconcile === true
  )
);

const adminTopUpResponse = await handleRequest(
  new Request("http://localhost/v1/beta/customers/beta_partner_test", {
    method: "PATCH",
    body: JSON.stringify({
      add_credits: {
        score_pack_1k: 5,
        verification_pack_100: 2,
        target_discovery_pack_250: 1
      },
      reason: "top up beta machine buyer flow"
    }),
    headers: {
      "content-type": "application/json",
      "x-api-key": "test-key"
    }
  }),
  { MACHINESIGNAL_API_KEY: "test-key" }
);
assert.equal(adminTopUpResponse.status, 200);
const adminTopUpPayload = await adminTopUpResponse.json();
assert.equal(adminTopUpPayload.admin_event.status, "admin_credit_update");
assert.equal(
  adminTopUpPayload.usage.balances.find((item) => item.product_code === "score_pack_1k").credits_purchased,
  17
);
assert.equal(
  adminTopUpPayload.usage.balances.find((item) => item.product_code === "score_pack_1k").credits_remaining,
  15
);

const adminSuspendResponse = await handleRequest(
  new Request("http://localhost/v1/beta/customers/beta_partner_test", {
    method: "PATCH",
    body: JSON.stringify({ status: "suspended", reason: "pause beta access" }),
    headers: {
      "content-type": "application/json",
      "x-api-key": "test-key"
    }
  }),
  { MACHINESIGNAL_API_KEY: "test-key" }
);
assert.equal(adminSuspendResponse.status, 200);
assert.equal((await adminSuspendResponse.json()).status, "suspended");

const suspendedCustomerUsageResponse = await handleRequest(
  new Request("http://localhost/v1/usage", {
    method: "GET",
    headers: { "x-api-key": createCustomerPayload.api_key }
  }),
  { MACHINESIGNAL_API_KEY: "test-key" }
);
assert.equal(suspendedCustomerUsageResponse.status, 401);

const adminReactivateResponse = await handleRequest(
  new Request("http://localhost/v1/beta/customers/beta_partner_test", {
    method: "PATCH",
    body: JSON.stringify({ status: "active", reason: "resume beta access" }),
    headers: {
      "content-type": "application/json",
      "x-api-key": "test-key"
    }
  }),
  { MACHINESIGNAL_API_KEY: "test-key" }
);
assert.equal(adminReactivateResponse.status, 200);
assert.equal((await adminReactivateResponse.json()).status, "active");

const paymentCustomerResponse = await handleRequest(
  new Request("http://localhost/v1/beta/customers", {
    method: "POST",
    body: JSON.stringify({
      customer_id: "payment_test_customer",
      contact_email: "payment-test@example.com",
      plan: "payment_test_beta",
      score_credits: 0,
      target_discovery_credits: 0,
      domain_enrichment_credits: 0,
      deep_analysis_credits: 0,
      action_pack_credits: 0,
      opportunity_feed_credits: 0
    }),
    headers: {
      "content-type": "application/json",
      "x-api-key": "test-key"
    }
  }),
  { MACHINESIGNAL_API_KEY: "test-key" }
);
assert.equal(paymentCustomerResponse.status, 200);
const paymentCustomerPayload = await paymentCustomerResponse.json();
assert.equal(paymentCustomerPayload.customer_id, "payment_test_customer");
assert.equal(
  paymentCustomerPayload.usage.balances.find((item) => item.product_code === "score_pack_1k").credits_purchased,
  0
);

const liveModePaymentTestResponse = await handleRequest(
  new Request("http://localhost/v1/payment-test/intents", {
    method: "POST",
    body: JSON.stringify({
      product_code: "score_pack_1k",
      amount_eur: 119,
      provider: "stripe",
      provider_mode: "live"
    }),
    headers: {
      "content-type": "application/json",
      "x-api-key": paymentCustomerPayload.api_key,
      "idempotency-key": "payment-test-live-mode-001"
    }
  }),
  { MACHINESIGNAL_API_KEY: "test-key" }
);
assert.equal(liveModePaymentTestResponse.status, 400);
const liveModePaymentTestPayload = await liveModePaymentTestResponse.json();
assert.equal(liveModePaymentTestPayload.error, "live_payment_mode_blocked");
assert.equal(liveModePaymentTestPayload.real_payment_executed, false);
assert.equal(liveModePaymentTestPayload.ready_for_real_payments, false);

const paymentTestIntentResponse = await handleRequest(
  new Request("http://localhost/v1/payment-test/intents", {
    method: "POST",
    body: JSON.stringify({
      product_code: "score_pack_1k",
      amount_eur: 119,
      provider: "stripe",
      provider_mode: "test",
      metadata: { crm_run_id: "local-payment-test-001" }
    }),
    headers: {
      "content-type": "application/json",
      "x-api-key": paymentCustomerPayload.api_key,
      "idempotency-key": "payment-test-intent-001"
    }
  }),
  { MACHINESIGNAL_API_KEY: "test-key" }
);
assert.equal(paymentTestIntentResponse.status, 200);
const paymentTestIntentPayload = await paymentTestIntentResponse.json();
assert.ok(paymentTestIntentPayload.payment_test_id.startsWith("paytest_"));
assert.equal(paymentTestIntentPayload.customer_id, "payment_test_customer");
assert.equal(paymentTestIntentPayload.product_code, "score_pack_1k");
assert.equal(paymentTestIntentPayload.provider_mode, "test");
assert.equal(paymentTestIntentPayload.real_payment_executed, false);
assert.equal(paymentTestIntentPayload.ready_for_real_payments, false);
assert.equal(paymentTestIntentPayload.credits_to_activate, 1000);
assert.equal(paymentTestIntentPayload.credits_activated, 0);
assert.equal(paymentTestIntentPayload.test_webhook_simulation.required_header, "X-MachineSignal-Test-Webhook-Signature");
assert.ok(paymentTestIntentPayload.test_webhook_simulation.success_signature.startsWith("sigtest_"));

const duplicatePaymentTestIntentResponse = await handleRequest(
  new Request("http://localhost/v1/payment-test/intents", {
    method: "POST",
    body: JSON.stringify({
      product_code: "score_pack_1k",
      amount_eur: 119,
      provider: "stripe",
      provider_mode: "test"
    }),
    headers: {
      "content-type": "application/json",
      "x-api-key": paymentCustomerPayload.api_key,
      "idempotency-key": "payment-test-intent-001"
    }
  }),
  { MACHINESIGNAL_API_KEY: "test-key" }
);
assert.equal(duplicatePaymentTestIntentResponse.status, 200);
const duplicatePaymentTestIntentPayload = await duplicatePaymentTestIntentResponse.json();
assert.equal(duplicatePaymentTestIntentPayload.duplicate_request, true);
assert.equal(duplicatePaymentTestIntentPayload.payment_test_id, paymentTestIntentPayload.payment_test_id);

const badSignatureWebhookResponse = await handleRequest(
  new Request("http://localhost/v1/payment-test/webhooks/stripe", {
    method: "POST",
    body: JSON.stringify({
      customer_id: "payment_test_customer",
      payment_test_id: paymentTestIntentPayload.payment_test_id,
      event_type: "payment_intent.succeeded",
      event_id: "evt_bad_signature_001"
    }),
    headers: {
      "content-type": "application/json",
      "x-machinesignal-test-webhook-signature": "sigtest_bad"
    }
  }),
  { MACHINESIGNAL_API_KEY: "test-key" }
);
assert.equal(badSignatureWebhookResponse.status, 400);
const badSignatureWebhookPayload = await badSignatureWebhookResponse.json();
assert.equal(badSignatureWebhookPayload.error, "invalid_test_webhook_signature");
assert.equal(badSignatureWebhookPayload.real_payment_executed, false);

const paymentSuccessWebhookResponse = await handleRequest(
  new Request("http://localhost/v1/payment-test/webhooks/stripe", {
    method: "POST",
    body: JSON.stringify({
      customer_id: "payment_test_customer",
      payment_test_id: paymentTestIntentPayload.payment_test_id,
      event_type: "payment_intent.succeeded",
      event_id: "evt_payment_test_success_001"
    }),
    headers: {
      "content-type": "application/json",
      "x-machinesignal-test-webhook-signature":
        paymentTestIntentPayload.test_webhook_simulation.success_signature
    }
  }),
  { MACHINESIGNAL_API_KEY: "test-key" }
);
assert.equal(paymentSuccessWebhookResponse.status, 200);
const paymentSuccessWebhookPayload = await paymentSuccessWebhookResponse.json();
assert.equal(paymentSuccessWebhookPayload.payment_status, "test_payment_succeeded");
assert.equal(paymentSuccessWebhookPayload.credit_activation_status, "test_credits_activated");
assert.equal(paymentSuccessWebhookPayload.credits_activated, 1000);
assert.equal(paymentSuccessWebhookPayload.invoice_placeholder.real_invoice_issued, false);
assert.equal(paymentSuccessWebhookPayload.real_payment_executed, false);
assert.equal(paymentSuccessWebhookPayload.reconciliation.reconciliation_ok, true);
assert.equal(paymentSuccessWebhookPayload.reconciliation.ready_for_real_payments, false);
assert.equal(
  paymentSuccessWebhookPayload.usage.balances.find((item) => item.product_code === "score_pack_1k").credits_purchased,
  1000
);

const duplicatePaymentWebhookResponse = await handleRequest(
  new Request("http://localhost/v1/payment-test/webhooks/stripe", {
    method: "POST",
    body: JSON.stringify({
      customer_id: "payment_test_customer",
      payment_test_id: paymentTestIntentPayload.payment_test_id,
      event_type: "payment_intent.succeeded",
      event_id: "evt_payment_test_success_001"
    }),
    headers: {
      "content-type": "application/json",
      "x-machinesignal-test-webhook-signature":
        paymentTestIntentPayload.test_webhook_simulation.success_signature
    }
  }),
  { MACHINESIGNAL_API_KEY: "test-key" }
);
assert.equal(duplicatePaymentWebhookResponse.status, 200);
const duplicatePaymentWebhookPayload = await duplicatePaymentWebhookResponse.json();
assert.equal(duplicatePaymentWebhookPayload.duplicate_webhook, true);
assert.equal(
  duplicatePaymentWebhookPayload.usage.balances.find((item) => item.product_code === "score_pack_1k").credits_purchased,
  1000
);

const paymentIntentReadResponse = await handleRequest(
  new Request(`http://localhost/v1/payment-test/intents/${paymentTestIntentPayload.payment_test_id}`, {
    method: "GET",
    headers: { "x-api-key": paymentCustomerPayload.api_key }
  }),
  { MACHINESIGNAL_API_KEY: "test-key" }
);
assert.equal(paymentIntentReadResponse.status, 200);
const paymentIntentReadPayload = await paymentIntentReadResponse.json();
assert.equal(paymentIntentReadPayload.payment_status, "test_payment_succeeded");
assert.equal(paymentIntentReadPayload.reconciliation.reconciliation_ok, true);

const paymentReconciliationResponse = await handleRequest(
  new Request(`http://localhost/v1/payment-test/reconciliation/${paymentTestIntentPayload.payment_test_id}`, {
    method: "GET",
    headers: { "x-api-key": paymentCustomerPayload.api_key }
  }),
  { MACHINESIGNAL_API_KEY: "test-key" }
);
assert.equal(paymentReconciliationResponse.status, 200);
const paymentReconciliationPayload = await paymentReconciliationResponse.json();
assert.equal(paymentReconciliationPayload.reconciliation_ok, true);
assert.equal(paymentReconciliationPayload.real_payment_executed, false);
assert.equal(paymentReconciliationPayload.ready_for_real_payments, false);

const failedPaymentIntentResponse = await handleRequest(
  new Request("http://localhost/v1/payment-test/intents", {
    method: "POST",
    body: JSON.stringify({
      product_code: "deep_analysis",
      amount_eur: 349,
      provider: "stripe",
      provider_mode: "sandbox"
    }),
    headers: {
      "content-type": "application/json",
      "x-api-key": paymentCustomerPayload.api_key,
      "idempotency-key": "payment-test-intent-failed-001"
    }
  }),
  { MACHINESIGNAL_API_KEY: "test-key" }
);
assert.equal(failedPaymentIntentResponse.status, 200);
const failedPaymentIntentPayload = await failedPaymentIntentResponse.json();

const failedPaymentWebhookResponse = await handleRequest(
  new Request("http://localhost/v1/payment-test/webhooks/stripe", {
    method: "POST",
    body: JSON.stringify({
      customer_id: "payment_test_customer",
      payment_test_id: failedPaymentIntentPayload.payment_test_id,
      event_type: "payment_intent.payment_failed",
      event_id: "evt_payment_test_failed_001"
    }),
    headers: {
      "content-type": "application/json",
      "x-machinesignal-test-webhook-signature":
        failedPaymentIntentPayload.test_webhook_simulation.failure_signature
    }
  }),
  { MACHINESIGNAL_API_KEY: "test-key" }
);
assert.equal(failedPaymentWebhookResponse.status, 200);
const failedPaymentWebhookPayload = await failedPaymentWebhookResponse.json();
assert.equal(failedPaymentWebhookPayload.payment_status, "test_payment_failed");
assert.equal(failedPaymentWebhookPayload.credits_activated, 0);
assert.equal(
  failedPaymentWebhookPayload.usage.balances.find((item) => item.product_code === "deep_analysis_pack_100").credits_purchased,
  0
);

const unauthorizedPaymentReportResponse = await handleRequest(
  new Request("http://localhost/v1/admin/payment-test-report?customer_id=payment_test_customer", {
    method: "GET"
  }),
  { MACHINESIGNAL_API_KEY: "test-key" }
);
assert.equal(unauthorizedPaymentReportResponse.status, 401);

const paymentReportResponse = await handleRequest(
  new Request("http://localhost/v1/admin/payment-test-report?customer_id=payment_test_customer", {
    method: "GET",
    headers: { "x-api-key": "test-key" }
  }),
  { MACHINESIGNAL_API_KEY: "test-key" }
);
assert.equal(paymentReportResponse.status, 200);
const paymentReportPayload = await paymentReportResponse.json();
assert.equal(paymentReportPayload.customer_id, "payment_test_customer");
assert.ok(paymentReportPayload.summary.payment_test_count >= 2);
assert.equal(paymentReportPayload.summary.succeeded, 1);
assert.equal(paymentReportPayload.summary.failed, 1);
assert.equal(paymentReportPayload.summary.ready_for_real_payments, false);
assert.equal(paymentReportPayload.safety.real_payment_executed, false);
assert.ok(paymentReportPayload.recommended_next_controls.includes("Keep provider mode locked to test/sandbox until legal, fiscal and payment-provider readiness are complete."));

console.log("MachineSignal minimal API tests passed.");
