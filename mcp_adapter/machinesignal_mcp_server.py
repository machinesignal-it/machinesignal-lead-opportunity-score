#!/usr/bin/env python3
"""
MachineSignal local MCP adapter.

This is a small stdio JSON-RPC server that exposes MachineSignal HTTP beta
endpoints as MCP tools. It is intentionally dependency-free so it can run on a
plain Python installation.

Supported MCP-style methods:
- initialize
- tools/list
- tools/call

Security notes:
- Full API keys are never returned to the MCP client.
- A key created by create_sandbox_customer is stored in adapter memory and used
  for following customer-authenticated calls.
- Optional fallback env vars:
  - MACHINESIGNAL_CUSTOMER_API_KEY for customer tools
  - MACHINESIGNAL_ADMIN_API_KEY for admin tools
"""

from __future__ import annotations

import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import dataclass
from typing import Any


MANIFEST_URL = os.environ.get("MACHINESIGNAL_MCP_MANIFEST_URL", "https://machinesignal.it/mcp-tool-manifest.json")
DEFAULT_PROTOCOL_VERSION = "2024-11-05"
SECRET_KEYS = {"api_key", "customer_api_key", "admin_api_key", "x-api-key", "token", "secret", "password"}


def parse_payload(raw: str) -> Any:
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return raw


def request_payload(
    method: str,
    url: str,
    payload: dict[str, Any] | None = None,
    api_key: str | None = None,
    idempotency_key: str | None = None,
    timeout: int = 30,
) -> tuple[int, Any]:
    headers = {
        "Accept": "application/json,text/plain,*/*",
        "User-Agent": "MachineSignalLocalMcpAdapter/2026-06-03",
    }
    body = None
    method_upper = method.upper()
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
            return int(response.status), parse_payload(raw)
    except urllib.error.HTTPError as exc:
        raw = exc.read().decode("utf-8", errors="replace")
        return int(exc.code), parse_payload(raw)
    except urllib.error.URLError as exc:
        return 599, {"error": "url_error", "message": str(exc)}


def mask_secret(value: Any) -> Any:
    if not isinstance(value, str):
        return value
    if len(value) <= 12:
        return value[:3] + "..."
    return value[:10] + "..." + value[-4:]


def redact_secrets(value: Any) -> Any:
    if isinstance(value, dict):
        clean: dict[str, Any] = {}
        for key, item in value.items():
            if key.lower() in SECRET_KEYS or key.lower().endswith("_key"):
                clean[key] = mask_secret(item)
            else:
                clean[key] = redact_secrets(item)
        return clean
    if isinstance(value, list):
        return [redact_secrets(item) for item in value]
    return value


def rpc_result(request_id: Any, result: Any) -> dict[str, Any]:
    return {"jsonrpc": "2.0", "id": request_id, "result": result}


def rpc_error(request_id: Any, code: int, message: str, data: Any | None = None) -> dict[str, Any]:
    error: dict[str, Any] = {"code": code, "message": message}
    if data is not None:
        error["data"] = data
    return {"jsonrpc": "2.0", "id": request_id, "error": error}


@dataclass
class ToolSpec:
    name: str
    description: str
    input_schema: dict[str, Any]


class MachineSignalMcpAdapter:
    def __init__(self) -> None:
        self.manifest_status, manifest_payload = request_payload("GET", MANIFEST_URL)
        if self.manifest_status != 200 or not isinstance(manifest_payload, dict):
            raise RuntimeError(f"Could not load manifest: HTTP {self.manifest_status}")
        self.manifest: dict[str, Any] = manifest_payload
        self.tools_by_name: dict[str, dict[str, Any]] = {
            tool["name"]: tool
            for tool in self.manifest.get("tools", [])
            if isinstance(tool, dict) and tool.get("name")
        }
        self.customer_api_key = os.environ.get("MACHINESIGNAL_CUSTOMER_API_KEY", "").strip()
        self.admin_api_key = os.environ.get("MACHINESIGNAL_ADMIN_API_KEY", "").strip()

    def initialize(self, params: dict[str, Any] | None = None) -> dict[str, Any]:
        protocol_version = (params or {}).get("protocolVersion") or DEFAULT_PROTOCOL_VERSION
        return {
            "protocolVersion": protocol_version,
            "capabilities": {"tools": {}},
            "serverInfo": {
                "name": "machinesignal-local-mcp-adapter",
                "version": "2026-06-03",
            },
            "instructions": (
                "MachineSignal local MCP adapter. Create a sandbox customer first, "
                "then call customer-authenticated tools. Full API keys are kept in adapter memory."
            ),
        }

    def list_tools(self) -> dict[str, Any]:
        tools = []
        for tool in self.tools_by_name.values():
            schema = dict(tool.get("input_schema") or {"type": "object", "properties": {}, "required": []})
            properties = dict(schema.get("properties") or {})
            required = list(schema.get("required") or [])

            # Adapter-specific convenience: idempotency_key is provided as an
            # argument for tools that require it, then sent as a header.
            if tool.get("requires_idempotency_key"):
                properties["idempotency_key"] = {
                    "type": "string",
                    "description": "Stable request key sent as Idempotency-Key header.",
                }
                if "idempotency_key" not in required:
                    required.append("idempotency_key")
            schema["properties"] = properties
            schema["required"] = required
            tools.append(
                {
                    "name": tool["name"],
                    "description": tool.get("purpose") or tool.get("output_summary") or tool["name"],
                    "inputSchema": schema,
                }
            )
        return {"tools": tools}

    def call_tool(self, name: str, arguments: dict[str, Any] | None = None) -> dict[str, Any]:
        if name not in self.tools_by_name:
            return self.tool_response({"error": "unknown_tool", "tool": name}, is_error=True)

        tool = self.tools_by_name[name]
        args = dict(arguments or {})
        method = str(tool.get("method", "GET"))
        url = str(tool.get("url"))
        auth = str(tool.get("auth", "none"))
        idempotency_key = args.pop("idempotency_key", None)

        for param_name in list(args.keys()):
            placeholder = "{" + param_name + "}"
            if placeholder in url:
                url = url.replace(placeholder, urllib.parse.quote(str(args.pop(param_name)), safe=""))

        api_key = None
        if auth == "customer_api_key":
            api_key = self.customer_api_key
            if not api_key:
                return self.tool_response(
                    {
                        "error": "missing_customer_api_key",
                        "message": "Call create_sandbox_customer first or set MACHINESIGNAL_CUSTOMER_API_KEY.",
                    },
                    is_error=True,
                )
        elif auth == "admin_api_key":
            api_key = self.admin_api_key
            if not api_key:
                return self.tool_response(
                    {
                        "error": "missing_admin_api_key",
                        "message": "Set MACHINESIGNAL_ADMIN_API_KEY to use admin tools.",
                    },
                    is_error=True,
                )

        if tool.get("requires_idempotency_key") and not idempotency_key:
            return self.tool_response({"error": "missing_idempotency_key", "tool": name}, is_error=True)

        status, payload = request_payload(method, url, payload=args, api_key=api_key, idempotency_key=idempotency_key)
        if name == "create_sandbox_customer" and isinstance(payload, dict) and payload.get("api_key"):
            self.customer_api_key = str(payload["api_key"])
            payload = dict(payload)
            payload["adapter_state"] = {
                "customer_api_key_stored_in_memory": True,
                "full_api_key_returned_to_client": False,
            }

        clean_payload = redact_secrets(payload)
        response = {
            "tool": name,
            "http_status": status,
            "ok": 200 <= status < 300,
            "auth": auth,
            "payload": clean_payload,
        }
        return self.tool_response(response, is_error=not (200 <= status < 300))

    @staticmethod
    def tool_response(payload: Any, is_error: bool = False) -> dict[str, Any]:
        return {
            "content": [
                {
                    "type": "text",
                    "text": json.dumps(payload, indent=2, ensure_ascii=False),
                }
            ],
            "isError": bool(is_error),
        }


def main() -> int:
    try:
        adapter = MachineSignalMcpAdapter()
    except Exception as exc:
        print(json.dumps(rpc_error(None, -32000, "adapter_startup_failed", str(exc))), flush=True)
        return 1

    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        try:
            request = json.loads(line)
        except json.JSONDecodeError as exc:
            print(json.dumps(rpc_error(None, -32700, "Parse error", str(exc))), flush=True)
            continue

        request_id = request.get("id")
        method = request.get("method")
        params = request.get("params") or {}

        # JSON-RPC notifications have no id and must not receive a response.
        if request_id is None and isinstance(method, str) and method.startswith("notifications/"):
            continue

        try:
            if method == "initialize":
                response = rpc_result(request_id, adapter.initialize(params))
            elif method == "tools/list":
                response = rpc_result(request_id, adapter.list_tools())
            elif method == "tools/call":
                response = rpc_result(
                    request_id,
                    adapter.call_tool(str(params.get("name")), params.get("arguments") or {}),
                )
            else:
                response = rpc_error(request_id, -32601, "Method not found", method)
        except Exception as exc:
            response = rpc_error(request_id, -32603, "Internal error", str(exc))

        print(json.dumps(response, ensure_ascii=False), flush=True)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
