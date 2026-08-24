# Deploying

[← README](../README.md)

The site is one domain, `abox.tools`. It is served by **GitHub Pages** from the
`dist` branch of this repository, behind **Cloudflare's proxy**.

```
push to main  ->  GitHub Action runs build.py  ->  dist branch

visitor  ->  Cloudflare (DNS, TLS, response headers)  ->  GitHub Pages (dist branch)
```

`main` holds the sources. `dist` holds the built site, and nothing else: it is
written only by [the Build workflow](../.github/workflows/build.yml), never by
hand. A pull request builds without publishing, so a change that breaks the
build is caught before it can reach `main`.

To see what would be deployed before pushing, run `python build.py` and look at
`dist/`. To check that what *is* deployed matches these sources, run
`python build.py --check`, which diffs a fresh build against the `dist` branch.

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

