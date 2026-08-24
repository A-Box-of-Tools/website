<#
.SYNOPSIS
  Regenerates the Open Graph share images (og.png) for every page, and the icons
  a launcher shows for an installed tool.

.DESCRIPTION
  When a link to this site is pasted into a chat app, a forum, or a social
  network, the unfurler asks for og:image and renders whatever comes back. With
  no image the link is a bare grey stub; with one it is a card. That is the
  whole reason this script exists.

  The images are checked in, so this only needs running when the wording on a
  card changes or a new tool is added. It draws with System.Drawing, which ships
  with Windows - like serve.ps1, there is nothing to install.

  Sizes and colours match the site: 1200x630 is the size every unfurler crops
  to, and the palette is the dark theme from site.css so a shared card looks
  like the page behind it.

  The site mark on the cards is logo.svg itself. System.Drawing cannot read
  SVG, and a hand-drawn copy of the mark would drift away from the file it was
  copied from, so a headless Edge rasterises it instead; see Get-MarkImage.

  The cards come from the tools themselves: each one's heading is `name` in its
  tools/<slug>/tool.toml and its subtitle is `og_card` there, so adding a tool
  adds its card and nothing here has to be kept in step by hand.

.PARAMETER Icons
  Draw the four app icons and stop - no cards at all. What to run after a change
  to logo.svg or to the palette, and nothing else needs it.

.PARAMETER Only
  Draw one tool's card instead of all of them. Worth knowing about: the mark on
  each card is rasterised by a headless Edge, that flakes about one call in
  every run, and the redraws are not byte-identical even when it does not - so
  a full run dirties every og.png whether or not the wording changed. If you
  changed one tool, name it.

.EXAMPLE
  .\og-image.ps1

.EXAMPLE
  .\og-image.ps1 -Only resize-image

.EXAMPLE
  .\og-image.ps1 -Icons
#>

param(
  [string]$Only,
  [switch]$Icons
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

# The two switches ask for opposite halves of this script, and asking for both
# would quietly draw nothing at all: -Only skips the icons and -Icons stops
# before the cards.
if ($Icons -and $Only) {
  throw "-Icons and -Only cannot both be given: the icons belong to the site, not to one tool."
}

# The same line on every card, so it is written once.
$footer = 'No uploads | No accounts | Works offline'

function Read-ToolFields {
  <#
    .SYNOPSIS
      The named top-level keys of a tool.toml, as a hashtable.

    .DESCRIPTION
      PowerShell has no TOML reader and this needs two keys, both of which are
      plain one-line basic strings in every tool.toml - `name = "Image Resizer"`.
      So it matches those and nothing else, rather than pulling in a parser or,
      worse, half-writing one. A key whose value is a multi-line string or
      carries an escape is simply not found, and the caller throws by name
      rather than drawing a card with a blank on it.
  #>
  param(
    [Parameter(Mandatory)][string]$Path,
    [Parameter(Mandatory)][string[]]$Keys
  )

  $found = @{}
  foreach ($line in Get-Content -Path $Path -Encoding UTF8) {
    foreach ($key in $Keys) {
      if ($found.ContainsKey($key)) { continue }
      if ($line -match ('^' + [regex]::Escape($key) + '\s*=\s*"([^"\\]*)"\s*$')) {
        $found[$key] = $Matches[1]
      }
    }
  }
  return $found
}

# Dark-theme tokens, copied from :root in site.css. Kept as literals rather
# than parsed out of the CSS: this runs once in a while, by hand, and a parser
# would be more code than the three colours are worth.
$bg     = [System.Drawing.ColorTranslator]::FromHtml('#14171b')
$text   = [System.Drawing.ColorTranslator]::FromHtml('#e8eaed')
$dim    = [System.Drawing.ColorTranslator]::FromHtml('#9aa4b2')
$accent = [System.Drawing.ColorTranslator]::FromHtml('#5b9bd8')
# The two palettes the mark is drawn in, as CSS the rasteriser can inject. They
# are the same values logo.svg carries; they have to be repeated here because a
# headless browser screenshotting the file cannot be told which colour scheme to
# pretend to be in, so the choice is made by overriding the classes instead.
$markPaletteDark = @'
svg .logo-lid{stroke:#5b9bd8}svg .logo-tool{fill:#3772ab}svg .logo-tool-alt{fill:#5b9bd8}
svg .logo-box{fill:#3772ab}svg .logo-band{fill:#5b9bd8}svg .logo-latch{fill:#cfe3f8}
'@

$markPaletteLight = @'
svg .logo-lid{stroke:#2b6cb0}svg .logo-tool{fill:#1d4f83}svg .logo-tool-alt{fill:#2b6cb0}
svg .logo-box{fill:#1d4f83}svg .logo-band{fill:#2b6cb0}svg .logo-latch{fill:#d7e7f7}
'@

<#
.SYNOPSIS
  Finds a Chromium to rasterise SVG with.

.DESCRIPTION
  Edge ships with Windows, so in practice this always finds one and the script
  keeps its "nothing to install" promise. Chrome is checked too, for machines
  where Edge has been removed.
#>
function Find-Chromium {
  $candidates = @(
    "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe",
    "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe",
    "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
    "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe"
  )

  foreach ($c in $candidates) { if (Test-Path $c) { return $c } }

  throw "No Edge or Chrome found to render logo.svg. Install either, or draw the mark by hand."
}

<#
.SYNOPSIS
  Renders logo.svg to a bitmap, $Size pixels square, on a transparent ground.

.DESCRIPTION
  System.Drawing cannot read SVG, and hand-porting the mark into GraphicsPath
  calls means two drawings that drift apart. So the mark is rasterised from the
  one file that defines it: the SVG is inlined into a scrap of HTML with the
  wanted palette forced on top of it, and a headless browser screenshots it.

  The window is exactly the size asked for and the SVG is stretched to fill it,
  so the whole 64x64 view box lands in the frame with no cropping.
#>
function Get-MarkImage {
  param(
    [Parameter(Mandatory)][int]$Size,
    [Parameter(Mandatory)][ValidateSet('light', 'dark')][string]$Palette
  )

  $svg = Get-Content (Join-Path $PSScriptRoot 'shared\logo.svg') -Raw
  $css = if ($Palette -eq 'dark') { $markPaletteDark } else { $markPaletteLight }

  $html = @"
<!doctype html><meta charset="utf-8">
<style>html,body{margin:0;background:transparent}
svg{display:block;width:${Size}px;height:${Size}px}
$css</style>
$svg
"@

  $htmlPath = Join-Path ([System.IO.Path]::GetTempPath()) 'abox-mark.html'
  $pngPath  = Join-Path ([System.IO.Path]::GetTempPath()) 'abox-mark.png'
  Set-Content -Path $htmlPath -Value $html -Encoding utf8

  # --default-background-color=00000000 is what keeps the ground transparent;
  # without it the shot comes back on opaque white and the mark cannot be laid
  # over a card.
  $args = @(
    '--headless', '--disable-gpu', '--default-background-color=00000000',
    "--screenshot=$pngPath", "--window-size=$Size,$Size",
    ('file:///' + $htmlPath.Replace('\', '/'))
  )
  # Edge writes a progress line to stderr even on success, and with
  # $ErrorActionPreference = 'Stop' PowerShell turns that into a terminating
  # error - the screenshot is already on disk by the time it throws. Only the
  # preference is relaxed, and only around this one call.
  $wasStopping = $ErrorActionPreference
  $ErrorActionPreference = 'Continue'
  & (Find-Chromium) $args | Out-Null
  $ErrorActionPreference = $wasStopping

  if (-not (Test-Path $pngPath)) { throw "The headless browser wrote no screenshot to $pngPath." }

  # Copied into a new bitmap so the file on disk can be deleted straight away -
  # Image::FromFile keeps the file locked for as long as the image lives.
  $shot = [System.Drawing.Image]::FromFile($pngPath)
  $mark = New-Object System.Drawing.Bitmap $shot
  $shot.Dispose()

  Remove-Item $htmlPath, $pngPath -Force

  return $mark
}

function New-OgImage {
  param(
    [Parameter(Mandatory)][string]$Path,
    [Parameter(Mandatory)][string]$Title,
    [Parameter(Mandatory)][string]$Subtitle,
    [Parameter(Mandatory)][string]$Footer
  )

  $w = 1200
  $h = 630

  $bmp = New-Object System.Drawing.Bitmap $w, $h
  $g   = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode     = 'AntiAlias'
  $g.TextRenderingHint = 'ClearTypeGridFit'

  $bgBrush = New-Object System.Drawing.SolidBrush $bg
  $g.FillRectangle($bgBrush, 0, 0, $w, $h)

  # Accent rule down the left edge. Cheap, and it stops the card reading as a
  # plain black rectangle in a feed full of plain black rectangles.
  $accentBrush = New-Object System.Drawing.SolidBrush $accent
  $g.FillRectangle($accentBrush, 0, 0, 10, $h)

  $margin = 88

  $fontBrand    = New-Object System.Drawing.Font 'Segoe UI', 26, ([System.Drawing.FontStyle]::Bold)
  $fontTitle    = New-Object System.Drawing.Font 'Segoe UI', 62, ([System.Drawing.FontStyle]::Bold)
  $fontSubtitle = New-Object System.Drawing.Font 'Segoe UI', 30, ([System.Drawing.FontStyle]::Regular)
  $fontFooter   = New-Object System.Drawing.Font 'Segoe UI', 24, ([System.Drawing.FontStyle]::Regular)

  $textBrush   = New-Object System.Drawing.SolidBrush $text
  $dimBrush    = New-Object System.Drawing.SolidBrush $dim

  # StringFormat with word wrap, so a long title breaks instead of running off
  # the right edge of the card.
  $fmt = New-Object System.Drawing.StringFormat
  $fmt.Trimming = [System.Drawing.StringTrimming]::Word

  # Brand line: the mark, then the name beside it, sitting on the same baseline.
  # It is rasterised at twice the size it is drawn at, so the edges stay clean.
  $mark = Get-MarkImage -Size 144 -Palette dark
  $g.DrawImage($mark, $margin, 34, 72, 72)
  $mark.Dispose()
  $g.DrawString('abox.tools', $fontBrand, $accentBrush, ($margin + 84), 74)

  $titleRect = New-Object System.Drawing.RectangleF $margin, 160, ($w - ($margin * 2)), 260
  $g.DrawString($Title, $fontTitle, $textBrush, $titleRect, $fmt)

  $subRect = New-Object System.Drawing.RectangleF $margin, 420, ($w - ($margin * 2)), 120
  $g.DrawString($Subtitle, $fontSubtitle, $dimBrush, $subRect, $fmt)

  # The separator is built from a code point rather than typed literally, so
  # this script stays pure ASCII on disk the way the HTML files do. Callers
  # write "|" and get a middot.
  $sep = [string][char]0x00B7
  $g.DrawString(($Footer -replace '\|', $sep), $fontFooter, $accentBrush, $margin, ($h - 88))

  $full = Join-Path $PSScriptRoot $Path
  $bmp.Save($full, [System.Drawing.Imaging.ImageFormat]::Png)

  $g.Dispose()
  $bmp.Dispose()

  Write-Host "wrote $full"
}

<#
.SYNOPSIS
  Draws the site mark on an opaque tile, $Size pixels square, as a PNG.

.DESCRIPTION
  The icon a launcher shows for the site: on an iOS home screen, and - since
  every tool page carries a web app manifest - in the Chrome and Android app
  lists for an installed tool. There is one drawing for all of them, because the
  mark belongs to the site and an installed tool is told apart by its name.

  The tile is opaque rather than transparent. A launcher puts an icon on
  whatever ground it likes and a mark floating on that ground is not the same
  picture twice, so the ground comes with it.

  $Inset is the margin, and the reason there is more than one size of it. A
  plain icon needs about a tenth, so the mark is not jammed against the rounded
  corners the platform crops the tile to. A maskable one needs far more: Android
  crops it to whatever shape the launcher uses - a circle, a squircle, a
  teardrop - and guarantees only the middle 80% survives, so the mark is drawn
  small enough to sit inside a circle of that size however it is cut.

  This function was deleted in #73 while the call to it at the foot of the file
  stayed, so a full run threw on its last line with every card already drawn. It
  is restored here, and takes the size it draws rather than assuming 180.
#>
function New-IconPng {
  param(
    [Parameter(Mandatory)][string]$Path,
    [Parameter(Mandatory)][int]$Size,
    [Parameter(Mandatory)][int]$Inset
  )

  $tile = [System.Drawing.ColorTranslator]::FromHtml('#f6f7f9')

  $bmp = New-Object System.Drawing.Bitmap $Size, $Size
  $g   = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = 'AntiAlias'
  $g.FillRectangle((New-Object System.Drawing.SolidBrush $tile), 0, 0, $Size, $Size)

  $side = $Size - ($Inset * 2)
  $mark = Get-MarkImage -Size $side -Palette light
  $g.DrawImage($mark, $Inset, $Inset, $side, $side)
  $mark.Dispose()

  $full = Join-Path $PSScriptRoot $Path
  $bmp.Save($full, [System.Drawing.Imaging.ImageFormat]::Png)

  $g.Dispose()
  $bmp.Dispose()

  Write-Host "wrote $full"
}

# The app icons belong to the site rather than to any tool, so -Only skips them
# along with the other tools' cards. Without that, asking for one tool still
# rewrote files it had nothing to do with.
#
# 180 is what iOS asks for; 192 and 512 are what the web app manifest lists, and
# the maskable copy is the 512 again with the margin Android's crop needs. The
# insets are about a tenth of the size for the first three and 22% for the last,
# which is what keeps the mark inside the circle a launcher may cut it to.
if (-not $Only) {
  New-IconPng -Path 'shared\icon-180.png'          -Size 180 -Inset 18
  New-IconPng -Path 'shared\icon-192.png'          -Size 192 -Inset 19
  New-IconPng -Path 'shared\icon-512.png'          -Size 512 -Inset 51
  New-IconPng -Path 'shared\icon-512-maskable.png' -Size 512 -Inset 113
}

# They are drawn first so that -Icons can stop here. The cards below are the
# expensive half of this script and none of their redraws are byte-identical, so
# changing an icon must not arrive as every card in the repository being dirty.
if ($Icons) { return }

# The hub's own card. Written out here because it is the one that belongs to no
# tool - everything below reads its words from the tool it belongs to.
if (-not $Only) {
  New-OgImage -Path 'shared\og.png' `
    -Title 'Tools that never touch a server' `
    -Subtitle 'Small, single-purpose utilities that do all of their work inside your browser.' `
    -Footer $footer
}

# One card per tool, from that tool's own tool.toml.
#
# This used to be twenty-two more New-OgImage calls, and keeping them in step by
# hand did not work: every one repeated the tool's `name` as its -Title and the
# same line as its -Footer, and by the time this was written compress-pdf and
# text-tools had shipped with no entry at all. Their og.png exists, so each was
# drawn once from an entry nobody committed - which means the wording on those
# two cards could not be changed and nobody would find out.
#
# Reading the folder instead means a tool cannot be forgotten, and the card says
# what tool.toml says.
foreach ($config in Get-ChildItem -Path (Join-Path $PSScriptRoot 'tools') -Filter 'tool.toml' -Recurse) {
  $slug = $config.Directory.Name
  if ($Only -and $Only -ne $slug) { continue }

  $fields = Read-ToolFields -Path $config.FullName -Keys @('name', 'og_card')
  foreach ($key in @('name', 'og_card')) {
    if (-not $fields.ContainsKey($key)) {
      throw "tools\$slug\tool.toml has no $key, so its share card cannot be drawn"
    }
  }

  New-OgImage -Path (Join-Path 'tools' (Join-Path $slug 'og.png')) `
    -Title $fields['name'] `
    -Subtitle $fields['og_card'] `
    -Footer $footer
}
