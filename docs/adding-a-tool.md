# Adding a tool

[← README](../README.md)

1. Make `tools/<slug>/` with five things: `tool.toml`, `body.html` (the `<main>`
   of the page, and only that), `styles.css` (the rules only this tool needs),
   `src/*.js` including a `main.js`, and `og.png`. Copying the nearest existing
   tool and editing it is the fastest way in — `tool.toml` is commented
   throughout, and every key in it is required, so nothing can be silently
   forgotten. The `<main>` opens as `<main id="main">` — the skip link on every
   page points at that id — and every control, canvas and bare `<video>` in the
   body needs a name a screen reader can say;
   `tests/python/test_accessibility.py` spells out the rules and fails the
   suite on a body that breaks one.
2. Add the slug to the `order` of the matching `[[hub.categories]]` in
   `config/site.toml`, and set the same category id in the tool's `category`.
   The card on the hub, the sitemap entry, the structured data and the handful
   of other tools every tool page links to all follow from that; there is no
   second place to remember. See
   [Why tool pages link to each other](guides.md#why-tool-pages-link-to-each-other).
3. Run `python build.py`. If the tool is missing something, the build says so
   and writes nothing.
4. If it belongs to a category that does not exist yet, add a
   `[[hub.categories]]` table and move that name out of `config/planned.toml`.
5. Set `roadmap_group` to one of the groups in `config/planned.toml`, so the
   tool crosses from the planned half of that group to the built half. A tool
   without one fails the build rather than quietly going missing.
6. If the tool was itself on the roadmap, take its line out of
   `config/planned.toml` **and** out of every `locales/*/planned.toml`. Those
   item lists are plain strings with nothing to name them by, so they are
   merged by position: a locale list longer than the English one is a hard
   failure, and a line removed at the wrong index silently moves every
   translation after it onto the wrong entry.
7. Draw the share card and the app icons: `.\og-image.ps1 -Only <slug>`. It
   reads the heading from `name`, the subtitle from `og_card` and the icons from
   `icon`, all in your `tool.toml`, so there is no list to add yourself to. The
   build refuses a tool missing any of the three files, because its page claims
   the card in `og:image` and its manifest claims the icons, whether or not they
   are there. Run it without `-Only` and it redraws every tool, which is worth
   avoiding: the mark is rasterised through a headless Edge that flakes about
   once a run.
8. Write it a guide. See [The guides](guides.md) — one folder under
   `pages/guides/`, and the link between the two pages is a single `tool` key.
9. Write `tools/<slug>/README.md`: how the tool works and why it works that way,
   for somebody reading the code rather than using the page. The build refuses
   to finish without one. **Neither this file nor the repository README is one
   of the places to edit.** They cover the site and the build; a tool documents
   itself, in its own folder, and the index at [`tools/`](../tools/) is generated.

   You do **not** have to touch the footer, the sitemap, or the other pages. The
   footer's tool list is derived from `tools/` in the order the hub shows them,
   so a new tool appears in the footer of every page - hub, tool and legal - as
   soon as it exists.

   Before adding a *new* name to the planned list, put it through
   [What can be built here](what-can-be-built-here.md) first. That section is
   where the ruled-out ones, and the reasons they were ruled out, live.

The frame — the header, the pledge, the live network check, the privacy panel,
the FAQ layout, the footer, the Content-Security-Policy, the service worker,
the analytics bootstrap — you get for free and should not reimplement. What a
tool writes for itself is its interface (`body.html`), its own rules
(`styles.css`), its own code (`src/`), its own words (`tool.toml`), and its own
documentation (`README.md`).

## Where a tool's documentation lives

In the tool's own folder, as `tools/<slug>/README.md`, beside the code it
describes. The build refuses to finish without one.

This file, and the repository README it was split from, cover the site and the
build: how a page is generated, what the Content-Security-Policy is for, how
the deploy works. Neither is where a tool is explained, and shipping a tool
should never mean editing them. The index at [`tools/`](../tools/) is generated
by `build.py` from the tool configs, in the order the hub shows them, so the
list of tools cannot fall behind the folders that exist either.

That index is the one file the build writes back into the repository rather than
into `dist/`, and it is only rewritten when it would actually change, so an
ordinary build does not dirty the working tree.

## Shared parts

A component more than one tool needs, and that no tool should own, lives under
`shared/` and is named in the tool's `tool.toml`:

| Part | Named in | Becomes |
|---|---|---|
| `shared/css/file-list.css` | `css_parts = ["file-list"]` | appended to the tool's stylesheet |
| `shared/css/results.css` | `css_parts = ["results"]` | the source panel, the summary rows, the result and its meta line, the results list; put before the tool's own rules, so a tool that wants one of them different keeps its own |
| `shared/css/form.css` | `css_parts = ["form"]` | the controls' vocabulary: fields and their notes, the settings grid they sit in, the inline pair, the card lede, the big button, option rows, the options box, the run and export rows, number fields |
| `shared/css/checks.css` | `css_parts = ["checks"]` | a checkbox row, in both its shapes: a bold title with a dim note beneath, or a few words on one line |
| `shared/css/chips.css` | `css_parts = ["chips"]` | a row of small buttons for choosing one of a few — a speed, a shape — with the chosen one lit by `.active` or `aria-pressed` |
| `shared/css/notes.css` | `css_parts = ["notes"]` | the error line, and the note that says which path a file took |
| `shared/css/panes.css` | `css_parts = ["panes"]` | the two text panes of a formatter page and the head above each |
| `shared/css/modes.css` | `css_parts = ["modes"]` | a choice between two ways of working, as radio rows with a title and an explanation |
| `shared/css/cropper.css` | `css_parts = ["cropper"]` | the crop box `cropper.js` draws: the box, the dimmed surround, the handles, the size label |
| `shared/js/file-picker.js` | `js_parts = ["file-picker"]` | copied to `<tool>/src/shared/` |
| `shared/js/image-list.js` | `js_parts = ["image-list"]` | a list of pictures to work through in order: decoded once for a thumbnail and their size, sorted, reordered, re-decoded one at a time |
| `templates/partials/file-picker.html` | `{% include %}` in `body.html` | the drop-zone markup |
| `shared/js/url-import.js` + its CSS | `[picker.urls]` | the "add from a web address" panel |
| `shared/js/zip.js` | `js_parts = ["zip"]` | the stored-only archive writer |
| `shared/js/crc32.js` | `js_parts = ["crc32"]` | the CRC the ZIP and PNG writers need |
| `shared/js/pdf-objects.js` | `js_parts = ["pdf-objects"]` | the PDF object grammar |
| `shared/js/pdf-reader.js` | `js_parts = ["pdf-reader"]` | opening a PDF somebody else wrote |
| `shared/js/pdf-filters.js` | `js_parts = ["pdf-filters"]` | the stream filters, deflate included |
| `shared/js/pdf-writer.js` | `js_parts = ["pdf-writer"]` | writing a PDF back out |
| `shared/js/mp4-reader.js` | `js_parts = ["mp4-reader"]` | the MP4/MOV reader: every sample, where it is and when it shows |
| `shared/js/mp4-boxes.js` | `js_parts = ["mp4-boxes"]` | the bytes an MP4 is built out of: big-endian integers, four-character types, a box round a payload; both writers import it |
| `shared/js/mp4-writer.js` | `js_parts = ["mp4-writer"]` | the MP4 writer for tracks being copied: two tracks, interleaved, sample entries as bytes; imports `mp4-boxes` |
| `shared/js/mp4-muxer.js` | `js_parts = ["mp4-muxer"]` | the MP4 writer for one H.264 track an encoder just produced; imports `mp4-boxes` |
| `shared/js/webcodecs.js` | `js_parts = ["webcodecs"]` | a decoder's configuration, a track's frame rate, microseconds, and the wait that keeps a feed loop behind the codecs |
| `shared/js/errors.js` | `js_parts = ["errors"]` | the cancellation every page ignores by name, and `said`, the error whose message is a phrase key |
| `shared/js/segments.js` | `js_parts = ["segments"]` | in-and-out points marked while something plays, and the text file they are saved as; the tool passes its own shortest segment |
| `shared/js/timeline.js` | `js_parts = ["timeline"]` | the bar with every segment drawn on it; a subclass draws what lies underneath and says where a mark lands; imports `format` |
| `shared/js/audio-decode.js` | `js_parts = ["audio-decode"]` | the browser's own decoder, asked for the audio track and nothing else |
| `shared/js/samplerate.js` | `js_parts = ["samplerate"]` | the sample rate sniffed out of a file's header before it is decoded; `audio-decode` imports it |
| `shared/js/wav.js` | `js_parts = ["wav"]` | the WAV writer: a header in front of the samples |
| `shared/js/aac.js` | `js_parts = ["aac"]` | an AAC track's description, read out of an `mp4a` sample entry and written round a new one; imports `mp4-boxes` |
| `shared/js/parse-errors.js` | `js_parts = ["parse-errors"]` | the `ParseError` every text parser throws, with a line, a column and a phrase key; each `parse-*` part below imports it |
| `shared/js/parse-json.js` | `js_parts = ["parse-json"]` | JSON read into the tree every text parser speaks, and printed back |
| `shared/js/parse-yaml.js` | `js_parts = ["parse-yaml"]` | YAML 1.2, in the half of it a converter needs |
| `shared/js/parse-xml.js` | `js_parts = ["parse-xml"]` | XML and HTML, one parser with two rulebooks |
| `shared/js/qr-tables.js` | `js_parts = ["qr-tables"]` | the QR specification's tables and the arithmetic around them, for the writer and the reader alike |
| `shared/js/pdf-page-writer.js` | `js_parts = ["pdf-page-writer"]` | a PDF writer for putting pictures on pages; not the quartet's rewriter |
| `shared/js/video-support.js` | `js_parts = ["video-support"]` | what this browser will decode, encode and record; imports `codec-support` |
| `shared/js/frame-canvas.js` | `js_parts = ["frame-canvas"]` | the canvas a video's frames are drawn into at the output size, turned the way the file asks; `readBack` for a tool that reads the pixels out again |
| `shared/js/format.js` | `js_parts = ["format"]` | sizes, durations and the m:ss.mmm clock as words, in the tiers and decimals the tool names |
| `shared/js/message-box.js` | `js_parts = ["message-box"]` | the error line under the drop zone, or any line that is either saying something or hidden |
| `shared/js/download.js` | `js_parts = ["download"]` | a download that starts now, or a link that follows the latest result |
| `shared/js/media.js` | `js_parts = ["media"]` | what the browser makes of a file: a video's size and length, a picture's size |
| `shared/js/cropper.js` | `js_parts = ["cropper"]` | the crop box dragged over a preview, in the picture's own pixels; the tool names its smallest crop and whether sides must be even |
| `shared/js/phrases.js` | nothing — every tool gets it | the words, read off the page |
| `shared/js/trust.js` | nothing — every tool gets it | the live network check and the offline line |

`zip` needs `crc32` listed as well — it is a separate part because a PNG writer
wants the checksum without the archive. The four `pdf-*` parts travel
together: the reader and the writer both import the grammar and the filters,
and `buildlib/imports.py` refuses a tool that lists some and not the rest.

`phrases` and `trust` are the two parts no tool asks for. Every tool page wears
the frame, the frame has sentences its JavaScript puts on screen, and the
trust panel at the foot of the pledge is the frame's markup filled in by the
frame's script, so `js_parts()` in `buildlib/site.py` adds both to every tool.
Listing them forty times would make them look like a choice, and the first
tool to leave one out would build clean and then 404 on a module in somebody's
browser — or ship a live check that says "checking" forever, which is what
happened while the check still lived in each tool's `main.js`. `trust.js` is
loaded by `templates/tool.html` as a module of its own, not imported by
`main.js`, so a tool whose script fails to boot still gets an honest panel;
its four `net.*` sentences are the frame's defaults in `[ui.tool]`, and a tool
that would rather name its subject defines the same keys in its own `#phrases`
block, which wins.

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

**A `./shared/` import resolves after the build, and in the tests.** The copy
happens at build time, which means that path does not resolve in the source
tree on its own — and the JavaScript tests import tool modules straight off the
disk with no build in front of them. So the test command carries
`--import ./tests/js/resolve-shared.mjs`: a resolve hook that sends a tool
module's `./shared/<name>.js` to `shared/js/<name>.js` and touches nothing
else. With it, any module may import a shared part, `main.js` or a unit-tested
leaf. Without it, the first test that loads such a leaf fails naming the
`src/shared/` path it could not find, which is the reminder.

Until that hook existed, `./shared/` imports were confined to `main.js`, and
the module groups that `tests/python/test_duplicates.py` declares as copies
across tools are what that rule produced. `exif-editor/src/png.js` and
`merge-pdf/src/produce.js` were the first to give up their copies of the CRC
and the ZIP writer; the rest are moves waiting to be made, and until each is
made its copies still have to agree.

The build checks the half of this it can. `buildlib/imports.py` reads every
module a tool is about to ship, with the tokeniser from `minify.py` rather than
a regular expression, and refuses a tool whose imports do not all land on a
file that tool ships. The case it exists for: `shared/js/zip.js` imports
`./crc32.js`, so a tool asking for `"zip"` and not `"crc32"` would build
cleanly and 404 in the browser.

Only *choosing* the files is shared. What a tool does with them afterwards — the
list, the thumbnails, the reordering, the per-row buttons — differs enough per
tool that sharing it would cost more than it saved.

## A vendored engine

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
Content-Security-Policy, is in [What can be built here](what-can-be-built-here.md).

---

## Adding from a web address

Setting `[picker.urls]` in a tool.toml switches on one of the two features
here that contact anything — the other being `/share-text/`'s rendezvous,
argued on that tool's own page and in `workers/rendezvous/`. Both are parts a
tool must *qualify* for rather than simply ask for.

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

