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
| Video Cropper | `/crop-video/` | Cuts a clip down to a rectangle, keeping its timing and its sound |

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
library. There is no `package.json` and no lockfile. The one exception is
`--mangle`, which renames identifiers and needs esbuild; it is what CI runs and
what gets deployed, and it is described under
[What the build does to the output](#what-the-build-does-to-the-output). The
command above is not that, and never needs it.

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

`--check` implies `--mangle`, so it needs esbuild at the pinned version: the
deployed branch is mangled, and comparing against it any other way would report
a difference on every file and mean nothing. The build says which version to
install if it is missing.

The output is minified, so it is not pleasant reading, but it is still
*checkable*: the build is deterministic, so the same sources produce the same
bytes on any machine, and that is what makes the comparison above mean
something. Every generated file also keeps one banner comment naming the
repository and this command. To read the output instead of verifying it:

```bash
python build.py --no-minify
```

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
  page.html              the frame a prose page wears - the legal ones
  sw.js                  the offline service worker
  analytics.js           the Google Analytics bootstrap
  sitemap.xml
  partials/              the pieces shared between all three, incl. the footer
shared/
  css/
    tool-frame.css       the stylesheet every tool page starts from
    file-list.css        an optional part, for tools that show a list of files
  site.css               the stylesheet for the hub and the legal pages
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
    src/*.js             the app itself; minified into dist/, renamed only by --mangle
    og.png               its share card
  crop-video/            the same five things
  exif-editor/           and again
  images-to-video/       and again
pages/
  privacy/
    page.toml            title, description, dates - the frame, not the prose
    body.html            the <main> of the page
  terms/                 the same two things
og-image.ps1             draws the share cards and the icon from shared/logo.svg
serve.ps1                builds, then serves dist/ locally
cloudflare/              the edge config that adds the security headers
```

Each generated tool folder is still entirely self-contained and still assumes
nothing about where it is mounted: every path in it is relative, so it works at
the domain root, at `/compress-image/`, or nested deeper, with no configuration.
The service worker registers with the scope of its own folder, so each tool
caches only itself and cannot interfere with its neighbours.

### What the build does to the output

There are two builds, and the difference between them is the point.

| | `python build.py` | `python build.py --mangle` |
|---|---|---|
| Needs | Python 3.11+, nothing else | …and esbuild, at the pinned version |
| HTML | comments and whitespace out | same |
| CSS | comments and whitespace out | same |
| JavaScript | comments and whitespace out, **nothing renamed** | renamed as well |
| Used by | anyone, anywhere | CI, and so the deployed site |

The plain build is the default and stays the default. It produces a working,
readable site with nothing installed, which is what makes the claims on these
pages checkable by someone who has not already agreed to trust a toolchain.

**Sizes.** HTML 28% smaller, CSS 39%, JavaScript 40% before renaming — about
36% off the text weight of the site. Renaming takes more off on top of that.

**Nothing is reordered, merged or rewritten.** No shorthand is collapsed, no
colour re-spelled, no rule moved. Those are the transformations that make a
minifier impressive and also the ones that occasionally change a page.

#### How it avoids breaking things

`buildlib/minify.py` (HTML and JavaScript) and `buildlib/cssmin.py` check their
own work, and the build fails rather than write something it is unsure of:

- **Line breaks never move in JavaScript.** The language inserts semicolons at
  line breaks, so a minifier that joins lines has to know where a statement
  ends — which means parsing. Every newline stays where it was: about a byte per
  line, in exchange for certainty.
- **The JavaScript must re-tokenise to the same tokens**, in order, with a break
  between the same pairs of them. A dropped space that turned `a in b` into
  `ainb`, or `x + +y` into `x++y`, changes that stream and stops the build.
- **CSS whitespace collapses, it does not vanish.** A space between two
  selectors is the descendant combinator, and a space between two values is what
  separates them. A custom property's value is copied across untouched, because
  it is an unparsed token stream where `--op: +` is a real thing people write.
- **HTML whitespace collapses to one space** rather than being removed, because
  between two inline elements it is the space between two words. `pre`,
  `textarea`, `script` and `style` are copied through whole.

The CSS is also checked against a real CSS parser rather than against this
repository's own idea of the answer: load the minified and the readable sheet
into a browser, and every rule and every custom property comes back the same.

#### Renaming, and what it costs

`--mangle` hands each module to **esbuild**, which has the parser and the scope
analysis that renaming safely requires — a name is only safe to change once you
know every place it is bound and every place it is read. That is not something
to hand-roll: guessing at it is how a build silently corrupts a hand-written
EXIF parser, and the failure would not show up until somebody's photo came out
wrong. Exported names are never renamed, so the module graph is untouched;
nothing is bundled, so every module keeps its own file.

The cost is real and worth stating. It is the only step in this repository that
needs something installed, and it is why the plain build still exists.

The version is **pinned in `config/site.toml` and verified**, not merely
requested. Two versions of esbuild need not invent the same names, and if the
checker and the deploy disagree then `--check` reports tampering where there was
none — worse than having no checker. The build refuses to run against any other
version, and says which one to install.

```bash
npm install --global esbuild@0.25.0
```

#### Which command to run

```bash
python build.py              # readable, no dependencies, the default
python build.py --no-minify  # readable and unminified, for debugging
python build.py --mangle     # what CI builds and what is deployed
python build.py --check      # implies --mangle: it compares against the deploy
```

Whichever way it runs, the build never reaches the network.

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
| A cache name to bump by hand when minification changed the bytes | The cache name hashes the files **as emitted**, so turning minifying on or off invalidates the cache by itself. |
| Nothing at all, which is how a stylesheet change reached returning visitors four hours late | Every page asks for its stylesheet by a URL carrying a hash of that stylesheet, so changing the CSS changes the URL and there is no stale copy to serve. |
| Three different footers, none of which linked to a privacy policy because there was nowhere to put one | One `templates/partials/footer.html`. Its tool list and legal-page list come from `tools/` and `pages/`, and the only thing that differs per page is whether links start `./` or `../`. |

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

   You do **not** have to touch the footer, the sitemap, or the other pages. The
   footer's tool list is derived from `tools/` in the order the hub shows them,
   so a new tool appears in the footer of every page - hub, tool and legal - as
   soon as it exists.

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

## The legal pages

`pages/` holds the prose pages that are neither the hub nor a tool: Privacy and
Terms. One is built exactly like a tool page, minus everything a tool needs and
a page does not.

```
pages/privacy/
  page.toml    slug, nav label, title, description, dates, share-card text
  body.html    the <main> - sections of prose and nothing else
```

`nav` is the label the footer uses. The page gets the site frame, the site's
Content-Security-Policy unchanged, an entry in `sitemap.xml` at a low priority,
and a link in the footer of every page on the site. It gets no service worker,
because there is nothing here worth keeping offline, and no `blob:` in
`img-src`, because it never makes one.

**These pages get the same CSP as everywhere else, and that is the point.**
Written by hand, they carried a narrowed copy that left out the donate button's
two origins, on the reasoning that a page which never draws the button should
not name them. That is a defensible argument and it is also exactly the kind of
argument that produces four policies which disagree. One list in one file ends
it. If the difference ever matters enough to want back, it belongs in
`config/site.toml` as a `[page_csp]` table the way `[tool_csp]` already works —
not as a hand-edit.

### What is in them, and what is not

The Privacy page describes what actually happens rather than what would be
reassuring: files never leave the browser, with the CSP offered as proof, and
then every third party named in turn — AdSense, Analytics, the donate button's
CDN, Google Fonts, and the hosting — each with the way to switch it off, and the
line that makes those safe to take: every tool still works with all of it
blocked and the network unplugged.

Two things it does **not** claim, deliberately:

- **There is no cookie consent banner.** The page is honest about the cookies
  and links to Google's opt-outs, which is not the same thing as consent. If
  this site takes meaningful EU or UK traffic, AdSense's own policy expects a
  consent management platform, and that is a real piece of work rather than a
  paragraph.
- **The governing-law clause names Canada but not a province.** It says "the
  laws of Canada and of the province in which the site is operated". Naming the
  province outright is one line in `pages/terms/body.html` and makes the clause
  easier to rely on; it was left open rather than guessed at.

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

### Cache lifetimes, and why the stylesheet URLs carry a hash

GitHub Pages sets its own `Cache-Control`, and it does not set the same one for
everything:

| Served as | `max-age` |
|---|---|
| HTML | 600 (ten minutes) |
| CSS, JS, images | 14400 (four hours) |

Those two numbers disagreeing is a deploy hazard rather than a detail. A visitor
who has been here before gets the new markup within ten minutes and keeps the
old stylesheet for up to four hours, so any deploy that changes both arrives as
a page wearing the wrong CSS. That is not hypothetical: it is exactly how the
new footer first reached the live site, as an unstyled column with the site mark
blown up to the full width of the page, while the deployed files were correct
the whole time.

So the build gives every stylesheet URL a hash of its own contents:

```
<link rel="stylesheet" href="site.css?v=cff5cc1753">      the hub, the legal pages
<link rel="stylesheet" href="styles.css?v=1167009c82">    one per tool
```

Change the CSS and the URL changes with it, so there is no stale copy to hand
back. Leave it alone and the URL is identical, so the four-hour cache keeps
doing its job. Nothing has to be purged by hand at Cloudflare.

**A tool's service worker must precache the versioned URL, not the bare one.**
It matches on the whole request, query string included, so a worker that cached
`styles.css` while the page asked for `styles.css?v=...` would leave the tool
styled online and bare offline. `build.py` passes the same string to both, which
is the only reason they cannot drift.

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
| Video: trim, resize, crop, rotate, reverse, frame grabs, filters, subtitles | `VideoDecoder` and `VideoEncoder`, plus an MP4 *de*muxer to sit beside the muxer that already exists. Cropping is built: `/crop-video/`, where the demuxer turned out to be the whole job and the crop itself is six lines of canvas |
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
library — the build assembles pages and minifies them, and never adds code that
was not written here. It is deliberately narrow:

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

---

# Video Cropper

The fourth tool. It cuts a clip down to a rectangle you drag over it, keeps the
timing and the sound, and never uploads a byte of it.

---

## Two paths, and why there are two

A cropper is only as useful as the list of files it will accept, and there is no
single browser API that both opens everything and does the job properly. So
there are two paths, and the tool picks the better one it can use for the file
in front of it.

| | **Exact** | **Recording** |
|---|---|---|
| Accepts | MP4, M4V, MOV, in any codec `VideoDecoder` will open | anything the browser will *play* |
| How | demux → `VideoDecoder` → crop on a canvas → `VideoEncoder` → MP4 | play it, draw each frame cropped, `MediaRecorder` the canvas |
| Speed | as fast as the machine goes | real time; a four-minute clip takes four minutes |
| Timing | the original frame times, to the tick, variable frame rates included | approximate; driven by playback |
| Sound | copied across sample by sample, never decoded | captured from playback and re-encoded |
| Out | MP4 (H.264) | WebM, or MP4 on Safari |

The exact path is the one to want, and the recording path is why the tool has no
"unsupported format" dead end for anything the browser itself can open. The page
says which one it is using and why, in those words, rather than quietly being
five times slower on some files than others.

**The fallback is chosen by the reader failing, not by the extension.** Every
file goes to `src/demux.js` first; if it comes back with an `UnsupportedFile`,
the reason on it is what the page prints — "this is not an MP4 or MOV file",
"the video track is encrypted", "this browser will not decode
`hvc1.2.4.L120.B0` directly". A tool that says *which* thing it could not do is
worth a good deal more than one that says "unsupported file".

## What "most formats" actually means

| Container | What happens |
|---|---|
| MP4, M4V, MOV | read directly, both layouts — the plain one and the fragmented one a browser's own recorder writes |
| WebM | played and recorded, because there is no Matroska reader here |
| MKV, AVI, WMV, FLV | only if the browser plays them, which mostly it does not. Refused with a message |

Inside an MP4 the codec matters more than the container:

| Codec | Read by |
|---|---|
| H.264 (`avc1`, `avc3`) | everywhere WebCodecs exists |
| HEVC (`hvc1`, `hev1`) | wherever the machine's own decoder will take it — which is what makes iPhone footage work without Safari |
| AV1 (`av01`), VP9 (`vp09`) | recent Chrome, Edge and Firefox |

Output is always H.264 in an MP4, or VP9/VP8 in a WebM on the recording path.
Those are what plays everywhere, and this tool changes the shape of a video
rather than its format — converting is a different job and will be a different
tool.

## The reader

`src/demux.js` walks an ISO base media file and hands back a flat list of
samples: where each one is in the file, how big it is, when it is shown, and
whether it is a keyframe. Written by hand, like the muxer it sits beside,
because the build assembles pages and never touches `src/`.

Three things in it are worth knowing:

- **It reads both layouts.** A plain MP4 keeps one table at the front saying
  where every sample is. A fragmented one — what `MediaRecorder`, and a great
  deal of camera and streaming software, writes — keeps a small table in front
  of each fragment instead, with the defaults in `trex` back in the header.
  Supporting only the first would have sent a large share of ordinary files down
  the slow path, and the second is about a hundred lines.
- **The file is never read into memory whole.** `FileWindow` reads a few
  megabytes around whatever sample is being asked for, and the samples are asked
  for in file order, so a two-gigabyte clip costs one window at a time. This is
  the one kind of file on this site that would not have fitted otherwise.
- **A file it cannot read is a fallback, not a failure.** Every refusal carries a
  reason in plain words, and the app prints it.

## The audio survives, exactly

Cropping does not change how long a clip is or when anything in it happens, so
the sound that arrived can be written straight back out. On the exact path the
audio samples are copied across untouched, and so is the `stsd` sample entry
that describes them — read out of the source file as bytes, written back as
bytes. Nothing in this repository parses `esds`, understands AAC, or turns a
sample back into sound. It cannot: there is no code that could.

That is worth stating plainly because "keeps the audio" usually means "decodes
and re-encodes the audio", which costs quality on every pass. Here it costs
nothing, and it works for whatever was in the file, not only for the formats
somebody remembered to handle.

`src/mp4.js` grew the two-track support this needs:

- one video track and, optionally, one audio track;
- samples interleaved into chunks of about a second, so a player does not have
  to hold the whole video to reach the start of the sound;
- an **edit list** on any track that does not start with the others. Tracks do
  not always begin together, the sample tables have no way to say so, and
  leaving that gap out is exactly how a crop ends up half a second out of sync
  with itself;
- `moov` before `mdat`, so the file plays without seeking to the end;
- 32-bit offsets, which caps output at 4 GB with a clear error past it.

## Rotation, which is where a cropper usually goes wrong

A phone films in landscape and writes a rotation into the file rather than
turning the pixels. Every player turns the picture on the way to the screen, so
what you see is portrait and what the decoder hands over is landscape.

Get this wrong and the crop box lands on a rotated copy of what the user was
looking at, which is the worst kind of bug: it produces a plausible video of the
wrong part of the picture. So:

- the rotation is read off the track's display matrix;
- the frame is turned in `src/draw.js` before anything is measured against it,
  so the crop box, the preview and the encoder all work in the same coordinates
   — the ones you can see;
- the output carries no rotation of its own, because by then there is nothing
  left to turn.

There is a check for this in `src/main.js` as well: if the demuxer and the
`<video>` element disagree about the shape of the picture, one of them is
applying a rotation the other is not, and rather than guess, the exact path
stands down and the recording path — which is what you are looking at — takes
over.

## Lining up the crop

The box is state in the video's own pixels: "1080 × 1080 starting 420 across",
not "38% of the way in". It is *drawn* in percentages of the preview, which is
what lets the window be resized, the phone be turned, or the preview swap
between a playing video and a decoded still without the rectangle moving.

- Drag inside it to move, any of eight handles to resize, and the anchor —
  the corner opposite the one being dragged — is what stays still.
- Lock it to a shape (1:1, 4:5, 9:16, 16:9, 4:3, 3:2, the source's own, or
  free) and it stops when it runs into the edge of the picture rather than
  sliding along it. **Typing an exact box releases the lock**, and the buttons
  say so, rather than the page going on claiming a lock the box no longer keeps.
- Arrow keys nudge it a pixel; <kbd>Alt</kbd> and the arrows resize it.
- Width and height only ever come out even, because H.264 has no way to store a
  frame with an odd number of pixels on a side. Rounding after the fact would
  mean the numbers on the page were not the numbers used.

**When the browser will not play the file at all** — an HEVC clip in a browser
with no licence for one — the preview is a frame decoded by WebCodecs and drawn
on a canvas instead, and the page says so. The crop is unaffected either way.

## What it spends on the picture

The picture has to be encoded again: a cropped frame is a different picture, and
there is no way to store it without writing the pixels out afresh. Only the
sound survives untouched.

So the question is how many bits to spend, and there are two ceilings, the lower
of which wins:

1. the usual bits-per-pixel figure for the chosen quality, and
2. **what the source itself spent on the same area** — its own bitrate, scaled
   by how much of the frame was kept, with a little headroom.

The second is the interesting one. Most clips people crop are already
compressed; a phone video that arrived at 2 Mbit/s does not become better by
leaving at 6, it just becomes larger. The headroom above the source figure is
what covers the loss of a second pass: 0.8× on "smaller file", 1.25× on
"balanced", 2× on "best quality".

## Limitations

- **The picture is re-encoded.** Unavoidable, as above. The sound is not.
- **It crops and nothing else.** No trimming, no resizing, no rotating. The clip
  that comes out is exactly as long as the one that went in.
- **Edit lists on the way in are ignored.** A file that says "start playing 40
  milliseconds in" is read from the first sample instead. Honouring one properly
  means honouring all of them, including the ones that reorder a track.
- **Encrypted tracks are refused**, with that as the reason. Nothing here can
  decrypt them and a garbled result would be worse than an honest refusal.
- **The recording path needs the tab in front.** Browsers stop painting a hidden
  tab, and canvas capture stops with it. The tool notices, keeps going off a
  timer rather than producing a one-frame video, and says afterwards that some
  frames may be uneven.
- **The finished file is assembled in memory** before you download it, even
  though the source is not. A very long 4K crop is bounded by that.
- **AVI, WMV, FLV and most MKVs** are not readable here and not playable in most
  browsers. That is the FFmpeg question in
  [What can be built here](#what-needs-a-vendored-ffmpeg), not a gap that a few
  more lines would close.

## Testing it

There is no test runner in this repository, so the checks used while writing
this are not checked in. What they covered, if it needs doing again — all of it
run in the browser against files generated in the page, so nothing had to be
committed as a fixture:

- an MP4 written by `src/mp4.js` from `VideoEncoder` output, played back by the
  browser, then read again by `src/demux.js`: 45 samples in, 45 out, keyframes
  and frame times intact;
- a crop of a known picture, decoded again and sampled pixel by pixel, to prove
  the rectangle that comes out is the rectangle that was drawn — including after
  the `tkhd` matrix was patched to 90°, where the numbers only line up if the
  rotation is applied before the crop and not after;
- a fragmented MP4 with AAC sound, recorded by the browser's own
  `MediaRecorder`: 60 video samples and 114 audio samples in, the same counts
  out, at the same channel count and sample rate;
- the same file with its audio shifted half a second later, which must produce
  an `elst` and a file half a second longer — and must not when the tracks start
  together;
- the recording path on a WebM whose colour changes a second in, checked by
  seeking the result and reading a pixel at 0.3 s and at 1.6 s;
- the interface end to end: a file fed to the picker, the ratio buttons, an odd
  width typed in by hand, a crop larger than the frame, cancelling mid-export
  and cropping again afterwards, and a text file dropped in to be refused.
