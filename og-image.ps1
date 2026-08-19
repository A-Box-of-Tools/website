<#
.SYNOPSIS
  Regenerates the Open Graph share images (og.png) for every page, and the iOS
  home-screen icon.

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

  The site mark on the cards is the same drawing as logo.svg, redone here in
  System.Drawing calls; see Draw-Mark.

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

# Extra tones the mark needs: a darker shade of the accent for the box, and a
# pale tint for the inside edge of it. These are the dark-theme values from
# logo.svg, because the cards are drawn on the dark background.
$boxDark  = [System.Drawing.ColorTranslator]::FromHtml('#3772ab')
$toolDark = [System.Drawing.ColorTranslator]::FromHtml('#7cb2e6')
$rimDark  = [System.Drawing.ColorTranslator]::FromHtml('#cfe3f8')

# ...and the light-theme values, for the iOS icon, which is drawn on the light
# background rather than the dark one.
$boxLight  = [System.Drawing.ColorTranslator]::FromHtml('#1d4f83')
$toolLight = [System.Drawing.ColorTranslator]::FromHtml('#2b6cb0')
$rimLight  = [System.Drawing.ColorTranslator]::FromHtml('#d7e7f7')

function New-RoundedRect {
  param([float]$X, [float]$Y, [float]$W, [float]$H, [float]$R)

  $d = $R * 2
  $p = New-Object System.Drawing.Drawing2D.GraphicsPath
  $p.AddArc($X, $Y, $d, $d, 180, 90)
  $p.AddArc(($X + $W - $d), $Y, $d, $d, 270, 90)
  $p.AddArc(($X + $W - $d), ($Y + $H - $d), $d, $d, 0, 90)
  $p.AddArc($X, ($Y + $H - $d), $d, $d, 90, 90)
  $p.CloseFigure()
  return $p
}

<#
.SYNOPSIS
  Draws the site mark - the open tool box - at ($X,$Y), $Size pixels square.

.DESCRIPTION
  This is the same drawing as logo.svg, in the same 32x32 coordinate space: the
  transform below scales that space to $Size, so every number here can be read
  straight off that file. If the shape changes there, change it here too.
#>
function Draw-Mark {
  param(
    [Parameter(Mandatory)][System.Drawing.Graphics]$G,
    [Parameter(Mandatory)][float]$X,
    [Parameter(Mandatory)][float]$Y,
    [Parameter(Mandatory)][float]$Size,
    [Parameter(Mandatory)][System.Drawing.Color]$BoxColour,
    [Parameter(Mandatory)][System.Drawing.Color]$ToolColour,
    [Parameter(Mandatory)][System.Drawing.Color]$RimColour,
    # The flat colour behind the mark. The hammer claw is painted in it rather
    # than cut out, so this has to match what the mark is drawn on.
    [Parameter(Mandatory)][System.Drawing.Color]$Backdrop
  )

  $box  = New-Object System.Drawing.SolidBrush $BoxColour
  $tool = New-Object System.Drawing.SolidBrush $ToolColour
  $rim  = New-Object System.Drawing.SolidBrush $RimColour

  # Round caps, so the wrench jaws end the way they do in the SVG.
  $jaws = New-Object System.Drawing.Pen $ToolColour, 2.2
  $jaws.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $jaws.EndCap   = [System.Drawing.Drawing2D.LineCap]::Round

  $state = $G.Save()
  $G.TranslateTransform($X, $Y)
  $G.ScaleTransform(($Size / 32), ($Size / 32))

  # screwdriver, leaning left
  $s = $G.Save()
  $G.TranslateTransform(9.3, 17.0)
  $G.RotateTransform(-11)
  $G.TranslateTransform(-9.3, -17.0)
  $G.FillPath($tool, (New-RoundedRect 8.2 9.6 2.2 8.6 0.9))
  $G.FillPath($tool, (New-RoundedRect 7.2 5.4 4.2 5.0 1.5))
  $G.Restore($s)

  # hammer: head, then the claw notch punched back out of its left end, then
  # the handle. The notch is painted rather than cut, which only works because
  # both callers draw the mark on a flat background.
  $G.FillPath($tool, (New-RoundedRect 12.6 5.4 7.5 4.1 1.3))
  $claw = New-Object System.Drawing.Drawing2D.GraphicsPath
  $claw.AddPolygon(@(
    (New-Object System.Drawing.PointF 12.5, 5.9),
    (New-Object System.Drawing.PointF 13.6, 7.45),
    (New-Object System.Drawing.PointF 12.5, 9.0)
  ))
  $G.FillPath((New-Object System.Drawing.SolidBrush $Backdrop), $claw)
  $G.FillPath($tool, (New-RoundedRect 15.5 8.8 2.4 9.4 1.0))

  # wrench, leaning right. The jaws are an arc with the gap at the top: centre
  # (22.6, 7.54), radius 2.75, swept the long way round through the bottom.
  $s = $G.Save()
  $G.TranslateTransform(22.6, 17.0)
  $G.RotateTransform(12)
  $G.TranslateTransform(-22.6, -17.0)
  $G.FillPath($tool, (New-RoundedRect 21.4 8.6 2.4 9.6 1.0))
  $G.DrawArc($jaws, (22.6 - 2.75), (7.54 - 2.75), 5.5, 5.5, 224.85, -269.7)
  $G.Restore($s)

  # the box, last, so it covers the ends of the tools
  $front = New-Object System.Drawing.Drawing2D.GraphicsPath
  $front.AddLine(5.2, 19.8, 26.8, 19.8)
  $front.AddLine(26.8, 19.8, 25.6, 25.7)
  $front.AddArc(21.2, 23.5, 4.4, 4.4, 0, 90)
  $front.AddArc(6.4, 23.5, 4.4, 4.4, 90, 90)
  $front.CloseFigure()
  $G.FillPath($box, $front)
  $G.FillPath($box, (New-RoundedRect 2.6 16.2 26.8 4.0 1.5))
  $G.FillPath($rim, (New-RoundedRect 5.0 17.1 22.0 1.3 0.65))

  $G.Restore($state)
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
  Draw-Mark -G $g -X $margin -Y 60 -Size 52 `
            -BoxColour $boxDark -ToolColour $toolDark -RimColour $rimDark -Backdrop $bg
  $g.DrawString('abox.tools', $fontBrand, $accentBrush, ($margin + 64), 74)

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

New-OgImage -Path 'og.png' `
  -Title 'Tools that never touch a server' `
  -Subtitle 'Small, single-purpose utilities that do all of their work inside your browser.' `
  -Footer 'No uploads | No accounts | Works offline'

New-OgImage -Path 'images-to-video\og.png' `
  -Title 'Images to Video' `
  -Subtitle 'Turn a folder of images into an MP4 slideshow, encoded on your own machine.' `
  -Footer 'No uploads | No accounts | Works offline'

<#
.SYNOPSIS
  Draws icon-180.png, the home-screen icon.

.DESCRIPTION
  Everywhere else the mark is logo.svg, which themes itself. iOS is the
  exception: it will not take an SVG for a home-screen icon, and it draws the
  icon on a tile of its own rather than on the page, so this one is the light
  palette on the light background regardless of the reader's theme. 180px is
  what current iPhones ask for; smaller devices scale it down.
#>
function New-IconPng {
  param([Parameter(Mandatory)][string]$Path)

  $size = 180
  $tile = [System.Drawing.ColorTranslator]::FromHtml('#f6f7f9')

  $bmp = New-Object System.Drawing.Bitmap $size, $size
  $g   = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = 'AntiAlias'
  $g.FillRectangle((New-Object System.Drawing.SolidBrush $tile), 0, 0, $size, $size)

  # A margin of about a tenth, so the mark is not jammed against the rounded
  # corners iOS crops the tile to.
  $inset = 18
  Draw-Mark -G $g -X $inset -Y $inset -Size ($size - ($inset * 2)) `
            -BoxColour $boxLight -ToolColour $toolLight -RimColour $rimLight -Backdrop $tile

  $full = Join-Path $PSScriptRoot $Path
  $bmp.Save($full, [System.Drawing.Imaging.ImageFormat]::Png)

  $g.Dispose()
  $bmp.Dispose()

  Write-Host "wrote $full"
}

New-IconPng -Path 'icon-180.png'
