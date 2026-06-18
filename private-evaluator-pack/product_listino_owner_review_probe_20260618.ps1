$ErrorActionPreference = "Stop"

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$mdPath = Join-Path $root "private-evaluator-pack/product_listino_owner_review_20260618.md"
$jsonPath = Join-Path $root "private-evaluator-pack/product_listino_owner_review_20260618.json"
$catalogPath = Join-Path $root "product-catalog.json"
$reportPath = Join-Path $root "private-evaluator-pack/product_listino_owner_review_probe_report_20260618.md"
$summaryPath = Join-Path $root "private-evaluator-pack/product_listino_owner_review_probe_summary_20260618.json"

$md = Get-Content -Raw -Encoding UTF8 $mdPath
$jsonText = Get-Content -Raw -Encoding UTF8 $jsonPath
$json = $jsonText | ConvertFrom-Json
$catalog = Get-Content -Raw -Encoding UTF8 $catalogPath | ConvertFrom-Json

$checks = New-Object System.Collections.Generic.List[object]

function Add-Check {
  param([string]$Name, [bool]$Passed, [string]$Detail)
  $script:checks.Add([pscustomobject]@{
    name = $Name
    passed = $Passed
    detail = $Detail
  })
}

Add-Check "Documento italiano" ($json.language -eq "it") "Il report deve essere in italiano."
Add-Check "Stato bozza owner review" ($json.status -eq "draft_internal_owner_review_not_live_offer") "Deve essere una bozza interna, non offerta live."
Add-Check "Attivazione commerciale falsa" ($json.commercial_activation -eq $false) "Non deve autorizzare attivazione commerciale."
Add-Check "Offerta live non ammessa" ($json.live_offer_allowed -eq $false) "Non deve autorizzare offerta live."
Add-Check "Pagamento reale non ammesso" ($json.real_payment_allowed -eq $false) "Non deve autorizzare pagamenti reali."
Add-Check "Fattura non ammessa" ($json.invoice_allowed -eq $false) "Non deve autorizzare fatture."
Add-Check "Abbonamento non ammesso" ($json.subscription_activation_allowed -eq $false) "Non deve autorizzare abbonamenti reali."
Add-Check "Marketplace non ammesso" ($json.marketplace_publication_allowed -eq $false) "Non deve autorizzare marketplace."

$requiredProducts = @(
  "target_discovery_pack_250",
  "score_pack_1k",
  "domain_enrichment_pack_100",
  "deep_analysis_pack_100",
  "action_pack_25",
  "opportunity_feed_monthly",
  "api_starter_monthly",
  "api_pro_monthly",
  "custom_overage"
)

$reviewProductIds = @($json.reference_products | ForEach-Object { $_.product_id })
foreach ($productId in $requiredProducts) {
  Add-Check "Prodotto review presente: $productId" ($reviewProductIds -contains $productId) "Il review pack deve coprire questo prodotto."
  $catalogProduct = $catalog.products.$productId
  Add-Check "Prodotto catalogo presente: $productId" ($null -ne $catalogProduct) "Il catalogo deve contenere questo prodotto."
  $reviewProduct = @($json.reference_products | Where-Object { $_.product_id -eq $productId })
  if (($reviewProduct.Count -eq 1) -and ($null -ne $catalogProduct)) {
    Add-Check "Nome coerente: $productId" ($reviewProduct[0].name -eq $catalogProduct.name) "Nome review e catalogo devono combaciare."
    Add-Check "Unita' presente: $productId" ([string]::IsNullOrWhiteSpace($reviewProduct[0].unit) -eq $false) "Ogni prodotto deve avere un'unita'."
    Add-Check "Include summary presente: $productId" ([string]::IsNullOrWhiteSpace($reviewProduct[0].includes_summary) -eq $false) "Ogni prodotto deve spiegare cosa include."
    Add-Check "Non live offer: $productId" ($reviewProduct[0].not_live_offer -eq $true) "Ogni prodotto deve restare non-live."
    Add-Check "Stato sandbox/reference: $productId" ($reviewProduct[0].status -in @("sandbox_reference", "owner_quote_required")) "Lo stato non deve essere live."
  }
}

$fixedPriceProducts = @($json.reference_products | Where-Object { $_.product_id -ne "custom_overage" })
foreach ($product in $fixedPriceProducts) {
  Add-Check "Prezzo numerico presente: $($product.product_id)" ($product.price_eur -is [int] -or $product.price_eur -is [long] -or $product.price_eur -is [double]) "I prodotti non custom devono avere prezzo EUR."
  Add-Check "Prezzo positivo: $($product.product_id)" ([double]$product.price_eur -gt 0) "Il prezzo deve essere positivo."
}

$custom = @($json.reference_products | Where-Object { $_.product_id -eq "custom_overage" })
if ($custom.Count -eq 1) {
  Add-Check "Custom ha prezzo from" ($custom[0].price_eur_from -ge 2000) "Custom deve richiedere quote proprietario."
}

$ownerDecisions = @(
  "first_product_to_offer",
  "initial_beta_price",
  "maximum_beta_customers",
  "discount_policy_or_no_discount",
  "credit_validity",
  "unused_credit_policy",
  "recredit_policy",
  "cash_refund_policy",
  "customer_usage_limits",
  "customer_cost_limits",
  "one_shot_packs_vs_subscriptions_priority",
  "sandbox_to_production_conditions",
  "allowed_publication_channels",
  "machine_response_when_listino_not_live"
)
foreach ($item in $ownerDecisions) {
  Add-Check "Decisione proprietario presente: $item" ($json.owner_decisions_required -contains $item) "La review deve richiedere questa decisione."
}

$response = $json.blocked_response_example
Add-Check "Risposta bloccata status corretto" ($response.status -eq "blocked_by_product_listino_approval") "La macchina deve ricevere stato bloccato."
Add-Check "Risposta bloccata stop" ($response.decision -eq "stop") "La decisione deve essere stop."
Add-Check "Crediti consumati zero" ($response.credits_consumed -eq 0) "Nessun credito deve essere consumato."
Add-Check "Pagamento falso" ($response.payment_executed -eq $false) "Nessun pagamento reale."
Add-Check "Fattura falsa" ($response.invoice_issued -eq $false) "Nessuna fattura."
Add-Check "Abbonamento falso" ($response.subscription_activated -eq $false) "Nessun abbonamento reale."
Add-Check "Escalation proprietario richiesta" ($response.owner_escalation_required -eq $true) "Serve decisione proprietario."
Add-Check "Support code corretto" ($response.support_code -eq "PRODUCT_LISTINO_NOT_APPROVED") "Il codice deve essere stabile."

$may = @(
  "compare_catalog_openapi_postman_company_brain",
  "check_prices_units_and_descriptions",
  "verify_each_price_has_includes",
  "propose_listino_changes",
  "prepare_pnl_and_margin_scenarios",
  "create_sandbox_purchase_intent",
  "return_blocked_response_when_listino_not_approved",
  "prepare_italian_reports"
)
foreach ($item in $may) {
  Add-Check "Azione agente ammessa: $item" ($json.agents_may_do -contains $item) "Gli agenti devono poter preparare senza vendere."
}

$mustNot = @(
  "approve_final_listino",
  "convert_sandbox_prices_to_live_offer",
  "execute_real_payment",
  "issue_invoice",
  "activate_subscription",
  "publish_paid_marketplace_listing",
  "declare_final_prices_without_owner_approval",
  "change_production_prices_without_owner_approval"
)
foreach ($item in $mustNot) {
  Add-Check "Divieto agente presente: $item" ($json.agents_must_not_do -contains $item) "Gli agenti non devono fare questa azione."
}

Add-Check "Effetto dashboard candidato giallo" ($json.dashboard_effect.product_listino_approval -eq "red_to_yellow_candidate") "Il documento deve proporre solo candidato giallo."
Add-Check "Prossima azione owner decision packet" ($json.next_safe_action -eq "prepare_product_listino_owner_decision_packet") "La prossima azione deve essere review proprietario."
Add-Check "Catalogo resta sandbox reference" ($catalog.catalog_status.mode -eq "sandbox_pricing_and_product_contract_reference") "Il catalogo non deve essere live checkout."
Add-Check "Catalogo pagamenti bloccati" ($catalog.catalog_status.real_payments -eq "blocked") "Il catalogo deve bloccare pagamenti."
Add-Check "Catalogo fatture bloccate" ($catalog.catalog_status.invoices -eq "blocked") "Il catalogo deve bloccare fatture."

$requiredMdPhrases = @(
  "non offerta commerciale live",
  "Regola principale",
  "Listino di riferimento da revisionare",
  "Cosa include ogni prezzo",
  "Decisioni proprietario richieste",
  "Risposta macchina se prova a comprare da listino non approvato",
  "Gli agenti non possono",
  "da rosso a candidato giallo"
)
foreach ($phrase in $requiredMdPhrases) {
  Add-Check "Frase MD presente: $phrase" ($md -match [regex]::Escape($phrase)) "Il Markdown deve spiegare chiaramente questo punto."
}

$combined = "$md`n$jsonText"
$unsafePhrases = @(
  '"live_offer_allowed": true',
  '"real_payment_allowed": true',
  '"invoice_allowed": true',
  '"subscription_activation_allowed": true',
  '"marketplace_publication_allowed": true',
  "listino approvato",
  "offerta commerciale live approvata",
  "prezzi definitivi approvati",
  "puoi comprare ora",
  "pagamento reale attivo",
  "fattura reale attiva",
  "subscription active",
  "live offer approved",
  "final prices approved",
  "marketplace listing approved"
)
foreach ($phrase in $unsafePhrases) {
  Add-Check "Nessuna frase pericolosa: $phrase" ($combined -notmatch [regex]::Escape($phrase)) "Non devono comparire affermazioni di offerta live o approvazione non autorizzata."
}

$failed = @($checks | Where-Object { -not $_.passed })
$passedCount = @($checks | Where-Object { $_.passed }).Count
$totalCount = $checks.Count
$status = if ($failed.Count -eq 0) { "SUPERATO" } else { "FALLITO" }

$report = @()
$report += "# Report controllo Product/Listino Owner Review"
$report += ""
$report += "Data controllo: 2026-06-18"
$report += ""
$report += "Esito: $status"
$report += ""
$report += "Controlli superati: $passedCount/$totalCount"
$report += ""
$report += "Sintesi:"
$report += ""
$report += "- Il product/listino review pack copre prodotti, prezzi, unita' e cosa include ogni prezzo."
$report += "- Il catalogo resta riferimento sandbox, non offerta commerciale live."
$report += "- Il pack propone product_listino_approval come candidato giallo, non come gate verde."
$report += "- Pagamenti, fatture, abbonamenti, marketplace e prezzi live restano bloccati."
$report += ""
$report += "Dettaglio controlli:"
$report += ""
foreach ($check in $checks) {
  $mark = if ($check.passed) { "OK" } else { "KO" }
  $report += "- [$mark] $($check.name): $($check.detail)"
}

if ($failed.Count -gt 0) {
  $report += ""
  $report += "Controlli falliti:"
  foreach ($check in $failed) {
    $report += "- $($check.name): $($check.detail)"
  }
}

Set-Content -Path $reportPath -Value ($report -join "`n") -Encoding UTF8

$summary = [pscustomobject]@{
  probe = "product_listino_owner_review"
  date = "2026-06-18"
  status = $status
  passed = $passedCount
  total = $totalCount
  failed = @($failed | ForEach-Object { $_.name })
  owner_summary_it = "Product/Listino Owner Review e' una bozza interna verificata: copre prodotti, prezzi, unita' e include, ma non approva il listino come offerta commerciale live."
}

$summary | ConvertTo-Json -Depth 6 | Set-Content -Path $summaryPath -Encoding UTF8

if ($failed.Count -gt 0) {
  throw "Product/listino owner review probe failed: $($failed.Count) failed checks"
}

Write-Output "Probe completato: $passedCount/$totalCount controlli superati."
