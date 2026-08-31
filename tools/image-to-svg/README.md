# Image to SVG

Traces a bitmap shape into a single SVG `<path>`. Everything happens in the
visitor's browser, in about seven hundred lines of plain ES modules — no
engine, no wasm, no network step.

## Why this exists at all, given the entry that says it should not

[`docs/what-can-be-built-here.md`](../../docs/what-can-be-built-here.md) ruled
raster-to-vector out, and the reason it gave was right about half the problem:
*"a tracing algorithm, not a conversion: large, and the output disappoints
everyone who expected their photo back as shapes."*

The second half of that still stands and is not going to stop standing. Tracing
a photograph produces thousands of overlapping blobs and a file many times the
size of the JPEG, and it looks worse than the JPEG. That is not an
implementation that needs improving; it is what tracing *is*. So the refusal is
in the tool: past a thousand loops or four hundred kilobytes `main.js` stops
drawing the result and says what happened. The measurements that put the line
there are in "Where the line sits" below.

The first half turned out to be wrong. "Large" assumed a vendored engine, and
none is needed: contour following and curve fitting are arithmetic over an
`ImageData`, the same shape of code as `document-scanner`'s page finder. What
ships is smaller than several tools already here.

Potrace is the well-known program for this and it is **GPL**, so none of it is
ported — this repository is MIT. The algorithm's ideas are published in
Selinger's paper, and the two places `fit.js` follows it are named in that
file: the corner-versus-curve decision and the continuum between them. The
crack following, the least-squares refinement, the per-shape tolerance and the
fitting construction are written here.

## The pipeline

| module | what it does |
|---|---|
| `mask.js` | colour → one bit per pixel. Otsu by default; transparent is never ink |
| `subject.js` | the other way to get those bits: model the background, keep what is not it |
| `contour.js` | walks the cracks between ink and paper, ink always on the right |
| `fit.js` | simplify → refine → curve: the staircase becomes cubics |
| `trace.js` | one `<path>` for the whole picture, collinear runs collapsed |
| `regions.js` | the wand — what a click picks up — and the layer of corrections over the mask |
| `view.js` | the two panes, one zoom, one pan |
| `main.js` | the wiring, and every sentence the page says |

### The outline runs between the pixels, not through them

`contour.js` walks the *cracks* of the pixel grid, so every point has
whole-number coordinates and every step is one unit north, south, east or west.
One rule does the whole walk: keep ink on your right. Outlines come out
clockwise and the holes inside them anticlockwise, which is exactly what SVG's
default nonzero fill wants — a shape with forty holes in it is one element and
no `fill-rule` is set anywhere.

That winding is also why the scan finds every loop in one pass. It starts a
loop at any ink pixel whose neighbour above is paper; an outline's topmost row
has one of those, and so does a hole — the ink pixel below the hole's floor has
paper above it, and that edge belongs to the hole's loop.

### The step that makes it look drawn

`fit.js` simplifies, then **refines**, then curves. The refinement is the part
worth knowing about: each edge of the simplified polygon still has the crack
points it was chosen to stand for, and a least-squares line through those is a
far better estimate of the true edge than the lattice ever was, because the
staircase error is symmetric and averages out. Corners are where two of those
lines meet, known to a fraction of a pixel. Measured against shapes whose
answer is known, a traced circle's radius is within 0.7 px at radius 25 and at
radius 200 alike.

Two thresholds decide corner from curve, and they are an **or**: a vertex is a
corner if it stands far enough off its neighbours' chord *or* if it turns
sharply enough. The first catches corners between long edges, the second
catches sharp points between short ones. Neither alone is enough — with only
the angle rule a five-pointed star traced with nine points, because one vertex
had been split in two by a one-pixel hesitation and each half turned 58°.

The tolerance is per shape, not per picture, and derived from twice the area
over the perimeter — the width of a bar, the radius of a disc. One fixed value
cannot serve a 220-pixel figure and a 2-pixel letter stem; choosing 1.5 for
both is what turned small text into wedges in the first version.

### Finding a subject, when there is no light and dark to divide by

`subject.js` exists because a threshold asks the wrong question of a
photograph. A dark red figure on dark grey stone is dark on dark: Otsu cuts
through the middle of the subject and the result is confetti, and no number
fixes it because no number separates those two things.

So it asks what the *background* is, in five steps, none of them clever:

1. model it from a band round the border — the commonest few colours at five
   bits a channel, so a mottled wall is several entries rather than a failure;
2. measure every pixel against it. On that distance map the subject is the
   bright half whatever it was on the original, and Otsu has two piles to cut
   between. The distance weighs colour more heavily than brightness, which buys
   nothing on an evenly lit ground and a great deal on an unevenly lit one —
   a bright patch the border never saw is, by brightness, as unlike the border
   as the subject is;
3. cut it **twice**. One cut loses every shaded part of the subject that
   happens to be as dark as the wall, and lowering it lets the wall in
   everywhere. So: subject if far from the background, *or* not-quite
   background and joined to something far. Canny's hysteresis on a distance
   map;
4. close small holes with a dilate and an erode of the same radius;
5. fill anything the background cannot reach from the edge of the picture, and
   keep the largest island — "the most prominent object" is a claim about area,
   and a caption in the corner is not it.

Its limits are stated on the page rather than hidden: a background as busy as
the subject, a subject the colour of the wall, an edge that is genuinely a
gradient (smoke, glass, hair), and a photograph cropped so the subject runs off
three sides — which makes the border *subject* and inverts the answer. That
last one has an answer the others do not: turn off *learn the background from
the edges* and click the background a few times instead.

## The corrections layer

`MaskEdits` keeps what the visitor decided separately from what the threshold
decided, as one byte per pixel meaning *let the threshold decide* / *ink* /
*paper*. Three things follow, and all three are the reason it is a layer rather
than paint:

- moving the threshold afterwards does not throw the corrections away;
- undo is one line, because a step stores what it replaced;
- inverting the picture flips every correction with it, so a speck somebody
  deleted stays deleted instead of reappearing as a hole punched in the
  background.

The wand selects **by colour** by default rather than by mask value, and that
distinction is the whole of it. A mask knows two colours, so on it every dark
thing touching every other dark thing is one thing: pointing at a grey shadow
that touches a figure selects the shadow *and the figure*, 7,624 pixels rather
than 1,042. Selecting by joined shape is still offered, because when the loop
coming out wrong is the thing you want, what you select is then exactly what
you would get.

## Staying alive on a big picture

The wand runs on every pointer move and each thing it does is the size of the
picture. Four costs, each of which stopped the tab before it was dealt with:

| what | why it was fatal | what it does now |
|---|---|---|
| the flood fill's stack | `Int32Array(w*h)` per call — 32 MB on 8 MP, several times a second | one buffer in `regions.js`, kept and reused |
| the fill itself | unbounded: point at the sky and it visits every pixel of it | a preview budget of 1.2M pixels; over that it says so |
| outlining the selection | half a picture is hundreds of thousands of boundary points, stroked per frame | dropped past 120k points |
| the traced outline overlay | `new Path2D(out.d)` re-parsed every frame | parsed once per trace |

One flood fill at 4.3 MP is 51 ms budgeted against 381 ms unbounded, and the
preview waits for a pause of 110 ms rather than running per frame. `fit` has a
matching trap: it measures the pane, and a pane not on screen yet measures
zero — falling back to 1× there would size two canvases to a whole photograph
to show something nobody is looking at, so it keeps the zoom it had.

### Where the line sits

The guardrail's numbers come from measurement, not taste. An A4 page of line
art at 300 dpi traces to 3 loops and 6 kB; a page of handwriting to 54 and
147 kB; a photograph of 1.1 MP to 4,006 loops and 1.5 MB. The gap is two orders
of magnitude wide, and 1,200 loops or 400 kB sits inside it.

## Things that would break if changed carelessly

- **`view.js` and `regions.js` must agree with `contour.js` about
  connectivity.** With diagonal joining off, ink is 4-connected and paper is
  8-connected. They have to be opposites: a diagonal pinch that joined in both
  directions at once would leave the labels and the outlines describing
  different shapes.
- **No `./shared/` import may appear in any module but `main.js`.** The build
  copies shared modules into `src/shared/` at build time, a path that does not
  exist in the source tree, and the JavaScript tests import these leaves
  straight off the disk.
- **No sentence a visitor reads belongs in `src/`.** Every one is a
  `data-phrase` in `body.html`, read back with `phrase()`. The modules return
  numbers and shapes; `main.js` does the wording.
