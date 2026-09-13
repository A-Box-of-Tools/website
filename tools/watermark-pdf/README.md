# Watermark a PDF

[← All tools](../README.md) · [The tool](https://abox.tools/watermark-pdf/)

Puts words across every page of a PDF — who the copy is for, a date, a name —
at an angle, a size and an opacity the visitor chooses, in any language,
without the document going anywhere.

## What a watermark is, and is not

It is a way of making a copy say where it went. A passport scan stamped "for
Acme Lettings only, 12 September 2026" that turns up at a different agency
carries the name of the place it leaked from, which is why lenders, landlords
and lawyers ask for one and why people want to add one before they send a
document. That is a real thing, and the page says so.

It is **not** protection. Anybody with a PDF editor can lift a watermark off,
and the page says that too, in the privacy panel and in the FAQ, and points at
[`protect-pdf`](../protect-pdf/) for the document that must not be read by the
wrong person at all. The carry-on row under the result goes there.

## The stamp is a picture

A PDF draws text in a font it carries or in the fourteen every reader is
assumed to have, and those fourteen are Latin. A watermark in Chinese, Arabic
or Hindi would need a font embedded — megabytes, and a subsetting engine this
site has argued against carrying. So `src/render.js` draws the words with the
browser's own fonts, once, into a transparent picture about 2,400 pixels
wide, and `src/apply.js` places that picture on every page as an image
XObject with its transparency in a soft mask. Any script the visitor can type,
the stamp can say.

The cost is that the words are not selectable or searchable in the result,
which for a watermark is closer to a feature than a cost, and the page says it
rather than leaving it to be found.

## What is in `src/`

| File | What it does |
|---|---|
| `main.js` | the page: loading, the controls, the live preview, the run and the check afterwards |
| `stamp.js` | where the stamp goes on a page, and the `cm` matrices that put it there — pure arithmetic, tested in Node |
| `render.js` | the words as a picture: RGB and alpha, drawn by the browser |
| `apply.js` | the edit to the document: three objects added once, two per page |
| `format.js` | the few things this tool turns into words |
| `example.js` | asks `shared/js/example-pdf.js` for an ordinary statement |

The page walk — a page's box, its rotation and the resources it inherits from
the nodes above it — is `shared/js/pdf-pages.js`, which was the merger's own
until this tool needed the same four things. It moved rather than being
copied, because a second copy is what `tests/python/test_duplicates.py` exists
to refuse.

## How a page is stamped, and why nothing on it is touched

`apply.js` adds to the document:

- the picture and its mask, as two image XObjects, once, shared by every page;
- an ExtGState carrying the opacity, once;
- a one-byte content stream holding `q`, once.

And to each page:

- a content stream that begins with `Q` (closing the `q` above), sets the
  ExtGState, applies the matrix from visible coordinates to the page's own,
  and for each placement pushes a matrix and draws the image;
- the two resource names, in the page's **own** `/Resources`.

The page's `/Contents` becomes `[q-stream, ...whatever it was, stamp-stream]`.
The page's own streams are not decoded, not read and not rewritten — the
`q` and `Q` around them are what let the page leave its graphics state however
it likes — so a scan, a form and a fifty-megabyte brochure all go through
identically, and a rewrite by the shared writer is the only other change.

A page with no `/Resources` of its own gets a **copy** of the inherited
dictionary with the names added, rather than having the parent's dictionary
edited; the parent's is visible to pages this run may be leaving alone.

## Rotated pages, and why there is one matrix for that

A page may carry `/Rotate`, in which case a reader shows it turned clockwise
and "diagonal from bottom-left to top-right" means diagonal *on the screen*.
Rather than work the angle and the corners out four times over, `stamp.js`
computes every placement in visible coordinates — the page as shown, origin
bottom-left — and `visibleToUser` supplies one matrix from that frame to the
page's own, worked out from where the corners go. It is the only place
`/Rotate` is read, and the same placements drive the preview.

## The preview is the placement, not the page

This site has no PDF renderer and does not pretend to. The preview draws a
blank sheet the exact size and shape of the first page and lays the stamp on
it using the **same** `placements()` call the writer makes, with the words
drawn live in the same bold face. So it is a true preview of where the stamp
goes and how big it is, and an honest blank where the visitor's own page
would be. The caption under it says so.

## The check afterwards

The finished bytes are opened again by the shared reader, the page count is
compared, and every page that should carry the stamp is checked for both the
resource name and the drawing instruction at the end of its last content
stream (`carriesStamp`). A page that fails hides the download.

## How this is tested

`tests/js/watermark-pdf.test.js` covers the arithmetic (placements, the
matrix, the four rotations) and the document edit: the example stamped
centred, tiled and first-page-only, written by the shared writer, reopened and
checked page by page; a page with no `/Contents`; a page whose resources are
inherited; a page turned by `/Rotate 90`; and that the original streams are
carried through untouched. The picture in those tests is a fake — a bar of
colour — because Node has no canvas.

The rendering side was checked by hand while the tool was built, and is worth
repeating after any change to `stamp.js`: PyMuPDF (`pip install pymupdf` in a
scratch venv) rasterises what the tool writes, and the stamp shows where the
preview said it would, at the angle, size and opacity chosen, on rotated pages
included.

## What it cannot do

- **Show the visitor's page in the preview.** See above; it would take a
  renderer.
- **Stamp a locked document.** A file that needs a password is turned away
  with a link to the unlocker; so is one carrying only restrictions, because
  stamping it means rewriting it and rewriting it drops them.
- **Keep a digital signature valid.** A signature covers the exact bytes of
  the file it was applied to. The tool notices when a document was signed and
  says so on the results.
- **Make selectable text.** The stamp is a picture, by design.
