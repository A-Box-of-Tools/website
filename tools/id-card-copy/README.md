# ID Card Copy

Two photographs of a card - the front and the back - each found, straightened
and cropped, and put on one sheet at the card's real size: A4 or Letter to
print, or no sheet at all for one picture of both sides to upload. Optional
words are written across the card, into its pixels.

This file is for somebody reading the code. What the tool does, and why anybody
would want it, is on [the page itself](https://abox.tools/id-card-copy/).

## The shape of it

    two photos ──▶ shared/js/document-detect.js ──▶ four corners each
                        │
                        ▼
              shared/js/corner-handles.js ──▶ corners dragged, turned, undone
                        │
                        ▼
                    layout.js ──▶ the sheet, and a rectangle on it per side,
                        │         in millimetres
                        ▼
              shared/js/document-warp.js ──▶ each side flat, at exactly the
                        │                     card's proportions
                        ▼
                     card.js ──▶ grey, the words, the corners rounded, the outline
                        │
                        ▼
              document.js or card.js#drawSheet ──▶ the PDF, or one picture of the
                                                    sheet, with density.js writing
                                                    its resolution into the file

The corner finder, the perspective resample and the corner handles are the
[document scanner](../document-scanner/)'s, shared through `shared/js/` rather
than copied: a card is a page made smaller, and a fix to finding the edge of
one is a fix to finding the edge of the other. What is this tool's own is
below.

## The shape is known, not measured

The scanner has to work out what shape a page is from the perspective in the
photograph (`pageAspect` in `document-geometry.js`), because a page can be A4,
Letter, a receipt or a business card. A card cannot: the commonest one is
85.6 by 53.98 mm, by ISO/IEC 7810, and the other two sizes that standard
defines are offered beside it. So each side is resampled straight onto a
rectangle of the chosen card's exact proportions, at the number of pixels the
chosen resolution gives that many millimetres. The only question left about
its shape is which way up it is, and that is the corners' order: `looksUpright`
in `layout.js` asks whether the long side runs down the photo, a card found
standing on its end is turned once on arrival, and the turn buttons do the
rest.

That is the difference from the web tools that crop the rectangle they see and
scale it into a card-shaped box. A card photographed at an angle is foreshortened,
so the crop is a trapezium, and scaling a trapezium into a rectangle leaves the
card squat at one end. Mapping the four corners through a homography onto the
right rectangle leaves every straight line straight.

## Turning a card survives moving a corner

The scanner used to put the corners back in order after every drag with
`orderCorners`, which starts from the corner nearest the top left of the
photograph. A quarter turn is nothing but a different corner at the front of
the list, so the first nudge after a turn undid it. A card photographed upside
down - which is half of all backs - would have flipped back over under the
finger. `reorderCorners`, in `document-geometry.js` now and used by both tools,
keeps the leading corner leading.

## One plan for the preview, the picture and the PDF

`layout.js` decides the sheet and every rectangle on it, in millimetres from
the top left, and nothing else is allowed to: the preview multiplies the plan
by a screen-sized resolution, the picture by the chosen one, and the PDF by
points per millimetre with the y axis turned over. A preview laid out by CSS
would be easy to write and could quietly disagree with the paper.

The sheet is turned on its side only when the pair does not fit upright, which
on A4 and Letter means the two larger card sizes side by side. "At the top"
puts the pair 20 mm from the top edge, about where a copier's ID mode puts a
card; "in the middle" centres it.

The preview straightens each side out of the 1200-pixel copy of the photo kept
for the editor; the file decodes the photo again at full size and shrinks it,
with the browser's own filtered downscale, to just over the size it is about
to be resampled to. Everything after the resample is the same `finishCard`
call in both, so what is on screen at step 3 is the result, smaller.

## The PDF places the cards; it does not picture the sheet

`document.js` writes each side as its own JPEG and places it with a matrix in
points, so 85.6 mm is a number in the file rather than a property of a scaled
picture. A print dialog left at "actual size" therefore puts a card on the
paper exactly as big as the card, at any resolution, on any printer. The PDF
carries the tool's name as its producer and nothing else: no date, no author,
nothing from the photos.

## Pictures say their own resolution

A canvas writes a JPEG whose JFIF header says "one to one, no unit" and a PNG
with no `pHYs` chunk at all, so a sheet that is exactly right at 300 DPI arrives
at a photo viewer as a picture of no particular size. `density.js` writes the
real number in - three bytes in the JFIF header, one chunk after a PNG's
header, with the CRC from `shared/js/crc32.js` - which changes no pixel and lets
a program that prints by a file's resolution print the card at its size. Many
print dialogs fit a picture to the paper regardless, which is why the page sends
anybody who needs the true size to the PDF.

A picture of a whole sheet is capped at sixteen million pixels (`sheetDpi`),
because Safari on a phone hands back a canvas that draws nothing above about
sixteen and a half; A4 at 600 DPI is thirty-five. The cap is said on the result
when it applied. The PDF never draws the sheet, only the two cards, and has no
such limit.

## The words are in the pixels

`card.js` draws the typed words in slanting, repeated rows across each side
before the corners are cut and before anything is encoded. Repeated, because one
line can be cropped off a copy with a strip of the card's edge; slanted, because
a horizontal line can sit between two printed lines and be cut out of a
screenshot. In the pixels, because a layer or annotation in a PDF is deleted in
any editor, and the point of writing "for the tenancy only" across an identity
card is that it stays there. The size follows the card's height, so the words
are the same size relative to the card at every resolution.

## No network, not even the carry-on row

Most tools that produce a PDF offer to carry it straight into the next tool,
which needs `connect-src blob:` to read the result back out of the page. This
one does not: a copy of an identity card is saved, not passed along, and the
page can then say that `connect-src` is not opened for anything.

## What it does not do

**No camera.** It takes photographs that already exist. A live view that found
the card and took the picture itself would be better, and is what a native app
does well; it is a different tool, and `qr-barcode-reader` is where this site's
camera code lives if it is ever worth doing.

**No glare removal.** A reflection off a laminated card replaces what was under
it with white, and no amount of arithmetic on one photograph brings that back.
The guide says to tilt the card or the light instead.

**No reading the card.** There is no OCR, no face detection and nothing that
looks at what the card says. Which side is the front is the visitor's to say,
and "Swap front and back" is one press.
