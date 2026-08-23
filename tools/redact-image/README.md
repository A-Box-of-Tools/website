# Image Redactor

Draw boxes over the parts of a picture that should not be seen, and get back a
file in which those pixels have been overwritten.

The tool is small. The reason it exists is not: **almost every other way of
doing this leaves the original in the file.** A rectangle drawn in a PDF reader,
a slide deck, a word processor or a layered image editor is an object with a
position, saved beside the page rather than into it, and moving it or opening
the document in a different program puts back what it was covering. That failure
has published court filings, government reports and newspaper scans. Here there
is no rectangle in the output at all — there are pixel values, written over the
ones that were there, before an encoder is handed anything.

## What happens to a file

    file  ->  createImageBitmap  ->  canvas  ->  getImageData  ->  applyRegions
                                                                        |
              blob  <-  canvas.toBlob  <-  putImageData  <---------------+

One pass, at the picture's own resolution, when the button is pressed. Nothing
before that point modifies the picture: the boxes are a list of rectangles in
memory, and the picture on screen is a separate, scaled copy.

`applyRegions` in [`src/redact.js`](src/redact.js) is the whole of the
destructive part, and it is three loops:

| Style | What is left behind |
|---|---|
| `fill` | one flat colour, edge to edge |
| `pixelate` | one average colour per block |
| `blur` | a weighted average of each pixel's neighbours |

## The honesty problem, and how the page handles it

Only the first of those three is finished.

A mosaic is a grid of averages, and a grid of averages is a small, lossy
*measurement* of what was underneath. For text in an ordinary font at a
predictable size, that measurement has been enough to recover the original:
render every candidate string, pixelate each one the same way, and compare. A
blur is worse in principle — it is a convolution, and convolutions are
invertible in principle, which is what deconvolution attacks do.

Three decisions follow, and they are the reason this tool is not just a
`fillRect`:

- **Black fill is the default**, and the page says in the option's own label
  what the other two do not do.
- **The strength control reports a number rather than an adjective.** "Heavy"
  tells nobody whether their account number is still in there; "the finest
  mosaic here is 34 x 6 blocks of 18 px — 204 averages of what was underneath"
  tells them how many measurements they are handing over. `riskNote` in
  [`src/files.js`](src/files.js) writes that line, and it appears the moment a
  box is doing something reversible.
- **Strength is measured against the box, not in absolute pixels.** A block size
  of 20 px means something entirely different on a 400 px screenshot and on a
  4000 px photograph of the same passport. `blockSize` and `blurRadius` in
  [`src/regions.js`](src/regions.js) divide the box's shorter side, so one
  setting behaves the same way on both.

## Why the preview is a canvas

The picture on screen is a `<canvas>` with the redaction painted into it, and
the boxes above it are outlines and handles with no fill. It would have been
easier to lay opaque black `<div>`s over an `<img>` — and that is exactly the
arrangement this tool exists to argue against. A preview that is a different
mechanism from the output is a preview that can be right while the output is
wrong.

So [`src/preview.js`](src/preview.js) runs the same three functions from
`redact.js` over a scaled copy of the same pixels. It is scaled because
redacting a 6000 x 4000 photograph takes long enough to feel while a box is
being dragged, and a preview that lags behind the pointer cannot be aimed. Two
details keep the two agreeing:

- the base image is kept as `ImageData` and copied back before every redraw, so
  dragging a blurred box does not blur what its previous position already
  blurred — a blur of a blur creeps outwards with every frame;
- boxes are scaled as **edges rather than as a position and a length**, so a box
  that ends at the right-hand edge of the picture still ends there once scaled,
  instead of leaving a one-pixel strip of the original showing.

The result panel goes one step further and shows the finished blob, decoded
again by the browser. What is on screen there is the file.

## The modules

| File | What is in it |
|---|---|
| [`src/regions.js`](src/regions.js) | what a box is, where it may sit, and how a drag changes it. No DOM. |
| [`src/redact.js`](src/redact.js) | the three functions that overwrite pixels. No DOM. |
| [`src/files.js`](src/files.js) | names, formats, and the lines that carry a number. No DOM. |
| [`src/preview.js`](src/preview.js) | the on-screen canvas, redacted at screen size. |
| [`src/stage.js`](src/stage.js) | the outlines: pointer and keyboard input over the canvas. |
| [`src/main.js`](src/main.js) | state, wiring, and the one full-resolution pass. |

The first three are the ones under test in
[`tests/js/redact-image.test.js`](../../tests/js/redact-image.test.js), and they
are separate from the rest for that reason: what needs checking is not that the
page renders but that a fill leaves nothing, that a mosaic block really is the
average of what it replaced, and that a blur does not reach outside the box it
was drawn in.

## Things that were decided rather than defaulted

**One picture at a time.** Every other image tool here takes a batch. Redaction
cannot: the boxes are drawn against one particular picture, and a queue of them
would invite exactly the mistake of applying box coordinates to a photograph
they do not belong to.

**Blur reads only from inside the box.** Sampling the surroundings would smear
what is being hidden *outwards* past the edge of the rectangle the user drew.
The box is the boundary in both directions.

**A filled box is opaque.** The alpha channel is set along with the colour. A
transparent picture whose redacted box was left transparent hands back a file
where the hidden part shows whatever the reader puts behind it — white in one
viewer, the original underneath in a layered editor.

**Undo is a stack of snapshots, and it is the only undo.** A box dragged off the
thing it was covering is the mistake worth being forgiving about, because the
result is a file somebody is about to send. Nothing else in the tool needs
undoing: the picture itself is untouched until the button is pressed.

**The output filename always ends `-redacted`.** Two files called `scan.jpg` in
a downloads folder is exactly how the original gets attached to the email
instead of the copy, and nothing this page does can undo that one.
