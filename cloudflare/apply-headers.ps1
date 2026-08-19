<#
.SYNOPSIS
  Applies cloudflare/response-headers.json as the response header transform
  rules for the zone, then checks that the headers actually come back.

.DESCRIPTION
  GitHub Pages cannot set response headers, so the _headers file at the repo
  root is inert there and the headers have to be added by Cloudflare instead.
  Configuring that only in the dashboard would put the site's security headers
  somewhere no reader of this repository can see or review - which is a poor
  fit for a site whose whole claim is "read the code and check for yourself".
  This script keeps the JSON as the source of truth and pushes it to the API.

  IMPORTANT: the endpoint used here REPLACES every rule in the response header
  transform phase with the contents of the JSON file. That is deliberate - the
  file describes the whole desired state, not a patch - but it does mean a rule
  added by hand in the dashboard will be removed the next time this runs. Add
  it to the JSON instead. Run -Export first to see what is there now.

  The file is sent byte for byte, with nothing interpolated into it, so what is
  in the repository is exactly what reaches Cloudflare.

.PARAMETER Token
  Cloudflare API token. Defaults to $env:CLOUDFLARE_API_TOKEN.
  Needs Zone / Transform Rules / Edit, plus Zone / Zone / Read if you want the
  zone ID looked up from the domain name rather than passing it in.

.PARAMETER ZoneId
  Zone ID. Defaults to $env:CLOUDFLARE_ZONE_ID, and is otherwise looked up from
  -Domain. It is on the Overview page of the zone in the dashboard.

.PARAMETER Domain
  The zone name, used for the lookup and for the verification request.

.PARAMETER Export
  Print the rules currently live in the zone and stop. Use this before the
  first apply, to check that the JSON in the repo matches what is deployed.

.PARAMETER VerifyOnly
  Skip the write and just report which headers the live site returns.

.PARAMETER DryRun
  Print the payload and the target URL, then stop without sending anything.

.EXAMPLE
  $env:CLOUDFLARE_API_TOKEN = "..."
  .\cloudflare\apply-headers.ps1 -Export

.EXAMPLE
  .\cloudflare\apply-headers.ps1

.EXAMPLE
  .\cloudflare\apply-headers.ps1 -VerifyOnly
#>

[CmdletBinding()]
param(
  [string] $Token  = $env:CLOUDFLARE_API_TOKEN,
  [string] $ZoneId = $env:CLOUDFLARE_ZONE_ID,
  [string] $Domain = "abox.tools",
  [switch] $Export,
  [switch] $VerifyOnly,
  [switch] $DryRun
)

$ErrorActionPreference = "Stop"

# Windows PowerShell 5.1 still defaults to TLS 1.0 for outbound requests, which
# the Cloudflare API refuses.
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$phase       = "http_response_headers_transform"
$payloadPath = Join-Path $PSScriptRoot "response-headers.json"

function Write-Step($text) { Write-Host "`n$text" -ForegroundColor Cyan }

function Get-ApiError($errorRecord) {
  # Cloudflare explains what it rejected in the response body, which
  # Invoke-RestMethod throws away. Dig it back out.
  try {
    $stream = $errorRecord.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    return $reader.ReadToEnd()
  } catch {
    return $errorRecord.Exception.Message
  }
}

function Invoke-Cf($Method, $Url, $BodyBytes) {
  $headers = @{ Authorization = "Bearer $Token" }
  try {
    if ($null -eq $BodyBytes) {
      return Invoke-RestMethod -Method $Method -Uri $Url -Headers $headers
    }
    return Invoke-RestMethod -Method $Method -Uri $Url -Headers $headers `
      -ContentType "application/json" -Body $BodyBytes
  } catch {
    throw "$Method $Url failed:`n$(Get-ApiError $_)"
  }
}

function Resolve-ZoneId {
  if ($ZoneId) { return $ZoneId }
  Write-Step "Looking up the zone ID for $Domain"
  $zones = Invoke-Cf "GET" "https://api.cloudflare.com/client/v4/zones?name=$Domain" $null
  if (-not $zones.result -or $zones.result.Count -eq 0) {
    throw "No zone named $Domain on this account. Pass -ZoneId explicitly."
  }
  Write-Host "  $($zones.result[0].id)"
  return $zones.result[0].id
}

function Assert-Token {
  if (-not $Token) {
    throw "No API token. Set `$env:CLOUDFLARE_API_TOKEN or pass -Token. Never commit it."
  }
}

# ---- what the payload asks for -------------------------------------------

if (-not (Test-Path $payloadPath)) { throw "Payload not found: $payloadPath" }

$rawJson = Get-Content $payloadPath -Raw
try {
  $payload = $rawJson | ConvertFrom-Json
} catch {
  throw "response-headers.json is not valid JSON: $($_.Exception.Message)"
}

$expected = @{}
foreach ($rule in $payload.rules) {
  foreach ($h in $rule.action_parameters.headers.PSObject.Properties) {
    if ($h.Value.operation -eq "set") { $expected[$h.Name] = $h.Value.value }
  }
}

Write-Step "Payload: $($payload.rules.Count) rule(s), $($expected.Count) header(s)"
foreach ($name in ($expected.Keys | Sort-Object)) {
  Write-Host ("  {0,-27} {1}" -f $name, $expected[$name])
}

# ---- export: what is live right now --------------------------------------

if ($Export) {
  Assert-Token
  $zone = Resolve-ZoneId
  Write-Step "Rules currently live in the $phase phase"
  $live = Invoke-Cf "GET" "https://api.cloudflare.com/client/v4/zones/$zone/rulesets/phases/$phase/entrypoint" $null
  if (-not $live.result.rules -or $live.result.rules.Count -eq 0) {
    Write-Host "  (none - the phase is empty)"
  } else {
    $live.result.rules | ConvertTo-Json -Depth 10
    Write-Host "`nCompare this with response-headers.json before applying." -ForegroundColor Yellow
    Write-Host "Anything live but not in the file will be removed by an apply."
  }
  return
}

# ---- apply ---------------------------------------------------------------

if (-not $VerifyOnly) {
  Assert-Token
  $zone = Resolve-ZoneId
  $url  = "https://api.cloudflare.com/client/v4/zones/$zone/rulesets/phases/$phase/entrypoint"

  if ($DryRun) {
    Write-Step "Dry run - would PUT to:"
    Write-Host "  $url"
    Write-Host $rawJson
    return
  }

  Write-Step "PUT $url"
  Write-Host "  This replaces every rule in the $phase phase." -ForegroundColor Yellow

  # Sent as raw bytes so the file goes over the wire exactly as committed.
  $bytes  = [System.Text.Encoding]::UTF8.GetBytes($rawJson)
  $result = Invoke-Cf "PUT" $url $bytes

  if (-not $result.success) {
    throw "Cloudflare rejected the ruleset: $($result.errors | ConvertTo-Json -Depth 5)"
  }
  Write-Host "  Applied. Ruleset $($result.result.id), version $($result.result.version)." -ForegroundColor Green
}

# ---- verify against the live site ----------------------------------------

Write-Step "Checking what https://$Domain/ actually returns"

try {
  $response = Invoke-WebRequest -Method Head -Uri "https://$Domain/" -UseBasicParsing
} catch {
  Write-Host "  Could not reach the site: $($_.Exception.Message)" -ForegroundColor Yellow
  Write-Host "  The rule may still be fine - check again once DNS and TLS are settled."
  return
}

$wrong = 0
foreach ($name in ($expected.Keys | Sort-Object)) {
  $actual = $response.Headers[$name]
  if (-not $actual) {
    Write-Host ("  MISSING  {0}" -f $name) -ForegroundColor Red
    $wrong++
  } elseif ($actual -ne $expected[$name]) {
    Write-Host ("  DIFFERS  {0}: {1}" -f $name, $actual) -ForegroundColor Yellow
    $wrong++
  } else {
    Write-Host ("  ok       {0}" -f $name) -ForegroundColor Green
  }
}

if ($wrong -gt 0) {
  Write-Host "`n$wrong header(s) not as configured." -ForegroundColor Yellow
  Write-Host "The usual cause is that the DNS record is not proxied - transform rules"
  Write-Host "only run on traffic that goes through Cloudflare (orange cloud, not grey)."
} else {
  Write-Host "`nAll headers present and correct." -ForegroundColor Green
}
