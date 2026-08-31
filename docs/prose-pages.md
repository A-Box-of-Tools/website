# The prose pages

[← README](../README.md)  ·  see also [The guides](guides.md)

`pages/` holds everything that is neither the hub nor a tool. There are three
kinds, and they differ only in where they are meant to be read.

```
pages/privacy/                      kind = "legal"
  page.toml    slug, nav label, title, description, dates, share-card text
  body.html    the <main> - sections of prose and nothing else
pages/guides/trim-a-video/          kind = "guide"
  page.toml    the same, plus `published`, `group`, and usually `tool`
  body.html    the same
pages/about/                        kind = "site"
  page.toml    the same, plus `schema_type` - AboutPage or ContactPage
  body.html    the same
```

Each kind gets the site frame, the site's Content-Security-Policy unchanged,
and an entry in `sitemap.xml`. None gets a service worker, because there is
nothing here worth keeping offline, and none gets a web app manifest, because
an installed page of prose is still a page of prose. So none carries what a
tool page adds to the policy for those two: `blob:` in `img-src`, for previews
made in the page, and `manifest-src`.

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

A **site** page is About or Contact: the two pages whose subject is the
publisher rather than a tool. In the footer, the sitemap and `llms.txt` they sit
between the other two kinds, and they carry `AboutPage` or `ContactPage`
structured data pointing at the same `Organization` node the hub publishes — so
who is behind this is declared once and referred to, rather than restated in
four places that can disagree. No breadcrumb, for the reason the roadmap has
none: the trail would be the hub and then this page, and the site mark in the
header already offers that journey.

`schema_type` is named in the file rather than derived from the slug, and that
is not fussiness. The slug is translated in every locale — `ueber-diese-seite`,
`chi-siamo`, `소개` — so deriving one from the other would have worked in
English and quietly stopped working in the other fourteen languages.

Why the kind exists at all: a site carrying dozens of tools that never says who
made any of them reads as nobody's. Every claim on every tool page is a claim
somebody is making, and a reader deciding whether to believe it is entitled to
know who, and why. It is also the first thing an ad network's review looks for,
and its absence is most of what "low-value content" means about a site whose
content is plainly not thin.

**These pages get the same CSP as everywhere else, and that is the point.**
Written by hand, they carried a narrowed copy that left out the donate button's
two origins, on the reasoning that a page which never draws the button should
not name them. That is a defensible argument and it is also exactly the kind of
argument that produces four policies which disagree. One list in one file ends
it. If the difference ever matters enough to want back, it belongs in
`config/site.toml` as a `[page_csp]` table the way `[tool_csp]` already works —
not as a hand-edit.

## What is in them, and what is not

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
- **The governing-law clause now names Ontario.** It used to say "the laws of
  Canada and of the province in which the site is operated", left open rather
  than guessed at. It is closed now, and closed in all fifteen languages: a
  clause that is precise in English and vague everywhere else is worse than one
  that is vague everywhere, so editing it means editing
  `locales/*/pages/terms.html` in the same commit, and moving the page's
  `updated` and `lastmod` with it.

