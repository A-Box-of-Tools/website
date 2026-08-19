<#
.SYNOPSIS
  Regenerates the Open Graph share images (og.png) for every page.

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

.EXAMPLE
  .\og-image.ps1
#>

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

# Dark-theme tokens, copied from :root in site.css. Kept as literals rather
# than parsed out of the CSS: this runs once in a while, by hand, and a parser
# would be more code than the three colours are worth.
$bg     = [System.Drawing.ColorTranslator]::FromHtml('#14171b')
$text   = [System.Drawing.ColorTranslator]::FromHtml('#e8eaed')
$dim    = [System.Drawing.ColorTranslator]::FromHtml('#9aa4b2')
$accent = [System.Drawing.ColorTranslator]::FromHtml('#5b9bd8')

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

  $g.DrawString('abox.tools', $fontBrand, $accentBrush, $margin, 74)

  $titleRect = New-Object System.Drawing.RectangleF $margin, 160, ($w - ($margin * 2)), 260
  $g.DrawString($Title, $fontTitle, $textBrush, $titleRect, $fmt)

  $subRect = New-Object System.Drawing.RectangleF $margin, 420, ($w - ($margin * 2)), 120
  $g.DrawString($Subtitle, $fontSubtitle, $dimBrush, $subRect, $fmt)

  $g.DrawString($Footer, $fontFooter, $accentBrush, $margin, ($h - 96))

  $full = Join-Path $PSScriptRoot $Path
  $bmp.Save($full, [System.Drawing.Imaging.ImageFormat]::Png)

  $g.Dispose()
  $bmp.Dispose()

  Write-Host "wrote $full"
}

New-OgImage -Path 'og.png' `
  -Title 'Tools that never touch a server' `
  -Subtitle 'Small, single-purpose utilities that do all of their work inside your browser.' `
  -Footer 'No uploads . No accounts . Works offline'

New-OgImage -Path 'images-to-video\og.png' `
  -Title 'Images to Video' `
  -Subtitle 'Turn a folder of images into an MP4 slideshow, encoded on your own machine.' `
  -Footer 'No uploads . No accounts . Works offline'
