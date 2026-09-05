# Roadmap

*Why each planned tool is planned, and why the ones that are gone are gone.*

[`config/planned.toml`](config/planned.toml) is what the roadmap page shows: a
name and a phrase, ten words at most, because a roadmap card that argues with
the reader is a card nobody finishes. This file is the argument. One section per
line on that list, saying who wants the thing, what in this repository already
does most of the work, and what it costs to keep the promise while doing it.

It exists because the short version is not enough to decide with. "Filters —
brightness, contrast, saturation, blur" reads like a reasonable line on a
roadmap for years, and the case against it takes a paragraph. Without somewhere
to put the paragraph, the list only ever grows.

Read [What can be built here](docs/what-can-be-built-here.md) first. It holds
the test every entry here has already passed, the table of what the browser
can do unaided, and the things ruled out for good.

**A claim about what a browser cannot do is a claim with an expiry date, and it
is cheap to check.** Three lines here rested on one — AVIF, animated WebP and
MP3 — and on 30 August 2026 all three were put to a browser rather than
believed. Two were wrong, and they had been wrong for long enough to shape
which tools got built. Whoever revisits this next should re-run them rather
than inherit them: open a page on the site, and ask `canvas.convertToBlob` for
the format, or `VideoEncoder`/`AudioEncoder`'s `isConfigSupported` for the
codec. Each section below says what its answer was, so a paragraph that has
gone stale can be told apart from one that was never tested.

## How a line earns its place

The test in the README is the first gate, and it is about the promise:

> Does all of the work happen on the visitor's own machine, with the file never
> leaving it, and does the tool still run with the network unplugged?

Everything below passes it. This file adds two more questions, which are about
whether the work is worth doing at all:

- **Does somebody actually want it, and want it *here*?** Wanting it here means
  the upload is the part that bothers them. Nobody is frightened of handing a
  holiday photo to a website that makes it brighter; plenty of people are
  frightened of handing it a passport scan, a contract, an MRI, or a private
  key. Demand and the promise multiply, and where the second is zero, so is the
  product.
- **Is it a tool, or is it a button?** A card next to the shipped tools is read
  as a page that will exist one day. When the card describes something a
  shipped tool nearly does, it does not read as ambition — it reads as an
  admission that the tool is unfinished, and it will be read that way every day
  until somebody builds it.

## The three ways a line leaves this list

1. **It ships.** Move it out of `config/planned.toml` and out of every
   `locales/*/planned.toml`, add the folder under `tools/`, and **delete its
   section from this file** — all in the same commit. The lists are merged
   positionally, so a locale list one item longer than English fails the build.
   Nothing checks the last step, and it is the one that gets missed: the
   document scanner shipped in #116 and its paragraph sat here arguing for a
   tool you could already use until this revisit found it.
2. **It turns out to be a feature.** Build it into the tool that already owns
   the input, and record it under [Folded into tools that
   exist](#folded-into-tools-that-exist) below so nobody re-adds the card.
3. **The case does not survive being written down.** That is what
   [Taken off the list](#taken-off-the-list) is for. Those paragraphs are the
   valuable half of this file: they are the ones that stop the same idea coming
   back every six months.

---

## Images

### Add text

The one image job people reliably cannot do without opening something heavy,
and the reason they end up on a meme site with an upload box. Everything it
needs is a canvas, a font stack and a caption box, so it is small; what makes
it a tool rather than a control inside [`resize-image`](tools/resize-image/) is
that the interface is the whole product — dragging, sizing and outlining text
is not one more field in somebody else's form.

### AVIF

Every browser reads AVIF and not one of them will write one. Asked for
`image/avif`, `canvas.toBlob` hands back a PNG — silently, with the wrong type
on the blob, which is worse than refusing, because the file is named `.avif`
and is not one. That is the whole argument for the tool.

This card used to say Chromium was the exception and that the fallback was a
vendored `libaom`. Both halves were wrong, and measuring them is what this
revisit was for. Chromium 148 returns `image/png` from `toBlob` **and** from
`OffscreenCanvas.convertToBlob`, and no browser ships the `ImageEncoder` that
WebCodecs specified for exactly this. But
an AVIF is one AV1 keyframe in the same ISO-BMFF container HEIC uses, and
`VideoEncoder` encodes AV1 today — `av01.0.04M.08` reports supported and hands
back a real OBU stream, sequence header and all. So the encoder is already
installed and the work is the container, which is the kind of thing this
repository has three writers for — two of them shared parts,
[`mp4-muxer.js`](shared/js/mp4-muxer.js) and
[`mp4-writer.js`](shared/js/mp4-writer.js), built on the box helpers in
[`mp4-boxes.js`](shared/js/mp4-boxes.js) — and a reader for in
[`heic-to-jpg`](tools/heic-to-jpg/src/boxes.js).

One piece is genuinely missing and should not be discovered late:
`VideoEncoder` returns a null `decoderConfig.description` for AV1, so the
`av1C` box — the profile, level and chroma flags in front of a copy of the
sequence header — has to be built by hand out of that header rather than copied
from what the encoder gives you. That is the tool, and it is not `libaom`.

Detecting the browsers that cannot do it is already solved and shipped:
[`compress-image`](tools/compress-image/src/codecs.js) encodes a single pixel
and checks the type of the blob that comes back, precisely because `toBlob`
does not report failure. That probe is the front door of this tool.

### DICOM anonymizer

The niche with the sharpest version of this site's promise. Radiologists,
students and researchers need patient identifiers out of a `.dcm` file before
it goes into a teaching deck, a paper or a dataset, and the alternative is
uploading protected health information to a stranger. There are already several
browser-only anonymizers, which is the market telling us both that the demand
is real and that "no upload" is the feature people choose on.

It is also [`exif-editor`](tools/exif-editor/)'s argument transplanted. A DICOM
file is tags in front of pixel data: the patient's name, birth date, accession
number and study UIDs are byte structures that can be rewritten in place, with
the image never decoded and never re-compressed. That sidesteps the one genuine
obstacle — the compressed transfer syntaxes, JPEG 2000 among them, that a
browser cannot decode — because anonymising does not require decoding anything.

The viewer arrived first, in the other order to the one this paragraph
predicted, and it left less of this to build than it looks.
[`dicom-viewer`](tools/dicom-viewer/) already parses every encoding a dataset
can be in, carries the data dictionary, and lists what in a file identifies the
patient — from PS3.15 table E.1-1, which is the same list an anonymiser has to
work from. What is left is the half a viewer deliberately does not do: writing
a file back out, replacing the UIDs consistently across a whole study rather
than per file, and having an answer about the private elements some scanners
keep a second copy of the name in. That last one is the reason this is still a
separate tool and not a button on the viewer.

## GIF & animation

### GIF to MP4 or WebM

Same animation, usually a tenth of the size, and every platform that rejects a
30 MB GIF accepts the MP4. The muxer is a shared part already:
[`mp4-muxer.js`](shared/js/mp4-muxer.js) writes the one H.264 track an encoder
just produced, with no audio, and [`images-to-video`](tools/images-to-video/) and
the time-lapse maker both ship it. It was five copies of `mp4.js` declared as
duplicate groups until every one moved to `shared/js/`, which is why the group
list in `tests/python/test_duplicates.py` is empty now. A GIF has no sound to
carry, so that is the writer this wants, and the work is the decode side and
the encoder settings.

### Edit a GIF

One tool, not four. Resizing, cropping, rotating, reversing and retiming a GIF
are the same job — take the frames apart, change something, put them back —
and they share a reader and a writer that are both already written:
[`split-gif`](tools/split-gif/src/gif.js) takes every frame and its delay out,
[`gif-maker`](tools/gif-maker/src/encode.js) writes them back with the palette
work done. Four separate cards for four separate pages was the old shape of
this list, and it promised four pages that would each have been mostly the
same file.

### Animated WebP

This card used to say that none of the browsers encode animated WebP, that it
therefore needed `libwebp` vendored, and that it would be the second page on
the site to carry `'wasm-unsafe-eval'`. The card advertised that cost out loud,
which was the right instinct and the wrong fact. It was tested for this
revisit, and it is not true.

The browser will not encode an *animation*, but it encodes every **frame** of
one: `canvas.convertToBlob({type: 'image/webp'})` returns a complete still
WebP, which is a RIFF file with the bitstream in a `VP8 ` or `VP8L` chunk.
An animation is those same chunks wrapped one per `ANMF`, behind a `VP8X` and
an `ANIM`. Four frames assembled that way came to 448 bytes and the browser's
own `ImageDecoder` read them straight back — `animated: true`, four frames, the
durations intact.

Transparency was the case worth doubting, because it is the reason to convert a
GIF to this format at all, and it survives without special handling: given a
canvas with an alpha channel the encoder returns `VP8L`, which carries its own
alpha, so there is no separate `ALPH` chunk to order correctly. A three-frame
test came back with the corner pixel still `rgba(0, 0, 0, 0)` and the drawing
on top of it opaque.

So this is container assembly of about the same size as the muxer work
elsewhere on this list, it needs no vendored anything, and the site keeps its
one `'wasm-unsafe-eval'` page rather than gaining a second. The reason this
line sat at the bottom of its group for so long has been removed; what is left
is the frame-by-frame decode of the GIF going in, which
[`split-gif`](tools/split-gif/src/gif.js) already does.

## Video

### Resize

The most-wanted video job there is, and the reason is always the same: the file
will not send. `VideoDecoder` and `VideoEncoder` do the work, behind the reader
that [`crop-video`](tools/crop-video/) and five other tools already ship as
[`mp4-reader.js`](shared/js/mp4-reader.js).

### Rotate

The cheapest thing on this entire list, and it should be built first for that
reason. A sideways MP4 does not need re-encoding — it needs a different display
matrix in `tkhd`, which is a few bytes. Both halves of that are shared parts:
[`mp4-reader.js`](shared/js/mp4-reader.js) carries the sample entry and the
display matrix out of the file whole, and reads the quarter turn the matrix
asks for, and [`mp4-writer.js`](shared/js/mp4-writer.js) writes the matrix it
is handed back into `tkhd`, because the trimmer and the reverser need a clip
filmed on a phone to come out the right way up. So the hard part is already
sitting in the repository being used for something else, and this tool is the
line between the two that changes the matrix.

### Mute a video

Dropping the audio track from an MP4 is a remux: the video samples are copied
untouched and one track is left out. Note what is *not* on this card any more —
saving a video's audio on its own already ships, as a page of its own at
[`extract-audio-from-video`](tools/extract-audio-from-video/), and
[`trim-audio`](tools/trim-audio/) and [`edit-audio`](tools/edit-audio/) take a
video too; none of the three decodes its picture. Half of the old
"Mute, or save the audio" line was a promise to build something that existed.

### Convert to MP4

The direction that matters. Whatever came off the screen recorder, the camera
or the messaging app, MP4 is the file that uploads, and `VideoEncoder` writes
H.264 where the browser supports it. The old card said "MP4 or WebM": WebM
encoding through WebCodecs is not dependable outside Chromium, and promising a
format half the visitors' browsers cannot write is worse than promising
nothing.

### Burn in subtitles

Silent autoplay is the default on every feed, so subtitles drawn into the
picture are how a video gets watched. It is a full decode-draw-encode pass,
which is the expensive kind, but the demand is real and the input — an SRT file
— is text.

### Subtitle converter

SRT, VTT, ASS, SBV and LRC in any direction, with timings that can be shifted
when the subtitles run ahead of the picture. It is arithmetic over strings, so
it is the cheapest tool on this list after video rotation, and it is the front
half of burn-in: the file somebody wants drawn into their video is very often
in the wrong format first. Every incumbent is a free page attached to a paid
transcription service.

## Audio

### Convert format

MP3, WAV and Opus. WAV out is a 44-byte header in front of the samples and
already exists as [`wav.js`](shared/js/wav.js), the part the audio editor, the
trimmer and the extractor all ship; Opus comes out of `MediaRecorder`, which
every browser ships, and out of `AudioEncoder` beside it, which also encodes
AAC — so an `.m4a`, which is what most people mean when they say a file will
not play, is free as well, and [`aac.js`](shared/js/aac.js) already writes the
description that goes round the configuration the encoder hands back, because
the video cutter and the reverser re-encode their sound. MP3 is
the one that needs help, and it is the one claim on this list that measuring
did not overturn: `AudioEncoder.isConfigSupported({codec: 'mp3'})` is false and
`MediaRecorder` will not take `audio/mpeg`. The answer is `libmp3lame` alone,
not a general FFmpeg build. That is the
[`heic-to-jpg`](tools/heic-to-jpg/README.md) lesson written down where the next
person will look for it: 1.4 MB for the job you need beats 25–30 MB for every
job you do not.

## Documents & PDF

### Crop pages

A page with margins worth losing: the scan with an inch of white down one side,
the slide deck printed four-up. It is one entry in the page dictionary, and
[`merge-pdf`](tools/merge-pdf/src/pages.js) already reads `/MediaBox`,
normalises the corners a real file names them in — either order, and both
happen — and writes it back out.

This card used to be "Rotate & crop pages", and half of it was a promise to
build something that had already shipped. `merge-pdf` turns pages: one page by
the arrows on its card, a range by "Turn these", the whole document by "Turn
every page", in fifteen languages. Advertising that as forthcoming is the
second question at the top of this file failing in its sharpest form — a card
next to a shipped tool, describing what the shipped tool does, reads as an
admission that the tool is unfinished. It is recorded under [Folded into tools
that exist](#folded-into-tools-that-exist), which is where it should have gone
the day it was built.

### Extract images

Pulling the pictures back out of a document is the reader
[`compress-pdf`](tools/compress-pdf/src/images.js) needed anyway, run in the
other direction, and it answers a question people ask constantly: the picture
is in the PDF and nowhere else, and they need it back.

## Beyond media

This group used to hold two cards that were not tools at all — "Data" and
"Privacy & security" — each naming a category and promising nothing with a
shape. Half of the second one had shipped already as
[`exif-editor`](tools/exif-editor/). These are what they should have said.

A third one, hashes and checksums, was written on this list and taken off it a
day later, because [`hash-checksum`](tools/hash-checksum/) had shipped while the
list was being rewritten and nobody noticed in time. That is rule 1 working
slowly rather than a rule being broken — but it is also the second time this
group has advertised something that already existed, which is a good reason to
check `tools/` before adding a name here rather than after.

### CSV & JSON

CSV in both directions, with RFC 4180 quoting done properly, the delimiter and
encoding sniffed rather than assumed, and the mess a spreadsheet exported
tidied up. [`parse-json.js`](shared/js/parse-json.js), which the JSON
formatter, the XML formatter and the YAML converter all ship, is a JSON parser
that keeps key order, keeps numbers as the text they were written as and keeps
duplicate keys, so one half of this is a printer away. The files are
payroll, customer lists and exports from systems people are not allowed to
paste into a website.

### Certificates & keys

An ASN.1 and X.509 reader: what is in this certificate, what does this signing
request actually say, when does it expire, does this key match. No file needed —
it is a paste box, like [`qr-barcode`](tools/qr-barcode/), which is the one
shape where the promise costs nothing to keep. Nearly every incumbent is an SSL
reseller with a form that posts to their own server, and the standard advice
about them is "check the vendor is reputable first". A decoder that cannot send
anything is a better answer than a reputable vendor.

---

## Folded into tools that exist

These were cards. They are features of tools that already ship, and each one
made its tool look unfinished for as long as it sat on the roadmap.

| Was on the list | Belongs in | Why |
|---|---|---|
| Rotate & flip | [`resize-image`](tools/resize-image/) | One transform in front of the `drawImage` that tool already makes. Listing it separately implied the Image Resizer could not turn a picture sideways. |
| Reverse a GIF | [Edit a GIF](#edit-a-gif) | The reader and writer for it are both already in the repository; it is a checkbox, not a page. |
| Change GIF speed | [Edit a GIF](#edit-a-gif) | Retiming is editing the delay on each frame — the same file, the same tool. |
| Fade in & out | [`edit-audio`](tools/edit-audio/) | [`trim-audio`](tools/trim-audio/src/main.js) already places fades on its cuts. What was left is fading the head and tail of a whole file: a control in the audio editor. |
| Waveform image | [`edit-audio`](tools/edit-audio/src/waveform.js) | That tool already draws the waveform. The roadmap item was a download button underneath it. |
| Save a video's audio | shipped | [`extract-audio-from-video`](tools/extract-audio-from-video/) is a page of its own now, and [`trim-audio`](tools/trim-audio/) and [`edit-audio`](tools/edit-audio/) accept a video too; none of the three decodes its picture. This was on the roadmap after it was built. |
| Rotate PDF pages | [`merge-pdf`](tools/merge-pdf/) | `/Rotate` is one number in the page dictionary, so the merger got it for nothing while it was already rewriting them — per page, per range, or the whole document. It was on the roadmap after it was built, paired with [Crop pages](#crop-pages), which is the half that is still real. |

## Taken off the list

### Filters, on images

Brightness, contrast, saturation, blur, grayscale. Cheap to build and easy to
do well, and it still fails the second question at the top of this file: nobody
is afraid to upload a photo to make it brighter. Every phone ships this, every
image site ships this, and there is no version of it where not uploading the
file is the reason to choose us. Cheap is not the same as worth a page.

### Filters, on video

The same argument, and then worse. On video it is a full decode of every frame,
a filter pass and a full re-encode — the most expensive job in the group — in
exchange for the least-wanted result in it. Anybody adjusting the contrast of a
video is already in an editor that does it in real time.

### APNG maker

Cheap — PNG chunks and `CompressionStream('deflate')`, both of them already in
the browser — and wanted by almost nobody. The audience that needs animation
with real transparency and full colour has largely gone to WebP or to video,
and a card is a promise of attention. This one would have sat on the page for
years being read as a thing we had not got round to.

### JPEG XL

It was one card with AVIF, and the two do not belong together. AVIF has real
demand and a specific defect to fix. JPEG XL needs `libjxl` vendored for both
directions to serve an audience that is small and not growing: Chrome and
Firefox keep a decoder behind a flag and only Safari turns it on. If that
changes, the argument changes with it, and this paragraph is where to come back
and say so.

### "…or WebM"

Not a tool of its own, but worth recording. Two cards used to offer MP4 *or*
WebM. Writing WebM through WebCodecs is not dependable outside Chromium, so the
promise was one that half of this site's visitors could not have kept for them.
The cards now say MP4, which is also the format they actually needed.

## Considered, and not listed yet

Written down so that "why isn't X on the roadmap" has an answer, and so the
answer can be revisited rather than re-argued.

- **Bank statement PDF → CSV.** The highest-value gap found so far. It has a
  whole paid industry, and one competitor's entire pitch is that it runs in the
  browser so the statement is never uploaded — accountants' client-data policies
  forbid the alternative. It is not on the list only because it is the largest
  build of any candidate: text extraction with `ToUnicode` and CMap handling,
  then table reconstruction from glyph positions. It goes on the list the day
  somebody is ready to start it, not before.
- **PDF page to PNG.** Asked for constantly, and it needs a renderer rather
  than a reader — a font engine and a full graphics model, which is a vendored
  engine on the scale of the FFmpeg argument. This entry used to end by saying
  it belonged beside background removal and camera RAW in the ruled-out table
  instead of here; that move has now been made, so the argument lives in
  [What can be built here](docs/what-can-be-built-here.md#what-is-still-left-out)
  and this line is a signpost to it.
