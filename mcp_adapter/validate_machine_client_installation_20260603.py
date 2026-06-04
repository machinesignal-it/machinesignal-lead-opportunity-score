#!/usr/bin/env python3
"""
Validate the MachineSignal local MCP adapter installation without consuming credits.

This script only calls public, non-credit-consuming resources through the local
adapter. It does not create a sandbox key and does not call score or purchase
tools.
"""

from __future__ import annotations

import json
import os
import subprocess
import sys
from datetime import datetime
from pathlib import Path
from typing import Any


REPO_DIR = Path(__file__).resolve().parents[1]
SERVER_PATH = REPO_DIR / "mcp_adapter" / "machinesignal_mcp_server.py"
CONFIG_PATH = REPO_DIR / "mcp_adapter" / "mcp_client_config.example.json"
OUTPUT_DIR = Path(r"C:\Users\natal\AppData\Local\Temp\MachineSignal\mcp_client_installation_validation_20260603")
REPO_REPORT_PATH = REPO_DIR / "mcp_client_installation_validation_readout_20260603.md"


def parse_tool_payload(result: dict[str, Any]) -> dict[str, Any]:
    content = result.get("content") or []
    if not content:
        return {}
    text = content[0].get("text", "")
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return {"raw": text}


def safe_get(mapping: Any, *keys: str, default: Any = None) -> Any:
    cur = mapping
    for key in keys:
        if not isinstance(cur, dict):
            return default
        cur = cur.get(key)
    return default if cur is None else cur


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
        self.proc.stdin.write(json.dumps(message) + "\n")
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
        self.proc.stdin.write(json.dumps(message) + "\n")
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

    lines = [
        "# MachineSignal - MCP Client Installation Validation Readout",
        "",
        f"Finished at: {result['finished_at']}",
        "",
        "## Result",
        "",
        f"Status: {'passed' if result['ok'] else 'failed'}",
        "",
        "This validation checks that a machine client can start the local MCP adapter and read public MachineSignal tools without consuming credits.",
        "",
        "## Checks",
        "",
        "| Check | Result | Details |",
        "|---|---|---|",
    ]
    for check in result["checks"]:
        lines.append(f"| {check['name']} | {ok_text(check['ok'])} | {check.get('details', '')} |")
    lines.extend(
        [
            "",
            "## Guardrails",
            "",
            f"- Sandbox customer created: `{result['sandbox_customer_created']}`",
            f"- Credit-consuming calls executed: `{result['credit_consuming_calls_executed']}`",
            f"- Real payment executed: `{result['real_payment_executed']}`",
            f"- External contact executed: `{result['external_contact_executed']}`",
            "",
            "## Interpretation",
            "",
            "The installation is ready for a machine client to connect. The next optional step is the full buyer-machine test, which uses sandbox credits.",
        ]
    )
    return "\n".join(lines) + "\n"


def run() -> dict[str, Any]:
    checks: list[dict[str, Any]] = []

    def check(name: str, ok: bool, details: str = "") -> None:
        checks.append({"name": name, "ok": bool(ok), "details": details})

    check("adapter_file_exists", SERVER_PATH.exists(), str(SERVER_PATH))
    check("client_config_exists", CONFIG_PATH.exists(), str(CONFIG_PATH))
    if CONFIG_PATH.exists():
        config = json.loads(CONFIG_PATH.read_text(encoding="utf-8"))
        check("client_config_has_machinesignal_server", "machinesignal" in (config.get("mcpServers") or {}), "mcpServers.machinesignal")

    client = McpClient()
    try:
        init = client.request(
            "initialize",
            {
                "protocolVersion": "2024-11-05",
                "capabilities": {},
                "clientInfo": {"name": "machinesignal-installation-validator", "version": "2026-06-04"},
            },
        )
        check("mcp_initialize", safe_get(init, "serverInfo", "name") == "machinesignal-local-mcp-adapter", str(init.get("serverInfo")))
        client.notify("notifications/initialized")

        tools_result = client.request("tools/list")
        tools = tools_result.get("tools") or []
        tool_names = {tool.get("name") for tool in tools}
        required_public_tools = {
            "get_product_catalog",
            "get_machine_onboarding",
            "get_machine_api_sandbox_test",
            "get_dentists_beta_pack",
            "create_sandbox_customer",
        }
        check("mcp_tools_list", required_public_tools.issubset(tool_names), f"{len(tools)} tools")
        check("credit_tools_present_but_not_called", {"score_lead_opportunity", "create_purchase_intent"}.issubset(tool_names), "score and purchase tools listed only")

        catalog = client.call_tool("get_product_catalog")
        check("public_catalog_read", catalog.get("ok") is True, f"HTTP {catalog.get('http_status')}")

        onboarding = client.call_tool("get_machine_onboarding")
        check("public_onboarding_read", onboarding.get("ok") is True, f"HTTP {onboarding.get('http_status')}")

        sandbox_test = client.call_tool("get_machine_api_sandbox_test")
        check("public_machine_api_sandbox_test_read", sandbox_test.get("ok") is True, f"HTTP {sandbox_test.get('http_status')}")

        dentists_pack = client.call_tool("get_dentists_beta_pack")
        check("dentists_beta_pack_read", dentists_pack.get("ok") is True, f"HTTP {dentists_pack.get('http_status')}")
    finally:
        client.close()

    return {
        "ok": all(item["ok"] for item in checks),
        "test_name": "mcp_client_installation_validation",
        "finished_at": datetime.now().isoformat(timespec="seconds"),
        "checks": checks,
        "sandbox_customer_created": False,
        "credit_consuming_calls_executed": False,
        "real_payment_executed": False,
        "external_contact_executed": False,
    }


def main() -> int:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    result = run()
    stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    summary_path = OUTPUT_DIR / f"mcp_client_installation_validation_summary_{stamp}.json"
    report_path = OUTPUT_DIR / f"mcp_client_installation_validation_report_{stamp}.md"
    report = build_report(result)
    result["summary_path"] = str(summary_path)
    result["report_path"] = str(report_path)
    result["repo_report_path"] = str(REPO_REPORT_PATH)
    summary_path.write_text(json.dumps(result, indent=2), encoding="utf-8")
    report_path.write_text(report, encoding="utf-8")
    REPO_REPORT_PATH.write_text(report, encoding="utf-8")
    print(json.dumps(result, indent=2))
    return 0 if result["ok"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
