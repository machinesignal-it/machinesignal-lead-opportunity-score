import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const packDir = path.join(root, "private-evaluator-pack");
const guardPath = path.join(packDir, "public_wording_guard_nowrite_20260613.json");
const reportPath = path.join(packDir, "public_wording_scan_nowrite_report_20260613.md");
const summaryPath = path.join(packDir, "public_wording_scan_nowrite_summary_20260613.json");

const guard = JSON.parse(fs.readFileSync(guardPath, "utf8"));

const includeRoots = [
  "README.md",
  "API_DIRECTORY_SUBMISSION.md",
  "openapi.json",
  "postman_collection.json",
  "postman_public_collection.json",
  "postman_public_environment_template.json",
  "mcp-tool-manifest.json",
  "mcp-machine-client-installation-pack.json",
  "docs",
  "api_endpoint_minimal",
  "distribution",
  "mcp",
  "mcp_adapter"
];

const extensions = new Set([".md", ".json", ".mjs", ".js", ".py", ".toml", ".html", ".txt"]);
const maxBytes = 1_500_000;
const forbidden = guard.forbidden_wording_patterns || [];
const replacements = new Map((guard.replacement_guidance || []).map((r) => [r.avoid.toLowerCase(), r.use]));

function walk(p) {
  if (!fs.existsSync(p)) return [];
  const stat = fs.statSync(p);
  if (stat.isFile()) return [p];
  const out = [];
  for (const entry of fs.readdirSync(p, { withFileTypes: true })) {
    const child = path.join(p, entry.name);
    if (entry.name === ".git" || entry.name === "private-evaluator-pack") continue;
    if (entry.isDirectory()) out.push(...walk(child));
    else out.push(child);
  }
  return out;
}

const files = [...new Set(includeRoots.flatMap((p) => walk(path.join(root, p))))]
  .filter((file) => {
    const stat = fs.statSync(file);
    return stat.size <= maxBytes && extensions.has(path.extname(file).toLowerCase());
  })
  .sort();

const findings = [];

for (const file of files) {
  const rel = path.relative(root, file).replaceAll("\\", "/");
  const text = fs.readFileSync(file, "utf8");
  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i += 1) {
    const lower = lines[i].toLowerCase();
    for (const rule of forbidden) {
      const pattern = String(rule.pattern || "").toLowerCase();
      if (!pattern) continue;
      if (lower.includes(pattern)) {
        findings.push({
          file: rel,
          line: i + 1,
          pattern: rule.pattern,
          severity: rule.severity,
          reason: rule.reason,
          suggested_replacement: replacements.get(pattern) || "rewrite as sandbox/pre-live/no-go wording",
          excerpt: lines[i].trim().slice(0, 220)
        });
      }
    }
  }
}

const severityCounts = findings.reduce((acc, f) => {
  acc[f.severity] = (acc[f.severity] || 0) + 1;
  return acc;
}, {});

const summary = {
  scan_id: "public_wording_scan_nowrite_20260613",
  created_at: new Date().toISOString(),
  status: "reported",
  mode: "NoWrite scan",
  source_guard: "public_wording_guard_nowrite_20260613",
  commercial_status: "not_live",
  go_live_decision: "no_go",
  files_scanned: files.length,
  findings_total: findings.length,
  severity_counts: severityCounts,
  publication_status: findings.length === 0 ? "clean_for_wording_guard_only_not_owner_approved" : "blocked_until_wording_review",
  findings,
  hard_blocks_preserved: guard.hard_blocks_preserved,
  readiness_after_scan: {
    public_wording_safety_readiness: findings.length === 0 ? 82 : 70,
    commercial_readiness: findings.length === 0 ? 69 : 68,
    go_live_status: "no_go",
    reason: findings.length === 0
      ? "No forbidden public wording was found in scanned candidate surfaces, but owner approval is still required before publication."
      : "Potential public wording issues were found and must be reviewed before any publication or marketplace activity."
  },
  recommended_next_action: findings.length === 0
    ? "public_docs_owner_approval_gate_nowrite"
    : "public_wording_remediation_draft_nowrite"
};

const findingLines = findings.length === 0
  ? ["None."]
  : findings.map((f) => `- ${f.severity.toUpperCase()} ${f.file}:${f.line} pattern \`${f.pattern}\` -> ${f.suggested_replacement}\n  - ${f.excerpt}`);

const report = [
  "# Public Wording Scan NoWrite - 2026-06-13",
  "",
  "Status: reported",
  "Mode: NoWrite scan",
  "Commercial status: not_live",
  "Go-live: no_go",
  "",
  `Files scanned: ${summary.files_scanned}`,
  `Findings: ${summary.findings_total}`,
  `Publication status: ${summary.publication_status}`,
  "",
  "## Severity counts",
  "",
  `- critical: ${severityCounts.critical || 0}`,
  `- high: ${severityCounts.high || 0}`,
  `- medium: ${severityCounts.medium || 0}`,
  `- low: ${severityCounts.low || 0}`,
  "",
  "## Findings",
  "",
  ...findingLines,
  "",
  "## Hard blocks preserved",
  "",
  "- real_payments",
  "- invoices",
  "- payment_method_collection",
  "- external_outreach",
  "- real_data_processing",
  "- personal_data_processing",
  "- production_api_key_issuing",
  "- public_paid_marketplace",
  "- hosted_mcp_public",
  "- mcp_registry_publication",
  "- commercial_go_live",
  "",
  "## Next action",
  "",
  summary.recommended_next_action
].join("\n");

fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2), "utf8");
fs.writeFileSync(reportPath, report, "utf8");
console.log(report);
