# HEIC to JPG

*The photos an iPhone makes, in a format everything opens.*  ·  lives at `/heic-to-jpg/`  ·  [all tools](../)  ·  [how the site is built](../../README.md)

The eleventh tool, and the first one here that carries a codec.

---

## Why this one is different

Every other tool on this site decodes pictures with the decoders the browser
already has. HEIC is the exception, and it is the exception in the most annoying
way available: the picture inside a HEIC is an HEVC frame, and every browser
will happily decode HEVC inside a `<video>` and refuse to decode it as a still.
Only Safari, on Apple hardware, opens a HEIC. Everywhere else
`createImageBitmap` rejects the file and `<img>` shows a broken icon.

So a HEIC converter needs a decoder from somewhere, and there are exactly two
places it can come from:

* **a server** — which is why every other HEIC converter on the internet asks
  you to upload your photos; or
* **the page** — which costs about 1.4 MB, once.

This one is the second. That is the entire trade, and it is the whole reason
this tool exists at all: the roadmap rule for this repository is that the file
never leaves the machine and the tool still works with the network unplugged,
and there is no way to hold that line for HEIC without shipping a codec.

---

## What is vendored

`vendor/libheif.js` — libheif compiled to WebAssembly, unmodified.

| | |
|---|---|
| Package | [`libheif-js`](https://www.npmjs.com/package/libheif-js) 1.19.8 |
| File taken | `libheif-wasm/libheif-bundle.js` |
| Size | 1,462,173 bytes (about 520 KB over the wire, compressed) |
| SHA-256 | `793b36c913689784b2bfba60456fd87c14ed49e2d13f3b4d2611baaf05148f81` |
| Licence | LGPL-3.0, copied beside it as `vendor/LICENSE` |
| Upstream | <https://github.com/strukturag/libheif> |

To refresh it: `npm pack libheif-js`, take `libheif-wasm/libheif-bundle.js` and
`libheif-wasm/LICENSE` out of the tarball, and update the three rows above. It
is committed rather than fetched from a CDN because an engine downloaded on
first use is not an offline tool, and because a CDN is a third party in the path
of every visit.

### Why the big build and not the small one

The package ships two shapes of the same engine. The small one is an 81 KB
loader beside a 1.03 MB `.wasm` file; the big one is a single 1.46 MB script
with the binary base64'd inside it. The small pair is about 140 KB less over the
wire, and it needs the loader to **fetch** the `.wasm` next to it — which would
mean adding `connect-src 'self'` to this page's Content-Security-Policy.

This page does not grant that. `connect-src` still names Google's measurement
endpoints and nothing else, so `fetch`, `XMLHttpRequest`, `WebSocket` and
`sendBeacon` are all impossible here, exactly as on every other page on the
site. The 140 KB buys a policy that can be read in one line and a claim that
needs no asterisk.

The engine's own loader does contain the usual Emscripten fetch-and-instantiate
paths — they are in the file, and `grep` will find them. They are never reached,
because the binary is already in hand, and if something did reach one the
browser would refuse it. That is a stronger guarantee than "we do not call it",
and it is why the policy is what the page points at rather than the code.

### Why it is not run through the minifier

`vendor/` is copied byte for byte and never minified. `buildlib/minify.py` is a
tokeniser that verifies its own output, and it refuses input it cannot tokenise
exactly — a compiled bundle carries strings with line continuations in them,
which is legal JavaScript and not something that minifier will touch. That
refusal is correct, and the answer is not to loosen it for third-party code.
`build.py` grew a `vendor_files` step for this: copied verbatim, licence
included, and every file precached by the service worker so the offline promise
covers the engine too.

### Why libheif and not FFmpeg

The repository README lists this tool under "what needs a vendored FFmpeg", on
the reasoning that FFmpeg's HEIF demuxer and HEVC decoder would cover it. They
would, at 25–30 MB. libheif is the same job at 1.4 MB because it is only that
job — a HEIF container reader and an HEVC still decoder, and nothing else. The
argument in that section is about what vendoring costs and when it is worth it;
the answer here came out twenty times cheaper than the estimate.

---

## The four files

### `src/heif.js` — loading the engine, and decoding

The engine is loaded as a `<script>` element, from this origin, the first time a
HEIC lands on the page rather than at boot. Somebody who reads the page and
leaves should not pay for a decoder they never used, and somebody who is going
to convert something should not wait for it after pressing the button — so the
load starts when the first file is chosen, and the button waits on the same
promise if it gets there first.

`decodeHeic` returns **every** top-level picture in the file, not just the first.
A HEIC can hold several — a burst, or the stills of a Live Photo — and handing
back one picture from a file that held four is the sort of helpfulness people
discover months later. Depth maps and thumbnails are auxiliary items rather than
top-level pictures, so they are not in that list and nobody gets a greyscale
depth map named `IMG_4021-2.jpg`.

Decoding one picture is a single synchronous call into WebAssembly. There is no
way to yield part-way through a frame, which is why progress is reported between
files and not within one, and why the progress bar does not animate.

### `src/boxes.js` — the container

HEIF is the MP4 box format: a tree of length-prefixed records. The picture is
not a box, it is a run of bytes in `mdat`, and the `meta` box holds a small
filing system (`iinf`, `iloc`, `pitm`, `iref`) saying which run belongs to which
item. This file walks enough of that to answer two questions: is this actually a
HEIC, and where is the EXIF block.

**Why the second question is here at all.** libheif reads metadata items
perfectly well; its JavaScript binding does not expose them —
`heif_image_handle_get_metadata` is not among the hand-written wrappers in
`heif_emscripten.h`. The choice was a fork of somebody else's build or a hundred
lines of box walking. This is the hundred lines, and unlike the fork it can be
read.

The brand is read out of `ftyp` and the name is never consulted. A HEIC that
arrived called `.jpg` is one of the commonest reasons somebody is on this page.

`iloc` is the awkward part of the format: the widths of its fields are
themselves fields, packed as nibbles, so nothing can be read at a fixed offset.
Items stored in `idat` rather than `mdat` are handled; extents past the first
are not, because EXIF blocks are never split and stitching a picture together is
the decoder's job.

### `src/exif.js` — the metadata, and the one tag that is changed

Two jobs.

**Saying what is in there.** The row for each photo names the date, the camera,
and whether there are GPS coordinates — read out of the container without
decoding the picture, so it costs nothing and appears immediately. A GPS
directory that exists but holds no entries is reported as no GPS, because that
is what a phone leaves behind when location is off and saying otherwise is a
lie people would act on.

**Setting the orientation to 1.** This is the part that would otherwise be a
bug, and it is worth being precise about. A HEIC records its rotation twice:
once in the container as an `irot` property, and once in the EXIF block.
libheif's binding calls `heif_decode_image(handle, &image, colorspace, chroma,
nullptr)` — options `nullptr`, so `ignore_transformations` keeps its default of
false — which means the pixels handed back have **already** been rotated, and
`heif_image_handle_get_width` already reports the display size. Copy the EXIF
across untouched and a viewer reads "rotate this 90°" and does it again. Every
portrait photo would come out on its side.

So the block is copied with two bytes overwritten, in every IFD it has —
including IFD1, the thumbnail's, which carries its own orientation tag and is
how a picture comes out upright with a sideways thumbnail.

Nothing else is rewritten. A TIFF block is full of offsets pointing back into
itself, so a block that is rebuilt has to have every one of them recomputed,
while a block that is copied entire cannot have them wrong.

**Known limit: metadata goes into JPEG only.** The block becomes an APP1
segment, which is a place JPEG has and the canvas's PNG and WebP output does
not. Choosing PNG or WebP means the picture and nothing else, and the note under
the format menu says so rather than leaving somebody to find out. PNG's `eXIf`
chunk and WebP's extended-format `EXIF` chunk would both be possible; neither is
worth the container-writing code for output formats almost nobody picks here.

A block that will not fit in a segment (65,533 bytes, `Exif\0\0` included) is
left out and the row says so. In practice only a file with an unusually large
thumbnail gets near it.

### `src/codecs.js` — writing it back out

Once the engine has handed over a rectangle of pixels the job is an ordinary
one, and the ordinary route is right: a canvas and `toBlob`, which is the
browser's own encoder. It also means the output is a plain JPEG with nothing
unusual in it, and a converter is judged by whether the file opens everywhere
afterwards.

One wrinkle. `putImageData` replaces pixels rather than drawing them, so it
composites with nothing — a HEIC with an alpha channel written straight into a
JPEG comes out with black where the transparency was. So for JPEG the pixels go
onto one canvas and that canvas is `drawImage`d onto a second, white one.

---

## Decisions worth knowing about

**The list shows no thumbnails.** Drawing one would mean decoding the picture,
and decoding is the expensive half of this tool's whole job — twenty photos
would be converted twice, once to look at and once to keep. The rows say what
each file is instead, and the pictures appear once, under the results. This is
the only tool here whose input cannot be previewed, and the reason is the same
reason the tool exists.

**Only the first 256 KB of each file is read when it is added.** Enough for the
brand and, in every file anybody has, the EXIF block, which sits at the front of
`mdat`. Reading whole files there would mean holding a folder of forty-megabyte
photos in memory for the length of the visit to answer a question about their
first few kilobytes. If a block turns out to live past that point the row simply
says nothing about it, and the conversion — which reads the whole file anyway —
still copies it across.

**The name keeps its stem.** `IMG_4021.HEIC` comes back as `IMG_4021.jpg`, with
nothing appended, because the extension already says what happened and the file
still has to be recognisable in a backup of nine hundred photos. Where one file
held several pictures the first keeps the plain name and the rest are numbered.
Repeats within a batch are given a suffix by `uniqueNames`, because two folders
dropped together can easily hold two `IMG_0001.HEIC` and a zip with two entries
of the same name unpacks to one file on every platform.

**AVIF is refused on purpose**, with its own message. It is the same container
with AV1 inside, every current browser decodes one natively, and sending it
through a vendored engine would be shipping a megabyte to solve a problem
nobody has.

**The metadata checkbox defaults to on.** A converted photo that has lost the
day it was taken sorts to the bottom of every photo library, and that is the
usual complaint about HEIC converters. The GPS line on each row is what makes
the default safe to have: it is stated before anything is converted, in the one
colour on that list that is not grey.

---

## Tests

`tests/js/heic-boxes.test.js` and `tests/js/heic-exif.test.js`.

The container and TIFF fixtures are built in the test file out of the same
helpers the EXIF tool's tests use, so a reader can see exactly what is in each
one. What is not tested here is the decode itself: that is a megabyte of
somebody else's compiled C, it needs a real HEIC and a real browser, and a test
that asserted `libheif decodes HEIC` would be testing libheif rather than this
tool. The parts this repository actually wrote — finding the EXIF item in a
container, uprighting it, writing it into a JPEG, and naming the results — are
the parts under test.
