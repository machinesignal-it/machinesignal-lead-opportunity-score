import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const packPath = path.join(root, "private-evaluator-pack", "sandbox_visibility_monitoring_pack_20260613.json");
const summaryPath = path.join(root, "private-evaluator-pack", "sandbox_visibility_monitor_summary_20260613.json");
const reportPath = path.join(root, "private-evaluator-pack", "sandbox_visibility_monitor_report_20260613.md");

const pack = JSON.parse(fs.readFileSync(packPath, "utf8"));
const resources = pack.monitored_resources ?? [];
const results = [];

function containsAny(text, words) {
  const lower = text.toLowerCase();
  return words.some((word) => lower.includes(word.toLowerCase()));
}

for (const resource of resources) {
  const startedAt = Date.now();
  const result = {
    id: resource.id,
    url: resource.url,
    method: resource.method,
    ok: false,
    status: null,
    elapsed_ms: null,
    checks: [],
    error: null
  };

  try {
    if (resource.method !== "GET") {
      throw new Error(`Blocked non-GET monitor method: ${resource.method}`);
    }

    const response = await fetch(resource.url, {
      method: "GET",
      headers: {
        "User-Agent": "MachineSignal-Sandbox-Visibility-Monitor/20260613"
      }
    });
    result.status = response.status;
    result.elapsed_ms = Date.now() - startedAt;
    const text = await response.text();
    result.checks.push({ name: "http_2xx", ok: response.status >= 200 && response.status < 300 });

    if (resource.id === "openapi") {
      const json = JSON.parse(text);
      result.checks.push({ name: "valid_json", ok: true });
      result.checks.push({ name: "has_openapi_field", ok: typeof json.openapi === "string" });
      result.checks.push({ name: "has_paths", ok: json.paths && Object.keys(json.paths).length > 0 });
    } else if (resource.id.includes("mcp_manifest")) {
      const json = JSON.parse(text);
      result.checks.push({ name: "valid_json", ok: true });
      result.checks.push({ name: "mentions_machinesignal", ok: containsAny(JSON.stringify(json), ["MachineSignal", "lead", "score"]) });
    } else if (resource.id === "postman_public_collection") {
      const json = JSON.parse(text);
      result.checks.push({ name: "valid_json", ok: true });
      result.checks.push({ name: "has_postman_info", ok: Boolean(json.info && json.info.name) });
    } else {
      result.checks.push({ name: "mentions_machinesignal_or_api", ok: containsAny(text, ["MachineSignal", "API", "machine", "score"]) });
    }

    result.ok = result.checks.every((check) => check.ok);
  } catch (error) {
    result.elapsed_ms = Date.now() - startedAt;
    result.error = error instanceof Error ? error.message : String(error);
    result.checks.push({ name: "fetch_or_parse", ok: false });
  }

  results.push(result);
}

const failed = results.filter((result) => !result.ok);
const any429 = results.some((result) => result.status === 429);
const anyCritical5xx = results.filter((result) => result.status && result.status >= 500).length >= 3;
const statusLevel = any429 || anyCritical5xx ? "red" : failed.length > 0 ? "yellow" : "green";

const summary = {
  monitor_id: "sandbox_visibility_monitor_20260613",
  status: failed.length === 0 ? "passed" : "needs_attention",
  status_level: statusLevel,
  mode: "NoWrite",
  post_calls_executed: 0,
  resources_total: results.length,
  resources_failed: failed.length,
  stop_trigger_detected: statusLevel === "red",
  failed_resources: failed.map((result) => ({
    id: result.id,
    status: result.status,
    error: result.error,
    failed_checks: result.checks.filter((check) => !check.ok).map((check) => check.name)
  })),
  results
};

const report = [
  "# Sandbox visibility monitor",
  "",
  `Status: ${summary.status}`,
  `Status level: ${summary.status_level}`,
  `Mode: ${summary.mode}`,
  `POST calls executed: ${summary.post_calls_executed}`,
  `Resources total: ${summary.resources_total}`,
  `Resources failed: ${summary.resources_failed}`,
  `Stop trigger detected: ${summary.stop_trigger_detected}`,
  "",
  "## Failed resources",
  "",
  failed.length === 0
    ? "None."
    : failed.map((result) => `- ${result.id}: HTTP ${result.status ?? "n/a"} ${result.error ?? ""}`).join("\n"),
  "",
  "## Next action",
  "",
  statusLevel === "green"
    ? "Prepare the MachineSignal sandbox observation log."
    : statusLevel === "yellow"
      ? "Prepare a fix proposal before any wider visibility step."
      : "Stop tests and ask owner approval before continuing."
].join("\n");

fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2) + "\n");
fs.writeFileSync(reportPath, report + "\n");

console.log(report);

if (statusLevel === "red") {
  process.exit(2);
}
