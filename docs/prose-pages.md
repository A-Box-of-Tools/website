# The prose pages

[← README](../README.md)  ·  see also [The guides](guides.md)

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
nothing here worth keeping offline, and neither gets a web app manifest, because
an installed page of prose is still a page of prose. So neither carries what a
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
- **The governing-law clause names Canada but not a province.** It says "the
  laws of Canada and of the province in which the site is operated". Naming the
  province outright is one line in `pages/terms/body.html` and makes the clause
  easier to rely on; it was left open rather than guessed at.

