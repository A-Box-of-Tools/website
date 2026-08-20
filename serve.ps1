<#
.SYNOPSIS
  Builds the site and serves it over http://localhost:8080.

.DESCRIPTION
  The site is plain static files, but they are generated: everything under dist\
  is built from templates\, config\ and tools\ by build.py. This script runs
  that build first and then serves the result, so what you look at is what
  would be deployed.

  Browsers refuse to load ES modules and service workers from file:// URLs, so
  the folder has to come from a real origin. The server itself uses only .NET
  types built into Windows — nothing to install. http://localhost counts as a
  secure context, so the offline service worker registers here exactly as it
  would on an https:// host.

.EXAMPLE
  .\serve.ps1
  .\serve.ps1 -Port 3000
  .\serve.ps1 -NoBuild        # serve dist\ as it stands, without rebuilding
#>

param(
  [int]$Port = 8080,
  [switch]$NoBuild,
  [string]$Root
)

$ErrorActionPreference = 'Stop'

if (-not $Root) { $Root = Join-Path $PSScriptRoot 'dist' }

if (-not $NoBuild) {
  $python = (Get-Command python -ErrorAction SilentlyContinue)
  if (-not $python) { $python = (Get-Command python3 -ErrorAction SilentlyContinue) }
  if (-not $python) {
    throw "Python 3.11+ is needed to build the site. Install it, or pass -NoBuild to serve dist\ as it stands."
  }
  Write-Host "  Building..." -ForegroundColor DarkGray
  & $python.Source (Join-Path $PSScriptRoot 'build.py')
  if ($LASTEXITCODE -ne 0) { throw 'build failed' }
}

if (-not (Test-Path $Root)) {
  throw "$Root does not exist. Run 'python build.py' first, or drop -NoBuild."
}

$root = (Resolve-Path $Root).Path
# Compared with a trailing separator on it, so a sibling folder whose name
# merely starts with the root's - dist-evil beside dist - cannot pass the check.
$rootPrefix = if ($root.EndsWith('\')) { $root } else { "$root\" }

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
  # Added for sitemap.xml. GitHub Pages already serves .xml correctly; this
  # only stops the local server handing it back as a binary download.
  '.xml'  = 'application/xml; charset=utf-8'
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
Write-Host "  A Box of Tools" -ForegroundColor Cyan
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

      if (-not $fullPath.StartsWith($rootPrefix, [StringComparison]::OrdinalIgnoreCase)) {
        $response.StatusCode = 403
        $response.Close()
        continue
      }

      # Directory requests, so tools can live at their own subpath the way they
      # will on GitHub Pages. The redirect matters as much as the index lookup:
      # without a trailing slash the page's relative links resolve one level too
      # high, and styles.css would be fetched from the site root.
      if (Test-Path -LiteralPath $fullPath -PathType Container) {
        if (-not $request.Url.AbsolutePath.EndsWith('/')) {
          $response.StatusCode = 301
          $response.RedirectLocation = $request.Url.AbsolutePath + '/'
          $response.Close()
          Write-Host "  301  $relative/" -ForegroundColor DarkCyan
          continue
        }
        $fullPath = Join-Path $fullPath 'index.html'
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
