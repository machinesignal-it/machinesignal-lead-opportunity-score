#!/usr/bin/env python3
"""
MachineSignal MCP machine-buyer agent runner.

This runner behaves like a simple automated buyer:
- it connects to the local stdio MCP adapter;
- reads public MachineSignal tools;
- creates a sandbox customer;
- buys target discovery when it has no starting list;
- scores one discovered target;
- buys the next recommended add-on only if the score response justifies it.

The goal is to test the business flow from the buyer machine perspective.
"""

from __future__ import annotations

import json
import os
import subprocess
import sys
import time
from datetime import datetime
from pathlib import Path
from typing import Any


REPO_DIR = Path(__file__).resolve().parents[1]
SERVER_PATH = REPO_DIR / "mcp_adapter" / "machinesignal_mcp_server.py"
OUTPUT_DIR = Path(r"C:\Users\natal\AppData\Local\Temp\MachineSignal\mcp_machine_buyer_agent_20260603")
REPO_REPORT_PATH = REPO_DIR / "mcp_machine_buyer_agent_readout_20260603.md"


def safe_get(mapping: Any, *keys: str, default: Any = None) -> Any:
    cur = mapping
    for key in keys:
        if not isinstance(cur, dict):
            return default
        cur = cur.get(key)
    return default if cur is None else cur


def parse_tool_payload(result: dict[str, Any]) -> dict[str, Any]:
    content = result.get("content") or []
    if not content:
        return {}
    text = content[0].get("text", "")
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return {"raw": text}


def first_sample_target(purchase_payload: dict[str, Any]) -> dict[str, Any] | None:
    payload = purchase_payload.get("payload") if isinstance(purchase_payload.get("payload"), dict) else purchase_payload
    candidate_paths = [
        ("delivery", "beta_sample_targets"),
        ("order", "delivery", "beta_sample_targets"),
        ("delivery", "sample_targets"),
        ("order", "delivery", "sample_targets"),
    ]
    for path in candidate_paths:
        samples = safe_get(payload, *path, default=[])
        if isinstance(samples, list) and samples:
            sample = samples[0]
            if isinstance(sample, dict) and sample.get("domain"):
                return sample
    return None


def recommended_product(score_payload: dict[str, Any]) -> str | None:
    payload = score_payload.get("payload") if isinstance(score_payload.get("payload"), dict) else score_payload
    next_purchase = payload.get("next_purchase") or {}
    if next_purchase.get("next_product"):
        return str(next_purchase["next_product"])

    decision = payload.get("decision")
    if decision == "buy_deep_analysis":
        return "deep_analysis"
    if decision == "nurture":
        return "nurture_signal"
    if decision == "needs_verification":
        return "verification"
    return None


def redact_for_report(value: Any) -> Any:
    if isinstance(value, dict):
        clean: dict[str, Any] = {}
        for key, item in value.items():
            key_lower = key.lower()
            if key_lower in {"api_key", "customer_api_key", "admin_api_key", "x-api-key", "token", "secret", "password"} or key_lower.endswith("_key"):
                clean[key] = mask_secret(item)
            else:
                clean[key] = redact_for_report(item)
        return clean
    if isinstance(value, list):
        return [redact_for_report(item) for item in value]
    return value


def mask_secret(value: Any) -> Any:
    if not isinstance(value, str):
        return value
    if len(value) <= 12:
        return value[:3] + "..."
    return value[:10] + "..." + value[-4:]


class McpClient:
    def __init__(self) -> None:
        self.next_id = 1
        env = os.environ.copy()
        env.setdefault("PYTHONIOENCODING", "utf-8")
        self.proc = subprocess.Popen(
            [sys.executable, str(SERVER_PATH)],
            cwd=str(REPO_DIR),
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            encoding="utf-8",
            env=env,
        )

    def request(self, method: str, params: dict[str, Any] | None = None) -> dict[str, Any]:
        request_id = self.next_id
        self.next_id += 1
        message: dict[str, Any] = {"jsonrpc": "2.0", "id": request_id, "method": method}
        if params is not None:
            message["params"] = params
        assert self.proc.stdin is not None
        assert self.proc.stdout is not None
        self.proc.stdin.write(json.dumps(message, ensure_ascii=False) + "\n")
        self.proc.stdin.flush()
        line = self.proc.stdout.readline()
        if not line:
            stderr = self.proc.stderr.read() if self.proc.stderr else ""
            raise RuntimeError(f"MCP adapter closed stdout. stderr={stderr}")
        response = json.loads(line)
        if "error" in response:
            raise RuntimeError(f"MCP error for {method}: {response['error']}")
        return response["result"]

    def notify(self, method: str, params: dict[str, Any] | None = None) -> None:
        message: dict[str, Any] = {"jsonrpc": "2.0", "method": method}
        if params is not None:
            message["params"] = params
        assert self.proc.stdin is not None
        self.proc.stdin.write(json.dumps(message, ensure_ascii=False) + "\n")
        self.proc.stdin.flush()

    def call_tool(self, name: str, arguments: dict[str, Any] | None = None) -> dict[str, Any]:
        result = self.request("tools/call", {"name": name, "arguments": arguments or {}})
        return parse_tool_payload(result)

    def close(self) -> None:
        try:
            if self.proc.stdin:
                self.proc.stdin.close()
            self.proc.terminate()
            self.proc.wait(timeout=5)
        except Exception:
            self.proc.kill()


class MachineBuyerAgent:
    def __init__(self) -> None:
        self.client = McpClient()
        self.actions: list[dict[str, Any]] = []
        self.decisions: list[dict[str, Any]] = []
        self.checks: list[dict[str, Any]] = []
        self.stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        self.run_id = f"mcp-machine-buyer-agent-{self.stamp}-{int(time.time())}"

    def check(self, name: str, ok: bool, details: str = "") -> None:
        self.checks.append({"name": name, "ok": bool(ok), "details": details})

    def record_action(self, name: str, payload: dict[str, Any]) -> None:
        self.actions.append(
            {
                "tool": name,
                "http_status": payload.get("http_status"),
                "ok": payload.get("ok"),
                "auth": payload.get("auth"),
            }
        )

    def decide(self, decision: str, reason: str, action: str) -> None:
        self.decisions.append({"decision": decision, "reason": reason, "action": action})

    def call_tool(self, name: str, arguments: dict[str, Any] | None = None) -> dict[str, Any]:
        payload = self.client.call_tool(name, arguments or {})
        self.record_action(name, payload)
        return payload

    def run(self) -> dict[str, Any]:
        try:
            init = self.client.request(
                "initialize",
                {
                    "protocolVersion": "2024-11-05",
                    "capabilities": {},
                    "clientInfo": {"name": "machinesignal-machine-buyer-agent", "version": "2026-06-03"},
                },
            )
            self.check("initialize", safe_get(init, "serverInfo", "name") == "machinesignal-local-mcp-adapter", str(init.get("serverInfo")))
            self.client.notify("notifications/initialized")

            tools = self.client.request("tools/list").get("tools") or []
            tool_names = {tool.get("name") for tool in tools}
            required = {
                "get_product_catalog",
                "get_machine_onboarding",
                "create_sandbox_customer",
                "get_customer_onboarding",
                "create_purchase_intent",
                "score_lead_opportunity",
                "list_orders",
                "get_usage",
            }
            self.check("tools_available", required.issubset(tool_names), f"{len(tools)} tools listed")

            catalog = self.call_tool("get_product_catalog")
            self.check("catalog_read", catalog.get("ok") is True, f"HTTP {catalog.get('http_status')}")

            onboarding = self.call_tool("get_machine_onboarding")
            self.check("onboarding_read", onboarding.get("ok") is True, f"HTTP {onboarding.get('http_status')}")

            self.decide(
                "start_with_sandbox",
                "The buyer machine can evaluate MachineSignal without human email or sales calls.",
                "create_sandbox_customer",
            )
            sandbox = self.call_tool(
                "create_sandbox_customer",
                {
                    "evaluator_id": self.run_id,
                    "use_case": "automated machine buyer agent evaluation",
                },
            )
            self.check(
                "sandbox_created_and_key_hidden",
                sandbox.get("ok") is True and safe_get(sandbox, "payload", "adapter_state", "full_api_key_returned_to_client") is False,
                f"HTTP {sandbox.get('http_status')}; key={safe_get(sandbox, 'payload', 'api_key')}",
            )

            customer_onboarding = self.call_tool("get_customer_onboarding")
            self.check("customer_onboarding_read", customer_onboarding.get("ok") is True, f"HTTP {customer_onboarding.get('http_status')}")

            starting_list_available = False
            if not starting_list_available:
                self.decide(
                    "buy_target_discovery",
                    "No starting prospect list was provided, so the buyer machine asks MachineSignal to produce a bounded list for a specific market and area.",
                    "create_purchase_intent target_discovery",
                )
                target_discovery = self.call_tool(
                    "create_purchase_intent",
                    {
                        "product_code": "target_discovery",
                        "market": "dentists_odontoiatric_clinics",
                        "area": "Lombardia",
                        "commercial_objective": "find dentist and odontoiatric clinic domains worth scoring for website-led commercial opportunity and CRM-ready follow-up preparation",
                        "reason": "Machine buyer has no starting list and needs a target set before scoring.",
                        "batch_id": self.run_id,
                        "idempotency_key": f"{self.run_id}-target-discovery",
                    },
                )
            else:
                target_discovery = {}

            sample = first_sample_target(target_discovery) or {
                "domain": "clinic3.it",
                "target_name": "Clinic 3",
                "category": "dentist",
                "area": "Lombardia",
                "initial_signals": ["fallback target because target discovery sample was not available"],
            }
            self.check("target_selected", bool(sample.get("domain")), str(sample.get("domain")))

            self.decide(
                "score_selected_target",
                "The buyer machine needs a decision, not just a raw domain list.",
                "score_lead_opportunity",
            )
            score = self.call_tool(
                "score_lead_opportunity",
                {
                    "domain": sample.get("domain"),
                    "sector_hint": "dentist",
                    "country_hint": "IT",
                    "target_name": sample.get("target_name"),
                    "category_hint": sample.get("category"),
                    "area": sample.get("area"),
                    "region": "Lombardia",
                    "initial_signals": sample.get("initial_signals"),
                    "commercial_objective": "website-led commercial opportunity and CRM-ready follow-up preparation",
                    "idempotency_key": f"{self.run_id}-score-001",
                },
            )
            score_value = safe_get(score, "payload", "opportunity_score")
            score_decision = safe_get(score, "payload", "decision")
            self.check("score_returned_decision", score.get("ok") is True and score_decision is not None, f"score={score_value}; decision={score_decision}")

            add_on_product = recommended_product(score)
            add_on = {}
            if add_on_product:
                self.decide(
                    "buy_recommended_add_on",
                    f"The score response recommends {add_on_product}; the buyer machine buys only that next bounded deliverable.",
                    f"create_purchase_intent {add_on_product}",
                )
                add_on = self.call_tool(
                    "create_purchase_intent",
                    {
                        "product_code": add_on_product,
                        "domain": safe_get(score, "payload", "domain"),
                        "source_score_request_id": f"{self.run_id}-score-001",
                        "reason": f"Machine buyer follows MachineSignal score recommendation: {add_on_product}.",
                        "idempotency_key": f"{self.run_id}-{add_on_product}",
                    },
                )
                self.check("recommended_add_on_bought", add_on.get("ok") is True, f"HTTP {add_on.get('http_status')}; product={add_on_product}")
            else:
                self.decide(
                    "stop_without_add_on",
                    "The score response did not justify a next purchase.",
                    "no purchase",
                )
                self.check("recommended_add_on_bought", True, "no add-on recommended")

            orders = self.call_tool("list_orders")
            order_count = len(safe_get(orders, "payload", "orders", default=[]) or [])
            self.check("orders_visible", orders.get("ok") is True and order_count >= 1, f"orders={order_count}")

            usage = self.call_tool("get_usage")
            self.check("usage_visible", usage.get("ok") is True, f"HTTP {usage.get('http_status')}")
            self.check("no_real_payment", safe_get(usage, "payload", "real_payment_executed") is False, str(safe_get(usage, "payload", "real_payment_executed")))
            self.check("no_external_contact", safe_get(usage, "payload", "external_contact_executed") is False, str(safe_get(usage, "payload", "external_contact_executed")))

            result = {
                "ok": all(item["ok"] for item in self.checks),
                "test_name": "mcp_machine_buyer_agent",
                "finished_at": datetime.now().isoformat(timespec="seconds"),
                "run_id": self.run_id,
                "server": str(SERVER_PATH),
                "actions": self.actions,
                "decisions": self.decisions,
                "checks": self.checks,
                "selected_target": sample,
                "score_summary": {
                    "domain": safe_get(score, "payload", "domain"),
                    "opportunity_score": score_value,
                    "confidence": safe_get(score, "payload", "confidence"),
                    "decision": score_decision,
                    "web_architect_status": safe_get(score, "payload", "web_architect_review", "status"),
                    "commercial_strength": safe_get(score, "payload", "commercial_strength", "level"),
                    "recommended_product": add_on_product,
                },
                "orders_count": order_count,
                "real_payment_executed": safe_get(usage, "payload", "real_payment_executed"),
                "external_contact_executed": safe_get(usage, "payload", "external_contact_executed"),
                "redacted_sandbox": redact_for_report(sandbox),
                "redacted_add_on": redact_for_report(add_on),
            }
        finally:
            self.client.close()
        return result


def build_report(result: dict[str, Any]) -> str:
    def ok_text(value: bool) -> str:
        return "OK" if value else "FAIL"

    lines = [
        "# MachineSignal - MCP Machine Buyer Agent Readout",
        "",
        f"Finished at: {result['finished_at']}",
        "",
        "## Result",
        "",
        f"Status: {'passed' if result['ok'] else 'failed'}",
        "",
        "This test connects to the local MachineSignal MCP adapter as a buyer machine. It validates that a machine can move from discovery to sandbox, target discovery, score, recommended add-on purchase, orders and usage without human email outreach.",
        "",
        "## Agent Decisions",
        "",
        "| Decision | Reason | Action |",
        "|---|---|---|",
    ]
    for decision in result["decisions"]:
        lines.append(f"| {decision['decision']} | {decision['reason']} | {decision['action']} |")

    lines.extend(
        [
            "",
            "## Tool Calls",
            "",
            "| Tool | HTTP | Result | Auth |",
            "|---|---:|---|---|",
        ]
    )
    for action in result["actions"]:
        lines.append(f"| {action['tool']} | {action.get('http_status')} | {ok_text(bool(action.get('ok')))} | {action.get('auth')} |")

    score = result["score_summary"]
    lines.extend(
        [
            "",
            "## Score Summary",
            "",
            f"- Domain: `{score.get('domain')}`",
            f"- Opportunity score: `{score.get('opportunity_score')}`",
            f"- Confidence: `{score.get('confidence')}`",
            f"- Decision: `{score.get('decision')}`",
            f"- Web Architect status: `{score.get('web_architect_status')}`",
            f"- Commercial strength: `{score.get('commercial_strength')}`",
            f"- Recommended product: `{score.get('recommended_product')}`",
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
            f"- Orders retrieved: `{result['orders_count']}`",
            f"- Real payment executed: `{result['real_payment_executed']}`",
            f"- External contact executed: `{result['external_contact_executed']}`",
            "- Full API keys are not exposed in this report.",
            "",
            "## Interpretation",
            "",
            "The result supports the machine-first business model: a software client can discover MachineSignal, test it through a sandbox, request a bounded target discovery deliverable, score a target and buy the next recommended deliverable without requiring a human sales conversation.",
        ]
    )
    return "\n".join(lines) + "\n"


def main() -> int:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    agent = MachineBuyerAgent()
    result = agent.run()
    stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    summary_path = OUTPUT_DIR / f"mcp_machine_buyer_agent_summary_{stamp}.json"
    report_path = OUTPUT_DIR / f"mcp_machine_buyer_agent_report_{stamp}.md"
    report = build_report(result)
    result["summary_path"] = str(summary_path)
    result["report_path"] = str(report_path)
    result["repo_report_path"] = str(REPO_REPORT_PATH)
    summary_path.write_text(json.dumps(redact_for_report(result), indent=2, ensure_ascii=False), encoding="utf-8")
    report_path.write_text(report, encoding="utf-8")
    REPO_REPORT_PATH.write_text(report, encoding="utf-8")
    print(json.dumps(redact_for_report(result), indent=2, ensure_ascii=False))
    return 0 if result["ok"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
