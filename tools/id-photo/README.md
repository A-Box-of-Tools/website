# ID Photo Maker

Live at **[abox.tools/id-photo/](https://abox.tools/id-photo/)**.

Pick a country and a document, and this crops a photograph to that country's
published rule: the print size in millimetres, the head-height band, the eye
line, the background colour, the DPI floor, and the pixel and file-size limits
its web form enforces. It writes three files — a print, a sheet to cut up, and
an upload — and it does all of it in the browser, on the visitor's own machine.

Nothing is uploaded, which matters more here than on most of these tools: the
file is a photograph of somebody's face, and what they are about to do with it
names the country whose document they are applying for.

---

## What the job actually is

Almost every "passport photo" tool is a crop box with a fixed aspect ratio. That
gets the *shape* right and misses the two things a passport office measures:

1. **How much of the frame the head fills**, chin to crown. Usually 70–80 % of
   the height — but the UK wants 29–34 mm of a 45 mm frame, which is 64–76 %, so
   a photo cropped to the ICAO rule is refused there for having too large a head.
2. **Where the eye line falls**, measured up from the bottom edge.

And then a third thing that is not geometry at all: the file the web form will
accept. Indian examination portals want 200 × 230 pixels and **20–50 KB**. That
is a floor as well as a ceiling, and a floor cannot be met by compressing less
once the encoder has run out of less.

So there are three separate problems here, and each has its own module.

---

## The files

| File | What it holds |
|---|---|
| `src/specs.js` | The rulebook. Every country's published figures, with the authority and the date each was read. |
| `src/detect.js` | Where the four points come from: an outline against the wall, and the dark patches where eyes are. No model. |
| `src/geometry.js` | The arithmetic: four marked points in, one crop rectangle out, and every measurement back again. |
| `src/sheet.js` | The 4 × 6 layout: how many copies fit, where they go, and where the cut marks go. |
| `src/background.js` | Colour and evenness, in CIE Lab. Also the signature check, which is a different question. |
| `src/jpeg.js` | The two byte-level header edits a canvas cannot make: the print resolution, and the padding. |
| `src/encode.js` | Canvas drawing, and the search that lands a file inside a KB band at both ends. |
| `src/cropper.js` | The crop box and the overlay drawn inside it. |
| `src/marks.js` | The four dots on the face: placing them, and dragging them. |
| `src/files.js` | Names, and the sentences the page reads out. |
| `src/main.js` | The wiring, and nothing else. |

`geometry.js`, `sheet.js`, `background.js`, `jpeg.js`, `specs.js` and `files.js`
are pure functions on numbers and byte arrays, which is why
`tests/js/id-photo.test.js` can cover them properly. What is left in the canvas
code is one `drawImage` and one `toBlob`.

---

## Four decisions worth not re-deriving

### The published figure is what is written down

The rulebook stores head height and eye position as **millimetres**, exactly as
the authority publishes them, and derives the fractions the crop arithmetic
needs:

```js
head: mmBand(29, 34, 45),   // 29-34 mm of a 45 mm frame
```

A reader checking that line against gov.uk is comparing two numbers, not doing
arithmetic. A test asserts that the millimetres and the derived fractions still
agree, because a transcription error is the one bug in this tool that no amount
of correct code would catch — and the failure mode is a letter six weeks later,
not an exception.

Every entry also carries `source.authority`, `source.document` and
`source.checked`, and the page prints all three. Governments change these. A
tool that quietly applies a rule from three years ago is worse than one that
admits it is a transcription and says when it was made.

### The four points are found, and there is still no face model

Four points — crown, chin, both pupils — are enough to place the box exactly. A
crop of a fixed shape has two degrees of freedom that matter: how tall it is,
which fixes the head height, and where its top edge sits, which fixes the eye
line. One each.

The first version of this tool asked you to drag all four, and the reason was
never that finding them is hard. It was that finding them the usual way means
shipping a model: weights to download, an inference runtime to run them in, and
a failure mode that is uneven — published detectors are measurably worse on some
faces than on others, and the people whose photographs already get rejected most
often are the ones a bad one lets down. The browser's own `FaceDetector` had a
second problem on top of that: it exists in one browser behind a flag, which is
not a feature, it is a difference in how well the site works depending on what
you opened it in.

`src/detect.js` does it without either, by using something a general detector is
not allowed to assume and this tool is: every specification in `specs.js` demands
the same scene — one person, facing the camera, against a plain evenly-lit wall.

* **the crown** comes from the wall. The colour of the border of the picture is
  read, everything that is not that colour is the person, the highest
  substantial run of it is the head, and the top of that is the crown, hair
  included — which is the point people most often get wrong by hand, because
  they mark the hairline;
* **the eyes** come from contrast inside the face, never from skin colour. What
  is scored is how much darker a patch is than what lies to its left, to its
  right and below it — the *worst* of the three, not their average — so a patch
  twelve units darker than its own surroundings scores twelve on every face
  there is. Two of them are wanted, level with each other and either side of the
  middle of the head, which is what stops a nostril winning; and when a second
  pair is found close below the first, the lower one is taken, because eyebrows
  beat eyes at everything except being where eyes are;
* **the chin** cannot honestly be found this way — a jaw against a neck is a
  soft edge with no colour change across it. It is worked out from the pupils,
  which sit at almost exactly half the height of a head, and then checked
  against the point where the outline falls away into the neck.

### Four things the first real photograph did that no fixture had

Every one of these passed on synthetic faces and failed on a photograph, and
each has a test now because the fixture that would have caught it did not exist.

| What happened | Why | What it needed |
|---|---|---|
| The eye line landed on the **hairline** | The four sides around a patch were averaged into one number, so one bright forehead under a mass of hair outvoted three dark sides. Hair is far darker against skin than an iris is | Score against the *worst* of left, right and below, never their mean |
| **Hair beside a cheek** outscored the eyes | It is a narrow dark band with the wall on one side and a face on the other, which is exactly what an eye looks like locally | An eye is well inside the outline; anything whose neighbourhood strays off the silhouette is not one |
| The eyes were **not found at all** on a white background | The white of an eye is close enough to a pale wall to be cut out of the mask, so both eyes were holes punched through the head and every candidate sat on the edge of one | Fill what the outline encloses: paint inward from the border and keep whatever is left |
| The head came out **twice its real width** | Where a head stops was assumed to be a fraction of the picture. In the photograph this tool asks for — taken a metre and a half away — the shoulders start well inside that fraction, and the widest row was one | Walk down and find the neck: a head narrows, then the shoulders widen again, and that turn is the only honest mark |

The eyes are looked for at three box sizes, the smallest about the size of an
iris. That one is doing most of the work: an eye is not a dark patch, it is a
small dark iris with bright sclera either side, and a box drawn around the whole
opening averages that white back in until the eye is barely darker than a cheek.
It also happens to be the cheapest way to lose an eyebrow, which is a long dark
bar with more of itself to the left and right of any box you put in the middle
of it.

Which is why none of it is final. The page says which of the four it measured
and which it had to work out, refuses outright on a picture with no plain
background rather than inventing an answer, and leaves every dot draggable —
`geometry.js` never learns which were measured, because the crop is taken from
wherever the dots end up. Moving one by hand switches the page to *I'll place
them*, and so does choosing it, which turns the whole thing off.

`tests/js/id-photo-detect.test.js` is where that holds: the same synthetic face
at four skin tones and two hair colours, to one tolerance, plus one fixture for
each row of the table above.

### Colour is measured in Lab, and evenness is measured separately

Two greys forty RGB units apart are hard to tell apart; forty units of blue is a
different colour entirely. A checker built on RGB distance would be confidently
wrong in both directions, which is worse than having no checker. So
`background.js` converts to CIE Lab and reports a plain ΔE.

Evenness is a **second** finding, not part of the first, because almost nobody
submits a photo with a bookcase in it and enormous numbers of people submit one
taken a foot from a white wall with a shadow of their own head on it. Those two
failures have different fixes, and a single "rejected" would send people to
change the wrong thing. A third finding compares the three sides against each
other, which is how side lighting shows up.

What the tool will **not** do is replace a background. That is a segmentation
model, and a bad one eats the hair of exactly the people whose photographs
already get rejected most often. Standing a foot further from the wall fixes
more of these than any filter would, and the page says so.

### The KB floor is met by padding, and the padding says so

`encodeToBand` searches for the highest quality that fits under the ceiling —
the same bisection the image compressor uses, minus the resolution half, because
the pixel size is mandated and there is nothing to spend there.

The floor is the interesting end. A 200 × 230 photograph is 46,000 pixels; at
the best quality a browser will write, that is often 15 KB when the form demands
20. There is no "compress less" left. So `padTo` in `jpeg.js` inserts a **COM
segment full of spaces**.

That is worth stating plainly rather than burying: a comment segment is part of
the JPEG standard and is skipped by every decoder ever written. The picture is
bit-for-bit the same picture; what changes is the length of the file, which is
the number the form is measuring. The padding leads with an English sentence
saying exactly that, so anybody who opens the file in a hex editor finds an
explanation rather than a mystery.

---

## The other thing a canvas will not write: the resolution

`canvas.toBlob` emits a JFIF header with the density units set to `0`, which
means "these two numbers are an aspect ratio, not a resolution". So a
413 × 531 pixel file arrives at a print shop as an image of no particular size,
and their software guesses.

`setDensity` patches five bytes — units to `1`, and both densities to the DPI —
so the same pixels say "I am 35 × 45 mm". Nothing is decoded, no quality is
spent, and it is the difference between a photo that prints at the right size
and one that prints at whatever the shop assumed.

---

## The sheet

A booth charges several pounds for six photographs. A photo counter prints a
6 × 4 for pennies and every one of them will do it. So the useful output of this
tool is not one 35 × 45 image, it is a 4 × 6 with eight of them on it and lines
saying where to cut.

Three rules the layout follows, each learned by cutting one out badly:

- **Nothing is scaled to fit.** Every cell is exactly the specification's size in
  millimetres at the sheet's DPI. A layout that shrank a photo by two per cent to
  fit one more copy on would produce eight photographs that are all the wrong
  size, which is the failure this whole tool exists to prevent.
- **The marks sit in the gaps, never on the picture.** Cutting between two ticks
  is easier than cutting along a line drawn on the thing you are cutting out —
  and a line drawn on the picture is ink you then have to trim off.
- **The paper is tried both ways round.** A 35 × 45 fits eight to a landscape
  6 × 4 and six to a portrait one, so both are laid out and the one holding more
  copies wins.

The margin is 3 mm and the gap is 2 mm, and those two numbers are load-bearing:
at 4 and 3 the same sheet holds six photographs instead of eight.

---

## What is deliberately not here

| Left out | Why |
|---|---|
| Background replacement | A segmentation model. See above. |
| A shipped face model | The four points are found by arithmetic instead. A model would be weights to download and unevenly wrong. See above. |
| Straightening a tilted head | Rotating re-samples the picture, and every specification here asks for a level camera rather than a corrected photograph. The tilt is measured and reported instead. |
| Smile/eyes-open/glasses checks | These are classifiers, not measurements, and a wrong "your eyes are closed" is worse than no check. The guide says what an examiner looks for. |
| A promise that the application will be accepted | No tool can honestly make one. What this does is apply the published figures exactly and show every measurement it made. |

---

## Adding a country

One entry in `SPECS` in `src/specs.js`, and nothing else — the chooser, the
figures panel, the overlay, the crop, the sheet and the file-size search are all
driven from it. The entry needs:

- `print` in millimetres with a DPI floor, or `null` where the rule is only ever
  a web form's rule;
- `head` and `eye` as `mmBand(min, max, frameHeight)` where the authority
  publishes millimetres, or `band(min, max, true)` where it publishes nothing and
  the figures are guidance — the page labels those, and never paints them red;
- a `background` key from `BACKGROUNDS`;
- `digital`, where the form states pixel or file-size limits;
- `notes`, which are shown verbatim, and `source`, which is shown too.

The tests will then check it: that it can be cropped to, that its bands are
bands, and that its millimetres and fractions agree.
