const DEFAULT_ALLOWED_ORIGIN = "*";
const LEDGER_KV_BINDING = "MACHINESIGNAL_LEDGER_KV";

const DEFAULT_LEDGER_STATE = {
  customer_id: "demo_machine_customer_001",
  balances: {
    score_pack_1k: {
      product_code: "score_pack_1k",
      credits_purchased: 1000,
      credits_used: 0
    },
    deep_analysis_pack_100: {
      product_code: "deep_analysis_pack_100",
      credits_purchased: 100,
      credits_used: 0
    },
    verification_pack_100: {
      product_code: "verification_pack_100",
      credits_purchased: 100,
      credits_used: 0
    },
    nurture_signal_pack_100: {
      product_code: "nurture_signal_pack_100",
      credits_purchased: 100,
      credits_used: 0
    },
    action_pack_25: {
      product_code: "action_pack_25",
      credits_purchased: 25,
      credits_used: 0
    },
    target_discovery_pack_250: {
      product_code: "target_discovery_pack_250",
      credits_purchased: 1,
      credits_used: 0
    },
    domain_enrichment_pack_100: {
      product_code: "domain_enrichment_pack_100",
      credits_purchased: 1,
      credits_used: 0
    },
    opportunity_feed_monthly: {
      product_code: "opportunity_feed_monthly",
      credits_purchased: 1,
      credits_used: 0
    }
  },
  events: [],
  orders: [],
  real_payment_executed: false,
  external_contact_executed: false
};

const PRODUCT_CATALOG = {
  service: "MachineSignal",
  catalog_version: "2026-05-29-beta",
  currency: "EUR",
  primary_customer_interface: "machine",
  payment_mode: {
    beta: "purchase-intent only",
    real_payment_executed: false,
    external_contact_executed: false,
    note:
      "During beta, purchase-intent records machine demand and consumes beta credits. It does not charge a payment method."
  },
  general_credit_rule: {
    rule: "credits are consumed only when the system produces a valid usable output",
    not_charged: [
      "duplicate records",
      "invalid domains",
      "records that cannot be analyzed",
      "outputs with insufficient signal for the purchased product"
    ],
    tracking:
      "Each consumption event is tracked with request_id, product_code, status, credits_consumed and credits_remaining."
  },
  machine_buying_scenarios: {
    customer_has_list: {
      machine_goal:
        "Prioritize an existing list of domains or companies before spending campaign, CRM or agent budget.",
      first_call: "POST /v1/lead-opportunity-score",
      first_product: "score_pack_1k",
      next_products: ["deep_analysis", "verification", "nurture_signal", "action_pack"]
    },
    customer_has_no_list: {
      machine_goal:
        "Find companies or domains useful for a specific commercial objective, sector and area.",
      first_call: "POST /v1/purchase-intent",
      first_product: "target_discovery",
      required_inputs: ["market", "area", "commercial_objective"],
      example_commercial_objective:
        "find real estate agency websites worth scoring for digital presence improvement opportunities",
      next_products: ["score_pack_1k", "domain_enrichment", "deep_analysis"]
    },
    customer_wants_next_action: {
      machine_goal:
        "Turn a confirmed opportunity into a CRM- or agent-readable action payload.",
      first_call: "POST /v1/purchase-intent",
      first_product: "action_pack",
      required_inputs: ["domain", "source_score_request_id", "reason"],
      next_products: ["opportunity_feed", "api_pro"]
    }
  },
  products: {
    target_discovery_pack_250: {
      name: "Target Discovery Pack",
      price_eur: 149,
      unit: "250 coherent targets",
      current_beta_endpoint: "POST /v1/purchase-intent",
      product_code: "target_discovery",
      when_to_buy:
        "When the customer machine does not already have a list and wants targets for a specific commercial objective, sector and area.",
      includes: [
        "pre-check of market availability",
        "commercial objective normalization",
        "opportunity hypothesis for why the target is commercially relevant",
        "250 normalized and deduplicated targets when the market is available",
        "domain when available",
        "category",
        "area",
        "initial opportunity signals",
        "reason for inclusion",
        "JSON or CSV export"
      ],
      validity_rule:
        "The pack is activated only when the pre-check indicates that 250 coherent targets can be produced. If not, the machine receives alternatives: Mini Discovery, wider area, broader criteria or changed commercial objective.",
      machine_output:
        "A target list built for a declared commercial objective, ready for scoring or CRM enrichment workflows."
    },
    score_pack_1k: {
      name: "Score Pack 1k",
      price_eur: 99,
      unit: "1000 valid scores",
      current_beta_endpoint: "POST /v1/lead-opportunity-score",
      product_code: "score_pack_1k",
      when_to_buy:
        "When the customer machine already has a list and needs to prioritize where to spend budget.",
      includes: [
        "list cleaning",
        "deduplication",
        "exclusion of invalid or non-analyzable records",
        "opportunity_score",
        "confidence",
        "operational decision",
        "short reason",
        "priority",
        "recommended next purchase"
      ],
      validity_rule:
        "Duplicate, invalid or non-analyzable records do not consume score credits. The pack ends after 1000 valid scores.",
      machine_output: "Score, confidence, decision, reason, priority and recommended next product."
    },
    domain_enrichment_pack_100: {
      name: "Domain Enrichment Pack 100",
      price_eur: 149,
      unit: "100 completed domain-enrichment decisions",
      current_beta_endpoint: "POST /v1/purchase-intent",
      product_code: "domain_enrichment",
      when_to_buy:
        "When the customer machine has target names but does not have reliable domains to score.",
      includes: [
        "100 target records processed",
        "public-source lookup",
        "domain when verified",
        "confidence level",
        "evidence source type",
        "status for each target",
        "reason when no reliable domain is found",
        "JSON or CSV export ready for scoring workflows"
      ],
      validity_rule:
        "One credit is consumed for each completed enrichment decision: verified_domain, candidate_not_reliable or no_reliable_domain. The product does not promise that every target will have a domain.",
      machine_output:
        "A domain-enrichment result list that tells the workflow which records can move to scoring and which records should stop or be widened."
    },
    deep_analysis_pack_100: {
      name: "Deep Analysis Pack 100",
      price_eur: 299,
      unit: "100 valid deep analyses",
      current_beta_endpoint: "POST /v1/purchase-intent",
      product_code: "deep_analysis",
      when_to_buy:
        "When a high score needs an explanation before the workflow spends more budget.",
      includes: [
        "commercial signal analysis",
        "score explanation",
        "possible sellable service",
        "false-positive risk",
        "urgency level",
        "buy, hold or skip recommendation"
      ],
      validity_rule:
        "Leads without enough data for a complete analysis do not consume deep-analysis credits and are returned with an exclusion reason.",
      machine_output:
        "A deeper JSON analysis that tells the workflow whether to continue, pause or stop."
    },
    action_pack_25: {
      name: "Action Pack 25",
      price_eur: 399,
      unit: "25 valid action packs",
      current_beta_endpoint: "POST /v1/purchase-intent",
      product_code: "action_pack",
      when_to_buy:
        "When Deep Analysis confirms that a lead deserves a prepared commercial action.",
      includes: [
        "what_is_included contract",
        "CRM-ready record patch",
        "CRM task payload",
        "CRM platform field mappings",
        "workflow payload",
        "agent instructions",
        "webhook event schema",
        "webhook delivery policy",
        "audit event",
        "approval gate",
        "deduplication key",
        "message angle with forbidden claims",
        "stop rules",
        "compliance guardrail"
      ],
      output_fields: [
        "what_is_included",
        "priority",
        "crm_record_patch",
        "crm_task",
        "crm_platform_mappings",
        "workflow_payload",
        "agent_instructions",
        "webhook_event",
        "webhook_delivery_policy",
        "audit_event",
        "approval_gate",
        "deduplication_key",
        "next_api_calls",
        "message_angle",
        "stop_rules",
        "follow_up_sequence",
        "compliance_guardrail"
      ],
      validity_rule:
        "If the lead does not have enough signal for a sensible commercial action, the pack is not consumed and the system returns the exclusion reason.",
      machine_output:
        "A CRM-ready JSON action payload for workflow automation, webhook forwarding or supervised agent execution."
    },
    opportunity_feed_monthly: {
      name: "Opportunity Feed",
      price_eur: 249,
      unit: "1 month",
      current_beta_endpoint: "POST /v1/purchase-intent",
      product_code: "opportunity_feed",
      when_to_buy:
        "When the customer machine wants recurring opportunities without launching one-off discovery requests.",
      includes: [
        "1 recurring monthly feed",
        "4 scheduled scans",
        "4 scheduled deliveries",
        "new or updated targets",
        "base score",
        "main signals",
        "priority",
        "API, file or webhook output"
      ],
      validity_rule:
        "If a scan does not produce coherent opportunities, the system returns a market coverage report and suggested changes. It does not fill the feed with weak targets.",
      machine_output: "A scheduled feed of targets, scores and signals for automated systems."
    },
    api_starter_monthly: {
      name: "API Starter",
      price_eur: 99,
      unit: "1 month",
      current_beta_endpoint: "API key + score endpoint",
      product_code: "api_starter",
      when_to_buy: "For light recurring use and continuous testing.",
      includes: [
        "1 API key",
        "documentation",
        "demo environment",
        "score endpoint",
        "500 valid scores per month",
        "basic usage report",
        "standard asynchronous support"
      ],
      validity_rule:
        "The 500 monthly scores follow the valid-output rule. Extra usage requires add-on packs or upgrade.",
      machine_output: "Authenticated access to the score API with monthly usage visibility."
    },
    api_pro_monthly: {
      name: "API Pro",
      price_eur: 499,
      unit: "1 month",
      current_beta_endpoint: "API key + advanced volumes",
      product_code: "api_pro",
      when_to_buy:
        "For CRMs, agencies, platforms or automated workflows with recurring volume.",
      includes: [
        "1 advanced API key",
        "3000 valid scores per month",
        "50 valid Deep Analysis outputs per month",
        "1 monthly Opportunity Feed",
        "webhook support",
        "processing priority",
        "advanced usage report",
        "asynchronous technical support"
      ],
      validity_rule:
        "Scores and Deep Analysis follow the valid-output rule. Action Packs and extra usage are bought separately.",
      machine_output: "Higher-volume API access with feed, webhook and usage reporting."
    },
    custom_overage: {
      name: "Custom / overage",
      price_eur_from: 2000,
      unit: "custom quote",
      current_beta_endpoint: "custom approval",
      product_code: "custom_overage",
      when_to_buy:
        "When the customer exceeds standard limits or needs dedicated integrations.",
      includes: [
        "extra usage beyond standard packs",
        "custom batches",
        "dedicated endpoint or export",
        "custom scoring rules",
        "specific integrations",
        "additional technical support"
      ],
      validity_rule:
        "Each custom request is quoted before activation with volume, expected output, delivery timing, estimated cost and usage limits.",
      machine_output: "A custom machine-readable scope and delivery agreement."
    }
  }
};

export const openApi = {
  openapi: "3.1.0",
  info: {
    title: "MachineSignal Lead Opportunity Score API",
    version: "0.1.0-beta",
    description:
      "Callable beta endpoint for machine-readable lead opportunity scoring, no-list target discovery, credit-ledger tracking and budget routing.",
    contact: {
      name: "Team MachineSignal",
      email: "beta@machinesignal.it",
      url: "https://machinesignal.it/"
    }
  },
  servers: [
    {
      url: "https://machinesignal-api.beta-878.workers.dev",
      description: "Callable beta endpoint"
    },
    {
      url: "https://api.machinesignal.it",
      description: "Planned custom API host"
    }
  ],
  paths: {
    "/machine-onboarding.json": {
      get: {
        operationId: "getMachineOnboardingManifest",
        summary: "Return public machine-readable onboarding manifest",
        description:
          "Public manifest for AI agents, CRMs and automated workflows. Explains discovery, authentication, endpoints, credit model and safe beta limits."
      }
    },
    "/product-catalog.json": {
      get: {
        operationId: "getProductCatalog",
        summary: "Return public machine-readable product catalog",
        description:
          "Public catalog for automated systems. Lists machine buying scenarios, product codes, exact beta prices, included deliverables, validity rules and credit consumption rules."
      }
    },
    "/v1/onboarding": {
      get: {
        operationId: "getAuthenticatedOnboarding",
        summary: "Return onboarding state for authenticated machine customer",
        description:
          "Returns customer-specific onboarding state, available endpoints, credit balances and next machine actions.",
        security: [{ ApiKeyAuth: [] }],
        responses: {
          200: {
            description: "Authenticated machine onboarding state.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthenticatedOnboardingResponse" }
              }
            }
          },
          401: { description: "Missing or invalid X-API-Key." }
        }
      }
    },
    "/v1/sandbox/customers": {
      post: {
        operationId: "createSandboxCustomer",
        summary: "Create a limited sandbox customer API key",
        description:
          "Public limited sandbox endpoint for machine evaluators. Creates a sandbox API key with very small credit limits so an external machine can test the beta flow without manual sales contact. Sandbox keys expire, are rate-limited and do not execute real payment or external outreach.",
        parameters: [
          {
            name: "Idempotency-Key",
            in: "header",
            required: false,
            schema: { type: "string", example: "sandbox-evaluator-20260601-001" },
            description:
              "Optional stable key supplied by the evaluator. Used only to make the generated sandbox customer traceable."
          }
        ],
        requestBody: {
          required: false,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  evaluator_type: {
                    type: "string",
                    example: "ai_agent"
                  },
                  integration_target: {
                    type: "string",
                    example: "custom CRM workflow"
                  },
                  expected_test_path: {
                    type: "string",
                    example: "full_flow"
                  }
                }
              },
              examples: {
                aiAgentSandbox: {
                  summary: "Create a limited sandbox key for an AI evaluator",
                  value: {
                    evaluator_type: "ai_agent",
                    integration_target: "custom CRM workflow",
                    expected_test_path: "full_flow"
                  }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description:
              "Sandbox customer created. Store api_key immediately; it is returned only in this response.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/BetaCustomerCreateResponse" }
              }
            }
          },
          400: { description: "Invalid request." },
          403: { description: "Sandbox key creation is disabled." },
          429: { description: "Sandbox daily creation limit reached." }
        }
      }
    },
    "/v1/lead-opportunity-score": {
      post: {
        operationId: "scoreLeadOpportunity",
        summary: "Score a business domain",
        description:
          "Consumes one score credit only when a valid score is produced. Send an Idempotency-Key to avoid double charging repeated requests.",
        security: [{ ApiKeyAuth: [] }],
        parameters: [
          {
            name: "Idempotency-Key",
            in: "header",
            required: true,
            schema: { type: "string", example: "crm-import-20260529-row-0001" },
            description:
              "Unique request key. Reusing the same key returns the same ledger event and does not consume another credit."
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LeadScoreRequest" },
              examples: {
                dentistItaly: {
                  summary: "Italian dental clinic domain",
                  value: {
                    domain: "studio-odontoiatrico-demo.it",
                    sector_hint: "dentist",
                    country_hint: "IT"
                  }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: "Score delivered and one score credit consumed, unless the idempotency key was already used.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/LeadScoreResponse" }
              }
            }
          },
          400: { description: "Invalid JSON body or missing domain." },
          401: { description: "Missing or invalid X-API-Key." }
        }
      }
    },
    "/v1/usage": {
      get: {
        operationId: "getUsage",
        summary: "Return demo credit ledger balances and usage events",
        description:
          "Returns purchased, used and remaining credits for score, deep analysis and action packs.",
        security: [{ ApiKeyAuth: [] }],
        responses: {
          200: {
            description: "Credit ledger for the authenticated beta customer.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UsageLedger" }
              }
            }
          },
          401: { description: "Missing or invalid X-API-Key." }
        }
      }
    },
    "/v1/admin/sandbox-metrics": {
      get: {
        operationId: "getSandboxMetrics",
        summary: "Return 7-day sandbox test metrics",
        description:
          "Admin-only endpoint. Aggregates sandbox customer creation, score usage, Deep Analysis orders, Action Pack orders and safety flags so agents can monitor the 7-day test without manual spreadsheet work.",
        security: [{ ApiKeyAuth: [] }],
        responses: {
          200: {
            description: "Sandbox test metrics.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SandboxMetricsResponse" }
              }
            }
          },
          401: { description: "Missing or invalid admin X-API-Key." }
        }
      }
    },
    "/v1/purchase-intent": {
      post: {
        operationId: "createPurchaseIntent",
        summary: "Create a beta order intent for a recommended next product",
        description:
          "Creates a tracked beta order intent for target_discovery, domain_enrichment, verification, nurture_signal, deep_analysis, action_pack or opportunity_feed. This consumes one corresponding pack credit but does not execute real payment.",
        security: [{ ApiKeyAuth: [] }],
        parameters: [
          {
            name: "Idempotency-Key",
            in: "header",
            required: true,
            schema: { type: "string", example: "crm-import-20260529-order-0001" },
            description:
              "Unique order key. Reusing the same key returns the same ledger event and does not consume another credit."
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PurchaseIntentRequest" },
              examples: {
                targetDiscovery: {
                  summary: "Order a beta target discovery pack",
                  value: {
                    product_code: "target_discovery",
                    domain: "dentist-market-demo.it",
                    source_score_request_id: null,
                    reason: "Customer machine does not already have a list to score"
                  }
                },
                verification: {
                  summary: "Order a beta verification for a lead",
                  value: {
                    product_code: "verification",
                    domain: "studio-legale-demo.it",
                    source_score_request_id: "crm-import-20260529-row-0007",
                    reason: "Score decision was needs_verification"
                  }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description:
              "Purchase intent accepted or returned as duplicate without executing real payment.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PurchaseIntentResponse" }
              }
            }
          },
          400: { description: "Invalid JSON body or unsupported product_code." },
          401: { description: "Missing or invalid X-API-Key." }
        }
      }
    },
    "/v1/orders": {
      get: {
        operationId: "listOrders",
        summary: "List beta order intents and deliveries",
        description:
          "Returns recent beta orders created by the authenticated customer machine. Optional query filters: product_code, domain and status.",
        security: [{ ApiKeyAuth: [] }],
        parameters: [
          {
            name: "product_code",
            in: "query",
            required: false,
            schema: { type: "string", example: "verification" }
          },
          {
            name: "domain",
            in: "query",
            required: false,
            schema: { type: "string", example: "studio-legale-demo.it" }
          },
          {
            name: "status",
            in: "query",
            required: false,
            schema: { type: "string", example: "accepted_beta_order_intent" }
          }
        ],
        responses: {
          200: {
            description: "Order list for the authenticated beta customer.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/OrderListResponse" }
              }
            }
          },
          401: { description: "Missing or invalid X-API-Key." }
        }
      }
    },
    "/v1/orders/{order_intent_id}": {
      get: {
        operationId: "getOrder",
        summary: "Get one beta order intent and delivery",
        description:
          "Returns a single beta order by order_intent_id, including delivery and ledger event reference.",
        security: [{ ApiKeyAuth: [] }],
        parameters: [
          {
            name: "order_intent_id",
            in: "path",
            required: true,
            schema: { type: "string", example: "ord_1234abcd" }
          }
        ],
        responses: {
          200: {
            description: "Order found.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/OrderResponse" }
              }
            }
          },
          401: { description: "Missing or invalid X-API-Key." },
          404: { description: "Order not found." }
        }
      }
    },
    "/v1/beta/customers": {
      post: {
        operationId: "createBetaCustomer",
        summary: "Create a beta customer and dedicated API key",
        description:
          "Admin-only beta endpoint. Creates a machine customer, assigns initial credits and returns a dedicated API key once.",
        security: [{ ApiKeyAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/BetaCustomerCreateRequest" },
              examples: {
                betaPartner: {
                  summary: "Create a technical beta partner",
                  value: {
                    customer_id: "beta_partner_001",
                    contact_email: "partner@example.com",
                    plan: "beta_starter",
                    score_credits: 100,
                    verification_credits: 25,
                    nurture_signal_credits: 25,
                    deep_analysis_credits: 10,
                    action_pack_credits: 5
                  }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description:
              "Beta customer created. Store api_key immediately; it is returned only in this response.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/BetaCustomerCreateResponse" }
              }
            }
          },
          400: { description: "Invalid request." },
          401: { description: "Missing or invalid admin X-API-Key." }
        }
      }
    },
    "/v1/beta/customers/{customer_id}": {
      get: {
        operationId: "getBetaCustomerAdmin",
        summary: "Read beta customer status and usage",
        description:
          "Admin-only endpoint. Returns customer status, API key prefix, balances, recent events and recent orders without exposing the full customer API key.",
        security: [{ ApiKeyAuth: [] }],
        parameters: [
          {
            name: "customer_id",
            in: "path",
            required: true,
            schema: { type: "string", example: "beta_partner_001" }
          }
        ],
        responses: {
          200: {
            description: "Beta customer admin view.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/BetaCustomerAdminResponse" }
              }
            }
          },
          401: { description: "Missing or invalid admin X-API-Key." },
          404: { description: "Beta customer not found." }
        }
      },
      patch: {
        operationId: "updateBetaCustomerAdmin",
        summary: "Update beta customer status or credits",
        description:
          "Admin-only endpoint. Can suspend/reactivate a beta customer, add credits, set credit limits or reset usage for controlled beta tests.",
        security: [{ ApiKeyAuth: [] }],
        parameters: [
          {
            name: "customer_id",
            in: "path",
            required: true,
            schema: { type: "string", example: "beta_partner_001" }
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/BetaCustomerAdminUpdateRequest" },
              examples: {
                topUpCredits: {
                  summary: "Top up a customer for another beta test",
                  value: {
                    add_credits: {
                      score_pack_1k: 20,
                      verification_pack_100: 10,
                      deep_analysis_pack_100: 5,
                      target_discovery_pack_250: 1
                    },
                    reason: "top up beta test credits"
                  }
                },
                suspendCustomer: {
                  summary: "Suspend a customer",
                  value: {
                    status: "suspended",
                    reason: "pause beta access"
                  }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: "Beta customer updated.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/BetaCustomerAdminResponse" }
              }
            }
          },
          400: { description: "Invalid request." },
          401: { description: "Missing or invalid admin X-API-Key." },
          404: { description: "Beta customer not found." }
        }
      }
    },
    "/health": {
      get: {
        operationId: "healthCheck",
        summary: "Health check"
      }
    },
    "/postman_collection.json": {
      get: {
        operationId: "getPostmanCollection",
        summary: "Return a Postman collection for machine and developer testing"
      }
    },
    "/llms.txt": {
      get: {
        operationId: "getLlmsTxt",
        summary: "Return machine-readable discovery guidance"
      }
    }
  },
  components: {
    securitySchemes: {
      ApiKeyAuth: {
        type: "apiKey",
        in: "header",
        name: "X-API-Key"
      }
    },
    schemas: {
      LeadScoreRequest: {
        type: "object",
        required: ["domain"],
        properties: {
          domain: {
            type: "string",
            description: "Business domain or website URL to score.",
            example: "studio-odontoiatrico-demo.it"
          },
          sector_hint: {
            type: "string",
            description: "Optional sector context used by the scoring model.",
            example: "dentist"
          },
          target_name: {
            type: "string",
            description:
              "Optional business name used by sector-specific quality gates when the machine has target context.",
            example: "Studio Dentistico Demo"
          },
          category_hint: {
            type: "string",
            description:
              "Optional business category used to reduce false positives in adjacent sectors.",
            example: "clinic"
          },
          country_hint: {
            type: "string",
            description: "Optional country hint.",
            example: "IT"
          }
        }
      },
      LeadScoreResponse: {
        type: "object",
        properties: {
          domain: { type: "string", example: "studio-odontoiatrico-demo.it" },
          opportunity_score: { type: "integer", minimum: 0, maximum: 100, example: 61 },
          confidence: { type: "number", example: 0.62 },
          priority: { type: "string", enum: ["low", "medium", "high"], example: "medium" },
          decision: {
            type: "string",
            enum: ["discard", "watchlist", "nurture", "buy_deep_analysis", "needs_verification"],
            example: "watchlist"
          },
          reason: {
            type: "string",
            example: "Signals suggest a medium opportunity that should be monitored before spending more budget."
          },
          quality_review: {
            type: "object",
            description: "Sector-specific quality gate result for machine review.",
            properties: {
              status: { type: "string", example: "sector_quality_passed" },
              score_delta: { type: "integer", example: 0 },
              confidence_cap: { type: ["number", "null"], example: null },
              reason: { type: "string" }
            }
          },
          next_purchase: {
            type: "object",
            description:
              "Machine-readable commercial recommendation. Null next_product means do not buy an add-on now."
          },
          machine_next_step: {
            type: "object",
            description:
              "Action and budget instruction that a CRM, agent or workflow can consume directly."
          },
          request_id: {
            type: "string",
            description: "Echo of Idempotency-Key or generated request id."
          },
          usage: { $ref: "#/components/schemas/UsageLedger" }
        }
      },
      PurchaseIntentRequest: {
        type: "object",
        required: ["product_code"],
        properties: {
          product_code: {
            type: "string",
            enum: [
              "target_discovery",
              "domain_enrichment",
              "verification",
              "nurture_signal",
              "deep_analysis",
              "action_pack",
              "opportunity_feed"
            ],
            example: "target_discovery"
          },
          domain: {
            type: "string",
            description:
              "Domain that the machine wants to buy the next product for. Optional for target discovery and domain enrichment batch requests.",
            example: "studio-legale-demo.it"
          },
          target_name: {
            type: "string",
            description:
              "Target name for products that start before a reliable domain exists, such as domain_enrichment.",
            example: "Studio Dentistico Demo"
          },
          batch_id: {
            type: "string",
            description:
              "Machine-readable batch reference for list-based discovery or enrichment requests.",
            example: "dentists-lombardy-20260529"
          },
          source_score_request_id: {
            type: "string",
            description: "Optional request id of the score that produced the recommendation.",
            example: "crm-import-20260529-row-0007"
          },
          reason: {
            type: "string",
            description: "Optional machine-readable reason for the purchase intent.",
            example: "Score decision was needs_verification"
          },
          max_budget_eur: {
            type: "number",
            description: "Optional maximum beta budget allowed by the customer machine.",
            example: 1
          }
        }
      },
      PurchaseIntentResponse: {
        type: "object",
        properties: {
          order_intent_id: { type: "string", example: "ord_0001" },
          status: {
            type: "string",
            example: "accepted_beta_order_intent"
          },
          product_code: { type: "string", example: "verification" },
          ledger_product_code: { type: "string", example: "verification_pack_100" },
          domain: { type: "string", example: "studio-legale-demo.it" },
          real_payment_executed: { type: "boolean", example: false },
          external_contact_executed: { type: "boolean", example: false },
          delivery: { $ref: "#/components/schemas/BetaDelivery" },
          usage: { $ref: "#/components/schemas/UsageLedger" }
        }
      },
      BetaDelivery: {
        type: "object",
        description:
          "Immediate machine-readable beta deliverable. The shape changes by product_code, but every delivery explains what was bought, what credit was consumed and what the machine should do next.",
        properties: {
          delivery_id: { type: "string", example: "del_123abc" },
          product_code: {
            type: "string",
            enum: [
              "target_discovery",
              "domain_enrichment",
              "verification",
              "nurture_signal",
              "deep_analysis",
              "action_pack",
              "opportunity_feed"
            ],
            example: "deep_analysis"
          },
          delivery_type: {
            type: "string",
            example: "deep_opportunity_analysis"
          },
          status: { type: "string", example: "deep_analysis_ready" },
          domain: { type: "string", example: "quinta-essenza.com" },
          beta_delivery: { type: "boolean", example: true },
          synthetic_demo_mode: { type: "boolean", example: true },
          real_payment_executed: { type: "boolean", example: false },
          external_contact_executed: { type: "boolean", example: false },
          what_is_included: {
            type: "object",
            description:
              "Exact description of the unit sold, the machine question answered, returned fields and credit policy.",
            example: {
              exact_unit_sold: "one deep opportunity decision pack for one scored domain",
              machine_question_answered:
                "Is this strong enough to justify the next paid action, or should the workflow stop?",
              credit_policy:
                "One deep_analysis_pack_100 credit is consumed for each deep analysis decision pack returned."
            }
          },
          output_contract: {
            type: "object",
            description:
              "For batch products such as target_discovery, describes exact row count, row schema, acceptance criteria and fallback rules.",
            example: {
              exact_unit_sold: "250 coherent target records or a no-go market coverage decision",
              row_schema: ["domain", "target_name", "category", "area", "next_machine_action"]
            }
          },
          next_machine_call: {
            type: "object",
            description:
              "Recommended next API call for the customer machine after reading this delivery.",
            example: {
              method: "POST",
              endpoint: "/v1/purchase-intent",
              required_headers: ["X-API-Key", "Idempotency-Key"]
            }
          },
          stop_rules: {
            type: "array",
            items: { type: "string" },
            description:
              "Conditions where the customer machine should stop spending credits on this lead or market."
          },
          machine_recommendation: {
            type: "string",
            example: "Use this output to decide whether to create an action pack or stop spending."
          }
        },
        additionalProperties: true
      },
      OrderResponse: {
        type: "object",
        properties: {
          order: { type: "object" }
        }
      },
      OrderListResponse: {
        type: "object",
        properties: {
          customer_id: { type: "string", example: "demo_machine_customer_001" },
          count: { type: "integer", example: 7 },
          filters: { type: "object" },
          orders: { type: "array", items: { type: "object" } }
        }
      },
      BetaCustomerCreateRequest: {
        type: "object",
        required: ["customer_id"],
        properties: {
          customer_id: { type: "string", example: "beta_partner_001" },
          contact_email: { type: "string", example: "partner@example.com" },
          plan: { type: "string", example: "beta_starter" },
          score_credits: { type: "integer", example: 100 },
          verification_credits: { type: "integer", example: 25 },
          nurture_signal_credits: { type: "integer", example: 25 },
          deep_analysis_credits: { type: "integer", example: 10 },
          action_pack_credits: { type: "integer", example: 5 },
          target_discovery_credits: { type: "integer", example: 1 },
          domain_enrichment_credits: { type: "integer", example: 1 },
          opportunity_feed_credits: { type: "integer", example: 1 }
        }
      },
      BetaCustomerCreateResponse: {
        type: "object",
        properties: {
          customer_id: { type: "string", example: "beta_partner_001" },
          plan: { type: "string", example: "beta_starter" },
          customer_type: { type: "string", example: "sandbox" },
          expires_at: {
            type: ["string", "null"],
            example: "2026-06-08T08:00:00.000Z"
          },
          api_key: {
            type: "string",
            description: "Returned only once. Store securely."
          },
          onboarding: { type: "object" },
          usage: { $ref: "#/components/schemas/UsageLedger" }
        }
      },
      BetaCustomerAdminUpdateRequest: {
        type: "object",
        properties: {
          status: {
            type: "string",
            enum: ["active", "suspended", "closed"],
            example: "active"
          },
          plan: { type: "string", example: "beta_starter" },
          contact_email: { type: "string", example: "partner@example.com" },
          add_credits: {
            type: "object",
            description:
              "Adds credits to purchased credit limits. Keys are ledger product codes such as score_pack_1k or verification_pack_100.",
            additionalProperties: { type: "integer", minimum: 0 },
            example: { score_pack_1k: 20, verification_pack_100: 10 }
          },
          set_credits: {
            type: "object",
            description:
              "Sets purchased credit limits exactly. Existing usage is preserved unless reset_usage is true.",
            additionalProperties: { type: "integer", minimum: 0 },
            example: { target_discovery_pack_250: 1 }
          },
          reset_usage: {
            type: "boolean",
            description: "Resets used credits to zero for all products.",
            example: false
          },
          reason: { type: "string", example: "top up beta test credits" }
        }
      },
      BetaCustomerAdminResponse: {
        type: "object",
        properties: {
          customer_id: { type: "string", example: "beta_partner_001" },
          contact_email: { type: ["string", "null"], example: "partner@example.com" },
          plan: { type: "string", example: "beta_starter" },
          status: { type: "string", example: "active" },
          api_key_prefix: {
            type: ["string", "null"],
            description: "Only the prefix is exposed; the full customer API key is never returned again.",
            example: "ms_cust_abc123"
          },
          admin_event: { type: ["object", "null"] },
          onboarding: { type: "object" },
          usage: { $ref: "#/components/schemas/UsageLedger" }
        }
      },
      AuthenticatedOnboardingResponse: {
        type: "object",
        properties: {
          customer_id: { type: "string", example: "beta_partner_001" },
          auth_type: { type: "string", example: "customer" },
          machine_contract: { type: "object" },
          usage: { $ref: "#/components/schemas/UsageLedger" },
          next_recommended_calls: { type: "array", items: { type: "object" } }
        }
      },
      SandboxMetricsResponse: {
        type: "object",
        properties: {
          generated_at: { type: "string", format: "date-time" },
          test_window_days: { type: "integer", example: 7 },
          sandbox_customers: { type: "object" },
          usage: { type: "object" },
          orders: { type: "object" },
          conversion: { type: "object" },
          safety: { type: "object" },
          targets: { type: "object" },
          progress: { type: "object" },
          interpretation: { type: "string", example: "insufficient_data" }
        }
      },
      UsageLedger: {
        type: "object",
        properties: {
          customer_id: { type: "string", example: "demo_machine_customer_001" },
          ledger_persisted: { type: "boolean", example: true },
          balances: {
            type: "array",
            items: {
              type: "object",
              properties: {
                product_code: { type: "string", example: "score_pack_1k" },
                credits_purchased: { type: "integer", example: 1000 },
                credits_used: { type: "integer", example: 4 },
                credits_remaining: { type: "integer", example: 996 }
              }
            }
          },
          current_event: { type: ["object", "null"] },
          last_events: { type: "array", items: { type: "object" } },
          real_payment_executed: { type: "boolean", example: false },
          external_contact_executed: { type: "boolean", example: false }
        }
      }
    }
  }
};

const llmsTxt = `# MachineSignal

MachineSignal exposes a callable beta API for CRM systems, RevOps workflows and AI agents that need to score business domains before spending budget on enrichment or follow-up.

Base URL: https://machinesignal-api.beta-878.workers.dev

Useful endpoints:
- GET /health
- GET /openapi.json
- GET /postman_collection.json
- GET https://machinesignal.it/postman_public_collection.json
- GET /llms.txt
- GET /machine-onboarding.json
- GET /product-catalog.json
- GET https://machinesignal.it/machine-discovery/machine-discovery-pack.json
- GET https://machinesignal.it/distribution/api-directory-submission.json
- GET https://machinesignal.it/distribution/channel-shortlist.json
- GET https://machinesignal.it/.well-known/machine-discovery.json
- POST /v1/sandbox/customers
- GET /v1/onboarding
- GET /v1/usage
- POST /v1/lead-opportunity-score
- POST /v1/purchase-intent
- GET /v1/orders
- GET /v1/orders/{order_intent_id}
- POST /v1/beta/customers
- GET /v1/beta/customers/{customer_id}
- PATCH /v1/beta/customers/{customer_id}
- GET /v1/admin/sandbox-metrics

Authentication:
- protected endpoints require header X-API-Key: <beta key>;
- public endpoints are /, /health, /openapi.json, /postman_collection.json, https://machinesignal.it/postman_public_collection.json, /product-catalog.json and /llms.txt.
- POST /v1/beta/customers requires the admin beta key and returns a dedicated customer key.
- GET/PATCH /v1/beta/customers/{customer_id} require the admin beta key and never return the full customer API key.
- GET /v1/admin/sandbox-metrics requires the admin beta key and returns only aggregated sandbox test metrics.

How a machine should call the score endpoint:
1. Fetch /llms.txt, /machine-onboarding.json or /openapi.json.
2. Fetch /product-catalog.json to read products, exact beta prices, deliverables and credit rules.
3. If no beta key is available, POST /v1/sandbox/customers to create a limited sandbox key for safe testing.
4. Read the required X-API-Key and Idempotency-Key headers.
5. POST /v1/lead-opportunity-score with JSON body: {"domain":"example.it","sector_hint":"dentist","country_hint":"IT"}.
6. Read decision, machine_next_step and next_purchase.
7. Read /v1/usage to verify consumed and remaining credits.
8. If next_purchase.next_product is not null, POST /v1/purchase-intent to create a beta order intent.
9. Use GET /v1/orders or GET /v1/orders/{order_intent_id} to retrieve previous orders and deliveries.

Three machine buying flows:
1. Customer machine has a list: call POST /v1/lead-opportunity-score for each domain, then route each result by decision.
2. Customer machine has no list: call POST /v1/purchase-intent with product_code target_discovery, market, area and commercial_objective. The objective must say what kind of opportunity the machine wants to find, for example "find real estate agency websites worth scoring for digital presence improvement opportunities".
3. Customer machine wants an action: after a strong score and Deep Analysis, call POST /v1/purchase-intent with product_code action_pack to receive CRM-ready JSON: crm_record_patch, workflow_payload, webhook_event, agent_instructions, message angle, stop rules and follow-up sequence.

Public demos for software, agents and partners:
- Machine Discovery Pack: https://machinesignal.it/machine-discovery/
- Machine Discovery Pack JSON: https://machinesignal.it/machine-discovery/machine-discovery-pack.json
- Technical Distribution Pack: https://machinesignal.it/distribution/
- API Directory Submission JSON: https://machinesignal.it/distribution/api-directory-submission.json
- Distribution Channel Shortlist JSON: https://machinesignal.it/distribution/channel-shortlist.json
- Postman Public Collection JSON: https://machinesignal.it/postman_public_collection.json
- Well-known Machine Discovery JSON: https://machinesignal.it/.well-known/machine-discovery.json
- Full machine buyer flow: https://machinesignal.it/demo/machine-buyer-flow/
- Full flow JSON: https://machinesignal.it/demo/machine-buyer-flow/flow.json
- Score results JSON: https://machinesignal.it/demo/machine-buyer-flow/score_results.json
- Order events JSON: https://machinesignal.it/demo/machine-buyer-flow/order_events.json
- CRM consumer demo: https://machinesignal.it/demo/crm-consumer/
- CRM records JSON: https://machinesignal.it/demo/crm-consumer/crm_records.json
- Webhook events JSON: https://machinesignal.it/demo/crm-consumer/webhook_events.json

Beta tester onboarding resources:
- Beta tester onboarding packet: https://machinesignal.it/beta/onboarding-packet.html
- Onboarding packet JSON: https://machinesignal.it/beta/onboarding-packet.json
- Feedback schema JSON: https://machinesignal.it/beta/feedback-schema.json
- Machine beta test kit: https://machinesignal.it/beta/machine-test-kit.html
- Machine beta test kit JSON: https://machinesignal.it/beta/machine-test-kit.json

Commercial model under test:
- Target Discovery Pack: EUR 149 for 250 coherent targets after market availability pre-check;
- Domain Enrichment Pack 100: EUR 149 for 100 enrichment decisions when a machine has names but not reliable domains;
- Score Pack 1k: EUR 99 for 1000 valid scores;
- Deep Analysis Pack 100: EUR 299 for 100 valid deep analyses;
- Action Pack 25: EUR 399 for 25 valid action packs;
- Opportunity Feed: EUR 249/month for 4 scans and 4 deliveries;
- API Starter: EUR 99/month with 500 valid scores;
- API Pro: EUR 499/month with 3000 valid scores, 50 deep analyses and 1 monthly feed.

Machine-readable decisions:
- discard: do not spend more budget now;
- watchlist: save and rescore later;
- nurture: save in nurturing and consider low-cost enrichment;
- buy_deep_analysis: buy a paid deeper analysis before human/campaign spend;
- needs_verification: verify data quality before spending more budget.

How a machine should create a beta order intent:
- POST /v1/purchase-intent with X-API-Key and Idempotency-Key;
- body example: {"product_code":"domain_enrichment","target_name":"Studio Dentistico Demo","batch_id":"dentists-lombardy-demo"};
- supported product_code values: target_discovery, domain_enrichment, verification, nurture_signal, deep_analysis, action_pack, opportunity_feed;
- the beta order intent consumes one corresponding pack credit;
- the response includes delivery, an immediate machine-readable beta output with what_is_included, output_contract, next_machine_call and stop_rules when relevant;
- no real payment is executed in beta.

Action Pack delivery contract:
- action_pack returns what_is_included, crm_record_patch, crm_task, crm_platform_mappings, workflow_payload, agent_instructions, webhook_event, webhook_delivery_policy, audit_event, approval_gate, deduplication_key, next_api_calls, message_angle, stop_rules, follow_up_sequence and compliance_guardrail;
- webhook_event.event_type is machinesignal.action_pack.ready;
- the customer machine should create/update CRM records first, run a compliance gate, and only then prepare any external action.

How a machine should retrieve previous orders:
- GET /v1/orders with X-API-Key;
- optional filters: product_code, domain, status;
- GET /v1/orders/{order_intent_id} to retrieve one order and its delivery;
- order history is beta ledger data, not invoice data.

How beta onboarding works:
- an evaluator machine can create a limited sandbox key with POST /v1/sandbox/customers;
- an admin creates a beta customer with POST /v1/beta/customers;
- the response returns a dedicated API key once;
- the customer machine then uses that key for score, purchase intent, usage and order history;
- initial credits are assigned in the customer's ledger;
- an admin can top up credits, reset usage, suspend or reactivate a customer with PATCH /v1/beta/customers/{customer_id}.

Sandbox limits:
- POST /v1/sandbox/customers is for low-risk evaluation only;
- sandbox keys receive 5 score credits, 1 target discovery credit, 1 deep analysis credit, 1 action pack credit, 1 verification credit, 1 nurture signal credit and 1 domain enrichment credit;
- sandbox keys expire after 7 days by default;
- sandbox creation is limited daily to reduce abuse;
- sandbox keys do not execute real payment and do not contact external targets;
- for larger tests, request a private beta key.

7-day sandbox test metrics:
- admins and agents monitor GET /v1/admin/sandbox-metrics daily;
- tracked targets are 10 sandbox keys, 300 scores, 15 Deep Analysis orders and 3 Action Pack orders;
- the endpoint also verifies safety flags: real_payment_executed=false and external_contact_executed=false;
- use this endpoint to decide whether distribution, onboarding or product packaging needs improvement.

Machine-first rule:
- MachineSignal does not require human email persuasion as the primary channel;
- the public onboarding manifest explains the contract to software and agents;
- authenticated onboarding tells a machine what it can do with its own key;
- humans may supervise, approve or audit, but they are not the primary buyer interface.

Important operating rules:
- send an Idempotency-Key with each scoring request;
- repeated requests with the same Idempotency-Key do not consume a second credit;
- credits are consumed only when the API produces a valid usable output;
- the beta does not execute real payments;
- the beta does not contact external targets.

Contact: beta@machinesignal.it
Website: https://machinesignal.it/
`;

const postmanCollection = {
  info: {
    name: "MachineSignal Lead Opportunity Score API - Callable Beta",
    _postman_id: "machinesignal-lead-opportunity-score-callable-beta",
    description:
      "Callable beta collection for MachineSignal. Includes score, usage ledger, public contract endpoints, beta onboarding packet and machine test flows.",
    schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  item: [
    {
      name: "Read full machine buyer flow demo",
      request: {
        method: "GET",
        header: [],
        url: {
          raw: "https://machinesignal.it/demo/machine-buyer-flow/flow.json",
          protocol: "https",
          host: ["machinesignal", "it"],
          path: ["demo", "machine-buyer-flow", "flow.json"]
        },
        description:
          "Public end-to-end demo: customer machine has no list, buys target discovery, scores domains, buys deep analysis, buys action pack and sends output to CRM consumer."
      },
      response: []
    },
    {
      name: "Read CRM consumer demo output",
      request: {
        method: "GET",
        header: [],
        url: {
          raw: "https://machinesignal.it/demo/crm-consumer/webhook_events.json",
          protocol: "https",
          host: ["machinesignal", "it"],
          path: ["demo", "crm-consumer", "webhook_events.json"]
        },
        description:
          "Public demo output showing how Action Pack becomes CRM-ready webhook events, without external outreach."
      },
      response: []
    },
    {
      name: "Read beta tester onboarding packet",
      request: {
        method: "GET",
        header: [],
        url: {
          raw: "https://machinesignal.it/beta/onboarding-packet.json",
          protocol: "https",
          host: ["machinesignal", "it"],
          path: ["beta", "onboarding-packet.json"]
        },
        description:
          "Public machine-readable beta onboarding packet. Explains the 6-step beta run, success metrics, stop rules and expected feedback."
      },
      response: []
    },
    {
      name: "Read beta feedback schema",
      request: {
        method: "GET",
        header: [],
        url: {
          raw: "https://machinesignal.it/beta/feedback-schema.json",
          protocol: "https",
          host: ["machinesignal", "it"],
          path: ["beta", "feedback-schema.json"]
        },
        description:
          "Public JSON schema for structured beta feedback from a partner machine or evaluator."
      },
      response: []
    },
    {
      name: "Read machine beta test kit",
      request: {
        method: "GET",
        header: [],
        url: {
          raw: "https://machinesignal.it/beta/machine-test-kit.json",
          protocol: "https",
          host: ["machinesignal", "it"],
          path: ["beta", "machine-test-kit.json"]
        },
        description:
          "Public machine test kit with safe test paths, acceptance checks and stop rules."
      },
      response: []
    },
    {
      name: "Create limited sandbox customer",
      request: {
        method: "POST",
        header: [
          { key: "Content-Type", value: "application/json" },
          { key: "Idempotency-Key", value: "postman-sandbox-evaluator-001" }
        ],
        body: {
          mode: "raw",
          raw: JSON.stringify(
            {
              evaluator_type: "ai_agent",
              integration_target: "custom CRM workflow",
              expected_test_path: "full_flow"
            },
            null,
            2
          )
        },
        url: {
          raw: "{{base_url}}/v1/sandbox/customers",
          protocol: "https",
          host: ["machinesignal-api", "beta-878", "workers", "dev"],
          path: ["v1", "sandbox", "customers"]
        },
        description:
          "Public limited sandbox onboarding. Creates a low-credit API key for safe machine evaluation without manual sales contact. Store api_key immediately; it is returned only once."
      },
      response: []
    },
    {
      name: "Score business domain",
      request: {
        method: "POST",
        header: [
          { key: "Content-Type", value: "application/json" },
          { key: "X-API-Key", value: "{{machinesignal_api_key}}" },
          { key: "Idempotency-Key", value: "postman-demo-score-001" }
        ],
        body: {
          mode: "raw",
          raw: JSON.stringify(
            { domain: "clinic3.it", sector_hint: "dentist", country_hint: "IT" },
            null,
            2
          )
        },
        url: {
          raw: "{{base_url}}/v1/lead-opportunity-score",
          protocol: "https",
          host: ["machinesignal-api", "beta-878", "workers", "dev"],
          path: ["v1", "lead-opportunity-score"]
        },
        description:
          "Returns a deterministic beta score, routing decision, next purchase recommendation and credit usage event. Requires X-API-Key and Idempotency-Key."
      },
      response: []
    },
    {
      name: "Read usage ledger",
      request: {
        method: "GET",
        header: [{ key: "X-API-Key", value: "{{machinesignal_api_key}}" }],
        url: {
          raw: "{{base_url}}/v1/usage",
          protocol: "https",
          host: ["machinesignal-api", "beta-878", "workers", "dev"],
          path: ["v1", "usage"]
        },
        description:
          "Returns package balances and recent usage events. Use this to verify consumed and remaining credits."
      },
      response: []
    },
    {
      name: "Fetch product catalog",
      request: {
        method: "GET",
        header: [],
        url: {
          raw: "{{base_url}}/product-catalog.json",
          protocol: "https",
          host: ["machinesignal-api", "beta-878", "workers", "dev"],
          path: ["product-catalog.json"]
        },
        description:
          "Public machine-readable catalog with exact beta prices, product codes, deliverables and valid-output credit rules."
      },
      response: []
    },
    {
      name: "Create beta purchase intent",
      request: {
        method: "POST",
        header: [
          { key: "Content-Type", value: "application/json" },
          { key: "X-API-Key", value: "{{machinesignal_api_key}}" },
          { key: "Idempotency-Key", value: "postman-demo-order-001" }
        ],
        body: {
          mode: "raw",
          raw: JSON.stringify(
            {
      product_code: "domain_enrichment",
      domain: "clinic3.it",
      target_name: "Studio Dentistico Demo",
      batch_id: "dentists-lombardy-demo",
      source_score_request_id: "postman-demo-score-001",
      reason: "Customer machine has target names but needs reliable domains before scoring"
            },
            null,
            2
          )
        },
        url: {
          raw: "{{base_url}}/v1/purchase-intent",
          protocol: "https",
          host: ["machinesignal-api", "beta-878", "workers", "dev"],
          path: ["v1", "purchase-intent"]
        },
        description:
          "Creates a beta order intent for a recommended next product and returns an immediate structured beta delivery. No real payment is executed."
      },
      response: []
    },
    {
      name: "Order target discovery when machine has no list",
      request: {
        method: "POST",
        header: [
          { key: "Content-Type", value: "application/json" },
          { key: "X-API-Key", value: "{{machinesignal_api_key}}" },
          { key: "Idempotency-Key", value: "postman-demo-target-discovery-001" }
        ],
        body: {
          mode: "raw",
          raw: JSON.stringify(
            {
              product_code: "target_discovery",
              market: "medicina estetica",
              area: "Lombardia",
              commercial_objective:
                "find domains worth scoring for website improvement opportunities",
              reason: "Customer machine has no starting list"
            },
            null,
            2
          )
        },
        url: {
          raw: "{{base_url}}/v1/purchase-intent",
          protocol: "https",
          host: ["machinesignal-api", "beta-878", "workers", "dev"],
          path: ["v1", "purchase-intent"]
        },
        description:
          "Use this when the customer machine has no list. The delivery returns an output_contract: 250 coherent target records or a no-go market coverage decision."
      },
      response: []
    },
    {
      name: "Order deep analysis after a strong score",
      request: {
        method: "POST",
        header: [
          { key: "Content-Type", value: "application/json" },
          { key: "X-API-Key", value: "{{machinesignal_api_key}}" },
          { key: "Idempotency-Key", value: "postman-demo-deep-analysis-001" }
        ],
        body: {
          mode: "raw",
          raw: JSON.stringify(
            {
              product_code: "deep_analysis",
              domain: "quinta-essenza.com",
              source_score_request_id: "postman-demo-score-strong-001",
              reason: "Score decision was buy_deep_analysis"
            },
            null,
            2
          )
        },
        url: {
          raw: "{{base_url}}/v1/purchase-intent",
          protocol: "https",
          host: ["machinesignal-api", "beta-878", "workers", "dev"],
          path: ["v1", "purchase-intent"]
        },
        description:
          "Use this after a strong score. The delivery states the exact unit sold, stop rules and the next optional machine purchase: action_pack."
      },
      response: []
    },
    {
      name: "Order action pack after confirmed opportunity",
      request: {
        method: "POST",
        header: [
          { key: "Content-Type", value: "application/json" },
          { key: "X-API-Key", value: "{{machinesignal_api_key}}" },
          { key: "Idempotency-Key", value: "postman-demo-action-pack-001" }
        ],
        body: {
          mode: "raw",
          raw: JSON.stringify(
            {
              product_code: "action_pack",
              domain: "quinta-essenza.com",
              source_score_request_id: "postman-demo-score-strong-001",
              reason:
                "Deep Analysis confirmed a low-risk opportunity and the CRM needs a machine-readable next action"
            },
            null,
            2
          )
        },
        url: {
          raw: "{{base_url}}/v1/purchase-intent",
          protocol: "https",
          host: ["machinesignal-api", "beta-878", "workers", "dev"],
          path: ["v1", "purchase-intent"]
        },
        description:
          "Use this when the machine has a confirmed opportunity and wants a CRM/agent-readable action payload. The delivery returns what_is_included, crm_record_patch, crm_task, crm_platform_mappings, workflow_payload, agent_instructions, webhook_event, webhook_delivery_policy, audit_event, approval_gate, deduplication_key, next_api_calls, message_angle, stop_rules, follow_up_sequence and compliance_guardrail."
      },
      response: []
    },
    {
      name: "List beta orders",
      request: {
        method: "GET",
        header: [{ key: "X-API-Key", value: "{{machinesignal_api_key}}" }],
        url: {
          raw: "{{base_url}}/v1/orders",
          protocol: "https",
          host: ["machinesignal-api", "beta-878", "workers", "dev"],
          path: ["v1", "orders"]
        },
        description:
          "Lists beta order intents and deliveries created by the authenticated customer machine."
      },
      response: []
    },
    {
      name: "List verification orders",
      request: {
        method: "GET",
        header: [{ key: "X-API-Key", value: "{{machinesignal_api_key}}" }],
        url: {
          raw: "{{base_url}}/v1/orders?product_code=verification",
          protocol: "https",
          host: ["machinesignal-api", "beta-878", "workers", "dev"],
          path: ["v1", "orders"],
          query: [{ key: "product_code", value: "verification" }]
        },
        description:
          "Filters order history to verification beta orders only."
      },
      response: []
    },
    {
      name: "Admin read sandbox metrics",
      request: {
        method: "GET",
        header: [{ key: "X-API-Key", value: "{{machinesignal_admin_api_key}}" }],
        url: {
          raw: "{{base_url}}/v1/admin/sandbox-metrics",
          protocol: "https",
          host: ["machinesignal-api", "beta-878", "workers", "dev"],
          path: ["v1", "admin", "sandbox-metrics"]
        },
        description:
          "Admin-only endpoint for the 7-day sandbox test. Aggregates sandbox keys, score usage, Deep Analysis orders, Action Pack orders, conversion rates and safety flags."
      },
      response: []
    },
    {
      name: "Create beta customer",
      request: {
        method: "POST",
        header: [
          { key: "Content-Type", value: "application/json" },
          { key: "X-API-Key", value: "{{machinesignal_admin_api_key}}" },
          { key: "Idempotency-Key", value: "postman-demo-beta-customer-001" }
        ],
        body: {
          mode: "raw",
          raw: JSON.stringify(
            {
              customer_id: "beta_partner_001",
              contact_email: "partner@example.com",
              plan: "beta_starter",
              score_credits: 100,
              verification_credits: 25,
              nurture_signal_credits: 25,
              deep_analysis_credits: 10,
              action_pack_credits: 5,
              target_discovery_credits: 1,
              opportunity_feed_credits: 1
            },
            null,
            2
          )
        },
        url: {
          raw: "{{base_url}}/v1/beta/customers",
          protocol: "https",
          host: ["machinesignal-api", "beta-878", "workers", "dev"],
          path: ["v1", "beta", "customers"]
        },
        description:
          "Admin-only beta onboarding endpoint. Creates a machine customer and returns a dedicated API key once."
      },
      response: []
    },
    {
      name: "Admin read beta customer",
      request: {
        method: "GET",
        header: [{ key: "X-API-Key", value: "{{machinesignal_admin_api_key}}" }],
        url: {
          raw: "{{base_url}}/v1/beta/customers/{{beta_customer_id}}",
          protocol: "https",
          host: ["machinesignal-api", "beta-878", "workers", "dev"],
          path: ["v1", "beta", "customers", "{{beta_customer_id}}"]
        },
        description:
          "Admin-only endpoint. Reads beta customer status, key prefix, balances and recent ledger activity."
      },
      response: []
    },
    {
      name: "Admin top up beta customer credits",
      request: {
        method: "PATCH",
        header: [
          { key: "Content-Type", value: "application/json" },
          { key: "X-API-Key", value: "{{machinesignal_admin_api_key}}" }
        ],
        body: {
          mode: "raw",
          raw: JSON.stringify(
            {
              add_credits: {
                score_pack_1k: 20,
                verification_pack_100: 10,
                deep_analysis_pack_100: 5,
                target_discovery_pack_250: 1
              },
              reason: "top up beta test credits"
            },
            null,
            2
          )
        },
        url: {
          raw: "{{base_url}}/v1/beta/customers/{{beta_customer_id}}",
          protocol: "https",
          host: ["machinesignal-api", "beta-878", "workers", "dev"],
          path: ["v1", "beta", "customers", "{{beta_customer_id}}"]
        },
        description:
          "Admin-only endpoint. Adds credits, resets usage if requested, or changes status without returning the full customer API key."
      },
      response: []
    },
    {
      name: "Fetch machine onboarding manifest",
      request: {
        method: "GET",
        header: [],
        url: {
          raw: "{{base_url}}/machine-onboarding.json",
          protocol: "https",
          host: ["machinesignal-api", "beta-878", "workers", "dev"],
          path: ["machine-onboarding.json"]
        },
        description:
          "Public machine-readable onboarding manifest for agents, CRMs and workflows."
      },
      response: []
    },
    {
      name: "Read authenticated onboarding",
      request: {
        method: "GET",
        header: [{ key: "X-API-Key", value: "{{machinesignal_api_key}}" }],
        url: {
          raw: "{{base_url}}/v1/onboarding",
          protocol: "https",
          host: ["machinesignal-api", "beta-878", "workers", "dev"],
          path: ["v1", "onboarding"]
        },
        description:
          "Returns customer-specific onboarding state, balances and next machine calls."
      },
      response: []
    },
    {
      name: "Repeat same score without double charge",
      request: {
        method: "POST",
        header: [
          { key: "Content-Type", value: "application/json" },
          { key: "X-API-Key", value: "{{machinesignal_api_key}}" },
          { key: "Idempotency-Key", value: "postman-demo-score-001" }
        ],
        body: {
          mode: "raw",
          raw: JSON.stringify(
            { domain: "clinic3.it", sector_hint: "dentist", country_hint: "IT" },
            null,
            2
          )
        },
        url: {
          raw: "{{base_url}}/v1/lead-opportunity-score",
          protocol: "https",
          host: ["machinesignal-api", "beta-878", "workers", "dev"],
          path: ["v1", "lead-opportunity-score"]
        },
        description:
          "Repeat the first request with the same Idempotency-Key. The ledger returns duplicate_request=true and does not consume an extra credit."
      },
      response: []
    },
    {
      name: "Fetch OpenAPI schema",
      request: {
        method: "GET",
        header: [],
        url: {
          raw: "{{base_url}}/openapi.json",
          protocol: "https",
          host: ["machinesignal-api", "beta-878", "workers", "dev"],
          path: ["openapi.json"]
        }
      },
      response: []
    }
  ],
  variable: [
    { key: "base_url", value: "https://machinesignal-api.beta-878.workers.dev" },
    { key: "machinesignal_api_key", value: "paste_customer_beta_key_here" },
    { key: "machinesignal_admin_api_key", value: "paste_admin_beta_key_here" },
    { key: "beta_customer_id", value: "beta_partner_001" }
  ]
};

export function normalizeDomain(domain) {
  const value = String(domain || "").trim().toLowerCase();
  if (!value) {
    throw new Error("domain is required");
  }
  if (value.includes("://")) {
    const parsed = new URL(value);
    return parsed.hostname.replace(/^www\./, "");
  }
  return value.replace(/^www\./, "").replace(/\/.*$/, "");
}

function stableHash(value) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function apiKeyHash(apiKey) {
  return stableHash(String(apiKey || "")).toString(16);
}

function randomToken(length = 36) {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let token = "";
  for (const byte of bytes) {
    token += alphabet[byte % alphabet.length];
  }
  return token.slice(0, length);
}

function customerKeyForHash(hash) {
  return `customer_key:${hash}`;
}

function customerRecordKey(customerId) {
  return `customer:${customerId}`;
}

async function loadCustomerByApiKey(apiKey, env = {}) {
  const hash = apiKeyHash(apiKey);
  const kv = env[LEDGER_KV_BINDING];
  if (kv?.get) {
    return await kv.get(customerKeyForHash(hash), "json");
  }
  globalThis.__machinesignalCustomers ||= {};
  return globalThis.__machinesignalCustomers[customerKeyForHash(hash)] || null;
}

async function saveCustomerRecord(record, apiKey, env = {}) {
  const hash = apiKeyHash(apiKey);
  const keyRecord = {
    ...record,
    api_key_hash: hash,
    api_key_prefix: String(apiKey).slice(0, 14)
  };
  const kv = env[LEDGER_KV_BINDING];
  if (kv?.put) {
    await kv.put(customerKeyForHash(hash), JSON.stringify(keyRecord));
    await kv.put(customerRecordKey(record.customer_id), JSON.stringify(keyRecord));
    return true;
  }
  globalThis.__machinesignalCustomers ||= {};
  globalThis.__machinesignalCustomers[customerKeyForHash(hash)] = clone(keyRecord);
  globalThis.__machinesignalCustomers[customerRecordKey(record.customer_id)] = clone(keyRecord);
  return false;
}

async function loadCustomerById(customerId, env = {}) {
  const normalizedCustomerId = normalizeCustomerId(customerId);
  const kv = env[LEDGER_KV_BINDING];
  if (kv?.get) {
    return await kv.get(customerRecordKey(normalizedCustomerId), "json");
  }
  globalThis.__machinesignalCustomers ||= {};
  return globalThis.__machinesignalCustomers[customerRecordKey(normalizedCustomerId)] || null;
}

async function saveCustomerRecordById(record, env = {}) {
  const normalizedRecord = {
    ...record,
    customer_id: normalizeCustomerId(record.customer_id),
    updated_at: new Date().toISOString()
  };
  const kv = env[LEDGER_KV_BINDING];
  if (kv?.put) {
    await kv.put(customerRecordKey(normalizedRecord.customer_id), JSON.stringify(normalizedRecord));
    if (normalizedRecord.api_key_hash) {
      await kv.put(customerKeyForHash(normalizedRecord.api_key_hash), JSON.stringify(normalizedRecord));
    }
    return true;
  }
  globalThis.__machinesignalCustomers ||= {};
  globalThis.__machinesignalCustomers[customerRecordKey(normalizedRecord.customer_id)] =
    clone(normalizedRecord);
  if (normalizedRecord.api_key_hash) {
    globalThis.__machinesignalCustomers[customerKeyForHash(normalizedRecord.api_key_hash)] =
      clone(normalizedRecord);
  }
  return false;
}

async function authenticateRequest(request, env = {}) {
  const configured = String(env.MACHINESIGNAL_API_KEY || env.API_KEY || "").trim();
  const apiKey = request.headers.get("x-api-key") || "";
  if (configured && apiKey === configured) {
    return {
      authorized: true,
      auth_type: "admin",
      customer_id: String(env.MACHINESIGNAL_CUSTOMER_ID || "").trim() || null
    };
  }
  if (apiKey) {
    const customer = await loadCustomerByApiKey(apiKey, env);
    if (customer?.status === "active" && !isExpiredIso(customer.expires_at)) {
      return {
        authorized: true,
        auth_type: "customer",
        customer_id: customer.customer_id,
        customer
      };
    }
  }
  if (!configured) {
    return { authorized: true, auth_type: "open", customer_id: null };
  }
  return { authorized: false, auth_type: "unauthorized", customer_id: null };
}

function isExpiredIso(value) {
  if (!value) return false;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) && timestamp <= Date.now();
}

function isAdminAuthorized(request, env = {}) {
  const configured = String(env.MACHINESIGNAL_API_KEY || env.API_KEY || "").trim();
  return Boolean(configured && request.headers.get("x-api-key") === configured);
}

function ledgerKeyFor(request, env = {}, authContext = {}) {
  if (authContext?.customer_id) return `ledger:customer:${authContext.customer_id}`;
  const configuredCustomer = String(env.MACHINESIGNAL_CUSTOMER_ID || "").trim();
  if (configuredCustomer) return `ledger:${configuredCustomer}`;
  const apiKey = request.headers.get("x-api-key") || "public-demo";
  return `ledger:demo:${stableHash(apiKey).toString(16)}`;
}

function normalizeLedgerState(raw) {
  const state = { ...clone(DEFAULT_LEDGER_STATE), ...(raw || {}) };
  state.balances = { ...clone(DEFAULT_LEDGER_STATE.balances), ...(state.balances || {}) };
  state.events = Array.isArray(state.events) ? state.events : [];
  state.orders = Array.isArray(state.orders) ? state.orders : [];
  for (const balance of Object.values(state.balances)) {
    balance.credits_purchased = Number(balance.credits_purchased || 0);
    balance.credits_used = Number(balance.credits_used || 0);
    balance.credits_remaining = Math.max(0, balance.credits_purchased - balance.credits_used);
  }
  return state;
}

async function loadLedger(request, env = {}, authContext = {}) {
  const key = ledgerKeyFor(request, env, authContext);
  const kv = env[LEDGER_KV_BINDING];
  if (kv?.get) {
    const saved = await kv.get(key, "json");
    return { key, state: normalizeLedgerState(saved), persisted: true };
  }
  globalThis.__machinesignalLedgers ||= {};
  globalThis.__machinesignalLedgers[key] ||= clone(DEFAULT_LEDGER_STATE);
  return { key, state: normalizeLedgerState(globalThis.__machinesignalLedgers[key]), persisted: false };
}

async function saveLedger(key, state, env = {}) {
  const kv = env[LEDGER_KV_BINDING];
  if (kv?.put) {
    await kv.put(key, JSON.stringify(state));
    return true;
  }
  globalThis.__machinesignalLedgers ||= {};
  globalThis.__machinesignalLedgers[key] = clone(state);
  return false;
}

async function loadJsonStore(key, env = {}) {
  const kv = env[LEDGER_KV_BINDING];
  if (kv?.get) {
    return await kv.get(key, "json");
  }
  globalThis.__machinesignalJsonStore ||= {};
  return globalThis.__machinesignalJsonStore[key] || null;
}

async function saveJsonStore(key, value, env = {}, options = {}) {
  const kv = env[LEDGER_KV_BINDING];
  if (kv?.put) {
    await kv.put(key, JSON.stringify(value), options);
    return true;
  }
  globalThis.__machinesignalJsonStore ||= {};
  globalThis.__machinesignalJsonStore[key] = clone(value);
  return false;
}

async function loadLedgerByCustomerId(customerId, env = {}) {
  const normalizedCustomerId = normalizeCustomerId(customerId);
  const key = `ledger:customer:${normalizedCustomerId}`;
  const kv = env[LEDGER_KV_BINDING];
  if (kv?.get) {
    const saved = await kv.get(key, "json");
    return { key, state: normalizeLedgerState(saved || { customer_id: normalizedCustomerId }), persisted: true };
  }
  globalThis.__machinesignalLedgers ||= {};
  globalThis.__machinesignalLedgers[key] ||= {
    ...clone(DEFAULT_LEDGER_STATE),
    customer_id: normalizedCustomerId
  };
  return { key, state: normalizeLedgerState(globalThis.__machinesignalLedgers[key]), persisted: false };
}

function ledgerBalances(state) {
  return Object.values(state.balances).map((balance) => ({
    product_code: balance.product_code,
    credits_purchased: balance.credits_purchased,
    credits_used: balance.credits_used,
    credits_remaining: Math.max(0, balance.credits_purchased - balance.credits_used)
  }));
}

function buildUsagePayload(state, event = null, persisted = false) {
  return {
    customer_id: state.customer_id,
    ledger_persisted: persisted,
    balances: ledgerBalances(state),
    current_event: event,
    last_events: state.events.slice(-10),
    recent_orders: state.orders.slice(-10),
    rule: "credits are consumed only when the API produces a valid usable output",
    real_payment_executed: false,
    external_contact_executed: false
  };
}

function makeRequestId(request, body, domain) {
  const explicit = String(
    request.headers.get("x-request-id") ||
      request.headers.get("idempotency-key") ||
      body?.request_id ||
      ""
  ).trim();
  if (explicit) return explicit.slice(0, 120);
  return `req_${stableHash(`${domain}|${Date.now()}|${Math.random()}`).toString(16)}`;
}

function consumeCredit(state, productCode, requestId, status, reason, metadata = {}) {
  const balance = state.balances[productCode];
  if (!balance) {
    throw new Error(`unknown product_code ${productCode}`);
  }
  const duplicate = state.events.find(
    (event) => event.product_code === productCode && event.request_id === requestId
  );
  if (duplicate) {
    return {
      ...duplicate,
      duplicate_request: true,
      credits_remaining: Math.max(0, balance.credits_purchased - balance.credits_used)
    };
  }

  let creditsConsumed = 0;
  let finalStatus = status;
  let finalReason = reason;
  if (status === "valid_output") {
    const remaining = balance.credits_purchased - balance.credits_used;
    if (remaining < 1) {
      finalStatus = "blocked_insufficient_credits";
      finalReason = "credit_balance_insufficient";
    } else {
      balance.credits_used += 1;
      creditsConsumed = 1;
    }
  }
  balance.credits_remaining = Math.max(0, balance.credits_purchased - balance.credits_used);
  const event = {
    event_id: `evt_${String(state.events.length + 1).padStart(4, "0")}`,
    timestamp: new Date().toISOString(),
    customer_id: state.customer_id,
    product_code: productCode,
    request_id: requestId,
    status: finalStatus,
    reason: finalReason,
    units_requested: 1,
    credits_consumed: creditsConsumed,
    credits_remaining: balance.credits_remaining,
    metadata
  };
  state.events.push(event);
  return event;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function sectorBoost(sectorHint) {
  const sector = String(sectorHint || "").toLowerCase();
  if (/(dent|clinic|health|medical|odont)/.test(sector)) return 12;
  if (/(medicina|estetic|aesthetic|beauty|laser|derma|antiage|anti-age)/.test(sector)) return 12;
  if (/(legal|law|studio legale|avvoc)/.test(sector)) return 10;
  if (/(real estate|immobil)/.test(sector)) return 9;
  if (/(home|ristruttur|construction|edil)/.test(sector)) return 8;
  if (/(b2b|consult|agency|marketing)/.test(sector)) return 7;
  return 3;
}

function isAestheticMedicineSector(sectorHint) {
  return /(medicina|estetic|aesthetic|beauty|laser|derma|antiage|anti-age)/.test(
    String(sectorHint || "").toLowerCase()
  );
}

function isRealEstateSector(sectorHint) {
  return /(real estate|immobil|property|agenzia casa)/.test(String(sectorHint || "").toLowerCase());
}

function aestheticMedicineQualityReview(input, domain, sectorHint) {
  if (!isAestheticMedicineSector(sectorHint)) {
    return {
      status: "not_applicable",
      score_delta: 0,
      confidence_cap: null,
      reason: "No sector-specific quality gate was applied."
    };
  }

  const text = [
    domain,
    input?.target_name,
    input?.company_name,
    input?.category_hint,
    input?.category,
    input?.initial_signals
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (
    /(osteopat|fisioterap|riabilit|vista|vision|ocul|ottic|nail|profumer|parrucchier|hair|farmacia|casa di comunit|ospedal)/.test(
      text
    )
  ) {
    return {
      status: "sector_mismatch_needs_verification",
      score_delta: -18,
      confidence_cap: 0.49,
      reason:
        "Aesthetic medicine request contains signals from adjacent or generic sectors; verify the business category before buying Deep Analysis."
    };
  }

  return {
    status: "sector_quality_passed",
    score_delta: 0,
    confidence_cap: null,
    reason: "Aesthetic medicine quality gate did not find strong mismatch signals."
  };
}

function realEstateQualityReview(input, domain, sectorHint) {
  if (!isRealEstateSector(sectorHint)) {
    return {
      status: "not_applicable",
      score_delta: 0,
      confidence_cap: null,
      reason: "No sector-specific quality gate was applied."
    };
  }

  const text = [
    domain,
    input?.target_name,
    input?.company_name,
    input?.category_hint,
    input?.category,
    input?.initial_signals
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (/(immobiliare\.it|idealista\.it|casa\.it|wikicasa\.it|trovacasa\.it|tecnocasa\.it|tempocasa\.it|gabetti\.it|remax\.it|engelvoelkers\.com|soloaffitti\.it|casavo\.com)/.test(domain)) {
    return {
      status: "real_estate_portal_or_franchise_needs_verification",
      score_delta: -20,
      confidence_cap: 0.49,
      reason:
        "Real-estate request points to a portal or large franchise root; verify whether the domain represents a local agency before buying Deep Analysis."
    };
  }

  if (!/(immobil|casa|abitare|real estate|property|agenzia|intermediazione)/.test(text)) {
    return {
      status: "real_estate_sector_unclear_needs_verification",
      score_delta: -12,
      confidence_cap: 0.49,
      reason:
        "Real-estate request lacks clear sector evidence; verify category before spending more budget."
    };
  }

  return {
    status: "sector_quality_passed",
    score_delta: 0,
    confidence_cap: null,
    reason: "Real-estate quality gate did not find portal, franchise-root or sector-mismatch signals."
  };
}

function sectorQualityReview(input, domain, sectorHint) {
  const aestheticReview = aestheticMedicineQualityReview(input, domain, sectorHint);
  if (aestheticReview.status !== "not_applicable") return aestheticReview;
  const realEstateReview = realEstateQualityReview(input, domain, sectorHint);
  if (realEstateReview.status !== "not_applicable") return realEstateReview;
  return {
    status: "not_applicable",
    score_delta: 0,
    confidence_cap: null,
    reason: "No sector-specific quality gate was applied."
  };
}

function priorityFor(score) {
  if (score >= 75) return "high";
  if (score >= 45) return "medium";
  return "low";
}

function decisionFor(score, confidence) {
  if (confidence < 0.5) return "needs_verification";
  if (score >= 75 && confidence >= 0.65) return "buy_deep_analysis";
  if (score >= 65) return "nurture";
  if (score >= 45) return "watchlist";
  return "discard";
}

function purchaseRecommendation(decision) {
  const recommendations = {
    discard: {
      next_product: null,
      price_range_eur: "0",
      machine_instruction: "Do not spend more budget on this domain now."
    },
    watchlist: {
      next_product: null,
      price_range_eur: "0",
      machine_instruction: "Save the domain and rescore later."
    },
    nurture: {
      next_product: "nurture_signal",
      price_range_eur: "0-1",
      machine_instruction: "Use low-cost enrichment only if the workflow has nurturing budget."
    },
    buy_deep_analysis: {
      next_product: "deep_analysis",
      price_range_eur: "1-3",
      machine_instruction: "Buy Deep Analysis before spending human or campaign budget."
    },
    needs_verification: {
      next_product: "verification",
      price_range_eur: "0-1",
      machine_instruction: "Verify data quality before any commercial action."
    }
  };
  return recommendations[decision];
}

function purchaseProductConfig(productCode) {
  const normalized = String(productCode || "").trim().toLowerCase();
  const products = {
    target_discovery: {
      product_code: "target_discovery",
      ledger_product_code: "target_discovery_pack_250",
      beta_price_range_eur: "149",
      delivery_mode: "target_discovery_precheck",
      description:
        "Starts a target discovery pack after checking whether the requested market can produce 250 coherent targets."
    },
    domain_enrichment: {
      product_code: "domain_enrichment",
      ledger_product_code: "domain_enrichment_pack_100",
      beta_price_range_eur: "149",
      delivery_mode: "domain_enrichment_decision_pack",
      description:
        "Processes target records without reliable domains and returns a verified-domain, candidate-not-reliable or no-reliable-domain decision for each record."
    },
    verification: {
      product_code: "verification",
      ledger_product_code: "verification_pack_100",
      beta_price_range_eur: "0-1",
      delivery_mode: "data_quality_verification",
      description: "Checks whether the lead data is usable before spending more budget."
    },
    nurture_signal: {
      product_code: "nurture_signal",
      ledger_product_code: "nurture_signal_pack_100",
      beta_price_range_eur: "0-1",
      delivery_mode: "light_enrichment_signal",
      description: "Adds a light signal for leads that should enter nurturing."
    },
    deep_analysis: {
      product_code: "deep_analysis",
      ledger_product_code: "deep_analysis_pack_100",
      beta_price_range_eur: "1-3",
      delivery_mode: "deeper_opportunity_analysis",
      description: "Creates a deeper analysis before human or campaign budget is spent."
    },
    action_pack: {
      product_code: "action_pack",
      ledger_product_code: "action_pack_25",
      beta_price_range_eur: "3-10",
      delivery_mode: "crm_action_preparation",
      description: "Prepares operational CRM actions, tags, message angle or follow-up steps."
    },
    opportunity_feed: {
      product_code: "opportunity_feed",
      ledger_product_code: "opportunity_feed_monthly",
      beta_price_range_eur: "249",
      delivery_mode: "recurring_opportunity_feed",
      description:
        "Starts a recurring monthly opportunity feed with four scheduled scans and deliveries."
    }
  };
  const product = products[normalized];
  if (!product) {
    throw new Error(
      "unsupported product_code. Use target_discovery, domain_enrichment, verification, nurture_signal, deep_analysis, action_pack or opportunity_feed"
    );
  }
  return product;
}

function normalizePurchaseSubject(input = {}, product = {}) {
  if (input?.domain) {
    return normalizeDomain(input.domain);
  }
  if (product.product_code === "domain_enrichment" || product.product_code === "target_discovery") {
    const subject =
      String(input?.batch_id || input?.target_name || input?.market || input?.sector_hint || "")
        .trim()
        .toLowerCase() || `${product.product_code}-request`;
    return subject
      .replace(/[^a-z0-9._-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 120);
  }
  return normalizeDomain(input?.domain);
}

export function buildPurchaseIntent(input, requestId, event) {
  const product = purchaseProductConfig(input?.product_code);
  const domain = normalizePurchaseSubject(input, product);
  const status =
    event.status === "blocked_insufficient_credits"
      ? "blocked_insufficient_credits"
      : "accepted_beta_order_intent";
  return {
    order_intent_id: `ord_${stableHash(`${requestId}|${product.product_code}|${domain}`).toString(16)}`,
    status,
    product_code: product.product_code,
    ledger_product_code: product.ledger_product_code,
    domain,
    source_score_request_id: String(input?.source_score_request_id || "").trim() || null,
    reason: String(input?.reason || "").trim() || null,
    max_budget_eur:
      input?.max_budget_eur === undefined || input?.max_budget_eur === null
        ? null
        : Number(input.max_budget_eur),
    beta_price_range_eur: product.beta_price_range_eur,
    delivery_mode: product.delivery_mode,
    description: product.description,
    request_id: requestId,
    real_payment_executed: false,
    external_contact_executed: false,
    delivery: buildBetaDelivery(product.product_code, domain, input, event),
    beta: true
  };
}

function orderRecordFromIntent(intent, event) {
  return {
    order_intent_id: intent.order_intent_id,
    status: intent.status,
    product_code: intent.product_code,
    ledger_product_code: intent.ledger_product_code,
    domain: intent.domain,
    source_score_request_id: intent.source_score_request_id,
    reason: intent.reason,
    max_budget_eur: intent.max_budget_eur,
    beta_price_range_eur: intent.beta_price_range_eur,
    delivery_mode: intent.delivery_mode,
    request_id: intent.request_id,
    event_id: event?.event_id || null,
    created_at: event?.timestamp || new Date().toISOString(),
    real_payment_executed: false,
    external_contact_executed: false,
    delivery: intent.delivery,
    beta: true
  };
}

function saveOrderRecord(state, intent, event) {
  const existing = state.orders.find(
    (order) =>
      order.order_intent_id === intent.order_intent_id || order.request_id === intent.request_id
  );
  if (existing) {
    return { ...existing, duplicate_request: true };
  }
  const order = orderRecordFromIntent(intent, event);
  state.orders.push(order);
  return order;
}

function filterOrders(orders, url) {
  const productCode = String(url.searchParams.get("product_code") || "").trim().toLowerCase();
  const domain = String(url.searchParams.get("domain") || "").trim().toLowerCase();
  const status = String(url.searchParams.get("status") || "").trim().toLowerCase();
  return orders
    .filter((order) => !productCode || String(order.product_code).toLowerCase() === productCode)
    .filter((order) => !domain || String(order.domain).toLowerCase() === domain)
    .filter((order) => !status || String(order.status).toLowerCase() === status)
    .slice()
    .reverse();
}

function buildInitialBalances(input = {}) {
  const numberOrDefault = (value, fallback) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : fallback;
  };
  return {
    score_pack_1k: {
      product_code: "score_pack_1k",
      credits_purchased: numberOrDefault(input.score_credits, 100),
      credits_used: 0
    },
    deep_analysis_pack_100: {
      product_code: "deep_analysis_pack_100",
      credits_purchased: numberOrDefault(input.deep_analysis_credits, 10),
      credits_used: 0
    },
    verification_pack_100: {
      product_code: "verification_pack_100",
      credits_purchased: numberOrDefault(input.verification_credits, 25),
      credits_used: 0
    },
    nurture_signal_pack_100: {
      product_code: "nurture_signal_pack_100",
      credits_purchased: numberOrDefault(input.nurture_signal_credits, 25),
      credits_used: 0
    },
    action_pack_25: {
      product_code: "action_pack_25",
      credits_purchased: numberOrDefault(input.action_pack_credits, 5),
      credits_used: 0
    },
    target_discovery_pack_250: {
      product_code: "target_discovery_pack_250",
      credits_purchased: numberOrDefault(input.target_discovery_credits, 1),
      credits_used: 0
    },
    domain_enrichment_pack_100: {
      product_code: "domain_enrichment_pack_100",
      credits_purchased: numberOrDefault(input.domain_enrichment_credits, 1),
      credits_used: 0
    },
    opportunity_feed_monthly: {
      product_code: "opportunity_feed_monthly",
      credits_purchased: numberOrDefault(input.opportunity_feed_credits, 1),
      credits_used: 0
    }
  };
}

function normalizeCustomerId(customerId) {
  const value = String(customerId || "").trim().toLowerCase();
  if (!/^[a-z0-9][a-z0-9_-]{2,80}$/.test(value)) {
    throw new Error("customer_id must be 3-80 chars: lowercase letters, numbers, underscore or dash");
  }
  return value;
}

async function createBetaCustomer(input, request, env = {}) {
  const customerId = normalizeCustomerId(input?.customer_id);
  const apiKey = `ms_cust_${randomToken(36)}`;
  const now = new Date().toISOString();
  const plan = String(input?.plan || "beta_starter").trim() || "beta_starter";
  const customerType = String(input?.customer_type || "beta_customer").trim() || "beta_customer";
  const expiresAt = String(input?.expires_at || "").trim() || null;
  const customerRecord = {
    customer_id: customerId,
    contact_email: String(input?.contact_email || "").trim() || null,
    plan,
    customer_type: customerType,
    status: "active",
    created_at: now,
    created_by: String(input?.created_by || "admin_api").trim() || "admin_api",
    expires_at: expiresAt,
    real_payment_executed: false,
    external_contact_executed: false
  };
  await saveCustomerRecord(customerRecord, apiKey, env);
  const ledgerState = normalizeLedgerState({
    customer_id: customerId,
    balances: buildInitialBalances(input),
    events: [],
    orders: [],
    real_payment_executed: false,
    external_contact_executed: false
  });
  await saveLedger(`ledger:customer:${customerId}`, ledgerState, env);
  return {
    customer_id: customerId,
    contact_email: customerRecord.contact_email,
    plan,
    customer_type: customerType,
    status: "active",
    expires_at: expiresAt,
    api_key: apiKey,
    api_key_returned_once: true,
    onboarding: {
      base_url: "https://machinesignal-api.beta-878.workers.dev",
      auth_header: "X-API-Key",
      required_idempotency_header: "Idempotency-Key",
      next_steps: [
        "GET /v1/usage",
        "POST /v1/lead-opportunity-score",
        "POST /v1/purchase-intent when next_purchase recommends a product",
        "GET /v1/orders"
      ],
      limits: {
        beta_payment_enabled: false,
        external_contact_enabled: false
      }
    },
    usage: buildUsagePayload(ledgerState, null, true)
  };
}

function sandboxCustomerId(request, input = {}) {
  const explicit = String(input?.customer_id || "").trim().toLowerCase();
  if (explicit) {
    const normalized = normalizeCustomerId(explicit);
    if (!normalized.startsWith("sandbox_")) {
      throw new Error("sandbox customer_id must start with sandbox_");
    }
    return normalized;
  }
  const seed = [
    request.headers.get("idempotency-key") || "",
    request.headers.get("user-agent") || "",
    Date.now().toString(),
    randomToken(10)
  ].join("|");
  return `sandbox_${stableHash(seed).toString(16)}_${Date.now().toString(36)}`;
}

function positiveIntegerFromEnv(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

function utcDateKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function sandboxFingerprint(request) {
  const forwardedFor = String(
    request.headers.get("cf-connecting-ip") ||
      request.headers.get("x-forwarded-for") ||
      ""
  )
    .split(",")[0]
    .trim();
  const userAgent = String(request.headers.get("user-agent") || "unknown").trim();
  return stableHash(`${forwardedFor}|${userAgent}`).toString(16);
}

async function consumeSandboxCreationAllowance(request, env = {}) {
  const namespace = String(env.MACHINESIGNAL_SANDBOX_LIMIT_NAMESPACE || "default")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "_")
    .slice(0, 40) || "default";
  const today = utcDateKey();
  const key = `sandbox_daily_limit:${namespace}:${today}`;
  const globalLimit = positiveIntegerFromEnv(env.MACHINESIGNAL_SANDBOX_DAILY_LIMIT, 25);
  const fingerprintLimit = positiveIntegerFromEnv(
    env.MACHINESIGNAL_SANDBOX_DAILY_FINGERPRINT_LIMIT,
    3
  );
  const fingerprint = sandboxFingerprint(request);
  const tracker = (await loadJsonStore(key, env)) || {
    date: today,
    total_created: 0,
    by_fingerprint: {}
  };
  tracker.by_fingerprint ||= {};
  const fingerprintCount = Number(tracker.by_fingerprint[fingerprint] || 0);

  if (Number(tracker.total_created || 0) >= globalLimit) {
    const error = new Error("Sandbox daily creation limit reached. Try again tomorrow or request private beta access.");
    error.statusCode = 429;
    error.limit_type = "daily_global";
    throw error;
  }
  if (fingerprintCount >= fingerprintLimit) {
    const error = new Error("Sandbox daily creation limit reached for this evaluator fingerprint.");
    error.statusCode = 429;
    error.limit_type = "daily_fingerprint";
    throw error;
  }

  tracker.total_created = Number(tracker.total_created || 0) + 1;
  tracker.by_fingerprint[fingerprint] = fingerprintCount + 1;
  tracker.updated_at = new Date().toISOString();
  await saveJsonStore(key, tracker, env, { expirationTtl: 60 * 60 * 48 });

  return {
    date: today,
    daily_global_limit: globalLimit,
    daily_global_remaining: Math.max(0, globalLimit - tracker.total_created),
    daily_fingerprint_limit: fingerprintLimit,
    daily_fingerprint_remaining: Math.max(
      0,
      fingerprintLimit - tracker.by_fingerprint[fingerprint]
    ),
    fingerprint_hash: fingerprint
  };
}

async function createSandboxCustomer(input, request, env = {}) {
  const sandboxEnabled = String(env.MACHINESIGNAL_SANDBOX_ENABLED ?? "true")
    .trim()
    .toLowerCase();
  if (["false", "0", "off", "disabled"].includes(sandboxEnabled)) {
    const error = new Error("Sandbox key creation is currently disabled.");
    error.statusCode = 403;
    throw error;
  }

  const allowance = await consumeSandboxCreationAllowance(request, env);
  const customerId = sandboxCustomerId(request, input);
  const ttlDays = positiveIntegerFromEnv(env.MACHINESIGNAL_SANDBOX_TTL_DAYS, 7);
  const expiresAt = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000).toISOString();
  const response = await createBetaCustomer(
    {
      customer_id: customerId,
      contact_email: "sandbox@machinesignal.it",
      plan: "sandbox_limited",
      customer_type: "sandbox",
      created_by: "sandbox_public_endpoint",
      expires_at: expiresAt,
      score_credits: 5,
      target_discovery_credits: 1,
      deep_analysis_credits: 1,
      action_pack_credits: 1,
      verification_credits: 1,
      nurture_signal_credits: 1,
      domain_enrichment_credits: 1,
      opportunity_feed_credits: 0
    },
    request,
    env
  );

  return {
    ...response,
    sandbox: true,
    expires_at: expiresAt,
    evaluator_context: {
      evaluator_type: String(input?.evaluator_type || "unknown").trim() || "unknown",
      integration_target: String(input?.integration_target || "unknown").trim() || "unknown",
      expected_test_path: String(input?.expected_test_path || "full_flow").trim() || "full_flow"
    },
    guardrails: {
      real_payment_executed: false,
      external_contact_executed: false,
      allowed_use: "low-volume technical evaluation only",
      upgrade_path: "request a private beta key for larger tests",
      expires_at: expiresAt,
      daily_creation_limits: {
        date: allowance.date,
        global_limit: allowance.daily_global_limit,
        global_remaining: allowance.daily_global_remaining,
        fingerprint_limit: allowance.daily_fingerprint_limit,
        fingerprint_remaining: allowance.daily_fingerprint_remaining
      }
    },
    sandbox_limits: {
      score_pack_1k: 5,
      target_discovery_pack_250: 1,
      deep_analysis_pack_100: 1,
      action_pack_25: 1,
      verification_pack_100: 1,
      nurture_signal_pack_100: 1,
      domain_enrichment_pack_100: 1,
      opportunity_feed_monthly: 0
    }
  };
}

function assertAdminCustomerStatus(status) {
  const normalized = String(status || "").trim().toLowerCase();
  if (!normalized) return null;
  if (!["active", "suspended", "closed"].includes(normalized)) {
    throw new Error("status must be active, suspended or closed");
  }
  return normalized;
}

function applyAdminCreditUpdate(ledgerState, input = {}) {
  const allowedCodes = Object.keys(ledgerState.balances);
  const setCredits = input.set_credits || {};
  const addCredits = input.add_credits || input.credit_topups || {};
  const applied = [];

  const parseAmount = (value, label) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 0) {
      throw new Error(`${label} must be a non-negative number`);
    }
    return Math.floor(parsed);
  };

  if (input.reset_usage === true) {
    for (const balance of Object.values(ledgerState.balances)) {
      balance.credits_used = 0;
      balance.credits_remaining = balance.credits_purchased;
    }
    applied.push({ action: "reset_usage" });
  }

  for (const [productCode, value] of Object.entries(setCredits)) {
    if (!allowedCodes.includes(productCode)) {
      throw new Error(`unknown ledger product_code ${productCode}`);
    }
    const credits = parseAmount(value, `set_credits.${productCode}`);
    ledgerState.balances[productCode].credits_purchased = credits;
    ledgerState.balances[productCode].credits_remaining = Math.max(
      0,
      credits - ledgerState.balances[productCode].credits_used
    );
    applied.push({ action: "set_credits", product_code: productCode, credits });
  }

  for (const [productCode, value] of Object.entries(addCredits)) {
    if (!allowedCodes.includes(productCode)) {
      throw new Error(`unknown ledger product_code ${productCode}`);
    }
    const credits = parseAmount(value, `add_credits.${productCode}`);
    ledgerState.balances[productCode].credits_purchased += credits;
    ledgerState.balances[productCode].credits_remaining = Math.max(
      0,
      ledgerState.balances[productCode].credits_purchased -
        ledgerState.balances[productCode].credits_used
    );
    applied.push({ action: "add_credits", product_code: productCode, credits });
  }

  if (!applied.length) return null;

  const event = {
    event_id: `evt_${String(ledgerState.events.length + 1).padStart(4, "0")}`,
    timestamp: new Date().toISOString(),
    customer_id: ledgerState.customer_id,
    product_code: "admin_beta_customer",
    request_id:
      String(input.request_id || input.admin_request_id || "").trim() ||
      `admin_${stableHash(`${ledgerState.customer_id}|${Date.now()}`).toString(16)}`,
    status: "admin_credit_update",
    reason: String(input.reason || "admin_beta_customer_update").trim(),
    units_requested: 0,
    credits_consumed: 0,
    credits_remaining: null,
    metadata: { applied }
  };
  ledgerState.events.push(event);
  return event;
}

function buildAdminCustomerPayload(customer, ledger, currentEvent = null) {
  return {
    customer_id: customer.customer_id,
    contact_email: customer.contact_email || null,
    plan: customer.plan || null,
    customer_type: customer.customer_type || null,
    status: customer.status,
    api_key_prefix: customer.api_key_prefix || null,
    created_at: customer.created_at || null,
    updated_at: customer.updated_at || null,
    expires_at: customer.expires_at || null,
    admin_event: currentEvent,
    onboarding: {
      base_url: "https://machinesignal-api.beta-878.workers.dev",
      customer_auth_header: "X-API-Key",
      admin_can_return_full_api_key: false,
      next_customer_calls: [
        "GET /v1/onboarding",
        "GET /v1/usage",
        "POST /v1/lead-opportunity-score",
        "POST /v1/purchase-intent",
        "GET /v1/orders"
      ]
    },
    usage: buildUsagePayload(ledger.state, currentEvent, ledger.persisted),
    real_payment_executed: false,
    external_contact_executed: false
  };
}

async function listStoredKeys(prefix, env = {}) {
  const keys = new Set();
  const kv = env[LEDGER_KV_BINDING];
  if (kv?.list) {
    let cursor;
    do {
      const page = await kv.list({ prefix, cursor });
      for (const item of page.keys || []) {
        if (item?.name) keys.add(item.name);
      }
      cursor = page.list_complete ? null : page.cursor;
    } while (cursor);
  }

  for (const store of [
    globalThis.__machinesignalCustomers,
    globalThis.__machinesignalLedgers,
    globalThis.__machinesignalJsonStore
  ]) {
    for (const key of Object.keys(store || {})) {
      if (key.startsWith(prefix)) keys.add(key);
    }
  }

  return [...keys].sort();
}

function balanceCreditsUsed(ledgerState, productCode) {
  return Number(ledgerState?.balances?.[productCode]?.credits_used || 0);
}

function hasTrueFlag(value, flagName) {
  if (!value || typeof value !== "object") return false;
  if (value[flagName] === true) return true;
  if (Array.isArray(value)) return value.some((item) => hasTrueFlag(item, flagName));
  return Object.values(value).some((item) => hasTrueFlag(item, flagName));
}

function percentOfTarget(actual, target) {
  if (!target) return 0;
  return Number(Math.min(100, (Number(actual || 0) / target) * 100).toFixed(1));
}

async function buildSandboxMetrics(env = {}) {
  const now = new Date();
  const today = utcDateKey(now);
  const customerKeys = await listStoredKeys("customer:sandbox_", env);
  const targets = {
    sandbox_keys: 10,
    scores: 300,
    deep_analysis: 15,
    action_pack: 3,
    blocking_errors: 0,
    real_payment_executed: 0,
    external_contact_executed: 0
  };
  const metrics = {
    generated_at: now.toISOString(),
    test_window_days: 7,
    sandbox_customers: {
      total: 0,
      active: 0,
      expired: 0,
      created_today: 0,
      expiring_next_24h: 0,
      recent: []
    },
    usage: {
      score_credits_used: 0,
      target_discovery_credits_used: 0,
      deep_analysis_credits_used: 0,
      action_pack_credits_used: 0,
      verification_credits_used: 0,
      nurture_signal_credits_used: 0,
      domain_enrichment_credits_used: 0
    },
    orders: {
      total: 0,
      target_discovery: 0,
      deep_analysis: 0,
      action_pack: 0,
      verification: 0,
      nurture_signal: 0,
      domain_enrichment: 0,
      opportunity_feed: 0
    },
    conversion: {
      score_to_deep_analysis_rate: 0,
      deep_analysis_to_action_pack_rate: 0
    },
    safety: {
      real_payment_executed: false,
      external_contact_executed: false,
      blocking_errors: 0
    },
    targets,
    progress: {},
    interpretation: "insufficient_data"
  };

  for (const key of customerKeys) {
    const customerId = key.replace(/^customer:/, "");
    const customer = await loadCustomerById(customerId, env);
    if (!customer || customer.customer_type !== "sandbox") continue;

    metrics.sandbox_customers.total += 1;
    const expired = isExpiredIso(customer.expires_at);
    const active = customer.status === "active" && !expired;
    if (active) metrics.sandbox_customers.active += 1;
    if (expired) metrics.sandbox_customers.expired += 1;
    if (String(customer.created_at || "").slice(0, 10) === today) {
      metrics.sandbox_customers.created_today += 1;
    }
    const expiresAtMs = Date.parse(customer.expires_at || "");
    if (
      Number.isFinite(expiresAtMs) &&
      expiresAtMs > now.getTime() &&
      expiresAtMs <= now.getTime() + 24 * 60 * 60 * 1000
    ) {
      metrics.sandbox_customers.expiring_next_24h += 1;
    }

    const ledger = await loadLedgerByCustomerId(customer.customer_id, env);
    const state = ledger.state;
    metrics.usage.score_credits_used += balanceCreditsUsed(state, "score_pack_1k");
    metrics.usage.target_discovery_credits_used += balanceCreditsUsed(
      state,
      "target_discovery_pack_250"
    );
    metrics.usage.deep_analysis_credits_used += balanceCreditsUsed(state, "deep_analysis_pack_100");
    metrics.usage.action_pack_credits_used += balanceCreditsUsed(state, "action_pack_25");
    metrics.usage.verification_credits_used += balanceCreditsUsed(state, "verification_pack_100");
    metrics.usage.nurture_signal_credits_used += balanceCreditsUsed(state, "nurture_signal_pack_100");
    metrics.usage.domain_enrichment_credits_used += balanceCreditsUsed(
      state,
      "domain_enrichment_pack_100"
    );

    for (const order of state.orders || []) {
      metrics.orders.total += 1;
      const productCode = order.product_code;
      if (Object.hasOwn(metrics.orders, productCode)) {
        metrics.orders[productCode] += 1;
      }
    }

    if (
      customer.real_payment_executed === true ||
      state.real_payment_executed === true ||
      hasTrueFlag(state.orders, "real_payment_executed")
    ) {
      metrics.safety.real_payment_executed = true;
    }
    if (
      customer.external_contact_executed === true ||
      state.external_contact_executed === true ||
      hasTrueFlag(state.orders, "external_contact_executed")
    ) {
      metrics.safety.external_contact_executed = true;
    }

    metrics.sandbox_customers.recent.push({
      customer_id: customer.customer_id,
      status: customer.status,
      created_at: customer.created_at || null,
      expires_at: customer.expires_at || null,
      active,
      score_credits_used: balanceCreditsUsed(state, "score_pack_1k"),
      deep_analysis_orders: (state.orders || []).filter(
        (order) => order.product_code === "deep_analysis"
      ).length,
      action_pack_orders: (state.orders || []).filter(
        (order) => order.product_code === "action_pack"
      ).length
    });
  }

  metrics.sandbox_customers.recent = metrics.sandbox_customers.recent
    .sort((a, b) => String(b.created_at || "").localeCompare(String(a.created_at || "")))
    .slice(0, 10);

  metrics.conversion.score_to_deep_analysis_rate =
    metrics.usage.score_credits_used > 0
      ? Number((metrics.orders.deep_analysis / metrics.usage.score_credits_used).toFixed(4))
      : 0;
  metrics.conversion.deep_analysis_to_action_pack_rate =
    metrics.orders.deep_analysis > 0
      ? Number((metrics.orders.action_pack / metrics.orders.deep_analysis).toFixed(4))
      : 0;

  metrics.progress = {
    sandbox_keys_pct: percentOfTarget(metrics.sandbox_customers.total, targets.sandbox_keys),
    scores_pct: percentOfTarget(metrics.usage.score_credits_used, targets.scores),
    deep_analysis_pct: percentOfTarget(metrics.orders.deep_analysis, targets.deep_analysis),
    action_pack_pct: percentOfTarget(metrics.orders.action_pack, targets.action_pack),
    safety_ok:
      metrics.safety.blocking_errors === 0 &&
      metrics.safety.real_payment_executed === false &&
      metrics.safety.external_contact_executed === false
  };

  if (!metrics.progress.safety_ok) {
    metrics.interpretation = "blocked_by_safety_issue";
  } else if (
    metrics.sandbox_customers.total >= targets.sandbox_keys &&
    metrics.usage.score_credits_used >= targets.scores &&
    metrics.orders.deep_analysis >= targets.deep_analysis &&
    metrics.orders.action_pack >= targets.action_pack
  ) {
    metrics.interpretation = "test_targets_met";
  } else if (metrics.sandbox_customers.total > 0 || metrics.usage.score_credits_used > 0) {
    metrics.interpretation = "in_progress";
  }

  return metrics;
}

async function getBetaCustomerAdmin(customerId, env = {}) {
  const customer = await loadCustomerById(customerId, env);
  if (!customer) {
    const error = new Error("Beta customer not found.");
    error.statusCode = 404;
    throw error;
  }
  const ledger = await loadLedgerByCustomerId(customer.customer_id, env);
  return buildAdminCustomerPayload(customer, ledger);
}

async function updateBetaCustomerAdmin(customerId, input = {}, env = {}) {
  const customer = await loadCustomerById(customerId, env);
  if (!customer) {
    const error = new Error("Beta customer not found.");
    error.statusCode = 404;
    throw error;
  }

  const status = assertAdminCustomerStatus(input.status);
  if (status) customer.status = status;
  if (input.plan !== undefined) {
    customer.plan = String(input.plan || "").trim() || customer.plan;
  }
  if (input.contact_email !== undefined) {
    customer.contact_email = String(input.contact_email || "").trim() || null;
  }

  const ledger = await loadLedgerByCustomerId(customer.customer_id, env);
  const adminEvent = applyAdminCreditUpdate(ledger.state, input);
  await saveCustomerRecordById(customer, env);
  await saveLedger(ledger.key, ledger.state, env);
  return buildAdminCustomerPayload(customer, ledger, adminEvent);
}

function buildPublicMachineOnboarding() {
  return {
    service: "MachineSignal",
    purpose:
      "Machine-readable lead opportunity scoring, credit routing, beta order intents and delivery retrieval.",
    primary_customer_interface: "machine",
    human_role: "supervision, approval and audit only",
    machine_first_rule:
      "Do not rely on human email persuasion as the primary sales channel. Use public manifests, OpenAPI, llms.txt and callable endpoints.",
    base_url: "https://machinesignal-api.beta-878.workers.dev",
    discovery: {
      llms: "/llms.txt",
      openapi: "/openapi.json",
      postman: "/postman_collection.json",
      postman_public_collection: "https://machinesignal.it/postman_public_collection.json",
      product_catalog: "/product-catalog.json",
      machine_onboarding: "/machine-onboarding.json",
      machine_discovery_pack: "https://machinesignal.it/machine-discovery/machine-discovery-pack.json",
      api_directory_submission: "https://machinesignal.it/distribution/api-directory-submission.json",
      distribution_channel_shortlist: "https://machinesignal.it/distribution/channel-shortlist.json",
      well_known_machine_discovery: "https://machinesignal.it/.well-known/machine-discovery.json",
      sandbox_customers: "/v1/sandbox/customers",
      authenticated_onboarding: "/v1/onboarding",
      sandbox_metrics: "/v1/admin/sandbox-metrics"
    },
    authentication: {
      type: "apiKey",
      header: "X-API-Key",
      sandbox_keys_created_by: "POST /v1/sandbox/customers",
      customer_keys_created_by: "POST /v1/beta/customers",
      idempotency_header: "Idempotency-Key"
    },
    callable_flow: [
      {
        step: 1,
        call: "GET /machine-onboarding.json",
        auth_required: false,
        machine_goal: "Understand the product contract."
      },
      {
        step: 2,
        call: "GET /product-catalog.json",
        auth_required: false,
        machine_goal: "Read exact purchasable products, prices, credit rules and delivery formats."
      },
      {
        step: 3,
        call: "POST /v1/sandbox/customers",
        auth_required: false,
        machine_goal: "Create a low-credit sandbox key when no beta key is available."
      },
      {
        step: 4,
        call: "GET /v1/onboarding",
        auth_required: true,
        machine_goal: "Read customer-specific credits and next available calls."
      },
      {
        step: 5,
        call: "POST /v1/lead-opportunity-score",
        auth_required: true,
        machine_goal: "Score a domain and receive a decision."
      },
      {
        step: 6,
        call: "POST /v1/purchase-intent",
        auth_required: true,
        machine_goal: "Create a beta order when next_purchase recommends a product."
      },
      {
        step: 7,
        call: "GET /v1/orders",
        auth_required: true,
        machine_goal: "Retrieve orders and deliveries."
      }
    ],
    products: PRODUCT_CATALOG.products,
    machine_buying_scenarios: PRODUCT_CATALOG.machine_buying_scenarios,
    entry_points: {
      has_existing_list: {
        start_with: "POST /v1/lead-opportunity-score",
        reason: "The machine already has domains or company records and needs prioritization."
      },
      has_no_list: {
        start_with: "POST /v1/purchase-intent",
        product_code: "target_discovery",
        required_inputs: ["market", "area", "commercial_objective"],
        reason:
          "The machine needs MachineSignal to produce targets for a declared commercial objective."
      },
      wants_action_payload: {
        start_with: "POST /v1/purchase-intent",
        product_code: "action_pack",
        reason:
          "The machine already has a qualified opportunity and needs a CRM/agent-readable action."
      }
    },
    beta_limits: {
      real_payment_executed: false,
      external_contact_executed: false,
      requires_customer_api_key: true,
      repeated_idempotency_key_no_extra_charge: true,
      sandbox: {
        default_expires_after_days: 7,
        default_daily_global_creation_limit: 25,
        default_daily_fingerprint_creation_limit: 3,
        allowed_use: "low-volume technical evaluation only"
      }
    },
    recommended_agent_policy: {
      can_call_scores: true,
      can_create_beta_orders: true,
      can_read_usage_and_orders: true,
      must_not_execute_external_outreach: true,
      must_not_assume_real_payment: true
    }
  };
}

function buildAuthenticatedOnboarding(auth, ledger) {
  return {
    customer_id: ledger.state.customer_id,
    auth_type: auth.auth_type,
    machine_contract: buildPublicMachineOnboarding(),
    usage: buildUsagePayload(ledger.state, null, ledger.persisted),
    next_recommended_calls: [
      {
        call: "GET /v1/usage",
        reason: "Confirm available credits before scoring."
      },
      {
        call: "POST /v1/lead-opportunity-score",
        reason: "Score one domain with Idempotency-Key."
      },
      {
        call: "POST /v1/purchase-intent",
        reason: "Create a beta order only if next_purchase recommends a product."
      },
      {
        call: "GET /v1/orders",
        reason: "Retrieve order history and deliveries."
      }
    ],
    customer_state: {
      customer_type: auth.customer?.customer_type || null,
      sandbox: auth.customer?.customer_type === "sandbox",
      expires_at: auth.customer?.expires_at || null,
      can_score: ledgerBalances(ledger.state).some(
        (item) => item.product_code === "score_pack_1k" && item.credits_remaining > 0
      ),
      can_create_purchase_intents: ledgerBalances(ledger.state).some(
        (item) => item.product_code !== "score_pack_1k" && item.credits_remaining > 0
      ),
      real_payment_enabled: false,
      external_contact_enabled: false
    }
  };
}

function buildBetaDelivery(productCode, domain, input = {}, event = {}) {
  const sourceScoreRequestId = String(input?.source_score_request_id || "").trim() || null;
  const sourceOrderIntentId = String(input?.source_order_intent_id || "").trim() || null;
  const generatedAt = new Date().toISOString();
  const requestedMarket = String(input?.market || input?.sector_hint || "").trim() || null;
  const requestedArea = String(input?.area || input?.country_hint || "").trim() || null;
  const commercialObjective =
    String(input?.commercial_objective || input?.objective || input?.reason || "").trim() ||
    "find machine-actionable commercial opportunities before spending more budget";
  const marketLabel = requestedMarket || "requested market";
  const areaLabel = requestedArea || "requested area";
  const sampleSlug = `${marketLabel}-${areaLabel}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "market-sample";
  const common = {
    delivery_id: `del_${stableHash(`${productCode}|${domain}|${event.request_id || ""}`).toString(16)}`,
    product_code: productCode,
    domain,
    source_score_request_id: sourceScoreRequestId,
    generated_at: generatedAt,
    beta_delivery: true,
    synthetic_demo_mode: true,
    real_payment_executed: false,
    external_contact_executed: false
  };

  if (productCode === "target_discovery") {
    return {
      ...common,
      delivery_type: "target_discovery_precheck",
      status: "target_discovery_precheck_ready",
      requested_market: requestedMarket,
      requested_area: requestedArea,
      commercial_objective: commercialObjective,
      machine_value:
        "Returns a machine-usable starting batch when the customer machine has no list to score.",
      promised_output: {
        target_count: 250,
        fields: [
          "domain",
          "category",
          "area",
          "initial_signals",
          "reason_for_inclusion"
        ]
      },
      output_contract: {
        exact_unit_sold: "250 coherent target records or a no-go market coverage decision",
        row_schema: [
          "domain",
          "target_name",
          "category",
          "area",
          "source_type",
          "initial_signals",
          "reason_for_inclusion",
          "next_machine_action"
        ],
        acceptance_criteria: [
          "The target must match the requested market or the commercial objective.",
          "The target must have enough public signal to justify a score call.",
          "Duplicate domains are excluded from the delivered batch."
        ],
        credit_policy:
          "One target_discovery_pack_250 credit is consumed only for an accepted discovery order. If the market cannot support the pack, the machine receives a no-go decision and suggested criteria changes."
      },
      beta_sample_targets: [
        {
          domain: `${sampleSlug}-candidate-01.example`,
          target_name: `${marketLabel} candidate 01`,
          category: marketLabel,
          area: areaLabel,
          source_type: "public_web_signal",
          initial_signals: ["sector_match", "local_market", "business_domain_present"],
          reason_for_inclusion:
            "Synthetic beta target representing the requested market and commercial objective.",
          next_machine_action: "send domain to /v1/lead-opportunity-score"
        },
        {
          domain: `${sampleSlug}-candidate-02.example`,
          target_name: `${marketLabel} candidate 02`,
          category: marketLabel,
          area: areaLabel,
          source_type: "public_directory_signal",
          initial_signals: ["sector_match", "regional_market", "clinic_keyword_present"],
          reason_for_inclusion:
            "Synthetic beta target used to validate scoring after discovery.",
          next_machine_action: "send domain to /v1/lead-opportunity-score"
        },
        {
          domain: `${sampleSlug}-candidate-03.example`,
          target_name: `${marketLabel} candidate 03`,
          category: marketLabel,
          area: areaLabel,
          source_type: "search_result_signal",
          initial_signals: ["sector_match", "service_keyword_present"],
          reason_for_inclusion:
            "Synthetic beta target for validating the target-discovery-to-score handoff.",
          next_machine_action: "send domain to /v1/lead-opportunity-score"
        }
      ],
      next_machine_call: {
        method: "POST",
        endpoint: "/v1/lead-opportunity-score",
        input_from_delivery: "Use beta_sample_targets[].domain as domain.",
        required_headers: ["X-API-Key", "Idempotency-Key"]
      },
      validity_rule:
        "Activate the pack only if the market availability pre-check can support 250 coherent targets.",
      fallback_if_not_available: [
        "Mini Discovery",
        "wider area",
        "broader criteria",
        "changed commercial objective"
      ],
      machine_recommendation:
        "Use this product when the customer machine needs a starting list before score calls."
    };
  }

  if (productCode === "domain_enrichment") {
    return {
      ...common,
      delivery_type: "domain_enrichment_decision_pack",
      status: "domain_enrichment_beta_ready",
      requested_target_name: String(input?.target_name || "").trim() || null,
      requested_batch_id: String(input?.batch_id || "").trim() || null,
      promised_output: {
        decision_count: 100,
        decision_statuses: [
          "verified_domain",
          "candidate_not_reliable",
          "no_reliable_domain"
        ],
        fields: [
          "target_name",
          "area",
          "verified_domain",
          "confidence",
          "source_type",
          "decision_status",
          "reason",
          "next_machine_action"
        ]
      },
      beta_sample_results: [
        {
          target_name: String(input?.target_name || "Studio Dentistico Demo").trim(),
          area: String(input?.area || input?.country_hint || "Italy").trim(),
          verified_domain: "studio-dentistico-demo.it",
          confidence: "medium",
          source_type: "public_directory_or_search_result",
          decision_status: "verified_domain",
          reason: "Name, sector and area are coherent enough for score testing.",
          next_machine_action: "send verified_domain to /v1/lead-opportunity-score"
        },
        {
          target_name: "Target con dominio incerto",
          area: String(input?.area || input?.country_hint || "Italy").trim(),
          verified_domain: null,
          confidence: "low",
          source_type: "candidate_only",
          decision_status: "candidate_not_reliable",
          reason: "A possible domain exists, but evidence is not strong enough for scoring.",
          next_machine_action: "do not score; widen sources or request verification"
        },
        {
          target_name: "Target senza dominio pubblico affidabile",
          area: String(input?.area || input?.country_hint || "Italy").trim(),
          verified_domain: null,
          confidence: "none",
          source_type: "no_public_match",
          decision_status: "no_reliable_domain",
          reason: "No reliable public website domain was found.",
          next_machine_action: "stop scoring workflow for this target"
        }
      ],
      validity_rule:
        "Consume one enrichment credit for each completed enrichment decision, including verified_domain, candidate_not_reliable and no_reliable_domain.",
      machine_recommendation:
        "Use this product between target discovery and score calls when the workflow has target names but lacks reliable domains."
    };
  }

  if (productCode === "verification") {
    return {
      ...common,
      delivery_type: "data_quality_verification",
      status: "verification_ready",
      data_quality_risk: "medium",
      what_is_included: {
        exact_unit_sold: "one verification decision for one target/domain",
        machine_question_answered:
          "Is this target reliable enough to keep in an automated commercial workflow?",
        returned_decision_fields: [
          "verification_verdict",
          "data_quality_risk",
          "checks",
          "next_allowed_actions",
          "stop_rules"
        ],
        credit_policy:
          "One verification_pack_100 credit is consumed for each verification decision returned."
      },
      verification_verdict: {
        status: "keep_with_caution",
        meaning:
          "The lead can stay in the workflow, but the machine should not spend paid outreach or campaign budget until quality is confirmed."
      },
      checks: [
        { code: "domain_format", status: "passed", meaning: "The domain is normalized and usable." },
        { code: "commercial_action_safety", status: "review", meaning: "Use only compliant follow-up channels." },
        { code: "confidence_gate", status: "review", meaning: "The lead should be verified before paid outreach." }
      ],
      stop_rules: [
        "stop if the domain is not attributable to the intended business",
        "stop if sector or geography evidence conflicts with the requested market",
        "stop if no compliant action channel exists"
      ],
      machine_recommendation: "Keep the lead, but do not start paid outreach until data quality is confirmed.",
      next_allowed_actions: ["rescore", "save_to_crm", "request_deep_analysis_after_verification"],
      next_machine_call: {
        method: "POST",
        endpoint: "/v1/lead-opportunity-score",
        when: "after new or corrected evidence is available",
        required_headers: ["X-API-Key", "Idempotency-Key"]
      }
    };
  }

  if (productCode === "nurture_signal") {
    return {
      ...common,
      delivery_type: "nurture_signal",
      status: "nurture_signal_ready",
      crm_tags: ["machine_signal_nurture", "rescore_later", "low_budget_only"],
      nurture_reason: "The lead has some opportunity signal, but not enough confidence for immediate high-budget action.",
      rescore_after_days: 30,
      low_cost_action: "Add to watchlist and enrich only with low-cost public signals.",
      machine_recommendation: "Save the lead in nurturing and avoid human sales effort for now."
    };
  }

  if (productCode === "deep_analysis") {
    return {
      ...common,
      delivery_type: "deep_opportunity_analysis",
      status: "deep_analysis_ready",
      what_is_included: {
        exact_unit_sold: "one deep opportunity decision pack for one scored domain",
        machine_question_answered:
          "Is this strong enough to justify the next paid action, or should the workflow stop?",
        returned_decision_fields: [
          "opportunity_grade",
          "opportunity_hypothesis",
          "signals_to_validate",
          "recommended_next_step",
          "recommended_budget_cap_eur",
          "stop_rules"
        ],
        credit_policy:
          "One deep_analysis_pack_100 credit is consumed for each deep analysis decision pack returned."
      },
      opportunity_grade: "promising_beta_case",
      opportunity_hypothesis:
        "The domain may justify deeper commercial review before campaign or human-sales budget is spent.",
      signals_to_validate: [
        "website conversion friction",
        "sector-specific demand signal",
        "local competition and offer fit"
      ],
      recommended_next_step: {
        product_code: "action_pack",
        condition: "buy only if the customer machine has a compliant action channel and budget approval",
        reason:
          "Deep analysis indicates potential, but the next commercial action must still pass compliance and budget gates."
      },
      stop_rules: [
        "stop if confidence drops after verification",
        "stop if the target does not match the customer's commercial objective",
        "stop if no compliant downstream action is available"
      ],
      risk_flags: ["synthetic_beta_output", "requires real-world validation before outreach"],
      recommended_budget_cap_eur: 3,
      machine_recommendation: "Use this output to decide whether to create an action pack or stop spending.",
      next_machine_call: {
        method: "POST",
        endpoint: "/v1/purchase-intent",
        payload_template: {
          product_code: "action_pack",
          source_order_intent_id: "use_this_order_intent_id",
          max_budget_eur: 10
        },
        required_headers: ["X-API-Key", "Idempotency-Key"]
      }
    };
  }

  if (productCode === "opportunity_feed") {
    return {
      ...common,
      delivery_type: "recurring_opportunity_feed",
      status: "opportunity_feed_beta_intent_ready",
      schedule: {
        period: "monthly",
        scans: 4,
        deliveries: 4
      },
      promised_output: [
        "new_or_updated_targets",
        "base_score",
        "main_signals",
        "priority",
        "api_file_or_webhook_delivery"
      ],
      validity_rule:
        "If a scan does not produce coherent opportunities, deliver a market coverage report and suggested criteria changes instead of weak targets.",
      machine_recommendation:
        "Use this product when a workflow needs recurring opportunities without repeated one-off discovery requests."
    };
  }

  return {
    ...common,
    delivery_type: "action_pack",
    status: "action_pack_ready",
    what_is_included: {
      exact_unit_sold: "one CRM-ready action pack for one qualified domain",
      machine_question_answered:
        "What should the customer machine do next with this qualified opportunity?",
      returned_decision_fields: [
        "priority",
        "crm_record_patch",
        "crm_task",
        "crm_platform_mappings",
        "workflow_payload",
        "agent_instructions",
        "webhook_event",
        "webhook_delivery_policy",
        "audit_event",
        "approval_gate",
        "deduplication_key",
        "next_api_calls",
        "stop_rules",
        "compliance_guardrail"
      ],
      credit_policy:
        "One action_pack_25 credit is consumed for each action pack returned."
    },
    priority: "review_before_external_contact",
    crm_record_patch: {
      domain,
      lead_status: "qualified_pending_compliance_review",
      lifecycle_stage: "opportunity_preparation",
      tags: ["machine_signal_action_pack", "requires_compliance_review"],
      next_task: {
        task_type: "review_and_prepare_compliant_action",
        owner_type: "customer_machine_or_approved_agent",
        due_in_hours: 24,
        budget_cap_eur: Number(input?.max_budget_eur || 10)
      }
    },
    crm_task: {
      task_id: `ms_task_${stableHash(`${domain}|${sourceScoreRequestId}|action_pack`).toString(16)}`,
      domain,
      task_type: "qualified_opportunity_review",
      title: `Review MachineSignal action pack for ${domain}`,
      status: "open",
      priority: "high",
      owner_type: "customer_machine_or_approved_agent",
      due_in_hours: 24,
      required_context: [
        "source_score_request_id",
        "source_order_intent_id",
        "crm_record_patch",
        "message_angle",
        "compliance_guardrail"
      ],
      completion_criteria: [
        "CRM record created or updated",
        "score and deep-analysis context attached",
        "compliance gate result recorded",
        "external action blocked unless approved"
      ]
    },
    crm_platform_mappings: {
      hubspot: {
        object: "company",
        properties: {
          domain: "domain",
          lead_status: "hs_lead_status",
          lifecycle_stage: "lifecyclestage",
          tags: "machinesignal_tags",
          next_task: "machinesignal_next_task"
        }
      },
      salesforce: {
        object: "Lead",
        fields: {
          Website: "domain",
          Status: "lead_status",
          Rating: "priority",
          MachineSignal_Tags__c: "tags",
          MachineSignal_Next_Task__c: "next_task"
        }
      },
      pipedrive: {
        object: "organization",
        fields: {
          website: "domain",
          label: "machine_signal_action_pack",
          next_activity: "next_task"
        }
      },
      generic_crm: {
        operation: "upsert_company_or_lead",
        match_key: "domain",
        write_fields: ["lead_status", "lifecycle_stage", "tags", "next_task", "message_angle"]
      }
    },
    message_angle: {
      summary: "Focus on measurable website opportunity and low-friction diagnostic value.",
      do_not_claim: [
        "guaranteed revenue uplift",
        "verified customer pain without customer evidence",
        "automatic legal permission to contact"
      ],
      recommended_value_proposition:
        "Offer a diagnostic view of visible digital opportunity before the customer spends campaign or human-sales budget."
    },
    workflow_payload: {
      workflow_name: "machinesignal_qualified_opportunity_review",
      trigger: "action_pack_ready",
      deduplication_key: `machinesignal:action_pack:${domain}:${sourceScoreRequestId || "no_score"}`,
      required_inputs: ["domain", "source_score_request_id", "source_order_intent_id"],
      output_targets: ["crm", "workflow_engine", "approved_customer_agent"],
      recommended_steps: [
        {
          step: 1,
          action: "create_or_update_crm_record",
          payload_ref: "crm_record_patch"
        },
        {
          step: 2,
          action: "attach_score_and_deep_analysis_context",
          source_score_request_id: sourceScoreRequestId
        },
        {
          step: 3,
          action: "run_compliance_gate",
          required_result: "approved_channel_and_lawful_basis"
        },
        {
          step: 4,
          action: "prepare_next_contact_or_internal_task",
          condition: "only_after_compliance_gate_passes"
        }
      ]
    },
    approval_gate: {
      gate_name: "external_action_approval",
      default_state: "blocked",
      required_signals: [
        "lawful_basis_confirmed",
        "approved_channel_available",
        "customer_policy_allows_action",
        "crm_audit_record_created"
      ],
      allowed_without_approval: [
        "create_or_update_crm_record",
        "create_internal_task",
        "attach_context",
        "wait_for_customer_policy"
      ],
      blocked_without_approval: [
        "send_email",
        "send_linkedin_message",
        "call_target",
        "start_external_sequence"
      ]
    },
    agent_instructions: [
      "Do not contact the target automatically.",
      "First check whether the customer has an approved channel and lawful basis.",
      "If compliance is not approved, keep the lead in CRM as pending_review.",
      "If approved, use the message angle as a draft direction, not as a final claim."
    ],
    webhook_event: {
      event_type: "machinesignal.action_pack.ready",
      version: "2026-05-31",
      idempotency_key_hint: "reuse the order_intent_id when forwarding to CRM",
      payload_schema: {
        domain: "string",
        priority: "string",
        crm_record_patch: "object",
        crm_task: "object",
        crm_platform_mappings: "object",
        workflow_payload: "object",
        approval_gate: "object",
        compliance_guardrail: "string"
      }
    },
    webhook_delivery_policy: {
      delivery_mode: "customer_configured_endpoint_only",
      retry_policy: {
        max_attempts: 3,
        backoff_seconds: [30, 300, 1800]
      },
      signing: {
        recommended_header: "X-MachineSignal-Signature",
        algorithm: "hmac-sha256",
        secret_owner: "customer"
      },
      idempotency_header: "Idempotency-Key",
      should_not_send_if: [
        "customer_webhook_not_configured",
        "approval_gate_missing",
        "payload_schema_validation_failed"
      ]
    },
    audit_event: {
      event_type: "machinesignal.audit.action_pack_created",
      actor_type: "machinesignal_api",
      domain,
      source_score_request_id: sourceScoreRequestId || null,
      source_order_intent_id: sourceOrderIntentId || null,
      external_contact_executed: false,
      real_payment_executed: false,
      required_customer_audit_action: "record approval_gate result before any external action"
    },
    deduplication_key: `machinesignal:action_pack:${domain}:${sourceScoreRequestId || "no_score"}`,
    next_api_calls: [
      {
        purpose: "verify remaining credits and ledger state",
        method: "GET",
        endpoint: "/v1/usage"
      },
      {
        purpose: "retrieve this order delivery later",
        method: "GET",
        endpoint: "/v1/orders/{order_intent_id}"
      },
      {
        purpose: "retrieve all customer-machine orders",
        method: "GET",
        endpoint: "/v1/orders"
      }
    ],
    stop_rules: [
      "stop if no lawful basis or approved channel exists",
      "stop if the domain no longer matches the customer's commercial objective",
      "stop if data quality verification is required but not completed",
      "stop if the customer machine cannot record the action in CRM or audit log"
    ],
    follow_up_sequence: [
      { step: 1, channel: "system", action: "prepare_crm_task" },
      { step: 2, channel: "system", action: "attach_score_and_reason" },
      { step: 3, channel: "human_or_approved_agent", action: "send_only_if_compliant_basis_exists" }
    ],
    compliance_guardrail:
      "Do not send unsolicited outreach automatically unless the customer has a lawful basis and channel policy.",
    machine_recommendation: "Prepare actions, but require compliance approval before external contact."
  };
}

function reasonFor(score, sectorHint, confidence) {
  if (confidence < 0.5) {
    return "Confidence is too low for paid action; verify data quality before spending more budget.";
  }
  if (score >= 75) {
    return "Signals suggest a high-priority opportunity where a paid deep analysis may be justified.";
  }
  if (score >= 65) {
    return "Signals suggest a possible opportunity, but the lead should enter nurturing before higher spend.";
  }
  if (score >= 45) {
    return "Signals suggest a medium opportunity that should be monitored before spending more budget.";
  }
  if (sectorHint) {
    return "Sector context is present, but available signals are not strong enough for extra spend.";
  }
  return "Insufficient public context for a high-priority opportunity signal.";
}

export function scoreLeadOpportunity(input) {
  const domain = normalizeDomain(input?.domain);
  const sectorHint = String(input?.sector_hint || "").trim();
  const countryHint = String(input?.country_hint || "").trim().toUpperCase();
  const hash = stableHash(`${domain}|${sectorHint}|${countryHint}`);
  const base = 34 + (hash % 32);
  const domainSignals = /\.(it|com|io|ai)$/.test(domain) ? 4 : 0;
  const qualityReview = sectorQualityReview(input, domain, sectorHint);
  const score = clamp(base + sectorBoost(sectorHint) + domainSignals + qualityReview.score_delta, 8, 94);
  const rawConfidence = clamp(0.52 + ((hash >> 8) % 36) / 100, 0.35, 0.88);
  const confidence = Number(
    clamp(
      qualityReview.confidence_cap === null ? rawConfidence : Math.min(rawConfidence, qualityReview.confidence_cap),
      0.35,
      0.88
    ).toFixed(2)
  );
  const decision = decisionFor(score, confidence);
  const purchase = purchaseRecommendation(decision);
  return {
    domain,
    opportunity_score: score,
    confidence,
    priority: priorityFor(score),
    decision,
    reason: reasonFor(score, sectorHint, confidence),
    quality_review: qualityReview,
    recommended_action: decision,
    product_level: "score_base",
    score_price_range_eur: "0.05-0.20",
    next_purchase: purchase,
    machine_next_step: {
      action: decision,
      budget_action:
        purchase.next_product === null ? "do_not_buy_more_now" : `consider_${purchase.next_product}`,
      max_extra_spend_eur: purchase.price_range_eur,
      instruction: purchase.machine_instruction
    },
    beta: true,
    model_version: "minimal-beta-0.2-offer-ladder",
    public_endpoint_live: true,
    synthetic_demo_mode: true
  };
}

function jsonResponse(payload, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(payload, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": DEFAULT_ALLOWED_ORIGIN,
      "access-control-allow-methods": "GET,POST,OPTIONS",
      "access-control-allow-headers": "content-type,x-api-key,idempotency-key,x-request-id",
      ...extraHeaders
    }
  });
}

function textResponse(text, status = 200) {
  return new Response(text, {
    status,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "access-control-allow-origin": DEFAULT_ALLOWED_ORIGIN,
      "access-control-allow-methods": "GET,POST,OPTIONS",
      "access-control-allow-headers": "content-type,x-api-key,idempotency-key,x-request-id"
    }
  });
}

async function parseJson(request) {
  try {
    return await request.json();
  } catch {
    throw new Error("request body must be valid JSON");
  }
}

async function parseOptionalJson(request) {
  const text = await request.text();
  if (!text.trim()) return {};
  try {
    return JSON.parse(text);
  } catch {
    throw new Error("request body must be valid JSON");
  }
}

export async function handleRequest(request, env = {}) {
  const url = new URL(request.url);

  if (request.method === "OPTIONS") {
    return jsonResponse({ ok: true });
  }

  if (request.method === "GET" && url.pathname === "/health") {
    return jsonResponse({
      status: "ok",
      service: "MachineSignal Lead Opportunity Score API",
      beta: true
    });
  }

  if (request.method === "GET" && url.pathname === "/") {
    return jsonResponse({
      service: "MachineSignal Lead Opportunity Score API",
      beta: true,
      docs: {
        openapi: "/openapi.json",
        postman: "/postman_collection.json",
        postman_public_collection: "https://machinesignal.it/postman_public_collection.json",
        llms: "/llms.txt",
        machine_onboarding: "/machine-onboarding.json",
        product_catalog: "/product-catalog.json",
        machine_discovery_pack: "https://machinesignal.it/machine-discovery/machine-discovery-pack.json",
        api_directory_submission: "https://machinesignal.it/distribution/api-directory-submission.json",
        distribution_channel_shortlist: "https://machinesignal.it/distribution/channel-shortlist.json",
        well_known_machine_discovery: "https://machinesignal.it/.well-known/machine-discovery.json",
        sandbox_customers: "/v1/sandbox/customers",
        authenticated_onboarding: "/v1/onboarding",
        usage: "/v1/usage",
        score: "/v1/lead-opportunity-score",
        purchase_intent: "/v1/purchase-intent",
        orders: "/v1/orders",
        beta_customers: "/v1/beta/customers",
        sandbox_metrics: "/v1/admin/sandbox-metrics"
      }
    });
  }

  if (request.method === "GET" && url.pathname === "/openapi.json") {
    return jsonResponse(openApi);
  }

  if (request.method === "GET" && url.pathname === "/machine-onboarding.json") {
    return jsonResponse(buildPublicMachineOnboarding());
  }

  if (request.method === "GET" && url.pathname === "/product-catalog.json") {
    return jsonResponse(PRODUCT_CATALOG);
  }

  if (request.method === "GET" && url.pathname === "/postman_collection.json") {
    return jsonResponse(postmanCollection);
  }

  if (request.method === "GET" && url.pathname === "/llms.txt") {
    return textResponse(llmsTxt);
  }

  if (request.method === "POST" && url.pathname === "/v1/sandbox/customers") {
    try {
      const body = await parseOptionalJson(request);
      return jsonResponse(await createSandboxCustomer(body, request, env));
    } catch (error) {
      return jsonResponse(
        {
          error:
            error.statusCode === 403
              ? "sandbox_disabled"
              : error.statusCode === 429
                ? "sandbox_limit_exceeded"
                : "bad_request",
          message: error.message || "Invalid sandbox request."
        },
        error.statusCode || 400
      );
    }
  }

  if (request.method === "GET" && url.pathname === "/v1/onboarding") {
    const auth = await authenticateRequest(request, env);
    if (!auth.authorized) {
      return jsonResponse(
        { error: "unauthorized", message: "Missing or invalid X-API-Key." },
        401
      );
    }
    const ledger = await loadLedger(request, env, auth);
    return jsonResponse(buildAuthenticatedOnboarding(auth, ledger));
  }

  if (request.method === "GET" && url.pathname === "/v1/usage") {
    const auth = await authenticateRequest(request, env);
    if (!auth.authorized) {
      return jsonResponse(
        { error: "unauthorized", message: "Missing or invalid X-API-Key." },
        401
      );
    }
    const ledger = await loadLedger(request, env, auth);
    return jsonResponse(buildUsagePayload(ledger.state, null, ledger.persisted));
  }

  if (request.method === "POST" && url.pathname === "/v1/lead-opportunity-score") {
    const auth = await authenticateRequest(request, env);
    if (!auth.authorized) {
      return jsonResponse(
        { error: "unauthorized", message: "Missing or invalid X-API-Key." },
        401
      );
    }
    try {
      const body = await parseJson(request);
      const score = scoreLeadOpportunity(body);
      const ledger = await loadLedger(request, env, auth);
      const requestId = makeRequestId(request, body, score.domain);
      const event = consumeCredit(
        ledger.state,
        "score_pack_1k",
        requestId,
        "valid_output",
        "score_delivered",
        {
          domain: score.domain,
          decision: score.decision,
          opportunity_score: score.opportunity_score,
          confidence: score.confidence
        }
      );
      await saveLedger(ledger.key, ledger.state, env);
      return jsonResponse({
        ...score,
        request_id: requestId,
        usage: buildUsagePayload(ledger.state, event, ledger.persisted)
      });
    } catch (error) {
      return jsonResponse(
        { error: "bad_request", message: error.message || "Invalid request." },
        400
      );
    }
  }

  if (request.method === "POST" && url.pathname === "/v1/purchase-intent") {
    const auth = await authenticateRequest(request, env);
    if (!auth.authorized) {
      return jsonResponse(
        { error: "unauthorized", message: "Missing or invalid X-API-Key." },
        401
      );
    }
    try {
      const body = await parseJson(request);
      const product = purchaseProductConfig(body?.product_code);
      const domain = normalizePurchaseSubject(body, product);
      const ledger = await loadLedger(request, env, auth);
      const requestId = makeRequestId(request, body, domain);
      const event = consumeCredit(
        ledger.state,
        product.ledger_product_code,
        requestId,
        "valid_output",
        "beta_order_intent_created",
        {
          domain,
          product_code: product.product_code,
          source_score_request_id: body?.source_score_request_id || null,
          real_payment_executed: false,
          external_contact_executed: false
        }
      );
      const intent = buildPurchaseIntent(body, requestId, event);
      const order = saveOrderRecord(ledger.state, intent, event);
      await saveLedger(ledger.key, ledger.state, env);
      return jsonResponse({
        ...intent,
        order,
        usage: buildUsagePayload(ledger.state, event, ledger.persisted)
      });
    } catch (error) {
      return jsonResponse(
        { error: "bad_request", message: error.message || "Invalid request." },
        400
      );
    }
  }

  if (request.method === "GET" && url.pathname === "/v1/orders") {
    const auth = await authenticateRequest(request, env);
    if (!auth.authorized) {
      return jsonResponse(
        { error: "unauthorized", message: "Missing or invalid X-API-Key." },
        401
      );
    }
    const ledger = await loadLedger(request, env, auth);
    const orders = filterOrders(ledger.state.orders, url);
    return jsonResponse({
      customer_id: ledger.state.customer_id,
      ledger_persisted: ledger.persisted,
      count: orders.length,
      filters: {
        product_code: url.searchParams.get("product_code") || null,
        domain: url.searchParams.get("domain") || null,
        status: url.searchParams.get("status") || null
      },
      orders,
      real_payment_executed: false,
      external_contact_executed: false
    });
  }

  if (request.method === "GET" && url.pathname.startsWith("/v1/orders/")) {
    const auth = await authenticateRequest(request, env);
    if (!auth.authorized) {
      return jsonResponse(
        { error: "unauthorized", message: "Missing or invalid X-API-Key." },
        401
      );
    }
    const orderIntentId = decodeURIComponent(url.pathname.replace("/v1/orders/", "")).trim();
    const ledger = await loadLedger(request, env, auth);
    const order = ledger.state.orders.find((item) => item.order_intent_id === orderIntentId);
    if (!order) {
      return jsonResponse(
        { error: "not_found", message: "Order not found." },
        404
      );
    }
    return jsonResponse({
      customer_id: ledger.state.customer_id,
      ledger_persisted: ledger.persisted,
      order,
      real_payment_executed: false,
      external_contact_executed: false
    });
  }

  if (request.method === "GET" && url.pathname === "/v1/admin/sandbox-metrics") {
    if (!isAdminAuthorized(request, env)) {
      return jsonResponse(
        { error: "unauthorized", message: "Missing or invalid admin X-API-Key." },
        401
      );
    }
    return jsonResponse(await buildSandboxMetrics(env));
  }

  if (request.method === "POST" && url.pathname === "/v1/beta/customers") {
    if (!isAdminAuthorized(request, env)) {
      return jsonResponse(
        { error: "unauthorized", message: "Missing or invalid admin X-API-Key." },
        401
      );
    }
    try {
      const body = await parseJson(request);
      return jsonResponse(await createBetaCustomer(body, request, env));
    } catch (error) {
      return jsonResponse(
        { error: "bad_request", message: error.message || "Invalid request." },
        400
      );
    }
  }

  if (
    (request.method === "GET" || request.method === "PATCH") &&
    url.pathname.startsWith("/v1/beta/customers/")
  ) {
    if (!isAdminAuthorized(request, env)) {
      return jsonResponse(
        { error: "unauthorized", message: "Missing or invalid admin X-API-Key." },
        401
      );
    }
    const customerId = decodeURIComponent(url.pathname.replace("/v1/beta/customers/", "")).trim();
    try {
      if (request.method === "GET") {
        return jsonResponse(await getBetaCustomerAdmin(customerId, env));
      }
      const body = await parseJson(request);
      return jsonResponse(await updateBetaCustomerAdmin(customerId, body, env));
    } catch (error) {
      return jsonResponse(
        { error: error.statusCode === 404 ? "not_found" : "bad_request", message: error.message || "Invalid request." },
        error.statusCode || 400
      );
    }
  }

  return jsonResponse(
    {
      error: "not_found",
      message: "Use GET /health, GET /openapi.json, POST /v1/sandbox/customers, GET /v1/usage, GET /v1/orders, GET /v1/admin/sandbox-metrics, POST /v1/beta/customers, GET/PATCH /v1/beta/customers/{customer_id}, POST /v1/lead-opportunity-score or POST /v1/purchase-intent."
    },
    404
  );
}
