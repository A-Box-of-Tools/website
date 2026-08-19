# A Box of Tools

The source for **[abox.tools](https://abox.tools/)** — a small collection of
single-purpose web tools that do all of their work **in the browser**. No server,
no upload, no account, no dependencies, no build step.

The selling proposition is not "we promise not to look at your files", it is
"there is no code path that could send them anywhere, and you can check that
yourself in a minute". Everything below is written to keep that true.

---

## The tools

| Tool | Lives at | What it does |
|---|---|---|
| Images to Video | `/images-to-video/` | Turns a sequence of images into an MP4, encoded locally |

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
  og-image.ps1           redraws the share cards and that icon
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
