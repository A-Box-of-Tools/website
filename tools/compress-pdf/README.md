# PDF Compressor

*Shrink a document without sending it anywhere.*  ·  lives at `/compress-pdf/`  ·  [all tools](../)  ·  [how the site is built](../../README.md)

The first tool here that opens a document somebody else wrote. Everything below
is specific to it.

---

## The thing it does before it compresses anything

"Compress a PDF" is two jobs sharing one name, and every service that offers it
lets you find out which one you have by waiting for the result.

A scanned document is a stack of photographs in a wrapper. Ninety-odd per cent
of it is image data, re-encoding that is worth most of the file, and 60–90%
smaller is an ordinary outcome. A contract, a thesis, a bank statement is text,
vector drawing and embedded fonts — all of which whatever produced the file
already deflated. There is no eighty per cent hiding in it. Nobody's compressor
can find one, and the honest number is a few per cent from repacking the
document and dropping what nothing points at any more.

Which of the two you have is not a matter of opinion. It is the sum of the
stream lengths in the file, grouped by what refers to them, and it takes a
fraction of a second to work out. So the second step of this tool is a
breakdown — images, fonts, page content, metadata, structure, and what an
earlier edit left behind — with a sentence at the top saying what to expect.
`src/inventory.js` is that measurement, and if this tool could keep only one
screen it would keep that one.

Two figures in it are worth explaining:

- **Superseded & unreferenced.** A PDF that has been edited is usually not
  rewritten but appended to: the original bytes stay where they are and the new
  version of each changed object goes on the end. Four rounds of editing can
  leave four copies of a page in the file. Those old copies are not in the
  object graph at all — the table points at the newest of each number and a
  reader never looks at the rest — so they are measured off the file itself, by
  scanning for object headers and adding up the spans that are not the live one.
  Without that they would land under "Structure & overhead" and turn that line
  into a lie on exactly the files where it matters.
- **Structure & overhead** is then everything left: the dictionaries, the
  cross-reference tables, and the punctuation between objects. It is a
  subtraction rather than a measurement, which is why it is named last.

## Measuring the pictures against the page, not against themselves

This is the idea the tool is built around.

An image's pixel dimensions say nothing on their own about whether it has too
many. Three thousand pixels across is lavish for a logo in a letterhead and
barely adequate for a full-bleed A3 poster. What matters is the ratio between
the pixels stored and the space they are drawn into, and a PDF records that: the
page's content stream says where each picture goes and how big.

So `src/placements.js` reads the drawing instructions. A content stream is a
stack machine — `q` pushes the current transformation matrix, `Q` pops it, `cm`
multiplies a new one in, and `/Im0 Do` paints an image into the unit square that
the matrix has by then turned into a rectangle on the page. The width a picture
is drawn at is the length of the matrix's first row; taking the length rather
than the diagonal entry is what makes a rotated image measure correctly instead
of coming out as zero.

Three operators out of the several hundred PDF has. Nothing is rendered, and
colour, text, paths and clipping are all skipped, because that is enough to
answer the only question being asked: a 4000-pixel scan placed across eight
inches of paper is carrying 500 pixels to the inch, and at 150 it would print
indistinguishably and look identical on a screen. Those pixels cost nothing to
throw away, so they go first, before any quality is spent — which is the reverse
of the order [Image Compressor](../compress-image/) uses, for the good reason
that a bare JPEG does not come with a statement of how large it will be shown.

Form XObjects are walked into with their own `/Matrix` and resources, so a
picture inside a reusable block measures the same as one placed directly. Inline
images (`BI … ID … EI`) are skipped over rather than tokenised, because the data
between the two is arbitrary bytes that may contain those letters; they are also
left alone by the compressor, which is fair enough for something whose whole
point is being too small to deserve an object of its own.

A soft mask is the one image never painted by a `Do` of its own — it is attached
to the picture it makes transparent — so it borrows that picture's measurement.
Without that it looks like an image nothing draws, and gets left alone.

## What is spent, and what is refused

Every image is re-encoded **on approval**. The new version has to come out
smaller than the old one or it is discarded and the original bytes go back into
the document — not "kept because it was close": actually the original stream,
never decoded and never compressed twice. A photograph that was already lean
loses nothing by being run through this, which is the same rule
[Image Compressor](../compress-image/) opens with and the reason both tools can
be pointed at a file without thinking about it first.

Turned away, and reported by name on the results rather than silently:

| Left alone | Why |
|---|---|
| JPXDecode (JPEG 2000) | No browser has a decoder. Vendoring one is a different argument |
| JBIG2Decode | Same, and a JBIG2 scan is already very tightly packed |
| CCITTFaxDecode | Same again. Fax coding is a bilevel codec and is usually near its floor |
| CMYK, in any encoding | Needs the Adobe marker read and sometimes an inverted `/Decode`; getting it subtly wrong turns a print job the wrong colour |
| Separation, DeviceN, Lab | A tint transform to evaluate per pixel, or a real colour conversion. Rare on the images that make a file big |
| Stencil masks, and anything under 4 KB | One bit per pixel already, or too small to pay for the work |
| An image no page draws | There is no drawn size to reason about, so there is no defensible amount to take off it |

Everything else arrives one of two ways. `/DCTDecode` means the stream *is* a
JPEG, so it is handed to the browser as a blob and decoded by the same code that
decodes one in an `<img>` — the mirror image of the trick
[Images to PDF](../images-to-pdf/) plays going the other way. Raw samples — Flate,
LZW or run-length over the pixels themselves — have to be unpacked here, because
"the pixels themselves" means one to sixteen bits per component in whatever
colour space the document felt like, and no browser API takes that. Rows are
padded to a byte boundary; getting that wrong shears the picture diagonally,
which is at least a very recognisable bug.

Soft masks come back out as deflated 8-bit grayscale rather than as JPEGs. An
`/SMask` has to be `DeviceGray`, and a JPEG out of a canvas is three-component
YCbCr whatever the picture looked like; declaring three components as
`DeviceGray` produces a file that opens and renders wrong, which is the worst
kind of output. So the saving on a mask comes from its dimensions rather than
from the codec, and that is the honest amount to claim for it.

## Reading a file that is allowed to be wrong

A PDF is read back to front: the last line but one says `startxref` and a byte
offset, at that offset is a table of where every object starts, and the trailer
beside it says which object is the catalogue.

It is also the part of a PDF most likely to be wrong. Offsets drift when a file
is edited by something careless, concatenated, truncated, or mailed through a
gateway that helpfully rewrote its line endings. So `src/reader.js` checks
rather than trusts, and when the table disagrees with the file, **the file
wins**: `rebuildByScanning` walks the bytes looking for `12 0 obj` headers and
believes what it finds, taking the last of each number, which is the
incremental-update rule. False positives are possible — those three bytes occur
inside compressed streams — and are dealt with by requiring the object to parse
before it is kept.

The same principle runs through the parser. `/Length` is believed only if what
follows it really is `endstream`; otherwise `endstream` is searched for, because
getting a stream's extent wrong does not produce a small error, it misreads
every byte after it. A number with a `-` in the middle of it, which scanners
emit, is read the way Acrobat reads it. A dictionary key that is not a name is
skipped rather than being allowed to abandon a dictionary that is otherwise
fine.

Object streams — the 1.5 feature that packs small objects together and deflates
them as a batch — are expanded at open. When the table has been rebuilt there
are no entries pointing into them, so the containers are found by type instead;
without that, a repaired 1.5 file comes back with a page tree full of nulls,
which is a worse failure than not opening at all, because it looks like it
worked.

**Encrypted files are refused.** Including the empty-password kind that scanners
and copiers produce, which would technically open. Taking the protection off a
document is a different job from making it smaller, and a tool that did it
quietly on your behalf would be a surprising thing to have used.

## Writing a new file rather than editing the old one

`src/writer.js` walks out from the catalogue and writes only what it reaches.
That is where a good part of the saving on an edited document comes from: every
superseded object, every page that was deleted three saves ago, and every
orphaned image is simply not copied over.

Two ordinary things happen on the way out. Objects that are not streams are
packed into object streams and deflated together, because what repeats between
dictionaries is the key names, and they compress well as a batch and terribly
one at a time. Anything still sitting uncompressed gets deflated. The cost is
that the output needs a PDF 1.5 reader, which is every reader shipped since
2003.

Kept, because a rewrite is the easiest place in the world to lose them: forms
and their appearance streams, links, bookmarks, the accessibility structure
tree, optional content groups, embedded attachments, and every key on an image
dictionary this tool has never heard of — the dictionaries are edited in place
rather than rebuilt from the handful of entries it knows about. Fonts are copied
whole and never subsetted: subsetting is how a document ends up missing
characters when somebody else opens it, and the saving is not worth that.

Not kept: `/Metadata` (the XMP packet), `/PieceInfo` (private application data,
occasionally megabytes of it), `/LastModified`, `/Thumb`, and the document
information dictionary — under a checkbox, and on by default. That is the
argument [EXIF Viewer & Remover](../exif-editor/) makes, applied to a
different container: a PDF is a thing people send to other people. There is no
`/ID` in the output either, for the reason [Images to PDF](../images-to-pdf/)
leaves it out.

## The check at the end

This tool rewrites somebody's document from its own parse of it, which is a
strong claim to make about a format with as many corners as PDF. So when the
file is finished it is opened again, by the same reader, on the same page, and
its page count compared with the original's.

Page count is the number worth checking because it depends on the whole chain
having survived: the catalogue, the page tree, the object streams, the
cross-reference stream and every reference between them. If it disagrees, the
run is reported as failed and **no download is offered** — a file the tool has
just said it does not trust should not be one click away from being sent to
somebody.

It is not a proof of correctness and is not described as one. It is the
difference between a bug caught here and a bug caught by whoever the document
was sent to.

## Limitations

- **No JPEG 2000, JBIG2 or CCITT.** Named above, reported on the results, and
  the reason a fax-quality scan sometimes compresses by nothing at all.
- **No CMYK.** Also above. A print-ready document full of CMYK images will come
  back much the same size, and be told so.
- **Fonts are not subsetted**, which is the other large saving a commercial
  optimiser makes and this one declines.
- **Linearisation is lost.** A file that was arranged for byte-serving over a
  network comes back as an ordinary one. That matters for a PDF served on a
  website and not at all for one you are about to email.
- **Encrypted documents are refused**, empty password included.
- **The whole file is held in memory**, twice over at the moment the rewritten
  copy exists beside the original, and a third time briefly while it is checked.
  A few hundred megabytes is where a browser tab starts to feel it.
- **No target size.** You choose a resolution and a quality, and the result is
  measured rather than predicted. Naming a size and searching for the settings
  that hit it — which is what [Image Compressor](../compress-image/) does — is
  the obvious next thing, and costs a full re-encode per attempt.

## Testing it

There is no test runner in this repository, so the checks used while writing this
are not checked in. What they covered, if it needs doing again — a page that
imports the modules directly and runs them against PDFs written by hand for the
purpose, so that each file is exactly the shape the check needs:

- **a classic table**, an **xref stream with an object stream**, a **broken
  `startxref`**, and an **incremental update** that supersedes a content stream:
  read, rewritten and reopened, page counts matching in all four. The broken one
  has to report itself as repaired, and the updated one has to notice the chain
  and count the abandoned stream under superseded;
- **the placement measurement** against arithmetic: a 1600×2000 image drawn
  across 288×360 points is 400 DPI, and asking for 130 has to produce a
  520-pixel picture and nothing else;
- **all three image paths**: a Flate RGB scan, a 4-bit indexed image with a
  palette, and a real JPEG made in the page so that `/DCTDecode` is exercised
  with bytes a browser produced. 820 KB of raw scan came out at 7 KB, and a
  355 KB JPEG document at 27 KB, both reopening with the right page count;
- **a soft mask**, which has to inherit the drawn size of the image it belongs
  to rather than being written off as never drawn, and has to come back as
  grayscale;
- **the refusal to lose**: a mask whose re-encoded version came out larger than
  the original was discarded and the original bytes kept — the rule working
  rather than the rule failing;
- **the interface end to end**, driven in the page: a document dropped in, the
  breakdown drawn, a preset chosen, the run watched to completion, and the
  download link carrying the right name — and, incidentally, the page's own
  Content-Security-Policy refusing the test's first attempt to `fetch` a
  fixture, which is the pledge on the page behaving exactly as advertised.
