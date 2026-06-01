import assert from "node:assert/strict";
import { handleRequest, MachineSignalLedgerDurableObject } from "./core.mjs";

class MemoryStorage {
  constructor() {
    this.values = new Map();
  }

  async get(key) {
    return this.values.get(key);
  }

  async put(key, value) {
    this.values.set(key, structuredClone(value));
  }
}

class MemoryDurableObjectNamespace {
  constructor(env) {
    this.env = env;
    this.objects = new Map();
  }

  idFromName(name) {
    return name;
  }

  get(id) {
    if (!this.objects.has(id)) {
      const ctx = { storage: new MemoryStorage() };
      this.objects.set(id, new MachineSignalLedgerDurableObject(ctx, this.env));
    }
    return this.objects.get(id);
  }
}

class MemoryKv {
  constructor() {
    this.values = new Map();
  }

  async get(key, type) {
    const value = this.values.get(key);
    if (value === undefined) return null;
    return type === "json" ? JSON.parse(value) : value;
  }

  async put(key, value) {
    this.values.set(key, value);
  }

  async list({ prefix = "" } = {}) {
    return {
      keys: [...this.values.keys()]
        .filter((name) => name.startsWith(prefix))
        .map((name) => ({ name })),
      list_complete: true
    };
  }
}

async function requestJson(request) {
  const response = await handleRequest(request, env);
  const payload = await response.json();
  return { status: response.status, payload };
}

const env = {
  MACHINESIGNAL_API_KEY: "admin-test-key",
  MACHINESIGNAL_LEDGER_KV: new MemoryKv()
};
env.MACHINESIGNAL_LEDGER_DO = new MemoryDurableObjectNamespace(env);

const createCustomer = await requestJson(
  new Request("http://localhost/v1/beta/customers", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": "admin-test-key",
      "idempotency-key": "do-customer-create-001"
    },
    body: JSON.stringify({
      customer_id: "do_test_customer",
      contact_email: "beta@machinesignal.it",
      score_credits: 40,
      deep_analysis_credits: 20,
      verification_credits: 20,
      nurture_signal_credits: 20
    })
  })
);

assert.equal(createCustomer.status, 200);
assert.equal(createCustomer.payload.usage.ledger_backend, "durable_object");
const customerKey = createCustomer.payload.api_key;

let scoreCount = 0;
let purchaseCount = 0;
const purchaseByProduct = {};
const domains = [
  ["quinta-essenza.com", "medicina estetica"],
  ["clinic3.it", "dentist"],
  ["studio-odontoiatrico-demo.it", "dentist"],
  ["vistavisiongroup.com", "medicina estetica"],
  ["demo-clinic-lombardia.it", "dentist"],
  ["studio-legale-demo.it", "law firm"]
];

for (let index = 0; index < 24; index += 1) {
  const [domain, sector_hint] = domains[index % domains.length];
  const score = await requestJson(
    new Request("http://localhost/v1/lead-opportunity-score", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": customerKey,
        "idempotency-key": `do-score-${String(index + 1).padStart(3, "0")}`
      },
      body: JSON.stringify({ domain, sector_hint, country_hint: "IT" })
    })
  );
  assert.equal(score.status, 200);
  assert.equal(score.payload.usage.ledger_backend, "durable_object");
  scoreCount += 1;

  const nextProduct = score.payload.next_purchase?.next_product;
  if (!["deep_analysis", "verification", "nurture_signal"].includes(nextProduct)) continue;
  const purchase = await requestJson(
    new Request("http://localhost/v1/purchase-intent", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": customerKey,
        "idempotency-key": `do-purchase-${String(index + 1).padStart(3, "0")}-${nextProduct}`
      },
      body: JSON.stringify({
        product_code: nextProduct,
        domain,
        source_score_request_id: score.payload.request_id,
        reason: `Durable Object test: ${score.payload.decision}`
      })
    })
  );
  assert.equal(purchase.status, 200);
  assert.equal(purchase.payload.usage.ledger_backend, "durable_object");
  purchaseCount += 1;
  purchaseByProduct[nextProduct] = (purchaseByProduct[nextProduct] || 0) + 1;
}

const duplicateScore = await requestJson(
  new Request("http://localhost/v1/lead-opportunity-score", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": customerKey,
      "idempotency-key": "do-score-001"
    },
    body: JSON.stringify({
      domain: "quinta-essenza.com",
      sector_hint: "medicina estetica",
      country_hint: "IT"
    })
  })
);
assert.equal(duplicateScore.status, 200);
assert.equal(duplicateScore.payload.usage.current_event.duplicate_request, true);

const usage = await requestJson(
  new Request("http://localhost/v1/usage", {
    headers: { "x-api-key": customerKey }
  })
);
assert.equal(usage.status, 200);
assert.equal(usage.payload.ledger_backend, "durable_object");

const scoreBalance = usage.payload.balances.find((item) => item.product_code === "score_pack_1k");
const deepBalance = usage.payload.balances.find((item) => item.product_code === "deep_analysis_pack_100");
const verificationBalance = usage.payload.balances.find(
  (item) => item.product_code === "verification_pack_100"
);
const nurtureBalance = usage.payload.balances.find(
  (item) => item.product_code === "nurture_signal_pack_100"
);

assert.equal(scoreBalance.credits_used, scoreCount);
assert.equal(deepBalance.credits_used, purchaseByProduct.deep_analysis || 0);
assert.equal(verificationBalance.credits_used, purchaseByProduct.verification || 0);
assert.equal(nurtureBalance.credits_used, purchaseByProduct.nurture_signal || 0);

const orders = await requestJson(
  new Request("http://localhost/v1/orders", {
    headers: { "x-api-key": customerKey }
  })
);
assert.equal(orders.status, 200);
assert.equal(orders.payload.count, purchaseCount);

await env.MACHINESIGNAL_LEDGER_KV.put(
  "customer:old_kv_customer",
  JSON.stringify({
    customer_id: "old_kv_customer",
    status: "active",
    customer_type: "beta_customer",
    plan: "kv_legacy_test"
  })
);
await env.MACHINESIGNAL_LEDGER_KV.put(
  "ledger:customer:old_kv_customer",
  JSON.stringify({
    customer_id: "old_kv_customer",
    balances: {
      score_pack_1k: {
        product_code: "score_pack_1k",
        credits_purchased: 10,
        credits_used: 2
      }
    },
    events: [
      {
        event_id: "evt_0001",
        timestamp: new Date().toISOString(),
        customer_id: "old_kv_customer",
        product_code: "score_pack_1k",
        request_id: "old-score-001",
        status: "valid_output",
        reason: "legacy_kv_score",
        credits_consumed: 1,
        metadata: {}
      },
      {
        event_id: "evt_0002",
        timestamp: new Date().toISOString(),
        customer_id: "old_kv_customer",
        product_code: "score_pack_1k",
        request_id: "old-score-002",
        status: "valid_output",
        reason: "legacy_kv_score",
        credits_consumed: 1,
        metadata: {}
      }
    ],
    orders: [],
    real_payment_executed: false,
    external_contact_executed: false
  })
);

const migratedAudit = await requestJson(
  new Request("http://localhost/v1/admin/audit-report?customer_id=old_kv_customer", {
    headers: { "x-api-key": "admin-test-key" }
  })
);
assert.equal(migratedAudit.status, 200);
assert.equal(migratedAudit.payload.customer_id, "old_kv_customer");
assert.equal(migratedAudit.payload.ledger_backend, "durable_object");
assert.equal(migratedAudit.payload.summary.reconciliation_ok, true);
assert.equal(
  migratedAudit.payload.product_reconciliation.find((item) => item.product_code === "score_pack_1k")
    .credits_used,
  2
);

console.log(
  JSON.stringify(
    {
      ok: true,
      ledger_backend: usage.payload.ledger_backend,
      score_count: scoreCount,
      purchase_count: purchaseCount,
      purchase_by_product: purchaseByProduct,
      orders_count: orders.payload.count
    },
    null,
    2
  )
);
