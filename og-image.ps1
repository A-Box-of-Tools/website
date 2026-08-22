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

  The site mark on the cards is logo.svg itself. System.Drawing cannot read
  SVG, and a hand-drawn copy of the mark would drift away from the file it was
  copied from, so a headless Edge rasterises it instead; see Get-MarkImage.

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

New-OgImage -Path 'shared\og.png' `
  -Title 'Tools that never touch a server' `
  -Subtitle 'Small, single-purpose utilities that do all of their work inside your browser.' `
  -Footer 'No uploads | No accounts | Works offline'

New-OgImage -Path 'tools\images-to-video\og.png' `
  -Title 'Images to Video' `
  -Subtitle 'Turn a folder of images into an MP4 slideshow, encoded on your own machine.' `
  -Footer 'No uploads | No accounts | Works offline'

New-OgImage -Path 'tools\gif-maker\og.png' `
  -Title 'GIF Maker' `
  -Subtitle 'Put pictures in order, set the speed, and get one animated GIF.' `
  -Footer 'No uploads | No accounts | Works offline'

New-OgImage -Path 'tools\split-gif\og.png' `
  -Title 'GIF Splitter' `
  -Subtitle 'Every frame of an animation as its own PNG, with the timing written down.' `
  -Footer 'No uploads | No accounts | Works offline'

New-OgImage -Path 'tools\gif-analyzer\og.png' `
  -Title 'GIF Analyzer' `
  -Subtitle 'Every frame, every delay, every palette - and where the bytes went.' `
  -Footer 'No uploads | No accounts | Works offline'

New-OgImage -Path 'tools\crop-video\og.png' `
  -Title 'Video Cropper' `
  -Subtitle 'Cut a clip down to the part that matters, without it ever leaving your machine.' `
  -Footer 'No uploads | No accounts | Works offline'

New-OgImage -Path 'tools\grab-frame\og.png' `
  -Title 'Video Frame Grabber' `
  -Subtitle 'Save any frame of a clip as a picture, at the size the video really is.' `
  -Footer 'No uploads | No accounts | Works offline'

New-OgImage -Path 'tools\trim-audio\og.png' `
  -Title 'Audio Trimmer' `
  -Subtitle 'Mark the parts worth keeping as it plays, and save them as one recording.' `
  -Footer 'No uploads | No accounts | Works offline'

New-OgImage -Path 'tools\trim-video\og.png' `
  -Title 'Video Cutter' `
  -Subtitle 'Mark the parts worth keeping as it plays, and save them as one video.' `
  -Footer 'No uploads | No accounts | Works offline'

New-OgImage -Path 'tools\video-to-gif\og.png' `
  -Title 'Video to GIF' `
  -Subtitle 'Pick the section, the size and the frame rate - and never upload the clip.' `
  -Footer 'No uploads | No accounts | Works offline'

New-OgImage -Path 'tools\reverse-video\og.png' `
  -Title 'Video Reverser' `
  -Subtitle 'Play a clip backwards - the picture and the sound - without it leaving your machine.' `
  -Footer 'No uploads | No accounts | Works offline'

New-OgImage -Path 'tools\exif-editor\og.png' `
  -Title 'EXIF Viewer & Remover' `
  -Subtitle 'See what a photo says about you, then take it out - without re-encoding the picture.' `
  -Footer 'No uploads | No accounts | Works offline'

New-OgImage -Path 'tools\heic-to-jpg\og.png' `
  -Title 'HEIC to JPG' `
  -Subtitle 'iPhone photos in a format everything opens - decoded on your own machine.' `
  -Footer 'No uploads | No accounts | Works offline'

New-OgImage -Path 'tools\edit-audio\og.png' `
  -Title 'Audio Editor' `
  -Subtitle 'Reverse a track, change its speed, or lift a quiet recording - on your own machine.' `
  -Footer 'No uploads | No accounts | Works offline'

New-OgImage -Path 'tools\images-to-pdf\og.png' `
  -Title 'Images to PDF' `
  -Subtitle 'Gather pictures into one document. JPEG photos go in exactly as they are.' `
  -Footer 'No uploads | No accounts | Works offline'

New-OgImage -Path 'tools\resize-image\og.png' `
  -Title 'Image Resizer' `
  -Subtitle 'Resize, crop and convert a picture - or a whole folder - on your own machine.' `
  -Footer 'No uploads | No accounts | Works offline'

New-OgImage -Path 'tools\image-to-ico\og.png' `
  -Title 'Image to ICO' `
  -Subtitle 'Make a favicon, a Windows app icon or a macOS .icns - every size in one file.' `
  -Footer 'No uploads | No accounts | Works offline'

New-OgImage -Path 'tools\svg-to-image\og.png' `
  -Title 'SVG to Image' `
  -Subtitle 'Rasterize a vector to PNG, JPEG or WebP at any size, on your own machine.' `
  -Footer 'No uploads | No accounts | Works offline'

New-OgImage -Path 'tools\image-to-data-uri\og.png' `
  -Title 'Image to Data URI' `
  -Subtitle 'Encode a picture as one line you can paste straight into CSS or HTML.' `
  -Footer 'No uploads | No accounts | Works offline'

New-OgImage -Path 'tools\id-photo\og.png' `
  -Title 'ID Photo Maker' `
  -Subtitle 'Pick a country and a document, and it applies that rule exactly - on your own machine.' `
  -Footer 'No uploads | No accounts | Works offline'

New-OgImage -Path 'tools\compress-image\og.png' `
  -Title 'Image Compressor' `
  -Subtitle 'Name the size you need and it finds the least compression that gets there.' `
  -Footer 'No uploads | No accounts | Works offline'

New-OgImage -Path 'tools\qr-barcode\og.png' `
  -Title 'QR & Barcode Generator' `
  -Subtitle 'A QR code for a link, a Wi-Fi network or a contact card - drawn on your own machine.' `
  -Footer 'No uploads | No accounts | Works offline'

New-OgImage -Path 'tools\text-tools\og.png' `
  -Title 'Text & Code' `
  -Subtitle 'Format it, compare it, encode it - without pasting it into anyone else''s server.' `
  -Footer 'No uploads | No accounts | Works offline'

New-OgImage -Path 'tools\compress-pdf\og.png' `
  -Title 'PDF Compressor' `
  -Subtitle 'Shows you where a document''s size actually is, then shrinks it on your own machine.' `
  -Footer 'No uploads | No accounts | Works offline'

New-OgImage -Path 'tools\merge-pdf\og.png' `
  -Title 'PDF Merger & Splitter' `
  -Subtitle 'Merge documents, split one into several, reorder pages - all on your own machine.' `
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
  $side  = $size - ($inset * 2)
  $mark  = Get-MarkImage -Size $side -Palette light
  $g.DrawImage($mark, $inset, $inset, $side, $side)
  $mark.Dispose()

  $full = Join-Path $PSScriptRoot $Path
  $bmp.Save($full, [System.Drawing.Imaging.ImageFormat]::Png)

  $g.Dispose()
  $bmp.Dispose()

  Write-Host "wrote $full"
}

New-IconPng -Path 'shared\icon-180.png'
