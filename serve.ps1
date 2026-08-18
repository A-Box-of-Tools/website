<#
.SYNOPSIS
  Serves this folder over http://localhost:8080 so you can run the app locally.

.DESCRIPTION
  The app is plain static files, but browsers refuse to load ES modules and
  service workers from file:// URLs, so it needs to come from a real origin.
  This uses only .NET types built into Windows — nothing to install.

  http://localhost counts as a secure context, so the offline service worker
  registers here exactly as it would on an https:// host.

.EXAMPLE
  .\serve.ps1
  .\serve.ps1 -Port 3000
#>

param(
  [int]$Port = 8080
)

$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot

$mimeTypes = @{
  '.html' = 'text/html; charset=utf-8'
  '.js'   = 'text/javascript; charset=utf-8'
  '.mjs'  = 'text/javascript; charset=utf-8'
  '.css'  = 'text/css; charset=utf-8'
  '.json' = 'application/json; charset=utf-8'
  '.svg'  = 'image/svg+xml'
  '.png'  = 'image/png'
  '.jpg'  = 'image/jpeg'
  '.jpeg' = 'image/jpeg'
  '.webp' = 'image/webp'
  '.gif'  = 'image/gif'
  '.ico'  = 'image/x-icon'
  '.woff2'= 'font/woff2'
  '.md'   = 'text/markdown; charset=utf-8'
  '.txt'  = 'text/plain; charset=utf-8'
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")

try {
  $listener.Start()
} catch {
  Write-Host "Could not listen on port $Port." -ForegroundColor Red
  Write-Host "Either the port is in use, or Windows needs a URL reservation." -ForegroundColor Red
  Write-Host "Try a different port:  .\serve.ps1 -Port 3000" -ForegroundColor Yellow
  exit 1
}

Write-Host ""
Write-Host "  Images to Video" -ForegroundColor Cyan
Write-Host "  Serving $root"
Write-Host "  http://localhost:$Port/" -ForegroundColor Green
Write-Host "  Press Ctrl+C to stop."
Write-Host ""

try {
  while ($listener.IsListening) {
    $context = $listener.GetContext()
    $request = $context.Request
    $response = $context.Response

    try {
      $relative = [Uri]::UnescapeDataString($request.Url.AbsolutePath).TrimStart('/')
      if ([string]::IsNullOrWhiteSpace($relative)) { $relative = 'index.html' }

      # Resolve inside the served folder only — never let '..' escape upward.
      $candidate = Join-Path $root ($relative -replace '/', '\')
      $fullPath = [System.IO.Path]::GetFullPath($candidate)

      if (-not $fullPath.StartsWith([System.IO.Path]::GetFullPath($root), [StringComparison]::OrdinalIgnoreCase)) {
        $response.StatusCode = 403
        $response.Close()
        continue
      }

      if (-not (Test-Path -LiteralPath $fullPath -PathType Leaf)) {
        $response.StatusCode = 404
        $body = [System.Text.Encoding]::UTF8.GetBytes("404 - $relative not found")
        $response.ContentType = 'text/plain; charset=utf-8'
        $response.ContentLength64 = $body.Length
        $response.OutputStream.Write($body, 0, $body.Length)
        $response.Close()
        Write-Host "  404  $relative" -ForegroundColor DarkYellow
        continue
      }

      $extension = [System.IO.Path]::GetExtension($fullPath).ToLowerInvariant()
      $contentType = $mimeTypes[$extension]
      if (-not $contentType) { $contentType = 'application/octet-stream' }

      $bytes = [System.IO.File]::ReadAllBytes($fullPath)
      $response.ContentType = $contentType
      $response.ContentLength64 = $bytes.Length
      # Always revalidate during development so edits show up on reload.
      $response.Headers.Add('Cache-Control', 'no-cache, no-store, must-revalidate')
      $response.OutputStream.Write($bytes, 0, $bytes.Length)
      Write-Host "  200  $relative" -ForegroundColor DarkGray
    } catch {
      Write-Host "  500  $($_.Exception.Message)" -ForegroundColor Red
      try { $response.StatusCode = 500 } catch {}
    } finally {
      try { $response.Close() } catch {}
    }
  }
} finally {
  $listener.Stop()
  $listener.Close()
}
