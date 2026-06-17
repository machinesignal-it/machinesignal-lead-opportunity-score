$ErrorActionPreference = "Stop"

$Repo = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$Node = "C:\Users\natal\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
$Script = Join-Path $Repo "private-evaluator-pack\deployment_readiness_check_production_access_status_20260617.mjs"

Push-Location $Repo
try {
  & $Node $Script
} finally {
  Pop-Location
}
