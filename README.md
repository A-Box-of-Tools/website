# Images to Video

A static web app that turns a sequence of images into a video **entirely in the browser**.
No server, no upload, no dependencies, no build step.

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
GitHub Pages, Netlify…). There is nothing to compile.

> **Do not open `index.html` by double-clicking it.** Browsers block ES modules on
> `file://` URLs, so `main.js` never runs. The page still renders and the file
> picker still opens — that part is plain HTML — but choosing images does nothing
> and "Create video" stays greyed out. The app detects this and shows a red banner
> explaining it, but the failure is easy to hit, so it is worth knowing about.

---

## How the privacy claim holds up

The point of this app is that it is *checkable*, not that it is promised.

| Claim | How you verify it |
|---|---|
| Your images can never be uploaded | `index.html` sets `connect-src 'none'`, which disables `fetch`, `XHR`, `WebSocket` and `sendBeacon`. This is enforced by the browser, not by the code |
| Nothing is sent during an export | Open DevTools → Network, create a video, watch it stay empty |
| No third-party code | Every script and style is served from this origin. No CDN, no fonts, no analytics |
| It works with no network at all | Load once, disconnect, reload. Everything except web-address loading still works |

### The one exception: "Add from a web address"

This feature contacts the address you paste, and **that server sees your IP address**
and which image you asked for. It is the only outbound traffic the app can produce,
and it only ever happens for addresses you type in yourself.

It is built so that opening this door does not weaken the rest:

- It uses `<img crossorigin="anonymous">`, **not** `fetch`. Only `img-src` is opened
  up in the CSP; `connect-src` stays `'none'`.
- That distinction is the whole design: images can come **in**, data cannot go **out**.
  There is no API left that could carry your files anywhere.
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

## Deploying

Copy the folder to any static host. Two things worth setting if your host allows
response headers — they are defence in depth, since the meta-tag CSP already covers
the important part:

```
Content-Security-Policy: frame-ancestors 'none'
Referrer-Policy: no-referrer
```

`frame-ancestors` cannot be set from a `<meta>` tag, which is why it is a header-only
concern.

Service workers require a secure context, so offline mode activates on `https://` or
`localhost`, but not on a plain `http://` host.

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
