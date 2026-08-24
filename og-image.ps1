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
  Draw the app icons and no cards: the four the site installs as, and two per
  tool. What to run after a change to logo.svg or to the palette. Combine with
  -Only for one tool's icons and nothing else.

.PARAMETER Only
  Draw one tool's card and icons instead of every tool's. Worth knowing about: the mark on
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

# The same line on every card, so it is written once.
$footer = 'No uploads | No accounts | Works offline'

function Read-ToolFields {
  <#
    .SYNOPSIS
      The named top-level keys of a tool.toml, as a hashtable.

    .DESCRIPTION
      PowerShell has no TOML reader and this needs three keys, all of which are
      plain one-line basic strings in every tool.toml - `name = "Image Resizer"`.
      So it matches those and nothing else, rather than pulling in a parser or,
      worse, half-writing one. A key whose value is a multi-line string or
      carries an escape is simply not found, and the caller throws by name
      rather than drawing a card with a blank on it.

      A trailing `#` comment is allowed, because `icon` carries one in every
      tool.toml - a line of HTML entities is unreadable without it. The comment
      cannot be mistaken for part of the value: the value ends at its quote.
  #>
  param(
    [Parameter(Mandatory)][string]$Path,
    [Parameter(Mandatory)][string[]]$Keys
  )

  $found = @{}
  foreach ($line in Get-Content -Path $Path -Encoding UTF8) {
    foreach ($key in $Keys) {
      if ($found.ContainsKey($key)) { continue }
      if ($line -match ('^' + [regex]::Escape($key) + '\s*=\s*"([^"\\]*)"\s*(#.*)?$')) {
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
  Screenshots a scrap of HTML into a bitmap, $Size pixels square, on a
  transparent ground.

.DESCRIPTION
  The one thing System.Drawing cannot do, done by the browser instead. It is
  needed twice: for logo.svg, which System.Drawing cannot read at all, and for
  the emoji a tool is marked with, which it can only draw in black - colour
  emoji are COLR/CBDT fonts and GDI+ renders none of that. A headless browser
  does both correctly and is already installed on any machine that can look at
  the site.
#>
function Get-HtmlImage {
  param(
    [Parameter(Mandatory)][string]$Html,
    [Parameter(Mandatory)][int]$Size
  )

  $htmlPath = Join-Path ([System.IO.Path]::GetTempPath()) 'abox-mark.html'
  $pngPath  = Join-Path ([System.IO.Path]::GetTempPath()) 'abox-mark.png'
  Set-Content -Path $htmlPath -Value $Html -Encoding utf8

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
  $image = New-Object System.Drawing.Bitmap $shot
  $shot.Dispose()

  Remove-Item $htmlPath, $pngPath -Force

  return $image
}

<#
.SYNOPSIS
  Renders logo.svg to a bitmap, $Size pixels square, on a transparent ground.

.DESCRIPTION
  Hand-porting the mark into GraphicsPath calls would mean two drawings free to
  drift apart, so it is rasterised from the one file that defines it: the SVG is
  inlined into a scrap of HTML with the wanted palette forced on top of it.

  The palette has to be forced because a headless browser screenshotting a file
  cannot be told which colour scheme to pretend to be in, and logo.svg themes
  itself with a prefers-color-scheme block.

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

  return Get-HtmlImage -Size $Size -Html @"
<!doctype html><meta charset="utf-8">
<style>html,body{margin:0;background:transparent}
svg{display:block;width:${Size}px;height:${Size}px}
$css</style>
$svg
"@
}

<#
.SYNOPSIS
  Renders one emoji to a bitmap, $Size pixels square, on a transparent ground.

.DESCRIPTION
  $Glyph is a tool's `icon` straight out of its tool.toml, HTML entities and
  all - which is why it can be dropped into the markup below unchanged and why
  nothing here has to know how many code points a scissors-with-variation-
  selector is.

  $Scale is the em size as a fraction of the tile, and it is how much of the
  tile the glyph covers rather than a font size anyone would recognise: an emoji
  glyph sits inside its em box with its own padding, so the drawn shape comes
  out at roughly nine tenths of it. It is a parameter because the two icons a
  tool needs differ in nothing else - see New-ToolIconPng.
#>
function Get-GlyphImage {
  param(
    [Parameter(Mandatory)][string]$Glyph,
    [Parameter(Mandatory)][int]$Size,
    [Parameter(Mandatory)][double]$Scale
  )

  $em = [int]($Size * $Scale)

  # overflow:hidden is load-bearing. An emoji's ink can spill a few pixels out
  # of the box its em size asks for, and the browser answers that with
  # scrollbars - which the screenshot then includes, so the first icons drawn
  # here shipped with a grey scrollbar down two edges.
  #
  # The font stack ends in sans-serif rather than in a colour font this machine
  # may not have: a missing family means a tofu box saved as an app icon, and a
  # wrong-but-drawn glyph is easier to notice than a subtly empty one.
  return Get-HtmlImage -Size $Size -Html @"
<!doctype html><meta charset="utf-8">
<style>html,body{margin:0;background:transparent;overflow:hidden}
div{width:${Size}px;height:${Size}px;display:flex;align-items:center;
    justify-content:center;font-size:${em}px;line-height:1;
    font-family:"Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif}
</style>
<div>$Glyph</div>
"@
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

<#
.SYNOPSIS
  Draws one tool's emoji on an opaque tile, as the icon an installed tool wears.

.DESCRIPTION
  The site mark says which site an app came from; a tool's own emoji says which
  tool it is, which is what somebody looking at a launcher full of them needs to
  know. So the front page installs as the toolbox and each tool installs as
  itself, from the same `icon` that sits beside its heading on the page.

  Two are drawn per tool and they differ only in $Scale, because two different
  things read them. The plain one is what a desktop and a tab strip show, filling
  its tile the way an app icon there does. The maskable one is for Android, which
  crops an icon to whatever shape the launcher uses - a circle, a squircle, a
  teardrop - and guarantees only the middle 80% of it survives; that glyph is
  drawn small enough to sit inside a circle of that size however it is cut.

  512 and no smaller, unlike the site icons, which also come in 180 for iOS and
  192 because that is a size Chrome's install criteria used to name. There is no
  home-screen tile to match here, and nothing reads a tool icon but the install
  UI, which scales whatever it is given.
#>
function New-ToolIconPng {
  param(
    [Parameter(Mandatory)][string]$Path,
    [Parameter(Mandatory)][string]$Glyph,
    [Parameter(Mandatory)][double]$Scale
  )

  $size = 512
  $tile = [System.Drawing.ColorTranslator]::FromHtml('#f6f7f9')

  $bmp = New-Object System.Drawing.Bitmap $size, $size
  $g   = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = 'AntiAlias'
  $g.FillRectangle((New-Object System.Drawing.SolidBrush $tile), 0, 0, $size, $size)

  # Rasterised at the full tile size and laid over it corner to corner: the
  # glyph is centred inside its own frame by the flexbox, so there is no inset to
  # work out here and no chance of two places disagreeing about the centre.
  #
  # Not $glyph, which is $Glyph: variable names are case-insensitive here, so
  # that assignment would put the bitmap into the [string] parameter and the
  # parameter would dutifully convert it to "System.Drawing.Bitmap".
  $drawn = Get-GlyphImage -Glyph $Glyph -Size $size -Scale $Scale
  $g.DrawImage($drawn, 0, 0, $size, $size)
  $drawn.Dispose()

  $full = Join-Path $PSScriptRoot $Path
  $bmp.Save($full, [System.Drawing.Imaging.ImageFormat]::Png)

  $g.Dispose()
  $bmp.Dispose()

  Write-Host "wrote $full"
}

# The icons the SITE installs as, drawn from the mark. They belong to no tool, so
# -Only skips them along with the other tools' files.
#
# 180 is what iOS asks for; 192 and 512 are what the front page's manifest lists,
# and the maskable copy is the 512 again with the margin Android's crop needs.
# The insets are about a tenth of the size for the first three and 22% for the
# last, which is what keeps the mark inside the circle a launcher may cut it to.
if (-not $Only) {
  New-IconPng -Path 'shared\icon-180.png'          -Size 180 -Inset 18
  New-IconPng -Path 'shared\icon-192.png'          -Size 192 -Inset 19
  New-IconPng -Path 'shared\icon-512.png'          -Size 512 -Inset 51
  New-IconPng -Path 'shared\icon-512-maskable.png' -Size 512 -Inset 113
}

# The hub's own card. Written out here because it is the one that belongs to no
# tool - everything below reads its words from the tool it belongs to.
if (-not ($Only -or $Icons)) {
  New-OgImage -Path 'shared\og.png' `
    -Title 'Tools that never touch a server' `
    -Subtitle 'Small, single-purpose utilities that do all of their work inside your browser.' `
    -Footer $footer
}

# One card and two icons per tool, from that tool's own tool.toml.
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
#
# -Icons skips the card and keeps the icons. The card is the expensive half and
# none of its redraws are byte-identical, so a change to what an icon looks like
# must not arrive as every card in the repository being dirty.
foreach ($config in Get-ChildItem -Path (Join-Path $PSScriptRoot 'tools') -Filter 'tool.toml' -Recurse) {
  $slug = $config.Directory.Name
  if ($Only -and $Only -ne $slug) { continue }

  $fields = Read-ToolFields -Path $config.FullName -Keys @('name', 'og_card', 'icon')
  foreach ($key in @('name', 'og_card', 'icon')) {
    if (-not $fields.ContainsKey($key)) {
      throw "tools\$slug\tool.toml has no $key, so its images cannot be drawn"
    }
  }

  if (-not $Icons) {
    New-OgImage -Path (Join-Path 'tools' (Join-Path $slug 'og.png')) `
      -Title $fields['name'] `
      -Subtitle $fields['og_card'] `
      -Footer $footer
  }

  # The em box at 0.82 of the tile for the plain icon and 0.55 for the maskable
  # one. An emoji sits inside its em box with padding of its own, so the drawn
  # shape comes out at roughly nine tenths of those: the first fills its tile
  # with a margin left around it, and the second sits comfortably inside the
  # circle a launcher may crop it to.
  New-ToolIconPng -Path (Join-Path 'tools' (Join-Path $slug 'icon.png')) `
    -Glyph $fields['icon'] -Scale 0.82
  New-ToolIconPng -Path (Join-Path 'tools' (Join-Path $slug 'icon-maskable.png')) `
    -Glyph $fields['icon'] -Scale 0.55
}
