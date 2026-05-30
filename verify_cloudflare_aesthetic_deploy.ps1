$ErrorActionPreference = "Stop"

$postmanKeyPath = Join-Path $env:APPDATA "MachineSignal\postman_api_key.dpapi"
if (-not (Test-Path -LiteralPath $postmanKeyPath)) {
  throw "Postman API key DPAPI file not found: $postmanKeyPath"
}

$secure = (Get-Content -LiteralPath $postmanKeyPath -Raw).Trim() | ConvertTo-SecureString
$postmanKey = (New-Object System.Net.NetworkCredential("", $secure)).Password

$environmentId = "55284144-f4d8f2a3-b29d-45b1-a9a6-b606816e6184"
$envResp = Invoke-RestMethod `
  -Method Get `
  -Uri "https://api.getpostman.com/environments/$environmentId" `
  -Headers @{ "X-Api-Key" = $postmanKey } `
  -TimeoutSec 30

$apiKeyValue = ($envResp.environment.values | Where-Object { $_.key -eq "machinesignal_api_key" }).value
if (-not $apiKeyValue -or $apiKeyValue -eq "paste_customer_beta_key_here") {
  throw "machinesignal_api_key is not configured in the Postman environment."
}

$body = @{
  domain = "quinta-essenza.com"
  sector_hint = "medicina estetica"
  country_hint = "IT"
} | ConvertTo-Json -Compress

$response = Invoke-RestMethod `
  -Method Post `
  -Uri "https://machinesignal-api.beta-878.workers.dev/v1/lead-opportunity-score" `
  -Headers @{
    "X-API-Key" = $apiKeyValue
    "Content-Type" = "application/json"
    "Idempotency-Key" = "verify-aesthetic-deploy-$([guid]::NewGuid().ToString())"
  } `
  -Body $body `
  -TimeoutSec 30

$result = [pscustomobject]@{
  domain = $response.domain
  opportunity_score = $response.opportunity_score
  confidence = $response.confidence
  decision = $response.decision
  next_product = $response.next_purchase.next_product
  deploy_ok = ($response.decision -eq "buy_deep_analysis" -and $response.next_purchase.next_product -eq "deep_analysis")
}

$result | ConvertTo-Json -Depth 5
