# Document Scanner

A photograph of a page, turned into something that looks scanned: the four
corners found, the perspective undone, the uneven light divided out, and the
result written into a PDF. Several photographs become the pages of one document.

This file is for somebody reading the code. What the tool does, and why anybody
would want it, is on [the page itself](https://abox.tools/document-scanner/).

## The shape of it

    photo ──▶ detect.js ──▶ four corners
                   │
                   ▼
              geometry.js ──▶ the page's real aspect ratio, and the size to
                   │           resample it at
                   ▼
               warp.js ──▶ a flat rectangle of pixels
                   │
                   ▼
              clean.js ──▶ the light divided out; optionally thresholded
                   │
                   ▼
             encode.js ──▶ JPEG, or one bit per pixel deflated
                   │
                   ▼
            document.js ──▶ the PDF, via pdf.js

Every one of those but `encode.js` is a pure function on a pixel array or on
numbers, which is why most of this tool is tested without a browser:
[`tests/js/document-scanner-geometry.test.js`](../../tests/js/document-scanner-geometry.test.js),
[`document-scanner-detect.test.js`](../../tests/js/document-scanner-detect.test.js)
and [`document-scanner-scan.test.js`](../../tests/js/document-scanner-scan.test.js).

`main.js` holds the state, the DOM and the two sizes everything is done at; it
is wiring, and it is the only file here that knows a browser exists.

## The four decisions worth arguing about

### 1. There is no model, and there is not going to be one

Finding a page in a photograph is a thing a small segmentation network does
well. It is also tens of megabytes fetched on first use, an inference runtime to
run it in, and a failure mode nobody can inspect. This site's promise is that
nothing about your file leaves the machine, and the files people bring to a
document scanner are passports, payslips, leases and forms — so a tool that had
to fetch anything before it could read one would be a tool with a reason to
phone home about them.

What replaces it is the observation that a page is a rectangle:

1. shrink the photo to 480 pixels on the long side, because none of this is
   different at 4000 and the work is seventy times less;
2. take the Sobel gradient — where the picture changes, and in which direction;
3. let every pixel that sits on an edge vote for the straight line it would lie
   on. A Hough transform, but each pixel votes only for the angles near its own
   gradient direction rather than for all 180, which is both far cheaper and far
   cleaner;
4. pair the strong lines into candidate rectangles and score each one by walking
   its four sides.

Step 4 is where the judgement is, and it is deliberately not the votes. A Hough
peak says "many pixels somewhere on this infinite line agree"; it does not say
they were between these two corners.

### 2. The three things that make step 4 work

Each of these was a real failure before it was a rule, and each is in
`detect.js` with the failure written next to it.

**The lines are shared out by angle.** A plain "strongest twenty lines" does not
work at all on the clearest photograph in the test set. Every line of text on a
page is a strong straight edge at the same angle as the top of the page, and
there are thirty of them; they take all twenty places, the sides of the page
never make the list, there is no pair of lines at right angles to anything, and
the search returns *nothing*. At most four lines come from any ten-degree band
now, from at most six bands — plus the outermost line in each band, because the
page is by definition outside everything printed on it.

**A pair of opposite sides is worth what its weaker side is worth.** Ranking
pairs by the sum of their votes lets a strong line of text paired with a faint
smudge outscore the top and bottom of the page paired with each other. The
symptom was a scan cropped to the last line of writing, confidently.

**All four sides have to step the same way.** A page is lighter than what is
around it, or darker, but it is one or the other on all four sides. Text is
darker than the paper on *both* of its own sides, so a candidate that has taken
the top of the page for its top edge and a line of text for its bottom edge
disagrees with itself and is marked down. This is also what a photograph of pure
noise fails: every rectangle in one has gradient along all four sides, and not
one of those sides can say which side of itself the page is on.

### 3. The aspect ratio comes from the perspective, not from the edges

The obvious way to size the straightened page is to take the longest pair of
opposite edges and call their ratio the shape. It is wrong in exactly the case
this tool exists for: a photograph taken at an angle foreshortens the far edge,
so a sheet of A4 comes out visibly squat. On the test set the edge method is out
by up to 33%.

A photograph of a rectangle carries enough information to recover *both* the
rectangle's aspect ratio and the camera's focal length, given only that the
camera is an ordinary pinhole with square pixels and a roughly centred principal
point. That is Zhang and He, [*Whiteboard Scanning and Image
Enhancement*](https://www.microsoft.com/en-us/research/publication/whiteboard-scanning-and-image-enhancement/)
(MSR-TR-2003-39), section 3, and `perspectiveAspect` in `geometry.js` is it:
about thirty lines of cross products, exact to a fraction of a per cent on
synthetic photographs, and it recovers the focal length as a by-product.

It has one honest failure, and it is common: a photograph taken square-on. There
the projection is affine, the focal length cancels, and the arithmetic divides
by something that has gone to zero. That case does not need it — an edge-length
ratio is exact when there is no perspective to distort it — so `pageAspect`
takes the perspective answer, checks it is a page shape at all, checks it is
within a tolerance that widens with how much perspective the photograph actually
has, and falls back to the edges when it is not. The page says which of the two
answered.

### 4. Cleaning up is division, not contrast

Raising the contrast of a photographed page makes the bright part white, the
dark part black, and the writing in the dark part unreadable. The problem is not
contrast; it is that the light is uneven.

So `clean.js` estimates the paper and divides by it. Paper is the bright
majority of any small patch of a page, so a grid of tiles and a high percentile
in each tile gives the paper's own brightness across the page, and text is too
dark and too sparse to move the estimate. Dividing by it leaves the ink, evenly
lit.

The one case that breaks is a tile with no paper in it — a photograph pasted on
the page, a solid black heading — where the local answer is "there is no paper
here" and dividing would lift the whole patch to white. Those tiles take their
neighbours' value instead. Note that `fillHoles` compares against the *median*
of the neighbours and not their maximum: a blanket maximum treats a genuinely
darker tile as a hole, and the finished page then has a dark band exactly where
the shadow was, which is the artefact the file exists to remove. On the test
fixture that one change takes the misclassified area from 3.2% to zero.

Black and white is Sauvola's local threshold, over the already-flattened luma,
with integral images so the window costs four reads whatever size it is. On the
test page the best *possible* single global threshold still gets 4.6% of the
page wrong; Sauvola gets none of it.

## Two sizes, and why the file is decoded twice

Twenty photographs from a phone are half a gigabyte of decoded pixels, and the
editor needs exactly two things from each: something to draw at screen size, and
something for the corner finder to read. So a page keeps a 1000-pixel copy and
nothing else, and `main.js` decodes the file again when the document is finally
written. Decoding twice costs about a tenth of a second per page; holding them
all costs the tab.

The full-size render shrinks before it resamples, whenever the page is being
made smaller than it appears in the photo — and that shrink is `drawImage` on a
canvas, which is the browser's own filtered downscale. It is better than
anything worth writing here, and it means the resample itself never has to read
more than one sample per output pixel.

## Why 1 bit per pixel matters

Measured on the same pages, the one-bit path is about eighteen times smaller
than the colour one: a twenty page contract lands under a megabyte rather than at
something like fifteen. That is the difference between a document that
can be emailed and one that cannot, and it is the whole reason the black and
white mode is worth having.

There is deliberately **no PNG predictor** on that path, which is the obvious
next thing to reach for and is what `images-to-pdf` does for its lossless path.
Measured, the up filter makes the file about a fifth *larger*: deflate's own
back-references already match a repeated row against the row above at a cost of
a few bits, while differencing replaces those literal repeats with runs of zeros
that then have to be matched again. That is the opposite of what happens with
8-bit photographic data, and it is what a bit depth of one does to the
arithmetic.

## `src/pdf.js` is a copy

It is byte-for-byte the writer from
[`images-to-pdf`](../images-to-pdf/src/pdf.js), and
[`tests/python/test_duplicates.py`](../../tests/python/test_duplicates.py) holds
the two identical. It is a copy from before the JavaScript tests could follow a
`./shared/` import — a module under `shared/js/` is copied into a tool at build
time, and the tests import tool modules straight off the disk.
`tests/js/resolve-shared.mjs` resolves that path for the tests now (see "Shared
parts" in `docs/adding-a-tool.md`), so moving it to `shared/js/` is the next
step. Until then a fix to one copy belongs in both, and that test will say so.

`document.js` is *not* a copy. Images to PDF has to place a picture of any shape
on a page of any other shape, with fit modes, rotation and a page colour; here
every page is already a rectangle of the right shape, so the layout is twenty
lines and there is nothing to choose.

## What it does not do

**No text layer.** There is no OCR and the PDF is not searchable. Doing it
properly means a recognition engine, which is tens of megabytes of model — the
thing rule 1 above exists to avoid. The black and white mode produces exactly
the sort of file that OCR software on your own machine works best on.

**No automatic page-edge detection from video.** There is no camera capture
here: the tool takes photographs that already exist. A live camera view that
found the page and shot it automatically would be a better product and is a
different tool; `qr-barcode-reader` is where the camera code on this site lives
if it is ever worth doing.

**No book-curl flattening.** A page photographed flat is a plane and a
homography undoes it exactly. A page in a bound book is a curved surface, the
text lines bow, and undoing that needs a model of the curl rather than four
corners. The tool is honest about this by not pretending: it straightens what is
a rectangle.

## The known weakness

A page lying on a desk of nearly its own colour. There is genuinely almost no
edge there for the gradient to find, and the detector will pick out whatever
rectangle it *can* see — a block of text, a table — rather than the page. It
reports that as a guess rather than a finding, marks the page in the strip, and
the corners are draggable, which is the honest handling. It is not fixed by
tuning: at that contrast the page edge does not clear the vote threshold, and
lowering the threshold far enough to see it lets in every smudge on the desk.
