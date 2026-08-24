# Images to PDF

*Put your pictures into one document.*  ·  lives at `/images-to-pdf/`  ·  [all tools](../)  ·  [how the site is built](../../README.md)

The fifth tool. It puts pictures into a document, one to a page, and writes the
PDF itself — there is no library here, and nothing is fetched to make one.

---

## The point of it: a JPEG does not have to be re-encoded

Almost every "images to PDF" service decodes your photograph and compresses it
again on the way in. That is not a limitation of PDF. PDF's `DCTDecode` filter
means *these bytes are a JPEG, hand them to the decoder*, so a photograph that is
already a JPEG can be copied into the document unchanged: no decode, no second
pass of lossy compression, no loss.

That is the default here, and the tool says so out loud — the line under a
finished PDF reads "9 of 12 put in exactly as they were", and the count is of
pictures whose bytes were copied rather than re-encoded.

Not every JPEG qualifies, and [`src/jpeg.js`](tools/images-to-pdf/src/jpeg.js)
is the file that decides:

| Case | What happens | Why |
|---|---|---|
| Baseline or extended sequential, 1 or 3 components | Copied byte for byte | This is what `DCTDecode` is defined over |
| Progressive | Re-encoded | Not part of `DCTDecode`'s definition. Many readers cope; "many" is not good enough for a file somebody is going to send to a printer |
| CMYK or YCCK (4 components) | Re-encoded | Needs the Adobe marker read and sometimes an inverted `/Decode` array. Rare off a camera or a phone |
| Being shrunk by the size limit | Re-encoded | It has to be decoded to be resized, so there is nothing left to copy |
| Carrying an ICC profile | Copied, profile and all | The profile is pulled out of the `APP2` markers and attached as an `/ICCBased` colour space, so a Display P3 photo is not shown as though its numbers were sRGB |

Anything that is not a JPEG — PNG, WebP, AVIF, GIF — has no PDF filter of its
own and has to be re-encoded, or stored losslessly. See below.

## Rotation, which PDF has no tag for

A phone photo is very often stored sideways with an EXIF tag saying which way is
up. Browsers honour that tag. PDF has no equivalent: a reader draws the image
where the placement matrix puts it and nowhere else.

So the tag is read and turned into that matrix. All eight EXIF orientations, and
the quarter turns from the buttons on each tile, are unit-square matrices in
[`src/layout.js`](tools/images-to-pdf/src/layout.js); they are multiplied
together, scaled to the box the picture is going in, and written as the single
`cm` operator on the page. A picture that is turned is still copied byte for
byte — turning it costs six numbers, not a re-encode.

The same `layoutPage` that the document is written from also draws the preview,
so what is on screen is not an impression of the result. It is the result, at a
smaller size.

## The lossless path, and why it uses PNG's row filters

Pictures that cannot be copied are re-encoded as JPEG by default — except one
case, and one setting:

- a picture with **transparency** in it, which JPEG cannot carry, is stored
  losslessly instead, so that what shows through in the document is what showed
  through in the file;
- the **Lossless** setting stores every picture that way.

Lossless here is `FlateDecode` over raw samples, using `CompressionStream` — the
browser's own deflate, so nothing is shipped to do it. Raw RGB through deflate
compresses much worse than a PNG of the same picture, so the rows are filtered
exactly as PNG filters them and the stream declares
`/DecodeParms << /Predictor 15 … >>`, which is PDF saying "these rows carry PNG
filter bytes". On a screenshot or a scan of a printed page that is several times
smaller than the naive version. Transparency becomes an `/SMask`, a second
one-channel image the reader uses as the alpha.

The filter for each row is chosen the way the PNG specification suggests: try
each, keep whichever leaves the smallest sum of absolute differences. Average is
left out of the candidates — it rarely wins on photographs or screenshots, and
every candidate costs another pass over the row.

## Pages

| Setting | What it does |
|---|---|
| Fit the page to each image | Every page is exactly its picture at the resolution you choose. Nothing is cropped, and there are no white bands |
| A named size, or one you type | A4, Letter, Legal, A3, A5, Tabloid, or a size in millimetres or inches. Orientation follows each picture, or is fixed |
| Margin | Millimetres on all four sides, in every mode |
| Fit inside / fill / stretch | Only "fill the page" can put ink past the margins, so only that one clips the page — `re W n` before the image |
| Page colour | Painted first, so it shows in the margins and behind anything see-through |
| Shrink large images | Caps the longest side. A picture that gets shrunk is re-encoded rather than copied, which the summary says before you press the button |

## What the document does not say about you

Most tools stamp a PDF with a creation date and the name of the program that
made it. This one writes a `/Producer` naming the tool, and then only what you
typed: a title, an author, and a date **only** if you tick the box for it. The
file names of your pictures never appear anywhere in the document, and neither
does anything about your machine. There is no `/ID` either — the usual way to
fill that in is a hash of the clock and the file name.

A PDF is a thing people send to other people. Anything in it that was not asked
for is something the sender did not know they were sending.

## Limitations

- **One image per page.** No two-up, no contact sheets, no text. That is a
  different tool, and it will say so when it exists.
- **No OCR and no text layer.** The pages are pictures, so the document is not
  searchable. Nothing in the browser does OCR, and shipping an engine that could
  is the same sort of question as
  [What needs a vendored engine](../../docs/what-can-be-built-here.md#what-needs-a-vendored-engine).
- **Existing PDFs cannot be read.** This writes documents; it does not open
  them. The reader lives next door, in [PDF Compressor](../compress-pdf/);
  merging and reordering are on the planned list and would be built on it.
- **Semi-transparent pixels are the browser's, not ours.** A canvas stores
  colours multiplied by their alpha, so a pixel that is half see-through comes
  back slightly changed by the decode — before this tool ever sees it. Fully
  opaque and fully transparent pixels are exact.
- **Everything is assembled in memory** before you download it, so a few hundred
  full-resolution phone photos will be felt. Shrinking the longest side moves
  that ceiling a long way.

## Testing it

There is no test runner in this repository, so the checks used while writing this
are not checked in. What they covered, if it needs doing again — all of it run in
the browser against images generated in the page, so nothing had to be committed
as a fixture:

- the cross-reference table, which is the part of a PDF a reader trusts
  absolutely: every offset in it must point at the object it claims, every entry
  must be exactly twenty bytes, and every `/Length` must land on `endstream`.
  Twenty objects, twelve streams, no discrepancies;
- **byte-for-byte copying**, which is the tool's whole claim: a JPEG made in the
  page, then found intact inside the finished PDF by searching for its bytes;
- an EXIF orientation of 6 written into that JPEG by hand: a 1200×800 file has
  to come out as an 800×1200 page carrying the matrix `0 -1200 800 0 0 1200`,
  which it did;
- the lossless path decoded again — inflated, un-filtered, and compared sample
  by sample against what the browser decodes the source PNG to. 7,869 samples,
  none different, and the `/SMask` exact as well;
- page geometry against arithmetic: A4 at a 10 mm margin is 595.2756 × 841.8898
  points with the picture inset 28.3465 from each edge, orientation following
  the picture; "fill the page" emits the clip and lets the image run past it;
- the interface end to end: files dropped in, reordered, rotated, removed, the
  page settings changed with a finished PDF on screen — which drops it, rather
  than leaving a stale download beside settings it was not made with.
