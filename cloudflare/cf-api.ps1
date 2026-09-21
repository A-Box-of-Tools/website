# What apply-headers.ps1 and apply-redirects.ps1 both need: the API call, the
# zone lookup, and a way to ask the live site a question without following the
# answer. Dot-sourced, so these read the caller's $Token, $ZoneId and $Domain
# rather than being handed them - the two scripts take the same parameters for
# the same reasons, and there is one place to get the TLS setting wrong.

# Windows PowerShell 5.1 still defaults to TLS 1.0 for outbound requests, which
# the Cloudflare API refuses.
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

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

function Get-EdgeAnswer($Url, $UserAgent) {
  # The status the edge gives this address, and where it points if it is a
  # redirect - without following it, and without a 403 or a 404 becoming an
  # exception. Invoke-WebRequest does neither: it follows a 301 to the page
  # behind it and throws on anything past 399, and both of the checks that use
  # this are asking about exactly those answers.
  $request = [Net.HttpWebRequest]::Create($Url)
  $request.Method = "GET"
  $request.AllowAutoRedirect = $false
  $request.Timeout = 20000
  if ($UserAgent) { $request.UserAgent = $UserAgent }
  try {
    $response = $request.GetResponse()
  } catch {
    # PowerShell wraps what a .NET method throws, and how deep depends on the
    # version, so look for the WebException rather than assume where it is.
    $failure = $_.Exception
    while ($failure -and -not ($failure -is [Net.WebException])) { $failure = $failure.InnerException }
    if ($null -eq $failure -or $null -eq $failure.Response) {
      return [pscustomobject]@{ Status = 0; Location = $null; Note = $_.Exception.Message }
    }
    $response = $failure.Response
  }
  try {
    return [pscustomobject]@{
      Status   = [int]$response.StatusCode
      Location = $response.Headers["Location"]
      Note     = $null
    }
  } finally {
    $response.Close()
  }
}
