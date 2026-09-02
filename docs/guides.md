# The guides

[← README](../README.md)  ·  see also [The prose pages](prose-pages.md)

Every tool has one, and there is an index of them at `/guides/`. A tool page
answers "which button do I press"; a guide answers "what does the setting I am
about to move actually do, and what does it cost me". They are also the half of
the site that can be found by somebody who does not yet know it exists.

## Adding one

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

## The screenshots

A guide explains which setting to move and what moving it costs. A picture of
that setting is worth a paragraph of it, so most guides carry two or three, in
the sections they belong to rather than one at the top.

They are taken by driving the real tool:

```bash
python build.py                    # there has to be a site to photograph
node screenshots/capture.mjs       # every guide
node screenshots/capture.mjs trim-a-video   # one of them
```

`screenshots/capture.mjs` serves `dist/` from inside itself, opens a headless
Edge over the DevTools protocol — the same browser `og-image.ps1` already
leans on, and for the same reason — and follows one recipe per guide under
`screenshots/recipes/`. A recipe says which tool to open, what to hand it and
what to clip; its `run` bodies are serialised and evaluated **in the page**, so
they may use only what the browser has plus the helpers in
`screenshots/inpage.js`. There is no dependency and no lockfile, which is the
rule everywhere else here.

Nothing is mocked up and no sample files are checked in. The photograph, the
scan, the clip, the voice memo, the PDF, the GIF and the DICOM are all *drawn*
in the page a second before they are used — a canvas for the pictures,
WebCodecs and crop-video's own MP4 writer for the video, gif-maker's own
encoder for the GIF. A screenshot therefore cannot promise a control the tool
has not got, and there is no photograph in this repository carrying somebody's
copyright or somebody's face.

Three things to know before changing any of it:

- **The file lives with the guide and is published away from it.**
  `pages/guides/<guide>/screens/<name>.webp` is served at
  `/screens/<guide>/<name>.webp`, once, for all fifteen languages, and the
  bodies address it from the root. Under the guide's own folder it would have
  to be copied into every locale to be reachable from one. See
  `buildlib/screens.py`.
- **Never write `width` or `height` on one of these `<img>` tags.** The build
  reads them out of the file and fills them in, and refuses a tag that carries
  its own — the two numbers are exactly the kind that rot, sitting in fifteen
  translated copies of a body while the picture they describe is recaptured a
  few pixels taller.
- **The tool in the picture is in English in every language.** The caption
  under it is translated, the screenshot is not: fifteen photographs of fifteen
  translated tools would cost several megabytes and a recapture of the world.
  A locale that has not translated the caption simply has not got the figure —
  its body is its own file, and adding a picture to the English one does not
  touch it.

## The three refusals

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

## Why the link between a guide and its tool is one setting

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

## Why tool pages link to each other

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
  instead would point all ten pages of `video-and-animation` at the same four
  names and leave the tail of it with nothing linking in — which is the half of
  this that is about crawlers rather than readers.
- **The category sorts the ring; it does not filter it.** No category holds a
  single tool today — the smallest holds five — but three did before the hub's
  headings were cut down to four, and a new category starts life holding exactly
  one. A strict reading of "same category" would make each of those the dead end
  this is meant to remove, so a tool with siblings gets siblings, and a tool
  without gets whatever the hub has nearest.

`RELATED_COUNT` is four, and the `13rem` column minimum in
`shared/css/tool-frame.css` is measured against it and against the 940px content
column so the four land on one row. Changing either number without the other
leaves an orphan on a second row.

## The one question a tool page asks

A second and a half after a download, a small panel appears under the step it
came from: *Did this do the job?*, a thumb up and a thumb down. A thumb down
offers four fixed reasons — wrong result, did not finish, too slow, confusing —
and that is the whole of it. `shared/feedback.js`.

It exists because nothing else here can tell you whether a tool works. Nothing
is uploaded, so there is no server log to read, and the page view already
counted says a tool was opened and cannot say whether anybody left with a file
they could use. A tool that quietly produces a broken GIF in one browser is
invisible until somebody writes in.

Four things keep it from being the thing the rest of this site argues against:

- **It sends an answer, not a report.** One `gtag` event carrying the tool's
  slug, `up` or `down`, and one of four fixed reasons. No filename, no size, no
  count, no dimension, and **no free-text box** — a comment field on a page that
  has just handled somebody's passport scan collects filenames and worse, which
  is the reason the reasons are chips.
- **It goes where the page view already goes.** `google-analytics.com` is
  already in `connect-src` and already named in the `PLATFORM_HOSTS` list the
  live network check reads (`shared/js/trust.js`), so this added **no origin,
  no CSP change**, and
  the live check on the page still reads green after an answer is sent.
- **It asks once and then leaves.** An answer buys six months of silence on that
  tool, a dismissal thirty days, a second dismissal a year — in `localStorage`,
  like the language choice and for the same reason.
- **It never gets in the way.** A panel in the flow of the page, not a modal and
  not a toast: no focus taken, nothing covered, no button blocked.

Two things to know before changing it. It is a **frame script**, delivered like
`shared/lang.js` from `/feedback.js?v=<hash>` and included only by
`templates/tool.html` — not a `js_parts` module, which would have to be imported
by every tool's `main.js` and is the only reason this cost no per-tool code at
all. And it finds a download **by the click**, in three shapes already in the
markup: `a[download]` with an href, a button whose id starts with `download`,
and anything carrying `data-download`. The third is the opt-in for a save button
named something else, which today is exactly one — exif-editor's "Save this
photo". Because a tool's `body.html` is copied whole into each
`locales/<lang>/tools/<slug>.html`, a translation is a chance to lose that
attribute silently; `DownloadHooks` in `tests/python/test_build.py` fails if a
locale copy carries a different number of them than the English body.

The words are `[ui.feedback]` in `config/site.toml`, translated in every
`locale.toml` beside the rest of the frame — so adding a string there is a debt
in every language, and `complete = true` will not build until they are written.

