# Layout

[← README](../README.md)

There are two halves: the sources, which are what you edit, and `dist/`, which
is what a browser gets. Nothing in `dist/` is ever edited by hand — every file
in it carries a "GENERATED FILE" banner saying which sources it came from.

```
build.py                 the generator; run it to produce dist/
buildlib/
  template.py            an eighty-line template engine, so this has no dependencies
  site.py                config loading, the CSP, the structured data, the checks
  emit.py                the one function that writes a file, and what it minifies
  catalogue.py           the whole site as one file: sitemap.xml, llms.txt, the feeds
  deployed.py            --check: diffing a build against the branch being served
config/
  site.toml              everything true of every page: the CSP, the ids, the hub
  planned.toml           the "Planned" list on the roadmap page
templates/
  hub.html               the hub page
  roadmap.html           the roadmap: what is built, then what is planned
  tool.html              the frame every tool page wears
  page.html              the frame a prose page wears - the legal ones
  404.html               what GitHub Pages returns for an address that is not here
  sw.js                  the offline service worker, one per installable folder
  offline.js             registers that worker, for the front page only
  analytics.js           the Google Analytics bootstrap
  sitemap.xml
  llms.txt               the site in plain text, for something that gets one fetch
  partials/              the pieces shared between all three, incl. the footer
shared/
  css/
    tool-frame.css       the stylesheet every tool page starts from
    file-list.css        an optional part, for tools that show a list of files
  site.css               the stylesheet for the hub and the legal pages
  logo.svg               the site mark; also the favicon, and inlined in the pages
  icon-180.png           the same mark as a PNG, for iOS home screens
  icon-192.png           and again, for an installed app's icon
  icon-512.png           and again, larger
  icon-512-maskable.png  and again, with the margin Android's crop needs
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
    src/*.js             the app itself; minified into dist/, never renamed
    og.png               its share card
    icon.png             its emoji on a tile, for when it is installed as an app
    icon-maskable.png    the same, drawn smaller for Android's crop
  crop-video/            the same eight things
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
  about/                 the same two things, plus a schema_type: who publishes
  contact/               the same again: how to reach them
  guides/<slug>/         the same two things, plus a group and usually a tool
workers/
  rendezvous/            the one server: the introduction /share-text/ needs.
                         Deployed by hand with wrangler; invisible to build.py,
                         and in this repository so the tool's "the server's
                         whole source is published" claim is checkable
tests/
  python/                the generator: unittest, standard library only
  js/                    the tools: node --test, built in since Node 18
    helpers.js           image fixtures, built rather than checked in as binary
    pdf-fixtures.js      the same for PDFs, with real byte offsets
LICENSE                  MIT: the code, and what the MIT half does not cover
LICENSE-CONTENT          CC BY 4.0: the words the site publishes
package.json             says the .js files are ES modules; no dependencies
og-image.ps1             draws the share cards and the icons from shared/logo.svg
serve.ps1                builds, then serves dist/ locally
indexnow.py              tells Bing which pages a deploy actually changed
cloudflare/              the edge config that adds the security headers
```

Each generated tool folder is still entirely self-contained and still assumes
nothing about where it is mounted: every path in it is relative, so it works at
the domain root, at `/compress-image/`, or nested deeper, with no configuration.
The service worker registers with the scope of its own folder, so each tool
caches only itself and cannot interfere with its neighbours.

## Installing it as an app

Two kinds of page here can be installed, and both are offered by the browser
itself from the address bar — there is no button on a page and no script asking.

| Installed from | Is called | Wears | Opens on | Its scope |
|---|---|---|---|---|
| a tool page | that tool — "Video Cropper" | that tool's emoji | that tool | that tool's folder |
| a front page | A Box of Tools | the site mark | that language's hub | that language's root |

The icons are the same `icon` that sits beside the tool's heading and the same
`logo.svg` the hub wears, drawn onto a tile by `og-image.ps1` — a launcher full
of identical toolboxes would tell you nothing. Two per tool, because Android
crops an icon to the launcher's shape and guarantees only the middle 80% of it,
so the maskable copy is drawn smaller. Four tools share an emoji (🎞️) and so
install as the same picture; changing that means choosing different emoji in
their `tool.toml`, which changes their headings and tab icons too.

Each one is scoped to exactly what a service worker beside it has already
cached, which is the point: an installed app here opens with the network
unplugged. That is why the front page got a worker of its own in the same change
that made it installable — an installed app that needs the network to show its
front door would be advertising the opposite of what this site is.

The scopes nest — `/de/video-zuschneiden/` inside `/de/`, and `/de/` inside `/`
— and that is fine. A browser resolves a navigation to the most specific scope
it has, so someone who installed both the site and one tool gets the tool's
window for the tool and the site's window for everything else, and someone who
installed only one of them still has the other's pages inside the one window
there is. English is the case worth knowing about: its front page *is* the site
root, so its scope is the whole origin.

The cache store, unlike the scopes, is flat — one per origin, shared by every
worker on the site. Each cache name is therefore prefixed with the scope that
owns it, so a worker cleaning up after itself deletes only its own superseded
caches. Without that prefix it deleted *everyone's*: for a long time, visiting a
second tool dropped the first tool's offline copy, and only the last tool you
had opened still worked with the network off.

## What the build does to the output

There is one build, and that is the point.

| | `python build.py` |
|---|---|
| Needs | Python 3.11+, nothing else |
| HTML | comments and whitespace out |
| CSS | comments and whitespace out |
| JavaScript | comments and whitespace out, **nothing renamed** |
| Used by | anyone, anywhere — including CI, and so the deployed site |

What you run is what is deployed. There is no second build with a toolchain in
front of it, which is what makes the claims on these pages checkable by someone
who has not already agreed to trust one.

**Identifiers are never renamed.** A reader who opens a file on the live site
finds the same statements in the same order under the same names they have in
this repository. A served file whose every name had been replaced by a letter
could not be read against its source by anybody, which for a site that asks to
be checked is a worse trade than the bytes are worth.

**Sizes.** HTML 28% smaller, CSS 39%, JavaScript 40% — about 36% off the text
weight of the site.

**Nothing is reordered, merged or rewritten.** No shorthand is collapsed, no
colour re-spelled, no rule moved. Those are the transformations that make a
minifier impressive and also the ones that occasionally change a page.

### How it avoids breaking things

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

### Which command to run

```bash
python build.py              # what CI builds and what is deployed
python build.py --no-minify  # readable and unminified, for debugging
python build.py --check      # compares the result against the deployed branch
```

Whichever way it runs, the build never reaches the network.

## What the build stopped anyone having to remember

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

