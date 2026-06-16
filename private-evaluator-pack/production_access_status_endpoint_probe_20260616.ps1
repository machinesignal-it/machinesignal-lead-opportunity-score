$ErrorActionPreference = "Stop"

$Repo = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$Node = "C:\Users\natal\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
$Script = Join-Path $Repo "private-evaluator-pack\production_access_status_endpoint_probe_20260616.mjs"

Push-Location $Repo
try {
  & $Node $Script
} finally {
  Pop-Location
}
