# Image to Data URI

Lives at `/image-to-data-uri/`. Takes a picture and gives back the line of text
that puts it inside a stylesheet, a template or a README, with no request for it
at runtime.

It is the smallest tool here by a wide margin, and the only one that does not
touch a pixel. Everything else in `tools/` decodes an image and encodes it
again; this one copies the bytes and changes how they are written down. That
single difference is where all of its interesting decisions come from.

## The two encodings, and why there are two

`src/encode.js`.

**Base64** for anything that is not an SVG, because the bytes of a PNG are not
text and a URL can only carry text. It costs a third — three bytes in, four
characters out — and there is no way around that; it is the price of writing
arbitrary bytes with the characters a URL permits.

**Percent-encoding** for SVG, because an SVG *is* text and base64 would be the
wrong trade twice: it pays the same third for nothing, and it turns a stylesheet
you could read into a wall of letters. Five characters have to be escaped and
the rest are left alone:

| | why |
|---|---|
| `%` | starts an escape, so it has to escape itself first |
| `#` | starts a fragment; a browser drops everything after it |
| `<` `>` | not legal in a URL, and `<` would close the attribute in HTML |
| `"` | would close the quotes every shape in this tool writes |

Plus control characters and anything non-ASCII, as UTF-8. On a typical icon the
result is around a fifth shorter than base64 and still legible.

Spaces are deliberately *not* escaped. An SVG is mostly spaces — between every
attribute and every number in a path — and `%20` costs three characters for each
one. They are legal inside a *quoted* URL, which is why every shape this tool
produces quotes the URI rather than leaving it bare. That is a real constraint
on `src/shapes.js`, not a stylistic preference: `url(data:...)` unquoted breaks
on the first space in the path data, and it breaks by rendering nothing.

Nothing is minified, reordered or tidied on the way through. Whitespace inside a
`<text>` element is content, and an SVG that has been "optimised" between the
file on disk and the stylesheet renders differently from the file on disk, which
is exactly the surprise a tool at this end of the job should not be producing.
`decodeURIComponent` of the output is the input, byte for byte, and
`tests/js/data-uri-encode.test.js` holds that.

`base64()` builds its input string in 32 KB chunks. The obvious
`String.fromCharCode(...bytes)` passes one argument per byte and overflows the
call stack somewhere around a hundred thousand of them; a photograph is several
million.

## Reading the type out of the file

`src/sniff.js`.

A data URI carries its own media type and the browser believes it. Get it wrong
and the picture does not render — no fallback, no console message worth reading,
just a broken image in a page that was fine a minute ago. The two obvious
sources for the type are both unreliable: an extension can be renamed, and
`file.type` is the platform's guess, empty for anything unregistered and often
wrong for SVG.

So the type is read from the first bytes, which say what the file is
unambiguously in every format here: PNG, JPEG, GIF, WebP, BMP, ICO, AVIF, HEIC,
JPEG XL and TIFF by signature; SVG by finding `<svg` past whatever preamble a
drawing program left in front of it — a byte-order mark, an XML declaration, a
doctype, comments, in any order.

When nothing matches, the file is **refused** rather than guessed at. A wrong
guess produces a URI that fails in the visitor's page instead of in this one.

When the extension and the bytes disagree, the bytes win and the page says so.
`extensionType()` exists only to make that disagreement sayable out loud.

HEIC and TIFF get a note attached: they produce perfectly valid data URIs that
no browser except Safari will draw. That is worth saying before somebody pastes
one, because the failure looks like a bug in the URI and is not.

## The metadata warning

`src/metadata.js`.

This is the part that only matters here. Every other tool on this site throws
metadata away as a side effect of re-encoding. This one copies the file exactly,
so a phone photograph's GPS fix travels into the stylesheet with it — and from
there into a repository, and into a page served to everybody.

The walkers are deliberately shallow: they find the blocks and add up their
sizes. They parse no tags, because the question the page is answering is "there
is metadata in here, this much of it, of these kinds", and reading the tags is a
different tool — [`exif-editor`](../exif-editor/).

- **JPEG** — walks the marker segments in front of the scan. APP1/`Exif\0\0`,
  APP1/XMP, APP2/ICC, APP13/Photoshop, and `COM`. JFIF (APP0) is deliberately
  *not* counted: fourteen bytes saying the file is a JPEG in the usual way,
  present in almost every JPEG, and reporting it would train people to ignore
  the warning that matters.
- **PNG** — walks the chunks: `eXIf`, `tEXt`/`iTXt`/`zTXt`, `iCCP`, `tIME`. An
  `iTXt` whose keyword is `XML:com.adobe.xmp` is named as XMP rather than as
  text, because that is where an editor puts the things people expect EXIF to
  hold.
- **WebP** — walks the RIFF chunks for `EXIF`, `XMP ` and `ICCP`, remembering
  that every chunk is padded to an even length and the pad is not in the size.

`metadata()` returns `null` for every other format, and `null` means **not
inspected**, which the page is careful never to render as "clean".

## What the page is shaped like

`body.html` is three cards: choose, say where it is going, copy. There is no
"convert" button, because encoding is instant and a button would be waiting for
nothing.

`src/shapes.js` holds the five destinations — bare URI, CSS rule, CSS custom
property, `<img>` tag, Markdown — as ids and file extensions only. What each one
is called and what it is for is written in `body.html` beside its radio button,
because a string in a module is a string no locale file can reach.

Two details in there earn their keep:

- **`identifiers()`** turns `Logo Final (2).PNG` into `logo-final-2`, and makes
  duplicates distinct. Two files that reduce to the same class name is a silent
  failure: the second rule wins and one of the pictures never appears.
- **`size()`** puts `width` and `height` on the `<img>` tag, and leaves them off
  an SVG. An SVG carrying only a `viewBox` has no pixel size of its own; the
  browser reports the 300×150 default, and writing that onto the tag would pin a
  scalable picture at a size nobody chose.

The `alt` is always empty. Only the person pasting it knows whether the picture
carries meaning, and a description guessed from a file name is worse for
somebody using a screen reader than no description at all. The page says that
where the choice is made rather than in the FAQ.

## Two things in `main.js` worth knowing

**The preview is the check.** Each result's thumbnail is an `<img>` pointed at
the data URI this page just built — not at the file. So it renders because the
URI is correct, and a URI that does not render is reported as not rendering
rather than as a picture of a known size. The same load supplies the pixel
dimensions, which is why `measure()` reads them off that image and not off the
original.

**Only `SNIPPET` characters are drawn.** A 4 MB photograph is 5.6 million
characters, and putting that many into an element makes the browser lay out a
wall of text nobody will read, on every redraw. The whole string is always what
gets copied and downloaded; the element holds the first 1200 and a button that
fills in the rest on request.

The URI itself is cached per item against the one setting that can change it
(base64 or not, and only for SVGs), because a 12 MB photo is a 16 MB string and
every redraw would otherwise build it again.

## What it does not do

It does not compress, resize or convert. A picture that is too big to inline is
too big to inline, and the honest answer is to make it smaller with the
[Image Compressor](../compress-image/) or the [Image Resizer](../resize-image/)
first — which is what the page says, next to the number that shows it.

`src/files.js` holds the thresholds behind that advice. They are round numbers
where the recommendation changes, not measurements: nothing different happens in
a browser at 10 KB. The reasoning is in the comment above `verdict()` and the
longer version is in the guide,
[`pages/guides/embed-an-image-in-css`](../../pages/guides/embed-an-image-in-css/).
