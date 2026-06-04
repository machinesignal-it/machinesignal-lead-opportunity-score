import { mkdir, readFile, writeFile } from "node:fs/promises";

const utf8 = "utf8";

async function readJson(path) {
  const text = await readFile(path, utf8);
  return JSON.parse(text.replace(/^\uFEFF/, ""));
}

function bool(value) {
  return value === true;
}

function passFail(value) {
  return value ? "pass" : "fail";
}

function compactGate(id, label, ok, evidence, owner = "orchestratore") {
  return {
    id,
    label,
    status: passFail(ok),
    ok,
    evidence,
    owner_agent: owner
  };
}

const controlledBeta = await readJson("controlled_beta_operational_readiness_summary_20260603.json");
const preMonetization = await readJson("pre_monetization_readiness_control_20260603.json");
const paymentLive = await readJson("payment_test_mode_live_validation_summary_20260604.json");
const machineE2E = await readJson("machine_customer_e2e_live_test_summary_20260604.json");
const gateRunner = await readJson("controlled_beta_gate_runner_summary_20260604.json");
const selfServiceSale = await readJson("self_service_machine_buyer_sale_simulation_summary_20260604.json");

const allControlledChecksOk =
  bool(controlledBeta.ok) &&
  controlledBeta.checks.every((check) => bool(check.ok)) &&
  bool(controlledBeta.audit_summary?.reconciliation_ok) &&
  controlledBeta.audit_summary?.real_payment_executed === false &&
  controlledBeta.audit_summary?.external_contact_executed === false;

const machineE2EOk =
  machineE2E.status === "passed" &&
  bool(machineE2E.steps?.authenticated_onboarding?.ok) &&
  machineE2E.steps?.authenticated_onboarding?.primary_customer_interface === "machine" &&
  bool(machineE2E.steps?.target_discovery?.ok) &&
  bool(machineE2E.steps?.score?.ok) &&
  bool(machineE2E.steps?.deep_analysis?.ok) &&
  bool(machineE2E.steps?.action_pack?.ok) &&
  bool(machineE2E.steps?.payment_test_intent?.ok) &&
  bool(machineE2E.steps?.payment_test_webhook?.ok) &&
  bool(machineE2E.steps?.duplicate_webhook?.ok) &&
  bool(machineE2E.steps?.reconciliation?.reconciliation_ok) &&
  bool(machineE2E.steps?.admin_reports?.ok);

const paymentTestOk =
  paymentLive.status === "passed" &&
  paymentLive.live_checks?.live_mode_blocked_http_status === 400 &&
  bool(paymentLive.live_checks?.payment_test_created) &&
  bool(paymentLive.live_checks?.succeeded_webhook_accepted) &&
  bool(paymentLive.live_checks?.duplicate_webhook_no_double_credit) &&
  bool(paymentLive.live_checks?.reconciliation_ok) &&
  paymentLive.safety?.real_payment_executed === false &&
    paymentLive.safety?.real_invoice_issued === false &&
    paymentLive.safety?.live_provider_mode_allowed === false;

const gateRunnerOk =
  gateRunner.status === "passed" &&
  bool(gateRunner.readiness_gate?.ok) &&
  gateRunner.readiness_gate?.controlled_beta_status === "ready_for_controlled_beta" &&
  gateRunner.readiness_gate?.real_payment_status === "blocked_for_real_payments" &&
  gateRunner.safety?.real_payment_executed === false &&
  gateRunner.safety?.external_contact_executed === false &&
  gateRunner.safety?.real_invoice_issued === false &&
  bool(gateRunner.admin_reports?.audit_reconciliation_ok) &&
  Array.isArray(gateRunner.scenarios) &&
  gateRunner.scenarios.length >= 2 &&
  gateRunner.scenarios.every((scenario) => scenario.status === "passed");

const selfServiceSaleOk =
  selfServiceSale.status === "passed" &&
  selfServiceSale.customer_type === "sandbox" &&
  bool(selfServiceSale.readiness_gate?.ok) &&
  selfServiceSale.readiness_gate?.controlled_beta_status === "ready_for_controlled_beta" &&
  selfServiceSale.readiness_gate?.real_payment_status === "blocked_for_real_payments" &&
  bool(selfServiceSale.steps?.sandbox_created?.ok) &&
  bool(selfServiceSale.steps?.authenticated_onboarding?.ok) &&
  bool(selfServiceSale.steps?.target_discovery?.ok) &&
  bool(selfServiceSale.steps?.score?.ok) &&
  bool(selfServiceSale.steps?.deep_analysis?.ok) &&
  bool(selfServiceSale.steps?.action_pack?.ok) &&
  bool(selfServiceSale.steps?.payment_intent?.ok) &&
  bool(selfServiceSale.steps?.live_payment_mode_block?.ok) &&
  bool(selfServiceSale.steps?.payment_webhook?.ok) &&
  bool(selfServiceSale.steps?.duplicate_webhook?.ok) &&
  bool(selfServiceSale.steps?.reconciliation?.reconciliation_ok) &&
  selfServiceSale.safety?.real_payment_executed === false &&
  selfServiceSale.safety?.external_contact_executed === false &&
  selfServiceSale.safety?.real_invoice_issued === false &&
  bool(selfServiceSale.internal_admin_checks?.audit_reconciliation_ok) &&
  bool(selfServiceSale.internal_admin_checks?.payment_report_reconciliation_ok);

const realPaymentBlocked =
  preMonetization.ready_for_real_payments === false &&
  preMonetization.overall_status === "not_ready_for_real_payments" &&
  Array.isArray(preMonetization.non_negotiable_blockers) &&
  preMonetization.non_negotiable_blockers.length > 0;

const safetyOk =
  machineE2E.safety?.real_payment_executed === false &&
  machineE2E.safety?.external_contact_executed === false &&
  machineE2E.safety?.real_invoice_issued === false &&
  paymentLive.safety?.real_payment_executed === false &&
  paymentLive.safety?.external_contact_executed === false &&
  paymentLive.safety?.real_invoice_issued === false &&
  gateRunner.safety?.real_payment_executed === false &&
  gateRunner.safety?.external_contact_executed === false &&
  gateRunner.safety?.real_invoice_issued === false &&
  selfServiceSale.safety?.real_payment_executed === false &&
  selfServiceSale.safety?.external_contact_executed === false &&
  selfServiceSale.safety?.real_invoice_issued === false;

const gates = [
  compactGate(
    "G1",
    "Controlled beta operational flow",
    allControlledChecksOk,
    "Controlled beta readiness report passed all checks, ledger audit reconciled, no real payment/contact.",
    "Orchestratore, API Product Manager"
  ),
  compactGate(
    "G2",
    "Machine customer E2E flow",
    machineE2EOk,
    "Machine completed no-list discovery, scoring, deep analysis, action pack, payment test, reconciliation and admin reports.",
    "Orchestratore, Customer Success & Post-Sale Agent"
  ),
  compactGate(
    "G3",
    "Payment test mode",
    paymentTestOk,
    "Live mode blocked, test webhook accepted, duplicate webhook did not double-credit, no real invoice.",
    "Billing & Payment Ops Agent"
  ),
  compactGate(
    "G4",
    "Machine-first safety",
    safetyOk,
    "No external contact, no real payment, no real invoice in all latest live tests.",
    "Security & Abuse Guard Agent"
  ),
  compactGate(
    "G5",
    "Controlled beta gate runner",
    gateRunnerOk,
    "Readiness gate controlled a two-scenario beta test across legal and solar/installation personas.",
    "Orchestratore, Growth & Distribution, Scoring Optimizer"
  ),
  compactGate(
    "G6",
    "Self-service machine buyer",
    selfServiceSaleOk,
    "A buyer machine discovered the API publicly, created a sandbox key, bought beta deliverables and simulated checkout.",
    "Growth & Distribution, Billing & Payment Ops, Customer Success & Post-Sale"
  ),
  compactGate(
    "G7",
    "Real payment readiness",
    !realPaymentBlocked,
    "Real payments remain blocked by fiscal, legal, privacy, provider, invoicing and refund controls.",
    "Admin & Finance Controller, Legal & Compliance Agent"
  )
];

const controlledBetaReady = gates.slice(0, 6).every((gate) => gate.ok);
const realPaymentReady = gates.every((gate) => gate.ok) && preMonetization.ready_for_real_payments === true;

const dashboard = {
  service: "MachineSignal",
  report_type: "machine_readiness_dashboard",
  generated_at: new Date().toISOString(),
  primary_customer_interface: "machine",
  overall_recommendation: controlledBetaReady
    ? "proceed_with_controlled_beta_without_real_payments"
    : "do_not_expand_beta_until_failed_gates_are_fixed",
  controlled_beta_status: controlledBetaReady ? "ready_for_controlled_beta" : "not_ready_for_controlled_beta",
  real_payment_status: realPaymentReady ? "ready_for_real_payments" : "blocked_for_real_payments",
  real_payment_enabled: false,
  external_contact_enabled: false,
  human_supervision_target: "max_1_2_hours_per_day",
  human_supervision_required_today: controlledBetaReady
    ? "No technical action required today unless you want to approve the next controlled beta scenario."
    : "Review failed gates before continuing.",
  gates,
  latest_live_metrics: {
    machine_e2e_score: machineE2E.steps?.score?.opportunity_score,
    machine_e2e_decision: machineE2E.steps?.score?.decision,
    machine_e2e_commercial_strength: machineE2E.steps?.score?.commercial_strength_level,
    machine_e2e_orders_count: machineE2E.steps?.order_history?.count,
    payment_test_credits_activated: paymentLive.live_checks?.credits_activated,
    payment_test_live_mode_blocked_http_status: paymentLive.live_checks?.live_mode_blocked_http_status,
    controlled_beta_audit_reconciliation_ok: controlledBeta.audit_summary?.reconciliation_ok,
    controlled_beta_simulated_revenue_eur: controlledBeta.audit_summary?.simulated_revenue_eur,
    gate_runner_status: gateRunner.status,
    gate_runner_scenarios_passed: gateRunner.scenarios.filter((scenario) => scenario.status === "passed").length,
    gate_runner_order_count: gateRunner.admin_reports?.order_count,
    gate_runner_simulated_revenue_eur: gateRunner.admin_reports?.simulated_revenue_eur,
    self_service_sale_status: selfServiceSale.status,
    self_service_sale_customer_type: selfServiceSale.customer_type,
    self_service_sale_score: selfServiceSale.steps?.score?.opportunity_score,
    self_service_sale_decision: selfServiceSale.steps?.score?.decision,
    self_service_sale_orders_count: selfServiceSale.steps?.orders?.count,
    self_service_sale_payment_mode: selfServiceSale.steps?.payment_intent?.provider_mode,
    self_service_sale_credits_activated: selfServiceSale.steps?.payment_webhook?.credits_activated,
    self_service_sale_simulated_revenue_eur: selfServiceSale.internal_admin_checks?.simulated_revenue_eur
  },
  blockers_before_real_payment: preMonetization.non_negotiable_blockers,
  next_agent_actions: [
    {
      priority: 1,
      action: "Use the gate runner as the default pre-check before any new controlled beta scenario.",
      owner_agent: "Growth & Distribution, Scoring Optimizer, Data Scout",
      user_time_required: "none"
    },
    {
      priority: 2,
      action: "Keep payment mode locked to test/sandbox and monitor admin payment-test reports.",
      owner_agent: "Billing & Payment Ops Agent, Admin & Finance Controller",
      user_time_required: "none"
    },
    {
      priority: 3,
      action: "Prepare legal, fiscal and invoicing checklist for real payments, but do not enable checkout.",
      owner_agent: "Legal & Compliance Agent, Admin & Finance Controller",
      user_time_required: "approval only"
    }
  ],
  source_reports: {
    controlled_beta_operational_readiness:
      "https://machinesignal.it/controlled_beta_operational_readiness_summary_20260603.json",
    pre_monetization_readiness:
      "https://machinesignal.it/pre_monetization_readiness_control_20260603.json",
    payment_test_live_validation:
      "https://machinesignal.it/payment_test_mode_live_validation_summary_20260604.json",
    machine_customer_e2e_live_test:
      "https://machinesignal.it/machine_customer_e2e_live_test_summary_20260604.json",
    controlled_beta_gate_runner:
      "https://machinesignal.it/controlled_beta_gate_runner_summary_20260604.json",
    self_service_machine_buyer_sale_simulation:
      "https://machinesignal.it/self_service_machine_buyer_sale_simulation_summary_20260604.json"
  }
};

const markdown = `# MachineSignal Readiness Dashboard - 2026-06-04

## Status

Controlled beta: ${dashboard.controlled_beta_status}

Real payment: ${dashboard.real_payment_status}

Recommendation: ${dashboard.overall_recommendation}

## What this means

MachineSignal is technically ready to continue controlled beta tests with machines and agents.

It is not ready for real payments. Real checkout stays blocked until fiscal, legal, privacy, provider, invoicing and refund controls are complete.

## Gates

${dashboard.gates
  .map((gate) => `- ${gate.id} ${gate.label}: ${gate.status}. ${gate.evidence}`)
  .join("\n")}

## Latest live metrics

- Machine E2E score: ${dashboard.latest_live_metrics.machine_e2e_score}
- Machine E2E decision: ${dashboard.latest_live_metrics.machine_e2e_decision}
- Commercial strength: ${dashboard.latest_live_metrics.machine_e2e_commercial_strength}
- Machine E2E order count: ${dashboard.latest_live_metrics.machine_e2e_orders_count}
- Payment test credits activated: ${dashboard.latest_live_metrics.payment_test_credits_activated}
- Live payment mode blocked HTTP status: ${dashboard.latest_live_metrics.payment_test_live_mode_blocked_http_status}
- Controlled beta audit reconciliation: ${dashboard.latest_live_metrics.controlled_beta_audit_reconciliation_ok}
- Controlled beta simulated revenue EUR: ${dashboard.latest_live_metrics.controlled_beta_simulated_revenue_eur}
- Gate runner status: ${dashboard.latest_live_metrics.gate_runner_status}
- Gate runner scenarios passed: ${dashboard.latest_live_metrics.gate_runner_scenarios_passed}
- Gate runner order count: ${dashboard.latest_live_metrics.gate_runner_order_count}
- Gate runner simulated revenue EUR: ${dashboard.latest_live_metrics.gate_runner_simulated_revenue_eur}
- Self-service sale status: ${dashboard.latest_live_metrics.self_service_sale_status}
- Self-service sale customer type: ${dashboard.latest_live_metrics.self_service_sale_customer_type}
- Self-service sale score: ${dashboard.latest_live_metrics.self_service_sale_score}
- Self-service sale decision: ${dashboard.latest_live_metrics.self_service_sale_decision}
- Self-service sale orders: ${dashboard.latest_live_metrics.self_service_sale_orders_count}
- Self-service sale payment mode: ${dashboard.latest_live_metrics.self_service_sale_payment_mode}
- Self-service sale credits activated: ${dashboard.latest_live_metrics.self_service_sale_credits_activated}
- Self-service sale simulated revenue EUR: ${dashboard.latest_live_metrics.self_service_sale_simulated_revenue_eur}

## Human supervision

${dashboard.human_supervision_required_today}

## Next agent actions

${dashboard.next_agent_actions
  .map((item) => `- P${item.priority}: ${item.action} Owner: ${item.owner_agent}. User time: ${item.user_time_required}.`)
  .join("\n")}

## Blockers before real payment

${dashboard.blockers_before_real_payment.map((item) => `- ${item}`).join("\n")}
`;

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function displayStatus(value) {
  const labels = {
    ready_for_controlled_beta: "Ready",
    blocked_for_real_payments: "Blocked",
    proceed_with_controlled_beta_without_real_payments: "Proceed with controlled beta",
    passed: "Passed",
    failed: "Failed",
    review: "Review",
    blocked: "Blocked"
  };
  return labels[value] ?? String(value).replace(/_/g, " ");
}

function displayDecision(value) {
  const labels = {
    buy_deep_analysis: "Buy deep analysis",
    discard: "Discard",
    watchlist: "Watchlist",
    nurture: "Nurturing",
    request_verification: "Request verification"
  };
  return labels[value] ?? String(value).replace(/_/g, " ");
}

const gateRows = dashboard.gates
  .map(
    (gate) => `<tr>
      <td>${escapeHtml(gate.id)}</td>
      <td>${escapeHtml(gate.label)}</td>
      <td><span class="status ${gate.ok ? "pass" : "block"}">${escapeHtml(gate.status)}</span></td>
      <td>${escapeHtml(gate.evidence)}</td>
      <td>${escapeHtml(gate.owner_agent)}</td>
    </tr>`
  )
  .join("");

const actionRows = dashboard.next_agent_actions
  .map(
    (item) => `<tr>
      <td>${item.priority}</td>
      <td>${escapeHtml(item.action)}</td>
      <td>${escapeHtml(item.owner_agent)}</td>
      <td>${escapeHtml(item.user_time_required)}</td>
    </tr>`
  )
  .join("");

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>MachineSignal Readiness Dashboard</title>
  <style>
    :root {
      color-scheme: light;
      --ink: #142033;
      --muted: #58677c;
      --line: #d9e1ea;
      --surface: #f6f8fb;
      --green: #117865;
      --amber: #a46100;
      --red: #a62929;
      --blue: #245985;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: Arial, Helvetica, sans-serif;
      color: var(--ink);
      background: #ffffff;
      line-height: 1.45;
      overflow-x: hidden;
    }
    main {
      width: min(1120px, calc(100% - 32px));
      margin: 0 auto;
      padding: 28px 0 44px;
    }
    header {
      border-bottom: 1px solid var(--line);
      padding-bottom: 20px;
      margin-bottom: 22px;
    }
    .eyebrow {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0;
      color: var(--blue);
      font-weight: 700;
      margin-bottom: 6px;
    }
    h1 {
      font-size: 30px;
      line-height: 1.15;
      margin: 0 0 8px;
    }
    .sub {
      color: var(--muted);
      max-width: 760px;
      margin: 0;
      overflow-wrap: anywhere;
    }
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 12px;
      margin: 20px 0;
    }
    .metric {
      border: 1px solid var(--line);
      background: var(--surface);
      padding: 14px;
      min-height: 92px;
    }
    .metric span {
      display: block;
      color: var(--muted);
      font-size: 12px;
      text-transform: uppercase;
      margin-bottom: 8px;
    }
    .metric strong {
      display: block;
      font-size: 18px;
      overflow-wrap: anywhere;
      word-break: break-word;
    }
    .status {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      min-width: 44px;
      text-align: center;
      white-space: nowrap;
    }
    .pass { color: #ffffff; background: var(--green); }
    .block { color: #ffffff; background: var(--red); }
    .warn { color: #ffffff; background: var(--amber); }
    section {
      margin-top: 26px;
    }
    h2 {
      font-size: 18px;
      margin: 0 0 12px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid var(--line);
      font-size: 14px;
    }
    th, td {
      text-align: left;
      vertical-align: top;
      border-bottom: 1px solid var(--line);
      padding: 10px;
      overflow-wrap: anywhere;
      word-break: break-word;
    }
    th {
      background: var(--surface);
      color: var(--muted);
      font-size: 12px;
      text-transform: uppercase;
    }
    th:nth-child(3), td:nth-child(3) {
      width: 76px;
      overflow-wrap: normal;
      word-break: normal;
      white-space: nowrap;
    }
    .note {
      border-left: 4px solid var(--amber);
      background: #fff8ed;
      padding: 12px 14px;
      color: #332517;
      overflow-wrap: anywhere;
      word-break: break-word;
    }
    .links a {
      display: inline-block;
      margin-right: 14px;
      margin-bottom: 8px;
      color: var(--blue);
    }
    @media (max-width: 820px) {
      main {
        width: auto;
        max-width: 360px;
        margin-left: 10px;
        margin-right: 10px;
        padding-top: 18px;
      }
      header, section, .summary, .metric, .note, table {
        width: 100%;
        max-width: 100%;
      }
      .summary { grid-template-columns: minmax(0, 1fr); }
      table { font-size: 13px; }
      th, td { padding: 8px; }
    }
    @media (max-width: 560px) {
      .summary { grid-template-columns: 1fr; }
      h1 { font-size: 24px; }
      table, thead, tbody, th, td, tr { display: block; }
      thead { display: none; }
      td { border-bottom: 0; padding: 7px 10px; }
      tr { border-bottom: 1px solid var(--line); padding: 6px 0; }
    }
  </style>
</head>
<body>
  <main>
    <header>
      <div class="eyebrow">MachineSignal</div>
      <h1>Readiness Dashboard</h1>
      <p class="sub">Machine-first operational status for API Lead Opportunity Score. This dashboard separates controlled beta readiness from real payment readiness.</p>
    </header>

    <div class="summary">
      <div class="metric"><span>Controlled beta</span><strong>${escapeHtml(displayStatus(dashboard.controlled_beta_status))}</strong></div>
      <div class="metric"><span>Real payment</span><strong>${escapeHtml(displayStatus(dashboard.real_payment_status))}</strong></div>
      <div class="metric"><span>Latest score</span><strong>${dashboard.latest_live_metrics.machine_e2e_score} - ${escapeHtml(displayDecision(dashboard.latest_live_metrics.machine_e2e_decision))}</strong></div>
      <div class="metric"><span>Gate runner</span><strong>${dashboard.latest_live_metrics.gate_runner_scenarios_passed} scenarios passed</strong></div>
      <div class="metric"><span>Self-service sale</span><strong>${escapeHtml(displayStatus(dashboard.latest_live_metrics.self_service_sale_status))}</strong></div>
      <div class="metric"><span>Payment test</span><strong>${dashboard.latest_live_metrics.payment_test_credits_activated} credits activated</strong></div>
    </div>

    <section>
      <h2>Recommendation</h2>
      <p class="note">${escapeHtml(displayStatus(dashboard.overall_recommendation))}. Real payments remain blocked. Machines can continue controlled beta tests without human email outreach and without executing external contact.</p>
    </section>

    <section>
      <h2>Readiness Gates</h2>
      <table>
        <thead><tr><th>ID</th><th>Gate</th><th>Status</th><th>Evidence</th><th>Owner</th></tr></thead>
        <tbody>${gateRows}</tbody>
      </table>
    </section>

    <section>
      <h2>Next Agent Actions</h2>
      <table>
        <thead><tr><th>Priority</th><th>Action</th><th>Owner</th><th>User time</th></tr></thead>
        <tbody>${actionRows}</tbody>
      </table>
    </section>

    <section class="links">
      <h2>Machine Files</h2>
      <a href="/machine_readiness_dashboard_20260604.json">JSON dashboard</a>
      <a href="/machine_readiness_dashboard_20260604.md">Markdown dashboard</a>
      <a href="/machine_customer_e2e_live_test_summary_20260604.json">Latest E2E JSON</a>
      <a href="/controlled_beta_gate_runner_summary_20260604.json">Gate runner JSON</a>
      <a href="/self_service_machine_buyer_sale_simulation_summary_20260604.json">Self-service sale JSON</a>
      <a href="/payment_test_mode_live_validation_summary_20260604.json">Payment test JSON</a>
      <a href="/llms.txt">llms.txt</a>
    </section>
  </main>
</body>
</html>
`;

await mkdir("readiness-dashboard", { recursive: true });
await writeFile("machine_readiness_dashboard_20260604.json", JSON.stringify(dashboard, null, 2), utf8);
await writeFile("machine_readiness_dashboard_20260604.md", markdown, utf8);
await writeFile("readiness-dashboard/index.html", html, utf8);
await writeFile("readiness-dashboard/readiness.json", JSON.stringify(dashboard, null, 2), utf8);

console.log(
  JSON.stringify(
    {
      status: dashboard.controlled_beta_status,
      real_payment_status: dashboard.real_payment_status,
      recommendation: dashboard.overall_recommendation
    },
    null,
    2
  )
);
