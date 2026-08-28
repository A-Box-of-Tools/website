---
name: tool-development
description: "Add, update, or reuse code in this repository — the abox.tools static site of browser-only tools. Use this whenever a task touches tools/, shared/, pages/, templates/, locales/, config/ or buildlib/: building a new tool, fixing or extending an existing one, moving code into a shared part, writing a guide, or changing the build — even when the request only says \"fix X\" or \"add a feature to Y\" without naming a file. It carries the checklists the build enforces, the verification commands, and the traps (LF-only files, positional planned.toml lists, ./shared/ imports in tested modules, og-image redraws) that are not guessable from the code alone."
---

# Working on abox.tools

This repository generates **abox.tools**: a static site of single-purpose
tools that run entirely in the visitor's browser. The product is one promise —
*there is no code path that could send a visitor's file anywhere* — and every
change is judged against it. Adding a `fetch` to a tool is not an
implementation detail; it changes what the site claims about itself. There are
no dependencies and no JavaScript build step: what sits in `tools/<slug>/src/`
is byte for byte what the browser runs.

`python build.py` generates everything into `dist/`. The build refuses to
produce a broken site rather than warn about one — a missing key, icon, README,
category or unresolvable import is an error naming the file. When it stops,
read the message; it is the fastest route to done.

## Rules that hold for every change

- **Every text file is LF, working tree included** (`.gitattributes`). The
  build copies `shared/` and each tool's `src/` byte for byte, so one CRLF
  makes the deployed-site check report a difference that is not real. Python's
  `write_text()` silently writes CRLF on Windows — use `write_bytes()` for
  anything in this repository.
- **Never `git add -A`.** A CI-style build writes `_plain/`, and one `-A` once
  swept 3,816 generated files into `main`. Stage explicit paths and check
  `git diff --cached --name-only` first — a tool change is around 20 files, a
  locale around 66.
- **Never edit generated files.** The footer, the sitemap, the hub's cards,
  the structured data and `tools/README.md` are all derived from `tools/`,
  `pages/` and `config/`; edit the source and the build carries it everywhere.
- **A sentence a visitor reads never lives in the JavaScript.** `src/` is
  copied unchanged into every language, so a string written there is English
  at all of its addresses but one. Put it in the markup and read it back with
  `phrase()` — the full pattern is under "Job: update an existing tool" below.
- **Match the prose voice.** Commit messages, comments and `tool.toml` prose
  here explain *why*, in full sentences, and assume the reader can see the
  code. A comment that restates the line below it does not belong.

## Read before you edit

The documentation is one file per subject; go straight to the one that covers
the change:

| Change | Read |
|---|---|
| a new tool, shared parts, vendoring, URL import | `docs/adding-a-tool.md` |
| whether an idea is buildable here at all | `docs/what-can-be-built-here.md` |
| the tree, installing as an app, what minifying does | `docs/layout.md` |
| a guide, or the links between guides and tools | `docs/guides.md` |
| the legal pages, what Privacy claims | `docs/prose-pages.md` |
| anything under `locales/` | `docs/languages.md` |
| build flags, tests, serving locally | `docs/running.md` |

Every tool also documents itself: `tools/<slug>/README.md` says how that tool
works and why it works that way, and the header comment of its `tool.toml`
records what is unusual about it. Read both before changing a tool — the
decisions recorded there are the ones a diff will not show.

## Job: add a new tool

The full checklist is `docs/adding-a-tool.md`; this is the order that works,
with the steps that bite marked.

1. **Gate the idea** against `docs/what-can-be-built-here.md`. That file holds
   the test a tool has to pass, which jobs need a vendored engine, and the
   ideas already ruled out with their reasons — do not re-litigate those.
2. **Copy the nearest existing tool** under `tools/<slug>/` and edit. Five
   things are yours to write: `tool.toml` (commented throughout; every key
   required, so nothing can be silently forgotten), `body.html` (the `<main>`
   of the page and only that), `styles.css`, `src/` with a `main.js`, and
   `README.md`. The share card and icons come in step 5. The frame — header,
   pledge, live network check, privacy panel, footer, CSP, service worker —
   is not yours to write; the template provides it.
3. **Register it** in `config/site.toml`: add the slug to the `order` of the
   matching `[[hub.categories]]`, set the same category id in the tool's
   `category`, and set `roadmap_group` to a group in `config/planned.toml`.
   The hub card, sitemap entry, structured data, footer link and the "Also in
   the box" ring on other tool pages all follow from this; there is no second
   place to remember.
4. **If the tool was on the roadmap**, delete its line from
   `config/planned.toml` **and** from every `locales/*/planned.toml`, at the
   same position. Those lists are plain strings merged positionally: a locale
   list longer than English fails the build, and a line removed at the wrong
   index silently shifts every translation after it onto the wrong entry.
5. **Draw the card and icons**: `.\og-image.ps1 -Only <slug>` (PowerShell). It
   reads the heading from `name`, the subtitle from `og_card` and the icons
   from `icon` in `tool.toml`, so set those first. Never run it without
   `-Only` — that redraws every tool's card, and the redraws are not
   byte-identical because the logo is rasterised through headless Edge, which
   flakes. `-Icons -Only <slug>` redraws one tool's icons alone.
6. **Meet the accessibility floor.** The `<main>` opens as `<main id="main">`
   (the skip link on every page points at that id), and every control, canvas
   and bare `<video>` needs a name a screen reader can say.
   `tests/python/test_accessibility.py` spells out the rules and fails the
   suite on a body that breaks one.
7. **Write it a guide** under `pages/guides/` — see "Job: write or edit a
   guide" below. Every tool has one.
8. **Write `tools/<slug>/README.md`** — how the tool works and why, for
   someone reading the code. The build refuses to finish without it. Do not
   add the tool to the repository README or `tools/README.md`; the first
   covers the site, the second is generated.
9. **Build it and open it in a browser** — see "Verify" below. Write the tests
   it owes and leave the running of them to CI; a tool that only passed its
   tests has not been used yet, and that is the half nothing else can check.

## Job: update an existing tool

1. Read `tools/<slug>/README.md` and the `tool.toml` header comment first.
2. **New visitor-facing strings go in the markup**, not in `src/`: a
   `data-phrase` span in the tool's `#phrases` block in `body.html` (or
   `[ui.tool]` in `config/site.toml` for something the whole frame says), read
   back with `phrase()` from `shared/js/phrases.js`, which every tool ships. A
   module too deep to reach the DOM returns a *key* and lets the caller
   resolve it — `qr-barcode-reader/src/camera.js` is the worked example.
3. **`./shared/` imports belong in `main.js` and nowhere else.** The build
   copies shared modules into `src/shared/` at build time; that path does not
   exist in the source tree, and the JavaScript tests import leaf modules
   straight off the disk, so a `./shared/` import in a unit-tested module
   breaks its whole test file. That is why some modules are deliberately
   duplicated across tools; `tests/python/test_duplicates.py` declares which
   copies must agree (by token, so comments may differ) and fails when they
   drift. Fix one copy and it names the others; add a new copy and it makes
   you declare it.
4. **Keep the page's claims true.** If the change alters what the tool does
   with a file, the pledge, privacy panel, FAQ and `csp_note` in `tool.toml`
   may now overstate or understate it. The FAQ renders twice — visible
   `<details>` and `FAQPage` structured data — from the same `[[faq]]`
   entries, so there is one place to fix.
5. **Bump `lastmod`** in `tool.toml` when the change is visible to a visitor;
   it feeds the sitemap and the page's `dateModified`.
6. **Redraw the card only when `name`, `og_card` or `icon` changed**, and
   always with `-Only <slug>`.
7. A tool may *widen* its own CSP in its `[csp]` table for something it needs;
   it can never narrow the site's policy or reach another page's.

## Job: share code between tools

A part more than one tool needs lives under `shared/` and is named in
`tool.toml` — `css_parts` is appended to the tool's stylesheet, `js_parts` is
copied into its `src/shared/`. Copied, not linked: every built tool folder
stays complete on its own, cached by its own service worker, working offline.
The parts table and the file-picker walkthrough are in `docs/adding-a-tool.md`;
the details that bite:

- `js_parts = ["zip"]` needs `"crc32"` listed too — `zip.js` imports it, and
  `buildlib/imports.py` fails the build on any import that does not land on a
  file the tool ships.
- `phrases` is never listed; every tool gets it automatically.
- The leaf-module restriction above caps what can be shared: a module that
  unit tests import must not depend on `./shared/`. Prefer sharing at the
  `main.js` layer, or accept a declared duplicate.
- Only *choosing* files is shared. What a tool does with them afterwards
  differs enough per tool that sharing it would cost more than it saves.
- `[picker.urls]` ("add from a web address") is the one feature a tool must
  *qualify* for, not just ask for: it opens `img-src` only, images arrive
  re-encoded through a canvas, and the test is whether the tool's answer would
  still be true of a re-encode. Most tools' would not.
- A third-party engine goes in `tools/<slug>/vendor/`, never `src/`: copied
  byte for byte, never minified, fully precached, with its licence shipping
  alongside. `heic-to-jpg` is the only example and the bar for adding another
  is in `docs/what-can-be-built-here.md`.

## Job: write or edit a guide

One folder under `pages/guides/<slug>/` with `page.toml` and `body.html`. Set
`kind = "guide"`, `published`, `group` (a `[[guides.groups]]` id in
`config/site.toml`), and usually `tool` (the slug it is about); then name the
folder in that group's `order` list. The `tool` key alone produces both
directions of the tool↔guide link — never add a second link by hand. The build
refuses a guide in no group, a group naming a missing guide, a `tool` that
does not exist, and two guides claiming one tool. `docs/guides.md` has the
reasoning.

## Job: change the frame or the build

A change under `templates/`, `shared/css/`, `shared/js/` or `buildlib/` lands
on every page in every language — verify one translated page, not just
English. Two standing constraints:

- **A service worker's cache name keeps its scope prefix.** The cache store is
  one per origin, shared by every tool's worker and every front page's, so an
  `activate` step that deletes beyond its own prefix deletes its neighbours'
  offline copies. It happened; the symptom was invisible to the build.
- **The minifiers verify their own output and refuse what they cannot prove.**
  JavaScript must re-tokenise identically and line breaks never move;
  identifiers are never renamed, so the deployed file stays readable against
  its source. Do not loosen a refusal to admit a file — copy the file instead
  (that is what `vendor/` is).

## Locales: what a code change owes them

Usually nothing: which tools exist and what they do is not language, so a new
tool gets a page in every language the same day, in English until translated
and unadvertised until then. What a change does owe them:

- a line removed from `config/planned.toml` comes out of every
  `locales/*/planned.toml` at the same index (see step 4 above). Lists whose
  English entries carry an `id` merge by id and need no such care;
- a `ja` or `zh` phrase stays on one line — those languages have no spaces
  between words, so a wrapped phrase ships a visible hole mid-sentence;
- translation itself follows `docs/languages.md`, with `locales/de/` as the
  worked example.

## Verify before you call it done

```bash
python build.py --out _plain --clean --no-minify
```

That is exactly what CI runs, and the only thing in this section you run over
the code rather than over the site it made. `--clean` matters: building
several branches into one output directory leaves pages from all of them, and
the link checker then reports dozens of broken links that look exactly like
"main is broken". `python build.py --check` compares against the deployed
`dist` branch, which tracks `main` — on a feature branch it exits 1 by
construction, so do not read that as failure.

While iterating on one tool, scope the build instead:

```bash
python build.py --only <slug> --locale en --quiet
```

Seconds rather than a couple of minutes, because it does not write the other
thirty-five tools or the fifteen languages' worth of guides. The page it writes
is byte for byte the page a full build writes, so it is worth looking at; what
it does not write is everything that lists other pages — hub, guides, roadmap,
404, sitemap, feeds — and it does not check links, since every link out of the
scope would report broken. Run the full command above before calling the change
done.

**The two test suites are not yours to run.** `tests/README.md` says how, and
a person is welcome to; an agent working here is not. CI runs both on every
push and every pull request that touches anything they cover, and the build job
needs them, so a failure stops the deploy without your help — while the Python
suite costs the better part of
half an hour locally, because most of its cases build the whole site before
they assert anything. Write the tests a change owes (the checklists above still
mean it), let CI run them, and spend the time on the browser instead. If CI
reports a failure, reproduce that one case by name — `python -m unittest
tests.python.test_build -v -k <name>`, or `node --test
--test-name-pattern="<name>" "tests/js/*.test.js"` — rather than the suite
around it.

Then use the thing:

```bash
powershell -ExecutionPolicy Bypass -File serve.ps1
```

and open <http://localhost:8080/>. Never open a built `index.html` by
double-clicking it — browsers block ES modules on `file://`, so the page
renders but `main.js` never runs. Behaviour that only a browser exercises —
decoding, canvases, the service worker, `phrase()` lookups — is not covered by
either test suite, so a code change to a tool is not done until the page has
done its job once in front of you.

## Photograph it, when a visitor could see the change

A pull request that changes anything on screen carries before and after
pictures — CLAUDE.md says so under "Conventions" and does not say how. This is
how. `screenshots/capture.mjs` is not it: that is the guides' harness, it is
recipe-driven, and it writes into a guide's `screens/` folder. For an arbitrary
built page use the script beside this file:

```bash
node .claude/skills/tool-development/shoot.mjs <url> <out.png> [selector] [w] [h]
```

**Take the "before" shot first.** Once the change is applied there is nothing
left to photograph short of building the base commit again. Build, serve, shoot,
then start editing.

The order that works:

1. `python build.py --only <slug> --quiet` — seconds, and the page is byte for
   byte the one a full build writes;
2. serve it, and **check the port is yours**. `python -m http.server 8123 -d
   dist` and then `curl` the page. On Windows the obvious ports are often held
   by the kernel HTTP stack: 8080 answers as PID 4 (`System`), a browser
   pointed at it loads *something*, and a screenshot of somebody else's site is
   not obviously wrong in the image;
3. shoot the "before", make the change, rebuild, shoot the "after";
4. compare the reported pixel heights. A change that adds a line and two shots
   of identical height means the second one is stale, which is the failure the
   script's fresh profile and random port exist to prevent — a leftover headless
   Edge on a fixed port answers with the page it already had.

The script closes the browser over the protocol and then `taskkill /T`s what is
left, on the way out of both the success and the failure path. That is not
belt-and-braces: `child.kill()` alone fells the trunk Node can see and leaves
the renderers, the GPU process and the browser itself running, which is worth a
gigabyte apiece and nineteen live browsers after a morning of shooting.

**Shoot the languages most likely to break, not just English.** A frame change
lands on all fifteen, and the failures are language-specific: `ja`, `zh` and
`zh-TW` show a wrapped string as a visible hole mid-sentence, and `ar` is the
only check on bidi putting a Latin fragment in the right place. `ko` and `hi`
are worth one look each. Shoot the narrow layout too — `... 390 844` — because
a sentence carrying two links breaks there first.

**A translated page is not at the English slug.** `/ja/compress-image/` exists;
`/ar/compress-image/` does not, because `[slugs]` renames it. Read the slug out
of the locale rather than guessing:

```bash
python -c "import tomllib;print(tomllib.load(open('locales/ar/locale.toml','rb'))['slugs']['compress-image'])"
```

**Then hand the files over.** GitHub has no public API for the images a PR body
embeds — the `user-attachments/assets/…` URLs come from the web uploader's own
session endpoint, and neither `gh` nor `gh api` can reach it. So write the
Before/After section with the filenames as visible placeholders and give the
files to whoever is at the keyboard. Do not commit screenshots to get a raw URL;
see the `git add -A` trap above for what stray files cost here.
