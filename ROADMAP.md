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

**What people want is a claim with an expiry date too, and until November 2026
nobody had measured it.** Every "asked for constantly" in this file was an
impression. On 12 November 2026 the list was put to Google Trends — the phrases
people type for each card, beside the phrases for tools that have shipped — and
the result is
[What people search for, measured](#what-people-search-for-measured), at the
foot of this file. It put three cards under Documents & PDF, it says which of
the older lines is wanted most by a distance nobody had guessed, and it comes
with enough caveats that the section is worth reading before a number from it
is quoted.

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

The search numbers say how the page should introduce itself. Hardly anybody
asks to "add text to a photo": those phrases together come to 0.7 in the wider
world and 3 in the United States, on the scale at the foot of this file where
"merge pdf" is 100. They ask for a meme generator, at 17 and 366. That is the
caption box above the picture — the second half of this card — under the name
people type, and it is the same canvas either way.

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
elsewhere on this list, it needs no vendored anything, and it adds no page to
the ones that carry `'wasm-unsafe-eval'` — one when this was written, two
since the receipt reader shipped. The reason this line sat at the bottom of
its group for so long has been removed; what is left is the frame-by-frame
decode of the GIF going in, which
[`split-gif`](tools/split-gif/src/gif.js) already does.

## Video

### Mute a video

Dropping the audio track from an MP4 is a remux: the video samples are copied
untouched and one track is left out. Note what is *not* on this card any more —
saving a video's audio on its own already ships, as a page of its own at
[`extract-audio-from-video`](tools/extract-audio-from-video/), and
[`trim-audio`](tools/trim-audio/) and [`edit-audio`](tools/edit-audio/) take a
video too; none of the three decodes its picture. Half of the old
"Mute, or save the audio" line was a promise to build something that existed.

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

Measured in November 2026, this is the most wanted line on the list in the
United States by a factor of three — 231 on the scale where "merge pdf" is 100,
with the next card at 77 — and the second in the wider world, at 32. Seven
tenths of the worldwide figure is one phrase, "mp4 to mp3": the sound of a
video, as an MP3, which is exactly where
[`extract-audio-from-video`](tools/extract-audio-from-video/) stops, because it
saves a WAV. So the encoder has two front doors and this card is the second.
The day `libmp3lame` is vendored, the extractor offers MP3 first.

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

### PDF to Excel

[`pdf-to-csv`](tools/pdf-to-csv/) already does the hard part, and its README
says what that is: there is no table in a PDF, only text placed at positions,
so every table is inferred. What it hands back is a CSV, and that is not the
word people use. "PDF to Excel" is searched for half as often as "merge pdf" —
49 in the wider world, 38 in the United States, on the scale at the foot of
this file — and nothing on this site writes a workbook.

The inference does not change; only the file at the end does, and in that tool
the file at the end is one module, [`csv.js`](tools/pdf-to-csv/src/csv.js). An
`.xlsx` is the kind of file this repository keeps writing: a ZIP, which
[`zip.js`](shared/js/zip.js) makes, around a handful of XML parts. It is also a
better answer than the one it stands beside. `csv.js` carries two workarounds
whose whole purpose is to survive being opened by Excel — a byte order mark,
so that a pound sign is not read in a legacy code page, and an apostrophe in
front of text shaped like a formula, a convention its README admits no
spreadsheet is obliged to honour. A workbook needs neither: its encoding is
declared, and each cell says what it is. `values.js` already knows which cells
are amounts, so those go in as numbers; everything else goes in as text, and
an account number keeps its leading zeros because nothing guesses at it on the
way in.

What a workbook does not fix has to stay on the page. A column inferred wrongly
is exactly as wrong in a spreadsheet, so the preview and the balance check stay
in front of the download. And a scanned statement has no text to place, which
is [Image to text](#image-to-text) below; until that exists this page says
that scanned pages need OCR first, as the CSV page does.

One thing to check before any of it is written. `zip.js` stores without
compressing, which the format allows, and nobody here has opened a stored
workbook in Excel to see that Excel agrees. `CompressionStream('deflate-raw')`
is in every browser if it does not.

It is a card rather than a second button on PDF to CSV because of the first
paragraph: the person it is for does not know that CSV was the thing to ask
for. The button should exist as well.

### Sign a PDF

The document people are most often told to upload to a stranger is the one
they least should: a lease, an offer letter, a tax form, with a name and an
address on it and now a signature as well. In the United States this is
searched for three quarters as often as "merge pdf" — 77, with a signature
maker at 57 and filling in a form at 56. In the wider world it is small, at 8.

Most of the writing exists. [`watermark-pdf`](tools/watermark-pdf/) places a
picture with a soft mask on a page by adding one content stream and touching
nothing that was there, and its `stamp.js` works out where that picture lands
on a page that has been turned or cropped. A signature is that picture drawn
rather than typed — strokes on a canvas, or a photograph of ink on paper put
through the tracing [`image-to-svg`](tools/image-to-svg/) already does for
signatures — and placed on one page instead of on all of them.

The part that is missing is the part that makes it a tool. A watermark can go
anywhere; a signature has to go on the line. The watermark's preview is "the
placement, not the page": a blank sheet of the right shape, which its README
defends as honest and which is no help in finding where a contract wants
signing. This site has no PDF renderer, and
[What can be built here](docs/what-can-be-built-here.md#what-is-still-left-out)
rules one out.

So one experiment comes before this is built.
[`pdf-text.js`](shared/js/pdf-text.js) already knows where every character on a
page sits — it is how the redactor finds a name — and a sheet with the page's
own words drawn where they are may be enough to find "Signature" and "Date"
by. If it is, this is a small tool. If it is not, this card is the second
argument for a renderer, and the first, PDF page to PNG, is under
[Considered, and not listed yet](#considered-and-not-listed-yet) with its
number beside it.

Two things the page has to say out loud. This is ink and not cryptography: it
puts a mark on the page and proves nothing about who put it there. A
certificate signature — the kind [`merge-pdf`](tools/merge-pdf/) and
[`unlock-pdf`](tools/unlock-pdf/) already warn about breaking — is a different
job, and signing this way breaks one like any other rewrite. And filling in a
form's fields, the request that travels with this one, is not on this card; it
is under Considered as well.

### Image to text

Two pages on this site already send their visitors somewhere else for this.
[`pdf-to-csv`](tools/pdf-to-csv/) says in its own description that scanned
pages need OCR first, and [`document-scanner`](tools/document-scanner/) makes
exactly the file OCR works best on and stops there. Each is a person holding
the statement or the identity document this site has just helped them keep on
their own machine, being told to take it elsewhere to be read.

The scanner's README gives the reason: "a recognition engine, which is tens of
megabytes of model". That was an estimate, and
[`receipt-invoice-extractor`](tools/receipt-invoice-extractor/) has since been
the measurement. It vendors Tesseract — an engine of 2.9 MB and an English
model of 3.0 MB, about 4.5 MB over the wire with their loaders — and reads a
photograph in a worker without widening `connect-src`, at the price of
`'wasm-unsafe-eval'` and `worker-src blob:` on that page. So the engine is on
the site already, behind a receipt parser, and this card is that engine with
the parser taken off: the words, beside the picture they came from, to copy or
to save. It would pay the same price in policy.

What is left is three costs, and the first is the large one.

- **English only.** The vendored model reads English printed text, and its
  README says that other scripts are not claimed. This site is built in seven
  languages, Chinese and Japanese among them, and every language is a model of
  its own. A page that reads only English has to say so in each language it is
  published in, or carry the models to mean it.
- **The engine lives in one tool's folder.** The build copies
  `tools/<slug>/vendor/` for that tool and no other. A second page that wants
  the same eight megabytes on disk needs somewhere both can load them from,
  and the build has no such place yet.
- **It misreads.** The receipt page puts a review step in front of every figure
  for that reason. Raw text has no fields to confirm, so the picture stays on
  screen beside it.

The search numbers argue for doing this soon or not at all: 15 in the wider
world and 54 in the United States, against 32 and 80 for the same weeks a year
earlier. The likely reason is that a phone now reads the text out of a
photograph, and so does any chat window somebody is willing to paste the
photograph into. What is left is the person who is not willing, and that is
who this site is for.

A scan inside a PDF is usually one picture to a page, and
[`compress-pdf`](tools/compress-pdf/src/images.js) already reads those out, so
the same page can take a scanned PDF without a renderer. Writing the text back
in as a searchable layer is a further step, and it is not promised here.

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

- **PDF page to PNG.** Asked for constantly, and it needs a renderer rather
  than a reader — a font engine and a full graphics model, which is a vendored
  engine on the scale of the FFmpeg argument. This entry used to end by saying
  it belonged beside background removal and camera RAW in the ruled-out table
  instead of here; that move has now been made, so the argument lives in
  [What can be built here](docs/what-can-be-built-here.md#what-is-still-left-out)
  and this line is a signpost to it.

  "Constantly" has a number now, for whenever this is argued again: "pdf to
  jpg" and its variants come to 167 in the wider world and 196 in the United
  States, which is more than "merge pdf". It is also no longer the only thing
  waiting on a renderer — [Sign a PDF](#sign-a-pdf) may be. And "on the scale
  of the FFmpeg argument" has no figure beside it: nobody has written down
  what a renderer weighs, and the receipt reader has since shipped eight
  megabytes of engine for one job.
- **PNG to JPG, and the `.jfif` nobody asked for.** Searched for at 25 in the
  wider world and 84 in the United States, and not a card, because it is not
  unbuilt: [`resize-image`](tools/resize-image/) converts in both directions
  today, and a card would tell somebody reading the roadmap that this site
  cannot. What is missing is a page with that name on it, the way
  [`webp-to-jpg`](tools/webp-to-jpg/) and [`avif-to-jpg`](tools/avif-to-jpg/)
  are pages over the same shared converter. That is a decision about search
  rather than about capability, and the way to take it is to build the page.
  If it is built, JFIF belongs on it: "jfif to jpg" is small — 7 and 5 — and
  rising in both places, from 5 and 2 a year earlier. A `.jfif` *is* a JPEG,
  under an extension some upload forms will not take, so the honest conversion
  is a new name on the same bytes, with nothing decoded and nothing compressed
  a second time.
- **PDF to Word.** The largest number measured: 312 in the wider world, 239 in
  the United States. The reason it is not a card is a sentence from
  [`pdf-to-csv`](tools/pdf-to-csv/README.md)'s account of itself — there is no
  table in a PDF. There is no paragraph in one either, nor a heading, a column
  or a footnote; there are characters at positions, and a `.docx` is made of
  exactly the things that are not there. The reader can already say where
  every character sits. Turning that into a document somebody can edit without
  it coming apart is the whole product, and it may be the tracing story again:
  an honest algorithm whose output is not what the visitor pictured. Not
  listed until somebody has put a real contract through the inference and
  looked at what came out.
- **Filling in a PDF form.** 3 in the wider world and 56 in the United States,
  where one of the phrases is also a company's name and flatters the figure. A
  form's fields are objects with values, which the reader and writer here can
  set. The catch is that a viewer draws a field from an appearance stream kept
  beside the value, and writing one means setting text in a font: Latin in the
  fourteen standard faces is within reach, and anything else is the question
  [`watermark-pdf`](tools/watermark-pdf/) answered by drawing a picture. It
  belongs with [Sign a PDF](#sign-a-pdf) if that is built, as the other half
  of one errand.
- **Recording the screen or the camera.** "Screen recorder" is 14 in the wider
  world and 77 in the United States; a webcam recorder, 3 and 38. It keeps the
  promise — `MediaRecorder` writes the file on the visitor's own machine, and
  [`share-tab`](tools/share-tab/) already asks for a screen — and fails "want
  it *here*" the way filters did: every phone and nearly every desktop ships a
  recorder that uploads nothing, so not uploading is no reason to choose this
  one. "Voice recorder" was measured and is not quoted, because the phrase is
  also a thing people buy.
- **Keyboard, microphone and webcam tests.** 18, 11 and 9 in the wider world;
  40, 66 and 52 in the United States, and holding steady where most of this
  list is falling. Each is a small page, and a tester that can be seen to send
  nothing is a better thing than one that does not say. What nobody has argued
  is the other half: whether anybody choosing a keyboard tester is afraid of
  it. Not listed until somebody does; this is the number to start from.
- **Zip and unzip.** Making an archive is 4 in the wider world and 58 in the
  United States; opening one, 3 and 30. [`zip.js`](shared/js/zip.js) writes
  them already, and reading one is a directory walk and
  `DecompressionStream('deflate-raw')`. It is the filters argument again —
  every operating system has done both for years without uploading anything —
  so the number is recorded and the card is not written.

---

## What people search for, measured

Measured on 12 November 2026 in Google Trends, web search, over the five weeks
from 4 October to 7 November 2026, once for the whole world and once for the
United States. A tool's number is its search phrases added together, each in
quotation marks so that the words have to appear in that order, as a percentage
of the same figure for "merge pdf" in the same place and the same weeks. So 100
is as wanted as the PDF merger, and one region's 100 is not the other's. Small
worldwide figures were taken against "crop pdf" and scaled through it; three
taken both ways agreed to within 0.1.

| | World | US | The phrases added together |
|---|---:|---:|---|
| **Shipped, for scale** | | | |
| PDF Merger | 100 | 100 | merge pdf |
| PDF Compressor | 83 | 81 | compress pdf |
| Splitting, in the merger | 28 | 40 | split pdf, pdf splitter |
| **On the list** | | | |
| PDF to Excel | 49 | 38 | pdf to excel, pdf to xlsx |
| Convert format | 32 | 231 | mp4 to mp3, mov to mp3, wav to mp3, m4a to mp3, webm to mp3 |
| Image to text | 15 | 54 | image to text, picture to text, photo to text, jpg to text, extract text from image |
| Crop pages | 9.5 | 3.3 | crop pdf |
| Sign a PDF | 7.7 | 77 | sign pdf, pdf sign, pdf signature, sign a pdf |
| Edit a GIF | 2.7 | 44 | gif compressor, gif resizer, gif editor, resize gif, crop gif, compress gif |
| Animated WebP | 1.0 | 6.3 | webp to gif, gif to webp, animated webp |
| Mute a video | 1.0 | 4.0 | mute video, remove audio from video, remove sound from video |
| Add text | 0.7 | 3.0 | add text to image, add text to photo, text on photo, write on image |
| — the same tool, as a meme generator | 17 | 366 | meme generator, meme maker |
| Subtitle converter | 0.5 | 0.5 | srt to vtt, vtt to srt, subtitle converter, srt converter, srt editor |
| Burn in subtitles | 0.4 | 1.4 | add subtitles to video, burn subtitles, add captions to video, subtitle maker |
| CSV & JSON | 0.4 | 1.0 | json to csv, csv to json |
| Certificates & keys | 0.3 | 0.7 | csr decoder, certificate decoder, ssl decoder, x509 decoder, pem decoder |
| AVIF | 0.3 | 0.3 | png to avif, jpg to avif, avif converter, to avif |
| Extract images | 0.1 | 0.3 | extract images from pdf, pdf image extractor, extract image from pdf |
| DICOM anonymizer | 0.0 | not taken | dicom anonymizer, anonymize dicom, dicom converter, dicom to jpg, dcm to jpg |
| **Considered, and not listed** | | | |
| PDF to Word | 312 | 239 | pdf to word, pdf to docx, pdf to doc |
| PDF page to PNG | 167 | 196 | pdf to jpg, pdf to png, pdf to image, pdf to jpeg |
| PNG to JPG | 25 | 84 | png to jpg, jpg to png, jpeg to png, png to jpeg |
| JFIF to JPG | 6.6 | 5.4 | jfif to jpg, jfif to png, jfif to pdf, jfif converter |
| Signature maker | 5.1 | 57 | signature generator, signature maker, draw signature, signature creator |
| Filling in a PDF form | 2.7 | 56 | fill pdf, pdf filler, fill out pdf, pdf form filler |
| Screen recorder | 14 | 77 | screen recorder |
| Webcam recorder | 2.6 | 38 | webcam recorder, record webcam, camera recorder, online camera |
| Keyboard test | 18 | 40 | keyboard test, keyboard tester |
| Microphone test | 11 | 66 | mic test, microphone test |
| Webcam test | 8.9 | 52 | webcam test, camera test |
| Making a zip | 3.7 | 58 | zip files, create zip file, zip file maker, compress to zip |
| Opening a zip | 2.9 | 30 | unzip files, zip extractor, rar extractor, open zip file, open rar file |

**How far to trust it**, which is less far than a table of numbers looks:

- **It is a share of searches, not a count of people**, and it is one search
  engine's.
- **English phrases only.** The worldwide column is mostly the countries that
  search in English, and it disagrees with the American one by a factor of ten
  on signing a PDF, which is a warning about both. The other six languages this
  site is built in were not measured at all.
- **A phrase can mean something else.** "pdf filler" is a company, "voice
  recorder" is a thing in a shop, and "video to mp3" is often a request for
  somebody else's video — which is why that last phrase is not in the Convert
  format row.
- **The level is better evidence than the direction.** Trends has a break in
  2026. In February and again from June to September, two phrases with nothing
  in common — "add subtitles to video" and "remove background noise" — rose
  together to many times their usual level and were back where they started in
  October; "heic to jpg" swelled in the same months, and "merge pdf" fell away
  for two weeks in September. A comparison across that year measures something
  other than people. Where this file says "a year earlier" it means the same
  five weeks of 2025, against "merge pdf" in those weeks, and it says so only
  where both regions moved the same way.
- **It is half the question.** The top of this file asks whether somebody
  wants a thing *here*. DICOM anonymizer registers nothing in this table and
  is the sharpest promise on the list.

To take it again: one Trends comparison holds five terms, a tool's phrases are
joined with a plus sign inside one term, and the address carries the dates —
[this one](https://trends.google.com/trends/explore?date=2026-10-04%202026-11-07&q=%22merge%20pdf%22,%22png%20to%20jpg%22,%22pdf%20to%20excel%22,%22sign%20pdf%22,%22crop%20pdf%22)
is five of the rows above.
