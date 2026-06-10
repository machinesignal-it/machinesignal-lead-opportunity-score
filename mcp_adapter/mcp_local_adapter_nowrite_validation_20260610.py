#!/usr/bin/env python3
"""
MachineSignal local MCP adapter NoWrite validation.

This validation behaves like a machine client that installs and starts the
local stdio adapter, lists available tools and calls only public GET/no-auth
tools. It does not create sandbox customers, score domains, create purchase
intents, create payment-test intents, publish externally or contact humans.
"""

from __future__ import annotations

import json
import os
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


REPO_DIR = Path(__file__).resolve().parents[1]
SERVER_PATH = REPO_DIR / "mcp_adapter" / "machinesignal_mcp_server.py"
CONFIG_PATH = REPO_DIR / "mcp_adapter" / "mcp_client_config.example.json"
OUTPUT_JSON = REPO_DIR / "mcp_local_adapter_nowrite_validation_summary_20260610.json"
OUTPUT_MD = REPO_DIR / "mcp_local_adapter_nowrite_validation_report_20260610.md"

SECRET_KEYS = {
    "api_key",
    "customer_api_key",
    "admin_api_key",
    "x-api-key",
    "token",
    "secret",
    "password",
}

PUBLIC_NOWRITE_TOOLS = [
    "get_product_catalog",
    "get_machine_onboarding",
    "get_marketplace_api_directory_pack",
    "get_machine_api_sandbox_test",
    "get_machine_buyer_evidence_brief",
    "get_mcp_tool_registry_draft_checklist",
    "get_external_submission_pack_no_write_review",
    "get_external_draft_submission_bundle",
    "get_private_draft_submission_rehearsal",
    "get_api_directory_private_draft_pack",
    "get_api_directory_private_draft_review",
    "get_rapidapi_unpublished_provider_draft_pack",
    "get_rapidapi_unpublished_provider_draft_review",
    "get_mcp_tool_registry_private_draft_pack",
    "get_mcp_tool_registry_private_draft_review",
]

POST_OR_WRITE_TOOLS_THAT_MUST_NOT_RUN = {
    "create_sandbox_customer",
    "score_lead_opportunity",
    "create_purchase_intent",
    "create_payment_test_intent",
}


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


def mask_secret(value: Any) -> Any:
    if not isinstance(value, str):
        return value
    if len(value) <= 12:
        return value[:3] + "..."
    return value[:10] + "..." + value[-4:]


def redact_for_report(value: Any) -> Any:
    if isinstance(value, dict):
        clean: dict[str, Any] = {}
        for key, item in value.items():
            key_lower = key.lower()
            if key_lower in SECRET_KEYS or key_lower.endswith("_key"):
                clean[key] = mask_secret(item)
            else:
                clean[key] = redact_for_report(item)
        return clean
    if isinstance(value, list):
        return [redact_for_report(item) for item in value]
    return value


class McpClient:
    def __init__(self) -> None:
        self.next_id = 1
        env = os.environ.copy()
        env.setdefault("PYTHONIOENCODING", "utf-8")
        env.setdefault("MACHINESIGNAL_MCP_MANIFEST_URL", "https://machinesignal.it/mcp-tool-manifest.json")
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


def build_report(result: dict[str, Any]) -> str:
    def ok_text(ok: bool) -> str:
        return "OK" if ok else "FAIL"

    check_rows = "\n".join(
        f"| {check['name']} | {ok_text(check['ok'])} | {str(check.get('details', '')).replace('|', '\\|')} |"
        for check in result["checks"]
    )
    tool_rows = "\n".join(
        f"| {call['tool']} | {call.get('http_status')} | {ok_text(call['ok'])} | {call.get('auth')} |"
        for call in result["public_tool_calls"]
    )
    blocked_rows = "\n".join(f"| {tool} | not executed |" for tool in sorted(result["blocked_write_tools_not_called"]))

    return f"""# MachineSignal - MCP Local Adapter NoWrite Validation - 2026-06-10

## Result

Status: {result['status']}

OK: {result['ok']}

Mode: {result['mode']}

Write calls executed: {result['write_calls_executed']}

POST calls executed: {result['post_calls_executed']}

Real payment executed: {result['real_payment_executed']}

External contact executed: {result['external_contact_executed']}

## What This Validates

A machine client can start the local stdio MCP adapter, initialize it, list the available MachineSignal tools and read public/no-auth resources through the adapter. The validation confirms the new MCP private-draft tools are visible and callable as read-only tools.

## Public Tools Called

| Tool | HTTP | Result | Auth |
|---|---:|---|---|
{tool_rows}

## Write/POST Tools Not Called

| Tool | Status |
|---|---|
{blocked_rows}

## Checks

| Check | Result | Details |
|---|---|---|
{check_rows}

## Interpretation

The local adapter is installable and usable by a machine in NoWrite mode. It can expose MachineSignal discovery, onboarding, evidence, API-directory, RapidAPI-style and MCP/tool-registry private-draft materials without creating a sandbox, consuming credits, creating purchase intents, enabling payments, publishing externally or contacting humans.
"""


def run_validation() -> dict[str, Any]:
    checks: list[dict[str, Any]] = []
    public_tool_calls: list[dict[str, Any]] = []
    tools_listed_count = 0

    def check(name: str, ok: bool, details: str = "") -> None:
        checks.append({"name": name, "ok": bool(ok), "details": details})

    check("adapter_file_exists", SERVER_PATH.exists(), str(SERVER_PATH))
    check("client_config_exists", CONFIG_PATH.exists(), str(CONFIG_PATH))
    if CONFIG_PATH.exists():
        config = json.loads(CONFIG_PATH.read_text(encoding="utf-8-sig"))
        check("client_config_has_machinesignal_server", "machinesignal" in (config.get("mcpServers") or {}), "mcpServers.machinesignal")

    client = McpClient()
    try:
        init = client.request(
            "initialize",
            {
                "protocolVersion": "2024-11-05",
                "capabilities": {},
                "clientInfo": {"name": "machinesignal-nowrite-validator", "version": "2026-06-10"},
            },
        )
        check("mcp_initialize", safe_get(init, "serverInfo", "name") == "machinesignal-local-mcp-adapter", str(init.get("serverInfo")))
        client.notify("notifications/initialized")

        tools_result = client.request("tools/list")
        tools = tools_result.get("tools") or []
        tools_listed_count = len(tools)
        tool_names = {tool.get("name") for tool in tools}
        check("mcp_tools_list", len(tools) >= 30, f"{len(tools)} tools listed")
        missing_public = [name for name in PUBLIC_NOWRITE_TOOLS if name not in tool_names]
        missing_write = [name for name in POST_OR_WRITE_TOOLS_THAT_MUST_NOT_RUN if name not in tool_names]
        check("public_nowrite_tools_present", not missing_public, f"missing={missing_public}")
        check("write_tools_present_but_not_called", not missing_write, f"listed_only={sorted(POST_OR_WRITE_TOOLS_THAT_MUST_NOT_RUN)}")

        for name in PUBLIC_NOWRITE_TOOLS:
            payload = client.call_tool(name)
            public_tool_calls.append(
                {
                    "tool": name,
                    "http_status": payload.get("http_status"),
                    "ok": payload.get("ok") is True,
                    "auth": payload.get("auth"),
                }
            )
            check(f"{name}_read", payload.get("ok") is True and payload.get("auth") == "none", f"HTTP {payload.get('http_status')}; auth={payload.get('auth')}")

            if name == "get_mcp_tool_registry_private_draft_pack":
                status = safe_get(payload, "payload", "status")
                hosted = safe_get(payload, "payload", "draft_safety_state", "hosted_mcp_live")
                check("mcp_private_draft_pack_status", status == "ready_for_mcp_tool_registry_private_draft_only", f"status={status}")
                check("mcp_private_draft_pack_hosted_mcp_false", hosted is False, f"hosted_mcp_live={hosted}")
            elif name == "get_mcp_tool_registry_private_draft_review":
                ok = safe_get(payload, "payload", "ok")
                writes = safe_get(payload, "payload", "write_calls_executed")
                posts = safe_get(payload, "payload", "post_calls_executed")
                check("mcp_private_draft_review_nowrite_ok", ok is True and writes == 0 and posts == 0, f"ok={ok}; writes={writes}; posts={posts}")
            elif name == "get_external_submission_pack_no_write_review":
                ok = safe_get(payload, "payload", "ok")
                writes = safe_get(payload, "payload", "write_calls_executed")
                posts = safe_get(payload, "payload", "post_calls_executed")
                check("external_submission_nowrite_review_ok", ok is True and writes == 0 and posts == 0, f"ok={ok}; writes={writes}; posts={posts}")

    finally:
        client.close()

    return {
        "artifact": "mcp_local_adapter_nowrite_validation",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "status": "completed_mcp_local_adapter_nowrite_validation",
        "ok": all(item["ok"] for item in checks),
        "mode": "NoWriteMcpLocalAdapterValidation",
        "primary_customer_interface": "machine",
        "adapter_path": str(SERVER_PATH),
        "client_config_path": str(CONFIG_PATH),
        "tools_listed_count": tools_listed_count,
        "public_tools_called_count": len(public_tool_calls),
        "public_tool_calls": public_tool_calls,
        "blocked_write_tools_not_called": sorted(POST_OR_WRITE_TOOLS_THAT_MUST_NOT_RUN),
        "write_calls_executed": 0,
        "post_calls_executed": 0,
        "sandbox_customer_created": False,
        "credit_consuming_calls_executed": False,
        "real_payment_executed": False,
        "real_invoice_issued": False,
        "external_contact_executed": False,
        "external_publication_executed": False,
        "production_api_key_published": False,
        "human_outreach_executed": False,
        "checks": checks,
        "machine_decision": {
            "decision": "local_mcp_adapter_nowrite_ready" if all(item["ok"] for item in checks) else "local_mcp_adapter_nowrite_needs_fix",
            "recommended_next_step": "Use this as evidence that the local MCP adapter can be mounted and queried by a machine without write calls. Next bounded step is a write-capped sandbox adapter run only if needed.",
        },
    }


def main() -> int:
    result = run_validation()
    clean = redact_for_report(result)
    OUTPUT_JSON.write_text(json.dumps(clean, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    OUTPUT_MD.write_text(build_report(clean), encoding="utf-8")
    print(json.dumps(clean, indent=2, ensure_ascii=False))
    return 0 if result["ok"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
