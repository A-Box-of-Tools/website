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
| Image Compressor | `/compress-image/` | Compresses an image to a file size you name, spending as little quality as the target allows |

The hub page lists them by category. It, and every tool page, is generated —
see [Layout](#layout).

Every page loads Google's ad and measurement scripts, which is why the
Content-Security-Policy in each page names Google origins rather than being the
flat `default-src 'none'` it started as. Neither script is given anything about
a user's files: no file, thumbnail, filename, size, or count is read out to
them, and there is no custom event anywhere in this repository that would carry
one. The claims on the pages were rewritten to match when the scripts went in;
if they ever come out, tighten the policies and put the stronger wording back.

---

## Running it

The site is generated. The pages a browser is served are built from
`templates/`, `config/` and `tools/` by `build.py`, into `dist/`:

```bash
python build.py
```

Python 3.11 or newer, and nothing to install: the build uses only the standard
library. There is no `package.json`, no lockfile, and no third-party code
anywhere between these sources and the site.

To build and serve in one step:

```bash
powershell -ExecutionPolicy Bypass -File serve.ps1
```

Then open <http://localhost:8080/>. `-Port 3000` picks a different port, and
`-NoBuild` serves `dist/` as it stands. Any static server works just as well
once the build has run (`npx serve dist`, `python -m http.server -d dist`,
nginx, Cloudflare Pages, Netlify…).

To check that the deployed site really is a build of these sources:

```bash
python build.py --check
```

That builds, then compares the result file by file with the `dist` branch —
the branch GitHub Pages serves. If they differ, the deployed site is not what
this repository says it is, and that is worth knowing.

> **Do not open a page's `index.html` by double-clicking it.** Browsers block ES
> modules on `file://` URLs, so `main.js` never runs. The page still renders and the
> file picker still opens — that part is plain HTML — but choosing images does nothing.
> The app detects this and shows a red banner explaining it, but the failure is easy
> to hit, so it is worth knowing about.

---

## Layout

There are two halves: the sources, which are what you edit, and `dist/`, which
is what a browser gets. Nothing in `dist/` is ever edited by hand — every file
in it carries a "GENERATED FILE" banner saying which sources it came from.

```
build.py                 the generator; run it to produce dist/
buildlib/
  template.py            an eighty-line template engine, so this has no dependencies
  site.py                config loading, the CSP, the structured data, the checks
config/
  site.toml              everything true of every page: the CSP, the ids, the hub
  planned.toml           the "Planned" list on the hub page
templates/
  hub.html               the hub page
  tool.html              the frame every tool page wears
  sw.js                  the offline service worker
  analytics.js           the Google Analytics bootstrap
  sitemap.xml
  partials/              the pieces shared between hub and tool pages
shared/
  css/
    tool-frame.css       the stylesheet every tool page starts from
    file-list.css        an optional part, for tools that show a list of files
  site.css               the hub's own stylesheet
  logo.svg               the site mark; also the favicon, and inlined in the pages
  icon-180.png           the same mark as a PNG, for iOS home screens
  og.png                 the hub's share card
  CNAME .nojekyll        read by GitHub Pages
  _headers robots.txt ads.txt
tools/
  compress-image/
    tool.toml            everything particular to this tool: prose, FAQ, metadata
    body.html            the <main> of the page - the interface, and only that
    styles.css           the rules only this tool needs
    src/*.js             the app itself, copied into dist/ byte for byte
    og.png               its share card
  exif-editor/           the same five things
  images-to-video/       and again
og-image.ps1             draws the share cards and the icon from shared/logo.svg
serve.ps1                builds, then serves dist/ locally
cloudflare/              the edge config that adds the security headers
```

Each generated tool folder is still entirely self-contained and still assumes
nothing about where it is mounted: every path in it is relative, so it works at
the domain root, at `/compress-image/`, or nested deeper, with no configuration.
The service worker registers with the scope of its own folder, so each tool
caches only itself and cannot interfere with its neighbours.

**The JavaScript is not touched.** `src/*.js` is copied byte for byte — no
bundler, no minifier, no transpiler — so the code a visitor's browser runs is
still, character for character, the code in this repository. The build only ever
assembles HTML, CSS, and the two small generated JS files (`sw.js`,
`analytics.js`), and it never reaches the network.

### What the build stopped anyone having to remember

The three tool pages used to be written out by hand, and the frame around them
was the same on all three give or take a noun. Keeping them in step was a manual
job, and this repository was full of comments admitting it. Each of those is now
something the build does, and cannot forget to do:

| Used to say | Now |
|---|---|
| "Keep this list in step with the other pages" (the CSP, in four files) | One list in `config/site.toml`, copied to every page. A tool can widen its own policy in its `[csp]` table, and never narrow it or reach another page. |
| "EDIT BOTH OR NEITHER" (the FAQ, written once as HTML and again as JSON-LD) | One set of `[[faq]]` entries per tool. The visible questions and the `FAQPage` structured data are both derived from them. |
| "Bump `CACHE_NAME` whenever any listed file changes" | The service worker's asset list is read off the disk, and its cache name is a hash of those files, so it changes exactly when they do. |
| "Add one `<li>` card to the matching category, and an entry to `sitemap.xml`" | The hub's cards, its `ItemList` structured data and `sitemap.xml` all come from the tools that exist in `tools/`. |
| Four copies of the repository URL per page | `source_url` in `config/site.toml`. |

The build refuses to produce a site rather than produce a broken one. A missing
config key, a tool whose folder and `slug` disagree, a tool listed on the hub
that does not exist, and a tool that exists but is on no category list — so
nothing would link to it — are all errors, not warnings.

---

## Adding a tool

1. Make `tools/<slug>/` with five things: `tool.toml`, `body.html` (the `<main>`
   of the page, and only that), `styles.css` (the rules only this tool needs),
   `src/*.js` including a `main.js`, and `og.png`. Copying the nearest existing
   tool and editing it is the fastest way in — `tool.toml` is commented
   throughout, and every key in it is required, so nothing can be silently
   forgotten.
2. Add the slug to the `order` of the matching `[[hub.categories]]` in
   `config/site.toml`, and set the same category id in the tool's `category`.
   The card on the hub, the sitemap entry and the structured data follow from
   that; there is no second place to remember.
3. Run `python build.py`. If the tool is missing something, the build says so
   and writes nothing.
4. If it belongs to a category that does not exist yet, add a
   `[[hub.categories]]` table and move that name out of `config/planned.toml`.

   Before adding a *new* name to the planned list, put it through
   [What can be built here](#what-can-be-built-here) first. That section is
   where the ruled-out ones, and the reasons they were ruled out, live.

The frame — the header, the pledge, the live network check, the privacy panel,
the FAQ layout, the footer, the Content-Security-Policy, the service worker,
the analytics bootstrap — you get for free and should not reimplement. What a
tool writes for itself is its interface (`body.html`), its own rules
(`styles.css`), its own code (`src/`), and its own words (`tool.toml`).

A tool that needs a stylesheet part more than one tool wants, but that no tool
should own, puts it in `shared/css/` and names it in `css_parts`. The file-list
widget — drop a file, see a row — works that way.

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
`dist` branch of this repository, behind **Cloudflare's proxy**.

```
push to main  ->  GitHub Action runs build.py  ->  dist branch

visitor  ->  Cloudflare (DNS, TLS, response headers)  ->  GitHub Pages (dist branch)
```

`main` holds the sources. `dist` holds the built site, and nothing else: it is
written only by [the Build workflow](.github/workflows/build.yml), never by
hand. A pull request builds without publishing, so a change that breaks the
build is caught before it can reach `main`.

To see what would be deployed before pushing, run `python build.py` and look at
`dist/`. To check that what *is* deployed matches these sources, run
`python build.py --check`, which diffs a fresh build against the `dist` branch.

### GitHub Pages

*Settings → Pages → Deploy from a branch → `dist` → `/ (root)`.* The
`CNAME` file, which lives in [`shared/`](shared/) and is copied into every
build, holds the custom domain; `.nojekyll` beside it stops Pages running the
content through Jekyll.

**If you are moving this from the old setup**, the Pages source has to be
changed from `main` to `dist` by hand, once. Until it is, the workflow will
publish to `dist` and Pages will keep serving `main`, which no longer contains
an `index.html` — so the site would 404. Change the branch first, or in the
same sitting.

### Why the built site is committed

Pages could build this itself, and most static sites let it. Committing the
output instead buys one specific thing: a reader can run `python build.py` on
their own machine and diff the result against the branch that is actually being
served. A site whose entire pitch is "check this rather than believe it" should
not ask anyone to take the deployment on trust either.

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

**GitHub Pages cannot set response headers at all**, so
[`_headers`](shared/_headers) —
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
is the only real answer to "why should I trust this", so a dead source link is
worse than no link at all. All five come from `source_url` in
[`config/site.toml`](config/site.toml), so moving the repository is one edit.

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
| Image resize, crop, rotate, convert, compress, filters, text | `createImageBitmap` → `<canvas>` → `canvas.toBlob`. PNG, JPEG and WebP are encoders the browser already has. Compression is built: `/compress-image/`, where the interesting part turned out to be not the encoding but the search that decides what quality to ask for |
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
| Your images have nowhere to be uploaded **to** | The page names every address it may contact, from the one list in `config/site.toml`, and not one of them belongs to this site. There is no endpoint here that your files could be collected at |
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
| `tool.toml` | The page's words, metadata and FAQ; the page itself is generated from them |
| `body.html` | The `<main>` of the page — the interface, and only that |
| `styles.css` | The rules only this tool needs, appended to the shared frame |
| `src/main.js` | UI state, event wiring, export orchestration |
| `src/images.js` | Import, decode, thumbnails, ordering |
| `src/compose.js` | Canvas compositing — fit modes, output sizing |
| `src/encoder.js` | WebCodecs encode loop (primary path) |
| `src/mp4.js` | ISO-BMFF muxer, written by hand — no dependency |
| `src/recorder.js` | MediaRecorder → WebM (fallback path) |
| `src/remote.js` | Downloading images from web addresses into local blobs |
| `src/support.js` | Codec and API feature detection |

`index.html`, `sw.js` and `analytics.js` are generated; the CSP comes from
`config/site.toml`, and the frame from `templates/tool.html`.

### Two export paths

**MP4 via WebCodecs** — the default. Encodes faster than real time (roughly 3–5× on a
typical laptop), with exact frame timing, so "3 seconds" is exactly 3 seconds. Requires
`VideoEncoder`: Chrome and Edge 94+, Safari 16.4+, and recent Firefox.

**WebM via MediaRecorder** — the fallback, used automatically when WebCodecs is missing.
Works almost everywhere, but records in real time (a two-minute slideshow takes two
minutes) and needs the tab to stay visible, because browsers pause canvas capture in
background tabs. The app warns you if the tab was hidden mid-recording.

### About the MP4 muxer

`src/mp4.js` writes the container by hand because there is no bundler to pull in a
library — the build assembles pages, and never touches `src/`. It is deliberately narrow:

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

There is no test runner in this repository, so the checks that
were used while writing this are not checked in. What they covered, if it needs
doing again: a JPEG and a PNG built by hand with known tag values, asserting the
parsed values match; the EXIF block round-tripping through
`serializeExif` → `parseExif` unchanged; stripped output still decoding, and its
JPEG scan being byte-identical to the original's; a WebP produced by
`canvas.toBlob`, given an EXIF block, read back, and decoded again.

---

# Image Compressor

The third tool. You give it a file size; it gives you the best-looking image
that fits in it.

---

## Why a target size rather than a quality slider

Every other compressor hands you a quality dial and leaves you to guess. That is
backwards, because nobody arrives wanting "quality 62". They arrive because an
upload form said 500 KB, or an email bounced, or a page is loading too slowly,
and they want the best picture that clears that number.

So the target is the input, and the quality is what gets searched for. There is
no formula that turns a quality setting into a byte count — it depends entirely
on the picture — so the search is empirical: encode, look at the size, adjust,
encode again. Every figure the page shows is a real encoded file rather than an
estimate, which is only affordable because the encoding is happening on the
visitor's own machine and costs this project nothing.

---

## The search

`src/compress.js`. Four rules, in order, and the order is the whole argument:

1. **A file already under the target is passed through byte for byte.** Not
   re-saved, not "optimised". The best possible version of a file that already
   fits is that file, and it is the only result on the page that keeps its
   metadata.
2. **Quality is spent first, down to a floor.** Full resolution is kept and the
   dial is bisected between `QUALITY_FLOOR` (0.62) and `QUALITY_CEILING` (0.94)
   for the highest setting that fits. Six halvings land within half a percent of
   the dial, which is finer than the encoder itself distinguishes.
3. **Resolution is spent second.** Below the floor, quality stops being cheap —
   blocking and smeared edges are what people mean by "compressed" — so the
   picture is made smaller and the dial goes back up to 0.8. The opening guess
   for the scale is `sqrt(target / bytesAtThatQuality)`, because encoded size
   tracks pixel count closely enough to guess from; that lands within a few
   percent and the four halvings after it only tidy up. Bisecting blindly would
   cost about twice as many encodes.
4. **The leftover budget is then spent.** Once something fits, quality is pushed
   back up at that size until the budget is used. A result at 60% of the target
   is not a win, it is detail thrown away for nothing.

A whole search is capped at `MAX_ENCODES` (16) and a typical one takes eight.

Two paths fall outside the four rules:

- **Resizing turned off** and the floor still not enough: the search keeps going
  down to `QUALITY_HARD_MIN` (0.2), because the visitor asked for a size. If even
  that misses, the row says so in plain words rather than pretending.
- **PNG output** has no quality dial at all — it is lossless, which is the whole
  reason somebody picks it — so only the scale search runs.

---

## What "auto" does about formats

Keeping the format is the default, because a file that arrives as a `.jpg` and
leaves as a `.jpg` is what people expect, and a surprise `.webp` is a support
question for whoever they send it to.

So "auto" only reaches for another format when keeping this one actually cost
something: a resize, a quality at or below the floor, or a target that was
missed. In that case the same search is run again in WebP, both results are
**measured**, and the better-looking one wins — with the original format keeping
any tie. When the extension changes, the row says why.

---

## Measuring what it cost

`src/measure.js`. Tools of this kind all claim "minimal quality loss" and almost
none of them says how much, because saying how much means decoding the result
and comparing it against the original — work a server-side compressor would be
paying for. Here it is nearly free, so both figures are shown:

- **SSIM**, on Rec. 601 luma, over 8×8 non-overlapping windows. Not the sliding
  11×11 Gaussian of the paper: an eighth of the arithmetic, and the average over
  a whole picture lands within a couple of thousandths of the same answer.
- **PSNR**, in decibels. A poor model of the eye, but it is the number people
  expect, and it stays honest about heavy compression where SSIM is generous.

Two decisions worth keeping:

- **Both pictures are drawn at the same size, in the original's shape**, capped
  at 1280 on the long side. A result that fitted by becoming half as wide is
  stretched back up before it is judged, because that is the cost the eye
  actually pays. Comparing it against a shrunk original would hide exactly what
  this figure exists to show.
- **The cap is a trade, and it goes one way.** The smaller it is, the kinder the
  numbers, because shrinking a picture smooths out the blocking that compression
  added. 1280 keeps artefacts visible while holding the work to about a
  megapixel, which stays quick on a phone even when a 40-megapixel photo went in.

---

## Limitations

- **Metadata does not survive.** Compressing means decoding to pixels and
  encoding those pixels again, and a canvas carries no tags, so EXIF, GPS, XMP
  and the rest are simply not written to the new file. Usually a bonus, and said
  on the page either way — with a link to `/exif-editor/` for anyone who wants
  the metadata gone but the picture untouched.
- **Only what the browser can write.** JPEG, PNG and WebP. WebP is checked at
  runtime by encoding one pixel and looking at the type that comes back, because
  `toBlob` handed a type it cannot write returns a PNG rather than failing. If it
  is missing, the option is disabled with a reason.
- **AVIF and JPEG XL are read but not written**, for the same reason: no browser
  ships an encoder for them that `toBlob` will reach. That is on the FFmpeg list
  in [What can be built here](#what-needs-a-vendored-ffmpeg).
- **A tight target on a large photo takes a few seconds.** Eight to twenty-two
  encodes of a 12-megapixel image is real work, and it is happening on the
  visitor's laptop rather than someone's server. The progress line names the file
  and the phase so the wait is legible.
- **Animated GIFs and animated WebP lose the animation**, because a canvas holds
  one frame. The first frame is what comes out.
- **Everything is held in memory**, as with the other tools. Decoded bitmaps are
  released as soon as each image is finished, so only the thumbnails and the
  results stay alive.

---

## Testing it

There is no test runner in this repository, so the checks used while writing
this are not checked in. What they covered, if it needs doing again: images
generated on a canvas and fed to the file input through a `DataTransfer`, run
against targets that fit at full quality, targets that need the quality search,
targets that force a resize, and targets no setting can reach; a file already
under the target coming back as the identical `File` object; PNG output reaching
a target by resizing alone; `compare()` returning SSIM 1 and an infinite PSNR for
a picture against itself, and dropping to ~0.83 at quality 0.05; and the zip
carrying a valid local-file header.
