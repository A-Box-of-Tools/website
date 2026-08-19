# A Box of Tools

The source for **[abox.tools](https://abox.tools/)** — a small collection of
single-purpose web tools that do all of their work **in the browser**. No server,
no upload, no account.

The selling proposition is not "we promise not to look at your files", it is
"there is no code path that could send them anywhere". Everything below is
written to keep that true.

Most of these tools are also small enough to read in one sitting, and that is
worth keeping wherever it is free. It is not the promise, though. Where the
browser cannot do a job on its own, a vendored engine that runs on the
visitor's own machine beats not shipping the tool at all — see
[What can be built here](#what-can-be-built-here).

---

## The tools

| Tool | Lives at | What it does |
|---|---|---|
| Images to Video | `/images-to-video/` | Turns a sequence of images into an MP4, encoded locally |
| EXIF Viewer & Remover | `/exif-editor/` | Reads, edits and strips the metadata in a JPEG, PNG or WebP |

The hub page (`index.html`) lists them by category.

Every page loads Google's ad and measurement scripts, which is why the
Content-Security-Policy in each page names Google origins rather than being the
flat `default-src 'none'` it started as. Neither script is given anything about
a user's files: no file, thumbnail, filename, size, or count is read out to
them, and there is no custom event anywhere in this repository that would carry
one. The claims on the pages were rewritten to match when the scripts went in;
if they ever come out, tighten the policies and put the stronger wording back.

---

## Running it

Browsers refuse to load ES modules and service workers from `file://` URLs, so the
folder needs to be served over an origin. A small server is included that uses only
what ships with Windows:

```bash
powershell -ExecutionPolicy Bypass -File serve.ps1
```

Then open <http://localhost:8080/>. Use `-Port 3000` to pick a different port.

Any static server works just as well (`npx serve`, `python -m http.server`, nginx,
Cloudflare Pages, Netlify…). There is nothing to compile.

> **Do not open a tool's `index.html` by double-clicking it.** Browsers block ES
> modules on `file://` URLs, so `main.js` never runs. The page still renders and the
> file picker still opens — that part is plain HTML — but choosing images does nothing
> and "Create video" stays greyed out. The app detects this and shows a red banner
> explaining it, but the failure is easy to hit, so it is worth knowing about.

---

## Layout

Each tool is a self-contained folder that assumes nothing about where it is
mounted — every path in it is relative, so it works at the domain root, at
`/images-to-video/`, or nested deeper, with no configuration.

```
/                        the hub page, listing tools by category
  index.html
  site.css
  logo.svg               the site mark; also the favicon, and inlined in the pages
  icon-180.png           the same mark drawn as a PNG, for iOS home screens
  og-image.ps1           renders the share cards and that icon from logo.svg
  _headers               security headers (Cloudflare Pages / Netlify only)
  CNAME                  the custom domain, read by GitHub Pages
  .nojekyll              stops GitHub Pages running the content through Jekyll
  cloudflare/            the edge config that adds the security headers
  serve.ps1              local dev server
  images-to-video/       one tool, entirely self-contained
    index.html
    styles.css
    sw.js
    src/*.js
  exif-editor/           another, with no shared code between them
    index.html
    styles.css
    sw.js
    src/*.js
```

Tools do not share a stylesheet or a script bundle on purpose: it keeps each one
readable and auditable on its own, which is the point when the claim being made is
"read the code and see that it never uploads anything".

The service worker registers with the scope of its own folder, so each tool caches
only itself and cannot interfere with its neighbours.

---

## Adding a tool

1. Drop the tool's folder in beside `index.html`. Give it its own CSP with
   the same Google-only `connect-src` allowlist the other tools use, its own
   stylesheet, and its own service worker scoped to the folder.
2. Add one `<li>` card to the matching category in `index.html`. The markup for a
   card is spelled out in a comment right above the categories.
3. If it belongs to a category that does not exist yet, copy a whole
   `<section class="category">` block and move that name out of the "Planned" list.

   Before adding a *new* name to the Planned list, put it through
   [What can be built here](#what-can-be-built-here) first. That section is
   where the ruled-out ones, and the reasons they were ruled out, live.

Two things to hold the line on, because the whole site rests on them:

- **Nothing about a user's file is ever read out.** Not to Google, not to
  anywhere. Every byte that touches a file comes from this origin, and the
  processing happens in the visitor's own browser.
- **If a tool genuinely needs the network**, it says so on its own page, in plain
  language, and explains exactly what leaves the machine. Images to Video does this
  for its "add from a web address" feature (see below). What it must not do is
  weaken the site-wide claim quietly.

---

## Deploying

The site is one domain, `abox.tools`. It is served by **GitHub Pages** from the
`main` branch of this repository, behind **Cloudflare's proxy**.

```
visitor  ->  Cloudflare (DNS, TLS, response headers)  ->  GitHub Pages (static files)
```

### GitHub Pages

*Settings → Pages → Deploy from a branch → `main` → `/ (root)`.* The
[`CNAME`](CNAME) file at the root holds the custom domain, and `.nojekyll` stops
Pages running the content through Jekyll. There is no build step, so a push to
`main` is a deploy.

### DNS at Cloudflare

Four `A` records on the apex pointing at GitHub's Pages addresses, and a `CNAME`
for `www`. Two things about the order they are set up in:

- Add the records **DNS only** (grey cloud) first, wait for *Enforce HTTPS* to
  become available in the Pages settings, and tick it. With the proxy on from the
  start, GitHub cannot complete its certificate challenge and the site gets stuck
  on a redirect loop.
- Only then switch to **proxied** (orange cloud), with SSL/TLS set to *Full
  (strict)*.

### Response headers

**GitHub Pages cannot set response headers at all**, so [`_headers`](_headers) —
which Cloudflare Pages and Netlify would read — does nothing on this deployment.
The same headers are applied at the edge by a Cloudflare response header transform
rule, kept in [`cloudflare/response-headers.json`](cloudflare/response-headers.json)
and applied with the script beside it. See [cloudflare/README.md](cloudflare/README.md).

They are defence in depth — the `<meta>` CSP inside each page already carries the
load-bearing rules — except for `frame-ancestors`, which a `<meta>` tag cannot
express and which therefore only exists as a header.

Check what is actually being served, from anywhere, with no credentials:

```powershell
.\cloudflare\apply-headers.ps1 -VerifyOnly
```

Two configurations to keep in step: if you change `_headers`, change
`cloudflare/response-headers.json` too, or the two deployments stop agreeing.

### Canonical URLs

Every page carries a `<link rel="canonical">` pointing at its `https://abox.tools/`
address. If the site ever answers on a second hostname — a staging deployment, a
mirror, `www`, the `github.io` address — this keeps search engines treating one of
them as the original rather than splitting the ranking between duplicates.

### HTTPS

Service workers require a secure context, so offline mode activates on `https://`
or `localhost`, but not on a plain `http://` host. `.tools` is not on the HSTS
preload list, so **Always Use HTTPS** and HSTS, both under *SSL/TLS → Edge
Certificates* in Cloudflare, are worth turning on.

### The source link

Each tool page links to this repository in four places — the header button, the
privacy panel (twice), and the footer — plus once in the hub footer. "Read the code"
is the only real answer to "why should I trust this", so if the repository ever
moves, all of them move with it. A dead source link is worse than no link at all.

---

## What can be built here

The "Planned" list on the front page is not a wishlist. It was drawn up by going
through the tool list of the largest online GIF and video site — the closest
thing there is to a complete catalogue of what people actually want done to a
media file — and putting every entry through one test:

> Does all of the work happen on the visitor's own machine, with the file never
> leaving it, and does the tool still run with the network unplugged?

Note what that test does **not** ask. It does not ask whether the code is small,
or hand-written, or readable in one sitting. Those are good properties — most of
this repository has all three, and `src/mp4.js` is why the first tool needed no
dependency at all — but they are a preference, not the promise. The promise is
that your file stays on your machine. A tool that keeps that promise with thirty
megabytes of vendored WebAssembly keeps it exactly as completely as one that
keeps it with four hundred lines of hand-written muxer.

### What the browser can do on its own

Reach for this first. Where a native API does the job there is no reason to ship
an engine to do it instead, and these all stay small enough to read.

| Group | What does the work |
|---|---|
| Image resize, crop, rotate, convert, compress, filters, text | `createImageBitmap` → `<canvas>` → `canvas.toBlob`. PNG, JPEG and WebP are encoders the browser already has |
| Metadata viewer and remover | EXIF is a byte structure inside the file, so reading it is parsing and removing it is deleting bytes. Built: `/exif-editor/`. Note that it does **not** re-encode through a canvas, which was the original plan here — going through a canvas drops every tag, but it also re-compresses the picture. Rewriting the container instead leaves the image data untouched |
| PNG to ICO, images to PDF | Containers, not codecs — a header wrapped around images that are already encoded. The same trick `src/mp4.js` plays |
| SVG to PNG | An `<img>` holding an SVG draws to a canvas. Only for SVGs with no external references, which is also what keeps it offline |
| GIF: make, split, resize, reverse, retime, analyze | LZW and a color quantizer, written out the way the MP4 muxer was. Reading animated GIFs is `ImageDecoder` where it exists and a hand-written parser where it does not |
| APNG | PNG chunks, with `CompressionStream('deflate')` for the pixel data — the compressor is already in the browser |
| Video: trim, resize, crop, rotate, reverse, frame grabs, filters, subtitles | `VideoDecoder` and `VideoEncoder`, plus an MP4 *de*muxer to sit beside the muxer that already exists |
| Audio: trim, fade, speed, volume, waveform | `decodeAudioData` and `OfflineAudioContext`. WAV out is a 44-byte header in front of the samples |
| QR codes and barcodes | Arithmetic over a string. There is no input file at all |

### What needs a vendored FFmpeg

Everything below is out of reach of the browser's own APIs and in reach of an
`ffmpeg.wasm` build. It passes the test at the top of this section — the file
never leaves the machine and the tool works with the network unplugged — so it
is on the roadmap on that basis.

| Tool | Why it needs the build |
|---|---|
| HEIC to JPG or PNG | Only Safari decodes HEIC natively. FFmpeg's HEIF demuxer and HEVC decoder cover everyone else, so the iPhone-photo problem stops being Safari-only. Images to Video currently skips HEIC with a message; that message becomes a link to the converter |
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

### What is still left out

| Ruled out | Why |
|---|---|
| Background removal | A segmentation model, not a codec. FFmpeg does not do it and would not help — this needs weights and an inference runtime, which is a separate argument on a separate day |
| Camera RAW (CR2, NEF, ARW) | FFmpeg does not decode these either. It would take LibRaw or dcraw on top: a second engine, for one family of formats |
| Raster to vector (image to SVG) | A tracing algorithm, not a conversion: large, and the output disappoints everyone who expected their photo back as shapes |

---

# Images to Video

The first tool in the box. Everything below is specific to it.

---

## How the privacy claim holds up

The point of this app is that it is *checkable*, not that it is promised.

> **This changed when advertising was added.** `connect-src` used to be `'none'`,
> which made uploading impossible rather than merely absent - the browser enforced
> it, and no bug or later edit could get around it. Ad code has to reach Google, so
> that absolute form is gone. What is in the table is what is true now. Reinstating
> `connect-src 'none'` means removing the ads, and vice versa.

| Claim | How you verify it |
|---|---|
| Your images have nowhere to be uploaded **to** | `index.html` names every address this page may contact, and not one of them belongs to this site. There is no endpoint here that your files could be collected at |
| The encoder never touches the network | Read `src/encoder.js` and `src/compose.js`. Neither imports anything that can make a request |
| Nothing is sent during an export | Open DevTools, Network tab, create a video. No request carries image data |
| Google is never handed an image | Read `analytics.js` - it configures a page-visit counter and nothing else. Nothing in `src/` passes a file, thumbnail, name, or dimension to any script |
| It works with no network at all | Load once, disconnect, reload. Everything except web-address loading still works; the ads simply do not appear |

### The one exception: "Add from a web address"

This feature contacts the address you paste, and **that server sees your IP address**
and which image you asked for. It is the only outbound traffic the app can produce,
and it only ever happens for addresses you type in yourself.

It is built so that opening this door does not weaken the rest:

- It uses `<img crossorigin="anonymous">`, **not** `fetch`. Only `img-src` is opened
  up in the CSP for this; `connect-src` does not name the address you paste.
- That distinction is the whole design: images can come **in**, data cannot go **out**.
  The only `connect-src` entries are Google's ad endpoints, which the ad script alone
  talks to.
- The image is copied into a local blob the moment it arrives, so the address is never
  requested again — not for the preview, not for the export.
- `referrerPolicy="no-referrer"` means the remote server is not told where you came from.
- Every outside origin contacted is listed in the app's own privacy panel.

Verified by running a second server on another port and watching its request log: the
image request arrived, and a `sendBeacon` and `WebSocket` attempt to the same server
produced no request at all.

Note that most sites do **not** send the CORS header this requires, so many addresses
will fail. That is reported with a clear message rather than breaking later at export.
Remote images are re-encoded as JPEG (quality 0.95) when copied locally.

The privacy panel in the app reports how many resources the page has loaded and
whether any of them were third-party, read live from the Performance API.

Encoding happens in `VideoEncoder` (hardware-accelerated where available) and the
resulting file is handed straight to a download link as an in-memory `Blob`.

---

## Ordering images

Each image has a `⋮⋮` grip handle. Drag it and a glowing bar shows exactly where the
image will land — which side of a tile you are hovering decides whether it drops
before or after, so the gesture reads as "it goes *here*" rather than "it swaps with
this one". The dragged tile dims while it moves.

The `‹` `›` buttons do the same thing one step at a time and work by keyboard.
`Sort by name` uses natural ordering, so `frame2` comes before `frame10`.

## List views

Four ways to see the queue, switched from the toolbar:

| View | Shows |
|---|---|
| **Large** | Big thumbnails in a grid — the default |
| **Small** | Dense thumbnail grid, no labels, for long sequences |
| **List** | One row each: thumbnail, name, duration |
| **Details** | Adds pixel dimensions, file size, and the source host for downloaded images |

Switching views is pure CSS over identical markup, so it never rebuilds state or
disturbs the order.

## Timing: frames or seconds

Each image is held for **1 frame by default**, so the frame rate alone sets the
speed — 24 stills at 24 fps is exactly one second. That is what an image sequence
from a camera or a render usually wants.

Switch the unit next to "Hold every image for" to **seconds** for a conventional
slideshow, where each image gets a wall-clock duration independent of frame rate.
Per-image values can be overridden individually on each tile either way, and both
values are remembered when you switch units, so nothing you typed is lost.

| Unit | 24 images | at 24 fps | at 12 fps |
|---|---|---|---|
| 1 frame each | 24 frames | 1.0s | 2.0s |
| 3 seconds each | 1728 frames | 72.0s | 72.0s |

## Settings worth explaining

**Resolution → "Match highest resolution"** (the default) takes the *widest width*
and the *tallest height* found across your images, treating each axis separately.
With a 4000×3000 landscape and a 3000×4000 portrait, the output is 4000×4000, so
neither image is scaled down. Choosing a single "largest" image instead would have
shrunk the other one. Presets and a custom width/height are also available; anything
over 7680 px is scaled down proportionally, and odd numbers round to even because
H.264 requires it.

**Frame rate** offers presets from 12 to 60 fps plus a custom field accepting
1–120 fps. Values outside that range are clamped rather than rejected. Rates that
do not divide the muxer's 90000 timescale evenly (7, 48, …) are exact in practice —
measured drift is under a millisecond over a three-second video.

For a slideshow of still images, a low frame rate is usually the right call: 12 fps
looks identical to 60 fps and encodes five times faster.

## How it works

```
File  →  createImageBitmap  →  <canvas>  →  VideoFrame  →  VideoEncoder (H.264)
                                                                 ↓
                                          MP4 muxer  ←  EncodedVideoChunk
                                                ↓
                                          Blob → download
```

| File | Role |
|---|---|
| `index.html` | Markup, CSP policy |
| `styles.css` | Styling, light/dark aware |
| `src/main.js` | UI state, event wiring, export orchestration |
| `src/images.js` | Import, decode, thumbnails, ordering |
| `src/compose.js` | Canvas compositing — fit modes, output sizing |
| `src/encoder.js` | WebCodecs encode loop (primary path) |
| `src/mp4.js` | ISO-BMFF muxer, written by hand — no dependency |
| `src/recorder.js` | MediaRecorder → WebM (fallback path) |
| `src/remote.js` | Downloading images from web addresses into local blobs |
| `src/support.js` | Codec and API feature detection |
| `sw.js` | Offline cache |

### Two export paths

**MP4 via WebCodecs** — the default. Encodes faster than real time (roughly 3–5× on a
typical laptop), with exact frame timing, so "3 seconds" is exactly 3 seconds. Requires
`VideoEncoder`: Chrome and Edge 94+, Safari 16.4+, and recent Firefox.

**WebM via MediaRecorder** — the fallback, used automatically when WebCodecs is missing.
Works almost everywhere, but records in real time (a two-minute slideshow takes two
minutes) and needs the tab to stay visible, because browsers pause canvas capture in
background tabs. The app warns you if the tab was hidden mid-recording.

### About the MP4 muxer

`src/mp4.js` writes the container by hand because there is no build step to pull in a
library. It is deliberately narrow:

- one H.264 video track, no audio
- samples in presentation order, no B-frames, so no `ctts` box is needed
- all samples in a single `mdat` chunk
- `moov` written *before* `mdat` (faststart), so the file plays without seeking to the end
- 32-bit offsets, which caps output at 4 GB — the app raises a clear error past that

Adding audio, or transitions that need reordered frames, would mean extending it.

---

## Limitations

- **No audio track.** Would require extending the muxer with a second track.
- **No transitions.** Every image is a hard cut. Crossfades are possible — the compositor
  already draws to a canvas per frame — but each transition frame has to be encoded
  individually rather than reusing a static canvas.
- **Very large batches** are bounded by encode time rather than memory: full-size bitmaps
  are decoded one at a time and released immediately, so only thumbnails are held.
- **HEIC images** are not decodable by most browsers. They are skipped with a message.
- Output is capped at 4 GB, and at whatever resolution the browser's encoder will accept
  (checked at runtime via `VideoEncoder.isConfigSupported`).

---

# EXIF Viewer & Remover

The second tool. It reads the metadata inside a photo, lets you change or delete
any of it, and removes all of it in one click.

---

## What "remove" means here, and why it does not cost quality

The obvious way to strip a photo in a browser is to draw it on a canvas and call
`toBlob`. That does remove every tag — canvases carry no metadata — but it also
**decodes and re-compresses the picture**, so a JPEG comes back visibly worse and
several times the size or several times smaller, depending on the quality the
browser picked. For a tool whose whole job is "take the metadata out and change
nothing else", that is the wrong trade.

So nothing here is decoded. All three formats keep their metadata in the
container *around* the compressed picture:

| Format | Where the metadata is | What is copied untouched |
|---|---|---|
| JPEG | `APPn` segments and `COM`, all of them before the scan | everything from the `SOS` marker to the end |
| PNG | `tEXt`, `zTXt`, `iTXt`, `eXIf`, `tIME` chunks | `IDAT`, and every chunk not on that list |
| WebP | `EXIF`, `XMP `, `ICCP` chunks in a `VP8X`-headed file | the `VP8`/`VP8L` bitstream |

Removing metadata is therefore a list edit: parse the container into its parts,
drop the ones you do not want, write the list back. The result decodes to exactly
the same pixels as the original, and a stripped JPEG is byte-for-byte identical
to its source from the `SOS` marker onwards.

---

## The plan language

`src/container.js` puts one door in front of the three formats. Each of them
reports the same shape — `exif`, `xmp`, `iptc`, `icc`, `comments`, `text`,
`extras`, `notes` — and accepts the same kind of instruction, called a *plan*:

- a key **left out** means leave that block alone,
- **`null`** means remove it,
- **anything else** replaces it.

"Remove everything" is one object literal. The three container modules
(`src/jpeg.js`, `src/png.js`, `src/webp.js`) know nothing about each other and
nothing about EXIF; `src/tiff.js` knows nothing about any of them.

---

## Reading and writing EXIF

EXIF is a whole TIFF file embedded in the photo: a byte-order mark, then
directories of 12-byte entries, with any value longer than four bytes stored as
an offset to somewhere else in the block. That indirection is why writing has to
be a rebuild rather than a patch — change the length of one string and every
offset after it moves.

The rule `src/tiff.js` is built on: **a tag nobody edited is written back byte
for byte from the bytes it was read as.** Only edited tags are re-encoded. Values
this tool does not understand — and there are always some — survive exactly as
the camera wrote them.

A few details that are easy to get wrong and are handled deliberately:

- **Sub-directory pointers and the thumbnail's location are never copied.** They
  are offsets into the old block, so they are dropped on read and recomputed on
  write. Keeping them would be keeping a lie.
- **The `XP*` tags hold UTF-16**, declared as a plain byte array. Trimming their
  terminating NUL byte by byte eats half of the last character, so whole code
  units are trimmed instead.
- **`UserComment` has an eight-byte character-set header.** Anything that ignores
  it prints the header, which is where the stray "ASCII" in front of so many
  comments comes from.
- **A malformed file cannot hang the page.** Visited directory offsets are
  remembered, so a photo whose IFDs point at each other in a loop is read once
  and stopped.

---

## What is kept, and why it is said out loud

"Remove all" that quietly keeps things is a broken promise, so the two things
kept by default are named on the button's own line, and the sentence under the
checkboxes changes with them.

- **The orientation tag**, because phones store a photo the way the sensor saw it
  and add one tag saying which way up it goes. Remove it and some viewers show
  the photo sideways. When this is kept, a *new* EXIF block is written holding
  that one tag and nothing else — the original block is still thrown away whole,
  so nothing this tool failed to parse can survive inside it. A photo that was
  already the right way up gets no EXIF block at all.
- **The colour profile**, because it says nothing about you and dropping it can
  visibly shift the colours of a wide-gamut photo.

Both can be turned off, and the summary line then says the file will carry no
metadata of any kind.

Two blocks are kept unconditionally and reported as kept rather than silently:
the JFIF header, and the Adobe `APP14` colour marker — removing the latter turns
some CMYK and YCCK JPEGs inside out.

---

## Limitations

- **Maker notes may not survive an edit.** A maker note is undocumented
  manufacturer data that often contains offsets into the original EXIF block.
  Rewriting the block moves it, so the manufacturer's own software may no longer
  read it. Removing everything is unaffected — this only applies to saving edits.
  The page says so, in those words.
- **HEIC, AVIF and bare TIFF are recognised and refused**, each with its own
  reason rather than a generic "unsupported". HEIC and AVIF are box formats of
  nested atoms and need a different parser; in a TIFF the metadata and the pixels
  are addressed by the same offsets, which makes it a different job.
- **A JPEG segment holds 65,533 bytes.** Writing back an EXIF block larger than
  that fails with a message naming the thumbnail and the maker note, which are
  what makes a block that big.
- **PNG text chunks are edited as a set**, because that is how the plan expresses
  them. If a compressed one will not unpack, the set is shown read-only rather
  than offering an edit that would quietly drop it. It can still be removed.
- **Writing extended XMP is not supported.** XMP too large for one segment is
  read (both halves are shown) but only ever removed, never rewritten.
- **Everything is held in memory.** A folder of large photos is bounded by the
  machine, as with the other tool.

---

## Testing it

There is no test runner in this repository and no build step, so the checks that
were used while writing this are not checked in. What they covered, if it needs
doing again: a JPEG and a PNG built by hand with known tag values, asserting the
parsed values match; the EXIF block round-tripping through
`serializeExif` → `parseExif` unchanged; stripped output still decoding, and its
JPEG scan being byte-identical to the original's; a WebP produced by
`canvas.toBlob`, given an EXIF block, read back, and decoded again.
