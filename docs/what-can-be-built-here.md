# What can be built here

[← README](../README.md)

The "Planned" list on the roadmap is not a wishlist. Its media groups were
drawn up by going through the tool list of the largest online GIF and video
site — the closest thing there is to a complete catalogue of what people
actually want done to a media file — and putting every entry through one test:

> Does all of the work happen on the visitor's own machine, with the file never
> leaving it, and does the tool still run with the network unplugged?

Note what that test does **not** ask. It does not ask whether the code is small,
or hand-written, or readable in one sitting. Those are good properties — most of
this repository has all three, and `src/mp4.js` is why the first tool needed no
dependency at all — but they are a preference, not the promise. The promise is
that your file stays on your machine. A tool that keeps that promise with thirty
megabytes of vendored WebAssembly keeps it exactly as completely as one that
keeps it with four hundred lines of hand-written muxer.

That catalogue is no longer the only source. The list has since been pruned —
several of its lines turned out to be features of tools that had already
shipped, and a few had nothing going for them but being cheap to build — and
extended past media into documents and personal records, where the file leaving
the machine has a legal or a financial consequence rather than an aesthetic
one. Each surviving line is argued in [ROADMAP.md](../ROADMAP.md), and so is each
line that was taken off, which is the half worth reading before putting one
back.

## What the browser can do on its own

Reach for this first. Where a native API does the job there is no reason to ship
an engine to do it instead, and these all stay small enough to read.

| Group | What does the work |
|---|---|
| Image resize, crop, rotate, convert, compress, filters, text | `createImageBitmap` → `<canvas>` → `canvas.toBlob`. PNG, JPEG and WebP are encoders the browser already has. Compression is built: `/compress-image/`, where the interesting part turned out to be not the encoding but the search that decides what quality to ask for. Resize, crop and convert are built too, as one tool rather than three: `/resize-image/`, where they are one `drawImage` call and the work is entirely in deciding which rectangle goes where |
| Metadata viewer and remover | EXIF is a byte structure inside the file, so reading it is parsing and removing it is deleting bytes. Built: `/exif-editor/`. Note that it does **not** re-encode through a canvas, which was the original plan here — going through a canvas drops every tag, but it also re-compresses the picture. Rewriting the container instead leaves the image data untouched |
| Icons and images to PDF | Containers, not codecs — a header wrapped around images that are already encoded. The same trick `src/mp4.js` plays. PDF is built: `/images-to-pdf/`, where the payoff is that a JPEG can go into the document byte for byte and never be decoded at all. Icons are built too: `/image-to-ico/` writes both desktop containers, and the interesting part turned out to be neither header but the table of which sizes each platform actually asks for |
| Reading and rewriting a PDF | Object syntax, a cross-reference table and `DecompressionStream` for the Flate that nearly every stream in one is wrapped in. Built: `/compress-pdf/`, which needed the reader `/images-to-pdf/` never had. Merging, splitting, reordering, rotating and pulling the images back out are all small tools on top of it now that it exists |
| SVG to PNG | An `<img>` holding an SVG draws to a canvas. Only for SVGs with no external references, which is also what keeps it offline |
| GIF: make, split, resize, reverse, retime, analyze | LZW and a color quantizer, written out the way the MP4 muxer was. Making one is built: `/gif-maker/`, where the file format turned out to be the easy half and the palette the whole job — 256 colours have to be chosen out of tens of thousands, and which 256 is what the picture looks like. Reading animated GIFs is `ImageDecoder` where it exists and a hand-written parser where it does not |
| APNG | PNG chunks, with `CompressionStream('deflate')` for the pixel data — the compressor is already in the browser |
| Video: trim, resize, crop, rotate, reverse, frame grabs, filters, subtitles | `VideoDecoder` and `VideoEncoder`, plus an MP4 *de*muxer to sit beside the muxer that already exists. Cropping is built: `/crop-video/`, where the demuxer turned out to be the whole job and the crop itself is six lines of canvas. Cutting is built: `/trim-video/`, and it is the one job in this column that needs no codec at all &mdash; the frames are moved, not decoded |
| Audio: trim, fade, speed, volume, waveform | `decodeAudioData` and `OfflineAudioContext`. WAV out is a 44-byte header in front of the samples |
| QR codes and barcodes | Arithmetic over a string: there is no input file at all, which makes this the one group here where the promise costs nothing to keep. Built: `/qr-barcode/`, where the work turned out to be the specification's two tables of block counts — checked against the published capacities rather than trusted — and the eight masks, one of which is chosen by scoring the picture each one draws |

## What needs a vendored engine

Everything below is out of reach of the browser's own APIs and in reach of an
`ffmpeg.wasm` build. It passes the test at the top of this section — the file
never leaves the machine and the tool works with the network unplugged — so it
is on the roadmap on that basis.

**One of these has been built, and it did not need FFmpeg.** HEIC to JPG is
`/heic-to-jpg/`, and it vendors `libheif` rather than FFmpeg: the same job at
1.4 MB instead of 25–30 MB, because libheif is only that job. Read
[its README](../tools/heic-to-jpg/README.md) before reaching for the big build for
anything else here — the lesson generalises, which is that the estimate below is
the ceiling and not the price. It also settled the two costs this section warns
about. `script-src` did need `'wasm-unsafe-eval'`, on that page and nowhere
else. `connect-src` did **not** need `'self'`, because the engine ships as a
script with its binary embedded rather than as a loader that has to go and fetch
one — which costs about 140 KB over the wire and buys a policy with no asterisk
on it.

| Tool | Why it needs the build |
|---|---|
| Encoding MP3 | No browser ships an MP3 encoder. `libmp3lame` is one, so "anything to MP3" becomes a real converter instead of only "MP3 in, WAV out" |
| Encoding AVIF | Chromium's `canvas.toBlob` is the only native writer, and everywhere else it quietly hands back a PNG. `libaom` writes it the same way in every browser |
| Animated WebP | Every browser decodes it and none encode it. `libwebp` does both |
| JPEG XL, both directions | Chrome 145 and Firefox 152 carry a decoder behind a flag, and only Safari turns it on by default. `libjxl` in the build makes the browser's own support irrelevant |

**What it costs, and what has to change to pay it.** None of this is free, and
all of it is knowable up front:

- **The core is roughly 25–30 MB, and it is served from this origin.** A CDN
  copy would put a third party in the path of every visit and could not be
  cached for offline use, which is the whole point. Vendor it, commit it, and
  put it in that tool's service worker precache. A tool that downloads its own
  engine the first time you press the button is not an offline tool.
- **Two CSP changes, in the tool that needs them and nowhere else.**
  `script-src` needs `'wasm-unsafe-eval'`, and `connect-src` needs `'self'` —
  which no page here currently grants. Today `connect-src` names Google's
  endpoints and nothing else, so an FFmpeg worker could not fetch the `.wasm`
  file sitting in its own folder. Do not add either to the hub page.
- **Use the single-threaded core.** The multi-threaded one needs
  `SharedArrayBuffer`, which needs `Cross-Origin-Opener-Policy: same-origin` and
  `Cross-Origin-Embedder-Policy: require-corp`. `require-corp` breaks AdSense:
  Google's scripts and frames do not send the CORP header it demands. It is
  threads or ads, not both. If a tool ever genuinely needs the threaded build,
  it gets those two headers *and* no ad slots, and the ad section of this file
  has to say so out loud.
- **Say it on the tool's page.** The privacy panel already reports what the page
  loaded. A tool carrying an engine should name it, give its size, and say
  plainly that it came from this origin once and contacted nothing afterwards.

## What is still left out

| Ruled out | Why |
|---|---|
| Background removal | A segmentation model, not a codec. FFmpeg does not do it and would not help — this needs weights and an inference runtime, which is a separate argument on a separate day |
| Camera RAW, **decoded** (CR2, NEF, ARW) | FFmpeg does not decode these either. It would take LibRaw or dcraw on top: a second engine, for one family of formats. Still ruled out — but see below, because reading a RAW file turned out not to require it |
| Raster to vector (image to SVG) | A tracing algorithm, not a conversion: large, and the output disappoints everyone who expected their photo back as shapes |

### Camera RAW, read rather than decoded

The line above says what it says, and `/stack-images/` reads CR2, NEF, ARW, DNG,
RAF, RW2 and a dozen others anyway. Both are true, and the distinction is worth
keeping straight, because it is the one that decides whether a future tool can
do the same.

Every RAW file already contains a **full-size JPEG that the camera rendered when
it took the shot** — the picture on the back of the camera, and the one an
operating system draws as the thumbnail. Finding it is directory walking, not
decoding: a TIFF chain, a Fujifilm header, or an ISO-BMFF track table, and then
one slice. Roughly four hundred lines, no engine, and no change to the policy.

The rule that makes it safe is not in the tags. Cameras write directories that
point at packed sensor data with a compression field claiming JPEG, so a
candidate only counts once its first bytes are `FF D8 FF` — see
`tools/stack-images/src/raw.js` and the fixture for exactly that case in
`tests/js/stack-images-raw.test.js`.

So the test for a new tool is which of the two it needs:

| | |
|---|---|
| **Reading a RAW file** | available now, cheaply. Full resolution, the camera's own rendering, eight bits a channel. Enough for stacking, for a contact sheet, for a format conversion, for anything that would have accepted the camera's JPEG |
| **Decoding a RAW file** | still ruled out. Linear sensor data at twelve or fourteen bits, your own white balance, highlight recovery. That is LibRaw, and the paragraph above still applies |

A tool must say which it did. `/stack-images/` says so on the page, in its
second FAQ answer, rather than letting "reads RAW" imply the other thing.

