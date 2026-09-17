# WebP to JPG

[← All tools](../README.md) · [The tool](https://abox.tools/webp-to-jpg/)

Decodes a WebP with the browser's own decoder, draws it on a canvas, and asks
the canvas for a JPEG. That is the whole pipeline, and its shortness is the
argument the page makes: there is no engine here, so there is no reason for a
server, so there is no reason to upload anything.

It is one of three tools built on `shared/js/image-convert.js` — the others
being [PNG to WebP](../png-to-webp/) and [AVIF to JPG](../avif-to-jpg/). They
are the same three steps with a different pair of formats at each end, and
everything they share lives in that module rather than in three copies here.

## Why this is not heic-to-jpg

[`heic-to-jpg`](../heic-to-jpg/) carries 1.4 MB of `libheif` compiled to
WebAssembly, and its page spends most of its words explaining why. This tool
carries nothing. Every browser released since 2020 decodes WebP natively, and
every canvas has written JPEG since long before that, so the interesting claim
here is the absence of a codec rather than the presence of one.

That difference is worth keeping straight when editing either page. The HEIC
converter needs `'wasm-unsafe-eval'` in its CSP and is the only tool on the
site that widens the policy at all; this one widens nothing, and its
`csp_note` says so explicitly rather than leaving the reader to notice.

## The two things a WebP has that a JPEG cannot

Both are read before anything is converted, and both are reported on the row
and again on the result. They are the whole reason this tool is more than a
canvas call.

**Transparency.** A JPEG has no alpha channel, so something goes behind the
picture whether the visitor chooses it or not — `encode()` in the shared
module paints the background first for any format whose `FORMATS` entry says
`alpha: false`, and the caller cannot turn that off. Without it the
see-through parts come out black, which is where every "my logo has a black
background now" complaint about every other converter comes from.

The colour field appears only when a file on the list actually has
transparency, and that is a question about the *pixels*, not the container:
`webpFacts()` reads the `ALPH` chunk and the `VP8X` alpha flag, and then
`hasAlpha()` decodes and walks the alpha channel to confirm it. A WebP can
perfectly well carry an alpha channel that is opaque corner to corner, and
offering a matte colour for one is a control that does nothing.

That walk is exact rather than sampled, and on a band-sized canvas rather than
a picture-sized one. Both were bugs found by measuring: scaling into a 256-pixel
box averages a few thousand nearly-opaque pixels back to solid (and answered
differently through `createImageBitmap` than through an `<img>`), and a canvas
the size of a 400-megapixel picture is past what a browser will allocate, so it
silently reads back as entirely transparent. See the note in the module.

**More than one frame.** An animated WebP decodes to its first frame through
`createImageBitmap`, which is the only thing a still format could be given.
`webpFacts()` spots the `ANIM`/`ANMF` chunks so the page can say so in
advance, rather than letting somebody discover it in a downloads folder.

## What the rows say, and why only sometimes

Each file's row carries up to three notes — lossless, see-through, animated —
and each appears only when it is true of that file. A row that says "Lossy
WebP" about every file is a row nobody reads by the third one; a row that
says "Lossless WebP" about the one file where it matters is a row that earns
its place, because the JPEG made from a lossless WebP is the first lossy copy
that picture has ever had.

## Identifying a file by its bytes

`sniff()` reads the first 64 bytes and never the extension. A WebP saved as
`.jpg` is one of the commonest reasons somebody is looking for this tool, and
a file that is genuinely a PNG is refused with a line naming what it actually
is rather than being converted into a copy of itself. The picker's `accept`
is deliberately wider than `.webp` for the same reason: a narrow accept list
hides the misnamed file inside the browser's own dialog, where no message can
reach it.

## The example

Two files, both drawn in the page (`src/example.js`; see
`shared/js/example-photo.js` for why examples here are never fetched):

- a photograph written as a lossy WebP at quality 0.85, so the JPEG this tool
  writes from it is a second-generation copy — which is what a real one would
  be, and what the page's paragraphs about re-encoding assume;
- the flat mark from `shared/js/example-mark.js` written at quality 1, where a
  canvas switches to WebP's lossless coding. It has an alpha channel, so it is
  the file that makes the background-colour field appear and puts the
  "filled with" note on a result. Without it the example would demonstrate a
  quality slider and nothing else.

## Testing

`tests/js/image-convert.test.js` covers the pure half of the shared module —
sniffing, the RIFF walk, `webpFacts`, naming and the size comparison — against
byte fixtures. The canvas half cannot be unit tested in Node and is checked in
a browser, which for this tool means: convert the example, confirm the mark's
transparency is filled with the chosen colour rather than black, and confirm
the animated case reports its first frame.
