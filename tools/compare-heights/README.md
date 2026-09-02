# Height Comparison Chart

[← all tools](../) · [the page](https://abox.tools/compare-heights/)

A list of people and objects with a height each, drawn side by side on a ruler,
downloadable as a PNG or an SVG. There is no file in and no file out that the
visitor did not ask for, no account, and no network step of any kind. Every
person on the chart is public-domain artwork that ships with the page; the
rectangle is the only thing the code draws itself.

The tool it is modelled on — and the reason people look for one at all — puts
the whole list into the address bar so a chart can be shared by link. This one
does not, and the FAQ says why: the list is names of children and how tall each
of them is, and a link carrying that is a link logged by whatever it travels
through. The answer here is that you download the picture and send that.

## Why it is built the way it is

### Every person is drawn artwork

The man, the woman, the boy and the girl are artwork by other people:
`src/traced.js` carries their path data and `vendor/` carries the four files it
came out of, with `vendor/LICENSE.md` naming who drew each one. People drew
those, and it shows — clothes, a pose, hair, the shape of a shoe on a floor.
Nothing on the chart is a silhouette this repository invented.

**The licence mattered more than the drawing.** The artwork ends up inside a
picture the visitor downloads and puts in a report, and the page tells them
they may use it for anything with no strings. Every well-drawn free icon family
— Font Awesome, Material, Phosphor — is CC BY or Apache, which would quietly
attach an attribution requirement to a chart somebody made of their own family
and make that sentence false. CC0 and public domain attach nothing to anything.
That is the whole reason these four, which took a search, rather than the sets
that were sitting there.

`chart.js` places drawn and built figures with the same one line, because a
drawn figure carries an `inner` transform — its own bounding box mapped onto
the unit box every built figure already lives in. The alternative was rewriting
the vendored coordinates, which would have ended the as-published claim.

### The man is smoothed, and the smoothing is re-derived by a test

His original is a photograph traced by hand: forty-six thousand characters of
path, an edge that visibly shakes wherever the photo had a shadow, and fifteen
specks of stray ink that are not part of the man. At the size a height chart
draws him that reads as a bad scan.

`scripts/smooth-outline.mjs` walks the outline at even spacing, averages each
sample with its neighbours and lays a Catmull-Rom spline back through the
result — 46,390 characters in, 21,339 out, one subpath kept, and the aspect
ratio moves by three thousandths. Averaging is what forgets the wobble; even
spacing is what stops the averaging pulling harder wherever the tracer happened
to put more points.

It is deliberately **not** a browser routine. `getPointAtLength` would do the
walking for free and then only a browser could check the answer — and checking
the answer is the entire point. `tests/js/compare-heights-traced.test.js` runs
the same function over `vendor/` on every test run and fails unless the result
is exactly what `traced.js` ships, so the derived file cannot quietly stop being
derived. `scripts/smooth-figure.mjs` is the same thing as a command, for when a
figure is added or upstream republishes one.

### There is nobody smaller than the boy and the girl

Because nobody has drawn one and released it. Wikimedia Commons has exactly one
usable free child — the girl — and NIH BioArt the boy; below school age the
search comes back empty, and every coherent free family of people is a restroom
pictogram about four and a half heads tall at *every* age.

A toddler built here from a table of body proportions stood on the chart for a
while. The table was the right idea — **a small person is not a scaled-down
large one**, a two-year-old is about four and a half head-heights tall and an
adult seven and a half — but it was the only figure nobody had drawn, and next
to four that somebody had it looked exactly like that. It is gone, along with
the two hundred lines that built it: `roundedLoop`, `mirrored`, the proportion
tables and the outline walker.

The age argument survives without it, and in a better place: the boy and the
girl are drawings of actual children, so the chart never has to make the
mistake in the first place. For anybody smaller, set one of them to the real
height — the ruler carries the comparison.

### Every row arrives with a height in it

`defaultCm` lives on the figure, in `traced.js`, because it belongs to the
figure rather than to the interface. Adding a person therefore draws somebody
instead of an empty row waiting to be filled in, and the tool opens as a chart
rather than as a form. Changing a row's figure moves the height with it, but
only while the height is still the one that arrived — a number somebody typed
is theirs.

The other half of that: an empty height box is now an **error**, in red, where
the reading would have been. It used to be a neutral hint, on the grounds that
a row you have not filled in yet is not a mistake. Now that every row arrives
with a height, an empty one is a box somebody cleared, and a row that will not
be drawn should say so.

### A picture goes on as itself; a drawing is rebuilt

Two readers sit behind one button, and they have opposite jobs.

`src/import-svg.js` reads a drawing. An SVG is a program, so nothing from the
file is inserted: a third tree is built from a whitelist, and every `href` in
the original is dropped, because a chart is downloaded and passed on and must
not carry a reference to anywhere.

`src/import-image.js` reads a photograph. A raster is not a program and there
is nothing in it to sanitise — the browser's own decoder does the reading. What
needs proving there is the other end: this module **writes** an `href`, the same
attribute the other one drops, so `imageMarkup` refuses anything that is not a
`data:image/png;base64,` URI of the base64 alphabet and nothing else. The bytes
are ones this page encoded from a canvas, not the visitor's file passed through.

The picture is redrawn onto a canvas rather than embedded as it arrived, and
three things fall out of that: the size is bounded, so a twelve-megapixel photo
cannot make a twenty-megabyte chart; the file's metadata is gone, because none
of it survives a canvas; and the format is ours, so the string in the markup has
one shape whatever was opened.

An `<image>` in the chart looks like it should break the download, since
`src/save.js` rasterises the SVG through a canvas and a tainted canvas cannot be
read back. It does not: a `data:` URI is inline rather than external. That was
put to the browser before it was relied on rather than reasoned about.

### The objects are drawn, and stretched to the numbers

Every preset under *Or add something for scale* used to be a rectangle. Most of
them are now a drawing — `vendor/objects/` holds sixteen files and
[`vendor/objects/LICENSE.md`](vendor/objects/LICENSE.md) says where each came
from. Three presets are still rectangles, because nothing free and correctly
proportioned exists for them: the basketball hoop, the shipping container and
the kitchen counter.

Two things about this are worth knowing before changing it.

**An object is stretched and a person is not.** A person keeps the proportions
the artist drew, because nobody types a person's width. An object's proportions
are the two numbers sitting in the row, so the drawing has to answer to them:
`objectShape()` maps the artwork's box onto the unit *square* and `chart.js`
scales the two axes separately, behind a `stretch` flag. A door drawn square
would otherwise be a chart telling somebody their door is square. It also means
the artwork only has to be *roughly* the right shape, which is what made this
possible at all — sixteen drawings whose own aspect happens to match sixteen
real objects do not exist.

**The licence rule is wider here than for the people, and deliberately so.**
The four people are public domain because a chart is downloaded and passed on,
and CC BY would attach a condition to the visitor's own picture. MIT and
Apache-2.0 attach their condition to the *icon set*, which `vendor/objects/`
carries in full, and nothing to a drawing made with it. That distinction is the
whole reason the objects could be drawn: below the level of a silhouetted human
being the public domain has almost nothing, and the alternative was one icon
family and eight rectangles.

**The path data was not copied by hand.** Each file in `vendor/objects/` was
read by this tool's own `src/import-svg.js` — the whitelist an uploaded SVG
goes through — so what ships in `src/objects.js` is shapes and geometry and
nothing else. The artwork this tool ships came in through exactly the door a
stranger's file does.

### An uploaded SVG is rebuilt, not cleaned up

`src/import-svg.js` is the one module here where being wrong is not cosmetic.
An SVG is a program: it can carry `<script>`, an `onload=` on any element, a
`<foreignObject>` holding a whole HTML document, a `<use>` into another file,
an `<image href="https://…">`, and a stylesheet that imports one. Two things
make that sharp here:

- the file is read on the visitor's own machine, so anything executable would
  be executing in their page, with their chart in it;
- **the result is downloaded and sent to other people.** An `<image href>` that
  survived would be a chart phoning a stranger's server, open on somebody
  else's machine, days later. This whole tool is a page-long promise that
  nothing it makes talks to anything.

So nothing from the file is ever inserted. The browser parses it — `DOMParser`
on `image/svg+xml`, which builds an inert document and runs nothing — `main.js`
walks that into plain `{tag, attrs, children}` objects, and `import-svg.js`
**builds a third tree** containing only the elements and attributes on its
whitelist. An attribute does not have to be recognised as dangerous to be
dropped; it is dropped because it was not asked for. That is the only shape of
this job that stays safe when SVG grows a feature next year.

Everything becomes a `<path>`, so what ships is one element with one attribute
rather than six of each. `transform` survives — it is numeric and has nowhere
to put a URL — which is what lets a nested drawing keep its shape without the
coordinates being rewritten. `fill` does not, both because a row's colour is
the chart's to choose and because `fill` can hold `url(#…)`.

`tests/js/compare-heights-import-svg.test.js` is mostly a list of things that
must not come out the other side, one per line, so the policy can be read
without reading the implementation.

### There is no dog, and there was

A dog and a cat were built, in profile, standing with the head level with the
withers — because every breed standard measures an animal at the shoulder, so a
dog drawn alert would be a picture whose tallest point is not the number beside
it. Three attempts in they still read as a hippopotamus and a smudge, and the
larger problem was not the drawing: a quadruped seen from the side, standing in
a row of people seen from the front, reads as a mistake even when it is drawn
well.

They are cut, and the FAQ says so in those words rather than leaving a gap
somebody has to guess about. A rectangle at the animal's shoulder height is the
honest stand-in until there is a drawing worth shipping.

### Heights are parsed, and the reading is shown back

`src/units.js` turns anything a person might type — `173`, `1.73 m`, `5'8"`,
`68 in`, `5 ft 8` — into centimetres, and the row shows what it understood in
both systems. Two cases are genuinely ambiguous and both are resolved by a
rule, written here and repeated on the page:

- a **bare number** is centimetres on a metric chart and inches on an imperial
  one;
- a **bare number under three** is metres, because 1.73 cm is not a height
  anybody types. On an imperial chart the same split is at eight, between feet
  and inches.

`5'14"` is refused rather than carried, because somebody who has not carried
the twelve wants to know.

**Switching units rewrites the boxes rather than reinterpreting them.** That is
the other half of the same rule: `178` means centimetres on a metric chart and
inches on an imperial one, so a switch that left the text alone would silently
turn a person into a four-and-a-half-metre one. `toInput` writes every height
that already parsed back out in the new notation, and the picture does not
move.

### The chart measures its text through a function it is given

`src/chart.js` has no DOM in it. A column has to be as wide as the widest of
three things — the figure, the name over it and the height under that — and
only a browser knows how wide a name is, so `measure` is passed in from
`main.js`, where it is a canvas `measureText` using the same font stack the SVG
declares. That is what keeps every layout decision testable with a ruler that
counts characters, and it is why `tests/js/compare-heights-chart.test.js` can
assert that a long name widens its own column and not its neighbour's.

The ceiling is worth naming too. It is a whole number of gridlines above the
tallest figure, and then far enough above that the tallest figure's own two
lines of label still fit inside the picture. Without that second condition a
chart of two people who happen to be 179 and 180 puts the name of the taller
one off the top, and nothing but looking would tell you.

### One renderer

What is on screen, what the SVG download holds and what the PNG download holds
are the same string of markup — the PNG is that SVG painted onto a canvas at
its own size, in `src/save.js`. A tool with a canvas preview and a separate
download writer has two renderers to keep in step and eventually ships a
picture that disagrees with the one somebody approved.

It also has no external reference in it: no font file, no image, no stylesheet.
That is what lets the rasterisation happen with the network unplugged, and what
keeps the canvas untainted so `toBlob` will give the bytes back.

## Files

| File | What it is |
|---|---|
| `vendor/` | the four public-domain files the people came out of, as published, and their licence |
| `src/traced.js` | those four figures' path data, the box each was measured at, and the transform that puts it in the unit box |
| `src/figures.js` | the list of figures the menu is built from, each one's default height, and the drawing behind an object preset |
| `src/objects.js` | the object artwork: each drawing's path data, its measured box, its digest and its licence |
| `src/import-svg.js` | the whitelist an uploaded SVG is rebuilt from |
| `src/import-image.js` | the bound an uploaded photograph is redrawn to, and the only href the chart may carry |
| `src/units.js` | typed height → centimetres, centimetres → written height, and the ruler's spacing and labels |
| `src/chart.js` | the layout and the SVG, with text measured through a callback |
| `src/save.js` | the SVG blob, the canvas rasterisation, and the download |
| `src/main.js` | the rows and the options |

## What it does not do

- **No shareable link.** Argued above and in the FAQ.
- **Nothing is remembered between visits.** No account, no cookie, nothing in
  this browser's storage. A chart you want to keep is a chart you download,
  which is said on the page rather than discovered.
- **No average-height tables.** A list of national averages is a claim with a
  source and a date behind it, and one that goes stale silently. The objects
  menu is the honest version of the same convenience: twenty sizes, the page
  saying which of them are genuine standards (a 20 ft container, a basketball
  rim, an American interior door) and which are only typical, and every one of
  them editable.
