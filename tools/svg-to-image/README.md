# SVG to Image

*Name the size. A vector has none of its own to lose.*  ·  lives at `/svg-to-image/`  ·  [all tools](../)  ·  [how the site is built](../../README.md)

An SVG in, a PNG, JPEG or WebP out, at whatever number of pixels you name.

---

## Why this is not the Image Resizer with a different file picker

Every other tool here starts from pixels, and the interesting question is always
what gets lost. This one starts from instructions for drawing, so the answer to
"can I have it at 4000 pixels" is simply yes, and 4000 pixels from a 24-pixel
icon is exactly as sharp as 24 was. There is no "never enlarge" rule to enforce,
no quality argument to have about the scale, and no resampling step at all.

What replaces it is a different problem, and it is the whole of this tool: **an
SVG does not reliably tell you how big it is**, and a browser will only draw one
at the size the file asks for. Getting a sharp result at a size the file never
mentioned means dealing with that first.

---

## The size an SVG thinks it is

`src/svg.js`. Four cases, and a real-world file lands in any of them:

| what the file has | what it means |
|---|---|
| `width` and `height` in absolute units | that, converted to pixels |
| one of them, plus a `viewBox` | the other follows from the viewBox's ratio |
| a `viewBox` and nothing else | its width and height, as user units |
| neither | 300 × 150 — the CSS default for a replaced element with no intrinsic size |

The last row is the one worth saying out loud, and the page does: a row whose
size was *assumed* is labelled differently from one whose size was *read*, so
nobody is surprised by a number the file never contained.

`width="100%"` counts as "neither". A percentage is not a length until something
has resolved it against a parent box, and an SVG being drawn onto a canvas has
no parent box — it is the root of its own world. The same goes for `em` and
`ex`. They are treated as absent rather than guessed at, which lands the answer
on the viewBox, which is where it belongs.

---

## Why the root tag is rewritten

Handing the file to an `<img>` untouched fails in three ways, all of them
silent:

1. **`width="100%" height="100%"`** — how most exports from a drawing program
   come out — has no pixel size, so the browser falls back to 300 × 150 and
   draws it at that.
2. **`width="24" height="24"` with no `viewBox`** does not scale. Drawn into a
   512-pixel box, the artwork stays 24 pixels across in the top left corner:
   without a viewBox there is no user coordinate system to stretch, so the
   drawing keeps its own units.
3. Some builds of **Safari** refuse to draw an SVG with no intrinsic size onto a
   canvas at all, and hand back a blank rather than an error.

So `sizedSvg()` replaces `width` and `height` with the pixel size being asked
for, adds a `viewBox` if there was not one — taken from whatever size the file
did declare — and adds `xmlns` if that is missing, because a document without it
is not SVG as far as an `<img>` is concerned and draws as nothing.

**Only that one tag is touched.** This is a string splice around the root
element, not a parse-and-reserialise, so nothing in the artwork can be lost or
reordered on the way through. Attribute names are written back with the
capitals they arrived with, because `viewBox` in an XML document is not
`viewbox` and the difference shows up as "the picture is in the corner" three
sizes later.

### And why it is parsed by hand

The browser has a perfectly good XML parser. Using it would mean the part of
this tool most worth testing — unit conversion, the viewBox fallback, what a
missing height means — could only ever run in a browser. It is arithmetic over
one tag, so `src/svg.js` does it with a scanner over plain strings that runs the
same in Node, and `tests/js/svg-to-image.test.js` covers it.

---

## Reading the bytes

`decodeSvgText()` does not call `Blob.text()`, which is UTF-8 and nothing else.
A file saved out of an older Windows drawing program is quite often UTF-16, and
Illustrator writes an XML declaration naming its encoding. Decoded as UTF-8, a
UTF-16 file comes back as NUL bytes between every letter, no root tag is found,
and the tool would say "this is not an SVG" about a perfectly good one.

The BOM is checked first because it is definitive, then a BOM-less UTF-16 file
(every other byte of `<?xml` is a NUL), then the declaration, then UTF-8 — which
is the order an XML parser is required to use.

---

## The rasteriser

`src/render.js`, and it is short: an `<img>` holding the rewritten markup as a
blob, one `drawImage` onto a canvas of the planned size, one `toBlob`.

**Not `createImageBitmap`.** That rasterises the SVG once, at whatever size the
file declares, and everything after it scales a bitmap — so a 24-pixel icon
asked for 1024 comes back as a blurred 24-pixel icon, which is the one thing
using a vector was meant to avoid. An `<img>` re-rasterises at the size of every
draw. That is the entire tool.

The `<img>` is also the security story, and it is a better one than anything
this repository could have written itself. An SVG loaded that way is in what the
specification calls [secure static
mode](https://www.w3.org/TR/SVG2/conform.html#secure-static-mode): scripts in it
do not run, external references — a remote `<image>`, a stylesheet, a webfont —
are not fetched, and animation does not play. For a page that opens files it has
never seen and promises they go nowhere, that is the browser enforcing the
promise. It is also why the canvas is never tainted and `toBlob` always works.

The one visible cost is a webfont in a `<text>` element falling back to whatever
the machine has, which the page says in as many words: convert text to paths
before exporting and it becomes geometry, which looks the same everywhere.

---

## The size plan

`src/sizing.js`. Five ways to ask — a multiple of the file's own size, a width, a
height, the longest side, or a box with both sides given and a fit — and they
all end in the same shape: a canvas, and a rectangle on it where the drawing
lands. A padded plan is a canvas larger than that rectangle; a stretched one
sets `preserveAspectRatio="none"`, which is the only way to make a vector fill a
box of a different shape.

The `@2x` and `@3x` copies are **multiplied** from the 1x plan by `atDensity()`
rather than planned again. An @2x that is not exactly twice its @1x is the one
bug in an asset set that nobody notices until a phone draws it half a pixel off,
and re-planning from a rounded intrinsic size is how that happens.

### The two limits

Browsers do not agree about how big a canvas can be, and none of them says so
out loud — over the limit `toBlob` returns null or a blank image rather than an
error. So there are two numbers, both in `sizing.js`:

- **16.7 megapixels** (4096 × 4096) is where Safari on an iPhone or iPad gives
  up. Above it the page warns and still runs, because a desktop is fine.
- **100 megapixels, or 16,384 pixels on a side**, is a refusal. That is 400 MB
  of canvas before a byte has been encoded, and a tab killed mid-render looks
  like the tool losing your file.

---

## What is deliberately not here

- **A crop.** Cropping a vector properly means editing its viewBox, which is a
  drawing operation on the source rather than a rendering choice, and doing it
  badly means cropping the raster afterwards — which throws away the sharpness
  that was the reason to come here. The [Image Resizer](../resize-image/) crops.
- **Image to SVG.** The other direction is not a conversion, it is a trace: a
  guess at which curves might explain a grid of pixels. Every honest version of
  it is a large piece of machinery with settings that need a preview and a
  vocabulary, and the dishonest version — a PNG wrapped in an `<svg>` tag — is a
  PNG with a different extension.
- **Animation.** An animated SVG drawn through an `<img>` is a still of its
  first frame, and it will stay that way here. Producing a GIF or a video from
  one means driving the animation forward by hand outside secure static mode,
  which is the thing this tool is careful not to do.

---

## Files

| file | what is in it |
|---|---|
| `src/svg.js` | reading the file's own size; rewriting the root tag; decoding the bytes |
| `src/sizing.js` | the five ways to ask for a size, the density multiples, the canvas limits |
| `src/render.js` | the `<img>`, the `drawImage`, the `toBlob`, and what each browser will write |
| `src/files.js` | names, sizes and counts, as words a person would use |
| `src/main.js` | the page: the list, the preview, the run, the results |
| `src/zip.js`, `src/crc32.js` | a batch comes down as one file |

Tests: `tests/js/svg-to-image.test.js`, covering the first, the second and the
naming in the fourth — everything with a decision in it that does not need a
browser to run.
