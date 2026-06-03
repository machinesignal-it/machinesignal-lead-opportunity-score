#!/usr/bin/env python3
"""
MachineSignal Integration Ready external-agent test.

This script simulates an external buyer machine that starts from the public
Integration Ready page, reads public discovery contracts and then runs the beta
API flow with a limited sandbox key.
"""

from __future__ import annotations

import html.parser
import json
import re
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime
from pathlib import Path
from typing import Any


REPO_DIR = Path(__file__).resolve().parent
OUTPUT_DIR = Path(r"C:\Users\natal\AppData\Local\Temp\MachineSignal\integration_ready_external_agent_20260603")
REPORT_PATH = REPO_DIR / "integration_ready_external_agent_readout_20260603.md"
SUMMARY_PATH = REPO_DIR / "integration_ready_external_agent_summary_20260603.json"

SITE_BASE = "https://machinesignal.it"
API_BASE = "https://machinesignal-api.beta-878.workers.dev"
INTEGRATION_READY_URL = f"{SITE_BASE}/integration-ready/"

SECRET_KEYS = {
    "api_key",
    "customer_api_key",
    "admin_api_key",
    "x-api-key",
    "token",
    "secret",
    "password",
}


class LinkParser(html.parser.HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.links: list[str] = []
        self.titles: list[str] = []
        self.headings: list[str] = []
        self._current_tag: str | None = None
        self._buffer: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attrs_dict = dict(attrs)
        href = attrs_dict.get("href")
        if href:
            self.links.append(urllib.parse.urljoin(SITE_BASE, href))
        if tag in {"title", "h1", "h2"}:
            self._current_tag = tag
            self._buffer = []

    def handle_endtag(self, tag: str) -> None:
        if tag == self._current_tag:
            text = " ".join("".join(self._buffer).split())
            if tag == "title" and text:
                self.titles.append(text)
            if tag in {"h1", "h2"} and text:
                self.headings.append(text)
            self._current_tag = None
            self._buffer = []

    def handle_data(self, data: str) -> None:
        if self._current_tag:
            self._buffer.append(data)


def parse_payload(raw: str) -> Any:
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return raw


def request(
    method: str,
    url: str,
    payload: dict[str, Any] | None = None,
    api_key: str | None = None,
    idempotency_key: str | None = None,
    timeout: int = 30,
) -> tuple[int, Any, dict[str, Any]]:
    headers = {
        "Accept": "application/json,text/html,text/plain,*/*",
        "User-Agent": "MachineSignalExternalAgent/2026-06-03",
    }
    method_upper = method.upper()
    body = None
    if payload is not None and method_upper not in {"GET", "HEAD"}:
        body = json.dumps(payload).encode("utf-8")
        headers["Content-Type"] = "application/json"
    if api_key:
        headers["X-API-Key"] = api_key
    if idempotency_key:
        headers["Idempotency-Key"] = idempotency_key
    if method_upper == "GET" and payload:
        query = urllib.parse.urlencode({k: v for k, v in payload.items() if v is not None})
        if query:
            url = f"{url}?{query}"

    req = urllib.request.Request(url, data=body, headers=headers, method=method_upper)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as response:
            raw = response.read().decode("utf-8", errors="replace")
            return int(response.status), parse_payload(raw), dict(response.headers)
    except urllib.error.HTTPError as exc:
        raw = exc.read().decode("utf-8", errors="replace")
        return int(exc.code), parse_payload(raw), dict(exc.headers)
    except urllib.error.URLError as exc:
        return 599, {"error": "url_error", "message": str(exc)}, {}


def safe_get(mapping: Any, *keys: str, default: Any = None) -> Any:
    cur = mapping
    for key in keys:
        if not isinstance(cur, dict):
            return default
        cur = cur.get(key)
    return default if cur is None else cur


def mask_secret(value: Any) -> Any:
    if not isinstance(value, str):
        return value
    if len(value) <= 12:
        return value[:3] + "..."
    return value[:10] + "..." + value[-4:]


def redact(value: Any) -> Any:
    if isinstance(value, dict):
        clean: dict[str, Any] = {}
        for key, item in value.items():
            key_lower = key.lower()
            if key_lower in SECRET_KEYS or key_lower.endswith("_key"):
                clean[key] = mask_secret(item)
            else:
                clean[key] = redact(item)
        return clean
    if isinstance(value, list):
        return [redact(item) for item in value]
    return value


def first_sample_targets(purchase_payload: dict[str, Any]) -> list[dict[str, Any]]:
    candidates: list[dict[str, Any]] = []
    paths = [
        ("delivery", "beta_sample_targets"),
        ("order", "delivery", "beta_sample_targets"),
        ("payload", "delivery", "beta_sample_targets"),
        ("payload", "order", "delivery", "beta_sample_targets"),
    ]
    for path in paths:
        samples = safe_get(purchase_payload, *path, default=[])
        if isinstance(samples, list):
            for sample in samples:
                if isinstance(sample, dict) and sample.get("domain"):
                    candidates.append(sample)
    seen: set[str] = set()
    deduped: list[dict[str, Any]] = []
    for candidate in candidates:
        domain = str(candidate.get("domain"))
        if domain not in seen:
            seen.add(domain)
            deduped.append(candidate)
    return deduped


def recommended_product(score_payload: dict[str, Any]) -> str | None:
    product = safe_get(score_payload, "next_purchase", "next_product")
    if product:
        return str(product)
    decision = score_payload.get("decision")
    if decision == "buy_deep_analysis":
        return "deep_analysis"
    if decision == "nurture":
        return "nurture_signal"
    if decision == "needs_verification":
        return "verification"
    return None


def balance_used(usage: dict[str, Any], product_code: str) -> int:
    balances = usage.get("balances") if isinstance(usage, dict) else []
    if not isinstance(balances, list):
        return 0
    for balance in balances:
        if isinstance(balance, dict) and balance.get("product_code") == product_code:
            return int(balance.get("credits_used") or 0)
    return 0


class ExternalAgentTest:
    def __init__(self) -> None:
        self.stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        self.run_id = f"integration-ready-external-agent-{self.stamp}-{int(time.time())}"
        self.checks: list[dict[str, Any]] = []
        self.actions: list[dict[str, Any]] = []
        self.decisions: list[dict[str, Any]] = []
        self.public_resources: dict[str, Any] = {}
        self.api_key = ""
        self.scores: list[dict[str, Any]] = []
        self.orders: list[dict[str, Any]] = []

    def check(self, name: str, ok: bool, details: str = "") -> None:
        self.checks.append({"name": name, "ok": bool(ok), "details": details})

    def action(self, name: str, status: int, ok: bool, details: str = "") -> None:
        self.actions.append({"name": name, "status": status, "ok": bool(ok), "details": details})

    def decide(self, decision: str, reason: str, action: str) -> None:
        self.decisions.append({"decision": decision, "reason": reason, "action": action})

    def api_call(
        self,
        method: str,
        path: str,
        payload: dict[str, Any] | None = None,
        idempotency_key: str | None = None,
    ) -> tuple[int, Any]:
        status, body, _ = request(
            method,
            f"{API_BASE}{path}",
            payload=payload,
            api_key=self.api_key or None,
            idempotency_key=idempotency_key,
        )
        return status, body

    def read_public_contracts(self) -> None:
        status, html, _ = request("GET", INTEGRATION_READY_URL)
        page_ok = status == 200 and isinstance(html, str) and "Integration Ready" in html
        self.check("integration_ready_page_read", page_ok, f"HTTP {status}")
        if not isinstance(html, str):
            html = ""
        parser = LinkParser()
        parser.feed(html)
        self.public_resources["integration_ready"] = {
            "status": status,
            "title": parser.titles[0] if parser.titles else None,
            "headings": parser.headings,
            "links": parser.links,
        }
        expected_links = {
            f"{SITE_BASE}/integration-partner-pack.json",
            f"{SITE_BASE}/mcp-machine-client-installation-pack.json",
            f"{SITE_BASE}/openapi.json",
        }
        self.check(
            "integration_ready_has_machine_links",
            expected_links.issubset(set(parser.links)),
            f"{len(parser.links)} links found",
        )

        resource_urls = {
            "llms": f"{SITE_BASE}/llms.txt",
            "robots": f"{SITE_BASE}/robots.txt",
            "sitemap": f"{SITE_BASE}/sitemap.xml",
            "well_known_machine_discovery": f"{SITE_BASE}/.well-known/machine-discovery.json",
            "machine_discovery_pack": f"{SITE_BASE}/machine-discovery/machine-discovery-pack.json",
            "integration_partner_pack": f"{SITE_BASE}/integration-partner-pack.json",
            "mcp_installation_pack": f"{SITE_BASE}/mcp-machine-client-installation-pack.json",
            "product_catalog": f"{SITE_BASE}/product-catalog.json",
            "openapi": f"{SITE_BASE}/openapi.json",
        }
        for name, url in resource_urls.items():
            status, body, _ = request("GET", url)
            ok = status == 200
            self.action(f"GET {name}", status, ok, url)
            self.public_resources[name] = body

        self.check(
            "llms_links_integration_ready",
            isinstance(self.public_resources.get("llms"), str)
            and "https://machinesignal.it/integration-ready/" in self.public_resources["llms"],
            "llms.txt contains integration-ready URL",
        )
        self.check(
            "robots_links_integration_ready",
            isinstance(self.public_resources.get("robots"), str)
            and "Integration-ready" in self.public_resources["robots"],
            "robots.txt contains Integration-ready directive",
        )
        self.check(
            "sitemap_links_integration_ready",
            isinstance(self.public_resources.get("sitemap"), str)
            and "https://machinesignal.it/integration-ready/" in self.public_resources["sitemap"],
            "sitemap contains integration-ready URL",
        )
        self.check(
            "well_known_links_integration_ready",
            safe_get(self.public_resources.get("well_known_machine_discovery"), "discovery", "integration_ready_page")
            == INTEGRATION_READY_URL,
            "well-known discovery includes integration_ready_page",
        )
        self.check(
            "integration_pack_has_three_cases",
            len(safe_get(self.public_resources.get("integration_partner_pack"), "integration_cases", default={})) == 3,
            "existing list, no list and action payload cases present",
        )
        self.check(
            "openapi_has_core_paths",
            all(
                path in safe_get(self.public_resources.get("openapi"), "paths", default={})
                for path in [
                    "/v1/sandbox/customers",
                    "/v1/lead-opportunity-score",
                    "/v1/purchase-intent",
                    "/v1/orders",
                ]
            ),
            "core protected paths present",
        )

    def create_sandbox(self) -> None:
        self.decide(
            "create_sandbox_customer",
            "The external machine has no private beta key yet and should test without a human sales conversation.",
            "POST /v1/sandbox/customers",
        )
        status, payload, _ = request(
            "POST",
            f"{API_BASE}/v1/sandbox/customers",
            payload={
                "evaluator_type": "external_ai_agent",
                "integration_target": "CRM workflow reading Integration Ready page",
                "expected_test_path": "integration_ready_discover_test_score_purchase_orders",
            },
            idempotency_key=f"{self.run_id}-sandbox",
        )
        ok = status == 200 and isinstance(payload, dict) and bool(payload.get("api_key"))
        self.action("POST sandbox customer", status, ok, "limited sandbox key created" if ok else str(payload))
        self.check("sandbox_customer_created", ok, f"HTTP {status}")
        if not ok:
            raise RuntimeError(f"Sandbox creation failed: HTTP {status} {payload}")
        self.api_key = str(payload["api_key"])
        self.public_resources["sandbox_customer"] = redact(payload)

    def run_existing_list_score(self) -> None:
        self.decide(
            "score_existing_list",
            "The machine has one known CRM domain and needs a routing decision before spending.",
            "POST /v1/lead-opportunity-score",
        )
        status, score = self.api_call(
            "POST",
            "/v1/lead-opportunity-score",
            {
                "domain": "studio-odontoiatrico-demo.it",
                "sector_hint": "dentist",
                "country_hint": "IT",
                "target_name": "Studio Odontoiatrico Demo",
                "area": "Lombardia",
                "commercial_objective": "prioritize dentist websites worth reviewing for website-led commercial opportunity and CRM-ready follow-up preparation",
                "initial_signals": ["existing_crm_record", "sector_match", "business_domain_present"],
            },
            f"{self.run_id}-existing-list-score",
        )
        ok = status == 200 and isinstance(score, dict) and bool(score.get("decision"))
        self.action("POST score existing list", status, ok, f"decision={score.get('decision') if isinstance(score, dict) else None}")
        self.check("existing_list_score_returned_decision", ok, f"HTTP {status}")
        if isinstance(score, dict):
            self.scores.append({"source": "existing_list", **redact(score)})

    def run_no_list_and_optional_addons(self) -> None:
        self.decide(
            "buy_target_discovery",
            "The machine has no starting list, so it asks for targets bound to a market, area and commercial objective.",
            "POST /v1/purchase-intent product_code=target_discovery",
        )
        status, target_order = self.api_call(
            "POST",
            "/v1/purchase-intent",
            {
                "product_code": "target_discovery",
                "market": "dentists_odontoiatric_clinics",
                "area": "Lombardia",
                "commercial_objective": "find dentist and odontoiatric clinic domains worth scoring for website-led commercial opportunity and CRM-ready follow-up preparation",
                "reason": "External buyer machine has no starting list and needs a target discovery delivery before scoring.",
                "batch_id": self.run_id,
            },
            f"{self.run_id}-target-discovery",
        )
        target_ok = status == 200 and isinstance(target_order, dict)
        self.action("POST target discovery", status, target_ok, "target_discovery")
        self.check("target_discovery_order_created", target_ok, f"HTTP {status}")
        if isinstance(target_order, dict):
            self.orders.append(redact(target_order))

        sample_targets = first_sample_targets(target_order if isinstance(target_order, dict) else {})
        self.check("target_discovery_returned_samples", len(sample_targets) > 0, f"{len(sample_targets)} samples")
        selected_score: dict[str, Any] | None = None

        for index, sample in enumerate(sample_targets[:3], start=1):
            domain = str(sample.get("domain"))
            self.decide(
                "score_discovered_target",
                "Target Discovery only produces candidates; the machine still needs a score decision.",
                f"POST /v1/lead-opportunity-score for {domain}",
            )
            status, score = self.api_call(
                "POST",
                "/v1/lead-opportunity-score",
                {
                    "domain": domain,
                    "sector_hint": "dentist",
                    "country_hint": "IT",
                    "target_name": sample.get("target_name"),
                    "category_hint": sample.get("category"),
                    "area": sample.get("area"),
                    "region": "Lombardia",
                    "initial_signals": sample.get("initial_signals"),
                    "commercial_objective": "website-led commercial opportunity and CRM-ready follow-up preparation",
                },
                f"{self.run_id}-discovered-score-{index}",
            )
            ok = status == 200 and isinstance(score, dict) and bool(score.get("decision"))
            self.action("POST score discovered target", status, ok, domain)
            self.check(f"discovered_target_{index}_score_returned_decision", ok, f"HTTP {status}")
            if isinstance(score, dict):
                self.scores.append({"source": "target_discovery", **redact(score)})
                if recommended_product(score) == "deep_analysis" and selected_score is None:
                    selected_score = score
                    break
                if selected_score is None:
                    selected_score = score

        if not selected_score:
            return

        next_product = recommended_product(selected_score)
        allowed = safe_get(selected_score, "commercial_strength", "allowed_next_products", default=[])
        can_buy_deep = next_product == "deep_analysis" and (
            "deep_analysis" in allowed or safe_get(selected_score, "commercial_strength", "level") in {"medium", "strong"}
        )
        self.check(
            "machine_spend_policy_read_before_addon",
            next_product is None or isinstance(allowed, list),
            f"next_product={next_product}; allowed={allowed}",
        )

        if not can_buy_deep:
            self.decide(
                "safe_stop_no_deep_analysis",
                "The score response did not permit a Deep Analysis purchase.",
                "do not buy paid addon",
            )
            return

        self.decide(
            "buy_recommended_deep_analysis",
            "The score response recommends Deep Analysis and the spend policy allows bounded spend.",
            "POST /v1/purchase-intent product_code=deep_analysis",
        )
        deep_status, deep = self.api_call(
            "POST",
            "/v1/purchase-intent",
            {
                "product_code": "deep_analysis",
                "domain": selected_score.get("domain"),
                "source_score_request_id": f"{self.run_id}-selected-discovered-score",
                "reason": "Score response recommended Deep Analysis before any CRM or campaign action.",
                "max_budget_eur": 3,
            },
            f"{self.run_id}-deep-analysis",
        )
        deep_ok = deep_status == 200 and isinstance(deep, dict) and deep.get("product_code") == "deep_analysis"
        self.action("POST deep analysis", deep_status, deep_ok, f"domain={selected_score.get('domain')}")
        self.check("recommended_deep_analysis_bought", deep_ok, f"HTTP {deep_status}")
        if isinstance(deep, dict):
            self.orders.append(redact(deep))

        deep_recommends_action = safe_get(deep, "delivery", "recommended_next_step", "product_code") == "action_pack"
        compliance_gate_available = True
        if deep_ok and deep_recommends_action and compliance_gate_available:
            self.decide(
                "buy_action_pack_after_deep_analysis",
                "Deep Analysis recommends Action Pack and the simulated customer machine has a compliance gate.",
                "POST /v1/purchase-intent product_code=action_pack",
            )
            action_status, action_pack = self.api_call(
                "POST",
                "/v1/purchase-intent",
                {
                    "product_code": "action_pack",
                    "domain": selected_score.get("domain"),
                    "source_score_request_id": f"{self.run_id}-selected-discovered-score",
                    "source_order_intent_id": safe_get(deep, "order_intent_id"),
                    "reason": "Deep Analysis recommended Action Pack and compliance gate is available.",
                    "max_budget_eur": 10,
                },
                f"{self.run_id}-action-pack",
            )
            action_ok = (
                action_status == 200
                and isinstance(action_pack, dict)
                and action_pack.get("product_code") == "action_pack"
            )
            self.action("POST action pack", action_status, action_ok, f"domain={selected_score.get('domain')}")
            self.check("action_pack_bought_after_deep_analysis", action_ok, f"HTTP {action_status}")
            if isinstance(action_pack, dict):
                self.orders.append(redact(action_pack))
        else:
            self.decide(
                "safe_stop_no_action_pack",
                "Deep Analysis did not recommend Action Pack or no compliance gate was available.",
                "do not buy action_pack",
            )

    def finalize(self) -> dict[str, Any]:
        onboarding_status, onboarding = self.api_call("GET", "/v1/onboarding")
        self.action("GET onboarding", onboarding_status, onboarding_status == 200, "customer onboarding")
        self.check("customer_onboarding_read", onboarding_status == 200 and isinstance(onboarding, dict), f"HTTP {onboarding_status}")

        orders_status, orders_payload = self.api_call("GET", "/v1/orders")
        orders = safe_get(orders_payload, "orders", default=[]) if isinstance(orders_payload, dict) else []
        self.action("GET orders", orders_status, orders_status == 200, f"orders={len(orders) if isinstance(orders, list) else 0}")
        self.check("orders_retrieved", orders_status == 200 and isinstance(orders, list), f"HTTP {orders_status}")

        usage_status, usage = self.api_call("GET", "/v1/usage")
        self.action("GET usage", usage_status, usage_status == 200, "usage")
        self.check("usage_retrieved", usage_status == 200 and isinstance(usage, dict), f"HTTP {usage_status}")

        real_payment = safe_get(usage, "real_payment_executed") if isinstance(usage, dict) else None
        external_contact = safe_get(usage, "external_contact_executed") if isinstance(usage, dict) else None
        self.check("no_real_payment_executed", real_payment is False, str(real_payment))
        self.check("no_external_contact_executed", external_contact is False, str(external_contact))

        ordered_products = [
            order.get("product_code")
            for order in (orders if isinstance(orders, list) else [])
            if isinstance(order, dict)
        ]
        score_summaries = [
            {
                "source": score.get("source"),
                "domain": score.get("domain"),
                "opportunity_score": score.get("opportunity_score"),
                "confidence": score.get("confidence"),
                "decision": score.get("decision"),
                "commercial_strength": safe_get(score, "commercial_strength", "level"),
                "next_product": safe_get(score, "next_purchase", "next_product"),
            }
            for score in self.scores
        ]
        result = {
            "ok": all(item["ok"] for item in self.checks),
            "test_name": "integration_ready_external_agent_test",
            "finished_at": datetime.now().isoformat(timespec="seconds"),
            "run_id": self.run_id,
            "entry_point": INTEGRATION_READY_URL,
            "public_resources": self.compact_public_resources(),
            "decisions": self.decisions,
            "actions": self.actions,
            "checks": self.checks,
            "score_summaries": score_summaries,
            "ordered_products": ordered_products,
            "orders_count": len(orders) if isinstance(orders, list) else 0,
            "usage": redact(usage),
            "credits_used": {
                "scores": balance_used(usage if isinstance(usage, dict) else {}, "score_pack_1k"),
                "target_discovery": balance_used(usage if isinstance(usage, dict) else {}, "target_discovery_pack_250"),
                "deep_analysis": balance_used(usage if isinstance(usage, dict) else {}, "deep_analysis_pack_100"),
                "action_pack": balance_used(usage if isinstance(usage, dict) else {}, "action_pack_25"),
            },
            "real_payment_executed": real_payment,
            "external_contact_executed": external_contact,
        }
        return redact(result)

    def run(self) -> dict[str, Any]:
        self.read_public_contracts()
        self.create_sandbox()
        self.run_existing_list_score()
        self.run_no_list_and_optional_addons()
        return self.finalize()

    def compact_public_resources(self) -> dict[str, Any]:
        integration_ready = self.public_resources.get("integration_ready")
        if not isinstance(integration_ready, dict):
            integration_ready = {}
        integration_pack = self.public_resources.get("integration_partner_pack")
        openapi = self.public_resources.get("openapi")
        return {
            "integration_ready": {
                "status": integration_ready.get("status"),
                "title": integration_ready.get("title"),
                "headings": integration_ready.get("headings"),
                "link_count": len(integration_ready.get("links") or []),
            },
            "public_contracts_read": [
                name
                for name in [
                    "llms",
                    "robots",
                    "sitemap",
                    "well_known_machine_discovery",
                    "machine_discovery_pack",
                    "integration_partner_pack",
                    "mcp_installation_pack",
                    "product_catalog",
                    "openapi",
                ]
                if name in self.public_resources
            ],
            "integration_cases": list(
                safe_get(integration_pack, "integration_cases", default={}).keys()
            )
            if isinstance(integration_pack, dict)
            else [],
            "openapi_core_paths": [
                path
                for path in [
                    "/v1/sandbox/customers",
                    "/v1/lead-opportunity-score",
                    "/v1/purchase-intent",
                    "/v1/orders",
                ]
                if isinstance(openapi, dict) and path in safe_get(openapi, "paths", default={})
            ],
        }


def build_report(result: dict[str, Any]) -> str:
    def ok_text(value: bool) -> str:
        return "OK" if value else "FAIL"

    lines = [
        "# MachineSignal - Integration Ready External Agent Test",
        "",
        f"Finished at: {result['finished_at']}",
        "",
        "## Result",
        "",
        f"Status: {'passed' if result['ok'] else 'failed'}",
        "",
        "This test simulates an external machine customer. It starts from the public Integration Ready page, reads public contracts and executes the beta API flow without human email outreach.",
        "",
        f"Entry point: {result['entry_point']}",
        "",
        "## Machine Decisions",
        "",
        "| Decision | Reason | Action |",
        "|---|---|---|",
    ]
    for decision in result["decisions"]:
        lines.append(f"| {decision['decision']} | {decision['reason']} | {decision['action']} |")

    lines.extend(
        [
            "",
            "## HTTP Actions",
            "",
            "| Action | HTTP | Result | Details |",
            "|---|---:|---|---|",
        ]
    )
    for action in result["actions"]:
        lines.append(
            f"| {action['name']} | {action['status']} | {ok_text(action['ok'])} | {action.get('details', '')} |"
        )

    lines.extend(
        [
            "",
            "## Score Summary",
            "",
        ]
    )
    for score in result["score_summaries"]:
        lines.append(
            f"- `{score.get('domain')}` from `{score.get('source')}`: score `{score.get('opportunity_score')}`, confidence `{score.get('confidence')}`, decision `{score.get('decision')}`, strength `{score.get('commercial_strength')}`, next `{score.get('next_product')}`"
        )

    lines.extend(
        [
            "",
            "## Orders And Credits",
            "",
            f"- Orders retrieved: `{result['orders_count']}`",
            f"- Ordered products: `{', '.join(result['ordered_products']) if result['ordered_products'] else 'none'}`",
            f"- Score credits used: `{result['credits_used']['scores']}`",
            f"- Target Discovery credits used: `{result['credits_used']['target_discovery']}`",
            f"- Deep Analysis credits used: `{result['credits_used']['deep_analysis']}`",
            f"- Action Pack credits used: `{result['credits_used']['action_pack']}`",
            "",
            "## Checks",
            "",
            "| Check | Result | Details |",
            "|---|---|---|",
        ]
    )
    for check in result["checks"]:
        lines.append(f"| {check['name']} | {ok_text(check['ok'])} | {check.get('details', '')} |")

    lines.extend(
        [
            "",
            "## Guardrails",
            "",
            f"- Real payment executed: `{result['real_payment_executed']}`",
            f"- External contact executed: `{result['external_contact_executed']}`",
            "- The report does not expose full API keys.",
            "- The test did not send email or contact external targets.",
            "",
            "## Interpretation",
            "",
            "The result validates the machine-to-machine entry path: an external software client can start from the public Integration Ready page, discover the API contract, create a sandbox key, score targets, buy only permitted beta deliverables and retrieve usage/orders.",
        ]
    )
    return "\n".join(lines) + "\n"


def main() -> int:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    test = ExternalAgentTest()
    result = test.run()
    local_summary = OUTPUT_DIR / f"integration_ready_external_agent_summary_{test.stamp}.json"
    local_report = OUTPUT_DIR / f"integration_ready_external_agent_report_{test.stamp}.md"
    result["summary_path"] = str(local_summary)
    result["report_path"] = str(local_report)
    result["repo_summary_path"] = str(SUMMARY_PATH)
    result["repo_report_path"] = str(REPORT_PATH)
    report = build_report(result)
    local_summary.write_text(json.dumps(result, indent=2, ensure_ascii=False), encoding="utf-8")
    local_report.write_text(report, encoding="utf-8")
    SUMMARY_PATH.write_text(json.dumps(result, indent=2, ensure_ascii=False), encoding="utf-8")
    REPORT_PATH.write_text(report, encoding="utf-8")
    print(json.dumps(result, indent=2, ensure_ascii=False))
    return 0 if result["ok"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
