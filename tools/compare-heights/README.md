# Height Comparison Chart

[← all tools](../) · [the page](https://abox.tools/compare-heights/)

A list of people and objects with a height each, drawn side by side on a ruler,
downloadable as a PNG or an SVG. There is no file in and no file out that the
visitor did not ask for, no account, and no network step of any kind. The man,
the woman, the boy and the girl are public-domain artwork that ships with the
page; the toddler and the rectangle are drawn by its own code.

The tool it is modelled on — and the reason people look for one at all — puts
the whole list into the address bar so a chart can be shared by link. This one
does not, and the FAQ says why: the list is names of children and how tall each
of them is, and a link carrying that is a link logged by whatever it travels
through. The answer here is that you download the picture and send that.

## Why it is built the way it is

### Four figures are drawn, one is built

The man, the woman, the boy and the girl are artwork by other people:
`src/traced.js` carries their path data and `vendor/` carries the four files it
came out of, with `vendor/LICENSE.md` naming who drew each one. People drew
those, and it shows — clothes, a pose, hair, the shape of a shoe on a floor.

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

### The toddler is built, and is not a scaled adult

Because there is nothing to put there. Wikimedia Commons has one usable free
child — the girl — and NIH BioArt the boy; below school age the public domain
runs out, and every coherent free family of people is a restroom pictogram
about four and a half heads tall at *every* age. So `src/figures.js` holds a
table of body proportions — where the chin, the shoulder, the waist, the knee
and the ankle sit as fractions of the whole, and how wide the body is at each —
and one routine that walks it into an outline.

That is not a consolation prize; it is the thing most of these charts get
wrong. **A small person is not a scaled-down large one.** A two-year-old is
about four and a half head-heights tall, an eight-year-old six, an adult seven
and a half. Every chart that scales one silhouette therefore draws a toddler
with an adult's head-to-body ratio, which looks wrong in a way most readers
cannot name and all of them can see.

The modelling language is deliberately tiny: a closed polyline where every
vertex carries its own corner radius, in `roundedLoop`. A square corner is
r = 0 — the sole of a foot — and everything else on a body is round. One list
of points goes down the right-hand side and back up the inside of the right
leg, and `mirrored` walks it back up the left, so it is not possible for an
edit to the waist to leave a body lopsided. Nothing is stroked, so the several
overlapping subpaths — head, body-with-legs, two arms — read as one shape.

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
| `src/figures.js` | the proportion table the toddler is built from, and the outline builder that walks it |
| `src/units.js` | typed height → centimetres, centimetres → written height, and the ruler's spacing and labels |
| `src/chart.js` | the layout and the SVG, with text measured through a callback |
| `src/save.js` | the SVG blob, the canvas rasterisation, and the download |
| `src/main.js` | the rows, the options, the live network check |

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
