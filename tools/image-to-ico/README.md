# Image to ICO

*One picture in. Every size a browser, Windows or a Mac asks for, out.*  ·  lives at `/image-to-ico/`  ·  [all tools](../)  ·  [how the site is built](../../README.md)

Takes a picture and writes a real multi-size icon: the same logo drawn again at
each size the thing reading it will ask for, wrapped in the small header that is
all an icon file actually is. Two containers, because the two desktop platforms
do not share one — a Windows `.ico` and a macOS `.icns` — plus the PNGs and text
files a website needs beside them.

It is a container tool, in the same family as [Images to PDF](../images-to-pdf/).
The browser does the one lossy part — scaling the picture — with the canvas it
already ships with, and `src/ico.js` and `src/icns.js` write the headers around
the result. There is no encoder to vendor and no network step, which is why the
page can promise what it promises.

---

## Why the sizes are the product

The interesting decision in an icon tool is not the format, it is **which sizes
go in**, and that is not a matter of taste. A browser reads three of them out of
a `favicon.ico`. Windows asks an application for four and resamples the rest.
A high-DPI laptop asks for five more that only exist because the shell draws at
125% and 150%. Nothing reads a size nothing asked for, and every size that goes
in is a whole extra picture in the file.

So `src/sizes.js` is the centre of the tool rather than a lookup table at the
edge of it. Every size carries the reason something wants it, in the same object
as the number:

```js
{ px: 48, why: 'Explorer’s medium icons, and what Google reads a favicon at' },
```

That line is what the page shows beside the checkbox. Keeping the two together
is deliberate: a number and its justification written in two different files is
how a "complete" icon set ends up at eleven entries, 400 KB, and nine of them
doing nothing.

The four presets are the four jobs people actually arrive with — a website, an
application, an application that has to look right on a 4K laptop, and a file
that has to open in something written twenty years ago — and each has a
different right answer.

---

## The format, and the parts of it that fail silently

`src/ico.js`. An `.ico` is six bytes of header, sixteen bytes per image, and
then the images. About two hundred lines including the comments, and worth
reading, because almost nothing about this format tells you when you get it
wrong. Windows does not report a broken icon: it draws nothing, or it draws the
bottom half of one, or it puts a black box where the transparency was — and all
three look like a problem with the picture rather than with the file around it.

Four things fail that way, and each has a test in
[`tests/js/ico.test.js`](../../tests/js/ico.test.js):

| | |
|---|---|
| **256 is written as zero** | The width and height fields are one byte each, so 256 does not fit. Zero means 256, and it is also the ceiling: an `.ico` holding a 512-pixel image is not a bigger icon, it is a broken one |
| **The DIB height is doubled** | A DIB inside an icon holds two bitmaps stacked — the colour image, then the mask. Writing the real height produces an icon that draws as its own bottom half |
| **The rows go in bottom-up** | Get it wrong and the icon is upside down, at 16 pixels, in a taskbar, where about half of all logos look plausible either way |
| **The mask is not optional** | A 32-bit entry carries alpha, so the one-bit mask says nothing new. It is still required, and a reader old enough to ignore the alpha is exactly the one that will draw a black box without it |

The mask is derived from the alpha channel at a cutoff of 128 rather than at
"any alpha at all", so a soft edge lands somewhere sensible rather than
dissolving.

### PNG entries, and why they are not the default everywhere

An entry is stored one of two ways: a whole PNG file copied in, or a Windows
DIB. PNG entries are three to ten times smaller at 256×256, and Windows only
learned to read them in Vista. XP, and a fair amount of installer and shell
tooling that parses icons itself, sees a PNG entry as a corrupt one and shows
nothing.

The default is neither, it is the split: DIB up to 64 pixels, PNG above. A DIB
is uncompressed, so its size is arithmetic — `dibBytes()` in `src/sizes.js` —
and the numbers make the argument on their own:

| Size | As a DIB |
|---|---|
| 16×16 | 1,128 bytes |
| 32×32 | 4,264 bytes |
| 64×64 | 16,936 bytes |
| 128×128 | 67,624 bytes |
| 256×256 | 270,376 bytes |

Below 64 the saving from PNG is a few kilobytes nobody will notice; above it,
it is the difference between a 30 KB icon and a 300 KB one. Both extremes are
still available on the page — "PNG for every size" is the smallest file there
is, "uncompressed for every size" is what opens in anything — because which
trade is right depends on what the icon is for, and that is the visitor's
question rather than this file's.

---

## The other container: `.icns`

`src/icns.js`. macOS reads a different file for the same job and will not look
at an `.ico`, so the second format is not a nicety — it is the difference
between the tool serving one desktop platform and both.

It is the mirror image of the `.ico` beside it, and reading the two files next
to each other is the fastest way to understand either:

| | ICO | ICNS |
|---|---|---|
| Byte order | little-endian | big-endian |
| Finding an image | a directory at the front | no directory; elements end to end |
| Identifying one | a size in the entry | a four-letter type that implies the size |
| Payload | raw pixels **or** PNG | PNG (or JPEG 2000, which no browser writes) |
| Largest | 256 | 1024 |

**The sizes are not a choice, and that is the interesting part.** Apple
publishes exactly ten slots, and a Mac asks for the one it wants by type rather
than by size:

| Type | Pixels | Iconset name |
|---|---|---|
| `icp4` | 16 | `icon_16x16` |
| `ic11` | 32 | `icon_16x16@2x` |
| `icp5` | 32 | `icon_32x32` |
| `ic12` | 64 | `icon_32x32@2x` |
| `ic07` | 128 | `icon_128x128` |
| `ic13` | 256 | `icon_128x128@2x` |
| `ic08` | 256 | `icon_256x256` |
| `ic14` | 512 | `icon_256x256@2x` |
| `ic09` | 512 | `icon_512x512` |
| `ic10` | 1024 | `icon_512x512@2x` |

Three sizes appear twice, and the duplicates are real: 32 pixels is both "the
32-pixel icon" and "the 16-pixel icon on a Retina display", and macOS picks
between them by type. So ten slots hold seven distinct pictures, and `makeOne()`
encodes each PNG once and hands the same bytes to both slots that want it.
There is no 64-pixel slot of its own and no 16-pixel Retina slot beyond `ic11`;
adding sizes Apple does not name would make a bigger file that nothing reads.

Two fields carry the whole format and both are easy to write plausibly wrong:
the length in the header counts the header, and the length on **every element**
counts that element's own eight bytes. Get the second wrong and a reader lands
eight bytes short of the next type, reads four bytes of PNG as a type name, and
everything after the first element is rubbish. Both have tests.

**There is no `TOC ` element.** `iconutil` writes one — an index of the types
and lengths that follow — and it is an optimisation rather than part of the
format: a reader without one walks the elements end to end and arrives at the
same answer. A wrong index is worse than no index, so it is left out and said
out loud rather than half-written.

### Drawing once for both

The two formats overlap at 16, 32, 128 and 256, and `.icns` asks for 32 twice.
Rendering per output would draw the same square up to three times, so
`makeOne()` works from `everySize()` — the union of what every ticked output
wants — draws each square once, and encodes each PNG at most once behind a
small cache. With both formats and the website set ticked that is 11 renders
instead of 24.

---

## Scaling, and why it is done in steps

`src/render.js`. An icon is an extreme downscale: a 1024-pixel logo going to 16
is throwing away 99.98% of the pixels. Asked to do that in one `drawImage`, a
browser samples a small neighbourhood around each destination pixel and ignores
everything between, so thin strokes fall between the samples — the letters in a
wordmark go from grey to gone depending on where they happened to land.

`stepDown()` halves repeatedly until the last step is a factor of two or less,
which means every source pixel is read at every stage. It costs a handful of
small canvas draws and it is the difference between a legible 16-pixel icon and
a smudge.

### An SVG never takes that path

A vector has no pixel size, and rasterising it once at whatever size it happens
to declare would make everything after it a scaled photograph of a vector — a
100-pixel SVG asked for a 256-pixel icon coming back blurred, which is the one
thing using a vector was meant to avoid.

So an SVG is deliberately kept as an `<img>` rather than an `ImageBitmap`: the
browser re-rasterises it at the size of every `drawImage`, so each entry in the
icon is drawn from the vector at its own size and is sharp all the way up. An
SVG that declares no size at all is treated as a square of `NOMINAL_VECTOR`
(1024) and left to letterbox itself inside the square, which is what padding
would have done anyway.

---

## The website set

An `.ico` covers browsers and Windows and nothing else. An iPhone home screen
reads a 180-pixel PNG by a name of its own, Android and every install prompt
read a web app manifest, and a tile pinned to the Start menu reads an XML file.
None of those will look inside an `.ico`, so a tool that stops at the icon has
done about half the job somebody making a favicon actually has.

`src/pack.js` is the other half: seven PNGs, `site.webmanifest`,
`browserconfig.xml`, the `<head>` block to paste, and a note saying what each
file is for. Two of them break the general rule on purpose, and both say so in
the code:

- **The Apple touch icon is drawn opaque.** iOS composites it onto its own tile
  and turns transparency into black. Everything else in the pack keeps its alpha.
- **The maskable icon is drawn small.** An Android launcher crops an adaptive
  icon to whatever shape it likes — circle, squircle, rounded square — and only
  the middle 80% survives, so it is rendered with a 10% inset.

The snippet does **not** carry a `<link>` for `favicon.ico`. Every browser asks
for that address whether or not the page mentions it, and naming it as well is
how a site ends up serving the same file twice.

---

## The preview is the feature

`drawPreview()` in `src/main.js` draws every chosen size at its **real pixel
size** on screen, on a CSS checkerboard so that transparency reads as
transparency. Nothing is scaled up for display, because a 16×16 icon shown at 64
tells you nothing about whether the 16×16 icon works.

This is the only thing on the page that cannot be replaced by reading the
settings back out. Whether a logo survives being sixteen pixels across is not a
question anybody can answer from a number, and the usual answer — a wordmark
padded into a square is about three pixels tall and unreadable — is one people
need to *see* before they publish it.

The finished file is described the same way: the list of sizes beside a result
is read back out of the bytes that were just written, by `readIcoDirectory()`,
rather than copied from the plan that produced them. If the writer ever
disagreed with the settings, the page would say so instead of the visitor
finding out when Windows drew nothing.

---

## Limitations

- **256 pixels is the ceiling in an `.ico`**, and no tool can lift it. For
  anything larger the answer is a PNG, or the `.icns`, which goes to 1024.
- **The `.icns` is not verified against a real Mac** from here. Every slot is
  checked to be a decodable PNG of the size its type promises, and the file
  walks back through its own reader, but the last word on whether Finder likes
  it belongs to Finder.
- **No cursors.** Type 2 in the same header is a `.cur`, which needs a hotspot;
  the reader here refuses one rather than describing it as an icon.
- **No palette entries.** Everything written is 32-bit. The 4-bit and 8-bit
  formats an `.ico` can also hold exist for machines that could not display more,
  and reproducing them well would mean a colour quantiser for no living reader.
- **HEIC in, on most browsers.** Same limit as everywhere else here: only Safari
  decodes it natively. See "What needs a vendored FFmpeg" in the repository
  README.

---

## Testing it

[`tests/js/ico.test.js`](../../tests/js/ico.test.js) covers the ICO writer at
the byte level — the header, the offset in every directory entry, 256 as zero,
the doubled height, the bottom-up rows, the BGRA order, the mask bits and their
padding — plus a round trip that reads the pixels back out of a DIB by hand and
compares them with what went in. It also checks the tables: that no preset asks
for a size the tool does not offer, that every size carries its reason, that the
manifest is JSON pointing only at files the pack contains, and that the snippet
does not link `favicon.ico`.

[`tests/js/icns.test.js`](../../tests/js/icns.test.js) does the same for the
ICNS writer: the magic, the big-endian length that counts itself, the per-element
length that counts its own header, the absence of padding between elements, and
a walk back out through `readIcnsElements`. It also pins Apple's table — ten
types, no duplicates among them, every `role` name agreeing arithmetically with
its pixel count, and the three sizes that legitimately appear twice.

The scaling is not tested, and deliberately: it needs a real `<canvas>`
attached to a document, and faking one well enough to be worth the trouble means
testing the fake. See [`tests/README.md`](../../tests/README.md).

```bash
node --test "tests/js/ic*.test.js"
```
