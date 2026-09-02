# QR & Barcode Reader

The other half of [`../qr-barcode/`](../qr-barcode/). That tool turns a string
into a picture; this one turns a picture back into a string.

The two are not the same size of problem. Drawing a QR code is arithmetic with
a known answer: the modules go where the specification says, and nothing can go
wrong that is not a bug. Reading one is a measurement. The symbol is somewhere
in a photograph, at an unknown size, turned an unknown amount, lit unevenly,
possibly out of focus, possibly printed light on dark, and possibly with a
thumb over one corner — and none of that is in the standard, which describes
what a symbol *is* and says nothing about how to find one.

So this folder is two thirds computer vision and one third specification.

## What runs, in order

| File | What it does |
|---|---|
| `binarize.js` | pixels → black and white. A threshold per eight-pixel block, smoothed; plus Otsu for the whole picture, and a blur for a grainy one |
| `detect.js` | black and white → a square of modules. Finds the finder patterns, works out the size, finds the alignment pattern, builds the perspective transform, samples the grid |
| `qr-decode.js` | modules → a string. Format information, mask, zigzag, de-interleaving, then the little language of modes and counts |
| `reed-solomon.js` | repairs the codewords that were misread. Syndromes, Berlekamp-Massey, Chien, Forney |
| `shared/qr-tables.js` | the tables and formulas from ISO/IEC 18004, shared with the writer |
| `linear.js` | the striped barcodes, which need none of the above |
| `payload.js` | what the string *is*: a link, a network, a contact card — and what is worth warning about |
| `scan.js` | the order all of that is tried in |
| `camera.js` | the live camera, and every way it can refuse |
| `main.js` | the page |

## The three decisions worth knowing about

### It never opens anything

A printed QR code is an address nobody can read. That is not a side effect of
the format, it is the whole basis of the scam that is now common enough to have
a name: a sticker over the code on a parking meter, on a restaurant table, on a
parcel card. What makes it work is that by the time you know where the code
went, you are already there.

So nothing here is opened. The decoded string is printed in full, the host it
would actually reach is pulled out onto its own line, and `payload.js` names
the three tricks that make one address look like another — a username before an
`@`, a host written in an alphabet whose letters are shaped like Latin ones,
and a redirect. Opening it is a separate button, pressed after reading it.

The same rule is why a `javascript:` or `intent:` payload gets no link at all,
only its scheme named and a note saying so.

### Every field checks itself, and a failure is reported as a failure

There is no useful middle ground between "read it" and "did not read it". A
reader that hands back a confident wrong string is worse than one that says it
could not manage, because nothing downstream can tell the difference.

So: the format information is BCH-coded and is corrected against the 32 legal
values, refusing a tie; the version information is read as a second opinion and
a disagreement with the sampled size is fatal; every block is Reed-Solomon
corrected and then **re-checked** — `correct()` recomputes the syndromes after
repairing and returns −1 if they are not all zero, because the arithmetic
answers something for a block damaged past repair and what it answers is
plausible rubbish; a character count that runs off the end of the data is a
misread rather than a long string; and on the linear side, a format with no
check digit has to be read identically from two different scan lines before it
counts.

### It shows what it sampled

Under every QR result is a canvas holding the modules that were actually read
off the picture. It is not decoration. It is the one thing that lets somebody
check the answer rather than believe it: if that grid looks like the code they
photographed, the string came from the right pixels.

## Things that took a second attempt

**Run lengths are measured in steps, and a step is not a pixel.** The first
version scored the diagonal cross-check against the row's total, which is
correct only when the symbol is square to the camera — at 15° it rejected every
finder pattern in the picture. The diagonal now has no total check at all, only
a ratio, which is what ZXing does and for this reason.

**A run bounded by exactly its own length never finishes.** `while (dark &&
runs[2] <= middle)` overshoots by one before the loop notices, so a vertical
run exactly as long as the horizontal one that found it was rejected as too
long. It cost every code turned 45° — where the two runs are exactly equal —
and every alignment pattern in the picture. The bounds are now deliberately
loose; what does the discriminating is the ratio test afterwards.

**The module size cannot be measured across a row.** A row scan crosses a
turned symbol at an angle and reads every run as longer than it is, by 40% at
45°. That put the estimated symbol size out by a whole version and made the
search box for the alignment pattern wide enough to find something that was not
one — which then dragged the perspective transform onto a corner that did not
exist, and the sampled grid was noise. `moduleSizeBetween` measures along the
line joining two finder centres instead, which is parallel to the edge of the
symbol however the symbol is turned.

**One arrangement of three finder patterns is not enough.** `rankTriples`
returns the best few rather than the best one, and each is tried, because a
code photographed at a steep angle has one finder visibly smaller than the
others and a triangle that is not much of a right angle. The score is a ranking,
not a verdict; what settles it is trying to read the thing.

## The camera, and the site-wide header it moved

This is the only tool here that asks the browser for anything, and it needed
one change outside its own folder: the site sent `Permissions-Policy: camera=()`
— camera switched off everywhere — and a page cannot ask for a capability its
own site has disabled. It now sends `camera=(self)`. That is this origin only:
no embedded frame gets it, no other capability moved, and every other tool is
unaffected because none of them asks.

The change lives in [`../../_headers`](../../_headers) and, because GitHub Pages
cannot set headers at all, in
[`../../cloudflare/response-headers.json`](../../cloudflare/response-headers.json),
which is the copy that is actually served. **Both have to be applied for the
camera to work in production** — see `cloudflare/README.md`.

A `MediaStream` handed to a `<video>` through `srcObject` is not a fetch, so no
CSP directive governs it and none was widened for it. Frames arrive as pixels
in this tab, are drawn onto a canvas the page owns, are examined, and are
overwritten by the next frame. Nothing is recorded and nothing is kept.

## No English in the modules

`payload.js` returns keys — `field.host`, `warn.shortener` — and never
sentences. The words are in `body.html`, inside `#phrases`, because a tool's
`src/*.js` is one file serving every address this page has, and a sentence
written in JavaScript would be English on all of them but one. `main.js` looks each key
up and fills in `{host}`-style gaps. It is the same argument as the comment at
the top of `templates/partials/feedback.html`.

## What it does not do

- **Data Matrix, PDF417, Aztec, MaxiCode.** Each is a different detector and a
  different decoder; none of them shares anything useful with this one.
- **More than one code per picture.** The camera reads code after code as it
  moves, and several dropped files are read separately, but a single photograph
  of a sheet of codes gives one answer.
- **Resolving a shortened link.** That would mean a network request, and this
  page does not make any. The shortener is named and what it hides is left
  honestly unknown.
- **A code photographed at an extreme angle**, where the far edge is half the
  length of the near one. The finder patterns on the far side are squeezed past
  what the 1:1:3:1:1 test will accept. A straighter photograph fixes it, and no
  amount of arithmetic here will.

## Tests

`tests/js/qr-read.test.js` and `tests/js/barcode-read.test.js`. Both work by
building a symbol with the **generator next door** and reading it back with
this one, which is the only kind of test worth having here: a decoder checked
against its own encoder proves that two halves of one misunderstanding agree.
The pictures are drawn in the test — flat, rotated, warped, inverted, noisy —
rather than checked in as binary fixtures, the same way `tests/js/helpers.js`
builds its images.
