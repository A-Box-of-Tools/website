# Languages

[← README](../README.md)

The site is written in English and served in as many languages as have been
translated. English keeps the addresses it has always had - `/compress-image/`
- and every other language sits under a prefix with slugs of its own:
`/de/bild-komprimieren/`.

The slug is translated on purpose, and it is the reason this is not simply
`/de/compress-image/`. A slug is the one part of a page's markup that is also a
keyword, and a German reader looking for this tool types "bild komprimieren".
Leaving the English word in the URL throws that away in every market except the
one the site was written for.

## What a locale is, and what it is not

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

## Half-translated is allowed, and is never advertised

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

## The language a first-time visitor gets

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

## Adding a language

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

## The strings in the JavaScript

Nothing under `shared/js/` or `tools/<slug>/src/` is translated. The build
copies both byte for byte into every language, so a sentence written in a
module is that sentence in English at ten of the eleven addresses its page has.

The answer is not to translate the JavaScript. It is to keep the words out of
it. HTML already goes through the locale machinery, so a sentence held in the
markup is a sentence a translator can already reach, with no new file format
and nothing new for the build to learn. `shared/js/phrases.js` reads them back
out:

```html
<div id="phrases" hidden aria-hidden="true">
  <span data-phrase="status.broken">That file could not be opened as a
    picture.</span>
</div>
```

```js
import { phrase } from './shared/phrases.js';

el.error.textContent = phrase('status.broken');
el.picker.textContent = phrase('reading.many', { count: files.length });
```

Two blocks are looked up, in this order: `#phrases`, which is the tool's own
and lives in its `body.html`, and `#frame-phrases`, which is the frame's and is
filled in from `[ui.tool]` in `config/site.toml`. The tool's own wins, which is
what lets `heic-to-jpg` say something sharper about being cached offline than
the generic line without every other tool having to care. A key nothing defines
comes back as the key: one of the callers is the window's own `error` handler,
and a lookup that could throw there would replace a legible failure with an
illegible one.

The indentation is collapsed, so a phrase may be wrapped across lines like any
other markup — except in Japanese and Chinese, where it may not. Those
languages put no space between words, so a line break inside a sentence arrives
as a space inside a sentence, and nothing downstream can tell it from one
somebody meant. Keep a `ja` or `zh` phrase on one line. Korean wraps freely; it
has spaces to wrap at.

A module too deep to reach the page returns a **key** rather than a sentence,
and whoever has the DOM resolves it — `qr-barcode-reader/src/camera.js` is the
worked example. That also keeps the module unit-testable: a key is a value to
assert on, and a translated sentence is not.

**Done:** the frame's seven, in all ten languages — the four "Offline:" lines,
what the window's error handlers say, and the drop zone's "Reading 3 files…".
They used to be written out twenty-nine times, once per `main.js`.

**Left:** about 340 sentences, in 454 places, all of them a tool's own. The
live-check line is the pick of them, because it is nearly the same sentence in
every tool and differs only in the noun.

Two decisions already taken, so they need not be taken again:

* **everything a visitor can read gets translated**, parser failures included.
  `main.js` prints `error.message` verbatim after its own sentence, so a
  half-translated failure is a German page with an English clause in it;
* **EXIF tag names stay in English.** They are the bulk of `exif-editor`'s
  strings and they are identifiers, not prose — people cross-reference them
  against ExifTool, Lightroom and Windows' own properties dialog, and
  localizing the obscure ones makes the tool harder to use rather than easier.

This is the one part of the translation that cannot be checked by reading the
output. It has to be exercised in a browser.

