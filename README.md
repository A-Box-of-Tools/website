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

Each lives in its own folder under [`tools/`](tools/), with its own README
explaining what it does and why it does it that way. The index there is
generated from the tool configs, so neither the list nor its count can fall
behind what actually exists.

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
library. There is no lockfile and no dependency to fetch. The `package.json` at
the root declares one thing — that the `.js` files here are ES modules, which
is what they already were — so that `node --test` can import them; nothing
installs it and the build never reads it. The one exception is `--mangle`,
which renames identifiers and needs esbuild; it is what CI runs and what gets
deployed, and it is described under
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

### The tests

Both suites need nothing installed, for the same reason the build does not:

```bash
python -m unittest discover -t . -s tests/python
```

```bash
node --test "tests/js/*.test.js"
```

The first covers `build.py` and `buildlib/` — the template engine, the two
minifiers and their refusals, the config loading, and a whole build into a
temporary directory, including the 404 page and the root-absolute URLs it has
to carry. The second covers what the browser actually runs: the EXIF and TIFF
parsers, the three container formats, the PDF object grammar, reader and
rewriter, the three MP4 writers, the trimmer's keyframe arithmetic, the PDF
writer, the layout maths and the ZIP writer. Mostly round trips — read a file,
write it back, and check the picture came through byte for byte with only the
metadata gone.

Both run in CI on every push and every pull request, and nothing is published
if either fails. `tests/README.md` says what is covered and what deliberately
is not.

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
  planned.toml           the "Planned" list on the roadmap page
templates/
  hub.html               the hub page
  roadmap.html           the roadmap: what is built, then what is planned
  tool.html              the frame every tool page wears
  page.html              the frame a prose page wears - the legal ones
  404.html               what GitHub Pages returns for an address that is not here
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
  README.md              GENERATED index of the folders below; build.py writes it
  compress-image/
    tool.toml            everything particular to this tool: prose, FAQ, metadata
    README.md            how this tool works and why - it documents itself
    body.html            the <main> of the page - the interface, and only that
    styles.css           the rules only this tool needs
    src/*.js             the app itself; minified into dist/, renamed only by --mangle
    og.png               its share card
  crop-video/            the same six things
  trim-video/            and again
  exif-editor/           and again
  resize-image/          and again
  images-to-video/       and again
  images-to-pdf/         and again
  compress-pdf/          and again
pages/
  privacy/
    page.toml            title, description, dates - the frame, not the prose
    body.html            the <main> of the page
  terms/                 the same two things
  guides/<slug>/         the same two things, plus a group and usually a tool
tests/
  python/                the generator: unittest, standard library only
  js/                    the tools: node --test, built in since Node 18
    helpers.js           image fixtures, built rather than checked in as binary
    pdf-fixtures.js      the same for PDFs, with real byte offsets
package.json             says the .js files are ES modules; no dependencies
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
nothing would link to it — are all errors, not warnings. The guides index makes
the same three checks about guides and groups, and one more: a guide naming a
tool that does not exist, or a second guide claiming a tool that already has
one.

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
   The card on the hub, the sitemap entry, the structured data and the handful
   of other tools every tool page links to all follow from that; there is no
   second place to remember. See
   [Why tool pages link to each other](#why-tool-pages-link-to-each-other).
3. Run `python build.py`. If the tool is missing something, the build says so
   and writes nothing.
4. If it belongs to a category that does not exist yet, add a
   `[[hub.categories]]` table and move that name out of `config/planned.toml`.
5. Set `roadmap_group` to one of the groups in `config/planned.toml`, so the
   tool crosses from the planned half of that group to the built half. A tool
   without one fails the build rather than quietly going missing.
6. Write it a guide. See [The guides](#the-guides) — one folder under
   `pages/guides/`, and the link between the two pages is a single `tool` key.
7. Write `tools/<slug>/README.md`: how the tool works and why it works that way,
   for somebody reading the code rather than using the page. The build refuses
   to finish without one. **This file — the repository README — is not one of
   the places to edit.** It covers the site and the build; a tool documents
   itself, in its own folder, and the index at [`tools/`](tools/) is generated.

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
(`styles.css`), its own code (`src/`), its own words (`tool.toml`), and its own
documentation (`README.md`).

### Where a tool's documentation lives

In the tool's own folder, as `tools/<slug>/README.md`, beside the code it
describes. The build refuses to finish without one.

This file — the repository README — covers the site and the build: how a page is
generated, what the Content-Security-Policy is for, how the deploy works. It is
**not** where a tool is explained, and shipping a tool should never mean editing
it. The index at [`tools/`](tools/) is generated by `build.py` from the tool
configs, in the order the hub shows them, so the list of tools cannot fall
behind the folders that exist either.

That index is the one file the build writes back into the repository rather than
into `dist/`, and it is only rewritten when it would actually change, so an
ordinary build does not dirty the working tree.

### Shared parts

A component more than one tool needs, and that no tool should own, lives under
`shared/` and is named in the tool's `tool.toml`. Three of them exist:

| Part | Named in | Becomes |
|---|---|---|
| `shared/css/file-list.css` | `css_parts = ["file-list"]` | appended to the tool's stylesheet |
| `shared/js/file-picker.js` | `js_parts = ["file-picker"]` | copied to `<tool>/src/shared/` |
| `templates/partials/file-picker.html` | `{% include %}` in `body.html` | the drop-zone markup |
| `shared/js/url-import.js` + its CSS | `[picker.urls]` | the "add from a web address" panel |

The **file picker** is all three at once, and is the reason the arrangement
exists: the drop zone, the hidden input, the drag highlighting, and the "Reading
3 files…" label were the same in every tool, written out five times.

```toml
js_parts = ["file-picker"]

[picker]
accept = "image/*"
multiple = true
title = "Drop images here"
hint = "or click to browse &mdash; JPEG, PNG, WebP, GIF, AVIF"
```

```html
<!-- in body.html -->
{% include "partials/file-picker.html" %}
```

```js
// in src/main.js
import { wireFilePicker, readingLabel } from './shared/file-picker.js';

const picker = wireFilePicker({
  input: el.fileInput,
  dropzone: el.dropzone,
  onFiles(files) { addFiles(files); },
});
```

`picker.busy(readingLabel(files.length))` while reading, `picker.done()` after.
The resting label is read off the markup, so it is written once, in `tool.toml`,
rather than there and in the JavaScript as well.

**Shared JavaScript is copied, not linked.** It lands in the tool's own
`src/shared/`, so every tool folder in `dist/` is still complete on its own,
cached by its own service worker, and works offline with nothing fetched from a
neighbour. That is also why a tool's source folder imports a file it does not
contain — the import path says `./shared/` to make where it came from obvious.

Only *choosing* the files is shared. What a tool does with them afterwards — the
list, the thumbnails, the reordering, the per-row buttons — differs enough per
tool that sharing it would cost more than it saved.

### A vendored engine

A codec nobody here wrote goes in `tools/<slug>/vendor/`, and only one tool has
one: `/heic-to-jpg/`, which carries `libheif` because HEIC is the one picture
format a browser will not decode. `src/` is for code written in this repository
and is read, minified and token-checked as such; `vendor/` is a different kind
of file and gets a different door.

    tools/<slug>/vendor/*     copied byte for byte into dist/<slug>/vendor/

Three rules, all of them enforced by `vendor_files` in `build.py` rather than
remembered:

- **Never minified.** `buildlib/minify.py` is a tokeniser that verifies its own
  output and refuses input it cannot tokenise exactly. A compiled bundle carries
  strings with line continuations in them — legal JavaScript, and not something
  that minifier will touch. That refusal is correct; the answer is to copy the
  file, not to loosen the check for third-party code.
- **Precached with everything else.** Every file in the folder goes into the
  tool's service worker list, so a tool carrying an engine still works with the
  network unplugged. An engine downloaded on first use is not an offline tool.
- **The licence rides along.** Vendoring is only honest if what the thing is and
  what it is licensed under arrive with it, so the whole folder ships and the
  page links to it.

Everything in the folder is copied and everything is cached. There is no list to
keep in step, and a file that is in there but not wanted is a file that should
not have been committed.

The argument about *when* an engine is worth vendoring, and what it costs the
Content-Security-Policy, is in [What can be built here](#what-can-be-built-here).

---

### Adding from a web address

Setting `[picker.urls]` in a tool.toml switches on the one feature here that
contacts anything. It is the only part of this repository that a tool must
*qualify* for rather than simply ask for.

```toml
[picker.urls]
summary = "Add from a web address"
button = "Download images"
noun = "image"
```

That one table pulls in the module, its stylesheet, and the widened `img-src`
that page needs — together, so they cannot drift apart — and the build refuses
to finish if the panel itself is then left off `body.html`, because a page would
otherwise carry a network permission it never uses.

**`<img>`, not `fetch()`.** `connect-src` stays closed, so fetch, XHR,
WebSocket and `sendBeacon` remain impossible and nothing can ever be sent out.
Only `img-src` opens, and that is a one-way door: pictures come in, data cannot
go out. Keeping the original bytes would mean `fetch()`, which would mean
opening `connect-src` to arbitrary origins — and the promise that there is
nowhere for your files to go would stop being true.

**Which is why most tools cannot have it.** The image is copied through a
`<canvas>`, so it arrives as a re-encoded JPEG rather than the bytes the server
sent. The test is not "would it work" but "would the answer still be true":

| Tool | |
|---|---|
| Images to Video | **yes** — the frames are headed into a lossy codec anyway |
| EXIF Viewer | no — a canvas destroys the tags the tool exists to show |
| Image Compressor | no — it would report its saving against a re-encode |
| Images to PDF | no — it would decode the JPEGs it exists to copy through untouched |
| Crop Video | no — `<video>` yields a playback stream, not the bytes the demuxer needs, so the exact crop would silently drop to re-recording |

A tool that would have to misdescribe what it was given goes without.

Two things to hold the line on, because the whole site rests on them:

- **Nothing about a user's file is ever read out.** Not to Google, not to
  anywhere. Every byte that touches a file comes from this origin, and the
  processing happens in the visitor's own browser.
- **If a tool genuinely needs the network**, it says so on its own page, in plain
  language, and explains exactly what leaves the machine. Images to Video does this
  for its "add from a web address" feature (see below). What it must not do is
  weaken the site-wide claim quietly.

---

## The prose pages

`pages/` holds everything that is neither the hub nor a tool. There are two
kinds, and they differ only in where they are meant to be read.

```
pages/privacy/                      kind = "legal"
  page.toml    slug, nav label, title, description, dates, share-card text
  body.html    the <main> - sections of prose and nothing else
pages/guides/trim-a-video/          kind = "guide"
  page.toml    the same, plus `published`, `group`, and usually `tool`
  body.html    the same
```

Either kind gets the site frame, the site's Content-Security-Policy unchanged,
and an entry in `sitemap.xml`. Neither gets a service worker, because there is
nothing here worth keeping offline, or `blob:` in `img-src`, because neither
ever makes one.

`nav` is the short label. A legal page uses it for its own link in the footer;
a guide uses it for the last step of its breadcrumb, because guides are reached
through their index rather than listed one by one down there.

A **legal** page is Privacy or Terms. It matters for trust rather than for
search, which is why it sits at the lowest priority the sitemap has and carries
no structured data at all — inventing an `Article` for a privacy policy would be
describing the page as something it is not.

A **guide** is written to be found. Same frame, same policy, and three things a
legal page does not get: `Article` structured data, a breadcrumb through the
guides index (visible as well as in the markup, which is the rule Google asks
for), and — when it names a tool — a link to that tool under the heading.

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

## The guides

Every tool has one, and there is an index of them at `/guides/`. A tool page
answers "which button do I press"; a guide answers "what does the setting I am
about to move actually do, and what does it cost me". They are also the half of
the site that can be found by somebody who does not yet know it exists.

### Adding one

Make a folder under `pages/guides/`, and set four things in its `page.toml` that
a legal page does not have:

| key | what it does |
|---|---|
| `kind = "guide"` | `Article` structured data, a breadcrumb, `prose` styling |
| `published` | the date the guide first appeared, for the `Article` |
| `group` | which `[[guides.groups]]` in `config/site.toml` it appears under |
| `tool` | optional: the slug of the tool it is about |

Then name the folder in that group's `order` list. Everything else follows: the
card on the index, the line in `sitemap.xml`, and both halves of the link
between the guide and its tool. The footer needs nothing — it carries one link
to the index, not an entry per guide, so it does not grow by a line every time
somebody writes one.

### The three refusals

The build stops rather than quietly producing a page nothing links to. A guide
that names no `group`, a group that lists a guide that does not exist, and a
guide that exists and that no group lists are each an error with a message
naming the file. They are the same three checks `build_hub` already makes about
tools and categories, and they matter slightly more here: a tool missing from
the hub would be noticed the first time anybody looked at the front page, while
a guide that fell out of the index is only ever missed by the reader who never
found it.

`tool` is checked too — it has to name a tool that exists, and two guides cannot
claim the same one, because a tool page has room for exactly one link.

### Why the link between a guide and its tool is one setting

`tool` in the guide's `page.toml` produces both directions: the "Open the …"
button under the guide's lede, and "The longer version" under the tool's
questions. Written the other way round — a `guide` key in each `tool.toml` —
it would be two settings that could disagree about which page is about which,
and the way that shows up in public is a tool linking to a guide that never
mentions it. `tests/python/test_build.py` checks both halves land in the built
HTML.

Neither link's text is written twice either. The tool page shows the guide's own
`heading` and `description`; the guide shows the tool's own `name` and
`tagline`. So neither page can promise something the other does not deliver.

### Why tool pages link to each other

Under the guide link, every tool page carries four more: "Also in the box", the
nearest other tools. It closes a hole that was there from the start. A tool page
linked up to the hub and across to its own guide and nowhere else, so somebody
who arrived from a search for one tool was shown that tool and no route to the
three beside it — and anything pointing at that page from outside stopped there
instead of reaching the rest of the site.

There is no list of related tools anywhere, and there should never be one.
`order` in `[[hub.categories]]` already says which tools belong together,
because it is what groups them on the front page; `related_tools()` in
`build.py` reads the same order, so a second list cannot drift from the first.

Two details in there are worth knowing before changing it:

- **It is a ring, not the head of the category.** Each tool's list is read from
  its own position and wraps round. Taking the first four of each category
  instead would point all fourteen pages of `images-and-video` at the same four
  names and leave the tail of it with nothing linking in — which is the half of
  this that is about crawlers rather than readers.
- **The category sorts the ring; it does not filter it.** `codes-and-data` and
  `text-and-code` hold one tool each, so a strict reading of "same category"
  would leave exactly `qr-barcode` and `text-tools` as the dead ends this is
  meant to remove. A tool with siblings gets siblings, and a tool without gets
  whatever the hub has nearest.

`RELATED_COUNT` is four, and the `13rem` column minimum in
`shared/css/tool-frame.css` is measured against it and against the 940px content
column so the four land on one row. Changing either number without the other
leaves an orphan on a second row.

---

## Languages

The site is written in English and served in as many languages as have been
translated. English keeps the addresses it has always had - `/compress-image/`
- and every other language sits under a prefix with slugs of its own:
`/de/bild-komprimieren/`.

The slug is translated on purpose, and it is the reason this is not simply
`/de/compress-image/`. A slug is the one part of a page's markup that is also a
keyword, and a German reader looking for this tool types "bild komprimieren".
Leaving the English word in the URL throws that away in every market except the
one the site was written for.

### What a locale is, and what it is not

A locale is **words and slugs**. It is not a copy of the site.

Which tools exist, which category each one joins, which guide is about which
tool, what the Content-Security-Policy allows - none of that is language, so
none of it is repeated per language. It stays in `config/site.toml` and in each
`tool.toml`, in English, once. A locale file that tries to restate any of it
fails the build rather than becoming a second site to keep in step.

The practical effect is that shipping a tool gives every language a page for it
the same day - in English until somebody translates it, but present, linked,
and in the right category, because the category was never a translated string.

    locales/de/locale.toml            the language, its slugs, and every
                                      translatable string in config/site.toml
    locales/de/tools/<slug>.toml      overrides for tools/<slug>/tool.toml
    locales/de/tools/<slug>.html      that tool's translated body.html
    locales/de/pages/<slug>.toml      overrides for pages/<slug>/page.toml
    locales/de/pages/<slug>.html      that page's translated body.html

The slug in a locale's filename is always the **English** one. The translated
slug is a value, in `[slugs]`, and never a filename - so every address a
language changes can be read in one place, and a translation does not become
impossible to find because somebody localized the folder it sits in too.

English is not a folder under `locales/`. It is the sources themselves. The
moment it became `locales/en/` it would be a translation of itself, free to
drift from the `tool.toml` it was copied out of, and the build would lose the
one text every other language is measured against.

### Half-translated is allowed, and is never advertised

`buildlib/template.py` refuses to render a name it cannot resolve, and that
rule is not weakened for locales - it is moved. A locale may leave a key out
and the English is used; what it may not do is leave a key out and still be
offered as a translation.

While a `locale.toml` says `complete = false`, the language is built and
readable at its own address, and is kept out of all three places that would
claim it exists:

* no `<link rel="alternate" hreflang>` pointing at it, from any page;
* no entry in `sitemap.xml`;
* no link in the language switcher.

All three are built from one list - `i18n.published` - so they cannot disagree
about which languages the site has, which is the failure Google reports as
"hreflang points to a page that is not indexed".

A published language is also held to one more rule: every link on every one of
its pages has to lead to a page that was actually built. That check exists
because three separate bugs produced no error and no visible breakage, only
pages quietly pointing at the wrong thing - a body.html reused as an English
fallback carries English slugs, and a locale prefix counted as another level up
sent every footer link out of its own language. Unfinished locales are exempt,
because serving English bodies is exactly what they are doing on purpose.

Setting `complete = true` claims the **frame** is translated — the nav, the
footer, the hub, the `[ui]` words — and a remaining fallback in any of those is
a build failure that names the strings. It does not claim the tools and guides
are done: those are held back a page at a time, so a page that still falls back
is built and readable at its own address and stays out of the sitemap, the
hreflang sets and the switcher until it is translated. Every build says how far
each language has to go:

    es: 834 strings still in English (not advertised until complete = true)

`locales/de/` is the worked example — the fullest translation in the tree, and
the one to read before starting another. Which locales are actually finished is
not written here on purpose: every build prints it, and a sentence in a README
goes stale the first time a tool ships.

### The language a first-time visitor gets

Somebody who types `abox.tools` and reads German used to be shown English and
left to find the word "Deutsch" at the bottom of it. `shared/lang.js` - about a
kilobyte, no dependencies, on every page - is the first arrival, and three rules
keep it from becoming the redirect everybody has been trapped by:

1. **It only ever leaves the `x-default` page.** If you are reading `/de/` you
   are there because you asked to be, and being bounced out of it because your
   browser is set to English would be the site overruling a decision you already
   made. It is also what keeps Googlebot - which crawls as `en-US` - from being
   redirected out of every translated page it is asked to index.
2. **Nothing is stored unless you choose.** A detected language is used and
   forgotten. Only a click on a switcher writes anything down, under
   `abox-lang` in localStorage, because only a click says something the
   browser's own settings did not. A stored choice then beats detection, in both
   directions: pick English once and you are never moved again.
3. **There is always a way back**, on the page you were moved to, labelled with
   the name of the language you came from in that language.

Nothing about the language set is compiled into that file. It reads the
`rel="alternate" hreflang` links in the head, which are the same list the
sitemap and the switcher come from, so a language becomes reachable this way on
the day it is published and there is no second list to keep in step.

The switcher itself is in two places and is plain links in both: a `<details>`
control in the header of every page, and the row at the foot of the footer.
Both work with the script blocked.

### Adding a language

1. Make `locales/<lang>/locale.toml` with `lang`, `name` (in English, for the
   build log) and `endonym` (in its own language, which is what the switcher
   shows - somebody looking for German is scanning for "Deutsch").
2. Fill in `[slugs]`, keyed by the English slug. The build refuses a slug that
   names nothing, and refuses two entries that would land on one address.
3. Translate the rest of `locale.toml`, then the files under `tools/` and
   `pages/`.
4. Set `complete = true` when the build stops listing anything.

Set `hreflang` where it differs from `lang` - `pt-BR` is a language and a
region, and `hreflang` is the only place that distinction is expressed. Set
`dir = "rtl"` for Arabic or Hebrew; note that the stylesheets have not been
written for it yet, so that is a layout job as well as a translation one.

### The strings still in the JavaScript

Not done. There are about 380 user-facing strings inline in `tools/*/src/*.js`
- 213 of them in `exif-editor` alone, most of those EXIF tag names - and they
are still English in every language. They need extracting to a source of their
own before a locale can reach them, which is a change to the tools' own code
rather than to the build, and is the one part of this that cannot be checked by
reading the output: it has to be exercised in a browser.

Worth deciding when it is done: the long tail of EXIF tag names is probably
better left in English. They are identifiers people cross-reference against
ExifTool, Lightroom and Windows' own properties dialog, and localizing the
obscure ones makes the tool harder to use rather than easier.

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

### The 404 page

`build.py` writes `404.html` to the root of the output, which is where
[GitHub Pages looks for it](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-custom-404-page-for-your-github-pages-site).
For this site that root is the root of the `dist` branch, so the deploy needs no
extra step. The wording lives in `[not_found]` in `config/site.toml`, and the
tool cards on it come from the same list the hub is built from.

**Every URL on that page is root-absolute, and has to be.** It is the only page
here that is served at an address it was not built for: someone who mistypes
`/compress-imag/` gets this file back while the browser still believes it is
sitting in a folder of that name. A relative `styles.css` would be fetched from
that folder, 404 in its turn, and the error page would arrive unstyled — a worse
first impression than the error. The build passes `base = "/"` for this page
alone, which is what makes the shared footer's links absolute too.

Two more things it does differently, both on purpose:

- **No advertising.** Google asks that ads not be placed on error pages, and an
  advert on top of "we could not find that" is a poor way to meet somebody. The
  measurement tag stays, because knowing which addresses people arrive at and
  fail to find is the whole operational reason to have a custom 404.
- **`noindex`, and no canonical.** The page has no address of its own — it is
  what a thousand wrong addresses return. Giving it a canonical would invite a
  search engine to serve "not found" in place of a real page. It is left out of
  `sitemap.xml` for the same reason.

`serve.ps1` serves it for a miss as well, so the mistake it invites shows up
locally rather than in production.

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

The "Planned" list on the roadmap is not a wishlist. It was drawn up by going
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

### What needs a vendored engine

Everything below is out of reach of the browser's own APIs and in reach of an
`ffmpeg.wasm` build. It passes the test at the top of this section — the file
never leaves the machine and the tool works with the network unplugged — so it
is on the roadmap on that basis.

**One of these has been built, and it did not need FFmpeg.** HEIC to JPG is
`/heic-to-jpg/`, and it vendors `libheif` rather than FFmpeg: the same job at
1.4 MB instead of 25–30 MB, because libheif is only that job. Read
[its README](tools/heic-to-jpg/README.md) before reaching for the big build for
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

### What is still left out

| Ruled out | Why |
|---|---|
| Background removal | A segmentation model, not a codec. FFmpeg does not do it and would not help — this needs weights and an inference runtime, which is a separate argument on a separate day |
| Camera RAW (CR2, NEF, ARW) | FFmpeg does not decode these either. It would take LibRaw or dcraw on top: a second engine, for one family of formats |
| Raster to vector (image to SVG) | A tracing algorithm, not a conversion: large, and the output disappoints everyone who expected their photo back as shapes |

---
