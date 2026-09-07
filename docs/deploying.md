# Deploying

[← README](../README.md)

The site is one domain, `abox.tools`. It is served by **GitHub Pages** from the
`dist` branch of this repository, behind **Cloudflare's proxy**.

```
a change  ->  pull request  ->  dev  ->  pull request  ->  main  ->  dist  ->  Pages

visitor  ->  Cloudflare (DNS, TLS, response headers)  ->  GitHub Pages (dist branch)
```

`main` holds the sources of what is live. `dist` holds the built site, and
nothing else: it is written only by
[the Build workflow](../.github/workflows/build.yml), never by hand.

To see what would be deployed before pushing, run `python build.py` and look at
`dist/`. To check that what *is* deployed matches these sources, run
`python build.py --check`, which diffs a fresh build against the `dist` branch.

## The branches, and why there is one in the middle

| Branch | What it holds | What a push to it does |
|---|---|---|
| a working branch | one change | builds and checks it; previews it once a pull request is open |
| `dev` | everything merged since the last release | builds it, and previews it at `dev.abox-preview.pages.dev` |
| `main` | what is live | builds, publishes to `dist`, tags the version, tells IndexNow |
| `dist` | the built site, and nothing else | GitHub Pages serves it |

Work is opened against `dev`. **Releasing is opening a pull request from `dev`
to `main`** and merging it — there is no other step, and no file in the tree has
to be edited to do it.

**That merge is done by hand, on purpose, and nothing here will ever do it for
you.** No schedule opens the pull request, no workflow merges it, and nothing
fast-forwards `main` on to `dev`. Auto-merge is not to be enabled on it either.
Deciding that what is on `dev` is ready to be live is the one judgement this
arrangement exists to make room for: `main` moving is a deploy, a version tag
and a submission to five search engines, and it should happen because somebody
looked at the bundle and its QA run and said yes. Everything upstream of that
merge is automatic so that this one step can be deliberate.

`main` used to be where pull requests landed, which made every merge a release:
its own deploy, its own version tag, its own IndexNow submission. Most changes
do not deserve one — a phrase in one language, a colour, a fix to one tool — and
on 27 August thirty-seven of them went out in a day. The cost is not runner
time. It is that a version tag then names the last change rather than a set of
them; that thirty-seven deploys are thirty-seven chances to be the one that
broke something; and that finding which one did means bisecting a day instead
of reading a pull request.

Bundling on `dev` changes that and nothing else. Production moves once, with
everything reviewed and previewed since the last time, under one version tag
that names the whole set. What it costs is one more merge between a change and
the visitor, and a `dev` that has to be merged forward whenever `main` moves
without it — a hotfix taken straight to `main`, which is the one occasion to go
round this rather than through it.

The gates are unchanged in kind and doubled in number. A pull request builds
without publishing, so a change that breaks the build is caught before it
reaches `dev`; and the pull request from `dev` to `main` builds the bundle,
previews it, and runs the QA suite against that preview before any of it is
live. See [cloudflare/README.md](../cloudflare/README.md), "Previews".

**`main` stays this repository's default branch**, and that is load-bearing
rather than inertia. The QA suite reads the tool list and the CSP out of a
checkout of this repository rather than keeping its own copy, and a run that
was told no commit reads the default branch — which is every production run.
Point the default at `dev` and each of those would count the bundle's tools
against the live site's cards and fail, correctly, about two different sites.
The cost of leaving it is that a pull request opened by hand in the GitHub UI
arrives based on `main`, and the base has to be changed to `dev`.

**`python build.py --check` cannot pass on `dev`.** It diffs a fresh build
against `dist`, `dist` tracks `main` exactly, and `dev` is ahead of `main` by
construction whenever it is holding anything at all. That is not a failure to
investigate, and CI does not run it.

## GitHub Pages

*Settings → Pages → Deploy from a branch → `dist` → `/ (root)`.* The
`CNAME` file, which lives in [`shared/`](../shared/) and is copied into every
build, holds the custom domain; `.nojekyll` beside it stops Pages running the
content through Jekyll.

**If you are moving this from the old setup**, the Pages source has to be
changed from `main` to `dist` by hand, once. Until it is, the workflow will
publish to `dist` and Pages will keep serving `main`, which no longer contains
an `index.html` — so the site would 404. Change the branch first, or in the
same sitting.

## Why the built site is committed

Pages could build this itself, and most static sites let it. Committing the
output instead buys one specific thing: a reader can run `python build.py` on
their own machine and diff the result against the branch that is actually being
served. A site whose entire pitch is "check this rather than believe it" should
not ask anyone to take the deployment on trust either.

## DNS at Cloudflare

Four `A` records on the apex pointing at GitHub's Pages addresses, and a `CNAME`
for `www`. Two things about the order they are set up in:

- Add the records **DNS only** (grey cloud) first, wait for *Enforce HTTPS* to
  become available in the Pages settings, and tick it. With the proxy on from the
  start, GitHub cannot complete its certificate challenge and the site gets stuck
  on a redirect loop.
- Only then switch to **proxied** (orange cloud), with SSL/TLS set to *Full
  (strict)*.

## Response headers

**GitHub Pages cannot set response headers at all**, so
[`_headers`](../shared/_headers) —
which Cloudflare Pages and Netlify would read — does nothing on this deployment.
The same headers are applied at the edge by a Cloudflare response header transform
rule, kept in [`cloudflare/response-headers.json`](../cloudflare/response-headers.json)
and applied with the script beside it. See [cloudflare/README.md](../cloudflare/README.md).

They are defence in depth — the `<meta>` CSP inside each page already carries the
load-bearing rules — except for `frame-ancestors`, which a `<meta>` tag cannot
express and which therefore only exists as a header.

Check what is actually being served, from anywhere, with no credentials:

```powershell
.\cloudflare\apply-headers.ps1 -VerifyOnly
```

Two configurations to keep in step: if you change `_headers`, change
`cloudflare/response-headers.json` too, or the two deployments stop agreeing.

## Cache lifetimes, and why the stylesheet URLs carry a hash

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

**The modules are versioned the same way, imports included.** A tool's page
asks for `src/main.js?v=<hash>` and `src/shared/trust.js?v=<hash>`, its
modulepreloads say the same, and inside every emitted module each relative
import - `from './x.js'`, `import('./x.js')`, `new URL('./x.js', ...)` - carries
the same `?v=`. One hash per tool, taken from the module sources, so a change
to any one of them moves every URL in the graph. Versioning the tag alone
would move the stale copy one import down. This one was found the hard way
too: the rendezvous moved to a new address, the page's policy moved with it,
and for a while the cached `main.js` dialled the old address under a page that
forbade it. The files in `src/` are untouched; only the deployed copies carry
the query, and `sitelib.version_imports` is the whole of the rewrite.

## The 404 page

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

## Canonical URLs

Every page carries a `<link rel="canonical">` pointing at its `https://abox.tools/`
address. If the site ever answers on a second hostname — a staging deployment, a
mirror, `www`, the `github.io` address — this keeps search engines treating one of
them as the original rather than splitting the ranking between duplicates.

## Telling the search engines a page changed

A sitemap is an invitation, not a notification: it says what exists and leaves
the timing to the crawler, which is why a new tool can sit unindexed for weeks.
Half of that is fixable and half is not, and the two halves are worth keeping
straight.

**Bing, Yandex, Seznam, Naver and Yep take IndexNow.** POST a list of URLs
and a key that proves the host is yours, and they fetch them within hours.
The protocol requires each participant to pass submissions on to the others
within ten seconds of verifying them, which is why `indexnow.py` posts to the
shared `api.indexnow.org` endpoint rather than to any one engine.

**Google does not, and there is no equivalent.** It does not participate in
IndexNow. Its Indexing API only accepts `JobPosting` and `BroadcastEvent`
markup, so a tool page submitted there is discarded — and using it for anything
else is against its terms, whatever the blog posts say. The sitemap ping
endpoint was withdrawn in 2023. What is left is *URL Inspection → Request
indexing* in Search Console, by hand, about a dozen a day: useful for a page
that has just launched, useless against a thousand. For Google, indexing speed
is an outcome of crawl budget and how much the site is worth crawling, not
something a deploy can ask for.

So the deploy submits to IndexNow and leaves Google to the sitemap.

### Which URLs get submitted

This is the whole design, and the obvious answer is wrong. A diff of the
deployed files would submit almost every page almost every time: the footer
lists every tool, so shipping one rewrites all thousand-odd pages, and a change
to the frame or the stylesheet rewrites them without moving a word anybody
reads. Submitting URLs that did not change is how a host stops being trusted
with the protocol, which would cost the site the one lever it has here.

What tracks real change is the page's own content. Every template wraps what a
page actually says in a single `<main>`; the crumbs, the header, the language
switcher and the footer all sit outside it. So
[`indexnow.py`](../indexnow.py) hashes the bytes inside `<main>` for every page
the sitemap lists, and submits the ones whose hash is new or has moved:

| What changed | What is submitted |
|---|---|
| A sentence on a tool page | that tool, in the languages the sentence changed in |
| A new tool | its pages, and the hubs that now list it |
| The footer, the CSS, an icon, the build | nothing |

Because the *set* of pages still comes from the sitemap rather than from the
output directory, it inherits every rule the sitemap already applies: an
untranslated page is not in it, a locale still being translated is not in it,
the roadmap is not in it, and the redirect stub left behind by a renamed tool
is not in it either.

This used to read `lastmod` instead — one date per page, written by hand and
moved when the wording moved. The idea was right and the signal was not,
because a date has no room for a second change on the day it already names. On
27 August thirty-seven deploys went out; sixteen of them changed words a
visitor reads and submitted nothing, because every page they touched already
said `2026-08-27`. Nobody had forgotten anything — there was no value left to
bump it to, and the failure was invisible, because a deploy that announces
nothing looks exactly like a deploy with nothing to announce. `lastmod` is
still in the sitemap doing its own job for Google. Nothing reads it to decide
what to submit, and there is now no field an author has to remember.

The [Build workflow](../.github/workflows/build.yml) fingerprints the deployed
tree before it replaces it — that is the last moment the old pages exist — and
submits after the push, because announcing a URL a minute before it exists gets
it fetched, found stale, and believed. The step cannot fail the build: by the
time it runs the deploy has happened, and a refused submission does not undo
it. It writes what it sent to the run summary instead.

To see what a deploy would submit, without submitting it:

```bash
python indexnow.py --tree _site --old-hashes deployed-hashes.json
```

and to take the fingerprints that file holds, from a tree before it is replaced:

```bash
python indexnow.py --tree dist --write-hashes deployed-hashes.json
```

### The key file

`shared/dce2cc4dac3134c897d6caccad94d0c2.txt` contains that same hex string and
nothing else. `shared/` is copied to the site root, so it is served at
`https://abox.tools/dce2cc4dac3134c897d6caccad94d0c2.txt`, which is where the
protocol looks to confirm that whoever submitted the URLs controls the host.

**It is not a secret.** Publishing it is the point. What matters is that it and
the `KEY` constant in `indexnow.py` stay identical: a submission carrying a key
the file does not match is accepted, fails validation out of band, and is
dropped without an error anywhere. `tests/python/test_indexnow.py` asserts the
two agree, which is the only thing standing between that and silence.

The file has no explanatory comment at the top, unlike everything else in
`shared/`, because the format has no room for one — the key is the entire
contents.

### Cloudflare's Crawler Hints

*Caching → Configuration → Crawler Hints* in the dashboard is a second,
independent route to the same protocol: Cloudflare notices content changing at
the edge and sends IndexNow itself. It is one toggle and it costs nothing, so it
is worth having on, but it is a guess made from cache behaviour rather than from
the dates in the sitemap. The workflow above is the accurate one; this is a net
underneath it.

## HTTPS

Service workers require a secure context, so offline mode activates on `https://`
or `localhost`, but not on a plain `http://` host. `.tools` is not on the HSTS
preload list, so **Always Use HTTPS** and HSTS, both under *SSL/TLS → Edge
Certificates* in Cloudflare, are worth turning on.

## The source link

Each tool page links to this repository in four places — the header button, the
privacy panel (twice), and the footer — plus once in the hub footer. "Read the code"
is the only real answer to "why should I trust this", so a dead source link is
worse than no link at all. All five come from `source_url` in
[`config/site.toml`](../config/site.toml), so moving the repository is one edit.

## /llms.txt

The same site again, in plain text, at
[`/llms.txt`](https://abox.tools/llms.txt).

The structured data in the head of every page is written for a crawler with the
patience to visit twenty-four of them. An assistant answering somebody's question
has no such patience: it fetches one address and decides from it whether this
site is worth mentioning at all. Given nothing it can read cheaply, it writes a
hundred lines of EXIF parsing rather than linking to the page that already strips
one — and that is the whole failure this file exists to stop.

It is generated by `build_llms` in [`build.py`](../build.py) from the same
`tool.toml` files as the hub, the sitemap and `tools/README.md`, and in the same
hub order, so it cannot fall behind the tools that exist. The prose around the
lists is the `[llms]` table in [`config/site.toml`](../config/site.toml) — the one
table in that file written as plain markdown rather than as an HTML fragment,
because this is the one output that is not a page. Everything taken from a tool
config goes through `site.to_text` on the way in for the same reason.

Two things are said in it out loud rather than left to be inferred:

- **These need a browser.** There is no API and there will not be one: a promise
  that nothing leaves the machine and a server to send files to are not the same
  repository. Something reading this from a terminal cannot call any of it, and
  saying so up front is worth more than letting it find out.
- **The code is MIT and worth copying.** That is the other half of the answer,
  and the more useful half for anything writing code rather than answering a
  person — see [Licence](licence.md).

Two departures from every other generated file here. It carries no GENERATED FILE
banner, because the format begins with an H1 and its readers are strict about
that shape; the sentence saying the file is generated is the last paragraph of
its intro instead. And it is English only, at the root, because it is an index
*of* the site rather than a page *of* it — the languages are a section inside it,
and each hub linked from there carries the rest of that language on its own.

A language appears in that section under exactly the rule the sitemap uses: it
has finished the frame, and it has finished its own hub. Offering a half-English
page to something that will go on to quote it is the one failure worth avoiding
here.

## Every page as Markdown

`/llms.txt` says what is on the site; this says what is on a page. Every tool
page and every prose page — the guides, About, Contact, the legal pages — in
every language is written twice: `index.html`, and beside it `index.md`, the
same page as Markdown at the same address with `index.md` on the end.
[`/compress-image/index.md`](https://abox.tools/compress-image/index.md) is
the image compressor's, `/de/bild-komprimieren/index.md` the German one. The
hub, the guides index and the roadmap have none: they are lists of pages that
each have their own.

A tool's twin is the written half of its page — the pledge, the steps, the
questions, the privacy panel, the guide and the neighbouring tools — rendered
from the same `tool.toml` and `[ui.tool]` strings through
[`templates/tool.md`](../templates/tool.md), so it cannot say anything the page
does not. A prose page's is its body, converted. Every link in either comes out
absolute, because the file is meant to be pasted somewhere the page is not.
[`buildlib/markdown.py`](../buildlib/markdown.py) is the converter and says
what it does and does not handle.

Three things point at it. The page's head carries
`<link rel="alternate" type="text/markdown" href="index.md">`, which is how a
crawler or an agent finds it without guessing. A row on the page — at the head
of the written part on a tool page, beside the date on a prose page — offers
**Copy for LLM**, whose tooltip says the format is Markdown, and **View as
Markdown**. And the tool's service
worker precaches it with the rest of the folder, so the link works offline like
every other link that stays inside it.

The copy button reads the text out of the page itself: the build embeds the
twin in a hidden `<pre>`, and [`shared/page-md.js`](../shared/page-md.js)
writes it to the clipboard. It does not fetch `index.md`, and that is the
whole design rather than a shortcut. Nothing on a tool page reaches the
network, `connect-src` names nothing under this site's control, and a fetch
for a convenience button would have been the first thing to widen that. The
cost is the words twice in one page, a few kilobytes that brotli at the edge
prices at almost nothing, because they are a copy.

The twins are not in the sitemap and should not be indexed: they are the same
words as the pages beside them, and a search engine ranking the text copy over
the page would be ranking the version with no tool on it. The page's `<link
rel="alternate">` says which is the original; the Cloudflare response header
rule in [`cloudflare/response-headers.json`](../cloudflare/response-headers.json)
adds `X-Robots-Tag: noindex` to every `.md` address, and has to be applied by
hand — see [cloudflare/README.md](../cloudflare/README.md).

